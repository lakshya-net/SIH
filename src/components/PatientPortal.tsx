"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";

export default function PatientPortal() {
  const { patients, selectedPatientId, timeline, submitSelfReport } = useAppStore();
  const { toast } = useToast();
  const patient = patients.find((p) => p.id === selectedPatientId) ?? patients[0];

  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [sugarLevel, setSugarLevel] = useState("");
  const [temperature, setTemperature] = useState("");
  const [weight, setWeight] = useState("");
  const [symptoms, setSymptoms] = useState("");

  const patientTimeline = timeline.filter((t) => t.patientId === patient.id);

  const handleSubmitVitals = () => {
    if (!bpSystolic || !bpDiastolic || !sugarLevel) {
      toast({ title: "Missing Fields", description: "Please enter blood pressure and sugar level.", variant: "destructive" });
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
    toast({ title: "Vitals Submitted ✓", description: "Your home vitals have been recorded in your lifetime record." });
    setBpSystolic(""); setBpDiastolic(""); setSugarLevel(""); setTemperature(""); setWeight(""); setSymptoms("");
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "Visit": return <Stethoscope className="h-4 w-4" />;
      case "Lab": return <FlaskConical className="h-4 w-4" />;
      case "Prescription": return <Pill className="h-4 w-4" />;
      case "Self-Report": return <ClipboardList className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTimelineColor = (type: string) => {
    switch (type) {
      case "Visit": return "bg-cyan-100 text-cyan-700 border-cyan-300";
      case "Lab": return "bg-violet-100 text-violet-700 border-violet-300";
      case "Prescription": return "bg-amber-100 text-amber-700 border-amber-300";
      case "Self-Report": return "bg-emerald-100 text-emerald-700 border-emerald-300";
      default: return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      {/* Patient Header Card */}
      <Card className="border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-cyan-50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <User className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{patient.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 font-mono text-xs">
                    <Shield className="mr-1 h-3 w-3" />
                    {patient.uniqueHealthId}
                  </Badge>
                  <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
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
              <div className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {patient.phone}
              </div>
              <div className="text-xs text-slate-400">{patient.address}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Allergies & Chronic Conditions
              </div>
              <div className="flex flex-wrap gap-1">
                {patient.allergies.map((a) => (
                  <Badge key={a} variant="outline" className="border-red-300 bg-red-50 text-red-600 text-xs">{a}</Badge>
                ))}
                {patient.chronicConditions.map((c) => (
                  <Badge key={c} variant="outline" className="border-amber-300 bg-amber-50 text-amber-600 text-xs">{c}</Badge>
                ))}
              </div>
            </div>
            <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1">
                <Phone className="h-3.5 w-3.5" />
                Emergency Contacts
              </div>
              {patient.emergencyContacts.map((ec) => (
                <div key={ec.name} className="text-xs text-slate-500">
                  <span className="font-medium">{ec.name}</span> ({ec.relation}) — {ec.phone}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="timeline" className="w-full">
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

        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lifetime Health Timeline</CardTitle>
              <CardDescription>Chronological view of all visits, labs, and prescriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
                <div className="space-y-4">
                  {patientTimeline.map((entry) => (
                    <div key={entry.id} className="relative flex gap-4">
                      <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${getTimelineColor(entry.type)}`}>
                        {getTimelineIcon(entry.type)}
                      </div>
                      <div className="flex-1 rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-800">{entry.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{entry.description}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Calendar className="h-3 w-3" />
                            {entry.date}
                          </div>
                        </div>
                        {entry.doctorName && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-cyan-600">
                            <Heart className="h-3 w-3" />
                            {entry.doctorName}
                          </div>
                        )}
                      </div>
                    </div>
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
              <CardDescription>Enter your latest home readings to update your health record</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bp-sys" className="text-xs">Blood Pressure (Systolic)</Label>
                  <div className="flex items-center gap-1">
                    <Input id="bp-sys" type="number" placeholder="120" value={bpSystolic} onChange={(e) => setBpSystolic(e.target.value)} />
                    <span className="text-xs text-slate-400">mmHg</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bp-dia" className="text-xs">Blood Pressure (Diastolic)</Label>
                  <div className="flex items-center gap-1">
                    <Input id="bp-dia" type="number" placeholder="80" value={bpDiastolic} onChange={(e) => setBpDiastolic(e.target.value)} />
                    <span className="text-xs text-slate-400">mmHg</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sugar" className="text-xs">Blood Sugar (Fasting)</Label>
                  <div className="flex items-center gap-1">
                    <Input id="sugar" type="number" placeholder="100" value={sugarLevel} onChange={(e) => setSugarLevel(e.target.value)} />
                    <span className="text-xs text-slate-400">mg/dL</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="temp" className="text-xs">Temperature</Label>
                  <div className="flex items-center gap-1">
                    <Input id="temp" type="number" step="0.1" placeholder="98.6" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
                    <span className="text-xs text-slate-400">°F</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="weight" className="text-xs">Weight</Label>
                  <div className="flex items-center gap-1">
                    <Input id="weight" type="number" step="0.1" placeholder="72" value={weight} onChange={(e) => setWeight(e.target.value)} />
                    <span className="text-xs text-slate-400">kg</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="symptoms" className="text-xs">Recent Symptoms</Label>
                <Textarea id="symptoms" placeholder="e.g., Headache since morning, mild chest discomfort, dizziness..." value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={3} />
              </div>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleSubmitVitals}>
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
