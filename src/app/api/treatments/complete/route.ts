import { NextResponse } from "next/server";
import { completeTreatment } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.patientId || !Array.isArray(body.prescriptions)) {
      return NextResponse.json({ error: "Invalid treatment completion request" }, { status: 400 });
    }
    await completeTreatment(body);
    return NextResponse.json({ ok: true, compacted: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to complete treatment" },
      { status: 500 },
    );
  }
}
