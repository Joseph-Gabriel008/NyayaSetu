import type { Metadata } from "next";
import "./globals.css";
import { AccessibilityProvider } from "@/components/AccessibilityContext";
import { AccessibilityBar } from "@/components/AccessibilityBar";
import { Header } from "@/components/Header";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";

export const metadata: Metadata = {
  title: "NyayaSetu | A Bridge to Legal Clarity for Non-Lawyers",
  description:
    "AI-powered legal document assistant for everyday consumers, tenants, and employees. Understand contracts in plain English, Hindi, and Tamil, detect red flags, and compare drafts before signing.",
  keywords: [
    "NyayaSetu",
    "legal document clarity",
    "rental agreement red flags",
    "Priya Chennai tenant",
    "plain English legal summary",
    "PromptWars Virtual",
    "AI for Legal Assistance",
  ],
  authors: [{ name: "NyayaSetu Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="font-scale-md scroll-smooth">
      <body className="mesh-bg text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-gold-500 selection:text-nyaya-950">
        <AccessibilityProvider>
          <AccessibilityBar />
          <Header />
          <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            {children}
          </main>
          <LegalDisclaimer />
        </AccessibilityProvider>
      </body>
    </html>
  );
}
