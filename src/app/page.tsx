import Link from 'next/link';
import { createServerSupabaseClient as createClient } from '@/lib/supabase-server';
import { getHomeChurches, searchChurches } from '@/lib/api';
import type { Church } from '@/lib/types';

export default async function Home({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createClient();
  const q = searchParams.q?.trim() || '';
  let churches: Church[] = [];
  try {
    churches = q
      ? await searchChurches(supabase, { q, limit: 24 })
      : await getHomeChurches(supabase, 12);
  } catch {
    churches = [];
  }

  return (
    <>
      <nav className="topnav">
        <div className="wrap">
          <Link href="/" className="brand">
            <span className="mark">✝</span> Ekklesia
          </Link>
          <div style={{ flex: 1 }} />
          <Link href="/login" className="btn btn-ghost">Church login</Link>
        </div>
      </nav>

      {/* hero */}
      <section style={{ background: 'var(--ek-grad)', color: '#fff', padding: '64px 0 72px' }}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 12 }}>
            Find a church near you
          </h1>
          <p style={{ fontSize: 17, opacity: 0.92, marginBottom: 28 }}>
            Service times, ministries, languages and community — all in one place.
          </p>
          <form action="/" method="get" style={{ display: 'flex', gap: 10, maxWidth: 560, margin: '0 auto' }}>
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name, city, or denomination…"
              style={{
                flex: 1, fontSize: 15, padding: '14px 18px', borderRadius: 14,
                border: 'none', outline: 'none', color: 'var(--ek-ink)',
              }}
            />
            <button className="btn" style={{ background: '#fff', color: 'var(--ek-purple-dark)' }}>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* results */}
      <section className="wrap" style={{ padding: '40px 20px 80px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 18 }}>
          {q ? `Results for “${q}”` : 'Recently added churches'}
        </h2>

        {churches.length === 0 ? (
          <p className="muted">
            {q ? 'No churches found. Try a different search.' : 'No churches yet — be the first to add one.'}
          </p>
        ) : (
          <div className="grid-churches">
            {churches.map((c) => (
              <Link key={c.id} href={`/church/${c.slug}`} className="church-card">
                <div className="cover" style={c.cover_url ? { backgroundImage: `url(${c.cover_url})`, backgroundSize: 'cover' } : undefined} />
                <div className="body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <strong style={{ fontSize: 16 }}>{c.name}</strong>
                    {c.is_verified && <span className="pill">Verified</span>}
                  </div>
                  {c.denomination && <span className="pill">{c.denomination}</span>}
                  <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                    📍 {[c.city, c.postcode].filter(Boolean).join(', ')}
                  </div>
                  {c.languages?.length > 0 && (
                    <div className="muted" style={{ marginTop: 4, fontSize: 12 }}>
                      {c.languages.slice(0, 3).join(' · ')}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
