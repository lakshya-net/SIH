"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import TopNav from "@/components/TopNav";
import IdentityVerification from "@/components/IdentityVerification";
import PatientPortal from "@/components/PatientPortal";
import KioskMode from "@/components/KioskMode";
import LabPortal from "@/components/LabPortal";
import DoctorClinical from "@/components/DoctorClinical";
import DoctorPrescription from "@/components/DoctorPrescription";
import PatientIntakeWizard from "@/components/PatientIntakeWizard";
import LandingPage from "@/components/LandingPage";
import PatientAccess from "@/components/PatientAccess";

export default function Home() {
  const { currentRole, loadPersistedState } = useAppStore();

  useEffect(() => {
    void loadPersistedState();
  }, [loadPersistedState]);

  const renderView = () => {
    switch (currentRole) {
      case "landing":
        return <LandingPage />;
      case "patient-access":
        return <PatientAccess />;
      case "patient-portal":
        return <PatientPortal />;
      case "kiosk-mode":
        return <KioskMode />;
      case "lab-portal":
        return <LabPortal />;
      case "doctor-clinical":
        return <DoctorClinical />;
      case "doctor-prescription":
        return <DoctorPrescription />;
      case "intake-registration":
        return <PatientIntakeWizard />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {currentRole !== "landing" && currentRole !== "patient-access" && currentRole !== "intake-registration" && <TopNav />}
      <main>{renderView()}</main>
      {currentRole !== "landing" && currentRole !== "patient-access" && currentRole !== "intake-registration" && <IdentityVerification />}
    </div>
  );
}
