"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Team {
  id: string;
  name: string;
  ministryType: string;
  accentColor: string;
  tagline: string;
  coverImage: string;
  about: string;
  activities: string; // newline separated
  joinInfo: string;
  impact: string;
  schedule: string;
  leaderName: string;
  leaderRole: string;
  leaderPhoto: string;
  membersPhotos: string[];
  galleryImages: string[];
  videoUrl: string;
}

export interface Branch {
  id: string;
  name: string;
  country: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface FormData {
  listingType: string;
  churchName: string;
  denomination: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  establishedYear: string;
  liveStreamUrl: string;
  socialInstagram: string;
  socialFacebook: string;
  socialX: string;
  galleryImages: string[];
  coverBanners: string[];
  branches: Branch[];
  teams: Team[];
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
  establishedYear: "",
  liveStreamUrl: "",
  socialInstagram: "",
  socialFacebook: "",
  socialX: "",
  galleryImages: [],
  coverBanners: [],
  branches: [],
  teams: [],
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
        try {
          // Create a copy for storage and strip out potentially huge base64 strings
          const storageData = { ...newData };
          
          // Helper to remove base64 strings from an object or array
          const stripBase64 = (val: any): any => {
            if (typeof val === 'string' && val.startsWith('data:image')) return '';
            if (Array.isArray(val)) return val.map(stripBase64);
            return val;
          };
          
          for (const key in storageData) {
            storageData[key] = stripBase64(storageData[key]);
          }
          
          localStorage.setItem('churchFormData', JSON.stringify(storageData));
        } catch (error) {
          console.warn("Could not save to localStorage (quota likely exceeded):", error);
        }
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
