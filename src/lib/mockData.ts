export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface Patient {
  id: string;
  uniqueHealthId: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  bloodGroup: BloodGroup;
  phone: string;
  address: string;
  emergencyContacts: EmergencyContact[];
  allergies: string[];
  chronicConditions: string[];
}

export interface Vitals {
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  sugarLevel: number;
  temperature: number;
  weight: number;
  symptoms: string;
  recordedAt: string;
}

export interface LabTestResult {
  testName: string;
  value: number;
  unit: string;
  referenceRange: string;
  status: "Normal" | "High" | "Low" | "Critical";
}

export interface LabReport {
  id: string;
  patientId: string;
  testName: string;
  date: string;
  results: LabTestResult[];
  doctorId: string;
  filePath?: string;
}

export interface Prescription {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Encounter {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  status: "Active" | "Completed" | "Scheduled";
  diagnosis: string;
  clinicalNotes: string;
  prescriptions: Prescription[];
  vitals?: Vitals;
  labReports: string[]; // lab report IDs
}

export interface TimeLineEntry {
  id: string;
  patientId: string;
  date: string;
  type: "Visit" | "Lab" | "Prescription" | "Self-Report" | "Treatment Summary";
  title: string;
  description: string;
  doctorName?: string;
}

export type AppRole =
  | "landing"
  | "patient-access"
  | "patient-portal"
  | "kiosk-mode"
  | "lab-portal"
  | "doctor-clinical"
  | "doctor-prescription"
  | "intake-registration";

// Mock Patients
export const mockPatients: Patient[] = [
  {
    id: "P001",
    uniqueHealthId: "HID-8842-X",
    name: "Rajesh Kumar",
    age: 58,
    gender: "Male",
    bloodGroup: "B+",
    phone: "+91-98765-43210",
    address: "42 MG Road, Jaipur, Rajasthan 302001",
    emergencyContacts: [
      { name: "Priya Kumar", phone: "+91-98765-43211", relation: "Wife" },
      { name: "Amit Kumar", phone: "+91-98765-43212", relation: "Son" },
    ],
    allergies: ["Penicillin", "Sulfa drugs"],
    chronicConditions: ["Type 2 Diabetes", "Hypertension"],
  },
  {
    id: "P002",
    uniqueHealthId: "HID-3156-K",
    name: "Sunita Devi",
    age: 42,
    gender: "Female",
    bloodGroup: "O+",
    phone: "+91-98765-54321",
    address: "18 Civil Lines, Lucknow, UP 226001",
    emergencyContacts: [
      { name: "Vikram Devi", phone: "+91-98765-54322", relation: "Husband" },
    ],
    allergies: [],
    chronicConditions: ["Asthma"],
  },
];

// Mock Lab Reports
export const mockLabReports: LabReport[] = [
  {
    id: "LAB001",
    patientId: "P001",
    testName: "Comprehensive Metabolic Panel",
    date: "2026-08-20",
    doctorId: "D001",
    results: [
      { testName: "Glucose (Fasting)", value: 145, unit: "mg/dL", referenceRange: "70-100", status: "High" },
      { testName: "HbA1c", value: 8.2, unit: "%", referenceRange: "< 5.7", status: "Critical" },
      { testName: "Total Cholesterol", value: 228, unit: "mg/dL", referenceRange: "< 200", status: "High" },
      { testName: "HDL Cholesterol", value: 38, unit: "mg/dL", referenceRange: "> 40", status: "Low" },
      { testName: "LDL Cholesterol", value: 152, unit: "mg/dL", referenceRange: "< 100", status: "High" },
      { testName: "Creatinine", value: 1.1, unit: "mg/dL", referenceRange: "0.7-1.3", status: "Normal" },
      { testName: "BUN", value: 18, unit: "mg/dL", referenceRange: "7-20", status: "Normal" },
    ],
  },
  {
    id: "LAB002",
    patientId: "P001",
    testName: "CBC (Complete Blood Count)",
    date: "2026-08-18",
    doctorId: "D001",
    results: [
      { testName: "Hemoglobin", value: 13.2, unit: "g/dL", referenceRange: "13.5-17.5", status: "Low" },
      { testName: "WBC Count", value: 7800, unit: "/µL", referenceRange: "4000-11000", status: "Normal" },
      { testName: "Platelet Count", value: 245000, unit: "/µL", referenceRange: "150000-400000", status: "Normal" },
      { testName: "RBC Count", value: 4.5, unit: "million/µL", referenceRange: "4.5-5.5", status: "Normal" },
    ],
  },
  {
    id: "LAB003",
    patientId: "P002",
    testName: "Lipid Panel",
    date: "2026-08-19",
    doctorId: "D001",
    results: [
      { testName: "Total Cholesterol", value: 195, unit: "mg/dL", referenceRange: "< 200", status: "Normal" },
      { testName: "HDL Cholesterol", value: 55, unit: "mg/dL", referenceRange: "> 40", status: "Normal" },
      { testName: "LDL Cholesterol", value: 110, unit: "mg/dL", referenceRange: "< 100", status: "High" },
      { testName: "Triglycerides", value: 148, unit: "mg/dL", referenceRange: "< 150", status: "Normal" },
    ],
  },
];

// Mock Encounters
export const mockEncounters: Encounter[] = [
  {
    id: "ENC001",
    patientId: "P001",
    doctorId: "D001",
    date: "2026-08-23",
    status: "Active",
    diagnosis: "Poorly controlled Type 2 Diabetes with Hypertension",
    clinicalNotes:
      "Patient presents with elevated fasting glucose (145 mg/dL) and HbA1c 8.2%. Blood pressure 148/92 mmHg. Reports occasional dizziness and fatigue. Current medication regimen appears insufficient. Recommend adjusting metformin dosage and adding ACE inhibitor.",
    prescriptions: [],
    labReports: ["LAB001", "LAB002"],
  },
  {
    id: "ENC002",
    patientId: "P001",
    doctorId: "D001",
    date: "2026-07-15",
    status: "Completed",
    diagnosis: "Type 2 Diabetes - Routine Follow-up",
    clinicalNotes: "Routine quarterly check-up. HbA1c 7.8%. Blood sugar reasonably controlled. Continue current medication.",
    prescriptions: [
      { medicineName: "Metformin", dosage: "500mg", frequency: "BD", duration: "90 days" },
      { medicineName: "Amlodipine", dosage: "5mg", frequency: "OD", duration: "90 days" },
    ],
    labReports: [],
  },
  {
    id: "ENC003",
    patientId: "P002",
    doctorId: "D001",
    date: "2026-08-23",
    status: "Active",
    diagnosis: "Mild Asthma, Seasonal Allergy",
    clinicalNotes: "Patient reports increased wheezing over the past week due to seasonal changes. Lung function appears stable. Allergy symptoms present.",
    prescriptions: [],
    labReports: ["LAB003"],
  },
];

// Mock Timeline
export const mockTimeline: TimeLineEntry[] = [
  {
    id: "TL001",
    patientId: "P001",
    date: "2026-08-23",
    type: "Visit",
    title: "Active Consultation - Dr. Sharma",
    description: "Follow-up for Type 2 Diabetes and Hypertension management",
    doctorName: "Dr. Anita Sharma",
  },
  {
    id: "TL002",
    patientId: "P001",
    date: "2026-08-20",
    type: "Lab",
    title: "Comprehensive Metabolic Panel",
    description: "Fasting Glucose: 145 mg/dL (High), HbA1c: 8.2% (Critical), Cholesterol elevated",
  },
  {
    id: "TL003",
    patientId: "P001",
    date: "2026-08-18",
    type: "Lab",
    title: "CBC (Complete Blood Count)",
    description: "Hemoglobin slightly low (13.2 g/dL). All other parameters within normal range.",
  },
  {
    id: "TL004",
    patientId: "P001",
    date: "2026-07-15",
    type: "Visit",
    title: "Quarterly Follow-up - Dr. Sharma",
    description: "HbA1c 7.8%. Blood sugar reasonably controlled. Medications continued.",
    doctorName: "Dr. Anita Sharma",
  },
  {
    id: "TL005",
    patientId: "P001",
    date: "2026-07-15",
    type: "Prescription",
    title: "Prescription Renewed",
    description: "Metformin 500mg BD, Amlodipine 5mg OD for 90 days",
  },
  {
    id: "TL006",
    patientId: "P001",
    date: "2026-06-10",
    type: "Lab",
    title: "HbA1c Test",
    description: "HbA1c: 7.8%. Improvement from previous 8.5%.",
  },
  {
    id: "TL007",
    patientId: "P001",
    date: "2026-05-20",
    type: "Self-Report",
    title: "Home Vitals Report",
    description: "BP: 142/88, Sugar: 138 mg/dL. Mild headache reported.",
  },
  {
    id: "TL008",
    patientId: "P001",
    date: "2026-04-12",
    type: "Visit",
    title: "Initial Consultation - Dr. Sharma",
    description: "Diagnosed with Type 2 Diabetes and Hypertension. Started on Metformin and Amlodipine.",
    doctorName: "Dr. Anita Sharma",
  },
  {
    id: "TL009",
    patientId: "P002",
    date: "2026-08-23",
    type: "Visit",
    title: "Asthma Follow-up - Dr. Sharma",
    description: "Seasonal asthma exacerbation. Adjusting inhaler dosage.",
    doctorName: "Dr. Anita Sharma",
  },
  {
    id: "TL010",
    patientId: "P002",
    date: "2026-08-19",
    type: "Lab",
    title: "Lipid Panel",
    description: "LDL slightly elevated at 110 mg/dL. All other parameters normal.",
  },
];

// Kiosk translations
export const kioskTranslations: Record<string, Record<string, string>> = {
  en: {
    welcome: "Welcome to Health Portal",
    tapToSpeak: "Tap to Speak",
    language: "Language",
    name: "Name",
    age: "Age",
    primaryComplaint: "Primary Complaint",
    duration: "Duration",
    recording: "Recording...",
    submit: "Submit Registration",
    subtitle: "Speak your details for quick registration",
    patientInfo: "Patient Information",
    liveTranscription: "Live Transcription",
    selectLanguage: "Select Language",
  },
  hi: {
    welcome: "स्वास्थ्य पोर्टल में आपका स्वागत है",
    tapToSpeak: "बोलने के लिए टैप करें",
    language: "भाषा",
    name: "नाम",
    age: "आयु",
    primaryComplaint: "मुख्य शिकायत",
    duration: "अवधि",
    recording: "रिकॉर्डिंग...",
    submit: "पंजीकरण जमा करें",
    subtitle: "त्वरित पंजीकरण के लिए अपना विवरण बोलें",
    patientInfo: "रोगी जानकारी",
    liveTranscription: "लाइव ट्रांसक्रिप्शन",
    selectLanguage: "भाषा चुनें",
  },
  bn: {
    welcome: "স্বাস্থ্য পোর্টালে স্বাগতম",
    tapToSpeak: "কথা বলতে ট্যাপ করুন",
    language: "ভাষা",
    name: "নাম",
    age: "বয়স",
    primaryComplaint: "প্রাথমিক অভিযোগ",
    duration: "সময়কাল",
    recording: "রেকর্ডিং...",
    submit: "নিবন্ধন জমা দিন",
    subtitle: "দ্রুত নিবন্ধনের জন্য আপনার বিবরণ বলুন",
    patientInfo: "রোগীর তথ্য",
    liveTranscription: "লাইভ ট্রান্সক্রিপশন",
    selectLanguage: "ভাষা নির্বাচন করুন",
  },
};

// AI Summary for doctor view
export const aiSummary = {
  clinicalBrief:
    "58-year-old male with poorly controlled Type 2 Diabetes (HbA1c 8.2%) and Hypertension. Fasting glucose 145 mg/dL, trending upward from 7.8% three months ago. Lipid panel shows elevated total cholesterol (228) and LDL (152) with low HDL (38). Reports intermittent dizziness and fatigue. Current regimen of Metformin 500mg BD appears insufficient.",
  riskBadges: [
    { label: "Allergic to Penicillin", color: "red" as const },
    { label: "Allergic to Sulfa drugs", color: "red" as const },
    { label: "HbA1c > 8.0 - High Risk", color: "red" as const },
    { label: "LDL Elevated", color: "yellow" as const },
    { label: "BP Trending High", color: "yellow" as const },
  ],
  focusAreas: [
    "Review and adjust diabetes medication (HbA1c 8.2%)",
    "Blood pressure management - consider ACE inhibitor addition",
    "Lipid management - consider statin therapy",
    "Cardiovascular risk assessment",
    "Diet and lifestyle counseling referral",
    "Renal function monitoring (Creatinine 1.1 - monitor closely)",
  ],
};

// Queue for lab
export const mockQueue = [
  { patientId: "P001", name: "Rajesh Kumar", hid: "HID-8842-X", waitTime: "12 min", status: "Waiting" },
  { patientId: "P002", name: "Sunita Devi", hid: "HID-3156-K", waitTime: "5 min", status: "In Progress" },
  { patientId: "P003", name: "Vikram Singh", hid: "HID-7891-M", waitTime: "22 min", status: "Waiting" },
  { patientId: "P004", name: "Ananya Patel", hid: "HID-2045-N", waitTime: "3 min", status: "Completed" },
];
