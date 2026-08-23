"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import type { SummaryInput, SummaryOutput } from "@/lib/aiTypes";
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
} from "lucide-react";

export default function DoctorClinical() {
  const { patients, selectedPatientId, timeline, labReports, encounters, selfReportVitals, prescriptions, ocrText } = useAppStore();
  const patient = patients.find((p) => p.id === selectedPatientId) ?? patients[0];
  const patientTimeline = timeline.filter((t) => t.patientId === patient.id).slice(0, 6);
  const patientFullTimeline = timeline.filter((t) => t.patientId === patient.id);
  const patientLabReports = labReports.filter((l) => l.patientId === patient.id);
  const activeEncounter = encounters.find((e) => e.patientId === patient.id && e.status === "Active");

  const [generatedSummary, setGeneratedSummary] = useState<SummaryOutput & { patientId: string } | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  // Only show a generated summary if it belongs to the currently selected patient.
  const displaySummary =
    generatedSummary && generatedSummary.patientId === patient.id ? generatedSummary : null;

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    setSummaryError("");
    try {
      const payload: SummaryInput = {
        patient,
        selfReportVitals,
        prescriptionText: ocrText?.trim() ? ocrText : null,
        prescriptions: prescriptions.length > 0 ? prescriptions : null,
        labReports: patientLabReports.length > 0 ? patientLabReports : null,
        activeEncounter,
        timeline: patientFullTimeline.length > 0 ? patientFullTimeline : null,
      };
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSummaryError(data?.error || "Summarization failed. Please try again.");
        return;
      }
      setGeneratedSummary({
        patientId: patient.id,
        clinicalBrief: typeof data.clinicalBrief === "string" ? data.clinicalBrief : "",
        riskBadges: Array.isArray(data.riskBadges) ? data.riskBadges : [],
        focusAreas: Array.isArray(data.focusAreas) ? data.focusAreas : [],
      });
      if (!data.clinicalBrief) {
        setSummaryError("The summary came back empty. Please try again.");
      }
    } catch {
      setSummaryError("Could not reach the summarization service. Please try again.");
    } finally {
      setGeneratingSummary(false);
    }
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "Visit": return <Stethoscope className="h-3.5 w-3.5" />;
      case "Lab": return <FlaskConical className="h-3.5 w-3.5" />;
      case "Prescription": return <Pill className="h-3.5 w-3.5" />;
      case "Self-Report": return <ClipboardList className="h-3.5 w-3.5" />;
      default: return <FileText className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 sm:p-6">
      {/* AI Summary Banner */}
      <Card className="mb-6 border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-emerald-50">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white">
              <Brain className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h2 className="text-sm font-bold text-cyan-800">AI Pre-Consultation Summary</h2>
                <Badge variant="outline" className="border-cyan-300 bg-cyan-50 text-cyan-700 text-[10px]">
                  AI-generated
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                  className="h-7 text-xs gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  {generatingSummary ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Activity className="h-3 w-3" />
                  )}
                  {generatingSummary ? "Generating..." : "Generate AI Summary"}
                </Button>
              </div>

              {summaryError && (
                <div className="mt-1 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {summaryError}
                </div>
              )}

              {generatingSummary ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Building summary from history, reports, vitals and prescription...
                </div>
              ) : displaySummary ? (
                <>
                  <p className="text-sm text-slate-600 leading-relaxed">{displaySummary.clinicalBrief}</p>

                  {displaySummary.riskBadges.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {displaySummary.riskBadges.map((badge) => (
                        <Badge
                          key={badge.label}
                          variant="outline"
                          className={`text-xs ${
                            badge.color === "red"
                              ? "border-red-300 bg-red-50 text-red-700"
                              : "border-amber-300 bg-amber-50 text-amber-700"
                          }`}
                        >
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          {badge.label}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {displaySummary.focusAreas.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-slate-500 mb-1.5">Key Focus Areas:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {displaySummary.focusAreas.map((area, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                            {area}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  Generate an AI pre-consultation summary from the patient&apos;s history, reports, vitals and prescription.
                </p>
              )}

              <p className="mt-2 text-[10px] text-slate-400 italic">
                AI-generated for pre-consultation reference only — not a diagnosis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel: Timeline + Lab Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Patient Info Strip */}
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{patient.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{patient.gender}, {patient.age} yrs</span>
                      <span>|</span>
                      <span className="font-mono">{patient.uniqueHealthId}</span>
                      <span>|</span>
                      <span>{patient.bloodGroup}</span>
                    </div>
                  </div>
                </div>
                {activeEncounter && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                    <Activity className="mr-1 h-3 w-3" />
                    Active Session
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
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
                            <h4 className="text-xs font-semibold text-slate-700">{entry.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">{entry.description}</p>
                          </div>
                          <span className="text-[10px] text-slate-300 shrink-0 ml-2">{entry.date}</span>
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
                      <div key={result.testName} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{result.testName}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-medium ${
                            result.status === "Normal"
                              ? "text-slate-700"
                              : result.status === "Critical"
                              ? "text-red-600 font-bold"
                              : result.status === "High"
                              ? "text-red-500"
                              : "text-amber-500"
                          }`}>
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
                      <Badge key={a} variant="outline" className="mr-1 border-red-300 bg-red-50 text-red-600 text-[10px]">{a}</Badge>
                    ))
                  ) : (
                    <span className="text-slate-400">None recorded</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-500">Chronic:</span>{" "}
                  {patient.chronicConditions.map((c) => (
                    <Badge key={c} variant="outline" className="mr-1 border-amber-300 bg-amber-50 text-amber-600 text-[10px]">{c}</Badge>
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
                  <div className="text-[11px] text-emerald-600 mt-0.5">Continue to the prescription builder</div>
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
