"use client";

import {
  ArrowRight,
  Building2,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

const accessCards = [
  {
    role: "doctor-clinical" as const,
    title: "Doctor",
    description: "Review patient history, triage insights, and clinical summaries.",
    icon: Stethoscope,
    accent: "from-orange-500 to-orange-600",
  },
  {
    role: "lab-portal" as const,
    title: "Hospital",
    description: "Manage diagnostics, lab reports, and the patient intake kiosk.",
    icon: Building2,
    accent: "from-slate-700 to-blue-900",
  },
  {
    role: "patient-access" as const,
    title: "Patient",
    description: "Access your lifetime health record or create your patient profile.",
    icon: UserRound,
    accent: "from-green-700 to-emerald-800",
  },
];

export default function LandingPage() {
  const setRole = useAppStore((state) => state.setRole);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fffaf3] text-[#11213a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,153,51,0.24),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(19,136,8,0.16),transparent_30%),linear-gradient(135deg,#fffaf3,#f7fbff_52%,#f4fbf5)]" />
      <div className="absolute -left-24 top-1/2 h-72 w-72 animate-pulse rounded-full bg-orange-400/10 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-96 w-96 animate-pulse rounded-full bg-green-600/10 blur-3xl [animation-delay:700ms]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-7 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
              <HeartPulse className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">Sanjeevani</div>
              <div className="text-xs text-[#5b6476]">Connected care, one record</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-[#1f3963]/10 bg-white/70 px-4 py-2 text-xs text-[#5b6476] shadow-sm sm:flex">
            <ShieldCheck className="h-4 w-4 text-green-700" />
            Secure national health workspace
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-center py-14">
          <div className="landing-rise max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-300/40 bg-orange-100/70 px-3 py-1.5 text-xs font-medium text-green-800">
              <Sparkles className="h-3.5 w-3.5 text-orange-500" />
              A calmer way to care
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[#1f3963] sm:text-6xl">
              Your health journey,
              <span className="block               bg-gradient-to-r from-orange-500 via-[#1f3963] to-green-700 bg-clip-text text-transparent">
                beautifully connected.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#5b6476] sm:text-lg">
              A unified workspace for patients, doctors, and hospitals to make every
              decision more informed and every interaction more human.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {accessCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.role}
                  onClick={() => setRole(card.role)}
                  className="landing-rise group rounded-3xl border border-[#1f3963]/10 bg-white/85 p-5 text-left shadow-xl shadow-[#1f3963]/10 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-orange-300 hover:bg-white"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className={`mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#1f3963]">{card.title} login</h2>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-[#5b6476]">{card.description}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-green-700">
                    Continue
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </main>

        <footer className="flex flex-col gap-2 border-t border-[#1f3963]/10 pt-5 text-xs text-[#5b6476] sm:flex-row sm:items-center sm:justify-between">
          <span>Designed for trusted, inclusive care delivery.</span>
          <span className="text-[#1f3963]/60">Sanjeevani · v1.0</span>
        </footer>
      </div>
    </div>
  );
}
