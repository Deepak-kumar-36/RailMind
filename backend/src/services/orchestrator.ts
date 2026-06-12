import type { Server } from "socket.io";
import type {
  IncidentType,
  TrainRealData,
} from "@railmind/shared";
import { analyzeTrainIncidentWithGemini } from "./gemini";

const DELAY_MS = 2000;

export async function orchestrateTrainIncident(
  io: Server,
  incidentType: IncidentType,
  trainData: TrainRealData
) {
  // 1. Call Gemini for full analysis
  const analysis = await analyzeTrainIncidentWithGemini(incidentType, trainData);
  
  const now = new Date();
  const formatTime = () => now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 2. Emit step by step to simulate real-time thinking
  io.emit("timeline:event", { id: "1", timestamp: formatTime(), description: `Incident Created: ${incidentType.toUpperCase()}` });
  
  // Step 1: Impact Analysis
  io.emit("train_intel:status", "Analyzing impact radius...");
  await delay(DELAY_MS);
  io.emit("timeline:event", { id: "2", timestamp: formatTime(), description: "Impact Zone Calculated" });
  io.emit("train_intel:impact", analysis.impactAnalysis);

  // Step 2: Driver Notifications
  io.emit("train_intel:status", "Generating driver notifications...");
  await delay(DELAY_MS);
  io.emit("timeline:event", { id: "3", timestamp: formatTime(), description: "Drivers Identified for Notification" });
  io.emit("train_intel:drivers", analysis.driverNotifications);

  // Step 3: Operational Recommendations & Explainability
  io.emit("train_intel:status", "Formulating operational recommendations...");
  await delay(DELAY_MS);
  io.emit("timeline:event", { id: "4", timestamp: formatTime(), description: "AI Decision Engine Completed" });
  io.emit("train_intel:ops", analysis.operationalRecs);
  io.emit("train_intel:explain", analysis.explainability);

  // Step 4: Passenger Metrics & Predictive Forecast
  io.emit("train_intel:status", "Calculating passenger impact and forecasting...");
  await delay(DELAY_MS);
  io.emit("timeline:event", { id: "5", timestamp: formatTime(), description: "Predictive Forecast Generated" });
  io.emit("train_intel:passengers", analysis.passengerMetrics);
  io.emit("train_intel:forecast", analysis.predictiveForecast);

  // Final Network Update
  io.emit("network:status", analysis.network);
  io.emit("timeline:event", { id: "6", timestamp: formatTime(), description: "Operations Center Initialized" });
  io.emit("train_intel:completed");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
