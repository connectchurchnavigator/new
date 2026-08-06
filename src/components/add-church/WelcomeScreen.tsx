import React, { useState } from "react";

interface WelcomeScreenProps {
  onSelectForm: (type: string) => void;
  onSelectImport?: () => void;
}

export default function WelcomeScreen({ onSelectForm }: WelcomeScreenProps) {
  const [version, setVersion] = useState<"v3" | "v0">("v3");

  return (
    <div style={{
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.4s ease",
      background: version === "v3"
        ? "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #fce7f3 100%)"
        : "#ffffff"
    }}>

      {/* VERSION SWITCHER (v3 & v0) */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "16px 20px",
        position: "relative",
        zIndex: 20
      }}>
        <span style={{ fontSize: "12px", fontWeight: 800, color: "#475569", marginRight: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Theme:
        </span>
        {[
          { id: "v3", label: "v3 (Heavenly Light)" },
          { id: "v0", label: "v0 (Default White)" },
        ].map((v) => {
          const active = version === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setVersion(v.id as any)}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                border: active ? "1.5px solid #7c3aed" : "1px solid #e2e8f0",
                background: active ? "#7c3aed" : "#ffffff",
                color: active ? "#ffffff" : "#334155",
                fontSize: "12px",
                fontWeight: active ? 800 : 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: active ? "0 4px 12px rgba(124, 58, 237, 0.3)" : "none"
              }}
            >
              {v.label}
            </button>
          );
        })}
      </div>

      {/* BACKGROUND ELEMENTS FOR V0 & V3 */}
      {version === "v0" ? (
        <>
          <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(244,63,94,0.06), transparent 70%)", top: "-200px", right: "-150px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.06), transparent 70%)", bottom: "-100px", left: "-100px", pointerEvents: "none" }} />
        </>
      ) : (
        <>
          {/* Heavenly Light Beams & Glows */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 60%)",
            pointerEvents: "none"
          }} />
          <div style={{
            position: "absolute",
            top: "-150px",
            right: "10%",
            width: "320px",
            height: "800px",
            background: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)",
            transform: "rotate(-35deg)",
            filter: "blur(20px)",
            pointerEvents: "none"
          }} />
          <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)", top: "-100px", left: "-100px", filter: "blur(60px)", pointerEvents: "none" }} />
        </>
      )}

      {/* CONTENT CONTAINER */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "34px 24px 70px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "44px" }}>
          <div style={{
            fontSize: "38px",
            fontWeight: 800,
            color: "var(--cn-ink)",
            lineHeight: 1.15,
            marginBottom: "12px",
            letterSpacing: "-0.02em"
          }}>
            List on ChurchNavigator
          </div>
          <div style={{
            fontSize: "16px",
            color: "var(--cn-gray)",
            maxWidth: "620px",
            margin: "0 auto",
            lineHeight: 1.5
          }}>
            Connect your church, pastor profile, or upcoming events with thousands of believers — it only takes a couple of minutes.
          </div>
        </div>

        <div style={{
          fontSize: "14px",
          fontWeight: 800,
          color: "#334155",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: "16px"
        }}>
          Select Listing Type
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px", marginBottom: "32px" }}>
          <TypeCard type="church" icon="ti-building-church" title="Church" subtitle="Place of worship" onClick={() => onSelectForm("church")} />
          <TypeCard type="pastor" icon="ti-user" title="Pastor" subtitle="Clergy & leaders" onClick={() => onSelectForm("pastor")} />
          <TypeCard type="events" icon="ti-calendar-event" title="Events" subtitle="Conferences & gatherings" onClick={() => onSelectForm("events")} />
        </div>
      </div>
    </div>
  );
}

function TypeCard({ icon, title, subtitle, onClick }: any) {
  return (
    <div
      className="type-card"
      onClick={onClick}
      style={{
        padding: "34px 20px",
        background: "#ffffff",
        border: "1.5px solid var(--cn-border)",
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
        transition: "all 0.25s ease"
      }}
    >
      <div className="t-icon" style={{
        width: "58px",
        height: "58px",
        borderRadius: "16px",
        margin: "0 auto 14px",
        background: "var(--cn-surface)"
      }}>
        <i className={`ti ${icon}`} style={{ fontSize: "28px", color: "var(--cn-gray-light)" }}></i>
      </div>
      <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>{title}</div>
      <div style={{ fontSize: "13.5px", fontWeight: 500, color: "#64748b", marginTop: "5px" }}>{subtitle}</div>
    </div>
  );
}
