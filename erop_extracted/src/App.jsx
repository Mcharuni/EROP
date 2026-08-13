"use strict";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import AuthPage from "./components/AuthPage.jsx";
import MainLayout from "./components/MainLayout.jsx";
import { MOCK_PATIENTS } from "./data/mockPatients.js";

export default function App() {
  const [userRole, setUserRole] = useState(() => {
    const saved = localStorage.getItem("erop_user_role");
    return saved || null;
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem("erop_user_email") || "";
  });
  const [hospitalStats, setHospitalStats] = useState(null);
  const [hospitalsList, setHospitalsList] = useState([]);
  const [activeHospital, setActiveHospital] = useState("Springfield General Hospital");
  const [selectedModel, setSelectedModel] = useState("Logistic Regression");
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clinicalError, setClinicalError] = useState(null);
  const [alerts, setAlerts] = useState([
    {
      id: "alert-1",
      type: "WARNING",
      title: "Incoming High-Priority Ambulance",
      message: "Multiple trauma cases routed to Springfield General. Estimated ETA: 12 minutes.",
      time: "11:22 AM",
      source: "Springfield General Hospital"
    }
  ]);
  const [patients, setPatients] = useState(MOCK_PATIENTS);

  const handleAddPatient = (newPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
  };
  useEffect(() => {
    async function fetchERStats() {
      try {
        const response = await fetch("/api/er/stats");
        if (response.ok) {
          const data = await response.json();
          setHospitalStats(data.stats);
          setHospitalsList(data.hospitals);
          if (data.hospitals && data.hospitals.length > 0) {
            if (!data.hospitals.includes(activeHospital)) {
              setActiveHospital(data.hospitals[0]);
            }
          }
        }
      } catch (err) {
        console.error("Error loading ER dataset stats:", err);
      }
    }
    fetchERStats();
  }, [activeHospital]);
  const handleLogin = (role, email) => {
    setUserRole(role);
    setUserEmail(email);
    localStorage.setItem("erop_user_role", role);
    localStorage.setItem("erop_user_email", email);
  };
  const handleLogout = () => {
    setUserRole(null);
    setUserEmail("");
    localStorage.removeItem("erop_user_role");
    localStorage.removeItem("erop_user_email");
  };
  const handlePredict = async (data) => {
    setIsLoading(true);
    setClinicalError(null);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          features: data.features,
          rawString: data.rawString
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Prediction request failed.");
      }
      const resData = await response.json();
      setPrediction(resData);
    } catch (err) {
      console.error("Clinical Prediction Error:", err);
      setClinicalError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleAcknowledgeAlert = (id) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));
  };
  const handleAddAlert = (newAlert) => {
    setAlerts((prev) => [newAlert, ...prev]);
  };
  if (!userRole) {
    return /* @__PURE__ */ jsx(AuthPage, { onLogin: handleLogin });
  }

  return (
    <MainLayout
      userRole={userRole}
      userEmail={userEmail}
      onLogout={handleLogout}
      hospitalStats={hospitalStats}
      hospitalsList={hospitalsList}
      activeHospital={activeHospital}
      setActiveHospital={setActiveHospital}
      selectedModel={selectedModel}
      setSelectedModel={setSelectedModel}
      prediction={prediction}
      handlePredict={handlePredict}
      setPrediction={setPrediction}
      isLoading={isLoading}
      clinicalError={clinicalError}
      alerts={alerts}
      handleAcknowledgeAlert={handleAcknowledgeAlert}
      handleAddAlert={handleAddAlert}
      patients={patients}
      setPatients={setPatients}
      handleAddPatient={handleAddPatient}
    />
  );
}
