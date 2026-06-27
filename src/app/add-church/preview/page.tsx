"use client";

import React from "react";
import { useFormContext } from "@/context/FormContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logoImg from "@/Assets/logo (1).png";

export default function PreviewListing() {
  const { formData } = useFormContext();
  const router = useRouter();

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

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", animation: "slideUp 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Image src={logoImg} alt="ChurchNavigator Logo" width={160} height={42} style={{ objectFit: "contain" }} />
        </div>
        <button onClick={() => router.push("/add-church/1")} className="btn-secondary">
          <i className="ti ti-pencil" style={{ fontSize: "14px" }}></i> Edit Listing
        </button>
      </div>

      <div className="scard" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ height: "150px", background: formData.cover ? `url(${formData.cover}) center/cover no-repeat` : "var(--cn-grad)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {!formData.cover && <i className="ti ti-photo" style={{ fontSize: "30px", color: "rgba(255,255,255,0.6)" }}></i>}
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
            {(formData.email || formData.phone || formData.youtube || formData.facebook || formData.instagram || formData.twitter || formData.tiktok) && (
              <SectionWrap>
                <SectionHeader icon="ti-address-book" title="Contact" />
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--cn-ink)" }}>
                  {formData.email && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><i className="ti ti-mail" style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i> {formData.email}</div>}
                  {formData.phone && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><i className="ti ti-phone" style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i> {formData.phone}</div>}
                  {formData.facebook && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><i className="ti ti-brand-facebook" style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i> {formData.facebook}</div>}
                  {formData.instagram && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><i className="ti ti-brand-instagram" style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i> {formData.instagram}</div>}
                  {formData.youtube && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><i className="ti ti-brand-youtube" style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i> {formData.youtube}</div>}
                  {formData.twitter && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><i className="ti ti-brand-x" style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i> {formData.twitter}</div>}
                  {formData.tiktok && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><i className="ti ti-brand-tiktok" style={{ fontSize: "14px", color: "var(--cn-purple)" }}></i> {formData.tiktok}</div>}
                </div>
              </SectionWrap>
            )}

            {/* SERVICES */}
            {formData.services && formData.services.length > 0 && formData.services[0].name && (
              <SectionWrap>
                <SectionHeader icon="ti-clock" title="Service times" />
                {formData.services.map((svc: any) => svc.name && (
                  <div key={svc.id} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--cn-ink)", padding: "6px 0" }}>
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
                  {formData.ministries.map((min: string) => <Chip key={min} text={min} />)}
                </div>
              </SectionWrap>
            )}

            {/* LANGUAGES */}
            {formData.languages && formData.languages.length > 0 && (
              <SectionWrap>
                <SectionHeader icon="ti-language" title="Languages" />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {formData.languages.map((lang: string) => <Chip key={lang} text={lang} />)}
                </div>
              </SectionWrap>
            )}

            {/* FACILITIES */}
            {formData.facilities && formData.facilities.length > 0 && (
              <SectionWrap>
                <SectionHeader icon="ti-accessible" title="Facilities" />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {formData.facilities.map((fac: string) => <Chip key={fac} text={fac} />)}
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
          </div>

        </div>
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "28px" }}>
        <button onClick={() => router.push("/add-church/success")} className="btn-secondary">
          <i className="ti ti-arrow-left" style={{ fontSize: "14px" }}></i> Back
        </button>
      </div>
    </div>
  );
}
