import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { searchEvents } from '@/lib/events';
import type { EventCard, EventType } from '@/lib/events-types';
import EventsSearch from './EventsSearch';

export const dynamic = 'force-dynamic';

const GRADS = [
  'linear-gradient(135deg,#7c3aed,#f43f5e)', 'linear-gradient(135deg,#0f172a,#7c3aed)',
  'linear-gradient(135deg,#0891b2,#7c3aed)', 'linear-gradient(135deg,#16a34a,#0891b2)',
  'linear-gradient(135deg,#f59e0b,#db2777)', 'linear-gradient(135deg,#1e1b3a,#6d28d9)',
];

function hostName(e: EventCard) {
  return e.church?.name || e.pastor?.full_name || 'Ekklesia';
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return { day: d.getDate().toString().padStart(2, '0'), mon: d.toLocaleString('en-GB', { month: 'short' }).toUpperCase() };
}

export default async function EventsDirectory({
  searchParams,
}: {
  searchParams: { q?: string; city?: string; type?: string };
}) {
  const supabase = createClient();
  let events: EventCard[] = [];
  try {
    events = await searchEvents(supabase, {
      q: searchParams.q,
      city: searchParams.city,
      type: (searchParams.type as EventType) || 'All',
      limit: 24,
    });
  } catch {
    events = [];
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-gradient-to-br from-[#1e1b3a] to-[#3b2a6b] text-white py-9">
        <div className="max-w-5xl mx-auto px-5">
          <h1 className="text-3xl font-extrabold tracking-tight">Find a Christian event near you</h1>
          <p className="text-white/70 mt-1.5">Conferences, services, crusades, camps and summits.</p>
          <EventsSearch defaults={searchParams} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-7">
        <div className="text-sm text-gray mb-4"><b>{events.length}</b> events found</div>
        {events.length === 0 ? (
          <p className="text-gray text-sm py-10 text-center">No upcoming events match your search yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((e, i) => {
              const d = fmtDate(e.starts_at);
              return (
                <Link key={e.id} href={`/events/${e.slug}`} className="bg-white border border-border rounded-2xl overflow-hidden hover:-translate-y-0.5 transition block">
                  <div className="h-32 relative flex items-end p-3" style={{ background: e.cover_gradient || GRADS[i % GRADS.length] }}>
                    <div className="bg-white/90 rounded-xl px-2.5 py-1 text-center leading-none">
                      <div className="text-lg font-extrabold text-ink">{d.day}</div>
                      <div className="text-[10px] font-bold text-coral">{d.mon}</div>
                    </div>
                    <span className="absolute top-3 right-3 bg-black/45 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full">{e.price_label || (e.is_free ? 'Free' : '')}</span>
                  </div>
                  <div className="p-3.5">
                    <div className="text-[11px] font-extrabold uppercase tracking-wide text-purple-dark">{e.type}</div>
                    <div className="text-[15px] font-extrabold mt-1 mb-1.5 leading-tight">{e.title}</div>
                    <div className="text-xs text-gray space-y-1">
                      <div>🏛 {hostName(e)}</div>
                      <div>📍 {e.venue_name ? `${e.venue_name}, ` : ''}{e.city}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
