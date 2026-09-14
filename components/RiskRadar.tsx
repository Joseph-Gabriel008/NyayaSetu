"use client";

import React, { useState } from "react";
import { AnalysisResult, RiskFlag } from "@/lib/types";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  FileQuestion,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface RiskRadarProps {
  analysis: AnalysisResult;
  onJumpToNegotiator?: () => void;
}

export function RiskRadar({ analysis, onJumpToNegotiator }: RiskRadarProps) {
  const [copiedActionPlan, setCopiedActionPlan] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "high" | "medium">("all");

  const filteredFlags =
    selectedFilter === "all"
      ? analysis.redFlags
      : analysis.redFlags.filter((f) => f.level === selectedFilter);

  const copyActionPlan = () => {
    const planText = analysis.negotiationActionPlan.join("\n");
    navigator.clipboard.writeText(planText);
    setCopiedActionPlan(true);
    setTimeout(() => setCopiedActionPlan(false), 2500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 65) return "text-rose-400 border-rose-500 bg-rose-950/40 glow-rose";
    if (score >= 35) return "text-amber-400 border-amber-500 bg-amber-950/40 glow-amber";
    return "text-emerald-400 border-emerald-500 bg-emerald-950/40 glow-emerald";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 65) return "bg-gradient-to-r from-amber-500 to-rose-500";
    if (score >= 35) return "bg-gradient-to-r from-yellow-500 to-amber-500";
    return "bg-gradient-to-r from-emerald-500 to-teal-400";
  };

  return (
    <section aria-label="Contract Risk Radar" className="space-y-6">
      {/* Top Overview Cards: Risk Index & Audit Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Risk Score Meter Card */}
        <div className="lg:col-span-1 glass-panel rounded-3xl p-6 shadow-2xl flex flex-col justify-between border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Contract Risk Score
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
              {analysis.documentType}
            </span>
          </div>

          <div className="my-5 flex items-center space-x-5">
            <div
              className={`w-24 h-24 rounded-3xl border-2 flex flex-col items-center justify-center shrink-0 shadow-lg ${getScoreColor(
                analysis.overallRiskScore
              )}`}
            >
              <span className="text-4xl font-black font-mono leading-none tracking-tight">
                {analysis.overallRiskScore}
              </span>
              <span className="text-[10px] font-extrabold uppercase mt-1 tracking-wider opacity-80">
                / 100
              </span>
            </div>
            <div className="space-y-1">
              <span className={`text-lg font-heading font-black block ${
                analysis.overallRiskScore >= 65 ? "text-rose-400" : analysis.overallRiskScore >= 35 ? "text-amber-400" : "text-emerald-400"
              }`}>
                {analysis.riskTier}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis.overallRiskScore >= 65
                  ? "Predatory and one-sided terms detected. Do not sign without counter-negotiation."
                  : analysis.overallRiskScore >= 35
                  ? "Standard agreement with a few moderate issues worth clarifying."
                  : "Fair, balanced agreement compliant with statutory guidelines."}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden p-0.5 border border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getScoreBarColor(
                  analysis.overallRiskScore
                )}`}
                style={{ width: `${Math.min(100, Math.max(8, analysis.overallRiskScore))}%` }}
                role="progressbar"
                aria-valuenow={analysis.overallRiskScore}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 (Safe)</span>
              <span>50 (Moderate)</span>
              <span>100 (Predatory)</span>
            </div>
          </div>
        </div>

        {/* Audit Stats Breakdown Card */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 shadow-2xl flex flex-col justify-between border border-white/10">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                AI Audit Synthesis
              </span>
              {onJumpToNegotiator && (
                <button
                  onClick={onJumpToNegotiator}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Counter-Offer Draft</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {analysis.summary}
            </p>
          </div>

          {/* 4 Quantitative Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block font-medium">Total Clauses</span>
              <span className="text-2xl font-black text-white font-mono">{analysis.keyStats.totalClauses}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-900/50 text-center glow-rose">
              <span className="text-[11px] text-rose-300 block font-semibold">High Red Flags</span>
              <span className="text-2xl font-black text-rose-400 font-mono">{analysis.keyStats.highRiskCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-900/50 text-center glow-amber">
              <span className="text-[11px] text-amber-300 block font-semibold">Medium Flags</span>
              <span className="text-2xl font-black text-amber-400 font-mono">{analysis.keyStats.mediumRiskCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-900/50 text-center glow-emerald">
              <span className="text-[11px] text-emerald-300 block font-semibold">Standard Terms</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{analysis.keyStats.safeCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Red Flags List & Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-heading font-black text-white tracking-tight">
              Uncovered Red Flags & Traps ({analysis.redFlags.length})
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedFilter === "all"
                  ? "bg-amber-500 text-nyaya-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Flags ({analysis.redFlags.length})
            </button>
            <button
              onClick={() => setSelectedFilter("high")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedFilter === "high"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              High ({analysis.keyStats.highRiskCount})
            </button>
            <button
              onClick={() => setSelectedFilter("medium")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedFilter === "medium"
                  ? "bg-amber-500 text-nyaya-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Medium ({analysis.keyStats.mediumRiskCount})
            </button>
          </div>
        </div>

        {/* Flag Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFlags.map((flag: RiskFlag) => (
            <div
              key={flag.id}
              className={`p-5 sm:p-6 rounded-2xl border space-y-3.5 glass-card ${
                flag.level === "high"
                  ? "border-rose-500/40 bg-gradient-to-b from-rose-950/20 via-slate-900/80 to-slate-950"
                  : "border-amber-500/30 bg-gradient-to-b from-amber-950/15 via-slate-900/80 to-slate-950"
              }`}
            >
              {/* Card Top */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-amber-400 block mb-0.5 tracking-wider">
                    {flag.category}
                  </span>
                  <h4 className="font-heading font-bold text-slate-100 text-base">{flag.title}</h4>
                </div>
                <span
                  className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                    flag.level === "high"
                      ? "bg-rose-500 text-white shadow-sm glow-rose"
                      : "bg-amber-500 text-nyaya-950 glow-amber"
                  }`}
                >
                  {flag.level} Risk
                </span>
              </div>

              {/* The Problem */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-slate-200">The Problem: </span>
                <span>{flag.problem}</span>
              </div>

              {/* Why Risky */}
              <div className="space-y-1 text-xs">
                <span className="font-bold text-rose-300 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Why you should worry:</span>
                </span>
                <p className="text-slate-300 pl-5 leading-relaxed">{flag.whyRisky}</p>
              </div>

              {/* Counter-Negotiation Script */}
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs space-y-1">
                <span className="font-bold text-emerald-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Counter-Negotiation Script:</span>
                </span>
                <p className="text-slate-100 font-medium pl-5 leading-relaxed">{flag.counterMeasure}</p>
              </div>

              {/* Indian Statutory Reference */}
              {flag.indianLegalContext && (
                <div className="flex items-start space-x-2 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                  <Scale className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                  <span className="italic">{flag.indianLegalContext}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Missing Protections Box */}
      {analysis.missingProtections && analysis.missingProtections.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-purple-500/30 space-y-3">
          <div className="flex items-center space-x-2 text-purple-300">
            <FileQuestion className="w-5 h-5 text-purple-400" />
            <h3 className="font-heading font-bold text-base">Missing Essential Protections</h3>
          </div>
          <p className="text-xs text-slate-300">
            Balanced agreements include standard consumer safety clauses. Their omission leaves you vulnerable:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {analysis.missingProtections.map((miss, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>{miss}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5-Point Action Plan */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl space-y-5 bg-gradient-to-r from-slate-950 via-nyaya-950 to-slate-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block mb-0.5">
              Actionable Negotiation Checklist
            </span>
            <h3 className="text-lg sm:text-xl font-heading font-black text-white">
              What Priya (or you) should say to the counterparty before signing:
            </h3>
          </div>

          <button
            onClick={copyActionPlan}
            className="shrink-0 flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-md transition-all self-start sm:self-auto"
          >
            {copiedActionPlan ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Copy 5-Point Plan</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {analysis.negotiationActionPlan.map((point, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-slate-950/80 border border-white/5 text-xs sm:text-sm text-slate-200 font-medium"
            >
              <div className="w-6 h-6 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-amber-500/30 font-mono">
                {idx + 1}
              </div>
              <p className="leading-relaxed">{point.replace(/^\d+\.\s*/, "")}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
