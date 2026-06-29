import React, { useState } from "react";
import { useFormContext } from "@/context/FormContext";

interface Step7ExtrasProps {
  onBack: () => void;
  onNext: () => void;
}

export default function Step7Extras({ onBack, onNext }: Step7ExtrasProps) {
  const { formData, updateFormData } = useFormContext();
  const [establishedYear, setEstablishedYear] = useState(formData.establishedYear || "");
  const [liveStreamUrl, setLiveStreamUrl] = useState(formData.liveStreamUrl || "");
  const [socialInstagram, setSocialInstagram] = useState(formData.socialInstagram || "");
  const [socialFacebook, setSocialFacebook] = useState(formData.socialFacebook || "");
  const [socialX, setSocialX] = useState(formData.socialX || "");
  const [galleryInput, setGalleryInput] = useState(formData.galleryImages?.join("\n") || "");

  const handleNext = () => {
    // Basic array split for gallery images (splitting by new line)
    const imagesArray = galleryInput
      .split("\n")
      .map((url: string) => url.trim())
      .filter((url: string) => url.length > 0);

    updateFormData({
      establishedYear,
      liveStreamUrl,
      socialInstagram,
      socialFacebook,
      socialX,
      galleryImages: imagesArray,
    });
    
    onNext();
  };

  return (
    <div className="step-content slide-up">
      <div className="scard">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-plug-connected" style={{ fontSize: "18px", color: "#fff" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Socials & Extras</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label>Established Year</label>
            <input 
              type="number"
              placeholder="e.g. 1998" 
              value={establishedYear}
              onChange={(e) => setEstablishedYear(e.target.value)}
            />
          </div>
          <div>
            <label>Live Stream URL</label>
            <input 
              type="url"
              placeholder="https://youtube.com/..." 
              value={liveStreamUrl}
              onChange={(e) => setLiveStreamUrl(e.target.value)}
            />
          </div>
        </div>

        <label>Gallery Images (One URL per line)</label>
        <textarea 
          value={galleryInput}
          onChange={(e) => setGalleryInput(e.target.value)}
          style={{ height: "90px", resize: "vertical", width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid var(--cn-border)", fontSize: "14px", outline: "none", fontFamily: "inherit" }} 
          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
        ></textarea>
        <div style={{ fontSize: "12px", color: "var(--cn-gray-light)", marginTop: "6px" }}>
          Paste URLs of images to show in your church's gallery.
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button onClick={onBack} className="btn-secondary">
          <i className="ti ti-arrow-left" style={{ fontSize: "14px" }}></i>
        </button>
        <button onClick={handleNext} className="btn-primary">
          Review listing <i className="ti ti-arrow-right" style={{ fontSize: "16px" }}></i>
        </button>
      </div>
    </div>
  );
}
