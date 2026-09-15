import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { analyzeDocumentFallback } from "@/lib/fallback-analysis";

describe("Multilingual and Accessibility Verification", () => {
  const filePath = path.join(process.cwd(), "test-fixtures", "chennai-rental-agreement.txt");
  const leaseText = fs.readFileSync(filePath, "utf-8");
  const analysis = analyzeDocumentFallback(leaseText);

  it("generates non-empty plain Hindi translations for clauses", () => {
    const hindiClauses = analysis.clauses.filter((c) => !!c.plainHindi);
    expect(hindiClauses.length).toBeGreaterThan(0);
    // Verify Devanagari script characters
    const sampleHindi = hindiClauses[0].plainHindi || "";
    expect(/[\u0900-\u097F]/.test(sampleHindi)).toBe(true);
  });

  it("generates non-empty plain Tamil translations for clauses", () => {
    const tamilClauses = analysis.clauses.filter((c) => !!c.plainTamil);
    expect(tamilClauses.length).toBeGreaterThan(0);
    // Verify Tamil script characters
    const sampleTamil = tamilClauses[0].plainTamil || "";
    expect(/[\u0B80-\u0BFF]/.test(sampleTamil)).toBe(true);
  });

  it("contains complete 5-point plain-language negotiation action plan", () => {
    expect(analysis.negotiationActionPlan).toBeDefined();
    expect(analysis.negotiationActionPlan.length).toBe(5);
    expect(analysis.negotiationActionPlan[0]).toContain("TNRRRL 2017");
  });
});
