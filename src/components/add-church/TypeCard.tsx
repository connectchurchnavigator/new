import React, { useState } from "react";

export const TYPE_THEMES: Record<string, {
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
  },
  worship_leader: {
    normalBg: "#ffffff",
    normalBorder: "#e2e8f0",
    iconBg: "linear-gradient(135deg, #f0fdfa, #ccfbf1)",
    iconColor: "#0d9488",
    hoverBorder: "#0d9488",
    hoverBg: "#f0fdfa",
    hoverIconBg: "linear-gradient(135deg, #0d9488, #0f766e)",
    hoverShadow: "0 20px 40px -10px rgba(13, 148, 136, 0.22)"
  }
};

interface TypeCardProps {
  type: string;
  icon: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}

export default function TypeCard({ type, icon, title, subtitle, onClick }: TypeCardProps) {
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
