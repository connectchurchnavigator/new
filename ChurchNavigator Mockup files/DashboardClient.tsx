'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Pastor = {
  id: string; slug: string; full_name: string; title: string | null;
  initials: string | null; avatar_url: string | null; city: string | null;
  is_published: boolean; is_verified: boolean;
  view_count: number | null; follower_count: number | null;
  bio: string | null; vision_statement: string | null;
};
type Enquiry = {
  id: string; name: string; email: string; event_type: string | null;
  message: string; created_at: string; status: string | null;
};

export default function DashboardClient({
  pastor, enquiries, counts,
}: {
  pastor: Pastor;
  enquiries: Enquiry[];
  counts: { sermons: number; reviews: number };
}) {
  const router = useRouter();
  const supabase = createClient();
  const [published, setPublished] = useState(pastor.is_published);
  const [busy, setBusy] = useState(false);

  async function togglePublish() {
    setBusy(true);
    const next = !published;
    const { error } = await supabase.from('pastors').update({ is_published: next }).eq('id', pastor.id);
    if (!error) setPublished(next);
    setBusy(false);
  }
  async function signOut() { await supabase.auth.signOut(); router.push('/'); }

  // simple profile-strength score
  const checks = [
    { t: 'Profile photo', done: !!pastor.avatar_url },
    { t: 'Biography', done: !!pastor.bio },
    { t: 'Vision statement', done: !!pastor.vision_statement },
    { t: 'At least one sermon', done: counts.sermons > 0 },
    { t: 'Verified church link', done: pastor.is_verified },
  ];
  const strength = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);
  const newCount = enquiries.filter((e) => (e.status ?? 'new') === 'new').length;

  const cards = [
    { ic: 'ti-eye', v: (pastor.view_count ?? 0).toLocaleString(), l: 'Profile views', g: 'from-purple to-indigo-500' },
    { ic: 'ti-mail', v: String(newCount), l: 'New enquiries', g: 'from-coral to-rose-500' },
    { ic: 'ti-user-plus', v: (pastor.follower_count ?? 0).toLocaleString(), l: 'Followers', g: 'from-teal-400 to-cyan-600' },
    { ic: 'ti-star', v: String(counts.reviews), l: 'Reviews', g: 'from-amber-400 to-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <nav className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-coral to-purple flex items-center justify-center text-white"><i className="ti ti-cross text-base" /></span>
            Ekklesia
          </Link>
          <div className="flex-1" />
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${published ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            {published ? 'Published' : 'Draft'}
          </span>
          {published && <Link href={`/pastor/${pastor.slug}`} className="text-sm font-semibold text-purple-dark">View profile</Link>}
          <button onClick={signOut} className="text-sm font-semibold text-gray">Sign out</button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-5 py-7">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-extrabold">Welcome back, {pastor.full_name.split(' ')[0]} 👋</h1>
          <button onClick={togglePublish} disabled={busy}
            className="bg-gradient-to-br from-coral to-purple text-white text-sm font-bold px-4 py-2 rounded-xl">
            {published ? 'Unpublish' : 'Publish profile'}
          </button>
        </div>
        <p className="text-sm text-gray mb-6">{pastor.title}{pastor.city ? ` · ${pastor.city}` : ''}</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {cards.map((c) => (
            <div key={c.l} className="bg-white border border-border rounded-2xl p-4">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.g} flex items-center justify-center text-white mb-3`}><i className={`ti ${c.ic} text-lg`} /></div>
              <div className="text-2xl font-extrabold leading-none">{c.v}</div>
              <div className="text-xs text-gray mt-1">{c.l}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
          {/* enquiries */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <div className="flex items-center mb-4">
              <h3 className="font-extrabold">Enquiries inbox</h3>
              <span className="ml-2 text-xs font-bold bg-surface text-purple-dark px-2 py-0.5 rounded-full">{enquiries.length}</span>
            </div>
            {enquiries.length === 0 ? (
              <p className="text-sm text-gray py-6 text-center">No enquiries yet. They'll appear here when someone contacts you.</p>
            ) : (
              <div className="divide-y divide-border">
                {enquiries.map((e) => (
                  <div key={e.id} className="py-3 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple to-coral flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {e.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold">{e.name}</div>
                      <div className="text-xs text-gray">{e.event_type ? `${e.event_type} · ` : ''}{new Date(e.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-ink mt-1 line-clamp-2">{e.message}</div>
                    </div>
                    <a href={`mailto:${e.email}`} className="text-xs font-bold text-purple-dark flex-shrink-0">Reply</a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* profile strength + quick links */}
          <div className="space-y-5">
            <div className="bg-white border border-border rounded-2xl p-5">
              <h3 className="font-extrabold mb-1">Profile strength</h3>
              <p className="text-xs text-gray mb-3">A complete profile ranks higher and gets more enquiries.</p>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-coral to-purple rounded-full" style={{ width: `${strength}%` }} />
              </div>
              <div className="text-sm font-bold mb-3">{strength}% complete</div>
              <div className="space-y-2">
                {checks.map((c) => (
                  <div key={c.t} className="flex items-center gap-2 text-sm">
                    <i className={`ti ${c.done ? 'ti-circle-check-filled text-green-500' : 'ti-circle text-gray-300'} text-base`} />
                    <span className={c.done ? '' : 'text-gray'}>{c.t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-border rounded-2xl p-5">
              <h3 className="font-extrabold mb-3">Manage</h3>
              <div className="space-y-2 text-sm font-semibold">
                <Link href={`/pastor/${pastor.slug}`} className="flex items-center gap-2 text-purple-dark"><i className="ti ti-pencil text-base" /> Edit my profile</Link>
                <Link href="/onboarding/pastor" className="flex items-center gap-2 text-gray"><i className="ti ti-settings text-base" /> Profile settings</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
