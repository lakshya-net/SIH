import { NextResponse } from "next/server";
import { GeminiApiError, generateGeminiContent, parseModelJson } from "@/lib/gemini";
import type { SummaryInput, SummaryOutput, SummaryRiskColor } from "@/lib/aiTypes";

/**
 * POST /api/summarize
 *
 * Accepts a JSON SummaryInput payload combining patient record, self-reported
 * vitals/symptoms, prescription OCR text, lab reports, the active encounter and
 * the history timeline, and returns a structured doctor-readable summary
 * ({ clinicalBrief, riskBadges, focusAreas }) matching the existing
 * DoctorClinical rendering contract.
 *
 * All fields except `patient` are optional and handled gracefully when
 * missing/null. GEMINI_API_KEY is read server-side only.
 */

export const runtime = "nodejs";

const SUMMARIZE_PROMPT = `You are a clinical documentation assistant preparing a pre-consultation brief for a doctor. You will receive structured patient data as JSON.

Follow these rules strictly:
1. Summarize ONLY information supplied in the request. Never use outside medical knowledge about this specific patient.
2. Do NOT invent diagnoses, medications, symptoms, lab values, or history that are not present in the supplied data.
3. Do NOT treat OCR-extracted prescription text (which may contain "[unclear]" markers or low-confidence entries) as confirmed fact — qualify it appropriately.
4. Do NOT provide unsupported treatment recommendations or prescribe anything.
5. Distinguish documented facts from clinical interpretation. You may note obvious data patterns (e.g. a lab value outside its reference range) but label interpretation clearly.
6. Highlight abnormal and critical test results using the status already marked in the supplied lab data (Normal/High/Low/Critical).
7. Mention allergies and chronic conditions when relevant to the current encounter or reported symptoms.
8. Include current medications from the supplied prescription/OCR data when available.
9. Include patient-reported symptoms and self-reported vitals when available.
10. Keep the result concise and doctor-readable (clinicalBrief: 3-6 sentences).

Return ONLY a JSON object (no markdown, no commentary) in exactly this shape:
{
  "clinicalBrief": "<string>",
  "riskBadges": [
    { "label": "<short risk label>", "color": "<red|yellow>" }
  ],
  "focusAreas": ["<short actionable focus area string>"]
}
Use "red" for critical/high-risk items (allergies, critical lab values, dangerous trends) and "yellow" for cautionary items. Provide 0-6 riskBadges and 0-6 focusAreas.`;

/**
 * Strict JSON Schema constraining the model output to exactly the
 * SummaryOutput shape ({clinicalBrief, riskBadges[], focusAreas[]}).
 * Without this schema, Gemini JSON mode only guarantees valid JSON syntax
 * and may not produce the exact keys/structure we parse.
 */
const SUMMARY_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    clinicalBrief: {
      type: "STRING",
      description:
        "Concise, doctor-readable clinical brief (3-6 sentences) summarising only the supplied patient data.",
    },
    riskBadges: {
      type: "ARRAY",
      description: "Short risk labels with a severity color. 0-6 items.",
      items: {
        type: "OBJECT",
        properties: {
          label: {
            type: "STRING",
            description: "Short risk label, e.g. 'Allergic to Penicillin' or 'HbA1c Critical'.",
          },
          color: {
            type: "STRING",
            enum: ["red", "yellow"],
            description: "'red' for critical/high-risk items, 'yellow' for cautionary items.",
          },
        },
        required: ["label", "color"],
      },
    },
    focusAreas: {
      type: "ARRAY",
      description: "Short actionable focus area strings. 0-6 items.",
      items: { type: "STRING" },
    },
  },
  required: ["clinicalBrief", "riskBadges", "focusAreas"],
};


function jsonError(error: string, status: number, details?: unknown) {
  return NextResponse.json({ success: false, error, details }, { status });
}

/** Builds a compact, trimmed JSON context block from the (possibly null) inputs. */
function buildContextPayload(input: SummaryInput) {
  const compact = (value: unknown) => (value === undefined ? null : value);

  return {
    patient: {
      id: input.patient.id,
      uniqueHealthId: input.patient.uniqueHealthId,
      name: input.patient.name,
      age: input.patient.age,
      gender: input.patient.gender,
      bloodGroup: input.patient.bloodGroup,
      allergies: Array.isArray(input.patient.allergies) ? input.patient.allergies : [],
      chronicConditions: Array.isArray(input.patient.chronicConditions)
        ? input.patient.chronicConditions
        : [],
    },
    selfReportVitals: compact(input.selfReportVitals),
    prescriptionText: compact(input.prescriptionText),
    prescriptions:
      Array.isArray(input.prescriptions) && input.prescriptions.length > 0
        ? input.prescriptions
        : null,
    labReports:
      Array.isArray(input.labReports) && input.labReports.length > 0
        ? input.labReports
        : null,
    activeEncounter: compact(input.activeEncounter),
    // Keep the prompt bounded; timeline is expected most-recent-first.
    timeline:
      Array.isArray(input.timeline) && input.timeline.length > 0
        ? input.timeline.slice(0, 20) // keep prompt bounded; most recent first
        : null,
  };
}

function normalizeColor(value: unknown): SummaryRiskColor {
  return value === "yellow" ? "yellow" : "red";
}

function normalizeSummary(parsed: {
  clinicalBrief?: unknown;
  riskBadges?: unknown;
  focusAreas?: unknown;
}): SummaryOutput | null {
  if (typeof parsed.clinicalBrief !== "string" || !parsed.clinicalBrief.trim()) {
    return null;
  }

  const riskBadges = Array.isArray(parsed.riskBadges)
    ? parsed.riskBadges
        .filter(
          (b) =>
            b &&
            typeof b === "object" &&
            typeof (b as { label?: unknown }).label === "string" &&
            (b as { label: string }).label.trim().length > 0
        )
        .slice(0, 8)
        .map((b) => ({
          label: (b as { label: string }).label.trim(),
          color: normalizeColor((b as { color?: unknown }).color),
        }))
    : [];

  const focusAreas = Array.isArray(parsed.focusAreas)
    ? parsed.focusAreas
        .filter((a): a is string => typeof a === "string" && a.trim().length > 0)
        .slice(0, 8)
        .map((a) => a.trim())
    : [];

  return {
    clinicalBrief: parsed.clinicalBrief.trim(),
    riskBadges,
    focusAreas,
  };
}

export async function POST(request: Request) {
  try {
    let body: SummaryInput;
    try {
      body = (await request.json()) as SummaryInput;
    } catch {
      return jsonError("Request body must be valid JSON.", 400);
    }

    if (!body || typeof body !== "object" || !body.patient || typeof body.patient !== "object") {
      return jsonError(
        "Invalid request body: a 'patient' object is required. All other fields are optional.",
        400
      );
    }

    if (!body.patient.id || !body.patient.name) {
      return jsonError(
        "Invalid request body: 'patient' must include at least 'id' and 'name'.",
        400
      );
    }

    const contextPayload = buildContextPayload(body);

    const rawModelOutput = await generateGeminiContent({
      parts: [
        { text: SUMMARIZE_PROMPT },
        {
          text: `Here is the patient data JSON:\n\n${JSON.stringify(contextPayload, null, 2)}`,
        },
      ],
      temperature: 0.2,
      maxOutputTokens: 2048,
      responseSchema: SUMMARY_RESPONSE_SCHEMA,
    });

    const parsed = parseModelJson<Record<string, unknown>>(rawModelOutput);
    const summary = parsed ? normalizeSummary(parsed) : null;

    if (!summary) {
      return jsonError(
        "Summarization succeeded at the model level but returned malformed output. Please retry.",
        502,
        { rawModelOutput }
      );
    }

    return NextResponse.json({ success: true, ...summary });
  } catch (error) {
    if (error instanceof GeminiApiError) {
      return jsonError(error.message, error.status);
    }
    console.error("[api/summarize] Unexpected error:", error);
    return jsonError(
      "An unexpected server error occurred during summarization.",
      500,
      error instanceof Error ? error.message : String(error)
    );
  }
}

