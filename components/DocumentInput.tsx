"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { AnalysisResult } from "@/lib/types";

interface DocumentInputProps {
  onAnalysisComplete: (result: AnalysisResult, rawText: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  initialPreset?: string | null;
}

const PRESET_DOCUMENTS: Record<string, { title: string; subtitle: string; tag: string; path: string; personaNotice: string }> = {
  chennai_rental: {
    title: "Priya's Chennai Rental Agreement",
    subtitle: "11-month lease with 10-month deposit, 7-day eviction, & painting penalties",
    tag: "Persona Spotlight",
    path: "/presets/chennai-rental-agreement.txt",
    personaNotice: "Target Persona: Priya, first-time tenant in Velachery, Chennai facing 10 months deposit & 7-day eviction clause.",
  },
  tech_offer: {
    title: "Tech Startup Employment & Non-Compete",
    subtitle: "Full-time offer with 2-yr void non-compete, 90-day notice, & bonus clawback",
    tag: "Employment",
    path: "/presets/tech-employment-contract.txt",
    personaNotice: "Target Persona: Software engineer evaluating offer with restrictive covenants in Bengaluru.",
  },
};

export function DocumentInput({
  onAnalysisComplete,
  isLoading,
  setIsLoading,
  initialPreset,
}: DocumentInputProps) {
  const [activeTab, setActiveTab] = useState<"paste" | "upload" | "presets">("presets");
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>("chennai_rental");
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load preset content into textarea
  const loadPreset = async (presetKey: string) => {
    setSelectedPresetKey(presetKey);
    setError(null);
    try {
      const res = await fetch(`/api/preset?key=${presetKey}`);
      if (!res.ok) {
        throw new Error("Failed to load preset");
      }
      const data = await res.json();
      setInputText(data.content);
      setActiveTab("paste");
    } catch {
      setError("Could not load sample document. You can paste your own text directly.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit. Please upload a smaller document.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    setError(null);

    if (activeTab === "upload" && !selectedFile) {
      setError("Please select a PDF or plain text document to upload.");
      return;
    }

    if (activeTab !== "upload" && (!inputText || inputText.trim().length < 50)) {
      setError("Please paste or select a legal document with at least 50 characters.");
      return;
    }

    setIsLoading(true);
    setLoadingStep("Reading document & sanitizing input...");

    try {
      let response: Response;

      if (activeTab === "upload" && selectedFile) {
        setLoadingStep("Extracting clauses from PDF...");
        const formData = new FormData();
        formData.append("file", selectedFile);
        response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
      } else {
        setLoadingStep("Analyzing clauses & scanning red flags with Gemini...");
        response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText }),
        });
      }

      setLoadingStep("Categorizing obligations & generating plain-language summaries...");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to analyze document.");
      }

      onAnalysisComplete(result.data, inputText || selectedFile?.name || "Uploaded Document");
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <section aria-label="Document Input and Analysis" className="space-y-6">
      {/* Persona Callout Banner */}
      <div className="bg-gradient-to-r from-nyaya-900 via-nyaya-850 to-nyaya-900 border border-nyaya-700/60 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-gold-500/20 text-gold-300 font-bold text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-gold-500/30">
                Priya&apos;s Persona Spotlight
              </span>
              <span className="text-xs text-slate-400">Chennai Rental Case Study</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Reviewing an agreement without a lawyer?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Priya is renting a 2BHK in Chennai and was handed an 11-month contract with 10 months deposit, 7-day eviction notice, and painting deductions. NyayaSetu deconstructs every clause, detects one-sided traps, and provides plain English, Hindi, and Tamil rewrites.
            </p>
          </div>
          <button
            onClick={() => loadPreset("chennai_rental")}
            className="shrink-0 flex items-center space-x-2 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-nyaya-950 font-bold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-gold-500/20 transition-all text-xs sm:text-sm"
          >
            <span>Load Priya&apos;s Lease</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Input Mode Tabs */}
      <div className="bg-nyaya-900/80 border border-nyaya-800 rounded-2xl p-4 sm:p-6 shadow-lg space-y-4">
        <div className="flex border-b border-nyaya-800 gap-2 sm:gap-4 pb-3" role="tablist" aria-label="Input Method">
          <button
            role="tab"
            aria-selected={activeTab === "presets"}
            aria-controls="panel-presets"
            id="tab-presets"
            onClick={() => setActiveTab("presets")}
            className={`flex items-center space-x-2 pb-2 px-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === "presets"
                ? "border-gold-400 text-gold-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Sample Presets</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "paste"}
            aria-controls="panel-paste"
            id="tab-paste"
            onClick={() => setActiveTab("paste")}
            className={`flex items-center space-x-2 pb-2 px-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === "paste"
                ? "border-gold-400 text-gold-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Agreement Text</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "upload"}
            aria-controls="panel-upload"
            id="tab-upload"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center space-x-2 pb-2 px-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === "upload"
                ? "border-gold-400 text-gold-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload PDF / TXT</span>
          </button>
        </div>

        {/* Tab 1: Presets */}
        {activeTab === "presets" && (
          <div id="panel-presets" role="tabpanel" aria-labelledby="tab-presets" className="space-y-4 pt-2">
            <p className="text-xs sm:text-sm text-slate-400">
              Select a pre-loaded real-world legal contract to test immediate clause deconstruction and risk detection:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(PRESET_DOCUMENTS).map(([key, item]) => (
                <div
                  key={key}
                  onClick={() => loadPreset(key)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left space-y-2 relative ${
                    selectedPresetKey === key
                      ? "bg-nyaya-800/80 border-gold-400/80 ring-1 ring-gold-400/50 shadow-md"
                      : "bg-nyaya-900/60 border-nyaya-800 hover:border-nyaya-700 hover:bg-nyaya-850"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-nyaya-700 text-gold-300">
                      {item.tag}
                    </span>
                    {selectedPresetKey === key && (
                      <CheckCircle2 className="w-4 h-4 text-gold-400" />
                    )}
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm sm:text-base">{item.title}</h3>
                  <p className="text-xs text-slate-400">{item.subtitle}</p>
                  <div className="pt-2">
                    <span className="text-xs text-gold-400 font-semibold inline-flex items-center space-x-1">
                      <span>Click to load and inspect clauses</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Paste Text */}
        {activeTab === "paste" && (
          <div id="panel-paste" role="tabpanel" aria-labelledby="tab-paste" className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label htmlFor="contract-paste" className="text-xs sm:text-sm font-semibold text-slate-200">
                Paste contract, offer letter, or agreement text:
              </label>
              <span className="text-xs text-slate-400">
                {inputText.length.toLocaleString()} characters
              </span>
            </div>
            <textarea
              id="contract-paste"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your legal document here (e.g. Residential Tenancy Agreement, Employment Offer Letter, Service Agreement, NDA)..."
              rows={10}
              className="w-full bg-nyaya-950 border border-nyaya-800 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 font-mono transition-colors"
            />
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Supports contracts up to 100,000 characters. In-memory processing only.</span>
              {inputText.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInputText("")}
                  className="text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Clear text
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Upload File */}
        {activeTab === "upload" && (
          <div id="panel-upload" role="tabpanel" aria-labelledby="tab-upload" className="space-y-4 pt-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setSelectedFile(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-nyaya-700 hover:border-gold-400/80 bg-nyaya-950/60 rounded-xl p-8 text-center cursor-pointer transition-colors space-y-3"
            >
              <Upload className="w-8 h-8 text-gold-400 mx-auto" />
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {selectedFile ? selectedFile.name : "Click to browse or drag & drop PDF/TXT document"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PDF or plain text files up to 10MB. Document text is extracted in memory and never saved.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload PDF or plain text file"
              />
            </div>
            {selectedFile && (
              <div className="flex items-center justify-between bg-nyaya-850 p-3 rounded-xl border border-nyaya-700 text-xs text-slate-200">
                <span className="truncate max-w-md">Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-rose-400 hover:underline font-semibold ml-2"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div role="alert" className="flex items-start space-x-2 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button & Loading Status */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {isLoading ? (
              <div className="flex items-center space-x-2 text-gold-400 font-medium animate-pulse">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{loadingStep || "Processing with NyayaSetu..."}</span>
              </div>
            ) : (
              <span>Tip: Review both the Summary and the Red Flags before signing!</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-lg transition-all ${
              isLoading
                ? "bg-nyaya-800 text-slate-400 cursor-not-allowed"
                : "bg-gold-500 hover:bg-gold-400 text-nyaya-950 shadow-gold-500/20 hover:scale-[1.02]"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? "Analyzing Document..." : "Analyze Clauses & Detect Risks"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
