'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { registerForEvent } from '@/lib/events';
import type { EventTicket } from '@/lib/events-types';

export default function RegisterPanel({
  eventId, tickets, isFree, registered, capacity, pct,
}: {
  eventId: string; tickets: EventTicket[]; isFree: boolean;
  registered: number; capacity: number | null; pct: number | null;
}) {
  const supabase = createClient();
  const [sel, setSel] = useState(0);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const tk = tickets[sel];
  const priceLabel = tk ? (tk.price_pence === 0 ? 'Free' : `£${(tk.price_pence / 100).toFixed(0)}`) : isFree ? 'Free' : '';

  async function submit() {
    setBusy(true);
    try {
      await registerForEvent(supabase, { event_id: eventId, name, email, ticket_id: tk?.id ?? null, source: 'directory' });
      setDone(true);
    } catch (e) {
      // surface minimally; real app would toast
      alert('Could not register — please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      {capacity != null && (
        <div className="rounded-xl p-3.5 mb-3.5" style={{ background: 'linear-gradient(135deg,rgba(244,63,94,.12),rgba(124,58,237,.12))' }}>
          <div className="flex justify-between text-[13px] font-bold"><span>{registered} registered</span><span className="text-gray">{capacity} capacity</span></div>
          <div className="h-2 bg-white rounded-full overflow-hidden my-2"><div className="h-full bg-gradient-to-r from-coral to-purple rounded-full" style={{ width: `${pct ?? 0}%` }} /></div>
          {capacity - registered > 0 ? <div className="text-[11.5px] text-gray">{capacity - registered} places left</div> : <div className="text-[11.5px] text-coral font-bold">Sold out — join the waitlist</div>}
        </div>
      )}

      {tickets.length > 0 && !done && (
        <div className="mb-2">
          {tickets.map((t, i) => (
            <button key={t.id} onClick={() => setSel(i)} className={`w-full flex items-center gap-3 border rounded-xl p-3 mb-2.5 text-left ${i === sel ? 'border-purple bg-surface' : 'border-border'}`}>
              <span className={`w-5 h-5 rounded-full border-2 relative ${i === sel ? 'border-purple' : 'border-border'}`}>{i === sel && <span className="absolute inset-[3px] rounded-full bg-purple" />}</span>
              <span className="flex-1"><span className="block font-bold text-[13.5px]">{t.name}</span>{t.description && <span className="block text-[11.5px] text-gray">{t.description}</span>}</span>
              <span className="font-extrabold text-sm">{t.price_pence === 0 ? '£0' : `£${(t.price_pence / 100).toFixed(0)}`}</span>
            </button>
          ))}
        </div>
      )}

      {done ? (
        <div className="text-center py-3">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-2"><i className="ti ti-check text-2xl" /></div>
          <div className="font-extrabold">You're registered!</div>
          <div className="text-xs text-gray mt-1">Check your email for confirmation and the QR pass.</div>
        </div>
      ) : !open ? (
        <button onClick={() => setOpen(true)} className="w-full bg-gradient-to-br from-coral to-purple text-white font-bold text-sm py-3 rounded-xl">
          <i className="ti ti-ticket" /> Register{priceLabel ? ` — ${priceLabel}` : ''}
        </button>
      ) : (
        <div className="space-y-2.5">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full text-sm px-3 py-2.5 border border-border rounded-xl outline-none" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full text-sm px-3 py-2.5 border border-border rounded-xl outline-none" />
          <button disabled={busy || !name || !email} onClick={submit} className="w-full bg-gradient-to-br from-coral to-purple text-white font-bold text-sm py-3 rounded-xl disabled:opacity-60">
            {busy ? 'Registering…' : `Confirm — ${priceLabel}`}
          </button>
        </div>
      )}

      <div className="flex gap-2 mt-2.5">
        <button className="flex-1 text-[12.5px] font-bold py-2.5 rounded-xl border border-border flex items-center justify-center gap-1.5"><i className="ti ti-calendar-plus" /> Calendar</button>
        <button className="flex-1 text-[12.5px] font-bold py-2.5 rounded-xl border border-border flex items-center justify-center gap-1.5"><i className="ti ti-share" /> Share</button>
        <button className="flex-1 text-[12.5px] font-bold py-2.5 rounded-xl border border-border flex items-center justify-center gap-1.5"><i className="ti ti-qrcode" /> QR</button>
      </div>
    </div>
  );
}
