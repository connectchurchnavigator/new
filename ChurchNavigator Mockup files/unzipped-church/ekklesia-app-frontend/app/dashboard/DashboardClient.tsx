'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  updateChurch, setChurchStatus, replaceServices,
  upsertLeader, deleteLeader, upsertTeam, deleteTeam, uploadImage,
} from '@/lib/api';
import type { Organization, Church, ChurchFull, Leader, Team, ChurchService } from '@/lib/types';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const FORMATS = ['In-Person','Online','Hybrid'];
const DENOMS = ['Pentecostal','Baptist','Catholic','Anglican','Methodist','Non-Denominational','Orthodox','Other'];

type DraftService = { day: string; name: string; start_time: string; end_time: string; format: string };

export default function DashboardClient({
  org, branches, church,
}: { org: Organization; branches: Church[]; church: ChurchFull }) {
  const router = useRouter();
  const supabase = createClient();
  const [c, setC] = useState<ChurchFull>(church);
  const [drawer, setDrawer] = useState<null | 'profile' | 'services' | 'leader' | 'team'>(null);
  const [msg, setMsg] = useState('');

  async function reload() {
    const { data } = await supabase
      .from('churches').select('*, church_services(*), leaders(*), teams(*)')
      .eq('id', c.id).single();
    if (data) setC(data as ChurchFull);
  }
  function flash(t: string) { setMsg(t); setTimeout(() => setMsg(''), 2600); }

  async function togglePublish() {
    const next = c.status === 'published' ? 'draft' : 'published';
    const u = await setChurchStatus(supabase, c.id, next);
    setC({ ...c, ...u });
  }
  async function signOut() { await supabase.auth.signOut(); router.push('/'); }

  const lead = c.leaders?.find((l) => l.is_lead) || c.leaders?.[0];

  return (
    <>
      <nav className="topnav">
        <div className="wrap">
          <Link href="/" className="brand"><span className="mark">✝</span> Ekklesia</Link>
          <div style={{ flex: 1 }} />
          <span className="pill" style={c.status === 'published' ? { background: '#f0fdf4', color: '#15803d' } : { background: '#fffbeb', color: '#b45309' }}>
            {c.status === 'published' ? 'Published' : 'Draft'}
          </span>
          {c.status === 'published' && <Link href={`/church/${c.slug}`} className="btn btn-ghost">View public listing</Link>}
          <button onClick={signOut} className="btn btn-ghost">Sign out</button>
        </div>
      </nav>

      <div className="wrap" style={{ padding: '28px 20px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>{c.name}</h1>
          <button onClick={togglePublish} className="btn btn-primary">
            {c.status === 'published' ? 'Unpublish' : 'Publish listing'}
          </button>
        </div>
        <p className="muted" style={{ marginBottom: 22 }}>{org.name} · {branches.length} branch{branches.length > 1 ? 'es' : ''}</p>
        {msg && <div className="ok">{msg}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, alignItems: 'start' }}>
          {/* Profile summary */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800 }}>Profile &amp; about</h3>
              <button className="editlink" onClick={() => setDrawer('profile')}>Edit</button>
            </div>
            <div style={{ fontWeight: 700 }}>{c.name} <span className="pill">{c.denomination}</span></div>
            <p className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>{c.about || 'No description yet.'}</p>
          </div>

          <div>
            {/* Services */}
            <div className="card" style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800 }}>Service times</h3>
                <button className="editlink" onClick={() => setDrawer('services')}>Edit</button>
              </div>
              {c.church_services?.length ? [...c.church_services].sort((a,b)=>a.display_order-b.display_order).map((s) => (
                <div key={s.id} style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--ek-border)' }}>
                  <b>{s.day}</b> · {s.name} · {[s.start_time, s.end_time].filter(Boolean).join('–')} <span className="pill">{s.format}</span>
                </div>
              )) : <p className="muted">None yet.</p>}
            </div>

            {/* Pastor / leaders */}
            <div className="card" style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800 }}>Pastor &amp; leaders</h3>
                <button className="editlink" onClick={() => setDrawer('leader')}>Manage</button>
              </div>
              {c.leaders?.length ? c.leaders.map((l) => (
                <div key={l.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: l.photo_url ? `center/cover url(${l.photo_url})` : 'var(--ek-grad)' }} />
                  <div><div style={{ fontWeight: 700, fontSize: 13 }}>{l.name}</div><div className="muted" style={{ fontSize: 11 }}>{l.role}</div></div>
                </div>
              )) : <p className="muted">No leaders yet.</p>}
            </div>

            {/* Teams */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800 }}>Teams ({c.teams?.length || 0})</h3>
                <button className="editlink" onClick={() => setDrawer('team')}>Manage</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {c.teams?.map((t) => <span key={t.id} className="pill">{t.name}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {drawer === 'profile' && <ProfileDrawer c={c} supabase={supabase} onClose={() => setDrawer(null)} onSaved={(u: Partial<ChurchFull>) => { setC({ ...c, ...u }); setDrawer(null); flash('Saved — live now.'); }} />}
      {drawer === 'services' && <ServicesDrawer c={c} supabase={supabase} onClose={() => setDrawer(null)} onSaved={async () => { await reload(); setDrawer(null); flash('Service times updated.'); }} />}
      {drawer === 'leader' && <LeadersDrawer c={c} supabase={supabase} onClose={() => setDrawer(null)} onChanged={reload} />}
      {drawer === 'team' && <TeamsDrawer c={c} supabase={supabase} onClose={() => setDrawer(null)} onChanged={reload} />}
    </>
  );
}

/* ---------- Profile ---------- */
function ProfileDrawer({ c, supabase, onClose, onSaved }: any) {
  const [name, setName] = useState(c.name);
  const [denom, setDenom] = useState(c.denomination || '');
  const [about, setAbout] = useState(c.about || '');
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    try { const u = await updateChurch(supabase, c.id, { name, denomination: denom, about }); onSaved(u); }
    finally { setBusy(false); }
  }
  return (
    <Drawer title="Profile & about" onClose={onClose} onSave={save} busy={busy}>
      <div className="field"><label>Church name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="field"><label>Denomination</label><select value={denom} onChange={(e) => setDenom(e.target.value)}>{DENOMS.map((d) => <option key={d}>{d}</option>)}</select></div>
      <div className="field"><label>About</label><textarea rows={6} value={about} onChange={(e) => setAbout(e.target.value)} /></div>
    </Drawer>
  );
}

/* ---------- Services ---------- */
function ServicesDrawer({ c, supabase, onClose, onSaved }: any) {
  const [rows, setRows] = useState<DraftService[]>(
    (c.church_services || []).sort((a: ChurchService, b: ChurchService) => a.display_order - b.display_order)
      .map((s: ChurchService) => ({ day: s.day, name: s.name, start_time: s.start_time || '', end_time: s.end_time || '', format: s.format })),
  );
  const [busy, setBusy] = useState(false);
  const set = (i: number, k: keyof DraftService, v: string) => setRows(rows.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const add = () => setRows([...rows, { day: 'Sunday', name: '', start_time: '', end_time: '', format: 'In-Person' }]);
  const remove = (i: number) => setRows(rows.filter((_, j) => j !== i));
  async function save() {
    setBusy(true);
    try { await replaceServices(supabase, c.id, rows.filter((r) => r.name && r.day)); await onSaved(); }
    finally { setBusy(false); }
  }
  return (
    <Drawer title="Service times" onClose={onClose} onSave={save} busy={busy}>
      {rows.map((s, i) => (
        <div className="row-card" key={i}>
          <button className="rm" onClick={() => remove(i)}>✕</button>
          <div className="field" style={{ marginBottom: 10 }}><label>Service name</label>
            <input value={s.name} onChange={(e) => set(i, 'name', e.target.value)} placeholder="e.g. Main Service" /></div>
          <div className="two">
            <div className="field" style={{ margin: 0 }}><label>Day</label>
              <select value={s.day} onChange={(e) => set(i, 'day', e.target.value)}>{DAYS.map((d) => <option key={d}>{d}</option>)}</select></div>
            <div className="field" style={{ margin: 0 }}><label>Format</label>
              <select value={s.format} onChange={(e) => set(i, 'format', e.target.value)}>{FORMATS.map((f) => <option key={f}>{f}</option>)}</select></div>
            <div className="field" style={{ margin: '10px 0 0' }}><label>From</label>
              <input value={s.start_time} onChange={(e) => set(i, 'start_time', e.target.value)} placeholder="10:30 AM" /></div>
            <div className="field" style={{ margin: '10px 0 0' }}><label>To</label>
              <input value={s.end_time} onChange={(e) => set(i, 'end_time', e.target.value)} placeholder="12:30 PM" /></div>
          </div>
        </div>
      ))}
      <button className="addbtn" onClick={add}>+ Add another service</button>
    </Drawer>
  );
}

/* ---------- Leaders ---------- */
function LeadersDrawer({ c, supabase, onClose, onChanged }: any) {
  const [editing, setEditing] = useState<Partial<Leader> | null>(null);
  if (editing) return <LeaderForm c={c} supabase={supabase} leader={editing} onClose={() => setEditing(null)} onChanged={onChanged} />;
  return (
    <Drawer title="Pastor & leaders" onClose={onClose} hideSave>
      {c.leaders?.map((l: Leader) => (
        <div className="row-card" key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }} onClick={() => setEditing(l)}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: l.photo_url ? `center/cover url(${l.photo_url})` : 'var(--ek-grad)' }} />
          <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{l.name}{l.is_lead && <span className="pill" style={{ marginLeft: 6 }}>Lead</span>}</div><div className="muted" style={{ fontSize: 12 }}>{l.role}</div></div>
          <span className="editlink">Edit</span>
        </div>
      ))}
      <button className="addbtn" onClick={() => setEditing({ name: '', role: '', bio: '', is_lead: (c.leaders?.length ?? 0) === 0 })}>+ Add a leader</button>
    </Drawer>
  );
}
function LeaderForm({ c, supabase, leader, onClose, onChanged }: any) {
  const [name, setName] = useState(leader.name || '');
  const [role, setRole] = useState(leader.role || '');
  const [bio, setBio] = useState(leader.bio || '');
  const [photo, setPhoto] = useState<string>(leader.photo_url || '');
  const [busy, setBusy] = useState(false);
  async function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await uploadImage(supabase, c.id, 'leader', f);
    setPhoto(url);
  }
  async function save() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await upsertLeader(supabase, c.id, { id: leader.id, name, role, bio, photo_url: photo, is_lead: !!leader.is_lead });
      await onChanged(); onClose();
    } finally { setBusy(false); }
  }
  async function remove() {
    if (!leader.id) return onClose();
    await deleteLeader(supabase, leader.id); await onChanged(); onClose();
  }
  return (
    <Drawer title={leader.id ? 'Edit leader' : 'Add a leader'} onClose={onClose} onSave={save} busy={busy}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div className="avatar-up" style={photo ? { backgroundImage: `url(${photo})` } : undefined}>{photo ? '' : (name ? name[0] : '👤')}</div>
        <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>Upload photo
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={pickPhoto} /></label>
      </div>
      <div className="field"><label>Full name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pastor David Mensah" /></div>
      <div className="field"><label>Role / title</label><input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Senior Pastor" /></div>
      <div className="field"><label>Short bio</label><textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} /></div>
      {leader.id && !leader.is_lead && <button onClick={remove} style={{ width: '100%', background: '#fef2f2', color: '#dc2626', fontWeight: 700, padding: 11, borderRadius: 11 }}>Remove this leader</button>}
    </Drawer>
  );
}

/* ---------- Teams ---------- */
function TeamsDrawer({ c, supabase, onClose, onChanged }: any) {
  const [editing, setEditing] = useState<Partial<Team> | null>(null);
  if (editing) return <TeamForm c={c} supabase={supabase} team={editing} onClose={() => setEditing(null)} onChanged={onChanged} />;
  return (
    <Drawer title="Ministry teams" onClose={onClose} hideSave>
      {c.teams?.map((t: Team) => (
        <div className="row-card" key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }} onClick={() => setEditing(t)}>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</div><div className="muted" style={{ fontSize: 12 }}>{t.lead_name ? `Led by ${t.lead_name} · ` : ''}{t.member_count} members{t.open_to_join ? ' · Open to join' : ''}</div></div>
          <span className="editlink">Edit</span>
        </div>
      ))}
      <button className="addbtn" onClick={() => setEditing({ name: '', lead_name: '', member_count: 0, open_to_join: true })}>+ Add a team</button>
    </Drawer>
  );
}
function TeamForm({ c, supabase, team, onClose, onChanged }: any) {
  const [name, setName] = useState(team.name || '');
  const [leadName, setLeadName] = useState(team.lead_name || '');
  const [members, setMembers] = useState(String(team.member_count ?? 0));
  const [open, setOpen] = useState(!!team.open_to_join);
  const [busy, setBusy] = useState(false);
  async function save() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await upsertTeam(supabase, c.id, { id: team.id, name, lead_name: leadName, member_count: parseInt(members) || 0, open_to_join: open });
      await onChanged(); onClose();
    } finally { setBusy(false); }
  }
  async function remove() {
    if (!team.id) return onClose();
    await deleteTeam(supabase, team.id); await onChanged(); onClose();
  }
  return (
    <Drawer title={team.id ? 'Edit team' : 'Add a team'} onClose={onClose} onSave={save} busy={busy}>
      <div className="field"><label>Team name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Praise & Worship" /></div>
      <div className="field"><label>Team lead</label><input value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="e.g. Ruth Bello" /></div>
      <div className="field"><label>Members</label><input type="number" value={members} onChange={(e) => setMembers(e.target.value)} /></div>
      <div className="field"><label><input type="checkbox" checked={open} onChange={(e) => setOpen(e.target.checked)} style={{ width: 'auto', marginRight: 8 }} />Open to join (shows a join button on your listing)</label></div>
      {team.id && <button onClick={remove} style={{ width: '100%', background: '#fef2f2', color: '#dc2626', fontWeight: 700, padding: 11, borderRadius: 11 }}>Remove this team</button>}
    </Drawer>
  );
}

/* ---------- Drawer shell ---------- */
function Drawer({ title, children, onClose, onSave, busy, hideSave }: any) {
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer-head"><h3>{title}</h3><button className="xbtn" onClick={onClose}>✕</button></div>
        <div className="drawer-body">{children}</div>
        {!hideSave && (
          <div className="drawer-foot">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={onSave} disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
          </div>
        )}
      </aside>
    </>
  );
}
