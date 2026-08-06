"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import logoImg from "@/Assets/logo (1).png";

export default function TopNav() {
  const router = useRouter();

  return (
    <div className="topnav" style={{ position: "sticky", top: 0, zIndex: 1000, background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--cn-border, #ececf2)", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "58px", padding: "0 36px", width: "100%" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
          <Image src={logoImg} alt="ChurchNavigator Logo" width={175} height={42} style={{ objectFit: "contain" }} priority />
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "28px", flexShrink: 0 }}>
          <div className="nav-search" style={{ width: "360px", background: "var(--cn-surface, #f6f5fb)", borderRadius: "24px", padding: "8px 18px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid var(--cn-border, #ececf2)" }}>
            <i className="ti ti-search" style={{ fontSize: "16px", color: "var(--cn-gray-light, #6b7280)" }}></i>
            <input 
              placeholder="Search churches, cities, ministries..." 
              style={{ border: "none", background: "transparent", padding: 0, fontSize: "13.5px", outline: "none", width: "100%", color: "var(--cn-ink, #14142b)" }}
            />
          </div>

          <Link href="/" style={{ fontSize: "14px", fontWeight: 600, color: "var(--cn-ink, #14142b)", textDecoration: "none" }}>
            Explore
          </Link>

          <button 
            onClick={() => router.push("/add-listing")} 
            className="nav-cta"
            style={{ background: "var(--cn-purple, #7c3aed)", color: "#fff", border: "none", borderRadius: "12px", padding: "9px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(124, 58, 237, 0.28)" }}
          >
            Add Listing
          </button>
        </div>
      </div>
    </div>
  );
}
