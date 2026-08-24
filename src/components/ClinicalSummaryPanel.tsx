"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ClinicalSummaryOutput,
  RiskAlert,
  RiskLevel,
  DrugInteraction,
  LabTrend,
  CareRecommendation,
} from "@/types/consultation";
import {
  Brain,
  AlertTriangle,
  AlertOctagon,
  Shield,
  Pill,
  FlaskConical,
  Activity,
  Heart,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
  Target,
  FileText,
  PillIcon,
  TrendingUp,
  TrendingDown,
  Minus,
  Siren,
  Syringe,
  RefreshCw,
  Lightbulb,
  Stethoscope,
  Dna,
  Download,
  Printer,
} from "lucide-react";

// ─── Risk Level Config ────────────────────────────────────────────
const RISK_CONFIG: Record<
  RiskLevel,
  {
    color: string;
    bg: string;
    border: string;
    icon: React.ElementType;
    label: string;
  }
> = {
  critical: {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-300",
    icon: AlertOctagon,
    label: "CRITICAL",
  },
  high: {
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-300",
    icon: AlertTriangle,
    label: "HIGH",
  },
  moderate: {
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-300",
    icon: AlertTriangle,
    label: "MODERATE",
  },
  low: {
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-300",
    icon: Info,
    label: "LOW",
  },
  informational: {
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    icon: Info,
    label: "INFO",
  },
};

const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  allergy: { icon: Shield, color: "text-red-500", label: "Allergy" },
  "drug-interaction": {
    icon: Pill,
    color: "text-purple-500",
    label: "Drug Interaction",
  },
  "chronic-flare": {
    icon: Activity,
    color: "text-orange-500",
    label: "Chronic Condition",
  },
  "lab-critical": {
    icon: FlaskConical,
    color: "text-red-500",
    label: "Lab Result",
  },
  "vital-abnormal": {
    icon: Heart,
    color: "text-rose-500",
    label: "Vital Signs",
  },
  "vaccination-gap": {
    icon: Syringe,
    color: "text-cyan-500",
    label: "Vaccination",
  },
  "surgical-history": {
    icon: Stethoscope,
    color: "text-violet-500",
    label: "Surgical",
  },
  polypharmacy: {
    icon: PillIcon,
    color: "text-amber-500",
    label: "Polypharmacy",
  },
};

// ─── Risk Score Gauge ─────────────────────────────────────────────
function RiskGauge({ score, level }: { score: number; level: RiskLevel }) {
  const config = RISK_CONFIG[level];
  const Icon = config.icon;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24 shrink-0">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-100"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn(
              "transition-all duration-1000",
              level === "critical" && "text-red-500",
              level === "high" && "text-orange-500",
              level === "moderate" && "text-amber-500",
              level === "low" && "text-blue-500",
              level === "informational" && "text-slate-400",
            )}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-slate-800">{score}</span>
          <span className="text-[9px] text-slate-400">/ 100</span>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <Icon className={cn("h-5 w-5", config.color)} />
          <span className={cn("text-sm font-bold", config.color)}>
            {config.label} RISK
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Composite score based on{" "}
          {score >= 50
            ? "multiple critical findings"
            : score >= 30
              ? "several concerning factors"
              : "overall clinical picture"}
          .
        </p>
      </div>
    </div>
  );
}

// ─── Risk Alert Card ──────────────────────────────────────────────
function RiskAlertCard({
  alert,
  isExpanded,
  onToggle,
}: {
  alert: RiskAlert;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const config = RISK_CONFIG[alert.level];
  const catConfig =
    CATEGORY_CONFIG[alert.category] || CATEGORY_CONFIG["chronic-flare"];
  const CatIcon = catConfig.icon;
  const LevelIcon = config.icon;

  return (
    <div
      className={cn(
        "rounded-lg border transition-all",
        config.border,
        config.bg,
      )}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            config.bg,
          )}
        >
          <LevelIcon className={cn("h-4 w-4", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] px-1.5 py-0 font-bold",
                config.border,
                config.color,
                config.bg,
              )}
            >
              {config.label}
            </Badge>
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 border-slate-200 text-slate-500"
            >
              <CatIcon className={cn("mr-0.5 h-2.5 w-2.5", catConfig.color)} />
              {catConfig.label}
            </Badge>
          </div>
          <h4 className={cn("text-xs font-semibold mt-1", config.color)}>
            {alert.title}
          </h4>
          {!isExpanded && (
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              {alert.description}
            </p>
          )}
        </div>
        <div className="shrink-0">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-white/50 px-3 pb-3 space-y-2">
          <p className="text-xs text-slate-600 leading-relaxed">
            {alert.description}
          </p>
          <div className="space-y-1">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">
              Evidence
            </div>
            {alert.evidence.map((e, i) => (
              <div
                key={i}
                className="flex items-start gap-1.5 text-[11px] text-slate-500"
              >
                <CheckCircle2 className="h-3 w-3 text-slate-300 shrink-0 mt-0.5" />
                {e}
              </div>
            ))}
          </div>
          <div
            className={cn(
              "rounded-md p-2 text-xs font-medium",
              config.bg,
              config.color,
            )}
          >
            <Zap className="inline h-3 w-3 mr-1" />
            {alert.actionRequired}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Drug Interaction Card ────────────────────────────────────────
function DrugInteractionCard({
  interaction,
}: {
  interaction: DrugInteraction;
}) {
  const severityConfig = {
    major: { color: "text-red-700", bg: "bg-red-50", border: "border-red-300" },
    moderate: {
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-300",
    },
    minor: {
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-300",
    },
  };
  const config = severityConfig[interaction.severity];

  return (
    <div className={cn("rounded-lg border p-3", config.border, config.bg)}>
      <div className="flex items-center gap-2 mb-2">
        <Badge
          variant="outline"
          className={cn(
            "text-[9px] px-1.5 py-0 font-bold",
            config.border,
            config.color,
          )}
        >
          {interaction.severity.toUpperCase()}
        </Badge>
        <span className="text-xs font-semibold text-slate-700">
          {interaction.drugA} + {interaction.drugB}
        </span>
      </div>
      <p className="text-[11px] text-slate-600 mb-2">
        {interaction.description}
      </p>
      <div className={cn("rounded-md p-2 text-[11px]", config.bg)}>
        <Lightbulb className={cn("inline h-3 w-3 mr-1", config.color)} />
        <span className={cn("font-medium", config.color)}>
          {interaction.recommendation}
        </span>
      </div>
    </div>
  );
}

// ─── Lab Trend Row ────────────────────────────────────────────────
function LabTrendRow({ trend }: { trend: LabTrend }) {
  const statusConfig = {
    normal: {
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    abnormal: {
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    critical: {
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    },
  };
  const config = statusConfig[trend.status];

  return (
    <div className={cn("rounded-lg border p-3", config.border, config.bg)}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-700">
          {trend.testName}
        </span>
        <Badge
          variant="outline"
          className={cn(
            "text-[9px] px-1.5 py-0 font-bold",
            config.border,
            config.color,
          )}
        >
          {trend.status.toUpperCase()}
        </Badge>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-1">
        <span className="font-mono font-medium text-slate-700">
          {trend.currentValue}
        </span>
        <span>Ref: {trend.referenceRange}</span>
        {trend.trend && (
          <span className="flex items-center gap-0.5">
            {trend.trend === "improving" ? (
              <TrendingDown className="h-3 w-3 text-emerald-500" />
            ) : trend.trend === "worsening" ? (
              <TrendingUp className="h-3 w-3 text-red-500" />
            ) : (
              <Minus className="h-3 w-3 text-slate-400" />
            )}
            {trend.trend}
          </span>
        )}
      </div>
      <p className="text-[11px] text-slate-500 italic">
        {trend.clinicalSignificance}
      </p>
    </div>
  );
}

// ─── Care Recommendation Card ─────────────────────────────────────
function CareRecommendationCard({ rec }: { rec: CareRecommendation }) {
  const categoryConfig = {
    medication: { icon: Pill, color: "text-purple-600", bg: "bg-purple-50" },
    diagnostic: {
      icon: FlaskConical,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    lifestyle: { icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
    referral: { icon: Stethoscope, color: "text-cyan-600", bg: "bg-cyan-50" },
    monitoring: { icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
  };
  const config = categoryConfig[rec.category] || categoryConfig.monitoring;
  const CatIcon = config.icon;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          config.bg,
        )}
      >
        <CatIcon className={cn("h-4 w-4", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="text-xs font-semibold text-slate-800">{rec.title}</h4>
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] px-1.5 py-0",
              rec.evidenceLevel === "strong"
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : rec.evidenceLevel === "moderate"
                  ? "border-amber-200 bg-amber-50 text-amber-600"
                  : "border-slate-200 bg-slate-50 text-slate-500",
            )}
          >
            {rec.evidenceLevel}
          </Badge>
        </div>
        <p className="text-[11px] text-slate-500">{rec.rationale}</p>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  count,
  color,
}: {
  icon: React.ElementType;
  title: string;
  count?: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className={cn("h-4 w-4", color)} />
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {count !== undefined && count > 0 && (
        <Badge className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0">
          {count}
        </Badge>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function ClinicalSummaryPanel({
  output,
  patientName,
  healthId,
}: {
  output: ClinicalSummaryOutput;
  patientName: string;
  healthId: string;
}) {
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const toggleAlert = (id: string) => {
    setExpandedAlerts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filter alerts
  const filteredAlerts =
    activeFilter === "all"
      ? output.riskAlerts
      : output.riskAlerts.filter((a) => a.level === activeFilter);

  const displayedAlerts = showAllAlerts
    ? filteredAlerts
    : filteredAlerts.slice(0, 5);

  const criticalCount = output.riskAlerts.filter(
    (a) => a.level === "critical",
  ).length;
  const highCount = output.riskAlerts.filter((a) => a.level === "high").length;
  const moderateCount = output.riskAlerts.filter(
    (a) => a.level === "moderate",
  ).length;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const lines: string[] = [];
    lines.push("=".repeat(70));
    lines.push("GovEHR — AI PRE-CONSULTATION CLINICAL SUMMARY");
    lines.push("=".repeat(70));
    lines.push("");
    lines.push(`Patient: ${patientName}`);
    lines.push(`Health ID: ${healthId}`);
    lines.push(`Generated: ${new Date(output.generatedAt).toLocaleString()}`);
    lines.push(
      `Risk Score: ${output.riskScore}/100 (${output.riskLevel.toUpperCase()})`,
    );
    lines.push("");
    lines.push("-".repeat(70));
    lines.push("CLINICAL BRIEF");
    lines.push("-".repeat(70));
    lines.push(output.clinicalBrief);
    lines.push("");

    if (output.riskAlerts.length > 0) {
      lines.push("-".repeat(70));
      lines.push(`RISK ALERTS (${output.riskAlerts.length})`);
      lines.push("-".repeat(70));
      output.riskAlerts.forEach((a, i) => {
        lines.push("");
        lines.push(`[${i + 1}] [${a.level.toUpperCase()}] ${a.title}`);
        lines.push(`    Category: ${a.category}`);
        lines.push(`    ${a.description}`);
        lines.push(`    Action: ${a.actionRequired}`);
      });
      lines.push("");
    }

    if (output.drugInteractions.length > 0) {
      lines.push("-".repeat(70));
      lines.push(`DRUG INTERACTIONS (${output.drugInteractions.length})`);
      lines.push("-".repeat(70));
      output.drugInteractions.forEach((d, i) => {
        lines.push("");
        lines.push(
          `[${i + 1}] [${d.severity.toUpperCase()}] ${d.drugA} + ${d.drugB}`,
        );
        lines.push(`    ${d.description}`);
        lines.push(`    Recommendation: ${d.recommendation}`);
      });
      lines.push("");
    }

    if (output.labTrends.length > 0) {
      lines.push("-".repeat(70));
      lines.push("LAB RESULTS ANALYSIS");
      lines.push("-".repeat(70));
      output.labTrends.forEach((l) => {
        lines.push(
          `  ${l.testName}: ${l.currentValue} [${l.status.toUpperCase()}] (Ref: ${l.referenceRange})`,
        );
        lines.push(`    ${l.clinicalSignificance}`);
      });
      lines.push("");
    }

    if (output.careRecommendations.length > 0) {
      lines.push("-".repeat(70));
      lines.push("CARE RECOMMENDATIONS");
      lines.push("-".repeat(70));
      output.careRecommendations.forEach((r, i) => {
        lines.push("");
        lines.push(
          `[${i + 1}] ${r.title} (${r.category}, evidence: ${r.evidenceLevel})`,
        );
        lines.push(`    ${r.rationale}`);
      });
    }

    lines.push("");
    lines.push("=".repeat(70));
    lines.push("Generated by GovEHR AI Triage Engine v1.0");
    lines.push("=".repeat(70));

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clinical-summary-${healthId}-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5" id="clinical-summary-panel">
      {/* ─── AI Summary Banner ──────────────────────────────────── */}
      <Card className="border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-emerald-50">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white">
              <Brain className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h2 className="text-sm font-bold text-cyan-800">
                  AI Pre-Consultation Clinical Summary
                </h2>
                <Badge
                  variant="outline"
                  className="border-cyan-300 bg-cyan-50 text-cyan-700 text-[10px]"
                >
                  <RefreshCw className="mr-1 h-2.5 w-2.5" />
                  Auto-generated
                </Badge>
                <Badge
                  variant="outline"
                  className="border-slate-200 text-slate-400 text-[10px]"
                >
                  <Clock className="mr-1 h-2.5 w-2.5" />
                  {new Date(output.generatedAt).toLocaleTimeString()}
                </Badge>
                {/* Export buttons — hidden in print */}
                <div className="ml-auto flex items-center gap-1 print:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="h-6 gap-1 border-slate-200 text-slate-500 hover:bg-slate-50 text-[10px]"
                  >
                    <Printer className="h-3 w-3" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadText}
                    className="h-6 gap-1 border-slate-200 text-slate-500 hover:bg-slate-50 text-[10px]"
                  >
                    <Download className="h-3 w-3" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Patient strip inside banner */}
              <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  {patientName}
                </span>
                <span className="font-mono text-cyan-600">{healthId}</span>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {output.clinicalBrief}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Risk Score + Quick Stats ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Risk Gauge */}
        <Card className="md:col-span-1 border-slate-200">
          <CardContent className="p-4 flex items-center justify-center">
            <RiskGauge score={output.riskScore} level={output.riskLevel} />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
            <div className="text-xl font-bold text-red-600">
              {criticalCount}
            </div>
            <div className="text-[10px] text-red-500 font-medium">
              Critical Alerts
            </div>
          </div>
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-center">
            <div className="text-xl font-bold text-orange-600">{highCount}</div>
            <div className="text-[10px] text-orange-500 font-medium">
              High Risk
            </div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
            <div className="text-xl font-bold text-amber-600">
              {moderateCount}
            </div>
            <div className="text-[10px] text-amber-500 font-medium">
              Moderate
            </div>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-center">
            <div className="text-xl font-bold text-purple-600">
              {output.drugInteractions.length}
            </div>
            <div className="text-[10px] text-purple-500 font-medium">
              Drug Interactions
            </div>
          </div>
        </div>
      </div>

      {/* ─── Risk Alerts Section ────────────────────────────────── */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <SectionHeader
              icon={Siren}
              title="Risk Triage Alerts"
              count={output.riskAlerts.length}
              color="text-red-600"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: "all", label: "All", count: output.riskAlerts.length },
              { key: "critical", label: "Critical", count: criticalCount },
              { key: "high", label: "High", count: highCount },
              { key: "moderate", label: "Moderate", count: moderateCount },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-medium border transition-colors",
                  activeFilter === filter.key
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300",
                )}
              >
                {filter.label}
                {filter.count > 0 && (
                  <span className="ml-1">{filter.count}</span>
                )}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {displayedAlerts.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <CheckCircle2 className="mx-auto h-6 w-6 mb-2 text-emerald-400" />
              <p className="text-sm">No alerts in this category</p>
            </div>
          ) : (
            displayedAlerts.map((alert) => (
              <RiskAlertCard
                key={alert.id}
                alert={alert}
                isExpanded={expandedAlerts.has(alert.id)}
                onToggle={() => toggleAlert(alert.id)}
              />
            ))
          )}

          {filteredAlerts.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllAlerts(!showAllAlerts)}
              className="w-full text-xs text-slate-500"
            >
              {showAllAlerts ? (
                <>
                  <ChevronUp className="mr-1 h-3 w-3" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-3 w-3" />
                  Show all {filteredAlerts.length} alerts
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ─── Drug Interactions Section ──────────────────────────── */}
      {output.drugInteractions.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <SectionHeader
              icon={Dna}
              title="Drug Interaction Analysis"
              count={output.drugInteractions.length}
              color="text-purple-600"
            />
          </CardHeader>
          <CardContent className="space-y-2">
            {output.drugInteractions.map((interaction, idx) => (
              <DrugInteractionCard key={idx} interaction={interaction} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* ─── Lab Trends Section ─────────────────────────────────── */}
      {output.labTrends.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <SectionHeader
              icon={FlaskConical}
              title="Lab Results Analysis"
              count={output.labTrends.length}
              color="text-violet-600"
            />
          </CardHeader>
          <CardContent className="space-y-2">
            {output.labTrends.map((trend, idx) => (
              <LabTrendRow key={idx} trend={trend} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* ─── Care Recommendations Section ───────────────────────── */}
      {output.careRecommendations.length > 0 && (
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white">
          <CardHeader className="pb-3">
            <SectionHeader
              icon={Target}
              title="Care Recommendations"
              count={output.careRecommendations.length}
              color="text-emerald-600"
            />
            <CardDescription className="text-xs">
              Prioritized action items based on clinical analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {output.careRecommendations.map((rec, idx) => (
              <CareRecommendationCard key={idx} rec={rec} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* ─── Polypharmacy Warning Banner ────────────────────────── */}
      {output.polypharmacyWarning && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-200 text-amber-700">
                <PillIcon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-800">
                  Polypharmacy Alert
                </h4>
                <p className="text-[11px] text-amber-700">
                  Patient is on 5+ concurrent medications. Review for
                  therapeutic duplication, appropriateness, and deprescribing
                  opportunities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Footer Timestamp ───────────────────────────────────── */}
      <div className="text-center text-[10px] text-slate-300">
        <FileText className="inline h-3 w-3 mr-1" />
        Generated by GovEHR AI Triage Engine v1.0 —{" "}
        {new Date(output.generatedAt).toLocaleString()}
      </div>
    </div>
  );
}
