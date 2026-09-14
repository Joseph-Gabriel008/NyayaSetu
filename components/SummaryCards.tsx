"use client";

import React, { useState } from "react";
import { DocumentClause, ClauseCategory } from "@/lib/types";
import { useAccessibility, LanguageCode } from "./AccessibilityContext";
import {
  DollarSign,
  LogOut,
  UserCheck,
  Building2,
  FileCheck,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  MessageSquare,
  Languages,
} from "lucide-react";

interface SummaryCardsProps {
  clauses: DocumentClause[];
  onAskAboutClause?: (clauseTitle: string) => void;
}

const CATEGORIES: { name: ClauseCategory; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  {
    name: "What you're agreeing to",
    icon: FileCheck,
    description: "Core terms, scope, duration, and basic premises of the contract.",
  },
  {
    name: "Money",
    icon: DollarSign,
    description: "Rent, deposits, bonuses, payment dates, deductions, and late fees.",
  },
  {
    name: "Termination",
    icon: LogOut,
    description: "Notice periods, exit conditions, forfeiture, and eviction clauses.",
  },
  {
    name: "Your obligations",
    icon: UserCheck,
    description: "Responsibilities, conduct rules, restrictions, and duties placed on you.",
  },
  {
    name: "Their obligations",
    icon: Building2,
    description: "Commitments, maintenance duties, and deliverables by the counterparty.",
  },
];

export function SummaryCards({ clauses, onAskAboutClause }: SummaryCardsProps) {
  const { language, setLanguage } = useAccessibility();
  const [activeCategory, setActiveCategory] = useState<ClauseCategory | "All">("All");
  const [expandedClauses, setExpandedClauses] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedClauses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredClauses =
    activeCategory === "All"
      ? clauses
      : clauses.filter((c) => c.category === activeCategory);

  const getRiskBadge = (level: DocumentClause["riskLevel"]) => {
    switch (level) {
      case "high":
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 glow-rose">
            <ShieldAlert className="w-3 h-3" />
            <span>High Risk</span>
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 glow-amber">
            <AlertTriangle className="w-3 h-3" />
            <span>Medium Risk</span>
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <span>Low Risk</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 glow-emerald">
            <span>Standard Term</span>
          </span>
        );
    }
  };

  return (
    <section aria-label="Plain Language Clause Breakdown" className="space-y-6">
      {/* Control Bar: Title & In-Section Language Toggle */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight flex items-center space-x-2.5">
            <span>Plain-Language Clause Breakdown</span>
            <span className="text-xs bg-slate-800 text-amber-300 px-2.5 py-0.5 rounded-full border border-slate-700 font-mono">
              {filteredClauses.length} Clauses
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Every legal clause rewritten in everyday terms. Switch languages below to view in Hindi or Tamil.
          </p>
        </div>

        {/* In-Section Language Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0 self-start md:self-auto">
          <Languages className="w-4 h-4 text-amber-400 ml-1.5 mr-1" />
          {[
            { code: "en" as LanguageCode, label: "English" },
            { code: "hi" as LanguageCode, label: "हिन्दी" },
            { code: "ta" as LanguageCode, label: "தமிழ்" },
          ].map((item) => (
            <button
              key={item.code}
              onClick={() => setLanguage(item.code)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                language === item.code
                  ? "bg-amber-500 text-nyaya-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter clauses by category">
        <button
          onClick={() => setActiveCategory("All")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeCategory === "All"
              ? "bg-amber-500 text-nyaya-950 shadow-md shadow-amber-500/20"
              : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
          }`}
        >
          All Clauses ({clauses.length})
        </button>

        {CATEGORIES.map((cat) => {
          const count = clauses.filter((c) => c.category === cat.name).length;
          const Icon = cat.icon;
          return (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.name
                  ? "bg-amber-500 text-nyaya-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Clause Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredClauses.map((clause) => {
          const isExpanded = !!expandedClauses[clause.id];

          // Language-specific plain text
          let plainText = clause.plainEnglish;
          if (language === "hi" && clause.plainHindi) {
            plainText = clause.plainHindi;
          } else if (language === "ta" && clause.plainTamil) {
            plainText = clause.plainTamil;
          }

          return (
            <article
              key={clause.id}
              className={`rounded-2xl border transition-all p-5 sm:p-6 glass-card ${
                clause.riskLevel === "high"
                  ? "border-rose-500/40 bg-gradient-to-b from-rose-950/20 to-slate-900/70"
                  : clause.riskLevel === "medium"
                  ? "border-amber-500/30 bg-gradient-to-b from-amber-950/15 to-slate-900/70"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Top row: Category Pill, Clause Title, Risk Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-white/5">
                <div className="flex items-center space-x-2.5">
                  <span className="text-[11px] font-mono font-bold bg-slate-800/90 text-amber-300 px-2.5 py-0.5 rounded-lg border border-slate-700">
                    {clause.category}
                  </span>
                  <h3 className="font-heading font-bold text-slate-100 text-sm sm:text-base">
                    {clause.title}
                  </h3>
                </div>
                <div>{getRiskBadge(clause.riskLevel)}</div>
              </div>

              {/* Plain Language Body */}
              <div className="py-4 space-y-3.5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      Plain Meaning ({language === "hi" ? "हिन्दी सरल व्याख्या" : language === "ta" ? "தமிழ் விளக்கம்" : "Everyday Human Terms"})
                    </span>
                    {onAskAboutClause && (
                      <button
                        type="button"
                        onClick={() => onAskAboutClause(clause.title)}
                        className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ask AI about this clause</span>
                      </button>
                    )}
                  </div>
                  <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-medium">
                    {plainText}
                  </p>
                </div>

                {/* Risk Warning & Counter Recommendation if applicable */}
                {clause.riskReason && (
                  <div className="rounded-xl p-4 bg-slate-950/80 border border-amber-500/30 space-y-2.5 text-xs">
                    <div className="flex items-start space-x-2 text-amber-300">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <span className="font-bold">Why this matters: </span>
                        <span>{clause.riskReason}</span>
                      </div>
                    </div>
                    {clause.counterSuggestion && (
                      <div className="flex items-start space-x-2 text-emerald-300 pt-2 border-t border-slate-800/80">
                        <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                        <div>
                          <span className="font-bold">Counter-Negotiation Script: </span>
                          <span>{clause.counterSuggestion}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Expandable Original Legal Wording */}
                <div className="pt-1">
                  <button
                    onClick={() => toggleExpand(clause.id)}
                    aria-expanded={isExpanded}
                    className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors focus:outline-none"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Hide original legal wording</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>Inspect exact contract snippet</span>
                      </>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 p-3.5 bg-slate-950 rounded-xl border border-slate-850 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner">
                      {clause.originalText}
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
