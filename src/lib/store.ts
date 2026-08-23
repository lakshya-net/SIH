import { create } from "zustand";
import {
  AppRole,
  Encounter,
  LabReport,
  Patient,
  Prescription,
  TimeLineEntry,
  Vitals,
  mockPatients,
  mockEncounters,
  mockLabReports,
  mockTimeline,
} from "./mockData";
import { ConsultationPayload, ClinicalSummaryOutput } from "@/types/consultation";
import { runTriageEngine } from "./triageEngine";

interface AppState {
  currentRole: AppRole;
  setRole: (role: AppRole) => void;

  isVerificationOpen: boolean;
  setVerificationOpen: (open: boolean) => void;
  verifiedPatientId: string | null;
  setVerifiedPatientId: (id: string | null) => void;

  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;

  patients: Patient[];
  encounters: Encounter[];
  labReports: LabReport[];
  timeline: TimeLineEntry[];

  activeEncounter: Encounter | null;
  setActiveEncounter: (encounter: Encounter | null) => void;

  selfReportVitals: Vitals | null;
  submitSelfReport: (vitals: Vitals) => void;

  labQueue: { patientId: string; name: string; hid: string; waitTime: string; status: string }[];

  prescriptions: Prescription[];
  addPrescription: (rx: Prescription) => void;
  removePrescription: (index: number) => void;
  updatePrescription: (index: number, rx: Prescription) => void;

  clinicalNotes: string;
  setClinicalNotes: (notes: string) => void;
  diagnosis: string;
  setDiagnosis: (d: string) => void;

  encounterSubmitted: boolean;
  submitEncounter: () => void;

  consultationPayload: ConsultationPayload | null;
  triageOutput: ClinicalSummaryOutput | null;
  setConsultationPayload: (payload: ConsultationPayload) => void;
  clearTriage: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentRole: "patient-portal",
  setRole: (role) => set({ currentRole: role }),

  isVerificationOpen: false,
  setVerificationOpen: (open) => set({ isVerificationOpen: open }),
  verifiedPatientId: null,
  setVerifiedPatientId: (id) => set({ verifiedPatientId: id }),

  selectedPatientId: "P001",
  setSelectedPatientId: (id) => set({ selectedPatientId: id }),

  patients: mockPatients,
  encounters: mockEncounters,
  labReports: mockLabReports,
  timeline: mockTimeline,

  activeEncounter: mockEncounters.find((e) => e.status === "Active" && e.patientId === "P001") ?? null,
  setActiveEncounter: (encounter) => set({ activeEncounter: encounter }),

  selfReportVitals: null,
  submitSelfReport: (vitals) =>
    set((state) => {
      const newEntry: TimeLineEntry = {
        id: `TL-${Date.now()}`,
        patientId: state.selectedPatientId,
        date: new Date().toISOString().split("T")[0],
        type: "Self-Report",
        title: "Home Vitals Report",
        description: `BP: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}, Sugar: ${vitals.sugarLevel} mg/dL. ${vitals.symptoms}`,
      };
      return {
        selfReportVitals: vitals,
        timeline: [newEntry, ...state.timeline],
      };
    }),

  labQueue: [
    { patientId: "P001", name: "Rajesh Kumar", hid: "HID-8842-X", waitTime: "12 min", status: "Waiting" },
    { patientId: "P002", name: "Sunita Devi", hid: "HID-3156-K", waitTime: "5 min", status: "In Progress" },
    { patientId: "P003", name: "Vikram Singh", hid: "HID-7891-M", waitTime: "22 min", status: "Waiting" },
    { patientId: "P004", name: "Ananya Patel", hid: "HID-2045-N", waitTime: "3 min", status: "Completed" },
  ],

  prescriptions: [],
  addPrescription: (rx) => set((state) => ({ prescriptions: [...state.prescriptions, rx] })),
  removePrescription: (index) =>
    set((state) => ({
      prescriptions: state.prescriptions.filter((_, i) => i !== index),
    })),
  updatePrescription: (index, rx) =>
    set((state) => ({
      prescriptions: state.prescriptions.map((p, i) => (i === index ? rx : p)),
    })),

  clinicalNotes: "",
  setClinicalNotes: (notes) => set({ clinicalNotes: notes }),
  diagnosis: "",
  setDiagnosis: (d) => set({ diagnosis: d }),

  encounterSubmitted: false,
  submitEncounter: () => set({ encounterSubmitted: true }),

  consultationPayload: null,
  triageOutput: null,
  setConsultationPayload: (payload) => {
    const output = runTriageEngine(payload);
    set({ consultationPayload: payload, triageOutput: output });
  },
  clearTriage: () => set({ consultationPayload: null, triageOutput: null }),
}));
