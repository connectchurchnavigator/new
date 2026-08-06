import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getMyOrg, getBranches, getVisitorStats, getVisitorFunnel, getVisitorSources, getVisitors } from '@/lib/api';
import InsightsClient from './InsightsClient';
import '../dashboard.css'; // Reuse dashboard styles

export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const org = await getMyOrg(supabase);
  if (!org) redirect('/onboarding');

  const branches = await getBranches(supabase, org.id);
  if (!branches.length) redirect('/onboarding');

  // Load the HQ (or first) church
  const hq = branches.find((b) => b.is_hq) || branches[0];

  // Fetch insights data
  const stats = await getVisitorStats(supabase, hq.id);
  const funnel = await getVisitorFunnel(supabase, hq.id);
  const sources = await getVisitorSources(supabase, hq.id);
  const visitors = await getVisitors(supabase, hq.id);

  return (
    <InsightsClient 
      churchName={hq.name} 
      stats={stats} 
      funnel={funnel} 
      sources={sources} 
      visitors={visitors} 
    />
  );
}
