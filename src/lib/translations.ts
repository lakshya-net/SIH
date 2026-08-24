/**
 * English → Hindi translation dictionary
 * Used by the DOM-level translator to translate rendered page text.
 * Only patient-facing UI strings are included. Doctor-facing sections
 * are excluded via data-no-translate attribute on their containers.
 *
 * Patient data (names, medical values, IDs, phone numbers, dates)
 * are never in this dictionary and are never translated.
 */

export const translations: Record<string, string> = {
  // ═══════════════════════════════════════════════════════════════════
  // Navigation & Layout
  // ═══════════════════════════════════════════════════════════════════
  "Switch Role / View": "भूमिका / दृश्य बदलें",
  "Verify Identity": "पहचान सत्यापित करें",

  // Role labels
  "Patient Portal": "मरीज़ पोर्टल",
  "Kiosk Mode": "कियोस्क मोड",
  "Hospital Lab": "अस्पताल प्रयोगशाला",
  "Patient Intake": "मरीज़ रजिस्ट्रेशन",

  // Role descriptions
  "Digital Web Mode": "डिजिटल वेब मोड",
  "Voice / Bilingual Intake": "वॉयस / द्विभाषी रजिस्ट्रेशन",
  "Diagnostic Desk": "डायग्नोस्टिक डेस्क",
  "AI-Assisted View": "AI-सहायता प्राप्त दृश्य",
  "Prescription Builder": "प्रिस्क्रिप्शन बिल्डर",
  "Lifetime Registration": "आजीवन पंजीकरण",

  // Language selector
  "Select Language": "भाषा चुनें",

  // ═══════════════════════════════════════════════════════════════════
  // Patient Portal
  // ═══════════════════════════════════════════════════════════════════
  "Allergies & Chronic Conditions": "एलर्जी और दीर्घकालिक स्थितियाँ",
  "Emergency Contacts": "आपातकालीन संपर्क",
  "Lifetime History": "आजीवन इतिहास",
  "Self-Report Vitals": "स्व-रिपोर्ट वाइटल",
  "Lifetime Health Timeline": "आजीवन स्वास्थ्य टाइमलाइन",
  "Chronological view of all visits, labs, and prescriptions":
    "सभी विज़िट, लैब और प्रिस्क्रिप्शन का कालानुक्रमिक दृश्य",
  "Report Home Vitals": "घर के वाइटल रिकॉर्ड करें",
  "Enter your latest home readings to update your health record":
    "अपने स्वास्थ्य रिकॉर्ड को अपडेट करने के लिए नवीनतम घरेतू रीडिंग दर्ज करें",
  "Blood Pressure (Systolic)": "रक्तचाप (सिस्टोलिक)",
  "Blood Pressure (Diastolic)": "रक्तचाप (डायस्टोलिक)",
  "Blood Sugar (Fasting)": "रक्त शर्करा (उपवास)",
  "Temperature": "तापमान",
  "Weight": "वज़न",
  "Recent Symptoms": "हाल के लक्षण",
  "Submit Vitals to Record": "रिकॉर्ड में वाइटल जमा करें",
  "Missing Fields": "क्षेत्र अधूरे हैं",
  "Please enter blood pressure and sugar level.":
    "कृपया रक्तचाप और रक्त शर्करा स्तर दर्ज करें।",
  "Vitals Submitted ✓": "वाइटल जमा किए गए ✓",
  "Your home vitals have been recorded in your lifetime record.":
    "आपके घरेतू वाइटल आपके आजीवन रिकॉर्ड में दर्ज कर दिए गए हैं।",

  // ═══════════════════════════════════════════════════════════════════
  // Patient Health Update (PatientInput)
  // ═══════════════════════════════════════════════════════════════════
  "Patient Health Update": "मरीज़ स्वास्थ्य अपडेट",
  "Enter your current health information before your consultation.":
    "अपनी परामर्श से पहले अपनी वर्तमान स्वास्थ्य जानकारी दर्ज करें।",
  "Current Symptoms": "वर्तमान लक्षण",
  "Medical History / Additional Information":
    "चिकित्सीय इतिहास / अतिरिक्त जानकारी",
  "Save Health Update": "स्वास्थ्य अपडेट सहेजें",
  "Saving...": "सहेज रहे हैं...",
  "Please enter symptoms or medical history before saving.":
    "कृपया सहेजने से पहले लक्षण या चिकित्सीय इतिहास दर्ज करें।",
  "Health update saved successfully!": "स्वास्थ्य अपडेट सफलतापूर्वक सहेजा गया!",
  "Unable to save health update.":
    "स्वास्थ्य अपडेट सहेजने में असमर्थ।",
  "Example: Headache, fever, dizziness...":
    "उदाहरण: सिरदर्द, बुखार, चक्कर आना...",
  "Enter any relevant medical information...":
    "कोई भी प्रासंगिक चिकित्सीय जानकारी दर्ज करें...",

  // ═══════════════════════════════════════════════════════════════════
  // Patient Intake Wizard - Step Navigation
  // ═══════════════════════════════════════════════════════════════════
  "Identity & Demographics": "पहचान और जनसांख्यिकी",
  "Basic personal information": "मूल व्यक्तिगत जानकारी",
  "Chronic Conditions": "दीर्घकालिक स्थितियाँ",
  "Medical history & comorbidities": "चिकित्सीय इतिहास और सह-रुग्णताएँ",
  "Surgical History": "शल्य चिकित्सा इतिहास",
  "Past surgeries & procedures": "पिछली शल्य चिकित्साएँ और प्रक्रियाएँ",
  Vaccinations: "टीकाकरण",
  "Immunization records": "टीकाकरण रिकॉर्ड",
  "Active Medications": "सक्रिय दवाइयाँ",
  "Current prescriptions": "वर्तमान प्रिस्क्रिप्शन",
  "Allergies & Lifestyle": "एलर्जी और जीवनशैली",
  "Allergens & habits": "एलर्जेन और आदतें",
  "Final Review": "अंतिम समीक्षा",
  "Review & submit": "समीक्षा करें और जमा करें",

  // ═══════════════════════════════════════════════════════════════════
  // Patient Intake - Step 1: Identity
  // ═══════════════════════════════════════════════════════════════════
  "Unique Health ID": "अद्वितीय स्वास्थ्य आईडी",
  "Not Generated": "उत्पन्न नहीं हुआ",
  Generated: "उत्पन्न",
  "Full Name": "पूरा नाम",
  "Date of Birth": "जन्म तिथि",
  Gender: "लिंग",
  Male: "पुरुष",
  Female: "महिला",
  Other: "अन्य",
  "Blood Group": "रक्त समूह",
  "Select blood group": "रक्त समूह चुनें",
  "Contact & Verification": "संपर्क और सत्यापन",
  "Phone Number": "फ़ोन नंबर",
  Verify: "सत्यापित करें",
  "Phone verified via OTP simulation":
    "फ़ोन OTP सिमुलेशन के माध्यम से सत्यापित",
  "Email (Optional)": "ईमेल (वैकल्पिक)",
  "Address (Optional)": "पता (वैकल्पिक)",
  "Emergency Contact": "आपातकालीन संपर्क",
  "Contact Name": "संपर्क नाम",
  "Contact Phone": "संपर्क फ़ोन",
  Relationship: "रिश्ता",

  // Placeholders
  "e.g., Rajesh Kumar": "जैसे, राजेश कुमार",
  "e.g., Priya Kumar": "जैसे, प्रिया कुमार",
  "+91-98765-43210": "+91-98765-43210",
  "+91-98765-43211": "+91-98765-43211",
  "patient@email.com": "patient@email.com",
  "Full address with PIN code": "पूरा पता पिन कोड सहित",
  "e.g., Wife, Son, Father": "जैसे, पत्नी, बेटा, पिता",

  // ═══════════════════════════════════════════════════════════════════
  // Patient Intake - Step 2: Chronic Conditions
  // ═══════════════════════════════════════════════════════════════════
  "Chronic Conditions & Comorbidities": "दीर्घकालिक स्थितियाँ और सह-रुग्णताएँ",
  "Track ongoing medical conditions": "चल रही चिकित्सीय स्थितियों को ट्रैक करें",
  "Quick add common conditions:":
    "सामान्य स्थितियाँ जल्दी से जोड़ें:",
  "Add Condition": "स्थिति जोड़ें",
  "Edit Condition": "स्थिति संपादित करें",
  "Add New Condition": "नई स्थिति जोड़ें",
  "Condition Name": "स्थिति का नाम",
  "Diagnosed Year": "निदान वर्ष",
  Status: "स्थिति",
  Active: "सक्रिय",
  Managed: "नियंत्रित",
  Resolved: "हल",
  "Latest Metrics": "नवीनतम माप",
  "Search or type condition...": "स्थिति खोजें या टाइप करें...",
  "e.g., BP 130/85": "जैसे, बीपी 130/85",

  // ═══════════════════════════════════════════════════════════════════
  // Patient Intake - Step 3: Surgical History
  // ═══════════════════════════════════════════════════════════════════
  "Surgical & Procedural History": "शल्य चिकित्सा और प्रक्रिया इतिहास",
  "Record all past surgeries, operations, and implants":
    "सभी पिछली शल्य चिकित्साएँ, ऑपरेशन और इम्प्लांट रिकॉर्ड करें",
  "No surgical records added yet": "अभी तक कोई शल्य चिकित्सा रिकॉर्ड नहीं जोड़ा गया",
  'Click "Add Surgery" to record surgical history':
    'शल्य चिकित्सा इतिहास रिकॉर्ड करने के लिए "शल्य चिकित्सा जोड़ें" पर क्लिक करें',
  "Add Surgery": "शल्य चिकित्सा जोड़ें",
  "Edit Surgery": "शल्य चिकित्सा संपादित करें",
  "Add New Surgery": "नई शल्य चिकित्सा जोड़ें",
  "Procedure Name": "प्रक्रिया का नाम",
  "Operating Hospital": "ऑपरेशन करने वाला अस्पताल",
  "Year of Procedure": "प्रक्रिया का वर्ष",
  "Surgeon Name": "सर्जन का नाम",
  "Complications / Notes": "जटिलताएँ / नोट्स",
  "e.g., Appendectomy, Knee Replacement":
    "जैसे, अपेंडेक्टोमी, घुटना प्रत्यारोपण",
  "e.g., AIIMS New Delhi": "जैसे, एम्स नई दिल्ली",
  "e.g., Dr. Sharma": "जैसे, डॉ. शर्मा",
  "Any complications, implant details, or post-operative notes...":
    "कोई जटिलताएँ, इम्प्लांट विवरण, या ऑपरेशन के बाद के नोट्स...",

  // ═══════════════════════════════════════════════════════════════════
  // Patient Intake - Step 4: Vaccinations
  // ═══════════════════════════════════════════════════════════════════
  "Vaccination & Immunization History": "टीकाकरण और प्रतिरक्षण इतिहास",
  "Record routine, COVID-19, and travel vaccines":
    "नियमित, COVID-19, और यात्रा टीके रिकॉर्ड करें",
  "No vaccination records added yet":
    "अभी तक कोई टीकाकरण रिकॉर्ड नहीं जोड़ा गया",
  'Click "Add Vaccine" to record immunization history':
    'टीकाकरण इतिहास रिकॉर्ड करने के लिए "टीका जोड़ें" पर क्लिक करें',
  "Add Vaccine": "टीका जोड़ें",
  "Edit Vaccine": "टीका संपादित करें",
  "Add New Vaccine": "नया टीका जोड़ें",
  "Vaccine Name": "टीके का नाम",
  "Dose Number": "खुराक संख्या",
  "Date Administered": "टीका लगाने की तिथि",
  "Hospital / Facility": "अस्पताल / सुविधा",
  "Batch Number": "बैच नंबर",
  "Dose 1": "खुराक 1",
  "Dose 2": "खुराक 2",
  "Dose 3": "खुराक 3",
  Booster: "बूस्टर",
  Annual: "वार्षिक",
  "Search vaccine...": "टीका खोजें...",
  "e.g., PHC Central": "जैसे, पीएचसी सेंट्रल",
  "e.g., CVD-2021-A1": "जैसे, CVD-2021-A1",
  Select: "चुनें",

  // ═══════════════════════════════════════════════════════════════════
  // Patient Intake - Step 5: Active Medications
  // ═══════════════════════════════════════════════════════════════════
  "Active Medications & Supplements": "सक्रिय दवाइयाँ और पूरक",
  "Track current prescriptions and over-the-counter medications":
    "वर्तमान प्रिस्क्रिप्शन और बिना प्रिस्क्रिप्शन वाली दवाइयों को ट्रैक करें",
  "No medications recorded yet": "अभी तक कोई दवाइयाँ दर्ज नहीं की गई",
  'Click "Add Medication" to record current prescriptions':
    'वर्तमान प्रिस्क्रिप्शन रिकॉर्ड करने के लिए "दवाइयाँ जोड़ें" पर क्लिक करें',
  "Add Medication": "दवाइयाँ जोड़ें",
  "Edit Medication": "दवाइयाँ संपादित करें",
  "Add New Medication": "नई दवाइयाँ जोड़ें",
  "Drug Name": "दवा का नाम",
  Dosage: "खुराक",
  Frequency: "आवृत्ति",
  Duration: "अवधि",
  "Prescribed For": "किसके लिए निर्धारित",
  "Search medication...": "दवाइयाँ खोजें...",
  "e.g., Paracetamol 500mg": "जैसे, पैरासिटामोल 500mg",
  "e.g., 500mg": "जैसे, 500mg",
  "e.g., 30 days": "जैसे, 30 दिन",
  "e.g., Fever, Headache": "जैसे, बुखार, सिरदर्द",

  // ═══════════════════════════════════════════════════════════════════
  // Patient Intake - Step 6: Allergies & Lifestyle
  // ═══════════════════════════════════════════════════════════════════
  "Allergy Information": "एलर्जी जानकारी",
  "Record known allergies and their severity":
    "ज्ञात एलर्जी और उनकी गंभीरता रिकॉर्ड करें",
  "No allergies recorded yet": "अभी तक कोई एलर्जी दर्ज नहीं की गई",
  "Add Allergy": "एलर्जी जोड़ें",
  "Edit Allergy": "एलर्जी संपादित करें",
  "Add New Allergy": "नई एलर्जी जोड़ें",
  Allergen: "एलर्जेन",
  "Allergy Type": "एलर्जी का प्रकार",
  Severity: "गंभीरता",
  "Lifestyle Information": "जीवनशैली जानकारी",
  Smoking: "धूम्रपान",
  Alcohol: "शराब",
  Exercise: "व्यायाम",
  Diet: "आहार",
  "Non-smoker": "गैर-धूम्रपान करने वाला",
  Smoker: "धूम्रपान करने वाला",
  "Former smoker": "पूर्व धूम्रपान करने वाला",
  "Non-drinker": "गैर-शराब पीने वाला",
  "Occasional drinker": "कभी-कभार शराब पीने वाला",
  Regular: "नियमित",
  Sedentary: "गतिहीन",
  "Very active": "बहुत सक्रिय",
  Vegetarian: "शाकाहारी",
  "Non-vegetarian": "मांसाहारी",
  Vegan: "शाकाहारी (विगन)",

  // ═══════════════════════════════════════════════════════════════════
  // Patient Intake - Step 7: Final Review
  // ═══════════════════════════════════════════════════════════════════
  "Patient Registration Summary": "मरीज़ पंजीकरण सारांश",
  "Please review all information before submitting":
    "कृपया जमा करने से पहले सभी जानकारी की समीक्षा करें",
  "Registration Complete!": "पंजीकरण पूर्ण!",
  "Your health record has been created successfully.":
    "आपका स्वास्थ्य रिकॉर्ड सफलतापूर्वक बना दिया गया है।",
  "Your Unique Health ID": "आपका अद्वितीय स्वास्थ्य आईडी",
  "Personal Information": "व्यक्तिगत जानकारी",
  "Medical Information": "चिकित्सीय जानकारी",
  "Emergency Contact Information": "आपातकालीन संपर्क जानकारी",

  // ═══════════════════════════════════════════════════════════════════
  // Wizard Navigation
  // ═══════════════════════════════════════════════════════════════════
  Previous: "पीछे",
  Next: "आगे",
  "Save & Continue": "सहेजें और जारी रखें",
  "Submit Registration": "पंजीकरण जमा करें",
  Submit: "जमा करें",
  Cancel: "रद्द करें",
  "Reset Form": "फॉर्म रीसेट करें",
  "Download Summary": "सारांश डाउनलोड करें",

  // ═══════════════════════════════════════════════════════════════════
  // Kiosk Mode (supplements existing t() translations)
  // ═══════════════════════════════════════════════════════════════════
  "Welcome to Health Portal": "स्वास्थ्य पोर्टल में आपका स्वागत है",
  "Tap to Speak": "बोलने के लिए टैप करें",
  "Patient Information": "रोगी जानकारी",
  "Live Transcription": "लाइव ट्रांसक्रिप्शन",
  "Registration Successful!": "पंजीकरण सफल!",
  "Please wait in the waiting area":
    "कृपया प्रतीक्षा कक्ष में प्रतीक्षा करें",
  "Register Another Patient": "एक और रोगी पंजीकृत करें",
  "Registration failed": "पंजीकरण विफल",
  "The registration could not be saved.":
    "पंजीकरण सहेजा नहीं जा सका।",
  "Please fill required fields": "कृपया आवश्यक क्षेत्र भरें",
  "Tap the microphone to start speaking...":
    "बोलना शुरू करने के लिए माइक्रोफ़ोन पर टैप करें...",
  "Auto-filled": "स्वतः भरा",

  // ═══════════════════════════════════════════════════════════════════
  // Common Medical Terms
  // ═══════════════════════════════════════════════════════════════════
  Symptoms: "लक्षण",
  Allergies: "एलर्जी",
  Medications: "दवाइयाँ",
  "Blood Pressure": "रक्तचाप",
  "Heart Rate": "हृदय गति",
  Emergency: "आपातकाल",
  "Patient Name": "मरीज़ का नाम",
  "Medical History": "चिकित्सीय इतिहास",
  "Patient Registration": "रोगी पंजीकरण",
  "Primary Complaint": "मुख्य शिकायत",
  Name: "नाम",
  Age: "आयु",

  // ═══════════════════════════════════════════════════════════════════
  // Medical Documents
  // ═══════════════════════════════════════════════════════════════════
  "Medical Documents": "चिकित्सा दस्तावेज़",
  "Upload prescriptions, lab reports, discharge summaries, or other medical records.":
    "प्रिस्क्रिप्शन, लैब रिपोर्ट, डिस्चार्ज सारांश, या अन्य चिकित्सा रिकॉर्ड अपलोड करें।",
  "Save Medical Document": "चिकित्सा दस्तावेज़ सहेजें",
  "Medical document uploaded successfully!":
    "चिकित्सा दस्तावेज़ सफलतापूर्वक अपलोड किया गया!",
  "Unable to save medical document.":
    "चिकित्सा दस्तावेज़ सहेजने में असमर्थ।",
  "Please select a document first.":
    "कृपया पहले एक दस्तावेज़ चुनें।",



  // ═══════════════════════════════════════════════════════════════════
  // Form Placeholders (patient-facing only)
  // ═══════════════════════════════════════════════════════════════════
  "e.g., 3 Days": "जैसे, 3 दिन",
  "Full Name *": "पूरा नाम *",
  "Date of Birth *": "जन्म तिथि *",
  "Blood Group *": "रक्त समूह *",
  "Phone Number *": "फ़ोन नंबर *",
  "Contact Name *": "संपर्क नाम *",
  "Contact Phone *": "संपर्क फ़ोन *",

  // ═══════════════════════════════════════════════════════════════════
  // Patient Intake Wizard — header & remaining labels/placeholders
  // ═══════════════════════════════════════════════════════════════════
    "Patient Lifetime Intake": "मरीज़ आजीवन इनटेक",
  "Comprehensive medical history registration":
    "व्यापक चिकित्सा इतिहास पंजीकरण",
  "Select frequency": "आवृत्ति चुनें",
  "Start Date": "प्रारंभ तिथि",
  Reaction: "प्रतिक्रिया",
  "Smoking Status": "धूम्रपान की स्थिति",
  "Alcohol Use": "शराब का सेवन",
  Update: "अपडेट करें",
  "Search allergen...": "एलर्जेन खोजें...",
  "e.g., 500mg, 10 units": "जैसे, 500mg, 10 यूनिट",
  "e.g., Hypertension, Diabetes": "जैसे, उच्च रक्तचाप, मधुमेह",
  "e.g., Rash, swelling": "जैसे, रैश, सूजन",

  // ═══════════════════════════════════════════════════════════════════
  // Patient Portal — self-report vitals placeholders
  // ═══════════════════════════════════════════════════════════════════
    "e.g., Headache since morning, mild chest discomfort, dizziness...":
    "जैसे, सुबह से सिरदर्द, हल्का सीने में बेचैनी, चक्कर आना...",

  // ═══════════════════════════════════════════════════════════════════
  // Patient Portal tabs (upstream "api routing update")
  // ═══════════════════════════════════════════════════════════════════
  History: "इतिहास",
  Vitals: "वाइटल",
  "Health Update": "स्वास्थ्य अपडेट",
  Documents: "दस्तावेज़",
};
