import { create } from "zustand";
import {
  AppRole,
  Encounter,
  LabReport,
  Patient,
  Prescription,
  TimeLineEntry,
  Vitals,
} from "./mockData";
import { ConsultationPayload, ClinicalSummaryOutput } from "@/types/consultation";
import { runTriageEngine } from "./triageEngine";
import type { FullPatientProfile } from "@/types/patientHistory";

export interface HealthUpdate {
  id: string;
  patientId: string;
  symptoms: string;
  medicalHistory: string;
  updatedAt: string;
}

export interface MedicalDocument {
  id: string;
  patientId: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  storageKey: string | null;
  uploadedAt: string;
}

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
  healthUpdates: HealthUpdate[];
  medicalDocuments: MedicalDocument[];
  databaseReady: boolean;
  loadPersistedState: () => Promise<void>;

  activeEncounter: Encounter | null;
  setActiveEncounter: (encounter: Encounter | null) => void;

  selfReportVitals: Vitals | null;
  submitSelfReport: (vitals: Vitals) => Promise<void>;
  saveHealthUpdate: (input: { symptoms: string; medicalHistory: string }) => Promise<void>;
  saveMedicalDocument: (file: File) => Promise<void>;
  recordIdentityVerification: (input: { method: "otp" | "national-id"; phone?: string; nationalId?: string }) => Promise<void>;
  registerKiosk: (input: { name: string; age?: number; complaint: string; duration?: string; language: string; transcript?: string }) => Promise<string | null>;
  submitLab: (input: { patientId: string; testName: string; results: LabReport["results"]; files?: { name: string; type?: string; size?: number }[] }) => Promise<void>;

  labQueue: {
    patientId: string;
    name: string;
    hid: string;
    waitTime: string;
    status: string;
  }[];
  updateLabQueueStatus: (patientId: string, status: string) => void;

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

  // OCR temporary UI state: holds the raw text extracted from the prescription
  // image so the doctor can review/edit it before committing. This is NOT used
  // as persistent medical storage — committed prescriptions go to the DB.
  ocrText: string;
  setOcrText: (text: string) => void;

  savePrescription: (input: { diagnosis: string; clinicalNotes: string; prescriptions: Prescription[] }) => Promise<void>;
  completeTreatment: (input: { diagnosis: string; clinicalNotes: string; prescriptions: Prescription[] }) => Promise<void>;

  registerPatient: (profile: FullPatientProfile) => Promise<{ patientId: string; healthId: string; name: string }>;

  consultationPayload: ConsultationPayload | null;
  triageOutput: ClinicalSummaryOutput | null;
  setConsultationPayload: (payload: ConsultationPayload) => void;
  clearTriage: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentRole: "landing",
  setRole: (role) => set({ currentRole: role }),

  isVerificationOpen: false,
  setVerificationOpen: (open) => set({ isVerificationOpen: open }),
  verifiedPatientId: null,
  setVerifiedPatientId: (id) => set({ verifiedPatientId: id }),

  selectedPatientId: "",
  setSelectedPatientId: (id) =>
    set((state) => ({
      selectedPatientId: id,
      activeEncounter: state.encounters.find((encounter) => encounter.patientId === id && encounter.status === "Active") ?? null,
    })),

  patients: [],
  encounters: [],
  labReports: [],
  timeline: [],
  healthUpdates: [],
  medicalDocuments: [],
  databaseReady: false,
  loadPersistedState: async () => {
    try {
      const response = await fetch("/api/state", { cache: "no-store" });
      if (!response.ok) return;
      const state = await response.json();
      const activeEncounter = state.encounters.find(
        (encounter: Encounter) => encounter.patientId === get().selectedPatientId && encounter.status === "Active",
      ) ?? null;
      set({ ...state, activeEncounter, databaseReady: true });
    } catch {
      // Fallback to empty state when database is not available
      console.warn("Database not available, using empty state");
    }
  },

  activeEncounter: null,
  setActiveEncounter: (encounter) => set({ activeEncounter: encounter }),

  selfReportVitals: null,
  submitSelfReport: async (vitals) => {
    const patientId = get().selectedPatientId;
    set((state) => {
      const newEntry: TimeLineEntry = {
        id: `TL-${Date.now()}`,
        patientId,
        date: new Date().toISOString().split("T")[0],
        type: "Self-Report",
        title: "Home Vitals Report",
        description: `BP: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}, Sugar: ${vitals.sugarLevel} mg/dL. ${vitals.symptoms}`,
      };
      return {
        selfReportVitals: vitals,
        timeline: [newEntry, ...state.timeline],
      };
    });
    try {
      await fetch("/api/self-report", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, vitals }),
      });
      await get().loadPersistedState();
    } catch { /* retain the optimistic entry */ }
  },
  saveHealthUpdate: async (input) => {
    const patientId = get().selectedPatientId;
    const response = await fetch("/api/health-updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, ...input }),
    });
    if (!response.ok) {
      throw new Error((await response.json()).error ?? "Unable to save health update");
    }
    await get().loadPersistedState();
  },
  saveMedicalDocument: async (input) => {
    const patientId = get().selectedPatientId;
    const formData = new FormData();
    formData.append("patientId", patientId);
    formData.append("file", input);
    const response = await fetch("/api/documents", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error((await response.json()).error ?? "Unable to save medical document");
    }
    await get().loadPersistedState();
  },

  recordIdentityVerification: async (input) => {
    const patientId = get().selectedPatientId;
    try {
      await fetch("/api/identity/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, patientId }),
      });
    } catch { /* verification UI remains usable offline */ }
  },

  registerKiosk: async (input) => {
    try {
      const response = await fetch("/api/kiosk/register", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
      });
      if (!response.ok) return null;
      const result = await response.json();
      await get().loadPersistedState();
      return result.patientId as string;
    } catch {
      return null;
    }
  },
  submitLab: async (input) => {
    const response = await fetch("/api/labs", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error((await response.json()).error ?? "Unable to save lab report");
    await get().loadPersistedState();
  },

  labQueue: [
    {
      patientId: "P001",
      name: "Rajesh Kumar",
      hid: "HID-8842-X",
      waitTime: "12 min",
      status: "Waiting",
    },
    {
      patientId: "P002",
      name: "Sunita Devi",
      hid: "HID-3156-K",
      waitTime: "5 min",
      status: "In Progress",
    },
    {
      patientId: "P003",
      name: "Vikram Singh",
      hid: "HID-7891-M",
      waitTime: "22 min",
      status: "Waiting",
    },
    {
      patientId: "P004",
      name: "Ananya Patel",
      hid: "HID-2045-N",
      waitTime: "3 min",
      status: "Completed",
    },
  ],
  updateLabQueueStatus: (patientId, status) =>
    set((state) => ({
      labQueue: state.labQueue.map((patient) =>
        patient.patientId === patientId ? { ...patient, status } : patient,
      ),
    })),

  prescriptions: [],
  addPrescription: (rx) =>
    set((state) => ({ prescriptions: [...state.prescriptions, rx] })),
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

  ocrText: "",
  setOcrText: (text) => set({ ocrText: text }),

  savePrescription: async (input) => {
    const patientId = get().selectedPatientId;
    const response = await fetch("/api/prescriptions/commit", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, patientId }),
    });
    if (!response.ok) throw new Error((await response.json()).error ?? "Unable to save prescription");
    await get().loadPersistedState();
  },
  completeTreatment: async (input) => {
    const patientId = get().selectedPatientId;
    const response = await fetch("/api/treatments/complete", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, patientId }),
    });
    if (!response.ok) throw new Error((await response.json()).error ?? "Unable to complete treatment");
    set({ encounterSubmitted: true });
    await get().loadPersistedState();
  },

  registerPatient: async (profile) => {
    const response = await fetch("/api/patients/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error ?? "Unable to register patient");
    }
    const result = await response.json();
    // Update store with newly registered patient
    set({
      selectedPatientId: result.patientId,
    });
    // Load the patient's data from database
    await get().loadPersistedState();
    set({ currentRole: "patient-portal" });
    return result;
  },

  consultationPayload: null,
  triageOutput: null,
  setConsultationPayload: (payload) => {
    const output = runTriageEngine(payload);
    set({ consultationPayload: payload, triageOutput: output });
  },
  clearTriage: () => set({ consultationPayload: null, triageOutput: null }),
}));
