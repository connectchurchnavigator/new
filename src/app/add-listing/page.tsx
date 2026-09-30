"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/layout/TopNav";
import WelcomeScreen from "@/components/add-church/WelcomeScreen";
import ImportScreen from "@/components/add-church/ImportScreen";
import { useFormContext } from "@/context/FormContext";

type ScreenType = "welcome" | "import";

export default function AddChurchPage() {
  const [screen, setScreen] = useState<ScreenType>("welcome");
  const router = useRouter();
  const { updateFormData } = useFormContext();

  const handleSelectForm = (type: string) => {
    updateFormData({ listingType: type });
    if (type === "pastor") {
      router.push("/onboarding/pastor");
    } else if (type === "worship_leader") {
      router.push("/onboarding/worship-leader");
    } else if (type === "events") {
      router.push("/onboarding/events");
    } else {
      router.push("/onboarding/church/1"); // Route to Step 1
    }
  };

  const handleCompleteImport = () => {
    router.push("/onboarding/church/1"); // Route to Step 1 after import
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
