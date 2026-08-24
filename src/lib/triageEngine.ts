import {
  ConsultationPayload,
  ClinicalSummaryOutput,
  RiskAlert,
  DrugInteraction,
  LabTrend,
  CareRecommendation,
  RiskLevel,
} from "@/types/consultation";

// ─── Known Drug Interactions Database ─────────────────────────────
const KNOWN_INTERACTIONS: Record<string, DrugInteraction> = {
  "warfarin+aspirin": {
    drugA: "Warfarin",
    drugB: "Aspirin",
    severity: "major",
    description:
      "Concurrent use significantly increases risk of gastrointestinal and intracranial hemorrhage.",
    recommendation:
      "Avoid combination unless specifically indicated. Monitor INR closely. Consider gastroprotective agent.",
  },
  "warfarin+ibuprofen": {
    drugA: "Warfarin",
    drugB: "Ibuprofen",
    severity: "major",
    description:
      "NSAIDs inhibit platelet function and can displace warfarin from protein binding, increasing anticoagulant effect and bleeding risk.",
    recommendation:
      "Avoid NSAIDs with warfarin. Use acetaminophen for pain relief. If NSAID essential, monitor INR within 3 days.",
  },
  "metformin+enalarapril": {
    drugA: "Metformin",
    drugB: "Enalapril",
    severity: "minor",
    description:
      "ACE inhibitors may enhance the hypoglycemic effect of metformin. Generally safe combination.",
    recommendation:
      "Monitor blood glucose initially. Combination is commonly used and generally well-tolerated.",
  },
  "metformin+losartan": {
    drugA: "Metformin",
    drugB: "Losartan",
    severity: "minor",
    description:
      "ARBs may slightly enhance insulin sensitivity. Generally safe and commonly co-prescribed.",
    recommendation:
      "Monitor blood glucose. Therapeutic combination for diabetic patients with hypertension.",
  },
  "aspirin+ibuprofen": {
    drugA: "Aspirin",
    drugB: "Ibuprofen",
    severity: "moderate",
    description:
      "Ibuprofen can reduce the cardioprotective effect of low-dose aspirin by competitive COX-1 inhibition.",
    recommendation:
      "Take aspirin at least 30 minutes before or 8 hours after ibuprofen. Consider alternative analgesic.",
  },
  "clopidogrel+omeprazole": {
    drugA: "Clopidogrel",
    drugB: "Omeprazole",
    severity: "moderate",
    description:
      "Omeprazole inhibits CYP2C19, reducing conversion of clopidogrel to its active metabolite, potentially reducing antiplatelet efficacy.",
    recommendation:
      "Consider pantoprazole as PPI alternative, which has less CYP2C19 inhibition.",
  },
  "amlodipine+atorvastatin": {
    drugA: "Amlodipine",
    drugB: "Atorvastatin",
    severity: "minor",
    description:
      "Amlodipine can slightly increase atorvastatin levels. Fixed-dose combination exists and is generally safe.",
    recommendation:
      "Monitor for statin-related side effects (myalgia). Standard combination therapy is well-established.",
  },
  "metoprolol+amlodipine": {
    drugA: "Metoprolol",
    drugB: "Amlodipine",
    severity: "moderate",
    description:
      "Additive effects on heart rate and blood pressure. Risk of bradycardia and hypotension.",
    recommendation:
      "Monitor heart rate and blood pressure closely. Start with low doses and titrate gradually.",
  },
  "prednisolone+aspirin": {
    drugA: "Prednisolone",
    drugB: "Aspirin",
    severity: "moderate",
    description:
      "Combined use increases risk of gastrointestinal ulceration and bleeding.",
    recommendation:
      "Use gastroprotective agent (PPI) if combination is necessary. Monitor for GI symptoms.",
  },
  "levothyroxine+omeprazole": {
    drugA: "Levothyroxine",
    drugB: "Omeprazole",
    severity: "moderate",
    description:
      "PPIs can reduce levothyroxine absorption by altering gastric pH.",
    recommendation:
      "Separate administration by at least 4 hours. Monitor TSH levels and adjust levothyroxine dose if needed.",
  },
};

// ─── Known Drug Allergen Cross-Reactivity ─────────────────────────
const DRUG_ALLERGY_CROSS_REACTIVITY: Record<string, string[]> = {
  Penicillin: ["Amoxicillin", "Ampicillin", "Piperacillin"],
  "Sulfa drugs": ["Sulfamethoxazole", "Sulfasalazine", "Celecoxib"],
  Aspirin: ["Ibuprofen", "Naproxen", "Diclofenac"],
};

// ─── Critical Lab Thresholds ──────────────────────────────────────
const CRITICAL_THRESHOLDS: Record<
  string,
  { critical_low?: number; critical_high?: number; unit: string }
> = {
  "Glucose (Fasting)": { critical_low: 54, critical_high: 300, unit: "mg/dL" },
  HbA1c: { critical_high: 10, unit: "%" },
  "Total Cholesterol": { critical_high: 300, unit: "mg/dL" },
  "LDL Cholesterol": { critical_high: 190, unit: "mg/dL" },
  Hemoglobin: { critical_low: 7, critical_high: 20, unit: "g/dL" },
  Creatinine: { critical_low: 0.3, critical_high: 4, unit: "mg/dL" },
  "WBC Count": { critical_low: 2000, critical_high: 30000, unit: "/µL" },
  "Platelet Count": { critical_low: 50000, critical_high: 500000, unit: "/µL" },
  "Sodium (Na)": { critical_low: 120, critical_high: 160, unit: "mEq/L" },
  "Potassium (K)": { critical_low: 3, critical_high: 6.5, unit: "mEq/L" },
};

// ─── Helper: Generate unique ID ───────────────────────────────────
function uid(): string {
  return `risk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Helper: Parse BP string ──────────────────────────────────────
function parseBP(bp: string): { systolic: number; diastolic: number } | null {
  if (!bp) return null;
  const match = bp.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return null;
  return { systolic: parseInt(match[1]), diastolic: parseInt(match[2]) };
}

// ─── Helper: Severity score ───────────────────────────────────────
function riskLevelScore(level: RiskLevel): number {
  switch (level) {
    case "critical":
      return 25;
    case "high":
      return 15;
    case "moderate":
      return 8;
    case "low":
      return 3;
    case "informational":
      return 1;
  }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN TRIAGE ENGINE
// ═══════════════════════════════════════════════════════════════════

export function runTriageEngine(
  payload: ConsultationPayload,
): ClinicalSummaryOutput {
  const riskAlerts: RiskAlert[] = [];
  const drugInteractions: DrugInteraction[] = [];
  const labTrends: LabTrend[] = [];
  const careRecommendations: CareRecommendation[] = [];

  // ─── 1. ALLERGY RISK CHECKS ────────────────────────────────────
  const severeAllergies = payload.patient.allergies.filter(
<<<<<<< HEAD
    (a) => a.severity === "severe / anaphylactic",
  );

=======
    (a) => a.severity === "severe / anaphylactic"
  );
>>>>>>> ef6e0f74b2e6f33da9adcbf130238a7a7a6c3490
  // Check for drug allergies against current medications
  for (const allergy of payload.patient.allergies) {
    if (allergy.allergyType === "drug") {
      // Direct match check
      for (const med of payload.patient.activeMedications) {
        if (
          med.drugName.toLowerCase().includes(allergy.allergen.toLowerCase()) ||
          allergy.allergen.toLowerCase().includes(med.drugName.toLowerCase())
        ) {
          riskAlerts.push({
            id: uid(),
            level: "critical",
            category: "allergy",
            title: `ACTIVE ALLERGEN: ${allergy.allergen}`,
            description: `Patient is prescribed ${med.drugName} but has a known ${allergy.severity} allergy to ${allergy.allergen}. ${allergy.reactionDescription ? `Reaction: ${allergy.reactionDescription}.` : ""}`,
            evidence: [
              `Allergy: ${allergy.allergen} (${allergy.severity})`,
              `Active medication: ${med.drugName} ${med.dosage} ${med.frequency}`,
              allergy.reactionDescription
                ? `Reaction: ${allergy.reactionDescription}`
                : "",
            ].filter(Boolean),
            actionRequired:
              "DISCONTINUE immediately. Select alternative medication.",
          });
        }
      }

      // Cross-reactivity check
      const crossReactive =
        DRUG_ALLERGY_CROSS_REACTIVITY[allergy.allergen] || [];
      for (const med of payload.patient.activeMedications) {
<<<<<<< HEAD
        if (
          crossReactive.some((cr) =>
            med.drugName.toLowerCase().includes(cr.toLowerCase()),
          )
        ) {
=======
        if (crossReactive.some((cr) => med.drugName.toLowerCase().includes(cr.toLowerCase()))) {
>>>>>>> ef6e0f74b2e6f33da9adcbf130238a7a7a6c3490
          riskAlerts.push({
            id: uid(),
            level: "high",
            category: "allergy",
            title: `Cross-reactivity risk: ${allergy.allergen} → ${med.drugName}`,
            description: `Patient allergic to ${allergy.allergen} is prescribed ${med.drugName}, which may cause cross-reactive allergic response.`,
            evidence: [
              `Known allergy: ${allergy.allergen}`,
              `Cross-reactive drug: ${med.drugName}`,
              `Similar chemical structure within same drug class`,
            ],
            actionRequired:
              "Verify allergy status. Consider alternative if cross-reactivity confirmed.",
          });
        }
      }
    }
  }

  // Severe allergy alert (always show for awareness)
  if (severeAllergies.length > 0) {
    riskAlerts.push({
      id: uid(),
      level: "critical",
      category: "allergy",
      title: `${severeAllergies.length} Severe/Anaphylactic Allerg${severeAllergies.length > 1 ? "ies" : "y"} Recorded`,
      description: `Patient has severe allergies: ${severeAllergies.map((a) => a.allergen).join(", ")}. Ensure emergency protocols are ready.`,
      evidence: severeAllergies.map(
        (a) =>
          `${a.allergen} — ${a.reactionDescription || "Anaphylactic risk"}`,
      ),
      actionRequired:
        "Confirm anaphylaxis kit availability. Verify epinephrine auto-injector prescription.",
    });
  }

  // ─── 2. DRUG INTERACTION CHECKS ────────────────────────────────
  const medNames = payload.patient.activeMedications.map((m) => m.drugName);

  for (let i = 0; i < medNames.length; i++) {
    for (let j = i + 1; j < medNames.length; j++) {
      const key1 = `${medNames[i].toLowerCase()}+${medNames[j].toLowerCase()}`;
      const key2 = `${medNames[j].toLowerCase()}+${medNames[i].toLowerCase()}`;
      const interaction = KNOWN_INTERACTIONS[key1] || KNOWN_INTERACTIONS[key2];

      if (interaction) {
        drugInteractions.push(interaction);

        riskAlerts.push({
          id: uid(),
          level:
            interaction.severity === "major"
              ? "critical"
              : interaction.severity === "moderate"
                ? "moderate"
                : "low",
          category: "drug-interaction",
          title: `${interaction.severity.toUpperCase()} Interaction: ${interaction.drugA} + ${interaction.drugB}`,
          description: interaction.description,
          evidence: [
            `Drug A: ${interaction.drugA}`,
            `Drug B: ${interaction.drugB}`,
            `Severity: ${interaction.severity}`,
          ],
          actionRequired: interaction.recommendation,
        });
      }
    }
  }

  // ─── 3. POLYPHARMACY CHECK ─────────────────────────────────────
  if (payload.patient.activeMedications.length >= 5) {
    riskAlerts.push({
      id: uid(),
      level:
        payload.patient.activeMedications.length >= 8 ? "high" : "moderate",
      category: "polypharmacy",
      title: `Polypharmacy Warning: ${payload.patient.activeMedications.length} Active Medications`,
      description: `Patient is on ${payload.patient.activeMedications.length} concurrent medications. Increased risk of adverse drug reactions, non-adherence, and drug-drug interactions.`,
      evidence: payload.patient.activeMedications.map(
        (m) => `${m.drugName} ${m.dosage} ${m.frequency}`,
      ),
      actionRequired:
        "Review medication list for deprescribing opportunities. Simplify regimen where possible.",
    });
  }

  // ─── 4. CHRONIC CONDITION MONITORING ────────────────────────────
  const activeConditions = payload.patient.chronicConditions.filter(
    (c) => c.status === "active",
  );
  for (const condition of activeConditions) {
    // Check if condition-specific medications are present
    const conditionLower = condition.conditionName.toLowerCase();
    const hasRelevantMeds = payload.patient.activeMedications.some(
      (m) =>
        m.prescribedFor.toLowerCase().includes(conditionLower) ||
        conditionLower.includes(m.prescribedFor.toLowerCase()),
    );

    if (
      !hasRelevantMeds &&
      conditionLower !== "anxiety" &&
      conditionLower !== "depression"
    ) {
      riskAlerts.push({
        id: uid(),
        level: "moderate",
        category: "chronic-flare",
        title: `Unmedicated Active Condition: ${condition.conditionName}`,
        description: `Patient has active ${condition.conditionName} (diagnosed ${condition.diagnosedYear}) but no matching medication found in current regimen. ${condition.latestMetrics ? `Latest: ${condition.latestMetrics}.` : ""}`,
        evidence: [
          `Condition: ${condition.conditionName}`,
          `Status: Active since ${condition.diagnosedYear}`,
          condition.latestMetrics
            ? `Metrics: ${condition.latestMetrics}`
            : "No recent metrics",
        ],
        actionRequired:
          "Verify if condition is being managed non-pharmacologically or requires medication review.",
      });
    }

    // Check for worsening metrics
    if (condition.latestMetrics) {
      const metrics = condition.latestMetrics.toLowerCase();
      if (
        metrics.includes("hba1c") &&
        parseFloat(metrics.match(/hba1c\s*(\d+\.?\d*)/)?.[1] || "0") > 8
      ) {
        riskAlerts.push({
          id: uid(),
          level: "high",
          category: "chronic-flare",
          title: `${condition.conditionName}: Elevated HbA1c`,
          description: `Latest HbA1c indicates poor glycemic control. ${condition.latestMetrics}. Target is typically < 7% for most adults.`,
          evidence: [
            `Latest metrics: ${condition.latestMetrics}`,
            "Target: HbA1c < 7%",
          ],
          actionRequired:
            "Consider medication adjustment. Evaluate adherence, diet, and lifestyle factors.",
        });
      }

      if (metrics.includes("bp") || metrics.includes("blood pressure")) {
        const bpMatch = metrics.match(/(\d+)\s*\/\s*(\d+)/);
        if (bpMatch) {
          const sys = parseInt(bpMatch[1]);
          const dia = parseInt(bpMatch[2]);
          if (sys > 140 || dia > 90) {
            riskAlerts.push({
              id: uid(),
              level: "high",
              category: "chronic-flare",
              title: `${condition.conditionName}: Elevated Blood Pressure`,
              description: `Blood pressure ${sys}/${dia} mmHg is above target. Current management may need optimization.`,
              evidence: [
                `Current: ${sys}/${dia} mmHg`,
                "Target: < 130/80 mmHg for diabetic patients",
              ],
              actionRequired:
                "Review antihypertensive regimen. Consider dose adjustment or additional agent.",
            });
          }
        }
      }
    }
  }

  // ─── 5. VITAL SIGNS ASSESSMENT ──────────────────────────────────
  if (payload.currentVisit.vitals.bp) {
    const bp = parseBP(payload.currentVisit.vitals.bp);
    if (bp) {
      if (bp.systolic > 180 || bp.diastolic > 120) {
        riskAlerts.push({
          id: uid(),
          level: "critical",
          category: "vital-abnormal",
          title: "Hypertensive Emergency",
          description: `Blood pressure ${bp.systolic}/${bp.diastolic} mmHg indicates hypertensive crisis. Immediate assessment required.`,
          evidence: [
            `BP: ${bp.systolic}/${bp.diastolic} mmHg`,
            "Threshold: > 180/120 mmHg",
          ],
          actionRequired:
            "Initiate emergency BP management protocol. Assess for end-organ damage.",
        });
      } else if (bp.systolic > 140 || bp.diastolic > 90) {
        riskAlerts.push({
          id: uid(),
          level: "moderate",
          category: "vital-abnormal",
          title: "Elevated Blood Pressure",
          description: `Blood pressure ${bp.systolic}/${bp.diastolic} mmHg. Consider medication adjustment if persistent.`,
          evidence: [
            `BP: ${bp.systolic}/${bp.diastolic} mmHg`,
            "Target: < 130/80 mmHg",
          ],
          actionRequired:
            "Confirm with repeat measurement. Review current antihypertensive therapy.",
        });
      }
    }
  }

  if (payload.currentVisit.vitals.spo2) {
    const spo2 = parseInt(payload.currentVisit.vitals.spo2);
    if (spo2 < 90) {
      riskAlerts.push({
        id: uid(),
        level: "critical",
        category: "vital-abnormal",
        title: "Critical Oxygen Saturation",
        description: `SpO2 ${spo2}% indicates severe hypoxia. Immediate intervention required.`,
        evidence: [`SpO2: ${spo2}%`, "Critical threshold: < 90%"],
        actionRequired:
          "Administer supplemental oxygen. Evaluate respiratory status.",
      });
    } else if (spo2 < 94) {
      riskAlerts.push({
        id: uid(),
        level: "high",
        category: "vital-abnormal",
        title: "Low Oxygen Saturation",
        description: `SpO2 ${spo2}% is below normal. Monitor closely.`,
        evidence: [`SpO2: ${spo2}%`, "Normal: ≥ 95%"],
        actionRequired:
          "Assess respiratory function. Consider pulse oximetry monitoring.",
      });
    }
  }

  if (payload.currentVisit.vitals.temp) {
    const temp = parseFloat(payload.currentVisit.vitals.temp);
    if (temp > 39.5) {
      riskAlerts.push({
        id: uid(),
        level: "high",
        category: "vital-abnormal",
        title: "High Fever",
        description: `Temperature ${temp}°F indicates significant fever. Evaluate for infectious etiology.`,
        evidence: [`Temperature: ${temp}°F`, "High fever threshold: > 39.5°F"],
        actionRequired:
          "Investigate source of fever. Consider blood cultures and empiric antibiotics if sepsis suspected.",
      });
    }
  }

  // ─── 6. LAB RESULT ANALYSIS ────────────────────────────────────
  for (const report of payload.currentVisit.todayLabReports) {
    for (const [testName, value] of Object.entries(report.keyMetrics)) {
      const threshold = CRITICAL_THRESHOLDS[testName];
      const numericValue =
        typeof value === "number" ? value : parseFloat(String(value));

      let status: "normal" | "abnormal" | "critical" = report.status;
      let clinicalSignificance = "";

      if (threshold && !isNaN(numericValue)) {
        if (
          (threshold.critical_low && numericValue < threshold.critical_low) ||
          (threshold.critical_high && numericValue > threshold.critical_high)
        ) {
          status = "critical";
          clinicalSignificance = `CRITICAL: ${testName} value ${numericValue} ${threshold.unit} is outside safe range.`;
        } else if (report.status !== "normal") {
          clinicalSignificance = `${testName} is outside reference range. Monitor for clinical correlation.`;
        } else {
          clinicalSignificance = "Within normal limits.";
        }
      } else if (report.status === "critical") {
        clinicalSignificance = `Critical lab value detected. Requires immediate attention.`;
      } else if (report.status === "abnormal") {
        clinicalSignificance = `Abnormal result. Correlate with clinical presentation.`;
      } else {
        clinicalSignificance = "Within normal limits.";
      }

      labTrends.push({
        testName: report.testName,
        currentValue: `${numericValue} ${threshold?.unit || ""}`,
        referenceRange: threshold
          ? `${threshold.critical_low || "—"}–${threshold.critical_high || "—"} ${threshold.unit}`
          : "Lab-specific",
        status,
        clinicalSignificance,
      });

      if (status === "critical") {
        riskAlerts.push({
          id: uid(),
          level: "critical",
          category: "lab-critical",
          title: `Critical Lab: ${report.testName}`,
          description: clinicalSignificance,
          evidence: [
            `Test: ${report.testName}`,
            `Value: ${numericValue}`,
            `Status: ${status}`,
          ],
          actionRequired:
            "Urgent clinical review required. Consider repeat testing.",
        });
      }
    }
  }

  // ─── 7. CARE RECOMMENDATIONS ───────────────────────────────────
  let priorityCounter = 1;

  // Medication review recommendations
  if (drugInteractions.some((d) => d.severity === "major")) {
    careRecommendations.push({
      priority: priorityCounter++,
      category: "medication",
      title: "Address Major Drug Interactions",
      rationale:
        "Major drug-drug interactions detected that may cause significant adverse effects.",
      evidenceLevel: "strong",
    });
  }

  if (severeAllergies.length > 0) {
    careRecommendations.push({
      priority: priorityCounter++,
      category: "medication",
      title: "Verify Allergy Protocol Readiness",
      rationale: `Patient has ${severeAllergies.length} severe allergy/allergies. Confirm emergency preparedness.`,
      evidenceLevel: "strong",
    });
  }

  // Chronic condition management
  const uncontrolledDiabetes = activeConditions.some(
    (c) =>
      c.conditionName.toLowerCase().includes("diabetes") &&
      c.latestMetrics?.toLowerCase().includes("hba1c") &&
      parseFloat(c.latestMetrics.match(/hba1c\s*(\d+\.?\d*)/)?.[1] || "0") >
        7.5,
  );

  if (uncontrolledDiabetes) {
    careRecommendations.push({
      priority: priorityCounter++,
      category: "medication",
      title: "Optimize Diabetes Management",
      rationale:
        "HbA1c above target. Consider medication adjustment, dietary counseling, and increased monitoring frequency.",
      evidenceLevel: "strong",
    });
  }

  // Lab-related recommendations
  const hasCriticalLabs = riskAlerts.some((a) => a.category === "lab-critical");
  if (hasCriticalLabs) {
    careRecommendations.push({
      priority: priorityCounter++,
      category: "diagnostic",
      title: "Follow-up Diagnostic Testing",
      rationale:
        "Critical lab values detected. Recommend repeat testing and additional workup as clinically indicated.",
      evidenceLevel: "strong",
    });
  }

  // Polypharmacy
  if (payload.patient.activeMedications.length >= 5) {
    careRecommendations.push({
      priority: priorityCounter++,
      category: "medication",
      title: "Comprehensive Medication Review",
      rationale:
        "Patient is on multiple medications. Conduct thorough review for therapeutic duplication, appropriateness, and deprescribing opportunities.",
      evidenceLevel: "moderate",
    });
  }

  // Vaccination gaps
  const hasCovidVaccines = payload.patient.vaccinations.some((v) =>
    v.vaccineName.toLowerCase().includes("covid"),
  );
  if (!hasCovidVaccines && payload.patient.age > 50) {
    careRecommendations.push({
      priority: priorityCounter++,
      category: "monitoring",
      title: "COVID-19 Vaccination Status",
      rationale:
        "Patient over 50 with no recorded COVID-19 vaccination. Discuss vaccination benefits.",
      evidenceLevel: "moderate",
    });
  }

  // Lifestyle counseling
  if (
    activeConditions.some(
      (c) =>
        c.conditionName.toLowerCase().includes("diabetes") ||
        c.conditionName.toLowerCase().includes("hypertension"),
    )
  ) {
    careRecommendations.push({
      priority: priorityCounter++,
      category: "lifestyle",
      title: "Diet & Lifestyle Counseling Referral",
      rationale:
        "Patient with cardiometabolic conditions would benefit from structured lifestyle modification program.",
      evidenceLevel: "moderate",
    });
  }

  // Monitoring
  if (
    activeConditions.some(
      (c) =>
        c.conditionName.toLowerCase().includes("kidney") ||
        c.conditionName.toLowerCase().includes("renal"),
    )
  ) {
    careRecommendations.push({
      priority: priorityCounter++,
      category: "monitoring",
      title: "Renal Function Monitoring",
      rationale:
        "Chronic kidney disease requires regular renal function monitoring and medication dose adjustment.",
      evidenceLevel: "strong",
    });
  }

  // Sort care recommendations by priority
  careRecommendations.sort((a, b) => a.priority - b.priority);

  // ─── 8. GENERATE CLINICAL BRIEF ────────────────────────────────
  const clinicalBrief = generateClinicalBrief(payload, riskAlerts, labTrends);

  // ─── 9. CALCULATE RISK SCORE ───────────────────────────────────
  let riskScore = 0;
  for (const alert of riskAlerts) {
    riskScore += riskLevelScore(alert.level);
  }
  riskScore = Math.min(riskScore, 100);

  let overallRiskLevel: RiskLevel = "informational";
  if (riskScore >= 50) overallRiskLevel = "critical";
  else if (riskScore >= 30) overallRiskLevel = "high";
  else if (riskScore >= 15) overallRiskLevel = "moderate";
  else if (riskScore >= 5) overallRiskLevel = "low";

  // ─── 10. RETURN OUTPUT ─────────────────────────────────────────
  return {
    generatedAt: new Date().toISOString(),
    riskScore,
    riskLevel: overallRiskLevel,
    clinicalBrief,
    riskAlerts: riskAlerts.sort((a, b) => {
      const levelOrder: Record<RiskLevel, number> = {
        critical: 0,
        high: 1,
        moderate: 2,
        low: 3,
        informational: 4,
      };
      return levelOrder[a.level] - levelOrder[b.level];
    }),
    drugInteractions,
    labTrends,
    careRecommendations,
    polypharmacyWarning: payload.patient.activeMedications.length >= 5,
    allergyAlertCount: riskAlerts.filter((a) => a.category === "allergy")
      .length,
    criticalLabCount: riskAlerts.filter((a) => a.category === "lab-critical")
      .length,
  };
}

// ─── Clinical Brief Generator ─────────────────────────────────────
function generateClinicalBrief(
  payload: ConsultationPayload,
  riskAlerts: RiskAlert[],
  labTrends: LabTrend[],
): string {
  const p = payload.patient;
  const v = payload.currentVisit;

  const parts: string[] = [];

  // Demographics
  parts.push(
    `${p.age}-year-old ${p.gender.toLowerCase()} presenting with: "${v.chiefComplaint}."`,
  );

  // Active conditions
  const activeConditions = p.chronicConditions.filter(
    (c) => c.status === "active",
  );
  if (activeConditions.length > 0) {
    const conditionStr = activeConditions.map((c) => {
      const metrics = c.latestMetrics ? ` (${c.latestMetrics})` : "";
      return `${c.conditionName}${metrics}`;
    });
    parts.push(`Active comorbidities: ${conditionStr.join("; ")}.`);
  }

  // Current medications
  if (p.activeMedications.length > 0) {
    const medStr = p.activeMedications
      .map((m) => `${m.drugName} ${m.dosage} ${m.frequency}`)
      .join(", ");
    parts.push(`Current regimen: ${medStr}.`);
  }

  // Allergies
  if (p.allergies.length > 0) {
    const allergyStr = p.allergies
      .map((a) => `${a.allergen} (${a.severity})`)
      .join(", ");
    parts.push(`Allergies: ${allergyStr}.`);
  }

  // Critical findings
  const criticalAlerts = riskAlerts.filter((a) => a.level === "critical");
  if (criticalAlerts.length > 0) {
    const criticalStr = criticalAlerts.map((a) => a.title).join("; ");
    parts.push(`⚠️ Critical findings: ${criticalStr}.`);
  }

  // Lab highlights
  const abnormalLabs = labTrends.filter((t) => t.status !== "normal");
  if (abnormalLabs.length > 0) {
    const labStr = abnormalLabs
      .map((l) => `${l.testName}: ${l.currentValue} (${l.status})`)
      .join("; ");
    parts.push(`Abnormal labs: ${labStr}.`);
  }

  // Surgical history note
  if (p.surgeries.length > 0) {
    parts.push(
      `Prior surgeries: ${p.surgeries.map((s) => `${s.procedureName} (${s.yearOfProcedure})`).join(", ")}.`,
    );
  }

  return parts.join(" ");
}
