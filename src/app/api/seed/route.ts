import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.SEED_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "SEED_SECRET environment variable is not configured on this server" },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const provided = (body as { secret?: string }).secret;

  if (!provided || provided !== secret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    await seedDatabase();
    return NextResponse.json({ ok: true, message: "Database seeded with mock data" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during seeding";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
