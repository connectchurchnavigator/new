import React, { useState, useEffect, useRef } from "react";
import { useFormContext } from "@/context/FormContext";

const ALL_LANGUAGES = ['English','Spanish','French','Portuguese','German','Italian','Dutch','Polish','Romanian','Hungarian','Czech','Slovak','Bulgarian','Serbian','Croatian','Bosnian','Slovenian','Macedonian','Montenegrin','Albanian','Greek','Turkish','Russian','Ukrainian','Belarusian','Lithuanian','Latvian','Estonian','Finnish','Swedish','Norwegian','Danish','Icelandic','Irish','Welsh','Scottish Gaelic','Manx','Cornish','Breton','Catalan','Basque','Galician','Luxembourgish','Frisian','Maltese','Romani','Yiddish','Ladino','Sorbian','Yoruba','Igbo','Hausa','Twi','Ga','Ewe','Fante','Akan','Fula','Wolof','Mandinka','Bambara','Mossi','Krio','Mende','Temne','Kanuri','Tiv','Edo','Efik','Ibibio','Nupe','Kpelle','Dan','Amharic','Tigrinya','Tigre','Oromo','Somali','Afar','Harari','Sidamo','Swahili','Lingala','Kikongo','Tshiluba','Kinyarwanda','Kirundi','Luganda','Runyankole','Acholi','Lango','Ateso','Chichewa','Bemba','Tonga','Lozi','Nyanja','Shona','Ndebele','Zulu','Xhosa','Swazi','Sesotho','Setswana','Sepedi','Tsonga','Venda','Afrikaans','Sango','Berber','Tamazight','Tashelhit','Kabyle','Malagasy','Comorian','Arabic','Hebrew','Aramaic','Kurdish','Sorani','Kurmanji','Farsi','Dari','Pashto','Balochi','Brahui','Luri','Persian','Azerbaijani','Armenian','Georgian','Turkmen','Uzbek','Kazakh','Kyrgyz','Tajik','Uyghur','Mongolian','Tibetan','Dzongkha','Urdu','Punjabi','Saraiki','Sindhi','Gujarati','Marathi','Konkani','Hindi','Bhojpuri','Maithili','Awadhi','Rajasthani','Bengali','Sylheti','Chittagonian','Assamese','Odia','Tamil','Telugu','Kannada','Malayalam','Tulu','Sinhala','Nepali','Newari','Santali','Kashmiri','Dogri','Manipuri','Mizo','Khasi','Bodo','Garo','Naga','Dhivehi','Mandarin','Cantonese','Hakka','Hokkien','Teochew','Shanghainese','Korean','Japanese','Vietnamese','Thai','Lao','Khmer','Burmese','Shan','Karen','Mon','Chin','Kachin','Rohingya','Hmong','Mien','Tagalog','Cebuano','Ilocano','Hiligaynon','Waray','Bikol','Kapampangan','Pangasinan','Maranao','Chavacano','Indonesian','Javanese','Sundanese','Balinese','Minangkabau','Buginese','Madurese','Acehnese','Batak','Malay','Tetum','Maori','Samoan','Tongan','Fijian','Hawaiian','Tahitian','Bislama','Tok Pisin','Hiri Motu','Chamorro','Marshallese','Palauan','Gilbertese','Nauruan','Quechua','Aymara','Guarani','Nahuatl','Maya','Mapudungun','Haitian Creole','Papiamento','Jamaican Patois','Trinidadian Creole','Cape Verdean Creole','Sranan Tongo','Garifuna','Belizean Creole'];

interface Step4LanguagesProps {
  onNext: () => void;
  onBack: () => void;
}

export default function Step4Languages({ onNext, onBack }: Step4LanguagesProps) {
  const { formData, updateFormData } = useFormContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLangs, setSelectedLangs] = useState<string[]>(formData.languages || []);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const quickPicks = ["English", "Spanish", "French", "Portuguese", "German", "Mandarin", "Arabic", "Hindi"];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

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

  const getFilteredLanguages = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return ALL_LANGUAGES;
    }
    const starts = ALL_LANGUAGES.filter(l => l.toLowerCase().startsWith(q));
    const contains = ALL_LANGUAGES.filter(l => !l.toLowerCase().startsWith(q) && l.toLowerCase().includes(q));
    return [...starts, ...contains];
  };

  const filtered = getFilteredLanguages();

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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          
          {/* COMMON / GLOBAL */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-purple-dark)", letterSpacing: "0.05em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="ti ti-world" style={{ fontSize: "14px" }}></i> COMMON & GLOBAL
            </div>
            {[
              { id: "English", icon: "ti-language" },
              { id: "Spanish", icon: "ti-language" },
              { id: "French", icon: "ti-language" },
              { id: "Portuguese", icon: "ti-language" }
            ].map(item => (
              <button 
                key={item.id}
                type="button"
                className={`fac-chip ${selectedLangs.includes(item.id) ? "on" : ""}`} 
                onClick={() => toggleLang(item.id)}
              >
                <div className="fac-icon"><i className={`ti ${item.icon}`} style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i></div>
                {item.id}
              </button>
            ))}
          </div>

          {/* EUROPEAN */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-purple-dark)", letterSpacing: "0.05em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="ti ti-building" style={{ fontSize: "14px" }}></i> EUROPEAN
            </div>
            {[
              { id: "German", icon: "ti-language" },
              { id: "Italian", icon: "ti-language" },
              { id: "Polish", icon: "ti-language" },
              { id: "Romanian", icon: "ti-language" }
            ].map(item => (
              <button 
                key={item.id}
                type="button"
                className={`fac-chip ${selectedLangs.includes(item.id) ? "on" : ""}`} 
                onClick={() => toggleLang(item.id)}
              >
                <div className="fac-icon"><i className={`ti ${item.icon}`} style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i></div>
                {item.id}
              </button>
            ))}
          </div>

          {/* ASIAN */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-purple-dark)", letterSpacing: "0.05em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="ti ti-compass" style={{ fontSize: "14px" }}></i> ASIAN
            </div>
            {[
              { id: "Mandarin", icon: "ti-language" },
              { id: "Cantonese", icon: "ti-language" },
              { id: "Hindi", icon: "ti-language" },
              { id: "Tagalog", icon: "ti-language" }
            ].map(item => (
              <button 
                key={item.id}
                type="button"
                className={`fac-chip ${selectedLangs.includes(item.id) ? "on" : ""}`} 
                onClick={() => toggleLang(item.id)}
              >
                <div className="fac-icon"><i className={`ti ${item.icon}`} style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i></div>
                {item.id}
              </button>
            ))}
          </div>

          {/* AFRICAN & MIDDLE EASTERN */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-purple-dark)", letterSpacing: "0.05em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="ti ti-map-pin" style={{ fontSize: "14px" }}></i> AFRICAN & MIDDLE EASTERN
            </div>
            {[
              { id: "Yoruba", icon: "ti-language" },
              { id: "Igbo", icon: "ti-language" },
              { id: "Twi", icon: "ti-language" },
              { id: "Arabic", icon: "ti-language" }
            ].map(item => (
              <button 
                key={item.id}
                type="button"
                className={`fac-chip ${selectedLangs.includes(item.id) ? "on" : ""}`} 
                onClick={() => toggleLang(item.id)}
              >
                <div className="fac-icon"><i className={`ti ${item.icon}`} style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i></div>
                {item.id}
              </button>
            ))}
          </div>

        </div>

        {/* Custom Language Adder */}
        <div style={{ marginTop: "16px", marginBottom: "16px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--cn-gray)", letterSpacing: "0.03em", marginBottom: "8px" }}>
            ADD A CUSTOM LANGUAGE
          </div>
          <div style={{ display: "flex", gap: "9px" }}>
            <input 
              placeholder="Don't see your language? Type custom language (e.g. Swahili, Korean, Ukrainian)..." 
              style={{ fontSize: "13px", flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--cn-border)" }} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = searchQuery.trim().replace(/(^|\s)(\w)/g, (m, p, c) => p + c.toUpperCase());
                  if (val && !selectedLangs.includes(val)) {
                    setSelectedLangs(prev => [...prev, val]);
                    setError(null);
                  }
                  setSearchQuery("");
                }
              }}
            />
            <button 
              type="button"
              onClick={() => {
                const val = searchQuery.trim().replace(/(^|\s)(\w)/g, (m, p, c) => p + c.toUpperCase());
                if (val && !selectedLangs.includes(val)) {
                  setSelectedLangs(prev => [...prev, val]);
                  setError(null);
                }
                setSearchQuery("");
              }}
              style={{ flexShrink: 0, fontSize: "13px", fontWeight: 700, color: "#fff", background: "var(--cn-purple)", border: "none", padding: "0 18px", borderRadius: "10px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <i className="ti ti-plus" style={{ fontSize: "15px" }}></i> Add
            </button>
          </div>
        </div>

        {/* Selected Languages Pills */}
        {selectedLangs.length > 0 && (
          <div style={{ marginTop: "12px" }}>
            <div id="lang-selected-label" style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-gray)", letterSpacing: "0.05em", marginBottom: "8px" }}>
              SELECTED LANGUAGES ({selectedLangs.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {selectedLangs.map(lang => (
                <div 
                  key={lang} 
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "var(--cn-purple)",
                    color: "#fff",
                    borderRadius: "20px",
                    padding: "6px 12px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                  onClick={() => toggleLang(lang)}
                >
                  <i className="ti ti-check" style={{ fontSize: "12px" }}></i>
                  {lang}
                  <span 
                    style={{
                      background: "rgba(255,255,255,0.25)",
                      borderRadius: "50%",
                      width: "16px",
                      height: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "11px",
                      lineHeight: 1,
                      marginLeft: "2px"
                    }}
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
