"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
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
  initialWorshipLeaders?: any[];
  initialSearchQuery?: string;
  initialCity?: string;
  initialDenom?: string;
}

interface MultiSelectSearchFilterProps {
  label: string;
  placeholder?: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

function MultiSelectSearchFilter({
  label,
  placeholder,
  options,
  selected,
  onChange,
}: MultiSelectSearchFilterProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  const toggleOption = (opt: string) => {
    const exists = selected.some((s) => s.toLowerCase() === opt.toLowerCase());
    if (exists) {
      onChange(selected.filter((s) => s.toLowerCase() !== opt.toLowerCase()));
    } else {
      onChange([...selected, opt]);
    }
  };

  const removeOption = (opt: string) => {
    onChange(selected.filter((s) => s.toLowerCase() !== opt.toLowerCase()));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        toggleOption(filteredOptions[0]);
        setQuery("");
        setIsOpen(false);
      } else if (query.trim()) {
        toggleOption(query.trim());
        setQuery("");
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }} ref={containerRef}>
      {/* Label and Clear action */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <label style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em" }}>
          {label} {selected.length > 0 && <span style={{ color: "#7c3aed" }}>({selected.length})</span>}
        </label>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: "0 2px" }}
            title={`Clear ${label}`}
          >
            Clear
          </button>
        )}
      </div>

      {/* Selected Pills / Chips */}
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
          {selected.map((item) => (
            <span
              key={item}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "#f5f3ff",
                color: "#6b21a8",
                border: "1px solid #ddd6fe",
                borderRadius: "16px",
                padding: "3px 9px",
                fontSize: "12px",
                fontWeight: 600,
                lineHeight: 1.3,
              }}
            >
              <span style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item}
              </span>
              <button
                type="button"
                onClick={() => removeOption(item)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "#9333ea",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "13px",
                  lineHeight: 1,
                }}
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input box with inline search */}
      <div style={{ position: "relative" }}>
        <i
          className="ti ti-search"
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#94a3b8",
            fontSize: "14px",
            pointerEvents: "none",
          }}
        ></i>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || `Search & select ${label.toLowerCase()}...`}
          style={{
            width: "100%",
            height: "36px",
            paddingLeft: "32px",
            paddingRight: query ? "28px" : "10px",
            borderRadius: "8px",
            border: isOpen ? "1.5px solid #7c3aed" : "1.5px solid #e2e8f0",
            background: isOpen ? "#ffffff" : "#f8fafc",
            fontSize: "12.5px",
            color: "#1e293b",
            outline: "none",
            transition: "all 0.15s ease",
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              fontSize: "13px",
              padding: "2px",
            }}
          >
            ✕
          </button>
        )}

        {/* Dropdown Suggestions List */}
        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              maxHeight: "220px",
              overflowY: "auto",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
              zIndex: 100,
              padding: "4px",
            }}
          >
            {filteredOptions.length === 0 ? (
              <div>
                <div style={{ padding: "8px 10px", fontSize: "12px", color: "#64748b" }}>
                  No preset match for "{query}"
                </div>
                {query.trim() && (
                  <div
                    onClick={() => {
                      toggleOption(query.trim());
                      setQuery("");
                      setIsOpen(false);
                    }}
                    style={{
                      padding: "8px 10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#7c3aed",
                      cursor: "pointer",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#faf5ff",
                    }}
                  >
                    <i className="ti ti-plus" style={{ fontSize: "13px" }}></i>
                    Add "{query.trim()}"
                  </div>
                )}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selected.some((s) => s.toLowerCase() === opt.toLowerCase());
                return (
                  <div
                    key={opt}
                    onClick={() => {
                      toggleOption(opt);
                      setQuery("");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "7px 10px",
                      borderRadius: "6px",
                      fontSize: "12.5px",
                      cursor: "pointer",
                      background: isSelected ? "#f5f3ff" : "transparent",
                      color: isSelected ? "#7c3aed" : "#334155",
                      fontWeight: isSelected ? 700 : 500,
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "#f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {opt}
                    </span>
                    {isSelected ? (
                      <i className="ti ti-check" style={{ fontSize: "14px", color: "#7c3aed" }}></i>
                    ) : (
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>+</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExploreClient({
  initialChurches,
  initialPastors = [],
  initialEvents = [],
  initialWorshipLeaders = [],
  initialSearchQuery = "",
  initialCity = "",
  initialDenom = "",
}: ExploreClientProps) {
  const [exploreType, setExploreType] = useState<"churches" | "pastors" | "events" | "worship_leaders">("churches");
  const [cardVersion, setCardVersion] = useState<"v0" | "v1" | "v2" | "v3" | "v4">("v0");
  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [openingStatus, setOpeningStatus] = useState<"all" | "open_now" | "custom">("all");
  const [customDay, setCustomDay] = useState<string>("Sun");
  const [customTime, setCustomTime] = useState<string>("all");
  const [selectedDenoms, setSelectedDenoms] = useState<string[]>(initialDenom ? [initialDenom] : []);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedWorshipStyles, setSelectedWorshipStyles] = useState<string[]>([]);
  const [selectedMinistries, setSelectedMinistries] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>(initialCity ? [initialCity] : []);
  const [sortBy, setSortBy] = useState<"name_asc" | "name_desc" | "nearby" | "latest">("latest");

  // Event specific filters
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedEventPrice, setSelectedEventPrice] = useState<"all" | "free" | "paid">("all");
  const [selectedEventTime, setSelectedEventTime] = useState<"all" | "upcoming" | "past">("upcoming");

  // Pastor specific filters (Name, City [universal], Denomination, Ministries, Education, Languages)
  const [selectedPastorNames, setSelectedPastorNames] = useState<string[]>([]);
  const [selectedPastorDenoms, setSelectedPastorDenoms] = useState<string[]>([]);
  const [selectedPastorMinistries, setSelectedPastorMinistries] = useState<string[]>([]);
  const [selectedPastorEducations, setSelectedPastorEducations] = useState<string[]>([]);
  const [selectedPastorLanguages, setSelectedPastorLanguages] = useState<string[]>([]);

  // Worship Leader specific filters
  const [selectedWlStyles, setSelectedWlStyles] = useState<string[]>([]);
  const [selectedWlInstruments, setSelectedWlInstruments] = useState<string[]>([]);
  const [selectedWlLanguages, setSelectedWlLanguages] = useState<string[]>([]);
  const [selectedWlAvailabilities, setSelectedWlAvailabilities] = useState<string[]>([]);

  // Selection & Hover State
  const [selectedChurchId, setSelectedChurchId] = useState<string | null>(null);
  const [hoveredChurchId, setHoveredChurchId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Extract distinct filter values (without "all" prefix since multi-select allows empty selection)
  const denominations = useMemo(() => {
    const list = initialChurches
      .map((c) => c.denomination?.split("|||")[0].trim())
      .filter(Boolean) as string[];
    return Array.from(new Set(list)).sort();
  }, [initialChurches]);

  const languages = useMemo(() => {
    const list: string[] = [];
    initialChurches.forEach((c) => {
      if (Array.isArray(c.languages)) {
        c.languages.forEach((l) => { if (l) list.push(l.trim()); });
      }
    });
    return Array.from(new Set(list)).sort();
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
    return Array.from(new Set(list)).sort();
  }, [initialChurches]);

  const ministries = useMemo(() => {
    const list: string[] = [];
    initialChurches.forEach((c) => {
      if (Array.isArray(c.ministries)) {
        c.ministries.forEach((m) => { if (m) list.push(m.trim()); });
      }
    });
    return Array.from(new Set(list)).sort();
  }, [initialChurches]);

  const cities = useMemo(() => {
    let rawList: (string | null | undefined)[] = [];
    if (exploreType === "churches") {
      rawList = initialChurches.map((c) => c.city);
    } else if (exploreType === "pastors") {
      rawList = initialPastors.flatMap((p) => [p.city, p.church?.city]);
    } else if (exploreType === "events") {
      rawList = initialEvents.map((e) => e.city);
    } else if (exploreType === "worship_leaders") {
      rawList = initialWorshipLeaders.map((w) => w.city);
    }
    const list = rawList.map((c) => c?.trim()).filter(Boolean) as string[];
    return Array.from(new Set(list)).sort();
  }, [initialChurches, initialPastors, initialEvents, initialWorshipLeaders, exploreType]);

  // Event filter lists
  const eventTypes = useMemo(() => {
    const list = initialEvents.map((e) => e.type?.trim()).filter(Boolean) as string[];
    return Array.from(new Set(list)).sort();
  }, [initialEvents]);

  // Pastor filter lists (Name, City [from cities], Denomination, Ministries, Education, Languages)
  const pastorNames = useMemo(() => {
    const list = initialPastors
      .map((p) => p.full_name?.trim())
      .filter(Boolean) as string[];
    return Array.from(new Set(list)).sort();
  }, [initialPastors]);

  const pastorDenominations = useMemo(() => {
    const list: string[] = [];
    initialPastors.forEach((p) => {
      const denom = p.church?.denomination || p.denomination;
      if (denom) {
        list.push(denom.split("|||")[0].trim());
      }
    });
    // Also merge church denominations so pastors can be matched against known denominations
    denominations.forEach((d) => list.push(d));
    return Array.from(new Set(list.filter(Boolean))).sort();
  }, [initialPastors, denominations]);

  const pastorMinistries = useMemo(() => {
    const list: string[] = [];
    initialPastors.forEach((p) => {
      // Tags in ministry_area or general tags
      if (Array.isArray(p.tags)) {
        p.tags.forEach((t: any) => {
          if (t?.label) list.push(t.label.trim());
        });
      }
      // Also check associated church ministries
      if (Array.isArray(p.church?.ministries)) {
        p.church.ministries.forEach((m: string) => {
          if (m) list.push(m.trim());
        });
      }
    });
    // Merge known ministries
    ministries.forEach((m) => list.push(m));
    return Array.from(new Set(list.filter(Boolean))).sort();
  }, [initialPastors, ministries]);

  const pastorEducations = useMemo(() => {
    const list: string[] = [];
    initialPastors.forEach((p) => {
      if (Array.isArray(p.education)) {
        p.education.forEach((edu: any) => {
          if (edu?.degree) list.push(edu.degree.trim());
          if (edu?.institution) list.push(edu.institution.trim());
        });
      }
    });
    return Array.from(new Set(list.filter(Boolean))).sort();
  }, [initialPastors]);

  const pastorLanguages = useMemo(() => {
    const list: string[] = [];
    initialPastors.forEach((p) => {
      if (Array.isArray(p.languages)) {
        p.languages.forEach((l: any) => {
          const lang = typeof l === "string" ? l : l?.language;
          if (lang) list.push(lang.trim());
        });
      }
    });
    // Merge church languages for convenience
    languages.forEach((l) => list.push(l));
    return Array.from(new Set(list.filter(Boolean))).sort();
  }, [initialPastors, languages]);

  // Worship Leader filter lists
  const wlStyles = useMemo(() => {
    const list: string[] = [];
    initialWorshipLeaders.forEach((w) => {
      if (Array.isArray(w.tags)) {
        w.tags.forEach((t: any) => {
          if (t?.category === "style" && t?.label) list.push(t.label.trim());
        });
      }
    });
    return Array.from(new Set(list)).sort();
  }, [initialWorshipLeaders]);

  const wlInstruments = useMemo(() => {
    const list: string[] = [];
    initialWorshipLeaders.forEach((w) => {
      if (Array.isArray(w.tags)) {
        w.tags.forEach((t: any) => {
          if (t?.category === "instrument" && t?.label) list.push(t.label.trim());
        });
      }
    });
    return Array.from(new Set(list)).sort();
  }, [initialWorshipLeaders]);

  const wlLanguages = useMemo(() => {
    const list: string[] = [];
    initialWorshipLeaders.forEach((w) => {
      if (Array.isArray(w.tags)) {
        w.tags.forEach((t: any) => {
          if (t?.category === "language" && t?.label) list.push(t.label.trim());
        });
      }
    });
    return Array.from(new Set(list)).sort();
  }, [initialWorshipLeaders]);

  const wlAvailabilities = useMemo(() => {
    const list: string[] = [];
    initialWorshipLeaders.forEach((w) => {
      if (Array.isArray(w.tags)) {
        w.tags.forEach((t: any) => {
          if (t?.category === "available_for" && t?.label) list.push(t.label.trim());
        });
      }
    });
    return Array.from(new Set(list)).sort();
  }, [initialWorshipLeaders]);

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
          church.formatted_address?.toLowerCase().includes(q) ||
          church.country?.toLowerCase().includes(q) ||
          church.about?.toLowerCase().includes(q) ||
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
          selectedDenoms.length === 0 ||
          selectedDenoms.some((d) => church.denomination?.toLowerCase().includes(d.toLowerCase()));

        // 4. Languages
        const matchesLanguage =
          selectedLanguages.length === 0 ||
          selectedLanguages.some((l) =>
            Array.isArray(church.languages) &&
            church.languages.some((cl) => cl.toLowerCase() === l.toLowerCase())
          );

        // 5. Worship Styles
        const churchWorship = church.worship_style || church.worship_styles;
        let matchesWorship = true;
        if (selectedWorshipStyles.length > 0) {
          matchesWorship = selectedWorshipStyles.some((style) => {
            if (Array.isArray(churchWorship)) {
              return churchWorship.some((w) => w.toLowerCase() === style.toLowerCase());
            } else if (typeof churchWorship === "string") {
              return churchWorship.toLowerCase().includes(style.toLowerCase());
            }
            return false;
          });
        }

        // 6. Ministries
        const matchesMinistry =
          selectedMinistries.length === 0 ||
          selectedMinistries.some((m) =>
            Array.isArray(church.ministries) &&
            church.ministries.some((cm) => cm.toLowerCase() === m.toLowerCase())
          );

        // 7. City
        const matchesCity =
          selectedCities.length === 0 ||
          selectedCities.some((c) => church.city?.toLowerCase() === c.toLowerCase());

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
    selectedDenoms,
    selectedLanguages,
    selectedWorshipStyles,
    selectedMinistries,
    selectedCities,
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

        // Name filter
        const matchesName =
          selectedPastorNames.length === 0 ||
          selectedPastorNames.some(
            (n) => pastor.full_name?.toLowerCase().includes(n.toLowerCase())
          );

        // City filter (pastor city or affiliated church city)
        const matchesCity =
          selectedCities.length === 0 ||
          selectedCities.some(
            (c) =>
              pastor.city?.toLowerCase() === c.toLowerCase() ||
              pastor.church?.city?.toLowerCase() === c.toLowerCase()
          );

        // Denomination filter (church denomination or pastor denomination)
        const matchesDenom =
          selectedPastorDenoms.length === 0 ||
          selectedPastorDenoms.some((d) => {
            const denom = pastor.church?.denomination || pastor.denomination || "";
            return denom.toLowerCase().includes(d.toLowerCase());
          });

        // Ministries filter (tags or church ministries)
        const matchesMinistries =
          selectedPastorMinistries.length === 0 ||
          selectedPastorMinistries.some((m) => {
            const tagMatch =
              Array.isArray(pastor.tags) &&
              pastor.tags.some((t: any) => t?.label?.toLowerCase().includes(m.toLowerCase()));
            const churchMinMatch =
              Array.isArray(pastor.church?.ministries) &&
              pastor.church.ministries.some((cm: string) => cm.toLowerCase().includes(m.toLowerCase()));
            return tagMatch || churchMinMatch;
          });

        // Education filter (degree or institution)
        const matchesEducation =
          selectedPastorEducations.length === 0 ||
          selectedPastorEducations.some((eduFilter) => {
            return (
              Array.isArray(pastor.education) &&
              pastor.education.some((e: any) => {
                const deg = e?.degree?.toLowerCase() || "";
                const inst = e?.institution?.toLowerCase() || "";
                const filter = eduFilter.toLowerCase();
                return deg.includes(filter) || inst.includes(filter);
              })
            );
          });

        // Languages filter
        const matchesLanguages =
          selectedPastorLanguages.length === 0 ||
          selectedPastorLanguages.some((langFilter) => {
            const lFilter = langFilter.toLowerCase();
            const pastorLangMatch =
              Array.isArray(pastor.languages) &&
              pastor.languages.some((l: any) => {
                const langStr = typeof l === "string" ? l : l?.language || "";
                return langStr.toLowerCase() === lFilter;
              });
            const churchLangMatch =
              Array.isArray(pastor.church?.languages) &&
              pastor.church.languages.some((cl: string) => cl.toLowerCase() === lFilter);
            return pastorLangMatch || churchLangMatch;
          });

        return (
          matchesQuery &&
          matchesName &&
          matchesCity &&
          matchesDenom &&
          matchesMinistries &&
          matchesEducation &&
          matchesLanguages
        );
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
  }, [
    initialPastors,
    searchQuery,
    selectedPastorNames,
    selectedCities,
    selectedPastorDenoms,
    selectedPastorMinistries,
    selectedPastorEducations,
    selectedPastorLanguages,
    sortBy,
    userLocation,
  ]);

  const filteredEvents = useMemo(() => {
    const now = new Date().getTime();
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

        const matchesCity =
          selectedCities.length === 0 ||
          selectedCities.some((c) => event.city?.toLowerCase() === c.toLowerCase());

        const matchesType =
          selectedEventTypes.length === 0 ||
          selectedEventTypes.some((t) => event.type && event.type.toLowerCase() === t.toLowerCase());

        const matchesPrice =
          selectedEventPrice === "all" ||
          (selectedEventPrice === "free" ? event.is_free : !event.is_free);

        let matchesTime = true;
        if (event.starts_at) {
          const eventTime = new Date(event.starts_at).getTime();
          if (selectedEventTime === "upcoming") {
            matchesTime = eventTime >= now - 1000 * 60 * 60 * 24; // buffer 1 day
          } else if (selectedEventTime === "past") {
            matchesTime = eventTime < now - 1000 * 60 * 60 * 24;
          }
        }

        return matchesQuery && matchesCity && matchesType && matchesPrice && matchesTime;
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
        return new Date(b.starts_at || b.created_at || 0).getTime() - new Date(a.starts_at || a.created_at || 0).getTime();
      });
  }, [initialEvents, searchQuery, selectedCities, selectedEventTypes, selectedEventPrice, selectedEventTime, sortBy, userLocation]);

  const filteredWorshipLeaders = useMemo(() => {
    return initialWorshipLeaders
      .filter((leader) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          leader.display_name?.toLowerCase().includes(q) ||
          leader.tagline?.toLowerCase().includes(q) ||
          leader.city?.toLowerCase().includes(q);

        const matchesCity =
          selectedCities.length === 0 ||
          selectedCities.some((c) => leader.city?.toLowerCase() === c.toLowerCase());

        const matchesStyle =
          selectedWlStyles.length === 0 ||
          selectedWlStyles.some((s) =>
            Array.isArray(leader.tags) &&
            leader.tags.some(
              (t: any) =>
                t?.category === "style" &&
                t?.label?.toLowerCase() === s.toLowerCase()
            )
          );

        const matchesInstrument =
          selectedWlInstruments.length === 0 ||
          selectedWlInstruments.some((inst) =>
            Array.isArray(leader.tags) &&
            leader.tags.some(
              (t: any) =>
                t?.category === "instrument" &&
                t?.label?.toLowerCase() === inst.toLowerCase()
            )
          );

        const matchesLanguage =
          selectedWlLanguages.length === 0 ||
          selectedWlLanguages.some((l) =>
            Array.isArray(leader.tags) &&
            leader.tags.some(
              (t: any) =>
                t?.category === "language" &&
                t?.label?.toLowerCase() === l.toLowerCase()
            )
          );

        const matchesAvailability =
          selectedWlAvailabilities.length === 0 ||
          selectedWlAvailabilities.some((a) =>
            Array.isArray(leader.tags) &&
            leader.tags.some(
              (t: any) =>
                t?.category === "available_for" &&
                t?.label?.toLowerCase() === a.toLowerCase()
            )
          );

        return (
          matchesQuery &&
          matchesCity &&
          matchesStyle &&
          matchesInstrument &&
          matchesLanguage &&
          matchesAvailability
        );
      })
      .map((leader) => ({ ...leader, type: "worship_leader" }))
      .sort((a, b) => {
        if (sortBy === "name_asc") return a.display_name.localeCompare(b.display_name);
        if (sortBy === "name_desc") return b.display_name.localeCompare(a.display_name);
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [initialWorshipLeaders, searchQuery, selectedCities, selectedWlStyles, selectedWlInstruments, selectedWlLanguages, selectedWlAvailabilities, sortBy]);

  const currentList = useMemo(() => {
    if (exploreType === "pastors") return filteredPastors;
    if (exploreType === "events") return filteredEvents;
    if (exploreType === "worship_leaders") return filteredWorshipLeaders;
    return filteredChurches.map(c => ({ ...c, type: "church" }));
  }, [exploreType, filteredChurches, filteredPastors, filteredEvents, filteredWorshipLeaders]);

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
    searchQuery.trim() !== "" ||
    selectedCities.length > 0 ||
    (exploreType === "churches" && (
      selectedDenoms.length > 0 ||
      selectedLanguages.length > 0 ||
      selectedWorshipStyles.length > 0 ||
      selectedMinistries.length > 0 ||
      openingStatus !== "all"
    )) ||
    (exploreType === "events" && (
      selectedEventTypes.length > 0 ||
      selectedEventPrice !== "all" ||
      selectedEventTime !== "all"
    )) ||
    (exploreType === "pastors" && (
      selectedPastorNames.length > 0 ||
      selectedPastorDenoms.length > 0 ||
      selectedPastorMinistries.length > 0 ||
      selectedPastorEducations.length > 0 ||
      selectedPastorLanguages.length > 0
    )) ||
    (exploreType === "worship_leaders" && (
      selectedWlStyles.length > 0 ||
      selectedWlInstruments.length > 0 ||
      selectedWlLanguages.length > 0 ||
      selectedWlAvailabilities.length > 0
    ));

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCities([]);
    setSortBy("latest");
    // Church filters
    setOpeningStatus("all");
    setSelectedDenoms([]);
    setSelectedLanguages([]);
    setSelectedWorshipStyles([]);
    setSelectedMinistries([]);
    // Event filters
    setSelectedEventTypes([]);
    setSelectedEventPrice("all");
    setSelectedEventTime("all");
    // Pastor filters
    setSelectedPastorNames([]);
    setSelectedPastorDenoms([]);
    setSelectedPastorMinistries([]);
    setSelectedPastorEducations([]);
    setSelectedPastorLanguages([]);
    // Worship Leader filters
    setSelectedWlStyles([]);
    setSelectedWlInstruments([]);
    setSelectedWlLanguages([]);
    setSelectedWlAvailabilities([]);
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
            onClick={() => {
              setExploreType("churches");
              setSelectedCities([]);
              setSelectedChurchId(null);
            }}
            className={`explore-tab ${exploreType === "churches" ? "active" : ""}`}
          >
            <i className="ti ti-building-church" style={{ fontSize: "16px" }}></i> Churches
          </button>
          <button
            onClick={() => {
              setExploreType("pastors");
              setSelectedCities([]);
              setSelectedChurchId(null);
            }}
            className={`explore-tab ${exploreType === "pastors" ? "active" : ""}`}
          >
            <i className="ti ti-user" style={{ fontSize: "16px" }}></i> Pastors
          </button>
          <button
            onClick={() => {
              setExploreType("events");
              setSelectedCities([]);
              setSelectedChurchId(null);
            }}
            className={`explore-tab ${exploreType === "events" ? "active" : ""}`}
          >
            <i className="ti ti-calendar-event" style={{ fontSize: "16px" }}></i> Events
          </button>
          <button
            onClick={() => {
              setExploreType("worship_leaders");
              setSelectedCities([]);
              setSelectedChurchId(null);
            }}
            className={`explore-tab ${exploreType === "worship_leaders" ? "active" : ""}`}
          >
            <i className="ti ti-microphone-2" style={{ fontSize: "16px" }}></i> Worship Leaders
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
                  placeholder={
                    exploreType === "churches"
                      ? "Search church name, city, denom..."
                      : exploreType === "pastors"
                      ? "Search pastor name, church, city..."
                      : exploreType === "events"
                      ? "Search event title, venue, city..."
                      : "Search worship leader name, city..."
                  }
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

              {/* City Filter (Available for Churches, Events, and Worship Leaders tabs) */}
              {exploreType !== "pastors" && (
                <MultiSelectSearchFilter
                  label="Cities"
                  placeholder="Search city..."
                  options={cities}
                  selected={selectedCities}
                  onChange={setSelectedCities}
                />
              )}

              {/* CHURCH FILTERS */}
              {exploreType === "churches" && (
                <>
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

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <MultiSelectSearchFilter
                      label="Denominations"
                      placeholder="Search denomination..."
                      options={denominations}
                      selected={selectedDenoms}
                      onChange={setSelectedDenoms}
                    />
                    <MultiSelectSearchFilter
                      label="Languages"
                      placeholder="Search language..."
                      options={languages}
                      selected={selectedLanguages}
                      onChange={setSelectedLanguages}
                    />
                    <MultiSelectSearchFilter
                      label="Worship Styles"
                      placeholder="Search worship style..."
                      options={worshipStyles}
                      selected={selectedWorshipStyles}
                      onChange={setSelectedWorshipStyles}
                    />
                    <MultiSelectSearchFilter
                      label="Ministries"
                      placeholder="Search ministry..."
                      options={ministries}
                      selected={selectedMinistries}
                      onChange={setSelectedMinistries}
                    />
                  </div>
                </>
              )}

              {/* EVENT FILTERS */}
              {exploreType === "events" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Event Timing Filter (Upcoming vs Past) */}
                  <div>
                    <h3 style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: 800, color: "#94a3b8", letterSpacing: "0.05em", marginBottom: "12px" }}>Timeframe</h3>
                    <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "8px", padding: "4px" }}>
                      {[
                        { label: "ALL", value: "all" },
                        { label: "UPCOMING", value: "upcoming" },
                        { label: "PAST", value: "past" }
                      ].map(t => (
                        <button
                          key={t.value}
                          onClick={() => setSelectedEventTime(t.value as any)}
                          style={{ flex: 1, padding: "8px 0", fontSize: "11px", fontWeight: 700, borderRadius: "6px", border: "none", background: selectedEventTime === t.value ? "#fff" : "transparent", color: selectedEventTime === t.value ? "#0f172a" : "#64748b", boxShadow: selectedEventTime === t.value ? "0 1px 3px rgba(0,0,0,0.1)" : "none", cursor: "pointer" }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Event Type Multi-Select */}
                  <MultiSelectSearchFilter
                    label="Event Types"
                    placeholder="Search event type..."
                    options={eventTypes}
                    selected={selectedEventTypes}
                    onChange={setSelectedEventTypes}
                  />

                  {/* Price Filter (Free vs Ticketed) */}
                  <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
                    <div style={{ position: "relative", width: "100%" }}>
                      <select
                        value={selectedEventPrice}
                        onChange={(e) => setSelectedEventPrice(e.target.value as any)}
                        style={{ width: "100%", appearance: "none", background: "transparent", border: "none", fontSize: "14px", fontWeight: 600, color: selectedEventPrice === 'all' ? "#334155" : "#7c3aed", cursor: "pointer", outline: "none", padding: "8px 24px 8px 8px", marginLeft: "-8px", borderRadius: "8px" }}
                      >
                        <option value="all">All Pricing</option>
                        <option value="free">Free Events Only</option>
                        <option value="paid">Ticketed / Paid</option>
                      </select>
                      <i className="ti ti-chevron-down" style={{ position: "absolute", right: "4px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8", fontSize: "16px" }}></i>
                    </div>
                  </div>
                </div>
              )}

              {/* PASTOR FILTERS: Name, City, Denomination, Ministries, Education, Languages */}
              {exploreType === "pastors" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* 1. Name */}
                  <MultiSelectSearchFilter
                    label="Pastor Name"
                    placeholder="Search pastor name..."
                    options={pastorNames}
                    selected={selectedPastorNames}
                    onChange={setSelectedPastorNames}
                  />

                  {/* 2. City */}
                  <MultiSelectSearchFilter
                    label="Cities"
                    placeholder="Search city..."
                    options={cities}
                    selected={selectedCities}
                    onChange={setSelectedCities}
                  />

                  {/* 3. Denomination */}
                  <MultiSelectSearchFilter
                    label="Denominations"
                    placeholder="Search denomination..."
                    options={pastorDenominations}
                    selected={selectedPastorDenoms}
                    onChange={setSelectedPastorDenoms}
                  />

                  {/* 4. Ministries */}
                  <MultiSelectSearchFilter
                    label="Ministries & Outreach"
                    placeholder="Search ministry..."
                    options={pastorMinistries}
                    selected={selectedPastorMinistries}
                    onChange={setSelectedPastorMinistries}
                  />

                  {/* 5. Education */}
                  <MultiSelectSearchFilter
                    label="Education & Institution"
                    placeholder="Search degree or institution..."
                    options={pastorEducations}
                    selected={selectedPastorEducations}
                    onChange={setSelectedPastorEducations}
                  />

                  {/* 6. Languages */}
                  <MultiSelectSearchFilter
                    label="Languages"
                    placeholder="Search language..."
                    options={pastorLanguages}
                    selected={selectedPastorLanguages}
                    onChange={setSelectedPastorLanguages}
                  />
                </div>
              )}

              {/* WORSHIP LEADER FILTERS */}
              {exploreType === "worship_leaders" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Style */}
                  <MultiSelectSearchFilter
                    label="Worship Styles"
                    placeholder="Search worship style..."
                    options={wlStyles}
                    selected={selectedWlStyles}
                    onChange={setSelectedWlStyles}
                  />

                  {/* Instrument */}
                  <MultiSelectSearchFilter
                    label="Instruments"
                    placeholder="Search instrument..."
                    options={wlInstruments}
                    selected={selectedWlInstruments}
                    onChange={setSelectedWlInstruments}
                  />

                  {/* Language */}
                  <MultiSelectSearchFilter
                    label="Languages"
                    placeholder="Search language..."
                    options={wlLanguages}
                    selected={selectedWlLanguages}
                    onChange={setSelectedWlLanguages}
                  />

                  {/* Available For */}
                  <MultiSelectSearchFilter
                    label="Available For"
                    placeholder="Search availability..."
                    options={wlAvailabilities}
                    selected={selectedWlAvailabilities}
                    onChange={setSelectedWlAvailabilities}
                  />
                </div>
              )}

              {/* Sort By Dropdown (Universal) */}
              <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
                <div style={{ position: "relative", width: "100%" }}>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    style={{ width: "100%", appearance: "none", background: "transparent", border: "none", fontSize: "14px", fontWeight: 600, color: "#334155", cursor: "pointer", outline: "none", padding: "8px 24px 8px 8px", marginLeft: "-8px", borderRadius: "8px" }}
                  >
                    <option value="latest">{exploreType === "events" ? "Sort By: Event Date" : "Sort By: Latest"}</option>
                    <option value="nearby">Sort By: Nearby</option>
                    <option value="name_asc">Sort By: Name A-Z</option>
                    <option value="name_desc">Sort By: Name Z-A</option>
                  </select>
                  <i className="ti ti-chevron-down" style={{ position: "absolute", right: "4px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8", fontSize: "16px" }}></i>
                </div>
              </div>
          </div>
        </div>

        {/* LIST COLUMN (Middle / Full if no map) */}
        <div style={{
          width: (exploreType === "pastors" || exploreType === "worship_leaders") ? "100%" : "400px",
          minWidth: (exploreType === "pastors" || exploreType === "worship_leaders") ? "0" : "400px",
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
                SHOWING {exploreType === "churches" ? filteredChurches.length : exploreType === "pastors" ? filteredPastors.length : exploreType === "events" ? filteredEvents.length : filteredWorshipLeaders.length} OF {exploreType === "churches" ? initialChurches.length : exploreType === "pastors" ? initialPastors.length : exploreType === "events" ? initialEvents.length : initialWorshipLeaders.length} {exploreType === "worship_leaders" ? "WORSHIP LEADERS" : exploreType.toUpperCase()}
             </div>
           </div>

           {/* Cards Container */}
           <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", background: "#f8fafc" }}>
            {exploreType === "worship_leaders" && (
              filteredWorshipLeaders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b" }}>
                  <i className="ti ti-microphone-2" style={{ fontSize: "40px", color: "#cbd5e1", marginBottom: "12px", display: "block" }}></i>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>No worship leaders match your search</h3>
                  <p style={{ fontSize: "13px" }}>Try clearing some filters.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                  {filteredWorshipLeaders.map((leader) => {
                    const isSelected = leader.id === selectedChurchId;
                    const avatarImage = leader.avatar_url || null;
                    const coverImage = Array.isArray(leader.cover_photo_urls) && leader.cover_photo_urls.length > 0 ? leader.cover_photo_urls[0] : null;

                    return (
                      <Link key={leader.id} href={`/worship-leader/${leader.slug}`} className={`pastor-grid-card ${isSelected ? "selected" : ""}`} style={{ textDecoration: 'none' }}>
                        <div style={{ width: "100%", height: "220px", background: avatarImage ? `url('${avatarImage}') center/cover` : coverImage ? `url('${coverImage}') center/cover` : "linear-gradient(135deg, #f43f5e, #db2777)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {!avatarImage && !coverImage && <i className="ti ti-user" style={{ fontSize: "42px", color: "rgba(255,255,255,0.45)" }}></i>}
                        </div>
                        <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "10px" }}>
                          <div>
                            <div style={{ marginBottom: "6px" }}>
                              <span style={{ fontSize: "9px", fontWeight: 800, color: "#e11d48", background: "#ffe4e6", padding: "2.5px 7px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.03em", display: "inline-block" }}>Worship Leader</span>
                            </div>
                            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0", lineHeight: 1.3 }}>{leader.display_name}</h3>
                            {leader.city && (
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#475569", marginBottom: "5px" }}>
                                <i className="ti ti-map-pin" style={{ color: "#e11d48", fontSize: "14px" }}></i>
                                <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{leader.city}</span>
                              </div>
                            )}
                          </div>
                          <div className="pastor-card-footer" style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", marginTop: "4px", fontSize: "13px", fontWeight: 800, color: "#e11d48", display: "flex", justifyContent: "space-between" }}>View Profile <i className="ti ti-arrow-up-right" style={{ fontSize: "14px" }}></i></div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )
            )}
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

        {/* RIGHT COLUMN: Interactive Leaflet Map (for Churches and Events) */}
        {(exploreType === "churches" || exploreType === "events") && (
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
