import React, { useRef, useState } from "react";
import { useFormContext } from "@/context/FormContext";
import { useRouter } from "next/navigation";

interface Step6MediaProps {
  onBack: () => void;
}

export default function Step6Media({ onBack }: Step6MediaProps) {
  const { formData, updateFormData } = useFormContext();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(formData.logo || null);
  const [coverPreview, setCoverPreview] = useState<string | null>(formData.cover || null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setPreview: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent, setPreview: React.Dispatch<React.SetStateAction<string | null>>, inputRef: React.RefObject<HTMLInputElement | null>) => {
    e.stopPropagation();
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const [description, setDescription] = useState(formData.description || "");

  const handleNext = () => {
    if (formData.youtube && !formData.youtube.includes("youtube.com")) {
      setError("Please enter a valid YouTube channel URL");
      setTimeout(() => {
        const el = document.getElementById("f-youtube");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
      return;
    }
    setError(null);
    updateFormData({
      logo: logoPreview,
      cover: coverPreview,
      description: description
    });
    router.push('/add-church/7');
  };

  return (
    <div className="step-content slide-up">
      <div className="scard">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "linear-gradient(135deg,#fbbf24,#d97706)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="ti ti-photo" style={{ fontSize: "18px", color: "#fff" }}></i>
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--cn-ink)" }}>Media & description</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          {/* Logo Upload */}
          <div>
            <label><i className="ti ti-user-circle" style={{ fontSize: "12px", color: "var(--cn-purple)" }}></i> Church logo</label>
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: "none" }} 
              ref={logoInputRef}
              onChange={(e) => handleImageUpload(e, setLogoPreview)}
            />
            <div 
              onClick={() => logoInputRef.current?.click()} 
              style={{ position: "relative", border: "1.5px dashed var(--cn-border)", borderRadius: "14px", height: "130px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "var(--cn-surface)", overflow: "hidden" }}
            >
              {!logoPreview ? (
                <div style={{ textAlign: "center", color: "var(--cn-gray-light)" }}>
                  <i className="ti ti-cloud-upload" style={{ fontSize: "26px", display: "block", margin: "0 auto 6px" }}></i>
                  <div style={{ fontSize: "12px" }}>Click to upload logo</div>
                </div>
              ) : (
                <>
                  <img src={logoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Logo Preview" />
                  <button 
                    onClick={(e) => removeImage(e, setLogoPreview, logoInputRef)} 
                    style={{ position: "absolute", top: "6px", right: "6px", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", color: "#fff", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Cover Upload */}
          <div>
            <label><i className="ti ti-photo" style={{ fontSize: "12px", color: "var(--cn-purple)" }}></i> Cover photo</label>
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: "none" }} 
              ref={coverInputRef}
              onChange={(e) => handleImageUpload(e, setCoverPreview)}
            />
            <div 
              onClick={() => coverInputRef.current?.click()} 
              style={{ position: "relative", border: "1.5px dashed var(--cn-border)", borderRadius: "14px", height: "130px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "var(--cn-surface)", overflow: "hidden" }}
            >
              {!coverPreview ? (
                <div style={{ textAlign: "center", color: "var(--cn-gray-light)" }}>
                  <i className="ti ti-cloud-upload" style={{ fontSize: "26px", display: "block", margin: "0 auto 6px" }}></i>
                  <div style={{ fontSize: "12px" }}>Click to upload cover</div>
                </div>
              ) : (
                <>
                  <img src={coverPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Cover Preview" />
                  <button 
                    onClick={(e) => removeImage(e, setCoverPreview, coverInputRef)} 
                    style={{ position: "absolute", top: "6px", right: "6px", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", color: "#fff", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <label>YouTube channel</label>
        <input 
          id="f-youtube"
          placeholder="https://youtube.com/@yourchurch" 
          value={formData.youtube || ""}
          onChange={(e) => {
            updateFormData({ youtube: e.target.value });
            if (error) setError(null);
          }}
          style={{ marginBottom: error ? "4px" : "24px", border: error ? "1.5px solid red" : "" }}
        />
        {error && <div style={{ color: "red", fontSize: "12px", marginBottom: "20px" }}>{error}</div>}

        <label>About your church</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ height: "130px", resize: "none", marginBottom: "12px", width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid var(--cn-border)", fontSize: "14px", outline: "none", fontFamily: "inherit" }} 
          placeholder="Tell people about your church — vision, community, what to expect when they visit..."
        ></textarea>
        
        <button style={{ background: "#f5f3ff", border: "1.5px solid #ede9fe", color: "var(--cn-purple-dark)", borderRadius: "10px", padding: "9px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <i className="ti ti-sparkles" style={{ fontSize: "14px" }}></i> Write with AI
        </button>
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
