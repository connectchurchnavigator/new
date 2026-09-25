import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import TopNav from "@/components/layout/TopNav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Us | ChurchNavigator",
  description: "Learn about the mission, vision, and heart behind ChurchNavigator.",
};

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <TopNav />
      
      {/* Hero Header */}
      <section style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", color: "#ffffff", padding: "70px 24px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px", backdropFilter: "blur(6px)" }}>
            Our Purpose & Vision
          </div>
          <h1 style={{ fontSize: "38px", fontWeight: 900, margin: "0 0 16px", lineHeight: 1.2 }}>
            Connecting Faith, Ministries & Believers Worldwide
          </h1>
          <p style={{ fontSize: "16.5px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, margin: 0 }}>
            ChurchNavigator is built to bridge the gap between people seeking God and the vibrant Christian churches, pastors, worship leaders, and events in their communities.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main style={{ maxWidth: "900px", margin: "40px auto 80px", padding: "0 24px" }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: "24px", padding: "48px 40px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.03)" }}>
          
          <div style={{ marginBottom: "36px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", marginBottom: "12px" }}>
              Our Mission
            </h2>
            <p style={{ fontSize: "15px", lineHeight: 1.7, color: "#475569" }}>
              Finding a spiritual home or connecting with a supportive faith fellowship shouldn&rsquo;t be complicated. Whether you have just moved to a new city, are exploring faith for the first time, or looking for worship nights and community outreach, ChurchNavigator makes discovering trusted ministries effortless, transparent, and welcoming.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "40px" }}>
            <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>⛪</div>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Church Discovery</h3>
              <p style={{ fontSize: "13.5px", color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                Explore church profiles with verified service times, sermon topics, accessibility, parking, and children&rsquo;s ministries.
              </p>
            </div>

            <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>👤</div>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Pastors & Speakers</h3>
              <p style={{ fontSize: "13.5px", color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                Connect directly with gifted pastors and Christian leaders for conferences, prayer, pastoral guidance, and ministry collaboration.
              </p>
            </div>

            <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>📅</div>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Conferences & Events</h3>
              <p style={{ fontSize: "13.5px", color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                Discover local and regional revivals, worship nights, Bible conferences, youth gatherings, and community charity events.
              </p>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>Are you a Church Leader or Ministry Organizer?</div>
              <div style={{ fontSize: "13.5px", color: "#64748b" }}>List your congregation or profile on ChurchNavigator today for free.</div>
            </div>
            <Link
              href="/add-listing"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                color: "#ffffff",
                padding: "12px 22px",
                borderRadius: "12px",
                fontWeight: 800,
                fontSize: "14px",
                textDecoration: "none",
                display: "inline-block",
                boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)",
              }}
            >
              Add Your Listing
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
