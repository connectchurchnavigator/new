import React, { useState } from "react";
import { useFormContext } from "@/context/FormContext";

interface Step5FacilitiesProps {
  onNext: () => void;
  onBack: () => void;
}

export default function Step5Facilities({ onNext, onBack }: Step5FacilitiesProps) {
  const { formData, updateFormData } = useFormContext();
  const [activeChips, setActiveChips] = useState<string[]>(formData.facilities || []);

  const toggleChip = (chip: string) => {
    setActiveChips(prev => 
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const isSelected = (chip: string) => activeChips.includes(chip);

  return (
    <div className="step-content slide-up">
      <div className="scard">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,#22d3ee,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-accessible" style={{ fontSize: "18px", color: "#fff" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Facilities</div>
        </div>
        <div style={{ fontSize: "13px", color: "var(--cn-gray)", marginBottom: "22px" }}>
          Help visitors plan their visit — especially families & those with accessibility needs
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          
          {/* ACCESSIBILITY */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-purple-dark)", letterSpacing: "0.05em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="ti ti-accessible" style={{ fontSize: "14px" }}></i> ACCESSIBILITY
            </div>
            {[
              { id: "Wheelchair Access", icon: "ti-wheelchair" },
              { id: "Hearing Loop", icon: "ti-ear" },
              { id: "BSL Interpreter", icon: "ti-hand-stop" },
              { id: "Accessible Toilets", icon: "ti-accessible" }
            ].map(item => (
              <button 
                key={item.id}
                className={`fac-chip ${isSelected(item.id) ? "on" : ""}`} 
                onClick={() => toggleChip(item.id)}
              >
                <div className="fac-icon"><i className={`ti ${item.icon}`} style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i></div>
                {item.id}
              </button>
            ))}
          </div>

          {/* PARKING */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-purple-dark)", letterSpacing: "0.05em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="ti ti-car" style={{ fontSize: "14px" }}></i> PARKING
            </div>
            {[
              { id: "Free Parking", icon: "ti-car" },
              { id: "On-site Car Park", icon: "ti-building-bank" },
              { id: "Good Transport Links", icon: "ti-bus" },
              { id: "Cycle Storage", icon: "ti-bike" }
            ].map(item => (
              <button 
                key={item.id}
                className={`fac-chip ${isSelected(item.id) ? "on" : ""}`} 
                onClick={() => toggleChip(item.id)}
              >
                <div className="fac-icon"><i className={`ti ${item.icon}`} style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i></div>
                {item.id}
              </button>
            ))}
          </div>

          {/* FACILITIES */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-purple-dark)", letterSpacing: "0.05em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="ti ti-building" style={{ fontSize: "14px" }}></i> FACILITIES
            </div>
            {[
              { id: "Free WiFi", icon: "ti-wifi" },
              { id: "Café / Refreshments", icon: "ti-coffee" },
              { id: "Baby Changing", icon: "ti-baby-carriage" },
              { id: "Prayer Room", icon: "ti-pray" }
            ].map(item => (
              <button 
                key={item.id}
                className={`fac-chip ${isSelected(item.id) ? "on" : ""}`} 
                onClick={() => toggleChip(item.id)}
              >
                <div className="fac-icon"><i className={`ti ${item.icon}`} style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i></div>
                {item.id}
              </button>
            ))}
          </div>

          {/* SPACES */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-purple-dark)", letterSpacing: "0.05em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="ti ti-users" style={{ fontSize: "14px" }}></i> SPACES
            </div>
            {[
              { id: "Hall Available", icon: "ti-building-community" },
              { id: "Meeting Rooms", icon: "ti-door" },
              { id: "Outdoor Space", icon: "ti-trees" },
              { id: "Streaming Setup", icon: "ti-broadcast" }
            ].map(item => (
              <button 
                key={item.id}
                className={`fac-chip ${isSelected(item.id) ? "on" : ""}`} 
                onClick={() => toggleChip(item.id)}
              >
                <div className="fac-icon"><i className={`ti ${item.icon}`} style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i></div>
                {item.id}
              </button>
            ))}
          </div>

        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button onClick={onBack} className="btn-secondary">
          <i className="ti ti-arrow-left" style={{ fontSize: "14px" }}></i>
        </button>
        <button onClick={() => { updateFormData({ facilities: activeChips }); onNext(); }} className="btn-primary">
          Next — Media <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
        </button>
      </div>
    </div>
  );
}
