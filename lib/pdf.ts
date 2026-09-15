/**
 * Server-side PDF text extraction utility
 */

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    type PdfParseFn = (doc: Buffer) => Promise<{ text: string }>;
    const pdfParseModule = await import("pdf-parse");
    const pdfParse: PdfParseFn =
      (pdfParseModule as unknown as { default?: PdfParseFn }).default ||
      (pdfParseModule as unknown as PdfParseFn);

    const data = await pdfParse(buffer);
    if (!data || !data.text) {
      throw new Error("No readable text found in PDF. The document might be an image-only scan.");
    }
    return data.text;
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message && err.message.includes("image-only scan")) {
      throw err;
    }
    throw new Error(`Failed to parse PDF document: ${err.message || "Unknown error"}`);
  }
}
