import type { Server } from "socket.io";
import type { IncidentType, TrainRealData } from "@railmind/shared";
import { orchestrateTrainIncident } from "../services/orchestrator";
import { saveTimelineEvent } from "../db/queries";

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

    socket.on("dispatch:approved", async (data: { incidentId: string }) => {
      console.log(`[Dispatch] Approved for incident ${data.incidentId}`);
      
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const event = { id: `dispatch-${Date.now()}`, timestamp: time, description: "Operational Actions Dispatched & Approved" };
      
      io.emit("timeline:event", event);
      io.emit("dispatch:success");
      
      if (data.incidentId) {
        try {
          await saveTimelineEvent(data.incidentId, event);
        } catch (e) {
          console.error("DB Error: Failed to save dispatch event", e);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
}
