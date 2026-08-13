"use strict";
import { jsx, jsxs } from "react/jsx-runtime";
import { AlertTriangle, Bell, Clock, Info, CheckCircle2, ShieldAlert } from "lucide-react";
export default function AlertNotificationTray({ alerts, onAcknowledge }) {
  const activeAlerts = alerts.filter((a) => !a.acknowledged);
  return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 pb-3 border-b border-slate-100", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "p-1.5 bg-rose-50 text-rose-600 rounded-lg", children: /* @__PURE__ */ jsx(Bell, { className: "w-4 h-4 animate-bounce" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold text-xs md:text-sm text-slate-800", children: "Live Alert Control Center" }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400", children: "Real-time ER congestion thresholds" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full", children: [
        activeAlerts.length,
        " Active"
      ] })
    ] }),
    activeAlerts.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-6", children: [
      /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5" }) }),
      /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-slate-700", children: "All Systems Nominal" }),
      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 font-semibold mt-0.5", children: "No overcrowding thresholds breached." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3 max-h-80 overflow-y-auto pr-1", children: activeAlerts.map((alert) => {
      const isCritical = alert.type === "CRITICAL";
      const isWarning = alert.type === "WARNING";
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: `p-3.5 rounded-xl border transition-all flex gap-3.5 items-start ${isCritical ? "bg-rose-50/50 border-rose-200/80 text-rose-950" : isWarning ? "bg-amber-50/50 border-amber-200/80 text-amber-950" : "bg-blue-50/50 border-blue-200/80 text-blue-950"}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: `p-1.5 rounded-lg shrink-0 mt-0.5 ${isCritical ? "bg-rose-100 text-rose-700" : isWarning ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`, children: isCritical ? /* @__PURE__ */ jsx(ShieldAlert, { className: "w-4 h-4" }) : isWarning ? /* @__PURE__ */ jsx(AlertTriangle, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Info, { className: "w-4 h-4" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-0.5", children: [
                /* @__PURE__ */ jsx("h4", { className: "font-bold text-xs truncate leading-none", children: alert.title }),
                /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-bold opacity-60 flex items-center gap-1 shrink-0", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "w-2.5 h-2.5" }),
                  alert.time
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium leading-relaxed opacity-80 mb-2", children: alert.message }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-black uppercase tracking-wider opacity-60", children: [
                  "Source: ",
                  alert.source
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => onAcknowledge(alert.id),
                    className: `text-[9px] font-bold px-2 py-1 rounded-md transition-all hover:opacity-90 cursor-pointer ${isCritical ? "bg-rose-600 text-white" : isWarning ? "bg-amber-600 text-white" : "bg-blue-600 text-white"}`,
                    children: "Acknowledge"
                  }
                )
              ] })
            ] })
          ]
        },
        alert.id
      );
    }) })
  ] });
}
