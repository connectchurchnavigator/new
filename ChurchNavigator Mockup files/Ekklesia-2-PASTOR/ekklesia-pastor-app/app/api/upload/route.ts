import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

/**
 * POST /api/upload
 *
 * Accepts a multipart/form-data upload with a single `file` field
 * plus a `kind` field ("avatar" | "cover" | "gallery") used to
 * namespace the storage path. Returns the public URL to store on
 * the pastor record.
 *
 * Used by the onboarding wizard's Media step before the final
 * POST /api/pastors submission — upload images first, then send
 * the resulting URLs as part of the pastor payload.
 */
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');
  const kind = formData.get('kind');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}. Use JPEG, PNG, WEBP, or GIF.` },
      { status: 415 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'File too large. Max size is 8MB.' }, { status: 413 });
  }

  const folder = typeof kind === 'string' && ['avatar', 'cover', 'gallery'].includes(kind) ? kind : 'misc';
  const extension = file.name.split('.').pop() || 'jpg';
  const filename = `${folder}/${crypto.randomUUID()}.${extension}`;

  const supabase = createAdminClient();
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('pastor-media')
    .upload(filename, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('Upload failed:', uploadError);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from('pastor-media').getPublicUrl(filename);

  return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 201 });
}
