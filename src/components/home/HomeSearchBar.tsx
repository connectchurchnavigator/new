"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export type SearchCategory = "church" | "pastor" | "event" | "worshipleader";

interface SuggestionItem {
  id: string;
  name: string;
  subtext?: string;
  slug: string;
  city: string | null;
  denomination: string | null;
  thumb_url: string | null;
  is_verified?: boolean;
  category: string;
}

interface HomeSearchBarProps {
  keyword?: string;
  setKeyword?: (val: string) => void;
  city?: string;
  setCity?: (val: string) => void;
  denomination?: string;
  setDenomination?: (val: string) => void;
  category?: SearchCategory | "";
  setCategory?: (val: SearchCategory | "") => void;
  onSearch?: () => void;
}

const CATEGORY_META: Record<SearchCategory, { label: string; plural: string; icon: string; namePlaceholder: string; color: string; badgeBg: string }> = {
  church: {
    label: "Church",
    plural: "Churches",
    icon: "ti ti-building-church",
    namePlaceholder: "Church name or keyword...",
    color: "#7c3aed",
    badgeBg: "#ede9fe",
  },
  pastor: {
    label: "Pastor",
    plural: "Pastors",
    icon: "ti ti-user",
    namePlaceholder: "Pastor or minister name...",
    color: "#2563eb",
    badgeBg: "#dbeafe",
  },
  event: {
    label: "Event",
    plural: "Events",
    icon: "ti ti-calendar-event",
    namePlaceholder: "Event name or gathering...",
    color: "#e11d48",
    badgeBg: "#ffe4e6",
  },
  worshipleader: {
    label: "Worship Leader",
    plural: "Worship Leaders",
    icon: "ti ti-microphone",
    namePlaceholder: "Worship leader or artist...",
    color: "#059669",
    badgeBg: "#d1fae5",
  },
};

export default function HomeSearchBar(props: HomeSearchBarProps = {}) {
  const router = useRouter();
  const [internalCategory, setInternalCategory] = useState<SearchCategory | "">("church");
  const [internalKeyword, setInternalKeyword] = useState("");
  const [internalCity, setInternalCity] = useState("");
  const [internalDenom, setInternalDenom] = useState("all");
  const [isSearching, setIsSearching] = useState(false);

  // Auto-complete suggestion state
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCatMenu, setShowCatMenu] = useState(false);

  // Location suggestions state
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{ name: string; detail?: string }>>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const locationContainerRef = useRef<HTMLDivElement>(null);
  const catMenuRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = (props.category !== undefined && props.category !== "") ? props.category : (internalCategory || "church");
  const setSelectedCategory = props.setCategory || setInternalCategory;

  const keyword = props.keyword !== undefined ? props.keyword : internalKeyword;
  const setKeyword = props.setKeyword || setInternalKeyword;

  const city = props.city !== undefined ? props.city : internalCity;
  const setCity = props.setCity || setInternalCity;

  const denomination = props.denomination !== undefined ? props.denomination : internalDenom;
  const setDenomination = props.setDenomination || setInternalDenom;

  // Auto-focus name input when category is chosen
  useEffect(() => {
    if (selectedCategory && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
    }
  }, [selectedCategory]);

  // Debounce query to fetch suggestions according to chosen category
  useEffect(() => {
    const trimmed = keyword.trim();
    if (!selectedCategory || trimmed.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const res = await fetch(
          `/api/search/suggest?category=${encodeURIComponent(selectedCategory)}&q=${encodeURIComponent(trimmed)}&limit=6`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [keyword, selectedCategory]);

  // Debounce location query to fetch matching UK locations & cities
  useEffect(() => {
    const trimmed = city.trim();
    if (trimmed.length < 2) {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingLocations(true);
      try {
        // Check UK postcodes if pattern matches
        const cleanPc = trimmed.replace(/\s+/g, "");
        if (/^[A-Z]{1,2}\d/i.test(cleanPc)) {
          const pcRes = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPc)}/autocomplete`);
          if (pcRes.ok) {
            const pcData = await pcRes.json();
            if (Array.isArray(pcData.result) && pcData.result.length > 0) {
              setLocationSuggestions(
                pcData.result.slice(0, 5).map((pc: string) => ({ name: pc, detail: "UK Postcode" }))
              );
              setShowLocationDropdown(true);
              setIsLoadingLocations(false);
              return;
            }
          }
        }

        // Search places / cities via Nominatim
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&countrycodes=gb&addressdetails=1&limit=5`
        );
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          if (Array.isArray(nomData) && nomData.length > 0) {
            const places = nomData.map((item: any) => {
              const addr = item.address || {};
              const placeName = addr.city || addr.town || addr.village || addr.suburb || item.name;
              const detail = [addr.county || addr.state, addr.country].filter(Boolean).join(", ");
              return { name: placeName || item.display_name.split(",")[0], detail };
            });

            // De-duplicate places by name
            const unique = places.filter(
              (p, idx, self) => idx === self.findIndex((t) => t.name.toLowerCase() === p.name.toLowerCase())
            );
            setLocationSuggestions(unique.slice(0, 5));
            setShowLocationDropdown(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch location suggestions:", err);
      } finally {
        setIsLoadingLocations(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [city]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (locationContainerRef.current && !locationContainerRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) {
        setShowCatMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item: SuggestionItem) => {
    setShowDropdown(false);
    if (item.slug) {
      router.push(item.slug);
    } else {
      setKeyword(item.name);
      executeSearch(item.name);
    }
  };

  const executeSearch = (customKeyword?: string) => {
    if (props.onSearch) {
      props.onSearch();
    }
    setIsSearching(true);

    const activeCat = selectedCategory || "church";
    const typeParam =
      activeCat === "church"
        ? "churches"
        : activeCat === "pastor"
        ? "pastors"
        : activeCat === "event"
        ? "events"
        : "worship_leaders";

    const params = new URLSearchParams();
    params.set("type", typeParam);

    const term = customKeyword !== undefined ? customKeyword.trim() : keyword.trim();
    if (term) params.set("q", term);
    if (city.trim()) params.set("city", city.trim());
    if (activeCat !== "event" && denomination !== "all") {
      params.set("denomination", denomination);
    }

    router.push(`/explore?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    executeSearch();
  };

  const catMeta = CATEGORY_META[selectedCategory as SearchCategory] || CATEGORY_META.church;

  return (
    <form
      onSubmit={handleSearch}
      style={{
        background: "#ffffff",
        padding: "8px 12px",
        borderRadius: "24px",
        boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.35)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        maxWidth: "960px",
        margin: "0 auto",
        flexWrap: "nowrap",
        border: "1px solid rgba(255,255,255,0.2)",
        position: "relative",
      }}
    >
      {/* Category Pill with Dropdown Trigger */}
      <div ref={catMenuRef} style={{ position: "relative", flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => setShowCatMenu((prev) => !prev)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            background: catMeta.badgeBg,
            color: catMeta.color,
            padding: "8px 14px",
            borderRadius: "14px",
            fontSize: "13.5px",
            fontWeight: 800,
            border: "1px solid rgba(124, 58, 237, 0.15)",
            cursor: "pointer",
            transition: "all 0.15s ease",
            outline: "none",
          }}
        >
          <i className={catMeta.icon} style={{ fontSize: "15px" }} />
          <span>{catMeta.label}</span>
          <i className="ti ti-chevron-down" style={{ fontSize: "13px", marginLeft: "2px", opacity: 0.8 }} />
        </button>

        {/* Custom Category Dropdown Menu */}
        {showCatMenu && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              left: 0,
              minWidth: "220px",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 20px 40px -10px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.08)",
              zIndex: 99999,
              padding: "6px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              animation: "fadeIn 0.15s ease-out",
            }}
          >
            {(["church", "pastor", "event", "worshipleader"] as SearchCategory[]).map((catKey) => {
              const meta = CATEGORY_META[catKey];
              const isSelected = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(catKey);
                    setShowCatMenu(false);
                    setSuggestions([]);
                    setShowDropdown(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    border: "none",
                    background: isSelected ? meta.badgeBg : "transparent",
                    color: isSelected ? meta.color : "#334155",
                    fontSize: "13.5px",
                    fontWeight: isSelected ? 800 : 600,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <i className={meta.icon} style={{ fontSize: "16px", color: meta.color }} />
                  <span style={{ flex: 1 }}>{meta.plural}</span>
                  {isSelected && <i className="ti ti-check" style={{ fontSize: "14px", color: meta.color }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ width: "1px", height: "30px", background: "#e2e8f0", flexShrink: 0 }} />

      {/* Field 1: Name Input with Autocomplete Dropdown */}
      <div
        ref={searchContainerRef}
        style={{
          flex: "1 1 210px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 8px",
          position: "relative",
        }}
      >
        <i className="ti ti-search" style={{ fontSize: "17px", color: catMeta.color }}></i>
        <input
          ref={nameInputRef}
          type="text"
          className="clean-input"
          placeholder={catMeta.namePlaceholder}
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            if (e.target.value.trim().length >= 2) {
              setShowDropdown(true);
            }
          }}
          onFocus={() => {
            if (keyword.trim().length >= 2 && suggestions.length > 0) {
              setShowDropdown(true);
            }
          }}
          style={{
            border: "none",
            outline: "none",
            boxShadow: "none",
            width: "100%",
            fontSize: "14px",
            color: "#0f172a",
            padding: 0,
            background: "transparent",
          }}
        />

        {/* Live Dropdown Suggestions */}
        {showDropdown && keyword.trim().length >= 2 && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 14px)",
              left: 0,
              minWidth: "340px",
              width: "max(100%, 360px)",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(15, 23, 42, 0.12)",
              zIndex: 99999,
              overflow: "hidden",
              textAlign: "left",
              animation: "fadeIn 0.15s ease-out",
            }}
          >
            <div
              style={{
                padding: "10px 14px 6px",
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#94a3b8",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Matching {catMeta.plural}</span>
              {isLoadingSuggestions && (
                <i
                  className="ti ti-loader-2"
                  style={{ animation: "spin 1s linear infinite", fontSize: "13px", color: catMeta.color }}
                />
              )}
            </div>

            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              {isLoadingSuggestions && suggestions.length === 0 ? (
                <div style={{ padding: "20px 16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                  <i
                    className="ti ti-loader-2"
                    style={{
                      animation: "spin 1s linear infinite",
                      fontSize: "18px",
                      display: "inline-block",
                      marginBottom: "6px",
                      color: catMeta.color,
                    }}
                  />
                  <div>Searching {catMeta.plural.toLowerCase()}...</div>
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectSuggestion(item)}
                    style={{
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      transition: "background 0.15s",
                      borderBottom: "1px solid #f8fafc",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Thumbnail / Icon */}
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        background: catMeta.badgeBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        overflow: "hidden",
                      }}
                    >
                      {item.thumb_url ? (
                        <img
                          src={item.thumb_url}
                          alt={item.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <i className={catMeta.icon} style={{ fontSize: "19px", color: catMeta.color }}></i>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          style={{
                            fontSize: "13.5px",
                            fontWeight: 700,
                            color: "#0f172a",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.name}
                        </span>
                        {item.is_verified && (
                          <i
                            className="ti ti-circle-check-filled"
                            style={{ color: "#3b82f6", fontSize: "14px", flexShrink: 0 }}
                          />
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "2px",
                        }}
                      >
                        {item.city && (
                          <span>
                            <i className="ti ti-map-pin" style={{ fontSize: "11px", marginRight: "2px" }} />
                            {item.city}
                          </span>
                        )}
                        {item.denomination && (
                          <span
                            style={{
                              background: "#f1f5f9",
                              padding: "1px 6px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "#475569",
                            }}
                          >
                            {item.denomination}
                          </span>
                        )}
                        {item.subtext && !item.denomination && (
                          <span style={{ fontSize: "11px", color: "#64748b" }}>{item.subtext}</span>
                        )}
                      </div>
                    </div>

                    <i className="ti ti-chevron-right" style={{ color: "#cbd5e1", fontSize: "15px" }}></i>
                  </div>
                ))
              ) : (
                <div style={{ padding: "18px 14px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                  <p style={{ margin: 0, fontWeight: 500 }}>
                    No {catMeta.label.toLowerCase()} found matching &ldquo;{keyword}&rdquo;
                  </p>
                  <button
                    type="button"
                    onClick={handleSearch}
                    style={{
                      marginTop: "8px",
                      background: "none",
                      border: "none",
                      color: catMeta.color,
                      fontSize: "12.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Search in explore directory &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Footer option */}
            {suggestions.length > 0 && (
              <div
                onClick={handleSearch}
                style={{
                  padding: "10px 14px",
                  background: "#faf5ff",
                  borderTop: "1px solid #f3e8ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  color: "#7c3aed",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f3ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#faf5ff")}
              >
                <span>See all {catMeta.plural.toLowerCase()} for &ldquo;{keyword}&rdquo;</span>
                <i className="ti ti-arrow-right" style={{ fontSize: "13px" }}></i>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ width: "1px", height: "30px", background: "#e2e8f0", flexShrink: 0 }} className="hidden sm:block" />

      {/* Field 2: Location / Postcode Input with Auto-complete Dropdown */}
      <div
        ref={locationContainerRef}
        style={{
          flex: "1 1 170px",
          minWidth: "140px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 8px",
          position: "relative",
        }}
      >
        <i className="ti ti-map-pin" style={{ fontSize: "18px", color: "#e11d48", flexShrink: 0 }}></i>
        <input
          type="text"
          className="clean-input"
          placeholder="City or UK postcode..."
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            if (e.target.value.trim().length >= 2) {
              setShowLocationDropdown(true);
            }
          }}
          onFocus={() => {
            if (city.trim().length >= 2 && locationSuggestions.length > 0) {
              setShowLocationDropdown(true);
            }
          }}
          style={{
            border: "none",
            outline: "none",
            boxShadow: "none",
            width: "100%",
            fontSize: "14px",
            color: "#0f172a",
            padding: 0,
            background: "transparent",
          }}
        />

        {/* Live Location Dropdown Suggestions */}
        {showLocationDropdown && city.trim().length >= 2 && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 14px)",
              left: 0,
              minWidth: "260px",
              width: "max(100%, 280px)",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(15, 23, 42, 0.12)",
              zIndex: 99999,
              overflow: "hidden",
              textAlign: "left",
              animation: "fadeIn 0.15s ease-out",
            }}
          >
            <div
              style={{
                padding: "10px 14px 6px",
                fontSize: "11px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#94a3b8",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Matching Locations</span>
              {isLoadingLocations && (
                <i
                  className="ti ti-loader-2"
                  style={{ animation: "spin 1s linear infinite", fontSize: "13px", color: "#e11d48" }}
                />
              )}
            </div>

            <div style={{ maxHeight: "260px", overflowY: "auto" }}>
              {isLoadingLocations && locationSuggestions.length === 0 ? (
                <div style={{ padding: "16px 14px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                  <i
                    className="ti ti-loader-2"
                    style={{
                      animation: "spin 1s linear infinite",
                      fontSize: "17px",
                      display: "inline-block",
                      marginBottom: "4px",
                      color: "#e11d48",
                    }}
                  />
                  <div>Searching locations...</div>
                </div>
              ) : locationSuggestions.length > 0 ? (
                locationSuggestions.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    onClick={() => {
                      setCity(item.name);
                      setShowLocationDropdown(false);
                    }}
                    style={{
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      transition: "background 0.15s",
                      borderBottom: "1px solid #f8fafc",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fff1f2")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "8px",
                        background: "#ffe4e6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <i className="ti ti-map-pin" style={{ color: "#e11d48", fontSize: "15px" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13.5px",
                          fontWeight: 700,
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.name}
                      </div>
                      {item.detail && (
                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>
                          {item.detail}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: "14px", textAlign: "center", color: "#64748b", fontSize: "12.5px" }}>
                  No locations found for &ldquo;{city}&rdquo;
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Field 3: Denomination Select (EXCLUDED for Event only) */}
      {selectedCategory !== "event" && (
        <>
          <div style={{ width: "1px", height: "30px", background: "#e2e8f0", flexShrink: 0 }} className="hidden sm:block" />
          <div style={{ flex: "0 1 160px", minWidth: "130px", padding: "6px 8px" }}>
            <select
              value={denomination}
              onChange={(e) => setDenomination(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "13.5px",
                fontWeight: 600,
                color: "#334155",
                padding: 0,
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <option value="all">All Denominations</option>
              <option value="Anglican">Anglican</option>
              <option value="Baptist">Baptist</option>
              <option value="Catholic">Catholic</option>
              <option value="Methodist">Methodist</option>
              <option value="Non-Denominational">Non-Denominational</option>
              <option value="Orthodox">Orthodox</option>
              <option value="Pentecostal">Pentecostal</option>
              <option value="Presbyterian">Presbyterian</option>
            </select>
          </div>
        </>
      )}

      {/* Action Button: Renamed to "Search", strictly 1-line flex-shrink: 0 */}
      <button
        type="submit"
        disabled={isSearching}
        style={{
          background: "linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)",
          color: "#ffffff",
          border: "none",
          borderRadius: "14px",
          padding: "11px 24px",
          fontSize: "14px",
          fontWeight: 800,
          cursor: isSearching ? "not-allowed" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
          marginLeft: "auto",
          transition: "all 0.2s",
          boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)",
          whiteSpace: "nowrap",
          opacity: isSearching ? 0.85 : 1,
        }}
      >
        {isSearching ? (
          <>
            <i className="ti ti-loader-2" style={{ fontSize: "16px", animation: "spin 1s linear infinite" }}></i>
            Searching...
          </>
        ) : (
          <>
            <i className="ti ti-search" style={{ fontSize: "16px" }}></i>
            Search
          </>
        )}
      </button>

      {/* Immediate Full-Screen Search Transition Overlay */}
      {isSearching && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "rgba(13, 6, 34, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "slideUp 0.25s ease",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "36px 32px",
              maxWidth: "420px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.5)",
              border: "1px solid #ede9fe",
            }}
          >
            {/* Animated Icon */}
            <div
              style={{
                width: "68px",
                height: "68px",
                margin: "0 auto 20px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f43f5e, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.45)",
              }}
            >
              <i className="ti ti-search" style={{ fontSize: "32px", color: "#ffffff" }}></i>
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", marginBottom: "8px" }}>
              Searching {catMeta.plural}...
            </h3>
            <p style={{ fontSize: "13.5px", color: "#64748b", margin: "0 0 20px", lineHeight: 1.5 }}>
              {city.trim() || keyword.trim()
                ? `Finding ${[keyword.trim(), city.trim()].filter(Boolean).join(" in ")} across directory & map.`
                : `Loading verified ${catMeta.plural.toLowerCase()} and real-time listings...`}
            </p>

            {/* Spinner Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#f5f3ff",
                border: "1px solid #ddd6fe",
                padding: "8px 18px",
                borderRadius: "30px",
                color: "#7c3aed",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              <i className="ti ti-loader-2" style={{ fontSize: "16px", animation: "spin 1s linear infinite" }}></i>
              <span>Loading results...</span>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
