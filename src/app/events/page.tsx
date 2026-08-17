import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-admin";
import TopNav from "@/components/layout/TopNav";

export const metadata: Metadata = {
  title: "Christian Events & Conferences | ChurchNavigator",
  description: "Discover upcoming worship nights, conferences, youth gatherings, and church events across the UK and globally.",
};

export const revalidate = 0;

export default async function EventsDirectoryPage() {
  const supabase = createAdminClient();

  const { data: events } = await supabase
    .from("events")
    .select(`
      *,
      host_church:churches(id, name, slug, logo_url, city),
      host_pastor:pastors(id, full_name, slug, avatar_url)
    `)
    .order("starts_at", { ascending: true })
    .limit(40);

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopNav />

      {/* Header Banner */}
      <div style={{ background: "radial-gradient(circle at 50% 0%, #2e1065 0%, #0f0728 100%)", color: "#ffffff", padding: "60px 24px 70px", textAlign: "center" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <span style={{ fontSize: "12px", fontWeight: 800, background: "rgba(225, 29, 72, 0.25)", color: "#f43f5e", border: "1px solid rgba(225, 29, 72, 0.4)", padding: "4px 14px", borderRadius: "20px", display: "inline-block", marginBottom: "12px" }}>
            📅 Gatherings & Conferences
          </span>
          <h1 style={{ fontSize: "36px", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 10px 0" }}>
            Christian Events & Gatherings
          </h1>
          <p style={{ fontSize: "15.5px", color: "rgba(255,255,255,0.8)", margin: 0 }}>
            Discover upcoming church conferences, revival nights, youth summits, and community outreaches.
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px", width: "100%", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>All Upcoming Events</h2>
          <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#64748b" }}>{events?.length || 0} events listed</span>
        </div>

        {(!events || events.length === 0) ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: "20px", border: "1.5px dashed #cbd5e1" }}>
            <i className="ti ti-calendar-off" style={{ fontSize: "48px", color: "#94a3b8", marginBottom: "12px", display: "block" }}></i>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#1e293b", margin: "0 0 6px 0" }}>No public events scheduled</h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 20px 0" }}>Publish your conference, retreat or workshop to reach thousands of believers.</p>
            <Link href="/onboarding/events" style={{ background: "#7c3aed", color: "#fff", padding: "10px 22px", borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 700 }}>
              + Create Event
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
            {events.map((ev) => {
              const dateStr = ev.starts_at ? new Date(ev.starts_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", weekday: "short" }) : "Upcoming";
              const timeStr = ev.starts_at ? new Date(ev.starts_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "";

              return (
                <Link
                  key={ev.id}
                  href={`/events/${ev.slug}`}
                  style={{
                    background: "#ffffff",
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: "1.5px solid #e2e8f0",
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04)",
                    transition: "transform 0.2s",
                  }}
                >
                  <div style={{
                    height: "150px",
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

                  <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "12px", color: "#e11d48", fontWeight: 800, marginBottom: "4px" }}>
                        📅 {dateStr} {timeStr ? `· ${timeStr}` : ""}
                      </div>
                      <h3 style={{ fontSize: "16.5px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0", lineHeight: 1.3 }}>
                        {ev.title}
                      </h3>
                      <div style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                        <i className="ti ti-map-pin" style={{ color: "#94a3b8" }}></i>
                        <span>{ev.venue_name || ev.city || "Venue TBA"}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f1f5f9", fontSize: "13px", fontWeight: 700, color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>View Details</span>
                      <span>&rarr;</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
