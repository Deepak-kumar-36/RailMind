import { query, pool } from "./index";
import type { MapIncident, TimelineEvent, IncidentReport, AgentResult, ExplainableDecision } from "@railmind/shared";

// Check if DB is configured
export const isDbConfigured = () => pool !== null;

/* ── Incidents ── */

export async function saveIncident(incident: MapIncident) {
  if (!isDbConfigured()) return;
  await query(
    `INSERT INTO incidents (id, title, type, station, position_lat, position_lng, radius_meters, risk_level, color, triggered_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      incident.id, incident.title, incident.type, incident.station,
      incident.position[0], incident.position[1], incident.radiusMeters,
      incident.riskLevel, incident.color, incident.triggeredAt
    ]
  );
}

export async function getIncident(id: string): Promise<MapIncident | null> {
  if (!isDbConfigured()) return null;
  const res = await query(`SELECT * FROM incidents WHERE id = $1`, [id]);
  if (res.rows.length === 0) return null;
  
  const row = res.rows[0];
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    station: row.station,
    position: [row.position_lat, row.position_lng],
    radiusMeters: row.radius_meters,
    riskLevel: row.risk_level,
    color: row.color,
    triggeredAt: row.triggered_at.toISOString(),
  } as MapIncident;
}

export async function getAllIncidents(): Promise<MapIncident[]> {
  if (!isDbConfigured()) return [];
  const res = await query(`SELECT * FROM incidents ORDER BY triggered_at DESC LIMIT 8`);
  return res.rows.map(row => ({
    id: row.id,
    title: row.title,
    type: row.type,
    station: row.station,
    position: [row.position_lat, row.position_lng],
    radiusMeters: row.radius_meters,
    riskLevel: row.risk_level,
    color: row.color,
    triggeredAt: row.triggered_at.toISOString(),
  })) as MapIncident[];
}

export async function clearAllIncidents() {
  if (!isDbConfigured()) return;
  await query(`DELETE FROM incidents`); // Cascades to related tables
}

/* ── Timeline Events ── */

export async function saveTimelineEvent(incidentId: string, event: TimelineEvent) {
  if (!isDbConfigured()) return;
  await query(
    `INSERT INTO timeline_events (id, incident_id, agent_id, event_description, timestamp)
     VALUES ($1, $2, $3, $4, $5)`,
    [event.id, incidentId, event.agentId || null, event.description, event.timestamp]
  );
}

export async function getTimelineEvents(incidentId: string): Promise<TimelineEvent[]> {
  if (!isDbConfigured()) return [];
  const res = await query(`SELECT * FROM timeline_events WHERE incident_id = $1 ORDER BY timestamp ASC`, [incidentId]);
  return res.rows.map(row => ({
    id: row.id,
    timestamp: row.timestamp.toISOString(),
    description: row.event_description,
    agentId: row.agent_id
  }));
}

/* ── Agent Decisions ── */

export async function saveAgentDecision(incidentId: string, result: AgentResult) {
  if (!isDbConfigured()) return;
  await query(
    `INSERT INTO agent_decisions (id, incident_id, agent_id, status, confidence, summary, data)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [`${incidentId}-${result.agentId}-${Date.now()}`, incidentId, result.agentId, result.status, result.confidence, result.summary, JSON.stringify(result.data)]
  );
}

/* ── Explainable Decisions ── */

export async function saveExplainableDecision(incidentId: string, decision: ExplainableDecision) {
  if (!isDbConfigured()) return;
  await query(
    `INSERT INTO explainable_decisions (id, incident_id, decision, confidence, reason, expected_impact)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [`${incidentId}-decision-${Date.now()}`, incidentId, decision.decision, decision.confidence, decision.reason, decision.expectedImpact]
  );
}

/* ── Reports ── */

export async function saveReport(report: IncidentReport) {
  if (!isDbConfigured()) return;
  await query(
    `INSERT INTO reports (id, incident_id, summary, actions, resources, impact)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [`report-${report.incidentId}`, report.incidentId, report.summary, JSON.stringify(report.actions), JSON.stringify(report.resources), JSON.stringify(report.impact)]
  );
}

export async function getReport(incidentId: string): Promise<IncidentReport | null> {
  if (!isDbConfigured()) return null;
  const res = await query(`SELECT * FROM reports WHERE incident_id = $1 LIMIT 1`, [incidentId]);
  if (res.rows.length === 0) return null;
  
  const row = res.rows[0];
  const timeline = await getTimelineEvents(incidentId);
  
  return {
    incidentId: row.incident_id,
    summary: row.summary,
    actions: row.actions,
    resources: row.resources,
    impact: row.impact,
    timeline
  } as IncidentReport;
}
