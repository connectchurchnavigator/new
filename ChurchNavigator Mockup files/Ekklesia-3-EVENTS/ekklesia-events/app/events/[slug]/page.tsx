import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getEventBySlug } from '@/lib/events';
import RegisterPanel from './RegisterPanel';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const ev = await getEventBySlug(supabase, params.slug).catch(() => null);
  if (!ev) return { title: 'Event — Ekklesia' };
  return {
    title: `${ev.title} — Ekklesia`,
    description: ev.description?.slice(0, 150) ?? `${ev.type} hosted by ${ev.church?.name || ev.pastor?.full_name}`,
  };
}

function fmtFull(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { hour: 'numeric', minute: '2-digit' });
}

export default async function EventDetail({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const ev = await getEventBySlug(supabase, params.slug).catch(() => null);
  if (!ev || ev.status !== 'published') notFound();

  const cover = ev.cover_gradient || 'linear-gradient(135deg,#5b21b6,#be185d)';
  const pct = ev.capacity ? Math.min(100, Math.round(((ev.registration_count ?? 0) / ev.capacity) * 100)) : null;

  return (
    <div className="min-h-screen bg-bg">
      {/* hero */}
      <div className="relative min-h-[380px] text-white overflow-hidden" style={{ background: cover }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(8,6,20,.8),rgba(8,6,20,.15))' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-5 py-8 min-h-[380px] flex flex-col">
          <Link href="/events" className="text-sm font-semibold text-white/80"><i className="ti ti-arrow-left" /> All events</Link>
          <div className="mt-auto">
            <span className="inline-flex items-center gap-1.5 bg-white/18 backdrop-blur text-xs font-extrabold uppercase tracking-wide px-3 py-1.5 rounded-full mb-3.5">{ev.type}</span>
            <h1 className="text-4xl font-black tracking-tight max-w-3xl">{ev.title}</h1>
            <div className="flex flex-wrap gap-4 mt-4 text-sm font-semibold">
              <span><i className="ti ti-calendar-event" /> {fmtFull(ev.starts_at)}</span>
              <span><i className="ti ti-clock" /> {fmtTime(ev.starts_at)}{ev.ends_at ? ` – ${fmtTime(ev.ends_at)}` : ''}</span>
              {ev.city && <span><i className="ti ti-map-pin" /> {ev.venue_name ? `${ev.venue_name}, ` : ''}{ev.city}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 grid lg:grid-cols-[1fr_348px] gap-6 py-7 items-start">
        {/* main */}
        <div className="space-y-4">
          <section className="bg-white border border-border rounded-2xl p-6">
            <h2 className="text-lg font-extrabold mb-2">About this event</h2>
            <p className="text-sm leading-7 whitespace-pre-line">{ev.description}</p>
            {ev.tags?.length > 0 && (
              <div className="mt-3">{ev.tags.map((t) => <span key={t} className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-surface text-purple-dark mr-1.5 mt-1.5">{t}</span>)}</div>
            )}
          </section>

          {ev.sessions.length > 0 && (
            <section className="bg-white border border-border rounded-2xl p-6">
              <h2 className="text-lg font-extrabold mb-3">Schedule</h2>
              {ev.sessions.map((s) => (
                <div key={s.id} className="flex gap-4 py-3.5 border-b border-border last:border-0">
                  <div className="text-sm font-extrabold text-purple-dark w-16 shrink-0">{s.time_label}</div>
                  <div>
                    <div className="font-bold text-[14.5px]">{s.title}</div>
                    {s.description && <div className="text-xs text-gray mt-0.5">{s.description}</div>}
                    {s.speaker_name && <div className="text-xs text-purple-dark font-semibold mt-1"><i className="ti ti-microphone" /> {s.speaker_name}</div>}
                  </div>
                </div>
              ))}
            </section>
          )}

          {ev.speakers.length > 0 && (
            <section className="bg-white border border-border rounded-2xl p-6">
              <h2 className="text-lg font-extrabold mb-3">Speakers & ministers</h2>
              <div className="grid sm:grid-cols-3 gap-3.5">
                {ev.speakers.map((sp) => {
                  const inner = (
                    <div className="text-center border border-border rounded-2xl p-4 h-full">
                      <div className="w-16 h-16 rounded-full mx-auto mb-2.5 flex items-center justify-center text-white font-extrabold text-xl bg-gradient-to-br from-purple to-coral">
                        {sp.name.replace(/^(Pastor|Rev\.?|Dr|Bishop|Min\.?) /, '').split(' ').map((w) => w[0]).slice(0, 2).join('')}
                      </div>
                      <div className="font-extrabold text-[13.5px]">{sp.name}</div>
                      {sp.role && <div className="text-[11.5px] text-gray mt-0.5">{sp.role}</div>}
                    </div>
                  );
                  return sp.pastor_id
                    ? <Link key={sp.id} href={`/pastor/${sp.pastor_id}`}>{inner}</Link>
                    : <div key={sp.id}>{inner}</div>;
                })}
              </div>
            </section>
          )}

          {(ev.venue_name || ev.city) && (
            <section className="bg-white border border-border rounded-2xl p-6">
              <h2 className="text-lg font-extrabold mb-1">Venue & directions</h2>
              <div className="text-sm text-gray mb-3">{[ev.venue_name, ev.address, ev.city].filter(Boolean).join(', ')}</div>
              <div className="h-52 rounded-xl flex items-center justify-center text-gray-l" style={{ background: 'linear-gradient(135deg,#ede9fe,#fce7f3)' }}>
                <i className="ti ti-map-2 text-3xl" />
              </div>
            </section>
          )}
        </div>

        {/* sidebar */}
        <div className="lg:sticky lg:top-[74px] space-y-4">
          <RegisterPanel
            eventId={ev.id}
            tickets={ev.tickets}
            isFree={ev.is_free}
            registered={ev.registration_count ?? 0}
            capacity={ev.capacity}
            pct={pct}
          />
          {/* HOST LINKS — this is the church/pastor link */}
          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="text-sm font-extrabold mb-3">Hosted by</h3>
            {ev.church && (
              <Link href={`/church/${ev.church.slug}`} className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-coral to-purple flex items-center justify-center text-white font-extrabold">
                  {ev.church.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="font-extrabold text-[13.5px]">{ev.church.name}</div>
                  <div className="text-xs text-gray">{[ev.church.denomination, ev.church.city].filter(Boolean).join(' · ')} · View church →</div>
                </div>
              </Link>
            )}
            {ev.pastor && (
              <Link href={`/pastor/${ev.pastor.slug}`} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple to-coral flex items-center justify-center text-white font-extrabold">
                  {ev.pastor.full_name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="font-extrabold text-[13.5px]">{ev.pastor.full_name}</div>
                  <div className="text-xs text-gray">{ev.pastor.title} · View profile →</div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
