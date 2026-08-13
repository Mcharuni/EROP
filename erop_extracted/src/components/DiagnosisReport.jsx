"use strict";
import { jsx, jsxs } from "react/jsx-runtime";
export default function DiagnosisReport({ markdownText }) {
  if (!markdownText) return null;
  const lines = markdownText.split("\n");
  const renderFormattedText = (text) => {
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return /* @__PURE__ */ jsx("strong", { className: "font-extrabold text-slate-900", children: part.slice(2, -2) }, i);
      }
      return part;
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs", children: [
    /* @__PURE__ */ jsxs("div", { className: "border-b border-slate-100 pb-4 mb-5", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xs font-bold text-slate-400 uppercase tracking-widest", children: "Clinical Intelligence Diagnostic" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-semibold mt-1", children: "Automated Telemetry Audit & Care Protocol Advisory" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3.5 text-slate-600 text-sm md:text-base leading-relaxed", children: lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return /* @__PURE__ */ jsx("div", { className: "h-1" }, idx);
      if (trimmed.startsWith("### ")) {
        return /* @__PURE__ */ jsx(
          "h4",
          {
            className: "text-base font-extrabold text-slate-800 mt-6 pt-4 border-t border-slate-100 first:border-0 first:mt-0 first:pt-0",
            children: trimmed.replace("### ", "")
          },
          idx
        );
      }
      if (trimmed.startsWith("#### ")) {
        return /* @__PURE__ */ jsx("h5", { className: "text-sm font-bold text-slate-800 mt-4", children: trimmed.replace("#### ", "") }, idx);
      }
      if (trimmed.startsWith("## ")) {
        return /* @__PURE__ */ jsx(
          "h3",
          {
            className: "text-lg font-black text-slate-800 mt-7 pt-4 border-t border-slate-100 first:border-0 first:mt-0 first:pt-0",
            children: trimmed.replace("## ", "")
          },
          idx
        );
      }
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const content = trimmed.substring(2);
        return /* @__PURE__ */ jsxs("li", { className: "list-none flex items-start gap-2 text-xs md:text-sm text-slate-600 font-medium pl-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-indigo-500 mt-1 shrink-0", children: "•" }),
          /* @__PURE__ */ jsx("span", { children: renderFormattedText(content) })
        ] }, idx);
      }
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        const num = numMatch[1];
        const content = numMatch[2];
        return /* @__PURE__ */ jsxs("li", { className: "list-none flex items-start gap-2.5 text-xs md:text-sm text-slate-600 font-medium pl-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-indigo-600 font-bold shrink-0", children: [
            num,
            "."
          ] }),
          /* @__PURE__ */ jsx("span", { children: renderFormattedText(content) })
        ] }, idx);
      }
      return /* @__PURE__ */ jsx("p", { className: "text-xs md:text-sm font-medium text-slate-600 leading-relaxed", children: renderFormattedText(trimmed) }, idx);
    }) })
  ] });
}
