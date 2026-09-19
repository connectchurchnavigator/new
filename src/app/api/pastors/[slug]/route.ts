import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import type { PastorProfile } from '@/lib/pastor';

/**
 * GET /api/pastors/[slug]
 *
 * Returns the full nested profile for one pastor.
 */
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
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
    hostedEventsRes,
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
    supabase
      .from('events')
      .select('*')
      .or(`host_pastor_id.eq.${pastor.id},and(host_type.eq.pastor,host_id.eq.${pastor.id})`)
      .order('starts_at', { ascending: true }),
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

  // Combine pastor_events and events from public.events
  const directEvents = (eventsRes.data ?? []).map((e: any) => ({
    id: e.id,
    pastor_id: e.pastor_id,
    title: e.title,
    event_date: e.event_date,
    location: e.location,
    start_time: e.start_time,
    tags: e.tags || [],
    registration_url: e.registration_url,
    sort_order: e.sort_order || 0
  }));

  const hostedEvents = (hostedEventsRes.data ?? []).map((ev: any, idx: number) => ({
    id: ev.id,
    pastor_id: pastor.id,
    title: ev.title,
    event_date: ev.starts_at || new Date().toISOString(),
    location: [ev.venue_name, ev.city].filter(Boolean).join(', ') || null,
    start_time: ev.starts_at ? new Date(ev.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
    tags: [ev.type, ev.is_free ? 'Free entry' : ev.price_label].filter(Boolean),
    registration_url: ev.slug ? `/events/${ev.slug}` : null,
    sort_order: 100 + idx
  }));

  const combinedEvents = [...directEvents, ...hostedEvents];

  // Parse core values
  let coreValues: string[] = [];
  const rawVision = pastor.vision_statement || '';
  if (rawVision.includes('<!--CORE_VALUES:')) {
    try {
      const match = rawVision.match(/<!--CORE_VALUES:(.*?)-->/);
      if (match && match[1]) {
        coreValues = JSON.parse(match[1]);
      }
    } catch {}
  }
  const cleanVision = rawVision.replace(/<!--CORE_VALUES:.*?-->/g, '').trim();

  const profile: any = {
    ...pastor,
    vision_statement: cleanVision,
    core_values: coreValues,
    languages: (languagesRes.data ?? []).map((r) => r.language),
    tags: tagsRes.data ?? [],
    education: educationRes.data ?? [],
    timeline: timelineRes.data ?? [],
    sermons: sermonsRes.data ?? [],
    events: combinedEvents,
    gallery: galleryRes.data ?? [],
    affiliations: affiliationsRes.data ?? [],
    awards: awardsRes.data ?? [],
    reviews,
    average_rating: averageRating,
  };

  // Fire-and-forget view count increment.
  supabase
    .from('pastors')
    .update({ view_count: (pastor.view_count || 0) + 1 })
    .eq('id', pastor.id)
    .then(({ error }) => {
      if (error) console.error('Failed to increment view_count:', error);
    });

  return NextResponse.json(profile);
}
