import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  let fileName = "";
  if (key === "chennai_rental") {
    fileName = "chennai-rental-agreement.txt";
  } else if (key === "chennai_rental_draft2") {
    fileName = "chennai-rental-draft2.txt";
  } else if (key === "tech_offer") {
    fileName = "tech-employment-contract.txt";
  } else {
    return NextResponse.json({ error: "Invalid preset key" }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), "test-fixtures", fileName);
    const content = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Failed to read preset:", error);
    return NextResponse.json({ error: "Failed to read preset file" }, { status: 500 });
  }
}
