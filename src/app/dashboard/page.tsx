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

  // Role detection: is the user a delegated team member?
  const isTeamMember = !!(user.user_metadata?.is_team_member || user.user_metadata?.team_role);
  const teamRole: 'events_only' | 'events_and_church_edit' | null = user.user_metadata?.team_role || (isTeamMember ? 'events_only' : null);
  const assignedChurchIds: string[] = user.user_metadata?.assigned_churches || (user.user_metadata?.assigned_church ? [user.user_metadata.assigned_church] : []);
  const assignedPastorIds: string[] = user.user_metadata?.assigned_pastors || (user.user_metadata?.assigned_pastor ? [user.user_metadata.assigned_pastor] : []);

  // Fetch all organizations owned by this user (only for org owners)
  const { data: userOrgs } = await adminSb
    .from('organizations')
    .select('id, name, slug')
    .eq('owner_id', user.id);

  const orgIds = (userOrgs || []).map((o) => o.id);

  // Fetch all churches
  const { data: churchesData } = await adminSb
    .from('churches')
    .select('*, church_services(*), leaders(*)')
    .order('created_at', { ascending: false });

  const allChurches = churchesData || [];

  // Scoping logic:
  // 1. If delegated team member with assigned churches, ONLY allow those assigned churches
  // 2. If org owner, only churches within org
  // 3. Otherwise (admin/primary owner), all churches
  let userChurches: any[] = [];
  if (isTeamMember) {
    if (assignedChurchIds.length > 0) {
      userChurches = allChurches.filter((c) => assignedChurchIds.includes(c.id));
    } else {
      userChurches = []; // Team member with no assigned churches has no church management rights
    }
  } else if (orgIds.length > 0) {
    userChurches = allChurches.filter((c) => orgIds.includes(c.org_id));
  } else {
    userChurches = allChurches;
  }

  const churchIds = userChurches.map((c: any) => c.id);

  // Fetch other entity types owned or linked to this user in parallel
  let userPastors: any[] = [];
  let userWorshipLeaders: any[] = [];

  if (isTeamMember) {
    // Delegated user only gets pastors specifically assigned to them
    if (assignedPastorIds.length > 0) {
      const { data: matchedPastors } = await adminSb
        .from('pastors')
        .select('*')
        .in('id', assignedPastorIds)
        .order('created_at', { ascending: false });
      userPastors = matchedPastors || [];
    } else {
      userPastors = [];
    }
    // Delegated team members do not own worship leaders unless they are full admin
    userWorshipLeaders = [];
  } else {
    const [pastorsRes, worshipLeadersRes] = await Promise.all([
      adminSb
        .from('pastors')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false }),
      adminSb
        .from('worship_leaders')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false }),
    ]);
    userPastors = pastorsRes.data || [];
    userWorshipLeaders = worshipLeadersRes.data || [];
  }

  const pastorIds = userPastors.map((p: any) => p.id);

  // Fetch events created by this user or hosted by user's assigned churches/pastors
  let userEvents: any[] = [];
  try {
    let query = adminSb
      .from('events')
      .select('*, event_tickets(*)')
      .order('created_at', { ascending: false });

    // Match by created_by or host church / pastor
    const filters: string[] = [`created_by.eq.${user.id}`];
    if (churchIds.length > 0) {
      filters.push(`host_church_id.in.(${churchIds.join(',')})`);
    }
    if (pastorIds.length > 0) {
      filters.push(`host_pastor_id.in.(${pastorIds.join(',')})`);
    }

    const { data: matchedEvents, error: evErr } = await query.or(filters.join(','));
    if (!evErr && matchedEvents && matchedEvents.length > 0) {
      userEvents = matchedEvents;
    } else if (!isTeamMember) {
      // Fallback only for primary admins, never for delegated team members
      const { data: fallbackEvents } = await adminSb
        .from('events')
        .select('*, event_tickets(*)')
        .order('created_at', { ascending: false })
        .limit(20);
      userEvents = fallbackEvents || [];
    } else {
      userEvents = [];
    }
  } catch (e) {
    console.error('Error fetching events for dashboard:', e);
  }

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


