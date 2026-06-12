"use client";

import { useTrainIntel } from "@/lib/IncidentContext";
import { INCIDENT_SCENARIOS } from "@railmind/shared";

export function TrainCommandPanel() {
  const { activeTrain, activeIncidentType, triggerTrainIncident, isProcessing } = useTrainIntel();

  if (!activeTrain) {
    return (
      <section className="flex flex-col border border-outline-variant bg-surface-container-lowest p-lg">
        <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant">
          Command Center
        </h2>
        <div className="flex flex-1 flex-col items-center justify-center text-center opacity-60">
          <span className="material-symbols-outlined mb-sm text-[48px] text-on-surface-variant">
            satellite_alt
          </span>
          <p className="text-body-lg text-on-surface">Awaiting Target</p>
          <p className="mt-xs text-body-md text-on-surface-variant">
            Enter a train number in the header to lock on and begin operational tracking.
          </p>
        </div>
      </section>
    );
  }

  const currentSt = activeTrain.route.find(r => r.status === 'current') || activeTrain.route[0];
  const nextSt = activeTrain.route.find(r => r.status === 'upcoming') || activeTrain.route[activeTrain.route.length - 1];

  return (
    <section className="flex flex-col border border-outline-variant bg-surface-container-lowest">
      {/* SECTION 1: TRAIN INTELLIGENCE PANEL */}
      <div className="border-b border-outline-variant p-lg">
        <p className="text-label-sm uppercase tracking-widest text-on-surface-variant">
          Live Telemetry
        </p>
        <div className="mt-sm mb-md">
          <h2 className="text-headline-md font-semibold text-on-surface">
            {activeTrain.trainNumber}
          </h2>
          <p className="text-body-md text-on-surface-variant">
            {activeTrain.trainName}
          </p>
        </div>
        
        <div className="space-y-sm text-body-md text-on-surface">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Status</span>
            <span className={`uppercase tracking-wider ${activeTrain.runningStatus === 'on-time' ? 'text-status-safe' : 'text-status-critical'}`}>
              {activeTrain.runningStatus}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Current Loc</span>
            <span>{currentSt.name} ({currentSt.code})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Next Station</span>
            <span>{nextSt.name} ({nextSt.code})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Destination</span>
            <span>{activeTrain.route[activeTrain.route.length - 1].name}</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: INCIDENT COMMAND PANEL */}
      <div className="flex flex-1 flex-col overflow-y-auto p-lg">
        <p className="mb-md text-label-sm uppercase tracking-widest text-on-surface-variant">
          Emergency Command
        </p>
        
        {activeIncidentType ? (
          <div className="flex flex-col items-center justify-center rounded border border-status-critical bg-status-critical/10 p-md text-center">
            <span className="material-symbols-outlined mb-xs text-3xl text-status-critical animate-pulse">
              warning
            </span>
            <p className="text-label-md uppercase tracking-widest text-status-critical">
              Incident Declared
            </p>
            <p className="mt-xs text-body-md text-on-surface">
              {INCIDENT_SCENARIOS.find(s => s.type === activeIncidentType)?.label}
            </p>
            {isProcessing && (
              <p className="mt-sm text-xs text-primary animate-pulse">Analyzing Impact...</p>
            )}
          </div>
        ) : (
          <div className="space-y-xs">
            {INCIDENT_SCENARIOS.map((scenario) => (
              <button
                key={scenario.type}
                onClick={() => triggerTrainIncident(scenario.type)}
                className="w-full flex items-center gap-sm rounded border border-outline-variant bg-surface-container p-sm transition-colors hover:border-status-critical hover:text-status-critical text-left"
              >
                <span className="material-symbols-outlined text-lg">{scenario.icon}</span>
                <span className="text-body-md font-medium">{scenario.label}</span>
              </button>
            ))}
            <button 
              disabled 
              className="w-full mt-md rounded bg-primary/50 py-sm text-on-primary text-label-md font-semibold opacity-50 cursor-not-allowed"
            >
              Analyze Impact
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
