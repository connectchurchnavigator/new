"use client";

import React from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import logoImg from "@/Assets/logo (1).png";
import StepBar from "@/components/add-church/StepBar";

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const currentStep = parseInt((params?.step as string) || "1", 10);
  const totalSteps = 6;

  return (
    <div style={{ background: "#fff", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(244,63,94,0.05), transparent 70%)", top: "-150px", right: "-100px", pointerEvents: "none" }}></div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px 180px", position: "relative", zIndex: 1 }}>
        {/* Form Wizard Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Image src={logoImg} alt="ChurchNavigator Logo" width={180} height={48} style={{ objectFit: "contain" }} />
            </div>
          </div>
          <button className="btn-secondary" onClick={() => router.push("/add-church")}>
            <i className="ti ti-device-floppy" style={{ fontSize: "14px" }}></i> Save & exit
          </button>
        </div>

        {/* Step Progress Bar with Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
          <StepBar currentStep={currentStep} />
          <div style={{ fontSize: "13px", color: "var(--cn-gray)", fontWeight: 600, flexShrink: 0 }}>
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        <button onClick={() => router.push("/add-church")} className="btn-secondary" style={{ marginBottom: "28px" }}>
          <i className="ti ti-arrow-left" style={{ fontSize: "14px" }}></i> Choose another way
        </button>

        {/* Dynamic Step Content Injected Here */}
        {children}
      </div>
    </div>
  );
}
