export const MOCK_PATIENTS = [
  {
    id: "PT-4091",
    name: "Aarav Sharma",
    age: 56,
    gender: "M",
    triageLevel: 2,
    status: "Waiting",
    riskScore: 0.64,
    riskClass: "HIGH",
    admittedAt: "10:15 AM",
    assignedDoctor: "Dr. Gregory House",
    assignedNurse: "Nurse Jackie",
    vitals: {
      heartRate: 104,
      bp: "145/92",
      spO2: 93,
      temp: 38.2,
      respiratoryRate: 22
    },
    diagnostics: {
      ef: 33,
      creatinine: 1.6,
      platelets: 210,
      tlc: 12.4
    },
    symptoms: "Acute chest pressure, fever, mild dyspnea on minimal exertion.",
    history: "Coronary Artery Disease (CAD), previous stent placement in 2021, Type 2 Diabetes, Hyperlipidemia.",
    allergies: "Sulfa drugs, Penicillin",
    medications: "Metformin 850mg BID, Aspirin 81mg daily, Clopidogrel 75mg daily, Atorvastatin 40mg QD"
  },
  {
    id: "PT-1284",
    name: "Sunita Patel",
    age: 75,
    gender: "F",
    triageLevel: 1,
    status: "Critical",
    riskScore: 0.88,
    riskClass: "HIGH",
    admittedAt: "10:42 AM",
    assignedDoctor: "Dr. Lisa Cuddy",
    assignedNurse: "Nurse Hathaway",
    vitals: {
      heartRate: 118,
      bp: "90/58",
      spO2: 89,
      temp: 36.4,
      respiratoryRate: 26
    },
    diagnostics: {
      ef: 20,
      creatinine: 1.2,
      platelets: 276,
      tlc: 8.6
    },
    symptoms: "Hypotension, cardiogenic shock triggers, altered level of consciousness.",
    history: "Congestive Heart Failure (CHF) with low ejection fraction, persistent Atrial Fibrillation (AFib), Osteoporosis.",
    allergies: "Codeine, Iodine contrast dyes",
    medications: "Furosemide 40mg QD, Apixaban 5mg BID, Carvedilol 12.5mg BID, Lisinopril 5mg daily"
  },
  {
    id: "PT-7729",
    name: "Rohan Verma",
    age: 28,
    gender: "M",
    triageLevel: 4,
    status: "Waiting",
    riskScore: 0.12,
    riskClass: "LOW",
    admittedAt: "11:05 AM",
    assignedDoctor: "Dr. James Wilson",
    assignedNurse: "Nurse Carla",
    vitals: {
      heartRate: 72,
      bp: "120/80",
      spO2: 99,
      temp: 37.0,
      respiratoryRate: 16
    },
    diagnostics: {
      ef: 60,
      creatinine: 0.8,
      platelets: 230,
      tlc: 6.2
    },
    symptoms: "Dysuria, mild abdominal discomfort, query uncomplicated lower UTI.",
    history: "No significant prior history. Occasional exercise-induced asthma.",
    allergies: "No known drug allergies",
    medications: "Albuterol inhaler 2 puffs PRN for wheezing"
  },
  {
    id: "PT-8812",
    name: "David Chen",
    age: 63,
    gender: "M",
    triageLevel: 2,
    status: "In Triage",
    riskScore: 0.72,
    riskClass: "HIGH",
    admittedAt: "11:20 AM",
    assignedDoctor: "Dr. Robert Chase",
    assignedNurse: "Nurse Abed",
    vitals: {
      heartRate: 95,
      bp: "162/98",
      spO2: 91,
      temp: 37.4,
      respiratoryRate: 20
    },
    diagnostics: {
      ef: 42,
      creatinine: 1.9,
      platelets: 185,
      tlc: 14.1
    },
    symptoms: "Acute kidney injury signs, peripheral edema, hypertensive urgency.",
    history: "Chronic Kidney Disease (CKD) Stage 3b, Stage II Hypertension, Gout, chronic osteoarthrosis.",
    allergies: "NSAIDs (Aspirin/Ibuprofen - triggers asthma)",
    medications: "Lisinopril 40mg QD, Allopurinol 100mg daily, Amlodipine 5mg QD, Sodium Bicarbonate 650mg BID"
  },
  {
    id: "PT-3294",
    name: "Elena Rostova",
    age: 44,
    gender: "F",
    triageLevel: 3,
    status: "Waiting",
    riskScore: 0.35,
    riskClass: "MEDIUM",
    admittedAt: "11:45 AM",
    assignedDoctor: "Dr. Allison Cameron",
    assignedNurse: "Nurse Jackie",
    vitals: {
      heartRate: 85,
      bp: "134/86",
      spO2: 96,
      temp: 37.8,
      respiratoryRate: 18
    },
    diagnostics: {
      ef: 52,
      creatinine: 1.1,
      platelets: 240,
      tlc: 9.8
    },
    symptoms: "Dehydration, high fever, localized right-lower quadrant abdominal tenderness.",
    history: "Appendectomy in 2018, mild Migraines, irritable bowel syndrome (IBS).",
    allergies: "Sulfa drugs, Erythromycin",
    medications: "Sumatriptan 50mg oral PRN for migraine onset, probiotics daily"
  },
  {
    id: "PT-5412",
    name: "Marcus Aurelius",
    age: 68,
    gender: "M",
    triageLevel: 1,
    status: "In Triage",
    riskScore: 0.81,
    riskClass: "HIGH",
    admittedAt: "12:02 PM",
    assignedDoctor: "Dr. Gregory House",
    assignedNurse: "Nurse Hathaway",
    vitals: {
      heartRate: 112,
      bp: "155/100",
      spO2: 90,
      temp: 36.8,
      respiratoryRate: 24
    },
    diagnostics: {
      ef: 30,
      creatinine: 1.7,
      platelets: 198,
      tlc: 11.5
    },
    symptoms: "Suspected non-ST elevation acute coronary syndrome, chest burning with sweat.",
    history: "Prior Myocardial Infarction in 2019 (DES to LAD), Hypertension, Severe Hyperlipidemia, GERD.",
    allergies: "Shellfish, Iodine contrast dyes (requires premedication protocol)",
    medications: "Aspirin 81mg QD, Lisinopril 20mg daily, Rosuvastatin 40mg daily, Omeprazole 20mg daily"
  },
  {
    id: "PT-9023",
    name: "Sarah Jenkins",
    age: 35,
    gender: "F",
    triageLevel: 5,
    status: "Waiting",
    riskScore: 0.08,
    riskClass: "LOW",
    admittedAt: "12:15 PM",
    assignedDoctor: "Dr. Lisa Cuddy",
    assignedNurse: "Nurse Carla",
    vitals: {
      heartRate: 68,
      bp: "118/74",
      spO2: 100,
      temp: 36.5,
      respiratoryRate: 14
    },
    diagnostics: {
      ef: 65,
      creatinine: 0.7,
      platelets: 280,
      tlc: 5.4
    },
    symptoms: "Prescription refill request, chronic knee soreness with minimal swelling.",
    history: "No major chronic illnesses. Secondary Hypothyroidism post-thyroidectomy.",
    allergies: "No known drug allergies",
    medications: "Levothyroxine 112mcg PO daily (taken in the morning)"
  }
];
