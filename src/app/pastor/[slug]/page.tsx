import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase-admin';
import type { PastorProfile, PastorTag } from '@/lib/pastor';
import { HeroSliderProvider, HeroSlide } from '@/components/HeroSlider';
import { ProfileTabs } from '@/components/ProfileTabs';
import { EnquiryForm } from '@/components/EnquiryForm';
import ClientTabs from '@/components/church-profile/ClientTabs';
import HeroCarousel from '@/components/church-profile/HeroCarousel';
import ShareButton from '@/components/church-profile/ShareButton';
import TopNav from '@/components/layout/TopNav';
import ContactSection from '@/components/church-profile/ContactSection';
import '@/app/church/[slug]/church.css';
import './pastor.css';

export const revalidate = 0; // Live updates without cached delay

async function getPastor(slug: string): Promise<PastorProfile | null> {
  const supabase = createAdminClient();

  const { data: pastor } = await supabase
    .from('pastors')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (!pastor) return null;

  const [languagesRes, tagsRes, educationRes, timelineRes, sermonsRes, eventsRes, galleryRes, affiliationsRes, awardsRes, reviewsRes] =
    await Promise.all([
      supabase.from('pastor_languages').select('language').eq('pastor_id', pastor.id),
      supabase.from('pastor_tags').select('*').eq('pastor_id', pastor.id),
      supabase.from('pastor_education').select('*').eq('pastor_id', pastor.id).order('sort_order'),
      supabase.from('pastor_timeline').select('*').eq('pastor_id', pastor.id).order('sort_order'),
      supabase.from('pastor_sermons').select('*').eq('pastor_id', pastor.id).order('sort_order'),
      supabase.from('pastor_events').select('*').eq('pastor_id', pastor.id).order('event_date'),
      supabase.from('pastor_gallery').select('*').eq('pastor_id', pastor.id).order('sort_order'),
      supabase.from('pastor_affiliations').select('*').eq('pastor_id', pastor.id).order('sort_order'),
      supabase.from('pastor_awards').select('*').eq('pastor_id', pastor.id).order('sort_order'),
      supabase.from('pastor_reviews').select('*').eq('pastor_id', pastor.id).order('created_at', { ascending: false }),
    ]);

  const reviews = reviewsRes.data ?? [];
  const averageRating =
    reviews.length > 0 ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : null;

  // Fire-and-forget view increment
  supabase
    .from('pastors')
    .update({ view_count: (pastor.view_count || 0) + 1 })
    .eq('id', pastor.id)
    .then(() => { });

  return {
    ...pastor,
    languages: (languagesRes.data ?? []).map((r) => r.language),
    tags: tagsRes.data ?? [],
    education: educationRes.data ?? [],
    timeline: timelineRes.data ?? [],
    sermons: sermonsRes.data ?? [],
    events: eventsRes.data ?? [],
    gallery: galleryRes.data ?? [],
    affiliations: affiliationsRes.data ?? [],
    awards: awardsRes.data ?? [],
    reviews,
    average_rating: averageRating,
  };
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const pastor = await getPastor(params.slug);
  if (!pastor) return { title: 'Pastor not found — Ekklesia' };
  return {
    title: `${pastor.full_name} — Ekklesia`,
    description: pastor.bio?.slice(0, 160) ?? `${pastor.full_name}'s profile on Ekklesia`,
  };
}

function fmtK(n: number | null | undefined): string {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

export default async function PastorProfilePage(props: {
  params: Promise<{ slug: string }> | { slug: string };
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
  const params = await props.params;
  const pastor = await getPastor(params.slug);
  if (!pastor) notFound();

  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};
  const isOwner = resolvedSearchParams.owner === 'true';

  const firstName = pastor.full_name.split(' ').find((w) => !/^(pastor|rev\.?|dr\.?)$/i.test(w)) ?? pastor.full_name;
  const preachingTags = pastor.tags.filter((t) => t.category === 'preaching');
  const ministryTags = pastor.tags.filter((t) => t.category === 'ministry_area');
  const availableForTags = pastor.tags.filter((t) => t.category === 'available_for');

  const coverUrls = pastor.cover_photo_urls?.length > 0 
    ? pastor.cover_photo_urls 
    : (pastor.gallery.length > 0 ? pastor.gallery.map(g => g.image_url) : []);

  return (
    <>
      {isOwner && <div style={{ height: '48px', width: '100%' }} />}

      {/* ===== NAV ===== */}
      <TopNav />

      <main id="detail" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
          <Link className="back" href="/pastors" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            All pastors
          </Link>
          <div style={{ display: 'flex', gap: '12px' }}>
            {isOwner && (
              <Link href="/dashboard" style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', textDecoration: 'none' }}>
                <i className="ti ti-chart-bar"></i> Pastor Dashboard
              </Link>
            )}
            <Link href={`/pastor/${pastor.slug}${isOwner ? '' : '?owner=true'}`} scroll={false} style={{ textDecoration: 'none', background: isOwner ? '#7e22ce' : '#f3e8ff', color: isOwner ? '#fff' : '#7e22ce', border: '1px solid #e9d5ff', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              Owner View {isOwner ? 'ON' : 'OFF'}
            </Link>
          </div>
        </div>

        <div className="wrap" style={{ paddingTop: '14px' }}>
          <div className="hero" id="hero" style={{ borderRadius: '24px', position: 'relative', overflow: 'hidden', minHeight: '460px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px' }}>

            <HeroCarousel coverUrls={coverUrls} />

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '84px', height: '84px', borderRadius: '22px', border: '3px solid rgba(255,255,255,0.85)', overflow: 'hidden', background: 'linear-gradient(135deg, #f43f5e 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '32px', fontWeight: 800, boxShadow: '0 10px 30px -12px rgba(0,0,0,0.6)', flexShrink: 0 }}>
                {pastor.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pastor.avatar_url} alt={pastor.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  pastor.initials
                )}
              </div>

              <h1 style={{ color: '#fff', fontSize: '56px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.03em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                {pastor.full_name}
              </h1>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {pastor.title && (
                  <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="ti ti-sparkles"></i> {pastor.title}
                  </span>
                )}
                {pastor.city && (
                  <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="ti ti-map-pin"></i> {pastor.city}, {pastor.country}
                  </span>
                )}
                {pastor.years_in_ministry && (
                  <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {pastor.years_in_ministry}+ Years Ministry
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '14px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <EnquiryForm
                    pastorSlug={pastor.slug}
                    pastorFirstName={firstName}
                    trigger={
                      <button style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#a855f7', color: '#fff', padding: '12px 24px', borderRadius: '30px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)' }}>
                        <i className="ti ti-send" style={{ fontSize: '18px' }}></i> Send enquiry
                      </button>
                    }
                  />
                  {pastor.youtube_url && (
                    <a href={pastor.youtube_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ef4444', color: '#fff', textDecoration: 'none', padding: '12px 24px', borderRadius: '30px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}>
                      <i className="ti ti-brand-youtube" style={{ fontSize: '18px' }}></i> Watch sermon
                    </a>
                  )}
                  <ShareButton title={pastor.full_name} />
                  {isOwner && (
                    <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fbbf24', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '30px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)', textDecoration: 'none' }}>
                      <i className="ti ti-pencil" style={{ fontSize: '18px' }}></i> Edit profile
                    </Link>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {pastor.instagram_url && (
                      <a href={pastor.instagram_url} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e1306c', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                        <i className="ti ti-brand-instagram"></i>
                      </a>
                    )}
                    {pastor.facebook_url && (
                      <a href={pastor.facebook_url} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1877f2', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                        <i className="ti ti-brand-facebook"></i>
                      </a>
                    )}
                    {pastor.youtube_url && (
                      <a href={pastor.youtube_url} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                        <i className="ti ti-brand-youtube"></i>
                      </a>
                    )}
                    {pastor.twitter_url && (
                      <a href={pastor.twitter_url} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                        <i className="ti ti-brand-x"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS STRIP - DYNAMIC FROM BACKEND */}
        {(pastor.years_in_ministry || pastor.churches_planted || pastor.nations_reached || pastor.youtube_subscribers || pastor.events_spoken || pastor.languages.length > 0 || pastor.sermons.length > 0) && (
          <div style={{ background: '#fff' }}>
            <div className="pastor-wrap">
              <div className="stats-strip" style={{ gridTemplateColumns: `repeat(${[pastor.years_in_ministry, pastor.churches_planted, pastor.nations_reached, pastor.youtube_subscribers, pastor.events_spoken, pastor.languages.length > 0, pastor.sermons.length > 0].filter(Boolean).length}, 1fr)` }}>
                {pastor.years_in_ministry && (
                  <div className="stat-cell">
                    <div className="v">{pastor.years_in_ministry}+</div>
                    <div className="l">Years ministry</div>
                  </div>
                )}
                {pastor.churches_planted && (
                  <div className="stat-cell">
                    <div className="v">{pastor.churches_planted}</div>
                    <div className="l">Churches planted</div>
                  </div>
                )}
                {pastor.nations_reached && (
                  <div className="stat-cell">
                    <div className="v">{pastor.nations_reached}+</div>
                    <div className="l">Nations reached</div>
                  </div>
                )}
                {pastor.languages.length > 0 && (
                  <div className="stat-cell">
                    <div className="v">{pastor.languages.length}</div>
                    <div className="l">{pastor.languages.length === 1 ? 'Language' : 'Languages'}</div>
                  </div>
                )}
                {pastor.sermons.length > 0 && (
                  <div className="stat-cell">
                    <div className="v">{pastor.sermons.length}</div>
                    <div className="l">Total Sermons</div>
                  </div>
                )}
                {pastor.youtube_subscribers && (
                  <div className="stat-cell">
                    <div className="v">{fmtK(pastor.youtube_subscribers)}</div>
                    <div className="l">YouTube subs</div>
                  </div>
                )}
                {pastor.events_spoken && (
                  <div className="stat-cell">
                    <div className="v">{pastor.events_spoken}+</div>
                    <div className="l">Events spoken</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ENQUIRY BANNER - EXACT FROM MOCKUP */}
        <div className="pastor-wrap">
          <div className="enquiry-banner">
            <div>
              <div className="t">Book {pastor.full_name} for your event</div>
              <div className="s">Conferences &middot; Retreats &middot; Sunday services &middot; International &mdash; usually replies within 24 hours</div>
            </div>
            <EnquiryForm
              pastorSlug={pastor.slug}
              pastorFirstName={firstName}
              trigger={
                <button style={{ background: '#fff', color: '#6d28d9', fontWeight: 800, fontSize: '13.5px', padding: '11px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  Send enquiry
                </button>
              }
            />
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div>
          <ProfileTabs
            tabs={[
              { id: 'about', label: 'About', icon: 'ti-user' },
              ...(pastor.sermons.length > 0 ? [{ id: 'sermons', label: 'Sermons', icon: 'ti-player-play' }] : []),
              { id: 'vision', label: 'Vision', icon: 'ti-eye' },
              ...(pastor.education.length > 0 ? [{ id: 'education', label: 'Education', icon: 'ti-school' }] : []),
              ...(pastor.gallery.length > 0 ? [{ id: 'gallery', label: 'Gallery', icon: 'ti-photo' }] : []),
            ]}
            panes={{
              about: <AboutPane pastor={pastor} preachingTags={preachingTags} ministryTags={ministryTags} availableForTags={availableForTags} />,
              ...(pastor.sermons.length > 0 ? { sermons: <SermonsPane pastor={pastor} /> } : {}),
              vision: <VisionPane pastor={pastor} />,
              ...(pastor.education.length > 0 ? { education: <EducationPane pastor={pastor} /> } : {}),
              ...(pastor.gallery.length > 0 ? { gallery: <GalleryPane pastor={pastor} /> } : {}),
            }}
            sidebar={<Sidebar pastor={pastor} />}
          />
        </div>

        <div className="wrap">
          <ContactSection
            churchName={pastor.full_name}
            email={pastor.email || undefined}
            phone={pastor.phone || undefined}
            address={pastor.city ? `${pastor.city}, ${pastor.country}` : undefined}
            socials={{
              facebook: pastor.facebook_url || undefined,
              instagram: pastor.instagram_url || undefined,
              youtube: pastor.youtube_url || undefined,
              twitter: pastor.twitter_url || undefined
            }}
          />
        </div>
      </main>
    </>
  );
}

/* ───────────────────────── helper components ───────────────────────── */

function SocialPill({ href, icon, bg, count }: { href: string; icon: string; bg: string; count: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-[#16161f] border-[1.5px] border-white/10 rounded-full pl-1.5 pr-4 py-1.5 inline-flex items-center gap-2"
    >
      <div className={`w-[30px] h-[30px] rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
        <i className={`ti ${icon} text-[15px] text-white`} />
      </div>
      <span className="text-sm font-extrabold text-white">{count}</span>
    </a>
  );
}

function SecCard({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border-[1.5px] border-border rounded-[20px] p-7 md:p-[30px] mb-4 shadow-sm">{children}</div>;
}

function SecTitle({ icon, gradient, children }: { icon: string; gradient: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${gradient}`}>
        <i className={`ti ${icon} text-xl text-white`} />
      </div>
      <h2 className="text-[22px] font-extrabold text-ink">{children}</h2>
    </div>
  );
}

function AboutPane({
  pastor,
  preachingTags,
  ministryTags,
  availableForTags,
}: {
  pastor: PastorProfile;
  preachingTags: PastorTag[];
  ministryTags: PastorTag[];
  availableForTags: PastorTag[];
}) {
  return (
    <div>
      {pastor.bio && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic"><i className="ti ti-user"></i></div>
            <h3>Biography</h3>
          </div>
          <div className="bio">
            <p>{pastor.bio}</p>
          </div>
        </div>
      )}

      {preachingTags.length > 0 && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic"><i className="ti ti-microphone-2"></i></div>
            <h3>Preaching specialisms</h3>
          </div>
          <div className="pastor-chips">
            {preachingTags.map((t) => (
              <span key={t.id} className="pastor-chip coral">{t.label}</span>
            ))}
          </div>
        </div>
      )}

      {ministryTags.length > 0 && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic"><i className="ti ti-heart-handshake"></i></div>
            <h3>Ministry areas</h3>
          </div>
          <div className="pastor-chips">
            {ministryTags.map((t) => (
              <span key={t.id} className="pastor-chip amber">{t.label}</span>
            ))}
          </div>
        </div>
      )}

      {availableForTags.length > 0 && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic"><i className="ti ti-calendar-event"></i></div>
            <h3>Available for</h3>
          </div>
          <div className="pastor-chips">
            {availableForTags.map((t) => (
              <span key={t.id} className="pastor-chip green">{t.label}</span>
            ))}
          </div>
        </div>
      )}

      {pastor.timeline.length > 0 && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic"><i className="ti ti-timeline"></i></div>
            <h3>Ministry journey</h3>
          </div>
          <div style={{ marginTop: '16px', position: 'relative', paddingLeft: '8px' }}>
            {pastor.timeline.map((entry) => (
              <div key={entry.id} style={{ display: 'flex', gap: '14px', paddingBottom: '18px', position: 'relative' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'linear-gradient(135deg,#f43f5e 0%,#7c3aed 100%)', flexShrink: 0, marginTop: '4px', zIndex: 1 }} />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#6d28d9' }}>{entry.year}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, margin: '1px 0 3px', color: '#0f0f1a' }}>{entry.title}</div>
                  {entry.description && <div style={{ fontSize: '12.5px', color: '#6b7280', lineHeight: 1.55 }}>{entry.description}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Sidebar({ pastor }: { pastor: PastorProfile }) {
  const firstName = pastor.full_name.split(' ').find((w) => !/^(pastor|rev\.?|dr\.?)$/i.test(w)) ?? pastor.full_name;

  return (
    <div className="sticky top-[130px]">
      <div className="contact-dark">
        <h3>Contact {firstName}</h3>
        <div className="s">Responds within 24 hours</div>
        <EnquiryForm
          pastorSlug={pastor.slug}
          pastorFirstName={firstName}
          trigger={
            <button className="enq" style={{ width: '100%' }}>
              Send enquiry
            </button>
          }
        />
        {(() => {
          const availableTags = pastor.tags.filter((t) => t.category === 'available_for');
          if (availableTags.length === 0) return null;
          return (
            <div className="pastor-chips" style={{ marginTop: '14px' }}>
              {availableTags.map((t) => (
                <span key={t.id} className="pastor-chip" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}>
                  {t.label}
                </span>
              ))}
            </div>
          );
        })()}
      </div>

      {pastor.church_name_cache && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic"><i className="ti ti-building-church"></i></div>
            <h3>Churches</h3>
          </div>
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', gap: '13px', alignItems: 'flex-start', border: '1px solid #e9e9ef', borderRadius: '14px', padding: '15px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg,#f43f5e 0%,#7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, flexShrink: 0 }}>
                LC
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f0f1a' }}>{pastor.church_name_cache}</div>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#6d28d9', marginTop: '2px' }}>Senior Pastor & Founder</div>
                {pastor.city && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{pastor.city}</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pastor-card">
        <div className="pastor-card-h">
          <div className="ic"><i className="ti ti-plane"></i></div>
          <h3>Travel &amp; availability</h3>
        </div>
        <div style={{ marginTop: '8px' }}>
          {pastor.city && (
            <div className="spec-row">
              <span className="k">Based in</span>
              <span className="v">{pastor.city}</span>
            </div>
          )}
          {pastor.travel_range && (
            <div className="spec-row">
              <span className="k">Travel range</span>
              <span className="v">{pastor.travel_range}</span>
            </div>
          )}
          {pastor.lead_time && (
            <div className="spec-row">
              <span className="k">Lead time</span>
              <span className="v">{pastor.lead_time}</span>
            </div>
          )}
          <div className="spec-row">
            <span className="k">Availability</span>
            <span className="v" style={{ color: '#15803d', background: '#f0fdf4', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
              {pastor.availability_note || pastor.availability_status}
            </span>
          </div>
          {pastor.languages.length > 0 && (
            <div className="spec-row">
              <span className="k">Languages</span>
              <span className="v">{pastor.languages.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {(pastor.facebook_url || pastor.instagram_url || pastor.youtube_url || pastor.whatsapp_url || pastor.twitter_url || pastor.website_url || (pastor as any).linkedin_url || (pastor as any).tiktok_url) && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic"><i className="ti ti-world"></i></div>
            <h3>Find me online</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '14px' }}>
            {pastor.facebook_url && (
              <a
                href={pastor.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', boxShadow: '0 4px 12px rgba(24, 119, 242, 0.3)' }}
                title="Facebook"
              >
                <i className="ti ti-brand-facebook"></i>
              </a>
            )}
            {pastor.instagram_url && (
              <a
                href={pastor.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', boxShadow: '0 4px 12px rgba(225, 48, 108, 0.3)' }}
                title="Instagram"
              >
                <i className="ti ti-brand-instagram"></i>
              </a>
            )}
            {pastor.youtube_url && (
              <a
                href={pastor.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', boxShadow: '0 4px 12px rgba(255, 0, 0, 0.3)' }}
                title="YouTube"
              >
                <i className="ti ti-brand-youtube"></i>
              </a>
            )}
            {pastor.whatsapp_url && (
              <a
                href={pastor.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)' }}
                title="WhatsApp"
              >
                <i className="ti ti-brand-whatsapp"></i>
              </a>
            )}
            {pastor.twitter_url && (
              <a
                href={pastor.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
                title="X / Twitter"
              >
                <i className="ti ti-brand-x"></i>
              </a>
            )}
            {(pastor as any).linkedin_url && (
              <a
                href={(pastor as any).linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#0a66c2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', boxShadow: '0 4px 12px rgba(10, 102, 194, 0.3)' }}
                title="LinkedIn"
              >
                <i className="ti ti-brand-linkedin"></i>
              </a>
            )}
            {(pastor as any).tiktok_url && (
              <a
                href={(pastor as any).tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
                title="TikTok"
              >
                <i className="ti ti-brand-tiktok"></i>
              </a>
            )}
            {pastor.website_url && (
              <a
                href={pastor.website_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#f43f5e 0%,#7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}
                title="Website"
              >
                <i className="ti ti-world"></i>
              </a>
            )}
          </div>
        </div>
      )}

      {pastor.affiliations.length > 0 && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic"><i className="ti ti-certificate"></i></div>
            <h3>Ministerial affiliation</h3>
          </div>
          <div style={{ marginTop: '8px' }}>
            {pastor.affiliations.map((a) => (
              <div key={a.id} className="list-item">
                <div className="li-mark"><i className="ti ti-building-community"></i></div>
                <div>
                  <div className="li-t">{a.organisation}</div>
                  {a.role && <div className="li-n">{a.role}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pastor.awards.length > 0 && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #7c3aed 100%)' }}>
              <i className="ti ti-award"></i>
            </div>
            <h3>Awards &amp; recognition</h3>
          </div>
          <div style={{ marginTop: '8px' }}>
            {pastor.awards.map((a) => (
              <div key={a.id} className="list-item">
                <div
                  className="li-mark"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    borderRadius: '11px',
                    width: '40px',
                    height: '40px',
                  }}
                >
                  <i className="ti ti-award" style={{ fontSize: '18px', color: '#fff' }}></i>
                </div>
                <div>
                  <div className="li-t">{a.title}</div>
                  <div className="li-n">
                    {[a.issuer, (a as any).year].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-none">
      <span className="text-xs text-gray flex items-center gap-1.5">
        <i className={`ti ${icon} text-[13px] text-purple`} /> {label}
      </span>
      <span className="text-xs font-extrabold text-ink">{value}</span>
    </div>
  );
}

function SermonsPane({ pastor }: { pastor: PastorProfile }) {
  return (
    <div>
      <div className="pastor-card">
        <div className="pastor-card-h">
          <div className="ic"><i className="ti ti-player-play"></i></div>
          <h3>Sermons &amp; messages</h3>
        </div>
        <div style={{ marginTop: '14px' }}>
          {pastor.sermons.length === 0 && (
            <p className="text-sm text-gray" style={{ color: '#6b7280' }}>
              No sermons added yet.
            </p>
          )}
          {pastor.sermons.map((s) => (
            <div key={s.id} className="sermon">
              <div className="thumb">
                <i className="ti ti-player-play-filled"></i>
                {s.duration_min ? <div className="dur">{s.duration_min} min</div> : null}
              </div>
              <div style={{ flex: 1 }}>
                <div className="st">{s.title}</div>
                <div className="sm">
                  {[s.series, s.views ? `${fmtK(s.views)} views` : null].filter(Boolean).join(' · ')}
                </div>
              </div>
              {s.youtube_url && (
                <a
                  href={s.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ background: '#fff', border: '1.5px solid #e9e9ef', color: '#0f0f1a', fontSize: '12.5px', fontWeight: 700, padding: '7px 14px', borderRadius: '10px', height: 'fit-content', alignSelf: 'center' }}
                >
                  <i className="ti ti-player-play" style={{ fontSize: '13px' }}></i> Watch
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisionPane({ pastor }: { pastor: PastorProfile }) {
  const coreValues = (pastor as any).core_values || [];

  return (
    <div>
      <div className="pastor-card">
        <div className="pastor-card-h">
          <div className="ic"><i className="ti ti-eye"></i></div>
          <h3>Vision &amp; Mission</h3>
        </div>

        {pastor.vision_statement && (
          <div className="vision-card">
            <div className="vlabel">VISION STATEMENT</div>
            <div className="vstmt">&quot;{pastor.vision_statement}&quot;</div>
            <div className="vattr">— {pastor.full_name}</div>
          </div>
        )}

        {pastor.availability_status === 'available' && (
          <div className="avail-pill">
            <div className="d"></div>
            <span>Available for ministry</span>
          </div>
        )}

        {coreValues.length > 0 && (
          <div style={{ marginTop: '22px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f0f1a', marginBottom: '12px' }}>Core Values</h4>
            <div className="pastor-chips">
              {coreValues.map((val: string, i: number) => (
                <span key={i} className="pastor-chip purple" style={{ fontSize: '13px', padding: '6px 14px' }}>
                  {val}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EducationPane({ pastor }: { pastor: PastorProfile }) {
  if (pastor.education.length === 0) return null;

  const colors = [
    { bg: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', text: '#6d28d9', icon: 'ti-school' },
    { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', text: '#059669', icon: 'ti-book' },
    { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', text: '#d97706', icon: 'ti-message-dots' },
  ];

  return (
    <div>
      <div className="pastor-card">
        <div className="pastor-card-h">
          <div className="ic"><i className="ti ti-school"></i></div>
          <h3>Education &amp; Training</h3>
        </div>

        <div style={{ marginTop: '14px' }}>
          {pastor.education.map((e, idx) => {
            const style = colors[idx % colors.length];
            return (
              <div key={e.id} className="edu">
                <div className="ei" style={{ background: style.bg }}>
                  <i className={`ti ${style.icon}`}></i>
                </div>
                <div>
                  <div className="et">{e.degree}</div>
                  <div className="eo" style={{ color: style.text }}>{e.institution}</div>
                  <div className="ed">
                    {[e.year_range, e.detail].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EventsPane({ pastor }: { pastor: PastorProfile }) {
  return (
    <div>
      <SecCard>
        <SecTitle icon="ti-calendar-event" gradient="bg-gradient-to-br from-pink-600 to-pink-300">
          Upcoming Events
        </SecTitle>
        {pastor.events.length === 0 && <p className="text-sm text-gray">No upcoming events.</p>}
        {pastor.events.map((e) => {
          const date = new Date(e.event_date);
          return (
            <div key={e.id} className="flex gap-3 items-start py-3.5 border-b border-border last:border-none">
              <div className="min-w-[48px] text-center bg-gradient-to-br from-coral to-purple rounded-xl py-2.5 px-1">
                <div className="text-lg font-extrabold text-white">{date.getDate()}</div>
                <div className="text-[9px] font-extrabold text-white/70 uppercase">
                  {date.toLocaleString('en-GB', { month: 'short' })}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-extrabold text-ink mb-1">{e.title}</div>
                <div className="text-xs text-gray mb-2">
                  {[e.location, e.start_time].filter(Boolean).join(' · ')}
                </div>
                {e.tags.map((tag) => (
                  <span key={tag} className="chip chip-purple text-[11px] py-1 px-2.5">{tag}</span>
                ))}
              </div>
              {e.registration_url && (
                <a
                  href={e.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple text-white rounded-full px-4.5 py-2 text-xs font-bold flex-shrink-0"
                >
                  Register
                </a>
              )}
            </div>
          );
        })}
      </SecCard>
    </div>
  );
}

function GalleryPane({ pastor }: { pastor: PastorProfile }) {
  if (pastor.gallery.length === 0) return null;

  return (
    <div>
      <div className="pastor-card">
        <div className="pastor-card-h">
          <div className="ic"><i className="ti ti-photo"></i></div>
          <h3>Gallery</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '16px' }}>
          {pastor.gallery.map((g) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={g.id} src={g.image_url} alt={g.caption ?? ''} style={{ aspectRatio: '1', borderRadius: '14px', objectFit: 'cover', width: '100%', height: '100%' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
