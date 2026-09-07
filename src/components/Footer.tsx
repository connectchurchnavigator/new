import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: "#0f172a", color: "#94a3b8", padding: "50px 24px 30px", borderTop: "1px solid #1e293b" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", marginBottom: "36px" }}>
        <div>
          <div style={{ fontSize: "20px", fontWeight: 900, color: "#ffffff", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg,#f43f5e,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>✝</span>
            ChurchNavigator
          </div>
          <p style={{ fontSize: "13.5px", lineHeight: 1.6 }}>
            Connecting seekers and believers with vibrant, Christ-centered churches, events, and ministries around the globe.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff", marginBottom: "16px" }}>Directory</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px" }}>
            <li><Link href="/explore" style={{ color: "inherit", textDecoration: "none" }}>Interactive Map</Link></li>
            <li><Link href="/explore" style={{ color: "inherit", textDecoration: "none" }}>Churches Directory</Link></li>
            <li><Link href="/events" style={{ color: "inherit", textDecoration: "none" }}>Christian Events</Link></li>
            <li><Link href="/pastors" style={{ color: "inherit", textDecoration: "none" }}>Pastors & Speakers</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff", marginBottom: "16px" }}>Leaders & Admins</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px" }}>
            <li><Link href="/add-listing" style={{ color: "inherit", textDecoration: "none" }}>Add Church</Link></li>
            <li><Link href="/onboarding/pastor" style={{ color: "inherit", textDecoration: "none" }}>Add Pastor Profile</Link></li>
            <li><Link href="/onboarding/events" style={{ color: "inherit", textDecoration: "none" }}>Host Event</Link></li>
            <li><Link href="/login" style={{ color: "inherit", textDecoration: "none" }}>Dashboard Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff", marginBottom: "16px" }}>Platform</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px" }}>
            <li><span style={{ color: "#94a3b8" }}>About Us</span></li>
            <li><span style={{ color: "#94a3b8" }}>Terms of Service</span></li>
            <li><span style={{ color: "#94a3b8" }}>Privacy & GDPR</span></li>
          </ul>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", paddingTop: "20px", borderTop: "1px solid #1e293b", textAlign: "center", fontSize: "12px" }}>
        © {new Date().getFullYear()} ChurchNavigator. All rights reserved.
      </div>
    </footer>
  );
}
