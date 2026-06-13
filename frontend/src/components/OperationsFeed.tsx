"use client";

import { useState } from "react";
import { useTrainIntel } from "@/lib/IncidentContext";
import { SOCKET_URL } from "@/lib/socket";

type Tab = "actions" | "drivers" | "timeline" | "explain";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "actions", label: "Actions", icon: "bolt" },
  { key: "drivers", label: "Notify", icon: "notifications" },
  { key: "timeline", label: "Timeline", icon: "schedule" },
  { key: "explain", label: "AI Intel", icon: "psychology" },
];

export function OperationsFeed() {
  const {
    activeIncidentId,
    activeIncidentType,
    intelStatusMsg,
    isProcessing,
    operationalRecs,
    driverNotifications,
    explainability,
    timelineEvents,
    approveAndDispatch,
  } = useTrainIntel();

  const [activeTab, setActiveTab] = useState<Tab>("actions");
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const handleDispatch = () => {
    approveAndDispatch();
    setDispatchSuccess(true);
    setTimeout(() => setDispatchSuccess(false), 3000);
  };

  /* ── Empty state ── */
  if (!activeIncidentType) {
    return (
      <div className="flex h-full flex-col glass-panel-heavy rounded-none border-0 border-l">
        <div className="shrink-0 border-b border-outline-variant bg-surface-container-low px-md py-sm">
          <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant">
            Operations Feed
          </h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-lg text-center">
          <div className="mb-md rounded-full bg-surface-container p-lg">
            <span className="material-symbols-outlined text-[36px] text-on-surface-variant opacity-50">
              analytics
            </span>
          </div>
          <p className="text-body-md font-medium text-on-surface">
            Standing By
          </p>
          <p className="mt-xs text-[13px] leading-relaxed text-on-surface-variant">
            Declare an emergency to activate the AI operations feed.
          </p>
        </div>
      </div>
    );
  }

  /* ── Active state with tabs ── */
  return (
    <div className="flex h-full flex-col overflow-hidden glass-panel-heavy rounded-none border-0 border-l relative">
      {dispatchSuccess && (
        <div className="absolute top-4 right-4 bg-status-safe text-surface-container-lowest px-4 py-2 rounded shadow-lg text-xs font-semibold uppercase tracking-widest z-50 animate-fade-in flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          Dispatched successfully
        </div>
      )}
      {/* Panel Header */}
      <div className="shrink-0 border-b border-outline-variant/30 bg-surface-container-lowest/40 px-md py-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-xs">
            <span className="inline-block h-[6px] w-[6px] animate-pulse rounded-full bg-status-critical" />
            Live Operations
          </h2>
          {intelStatusMsg && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-primary">
              {isProcessing && (
                <span className="mr-[4px] inline-block h-[5px] w-[5px] animate-ping rounded-full bg-primary" />
              )}
              {intelStatusMsg}
            </span>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="shrink-0 flex border-b border-outline-variant/30 bg-surface-container-lowest/40">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-1 items-center justify-center gap-[4px] py-sm text-[11px] font-semibold uppercase tracking-wider transition-colors \${
              activeTab === tab.key
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content — Scrollable */}
      <div className="min-h-0 flex-1 overflow-y-auto px-md py-md">
        {activeTab === "actions" && <ActionsTab recs={operationalRecs} />}
        {activeTab === "drivers" && <DriversTab notifications={driverNotifications} />}
        {activeTab === "timeline" && <TimelineTab events={timelineEvents} />}
        {activeTab === "explain" && <ExplainTab data={explainability} />}
      </div>

      {/* Footer: Dispatch + Report Buttons */}
      {!isProcessing && operationalRecs && (
        <div className="shrink-0 border-t border-outline-variant/30 p-md space-y-[6px]">
          <button
            onClick={handleDispatch}
            className="flex w-full items-center justify-center gap-sm rounded bg-primary py-sm text-[13px] font-semibold text-on-primary transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            Approve & Dispatch
          </button>
          {activeIncidentId && (
            <a
              href={`${SOCKET_URL}/api/reports/${activeIncidentId}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-sm rounded border border-outline-variant bg-surface-container py-sm text-[13px] font-semibold text-on-surface transition-colors hover:border-primary hover:text-primary"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              Download PDF Report
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── TAB: Actions ─────────────────────── */
function ActionsTab({
  recs,
}: {
  recs: ReturnType<typeof useTrainIntel>["operationalRecs"];
}) {
  if (!recs) {
    return <EmptyTab message="Waiting for AI to generate action recommendations…" />;
  }

  return (
    <div className="animate-fade-in space-y-md">
      {/* Priority badge */}
      <div className="flex items-center justify-between rounded glass-panel inner-glow px-sm py-[6px]">
        <span className="text-[11px] text-on-surface-variant">Priority</span>
        <span className="text-[12px] font-bold uppercase tracking-wider text-status-critical">
          {recs.priority}
        </span>
      </div>

      {/* Action Items */}
      <div className="space-y-[6px]">
        {recs.actions.map((act, i) => (
          <div
            key={i}
            className="flex items-start gap-sm rounded glass-panel px-sm py-[6px] hover-glow transition-all duration-300"
          >
            <span className="material-symbols-outlined mt-[1px] text-[14px] text-primary">
              check_circle
            </span>
            <span className="text-[13px] leading-snug text-on-surface">{act}</span>
          </div>
        ))}
      </div>

      {/* Confidence + Outcome */}
      <div className="grid grid-cols-2 gap-sm">
        <div className="rounded glass-panel inner-glow p-sm hover-glow transition-all duration-300">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
            Confidence
          </p>
          <p className="mt-[2px] font-mono text-[18px] font-semibold text-primary">
            {recs.confidence}%
          </p>
        </div>
        <div className="rounded glass-panel inner-glow p-sm hover-glow transition-all duration-300">
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
            Expected Outcome
          </p>
          <p className="mt-[2px] text-[12px] leading-snug text-on-surface">
            {recs.expectedOutcome}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── TAB: Drivers (Multi-Language) ─────────────────────── */
function DriversTab({
  notifications,
}: {
  notifications: ReturnType<typeof useTrainIntel>["driverNotifications"];
}) {
  const { translatedNotifications } = useTrainIntel();
  const [lang, setLang] = useState<"en" | "hi" | "regional">("en");

  if (!notifications) {
    return <EmptyTab message="Waiting for driver notification list…" />;
  }

  const langLabels: Record<string, string> = {
    en: "EN",
    hi: "हिं",
    regional: translatedNotifications?.regionalLanguage?.slice(0, 3).toUpperCase() || "REG"
  };

  // Get translated notifications if available
  const currentNotifications = translatedNotifications
    ? translatedNotifications[lang]
    : null;

  return (
    <div className="animate-fade-in space-y-sm">
      {/* Language Toggle */}
      {translatedNotifications && (
        <div className="flex items-center gap-[4px] rounded glass-panel p-[3px]">
          {(["en", "hi", "regional"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`flex-1 rounded px-sm py-[4px] text-[10px] font-bold uppercase tracking-wider transition-colors ${
                lang === l
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {langLabels[l]}
              {l === "regional" && translatedNotifications.regionalLanguage && (
                <span className="ml-[3px] text-[8px] normal-case opacity-70">
                  {translatedNotifications.regionalLanguage}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Notification Cards */}
      <div className="space-y-[4px]">
        {(currentNotifications || notifications).map((n, i) => (
          <div
            key={i}
            className="rounded glass-panel px-sm py-[6px] hover-glow transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                  train
                </span>
                <span className="text-[13px] font-medium text-on-surface">{n.trainNumber}</span>
              </div>
              <span
                className={`flex items-center gap-[3px] text-[11px] font-semibold uppercase tracking-wider ${
                  n.status === "Delivered" || n.status === "Acknowledged"
                    ? "text-status-safe"
                    : "text-status-warning"
                }`}
              >
                {n.status}
                <span className="material-symbols-outlined text-[12px]">
                  {n.status === "Delivered" || n.status === "Acknowledged" ? "check" : "warning"}
                </span>
              </span>
            </div>
            {/* Show translated message if available */}
            {"message" in n && (n as any).message && (
              <p className="mt-[3px] text-[11px] leading-snug text-on-surface-variant">
                {(n as any).message}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────── TAB: Timeline ─────────────────────── */
function TimelineTab({ events }: { events: ReturnType<typeof useTrainIntel>["timelineEvents"] }) {
  if (events.length === 0) {
    return <EmptyTab message="Timeline events will appear as the incident unfolds…" />;
  }

  return (
    <div className="animate-fade-in relative ml-[6px] border-l border-outline-variant space-y-md py-xs">
      {events.map((evt, i) => (
        <div key={i} className="relative pl-md">
          <div className="absolute -left-[4px] top-[4px] h-[7px] w-[7px] rounded-full bg-primary ring-[3px] ring-surface-container-lowest" />
          <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
            {evt.timestamp}
          </p>
          <p className="mt-[2px] text-[13px] leading-snug text-on-surface">{evt.description}</p>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────── TAB: Explainability ─────────────────────── */
function ExplainTab({
  data,
}: {
  data: ReturnType<typeof useTrainIntel>["explainability"];
}) {
  if (!data) {
    return <EmptyTab message="Waiting for AI explainability data…" />;
  }

  return (
    <div className="animate-fade-in space-y-md">
      {data.map((exp, i) => (
        <div key={i} className="rounded border-l-2 border-primary glass-panel p-sm hover-glow transition-all duration-300">
          <p className="text-[13px] font-semibold text-on-surface">{exp.decision}</p>
          <div className="mt-xs space-y-[3px] text-[12px] text-on-surface-variant">
            <p>
              <span className="text-on-surface">Reason:</span> {exp.reason}
            </p>
            <p>
              <span className="text-on-surface">Confidence:</span> {exp.confidence}%
            </p>
            <p>
              <span className="text-on-surface">Impact:</span> {exp.expectedImpact}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────── Empty State Helper ─────────────────────── */
function EmptyTab({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-[13px] text-on-surface-variant opacity-50">{message}</p>
    </div>
  );
}
