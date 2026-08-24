"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { I18nProvider } from "@/lib/i18n";
import TopNav from "@/components/TopNav";
import IdentityVerification from "@/components/IdentityVerification";
import PatientPortal from "@/components/PatientPortal";
import KioskMode from "@/components/KioskMode";
import LabPortal from "@/components/LabPortal";
import DoctorClinical from "@/components/DoctorClinical";
import DoctorPrescription from "@/components/DoctorPrescription";
import PatientIntakeWizard from "@/components/PatientIntakeWizard";
<<<<<<< HEAD
import DomTranslator from "@/components/DomTranslator";
=======
import LandingPage from "@/components/LandingPage";
import PatientAccess from "@/components/PatientAccess";
>>>>>>> 51467903d403dda401975ca061b87a102aa33a54

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
        return <div data-no-translate=""><LabPortal /></div>;
      case "doctor-clinical":
        return <div data-no-translate=""><DoctorClinical /></div>;
      case "doctor-prescription":
        return <div data-no-translate=""><DoctorPrescription /></div>;
      case "intake-registration":
        return <PatientIntakeWizard />;
      default:
        return <LandingPage />;
    }
  };

  return (
<<<<<<< HEAD
    <I18nProvider>
      <div className="min-h-screen bg-background">
        <DomTranslator />
        <TopNav />
        <main>{renderView()}</main>
        <IdentityVerification />
      </div>
    </I18nProvider>
=======
    <div className="min-h-screen bg-background">
      {currentRole !== "landing" && currentRole !== "patient-access" && currentRole !== "intake-registration" && <TopNav />}
      <main>{renderView()}</main>
      {currentRole !== "landing" && currentRole !== "patient-access" && currentRole !== "intake-registration" && <IdentityVerification />}
    </div>
>>>>>>> 51467903d403dda401975ca061b87a102aa33a54
  );
}
