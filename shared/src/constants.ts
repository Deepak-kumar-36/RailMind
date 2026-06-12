import type { AgentDescriptor, IncidentScenario, IncidentType, MapIncident } from "./types";

export const AGENTS: AgentDescriptor[] = [
  { id: "incident-intelligence", name: "Incident Intelligence", role: "Analyze incident severity and confidence", icon: "sensors" },
  { id: "safety", name: "Safety", role: "Train halts, speed restrictions, diversions", icon: "shield" },
  { id: "resource-allocation", name: "Resource Allocation", role: "Emergency resource deployment planning", icon: "local_shipping" },
  { id: "communication", name: "Communication", role: "Passenger alerts and announcements", icon: "campaign" },
  { id: "predictive-simulation", name: "Predictive Simulation", role: "Network impact forecasting", icon: "timeline" },
  { id: "audit-reporting", name: "Audit & Reporting", role: "Incident report and compliance", icon: "description" }
];

export const INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    type: "derailment",
    label: "Train Derailment",
    location: "Mathura Junction",
    severity: 9,
    description: "Train derailment detected at Mathura Junction. Multiple carriages displaced.",
    icon: "train"
  },
  {
    type: "signal-failure",
    label: "Signal Failure",
    location: "Mumbai Central",
    severity: 7,
    description: "Critical signal failure at Mumbai Central. Automatic signaling system offline.",
    icon: "report_problem"
  },
  {
    type: "flood",
    label: "Flash Flood",
    location: "Chennai–Bangalore Corridor",
    severity: 8,
    description: "Flash flood warning along Chennai–Bangalore corridor. Track submersion detected.",
    icon: "water"
  },
  {
    type: "security-threat",
    label: "Security Threat",
    location: "Howrah Station",
    severity: 10,
    description: "Security threat reported at Howrah Station. Evacuation protocol recommended.",
    icon: "gpp_maybe"
  }
];

export const MOCK_INCIDENTS: Record<IncidentType, Omit<MapIncident, "id" | "triggeredAt">> = {
  derailment: {
    type: "derailment",
    title: "Derailment",
    station: "Mathura Junction",
    position: [27.4924, 77.6737],
    radiusMeters: 120000,
    riskLevel: "critical",
    color: "#dc2626"
  },
  "signal-failure": {
    type: "signal-failure",
    title: "Signal Failure",
    station: "Mumbai Central",
    position: [19.076, 72.8777],
    radiusMeters: 90000,
    riskLevel: "elevated",
    color: "#d97706"
  },
  flood: {
    type: "flood",
    title: "Flash Flood",
    station: "Chennai–Bangalore Corridor",
    position: [12.9716, 77.5946],
    radiusMeters: 140000,
    riskLevel: "elevated",
    color: "#2563eb"
  },
  "security-threat": {
    type: "security-threat",
    title: "Security Threat",
    station: "Howrah Station",
    position: [22.5726, 88.3639],
    radiusMeters: 100000,
    riskLevel: "critical",
    color: "#dc2626"
  }
};
