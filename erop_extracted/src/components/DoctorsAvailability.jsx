import React, { useState } from 'react';
import { User, Activity, Clock, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DoctorsAvailability({ patients = [] }) {
  const staffMembers = [
    { id: 1, name: "Dr. Gregory House", specialty: "Diagnostic Medicine", capacity: 5 },
    { id: 2, name: "Dr. Lisa Cuddy", specialty: "Endocrinology", capacity: 5 },
    { id: 3, name: "Dr. James Wilson", specialty: "Oncology", capacity: 4 },
    { id: 4, name: "Dr. Eric Foreman", specialty: "Neurology", capacity: 0 },
    { id: 5, name: "Dr. Allison Cameron", specialty: "Immunology", capacity: 4 },
    { id: 6, name: "Dr. Robert Chase", specialty: "Intensive Care", capacity: 6 },
    { id: 7, name: "Nurse Jackie", specialty: "Emergency Triage", capacity: 8 },
    { id: 8, name: "Nurse Hathaway", specialty: "Critical Care", capacity: 5 },
    { id: 9, name: "Nurse Carla", specialty: "Observation", capacity: 10 },
    { id: 10, name: "Nurse Abed", specialty: "General Triage", capacity: 6 },
  ];

  const [selectedStaff, setSelectedStaff] = useState(null);

  const getStaffLoad = (staffName) => {
    return patients.filter(p => p.assignedDoctor === staffName || p.assignedNurse === staffName).length;
  };

  const getStaffStatus = (currentLoad, capacity) => {
    if (capacity === 0) return 'Off-shift';
    if (currentLoad >= capacity) return 'Busy';
    return 'Available';
  };

  const staff = staffMembers.map(member => {
    const currentLoad = getStaffLoad(member.name);
    return {
      ...member,
      status: getStaffStatus(currentLoad, member.capacity),
      load: `${currentLoad}/${member.capacity} patients`
    };
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Busy': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Off-shift': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Active Medical & Nursing Staff</h2>
        <p className="text-xs font-semibold text-slate-500 mt-1">Real-time staff availability and dynamic patient load distribution.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map(doc => (
          <div 
            key={doc.id} 
            onClick={() => setSelectedStaff(doc)}
            className="border border-slate-100 rounded-2xl p-4 flex flex-col justify-between bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 leading-none">{doc.name}</h3>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">{doc.specialty}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
              <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStatusColor(doc.status)}`}>
                {doc.status}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                <span>Load: {doc.load}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-800 leading-tight">{selectedStaff.name}</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{selectedStaff.specialty}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusColor(selectedStaff.status)}`}>
                        {selectedStaff.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {selectedStaff.load}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStaff(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto bg-white flex-1">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">Assigned Patients</h4>
                <div className="space-y-3">
                  {patients.filter(p => p.assignedDoctor === selectedStaff.name || p.assignedNurse === selectedStaff.name).length > 0 ? (
                    patients.filter(p => p.assignedDoctor === selectedStaff.name || p.assignedNurse === selectedStaff.name).map(patient => (
                      <div key={patient.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-slate-500">{patient.id}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${patient.riskClass === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {patient.riskClass} RISK
                            </span>
                          </div>
                          <h5 className="text-sm font-bold text-slate-800">{patient.name}</h5>
                          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                            Status: <span className="font-bold text-slate-700">{patient.status}</span> • ESI {patient.triageLevel}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm font-bold text-slate-400">No patients currently assigned.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
