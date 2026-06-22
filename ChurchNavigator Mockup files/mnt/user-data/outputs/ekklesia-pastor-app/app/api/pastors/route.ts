import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { pastorOnboardingSchema } from '@/lib/validation';
import { slugifyName, deriveInitials, withUniqueSuffix } from '@/lib/slug';

/**
 * POST /api/pastors
 *
 * Receives the full payload from the onboarding wizard's final step,
 * validates it, generates a unique slug, and writes the pastor plus
 * all related child rows (languages, tags) in one go.
 *
 * The pastor is created with is_published = true immediately in this
 * version (no manual review queue) — flip the insert below to `false`
 * if you want an admin approval step before profiles go live.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = pastorOnboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const supabase = createAdminClient();

  // Generate a unique slug, retrying with a random suffix on collision.
  let slug = slugifyName(data.full_name) || 'pastor';
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabase
      .from('pastors')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!existing) break;
    slug = withUniqueSuffix(slugifyName(data.full_name) || 'pastor');
  }

  const { data: pastor, error: insertError } = await supabase
    .from('pastors')
    .insert({
      slug,
      full_name: data.full_name,
      title: data.title ?? null,
      initials: deriveInitials(data.full_name),
      avatar_url: data.avatar_url ?? null,
      cover_photo_urls: data.cover_photo_urls,

      church_id: data.church_id ?? null,
      church_name_cache: data.church_name_cache ?? null,

      city: data.city ?? null,
      country: data.country,

      bio: data.bio ?? null,
      vision_statement: data.vision_statement ?? null,
      years_in_ministry: data.years_in_ministry ?? null,
      churches_planted: data.churches_planted ?? null,
      nations_reached: data.nations_reached ?? null,

      phone: data.phone ?? null,
      email: data.email ?? null,
      website_url: data.website_url ?? null,
      facebook_url: data.facebook_url ?? null,
      instagram_url: data.instagram_url ?? null,
      youtube_url: data.youtube_url ?? null,
      twitter_url: data.twitter_url ?? null,
      whatsapp_url: data.whatsapp_url ?? null,

      travel_range: data.travel_range ?? null,
      lead_time: data.lead_time ?? null,
      availability_status: data.availability_status,
      availability_note: data.availability_note ?? null,

      is_verified: false,
      is_published: true,
    })
    .select('id, slug')
    .single();

  if (insertError || !pastor) {
    console.error('Failed to insert pastor:', insertError);
    return NextResponse.json({ error: 'Failed to create pastor profile' }, { status: 500 });
  }

  // Write child rows. These are best-effort: if one fails we still
  // return success for the core profile, but log it so it's visible
  // in server logs / your hosting provider's dashboard.
  const childWrites: PromiseLike<unknown>[] = [];

  if (data.languages.length > 0) {
    childWrites.push(
      supabase
        .from('pastor_languages')
        .insert(data.languages.map((language) => ({ pastor_id: pastor.id, language })))
    );
  }

  const tagRows = [
    ...data.preaching_tags.map((label) => ({ pastor_id: pastor.id, category: 'preaching' as const, label })),
    ...data.ministry_area_tags.map((label) => ({ pastor_id: pastor.id, category: 'ministry_area' as const, label })),
    ...data.available_for_tags.map((label) => ({ pastor_id: pastor.id, category: 'available_for' as const, label })),
  ];
  if (tagRows.length > 0) {
    childWrites.push(supabase.from('pastor_tags').insert(tagRows));
  }

  const results = await Promise.allSettled(childWrites.map((w) => Promise.resolve(w)));
  results.forEach((r) => {
    if (r.status === 'rejected') console.error('Child write failed:', r.reason);
  });

  return NextResponse.json({ id: pastor.id, slug: pastor.slug }, { status: 201 });
}

/**
 * GET /api/pastors
 *
 * Lists published pastors. Supports basic filtering for a future
 * directory/search page.
 *
 * Query params:
 *   city      - exact match, case-insensitive
 *   language  - pastors who speak this language
 *   limit     - default 20, max 50
 *   offset    - default 0
 */
export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);

  const city = searchParams.get('city');
  const language = searchParams.get('language');
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);
  const offset = Number(searchParams.get('offset')) || 0;

  let query = supabase
    .from('pastors')
    .select('id, slug, full_name, title, initials, avatar_url, city, country, availability_status, is_verified', { count: 'exact' })
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (city) query = query.ilike('city', `%${city}%`);

  if (language) {
    const { data: matchingIds } = await supabase
      .from('pastor_languages')
      .select('pastor_id')
      .ilike('language', `%${language}%`);
    const ids = (matchingIds ?? []).map((r) => r.pastor_id);
    if (ids.length === 0) {
      return NextResponse.json({ pastors: [], total: 0 });
    }
    query = query.in('id', ids);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Failed to list pastors:', error);
    return NextResponse.json({ error: 'Failed to fetch pastors' }, { status: 500 });
  }

  return NextResponse.json({ pastors: data, total: count ?? 0 });
}
