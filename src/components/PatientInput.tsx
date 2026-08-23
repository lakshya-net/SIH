"use client";

import { useEffect, useState } from "react";

export default function PatientInput() {
  const [symptoms, setSymptoms] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  useEffect(() => {
  const savedUpdate = localStorage.getItem("patientHealthUpdate");

  if (savedUpdate) {
    const data = JSON.parse(savedUpdate);

    setSymptoms(data.symptoms || "");
    setMedicalHistory(data.medicalHistory || "");
  }
}, []);

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
            onClick={() => {
  if (!symptoms.trim() && !medicalHistory.trim()) {
    alert("Please enter symptoms or medical history before saving.");
    return;
  }

  localStorage.setItem(
    "patientHealthUpdate",
    JSON.stringify({
      symptoms,
      medicalHistory,
      updatedAt: new Date().toLocaleString(),
    })
  );

  alert("Health update saved successfully!");

  setSymptoms("");
  setMedicalHistory("");
}}
            className="w-full rounded-lg bg-teal-600 px-4 py-3 font-semibold text-white hover:bg-teal-700"
          >
            Save Health Update
          </button>
        </div>
      </div>
    </div>
  );
}