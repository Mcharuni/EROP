"use strict";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Stethoscope,
  Users,
  Plus,
  ChevronRight,
  UserCheck,
  Search
} from "lucide-react";
import TelemetryForm from "./TelemetryForm.jsx";
import RiskGauge from "./RiskGauge.jsx";
import DiagnosisReport from "./DiagnosisReport.jsx";
export default function NurseDashboard({
  patients,
  setPatients,
  selectedModel,
  onModelChange,
  prediction,
  onPredict,
  onResetPrediction,
  isLoading,
  error,
  onAddPatient
}) {
  const [selectedPatient, setSelectedPatient] = useState(patients[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState("All");
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState(45);
  const [newGender, setNewGender] = useState("M");
  const [newTriage, setNewTriage] = useState(3);
  const [newAssignedDoctor, setNewAssignedDoctor] = useState("Dr. Gregory House");
  const sortedQueue = [...(patients || [])].filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.includes(searchQuery);
    const matchFilter = filterLevel === "All" || p.triageLevel === parseInt(filterLevel);
    return matchSearch && matchFilter;
  }).sort((a, b) => {
    if (a.triageLevel !== b.triageLevel) {
      return a.triageLevel - b.triageLevel;
    }
    return b.riskProbability - a.riskProbability;
  });
  const triageLabels = {
    1: { name: "ESI Level 1: Resuscitation", color: "bg-rose-500 text-white" },
    2: { name: "ESI Level 2: Emergent", color: "bg-red-500 text-white" },
    3: { name: "ESI Level 3: Urgent", color: "bg-amber-500 text-white" },
    4: { name: "ESI Level 4: Less Urgent", color: "bg-blue-500 text-white" },
    5: { name: "ESI Level 5: Non-Urgent", color: "bg-slate-500 text-white" }
  };
  const handleQueueStatusChange = (id, nextStatus) => {
    if (setPatients) {
      setPatients((prev) => prev.map((p) => p.id === id ? { ...p, status: nextStatus } : p));
    }
    if (selectedPatient?.id === id) {
      setSelectedPatient((prev) => prev ? { ...prev, status: nextStatus } : null);
    }
  };
  const handleRegisterPatient = (features) => {
    if (!prediction) return;
    const newQueueItem = {
      id: "PT-" + Math.floor(1e3 + Math.random() * 9e3),
      name: newName || "Anonymous Patient",
      age: newAge,
      gender: newGender,
      triageLevel: newTriage,
      status: "Waiting",
      riskProbability: prediction.probability,
      riskClass: prediction.isHighRisk ? "HIGH" : "LOW",
      admittedAt: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      features,
      analysisReport: prediction.analysis,
      assignedDoctor: newAssignedDoctor,
      assignedNurse: "Nurse Jackie"
    };
    if (onAddPatient) onAddPatient(newQueueItem);
    setSelectedPatient(newQueueItem);
    setShowAddForm(false);
    onResetPrediction();
    setNewName("");
    setNewAge(45);
    setNewGender("M");
    setNewTriage(3);
    setNewAssignedDoctor("Dr. Gregory House");
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/70 p-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
          /* @__PURE__ */ jsx("div", { className: "p-1.5 bg-teal-50 text-teal-600 rounded-lg shrink-0", children: /* @__PURE__ */ jsx(Stethoscope, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest block", children: "Triage Nurse Portal" })
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl md:text-2xl font-black text-slate-800 tracking-tight", children: "Admissions Intake & Triage Control" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 font-semibold text-xs mt-1", children: "Conduct AI clinical risk diagnostics, configure algorithm selections, and manage the active patient queue." })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
            setShowAddForm(!showAddForm);
            onResetPrediction();
          },
          className: "bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 px-5 text-xs font-bold transition-all shadow-md shadow-indigo-100 flex items-center gap-2 cursor-pointer whitespace-nowrap self-start",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { children: showAddForm ? "View Active Queue" : "New Intake Assessment" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: !showAddForm ? (
      /* ACTIVE PATIENT QUEUE VIEW */
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 15 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -15 },
          className: "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs", children: [
              /* @__PURE__ */ jsxs("div", { className: "p-5 border-b border-slate-100 space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("h3", { className: "font-extrabold text-sm text-slate-800 flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(Users, { className: "w-4 h-4 text-slate-400" }),
                    "Active Patient Queue (",
                    sortedQueue.length,
                    ")"
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md uppercase border border-slate-200/50", children: "Auto-sorted by priority level" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
                    /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-2.5 w-4 h-4 text-slate-400" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        placeholder: "Search queue (Name, ID)...",
                        value: searchQuery,
                        onChange: (e) => setSearchQuery(e.target.value),
                        className: "w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-slate-400 uppercase", children: "ESI Filter:" }),
                    /* @__PURE__ */ jsxs(
                      "select",
                      {
                        value: filterLevel,
                        onChange: (e) => setFilterLevel(e.target.value),
                        className: "bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-600 focus:outline-none cursor-pointer",
                        children: [
                          /* @__PURE__ */ jsx("option", { value: "All", children: "All Levels" }),
                          /* @__PURE__ */ jsx("option", { value: "1", children: "ESI Level 1 (Resuscitation)" }),
                          /* @__PURE__ */ jsx("option", { value: "2", children: "ESI Level 2 (Emergent)" }),
                          /* @__PURE__ */ jsx("option", { value: "3", children: "ESI Level 3 (Urgent)" }),
                          /* @__PURE__ */ jsx("option", { value: "4", children: "ESI Level 4 (Less Urgent)" }),
                          /* @__PURE__ */ jsx("option", { value: "5", children: "ESI Level 5 (Non-Urgent)" })
                        ]
                      }
                    )
                  ] })
                ] })
              ] }),
              sortedQueue.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-16 text-slate-400", children: [
                /* @__PURE__ */ jsx("p", { className: "font-bold text-sm", children: "No Patients in Queue" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-slate-400 mt-1", children: "Adjust your filters or add a new intake." })
              ] }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-slate-100", children: sortedQueue.map((patient) => {
                const isSelected = selectedPatient?.id === patient.id;
                const triLabel = triageLabels[patient.triageLevel];
                const isHigh = patient.riskClass === "HIGH";
                return /* @__PURE__ */ jsxs(
                  "div",
                  {
                    onClick: () => setSelectedPatient(patient),
                    className: `p-4 transition-all flex items-center justify-between gap-4 cursor-pointer ${isSelected ? "bg-indigo-50/30 border-l-4 border-indigo-600 pl-3" : "hover:bg-slate-50/50"}`,
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 space-y-1", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400", children: patient.id }),
                          /* @__PURE__ */ jsxs("span", { className: `text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${triLabel.color}`, children: [
                            "ESI ",
                            patient.triageLevel
                          ] })
                        ] }),
                        /* @__PURE__ */ jsx("h4", { className: "font-extrabold text-sm text-slate-800 leading-snug", children: patient.name }),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-[11px] font-semibold text-slate-400", children: [
                          /* @__PURE__ */ jsxs("span", { children: [
                            "Age: ",
                            patient.age,
                            " (",
                            patient.gender,
                            ")"
                          ] }),
                          /* @__PURE__ */ jsx("span", { children: "•" }),
                          /* @__PURE__ */ jsxs("span", { children: [
                            "Inflow: ",
                            patient.admittedAt
                          ] })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 shrink-0", children: [
                        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                          /* @__PURE__ */ jsx("span", { className: `text-[10px] font-black px-2 py-0.5 rounded-md ${isHigh ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`, children: isHigh ? "🚨 HIGH RISK" : "🟢 LOW RISK" }),
                          /* @__PURE__ */ jsxs("span", { className: "block text-[9px] font-bold text-slate-400 mt-1", children: [
                            "Prob: ",
                            Math.round(patient.riskProbability * 100),
                            "%"
                          ] })
                        ] }),
                        /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded-full ${patient.status === "Critical" ? "bg-red-100 text-red-700 font-extrabold" : patient.status === "In Triage" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`, children: patient.status }),
                        /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 text-slate-400" })
                      ] })
                    ]
                  },
                  patient.id
                );
              }) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 shadow-xs sticky top-4", children: selectedPatient ? /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "pb-4 border-b border-slate-100 flex justify-between items-start", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 block uppercase mb-1", children: "Active Telemetry Profile" }),
                  /* @__PURE__ */ jsx("h3", { className: "font-black text-lg text-slate-800 leading-tight", children: selectedPatient.name }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[11px] font-semibold text-slate-500 mt-1", children: [
                    /* @__PURE__ */ jsxs("span", { children: [
                      "Patient ID: ",
                      selectedPatient.id
                    ] }),
                    /* @__PURE__ */ jsx("span", { children: "•" }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      "Age: ",
                      selectedPatient.age,
                      " (",
                      selectedPatient.gender,
                      ")"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1.5 text-right", children: /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: selectedPatient.status,
                    onChange: (e) => handleQueueStatusChange(selectedPatient.id, e.target.value),
                    className: "bg-slate-50 border border-slate-200 rounded-xl py-1 px-3 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "Waiting", children: "Waiting" }),
                      /* @__PURE__ */ jsx("option", { value: "In Triage", children: "In Triage" }),
                      /* @__PURE__ */ jsx("option", { value: "Critical", children: "Critical" }),
                      /* @__PURE__ */ jsx("option", { value: "Admitted", children: "Admitted" }),
                      /* @__PURE__ */ jsx("option", { value: "Discharged", children: "Discharged" })
                    ]
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 p-3 rounded-xl border border-slate-200/50 text-center", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-slate-400 block mb-1", children: "Systolic EF" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-sm font-extrabold text-slate-800", children: [
                    selectedPatient.features?.EF ?? selectedPatient.diagnostics?.ef ?? "N/A",
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 p-3 rounded-xl border border-slate-200/50 text-center", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-slate-400 block mb-1", children: "Serum Creatinine" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-extrabold text-slate-800", children: selectedPatient.features?.CREATININE ?? selectedPatient.diagnostics?.creatinine ?? "N/A" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 p-3 rounded-xl border border-slate-200/50 text-center", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-slate-400 block mb-1", children: "Leucocytes TLC" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-extrabold text-slate-800", children: selectedPatient.features?.TLC ?? selectedPatient.diagnostics?.tlc ?? "N/A" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase", children: "Active Diagnostics" }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
                  (selectedPatient.features?.ACS === 1) && /* @__PURE__ */ jsx("span", { className: "bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-200", children: "ACS" }),
                  (selectedPatient.features?.AKI === 1) && /* @__PURE__ */ jsx("span", { className: "bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200", children: "AKI" }),
                  (selectedPatient.features?.HFREF === 1) && /* @__PURE__ */ jsx("span", { className: "bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200", children: "HFrEF" }),
                  (selectedPatient.features?.SHOCK === 1) && /* @__PURE__ */ jsx("span", { className: "bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200", children: "Shock" }),
                  (selectedPatient.features?.["CARDIOGENIC SHOCK"] === 1) && /* @__PURE__ */ jsx("span", { className: "bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded border border-red-300", children: "Cardiogenic Shock" }),
                  (selectedPatient.features?.HTN === 1 || selectedPatient.history?.includes("Hypertension") || selectedPatient.history?.includes("HTN")) && /* @__PURE__ */ jsx("span", { className: "bg-slate-50 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200", children: "HTN" }),
                  (selectedPatient.features?.CAD === 1 || selectedPatient.history?.includes("CAD")) && /* @__PURE__ */ jsx("span", { className: "bg-slate-50 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200", children: "CAD" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-4 bg-slate-50 rounded-2xl border border-slate-200/50 space-y-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase", children: "Computed Mortality Risk" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold text-slate-400 uppercase", children: [
                    "Model: ",
                    selectedModel
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "w-16 h-16 shrink-0 relative flex items-center justify-center font-black text-sm rounded-full border-4 border-indigo-600 text-indigo-700 bg-white", children: [
                    Math.round(selectedPatient.riskProbability * 100),
                    "%"
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("h4", { className: "font-extrabold text-xs text-slate-800 uppercase", children: selectedPatient.riskClass === "HIGH" ? "🚨 High Risk Cutoff Breached" : "🟢 Low Risk Profile" }),
                    /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium text-slate-400 leading-normal mt-0.5", children: "Calculated clinical probability of inpatient cardiac mortality or decompensation." })
                  ] })
                ] })
              ] }),
              selectedPatient.analysisReport && /* @__PURE__ */ jsx("div", { className: "pt-4 border-t border-slate-100", children: /* @__PURE__ */ jsx(DiagnosisReport, { markdownText: selectedPatient.analysisReport }) })
            ] }) : /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-slate-400 text-xs font-semibold", children: "Select a patient to inspect their active telemetry data." }) })
          ]
        }
      )
    ) : (
      /* STEP 2: REGISTER INTAKE DIAGNOSTIC WORKFLOW */
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 15 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -15 },
          className: "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 shadow-xs", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "font-black text-base text-slate-800 mb-1", children: "Step 1: Patient Details & Triage Urgency" }),
                /* @__PURE__ */ jsx("p", { className: "text-slate-400 font-semibold text-xs leading-normal", children: "Configure demographic markers and designate the Emergency Severity Index (ESI) level." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-100", children: [
                /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
                  /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5", children: "Patient Full Name" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: newName,
                      required: true,
                      onChange: (e) => setNewName(e.target.value),
                      className: "w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500",
                      placeholder: "e.g. Aarav Sharma"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5", children: "Age" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "number",
                      value: newAge,
                      onChange: (e) => setNewAge(parseInt(e.target.value) || 0),
                      className: "w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5", children: "Gender" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200", children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setNewGender("M"),
                        className: `flex-1 text-center py-1 text-xs font-bold rounded-lg cursor-pointer ${newGender === "M" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`,
                        children: "M"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setNewGender("F"),
                        className: `flex-1 text-center py-1 text-xs font-bold rounded-lg cursor-pointer ${newGender === "F" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`,
                        children: "F"
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5", children: "Emergency Severity Index (ESI)" }),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-5 gap-2", children: [1, 2, 3, 4, 5].map((level) => {
                  const active = newTriage === level;
                  return /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => setNewTriage(level),
                      className: `py-2 text-center rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${active ? "bg-slate-900 border-slate-900 text-white" : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"}`,
                      children: [
                        "ESI ",
                        level
                      ]
                    },
                    level
                  );
                }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[9px] font-bold text-slate-400 mt-1.5 px-0.5", children: [
                  /* @__PURE__ */ jsx("span", { children: "Level 1 (Resuscitation)" }),
                  /* @__PURE__ */ jsx("span", { children: "Level 5 (Non-Urgent)" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5", children: "Assign Attending Doctor" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: newAssignedDoctor,
                    onChange: (e) => setNewAssignedDoctor(e.target.value),
                    className: "w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "Dr. Gregory House", children: "Dr. Gregory House (Diagnostic Medicine)" }),
                      /* @__PURE__ */ jsx("option", { value: "Dr. Lisa Cuddy", children: "Dr. Lisa Cuddy (Endocrinology)" }),
                      /* @__PURE__ */ jsx("option", { value: "Dr. James Wilson", children: "Dr. James Wilson (Oncology)" }),
                      /* @__PURE__ */ jsx("option", { value: "Dr. Eric Foreman", children: "Dr. Eric Foreman (Neurology)" }),
                      /* @__PURE__ */ jsx("option", { value: "Dr. Allison Cameron", children: "Dr. Allison Cameron (Immunology)" }),
                      /* @__PURE__ */ jsx("option", { value: "Dr. Robert Chase", children: "Dr. Robert Chase (Intensive Care)" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t border-slate-100", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-black text-base text-slate-800 mb-1.5", children: "Step 2: Enter EMR Telemetry & Run Analysis" }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-slate-400 font-semibold text-xs leading-normal block", children: "Define lab values and select the clinical scoring algorithm." }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-slate-100/75 px-2.5 py-1 rounded-lg border border-slate-200", children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[9px] font-black text-slate-400 uppercase", children: "Algorithm:" }),
                    /* @__PURE__ */ jsxs(
                      "select",
                      {
                        value: selectedModel,
                        onChange: (e) => onModelChange(e.target.value),
                        className: "bg-transparent border-none text-[10px] font-extrabold text-slate-700 focus:outline-none cursor-pointer",
                        children: [
                          /* @__PURE__ */ jsx("option", { value: "Logistic Regression", children: "Logistic Regression" }),
                          /* @__PURE__ */ jsx("option", { value: "Random Forest", children: "Random Forest" }),
                          /* @__PURE__ */ jsx("option", { value: "XGBoost", children: "XGBoost" }),
                          /* @__PURE__ */ jsx("option", { value: "LightGBM", children: "LightGBM" }),
                          /* @__PURE__ */ jsx("option", { value: "Stacking Ensemble", children: "Stacking Ensemble" })
                        ]
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsx(TelemetryForm, { onSubmit: onPredict, isLoading })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 shadow-xs sticky top-4", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-black text-base text-slate-800 pb-3 border-b border-slate-100", children: "Diagnostic Output" }),
              /* @__PURE__ */ jsx(RiskGauge, { result: prediction, isLoading }),
              prediction ? /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0", children: /* @__PURE__ */ jsx(UserCheck, { className: "w-4 h-4" }) }),
                    /* @__PURE__ */ jsx("h4", { className: "font-extrabold text-xs text-emerald-900 uppercase", children: "Intake Diagnostics Complete" })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold text-emerald-800 leading-normal", children: "The clinical risk threshold has been evaluated. You can now save this profile and register them in the active ER queue." }),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        const featuresObj = prediction ? {
                          "TYPE OF ADMISSION-EMERGENCY/OPD": 1,
                          "ALCOHOL": 0,
                          "HTN": 0,
                          "CAD": 0,
                          "TLC": 10,
                          "PLATELETS": 150,
                          "CREATININE": 1,
                          "EF": 50,
                          "ACS": 0,
                          "HFREF": 0,
                          "HFNEF": 0,
                          "CHB": 0,
                          "AKI": 0,
                          "UTI": 0,
                          "CARDIOGENIC SHOCK": 0,
                          "SHOCK": 0,
                          "renal_risk_score": 0.8
                        } : {};
                        handleRegisterPatient(featuresObj);
                      },
                      className: "w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-4 text-xs font-bold transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2 cursor-pointer",
                      children: [
                        /* @__PURE__ */ jsx("span", { children: "Register Patient to Queue" }),
                        /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(DiagnosisReport, { markdownText: prediction.analysis || "" })
              ] }) : /* @__PURE__ */ jsx("div", { className: "bg-slate-50 p-6 rounded-2xl border border-slate-200/50 text-center text-slate-400 text-xs font-semibold py-12", children: 'Fill out the EMR telemetry form on the left and click "Run Clinical AI Diagnostic" to assess patient mortality risk.' })
            ] })
          ]
        }
      )
    ) })
  ] });
}
