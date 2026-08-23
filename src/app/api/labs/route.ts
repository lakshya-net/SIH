import { NextResponse } from "next/server";
import { saveLab } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.patientId || !body.testName || !Array.isArray(body.results)) return NextResponse.json({ error: "Invalid lab submission" }, { status: 400 });
    await saveLab(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("DATABASE_URL")
      ? error.message
      : "Unable to save lab report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
