import React from "react";
import { useRouter } from "next/navigation";

interface StepBarProps {
  currentStep: number;
}

export default function StepBar({ currentStep }: StepBarProps) {
  const router = useRouter();

  const stepsData = [
    { id: 1, icon: "ti-building-church", title: "Basics" },
    { id: 2, icon: "ti-phone", title: "Contact" },
    { id: 3, icon: "ti-check", title: "Ministry" },
    { id: 4, icon: "ti-language", title: "Languages" },
    { id: 5, icon: "ti-accessible", title: "Facilities" },
    { id: 6, icon: "ti-photo", title: "Media" },
  ];

  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 0, flex: 1 }}>
      {stepsData.map((step, index) => {
        const isDone = currentStep > step.id;
        const isActive = currentStep === step.id;
        const isPending = currentStep < step.id;

        return (
          <React.Fragment key={step.id}>
            <div className="step-wrap" onClick={() => {
              if (isDone || isActive) router.push(`/add-church/${step.id}`);
            }}>
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
              <div style={{ flex: 1, display: "flex", alignItems: "center", height: "46px" }}>
                <div className={`step-connector ${currentStep > step.id ? "done" : ""}`}></div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
