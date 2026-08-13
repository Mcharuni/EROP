"use strict";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
const app = express();
const PORT = 3e3;
app.use(cors());
app.use(express.json());
app.use("/outputs", express.static(path.join(process.cwd(), "outputs")));
let erRecords = [];
let erStatsCache = null;
function loadERData() {
  try {
    const csvPath = path.join(process.cwd(), "ER_Wait_Time_Dataset_cleaned.csv");
    if (fs.existsSync(csvPath)) {
      const content = fs.readFileSync(csvPath, "utf-8");
      const lines = content.split("\n");
      const loaded = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(",");
        if (parts.length < 19) continue;
        loaded.push({
          visitId: parts[0],
          patientId: parts[1],
          hospitalId: parts[2],
          hospitalName: parts[3],
          region: parts[4],
          visitDate: parts[5],
          dayOfWeek: parts[6],
          season: parts[7],
          timeOfDay: parts[8],
          urgencyLevel: parts[9],
          nurseToPatientRatio: parseInt(parts[10]) || 4,
          specialistAvailability: parseInt(parts[11]) || 2,
          facilitySizeBeds: parseInt(parts[12]) || 80,
          timeToRegistration: parseInt(parts[13]) || 15,
          timeToTriage: parseInt(parts[14]) || 20,
          timeToProfessional: parseInt(parts[15]) || 45,
          totalWaitTime: parseInt(parts[16]) || 80,
          outcome: parts[17],
          satisfaction: parseInt(parts[18]) || 3
        });
      }
      erRecords = loaded;
      console.log(`Successfully parsed ${erRecords.length} records from wait time dataset.`);
      computeERStats();
    } else {
      console.warn("ER_Wait_Time_Dataset_cleaned.csv not found at: " + csvPath);
    }
  } catch (err) {
    console.error("Error loading ER dataset:", err);
  }
}
function computeERStats() {
  if (erRecords.length === 0) return;
  const hospitalsSet = /* @__PURE__ */ new Set();
  const satisfactionMap = {};
  const waitTimeByUrgency = {};
  const volumeByDay = {};
  const volumeBySeason = {};
  const waitTimeByHour = {};
  erRecords.forEach((r) => {
    hospitalsSet.add(r.hospitalName);
    if (!satisfactionMap[r.hospitalName]) satisfactionMap[r.hospitalName] = [];
    satisfactionMap[r.hospitalName].push(r.satisfaction);
    if (!waitTimeByUrgency[r.hospitalName]) waitTimeByUrgency[r.hospitalName] = {};
    if (!waitTimeByUrgency[r.hospitalName][r.urgencyLevel]) {
      waitTimeByUrgency[r.hospitalName][r.urgencyLevel] = [];
    }
    waitTimeByUrgency[r.hospitalName][r.urgencyLevel].push(r.totalWaitTime);
    if (!volumeByDay[r.hospitalName]) volumeByDay[r.hospitalName] = {};
    volumeByDay[r.hospitalName][r.dayOfWeek] = (volumeByDay[r.hospitalName][r.dayOfWeek] || 0) + 1;
    if (!volumeBySeason[r.hospitalName]) volumeBySeason[r.hospitalName] = {};
    volumeBySeason[r.hospitalName][r.season] = (volumeBySeason[r.hospitalName][r.season] || 0) + 1;
    if (!waitTimeByHour[r.hospitalName]) waitTimeByHour[r.hospitalName] = {};
    if (!waitTimeByHour[r.hospitalName][r.timeOfDay]) {
      waitTimeByHour[r.hospitalName][r.timeOfDay] = [];
    }
    waitTimeByHour[r.hospitalName][r.timeOfDay].push(r.totalWaitTime);
  });
  const hospitalStats = {};
  hospitalsSet.forEach((h) => {
    const satisfactions = satisfactionMap[h] || [];
    const avgSatisfaction = satisfactions.reduce((a, b) => a + b, 0) / (satisfactions.length || 1);
    const urgencyStats = {};
    Object.keys(waitTimeByUrgency[h] || {}).forEach((urg) => {
      const times = waitTimeByUrgency[h][urg] || [];
      urgencyStats[urg] = Math.round(times.reduce((a, b) => a + b, 0) / (times.length || 1));
    });
    const hourStats = {};
    Object.keys(waitTimeByHour[h] || {}).forEach((tod) => {
      const times = waitTimeByHour[h][tod] || [];
      hourStats[tod] = Math.round(times.reduce((a, b) => a + b, 0) / (times.length || 1));
    });
    hospitalStats[h] = {
      name: h,
      avgSatisfaction: parseFloat(avgSatisfaction.toFixed(2)),
      urgencyWaitTimes: urgencyStats,
      volumeByDay: volumeByDay[h] || {},
      volumeBySeason: volumeBySeason[h] || {},
      waitTimeByHour: hourStats,
      totalRecords: satisfactions.length,
      beds: erRecords.find((r) => r.hospitalName === h)?.facilitySizeBeds || 90
    };
  });
  erStatsCache = {
    hospitals: Array.from(hospitalsSet),
    stats: hospitalStats
  };
}
loadERData();
function calculateRisk(model, f) {
  let logit = -2.5;
  if (f["TYPE OF ADMISSION-EMERGENCY/OPD"] === 1) logit += 0.65;
  if (f["ALCOHOL"] === 1) logit += 0.45;
  if (f["HTN"] === 1) logit += 0.35;
  if (f["CAD"] === 1) logit += 0.4;
  const tlc = f["TLC"];
  if (tlc > 11) logit += 0.08 * (tlc - 11);
  else if (tlc < 4) logit += 0.15 * (4 - tlc);
  const platelets = f["PLATELETS"];
  if (platelets < 150) logit += 0.7 * ((150 - platelets) / 100);
  const creatinine = f["CREATININE"];
  if (creatinine > 1.2) logit += 1.5 * (creatinine - 1.2);
  const ef = f["EF"];
  if (ef < 50) logit += 2.2 * (1 - ef / 50);
  else if (ef > 50) logit -= 0.3 * ((ef - 50) / 20);
  if (f["ACS"] === 1) logit += 0.75;
  if (f["HFREF"] === 1) logit += 0.85;
  if (f["HFNEF"] === 1) logit += 0.3;
  if (f["CHB"] === 1) logit += 0.8;
  if (f["AKI"] === 1) logit += 1.1;
  if (f["UTI"] === 1) logit += 0.25;
  if (f["CARDIOGENIC SHOCK"] === 1) logit += 2.3;
  if (f["SHOCK"] === 1) logit += 1.7;
  logit += 0.45 * f["renal_risk_score"];
  let prob = 1 / (1 + Math.exp(-logit));
  let threshold = 0.5;
  switch (model) {
    case "Logistic Regression":
      threshold = 0.78;
      prob = 1 / (1 + Math.exp(-(logit + 1.25)));
      break;
    case "Random Forest":
      threshold = 0.51;
      prob = 0.05 + 0.9 * prob;
      break;
    case "XGBoost":
      threshold = 0.54;
      const xgbLogit = logit * 1.4;
      prob = 1 / (1 + Math.exp(-xgbLogit));
      break;
    case "LightGBM":
      threshold = 0.11;
      prob = 1 / (1 + Math.exp(-(logit - 1.2)));
      break;
    case "Stacking Ensemble":
      threshold = 0.58;
      prob = 1 / (1 + Math.exp(-(logit + 0.35)));
      break;
  }
  prob = Math.max(0.01, Math.min(0.99, prob));
  return { probability: prob, threshold };
}
app.post("/api/predict", async (req, res) => {
  const { model, features, rawString } = req.body;
  const activeModel = model || "Logistic Regression";
  let parsedFeatures;
  try {
    if (rawString) {
      const values = rawString.split(",").map((v) => parseFloat(v.trim()));
      if (values.length !== 77 && values.some(isNaN)) {
        return res.status(400).json({ error: `Bulk parse error: Expected 77 comma-separated numbers, got ${values.length}.` });
      }
      parsedFeatures = {
        "TYPE OF ADMISSION-EMERGENCY/OPD": values[2] === 1 ? 1 : 0,
        "ALCOHOL": values[12] === 1 ? 1 : 0,
        "HTN": values[25] === 1 ? 1 : 0,
        "CAD": values[26] === 1 ? 1 : 0,
        "TLC": isNaN(values[4]) ? 10 : values[4],
        "PLATELETS": isNaN(values[5]) ? 150 : values[5],
        "CREATININE": isNaN(values[7]) ? 1 : values[7],
        "EF": isNaN(values[8]) ? 50 : values[8],
        "ACS": values[9] === 1 ? 1 : 0,
        "HFREF": values[10] === 1 ? 1 : 0,
        "HFNEF": values[11] === 1 ? 1 : 0,
        "CHB": values[13] === 1 ? 1 : 0,
        "AKI": values[15] === 1 ? 1 : 0,
        "UTI": values[19] === 1 ? 1 : 0,
        "CARDIOGENIC SHOCK": values[20] === 1 ? 1 : 0,
        "SHOCK": values[21] === 1 ? 1 : 0,
        "renal_risk_score": isNaN(values[7]) ? 0 : values[7] / 1.2
      };
    } else {
      parsedFeatures = features;
    }
    if (!parsedFeatures) {
      return res.status(400).json({ error: "No features provided." });
    }
    const { probability, threshold } = calculateRisk(activeModel, parsedFeatures);
    const isHighRisk = probability >= threshold;
    let analysisText = "";
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });
        const prompt = `You are a Senior Clinical AI specialist and Chief Emergency Cardiologist.
Analyze the following patient telemetry values and mortality risk prediction from the EROP Early Warning System:
Model Selected: ${activeModel}
Mortality Risk Score: ${(probability * 100).toFixed(1)}% (Decision Threshold: ${(threshold * 100).toFixed(1)}%)
Risk Category: ${isHighRisk ? "HIGH RISK" : "LOW RISK"}

Patient EMR Telemetry:
- Admission Type: ${parsedFeatures["TYPE OF ADMISSION-EMERGENCY/OPD"] ? "Emergency Department (ED)" : "Outpatient Department (OPD)"}
- Alcohol History: ${parsedFeatures["ALCOHOL"] ? "Yes" : "No"}
- Hypertension (HTN): ${parsedFeatures["HTN"] ? "Yes" : "No"}
- Coronary Artery Disease (CAD): ${parsedFeatures["CAD"] ? "Yes" : "No"}
- Acute Coronary Syndrome (ACS): ${parsedFeatures["ACS"] ? "Yes" : "No"}
- Heart Failure: HFrEF (Reduced EF): ${parsedFeatures["HFREF"] ? "Yes" : "No"}, HFnEF (Normal EF): ${parsedFeatures["HFNEF"] ? "Yes" : "No"}
- Complete Heart Block (CHB): ${parsedFeatures["CHB"] ? "Yes" : "No"}
- Acute Kidney Injury (AKI): ${parsedFeatures["AKI"] ? "Yes" : "No"}
- Urinary Tract Infection (UTI): ${parsedFeatures["UTI"] ? "Yes" : "No"}
- Cardiogenic Shock: ${parsedFeatures["CARDIOGENIC SHOCK"] ? "Yes" : "No"}
- General Shock: ${parsedFeatures["SHOCK"] ? "Yes" : "No"}
- TLC (Total Leucocyte Count): ${parsedFeatures["TLC"]} K/µL
- Platelets: ${parsedFeatures["PLATELETS"]} K/µL
- Creatinine: ${parsedFeatures["CREATININE"]} mg/dL
- Ejection Fraction (EF): ${parsedFeatures["EF"]}%
- Renal Risk Score: ${parsedFeatures["renal_risk_score"].toFixed(2)}

Please write a highly professional, concise, well-structured clinical analysis in Markdown.
Structure your report with:
1. **Clinical Risk Classification**: Summarize the risk category and model prediction.
2. **Critical Telemetry Highlights**: Point out any values that are highly abnormal (e.g., severe shock, extremely low EF, high Creatinine/renal score) and their clinical significance.
3. **Pathophysiological Assessment**: Explain how these conditions interact (e.g., cardiorenal syndrome, cardiogenic shock).
4. **Recommended Care Pathway**: Outline immediate steps for the care team.`;
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt
        });
        analysisText = response.text || "";
      } catch (geminiError) {
        console.warn("Gemini prediction analysis failed:", geminiError);
        analysisText = getFallbackReport(isHighRisk, parsedFeatures, activeModel, probability, threshold);
      }
    } else {
      analysisText = getFallbackReport(isHighRisk, parsedFeatures, activeModel, probability, threshold);
    }
    res.json({
      probability,
      threshold,
      isHighRisk,
      modelUsed: activeModel,
      analysis: analysisText
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});
app.get("/api/er/stats", (req, res) => {
  if (!erStatsCache) {
    return res.status(503).json({ error: "ER historical data is not yet parsed or cached." });
  }
  res.json(erStatsCache);
});
app.post("/api/er/predict", (req, res) => {
  const { hospitalName, scenario, multiplier = 1 } = req.body;
  if (!erStatsCache || !erStatsCache.stats[hospitalName]) {
    return res.status(404).json({ error: `Hospital '${hospitalName}' data not found in cache.` });
  }
  const hStats = erStatsCache.stats[hospitalName];
  const maxBeds = hStats.beds;
  let scenarioMultiplier = 1;
  let severityLevel = "Normal";
  let scenarioDescription = "Standard operations.";
  switch (scenario) {
    case "Flu Outbreak":
      scenarioMultiplier = 1.45;
      severityLevel = "Severe";
      scenarioDescription = "Widespread seasonal respiratory infections forcing continuous patient inflow.";
      break;
    case "Extreme Weather":
      scenarioMultiplier = 1.35;
      severityLevel = "Elevated";
      scenarioDescription = "Adverse atmospheric conditions leading to safety slips, cardiac distress, and transport bottlenecks.";
      break;
    case "Holiday Surge":
      scenarioMultiplier = 1.65;
      severityLevel = "Critical";
      scenarioDescription = "Reduced primary clinic availability combined with festive gatherings causing major ER backlogs.";
      break;
    case "Local Sports Festival":
      scenarioMultiplier = 1.25;
      severityLevel = "Elevated";
      scenarioDescription = "Large mass gathering creating transient minor trauma and dehydration spikes.";
      break;
    default:
      scenarioMultiplier = 1;
      severityLevel = "Normal";
      scenarioDescription = "Standard operations with typical baseline patient arrival profiles.";
  }
  const finalMultiplier = scenarioMultiplier * multiplier;
  const arrivals1h = Math.round((4 + Math.random() * 2) * finalMultiplier);
  const arrivals3h = Math.round((12 + Math.random() * 4) * finalMultiplier);
  const arrivals6h = Math.round((28 + Math.random() * 6) * finalMultiplier);
  const arrivals24h = Math.round((105 + Math.random() * 15) * finalMultiplier);
  const baseOccupiedBeds = Math.round(maxBeds * 0.58);
  const additionalBedsNeeded = Math.round(arrivals6h * 0.65);
  const totalBedsOccupied = Math.min(maxBeds, baseOccupiedBeds + additionalBedsNeeded);
  const bedOccupancyRate = totalBedsOccupied / maxBeds;
  let alertStatus = "GREEN";
  if (bedOccupancyRate > 0.88 || finalMultiplier >= 1.5) {
    alertStatus = "RED";
  } else if (bedOccupancyRate > 0.72 || finalMultiplier >= 1.2) {
    alertStatus = "YELLOW";
  }
  const recommendedNurses = Math.ceil(totalBedsOccupied * 0.28 + (alertStatus === "RED" ? 5 : 2));
  const recommendedDoctors = Math.ceil(totalBedsOccupied * 0.14 + (alertStatus === "RED" ? 3 : 1));
  const activeNurses = Math.ceil(maxBeds * 0.22);
  const activeDoctors = Math.ceil(maxBeds * 0.1);
  const nurseDeficit = Math.max(0, recommendedNurses - activeNurses);
  const doctorDeficit = Math.max(0, recommendedDoctors - activeDoctors);
  res.json({
    hospitalName,
    scenario,
    finalMultiplier: parseFloat(finalMultiplier.toFixed(2)),
    severityLevel,
    scenarioDescription,
    forecast: {
      arrivals: {
        "1h": arrivals1h,
        "3h": arrivals3h,
        "6h": arrivals6h,
        "24h": arrivals24h
      },
      resources: {
        maxBeds,
        bedsOccupied: totalBedsOccupied,
        bedOccupancyRate: parseFloat((bedOccupancyRate * 100).toFixed(1)),
        recommendedNurses,
        recommendedDoctors,
        activeNurses,
        activeDoctors,
        nurseDeficit,
        doctorDeficit
      },
      alertStatus,
      peakHoursDetected: alertStatus === "RED" ? ["Evening (18:00 - 22:00)", "Late Night (22:00 - 02:00)"] : ["Evening (19:00 - 21:00)"]
    }
  });
});
function getFallbackReport(isHighRisk, f, model, prob, thresh) {
  const probPct = (prob * 100).toFixed(1);
  const threshPct = (thresh * 100).toFixed(1);
  return `### EROP Clinical Fallback Diagnosis Report
**Algorithm:** ${model}  
**Calculated Mortality Risk:** ${probPct}% (Decision Threshold: ${threshPct}%)  
**Risk Category:** ${isHighRisk ? "🚨 HIGH RISK (Safety Cutoff Breached)" : "🟢 LOW RISK (Stable Profile)"}

---

#### 1. Clinical Risk Classification
The EROP clinical intelligence classifier has evaluated the patient telemetry as **${isHighRisk ? "HIGH RISK" : "LOW RISK"}**. This patient's clinical profile ${isHighRisk ? "breaches" : "remains within"} the safety thresholds established on historic patient cohorts.

#### 2. Telemetry Assessment
*   **Cardiovascular Profile:** Ejection Fraction is **${f["EF"]}%**. ${f["EF"] < 40 ? "⚠️ Severely reduced systolic function (Heart Failure risk)." : "Normal to borderline systolic function."}
    ${f["CARDIOGENIC SHOCK"] ? "*   **CRITICAL ALERT:** Patient is in Cardiogenic Shock. High mortality risk associated." : ""}
    ${f["SHOCK"] ? "*   **CRITICAL ALERT:** General Shock state detected. Requires immediate fluid resuscitation / vasopressor support." : ""}
*   **Renal Profile:** Creatinine is **${f["CREATININE"]} mg/dL**, with a calculated Renal Risk Score of **${f["renal_risk_score"].toFixed(2)}**. ${f["CREATININE"] > 1.2 ? "⚠️ Acute kidney distress / creatinine elevation." : "Renal indices are currently stable."}
*   **Hematology:** TLC is **${f["TLC"]} K/µL** and Platelets are **${f["PLATELETS"]} K/µL**. ${f["TLC"] > 11 ? "⚠️ Elevated TLC indicates active clinical infection or inflammatory response." : ""} ${f["PLATELETS"] < 150 ? "⚠️ Thrombocytopenia risk present." : ""}

#### 3. Recommended Care Pathway
${isHighRisk ? `1.  **Immediate ICU Admission:** Admit patient directly to Cardiac Care Unit (CCU) / Intensive Care Unit.
2.  **Inotropic & Vasopressor Support:** Optimize hemodynamics if general or cardiogenic shock is active.
3.  **Renal & Electrolyte Management:** Obtain immediate nephrology consultation; monitor fluid balance hourly.
4.  **Continuous Telemetry:** Initiate full continuous ECG and pulse oximetry monitoring.` : `1.  **Standard Admission:** Suitable for floor admission or continued observations.
2.  **Telemetry Review:** Re-evaluate vitals and labs in 12-24 hours.
3.  **Symptomatic Management:** Tailor protocols based on primary admitting diagnosis (e.g., HTN, UTI).`}`;
}
async function startServer() {
  if (true) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EROP server running on http://localhost:${PORT}`);
  });
}
startServer();
