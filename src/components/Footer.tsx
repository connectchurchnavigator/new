import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer style={{ background: "#0f172a", color: "#94a3b8", padding: "50px 24px 30px", borderTop: "1px solid #1e293b" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", marginBottom: "36px" }}>
        <div>
          <div style={{ fontSize: "20px", fontWeight: 900, color: "#ffffff", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Image 
              src="/icon.png" 
              alt="ChurchNavigator" 
              width={160} 
              height={50} 
              style={{ height: "32px", width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} 
            />
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
            <li><Link href="/about" style={{ color: "#94a3b8", textDecoration: "none", transition: "color 0.15s" }}>About Us</Link></li>
            <li><Link href="/terms" style={{ color: "#94a3b8", textDecoration: "none", transition: "color 0.15s" }}>Terms of Service</Link></li>
            <li><Link href="/privacy" style={{ color: "#94a3b8", textDecoration: "none", transition: "color 0.15s" }}>Privacy & GDPR</Link></li>
          </ul>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", paddingTop: "20px", borderTop: "1px solid #1e293b", textAlign: "center", fontSize: "12px" }}>
        © {new Date().getFullYear()} ChurchNavigator. All rights reserved.
      </div>
    </footer>
  );
}
