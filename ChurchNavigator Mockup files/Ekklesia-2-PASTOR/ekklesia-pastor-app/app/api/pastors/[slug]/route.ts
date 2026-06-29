import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import type { PastorProfile } from '@/types/pastor';

/**
 * GET /api/pastors/[slug]
 *
 * Returns the full nested profile for one pastor: core fields plus
 * languages, tags, education, timeline, sermons, events, gallery,
 * affiliations, awards, and reviews — everything the profile page
 * needs in a single request.
 *
 * Also increments view_count (fire-and-forget, not awaited) so the
 * "X views" badge on the hero reflects real traffic over time.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createAdminClient();
  const { slug } = params;

  const { data: pastor, error: pastorError } = await supabase
    .from('pastors')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (pastorError) {
    console.error('Failed to fetch pastor:', pastorError);
    return NextResponse.json({ error: 'Failed to fetch pastor' }, { status: 500 });
  }

  if (!pastor) {
    return NextResponse.json({ error: 'Pastor not found' }, { status: 404 });
  }

  const [
    languagesRes,
    tagsRes,
    educationRes,
    timelineRes,
    sermonsRes,
    eventsRes,
    galleryRes,
    affiliationsRes,
    awardsRes,
    reviewsRes,
  ] = await Promise.all([
    supabase.from('pastor_languages').select('language').eq('pastor_id', pastor.id),
    supabase.from('pastor_tags').select('*').eq('pastor_id', pastor.id),
    supabase.from('pastor_education').select('*').eq('pastor_id', pastor.id).order('sort_order'),
    supabase.from('pastor_timeline').select('*').eq('pastor_id', pastor.id).order('sort_order'),
    supabase.from('pastor_sermons').select('*').eq('pastor_id', pastor.id).order('sort_order'),
    supabase.from('pastor_events').select('*').eq('pastor_id', pastor.id).order('event_date'),
    supabase.from('pastor_gallery').select('*').eq('pastor_id', pastor.id).order('sort_order'),
    supabase.from('pastor_affiliations').select('*').eq('pastor_id', pastor.id).order('sort_order'),
    supabase.from('pastor_awards').select('*').eq('pastor_id', pastor.id).order('sort_order'),
    supabase.from('pastor_reviews').select('*').eq('pastor_id', pastor.id).order('created_at', { ascending: false }),
  ]);

  const reviews = reviewsRes.data ?? [];
  const averageRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : null;

  const profile: PastorProfile = {
    ...pastor,
    languages: (languagesRes.data ?? []).map((r) => r.language),
    tags: tagsRes.data ?? [],
    education: educationRes.data ?? [],
    timeline: timelineRes.data ?? [],
    sermons: sermonsRes.data ?? [],
    events: eventsRes.data ?? [],
    gallery: galleryRes.data ?? [],
    affiliations: affiliationsRes.data ?? [],
    awards: awardsRes.data ?? [],
    reviews,
    average_rating: averageRating,
  };

  // Fire-and-forget view count increment — don't block the response on it.
  supabase
    .from('pastors')
    .update({ view_count: pastor.view_count + 1 })
    .eq('id', pastor.id)
    .then(({ error }) => {
      if (error) console.error('Failed to increment view_count:', error);
    });

  return NextResponse.json(profile);
}
