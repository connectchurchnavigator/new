import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getChurchBySlug } from '@/lib/api';
import type { ChurchFull } from '@/lib/types';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const supabase = createClient();
    const c = await getChurchBySlug(supabase, params.slug);
    return { title: `${c.name} — Ekklesia`, description: c.about?.slice(0, 150) };
  } catch {
    return { title: 'Church — Ekklesia' };
  }
}

export default async function ChurchPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  let c: ChurchFull;
  try {
    c = await getChurchBySlug(supabase, params.slug);
  } catch {
    notFound();
  }

  const lead = c.leaders?.find((l) => l.is_lead) || c.leaders?.[0];
  const others = c.leaders?.filter((l) => !l.is_lead) || [];

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card" style={{ marginBottom: 18 }}>
      <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--ek-purple-dark)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 14 }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <>
      <nav className="topnav">
        <div className="wrap">
          <Link href="/" className="brand"><span className="mark">✝</span> Ekklesia</Link>
        </div>
      </nav>

      <div style={{ height: 180, background: c.cover_url ? `center/cover url(${c.cover_url})` : 'var(--ek-grad)' }} />
      <div className="wrap" style={{ marginTop: -40, paddingBottom: 60 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 22 }}>
          <div style={{ width: 88, height: 88, borderRadius: 22, background: c.logo_url ? `center/cover url(${c.logo_url})` : 'var(--ek-grad)', border: '4px solid #fff', flexShrink: 0 }} />
          <div style={{ paddingBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' }}>{c.name}</h1>
              {c.denomination && <span className="pill">{c.denomination}</span>}
              {c.is_verified && <span className="pill" style={{ background: '#f0fdf4', color: '#15803d' }}>Verified</span>}
            </div>
            <div className="muted" style={{ marginTop: 5 }}>
              📍 {c.formatted_address || [c.address_line, c.city, c.postcode, c.country].filter(Boolean).join(', ')}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18, alignItems: 'start' }}>
          <div>
            {c.about && <Section title="About"><p style={{ lineHeight: 1.7, fontSize: 14 }}>{c.about}</p></Section>}

            {c.church_services?.length > 0 && (
              <Section title="Service times">
                {c.church_services.sort((a, b) => a.display_order - b.display_order).map((s) => (
                  <div key={s.id} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--ek-border)' }}>
                    <b style={{ minWidth: 96 }}>{s.day}</b>
                    <span style={{ flex: 1 }}>{s.name}</span>
                    <span className="muted">{[s.start_time, s.end_time].filter(Boolean).join(' – ')}</span>
                    <span className="pill">{s.format}</span>
                  </div>
                ))}
              </Section>
            )}

            {lead && (
              <Section title="Leadership">
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: others.length ? 14 : 0 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 15, background: lead.photo_url ? `center/cover url(${lead.photo_url})` : 'var(--ek-grad)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 800 }}>{lead.name}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ek-purple-dark)' }}>{lead.role}</div>
                    {lead.bio && <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{lead.bio}</div>}
                  </div>
                </div>
                {others.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
                    {others.map((l) => (
                      <div key={l.id} style={{ textAlign: 'center', border: '1px solid var(--ek-border)', borderRadius: 13, padding: 13 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 12, background: l.photo_url ? `center/cover url(${l.photo_url})` : 'var(--ek-grad)', margin: '0 auto 8px' }} />
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{l.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--ek-purple-dark)', fontWeight: 600 }}>{l.role}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            )}

            {c.teams?.length > 0 && (
              <Section title="Teams & ministries you can join">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
                  {c.teams.sort((a, b) => a.display_order - b.display_order).map((t) => (
                    <div key={t.id} style={{ border: '1px solid var(--ek-border)', borderRadius: 13, padding: 13 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</div>
                      <div style={{ fontSize: 11, marginTop: 2, color: t.open_to_join ? '#15803d' : 'var(--ek-gray)' }}>
                        {t.open_to_join ? 'Open to join' : 'Serving team'}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {c.ministries?.length > 0 && (
              <Section title="Ministries & outreach">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {c.ministries.map((m) => <span key={m} className="pill">{m}</span>)}
                </div>
              </Section>
            )}
          </div>

          <div>
            <Section title="Contact">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 14 }}>
                {c.email && <div>✉️ {c.email}</div>}
                {c.phone && <div>📞 {c.phone}</div>}
                {c.website && <a href={`https://${c.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer">🌐 {c.website}</a>}
                {c.facebook && <a href={`https://${c.facebook}`} target="_blank" rel="noreferrer">Facebook</a>}
                {c.instagram && <a href={`https://${c.instagram}`} target="_blank" rel="noreferrer">Instagram</a>}
                {c.youtube && <a href={`https://${c.youtube}`} target="_blank" rel="noreferrer">YouTube</a>}
              </div>
            </Section>
            {c.languages?.length > 0 && (
              <Section title="Languages">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {c.languages.map((l) => <span key={l} className="pill">{l}</span>)}
                </div>
              </Section>
            )}
            {c.facilities?.length > 0 && (
              <Section title="Facilities">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {c.facilities.map((f) => <span key={f} className="pill" style={{ background: '#f0fdf4', color: '#15803d' }}>{f}</span>)}
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
