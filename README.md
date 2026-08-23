SIH
#Sanjeevni

#ALL IN ONE CENTRALIZED PLATFORM FOR GOVT. HOSPITALS TO RECORD AND TRACK PATIENT HISTORY/DATA.

------------------------------------------------------------------------------------------------------------------------------------------------------------------
#COMPONENT-1:INITIAL INPUT

SIDE- PATIENT

USES ADVANCED SST TO GET INFORMATION FROM PATIENT FROM MULTILINGUAL ABLED UI. GETS PREVIOUS MEDICAL HISTORY FROM DOCUMENTS AND SPEECH GETS AADHAR AUTHENTICATION GETS DOCUMENTS FROM DIGILOCKER API GENERATES A UNIQUE ID REPRESENTING THE PATIENT

-------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Neon PostgreSQL persistence

The application uses Neon-compatible PostgreSQL through the standard `pg` package. The
schema is created on the first API request. Development requests also seed the mock data
idempotently. Database initialization is lazy, so a database is not required while running
`next build`.

### Setup and run

```bash
npm install
```

Set the Neon connection string before starting the server (for example in `.env.local`):

```bash
DATABASE_URL=postgresql://user:password@ep-example.us-east-2.aws.neon.tech/neondb?sslmode=require
npm run dev
```

For production, configure `DATABASE_URL` in the hosting provider's environment. Requests
fail with a clear configuration error if it is missing.

Use `npm run lint` and `npm run build` to validate a production build. The API routes
under `src/app/api` persist all form submissions:

- `POST /api/self-report` — patient vitals and a clinical node
- `POST /api/kiosk/register` — kiosk registration and patient creation/reuse
- `POST /api/identity/verify` — OTP or national-ID verification audit record
- `POST /api/labs` — report results and uploaded-file metadata
- `POST /api/prescriptions/commit` — save prescription while treatment remains active
- `POST /api/treatments/complete` — explicitly complete treatment and compact/delete details
- `GET /api/state` — frontend state projection

The schema includes patients, encounters, clinical nodes, treatment summaries, vitals,
lab reports/results, prescriptions, identity verifications, kiosk registrations, and
document metadata. Uploaded files remain client-side in this prototype; their name,
MIME type, and size are persisted for later storage integration.

### Treatment compaction

Saving a prescription does not complete the encounter or delete any data. The doctor must
explicitly confirm **Declare Treatment Ended & Create Summary**. That action completes the
active encounter in one PostgreSQL transaction.
Detailed clinical nodes, vitals, prescriptions, lab reports/results, and document
metadata associated with that encounter are deleted from the active database. A
`treatment_summaries` row and a compact `Treatment Summary` clinical node remain in
patient history. The summary contains diagnosis, notes, key findings, and medication
names for continuity without retaining deleted treatment details.

#COMPONENT-2:RECURRING INPUT

TWO SIDES -1. HOSPITAL 2. DOCTOR

1.HOSPITALS LOGIN FROM THEIR PORTAL AND ENTER THE PATIENT UID TO UPLOAD THE REPORTS LIKE - MRI,XRAY,CT SCAN.....WHICH GETS FETCHED FROM THEIR OWN EXISTING SOFTWARES LIKE DCOM. 
2.DOCTOR GETS AN ENDPOINT DEVICE WHERE THEY ENTER PATIENTS UID AND WHERE THEY SCANS THE PRESCRIPTION ....... OUR DATA FECTHING MODEL EXCTRACTS IT AND ADDS IT AS AN CHAINED INSTANCE TO THE PATIENTS DATA


-------------------------------------------------------------------------------------------------------------------------------------------------------------------
#COMPONENT-3:DATA STORING SYSTEM (USP)

DATA OF EACH PATIENT GETS STORED AS AN INDIVDUAL INSTANCE IN THE INITIAL INPUT ( POINT OF ENTRY), AND THE RECURRING INPUT FOR THAT UID GETS CHAINED AS NODE REPRESENTING THE CURRENT STATE OF TREATMENTS AND PATIENTS HEALTH.

AFTER ANY TREATMENT OR PROCEDURE IS COMPLETED , THAT WHOLE CHAIN IS COMPRESSED AND THE RELEVANT INFORMATION FOR FUTURE REFERENCE OF MEDICAL HISTORY IS EXTRACTED AND STORED PARALLELLY TO THE POINT OF ENTRY.

-------------------------------------------------------------------------------------------------------------------------------------------------------------------
