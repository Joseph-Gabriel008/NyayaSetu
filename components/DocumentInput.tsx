"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Building,
  Briefcase,
  FileCheck2,
  Lock,
  Zap,
} from "lucide-react";
import { AnalysisResult } from "@/lib/types";

interface DocumentInputProps {
  onAnalysisComplete: (result: AnalysisResult, rawText: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onOpenChatWithClause?: (clauseTitle: string) => void;
}

const PRESET_CARDS = [
  {
    key: "chennai_rental",
    title: "Priya's Chennai Rental Agreement",
    location: "Velachery, Chennai (2BHK)",
    persona: "First-time tenant moving from Madurai",
    category: "Tenancy Lease",
    badge: "Persona Spotlight",
    icon: Building,
    redFlagsPreview: ["10-Month Security Deposit", "7-Day Eviction Notice", "Mandatory Painting Charge"],
    color: "from-amber-500/20 via-slate-900 to-slate-950",
    border: "border-amber-500/40 hover:border-amber-400",
  },
  {
    key: "tech_offer",
    title: "Bengaluru Tech Employment Offer",
    location: "Koramangala, Bengaluru (SDE-2)",
    persona: "Software engineer evaluating offer letter",
    category: "Employment",
    badge: "Career Mobility",
    icon: Briefcase,
    redFlagsPreview: ["2-Year Void Non-Compete", "90-Day Notice Lock-in", "Bonus Clawback + 18% Interest"],
    color: "from-blue-500/20 via-slate-900 to-slate-950",
    border: "border-blue-500/40 hover:border-blue-400",
  },
];

export function DocumentInput({
  onAnalysisComplete,
  isLoading,
  setIsLoading,
}: DocumentInputProps) {
  const [activeTab, setActiveTab] = useState<"presets" | "paste" | "upload">("presets");
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1-Click Instant Analysis for Presets
  const handleInstantPresetAudit = async (presetKey: string) => {
    setError(null);
    setIsLoading(true);
    setLoadingStep("Loading sample contract draft...");

    try {
      const res = await fetch(`/api/preset?key=${presetKey}`);
      if (!res.ok) throw new Error("Could not retrieve preset text.");
      const data = await res.json();
      setInputText(data.content);

      setLoadingStep("Extracting clauses & detecting Indian legal traps...");
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: data.content }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok || !analyzeData.success) {
        throw new Error(analyzeData.error || "Analysis failed.");
      }

      onAnalysisComplete(analyzeData.data, data.content);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const handleManualAnalyze = async () => {
    setError(null);

    if (activeTab === "upload" && !selectedFile) {
      setError("Please select a PDF or plain-text document to upload.");
      return;
    }

    if (activeTab !== "upload" && (!inputText || inputText.trim().length < 50)) {
      setError("Please paste a legal agreement with at least 50 characters.");
      return;
    }

    setIsLoading(true);
    setLoadingStep("Reading document in server memory...");

    try {
      let response: Response;

      if (activeTab === "upload" && selectedFile) {
        setLoadingStep("Extracting text from PDF file...");
        const formData = new FormData();
        formData.append("file", selectedFile);
        response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
      } else {
        setLoadingStep("Deconstructing clauses with Gemini 2.0 Flash...");
        response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText }),
        });
      }

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to analyze document.");
      }

      onAnalysisComplete(result.data, inputText || selectedFile?.name || "Uploaded Contract");
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <section aria-label="Legal Document Studio" className="space-y-6">
      {/* Studio Container */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Subtle Ambient Background Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
              Interactive Legal Clarity Studio
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
              Deconstruct Any Contract in Seconds
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Select a pre-loaded case study below or upload your own agreement to reveal hidden traps.
            </p>
          </div>

          {/* Input Method Selector Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("presets")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "presets"
                  ? "bg-amber-500 text-nyaya-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>1-Click Presets</span>
            </button>

            <button
              onClick={() => setActiveTab("paste")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "paste"
                  ? "bg-amber-500 text-nyaya-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Text</span>
            </button>

            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "upload"
                  ? "bg-amber-500 text-nyaya-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload PDF</span>
            </button>
          </div>
        </div>

        {/* TAB 1: 1-Click Preset Showcase */}
        {activeTab === "presets" && (
          <div className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {PRESET_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.key}
                    className={`rounded-2xl p-6 border transition-all glass-card glass-card-hover bg-gradient-to-b ${card.color} ${card.border} flex flex-col justify-between space-y-4 relative group`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {card.badge}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{card.category}</span>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center shrink-0 text-amber-400 shadow-inner mt-0.5">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-heading font-extrabold text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">{card.location} • {card.persona}</p>
                        </div>
                      </div>

                      {/* Red Flags Preview Tag Cloud */}
                      <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Hidden Traps to Spot:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {card.redFlagsPreview.map((flag, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-lg flex items-center space-x-1"
                            >
                              <ShieldAlert className="w-2.5 h-2.5 text-rose-400" />
                              <span>{flag}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 1-Click Instant Audit CTA */}
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleInstantPresetAudit(card.key)}
                      className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-nyaya-950 flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 group-hover:scale-[1.01] transition-all disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 text-nyaya-950" />
                      <span>{isLoading ? "Running Audit..." : "1-Click Instant Audit"}</span>
                      <ArrowRight className="w-4 h-4 text-nyaya-950" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Paste Agreement Text */}
        {activeTab === "paste" && (
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="contract-editor" className="font-bold text-slate-300">
                Paste contract, offer letter, or agreement text:
              </label>
              <span className="font-mono text-slate-400">
                {inputText.length.toLocaleString()} characters ({inputText.split(/\s+/).filter(Boolean).length} words)
              </span>
            </div>

            <div className="relative">
              <textarea
                id="contract-editor"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste the full text of your legal agreement here (e.g. Residential Tenancy Agreement, Offer Letter, Terms of Service, NDA)..."
                rows={9}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono transition-colors shadow-inner"
              />
              {inputText.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInputText("")}
                  className="absolute top-3 right-3 text-xs text-slate-500 hover:text-rose-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-1 text-emerald-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Encrypted in-memory processing • Never written to disk</span>
              </div>
              <button
                type="button"
                onClick={handleManualAnalyze}
                disabled={isLoading || inputText.trim().length < 50}
                className="px-6 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-nyaya-950 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoading ? "Analyzing..." : "Analyze Pasted Text"}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Upload PDF / TXT File */}
        {activeTab === "upload" && (
          <div className="pt-6 space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setSelectedFile(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-slate-700 hover:border-amber-400 bg-slate-950/50 rounded-2xl p-10 text-center cursor-pointer transition-all space-y-3 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400 group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-200">
                  {selectedFile ? selectedFile.name : "Drag & drop PDF or click to browse"}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Supports .PDF and .TXT documents up to 10MB. Text is parsed securely in server memory and discarded immediately.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
                }}
                className="hidden"
              />
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-slate-200 truncate">{selectedFile.name}</span>
                  <span className="text-slate-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-rose-400 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={handleManualAnalyze}
                    disabled={isLoading}
                    className="px-4 py-1.5 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-nyaya-950 shadow transition-all"
                  >
                    Start Audit
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div role="alert" className="mt-4 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs sm:text-sm flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Progress Feedback */}
        {isLoading && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-3 animate-pulse">
            <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0" />
            <div>
              <span className="text-xs font-bold text-amber-300 block">
                {loadingStep || "AI Processing with NyayaSetu..."}
              </span>
              <span className="text-[11px] text-slate-400">
                Auditing clauses against Indian contract and tenancy statutory benchmarks...
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
