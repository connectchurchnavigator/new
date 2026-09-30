import React, { useState } from "react";
import { useFormContext } from "@/context/FormContext";
import { useTaxonomies } from "@/hooks/useTaxonomies";

interface Step5FacilitiesProps {
  onNext: () => void;
  onBack: () => void;
}

export default function Step5Facilities({ onNext, onBack }: Step5FacilitiesProps) {
  const { formData, updateFormData } = useFormContext();
  const taxonomies = useTaxonomies();
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
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Facilities & Amenities</div>
        </div>
        <div style={{ fontSize: "13px", color: "var(--cn-gray)", marginBottom: "22px" }}>
          Help visitors plan their visit — especially families & those with accessibility needs
        </div>

        {/* Dynamic Taxonomy Facilities */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11.5px", fontWeight: 800, color: "var(--cn-purple-dark)", letterSpacing: "0.05em", marginBottom: "12px", textTransform: "uppercase" }}>
            <i className="ti ti-building" style={{ fontSize: "14px", marginRight: "6px" }}></i> Featured Platform Amenities
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
            {taxonomies.facilities.map((fac) => (
              <button 
                key={fac}
                type="button"
                className={`fac-chip ${isSelected(fac) ? "on" : ""}`} 
                onClick={() => toggleChip(fac)}
                style={{ textAlign: "left", width: "100%", margin: 0 }}
              >
                <div className="fac-icon">
                  <i className={`ti ${isSelected(fac) ? "ti-check" : "ti-sparkles"}`} style={{ fontSize: "14px", color: isSelected(fac) ? "#fff" : "var(--cn-purple)" }}></i>
                </div>
                <span>{fac}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* ACCESSIBILITY */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-purple-dark)", letterSpacing: "0.05em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="ti ti-accessible" style={{ fontSize: "14px" }}></i> ADDITIONAL ACCESSIBILITY
            </div>
            {[
              { id: "Wheelchair Access", icon: "ti-wheelchair" },
              { id: "Hearing Loop", icon: "ti-ear" },
              { id: "BSL Interpreter", icon: "ti-hand-stop" },
              { id: "Accessible Toilets", icon: "ti-accessible" }
            ].filter(i => !taxonomies.facilities.includes(i.id)).map(item => (
              <button 
                key={item.id}
                type="button"
                className={`fac-chip ${isSelected(item.id) ? "on" : ""}`} 
                onClick={() => toggleChip(item.id)}
              >
                <div className="fac-icon"><i className={`ti ${item.icon}`} style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i></div>
                {item.id}
              </button>
            ))}
          </div>

          {/* SPACES & TECH */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-purple-dark)", letterSpacing: "0.05em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="ti ti-users" style={{ fontSize: "14px" }}></i> SPACES & TECH
            </div>
            {[
              { id: "Free WiFi", icon: "ti-wifi" },
              { id: "Meeting Rooms", icon: "ti-door" },
              { id: "Outdoor Space", icon: "ti-trees" },
              { id: "Streaming Setup", icon: "ti-broadcast" }
            ].filter(i => !taxonomies.facilities.includes(i.id)).map(item => (
              <button 
                key={item.id}
                type="button"
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
