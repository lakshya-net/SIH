"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck,
  Phone,
  CreditCard,
  CheckCircle2,
  Fingerprint,
  ArrowRight,
  Loader2,
} from "lucide-react";

type VerificationStep = "method" | "otp" | "success";

export default function IdentityVerification() {
  const {
    isVerificationOpen,
    setVerificationOpen,
    patients,
    setVerifiedPatientId,
  } = useAppStore();
  const { toast } = useToast();
  const [step, setStep] = useState<VerificationStep>("method");
  const [method, setMethod] = useState<"otp" | "national-id">("otp");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpInput, setOtpInput] = useState(["", "", "", "", "", ""]);
  const [nationalId, setNationalId] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(patients[0]);

  const handleSendOtp = () => {
    if (!phoneNumber) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      toast({
        title: "OTP Sent",
        description: `6-digit code sent to +91-${phoneNumber.replace(/(\d{2})(\d{0,4})/, "$1****$2")}`,
      });
    }, 1200);
  };

  const handleVerifyOtp = () => {
    const code = otpInput.join("");
    if (code.length !== 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("success");
      setVerifiedPatientId(selectedPatient.id);
      toast({
        title: "Identity Verified ✓",
        description: `Patient ${selectedPatient.name} (${selectedPatient.uniqueHealthId}) verified.`,
      });
    }, 1500);
  };

  const handleVerifyNationalId = () => {
    if (!nationalId || nationalId.length < 4) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("success");
      setVerifiedPatientId(selectedPatient.id);
      toast({
        title: "Identity Verified ✓",
        description: `Patient ${selectedPatient.name} (${selectedPatient.uniqueHealthId}) verified via National ID.`,
      });
    }, 1500);
  };

  const handleClose = () => {
    setVerificationOpen(false);
    setStep("method");
    setPhoneNumber("");
    setOtpInput(["", "", "", "", "", ""]);
    setNationalId("");
  };

  return (
    <Dialog open={isVerificationOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Patient Identity Verification
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            {step === "method" &&
              "Select verification method to onboard patient"}
            {step === "otp" && "Enter the 6-digit OTP sent to your mobile"}
            {step === "success" && "Verification complete"}
          </DialogDescription>
        </DialogHeader>

        {/* Patient Selection */}
        {step === "method" && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-slate-500">Select Patient</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {patients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className={`rounded-sm border border-slate-300 p-3 text-left text-sm transition-colors ${
                      selectedPatient.id === p.id
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-slate-400">
                      {p.uniqueHealthId}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-slate-500">
                Verification Method
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMethod("otp")}
                  className={`flex items-center gap-2 rounded-sm border border-slate-300 p-3 text-sm transition-colors ${
                    method === "otp"
                      ? "border-cyan-400 bg-cyan-50 text-cyan-700"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Mobile OTP</div>
                    <div className="text-xs opacity-60">SMS verification</div>
                  </div>
                </button>
                <button
                  onClick={() => setMethod("national-id")}
                  className={`flex items-center gap-2 rounded-sm border border-slate-300 p-3 text-sm transition-colors ${
                    method === "national-id"
                      ? "border-cyan-400 bg-cyan-50 text-cyan-700"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <div>
                    <div className="font-medium">National ID</div>
                    <div className="text-xs opacity-60">Aadhaar / Govt ID</div>
                  </div>
                </button>
              </div>
            </div>

            {method === "otp" ? (
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs text-slate-500">
                  Mobile Number
                </Label>
                <div className="flex gap-2">
                  <div className="flex items-center rounded-md border bg-slate-50 px-3 text-sm text-slate-500">
                    +91
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    className="flex-1"
                  />
                </div>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleSendOtp}
                  disabled={phoneNumber.length < 10 || loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Phone className="mr-2 h-4 w-4" />
                  )}
                  Send OTP
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="national-id" className="text-xs text-slate-500">
                  National ID Number
                </Label>
                <Input
                  id="national-id"
                  type="password"
                  placeholder="XXXX XXXX XXXX"
                  value={nationalId}
                  onChange={(e) =>
                    setNationalId(
                      e.target.value.replace(/\D/g, "").slice(0, 12),
                    )
                  }
                  autoComplete="off"
                />
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleVerifyNationalId}
                  disabled={nationalId.length < 4 || loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Fingerprint className="mr-2 h-4 w-4" />
                  )}
                  Verify with National ID
                </Button>
              </div>
            )}
          </div>
        )}

        {/* OTP Entry */}
        {step === "otp" && (
          <div className="space-y-4">
            <div className="rounded-sm border border-cyan-300 bg-cyan-50 p-3 text-center">
              <p className="text-sm text-cyan-700">
                Code sent to +91-
                {phoneNumber.replace(/(\d{2})(\d{0,4})/, "$1****$2")}
              </p>
            </div>
            <div className="flex justify-center gap-2">
              {otpInput.map((digit, i) => (
                <Input
                  key={i}
                  type="password"
                  maxLength={1}
                  className="h-12 w-10 text-center text-lg font-bold"
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    const newOtp = [...otpInput];
                    newOtp[i] = val;
                    setOtpInput(newOtp);
                    if (val && e.target.nextElementSibling) {
                      (e.target.nextElementSibling as HTMLInputElement).focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Backspace" &&
                      !otpInput[i] &&
                      e.currentTarget.previousElementSibling
                    ) {
                      (
                        e.currentTarget
                          .previousElementSibling as HTMLInputElement
                      ).focus();
                    }
                  }}
                />
              ))}
            </div>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={handleVerifyOtp}
              disabled={otpInput.join("").length !== 6 || loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Verify OTP
            </Button>
            <button
              className="text-sm text-cyan-600 hover:underline w-full text-center"
              onClick={() => {
                setStep("method");
                setOtpInput(["", "", "", "", "", ""]);
              }}
            >
              Change method
            </button>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-800">
                {selectedPatient.name}
              </p>
              <Badge
                variant="outline"
                className="mt-1 border-emerald-300 bg-emerald-50 text-emerald-700"
              >
                {selectedPatient.uniqueHealthId}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              Identity verified. Patient record loaded.
            </p>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={handleClose}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
