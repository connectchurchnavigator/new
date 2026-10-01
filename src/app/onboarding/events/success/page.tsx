"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function EventSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  const apiSlug = searchParams.get('slug');
  const queryName = searchParams.get('name');
  const eventId = searchParams.get('id');
  const name = queryName || "Kingdom Event";
  const slug = apiSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const [domain, setDomain] = useState("");
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setDomain(window.location.host);
    }
  }, []);
  const url = domain ? `${domain.includes('localhost') ? 'http' : 'https'}://${domain}/events/${slug}${eventId ? `?id=${eventId}` : ''}` : `https://churchnavigator.com/events/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${name} on ChurchNavigator`,
        url: url,
      }).catch(console.error);
    } else {
      handleCopy();
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
      {/* Background Orbs */}
      <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(225,29,72,0.08), transparent 70%)", top: "-150px", right: "-100px", pointerEvents: "none" }}></div>
      <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.08), transparent 70%)", bottom: "-80px", left: "-60px", pointerEvents: "none" }}></div>

      <div style={{ width: "100%", maxWidth: "540px", textAlign: "center", position: "relative", zIndex: 1 }}>
        
        {/* Confetti Icon */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: "28px" }}>
          <div style={{ width: "100px", height: "100px", borderRadius: "28px", background: "linear-gradient(135deg, #e11d48, #f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", animation: "float 4s ease-in-out infinite", boxShadow: "0 10px 25px rgba(225, 29, 72, 0.3)" }}>
            <i className="ti ti-confetti" style={{ fontSize: "46px", color: "#fff" }}></i>
          </div>
        </div>

        <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--cn-ink)", marginBottom: "10px" }}>{name} is now live!</div>
        <div style={{ fontSize: "15px", color: "var(--cn-gray)", marginBottom: "28px" }}>{name} is now published on ChurchNavigator</div>

        {/* URL Box */}
        <div style={{ background: "#fff1f2", border: "1.5px solid #ffe4e6", borderRadius: "14px", padding: "13px 18px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "10px" }}>
          <i className="ti ti-link" style={{ fontSize: "16px", color: "#e11d48", flexShrink: 0 }}></i>
          <div style={{ flex: 1, fontSize: "13px", color: "#be123c", textAlign: "left", fontWeight: 600 }}>{url}</div>
          <button onClick={handleCopy} style={{ background: copied ? "#16a34a" : "#e11d48", border: "none", borderRadius: "9px", padding: "7px 14px", color: "#fff", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "4px", transition: "background 0.2s" }}>
            <i className={copied ? "ti ti-check" : "ti ti-copy"} style={{ fontSize: "12px" }}></i> {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
          <button 
            onClick={() => router.push(`/events/${slug}${eventId ? `?id=${eventId}` : ''}`)} 
            className="btn-secondary" 
            style={{ flex: 1, justifyContent: "center" }}
          >
            <i className="ti ti-eye" style={{ fontSize: "15px" }}></i> View event
          </button>
          <button onClick={handleShare} className="btn-primary" style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg, #e11d48, #f59e0b)" }}>
            <i className="ti ti-share" style={{ fontSize: "15px" }}></i> Share it
          </button>
        </div>

      </div>
    </div>
  );
}

export default function EventSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventSuccessContent />
    </Suspense>
  );
}
