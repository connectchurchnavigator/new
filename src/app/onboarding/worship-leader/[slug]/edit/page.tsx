import { redirect } from 'next/navigation';
import WorshipLeaderOnboardingPage from '../../page';

export default async function EditWorshipLeaderPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  if (!slug) {
    redirect('/onboarding/worship-leader');
  }

  return <WorshipLeaderOnboardingPage initialEditSlug={slug} />;
}
