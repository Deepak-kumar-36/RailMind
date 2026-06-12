"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type {
  IncidentType,
  NetworkStatus,
  TrainRealData,
  ImpactAnalysis,
  DriverNotification,
  OperationalRecs,
  PassengerMetrics,
  TimelineEvent,
  PredictiveForecast,
  Explainability,
  RouteWeatherReport,
  TranslatedNotifications
} from "@railmind/shared";
import { SOCKET_URL } from "./socket";

type TrainIntelState = {
  connected: boolean;
  network: NetworkStatus;
  
  // Train Flow State
  activeTrain: TrainRealData | null;
  isFetchingTrain: boolean;
  
  // Incident & AI Output State
  activeIncidentId: string | null;
  activeIncidentType: IncidentType | null;
  isProcessing: boolean;
  intelStatusMsg: string;
  impactAnalysis: ImpactAnalysis | null;
  driverNotifications: DriverNotification[] | null;
  operationalRecs: OperationalRecs | null;
  passengerMetrics: PassengerMetrics | null;
  predictiveForecast: PredictiveForecast[] | null;
  explainability: Explainability[] | null;
  timelineEvents: TimelineEvent[];
  weatherReport: RouteWeatherReport | null;
  translatedNotifications: TranslatedNotifications | null;
};

type TrainIntelContextValue = TrainIntelState & {
  searchTrain: (trainNumber: string) => Promise<void>;
  triggerTrainIncident: (type: IncidentType) => void;
  clearAll: () => void;
  approveAndDispatch: () => void;
};

const DEFAULT_NETWORK: NetworkStatus = {
  networkHealth: 94,
  activeIncidents: 0,
  trainsAffected: 0,
  trainsHalted: 0,
  trainsRerouted: 0,
  resourcesDeployed: 0,
  passengersImpacted: 0,
  recoveryEta: "—"
};

const TrainIntelContext = createContext<TrainIntelContextValue | null>(null);

export function useTrainIntel() {
  const ctx = useContext(TrainIntelContext);
  if (!ctx) throw new Error("useTrainIntel must be used within TrainIntelProvider");
  return ctx;
}

export function IncidentProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [network, setNetwork] = useState<NetworkStatus>(DEFAULT_NETWORK);

  const [activeTrain, setActiveTrain] = useState<TrainRealData | null>(null);
  const [isFetchingTrain, setIsFetchingTrain] = useState(false);

  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const [activeIncidentType, setActiveIncidentType] = useState<IncidentType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [intelStatusMsg, setIntelStatusMsg] = useState("");

  const [impactAnalysis, setImpactAnalysis] = useState<ImpactAnalysis | null>(null);
  const [driverNotifications, setDriverNotifications] = useState<DriverNotification[] | null>(null);
  const [operationalRecs, setOperationalRecs] = useState<OperationalRecs | null>(null);
  const [passengerMetrics, setPassengerMetrics] = useState<PassengerMetrics | null>(null);
  const [predictiveForecast, setPredictiveForecast] = useState<PredictiveForecast[] | null>(null);
  const [explainability, setExplainability] = useState<Explainability[] | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [weatherReport, setWeatherReport] = useState<RouteWeatherReport | null>(null);
  const [translatedNotifications, setTranslatedNotifications] = useState<TranslatedNotifications | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("network:status", (status: NetworkStatus) => setNetwork(status));

    socket.on("timeline:event", (event: TimelineEvent) => {
      setTimelineEvents(prev => [event, ...prev]);
    });

    socket.on("train_intel:start", (data: { incidentId: string }) => setActiveIncidentId(data.incidentId));
    socket.on("train_intel:status", (msg: string) => setIntelStatusMsg(msg));
    socket.on("train_intel:impact", (data: ImpactAnalysis) => setImpactAnalysis(data));
    socket.on("train_intel:drivers", (data: DriverNotification[]) => setDriverNotifications(data));
    socket.on("train_intel:ops", (data: OperationalRecs) => setOperationalRecs(data));
    
    socket.on("dispatch:success", () => {
      setDriverNotifications(prev => prev ? prev.map(d => ({ ...d, status: "Acknowledged" })) : null);
    });
    socket.on("train_intel:passengers", (data: PassengerMetrics) => setPassengerMetrics(data));
    socket.on("train_intel:forecast", (data: PredictiveForecast[]) => setPredictiveForecast(data));
    socket.on("train_intel:explain", (data: Explainability[]) => setExplainability(data));
    socket.on("train_intel:weather", (data: RouteWeatherReport) => setWeatherReport(data));
    socket.on("train_intel:translations", (data: TranslatedNotifications) => setTranslatedNotifications(data));
    
    socket.on("train_intel:completed", () => {
      setIsProcessing(false);
      setIntelStatusMsg("Analysis complete.");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const clearIntel = useCallback(() => {
    setActiveIncidentType(null);
    setIsProcessing(false);
    setIntelStatusMsg("");
    setImpactAnalysis(null);
    setDriverNotifications(null);
    setOperationalRecs(null);
    setPassengerMetrics(null);
    setPredictiveForecast(null);
    setExplainability(null);
    setTimelineEvents([]);
    setWeatherReport(null);
    setTranslatedNotifications(null);
  }, []);

  const searchTrain = useCallback(async (trainNumber: string) => {
    if (!trainNumber.trim()) return;
    setIsFetchingTrain(true);
    clearIntel();
    try {
      const res = await fetch(`${SOCKET_URL}/api/trains/${trainNumber}`);
      if (res.ok) {
        const data = await res.json();
        setActiveTrain(data);
      } else {
        console.error("Backend returned error:", res.status);
      }
    } catch (e) {
      console.error("Failed to fetch train", e);
    } finally {
      setIsFetchingTrain(false);
    }
  }, [clearIntel]);

  const triggerTrainIncident = useCallback((type: IncidentType) => {
    if (!activeTrain) return;
    clearIntel();
    setActiveIncidentType(type);
    setIsProcessing(true);
    setIntelStatusMsg("Initiating Real Railway Intelligence analysis...");
    
    // Optimistically lower network health
    setNetwork(prev => ({ ...prev, networkHealth: Math.max(0, prev.networkHealth - 15) }));

    socketRef.current?.emit("train_incident:trigger", { type, train: activeTrain });
  }, [activeTrain, clearIntel]);

  const clearAll = useCallback(() => {
    setActiveTrain(null);
    clearIntel();
    setNetwork(DEFAULT_NETWORK);
  }, [clearIntel]);

  const approveAndDispatch = useCallback(() => {
    if (!activeIncidentId) return;
    socketRef.current?.emit("dispatch:approved", { incidentId: activeIncidentId });
  }, [activeIncidentId]);

  return (
    <TrainIntelContext.Provider
      value={{
        connected,
        network,
        activeTrain,
        isFetchingTrain,
        activeIncidentId,
        activeIncidentType,
        isProcessing,
        intelStatusMsg,
        impactAnalysis,
        driverNotifications,
        operationalRecs,
        passengerMetrics,
        predictiveForecast,
        explainability,
        timelineEvents,
        weatherReport,
        translatedNotifications,
        searchTrain,
        triggerTrainIncident,
        clearAll,
        approveAndDispatch
      }}
    >
      {children}
    </TrainIntelContext.Provider>
  );
}
