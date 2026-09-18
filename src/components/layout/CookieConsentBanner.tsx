"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "church_navigator_cookie_consent";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    try {
      const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!saved) {
        // Subtle delay for a polished feel
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage may fail in restricted/private modes
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ choice: "all", timestamp: Date.now() }));
    } catch {}
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ choice: "essential_only", timestamp: Date.now() }));
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 40px)",
        maxWidth: "680px",
        background: "#ffffff",
        border: "1.5px solid #e2e8f0",
        borderRadius: "16px",
        boxShadow: "0 20px 35px -10px rgba(15, 23, 42, 0.18), 0 10px 15px -3px rgba(0, 0, 0, 0.08)",
        padding: "18px 22px",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        animation: "slideUpCookie 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        fontFamily: "inherit",
      }}
    >
      <style>{`
        @keyframes slideUpCookie {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "#f5f3ff",
            color: "#7c3aed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            flexShrink: 0,
          }}
        >
          <i className="ti ti-cookie"></i>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
            We respect your privacy
          </div>
          <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
            We use essential cookies and temporary local caching to speed up church navigation, map rendering, and preserve your preferences. We never sell your personal data.
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "10px",
          flexWrap: "wrap",
          borderTop: "1px solid #f1f5f9",
          paddingTop: "12px",
        }}
      >
        <button
          type="button"
          onClick={handleRejectNonEssential}
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#64748b",
            fontSize: "12.5px",
            fontWeight: 600,
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f1f5f9";
            e.currentTarget.style.color = "#334155";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f8fafc";
            e.currentTarget.style.color = "#64748b";
          }}
        >
          Essential Only
        </button>

        <button
          type="button"
          onClick={handleAcceptAll}
          style={{
            background: "#7c3aed",
            border: "none",
            color: "#ffffff",
            fontSize: "12.5px",
            fontWeight: 700,
            padding: "8px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#6d28d9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#7c3aed";
          }}
        >
          Accept All
        </button>
      </div>
    </div>
  );
}
