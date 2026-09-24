import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { PastorProfile, PastorTag } from '@/lib/pastor';
import { HeroSliderProvider, HeroSlide } from '@/components/HeroSlider';
import { ProfileTabs } from '@/components/ProfileTabs';
import { EnquiryForm } from '@/components/EnquiryForm';
import ClientTabs from '@/components/church-profile/ClientTabs';
import HeroCarousel from '@/components/church-profile/HeroCarousel';
import ShareButton from '@/components/church-profile/ShareButton';
import TopNav from '@/components/layout/TopNav';
import ContactSection from '@/components/church-profile/ContactSection';
import { GalleryLightbox } from '@/components/GalleryLightbox';
import PastorEventsSection from '@/components/pastor-profile/PastorEventsSection';
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

  const [
    languagesRes,
    tagsRes,
    educationRes,
    timelineRes,
    sermonsRes,
    eventsRes,
    hostedEventsRes,
    galleryRes,
    affiliationsRes,
    awardsRes,
    reviewsRes,
  ] = await Promise.all([
    supabase.from('pastor_languages').select('language').eq('pastor_id', pastor.id),
    supabase.from('pastor_tags').select('*').eq('pastor_id', pastor.id),
    supabase.from('pastor_education').select('*').eq('pastor_id', pastor.id).order('sort_order'),
    supabase.from('pastor_timeline').select('*').eq('pastor_id', pastor.id).order('sort_order'),
    supabase.from('pastor_sermons').select('*').eq('pastor_id', pastor.id).order('sort_order'),
    supabase.from('pastor_events').select('*').eq('pastor_id', pastor.id).order('event_date'),
    supabase
      .from('events')
      .select('*')
      .or(`host_pastor_id.eq.${pastor.id},and(host_type.eq.pastor,host_id.eq.${pastor.id})`)
      .order('starts_at', { ascending: true }),
    supabase.from('pastor_gallery').select('*').eq('pastor_id', pastor.id).order('sort_order'),
    supabase.from('pastor_affiliations').select('*').eq('pastor_id', pastor.id).order('sort_order'),
    supabase.from('pastor_awards').select('*').eq('pastor_id', pastor.id).order('sort_order'),
    supabase.from('pastor_reviews').select('*').eq('pastor_id', pastor.id).order('created_at', { ascending: false }),
  ]);

  const reviews = reviewsRes.data ?? [];
  const averageRating =
    reviews.length > 0 ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : null;

  // Combine pastor_events and events from public.events
  const directEvents = (eventsRes.data ?? []).map((e: any) => ({
    id: e.id,
    pastor_id: e.pastor_id,
    title: e.title,
    event_date: e.event_date,
    location: e.location,
    start_time: e.start_time,
    tags: e.tags || [],
    registration_url: e.registration_url,
    sort_order: e.sort_order || 0
  }));

  const hostedEvents = (hostedEventsRes.data ?? []).map((ev: any, idx: number) => ({
    id: ev.id,
    pastor_id: pastor.id,
    title: ev.title,
    event_date: ev.starts_at || new Date().toISOString(),
    location: [ev.venue_name, ev.city].filter(Boolean).join(', ') || null,
    start_time: ev.starts_at ? new Date(ev.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
    tags: [ev.type, ev.is_free ? 'Free entry' : ev.price_label].filter(Boolean),
    registration_url: ev.slug ? `/events/${ev.slug}` : null,
    sort_order: 100 + idx
  }));

  const combinedEvents = [...directEvents, ...hostedEvents];

  // Parse core values & associated churches
  let coreValues: string[] = [];
  let associatedChurches: any[] = [];
  const rawVision = pastor.vision_statement || '';
  if (rawVision.includes('<!--CORE_VALUES:')) {
    try {
      const match = rawVision.match(/<!--CORE_VALUES:(.*?)-->/);
      if (match && match[1]) {
        coreValues = JSON.parse(match[1]);
      }
    } catch {}
  }
  if (rawVision.includes('<!--ASSOCIATED_CHURCHES:')) {
    try {
      const match = rawVision.match(/<!--ASSOCIATED_CHURCHES:(.*?)-->/);
      if (match && match[1]) {
        associatedChurches = JSON.parse(match[1]);
      }
    } catch {}
  }
  const cleanVision = rawVision
    .replace(/<!--CORE_VALUES:.*?-->/g, '')
    .replace(/<!--ASSOCIATED_CHURCHES:.*?-->/g, '')
    .trim();

  // Fire-and-forget view increment
  supabase
    .from('pastors')
    .update({ view_count: (pastor.view_count || 0) + 1 })
    .eq('id', pastor.id)
    .then(() => { });

  return {
    ...pastor,
    vision_statement: cleanVision,
    core_values: coreValues,
    associated_churches: associatedChurches.length > 0 ? associatedChurches : (pastor.church_name_cache ? [{ name: pastor.church_name_cache, location: pastor.city || '', image: '', link: '' }] : []),
    languages: (languagesRes.data ?? []).map((r) => r.language),
    tags: tagsRes.data ?? [],
    education: educationRes.data ?? [],
    timeline: timelineRes.data ?? [],
    sermons: sermonsRes.data ?? [],
    events: combinedEvents,
    gallery: galleryRes.data ?? [],
    affiliations: affiliationsRes.data ?? [],
    awards: awardsRes.data ?? [],
    reviews,
    average_rating: averageRating,
  } as any;
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

  // Check if current user is the actual verified owner of this pastor profile
  let isActualOwner = false;
  try {
    const serverSupabase = await createServerSupabaseClient();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (user && pastor.owner_id === user.id) {
      isActualOwner = true;
    }
  } catch (authErr) {
    console.warn('Pastor owner auth verification check failed:', authErr);
  }

  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};
  const isOwner = isActualOwner && resolvedSearchParams.owner !== 'false';

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
            {isActualOwner && isOwner && (
              <Link href="/dashboard" style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', textDecoration: 'none' }}>
                <i className="ti ti-chart-bar"></i> Pastor Dashboard
              </Link>
            )}
            {isActualOwner && (
              <Link href={`/pastor/${pastor.slug}${isOwner ? '?owner=false' : '?owner=true'}`} scroll={false} style={{ textDecoration: 'none', background: isOwner ? '#7e22ce' : '#f3e8ff', color: isOwner ? '#fff' : '#7e22ce', border: '1px solid #e9d5ff', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                Owner View {isOwner ? 'ON' : 'OFF'}
              </Link>
            )}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <h1 style={{ color: '#fff', fontSize: '56px', fontWeight: 800, margin: 0, letterSpacing: '-0.03em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  {pastor.full_name}
                </h1>
                {pastor.is_verified && (
                  <span title="Verified Minister" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', padding: '6px 14px', borderRadius: '30px', fontSize: '13px', fontWeight: 800, boxShadow: '0 4px 15px rgba(16, 185, 129, 0.45)', border: '1.5px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)' }}>
                    <i className="ti ti-rosette-discount-check-filled" style={{ fontSize: '17px', color: '#fff' }}></i> Verified Minister
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {pastor.is_verified && (
                  <span style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#34d399', backdropFilter: 'blur(12px)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="ti ti-check"></i> Platform Verified
                  </span>
                )}
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
                      <i className="ti ti-brand-youtube" style={{ fontSize: '18px' }}></i> YouTube
                    </a>
                  )}
                  <ShareButton title={pastor.full_name} />
                  {isOwner && (
                    <Link href={`/onboarding/pastor?edit=${pastor.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fbbf24', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '30px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)', textDecoration: 'none' }}>
                      <i className="ti ti-pencil" style={{ fontSize: '18px' }}></i> Edit profile
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS STRIP - DYNAMIC FROM BACKEND */}
        {(pastor.years_in_ministry || pastor.churches_planted || pastor.nations_reached || pastor.events_spoken || pastor.congregation_size || pastor.youtube_subscribers || pastor.languages.length > 0 || pastor.sermons.length > 0) && (
          <div style={{ background: '#fff' }}>
            <div className="wrap">
              <div className="stats-strip" style={{ gridTemplateColumns: `repeat(${[pastor.years_in_ministry, pastor.churches_planted, pastor.nations_reached, pastor.events_spoken, pastor.congregation_size, pastor.youtube_subscribers, pastor.languages.length > 0, pastor.sermons.length > 0].filter(Boolean).length}, 1fr)` }}>
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
                {pastor.events_spoken && (
                  <div className="stat-cell">
                    <div className="v">{pastor.events_spoken}+</div>
                    <div className="l">Events spoken</div>
                  </div>
                )}
                {pastor.congregation_size && (
                  <div className="stat-cell">
                    <div className="v">{fmtK(pastor.congregation_size)}</div>
                    <div className="l">Congregation</div>
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
              </div>
            </div>
          </div>
        )}

        {/* ENQUIRY BANNER - EXACT FROM MOCKUP */}
        <div className="wrap">
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
            containerClassName="wrap"
            tabs={[
              { id: 'about', label: 'About', icon: 'ti-user' },
              { id: 'sermons', label: 'Sermons', icon: 'ti-player-play', iconColor: '#ef4444' },
              { id: 'vision', label: 'Vision', icon: 'ti-eye' },
              { id: 'education', label: 'Education', icon: 'ti-school' },
              { id: 'events', label: 'Events', icon: 'ti-calendar-event' },
              { id: 'gallery', label: 'Gallery', icon: 'ti-photo' },
            ]}
            panes={{
              about: <AboutPane pastor={pastor} preachingTags={preachingTags} ministryTags={ministryTags} availableForTags={availableForTags} />,
              sermons: <SermonsPane pastor={pastor} />,
              vision: <VisionPane pastor={pastor} />,
              education: <EducationPane pastor={pastor} />,
              events: <PastorEventsSection pastor={pastor} />,
              gallery: <GalleryPane pastor={pastor} />,
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
              twitter: pastor.twitter_url || undefined,
              whatsapp: pastor.whatsapp_url || undefined,
              linkedin: (pastor as any).linkedin_url || undefined,
              tiktok: (pastor as any).tiktok_url || undefined,
              website: pastor.website_url || undefined
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

      {pastor.languages.length > 0 && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic"><i className="ti ti-language"></i></div>
            <h3>Languages</h3>
          </div>
          <div className="pastor-chips">
            {pastor.languages.map((lang, idx) => (
              <span key={idx} className="pastor-chip green">{lang}</span>
            ))}
          </div>
        </div>
      )}

      {pastor.timeline.length > 0 && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div
              className="ic"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '13px',
                background: '#ea580c',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                flexShrink: 0,
              }}
            >
              <i className="ti ti-chart-line" style={{ fontSize: '20px' }}></i>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f0f1a' }}>Ministry journey</h3>
          </div>
          <div style={{ marginTop: '24px', position: 'relative', paddingLeft: '4px' }}>
            {pastor.timeline.map((entry, idx) => {
              const isLast = idx === pastor.timeline.length - 1;
              return (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    position: 'relative',
                    paddingBottom: isLast ? '0' : '28px',
                  }}
                >
                  {/* Vertical connecting line */}
                  {!isLast && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '6.5px',
                        top: '18px',
                        bottom: '0',
                        width: '2px',
                        background: '#e2e8f0',
                      }}
                    />
                  )}

                  {/* Gradient milestone dot */}
                  <div
                    style={{
                      width: '15px',
                      height: '15px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                      boxShadow: '0 0 0 4px rgba(237, 233, 254, 0.6)',
                      flexShrink: 0,
                      marginTop: '3px',
                      zIndex: 1,
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        color: '#7c3aed',
                        letterSpacing: '0.3px',
                        marginBottom: '4px',
                      }}
                    >
                      {entry.year}
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        color: '#0f0f1a',
                        lineHeight: 1.3,
                        marginBottom: '6px',
                      }}
                    >
                      {entry.title}
                    </div>
                    {entry.description && (
                      <div
                        style={{
                          fontSize: '14px',
                          color: '#64748b',
                          lineHeight: 1.6,
                        }}
                      >
                        {entry.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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

      {((pastor.associated_churches && pastor.associated_churches.length > 0) || pastor.church_name_cache) && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic"><i className="ti ti-building-church"></i></div>
            <h3>Associated Churches &amp; Ministries</h3>
          </div>
          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pastor.associated_churches && pastor.associated_churches.length > 0 ? (
              pastor.associated_churches.map((church, idx) => {
                const initials = (church.name || 'CH').split(' ').map((w: string) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
                return (
                  <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'center', border: '1px solid #e9e9ef', borderRadius: '14px', padding: '14px', background: '#fafafa' }}>
                    {church.image ? (
                      <img
                        src={church.image}
                        alt={church.name}
                        style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0, border: '1px solid #e2e8f0' }}
                      />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg,#f43f5e 0%,#7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, flexShrink: 0, fontSize: '14px' }}>
                        {initials}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f0f1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{church.name}</div>
                      {church.location && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <i className="ti ti-map-pin" style={{ fontSize: '13px' }}></i> {church.location}
                        </div>
                      )}
                    </div>
                    {church.link && (
                      <a
                        href={church.link.startsWith('http') ? church.link : `https://${church.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: '#f3e8ff',
                          color: '#7c3aed',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          flexShrink: 0
                        }}
                      >
                        Visit <i className="ti ti-external-link" style={{ fontSize: '12px' }}></i>
                      </a>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ display: 'flex', gap: '13px', alignItems: 'flex-start', border: '1px solid #e9e9ef', borderRadius: '14px', padding: '15px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg,#f43f5e 0%,#7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, flexShrink: 0 }}>
                  LC
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f0f1a' }}>{pastor.church_name_cache}</div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#6d28d9', marginTop: '2px' }}>Senior Pastor &amp; Founder</div>
                  {pastor.city && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{pastor.city}</div>}
                </div>
              </div>
            )}
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
        </div>
      </div>

      {pastor.affiliations.length > 0 && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic" style={{ background: '#4f46e5', color: '#fff', borderRadius: '12px' }}>
              <i className="ti ti-certificate"></i>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f0f1a' }}>Ministerial affiliation</h3>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pastor.affiliations.map((a, idx) => {
              // Generate badge initials and distinct gradient/solid background matching user design
              const words = a.organisation.trim().split(/\s+/);
              const badgeText = words.length >= 2
                ? (words[0][0] + words[1][0]).toUpperCase()
                : a.organisation.slice(0, 2).toUpperCase();

              const badgeStyles = [
                { bg: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', color: '#fff' }, // pink-purple (RCCG)
                { bg: '#7c3aed', color: '#fff' }, // purple (PE)
                { bg: '#15803d', color: '#fff' }, // green (IC)
                { bg: '#2563eb', color: '#fff' }, // blue (EV)
                { bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff' }
              ];
              const badgeStyle = badgeStyles[idx % badgeStyles.length];

              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: idx !== pastor.affiliations.length - 1 ? '14px' : '0', borderBottom: idx !== pastor.affiliations.length - 1 ? '1px solid #f1f1f5' : 'none' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: badgeStyle.bg,
                      color: badgeStyle.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '15px',
                      letterSpacing: '0.5px',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  >
                    {badgeText}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f0f1a', lineHeight: 1.25 }}>
                      {a.organisation}
                    </div>
                    {a.role && (
                      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginTop: '3px' }}>
                        {a.role}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pastor.awards.length > 0 && (
        <div className="pastor-card">
          <div className="pastor-card-h" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              className="ic"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#f59e0b',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0
              }}
            >
              <i className="ti ti-award"></i>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f0f1a', margin: 0 }}>
              Awards &amp; recognition
            </h3>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pastor.awards.map((a, idx) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  paddingBottom: idx !== pastor.awards.length - 1 ? '14px' : '0',
                  borderBottom: idx !== pastor.awards.length - 1 ? '1px solid #f1f1f5' : 'none'
                }}
              >
                <div
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    borderRadius: '12px',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0,
                    boxShadow: '0 4px 10px rgba(236, 72, 153, 0.25)'
                  }}
                >
                  <i className="ti ti-award" style={{ fontSize: '20px' }}></i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f0f1a', lineHeight: 1.25 }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginTop: '3px' }}>
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
  const sermons = pastor.sermons || [];

  return (
    <div>
      <div className="pastor-card">
        <div className="pastor-card-h">
          <div className="ic" style={{ background: '#ef4444', color: '#fff', borderRadius: '12px' }}>
            <i className="ti ti-player-play"></i>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f0f1a' }}>Sermons &amp; messages</h3>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {sermons.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '16px', border: '1.5px dashed #e2e8f0' }}>
              <i className="ti ti-video-off" style={{ fontSize: '32px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}></i>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>No sermons uploaded yet</div>
              <p style={{ fontSize: '13px', margin: '4px 0 0', color: '#64748b' }}>Videos and sermon links will appear here once added in profile settings.</p>
            </div>
          ) : (
            sermons.map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '18px',
                  background: '#ffffff',
                  border: '1.5px solid #f1f1f5',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '120px',
                    height: '75px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0,
                    boxShadow: '0 6px 16px rgba(244, 63, 94, 0.25)'
                  }}
                >
                  <i className="ti ti-player-play-filled" style={{ fontSize: '24px' }}></i>
                  {s.duration_min ? (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '6px',
                        right: '6px',
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '6px'
                      }}
                    >
                      {s.duration_min} min
                    </div>
                  ) : null}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '15.5px', fontWeight: 800, color: '#0f0f1a', lineHeight: 1.3 }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="ti ti-notes" style={{ fontSize: '13px', color: '#7c3aed' }}></i>
                    {[s.series, s.views ? `${fmtK(s.views)} views` : null].filter(Boolean).join(' · ') || 'Sermon message'}
                  </div>
                </div>

                {s.youtube_url && (
                  <a
                    href={s.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      color: '#0f172a',
                      fontSize: '13px',
                      fontWeight: 800,
                      padding: '8px 16px',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                    }}
                  >
                    <i className="ti ti-player-play" style={{ fontSize: '14px', color: '#ef4444' }}></i> Watch
                  </a>
                )}
              </div>
            ))
          )}
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
          <div className="ic" style={{ background: '#7c3aed', color: '#fff' }}><i className="ti ti-eye"></i></div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f0f1a' }}>Vision &amp; Mission</h3>
        </div>

        {pastor.vision_statement && (
          <div className="vision-card" style={{ marginTop: '16px' }}>
            <div className="vlabel">VISION STATEMENT</div>
            <div className="vstmt">&quot;{pastor.vision_statement}&quot;</div>
            <div className="vattr">— {pastor.full_name}</div>
          </div>
        )}

        {pastor.availability_status === 'available' && (
          <div className="avail-pill" style={{ marginTop: '16px' }}>
            <div className="d"></div>
            <span>Available for ministry</span>
          </div>
        )}

        {coreValues.length > 0 && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f1f5' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f0f1a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-flame" style={{ color: '#ec4899', fontSize: '18px' }}></i> Core Values &amp; Tenets
            </h4>
            <div className="pastor-chips">
              {coreValues.map((val: string, i: number) => (
                <span
                  key={i}
                  className="pastor-chip"
                  style={{
                    background: 'linear-gradient(135deg, #f5f3ff 0%, #fdf4ff 100%)',
                    color: '#7c3aed',
                    border: '1px solid #ddd6fe',
                    fontWeight: 700,
                    fontSize: '13px',
                    padding: '8px 16px',
                    borderRadius: '30px'
                  }}
                >
                  ✦ {val}
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
  const education = pastor.education || [];

  const colors = [
    { bg: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', text: '#6d28d9', icon: 'ti-school' },
    { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', text: '#059669', icon: 'ti-book' },
    { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', text: '#d97706', icon: 'ti-message-dots' },
  ];

  return (
    <div>
      <div className="pastor-card">
        <div className="pastor-card-h">
          <div className="ic" style={{ background: '#7c3aed', color: '#fff' }}><i className="ti ti-school"></i></div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f0f1a' }}>Education &amp; Training</h3>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {education.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '16px', border: '1.5px dashed #e2e8f0' }}>
              <i className="ti ti-school-off" style={{ fontSize: '32px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}></i>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>No qualifications listed yet</div>
              <p style={{ fontSize: '13px', margin: '4px 0 0', color: '#64748b' }}>Degrees and certifications will show here once added in profile settings.</p>
            </div>
          ) : (
            education.map((e, idx) => {
              const style = colors[idx % colors.length];
              return (
                <div
                  key={e.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '18px',
                    background: '#f8fafc',
                    border: '1.5px solid #f1f1f5'
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      background: style.bg,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  >
                    <i className={`ti ${style.icon}`}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f0f1a', lineHeight: 1.25 }}>
                      {e.degree}
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: style.text, marginTop: '2px' }}>
                      {e.institution}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '3px' }}>
                      {[e.year_range, e.detail].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function EventsPane({ pastor }: { pastor: PastorProfile }) {
  const events = pastor.events || [];

  return (
    <div>
      <div className="pastor-card">
        <div className="pastor-card-h">
          <div className="ic" style={{ background: '#ec4899', color: '#fff' }}>
            <i className="ti ti-calendar-event"></i>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f0f1a' }}>Upcoming Events</h3>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {events.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '16px', border: '1.5px dashed #e2e8f0' }}>
              <i className="ti ti-calendar-off" style={{ fontSize: '32px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}></i>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>No upcoming events scheduled</div>
              <p style={{ fontSize: '13px', margin: '4px 0 0', color: '#64748b' }}>Events organized by or featuring this pastor will appear here.</p>
            </div>
          ) : (
            events.map((e, idx) => {
              const date = new Date(e.event_date);
              const day = isNaN(date.getDate()) ? '15' : String(date.getDate());
              const month = isNaN(date.getDate())
                ? 'JUN'
                : date.toLocaleString('en-GB', { month: 'short' }).toUpperCase();

              const badgeColors = [
                'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              ];
              const dateBg = badgeColors[idx % badgeColors.length];

              return (
                <div
                  key={e.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '18px',
                    background: '#ffffff',
                    border: '1.5px solid #f1f1f5',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      background: dateBg,
                      color: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ fontSize: '17px', fontWeight: 900, lineHeight: 1 }}>{day}</div>
                    <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.85, marginTop: '2px', letterSpacing: '0.5px' }}>{month}</div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f0f1a', lineHeight: 1.25 }}>
                      {e.title}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>
                      {[e.location, e.start_time].filter(Boolean).join(' · ')}
                    </div>
                    {e.tags && e.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                        {e.tags.map((tag: string, tIdx: number) => (
                          <span
                            key={tIdx}
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              background: tIdx === 0 ? '#f5f3ff' : '#f0fdf4',
                              color: tIdx === 0 ? '#7c3aed' : '#16a34a',
                              border: tIdx === 0 ? '1px solid #ddd6fe' : '1px solid #bbf7d0',
                              padding: '3px 10px',
                              borderRadius: '20px'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {e.registration_url && (
                    <a
                      href={e.registration_url}
                      target={e.registration_url.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      style={{
                        background: 'linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: 800,
                        padding: '10px 20px',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        flexShrink: 0,
                        boxShadow: '0 4px 14px rgba(225, 29, 72, 0.25)'
                      }}
                    >
                      Register
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function GalleryPane({ pastor }: { pastor: PastorProfile }) {
  return <GalleryLightbox photos={pastor.gallery || []} />;
}
