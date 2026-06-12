import { Router } from "express";
import type { NetworkStatus } from "@railmind/shared";

export const networkRouter = Router();

// GET /api/network/status
networkRouter.get("/status", (req, res) => {
  // Normally this would aggregate from the DB. Returning a default healthy status.
  const status: NetworkStatus = {
    networkHealth: 94,
    activeIncidents: 0,
    trainsAffected: 0,
    trainsHalted: 0,
    trainsRerouted: 0,
    resourcesDeployed: 0,
    passengersImpacted: 0,
    recoveryEta: "—"
  };

  res.json(status);
});
