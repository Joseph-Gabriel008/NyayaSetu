export type ClauseCategory =
  | "What you're agreeing to"
  | "Money"
  | "Termination"
  | "Your obligations"
  | "Their obligations";

export type RiskLevel = "high" | "medium" | "low" | "safe";

export interface DocumentClause {
  id: string;
  title: string;
  originalText: string;
  category: ClauseCategory;
  plainEnglish: string;
  plainHindi?: string;
  plainTamil?: string;
  riskLevel: RiskLevel;
  riskReason?: string;
  counterSuggestion?: string;
}

export interface RiskFlag {
  id: string;
  clauseId?: string;
  title: string;
  level: "high" | "medium" | "low";
  category: string;
  problem: string;
  whyRisky: string;
  counterMeasure: string;
  indianLegalContext?: string;
}

export interface AnalysisResult {
  documentType: string;
  summary: string;
  overallRiskScore: number; // 0 to 100
  riskTier: "Low Risk" | "Moderate Risk" | "High Risk";
  keyStats: {
    totalClauses: number;
    highRiskCount: number;
    mediumRiskCount: number;
    safeCount: number;
  };
  clauses: DocumentClause[];
  redFlags: RiskFlag[];
  missingProtections: string[];
  negotiationActionPlan: string[];
}

export interface CompareDifference {
  id: string;
  clauseTitle: string;
  category: string;
  draft1Text: string;
  draft2Text: string;
  materialChange: string;
  favors: "you" | "counterparty" | "neutral";
  riskShift: "improved" | "worsened" | "neutral";
  recommendation: string;
}

export interface CompareResult {
  summary: string;
  verdict: string;
  favorsOverall: "Draft 1" | "Draft 2" | "Balanced";
  draft1Score: number;
  draft2Score: number;
  differences: CompareDifference[];
  keyTakeaways: string[];
}

export interface Citation {
  clauseTitle: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: string;
}
