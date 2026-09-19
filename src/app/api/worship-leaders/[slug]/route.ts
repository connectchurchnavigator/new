import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const sb = createAdminClient();
    const { data: leader, error } = await sb
      .from('worship_leaders')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !leader) {
      return NextResponse.json({ error: 'Worship leader not found' }, { status: 404 });
    }

    const { data: tags } = await sb
      .from('worship_leader_tags')
      .select('*')
      .eq('worship_leader_id', leader.id);

    return NextResponse.json({ leader: { ...leader, tags: tags || [] } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const data = await req.json();
    const sb = createAdminClient();

    // 1. Fetch the existing worship leader
    const { data: leader, error: fetchErr } = await sb
      .from('worship_leaders')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (fetchErr || !leader) {
      return NextResponse.json({ error: 'Worship leader not found' }, { status: 404 });
    }

    // 2. Helper to upload base64 image if uploaded directly via modal
    const uploadBase64 = async (dataUrl: string, type: string) => {
      if (!dataUrl) return null;
      if (dataUrl.startsWith('http')) return dataUrl;

      const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!match) return dataUrl;

      const mime = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, 'base64');
      const ext = mime.split('/')[1] || 'png';
      const path = `worship-leaders/${leader.id}/${type}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { error: upErr } = await sb.storage.from('church-media').upload(path, buffer, {
        contentType: mime,
        upsert: true,
      });

      if (upErr) {
        console.error(`Media upload failed for ${type}:`, upErr);
        return null;
      }

      const { data: pubData } = sb.storage.from('church-media').getPublicUrl(path);
      return pubData.publicUrl;
    };

    // 3. Process avatar and cover URLs
    let updatedAvatarUrl = leader.avatar_url;
    if (data.avatar_url !== undefined) {
      if (data.avatar_url) {
        updatedAvatarUrl = await uploadBase64(data.avatar_url, 'avatar');
      } else {
        updatedAvatarUrl = null;
      }
    }

    let updatedCovers = leader.cover_photo_urls || [];
    if (data.cover_photo_urls !== undefined && Array.isArray(data.cover_photo_urls)) {
      const processedCovers = await Promise.all(
        data.cover_photo_urls.map((url: string) => uploadBase64(url, 'cover'))
      );
      updatedCovers = processedCovers.filter(Boolean);
    }

    // 4. Update the worship leader profile
    const updatePayload: any = {};
    if (data.display_name !== undefined) updatePayload.display_name = data.display_name.trim();
    if (data.tagline !== undefined) updatePayload.tagline = data.tagline?.trim() || null;
    if (data.city !== undefined) updatePayload.city = data.city?.trim() || null;
    if (data.country !== undefined) updatePayload.country = data.country?.trim() || 'United Kingdom';
    if (data.bio !== undefined) updatePayload.bio = data.bio?.trim() || null;
    if (data.years_leading !== undefined) updatePayload.years_leading = parseInt(data.years_leading) || 0;
    if (data.travel_range !== undefined) updatePayload.travel_range = data.travel_range?.trim() || null;
    if (data.lead_time !== undefined) updatePayload.lead_time = data.lead_time?.trim() || null;
    if (data.song_url !== undefined) updatePayload.song_url = data.song_url?.trim() || null;
    if (data.video_url !== undefined) updatePayload.video_url = data.video_url?.trim() || null;
    if (data.spotify_url !== undefined) updatePayload.spotify_url = data.spotify_url?.trim() || null;
    if (data.youtube_url !== undefined) updatePayload.youtube_url = data.youtube_url?.trim() || null;
    if (data.instagram_url !== undefined) updatePayload.instagram_url = data.instagram_url?.trim() || null;
    
    // Bundle contact and socials into website_url if any are provided
    if (data.website_url !== undefined || data.email !== undefined || data.phone !== undefined ||
        data.facebook_url !== undefined || data.twitter_url !== undefined || 
        data.linkedin_url !== undefined || data.tiktok_url !== undefined) {
      const bundledLinks: string[] = [];
      if (data.email) bundledLinks.push(`mailto:${data.email.trim()}`);
      if (data.phone) bundledLinks.push(`tel:${data.phone.trim()}`);
      if (data.facebook_url) bundledLinks.push(data.facebook_url.trim());
      if (data.twitter_url) bundledLinks.push(data.twitter_url.trim());
      if (data.linkedin_url) bundledLinks.push(data.linkedin_url.trim());
      if (data.tiktok_url) bundledLinks.push(data.tiktok_url.trim());
      if (data.website_url) {
        const existingWebs = data.website_url.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean);
        bundledLinks.push(...existingWebs);
      }
      updatePayload.website_url = bundledLinks.length > 0 ? Array.from(new Set(bundledLinks)).join('\n') : null;
    }
    
    updatePayload.avatar_url = updatedAvatarUrl;
    updatePayload.cover_photo_urls = updatedCovers;

    const { error: updateErr } = await sb
      .from('worship_leaders')
      .update(updatePayload)
      .eq('id', leader.id);

    if (updateErr) {
      throw updateErr;
    }

    // 5. Update tags if provided
    const hasTagUpdates = data.styles !== undefined || data.instruments !== undefined || 
                          data.languages !== undefined || data.available_for !== undefined || 
                          data.fee_model !== undefined;

    if (hasTagUpdates) {
      // Clear existing tags and insert updated ones
      await sb.from('worship_leader_tags').delete().eq('worship_leader_id', leader.id);

      const tagRows = [
        ...(data.styles || []).map((label: string) => ({ worship_leader_id: leader.id, category: 'style', label })),
        ...(data.instruments || []).map((label: string) => ({ worship_leader_id: leader.id, category: 'instrument', label })),
        ...(data.languages || []).map((label: string) => ({ worship_leader_id: leader.id, category: 'language', label })),
        ...(data.available_for || []).map((label: string) => ({ worship_leader_id: leader.id, category: 'available_for', label })),
        ...(data.fee_model || []).map((label: string) => ({ worship_leader_id: leader.id, category: 'fee_model', label })),
      ];

      if (tagRows.length > 0) {
        await sb.from('worship_leader_tags').insert(tagRows);
      }
    }

    return NextResponse.json({ success: true, message: 'Worship leader profile updated successfully' });
  } catch (err: any) {
    console.error('PATCH /api/worship-leaders/[slug] error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update profile' }, { status: 500 });
  }
}
