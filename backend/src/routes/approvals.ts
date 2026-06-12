import { Router } from "express";

export const approvalsRouter = Router();

// POST /api/approvals - Operator Approval Layer
approvalsRouter.post("/", async (req, res) => {
  const { incidentId, action, approved } = req.body;

  if (!incidentId || !action) {
    return res.status(400).json({ error: "incidentId and action are required" });
  }

  console.log(`[Approval] Incident: ${incidentId} | Action: ${action} | Approved: ${approved}`);

  // In a real system, we'd save this to an audit_logs table and trigger the execution layer
  res.json({ status: "success", incidentId, action, approved });
});
