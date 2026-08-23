"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  Mic,
  MicOff,
  Plus,
  Trash2,
  Pen,
  CheckCircle2,
  Pill,
  FileText,
  Loader2,
  Volume2,
  Stethoscope,
} from "lucide-react";

interface Medication {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export default function DoctorPrescription() {
  const {
    patients,
    selectedPatientId,
    activeEncounter,
    addPrescription,
    prescriptions,
    clinicalNotes,
    setClinicalNotes,
    diagnosis,
    setDiagnosis,
    submitEncounter,
    encounterSubmitted,
  } = useAppStore();
  const { toast } = useToast();
  const patient =
    patients.find((p) => p.id === selectedPatientId) ?? patients[0];

  const [isDictating, setIsDictating] = useState(false);
  const [dictationText, setDictationText] = useState("");
  const [committing, setCommitting] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([
    { medicineName: "", dosage: "", frequency: "", duration: "" },
  ]);

  const simulateDictation = () => {
    setIsDictating(true);
    setDictationText("");
    const phrases = [
      "Paracetamol 650 milligrams TDS for 5 days,",
      "Metformin 500 milligrams BD,",
      "Amlodipine 5 milligrams OD continue.",
      "Diagnosis: Poorly controlled Type 2 Diabetes.",
    ];
    const fullText = phrases.join(" ");
    const words = fullText.split(" ");
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < words.length) {
        setDictationText((prev) => (prev ? prev + " " : "") + words[idx]);
        idx++;
      } else {
        clearInterval(interval);
        setIsDictating(false);
        // Auto-add medications from dictation
        setMedications([
          {
            medicineName: "Paracetamol",
            dosage: "650mg",
            frequency: "TDS",
            duration: "5 days",
          },
          {
            medicineName: "Metformin",
            dosage: "500mg",
            frequency: "BD",
            duration: "Continue",
          },
          {
            medicineName: "Amlodipine",
            dosage: "5mg",
            frequency: "OD",
            duration: "Continue",
          },
        ]);
        setDiagnosis("Poorly controlled Type 2 Diabetes with Hypertension");
      }
    }, 300);
    setTimeout(() => {
      clearInterval(interval);
      setIsDictating(false);
      if (idx < words.length) {
        setDictationText(fullText);
        setMedications([
          {
            medicineName: "Paracetamol",
            dosage: "650mg",
            frequency: "TDS",
            duration: "5 days",
          },
          {
            medicineName: "Metformin",
            dosage: "500mg",
            frequency: "BD",
            duration: "Continue",
          },
          {
            medicineName: "Amlodipine",
            dosage: "5mg",
            frequency: "OD",
            duration: "Continue",
          },
        ]);
        setDiagnosis("Poorly controlled Type 2 Diabetes with Hypertension");
      }
    }, 8000);
  };

  const addMedRow = () => {
    setMedications((prev) => [
      ...prev,
      { medicineName: "", dosage: "", frequency: "", duration: "" },
    ]);
  };

  const removeMedRow = (index: number) => {
    if (medications.length <= 1) return;
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMed = (index: number, field: keyof Medication, value: string) => {
    setMedications((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  };

  const handleCommit = () => {
    const validMeds = medications.filter((m) => m.medicineName.trim());
    if (validMeds.length === 0) {
      toast({
        title: "Add Medications",
        description: "Please add at least one medication.",
        variant: "destructive",
      });
      return;
    }
    setCommitting(true);
    setTimeout(() => {
      validMeds.forEach((med) => addPrescription(med));
      submitEncounter();
      setCommitting(false);
      toast({
        title: "Prescription Committed ✓",
        description:
          "Visit marked complete. Records updated in patient's lifetime health record.",
      });
    }, 2000);
  };

  if (encounterSubmitted) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center bg-background p-8">
        <div className="text-center space-y-6 max-w-md">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Visit Completed
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Prescription signed and committed to {patient.name}&apos;s
              lifetime health record.
            </p>
          </div>
          <div className="rounded-md border border-slate-300 bg-white p-4 text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Patient:</span>
              <span className="font-medium">{patient.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">HID:</span>
              <span className="font-mono text-xs">
                {patient.uniqueHealthId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Medications:</span>
              <span className="font-medium">
                {prescriptions.length} prescribed
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Start New Consultation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 space-y-6">
      {/* Patient Strip */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {patient.name}
                </h3>
                <div className="text-xs text-slate-400 font-mono">
                  {patient.uniqueHealthId}
                </div>
              </div>
            </div>
            {activeEncounter && (
              <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                Active Session
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Voice Dictation */}
      <Card className="border-cyan-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-cyan-600" />
            Voice Dictation
          </CardTitle>
          <CardDescription className="text-xs">
            Dictate prescriptions naturally (e.g., &quot;Paracetamol 650mg TDS
            for 5 days&quot;)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              className={`h-14 w-14 rounded-full shrink-0 ${
                isDictating
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-cyan-600 hover:bg-cyan-700"
              }`}
              onClick={
                isDictating ? () => setIsDictating(false) : simulateDictation
              }
            >
              {isDictating ? (
                <MicOff className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
            </Button>
            <div className="flex-1">
              <div
                className={`text-sm font-medium ${isDictating ? "text-red-500" : "text-cyan-600"}`}
              >
                {isDictating ? "Listening..." : "Tap to start dictation"}
              </div>
              {isDictating && (
                <div className="flex items-end gap-0.5 h-4 mt-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-cyan-400 rounded-full wave-bar"
                      style={{ height: "40%", animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          {dictationText && (
            <div className="rounded-sm border border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Mic className="h-3 w-3" />
                Transcription
              </div>
              {dictationText}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnosis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Pen className="h-4 w-4 text-emerald-600" />
            Diagnosis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Enter primary diagnosis..."
            className="text-sm"
          />
        </CardContent>
      </Card>

      {/* Medication Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Pill className="h-4 w-4 text-violet-600" />
            Medication Table
          </CardTitle>
          <CardDescription className="text-xs">
            Add, edit, or remove prescriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Header Row */}
          <div className="hidden sm:grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-400 uppercase">
            <div className="col-span-4">Medicine</div>
            <div className="col-span-2">Dosage</div>
            <div className="col-span-2">Frequency</div>
            <div className="col-span-3">Duration</div>
            <div className="col-span-1" />
          </div>

          {medications.map((med, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
            >
              <div className="sm:col-span-4">
                <Input
                  placeholder="Medicine name"
                  value={med.medicineName}
                  onChange={(e) => updateMed(i, "medicineName", e.target.value)}
                  className="text-sm h-9"
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  placeholder="e.g. 500mg"
                  value={med.dosage}
                  onChange={(e) => updateMed(i, "dosage", e.target.value)}
                  className="text-sm h-9"
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  placeholder="e.g. BD"
                  value={med.frequency}
                  onChange={(e) => updateMed(i, "frequency", e.target.value)}
                  className="text-sm h-9"
                />
              </div>
              <div className="sm:col-span-3">
                <Input
                  placeholder="e.g. 5 days"
                  value={med.duration}
                  onChange={(e) => updateMed(i, "duration", e.target.value)}
                  className="text-sm h-9"
                />
              </div>
              <div className="sm:col-span-1 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMedRow(i)}
                  disabled={medications.length <= 1}
                  className="h-9 w-9 p-0"
                >
                  <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={addMedRow}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Medication
          </Button>
        </CardContent>
      </Card>

      {/* Clinical Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-600" />
            Clinical Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            placeholder="Enter detailed clinical notes, observations, and follow-up instructions..."
            rows={4}
            className="text-sm"
          />
        </CardContent>
      </Card>

      {/* Commit Button */}
      <Button
        size="lg"
        className="w-full h-14 text-base bg-emerald-600 hover:bg-emerald-700"
        onClick={handleCommit}
        disabled={committing}
      >
        {committing ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Committing to Lifetime Record...
          </span>
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Approve, Sign &amp; Commit to Lifetime Record
          </>
        )}
      </Button>
    </div>
  );
}
