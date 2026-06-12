"use client";

import { useTrainIntel } from "@/lib/IncidentContext";
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const { connected, network, searchTrain, isFetchingTrain, activeTrain, clearAll } = useTrainIntel();
  const [currentTime, setCurrentTime] = useState("");
  const [trainQuery, setTrainQuery] = useState("");

  useEffect(() => {
    function tick() {
      setCurrentTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
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
    <header className="border-b border-outline-variant bg-surface-container-low">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-lg py-md">
        {/* Left: Logo + Status */}
        <div className="flex items-center gap-lg">
          <div>
            <h1 className="text-headline-md font-semibold tracking-tight text-on-surface">
              RAILMIND
            </h1>
            <p className="text-label-sm uppercase tracking-widest text-on-surface-variant">
              Emergency Intelligence Console
            </p>
          </div>

          <div className="hidden items-center gap-sm md:flex">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                connected ? "bg-status-safe" : "bg-status-critical"
              }`}
            />
            <span className="text-label-sm text-on-surface-variant">
              {connected ? "System Online" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Center: Train Search */}
        <div className="flex flex-1 justify-center px-lg">
          <form onSubmit={handleSearch} className="flex w-full max-w-md items-center gap-sm">
            <input
              type="text"
              placeholder="Enter Train Number (e.g., 12301)"
              value={trainQuery}
              onChange={(e) => setTrainQuery(e.target.value)}
              className="w-full rounded border border-outline-variant bg-surface-container px-md py-sm text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!trainQuery.trim() || isFetchingTrain}
              className="flex shrink-0 items-center gap-xs rounded border border-outline-variant bg-surface-container px-md py-sm text-label-sm text-on-surface-variant transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isFetchingTrain ? (
                <span className="material-symbols-outlined animate-spin text-base">sync</span>
              ) : (
                <span className="material-symbols-outlined text-base">search</span>
              )}
              Track
            </button>
            {activeTrain && (
              <button
                type="button"
                onClick={() => {
                  setTrainQuery("");
                  clearAll();
                }}
                className="ml-xs rounded border border-outline-variant px-md py-sm text-label-sm text-status-critical hover:bg-status-critical/10"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Right: Network + Time */}
        <div className="flex items-center gap-lg">
          <div className="hidden text-right md:block">
            <p className="text-mono-data text-on-surface-variant">
              Network Health
            </p>
            <p className="text-headline-md font-semibold text-on-surface">
              {network.networkHealth}
              <span className="text-label-sm text-on-surface-variant">/100</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-mono-data text-on-surface-variant">IST</p>
            <p className="font-mono text-headline-md font-semibold tabular-nums text-on-surface">
              {currentTime}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
