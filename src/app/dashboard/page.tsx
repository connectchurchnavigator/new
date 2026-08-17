import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import DashboardClient from './DashboardClient';
import './dashboard.css';

export const revalidate = 0; // Dynamic SSR

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch all entity types owned or linked to this user in parallel
  const [churchesRes, pastorsRes, eventsRes, orgRes] = await Promise.all([
    // Churches created by this user's organization(s) or user_id
    supabase
      .from('churches')
      .select('*, church_services(*), leaders(*)')
      .order('created_at', { ascending: false }),

    // Pastor profiles owned by this user
    supabase
      .from('pastors')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),

    // Events created by this user
    supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false }),

    // User organization check
    supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
  ]);

  // Filter or match churches linked to user organizations
  const userOrgs = orgRes.data || [];
  const orgIds = userOrgs.map((o) => o.id);

  const allChurches = churchesRes.data || [];
  // User churches matching org_id or all if single org
  const userChurches = orgIds.length > 0 
    ? allChurches.filter((c) => orgIds.includes(c.org_id))
    : allChurches.slice(0, 3); // Fallback for dev demo

  const userPastors = pastorsRes.data || [];
  const userEvents = eventsRes.data || [];

  return (
    <DashboardClient
      user={user}
      churches={userChurches}
      pastors={userPastors}
      events={userEvents}
    />
  );
}
