import { Router } from "express";
import { getReport, getIncident, getTimelineEvents } from "../db/queries";
import { generateIncidentPDF } from "../services/reportGenerator";

export const reportsRouter = Router();

reportsRouter.get("/:incidentId/pdf", async (req, res) => {
  try {
    const { incidentId } = req.params;

    const incident = await getIncident(incidentId);
    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }

    const report = await getReport(incidentId);
    if (!report) {
      return res.status(404).json({ error: "Report not generated yet" });
    }

    const timeline = await getTimelineEvents(incidentId);

    const pdfBuffer = await generateIncidentPDF(incident, report, timeline);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=railmind-report-${incidentId.slice(0, 8)}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("[Reports] PDF generation failed:", error);
    res.status(500).json({ error: "Failed to generate PDF report" });
  }
});
