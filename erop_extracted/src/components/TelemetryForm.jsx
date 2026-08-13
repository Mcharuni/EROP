"use strict";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { FileText, Keyboard, Activity, RefreshCw } from "lucide-react";
const initialFeatures = {
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
};
const presets = [
  {
    name: "🔴 Cardiogenic Shock (Critical)",
    features: {
      "TYPE OF ADMISSION-EMERGENCY/OPD": 1,
      "ALCOHOL": 0,
      "HTN": 1,
      "CAD": 1,
      "TLC": 16.5,
      "PLATELETS": 110,
      "CREATININE": 2.8,
      "EF": 25,
      "ACS": 1,
      "HFREF": 1,
      "HFNEF": 0,
      "CHB": 1,
      "AKI": 1,
      "UTI": 0,
      "CARDIOGENIC SHOCK": 1,
      "SHOCK": 1,
      "renal_risk_score": 3.5
    }
  },
  {
    name: "🟢 Stable observations (dischargeable)",
    features: {
      "TYPE OF ADMISSION-EMERGENCY/OPD": 0,
      "ALCOHOL": 0,
      "HTN": 0,
      "CAD": 0,
      "TLC": 6.8,
      "PLATELETS": 240,
      "CREATININE": 0.8,
      "EF": 58,
      "ACS": 0,
      "HFREF": 0,
      "HFNEF": 0,
      "CHB": 0,
      "AKI": 0,
      "UTI": 0,
      "CARDIOGENIC SHOCK": 0,
      "SHOCK": 0,
      "renal_risk_score": 0.6
    }
  },
  {
    name: "🟡 Borderline Renal & Heart Failure",
    features: {
      "TYPE OF ADMISSION-EMERGENCY/OPD": 1,
      "ALCOHOL": 1,
      "HTN": 1,
      "CAD": 0,
      "TLC": 11.2,
      "PLATELETS": 135,
      "CREATININE": 1.6,
      "EF": 38,
      "ACS": 0,
      "HFREF": 1,
      "HFNEF": 0,
      "CHB": 0,
      "AKI": 1,
      "UTI": 1,
      "CARDIOGENIC SHOCK": 0,
      "SHOCK": 0,
      "renal_risk_score": 1.9
    }
  }
];
const sampleBulkImport = "1,67,1,0,8.5,180,310,1.1,55,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1,1,1,0,0,0,0,1,0.4,1.2,0.8,1.2,0.9,0.7,0.8,0.7,0.7,1.0,1.2,1.1,0.9,1.1,1.0,1.2,1.2,1.3,1.1,1.2,1.2,1.1,1.1,1.1,1.1,1.1,1.1,1.0,1.0,1.1,1.1,1.2,1.2,1.2,1.3,1.3,1.3,1.3,1.2,1.2,1.2,1.2,1.2,1.2,1.2";
export default function TelemetryForm({ onSubmit, isLoading }) {
  const [activeTab, setActiveTab] = useState("manual");
  const [features, setFeatures] = useState(initialFeatures);
  const [bulkText, setBulkText] = useState("");
  const handleCheckboxChange = (key) => {
    setFeatures((prev) => ({
      ...prev,
      [key]: prev[key] === 1 ? 0 : 1
    }));
  };
  const handleNumberChange = (key, value) => {
    setFeatures((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "CREATININE" || key === "AKI") {
        const ckdFlag = 0;
        const ureaNorm = updated.CREATININE * 4;
        const creatNorm = updated.CREATININE / 1.2;
        updated.renal_risk_score = ureaNorm + creatNorm + updated.AKI * 2;
      }
      return updated;
    });
  };
  const handleApplyPreset = (scen) => {
    setFeatures(scen.features);
    setActiveTab("manual");
  };
  const handleSubmitManual = (e) => {
    e.preventDefault();
    onSubmit({ features });
  };
  const handleSubmitBulk = (e) => {
    e.preventDefault();
    if (!bulkText.trim()) return;
    onSubmit({ rawString: bulkText.trim() });
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex border-b border-slate-100 bg-slate-50/50", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("manual"),
          className: `flex-1 py-4 px-6 flex items-center justify-center gap-2 font-semibold text-sm transition-all border-b-2 ${activeTab === "manual" ? "border-indigo-600 text-indigo-600 bg-white" : "border-transparent text-slate-500 hover:text-slate-800"}`,
          children: [
            /* @__PURE__ */ jsx(Keyboard, { className: "w-4 h-4" }),
            "Manual Clinical Entry"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveTab("bulk"),
          className: `flex-1 py-4 px-6 flex items-center justify-center gap-2 font-semibold text-sm transition-all border-b-2 ${activeTab === "bulk" ? "border-indigo-600 text-indigo-600 bg-white" : "border-transparent text-slate-500 hover:text-slate-800"}`,
          children: [
            /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" }),
            "Quick EMR Bulk Import"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5", children: "Quick Test Scenarios" }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: presets.map((p, idx) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => handleApplyPreset(p),
            className: "text-xs bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold px-3 py-2 rounded-lg border border-slate-200 transition-colors cursor-pointer",
            children: p.name
          },
          idx
        )) })
      ] }),
      activeTab === "manual" ? /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmitManual, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-2 border-b border-slate-100", children: [
              /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 bg-indigo-500 rounded-full" }),
              /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-700 text-sm", children: "Demographics & History" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-3 rounded-xl border border-slate-200/60 transition-colors cursor-pointer select-none", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: features["TYPE OF ADMISSION-EMERGENCY/OPD"] === 1,
                    onChange: () => handleCheckboxChange("TYPE OF ADMISSION-EMERGENCY/OPD"),
                    className: "w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded-sm focus:ring-indigo-500"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-slate-700", children: "Emergency Department (ED) Admit" })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-3 rounded-xl border border-slate-200/60 transition-colors cursor-pointer select-none", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: features["ALCOHOL"] === 1,
                    onChange: () => handleCheckboxChange("ALCOHOL"),
                    className: "w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded-sm focus:ring-indigo-500"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-slate-700", children: "Alcohol Intake History" })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-3 rounded-xl border border-slate-200/60 transition-colors cursor-pointer select-none", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: features["HTN"] === 1,
                    onChange: () => handleCheckboxChange("HTN"),
                    className: "w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded-sm focus:ring-indigo-500"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-slate-700", children: "Hypertension (HTN)" })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-3 rounded-xl border border-slate-200/60 transition-colors cursor-pointer select-none", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: features["CAD"] === 1,
                    onChange: () => handleCheckboxChange("CAD"),
                    className: "w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded-sm focus:ring-indigo-500"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-slate-700", children: "Coronary Artery Disease" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-2 border-b border-slate-100", children: [
              /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 bg-indigo-500 rounded-full" }),
              /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-700 text-sm", children: "Clinical Conditions" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1", children: [
              { key: "ACS", label: "Acute Coronary (ACS)" },
              { key: "HFREF", label: "Heart Failure HFrEF" },
              { key: "HFNEF", label: "Heart Failure HFnEF" },
              { key: "CHB", label: "Complete Heart Block" },
              { key: "AKI", label: "Renal Injury (AKI)" },
              { key: "UTI", label: "Urinary Infection (UTI)" },
              { key: "CARDIOGENIC SHOCK", label: "Cardiogenic Shock" },
              { key: "SHOCK", label: "General Shock State" }
            ].map(({ key, label }) => /* @__PURE__ */ jsxs(
              "label",
              {
                className: "flex items-center gap-2 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200/60 transition-colors cursor-pointer select-none",
                children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: features[key] === 1,
                      onChange: () => handleCheckboxChange(key),
                      className: "w-4 h-4 text-indigo-600 border-slate-300 rounded-sm focus:ring-indigo-500"
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold text-slate-700 truncate", children: label })
                ]
              },
              key
            )) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-2 border-b border-slate-100", children: [
              /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 bg-indigo-500 rounded-full" }),
              /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-700 text-sm", children: "Labs & Vital Metrics" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-bold text-slate-500 mb-1", children: [
                  /* @__PURE__ */ jsx("span", { children: "Total Leucocyte Count (TLC)" }),
                  /* @__PURE__ */ jsx("span", { className: "text-slate-400 font-normal", children: "Range: 4.0 - 11.0" })
                ] }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    step: "0.1",
                    min: "0.1",
                    value: features.TLC,
                    onChange: (e) => handleNumberChange("TLC", parseFloat(e.target.value) || 0),
                    className: "w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-lg px-3 py-2 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-semibold"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-bold text-slate-500 mb-1", children: [
                  /* @__PURE__ */ jsx("span", { children: "Platelets (K/µL)" }),
                  /* @__PURE__ */ jsx("span", { className: "text-slate-400 font-normal", children: "Range: 150 - 450" })
                ] }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    step: "1",
                    min: "1",
                    value: features.PLATELETS,
                    onChange: (e) => handleNumberChange("PLATELETS", parseFloat(e.target.value) || 0),
                    className: "w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-lg px-3 py-2 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-semibold"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-bold text-slate-500 mb-1", children: [
                  /* @__PURE__ */ jsx("span", { children: "Serum Creatinine (mg/dL)" }),
                  /* @__PURE__ */ jsx("span", { className: "text-slate-400 font-normal", children: "Range: 0.6 - 1.2" })
                ] }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    step: "0.05",
                    min: "0.1",
                    value: features.CREATININE,
                    onChange: (e) => handleNumberChange("CREATININE", parseFloat(e.target.value) || 0),
                    className: "w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-lg px-3 py-2 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-semibold"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] font-bold text-slate-500 mb-1", children: "Ejection Fraction (EF %)" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "number",
                      step: "1",
                      min: "5",
                      max: "85",
                      value: features.EF,
                      onChange: (e) => handleNumberChange("EF", parseFloat(e.target.value) || 0),
                      className: "w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-lg px-3 py-2 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-semibold"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] font-bold text-slate-500 mb-1", children: "Computed Renal Score" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "number",
                      disabled: true,
                      value: features.renal_risk_score.toFixed(2),
                      className: "w-full bg-slate-100 text-slate-500 border border-slate-200 text-sm rounded-lg px-3 py-2 font-semibold"
                    }
                  )
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            disabled: isLoading,
            className: "w-full cursor-pointer py-3.5 px-6 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm tracking-wide shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50",
            children: [
              isLoading ? /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Activity, { className: "w-4.5 h-4.5" }),
              "Run Patient Mortality Risk Assessment"
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmitBulk, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-slate-500 mb-2", children: "Paste 77 CSV Clinical Features" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: bulkText,
              onChange: (e) => setBulkText(e.target.value),
              placeholder: "Paste telemetry string (77 numbers separated by commas)...",
              rows: 4,
              className: "w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setBulkText(sampleBulkImport),
              className: "text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 px-3 py-2 rounded-lg cursor-pointer",
              children: "Load Sample 77-Feature String"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: isLoading || !bulkText.trim(),
              className: "py-2.5 px-5 cursor-pointer rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50",
              children: "Run Bulk Assessment"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
