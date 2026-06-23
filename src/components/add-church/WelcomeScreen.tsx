import React from "react";

interface WelcomeScreenProps {
  onSelectForm: (type: string) => void;
  onSelectImport: () => void;
}

export default function WelcomeScreen({ onSelectForm }: WelcomeScreenProps) {
  return (
    <div style={{ background: "#fff", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(244,63,94,0.06), transparent 70%)", top: "-200px", right: "-150px", pointerEvents: "none" }}></div>
      <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.06), transparent 70%)", bottom: "-100px", left: "-100px", pointerEvents: "none" }}></div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px 60px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--cn-ink)", lineHeight: 1.15, marginBottom: "10px" }}>Add your church</div>
          <div style={{ fontSize: "15px", color: "var(--cn-gray)" }}>Join thousands of churches already on ChurchNavigator — it only takes a couple of minutes</div>
        </div>

        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--cn-gray)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "12px" }}>Select listing type</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "32px" }}>
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
    <div className="type-card" onClick={onClick}>
      <div className="t-icon">
        <i className={`ti ${icon}`} style={{ fontSize: "24px", color: "var(--cn-gray-light)" }}></i>
      </div>
      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--cn-ink)" }}>{title}</div>
      <div style={{ fontSize: "10px", color: "var(--cn-gray-light)", marginTop: "3px" }}>{subtitle}</div>
    </div>
  );
}
