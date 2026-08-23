import { NextResponse } from "next/server";
import { saveSelfReport } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.patientId || !body.vitals) return NextResponse.json({ error: "patientId and vitals are required" }, { status: 400 });
    await saveSelfReport(body.patientId, body.vitals);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("DATABASE_URL")
      ? error.message
      : "Unable to save vitals";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
