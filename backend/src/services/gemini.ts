import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";
import type { 
  IncidentType, TrainRealData,
  OperationalRecs, PredictiveForecast, Explainability 
} from "@railmind/shared";
import type { CalculatedImpactData } from "./impactEngine";

export type TrainIntelligenceResponse = {
  operationalRecs: OperationalRecs;
  predictiveForecast: PredictiveForecast[];
  explainability: Explainability[];
};

export async function analyzeTrainIncidentWithGemini(
  incidentType: IncidentType,
  trainData: TrainRealData,
  impactData: CalculatedImpactData,
  weatherSummary?: string
): Promise<TrainIntelligenceResponse> {
  if (!env.geminiApiKey) {
    console.log("[Gemini] No API key provided. Using simulated fallback.");
    return generateFallback(incidentType, trainData, impactData);
  }

  const now = new Date();
  const timeString = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });

  const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });

  const prompt = `
You are the RAILMIND Emergency Intelligence Agent.
A disaster incident has been declared. We have already calculated the geographic and network impact.
Your job is to provide Operational Recommendations, a Predictive Forecast, and Explainability for your decisions.
Provide time-sensitive and geographically relevant instructions.

CURRENT TIME (IST): ${dateString} ${timeString}

TRAIN DATA:
Train Number: ${trainData.trainNumber}
Train Name: ${trainData.trainName}
Current Status: ${trainData.runningStatus}
Last Known Position (Lat/Lng): ${trainData.currentPosition[0]}, ${trainData.currentPosition[1]}

INCIDENT TYPE: ${incidentType}

CALCULATED IMPACT:
Affected Stations: ${impactData.impactAnalysis.affectedStations.join(", ")}
Nearby Trains: ${impactData.impactAnalysis.nearbyTrains.join(", ")}
Risk Level: ${impactData.impactAnalysis.riskLevel}

${weatherSummary ? `WEATHER CONDITIONS:\n${weatherSummary}\n\nIMPORTANT: Factor weather conditions into your recommendations. If there are weather alerts, include specific weather-related safety instructions for train drivers.` : ''}

You must return ONLY a valid JSON object matching the exact structure below. Do not include markdown formatting like \`\`\`json.

{
  "operationalRecs": {
    "priority": "Critical" | "High" | "Medium" | "Low",
    "actions": [string],
    "confidence": number,
    "expectedOutcome": string
  },
  "predictiveForecast": [
    {
      "timeframe": "15min" | "30min" | "60min" | "120min",
      "networkImpact": string,
      "affectedTrains": number,
      "expectedDelays": string,
      "recoveryForecast": string
    }
  ],
  "explainability": [
    {
      "decision": string,
      "reason": string,
      "confidence": number,
      "expectedImpact": string
    }
  ]
}
`;

  // Model fallback chain — try multiple models if one is overloaded
  const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  const MAX_RETRIES = 2;
  
  for (const model of MODELS) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[Gemini] Calling ${model} (attempt ${attempt + 1}) for ${incidentType} on train ${trainData.trainNumber}...`);
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });

        const text = response.text || "";
        const parsed = JSON.parse(text) as TrainIntelligenceResponse;

        console.log(`[Gemini] ✅ Successfully generated response via ${model} for ${trainData.trainNumber}`);
        return parsed;
      } catch (error: any) {
        const status = error?.status || error?.httpStatusCode;
        const isRetryable = status === 503 || status === 429 || status === 500;
        
        if (isRetryable && attempt < MAX_RETRIES) {
          const backoffMs = 1000 * Math.pow(2, attempt); // 1s, 2s
          console.warn(`[Gemini] ${model} returned ${status}. Retrying in ${backoffMs}ms...`);
          await new Promise(r => setTimeout(r, backoffMs));
          continue;
        }
        
        if (isRetryable) {
          console.warn(`[Gemini] ${model} exhausted retries. Trying next model...`);
          break; // move to next model
        }
        
        // Non-retryable error (e.g. bad JSON parse, 400 bad request)
        console.error(`[Gemini] ${model} failed with non-retryable error:`, error.message || error);
        break; // move to next model
      }
    }
  }

  console.error("[Gemini] All models exhausted. Using intelligent fallback.");
  return generateFallback(incidentType, trainData, impactData);
}

function generateFallback(type: IncidentType, train: TrainRealData, impact: CalculatedImpactData): TrainIntelligenceResponse {
  return {
    operationalRecs: {
      priority: impact.impactAnalysis.riskLevel === "critical" ? "Critical" : "High",
      actions: [
        `Halt Train ${train.trainNumber} immediately`,
        `Divert incoming trains: ${impact.impactAnalysis.incomingTrains.join(", ") || "None"}`,
        "Dispatch Disaster Response Team (NDRF)"
      ],
      confidence: 94,
      expectedOutcome: "Collision risk prevented and immediate medical relief deployed."
    },
    predictiveForecast: [
      { timeframe: "15min", networkImpact: "Local segment locked", affectedTrains: impact.passengerMetrics.affectedTrains, expectedDelays: "45m", recoveryForecast: "Evaluating damage" },
      { timeframe: "30min", networkImpact: "Regional cascading delays", affectedTrains: impact.passengerMetrics.affectedTrains + 2, expectedDelays: "90m", recoveryForecast: "Clearance starting" },
      { timeframe: "60min", networkImpact: "Diversion routes congested", affectedTrains: impact.passengerMetrics.affectedTrains + 5, expectedDelays: "120m", recoveryForecast: "Track reopening estimated" },
      { timeframe: "120min", networkImpact: "Normalizing", affectedTrains: impact.passengerMetrics.affectedTrains, expectedDelays: "15m", recoveryForecast: "Operations restoring" }
    ],
    explainability: [
      {
        decision: `Halt Train ${train.trainNumber}`,
        reason: "Primary train involved in incident.",
        confidence: 99,
        expectedImpact: "Prevents further damage."
      }
    ]
  };
}
