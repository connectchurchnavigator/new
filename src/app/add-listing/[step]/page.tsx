"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StepBar3 from "@/components/add-church/StepBar3";
import Step1New from "@/components/add-church/steps/Step1New";
import Step2New from "@/components/add-church/steps/Step2New";
import Step3New from "@/components/add-church/steps/Step3New";
import Step9Review from "@/components/add-church/steps/Step9Review";
import { useFormContext } from "@/context/FormContext";

export default function StepPage() {
  const params = useParams();
  const router = useRouter();
  const stepStr = params?.step as string;
  const currentStep = parseInt(stepStr || "1");
  const { updateFormData } = useFormContext();
  const [toastMsg, setToastMsg] = useState("");

  const handleNext = (nextStep: number) => {
    router.push(`/add-listing/${nextStep}`);
  };

  const handleBack = (prevStep: number) => {
    router.push(`/add-listing/${prevStep}`);
  };

  const handleLoadSampleData = () => {
    if (currentStep === 1) {
      updateFormData({
        churchName: "Grace Cathedral International",
        customSlug: "grace-cathedral-international",
        denomination: "Pentecostal",
        country: "United Kingdom",
        address: "124 Westminster Bridge Road, London, SE1 7XW",
        phone: "+44 20 7946 0912",
        email: "info@gracecathedral.org.uk",
        website: "https://gracecathedral.org.uk",
        establishedYear: "1998",
        latitude: 51.4988,
        longitude: -0.1165,
      });
      setToastMsg("✨ Sample basic info & address loaded for Step 1!");
    } else if (currentStep === 2) {
      updateFormData({
        services: [
          { id: 1, day: "Sunday", name: "Morning Celebration Service", from: "10:00 AM", to: "12:00 PM", format: "inperson" },
          { id: 2, day: "Wednesday", name: "Midweek Bible Study & Prayer", from: "07:00 PM", to: "08:30 PM", format: "hybrid" },
          { id: 3, day: "Friday", name: "Youth Night & Fellowship", from: "06:30 PM", to: "08:30 PM", format: "inperson" }
        ]
      });
      setToastMsg("✨ Sample service schedule loaded for Step 2!");
    } else if (currentStep === 3) {
      updateFormData({
        description: "Grace Cathedral International is a vibrant, multi-generational community dedicated to worship, empowering families, and impacting our community with the love and truth of Jesus Christ.",
        establishedYear: "1998",
        pastorName: "Dr. Emmanuel Adeyemi",
        pastorBio: "Dr. Emmanuel Adeyemi has ministered for over 22 years, mentoring church leaders and passionately proclaiming the Gospel of grace.",
        pastorPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        logo: "https://images.unsplash.com/photo-1548625361-195fe5787123?w=200&q=80",
        coverBanners: ["https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&q=80"],
        galleryImages: [
          "https://images.unsplash.com/photo-1548625361-195fe5787123?w=800&q=80",
          "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&q=80",
          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80"
        ],
        ministries: ["Youth & Young Adults", "Children & Family", "Community Foodbank", "Worship & Creative Arts", "Men's Fellowship", "Women of Grace"],
        languages: ["English", "French", "Spanish"],
        socialFacebook: "https://facebook.com/gracecathedral",
        socialInstagram: "https://instagram.com/gracecathedral",
        socialYouTube: "https://youtube.com/@gracecathedral",
        socialX: "https://x.com/gracecathedral",
        socialWebsite: "https://gracecathedral.org.uk",
        liveStreamUrl: "https://youtube.com/live/gracecathedral",
      });
      setToastMsg("✨ Sample media, ministries & pastor profile loaded for Step 3!");
    } else {
      updateFormData({
        churchName: "Grace Cathedral International",
        customSlug: "grace-cathedral-international",
        denomination: "Pentecostal",
        country: "United Kingdom",
        address: "124 Westminster Bridge Road, London, SE1 7XW",
        phone: "+44 20 7946 0912",
        email: "info@gracecathedral.org.uk",
        website: "https://gracecathedral.org.uk",
        establishedYear: "1998",
        latitude: 51.4988,
        longitude: -0.1165,
        services: [
          { id: 1, day: "Sunday", name: "Morning Celebration Service", from: "10:00 AM", to: "12:00 PM", format: "inperson" },
          { id: 2, day: "Wednesday", name: "Midweek Bible Study & Prayer", from: "07:00 PM", to: "08:30 PM", format: "hybrid" }
        ],
        description: "Grace Cathedral International is a vibrant community dedicated to worship and community empowerment.",
        pastorName: "Dr. Emmanuel Adeyemi",
        pastorBio: "Dr. Emmanuel Adeyemi has ministered for over 22 years.",
        ministries: ["Youth & Young Adults", "Children & Family", "Community Foodbank"],
        languages: ["English", "French"]
      });
      setToastMsg("✨ Full sample church profile loaded!");
    }

    setTimeout(() => setToastMsg(""), 4500);
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh", position: "relative" }}>
      {/* Top Header */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px 60px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="brand-mark"><i className="ti ti-building-church" style={{ fontSize: "18px", color: "#fff" }}></i></div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--cn-ink)" }}>Add Your Church</div>
              <div style={{ fontSize: "12.5px", color: "var(--cn-gray)" }}>Step {currentStep} of 4</div>
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
              title={`Pre-fill Step ${currentStep} with sample church details`}
            >
              <i className="ti ti-sparkles" style={{ fontSize: "16px", color: "#9333ea" }}></i>
              Load Sample Data
            </button>
            <button className="btn-secondary" onClick={() => router.push('/add-listing')}>
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

        {/* Step Bar */}
        <div style={{ marginBottom: "44px" }}>
          <StepBar3 currentStep={currentStep} />
        </div>

        {/* Step Components */}
        {currentStep === 1 && <Step1New onNext={() => handleNext(2)} />}
        {currentStep === 2 && <Step2New onBack={() => handleBack(1)} onNext={() => handleNext(3)} />}
        {currentStep === 3 && <Step3New onBack={() => handleBack(2)} onNext={() => handleNext(4)} />}
        {currentStep === 4 && <Step9Review />}
      </div>
    </div>
  );
}
