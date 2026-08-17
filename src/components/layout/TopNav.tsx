"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import logoImg from "@/Assets/logo (1).png";
import { createClient } from "@/lib/supabase-browser";
import { User } from "@supabase/supabase-js";

export default function TopNav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Fetch logged in user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for auth state updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsDropdownOpen(false);
    router.push("/login");
  };

  // Compute initials or label
  const getUserDisplay = () => {
    if (!user) return { initial: "", label: "" };
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";
    const email = user.email || "";

    if (fullName.trim()) {
      const parts = fullName.trim().split(" ");
      const initial = parts[0][0].toUpperCase();
      return { initial, label: fullName };
    }
    if (email.trim()) {
      const initial = email.trim()[0].toUpperCase();
      return { initial, label: email };
    }
    return { initial: "U", label: "Account" };
  };

  const { initial, label } = getUserDisplay();

  return (
    <div className="topnav" style={{ position: "sticky", top: 0, zIndex: 1000, background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--cn-border, #ececf2)", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "58px", padding: "0 36px", width: "100%" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
          <Image src={logoImg} alt="ChurchNavigator Logo" width={175} height={42} style={{ objectFit: "contain" }} priority />
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "24px", flexShrink: 0 }}>
          <div className="nav-search" style={{ width: "360px", background: "var(--cn-surface, #f6f5fb)", borderRadius: "24px", padding: "8px 18px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid var(--cn-border, #ececf2)" }}>
            <i className="ti ti-search" style={{ fontSize: "16px", color: "var(--cn-gray-light, #6b7280)" }}></i>
            <input 
              placeholder="Search churches, cities, ministries..." 
              style={{ border: "none", background: "transparent", padding: 0, fontSize: "13.5px", outline: "none", width: "100%", color: "var(--cn-ink, #14142b)" }}
            />
          </div>

          <Link href="/explore" style={{ fontSize: "14px", fontWeight: 600, color: "var(--cn-ink, #14142b)", textDecoration: "none" }}>
            Explore
          </Link>

          <button 
            onClick={() => router.push("/add-listing")} 
            className="nav-cta"
            style={{ background: "var(--cn-purple, #7c3aed)", color: "#fff", border: "none", borderRadius: "12px", padding: "9px 22px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(124, 58, 237, 0.28)" }}
          >
            Add Listing
          </button>

          {/* User Account / Sign In Dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            {user ? (
              // SIGNED IN: User Initial / Avatar Pill
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#f3e8ff",
                  border: "1.5px solid #d8b4fe",
                  borderRadius: "24px",
                  padding: "4px 12px 4px 5px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s"
                }}
              >
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(124, 58, 237, 0.3)"
                }}>
                  {initial}
                </div>
                <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#5b21b6", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {label.split("@")[0]}
                </span>
                <i className="ti ti-chevron-down" style={{ fontSize: "13px", color: "#6b21a8" }}></i>
              </button>
            ) : (
              // NOT SIGNED IN: User Image Icon Button
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "var(--cn-surface, #f6f5fb)",
                  border: "1.5px solid var(--cn-border, #ececf2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#6b7280",
                  transition: "all 0.2s"
                }}
                title="Sign in or create account"
              >
                <i className="ti ti-user" style={{ fontSize: "19px" }}></i>
              </button>
            )}

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                width: "210px",
                background: "#ffffff",
                borderRadius: "16px",
                boxShadow: "0 20px 40px -15px rgba(0,0,0,0.18)",
                border: "1px solid #f1f5f9",
                padding: "8px",
                zIndex: 1010
              }}>
                {user ? (
                  <>
                    <div style={{ padding: "8px 12px", borderBottom: "1px solid #f1f5f9", marginBottom: "4px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {label}
                      </div>
                      {user.email && (
                        <div style={{ fontSize: "11px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {user.email}
                        </div>
                      )}
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 12px",
                        borderRadius: "10px",
                        fontSize: "13.5px",
                        fontWeight: 600,
                        color: "#334155",
                        textDecoration: "none"
                      }}
                    >
                      <i className="ti ti-layout-dashboard" style={{ fontSize: "16px", color: "#7c3aed" }}></i>
                      Dashboard
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setIsDropdownOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 12px",
                        borderRadius: "10px",
                        fontSize: "13.5px",
                        fontWeight: 600,
                        color: "#7c3aed",
                        textDecoration: "none",
                        background: "#faf5ff",
                      }}
                    >
                      <i className="ti ti-shield-lock" style={{ fontSize: "16px", color: "#7c3aed" }}></i>
                      Super Admin
                    </Link>
                    <button
                      onClick={handleSignOut}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 12px",
                        borderRadius: "10px",
                        fontSize: "13.5px",
                        fontWeight: 600,
                        color: "#ef4444",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textAlign: "left"
                      }}
                    >
                      <i className="ti ti-logout" style={{ fontSize: "16px" }}></i>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsDropdownOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        fontSize: "13.5px",
                        fontWeight: 700,
                        color: "#7c3aed",
                        textDecoration: "none",
                        background: "#f5f3ff",
                        marginBottom: "4px"
                      }}
                    >
                      <i className="ti ti-login" style={{ fontSize: "16px" }}></i>
                      Sign In
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setIsDropdownOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 12px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#475569",
                        textDecoration: "none"
                      }}
                    >
                      <i className="ti ti-user-plus" style={{ fontSize: "16px" }}></i>
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
