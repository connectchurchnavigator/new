"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import WelcomeScreen from "@/components/add-church/WelcomeScreen";
import ImportScreen from "@/components/add-church/ImportScreen";
import { useFormContext } from "@/context/FormContext";

type ScreenType = "welcome" | "import";

export default function AddChurchNewPage() {
  const [screen, setScreen] = useState<ScreenType>("welcome");
  const router = useRouter();
  const { updateFormData } = useFormContext();

  const handleSelectForm = (type: string) => {
    updateFormData({ listingType: type });
    if (type === "pastor") {
      router.push("/onboarding/pastor");
    } else {
      router.push("/add-church-new/1"); // Route to Step 1 in 3-step flow
    }
  };

  const handleCompleteImport = () => {
    router.push("/add-church-new/1"); // Route to Step 1 in 3-step flow
  };

  return (
    <>
      {screen === "welcome" && (
        <WelcomeScreen 
          onSelectForm={handleSelectForm} 
          onSelectImport={() => setScreen("import")} 
        />
      )}
      {screen === "import" && (
        <ImportScreen 
          onBack={() => setScreen("welcome")} 
          onComplete={handleCompleteImport} 
        />
      )}
    </>
  );
}
