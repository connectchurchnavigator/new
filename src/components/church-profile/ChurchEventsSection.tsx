"use client";

import React from "react";
import Link from "next/link";
import { EventCard } from "@/lib/events-types";

interface ChurchEventsSectionProps {
  events: EventCard[];
  churchName: string;
}

export default function ChurchEventsSection({ events, churchName }: ChurchEventsSectionProps) {
  const [eventTab, setEventTab] = React.useState<"upcoming" | "past">("upcoming");

  if (!events || events.length === 0) {
    return (
      <div className="panel" style={{ padding: "40px 24px", textAlign: "center", background: "#fff", borderRadius: "20px", border: "1.5px dashed #e2e8f0" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#f5f3ff", color: "#7c3aed", display: "grid", placeItems: "center", margin: "0 auto 16px", fontSize: "24px" }}>
          <i className="ti ti-calendar-off"></i>
        </div>
        <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
          No events scheduled
        </h3>
        <p style={{ fontSize: "14px", color: "var(--muted)", maxWidth: "420px", margin: "0 auto 20px" }}>
          Events organized by or hosted at {churchName} will automatically be displayed here.
        </p>
        <Link
          href="/onboarding/events"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, #7c3aed, #9333ea)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "13.5px",
            padding: "10px 20px",
            borderRadius: "30px",
            textDecoration: "none",
            boxShadow: "0 8px 18px -6px rgba(124, 58, 237, 0.4)"
          }}
        >
          <i className="ti ti-plus"></i> Create an Event
        </Link>
      </div>
    );
  }

  const now = new Date().getTime();
  const upcomingEvents = events
    .filter((e) => {
      const t = new Date(e.starts_at).getTime();
      return isNaN(t) || t >= now - 1000 * 60 * 60 * 24; // buffer 1 day
    })
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  const pastEvents = events
    .filter((e) => {
      const t = new Date(e.starts_at).getTime();
      return !isNaN(t) && t < now - 1000 * 60 * 60 * 24;
    })
    .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());

  const displayedEvents = eventTab === "upcoming" ? upcomingEvents : pastEvents;

  const badgeColors = [
    "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px", flexWrap: "wrap", gap: "12px" }}>
        {/* Upcoming vs Past Pill Filter */}
        <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "12px", gap: "4px" }}>
          <button
            type="button"
            onClick={() => setEventTab("upcoming")}
            style={{
              padding: "7px 16px",
              borderRadius: "9px",
              border: "none",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer",
              background: eventTab === "upcoming" ? "#ffffff" : "transparent",
              color: eventTab === "upcoming" ? "#7c3aed" : "#64748b",
              boxShadow: eventTab === "upcoming" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            Upcoming Events ({upcomingEvents.length})
          </button>
          <button
            type="button"
            onClick={() => setEventTab("past")}
            style={{
              padding: "7px 16px",
              borderRadius: "9px",
              border: "none",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer",
              background: eventTab === "past" ? "#ffffff" : "transparent",
              color: eventTab === "past" ? "#7c3aed" : "#64748b",
              boxShadow: eventTab === "past" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            Past Events ({pastEvents.length})
          </button>
        </div>

        <Link
          href="/onboarding/events"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#7c3aed",
            fontWeight: 700,
            fontSize: "13px",
            textDecoration: "none"
          }}
        >
          <i className="ti ti-plus"></i> Add Event
        </Link>
      </div>

      {displayedEvents.length === 0 ? (
        <div style={{ padding: "36px 20px", textAlign: "center", background: "#f8fafc", borderRadius: "16px", border: "1.5px dashed #e2e8f0" }}>
          <i className="ti ti-calendar-event" style={{ fontSize: "32px", color: "#94a3b8", display: "block", marginBottom: "8px" }}></i>
          <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#1e293b", margin: "0 0 4px" }}>
            No {eventTab === "upcoming" ? "upcoming" : "past"} events
          </h4>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            {eventTab === "upcoming" ? "There are no upcoming scheduled gatherings right now." : "No previous events recorded for this church."}
          </p>
        </div>
      ) : (
      <div className="event-list">
        {displayedEvents.map((ev, idx) => {
          const dateObj = new Date(ev.starts_at);
          const day = !isNaN(dateObj.getDate()) ? String(dateObj.getDate()) : "—";
          const month = !isNaN(dateObj.getDate())
            ? dateObj.toLocaleString("en-GB", { month: "short" }).toUpperCase()
            : "EVENT";

          const dateBg = badgeColors[idx % badgeColors.length];
          const timeStr = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : null;

          const locationText = [ev.venue_name, ev.city].filter(Boolean).join(", ") || ev.address;

          return (
            <div
              key={ev.id}
              className="event-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
                background: "#ffffff",
                border: "1.5px solid #f1f5f9",
                borderRadius: "18px",
                padding: "16px 20px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                transition: "transform 0.18s, box-shadow 0.18s"
              }}
            >
              {/* Date Box */}
              <div
                style={{
                  width: "58px",
                  height: "58px",
                  borderRadius: "14px",
                  background: dateBg,
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
                }}
              >
                <div style={{ fontSize: "19px", fontWeight: 900, lineHeight: 1 }}>{day}</div>
                <div style={{ fontSize: "10px", fontWeight: 800, opacity: 0.9, marginTop: "2px", letterSpacing: "0.5px" }}>
                  {month}
                </div>
              </div>

              {/* Cover image if available */}
              {ev.cover_url && (
                <img
                  src={ev.cover_url}
                  alt={ev.title}
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "12px",
                    objectFit: "cover",
                    flexShrink: 0
                  }}
                />
              )}

              {/* Event Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                  {ev.type && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        background: "#f5f3ff",
                        color: "#7c3aed",
                        border: "1px solid #ddd6fe",
                        padding: "2px 9px",
                        borderRadius: "20px"
                      }}
                    >
                      {ev.type}
                    </span>
                  )}
                  {ev.is_free !== undefined && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        background: ev.is_free ? "#f0fdf4" : "#fef3c7",
                        color: ev.is_free ? "#16a34a" : "#d97706",
                        border: ev.is_free ? "1px solid #bbf7d0" : "1px solid #fde68a",
                        padding: "2px 9px",
                        borderRadius: "20px"
                      }}
                    >
                      {ev.is_free ? "Free entry" : (ev.price_label || "Paid ticket")}
                    </span>
                  )}
                </div>

                <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px", lineHeight: 1.3 }}>
                  {ev.title}
                </h4>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "12.5px", color: "#64748b", fontWeight: 600 }}>
                  {timeStr && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <i className="ti ti-clock" style={{ color: "#7c3aed" }}></i> {timeStr}
                    </span>
                  )}
                  {locationText && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <i className="ti ti-map-pin" style={{ color: "#ef4444" }}></i> {locationText}
                    </span>
                  )}
                </div>
              </div>

              {/* Action button */}
              <div>
                <Link
                  href={ev.slug ? `/events/${ev.slug}` : "#"}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 700,
                    padding: "9px 18px",
                    borderRadius: "30px",
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
                    whiteSpace: "nowrap"
                  }}
                >
                  View Details
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
