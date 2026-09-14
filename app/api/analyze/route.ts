import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { validateDocumentInput } from "@/lib/sanitize";
import { extractTextFromPdf } from "@/lib/pdf";
import { analyzeDocumentWithGemini } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (in-memory, privacy-preserving)
    const ip = getClientIp(req.headers);
    const rateLimit = checkRateLimit(ip, 25, 60);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many analysis requests. Please wait ${rateLimit.resetSeconds} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.resetSeconds.toString(),
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    let rawText = "";
    const contentType = req.headers.get("content-type") || "";

    // 2. Handle either Multipart Form Data (PDF/file upload) or JSON (direct paste)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const textParam = formData.get("text") as string | null;

      if (file) {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
          rawText = await extractTextFromPdf(fileBuffer);
        } else {
          // Assume utf-8 plain text file
          rawText = fileBuffer.toString("utf-8");
        }
      } else if (textParam) {
        rawText = textParam;
      }
    } else {
      const body = await req.json();
      rawText = body.text || "";
    }

    // 3. Sanitize and validate input
    const validation = validateDocumentInput(rawText);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Invalid document input." },
        { status: 400 }
      );
    }

    // 4. Run unified Gemini analysis pipeline (clauses, plain language, and risk flags)
    const analysis = await analyzeDocumentWithGemini(validation.text);

    return NextResponse.json(
      {
        success: true,
        data: analysis,
      },
      {
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error: unknown) {
    console.error("Error in /api/analyze:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to analyze document. Please try again." },
      { status: 500 }
    );
  }
}
