"use client";

import { useState, useCallback, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/lib/store";
import {
  FullPatientProfile,
  INITIAL_PATIENT_PROFILE,
  ChronicCondition,
  SurgeryRecord,
  VaccineRecord,
  ActiveMedication,
  AllergyRecord,
  BLOOD_GROUPS,
  COMMON_CONDITIONS,
  COMMON_VACCINES,
  COMMON_ALLERGENS,
  COMMON_MEDICATIONS,
  FREQUENCY_OPTIONS,
} from "@/types/patientHistory";
import {
  User,
  Heart,
  Shield,
  AlertTriangle,
  Syringe,
  Pill,
  Stethoscope,
  ClipboardCheck,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  MapPin,
  Phone,
  Droplets,
  Activity,
  FileText,
  Sparkles,
  RotateCcw,
  Download,
  Edit3,
  Check,
  X,
  Loader2,
  Search,
} from "lucide-react";

function DateOfBirthPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const [year, month, day] = value
    ? value.split("-").map(Number)
    : [0, 0, 0];
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedDay, setSelectedDay] = useState(day);

  useEffect(() => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDay(day);
  }, [value, year, month, day]);

  const years = Array.from({ length: 121 }, (_, index) => currentYear - index);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const daysInMonth =
    selectedYear && selectedMonth
      ? new Date(selectedYear, selectedMonth, 0).getDate()
      : 31;
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  const updateDate = (part: "year" | "month" | "day", rawValue: string) => {
    const nextYear = part === "year" ? Number(rawValue) : selectedYear;
    const nextMonth = part === "month" ? Number(rawValue) : selectedMonth;
    const requestedDay = part === "day" ? Number(rawValue) : selectedDay;
    const nextDay =
      nextYear && nextMonth
        ? requestedDay
          ? Math.min(requestedDay, new Date(nextYear, nextMonth, 0).getDate())
          : 0
        : requestedDay;

    setSelectedYear(nextYear);
    setSelectedMonth(nextMonth);
    setSelectedDay(nextDay);
    if (!nextYear || !nextMonth || !nextDay) return;

    onChange(
      `${nextYear.toString().padStart(4, "0")}-${nextMonth
        .toString()
        .padStart(2, "0")}-${nextDay.toString().padStart(2, "0")}`,
    );
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[0.8fr_1.4fr_1fr] gap-2">
        <Select
          value={selectedDay ? String(selectedDay) : undefined}
          onValueChange={(nextDay) => updateDate("day", nextDay)}
        >
          <SelectTrigger aria-label="Day of birth">
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent>
            {days.map((item) => (
              <SelectItem key={item} value={String(item)}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedMonth ? String(selectedMonth) : undefined}
          onValueChange={(nextMonth) => updateDate("month", nextMonth)}
        >
          <SelectTrigger aria-label="Month of birth">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((item, index) => (
              <SelectItem key={item} value={String(index + 1)}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedYear ? String(selectedYear) : undefined}
          onValueChange={(nextYear) => updateDate("year", nextYear)}
        >
          <SelectTrigger aria-label="Year of birth">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((item) => (
              <SelectItem key={item} value={String(item)}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-[11px] text-slate-400">
        Choose day, month, and year separately. This is faster for older birth dates.
      </p>
    </div>
  );
}

// ─── Step Definitions ──────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    title: "Identity & Demographics",
    icon: User,
    description: "Basic personal information",
  },
  {
    id: 2,
    title: "Chronic Conditions",
    icon: Activity,
    description: "Medical history & comorbidities",
  },
  {
    id: 3,
    title: "Surgical History",
    icon: Stethoscope,
    description: "Past surgeries & procedures",
  },
  {
    id: 4,
    title: "Vaccinations",
    icon: Syringe,
    description: "Immunization records",
  },
  {
    id: 5,
    title: "Active Medications",
    icon: Pill,
    description: "Current prescriptions",
  },
  {
    id: 6,
    title: "Allergies & Lifestyle",
    icon: AlertTriangle,
    description: "Allergens & habits",
  },
  {
    id: 7,
    title: "Final Review",
    icon: ClipboardCheck,
    description: "Review & submit",
  },
];

// ─── Helper: Generate unique ID ────────────────────────────────────
function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateHealthId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = Math.floor(1000 + Math.random() * 9000);
  const letter = chars[Math.floor(Math.random() * chars.length)];
  return `HID-${nums}-${letter}`;
}

// ─── Step Indicator ────────────────────────────────────────────────
function StepIndicator({
  currentStep,
  onStepClick,
  completedSteps,
}: {
  currentStep: number;
  onStepClick: (step: number) => void;
  completedSteps: Set<number>;
}) {
  return (
    <div className="flex items-center justify-between overflow-x-auto pb-2">
      {STEPS.map((step, idx) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.has(step.id);
        const isClickable = isCompleted || step.id <= currentStep;

        return (
          <div key={step.id} className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => isClickable && onStepClick(step.id)}
                    disabled={!isClickable}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-md"
                        : isCompleted
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-white text-emerald-600"
                          : isCompleted
                            ? "bg-emerald-200 text-emerald-700"
                            : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {isCompleted ? <Check className="h-3 w-3" /> : step.id}
                    </div>
                    <span className="hidden lg:inline">{step.title}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{step.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {idx < STEPS.length - 1 && (
              <div
                className={`mx-1 h-px w-4 sm:w-8 ${
                  isCompleted ? "bg-emerald-300" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Identity & Demographics ──────────────────────────────
function StepBasicInfo({
  profile,
  onChange,
  errors,
}: {
  profile: FullPatientProfile;
  onChange: (p: FullPatientProfile) => void;
  errors: Record<string, string>;
}) {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const update = (field: string, value: string) => {
    onChange({
      ...profile,
      basicInfo: { ...profile.basicInfo, [field]: value },
    });
  };

  const simulateVerification = () => {
    if (!profile.basicInfo.phone) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      if (!profile.healthId) {
        onChange({ ...profile, healthId: generateHealthId() });
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Health ID */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Unique Health ID</p>
                <p className="font-mono text-lg font-bold text-emerald-700">
                  {profile.healthId || "Not Generated"}
                </p>
              </div>
            </div>
            {profile.healthId && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Generated
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personal Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="e.g., Rajesh Kumar"
            value={profile.basicInfo.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />
          {errors.fullName && (
            <p className="text-xs text-red-500">{errors.fullName}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <DateOfBirthPicker
            value={profile.basicInfo.dob}
            onChange={(value) =>
              onChange({
                ...profile,
                basicInfo: { ...profile.basicInfo, dob: value },
              })
            }
          />
          {errors.dob && <p className="text-xs text-red-500">{errors.dob}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Gender</Label>
          <Select
            value={profile.basicInfo.gender}
            onValueChange={(v) => update("gender", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            Blood Group <span className="text-red-500">*</span>
          </Label>
          <Select
            value={profile.basicInfo.bloodGroup}
            onValueChange={(v) => update("bloodGroup", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_GROUPS.map((bg) => (
                <SelectItem key={bg} value={bg}>
                  <span className="flex items-center gap-2">
                    <Droplets className="h-3.5 w-3.5 text-red-500" />
                    {bg}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.bloodGroup && (
            <p className="text-xs text-red-500">{errors.bloodGroup}</p>
          )}
        </div>
      </div>

      {/* Contact & Verification */}
      <Separator />
      <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Phone className="h-4 w-4" />
        Contact & Verification
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="+91-98765-43210"
              value={profile.basicInfo.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant={verified ? "default" : "outline"}
              size="sm"
              onClick={simulateVerification}
              disabled={verifying || !profile.basicInfo.phone}
              className={verified ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {verifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : verified ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                "Verify"
              )}
            </Button>
          </div>
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone}</p>
          )}
          {verified && (
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Phone verified via OTP simulation
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Email (Optional)</Label>
          <Input
            type="email"
            placeholder="patient@email.com"
            value={profile.basicInfo.email || ""}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">Address (Optional)</Label>
        <Textarea
          placeholder="Full address with PIN code"
          value={profile.basicInfo.address || ""}
          onChange={(e) => update("address", e.target.value)}
          rows={2}
        />
      </div>

      {/* Emergency Contact */}
      <Separator />
      <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        Emergency Contact
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            Contact Name <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="e.g., Priya Kumar"
            value={profile.basicInfo.emergencyContactName}
            onChange={(e) => update("emergencyContactName", e.target.value)}
          />
          {errors.emergencyContactName && (
            <p className="text-xs text-red-500">
              {errors.emergencyContactName}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            Contact Phone <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="+91-98765-43211"
            value={profile.basicInfo.emergencyContactPhone}
            onChange={(e) => update("emergencyContactPhone", e.target.value)}
          />
          {errors.emergencyContactPhone && (
            <p className="text-xs text-red-500">
              {errors.emergencyContactPhone}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Relationship</Label>
          <Input
            placeholder="e.g., Wife, Son, Father"
            value={profile.basicInfo.emergencyContactRelation || ""}
            onChange={(e) => update("emergencyContactRelation", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Chronic Conditions ───────────────────────────────────
function StepChronicConditions({
  conditions,
  onChange,
}: {
  conditions: ChronicCondition[];
  onChange: (c: ChronicCondition[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [form, setForm] = useState<ChronicCondition>({
    conditionName: "",
    diagnosedYear: "",
    status: "active",
    latestMetrics: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSuggestions = COMMON_CONDITIONS.filter(
    (c) =>
      c.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !conditions.some((ec) => ec.conditionName === c),
  );

  const handleAdd = () => {
    if (!form.conditionName || !form.diagnosedYear) return;
    if (editingIdx !== null) {
      const updated = [...conditions];
      updated[editingIdx] = form;
      onChange(updated);
    } else {
      onChange([...conditions, form]);
    }
    setForm({
      conditionName: "",
      diagnosedYear: "",
      status: "active",
      latestMetrics: "",
    });
    setShowForm(false);
    setEditingIdx(null);
    setSearchTerm("");
  };

  const handleEdit = (idx: number) => {
    setForm(conditions[idx]);
    setEditingIdx(idx);
    setShowForm(true);
  };

  const handleRemove = (idx: number) => {
    onChange(conditions.filter((_, i) => i !== idx));
  };

  const handleQuickAdd = (name: string) => {
    setForm({ ...form, conditionName: name });
    setSearchTerm("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">
            Chronic Conditions & Comorbidities
          </h3>
          <p className="text-xs text-slate-400">
            Track ongoing medical conditions
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setShowForm(true);
            setEditingIdx(null);
            setForm({
              conditionName: "",
              diagnosedYear: "",
              status: "active",
              latestMetrics: "",
            });
          }}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Condition
        </Button>
      </div>

      {/* Quick Add Suggestions */}
      {!showForm && conditions.length === 0 && (
        <Card className="border-dashed border-slate-300">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-2 font-medium">
              Quick add common conditions:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CONDITIONS.slice(0, 8).map((c) => (
                <button
                  key={c}
                  onClick={() => handleQuickAdd(c)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <Plus className="inline h-3 w-3 mr-0.5" />
                  {c}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Condition List */}
      {conditions.length > 0 && (
        <div className="space-y-2">
          {conditions.map((c, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    c.status === "active"
                      ? "bg-red-100 text-red-600"
                      : c.status === "managed"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-emerald-100 text-emerald-600"
                  }`}
                >
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {c.conditionName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Diagnosed: {c.diagnosedYear}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        c.status === "active"
                          ? "border-red-200 bg-red-50 text-red-600"
                          : c.status === "managed"
                            ? "border-amber-200 bg-amber-50 text-amber-600"
                            : "border-emerald-200 bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {c.status}
                    </Badge>
                    {c.latestMetrics && (
                      <span className="text-slate-500">
                        | {c.latestMetrics}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleEdit(idx)}
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleRemove(idx)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-700">
                {editingIdx !== null ? "Edit Condition" : "Add New Condition"}
              </h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setShowForm(false);
                  setEditingIdx(null);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Search/Select Condition */}
            <div className="space-y-1.5">
              <Label className="text-xs">Condition Name</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search or type condition..."
                  value={form.conditionName || searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!editingIdx) setForm({ ...form, conditionName: "" });
                  }}
                  className="pl-8"
                />
              </div>
              {searchTerm && filteredSuggestions.length > 0 && (
                <div className="max-h-32 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-sm">
                  {filteredSuggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setForm({ ...form, conditionName: s });
                        setSearchTerm("");
                      }}
                      className="block w-full px-3 py-1.5 text-left text-xs hover:bg-emerald-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Diagnosed Year</Label>
                <Input
                  type="number"
                  placeholder="2020"
                  min="1900"
                  max="2099"
                  value={form.diagnosedYear}
                  onChange={(e) =>
                    setForm({ ...form, diagnosedYear: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v: "active" | "managed" | "resolved") =>
                    setForm({ ...form, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="managed">Managed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Latest Metrics</Label>
                <Input
                  placeholder="e.g., BP 130/85"
                  value={form.latestMetrics || ""}
                  onChange={(e) =>
                    setForm({ ...form, latestMetrics: e.target.value })
                  }
                />
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleAdd}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              {editingIdx !== null ? "Update" : "Add Condition"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Step 3: Surgical History ─────────────────────────────────────
function StepSurgicalHistory({
  surgeries,
  onChange,
}: {
  surgeries: SurgeryRecord[];
  onChange: (s: SurgeryRecord[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [form, setForm] = useState<SurgeryRecord>({
    id: "",
    procedureName: "",
    operatingHospital: "",
    yearOfProcedure: "",
    surgeonName: "",
    complicationsOrNotes: "",
  });

  const handleAdd = () => {
    if (!form.procedureName || !form.operatingHospital || !form.yearOfProcedure)
      return;
    if (editingIdx !== null) {
      const updated = [...surgeries];
      updated[editingIdx] = { ...form, id: updated[editingIdx].id };
      onChange(updated);
    } else {
      onChange([...surgeries, { ...form, id: uid() }]);
    }
    setForm({
      id: "",
      procedureName: "",
      operatingHospital: "",
      yearOfProcedure: "",
      surgeonName: "",
      complicationsOrNotes: "",
    });
    setShowForm(false);
    setEditingIdx(null);
  };

  const handleEdit = (idx: number) => {
    setForm(surgeries[idx]);
    setEditingIdx(idx);
    setShowForm(true);
  };

  const handleRemove = (idx: number) => {
    onChange(surgeries.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">
            Surgical & Procedural History
          </h3>
          <p className="text-xs text-slate-400">
            Record all past surgeries, operations, and implants
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setShowForm(true);
            setEditingIdx(null);
            setForm({
              id: "",
              procedureName: "",
              operatingHospital: "",
              yearOfProcedure: "",
              surgeonName: "",
              complicationsOrNotes: "",
            });
          }}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Surgery
        </Button>
      </div>

      {surgeries.length === 0 && !showForm && (
        <Card className="border-dashed border-slate-300">
          <CardContent className="p-8 text-center">
            <Stethoscope className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">
              No surgical records added yet
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Click &quot;Add Surgery&quot; to record surgical history
            </p>
          </CardContent>
        </Card>
      )}

      {surgeries.length > 0 && (
        <div className="space-y-2">
          {surgeries.map((s, idx) => (
            <div
              key={s.id}
              className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {s.procedureName}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {s.operatingHospital}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {s.yearOfProcedure}
                      </span>
                      {s.surgeonName && <span>Dr. {s.surgeonName}</span>}
                    </div>
                    {s.complicationsOrNotes && (
                      <p className="mt-1 text-xs text-slate-500 italic">
                        {s.complicationsOrNotes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleEdit(idx)}
                  >
                    <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleRemove(idx)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-700">
                {editingIdx !== null ? "Edit Surgery" : "Add New Surgery"}
              </h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setShowForm(false);
                  setEditingIdx(null);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Procedure Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g., Appendectomy, Knee Replacement"
                  value={form.procedureName}
                  onChange={(e) =>
                    setForm({ ...form, procedureName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Operating Hospital <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g., AIIMS New Delhi"
                  value={form.operatingHospital}
                  onChange={(e) =>
                    setForm({ ...form, operatingHospital: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Year of Procedure <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="2018"
                  min="1900"
                  max="2099"
                  value={form.yearOfProcedure}
                  onChange={(e) =>
                    setForm({ ...form, yearOfProcedure: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Surgeon Name</Label>
                <Input
                  placeholder="e.g., Dr. Sharma"
                  value={form.surgeonName || ""}
                  onChange={(e) =>
                    setForm({ ...form, surgeonName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Complications / Notes</Label>
              <Textarea
                placeholder="Any complications, implant details, or post-operative notes..."
                value={form.complicationsOrNotes || ""}
                onChange={(e) =>
                  setForm({ ...form, complicationsOrNotes: e.target.value })
                }
                rows={2}
              />
            </div>
            <Button
              size="sm"
              onClick={handleAdd}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              {editingIdx !== null ? "Update" : "Add Surgery"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Step 4: Vaccinations ─────────────────────────────────────────
function StepVaccinations({
  vaccinations,
  onChange,
}: {
  vaccinations: VaccineRecord[];
  onChange: (v: VaccineRecord[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [form, setForm] = useState<VaccineRecord>({
    id: "",
    vaccineName: "",
    doseNumber: "",
    administeredDate: "",
    hospitalOrFacility: "",
    batchNumber: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVaccines = COMMON_VACCINES.filter(
    (v) =>
      v.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !vaccinations.some((ev) => ev.vaccineName === v),
  );

  const handleAdd = () => {
    if (!form.vaccineName || !form.doseNumber || !form.administeredDate) return;
    if (editingIdx !== null) {
      const updated = [...vaccinations];
      updated[editingIdx] = { ...form, id: updated[editingIdx].id };
      onChange(updated);
    } else {
      onChange([...vaccinations, { ...form, id: uid() }]);
    }
    setForm({
      id: "",
      vaccineName: "",
      doseNumber: "",
      administeredDate: "",
      hospitalOrFacility: "",
      batchNumber: "",
    });
    setShowForm(false);
    setEditingIdx(null);
    setSearchTerm("");
  };

  const handleEdit = (idx: number) => {
    setForm(vaccinations[idx]);
    setEditingIdx(idx);
    setShowForm(true);
  };

  const handleRemove = (idx: number) => {
    onChange(vaccinations.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">
            Vaccination & Immunization History
          </h3>
          <p className="text-xs text-slate-400">
            Record routine, COVID-19, and travel vaccines
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setShowForm(true);
            setEditingIdx(null);
            setForm({
              id: "",
              vaccineName: "",
              doseNumber: "",
              administeredDate: "",
              hospitalOrFacility: "",
              batchNumber: "",
            });
          }}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Vaccine
        </Button>
      </div>

      {vaccinations.length === 0 && !showForm && (
        <Card className="border-dashed border-slate-300">
          <CardContent className="p-8 text-center">
            <Syringe className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">
              No vaccination records added yet
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Click &quot;Add Vaccine&quot; to record immunization history
            </p>
          </CardContent>
        </Card>
      )}

      {vaccinations.length > 0 && (
        <div className="space-y-2">
          {vaccinations.map((v, idx) => (
            <div
              key={v.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Syringe className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {v.vaccineName}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <Badge
                      variant="outline"
                      className="border-blue-200 bg-blue-50 text-blue-600 text-[10px]"
                    >
                      {v.doseNumber}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {v.administeredDate}
                    </span>
                    {v.hospitalOrFacility && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {v.hospitalOrFacility}
                      </span>
                    )}
                    {v.batchNumber && <span>Batch: {v.batchNumber}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleEdit(idx)}
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleRemove(idx)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-700">
                {editingIdx !== null ? "Edit Vaccine" : "Add New Vaccine"}
              </h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setShowForm(false);
                  setEditingIdx(null);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Vaccine Search */}
            <div className="space-y-1.5">
              <Label className="text-xs">
                Vaccine Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search vaccine..."
                  value={form.vaccineName || searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!editingIdx) setForm({ ...form, vaccineName: "" });
                  }}
                  className="pl-8"
                />
              </div>
              {searchTerm && filteredVaccines.length > 0 && (
                <div className="max-h-32 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-sm">
                  {filteredVaccines.map((v) => (
                    <button
                      key={v}
                      onClick={() => {
                        setForm({ ...form, vaccineName: v });
                        setSearchTerm("");
                      }}
                      className="block w-full px-3 py-1.5 text-left text-xs hover:bg-emerald-50"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Dose Number <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.doseNumber}
                  onValueChange={(v) => setForm({ ...form, doseNumber: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dose 1">Dose 1</SelectItem>
                    <SelectItem value="Dose 2">Dose 2</SelectItem>
                    <SelectItem value="Dose 3">Dose 3</SelectItem>
                    <SelectItem value="Booster">Booster</SelectItem>
                    <SelectItem value="Annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Date Administered <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={form.administeredDate}
                  onChange={(e) =>
                    setForm({ ...form, administeredDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Hospital / Facility</Label>
                <Input
                  placeholder="e.g., PHC Central"
                  value={form.hospitalOrFacility || ""}
                  onChange={(e) =>
                    setForm({ ...form, hospitalOrFacility: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Batch Number</Label>
                <Input
                  placeholder="e.g., CVD-2021-A1"
                  value={form.batchNumber || ""}
                  onChange={(e) =>
                    setForm({ ...form, batchNumber: e.target.value })
                  }
                />
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleAdd}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              {editingIdx !== null ? "Update" : "Add Vaccine"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Step 5: Active Medications ───────────────────────────────────
function StepMedications({
  medications,
  onChange,
}: {
  medications: ActiveMedication[];
  onChange: (m: ActiveMedication[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [form, setForm] = useState<ActiveMedication>({
    id: "",
    drugName: "",
    dosage: "",
    frequency: "",
    prescribedFor: "",
    startDate: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMeds = COMMON_MEDICATIONS.filter(
    (m) =>
      m.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !medications.some((em) => em.drugName === m),
  );

  const handleAdd = () => {
    if (!form.drugName || !form.dosage || !form.frequency) return;
    if (editingIdx !== null) {
      const updated = [...medications];
      updated[editingIdx] = { ...form, id: updated[editingIdx].id };
      onChange(updated);
    } else {
      onChange([...medications, { ...form, id: uid() }]);
    }
    setForm({
      id: "",
      drugName: "",
      dosage: "",
      frequency: "",
      prescribedFor: "",
      startDate: "",
    });
    setShowForm(false);
    setEditingIdx(null);
    setSearchTerm("");
  };

  const handleEdit = (idx: number) => {
    setForm(medications[idx]);
    setEditingIdx(idx);
    setShowForm(true);
  };

  const handleRemove = (idx: number) => {
    onChange(medications.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">
            Active & Chronic Medications
          </h3>
          <p className="text-xs text-slate-400">
            Record current prescriptions and supplements
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setShowForm(true);
            setEditingIdx(null);
            setForm({
              id: "",
              drugName: "",
              dosage: "",
              frequency: "",
              prescribedFor: "",
              startDate: "",
            });
          }}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Medication
        </Button>
      </div>

      {medications.length === 0 && !showForm && (
        <Card className="border-dashed border-slate-300">
          <CardContent className="p-8 text-center">
            <Pill className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">
              No medications recorded yet
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Click &quot;Add Medication&quot; to record current prescriptions
            </p>
          </CardContent>
        </Card>
      )}

      {medications.length > 0 && (
        <div className="space-y-2">
          {medications.map((m, idx) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <Pill className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {m.drugName}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <Badge
                      variant="outline"
                      className="border-amber-200 bg-amber-50 text-amber-600 text-[10px]"
                    >
                      {m.dosage}
                    </Badge>
                    <span>{m.frequency}</span>
                    {m.prescribedFor && (
                      <>
                        <span>for</span>
                        <Badge
                          variant="outline"
                          className="border-slate-200 bg-slate-50 text-slate-600 text-[10px]"
                        >
                          {m.prescribedFor}
                        </Badge>
                      </>
                    )}
                    {m.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Since {m.startDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleEdit(idx)}
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleRemove(idx)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-700">
                {editingIdx !== null ? "Edit Medication" : "Add New Medication"}
              </h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setShowForm(false);
                  setEditingIdx(null);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Drug Search */}
            <div className="space-y-1.5">
              <Label className="text-xs">
                Drug Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search medication..."
                  value={form.drugName || searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!editingIdx) setForm({ ...form, drugName: "" });
                  }}
                  className="pl-8"
                />
              </div>
              {searchTerm && filteredMeds.length > 0 && (
                <div className="max-h-32 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-sm">
                  {filteredMeds.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setForm({ ...form, drugName: m });
                        setSearchTerm("");
                      }}
                      className="block w-full px-3 py-1.5 text-left text-xs hover:bg-emerald-50"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Dosage <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g., 500mg, 10 units"
                  value={form.dosage}
                  onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Frequency <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.frequency}
                  onValueChange={(v) => setForm({ ...form, frequency: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Prescribed For</Label>
                <Input
                  placeholder="e.g., Hypertension, Diabetes"
                  value={form.prescribedFor}
                  onChange={(e) =>
                    setForm({ ...form, prescribedFor: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate || ""}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleAdd}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              {editingIdx !== null ? "Update" : "Add Medication"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Step 6: Allergies & Lifestyle ────────────────────────────────
function StepAllergiesLifestyle({
  allergies,
  onAllergiesChange,
  lifestyle,
  onLifestyleChange,
}: {
  allergies: AllergyRecord[];
  onAllergiesChange: (a: AllergyRecord[]) => void;
  lifestyle: FullPatientProfile["lifestyleMetrics"];
  onLifestyleChange: (
    l: NonNullable<FullPatientProfile["lifestyleMetrics"]>,
  ) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [form, setForm] = useState<AllergyRecord>({
    allergen: "",
    allergyType: "drug",
    severity: "mild",
    reactionDescription: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAllergens = COMMON_ALLERGENS.filter(
    (a) =>
      a.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !allergies.some((ea) => ea.allergen === a),
  );

  const handleAdd = () => {
    if (!form.allergen) return;
    if (editingIdx !== null) {
      const updated = [...allergies];
      updated[editingIdx] = form;
      onAllergiesChange(updated);
    } else {
      onAllergiesChange([...allergies, form]);
    }
    setForm({
      allergen: "",
      allergyType: "drug",
      severity: "mild",
      reactionDescription: "",
    });
    setShowForm(false);
    setEditingIdx(null);
    setSearchTerm("");
  };

  const handleEdit = (idx: number) => {
    setForm(allergies[idx]);
    setEditingIdx(idx);
    setShowForm(true);
  };

  const handleRemove = (idx: number) => {
    onAllergiesChange(allergies.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {/* Allergies Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Allergies & Adverse Reactions
            </h3>
            <p className="text-xs text-slate-400">
              Drug, food, and environmental allergies
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setShowForm(true);
              setEditingIdx(null);
              setForm({
                allergen: "",
                allergyType: "drug",
                severity: "mild",
                reactionDescription: "",
              });
            }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Allergy
          </Button>
        </div>

        {allergies.length === 0 && !showForm && (
          <Card className="border-dashed border-slate-300">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="mx-auto h-6 w-6 text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">No allergies recorded</p>
              <p className="text-xs text-slate-300 mt-1">
                Click &quot;Add Allergy&quot; to record known allergies
              </p>
            </CardContent>
          </Card>
        )}

        {allergies.length > 0 && (
          <div className="space-y-2">
            {allergies.map((a, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      a.severity === "severe / anaphylactic"
                        ? "bg-red-100 text-red-600"
                        : a.severity === "moderate"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {a.allergen}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <Badge
                        variant="outline"
                        className="text-[10px] border-slate-200 bg-slate-50"
                      >
                        {a.allergyType}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          a.severity === "severe / anaphylactic"
                            ? "border-red-200 bg-red-50 text-red-600"
                            : a.severity === "moderate"
                              ? "border-amber-200 bg-amber-50 text-amber-600"
                              : "border-yellow-200 bg-yellow-50 text-yellow-600"
                        }`}
                      >
                        {a.severity}
                      </Badge>
                      {a.reactionDescription && (
                        <span className="italic">{a.reactionDescription}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleEdit(idx)}
                  >
                    <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleRemove(idx)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <Card className="border-emerald-200 bg-emerald-50/30 mt-2">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-700">
                  {editingIdx !== null ? "Edit Allergy" : "Add New Allergy"}
                </h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    setShowForm(false);
                    setEditingIdx(null);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Allergen Search */}
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Allergen <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search allergen..."
                    value={form.allergen || searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (!editingIdx) setForm({ ...form, allergen: "" });
                    }}
                    className="pl-8"
                  />
                </div>
                {searchTerm && filteredAllergens.length > 0 && (
                  <div className="max-h-32 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-sm">
                    {filteredAllergens.map((a) => (
                      <button
                        key={a}
                        onClick={() => {
                          setForm({ ...form, allergen: a });
                          setSearchTerm("");
                        }}
                        className="block w-full px-3 py-1.5 text-left text-xs hover:bg-emerald-50"
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Allergy Type</Label>
                  <Select
                    value={form.allergyType}
                    onValueChange={(
                      v: "drug" | "food" | "environmental" | "other",
                    ) => setForm({ ...form, allergyType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drug">Drug</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="environmental">
                        Environmental
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Severity</Label>
                  <Select
                    value={form.severity}
                    onValueChange={(
                      v: "mild" | "moderate" | "severe / anaphylactic",
                    ) => setForm({ ...form, severity: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe / anaphylactic">
                        Severe / Anaphylactic
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Reaction</Label>
                  <Input
                    placeholder="e.g., Rash, swelling"
                    value={form.reactionDescription || ""}
                    onChange={(e) =>
                      setForm({ ...form, reactionDescription: e.target.value })
                    }
                  />
                </div>
              </div>

              <Button
                size="sm"
                onClick={handleAdd}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                {editingIdx !== null ? "Update" : "Add Allergy"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Lifestyle Metrics */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
          <Heart className="h-4 w-4 text-rose-500" />
          Lifestyle Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Smoking Status</Label>
            <Select
              value={lifestyle?.smokingStatus || "never"}
              onValueChange={(v: "never" | "former" | "current") =>
                onLifestyleChange({
                  smokingStatus: v,
                  alcoholUse: lifestyle?.alcoholUse || "none",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="former">Former Smoker</SelectItem>
                <SelectItem value="current">Current Smoker</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Alcohol Use</Label>
            <Select
              value={lifestyle?.alcoholUse || "none"}
              onValueChange={(v: "none" | "occasional" | "regular") =>
                onLifestyleChange({
                  smokingStatus: lifestyle?.smokingStatus || "never",
                  alcoholUse: v,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="occasional">Occasional</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 7: Final Review ─────────────────────────────────────────
function StepReview({
  profile,
  onEditStep,
}: {
  profile: FullPatientProfile;
  onEditStep: (step: number) => void;
}) {
  const sections = [
    { step: 1, title: "Identity & Demographics", icon: User, count: null },
    {
      step: 2,
      title: "Chronic Conditions",
      icon: Activity,
      count: profile.chronicConditions.length,
    },
    {
      step: 3,
      title: "Surgical History",
      icon: Stethoscope,
      count: profile.surgeries.length,
    },
    {
      step: 4,
      title: "Vaccinations",
      icon: Syringe,
      count: profile.vaccinations.length,
    },
    {
      step: 5,
      title: "Medications",
      icon: Pill,
      count: profile.activeMedications.length,
    },
    {
      step: 6,
      title: "Allergies & Lifestyle",
      icon: AlertTriangle,
      count: profile.allergies.length,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-emerald-800">
            Review Complete Profile
          </h3>
        </div>
        <p className="text-xs text-emerald-600">
          Verify all information before submitting. Click any section to edit.
        </p>
      </div>

      {/* Patient Summary Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                {profile.basicInfo.fullName || "—"}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-mono text-emerald-600">
                  {profile.healthId}
                </span>
                <span>•</span>
                <span>{profile.basicInfo.gender}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-red-500" />
                  {profile.basicInfo.bloodGroup || "—"}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-500">
            <div>
              <span className="font-medium">DOB:</span>{" "}
              {profile.basicInfo.dob || "—"}
            </div>
            <div>
              <span className="font-medium">Phone:</span>{" "}
              {profile.basicInfo.phone || "—"}
            </div>
            <div>
              <span className="font-medium">Emergency:</span>{" "}
              {profile.basicInfo.emergencyContactName || "—"}
            </div>
            <div>
              <span className="font-medium">EC Phone:</span>{" "}
              {profile.basicInfo.emergencyContactPhone || "—"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Summaries */}
      <div className="space-y-2">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <button
              key={sec.step}
              onClick={() => onEditStep(sec.step)}
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {sec.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {sec.count !== null
                        ? `${sec.count} item${sec.count !== 1 ? "s" : ""} recorded`
                        : "Personal details"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sec.count !== null && sec.count > 0 && (
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                      {sec.count}
                    </Badge>
                  )}
                  <Edit3 className="h-3.5 w-3.5 text-slate-300" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Wizard Component ────────────────────────────────────────
export default function PatientIntakeWizard() {
  const { toast } = useToast();
  const { registerPatient, setRole } = useAppStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [profile, setProfile] = useState<FullPatientProfile>({
    ...INITIAL_PATIENT_PROFILE,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ─── Validation ───────────────────────────────────────────────
  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Record<string, string> = {};

      if (step === 1) {
        if (!profile.basicInfo.fullName.trim())
          newErrors.fullName = "Full name is required";
        if (!profile.basicInfo.dob) newErrors.dob = "Date of birth is required";
        if (!profile.basicInfo.bloodGroup)
          newErrors.bloodGroup = "Blood group is required";
        if (!profile.basicInfo.phone.trim())
          newErrors.phone = "Phone number is required";
        if (!profile.basicInfo.emergencyContactName.trim())
          newErrors.emergencyContactName = "Emergency contact name is required";
        if (!profile.basicInfo.emergencyContactPhone.trim())
          newErrors.emergencyContactPhone =
            "Emergency contact phone is required";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [profile],
  );

  // ─── Navigation ───────────────────────────────────────────────
  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive",
      });
      return;
    }

    setCompletedSteps((prev) => new Set(Array.from(prev).concat(currentStep)));
    setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  };

  const handlePrev = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  // ─── Submit ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    const profileToSubmit = profile.healthId
      ? profile
      : { ...profile, healthId: generateHealthId() };
    if (profileToSubmit.healthId !== profile.healthId) {
      setProfile(profileToSubmit);
    }
    setSubmitting(true);
    try {
      await registerPatient(profileToSubmit);
      setSubmitted(true);
      toast({
        title: "Registration Complete! 🎉",
        description: `Patient ${profile.basicInfo.fullName} has been successfully registered.`,
      });
      // Navigate to patient portal after 1.5 seconds
      setTimeout(() => {
        setRole("patient-portal");
      }, 1500);
    } catch (error) {
      setSubmitting(false);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Unable to register patient",
        variant: "destructive",
      });
    }
  };

  // ─── Reset ────────────────────────────────────────────────────
  const handleReset = () => {
    setProfile({ ...INITIAL_PATIENT_PROFILE });
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setErrors({});
    setSubmitted(false);
  };

  // ─── Success Screen ───────────────────────────────────────────
  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Registration Complete!
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Patient profile has been successfully created and submitted to the
              national EHR system.
            </p>

            <div className="mx-auto max-w-sm rounded-lg border border-emerald-200 bg-white p-4 mb-6">
              <div className="text-xs text-slate-400 mb-1">
                Unique Health ID
              </div>
              <div className="font-mono text-2xl font-bold text-emerald-700">
                {profile.healthId}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {profile.basicInfo.fullName} • {profile.basicInfo.gender} •{" "}
                {profile.basicInfo.bloodGroup}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div>
                <div className="text-lg font-bold text-slate-800">
                  {profile.chronicConditions.length}
                </div>
                <div className="text-[10px] text-slate-400">Conditions</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">
                  {profile.activeMedications.length}
                </div>
                <div className="text-[10px] text-slate-400">Medications</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">
                  {profile.allergies.length}
                </div>
                <div className="text-[10px] text-slate-400">Allergies</div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Register New Patient
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Download className="h-4 w-4 mr-1" />
                Download Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────
  const stepTitles: Record<number, { title: string; description: string }> = {
    1: {
      title: "Identity & Demographics",
      description: "Personal information and emergency contacts",
    },
    2: {
      title: "Chronic Conditions",
      description: "Ongoing medical conditions and comorbidities",
    },
    3: {
      title: "Surgical History",
      description: "Past surgeries, operations, and procedures",
    },
    4: {
      title: "Vaccinations",
      description: "Immunization and vaccine records",
    },
    5: {
      title: "Active Medications",
      description: "Current prescriptions and dosages",
    },
    6: {
      title: "Allergies & Lifestyle",
      description: "Known allergies and lifestyle factors",
    },
    7: {
      title: "Final Review",
      description: "Review all information before submission",
    },
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800">
            Patient Lifetime Intake
          </h1>
          <p className="text-xs text-slate-400">
            Comprehensive medical history registration
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <Card className="border-slate-200">
        <CardContent className="p-3">
          <StepIndicator
            currentStep={currentStep}
            onStepClick={handleStepClick}
            completedSteps={completedSteps}
          />
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {(() => {
              const StepIcon = STEPS[currentStep - 1].icon;
              return (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <StepIcon className="h-4 w-4" />
                </div>
              );
            })()}
            <div>
              <CardTitle className="text-base">
                {stepTitles[currentStep].title}
              </CardTitle>
              <CardDescription className="text-xs">
                {stepTitles[currentStep].description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <StepBasicInfo
              profile={profile}
              onChange={setProfile}
              errors={errors}
            />
          )}
          {currentStep === 2 && (
            <StepChronicConditions
              conditions={profile.chronicConditions}
              onChange={(c) => setProfile({ ...profile, chronicConditions: c })}
            />
          )}
          {currentStep === 3 && (
            <StepSurgicalHistory
              surgeries={profile.surgeries}
              onChange={(s) => setProfile({ ...profile, surgeries: s })}
            />
          )}
          {currentStep === 4 && (
            <StepVaccinations
              vaccinations={profile.vaccinations}
              onChange={(v) => setProfile({ ...profile, vaccinations: v })}
            />
          )}
          {currentStep === 5 && (
            <StepMedications
              medications={profile.activeMedications}
              onChange={(m) => setProfile({ ...profile, activeMedications: m })}
            />
          )}
          {currentStep === 6 && (
            <StepAllergiesLifestyle
              allergies={profile.allergies}
              onAllergiesChange={(a) =>
                setProfile({ ...profile, allergies: a })
              }
              lifestyle={profile.lifestyleMetrics}
              onLifestyleChange={(l) =>
                setProfile({ ...profile, lifestyleMetrics: l })
              }
            />
          )}
          {currentStep === 7 && (
            <StepReview profile={profile} onEditStep={handleStepClick} />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="text-xs text-slate-400">
          Step {currentStep} of {STEPS.length}
        </div>

        {currentStep < STEPS.length ? (
          <Button
            onClick={handleNext}
            className="bg-emerald-600 hover:bg-emerald-700 gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 gap-1"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Submit Registration
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
