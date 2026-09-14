import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult, CompareResult, Citation } from "./types";
import { analyzeDocumentFallback, compareDocumentsFallback, chatFallback } from "./fallback-analysis";

const apiKey = process.env.GEMINI_API_KEY || "";
const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Single pipeline: analyzes clauses, plain-language translations (English, Hindi, Tamil),
 * and flags red-flags / risks in a single structured Gemini prompt.
 */
export async function analyzeDocumentWithGemini(documentText: string): Promise<AnalysisResult> {
  if (!genAI || !apiKey || apiKey === "your_gemini_api_key_here") {
    return analyzeDocumentFallback(documentText);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const prompt = `
You are NyayaSetu, an expert, objective Indian legal document analyst built for ordinary consumers and non-lawyers (e.g. Priya, a first-time tenant in Chennai reviewing a rental agreement, or an employee reviewing an offer letter).
Your task is to analyze the following legal document thoroughly, strictly grounding your analysis in its actual clauses.

DOCUMENT TEXT:
"""
${documentText.slice(0, 100000)}
"""

REQUIREMENTS:
1. Deconstruct the document into its actual numbered or titled clauses.
2. Group each clause into EXACTLY one of these five human-friendly categories:
   - "What you're agreeing to"
   - "Money"
   - "Termination"
   - "Your obligations"
   - "Their obligations"
3. For each clause:
   - Provide "plainEnglish": a simple, easy-to-understand plain English rewrite (free of legalese).
   - Provide "plainHindi": a brief plain Hindi summary of the clause's effect.
   - Provide "plainTamil": a brief plain Tamil summary of the clause's effect.
   - Tag riskLevel: "safe", "low", "medium", or "high".
   - If risky (medium or high), provide "riskReason" (1-line concise reason) and "counterSuggestion" (an actionable counter-clause or negotiation response).
4. Identify all Red Flags (unusual, one-sided, missing, or commonly disputed terms).
   - In an Indian context, note issues like: excessive deposit (e.g., >3 months under TNRRRL Act 2017), sudden eviction (<30 days), void non-competes (Section 27 Indian Contract Act 1872), unilateral landlord inspection without notice, painting charges without wear-and-tear allowance, unlimited employee liability.
5. Compute an overallRiskScore (0 to 100, where 0 is very safe/balanced, 100 is predatory/unilateral).
6. List missing protections (e.g. notice grace periods, repair liability clarity, rent receipts for HRA).
7. Provide a practical, 5-point negotiation action plan.

OUTPUT FORMAT: Return strictly valid JSON adhering to this schema:
{
  "documentType": "string",
  "summary": "string",
  "overallRiskScore": number,
  "riskTier": "Low Risk" | "Moderate Risk" | "High Risk",
  "keyStats": {
    "totalClauses": number,
    "highRiskCount": number,
    "mediumRiskCount": number,
    "safeCount": number
  },
  "clauses": [
    {
      "id": "clause-1",
      "title": "string",
      "originalText": "string",
      "category": "What you're agreeing to" | "Money" | "Termination" | "Your obligations" | "Their obligations",
      "plainEnglish": "string",
      "plainHindi": "string",
      "plainTamil": "string",
      "riskLevel": "safe" | "low" | "medium" | "high",
      "riskReason": "string or null",
      "counterSuggestion": "string or null"
    }
  ],
  "redFlags": [
    {
      "id": "flag-1",
      "clauseId": "clause-1",
      "title": "string",
      "level": "high" | "medium" | "low",
      "category": "string",
      "problem": "string",
      "whyRisky": "string",
      "counterMeasure": "string",
      "indianLegalContext": "string or null"
    }
  ],
  "missingProtections": ["string"],
  "negotiationActionPlan": ["string"]
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText) as AnalysisResult;
    return parsed;
  } catch (error) {
    console.error("Gemini API call failed, falling back to deterministic engine:", error);
    return analyzeDocumentFallback(documentText);
  }
}

/**
 * Compare Mode: Analyzes two document drafts side-by-side to highlight material changes,
 * risk shifts, and who each change favors.
 */
export async function compareDocumentsWithGemini(doc1: string, doc2: string): Promise<CompareResult> {
  if (!genAI || !apiKey || apiKey === "your_gemini_api_key_here") {
    return compareDocumentsFallback(doc1, doc2);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const prompt = `
You are NyayaSetu's contract diff engine. Compare these two legal document drafts (Draft 1: Original vs Draft 2: Revised).
Analyze what materially changed, who the change favors (you vs counterparty vs neutral), and the risk shift.

DRAFT 1:
"""
${doc1.slice(0, 50000)}
"""

DRAFT 2:
"""
${doc2.slice(0, 50000)}
"""

OUTPUT FORMAT: Return strictly valid JSON adhering to this schema:
{
  "summary": "string",
  "verdict": "string",
  "favorsOverall": "Draft 1" | "Draft 2" | "Balanced",
  "draft1Score": number,
  "draft2Score": number,
  "differences": [
    {
      "id": "diff-1",
      "clauseTitle": "string",
      "category": "string",
      "draft1Text": "string",
      "draft2Text": "string",
      "materialChange": "string",
      "favors": "you" | "counterparty" | "neutral",
      "riskShift": "improved" | "worsened" | "neutral",
      "recommendation": "string"
    }
  ],
  "keyTakeaways": ["string"]
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText) as CompareResult;
  } catch (error) {
    console.error("Gemini compare failed, falling back to deterministic diff:", error);
    return compareDocumentsFallback(doc1, doc2);
  }
}

/**
 * Ask-The-Document: Q&A box grounded strictly in the provided document text.
 * Refuses external hallucinated advice and provides specific clause citations.
 */
export async function chatWithDocumentWithGemini(
  question: string,
  docText: string,
  history: Array<{ role: string; content: string }> = []
): Promise<{ answer: string; citations: Citation[] }> {
  if (!genAI || !apiKey || apiKey === "your_gemini_api_key_here") {
    return chatFallback(question, docText);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const prompt = `
You are NyayaSetu's Ask-The-Document assistant.
CRITICAL RULE: You are STRICTLY GROUNDED in the text of the uploaded document.
DO NOT provide generic legal advice or invent facts not present in the document.
If the document does not mention or cover the user's question, clearly state: "The provided document does not contain any clause addressing this topic."
Always extract and cite the exact relevant clause title and text snippet.

DOCUMENT TEXT:
"""
${docText.slice(0, 75000)}
"""

CONVERSATION HISTORY:
${history.map((h) => `${h.role.toUpperCase()}: ${h.content}`).join("\n")}

USER QUESTION:
"${question}"

OUTPUT FORMAT: Return strictly valid JSON:
{
  "answer": "string (direct, clear plain-language answer grounded solely in the document text)",
  "citations": [
    {
      "clauseTitle": "string",
      "snippet": "string (relevant exact text snippet from the document)"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText) as { answer: string; citations: Citation[] };
  } catch (error) {
    console.error("Gemini chat failed, falling back to local search:", error);
    return chatFallback(question, docText);
  }
}
