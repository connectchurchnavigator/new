"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeSearchBar() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("");
  const [denomination, setDenomination] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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
        style={{
          background: "linear-gradient(135deg, #e11d48 0%, #7c3aed 100%)",
          color: "#ffffff",
          border: "none",
          borderRadius: "14px",
          padding: "12px 26px",
          fontSize: "14.5px",
          fontWeight: 800,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.2s",
          boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)",
          whiteSpace: "nowrap",
        }}
      >
        <i className="ti ti-map-2" style={{ fontSize: "17px" }}></i>
        Find on Map
      </button>
    </form>
  );
}
