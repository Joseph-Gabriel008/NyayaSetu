import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeText, MAX_QUESTION_LENGTH } from "@/lib/sanitize";
import { chatWithDocumentWithGemini } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MANDATORY_DISCLAIMER =
  "This is general information, not legal advice — consult a licensed advocate for your specific situation.";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rateLimit = checkRateLimit(ip, 35, 60);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many chat requests. Please wait ${rateLimit.resetSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { question, docText, history = [] } = body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json({ error: "Please provide a valid question." }, { status: 400 });
    }

    if (!docText || typeof docText !== "string" || docText.trim().length < 50) {
      return NextResponse.json(
        { error: "No document text available. Please upload or analyze a document first." },
        { status: 400 }
      );
    }

    const sanitizedQuestion = sanitizeText(question, MAX_QUESTION_LENGTH);
    const result = await chatWithDocumentWithGemini(sanitizedQuestion, docText, history);

    return NextResponse.json({
      success: true,
      answer: result.answer,
      citations: result.citations || [],
      disclaimer: MANDATORY_DISCLAIMER,
    });
  } catch (error: unknown) {
    console.error("Error in /api/chat:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to answer question grounded in the document." },
      { status: 500 }
    );
  }
}
