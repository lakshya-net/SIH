import { NextResponse } from "next/server";
import { verifyIdentity } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.patientId || !["otp", "national-id"].includes(body.method)) return NextResponse.json({ error: "Invalid verification request" }, { status: 400 });
    await verifyIdentity(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("DATABASE_URL")
      ? error.message
      : "Unable to record verification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
