"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type LanguageCode = "en" | "hi" | "ta";
export type FontSizeScale = "sm" | "md" | "lg" | "xl";

interface AccessibilityContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  fontSize: FontSizeScale;
  setFontSize: (size: FontSizeScale) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [fontSize, setFontSize] = useState<FontSizeScale>("md");
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // Apply font scale to <html> element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("font-scale-sm", "font-scale-md", "font-scale-lg", "font-scale-xl");
    root.classList.add(`font-scale-${fontSize}`);
  }, [fontSize]);

  // Apply high contrast class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
  }, [highContrast]);

  const toggleHighContrast = () => setHighContrast((prev) => !prev);

  return (
    <AccessibilityContext.Provider
      value={{
        language,
        setLanguage,
        fontSize,
        setFontSize,
        highContrast,
        toggleHighContrast,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
