'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createOrganization, createChurch, getMyOrg } from '@/lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [orgName, setOrgName] = useState('');
  const [denom, setDenom] = useState('Pentecostal');
  const [city, setCity] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      // re-use an org if one already exists for this user
      let org = await getMyOrg(supabase);
      if (!org) org = await createOrganization(supabase, orgName);

      await createChurch(supabase, org.id, {
        name: orgName,
        denomination: denom,
        city,
        country: 'United Kingdom',
        is_hq: true,
        status: 'draft',
      });
      router.push('/dashboard');
    } catch (e: any) {
      setErr(e.message || 'Could not create your church');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ width: 460, maxWidth: '100%' }}>
        <span className="pill" style={{ marginBottom: 12, display: 'inline-block' }}>Step 1 of 1</span>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Add your church</h1>
        <p className="muted" style={{ marginBottom: 20 }}>The essentials now — you can complete the rest in your dashboard.</p>

        {err && <div className="error">{err}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>Church name</label>
            <input required value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. Grace Chapel International" />
          </div>
          <div className="field">
            <label>Denomination</label>
            <select value={denom} onChange={(e) => setDenom(e.target.value)}>
              {['Pentecostal','Baptist','Catholic','Anglican','Methodist','Non-Denominational','Orthodox','Other'].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="field">
            <label>City / town</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Ilford" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
            {busy ? 'Creating…' : 'Create my church →'}
          </button>
        </form>
      </div>
    </div>
  );
}
