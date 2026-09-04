import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getVisitorStats, getVisitorFunnel, getVisitorSources, getVisitors } from '@/lib/api';
import InsightsClient from './InsightsClient';
import '../dashboard.css'; // Reuse dashboard styles

export const dynamic = 'force-dynamic';

export default async function InsightsPage({
  searchParams,
}: {
  searchParams?: Promise<{ church_id?: string }> | { church_id?: string };
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedChurchId = resolvedSearchParams.church_id;

  // 1. Fetch user's organizations
  const { data: userOrgs } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  const orgIds = (userOrgs || []).map((o) => o.id);

  // 2. Fetch churches belonging to user's orgs or all churches if none
  const { data: churchesData } = await supabase
    .from('churches')
    .select('id, name, slug, org_id, is_hq')
    .order('created_at', { ascending: false });

  const allChurches = churchesData || [];
  const userChurches = orgIds.length > 0
    ? allChurches.filter((c) => orgIds.includes(c.org_id))
    : allChurches;

  if (!userChurches.length && !allChurches.length) {
    redirect('/onboarding');
  }

  const availableChurches = userChurches.length > 0 ? userChurches : allChurches;

  // Selected church (from searchParam, or HQ, or first)
  const activeChurch = (requestedChurchId
    ? availableChurches.find((c) => c.id === requestedChurchId)
    : null) || availableChurches.find((b) => b.is_hq) || availableChurches[0];

  // Fetch insights data for active church safely
  let stats = null;
  let funnel: { stage: string; count: number }[] = [];
  let sources: { source: string; count: number }[] = [];
  let visitors: any[] = [];

  try {
    const [statsRes, funnelRes, sourcesRes, visitorsRes] = await Promise.all([
      getVisitorStats(supabase, activeChurch.id).catch(() => null),
      getVisitorFunnel(supabase, activeChurch.id).catch(() => []),
      getVisitorSources(supabase, activeChurch.id).catch(() => []),
      getVisitors(supabase, activeChurch.id).catch(() => []),
    ]);

    stats = statsRes;
    funnel = funnelRes || [];
    sources = sourcesRes || [];
    visitors = visitorsRes || [];
  } catch (err) {
    console.error("Error fetching insights for church:", err);
  }

  return (
    <InsightsClient 
      churchName={activeChurch.name} 
      churchId={activeChurch.id}
      availableChurches={availableChurches}
      stats={stats} 
      funnel={funnel} 
      sources={sources} 
      visitors={visitors} 
    />
  );
}
