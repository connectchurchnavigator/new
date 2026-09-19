import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import DashboardClient from './DashboardClient';
import './dashboard.css';

export const revalidate = 0; // Dynamic SSR

export default async function DashboardPage() {
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

  // Fetch all entity types owned or linked to this user in parallel
  const [churchesRes, pastorsRes, eventsRes, worshipLeadersRes] = await Promise.all([
    // Churches created by this user's organization(s)
    orgIds.length > 0
      ? adminSb
          .from('churches')
          .select('*, church_services(*), leaders(*)')
          .in('org_id', orgIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),

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

  const userChurches = churchesRes.data || [];
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

  return (
    <DashboardClient
      user={user}
      churches={userChurches}
      pastors={userPastors}
      events={userEvents}
      worshipLeaders={userWorshipLeaders}
      pastorEnquiries={pastorEnquiries}
    />
  );
}


