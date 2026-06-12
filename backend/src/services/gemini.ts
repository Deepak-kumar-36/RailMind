import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";
import type { 
  IncidentType, TrainRealData, ImpactAnalysis, DriverNotification, 
  OperationalRecs, PassengerMetrics, NetworkStatus, 
  PredictiveForecast, Explainability 
} from "@railmind/shared";

export type TrainIntelligenceResponse = {
  impactAnalysis: ImpactAnalysis;
  driverNotifications: DriverNotification[];
  operationalRecs: OperationalRecs;
  passengerMetrics: PassengerMetrics;
  network: NetworkStatus;
  predictiveForecast: PredictiveForecast[];
  explainability: Explainability[];
};

export async function analyzeTrainIncidentWithGemini(
  incidentType: IncidentType,
  trainData: TrainRealData
): Promise<TrainIntelligenceResponse> {
  if (!env.geminiApiKey) {
    console.log("[Gemini] No API key provided. Using simulated fallback.");
    return generateFallback(incidentType, trainData);
  }

  const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });

  const prompt = `
You are the RAILMIND Real Railway Intelligence Layer.
A disaster incident has been declared for a specific train.

TRAIN DATA:
Train Number: ${trainData.trainNumber}
Train Name: ${trainData.trainName}
Current Status: ${trainData.runningStatus}
Current Position: ${trainData.currentPosition[0]}, ${trainData.currentPosition[1]}
Current Route Station: ${trainData.route.find(r => r.status === 'current')?.name || 'Unknown'}

INCIDENT TYPE: ${incidentType}

You must return ONLY a valid JSON object matching the exact structure below. Do not include markdown formatting like \`\`\`json.

{
  "impactAnalysis": {
    "affectedSegment": string,
    "impactRadius": string,
    "affectedStations": [string],
    "nearbyTrains": [string],
    "incomingTrains": [string],
    "outgoingTrains": [string],
    "riskLevel": "low" | "guarded" | "elevated" | "critical",
    "incidentCoordinates": [number, number],
    "affectedCorridorCoordinates": [[number, number]],
    "whyTheseTrains": [
      {
        "trainNumber": string,
        "distanceFromIncident": string,
        "timeToEnterCorridor": string,
        "riskLevel": "low" | "guarded" | "elevated" | "critical"
      }
    ]
  },
  "driverNotifications": [
    {
      "trainNumber": string,
      "priority": "High" | "Medium" | "Low",
      "status": "Pending" | "Sent" | "Acknowledged" | "Delivered"
    }
  ],
  "operationalRecs": {
    "priority": "Critical" | "High" | "Medium" | "Low",
    "actions": [string],
    "confidence": number,
    "expectedOutcome": string
  },
  "passengerMetrics": {
    "affectedTrains": number,
    "affectedStations": number,
    "passengersImpacted": number,
    "estimatedDelay": string,
    "recoveryEta": string
  },
  "network": {
    "networkHealth": number,
    "activeIncidents": number,
    "trainsAffected": number,
    "trainsHalted": number,
    "trainsRerouted": number,
    "resourcesDeployed": number,
    "passengersImpacted": number,
    "recoveryEta": string
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

  try {
    console.log(`[Gemini] Calling Gemini API for ${incidentType} on train ${trainData.trainNumber}...`);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "";
    const parsed = JSON.parse(text) as TrainIntelligenceResponse;

    console.log(`[Gemini] Successfully generated response for ${trainData.trainNumber}`);
    return parsed;
  } catch (error) {
    console.error("[Gemini] Failed to generate or parse response. Falling back.", error);
    return generateFallback(incidentType, trainData);
  }
}

function generateFallback(type: IncidentType, train: TrainRealData): TrainIntelligenceResponse {
  const currentSt = train.route.find(r => r.status === 'current') || train.route[0];
  const nextSt = train.route.find(r => r.status === 'upcoming') || train.route[train.route.length - 1];
  
  return {
    impactAnalysis: {
      affectedSegment: `${currentSt.name} - ${nextSt.name}`,
      impactRadius: "25km",
      affectedStations: [currentSt.name, nextSt.name],
      nearbyTrains: ["12951", "22436"],
      incomingTrains: ["12004"],
      outgoingTrains: ["12269"],
      riskLevel: "critical",
      incidentCoordinates: train.currentPosition,
      affectedCorridorCoordinates: [[currentSt.lat, currentSt.lng], [nextSt.lat, nextSt.lng]],
      whyTheseTrains: [
        {
          trainNumber: "12951",
          distanceFromIncident: "12 km",
          timeToEnterCorridor: "15 min",
          riskLevel: "critical"
        }
      ]
    },
    driverNotifications: [
      { trainNumber: train.trainNumber, priority: "High", status: "Delivered" },
      { trainNumber: "12951", priority: "High", status: "Acknowledged" },
      { trainNumber: "22436", priority: "Medium", status: "Pending" }
    ],
    operationalRecs: {
      priority: "Critical",
      actions: [
        `Halt Train ${train.trainNumber} immediately`,
        "Divert 12951 to alternate route via Bina",
        "Dispatch Disaster Response Team (NDRF)"
      ],
      confidence: 94,
      expectedOutcome: "Collision risk prevented and immediate medical relief deployed."
    },
    passengerMetrics: {
      affectedTrains: 7,
      affectedStations: 4,
      passengersImpacted: 4820,
      estimatedDelay: "2h 45m",
      recoveryEta: "2h 15m"
    },
    network: {
      networkHealth: 68,
      activeIncidents: 1,
      trainsAffected: 7,
      trainsHalted: 2,
      trainsRerouted: 1,
      resourcesDeployed: 12,
      passengersImpacted: 4820,
      recoveryEta: "2h 15m"
    },
    predictiveForecast: [
      { timeframe: "15min", networkImpact: "Local segment locked", affectedTrains: 2, expectedDelays: "45m", recoveryForecast: "Evaluating damage" },
      { timeframe: "30min", networkImpact: "Regional cascading delays", affectedTrains: 4, expectedDelays: "90m", recoveryForecast: "Clearance starting" },
      { timeframe: "60min", networkImpact: "Diversion routes congested", affectedTrains: 7, expectedDelays: "120m", recoveryForecast: "Track reopening estimated" },
      { timeframe: "120min", networkImpact: "Normalizing", affectedTrains: 3, expectedDelays: "15m", recoveryForecast: "Operations restoring" }
    ],
    explainability: [
      {
        decision: `Halt Train 12951`,
        reason: "Entering affected corridor within 15 minutes.",
        confidence: 96,
        expectedImpact: "Prevents secondary collision risk."
      }
    ]
  };
}
