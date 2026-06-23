import React, { useState } from "react";
import { useFormContext } from "@/context/FormContext";

interface Step4LanguagesProps {
  onNext: () => void;
  onBack: () => void;
}

export default function Step4Languages({ onNext, onBack }: Step4LanguagesProps) {
  const { formData, updateFormData } = useFormContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLangs, setSelectedLangs] = useState<string[]>(formData.languages || []);
  const [error, setError] = useState<string | null>(null);

  const quickPicks = ["English", "Spanish", "French", "Portuguese", "Yoruba", "Twi", "Mandarin", "Polish"];

  const toggleLang = (lang: string) => {
    setSelectedLangs(prev => {
      const newLangs = prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang];
      if (newLangs.length > 0) setError(null);
      return newLangs;
    });
  };

  const handleNext = () => {
    if (selectedLangs.length === 0) {
      setError("Please select at least one language");
      setTimeout(() => {
        const el = document.getElementById("f-languages");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
      return;
    }
    setError(null);
    updateFormData({ languages: selectedLangs });
    onNext();
  };

  return (
    <div className="step-content slide-up">
      <div className="scard">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,#a78bfa,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-language" style={{ fontSize: "18px", color: "#fff" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Languages</div>
        </div>
        <div style={{ fontSize: "13px", color: "var(--cn-gray)", marginBottom: "18px" }}>
          Which languages are services held in, or interpreted into?
        </div>

        <div id="f-languages" style={{ position: "relative", marginBottom: "14px" }}>
          <i className="ti ti-search" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "var(--cn-gray-light)", zIndex: 2 }}></i>
          <input 
            placeholder="Search languages..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "42px" }} 
          />
        </div>

        {selectedLangs.length > 0 && (
          <>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-gray)", letterSpacing: "0.05em", marginBottom: "8px" }}>SELECTED</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "18px" }}>
              {selectedLangs.map(lang => (
                <div key={lang} className="chip on" onClick={() => toggleLang(lang)} style={{ cursor: "pointer" }}>
                  {lang} <i className="ti ti-x" style={{ fontSize: "12px", marginLeft: "4px" }}></i>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-gray)", letterSpacing: "0.05em", marginBottom: "9px" }}>QUICK PICKS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {quickPicks.map(lang => (
            <div 
              key={lang} 
              className={`chip ${selectedLangs.includes(lang) ? "on" : ""} ${error && selectedLangs.length === 0 ? "error-border" : ""}`} 
              onClick={() => toggleLang(lang)}
              style={{ cursor: "pointer", border: error && selectedLangs.length === 0 ? "1.5px solid red" : "" }}
            >
              {lang}
            </div>
          ))}
        </div>
        {error && <div style={{ color: "red", fontSize: "12px", marginTop: "12px" }}>{error}</div>}
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button onClick={onBack} className="btn-secondary">
          <i className="ti ti-arrow-left" style={{ fontSize: "14px" }}></i>
        </button>
        <button onClick={handleNext} className="btn-primary">
          Next — Facilities <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
        </button>
      </div>
    </div>
  );
}
