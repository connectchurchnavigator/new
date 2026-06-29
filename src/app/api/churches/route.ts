import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { toSlug } from '@/lib/api';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const sb = createAdminClient();

    // 1. Get or create a dummy user to own the org
    const { data: userList } = await sb.auth.admin.listUsers();
    let ownerId = userList.users[0]?.id;
    if (!ownerId) {
      const { data: newUser, error: uErr } = await sb.auth.admin.createUser({
        email: 'onboarding_dummy@example.com',
        password: 'Password123!',
        email_confirm: true
      });
      if (uErr) throw uErr;
      ownerId = newUser.user.id;
    }

    // 2. Create or Update organization (Upsert based on slug)
    const orgName = data.name || data.churchName || 'New Church';
    const orgSlug = toSlug(orgName);
    const { data: org, error: orgErr } = await sb
      .from('organizations')
      .upsert({ name: orgName, slug: orgSlug, owner_id: ownerId }, { onConflict: 'slug' })
      .select().single();
    if (orgErr) throw orgErr;

    // 3. Create or Update Church (Upsert based on slug)
    const churchSlug = orgSlug;
    const { data: church, error: chErr } = await sb
      .from('churches')
      .upsert({
        org_id: org.id,
        name: orgName,
        slug: churchSlug,
        denomination: (data.denomination || '') + (data.establishedYear ? `|||est:${data.establishedYear}` : ''),
        about: data.description || null,
        address_line: data.address || null,
        city: data.city || null,
        country: data.country || null,
        phone: data.phone || null,
        email: data.email || null,
        youtube: (data.youtube || '') + 
                 (data.liveStreamUrl ? `|||live:${data.liveStreamUrl}` : '') +
                 (data.tiktok ? `|||tiktok:${data.tiktok}` : '') +
                 (data.twitter ? `|||twitter:${data.twitter}` : '') +
                 (data.telegram ? `|||telegram:${data.telegram}` : ''),
        instagram: data.instagram || data.socialInstagram || null,
        facebook: data.facebook || data.socialFacebook || null,
        gallery_images: data.galleryImages || [],
        languages: data.languages || [],
        facilities: data.facilities || [],
        ministries: data.ministries || [],
        status: 'published'
      }, { onConflict: 'slug' })
      .select().single();
    if (chErr) throw chErr;

    // 4. Upload images (logo and cover are data URLs)
    const uploadBase64 = async (dataUrl: string, type: string) => {
      if (!dataUrl) return null;
      const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!match) return null;
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

    if (logoUrl || coverUrls.length > 0) {
      await sb.from('churches').update({
        logo_url: logoUrl || undefined,
        cover_url: coverUrls.length > 0 ? coverUrls.join('|||') : undefined
      }).eq('id', church.id);
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

    return NextResponse.json({ success: true, church });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
