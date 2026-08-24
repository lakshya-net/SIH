import "server-only";

import { Pool, type PoolClient } from "pg";
import {
  mockEncounters,
  mockLabReports,
  mockPatients,
  mockTimeline,
  type LabReport,
  type Patient,
  type Prescription,
  type TimeLineEntry,
  type Vitals,
} from "./mockData";
import { uploadDocument } from "./storage";
import type { FullPatientProfile, AllergyRecord, ChronicCondition } from "@/types/patientHistory";

const globalForDb = globalThis as unknown as {
  sanjeevaniPool?: Pool;
  sanjeevaniInitialization?: Promise<void>;
};

function getPool() {
  if (globalForDb.sanjeevaniPool) return globalForDb.sanjeevaniPool;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to connect to the Neon PostgreSQL database");
  }
  globalForDb.sanjeevaniPool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30_000,
  });
  return globalForDb.sanjeevaniPool;
}

const now = () => new Date().toISOString();
const parse = <T>(value: unknown, fallback: T): T => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
};

async function initializeDatabase() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY, unique_health_id TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
      age INTEGER NOT NULL, gender TEXT NOT NULL, blood_group TEXT NOT NULL, phone TEXT NOT NULL,
      address TEXT NOT NULL, emergency_contacts_json JSONB NOT NULL, allergies_json JSONB NOT NULL,
      chronic_conditions_json JSONB NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS encounters (
      id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES patients(id), doctor_id TEXT NOT NULL,
      date TEXT NOT NULL, status TEXT NOT NULL, diagnosis TEXT, clinical_notes TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS clinical_nodes (
      id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES patients(id),
      encounter_id TEXT REFERENCES encounters(id), node_type TEXT NOT NULL, title TEXT NOT NULL,
      description TEXT NOT NULL, payload_json JSONB, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS treatment_summaries (
      id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES patients(id),
      encounter_id TEXT NOT NULL REFERENCES encounters(id) UNIQUE, summary TEXT NOT NULL,
      diagnosis TEXT, key_findings_json JSONB NOT NULL, completed_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS vitals (
      id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES patients(id),
      encounter_id TEXT REFERENCES encounters(id), systolic DOUBLE PRECISION NOT NULL,
      diastolic DOUBLE PRECISION NOT NULL, sugar DOUBLE PRECISION NOT NULL,
      temperature DOUBLE PRECISION, weight DOUBLE PRECISION, symptoms TEXT, recorded_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS lab_reports (
      id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES patients(id),
      encounter_id TEXT REFERENCES encounters(id), test_name TEXT NOT NULL, report_date TEXT NOT NULL,
      doctor_id TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS lab_results (
      id TEXT PRIMARY KEY, report_id TEXT NOT NULL REFERENCES lab_reports(id) ON DELETE CASCADE,
      test_name TEXT NOT NULL, value DOUBLE PRECISION, value_text TEXT, unit TEXT NOT NULL,
      reference_range TEXT NOT NULL, status TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES patients(id),
      encounter_id TEXT REFERENCES encounters(id), medicine_name TEXT NOT NULL, dosage TEXT NOT NULL,
      frequency TEXT NOT NULL, duration TEXT NOT NULL, created_at TEXT NOT NULL,
      UNIQUE (encounter_id, medicine_name, dosage, frequency, duration)
    );
    CREATE TABLE IF NOT EXISTS identity_verifications (
      id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES patients(id),
      method TEXT NOT NULL, phone_last4 TEXT, national_id_hash TEXT, verified_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS kiosk_registrations (
      id TEXT PRIMARY KEY, patient_id TEXT REFERENCES patients(id), name TEXT NOT NULL,
      age INTEGER, complaint TEXT NOT NULL, duration TEXT, language TEXT NOT NULL,
      transcript TEXT, registered_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS document_metadata (
      id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES patients(id),
      encounter_id TEXT REFERENCES encounters(id), lab_report_id TEXT REFERENCES lab_reports(id),
      file_name TEXT NOT NULL, mime_type TEXT, size_bytes INTEGER, storage_key TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS health_updates (
      id TEXT PRIMARY KEY, patient_id TEXT NOT NULL REFERENCES patients(id),
      symptoms TEXT NOT NULL, medical_history TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_nodes_patient_date ON clinical_nodes(patient_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_labs_patient_date ON lab_reports(patient_id, report_date DESC);
    CREATE INDEX IF NOT EXISTS idx_health_updates_patient_date ON health_updates(patient_id, updated_at DESC);
  `);
  if (process.env.NODE_ENV !== "production") {
    await seed(pool);
  }
}

async function ensureDatabase() {
  if (!globalForDb.sanjeevaniInitialization) {
    globalForDb.sanjeevaniInitialization = initializeDatabase().catch((error) => {
      globalForDb.sanjeevaniInitialization = undefined;
      throw error;
    });
  }
  await globalForDb.sanjeevaniInitialization;
}

async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function seed(pool: Pool) {
  for (const patient of mockPatients) {
    await pool.query(
      `INSERT INTO patients
       (id, unique_health_id, name, age, gender, blood_group, phone, address,
        emergency_contacts_json, allergies_json, chronic_conditions_json, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12)
       ON CONFLICT (id) DO NOTHING`,
      [
        patient.id, patient.uniqueHealthId, patient.name, patient.age, patient.gender, patient.bloodGroup,
        patient.phone, patient.address, JSON.stringify(patient.emergencyContacts),
        JSON.stringify(patient.allergies), JSON.stringify(patient.chronicConditions), now(),
      ],
    );
  }

  for (const encounter of mockEncounters) {
    const compacted = encounter.status === "Completed";
    await pool.query(
      `INSERT INTO encounters (id,patient_id,doctor_id,date,status,diagnosis,clinical_notes,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
      [
        encounter.id, encounter.patientId, encounter.doctorId, encounter.date, encounter.status,
        compacted ? null : encounter.diagnosis, compacted ? null : encounter.clinicalNotes, now(),
      ],
    );
    if (!compacted) {
      for (const report of mockLabReports.filter((item) => encounter.labReports.includes(item.id))) {
        await pool.query(
          `INSERT INTO lab_reports (id,patient_id,encounter_id,test_name,report_date,doctor_id,created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
          [report.id, report.patientId, encounter.id, report.testName, report.date, report.doctorId || null, now()],
        );
        for (const result of report.results) {
          await pool.query(
            `INSERT INTO lab_results
             (id,report_id,test_name,value,unit,reference_range,status)
             VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
            [`${report.id}-${result.testName}`, report.id, result.testName, result.value,
              result.unit, result.referenceRange, result.status],
          );
        }
      }
    }
  }

  for (const entry of mockTimeline) {
    if (entry.id === "TL004" || entry.id === "TL005") continue;
    const encounter = mockEncounters.find((item) => item.patientId === entry.patientId && item.date === entry.date);
    await pool.query(
      `INSERT INTO clinical_nodes
       (id,patient_id,encounter_id,node_type,title,description,payload_json,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8) ON CONFLICT (id) DO NOTHING`,
      [
        entry.id, entry.patientId, encounter?.id ?? null, entry.type, entry.title, entry.description,
        JSON.stringify({ doctorName: entry.doctorName }), `${entry.date}T12:00:00.000Z`,
      ],
    );
  }

  for (const encounter of mockEncounters.filter((item) => item.status === "Completed")) {
    const summaryText = `${encounter.diagnosis}. ${encounter.clinicalNotes}`;
    await pool.query(
      `INSERT INTO treatment_summaries
       (id,patient_id,encounter_id,summary,diagnosis,key_findings_json,completed_at)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7) ON CONFLICT (id) DO NOTHING`,
      [
        `SUM-${encounter.id}`, encounter.patientId, encounter.id, summaryText, encounter.diagnosis,
        JSON.stringify({ prescriptions: encounter.prescriptions, labs: [] }), `${encounter.date}T12:00:00.000Z`,
      ],
    );
    await pool.query(
      `INSERT INTO clinical_nodes
       (id,patient_id,encounter_id,node_type,title,description,payload_json,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8) ON CONFLICT (id) DO NOTHING`,
      [
        `SUMMARY-${encounter.id}`, encounter.patientId, encounter.id, "Treatment Summary",
        "Completed Treatment Summary", summaryText, JSON.stringify({ prescriptions: encounter.prescriptions, labs: [] }),
        `${encounter.date}T12:00:00.000Z`,
      ],
    );
  }
}

interface PatientRow {
  id: string;
  unique_health_id: string;
  name: string;
  age: number;
  gender: Patient["gender"];
  blood_group: Patient["bloodGroup"];
  phone: string;
  address: string;
  emergency_contacts_json: unknown;
  allergies_json: unknown;
  chronic_conditions_json: unknown;
}

interface EncounterRow {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  status: string;
  diagnosis: string | null;
  clinical_notes: string | null;
}

export async function getState() {
  await ensureDatabase();
  const pool = getPool();
  const [patientsResult, encountersResult, labsResult, timelineResult, healthUpdatesResult, documentsResult] = await Promise.all([
    pool.query<PatientRow>("SELECT * FROM patients ORDER BY name"),
    pool.query<EncounterRow>("SELECT * FROM encounters ORDER BY date DESC"),
    pool.query("SELECT * FROM lab_reports ORDER BY report_date DESC"),
    pool.query("SELECT * FROM clinical_nodes ORDER BY created_at DESC"),
    pool.query("SELECT id, patient_id, symptoms, medical_history, updated_at FROM health_updates ORDER BY updated_at DESC"),
    pool.query("SELECT id, patient_id, file_name, mime_type, size_bytes, created_at FROM document_metadata ORDER BY created_at DESC"),
  ]);

  const prescriptions = await pool.query(
    `SELECT encounter_id, medicine_name AS "medicineName", dosage, frequency, duration
     FROM prescriptions`,
  );
  const encounterLabs = await pool.query("SELECT encounter_id, id FROM lab_reports");
  const labResults = await pool.query(
    `SELECT report_id, test_name AS "testName", value, unit,
            reference_range AS "referenceRange", status
     FROM lab_results`,
  );
  const prescriptionsByEncounter = new Map<string, Prescription[]>();
  for (const row of prescriptions.rows) {
    const values = prescriptionsByEncounter.get(row.encounter_id) ?? [];
    values.push({ medicineName: row.medicineName, dosage: row.dosage, frequency: row.frequency, duration: row.duration });
    prescriptionsByEncounter.set(row.encounter_id, values);
  }
  const labsByEncounter = new Map<string, string[]>();
  for (const row of encounterLabs.rows) {
    const values = labsByEncounter.get(row.encounter_id) ?? [];
    values.push(row.id);
    labsByEncounter.set(row.encounter_id, values);
  }
  const resultsByReport = new Map<string, LabReport["results"]>();
  for (const row of labResults.rows) {
    const values = resultsByReport.get(row.report_id) ?? [];
    values.push({
      testName: row.testName, value: row.value, unit: row.unit,
      referenceRange: row.referenceRange, status: row.status,
    });
    resultsByReport.set(row.report_id, values);
  }

  const patients = patientsResult.rows.map((row): Patient => ({
    id: row.id, uniqueHealthId: row.unique_health_id, name: row.name, age: row.age, gender: row.gender,
    bloodGroup: row.blood_group, phone: row.phone, address: row.address,
    emergencyContacts: parse(row.emergency_contacts_json, []),
    allergies: parse<unknown[]>(row.allergies_json, []).map((allergy) =>
      typeof allergy === "string" ? allergy : String((allergy as { allergen?: unknown }).allergen ?? ""),
    ).filter(Boolean),
    chronicConditions: parse<unknown[]>(row.chronic_conditions_json, []).map((condition) =>
      typeof condition === "string" ? condition : String((condition as { conditionName?: unknown }).conditionName ?? ""),
    ).filter(Boolean),
  }));
  const encounters = encountersResult.rows.map((row) => ({
    id: row.id, patientId: row.patient_id, doctorId: row.doctor_id, date: row.date, status: row.status,
    diagnosis: row.diagnosis ?? "", clinicalNotes: row.clinical_notes ?? "",
    prescriptions: prescriptionsByEncounter.get(row.id) ?? [],
    labReports: labsByEncounter.get(row.id) ?? [],
  }));
  const labs = labsResult.rows.map((row): LabReport => ({
    id: row.id, patientId: row.patient_id, testName: row.test_name, date: row.report_date, doctorId: row.doctor_id ?? "",
    results: resultsByReport.get(row.id) ?? [],
  }));
  const timeline = timelineResult.rows.map((row): TimeLineEntry => {
    const payload = parse<{ doctorName?: string }>(row.payload_json, {});
    return {
      id: row.id, patientId: row.patient_id, date: row.created_at.slice(0, 10),
      type: row.node_type as TimeLineEntry["type"], title: row.title, description: row.description,
      doctorName: payload.doctorName,
    };
  });
  const healthUpdates = healthUpdatesResult.rows.map((row) => ({
    id: row.id,
    patientId: row.patient_id,
    symptoms: row.symptoms,
    medicalHistory: row.medical_history,
    updatedAt: row.updated_at,
  }));
  const medicalDocuments = documentsResult.rows.map((row) => ({
    id: row.id,
    patientId: row.patient_id,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    storageKey: row.storage_key,
    uploadedAt: row.created_at,
  }));
  return { patients, encounters, labReports: labs, timeline, healthUpdates, medicalDocuments };
}

export async function saveHealthUpdate(input: { patientId: string; symptoms: string; medicalHistory: string }) {
  await ensureDatabase();
  const updatedAt = now();
  await getPool().query(
    `INSERT INTO health_updates (id, patient_id, symptoms, medical_history, updated_at)
     VALUES ($1,$2,$3,$4,$5)`,
    [`HEALTH-${Date.now()}`, input.patientId, input.symptoms, input.medicalHistory, updatedAt],
  );
  return updatedAt;
}

export async function saveMedicalDocument(input: {
  patientId: string;
  name: string;
  type: string;
  size: number;
  body: Buffer;
}) {
  await ensureDatabase();
  const key = `patients/${input.patientId}/${Date.now()}-${input.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const url = await uploadDocument({
    key,
    body: input.body,
    contentType: input.type,
  });
  await getPool().query(
    `INSERT INTO document_metadata
     (id, patient_id, file_name, mime_type, size_bytes, storage_key, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [`DOC-${Date.now()}-${Math.random().toString(36).slice(2)}`, input.patientId,
      input.name, input.type, input.size, key, now()],
  );
  return { key, url };
}

export async function saveSelfReport(patientId: string, vitals: Vitals) {
  await ensureDatabase();
  await withTransaction(async (client) => {
    const encounter = await client.query<{ id: string }>(
      "SELECT id FROM encounters WHERE patient_id=$1 AND status='Active' ORDER BY date DESC LIMIT 1",
      [patientId],
    );
    const encounterId = encounter.rows[0]?.id ?? null;
    const id = `VIT-${Date.now()}`;
    await client.query(
      `INSERT INTO vitals
       (id,patient_id,encounter_id,systolic,diastolic,sugar,temperature,weight,symptoms,recorded_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [id, patientId, encounterId, vitals.bloodPressureSystolic, vitals.bloodPressureDiastolic,
        vitals.sugarLevel, vitals.temperature, vitals.weight, vitals.symptoms, vitals.recordedAt],
    );
    await client.query(
      `INSERT INTO clinical_nodes
       (id,patient_id,encounter_id,node_type,title,description,payload_json,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)`,
      [`NODE-${id}`, patientId, encounterId, "Self-Report", "Home Vitals Report",
        `BP: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}, Sugar: ${vitals.sugarLevel} mg/dL. ${vitals.symptoms}`,
        JSON.stringify(vitals), vitals.recordedAt],
    );
  });
}

export async function verifyIdentity(input: { patientId: string; method: "otp" | "national-id"; phone?: string; nationalId?: string }) {
  await ensureDatabase();
  await getPool().query(
    `INSERT INTO identity_verifications
     (id,patient_id,method,phone_last4,national_id_hash,verified_at)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [`VER-${Date.now()}`, input.patientId, input.method, input.phone?.slice(-4) ?? null,
      input.nationalId ? `verified-${input.nationalId.length}` : null, now()],
  );
}

export async function registerKiosk(input: { name: string; age?: number; complaint: string; duration?: string; language: string; transcript?: string }) {
  await ensureDatabase();
  return withTransaction(async (client) => {
    const existing = await client.query<{ id: string }>(
      "SELECT id FROM patients WHERE lower(name)=lower($1) LIMIT 1", [input.name],
    );
    const patientId = existing.rows[0]?.id ?? `P-${Date.now()}`;
    if (!existing.rows[0]) {
      await client.query(
        `INSERT INTO patients
         (id,unique_health_id,name,age,gender,blood_group,phone,address,
          emergency_contacts_json,allergies_json,chronic_conditions_json,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12)`,
        [patientId, `HID-${Math.floor(1000 + Math.random() * 8999)}-K`, input.name, input.age ?? 0,
          "Other", "O+", "", "", "[]", "[]", "[]", now()],
      );
    }
    await client.query(
      `INSERT INTO kiosk_registrations
       (id,patient_id,name,age,complaint,duration,language,transcript,registered_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [`KIOSK-${Date.now()}`, patientId, input.name, input.age ?? null, input.complaint,
        input.duration ?? null, input.language, input.transcript ?? null, now()],
    );
    await client.query(
      `INSERT INTO clinical_nodes
       (id,patient_id,node_type,title,description,payload_json,created_at)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)`,
      [`NODE-KIOSK-${Date.now()}`, patientId, "Visit", "Kiosk Registration",
        `${input.complaint}${input.duration ? ` (${input.duration})` : ""}`, JSON.stringify(input), now()],
    );
    return patientId;
  });
}

export async function saveLab(input: { patientId: string; testName: string; results: LabReport["results"]; files?: { name: string; type?: string; size?: number }[] }) {
  await ensureDatabase();
  await withTransaction(async (client) => {
    const encounter = await client.query<{ id: string }>(
      "SELECT id FROM encounters WHERE patient_id=$1 AND status='Active' ORDER BY date DESC LIMIT 1",
      [input.patientId],
    );
    const encounterId = encounter.rows[0]?.id ?? null;
    const id = `LAB-${Date.now()}`;
    const date = now().slice(0, 10);
    await client.query(
      `INSERT INTO lab_reports (id,patient_id,encounter_id,test_name,report_date,doctor_id,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, input.patientId, encounterId, input.testName, date, null, now()],
    );
    for (const result of input.results) {
      await client.query(
        `INSERT INTO lab_results
         (id,report_id,test_name,value,value_text,unit,reference_range,status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [`${id}-${result.testName}`, id, result.testName, Number.isFinite(result.value) ? result.value : null,
          null, result.unit, result.referenceRange, result.status],
      );
    }
    for (const file of input.files ?? []) {
      await client.query(
        `INSERT INTO document_metadata
         (id,patient_id,encounter_id,lab_report_id,file_name,mime_type,size_bytes,storage_key,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [`DOC-${Date.now()}-${file.name}`, input.patientId, encounterId, id, file.name,
          file.type ?? null, file.size ?? null, null, now()],
      );
    }
    await client.query(
      `INSERT INTO clinical_nodes
       (id,patient_id,encounter_id,node_type,title,description,payload_json,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)`,
      [`NODE-${id}`, input.patientId, encounterId, "Lab", input.testName,
        `${input.results.length} result(s) submitted`, JSON.stringify({ reportId: id }), now()],
    );
  });
}

async function insertPrescriptions(client: PoolClient, encounterId: string, patientId: string, prescriptions: Prescription[]) {
  for (const prescription of prescriptions) {
    await client.query(
      `INSERT INTO prescriptions
       (id,patient_id,encounter_id,medicine_name,dosage,frequency,duration,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`,
      [`RX-${Date.now()}-${Math.random().toString(36).slice(2)}`, patientId, encounterId,
        prescription.medicineName, prescription.dosage, prescription.frequency, prescription.duration, now()],
    );
  }
}

export async function savePrescription(input: { patientId: string; diagnosis: string; clinicalNotes: string; prescriptions: Prescription[] }) {
  await ensureDatabase();
  await withTransaction(async (client) => {
    const encounter = await client.query<EncounterRow>(
      "SELECT * FROM encounters WHERE patient_id=$1 AND status='Active' ORDER BY date DESC LIMIT 1 FOR UPDATE",
      [input.patientId],
    );
    const activeEncounter = encounter.rows[0];
    if (!activeEncounter) throw new Error("No active encounter for this patient");
    await insertPrescriptions(client, activeEncounter.id, input.patientId, input.prescriptions);
    await client.query(
      "UPDATE encounters SET diagnosis=$1, clinical_notes=$2 WHERE id=$3",
      [input.diagnosis || activeEncounter.diagnosis, input.clinicalNotes || activeEncounter.clinical_notes, activeEncounter.id],
    );
  });
}

export async function completeTreatment(input: { patientId: string; diagnosis: string; clinicalNotes: string; prescriptions: Prescription[]; diseaseNarrative?: string }) {
  await ensureDatabase();
  await withTransaction(async (client) => {
    const encounterResult = await client.query<EncounterRow>(
      "SELECT * FROM encounters WHERE patient_id=$1 AND status='Active' ORDER BY date DESC LIMIT 1 FOR UPDATE",
      [input.patientId],
    );
    const encounter = encounterResult.rows[0];
    if (!encounter) throw new Error("No active encounter for this patient");
    await insertPrescriptions(client, encounter.id, input.patientId, input.prescriptions);
    const prescriptions = await client.query<Prescription>(
      `SELECT medicine_name AS "medicineName", dosage, frequency, duration
       FROM prescriptions WHERE encounter_id=$1`,
      [encounter.id],
    );
    await compactTreatment(
      client,
      encounter.id,
      input.diagnosis || encounter.diagnosis || "Completed treatment",
      input.clinicalNotes || encounter.clinical_notes || "",
      prescriptions.rows,
      input.diseaseNarrative,
    );
  });
}

async function compactTreatment(client: PoolClient, encounterId: string, diagnosis: string, notes: string, prescriptions: Prescription[], diseaseNarrative?: string) {
  const encounter = await client.query<{ patient_id: string }>(
    "SELECT patient_id FROM encounters WHERE id=$1 FOR UPDATE", [encounterId],
  );
  const patientId = encounter.rows[0].patient_id;
  const labs = await client.query<{ test_name: string }>(
    "SELECT test_name FROM lab_reports WHERE encounter_id=$1", [encounterId],
  );
  
  // Use AI-generated disease narrative if available, otherwise fall back to basic summary
  const summaryText = diseaseNarrative || `${diagnosis}. ${notes}`.trim();
  const keyFindings = { prescriptions, labs: labs.rows, diagnosis };
  
  await client.query(
    `INSERT INTO treatment_summaries
     (id,patient_id,encounter_id,summary,diagnosis,key_findings_json,completed_at)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)
     ON CONFLICT (encounter_id) DO UPDATE SET
       summary=EXCLUDED.summary, diagnosis=EXCLUDED.diagnosis,
       key_findings_json=EXCLUDED.key_findings_json, completed_at=EXCLUDED.completed_at`,
    [`SUM-${encounterId}`, patientId, encounterId, summaryText, diagnosis, JSON.stringify(keyFindings), now()],
  );
  
  await client.query(
    `INSERT INTO clinical_nodes
     (id,patient_id,encounter_id,node_type,title,description,payload_json,created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)
     ON CONFLICT (id) DO UPDATE SET
       description=EXCLUDED.description, payload_json=EXCLUDED.payload_json, created_at=EXCLUDED.created_at`,
    [`SUMMARY-${encounterId}`, patientId, encounterId, "Treatment Summary", `${diagnosis} - Treatment Summary`,
      summaryText, JSON.stringify(keyFindings), now()],
  );
  
  await client.query("DELETE FROM clinical_nodes WHERE encounter_id=$1 AND id <> $2", [encounterId, `SUMMARY-${encounterId}`]);
  await client.query("DELETE FROM vitals WHERE encounter_id=$1", [encounterId]);
  await client.query("DELETE FROM document_metadata WHERE encounter_id=$1", [encounterId]);
  await client.query("DELETE FROM lab_reports WHERE encounter_id=$1", [encounterId]);
  await client.query("DELETE FROM prescriptions WHERE encounter_id=$1", [encounterId]);
  await client.query(
    "UPDATE encounters SET status='Completed', diagnosis=NULL, clinical_notes=NULL WHERE id=$1",
    [encounterId],
  );
}

export async function registerPatientProfile(profile: FullPatientProfile) {
  await ensureDatabase();
  const pool = getPool();

  if (!profile.basicInfo?.fullName || !profile.basicInfo?.dob || !profile.healthId) {
    throw new Error("Missing required fields: fullName, dob, and healthId");
  }

  // Check if patient with this healthId already exists
  const existing = await pool.query(
    "SELECT id FROM patients WHERE unique_health_id = $1",
    [profile.healthId]
  );

  if (existing.rows.length > 0) {
    throw new Error("Health ID already registered");
  }

  // Generate a unique patient ID
  const patientId = `P${Date.now()}`;
  const encounterId = `ENC${Date.now()}`;

  await withTransaction(async (client) => {
    // Insert patient
    await client.query(
      `INSERT INTO patients
       (id, unique_health_id, name, age, gender, blood_group, phone, address,
        emergency_contacts_json, allergies_json, chronic_conditions_json, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        patientId,
        profile.healthId,
        profile.basicInfo.fullName,
        calculateAge(profile.basicInfo.dob),
        profile.basicInfo.gender,
        profile.basicInfo.bloodGroup || "Unknown",
        profile.basicInfo.phone || "",
        profile.basicInfo.address || "",
        JSON.stringify([
          {
            name: profile.basicInfo.emergencyContactName || "",
            phone: profile.basicInfo.emergencyContactPhone || "",
            relation: profile.basicInfo.emergencyContactRelation || "",
          },
        ]),
        JSON.stringify(
          (profile.allergies || []).map((a: AllergyRecord) => ({
            allergen: a.allergen,
            allergyType: a.allergyType,
            severity: a.severity,
            reactionDescription: a.reactionDescription,
          }))
        ),
        JSON.stringify(
          (profile.chronicConditions || []).map((c: ChronicCondition) => ({
            conditionName: c.conditionName,
            diagnosedYear: c.diagnosedYear,
            status: c.status,
            latestMetrics: c.latestMetrics,
          }))
        ),
        now(),
      ]
    );

    // Create an initial active encounter for this patient
    await client.query(
      `INSERT INTO encounters
       (id, patient_id, doctor_id, date, status, diagnosis, clinical_notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        encounterId,
        patientId,
        "INTAKE",
        new Date().toISOString().split("T")[0],
        "Active",
        "Initial Registration",
        `Patient registered via intake wizard on ${new Date().toLocaleDateString()}`,
        now(),
      ]
    );

    // Store surgical history
    if (profile.surgeries && profile.surgeries.length > 0) {
      for (const surgery of profile.surgeries) {
        await client.query(
          `INSERT INTO clinical_nodes
           (id, patient_id, encounter_id, node_type, title, description, payload_json, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)`,
          [
            `SURGERY-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            patientId,
            null,
            "Surgery",
            surgery.procedureName,
            `${surgery.procedureName} at ${surgery.operatingHospital} (${surgery.yearOfProcedure})${
              surgery.complicationsOrNotes ? ` - ${surgery.complicationsOrNotes}` : ""
            }`,
            JSON.stringify(surgery),
            `${surgery.yearOfProcedure}-01-01T00:00:00.000Z`,
          ]
        );
      }
    }

    // Store vaccination history
    if (profile.vaccinations && profile.vaccinations.length > 0) {
      for (const vaccine of profile.vaccinations) {
        await client.query(
          `INSERT INTO clinical_nodes
           (id, patient_id, encounter_id, node_type, title, description, payload_json, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)`,
          [
            `VACCINE-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            patientId,
            null,
            "Vaccination",
            vaccine.vaccineName,
            `${vaccine.vaccineName} - ${vaccine.doseNumber} administered on ${vaccine.administeredDate}${
              vaccine.hospitalOrFacility ? ` at ${vaccine.hospitalOrFacility}` : ""
            }`,
            JSON.stringify(vaccine),
            vaccine.administeredDate + "T00:00:00.000Z",
          ]
        );
      }
    }
  });

  return { patientId, encounterId };
}

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

export function getDb() {
  return getPool();
}
