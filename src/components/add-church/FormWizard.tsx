import React, { useState } from "react";
import Step1Profile from "./steps/Step1Profile";

interface FormWizardProps {
  onCancel: () => void;
}

export default function FormWizard({ onCancel }: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
    else onCancel();
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(244,63,94,0.05), transparent 70%)", top: "-150px", right: "-100px", pointerEvents: "none" }}></div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px 60px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="brand-mark"><i className="ti ti-building-church" style={{ fontSize: "18px", color: "#fff" }}></i></div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--cn-ink)" }}>ChurchNavigator</div>
          </div>
          <button className="btn-secondary"><i className="ti ti-device-floppy" style={{ fontSize: "14px" }}></i> Save & exit</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
          <div style={{ flex: 1, display: "flex", gap: "8px" }} className="prog-track">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div key={idx} className={`prog-seg ${idx + 1 < currentStep ? "done" : idx + 1 === currentStep ? "active" : ""}`} />
            ))}
          </div>
          <div style={{ fontSize: "13px", color: "var(--cn-gray)", fontWeight: 600, flexShrink: 0 }}>
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        <button onClick={onCancel} className="btn-secondary" style={{ marginBottom: "28px" }}>
          <i className="ti ti-arrow-left" style={{ fontSize: "14px" }}></i> Choose another way
        </button>

        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ fontSize: "30px", fontWeight: 800, color: "var(--cn-ink)", marginBottom: "8px" }}>Add your church</div>
          <div style={{ fontSize: "14px", color: "var(--cn-gray)" }}>
            Fill in your details below — it only takes a couple of minutes.<br/>Required fields are marked.
          </div>
        </div>

        <div className="ai-bubble">
          <div className="ai-icon"><i className="ti ti-sparkles" style={{ fontSize: "17px", color: "#fff" }}></i></div>
          <div style={{ fontSize: "13px", color: "var(--cn-ink)", lineHeight: 1.6, paddingTop: "3px" }}>
            I'll guide you through this! Let's start with your profile and location.
          </div>
        </div>

        {currentStep === 1 && <Step1Profile onNext={handleNext} />}
        {currentStep > 1 && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h2>Step {currentStep} Content Coming Soon...</h2>
            <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
              <button className="btn-secondary" onClick={handleBack}>Back</button>
              <button className="btn-primary" onClick={handleNext}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
