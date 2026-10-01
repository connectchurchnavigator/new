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
  const { updateFormData, clearFormData } = useFormContext();
  const [toastMsg, setToastMsg] = useState("");

  // Automatically forward any legacy /add-listing/:step URL to /onboarding/church/:step
  React.useEffect(() => {
    if (stepStr) {
      router.replace(`/onboarding/church/${stepStr}`);
    }
  }, [stepStr, router]);

  const handleNext = (nextStep: number) => {
    router.push(`/onboarding/church/${nextStep}`);
  };

  const handleBack = (prevStep: number) => {
    router.push(`/onboarding/church/${prevStep}`);
  };

  const handleClearDraft = () => {
    if (window.confirm("Are you sure you want to clear your current draft? All entered details will be reset.")) {
      clearFormData();
      setToastMsg("Draft cleared successfully!");
      setTimeout(() => setToastMsg(""), 3500);
      router.push("/onboarding/church/1");
    }
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
              <div style={{ fontSize: "12.5px", color: "var(--cn-gray)" }}>{currentStep === 4 ? "Review & Publish" : `Step ${currentStep} of 3`}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={handleClearDraft}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 16px",
                borderRadius: "12px",
                border: "1.5px solid #fca5a5",
                background: "#fef2f2",
                color: "#dc2626",
                fontSize: "13.5px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(239, 68, 68, 0.1)",
                transition: "all 0.2s",
              }}
              title="Clear all entered data and reset form draft"
            >
              <i className="ti ti-trash" style={{ fontSize: "15px", color: "#dc2626" }}></i>
              Clear Draft
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
