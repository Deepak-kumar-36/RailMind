"use client";

import { useTrainIntel } from "@/lib/IncidentContext";
import { INCIDENT_SCENARIOS } from "@railmind/shared";

export function TrainCommandPanel() {
  const { activeTrain, activeIncidentType, triggerTrainIncident, isProcessing } = useTrainIntel();

  return (
    <div className="flex h-full flex-col overflow-hidden glass-panel-heavy rounded-none border-0 border-r">
      {/* Panel Header */}
      <div className="shrink-0 border-b border-outline-variant/30 bg-surface-container-lowest/40 px-md py-sm">
        <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant">
          Command Center
        </h2>
      </div>

      {/* Panel Body — Scrollable */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {!activeTrain ? (
          /* Awaiting state */
          <div className="flex h-full flex-col items-center justify-center px-lg text-center">
            <div className="mb-md rounded-full glass-panel inner-glow p-lg">
              <span className="material-symbols-outlined text-[36px] text-on-surface-variant opacity-50">
                satellite_alt
              </span>
            </div>
            <p className="text-body-md font-medium text-on-surface">
              Awaiting Target
            </p>
            <p className="mt-xs text-[13px] leading-relaxed text-on-surface-variant">
              Enter a train number in the header to begin operational tracking.
            </p>
          </div>
        ) : (
          <>
            {/* ── TELEMETRY SECTION ── */}
            <div className="border-b border-outline-variant/30 px-md py-md">
              <div className="mb-sm flex items-baseline justify-between">
                <div>
                  <h3 className="text-[22px] font-semibold tabular-nums tracking-tight text-on-surface">
                    {activeTrain.trainNumber}
                  </h3>
                  <p className="mt-[2px] text-[13px] text-on-surface-variant">
                    {activeTrain.trainName}
                  </p>
                </div>
                <span
                  className={`rounded-full px-sm py-[3px] text-[11px] font-semibold uppercase tracking-wider ${
                    activeTrain.runningStatus === "on-time"
                      ? "bg-status-safe/15 text-status-safe"
                      : "bg-status-critical/15 text-status-critical"
                  }`}
                >
                  {activeTrain.runningStatus}
                </span>
              </div>

              <div className="space-y-[6px]">
                {(() => {
                  const currentSt = activeTrain.route.find(r => r.status === "current") || activeTrain.route[0];
                  const nextSt = activeTrain.route.find(r => r.status === "upcoming") || activeTrain.route[activeTrain.route.length - 1];
                  const dest = activeTrain.route[activeTrain.route.length - 1];
                  return (
                    <>
                      <Row label="Location" value={`${currentSt.name} (${currentSt.code})`} />
                      <Row label="Next Stn" value={`${nextSt.name} (${nextSt.code})`} />
                      <Row label="Destination" value={dest.name} />
                    </>
                  );
                })()}
              </div>
            </div>

            {/* ── ROUTE PROGRESS ── */}
            <div className="border-b border-outline-variant/30 px-md py-md">
              <p className="mb-sm text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">
                Route Progress
              </p>
              <div className="space-y-[2px]">
                {activeTrain.route.map((st, i) => (
                  <div key={i} className="flex items-center gap-sm">
                    <div className="flex w-[14px] flex-col items-center">
                      <div
                        className={`h-[8px] w-[8px] rounded-full border-[2px] ${
                          st.status === "passed"
                            ? "border-status-safe bg-status-safe"
                            : st.status === "current"
                            ? "border-primary bg-primary animate-pulse"
                            : "border-outline-variant bg-transparent"
                        }`}
                      />
                      {i < activeTrain.route.length - 1 && (
                        <div className="h-[14px] w-[1px] bg-outline-variant" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 items-center justify-between">
                      <span
                        className={`truncate text-[12px] ${
                          st.status === "current"
                            ? "font-semibold text-primary"
                            : st.status === "passed"
                            ? "text-on-surface-variant"
                            : "text-on-surface-variant opacity-60"
                        }`}
                      >
                        {st.name}
                      </span>
                      <span className="ml-sm shrink-0 font-mono text-[10px] text-on-surface-variant opacity-60">
                        {st.scheduledArrival}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── WEATHER INTELLIGENCE ── */}
            <WeatherSection />

            {/* ── EMERGENCY COMMAND ── */}
            <div className="px-md py-md">
              <p className="mb-sm text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">
                Emergency Command
              </p>

              {activeIncidentType ? (
                <div className="rounded border border-status-critical/40 bg-status-critical/10 glass-panel px-md py-sm shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px] text-status-critical animate-pulse">
                      warning
                    </span>
                    <span className="text-[12px] font-bold uppercase tracking-widest text-status-critical">
                      Incident Active
                    </span>
                  </div>
                  <p className="mt-xs text-[13px] text-on-surface">
                    {INCIDENT_SCENARIOS.find(s => s.type === activeIncidentType)?.label}
                  </p>
                  {isProcessing && (
                    <p className="mt-xs text-[11px] text-primary animate-pulse">
                      Analyzing impact…
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-[4px]">
                  {INCIDENT_SCENARIOS.map((scenario) => (
                    <button
                      key={scenario.type}
                      onClick={() => triggerTrainIncident(scenario.type)}
                      className="group flex w-full items-center gap-sm rounded px-sm py-[6px] text-left transition-all duration-300 hover:bg-surface-container/50 hover:pl-md hover:bg-surface-container-highest/50 border border-transparent hover:border-outline-variant/30"
                    >
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant transition-colors group-hover:text-status-critical">
                        {scenario.icon}
                      </span>
                      <span className="text-[13px] text-on-surface transition-colors group-hover:text-on-surface">
                        {scenario.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Helper Component ── */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-md">
      <span className="shrink-0 text-[12px] text-on-surface-variant">{label}</span>
      <span className="truncate text-[13px] font-medium text-on-surface">{value}</span>
    </div>
  );
}

/* ── Weather Intelligence Section ── */
function WeatherSection() {
  const { weatherReport } = useTrainIntel();

  if (!weatherReport) return null;

  const riskColor = {
    safe: "text-status-safe",
    caution: "text-status-warning",
    danger: "text-status-critical"
  };

  const riskBg = {
    safe: "bg-status-safe/10 border-status-safe/30",
    caution: "bg-status-warning/10 border-status-warning/30",
    danger: "bg-status-critical/10 border-status-critical/30"
  };

  return (
    <div className="border-b border-outline-variant/30 px-md py-md">
      <div className="mb-sm flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">
          Weather Intel
        </p>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${riskColor[weatherReport.overallRisk]}`}>
          {weatherReport.overallRisk}
        </span>
      </div>

      <div className="space-y-[4px]">
        {weatherReport.stationWeather.map((sw, i) => (
          <div
            key={i}
            className={`rounded px-sm py-[5px] border ${
              sw.riskLevel === "safe"
                ? "glass-panel inner-glow border-transparent"
                : riskBg[sw.riskLevel]
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-on-surface">{sw.stationName}</span>
              <div className="flex items-center gap-xs">
                <span className="font-mono text-[11px] text-on-surface-variant">{sw.temp}°C</span>
                <span className={`text-[10px] font-semibold uppercase ${riskColor[sw.riskLevel]}`}>
                  {sw.condition}
                </span>
              </div>
            </div>
            {sw.alerts.length > 0 && (
              <div className="mt-[3px] space-y-[1px]">
                {sw.alerts.map((alert, j) => (
                  <p key={j} className={`text-[10px] leading-snug ${riskColor[sw.riskLevel]}`}>
                    {alert}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
