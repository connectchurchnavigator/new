"use client";

import React, { useState, useEffect } from "react";

interface GuidedTourModalProps {
  onFinish: () => void;
  onNavigateTab?: (tab: string) => void;
}

interface TourStep {
  stepNum: number;
  title: string;
  badge: string;
  description: React.ReactNode;
  targetId: string;
  tab?: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    stepNum: 1,
    badge: "1/10 • Owner View & Preview Mode",
    title: "Owner View Mode",
    description: "Toggle between Owner View (editing mode) and Visitor Preview mode. Try clicking the toggle at top-right anytime!",
    targetId: "tour-owner-toggle",
    icon: "ti-toggle-right",
    iconBg: "#f3e8ff",
    iconColor: "#7e22ce"
  },
  {
    stepNum: 2,
    badge: "2/10 • Cover Photos & Logo",
    title: "Hero Banner & Logo",
    description: "Your cover banner and logo create the first impression. You can click 'Edit cover' live on the banner to test uploading high-res photos.",
    targetId: "tour-hero-banner",
    icon: "ti-photo",
    iconBg: "#fce7f3",
    iconColor: "#db2777"
  },
  {
    stepNum: 3,
    badge: "3/10 • Location & Navigation",
    title: "Location & Directions",
    description: "Displays your denomination, city/country location, and established year. Try clicking 'Get directions' to open turn-by-turn navigation.",
    targetId: "tour-hero-info",
    icon: "ti-map-pin",
    iconBg: "#e0f2fe",
    iconColor: "#0284c7"
  },
  {
    stepNum: 4,
    badge: "4/10 • Social Links & Stream",
    title: "Social Links & Live Stream",
    description: "Connect your Instagram, Facebook, YouTube, X, TikTok, and Telegram channels. Edits made in contact options reflect live here instantly.",
    targetId: "tour-hero-socials",
    icon: "ti-brand-youtube",
    iconBg: "#ffe4e6",
    iconColor: "#e11d48"
  },
  {
    stepNum: 5,
    badge: "5/10 • Visitor Engagement",
    title: "'Register My Visit' Feature",
    description: "First-time guests click this button to pre-register attendance. Try clicking 'Register my visit' live to test the 30-second signup modal!",
    targetId: "tour-visitor-banner",
    icon: "ti-user-plus",
    iconBg: "#dcfce7",
    iconColor: "#16a34a"
  },
  {
    stepNum: 6,
    badge: "6/10 • Profile Metrics",
    title: "Live Statistics Bar",
    description: "At-a-glance metrics showing your active Ministries, Languages offered, Worship Service times, Multi-Campus Branches, and Facilities.",
    targetId: "tour-stats-bar",
    icon: "ti-chart-bar",
    iconBg: "#fef3c7",
    iconColor: "#d97706"
  },
  {
    stepNum: 7,
    badge: "7/10 • Live Editing",
    title: "Inline Edit Controls",
    description: (
      <>
        <strong>(Active when Owner View is ON)</strong> Click the pencil icons to edit your About section, Ministries, Languages, Facilities, and Photo Gallery live.
      </>
    ),
    targetId: "tab-profile",
    tab: "profile",
    icon: "ti-pencil",
    iconBg: "#fae8ff",
    iconColor: "#c026d3"
  },
  {
    stepNum: 8,
    badge: "8/10 • Pastoral Leadership",
    title: "Add Leadership & Staff",
    description: (
      <>
        <strong>(Active when Owner View is ON)</strong> Under 'Our Team', click '+ Add a team' to introduce your pastors, elders, and ministry leaders.
      </>
    ),
    targetId: "tour-add-team-btn",
    tab: "team",
    icon: "ti-users",
    iconBg: "#e0f2fe",
    iconColor: "#0369a1"
  },
  {
    stepNum: 9,
    badge: "9/10 • Multi-Campus Setup",
    title: "Add Church Branches",
    description: (
      <>
        <strong>(Active when Owner View is ON)</strong> If your church has multiple locations or campuses, click '+ Add a branch' to list all campus addresses and directions in one place.
      </>
    ),
    targetId: "tour-add-branch-btn",
    tab: "branches",
    icon: "ti-git-fork",
    iconBg: "#f5d0fe",
    iconColor: "#a21caf"
  },
  {
    stepNum: 10,
    badge: "10/10 • Contact & Socials",
    title: "Edit Contact & Social Media",
    description: (
      <>
        <strong>(Active when Owner View is ON)</strong> To edit your address, phone, email, and social media links (Instagram, Facebook, YouTube, X, TikTok, Telegram), click the pencil icon here.
      </>
    ),
    targetId: "tour-sidebar-contact",
    tab: "profile",
    icon: "ti-address-book",
    iconBg: "#ccfbf1",
    iconColor: "#0d9488"
  }
];

export default function GuidedTourModal({ onFinish, onNavigateTab }: GuidedTourModalProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const currentStep = TOUR_STEPS[stepIndex];
  const totalSteps = TOUR_STEPS.length;

  useEffect(() => {
    if (currentStep.tab && onNavigateTab) {
      onNavigateTab(currentStep.tab);
    }

    const initialEl = document.getElementById(currentStep.targetId);
    if (initialEl) {
      initialEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    let animationFrameId: number;

    const updateTargetPosition = () => {
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect((prev) => {
          if (
            prev &&
            Math.abs(prev.top - rect.top) < 0.5 &&
            Math.abs(prev.left - rect.left) < 0.5 &&
            Math.abs(prev.width - rect.width) < 0.5 &&
            Math.abs(prev.height - rect.height) < 0.5
          ) {
            return prev;
          }
          return {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          };
        });
      } else {
        setTargetRect(null);
      }
      animationFrameId = requestAnimationFrame(updateTargetPosition);
    };

    animationFrameId = requestAnimationFrame(updateTargetPosition);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [stepIndex, currentStep, onNavigateTab]);

  const handleNext = () => {
    if (stepIndex < totalSteps - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: "none" }}>
      
      {/* Subtle Pulsing Highlight Box around Target Element — Completely non-blocking */}
      {targetRect && (
        <div
          style={{
            position: "fixed",
            top: `${targetRect.top - 8}px`,
            left: `${targetRect.left - 8}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
            borderRadius: "16px",
            border: "2px dashed #a855f7",
            boxShadow: "0 0 0 4px rgba(168, 85, 247, 0.25), 0 0 20px rgba(168, 85, 247, 0.3)",
            pointerEvents: "none",
            transition: "top 0.15s ease, left 0.15s ease, width 0.15s ease, height 0.15s ease",
            zIndex: 100000,
            animation: "pulse 2s infinite"
          }}
        />
      )}

      {/* Floating Guided Tour Card — Interactive on the card, page stays 100% interactive & unblurred */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          maxWidth: "460px",
          width: "calc(100vw - 60px)",
          background: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 20px 50px -10px rgba(124, 58, 237, 0.28), 0 0 0 1px rgba(168, 85, 247, 0.25)",
          padding: "24px 28px",
          zIndex: 100001,
          pointerEvents: "auto",
          animation: "slideUp 0.3s ease-out"
        }}
      >
        {/* Progress Bar */}
        <div style={{ height: "5px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden", marginBottom: "16px" }}>
          <div style={{
            height: "100%",
            width: `${((stepIndex + 1) / totalSteps) * 100}%`,
            background: "linear-gradient(90deg, #7c3aed, #ec4899)",
            transition: "width 0.4s ease"
          }} />
        </div>

        {/* Header Badge & Close Button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 800, color: currentStep.iconColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {currentStep.badge}
          </div>
          <button
            onClick={onFinish}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748b"
            }}
            title="Close Assistant"
          >
            <i className="ti ti-x" style={{ fontSize: "14px" }}></i>
          </button>
        </div>

        {/* Main Content Body */}
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "14px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "16px",
            background: currentStep.iconBg,
            color: currentStep.iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <i className={`ti ${currentStep.icon}`} style={{ fontSize: "24px" }}></i>
          </div>
          <div>
            <h3 style={{ fontSize: "19px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0", letterSpacing: "-0.01em" }}>
              {currentStep.title}
            </h3>
            <p style={{ fontSize: "13.5px", color: "#475569", lineHeight: "1.55", margin: 0 }}>
              {currentStep.description}
            </p>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
          <button
            onClick={onFinish}
            style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
          >
            Close assistant
          </button>

          <div style={{ display: "flex", gap: "8px" }}>
            {stepIndex > 0 && (
              <button
                onClick={handlePrev}
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  borderRadius: "10px",
                  padding: "8px 15px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              style={{
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              {stepIndex < totalSteps - 1 ? "Next step" : "Finish tour"} <i className="ti ti-arrow-right" style={{ fontSize: "14px" }}></i>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
