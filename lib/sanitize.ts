/**
 * Input sanitization and prompt injection defense utilities
 */

export const MAX_DOCUMENT_LENGTH = 120000; // ~30k tokens max
export const MAX_QUESTION_LENGTH = 2000;

// High-risk prompt injection phrases commonly used to divert system prompts
const INJECTION_PATTERNS = [
  /ignore\s+all\s+(previous|prior)\s+instructions/gi,
  /disregard\s+all\s+(previous|prior)\s+instructions/gi,
  /you\s+are\s+now\s+in\s+developer\s+mode/gi,
  /system\s*:\s*override/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /\[SYSTEM_PROMPT\]/gi,
  /jailbreak/gi,
];

/**
 * Sanitizes input text from user documents or query fields.
 * Removes control characters, normalizes line endings, checks size, and flags/neutralizes injection attempts.
 */
export function sanitizeText(text: string, maxLength: number = MAX_DOCUMENT_LENGTH): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  // 1. Truncate to maximum allowable length
  let cleaned = text.slice(0, maxLength);

  // 2. Normalize CRLF / CR to standard LF
  cleaned = cleaned.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 3. Remove non-printable control characters (except newline, tab, carriage return)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 4. Defang common prompt injection delimiters
  for (const pattern of INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, "[filtered-prompt-instruction]");
  }

  return cleaned.trim();
}

/**
 * Validates document length and non-emptiness.
 */
export function validateDocumentInput(text: string): { valid: boolean; error?: string; text: string } {
  const sanitized = sanitizeText(text);

  if (!sanitized || sanitized.length < 50) {
    return {
      valid: false,
      error: "Document is too short to analyze. Please provide a contract or agreement with at least 50 characters.",
      text: sanitized,
    };
  }

  if (sanitized.length > MAX_DOCUMENT_LENGTH) {
    return {
      valid: false,
      error: `Document exceeds maximum supported size (${MAX_DOCUMENT_LENGTH.toLocaleString()} characters). Please paste a shorter excerpt.`,
      text: sanitized.slice(0, MAX_DOCUMENT_LENGTH),
    };
  }

  return { valid: true, text: sanitized };
}
