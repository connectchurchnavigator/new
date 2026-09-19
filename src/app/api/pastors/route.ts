import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { pastorOnboardingSchema } from '@/lib/validation';
import { slugifyName, deriveInitials, withUniqueSuffix } from '@/lib/slug';

/**
 * POST /api/pastors
 *
 * Receives the full payload from the onboarding wizard's final step,
 * validates it, generates a unique slug, links it to the logged-in user (owner_id),
 * and writes the pastor plus all related child rows (languages, tags) in one go.
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

  const parsed = pastorOnboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = body as any;
  const supabase = createAdminClient();

  // If edit_slug is provided, check if the record exists to update it
  let existingPastor: any = null;
  if (data.edit_slug) {
    const { data: found } = await supabase
      .from('pastors')
      .select('id, slug')
      .eq('slug', data.edit_slug)
      .maybeSingle();
    existingPastor = found;
  }

  // Generate a unique slug, retrying with a random suffix on collision if creating.
  let slug = existingPastor?.slug || slugifyName(data.full_name) || 'pastor';
  if (!existingPastor) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: existing } = await supabase
        .from('pastors')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (!existing) break;
      slug = withUniqueSuffix(slugifyName(data.full_name) || 'pastor');
    }
  }

  const baseInsert = {
    slug,
    owner_id: user.id,
    full_name: data.full_name,
    title: data.title ?? null,
    initials: deriveInitials(data.full_name),
    avatar_url: data.avatar_url ?? null,
    cover_photo_urls: data.cover_photo_urls || [],

      church_id: data.church_id ?? null,
      church_name_cache: data.church_name_cache ?? null,

      city: data.city ?? null,
      country: data.country,

      bio: data.bio ?? null,
      vision_statement: (() => {
        let stmt = data.vision_statement || '';
        if (Array.isArray(data.core_values) && data.core_values.length > 0) {
          stmt = `${stmt.trim()} <!--CORE_VALUES:${JSON.stringify(data.core_values)}-->`;
        }
        return stmt || null;
      })(),
      years_in_ministry: data.years_in_ministry ?? null,
      churches_planted: data.churches_planted ?? null,
      nations_reached: data.nations_reached ?? null,
      events_spoken: data.events_spoken ?? null,

      phone: data.phone ?? null,
      email: data.email ?? null,
      website_url: data.website_url ?? null,
      facebook_url: data.facebook_url ?? null,
      instagram_url: data.instagram_url ?? null,
      youtube_url: data.youtube_url ?? null,
      twitter_url: data.twitter_url ?? null,
      whatsapp_url: data.whatsapp_url ?? null,
      linkedin_url: data.linkedin_url ?? null,
      tiktok_url: data.tiktok_url ?? null,

      travel_range: data.travel_range ?? null,
      lead_time: data.lead_time ?? null,
      availability_status: data.availability_status || 'available',
      availability_note: data.availability_note ?? null,

      is_verified: false,
      is_published: true,
    };

    let pastor: any = null;

    if (existingPastor) {
      // Update existing record
      let { data: updatedPastor, error: updateError } = await supabase
        .from('pastors')
        .update({
          ...baseInsert,
          congregation_size: data.congregation_size ?? null,
        })
        .eq('id', existingPastor.id)
        .select('id, slug')
        .single();

      if (updateError && (updateError.code === 'PGRST204' || updateError.message?.includes('congregation_size'))) {
        const fallback = await supabase
          .from('pastors')
          .update(baseInsert)
          .eq('id', existingPastor.id)
          .select('id, slug')
          .single();
        updatedPastor = fallback.data;
        updateError = fallback.error;
      }

      if (updateError || !updatedPastor) {
        console.error('Failed to update pastor:', updateError);
        return NextResponse.json({ error: updateError?.message || 'Failed to update pastor profile' }, { status: 500 });
      }

      pastor = updatedPastor;

      // Clean up previous child entries before rewriting
      await Promise.allSettled([
        supabase.from('pastor_languages').delete().eq('pastor_id', pastor.id),
        supabase.from('pastor_tags').delete().eq('pastor_id', pastor.id),
        supabase.from('pastor_sermons').delete().eq('pastor_id', pastor.id),
        supabase.from('pastor_education').delete().eq('pastor_id', pastor.id),
        supabase.from('pastor_awards').delete().eq('pastor_id', pastor.id),
        supabase.from('pastor_timeline').delete().eq('pastor_id', pastor.id),
        supabase.from('pastor_affiliations').delete().eq('pastor_id', pastor.id),
        supabase.from('pastor_gallery').delete().eq('pastor_id', pastor.id),
      ]);
    } else {
      // Insert new record
      let { data: insertedPastor, error: insertError } = await supabase
        .from('pastors')
        .insert({
          ...baseInsert,
          congregation_size: data.congregation_size ?? null,
        })
        .select('id, slug')
        .single();

      if (insertError && (insertError.code === 'PGRST204' || insertError.message?.includes('congregation_size'))) {
        console.warn('congregation_size column not present in database table, retrying insert without it...');
        const fallback = await supabase
          .from('pastors')
          .insert(baseInsert)
          .select('id, slug')
          .single();
        insertedPastor = fallback.data;
        insertError = fallback.error;
      }

      pastor = insertedPastor;

      if (insertError || !pastor) {
        console.error('Failed to insert pastor:', insertError);
        return NextResponse.json({ error: insertError?.message || 'Failed to create pastor profile' }, { status: 500 });
      }
    }

  // Write child rows.
  const childWrites: PromiseLike<unknown>[] = [];

  if (Array.isArray(data.languages) && data.languages.length > 0) {
    childWrites.push(
      supabase
        .from('pastor_languages')
        .insert(data.languages.map((language: string) => ({ pastor_id: pastor.id, language })))
    );
  }

  const preachingTags = Array.isArray(data.preaching_tags) ? data.preaching_tags : [];
  const ministryAreaTags = Array.isArray(data.ministry_area_tags) ? data.ministry_area_tags : [];
  const availableForTags = Array.isArray(data.available_for_tags) ? data.available_for_tags : [];

  const tagRows = [
    ...preachingTags.map((label: string) => ({ pastor_id: pastor.id, category: 'preaching' as const, label })),
    ...ministryAreaTags.map((label: string) => ({ pastor_id: pastor.id, category: 'ministry_area' as const, label })),
    ...availableForTags.map((label: string) => ({ pastor_id: pastor.id, category: 'available_for' as const, label })),
  ];
  if (tagRows.length > 0) {
    childWrites.push(supabase.from('pastor_tags').insert(tagRows));
  }

  // Save Sermons from sermon_items or fallback to sermon_links
  if (Array.isArray(data.sermon_items) && data.sermon_items.filter((s: any) => s.link || s.title).length > 0) {
    const sermonRows = data.sermon_items
      .filter((s: any) => s.link || s.title)
      .map((s: any, idx: number) => ({
        pastor_id: pastor.id,
        title: s.title?.trim() || `Message ${idx + 1}`,
        series: s.description?.trim() || null,
        youtube_url: s.link?.trim() || null,
        sort_order: idx + 1,
      }));
    childWrites.push(supabase.from('pastor_sermons').insert(sermonRows));
  } else if (Array.isArray(data.sermon_links) && data.sermon_links.filter(Boolean).length > 0) {
    const sermonRows = data.sermon_links.filter(Boolean).map((link: string, idx: number) => ({
      pastor_id: pastor.id,
      title: `Message ${idx + 1}`,
      youtube_url: link,
      sort_order: idx + 1,
    }));
    childWrites.push(supabase.from('pastor_sermons').insert(sermonRows));
  }

  // Save Education from education_items or education_tags
  if (Array.isArray(data.education_items) && data.education_items.filter((e: any) => e.degree || e.university).length > 0) {
    const eduRows = data.education_items.filter((e: any) => e.degree || e.university).map((e: any, idx: number) => ({
      pastor_id: pastor.id,
      degree: e.degree || 'Degree / Qualification',
      institution: e.university || 'University',
      sort_order: idx + 1,
    }));
    childWrites.push(supabase.from('pastor_education').insert(eduRows));
  }

  // Save Awards from award_items
  if (Array.isArray(data.award_items) && data.award_items.filter((a: any) => a.title).length > 0) {
    const awardRows = data.award_items.filter((a: any) => a.title).map((a: any, idx: number) => ({
      pastor_id: pastor.id,
      title: a.title,
      issuer: [a.issuer, a.year].filter(Boolean).join(' · '),
      sort_order: idx + 1,
    }));
    childWrites.push(supabase.from('pastor_awards').insert(awardRows));
  }

  // Save Ministry Journey Timeline from timeline_items
  if (Array.isArray(data.timeline_items) && data.timeline_items.filter((t: any) => t.title || t.year).length > 0) {
    const timelineRows = data.timeline_items.filter((t: any) => t.title || t.year).map((t: any, idx: number) => ({
      pastor_id: pastor.id,
      year: t.year || '',
      title: t.title || '',
      description: t.description || null,
      sort_order: idx + 1,
    }));
    childWrites.push(supabase.from('pastor_timeline').insert(timelineRows));
  }

  // Save Ministerial Affiliations from affiliation_items
  if (Array.isArray(data.affiliation_items) && data.affiliation_items.filter((a: any) => a.organisation).length > 0) {
    const affiliationRows = data.affiliation_items.filter((a: any) => a.organisation).map((a: any, idx: number) => ({
      pastor_id: pastor.id,
      organisation: a.organisation,
      role: a.role || null,
      sort_order: idx + 1,
    }));
    childWrites.push(supabase.from('pastor_affiliations').insert(affiliationRows));
  }

  // Save Gallery photos
  if (Array.isArray(data.gallery_photo_urls) && data.gallery_photo_urls.filter(Boolean).length > 0) {
    const galleryRows = data.gallery_photo_urls.filter(Boolean).map((url: string, idx: number) => ({
      pastor_id: pastor.id,
      image_url: url,
      sort_order: idx + 1,
    }));
    childWrites.push(supabase.from('pastor_gallery').insert(galleryRows));
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
 * Lists published pastors. Supports basic filtering.
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
