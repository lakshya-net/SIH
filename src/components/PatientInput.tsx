"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";

export default function PatientInput() {
  const [symptoms, setSymptoms] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const saveHealthUpdate = useAppStore((state) => state.saveHealthUpdate);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">
          Patient Health Update
        </h1>

        <p className="mt-2 text-slate-500">
          Enter your current health information before your consultation.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label className="block font-medium text-slate-700">
              Current Symptoms
            </label>

            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Example: Headache, fever, dizziness..."
              className="mt-2 w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-teal-500"
              rows={4}
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700">
              Medical History / Additional Information
            </label>

            <textarea
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder="Enter any relevant medical information..."
              className="mt-2 w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-teal-500"
              rows={4}
            />
          </div>

          <button
            onClick={async () => {
              if (!symptoms.trim() && !medicalHistory.trim()) {
                alert("Please enter symptoms or medical history before saving.");
                return;
              }
              setIsSaving(true);
              try {
                await saveHealthUpdate({ symptoms, medicalHistory });
                alert("Health update saved successfully!");
                setSymptoms("");
                setMedicalHistory("");
              } catch (error) {
                alert(error instanceof Error ? error.message : "Unable to save health update.");
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving}
            className="w-full rounded-lg bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700"
          >
            {isSaving ? "Saving..." : "Save Health Update"}
          </button>
        </div>
      </div>
    </div>
  );
}