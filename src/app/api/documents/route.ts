import { NextResponse } from "next/server";
import { saveMedicalDocument } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const patientId = formData.get("patientId");
    const file = formData.get("file");
    if (typeof patientId !== "string" || !(file instanceof File) || !file.name.trim()) {
      return NextResponse.json({ error: "patientId and file are required" }, { status: 400 });
    }
    const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: "Only PDF, JPEG, and PNG files are supported" }, { status: 400 });
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Files must be 10 MB or smaller" }, { status: 400 });
    }
    const result = await saveMedicalDocument({
      patientId,
      name: file.name,
      type: file.type,
      size: file.size,
      body: Buffer.from(await file.arrayBuffer()),
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("DATABASE_URL")
      ? error.message
      : "Unable to save medical document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
