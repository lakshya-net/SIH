import { NextResponse } from "next/server";
import { completeTreatment, getState } from "@/lib/db";
import { generateGeminiContent, parseModelJson } from "@/lib/gemini";

export const runtime = "nodejs";

const SUMMARIZE_PROMPT = `You are a clinical documentation assistant. Based on the patient's disease history provided, create a concise treatment summary.

Follow these rules:
1. Summarize ONLY the supplied patient data. Never invent information.
2. Focus on the disease progression, key findings, and treatment outcomes.
3. Keep it doctor-readable and concise (2-4 sentences).
4. Highlight abnormal test results and critical findings.
5. Note medication changes and their effectiveness where available.

Return ONLY a JSON object in this shape:
{
  "clinicalBrief": "<2-4 sentence summary of disease history and treatment>"
}`;

const SUMMARY_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    clinicalBrief: {
      type: "STRING",
      description: "Concise clinical summary of the disease history and treatment outcome.",
    },
  },
  required: ["clinicalBrief"],
};

async function generateDiseaseHistorySummary(
  patient: {
    id: string;
    uniqueHealthId: string;
    name: string;
    age: number;
    gender: string;
    bloodGroup: string;
    allergies: string[];
    chronicConditions: string[];
  },
  diagnosis: string,
  timeline: Array<{
    id: string;
    patientId: string;
    date: string;
    type: string;
    title: string;
    description: string;
    doctorName?: string;
  }>,
  labReports: Array<{
    id: string;
    patientId: string;
    testName: string;
    date: string;
    doctorId: string;
    results: Array<{
      testName: string;
      value: number;
      unit: string;
      referenceRange: string;
      status: "Normal" | "High" | "Low" | "Critical";
    }>;
  }>,
  prescriptions: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>
): Promise<string> {
  try {
    // Filter timeline, labs, and prescriptions for this disease
    const diagnosisParts = diagnosis.toLowerCase().split(/\s+/).filter(Boolean);
    const diseasePattern = new RegExp(diagnosisParts.map(p => `\\b${p}`).join("|"), "i");
    
    const relatedTimeline = timeline.filter(
      (entry) =>
        entry.patientId === patient.id &&
        (diseasePattern.test(entry.title) || diseasePattern.test(entry.description))
    );
    
    const relatedLabs = labReports.filter(
      (lab) => lab.patientId === patient.id && diseasePattern.test(lab.testName)
    );
    
    const relatedPrescriptions = prescriptions.filter(
      (rx) => diseasePattern.test(rx.medicineName) || diseasePattern.test(rx.duration)
    );

    // Build context for Gemini
    const contextData = {
      patient: {
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        chronicConditions: patient.chronicConditions,
        allergies: patient.allergies,
      },
      diagnosis,
      timeline: relatedTimeline.slice(0, 10),
      labReports: relatedLabs.slice(0, 5).map((lab) => ({
        testName: lab.testName,
        date: lab.date,
        results: lab.results,
      })),
      prescriptions: relatedPrescriptions,
    };

    const rawModelOutput = await generateGeminiContent({
      parts: [
        { text: SUMMARIZE_PROMPT },
        {
          text: `Disease History Data:\n\n${JSON.stringify(contextData, null, 2)}`,
        },
      ],
      temperature: 0.2,
      maxOutputTokens: 1024,
      responseSchema: SUMMARY_RESPONSE_SCHEMA,
    });

    const parsed = parseModelJson<{ clinicalBrief?: string }>(rawModelOutput);
    return parsed?.clinicalBrief || "Treatment completed successfully.";
  } catch (error) {
    console.error("[generateDiseaseHistorySummary] Error:", error);
    return `Treatment for ${diagnosis} completed successfully.`;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.patientId || !Array.isArray(body.prescriptions)) {
      return NextResponse.json({ error: "Invalid treatment completion request" }, { status: 400 });
    }

    // Get patient state to gather disease-related history
    let diseaseNarrative = "Treatment completed successfully.";
    try {
      const state = await getState();
      const patient = state.patients.find((p) => p.id === body.patientId);

      if (patient && body.diagnosis) {
        diseaseNarrative = await generateDiseaseHistorySummary(
          patient,
          body.diagnosis,
          state.timeline,
          state.labReports,
          body.prescriptions
        );
      }
    } catch (summaryError) {
      console.error("[api/treatments/complete] Summarization error:", summaryError);
      diseaseNarrative = `Treatment for ${body.diagnosis || "patient condition"} completed.`;
    }

    await completeTreatment({ ...body, diseaseNarrative });
    return NextResponse.json({ ok: true, compacted: true, diseaseNarrative });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to complete treatment" },
      { status: 500 },
    );
  }
}
