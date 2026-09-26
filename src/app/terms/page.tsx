import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import TopNav from "@/components/layout/TopNav";

export const metadata: Metadata = {
  title: "Terms of Service | ChurchNavigator",
  description: "Terms and conditions for using ChurchNavigator directory and services.",
};

export default function TermsOfServicePage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <TopNav />
      <main style={{ maxWidth: "860px", margin: "40px auto 80px", padding: "0 24px" }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: "24px", padding: "48px 40px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "inline-block", background: "#f3e8ff", color: "#7c3aed", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
            Terms & Conditions
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#0f172a", margin: "0 0 10px", lineHeight: 1.2 }}>
            Terms of Service
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 32px" }}>
            Last updated: September 25, 2026 • Effective Date: September 25, 2026
          </p>

          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "28px", color: "#334155", fontSize: "15px", lineHeight: 1.7 }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "24px", marginBottom: "12px" }}>
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using <strong>ChurchNavigator</strong> (&ldquo;the Platform&rdquo;) at <a href="https://churchnavigator.com" style={{ color: "#7c3aed" }}>https://churchnavigator.com</a>, you agree to be bound by these Terms of Service. If you do not agree to all terms, please refrain from using the platform.
            </p>

            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "32px", marginBottom: "12px" }}>
              2. User Accounts & Listing Submissions
            </h2>
            <p>
              You may register an account using email credentials or verified OAuth services (Google). When adding a church, pastor, worship leader, or event listing:
            </p>
            <ul style={{ paddingLeft: "24px", margin: "12px 0" }}>
              <li>You warrant that all submitted details (names, service times, addresses, ministry roles) are accurate and truthful.</li>
              <li>You agree not to post defamatory, offensive, misleading, or infringing content.</li>
              <li>We reserve the right to review, modify, or unpublish any listing that violates community standards or community guidelines.</li>
            </ul>

            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "32px", marginBottom: "12px" }}>
              3. Event Registrations & Contact Forms
            </h2>
            <p>
              ChurchNavigator serves as a directory and discovery platform. While we facilitate registrations and visitor inquiries, individual event hosts and ministries are responsible for their local schedules, entry requirements, and ministry activities.
            </p>

            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "32px", marginBottom: "12px" }}>
              4. Intellectual Property
            </h2>
            <p>
              The ChurchNavigator brand, visual assets, software, logos, and UI are protected by international copyright laws. All user-uploaded church logos, media, and pastor profiles remain the intellectual property of their respective owners.
            </p>

            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "32px", marginBottom: "12px" }}>
              5. Contact Information
            </h2>
            <p>
              For legal inquiries, contact: <a href="mailto:connect.churchnavigator@gmail.com" style={{ color: "#7c3aed", fontWeight: 700 }}>connect.churchnavigator@gmail.com</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
