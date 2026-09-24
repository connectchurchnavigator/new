"use client";

import React, { useState } from "react";
import type { PastorProfile } from "@/lib/pastor";

interface PastorEventsSectionProps {
  pastor: PastorProfile;
}

export default function PastorEventsSection({ pastor }: PastorEventsSectionProps) {
  const [eventTab, setEventTab] = useState<"upcoming" | "past">("upcoming");
  const events = pastor.events || [];

  const now = new Date().getTime();
  const upcomingEvents = events
    .filter((e) => {
      const t = new Date(e.event_date).getTime();
      return isNaN(t) || t >= now - 1000 * 60 * 60 * 24; // buffer 1 day
    })
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  const pastEvents = events
    .filter((e) => {
      const t = new Date(e.event_date).getTime();
      return !isNaN(t) && t < now - 1000 * 60 * 60 * 24;
    })
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

  const displayedEvents = eventTab === "upcoming" ? upcomingEvents : pastEvents;

  const badgeColors = [
    "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  ];

  return (
    <div>
      <div className="pastor-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div className="pastor-card-h" style={{ margin: 0 }}>
            <div className="ic" style={{ background: "#ec4899", color: "#fff" }}>
              <i className="ti ti-calendar-event"></i>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f0f1a", margin: 0 }}>Events & Gatherings</h3>
          </div>

          {/* Upcoming vs Past Pill Selector */}
          <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "12px", gap: "4px" }}>
            <button
              type="button"
              onClick={() => setEventTab("upcoming")}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "12.5px",
                fontWeight: 800,
                cursor: "pointer",
                background: eventTab === "upcoming" ? "#ffffff" : "transparent",
                color: eventTab === "upcoming" ? "#7c3aed" : "#64748b",
                boxShadow: eventTab === "upcoming" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              Upcoming ({upcomingEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setEventTab("past")}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "12.5px",
                fontWeight: 800,
                cursor: "pointer",
                background: eventTab === "past" ? "#ffffff" : "transparent",
                color: eventTab === "past" ? "#7c3aed" : "#64748b",
                boxShadow: eventTab === "past" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              Past ({pastEvents.length})
            </button>
          </div>
        </div>

        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {displayedEvents.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "16px", border: "1.5px dashed #e2e8f0" }}>
              <i className="ti ti-calendar-off" style={{ fontSize: "32px", color: "#94a3b8", display: "block", marginBottom: "8px" }}></i>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b" }}>
                No {eventTab === "upcoming" ? "upcoming" : "past"} events scheduled
              </div>
              <p style={{ fontSize: "13px", margin: "4px 0 0", color: "#64748b" }}>
                {eventTab === "upcoming"
                  ? "Upcoming events organized by or featuring this pastor will appear here."
                  : "No previous events recorded for this pastor."}
              </p>
            </div>
          ) : (
            displayedEvents.map((e, idx) => {
              const date = new Date(e.event_date);
              const day = isNaN(date.getDate()) ? "15" : String(date.getDate());
              const month = isNaN(date.getDate())
                ? "JUN"
                : date.toLocaleString("en-GB", { month: "short" }).toUpperCase();

              const dateBg = badgeColors[idx % badgeColors.length];

              return (
                <div
                  key={e.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px",
                    borderRadius: "18px",
                    background: "#ffffff",
                    border: "1.5px solid #f1f1f5",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
                  }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "14px",
                      background: dateBg,
                      color: "#fff",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                  >
                    <div style={{ fontSize: "17px", fontWeight: 900, lineHeight: 1 }}>{day}</div>
                    <div style={{ fontSize: "10px", fontWeight: 800, opacity: 0.85, marginTop: "2px", letterSpacing: "0.5px" }}>{month}</div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f0f1a", lineHeight: 1.25 }}>
                      {e.title}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#64748b", fontWeight: 600, marginTop: "4px" }}>
                      {[e.location, e.start_time].filter(Boolean).join(" · ")}
                    </div>
                    {e.tags && e.tags.length > 0 && (
                      <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                        {e.tags.map((tag: string, tIdx: number) => (
                          <span
                            key={tIdx}
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              background: tIdx === 0 ? "#f5f3ff" : "#f0fdf4",
                              color: tIdx === 0 ? "#7c3aed" : "#16a34a",
                              border: tIdx === 0 ? "1px solid #ddd6fe" : "1px solid #bbf7d0",
                              padding: "3px 10px",
                              borderRadius: "20px"
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
                      target={e.registration_url.startsWith("http") ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      style={{
                        background: "linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)",
                        color: "#fff",
                        fontSize: "13px",
                        fontWeight: 800,
                        padding: "10px 20px",
                        borderRadius: "12px",
                        textDecoration: "none",
                        flexShrink: 0,
                        boxShadow: "0 4px 14px rgba(225, 29, 72, 0.25)"
                      }}
                    >
                      {eventTab === "past" ? "View Event" : "Register"}
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
