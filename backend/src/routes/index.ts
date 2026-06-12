import { Router } from "express";
import { approvalsRouter } from "./approvals";
import { healthRouter } from "./health";
import { incidentsRouter } from "./incidents";
import { networkRouter } from "./network";
import { trainsRouter } from "./trains";
import { reportsRouter } from "./reports";

export function createApiRouter() {
  const router = Router();

  router.use("/health", healthRouter);
  router.use("/incidents", incidentsRouter);
  router.use("/approvals", approvalsRouter);
  router.use("/network", networkRouter);
  router.use("/trains", trainsRouter);
  router.use("/reports", reportsRouter);

  return router;
}

export { setSocketIoInstance } from "./incidents";
