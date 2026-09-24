"use client";

import { useState } from "react";
import Link from "next/link";

interface HomeWorshipLeadersSectionProps {
  worshipLeaders: any[];
}

export function HomeWorshipLeadersSection({ worshipLeaders }: HomeWorshipLeadersSectionProps) {
  const [showAll, setShowAll] = useState(false);

  // 2 rows in a 4-col grid = maximum 8 items initially
  const DISPLAY_LIMIT = 8;
  const hasMore = worshipLeaders && worshipLeaders.length > DISPLAY_LIMIT;
  const displayedLeaders = showAll || !hasMore
    ? (worshipLeaders || [])
    : worshipLeaders.slice(0, DISPLAY_LIMIT);

  return (
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
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "24px" }}>
              {displayedLeaders.map((leader) => {
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

            {hasMore && (
              <div style={{ textAlign: "center", marginTop: "36px" }}>
                <button
                  onClick={() => setShowAll(!showAll)}
                  style={{
                    background: showAll ? "#ffffff" : "linear-gradient(135deg, #e11d48, #be123c)",
                    color: showAll ? "#e11d48" : "#ffffff",
                    border: showAll ? "1.5px solid #f43f5e" : "none",
                    padding: "12px 28px",
                    borderRadius: "14px",
                    fontWeight: 800,
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: showAll ? "none" : "0 8px 20px -4px rgba(225, 29, 72, 0.35)",
                    transition: "all 0.2s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>{showAll ? "Show Less" : `View More Worship Leaders (${worshipLeaders.length - DISPLAY_LIMIT} more)`}</span>
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
