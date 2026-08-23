export interface VaccineRecord {
  id: string;
  vaccineName: string;
  doseNumber: string; // e.g., "Dose 1", "Booster"
  administeredDate: string;
  hospitalOrFacility?: string;
  batchNumber?: string;
}

export interface SurgeryRecord {
  id: string;
  procedureName: string;
  operatingHospital: string;
  yearOfProcedure: string;
  surgeonName?: string;
  complicationsOrNotes?: string;
}

export interface ActiveMedication {
  id: string;
  drugName: string;
  dosage: string; // e.g., "500mg", "10 units"
  frequency: string; // e.g., "Once daily after food (OD)"
  prescribedFor: string; // e.g., "Hypertension"
  startDate?: string;
}

export interface ChronicCondition {
  conditionName: string; // e.g., "Type 2 Diabetes", "Hypertension", "Thyroid"
  diagnosedYear: string;
  status: 'active' | 'managed' | 'resolved';
  latestMetrics?: string; // e.g., "BP 130/85", "HbA1c 7.1%"
}

export interface AllergyRecord {
  allergen: string;
  allergyType: 'drug' | 'food' | 'environmental' | 'other';
  severity: 'mild' | 'moderate' | 'severe / anaphylactic';
  reactionDescription?: string;
}

export interface LifestyleMetrics {
  smokingStatus: 'never' | 'former' | 'current';
  alcoholUse: 'none' | 'occasional' | 'regular';
}

export interface BasicInfo {
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  phone: string;
  email?: string;
  address?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation?: string;
}

export interface FullPatientProfile {
  healthId: string;
  basicInfo: BasicInfo;
  chronicConditions: ChronicCondition[];
  allergies: AllergyRecord[];
  surgeries: SurgeryRecord[];
  vaccinations: VaccineRecord[];
  activeMedications: ActiveMedication[];
  lifestyleMetrics?: LifestyleMetrics;
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const COMMON_CONDITIONS = [
  'Type 2 Diabetes',
  'Type 1 Diabetes',
  'Hypertension',
  'Hypothyroidism',
  'Hyperthyroidism',
  'Asthma',
  'COPD',
  'Heart Disease',
  'Chronic Kidney Disease',
  'Arthritis',
  'Obesity',
  'Epilepsy',
  'Depression',
  'Anemia',
  'GERD',
] as const;

export const COMMON_VACCINES = [
  'COVID-19 (Covishield)',
  'COVID-19 (Covaxin)',
  'COVID-19 (mRNA)',
  'Influenza (Flu)',
  'Hepatitis B',
  'Hepatitis A',
  'Tetanus (Td/Tdap)',
  'MMR',
  'Polio (IPV)',
  'Typhoid',
  'Japanese Encephalitis',
  'Rabies',
  'HPV',
  'Pneumococcal',
  'Meningococcal',
  'Yellow Fever',
] as const;

export const COMMON_ALLERGENS = [
  'Penicillin',
  'Amoxicillin',
  'Sulfa drugs',
  'Aspirin',
  'Ibuprofen',
  'Codeine',
  'Morphine',
  'Latex',
  'Peanuts',
  'Tree Nuts',
  'Shellfish',
  'Eggs',
  'Milk',
  'Soy',
  'Wheat',
  'Pollen',
  'Dust Mites',
  'Pet Dander',
  'Mold',
  'Bee Stings',
] as const;

export const COMMON_MEDICATIONS = [
  'Metformin',
  'Glimepiride',
  'Insulin',
  'Amlodipine',
  'Losartan',
  'Enalapril',
  'Atenolol',
  'Metoprolol',
  'Hydrochlorothiazide',
  'Atorvastatin',
  'Rosuvastatin',
  'Omeprazole',
  'Pantoprazole',
  'Levothyroxine',
  'Warfarin',
  'Aspirin',
  'Clopidogrel',
  'Salbutamol Inhaler',
  'Budesonide Inhaler',
  'Prednisolone',
  'Cetirizine',
  'Montelukast',
  'Paracetamol',
  'Ibuprofen',
  'Azithromycin',
  'Amoxicillin',
] as const;

export const FREQUENCY_OPTIONS = [
  'Once daily (OD)',
  'Twice daily (BD)',
  'Three times daily (TDS)',
  'Four times daily (QDS)',
  'Once weekly',
  'As needed (PRN)',
  'Before meals',
  'After meals',
  'At bedtime',
  'Every 8 hours',
  'Every 12 hours',
] as const;

export const INITIAL_PATIENT_PROFILE: FullPatientProfile = {
  healthId: '',
  basicInfo: {
    fullName: '',
    dob: '',
    gender: 'Male',
    bloodGroup: '',
    phone: '',
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
  },
  chronicConditions: [],
  allergies: [],
  surgeries: [],
  vaccinations: [],
  activeMedications: [],
  lifestyleMetrics: {
    smokingStatus: 'never',
    alcoholUse: 'none',
  },
};
