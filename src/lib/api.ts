// ───────────────────────────────────────────────────────────────────────
// Church Navigator — data-access layer
// All reads/writes the dashboard, onboarding, search and home page need.
// Every call goes through Supabase, so Row-Level Security is enforced:
// the public only sees published listings; owners only touch their own org.
//
// Pass a SupabaseClient (browser or server) into each function so the same
// code works in React components, server components, and route handlers.
// ───────────────────────────────────────────────────────────────────────

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Church, ChurchFull, ChurchService, Leader, Team,
  Organization, SearchParams,
} from './types';

const FULL_SELECT =
  '*, church_services(*), leaders(*), church_teams(*, church_team_members(*)), branches(*)';

// ═══ PUBLIC: search + home + listing pages ═══════════════════════════════

/** Full-text + fuzzy search across published churches, with filters. */
export async function searchChurches(sb: SupabaseClient, p: SearchParams = {}) {
  const { data, error } = await sb.rpc('search_churches', {
    q: p.q ?? '',
    p_city: p.city ?? null,
    p_denomination: p.denomination ?? null,
    p_ministry: p.ministry ?? null,
    p_language: p.language ?? null,
    p_limit: p.limit ?? 20,
    p_offset: p.offset ?? 0,
  });
  if (error) throw error;
  return data as Church[];
}

/** Home-page feed — newest verified/published churches. */
export async function getHomeChurches(sb: SupabaseClient, limit = 12) {
  const { data, error } = await sb.rpc('home_churches', { p_limit: limit });
  if (error) throw error;
  return data as Church[];
}

/** A full public listing (church + services + leaders + teams) by slug. */
export async function getChurchBySlug(sb: SupabaseClient, slug: string) {
  const { data, error } = await sb
    .from('churches')
    .select(FULL_SELECT)
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data as ChurchFull;
}

/** Distinct filter options for the search UI (denominations, cities, etc.). */
export async function getFilterFacets(sb: SupabaseClient) {
  const { data, error } = await sb
    .from('churches')
    .select('denomination, city')
    .eq('status', 'published');
  if (error) throw error;
  const denominations = [...new Set((data ?? []).map(r => r.denomination).filter(Boolean))].sort();
  const cities = [...new Set((data ?? []).map(r => r.city).filter(Boolean))].sort();
  return { denominations, cities } as { denominations: string[]; cities: string[] };
}

// ═══ OWNER: my organization & branches ═══════════════════════════════════

/** The current user's organization (first one they belong to). */
export async function getMyOrg(sb: SupabaseClient) {
  const { data, error } = await sb.from('organizations').select('*').limit(1).maybeSingle();
  if (error) throw error;
  return data as Organization | null;
}

/** Create an organization for the current user (called once, at first signup). */
export async function createOrganization(sb: SupabaseClient, name: string) {
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) throw new Error('Not signed in');
  const slug = toSlug(name);
  const { data, error } = await sb
    .from('organizations')
    .insert({ name, slug, owner_id: auth.user.id })
    .select()
    .single();
  if (error) throw error;
  return data as Organization;
}

/** All branches (church listings) for an organization. */
export async function getBranches(sb: SupabaseClient, orgId: string) {
  const { data, error } = await sb
    .from('churches')
    .select('*')
    .eq('org_id', orgId)
    .order('is_hq', { ascending: false })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Church[];
}

// ═══ OWNER: church listing CRUD ══════════════════════════════════════════

/** Create a new branch/listing under an org (used by onboarding & “add branch”). */
export async function createChurch(
  sb: SupabaseClient,
  orgId: string,
  input: Partial<Church> & { name: string },
) {
  const slug = input.slug ?? `${toSlug(input.name)}-${shortId()}`;
  const { data, error } = await sb
    .from('churches')
    .insert({ ...input, org_id: orgId, slug })
    .select()
    .single();
  if (error) throw error;
  return data as Church;
}

/** Patch a church listing. Returns the updated row. */
export async function updateChurch(sb: SupabaseClient, churchId: string, patch: Partial<Church>) {
  const { data, error } = await sb
    .from('churches')
    .update(patch)
    .eq('id', churchId)
    .select()
    .single();
  if (error) throw error;
  return data as Church;
}

/** Publish / unpublish a listing. */
export async function setChurchStatus(sb: SupabaseClient, churchId: string, status: 'draft' | 'published') {
  return updateChurch(sb, churchId, { status });
}

// ═══ OWNER: service times ════════════════════════════════════════════════

/** Replace all service rows for a church (simple + reliable for the editor). */
export async function replaceServices(
  sb: SupabaseClient,
  churchId: string,
  services: Array<{
    day: string; name: string;
    start_time?: string | null; end_time?: string | null;
    format: string; language?: string | null; livestream_url?: string | null;
  }>,
) {
  const del = await sb.from('church_services').delete().eq('church_id', churchId);
  if (del.error) throw del.error;
  if (!services.length) return [];
  const rows = services.map((s, i) => ({
    day: s.day,
    name: s.name,
    start_time: s.start_time ?? null,
    end_time: s.end_time ?? null,
    format: s.format,
    language: s.language ?? null,
    livestream_url: s.livestream_url ?? null,
    church_id: churchId,
    display_order: i,
  }));
  const { data, error } = await sb.from('church_services').insert(rows).select();
  if (error) throw error;
  return data as ChurchService[];
}

// ═══ OWNER: pastor & leadership ══════════════════════════════════════════

export async function getLeaders(sb: SupabaseClient, churchId: string) {
  const { data, error } = await sb
    .from('leaders').select('*').eq('church_id', churchId)
    .order('is_lead', { ascending: false }).order('display_order');
  if (error) throw error;
  return data as Leader[];
}

export async function upsertLeader(
  sb: SupabaseClient,
  churchId: string,
  leader: Partial<Leader> & { name: string },
) {
  const row = { ...leader, church_id: churchId };
  const { data, error } = await sb.from('leaders').upsert(row).select().single();
  if (error) throw error;
  return data as Leader;
}

export async function deleteLeader(sb: SupabaseClient, leaderId: string) {
  const { error } = await sb.from('leaders').delete().eq('id', leaderId);
  if (error) throw error;
}

// ═══ OWNER: ministry teams ═══════════════════════════════════════════════

export async function getTeams(sb: SupabaseClient, churchId: string) {
  const { data, error } = await sb
    .from('teams').select('*').eq('church_id', churchId).order('display_order');
  if (error) throw error;
  return data as Team[];
}

export async function upsertTeam(
  sb: SupabaseClient,
  churchId: string,
  team: Partial<Team> & { name: string },
) {
  const row = { ...team, church_id: churchId };
  const { data, error } = await sb.from('teams').upsert(row).select().single();
  if (error) throw error;
  return data as Team;
}

export async function deleteTeam(sb: SupabaseClient, teamId: string) {
  const { error } = await sb.from('teams').delete().eq('id', teamId);
  if (error) throw error;
}

// ═══ STORAGE: photos (logo / cover / pastor) ═════════════════════════════

/**
 * Upload an image to the `church-media` bucket and return its public URL.
 * Create the bucket once in Supabase (see BACKEND_SETUP.md).
 */
export async function uploadImage(
  sb: SupabaseClient,
  churchId: string,
  kind: 'logo' | 'cover' | 'leader' | 'gallery',
  file: File,
) {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${churchId}/${kind}-${shortId()}.${ext}`;
  const up = await sb.storage.from('church-media').upload(path, file, { upsert: true });
  if (up.error) throw up.error;
  const { data } = sb.storage.from('church-media').getPublicUrl(path);
  return data.publicUrl;
}

// ═══ VISITOR TRACKING (owner-only) ═══════════════════════════════════════

export async function getVisitors(sb: SupabaseClient, churchId: string) {
  const { data, error } = await sb.from('visitors').select('*')
    .eq('church_id', churchId).order('visits_count', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getVisitorStats(sb: SupabaseClient, churchId: string) {
  const { data, error } = await sb.rpc('visitor_stats', { p_church: churchId });
  if (error) throw error;
  return data?.[0] as { total: number; new_this_month: number; returning_rate: number; at_risk: number };
}

export async function getVisitorFunnel(sb: SupabaseClient, churchId: string) {
  const { data, error } = await sb.rpc('visitor_funnel', { p_church: churchId });
  if (error) throw error;
  return data as { stage: string; count: number }[];
}

export async function getVisitorSources(sb: SupabaseClient, churchId: string) {
  const { data, error } = await sb.rpc('visitor_sources', { p_church: churchId });
  if (error) throw error;
  return data as { source: string; count: number }[];
}

export async function upsertVisitor(sb: SupabaseClient, churchId: string, v: Record<string, any>) {
  const { data, error } = await sb.from('visitors').upsert({ ...v, church_id: churchId }).select().single();
  if (error) throw error;
  return data;
}

export async function recordCheckIn(sb: SupabaseClient, churchId: string, visitorId: string | null, opts: { serviceId?: string; firstTime?: boolean } = {}) {
  const { error } = await sb.from('check_ins').insert({
    church_id: churchId, visitor_id: visitorId,
    service_id: opts.serviceId ?? null, is_first_time: !!opts.firstTime,
  });
  if (error) throw error;
}

/** Anonymous view tracking — safe to call from a public listing page. */
export async function recordView(sb: SupabaseClient, churchId: string, meta: { source?: string; device?: string; city?: string } = {}) {
  await sb.from('listing_views').insert({ church_id: churchId, ...meta });
}

// ═══ ADDRESS (Google Places via your server proxy — key stays hidden) ════

export async function suggestAddress(q: string, country: string, session: string) {
  const r = await fetch(`/api/address/suggest?q=${encodeURIComponent(q)}&country=${country}&session=${session}`);
  const data = await r.json();
  return data.predictions as { placeId: string; main: string; secondary: string; description: string }[];
}

export async function getAddressDetails(placeId: string, session: string) {
  const r = await fetch(`/api/address/details?placeId=${placeId}&session=${session}`);
  return r.json(); // { address_line, city, area, state, postcode, country, country_code, latitude, longitude, ... }
}

// ═══ helpers ═════════════════════════════════════════════════════════════

export function toSlug(s: string) {
  return s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}
function shortId() {
  return Math.random().toString(36).slice(2, 8);
}
