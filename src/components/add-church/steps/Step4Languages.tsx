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

  const quickPicks = ["English", "Spanish", "French", "Portuguese", "Yoruba", "Twi", "Mandarin", "Polish"];

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

        <div ref={containerRef} id="f-languages" style={{ position: "relative", marginBottom: "14px" }}>
          <i className="ti ti-search" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "var(--cn-gray-light)", zIndex: 2 }}></i>
          <input 
            placeholder="Search languages..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            style={{ paddingLeft: "42px", border: error && selectedLangs.length === 0 ? "1.5px solid red" : "" }} 
            autoComplete="off"
          />
          {isOpen && (
            <div className="autocomplete-dropdown" style={{ display: "block", maxHeight: "250px", overflowY: "auto" }}>
              {filtered.length === 0 ? (
                <div>
                  <div style={{ padding: "10px 14px", fontSize: "12.5px", color: "var(--cn-gray)", lineHeight: 1.4 }}>
                    No language found for "{searchQuery}" — you can still add it as a custom language below
                  </div>
                  <div 
                    className="autocomplete-item" 
                    onClick={() => {
                      const val = searchQuery.trim().replace(/(^|\s)(\w)/g, (m, p, c) => p + c.toUpperCase());
                      if (val && !selectedLangs.includes(val)) {
                        setSelectedLangs(prev => [...prev, val]);
                        setError(null);
                      }
                      setSearchQuery("");
                      setIsOpen(false);
                    }}
                    style={{ borderTop: "1px solid var(--cn-border)", fontWeight: 600, color: "var(--cn-purple)", display: "flex", alignItems: "center", gap: "8px", padding: "11px 14px" }}
                  >
                    <i className="ti ti-plus" style={{ fontSize: "14px" }}></i> Add "{searchQuery}"
                  </div>
                </div>
              ) : (
                filtered.slice(0, 100).map(lang => {
                  const isAdded = selectedLangs.includes(lang);
                  return (
                    <div 
                      key={lang}
                      onClick={() => {
                        toggleLang(lang);
                        setSearchQuery("");
                        setIsOpen(false);
                      }}
                      className="autocomplete-item"
                      style={{
                        padding: "9px 14px",
                        cursor: "pointer",
                        fontSize: "13px",
                        color: isAdded ? "var(--cn-gray-light)" : "var(--cn-ink)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      {isAdded ? (
                        <i className="ti ti-check" style={{ fontSize: "13px", color: "var(--cn-purple)" }}></i>
                      ) : (
                        <i className="ti ti-language" style={{ fontSize: "13px", color: "var(--cn-gray-light)" }}></i>
                      )}
                      {lang}
                      {isAdded && (
                        <span style={{ marginLeft: "auto", fontSize: "10px", color: "var(--cn-gray-light)" }}>Added</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {selectedLangs.length > 0 && (
          <>
            <div id="lang-selected-label" style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-gray)", letterSpacing: "0.05em", marginBottom: "8px" }}>SELECTED</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "18px" }}>
              {selectedLangs.map(lang => (
                <div 
                  key={lang} 
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "var(--cn-purple)",
                    color: "#fff",
                    borderRadius: "20px",
                    padding: "6px 10px 6px 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                    margin: "3px",
                    cursor: "pointer"
                  }}
                  onClick={() => toggleLang(lang)}
                >
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
                      lineHeight: 1
                    }}
                  >
                    ×
                  </span>
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
