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
  initialPastors?: any[];
  initialEvents?: any[];
  initialSearchQuery?: string;
  initialCity?: string;
  initialDenom?: string;
}

export default function ExploreClient({
  initialChurches,
  initialPastors = [],
  initialEvents = [],
  initialSearchQuery = "",
  initialCity = "",
  initialDenom = "",
}: ExploreClientProps) {
  const [exploreType, setExploreType] = useState<"churches" | "pastors" | "events">("churches");
  const [cardVersion, setCardVersion] = useState<"v0" | "v1" | "v2" | "v3" | "v4">("v0");
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

  const filteredPastors = useMemo(() => {
    return initialPastors
      .filter((pastor) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          pastor.full_name?.toLowerCase().includes(q) ||
          pastor.title?.toLowerCase().includes(q) ||
          pastor.bio?.toLowerCase().includes(q) ||
          pastor.church_name_cache?.toLowerCase().includes(q) ||
          pastor.church?.name?.toLowerCase().includes(q) ||
          pastor.city?.toLowerCase().includes(q);

        const matchesCity = selectedCity === "all" || pastor.city === selectedCity || pastor.church?.city === selectedCity;
        return matchesQuery && matchesCity;
      })
      .map((pastor) => {
        let distance: number | null = null;
        const lat = pastor.church?.latitude;
        const lng = pastor.church?.longitude;
        if (userLocation && typeof lat === "number" && typeof lng === "number") {
          distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
        }
        return {
          ...pastor,
          name: pastor.full_name,
          latitude: lat,
          longitude: lng,
          distance,
          type: "pastor",
        };
      })
      .sort((a, b) => {
        if (sortBy === "name_asc") return a.full_name.localeCompare(b.full_name);
        if (sortBy === "name_desc") return b.full_name.localeCompare(a.full_name);
        if (sortBy === "nearby") {
          if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
          if (a.distance !== null) return -1;
          if (b.distance !== null) return 1;
        }
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [initialPastors, searchQuery, selectedCity, sortBy, userLocation]);

  const filteredEvents = useMemo(() => {
    return initialEvents
      .filter((event) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          event.title?.toLowerCase().includes(q) ||
          event.description?.toLowerCase().includes(q) ||
          event.venue_name?.toLowerCase().includes(q) ||
          event.city?.toLowerCase().includes(q) ||
          event.host_church?.name?.toLowerCase().includes(q);

        const matchesCity = selectedCity === "all" || event.city === selectedCity;
        return matchesQuery && matchesCity;
      })
      .map((event) => {
        let distance: number | null = null;
        if (userLocation && typeof event.latitude === "number" && typeof event.longitude === "number") {
          distance = calculateDistance(userLocation.lat, userLocation.lng, event.latitude, event.longitude);
        }
        return {
          ...event,
          name: event.title,
          distance,
          type: "event",
        };
      })
      .sort((a, b) => {
        if (sortBy === "name_asc") return a.title.localeCompare(b.title);
        if (sortBy === "name_desc") return b.title.localeCompare(a.title);
        if (sortBy === "nearby") {
          if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
          if (a.distance !== null) return -1;
          if (b.distance !== null) return 1;
        }
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [initialEvents, searchQuery, selectedCity, sortBy, userLocation]);

  const activeItemsForMap = useMemo(() => {
    if (exploreType === "pastors") return filteredPastors;
    if (exploreType === "events") return filteredEvents;
    return filteredChurches.map(c => ({ ...c, type: "church" }));
  }, [exploreType, filteredChurches, filteredPastors, filteredEvents]);

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
      <style>{`
        .explore-tab {
          background: none;
          border: none;
          font-size: 13.5px;
          font-weight: 700;
          color: #64748b;
          padding: 8px 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 20px;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .explore-tab:hover {
          color: #475569;
          background: #e2e8f0;
        }
        .explore-tab.active {
          background: #7c3aed;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
        }
        
        .pastor-grid-card {
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          border: 1.5px solid #e2e8f0;
          background: #ffffff;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
          text-decoration: none;
          color: inherit;
          position: relative;
        }
        .pastor-grid-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 25px -5px rgba(124, 58, 237, 0.12), 0 10px 10px -5px rgba(124, 58, 237, 0.06);
          border-color: #c084fc;
        }
        .pastor-card-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 11px 14px;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
          color: #7c3aed;
          font-weight: 700;
          font-size: 13px;
          gap: 4px;
          transition: all 0.2s ease;
        }
        .pastor-grid-card:hover .pastor-card-footer {
          background: #7c3aed !important;
          color: #ffffff !important;
        }

        /* CARD VERSION 1: Minimalist centered with circular avatar */
        .pastor-card-v1 {
          border-radius: 20px;
          border: 1.5px solid #e2e8f0;
          background: #ffffff;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
          text-decoration: none;
          color: inherit;
        }
        .pastor-card-v1:hover {
          transform: translateY(-6px);
          border-color: #7c3aed;
          box-shadow: 0 12px 24px rgba(124, 58, 237, 0.08);
        }

        /* CARD VERSION 2: Full-image glassmorphism absolute overlay */
        .pastor-card-v2 {
          height: 370px;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          color: inherit;
        }
        .pastor-card-v2:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 20px 30px rgba(0, 0, 0, 0.15);
        }

        /* CARD VERSION 3: Left Accent bar and flat tickets */
        .pastor-card-v3 {
          border-radius: 12px;
          border: 1.5px dashed #cbd5e1;
          background: #ffffff;
          padding: 16px;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.25s ease;
          border-left: 4px solid #9333ea;
          text-decoration: none;
          color: inherit;
        }
        .pastor-card-v3:hover {
          border-color: #9333ea;
          background: #faf5ff;
          transform: translateX(4px);
        }

        /* CARD VERSION 4: Premium Dark Theme Accent */
        .pastor-card-v4 {
          background: #0f172a;
          color: #ffffff;
          border-radius: 20px;
          border: 1.5px solid #1e293b;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .pastor-card-v4:hover {
          border-color: #a855f7;
          transform: translateY(-6px);
          box-shadow: 0 15px 30px rgba(168, 85, 247, 0.2);
        }
        .pastor-card-footer-v4 {
          background: #1e293b;
          color: #c084fc;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 11px;
          font-weight: 700;
          font-size: 13px;
          gap: 4px;
          transition: all 0.2s;
        }
        .pastor-card-v4:hover .pastor-card-footer-v4 {
          background: #a855f7;
          color: #ffffff;
        }
      `}</style>
      <TopNav />

      {/* Explore Type Selector Strip */}
      <div style={{
        background: "#ffffff",
        borderBottom: "1px solid #ececf2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "10px 24px",
        zIndex: 50,
      }}>
        <div style={{
          background: "#f1f5f9",
          padding: "4px",
          borderRadius: "24px",
          display: "flex",
          gap: "4px"
        }}>
          <button
            onClick={() => setExploreType("churches")}
            className={`explore-tab ${exploreType === "churches" ? "active" : ""}`}
          >
            <i className="ti ti-building-church" style={{ fontSize: "16px" }}></i> Churches
          </button>
          <button
            onClick={() => setExploreType("pastors")}
            className={`explore-tab ${exploreType === "pastors" ? "active" : ""}`}
          >
            <i className="ti ti-user" style={{ fontSize: "16px" }}></i> Pastors
          </button>
          <button
            onClick={() => setExploreType("events")}
            className={`explore-tab ${exploreType === "events" ? "active" : ""}`}
          >
            <i className="ti ti-calendar-event" style={{ fontSize: "16px" }}></i> Events
          </button>
        </div>
      </div>

      {/* Main Explore Split Screen */}
      <div style={{ display: "flex", flex: 1, position: "relative", overflow: "hidden" }}>
        
        {/* FILTERS COLUMN (Left) */}
        <div style={{
          width: "280px",
          minWidth: "280px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #e2e8f0",
          background: "#fff",
          zIndex: 10,
          overflowY: "auto",
        }}>
          {/* Filters Header */}
          <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Filters</h2>
            <button onClick={clearAllFilters} style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.05em", opacity: hasActiveFilters ? 1 : 0.5 }}>
              RESET
            </button>
          </div>
          
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "24px" }}>
             {/* Search */}
             <div style={{ position: "relative" }}>
                <i className="ti ti-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "16px" }}></i>
                <input
                  type="text"
                  placeholder="Church name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: "100%", height: "44px", paddingLeft: "40px", paddingRight: "30px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "13.5px" }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "14px" }}>✕</button>
                )}
             </div>

             {/* Location (Near Me) */}
             <div>
                <button
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: userLocation ? "#f3e8ff" : "#fff",
                    border: `1.5px solid ${userLocation ? "#7c3aed" : "#e2e8f0"}`,
                    color: userLocation ? "#7c3aed" : "#475569",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    justifyContent: "center"
                  }}
                >
                  <i className="ti ti-current-location"></i>
                  {isLocating ? "Locating..." : userLocation ? "Using Your Location" : "Near Me"}
                </button>
             </div>

             {/* Opening Status */}
             {exploreType === "churches" && (
                <div>
                  <h3 style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: 800, color: "#94a3b8", letterSpacing: "0.05em", marginBottom: "12px" }}>Opening Status</h3>
                  <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "8px", padding: "4px" }}>
                    {["all", "open_now", "custom"].map(status => (
                      <button
                        key={status}
                        onClick={() => setOpeningStatus(status as any)}
                        style={{ flex: 1, padding: "8px 0", fontSize: "11px", fontWeight: 700, borderRadius: "6px", border: "none", background: openingStatus === status ? "#fff" : "transparent", color: openingStatus === status ? "#0f172a" : "#64748b", boxShadow: openingStatus === status ? "0 1px 3px rgba(0,0,0,0.1)" : "none", cursor: "pointer" }}
                      >
                        {status === "all" ? "ALL" : status === "open_now" ? "OPEN NOW" : "CUSTOM"}
                      </button>
                    ))}
                  </div>
                </div>
             )}

             {/* Dropdowns */}
             {exploreType === "churches" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {[ 
                    { label: "All Denominations", value: selectedDenom, setter: setSelectedDenom, options: denominations },
                    { label: "All Languages", value: selectedLanguage, setter: setSelectedLanguage, options: languages },
                    { label: "All Worship Styles", value: selectedWorshipStyle, setter: setSelectedWorshipStyle, options: worshipStyles },
                    { label: "All Ministries", value: selectedMinistry, setter: setSelectedMinistry, options: ministries }
                  ].map((filter, i) => (
                    <div key={i} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
                      <div style={{ position: "relative", width: "100%" }}>
                        <select
                          value={filter.value}
                          onChange={(e) => filter.setter(e.target.value)}
                          style={{ width: "100%", appearance: "none", background: "transparent", border: "none", fontSize: "14px", fontWeight: 600, color: filter.value === 'all' ? "#334155" : "#7c3aed", cursor: "pointer", outline: "none", padding: "8px 24px 8px 8px", marginLeft: "-8px", borderRadius: "8px" }}
                        >
                          <option value="all">{filter.label}</option>
                          {filter.options.filter((o: string) => o !== "all").map((o: string) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                        <i className="ti ti-chevron-down" style={{ position: "absolute", right: "4px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8", fontSize: "16px" }}></i>
                      </div>
                    </div>
                  ))}

                  {/* Sort By Dropdown */}
                  <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
                    <div style={{ position: "relative", width: "100%" }}>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        style={{ width: "100%", appearance: "none", background: "transparent", border: "none", fontSize: "14px", fontWeight: 600, color: "#334155", cursor: "pointer", outline: "none", padding: "8px 24px 8px 8px", marginLeft: "-8px", borderRadius: "8px" }}
                      >
                        <option value="latest">Sort By: Latest</option>
                        <option value="nearby">Sort By: Nearby</option>
                        <option value="name_asc">Sort By: Name A-Z</option>
                        <option value="name_desc">Sort By: Name Z-A</option>
                      </select>
                      <i className="ti ti-chevron-down" style={{ position: "absolute", right: "4px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8", fontSize: "16px" }}></i>
                    </div>
                  </div>
                </div>
             )}
          </div>
        </div>

        {/* LIST COLUMN (Middle) */}
        <div style={{
          width: exploreType === "pastors" ? "100%" : "400px",
          minWidth: exploreType === "pastors" ? "0" : "400px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #e2e8f0",
          background: "#fff",
          zIndex: 10,
        }}>
           {/* List Header */}
           <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <span style={{ color: "#7c3aed", fontSize: "16px" }}>•</span>
                SHOWING {exploreType === "churches" ? filteredChurches.length : exploreType === "pastors" ? filteredPastors.length : filteredEvents.length} OF {exploreType === "churches" ? initialChurches.length : exploreType === "pastors" ? initialPastors.length : initialEvents.length} {exploreType.toUpperCase()}
             </div>
           </div>

           {/* Cards Container */}
           <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", background: "#f8fafc" }}>
            {exploreType === "churches" && (
              filteredChurches.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b" }}>
                  <i className="ti ti-church-off" style={{ fontSize: "40px", color: "#cbd5e1", marginBottom: "12px", display: "block" }}></i>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>No churches match your filters</h3>
                  <p style={{ fontSize: "13px" }}>Try clearing some filters or searching with a broader keyword.</p>
                  <button onClick={clearAllFilters} style={{ marginTop: "12px", fontSize: "13px", fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #d8b4fe", padding: "8px 16px", borderRadius: "10px", cursor: "pointer" }}>Reset All Filters</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                          flexDirection: "column",
                          borderRadius: "16px",
                          border: isSelected ? "2px solid #7c3aed" : "1.5px solid #e2e8f0",
                          background: isSelected ? "#faf5ff" : "#fff",
                          overflow: "hidden",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          boxShadow: isSelected ? "0 8px 20px rgba(124, 58, 237, 0.12)" : "0 2px 5px rgba(0,0,0,0.03)",
                        }}
                      >
                        {/* Image Thumbnail */}
                        <div
                          style={{
                            width: "100%",
                            height: "200px",
                            background: coverImage
                              ? `url('${coverImage}') center/cover`
                              : "#f1f5f9",
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {!coverImage && (
                            <i className="ti ti-building-church" style={{ fontSize: "64px", color: "#94a3b8" }}></i>
                          )}
                          {church.is_verified && (
                            <span style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(22, 163, 74, 0.9)", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "4px 8px", borderRadius: "8px", backdropFilter: "blur(4px)" }}>✓ Verified</span>
                          )}
                        </div>

                        {/* Content Info */}
                        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0", lineHeight: 1.3 }}>
                                {church.name}
                              </h3>
                              {typeof church.distance === "number" && (
                                <span style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", background: "#f3e8ff", padding: "2px 8px", borderRadius: "8px", whiteSpace: "nowrap" }}>
                                  {church.distance < 1 ? `${Math.round(church.distance * 1000)} m` : `${church.distance.toFixed(1)} km`}
                                </span>
                              )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b" }}>
                              <i className="ti ti-map-pin" style={{ color: "#e11d48", fontSize: "15px" }}></i>
                              <span>{church.city || church.address_line || "Location available"}</span>
                              {church.postcode && <span style={{ color: "#94a3b8" }}>({church.postcode})</span>}
                            </div>
                          </div>

                          {/* Filter tags preview */}
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {church.denomination && <span style={{ fontSize: "11px", fontWeight: 700, background: "#f1f5f9", color: "#475569", padding: "3px 8px", borderRadius: "6px" }}>{church.denomination.split("|||")[0]}</span>}
                            {worshipLabel && <span style={{ fontSize: "11px", fontWeight: 700, background: "#fef3c7", color: "#b45309", padding: "3px 8px", borderRadius: "6px" }}>🎵 {worshipLabel}</span>}
                            {church.languages && church.languages.length > 0 && <span style={{ fontSize: "11px", fontWeight: 600, background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", padding: "2px 8px", borderRadius: "6px" }}>🗣 {church.languages[0]}</span>}
                            {church.ministries && church.ministries.length > 0 && <span style={{ fontSize: "11px", fontWeight: 600, background: "#f0fdf4", color: "#166534", padding: "3px 8px", borderRadius: "6px" }}>🤝 {church.ministries[0]}</span>}
                          </div>

                          {/* Card Footer */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #f1f5f9", marginTop: "4px" }}>
                            <span style={{ fontSize: "12px", color: typeof church.latitude === "number" ? "#16a34a" : "#94a3b8", fontWeight: 600 }}>
                              {typeof church.latitude === "number" ? "📍 Location on map" : "No map coordinates"}
                            </span>
                            <Link href={`/church/${church.slug}`} style={{ fontSize: "13px", fontWeight: 800, color: "#7c3aed", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }} onClick={(e) => e.stopPropagation()}>
                              View Profile &rarr;
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {exploreType === "pastors" && (
              filteredPastors.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b" }}>
                  <i className="ti ti-user-off" style={{ fontSize: "40px", color: "#cbd5e1", marginBottom: "12px", display: "block" }}></i>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>No pastors match your search</h3>
                  <p style={{ fontSize: "13px" }}>Try typing a different name or checking back later.</p>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "20px"
                }}>
                  {filteredPastors.map((pastor) => {
                    const isSelected = pastor.id === selectedChurchId;
                    const avatarImage = pastor.avatar_url || null;
                    const coverImage = Array.isArray(pastor.cover_photo_urls) && pastor.cover_photo_urls.length > 0 ? pastor.cover_photo_urls[0] : null;

                    return (
                      <Link key={pastor.id} href={`/pastor/${pastor.slug}`} className={`pastor-grid-card ${isSelected ? "selected" : ""}`}>
                        <div style={{ width: "100%", height: "220px", background: avatarImage ? `url('${avatarImage}') center/cover` : coverImage ? `url('${coverImage}') center/cover` : "linear-gradient(135deg, #a855f7, #6366f1)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {!avatarImage && !coverImage && <i className="ti ti-user" style={{ fontSize: "42px", color: "rgba(255,255,255,0.45)" }}></i>}
                        </div>
                        <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "10px" }}>
                          <div>
                            <div style={{ marginBottom: "6px" }}>
                              <span style={{ fontSize: "9px", fontWeight: 800, color: "#7c3aed", background: "#f3e8ff", padding: "2.5px 7px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.03em", display: "inline-block" }}>{pastor.title || "Pastor"}</span>
                            </div>
                            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0", lineHeight: 1.3 }}>{pastor.full_name}</h3>
                            {(pastor.church?.name || pastor.church_name_cache) && (
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569", marginBottom: "5px" }}>
                                <i className="ti ti-building-church" style={{ color: "#7c3aed", fontSize: "14px" }}></i>
                                <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pastor.church?.name || pastor.church_name_cache}</span>
                              </div>
                            )}
                          </div>
                          <div className="pastor-card-footer">View Profile <i className="ti ti-arrow-up-right" style={{ fontSize: "14px" }}></i></div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )
            )}

            {exploreType === "events" && (
              filteredEvents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b" }}>
                  <i className="ti ti-calendar-off" style={{ fontSize: "40px", color: "#cbd5e1", marginBottom: "12px", display: "block" }}></i>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>No events match your search</h3>
                  <p style={{ fontSize: "13px" }}>Try checking back later or searching another city.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {filteredEvents.map((event) => {
                    const isSelected = event.id === selectedChurchId;
                    const coverImage = event.cover_url || null;
                    const dateStr = event.starts_at ? new Date(event.starts_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", weekday: "short" }) : "Upcoming";

                    return (
                      <div key={event.id} onClick={() => setSelectedChurchId(event.id)} onMouseEnter={() => setHoveredChurchId(event.id)} onMouseLeave={() => setHoveredChurchId(null)} style={{ display: "flex", flexDirection: "column", borderRadius: "16px", border: isSelected ? "2px solid #7c3aed" : "1.5px solid #e2e8f0", background: isSelected ? "#faf5ff" : "#fff", overflow: "hidden", cursor: "pointer", transition: "all 0.2s", boxShadow: isSelected ? "0 8px 20px rgba(124, 58, 237, 0.12)" : "0 2px 5px rgba(0,0,0,0.03)" }}>
                        <div style={{ width: "100%", height: "200px", background: coverImage ? `url('${coverImage}') center/cover` : "linear-gradient(135deg, #e11d48, #fb7185)", position: "relative" }}>
                          <span style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(15, 23, 42, 0.8)", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "4px 8px", borderRadius: "6px" }}>{event.type || "Event"}</span>
                        </div>
                        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0", lineHeight: 1.3 }}>{event.title}</h3>
                              {typeof event.distance === "number" && <span style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", background: "#f3e8ff", padding: "2px 8px", borderRadius: "8px", whiteSpace: "nowrap" }}>{event.distance < 1 ? `${Math.round(event.distance * 1000)} m` : `${event.distance.toFixed(1)} km`}</span>}
                            </div>
                            <div style={{ fontSize: "13px", color: "#e11d48", fontWeight: 700, marginBottom: "6px" }}>📅 {dateStr}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b" }}>
                              <i className="ti ti-map-pin"></i>
                              <span>{event.venue_name || event.city || "Venue Registered"}</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #f1f5f9", marginTop: "4px" }}>
                            <span style={{ fontSize: "12px", color: typeof event.latitude === "number" ? "#16a34a" : "#94a3b8", fontWeight: 600 }}>{typeof event.latitude === "number" ? "📍 Location on map" : "No map coordinates"}</span>
                            <Link href={`/events/${event.slug}`} style={{ fontSize: "13px", fontWeight: 800, color: "#7c3aed", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }} onClick={(e) => e.stopPropagation()}>View Event &rarr;</Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Leaflet Map */}
        {exploreType !== "pastors" && (
          <div style={{ flex: 1, height: "100%", minHeight: "100%", position: "relative", background: "#f1f5f9", overflow: "hidden" }}>
            <ChurchMap
              churches={activeItemsForMap}
              selectedChurchId={selectedChurchId}
              hoveredChurchId={hoveredChurchId}
              onSelectChurch={(c) => setSelectedChurchId(c.id)}
            />
          </div>
        )}

      </div>
    </div>
  );
}
