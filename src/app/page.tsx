import React from "react";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-admin";
import TopNav from "@/components/layout/TopNav";
import HomeSearchBar from "@/components/home/HomeSearchBar";

import Image from "next/image";

export const revalidate = 0; // Dynamic SSR

export default async function Home() {
  const supabase = createAdminClient();

  // 1. Fetch featured verified & published churches with services and branding
  const { data: churches } = await supabase
    .from("churches")
    .select("id, slug, name, city, postcode, denomination, is_verified, cover_url, logo_url, created_at, address_line, church_services(*)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);

  // 2. Fetch upcoming events
  const { data: events } = await supabase
    .from("events")
    .select("id, slug, title, type, venue_name, city, starts_at, ends_at, price_label, is_free, cover_url, host_church:churches(name, slug)")
    .order("starts_at", { ascending: true })
    .limit(4);

  // 3. Fetch featured pastors
  const { data: pastors } = await supabase
    .from("pastors")
    .select("id, slug, full_name, title, avatar_url, city, country, is_verified, years_in_ministry, church_name_cache, church:churches(name, slug)")
    .eq("is_published", true)
    .order("is_verified", { ascending: false })
    .limit(4);

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
        overflow: "hidden",
      }}>
        {/* Background Hero Image */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
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
            <span>Discover Verified Churches, Events & Ministers</span>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: "clamp(32px, 5.5vw, 56px)",
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: "18px",
            maxWidth: "850px",
            margin: "0 auto 18px",
          }}>
            Find Churches, Events & Pastors <br className="hidden sm:inline" />
            <span style={{
              background: "linear-gradient(135deg, #f43f5e, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Near You & Around the World.
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: "16px",
            color: "rgba(255, 255, 255, 0.8)",
            maxWidth: "640px",
            margin: "0 auto 36px",
            lineHeight: 1.5,
          }}>
            Explore local church directories, attend conferences & gatherings, and connect with pastors & ministers.
          </p>

          {/* Search Bar */}
          <HomeSearchBar />
        </div>
      </section>


      {/* ── SECTION 1: CHURCHES ─────────────────────────────────────────────────── */}
      <section id="churches-section" style={{ maxWidth: "1200px", margin: "0 auto", padding: "50px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--cn-purple, #7c3aed)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "4px" }}>
              Verified Communities
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
              Churches
            </h2>
          </div>
          <Link href="/explore" style={{ fontSize: "14px", fontWeight: 700, color: "#7c3aed", textDecoration: "none" }}>
            View all on map &rarr;
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
          {(churches || []).map((church) => {
            const coverImage = church.cover_url ? church.cover_url.split("|||")[0] : null;
            const logoImage = church.logo_url ? church.logo_url.split("|||")[0] : null;

            // Check if church has services scheduled today
            const now = new Date();
            const daysShort = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
            const currentDay = daysShort[now.getDay()];
            const isOpenToday = Array.isArray(church.church_services) && church.church_services.some((srv: any) => {
              if (!srv.day) return false;
              const d = srv.day.toLowerCase().trim();
              return d.startsWith(currentDay) || currentDay.startsWith(d);
            });

            return (
              <Link
                key={church.id}
                href={`/church/${church.slug}`}
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: "1.5px solid #e2e8f0",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04)",
                  position: "relative",
                }}
              >
                {/* 1. Cover Photo */}
                <div style={{
                  height: "150px",
                  background: coverImage ? `url('${coverImage}') center/cover` : "linear-gradient(135deg, #7c3aed, #ec4899)",
                  position: "relative",
                }}>
                  {/* Top Right: Open Now / Closed Now Badge */}
                  <span style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: isOpenToday ? "rgba(22, 163, 74, 0.95)" : "rgba(15, 23, 42, 0.85)",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: "12px",
                    backdropFilter: "blur(6px)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}>
                    <span style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: isOpenToday ? "#4ade80" : "#94a3b8",
                    }} />
                    {isOpenToday ? "Open Now" : "Closed Now"}
                  </span>
                </div>

                {/* 2. Content Info with DP / Logo */}
                <div style={{ padding: "0 18px 18px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
                  
                  {/* Church DP / Avatar (Overlapping Cover) */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "-26px", marginBottom: "10px" }}>
                    <div style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "14px",
                      background: logoImage ? `url('${logoImage}') center/cover` : "linear-gradient(135deg, #7c3aed, #6366f1)",
                      border: "3px solid #ffffff",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontWeight: 900,
                      fontSize: "18px",
                      overflow: "hidden",
                    }}>
                      {!logoImage && (church.name ? church.name.slice(0, 2).toUpperCase() : "CH")}
                    </div>

                    {church.is_verified && (
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: "8px" }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {/* Church Name */}
                  <div style={{ marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "17.5px", fontWeight: 900, color: "#0f172a", margin: "0 0 5px 0", lineHeight: 1.3 }}>
                      {church.name}
                    </h3>
                    
                    {/* Location */}
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#64748b" }}>
                      <i className="ti ti-map-pin" style={{ color: "#e11d48", fontSize: "15px" }}></i>
                      <span>{church.city || church.address_line || "Location registered"}</span>
                      {church.postcode && <span style={{ color: "#94a3b8", fontSize: "12px" }}>({church.postcode})</span>}
                    </div>
                  </div>

                  {/* Footer Row: Denomination & Profile link */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                    {church.denomination ? (
                      <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#475569", background: "#f1f5f9", padding: "3px 9px", borderRadius: "8px" }}>
                        {church.denomination.split("|||")[0]}
                      </span>
                    ) : <span />}
                    
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


      {/* ── SECTION 2: EVENTS ───────────────────────────────────────────────────── */}
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


      {/* ── SECTION 3: PASTORS & LEADERS ───────────────────────────────────────── */}
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
          {(pastors || []).map((pastor) => (
            <Link
              key={pastor.id}
              href={`/pastor/${pastor.slug}`}
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "20px",
                border: "1.5px solid #e2e8f0",
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
                transition: "all 0.2s",
              }}
            >
              {pastor.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pastor.avatar_url} alt={pastor.full_name} style={{ width: "56px", height: "56px", borderRadius: "16px", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "18px", flexShrink: 0 }}>
                  {pastor.full_name.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {pastor.full_name}
                  </h4>
                  {pastor.is_verified && <i className="ti ti-rosette-discount-check-filled" style={{ color: "#22c55e", fontSize: "14px" }}></i>}
                </div>
                {pastor.title && <div style={{ fontSize: "12px", color: "#7c3aed", fontWeight: 700 }}>{pastor.title}</div>}
                <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  📍 {pastor.city || pastor.country || "Location"}
                </div>
              </div>
            </Link>
          ))}
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
              <li><a href="#events-section" style={{ color: "inherit", textDecoration: "none" }}>Christian Events</a></li>
              <li><Link href="/pastors" style={{ color: "inherit", textDecoration: "none" }}>Pastors & Speakers</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff", marginBottom: "16px" }}>Leaders & Admins</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px" }}>
              <li><Link href="/add-listing" style={{ color: "inherit", textDecoration: "none" }}>Add Church</Link></li>
              <li><Link href="/onboarding/pastor" style={{ color: "inherit", textDecoration: "none" }}>Add Pastor Profile</Link></li>
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
