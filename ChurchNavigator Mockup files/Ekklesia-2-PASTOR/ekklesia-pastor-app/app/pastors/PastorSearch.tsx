'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PastorSearch({
  initialQ = '',
  initialCity = '',
}: {
  initialQ?: string;
  initialCity?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [city, setCity] = useState(initialCity);

  function search() {
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (city.trim()) p.set('city', city.trim());
    router.push(`/pastors?${p.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2.5 max-w-2xl mx-auto">
      <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-3">
        <i className="ti ti-search text-gray-light" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Name, ministry, or keyword…"
          className="flex-1 outline-none text-ink text-sm bg-transparent"
        />
      </div>
      <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 sm:w-48">
        <i className="ti ti-map-pin text-gray-light" />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="City"
          className="flex-1 outline-none text-ink text-sm bg-transparent w-full"
        />
      </div>
      <button onClick={search} className="bg-ink text-white font-bold rounded-xl px-6 py-3 text-sm">
        Search
      </button>
    </div>
  );
}
