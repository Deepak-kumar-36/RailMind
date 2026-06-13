import OpenAI from "openai";
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

export async function analyzeTrainIncidentWithAI(
  incidentType: IncidentType,
  trainData: TrainRealData,
  impactData: CalculatedImpactData,
  weatherSummary?: string
): Promise<TrainIntelligenceResponse> {
  if (!env.groqApiKey) {
    console.log("[Groq Agent] No API key provided. Using simulated fallback.");
    return generateFallback(incidentType, trainData, impactData);
  }

  const now = new Date();
  const timeString = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });

  const ai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: env.groqApiKey,
  });

  const prompt = `You are the RAILMIND Emergency Intelligence Agent.
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

${weatherSummary ? `WEATHER CONDITIONS:\n${weatherSummary}\n\nIMPORTANT: Factor weather conditions into your recommendations.` : ''}

You must return ONLY a valid JSON object matching the exact structure below. Do not include markdown formatting like \`\`\`json.

{
  "operationalRecs": {
    "priority": "Critical" | "High" | "Medium" | "Low",
    "actions": ["Action 1", "Action 2"],
    "confidence": 95,
    "expectedOutcome": "Outcome description"
  },
  "predictiveForecast": [
    {
      "timeframe": "15min" | "30min" | "60min" | "120min",
      "networkImpact": "Impact description",
      "affectedTrains": 5,
      "expectedDelays": "45m",
      "recoveryForecast": "Recovery description"
    }
  ],
  "explainability": [
    {
      "decision": "Decision description",
      "reason": "Reason for decision",
      "confidence": 95,
      "expectedImpact": "Impact of decision"
    }
  ]
}
`;

  try {
    console.log(`[Groq Agent] Calling Llama 3 (llama-3.1-8b-instant) for ${incidentType} on train ${trainData.trainNumber}...`);
    const response = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const text = response.choices[0]?.message?.content || "";
    const parsed = JSON.parse(text) as TrainIntelligenceResponse;

    console.log(`[Groq Agent] ✅ Successfully generated response via Llama 3 for ${trainData.trainNumber}`);
    return parsed;
  } catch (error: any) {
    console.error(`[Groq Agent] failed:`, error.message || error);
    return generateFallback(incidentType, trainData, impactData);
  }
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
