import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function PastorDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // The pastor profile owned by this user
  const { data: pastor } = await supabase
    .from('pastors')
    .select('id, slug, full_name, title, initials, avatar_url, city, is_published, is_verified, view_count, follower_count, bio, vision_statement')
    .eq('owner_id', user.id)
    .maybeSingle();

  // No profile yet → send them to onboarding to create one
  if (!pastor) redirect('/onboarding/pastor');

  // Their enquiries (RLS lets the owner read these)
  const { data: enquiries } = await supabase
    .from('pastor_enquiries')
    .select('id, name, email, event_type, message, created_at, status')
    .eq('pastor_id', pastor.id)
    .order('created_at', { ascending: false })
    .limit(25);

  // Counts for the overview cards
  const [{ count: sermonCount }, { count: reviewCount }] = await Promise.all([
    supabase.from('pastor_sermons').select('id', { count: 'exact', head: true }).eq('pastor_id', pastor.id),
    supabase.from('pastor_reviews').select('id', { count: 'exact', head: true }).eq('pastor_id', pastor.id),
  ]);

  return (
    <DashboardClient
      pastor={pastor}
      enquiries={enquiries ?? []}
      counts={{ sermons: sermonCount ?? 0, reviews: reviewCount ?? 0 }}
    />
  );
}
