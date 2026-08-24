import { NextResponse } from "next/server";
import { registerPatientProfile } from "@/lib/db";
import type { FullPatientProfile } from "@/types/patientHistory";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FullPatientProfile;

    const result = await registerPatientProfile(body);

    return NextResponse.json({
      success: true,
      patientId: result.patientId,
      healthId: body.healthId,
      name: body.basicInfo.fullName,
      encounterId: result.encounterId,
    });
  } catch (error) {
    console.error("[api/patients/register] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to register patient",
      },
      { status: 500 }
    );
  }
}
