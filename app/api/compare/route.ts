import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { validateDocumentInput } from "@/lib/sanitize";
import { extractTextFromPdf } from "@/lib/pdf";
import { compareDocumentsWithGemini } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rateLimit = checkRateLimit(ip, 20, 60);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many comparison requests. Please wait ${rateLimit.resetSeconds} seconds.` },
        { status: 429 }
      );
    }

    let doc1Text = "";
    let doc2Text = "";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file1 = formData.get("file1") as File | null;
      const file2 = formData.get("file2") as File | null;
      const text1 = formData.get("doc1") as string | null;
      const text2 = formData.get("doc2") as string | null;

      if (file1) {
        const buf = Buffer.from(await file1.arrayBuffer());
        doc1Text = file1.name.toLowerCase().endsWith(".pdf") ? await extractTextFromPdf(buf) : buf.toString("utf-8");
      } else if (text1) {
        doc1Text = text1;
      }

      if (file2) {
        const buf = Buffer.from(await file2.arrayBuffer());
        doc2Text = file2.name.toLowerCase().endsWith(".pdf") ? await extractTextFromPdf(buf) : buf.toString("utf-8");
      } else if (text2) {
        doc2Text = text2;
      }
    } else {
      const body = await req.json();
      doc1Text = body.doc1 || "";
      doc2Text = body.doc2 || "";
    }

    const val1 = validateDocumentInput(doc1Text);
    const val2 = validateDocumentInput(doc2Text);

    if (!val1.valid) {
      return NextResponse.json({ error: `Document 1 issue: ${val1.error}` }, { status: 400 });
    }
    if (!val2.valid) {
      return NextResponse.json({ error: `Document 2 issue: ${val2.error}` }, { status: 400 });
    }

    const comparison = await compareDocumentsWithGemini(val1.text, val2.text);

    return NextResponse.json({
      success: true,
      data: comparison,
    });
  } catch (error: unknown) {
    console.error("Error in /api/compare:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to compare documents." },
      { status: 500 }
    );
  }
}
