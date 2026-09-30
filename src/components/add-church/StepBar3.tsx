import React from "react";
import { useRouter } from "next/navigation";

interface StepBarProps {
  currentStep: number;
}

export default function StepBar3({ currentStep }: StepBarProps) {
  const router = useRouter();

  const stepsData = [
    { id: 1, icon: "ti-building-church", title: "Basics & Contact" },
    { id: 2, icon: "ti-clock", title: "Service Times" },
    { id: 3, icon: "ti-photo-heart", title: "Details & Media" },
  ];

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 0, paddingBottom: "24px" }}>
      {stepsData.map((step, index) => {
        const isDone = currentStep > step.id;
        const isActive = currentStep === step.id;

        return (
          <React.Fragment key={step.id}>
            <div 
              className="step-wrap" 
              onClick={() => {
                if (isDone || isActive) router.push(`/onboarding/church/${step.id}`);
              }}
              style={{ cursor: isDone || isActive ? "pointer" : "default" }}
            >
              <div className={`step-icon-outer ${isActive ? "active" : isDone ? "done" : "pending"}`}>
                {isDone ? (
                  <i className="ti ti-check" style={{ fontSize: "20px", color: "#fff" }}></i>
                ) : (
                  <i className={`ti ${step.icon}`} style={{ fontSize: "20px", color: isActive ? "#fff" : "var(--cn-gray-light)" }}></i>
                )}
              </div>
              <div style={{ fontSize: "11px", fontWeight: isActive || isDone ? 700 : 600, color: isActive ? "var(--cn-purple)" : isDone ? "var(--cn-ink)" : "var(--cn-gray-light)", position: "absolute", top: "54px", whiteSpace: "nowrap" }}>
                {step.title}
              </div>
            </div>
            
            {/* Connector line between steps */}
            {index < stepsData.length - 1 && (
              <div style={{ width: "140px", display: "flex", alignItems: "center", height: "46px", marginTop: "0" }}>
                <div className={`step-connector ${currentStep > step.id ? "done" : ""}`} style={{ width: "100%", height: "2px" }}></div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
