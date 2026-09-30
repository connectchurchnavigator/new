"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import logoImg from "@/Assets/logo (1).png";
import { createClient } from "@/lib/supabase-browser";
import { User } from "@supabase/supabase-js";

function TopNavContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerBtnRef = useRef<HTMLButtonElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Sync TopNav input with active ?q= search param and reset loading spinner
  useEffect(() => {
    setIsSearching(false);
    setIsMobileMenuOpen(false);
    if (pathname === "/explore") {
      const q = searchParams?.get("q") || "";
      setSearchQuery(q);
    }
  }, [pathname, searchParams]);

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

  // Close dropdown or mobile menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
      if (
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(target) &&
        hamburgerBtnRef.current &&
        !hamburgerBtnRef.current.contains(target)
      ) {
        setIsMobileMenuOpen(false);
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

  const isTeamMember = !!(user?.user_metadata?.is_team_member || user?.user_metadata?.team_role);
  const isSuperAdmin = !isTeamMember && !!(
    user?.user_metadata?.role === "super_admin" ||
    user?.app_metadata?.role === "super_admin" ||
    (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
      .includes(user?.email?.toLowerCase() || "")
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const params = new URLSearchParams();
    params.set("q", searchQuery.trim());
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="topnav" style={{ position: "sticky", top: 0, zIndex: 1000, background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--cn-border, #ececf2)", width: "100%", padding: 0 }}>
      <style>{`
        .topnav-logo img {
          height: 42px !important;
          width: auto !important;
        }
        @media (max-width: 768px) {
          .topnav-search-desktop { display: none !important; }
          .topnav-explore-link { display: none !important; }
          .topnav-add-btn { display: none !important; }
          .topnav-user-desktop { display: none !important; }
          .topnav-hamburger-btn { display: flex !important; }
          .topnav-logo img {
            height: 36px !important;
            width: auto !important;
          }
          .topnav-mobile-drawer {
            position: absolute !important;
            top: calc(100% + 8px) !important;
            right: 16px !important;
            width: 270px !important;
            max-width: calc(100vw - 32px) !important;
            border-radius: 18px !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.04) !important;
            padding: 12px !important;
            background: #ffffff !important;
          }
        }
        @media (min-width: 769px) {
          .topnav-hamburger-btn { display: none !important; }
          .topnav-mobile-drawer { display: none !important; }
        }
      `}</style>
      <div className="topnav-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px", padding: "0 24px", width: "100%", maxWidth: "1280px", margin: "0 auto" }}>
        <Link href="/" className="topnav-logo" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
          <Image src={logoImg} alt="ChurchNavigator Logo" width={200} height={48} style={{ objectFit: "contain", width: "auto", height: "42px" }} priority />
        </Link>

        <div className="topnav-actions" style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
          <form 
            onSubmit={handleSearch}
            className="nav-search topnav-search-desktop" 
            style={{
              width: "320px",
              background: "#f8fafc",
              borderRadius: "20px",
              padding: "7px 16px",
              display: "flex",
              alignItems: "center",
              gap: "9px",
              border: isSearching ? "1.5px solid #7c3aed" : "1px solid #e2e8f0",
              transition: "all 0.2s",
            }}
          >
            {isSearching ? (
              <i className="ti ti-loader-2" style={{ fontSize: "15px", color: "#7c3aed", animation: "spin 1s linear infinite", flexShrink: 0 }}></i>
            ) : (
              <i className="ti ti-search" style={{ fontSize: "15px", color: "#94a3b8", flexShrink: 0 }}></i>
            )}
            <input 
              className="clean-input"
              placeholder={isSearching ? "Searching..." : "Search churches, cities, ministries..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                boxShadow: "none",
                padding: 0,
                fontSize: "13.5px",
                width: "100%",
                color: "#0f172a",
              }}
            />
          </form>

          <Link href="/explore" className="topnav-explore-link" style={{ fontSize: "14px", fontWeight: 600, color: "var(--cn-ink, #14142b)", textDecoration: "none" }}>
            Explore
          </Link>

          <button 
            onClick={() => router.push("/add-listing")} 
            className="nav-cta topnav-add-btn"
            style={{ background: "var(--cn-purple, #7c3aed)", color: "#fff", border: "none", borderRadius: "12px", padding: "8px 18px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(124, 58, 237, 0.28)", whiteSpace: "nowrap" }}
          >
            <span>+ Add Listing</span>
          </button>

          {/* Desktop User Account / Sign In Dropdown */}
          <div ref={dropdownRef} className="topnav-user-desktop" style={{ position: "relative" }}>
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
                      href="/dashboard?tab=my-profile"
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
                      <i className="ti ti-user" style={{ fontSize: "16px", color: "#7c3aed" }}></i>
                      My Profile
                    </Link>
                    {isSuperAdmin && (
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
                    )}
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

          {/* Mobile Hamburger Toggle Button */}
          <button
            ref={hamburgerBtnRef}
            type="button"
            className="topnav-hamburger-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            style={{
              width: "36px",
              height: "36px",
              background: "transparent",
              border: "none",
              outline: "none",
              color: isMobileMenuOpen ? "#7c3aed" : "#1e293b",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              transition: "color 0.15s ease"
            }}
          >
            <i className={isMobileMenuOpen ? "ti ti-x" : "ti ti-menu-2"} style={{ fontSize: "27px", strokeWidth: "2" }}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="topnav-mobile-drawer"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: "16px",
            width: "250px",
            maxWidth: "calc(100vw - 32px)",
            background: "#ffffff",
            borderRadius: "18px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.04)",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            zIndex: 99999,
            animation: "fadeInDown 0.18s ease-out",
          }}
        >
          {/* Mobile Menu Links: Home, Explore, Add Listing */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "12px",
                fontSize: "14.5px",
                fontWeight: 700,
                color: "#1e293b",
                textDecoration: "none",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <i className="ti ti-home" style={{ fontSize: "18px", color: "#7c3aed" }}></i>
              Home
            </Link>

            <Link
              href="/explore"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "12px",
                fontSize: "14.5px",
                fontWeight: 700,
                color: "#1e293b",
                textDecoration: "none",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <i className="ti ti-compass" style={{ fontSize: "18px", color: "#7c3aed" }}></i>
              Explore
            </Link>

            <Link
              href="/add-listing"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "11px 16px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 700,
                color: "#ffffff",
                textDecoration: "none",
                background: "linear-gradient(135deg, #7c3aed, #9333ea)",
                boxShadow: "0 4px 14px rgba(124, 58, 237, 0.28)",
                marginTop: "4px",
                marginBottom: "4px",
              }}
            >
              <i className="ti ti-plus" style={{ fontSize: "16px" }}></i>
              Add Listing
            </Link>
          </div>

          {/* Mobile User Profile Section */}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {user ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 8px 10px" }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    {initial}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f172a" }}>{label}</div>
                    {user.email && <div style={{ fontSize: "11.5px", color: "#64748b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{user.email}</div>}
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#334155",
                    textDecoration: "none"
                  }}
                >
                  <i className="ti ti-layout-dashboard" style={{ fontSize: "17px", color: "#7c3aed" }}></i>
                  Dashboard
                </Link>

                <Link
                  href="/dashboard?tab=my-profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#334155",
                    textDecoration: "none"
                  }}
                >
                  <i className="ti ti-user" style={{ fontSize: "17px", color: "#7c3aed" }}></i>
                  My Profile
                </Link>

                {isSuperAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#7c3aed",
                      textDecoration: "none",
                      background: "#faf5ff"
                    }}
                  >
                    <i className="ti ti-shield-lock" style={{ fontSize: "17px", color: "#7c3aed" }}></i>
                    Super Admin
                  </Link>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#ef4444",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left"
                  }}
                >
                  <i className="ti ti-logout" style={{ fontSize: "17px" }}></i>
                  Sign Out
                </button>
              </>
            ) : (
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "10px",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    fontWeight: 700,
                    color: "#7c3aed",
                    textDecoration: "none",
                    background: "#f5f3ff",
                    border: "1.5px solid #d8b4fe"
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "10px",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    fontWeight: 700,
                    color: "#334155",
                    textDecoration: "none",
                    background: "#f1f5f9"
                  }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TopNav() {
  return (
    <Suspense
      fallback={
        <div className="topnav" style={{ position: "sticky", top: 0, zIndex: 1000, background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--cn-border, #ececf2)", width: "100%", height: "58px" }}>
          <div className="topnav-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "58px", padding: "0 24px", width: "100%", maxWidth: "1280px", margin: "0 auto" }}>
            <Link href="/" className="topnav-logo" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <Image src={logoImg} alt="ChurchNavigator Logo" width={160} height={38} style={{ objectFit: "contain", width: "auto", height: "34px" }} priority />
            </Link>
          </div>
        </div>
      }
    >
      <TopNavContent />
    </Suspense>
  );
}
