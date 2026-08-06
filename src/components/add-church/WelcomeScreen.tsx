import React, { useState } from "react";

interface WelcomeScreenProps {
  onSelectForm: (type: string) => void;
  onSelectImport?: () => void;
}

export default function WelcomeScreen({ onSelectForm }: WelcomeScreenProps) {
  return (
    <div style={{
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
      background: "#ffffff"
    }}>
      {/* Subtle Ambient Radial Accents */}
      <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(244,63,94,0.04), transparent 70%)", top: "-200px", right: "-150px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.04), transparent 70%)", bottom: "-100px", left: "-100px", pointerEvents: "none" }} />

      {/* CONTENT CONTAINER */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "54px 24px 70px", position: "relative", zIndex: 1 }}>
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

const TYPE_THEMES: Record<string, {
  normalBg: string;
  normalBorder: string;
  iconBg: string;
  iconColor: string;
  hoverBorder: string;
  hoverBg: string;
  hoverIconBg: string;
  hoverShadow: string;
}> = {
  church: {
    normalBg: "#ffffff",
    normalBorder: "#e2e8f0",
    iconBg: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
    iconColor: "#7c3aed",
    hoverBorder: "#7c3aed",
    hoverBg: "#faf5ff",
    hoverIconBg: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    hoverShadow: "0 20px 40px -10px rgba(124, 58, 237, 0.22)"
  },
  pastor: {
    normalBg: "#ffffff",
    normalBorder: "#e2e8f0",
    iconBg: "linear-gradient(135deg, #fdf2f8, #fce7f3)",
    iconColor: "#e11d48",
    hoverBorder: "#e11d48",
    hoverBg: "#fff1f2",
    hoverIconBg: "linear-gradient(135deg, #e11d48, #be123c)",
    hoverShadow: "0 20px 40px -10px rgba(225, 29, 72, 0.22)"
  },
  events: {
    normalBg: "#ffffff",
    normalBorder: "#e2e8f0",
    iconBg: "linear-gradient(135deg, #fffbeb, #fef3c7)",
    iconColor: "#d97706",
    hoverBorder: "#d97706",
    hoverBg: "#fffbeb",
    hoverIconBg: "linear-gradient(135deg, #f59e0b, #d97706)",
    hoverShadow: "0 20px 40px -10px rgba(217, 119, 6, 0.22)"
  }
};

function TypeCard({ type, icon, title, subtitle, onClick }: any) {
  const [isHovered, setIsHovered] = useState(false);
  const theme = TYPE_THEMES[type] || TYPE_THEMES.church;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: "36px 22px",
        background: isHovered ? theme.hoverBg : "#ffffff",
        border: `2px solid ${isHovered ? theme.hoverBorder : theme.normalBorder}`,
        borderRadius: "20px",
        boxShadow: isHovered ? theme.hoverShadow : "0 10px 30px rgba(15,23,42,0.04)",
        transform: isHovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
        cursor: "pointer",
        textAlign: "center"
      }}
    >
      <div style={{
        width: "60px",
        height: "60px",
        borderRadius: "18px",
        margin: "0 auto 16px",
        background: isHovered ? theme.hoverIconBg : theme.iconBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isHovered ? "0 8px 20px rgba(0,0,0,0.15)" : "none",
        transition: "all 0.25s ease"
      }}>
        <i className={`ti ${icon}`} style={{
          fontSize: "30px",
          color: isHovered ? "#ffffff" : theme.iconColor,
          transition: "all 0.25s ease"
        }}></i>
      </div>
      <div style={{ fontSize: "19px", fontWeight: 800, color: "var(--cn-ink)" }}>{title}</div>
      <div style={{ fontSize: "13.5px", fontWeight: 500, color: "#64748b", marginTop: "5px" }}>{subtitle}</div>
    </div>
  );
}
