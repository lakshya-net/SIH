"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

export default function PatientInput() {
  const [symptoms, setSymptoms] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const saveHealthUpdate = useAppStore((state) => state.saveHealthUpdate);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Current Symptoms
        </label>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Example: Headache, fever, dizziness..."
          className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-teal-500"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Medical History / Additional Information
        </label>
        <textarea
          value={medicalHistory}
          onChange={(e) => setMedicalHistory(e.target.value)}
          placeholder="Enter any relevant medical information..."
          className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-teal-500"
          rows={4}
        />
      </div>        <Button
        onClick={async () => {
          if (!symptoms.trim() && !medicalHistory.trim()) {
            toast({ title: "Nothing to save", description: "Please enter symptoms or medical history.", variant: "destructive" });
            return;
          }
          setIsSaving(true);
          try {
            await saveHealthUpdate({ symptoms, medicalHistory });
            toast({ title: "Health Update Saved ✓", description: "Your symptoms and medical history have been recorded." });
            setSymptoms("");
            setMedicalHistory("");
          } catch (error) {
            toast({ title: "Error", description: error instanceof Error ? error.message : "Unable to save health update.", variant: "destructive" });
          } finally {
            setIsSaving(false);
          }
        }}
        disabled={isSaving}
        className="w-full bg-teal-600 hover:bg-teal-700"
      >
        {isSaving ? "Saving..." : "Save Health Update"}
      </Button>
    </div>
  );
}