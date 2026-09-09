import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { worshipLeaderOnboardingSchema } from '@/lib/validation';
import { slugifyName, withUniqueSuffix } from '@/lib/slug';

/**
 * POST /api/worship-leaders
 *
 * Receives the payload from the worship leader onboarding flow,
 * validates it, generates a unique slug, links it to the logged-in user,
 * and writes the profile and all related tags to the database.
 */
export async function POST(req: NextRequest) {
  const supabaseAuth = await createServerSupabaseClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in to create a profile.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = worshipLeaderOnboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const supabase = createAdminClient();

  // Generate a unique slug, retrying with a random suffix on collision.
  let slug = slugifyName(data.display_name) || 'worship-leader';
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabase
      .from('worship_leaders')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!existing) break;
    slug = withUniqueSuffix(slugifyName(data.display_name) || 'worship-leader');
  }

  // Insert the main worship leader record
  const { data: leader, error: insertError } = await supabase
    .from('worship_leaders')
    .insert({
      slug,
      owner_id: user.id,
      display_name: data.display_name,
      tagline: data.tagline ?? null,
      city: data.city ?? null,
      country: data.country,
      bio: data.bio ?? null,
      years_leading: data.years_leading ?? null,
      travel_range: data.travel_range ?? null,
      lead_time: data.lead_time ?? null,
      avatar_url: data.avatar_url ?? null,
      song_url: data.song_url ?? null,
      video_url: data.video_url ?? null,
      cover_photo_urls: data.cover_photo_urls ?? '{}',
      website_url: data.website_url ?? null,
      instagram_url: data.instagram_url ?? null,
      youtube_url: data.youtube_url ?? null,
      spotify_url: data.spotify_url ?? null,
      is_verified: false,
      is_published: true,
    })
    .select('id, slug')
    .single();

  if (insertError || !leader) {
    console.error('Failed to insert worship leader:', insertError);
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }

  // Insert the related tags (styles, instruments, languages, available_for, fee_model)
  const childWrites: PromiseLike<unknown>[] = [];

  const tagRows = [
    ...(data.styles || []).map((label: string) => ({ worship_leader_id: leader.id, category: 'style', label })),
    ...(data.instruments || []).map((label: string) => ({ worship_leader_id: leader.id, category: 'instrument', label })),
    ...(data.languages || []).map((label: string) => ({ worship_leader_id: leader.id, category: 'language', label })),
    ...(data.available_for || []).map((label: string) => ({ worship_leader_id: leader.id, category: 'available_for', label })),
    ...(data.fee_model || []).map((label: string) => ({ worship_leader_id: leader.id, category: 'fee_model', label })),
  ];

  if (tagRows.length > 0) {
    childWrites.push(supabase.from('worship_leader_tags').insert(tagRows));
  }

  const results = await Promise.allSettled(childWrites);
  results.forEach((r) => {
    if (r.status === 'rejected') console.error('Child write failed:', r.reason);
  });

  return NextResponse.json({ id: leader.id, slug: leader.slug }, { status: 201 });
}
