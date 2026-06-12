"use client";

import { useTrainIntel } from "@/lib/IncidentContext";

export function PredictiveMetrics() {
  const { network, passengerMetrics, predictiveForecast } = useTrainIntel();

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-outline-variant/30">
      
      {/* SECTION 5: AFFECTED NETWORK PANEL */}
      <div className="bg-surface-container-lowest p-lg">
        <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant border-b border-outline-variant pb-xs mb-md">
          Affected Network
        </h2>
        <div className="grid grid-cols-2 gap-md">
          <div>
            <p className="text-label-sm text-on-surface-variant">Affected Trains</p>
            <p className="text-headline-sm font-mono text-status-warning">
              {passengerMetrics?.affectedTrains || network.trainsAffected}
            </p>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant">Affected Stations</p>
            <p className="text-headline-sm font-mono text-status-warning">
              {passengerMetrics?.affectedStations || 0}
            </p>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant">Passengers Impacted</p>
            <p className="text-headline-sm font-mono text-status-critical">
              {passengerMetrics?.passengersImpacted.toLocaleString() || network.passengersImpacted.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant">Recovery ETA</p>
            <p className="text-headline-sm font-mono text-primary">
              {passengerMetrics?.recoveryEta || network.recoveryEta}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 9: PREDICTIVE IMPACT FORECAST */}
      <div className="bg-surface-container-lowest p-lg lg:col-span-2">
        <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant border-b border-outline-variant pb-xs mb-md">
          Predictive Impact Forecast
        </h2>
        
        {!predictiveForecast ? (
          <div className="flex h-[100px] items-center justify-center text-on-surface-variant opacity-50">
            Awaiting impact analysis to generate forecast...
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-md">
            {predictiveForecast.map((forecast, i) => (
              <div key={i} className="flex flex-col bg-surface-container p-md rounded border-t-2 border-primary">
                <p className="text-label-md font-bold text-on-surface uppercase mb-xs">
                  {forecast.timeframe}
                </p>
                <div className="space-y-xs text-body-sm mt-sm">
                  <p className="flex justify-between">
                    <span className="text-on-surface-variant">Impact</span>
                    <span className="text-status-warning text-right w-2/3 truncate" title={forecast.networkImpact}>{forecast.networkImpact}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-on-surface-variant">Trains</span>
                    <span className="text-on-surface">{forecast.affectedTrains}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-on-surface-variant">Delay</span>
                    <span className="text-on-surface">{forecast.expectedDelays}</span>
                  </p>
                  <p className="flex justify-between border-t border-outline-variant pt-xs mt-xs">
                    <span className="text-on-surface-variant">Outlook</span>
                    <span className="text-primary text-right w-2/3 truncate" title={forecast.recoveryForecast}>{forecast.recoveryForecast}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
