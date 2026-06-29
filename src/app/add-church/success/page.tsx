"use client";

import React, { useState, Suspense } from "react";
import { useFormContext } from "@/context/FormContext";
import { useRouter, useSearchParams } from "next/navigation";

function SuccessContent() {
  const { formData } = useFormContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  const apiSlug = searchParams.get('slug');
  const name = formData.name || "Your Church";
  const slug = apiSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const [domain, setDomain] = useState("");
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setDomain(window.location.host);
    }
  }, []);
  const url = domain ? `${domain.includes('localhost') ? 'http' : 'https'}://${domain}/church/${slug || 'your-church'}` : `https://churchnavigator.com/church/${slug || 'your-church'}`;

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
      <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(244,63,94,0.06), transparent 70%)", top: "-150px", right: "-100px", pointerEvents: "none" }}></div>
      <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.06), transparent 70%)", bottom: "-80px", left: "-60px", pointerEvents: "none" }}></div>

      <div style={{ width: "100%", maxWidth: "540px", textAlign: "center", position: "relative", zIndex: 1 }}>
        
        {/* Confetti Icon */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: "28px" }}>
          <div style={{ width: "100px", height: "100px", borderRadius: "28px", background: "var(--cn-grad)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", animation: "float 4s ease-in-out infinite" }}>
            <i className="ti ti-confetti" style={{ fontSize: "46px", color: "#fff" }}></i>
          </div>
        </div>

        <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--cn-ink)", marginBottom: "10px" }}>You're live!</div>
        <div style={{ fontSize: "15px", color: "var(--cn-gray)", marginBottom: "28px" }}>{name} is now on ChurchNavigator</div>

        {/* URL Box */}
        <div style={{ background: "#f5f3ff", border: "1.5px solid #ede9fe", borderRadius: "14px", padding: "13px 18px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "10px" }}>
          <i className="ti ti-link" style={{ fontSize: "16px", color: "var(--cn-purple)", flexShrink: 0 }}></i>
          <div style={{ flex: 1, fontSize: "13px", color: "var(--cn-purple-dark)", textAlign: "left", fontWeight: 600 }}>{url}</div>
          <button onClick={handleCopy} style={{ background: copied ? "#16a34a" : "var(--cn-purple)", border: "none", borderRadius: "9px", padding: "7px 14px", color: "#fff", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "4px", transition: "background 0.2s" }}>
            <i className={copied ? "ti ti-check" : "ti ti-copy"} style={{ fontSize: "12px" }}></i> {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Journey Card */}
        <div className="scard" style={{ textAlign: "left" }}>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--cn-ink)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "7px" }}>
            <i className="ti ti-flag" style={{ fontSize: "16px", color: "var(--cn-purple)" }}></i> Your journey starts here
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="ti ti-check" style={{ fontSize: "15px", color: "#fff" }}></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)" }}>Listing created</div>
              <div style={{ fontSize: "11px", color: "var(--cn-gray)" }}>You're live on ChurchNavigator!</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: "#f5f3ff", border: "1.5px solid #ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "12px", fontWeight: 800, color: "var(--cn-purple-dark)" }}>
              2
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--cn-ink)" }}>Add cover photo</div>
              <div style={{ fontSize: "11px", color: "var(--cn-gray)" }}>+20% to your profile score</div>
            </div>
            <button onClick={() => router.push('/add-church/6')} style={{ background: "var(--cn-purple)", border: "none", borderRadius: "8px", padding: "6px 12px", color: "#fff", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Add now
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: "#f5f3ff", border: "1.5px solid #ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "12px", fontWeight: 800, color: "var(--cn-purple-dark)" }}>
              3
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--cn-ink)" }}>Set up QR visitor check-in</div>
              <div style={{ fontSize: "11px", color: "var(--cn-gray)" }}>Start tracking your visitors</div>
            </div>
            <button onClick={() => alert("QR Visitor check-in setup coming soon!")} style={{ background: "var(--cn-purple)", border: "none", borderRadius: "8px", padding: "6px 12px", color: "#fff", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Set up
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "9px", background: "#f5f3ff", border: "1.5px solid #ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="ti ti-robot" style={{ fontSize: "14px", color: "var(--cn-purple-dark)" }}></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--cn-ink)" }}>Unlock AI Visitor Intelligence</div>
              <div style={{ fontSize: "11px", color: "var(--cn-gray)" }}>After 5 check-ins — AI insights activate</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
          <button onClick={() => router.push('/add-church/preview')} className="btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
            <i className="ti ti-eye" style={{ fontSize: "15px" }}></i> View listing
          </button>
          <button onClick={handleShare} className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
            <i className="ti ti-share" style={{ fontSize: "15px" }}></i> Share it
          </button>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
