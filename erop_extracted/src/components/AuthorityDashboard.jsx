"use strict";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import {
  Landmark,
  CloudSnow,
  Compass,
  AlertTriangle,
  Sun,
  CloudRain,
  MapPin
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts";
export default function AuthorityDashboard({ hospitalStats, hospitals }) {
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [activeWeather, setActiveWeather] = useState("Clear");
  const [activeOutbreak, setActiveOutbreak] = useState("None");
  const [focusedHospital, setFocusedHospital] = useState("Springfield General Hospital");
  const [segmentView, setSegmentView] = useState("age");
  const [hasHoliday, setHasHoliday] = useState(false);
  const [hasAccident, setHasAccident] = useState(false);
  const [hasProtest, setHasProtest] = useState(false);
  const hospitalLocations = {
    "Springfield General Hospital": { x: 35, y: 40, region: "Urban", info: "Primary tertiary Level 1 Trauma center." },
    "Northside Community Hospital": { x: 65, y: 25, region: "Rural", info: "Regional community hospital handling acute admissions." },
    "Riverside Medical Center": { x: 25, y: 70, region: "Urban", info: "Urban healthcare facility focusing on medical & surgical admits." },
    "St. Mary’s Regional Health": { x: 80, y: 65, region: "Rural", info: "Rural medical outreach clinic with restricted bed size." },
    "Summit Health Center": { x: 50, y: 85, region: "Urban", info: "Large sub-urban inpatient facility with modular wards." }
  };
  const weatherModifiers = {
    Rain: { label: "Heavy Rain / Storm", multiplier: 1.18, icon: CloudRain, color: "text-blue-400 bg-blue-950/40" },
    Snow: { label: "Snow / Freezing Temp", multiplier: 1.32, icon: CloudSnow, color: "text-sky-300 bg-sky-950/40" },
    Clear: { label: "Mild / Clear Skies", multiplier: 1, icon: Sun, color: "text-amber-400 bg-amber-950/40" },
    Overcast: { label: "Dense Overcast / Fog", multiplier: 1.1, icon: Compass, color: "text-slate-400 bg-slate-950/40" }
  };
  const outbreakModifiers = {
    Flu: { label: "Influenza Epidemic", multiplier: 1.45, color: "bg-rose-950 text-rose-300 border-rose-900" },
    Heatwave: { label: "Extreme Heatwave", multiplier: 1.25, color: "bg-orange-950 text-orange-300 border-orange-900" },
    None: { label: "No Active Outbreaks", multiplier: 1, color: "bg-slate-850 text-slate-400 border-slate-800" }
  };
  const weatherMulti = weatherModifiers[activeWeather].multiplier;
  const outbreakMulti = outbreakModifiers[activeOutbreak].multiplier;
  let eventMulti = 1;
  if (hasHoliday) eventMulti += 0.20;
  if (hasAccident) eventMulti += 0.15;
  if (hasProtest) eventMulti += 0.10;
  const combinedMultiplier = parseFloat((weatherMulti * outbreakMulti * eventMulti).toFixed(2));

  const demographicData = [
    { name: "Pediatric (<18)", value: 12 },
    { name: "Young Adult (18-40)", value: 24 },
    { name: "Adult (40-65)", value: 38 },
    { name: "Geriatric (>65)", value: 26 }
  ];

  const triageData = [
    { name: "ESI 1 (Critical)", value: 8 },
    { name: "ESI 2 (Emergent)", value: 18 },
    { name: "ESI 3 (Urgent)", value: 44 },
    { name: "ESI 4 (Less Urgent)", value: 22 },
    { name: "ESI 5 (Non-Urgent)", value: 8 }
  ];

  const conditionData = [
    { name: "Cardiac / ACS", value: 34 },
    { name: "Renal / AKI", value: 16 },
    { name: "Respiratory / Flu", value: 28 },
    { name: "Injury / Trauma", value: 22 }
  ];

  const getSegmentData = () => {
    switch (segmentView) {
      case "triage":
        return triageData;
      case "condition":
        return conditionData;
      case "age":
      default:
        return demographicData;
    }
  };

  const currentSegmentData = getSegmentData();
  const SEGMENT_COLORS = ["#818cf8", "#34d399", "#fb7185", "#f59e0b", "#10b981", "#6366f1"];
  const seasonalityData = [
    { season: "Winter", "Springfield General": 450, "Northside": 210, "Riverside": 380, "St. Mary's": 120 },
    { season: "Spring", "Springfield General": 380, "Northside": 190, "Riverside": 310, "St. Mary's": 95 },
    { season: "Summer", "Springfield General": 420, "Northside": 240, "Riverside": 350, "St. Mary's": 150 },
    { season: "Fall", "Springfield General": 390, "Northside": 180, "Riverside": 330, "St. Mary's": 105 }
  ];
  const comparisonChartData = hospitals.map((hName) => {
    const stats = hospitalStats?.[hName] || {
      name: hName,
      avgSatisfaction: 3.5,
      urgencyWaitTimes: { Low: 120, Medium: 95, High: 45, Critical: 15 },
      beds: 80,
      volumeByDay: { Friday: 180 }
    };
    const baseWait = stats.urgencyWaitTimes.Medium || 80;
    const estimatedModifiedWait = Math.round(baseWait * combinedMultiplier);
    return {
      name: hName.replace(" Hospital", "").replace(" Medical Center", "").replace(" Regional Health", "").replace(" Health Center", ""),
      "Avg Wait Time (min)": estimatedModifiedWait,
      "Bed Size": stats.beds,
      "Satisfaction Index": Math.round(stats.avgSatisfaction * 20),
      // map 5 stars to 100 max
      originalStats: stats
    };
  });
  const focusedData = comparisonChartData.find((c) => c.name === focusedHospital.replace(" Hospital", "").replace(" Medical Center", "").replace(" Regional Health", "").replace(" Health Center", ""));
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/70 p-6", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
        /* @__PURE__ */ jsx("div", { className: "p-1.5 bg-purple-50 text-purple-600 rounded-lg shrink-0", children: /* @__PURE__ */ jsx(Landmark, { className: "w-4 h-4" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest block", children: "Regional Health Command" })
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl md:text-2xl font-black text-slate-800 tracking-tight", children: "Region-Wide Epidemiological & ER Analytics" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-500 font-semibold text-xs mt-1", children: "Conduct strategic regional capacity comparisons, simulate epidemic and weather shocks, and analyze historical data profiles." })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-8 bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("span", { className: "bg-purple-900/60 text-purple-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded-md", children: "ENVIRONMENTAL CONTROLS" }),
          /* @__PURE__ */ jsx("h3", { className: "font-extrabold text-sm text-white", children: "External Event Shocks Simulation" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-slate-400", children: "Incorporate real-time climate and public health variables to estimate wait-time and inflow offsets across the region." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase block", children: "Active Meteorological Conditions" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: Object.keys(weatherModifiers).map((wKey) => {
              const active = activeWeather === wKey;
              const Icon = weatherModifiers[wKey].icon;
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setActiveWeather(wKey),
                  className: `p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${active ? "border-blue-600 bg-blue-950/50 text-blue-200 shadow-md shadow-blue-900/20" : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"}`,
                  children: [
                    /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold", children: weatherModifiers[wKey].label.split(" / ")[0] })
                  ]
                },
                wKey
              );
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase block", children: "Public Health Alerts" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2", children: Object.keys(outbreakModifiers).map((oKey) => {
              const active = activeOutbreak === oKey;
              const cfg = outbreakModifiers[oKey];
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => setActiveOutbreak(oKey),
                  className: `w-full p-2.5 rounded-xl border text-left flex justify-between items-center transition-all cursor-pointer ${active ? `${cfg.color} border-rose-500/50 shadow-md shadow-rose-950/20` : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"}`,
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold", children: cfg.label }),
                    /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black", children: cfg.multiplier > 1 ? `+${Math.round((cfg.multiplier - 1) * 100)}% inflow` : "No offset" })
                  ]
                },
                oKey
              );
            }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2.5", children: [
            /* @__PURE__ */ jsx("label", { className: "text-[10px] font-black text-slate-400 uppercase block", children: "Local Events & Incidents" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("button", {
                onClick: () => setHasHoliday(!hasHoliday),
                className: `w-full p-2.5 rounded-xl border text-left flex justify-between items-center transition-all cursor-pointer ${hasHoliday ? "bg-amber-950/60 border-amber-500 text-amber-200 shadow-md shadow-amber-950/20" : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"}`,
                children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold", children: "Public Holiday" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black text-amber-400", children: "+20% load" })
                ]
              }),
              /* @__PURE__ */ jsxs("button", {
                onClick: () => setHasAccident(!hasAccident),
                className: `w-full p-2.5 rounded-xl border text-left flex justify-between items-center transition-all cursor-pointer ${hasAccident ? "bg-rose-950/60 border-rose-500 text-rose-200 shadow-md shadow-rose-950/20" : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"}`,
                children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold", children: "Highway Accident" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black text-rose-400", children: "+15% load" })
                ]
              }),
              /* @__PURE__ */ jsxs("button", {
                onClick: () => setHasProtest(!hasProtest),
                className: `w-full p-2.5 rounded-xl border text-left flex justify-between items-center transition-all cursor-pointer ${hasProtest ? "bg-orange-950/60 border-orange-500 text-orange-200 shadow-md shadow-orange-950/20" : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"}`,
                children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold", children: "Concert / Protest" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black text-orange-400", children: "+10% load" })
                ]
              })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black text-slate-400 uppercase tracking-wider block", children: "Estimated Shock Index" }),
          /* @__PURE__ */ jsxs("div", { className: "text-center py-4 bg-slate-50 rounded-2xl border border-slate-200/50", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-3xl font-black text-slate-800 leading-none", children: [
              combinedMultiplier,
              "x"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "block text-[10px] font-extrabold text-indigo-600 mt-1 uppercase tracking-widest", children: "Regional Volume Offset" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] font-semibold text-slate-500 leading-relaxed text-center", children: [
            "A combined factor of ",
            /* @__PURE__ */ jsx("strong", { className: "text-slate-800", children: weatherModifiers[activeWeather].label }),
            " (",
            weatherMulti,
            "x) & ",
            /* @__PURE__ */ jsx("strong", { className: "text-slate-800", children: outbreakModifiers[activeOutbreak].label }),
            " (",
            outbreakMulti,
            "x) generates an overall estimated surge index of ",
            combinedMultiplier,
            "x."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 p-3 rounded-xl text-[10px] font-bold text-amber-800 leading-normal flex gap-2", children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "w-4 h-4 shrink-0" }),
          /* @__PURE__ */ jsx("span", { children: combinedMultiplier >= 1.5 ? "CRITICAL REGIONAL SURGE: Instruct health outposts to route non-trauma cases to ambulatory centers." : "NOMINAL OFFSET: Regional hospital capacities are expected to remain within tolerable thresholds." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-5 bg-slate-950 rounded-3xl border border-slate-900 p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-extrabold text-sm text-slate-200", children: "Interactive Regional Hospital Map" }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-500 block mt-0.5", children: "Select pin locations to load hospital profile" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative w-full h-64 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center", children: [
          /* @__PURE__ */ jsxs("svg", { className: "absolute inset-0 w-full h-full opacity-10 pointer-events-none", children: [
            /* @__PURE__ */ jsx("path", { d: "M 0,130 C 50,150 150,80 250,160 C 350,240 450,180 500,200", stroke: "#818cf8", strokeWidth: "8", fill: "none" }),
            /* @__PURE__ */ jsx("circle", { cx: "80", cy: "90", r: "60", fill: "#34d399", stroke: "#34d399", strokeWidth: "1", fillOpacity: "0.1" })
          ] }),
          Object.keys(hospitalLocations).map((hName) => {
            const loc = hospitalLocations[hName];
            const isSelected = focusedHospital === hName;
            const compData = comparisonChartData.find((c) => c.originalStats.name === hName);
            const waitTime = compData ? compData["Avg Wait Time (min)"] : 80;
            const statusColor = waitTime > 120 ? "bg-rose-500" : waitTime > 80 ? "bg-amber-500" : "bg-emerald-500";
            return /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setFocusedHospital(hName),
                style: { left: `${loc.x}%`, top: `${loc.y}%` },
                className: "absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: `relative flex items-center justify-center p-2 rounded-full border border-slate-700 transition-all ${isSelected ? "bg-indigo-600 border-indigo-400 scale-125" : "bg-slate-800 hover:bg-slate-700"}`, children: [
                    /* @__PURE__ */ jsx(MapPin, { className: `w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-300"}` }),
                    /* @__PURE__ */ jsx("span", { className: `absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${statusColor} border border-slate-900 animate-pulse` })
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 text-[9px] font-bold text-white px-2 py-0.5 rounded border border-slate-800 opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap", children: hName.replace(" Hospital", "") })
                ]
              },
              hName
            );
          }),
          /* @__PURE__ */ jsxs("div", { className: "absolute bottom-3 left-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[9px] font-bold text-slate-400 space-y-1 leading-none shadow-md", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-rose-500" }),
              /* @__PURE__ */ jsx("span", { children: "Overload (>120m wait)" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-amber-500" }),
              /* @__PURE__ */ jsx("span", { children: "Elevated (80-120m wait)" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-500" }),
              /* @__PURE__ */ jsx("span", { children: "Nominal (<80m wait)" })
            ] })
          ] })
        ] }),
        focusedHospital && /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/50 p-4 rounded-2xl border border-slate-850 space-y-3 text-slate-300", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 pb-2", children: [
            /* @__PURE__ */ jsx("h4", { className: "font-extrabold text-xs text-white truncate", children: focusedHospital }),
            /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-black uppercase text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900", children: [
              hospitalLocations[focusedHospital].region,
              " Region"
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold text-slate-400 leading-normal", children: hospitalLocations[focusedHospital].info }),
          focusedData && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3 text-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-slate-950 p-2 rounded-xl border border-slate-850", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-slate-500 block mb-0.5", children: "Est. Wait" }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs font-black text-slate-200", children: [
                focusedData["Avg Wait Time (min)"],
                " min"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-slate-950 p-2 rounded-xl border border-slate-850", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-slate-500 block mb-0.5", children: "Beds Size" }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs font-black text-slate-200", children: [
                focusedData["Bed Size"],
                " Beds"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-slate-950 p-2 rounded-xl border border-slate-850", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-bold text-slate-500 block mb-0.5", children: "Satisfaction" }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs font-black text-indigo-400", children: [
                focusedData["Satisfaction Index"],
                "%"
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-extrabold text-sm text-slate-800", children: "Regional Multi-Hospital Comparative Analytics" }),
          /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold text-slate-400 block mt-0.5", children: [
            "Simulated average waiting times including weather & epidemic shocks (",
            combinedMultiplier,
            "x factor)"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-72 w-full", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: comparisonChartData, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "#f1f5f9" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "name", stroke: "#94a3b8", fontSize: 10, tickLine: false }),
          /* @__PURE__ */ jsx(YAxis, { stroke: "#94a3b8", fontSize: 11, tickLine: false }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: { fontSize: "11px", borderRadius: "10px", border: "1px solid #e2e8f0" } }),
          /* @__PURE__ */ jsx(Legend, { wrapperStyle: { fontSize: "11px", paddingTop: 10 } }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "Avg Wait Time (min)", fill: "#4f46e5", radius: [6, 6, 0, 0] }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "Bed Size", fill: "#34d399", radius: [6, 6, 0, 0] }),
          /* @__PURE__ */ jsx(Bar, { dataKey: "Satisfaction Index", fill: "#fb7185", radius: [6, 6, 0, 0] })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-12 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2.5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "font-extrabold text-sm text-slate-800", children: "Regional Case Segments" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400 font-bold block mt-0.5", children: "Detailed distributions of active regional cases" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200", children: [
            /* @__PURE__ */ jsx("button", {
              onClick: () => setSegmentView("age"),
              className: `flex-1 text-center py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${segmentView === "age" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"}`,
              children: "Age"
            }),
            /* @__PURE__ */ jsx("button", {
              onClick: () => setSegmentView("triage"),
              className: `flex-1 text-center py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${segmentView === "triage" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"}`,
              children: "Triage"
            }),
            /* @__PURE__ */ jsx("button", {
              onClick: () => setSegmentView("condition"),
              className: `flex-1 text-center py-1 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${segmentView === "condition" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"}`,
              children: "Pathology"
            })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-56 w-full flex justify-center items-center", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
          /* @__PURE__ */ jsx(
            Pie,
            {
              data: currentSegmentData,
              cx: "50%",
              cy: "50%",
              innerRadius: 60,
              outerRadius: 80,
              paddingAngle: 5,
              dataKey: "value",
              children: currentSegmentData.map((entry, index) => /* @__PURE__ */ jsx(Cell, { fill: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }, `cell-${index}`))
            }
          ),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: { fontSize: "11px", borderRadius: "10px" } })
        ] }) }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2 pt-2 border-t border-slate-100", children: currentSegmentData.map((d, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-[10px] font-bold text-slate-500", children: [
          /* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 rounded-full", style: { backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] } }),
          /* @__PURE__ */ jsxs("span", { className: "truncate", children: [
            d.name,
            ": ",
            d.value,
            "%"
          ] })
        ] }, d.name)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-8 bg-white rounded-3xl border border-slate-200 p-5 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "font-extrabold text-sm text-slate-800", children: "Historical Seasonality Volumes" }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400 font-bold block mt-0.5", children: "Quarterly clinical load fluctuations by facility" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-64 w-full", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data: seasonalityData, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f1f5f9", vertical: false }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "season", stroke: "#94a3b8", fontSize: 11, tickLine: false }),
          /* @__PURE__ */ jsx(YAxis, { stroke: "#94a3b8", fontSize: 11, tickLine: false }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: { fontSize: "11px", borderRadius: "10px" } }),
          /* @__PURE__ */ jsx(Legend, { wrapperStyle: { fontSize: "11px" } }),
          /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "Springfield General", stroke: "#4f46e5", strokeWidth: 2.5, activeDot: { r: 6 } }),
          /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "Northside", stroke: "#34d399", strokeWidth: 2 }),
          /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "Riverside", stroke: "#fb7185", strokeWidth: 2 })
        ] }) }) })
      ] })
    ] })
  ] });
}
