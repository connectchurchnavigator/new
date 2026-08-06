"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import StepBar3 from "@/components/add-church/StepBar3";
import Step1New from "@/components/add-church/steps/Step1New";
import Step2New from "@/components/add-church/steps/Step2New";
import Step3New from "@/components/add-church/steps/Step3New";
import Step9Review from "@/components/add-church/steps/Step9Review";

export default function StepPage() {
  const params = useParams();
  const router = useRouter();
  const stepStr = params?.step as string;
  const currentStep = parseInt(stepStr || "1");

  const handleNext = (nextStep: number) => {
    router.push(`/onboarding/church/${nextStep}`);
  };

  const handleBack = (prevStep: number) => {
    router.push(`/onboarding/church/${prevStep}`);
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh", position: "relative" }}>
      {/* Top Header */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px 60px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="brand-mark"><i className="ti ti-building-church" style={{ fontSize: "18px", color: "#fff" }}></i></div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--cn-ink)" }}>Add Your Church</div>
          </div>
          <button className="btn-secondary" onClick={() => router.push('/add-listing')}>
            <i className="ti ti-x" style={{ fontSize: "14px" }}></i> Exit
          </button>
        </div>

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
