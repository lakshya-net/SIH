"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { LanguageButtonBar } from "@/components/LanguageSwitcher";
import {
  Mic,
  MicOff,
  Globe,
  User,
  CheckCircle2,
  Volume2,
} from "lucide-react";

export default function KioskMode() {
  const { toast } = useToast();
  const registerKiosk = useAppStore((state) => state.registerKiosk);
  const { language, t } = useI18n();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [formName, setFormName] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formComplaint, setFormComplaint] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Simulate voice transcription
  const simulateTranscription = useCallback(() => {
    const sampleTexts = [
      language === "hi"
        ? "मेरा नाम राजेश कुमार है। मैं 58 वर्ष का हूँ। मुझे पिछले तीन दिनों से सिरदर्द हो रहा है।"
        : language === "bn"
        ? "আমার নাম রাজেশ কুমার। আমি ৫৮ বছর বয়সী। গত তিন দিন ধরে মাথাব্যথা হচ্ছে।"
        : "My name is Rajesh Kumar. I am 58 years old. I have been having headaches for the past three days.",
    ];
    return sampleTexts[0];
  }, [language]);

  const startRecording = () => {
    setIsRecording(true);
    setTranscript("");

    // Simulate real-time transcription by adding words progressively
    const fullText = simulateTranscription();
    const words = fullText.split(" ");
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        setTranscript((prev) => (prev ? prev + " " : "") + words[currentIndex]);
        currentIndex++;

        // Auto-populate form fields based on transcript keywords
        const accumulated = words.slice(0, currentIndex).join(" ").toLowerCase();
        if (accumulated.includes("name") || accumulated.includes("नाम") || accumulated.includes("নাম")) {
          if (accumulated.includes("rajesh")) setFormName("Rajesh Kumar");
        }
        if (accumulated.includes("58") || accumulated.includes("वर्ष") || accumulated.includes("বছর")) {
          setFormAge("58");
        }
        if (accumulated.includes("headache") || accumulated.includes("सिरदर्द") || accumulated.includes("মাথাব্যথা")) {
          setFormComplaint("Recurring Headache");
        }
        if (accumulated.includes("three days") || accumulated.includes("तीन दिन") || accumulated.includes("তিন দিন")) {
          setFormDuration("3 Days");
        }
      } else {
        clearInterval(interval);
        setIsRecording(false);
      }
    }, 400);

    // Auto-stop after 8 seconds
    setTimeout(() => {
      clearInterval(interval);
      setIsRecording(false);
    }, 8000);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (!formName || !formComplaint) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    const patientId = await registerKiosk({
      name: formName, age: formAge ? Number(formAge) : undefined, complaint: formComplaint,
      duration: formDuration, language, transcript,
    });
    if (!patientId) {
      toast({ title: "Registration failed", description: "The registration could not be saved.", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "Registration Complete ✓", description: `${formName} has been registered successfully.` });
  };

  if (submitted) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-8">
        <div className="text-center space-y-6">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800">{t("registrationSuccess")}</h2>
            <p className="mt-2 text-lg text-slate-500">
              {t("pleaseWait")}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">{t("name")}:</span><span className="font-medium">{formName}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">{t("age")}:</span><span className="font-medium">{formAge}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">{t("primaryComplaint")}:</span><span className="font-medium">{formComplaint}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">{t("duration")}:</span><span className="font-medium">{formDuration}</span></div>
            </div>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setSubmitted(false);
              setFormName(""); setFormAge(""); setFormComplaint(""); setFormDuration(""); setTranscript("");
            }}
          >
            {t("registerAnother")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="mx-auto max-w-6xl p-6">
        {/* Language Selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-cyan-600" />
            <span className="text-sm font-medium text-slate-600">{t("selectLanguage")}</span>
          </div>
          <LanguageButtonBar />
        </div>

        {/* Welcome */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">{t("welcome")}</h1>
          <p className="mt-2 text-lg text-slate-500">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Voice Input Area */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-8 flex flex-col items-center">
              {/* Mic Button */}
              <div className="relative mb-8">
                {isRecording && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-ring" />
                    <div className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
                  </>
                )}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`relative z-10 flex h-32 w-32 items-center justify-center rounded-full transition-all duration-300 ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 mic-pulse"
                      : "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200 hover:scale-105"
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="h-12 w-12 text-white" />
                  ) : (
                    <Mic className="h-12 w-12 text-white" />
                  )}
                </button>
              </div>

              <p className={`text-xl font-semibold ${isRecording ? "text-red-500" : "text-emerald-600"}`}>
                {isRecording ? t("recording") : t("tapToSpeak")}
              </p>

              {/* Animated Wave Bars */}
              {isRecording && (
                <div className="flex items-end gap-1 h-10 mt-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-emerald-400 rounded-full wave-bar"
                      style={{
                        height: `${20 + Math.random() * 60}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              <Separator className="my-6" />

              {/* Live Transcription */}
              <div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-500">{t("liveTranscription")}</span>
                </div>
                <div className="min-h-[120px] w-full rounded-lg border border-slate-200 bg-slate-50 p-4">
                  {transcript ? (
                    <p className="text-base text-slate-700 leading-relaxed">{transcript}</p>
                  ) : (
                    <p className="text-sm text-slate-400 italic">
                      {t("tapMicHint")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right: Auto-populated Form */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-5 w-5 text-cyan-600" />
                <h2 className="text-lg font-semibold text-slate-800">{t("patientInfo")}</h2>
                <Badge variant="outline" className="ml-auto border-emerald-300 bg-emerald-50 text-emerald-700 text-xs">
                  {t("autoFilled")}
                </Badge>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-600">{t("name")}</Label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={t("placeholderFullName")}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-600">{t("age")}</Label>
                  <Input
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    placeholder={t("placeholderAge")}
                    type="number"
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-600">{t("primaryComplaint")}</Label>
                  <Input
                    value={formComplaint}
                    onChange={(e) => setFormComplaint(e.target.value)}
                    placeholder={t("placeholderComplaint")}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-600">{t("duration")}</Label>
                  <Input
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder={t("placeholderDuration")}
                    className="h-12 text-base"
                  />
                </div>
              </div>

              <Separator className="my-6" />

              <Button
                size="lg"
                className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSubmit}
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                {t("submit")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
