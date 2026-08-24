import { NextResponse } from "next/server";
import { saveHealthUpdate } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.patientId || typeof body.symptoms !== "string" || typeof body.medicalHistory !== "string") {
      return NextResponse.json({ error: "patientId, symptoms, and medicalHistory are required" }, { status: 400 });
    }
    await saveHealthUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("DATABASE_URL")
      ? error.message
      : "Unable to save health update";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
