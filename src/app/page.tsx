import React from "react";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-admin";
import TopNav from "@/components/layout/TopNav";
import HomeChurchesSection from "@/components/home/HomeChurchesSection";
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
    : allPastors.filter((p) => p.is_verified).slice(0, 4);

  // 3. Fetch worship leaders
  const { data: rawWorshipLeaders } = await supabase
    .from("worship_leaders")
    .select("id, slug, display_name, full_name, stage_name, title, avatar_url, cover_photo_urls, city, country, is_verified, tagline, primary_church_name")
    .eq("is_published", true)
    .order("is_verified", { ascending: false });

  const allWorshipLeaders = rawWorshipLeaders || [];
  const worshipLeaders = featuredConfig.worshipLeaderIds.length > 0
    ? allWorshipLeaders.filter((w) => featuredConfig.worshipLeaderIds.includes(w.id))
    : allWorshipLeaders.slice(0, 4);

  // 4. Fetch upcoming events
  const { data: rawEvents } = await supabase
    .from("events")
    .select("id, slug, title, type, venue_name, city, starts_at, ends_at, price_label, is_free, cover_url, host_church:churches(name, slug)")
    .order("starts_at", { ascending: true });

  const allEvents = rawEvents || [];
  const events = featuredConfig.eventIds.length > 0
    ? allEvents.filter((e) => featuredConfig.eventIds.includes(e.id))
    : allEvents.slice(0, 4);

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
            Find Churches, Pastors, Worship Leaders <br className="hidden sm:inline" />
            <span style={{
              background: "linear-gradient(135deg, #f43f5e, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              & Events Near You & Around the World.
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
      <section id="pastors-section" style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#7c3aed", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "4px" }}>
              Leadership & Speakers
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
              Pastors & Ministers
            </h2>
          </div>
          <Link href="/pastors" style={{ fontSize: "14px", fontWeight: 700, color: "#7c3aed", textDecoration: "none" }}>
            Browse all pastors &rarr;
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "24px" }}>
          {(pastors || []).map((pastor) => {
            const coverImage = Array.isArray(pastor.cover_photo_urls) && pastor.cover_photo_urls.length > 0
              ? pastor.cover_photo_urls[0]
              : null;
            const pastorChurch = Array.isArray(pastor.church)
              ? pastor.church[0]
              : pastor.church;
            return (
              <Link
                key={pastor.id}
                href={`/pastor/${pastor.slug}`}
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: "1.5px solid #e2e8f0",
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                {/* 1. Cover Photo Area */}
                <div style={{
                  height: "120px",
                  background: coverImage ? `url('${coverImage}') center/cover` : "linear-gradient(135deg, #a855f7, #6366f1)",
                  position: "relative",
                }} />

                {/* 2. Content Info with DP */}
                <div style={{ padding: "0 18px 18px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  
                  {/* Pastor DP / Avatar (Overlapping Cover) */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "-26px", marginBottom: "12px", position: "relative", zIndex: 2 }}>
                    {pastor.avatar_url ? (
                      <div style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "14px",
                        background: `url('${pastor.avatar_url}') center/cover`,
                        border: "3px solid #ffffff",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        overflow: "hidden",
                      }} />
                    ) : (
                      <div style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                        border: "3px solid #ffffff",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        fontWeight: 900,
                        fontSize: "18px",
                      }}>
                        {pastor.full_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    {pastor.is_verified && (
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: "8px" }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {/* Pastor Details */}
                  <div style={{ marginBottom: "14px" }}>
                    {pastor.title && (
                      <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>
                        {pastor.title}
                      </span>
                    )}
                    
                    <h3 style={{ fontSize: "17.5px", fontWeight: 900, color: "#0f172a", margin: "0 0 8px 0", lineHeight: 1.3 }}>
                      {pastor.full_name}
                    </h3>
                    
                    {/* Church Affiliation */}
                    {(pastorChurch?.name || pastor.church_name_cache) && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#475569", marginBottom: "6px" }}>
                        <i className="ti ti-building-church" style={{ color: "#7c3aed", fontSize: "14px" }}></i>
                        <span style={{ fontWeight: 600 }}>{pastorChurch?.name || pastor.church_name_cache}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#475569", background: "#f1f5f9", padding: "3px 9px", borderRadius: "8px" }}>
                      {pastor.years_in_ministry ? `${pastor.years_in_ministry} Yrs Ministry` : "Minister"}
                    </span>
                    
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#7c3aed" }}>
                      Profile &rarr;
                    </span>
                  </div>

                </div>
              </Link>
            );
          })}
        </div>
      </section>


      {/* ── SECTION 3: WORSHIP LEADERS ─────────────────────────────────────────── */}
      <section id="worship-leaders-section" style={{ background: "#fbfbfe", padding: "60px 24px", borderTop: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#e11d48", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "4px" }}>
                Praise & Music
              </div>
              <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
                Worship Leaders & Musicians
              </h2>
            </div>
            <Link href="/explore" style={{ fontSize: "14px", fontWeight: 700, color: "#e11d48", textDecoration: "none" }}>
              Explore worship leaders &rarr;
            </Link>
          </div>

          {(!worshipLeaders || worshipLeaders.length === 0) ? (
            <div style={{ textAlign: "center", padding: "40px 20px", background: "#ffffff", borderRadius: "20px", border: "1.5px dashed #cbd5e1" }}>
              <i className="ti ti-microphone-2" style={{ fontSize: "40px", color: "#94a3b8", marginBottom: "10px", display: "block" }}></i>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>No worship leaders registered yet</h3>
              <p style={{ fontSize: "13.5px", color: "#64748b", margin: "0 0 16px 0" }}>Be among the first worship artists and directors to share your profile.</p>
              <Link href="/onboarding/worship-leader" style={{ background: "#e11d48", color: "#fff", padding: "8px 18px", borderRadius: "10px", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}>
                Join as Worship Leader
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "24px" }}>
              {worshipLeaders.map((leader) => {
                const coverImage = Array.isArray(leader.cover_photo_urls) && leader.cover_photo_urls.length > 0
                  ? leader.cover_photo_urls[0]
                  : null;

                return (
                  <Link
                    key={leader.id}
                    href={`/worship-leader/${leader.slug}`}
                    style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      overflow: "hidden",
                      border: "1.5px solid #e2e8f0",
                      textDecoration: "none",
                      color: "inherit",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                  >
                    {/* Cover */}
                    <div style={{
                      height: "120px",
                      background: coverImage ? `url('${coverImage}') center/cover` : "linear-gradient(135deg, #f43f5e, #db2777)",
                      position: "relative",
                    }} />

                    {/* Content */}
                    <div style={{ padding: "0 18px 18px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "-26px", marginBottom: "12px", position: "relative", zIndex: 2 }}>
                        {leader.avatar_url ? (
                          <div style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "14px",
                            background: `url('${leader.avatar_url}') center/cover`,
                            border: "3px solid #ffffff",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                            overflow: "hidden",
                          }} />
                        ) : (
                          <div style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "14px",
                            background: "linear-gradient(135deg, #f43f5e, #e11d48)",
                            border: "3px solid #ffffff",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            fontWeight: 900,
                            fontSize: "18px",
                          }}>
                            {(leader.display_name || leader.full_name || "WL").slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        {leader.is_verified && (
                          <span style={{ fontSize: "11px", fontWeight: 800, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: "8px" }}>
                            ✓ Verified
                          </span>
                        )}
                      </div>

                      <div style={{ marginBottom: "14px" }}>
                        <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#e11d48", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>
                          {leader.title || "Worship Leader"}
                        </span>
                        
                        <h3 style={{ fontSize: "17.5px", fontWeight: 900, color: "#0f172a", margin: "0 0 8px 0", lineHeight: 1.3 }}>
                          {leader.display_name || leader.full_name}
                        </h3>

                        {leader.city && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#475569", marginBottom: "6px" }}>
                            <i className="ti ti-map-pin" style={{ color: "#e11d48", fontSize: "14px" }}></i>
                            <span style={{ fontWeight: 600 }}>{leader.city}{leader.country ? `, ${leader.country}` : ""}</span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                        <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#475569", background: "#f1f5f9", padding: "3px 9px", borderRadius: "8px" }}>
                          {leader.tagline ? leader.tagline.slice(0, 22) : "Artist"}
                        </span>
                        
                        <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#e11d48" }}>
                          Profile &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>


      {/* ── SECTION 4: EVENTS ───────────────────────────────────────────────────── */}
      <section id="events-section" style={{ background: "#f8fafc", padding: "60px 24px", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#e11d48", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "4px" }}>
                Upcoming Gatherings
              </div>
              <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
                Events & Conferences
              </h2>
            </div>
            <Link href="/events" style={{ fontSize: "14px", fontWeight: 700, color: "#e11d48", textDecoration: "none" }}>
              View all events &rarr;
            </Link>
          </div>

          {(!events || events.length === 0) ? (
            <div style={{ textAlign: "center", padding: "40px 20px", background: "#ffffff", borderRadius: "20px", border: "1.5px dashed #cbd5e1" }}>
              <i className="ti ti-calendar-event" style={{ fontSize: "40px", color: "#94a3b8", marginBottom: "10px", display: "block" }}></i>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>No upcoming public events scheduled</h3>
              <p style={{ fontSize: "13.5px", color: "#64748b", margin: "0 0 16px 0" }}>Be the first church or ministry to publish a conference, workshop or worship night.</p>
              <Link href="/onboarding/events" style={{ background: "#7c3aed", color: "#fff", padding: "8px 18px", borderRadius: "10px", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}>
                Publish Event
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "20px" }}>
              {events.map((ev) => {
                const dateStr = ev.starts_at ? new Date(ev.starts_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", weekday: "short" }) : "Upcoming";
                const timeStr = ev.starts_at ? new Date(ev.starts_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "";

                return (
                  <Link
                    key={ev.id}
                    href={`/events/${ev.slug}`}
                    style={{
                      background: "#ffffff",
                      borderRadius: "18px",
                      overflow: "hidden",
                      border: "1.5px solid #e2e8f0",
                      textDecoration: "none",
                      color: "inherit",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div style={{
                      height: "140px",
                      background: ev.cover_url ? `url('${ev.cover_url}') center/cover` : "linear-gradient(135deg, #e11d48, #fb7185)",
                      position: "relative",
                    }}>
                      <span style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        background: "rgba(15, 23, 42, 0.85)",
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: 800,
                        padding: "3px 9px",
                        borderRadius: "8px",
                        backdropFilter: "blur(4px)",
                      }}>
                        {ev.type || "Conference"}
                      </span>

                      <span style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: ev.is_free ? "rgba(22, 163, 74, 0.95)" : "rgba(124, 58, 237, 0.95)",
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: 800,
                        padding: "3px 9px",
                        borderRadius: "8px",
                      }}>
                        {ev.price_label || (ev.is_free ? "Free" : "Ticketed")}
                      </span>
                    </div>

                    <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: "12px", color: "#e11d48", fontWeight: 800, marginBottom: "4px" }}>
                          📅 {dateStr} {timeStr ? `· ${timeStr}` : ""}
                        </div>
                        <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0", lineHeight: 1.3 }}>
                          {ev.title}
                        </h3>
                        <div style={{ fontSize: "12.5px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                          <i className="ti ti-map-pin" style={{ color: "#94a3b8" }}></i>
                          <span>{ev.venue_name || ev.city || "Venue TBA"}</span>
                        </div>
                      </div>

                      <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #f1f5f9", fontSize: "12.5px", fontWeight: 700, color: "#7c3aed" }}>
                        View Event &rarr;
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>


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
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#ffffff", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg,#f43f5e,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>✝</span>
              ChurchNavigator
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
              <li><span style={{ color: "#94a3b8" }}>About Us</span></li>
              <li><span style={{ color: "#94a3b8" }}>Terms of Service</span></li>
              <li><span style={{ color: "#94a3b8" }}>Privacy & GDPR</span></li>
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
