import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getMyOrg, getBranches } from '@/lib/api';
import DashboardClient from './DashboardClient';
import PastorDashboardClient from '@/components/dashboard/PastorDashboardClient';
import './dashboard.css';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch pastor check and user organization in parallel
  const [pastorRes, orgRes] = await Promise.all([
    supabase
      .from('pastors')
      .select('id, slug, full_name, title, initials, avatar_url, city, is_published, is_verified, view_count, follower_count, bio, vision_statement')
      .eq('owner_id', user.id)
      .maybeSingle(),
    supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const pastor = pastorRes.data;

  if (pastor) {
    const [enquiriesRes, sermonRes, reviewRes] = await Promise.all([
      supabase
        .from('pastor_enquiries')
        .select('id, name:sender_name, email:sender_email, event_type, message, created_at, status')
        .eq('pastor_id', pastor.id)
        .order('created_at', { ascending: false })
        .limit(25),
      supabase.from('pastor_sermons').select('id', { count: 'exact', head: true }).eq('pastor_id', pastor.id),
      supabase.from('pastor_reviews').select('id', { count: 'exact', head: true }).eq('pastor_id', pastor.id),
    ]);

    return (
      <PastorDashboardClient
        pastor={pastor}
        enquiries={enquiriesRes.data ?? []}
        counts={{ sermons: sermonRes.count ?? 0, reviews: reviewRes.count ?? 0 }}
      />
    );
  }

  const org = orgRes.data;
  if (!org) redirect('/onboarding');

  const branches = await getBranches(supabase, org.id);
  if (!branches.length) redirect('/onboarding');

  // load the HQ (or first) church with its nested data
  const hq = branches.find((b) => b.is_hq) || branches[0];
  const { data: full } = await supabase
    .from('churches')
    .select('*, church_services(*), leaders(*), teams(*)')
    .eq('id', hq.id)
    .single();

  return <DashboardClient org={org} branches={branches} church={full} />;
}
