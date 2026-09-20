"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import type { Church, ChurchService } from "@/lib/types";
import dynamic from "next/dynamic";
import TopNav from "@/components/layout/TopNav";

const ChurchMap = dynamic(() => import("@/components/explore/ChurchMap"), {
  ssr: false,
  loading: () => (
    <div style={{
      width: "100%",
      height: "100%",
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#eef2f6",
      gap: "12px",
      padding: "20px",
      textAlign: "center"
    }}>
      <div style={{
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #7c3aed, #e11d48)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 18px rgba(124, 58, 237, 0.25)"
      }}>
        <i className="ti ti-map-pin" style={{ color: "#fff", fontSize: "22px" }}></i>
      </div>
      <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b" }}>Loading Interactive Map...</div>
      <div style={{ fontSize: "12px", color: "#64748b" }}>You can already browse, search and filter the churches on the left.</div>
    </div>
  ),
});

export type ExploreChurch = Partial<Church> & {
  id: string;
  slug: string;
  name: string;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  cover_url?: string | null;
  logo_url?: string | null;
  denomination?: string | null;
  is_verified?: boolean;
  created_at?: string;
  address_line?: string | null;
  formatted_address?: string | null;
  postcode?: string | null;
  country?: string | null;
  about?: string | null;
  languages?: string[] | null;
  worship_style?: string | string[] | null;
  worship_styles?: string | string[] | null;
  ministries?: string[] | null;
  church_services?: any[];
  distance?: number | null;
};

interface ExploreClientProps {
  initialChurches: ExploreChurch[];
  initialPastors?: any[];
  initialEvents?: any[];
  initialWorshipLeaders?: any[];
  initialSearchQuery?: string;
  initialCity?: string;
  initialDenom?: string;
}

interface FilterOptionItem {
  label: string;
  count?: number;
}

interface MultiSelectSearchFilterProps {
  label: string;
  placeholder?: string;
  options: (string | FilterOptionItem)[];
  selected: string[];
  onChange: (selected: string[]) => void;
  openOnlyOnSearch?: boolean;
}

function MultiSelectSearchFilter({
  label,
  placeholder,
  options,
  selected,
  onChange,
  openOnlyOnSearch = false,
}: MultiSelectSearchFilterProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to { label, count }
  const normalizedOptions: FilterOptionItem[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { label: opt, count: undefined };
      }
      return opt;
    });
  }, [options]);

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
    if (!q) return normalizedOptions;
    return normalizedOptions.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [normalizedOptions, query]);

  const toggleOption = (optLabel: string) => {
    const exists = selected.some((s) => s.toLowerCase() === optLabel.toLowerCase());
    if (exists) {
      onChange(selected.filter((s) => s.toLowerCase() !== optLabel.toLowerCase()));
    } else {
      onChange([...selected, optLabel]);
    }
  };

  const removeOption = (optLabel: string) => {
    onChange(selected.filter((s) => s.toLowerCase() !== optLabel.toLowerCase()));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        toggleOption(filteredOptions[0].label);
        setQuery("");
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
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

      {/* Input box with search icon and dropdown toggle */}
      <div style={{ position: "relative" }} ref={containerRef}>
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
            onClick={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || `Select ${label.toLowerCase()}...`}
            style={{
              width: "100%",
              height: "36px",
              paddingLeft: "32px",
              paddingRight: "52px",
              borderRadius: "8px",
              border: isOpen ? "1.5px solid #7c3aed" : "1.5px solid #e2e8f0",
              background: isOpen ? "#ffffff" : "#f8fafc",
              fontSize: "12.5px",
              color: "#1e293b",
              outline: "none",
              transition: "all 0.15s ease",
            }}
          />

          <div style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: "2px" }}>
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                style={{
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
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                padding: "2px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <i
                className="ti ti-chevron-down"
                style={{
                  fontSize: "13px",
                  transition: "transform 0.2s",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              ></i>
            </button>
          </div>

          {/* Dropdown List of All Items (Filtered as you search) */}
          {isOpen && (!openOnlyOnSearch || query.trim().length > 0) && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                maxHeight: "220px",
                overflowY: "auto",
                background: "#ffffff",
                border: "1.5px solid #e2e8f0",
                borderRadius: "10px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                zIndex: 100,
                padding: "4px",
              }}
            >
              {filteredOptions.length === 0 ? (
                <div style={{ padding: "10px 12px", fontSize: "12px", color: "#64748b", textAlign: "center" }}>
                  No matching {label.toLowerCase()} found
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = selected.some((s) => s.toLowerCase() === opt.label.toLowerCase());
                  return (
                    <div
                      key={opt.label}
                      onClick={() => {
                        toggleOption(opt.label);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        cursor: "pointer",
                        background: isSelected ? "#f5f3ff" : "transparent",
                        color: isSelected ? "#7c3aed" : "#334155",
                        fontWeight: isSelected ? 700 : 500,
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>{opt.label}</span>
                        {typeof opt.count === "number" && (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: isSelected ? "#7c3aed" : "#64748b",
                              background: isSelected ? "#ede9fe" : "#f1f5f9",
                              padding: "1px 6px",
                              borderRadius: "10px",
                            }}
                          >
                            {opt.count}
                          </span>
                        )}
                      </span>
                      {isSelected ? (
                        <i className="ti ti-check" style={{ fontSize: "14px", color: "#7c3aed", flexShrink: 0 }}></i>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#cbd5e1", flexShrink: 0 }}>+</span>
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

  // Lazy-loaded data state with in-memory cache
  const [pastorsData, setPastorsData] = useState<any[]>(initialPastors);
  const [eventsData, setEventsData] = useState<any[]>(initialEvents);
  const [worshipLeadersData, setWorshipLeadersData] = useState<any[]>(initialWorshipLeaders);

  const [isLoadingPastors, setIsLoadingPastors] = useState<boolean>(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [isLoadingWorshipLeaders, setIsLoadingWorshipLeaders] = useState<boolean>(false);

  // Fetch pastors on demand if not loaded yet
  const fetchPastorsIfNeeded = async () => {
    if (pastorsData.length > 0 || isLoadingPastors) return;
    setIsLoadingPastors(true);
    try {
      const res = await fetch("/api/explore/pastors");
      if (res.ok) {
        const data = await res.json();
        setPastorsData(data);
      }
    } catch (err) {
      console.error("Failed to load pastors:", err);
    } finally {
      setIsLoadingPastors(false);
    }
  };

  // Fetch events on demand if not loaded yet
  const fetchEventsIfNeeded = async () => {
    if (eventsData.length > 0 || isLoadingEvents) return;
    setIsLoadingEvents(true);
    try {
      const res = await fetch("/api/explore/events");
      if (res.ok) {
        const data = await res.json();
        setEventsData(data);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Fetch worship leaders on demand if not loaded yet
  const fetchWorshipLeadersIfNeeded = async () => {
    if (worshipLeadersData.length > 0 || isLoadingWorshipLeaders) return;
    setIsLoadingWorshipLeaders(true);
    try {
      const res = await fetch("/api/explore/worship-leaders");
      if (res.ok) {
        const data = await res.json();
        setWorshipLeadersData(data);
      }
    } catch (err) {
      console.error("Failed to load worship leaders:", err);
    } finally {
      setIsLoadingWorshipLeaders(false);
    }
  };

  // Trigger on-demand fetching when user switches tab
  useEffect(() => {
    if (exploreType === "pastors") {
      fetchPastorsIfNeeded();
    } else if (exploreType === "events") {
      fetchEventsIfNeeded();
    } else if (exploreType === "worship_leaders") {
      fetchWorshipLeadersIfNeeded();
    }
  }, [exploreType]);

  // Optional background pre-fetch: after 2.5s when initial church page has rendered, quietly load the rest
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPastorsIfNeeded();
      fetchEventsIfNeeded();
      fetchWorshipLeadersIfNeeded();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isTypingSearch, setIsTypingSearch] = useState(false);
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
  const [maxDistance, setMaxDistance] = useState<number>(30); // in kilometers
  const [isLocating, setIsLocating] = useState(false);

  // Extract distinct filter values with counts (sorted by count desc, then name asc)
  const denominations = useMemo(() => {
    const counts: Record<string, number> = {};
    initialChurches.forEach((c) => {
      const d = c.denomination?.split("|||")[0].trim();
      if (d) counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [initialChurches]);

  const languages = useMemo(() => {
    const counts: Record<string, number> = {};
    initialChurches.forEach((c) => {
      if (Array.isArray(c.languages)) {
        c.languages.forEach((l) => {
          const lang = l?.trim();
          if (lang) counts[lang] = (counts[lang] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [initialChurches]);

  const worshipStyles = useMemo(() => {
    const counts: Record<string, number> = {};
    initialChurches.forEach((c) => {
      const styles = c.worship_style || c.worship_styles;
      if (Array.isArray(styles)) {
        styles.forEach((s) => {
          const str = s?.trim();
          if (str) counts[str] = (counts[str] || 0) + 1;
        });
      } else if (typeof styles === "string") {
        styles.split(",").forEach((s) => {
          const str = s?.trim();
          if (str) counts[str] = (counts[str] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [initialChurches]);

  const ministries = useMemo(() => {
    const counts: Record<string, number> = {};
    initialChurches.forEach((c) => {
      if (Array.isArray(c.ministries)) {
        c.ministries.forEach((m) => {
          const ministry = m?.trim();
          if (ministry) counts[ministry] = (counts[ministry] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [initialChurches]);

  const cities = useMemo(() => {
    const counts: Record<string, number> = {};
    const addCity = (city: string | null | undefined) => {
      const c = city?.trim();
      if (c) counts[c] = (counts[c] || 0) + 1;
    };

    if (exploreType === "churches") {
      initialChurches.forEach((c) => addCity(c.city));
    } else if (exploreType === "pastors") {
      pastorsData.forEach((p) => {
        const c = p.city?.trim() || p.church?.city?.trim();
        if (c) counts[c] = (counts[c] || 0) + 1;
      });
    } else if (exploreType === "events") {
      eventsData.forEach((e) => addCity(e.city));
    } else if (exploreType === "worship_leaders") {
      worshipLeadersData.forEach((w) => addCity(w.city));
    }

    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [initialChurches, pastorsData, eventsData, worshipLeadersData, exploreType]);

  // Event filter lists
  const eventTypes = useMemo(() => {
    const counts: Record<string, number> = {};
    eventsData.forEach((e) => {
      const t = e.type?.trim();
      if (t) counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [eventsData]);

  // Pastor filter lists (Name, City [from cities], Denomination, Ministries, Education, Languages)
  const pastorNames = useMemo(() => {
    const counts: Record<string, number> = {};
    pastorsData.forEach((p) => {
      const name = p.full_name?.trim();
      if (name) counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [pastorsData]);

  const pastorDenominations = useMemo(() => {
    const counts: Record<string, number> = {};
    pastorsData.forEach((p) => {
      const denom = p.church?.denomination || p.denomination;
      if (denom) {
        const d = denom.split("|||")[0].trim();
        if (d) counts[d] = (counts[d] || 0) + 1;
      }
    });
    // Ensure all known denominations appear, even if 0 pastors
    denominations.forEach((d) => {
      if (!counts[d.label]) {
        counts[d.label] = 0;
      }
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [pastorsData, denominations]);

  const pastorMinistries = useMemo(() => {
    const counts: Record<string, number> = {};
    pastorsData.forEach((p) => {
      const seenForPastor = new Set<string>();
      if (Array.isArray(p.tags)) {
        p.tags.forEach((t: any) => {
          if (t?.label) seenForPastor.add(t.label.trim());
        });
      }
      if (Array.isArray(p.church?.ministries)) {
        p.church.ministries.forEach((m: string) => {
          if (m) seenForPastor.add(m.trim());
        });
      }
      seenForPastor.forEach((m) => {
        counts[m] = (counts[m] || 0) + 1;
      });
    });
    ministries.forEach((m) => {
      if (!counts[m.label]) {
        counts[m.label] = 0;
      }
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [pastorsData, ministries]);

  const pastorEducations = useMemo(() => {
    const counts: Record<string, number> = {};
    pastorsData.forEach((p) => {
      const seenForPastor = new Set<string>();
      if (Array.isArray(p.education)) {
        p.education.forEach((edu: any) => {
          if (edu?.degree) seenForPastor.add(edu.degree.trim());
          if (edu?.institution) seenForPastor.add(edu.institution.trim());
        });
      }
      seenForPastor.forEach((edu) => {
        counts[edu] = (counts[edu] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [pastorsData]);

  const pastorLanguages = useMemo(() => {
    const counts: Record<string, number> = {};
    pastorsData.forEach((p) => {
      const seenForPastor = new Set<string>();
      if (Array.isArray(p.languages)) {
        p.languages.forEach((l: any) => {
          const lang = typeof l === "string" ? l : l?.language;
          if (lang) seenForPastor.add(lang.trim());
        });
      }
      seenForPastor.forEach((lang) => {
        counts[lang] = (counts[lang] || 0) + 1;
      });
    });
    languages.forEach((l) => {
      if (!counts[l.label]) {
        counts[l.label] = 0;
      }
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [pastorsData, languages]);

  // Worship Leader filter lists
  const wlStyles = useMemo(() => {
    const counts: Record<string, number> = {};
    worshipLeadersData.forEach((w) => {
      if (Array.isArray(w.tags)) {
        w.tags.forEach((t: any) => {
          if (t?.category === "style" && t?.label) {
            const val = t.label.trim();
            counts[val] = (counts[val] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [worshipLeadersData]);

  const wlInstruments = useMemo(() => {
    const counts: Record<string, number> = {};
    worshipLeadersData.forEach((w) => {
      if (Array.isArray(w.tags)) {
        w.tags.forEach((t: any) => {
          if (t?.category === "instrument" && t?.label) {
            const val = t.label.trim();
            counts[val] = (counts[val] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [worshipLeadersData]);

  const wlLanguages = useMemo(() => {
    const counts: Record<string, number> = {};
    worshipLeadersData.forEach((w) => {
      if (Array.isArray(w.tags)) {
        w.tags.forEach((t: any) => {
          if (t?.category === "language" && t?.label) {
            const val = t.label.trim();
            counts[val] = (counts[val] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [worshipLeadersData]);

  const wlAvailabilities = useMemo(() => {
    const counts: Record<string, number> = {};
    worshipLeadersData.forEach((w) => {
      if (Array.isArray(w.tags)) {
        w.tags.forEach((t: any) => {
          if (t?.category === "available_for" && t?.label) {
            const val = t.label.trim();
            counts[val] = (counts[val] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [worshipLeadersData]);

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

  // Helper to calculate search query relevance score (higher score = more relevant)
  const getSearchRelevance = (query: string, name?: string | null, city?: string | null, otherField?: string | null) => {
    const q = query.trim().toLowerCase();
    if (!q) return 0;

    const n = (name || "").trim().toLowerCase();
    const c = (city || "").trim().toLowerCase();
    const o = (otherField || "").trim().toLowerCase();

    // 1. Exact name match (e.g. "aa" == "aa")
    if (n === q) return 1000;

    // 2. Name starts with query (e.g. "aa" at start of name)
    if (n.startsWith(q)) return 800;

    // 3. Name word starts with query (e.g. "Grace AA Church")
    const words = n.split(/\s+/);
    if (words.some((w) => w.startsWith(q))) return 600;

    // 4. Name contains query anywhere
    if (n.includes(q)) return 400;

    // 5. City starts with query
    if (c.startsWith(q)) return 250;

    // 6. City contains query
    if (c.includes(q)) return 200;

    // 7. Other fields (denomination / address / etc) contains query
    if (o.includes(q)) return 100;

    return 10;
  };

  // Helper to normalize day string comparison (e.g. "Sun" matches "Sunday" / "Sun")
  const matchesDayName = (srvDay?: string, targetDay?: string) => {
    if (!srvDay || !targetDay) return false;
    if (targetDay === "all") return true;
    const s = srvDay.toLowerCase().trim();
    const t = targetDay.toLowerCase().trim();
    return s.startsWith(t) || t.startsWith(s);
  };

  // Helper to check if a service time matches time slot (Morning <12:00, Afternoon 12:00-17:00, Evening 17:00+, or specific time)
  const matchesTimeSlot = (startTime?: string | null, slot?: string) => {
    if (!slot || slot === "all") return true;
    if (!startTime || !startTime.trim()) return false; // Strict: if filtering by time, must have a start_time

    const str = startTime.trim();

    // Check 24-hour format "13:00", "13:00:00", "09:30"
    const match24 = str.match(/^(\d{1,2}):(\d{2})/);
    // Check 12-hour format "1:00 PM", "9:30 AM", "1pm"
    const match12 = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);

    let hour = -1;
    let minute = 0;

    if (match12) {
      hour = parseInt(match12[1], 10);
      minute = match12[2] ? parseInt(match12[2], 10) : 0;
      const meridian = match12[3].toLowerCase();
      if (meridian === "pm" && hour < 12) hour += 12;
      if (meridian === "am" && hour === 12) hour = 0;
    } else if (match24) {
      hour = parseInt(match24[1], 10);
      minute = parseInt(match24[2], 10);
    } else {
      const parsedNum = parseInt(str, 10);
      if (!isNaN(parsedNum)) hour = parsedNum;
    }

    if (hour === -1) return false;

    if (slot === "morning") return hour < 12;
    if (slot === "afternoon") return hour >= 12 && hour < 17;
    if (slot === "evening") return hour >= 17;

    // Custom filled time in slot (e.g. "10:30 AM", "10:30", "10 AM", "10am", "6pm", etc.)
    const trimmedSlot = slot.trim();
    const targetMatch12 = trimmedSlot.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    const targetMatch24 = trimmedSlot.match(/^(\d{1,2}):(\d{2})/);

    let targetHour = -1;
    let targetMinute = 0;

    if (targetMatch12) {
      targetHour = parseInt(targetMatch12[1], 10);
      targetMinute = targetMatch12[2] ? parseInt(targetMatch12[2], 10) : 0;
      const meridian = targetMatch12[3].toLowerCase();
      if (meridian === "pm" && targetHour < 12) targetHour += 12;
      if (meridian === "am" && targetHour === 12) targetHour = 0;
    } else if (targetMatch24) {
      targetHour = parseInt(targetMatch24[1], 10);
      targetMinute = parseInt(targetMatch24[2], 10);
    } else {
      const parsedNum = parseInt(trimmedSlot, 10);
      if (!isNaN(parsedNum) && parsedNum >= 0 && parsedNum <= 24) {
        targetHour = parsedNum;
      }
    }

    if (targetHour !== -1) {
      const srvMins = hour * 60 + minute;
      const targetMins = targetHour * 60 + targetMinute;
      return Math.abs(srvMins - targetMins) <= 60;
    }

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
      .filter((church) => {
        // When Near Me is active, only show churches within maxDistance radius
        if (userLocation) {
          return typeof church.distance === "number" && church.distance <= maxDistance;
        }
        return true;
      })
      .sort((a, b) => {
        // If user typed a search query and hasn't chosen an explicit name or nearby sort, rank by search relevance first
        if (searchQuery.trim() && sortBy === "latest") {
          const scoreA = getSearchRelevance(searchQuery, a.name, a.city, `${a.denomination} ${a.address_line} ${a.about}`);
          const scoreB = getSearchRelevance(searchQuery, b.name, b.city, `${b.denomination} ${b.address_line} ${b.about}`);
          if (scoreA !== scoreB) {
            return scoreB - scoreA; // Higher score first
          }
        }

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
        // latest (default fallback)
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
    maxDistance,
  ]);

  const filteredPastors = useMemo(() => {
    return pastorsData
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
      .filter((pastor) => {
        if (userLocation) {
          return typeof pastor.distance === "number" && pastor.distance <= maxDistance;
        }
        return true;
      })
      .sort((a, b) => {
        if (searchQuery.trim() && sortBy === "latest") {
          const scoreA = getSearchRelevance(searchQuery, a.full_name, a.city, `${a.title} ${a.church_name_cache} ${a.bio}`);
          const scoreB = getSearchRelevance(searchQuery, b.full_name, b.city, `${b.title} ${b.church_name_cache} ${b.bio}`);
          if (scoreA !== scoreB) return scoreB - scoreA;
        }
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
    pastorsData,
    searchQuery,
    selectedPastorNames,
    selectedCities,
    selectedPastorDenoms,
    selectedPastorMinistries,
    selectedPastorEducations,
    selectedPastorLanguages,
    sortBy,
    userLocation,
    maxDistance,
  ]);

  const filteredEvents = useMemo(() => {
    const now = new Date().getTime();
    return eventsData
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
      .filter((event) => {
        if (userLocation) {
          return typeof event.distance === "number" && event.distance <= maxDistance;
        }
        return true;
      })
      .sort((a, b) => {
        if (searchQuery.trim() && sortBy === "latest") {
          const scoreA = getSearchRelevance(searchQuery, a.title, a.city, `${a.venue_name} ${a.description}`);
          const scoreB = getSearchRelevance(searchQuery, b.title, b.city, `${b.venue_name} ${b.description}`);
          if (scoreA !== scoreB) return scoreB - scoreA;
        }
        if (sortBy === "name_asc") return a.title.localeCompare(b.title);
        if (sortBy === "name_desc") return b.title.localeCompare(a.title);
        if (sortBy === "nearby") {
          if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
          if (a.distance !== null) return -1;
          if (b.distance !== null) return 1;
        }
        return new Date(b.starts_at || b.created_at || 0).getTime() - new Date(a.starts_at || a.created_at || 0).getTime();
      });
  }, [eventsData, searchQuery, selectedCities, selectedEventTypes, selectedEventPrice, selectedEventTime, sortBy, userLocation, maxDistance]);

  const filteredWorshipLeaders = useMemo(() => {
    return worshipLeadersData
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
        if (searchQuery.trim() && sortBy === "latest") {
          const scoreA = getSearchRelevance(searchQuery, a.display_name, a.city, a.tagline);
          const scoreB = getSearchRelevance(searchQuery, b.display_name, b.city, b.tagline);
          if (scoreA !== scoreB) return scoreB - scoreA;
        }
        if (sortBy === "name_asc") return (a.display_name || "").localeCompare(b.display_name || "");
        if (sortBy === "name_desc") return (b.display_name || "").localeCompare(a.display_name || "");
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [worshipLeadersData, searchQuery, selectedCities, selectedWlStyles, selectedWlInstruments, selectedWlLanguages, selectedWlAvailabilities, sortBy]);

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
  const handleUseMyLocation = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) alert("Geolocation is not supported by your browser.");
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
        if (!silent) {
          alert("Could not access your location. Please check your browser permissions.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  };

  // Google Maps experience: Auto-detect location on initial page load if not already set
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation && !userLocation && !initialCity && !initialSearchQuery) {
      handleUseMyLocation(true);
    }
  }, []);


  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCities.length > 0 ||
    userLocation !== null ||
    (exploreType === "churches" && (
      selectedDenoms.length > 0 ||
      selectedLanguages.length > 0 ||
      selectedMinistries.length > 0 ||
      openingStatus !== "all"
    )) ||
    (exploreType === "events" && (
      selectedEventTypes.length > 0 ||
      selectedEventPrice !== "all" ||
      selectedEventTime !== "upcoming"
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
    setUserLocation(null);
    setIsLocating(false);
    setMaxDistance(30);
    setSortBy("latest");
    // Church filters
    setOpeningStatus("all");
    setCustomDay("Sun");
    setCustomTime("all");
    setSelectedDenoms([]);
    setSelectedLanguages([]);
    setSelectedWorshipStyles([]);
    setSelectedMinistries([]);
    // Event filters
    setSelectedEventTypes([]);
    setSelectedEventPrice("all");
    setSelectedEventTime("upcoming");
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

  const handleTabChange = (newType: "churches" | "pastors" | "events" | "worship_leaders") => {
    if (exploreType === newType) return;
    setExploreType(newType);
    clearAllFilters();
    setSelectedChurchId(null);
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
            onClick={() => handleTabChange("churches")}
            className={`explore-tab ${exploreType === "churches" ? "active" : ""}`}
          >
            <i className="ti ti-building-church" style={{ fontSize: "16px" }}></i> Churches
          </button>
          <button
            onClick={() => handleTabChange("pastors")}
            className={`explore-tab ${exploreType === "pastors" ? "active" : ""}`}
          >
            <i className="ti ti-user" style={{ fontSize: "16px" }}></i> Pastors
          </button>
          <button
            onClick={() => handleTabChange("worship_leaders")}
            className={`explore-tab ${exploreType === "worship_leaders" ? "active" : ""}`}
          >
            <i className="ti ti-microphone-2" style={{ fontSize: "16px" }}></i> Worship Leaders
          </button>
          <button
            onClick={() => handleTabChange("events")}
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
                {isTypingSearch ? (
                  <i className="ti ti-loader-2" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#7c3aed", fontSize: "16px", animation: "spin 1s linear infinite" }}></i>
                ) : (
                  <i className="ti ti-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "16px" }}></i>
                )}
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
                  onChange={(e) => {
                    const val = e.target.value;
                    setIsTypingSearch(true);
                    setSearchQuery(val);
                    setTimeout(() => setIsTypingSearch(false), 280);
                  }}
                  style={{ width: "100%", height: "44px", paddingLeft: "40px", paddingRight: "30px", borderRadius: "8px", border: isTypingSearch ? "1.5px solid #7c3aed" : "1.5px solid #e2e8f0", fontSize: "13.5px", transition: "all 0.15s" }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "14px" }}>✕</button>
                )}
              </div>

              {/* Location (Near Me) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  onClick={() => {
                    if (userLocation) {
                      setUserLocation(null);
                      if (sortBy === "nearby") setSortBy("latest");
                    } else {
                      handleUseMyLocation();
                    }
                  }}
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
                  {isLocating ? "Locating..." : userLocation ? `Near Me (within ${maxDistance} km) ✕` : "Near Me"}
                </button>

                {/* Distance Slider Bar */}
                {userLocation && (
                  <div
                    style={{
                      background: "#faf5ff",
                      border: "1px solid #e9d5ff",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#6b21a8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Distance Radius
                      </span>
                      <span style={{ fontSize: "12.5px", fontWeight: 800, color: "#7c3aed", background: "#ffffff", padding: "2px 8px", borderRadius: "12px", border: "1px solid #ddd6fe" }}>
                        {maxDistance} km
                      </span>
                    </div>

                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="5"
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(Number(e.target.value))}
                      style={{
                        width: "100%",
                        accentColor: "#7c3aed",
                        cursor: "pointer",
                        height: "5px",
                      }}
                    />

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9333ea", fontWeight: 600 }}>
                      <span>5 km</span>
                      <span>10 km</span>
                      <span>20 km</span>
                      <span>30 km</span>
                    </div>
                  </div>
                )}
              </div>

              {/* City Filter (Available for Churches, Events, and Worship Leaders tabs) */}
              {exploreType !== "pastors" && (
                <MultiSelectSearchFilter
                  label="Cities"
                  placeholder="Search city..."
                  options={cities}
                  selected={selectedCities}
                  onChange={setSelectedCities}
                  openOnlyOnSearch={true}
                />
              )}

              {/* CHURCH FILTERS */}
              {exploreType === "churches" && (
                <>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <h3 style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: 800, color: "#94a3b8", letterSpacing: "0.05em", margin: 0 }}>Opening Status</h3>
                      {openingStatus === "custom" && (
                        <span style={{ fontSize: "10px", fontWeight: 600, color: "#7c3aed" }}>
                          {customDay === "all" ? "Any Day" : customDay} • {customTime === "all" ? "Any Time" : customTime === "morning" ? "Morning" : customTime === "afternoon" ? "Afternoon" : customTime === "evening" ? "Evening" : customTime}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "8px", padding: "4px" }}>
                      {["all", "open_now", "custom"].map(status => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setOpeningStatus(status as any)}
                          style={{ flex: 1, padding: "8px 0", fontSize: "11px", fontWeight: 700, borderRadius: "6px", border: "none", background: openingStatus === status ? "#fff" : "transparent", color: openingStatus === status ? "#0f172a" : "#64748b", boxShadow: openingStatus === status ? "0 1px 3px rgba(0,0,0,0.1)" : "none", cursor: "pointer", transition: "all 0.15s ease" }}
                        >
                          {status === "all" ? "ALL" : status === "open_now" ? "OPEN NOW" : "CUSTOM"}
                        </button>
                      ))}
                    </div>

                    {/* Custom Day & Timing Controls */}
                    {openingStatus === "custom" && (
                      <div style={{
                        marginTop: "10px",
                        padding: "12px",
                        background: "#faf5ff",
                        borderRadius: "10px",
                        border: "1px solid #e9d5ff",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                      }}>
                        {/* Day selector */}
                        <div>
                          <span style={{ fontSize: "10px", fontWeight: 700, color: "#6b21a8", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                            Service Day
                          </span>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px" }}>
                            {[
                              { label: "Any", value: "all" },
                              { label: "Sun", value: "Sun" },
                              { label: "Wed", value: "Wed" },
                              { label: "Sat", value: "Sat" },
                              { label: "Mon", value: "Mon" },
                              { label: "Tue", value: "Tue" },
                              { label: "Thu", value: "Thu" },
                              { label: "Fri", value: "Fri" },
                            ].map(d => (
                              <button
                                key={d.value}
                                type="button"
                                onClick={() => setCustomDay(d.value)}
                                style={{
                                  padding: "6px 2px",
                                  fontSize: "11px",
                                  fontWeight: customDay === d.value ? 700 : 500,
                                  borderRadius: "6px",
                                  border: customDay === d.value ? "1.5px solid #7c3aed" : "1px solid #e2e8f0",
                                  background: customDay === d.value ? "#7c3aed" : "#fff",
                                  color: customDay === d.value ? "#fff" : "#475569",
                                  cursor: "pointer",
                                  textAlign: "center",
                                  transition: "all 0.15s ease"
                                }}
                              >
                                {d.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Time slot selector */}
                        <div>
                          <span style={{ fontSize: "10px", fontWeight: 700, color: "#6b21a8", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                            Service Time
                          </span>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                            {[
                              { label: "Any Time", value: "all", icon: "ti-clock" },
                              { label: "Morning (< 12 PM)", value: "morning", icon: "ti-sun" },
                              { label: "Afternoon (12 - 5 PM)", value: "afternoon", icon: "ti-sun-high" },
                              { label: "Evening (5 PM+)", value: "evening", icon: "ti-moon" }
                            ].map(t => (
                              <button
                                key={t.value}
                                type="button"
                                onClick={() => setCustomTime(t.value)}
                                style={{
                                  padding: "7px 6px",
                                  fontSize: "10.5px",
                                  fontWeight: customTime === t.value ? 700 : 500,
                                  borderRadius: "6px",
                                  border: customTime === t.value ? "1.5px solid #7c3aed" : "1px solid #e2e8f0",
                                  background: customTime === t.value ? "#7c3aed" : "#fff",
                                  color: customTime === t.value ? "#fff" : "#475569",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "4px",
                                  transition: "all 0.15s ease"
                                }}
                              >
                                <i className={`ti ${t.icon}`} style={{ fontSize: "12px" }}></i>
                                {t.label}
                              </button>
                            ))}
                          </div>

                          {/* Specific Time Input Box */}
                          <div style={{ marginTop: "8px" }}>
                            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                              <i className="ti ti-clock" style={{ position: "absolute", left: "10px", color: !["all", "morning", "afternoon", "evening"].includes(customTime) && customTime.trim() !== "" ? "#7c3aed" : "#94a3b8", fontSize: "14px", pointerEvents: "none" }}></i>
                              <input
                                type="text"
                                value={["all", "morning", "afternoon", "evening"].includes(customTime) ? "" : customTime}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCustomTime(val ? val : "all");
                                }}
                                placeholder="Fill time (e.g. 10:30 AM or 11:00)"
                                style={{
                                  width: "100%",
                                  padding: "8px 30px 8px 30px",
                                  fontSize: "11.5px",
                                  fontWeight: !["all", "morning", "afternoon", "evening"].includes(customTime) && customTime.trim() !== "" ? 600 : 400,
                                  borderRadius: "7px",
                                  border: !["all", "morning", "afternoon", "evening"].includes(customTime) && customTime.trim() !== "" ? "1.5px solid #7c3aed" : "1px solid #d1d5db",
                                  background: "#ffffff",
                                  color: "#0f172a",
                                  outline: "none",
                                  transition: "all 0.15s ease",
                                  boxShadow: !["all", "morning", "afternoon", "evening"].includes(customTime) && customTime.trim() !== "" ? "0 0 0 3px rgba(124, 58, 237, 0.1)" : "none"
                                }}
                              />
                              {!["all", "morning", "afternoon", "evening"].includes(customTime) && customTime.trim() !== "" && (
                                <button
                                  type="button"
                                  onClick={() => setCustomTime("all")}
                                  style={{
                                    position: "absolute",
                                    right: "8px",
                                    border: "none",
                                    background: "#f1f5f9",
                                    borderRadius: "50%",
                                    width: "18px",
                                    height: "18px",
                                    color: "#64748b",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: 0
                                  }}
                                  title="Clear filled time"
                                >
                                  <i className="ti ti-x" style={{ fontSize: "11px" }}></i>
                                </button>
                              )}
                            </div>
                            <span style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px", display: "block" }}>
                              Type any time (e.g. 9:30 AM, 11:00, 6:00 PM)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
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
                        { label: "UPCOMING", value: "upcoming" },
                        { label: "ALL", value: "all" },
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
                    openOnlyOnSearch={true}
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
                <span style={{ color: isTypingSearch ? "#f59e0b" : "#7c3aed", fontSize: "16px" }}>•</span>
                {isTypingSearch ? (
                  <span style={{ color: "#7c3aed", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite" }}></i> UPDATING RESULTS...
                  </span>
                ) : (
                  <>SHOWING {exploreType === "churches" ? filteredChurches.length : exploreType === "pastors" ? filteredPastors.length : exploreType === "events" ? filteredEvents.length : filteredWorshipLeaders.length} OF {exploreType === "churches" ? initialChurches.length : exploreType === "pastors" ? pastorsData.length : exploreType === "events" ? eventsData.length : worshipLeadersData.length} {exploreType === "worship_leaders" ? "WORSHIP LEADERS" : exploreType.toUpperCase()}</>
                )}
             </div>
           </div>

           {/* Cards Container */}
           <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", background: "#f8fafc" }}>
            {exploreType === "worship_leaders" && (
              isLoadingWorshipLeaders && worshipLeadersData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 20px", color: "#64748b" }}>
                  <i className="ti ti-loader-2" style={{ fontSize: "36px", color: "#7c3aed", animation: "spin 1s linear infinite", marginBottom: "12px", display: "inline-block" }}></i>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>Loading Worship Leaders...</h3>
                  <p style={{ fontSize: "12.5px", color: "#94a3b8" }}>Fetching verified worship leaders near you</p>
                </div>
              ) : filteredWorshipLeaders.length === 0 ? (
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
                  {userLocation ? (
                    <>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                        No churches within {maxDistance} km of your location
                      </h3>
                      <p style={{ fontSize: "13px", maxWidth: "280px", margin: "0 auto 16px auto", lineHeight: 1.4 }}>
                        We centered the map on your city. Try widening your radius or explore churches globally.
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "220px", margin: "0 auto" }}>
                        <button
                          onClick={() => {
                            setUserLocation(null);
                            if (sortBy === "nearby") setSortBy("latest");
                          }}
                          style={{
                            fontSize: "12.5px",
                            fontWeight: 700,
                            color: "#ffffff",
                            background: "#7c3aed",
                            border: "none",
                            padding: "9px 16px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)",
                          }}
                        >
                          Explore Worldwide
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>No churches match your filters</h3>
                      <p style={{ fontSize: "13px" }}>Try clearing some filters or searching with a broader keyword.</p>
                      <button onClick={clearAllFilters} style={{ marginTop: "12px", fontSize: "13px", fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #d8b4fe", padding: "8px 16px", borderRadius: "10px", cursor: "pointer" }}>Reset All Filters</button>
                    </>
                  )}
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
              isLoadingPastors && pastorsData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 20px", color: "#64748b" }}>
                  <i className="ti ti-loader-2" style={{ fontSize: "36px", color: "#7c3aed", animation: "spin 1s linear infinite", marginBottom: "12px", display: "inline-block" }}></i>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>Loading Pastors...</h3>
                  <p style={{ fontSize: "12.5px", color: "#94a3b8" }}>Fetching verified pastors & leaders</p>
                </div>
              ) : filteredPastors.length === 0 ? (
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
              isLoadingEvents && eventsData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 20px", color: "#64748b" }}>
                  <i className="ti ti-loader-2" style={{ fontSize: "36px", color: "#7c3aed", animation: "spin 1s linear infinite", marginBottom: "12px", display: "inline-block" }}></i>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>Loading Events...</h3>
                  <p style={{ fontSize: "12.5px", color: "#94a3b8" }}>Fetching upcoming church events & conferences</p>
                </div>
              ) : filteredEvents.length === 0 ? (
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
              userLocation={userLocation}
              maxDistance={maxDistance}
            />
          </div>
        )}

      </div>
    </div>
  );
}
