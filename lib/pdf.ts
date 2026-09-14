/**
 * Server-side PDF text extraction utility
 */

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to prevent client bundle inclusion
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParseModule = await import("pdf-parse");
    // Handle both default and named export variants
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParse = (pdfParseModule as any).default || pdfParseModule;

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
