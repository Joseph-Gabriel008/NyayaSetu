"use client";

import React, { useState } from "react";
import { DocumentInput } from "@/components/DocumentInput";
import { RiskRadar } from "@/components/RiskRadar";
import { SummaryCards } from "@/components/SummaryCards";
import { GroundedChat } from "@/components/GroundedChat";
import { NegotiationGenerator } from "@/components/NegotiationGenerator";
import { AnalysisResult } from "@/lib/types";
import {
  ShieldAlert,
  FileText,
  MessageSquareQuote,
  RotateCcw,
  Sparkles,
  Lock,
  MessageSquareShare,
  HeartHandshake,
  CheckCircle2,
  Scale,
} from "lucide-react";

export default function HomePage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [rawText, setRawText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<"redflags" | "clauses" | "negotiate" | "chat">("redflags");
  const [chatInitialQuery, setChatInitialQuery] = useState<string | null>(null);

  const handleAnalysisComplete = (result: AnalysisResult, text: string) => {
    setAnalysis(result);
    setRawText(text);
    setActiveView("redflags");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAskAboutClause = (clauseTitle: string) => {
    setChatInitialQuery(`Explain this clause and tell me if it is fair or risky: "${clauseTitle}"`);
    setActiveView("chat");
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setRawText("");
    setChatInitialQuery(null);
  };

  return (
    <div className="space-y-10">
      {/* Top Hero Section when no audit is active */}
      {!analysis && (
        <section className="text-center space-y-5 max-w-4xl mx-auto pt-6 pb-2 relative">
          <div className="inline-flex items-center space-x-2 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-lg shadow-amber-500/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI for Legal Assistance & Access • PromptWars Virtual</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-heading font-black text-white tracking-tight leading-[1.15]">
            Never Sign a Legal Agreement{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              Blindly Again.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Designed for non-lawyers like <strong className="text-white">Priya in Chennai</strong>. NyayaSetu deconstructs one-sided leases and job offers, spotlights hidden traps, and writes your counter-proposals in plain English, Hindi, and Tamil.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-400 font-semibold">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Grounded in Indian Law (TNRRRL & Contract Act)</span>
            </span>
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Document Storage / In-Memory RAM Only</span>
            </span>
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>WCAG 2.1 AA Accessible</span>
            </span>
          </div>
        </section>
      )}

      {/* Main Studio Area */}
      {!analysis ? (
        <DocumentInput
          onAnalysisComplete={handleAnalysisComplete}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      ) : (
        /* Results Workspace */
        <div className="space-y-8 animate-fadeIn">
          {/* Action Header Banner */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10 shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-heading font-black text-white flex items-center space-x-2">
                  <span>{analysis.documentType}</span>
                  <span className="text-[11px] font-mono bg-slate-800 text-amber-300 px-2.5 py-0.5 rounded-full border border-slate-700">
                    Audit Complete
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {analysis.clauses.length} clauses categorized • {analysis.redFlags.length} red-flag traps identified
                </p>
              </div>
            </div>

            <button
              onClick={resetAnalysis}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-md transition-all self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Audit Another Document</span>
            </button>
          </div>

          {/* Interactive View Navigation Tabs */}
          <div
            className="flex border-b border-white/10 gap-2 sm:gap-4 overflow-x-auto pb-1.5 no-scrollbar"
            role="tablist"
            aria-label="Audit Sections"
          >
            <button
              role="tab"
              aria-selected={activeView === "redflags"}
              onClick={() => setActiveView("redflags")}
              className={`flex items-center space-x-2 pb-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeView === "redflags"
                  ? "border-rose-400 text-rose-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Red Flags & Traps ({analysis.redFlags.length})</span>
            </button>

            <button
              role="tab"
              aria-selected={activeView === "clauses"}
              onClick={() => setActiveView("clauses")}
              className={`flex items-center space-x-2 pb-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeView === "clauses"
                  ? "border-amber-400 text-amber-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Clause Breakdown ({analysis.clauses.length})</span>
            </button>

            <button
              role="tab"
              aria-selected={activeView === "negotiate"}
              onClick={() => setActiveView("negotiate")}
              className={`flex items-center space-x-2 pb-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeView === "negotiate"
                  ? "border-emerald-400 text-emerald-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquareShare className="w-4 h-4" />
              <span>Compose Counter-Offer</span>
            </button>

            <button
              role="tab"
              aria-selected={activeView === "chat"}
              onClick={() => setActiveView("chat")}
              className={`flex items-center space-x-2 pb-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeView === "chat"
                  ? "border-blue-400 text-blue-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquareQuote className="w-4 h-4" />
              <span>Ask-The-Document AI</span>
            </button>
          </div>

          {/* Active View Container */}
          <div className="pt-2">
            {activeView === "redflags" && (
              <div className="space-y-8">
                <RiskRadar
                  analysis={analysis}
                  onJumpToNegotiator={() => setActiveView("negotiate")}
                />
              </div>
            )}

            {activeView === "clauses" && (
              <SummaryCards
                clauses={analysis.clauses}
                onAskAboutClause={handleAskAboutClause}
              />
            )}

            {activeView === "negotiate" && (
              <NegotiationGenerator
                redFlags={analysis.redFlags}
                documentType={analysis.documentType}
              />
            )}

            {activeView === "chat" && (
              <GroundedChat
                documentText={rawText}
                documentTitle={analysis.documentType}
                initialQuery={chatInitialQuery}
              />
            )}
          </div>
        </div>
      )}

      {/* Feature & Persona Highlights (when landing) */}
      {!analysis && (
        <section className="pt-10 border-t border-white/10 space-y-8">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
              Designed for Non-Lawyers, Grounded in Indian Law
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              How NyayaSetu bridges the gap between dense legalese and real consumer protection:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-3xl p-6 space-y-3.5 border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold border border-rose-500/30">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-white text-lg">Red-Flag Spotter</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Flags hidden pitfalls like 10-month rental deposits, 7-day eviction clauses, and post-employment non-competes rendered void under Section 27 of the Indian Contract Act 1872.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-6 space-y-3.5 border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-white text-lg">Plain English, Hindi & Tamil</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Deconstructs clauses into 5 intuitive buckets (Money, Termination, Your Obligations) and rewrites each clause in everyday language with instant multilingual toggles.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-6 space-y-3.5 border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-white text-lg">Zero-Persistence Privacy</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your private agreements are processed transiently in server memory during your request. No documents are ever recorded to a database or written to disk.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
