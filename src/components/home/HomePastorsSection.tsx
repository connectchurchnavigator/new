"use client";

import React, { useState } from "react";
import Link from "next/link";

interface HomePastorsSectionProps {
  pastors: any[];
}

export default function HomePastorsSection({ pastors }: HomePastorsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedPastors = showAll ? pastors : (pastors || []).slice(0, 6);

  return (
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
        {displayedPastors.map((pastor) => {
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

      {/* View More button if more than 2 lines (6 cards) */}
      {(pastors || []).length > 6 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "32px" }}>
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            style={{
              background: "#ffffff",
              border: "1.5px solid #d8b4fe",
              color: "#7c3aed",
              padding: "11px 28px",
              borderRadius: "30px",
              fontSize: "14px",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(124, 58, 237, 0.1)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
          >
            {showAll ? (
              <>Show Less <i className="ti ti-chevron-up"></i></>
            ) : (
              <>View More ({pastors.length - 6} more) <i className="ti ti-chevron-down"></i></>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
