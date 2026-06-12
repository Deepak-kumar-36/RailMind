import type {
  AgentResult,
  ExplainableDecision,
  IncidentReport,
  IncidentType,
  NetworkStatus,
  TimelineEvent
} from "@railmind/shared";
import { AGENTS } from "@railmind/shared";

/* ── Pre-built high-quality fallback responses for each scenario ── */
const FALLBACK_RESPONSES: Record<
  IncidentType,
  {
    agents: Omit<AgentResult, "status">[];
    decision: ExplainableDecision;
    report: Omit<IncidentReport, "incidentId" | "timeline">;
    network: NetworkStatus;
  }
> = {
  derailment: {
    agents: [
      {
        agentId: "incident-intelligence",
        confidence: 95,
        summary: "Severity 9/10. 3 trains in risk radius. 10km risk zone established.",
        data: { severity: 9, affectedTrains: 3, riskRadius: "10km" }
      },
      {
        agentId: "safety",
        confidence: 93,
        summary: "Halt RM-101, RM-202, RM-303. Speed restriction RM-505 to 30km/h.",
        data: { halt: ["RM-101", "RM-202", "RM-303"], slow: ["RM-505"], reroute: ["RM-606"] }
      },
      {
        agentId: "resource-allocation",
        confidence: 91,
        summary: "5 ambulances, 3 rescue teams, 2 fire units dispatched.",
        data: { ambulances: 5, rescueTeams: 3, fireUnits: 2, securityPersonnel: 8 }
      },
      {
        agentId: "communication",
        confidence: 97,
        summary: "Passenger alerts and station announcements generated.",
        data: {
          passengerAlert: "Attention passengers: Due to a safety incident near Mathura Junction, services are temporarily disrupted. Please follow station staff instructions.",
          stationAnnouncement: "All trains through Mathura Junction are currently held. Expected delay: 45 minutes."
        }
      },
      {
        agentId: "predictive-simulation",
        confidence: 88,
        summary: "15min: 3 delayed. 30min: 6 delayed. 60min: Recovery initiated.",
        data: { "15min": "3 trains delayed, 2 rerouted", "30min": "6 trains delayed, 4 rerouted", "60min": "Recovery operations underway, partial service restored" }
      },
      {
        agentId: "audit-reporting",
        confidence: 99,
        summary: "Incident report INC-1001 generated. Full audit trail recorded.",
        data: { reportId: "INC-1001" }
      }
    ],
    decision: {
      decision: "Halt Train RM-101",
      confidence: 93,
      reason: "Track obstruction detected within safety radius at Mathura Junction. Derailment debris spans 200m of track.",
      expectedImpact: "Prevents collision risk for 3 downstream trains and 1,200 passengers."
    },
    report: {
      summary: "Train derailment detected at Mathura Junction at severity 9/10. Three trains affected within 10km risk radius. Emergency response coordinated through 6 AI agents with 93% average confidence.",
      actions: [
        "Halt trains RM-101, RM-202, RM-303 immediately",
        "Dispatch 5 ambulances and 3 rescue teams to Mathura Junction",
        "Reroute RM-606 via alternate corridor",
        "Issue passenger notifications across 4 stations",
        "Deploy Railway Protection Force (8 personnel)"
      ],
      resources: { ambulances: 5, rescueTeams: 3, fireUnits: 2, security: 8 },
      impact: {
        "15min": "3 trains delayed, 2 rerouted via alternate corridors",
        "30min": "6 trains delayed, 4 rerouted, rescue operations active",
        "60min": "Recovery operations underway, partial service restored"
      }
    },
    network: {
      networkHealth: 62,
      activeIncidents: 1,
      trainsAffected: 3,
      trainsHalted: 3,
      trainsRerouted: 1,
      resourcesDeployed: 18,
      passengersImpacted: 1200,
      recoveryEta: "~45 min"
    }
  },
  "signal-failure": {
    agents: [
      {
        agentId: "incident-intelligence",
        confidence: 92,
        summary: "Severity 7/10. 6 trains affected. Signal zone: Mumbai Central.",
        data: { severity: 7, affectedTrains: 6, riskRadius: "5km" }
      },
      {
        agentId: "safety",
        confidence: 90,
        summary: "Speed restrictions on all Mumbai corridor trains. Manual signaling activated.",
        data: { halt: [], slow: ["RM-101", "RM-202", "RM-404"], reroute: ["RM-505", "RM-606"] }
      },
      {
        agentId: "resource-allocation",
        confidence: 94,
        summary: "2 signal maintenance crews, 4 traffic controllers dispatched.",
        data: { maintenanceCrews: 2, trafficControllers: 4, securityPersonnel: 4 }
      },
      {
        agentId: "communication",
        confidence: 96,
        summary: "Delay notifications sent to 6 platforms at Mumbai Central.",
        data: {
          passengerAlert: "Signal maintenance underway at Mumbai Central. Expect 20-30 minute delays.",
          stationAnnouncement: "Passengers on platforms 3-8: Services delayed due to signal maintenance."
        }
      },
      {
        agentId: "predictive-simulation",
        confidence: 85,
        summary: "15min: 6 delayed. 30min: 4 delayed. 60min: Normal operations.",
        data: { "15min": "6 trains delayed at Mumbai", "30min": "4 trains still delayed", "60min": "Normal operations resumed" }
      },
      {
        agentId: "audit-reporting",
        confidence: 99,
        summary: "Report INC-1002 generated. Signal failure logged.",
        data: { reportId: "INC-1002" }
      }
    ],
    decision: {
      decision: "Activate Manual Signaling Protocol",
      confidence: 90,
      reason: "Automatic signaling system failure at Mumbai Central junction. 6 trains requiring manual coordination.",
      expectedImpact: "Maintains safe operations with 20-30 minute delays until automated system restored."
    },
    report: {
      summary: "Signal failure at Mumbai Central. Severity 7/10. Six trains affected. Manual signaling protocol activated with maintenance crews dispatched.",
      actions: [
        "Activate manual signaling at Mumbai Central",
        "Reduce speed for corridor trains to 40km/h",
        "Dispatch 2 signal maintenance crews",
        "Reassign platform allocations for affected services",
        "Notify passengers of 20-30 minute delays"
      ],
      resources: { maintenanceCrews: 2, trafficControllers: 4, security: 4 },
      impact: {
        "15min": "6 trains delayed at Mumbai corridor",
        "30min": "4 trains still delayed, 2 rerouted",
        "60min": "Signal restoration complete, normal operations"
      }
    },
    network: {
      networkHealth: 74,
      activeIncidents: 1,
      trainsAffected: 6,
      trainsHalted: 0,
      trainsRerouted: 2,
      resourcesDeployed: 10,
      passengersImpacted: 3500,
      recoveryEta: "~30 min"
    }
  },
  flood: {
    agents: [
      {
        agentId: "incident-intelligence",
        confidence: 89,
        summary: "Severity 8/10. Track submersion on Chennai–Bangalore corridor.",
        data: { severity: 8, affectedTrains: 4, riskRadius: "25km" }
      },
      {
        agentId: "safety",
        confidence: 94,
        summary: "Halt all corridor trains. Flood zone established. No entry.",
        data: { halt: ["RM-404", "RM-202"], slow: [], reroute: ["RM-505", "RM-606"] }
      },
      {
        agentId: "resource-allocation",
        confidence: 87,
        summary: "3 rescue boats, 4 rescue teams, 2 drainage crews dispatched.",
        data: { rescueBoats: 3, rescueTeams: 4, drainageCrews: 2, securityPersonnel: 6 }
      },
      {
        agentId: "communication",
        confidence: 95,
        summary: "Flood warnings issued. Alternative transport arranged.",
        data: {
          passengerAlert: "Flash flood warning: Chennai–Bangalore corridor suspended. Bus services arranged.",
          stationAnnouncement: "All services between Chennai and Bangalore are suspended until further notice."
        }
      },
      {
        agentId: "predictive-simulation",
        confidence: 82,
        summary: "15min: Flooding peak. 30min: Water receding. 60min: Assessment begins.",
        data: { "15min": "Flooding at peak, 4 trains halted", "30min": "Water levels receding, track assessment pending", "60min": "Track inspection underway, partial restoration expected" }
      },
      {
        agentId: "audit-reporting",
        confidence: 99,
        summary: "Report INC-1003 generated. Weather event logged.",
        data: { reportId: "INC-1003" }
      }
    ],
    decision: {
      decision: "Suspend Chennai–Bangalore Corridor",
      confidence: 94,
      reason: "Flash flood detected with track submersion along 25km stretch. Water level exceeding safe operational threshold.",
      expectedImpact: "Protects 4 trains and 2,800 passengers from flood-related derailment risk."
    },
    report: {
      summary: "Flash flood on Chennai–Bangalore corridor. Severity 8/10. Corridor suspended. Rescue and drainage operations initiated.",
      actions: [
        "Suspend all services on Chennai–Bangalore corridor",
        "Establish flood zone — no train entry within 25km",
        "Deploy rescue boats and drainage crews",
        "Arrange alternative bus transport for stranded passengers",
        "Monitor water levels for track clearance assessment"
      ],
      resources: { rescueBoats: 3, rescueTeams: 4, drainageCrews: 2, security: 6 },
      impact: {
        "15min": "Flooding at peak intensity, all corridor trains halted",
        "30min": "Water levels beginning to recede, track assessment pending",
        "60min": "Track inspection underway, partial service restoration expected"
      }
    },
    network: {
      networkHealth: 58,
      activeIncidents: 1,
      trainsAffected: 4,
      trainsHalted: 2,
      trainsRerouted: 2,
      resourcesDeployed: 15,
      passengersImpacted: 2800,
      recoveryEta: "~90 min"
    }
  },
  "security-threat": {
    agents: [
      {
        agentId: "incident-intelligence",
        confidence: 97,
        summary: "Severity 10/10. Howrah Station lockdown recommended.",
        data: { severity: 10, affectedTrains: 5, riskRadius: "3km" }
      },
      {
        agentId: "safety",
        confidence: 96,
        summary: "Immediate station lockdown. All trains halted. Evacuation protocol.",
        data: { halt: ["RM-303", "RM-606"], slow: [], reroute: ["RM-101", "RM-202", "RM-505"] }
      },
      {
        agentId: "resource-allocation",
        confidence: 95,
        summary: "12 security personnel, 3 bomb squad units, 5 ambulances deployed.",
        data: { securityPersonnel: 12, bombSquad: 3, ambulances: 5, evacuationBuses: 8 }
      },
      {
        agentId: "communication",
        confidence: 98,
        summary: "Emergency alerts issued. Media statement prepared.",
        data: {
          passengerAlert: "EMERGENCY: Howrah Station evacuated. Follow security instructions. Move to designated safe zones.",
          pressStatement: "A security incident at Howrah Station is being managed. Passenger safety is our highest priority."
        }
      },
      {
        agentId: "predictive-simulation",
        confidence: 90,
        summary: "15min: Full lockdown. 30min: Assessment. 60min: Conditional clearance.",
        data: { "15min": "Full station lockdown, 5 trains affected", "30min": "Security assessment ongoing", "60min": "Conditional clearance if threat neutralized" }
      },
      {
        agentId: "audit-reporting",
        confidence: 99,
        summary: "Report INC-1004 generated. Security protocol logged.",
        data: { reportId: "INC-1004" }
      }
    ],
    decision: {
      decision: "Initiate Howrah Station Lockdown",
      confidence: 96,
      reason: "Security threat confirmed at Howrah Station. Bomb squad and security forces deployment required.",
      expectedImpact: "Ensures safety of 5,000+ passengers currently at Howrah Station complex."
    },
    report: {
      summary: "Security threat at Howrah Station. Severity 10/10. Full lockdown initiated. Security forces deployed. Evacuation underway.",
      actions: [
        "Initiate immediate station lockdown at Howrah",
        "Deploy bomb squad and security forces",
        "Begin controlled passenger evacuation",
        "Halt and reroute all trains approaching Howrah",
        "Issue emergency communications and media statement",
        "Coordinate with local law enforcement"
      ],
      resources: { securityPersonnel: 12, bombSquad: 3, ambulances: 5, evacuationBuses: 8 },
      impact: {
        "15min": "Full station lockdown, all 5 trains stopped or rerouted",
        "30min": "Security assessment and sweep ongoing",
        "60min": "Conditional clearance if threat neutralized"
      }
    },
    network: {
      networkHealth: 41,
      activeIncidents: 1,
      trainsAffected: 5,
      trainsHalted: 2,
      trainsRerouted: 3,
      resourcesDeployed: 28,
      passengersImpacted: 5200,
      recoveryEta: "~120 min"
    }
  }
};

/* ── Timeline event templates ── */
const TIMELINE_TEMPLATES: Record<IncidentType, string[]> = {
  derailment: [
    "Incident Detected — Train derailment at Mathura Junction",
    "Severity Assessed — Level 9/10, Confidence 95%",
    "Safety Protocol — Trains RM-101, RM-202, RM-303 halted",
    "Resources Dispatched — 5 ambulances, 3 rescue teams deployed",
    "Passenger Alerts — Notifications sent to 4 stations",
    "Report Generated — Incident report INC-1001 complete"
  ],
  "signal-failure": [
    "Incident Detected — Signal failure at Mumbai Central",
    "Severity Assessed — Level 7/10, Confidence 92%",
    "Manual Protocol — Manual signaling activated at Mumbai Central",
    "Maintenance Dispatched — 2 signal crews, 4 controllers deployed",
    "Passenger Alerts — Delay notifications sent to 6 platforms",
    "Report Generated — Incident report INC-1002 complete"
  ],
  flood: [
    "Incident Detected — Flash flood on Chennai–Bangalore corridor",
    "Severity Assessed — Level 8/10, Confidence 89%",
    "Corridor Suspended — All trains halted on affected stretch",
    "Rescue Deployed — 3 rescue boats, 4 teams dispatched",
    "Passenger Alerts — Alternative transport arranged",
    "Report Generated — Incident report INC-1003 complete"
  ],
  "security-threat": [
    "Incident Detected — Security threat at Howrah Station",
    "Severity Assessed — Level 10/10, Confidence 97%",
    "Lockdown Initiated — Howrah Station evacuated",
    "Security Deployed — 12 personnel, 3 bomb squad units",
    "Emergency Alerts — Public notifications dispatched",
    "Report Generated — Incident report INC-1004 complete"
  ]
};

export function getFallbackResponse(type: IncidentType) {
  return FALLBACK_RESPONSES[type];
}

export function getTimelineTemplates(type: IncidentType) {
  return TIMELINE_TEMPLATES[type];
}
