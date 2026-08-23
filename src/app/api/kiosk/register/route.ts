import { NextResponse } from "next/server";
import { registerKiosk } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.complaint) return NextResponse.json({ error: "Name and complaint are required" }, { status: 400 });
    const patientId = await registerKiosk(body);
    return NextResponse.json({ ok: true, patientId });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("DATABASE_URL")
      ? error.message
      : "Unable to save kiosk registration";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
