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

function jsonError(error: string, status: number, details?: unknown) {
  return NextResponse.json({ success: false, error, details }, { status });
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
      maxOutputTokens: 2048,
    });

    const parsed = parseModelJson<{
      rawText?: string;
      medications?: Array<Partial<OCRMedication>>;
    }>(rawModelOutput);

    if (!parsed || typeof parsed.rawText !== "string") {
      return jsonError(
        "OCR succeeded at the model level but returned malformed output. Please retry.",
        502,
        { rawModelOutput }
      );
    }

    const medications: OCRMedication[] = Array.isArray(parsed.medications)
      ? parsed.medications
          .filter(
            (m) =>
              m &&
              typeof m === "object" &&
              typeof m.medicineName === "string" &&
              m.medicineName.trim().length > 0
          )
          .map((m) => ({
            medicineName: m.medicineName!.trim(),
            dosage: typeof m.dosage === "string" ? m.dosage.trim() : "[unclear]",
            frequency: typeof m.frequency === "string" ? m.frequency.trim() : "[unclear]",
            duration: typeof m.duration === "string" ? m.duration.trim() : "[unclear]",
            confidence: normalizeConfidence(m.confidence),
          }))
      : [];

    return NextResponse.json({
      success: true,
      rawText: parsed.rawText,
      medications,
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
