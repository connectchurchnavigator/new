'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TYPES = ['All', 'Conference', 'Service', 'Crusade', 'Camp', 'Summit'];

export default function EventsSearch({ defaults }: { defaults: { q?: string; city?: string; type?: string } }) {
  const router = useRouter();
  const [q, setQ] = useState(defaults.q ?? '');
  const [city, setCity] = useState(defaults.city ?? '');
  const [type, setType] = useState(defaults.type ?? 'All');

  function go(nextType?: string) {
    const t = nextType ?? type;
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (city) p.set('city', city);
    if (t && t !== 'All') p.set('type', t);
    router.push(`/events?${p.toString()}`);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2.5 bg-white rounded-2xl p-2 mt-5">
        <div className="flex items-center gap-2 px-3 flex-1 min-w-[150px] text-gray">
          <i className="ti ti-search" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()}
            placeholder="Search events, hosts, topics…" className="w-full py-2 text-sm text-ink outline-none" />
        </div>
        <div className="w-px bg-border" />
        <div className="flex items-center gap-2 px-3 flex-1 min-w-[150px] text-gray">
          <i className="ti ti-map-pin" />
          <input value={city} onChange={(e) => setCity(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()}
            placeholder="City or postcode" className="w-full py-2 text-sm text-ink outline-none" />
        </div>
        <button onClick={() => go()} className="bg-gradient-to-br from-coral to-purple text-white font-bold text-sm px-5 rounded-xl">Search</button>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {TYPES.map((t) => (
          <button key={t} onClick={() => { setType(t); go(t); }}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-full border ${type === t ? 'bg-white text-purple-dark border-white' : 'bg-white/10 text-white border-white/25'}`}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
