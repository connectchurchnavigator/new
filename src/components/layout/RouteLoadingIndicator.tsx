"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [percent, setPercent] = useState(30);

  // Reset immediately when navigation settles
  useEffect(() => {
    if (loading) {
      setPercent(100);
      const t = setTimeout(() => {
        setLoading(false);
        setPercent(30);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (loading) {
      interval = setInterval(() => {
        setPercent((prev) => (prev >= 90 ? 90 : prev + 15));
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  useEffect(() => {
    const handleNavigationStart = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (target && target.href && !target.target && target.origin === window.location.origin) {
        if (target.href !== window.location.href && !target.href.includes("#")) {
          setPercent(40);
          setLoading(true);
        }
      }
    };

    const handleCustomStart = () => {
      setPercent(30);
      setLoading(true);
    };

    const handleCustomStop = () => {
      setPercent(100);
      setTimeout(() => setLoading(false), 150);
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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        zIndex: 9999999,
        background: "transparent",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${percent}%`,
          background: "linear-gradient(90deg, #f43f5e, #7c3aed, #06b6d4)",
          transition: "width 0.2s ease-out",
          boxShadow: "0 0 10px rgba(124, 58, 237, 0.7)",
        }}
      />
    </div>
  );
}

export default function RouteLoadingIndicator() {
  return (
    <Suspense fallback={null}>
      <ProgressContent />
    </Suspense>
  );
}
