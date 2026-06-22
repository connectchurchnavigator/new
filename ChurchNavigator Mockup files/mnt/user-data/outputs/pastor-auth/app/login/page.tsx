'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function PastorLogin() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        const { data: { session } } = await supabase.auth.getSession();
        // If email confirmation is OFF you'll have a session → go create the profile.
        if (session) router.push('/onboarding/pastor');
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
    <div className="min-h-screen flex items-center justify-center bg-surface px-5">
      <div className="bg-white border border-border rounded-2xl p-7 w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg mb-5">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-coral to-purple flex items-center justify-center text-white">
            <i className="ti ti-cross text-base" />
          </span>
          Ekklesia
        </Link>
        <h1 className="text-2xl font-extrabold text-ink mb-1">
          {mode === 'signin' ? 'Pastor sign in' : 'Create your pastor account'}
        </h1>
        <p className="text-sm text-gray mb-5">
          {mode === 'signin'
            ? 'Sign in to manage your profile, enquiries and sermons.'
            : 'Set up your professional ministry profile on Ekklesia.'}
        </p>

        {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-3">{err}</div>}
        {msg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2 mb-3">{msg}</div>}

        <form onSubmit={submit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold mb-1.5">Your name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pastor James Okafor"
                className="w-full text-sm px-3 py-2.5 border border-border rounded-xl outline-none focus:border-purple" />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold mb-1.5">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@ministry.org"
              className="w-full text-sm px-3 py-2.5 border border-border rounded-xl outline-none focus:border-purple" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5">Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full text-sm px-3 py-2.5 border border-border rounded-xl outline-none focus:border-purple" />
          </div>
          <button disabled={busy}
            className="w-full bg-gradient-to-br from-coral to-purple text-white font-bold text-sm py-3 rounded-xl">
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-gray mt-4 text-center">
          {mode === 'signin' ? 'New here? ' : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErr(''); setMsg(''); }}
            className="font-bold text-purple-dark">
            {mode === 'signin' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
