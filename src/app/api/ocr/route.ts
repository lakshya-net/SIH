import { NextResponse } from "next/server";
import { GeminiApiError, generateGeminiContent, parseModelJson } from "@/lib/gemini";
import type { OCRMedication, OCRConfidence } from "@/lib/aiTypes";

/**
 * POST /api/ocr
 *
 * Accepts multipart/form-data with an "image" field containing a photo/scan of a
 * doctor's handwritten prescription, sends it to the Gemini multimodal model, and
 * returns extracted raw text + a structured medication list.
 *
 * The GEMINI_API_KEY is read server-side only; it is never exposed to the client.
 */

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
// Some browsers report JPEG as image/jpg; accept both.
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const OCR_PROMPT = `You are a medical transcription assistant. The attached image is a doctor's handwritten or printed prescription.

Follow these rules strictly:
1. Extract ONLY information that is visibly/documentably present in the image.
2. Do NOT invent missing medicine names, dosages, frequencies, or durations.
3. Preserve uncertainty where handwriting is unclear: use "[unclear]" as the value for any field you cannot read reliably.
4. Clearly mark uncertain fields rather than guessing. Set each medication's "confidence" to:
   - "high": text is clearly legible
   - "medium": partially legible, minor ambiguity
   - "low": mostly illegible or inferred from fragments
5. Do not diagnose the patient.
6. Do not add medical advice, interpretations, or recommendations.

Return ONLY a JSON object (no markdown, no commentary) in exactly this shape:
{
  "rawText": "<full plain-text transcription of everything legible on the prescription>",
  "medications": [
    {
      "medicineName": "<string>",
      "dosage": "<string, e.g. 500mg, or [unclear]>",
      "frequency": "<string, e.g. BD/TDS/OD, or [unclear]>",
      "duration": "<string, e.g. 5 days, or [unclear]>",
      "confidence": "<high|medium|low>"
    }
  ]
}
If no medications are identifiable, return an empty "medications" array.`;

/**
 * Strict JSON Schema constraining the model output to exactly the OCRResponse
 * shape ({rawText, medications[]}). Without this schema, Gemini JSON mode only
 * guarantees valid JSON syntax and may not produce the exact keys/structure
 * the OCR route parses — which manifested as the "malformed output" failure.
 */
const OCR_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    rawText: {
      type: "STRING",
      description:
        "Full plain-text transcription of everything legible on the prescription, preserving uncertainty where handwriting is unclear.",
    },
    medications: {
      type: "ARRAY",
      description: "Structured medication list extracted from the prescription. May be empty.",
      items: {
        type: "OBJECT",
        properties: {
          medicineName: {
            type: "STRING",
            description: "Name of the medicine, or '[unclear]' if not reliably readable.",
          },
          dosage: {
            type: "STRING",
            description: "Dosage label (e.g. 500mg), or '[unclear]' if unknown.",
          },
          frequency: {
            type: "STRING",
            description: "Frequency (e.g. BD/TDS/OD), or '[unclear]' if unknown.",
          },
          duration: {
            type: "STRING",
            description: "Duration (e.g. 5 days), or '[unclear]' if unknown.",
          },
          confidence: {
            type: "STRING",
            enum: ["high", "medium", "low"],
            description: "Confidence in the extracted medication fields.",
          },
        },
        required: ["medicineName", "dosage", "frequency", "duration", "confidence"],
      },
    },
  },
  required: ["rawText", "medications"],
};

/**
 * Stage-2 fallback: text-only structured extraction from the rawText returned
 * by the vision pass. Some multimodal responses satisfy the schema for
 * rawText but omit an unusable medications[] payload; this second call is
 * constrained to EXACTLY the medication shape the Neon persistence workflow
 * requires (medicineName, dosage, frequency, duration, confidence).
 */
const MEDICATIONS_EXTRACTION_PROMPT = `You are a medical transcription assistant. You are given the plain-text transcription of a doctor's prescription. Extract a structured list of medications FROM THIS TEXT ONLY.

Follow these rules strictly:
1. Use ONLY information present in the supplied transcription text. Do NOT use outside knowledge about this prescription.
2. Do NOT invent medicine names, dosages, frequencies, or durations that are not stated in the text.
3. Use "[unclear]" as the value for any field that cannot be established from the text.
4. Set each medication's "confidence" to:
   - "high": explicitly and unambiguously stated in the text
   - "medium": partially stated or minor ambiguity
   - "low": inferred from fragments
5. Do not diagnose the patient. Do not add medical advice, interpretations, or recommendations.
6. If no medications can be identified in the text, return an empty array.

Return ONLY a JSON object matching the required schema.`;

const MEDICATIONS_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    medications: {
      type: "ARRAY",
      description:
        "Structured medication list extracted from the transcription. May be empty.",
      items: {
        type: "OBJECT",
        properties: {
          medicineName: {
            type: "STRING",
            description: "Name of the medicine, or '[unclear]' if not stated.",
          },
          dosage: {
            type: "STRING",
            description: "Dosage label (e.g. 500mg), or '[unclear]'.",
          },
          frequency: {
            type: "STRING",
            description: "Frequency (e.g. BD/TDS/OD), or '[unclear]'.",
          },
          duration: {
            type: "STRING",
            description: "Duration (e.g. 5 days), or '[unclear]'.",
          },
          confidence: {
            type: "STRING",
            enum: ["high", "medium", "low"],
            description:
              "'high' if explicitly stated, 'medium' if partially stated, 'low' if inferred from fragments.",
          },
        },
        required: ["medicineName", "dosage", "frequency", "duration", "confidence"],
      },
    },
  },
  required: ["medications"],
};

function jsonError(error: string, status: number, details?: unknown) {
  return NextResponse.json({ success: false, error, details }, { status });
}

/** Normalizes an arbitrary model-provided list into strict OCRMedication objects. */
function normalizeMedications(list: unknown): OCRMedication[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((m) => m as Partial<OCRMedication>)
    .filter(
      (m) =>
        !!m &&
        typeof m.medicineName === "string" &&
        m.medicineName.trim().length > 0
    )
    .map((m) => ({
      medicineName: m.medicineName!.trim(),
      dosage: typeof m.dosage === "string" ? m.dosage.trim() : "[unclear]",
      frequency: typeof m.frequency === "string" ? m.frequency.trim() : "[unclear]",
      duration: typeof m.duration === "string" ? m.duration.trim() : "[unclear]",
      confidence: normalizeConfidence(m.confidence),
    }));
}

function normalizeConfidence(value: unknown): OCRConfidence {
  return value === "high" || value === "medium" || value === "low" ? value : "medium";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return jsonError(
        "Request must be multipart/form-data.",
        400
      );
    }

    const image = formData.get("image");
    if (!image || typeof image === "string") {
      return jsonError(
        "Missing required file field 'image' in multipart/form-data.",
        400
      );
    }

    const mimeType = image.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return jsonError(
        `Unsupported image type "${image.type}". Supported types: JPEG, PNG, WEBP.`,
        415
      );
    }

    if (image.size === 0) {
      return jsonError("Uploaded image is empty.", 400);
    }

    if (image.size > MAX_IMAGE_BYTES) {
      return jsonError(
        `Image too large (${(image.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`,
        413
      );
    }

    const bytes = Buffer.from(await image.arrayBuffer());
    const base64Image = bytes.toString("base64");

    const rawModelOutput = await generateGeminiContent({
      parts: [
        { text: OCR_PROMPT },
        // Normalize image/jpg -> image/jpeg for the Gemini API.
        {
          inline_data: {
            mime_type: mimeType === "image/jpg" ? "image/jpeg" : mimeType,
            data: base64Image,
          },
        },
      ],
      temperature: 0.1,
      // Generous budget: long prescriptions previously hit this cap
      // mid-JSON (finishReason MAX_TOKENS), producing truncated output that
      // failed strict parsing and caused spurious 502s.
      maxOutputTokens: 4096,
      responseSchema: OCR_RESPONSE_SCHEMA,
    });

    // ── Temporary diagnostics (remove once OCR is stable) ──
    console.log("[api/ocr] Stage-1 raw model output:", rawModelOutput);

    const parsed = parseModelJson<{
      rawText?: string;
      medications?: Array<Partial<OCRMedication>>;
    }>(rawModelOutput);

    console.log("[api/ocr] Stage-1 parsed object:", parsed);

    // The transcription itself must never be discarded just because strict
    // JSON parsing of the full payload failed (e.g. output truncated by the
    // token cap). Recover ONLY the rawText field with a targeted, escape-aware
    // extraction — never blind grabbing of arbitrary brace content.
    let rawText = typeof parsed?.rawText === "string" ? parsed.rawText : "";
    if (!rawText) {
      const match = rawModelOutput.match(/"rawText"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      if (match) {
        try {
          const recovered = JSON.parse(`"${match[1]}"`) as string;
          if (typeof recovered === "string" && recovered.trim().length > 0) {
            rawText = recovered;
            console.log(
              "[api/ocr] Recovered rawText via targeted field extraction after strict parse failure."
            );
          }
        } catch {
          /* recovery failed; rawText stays empty */
        }
      }
    }

    // Only a genuinely unusable model response (no transcription at all)
    // is an error now.
    if (!rawText) {
      return jsonError(
        "OCR succeeded at the model level but returned malformed output. Please retry.",
        502,
        { rawModelOutput }
      );
    }

    // ── Trace logging (temporary diagnostics) ──
    console.log("[api/ocr] rawText length:", rawText.length);

    // Stage 1: vision pass. Normalize whatever medication entries came back.
    const stage1Medications = normalizeMedications(parsed?.medications);

    // ── Trace logging (temporary diagnostics) ──
    console.log(
      "[api/ocr] Stage-1 normalized medications length:",
      stage1Medications.length
    );

    let finalMedications = stage1Medications;

    if (finalMedications.length > 0 || rawText.trim().length === 0) {
      console.log("[api/ocr] Stage-2 fallback not entered.");
    } else {
      console.log("[api/ocr] Entering Stage-2 text-only structured extraction.");
      try {
        const extractionOutput = await generateGeminiContent({
          parts: [
            {
              text: `${MEDICATIONS_EXTRACTION_PROMPT}\n\nPrescription transcription:\n"""\n${rawText}\n"""`,
            },
          ],
          temperature: 0,
          maxOutputTokens: 1024,
          responseSchema: MEDICATIONS_RESPONSE_SCHEMA,
        });

        // ── Trace logging (temporary diagnostics) ──
        console.log("[api/ocr] Stage-2 raw model output:", extractionOutput);

        const extractionParsed = parseModelJson<{
          medications?: Array<Partial<OCRMedication>>;
        }>(extractionOutput);

        // ── Trace logging (temporary diagnostics) ──
        console.log("[api/ocr] Stage-2 parsed object:", extractionParsed);

        const extracted = normalizeMedications(extractionParsed?.medications);

        // ── Trace logging (temporary diagnostics) ──
        console.log(
          "[api/ocr] Stage-2 normalized medications length:",
          extracted.length
        );

        if (extracted.length > 0) {
          finalMedications = extracted;
        }
      } catch (fallbackError) {
        console.error(
          "[api/ocr] Stage-2 structured medication extraction failed:",
          fallbackError
        );
      }
    }

    // The valid transcription is returned even when no structured medications
    // could be extracted: the doctor reviews/edits everything before anything
    // reaches the Neon persistence workflow, so an empty array is safe.
    return NextResponse.json({
      success: true,
      rawText,
      medications: finalMedications,
    });
  } catch (error) {
    if (error instanceof GeminiApiError) {
      return jsonError(error.message, error.status);
    }
    console.error("[api/ocr] Unexpected error:", error);
    return jsonError(
      "An unexpected server error occurred during OCR.",
      500,
      error instanceof Error ? error.message : String(error)
    );
  }
}
