import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import TopNav from "@/components/layout/TopNav";

export const metadata: Metadata = {
  title: "Privacy Policy | ChurchNavigator",
  description: "Learn how ChurchNavigator collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <TopNav />
      <main style={{ maxWidth: "860px", margin: "40px auto 80px", padding: "0 24px" }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: "24px", padding: "48px 40px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "inline-block", background: "#f3e8ff", color: "#7c3aed", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>
            Legal Documentation
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#0f172a", margin: "0 0 10px", lineHeight: 1.2 }}>
            Privacy Policy
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 32px" }}>
            Last updated: September 25, 2026 • Effective Date: September 25, 2026
          </p>

          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "28px", color: "#334155", fontSize: "15px", lineHeight: 1.7 }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "24px", marginBottom: "12px" }}>
              1. Introduction
            </h2>
            <p>
              Welcome to <strong>ChurchNavigator</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). We are dedicated to respecting your privacy and protecting the personal data of our visitors, churches, pastors, worship leaders, and community members who use our platform at <a href="https://churchnavigator.com" style={{ color: "#7c3aed" }}>https://churchnavigator.com</a>.
            </p>

            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "32px", marginBottom: "12px" }}>
              2. Information We Collect
            </h2>
            <p>
              When you interact with ChurchNavigator, create an account, submit a church listing, or contact a pastor, we may collect the following information:
            </p>
            <ul style={{ paddingLeft: "24px", margin: "12px 0" }}>
              <li><strong>Account & Profile Information:</strong> When you register via email or third-party OAuth providers (Google or Apple), we receive your name, email address, profile photo, and authenticated user ID.</li>
              <li><strong>Ministry & Listing Data:</strong> Church names, physical locations, service times, leadership bio, phone numbers, public social media links, and event schedules submitted by administrators.</li>
              <li><strong>Communication & Enquiries:</strong> Names, email addresses, phone numbers, and messages sent through the &ldquo;Send Enquiry&rdquo; or &ldquo;Contact Pastor&rdquo; forms on public listings.</li>
              <li><strong>Technical Data:</strong> Browser type, device characteristics, operating system, and anonymized analytics to ensure smooth performance across all devices.</li>
            </ul>

            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "32px", marginBottom: "12px" }}>
              3. How We Use Your Information
            </h2>
            <p>
              We process your data strictly for legitimate operational purposes:
            </p>
            <ul style={{ paddingLeft: "24px", margin: "12px 0" }}>
              <li>To provide, maintain, and improve the church directory and event discovery services.</li>
              <li>To authenticate user sessions securely via Supabase and OAuth identity providers.</li>
              <li>To route and deliver contact enquiries and tickets between attendees, visitors, and church organizers.</li>
              <li>To prevent unauthorized access, mitigate fraudulent activities, and maintain platform security.</li>
            </ul>

            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "32px", marginBottom: "12px" }}>
              4. Third-Party Authentication & Google User Data
            </h2>
            <p>
              If you choose to sign in to ChurchNavigator using your <strong>Google Account</strong>:
            </p>
            <ul style={{ paddingLeft: "24px", margin: "12px 0" }}>
              <li>We only request access to basic profile scopes: your email address, full name, and avatar picture.</li>
              <li>We do <strong>not</strong> access your Google Drive, contacts, calendars, emails, or search history.</li>
              <li>We never sell, rent, or trade your Google user data to advertisers or third parties.</li>
              <li>Google OAuth tokens are handled securely through industry-standard encryption protocols.</li>
            </ul>

            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "32px", marginBottom: "12px" }}>
              5. Data Storage, Security & Retention
            </h2>
            <p>
              All personal and listing data is housed in encrypted, enterprise-grade cloud databases hosted by Supabase. We implement strict Role-Based Access Controls (RBAC) and row-level security protocols. We retain your personal information only as long as necessary to provide services and fulfill legal requirements.
            </p>

            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "32px", marginBottom: "12px" }}>
              6. Your Rights & Data Deletion
            </h2>
            <p>
              You have the right to request access to your personal data, rectify inaccurate details, or request full deletion of your account and associated listings. To exercise any of these rights, simply email our data protection team at <a href="mailto:connect.churchnavigator@gmail.com" style={{ color: "#7c3aed", fontWeight: 700 }}>connect.churchnavigator@gmail.com</a>.
            </p>

            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: "32px", marginBottom: "12px" }}>
              7. Contact Us
            </h2>
            <p>
              If you have any questions or feedback regarding this Privacy Policy, please contact us:
            </p>
            <div style={{ background: "#f8fafc", padding: "18px 22px", borderRadius: "14px", border: "1px solid #e2e8f0", marginTop: "14px" }}>
              <div><strong>ChurchNavigator Support</strong></div>
              <div>Email: <a href="mailto:connect.churchnavigator@gmail.com" style={{ color: "#7c3aed" }}>connect.churchnavigator@gmail.com</a></div>
              <div>Website: <a href="https://churchnavigator.com" style={{ color: "#7c3aed" }}>https://churchnavigator.com</a></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
