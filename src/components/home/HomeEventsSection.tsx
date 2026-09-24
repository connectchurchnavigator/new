"use client";

import { useState } from "react";
import Link from "next/link";

interface HomeEventsSectionProps {
  events: any[];
}

export function HomeEventsSection({ events }: HomeEventsSectionProps) {
  const [showAll, setShowAll] = useState(false);

  // Show up to 8 events initially before View More
  const DISPLAY_LIMIT = 8;
  const hasMore = events && events.length > DISPLAY_LIMIT;
  const displayedEvents = showAll || !hasMore
    ? (events || [])
    : events.slice(0, DISPLAY_LIMIT);

  return (
    <section id="events-section" style={{ background: "#f8fafc", padding: "60px 24px", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#e11d48", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "4px" }}>
              Gatherings
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
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "20px" }}>
              {displayedEvents.map((ev) => {
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

            {hasMore && (
              <div style={{ textAlign: "center", marginTop: "36px" }}>
                <button
                  onClick={() => setShowAll(!showAll)}
                  style={{
                    background: showAll ? "#ffffff" : "linear-gradient(135deg, #7c3aed, #6366f1)",
                    color: showAll ? "#7c3aed" : "#ffffff",
                    border: showAll ? "1.5px solid #a855f7" : "none",
                    padding: "12px 28px",
                    borderRadius: "14px",
                    fontWeight: 800,
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: showAll ? "none" : "0 8px 20px -4px rgba(124, 58, 237, 0.35)",
                    transition: "all 0.2s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>{showAll ? "Show Less" : `View More Events (${events.length - DISPLAY_LIMIT} more)`}</span>
                  <i className={`ti ${showAll ? "ti-chevron-up" : "ti-chevron-down"}`} style={{ fontSize: "16px" }}></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
