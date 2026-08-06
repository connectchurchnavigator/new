"use client";

import React from "react";
import { FormProvider } from "@/context/FormContext";
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <FormProvider>
      {children}
    </FormProvider>
  );
}
