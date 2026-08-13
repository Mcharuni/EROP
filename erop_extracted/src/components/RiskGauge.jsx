"use strict";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, CheckCircle, HeartPulse, Sparkles } from "lucide-react";
export default function RiskGauge({ result, isLoading }) {
  const [displayedProb, setDisplayedProb] = useState(0);
  useEffect(() => {
    if (result) {
      const target = Math.round(result.probability * 100);
      let start = 0;
      if (target === 0) return () => {
      };
      const duration = 1e3;
      const stepTime = Math.abs(Math.floor(duration / target));
      const timer = setInterval(() => {
        start += 1;
        setDisplayedProb(start);
        if (start >= target) {
          clearInterval(timer);
          setDisplayedProb(target);
        }
      }, stepTime);
      return () => clearInterval(timer);
    } else {
      setDisplayedProb(0);
    }
  }, [result]);
  if (isLoading) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[300px]", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex items-center justify-center", children: [
        /* @__PURE__ */ jsx(
          motion.div,
          {
            animate: { rotate: 360 },
            transition: { repeat: Infinity, duration: 1.5, ease: "linear" },
            className: "w-16 h-16 border-4 border-slate-100 border-t-emerald-600 rounded-full"
          }
        ),
        /* @__PURE__ */ jsx(HeartPulse, { className: "absolute w-6 h-6 text-emerald-600 animate-pulse" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-slate-500 font-medium text-sm animate-pulse", children: "Analyzing telemetry via predictive algorithms..." })
    ] });
  }
  if (!result) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[300px]", children: [
      /* @__PURE__ */ jsx(HeartPulse, { className: "w-12 h-12 text-slate-300 mb-3" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-400 font-medium text-sm text-center", children: "Enter telemetry and trigger risk assessment to view clinical intelligence diagnosis." })
    ] });
  }
  const { probability, threshold, isHighRisk, modelUsed } = result;
  const probPct = Math.round(probability * 100);
  const threshPct = Math.round(threshold * 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference / 2;
  const strokeDashoffset = arcLength - probability * arcLength;
  const threshAngle = 180 - threshold * 180;
  const threshRad = threshAngle * Math.PI / 180;
  const markerX = 50 + radius * Math.cos(threshRad);
  const markerY = 50 - radius * Math.sin(threshRad);
  return /* @__PURE__ */ jsxs("div", { className: "relative w-full", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-full h-6 overflow-hidden pointer-events-none z-10 opacity-70", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 500 20", preserveAspectRatio: "none", className: "w-full h-full", children: /* @__PURE__ */ jsx(
      "path",
      {
        stroke: isHighRisk ? "#EF4444" : "#10B981",
        strokeWidth: "2",
        fill: "none",
        strokeDasharray: "1000",
        strokeDashoffset: "1000",
        className: "animate-ekg",
        d: "M0 10 L100 10 L110 5 L120 15 L130 10 L300 10 L310 0 L320 20 L330 10 L500 10",
        style: {
          animation: "ekgDraw 1.5s ease-out infinite"
        }
      }
    ) }) }),
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes ekgDraw {
          0% { stroke-dashoffset: 1000; opacity: 1; }
          70% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
      ` }),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
        className: `rounded-2xl p-6 md:p-8 border shadow-md flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-500 bg-white ${isHighRisk ? "border-l-4 border-l-red-500 border-red-100 bg-linear-to-r from-red-50/30 via-transparent to-transparent shadow-red-50" : "border-l-4 border-l-emerald-500 border-emerald-100 bg-linear-to-r from-emerald-50/30 via-transparent to-transparent shadow-emerald-50"}`,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[280px]", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs uppercase font-bold tracking-wider text-slate-400", children: "Clinical Assessment" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-1", children: [
                /* @__PURE__ */ jsx("div", { className: `${isHighRisk ? "text-red-500" : "text-emerald-600"} p-1 bg-white rounded-full shadow-xs border border-slate-100`, children: isHighRisk ? /* @__PURE__ */ jsx(AlertTriangle, { className: "w-8 h-8 pulse-alert" }) : /* @__PURE__ */ jsx(CheckCircle, { className: "w-8 h-8" }) }),
                /* @__PURE__ */ jsx("h2", { className: `text-2xl md:text-3xl font-extrabold tracking-tight ${isHighRisk ? "text-red-600" : "text-emerald-700"}`, children: isHighRisk ? "HIGH RISK" : "LOW RISK" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-600 leading-relaxed text-sm md:text-base mb-4", children: isHighRisk ? "The patient has breached the clinical safety threshold. Continuous hemodynamics, telemetry, and clinical review are highly recommended." : "The patient's current telemetry indicates a stable profile suitable for standard observations or routine floor care protocol." }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-full w-max border border-slate-200", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "w-3.5 h-3.5 text-indigo-500" }),
              "Predicted via ",
              /* @__PURE__ */ jsx("span", { className: "text-indigo-700", children: modelUsed })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 flex flex-col items-center justify-center max-w-[320px] w-full", children: /* @__PURE__ */ jsxs("div", { className: "relative w-full aspect-2/1 overflow-visible", children: [
            /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 55", className: "w-full h-full overflow-visible", children: [
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M 10 50 A 40 40 0 0 1 90 50",
                  fill: "none",
                  stroke: "#e2e8f0",
                  strokeWidth: "7",
                  strokeLinecap: "round"
                }
              ),
              /* @__PURE__ */ jsx(
                motion.path,
                {
                  d: "M 10 50 A 40 40 0 0 1 90 50",
                  fill: "none",
                  stroke: isHighRisk ? "#EF4444" : "#10B981",
                  strokeWidth: "7",
                  strokeLinecap: "round",
                  strokeDasharray: `${arcLength} ${circumference}`,
                  initial: { strokeDashoffset: arcLength },
                  animate: { strokeDashoffset },
                  transition: { duration: 1.5, ease: "easeOut" }
                }
              ),
              /* @__PURE__ */ jsx(
                "circle",
                {
                  cx: markerX,
                  cy: markerY,
                  r: "2",
                  fill: "white",
                  stroke: "#475569",
                  strokeWidth: "1.5",
                  className: "transition-all duration-500"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "absolute bottom-0 left-0 right-0 text-center flex flex-col items-center transform translate-y-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase font-bold tracking-widest text-slate-400", children: "Mortality Risk" }),
              /* @__PURE__ */ jsxs("span", { className: "text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-none mt-1", children: [
                displayedProb,
                "%"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 shadow-xs mt-2", children: [
                "Cutoff ",
                threshPct,
                "%"
              ] })
            ] })
          ] }) })
        ]
      }
    )
  ] });
}
