"use client";

import React, { useState } from "react";
import { CompareResult } from "@/lib/types";
import {
  GitCompare,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  TrendingDown,
  Coins,
} from "lucide-react";

export function CompareView() {
  const [doc1Text, setDoc1Text] = useState("");
  const [doc2Text, setDoc2Text] = useState("");
  const [comparison, setComparison] = useState<CompareResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPresetComparison = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [res1, res2] = await Promise.all([
        fetch("/api/preset?key=chennai_rental"),
        fetch("/api/preset?key=chennai_rental_draft2"),
      ]);

      const data1 = await res1.json();
      const data2 = await res2.json();

      setDoc1Text(data1.content);
      setDoc2Text(data2.content);

      // Trigger compare
      const compRes = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc1: data1.content, doc2: data2.content }),
      });

      const compData = await compRes.json();
      if (!compRes.ok || !compData.success) {
        throw new Error(compData.error || "Comparison failed.");
      }
      setComparison(compData.data);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to load demo comparison.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!doc1Text.trim() || !doc2Text.trim()) {
      setError("Please provide text for both Document 1 and Document 2.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc1: doc1Text, doc2: doc2Text }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to compare documents.");
      }

      setComparison(data.data);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Comparison failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const getFavorsBadge = (favors: "you" | "counterparty" | "neutral") => {
    if (favors === "you") {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 glow-emerald">
          <ThumbsUp className="w-3 h-3" />
          <span>Favors You (Tenant)</span>
        </span>
      );
    }
    if (favors === "counterparty") {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 glow-rose">
          <ThumbsDown className="w-3 h-3" />
          <span>Favors Landlord</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
        <Minus className="w-3 h-3" />
        <span>Neutral / Balanced</span>
      </span>
    );
  };

  return (
    <section aria-label="Compare Agreement Drafts" className="space-y-8">
      {/* Intro Header & Studio */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Comparative Contract Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
              Compare Two Contract Drafts
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Did the other party sneak in an unfavorable term or weaken your protections? Compare Draft 1 vs Draft 2 side-by-side to see what materially changed, who it favors, and how risks shifted.
            </p>
          </div>

          <button
            onClick={loadPresetComparison}
            disabled={isLoading}
            className="shrink-0 flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-nyaya-950 font-bold px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/20 transition-all text-xs sm:text-sm self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Priya&apos;s Before/After Comparison</span>
          </button>
        </div>

        {/* Inputs Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Draft 1 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="doc1-input" className="font-bold uppercase tracking-wider text-slate-300">
                Draft 1: Original Version
              </label>
              <span className="font-mono text-slate-500">{doc1Text.length} chars</span>
            </div>
            <textarea
              id="doc1-input"
              value={doc1Text}
              onChange={(e) => setDoc1Text(e.target.value)}
              placeholder="Paste original contract draft here..."
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono shadow-inner transition-colors"
            />
          </div>

          {/* Draft 2 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="doc2-input" className="font-bold uppercase tracking-wider text-slate-300">
                Draft 2: Revised / Counter-Offer Version
              </label>
              <span className="font-mono text-slate-500">{doc2Text.length} chars</span>
            </div>
            <textarea
              id="doc2-input"
              value={doc2Text}
              onChange={(e) => setDoc2Text(e.target.value)}
              placeholder="Paste revised contract draft here..."
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono shadow-inner transition-colors"
            />
          </div>
        </div>

        {error && (
          <div role="alert" className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            onClick={handleCompare}
            disabled={isLoading || !doc1Text.trim() || !doc2Text.trim()}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-nyaya-950 font-bold text-sm flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GitCompare className="w-4 h-4" />
            <span>{isLoading ? "Comparing Drafts with AI..." : "Run Side-by-Side Diff"}</span>
          </button>
        </div>
      </div>

      {/* Comparison Results Area */}
      {comparison && (
        <div className="space-y-6">
          {/* Verdict Scoreboard Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-5 bg-gradient-to-r from-slate-950 via-nyaya-950 to-slate-950">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 block">
                  AI Negotiation Assessment
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white">
                  {comparison.verdict}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {comparison.summary}
                </p>
              </div>

              {/* Financial & Risk Delta Badges */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                {/* Financial Concession Callout */}
                <div className="bg-slate-900/90 border border-emerald-500/40 p-3.5 rounded-2xl glow-emerald text-center min-w-[150px]">
                  <span className="text-[10px] text-emerald-300 uppercase font-bold flex items-center justify-center space-x-1">
                    <Coins className="w-3 h-3" />
                    <span>Upfront Cash Saved</span>
                  </span>
                  <span className="text-xl font-black text-emerald-400 font-mono block mt-0.5">
                    Rs. 1,82,000
                  </span>
                  <span className="text-[10px] text-slate-400">Deposit cut to 3 months</span>
                </div>

                {/* Risk Score Shift */}
                <div className="bg-slate-900/90 border border-white/10 p-3.5 rounded-2xl flex items-center space-x-3">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Draft 1 Risk</span>
                    <span className="text-xl font-black text-rose-400 font-mono">{comparison.draft1Score}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <div className="text-center">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold flex items-center space-x-0.5">
                      <TrendingDown className="w-3 h-3" />
                      <span>Draft 2 Risk</span>
                    </span>
                    <span className="text-xl font-black text-emerald-400 font-mono">{comparison.draft2Score}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                Key Negotiation Takeaways:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {comparison.keyTakeaways.map((takeaway, i) => (
                  <div key={i} className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Clause-by-Clause Differences */}
          <div className="space-y-4">
            <h3 className="text-xl font-heading font-black text-white tracking-tight">
              Detailed Clause Differences ({comparison.differences.length})
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {comparison.differences.map((diff) => (
                <div
                  key={diff.id}
                  className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono font-bold text-amber-300 bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                        {diff.category}
                      </span>
                      <h4 className="font-heading font-bold text-slate-100 text-base">{diff.clauseTitle}</h4>
                    </div>
                    <div>{getFavorsBadge(diff.favors)}</div>
                  </div>

                  {/* Side-by-side comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-4 rounded-xl bg-slate-950 border border-rose-950/80 space-y-1.5 shadow-inner">
                      <span className="text-[10px] font-sans font-bold text-rose-400 uppercase tracking-wider block">
                        Draft 1 (Original Landlord Draft)
                      </span>
                      <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{diff.draft1Text}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-emerald-950/80 space-y-1.5 shadow-inner">
                      <span className="text-[10px] font-sans font-bold text-emerald-400 uppercase tracking-wider block">
                        Draft 2 (Revised Negotiated Draft)
                      </span>
                      <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{diff.draft2Text}</p>
                    </div>
                  </div>

                  {/* Material change & recommendation */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1.5">
                    <div>
                      <span className="font-bold text-slate-200">Material Impact: </span>
                      <span className="text-slate-300">{diff.materialChange}</span>
                    </div>
                    <div className="text-amber-400">
                      <span className="font-bold">Recommendation: </span>
                      <span className="text-slate-300">{diff.recommendation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
