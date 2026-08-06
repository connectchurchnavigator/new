import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ available: false, error: 'Slug is required' }, { status: 400 });
    }

    const sb = createAdminClient();
    const { data } = await sb
      .from('churches')
      .select('id')
      .eq('slug', slug.toLowerCase().trim())
      .maybeSingle();

    return NextResponse.json({ available: !data, slug });
  } catch (err: any) {
    return NextResponse.json({ available: false, error: err.message }, { status: 500 });
  }
}
