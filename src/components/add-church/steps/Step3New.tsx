import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useFormContext } from "@/context/FormContext";

const ALL_LANGUAGES = ['English','Spanish','French','Portuguese','German','Italian','Dutch','Polish','Romanian','Hungarian','Czech','Slovak','Bulgarian','Serbian','Croatian','Bosnian','Slovenian','Macedonian','Montenegrin','Albanian','Greek','Turkish','Russian','Ukrainian','Belarusian','Lithuanian','Latvian','Estonian','Finnish','Swedish','Norwegian','Danish','Icelandic','Irish','Welsh','Scottish Gaelic','Manx','Cornish','Breton','Catalan','Basque','Galician','Luxembourgish','Frisian','Maltese','Romani','Yiddish','Ladino','Sorbian','Yoruba','Igbo','Hausa','Twi','Ga','Ewe','Fante','Akan','Fula','Wolof','Mandinka','Bambara','Mossi','Krio','Mende','Temne','Kanuri','Tiv','Edo','Efik','Ibibio','Nupe','Kpelle','Dan','Amharic','Tigrinya','Tigre','Oromo','Somali','Afar','Harari','Sidamo','Swahili','Lingala','Kikongo','Tshiluba','Kinyarwanda','Kirundi','Luganda','Runyankole','Acholi','Lango','Ateso','Chichewa','Bemba','Tonga','Lozi','Nyanja','Shona','Ndebele','Zulu','Xhosa','Swazi','Sesotho','Setswana','Sepedi','Tsonga','Venda','Afrikaans','Sango','Berber','Tamazight','Tashelhit','Kabyle','Malagasy','Comorian','Arabic','Hebrew','Aramaic','Kurdish','Sorani','Kurmanji','Farsi','Dari','Pashto','Balochi','Brahui','Luri','Persian','Azerbaijani','Armenian','Georgian','Turkmen','Uzbek','Kazakh','Kyrgyz','Tajik','Uyghur','Mongolian','Tibetan','Dzongkha','Urdu','Punjabi','Saraiki','Sindhi','Gujarati','Marathi','Konkani','Hindi','Bhojpuri','Maithili','Awadhi','Rajasthani','Bengali','Sylheti','Chittagonian','Assamese','Odia','Tamil','Telugu','Kannada','Malayalam','Tulu','Sinhala','Nepali','Newari','Santali','Kashmiri','Dogri','Manipuri','Mizo','Khasi','Bodo','Garo','Naga','Dhivehi','Mandarin','Cantonese','Hakka','Hokkien','Teochew','Shanghainese','Korean','Japanese','Vietnamese','Thai','Lao','Khmer','Burmese','Shan','Karen','Mon','Chin','Kachin','Rohingya','Hmong','Mien','Tagalog','Cebuano','Ilocano','Hiligaynon','Waray','Bikol','Kapampangan','Pangasinan','Maranao','Chavacano','Indonesian','Javanese','Sundanese','Balinese','Minangkabau','Buginese','Madurese','Acehnese','Batak','Malay','Tetum','Maori','Samoan','Tongan','Fijian','Hawaiian','Tahitian','Bislama','Tok Pisin','Hiri Motu','Chamorro','Marshallese','Palauan','Gilbertese','Nauruan','Quechua','Aymara','Guarani','Nahuatl','Maya','Mapudungun','Haitian Creole','Papiamento','Jamaican Patois','Trinidadian Creole','Cape Verdean Creole','Sranan Tongo','Garifuna','Belizean Creole'];

const SOCIAL_RULES: { [key: string]: { rx: RegExp, others: RegExp, name: string, ex: string } } = {
  facebook: { rx: /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com|fb\.me)\/[A-Za-z0-9._\-\/?=&%]+$/i, others: /(instagram\.com|linkedin\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|tiktok\.com|t\.me)/i, name: 'Facebook', ex: 'facebook.com/yourchurch' },
  instagram: { rx: /(^@[A-Za-z0-9._]{2,30}$)|^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9._\-\/?=&%]+$/i, others: /(facebook\.com|linkedin\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|tiktok\.com|t\.me)/i, name: 'Instagram', ex: 'instagram.com/yourchurch or @handle' },
  youtube: { rx: /^(https?:\/\/)?(www\.)?(youtube\.com\/[A-Za-z0-9@._\-\/?=&%]+|youtu\.be\/[A-Za-z0-9\-]+)$/i, others: /(facebook\.com|instagram\.com|linkedin\.com|twitter\.com|x\.com|tiktok\.com|t\.me)/i, name: 'YouTube', ex: 'youtube.com/@yourchurch' },
  twitter: { rx: /(^@[A-Za-z0-9_]{1,15}$)|^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]{1,15}\/?$/i, others: /(facebook\.com|instagram\.com|linkedin\.com|youtube\.com|youtu\.be|tiktok\.com|t\.me)/i, name: 'X / Twitter', ex: 'twitter.com/yourchurch or @handle' },
  tiktok: { rx: /(^@[A-Za-z0-9_.-]{2,24}$)|^(https?:\/\/)?(www\.)?tiktok\.com\/@[A-Za-z0-9_.-]+\/?$/i, others: /(facebook\.com|instagram\.com|linkedin\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|t\.me)/i, name: 'TikTok', ex: 'tiktok.com/@yourchurch or @handle' },
  telegram: { rx: /^(https?:\/\/)?(www\.)?t\.me\/[A-Za-z0-9_]{5,32}\/?$/i, others: /(facebook\.com|instagram\.com|linkedin\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|tiktok\.com)/i, name: 'Telegram', ex: 't.me/yourchurch' },
  linkedin: { rx: /^(https?:\/\/)?(www\.)?linkedin\.com\/[A-Za-z0-9._\-\/?=&%]+$/i, others: /(facebook\.com|instagram\.com|youtube\.com|youtu\.be|twitter\.com|x\.com|tiktok\.com|t\.me)/i, name: 'LinkedIn', ex: 'linkedin.com/company/yourchurch' }
};

const prettyPlatform = (domain: string) => {
  const map: { [key: string]: string } = { 'facebook.com': 'Facebook', 'instagram.com': 'Instagram', 'linkedin.com': 'LinkedIn', 'youtube.com': 'YouTube', 'youtu.be': 'YouTube', 'twitter.com': 'Twitter / X', 'x.com': 'Twitter / X', 'tiktok.com': 'TikTok', 't.me': 'Telegram' };
  return map[domain.toLowerCase()] || domain;
};

const validateSocialUrl = (field: string, value: string): string => {
  let v = value.trim();
  if (/^https?:\/\/(www\.)?(facebook|instagram|youtube|twitter|x|tiktok|linkedin)\.com\/?$/i.test(v) || v === "https://t.me/") {
    return "";
  }
  if (!v) return "";

  const R = SOCIAL_RULES[field];
  if (!R) return "";

  const wrong = R.others.exec(v);
  if (wrong) {
    return `That looks like a ${prettyPlatform(wrong[0])} link — please put your ${R.name} link here.`;
  }
  
  const ok = R.rx.test(v);
  if (!ok) {
    return `Enter a valid ${R.name} link (e.g. ${R.ex}).`;
  }
  
  return "";
};

interface Step3NewProps {
  onBack: () => void;
  onNext: () => void;
}

export default function Step3New({ onBack, onNext }: Step3NewProps) {
  const { formData, updateFormData } = useFormContext();

  // Media
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(formData.logo || null);

  // Lightbox modal state for full-screen preview
  const [lightboxState, setLightboxState] = useState<{ isOpen: boolean; imageSrc: string; title: string }>({
    isOpen: false,
    imageSrc: "",
    title: ""
  });

  const openLightbox = (src: string, title: string) => {
    setLightboxState({ isOpen: true, imageSrc: src, title });
  };

  const closeLightbox = () => {
    setLightboxState({ isOpen: false, imageSrc: "", title: "" });
  };

  // About
  const [description, setDescription] = useState(formData.description || "");
  const [establishedYear, setEstablishedYear] = useState(formData.establishedYear || "");

  // Socials
  const [socialErrors, setSocialErrors] = useState<{ [key: string]: string }>({});

  // Gallery
  const [galleryImages, setGalleryImages] = useState<string[]>(formData.galleryImages || []);

  // Pastor Details
  const pastorPhotoInputRef = useRef<HTMLInputElement>(null);
  const [pastorPhotoPreview, setPastorPhotoPreview] = useState<string | null>(formData.pastorPhoto || formData.pastor_photo || null);
  const [pastorName, setPastorName] = useState(formData.pastorName || formData.pastor_name || "");
  const [pastorBio, setPastorBio] = useState(formData.pastorBio || formData.pastor_bio || "");

  const handlePastorPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        setPastorPhotoPreview(res);
        updateFormData({ pastorPhoto: res, pastor_photo: res });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePastorPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPastorPhotoPreview(null);
    updateFormData({ pastorPhoto: null, pastor_photo: null });
    if (pastorPhotoInputRef.current) pastorPhotoInputRef.current.value = "";
  };

  // Ministries
  const [activeMinistries, setActiveMinistries] = useState<string[]>(formData.ministries?.length ? formData.ministries : ["Youth Ministry", "Children's Church"]);
  const [customMinistry, setCustomMinistry] = useState("");
  const [customMinistriesList, setCustomMinistriesList] = useState<string[]>([]);
  const [customMinMsg, setCustomMinMsg] = useState<{ text: string; type: "success" | "warning" | "" }>({ text: "", type: "" });

  // Languages
  const [selectedLangs, setSelectedLangs] = useState<string[]>(formData.languages?.length ? formData.languages : ["English"]);
  const [langSearchQuery, setLangSearchQuery] = useState("");
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langContainerRef = useRef<HTMLDivElement>(null);
  const quickPicks = ["English", "Spanish", "French", "Portuguese", "Yoruba", "Twi", "Mandarin", "Polish"];

  // Facilities
  const [activeFacilities, setActiveFacilities] = useState<string[]>(formData.facilities || []);

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langContainerRef.current && !langContainerRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Handlers for media
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setPreview: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        updateFormData({ logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogoPreview(null);
    updateFormData({ logo: null });
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handleCoverPhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            newImages.push(reader.result);
            if (newImages.length === files.length) {
              const updated = [...(formData.coverBanners || []), ...newImages];
              updateFormData({ coverBanners: updated });
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeCoverPhoto = (index: number) => {
    const updated = (formData.coverBanners || []).filter((_: any, i: number) => i !== index);
    updateFormData({ coverBanners: updated });
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            newImages.push(reader.result);
            if (newImages.length === files.length) {
              setGalleryImages((prev) => [...prev, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  // AI Description Generator state
  const [aiSampleIndex, setAiSampleIndex] = useState(0);

  const sampleDescriptionTemplates = [
    `Welcome to {churchName}! We are a warm, welcoming {denomination} community dedicated to worshipping God, growing together in faith, and actively serving our local neighborhood. Whether you are searching for a new spiritual home, exploring the Christian faith for the first time, or looking for a vibrant family of believers, you will find an open door and a supportive community here.\n\nOur weekly gatherings feature inspiring Christ-centered preaching, uplifting praise and worship, and engaging ministries for children, youth, and adults of all ages. We invite you to join us this Sunday to experience the transforming love of Jesus and build meaningful connections.`,

    `At {churchName}, our mission as a {denomination} congregation is to live out the Gospel in truth, love, and community. Grounded in biblical teaching and empowered by prayer, we seek to cultivate authentic discipleship and equip every member to fulfill their unique God-given calling.\n\nFrom vibrant Sunday worship services and midweek Bible studies to passionate local outreach programs, there is a place for everyone to belong. Come as you are and discover how faith in Christ can bring real hope, joy, and purpose to your everyday life.`,

    `Rooted in eternal Christian truth, {churchName} is a dynamic {denomination} church passionate about worship, spiritual transformation, and community restoration. We believe that God has called us to be a beacon of light, sharing Christ's unconditional love with people from all walks of life.\n\nWe offer a wide variety of active ministries including children's church, youth fellowship, prayer groups, and local service projects. We look forward to meeting you and walking alongside you as we grow together in grace and faith.`,

    `Welcome to {churchName}, a spirit-filled {denomination} fellowship focused on praising God, building genuine relationships, and impacting our region. Our church family is made up of people from diverse backgrounds brought together by a shared faith in Jesus Christ.\n\nEach service is designed to help you connect deeply with God through powerful worship, practical biblical teaching, and genuine fellowship. Join us this week as we celebrate God's presence and extend His hands of hope to our community.`,

    `At {churchName}, we are a vibrant {denomination} family centered on grace, truth, and intentional Christian discipleship. We strive to create an atmosphere where individuals and families can encounter the presence of God, find true spiritual healing, and grow in their relationship with Jesus Christ.\n\nOur fellowship extends beyond Sunday morning services into small groups, community care projects, and active prayer ministries. No matter where you are on your spiritual journey, you will find encouragement and fellowship here.`,

    `Grounding our hearts in scripture and Christian fellowship, {churchName} stands as a dedicated {denomination} ministry serving our community with compassion and faith. We exist to magnify God through joyful worship and to demonstrate His love through practical service.\n\nWe provide rich opportunities for spiritual growth through comprehensive Bible teaching, inspiring music ministry, and interactive groups for every stage of life. We warmly welcome you to come experience our fellowship this week!`,

    `Driven by hope and anchored in faith, {churchName} is a loving {denomination} congregation devoted to spreading the good news of Jesus Christ. Our heart is to nurture a thriving community where every person feels valued, supported, and spiritually equipped.\n\nThrough inspiring Sunday services, passionate worship, and active community outreach initiatives, we seek to bring glory to God and hope to our neighbors. We would be honored to welcome you into our church family!`
  ];

  // AI Handler
  const handleWriteWithAI = () => {
    const rawDenomination = formData.denomination ? `${formData.denomination}` : "Christian";
    const formattedDenomination = rawDenomination.charAt(0).toUpperCase() + rawDenomination.slice(1);
    const churchName = formData.name || "our church";

    const template = sampleDescriptionTemplates[aiSampleIndex % sampleDescriptionTemplates.length];
    const generated = template
      .replace(/\{denomination\}/g, formattedDenomination)
      .replace(/\{churchName\}/g, churchName);

    setDescription(generated);
    updateFormData({ description: generated });
    setAiSampleIndex((prev) => prev + 1);
  };

  // Social validation
  const validateSocialField = (field: string, val: string) => {
    const err = validateSocialUrl(field, val);
    setSocialErrors(prev => ({ ...prev, [field]: err }));
  };

  // Ministries toggles
  const toggleMinistry = (chip: string) => {
    setActiveMinistries(prev => 
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const addCustomMinistry = () => {
    const val = customMinistry.replace(/\s+/g, ' ').trim().replace(/(^|\s)(\w)/g, (m, p, c) => p + c.toUpperCase());
    if (val.length < 2) {
      setCustomMinMsg({ text: "Type a ministry name to add it.", type: "warning" });
      return;
    }

    const ALL_EXISTING_CHIPS = [
      "Youth Ministry", "Children's Church", "Worship Team", "Ushering", "Technical / Media", 
      "Prayer & Intercession", "Evangelism", "Women's Ministry", "Men's Ministry", "Young Adults", "Marriage & Family",
      "Crèche / Nursery", "Junior Church", "Teen Ministry", "Parent & Toddler", "Seniors Ministry", "Singles Ministry",
      "Food Bank", "Community Café", "Prison Ministry", "Street Ministry",
      "Praise & Worship", "Dance Ministry", "Drama & Theatre", "Choir",
      "Global Missions", "Church Planting", "Evangelism Team", "Local Outreach"
    ];

    const foundStandard = ALL_EXISTING_CHIPS.find(c => c.toLowerCase() === val.toLowerCase());
    
    if (foundStandard) {
      if (!activeMinistries.includes(foundStandard)) {
        setActiveMinistries(prev => [...prev, foundStandard]);
      }
      setCustomMinMsg({ text: `“${foundStandard}” already exists — selected it for you.`, type: "success" });
      setCustomMinistry("");
      setTimeout(() => {
        setCustomMinMsg(prev => prev.text.includes(foundStandard) ? { text: "", type: "" } : prev);
      }, 2500);
      return;
    }

    if (customMinistriesList.some(m => m.toLowerCase() === val.toLowerCase())) {
      setCustomMinMsg({ text: `“${val}” already exists in your ministries.`, type: "success" });
      setCustomMinistry("");
      return;
    }

    setCustomMinistriesList(prev => [...prev, val]);
    setActiveMinistries(prev => [...prev, val]);
    setCustomMinMsg({ text: `Added “${val}” to your ministries.`, type: "success" });
    setCustomMinistry("");

    setTimeout(() => {
      setCustomMinMsg(prev => prev.text.includes(val) ? { text: "", type: "" } : prev);
    }, 2500);
  };

  // Languages toggle
  const toggleLang = (lang: string) => {
    setSelectedLangs(prev => {
      const newLangs = prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang];
      if (newLangs.length > 0) setErrors(prevErr => ({ ...prevErr, languages: "" }));
      return newLangs;
    });
  };

  const getFilteredLanguages = () => {
    const q = langSearchQuery.trim().toLowerCase();
    if (!q) return ALL_LANGUAGES;
    const starts = ALL_LANGUAGES.filter(l => l.toLowerCase().startsWith(q));
    const contains = ALL_LANGUAGES.filter(l => !l.toLowerCase().startsWith(q) && l.toLowerCase().includes(q));
    return [...starts, ...contains];
  };

  // Facilities toggle
  const toggleFacility = (chip: string) => {
    setActiveFacilities(prev => 
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const isFacilitySelected = (chip: string) => activeFacilities.includes(chip);

  // Next Handler
  const handleNext = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate social fields
    const socialFields = ["facebook", "instagram", "youtube", "twitter", "tiktok", "telegram", "linkedin"];
    socialFields.forEach(field => {
      const val = formData[field] || "";
      const err = validateSocialUrl(field, val);
      if (err) newErrors[field] = err;
    });

    if (selectedLangs.length === 0) {
      newErrors.languages = "Please select at least one language";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorId = Object.keys(newErrors)[0];
      setTimeout(() => {
        const el = document.getElementById(`f-${firstErrorId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
      return;
    }

    updateFormData({
      description,
      establishedYear,
      galleryImages,
      pastorPhoto: pastorPhotoPreview,
      pastor_photo: pastorPhotoPreview,
      pastorName,
      pastor_name: pastorName,
      pastorBio,
      pastor_bio: pastorBio,
      ministries: Array.from(new Set([...activeMinistries, ...customMinistriesList])),
      languages: selectedLangs,
      facilities: activeFacilities,
    });

    onNext();
  };

  return (
    <div className="step-content slide-up">
      {/* MEDIA SECTION */}
      <div className="scard">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,#c084fc,#9333ea)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-photo" style={{ fontSize: "18px", color: "#fff" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Logo & Cover Photos</div>
        </div>

        {/* Finalized Media Layout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Row 1: Logo */}
          <div style={{ border: "1.5px solid var(--cn-border)", borderRadius: "14px", padding: "16px", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: logoPreview ? "12px" : "0" }}>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--cn-ink)" }}>1. Church Logo</div>
                <div style={{ fontSize: "11.5px", color: "var(--cn-gray)", marginTop: "2px" }}>Upload official high-resolution brand logo</div>
              </div>

              <div>
                <label 
                  style={{ 
                    height: "36px", 
                    padding: "0 16px", 
                    borderRadius: "10px", 
                    fontSize: "12px", 
                    fontWeight: 700, 
                    color: "#fff", 
                    background: "#7e22ce", 
                    cursor: "pointer", 
                    display: "inline-flex", 
                    alignItems: "center", 
                    justifyContent: "center" 
                  }}
                >
                  {logoPreview ? "Change Logo" : "Upload Logo"}
                  <input type="file" ref={logoInputRef} onChange={(e) => handleImageUpload(e, setLogoPreview)} accept="image/*" style={{ display: "none" }} />
                </label>
              </div>
            </div>

            {logoPreview && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                <div 
                  onClick={() => openLightbox(logoPreview, "Church Logo")}
                  style={{ width: "110px", height: "70px", borderRadius: "10px", background: `#f8fafc url(${logoPreview}) center/contain no-repeat`, position: "relative", border: "1px solid var(--cn-border)", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", cursor: "pointer" }}
                  title="Click to view full image"
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeLogo(e); }} 
                    style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "18px", height: "18px", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Row 2: Cover Photos */}
          <div style={{ border: "1.5px solid var(--cn-border)", borderRadius: "14px", padding: "16px", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: (formData.coverBanners || []).length > 0 ? "12px" : "0" }}>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--cn-ink)" }}>2. Cover Banners</div>
                <div style={{ fontSize: "11.5px", color: "var(--cn-gray)", marginTop: "2px" }}>Landscape photos for main header banner</div>
              </div>
              <label style={{ height: "36px", padding: "0 16px", background: "var(--cn-surface)", border: "1.5px solid var(--cn-border)", color: "var(--cn-ink)", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                Add Photos
                <input type="file" accept="image/*" multiple onChange={handleCoverPhotosUpload} style={{ display: "none" }} />
              </label>
            </div>

            {(formData.coverBanners || []).length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                {(formData.coverBanners || []).map((img: string, i: number) => (
                  <div 
                    key={i} 
                    onClick={() => openLightbox(img, `Cover Banner ${i + 1}`)}
                    style={{ width: "110px", height: "70px", borderRadius: "10px", background: `url(${img}) center/cover`, position: "relative", border: "1px solid var(--cn-border)", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", cursor: "pointer" }}
                    title="Click to view full image"
                  >
                    <button onClick={(e) => { e.stopPropagation(); removeCoverPhoto(i); }} style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "18px", height: "18px", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Row 3: Photo Gallery */}
          <div style={{ border: "1.5px solid var(--cn-border)", borderRadius: "14px", padding: "16px", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: galleryImages.length > 0 ? "12px" : "0" }}>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--cn-ink)" }}>3. Photo Gallery</div>
                <div style={{ fontSize: "11.5px", color: "var(--cn-gray)", marginTop: "2px" }}>Sanctuary, events, ministries & community</div>
              </div>
              <label style={{ height: "36px", padding: "0 16px", background: "var(--cn-surface)", border: "1.5px solid var(--cn-border)", color: "var(--cn-ink)", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                Add Photos
                <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} style={{ display: "none" }} />
              </label>
            </div>

            {galleryImages.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                {galleryImages.map((img: string, i: number) => (
                  <div 
                    key={i} 
                    onClick={() => openLightbox(img, `Gallery Photo ${i + 1}`)}
                    style={{ width: "110px", height: "70px", borderRadius: "10px", background: `url(${img}) center/cover`, position: "relative", border: "1px solid var(--cn-border)", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", cursor: "pointer" }}
                    title="Click to view full image"
                  >
                    <button onClick={(e) => { e.stopPropagation(); removeGalleryImage(i); }} style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "18px", height: "18px", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PASTOR / LEADERSHIP SECTION */}
      <div className="scard">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,#6366f1,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-user-check" style={{ fontSize: "18px", color: "#fff" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Pastor / Leadership</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Pastor Photo */}
          <div>
            <label style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "8px", display: "block" }}>
              Pastor Photo
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {pastorPhotoPreview ? (
                <div style={{ position: "relative", width: "72px", height: "72px" }}>
                  <img 
                    src={pastorPhotoPreview} 
                    alt="Pastor Photo" 
                    onClick={() => openLightbox(pastorPhotoPreview, "Pastor Photo")}
                    style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover", border: "2px solid #7c3aed", cursor: "pointer" }} 
                  />
                  <button 
                    onClick={removePastorPhoto} 
                    style={{ position: "absolute", top: "-4px", right: "-4px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#f1f5f9", border: "2px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                  <i className="ti ti-user" style={{ fontSize: "28px" }}></i>
                </div>
              )}

              <label style={{ height: "36px", padding: "0 16px", background: "var(--cn-surface)", border: "1.5px solid var(--cn-border)", color: "var(--cn-ink)", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <i className="ti ti-upload" style={{ fontSize: "14px" }}></i>
                {pastorPhotoPreview ? "Change Photo" : "Upload Photo"}
                <input type="file" ref={pastorPhotoInputRef} accept="image/*" onChange={handlePastorPhotoUpload} style={{ display: "none" }} />
              </label>
            </div>
          </div>

          {/* Pastor Name */}
          <div>
            <label style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "6px", display: "block" }}>
              Pastor Name
            </label>
            <input 
              type="text"
              placeholder="e.g. Pastor James Okafor"
              value={pastorName}
              onChange={(e) => {
                const val = e.target.value;
                setPastorName(val);
                updateFormData({ pastorName: val, pastor_name: val });
              }}
            />
          </div>

          {/* Brief Intro */}
          <div>
            <label style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--cn-ink)", marginBottom: "6px", display: "block" }}>
              Brief Intro
            </label>
            <textarea 
              value={pastorBio}
              onChange={(e) => {
                const val = e.target.value;
                setPastorBio(val);
                updateFormData({ pastorBio: val, pastor_bio: val });
              }}
              style={{ minHeight: "100px", resize: "vertical", width: "100%", padding: "12px 14px", borderRadius: "12px", border: "1.5px solid var(--cn-border)", fontSize: "13.5px", lineHeight: "1.5", outline: "none", fontFamily: "inherit" }}
              placeholder="A brief intro about your pastor's background, calling, and heart for ministry..."
            ></textarea>
          </div>
        </div>
      </div>

      {/* ABOUT YOUR CHURCH */}
      <div className="scard">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-file-text" style={{ fontSize: "18px", color: "#fff" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>About Your Church</div>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label>Established Year</label>
          <input 
            type="number"
            placeholder="e.g. 1998" 
            value={establishedYear}
            onChange={(e) => setEstablishedYear(e.target.value)}
          />
        </div>

        <label>Church Description</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ minHeight: "220px", resize: "vertical", marginBottom: "12px", width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1.5px solid var(--cn-border)", fontSize: "14px", lineHeight: "1.55", outline: "none", fontFamily: "inherit" }} 
          placeholder="Tell people about your church — vision, community, what to expect when they visit..."
        ></textarea>
        
        <button 
          onClick={handleWriteWithAI} 
          style={{ background: "#f5f3ff", border: "1.5px solid #ede9fe", color: "var(--cn-purple-dark)", borderRadius: "10px", padding: "9px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <i className="ti ti-sparkles" style={{ fontSize: "14px" }}></i> Generate Description
        </button>
      </div>

      {/* SOCIAL MEDIA */}
      <div className="scard">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,#6366f1,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-share" style={{ fontSize: "18px", color: "#fff" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Social Media Links</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "18px", height: "18px", borderRadius: "5px", background: "#1877f2", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-brand-facebook" style={{ fontSize: "11px", color: "#fff" }}></i>
              </span> Facebook
            </label>
            <input 
              id="f-facebook"
              placeholder="facebook.com/yourchurch" 
              value={formData.facebook || ""}
              onFocus={() => { if (!formData.facebook) updateFormData({ facebook: "https://facebook.com/" }); }}
              onChange={(e) => {
                const val = e.target.value;
                updateFormData({ facebook: val });
                validateSocialField("facebook", val);
              }}
            />
            {socialErrors.facebook && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{socialErrors.facebook}</div>
            )}
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "18px", height: "18px", borderRadius: "5px", background: "#e1306c", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-brand-instagram" style={{ fontSize: "11px", color: "#fff" }}></i>
              </span> Instagram
            </label>
            <input 
              id="f-instagram"
              placeholder="instagram.com/yourchurch or @handle" 
              value={formData.instagram || ""}
              onFocus={() => { if (!formData.instagram) updateFormData({ instagram: "https://instagram.com/" }); }}
              onChange={(e) => {
                const val = e.target.value;
                updateFormData({ instagram: val });
                validateSocialField("instagram", val);
              }}
            />
            {socialErrors.instagram && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{socialErrors.instagram}</div>
            )}
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "18px", height: "18px", borderRadius: "5px", background: "#ff0000", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-brand-youtube" style={{ fontSize: "11px", color: "#fff" }}></i>
              </span> YouTube
            </label>
            <input 
              id="f-youtube"
              placeholder="youtube.com/c/yourchurch" 
              value={formData.youtube || ""}
              onFocus={() => { if (!formData.youtube) updateFormData({ youtube: "https://youtube.com/" }); }}
              onChange={(e) => {
                const val = e.target.value;
                updateFormData({ youtube: val });
                validateSocialField("youtube", val);
              }}
            />
            {socialErrors.youtube && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{socialErrors.youtube}</div>
            )}
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "18px", height: "18px", borderRadius: "5px", background: "#000", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-brand-x" style={{ fontSize: "11px", color: "#fff" }}></i>
              </span> X / Twitter
            </label>
            <input 
              id="f-twitter"
              placeholder="@yourchurch" 
              value={formData.twitter || ""}
              onFocus={() => { if (!formData.twitter) updateFormData({ twitter: "https://twitter.com/" }); }}
              onChange={(e) => {
                const val = e.target.value;
                updateFormData({ twitter: val });
                validateSocialField("twitter", val);
              }}
            />
            {socialErrors.twitter && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{socialErrors.twitter}</div>
            )}
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "18px", height: "18px", borderRadius: "5px", background: "#e91e8c", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-brand-tiktok" style={{ fontSize: "11px", color: "#fff" }}></i>
              </span> TikTok
            </label>
            <input 
              id="f-tiktok"
              placeholder="@yourchurch" 
              value={formData.tiktok || ""}
              onFocus={() => { if (!formData.tiktok) updateFormData({ tiktok: "https://tiktok.com/@" }); }}
              onChange={(e) => {
                const val = e.target.value;
                updateFormData({ tiktok: val });
                validateSocialField("tiktok", val);
              }}
            />
            {socialErrors.tiktok && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{socialErrors.tiktok}</div>
            )}
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "18px", height: "18px", borderRadius: "5px", background: "#26a5e4", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <i className="ti ti-brand-telegram" style={{ fontSize: "11px", color: "#fff" }}></i>
              </span> Telegram
            </label>
            <input 
              id="f-telegram"
              placeholder="t.me/yourchurch" 
              value={formData.telegram || ""}
              onFocus={() => { if (!formData.telegram) updateFormData({ telegram: "https://t.me/" }); }}
              onChange={(e) => {
                const val = e.target.value;
                updateFormData({ telegram: val });
                validateSocialField("telegram", val);
              }}
            />
            {socialErrors.telegram && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{socialErrors.telegram}</div>
            )}
          </div>
        </div>
      </div>

      {/* MINISTRIES & OUTREACH */}
      <div className="scard">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,#fb7185,#be123c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-heart-handshake" style={{ fontSize: "18px", color: "#fff" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Ministries & outreach</div>
        </div>

        {formData.denomination && (
          <div className="ai-bubble" style={{ marginBottom: "16px" }}>
            <div className="ai-icon"><i className="ti ti-sparkles" style={{ fontSize: "15px", color: "#fff" }}></i></div>
            <div style={{ fontSize: "13px", color: "var(--cn-ink)", paddingTop: "3px" }}>
              Based on <strong>{formData.denomination}</strong> denomination — we've pre-selected the most common ministries for you
            </div>
          </div>
        )}

        <div id="ministry-chips" style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
          {[
            { name: "Youth Ministry", icon: "ti-users" },
            { name: "Children's Church", icon: "ti-baby-carriage" },
            { name: "Food Bank", icon: "ti-bread" },
            { name: "Bible Study", icon: "ti-book" },
            { name: "Outreach", icon: "ti-heart-handshake" },
            { name: "Worship Team", icon: "ti-music" },
            { name: "Ushering", icon: "ti-user-check" },
            { name: "Prayer & Intercession", icon: "ti-sparkles" },
            { name: "Evangelism", icon: "ti-speakerphone" },
            { name: "Women's Ministry", icon: "ti-woman" },
            { name: "Men's Ministry", icon: "ti-man" },
            { name: "Young Adults", icon: "ti-user" },
            { name: "Marriage & Family", icon: "ti-ring" }
          ].map(m => (
            <button 
              key={m.name} 
              className={`chip ${activeMinistries.includes(m.name) ? "on" : ""}`}
              onClick={() => toggleMinistry(m.name)}
              style={{ display: "inline-flex", cursor: "pointer" }}
            >
              <i className={`ti ${m.icon}`} style={{ fontSize: "12px" }}></i> {m.name}
            </button>
          ))}
          {customMinistriesList.map(m => (
            <button key={m} className={`chip ${activeMinistries.includes(m) ? "on" : ""}`} onClick={() => toggleMinistry(m)}>
              <i className="ti ti-plus" style={{ fontSize: "12px" }}></i> {m}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "9px", marginBottom: "16px" }}>
          <input 
            placeholder="Don't see yours? Type a custom ministry — e.g. Prison Ministry" 
            value={customMinistry}
            onChange={(e) => setCustomMinistry(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomMinistry(); } }}
            style={{ fontSize: "13px", flex: 1 }}
          />
          <button 
            onClick={addCustomMinistry} 
            style={{ flexShrink: 0, fontSize: "13px", fontWeight: 700, color: "#fff", background: "var(--cn-purple)", border: "none", padding: "0 18px", borderRadius: "11px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <i className="ti ti-plus" style={{ fontSize: "15px" }}></i> Add
          </button>
        </div>

        {customMinMsg.text && (
          <div style={{ fontSize: "12px", color: customMinMsg.type === "success" ? "#16a34a" : "#d97706", marginBottom: "12px" }}>
            {customMinMsg.text}
          </div>
        )}

        <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: "14px", padding: "14px 16px", display: "flex", gap: "9px", alignItems: "flex-start" }}>
          <i className="ti ti-eye" style={{ fontSize: "16px", color: "#d97706", flexShrink: 0, marginTop: "1px" }}></i>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e", marginBottom: "3px" }}>More details = more visibility</div>
            <div style={{ fontSize: "12px", color: "#78350f", lineHeight: 1.6 }}>Listings with service times, ministries and languages get <strong>4× more profile visits</strong> than incomplete listings.</div>
          </div>
        </div>
      </div>

      {/* LANGUAGES */}
      <div className="scard" style={{ overflow: "visible" }} id="f-languages">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,#a855f7,#7e22ce)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-language" style={{ fontSize: "18px", color: "#fff" }}></i>
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Languages Spoken</div>
            <div style={{ fontSize: "12.5px", color: "var(--cn-gray)", marginTop: "2px" }}>Select languages services are held in or interpreted into</div>
          </div>
        </div>

        {/* Quick Picks */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-gray)", letterSpacing: "0.05em", marginBottom: "8px" }}>POPULAR LANGUAGES</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {quickPicks.map(lang => {
              const isSel = selectedLangs.includes(lang);
              return (
                <button 
                  key={lang} 
                  type="button"
                  onClick={() => toggleLang(lang)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    border: isSel ? "1.5px solid #7e22ce" : "1.5px solid var(--cn-border)",
                    background: isSel ? "#f3e8ff" : "#fff",
                    color: isSel ? "#7e22ce" : "var(--cn-ink)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  {isSel && <i className="ti ti-check" style={{ fontSize: "13px", color: "#7e22ce" }}></i>}
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", marginBottom: "14px" }} ref={langContainerRef}>
          <i className="ti ti-search" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "var(--cn-gray)" }}></i>
          <input 
            placeholder="Search 250+ languages (e.g. Yoruba, Swahili, Mandarin)..." 
            value={langSearchQuery}
            onChange={(e) => {
              setLangSearchQuery(e.target.value);
              setIsLangDropdownOpen(true);
            }}
            onFocus={() => setIsLangDropdownOpen(true)}
            style={{ 
              paddingLeft: "40px", 
              fontSize: "13.5px",
              height: "44px",
              borderRadius: "12px",
              border: errors.languages && selectedLangs.length === 0 ? "1.5px solid red" : "1.5px solid var(--cn-border)" 
            }}
            autoComplete="off"
          />

          {isLangDropdownOpen && (
            <div className="autocomplete-dropdown" style={{ display: "block", maxHeight: "220px", overflowY: "auto", borderRadius: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>
              {getFilteredLanguages().length === 0 ? (
                <div>
                  <div style={{ padding: "10px 14px", fontSize: "12.5px", color: "var(--cn-gray)" }}>
                    No exact match for "{langSearchQuery}"
                  </div>
                  <div 
                    className="autocomplete-item" 
                    onClick={() => {
                      const val = langSearchQuery.trim().replace(/(^|\s)(\w)/g, (m, p, c) => p + c.toUpperCase());
                      if (val && !selectedLangs.includes(val)) {
                        toggleLang(val);
                      }
                      setLangSearchQuery("");
                      setIsLangDropdownOpen(false);
                    }}
                    style={{ borderTop: "1px solid var(--cn-border)", fontWeight: 600, color: "#7e22ce", display: "flex", alignItems: "center", gap: "8px", padding: "11px 14px", cursor: "pointer" }}
                  >
                    <i className="ti ti-plus" style={{ fontSize: "14px" }}></i> Add "{langSearchQuery}" as custom language
                  </div>
                </div>
              ) : (
                getFilteredLanguages().slice(0, 80).map(lang => {
                  const isAdded = selectedLangs.includes(lang);
                  return (
                    <div 
                      key={lang}
                      onClick={() => {
                        toggleLang(lang);
                        setLangSearchQuery("");
                        setIsLangDropdownOpen(false);
                      }}
                      className="autocomplete-item"
                      style={{
                        padding: "10px 14px",
                        cursor: "pointer",
                        fontSize: "13.5px",
                        fontWeight: isAdded ? 600 : 400,
                        color: isAdded ? "#7e22ce" : "var(--cn-ink)",
                        background: isAdded ? "#faf5ff" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <span>{lang}</span>
                      {isAdded && <i className="ti ti-check" style={{ fontSize: "14px", color: "#7e22ce" }}></i>}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Selected Languages Pills */}
        {selectedLangs.length > 0 && (
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-gray)", letterSpacing: "0.05em", marginBottom: "8px" }}>SELECTED LANGUAGES ({selectedLangs.length})</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {selectedLangs.map(lang => (
                <span 
                  key={lang} 
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#7e22ce",
                    color: "#fff",
                    borderRadius: "20px",
                    padding: "6px 12px",
                    fontSize: "13px",
                    fontWeight: 600
                  }}
                >
                  {lang}
                  <i 
                    className="ti ti-x" 
                    onClick={() => toggleLang(lang)}
                    style={{ cursor: "pointer", fontSize: "12px", opacity: 0.8 }}
                  ></i>
                </span>
              ))}
            </div>
          </div>
        )}

        {errors.languages && (
          <div style={{ color: "red", fontSize: "12px", marginTop: "8px" }}>{errors.languages}</div>
        )}
      </div>

      {/* FACILITIES */}
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
                className={`fac-chip ${isFacilitySelected(item.id) ? "on" : ""}`} 
                onClick={() => toggleFacility(item.id)}
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
                className={`fac-chip ${isFacilitySelected(item.id) ? "on" : ""}`} 
                onClick={() => toggleFacility(item.id)}
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
                className={`fac-chip ${isFacilitySelected(item.id) ? "on" : ""}`} 
                onClick={() => toggleFacility(item.id)}
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
                className={`fac-chip ${isFacilitySelected(item.id) ? "on" : ""}`} 
                onClick={() => toggleFacility(item.id)}
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
          <i className="ti ti-arrow-left" style={{ fontSize: "14px" }}></i> Back
        </button>
        <button onClick={handleNext} className="btn-primary">
          Review Listing <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
        </button>
      </div>

      {/* LIGHTBOX MODAL OVERLAY (Portal mounted on document.body) */}
      {lightboxState.isOpen && typeof window !== "undefined" && createPortal(
        <div 
          onClick={closeLightbox}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(15, 23, 42, 0.88)",
            backdropFilter: "blur(6px)",
            zIndex: 9999999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
            cursor: "pointer"
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              background: "#fff",
              borderRadius: "16px",
              padding: "16px 20px 20px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "default"
            }}
          >
            <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", gap: "20px" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--cn-ink)" }}>{lightboxState.title}</div>
              <button 
                onClick={closeLightbox}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "15px",
                  color: "#64748b",
                  transition: "all 0.15s"
                }}
              >
                ✕
              </button>
            </div>
            {lightboxState.imageSrc && (
              <img 
                src={lightboxState.imageSrc} 
                alt={lightboxState.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  borderRadius: "10px",
                  objectFit: "contain",
                  display: "block"
                }}
              />
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
