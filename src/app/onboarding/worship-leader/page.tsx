"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/layout/TopNav";
import StepBarWL from "@/components/onboarding/worship-leader/StepBarWL";
import SharedAddressField from "@/components/add-church/steps/SharedAddressField";

export default function WorshipLeaderOnboardingPage() {
  const router = useRouter();

  // Multi-step state: 1 = Basics & Contact, 2 = Sound & Availability, 3 = Media & Links, 4 = Review & Publish
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [toastMsg, setToastMsg] = useState("");

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
  const [address, setAddress] = useState("");
  const [addressDetails, setAddressDetails] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [yearsLeading, setYearsLeading] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // ---------------- STEP 2: SOUND & AVAILABILITY ----------------
  const [styles, setStyles] = useState<string[]>([]);
  const [instruments, setInstruments] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [availableFor, setAvailableFor] = useState<string[]>([]);
  const [feeModel, setFeeModel] = useState<string[]>([]);
  const [travelRange, setTravelRange] = useState("UK-wide");
  const [leadTime, setLeadTime] = useState("2 weeks preferred");

  // Options
  const styleOptions = ["Contemporary", "Gospel", "Afro-Gospel", "Hymns", "Acoustic", "Prophetic", "Spontaneous"];
  const instrumentOptions = ["Vocals", "Piano", "Acoustic guitar", "Electric guitar", "Bass", "Drums", "Keys"];
  const languageOptions = ["English", "Yoruba", "Igbo", "Spanish", "Twi", "French"];
  const availableOptions = ["Sundays", "Events & conferences", "Worship nights", "Recordings", "Online / livestream", "Dep / cover"];
  const feeOptions = ["Love offering", "Fixed fee", "Fee on request", "Expenses only"];

  // ---------------- STEP 3: MEDIA & LINKS ----------------
  const [songFiles, setSongFiles] = useState<{ file: File; name: string }[]>([]);
  const [videoFiles, setVideoFiles] = useState<{ file: File; name: string }[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [links, setLinks] = useState<string[]>([""]);

  const toggleChip = (list: string[], setList: (l: string[]) => void, item: string) => {
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
      setAddress("Westminster, London, UK");
      setAddressDetails("Flat 12, Victoria Mansions");
      setLatitude(51.4995);
      setLongitude(-0.1338);
      setYearsLeading("12");
      setBio("David is a passionate worship leader and songwriter with over 12 years of leading congregations in deep, spirit-led atmospheres of worship across the UK and internationally.");
      setAvatarPreview("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80");
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
      setAddress("Westminster, London, UK");
      setYearsLeading("12");
      setBio("David is a passionate worship leader and songwriter with over 12 years of leading congregations across the UK.");
      setAvatarPreview("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80");
      setStyles(["Contemporary", "Gospel", "Afro-Gospel"]);
      setInstruments(["Vocals", "Acoustic guitar", "Piano"]);
      setLanguages(["English", "Yoruba"]);
      setAvailableFor(["Sundays", "Events & conferences", "Worship nights"]);
      setFeeModel(["Fixed fee"]);
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
    if (!city.trim() && !address.trim()) {
      errors.city = "Please specify your city or location.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstErrorEl = document.getElementById(errors.displayName ? "field-displayName" : "f-city");
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
    const websiteLink = validLinks.find(l => !l.includes("spotify") && !l.includes("youtube") && !l.includes("youtu.be") && !l.includes("instagram")) || undefined;

    const payload = {
      display_name: displayName.trim(),
      tagline: tagline.trim() || undefined,
      city: city.trim() || address.trim() || undefined,
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
      const res = await fetch("/api/worship-leaders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create worship leader profile");
      }

      setCurrentPublishStep(4);
      clearInterval(stepInterval);
      router.push(`/worship-leader/${data.slug}`);
    } catch (err: any) {
      clearInterval(stepInterval);
      setSubmitError(err.message || "An unexpected error occurred while publishing.");
      setSubmitting(false);
    }
  };

  // Profile strength calculation for Review Step
  const strengthFields = [
    { label: "Display name", pts: 20, done: !!displayName.trim() },
    { label: "City & Location", pts: 15, done: !!(city.trim() || address.trim()) },
    { label: "Profile photo", pts: 15, done: !!avatarPreview },
    { label: "Musical styles", pts: 15, done: styles.length > 0 },
    { label: "Instruments", pts: 10, done: instruments.length > 0 },
    { label: "Availability", pts: 10, done: availableFor.length > 0 },
    { label: "Bio / About", pts: 10, done: !!bio.trim() },
    { label: "Audio / Video or Links", pts: 5, done: songFiles.length > 0 || videoFiles.length > 0 || links.some(l => !!l.trim()) },
  ];
  const totalPoints = strengthFields.reduce((sum, f) => sum + f.pts, 0);
  const earnedPoints = strengthFields.filter(f => f.done).reduce((sum, f) => sum + f.pts, 0);
  const scorePercent = Math.round((earnedPoints / totalPoints) * 100);

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
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--cn-ink)" }}>Add Worship Leader Profile</div>
              <div style={{ fontSize: "12.5px", color: "var(--cn-gray)" }}>
                {currentStep === 4 ? "Review & Publish" : `Step ${currentStep} of 3`}
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

              {/* Avatar Upload */}
              <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "24px" }}>
                <label 
                  style={{
                    width: "84px",
                    height: "84px",
                    borderRadius: "22px",
                    background: avatarPreview ? `url('${avatarPreview}') center/cover` : "linear-gradient(135deg, rgba(244,63,94,.1), rgba(124,58,237,.1))",
                    border: "2px dashed #cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#7c3aed",
                    fontSize: "30px",
                    cursor: "pointer",
                    overflow: "hidden",
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    transition: "all 0.2s"
                  }}
                >
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                  {!avatarPreview && <i className="ti ti-camera-plus"></i>}
                </label>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--cn-ink)" }}>Profile Photo / Headshot</div>
                  <div style={{ fontSize: "12.5px", color: "var(--cn-gray)", marginTop: "3px" }}>
                    A clear on-stage or portrait photo helps churches and event organisers connect with you.
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "16px" }}>
                <div>
                  <label>
                    Display Name <span className="req-badge">REQUIRED</span>
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

            {/* LOCATION CARD USING SHARED ADDRESS FIELD */}
            <div className="scard" style={{ overflow: "visible" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg, #fb7185, #f43f5e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ti ti-map-pin" style={{ fontSize: "18px", color: "#fff" }}></i>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Location & Base City</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "16px" }}>
                <div>
                  <label>
                    City / Town <span className="req-badge">REQUIRED</span>
                  </label>
                  <input
                    id="f-city"
                    placeholder="e.g. London, Birmingham, Manchester"
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
                  <label>Country</label>
                  <input
                    placeholder="e.g. United Kingdom"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label>Address / Local Area (Pin on Map)</label>
                <SharedAddressField
                  idPrefix="wl"
                  country={country}
                  address={address}
                  addressDetails={addressDetails}
                  latitude={latitude}
                  longitude={longitude}
                  onUpdateCountry={setCountry}
                  onUpdateAddress={setAddress}
                  onUpdateAddressDetails={setAddressDetails}
                  onUpdateCity={(c) => { if (c && !city) setCity(c); }}
                  onUpdateCoordinates={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                />
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
            <div className="scard">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg, #f43f5e, #db2777)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ti ti-music" style={{ fontSize: "18px", color: "#fff" }}></i>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Your Sound & Style</div>
              </div>

              {/* Musical Styles */}
              <div style={{ marginBottom: "22px" }}>
                <label>
                  Musical Styles <span className="req-badge">SELECT ANY</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                  {styleOptions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleChip(styles, setStyles, s)}
                      className={`chip ${styles.includes(s) ? "on" : ""}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {fieldErrors.styles && (
                  <div style={{ color: "red", fontSize: "12px", marginTop: "6px" }}>{fieldErrors.styles}</div>
                )}
              </div>

              {/* Instruments */}
              <div style={{ marginBottom: "22px" }}>
                <label>
                  Instruments & Vocals <span className="req-badge">SELECT ANY</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                  {instrumentOptions.map(i => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleChip(instruments, setInstruments, i)}
                      className={`chip ${instruments.includes(i) ? "on" : ""}`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
                {fieldErrors.instruments && (
                  <div style={{ color: "red", fontSize: "12px", marginTop: "6px" }}>{fieldErrors.instruments}</div>
                )}
              </div>

              {/* Languages */}
              <div>
                <label>Languages You Lead Worship In</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                  {languageOptions.map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => toggleChip(languages, setLanguages, l)}
                      className={`chip ${languages.includes(l) ? "on" : ""}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AVAILABILITY & BOOKING CARD */}
            <div className="scard">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg, #2dd4bf, #0891b2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="ti ti-calendar-check" style={{ fontSize: "18px", color: "#fff" }}></i>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Availability & Booking Details</div>
              </div>

              {/* Available For */}
              <div style={{ marginBottom: "20px" }}>
                <label>Available For</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                  {availableOptions.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleChip(availableFor, setAvailableFor, a)}
                      className={`chip ${availableFor.includes(a) ? "on" : ""}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "20px" }}>
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

              {/* Fee Model */}
              <div>
                <label>Honorarium / Fee Preference</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                  {feeOptions.map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleChip(feeModel, setFeeModel, f)}
                      className={`chip ${feeModel.includes(f) ? "on" : ""}`}
                    >
                      {f}
                    </button>
                  ))}
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
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", alignItems: "start" }}>
              {/* LEFT: LIVE LISTING PREVIEW CARD */}
              <div className="scard" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ height: "140px", background: "linear-gradient(135deg, #2e1065, #7c3aed 60%, #be185d)", position: "relative" }}>
                  <div 
                    style={{
                      position: "absolute",
                      left: "20px",
                      bottom: "-32px",
                      width: "74px",
                      height: "74px",
                      borderRadius: "20px",
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

                <div style={{ padding: "42px 24px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--cn-ink)", margin: 0 }}>
                      {displayName || "Your Name"}
                    </h3>
                    <i className="ti ti-rosette-discount-check-filled" style={{ color: "#16a34a", fontSize: "17px" }}></i>
                  </div>
                  <div style={{ fontSize: "13.5px", color: "var(--cn-gray)", marginBottom: "14px" }}>
                    {tagline || "Worship Leader & Songwriter"}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--cn-gray)", marginBottom: "16px" }}>
                    <i className="ti ti-map-pin" style={{ color: "#e11d48", fontSize: "15px" }}></i>
                    <span>{city || address || "Location Base"}</span>
                    {country && <span style={{ color: "#94a3b8" }}>• {country}</span>}
                  </div>

                  {/* Chips */}
                  <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "14px", marginBottom: "14px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--cn-purple-dark)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "8px" }}>
                      Sound & Style
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {styles.map(s => (
                        <span key={s} style={{ fontSize: "11.5px", fontWeight: 700, color: "#6b21a8", background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "4px 10px", borderRadius: "16px" }}>
                          {s}
                        </span>
                      ))}
                      {instruments.map(i => (
                        <span key={i} style={{ fontSize: "11.5px", fontWeight: 600, color: "#0f172a", background: "#f1f5f9", padding: "4px 10px", borderRadius: "16px" }}>
                          🎵 {i}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "14px", marginBottom: "14px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--cn-purple-dark)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "8px" }}>
                      Booking & Travel
                    </div>
                    <div style={{ display: "flex", gap: "12px", fontSize: "12.5px", color: "var(--cn-ink)" }}>
                      <span><strong>Travel:</strong> {travelRange}</span>
                      <span><strong>Notice:</strong> {leadTime}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  {bio && (
                    <div style={{ borderTop: "1px solid var(--cn-border)", paddingTop: "14px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--cn-purple-dark)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "6px" }}>
                        About & Ministry
                      </div>
                      <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.5, margin: 0 }}>
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
                  <div style={{ fontSize: "12px", color: "var(--cn-gray)", lineHeight: 1.4 }}>
                    {scorePercent === 100 ? "🌟 Your profile is complete and optimized for church discovery!" : "Profiles with photo, musical styles, and media receive up to 4× more enquiries."}
                  </div>
                </div>

                {/* Publish Button & Action */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary"
                  style={{ width: "100%", padding: "14px 20px", fontSize: "15px", marginBottom: "12px" }}
                >
                  <i className="ti ti-rocket" style={{ fontSize: "18px" }}></i>
                  {submitting ? "Publishing Profile..." : "Publish Worship Leader Profile"}
                </button>

                {submitError && (
                  <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: "12px", padding: "12px", color: "#991b1b", fontSize: "12.5px", marginBottom: "14px", display: "flex", gap: "8px" }}>
                    <i className="ti ti-alert-circle" style={{ fontSize: "16px", color: "#ef4444", flexShrink: 0 }}></i>
                    <div>{submitError}</div>
                  </div>
                )}

                <button
                  onClick={() => setCurrentStep(3)}
                  className="btn-secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <i className="ti ti-arrow-left" style={{ fontSize: "14px" }}></i> Back to Edit Media
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
