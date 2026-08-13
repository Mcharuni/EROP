"use strict";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import {
  Shield,
  Activity,
  Users,
  BedDouble,
  Clock,
  AlertTriangle,
  Sliders,
  CheckCircle
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";
import AlertNotificationTray from "./AlertNotificationTray.jsx";
export default function AdminDashboard({
  hospitalStats,
  hospitals,
  activeHospital,
  onHospitalChange,
  alerts,
  onAcknowledgeAlert,
  onAddAlert
}) {
  const [scenario, setScenario] = useState("Normal");
  const [multiplier, setMultiplier] = useState(1);
  const [forecast, setForecast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [congestionView, setCongestionView] = useState("hourly");
  useEffect(() => {
    async function fetchForecast() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/er/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hospitalName: activeHospital,
            scenario,
            multiplier
          })
        });
        if (response.ok) {
          const data = await response.ok ? await response.json() : null;
          if (data) {
            setForecast(data);
            if (data.forecast.alertStatus === "RED") {
              const hasRedAlert = alerts.some((a) => a.source === activeHospital && a.type === "CRITICAL" && !a.acknowledged);
              if (!hasRedAlert) {
                onAddAlert({
                  id: "red-" + Date.now(),
                  type: "CRITICAL",
                  title: `CRITICAL CONGESTION WARNING`,
                  message: `ER Bed occupancy forecast is at ${data.forecast.resources.bedOccupancyRate}% under ${scenario} scenario. Nurse staffing deficit is ${data.forecast.resources.nurseDeficit}.`,
                  time: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  source: activeHospital
                });
              }
            } else if (data.forecast.alertStatus === "YELLOW") {
              const hasYellowAlert = alerts.some((a) => a.source === activeHospital && a.type === "WARNING" && !a.acknowledged);
              if (!hasYellowAlert) {
                onAddAlert({
                  id: "yellow-" + Date.now(),
                  type: "WARNING",
                  title: `Elevated Load Prediction`,
                  message: `Predicted inflow multiplier has reached ${data.finalMultiplier}x. Recommend auxiliary staff standby.`,
                  time: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  source: activeHospital
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching ER prediction:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchForecast();
  }, [activeHospital, scenario, multiplier]);
  const hData = hospitalStats?.[activeHospital] || {
    name: activeHospital,
    avgSatisfaction: 3.5,
    urgencyWaitTimes: { Low: 120, Medium: 90, High: 30, Critical: 10 },
    beds: 80,
    volumeByDay: { Monday: 200, Tuesday: 180, Wednesday: 190, Thursday: 220, Friday: 300, Saturday: 350, Sunday: 280 },
    waitTimeByHour: { "Late Morning": 60, "Afternoon": 85, "Evening": 110, "Night": 95, "Early Morning": 45 }
  };
  const waitTimesChartData = Object.keys(hData.urgencyWaitTimes).map((key) => ({
    name: key,
    "Wait Time (min)": hData.urgencyWaitTimes[key]
  }));
  const volumeChartData = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => ({
    day: day.substring(0, 3),
    "Patient Count": hData.volumeByDay[day] || 150
  }));
  const hourChartData = ["Early Morning", "Late Morning", "Afternoon", "Evening", "Night"].map((hour) => ({
    time: hour,
    "Avg Wait Time (min)": hData.waitTimeByHour[hour] || 50
  }));
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/70 p-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
          /* @__PURE__ */ jsx("div", { className: "p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0", children: /* @__PURE__ */ jsx(Shield, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest block", children: "Hospital Admin Command" })
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl md:text-2xl font-black text-slate-800 tracking-tight", children: "Emergency Room Congestion Center" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 font-semibold text-xs mt-1", children: "Analyze facility bed usage, schedule adjustments, and run time-series overcrowding scenarios." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs font-bold text-slate-400 whitespace-nowrap", children: "Active Hospital:" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            value: activeHospital,
            onChange: (e) => onHospitalChange(e.target.value),
            className: "bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer",
            children: hospitals.map((h) => /* @__PURE__ */ jsx("option", { value: h, children: h }, h))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-3", children: "Live Congestion Alarm" }),
          forecast ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: `w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md ${forecast.forecast.alertStatus === "RED" ? "bg-rose-500 shadow-rose-100 animate-pulse" : forecast.forecast.alertStatus === "YELLOW" ? "bg-amber-500 shadow-amber-100" : "bg-emerald-500 shadow-emerald-100"}`, children: forecast.forecast.alertStatus }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "font-extrabold text-slate-800 text-sm", children: forecast.forecast.alertStatus === "RED" ? "CRITICAL OVERCROWDING" : forecast.forecast.alertStatus === "YELLOW" ? "ELEVATED CONGESTION" : "NOMINAL CAPACITY" }),
                /* @__PURE__ */ jsxs("p", { className: "text-[11px] font-medium text-slate-400 mt-0.5", children: [
                  "Based on ",
                  forecast.forecast.resources.bedOccupancyRate,
                  "% forecast bed occupancy."
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 p-3 rounded-xl border border-slate-200/50", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1", children: "System Recommendation" }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold text-slate-600 leading-normal", children: forecast.forecast.alertStatus === "RED" ? `⚠️ Deploy emergency backup nurse staffing immediately. Open auxiliary ward beds and delay elective admits.` : forecast.forecast.alertStatus === "YELLOW" ? `⚡ Put evening on-call nurses on standby. Re-evaluate bed discharges to secure capacity buffer.` : `🟢 Maintain standard shifts. Bed capacity buffer is comfortable and staffing is sufficient.` })
            ] })
          ] }) : /* @__PURE__ */ jsx("div", { className: "py-8 text-center text-slate-400 text-xs font-semibold", children: "Loading live metrics..." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pt-4 border-t border-slate-100 mt-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 block mb-0.5", children: "Active Beds" }),
            /* @__PURE__ */ jsxs("span", { className: "text-base font-black text-slate-800", children: [
              hData.beds,
              " Capacity"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 block mb-0.5", children: "Satisfaction" }),
            /* @__PURE__ */ jsxs("span", { className: "text-base font-black text-indigo-600", children: [
              hData.avgSatisfaction,
              " / 5"
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-wider", children: "Avg Reg & Triage Time" }),
              /* @__PURE__ */ jsx("div", { className: "p-1 bg-violet-50 text-violet-600 rounded-lg", children: /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }) })
            ] }),
            /* @__PURE__ */ jsxs("h3", { className: "text-2xl font-black text-slate-800", children: [
              Math.round(hData.urgencyWaitTimes.Medium * 0.4),
              " min"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold text-slate-400 mt-1", children: "From intake registration to triage nurse evaluation." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-400", children: [
            "Dataset Average for ",
            activeHospital
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-wider", children: "Urgent Care Wait Time" }),
              /* @__PURE__ */ jsx("div", { className: "p-1 bg-amber-50 text-amber-600 rounded-lg", children: /* @__PURE__ */ jsx(Activity, { className: "w-4 h-4" }) })
            ] }),
            /* @__PURE__ */ jsxs("h3", { className: "text-2xl font-black text-amber-600", children: [
              hData.urgencyWaitTimes.High,
              " min"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold text-slate-400 mt-1", children: "Average wait for patients flagged as Urgency Level: High." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-400", children: [
            "Critical Level: ",
            hData.urgencyWaitTimes.Critical,
            " min average"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-wider", children: "Baseline Weekly Load" }),
              /* @__PURE__ */ jsx("div", { className: "p-1 bg-blue-50 text-blue-600 rounded-lg", children: /* @__PURE__ */ jsx(Users, { className: "w-4 h-4" }) })
            ] }),
            /* @__PURE__ */ jsx("h3", { className: "text-2xl font-black text-slate-800", children: Object.values(hData.volumeByDay).reduce((a, b) => a + b, 0) }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold text-slate-400 mt-1", children: "Total admissions documented in the historical dataset." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "pt-3 border-t border-slate-100 text-[10px] font-bold text-emerald-600 flex items-center gap-1", children: /* @__PURE__ */ jsx("span", { children: "● Operational Ready" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsx("span", { className: "bg-indigo-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-md", children: "PREDICTIVE MODEL" }),
            /* @__PURE__ */ jsx("h3", { className: "font-extrabold text-base text-white tracking-tight", children: "ER Overcrowding Prediction Engine" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-xs font-semibold", children: "Select seasonal disease patterns or atmospheric scenarios to forecast patient arrival and staffing requirements." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: ["Normal", "Flu Outbreak", "Extreme Weather", "Holiday Surge", "Local Sports Festival"].map((scen) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setScenario(scen),
            className: `px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${scenario === scen ? "bg-indigo-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`,
            children: scen
          },
          scen
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-4 space-y-5 bg-slate-950 p-5 rounded-2xl border border-slate-800", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Sliders, { className: "w-3.5 h-3.5" }),
                "Inflow Multiplier"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs font-black text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900", children: [
                multiplier.toFixed(1),
                "x Rate"
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "range",
                min: "1.0",
                max: "2.5",
                step: "0.1",
                value: multiplier,
                onChange: (e) => setMultiplier(parseFloat(e.target.value)),
                className: "w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[9px] font-bold text-slate-500", children: [
              /* @__PURE__ */ jsx("span", { children: "1.0x (Standard)" }),
              /* @__PURE__ */ jsx("span", { children: "2.5x (Severe Epidemic)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1 pt-3 border-t border-slate-800", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase", children: "Active Profile Description" }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold text-slate-300 leading-relaxed", children: forecast?.scenarioDescription || "Standard operations." })
          ] }),
          forecast && /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t border-slate-800 space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 text-center", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/50 p-2.5 rounded-xl border border-slate-800", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-slate-400 block mb-0.5", children: "Alert Level" }),
                /* @__PURE__ */ jsx("span", { className: `text-xs font-black uppercase ${forecast.forecast.alertStatus === "RED" ? "text-rose-400" : forecast.forecast.alertStatus === "YELLOW" ? "text-amber-400" : "text-emerald-400"}`, children: forecast.forecast.alertStatus })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/50 p-2.5 rounded-xl border border-slate-800", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-slate-400 block mb-0.5", children: "Inflow Factor" }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs font-black text-indigo-400", children: [
                  forecast.finalMultiplier,
                  "x Scale"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/50 p-2.5 rounded-xl border border-slate-800 text-center", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-slate-400 block mb-0.5", children: "Detected Peak Congestion Hours" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-black text-amber-400", children: forecast.forecast.peakHoursDetected?.join(", ") || "None predicted" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-8 space-y-5", children: isLoading ? /* @__PURE__ */ jsx("div", { className: "h-64 flex items-center justify-center text-slate-400 font-bold text-xs", children: "Computing regression & forecast matrices..." }) : forecast ? /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: Object.entries(forecast.forecast.arrivals).map(([time, val]) => /* @__PURE__ */ jsxs("div", { className: "bg-slate-800 rounded-xl p-4 border border-slate-700/60 flex flex-col justify-between", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-bold text-slate-400 uppercase", children: [
              "Predicted Arrivals (",
              time,
              ")"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1 mt-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-2xl font-black text-slate-100", children: val }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400 font-semibold", children: "patients" })
            ] })
          ] }, time)) }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase", children: "Bed Capacity Utilization" }),
                /* @__PURE__ */ jsx(BedDouble, { className: "w-4 h-4 text-slate-400" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xl font-black text-slate-100", children: forecast.forecast.resources.bedsOccupied }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-400 font-semibold", children: [
                  "/ ",
                  forecast.forecast.resources.maxBeds,
                  " beds"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: `h-full transition-all duration-500 rounded-full ${forecast.forecast.resources.bedOccupancyRate > 85 ? "bg-rose-500" : forecast.forecast.resources.bedOccupancyRate > 70 ? "bg-amber-500" : "bg-emerald-500"}`,
                  style: { width: `${forecast.forecast.resources.bedOccupancyRate}%` }
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[9px] font-semibold text-slate-400", children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  "Rate: ",
                  forecast.forecast.resources.bedOccupancyRate,
                  "%"
                ] }),
                /* @__PURE__ */ jsxs("span", { children: [
                  forecast.forecast.resources.maxBeds - forecast.forecast.resources.bedsOccupied,
                  " available"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase", children: "Nurses Staffing Forecast" }),
                /* @__PURE__ */ jsx(Users, { className: "w-4 h-4 text-slate-400" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xl font-black text-slate-100", children: forecast.forecast.resources.recommendedNurses }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-400 font-semibold", children: [
                  "Req (",
                  forecast.forecast.resources.activeNurses,
                  " Active)"
                ] })
              ] }),
              forecast.forecast.resources.nurseDeficit > 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-rose-950/40 border border-rose-900/60 p-2 rounded-lg text-[10px] font-bold text-rose-300 mt-2 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(AlertTriangle, { className: "w-3.5 h-3.5" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "Deficit: ",
                  forecast.forecast.resources.nurseDeficit,
                  " staff required"
                ] })
              ] }) : /* @__PURE__ */ jsxs("div", { className: "bg-emerald-950/40 border border-emerald-900/60 p-2 rounded-lg text-[10px] font-bold text-emerald-300 mt-2 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(CheckCircle, { className: "w-3.5 h-3.5" }),
                /* @__PURE__ */ jsx("span", { children: "Nurse staffing is sufficient" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase", children: "Doctors Staffing Forecast" }),
                /* @__PURE__ */ jsx(Users, { className: "w-4 h-4 text-slate-400" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1.5", children: [
                /* @__PURE__ */ jsx("span", { className: "text-xl font-black text-slate-100", children: forecast.forecast.resources.recommendedDoctors }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-400 font-semibold", children: [
                  "Req (",
                  forecast.forecast.resources.activeDoctors,
                  " Active)"
                ] })
              ] }),
              forecast.forecast.resources.doctorDeficit > 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-rose-950/40 border border-rose-900/60 p-2 rounded-lg text-[10px] font-bold text-rose-300 mt-2 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(AlertTriangle, { className: "w-3.5 h-3.5" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "Deficit: ",
                  forecast.forecast.resources.doctorDeficit,
                  " staff required"
                ] })
              ] }) : /* @__PURE__ */ jsxs("div", { className: "bg-emerald-950/40 border border-emerald-900/60 p-2 rounded-lg text-[10px] font-bold text-emerald-300 mt-2 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(CheckCircle, { className: "w-3.5 h-3.5" }),
                /* @__PURE__ */ jsx("span", { children: "Doctor staffing is sufficient" })
              ] })
            ] })
          ] })
        ] }) : null })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl border border-slate-200 p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "font-extrabold text-sm text-slate-800", children: "Historical Wait Times by Urgency" }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400 font-bold block mt-0.5", children: "Computed directly from clinical ER admission records" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-64 w-full", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: waitTimesChartData, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "#f1f5f9" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "name", stroke: "#94a3b8", fontSize: 11, tickLine: false }),
          /* @__PURE__ */ jsx(YAxis, { stroke: "#94a3b8", fontSize: 11, tickLine: false }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: { fontSize: "11px", borderRadius: "10px", border: "1px solid #e2e8f0" } }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "Wait Time (min)", fill: "#4f46e5", radius: [6, 6, 0, 0] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl border border-slate-200 p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "font-extrabold text-sm text-slate-800", children: congestionView === "hourly" ? "Hourly Congestion Trend" : "Weekly Admissions Volume" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400 font-bold block mt-0.5", children: congestionView === "hourly" ? "Diurnal fluctuations in average wait times" : "Historical admission patterns by day of the week" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200", children: [
            /* @__PURE__ */ jsx("button", {
              onClick: () => setCongestionView("hourly"),
              className: `px-2 py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${congestionView === "hourly" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"}`,
              children: "Hourly"
            }),
            /* @__PURE__ */ jsx("button", {
              onClick: () => setCongestionView("weekly"),
              className: `px-2 py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${congestionView === "weekly" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"}`,
              children: "Weekly"
            })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-64 w-full", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: congestionView === "hourly" ? (
          /* @__PURE__ */ jsxs(AreaChart, { data: hourChartData, children: [
            /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "colorWait", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "#818cf8", stopOpacity: 0.3 }),
              /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "#818cf8", stopOpacity: 0 })
            ] }) }),
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "#f1f5f9" }),
            /* @__PURE__ */ jsx(XAxis, { dataKey: "time", stroke: "#94a3b8", fontSize: 11, tickLine: false }),
            /* @__PURE__ */ jsx(YAxis, { stroke: "#94a3b8", fontSize: 11, tickLine: false }),
            /* @__PURE__ */ jsx(Tooltip, { contentStyle: { fontSize: "11px", borderRadius: "10px", border: "1px solid #e2e8f0" } }),
            /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "Avg Wait Time (min)", stroke: "#4f46e5", fillOpacity: 1, fill: "url(#colorWait)", strokeWidth: 2 })
          ] })
        ) : (
          /* @__PURE__ */ jsxs(BarChart, { data: volumeChartData, children: [
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "#f1f5f9" }),
            /* @__PURE__ */ jsx(XAxis, { dataKey: "day", stroke: "#94a3b8", fontSize: 11, tickLine: false }),
            /* @__PURE__ */ jsx(YAxis, { stroke: "#94a3b8", fontSize: 11, tickLine: false }),
            /* @__PURE__ */ jsx(Tooltip, { contentStyle: { fontSize: "11px", borderRadius: "10px", border: "1px solid #e2e8f0" } }),
            /* @__PURE__ */ jsx(Bar, { dataKey: "Patient Count", fill: "#3b82f6", radius: [6, 6, 0, 0] })
          ] })
        ) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AlertNotificationTray, { alerts, onAcknowledge: onAcknowledgeAlert })
  ] });
}
