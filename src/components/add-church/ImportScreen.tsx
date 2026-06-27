import React, { useState } from "react";

interface ImportScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

export default function ImportScreen({ onBack, onComplete }: ImportScreenProps) {
  const [state, setState] = useState<"entry" | "scanning" | "results">("entry");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const startImport = () => {
    if (!url.trim()) {
      setError("Please enter a valid website address");
      return;
    }
    setError("");
    setState("scanning");
    
    // Simulate scan
    setTimeout(() => {
      setState("results");
    }, 2500);
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.06), transparent 70%)", top: "-150px", right: "-100px", pointerEvents: "none" }}></div>

      <div style={{ maxWidth: "620px", margin: "0 auto", padding: "48px 24px 60px", position: "relative", zIndex: 1 }}>
        <button onClick={onBack} className="btn-secondary" style={{ marginBottom: "32px" }}>
          <i className="ti ti-arrow-left" style={{ fontSize: "14px" }}></i> Choose another way
        </button>

        {state === "entry" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "var(--cn-grad)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", boxShadow: "0 8px 24px var(--cn-glow)" }}>
                <i className="ti ti-link" style={{ fontSize: "28px", color: "#fff" }}></i>
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--cn-ink)", marginBottom: "8px" }}>Import from your website</div>
              <div style={{ fontSize: "14px", color: "var(--cn-gray)" }}>Paste your church's website and we'll pull in what we can find — you can review and edit everything before publishing.</div>
            </div>

            <div className="scard">
              <label>Church website <span className="req-badge">REQUIRED</span></label>
              <div style={{ position: "relative", marginBottom: "6px" }}>
                <i className="ti ti-world" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "var(--cn-gray-light)", zIndex: 2 }}></i>
                <input 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="www.yourchurch.org" 
                  autoComplete="off" 
                  style={{ paddingLeft: "42px" }} 
                  onKeyDown={(e) => e.key === "Enter" && startImport()} 
                />
              </div>
              {error && <div style={{ fontSize: "12px", color: "#ef4444", marginBottom: "8px" }}>{error}</div>}
              <div style={{ fontSize: "11px", color: "var(--cn-gray-light)", marginBottom: "18px" }}>e.g. yourchurch.org, www.yourchurch.com, or a Facebook/Linktree page</div>
              <button onClick={startImport} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                <i className="ti ti-sparkles" style={{ fontSize: "15px" }}></i> Scan website
              </button>
            </div>
          </div>
        )}

        {state === "scanning" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ width: "84px", height: "84px", borderRadius: "24px", background: "var(--cn-grad)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 26px", boxShadow: "0 10px 30px var(--cn-glow)", animation: "pulseScale 1.6s ease-in-out infinite" }}>
              <i className="ti ti-world-search" style={{ fontSize: "34px", color: "#fff" }}></i>
            </div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--cn-ink)", marginBottom: "8px" }}>Reading your website...</div>
            <div style={{ fontSize: "13px", color: "var(--cn-gray)", marginBottom: "28px" }}>{url}</div>

            <div style={{ maxWidth: "340px", margin: "0 auto", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", color: "var(--cn-gray-light)", fontSize: "13px" }}>
                <i className="ti ti-circle-dashed" style={{ fontSize: "16px" }}></i> Fetching page content
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", color: "var(--cn-gray-light)", fontSize: "13px" }}>
                <i className="ti ti-circle-dashed" style={{ fontSize: "16px" }}></i> Looking for church name & address
              </div>
            </div>
          </div>
        )}

        {state === "results" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", boxShadow: "0 8px 24px rgba(22,163,74,0.3)" }}>
                <i className="ti ti-check" style={{ fontSize: "28px", color: "#fff" }}></i>
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--cn-ink)", marginBottom: "8px" }}>We found some details!</div>
              <div style={{ fontSize: "13px", color: "var(--cn-gray)" }}>Here's what we pulled from your website — you'll be able to review and edit every field next.</div>
            </div>

            <div className="scard" style={{ padding: "8px" }}>
              <div style={{ padding: "12px", borderBottom: "1px solid var(--cn-border)", fontSize: "14px" }}><strong>Name:</strong> Found</div>
            </div>

            <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: "14px", padding: "13px 16px", marginBottom: "20px", display: "flex", gap: "9px", alignItems: "flex-start" }}>
              <i className="ti ti-info-circle" style={{ fontSize: "15px", color: "#d97706", flexShrink: 0, marginTop: "1px" }}></i>
              <div style={{ fontSize: "12px", color: "#78350f", lineHeight: 1.6 }}>Websites aren't always structured the same way, so some fields may need a closer look. Nothing is published until you review and confirm.</div>
            </div>

            <button onClick={onComplete} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              Review & complete listing <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
