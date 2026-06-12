import { Router } from "express";
import { MOCK_INCIDENTS } from "@railmind/shared";
import type { IncidentType, MapIncident } from "@railmind/shared";
import * as db from "../db/queries";


// We will inject the io instance from the main server setup
// This is a simple hack for the hackathon MVP to access io in routes
let ioInstance: any = null;
export const setSocketIoInstance = (io: any) => { ioInstance = io; };

export const incidentsRouter = Router();

// POST /api/incidents - Create a new incident
incidentsRouter.post("/", async (req, res) => {
  const { type } = req.body as { type: IncidentType };
  const mockIncident = MOCK_INCIDENTS[type];

  if (!mockIncident) {
    return res.status(400).json({ error: "Unknown incident type" });
  }

  const incident: MapIncident = {
    ...mockIncident,
    id: `${type}-${Date.now()}`,
    triggeredAt: new Date().toISOString()
  };

  await db.saveIncident(incident);
  
  if (ioInstance) {
    // Also notify connected clients
    ioInstance.emit("incident:created", incident);
  }

  res.status(201).json({ incidentId: incident.id, status: "created", incident });
});

// AI orchestration is now triggered via Socket.IO in socket/index.ts
// POST /api/incidents/:id/analyze was deprecated in favor of Train-First workflow.

// GET /api/incidents/:id - Get incident details
incidentsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const incident = await db.getIncident(id);
  
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  res.json(incident);
});

// GET /api/incidents/:id/timeline - Get timeline
incidentsRouter.get("/:id/timeline", async (req, res) => {
  const { id } = req.params;
  const timeline = await db.getTimelineEvents(id);
  res.json(timeline);
});

// GET /api/incidents/:id/report - Get report
incidentsRouter.get("/:id/report", async (req, res) => {
  const { id } = req.params;
  const report = await db.getReport(id);
  if (!report) {
    return res.status(404).json({ error: "Report not found or not yet generated" });
  }
  res.json(report);
});
