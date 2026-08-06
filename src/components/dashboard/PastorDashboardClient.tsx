'use client';

import React from 'react';
import Link from 'next/link';
import TopNav from '@/components/layout/TopNav';

type Pastor = {
  id: string; slug: string; full_name: string; title: string | null;
  initials: string | null; avatar_url: string | null; city: string | null;
  is_published: boolean; is_verified: boolean;
  view_count: number | null; follower_count: number | null;
  bio: string | null; vision_statement: string | null;
};

export default function PastorDashboardClient({
  pastor,
}: {
  pastor: Pastor;
  enquiries?: any[];
  counts?: any;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <TopNav />

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "70px 20px", textAlign: "center" }}>
        <div style={{
          background: "#ffffff",
          borderRadius: "24px",
          padding: "54px 32px",
          boxShadow: "0 20px 40px -15px rgba(15,23,42,0.06)",
          border: "1px solid #e2e8f0",
          maxWidth: "600px",
          margin: "0 auto"
        }}>
          <div style={{
            width: "72px",
            height: "72px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.35)"
          }}>
            <i className="ti ti-layout-dashboard" style={{ fontSize: "36px", color: "#ffffff" }}></i>
          </div>

          <span style={{
            fontSize: "12px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#7c3aed",
            background: "#f3e8ff",
            padding: "5px 14px",
            borderRadius: "20px",
            display: "inline-block",
            marginBottom: "16px"
          }}>
            Pastor Portal
          </span>

          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "12px", letterSpacing: "-0.02em" }}>
            Dashboard — Coming Soon
          </h1>

          <p style={{ fontSize: "15px", color: "#64748b", lineHeight: "1.6", marginBottom: "32px", maxWidth: "460px", margin: "0 auto 32px" }}>
            Welcome, {pastor.full_name}! Your pastor dashboard is currently being upgraded with sermon management, analytics, and inquiry tracking.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            {pastor.slug && (
              <Link
                href={`/pastor/${pastor.slug}`}
                style={{
                  background: "var(--cn-purple, #7c3aed)",
                  color: "#ffffff",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "14px",
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(124, 58, 237, 0.28)"
                }}
              >
                View Public Profile
              </Link>
            )}
            <Link
              href="/"
              style={{
                background: "#f1f5f9",
                color: "#334155",
                padding: "12px 24px",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "14px",
                textDecoration: "none"
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
