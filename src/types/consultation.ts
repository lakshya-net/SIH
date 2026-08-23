// ─── Input: What the triage engine consumes ───────────────────────

export interface ConsultationPayload {
  patient: {
    healthId: string;
    fullName: string;
    age: number;
    gender: string;
    bloodGroup: string;
    chronicConditions: Array<{
      conditionName: string;
      diagnosedYear: string;
      status: string;
      latestMetrics?: string;
    }>;
    allergies: Array<{
      allergen: string;
      allergyType: string;
      severity: string;
      reactionDescription?: string;
    }>;
    surgeries: Array<{
      procedureName: string;
      yearOfProcedure: string;
      complicationsOrNotes?: string;
    }>;
    vaccinations: Array<{
      vaccineName: string;
      doseNumber: string;
      administeredDate: string;
    }>;
    activeMedications: Array<{
      drugName: string;
      dosage: string;
      frequency: string;
      prescribedFor: string;
    }>;
  };
  currentVisit: {
    chiefComplaint: string;
    vitals: {
      bp?: string;
      pulse?: string;
      temp?: string;
      spo2?: string;
    };
    todayLabReports: Array<{
      testName: string;
      keyMetrics: Record<string, string | number>;
      status: "normal" | "abnormal" | "critical";
    }>;
  };
}

// ─── Output: What the triage engine produces ──────────────────────

export type RiskLevel =
  | "critical"
  | "high"
  | "moderate"
  | "low"
  | "informational";

export interface RiskAlert {
  id: string;
  level: RiskLevel;
  category:
    | "allergy"
    | "drug-interaction"
    | "chronic-flare"
    | "lab-critical"
    | "vital-abnormal"
    | "vaccination-gap"
    | "surgical-history"
    | "polypharmacy";
  title: string;
  description: string;
  evidence: string[];
  actionRequired: string;
}

export interface DrugInteraction {
  drugA: string;
  drugB: string;
  severity: "major" | "moderate" | "minor";
  description: string;
  recommendation: string;
}

export interface LabTrend {
  testName: string;
  currentValue: string;
  referenceRange: string;
  status: "normal" | "abnormal" | "critical";
  trend?: "improving" | "stable" | "worsening";
  clinicalSignificance: string;
}

export interface CareRecommendation {
  priority: number;
  category:
    | "medication"
    | "diagnostic"
    | "lifestyle"
    | "referral"
    | "monitoring";
  title: string;
  rationale: string;
  evidenceLevel: "strong" | "moderate" | "weak";
}

export interface ClinicalSummaryOutput {
  generatedAt: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  clinicalBrief: string;
  riskAlerts: RiskAlert[];
  drugInteractions: DrugInteraction[];
  labTrends: LabTrend[];
  careRecommendations: CareRecommendation[];
  polypharmacyWarning: boolean;
  allergyAlertCount: number;
  criticalLabCount: number;
}
