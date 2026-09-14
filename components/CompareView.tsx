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
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          <ThumbsUp className="w-3 h-3" />
          <span>Favors You (Tenant)</span>
        </span>
      );
    }
    if (favors === "counterparty") {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
          <ThumbsDown className="w-3 h-3" />
          <span>Favors Other Party</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
        <Minus className="w-3 h-3" />
        <span>Neutral / Balanced</span>
      </span>
    );
  };

  return (
    <section aria-label="Compare Agreement Drafts" className="space-y-8">
      {/* Intro Header */}
      <div className="bg-nyaya-900/80 border border-nyaya-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                Comparative Contract Intelligence
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Compare Two Contract Drafts
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Did the landlord or employer slip in a sneaky new term? Compare Draft 1 vs Draft 2 side-by-side to see what materially changed, who it favors, and whether risks improved.
            </p>
          </div>

          <button
            onClick={loadPresetComparison}
            disabled={isLoading}
            className="shrink-0 flex items-center space-x-2 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-nyaya-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-xs sm:text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Priya&apos;s Before/After Comparison</span>
          </button>
        </div>

        {/* Input Inputs Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Doc 1 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="doc1-input" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Draft 1: Original Version
              </label>
              <span className="text-xs text-slate-400">{doc1Text.length} chars</span>
            </div>
            <textarea
              id="doc1-input"
              value={doc1Text}
              onChange={(e) => setDoc1Text(e.target.value)}
              placeholder="Paste original contract draft here..."
              rows={8}
              className="w-full bg-nyaya-950 border border-nyaya-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-400 font-mono"
            />
          </div>

          {/* Doc 2 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="doc2-input" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Draft 2: Revised / Counter-Offer Version
              </label>
              <span className="text-xs text-slate-400">{doc2Text.length} chars</span>
            </div>
            <textarea
              id="doc2-input"
              value={doc2Text}
              onChange={(e) => setDoc2Text(e.target.value)}
              placeholder="Paste revised contract draft here..."
              rows={8}
              className="w-full bg-nyaya-950 border border-nyaya-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-400 font-mono"
            />
          </div>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            onClick={handleCompare}
            disabled={isLoading || !doc1Text.trim() || !doc2Text.trim()}
            className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-nyaya-950 font-bold text-sm flex items-center space-x-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GitCompare className="w-4 h-4" />
            <span>{isLoading ? "Comparing Drafts..." : "Run Side-by-Side Diff"}</span>
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6">
          {/* Comparison Scoreboard */}
          <div className="bg-gradient-to-r from-nyaya-900 via-nyaya-850 to-nyaya-900 border border-nyaya-700 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
                  Negotiation Verdict
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">{comparison.verdict}</h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  {comparison.summary}
                </p>
              </div>

              {/* Risk Score Shift */}
              <div className="flex items-center space-x-3 shrink-0 bg-nyaya-950/80 p-3 rounded-xl border border-nyaya-800">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Draft 1 Risk</span>
                  <span className="text-lg font-black text-rose-400 font-mono">{comparison.draft1Score}/100</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Draft 2 Risk</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">{comparison.draft2Score}/100</span>
                </div>
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="pt-3 border-t border-nyaya-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Key Negotiation Takeaways:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {comparison.keyTakeaways.map((takeaway, i) => (
                  <div key={i} className="flex items-start space-x-2 p-2 rounded-lg bg-nyaya-950/50 text-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Clause-by-Clause Differences */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Material Clause Differences ({comparison.differences.length})
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {comparison.differences.map((diff) => (
                <div
                  key={diff.id}
                  className="bg-nyaya-900/70 border border-nyaya-800 rounded-2xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-nyaya-800">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-400 bg-nyaya-800 px-2 py-0.5 rounded mr-2">
                        {diff.category}
                      </span>
                      <span className="font-bold text-slate-100 text-sm sm:text-base">{diff.clauseTitle}</span>
                    </div>
                    <div>{getFavorsBadge(diff.favors)}</div>
                  </div>

                  {/* Side-by-side text comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3.5 rounded-xl bg-nyaya-950 border border-rose-950/80 space-y-1">
                      <span className="text-[10px] font-sans font-bold text-rose-300 uppercase tracking-wider">
                        Draft 1 (Original)
                      </span>
                      <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{diff.draft1Text}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-nyaya-950 border border-emerald-950/80 space-y-1">
                      <span className="text-[10px] font-sans font-bold text-emerald-300 uppercase tracking-wider">
                        Draft 2 (Revised)
                      </span>
                      <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{diff.draft2Text}</p>
                    </div>
                  </div>

                  {/* Material change & recommendation */}
                  <div className="p-3 rounded-xl bg-nyaya-950/60 border border-nyaya-850 text-xs space-y-1.5">
                    <div>
                      <span className="font-bold text-slate-200">Material Impact: </span>
                      <span className="text-slate-300">{diff.materialChange}</span>
                    </div>
                    <div className="text-gold-400">
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
