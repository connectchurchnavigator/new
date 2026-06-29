import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const data = await req.json();
    const sb = createAdminClient();

    // 1. Fetch the existing church
    const { data: church, error: fetchErr } = await sb
      .from('churches')
      .select('id, logo_url, cover_urls, gallery_images') // Removed live_stream_url
      .eq('slug', slug)
      .single();

    if (fetchErr || !church) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    // 2. Helper to upload base64 image
    const uploadBase64 = async (dataUrl: string, type: string) => {
      // If it's already a URL (e.g. from Supabase or external), just return it
      if (dataUrl.startsWith('http')) return dataUrl;

      const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!match) return dataUrl; // If not base64 and not http, just return it as is (might be a malformed url, but we'll let it pass)

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

    // 3. Process fields
    let updatedLogoUrl = church.logo_url;
    if (data.logo_url !== undefined) {
      if (data.logo_url) {
        updatedLogoUrl = await uploadBase64(data.logo_url, 'logo');
      } else {
        updatedLogoUrl = null;
      }
    }

    let updatedCoverUrls = church.cover_urls || [];
    if (data.cover_urls !== undefined && Array.isArray(data.cover_urls)) {
      const processedCovers = await Promise.all(
        data.cover_urls.map((url: string) => uploadBase64(url, 'cover'))
      );
      updatedCoverUrls = processedCovers.filter(Boolean);
    }

    let updatedGalleryImages = church.gallery_images || [];
    if (data.gallery_images !== undefined && Array.isArray(data.gallery_images)) {
      const processedGallery = await Promise.all(
        data.gallery_images.map((url: string) => uploadBase64(url, 'gallery'))
      );
      updatedGalleryImages = processedGallery.filter(Boolean);
    }

    const updatedLiveStreamUrl = data.live_stream_url !== undefined ? data.live_stream_url : church.live_stream_url;

    // 4. Update the database
    const { error: updateErr } = await sb.from('churches').update({
      logo_url: updatedLogoUrl,
      cover_urls: updatedCoverUrls,
      gallery_images: updatedGalleryImages,
      // live_stream_url: updatedLiveStreamUrl,
    }).eq('id', church.id);

    if (updateErr) {
      throw updateErr;
    }

    return NextResponse.json({ success: true, message: 'Updated successfully' });

  } catch (err: any) {
    console.error('PATCH API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
