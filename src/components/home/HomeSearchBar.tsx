"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

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

  const keyword = props.keyword !== undefined ? props.keyword : internalKeyword;
  const setKeyword = props.setKeyword || setInternalKeyword;

  const city = props.city !== undefined ? props.city : internalCity;
  const setCity = props.setCity || setInternalCity;

  const denomination = props.denomination !== undefined ? props.denomination : internalDenom;
  const setDenomination = props.setDenomination || setInternalDenom;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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
      }}
    >
      {/* Search Input */}
      <div style={{ flex: "1 1 240px", display: "flex", alignItems: "center", gap: "10px", padding: "6px 12px" }}>
        <i className="ti ti-search" style={{ fontSize: "18px", color: "var(--cn-purple, #7c3aed)" }}></i>
        <input
          type="text"
          placeholder="Church name or keyword..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
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
