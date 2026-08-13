import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  TrendingUp,
  Bell,
  Heart,
  LogOut,
  Menu,
  X,
  Shield,
  Stethoscope,
  Landmark,
  Clock,
  AlertTriangle,
  Layers,
  ChevronRight,
  PlusCircle,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import NurseDashboard from "./NurseDashboard.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import AuthorityDashboard from "./AuthorityDashboard.jsx";
import AlertNotificationTray from "./AlertNotificationTray.jsx";
import PatientListComponent from "./PatientListComponent.jsx";
import DoctorsAvailability from "./DoctorsAvailability.jsx";
import BedsAvailability from "./BedsAvailability.jsx";

export default function MainLayout({
  userRole,
  userEmail,
  onLogout,
  hospitalStats,
  hospitalsList,
  activeHospital,
  setActiveHospital,
  selectedModel,
  setSelectedModel,
  prediction,
  handlePredict,
  setPrediction,
  isLoading,
  clinicalError,
  alerts,
  handleAcknowledgeAlert,
  handleAddAlert,
  patients,
  setPatients,
  handleAddPatient
}) {
  const [activeTab, setActiveTab] = useState(() => {
    if (userRole === "nurse") return "patients";
    if (userRole === "admin") return "patients";
    if (userRole === "receptionist") return "doctors";
    if (userRole === "authority") return "analytics";
    return "patients";
  }); // dynamically defaults based on role
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Sub-tabs for patients view
  const [patientsSubTab, setPatientsSubTab] = useState("list"); // 'list' | 'triage'

  // Under the 'Analytics' tab, allow switching between facility congestion and regional overview
  const [analyticsSubTab, setAnalyticsSubTab] = useState(() => userRole === "authority" ? "regional" : "facility"); // 'facility' | 'regional'

  // Alert simulator states for dispatching test alerts
  const [simTitle, setSimTitle] = useState("");
  const [simMessage, setSimMessage] = useState("");
  const [simType, setSimType] = useState("WARNING");
  const [simSource, setSimSource] = useState(activeHospital || "Springfield General Hospital");

  // Get unread alerts count
  const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;

  let allowedTabs = [];
  if (userRole === "nurse") allowedTabs = ["patients", "doctors", "beds"];
  else if (userRole === "admin") allowedTabs = ["patients", "doctors", "beds", "analytics", "alerts"];
  else if (userRole === "receptionist") allowedTabs = ["doctors", "beds", "alerts"];
  else if (userRole === "authority") allowedTabs = ["analytics", "alerts"];

  const allTabs = [
    {
      id: "patients",
      label: "Patient List",
      icon: Users,
      badge: null,
      description: "Triage queue & mortality risk"
    },
    {
      id: "doctors",
      label: "Doctors",
      icon: Stethoscope,
      badge: null,
      description: "Active medical staff"
    },
    {
      id: "beds",
      label: "Beds",
      icon: CheckCircle,
      badge: null,
      description: "ER capacity tracker"
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: TrendingUp,
      badge: null,
      description: "ER capacity & simulations"
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: Bell,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : null,
      description: "Overcrowding warnings"
    }
  ];

  const tabs = allTabs.filter(t => allowedTabs.includes(t.id));

  // Ensure active tab is valid if role changes
  React.useEffect(() => {
    if (tabs.length > 0 && !tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [userRole, activeTab, tabs]);

  const roleLabels = {
    admin: { name: "Hospital Administrator", icon: Shield, color: "text-blue-400 bg-blue-950/40 border-blue-900/50" },
    receptionist: { name: "Hospital Receptionist", icon: Users, color: "text-indigo-400 bg-indigo-950/40 border-indigo-900/50" },
    nurse: { name: "Triage Nurse", icon: Stethoscope, color: "text-teal-400 bg-teal-950/40 border-teal-900/50" },
    authority: { name: "Health Authority", icon: Landmark, color: "text-purple-400 bg-purple-950/40 border-purple-200/20" }
  };

  const currentRole = roleLabels[userRole] || { name: "Clinical Staff", icon: Stethoscope, color: "text-indigo-400 bg-indigo-950/40 border-indigo-900/50" };
  const RoleIcon = currentRole.icon;

  const handleDispatchSimAlert = (e) => {
    e.preventDefault();
    if (!simTitle.trim() || !simMessage.trim()) return;

    handleAddAlert({
      id: "sim-" + Date.now(),
      type: simType,
      title: simTitle,
      message: simMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      source: simSource
    });

    // Reset fields
    setSimTitle("");
    setSimMessage("");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "patients":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* SUB-TAB NAV FOR PATIENTS */}
            <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl w-fit">
              <button
                onClick={() => setPatientsSubTab("list")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  patientsSubTab === "list"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Patient Registry Table
              </button>
              {userRole === "nurse" && (
                <button
                  onClick={() => setPatientsSubTab("triage")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    patientsSubTab === "triage"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Intake & Triage Diagnostics
                </button>
              )}
            </div>

            {patientsSubTab === "list" ? (
              <PatientListComponent patients={patients} setPatients={setPatients} />
            ) : (
              <NurseDashboard
                patients={patients}
                setPatients={setPatients}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                prediction={prediction}
                onPredict={handlePredict}
                onResetPrediction={setPrediction}
                isLoading={isLoading}
                error={clinicalError}
                onAddPatient={handleAddPatient}
              />
            )}
          </motion.div>
        );

      case "doctors":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <DoctorsAvailability patients={patients} />
          </motion.div>
        );
        
      case "beds":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <BedsAvailability />
          </motion.div>
        );

      case "analytics":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* SUB-TAB NAV FOR ANALYTICS */}
            <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl w-fit">
              {userRole !== "authority" && (
                <button
                  onClick={() => setAnalyticsSubTab("facility")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    analyticsSubTab === "facility"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Facility Capacity
                </button>
              )}
              {userRole !== "admin" && (
                <button
                  onClick={() => setAnalyticsSubTab("regional")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    analyticsSubTab === "regional"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Regional Overview
                </button>
              )}
            </div>

            {analyticsSubTab === "facility" ? (
              <AdminDashboard
                hospitalStats={hospitalStats}
                hospitals={hospitalsList}
                activeHospital={activeHospital}
                onHospitalChange={setActiveHospital}
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onAddAlert={handleAddAlert}
              />
            ) : (
              <AuthorityDashboard
                hospitalStats={hospitalStats}
                hospitals={hospitalsList}
              />
            )}
          </motion.div>
        );

      case "alerts":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Active alerts display */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-6">
                <h3 className="text-base font-black text-slate-800 tracking-tight mb-1">
                  Active Emergency Announcements
                </h3>
                <p className="text-xs font-semibold text-slate-400 mb-6">
                  Manage real-time overcrowding sirens and critical staff notifications.
                </p>
                <AlertNotificationTray
                  alerts={alerts}
                  onAcknowledge={handleAcknowledgeAlert}
                />
              </div>
            </div>

            {/* Simulated alert generator */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 p-6 space-y-6">
                <div>
                  <span className="bg-rose-950 text-rose-400 text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-md border border-rose-900/50">
                    ADMIN SIMULATOR
                  </span>
                  <h3 className="font-extrabold text-sm text-white mt-2">Dispatch Live System Alert</h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    Broadcast critical ER thresholds, pending mass casualties, or climate sirens.
                  </p>
                </div>

                <form onSubmit={handleDispatchSimAlert} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Alert Level
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSimType("CRITICAL")}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                          simType === "CRITICAL"
                            ? "border-rose-500 bg-rose-950/40 text-rose-300"
                            : "border-slate-800 bg-slate-950 text-slate-400"
                        }`}
                      >
                        CRITICAL (Red)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSimType("WARNING")}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                          simType === "WARNING"
                            ? "border-amber-500 bg-amber-950/40 text-amber-300"
                            : "border-slate-800 bg-slate-950 text-slate-400"
                        }`}
                      >
                        WARNING (Yellow)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Target Facility / Source
                    </label>
                    <select
                      value={simSource}
                      onChange={(e) => setSimSource(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {hospitalsList.length > 0 ? (
                        hospitalsList.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))
                      ) : (
                        <option value="Springfield General Hospital">Springfield General Hospital</option>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Headline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mass Casualty Protocol"
                      value={simTitle}
                      onChange={(e) => setSimTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Message Body
                    </label>
                    <textarea
                      placeholder="Specify estimated arrival times, ambulance details, or staffing deficit..."
                      value={simMessage}
                      onChange={(e) => setSimMessage(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-md shadow-indigo-900/20 flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Broadcast Active Alarm</span>
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans">
      
      {/* PERSISTENT SIDEBAR - DESKTOP */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-40 bg-slate-900 border-r border-slate-850 text-slate-300">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-850 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-900/50 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black text-white tracking-tight leading-none">EROP Platform</h1>
              <span className="bg-slate-800 text-slate-400 text-[9px] font-bold px-1 py-0.2 rounded border border-slate-700/50">
                v3.0
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase block mt-1">
              Clinical Intelligence
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all text-left cursor-pointer group ${
                  isActive
                    ? "bg-indigo-600 text-white font-extrabold shadow-md shadow-indigo-950/50"
                    : "text-slate-400 hover:bg-slate-850 hover:text-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`} />
                  <div>
                    <span className="text-xs block leading-none">{tab.label}</span>
                    <span className={`text-[9px] font-bold mt-1 block ${isActive ? "text-indigo-200" : "text-slate-500 group-hover:text-slate-400"}`}>
                      {tab.description}
                    </span>
                  </div>
                </div>
                {tab.badge !== null && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white text-indigo-700" : "bg-rose-950 text-rose-400 border border-rose-900/60"}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Session profile & active role */}
        <div className="p-4 border-t border-slate-850 space-y-4">
          <div className={`p-3 rounded-xl border flex items-center gap-3 ${currentRole.color}`}>
            <div className="p-2 bg-slate-900 rounded-lg text-slate-400">
              <RoleIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block leading-none">
                Logged In As
              </span>
              <span className="text-xs font-extrabold text-slate-200 block truncate mt-1">
                {userEmail}
              </span>
              <span className="text-[10px] font-bold text-slate-400 mt-0.5 block truncate">
                {currentRole.name}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE MENU SLIDEOUT DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />

            {/* Sidebar drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-850 text-slate-300 z-50 flex flex-col lg:hidden"
            >
              {/* Brand Header & Close btn */}
              <div className="p-6 border-b border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white">
                    <Heart className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-sm font-black text-white leading-none">EROP Platform</h1>
                    <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">Clinical Intelligence</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-1.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all text-left cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white font-extrabold shadow-md"
                          : "text-slate-400 hover:bg-slate-850 hover:text-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <div>
                          <span className="text-xs block leading-none">{tab.label}</span>
                          <span className={`text-[9px] font-bold mt-1 block ${isActive ? "text-indigo-200" : "text-slate-500"}`}>
                            {tab.description}
                          </span>
                        </div>
                      </div>
                      {tab.badge !== null && (
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white text-indigo-700" : "bg-rose-950 text-rose-400 border border-rose-900/60"}`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* User Session */}
              <div className="p-4 border-t border-slate-850 space-y-4">
                <div className={`p-3 rounded-xl border flex items-center gap-3 ${currentRole.color}`}>
                  <RoleIcon className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-extrabold text-slate-200 block truncate leading-none">
                      {userEmail}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 block truncate">
                      {currentRole.name}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="w-full px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER AREA */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        
        {/* Top header bar for both desktop context & mobile burger triggers */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 md:px-8 py-3.5 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumb / Title */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>EROP Core</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-indigo-600 font-extrabold">{tabs.find(t => t.id === activeTab)?.label}</span>
              </div>
              <h2 className="text-xs font-black text-slate-500 mt-0.5 hidden sm:block">
                {activeTab === "patients" && "Emergency Department Triage & Mortality Preds"}
                {activeTab === "analytics" && (analyticsSubTab === "facility" ? "Active Clinical Demands & Bed Simulations" : "Multi-Hospital Regional Coordination Maps")}
                {activeTab === "alerts" && "Real-time Threshold Monitoring Alarm Panel"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick date-time */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200/50 rounded-xl text-[10px] font-bold text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>

            {/* Quick Active alert bell */}
            {activeTab !== "alerts" && (
              <button
                onClick={() => setActiveTab("alerts")}
                className="relative p-2 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white animate-pulse" />
                )}
              </button>
            )}
          </div>

        </header>

        {/* Dynamic Main Workspace Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {renderContent()}
        </main>

      </div>

    </div>
  );
}
