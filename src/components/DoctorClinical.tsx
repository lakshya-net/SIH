"use client";
import { useEffect, useState, useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { runTriageEngine } from "@/lib/triageEngine";
import { ClinicalSummaryOutput } from "@/types/consultation";
import ClinicalSummaryPanel from "@/components/ClinicalSummaryPanel";
import {
  Brain,
  AlertTriangle,
  Calendar,
  FlaskConical,
  Pill,
  FileText,
  ClipboardList,
  Stethoscope,
  CheckCircle2,
  Shield,
  Activity,
  Heart,
  ChevronRight,
  Loader2,
  Sparkles,
  RefreshCw,
  Users,
  UserCheck,
  Download,
} from "lucide-react";

// ─── Mock ConsultationPayload for demonstration ───────────────────
function buildMockPayload(
  patientId: string,
  vitals: { bp?: string; pulse?: string; temp?: string; spo2?: string },
  chiefComplaint: string
): import("@/types/consultation").ConsultationPayload {
  // Patient P001 — Rajesh Kumar
  const patients: Record<string, any> = {
    P001: {
      healthId: "HID-8842-X",
      fullName: "Rajesh Kumar",
      age: 58,
      gender: "Male",
      bloodGroup: "B+",
      chronicConditions: [
        { conditionName: "Type 2 Diabetes", diagnosedYear: "2020", status: "active", latestMetrics: "HbA1c 8.2%, Fasting Glucose 145 mg/dL" },
        { conditionName: "Hypertension", diagnosedYear: "2020", status: "active", latestMetrics: "BP 148/92 mmHg" },
      ],
      allergies: [
        { allergen: "Penicillin", allergyType: "drug", severity: "severe / anaphylactic", reactionDescription: "Anaphylaxis, throat swelling" },
        { allergen: "Sulfa drugs", allergyType: "drug", severity: "moderate", reactionDescription: "Skin rash, urticaria" },
      ],
      surgeries: [
        { procedureName: "Appendectomy", yearOfProcedure: "2005", complicationsOrNotes: "Laparoscopic, uneventful recovery" },
      ],
      vaccinations: [
        { vaccineName: "COVID-19 (Covishield)", doseNumber: "Booster", administeredDate: "2023-01-15" },
        { vaccineName: "Tetanus (Td/Tdap)", doseNumber: "Dose 1", administeredDate: "2022-06-10" },
      ],
      activeMedications: [
        { drugName: "Metformin", dosage: "500mg", frequency: "BD", prescribedFor: "Type 2 Diabetes" },
        { drugName: "Amlodipine", dosage: "5mg", frequency: "OD", prescribedFor: "Hypertension" },
        { drugName: "Atorvastatin", dosage: "10mg", frequency: "OD", prescribedFor: "Dyslipidemia" },
        { drugName: "Aspirin", dosage: "75mg", frequency: "OD", prescribedFor: "Cardiovascular protection" },
      ],
    },
    P002: {
      healthId: "HID-3156-K",
      fullName: "Sunita Devi",
      age: 42,
      gender: "Female",
      bloodGroup: "O+",
      chronicConditions: [
        { conditionName: "Asthma", diagnosedYear: "2015", status: "managed", latestMetrics: "FEV1 78% predicted" },
      ],
      allergies: [
        { allergen: "Dust Mites", allergyType: "environmental", severity: "moderate", reactionDescription: "Wheezing, nasal congestion" },
      ],
      surgeries: [],
      vaccinations: [
        { vaccineName: "COVID-19 (Covaxin)", doseNumber: "Dose 2", administeredDate: "2022-03-20" },
      ],
      activeMedications: [
        { drugName: "Salbutamol Inhaler", dosage: "100mcg", frequency: "As needed (PRN)", prescribedFor: "Asthma" },
        { drugName: "Cetirizine", dosage: "10mg", frequency: "OD", prescribedFor: "Allergic rhinitis" },
      ],
    },
  };

  const p = patients[patientId] || patients["P001"];

  return {
    patient: p,
    currentVisit: {
      chiefComplaint,
      vitals,
      todayLabReports: [
        {
          testName: "Comprehensive Metabolic Panel",
          keyMetrics: {
            "Glucose (Fasting)": 145,
            "HbA1c": 8.2,
            "Total Cholesterol": 228,
            "HDL Cholesterol": 38,
            "LDL Cholesterol": 152,
            "Creatinine": 1.1,
            "BUN": 18,
          },
          status: "abnormal" as const,
        },
        {
          testName: "CBC (Complete Blood Count)",
          keyMetrics: {
            "Hemoglobin": 13.2,
            "WBC Count": 7800,
            "Platelet Count": 245000,
            "RBC Count": 4.5,
          },
          status: "abnormal" as const,
        },
      ],
    },
  };
}
export default function DoctorClinical() {
  const { patients, selectedPatientId, setSelectedPatientId, timeline, labReports, encounters } = useAppStore();
  const patient = patients.find((p) => p.id === selectedPatientId) ?? patients[0];
  const patientTimeline = timeline.filter((t) => t.patientId === patient.id).slice(0, 6);
  const patientLabReports = labReports.filter((l) => l.patientId === patient.id);
  const activeEncounter = encounters.find(
    (e) => e.patientId === patient.id && e.status === "Active"
  );

  const [triageOutput, setTriageOutput] = useState<ClinicalSummaryOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [chiefComplaint, setChiefComplaint] = useState(
    activeEncounter?.diagnosis || "Follow-up for chronic conditions"
  );
  const [analyzingPatientId, setAnalyzingPatientId] = useState<string | null>(null);

  // Run triage engine when patient changes
  useEffect(() => {
    setIsAnalyzing(true);
    setAnalyzingPatientId(patient.id);
    const payload = buildMockPayload(
      patient.id,
      {
        bp: "148/92",
        pulse: "82",
        temp: "98.4",
        spo2: "96",
      },
      chiefComplaint
    );
    // Simulate AI processing delay
    const timer = setTimeout(() => {
      const output = runTriageEngine(payload);
      setTriageOutput(output);
      setIsAnalyzing(false);
      setAnalyzingPatientId(null);
    }, 1200);
    return () => clearTimeout(timer);
  }, [patient.id]);

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
      {/* ─── Patient Selector + Header ────────────────────────────── */}
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

      {/* ─── Chief Complaint Input ───────────────────────────────── */}
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

      {/* ─── AI Clinical Summary ─────────────────────────────────── */}
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

      <Separator />

      {/* ─── Split Screen: Timeline + Lab Results ────────────────── */}
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

