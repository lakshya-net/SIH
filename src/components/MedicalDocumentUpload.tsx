"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

export default function MedicalDocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const saveMedicalDocument = useAppStore((state) => state.saveMedicalDocument);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select a document first.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      await saveMedicalDocument(file);
      toast({ title: "Document Uploaded ✓", description: `${file.name} has been saved to your medical records.` });
      setFile(null);
    } catch (error) {
      toast({ title: "Upload Failed", description: error instanceof Error ? error.message : "Unable to save medical document.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full rounded-lg border border-slate-300 p-3 text-sm"
      />

      {file && (
        <p className="text-sm text-slate-600">
          Selected: <span className="font-medium">{file.name}</span>
          <span className="ml-2 text-xs text-slate-400">({(file.size / 1024).toFixed(0)} KB)</span>
        </p>
      )}

      <Button
        onClick={handleUpload}
        disabled={isSaving || !file}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        <Upload className="mr-2 h-4 w-4" />
        {isSaving ? "Uploading..." : "Upload Document"}
      </Button>
    </div>
  );
}