"use client";

import React from "react";
import { useAccessibility, LanguageCode, FontSizeScale } from "./AccessibilityContext";
import { Eye, Languages, ShieldCheck, Type } from "lucide-react";

export function AccessibilityBar() {
  const { language, setLanguage, fontSize, setFontSize, highContrast, toggleHighContrast } =
    useAccessibility();

  const fontOptions: { label: string; value: FontSizeScale; aria: string }[] = [
    { label: "A-", value: "sm", aria: "Small text size" },
    { label: "A", value: "md", aria: "Standard text size" },
    { label: "A+", value: "lg", aria: "Large text size" },
    { label: "A++", value: "xl", aria: "Extra large text size" },
  ];

  const languages: { code: LanguageCode; name: string; label: string }[] = [
    { code: "en", name: "English", label: "Switch to English" },
    { code: "hi", name: "हिन्दी", label: "हिन्दी में अनुवाद देखें (Switch to Hindi)" },
    { code: "ta", name: "தமிழ்", label: "தமிழில் காண்க (Switch to Tamil)" },
  ];

  return (
    <aside
      aria-label="Accessibility and Privacy Controls"
      className="bg-nyaya-950/90 backdrop-blur border-b border-nyaya-800 text-slate-200 text-xs py-2 px-4 sticky top-0 z-50 transition-colors"
    >
      {/* Skip Link for Screen Readers and Keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 bg-gold-500 text-nyaya-950 font-bold px-4 py-2 rounded shadow-lg z-50"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Privacy Guarantee */}
        <div className="flex items-center space-x-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline font-medium">Privacy Guaranteed:</span>
          <span className="text-slate-400">In-memory processing only • Never stored on disk or database</span>
        </div>

        {/* Right: Accessibility Controls */}
        <div className="flex items-center flex-wrap gap-4">
          {/* Language Selector */}
          <div className="flex items-center space-x-1.5" role="group" aria-label="Plain language translation">
            <Languages className="w-3.5 h-3.5 text-gold-400 shrink-0" aria-hidden="true" />
            <span className="sr-only">Translation language:</span>
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                aria-pressed={language === l.code}
                aria-label={l.label}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                  language === l.code
                    ? "bg-gold-500 text-nyaya-950 shadow-sm"
                    : "bg-nyaya-900 text-slate-300 hover:bg-nyaya-800 hover:text-white"
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-nyaya-800 hidden md:block" aria-hidden="true" />

          {/* Font Size Adjuster */}
          <div className="flex items-center space-x-1" role="group" aria-label="Text size scaling">
            <Type className="w-3.5 h-3.5 text-gold-400 shrink-0" aria-hidden="true" />
            <span className="sr-only">Font size:</span>
            {fontOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFontSize(opt.value)}
                aria-pressed={fontSize === opt.value}
                aria-label={opt.aria}
                className={`px-1.5 py-0.5 rounded font-mono font-bold transition-all ${
                  fontSize === opt.value
                    ? "bg-nyaya-600 text-white ring-1 ring-gold-400"
                    : "bg-nyaya-900 text-slate-400 hover:bg-nyaya-800 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-nyaya-800 hidden md:block" aria-hidden="true" />

          {/* High Contrast Mode Toggle */}
          <button
            onClick={toggleHighContrast}
            aria-pressed={highContrast}
            aria-label={highContrast ? "Disable high contrast mode" : "Enable high contrast mode (WCAG AAA)"}
            className={`flex items-center space-x-1 px-2.5 py-0.5 rounded font-semibold transition-all ${
              highContrast
                ? "bg-yellow-400 text-black ring-2 ring-white font-bold"
                : "bg-nyaya-900 text-slate-300 hover:bg-nyaya-800 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>High Contrast</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
