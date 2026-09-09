import React from "react";
import TypeCard from "./TypeCard";

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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "18px", marginBottom: "32px" }}>
          <TypeCard type="church" icon="ti-building-church" title="Church" subtitle="Share your church with the community" onClick={() => onSelectForm("church")} />
          <TypeCard type="pastor" icon="ti-user" title="Pastor" subtitle="Share your ministry profile" onClick={() => onSelectForm("pastor")} />
          <TypeCard type="worship_leader" icon="ti-music" title="Worship Leader" subtitle="Share your worship ministry" onClick={() => onSelectForm("worship_leader")} />
          <TypeCard type="events" icon="ti-calendar-event" title="Events" subtitle="Share your upcoming events" onClick={() => onSelectForm("events")} />
        </div>
      </div>
    </div>
  );
}
