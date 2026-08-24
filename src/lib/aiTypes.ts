import {
  Patient,
  Vitals,
  LabReport,
  Prescription,
  Encounter,
  TimeLineEntry,
} from "./mockData";

/**
 * Shared types for the AI features (OCR + clinical summarization).
 * Reuses the existing domain types from mockData.ts instead of duplicating them.
 */

/* ---------------------------------- OCR ---------------------------------- */

export type OCRConfidence = "high" | "medium" | "low";

/** A single medication extracted from a prescription image. */
export interface OCRMedication {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  confidence: OCRConfidence;
}

/** Response contract of POST /api/ocr */
export interface OCRResponse {
  success: boolean;
  rawText: string;
  medications: OCRMedication[];
}

/* ------------------------------ Summarization ----------------------------- */

/**
 * Multi-source input for clinical summarization.
 * All fields except `patient` are optional/null-tolerant.
 */
export interface SummaryInput {
  patient: Patient;
  /** Patient-side self-reported vitals + symptoms (may be null). */
  selfReportVitals?: Vitals | null;
  /** Raw text produced by prescription OCR (may be null). */
  prescriptionText?: string | null;
  /** Structured prescriptions already recorded in this session (may be null). */
  prescriptions?: Prescription[] | null;
  /** Laboratory/test reports (may be null). */
  labReports?: LabReport[] | null;
  /** Current active encounter (may be null). */
  activeEncounter?: Encounter | null;
  /** Patient history timeline entries (may be null). */
  timeline?: TimeLineEntry[] | null;
}

/** Risk badge colors match the DoctorClinical rendering contract. */
export type SummaryRiskColor = "red" | "yellow";

export interface SummaryRiskBadge {
  label: string;
  color: SummaryRiskColor;
}

/** Response contract of POST /api/summarize */
export interface SummaryOutput {
  clinicalBrief: string;
  riskBadges: SummaryRiskBadge[];
  focusAreas: string[];
}
