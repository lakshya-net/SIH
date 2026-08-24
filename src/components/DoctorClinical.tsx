"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { runTriageEngine } from "@/lib/triageEngine";
import { ClinicalSummaryOutput, type ConsultationPayload } from "@/types/consultation";
import type { LabReport, Patient, Prescription, Vitals } from "@/lib/mockData";
import ClinicalSummaryPanel from "@/components/ClinicalSummaryPanel";
import {
  Brain,
  Calendar,
  FlaskConical,
  Pill,
  FileText,
  ClipboardList,
  Stethoscope,
  Shield,
  Activity,
  Heart,
  ChevronRight,
  Loader2,
  Sparkles,
  Users,
  UserCheck,
} from "lucide-react";

// ΓöÇΓöÇΓöÇ ConsultationPayload built from live application state ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// Builds the triage-engine input from LIVE data only:
//  - patient demographics/allergies/chronic conditions: store (hydrated from
//    the Neon database via /api/state -> loadPersistedState)
//  - vitals: patient's self-reported vitals (persisted via /api/self-report)
//  - lab reports: persisted reports filtered to this patient (/api/labs)
//  - medications: prescriptions committed via /api/prescriptions/commit
// No hardcoded demo patient is used anywhere in this flow.
function buildConsultationPayload(
  patient: Patient,
  selfReport: Vitals | null,
  chiefComplaint: string,
  patientLabs: LabReport[],
  committedPrescriptions: Prescription[]
): ConsultationPayload {
  return {
    patient: {
      healthId: patient.uniqueHealthId,
      fullName: patient.name,
      age: patient.age,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      chronicConditions: patient.chronicConditions.map((c) => ({
        conditionName: c,
        diagnosedYear: "not recorded",
        status: "active",
      })),
      allergies: patient.allergies.map((a) => ({
        allergen: a,
        allergyType: "unspecified",
        severity: "per record",
      })),
      surgeries: [],
      vaccinations: [],
      activeMedications: committedPrescriptions.map((rx) => ({
        drugName: rx.medicineName || "[unclear]",
        dosage: rx.dosage || "not specified",
        frequency: rx.frequency || "not specified",
        prescribedFor: rx.duration
          ? `duration: ${rx.duration}`
          : "indication not recorded",
      })),
    },
    currentVisit: {
      chiefComplaint,
      vitals: selfReport
        ? {
            bp: `${selfReport.bloodPressureSystolic}/${selfReport.bloodPressureDiastolic}`,
            temp:
              selfReport.temperature !== undefined
                ? `${selfReport.temperature}`
                : undefined,
          }
        : {},
      todayLabReports: patientLabs.map((report) => {
        let hasCritical = false;
        let hasAbnormal = false;
        const keyMetrics: Record<string, string> = {};
        for (const result of report.results) {
          if (result.status === "Critical") hasCritical = true;
          else if (result.status !== "Normal") hasAbnormal = true;
          keyMetrics[`${result.testName} (${result.status})`] =
            `${result.value}${result.unit ? ` ${result.unit}` : ""}${
              result.referenceRange ? ` [ref: ${result.referenceRange}]` : ""
            }`;
        }
        return {
          testName: report.testName,
          keyMetrics,
          status: hasCritical
            ? ("critical" as const)
            : hasAbnormal
            ? ("abnormal" as const)
            : ("normal" as const),
        };
      }),
    },
  };
}
export default function DoctorClinical() {
  const {
    patients,
    selectedPatientId,
    setSelectedPatientId,
    timeline,
    labReports,
    encounters,
    selfReportVitals,
    prescriptions,
    healthUpdates,
    medicalDocuments,
  } = useAppStore();
  const patient = patients.find((p) => p.id === selectedPatientId) ?? patients[0];
  const patientTimeline = timeline.filter((t) => t.patientId === patient.id).slice(0, 6);
  const patientLabReports = labReports.filter((l) => l.patientId === patient.id);
  const patientHealthUpdates = healthUpdates.filter((update) => update.patientId === patient.id);
  const patientDocuments = medicalDocuments.filter((document) => document.patientId === patient.id);
  const activeEncounter = encounters.find(
    (e) => e.patientId === patient.id && e.status === "Active"
  );

  const [triageOutput, setTriageOutput] = useState<ClinicalSummaryOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [chiefComplaint, setChiefComplaint] = useState(
    activeEncounter?.diagnosis || "Follow-up for chronic conditions"
  );

  // Run the triage engine on LIVE state: the store is hydrated from the Neon
  // database (/api/state), vitals come from the patient self-report, labs from
  // persisted lab reports, and medications from prescriptions committed via
  // /api/prescriptions/commit. The old hardcoded mock payload is gone.
  useEffect(() => {
    setIsAnalyzing(true);
    const patientSelfReport =
      selfReportVitals && selectedPatientId === patient.id ? selfReportVitals : null;
    const payload = buildConsultationPayload(
      patient,
      patientSelfReport,
      chiefComplaint,
      patientLabReports,
      prescriptions
    );
    // Brief delay preserves the existing "AI analyzing" UX
    const timer = setTimeout(() => {
      const output = runTriageEngine(payload);
      setTriageOutput(output);
      setIsAnalyzing(false);
    }, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.id, selfReportVitals, prescriptions]);

  const handlePatientSwitch = useCallback((newPatientId: string) => {
    if (newPatientId === patient.id) return;
    setSelectedPatientId(newPatientId);
  }, [patient.id, setSelectedPatientId]);

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "Visit":
        return <Stethoscope className="h-3.5 w-3.5" />;
      case "Lab":
        return <FlaskConical className="h-3.5 w-3.5" />;
      case "Prescription":
        return <Pill className="h-3.5 w-3.5" />;
      case "Self-Report":
        return <ClipboardList className="h-3.5 w-3.5" />;
      default:
        return <FileText className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 sm:p-6 space-y-6">
      {/* ΓöÇΓöÇΓöÇ Patient Selector + Header ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">{patient.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>
                    {patient.gender}, {patient.age} yrs
                  </span>
                  <span>|</span>
                  <span className="font-mono">{patient.uniqueHealthId}</span>
                  <span>|</span>
                  <span>{patient.bloodGroup}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeEncounter && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                  <Activity className="mr-1 h-3 w-3" />
                  Active Session
                </Badge>
              )}
              <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700 text-xs">
                <Brain className="mr-1 h-3 w-3" />
                AI Triage Active
              </Badge>
            </div>
          </div>

          {/* Patient Switcher */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[10px] font-medium text-slate-400 uppercase">Switch Patient:</span>
            {patients.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePatientSwitch(p.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  p.id === patient.id
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {p.id === patient.id && <UserCheck className="h-3 w-3" />}
                {p.name}
                <span className="font-mono text-[9px] opacity-60">({p.id})</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ΓöÇΓöÇΓöÇ Chief Complaint Input ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-cyan-600" />
            Chief Complaint
          </CardTitle>
          <CardDescription className="text-xs">
            Patient&apos;s primary reason for today&apos;s visit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            placeholder="Enter chief complaint..."
            rows={2}
            className="text-sm"
          />
        </CardContent>
      </Card>

      {/* ΓöÇΓöÇΓöÇ AI Clinical Summary ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      {isAnalyzing ? (
        <Card className="border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-emerald-50">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100">
                <Loader2 className="h-6 w-6 text-cyan-600 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-cyan-800">
                  AI Triage Engine Processing...
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Analyzing patient history, medications, lab results, and generating clinical summary
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-cyan-600">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Analyzing drug interactions, risk factors, and care gaps
              </div>
            </div>
          </CardContent>
        </Card>
      ) : triageOutput ? (
        <ClinicalSummaryPanel
          output={triageOutput}
          patientName={patient.name}
          healthId={patient.uniqueHealthId}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-emerald-600" />
              Patient Health Updates
            </CardTitle>
            <CardDescription className="text-xs">
              Symptoms and medical history submitted by the patient
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {patientHealthUpdates.length > 0 ? (
              patientHealthUpdates.slice(0, 3).map((update) => (
                <div key={update.id} className="rounded-lg border border-emerald-100 bg-white p-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Current Symptoms</p>
                    <p className="mt-1 text-xs text-slate-600">{update.symptoms || "None reported"}</p>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-700">Medical History / Additional Information</p>
                    <p className="mt-1 text-xs text-slate-600">{update.medicalHistory || "None provided"}</p>
                  </div>
                  <p className="mt-3 text-[10px] text-slate-400">
                    Submitted: {new Date(update.updatedAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">No patient health updates available.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-violet-200 bg-violet-50/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-violet-600" />
              Medical Documents
            </CardTitle>
            <CardDescription className="text-xs">
              Documents associated with this patient
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {patientDocuments.length > 0 ? (
              patientDocuments.slice(0, 5).map((document) => (
                <div key={document.id} className="flex items-center justify-between rounded-lg border border-violet-100 bg-white p-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-700">{document.fileName}</p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {document.mimeType || "Unknown type"}
                      {document.sizeBytes !== null ? ` • ${(document.sizeBytes / 1024).toFixed(1)} KB` : ""}
                    </p>
                  </div>
                  <span className="ml-3 shrink-0 text-[10px] text-slate-400">
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">No medical documents available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* ΓöÇΓöÇΓöÇ Split Screen: Timeline + Lab Results ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel: Timeline */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-cyan-600" />
                Patient Lifetime Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-200" />
                <div className="space-y-3">
                  {patientTimeline.map((entry) => (
                    <div key={entry.id} className="relative flex gap-3">
                      <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500">
                        {getTimelineIcon(entry.type)}
                      </div>
                      <div className="flex-1 rounded-md border border-slate-100 bg-white p-2.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-semibold text-slate-700">
                              {entry.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {entry.description}
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-300 shrink-0 ml-2">
                            {entry.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Lab Results */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-violet-600" />
                Today&apos;s Lab Results
              </CardTitle>
              <CardDescription className="text-xs">
                {patientLabReports.length} report(s) available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {patientLabReports.map((report) => (
                <div key={report.id} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-slate-700">{report.testName}</h4>
                    <span className="text-[10px] text-slate-400">{report.date}</span>
                  </div>
                  <div className="space-y-1.5">
                    {report.results.map((result) => (
                      <div
                        key={result.testName}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-500">{result.testName}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-medium ${
                              result.status === "Normal"
                                ? "text-slate-700"
                                : result.status === "Critical"
                                ? "text-red-600 font-bold"
                                : result.status === "High"
                                ? "text-red-500"
                                : "text-amber-500"
                            }`}
                          >
                            {result.value} {result.unit}
                          </span>
                          {result.status !== "Normal" && (
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1 py-0 ${
                                result.status === "Critical"
                                  ? "border-red-400 bg-red-50 text-red-700"
                                  : result.status === "High"
                                  ? "border-red-300 bg-red-50 text-red-600"
                                  : "border-amber-300 bg-amber-50 text-amber-600"
                              }`}
                            >
                              {result.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {patientLabReports.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No lab results available for this patient.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Allergies & Conditions Quick Reference */}
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-800">Quick Reference</span>
              </div>
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-500">Allergies:</span>{" "}
                  {patient.allergies.length > 0 ? (
                    patient.allergies.map((a) => (
                      <Badge
                        key={a}
                        variant="outline"
                        className="mr-1 border-red-300 bg-red-50 text-red-600 text-[10px]"
                      >
                        {a}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-slate-400">None recorded</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-500">Chronic:</span>{" "}
                  {patient.chronicConditions.map((c) => (
                    <Badge
                      key={c}
                      variant="outline"
                      className="mr-1 border-amber-300 bg-amber-50 text-amber-600 text-[10px]"
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA to Prescription */}
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-800">Ready to prescribe?</div>
                  <div className="text-[11px] text-emerald-600 mt-0.5">
                    Continue to the prescription builder
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
