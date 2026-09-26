import React from "react";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-admin";
import TopNav from "@/components/layout/TopNav";
import HomeChurchesSection from "@/components/home/HomeChurchesSection";
import HomePastorsSection from "@/components/home/HomePastorsSection";
import { HomeWorshipLeadersSection } from "@/components/home/HomeWorshipLeadersSection";
import { HomeEventsSection } from "@/components/home/HomeEventsSection";
import HomeSearchBar from "@/components/home/HomeSearchBar";
import Image from "next/image";

import { getFeaturedConfig } from "@/lib/featured";

export const revalidate = 0; // Dynamic SSR

export default async function Home() {
  const supabase = createAdminClient();

  // Load featured items selected from /admin
  const featuredConfig = await getFeaturedConfig();

  // 1. Fetch published churches with services and branding
  const { data: rawChurches } = await supabase
    .from("churches")
    .select("id, slug, name, city, postcode, denomination, is_verified, cover_url, logo_url, created_at, address_line, church_services(*)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  // Filter churches: Show ONLY admin-featured churches if configured, else top verified/curated (max 6)
  const allChurches = rawChurches || [];
  const featuredChurches = featuredConfig.churchIds.length > 0
    ? allChurches.filter((c) => featuredConfig.churchIds.includes(c.id))
    : allChurches.filter((c) => c.is_verified).slice(0, 6);

  // 2. Fetch pastors
  const { data: rawPastors } = await supabase
    .from("pastors")
    .select("id, slug, full_name, title, avatar_url, cover_photo_urls, city, country, is_verified, years_in_ministry, church_name_cache, church:churches(name, slug)")
    .eq("is_published", true)
    .order("is_verified", { ascending: false });

  const allPastors = rawPastors || [];
  const pastors = featuredConfig.pastorIds.length > 0
    ? allPastors.filter((p) => featuredConfig.pastorIds.includes(p.id))
    : allPastors.filter((p) => p.is_verified).slice(0, 8);

  // 3. Fetch worship leaders
  const { data: rawWorshipLeaders } = await supabase
    .from("worship_leaders")
    .select("id, display_name, slug, tagline, city, country, is_verified, is_published, created_at, avatar_url")
    .order("created_at", { ascending: false });

  const allWorshipLeaders = (rawWorshipLeaders || []).filter((w) => w.is_published !== false);
  const worshipLeaders = featuredConfig.worshipLeaderIds && featuredConfig.worshipLeaderIds.length > 0
    ? (rawWorshipLeaders || []).filter((w) => featuredConfig.worshipLeaderIds.includes(w.id))
    : allWorshipLeaders.slice(0, 8);

  // 4. Fetch events & apply sequence sorting
  const { data: rawEvents } = await supabase
    .from("events")
    .select("id, slug, title, type, venue_name, city, starts_at, ends_at, price_label, is_free, cover_url, host_church:churches(name, slug)");

  const allEvents = rawEvents || [];
  const selectedEvents = featuredConfig.eventIds.length > 0
    ? allEvents.filter((e) => featuredConfig.eventIds.includes(e.id))
    : allEvents;

  // Sorting sequence:
  // 1. Near future events (starts_at >= now && starts_at <= now + 30 days) in chronological order
  // 2. Far future events (starts_at > now + 30 days) in chronological order
  // 3. Past events (starts_at < now) ordered from recent past to far past (descending)
  const nowMs = Date.now();
  const thirtyDaysMs = nowMs + 30 * 24 * 60 * 60 * 1000;

  const nearFutureEvents: any[] = [];
  const farFutureEvents: any[] = [];
  const pastEvents: any[] = [];

  selectedEvents.forEach((ev) => {
    const evTime = ev.starts_at ? new Date(ev.starts_at).getTime() : 0;
    if (isNaN(evTime) || evTime < nowMs) {
      pastEvents.push(ev);
    } else if (evTime <= thirtyDaysMs) {
      nearFutureEvents.push(ev);
    } else {
      farFutureEvents.push(ev);
    }
  });

  // Sort near future ascending (closest upcoming first)
  nearFutureEvents.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  // Sort far future ascending (upcoming chronologically)
  farFutureEvents.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  // Sort past descending (most recent past event first)
  pastEvents.sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());

  const events = [...nearFutureEvents, ...farFutureEvents, ...pastEvents];

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", color: "#0f172a", fontFamily: "inherit" }}>
      {/* Navigation */}
      <TopNav />

      {/* ── 1. HERO SECTION ──────────────────────────────────────────────────────── */}
      <section style={{
        position: "relative",
        background: "#0d0622",
        color: "#ffffff",
        padding: "90px 24px 110px",
        textAlign: "center",
        zIndex: 20,
      }}>
        {/* Background Hero Image */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
          <Image
            src="/hero-banner.jpg"
            alt="Church Sanctuary Worship"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center 30%", opacity: 0.88 }}
          />
          {/* Light gradient overlay for text readability while keeping the image vibrant and bright */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(15, 7, 40, 0.45) 0%, rgba(15, 7, 40, 0.55) 50%, rgba(15, 7, 40, 0.85) 100%)",
          }} />
        </div>

        {/* Subtle radial center glow */}
        <div style={{
          position: "absolute",
          top: "0",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "100%",
          background: "radial-gradient(circle at 50% 30%, rgba(124, 58, 237, 0.25) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }} />

        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          
          {/* Trust Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            padding: "6px 16px",
            borderRadius: "30px",
            fontSize: "12.5px",
            fontWeight: 700,
            marginBottom: "24px",
            backdropFilter: "blur(8px)",
          }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
            <span>Discover Churches, Pastors, Worship Leaders & Events</span>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: "clamp(32px, 5.5vw, 56px)",
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: "18px",
            maxWidth: "920px",
            margin: "0 auto 18px",
          }}>
            Find Churches, Pastors, <br className="hidden sm:inline" />
            <span style={{
              background: "linear-gradient(135deg, #f43f5e, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Worship Leaders & Events Near You & Around the World.
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: "16px",
            color: "rgba(255, 255, 255, 0.8)",
            maxWidth: "680px",
            margin: "0 auto 36px",
            lineHeight: 1.5,
          }}>
            Explore verified churches, connect with pastors and worship leaders, and attend upcoming gatherings & conferences.
          </p>

          {/* Hero Search Bar */}
          <HomeSearchBar />
        </div>
      </section>

      {/* ── SECTION 1: CHURCHES DIRECTORY (Live Search & Filter Component) ── */}
      <HomeChurchesSection initialChurches={featuredChurches || []} />


      {/* ── SECTION 2: PASTORS & LEADERS ───────────────────────────────────────── */}
      <HomePastorsSection pastors={pastors || []} />


      {/* ── SECTION 3: WORSHIP LEADERS ─────────────────────────────────────────── */}
      <HomeWorshipLeadersSection worshipLeaders={worshipLeaders || []} />

      {/* ── SECTION 4: EVENTS ───────────────────────────────────────────────────── */}
      <HomeEventsSection events={events || []} />


      {/* ── 7. FOR CHURCH LEADERS / CTA BANNER ───────────────────────────────────── */}
      <section style={{ maxWidth: "1200px", margin: "30px auto 60px", padding: "0 24px" }}>
        <div style={{
          background: "linear-gradient(135deg, #1e0a4a 0%, #2d1b6e 100%)",
          borderRadius: "28px",
          padding: "48px 44px",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "32px",
          boxShadow: "0 20px 40px -10px rgba(30, 10, 74, 0.4)",
        }}>
          <div style={{ maxWidth: "550px" }}>
            <span style={{ background: "rgba(244,63,94,0.25)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.4)", fontSize: "12px", fontWeight: 800, padding: "4px 12px", borderRadius: "20px", display: "inline-block", marginBottom: "14px" }}>
              For Pastors & Church Administrators
            </span>
            <h2 style={{ fontSize: "30px", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 10px 0" }}>
              List Your Church or Profile
            </h2>
            <p style={{ fontSize: "14.5px", color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.5 }}>
              Help local seekers find your church, discover service times, book pastors for conferences, and connect with your ministries.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/add-listing"
              style={{
                background: "linear-gradient(135deg, #f43f5e, #7c3aed)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "14px",
                padding: "14px 26px",
                borderRadius: "12px",
                textDecoration: "none",
                textAlign: "center",
                boxShadow: "0 4px 16px rgba(244,63,94,0.35)",
              }}
            >
              Add Church Listing &rarr;
            </Link>
            <Link
              href="/onboarding/pastor"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.25)",
                fontWeight: 700,
                fontSize: "14px",
                padding: "14px 22px",
                borderRadius: "12px",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              Add Pastor Profile
            </Link>
          </div>
        </div>
      </section>


      {/* ── 8. FOOTER ────────────────────────────────────────────────────────────── */}
      <footer style={{ background: "#0f172a", color: "#94a3b8", padding: "50px 24px 30px", borderTop: "1px solid #1e293b" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", marginBottom: "36px" }}>
          <div>
            <div style={{ marginBottom: "14px", display: "flex", alignItems: "center" }}>
              <Image 
                src="/icon.png" 
                alt="ChurchNavigator" 
                width={240} 
                height={75} 
                style={{ height: "48px", width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} 
              />
            </div>
            <p style={{ fontSize: "13.5px", lineHeight: 1.6 }}>
              Connecting seekers and believers with vibrant, Christ-centered churches, events, and ministries around the globe.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff", marginBottom: "16px" }}>Directory</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px" }}>
              <li><Link href="/explore" style={{ color: "inherit", textDecoration: "none" }}>Interactive Map</Link></li>
              <li><a href="#churches-section" style={{ color: "inherit", textDecoration: "none" }}>Churches Directory</a></li>
              <li><a href="#pastors-section" style={{ color: "inherit", textDecoration: "none" }}>Pastors & Speakers</a></li>
              <li><a href="#worship-leaders-section" style={{ color: "inherit", textDecoration: "none" }}>Worship Leaders</a></li>
              <li><a href="#events-section" style={{ color: "inherit", textDecoration: "none" }}>Christian Events</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff", marginBottom: "16px" }}>Leaders & Admins</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px" }}>
              <li><Link href="/add-listing" style={{ color: "inherit", textDecoration: "none" }}>Add Church</Link></li>
              <li><Link href="/onboarding/pastor" style={{ color: "inherit", textDecoration: "none" }}>Add Pastor Profile</Link></li>
              <li><Link href="/onboarding/worship-leader" style={{ color: "inherit", textDecoration: "none" }}>Add Worship Leader</Link></li>
              <li><Link href="/onboarding/events" style={{ color: "inherit", textDecoration: "none" }}>Host Event</Link></li>
              <li><Link href="/login" style={{ color: "inherit", textDecoration: "none" }}>Dashboard Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff", marginBottom: "16px" }}>Platform</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px" }}>
              <li><Link href="/about" style={{ color: "#94a3b8", textDecoration: "none" }}>About Us</Link></li>
              <li><Link href="/terms" style={{ color: "#94a3b8", textDecoration: "none" }}>Terms of Service</Link></li>
              <li><Link href="/privacy" style={{ color: "#94a3b8", textDecoration: "none" }}>Privacy & GDPR</Link></li>
            </ul>
          </div>
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", paddingTop: "20px", borderTop: "1px solid #1e293b", textAlign: "center", fontSize: "12px" }}>
          © {new Date().getFullYear()} ChurchNavigator. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
