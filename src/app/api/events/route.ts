import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { slugifyName, withUniqueSuffix } from '@/lib/slug';

export async function POST(req: NextRequest) {
  try {
    const supabaseAuth = await createServerSupabaseClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const {
      title,
      type,
      custom_type,
      host_type,
      host_id,
      custom_host_name,
      venue_name,
      address,
      city,
      postcode,
      latitude,
      longitude,
      starts_at,
      ends_at,
      livestream_url,
      description,
      mode,
      capacity,
      cover_url,
      gallery_urls,
      has_free_parking,
      near_metro_station,
      near_bus_station,
      step_free_access,
      creche_available,
      sessions,
      speakers,
      tickets,
      faqs,
    } = body;

    const supabase = createAdminClient();

    const existingId = body.id || body.eventId;
    let event: any;
    let eventId: string;

    const baseTitle = title || 'Christian Event';
    const host_church_id = host_type === 'church' ? host_id : null;
    const host_pastor_id = host_type === 'pastor' ? host_id : null;

    // Calculate price label
    let price_label = 'Free';
    let is_free = true;
    if (tickets && Array.isArray(tickets) && tickets.length > 0) {
      const numericPrices = tickets
        .map((t: any) => Number(t.price) || 0)
        .filter((p: number) => !isNaN(p));
      if (numericPrices.length > 0) {
        const minPrice = Math.min(...numericPrices);
        if (minPrice > 0) {
          is_free = false;
          price_label = `£${minPrice}`;
        } else {
          price_label = 'Free RSVP';
        }
      }
    }

    const payload = {
      title: baseTitle,
      type: type === 'Others' ? 'Other' : (type || 'Conference'),
      custom_type: type === 'Others' ? custom_type : null,
      description: description || null,
      host_church_id,
      host_pastor_id,
      custom_host_name: host_type === 'individual' ? custom_host_name : null,
      starts_at: starts_at || new Date().toISOString(),
      ends_at: ends_at || null,
      venue_name: venue_name || null,
      address: address || null,
      city: city || null,
      postcode: postcode || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      cover_url: cover_url || null,
      gallery_urls: gallery_urls || [],
      is_free,
      price_label,
      capacity: capacity ? Number(capacity) : null,
      mode: mode || 'Offline',
      is_hybrid: mode === 'Hybrid',
      livestream_url: livestream_url || null,
      has_free_parking: Boolean(has_free_parking),
      near_metro_station: Boolean(near_metro_station),
      near_bus_station: Boolean(near_bus_station),
      step_free_access: Boolean(step_free_access),
      creche_available: Boolean(creche_available),
      status: 'published',
      ...(user?.id ? { created_by: user.id } : {})
    };

    if (existingId) {
      const { data: updatedEvent, error: updateError } = await supabase
        .from('events')
        .update(payload)
        .eq('id', existingId)
        .select()
        .single();

      if (updateError || !updatedEvent) {
        console.error('Error updating event:', updateError);
        return NextResponse.json({ error: updateError?.message || 'Failed to update event' }, { status: 500 });
      }
      event = updatedEvent;
      eventId = updatedEvent.id;

      // Clean old child tables for update
      await supabase.from('event_sessions').delete().eq('event_id', eventId);
      await supabase.from('event_speakers').delete().eq('event_id', eventId);
      await supabase.from('event_tickets').delete().eq('event_id', eventId);
      await supabase.from('event_faqs').delete().eq('event_id', eventId);
    } else {
      // Determine unique slug for new event
      let slug = slugifyName(baseTitle) || 'event';
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data: existing } = await supabase
          .from('events')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();
        if (!existing) break;
        slug = withUniqueSuffix(slugifyName(baseTitle) || 'event');
      }

      const { data: insertedEvent, error: insertError } = await supabase
        .from('events')
        .insert({ slug, ...payload })
        .select()
        .single();

      if (insertError || !insertedEvent) {
        console.error('Error inserting event:', insertError);
        return NextResponse.json({ error: insertError?.message || 'Failed to create event' }, { status: 500 });
      }
      event = insertedEvent;
      eventId = insertedEvent.id;
    }

    // Insert sessions / schedule
    if (sessions && Array.isArray(sessions) && sessions.length > 0) {
      const sessionRows = sessions.map((s: any, idx: number) => ({
        event_id: eventId,
        time_label: s.time_label || '10:00',
        title: s.title || 'Session',
        description: s.description || null,
        speaker_name: s.speaker_name || null,
        sort_order: idx
      }));
      await supabase.from('event_sessions').insert(sessionRows);
    }

    // Insert speakers
    if (speakers && Array.isArray(speakers) && speakers.length > 0) {
      const speakerRows = speakers.map((sp: any, idx: number) => ({
        event_id: eventId,
        name: sp.name || 'Guest Speaker',
        role: sp.role || sp.designation || null,
        designation: sp.designation || null,
        affiliation: sp.affiliation || null,
        photo_url: sp.photo_url || null,
        sort_order: idx
      }));
      await supabase.from('event_speakers').insert(speakerRows);
    }

    // Insert tickets
    if (tickets && Array.isArray(tickets) && tickets.length > 0) {
      const ticketRows = tickets
        .filter((t: any) => Boolean(t.name?.trim() || t.price || t.capacity))
        .map((t: any, idx: number) => ({
          event_id: eventId,
          name: t.name?.trim() || 'General Admission',
          description: t.description || t.subtext || null,
          price_pence: Math.round((parseFloat(t.price) || 0) * 100),
          quantity: (t.capacity !== undefined && t.capacity !== '' && !isNaN(Number(t.capacity)))
            ? Number(t.capacity)
            : (t.quantity !== undefined && t.quantity !== '' && !isNaN(Number(t.quantity)) ? Number(t.quantity) : null),
          booking_url: t.booking_url || t.bookingUrl || null,
          sort_order: idx
        }));
      if (ticketRows.length > 0) {
        await supabase.from('event_tickets').insert(ticketRows);
      }
    }

    // Insert FAQs
    if (faqs && Array.isArray(faqs) && faqs.length > 0) {
      const faqRows = faqs.map((f: any, idx: number) => ({
        event_id: eventId,
        question: f.question,
        answer: f.answer,
        sort_order: idx
      }));
      await supabase.from('event_faqs').insert(faqRows);
    }

    return NextResponse.json({
      success: true,
      event_id: eventId,
      slug: event.slug
    });
  } catch (error) {
    console.error('Error creating/updating event:', error);
    return NextResponse.json({ error: 'Server error creating/updating event' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    const supabase = createAdminClient();

    if (id) {
      const { data: event, error } = await supabase
        .from('events')
        .select(`
          *,
          host_church:churches(id, name, slug, city, logo_url),
          host_pastor:pastors(id, full_name, slug, city, avatar_url),
          event_sessions(*),
          event_speakers(*),
          event_tickets(*),
          event_faqs(*)
        `)
        .eq('id', id)
        .single();

      if (error || !event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json({ event });
    }

    if (slug) {
      const { data: event, error } = await supabase
        .from('events')
        .select(`
          *,
          host_church:churches(id, name, slug, city, logo_url),
          host_pastor:pastors(id, full_name, slug, city, avatar_url),
          event_sessions(*),
          event_speakers(*),
          event_tickets(*),
          event_faqs(*)
        `)
        .eq('slug', slug)
        .single();

      if (error || !event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json({ event });
    }

    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        host_church:churches(id, name, slug, logo_url),
        host_pastor:pastors(id, full_name, slug, avatar_url)
      `)
      .order('starts_at', { ascending: true })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
