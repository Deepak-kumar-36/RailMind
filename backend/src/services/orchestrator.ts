import type { Server } from "socket.io";
import { randomUUID } from "crypto";
import type {
  IncidentType,
  TrainRealData,
  MapIncident,
} from "@railmind/shared";
import { analyzeTrainIncidentWithAI } from "./agent";
import { calculateImpact } from "./impactEngine";
import { getRouteWeather } from "./weatherService";
import { translateNotifications } from "./translator";
import {
  saveIncident,
  saveTimelineEvent,
  saveReport,
  saveExplainableDecision,
} from "../db/queries";

const DELAY_MS = 2000;

export async function orchestrateTrainIncident(
  io: Server,
  incidentType: IncidentType,
  trainData: TrainRealData
) {
  const incidentId = randomUUID();
  const now = new Date();
  const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Determine geographic point
  const currentSt = trainData.route.find((r) => r.status === "current") || trainData.route[0];
  const position: [number, number] = [currentSt.lat, currentSt.lng];

  // 2. Initial DB Save
  const mapIncident: MapIncident = {
    id: incidentId,
    title: `${incidentType.toUpperCase()} on ${trainData.trainNumber}`,
    type: incidentType,
    station: currentSt.name,
    position,
    radiusMeters: incidentType === "derailment" ? 120000 : 90000,
    riskLevel: "critical",
    color: "#EF4444",
    triggeredAt: now.toISOString(),
  };

  try {
    await saveIncident(mapIncident);
  } catch (err) {
    console.error("DB Error: saveIncident failed", err);
  }

  io.emit("train_intel:start", { incidentId });

  // Helper to emit and save timeline
  const emitTimeline = async (id: string, desc: string) => {
    const time = formatTime();
    const event = { id: `${incidentId}-${id}`, timestamp: time, description: desc };
    io.emit("timeline:event", event);
    try {
      await saveTimelineEvent(incidentId, event);
    } catch (err) {
      console.error("DB Error: saveTimelineEvent failed", err);
    }
  };

  await emitTimeline("1", `Incident Created: ${incidentType.toUpperCase()}`);
  
  // Step 1: Deterministic Impact Analysis (Code-based)
  io.emit("train_intel:status", "Analyzing impact radius...");
  const impactData = calculateImpact(incidentType, trainData);
  await delay(DELAY_MS);
  await emitTimeline("2", "Impact Zone Calculated");
  io.emit("train_intel:impact", impactData.impactAnalysis);

  // Step 1.5: Weather Intelligence
  io.emit("train_intel:status", "Scanning weather conditions along route...");
  const weatherReport = await getRouteWeather(trainData.route);
  await delay(1000);
  await emitTimeline("2b", `Weather Scan: ${weatherReport.overallRisk.toUpperCase()} — ${weatherReport.stationWeather.filter(s => s.alerts.length > 0).length} alerts`);
  io.emit("train_intel:weather", weatherReport);

  // Step 2: Driver Notifications (Calculated)
  io.emit("train_intel:status", "Generating driver notifications...");
  await delay(DELAY_MS);
  await emitTimeline("3", "Drivers Identified for Notification");
  io.emit("train_intel:drivers", impactData.driverNotifications);

  // Step 2.5: Multi-Language Translation
  io.emit("train_intel:status", "Translating alerts to Hindi + regional language...");
  const translated = await translateNotifications(
    impactData.driverNotifications,
    incidentType,
    trainData.currentPosition
  );
  await emitTimeline("3b", `Alerts translated: English, Hindi, ${translated.regionalLanguage}`);
  io.emit("train_intel:translations", translated);

  // Step 3: AI Recommendations & Explainability (Gemini) — now with weather
  io.emit("train_intel:status", "Formulating operational recommendations (AI)...");
  const aiAnalysis = await analyzeTrainIncidentWithAI(incidentType, trainData, impactData, weatherReport.summary);
  await emitTimeline("4", "AI Decision Engine Completed");
  io.emit("train_intel:ops", aiAnalysis.operationalRecs);
  io.emit("train_intel:explain", aiAnalysis.explainability);

  try {
    for (const exp of aiAnalysis.explainability) {
      await saveExplainableDecision(incidentId, exp);
    }
  } catch (err) {
    console.error("DB Error: saveExplainableDecision failed", err);
  }

  // Step 4: Passenger Metrics & Predictive Forecast (Mixed)
  io.emit("train_intel:status", "Calculating passenger impact and forecasting...");
  await delay(DELAY_MS);
  await emitTimeline("5", "Predictive Forecast Generated");
  io.emit("train_intel:passengers", impactData.passengerMetrics);
  io.emit("train_intel:forecast", aiAnalysis.predictiveForecast);

  // Final Network Update
  io.emit("network:status", impactData.network);
  await emitTimeline("6", "Operations Center Initialized");
  io.emit("train_intel:completed");

  // Save Final Report
  try {
    await saveReport({
      incidentId,
      summary: `Automated intelligence report for ${incidentType} on train ${trainData.trainNumber}.`,
      actions: aiAnalysis.operationalRecs.actions,
      resources: {},
      impact: {
        "15min": aiAnalysis.predictiveForecast.find(p => p.timeframe === "15min")?.networkImpact || "",
        "30min": aiAnalysis.predictiveForecast.find(p => p.timeframe === "30min")?.networkImpact || "",
        "60min": aiAnalysis.predictiveForecast.find(p => p.timeframe === "60min")?.networkImpact || "",
      },
      timeline: [],
    });
  } catch (err) {
    console.error("DB Error: saveReport failed", err);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
