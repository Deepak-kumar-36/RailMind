export type RiskLevel = "low" | "guarded" | "elevated" | "critical";

export type AgentDescriptor = {
  id: string;
  name: string;
  role: string;
  icon: string; // Material Symbols icon name
};

export type IncidentSummary = {
  id: string;
  title: string;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
};

export type IncidentType = "derailment" | "signal-failure" | "flood" | "security-threat";

export type MapIncident = {
  id: string;
  type: IncidentType;
  title: string;
  station: string;
  position: [number, number];
  radiusMeters: number;
  riskLevel: RiskLevel;
  color: string;
  triggeredAt: string;
};

export type AgentStatus = "waiting" | "analyzing" | "completed";

export type AgentResult = {
  agentId: string;
  status: AgentStatus;
  confidence: number;
  summary: string;
  data: Record<string, unknown>;
};

export type TimelineEvent = {
  id: string;
  timestamp: string;
  description: string;
  agentId?: string;
};

export type ExplainableDecision = {
  decision: string;
  confidence: number;
  reason: string;
  expectedImpact: string;
};

export type IncidentReport = {
  incidentId: string;
  summary: string;
  actions: string[];
  resources: Record<string, number>;
  impact: { "15min": string; "30min": string; "60min": string };
  timeline: TimelineEvent[];
};

export type IncidentScenario = {
  type: IncidentType;
  label: string;
  location: string;
  severity: number;
  description: string;
  icon: string;
};

export type NetworkStatus = {
  networkHealth: number;
  activeIncidents: number;
  trainsAffected: number;
  trainsHalted: number;
  trainsRerouted: number;
  resourcesDeployed: number;
  passengersImpacted: number;
  recoveryEta: string;
};

export type StationData = {
  name: string;
  code: string;
  lat: number;
  lng: number;
  status: "passed" | "current" | "upcoming";
  scheduledArrival: string;
};

export type TrainRealData = {
  trainNumber: string;
  trainName: string;
  runningStatus: "on-time" | "delayed" | "halted";
  currentPosition: [number, number];
  route: StationData[];
};

export type PredictiveForecast = {
  timeframe: "15min" | "30min" | "60min" | "120min";
  networkImpact: string;
  affectedTrains: number;
  expectedDelays: string;
  recoveryForecast: string;
};

export type RealTimeDecision = {
  priority: "Critical" | "High" | "Medium" | "Low";
  actions: string[];
  confidence: number;
  expectedOutcome: string;
};

export type Explainability = {
  decision: string;
  reason: string;
  confidence: number;
  expectedImpact: string;
};

export type WhyThisTrain = {
  trainNumber: string;
  distanceFromIncident: string;
  timeToEnterCorridor: string;
  riskLevel: RiskLevel;
};

// Replace old OperationalRecs with the new Decision Engine schema
export type OperationalRecs = RealTimeDecision;

// Expanding ImpactAnalysis to map coordinates
export type ImpactAnalysis = {
  affectedSegment: string;
  impactRadius: string;
  affectedStations: string[];
  nearbyTrains: string[];
  incomingTrains: string[];
  outgoingTrains: string[];
  riskLevel: RiskLevel;
  // For mapping
  incidentCoordinates?: [number, number];
  affectedCorridorCoordinates?: [number, number][];
  whyTheseTrains?: WhyThisTrain[];
};

export type PassengerMetrics = {
  affectedTrains: number;
  affectedStations: number;
  passengersImpacted: number;
  estimatedDelay: string;
  recoveryEta: string;
};

export type DriverNotification = {
  trainNumber: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Sent" | "Acknowledged" | "Delivered";
};

export type StationWeather = {
  stationName: string;
  stationCode: string;
  temp: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  visibility: number;
  riskLevel: "safe" | "caution" | "danger";
  alerts: string[];
};

export type RouteWeatherReport = {
  stationWeather: StationWeather[];
  overallRisk: "safe" | "caution" | "danger";
  summary: string;
};

export type DriverNotificationWithMessage = DriverNotification & {
  message: string;
};

export type TranslatedNotifications = {
  en: DriverNotificationWithMessage[];
  hi: DriverNotificationWithMessage[];
  regional: DriverNotificationWithMessage[];
  regionalLanguage: string;
};

