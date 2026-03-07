/**
 * page — Qantum Module
 * @module page
 * @path src/infrastructure/apps/dashboard/src/app/page.tsx
 * @auto-documented BrutalDocEngine v2.1
 */

import DashboardLayout from '@/components/layout/dashboard-layout';
import { Providers } from '@/components/providers';
import { PageHeader } from '@/components/breadcrumbs';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentRuns } from '@/components/dashboard/recent-runs';
import { HealingInsights } from '@/components/dashboard/healing-insights';
import { UsageChart } from '@/components/dashboard/usage-chart';
import { AutonomousControls } from '@/components/dashboard/autonomous-controls';
import { WatchdogPanel } from '@/components/dashboard/watchdog-panel';

export default function DashboardPage() {
  return (
    <Providers>
      <DashboardLayout>
        <div className="flex flex-col gap-6 relative">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 grid-pattern pointer-events-none opacity-50" />
          
          {/* Header with Breadcrumbs */}
          <div className="flex items-center justify-between relative">
            <PageHeader 
              title="Dashboard"
              description="Monitor your test execution and self-healing performance"
            />
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm text-emerald-400 font-medium">Live</span>
            </div>
          </div>

          {/* 🛡️ ETERNAL WATCHDOG PANEL */}
          <WatchdogPanel />

          {/* Stats Cards */}
          <StatsCards />

          {/* Main Content Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 relative">
            {/* Usage Chart - Wider */}
            <div className="col-span-4">
              <UsageChart />
            </div>

            {/* Healing Insights - Narrower */}
            <div className="col-span-3">
              <HealingInsights />
            </div>
          </div>

          {/* Recent Runs */}
          <RecentRuns />

          {/* Autonomous Controls */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-2 lg:col-span-2">
              <AutonomousControls />
            </div>
            {/* Add more autonomous features here */}
          </div>
        </div>
      </DashboardLayout>
    </Providers>
  );
}
