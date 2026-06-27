import React, { useRef, useState } from "react";
import { useFormContext } from "@/context/FormContext";
import { useRouter } from "next/navigation";

const SOCIAL_RULES = {
  youtube: {
    rx: /^(https?:\/\/)?(www\.)?(youtube\.com\/[A-Za-z0-9@._\-\/?=&%]+|youtu\.be\/[A-Za-z0-9\-]+)$/i,
    others: /(facebook\.com|fb\.com|fb\.me|instagram\.com|linkedin\.com|twitter\.com|x\.com|tiktok\.com|t\.me)/i,
    name: 'YouTube',
    ex: 'youtube.com/@yourchurch'
  }
};

const prettyPlatform = (url: string) => {
  if (/facebook\.com|fb\.com|fb\.me/i.test(url)) return "Facebook";
  if (/instagram\.com/i.test(url)) return "Instagram";
  if (/linkedin\.com/i.test(url)) return "LinkedIn";
  if (/twitter\.com|x\.com/i.test(url)) return "Twitter / X";
  if (/tiktok\.com/i.test(url)) return "TikTok";
  if (/t\.me/i.test(url)) return "Telegram";
  return "another platform";
};

const validateYouTubeUrl = (url: string): string | null => {
  const v = url.trim();
  if (!v) return null;
  
  // bare prefilled domain
  if (/^https?:\/\/(www\.)?youtube\.com\/?$/i.test(v)) return null;
  
  const wrong = SOCIAL_RULES.youtube.others.exec(v);
  if (wrong) {
    return `That looks like a ${prettyPlatform(wrong[0])} link — please put your YouTube link here.`;
  }
  
  const ok = SOCIAL_RULES.youtube.rx.test(v);
  if (!ok) {
    return `Enter a valid YouTube link (e.g. youtube.com/@yourchurch).`;
  }
  
  return null;
};

interface Step6MediaProps {
  onBack: () => void;
}

export default function Step6Media({ onBack }: Step6MediaProps) {
  const { formData, updateFormData } = useFormContext();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(formData.logo || null);
  const [coverPreview, setCoverPreview] = useState<string | null>(formData.cover || null);
  const [youtubeError, setYoutubeError] = useState<string | null>(validateYouTubeUrl(formData.youtube || ""));
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

  const handleYoutubeChange = (val: string) => {
    updateFormData({ youtube: val });
    const err = validateYouTubeUrl(val);
    setYoutubeError(err);
  };

  const handleWriteWithAI = () => {
    const name = formData.churchName || "our church";
    const denom = formData.denomination || "";
    const aiText = `${name} is a warm and welcoming ${denom ? denom + " " : ""}community dedicated to faith, fellowship and service. Whether you're visiting for the first time or looking for a church home, you'll find a place to belong, grow and connect with God and others.`;
    setDescription(aiText);
  };

  const handleNext = () => {
    const err = validateYouTubeUrl(formData.youtube || "");
    if (err) {
      setYoutubeError(err);
      setTimeout(() => {
        const el = document.getElementById("f-youtube");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
      return;
    }
    setYoutubeError(null);
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
          onChange={(e) => handleYoutubeChange(e.target.value)}
          className={youtubeError ? "error" : (formData.youtube && formData.youtube.trim() ? "verified" : "")}
          style={{ marginBottom: "24px" }}
        />

        <label>About your church</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ height: "130px", resize: "none", marginBottom: "12px", width: "100%", padding: "12px", borderRadius: "12px", border: "1.5px solid var(--cn-border)", fontSize: "14px", outline: "none", fontFamily: "inherit" }} 
          placeholder="Tell people about your church — vision, community, what to expect when they visit..."
        ></textarea>
        
        <button 
          onClick={handleWriteWithAI} 
          style={{ background: "#f5f3ff", border: "1.5px solid #ede9fe", color: "var(--cn-purple-dark)", borderRadius: "10px", padding: "9px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <i className="ti ti-sparkles" style={{ fontSize: "14px" }}></i> Write with AI
        </button>

        {youtubeError && (
          <div style={{ color: "#ef4444", fontSize: "12.5px", marginTop: "16px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: "14px" }}></i> {youtubeError}
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
