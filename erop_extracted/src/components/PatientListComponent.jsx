import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  UserCheck,
  Activity,
  Heart,
  Thermometer,
  Eye,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Filter,
  X,
  FileText,
  User,
  AlertTriangle
} from "lucide-react";

export default function PatientListComponent({ patients, setPatients }) {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || "PT-4091");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL"); // ALL, HIGH, MEDIUM, LOW
  const [esiFilter, setEsiFilter] = useState("ALL"); // ALL, 1, 2, 3, 4, 5
  const [sortField, setSortField] = useState("riskScore"); // name, id, age, riskScore
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Filter and sort mechanism
  const filteredPatients = patients
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRisk = riskFilter === "ALL" || p.riskClass === riskFilter;
      const matchesEsi = esiFilter === "ALL" || p.triageLevel.toString() === esiFilter;

      return matchesSearch && matchesRisk && matchesEsi;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return sortOrder === "asc"
          ? valA - valB
          : valB - valA;
      }
    });

  const getTriageColor = (level) => {
    switch (level) {
      case 1: return "bg-rose-500 text-white border-rose-600";
      case 2: return "bg-red-500 text-white border-red-600";
      case 3: return "bg-amber-500 text-white border-amber-600";
      case 4: return "bg-blue-500 text-white border-blue-600";
      default: return "bg-slate-500 text-white border-slate-600";
    }
  };

  const getRiskColor = (score) => {
    if (score >= 0.6) return "text-rose-600 bg-rose-50 border-rose-200";
    if (score >= 0.3) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Critical":
        return "bg-rose-100 text-rose-800 border-rose-200 font-extrabold";
      case "In Triage":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Waiting":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "Admitted":
        return "bg-teal-100 text-teal-800 border-teal-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setPatients(prev =>
      prev.map(p => p.id === id ? { ...p, status: newStatus } : p)
    );
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-3xl border border-slate-200/70 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-xs">
        <div>
          <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase px-2.5 py-1 rounded-md border border-indigo-100">
            Clinical Registry
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight mt-2">
            Patient Admission Risk Directory
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Real-time emergency triage list with mortality risks and continuous telemetry stats.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
          {/* Header Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-xs"
            />
          </div>
          <button className="px-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0">
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Grid Layout containing filters, main table, and sidebar details panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column - Filter Panel and Main Table */}
        <div className="xl:col-span-8 space-y-4">
          
          {/* Advanced Search & Filtering Controls */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 space-y-4 shadow-xs">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Name or Patient ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Triage ESI filter dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ESI LEVEL:</span>
                <select
                  value={esiFilter}
                  onChange={(e) => setEsiFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-bold text-slate-600 focus:outline-none cursor-pointer hover:border-slate-300 transition-all"
                >
                  <option value="ALL">All ESI Levels</option>
                  <option value="1">ESI 1 - Resuscitation</option>
                  <option value="2">ESI 2 - Emergent</option>
                  <option value="3">ESI 3 - Urgent</option>
                  <option value="4">ESI 4 - Less Urgent</option>
                  <option value="5">ESI 5 - Non-Urgent</option>
                </select>
              </div>
            </div>

            {/* Quick Segmented Filter Tabs for Risk Categories */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {["ALL", "HIGH", "MEDIUM", "LOW"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setRiskFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      riskFilter === cat
                        ? "bg-white text-slate-800 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {cat} RISK
                  </button>
                ))}
              </div>

              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                Showing {filteredPatients.length} of {patients.length} Registered Patients
              </div>
            </div>
          </div>

          {/* Interactive Responsive Table Container */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th 
                      onClick={() => handleSort("id")}
                      className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100/60 select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Patient ID</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort("name")}
                      className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100/60 select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Patient Name</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort("age")}
                      className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100/60 select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Age / Gen</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                      Triage ESI
                    </th>
                    <th 
                      onClick={() => handleSort("riskScore")}
                      className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100/60 select-none text-right"
                    >
                      <div className="flex items-center gap-1 justify-end">
                        <span>Risk Score</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-slate-400 font-semibold text-xs">
                        No clinical patient match found in search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient) => {
                      const isSelected = selectedPatientId === patient.id;
                      return (
                        <tr
                          key={patient.id}
                          onClick={() => {
                            setSelectedPatientId(patient.id);
                            setIsModalOpen(true);
                          }}
                          className={`hover:bg-indigo-50/10 cursor-pointer transition-all ${
                            isSelected ? "bg-indigo-50/30 border-l-4 border-indigo-600 pl-3" : ""
                          }`}
                        >
                          {/* ID Column */}
                          <td className="p-4">
                            <span className="font-mono text-xs font-bold text-slate-500">
                              {patient.id}
                            </span>
                          </td>

                          {/* Name Column */}
                          <td className="p-4">
                            <div>
                              <div className="text-xs font-black text-slate-800">{patient.name}</div>
                              <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 shrink-0" />
                                <span>Admitted {patient.admittedAt}</span>
                              </div>
                            </div>
                          </td>

                          {/* Age Column */}
                          <td className="p-4">
                            <span className="text-xs font-bold text-slate-600">
                              {patient.age}y <span className="text-slate-400">({patient.gender})</span>
                            </span>
                          </td>

                          {/* Triage Level Badge */}
                          <td className="p-4">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getTriageColor(patient.triageLevel)}`}>
                              ESI {patient.triageLevel}
                            </span>
                          </td>

                          {/* Risk Score */}
                          <td className="p-4 text-right">
                            <div className="flex flex-col items-end">
                              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${getRiskColor(patient.riskScore)}`}>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  patient.riskScore >= 0.6 ? "bg-rose-500 animate-pulse" :
                                  patient.riskScore >= 0.3 ? "bg-amber-500" :
                                  "bg-emerald-500"
                                }`} />
                                {Math.round(patient.riskScore * 100)}%
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                                {patient.riskClass} Risk
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={patient.status}
                              onChange={(e) => handleStatusChange(patient.id, e.target.value)}
                              className={`text-[10px] font-black px-2.5 py-1 rounded-xl border cursor-pointer focus:outline-none transition-all ${getStatusBadge(patient.status)}`}
                            >
                              <option value="Waiting">Waiting</option>
                              <option value="In Triage">In Triage</option>
                              <option value="Critical">Critical</option>
                              <option value="Admitted">Admitted</option>
                              <option value="Discharged">Discharged</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Comprehensive Patient Clinical Details Drawer/Sidebar */}
        <div className="xl:col-span-4 bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 p-6 space-y-6 shadow-md shadow-slate-950/20">
          <div className="pb-4 border-b border-slate-800 flex justify-between items-start">
            <div>
              <span className="bg-indigo-950 text-indigo-400 text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-md border border-indigo-900/50">
                ACTIVE VITAL SIGNS
              </span>
              <h3 className="text-base font-extrabold text-white mt-2">
                {selectedPatient.name}
              </h3>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                Clinical Patient ID: {selectedPatient.id} ({selectedPatient.gender}, {selectedPatient.age} y/o)
              </p>
            </div>
            <div className={`p-2.5 rounded-xl border bg-slate-950/60 flex items-center justify-center shrink-0 ${
              selectedPatient.riskClass === "HIGH" ? "border-rose-900 text-rose-400" : "border-emerald-900 text-emerald-400"
            }`}>
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>

          {/* Core Diagnostics & Vitals Grid */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Real-time Telemetry Feed
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block leading-none">Heart Rate</span>
                  <span className="text-xs font-black text-slate-200 mt-1 block">
                    {selectedPatient.vitals.heartRate} <span className="text-[9px] font-normal text-slate-500">BPM</span>
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-teal-400 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block leading-none">Blood Pressure</span>
                  <span className="text-xs font-black text-slate-200 mt-1 block">
                    {selectedPatient.vitals.bp} <span className="text-[9px] font-normal text-slate-500">mmHg</span>
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block leading-none">Oxygen (SpO2)</span>
                  <span className="text-xs font-black text-slate-200 mt-1 block">
                    {selectedPatient.vitals.spO2}%
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5">
                <Thermometer className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block leading-none">Temperature</span>
                  <span className="text-xs font-black text-slate-200 mt-1 block">
                    {selectedPatient.vitals.temp}°C
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Staff */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Assigned Clinical Staff
            </h4>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex gap-4">
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Attending Doctor</span>
                <span className="text-xs text-slate-200 font-extrabold flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  {selectedPatient?.assignedDoctor || "Unassigned"}
                </span>
              </div>
              <div className="w-px bg-slate-800" />
              <div className="flex-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Triage Nurse</span>
                <span className="text-xs text-slate-200 font-extrabold flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  {selectedPatient?.assignedNurse || "Unassigned"}
                </span>
              </div>
            </div>
          </div>

          {/* Lab Diagnostics and Organ Indices */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Diagnostic & Lab Reports
            </h4>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-400">Ejection Fraction (EF)</span>
                <span className="font-black text-slate-200">{selectedPatient.diagnostics.ef}%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-400">Serum Creatinine</span>
                <span className="font-black text-slate-200">{selectedPatient.diagnostics.creatinine} mg/dL</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-400">Platelets Count</span>
                <span className="font-black text-slate-200">{selectedPatient.diagnostics.platelets} k/µL</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-400">Total Leukocyte Count</span>
                <span className="font-black text-slate-200">{selectedPatient.diagnostics.tlc} k/µL</span>
              </div>
            </div>
          </div>

          {/* Active Intake Assessment Symptoms box */}
          <div className="space-y-2 pt-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Admitting Presentation & Symptoms
            </h4>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
              <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                {selectedPatient.symptoms}
              </p>
            </div>
          </div>

          {/* Quick Care Directive Actions */}
          <div className="pt-2">
            <button 
              onClick={() => handleStatusChange(selectedPatient.id, "Discharged")}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-900/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Assessment Complete</span>
            </button>
          </div>

        </div>

      </div>

      {/* Patient Detailed Medical History & Telemetry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-950 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col z-10"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 border border-indigo-100 shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none">
                        {selectedPatient.name}
                      </h3>
                      <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/50">
                        {selectedPatient.id}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                      <span>{selectedPatient.gender}, {selectedPatient.age} years old</span>
                      <span className="text-slate-300">•</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Admitted at {selectedPatient.admittedAt}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-black px-3 py-1 rounded-full border ${getTriageColor(selectedPatient.triageLevel)}`}>
                    ESI {selectedPatient.triageLevel}
                  </span>
                  
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-xl border flex items-center gap-1.5 ${getRiskColor(selectedPatient.riskScore)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      selectedPatient.riskScore >= 0.6 ? "bg-rose-500 animate-pulse" :
                      selectedPatient.riskScore >= 0.3 ? "bg-amber-500" :
                      "bg-emerald-500"
                    }`} />
                    <span>{Math.round(selectedPatient.riskScore * 100)}% Mortality Risk</span>
                  </span>

                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                
                {/* Vitals Telemetry Section */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span>Real-Time Vital Signs & Telemetry</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Heart Rate */}
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Heart Rate</span>
                        <Heart className="w-4 h-4 text-rose-500" />
                      </div>
                      <div className="mt-3.5">
                        <span className="text-xl font-black text-slate-800">
                          {selectedPatient.vitals.heartRate}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">BPM</span>
                      </div>
                      <div className="mt-2 text-[9px] font-bold flex items-center gap-1">
                        {selectedPatient.vitals.heartRate > 100 ? (
                          <span className="text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Elevated</span>
                        ) : selectedPatient.vitals.heartRate < 60 ? (
                          <span className="text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Bradycardia</span>
                        ) : (
                          <span className="text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Normal</span>
                        )}
                      </div>
                    </div>

                    {/* Blood Pressure */}
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Blood Pressure</span>
                        <Activity className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="mt-3.5">
                        <span className="text-xl font-black text-slate-800">
                          {selectedPatient.vitals.bp}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">mmHg</span>
                      </div>
                      <div className="mt-2 text-[9px] font-bold flex items-center gap-1">
                        <span className="text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">Continuous</span>
                      </div>
                    </div>

                    {/* Oxygen Saturation */}
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Oxygen (SpO2)</span>
                        <Activity className="w-4 h-4 text-sky-500" />
                      </div>
                      <div className="mt-3.5">
                        <span className="text-xl font-black text-slate-800">
                          {selectedPatient.vitals.spO2}%
                        </span>
                      </div>
                      <div className="mt-2 text-[9px] font-bold flex items-center gap-1">
                        {selectedPatient.vitals.spO2 >= 95 ? (
                          <span className="text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Normal</span>
                        ) : selectedPatient.vitals.spO2 >= 90 ? (
                          <span className="text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Mild Hypoxia</span>
                        ) : (
                          <span className="text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 animate-pulse">Critical</span>
                        )}
                      </div>
                    </div>

                    {/* Temperature */}
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Temperature</span>
                        <Thermometer className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="mt-3.5">
                        <span className="text-xl font-black text-slate-800">
                          {selectedPatient.vitals.temp}°C
                        </span>
                      </div>
                      <div className="mt-2 text-[9px] font-bold flex items-center gap-1">
                        {selectedPatient.vitals.temp >= 37.8 ? (
                          <span className="text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Fever</span>
                        ) : selectedPatient.vitals.temp < 36.0 ? (
                          <span className="text-sky-500 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">Hypothermia</span>
                        ) : (
                          <span className="text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Normal</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical History Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Prior History */}
                  <div className="p-5 rounded-2xl border border-slate-200/80 space-y-3 bg-white">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>Prior Medical History</span>
                    </h5>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                      {selectedPatient.history || "No prior medical history specified on record."}
                    </p>
                  </div>

                  {/* Medications & Allergies */}
                  <div className="space-y-4">
                    {/* Medications */}
                    <div className="p-4 rounded-2xl border border-slate-200/80 space-y-2 bg-white">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span>Current Medications</span>
                      </div>
                      <p className="text-xs text-slate-600 font-bold leading-relaxed">
                        {selectedPatient.medications || "No active home medications reported."}
                      </p>
                    </div>

                    {/* Allergies */}
                    <div className="p-4 rounded-2xl border border-slate-200/80 space-y-2 bg-white">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Known Allergies</span>
                      </div>
                      <p className={`text-xs font-black leading-relaxed ${
                        selectedPatient.allergies && selectedPatient.allergies.toLowerCase() !== "no known drug allergies"
                          ? "text-rose-600 bg-rose-50/50 p-2 rounded-xl border border-rose-100"
                          : "text-slate-600"
                      }`}>
                        {selectedPatient.allergies || "No known allergies."}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Diagnostics and Presenting Symptoms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Diagnostics & Lab reports */}
                  <div className="p-5 rounded-2xl border border-slate-200/80 space-y-4 bg-white">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-slate-400" />
                      <span>Clinical Lab & Diagnostics</span>
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">Ejection Fraction</span>
                        <span className="text-sm font-black text-slate-700 mt-1 block">{selectedPatient.diagnostics.ef}%</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">Creatinine</span>
                        <span className="text-sm font-black text-slate-700 mt-1 block">{selectedPatient.diagnostics.creatinine} <span className="text-[9px] font-normal">mg/dL</span></span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">Platelets</span>
                        <span className="text-sm font-black text-slate-700 mt-1 block">{selectedPatient.diagnostics.platelets} <span className="text-[9px] font-normal">k/µL</span></span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">TLC Count</span>
                        <span className="text-sm font-black text-slate-700 mt-1 block">{selectedPatient.diagnostics.tlc} <span className="text-[9px] font-normal">k/µL</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Presenting Symptoms */}
                  <div className="p-5 rounded-2xl border border-slate-200/80 space-y-3 bg-white">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-indigo-500" />
                      <span>Presenting Complaints & Notes</span>
                    </h5>
                    <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-xl p-4">
                      <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                        {selectedPatient.symptoms}
                      </p>
                    </div>
                  </div>

                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span>Verified Clinical Telemetry Sync</span>
                </span>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-all text-center"
                  >
                    Close File
                  </button>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      handleStatusChange(selectedPatient.id, "Admitted");
                    }}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-900/10 text-center"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Admit Patient</span>
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
