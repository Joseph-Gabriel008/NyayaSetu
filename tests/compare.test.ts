import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { compareDocumentsFallback } from "@/lib/fallback-analysis";

describe("Contract Comparison Engine", () => {
  it("accurately detects differences between Priya's original and negotiated drafts", () => {
    const p1 = path.join(process.cwd(), "test-fixtures", "chennai-rental-agreement.txt");
    const p2 = path.join(process.cwd(), "test-fixtures", "chennai-rental-draft2.txt");

    const doc1 = fs.readFileSync(p1, "utf-8");
    const doc2 = fs.readFileSync(p2, "utf-8");

    const result = compareDocumentsFallback(doc1, doc2);

    expect(result.favorsOverall).toBe("Draft 2");
    expect(result.draft1Score).toBeGreaterThan(result.draft2Score);
    expect(result.differences.length).toBeGreaterThanOrEqual(4);

    // Verify deposit difference
    const depositDiff = result.differences.find((d) => d.clauseTitle.includes("Deposit"));
    expect(depositDiff).toBeDefined();
    expect(depositDiff?.favors).toBe("you");
    expect(depositDiff?.riskShift).toBe("improved");

    // Verify termination difference
    const termDiff = result.differences.find((d) => d.clauseTitle.includes("Termination"));
    expect(termDiff).toBeDefined();
    expect(termDiff?.favors).toBe("you");

    // Verify takeaways exist
    expect(result.keyTakeaways.length).toBeGreaterThan(0);
  });
});
