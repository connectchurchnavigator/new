import type { SupabaseClient } from '@supabase/supabase-js';
import type { EventCard, EventFull, EventType } from './events-types';

// Host columns selected for cards/detail (links back to church + pastor pages)
const HOST_SELECT = `
  church:churches!events_host_church_id_fkey ( id, slug, name, city, denomination ),
  pastor:pastors!events_host_pastor_id_fkey ( id, slug, full_name, title, city )
`;

function toSlug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

// ---------- discovery ----------
export async function searchEvents(
  sb: SupabaseClient,
  opts: { q?: string; city?: string; type?: EventType | 'All'; when?: 'week' | 'month' | 'quarter'; limit?: number; offset?: number } = {},
): Promise<EventCard[]> {
  let query = sb
    .from('events')
    .select(`*, ${HOST_SELECT}`)
    .eq('status', 'published')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .range(opts.offset ?? 0, (opts.offset ?? 0) + (opts.limit ?? 24) - 1);

  if (opts.q) query = query.textSearch('title', opts.q, { type: 'websearch', config: 'english' });
  if (opts.city) query = query.ilike('city', `%${opts.city}%`);
  if (opts.type && opts.type !== 'All') query = query.eq('type', opts.type);
  if (opts.when) {
    const end = new Date();
    end.setDate(end.getDate() + (opts.when === 'week' ? 7 : opts.when === 'month' ? 31 : 92));
    query = query.lte('starts_at', end.toISOString());
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as EventCard[];
}

// ---------- single event (rich detail) ----------
export async function getEventBySlug(sb: SupabaseClient, slug: string): Promise<EventFull | null> {
  const { data: ev, error } = await sb
    .from('events')
    .select(`*, ${HOST_SELECT}`)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  if (!ev) return null;

  const [{ data: sessions }, { data: speakers }, { data: tickets }, { count }] = await Promise.all([
    sb.from('event_sessions').select('*').eq('event_id', ev.id).order('sort_order'),
    sb.from('event_speakers').select('*').eq('event_id', ev.id).order('sort_order'),
    sb.from('event_tickets').select('*').eq('event_id', ev.id).order('sort_order'),
    sb.from('event_registrations').select('id', { count: 'exact', head: true }).eq('event_id', ev.id).neq('status', 'cancelled'),
  ]);

  return {
    ...(ev as any),
    sessions: sessions ?? [],
    speakers: speakers ?? [],
    tickets: tickets ?? [],
    registration_count: count ?? 0,
  } as EventFull;
}

// ---------- events on a church page ----------
export async function getEventsForChurch(sb: SupabaseClient, churchId: string, limit = 6): Promise<EventCard[]> {
  const { data, error } = await sb
    .from('events')
    .select(`*, ${HOST_SELECT}`)
    .eq('host_church_id', churchId)
    .eq('status', 'published')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as EventCard[];
}

// ---------- events on a pastor profile ----------
export async function getEventsForPastor(sb: SupabaseClient, pastorId: string, limit = 6): Promise<EventCard[]> {
  const { data, error } = await sb
    .from('events')
    .select(`*, ${HOST_SELECT}`)
    .eq('host_pastor_id', pastorId)
    .eq('status', 'published')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as EventCard[];
}

// ---------- create ----------
export async function createEvent(
  sb: SupabaseClient,
  userId: string,
  input: {
    title: string; type: EventType; description?: string;
    host_church_id?: string | null; host_pastor_id?: string | null;
    starts_at: string; ends_at?: string | null;
    venue_name?: string; address?: string; city?: string;
    is_free?: boolean; price_label?: string; capacity?: number;
    is_hybrid?: boolean; livestream_url?: string;
    cover_gradient?: string; tags?: string[]; status?: 'draft' | 'published';
  },
) {
  const slug = `${toSlug(input.title)}-${Math.random().toString(36).slice(2, 7)}`;
  const { data, error } = await sb
    .from('events')
    .insert({ ...input, slug, created_by: userId, status: input.status ?? 'draft' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------- register (RSVP / ticket) ----------
export async function registerForEvent(
  sb: SupabaseClient,
  input: { event_id: string; name: string; email: string; ticket_id?: string | null; party_size?: number; source?: string; user_id?: string | null },
) {
  const { data, error } = await sb.from('event_registrations').insert(input).select().single();
  if (error) throw error;
  return data; // trigger fills is_new_visitor
}

// ---------- insights (visitor tracking) ----------
export async function getEventInsights(sb: SupabaseClient, eventId: string) {
  const { data: regs, error } = await sb
    .from('event_registrations')
    .select('id, status, is_new_visitor, source, created_at, name, email')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const rows = regs ?? [];
  const total = rows.length;
  const checkedIn = rows.filter((r) => r.status === 'checked_in').length;
  const newVisitors = rows.filter((r) => r.is_new_visitor).length;
  const sources: Record<string, number> = {};
  rows.forEach((r) => { const s = r.source ?? 'direct'; sources[s] = (sources[s] ?? 0) + 1; });
  return {
    registrations: total,
    checkedIn,
    newVisitorPct: total ? Math.round((newVisitors / total) * 100) : 0,
    returningPct: total ? 100 - Math.round((newVisitors / total) * 100) : 0,
    sources,
    recent: rows.slice(0, 10),
  };
}

export async function recordEventView(sb: SupabaseClient, eventId: string) {
  await sb.rpc('increment_event_view', { p_event: eventId }).then(() => {}, () => {});
}
