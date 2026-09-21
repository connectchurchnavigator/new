import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function InsightsPage({
  searchParams,
}: {
  searchParams?: Promise<{ church_id?: string }> | { church_id?: string };
}) {
  const resolved = searchParams ? await searchParams : {};
  const churchId = resolved.church_id;
  if (churchId) {
    redirect(`/dashboard?section=visitor-insights&church_id=${churchId}`);
  }
  redirect('/dashboard?section=visitor-insights');
}
