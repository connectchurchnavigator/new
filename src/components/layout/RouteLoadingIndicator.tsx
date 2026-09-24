"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [percent, setPercent] = useState(12);
  const [statusText, setStatusText] = useState("Waiting for network...");

  // Reset when navigation settles
  useEffect(() => {
    if (loading) {
      setPercent(100);
      setStatusText("Ready!");
      const t = setTimeout(() => {
        setLoading(false);
        setPercent(12);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (loading) {
      const messages = [
        "Waiting for network...",
        "Connecting to database...",
        "Retrieving records & details...",
        "Compiling content...",
        "Rendering page layout...",
      ];

      let currentStep = 0;
      interval = setInterval(() => {
        setPercent((prev) => {
          if (prev >= 95) return 95;
          const next = prev + Math.floor(Math.random() * 14) + 6;
          return next > 95 ? 95 : next;
        });

        currentStep++;
        if (currentStep < messages.length) {
          setStatusText(messages[currentStep]);
        }
      }, 260);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  useEffect(() => {
    // Intercept clicks on links or submit forms that navigate
    const handleNavigationStart = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (target && target.href && !target.target && target.origin === window.location.origin) {
        if (target.href !== window.location.href && !target.href.includes("#")) {
          setPercent(18);
          setStatusText("Waiting for network...");
          setLoading(true);
        }
      }
    };

    // Also support custom event window.dispatchEvent(new CustomEvent('cn:start-loading', { detail: '...' }))
    const handleCustomStart = (e: any) => {
      setPercent(15);
      setStatusText(e.detail || "Waiting for network...");
      setLoading(true);
    };

    const handleCustomStop = () => {
      setPercent(100);
      setTimeout(() => setLoading(false), 250);
    };

    window.addEventListener("cn:start-loading", handleCustomStart);
    window.addEventListener("cn:stop-loading", handleCustomStop);
    document.addEventListener("click", handleNavigationStart);

    return () => {
      window.removeEventListener("cn:start-loading", handleCustomStart);
      window.removeEventListener("cn:stop-loading", handleCustomStop);
      document.removeEventListener("click", handleNavigationStart);
    };
  }, []);

  if (!loading) return null;

  return (
    <>
      {/* Top progress bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          zIndex: 9999999,
          background: "rgba(226, 232, 240, 0.5)",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            background: "linear-gradient(90deg, #f43f5e, #7c3aed, #06b6d4)",
            transition: "width 0.25s ease-out",
            boxShadow: "0 0 14px rgba(124, 58, 237, 0.8)",
          }}
        />
      </div>

      {/* Floating Network & Percentage Pill */}
      <div
        style={{
          position: "fixed",
          top: "16px",
          right: "20px",
          zIndex: 9999999,
          background: "rgba(15, 23, 42, 0.92)",
          backdropFilter: "blur(12px)",
          color: "#ffffff",
          padding: "7px 14px",
          borderRadius: "30px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.12)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "12px",
          fontWeight: 700,
          pointerEvents: "none",
          animation: "cnFadeIn 0.2s ease-out",
        }}
      >
        {/* Spinner */}
        <span
          style={{
            display: "inline-block",
            width: "12px",
            height: "12px",
            border: "2px solid rgba(255,255,255,0.25)",
            borderTopColor: "#38bdf8",
            borderRadius: "50%",
            animation: "cnSpin 0.7s linear infinite",
          }}
        />

        {/* Status text */}
        <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>&lt;{statusText}&gt;</span>

        {/* Percentage badge */}
        <span
          style={{
            background: "linear-gradient(135deg, #f43f5e, #7c3aed)",
            padding: "2px 7px",
            borderRadius: "12px",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.02em",
          }}
        >
          {percent}%
        </span>
      </div>

      <style>{`
        @keyframes cnSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes cnFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

export default function RouteLoadingIndicator() {
  return (
    <Suspense fallback={null}>
      <ProgressContent />
    </Suspense>
  );
}
