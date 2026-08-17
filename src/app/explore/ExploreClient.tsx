"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { Church, ChurchService } from "@/lib/types";
import TopNav from "@/components/layout/TopNav";
import ChurchMap from "@/components/explore/ChurchMap";

interface ExploreChurch extends Church {
  church_services?: ChurchService[];
  distance?: number | null;
}

interface ExploreClientProps {
  initialChurches: ExploreChurch[];
  initialSearchQuery?: string;
  initialCity?: string;
  initialDenom?: string;
}

export default function ExploreClient({
  initialChurches,
  initialSearchQuery = "",
  initialCity = "",
  initialDenom = "",
}: ExploreClientProps) {
  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [openingStatus, setOpeningStatus] = useState<"all" | "open_now" | "custom">("all");
  const [customDay, setCustomDay] = useState<string>("Sun");
  const [customTime, setCustomTime] = useState<string>("all");
  const [selectedDenom, setSelectedDenom] = useState(initialDenom || "all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedWorshipStyle, setSelectedWorshipStyle] = useState("all");
  const [selectedMinistry, setSelectedMinistry] = useState("all");
  const [selectedCity, setSelectedCity] = useState(initialCity || "all");
  const [sortBy, setSortBy] = useState<"name_asc" | "name_desc" | "nearby" | "latest">("latest");

  // Selection & Hover State
  const [selectedChurchId, setSelectedChurchId] = useState<string | null>(null);
  const [hoveredChurchId, setHoveredChurchId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Extract distinct filter values
  const denominations = useMemo(() => {
    const list = initialChurches
      .map((c) => c.denomination?.split("|||")[0].trim())
      .filter(Boolean) as string[];
    return ["all", ...Array.from(new Set(list)).sort()];
  }, [initialChurches]);

  const languages = useMemo(() => {
    const list: string[] = [];
    initialChurches.forEach((c) => {
      if (Array.isArray(c.languages)) {
        c.languages.forEach((l) => { if (l) list.push(l.trim()); });
      }
    });
    return ["all", ...Array.from(new Set(list)).sort()];
  }, [initialChurches]);

  const worshipStyles = useMemo(() => {
    const list: string[] = [];
    initialChurches.forEach((c) => {
      const styles = c.worship_style || c.worship_styles;
      if (Array.isArray(styles)) {
        styles.forEach((s) => { if (s) list.push(s.trim()); });
      } else if (typeof styles === "string") {
        styles.split(",").forEach((s) => { if (s) list.push(s.trim()); });
      }
    });
    return ["all", ...Array.from(new Set(list)).sort()];
  }, [initialChurches]);

  const ministries = useMemo(() => {
    const list: string[] = [];
    initialChurches.forEach((c) => {
      if (Array.isArray(c.ministries)) {
        c.ministries.forEach((m) => { if (m) list.push(m.trim()); });
      }
    });
    return ["all", ...Array.from(new Set(list)).sort()];
  }, [initialChurches]);

  const cities = useMemo(() => {
    const list = initialChurches.map((c) => c.city?.trim()).filter(Boolean) as string[];
    return ["all", ...Array.from(new Set(list)).sort()];
  }, [initialChurches]);

  // Haversine distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Helper to normalize day string comparison (e.g. "Sun" matches "Sunday" / "Sun")
  const matchesDayName = (srvDay?: string, targetDay?: string) => {
    if (!srvDay || !targetDay) return false;
    const s = srvDay.toLowerCase().trim();
    const t = targetDay.toLowerCase().trim();
    return s.startsWith(t) || t.startsWith(s);
  };

  // Helper to check if a service time matches time slot (Morning <12:00, Afternoon 12:00-17:00, Evening 17:00+)
  const matchesTimeSlot = (startTime?: string | null, slot?: string) => {
    if (!slot || slot === "all") return true;
    if (!startTime || !startTime.trim()) return false; // Strict: if filtering by time, must have a start_time

    const str = startTime.trim();

    // Check 24-hour format "13:00", "13:00:00", "09:30"
    const match24 = str.match(/^(\d{1,2}):(\d{2})/);
    // Check 12-hour format "1:00 PM", "9:30 AM", "1pm"
    const match12 = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);

    let hour = -1;

    if (match12) {
      hour = parseInt(match12[1], 10);
      const meridian = match12[3].toLowerCase();
      if (meridian === "pm" && hour < 12) hour += 12;
      if (meridian === "am" && hour === 12) hour = 0;
    } else if (match24) {
      hour = parseInt(match24[1], 10);
    } else {
      const parsedNum = parseInt(str, 10);
      if (!isNaN(parsedNum)) hour = parsedNum;
    }

    if (hour === -1) return false;

    if (slot === "morning") return hour < 12;
    if (slot === "afternoon") return hour >= 12 && hour < 17;
    if (slot === "evening") return hour >= 17;
    return true;
  };

  // Helper to check if a church has services right now
  const isChurchOpenNow = (church: ExploreChurch) => {
    if (!church.church_services || church.church_services.length === 0) return false;
    const now = new Date();
    const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDay = daysShort[now.getDay()];
    
    return church.church_services.some((srv) => matchesDayName(srv.day, currentDay));
  };

  // Helper to check if a church has services on a custom day and time slot
  const hasServiceOnDayAndTime = (church: ExploreChurch, day: string, timeSlot: string) => {
    if (!church.church_services || church.church_services.length === 0) return false;
    return church.church_services.some((srv) => {
      return matchesDayName(srv.day, day) && matchesTimeSlot(srv.start_time, timeSlot);
    });
  };

  // Filter & sort logic
  const filteredChurches = useMemo(() => {
    return initialChurches
      .filter((church) => {
        // 1. Text Search (name, city, address, postcode, denomination)
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          church.name?.toLowerCase().includes(q) ||
          church.city?.toLowerCase().includes(q) ||
          church.address_line?.toLowerCase().includes(q) ||
          church.postcode?.toLowerCase().replace(/\s+/g, "").includes(q.replace(/\s+/g, "")) ||
          church.denomination?.toLowerCase().includes(q);

        // 2. Opening Status
        let matchesOpening = true;
        if (openingStatus === "open_now") {
          matchesOpening = isChurchOpenNow(church);
        } else if (openingStatus === "custom") {
          matchesOpening = hasServiceOnDayAndTime(church, customDay, customTime);
        }

        // 3. Denomination
        const matchesDenom =
          selectedDenom === "all" ||
          church.denomination?.toLowerCase().includes(selectedDenom.toLowerCase());

        // 4. Languages
        const matchesLanguage =
          selectedLanguage === "all" ||
          (Array.isArray(church.languages) &&
            church.languages.some((l) => l.toLowerCase() === selectedLanguage.toLowerCase()));

        // 5. Worship Styles
        const churchWorship = church.worship_style || church.worship_styles;
        let matchesWorship = true;
        if (selectedWorshipStyle !== "all") {
          if (Array.isArray(churchWorship)) {
            matchesWorship = churchWorship.some(
              (w) => w.toLowerCase() === selectedWorshipStyle.toLowerCase()
            );
          } else if (typeof churchWorship === "string") {
            matchesWorship = churchWorship
              .toLowerCase()
              .includes(selectedWorshipStyle.toLowerCase());
          } else {
            matchesWorship = false;
          }
        }

        // 6. Ministries
        const matchesMinistry =
          selectedMinistry === "all" ||
          (Array.isArray(church.ministries) &&
            church.ministries.some((m) => m.toLowerCase() === selectedMinistry.toLowerCase()));

        // 7. City
        const matchesCity = selectedCity === "all" || church.city === selectedCity;

        return (
          matchesQuery &&
          matchesOpening &&
          matchesDenom &&
          matchesLanguage &&
          matchesWorship &&
          matchesMinistry &&
          matchesCity
        );
      })
      .map((church) => {
        let distance: number | null = null;
        if (
          userLocation &&
          typeof church.latitude === "number" &&
          typeof church.longitude === "number"
        ) {
          distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            church.latitude,
            church.longitude
          );
        }
        return { ...church, distance };
      })
      .sort((a, b) => {
        if (sortBy === "name_asc") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "name_desc") {
          return b.name.localeCompare(a.name);
        }
        if (sortBy === "nearby") {
          if (a.distance !== null && b.distance !== null) {
            return a.distance - b.distance;
          }
          if (a.distance !== null) return -1;
          if (b.distance !== null) return 1;
          return 0;
        }
        // latest (default)
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [
    initialChurches,
    searchQuery,
    openingStatus,
    customDay,
    customTime,
    selectedDenom,
    selectedLanguage,
    selectedWorshipStyle,
    selectedMinistry,
    selectedCity,
    sortBy,
    userLocation,
  ]);

  // Request browser geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setSortBy("nearby");
      },
      (err) => {
        setIsLocating(false);
        alert("Could not access your location. Please check your browser permissions.");
      }
    );
  };

  const hasActiveFilters =
    selectedDenom !== "all" ||
    selectedLanguage !== "all" ||
    selectedWorshipStyle !== "all" ||
    selectedMinistry !== "all" ||
    selectedCity !== "all" ||
    openingStatus !== "all" ||
    searchQuery.trim() !== "";

  const clearAllFilters = () => {
    setSearchQuery("");
    setOpeningStatus("all");
    setSelectedDenom("all");
    setSelectedLanguage("all");
    setSelectedWorshipStyle("all");
    setSelectedMinistry("all");
    setSelectedCity("all");
    setSortBy("latest");
  };

  return (
    <div style={{ background: "#f8fafc", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TopNav />

      {/* Main Explore Split Screen */}
      <div style={{ display: "flex", flex: 1, height: "calc(100vh - 58px)", position: "relative", overflow: "hidden" }}>
        
        {/* LEFT COLUMN: Controls & Church Cards (Scrollable) */}
        <div style={{
          width: "56%",
          maxWidth: "800px",
          minWidth: "460px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #e2e8f0",
          background: "#fff",
          zIndex: 10,
        }}>
          
          {/* Header & Filter Bar */}
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9", background: "#ffffff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div>
                <h1 style={{ fontSize: "21px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
                  Explore Churches
                </h1>
                <p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0" }}>
                  Showing <strong style={{ color: "#0f172a" }}>{filteredChurches.length}</strong> churches
                  {sortBy === "nearby" && userLocation ? " sorted by closest to you" : ""}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#e11d48",
                      background: "#fff1f2",
                      border: "1px solid #fecdd3",
                      padding: "6px 12px",
                      borderRadius: "16px",
                      cursor: "pointer",
                    }}
                  >
                    Clear All
                  </button>
                )}

                {/* Near Me Button */}
                <button
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 13px",
                    borderRadius: "18px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    border: "1.5px solid",
                    borderColor: userLocation ? "#7c3aed" : "#e2e8f0",
                    background: userLocation ? "#f5f3ff" : "#fff",
                    color: userLocation ? "#7c3aed" : "#475569",
                    transition: "all 0.2s"
                  }}
                >
                  <i className={`ti ${isLocating ? "ti-loader animate-spin" : "ti-current-location"}`} style={{ fontSize: "14px" }}></i>
                  {userLocation ? "Location Active" : "Near Me"}
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div style={{ position: "relative", marginBottom: "12px" }}>
              <i className="ti ti-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "16px" }}></i>
              <input
                type="text"
                placeholder="Search by church name, city, UK postcode (e.g. E12 5LH)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  paddingLeft: "42px",
                  paddingRight: "14px",
                  height: "40px",
                  fontSize: "13.5px",
                  borderRadius: "10px",
                  border: "1.5px solid #e2e8f0",
                  width: "100%",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    fontSize: "14px",
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Top Row: Opening Status Pills */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", marginRight: "4px" }}>
                Status:
              </span>
              <button
                onClick={() => setOpeningStatus("all")}
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "5px 12px",
                  borderRadius: "14px",
                  border: "1.5px solid",
                  borderColor: openingStatus === "all" ? "#7c3aed" : "#e2e8f0",
                  background: openingStatus === "all" ? "#7c3aed" : "#fff",
                  color: openingStatus === "all" ? "#fff" : "#475569",
                  cursor: "pointer"
                }}
              >
                All
              </button>
              <button
                onClick={() => setOpeningStatus("open_now")}
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "5px 12px",
                  borderRadius: "14px",
                  border: "1.5px solid",
                  borderColor: openingStatus === "open_now" ? "#16a34a" : "#e2e8f0",
                  background: openingStatus === "open_now" ? "#16a34a" : "#fff",
                  color: openingStatus === "open_now" ? "#fff" : "#475569",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: openingStatus === "open_now" ? "#fff" : "#16a34a" }}></span>
                Open Now
              </button>
              <button
                onClick={() => setOpeningStatus("custom")}
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "5px 12px",
                  borderRadius: "14px",
                  border: "1.5px solid",
                  borderColor: openingStatus === "custom" ? "#7c3aed" : "#e2e8f0",
                  background: openingStatus === "custom" ? "#f5f3ff" : "#fff",
                  color: openingStatus === "custom" ? "#7c3aed" : "#475569",
                  cursor: "pointer"
                }}
              >
                Custom Day
              </button>

              {openingStatus === "custom" && (
                <>
                  {/* Day Picker */}
                  <select
                    value={customDay}
                    onChange={(e) => setCustomDay(e.target.value)}
                    style={{
                      width: "auto",
                      padding: "4px 10px",
                      fontSize: "12px",
                      borderRadius: "10px",
                      fontWeight: 700,
                      color: "#7c3aed",
                      border: "1.5px solid #d8b4fe",
                      background: "#fff",
                    }}
                  >
                    <option value="Sun">Sun</option>
                    <option value="Mon">Mon</option>
                    <option value="Tue">Tue</option>
                    <option value="Wed">Wed</option>
                    <option value="Thu">Thu</option>
                    <option value="Fri">Fri</option>
                    <option value="Sat">Sat</option>
                  </select>

                  {/* Time Picker */}
                  <select
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    style={{
                      width: "auto",
                      padding: "4px 10px",
                      fontSize: "12px",
                      borderRadius: "10px",
                      fontWeight: 700,
                      color: "#7c3aed",
                      border: "1.5px solid #d8b4fe",
                      background: "#fff",
                    }}
                  >
                    <option value="all">Any Time</option>
                    <option value="morning">Morning (Before 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                    <option value="evening">Evening (After 5 PM)</option>
                  </select>
                </>
              )}
            </div>

            {/* Filter Dropdowns Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
              
              {/* Denominations */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "3px" }}>Denomination</label>
                <select
                  value={selectedDenom}
                  onChange={(e) => setSelectedDenom(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    fontSize: "12.5px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    color: "#334155",
                    border: "1.5px solid #e2e8f0",
                    background: "#f8fafc",
                  }}
                >
                  <option value="all">All Denominations</option>
                  {denominations.filter((d) => d !== "all").map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Languages */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "3px" }}>Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    fontSize: "12.5px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    color: "#334155",
                    border: "1.5px solid #e2e8f0",
                    background: "#f8fafc",
                  }}
                >
                  <option value="all">All Languages</option>
                  {languages.filter((l) => l !== "all").map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Worship Styles */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "3px" }}>Worship Style</label>
                <select
                  value={selectedWorshipStyle}
                  onChange={(e) => setSelectedWorshipStyle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    fontSize: "12.5px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    color: "#334155",
                    border: "1.5px solid #e2e8f0",
                    background: "#f8fafc",
                  }}
                >
                  <option value="all">All Worship Styles</option>
                  {worshipStyles.filter((w) => w !== "all").map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              {/* Ministries */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "3px" }}>Ministry</label>
                <select
                  value={selectedMinistry}
                  onChange={(e) => setSelectedMinistry(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    fontSize: "12.5px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    color: "#334155",
                    border: "1.5px solid #e2e8f0",
                    background: "#f8fafc",
                  }}
                >
                  <option value="all">All Ministries</option>
                  {ministries.filter((m) => m !== "all").map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginBottom: "3px" }}>Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    fontSize: "12.5px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    color: "#7c3aed",
                    border: "1.5px solid #d8b4fe",
                    background: "#f5f3ff",
                  }}
                >
                  <option value="latest">Latest</option>
                  <option value="nearby">Nearby</option>
                  <option value="name_asc">Name A-Z</option>
                  <option value="name_desc">Name Z-A</option>
                </select>
              </div>

            </div>
          </div>

          {/* List of Churches */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {filteredChurches.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b" }}>
                <i className="ti ti-church-off" style={{ fontSize: "40px", color: "#cbd5e1", marginBottom: "12px", display: "block" }}></i>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>No churches match your filters</h3>
                <p style={{ fontSize: "13px" }}>Try clearing some filters or searching with a broader keyword.</p>
                <button
                  onClick={clearAllFilters}
                  style={{
                    marginTop: "12px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#7c3aed",
                    background: "#f5f3ff",
                    border: "1px solid #d8b4fe",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {filteredChurches.map((church) => {
                  const isSelected = church.id === selectedChurchId;
                  const coverImage = church.cover_url ? church.cover_url.split("|||")[0] : null;
                  const churchWorship = church.worship_style || church.worship_styles;
                  const worshipLabel = Array.isArray(churchWorship) ? churchWorship[0] : (typeof churchWorship === "string" ? churchWorship.split(",")[0] : null);

                  return (
                    <div
                      key={church.id}
                      onClick={() => setSelectedChurchId(church.id)}
                      onMouseEnter={() => setHoveredChurchId(church.id)}
                      onMouseLeave={() => setHoveredChurchId(null)}
                      style={{
                        display: "flex",
                        borderRadius: "16px",
                        border: isSelected ? "2px solid #7c3aed" : "1.5px solid #e2e8f0",
                        background: isSelected ? "#faf5ff" : "#fff",
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: isSelected
                          ? "0 8px 20px rgba(124, 58, 237, 0.12)"
                          : "0 2px 5px rgba(0,0,0,0.03)",
                      }}
                    >
                      {/* Image Thumbnail */}
                      <div
                        style={{
                          width: "150px",
                          minWidth: "150px",
                          background: coverImage
                            ? `url('${coverImage}') center/cover`
                            : "linear-gradient(135deg, #7c3aed, #ec4899)",
                          position: "relative",
                        }}
                      >
                        {church.is_verified && (
                          <span style={{
                            position: "absolute",
                            top: "8px",
                            left: "8px",
                            background: "rgba(22, 163, 74, 0.9)",
                            color: "#fff",
                            fontSize: "10px",
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: "8px",
                            backdropFilter: "blur(4px)"
                          }}>
                            ✓ Verified
                          </span>
                        )}
                      </div>

                      {/* Content Info */}
                      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 3px 0", lineHeight: 1.3 }}>
                              {church.name}
                            </h3>
                            {typeof church.distance === "number" && (
                              <span style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "#7c3aed",
                                background: "#f3e8ff",
                                padding: "2px 8px",
                                borderRadius: "8px",
                                whiteSpace: "nowrap"
                              }}>
                                {church.distance < 1 ? `${Math.round(church.distance * 1000)} m` : `${church.distance.toFixed(1)} km`}
                              </span>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12.5px", color: "#64748b", marginBottom: "8px" }}>
                            <i className="ti ti-map-pin" style={{ color: "#e11d48" }}></i>
                            <span>{church.city || church.address_line || "Location available"}</span>
                            {church.postcode && (
                              <span style={{ color: "#94a3b8", fontSize: "11.5px" }}>({church.postcode})</span>
                            )}
                          </div>

                          {/* Filter tags preview */}
                          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "8px" }}>
                            {church.denomination && (
                              <span style={{ fontSize: "11px", fontWeight: 700, background: "#f1f5f9", color: "#475569", padding: "2px 7px", borderRadius: "6px" }}>
                                {church.denomination.split("|||")[0]}
                              </span>
                            )}
                            {worshipLabel && (
                              <span style={{ fontSize: "11px", fontWeight: 700, background: "#fef3c7", color: "#b45309", padding: "2px 7px", borderRadius: "6px" }}>
                                🎵 {worshipLabel}
                              </span>
                            )}
                            {church.languages && church.languages.length > 0 && (
                              <span style={{ fontSize: "11px", fontWeight: 600, background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", padding: "2px 7px", borderRadius: "6px" }}>
                                🗣 {church.languages[0]}
                              </span>
                            )}
                            {church.ministries && church.ministries.length > 0 && (
                              <span style={{ fontSize: "11px", fontWeight: 600, background: "#f0fdf4", color: "#166534", padding: "2px 7px", borderRadius: "6px" }}>
                                🤝 {church.ministries[0]}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "6px", borderTop: "1px solid #f1f5f9" }}>
                          <span style={{ fontSize: "11.5px", color: typeof church.latitude === "number" ? "#16a34a" : "#94a3b8", fontWeight: 600 }}>
                            {typeof church.latitude === "number" ? "📍 Location on map" : "No map coordinates"}
                          </span>
                          <Link
                            href={`/church/${church.slug}`}
                            style={{
                              fontSize: "12.5px",
                              fontWeight: 700,
                              color: "#7c3aed",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px"
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Profile &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Leaflet Map */}
        <div style={{ flex: 1, height: "100%", minHeight: "100%", position: "relative", background: "#f1f5f9", overflow: "hidden" }}>
          <ChurchMap
            churches={filteredChurches}
            selectedChurchId={selectedChurchId}
            hoveredChurchId={hoveredChurchId}
            onSelectChurch={(c) => setSelectedChurchId(c.id)}
          />
        </div>

      </div>
    </div>
  );
}
