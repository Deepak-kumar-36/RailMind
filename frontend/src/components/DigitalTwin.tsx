"use client";

import dynamic from "next/dynamic";

const RailwayMap = dynamic(
  () => import("./RailwayMap").then((mod) => mod.RailwayMap),
  { ssr: false }
);

export function DigitalTwin() {
  return (
    <section className="relative flex flex-col bg-surface-container-lowest">
      <div className="flex items-center justify-between border-b border-outline-variant px-lg py-md">
        <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant">
          Railway Digital Twin
        </h2>
        <div className="flex items-center gap-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-base">satellite</span>
          <span className="text-mono-data text-xs">LIVE FEED</span>
        </div>
      </div>
      <div className="relative flex-grow">
        <RailwayMap />
        
        {/* Overlay scanning effect */}
        <div className="pointer-events-none absolute inset-0 z-[400] bg-[linear-gradient(transparent_0%,rgba(59,130,246,0.03)_50%,transparent_100%)] bg-[length:100%_4px] mix-blend-screen" />
      </div>
    </section>
  );
}
