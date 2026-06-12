"use client";

import dynamic from "next/dynamic";

const RailwayMap = dynamic(
  () => import("./RailwayMap").then((mod) => mod.RailwayMap),
  { ssr: false }
);

export function DigitalTwin() {
  return (
    <div className="relative flex h-full w-full flex-col" style={{ isolation: "isolate" }}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-outline-variant bg-surface-container-low px-md py-sm">
        <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant">
          Railway Digital Twin
        </h2>
        <div className="flex items-center gap-xs text-on-surface-variant">
          <span className="inline-block h-[6px] w-[6px] animate-pulse rounded-full bg-status-safe" />
          <span className="font-mono text-[11px] uppercase tracking-wider opacity-80">
            Live Feed
          </span>
        </div>
      </div>

      {/* Map — contained inside with overflow hidden */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <RailwayMap />
      </div>
    </div>
  );
}
