"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ChurchSuggestion {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  postcode: string | null;
  denomination: string | null;
  logo_url: string | null;
  cover_url: string | null;
  is_verified?: boolean;
}

interface HomeSearchBarProps {
  keyword?: string;
  setKeyword?: (val: string) => void;
  city?: string;
  setCity?: (val: string) => void;
  denomination?: string;
  setDenomination?: (val: string) => void;
  onSearch?: () => void;
}

export default function HomeSearchBar(props: HomeSearchBarProps = {}) {
  const router = useRouter();
  const [internalKeyword, setInternalKeyword] = useState("");
  const [internalCity, setInternalCity] = useState("");
  const [internalDenom, setInternalDenom] = useState("all");
  const [isSearching, setIsSearching] = useState(false);

  // Auto-complete suggestion state
  const [suggestions, setSuggestions] = useState<ChurchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const keyword = props.keyword !== undefined ? props.keyword : internalKeyword;
  const setKeyword = props.setKeyword || setInternalKeyword;

  const city = props.city !== undefined ? props.city : internalCity;
  const setCity = props.setCity || setInternalCity;

  const denomination = props.denomination !== undefined ? props.denomination : internalDenom;
  const setDenomination = props.setDenomination || setInternalDenom;

  // Debounce query to fetch matching churches
  useEffect(() => {
    const trimmed = keyword.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const res = await fetch(`/api/churches/search?q=${encodeURIComponent(trimmed)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Failed to fetch church suggestions:", err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [keyword]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectChurch = (church: ChurchSuggestion) => {
    setShowDropdown(false);
    if (church.slug) {
      router.push(`/church/${church.slug}`);
    } else {
      setKeyword(church.name);
      router.push(`/explore?q=${encodeURIComponent(church.name)}`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (props.onSearch) {
      props.onSearch();
    }
    setIsSearching(true);
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (city.trim()) params.set("city", city.trim());
    if (denomination !== "all") params.set("denomination", denomination);
    
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      style={{
        background: "#ffffff",
        padding: "10px 14px",
        borderRadius: "20px",
        boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.35)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        maxWidth: "880px",
        margin: "0 auto",
        flexWrap: "wrap",
        border: "1px solid rgba(255,255,255,0.2)",
        position: "relative",
      }}
    >
      {/* Search Input with Autocomplete Dropdown */}
      <div
        ref={searchContainerRef}
        style={{
          flex: "1 1 240px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "6px 12px",
          position: "relative",
        }}
      >
        <i className="ti ti-search" style={{ fontSize: "18px", color: "var(--cn-purple, #7c3aed)" }}></i>
        <input
          type="text"
          placeholder="Church name or keyword..."
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
            width: "100%",
            fontSize: "14px",
            color: "#0f172a",
            padding: 0,
            background: "transparent",
          }}
        />

        {/* Live Dropdown Results */}
        {showDropdown && (keyword.trim().length >= 2) && (
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
            <div style={{
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
            }}>
              <span>Matching Churches</span>
              {isLoadingSuggestions && (
                <i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite", fontSize: "13px", color: "#7c3aed" }} />
              )}
            </div>

            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              {isLoadingSuggestions && suggestions.length === 0 ? (
                <div style={{ padding: "20px 16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                  <i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite", fontSize: "18px", display: "inline-block", marginBottom: "6px", color: "#7c3aed" }} />
                  <div>Searching churches...</div>
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((church) => {
                  const thumb = church.logo_url || church.cover_url;
                  return (
                    <div
                      key={church.id}
                      onClick={() => handleSelectChurch(church)}
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
                      {/* Avatar / Thumbnail */}
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "10px",
                          background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={church.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <i className="ti ti-building-church" style={{ fontSize: "19px", color: "#7c3aed" }}></i>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{
                            fontSize: "13.5px",
                            fontWeight: 700,
                            color: "#0f172a",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}>
                            {church.name}
                          </span>
                          {church.is_verified && (
                            <i className="ti ti-circle-check-filled" style={{ color: "#3b82f6", fontSize: "14px", flexShrink: 0 }}></i>
                          )}
                        </div>
                        <div style={{
                          fontSize: "12px",
                          color: "#64748b",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "2px",
                        }}>
                          {church.city && (
                            <span>
                              <i className="ti ti-map-pin" style={{ fontSize: "11px", marginRight: "2px" }} />
                              {church.city}
                            </span>
                          )}
                          {church.denomination && (
                            <span style={{
                              background: "#f1f5f9",
                              padding: "1px 6px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "#475569",
                            }}>
                              {church.denomination}
                            </span>
                          )}
                        </div>
                      </div>

                      <i className="ti ti-chevron-right" style={{ color: "#cbd5e1", fontSize: "15px" }}></i>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: "18px 14px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
                  <p style={{ margin: 0, fontWeight: 500 }}>No church found matching &ldquo;{keyword}&rdquo;</p>
                  <button
                    type="button"
                    onClick={handleSearch}
                    style={{
                      marginTop: "8px",
                      background: "none",
                      border: "none",
                      color: "#7c3aed",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Search on map anyway &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Footer option: View all results */}
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
                <span>See all results on map for &ldquo;{keyword}&rdquo;</span>
                <i className="ti ti-arrow-right" style={{ fontSize: "13px" }}></i>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ width: "1px", height: "30px", background: "#e2e8f0" }} className="hidden sm:block" />

      {/* Location / Postcode Input */}
      <div style={{ flex: "1 1 200px", display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px" }}>
        <i className="ti ti-map-pin" style={{ fontSize: "18px", color: "#e11d48" }}></i>
        <input
          type="text"
          placeholder="City or UK postcode..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{
            border: "none",
            outline: "none",
            width: "100%",
            fontSize: "14px",
            color: "#0f172a",
            padding: 0,
            background: "transparent",
          }}
        />
      </div>

      <div style={{ width: "1px", height: "30px", background: "#e2e8f0" }} className="hidden sm:block" />

      {/* Denomination Select */}
      <div style={{ flex: "0 1 180px", padding: "6px 12px" }}>
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
          <option value="Pentecostal">Pentecostal</option>
          <option value="Baptist">Baptist</option>
          <option value="Catholic">Catholic</option>
          <option value="Anglican">Anglican</option>
          <option value="Non-Denominational">Non-Denominational</option>
          <option value="Methodist">Methodist</option>
          <option value="Orthodox">Orthodox</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSearching}
        style={{
          background: "linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)",
          color: "#ffffff",
          border: "none",
          borderRadius: "14px",
          padding: "12px 26px",
          fontSize: "14.5px",
          fontWeight: 800,
          cursor: isSearching ? "not-allowed" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.2s",
          boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)",
          whiteSpace: "nowrap",
          opacity: isSearching ? 0.85 : 1,
        }}
      >
        {isSearching ? (
          <>
            <i className="ti ti-loader-2" style={{ fontSize: "17px", animation: "spin 1s linear infinite" }}></i>
            Opening Map...
          </>
        ) : (
          <>
            <i className="ti ti-map-2" style={{ fontSize: "17px" }}></i>
            Find on Map
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
            {/* Animated Pin and Ripple */}
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
                position: "relative",
              }}
            >
              <i className="ti ti-map-2" style={{ fontSize: "32px", color: "#ffffff" }}></i>
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", marginBottom: "8px" }}>
              Locating Churches On Map...
            </h3>
            <p style={{ fontSize: "13.5px", color: "#64748b", margin: "0 0 20px", lineHeight: 1.5 }}>
              {city.trim() || keyword.trim()
                ? `Searching ${[keyword.trim(), city.trim()].filter(Boolean).join(" in ")} across interactive map & directory.`
                : "Loading interactive map, verified churches, and active service times..."}
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
              <span>Opening Map View...</span>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
