"use client";

import { IncidentProvider } from "@/lib/IncidentContext";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DigitalTwin } from "@/components/DigitalTwin";
import { TrainCommandPanel } from "@/components/TrainCommandPanel";
import { OperationsFeed } from "@/components/OperationsFeed";
import { PredictiveMetrics } from "@/components/PredictiveMetrics";

export default function HomePage() {
  return (
    <IncidentProvider>
      <div className="flex min-h-screen flex-col bg-surface">
        {/* ── Header ── */}
        <DashboardHeader />

        {/* ── Main Grid ── */}
        <main className="flex-grow px-lg py-lg">
          <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-lg">
            {/* Top Triple-Column Row */}
            <div className="grid h-[600px] gap-[1px] lg:grid-cols-[300px_1fr_400px]">
              <TrainCommandPanel />
              <DigitalTwin />
              <OperationsFeed />
            </div>

            {/* Bottom Row: Metrics & Forecast */}
            <PredictiveMetrics />
          </div>
        </main>
      </div>
    </IncidentProvider>
  );
}
