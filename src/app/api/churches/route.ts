import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { toSlug } from '@/lib/api';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    const sb = createAdminClient();

    let query = sb.from('churches').select('*').eq('status', 'published').limit(limit);
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    let results = data || [];
    if (results.length < 3) {
      const { data: fallbacks } = await sb.from('churches').select('*').eq('status', 'published').limit(6);
      const existingIds = new Set(results.map((r: any) => r.id));
      const extra = (fallbacks || []).filter((f: any) => !existingIds.has(f.id));
      results = [...results, ...extra].slice(0, 6);
    }

    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const sb = createAdminClient();

    // 1. Get logged in user from cookie session or payload
    let ownerId = data.userId || data.ownerId || data.owner_id;
    if (!ownerId) {
      try {
        const serverSb = await createServerSupabaseClient();
        const { data: authData } = await serverSb.auth.getUser();
        if (authData?.user?.id) {
          ownerId = authData.user.id;
        }
      } catch (e) {
        // Fallback if no auth cookie
      }
    }

    if (!ownerId) {
      const { data: userList } = await sb.auth.admin.listUsers();
      ownerId = userList?.users?.[0]?.id;
      if (!ownerId) {
        const { data: newUser, error: uErr } = await sb.auth.admin.createUser({
          email: 'onboarding_dummy@example.com',
          password: 'Password123!',
          email_confirm: true
        });
        if (uErr) throw uErr;
        ownerId = newUser.user.id;
      }
    }

    // 2. Generate unique slug for new church submission
    const orgName = data.name || data.churchName || 'New Church';
    const baseSlug = toSlug(orgName);
    
    // Ensure slug is completely unique across database (even if user goes back & re-submits)
    let candidateSlug = data.customSlug ? toSlug(data.customSlug) : baseSlug;

    // Check if candidate slug is already taken
    const { data: existingOrg } = await sb
      .from('organizations')
      .select('id')
      .eq('slug', candidateSlug)
      .maybeSingle();

    if (existingOrg) {
      // Auto-append random suffix if candidate is already taken (e.g. from previous submission)
      const randNum = Math.floor(1000 + Math.random() * 9000);
      candidateSlug = `${candidateSlug}-${randNum}`;
    }

    const uniqueSlug = candidateSlug;

    // Create organization
    const { data: org, error: orgErr } = await sb
      .from('organizations')
      .insert({ name: orgName, slug: uniqueSlug, owner_id: ownerId })
      .select().single();
    if (orgErr) throw orgErr;

    // Extract coordinates or fallback geocode from city/country
    let lat = typeof data.latitude === 'number' ? data.latitude : null;
    let lng = typeof data.longitude === 'number' ? data.longitude : null;

    if ((!lat || !lng || (lat === 0.0001 && lng === 0.0001)) && (data.city || data.address)) {
      try {
        const query = [data.address, data.city, data.country].filter(Boolean).join(', ');
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
          { headers: { 'User-Agent': 'ChurchNavigator/1.0' } }
        );
        const geoData = await geoRes.json();
        if (geoData && geoData[0]) {
          lat = parseFloat(geoData[0].lat);
          lng = parseFloat(geoData[0].lon);
        }
      } catch (geoErr) {
        console.warn('Geocoding fallback failed:', geoErr);
      }
    }

    // 3. Create Church with unique slug and coordinates
    const { data: church, error: chErr } = await sb
      .from('churches')
      .insert({
        org_id: org.id,
        name: orgName,
        slug: uniqueSlug,
        denomination: (data.denomination || '') + (data.establishedYear ? `|||est:${data.establishedYear}` : ''),
        about: data.description || null,
        address_line: data.address || null,
        city: data.city || null,
        country: data.country || null,
        latitude: lat,
        longitude: lng,
        phone: data.phone || null,
        email: data.email || null,
        youtube: (data.youtube || '') + 
                 (data.liveStreamUrl ? `|||live:${data.liveStreamUrl}` : '') +
                 (data.tiktok ? `|||tiktok:${data.tiktok}` : '') +
                 (data.twitter ? `|||twitter:${data.twitter}` : '') +
                 (data.telegram ? `|||telegram:${data.telegram}` : ''),
        instagram: data.instagram || data.socialInstagram || null,
        facebook: data.facebook || data.socialFacebook || null,
        gallery: data.galleryImages || data.gallery || [],
        gallery_images: data.galleryImages || data.gallery || [],
        languages: data.languages || [],
        facilities: data.facilities || [],
        ministries: data.ministries || [],
        status: 'published'
      })
      .select().single();
    if (chErr) throw chErr;

    // 4. Upload images (logo, cover, and gallery are data URLs or HTTP links)
    const uploadBase64 = async (dataUrl: string, type: string) => {
      if (!dataUrl) return null;
      if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
        return dataUrl;
      }
      const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!match) return dataUrl;
      const mime = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, 'base64');
      const ext = mime.split('/')[1] || 'png';
      const path = `${church.id}/${type}-${Math.random().toString(36).substring(2,8)}.${ext}`;
      
      const { error: upErr } = await sb.storage.from('church-media').upload(path, buffer, {
        contentType: mime,
        upsert: true
      });
      if (upErr) {
        console.error(`Image upload failed for ${type}`, upErr);
        return null;
      }
      const { data: pubData } = sb.storage.from('church-media').getPublicUrl(path);
      return pubData.publicUrl;
    };

    let logoUrl = null;
    let coverUrls: string[] = [];
    let uploadedGallery: string[] = [];

    if (data.logo) logoUrl = await uploadBase64(data.logo, 'logo');
    if (data.cover) {
      const cUrl = await uploadBase64(data.cover, 'cover');
      if (cUrl) coverUrls.push(cUrl);
    }
    if (data.coverBanners && Array.isArray(data.coverBanners)) {
      for (const b64 of data.coverBanners) {
        const cUrl = await uploadBase64(b64, 'cover');
        if (cUrl) coverUrls.push(cUrl);
      }
    }

    const rawGallery = data.galleryImages || data.gallery || [];
    if (Array.isArray(rawGallery) && rawGallery.length > 0) {
      for (const item of rawGallery) {
        const gUrl = await uploadBase64(item, 'gallery');
        if (gUrl) uploadedGallery.push(gUrl);
      }
    }

    const updates: any = {};
    if (logoUrl) updates.logo_url = logoUrl;
    if (coverUrls.length > 0) updates.cover_url = coverUrls.join('|||');
    if (uploadedGallery.length > 0) {
      updates.gallery = uploadedGallery;
      updates.gallery_images = uploadedGallery;
    }

    if (Object.keys(updates).length > 0) {
      await sb.from('churches').update(updates).eq('id', church.id);
    }

    // 5. Insert Services
    if (data.services && Array.isArray(data.services) && data.services.length > 0) {
      const validServices = data.services.filter((s: any) => s.name);
      if (validServices.length > 0) {
        const srvRows = validServices.map((s: any, i: number) => ({
          church_id: church.id,
          day: s.day,
          name: s.name,
          start_time: s.from || null,
          end_time: s.to || null,
          format: s.format === 'inperson' ? 'In-Person' : s.format === 'online' ? 'Online' : 'Hybrid',
          display_order: i
        }));
        await sb.from('church_services').insert(srvRows);
      }
    }

    // 6. Insert Pastor / Leadership if provided
    const pastorName = data.pastorName || data.pastor_name;
    const pastorPhoto = data.pastorPhoto || data.pastor_photo;
    const pastorBio = data.pastorBio || data.pastor_bio;

    if (pastorName) {
      let pPhotoUrl = null;
      if (pastorPhoto) {
        pPhotoUrl = await uploadBase64(pastorPhoto, 'pastor');
      }
      await sb.from('leaders').insert({
        church_id: church.id,
        name: pastorName,
        role: data.pastorRole || data.pastor_role || null,
        bio: pastorBio || null,
        photo_url: pPhotoUrl,
        is_lead: true,
        display_order: 0
      });
    }

    return NextResponse.json({ success: true, church });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
