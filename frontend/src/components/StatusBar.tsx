"use client";

import { useTrainIntel } from "@/lib/IncidentContext";

export function StatusBar() {
  const { network, passengerMetrics, predictiveForecast } = useTrainIntel();

  return (
    <footer className="shrink-0 border-t border-outline-variant bg-surface-container-low">
      <div className="flex items-stretch divide-x divide-outline-variant">
        {/* Network Stats */}
        <Stat label="Network Health" value={`${network.networkHealth}/100`} color="text-primary" />
        <Stat
          label="Affected Trains"
          value={String(passengerMetrics?.affectedTrains ?? network.trainsAffected)}
          color={
            (passengerMetrics?.affectedTrains ?? network.trainsAffected) > 0
              ? "text-status-warning"
              : "text-on-surface"
          }
        />
        <Stat
          label="Affected Stations"
          value={String(passengerMetrics?.affectedStations ?? 0)}
          color={
            (passengerMetrics?.affectedStations ?? 0) > 0
              ? "text-status-warning"
              : "text-on-surface"
          }
        />
        <Stat
          label="Passengers Impacted"
          value={
            (passengerMetrics?.passengersImpacted ?? network.passengersImpacted).toLocaleString()
          }
          color={
            (passengerMetrics?.passengersImpacted ?? network.passengersImpacted) > 0
              ? "text-status-critical"
              : "text-on-surface"
          }
        />
        <Stat
          label="Recovery ETA"
          value={passengerMetrics?.recoveryEta ?? network.recoveryEta}
          color="text-primary"
        />

        {/* Predictive mini-readouts (if available) */}
        {predictiveForecast && predictiveForecast.length > 0 && (
          <>
            {predictiveForecast.slice(0, 3).map((fc, i) => (
              <Stat
                key={i}
                label={fc.timeframe}
                value={`${fc.affectedTrains} trains`}
                sublabel={fc.expectedDelays}
                color="text-status-warning"
              />
            ))}
          </>
        )}
      </div>
    </footer>
  );
}

function Stat({
  label,
  value,
  sublabel,
  color = "text-on-surface",
}: {
  label: string;
  value: string;
  sublabel?: string;
  color?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-sm py-[6px]">
      <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
        {label}
      </p>
      <p className={`mt-[1px] font-mono text-[14px] font-semibold tabular-nums ${color}`}>
        {value}
      </p>
      {sublabel && (
        <p className="text-[9px] text-on-surface-variant opacity-70">{sublabel}</p>
      )}
    </div>
  );
}
