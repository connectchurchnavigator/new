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

  // Role detection: is the user a super admin or delegated team member?
  const isSuperAdmin = (
    user.user_metadata?.role === 'super_admin' ||
    user.app_metadata?.role === 'super_admin' ||
    (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS || '')
      .split(',')
      .map((e: string) => e.trim().toLowerCase())
      .filter(Boolean)
      .includes(user.email?.toLowerCase() || '')
  );

  const isTeamMember = !!(user.user_metadata?.is_team_member || user.user_metadata?.team_role);
  const teamRole: 'events_only' | 'events_and_church_edit' | null = user.user_metadata?.team_role || (isTeamMember ? 'events_only' : null);

  // If this user was added as a co-manager/team member by another user, get that owner's ID
  const invitedByUserId: string | null = user.user_metadata?.invited_by || null;
  // Effective owner IDs for listings: current user + invited_by user (if co-manager)
  const effectiveOwnerIds: string[] = [user.id];
  if (invitedByUserId && !effectiveOwnerIds.includes(invitedByUserId)) {
    effectiveOwnerIds.push(invitedByUserId);
  }

  // Fetch all organizations owned by effective owners
  const { data: userOrgs } = await adminSb
    .from('organizations')
    .select('id, name, slug')
    .in('owner_id', effectiveOwnerIds);

  const orgIds = (userOrgs || []).map((o) => o.id);

  // Fetch churches:
  // - Super admins see all churches
  // - Regular users see strictly churches matching their owned organizations (or created by them)
  let userChurches: any[] = [];
  if (isSuperAdmin) {
    const { data: allChurchesData } = await adminSb
      .from('churches')
      .select('*, church_services(*), leaders(*)')
      .order('created_at', { ascending: false });
    userChurches = allChurchesData || [];
  } else if (orgIds.length > 0) {
    const { data: matchingChurches } = await adminSb
      .from('churches')
      .select('*, church_services(*), leaders(*)')
      .in('org_id', orgIds)
      .order('created_at', { ascending: false });
    userChurches = matchingChurches || [];
  } else {
    // New user with no churches created yet
    userChurches = [];
  }

  const churchIds = userChurches.map((c: any) => c.id);

  // Fetch other entity types owned or linked to this user
  let userPastors: any[] = [];
  let userWorshipLeaders: any[] = [];

  if (isSuperAdmin) {
    const [pastorsRes, worshipLeadersRes] = await Promise.all([
      adminSb.from('pastors').select('*').order('created_at', { ascending: false }),
      adminSb.from('worship_leaders').select('*').order('created_at', { ascending: false }),
    ]);
    userPastors = pastorsRes.data || [];
    userWorshipLeaders = worshipLeadersRes.data || [];
  } else {
    const [pastorsRes, worshipLeadersRes] = await Promise.all([
      adminSb.from('pastors').select('*').in('owner_id', effectiveOwnerIds).order('created_at', { ascending: false }),
      adminSb.from('worship_leaders').select('*').in('owner_id', effectiveOwnerIds).order('created_at', { ascending: false }),
    ]);
    userPastors = pastorsRes.data || [];
    userWorshipLeaders = worshipLeadersRes.data || [];
  }

  const pastorIds = userPastors.map((p: any) => p.id);

  // Fetch events created by this user or hosted by user's churches/pastors
  let userEvents: any[] = [];
  try {
    if (isSuperAdmin) {
      const { data: allEvents } = await adminSb
        .from('events')
        .select('*, event_tickets(*)')
        .order('created_at', { ascending: false });
      userEvents = allEvents || [];
    } else {
      const filters: string[] = effectiveOwnerIds.map((id) => `created_by.eq.${id}`);
      if (churchIds.length > 0) {
        filters.push(`host_church_id.in.(${churchIds.join(',')})`);
      }
      if (pastorIds.length > 0) {
        filters.push(`host_pastor_id.in.(${pastorIds.join(',')})`);
      }

      if (filters.length > 0) {
        const { data: matchedEvents, error: evErr } = await adminSb
          .from('events')
          .select('*, event_tickets(*)')
          .or(filters.join(','))
          .order('created_at', { ascending: false });

        if (!evErr && matchedEvents) {
          userEvents = matchedEvents;
        }
      }
    }
  } catch (e) {
    console.error('Error fetching events for dashboard:', e);
  }

  // Fetch enquiries for pastors owned by this user
  let pastorEnquiries: any[] = [];
  if (isSuperAdmin) {
    const { data: enquiries } = await adminSb
      .from('pastor_enquiries')
      .select('*')
      .order('created_at', { ascending: false });
    pastorEnquiries = enquiries || [];
  } else if (pastorIds.length > 0) {
    const { data: enquiries } = await adminSb
      .from('pastor_enquiries')
      .select('*')
      .in('pastor_id', pastorIds)
      .order('created_at', { ascending: false });
    pastorEnquiries = enquiries || [];
  }

  // Fetch visitor insights for target church
  const targetChurchId = requestedChurchId || churchIds[0] || null;
  let insightsChurch: any = null;

  if (targetChurchId) {
    const { data: targetChurchData } = await adminSb
      .from('churches')
      .select('id, name, slug')
      .eq('id', targetChurchId)
      .maybeSingle();

    insightsChurch = targetChurchData || userChurches.find((c: any) => c.id === targetChurchId) || userChurches[0] || null;
  } else if (userChurches.length > 0) {
    insightsChurch = userChurches[0];
  }

  let insightsStats = null;
  let insightsFunnel: { stage: string; count: number }[] = [];
  let insightsSources: any = [];
  let insightsVisitors: any[] = [];

  if (insightsChurch?.id) {
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
        churchName: insightsChurch?.name || 'No Church Selected',
        churchId: insightsChurch?.id || '',
        stats: insightsStats,
        funnel: insightsFunnel,
        sources: insightsSources,
        visitors: insightsVisitors,
      }}
    />
  );
}


