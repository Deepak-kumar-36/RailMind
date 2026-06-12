"use client";

import { IncidentProvider } from "@/lib/IncidentContext";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DigitalTwin } from "@/components/DigitalTwin";
import { TrainCommandPanel } from "@/components/TrainCommandPanel";
import { OperationsFeed } from "@/components/OperationsFeed";
import { StatusBar } from "@/components/StatusBar";

export default function HomePage() {
  return (
    <IncidentProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-surface">
        {/* ── Header ── */}
        <DashboardHeader />

        {/* ── Main Command Center ── */}
        <main className="flex min-h-0 flex-1">
          {/* Left Panel: Command + Telemetry */}
          <aside className="flex w-[320px] shrink-0 flex-col border-r border-outline-variant">
            <TrainCommandPanel />
          </aside>

          {/* Center: Railway Digital Twin Map */}
          <section className="relative flex min-w-0 flex-1 flex-col">
            <DigitalTwin />
          </section>

          {/* Right Panel: Operations Intelligence Feed */}
          <aside className="flex w-[380px] shrink-0 flex-col border-l border-outline-variant">
            <OperationsFeed />
          </aside>
        </main>

        {/* ── Bottom Status Bar ── */}
        <StatusBar />
      </div>
    </IncidentProvider>
  );
}
