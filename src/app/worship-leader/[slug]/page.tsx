import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase-admin';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { EnquiryForm } from '@/components/EnquiryForm';
import { ProfileTabs } from '@/components/ProfileTabs';
import HeroCarousel from '@/components/church-profile/HeroCarousel';
import ShareButton from '@/components/church-profile/ShareButton';
import TopNav from '@/components/layout/TopNav';
import ContactSection from '@/components/church-profile/ContactSection';
import '@/app/church/[slug]/church.css';
import '@/app/pastor/[slug]/pastor.css';

export const revalidate = 0; 

async function getWorshipLeader(slug: string) {
  const supabase = createAdminClient();

  const { data: leader } = await supabase
    .from('worship_leaders')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (!leader) return null;

  const { data: tagsRes } = await supabase.from('worship_leader_tags').select('*').eq('worship_leader_id', leader.id);
  const tags = tagsRes || [];

  // Fire-and-forget view increment
  supabase.from('worship_leaders').update({ view_count: (leader.view_count || 0) + 1 }).eq('id', leader.id).then(() => {});

  return {
    ...leader,
    tags,
  };
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const leader = await getWorshipLeader(params.slug);
  if (!leader) return { title: 'Worship Leader not found — Ekklesia' };
  return {
    title: `${leader.display_name} — Ekklesia`,
    description: leader.bio?.slice(0, 160) ?? `${leader.display_name}'s profile on Ekklesia`,
  };
}

export default async function WorshipLeaderProfilePage(props: {
  params: Promise<{ slug: string }> | { slug: string };
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
  const params = await props.params;
  const leader = await getWorshipLeader(params.slug);
  if (!leader) notFound();

  // Check if current user is the actual verified owner of this worship leader profile
  let isActualOwner = false;
  try {
    const serverSupabase = await createServerSupabaseClient();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (user && leader.owner_id === user.id) {
      isActualOwner = true;
    }
  } catch (authErr) {
    console.warn('Worship leader owner auth verification check failed:', authErr);
  }

  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};
  // Allow owner view if actual owner OR explicitly testing with ?owner=true
  const isOwner = resolvedSearchParams.owner === 'true' || (isActualOwner && resolvedSearchParams.owner !== 'false');
  const isEditing = isOwner && resolvedSearchParams.edit === 'true';

  const firstName = leader.display_name.split(' ')[0] ?? leader.display_name;
  
  const styleTags = leader.tags.filter((t: any) => t.category === 'style');
  const instrumentTags = leader.tags.filter((t: any) => t.category === 'instrument');
  const languageTags = leader.tags.filter((t: any) => t.category === 'language');
  const availableForTags = leader.tags.filter((t: any) => t.category === 'available_for');
  const feeModelTags = leader.tags.filter((t: any) => t.category === 'fee_model');

  const coverUrls = leader.cover_photo_urls?.length > 0 ? leader.cover_photo_urls : [];

  return (
    <>
      {isOwner && <div style={{ height: '48px', width: '100%' }} />}
      <TopNav />
      <main id="detail" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
          <Link className="back" href="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            All worship leaders
          </Link>
          <div style={{ display: 'flex', gap: '12px' }}>
            {(isActualOwner || isOwner) && (
              <Link href={`/worship-leader/${leader.slug}${isOwner ? '?owner=false' : '?owner=true'}`} scroll={false} style={{ textDecoration: 'none', background: isOwner ? '#7e22ce' : '#f3e8ff', color: isOwner ? '#fff' : '#7e22ce', border: '1px solid #e9d5ff', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
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
                {leader.avatar_url ? (
                  <img src={leader.avatar_url} alt={leader.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <img src={`https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=200&auto=format&fit=crop`} alt="Dynamic fallback avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', flexShrink: 0 }} />
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <h1 style={{ color: '#fff', fontSize: '56px', fontWeight: 800, margin: 0, letterSpacing: '-0.03em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  {leader.display_name}
                </h1>
                {leader.is_verified && (
                  <span title="Verified Minister" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', padding: '6px 14px', borderRadius: '30px', fontSize: '13px', fontWeight: 800, boxShadow: '0 4px 15px rgba(16, 185, 129, 0.45)', border: '1.5px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)' }}>
                    <i className="ti ti-rosette-discount-check-filled" style={{ fontSize: '17px', color: '#fff' }}></i> Verified Leader
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {leader.is_verified && (
                  <span style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#34d399', backdropFilter: 'blur(12px)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="ti ti-check"></i> Platform Verified
                  </span>
                )}
                {leader.tagline && (
                  <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="ti ti-sparkles"></i> {leader.tagline}
                  </span>
                )}
                {leader.city && (
                  <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="ti ti-map-pin"></i> {leader.city}, {leader.country}
                  </span>
                )}
                {leader.travel_range && (
                  <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="ti ti-plane"></i> {leader.travel_range}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '14px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <EnquiryForm
                    pastorSlug={leader.slug}
                    pastorFirstName={firstName}
                    trigger={
                      <button style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#a855f7', color: '#fff', padding: '12px 24px', borderRadius: '30px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)' }}>
                        <i className="ti ti-send" style={{ fontSize: '18px' }}></i> Send enquiry
                      </button>
                    }
                  />
                  {leader.spotify_url && (
                    <a href={leader.spotify_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#1db954', color: '#fff', textDecoration: 'none', padding: '12px 24px', borderRadius: '30px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(29, 185, 84, 0.4)' }}>
                      <i className="ti ti-brand-spotify" style={{ fontSize: '18px' }}></i> Listen on Spotify
                    </a>
                  )}
                  <ShareButton title={leader.display_name} />
                  {isOwner && (
                    <Link
                      href={`/onboarding/worship-leader/${leader.slug}/edit`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#fbbf24',
                        color: '#000',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '30px',
                        fontSize: '14px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)',
                        textDecoration: 'none',
                      }}
                    >
                      <i className="ti ti-pencil" style={{ fontSize: '18px' }}></i> Edit profile
                    </Link>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {leader.instagram_url && (
                      <a href={leader.instagram_url} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e1306c', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                        <i className="ti ti-brand-instagram"></i>
                      </a>
                    )}
                    {leader.youtube_url && (
                      <a href={leader.youtube_url} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                        <i className="ti ti-brand-youtube"></i>
                      </a>
                    )}
                    {leader.website_url && (
                      <a href={leader.website_url} target="_blank" rel="noreferrer" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '20px' }}>
                        <i className="ti ti-world"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ENQUIRY BANNER */}
        <div className="wrap">
          <div className="enquiry-banner">
            <div>
              <div className="t">Book {leader.display_name} for your event</div>
              <div className="s">Conferences &middot; Retreats &middot; Sunday services &mdash; usually replies within 24 hours</div>
            </div>
            <EnquiryForm
              pastorSlug={leader.slug}
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
              { id: 'music', label: 'Music & Media', icon: 'ti-music', iconColor: '#ec4899' },
            ]}
            panes={{
              about: (
                <AboutPane
                  leader={leader}
                  styleTags={styleTags}
                  instrumentTags={instrumentTags}
                  languageTags={languageTags}
                  availableForTags={availableForTags}
                  feeModelTags={feeModelTags}
                />
              ),
              music: <MusicPane leader={leader} />,
            }}
            sidebar={<Sidebar leader={leader} />}
          />
        </div>
      </main>
    </>
  );
}

function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    if (url.includes('youtube.com/watch')) {
      const v = new URL(url).searchParams.get('v');
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
  } catch {
    return null;
  }
  return null;
}

function getSpotifyEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    // e.g. https://open.spotify.com/track/... -> https://open.spotify.com/embed/track/...
    if (url.includes('spotify.com/')) {
      return url.replace('spotify.com/', 'spotify.com/embed/');
    }
  } catch {
    return null;
  }
  return null;
}

function MusicPane({ leader }: { leader: any }) {
  const ytEmbed = getYouTubeEmbedUrl(leader.youtube_url);
  const spotifyEmbed = getSpotifyEmbedUrl(leader.spotify_url);
  const hasAudio = !!leader.song_url;
  const hasVideo = !!leader.video_url || !!leader.youtube_url;
  const hasSpotify = !!leader.spotify_url;
  const hasGallery = Array.isArray(leader.cover_photo_urls) && leader.cover_photo_urls.length > 0;
  const hasLinks = !!leader.spotify_url || !!leader.youtube_url || !!leader.instagram_url || !!leader.website_url;
  const hasAnyMedia = hasAudio || hasVideo || hasSpotify || hasGallery || hasLinks;

  if (!hasAnyMedia) {
    return (
      <div className="pastor-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'rgba(236,72,153,0.1)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '24px' }}>
          <i className="ti ti-music"></i>
        </div>
        <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800 }}>No media uploaded yet</h3>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Music tracks, videos, gallery photos, and media links will appear here.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Audio Tracks */}
      {leader.song_url && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic" style={{ background: 'linear-gradient(135deg,#2dd4bf,#0891b2)' }}>
              <i className="ti ti-headphones"></i>
            </div>
            <h3>Audio Tracks</h3>
          </div>
          <div style={{ marginTop: '12px' }}>
            <audio controls style={{ width: '100%', outline: 'none' }} src={leader.song_url} />
          </div>
        </div>
      )}

      {/* 2. Live Videos & Streams */}
      {(leader.video_url || leader.youtube_url) && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
              <i className="ti ti-video"></i>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
              <h3 style={{ margin: 0 }}>Live Videos & Streams</h3>
              {leader.youtube_url && (
                <a
                  href={leader.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '12.5px', color: '#ef4444', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Watch on YouTube <i className="ti ti-external-link"></i>
                </a>
              )}
            </div>
          </div>

          {/* Uploaded Video file */}
          {leader.video_url && (
            <div style={{ marginTop: '14px', borderRadius: '14px', overflow: 'hidden', background: '#000' }}>
              <video controls style={{ width: '100%', display: 'block', maxHeight: '460px' }} src={leader.video_url} />
            </div>
          )}

          {/* YouTube Video / Stream */}
          {leader.youtube_url && (
            <div style={{ marginTop: leader.video_url ? '16px' : '14px' }}>
              {ytEmbed ? (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '14px', background: '#000' }}>
                  <iframe
                    src={ytEmbed}
                    title="YouTube video"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a
                  href={leader.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ef4444', color: '#fff', padding: '10px 18px', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, textDecoration: 'none' }}
                >
                  <i className="ti ti-brand-youtube" style={{ fontSize: '18px' }}></i> Open YouTube Link
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Spotify Music */}
      {leader.spotify_url && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              <i className="ti ti-brand-spotify"></i>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
              <h3 style={{ margin: 0 }}>Spotify Music</h3>
              <a
                href={leader.spotify_url}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '12.5px', color: '#10b981', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Open in Spotify <i className="ti ti-external-link"></i>
              </a>
            </div>
          </div>
          {spotifyEmbed ? (
            <div style={{ marginTop: '14px', borderRadius: '14px', overflow: 'hidden' }}>
              <iframe
                src={spotifyEmbed}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          ) : (
            <div style={{ marginTop: '12px' }}>
              <a
                href={leader.spotify_url}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#1db954', color: '#fff', padding: '10px 18px', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700, textDecoration: 'none' }}
              >
                <i className="ti ti-brand-spotify" style={{ fontSize: '18px' }}></i> Listen on Spotify
              </a>
            </div>
          )}
        </div>
      )}

      {/* 4. Gallery Photos */}
      {leader.cover_photo_urls && leader.cover_photo_urls.length > 0 && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic" style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>
              <i className="ti ti-photo"></i>
            </div>
            <h3>Gallery Photos</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px', marginTop: '14px' }}>
            {leader.cover_photo_urls.map((url: string, i: number) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display: 'block', overflow: 'hidden', borderRadius: '14px', border: '1.5px solid var(--border)' }}>
                <img
                  src={url}
                  alt={`Gallery item ${i + 1}`}
                  style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block', transition: 'transform 0.2s ease' }}
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 5. Streaming & Social Links */}
      {(() => {
        // Collect all links: dedicated columns plus any additional links
        const linkItems: { url: string; label: string; icon: string; bg: string; border: string; color: string; iconColor: string }[] = [];
        
        if (leader.spotify_url) {
          linkItems.push({
            url: leader.spotify_url,
            label: "Spotify",
            icon: "ti-brand-spotify",
            bg: "#f0fdf4",
            border: "#bbf7d0",
            color: "#166534",
            iconColor: "#16a34a",
          });
        }
        if (leader.youtube_url) {
          linkItems.push({
            url: leader.youtube_url,
            label: "YouTube",
            icon: "ti-brand-youtube",
            bg: "#fef2f2",
            border: "#fecaca",
            color: "#991b1b",
            iconColor: "#ef4444",
          });
        }
        if (leader.instagram_url) {
          linkItems.push({
            url: leader.instagram_url,
            label: "Instagram",
            icon: "ti-brand-instagram",
            bg: "#fdf2f8",
            border: "#fbcfe8",
            color: "#9d174d",
            iconColor: "#e1306c",
          });
        }
        if (leader.website_url) {
          // Check if website_url has multiple comma/newline/space separated links
          const rawWebsites = leader.website_url.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean);
          for (const rawUrl of rawWebsites) {
            const lower = rawUrl.toLowerCase();
            let label = "Official Website";
            let icon = "ti-world";
            let bg = "#f8fafc";
            let border = "#cbd5e1";
            let color = "#0f172a";
            let iconColor = "#0f172a";

            if (rawUrl.startsWith("mailto:")) {
              const emailVal = rawUrl.replace(/^mailto:/i, "");
              linkItems.push({
                url: rawUrl,
                label: emailVal,
                icon: "ti-mail",
                bg: "#f0fdf4",
                border: "#bbf7d0",
                color: "#166534",
                iconColor: "#16a34a",
              });
              continue;
            } else if (rawUrl.startsWith("tel:")) {
              const phoneVal = rawUrl.replace(/^tel:/i, "");
              linkItems.push({
                url: rawUrl,
                label: phoneVal,
                icon: "ti-phone",
                bg: "#eff6ff",
                border: "#bfdbfe",
                color: "#1e40af",
                iconColor: "#2563eb",
              });
              continue;
            } else if (lower.includes("wa.me") || lower.includes("whatsapp.com")) {
              label = "WhatsApp";
              icon = "ti-brand-whatsapp";
              bg = "#f0fdf4";
              border = "#bbf7d0";
              color: "#166534";
              iconColor = "#22c55e";
            } else if (lower.includes("apple.com") || lower.includes("music.apple")) {
              label = "Apple Music";
              icon = "ti-brand-apple";
              bg = "#fff1f2";
              border = "#fecdd3";
              color = "#9f1239";
              iconColor = "#e11d48";
            } else if (lower.includes("soundcloud.com")) {
              label = "SoundCloud";
              icon = "ti-brand-soundcloud";
              bg = "#fff7ed";
              border = "#fed7aa";
              color = "#9a3412";
              iconColor = "#ea580c";
            } else if (lower.includes("facebook.com") || lower.includes("fb.com") || lower.includes("fb.me")) {
              label = "Facebook";
              icon = "ti-brand-facebook";
              bg = "#eff6ff";
              border = "#bfdbfe";
              color = "#1e40af";
              iconColor = "#2563eb";
            } else if (lower.includes("linkedin.com")) {
              label = "LinkedIn";
              icon = "ti-brand-linkedin";
              bg = "#eff6ff";
              border = "#bfdbfe";
              color = "#1e40af";
              iconColor = "#0a66c2";
            } else if (lower.includes("tiktok.com")) {
              label = "TikTok";
              icon = "ti-brand-tiktok";
              bg = "#f1f5f9";
              border = "#cbd5e1";
              color = "#0f172a";
              iconColor = "#0f172a";
            } else if (lower.includes("twitter.com") || lower.includes("x.com")) {
              label = "X / Twitter";
              icon = "ti-brand-x";
              bg = "#f8fafc";
              border = "#cbd5e1";
              color = "#0f172a";
              iconColor = "#0f172a";
            } else {
              try {
                const parsedHost = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`).hostname.replace(/^www\./, "");
                label = parsedHost || "Website";
              } catch {
                label = "Official Website";
              }
            }

            linkItems.push({
              url: rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`,
              label,
              icon,
              bg,
              border,
              color,
              iconColor,
            });
          }
        }

        if (linkItems.length === 0) return null;

        return (
          <div className="pastor-card">
            <div className="pastor-card-h">
              <div className="ic" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                <i className="ti ti-link"></i>
              </div>
              <h3>Links & Platforms</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '14px' }}>
              {linkItems.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: item.bg,
                    border: `1.5px solid ${item.border}`,
                    color: item.color,
                    padding: '10px 18px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <i className={`ti ${item.icon}`} style={{ fontSize: '18px', color: item.iconColor }}></i> {item.label}
                </a>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function AboutPane({
  leader,
  styleTags,
  instrumentTags,
  languageTags,
  availableForTags,
  feeModelTags,
}: {
  leader: any;
  styleTags: any[];
  instrumentTags: any[];
  languageTags: any[];
  availableForTags: any[];
  feeModelTags: any[];
}) {
  return (
    <div>
      {/* Biography */}
      {leader.bio && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic"><i className="ti ti-user"></i></div>
            <h3>Biography</h3>
          </div>
          <div className="bio">
            <p>{leader.bio}</p>
          </div>
        </div>
      )}

      {/* Available For & Booking Occasions */}
      {availableForTags.length > 0 && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic" style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
              <i className="ti ti-calendar-check"></i>
            </div>
            <h3>Available For</h3>
          </div>
          <div className="pastor-chips">
            {availableForTags.map((t) => (
              <span key={t.id} className="pastor-chip" style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}>
                ✓ {t.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Musical Styles */}
      {styleTags.length > 0 && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic" style={{ background: "linear-gradient(135deg,#f43f5e,#db2777)" }}><i className="ti ti-music"></i></div>
            <h3>Musical Style</h3>
          </div>
          <div className="pastor-chips">
            {styleTags.map((t) => (
              <span key={t.id} className="pastor-chip coral">{t.label}</span>
            ))}
          </div>
        </div>
      )}

      {/* Instruments */}
      {instrumentTags.length > 0 && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic" style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}><i className="ti ti-microphone-2"></i></div>
            <h3>Instruments</h3>
          </div>
          <div className="pastor-chips">
            {instrumentTags.map((t) => (
              <span key={t.id} className="pastor-chip">{t.label}</span>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languageTags.length > 0 && (
        <div className="pastor-card">
          <div className="pastor-card-h">
            <div className="ic" style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}><i className="ti ti-language"></i></div>
            <h3>Languages</h3>
          </div>
          <div className="pastor-chips">
            {languageTags.map((t) => (
              <span key={t.id} className="pastor-chip amber">{t.label}</span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}


function Sidebar({ leader }: { leader: any }) {
  const firstName = leader.display_name.split(' ')[0] ?? leader.display_name;

  return (
    <div className="sticky top-[130px]">
      <div className="contact-dark">
        <h3>Book {firstName}</h3>
        <div className="s">Lead time: {leader.lead_time || 'Flexible'}</div>
        <EnquiryForm
          pastorSlug={leader.slug}
          pastorFirstName={firstName}
          trigger={
            <button className="enq" style={{ width: '100%' }}>
              Send booking enquiry
            </button>
          }
        />
        {(() => {
          const availableTags = leader.tags.filter((t: any) => t.category === 'available_for');
          if (availableTags.length === 0) return null;
          return (
            <div className="pastor-chips" style={{ marginTop: '14px' }}>
              {availableTags.map((t: any) => (
                <span key={t.id} className="pastor-chip" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}>
                  {t.label}
                </span>
              ))}
            </div>
          );
        })()}
      </div>

      {(() => {
        const feeModelTags = leader.tags.filter((t: any) => t.category === 'fee_model');
        if (feeModelTags.length === 0 && !leader.years_leading) return null;
        return (
          <div className="pastor-card" style={{ padding: '20px' }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 800 }}>Quick Facts</h4>
            
            {leader.years_leading > 0 && (
              <div className="spec-row">
                <span className="k">Experience</span>
                <span className="v">{leader.years_leading} Years</span>
              </div>
            )}
            
            {feeModelTags.length > 0 && (
              <div className="spec-row">
                <span className="k">Fee Model</span>
                <span className="v">{feeModelTags.map((t: any) => t.label).join(', ')}</span>
              </div>
            )}
            
            {leader.travel_range && (
              <div className="spec-row">
                <span className="k">Travels</span>
                <span className="v">{leader.travel_range}</span>
              </div>
            )}

            {leader.lead_time && (
              <div className="spec-row">
                <span className="k">Notice</span>
                <span className="v">{leader.lead_time}</span>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
