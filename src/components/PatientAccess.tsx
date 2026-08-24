"use client";

import { ArrowLeft, LogIn, UserPlus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

export default function PatientAccess() {
  const { patients, selectedPatientId, setRole, setSelectedPatientId } = useAppStore();
  const savedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? patients[0];

  const handleLogin = () => {
    if (savedPatient) setSelectedPatientId(savedPatient.id);
    setRole("patient-portal");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-green-50 px-5 py-10">
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-green-300/20 blur-3xl" />
      <div className="landing-rise relative w-full max-w-md">
        <button
          onClick={() => setRole("landing")}
          className="mb-6 flex items-center gap-2 text-sm text-slate-500 transition hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </button>
        <div className="rounded-3xl border border-white/80 bg-white/80 p-7 shadow-2xl shadow-indigo-200/40 backdrop-blur-xl sm:p-9">
          <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-green-700 text-white shadow-lg shadow-orange-200">
            <UserRound className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome to your health space</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Choose how you would like to continue. Your saved record stays available across visits.
          </p>
          <div className="mt-8 space-y-3">
            <Button onClick={handleLogin} className="h-12 w-full justify-between rounded-xl bg-[#1f3963] px-4 text-white shadow-lg shadow-slate-300 hover:bg-[#162b4b]">
              <span className="flex items-center gap-3"><LogIn className="h-4 w-4" /> Login to patient portal</span>
              <span className="text-xs text-slate-200">{savedPatient ? savedPatient.name : "Saved data"}</span>
            </Button>
            <Button onClick={() => setRole("intake-registration")} variant="outline" className="h-12 w-full justify-start gap-3 rounded-xl border-orange-200 bg-orange-50/70 text-green-800 hover:bg-orange-100">
              <UserPlus className="h-4 w-4" /> Register as a new patient
            </Button>
          </div>
          {!savedPatient && <p className="mt-4 text-center text-xs text-slate-400">No saved patient record yet. You can register below.</p>}
        </div>
      </div>
    </div>
  );
}
