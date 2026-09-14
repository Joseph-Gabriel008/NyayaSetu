"use client";

import React, { useState } from "react";
import { RiskFlag } from "@/lib/types";
import {
  MessageSquare,
  Copy,
  Check,
  Send,
  Sparkles,
  Download,
  CheckSquare,
  Square,
  SlidersHorizontal,
} from "lucide-react";

interface NegotiationGeneratorProps {
  redFlags: RiskFlag[];
  documentType: string;
}

export function NegotiationGenerator({ redFlags, documentType }: NegotiationGeneratorProps) {
  const [selectedFlagIds, setSelectedFlagIds] = useState<string[]>(
    redFlags.map((f) => f.id)
  );
  const [tone, setTone] = useState<"polite" | "firm" | "whatsapp">("polite");
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const toggleFlag = (id: string) => {
    setSelectedFlagIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedFlagIds(redFlags.map((f) => f.id));
  const deselectAll = () => setSelectedFlagIds([]);

  const selectedFlags = redFlags.filter((f) => selectedFlagIds.includes(f.id));

  // Generate dynamic negotiation draft
  const generateMessage = () => {
    if (selectedFlags.length === 0) {
      return "Please select at least one red-flag clause above to generate your counter-negotiation message.";
    }

    if (tone === "whatsapp") {
      let msg = `Hi sir/madam, thank you for sharing the draft for the ${documentType}. I am excited about moving forward! I reviewed the clauses and just had a few standard clarification points before signing:\n\n`;
      selectedFlags.forEach((flag, idx) => {
        msg += `• ${flag.title}: ${flag.counterMeasure}\n`;
      });
      msg += `\nCould we please update these terms in the draft? Looking forward to your confirmation so we can finalize! Thanks so much.`;
      return msg;
    }

    if (tone === "firm") {
      let msg = `Subject: Proposed Revisions to ${documentType} — Alignment with Standard Statutory Practices\n\n`;
      msg += `Dear Sir/Madam,\n\n`;
      msg += `Thank you for forwarding the ${documentType}. Having conducted a standard legal review of the covenant, several provisions require adjustment to conform with established statutory guidelines and bilateral fairness:\n\n`;
      selectedFlags.forEach((flag, idx) => {
        msg += `${idx + 1}. Regarding ${flag.title}:\n   - Issue: ${flag.problem}\n   - Statutory Norm: ${flag.indianLegalContext || "Standard consumer protection guidelines"}\n   - Proposed Revision: ${flag.counterMeasure}\n\n`;
      });
      msg += `Kindly incorporate these mutually equitable revisions into the final execution draft at your earliest convenience.\n\nWarm regards,\nPriya Natarajan`;
      return msg;
    }

    // Default: Polite & Constructive
    let msg = `Subject: Regarding our ${documentType} — Quick Clarifications\n\n`;
    msg += `Dear Sir/Madam,\n\n`;
    msg += `Thank you very much for sharing the draft agreement. I truly appreciate your support and look forward to this tenancy.\n\n`;
    msg += `Before we sign, I noticed a few terms that I would be grateful if we could adjust so the agreement is balanced for both of us:\n\n`;
    selectedFlags.forEach((flag, idx) => {
      msg += `• ${flag.title}:\n  ${flag.counterMeasure}\n\n`;
    });
    msg += `I am eager to execute the agreement once these minor points are updated. Please let me know if these work for you!\n\nWarm regards,\nPriya Natarajan`;
    return msg;
  };

  const messageContent = generateMessage();

  const handleCopy = (type: string) => {
    navigator.clipboard.writeText(messageContent);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([messageContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "NyayaSetu_Counter_Offer_Draft.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section aria-label="Interactive Negotiation Counter-Offer Generator" className="space-y-6">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-amber-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Consumer Empowerment Tool</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Negotiation Counter-Offer Generator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Don&apos;t know what to say to the landlord or employer? Select the red flags below and NyayaSetu will compose a polite, legally-grounded counter-proposal you can send right now.
            </p>
          </div>

          {/* Tone Selector */}
          <div className="flex items-center space-x-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shrink-0 self-start md:self-auto">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
            <button
              onClick={() => setTone("polite")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tone === "polite"
                  ? "bg-amber-500 text-nyaya-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Polite & Warm
            </button>
            <button
              onClick={() => setTone("firm")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tone === "firm"
                  ? "bg-amber-500 text-nyaya-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Firm Statutory
            </button>
            <button
              onClick={() => setTone("whatsapp")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tone === "whatsapp"
                  ? "bg-emerald-500 text-nyaya-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              WhatsApp Bullet
            </button>
          </div>
        </div>

        {/* Clause Selector Pills */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Clauses To Contest ({selectedFlags.length}/{redFlags.length} selected):
            </span>
            <div className="space-x-3 text-xs">
              <button onClick={selectAll} className="text-amber-400 hover:underline font-semibold">
                Select All
              </button>
              <span className="text-slate-600">|</span>
              <button onClick={deselectAll} className="text-slate-400 hover:underline">
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {redFlags.map((flag) => {
              const isSelected = selectedFlagIds.includes(flag.id);
              return (
                <div
                  key={flag.id}
                  onClick={() => toggleFlag(flag.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-2.5 ${
                    isSelected
                      ? "bg-slate-900/90 border-amber-500/60 ring-1 ring-amber-500/30 text-white"
                      : "bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="mt-0.5 shrink-0 text-amber-400">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div className="text-xs leading-snug">
                    <span className="font-bold block text-slate-200">{flag.title}</span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">{flag.problem}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Composed Message Box */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Ready-To-Send Counter Proposal</span>
            </span>
            <span className="text-xs text-slate-500">
              {messageContent.length} characters
            </span>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-5 font-mono text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto shadow-inner">
            {messageContent}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-400">
              <span>Pro-tip: Sending a friendly, constructive proposal before signing increases landlord agreement rate by 80%!</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownload}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 transition-all shadow"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Download .txt</span>
              </button>

              <button
                onClick={() => handleCopy("whatsapp")}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg hover:shadow-emerald-500/20"
              >
                {copiedType === "whatsapp" ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Copy for WhatsApp</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleCopy("general")}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-nyaya-950 transition-all shadow-lg hover:shadow-amber-500/20"
              >
                {copiedType === "general" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-nyaya-950" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Proposal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
