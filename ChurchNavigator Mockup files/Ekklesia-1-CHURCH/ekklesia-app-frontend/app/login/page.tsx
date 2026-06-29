'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setMsg(''); setBusy(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password, options: { data: { full_name: name } },
        });
        if (error) throw error;
        // If email confirmation is OFF, a session exists → go to onboarding.
        const { data: { session } } = await supabase.auth.getSession();
        if (session) router.push('/onboarding');
        else setMsg('Check your email to confirm your account, then sign in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (e: any) {
      setErr(e.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ width: 400, maxWidth: '100%' }}>
        <Link href="/" className="brand" style={{ marginBottom: 18 }}><span className="mark">✝</span> Ekklesia</Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '14px 0 4px' }}>
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="muted" style={{ marginBottom: 20 }}>
          {mode === 'signin' ? 'Sign in to manage your church.' : 'List and manage your church on Ekklesia.'}
        </p>

        {err && <div className="error">{err}</div>}
        {msg && <div className="ok">{msg}</div>}

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <div className="field">
              <label>Your name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pastor David" />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@church.org" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
          {mode === 'signin' ? "New here? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErr(''); setMsg(''); }}
            style={{ background: 'none', color: 'var(--ek-purple-dark)', fontWeight: 700 }}
          >
            {mode === 'signin' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
