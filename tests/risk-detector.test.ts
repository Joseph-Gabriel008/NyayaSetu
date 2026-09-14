import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { analyzeDocumentFallback } from "@/lib/fallback-analysis";

describe("Risk Detector and Legal Clause Analysis", () => {
  it("accurately analyzes Priya's Chennai Rental Agreement", () => {
    const filePath = path.join(process.cwd(), "test-fixtures", "chennai-rental-agreement.txt");
    const text = fs.readFileSync(filePath, "utf-8");

    const analysis = analyzeDocumentFallback(text);

    expect(analysis.documentType).toBe("Residential Rental Agreement");
    expect(analysis.clauses.length).toBeGreaterThanOrEqual(8);
    expect(analysis.overallRiskScore).toBeGreaterThanOrEqual(65);
    expect(analysis.riskTier).toBe("High Risk");

    // Check for high risk red flags
    const flagTitles = analysis.redFlags.map((f) => f.title);
    expect(flagTitles.some((t) => t.includes("Security Deposit"))).toBe(true);
    expect(flagTitles.some((t) => t.includes("7-Day Eviction"))).toBe(true);
    expect(flagTitles.some((t) => t.includes("Unannounced Entry"))).toBe(true);
    expect(flagTitles.some((t) => t.includes("Painting Charge"))).toBe(true);

    // Verify statutory context
    const depositFlag = analysis.redFlags.find((f) => f.title.includes("Security Deposit"));
    expect(depositFlag).toBeDefined();
    expect(depositFlag?.indianLegalContext).toContain("TNRRRL");

    // Verify clause categorization
    const categories = analysis.clauses.map((c) => c.category);
    expect(categories).toContain("Money");
    expect(categories).toContain("Termination");
    expect(categories).toContain("Your obligations");

    // Verify negotiation action plan exists
    expect(analysis.negotiationActionPlan.length).toBe(5);
  });

  it("accurately analyzes Tech Employment Agreement with non-compete covenant", () => {
    const filePath = path.join(process.cwd(), "test-fixtures", "tech-employment-contract.txt");
    const text = fs.readFileSync(filePath, "utf-8");

    const analysis = analyzeDocumentFallback(text);

    expect(analysis.documentType).toBe("Employment Offer & Agreement");

    // Should flag void non-compete under Section 27 Indian Contract Act
    const nonCompeteFlag = analysis.redFlags.find((f) => f.title.includes("Non-Compete"));
    expect(nonCompeteFlag).toBeDefined();
    expect(nonCompeteFlag?.level).toBe("high");
    expect(nonCompeteFlag?.indianLegalContext).toContain("Section 27");
  });
});
