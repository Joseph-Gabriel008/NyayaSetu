import React from "react";
import { AlertTriangle, Lock, BookOpen } from "lucide-react";

export function LegalDisclaimer() {
  return (
    <footer className="bg-nyaya-950 border-t border-nyaya-800 text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Mandatory Legal Disclaimer */}
          <div className="flex space-x-3 p-4 rounded-xl bg-nyaya-900/60 border border-nyaya-800">
            <AlertTriangle className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="font-semibold text-slate-200 text-sm mb-1">Informational Analysis Only</h3>
              <p className="leading-relaxed">
                NyayaSetu provides document readability, clause breakdown, and risk tagging to help consumers understand what they are signing. This is general information, not formal legal advice. Always consult a licensed advocate for legal proceedings.
              </p>
            </div>
          </div>

          {/* Column 2: Privacy Guarantee */}
          <div className="flex space-x-3 p-4 rounded-xl bg-nyaya-900/60 border border-nyaya-800">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="font-semibold text-slate-200 text-sm mb-1">Zero-Persistence Privacy</h3>
              <p className="leading-relaxed">
                We believe legal confidentiality is sacred. Your documents are processed strictly in server memory during your session. No contracts, clauses, or prompts are ever stored in a database or written to disk.
              </p>
            </div>
          </div>

          {/* Column 3: Indian Legal Framework Context */}
          <div className="flex space-x-3 p-4 rounded-xl bg-nyaya-900/60 border border-nyaya-800">
            <BookOpen className="w-5 h-5 text-nyaya-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="font-semibold text-slate-200 text-sm mb-1">Statutory Context (India)</h3>
              <p className="leading-relaxed">
                Risk rules reference Indian statutes including the Tamil Nadu Tenancy Act (TNRRRL Act 2017), Section 27 of the Indian Contract Act 1872 (restraint of trade), and Model Tenancy guidelines to empower consumer negotiations.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-nyaya-900 pt-4 flex flex-wrap items-center justify-between text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} NyayaSetu (न्यायसेतु) • Built for PromptWars Virtual — Challenge: AI for Legal Assistance & Access</p>
          <p>Target Persona: Consumer Non-Lawyers & Tenants</p>
        </div>
      </div>
    </footer>
  );
}
