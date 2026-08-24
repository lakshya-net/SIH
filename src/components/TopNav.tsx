"use client";

import {
  Users,
  Monitor,
  FlaskConical,
  Stethoscope,
  ClipboardList,
  ShieldCheck,
  ChevronDown,
  Heart,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/lib/store";
import { AppRole } from "@/lib/mockData";
import { LanguageDropdown } from "@/components/LanguageSwitcher";

const roles: { id: AppRole; label: string; icon: React.ElementType; description: string }[] = [
  { id: "patient-portal", label: "Patient Portal", icon: Users, description: "Digital Web Mode" },
  { id: "kiosk-mode", label: "Kiosk Mode", icon: Monitor, description: "Voice / Bilingual Intake" },
  { id: "lab-portal", label: "Hospital Lab", icon: FlaskConical, description: "Diagnostic Desk" },
  { id: "doctor-clinical", label: "Doctor Clinical", icon: Stethoscope, description: "AI-Assisted View" },
  { id: "doctor-prescription", label: "Doctor Rx", icon: ClipboardList, description: "Prescription Builder" },
  { id: "intake-registration", label: "Patient Intake", icon: FileText, description: "Lifetime Registration" },
];

export default function TopNav() {
  const { currentRole, setRole, setVerificationOpen } = useAppStore();
  const current = roles.find((r) => r.id === currentRole)!;
  const Icon = current.icon;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
        {/* Left: Branding */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
            <Heart className="h-4 w-4 text-white" fill="currentColor" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-bold tracking-tight text-slate-800">GovEHR</span>
            <span className="ml-1.5 text-xs text-slate-400">v1.0</span>
          </div>
        </div>

        {/* Center: Role Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{current.label}</span>
              <span className="hidden md:inline text-xs text-emerald-500 font-normal">
                {current.description}
              </span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-64">
            <DropdownMenuLabel className="text-xs text-slate-400 font-normal">
              Switch Role / View
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {roles.map((role) => {
              const RoleIcon = role.icon;
              const isActive = role.id === currentRole;
              return (
                <DropdownMenuItem
                  key={role.id}
                  onClick={() => setRole(role.id)}
                  className={`flex items-center gap-3 cursor-pointer ${
                    isActive ? "bg-emerald-50 text-emerald-700" : ""
                  }`}
                >
                  <RoleIcon className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{role.label}</div>
                    <div className="text-xs text-slate-400">{role.description}</div>
                  </div>
                  {isActive && (
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Right: Language Selector + Verification Button */}
        <div className="flex items-center gap-2">
          <LanguageDropdown />

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-cyan-200 text-cyan-600 hover:bg-cyan-50"
            onClick={() => setVerificationOpen(true)}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Verify Identity</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
