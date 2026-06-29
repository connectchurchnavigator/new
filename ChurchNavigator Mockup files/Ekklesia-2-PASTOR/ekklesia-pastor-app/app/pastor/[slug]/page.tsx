import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase-admin';
import type { PastorProfile } from '@/types/pastor';
import { HeroSliderProvider, HeroSlide } from '@/components/HeroSlider';
import { ProfileTabs } from '@/components/ProfileTabs';
import { EnquiryForm } from '@/components/EnquiryForm';

export const revalidate = 60; // re-fetch from Supabase at most once a minute

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
    .update({ view_count: pastor.view_count + 1 })
    .eq('id', pastor.id)
    .then(() => {});

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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
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

export default async function PastorProfilePage({ params }: { params: { slug: string } }) {
  const pastor = await getPastor(params.slug);
  if (!pastor) notFound();

  const firstName = pastor.full_name.split(' ').find((w) => !/^(pastor|rev\.?|dr\.?)$/i.test(w)) ?? pastor.full_name;
  const preachingTags = pastor.tags.filter((t) => t.category === 'preaching');
  const ministryTags = pastor.tags.filter((t) => t.category === 'ministry_area');
  const availableForTags = pastor.tags.filter((t) => t.category === 'available_for');

  const stats = [
    { label: 'Years Ministry', value: pastor.years_in_ministry ? `${pastor.years_in_ministry}+` : '—', color: 'text-purple' },
    { label: 'Churches Planted', value: pastor.churches_planted ?? '—', color: 'text-emerald-600' },
    { label: 'Nations Reached', value: pastor.nations_reached ? `${pastor.nations_reached}+` : '—', color: 'text-amber-500' },
    { label: 'YouTube Subs', value: fmtK(pastor.youtube_subscribers), color: 'text-red-500' },
    { label: 'Events Spoken', value: '—', color: 'text-cyan-600' },
    { label: 'Congregation', value: '—', color: 'text-emerald-600' },
  ];

  return (
    <div>
      {/* NAV */}
      <div className="bg-white border-b-[1.5px] border-border py-3 sticky top-0 z-[100] shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-[13px] text-gray font-semibold">
            <i className="ti ti-arrow-left text-base" /> All pastors
          </a>
          <div className="flex-1 max-w-[320px] relative ml-2">
            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-light" />
            <input
              placeholder="Search pastors, churches, ministries..."
              className="w-full pl-9 pr-3 py-2 border-[1.5px] border-border rounded-full text-xs bg-surface outline-none"
            />
          </div>
        </div>
      </div>

      {/* HERO */}
      <HeroSliderProvider slideCount={3}>
        <HeroSlide>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d0520] to-[#1e0a4a]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/5" />
        </HeroSlide>
        <HeroSlide>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1a0a] to-[#0a3d1a]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/10" />
          {pastor.vision_statement && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
              <div className="text-[10px] font-bold text-white/35 tracking-[0.12em] uppercase mb-3">Vision</div>
              <div className="text-lg text-white/90 italic max-w-[500px] leading-relaxed mb-4">
                &quot;{pastor.vision_statement}&quot;
              </div>
              <div className="text-xs text-white/40 font-semibold">— {pastor.full_name}</div>
            </div>
          )}
        </HeroSlide>
        <HeroSlide>
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-950/50 to-transparent" />
          <div className="max-w-[1200px] mx-auto px-6 absolute bottom-0 left-0 right-0 pb-6">
            <div className="text-[10px] font-extrabold text-emerald-300 tracking-[0.08em] uppercase mb-3.5 flex items-center gap-1.5">
              <i className="ti ti-heart-handshake text-sm" /> Community Impact
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {stats.slice(0, 4).map((s) => (
                <div key={s.label} className="bg-white/10 border border-white/15 rounded-[13px] p-3.5 backdrop-blur-sm">
                  <div className="text-[22px] font-extrabold text-white">{s.value}</div>
                  <div className="text-[11px] text-white/50 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </HeroSlide>

        {/* Top-left badges */}
        <div className="absolute top-4 left-5 flex gap-2 z-10">
          <div className="bg-black/60 backdrop-blur-sm border border-white/15 rounded-full px-3.5 py-1.5 flex items-center gap-1.5">
            <i className="ti ti-eye text-[13px] text-white" />
            <span className="text-[13px] font-extrabold text-white">{pastor.view_count.toLocaleString()} views</span>
          </div>
          <div className="bg-black/60 backdrop-blur-sm border border-white/15 rounded-full px-3.5 py-1.5 flex items-center gap-1.5">
            <span className="avail-dot" />
            <span className="text-[13px] font-extrabold text-[#60a5fa]">
              {Math.max(3, pastor.view_count % 80)} viewing now
            </span>
          </div>
        </div>

        {/* Top-right actions */}
        <div className="absolute top-4 right-5 flex items-center gap-2 z-10">
          <button className="bg-white/15 backdrop-blur-sm border border-white/25 text-white rounded-full px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5">
            <i className="ti ti-bookmark text-[13px]" /> Save
          </button>
          <button className="bg-white/15 backdrop-blur-sm border border-white/25 text-white rounded-full px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5">
            <i className="ti ti-share text-[13px]" /> Share
          </button>
        </div>

        {/* Bottom content */}
        <div className="max-w-[1200px] mx-auto px-6 absolute bottom-0 left-0 right-0 pb-5 z-10">
          <div className="flex items-end gap-4 mb-3.5">
            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-coral to-purple flex items-center justify-center flex-shrink-0 border-[3px] border-white/30 shadow-lg overflow-hidden">
              {pastor.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pastor.avatar_url} alt={pastor.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-extrabold text-white tracking-tighter">{pastor.initials}</span>
              )}
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,.5)' }}>
              {pastor.full_name}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            {pastor.title && (
              <span className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3.5 py-1.5 text-xs font-bold text-white inline-flex items-center gap-1.5">
                <i className="ti ti-sparkles text-xs" /> {pastor.title}
              </span>
            )}
            {pastor.church_name_cache && (
              <span className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3.5 py-1.5 text-xs font-bold text-white inline-flex items-center gap-1.5">
                <i className="ti ti-building-church text-xs" /> {pastor.church_name_cache}
              </span>
            )}
            {pastor.city && (
              <span className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3.5 py-1.5 text-xs font-bold text-white inline-flex items-center gap-1.5">
                <i className="ti ti-map-pin text-xs" /> {pastor.city}
              </span>
            )}
            {pastor.average_rating && (
              <span className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3.5 py-1.5 text-xs font-bold text-white inline-flex items-center gap-1.5">
                <i className="ti ti-star-filled text-xs text-amber-400" /> {pastor.average_rating} · {pastor.reviews.length} reviews
              </span>
            )}
            {pastor.is_verified && (
              <span className="bg-green-500/25 backdrop-blur-sm border border-green-500/40 rounded-full px-3.5 py-1.5 text-xs font-bold text-green-300 inline-flex items-center gap-1.5">
                <i className="ti ti-circle-check text-xs" /> Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <EnquiryForm
              pastorSlug={pastor.slug}
              pastorFirstName={firstName}
              trigger={
                <button className="bg-purple text-white rounded-full px-5 py-2.5 text-[13px] font-bold inline-flex items-center gap-1.5">
                  <i className="ti ti-send text-[15px]" /> Send enquiry
                </button>
              }
            />
            {pastor.youtube_url && (
              <a
                href={pastor.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-500 text-white rounded-full px-5 py-2.5 text-[13px] font-bold inline-flex items-center gap-1.5"
              >
                <i className="ti ti-brand-youtube text-[15px]" /> Watch sermon
              </a>
            )}
            <button className="bg-white/[0.18] backdrop-blur-sm border border-white/25 text-white rounded-full px-5 py-2.5 text-[13px] font-bold inline-flex items-center gap-1.5">
              <i className="ti ti-heart text-[15px]" /> Follow
            </button>

            <div className="ml-auto flex items-center gap-2">
              {pastor.instagram_url && (
                <SocialPill href={pastor.instagram_url} icon="ti-brand-instagram" bg="bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400" count={fmtK(pastor.instagram_followers)} />
              )}
              {pastor.facebook_url && (
                <SocialPill href={pastor.facebook_url} icon="ti-brand-facebook" bg="bg-[#1877f2]" count={fmtK(pastor.facebook_followers)} />
              )}
              {pastor.youtube_url && (
                <SocialPill href={pastor.youtube_url} icon="ti-brand-youtube" bg="bg-[#ff0000]" count={fmtK(pastor.youtube_subscribers)} />
              )}
              {pastor.twitter_url && (
                <SocialPill href={pastor.twitter_url} icon="ti-brand-x" bg="bg-black" count={fmtK(pastor.twitter_followers)} />
              )}
            </div>
          </div>
        </div>
      </HeroSliderProvider>

      {/* STATS BAND */}
      <div className="bg-white border-b-[1.5px] border-border shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-6 text-center py-1.5">
            {stats.map((s, i) => (
              <div key={s.label} className={`py-4 px-2 ${i < stats.length - 1 ? 'border-r border-border' : ''}`}>
                <div className={`text-[26px] font-extrabold ${s.color}`}>{s.value}</div>
                <div className="text-[11px] text-gray-light mt-0.5 font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTACT BANNER */}
      <div className="max-w-[1200px] mx-auto px-6 pt-5">
        <div className="bg-gradient-to-br from-[#4c1d95] to-purple rounded-2xl px-6 py-4.5 flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-[42px] h-[42px] rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <i className="ti ti-message-circle text-xl text-white" />
            </div>
            <div>
              <div className="text-[15px] font-extrabold text-white">Contact {pastor.full_name} for your event</div>
              <div className="text-xs text-white/60 mt-0.5">
                {[pastor.travel_range && 'Conferences', 'Retreats', 'Sunday services', pastor.travel_range === 'International' && 'International']
                  .filter(Boolean)
                  .join(' · ')}{' '}
                — responds within 24 hours
              </div>
            </div>
          </div>
          <EnquiryForm
            pastorSlug={pastor.slug}
            pastorFirstName={firstName}
            trigger={
              <button className="bg-white/15 border-[1.5px] border-white/30 text-white rounded-full px-5 py-2.5 text-[13px] font-bold inline-flex items-center gap-1.5 whitespace-nowrap">
                <i className="ti ti-send text-[15px]" /> Send enquiry
              </button>
            }
          />
        </div>
      </div>

      {/* TABS + CONTENT */}
      <ProfileTabs
        tabs={[
          { id: 'about', label: 'About', icon: 'ti-user' },
          { id: 'sermons', label: 'Sermons', icon: 'ti-brand-youtube', iconColor: '#ef4444' },
          { id: 'vision', label: 'Vision', icon: 'ti-eye' },
          { id: 'education', label: 'Education', icon: 'ti-school' },
          { id: 'events', label: 'Events', icon: 'ti-calendar-event' },
          { id: 'gallery', label: 'Gallery', icon: 'ti-photo' },
          { id: 'reviews', label: 'Reviews', icon: 'ti-star', badge: pastor.reviews.length },
        ]}
        panes={{
          about: <AboutPane pastor={pastor} preachingTags={preachingTags} ministryTags={ministryTags} availableForTags={availableForTags} />,
          sermons: <SermonsPane pastor={pastor} />,
          vision: <VisionPane pastor={pastor} />,
          education: <EducationPane pastor={pastor} />,
          events: <EventsPane pastor={pastor} />,
          gallery: <GalleryPane pastor={pastor} />,
          reviews: <ReviewsPane pastor={pastor} />,
        }}
      />
    </div>
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
  return <div className="bg-white rounded-[20px] p-7 md:p-[30px] mb-4">{children}</div>;
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

import type { PastorTag } from '@/types/pastor';

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
    <div className="max-w-[1200px] mx-auto px-6 pb-16 pt-5 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
      <div>
        {pastor.bio && (
          <SecCard>
            <SecTitle icon="ti-user" gradient="bg-gradient-to-br from-purple to-purple-300">
              Biography
            </SecTitle>
            <p className="text-sm text-slate-600 leading-7">{pastor.bio}</p>
          </SecCard>
        )}

        {preachingTags.length > 0 && (
          <SecCard>
            <SecTitle icon="ti-flame" gradient="bg-gradient-to-br from-red-500 to-red-300">
              Preaching Specialisms
            </SecTitle>
            {preachingTags.map((t) => (
              <span key={t.id} className="chip chip-red">{t.label}</span>
            ))}
          </SecCard>
        )}

        {ministryTags.length > 0 && (
          <SecCard>
            <SecTitle icon="ti-heart-handshake" gradient="bg-gradient-to-br from-amber-600 to-amber-300">
              Ministry Areas
            </SecTitle>
            {ministryTags.map((t) => (
              <span key={t.id} className="chip chip-amber">{t.label}</span>
            ))}
          </SecCard>
        )}

        {availableForTags.length > 0 && (
          <SecCard>
            <SecTitle icon="ti-calendar-check" gradient="bg-gradient-to-br from-emerald-600 to-emerald-300">
              Available For
            </SecTitle>
            {availableForTags.map((t) => (
              <span key={t.id} className="chip chip-green">{t.label}</span>
            ))}
          </SecCard>
        )}

        {pastor.timeline.length > 0 && (
          <SecCard>
            <SecTitle icon="ti-timeline" gradient="bg-gradient-to-br from-amber-500 to-amber-300">
              Ministry Journey
            </SecTitle>
            {pastor.timeline.map((entry, i) => (
              <div key={entry.id} className="flex gap-3.5 pb-5 last:pb-0 relative">
                <div className="relative">
                  <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 relative z-10 bg-gradient-to-br from-purple to-coral">
                    <i className={`ti ti-${entry.icon || 'flag'} text-base text-white`} />
                  </div>
                  {i < pastor.timeline.length - 1 && (
                    <div className="absolute left-[19px] top-[42px] bottom-0 w-[1.5px] bg-gradient-to-b from-border to-transparent" />
                  )}
                </div>
                <div className="pt-1.5">
                  <div className="text-[10px] font-extrabold text-purple mb-0.5">{entry.year}</div>
                  <div className="text-sm font-extrabold text-ink mb-1">{entry.title}</div>
                  {entry.description && <div className="text-[13px] text-slate-500 leading-relaxed">{entry.description}</div>}
                </div>
              </div>
            ))}
          </SecCard>
        )}
      </div>

      <Sidebar pastor={pastor} />
    </div>
  );
}

function Sidebar({ pastor }: { pastor: PastorProfile }) {
  const firstName = pastor.full_name.split(' ').find((w) => !/^(pastor|rev\.?|dr\.?)$/i.test(w)) ?? pastor.full_name;

  return (
    <div className="sticky top-[130px]">
      <div className="bg-gradient-to-br from-[#1e0a4a] to-[#2d1b6e] border-[1.5px] border-purple/30 rounded-[20px] overflow-hidden mb-4">
        <div className="p-5">
          <div className="text-[17px] font-extrabold text-white mb-1">Contact {firstName}</div>
          <div className="text-[11px] text-white/45 mb-4">Responds within 24 hours</div>
          <EnquiryForm
            pastorSlug={pastor.slug}
            pastorFirstName={firstName}
            trigger={
              <button className="w-full py-3 rounded-full text-sm font-extrabold flex items-center justify-center gap-2 bg-gradient-to-br from-coral to-purple text-white shadow-lg">
                <i className="ti ti-send text-base" /> Send Enquiry
              </button>
            }
          />
        </div>
      </div>

      {pastor.church_name_cache && (
        <div className="bg-white border-[1.5px] border-border rounded-[20px] overflow-hidden mb-4">
          <div className="px-5 py-3.5 border-b border-border text-[13px] font-bold flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-coral to-purple flex items-center justify-center">
              <i className="ti ti-building-church text-sm text-white" />
            </div>
            Home Church
          </div>
          <div className="p-5">
            <div className="text-sm font-extrabold text-ink">{pastor.church_name_cache}</div>
            {pastor.city && <div className="text-xs text-gray mt-1">{pastor.city}</div>}
          </div>
        </div>
      )}

      <div className="bg-white border-[1.5px] border-border rounded-[20px] overflow-hidden mb-4">
        <div className="px-5 py-3.5 border-b border-border text-[13px] font-bold flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-300 flex items-center justify-center">
            <i className="ti ti-world text-sm text-white" />
          </div>
          Travel &amp; Availability
        </div>
        <div className="px-5 py-2.5">
          {pastor.city && <SidebarRow icon="ti-map-pin" label="Based in" value={pastor.city} />}
          {pastor.travel_range && <SidebarRow icon="ti-plane-departure" label="Travel range" value={pastor.travel_range} />}
          {pastor.lead_time && <SidebarRow icon="ti-clock" label="Lead time" value={pastor.lead_time} />}
          <div className="flex items-center justify-between py-2.5">
            <span className="text-xs text-gray flex items-center gap-1.5">
              <i className="ti ti-calendar text-[13px] text-purple" /> Availability
            </span>
            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border-[1.5px] border-emerald-200">
              {pastor.availability_note || pastor.availability_status}
            </span>
          </div>
          {pastor.languages.length > 0 && <SidebarRow icon="ti-language" label="Languages" value={pastor.languages.join(', ')} />}
        </div>
      </div>

      {pastor.affiliations.length > 0 && (
        <div className="bg-white border-[1.5px] border-border rounded-[20px] overflow-hidden mb-4">
          <div className="px-5 py-3.5 border-b border-border text-[13px] font-bold flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-600 to-amber-300 flex items-center justify-center">
              <i className="ti ti-topology-star text-sm text-white" />
            </div>
            Ministerial Affiliation
          </div>
          <div className="px-5 py-2">
            {pastor.affiliations.map((a) => (
              <div key={a.id} className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-none">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-300 flex items-center justify-center flex-shrink-0">
                  <i className="ti ti-building-community text-sm text-white" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-ink">{a.organisation}</div>
                  {a.role && <div className="text-[10px] text-gray">{a.role}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pastor.awards.length > 0 && (
        <div className="bg-white border-[1.5px] border-border rounded-[20px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border text-[13px] font-bold flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-600 to-amber-300 flex items-center justify-center">
              <i className="ti ti-award text-sm text-white" />
            </div>
            Awards &amp; Recognition
          </div>
          <div className="px-5 py-2">
            {pastor.awards.map((a) => (
              <div key={a.id} className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-none">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border-[1.5px] border-amber-200 flex items-center justify-center flex-shrink-0">
                  <i className="ti ti-award text-sm text-amber-600" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-ink">{a.title}</div>
                  {a.issuer && <div className="text-[10px] text-gray">{a.issuer}</div>}
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
    <div className="max-w-[1200px] mx-auto px-6 pb-16 pt-5">
      <SecCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
            <i className="ti ti-brand-youtube text-xl text-white" />
          </div>
          <h2 className="text-[22px] font-extrabold text-ink">Recent Sermons</h2>
          <span className="ml-auto text-xs text-gray font-semibold">
            {fmtK(pastor.youtube_subscribers)} subs
          </span>
        </div>
        {pastor.sermons.length === 0 && <p className="text-sm text-gray">No sermons added yet.</p>}
        {pastor.sermons.map((s) => (
          <div key={s.id} className="flex gap-3 items-start py-3.5 border-b border-border last:border-none">
            <div className="w-[72px] h-12 rounded-[10px] bg-gradient-to-br from-[#1e0a4a] to-[#2d1b6e] flex items-center justify-center flex-shrink-0">
              <i className="ti ti-player-play-filled text-xl text-white/80" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-extrabold text-ink mb-1">{s.title}</div>
              <div className="text-xs text-gray">
                {[s.series, s.duration_min && `${s.duration_min} min`].filter(Boolean).join(' · ')}
              </div>
              <div className="flex gap-3 mt-1 text-[11px] text-gray-light">
                <span><i className="ti ti-eye text-[11px]" /> {fmtK(s.views)}</span>
                <span><i className="ti ti-heart text-[11px]" /> {fmtK(s.likes)}</span>
              </div>
            </div>
            {s.youtube_url && (
              <a
                href={s.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-light border-[1.5px] border-purple-200 text-purple-dark rounded-full px-4 py-1.5 text-xs font-bold flex-shrink-0"
              >
                Watch
              </a>
            )}
          </div>
        ))}
      </SecCard>
    </div>
  );
}

function VisionPane({ pastor }: { pastor: PastorProfile }) {
  return (
    <div className="max-w-[1200px] mx-auto px-6 pb-16 pt-5">
      <SecCard>
        <SecTitle icon="ti-eye" gradient="bg-gradient-to-br from-cyan-600 to-cyan-300">
          Vision &amp; Mission
        </SecTitle>
        {pastor.vision_statement && (
          <div className="bg-gradient-to-br from-[#1e0a4a] to-[#2d1b6e] rounded-2xl p-6 mb-5">
            <div className="text-[10px] font-extrabold text-white/35 tracking-[0.12em] mb-3">VISION STATEMENT</div>
            <div className="text-base text-white leading-relaxed italic">&quot;{pastor.vision_statement}&quot;</div>
            <div className="text-[11px] text-white/40 font-semibold mt-3.5">— {pastor.full_name}</div>
          </div>
        )}
      </SecCard>
    </div>
  );
}

function EducationPane({ pastor }: { pastor: PastorProfile }) {
  return (
    <div className="max-w-[1200px] mx-auto px-6 pb-16 pt-5">
      <SecCard>
        <SecTitle icon="ti-school" gradient="bg-gradient-to-br from-purple to-purple-300">
          Education &amp; Training
        </SecTitle>
        {pastor.education.length === 0 && <p className="text-sm text-gray">No education history added yet.</p>}
        {pastor.education.map((e) => (
          <div key={e.id} className="bg-surface border-[1.5px] border-border rounded-2xl p-4 mb-2.5 last:mb-0 flex gap-3.5 items-start">
            <div className="w-[42px] h-[42px] rounded-xl bg-gradient-to-br from-purple to-purple-300 flex items-center justify-center flex-shrink-0">
              <i className="ti ti-award text-lg text-white" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-ink">{e.degree}</div>
              <div className="text-xs text-purple font-bold mt-0.5">{e.institution}</div>
              {(e.year_range || e.detail) && (
                <div className="text-[11px] text-gray mt-0.5">{[e.year_range, e.detail].filter(Boolean).join(' · ')}</div>
              )}
            </div>
          </div>
        ))}
      </SecCard>
    </div>
  );
}

function EventsPane({ pastor }: { pastor: PastorProfile }) {
  return (
    <div className="max-w-[1200px] mx-auto px-6 pb-16 pt-5">
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
  return (
    <div className="max-w-[1200px] mx-auto px-6 pb-16 pt-5">
      <SecCard>
        <SecTitle icon="ti-photo" gradient="bg-gradient-to-br from-pink-600 to-pink-300">
          Gallery
        </SecTitle>
        {pastor.gallery.length === 0 && <p className="text-sm text-gray">No photos added yet.</p>}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {pastor.gallery.map((g) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={g.id} src={g.image_url} alt={g.caption ?? ''} className="rounded-2xl aspect-square object-cover" />
          ))}
        </div>
      </SecCard>
    </div>
  );
}

function ReviewsPane({ pastor }: { pastor: PastorProfile }) {
  const counts = [5, 4, 3, 2, 1].map((star) => pastor.reviews.filter((r) => r.rating === star).length);
  const total = pastor.reviews.length || 1;

  return (
    <div className="max-w-[1200px] mx-auto px-6 pb-16 pt-5">
      <SecCard>
        <SecTitle icon="ti-star" gradient="bg-gradient-to-br from-amber-600 to-amber-300">
          Reviews &amp; Testimonials
        </SecTitle>

        <div className="flex gap-5 items-center mb-6">
          <div className="text-center">
            <div className="text-5xl font-extrabold text-ink leading-none">{pastor.average_rating ?? '—'}</div>
            <div className="text-amber-400 text-base mt-1">{'★'.repeat(Math.round(pastor.average_rating ?? 0))}</div>
            <div className="text-xs text-gray mt-1">{pastor.reviews.length} reviews</div>
          </div>
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((star, i) => (
              <div key={star} className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-gray w-3">{star}</span>
                <div className="flex-1 h-2 rounded bg-border overflow-hidden">
                  <div className="h-full bg-amber-400 rounded" style={{ width: `${(counts[i] / total) * 100}%` }} />
                </div>
                <span className="text-xs text-gray w-6">{counts[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {pastor.reviews.map((r) => (
          <div key={r.id} className="py-4 border-b border-border last:border-none">
            <div className="flex gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral to-purple flex items-center justify-center flex-shrink-0 text-xs font-extrabold text-white">
                {r.reviewer_name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </div>
              <div>
                <div className="text-sm font-extrabold">{r.reviewer_name}</div>
                {r.reviewer_role && <div className="text-xs text-gray">{r.reviewer_role}</div>}
              </div>
              <div className="ml-auto text-amber-400 text-sm">{'★'.repeat(r.rating)}</div>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed">&quot;{r.comment}&quot;</p>
          </div>
        ))}
      </SecCard>
    </div>
  );
}
