"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";

export default function MedicalDocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const saveMedicalDocument = useAppStore((state) => state.saveMedicalDocument);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a document first.");
      return;
    }

    setIsSaving(true);
    try {
      await saveMedicalDocument(file);
      alert("Medical document uploaded successfully!");
      setFile(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to save medical document.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-800">
        Medical Documents
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Upload prescriptions, lab reports, discharge summaries, or other
        medical records.
      </p>

      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="mt-4 block w-full rounded-lg border border-slate-300 p-3 text-sm"
      />

      {file && (
        <p className="mt-3 text-sm text-slate-600">
          Selected: <span className="font-medium">{file.name}</span>
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={isSaving}
        className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
      >
        {isSaving ? "Saving..." : "Save Medical Document"}
      </button>
    </div>
  );
}