"use client";

import { useTrainIntel } from "@/lib/IncidentContext";
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const { connected, network, searchTrain, isFetchingTrain, activeTrain, clearAll } =
    useTrainIntel();
  const [currentTime, setCurrentTime] = useState("");
  const [trainQuery, setTrainQuery] = useState("");

  useEffect(() => {
    function tick() {
      setCurrentTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchTrain(trainQuery);
  };

  return (
    <header className="shrink-0 border-b border-outline-variant bg-surface-container-low">
      <div className="flex items-center justify-between px-md py-[8px]">
        {/* Left: Logo + Connection */}
        <div className="flex items-center gap-md">
          <div className="flex items-baseline gap-sm">
            <h1 className="text-[18px] font-bold tracking-tight text-on-surface">
              RAILMIND
            </h1>
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
              Emergency Intelligence
            </span>
          </div>

          <div className="ml-sm flex items-center gap-[5px]">
            <span
              className={`inline-block h-[6px] w-[6px] rounded-full ${
                connected ? "bg-status-safe" : "bg-status-critical animate-pulse"
              }`}
            />
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">
              {connected ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        {/* Center: Train Search */}
        <div className="flex flex-1 justify-center px-lg">
          <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center gap-[6px]">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Train Number (e.g. 12301)"
                value={trainQuery}
                onChange={(e) => setTrainQuery(e.target.value)}
                className="w-full rounded bg-surface-container px-sm py-[5px] pl-[30px] text-[13px] text-on-surface placeholder:text-on-surface-variant/40 border border-outline-variant focus:border-primary focus:outline-none transition-colors"
              />
              <span className="material-symbols-outlined absolute left-[8px] top-1/2 -translate-y-1/2 text-[14px] text-on-surface-variant">
                search
              </span>
            </div>
            <button
              type="submit"
              disabled={!trainQuery.trim() || isFetchingTrain}
              className="rounded bg-surface-container px-sm py-[5px] text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant border border-outline-variant transition-colors hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isFetchingTrain ? (
                <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
              ) : (
                "Track"
              )}
            </button>
            {activeTrain && (
              <button
                type="button"
                onClick={() => {
                  setTrainQuery("");
                  clearAll();
                }}
                className="rounded px-[8px] py-[5px] text-[11px] font-semibold uppercase tracking-wider text-status-critical border border-status-critical/30 transition-colors hover:bg-status-critical/10"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Right: Network + Time */}
        <div className="flex items-center gap-lg">
          <div className="hidden text-right md:block">
            <p className="text-[9px] uppercase tracking-[0.08em] text-on-surface-variant">
              Network Health
            </p>
            <p className="font-mono text-[16px] font-semibold tabular-nums text-on-surface">
              {network.networkHealth}
              <span className="text-[10px] text-on-surface-variant">/100</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.08em] text-on-surface-variant">IST</p>
            <p className="font-mono text-[16px] font-semibold tabular-nums text-on-surface">
              {currentTime}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
