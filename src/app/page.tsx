"use client";

import { useAppStore } from "@/lib/store";
import TopNav from "@/components/TopNav";
import IdentityVerification from "@/components/IdentityVerification";
import PatientPortal from "@/components/PatientPortal";
import KioskMode from "@/components/KioskMode";
import LabPortal from "@/components/LabPortal";
import DoctorClinical from "@/components/DoctorClinical";
import DoctorPrescription from "@/components/DoctorPrescription";

export default function Home() {
  const { currentRole } = useAppStore();

  const renderView = () => {
    switch (currentRole) {
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
      default:
        return <PatientPortal />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main>{renderView()}</main>
      <IdentityVerification />
    </div>
  );
}
