import PDFDocument from "pdfkit";
import type { IncidentReport, TimelineEvent, MapIncident } from "@railmind/shared";

export function generateIncidentPDF(
  incident: MapIncident,
  report: IncidentReport,
  timeline: TimelineEvent[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const COLORS = {
        primary: "#3b82f6",
        critical: "#ef4444",
        safe: "#22c55e",
        warning: "#f59e0b",
        dark: "#0d141d",
        text: "#1e293b",
        muted: "#64748b",
        bg: "#f8fafc",
        border: "#e2e8f0"
      };

      // ─── HEADER ───
      doc.rect(0, 0, doc.page.width, 90).fill(COLORS.dark);

      doc.font("Helvetica-Bold").fontSize(22).fillColor("#ffffff")
        .text("RAILMIND", 50, 25);
      doc.font("Helvetica").fontSize(9).fillColor("#94a3b8")
        .text("Emergency Intelligence Report", 50, 52);
      doc.font("Helvetica").fontSize(9).fillColor("#94a3b8")
        .text(`Generated: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`, 50, 65);

      // Incident ID on right
      doc.font("Helvetica").fontSize(8).fillColor("#94a3b8")
        .text(`ID: ${incident.id.slice(0, 8)}`, 400, 30, { align: "right" });
      doc.font("Helvetica-Bold").fontSize(12).fillColor(COLORS.critical)
        .text(incident.type.toUpperCase(), 400, 48, { align: "right" });

      doc.moveDown(2);
      let y = 110;

      // ─── INCIDENT OVERVIEW ───
      doc.font("Helvetica-Bold").fontSize(14).fillColor(COLORS.primary)
        .text("Incident Overview", 50, y);
      y += 25;

      doc.rect(50, y, doc.page.width - 100, 1).fill(COLORS.border);
      y += 10;

      const overviewData = [
        ["Title", incident.title],
        ["Type", incident.type.toUpperCase()],
        ["Station", incident.station],
        ["Coordinates", `${incident.position[0].toFixed(4)}, ${incident.position[1].toFixed(4)}`],
        ["Risk Level", incident.riskLevel.toUpperCase()],
        ["Triggered", new Date(incident.triggeredAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })],
        ["Impact Radius", `${(incident.radiusMeters / 1000).toFixed(0)} km`]
      ];

      for (const [label, value] of overviewData) {
        doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.muted)
          .text(label, 60, y, { width: 120 });
        doc.font("Helvetica").fontSize(10).fillColor(COLORS.text)
          .text(value, 180, y, { width: 350 });
        y += 18;
      }

      y += 15;

      // ─── AI RECOMMENDATIONS ───
      doc.font("Helvetica-Bold").fontSize(14).fillColor(COLORS.primary)
        .text("AI Recommendations", 50, y);
      y += 25;

      doc.rect(50, y, doc.page.width - 100, 1).fill(COLORS.border);
      y += 10;

      doc.font("Helvetica").fontSize(10).fillColor(COLORS.text)
        .text(report.summary, 60, y, { width: doc.page.width - 120 });
      y += 25;

      for (let i = 0; i < report.actions.length; i++) {
        if (y > 700) { doc.addPage(); y = 50; }
        doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.primary)
          .text(`${i + 1}.`, 60, y, { width: 20 });
        doc.font("Helvetica").fontSize(10).fillColor(COLORS.text)
          .text(report.actions[i], 80, y, { width: doc.page.width - 140 });
        y += Math.max(18, doc.heightOfString(report.actions[i], { width: doc.page.width - 140 }) + 6);
      }

      y += 15;

      // ─── PREDICTIVE IMPACT ───
      if (y > 650) { doc.addPage(); y = 50; }

      doc.font("Helvetica-Bold").fontSize(14).fillColor(COLORS.primary)
        .text("Predictive Impact Forecast", 50, y);
      y += 25;

      doc.rect(50, y, doc.page.width - 100, 1).fill(COLORS.border);
      y += 10;

      const impactKeys = ["15min", "30min", "60min"] as const;
      for (const key of impactKeys) {
        if (report.impact[key]) {
          doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.warning)
            .text(`T+${key}:`, 60, y, { width: 60 });
          doc.font("Helvetica").fontSize(10).fillColor(COLORS.text)
            .text(report.impact[key], 120, y, { width: doc.page.width - 180 });
          y += Math.max(18, doc.heightOfString(report.impact[key], { width: doc.page.width - 180 }) + 6);
        }
      }

      y += 15;

      // ─── TIMELINE ───
      if (timeline.length > 0) {
        if (y > 600) { doc.addPage(); y = 50; }

        doc.font("Helvetica-Bold").fontSize(14).fillColor(COLORS.primary)
          .text("Event Timeline", 50, y);
        y += 25;

        doc.rect(50, y, doc.page.width - 100, 1).fill(COLORS.border);
        y += 10;

        for (const event of timeline) {
          if (y > 720) { doc.addPage(); y = 50; }

          // Timeline dot
          doc.circle(67, y + 5, 3).fill(COLORS.primary);
          doc.rect(67, y + 8, 1, 14).fill(COLORS.border);

          doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.primary)
            .text(event.timestamp, 80, y);
          doc.font("Helvetica").fontSize(9).fillColor(COLORS.text)
            .text(event.description, 80, y + 12, { width: doc.page.width - 140 });
          y += 30;
        }
      }

      // ─── FOOTER ───
      const footerY = doc.page.height - 40;
      doc.rect(0, footerY - 10, doc.page.width, 50).fill(COLORS.dark);
      doc.font("Helvetica").fontSize(8).fillColor("#94a3b8")
        .text(
          "RAILMIND Emergency Intelligence • Confidential • AI-Generated Report • Indian Railways",
          0, footerY, { align: "center", width: doc.page.width }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
