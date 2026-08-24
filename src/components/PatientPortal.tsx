"use client";

import { useEffect, useRef, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import type { TimeLineEntry } from "@/lib/mockData";
import {
  Droplets,
  Phone,
  AlertTriangle,
  Activity,
  FileText,
  Pill,
  FlaskConical,
  User,
  Calendar,
  ClipboardList,
  Heart,
  Shield,
  Stethoscope,
  MapPin,
  UserRound,
} from "lucide-react";

function displayPatientLabel(value: unknown, field: "allergen" | "conditionName") {
  return typeof value === "string"
    ? value
    : String((value as Record<string, unknown>)?.[field] ?? "");
}

function TimelineStrip({
  entry,
  index,
  icon,
  colorClass,
}: {
  entry: TimeLineEntry;
  index: number;
  icon: React.ReactNode;
  colorClass: string;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const observer = new IntersectionObserver(
      ([observedEntry]) => {
        if (observedEntry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(strip);
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(strip);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={stripRef}
      className={`history-strip relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 sm:grid-cols-[2.25rem_minmax(0,1fr)_auto] ${isVisible ? "history-strip-visible" : ""}`}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div
        className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border-2 ${colorClass}`}
      >
        {icon}
      </div>
      <div className="history-strip-panel min-w-0 border-l-4 border-slate-300 bg-white px-4 py-3 shadow-sm">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {entry.type}
        </div>
        <h4 className="text-sm font-semibold text-slate-800">{entry.title}</h4>
        <p className="mt-0.5 text-xs text-slate-500">{entry.description}</p>
        {entry.doctorName && (
          <div className="mt-2 flex items-center gap-1 text-xs text-cyan-700">
            <Heart className="h-3 w-3" />
            {entry.doctorName}
          </div>
        )}
      </div>
      <div className="col-start-2 flex items-center gap-1.5 text-xs text-slate-500 sm:col-start-auto sm:items-start sm:justify-end sm:pt-3">
        <Calendar className="h-3 w-3" />
        {entry.date}
      </div>
    </div>
  );
}
export default function PatientPortal() {
  const {
  patients,
  selectedPatientId,
  timeline,
  submitSelfReport,
} = useAppStore();
<<<<<<< HEAD
  const { toast } = useToast();
  const patient = patients.find((p) => p.id === selectedPatientId) ?? patients[0];

  const [bpSystolic, setBpSystolic] = useState("");
=======
const { toast } = useToast();
const patient = patients.find((p) => p.id === selectedPatientId) ?? patients[0];
const [bpSystolic, setBpSystolic] = useState("");
>>>>>>> 51467903d403dda401975ca061b87a102aa33a54
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [sugarLevel, setSugarLevel] = useState("");
  const [temperature, setTemperature] = useState("");
  const [weight, setWeight] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [activeTab, setActiveTab] = useState("timeline");

  if (!patient) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            No patient profile available
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Complete patient registration before opening the patient portal.
          </p>
        </div>
      </div>
    );
  }

  const patientTimeline = timeline.filter((t) => t.patientId === patient.id);

  const handleSubmitVitals = () => {
    if (!bpSystolic || !bpDiastolic || !sugarLevel) {
      toast({
        title: "Missing Fields",
        description: "Please enter blood pressure and sugar level.",
        variant: "destructive",
      });
      return;
    }
    submitSelfReport({
      bloodPressureSystolic: parseInt(bpSystolic),
      bloodPressureDiastolic: parseInt(bpDiastolic),
      sugarLevel: parseInt(sugarLevel),
      temperature: temperature ? parseFloat(temperature) : 98.6,
      weight: weight ? parseFloat(weight) : 0,
      symptoms,
      recordedAt: new Date().toISOString(),
    });
    toast({
      title: "Vitals Submitted ✓",
      description:
        "Your home vitals have been recorded in your lifetime record.",
    });
    setBpSystolic("");
    setBpDiastolic("");
    setSugarLevel("");
    setTemperature("");
    setWeight("");
    setSymptoms("");
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "Visit":
        return <Stethoscope className="h-4 w-4" />;
      case "Lab":
        return <FlaskConical className="h-4 w-4" />;
      case "Prescription":
        return <Pill className="h-4 w-4" />;
      case "Self-Report":
        return <ClipboardList className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTimelineColor = (type: string) => {
    switch (type) {
      case "Visit":
        return "bg-cyan-100 text-cyan-700 border-cyan-300";
      case "Lab":
        return "bg-violet-100 text-violet-700 border-violet-300";
      case "Prescription":
        return "bg-amber-100 text-amber-700 border-amber-300";
      case "Self-Report":
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      {/* Patient Header Card */}
      <Card className="border-slate-500 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-emerald-700 text-white">
                <User className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  {patient.name}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-emerald-400 bg-emerald-50 text-emerald-800 font-mono text-xs"
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    {patient.uniqueHealthId}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-red-300 bg-red-50 text-red-700"
                  >
                    <Droplets className="mr-1 h-3 w-3" />
                    {patient.bloodGroup}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {patient.gender}, {patient.age} yrs
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 text-sm text-slate-500">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Phone className="h-3.5 w-3.5 text-cyan-700" />
                {patient.phone}
              </div>
              <div className="flex items-start gap-1.5 text-right text-xs text-slate-500">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-700" />
                {patient.address}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 rounded-sm border border-amber-500 bg-amber-50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Allergies & Chronic Conditions
              </div>
              <div className="flex flex-wrap gap-1">
                {patient.allergies.map((a) => (
                  <Badge
                    key={displayPatientLabel(a, "allergen")}
                    variant="outline"
                    className="border-red-300 bg-red-50 text-red-600 text-xs"
                  >
                    {displayPatientLabel(a, "allergen")}
                  </Badge>
                ))}
                {patient.chronicConditions.map((c) => (
                  <Badge
                    key={displayPatientLabel(c, "conditionName")}
                    variant="outline"
                    className="border-amber-300 bg-amber-50 text-amber-600 text-xs"
                  >
                    {displayPatientLabel(c, "conditionName")}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex-1 rounded-sm border border-slate-500 bg-slate-50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1">
                <UserRound className="h-3.5 w-3.5 text-cyan-700" />
                Emergency Contacts
              </div>
              {patient.emergencyContacts.map((ec) => (
                <div key={ec.name} className="text-xs text-slate-500">
                  <span className="font-medium">{ec.name}</span> ({ec.relation})
                  — {ec.phone}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timeline" className="gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Lifetime History
          </TabsTrigger>
          <TabsTrigger value="self-report" className="gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Self-Report Vitals
          </TabsTrigger>
        </TabsList>

        <TabsContent
          key={`timeline-${activeTab}`}
          value="timeline"
          className="mt-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Lifetime Health Timeline
              </CardTitle>
              <CardDescription>
                Chronological view of all visits, labs, and prescriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
                <div className="space-y-4">
                  {patientTimeline.map((entry, index) => (
                    <TimelineStrip
                      key={entry.id}
                      entry={entry}
                      index={index}
                      icon={getTimelineIcon(entry.type)}
                      colorClass={getTimelineColor(entry.type)}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="self-report" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Home Vitals</CardTitle>
              <CardDescription>
                Enter your latest home readings to update your health record
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bp-sys" className="text-xs">
                    Blood Pressure (Systolic)
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input
                      id="bp-sys"
                      type="number"
                      placeholder="120"
                      value={bpSystolic}
                      onChange={(e) => setBpSystolic(e.target.value)}
                    />
                    <span className="text-xs text-slate-400">mmHg</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bp-dia" className="text-xs">
                    Blood Pressure (Diastolic)
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input
                      id="bp-dia"
                      type="number"
                      placeholder="80"
                      value={bpDiastolic}
                      onChange={(e) => setBpDiastolic(e.target.value)}
                    />
                    <span className="text-xs text-slate-400">mmHg</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sugar" className="text-xs">
                    Blood Sugar (Fasting)
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input
                      id="sugar"
                      type="number"
                      placeholder="100"
                      value={sugarLevel}
                      onChange={(e) => setSugarLevel(e.target.value)}
                    />
                    <span className="text-xs text-slate-400">mg/dL</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="temp" className="text-xs">
                    Temperature
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input
                      id="temp"
                      type="number"
                      step="0.1"
                      placeholder="98.6"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                    />
                    <span className="text-xs text-slate-400">°F</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="weight" className="text-xs">
                    Weight
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="72"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                    <span className="text-xs text-slate-400">kg</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="symptoms" className="text-xs">
                  Recent Symptoms
                </Label>
                <Textarea
                  id="symptoms"
                  placeholder="e.g., Headache since morning, mild chest discomfort, dizziness..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSubmitVitals}
              >
                <Activity className="mr-2 h-4 w-4" />
                Submit Vitals to Record
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
