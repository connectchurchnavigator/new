"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When path or search parameters complete loading, finish the bar
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept clicks on links or submit forms that navigate
    const handleNavigationStart = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (target && target.href && !target.target && target.origin === window.location.origin) {
        if (target.href !== window.location.href) {
          setLoading(true);
        }
      }
    };

    document.addEventListener("click", handleNavigationStart);
    return () => {
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
        height: "3.5px",
        zIndex: 9999999,
        background: "transparent",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          background: "linear-gradient(90deg, #f43f5e, #7c3aed, #ec4899)",
          animation: "cnProgressBar 1.8s ease-in-out infinite",
          boxShadow: "0 0 10px rgba(124, 58, 237, 0.7)",
        }}
      />
      <style>{`
        @keyframes cnProgressBar {
          0% { width: 0%; transform: translateX(0); }
          50% { width: 75%; transform: translateX(20%); }
          100% { width: 100%; transform: translateX(100%); }
        }
      `}</style>
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
