import { NextResponse } from "next/server";
import { savePrescription } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.patientId || !Array.isArray(body.prescriptions)) return NextResponse.json({ error: "Invalid prescription submission" }, { status: 400 });
    await savePrescription(body);
    return NextResponse.json({ ok: true, compacted: false });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to commit prescription" }, { status: 500 });
  }
}
