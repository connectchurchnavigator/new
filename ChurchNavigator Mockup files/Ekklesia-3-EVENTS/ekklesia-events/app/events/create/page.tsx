'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createEvent } from '@/lib/events';
import type { EventType } from '@/lib/events-types';

const TYPES: EventType[] = ['Conference', 'Service', 'Crusade', 'Camp', 'Summit', 'Concert'];

export default function CreateEvent() {
  const supabase = createClient();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  // hosts the signed-in user is allowed to post as
  const [churches, setChurches] = useState<{ id: string; name: string }[]>([]);
  const [pastor, setPastor] = useState<{ id: string; full_name: string } | null>(null);

  const [f, setF] = useState({
    title: '', type: 'Conference' as EventType, host: '', date: '', start: '', end: '',
    venue: '', city: '', description: '', capacity: '', price: 'Free', tags: '',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
      // churches the user is a member of
      const { data: orgs } = await supabase.from('org_members').select('org_id').eq('user_id', user.id);
      const orgIds = (orgs ?? []).map((o) => o.org_id);
      if (orgIds.length) {
        const { data: chs } = await supabase.from('churches').select('id, name').in('org_id', orgIds);
        setChurches(chs ?? []);
      }
      // pastor profile they own
      const { data: p } = await supabase.from('pastors').select('id, full_name').eq('owner_id', user.id).maybeSingle();
      if (p) setPastor(p);
    })();
  }, [router, supabase]);

  async function publish(status: 'draft' | 'published') {
    if (!userId) return;
    setErr(''); setBusy(true);
    try {
      const startsAt = f.date && f.start ? new Date(`${f.date}T${f.start}`).toISOString() : null;
      if (!f.title || !startsAt) throw new Error('Title and date/time are required.');
      const host_church_id = f.host.startsWith('church:') ? f.host.slice(7) : null;
      const host_pastor_id = f.host.startsWith('pastor:') ? f.host.slice(7) : null;
      if (!host_church_id && !host_pastor_id) throw new Error('Choose who is hosting this event.');
      const ev = await createEvent(supabase, userId, {
        title: f.title, type: f.type, description: f.description,
        host_church_id, host_pastor_id,
        starts_at: startsAt,
        ends_at: f.date && f.end ? new Date(`${f.date}T${f.end}`).toISOString() : null,
        venue_name: f.venue, city: f.city,
        is_free: /free/i.test(f.price), price_label: f.price,
        capacity: f.capacity ? Number(f.capacity) : undefined,
        tags: f.tags ? f.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
        status,
      });
      router.push(status === 'published' ? `/events/${ev.slug}` : '/dashboard');
    } catch (e: any) {
      setErr(e.message || 'Could not save the event.');
    } finally {
      setBusy(false);
    }
  }

  const inp = 'w-full text-sm px-3 py-2.5 border border-border rounded-xl outline-none focus:border-purple';
  const lbl = 'block text-[12.5px] font-bold mb-1.5';

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="max-w-2xl mx-auto px-5">
        <div className="bg-white border border-border rounded-2xl p-7">
          <h1 className="text-xl font-extrabold mb-1">Create an event</h1>
          <p className="text-sm text-gray mb-5">It appears in Discover and on your church/pastor page.</p>
          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-3">{err}</div>}

          <div className="mb-4"><label className={lbl}>Event title</label><input className={inp} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Kingdom Power Conference 2025" /></div>
          <div className="grid sm:grid-cols-2 gap-3.5 mb-4">
            <div><label className={lbl}>Type</label><select className={inp} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as EventType })}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className={lbl}>Hosted by</label>
              <select className={inp} value={f.host} onChange={(e) => setF({ ...f, host: e.target.value })}>
                <option value="">Choose host…</option>
                {churches.map((c) => <option key={c.id} value={`church:${c.id}`}>{c.name} (church)</option>)}
                {pastor && <option value={`pastor:${pastor.id}`}>{pastor.full_name} (pastor)</option>}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3.5 mb-4">
            <div><label className={lbl}>Date</label><input type="date" className={inp} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
            <div><label className={lbl}>Start</label><input type="time" className={inp} value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /></div>
            <div><label className={lbl}>End</label><input type="time" className={inp} value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3.5 mb-4">
            <div><label className={lbl}>Venue</label><input className={inp} value={f.venue} onChange={(e) => setF({ ...f, venue: e.target.value })} placeholder="Liberty House" /></div>
            <div><label className={lbl}>City</label><input className={inp} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} placeholder="Ilford, London" /></div>
          </div>
          <div className="mb-4"><label className={lbl}>Description</label><textarea rows={4} className={inp} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
          <div className="grid sm:grid-cols-2 gap-3.5 mb-4">
            <div><label className={lbl}>Capacity</label><input type="number" className={inp} value={f.capacity} onChange={(e) => setF({ ...f, capacity: e.target.value })} placeholder="500" /></div>
            <div><label className={lbl}>Price</label><input className={inp} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} placeholder="Free or £15" /></div>
          </div>
          <div className="mb-5"><label className={lbl}>Tags (comma separated)</label><input className={inp} value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} placeholder="Worship, Free entry" /></div>

          <div className="flex gap-2.5">
            <button disabled={busy} onClick={() => publish('draft')} className="text-sm font-bold px-4 py-2.5 rounded-xl border border-border">Save draft</button>
            <button disabled={busy} onClick={() => publish('published')} className="ml-auto bg-gradient-to-br from-coral to-purple text-white text-sm font-bold px-5 py-2.5 rounded-xl">{busy ? 'Saving…' : 'Publish event'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
