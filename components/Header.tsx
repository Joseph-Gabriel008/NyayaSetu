"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, GitCompare, FileText, Sparkles, UserCheck } from "lucide-react";

interface HeaderProps {
  onSelectPersona?: () => void;
}

export function Header({ onSelectPersona }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="bg-nyaya-900/90 border-b border-nyaya-800 backdrop-blur-md sticky top-9 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <Link
          href="/"
          className="flex items-center space-x-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-lg p-1"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-amber-600 flex items-center justify-center text-nyaya-950 shadow-md group-hover:scale-105 transition-transform">
            <Scale className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black tracking-tight text-white font-sans">
                Nyaya<span className="text-gold-400">Setu</span>
              </span>
              <span className="text-xs bg-gold-400/20 text-gold-300 font-semibold px-2 py-0.5 rounded border border-gold-400/30">
                न्यायसेतु
              </span>
            </div>
            <p className="text-xs text-slate-400">A Bridge to Legal Clarity for Everyday People</p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-2 sm:space-x-4" aria-label="Main Navigation">
          <Link
            href="/"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              pathname === "/"
                ? "bg-nyaya-800 text-gold-400 border border-nyaya-700 shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-nyaya-800/60"
            }`}
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            <span>Analyze Contract</span>
          </Link>

          <Link
            href="/compare"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              pathname === "/compare"
                ? "bg-nyaya-800 text-gold-400 border border-nyaya-700 shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-nyaya-800/60"
            }`}
          >
            <GitCompare className="w-4 h-4" aria-hidden="true" />
            <span>Compare Drafts</span>
          </Link>

          {onSelectPersona && (
            <button
              onClick={onSelectPersona}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/60 transition-all"
              title="Load Priya's Chennai Rental Agreement Demo"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>Persona: Priya (Chennai)</span>
            </button>
          )}

          <div className="hidden lg:flex items-center space-x-1 text-xs text-gold-400/80 bg-gold-950/40 border border-gold-800/30 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-gold-400" aria-hidden="true" />
            <span>PromptWars Virtual</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
