import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { chatFallback } from "@/lib/fallback-analysis";

describe("Grounded Ask-The-Document Engine", () => {
  const filePath = path.join(process.cwd(), "test-fixtures", "chennai-rental-agreement.txt");
  const leaseText = fs.readFileSync(filePath, "utf-8");

  it("answers eviction questions with exact clause citation", () => {
    const response = chatFallback("Can the landlord evict me with 7 days notice?", leaseText);
    expect(response.answer).toBeDefined();
    expect(response.citations.length).toBeGreaterThan(0);
    expect(response.citations[0].clauseTitle.toUpperCase()).toContain("TERMINATION");
    expect(response.citations[0].snippet).toContain("7 (seven) days");
  });

  it("answers security deposit questions with deposit amount and citation", () => {
    const response = chatFallback("How much security deposit do I have to pay?", leaseText);
    expect(response.answer).toContain("2,60,000");
    expect(response.citations.length).toBeGreaterThan(0);
    expect(response.citations[0].clauseTitle.toUpperCase()).toContain("SECURITY DEPOSIT");
  });

  it("strictly declines to answer questions not present in the document without hallucination", () => {
    const response = chatFallback("Is swimming pool access included on Sundays?", leaseText);
    expect(response.answer.toLowerCase()).toContain("does not contain any clause");
    expect(response.citations.length).toBe(0);
  });
});
