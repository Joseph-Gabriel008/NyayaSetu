"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, GitCompare, FileSearch, Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";

interface HeaderProps {
  onSelectPersona?: () => void;
}

export function Header({ onSelectPersona }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-9 z-40 bg-nyaya-950/80 backdrop-blur-xl border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <Link
          href="/"
          className="flex items-center space-x-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl p-1"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-nyaya-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Scale className="w-5 h-5 text-nyaya-950 stroke-[2.5]" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-heading font-extrabold tracking-tight text-white">
                Nyaya<span className="text-amber-400">Setu</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-400/15 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                न्यायसेतु
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">A Bridge to Legal Clarity for Non-Lawyers</p>
          </div>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center space-x-2 sm:space-x-3" aria-label="Main Navigation">
          <Link
            href="/"
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              pathname === "/"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            <FileSearch className="w-4 h-4" aria-hidden="true" />
            <span>Analyze Contract</span>
          </Link>

          <Link
            href="/compare"
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              pathname === "/compare"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-900/60"
            }`}
          >
            <GitCompare className="w-4 h-4" aria-hidden="true" />
            <span>Compare Drafts</span>
          </Link>

          {onSelectPersona && (
            <button
              onClick={onSelectPersona}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all shadow-sm"
              title="Load Priya's Chennai Rental Agreement Demo"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>Priya&apos;s Chennai Lease</span>
            </button>
          )}

          <div className="hidden lg:flex items-center space-x-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-semibold">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>PromptWars Virtual</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
