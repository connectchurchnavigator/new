"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import HomeSearchBar from "@/components/home/HomeSearchBar";

interface ChurchItem {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  postcode: string | null;
  denomination: string | null;
  is_verified: boolean | null;
  cover_url: string | null;
  logo_url: string | null;
  created_at: string;
  address_line: string | null;
  church_services?: any[];
}

interface HomeChurchesSectionProps {
  initialChurches: ChurchItem[];
}

export default function HomeChurchesSection({ initialChurches }: HomeChurchesSectionProps) {
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("");
  const [denomination, setDenomination] = useState("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "open_now" | "verified">("all");
  const [showAll, setShowAll] = useState(false);

  // Extract unique denominations for quick pills
  const availableDenominations = useMemo(() => {
    const denoms = initialChurches
      .map((c) => c.denomination?.split("|||")[0].trim())
      .filter(Boolean) as string[];
    return Array.from(new Set(denoms)).slice(0, 8);
  }, [initialChurches]);

  // Filter churches live on home page
  const filteredChurches = useMemo(() => {
    return initialChurches.filter((church) => {
      const q = keyword.toLowerCase().trim();
      const matchesKeyword =
        !q ||
        church.name?.toLowerCase().includes(q) ||
        church.city?.toLowerCase().includes(q) ||
        church.address_line?.toLowerCase().includes(q) ||
        church.denomination?.toLowerCase().includes(q) ||
        church.postcode?.toLowerCase().replace(/\s+/g, "").includes(q.replace(/\s+/g, ""));

      const cCity = city.toLowerCase().trim();
      const matchesCity =
        !cCity ||
        church.city?.toLowerCase().includes(cCity) ||
        church.postcode?.toLowerCase().replace(/\s+/g, "").includes(cCity.replace(/\s+/g, ""));

      const matchesDenom =
        denomination === "all" ||
        church.denomination?.toLowerCase().includes(denomination.toLowerCase());

      // Status filters (open today or verified)
      let matchesStatus = true;
      if (activeFilter === "verified") {
        matchesStatus = !!church.is_verified;
      } else if (activeFilter === "open_now") {
        const now = new Date();
        const daysShort = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        const currentDay = daysShort[now.getDay()];
        matchesStatus =
          Array.isArray(church.church_services) &&
          church.church_services.some((srv: any) => {
            if (!srv.day) return false;
            const d = srv.day.toLowerCase().trim();
            return d.startsWith(currentDay) || currentDay.startsWith(d);
          });
      }

      return matchesKeyword && matchesCity && matchesDenom && matchesStatus;
    });
  }, [initialChurches, keyword, city, denomination, activeFilter]);

  const hasFilterActive = keyword || city || denomination !== "all" || activeFilter !== "all";

  return (
    <section id="churches-section" style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 24px 40px" }}>
        {/* Header & Quick Filters Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--cn-purple, #7c3aed)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "4px" }}>
              Featured Communities & Directory
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
              Featured Churches {hasFilterActive && <span style={{ fontSize: "18px", fontWeight: 700, color: "#7c3aed" }}>({filteredChurches.length} found)</span>}
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {hasFilterActive && (
              <button
                type="button"
                onClick={() => {
                  setKeyword("");
                  setCity("");
                  setDenomination("all");
                  setActiveFilter("all");
                }}
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#e11d48",
                  background: "#fff1f2",
                  border: "1px solid #fecdd3",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  cursor: "pointer",
                }}
              >
                ✕ Reset filters
              </button>
            )}

            <Link
              href={`/explore?${new URLSearchParams({
                ...(keyword ? { q: keyword } : {}),
                ...(city ? { city } : {}),
                ...(denomination !== "all" ? { denomination } : {}),
              }).toString()}`}
              style={{
                fontSize: "13.5px",
                fontWeight: 700,
                color: "#7c3aed",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "8px 18px",
                background: "#f5f3ff",
                borderRadius: "20px",
                border: "1px solid #ede9fe",
                transition: "all 0.15s ease",
              }}
            >
              Browse all churches &rarr;
            </Link>
          </div>
        </div>

        {/* Churches Grid */}
        {filteredChurches.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#ffffff",
              borderRadius: "20px",
              border: "1.5px dashed #cbd5e1",
            }}
          >
            <i className="ti ti-search" style={{ fontSize: "42px", color: "#94a3b8", display: "block", marginBottom: "12px" }}></i>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#1e293b", margin: "0 0 6px 0" }}>
              No churches match your filter criteria
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 20px 0" }}>
              Try removing some filters or search for another city or denomination.
            </p>
            <button
              type="button"
              onClick={() => {
                setKeyword("");
                setCity("");
                setDenomination("all");
                setActiveFilter("all");
              }}
              style={{
                background: "#7c3aed",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                padding: "10px 22px",
                fontSize: "13.5px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
              {(showAll ? filteredChurches : filteredChurches.slice(0, 6)).map((church) => {
              const coverImage = church.cover_url ? church.cover_url.split("|||")[0] : null;
              const logoImage = church.logo_url ? church.logo_url.split("|||")[0] : null;

              // Check if church has services scheduled today
              const now = new Date();
              const daysShort = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
              const currentDay = daysShort[now.getDay()];
              const isOpenToday =
                Array.isArray(church.church_services) &&
                church.church_services.some((srv: any) => {
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
                    transition: "transform 0.2s, box-shadow 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04)",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 14px 25px -5px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.04)";
                  }}
                >
                  {/* Cover Photo */}
                  <div
                    style={{
                      height: "150px",
                      background: coverImage ? `url('${coverImage}') center/cover` : "linear-gradient(135deg, #7c3aed, #ec4899)",
                      position: "relative",
                    }}
                  >
                    {/* Top Right: Open Now / Closed Badge */}
                    <span
                      style={{
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
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: isOpenToday ? "#4ade80" : "#94a3b8",
                        }}
                      />
                      {isOpenToday ? "Open Today" : "Closed Today"}
                    </span>
                  </div>

                  {/* Content Info */}
                  <div style={{ padding: "0 18px 18px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
                    {/* DP / Logo */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "-26px", marginBottom: "10px" }}>
                      <div
                        style={{
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
                        }}
                      >
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

                    {/* Footer Row */}
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

          {/* View More Button if more than 2 rows (6 cards) */}
          {filteredChurches.length > 6 && (
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#7c3aed";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.color = "#7c3aed";
                }}
              >
                {showAll ? (
                  <>Show Less <i className="ti ti-chevron-up"></i></>
                ) : (
                  <>View More ({filteredChurches.length - 6} more) <i className="ti ti-chevron-down"></i></>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
