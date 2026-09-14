"use client";

import React, { useState } from "react";
import { DocumentInput } from "@/components/DocumentInput";
import { RiskRadar } from "@/components/RiskRadar";
import { SummaryCards } from "@/components/SummaryCards";
import { GroundedChat } from "@/components/GroundedChat";
import { AnalysisResult } from "@/lib/types";
import {
  ShieldAlert,
  FileText,
  MessageSquareQuote,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [rawText, setRawText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<"redflags" | "clauses" | "chat">("redflags");

  const handleAnalysisComplete = (result: AnalysisResult, text: string) => {
    setAnalysis(result);
    setRawText(text);
    setActiveView("redflags");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setRawText("");
  };

  return (
    <div className="space-y-10">
      {/* Top Banner / Hero when no document is active */}
      {!analysis && (
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-4 pb-2">
          <div className="inline-flex items-center space-x-2 bg-gold-500/10 border border-gold-500/20 text-gold-300 text-xs font-bold px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI for Legal Assistance & Access • PromptWars Virtual</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Never Sign a Legal Contract <span className="text-gold-400">Blindly Again</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Built for non-lawyers like <strong className="text-white">Priya in Chennai</strong>. NyayaSetu deconstructs complex rental leases, job offers, and NDAs into plain language, spots one-sided red flags, and gives you counter-negotiation points before you commit.
          </p>
        </section>
      )}

      {/* Main Document Input Area */}
      {!analysis ? (
        <DocumentInput
          onAnalysisComplete={handleAnalysisComplete}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      ) : (
        /* Analyzed Results Workspace */
        <div className="space-y-8 animate-fadeIn">
          {/* Action Header Bar */}
          <div className="bg-nyaya-900/90 border border-nyaya-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                  <span>{analysis.documentType}</span>
                  <span className="text-xs font-mono bg-nyaya-800 text-gold-300 px-2 py-0.5 rounded">
                    Audit Complete
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {analysis.clauses.length} clauses analyzed • {analysis.redFlags.length} red flags found
                </p>
              </div>
            </div>

            <button
              onClick={resetAnalysis}
              className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-nyaya-850 hover:bg-nyaya-800 text-slate-200 border border-nyaya-700 transition-all self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gold-400" />
              <span>Analyze Another Document</span>
            </button>
          </div>

          {/* View Selection Tabs */}
          <div
            className="flex border-b border-nyaya-800 gap-2 sm:gap-6 overflow-x-auto pb-1"
            role="tablist"
            aria-label="Audit Sections"
          >
            <button
              role="tab"
              aria-selected={activeView === "redflags"}
              onClick={() => setActiveView("redflags")}
              className={`flex items-center space-x-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeView === "redflags"
                  ? "border-rose-400 text-rose-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Red Flags & Action Plan ({analysis.redFlags.length})</span>
            </button>

            <button
              role="tab"
              aria-selected={activeView === "clauses"}
              onClick={() => setActiveView("clauses")}
              className={`flex items-center space-x-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeView === "clauses"
                  ? "border-gold-400 text-gold-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Plain-Language Clauses ({analysis.clauses.length})</span>
            </button>

            <button
              role="tab"
              aria-selected={activeView === "chat"}
              onClick={() => setActiveView("chat")}
              className={`flex items-center space-x-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeView === "chat"
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquareQuote className="w-4 h-4" />
              <span>Ask-The-Document (Grounded Q&A)</span>
            </button>
          </div>

          {/* Active View Content */}
          <div className="pt-2">
            {activeView === "redflags" && <RiskRadar analysis={analysis} />}
            {activeView === "clauses" && <SummaryCards clauses={analysis.clauses} />}
            {activeView === "chat" && (
              <GroundedChat documentText={rawText} documentTitle={analysis.documentType} />
            )}
          </div>
        </div>
      )}

      {/* Feature & Persona Highlights (when on landing) */}
      {!analysis && (
        <section className="pt-8 border-t border-nyaya-900 space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Designed for Non-Lawyers, Grounded in Indian Law
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              How NyayaSetu bridges the gap between legalese and consumer protection:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-nyaya-900/40 border border-nyaya-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-100 text-base">Red-Flag Radar</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Flags hidden pitfalls like 10-month rental deposits, 7-day sudden evictions, and void non-compete clauses under Section 27 of the Indian Contract Act.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-nyaya-900/40 border border-nyaya-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-100 text-base">Plain English, Hindi & Tamil</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deconstructs clauses into 5 intuitive buckets (Money, Termination, Obligations) and translates them into simple everyday language.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-nyaya-900/40 border border-nyaya-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-100 text-base">Zero-Persistence Privacy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your private contracts are processed strictly in server RAM per request. No documents are ever written to disk or recorded to a database.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
