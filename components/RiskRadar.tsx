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
  ArrowUpRight,
} from "lucide-react";

interface RiskRadarProps {
  analysis: AnalysisResult;
}

export function RiskRadar({ analysis }: RiskRadarProps) {
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
    if (score >= 65) return "text-rose-400 border-rose-500 bg-rose-950/40";
    if (score >= 35) return "text-amber-400 border-amber-500 bg-amber-950/40";
    return "text-emerald-400 border-emerald-500 bg-emerald-950/40";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 65) return "bg-rose-500";
    if (score >= 35) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <section aria-label="Risk and Red Flag Analysis" className="space-y-6">
      {/* Overview Cards: Risk Gauge & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk Score Gauge */}
        <div className="lg:col-span-1 bg-nyaya-900/80 border border-nyaya-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Contract Risk Index
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-nyaya-800 text-gold-300">
              {analysis.documentType}
            </span>
          </div>

          <div className="my-4 flex items-center space-x-4">
            <div
              className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${getScoreColor(
                analysis.overallRiskScore
              )}`}
            >
              <span className="text-3xl font-black font-mono leading-none">
                {analysis.overallRiskScore}
              </span>
              <span className="text-[10px] font-bold uppercase mt-1">/ 100</span>
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center space-x-1.5">
                <span>{analysis.riskTier}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {analysis.overallRiskScore >= 65
                  ? "Contains strongly one-sided and predatory terms. Do not sign without renegotiating."
                  : analysis.overallRiskScore >= 35
                  ? "Standard agreement with a few moderate issues worth clarifying before signing."
                  : "Balanced agreement compliant with standard consumer protections."}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-nyaya-950 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${getScoreBarColor(
                analysis.overallRiskScore
              )}`}
              style={{ width: `${Math.min(100, Math.max(5, analysis.overallRiskScore))}%` }}
              role="progressbar"
              aria-valuenow={analysis.overallRiskScore}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Clause Summary Stats */}
        <div className="lg:col-span-2 bg-nyaya-900/80 border border-nyaya-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Document Audit Breakdown
            </span>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">{analysis.summary}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-nyaya-800/80">
            <div className="p-2.5 rounded-xl bg-nyaya-950/60 border border-nyaya-850">
              <span className="text-xs text-slate-400">Total Clauses</span>
              <p className="text-xl font-black text-white font-mono">{analysis.keyStats.totalClauses}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/40">
              <span className="text-xs text-rose-300 font-medium">High Red Flags</span>
              <p className="text-xl font-black text-rose-400 font-mono">{analysis.keyStats.highRiskCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/40">
              <span className="text-xs text-amber-300 font-medium">Medium Flags</span>
              <p className="text-xl font-black text-amber-400 font-mono">{analysis.keyStats.mediumRiskCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40">
              <span className="text-xs text-emerald-300 font-medium">Safe Terms</span>
              <p className="text-xl font-black text-emerald-400 font-mono">{analysis.keyStats.safeCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Red Flags Filter & Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Identified Red Flags & Hidden Traps ({analysis.redFlags.length})
            </h3>
          </div>

          <div className="flex space-x-1 bg-nyaya-950 p-1 rounded-lg border border-nyaya-850 text-xs">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                selectedFilter === "all" ? "bg-gold-500 text-nyaya-950" : "text-slate-400 hover:text-white"
              }`}
            >
              All ({analysis.redFlags.length})
            </button>
            <button
              onClick={() => setSelectedFilter("high")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                selectedFilter === "high" ? "bg-rose-500 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              High ({analysis.keyStats.highRiskCount})
            </button>
            <button
              onClick={() => setSelectedFilter("medium")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                selectedFilter === "medium" ? "bg-amber-500 text-nyaya-950" : "text-slate-400 hover:text-white"
              }`}
            >
              Medium ({analysis.keyStats.mediumRiskCount})
            </button>
          </div>
        </div>

        {filteredFlags.length === 0 ? (
          <div className="p-8 text-center bg-nyaya-900/40 rounded-2xl border border-nyaya-800 text-slate-400 text-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            No red flags in this filter category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFlags.map((flag: RiskFlag) => (
              <div
                key={flag.id}
                className={`p-5 rounded-2xl border space-y-3 transition-all ${
                  flag.level === "high"
                    ? "bg-gradient-to-b from-rose-950/40 to-nyaya-900/80 border-rose-800/80 shadow-rose-950/20 shadow-md"
                    : "bg-gradient-to-b from-amber-950/30 to-nyaya-900/80 border-amber-800/70"
                }`}
              >
                {/* Flag Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5">
                      {flag.category}
                    </span>
                    <h4 className="font-bold text-slate-100 text-sm sm:text-base">{flag.title}</h4>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      flag.level === "high"
                        ? "bg-rose-500 text-white shadow-sm"
                        : "bg-amber-500 text-nyaya-950"
                    }`}
                  >
                    {flag.level} Risk
                  </span>
                </div>

                {/* The Trap */}
                <div className="p-3 bg-nyaya-950/70 rounded-xl border border-nyaya-850/80 text-xs text-slate-300">
                  <span className="font-bold text-slate-200">The Problem: </span>
                  <span>{flag.problem}</span>
                </div>

                {/* Why it's risky */}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-rose-300 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Why you should worry:</span>
                  </span>
                  <p className="text-slate-300 pl-4 leading-relaxed">{flag.whyRisky}</p>
                </div>

                {/* Counter Measure */}
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-emerald-300 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Counter-Negotiation Script:</span>
                  </span>
                  <p className="text-slate-200 font-medium pl-4">{flag.counterMeasure}</p>
                </div>

                {/* Indian Legal Citation if present */}
                {flag.indianLegalContext && (
                  <div className="flex items-start space-x-1.5 text-[11px] text-nyaya-300 pt-1 border-t border-nyaya-800">
                    <Scale className="w-3.5 h-3.5 shrink-0 text-gold-400 mt-0.5" />
                    <span className="italic">{flag.indianLegalContext}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Missing Critical Protections */}
      {analysis.missingProtections && analysis.missingProtections.length > 0 && (
        <div className="bg-nyaya-900/60 border border-purple-800/40 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-purple-300">
            <FileQuestion className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-sm sm:text-base">Missing Protective Clauses</h3>
          </div>
          <p className="text-xs text-slate-400">
            Standard consumer contracts typically include these safeguards to protect against abuse. Their omission gives full discretion to the counterparty:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {analysis.missingProtections.map((miss, idx) => (
              <li
                key={idx}
                className="flex items-start space-x-2 p-2.5 rounded-lg bg-nyaya-950 border border-nyaya-800 text-slate-300"
              >
                <span className="text-purple-400 font-bold">•</span>
                <span>{miss}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 5-Point Action Plan */}
      <div className="bg-gradient-to-r from-nyaya-900 via-nyaya-850 to-nyaya-900 border border-gold-500/40 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ready-To-Send Negotiation Checklist</span>
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              What Priya (or you) should tell the other party before signing:
            </h3>
          </div>
          <button
            onClick={copyActionPlan}
            className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-nyaya-800 hover:bg-nyaya-700 text-slate-200 border border-nyaya-700 shadow transition-all focus:outline-none focus:ring-2 focus:ring-gold-400"
          >
            {copiedActionPlan ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gold-400" />
                <span>Copy Checklist</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {analysis.negotiationActionPlan.map((point, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-3 p-3 rounded-xl bg-nyaya-950/80 border border-nyaya-800/80 text-xs sm:text-sm text-slate-200 font-medium"
            >
              <div className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
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
