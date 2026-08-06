import React, { useState, ChangeEvent } from "react";
import { useFormContext } from "@/context/FormContext";

interface Step7ExtrasProps {
  onBack: () => void;
  onNext: () => void;
}

export default function Step7Extras({ onBack, onNext }: Step7ExtrasProps) {
  const { formData, updateFormData } = useFormContext();
  const [establishedYear, setEstablishedYear] = useState(formData.establishedYear || "");
  const [socialInstagram, setSocialInstagram] = useState(formData.socialInstagram || "");
  const [socialFacebook, setSocialFacebook] = useState(formData.socialFacebook || "");
  const [socialX, setSocialX] = useState(formData.socialX || "");
  const [galleryImages, setGalleryImages] = useState<string[]>(formData.galleryImages || []);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            newImages.push(reader.result);
            // Once all files are processed, update the state
            if (newImages.length === files.length) {
              setGalleryImages((prev) => [...prev, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    updateFormData({
      establishedYear,
      socialInstagram,
      socialFacebook,
      socialX,
      galleryImages,
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
          {/* Live Stream URL removed as requested */}
        </div>

        <label>Gallery Images</label>
        <div style={{ marginBottom: "16px" }}>
          <input 
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{ marginBottom: "12px", width: "100%", padding: "12px", border: "1.5px dashed var(--cn-border)", borderRadius: "12px", background: "var(--cn-bg)" }}
          />
          <div style={{ fontSize: "12px", color: "var(--cn-gray-light)" }}>
            Select multiple images to show in your church's gallery.
          </div>
        </div>

        {galleryImages.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "10px", marginTop: "12px" }}>
            {galleryImages.map((img, idx) => (
              <div key={idx} style={{ position: "relative", width: "100%", paddingTop: "100%", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--cn-border)" }}>
                <img src={img} alt={`Gallery ${idx}`} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <button 
                  onClick={() => removeImage(idx)}
                  style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "12px" }}
                >
                  <i className="ti ti-x"></i>
                </button>
              </div>
            ))}
          </div>
        )}
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

