"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/layout/TopNav";
import StepBarWL from "@/components/onboarding/worship-leader/StepBarWL";
import SharedAddressField from "@/components/add-church/steps/SharedAddressField";

const ALL_LANGUAGES = [
  'English','Spanish','French','Portuguese','German','Italian','Dutch','Polish','Romanian','Hungarian',
  'Czech','Slovak','Bulgarian','Serbian','Croatian','Bosnian','Slovenian','Macedonian','Montenegrin','Albanian',
  'Greek','Turkish','Russian','Ukrainian','Belarusian','Lithuanian','Latvian','Estonian','Finnish','Swedish',
  'Norwegian','Danish','Icelandic','Irish','Welsh','Scottish Gaelic','Manx','Cornish','Breton','Catalan',
  'Basque','Galician','Luxembourgish','Frisian','Maltese','Romani','Yiddish','Ladino','Sorbian','Yoruba',
  'Igbo','Hausa','Twi','Ga','Ewe','Fante','Akan','Fula','Wolof','Mandinka',
  'Bambara','Mossi','Krio','Mende','Temne','Kanuri','Tiv','Edo','Efik','Ibibio',
  'Nupe','Kpelle','Dan','Amharic','Tigrinya','Tigre','Oromo','Somali','Afar','Harari',
  'Sidamo','Swahili','Lingala','Kikongo','Tshiluba','Kinyarwanda','Kirundi','Luganda','Runyankole','Acholi',
  'Lango','Ateso','Chichewa','Bemba','Tonga','Lozi','Nyanja','Shona','Ndebele','Zulu',
  'Xhosa','Swazi','Sesotho','Setswana','Sepedi','Tsonga','Venda','Afrikaans','Sango','Berber',
  'Tamazight','Tashelhit','Kabyle','Malagasy','Comorian','Arabic','Hebrew','Aramaic','Kurdish','Sorani',
  'Kurmanji','Farsi','Dari','Pashto','Balochi','Brahui','Luri','Persian','Azerbaijani','Armenian',
  'Georgian','Turkmen','Uzbek','Kazakh','Kyrgyz','Tajik','Uyghur','Mongolian','Tibetan','Dzongkha',
  'Urdu','Punjabi','Saraiki','Sindhi','Gujarati','Marathi','Konkani','Hindi','Bhojpuri','Maithili',
  'Awadhi','Rajasthani','Bengali','Sylheti','Chittagonian','Assamese','Odia','Tamil','Telugu','Kannada',
  'Malayalam','Tulu','Sinhala','Nepali','Newari','Santali','Kashmiri','Dogri','Manipuri','Mizo',
  'Khasi','Bodo','Garo','Naga','Dhivehi','Mandarin','Cantonese','Hakka','Hokkien','Teochew',
  'Shanghainese','Korean','Japanese','Vietnamese','Thai','Lao','Khmer','Burmese','Shan','Karen',
  'Mon','Chin','Kachin','Rohingya','Hmong','Mien','Tagalog','Cebuano','Ilocano','Hiligaynon',
  'Waray','Bikol','Kapampangan','Pangasinan','Maranao','Chavacano','Indonesian','Javanese','Sundanese','Balinese',
  'Minangkabau','Buginese','Madurese','Acehnese','Batak','Malay','Tetum','Maori','Samoan','Tongan',
  'Fijian','Hawaiian','Tahitian','Bislama','Tok Pisin','Hiri Motu','Chamorro','Marshallese','Palauan','Gilbertese',
  'Nauruan','Quechua','Aymara','Guarani','Nahuatl','Maya','Mapudungun','Haitian Creole','Papiamento','Jamaican Patois',
  'Trinidadian Creole','Cape Verdean Creole','Sranan Tongo','Garifuna','Belizean Creole'
];

export default function WorshipLeaderOnboardingPage({ initialEditSlug }: { initialEditSlug?: string }) {
  const router = useRouter();
  const isEditMode = !!initialEditSlug;

  // Multi-step state: 1 = Basics & Contact, 2 = Sound & Availability, 3 = Media & Links, 4 = Review & Publish
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [toastMsg, setToastMsg] = useState("");
  const [loadingEditData, setLoadingEditData] = useState<boolean>(isEditMode);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [currentPublishStep, setCurrentPublishStep] = useState(0);

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // ---------------- STEP 1: BASICS & CONTACT ----------------
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [postcode, setPostcode] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetails, setAddressDetails] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [yearsLeading, setYearsLeading] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [coverPreview, setCoverPreview] = useState<string>("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ---------------- STEP 2: SOUND & AVAILABILITY ----------------
  const [styles, setStyles] = useState<string[]>([]);
  const [instruments, setInstruments] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [availableFor, setAvailableFor] = useState<string[]>([]);
  const [feeModel, setFeeModel] = useState<string[]>([]);
  const [travelRange, setTravelRange] = useState("UK-wide");
  const [leadTime, setLeadTime] = useState("2 weeks preferred");

  // Options & Custom entries
  const [styleOptions, setStyleOptions] = useState<string[]>([
    "Contemporary", "Gospel", "Afro-Gospel", "Hymns", "Acoustic", "Prophetic", "Spontaneous"
  ]);
  const [instrumentOptions, setInstrumentOptions] = useState<string[]>([
    "Vocals", "Piano", "Acoustic guitar", "Electric guitar", "Bass", "Drums", "Keys"
  ]);
  const [availableOptions, setAvailableOptions] = useState<string[]>([
    "Sundays", "Events & conferences", "Worship nights", "Recordings", "Online / livestream", "Dep / cover"
  ]);
  const [feeOptions, setFeeOptions] = useState<string[]>([
    "Love offering", "Fixed fee", "Fee on request", "Expenses only"
  ]);

  // Custom addition states
  const [customStyle, setCustomStyle] = useState("");
  const [customInstrument, setCustomInstrument] = useState("");
  const [customAvailable, setCustomAvailable] = useState("");
  const [customFee, setCustomFee] = useState("");

  // Languages search & selection state (matching church onboarding Step4Languages)
  const [langSearchQuery, setLangSearchQuery] = useState("");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langContainerRef = useRef<HTMLDivElement>(null);
  const quickPickLanguages = ["English", "Spanish", "French", "Portuguese", "German", "Mandarin", "Arabic", "Hindi"];

  // Click outside listener for language dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langContainerRef.current && !langContainerRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch existing leader data when in edit mode
  useEffect(() => {
    if (!initialEditSlug) return;
    let isCancelled = false;

    async function loadLeader() {
      try {
        setLoadingEditData(true);
        const res = await fetch(`/api/worship-leaders/${initialEditSlug}`);
        if (!res.ok) throw new Error("Could not find worship leader profile");
        const json = await res.json();
        const leader = json.leader;
        if (!leader || isCancelled) return;

        // Step 1 basics
        setDisplayName(leader.display_name || "");
        setTagline(leader.tagline || "");
        setCountry(leader.country || "United Kingdom");
        setCity(leader.city || "");
        setYearsLeading(leader.years_leading ? String(leader.years_leading) : "");
        setBio(leader.bio || "");
        if (leader.avatar_url) setAvatarPreview(leader.avatar_url);
        if (leader.cover_photo_urls && leader.cover_photo_urls[0]) {
          setCoverPreview(leader.cover_photo_urls[0]);
        }

        // Step 2 tags & availability
        const tags: any[] = leader.tags || [];
        const sTags = tags.filter(t => t.category === "style").map(t => t.label);
        const iTags = tags.filter(t => t.category === "instrument").map(t => t.label);
        const lTags = tags.filter(t => t.category === "language").map(t => t.label);
        const aTags = tags.filter(t => t.category === "available_for").map(t => t.label);
        const fTags = tags.filter(t => t.category === "fee_model").map(t => t.label);

        if (sTags.length) setStyles(sTags);
        if (iTags.length) setInstruments(iTags);
        if (lTags.length) setLanguages(lTags);
        if (aTags.length) setAvailableFor(aTags);
        if (fTags.length) setFeeModel(fTags);
        if (leader.travel_range) setTravelRange(leader.travel_range);
        if (leader.lead_time) setLeadTime(leader.lead_time);

        // Step 3 links
        const loadedLinks: string[] = [];
        if (leader.spotify_url) loadedLinks.push(leader.spotify_url);
        if (leader.youtube_url) loadedLinks.push(leader.youtube_url);
        if (leader.instagram_url) loadedLinks.push(leader.instagram_url);
        if (leader.website_url) {
          const splitWeb = leader.website_url.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean);
          loadedLinks.push(...splitWeb);
        }
        if (loadedLinks.length > 0) {
          setLinks(loadedLinks);
        }
      } catch (e: any) {
        console.error("Error loading worship leader for edit:", e);
        setToastMsg("⚠️ Failed to load existing profile: " + e.message);
      } finally {
        if (!isCancelled) setLoadingEditData(false);
      }
    }

    loadLeader();
    return () => {
      isCancelled = true;
    };
  }, [initialEditSlug]);

  // ---------------- STEP 3: MEDIA & LINKS ----------------
  const [songFiles, setSongFiles] = useState<{ file: File; name: string }[]>([]);
  const [videoFiles, setVideoFiles] = useState<{ file: File; name: string }[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [links, setLinks] = useState<string[]>([""]);

  const toggleChip = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setAvatarPreview("");
    setAvatarFile(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCoverPreview("");
    setCoverFile(null);
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  // Helper for adding custom items to any category
  const addCustomItem = (
    val: string,
    setVal: (v: string) => void,
    options: string[],
    setOptions: React.Dispatch<React.SetStateAction<string[]>>,
    selectedList: string[],
    setSelectedList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const trimmed = val.trim().replace(/\s+/g, ' ').replace(/(^|\s)(\w)/g, (m, p, c) => p + c.toUpperCase());
    if (!trimmed) return;

    if (!options.includes(trimmed)) {
      setOptions(prev => [...prev, trimmed]);
    }
    if (!selectedList.includes(trimmed)) {
      setSelectedList(prev => [...prev, trimmed]);
    }
    setVal("");
  };

  const getFilteredLanguages = () => {
    const q = langSearchQuery.trim().toLowerCase();
    if (!q) return ALL_LANGUAGES;
    const starts = ALL_LANGUAGES.filter(l => l.toLowerCase().startsWith(q));
    const contains = ALL_LANGUAGES.filter(l => !l.toLowerCase().startsWith(q) && l.toLowerCase().includes(q));
    return [...starts, ...contains];
  };

  const addLinkInput = () => {
    setLinks(prev => [...prev, ""]);
  };

  const updateLink = (index: number, value: string) => {
    setLinks(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const removeLink = (index: number) => {
    setLinks(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.length === 0 ? [""] : filtered;
    });
  };

  // Sample data loader matching Church Listing format
  const handleLoadSampleData = () => {
    if (currentStep === 1) {
      setDisplayName("David Okonkwo");
      setTagline("Contemporary & Afro-Gospel Worship Leader, Songwriter & Producer");
      setCountry("United Kingdom");
      setCity("London");
      setArea("Mayfair");
      setPostcode("W1J 7NT");
      setAddress("Westminster, London, UK");
      setAddressDetails("Flat 12, Victoria Mansions");
      setLatitude(51.4995);
      setLongitude(-0.1338);
      setYearsLeading("12");
      setBio("David is a passionate worship leader and songwriter with over 12 years of leading congregations in deep, spirit-led atmospheres of worship across the UK and internationally.");
      setAvatarPreview("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80");
      setCoverPreview("https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop");
      setToastMsg("✨ Sample basics & bio loaded for Step 1!");
    } else if (currentStep === 2) {
      setStyles(["Contemporary", "Gospel", "Afro-Gospel", "Acoustic"]);
      setInstruments(["Vocals", "Acoustic guitar", "Piano"]);
      setLanguages(["English", "Yoruba"]);
      setAvailableFor(["Sundays", "Events & conferences", "Worship nights"]);
      setFeeModel(["Fixed fee", "Love offering"]);
      setTravelRange("UK-wide");
      setLeadTime("2 weeks preferred");
      setToastMsg("✨ Sample sound & availability loaded for Step 2!");
    } else if (currentStep === 3) {
      setLinks([
        "https://open.spotify.com/artist/davidokonkwo",
        "https://youtube.com/@davidokonkwo_worship",
        "https://instagram.com/davidokonkwo_live"
      ]);
      setToastMsg("✨ Sample streaming & media links loaded for Step 3!");
    } else {
      // Step 4 (Review): populate everything
      setDisplayName("David Okonkwo");
      setTagline("Contemporary & Afro-Gospel Worship Leader, Songwriter & Producer");
      setCountry("United Kingdom");
      setCity("London");
      setArea("Mayfair");
      setPostcode("W1J 7NT");
      setAddress("Westminster, London, UK");
      setAddressDetails("Flat 12, Victoria Mansions");
      setYearsLeading("12");
      setBio("David is a passionate worship leader and songwriter with over 12 years of leading congregations across the UK.");
      setAvatarPreview("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80");
      setCoverPreview("https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop");
      setStyles(["Contemporary", "Gospel", "Afro-Gospel"]);
      setInstruments(["Vocals", "Acoustic guitar", "Piano"]);
      setLanguages(["English", "Yoruba"]);
      setAvailableFor(["Sundays", "Events & conferences", "Worship nights"]);
      setFeeModel(["Fixed fee", "Love offering"]);
      setTravelRange("UK-wide");
      setLeadTime("2 weeks preferred");
      setLinks([
        "https://open.spotify.com/artist/davidokonkwo",
        "https://youtube.com/@davidokonkwo_worship"
      ]);
      setToastMsg("✨ Full sample worship leader profile loaded!");
    }

    setTimeout(() => setToastMsg(""), 4500);
  };

  // Step 1 Next validation
  const handleStep1Next = () => {
    const errors: { [key: string]: string } = {};
    if (!displayName.trim()) {
      errors.displayName = "Display name is required.";
    } else if (displayName.trim().length < 3) {
      errors.displayName = "Display name must be at least 3 characters.";
    }
    if (!city.trim()) {
      errors.city = "City is required.";
    }
    if (!postcode.trim()) {
      errors.postcode = "Postcode is required.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstErrorKey = Object.keys(errors)[0];
      const targetId = firstErrorKey === "displayName" ? "field-displayName" : firstErrorKey === "city" ? "f-city" : "f-postcode";
      const firstErrorEl = document.getElementById(targetId);
      if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setFieldErrors({});
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2 Next validation
  const handleStep2Next = () => {
    const errors: { [key: string]: string } = {};
    if (styles.length === 0) {
      errors.styles = "Please select at least 1 musical style.";
    }
    if (instruments.length === 0) {
      errors.instruments = "Please select at least 1 instrument or Vocals.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 3 Next validation
  const handleStep3Next = () => {
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Publish Handler
  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitting(true);
    setCurrentPublishStep(0);

    const stepInterval = setInterval(() => {
      setCurrentPublishStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 900);

    let finalAvatarUrl = avatarPreview.startsWith("http") && !avatarPreview.startsWith("blob") ? avatarPreview : "";
    let finalSongUrl = "";
    let finalVideoUrl = "";
    const finalPhotoUrls: string[] = [];

    const uploadFile = async (file: File, kind: string) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          return data.url;
        }
      } catch (e) {
        console.error(`${kind} upload failed`, e);
      }
      return null;
    };

    if (avatarFile) {
      const uploaded = await uploadFile(avatarFile, "avatar");
      if (uploaded) finalAvatarUrl = uploaded;
    }
    for (const song of songFiles) {
      const url = await uploadFile(song.file, "song");
      if (url && !finalSongUrl) finalSongUrl = url;
    }
    for (const vid of videoFiles) {
      const url = await uploadFile(vid.file, "video");
      if (url && !finalVideoUrl) finalVideoUrl = url;
    }
    let finalCoverUrl = coverPreview.startsWith("http") && !coverPreview.startsWith("blob") ? coverPreview : "";
    if (coverFile) {
      const uploaded = await uploadFile(coverFile, "cover");
      if (uploaded) finalCoverUrl = uploaded;
    }
    if (finalCoverUrl) {
      finalPhotoUrls.push(finalCoverUrl);
    }

    for (const photo of photoFiles) {
      const url = await uploadFile(photo, "gallery");
      if (url) finalPhotoUrls.push(url);
    }


    const validLinks = links
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => (l.startsWith("http://") || l.startsWith("https://") ? l : `https://${l}`));

    const spotifyLink = validLinks.find(l => l.includes("spotify")) || undefined;
    const youtubeLink = validLinks.find(l => l.includes("youtube") || l.includes("youtu.be")) || undefined;
    const instagramLink = validLinks.find(l => l.includes("instagram")) || undefined;
    const otherLinks = validLinks.filter(l => !l.includes("spotify") && !l.includes("youtube") && !l.includes("youtu.be") && !l.includes("instagram"));
    const websiteLink = otherLinks.length > 0 ? otherLinks.join("\n") : undefined;

    const payload = {
      display_name: displayName.trim(),
      tagline: tagline.trim() || undefined,
      city: city.trim() || undefined,
      country: country.trim() || "United Kingdom",
      years_leading: parseInt(yearsLeading) || 0,
      bio: bio.trim() || undefined,
      styles,
      instruments,
      languages,
      available_for: availableFor,
      fee_model: feeModel,
      travel_range: travelRange,
      lead_time: leadTime,
      avatar_url: finalAvatarUrl || undefined,
      song_url: finalSongUrl || undefined,
      video_url: finalVideoUrl || undefined,
      cover_photo_urls: finalPhotoUrls,
      spotify_url: spotifyLink,
      youtube_url: youtubeLink,
      instagram_url: instagramLink,
      website_url: websiteLink,
    };

    try {
      const endpoint = initialEditSlug ? `/api/worship-leaders/${initialEditSlug}` : "/api/worship-leaders";
      const method = initialEditSlug ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${initialEditSlug ? "update" : "create"} worship leader profile`);
      }

      setCurrentPublishStep(4);
      clearInterval(stepInterval);
      router.push(`/worship-leader/${initialEditSlug || data.slug}?owner=true`);
    } catch (err: any) {
      clearInterval(stepInterval);
      setSubmitError(err.message || "An unexpected error occurred while publishing.");
      setSubmitting(false);
    }
  };

  // Profile strength calculation for Review Step
  const strengthFields = [
    { label: "Display name", pts: 15, done: !!displayName.trim() },
    { label: "City & Location", pts: 15, done: !!city.trim() },
    { label: "Profile photo", pts: 10, done: !!avatarPreview },
    { label: "Cover photo", pts: 10, done: !!coverPreview },
    { label: "Musical styles", pts: 15, done: styles.length > 0 },
    { label: "Instruments", pts: 10, done: instruments.length > 0 },
    { label: "Languages", pts: 10, done: languages.length > 0 },
    { label: "Availability", pts: 5, done: availableFor.length > 0 },
    { label: "Bio / About", pts: 5, done: !!bio.trim() },
    { label: "Audio / Video or Links", pts: 5, done: songFiles.length > 0 || videoFiles.length > 0 || links.some(l => !!l.trim()) },
  ];
  const totalPoints = strengthFields.reduce((sum, f) => sum + f.pts, 0);
  const earnedPoints = strengthFields.filter(f => f.done).reduce((sum, f) => sum + f.pts, 0);
  const scorePercent = Math.round((earnedPoints / totalPoints) * 100);

  const filteredLanguages = getFilteredLanguages();

  return (
    <div style={{ background: "#fff", minHeight: "100vh", position: "relative" }}>
      <TopNav />

      {/* Top Header matching Church Listing Format */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px 60px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="brand-mark" style={{ background: "linear-gradient(135deg, #f43f5e, #7c3aed)" }}>
              <i className="ti ti-microphone-2" style={{ fontSize: "18px", color: "#fff" }}></i>
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--cn-ink)" }}>
                {isEditMode ? "Edit Worship Leader Profile" : "Add Worship Leader Profile"}
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--cn-gray)" }}>
                {currentStep === 4 ? (isEditMode ? "Review & Save" : "Review & Publish") : `Step ${currentStep} of 3`}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={handleLoadSampleData}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 16px",
                borderRadius: "12px",
                border: "1.5px solid #a855f7",
                background: "linear-gradient(135deg, #f5f3ff, #faf5ff)",
                color: "#7e22ce",
                fontSize: "13.5px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(168, 85, 247, 0.15)",
                transition: "all 0.2s",
              }}
              title={`Pre-fill Step ${currentStep} with sample worship leader details`}
            >
              <i className="ti ti-sparkles" style={{ fontSize: "16px", color: "#9333ea" }}></i>
              Load Sample Data
            </button>
            <button className="btn-secondary" onClick={() => router.push("/add-listing")}>
              <i className="ti ti-x" style={{ fontSize: "14px" }}></i> Exit
            </button>
          </div>
        </div>

        {/* Toast confirmation message */}
        {toastMsg && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 18px",
            marginBottom: "20px",
            background: "#f0fdf4",
            border: "1.5px solid #86efac",
            borderRadius: "14px",
            color: "#166534",
            fontSize: "13.5px",
            fontWeight: 700,
            boxShadow: "0 4px 12px rgba(22, 101, 52, 0.08)",
            animation: "fadeIn 0.3s ease"
          }}>
            <i className="ti ti-circle-check" style={{ fontSize: "18px", color: "#16a34a" }}></i>
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Step Bar (Church Listing StepBar style) */}
        <div style={{ marginBottom: "44px" }}>
          <StepBarWL 
            currentStep={currentStep} 
            onStepClick={(s) => {
              if (s < currentStep || currentStep === 4) setCurrentStep(s);
            }} 
          />
        </div>

        {/* ================= STEP 1: BASICS & LOCATION ================= */}
        {currentStep === 1 && (
          <div className="step-content slide-up">
            {/* PROFILE BASICS CARD */}
            <div className="scard">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg, #a855f7, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ti ti-user" style={{ fontSize: "18px", color: "#fff" }}></i>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Profile Basics</div>
              </div>

              {/* Photos: Cover Photo Banner & Avatar / Headshot */}
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px", marginBottom: "26px", alignItems: "start" }}>
                {/* 1. Cover Photo / Hero Banner */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--cn-ink)" }}>
                      Cover Photo / Hero Banner
                    </div>
                    {coverPreview && (
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1px 7px", borderRadius: "10px" }}>
                        Uploaded
                      </span>
                    )}
                  </div>

                  <div style={{ position: "relative" }}>
                    <label
                      className="cover-upload-box"
                      style={{
                        height: "120px",
                        width: "100%",
                        borderRadius: "16px",
                        background: coverPreview
                          ? `url('${coverPreview}') center/cover`
                          : "linear-gradient(135deg, rgba(244,63,94,.08), rgba(124,58,237,.08))",
                        border: "2px dashed #cbd5e1",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        color: "#7c3aed",
                        cursor: "pointer",
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                        position: "relative",
                        transition: "all 0.2s",
                      }}
                    >
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleCoverChange}
                      />
                      {!coverPreview && (
                        <>
                          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f5f3ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                            <i className="ti ti-photo-up"></i>
                          </div>
                          <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--cn-ink)" }}>
                            Upload Cover Photo
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--cn-gray)" }}>
                            Wide banner photo for your hero header
                          </span>
                        </>
                      )}

                      {/* Hover Overlay when cover is present */}
                      {coverPreview && (
                        <div
                          className="cover-overlay"
                          style={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: "rgba(15, 23, 42, 0.65)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: 700,
                            opacity: 0,
                            transition: "opacity 0.2s ease",
                          }}
                        >
                          <i className="ti ti-photo-edit" style={{ fontSize: "22px" }}></i>
                          <span>Change Cover Photo</span>
                        </div>
                      )}
                    </label>

                    {/* Remove '×' button on top-right */}
                    {coverPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveCover}
                        title="Remove cover photo"
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "#ef4444",
                          color: "#fff",
                          border: "2px solid #fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          fontWeight: 800,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                          zIndex: 10,
                          transition: "transform 0.15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      >
                        <i className="ti ti-x"></i>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Profile Photo / Headshot */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--cn-ink)" }}>
                      Profile Photo / Headshot
                    </div>
                    {avatarPreview && (
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1px 7px", borderRadius: "10px" }}>
                        Uploaded
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ position: "relative" }}>
                      <label 
                        className="avatar-upload-box"
                        style={{
                          width: "120px",
                          height: "120px",
                          borderRadius: "20px",
                          background: avatarPreview ? `url('${avatarPreview}') center/cover` : "linear-gradient(135deg, rgba(244,63,94,.08), rgba(124,58,237,.08))",
                          border: "2px dashed #cbd5e1",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                          color: "#7c3aed",
                          cursor: "pointer",
                          overflow: "hidden",
                          flexShrink: 0,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                          position: "relative",
                          transition: "all 0.2s"
                        }}
                      >
                        <input 
                          ref={avatarInputRef}
                          type="file" 
                          accept="image/*" 
                          style={{ display: "none" }} 
                          onChange={handleAvatarChange} 
                        />
                        {!avatarPreview && (
                          <>
                            <i className="ti ti-camera-plus" style={{ fontSize: "24px" }}></i>
                            <span style={{ fontSize: "11px", fontWeight: 700 }}>Upload DP</span>
                          </>
                        )}

                        {/* Hover Overlay when image is uploaded */}
                        {avatarPreview && (
                          <div 
                            className="avatar-overlay"
                            style={{
                              position: "absolute",
                              inset: 0,
                              backgroundColor: "rgba(15, 23, 42, 0.65)",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "2px",
                              color: "#fff",
                              fontSize: "11px",
                              fontWeight: 700,
                              opacity: 0,
                              transition: "opacity 0.2s ease",
                            }}
                          >
                            <i className="ti ti-camera" style={{ fontSize: "20px" }}></i>
                            <span>Change</span>
                          </div>
                        )}
                      </label>

                      {/* Remove '×' button on top-right */}
                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          title="Remove profile picture"
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: "#ef4444",
                            color: "#fff",
                            border: "2px solid #fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            fontWeight: 800,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                            zIndex: 10,
                            transition: "transform 0.15s ease"
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        >
                          <i className="ti ti-x"></i>
                        </button>
                      )}
                    </div>

                    <div style={{ fontSize: "12px", color: "var(--cn-gray)", lineHeight: 1.4 }}>
                      Square headshot or portrait photo for your avatar badge across directories.
                    </div>
                  </div>
                </div>
              </div>


              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "16px" }}>
                <div>
                  <label>
                    Display Name <span style={{ color: "#ef4444", fontWeight: 800 }}>*</span>
                  </label>
                  <input
                    id="field-displayName"
                    placeholder="e.g. David Okonkwo"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      if (fieldErrors.displayName) setFieldErrors(prev => ({ ...prev, displayName: "" }));
                    }}
                    style={{ border: fieldErrors.displayName ? "1.5px solid red" : "" }}
                  />
                  {fieldErrors.displayName && (
                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.displayName}</div>
                  )}
                </div>

                <div>
                  <label>Years of Ministry Experience</label>
                  <input
                    type="number"
                    placeholder="e.g. 8"
                    value={yearsLeading}
                    onChange={(e) => setYearsLeading(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label>Professional Tagline</label>
                <input
                  placeholder="e.g. Worship leader, songwriter & recording artist"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>

              <div>
                <label>Short Bio & Ministry Calling</label>
                <textarea
                  rows={4}
                  placeholder="Tell churches about your heart for worship, ministry background, and vision..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>

            {/* LOCATION CARD: FULL ADDRESS SEARCH FIRST, FOLLOWED BY CITY & COUNTRY (AUTOFILLED) */}
            <div className="scard" style={{ overflow: "visible" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg, #fb7185, #f43f5e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ti ti-map-pin" style={{ fontSize: "18px", color: "#fff" }}></i>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Location & Base City</div>
              </div>

              {/* Full Address search & pin on map comes first */}
              <div style={{ marginBottom: "18px" }}>
                <SharedAddressField
                  idPrefix="wl"
                  country={country}
                  address={address}
                  addressDetails={addressDetails}
                  latitude={latitude}
                  longitude={longitude}
                  onUpdateCountry={(c) => {
                    if (c) setCountry(c);
                  }}
                  onUpdateAddress={setAddress}
                  onUpdateAddressDetails={setAddressDetails}
                  onUpdateCity={(c) => {
                    if (c) {
                      setCity(c);
                      if (fieldErrors.city) setFieldErrors(prev => ({ ...prev, city: "" }));
                    }
                  }}
                  onLocationSelected={(details) => {
                    if (details.city) {
                      setCity(details.city);
                      if (fieldErrors.city) setFieldErrors(prev => ({ ...prev, city: "" }));
                    }
                    if (details.area) {
                      setArea(details.area);
                    }
                    if (details.postcode) {
                      setPostcode(details.postcode);
                      if (fieldErrors.postcode) setFieldErrors(prev => ({ ...prev, postcode: "" }));
                    }
                    if (details.country) {
                      setCountry(details.country);
                    }
                  }}
                  onUpdateCoordinates={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                />
              </div>

              {/* City *, Area / Borough, and Postcode * (Auto-filled from pinpointed map) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "8px" }}>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    City <span style={{ color: "#ef4444", fontWeight: 800 }}>*</span>
                    {city && (
                      <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1px 7px", borderRadius: "10px" }}>
                        Autofilled
                      </span>
                    )}
                  </label>
                  <input
                    id="f-city"
                    placeholder="e.g. London"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (fieldErrors.city) setFieldErrors(prev => ({ ...prev, city: "" }));
                    }}
                    style={{ border: fieldErrors.city ? "1.5px solid red" : "" }}
                  />
                  {fieldErrors.city && (
                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.city}</div>
                  )}
                </div>

                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    Area / Borough
                    {area && (
                      <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1px 7px", borderRadius: "10px" }}>
                        Autofilled
                      </span>
                    )}
                  </label>
                  <input
                    id="f-area"
                    placeholder="e.g. Mayfair, Peckham"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    Postcode <span style={{ color: "#ef4444", fontWeight: 800 }}>*</span>
                    {postcode && (
                      <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1px 7px", borderRadius: "10px" }}>
                        Autofilled
                      </span>
                    )}
                  </label>
                  <input
                    id="f-postcode"
                    placeholder="e.g. W1J 7NT"
                    value={postcode}
                    onChange={(e) => {
                      setPostcode(e.target.value);
                      if (fieldErrors.postcode) setFieldErrors(prev => ({ ...prev, postcode: "" }));
                    }}
                    style={{ border: fieldErrors.postcode ? "1.5px solid red" : "" }}
                  />
                  {fieldErrors.postcode && (
                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{fieldErrors.postcode}</div>
                  )}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button onClick={handleStep1Next} className="btn-primary">
                Next — Sound & Availability <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: SOUND & AVAILABILITY ================= */}
        {currentStep === 2 && (
          <div className="step-content slide-up">
            {/* SOUND & STYLE CARD */}
            <div className="scard">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg, #f43f5e, #db2777)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ti ti-music" style={{ fontSize: "18px", color: "#fff" }}></i>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Your Sound & Style</div>
              </div>

              {/* Musical Styles (SELECT ANY + Custom) */}
              <div style={{ marginBottom: "24px" }}>
                <label>
                  Musical Styles <span className="req-badge">SELECT ANY</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px", marginBottom: "10px" }}>
                  {styleOptions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleChip(styles, setStyles, s)}
                      className={`chip ${styles.includes(s) ? "on" : ""}`}
                    >
                      {styles.includes(s) && <i className="ti ti-check" style={{ fontSize: "12px" }}></i>}
                      {s}
                    </button>
                  ))}
                </div>
                {/* Custom style input */}
                <div style={{ display: "flex", gap: "8px", maxWidth: "440px" }}>
                  <input
                    placeholder="Don't see yours? Add custom style (e.g. Neo-Soul Gospel)"
                    value={customStyle}
                    onChange={(e) => setCustomStyle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomItem(customStyle, setCustomStyle, styleOptions, setStyleOptions, styles, setStyles);
                      }
                    }}
                    style={{ fontSize: "13px" }}
                  />
                  <button
                    type="button"
                    onClick={() => addCustomItem(customStyle, setCustomStyle, styleOptions, setStyleOptions, styles, setStyles)}
                    style={{
                      flexShrink: 0,
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#fff",
                      background: "var(--cn-purple)",
                      border: "none",
                      padding: "0 16px",
                      borderRadius: "11px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <i className="ti ti-plus" style={{ fontSize: "14px" }}></i> Add
                  </button>
                </div>
                {fieldErrors.styles && (
                  <div style={{ color: "red", fontSize: "12px", marginTop: "6px" }}>{fieldErrors.styles}</div>
                )}
              </div>

              {/* Instruments & Vocals (SELECT ANY + Custom) */}
              <div style={{ marginBottom: "16px" }}>
                <label>
                  Instruments & Vocals <span className="req-badge">SELECT ANY</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px", marginBottom: "10px" }}>
                  {instrumentOptions.map(i => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleChip(instruments, setInstruments, i)}
                      className={`chip ${instruments.includes(i) ? "on" : ""}`}
                    >
                      {instruments.includes(i) && <i className="ti ti-check" style={{ fontSize: "12px" }}></i>}
                      🎵 {i}
                    </button>
                  ))}
                </div>
                {/* Custom instrument input */}
                <div style={{ display: "flex", gap: "8px", maxWidth: "440px" }}>
                  <input
                    placeholder="Add custom instrument (e.g. Saxophone, Violin, Percussion)"
                    value={customInstrument}
                    onChange={(e) => setCustomInstrument(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomItem(customInstrument, setCustomInstrument, instrumentOptions, setInstrumentOptions, instruments, setInstruments);
                      }
                    }}
                    style={{ fontSize: "13px" }}
                  />
                  <button
                    type="button"
                    onClick={() => addCustomItem(customInstrument, setCustomInstrument, instrumentOptions, setInstrumentOptions, instruments, setInstruments)}
                    style={{
                      flexShrink: 0,
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#fff",
                      background: "var(--cn-purple)",
                      border: "none",
                      padding: "0 16px",
                      borderRadius: "11px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <i className="ti ti-plus" style={{ fontSize: "14px" }}></i> Add
                  </button>
                </div>
                {fieldErrors.instruments && (
                  <div style={{ color: "red", fontSize: "12px", marginTop: "6px" }}>{fieldErrors.instruments}</div>
                )}
              </div>
            </div>

            {/* LANGUAGES YOU LEAD WORSHIP IN (MATCHING CHURCH ONBOARDING STEP4LANGUAGES STYLE) */}
            <div className="scard" style={{ overflow: "visible" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg, #a78bfa, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ti ti-language" style={{ fontSize: "18px", color: "#fff" }}></i>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Languages Spoken</div>
              </div>
              <div style={{ fontSize: "13px", color: "var(--cn-gray)", marginBottom: "18px" }}>
                Select languages services are held in or interpreted into
              </div>

              {/* POPULAR LANGUAGES QUICK PICKS */}
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-gray)", letterSpacing: "0.05em", marginBottom: "9px" }}>
                POPULAR LANGUAGES
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px" }}>
                {quickPickLanguages.map(lang => (
                  <div 
                    key={lang} 
                    className={`chip ${languages.includes(lang) ? "on" : ""}`} 
                    onClick={() => toggleChip(languages, setLanguages, lang)}
                    style={{ cursor: "pointer" }}
                  >
                    {languages.includes(lang) && <i className="ti ti-check" style={{ fontSize: "12px" }}></i>}
                    {lang}
                  </div>
                ))}
              </div>

              {/* SEARCHABLE 250+ LANGUAGES INPUT */}
              <div ref={langContainerRef} id="f-languages" style={{ position: "relative", marginBottom: "16px" }}>
                <i className="ti ti-search" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "var(--cn-gray-light)", zIndex: 2 }}></i>
                <input 
                  placeholder="Search 250+ languages (e.g. Yoruba, Swahili, Mandarin)..." 
                  value={langSearchQuery}
                  onChange={(e) => {
                    setLangSearchQuery(e.target.value);
                    setIsLangOpen(true);
                  }}
                  onFocus={() => setIsLangOpen(true)}
                  style={{ paddingLeft: "42px" }} 
                  autoComplete="off"
                />

                {isLangOpen && (
                  <div className="autocomplete-dropdown" style={{ display: "block", maxHeight: "250px", overflowY: "auto" }}>
                    {filteredLanguages.length === 0 ? (
                      <div>
                        <div style={{ padding: "10px 14px", fontSize: "12.5px", color: "var(--cn-gray)", lineHeight: 1.4 }}>
                          No language found for "{langSearchQuery}" — you can add it as a custom language below
                        </div>
                        <div 
                          className="autocomplete-item" 
                          onClick={() => {
                            const val = langSearchQuery.trim().replace(/(^|\s)(\w)/g, (m, p, c) => p + c.toUpperCase());
                            if (val && !languages.includes(val)) {
                              setLanguages(prev => [...prev, val]);
                            }
                            setLangSearchQuery("");
                            setIsLangOpen(false);
                          }}
                          style={{ borderTop: "1px solid var(--cn-border)", fontWeight: 600, color: "var(--cn-purple)", display: "flex", alignItems: "center", gap: "8px", padding: "11px 14px" }}
                        >
                          <i className="ti ti-plus" style={{ fontSize: "14px" }}></i> Add "{langSearchQuery}"
                        </div>
                      </div>
                    ) : (
                      filteredLanguages.slice(0, 100).map(lang => {
                        const isAdded = languages.includes(lang);
                        return (
                          <div 
                            key={lang}
                            onClick={() => {
                              toggleChip(languages, setLanguages, lang);
                              setLangSearchQuery("");
                              setIsLangOpen(false);
                            }}
                            className="autocomplete-item"
                            style={{
                              padding: "9px 14px",
                              cursor: "pointer",
                              fontSize: "13px",
                              color: isAdded ? "var(--cn-purple)" : "var(--cn-ink)",
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
                              <span style={{ marginLeft: "auto", fontSize: "10.5px", color: "var(--cn-purple)", fontWeight: 700 }}>Selected</span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* SELECTED LANGUAGES CHIPS WITH PURPLE PILLS & X BUTTON */}
              {languages.length > 0 && (
                <>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--cn-gray)", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    SELECTED LANGUAGES ({languages.length})
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {languages.map(lang => (
                      <div 
                        key={lang} 
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "var(--cn-purple)",
                          color: "#fff",
                          borderRadius: "20px",
                          padding: "6px 10px 6px 14px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                        onClick={() => toggleChip(languages, setLanguages, lang)}
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
            </div>

            {/* AVAILABILITY & BOOKING CARD */}
            <div className="scard">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg, #2dd4bf, #0891b2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ti ti-calendar-check" style={{ fontSize: "18px", color: "#fff" }}></i>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Availability & Booking Details</div>
              </div>

              {/* Available For (SELECT ANY + Custom) */}
              <div style={{ marginBottom: "22px" }}>
                <label>Available For</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px", marginBottom: "10px" }}>
                  {availableOptions.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleChip(availableFor, setAvailableFor, a)}
                      className={`chip ${availableFor.includes(a) ? "on" : ""}`}
                    >
                      {availableFor.includes(a) && <i className="ti ti-check" style={{ fontSize: "12px" }}></i>}
                      {a}
                    </button>
                  ))}
                </div>
                {/* Custom Available For input */}
                <div style={{ display: "flex", gap: "8px", maxWidth: "440px" }}>
                  <input
                    placeholder="Add custom availability (e.g. Youth Camp, Midweek Prayer)"
                    value={customAvailable}
                    onChange={(e) => setCustomAvailable(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomItem(customAvailable, setCustomAvailable, availableOptions, setAvailableOptions, availableFor, setAvailableFor);
                      }
                    }}
                    style={{ fontSize: "13px" }}
                  />
                  <button
                    type="button"
                    onClick={() => addCustomItem(customAvailable, setCustomAvailable, availableOptions, setAvailableOptions, availableFor, setAvailableFor)}
                    style={{
                      flexShrink: 0,
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#fff",
                      background: "var(--cn-purple)",
                      border: "none",
                      padding: "0 16px",
                      borderRadius: "11px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <i className="ti ti-plus" style={{ fontSize: "14px" }}></i> Add
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "22px" }}>
                <div>
                  <label>Travel Range</label>
                  <select value={travelRange} onChange={(e) => setTravelRange(e.target.value)}>
                    <option>My city only</option>
                    <option>Within 1 hour</option>
                    <option>UK-wide</option>
                    <option>International</option>
                  </select>
                </div>
                <div>
                  <label>Notice / Lead Time</label>
                  <select value={leadTime} onChange={(e) => setLeadTime(e.target.value)}>
                    <option>Any notice</option>
                    <option>2 weeks preferred</option>
                    <option>1 month+</option>
                  </select>
                </div>
              </div>

              {/* Fee Model (SELECT ANY + Custom) */}
              <div>
                <label>Honorarium / Fee Preference</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px", marginBottom: "10px" }}>
                  {feeOptions.map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleChip(feeModel, setFeeModel, f)}
                      className={`chip ${feeModel.includes(f) ? "on" : ""}`}
                    >
                      {feeModel.includes(f) && <i className="ti ti-check" style={{ fontSize: "12px" }}></i>}
                      {f}
                    </button>
                  ))}
                </div>
                {/* Custom Fee Model input */}
                <div style={{ display: "flex", gap: "8px", maxWidth: "440px" }}>
                  <input
                    placeholder="Add custom preference (e.g. Travel + Accommodation only)"
                    value={customFee}
                    onChange={(e) => setCustomFee(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomItem(customFee, setCustomFee, feeOptions, setFeeOptions, feeModel, setFeeModel);
                      }
                    }}
                    style={{ fontSize: "13px" }}
                  />
                  <button
                    type="button"
                    onClick={() => addCustomItem(customFee, setCustomFee, feeOptions, setFeeOptions, feeModel, setFeeModel)}
                    style={{
                      flexShrink: 0,
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#fff",
                      background: "var(--cn-purple)",
                      border: "none",
                      padding: "0 16px",
                      borderRadius: "11px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <i className="ti ti-plus" style={{ fontSize: "14px" }}></i> Add
                  </button>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button onClick={() => setCurrentStep(1)} className="btn-secondary">
                <i className="ti ti-arrow-left" style={{ fontSize: "14px" }}></i> Back
              </button>
              <button onClick={handleStep2Next} className="btn-primary">
                Next — Media & Links <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: MEDIA & LINKS ================= */}
        {currentStep === 3 && (
          <div className="step-content slide-up">
            <div className="scard">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ti ti-player-play" style={{ fontSize: "18px", color: "#fff" }}></i>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Media & Sample Recordings</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" }}>
                {/* Audio Upload */}
                <label style={{ border: "2px dashed #e2e8f0", borderRadius: "16px", padding: "20px 14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: "#f8fafc" }}>
                  <input
                    type="file"
                    accept="audio/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files).map(f => ({ file: f, name: f.name }));
                        setSongFiles(prev => [...prev, ...newFiles]);
                      }
                    }}
                  />
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: songFiles.length > 0 ? "#10b981" : "linear-gradient(135deg, #2dd4bf, #0891b2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "20px", marginBottom: "8px" }}>
                    <i className={songFiles.length > 0 ? "ti ti-check" : "ti ti-music"}></i>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--cn-ink)" }}>
                    {songFiles.length > 0 ? `${songFiles.length} song${songFiles.length > 1 ? "s" : ""} added` : "Add Audio Tracks"}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--cn-gray)", marginTop: "3px" }}>MP3, WAV, M4A</div>
                </label>

                {/* Video Upload */}
                <label style={{ border: "2px dashed #e2e8f0", borderRadius: "16px", padding: "20px 14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: "#f8fafc" }}>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files).map(f => ({ file: f, name: f.name }));
                        setVideoFiles(prev => [...prev, ...newFiles]);
                      }
                    }}
                  />
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: videoFiles.length > 0 ? "#10b981" : "linear-gradient(135deg, #f43f5e, #db2777)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "20px", marginBottom: "8px" }}>
                    <i className={videoFiles.length > 0 ? "ti ti-check" : "ti ti-video"}></i>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--cn-ink)" }}>
                    {videoFiles.length > 0 ? `${videoFiles.length} video${videoFiles.length > 1 ? "s" : ""} added` : "Add Live Videos"}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--cn-gray)", marginTop: "3px" }}>MP4, WebM clips</div>
                </label>

                {/* Gallery Upload */}
                <label style={{ border: "2px dashed #e2e8f0", borderRadius: "16px", padding: "20px 14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: "#f8fafc" }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        setPhotoFiles(prev => [...prev, ...newFiles]);
                      }
                    }}
                  />
                  <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: photoFiles.length > 0 ? "#10b981" : "linear-gradient(135deg, #a855f7, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "20px", marginBottom: "8px" }}>
                    <i className={photoFiles.length > 0 ? "ti ti-check" : "ti ti-photo"}></i>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--cn-ink)" }}>
                    {photoFiles.length > 0 ? `${photoFiles.length} photo${photoFiles.length > 1 ? "s" : ""}` : "Gallery Photos"}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--cn-gray)", marginTop: "3px" }}>Worship ministry pics</div>
                </label>
              </div>

              {/* Uploaded Files Chips */}
              {(songFiles.length > 0 || videoFiles.length > 0 || photoFiles.length > 0) && (
                <div style={{ background: "#f8fafc", borderRadius: "12px", border: "1px solid var(--cn-border)", padding: "12px 14px", marginBottom: "20px" }}>
                  <div style={{ fontSize: "11.5px", fontWeight: 800, color: "var(--cn-gray)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "8px" }}>
                    Selected Files ({songFiles.length + videoFiles.length + photoFiles.length})
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {songFiles.map((s, idx) => (
                      <span key={`song-${idx}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", fontSize: "12px", fontWeight: 700, padding: "5px 10px", borderRadius: "16px" }}>
                        <i className="ti ti-circle-check-filled" style={{ color: "#10b981", fontSize: "14px" }}></i>
                        <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                        <button type="button" onClick={() => setSongFiles(prev => prev.filter((_, i) => i !== idx))} style={{ border: "none", background: "none", color: "#065f46", cursor: "pointer", padding: "0 2px", fontSize: "12px", fontWeight: 800 }}>×</button>
                      </span>
                    ))}
                    {videoFiles.map((v, idx) => (
                      <span key={`vid-${idx}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#fdf2f8", border: "1px solid #fbcfe8", color: "#9d174d", fontSize: "12px", fontWeight: 700, padding: "5px 10px", borderRadius: "16px" }}>
                        <i className="ti ti-circle-check-filled" style={{ color: "#ec4899", fontSize: "14px" }}></i>
                        <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</span>
                        <button type="button" onClick={() => setVideoFiles(prev => prev.filter((_, i) => i !== idx))} style={{ border: "none", background: "none", color: "#9d174d", cursor: "pointer", padding: "0 2px", fontSize: "12px", fontWeight: 800 }}>×</button>
                      </span>
                    ))}
                    {photoFiles.map((p, idx) => (
                      <span key={`pic-${idx}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f3e8ff", border: "1px solid #e9d5ff", color: "#6b21a8", fontSize: "12px", fontWeight: 700, padding: "5px 10px", borderRadius: "16px" }}>
                        <i className="ti ti-circle-check-filled" style={{ color: "#8b5cf6", fontSize: "14px" }}></i>
                        <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                        <button type="button" onClick={() => setPhotoFiles(prev => prev.filter((_, i) => i !== idx))} style={{ border: "none", background: "none", color: "#6b21a8", cursor: "pointer", padding: "0 2px", fontSize: "12px", fontWeight: 800 }}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Streaming and Social Links */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <label style={{ margin: 0 }}>Streaming & Social Links (Spotify, YouTube, Instagram, Website)</label>
                  <button
                    type="button"
                    onClick={addLinkInput}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      background: "linear-gradient(135deg, #f43f5e, #7c3aed)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "20px",
                      padding: "5px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(124, 58, 237, 0.25)"
                    }}
                  >
                    <i className="ti ti-plus" style={{ fontSize: "14px" }}></i> Add Another Link
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {links.map((linkVal, idx) => {
                    const isValid = linkVal.trim().startsWith("http://") || linkVal.trim().startsWith("https://");
                    return (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ position: "relative", flex: 1 }}>
                          <input
                            placeholder={idx === 0 ? "e.g. https://open.spotify.com/artist/..." : "e.g. https://youtube.com/@channel or Instagram URL"}
                            value={linkVal}
                            onChange={(e) => updateLink(idx, e.target.value)}
                            style={{
                              paddingRight: "36px",
                              borderColor: linkVal.trim() ? (isValid ? "#10b981" : "var(--cn-border)") : "var(--cn-border)"
                            }}
                          />
                          {linkVal.trim() && (
                            <span
                              style={{
                                position: "absolute",
                                right: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: isValid ? "#10b981" : "#9ca3af",
                                fontSize: "17px"
                              }}
                            >
                              <i className={isValid ? "ti ti-circle-check-filled" : "ti ti-link"}></i>
                            </span>
                          )}
                        </div>

                        {idx === links.length - 1 ? (
                          <button
                            type="button"
                            onClick={addLinkInput}
                            style={{ width: "42px", height: "42px", borderRadius: "12px", border: "1.5px solid #e9d5ff", background: "#f5f3ff", color: "#7c3aed", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <i className="ti ti-plus"></i>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeLink(idx)}
                            style={{ width: "42px", height: "42px", borderRadius: "12px", border: "1.5px solid #fecaca", background: "#fef2f2", color: "#ef4444", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <i className="ti ti-trash"></i>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button onClick={() => setCurrentStep(2)} className="btn-secondary">
                <i className="ti ti-arrow-left" style={{ fontSize: "14px" }}></i> Back
              </button>
              <button onClick={handleStep3Next} className="btn-primary">
                Review & Publish <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: REVIEW & PUBLISH ================= */}
        {currentStep === 4 && (
          <div className="step-content slide-up">
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "24px", alignItems: "start" }}>
              {/* LEFT: COMPREHENSIVE DATA BREAKDOWN & PREVIEW */}
              <div className="scard" style={{ padding: 0, overflow: "hidden" }}>
                {/* Header Banner */}
                <div 
                  style={{ 
                    height: "140px", 
                    background: coverPreview ? `url('${coverPreview}') center/cover` : "linear-gradient(135deg, #2e1065, #7c3aed 60%, #be185d)", 
                    position: "relative" 
                  }}
                >
                  <div 
                    style={{
                      position: "absolute",
                      left: "24px",
                      bottom: "-32px",
                      width: "76px",
                      height: "76px",
                      borderRadius: "22px",
                      background: avatarPreview ? `url('${avatarPreview}') center/cover` : "linear-gradient(135deg, #f43f5e, #7c3aed)",
                      border: "3px solid #ffffff",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "28px"
                    }}
                  >
                    {!avatarPreview && <i className="ti ti-user"></i>}
                  </div>
                </div>

                <div style={{ padding: "42px 24px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--cn-ink)", margin: 0 }}>
                      {displayName || "Your Name"}
                    </h3>
                    <i className="ti ti-rosette-discount-check-filled" style={{ color: "#16a34a", fontSize: "18px" }}></i>
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--cn-gray)", marginBottom: "12px", fontWeight: 500 }}>
                    {tagline || "Worship Leader & Songwriter"}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--cn-gray)", marginBottom: "18px", flexWrap: "wrap" }}>
                    <i className="ti ti-map-pin" style={{ color: "#e11d48", fontSize: "16px" }}></i>
                    <span style={{ fontWeight: 600 }}>{city || "City not set"}</span>
                    {area && <span>• {area}</span>}
                    {postcode && <span>• {postcode}</span>}
                    {country && <span>• {country}</span>}
                    {addressDetails && <span style={{ color: "#94a3b8" }}>({addressDetails})</span>}
                  </div>

                  {/* Section: Basic Details */}
                  <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "14px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--cn-purple-dark)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "10px" }}>
                      Profile Basics
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
                      <div>
                        <span style={{ color: "var(--cn-gray)" }}>Experience:</span>{" "}
                        <strong style={{ color: "var(--cn-ink)" }}>{yearsLeading ? `${yearsLeading} years leading` : "Not specified"}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--cn-gray)" }}>Base:</span>{" "}
                        <strong style={{ color: "var(--cn-ink)" }}>{[city, area, country].filter(Boolean).join(', ') || country}</strong>
                      </div>
                      {postcode && (
                        <div>
                          <span style={{ color: "var(--cn-gray)" }}>Postcode:</span>{" "}
                          <strong style={{ color: "var(--cn-ink)" }}>{postcode}</strong>
                        </div>
                      )}
                      {address && (
                        <div style={{ gridColumn: "span 2", fontSize: "12.5px", color: "var(--cn-gray)" }}>
                          <i className="ti ti-map" style={{ marginRight: "4px" }}></i>
                          <span>Full Address: {address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section: Sound & Style */}
                  <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "14px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--cn-purple-dark)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "10px" }}>
                      Musical Styles & Vocals ({styles.length + instruments.length})
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                      {styles.length > 0 ? (
                        styles.map(s => (
                          <span key={s} style={{ fontSize: "11.5px", fontWeight: 700, color: "#6b21a8", background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "4px 10px", borderRadius: "16px" }}>
                            {s}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--cn-gray-light)" }}>No styles selected</span>
                      )}
                      {instruments.map(i => (
                        <span key={i} style={{ fontSize: "11.5px", fontWeight: 600, color: "#0f172a", background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "4px 10px", borderRadius: "16px" }}>
                          🎵 {i}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Section: Languages */}
                  <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "14px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--cn-purple-dark)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "10px" }}>
                      Languages Led In ({languages.length})
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {languages.length > 0 ? (
                        languages.map(l => (
                          <span key={l} style={{ fontSize: "11.5px", fontWeight: 700, color: "#1e3a8a", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "4px 10px", borderRadius: "16px" }}>
                            🗣️ {l}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--cn-gray-light)" }}>None selected</span>
                      )}
                    </div>
                  </div>

                  {/* Section: Availability & Fee Preferences */}
                  <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "14px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--cn-purple-dark)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "10px" }}>
                      Booking, Travel & Honorarium
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px", marginBottom: "10px" }}>
                      <div>
                        <span style={{ color: "var(--cn-gray)" }}>Travel Range:</span>{" "}
                        <strong style={{ color: "var(--cn-ink)" }}>{travelRange}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--cn-gray)" }}>Lead Time:</span>{" "}
                        <strong style={{ color: "var(--cn-ink)" }}>{leadTime}</strong>
                      </div>
                    </div>

                    {/* Available for events */}
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", color: "var(--cn-gray)", display: "block", marginBottom: "4px" }}>Available For:</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {availableFor.length > 0 ? (
                          availableFor.map(a => (
                            <span key={a} style={{ fontSize: "11px", fontWeight: 600, color: "#065f46", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "3px 9px", borderRadius: "14px" }}>
                              ✓ {a}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--cn-gray-light)" }}>No specific occasions selected</span>
                        )}
                      </div>
                    </div>

                    {/* Honorarium / Fee */}
                    <div>
                      <span style={{ fontSize: "12px", color: "var(--cn-gray)", display: "block", marginBottom: "4px" }}>Honorarium / Fee:</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {feeModel.length > 0 ? (
                          feeModel.map(f => (
                            <span key={f} style={{ fontSize: "11px", fontWeight: 600, color: "#854d0e", background: "#fefce8", border: "1px solid #fef08a", padding: "3px 9px", borderRadius: "14px" }}>
                              🏷️ {f}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--cn-gray-light)" }}>Open to dialogue / not specified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section: Media & Uploads */}
                  <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "14px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--cn-purple-dark)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "10px" }}>
                      Media & Links ({songFiles.length + videoFiles.length + photoFiles.length + links.filter(l => !!l.trim()).length})
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", fontSize: "12.5px" }}>
                      {songFiles.length > 0 && (
                        <span style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "4px 10px", borderRadius: "12px", fontWeight: 700 }}>
                          🎵 {songFiles.length} Audio track{songFiles.length > 1 ? "s" : ""}
                        </span>
                      )}
                      {videoFiles.length > 0 && (
                        <span style={{ background: "#fdf2f8", border: "1px solid #fbcfe8", color: "#9d174d", padding: "4px 10px", borderRadius: "12px", fontWeight: 700 }}>
                          🎥 {videoFiles.length} Video{videoFiles.length > 1 ? "s" : ""}
                        </span>
                      )}
                      {photoFiles.length > 0 && (
                        <span style={{ background: "#f3e8ff", border: "1px solid #e9d5ff", color: "#6b21a8", padding: "4px 10px", borderRadius: "12px", fontWeight: 700 }}>
                          📸 {photoFiles.length} Photo{photoFiles.length > 1 ? "s" : ""}
                        </span>
                      )}
                      {links.filter(l => !!l.trim()).length > 0 && (
                        <span style={{ background: "#f8fafc", border: "1px solid var(--cn-border)", color: "var(--cn-ink)", padding: "4px 10px", borderRadius: "12px", fontWeight: 700 }}>
                          🔗 {links.filter(l => !!l.trim()).length} Social/streaming link{links.filter(l => !!l.trim()).length > 1 ? "s" : ""}
                        </span>
                      )}
                      {songFiles.length === 0 && videoFiles.length === 0 && photoFiles.length === 0 && links.filter(l => !!l.trim()).length === 0 && (
                        <span style={{ color: "var(--cn-gray-light)", fontSize: "12px" }}>No media or links added</span>
                      )}
                    </div>

                    {/* Link URLs preview */}
                    {links.filter(l => !!l.trim()).length > 0 && (
                      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                        {links.filter(l => !!l.trim()).map((l, idx) => (
                          <div key={idx} style={{ fontSize: "12px", color: "var(--cn-purple)", display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="ti ti-link" style={{ fontSize: "12px" }}></i>
                            <span style={{ textDecoration: "underline", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section: Bio */}
                  {bio && (
                    <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "14px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--cn-purple-dark)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "6px" }}>
                        About & Ministry Calling
                      </div>
                      <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, margin: 0, whiteSpace: "pre-line" }}>
                        {bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: PROFILE STRENGTH & PUBLISH ACTIONS */}
              <div>
                {/* Profile Strength Card */}
                <div className="scard" style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--cn-ink)" }}>Profile Completeness</span>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: scorePercent >= 80 ? "#16a34a" : "#d97706" }}>
                      {scorePercent}%
                    </span>
                  </div>
                  <div style={{ height: "8px", borderRadius: "4px", background: "#f1f5f9", overflow: "hidden", marginBottom: "14px" }}>
                    <div style={{ height: "100%", width: `${scorePercent}%`, background: "linear-gradient(90deg, #f43f5e, #7c3aed)", transition: "width 0.5s ease" }} />
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--cn-gray)", lineHeight: 1.4, marginBottom: "14px" }}>
                    {scorePercent === 100 ? "🌟 Your profile is complete and optimized for church discovery!" : "Profiles with photo, musical styles, and media receive up to 4× more enquiries."}
                  </div>

                  {/* Breakdown checklist */}
                  <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {strengthFields.map((f, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                        <span style={{ color: f.done ? "var(--cn-ink)" : "var(--cn-gray-light)" }}>{f.label}</span>
                        {f.done ? (
                          <i className="ti ti-circle-check-filled" style={{ color: "#16a34a", fontSize: "14px" }}></i>
                        ) : (
                          <i className="ti ti-circle" style={{ color: "#cbd5e1", fontSize: "14px" }}></i>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Publish Button & Action */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary"
                  style={{ width: "100%", padding: "14px 20px", fontSize: "15px", marginBottom: "12px" }}
                >
                  <i className={isEditMode ? "ti ti-check" : "ti ti-rocket"} style={{ fontSize: "18px" }}></i>
                  {submitting
                    ? (isEditMode ? "Saving Changes..." : "Publishing Profile...")
                    : (isEditMode ? "Save Changes" : "Publish Worship Leader Profile")}
                </button>

                {submitError && (
                  <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: "12px", padding: "12px", color: "#991b1b", fontSize: "12.5px", marginBottom: "14px", display: "flex", gap: "8px" }}>
                    <i className="ti ti-alert-circle" style={{ fontSize: "16px", color: "#ef4444", flexShrink: 0 }}></i>
                    <div>{submitError}</div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="btn-secondary"
                    style={{ justifyContent: "center", padding: "9px 6px", fontSize: "12px" }}
                    title="Edit Basics & Location"
                  >
                    Edit Step 1
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="btn-secondary"
                    style={{ justifyContent: "center", padding: "9px 6px", fontSize: "12px" }}
                    title="Edit Sound & Availability"
                  >
                    Edit Step 2
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="btn-secondary"
                    style={{ justifyContent: "center", padding: "9px 6px", fontSize: "12px" }}
                    title="Edit Media & Links"
                  >
                    Edit Step 3
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

