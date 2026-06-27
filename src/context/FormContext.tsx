"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface FormData {
  listingType: string;
  churchName: string;
  denomination: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  [key: string]: any;
}

interface FormContextType {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const defaultFormData: FormData = {
  listingType: "church",
  churchName: "",
  denomination: "",
  country: "",
  address: "",
  phone: "",
  email: "",
  website: "",
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('churchFormData');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved form data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => {
      const newData = { ...prev, ...data };
      if (typeof window !== 'undefined') {
        localStorage.setItem('churchFormData', JSON.stringify(newData));
      }
      return newData;
    });
  };

  if (!isLoaded) return null; // Or a loading spinner

  return (
    <FormContext.Provider value={{ formData, updateFormData }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}
