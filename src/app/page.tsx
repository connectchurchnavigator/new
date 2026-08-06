import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase-admin';
import TopNav from '@/components/layout/TopNav';

export default async function Home() {
  const supabase = createAdminClient();
  
  const { data: churches } = await supabase
    .from('churches')
    .select('id, slug, name, city, denomination, is_verified, cover_url, logo_url')
    .eq('status', 'published')
    .limit(20);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Top Navbar */}
      <TopNav />

      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e0a4a, #2d1b6e)', color: '#fff', padding: '60px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>
          Find a Church Near You
        </h1>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto 24px' }}>
          Browse verified churches, service times, leadership, and ministries across the UK and beyond.
        </p>
      </div>

      {/* Directory Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Browse Churches</h2>
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>{churches?.length || 0} listings found</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {(churches || []).map((c) => (
            <Link key={c.id} href={`/church/${c.slug}`} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ height: '140px', background: c.cover_url ? `url(${c.cover_url}) center/cover` : 'linear-gradient(135deg, #a855f7, #ec4899)', position: 'relative' }}>
                {c.is_verified && (
                  <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(22,163,74,0.9)', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' }}>
                    Verified
                  </span>
                )}
              </div>
              <div style={{ padding: '18px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>{c.name}</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {c.denomination && (
                    <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                      {c.denomination}
                    </span>
                  )}
                  {c.city && (
                    <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                      📍 {c.city}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: '#a855f7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View full profile &rarr;
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
