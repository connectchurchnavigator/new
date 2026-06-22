import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMyOrg, getBranches } from '@/lib/api';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const org = await getMyOrg(supabase);
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
