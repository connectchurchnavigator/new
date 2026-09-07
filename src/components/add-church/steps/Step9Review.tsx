import React, { useState } from "react";
import { useFormContext } from "@/context/FormContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logoImg from "@/Assets/logo (1).png";

export default function Step9Review() {
  const { formData } = useFormContext();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPublishStep, setCurrentPublishStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setCurrentPublishStep(0);

    const stepInterval = setInterval(() => {
      setCurrentPublishStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 900);

    try {
      const res = await fetch('/api/churches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit listing');
      }

      setCurrentPublishStep(4);
      clearInterval(stepInterval);

      localStorage.removeItem('churchFormData');
      const churchName = formData.churchName || formData.name || 'Your Church';
      router.push(`/add-listing/success?slug=${data.church.slug}&name=${encodeURIComponent(churchName)}`);
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const pvEsc = (s: string) => (s || '');
  const SectionHeader = ({ icon, title }: { icon: string, title: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "11.5px", fontWeight: 800, color: "var(--cn-purple-dark)", textTransform: "uppercase", letterSpacing: ".04em", margin: "0 0 10px" }}>
      <i className={`ti ${icon}`} style={{ fontSize: "14px" }}></i> {title}
    </div>
  );
  const SectionWrap = ({ children }: { children: React.ReactNode }) => (
    <div style={{ padding: "16px 0", borderTop: "1px solid var(--cn-border)" }}>{children}</div>
  );
  const Chip = ({ text }: { text: string }) => (
    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--cn-purple-dark)", background: "#f5f3ff", border: "1px solid #ede9fe", padding: "5px 11px", borderRadius: "20px" }}>{text}</span>
  );

  // Profile strength logic (sums to 100%)
  const strengthFields = [
    { label: 'Church name', pts: 10, done: !!formData.name?.trim() },
    { label: 'Denomination', pts: 5, done: !!formData.denomination },
    { label: 'Address', pts: 10, done: !!formData.address?.trim() },
    { label: 'City & country', pts: 5, done: !!(formData.city || formData.country) },
    { label: 'Email', pts: 10, done: !!formData.email?.trim() },
    { label: 'Service times', pts: 10, done: !!(formData.services?.length) },
    { label: 'Ministries', pts: 10, done: !!(formData.ministries?.length) },
    { label: 'Languages', pts: 5, done: !!(formData.languages?.length) },
    { label: 'Facilities', pts: 5, done: !!(formData.facilities?.length) },
    { label: 'Logo / cover', pts: 10, done: !!(formData.logo || formData.coverBanners?.length || formData.cover) },
    { label: 'Photo gallery', pts: 10, done: !!(formData.galleryImages?.length) },
    { label: 'About description', pts: 5, done: !!formData.description?.trim() },
    { label: 'About pastor', pts: 5, done: !!(formData.pastorName?.trim() || formData.pastor_name?.trim() || formData.pastorBio?.trim() || formData.pastor_bio?.trim()) },
  ];

  const totalPoints = strengthFields.reduce((sum, f) => sum + f.pts, 0);
  const earnedPoints = strengthFields.filter(f => f.done).reduce((sum, f) => sum + f.pts, 0);
  const scorePercent = Math.round((earnedPoints / totalPoints) * 100);

  const missingFields = strengthFields.filter(f => !f.done);
  const tipText = missingFields.length > 0 
    ? `Add ${missingFields.slice(0, 2).map(f => f.label.toLowerCase()).join(' & ')} to improve visibility` 
    : 'Your profile is strong — ready to publish!';

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", animation: "slideUp 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Image src={logoImg} alt="ChurchNavigator Logo" width={160} height={42} style={{ objectFit: "contain" }} />
        </div>
        <button onClick={() => router.push("/add-church/3")} className="btn-secondary">
          <i className="ti ti-arrow-left" style={{ fontSize: "14px" }}></i> Back to edit
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ fontSize: "30px", fontWeight: 800, color: "var(--cn-ink)", marginBottom: "8px" }}>Review your listing</div>
        <div style={{ fontSize: "14px", color: "var(--cn-gray)" }}>Here's how your church will look — make sure everything's right before you publish</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px" }}>
        {/* Live preview card (full public-style listing) */}
        <div className="scard" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ height: "150px", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "var(--cn-grad)" }}>
            {formData.coverBanners && formData.coverBanners.length > 0 ? (
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", overflowX: "auto", scrollSnapType: "x mandatory" }}>
                {formData.coverBanners.map((img: string, i: number) => (
                  <div key={i} style={{ minWidth: "100%", height: "100%", background: `url(${img}) center/cover no-repeat`, scrollSnapAlign: "start" }} />
                ))}
                {formData.coverBanners.length > 1 && (
                  <div style={{ position: "absolute", bottom: "8px", right: "8px", background: "rgba(0,0,0,0.6)", color: "#fff", padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: 700 }}>
                    {formData.coverBanners.length} photos
                  </div>
                )}
              </div>
            ) : formData.cover ? (
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: `url(${formData.cover}) center/cover no-repeat` }} />
            ) : (
              <i className="ti ti-photo" style={{ fontSize: "30px", color: "rgba(255,255,255,0.6)", zIndex: 1 }}></i>
            )}
          </div>
          <div style={{ padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "16px" }}>
              <div style={{ width: "58px", height: "58px", borderRadius: "15px", background: formData.logo ? `url(${formData.logo}) center/cover no-repeat` : "var(--cn-grad)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", marginTop: "-44px", border: "3px solid #fff", boxShadow: "0 4px 14px rgba(15,15,26,0.12)", position: "relative", zIndex: 5 }}>
                {!formData.logo && <i className="ti ti-building-church" style={{ fontSize: "26px", color: "#fff" }}></i>}
              </div>
              <div style={{ flex: 1, paddingTop: "2px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--cn-ink)" }}>{formData.name || "Your Church Name"}</div>
                  {formData.denomination && (
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--cn-purple-dark)", background: "#f5f3ff", padding: "3px 9px", borderRadius: "20px" }}>
                      {formData.denomination}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "12.5px", color: "var(--cn-gray)", marginTop: "5px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <i className="ti ti-map-pin" style={{ fontSize: "14px" }}></i> {formData.address ? `${formData.address}${formData.country ? `, ${formData.country}` : ''}` : "123 Example Street"}
                </div>
              </div>
            </div>
            
            <div id="preview-sections">
              {/* CONTACT */}
              {(formData.email || formData.phone || formData.youtube) && (
                <SectionWrap>
                  <SectionHeader icon="ti-address-book" title="Contact" />
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--cn-ink)" }}>
                    {formData.email && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><i className="ti ti-mail" style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i> {formData.email}</div>}
                    {formData.phone && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><i className="ti ti-phone" style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i> {formData.phone}</div>}
                    {formData.youtube && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><i className="ti ti-brand-youtube" style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i> YouTube</div>}
                  </div>
                </SectionWrap>
              )}

              {/* SERVICES */}
              {formData.services && formData.services.length > 0 && formData.services[0].name && (
                <SectionWrap>
                  <SectionHeader icon="ti-clock" title="Service times" />
                  {formData.services.map((svc: any, i: number) => svc.name && (
                    <div key={svc.id || i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--cn-ink)", padding: "6px 0" }}>
                      <b style={{ minWidth: "78px" }}>{svc.day}</b>
                      <span>{svc.name}</span>
                      <span style={{ color: "var(--cn-gray)" }}>{svc.from} - {svc.to}</span>
                      {svc.format && (
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--cn-purple-dark)", background: "#f5f3ff", padding: "2px 7px", borderRadius: "20px", marginLeft: "auto" }}>
                          {svc.format === 'inperson' ? 'In-Person' : svc.format === 'online' ? 'Online' : 'Hybrid'}
                        </span>
                      )}
                    </div>
                  ))}
                </SectionWrap>
              )}

              {/* MINISTRIES */}
              {formData.ministries && formData.ministries.length > 0 && (
                <SectionWrap>
                  <SectionHeader icon="ti-heart-handshake" title="Ministries & outreach" />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {formData.ministries.map((min: string, i: number) => <Chip key={`${min}-${i}`} text={min} />)}
                  </div>
                </SectionWrap>
              )}

              {/* LANGUAGES */}
              {formData.languages && formData.languages.length > 0 && (
                <SectionWrap>
                  <SectionHeader icon="ti-language" title="Languages" />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {formData.languages.map((lang: string, i: number) => <Chip key={`${lang}-${i}`} text={lang} />)}
                  </div>
                </SectionWrap>
              )}

              {/* FACILITIES */}
              {formData.facilities && formData.facilities.length > 0 && (
                <SectionWrap>
                  <SectionHeader icon="ti-accessible" title="Facilities" />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {formData.facilities.map((fac: string, i: number) => <Chip key={`${fac}-${i}`} text={fac} />)}
                  </div>
                </SectionWrap>
              )}

              {/* ABOUT */}
              {formData.description && (
                <SectionWrap>
                  <SectionHeader icon="ti-info-circle" title="About" />
                  <div style={{ fontSize: "13px", color: "var(--cn-ink)", lineHeight: 1.65 }}>{formData.description}</div>
                </SectionWrap>
              )}

              {/* EXTRAS */}
              {(formData.establishedYear || formData.liveStreamUrl || formData.socialInstagram || formData.socialFacebook || formData.socialX) && (
                <SectionWrap>
                  <SectionHeader icon="ti-plug-connected" title="Socials & Extras" />
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--cn-ink)" }}>
                    {formData.establishedYear && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><i className="ti ti-calendar" style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i> Established: {formData.establishedYear}</div>}
                    {formData.liveStreamUrl && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><i className="ti ti-video" style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i> Live Stream Available</div>}
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      {formData.socialInstagram && <i className="ti ti-brand-instagram" style={{ fontSize: "16px", color: "#e1306c" }}></i>}
                      {formData.socialFacebook && <i className="ti ti-brand-facebook" style={{ fontSize: "16px", color: "#1877f2" }}></i>}
                      {formData.socialX && <i className="ti ti-brand-x" style={{ fontSize: "16px", color: "#000" }}></i>}
                    </div>
                  </div>
                </SectionWrap>
              )}

              {/* GALLERY */}
              {formData.galleryImages && formData.galleryImages.length > 0 && (
                <SectionWrap>
                  <SectionHeader icon="ti-photo" title="Gallery" />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "8px" }}>
                    {formData.galleryImages.map((img: string, i: number) => (
                      <div key={i} style={{ width: "100%", paddingTop: "70%", position: "relative", borderRadius: "8px", overflow: "hidden", background: `url(${img}) center/cover no-repeat` }} />
                    ))}
                  </div>
                </SectionWrap>
              )}
            </div>

          </div>
        </div>

        {/* Completion score panel */}
        <div className="scard" style={{ padding: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--cn-gray)", letterSpacing: "0.05em" }}>PROFILE STRENGTH</div>
            <div style={{ fontSize: "24px", fontWeight: 800, background: "var(--cn-grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {scorePercent}%
            </div>
          </div>
          <div style={{ height: "9px", background: "#f1f0f5", borderRadius: "6px", overflow: "hidden", marginBottom: "14px" }}>
            <div style={{ height: "100%", width: `${scorePercent}%`, background: "var(--cn-grad)", transition: "width 0.5s cubic-bezier(.2,.7,.3,1)" }}></div>
          </div>
          <div style={{ fontSize: "12px", color: "var(--cn-gray)", marginBottom: "16px" }}>
            {tipText}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {strengthFields.map(f => (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 11px", borderRadius: "10px", background: f.done ? '#f0fdf4' : '#f9fafb', border: `1px solid ${f.done ? '#bbf7d0' : '#eef0f3'}` }}>
                <i className={`ti ${f.done ? 'ti-circle-check-filled' : 'ti-circle'}`} style={{ fontSize: "15px", color: f.done ? '#16a34a' : '#cbd0d8' }}></i>
                <span style={{ fontSize: "12.5px", fontWeight: 600, color: f.done ? 'var(--cn-ink)' : 'var(--cn-gray-light)' }}>{f.label}</span>
                <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 700, color: f.done ? '#16a34a' : '#cbd0d8' }}>+{f.pts}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: "12px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "8px", fontSize: "14px", marginTop: "24px", textAlign: "center" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "28px" }}>
        <button onClick={() => router.push("/add-church/3")} className="btn-secondary">
          <i className="ti ti-pencil" style={{ fontSize: "14px" }}></i> Keep editing
        </button>
        <button onClick={handleSubmit} className="btn-primary" disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? "Publishing..." : <><i className="ti ti-check" style={{ fontSize: "15px" }}></i> Publish listing</>}
        </button>
      </div>

      {/* Publishing Modal Overlay */}
      {isSubmitting && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "24px", padding: "36px 32px", maxWidth: "480px", width: "100%", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "slideUp 0.3s ease" }}>
            
            {/* Animated Header Icon */}
            <div style={{ width: "64px", height: "64px", margin: "0 auto 20px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px -5px rgba(124,58,237,0.4)" }}>
              <i className="ti ti-sparkles" style={{ fontSize: "28px", color: "#fff" }}></i>
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>Publishing Your Church Listing...</h3>
            <p style={{ fontSize: "13.5px", color: "#64748b", margin: "0 0 24px" }}>Please wait while we set up your public profile and navigation.</p>

            {/* Dynamic Step Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left", background: "#f8fafc", padding: "18px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              {[
                { title: "Creating church profile & account", icon: "ti-building-church" },
                { title: "Saving location & contact details", icon: "ti-map-pin" },
                { title: "Noting service times & ministries", icon: "ti-clock" },
                { title: "Processing media & pastor profile", icon: "ti-user-check" },
                { title: "Finalizing public page...", icon: "ti-sparkles" },
              ].map((step, idx) => {
                const isDone = currentPublishStep > idx;
                const isCurrent = currentPublishStep === idx;
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13.5px", fontWeight: isCurrent || isDone ? 700 : 500, color: isDone ? "#15803d" : isCurrent ? "#7c3aed" : "#94a3b8", transition: "all 0.3s" }}>
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: isDone ? "#dcfce7" : isCurrent ? "#f3e8ff" : "#f1f5f9", border: `1.5px solid ${isDone ? "#86efac" : isCurrent ? "#c084fc" : "#cbd5e1"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {isDone ? (
                        <i className="ti ti-check" style={{ fontSize: "13px", color: "#16a34a" }}></i>
                      ) : isCurrent ? (
                        <i className="ti ti-loader-2" style={{ fontSize: "13px", color: "#7c3aed" }}></i>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>{idx + 1}</span>
                      )}
                    </div>
                    <span>{step.title}</span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
