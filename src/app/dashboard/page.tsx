import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import DashboardClient from './DashboardClient';
import './dashboard.css';
import './dashboard-overview.css';

export const revalidate = 0; // Dynamic SSR

interface DashboardPageProps {
  searchParams?: Promise<{ section?: string; church_id?: string }> | { section?: string; church_id?: string };
}

export default async function DashboardPage(props: DashboardPageProps) {
  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};
  const initialSection = (resolvedSearchParams.section as any) || 'overview';
  const requestedChurchId = resolvedSearchParams.church_id;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const adminSb = createAdminClient();

  // Fetch all organizations owned by this user
  const { data: userOrgs } = await adminSb
    .from('organizations')
    .select('id, name, slug')
    .eq('owner_id', user.id);

  const orgIds = (userOrgs || []).map((o) => o.id);

  // Fetch all churches (matching insights/page.tsx logic)
  const { data: churchesData } = await adminSb
    .from('churches')
    .select('*, church_services(*), leaders(*)')
    .order('created_at', { ascending: false });

  const allChurches = churchesData || [];
  const userChurches = orgIds.length > 0
    ? allChurches.filter((c) => orgIds.includes(c.org_id))
    : allChurches;

  const availableChurches = userChurches.length > 0 ? userChurches : allChurches;

  // Fetch other entity types owned or linked to this user in parallel
  const [pastorsRes, eventsRes, worshipLeadersRes] = await Promise.all([
    // Pastor profiles owned by this user
    adminSb
      .from('pastors')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),

    // Events created by this user
    adminSb
      .from('events')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),

    // Worship leader profiles owned by this user
    adminSb
      .from('worship_leaders')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const userPastors = pastorsRes.data || [];
  const userEvents = eventsRes.data || [];
  const userWorshipLeaders = worshipLeadersRes.data || [];

  // Fetch enquiries for all pastors owned by this user
  let pastorEnquiries: any[] = [];
  if (userPastors.length > 0) {
    const pastorIds = userPastors.map((p) => p.id);
    const { data: enquiries } = await adminSb
      .from('pastor_enquiries')
      .select('*')
      .in('pastor_id', pastorIds)
      .order('created_at', { ascending: false });
    pastorEnquiries = enquiries || [];
  }

  // Fetch visitor insights for target church (requestedChurchId or e97ae738-0436-444d-b1d5-33f0e23df18c or user's church)
  const targetChurchId = requestedChurchId || 'e97ae738-0436-444d-b1d5-33f0e23df18c';
  const { data: targetChurchData } = await adminSb
    .from('churches')
    .select('id, name, slug')
    .eq('id', targetChurchId)
    .maybeSingle();

  const insightsChurch = targetChurchData || userChurches.find((c: any) => c.id === targetChurchId) || userChurches[0] || {
    id: targetChurchId,
    name: 'ASCA',
    slug: 'grace-cathedral-international-6932'
  };

  let insightsStats = null;
  let insightsFunnel: { stage: string; count: number }[] = [];
  let insightsSources: any = [];
  let insightsVisitors: any[] = [];

  try {
    const { getVisitorStats, getVisitorFunnel, getVisitorSources, getVisitors } = await import('@/lib/api');
    const [stRes, fnRes, scRes, vtRes] = await Promise.all([
      getVisitorStats(adminSb, insightsChurch.id).catch(() => null),
      getVisitorFunnel(adminSb, insightsChurch.id).catch(() => []),
      getVisitorSources(adminSb, insightsChurch.id).catch(() => []),
      getVisitors(adminSb, insightsChurch.id).catch(() => []),
    ]);
    insightsStats = stRes;
    insightsFunnel = fnRes || [];
    insightsSources = scRes || [];
    insightsVisitors = vtRes || [];
  } catch (err) {
    console.error('Error fetching insights for dashboard:', err);
  }

  return (
    <DashboardClient
      user={user}
      churches={userChurches}
      pastors={userPastors}
      events={userEvents}
      worshipLeaders={userWorshipLeaders}
      pastorEnquiries={pastorEnquiries}
      initialSection={initialSection}
      insightsData={{
        churchName: insightsChurch.name,
        churchId: insightsChurch.id,
        stats: insightsStats,
        funnel: insightsFunnel,
        sources: insightsSources,
        visitors: insightsVisitors,
      }}
    />
  );
}


