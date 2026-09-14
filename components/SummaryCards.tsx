"use client";

import React, { useState } from "react";
import { DocumentClause, ClauseCategory } from "@/lib/types";
import { useAccessibility } from "./AccessibilityContext";
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
} from "lucide-react";

interface SummaryCardsProps {
  clauses: DocumentClause[];
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

export function SummaryCards({ clauses }: SummaryCardsProps) {
  const { language } = useAccessibility();
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
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <ShieldAlert className="w-3 h-3" />
            <span>High Risk</span>
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3 h-3" />
            <span>Medium Risk</span>
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <span>Low Risk</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span>Standard Term</span>
          </span>
        );
    }
  };

  return (
    <section aria-label="Plain Language Summary" className="space-y-6">
      {/* Category Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Plain-Language Clause Breakdown</span>
            <span className="text-xs bg-nyaya-800 text-gold-400 px-2.5 py-0.5 rounded-full border border-nyaya-700">
              {filteredClauses.length} Clauses
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Every legal clause rephrased in plain human language without confusing legalese.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter clauses by category">
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === "All"
                ? "bg-gold-500 text-nyaya-950 shadow-md"
                : "bg-nyaya-850 text-slate-300 hover:bg-nyaya-800 hover:text-white"
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
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === cat.name
                    ? "bg-gold-500 text-nyaya-950 shadow-md"
                    : "bg-nyaya-850 text-slate-300 hover:bg-nyaya-800 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Clauses Cards Grid */}
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
              className={`rounded-2xl border transition-all p-5 shadow-sm ${
                clause.riskLevel === "high"
                  ? "bg-rose-950/20 border-rose-900/60 hover:border-rose-700/80"
                  : clause.riskLevel === "medium"
                  ? "bg-amber-950/20 border-amber-900/60 hover:border-amber-700/80"
                  : "bg-nyaya-900/60 border-nyaya-800 hover:border-nyaya-700"
              }`}
            >
              {/* Header: Title, Category, Risk Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-nyaya-800/60">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold bg-nyaya-800 text-slate-300 px-2 py-0.5 rounded">
                    {clause.category}
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                    {clause.title}
                  </h3>
                </div>
                <div>{getRiskBadge(clause.riskLevel)}</div>
              </div>

              {/* Body: Plain Language Explanation */}
              <div className="py-3 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">
                      Plain-Language Translation ({language === "hi" ? "हिन्दी" : language === "ta" ? "தமிழ்" : "English"})
                    </span>
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed font-sans font-medium">
                    {plainText}
                  </p>
                </div>

                {/* Risk Warning & Counter Recommendation if applicable */}
                {clause.riskReason && (
                  <div className="rounded-xl p-3.5 bg-nyaya-950/80 border border-amber-900/40 space-y-2 text-xs">
                    <div className="flex items-start space-x-2 text-amber-300">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <span className="font-bold">Why you should care: </span>
                        <span>{clause.riskReason}</span>
                      </div>
                    </div>
                    {clause.counterSuggestion && (
                      <div className="flex items-start space-x-2 text-emerald-300 pt-1 border-t border-nyaya-900">
                        <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                        <div>
                          <span className="font-bold">What to negotiate: </span>
                          <span>{clause.counterSuggestion}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Expandable Original Text */}
                <div className="pt-1">
                  <button
                    onClick={() => toggleExpand(clause.id)}
                    aria-expanded={isExpanded}
                    className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-gold-400 transition-colors focus:outline-none"
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
                    <div className="mt-2 p-3 bg-nyaya-950 rounded-xl border border-nyaya-850 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
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
