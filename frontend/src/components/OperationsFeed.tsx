"use client";

import { useTrainIntel } from "@/lib/IncidentContext";

export function OperationsFeed() {
  const { 
    activeIncidentType, 
    intelStatusMsg, 
    isProcessing, 
    operationalRecs, 
    driverNotifications,
    explainability,
    timelineEvents
  } = useTrainIntel();

  if (!activeIncidentType) {
    return (
      <section className="flex flex-col border border-outline-variant bg-surface-container-lowest p-lg">
        <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant">
          Operations Feed
        </h2>
        <div className="flex flex-1 flex-col items-center justify-center text-center opacity-40">
          <span className="material-symbols-outlined mb-sm text-[48px] text-on-surface-variant">
            analytics
          </span>
          <p className="text-body-md text-on-surface-variant">
            Waiting for emergency declaration to generate AI operations feed.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col border border-outline-variant bg-surface-container-lowest">
      <div className="border-b border-outline-variant p-md bg-surface-container">
        <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-xs">
          <span className="material-symbols-outlined text-base">sensors</span>
          Live Operations Feed
        </h2>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto p-lg space-y-xl">
        
        {/* Status Message */}
        {intelStatusMsg && (
          <p className="text-mono-data text-primary text-xs uppercase tracking-widest">
            {isProcessing && <span className="mr-2 inline-block h-2 w-2 animate-ping rounded-full bg-primary" />}
            {intelStatusMsg}
          </p>
        )}

        {/* SECTION 4: REAL-TIME DECISION ENGINE */}
        {operationalRecs && (
          <div className="animate-fade-in space-y-sm">
            <h3 className="text-label-md uppercase tracking-widest text-on-surface-variant border-b border-outline-variant pb-xs">
              Recommended Actions
            </h3>
            <div className="flex justify-between items-center bg-surface-container p-sm rounded">
              <span className="text-body-sm text-on-surface-variant">Priority:</span>
              <span className="text-label-md uppercase tracking-wider text-status-critical font-bold">{operationalRecs.priority}</span>
            </div>
            <ul className="space-y-xs">
              {operationalRecs.actions.map((act, i) => (
                <li key={i} className="flex gap-sm text-body-md text-on-surface items-start">
                  <span className="material-symbols-outlined text-primary text-base mt-[2px]">check_circle</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-sm mt-sm">
              <div className="bg-surface-container p-sm rounded">
                <p className="text-label-sm text-on-surface-variant">Confidence</p>
                <p className="text-headline-sm font-mono text-primary">{operationalRecs.confidence}%</p>
              </div>
              <div className="bg-surface-container p-sm rounded">
                <p className="text-label-sm text-on-surface-variant">Expected Outcome</p>
                <p className="text-body-sm text-on-surface mt-xs leading-tight">{operationalRecs.expectedOutcome}</p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: DRIVER NOTIFICATION CENTER */}
        {driverNotifications && (
          <div className="animate-fade-in space-y-sm">
            <h3 className="text-label-md uppercase tracking-widest text-on-surface-variant border-b border-outline-variant pb-xs">
              Driver Notifications
            </h3>
            <div className="space-y-xs">
              {driverNotifications.map((n, i) => (
                <div key={i} className="flex items-center justify-between bg-surface-container p-sm rounded">
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-base text-on-surface-variant">train</span>
                    <span className="text-body-md font-medium text-on-surface">{n.trainNumber}</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className={`text-label-sm uppercase ${
                      n.status === 'Delivered' || n.status === 'Acknowledged' ? 'text-status-safe' : 'text-status-warning'
                    }`}>
                      {n.status}
                    </span>
                    {n.status === 'Delivered' || n.status === 'Acknowledged' ? (
                      <span className="material-symbols-outlined text-base text-status-safe">check</span>
                    ) : (
                      <span className="material-symbols-outlined text-base text-status-warning">warning</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 7: AI EXPLAINABILITY PANEL */}
        {explainability && (
          <div className="animate-fade-in space-y-sm">
            <h3 className="text-label-md uppercase tracking-widest text-on-surface-variant border-b border-outline-variant pb-xs">
              AI Explainability
            </h3>
            <div className="space-y-sm">
              {explainability.map((exp, i) => (
                <div key={i} className="border-l-2 border-primary pl-md py-xs">
                  <p className="text-body-md font-semibold text-on-surface mb-xs">Decision: {exp.decision}</p>
                  <div className="space-y-xs text-body-sm text-on-surface-variant">
                    <p><strong className="text-on-surface">Reason:</strong> {exp.reason}</p>
                    <p><strong className="text-on-surface">Confidence:</strong> {exp.confidence}%</p>
                    <p><strong className="text-on-surface">Impact:</strong> {exp.expectedImpact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 8: LIVE INCIDENT TIMELINE */}
        {timelineEvents.length > 0 && (
          <div className="animate-fade-in space-y-sm">
            <h3 className="text-label-md uppercase tracking-widest text-on-surface-variant border-b border-outline-variant pb-xs">
              Event Timeline
            </h3>
            <div className="relative border-l border-outline-variant ml-sm space-y-md py-sm">
              {timelineEvents.map((evt, i) => (
                <div key={i} className="relative pl-md">
                  <div className="absolute -left-[5px] top-[6px] h-2 w-2 rounded-full bg-primary ring-4 ring-surface-container-lowest" />
                  <p className="text-mono-data text-xs text-primary">{evt.timestamp}</p>
                  <p className="text-body-md text-on-surface mt-xs">{evt.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Human in the loop Button */}
        {!isProcessing && operationalRecs && (
          <div className="mt-xl pt-md border-t border-outline-variant">
            <button
              onClick={() => alert("Actions Dispatched successfully to Train Masters & Station Managers!")}
              className="w-full flex items-center justify-center gap-sm rounded bg-primary py-md text-on-primary text-label-md font-semibold transition-colors hover:bg-primary/90"
            >
              <span className="material-symbols-outlined text-base">send</span>
              Approve & Dispatch Actions
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
