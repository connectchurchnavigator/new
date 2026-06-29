"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Step1Profile from "@/components/add-church/steps/Step1Profile";
import Step2Contact from "@/components/add-church/steps/Step2Contact";
import Step3Ministry from "@/components/add-church/steps/Step3Ministry";
import Step4Languages from "@/components/add-church/steps/Step4Languages";
import Step5Facilities from "@/components/add-church/steps/Step5Facilities";
import Step6Media from "@/components/add-church/steps/Step6Media";
import Step7Extras from "@/components/add-church/steps/Step7Extras";
import Step9Review from "@/components/add-church/steps/Step9Review";
export default function StepPage() {
  const params = useParams();
  const router = useRouter();
  const step = params?.step as string;

  const handleNext = (nextStep: number) => {
    router.push(`/add-church/${nextStep}`);
  };

  const isReviewStep = step === "8";

  return (
    <>
      {!isReviewStep && (
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ fontSize: "30px", fontWeight: 800, color: "var(--cn-ink)", marginBottom: "8px" }}>Add your church</div>
          <div style={{ fontSize: "14px", color: "var(--cn-gray)" }}>
            Fill in your details below — it only takes a couple of minutes.<br/>Required fields are marked.
          </div>
        </div>
      )}



      {step === "1" && <Step1Profile onNext={() => handleNext(2)} />}
      {step === "2" && <Step2Contact onBack={() => router.push(`/add-church/1`)} onNext={() => handleNext(3)} />}
      {step === "3" && <Step3Ministry onBack={() => router.push(`/add-church/2`)} onNext={() => handleNext(4)} />}
      {step === "4" && <Step4Languages onBack={() => router.push(`/add-church/3`)} onNext={() => handleNext(5)} />}
      {step === "5" && <Step5Facilities onBack={() => router.push(`/add-church/4`)} onNext={() => handleNext(6)} />}
      {step === "6" && <Step6Media onBack={() => router.push(`/add-church/5`)} />}
      {step === "7" && <Step7Extras onBack={() => router.push(`/add-church/6`)} onNext={() => handleNext(8)} />}
      {step === "8" && <Step9Review />}
      {parseInt(step) > 8 && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h2>Step {step} Content Coming Soon...</h2>
          <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
            <button className="btn-secondary" onClick={() => router.push(`/add-church/${parseInt(step) - 1}`)}>Back</button>
            <button className="btn-primary" onClick={() => handleNext(parseInt(step) + 1)}>Next</button>
          </div>
        </div>
      )}
    </>
  );
}
