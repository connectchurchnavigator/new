"use client";

import React from "react";
import { FormProvider } from "@/context/FormContext";
import TopNav from "@/components/layout/TopNav";

export default function AddChurchLayout({ children }: { children: React.ReactNode }) {
  return (
    <FormProvider>
      <TopNav />
      {children}
    </FormProvider>
  );
}
