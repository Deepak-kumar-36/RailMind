import type { Server } from "socket.io";
import type { IncidentType, TrainRealData } from "@railmind/shared";
import { orchestrateTrainIncident } from "../services/orchestrator";

export function registerSocketHandlers(io: Server) {
  io.on("connection", async (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);
    socket.emit("connected", { socketId: socket.id });
    
    socket.on("train_incident:trigger", async (data: { type: IncidentType, train: TrainRealData }) => {
      try {
        console.log(`[Incident] Triggered: ${data.type} on train ${data.train.trainNumber}`);
        await orchestrateTrainIncident(io, data.type, data.train);
        console.log(`[Orchestrator] Completed for train ${data.train.trainNumber}`);
      } catch (error) {
        console.error(`[Orchestrator] Error:`, error);
        socket.emit("incident:error", { message: "Orchestration failed" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
}
