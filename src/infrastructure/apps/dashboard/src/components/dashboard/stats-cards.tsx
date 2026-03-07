/**
 * stats-cards — Qantum Module
 * @module stats-cards
 * @path src/infrastructure/apps/dashboard/src/components/dashboard/stats-cards.tsx
 * @auto-documented BrutalDocEngine v2.1
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Wand2,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';
import { cn, formatPercentage } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface DashboardStats {
  totalRuns: number;
  totalRunsChange: number;
  passRate: number;
  passRateChange: number;
  failedTests: number;
  failedTestsChange: number;
  healedSelectors: number;
  healedSelectorsChange: number;
}

export function StatsCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats() as Promise<DashboardStats>,
    refetchInterval: 30_000, // refresh every 30s
  });

  const cards = [
    {
      title: 'Total Test Runs',
      value: stats?.totalRuns?.toLocaleString() || '—',
      change: stats?.totalRunsChange || 0,
      icon: Activity,
      color: 'text-blue-500',
    },
    {
      title: 'Pass Rate',
      value: stats ? formatPercentage(stats.passRate) : '—',
      change: stats?.passRateChange || 0,
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      title: 'Failed Tests',
      value: stats?.failedTests?.toLocaleString() || '—',
      change: stats?.failedTestsChange || 0,
      icon: XCircle,
      color: 'text-red-500',
      invertChange: true,
    },
    {
      title: 'Healed Selectors',
      value: stats?.healedSelectors?.toLocaleString() || '—',
      change: stats?.healedSelectorsChange || 0,
      icon: Wand2,
      color: 'text-purple-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="singularity-card quantum-glow overflow-hidden animate-pulse">
            <CardContent className="flex items-center justify-center h-28">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={card.title} className="singularity-card quantum-glow overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={cn('p-2 rounded-lg', card.color.replace('text-', 'bg-') + '/10')}>
              <card.icon className={cn('h-4 w-4', card.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold stat-number">{card.value}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              {card.change > 0 ? (
                <ArrowUpRight className={cn(
                  'h-4 w-4 mr-1',
                  card.invertChange ? 'text-red-500' : 'text-emerald-500'
                )} />
              ) : (
                <ArrowDownRight className={cn(
                  'h-4 w-4 mr-1',
                  card.invertChange ? 'text-green-500' : 'text-red-500'
                )} />
              )}
              <span className={cn(
                card.change > 0
                  ? card.invertChange ? 'text-red-500' : 'text-green-500'
                  : card.invertChange ? 'text-green-500' : 'text-red-500'
              )}>
                {Math.abs(card.change)}%
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
