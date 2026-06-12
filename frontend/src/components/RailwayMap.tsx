"use client";

import { useEffect, useMemo, useState } from "react";
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import { useTrainIntel } from "@/lib/IncidentContext";

type Station = {
  id: string;
  name: string;
  position: [number, number];
};

import { STATIONS, MOCK_TRAIN_LIST } from "@railmind/shared";

type Train = {
  id: string;
  name: string;
  route: [number, number][];
  speed: number;
  progress: number;
  status: string;
};

const INDIA_CENTER: LatLngExpression = [22.9734, 78.6569];

// Convert STATIONS record to array for rendering
const STATION_ARRAY = Object.entries(STATIONS).map(([id, st]) => ({
  id,
  name: st.name,
  position: [st.lat, st.lng] as [number, number]
}));

// Convert MOCK_TRAIN_LIST to animated Train objects
const INITIAL_TRAINS: Train[] = MOCK_TRAIN_LIST.map((t, i) => ({
  id: t.trainNumber,
  name: t.trainName,
  route: t.route.map(st => [st.lat, st.lng] as [number, number]),
  speed: 0.02 + (Math.random() * 0.03), // random speed
  progress: Math.random(), // random starting point
  status: `${t.route[0].name} → ${t.route[t.route.length - 1].name}`
}));

const stationIcon = L.divIcon({
  className: "station-marker",
  html: "<span></span>",
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const trainIcon = L.divIcon({
  className: "train-marker",
  html: "<span></span>",
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

export function RailwayMap() {
  const [trains, setTrains] = useState(INITIAL_TRAINS);
  const { activeTrain, impactAnalysis } = useTrainIntel();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTrains((current) =>
        current.map((train) => ({
          ...train,
          progress: (train.progress + train.speed) % 1
        }))
      );
    }, 2000);

    return () => window.clearInterval(interval);
  }, []);

  const routeLines = useMemo(() => INITIAL_TRAINS.map((train) => train.route), []);

  return (
    <div className="h-full w-full overflow-hidden rounded border border-outline-variant">
      <MapContainer
        center={INDIA_CENTER}
        zoom={5}
        minZoom={4}
        maxZoom={8}
        scrollWheelZoom
        className="h-full w-full z-0"
      >
      <TileLayer
        attribution="&copy; OpenStreetMap &copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* Track routes */}
      {routeLines.map((route, index) => (
        <Polyline
          key={`route-${index}`}
          positions={route}
          pathOptions={{
            color: "#434655",
            weight: 2,
            opacity: 0.6,
            dashArray: "8 4"
          }}
        />
      ))}

      {/* Default Stations */}
      {STATION_ARRAY.map((station) => (
        <Marker key={station.id} position={station.position} icon={stationIcon}>
          <Popup>
            <strong>{station.name}</strong>
            <br />
            <span style={{ opacity: 0.7 }}>Command Station</span>
          </Popup>
        </Marker>
      ))}

      {/* Affected Corridor (AI Output) */}
      {impactAnalysis?.affectedCorridorCoordinates && (
        <Polyline
          positions={impactAnalysis.affectedCorridorCoordinates}
          pathOptions={{
            color: "#f59e0b",
            weight: 6,
            opacity: 0.9,
            dashArray: "12 12"
          }}
        />
      )}

      {/* Incident Impact Radius (AI Output) */}
      {impactAnalysis?.incidentCoordinates && (
        <Circle
          center={impactAnalysis.incidentCoordinates}
          radius={parseInt(impactAnalysis.impactRadius) * 1000 || 15000}
          pathOptions={{
            color: "#ef4444",
            fillColor: "#ef4444",
            fillOpacity: 0.15,
            opacity: 0.8,
            weight: 2
          }}
        >
          <Popup>
            <strong>Critical Impact Zone</strong>
            <br />
            Radius: {impactAnalysis.impactRadius}
          </Popup>
        </Circle>
      )}

      {/* Active Train Highlights */}
      {activeTrain && (
        <>
          <Polyline
            positions={activeTrain.route.map(s => [s.lat, s.lng])}
            pathOptions={{ color: "#3b82f6", weight: 4, opacity: 0.9 }}
          />
          {activeTrain.route.map((st, i) => (
            <Marker key={`active-st-${i}`} position={[st.lat, st.lng]} icon={stationIcon}>
              <Popup>
                <strong>{st.name} ({st.code})</strong>
                <br />
                Status: {st.status}
                <br />
                ETA: {st.scheduledArrival}
              </Popup>
            </Marker>
          ))}
          <Marker position={activeTrain.currentPosition} icon={trainIcon}>
            <Popup>
              <strong>{activeTrain.trainNumber} - {activeTrain.trainName}</strong>
              <br />
              Status: {activeTrain.runningStatus}
            </Popup>
          </Marker>
        </>
      )}

      {/* Background Trains */}
      {trains.map((train) => {
        const intel = impactAnalysis?.whyTheseTrains?.find(t => t.trainNumber === train.id);
        return (
          <Marker key={train.id} position={getTrainPosition(train)} icon={trainIcon}>
            <Popup>
              <strong>{train.id}</strong>
              <br />
              {train.name}
              <br />
              <span style={{ opacity: 0.7 }}>{train.status}</span>
              {intel && (
                <div className="mt-2 border-t border-outline-variant pt-2 text-sm">
                  <strong className="text-status-critical uppercase tracking-wider text-[10px]">AI Flagged: Why This Train?</strong>
                  <br/>Distance: {intel.distanceFromIncident}
                  <br/>Enters Corridor: {intel.timeToEnterCorridor}
                  <br/>Risk: <span className="text-status-critical">{intel.riskLevel}</span>
                </div>
              )}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
    </div>
  );
}

function getTrainPosition(train: Train): [number, number] {
  const segmentCount = train.route.length - 1;
  const scaledProgress = train.progress * segmentCount;
  const segmentIndex = Math.min(Math.floor(scaledProgress), segmentCount - 1);
  const segmentProgress = scaledProgress - segmentIndex;
  const start = train.route[segmentIndex];
  const end = train.route[segmentIndex + 1];

  return [
    start[0] + (end[0] - start[0]) * segmentProgress,
    start[1] + (end[1] - start[1]) * segmentProgress
  ];
}
