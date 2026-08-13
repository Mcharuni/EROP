"use strict";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Heart, Shield, Stethoscope, Landmark, ArrowRight, Lock, Mail, Users } from "lucide-react";
export default function AuthPage({ onLogin }) {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("admin@hospital.org");
  const [password, setPassword] = useState("••••••••");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const roleConfigs = {
    admin: {
      title: "Hospital Administrator (Owner)",
      description: "Manage bed capacity, forecast staffing, monitor ER congestion levels, and configure alarm thresholds.",
      email: "admin@hospital.org",
      icon: Shield,
      color: "border-blue-600 bg-blue-50/40 text-blue-700",
      iconBg: "bg-blue-600 text-white"
    },
    receptionist: {
      title: "Hospital Receptionist",
      description: "Manage front-desk flow, check doctor and bed availability.",
      email: "admin@receptionist.org",
      icon: Users,
      color: "border-indigo-600 bg-indigo-50/40 text-indigo-700",
      iconBg: "bg-indigo-600 text-white"
    },
    nurse: {
      title: "Triage Nurse",
      description: "Conduct patient clinical risk assessments, manage waiting queue, and categorize priority (ESI Level 1-5).",
      email: "nurse@hospital.org",
      icon: Stethoscope,
      color: "border-teal-600 bg-teal-50/40 text-teal-700",
      iconBg: "bg-teal-600 text-white"
    },
    authority: {
      title: "Regional Health Authority",
      description: "Track region-wide hospital wait times, epidemic outbreaks, weather alerts, and comparative hospital maps.",
      email: "authority@health.gov",
      icon: Landmark,
      color: "border-purple-600 bg-purple-50/40 text-purple-700",
      iconBg: "bg-purple-600 text-white"
    }
  };
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setEmail(roleConfigs[selectedRole].email);
    setPassword(selectedRole + "123");
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onLogin(role, email);
      setIsSubmitting(false);
    }, 800);
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4 font-sans", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "md:col-span-7 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/60 bg-gradient-to-br from-white to-slate-50/30", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-8", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2.5 bg-rose-600 rounded-xl text-white shadow-md shadow-rose-100 flex items-center justify-center", children: /* @__PURE__ */ jsx(Heart, { className: "w-5 h-5 animate-pulse" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-xl font-black text-slate-800 leading-none tracking-tight", children: "EROP Platform" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 tracking-wider uppercase block mt-1", children: "Clinical & Congestion Analytics" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl md:text-2xl font-black text-slate-800 tracking-tight mb-2", children: "Select Your Clinical Role" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 font-semibold text-xs md:text-sm mb-6", children: "Pick your profile to configure your role-specific dashboard." }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3.5", children: Object.keys(roleConfigs).map((rKey) => {
          const cfg = roleConfigs[rKey];
          const active = role === rKey;
          const Icon = cfg.icon;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => handleRoleSelect(rKey),
              className: `w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer hover:shadow-xs ${active ? `${cfg.color} border-2 ring-1 ring-offset-2 ring-slate-100` : "border-slate-200/70 bg-white hover:border-slate-300 text-slate-600"}`,
              children: [
                /* @__PURE__ */ jsx("div", { className: `p-2.5 rounded-xl shrink-0 ${active ? cfg.iconBg : "bg-slate-100 text-slate-500"}`, children: /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5" }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-bold text-xs md:text-sm text-slate-800 mb-0.5", children: cfg.title }),
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium text-slate-400 leading-relaxed leading-snug", children: cfg.description })
                ] })
              ]
            },
            rKey
          );
        }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-[10px] font-semibold text-slate-400 mt-8", children: "EROP Clinical Support Platform • v3.0 Certified" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "md:col-span-5 p-8 flex flex-col justify-center bg-slate-50/15", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1", children: "Active Portal" }),
        /* @__PURE__ */ jsx("span", { className: "text-base font-black text-slate-800", children: roleConfigs[role].title })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5", children: "Email Address" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-3 w-4 h-4 text-slate-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                required: true,
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
                placeholder: "Enter email..."
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5", children: "Secure Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-3 w-4 h-4 text-slate-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "password",
                required: true,
                value: password,
                onChange: (e) => setPassword(e.target.value),
                className: "w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
                placeholder: "Password..."
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: isSubmitting,
          className: "w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-xs font-bold transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50",
          children: isSubmitting ? /* @__PURE__ */ jsx("span", { children: "Authenticating Portal..." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { children: "Sign In to Dashboard" }),
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
          ] })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200/60 p-3.5 rounded-xl text-[11px] text-amber-800 font-semibold leading-relaxed", children: [
        /* @__PURE__ */ jsx("strong", { children: "Tip:" }),
        " Select one of the roles on the left to automatically pre-populate valid support keys and login credentials."
      ] })
    ] }) })
  ] }) });
}
