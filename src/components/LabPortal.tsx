"use client";

import { useState, useRef } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Users,
  FlaskConical,
  Upload,
  Send,
  Clock,
  AlertTriangle,
  FileImage,
  X,
  Activity,
  Play,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

const testTypes = [
  {
    name: "CBC (Complete Blood Count)",
    parameters: [
      { name: "Hemoglobin", unit: "g/dL", refRange: "13.5-17.5" },
      { name: "WBC Count", unit: "/uL", refRange: "4000-11000" },
      { name: "Platelet Count", unit: "/uL", refRange: "150000-400000" },
      { name: "RBC Count", unit: "million/uL", refRange: "4.5-5.5" },
    ],
  },
  {
    name: "Lipid Panel",
    parameters: [
      { name: "Total Cholesterol", unit: "mg/dL", refRange: "< 200" },
      { name: "HDL Cholesterol", unit: "mg/dL", refRange: "> 40" },
      { name: "LDL Cholesterol", unit: "mg/dL", refRange: "< 100" },
      { name: "Triglycerides", unit: "mg/dL", refRange: "< 150" },
    ],
  },
  {
    name: "Blood Sugar (Fasting)",
    parameters: [
      { name: "Glucose", unit: "mg/dL", refRange: "70-100" },
      { name: "HbA1c", unit: "%", refRange: "< 5.7" },
    ],
  },
  {
    name: "X-Ray",
    parameters: [{ name: "Finding", unit: "text", refRange: "N/A" }],
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "Waiting":
      return "bg-amber-100 text-amber-700 border-amber-300";
    case "In Progress":
      return "bg-cyan-100 text-cyan-700 border-cyan-300";
    case "Completed":
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    default:
      return "bg-slate-100 text-slate-700 border-slate-300";
  }
}

function getResultStatus(
  value: number,
  refRange: string,
): "Normal" | "High" | "Low" | "Critical" {
  const cleaned = refRange.replace(/[<>\s]/g, "");
  if (cleaned === "N/A" || cleaned === "text") return "Normal";
  if (refRange.startsWith("<")) {
    const max = parseFloat(refRange.replace(/[<\s]/g, ""));
    if (value >= max * 1.2) return "Critical";
    if (value >= max) return "High";
  } else if (refRange.startsWith(">")) {
    const min = parseFloat(refRange.replace(/[>\s]/g, ""));
    if (value < min * 0.7) return "Critical";
    if (value < min) return "Low";
  } else if (refRange.includes("-")) {
    const [min, max] = refRange.split("-").map(Number);
    if (value < min) return value < min * 0.7 ? "Critical" : "Low";
    if (value > max) return value > max * 1.2 ? "Critical" : "High";
  }
  return "Normal";
}

function getStatusBadge(status: string) {
  switch (status) {
    case "High":
      return (
        <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
          High
        </Badge>
      );
    case "Low":
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
          Low
        </Badge>
      );
    case "Critical":
      return <Badge className="bg-red-600 text-white text-xs">Critical</Badge>;
    default:
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
          Normal
        </Badge>
      );
  }
}

export default function LabPortal() {
  const {
    labQueue,
    selectedPatientId,
    setSelectedPatientId,
    updateLabQueueStatus,
  } = useAppStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  const [parameterValues, setParameterValues] = useState<
    Record<string, string>
  >({});
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; size: string; preview: string }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);

  const filteredQueue = labQueue.filter(
    (q) =>
      q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.hid.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const currentTest = testTypes.find((t) => t.name === selectedTest);
  const waitingCount = labQueue.filter(
    (item) => item.status === "Waiting",
  ).length;
  const inProgressCount = labQueue.filter(
    (item) => item.status === "In Progress",
  ).length;
  const completedCount = labQueue.filter(
    (item) => item.status === "Completed",
  ).length;

  const handleQueueStatus = (patientId: string, status: string) => {
    updateLabQueueStatus(patientId, status);
    toast({
      title: "Queue Updated",
      description: `Patient moved to ${status}.`,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).map((f) => ({
      name: f.name,
      size: (f.size / 1024).toFixed(1) + " KB",
      preview: URL.createObjectURL(f),
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    toast({
      title: "Files Uploaded",
      description: `${files.length} file(s) ready for submission.`,
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!selectedTest) {
      toast({ title: "Select Test Type", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: "Results Submitted ✓",
        description: "Lab results sent to active doctor session.",
      });
      setSelectedTest("");
      setParameterValues({});
      setUploadedFiles([]);
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="queue" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Active Queue
          </TabsTrigger>
          <TabsTrigger value="test-entry" className="gap-1.5">
            <FlaskConical className="h-3.5 w-3.5" />
            Test Entry
          </TabsTrigger>
        </TabsList>

        {/* Queue Tab */}
        <TabsContent value="queue" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-600" />
                Active Patient Queue
              </CardTitle>
              <CardDescription>
                Search patients by name or Unique Health ID
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-3 gap-2">
                {[
                  {
                    label: "Waiting",
                    value: waitingCount,
                    tone: "border-amber-300 bg-amber-50 text-amber-800",
                  },
                  {
                    label: "In Progress",
                    value: inProgressCount,
                    tone: "border-cyan-300 bg-cyan-50 text-cyan-800",
                  },
                  {
                    label: "Completed",
                    value: completedCount,
                    tone: "border-emerald-300 bg-emerald-50 text-emerald-800",
                  },
                ].map((summary) => (
                  <div
                    key={summary.label}
                    className={`border p-2.5 ${summary.tone}`}
                  >
                    <div className="text-lg font-bold leading-none">
                      {summary.value}
                    </div>
                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide">
                      {summary.label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by name or Health ID (e.g., HID-8842-X)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="space-y-2">
                {filteredQueue.map((patient) => (
                  <div
                    key={patient.patientId}
                    className={`data-strip flex items-center justify-between rounded-sm p-3 cursor-pointer ${
                      selectedPatientId === patient.patientId
                        ? "border-cyan-300 bg-cyan-50"
                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                    onClick={() => setSelectedPatientId(patient.patientId)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="icon-mark h-10 w-10 bg-[#dceff2] text-sm font-bold text-[#0f766e]">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          {patient.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {patient.hid}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {patient.waitTime}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusColor(patient.status)}`}
                      >
                        {patient.status}
                      </Badge>
                      <div
                        className="flex gap-1"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {patient.status === "Waiting" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-cyan-700"
                            aria-label={`Start processing ${patient.name}`}
                            onClick={() =>
                              handleQueueStatus(
                                patient.patientId,
                                "In Progress",
                              )
                            }
                          >
                            <Play className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {patient.status === "In Progress" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-emerald-700"
                            aria-label={`Mark ${patient.name} complete`}
                            onClick={() =>
                              handleQueueStatus(patient.patientId, "Completed")
                            }
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {patient.status === "Completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-amber-700"
                            aria-label={`Return ${patient.name} to waiting`}
                            onClick={() =>
                              handleQueueStatus(patient.patientId, "Waiting")
                            }
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Entry Tab */}
        <TabsContent value="test-entry" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-violet-600" />
                Test Entry
              </CardTitle>
              <CardDescription>
                Select test type and enter numeric parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Test Type Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs">Test Type</Label>
                <Select
                  value={selectedTest}
                  onValueChange={(val) => {
                    setSelectedTest(val);
                    setParameterValues({});
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a test type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {testTypes.map((test) => (
                      <SelectItem key={test.name} value={test.name}>
                        {test.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Parameter Inputs */}
              {currentTest && (
                <div className="rounded-sm border border-slate-300 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    Reference ranges shown for guidance
                  </div>
                  {currentTest.parameters.map((param) => {
                    const val = parseFloat(parameterValues[param.name] || "0");
                    const status =
                      val > 0 ? getResultStatus(val, param.refRange) : "Normal";
                    return (
                      <div key={param.name} className="flex items-center gap-3">
                        <div className="flex-1">
                          <Label className="text-xs text-slate-500">
                            {param.name}
                          </Label>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="0"
                              value={parameterValues[param.name] || ""}
                              onChange={(e) =>
                                setParameterValues((prev) => ({
                                  ...prev,
                                  [param.name]: e.target.value,
                                }))
                              }
                              className="h-9"
                            />
                            <span className="text-xs text-slate-400 whitespace-nowrap">
                              {param.unit}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 whitespace-nowrap">
                          Ref: {param.refRange}
                        </div>
                        {val > 0 && getStatusBadge(status)}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* File Upload Zone */}
              <div className="space-y-1.5">
                <Label className="text-xs">Diagnostic Files (PDF/Images)</Label>
                <div
                  className="flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-cyan-500 hover:bg-cyan-50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">
                    Drop files here or click to upload
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PDF, JPG, PNG up to 10MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-sm border border-slate-300 bg-white p-2"
                    >
                      <div className="flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-cyan-600" />
                        <span className="text-sm text-slate-700">
                          {file.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {file.size}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(i)}
                      >
                        <X className="h-3.5 w-3.5 text-slate-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit Button */}
              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-700"
                size="lg"
                onClick={handleSubmit}
                disabled={!selectedTest || submitting}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </span>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit to Active Doctor Session
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
