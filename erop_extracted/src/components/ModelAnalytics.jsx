"use strict";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ChevronDown, ChevronUp, BarChart2, TrendingUp, PieChart, Info, ShieldCheck } from "lucide-react";
export const modelMetricsMap = {
  "Logistic Regression": { threshold: 0.78, f1: 0.6471, accuracy: 0.9492, auc: 0.9187 },
  "Random Forest": { threshold: 0.51, f1: 0.7419, accuracy: 0.9661, auc: 0.9698 },
  "XGBoost": { threshold: 0.54, f1: 0.8, accuracy: 0.9725, auc: 0.9772 },
  "LightGBM": { threshold: 0.11, f1: 0.7815, accuracy: 0.9651, auc: 0.9791 },
  "Stacking Ensemble": { threshold: 0.58, f1: 0.7673, accuracy: 0.9608, auc: 0.9665 }
};
export default function ModelAnalytics({ selectedModel }) {
  const [openSections, setOpenSections] = useState({
    features: true,
    confusion: false,
    curves: false
  });
  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };
  const currentMetrics = modelMetricsMap[selectedModel];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6 shadow-xs", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 border-b border-slate-100 pb-4 mb-4", children: [
        /* @__PURE__ */ jsx(ShieldCheck, { className: "w-6 h-6 text-indigo-600" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-800 text-sm", children: "Algorithm Deep-Dive" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 font-medium", children: [
            "Selected Model: ",
            /* @__PURE__ */ jsx("span", { className: "text-indigo-600 font-semibold", children: selectedModel })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 border border-slate-200/50 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1", children: "Accuracy" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xl md:text-2xl font-black text-slate-800", children: [
            (currentMetrics.accuracy * 100).toFixed(1),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 border border-slate-200/50 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1", children: "Model F1 Score" }),
          /* @__PURE__ */ jsx("span", { className: "text-xl md:text-2xl font-black text-indigo-600", children: currentMetrics.f1.toFixed(3) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 border border-slate-200/50 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1", children: "ROC-AUC" }),
          /* @__PURE__ */ jsx("span", { className: "text-xl md:text-2xl font-black text-emerald-600", children: currentMetrics.auc.toFixed(4) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 border border-slate-200/50 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1", children: "Decision Threshold" }),
          /* @__PURE__ */ jsx("span", { className: "text-xl md:text-2xl font-black text-slate-700", children: currentMetrics.threshold.toFixed(2) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 flex gap-2.5 bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-xl", children: [
        /* @__PURE__ */ jsx(Info, { className: "w-4 h-4 text-indigo-600 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxs("p", { className: "text-[11px] leading-relaxed text-indigo-700 font-medium", children: [
          "This algorithm operates at a customized threshold to optimize clinical sensitivity and specificity.",
          selectedModel === "LightGBM" && " LightGBM is highly calibrated for extremely high sensitivity (Low threshold 0.11) to capture patient decompensation early.",
          selectedModel === "Logistic Regression" && " Logistic Regression operates at a conservative threshold of 0.78, emphasizing high specificity to ensure stable patients are discharged correctly.",
          selectedModel === "XGBoost" && " XGBoost delivers the highest aggregate F1 score (0.800) and represents the most balanced individual classifier in this deployment."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-slate-400 uppercase tracking-wider", children: "Global Performance Comparisons" }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => toggleSection("features"),
          className: "w-full flex items-center justify-between p-5 font-bold text-slate-700 hover:bg-slate-50/50 transition-colors select-none text-left cursor-pointer",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(BarChart2, { className: "w-5 h-5 text-indigo-500" }),
              /* @__PURE__ */ jsx("span", { children: "Feature Interpretability (Top Selected)" })
            ] }),
            openSections.features ? /* @__PURE__ */ jsx(ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4" })
          ]
        }
      ),
      openSections.features && /* @__PURE__ */ jsxs("div", { className: "p-5 border-t border-slate-100 flex flex-col items-center", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: "/outputs/feature_importance.png",
            alt: "Feature Importance Chart",
            className: "max-w-full h-auto rounded-xl shadow-xs border border-slate-100 hover:scale-[1.01] transition-transform duration-300"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "mt-3.5 text-xs text-slate-500 text-center font-medium max-w-2xl", children: "Relative clinical feature importances computed across Random Forest, XGBoost, and LightGBM models. Note the significant predictive influence of cardiovascular metrics (EF) and kidney markers (Creatinine)." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => toggleSection("confusion"),
          className: "w-full flex items-center justify-between p-5 font-bold text-slate-700 hover:bg-slate-50/50 transition-colors select-none text-left cursor-pointer",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(PieChart, { className: "w-5 h-5 text-indigo-500" }),
              /* @__PURE__ */ jsx("span", { children: "Confusion Matrices (All Models)" })
            ] }),
            openSections.confusion ? /* @__PURE__ */ jsx(ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4" })
          ]
        }
      ),
      openSections.confusion && /* @__PURE__ */ jsxs("div", { className: "p-5 border-t border-slate-100 flex flex-col items-center", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: "/outputs/confusion_matrix_all.png",
            alt: "Confusion Matrices All Models",
            className: "max-w-full h-auto rounded-xl shadow-xs border border-slate-100 hover:scale-[1.01] transition-transform duration-300"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "mt-3.5 text-xs text-slate-500 text-center font-medium max-w-2xl", children: "Confusion matrices for model outcomes mapped to the real-world validation cohort. Emphasizes clinical precision vs false positive ratios on discharge vs expired targets." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => toggleSection("curves"),
          className: "w-full flex items-center justify-between p-5 font-bold text-slate-700 hover:bg-slate-50/50 transition-colors select-none text-left cursor-pointer",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx(TrendingUp, { className: "w-5 h-5 text-indigo-500" }),
              /* @__PURE__ */ jsx("span", { children: "ROC & Aggregate Performance Curves" })
            ] }),
            openSections.curves ? /* @__PURE__ */ jsx(ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4" })
          ]
        }
      ),
      openSections.curves && /* @__PURE__ */ jsxs("div", { className: "p-5 border-t border-slate-100 flex flex-col items-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 w-full", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: "/outputs/model_comparison.png",
                alt: "Model Performance Comparison",
                className: "max-w-full h-auto rounded-xl border border-slate-100 hover:scale-[1.01] transition-transform"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase mt-2", children: "Accuracy & F1 Comparisons" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: "/outputs/roc_curve_comparison.png",
                alt: "ROC Curves Overlaid",
                className: "max-w-full h-auto rounded-xl border border-slate-100 hover:scale-[1.01] transition-transform"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase mt-2", children: "Receiver Operating Characteristics" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-xs text-slate-500 text-center font-medium max-w-2xl", children: "Comparative Area Under the Curve (AUC) and F1 statistics illustrating model robust discrimination thresholds when evaluating patient admission records." })
      ] })
    ] })
  ] });
}
