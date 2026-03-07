/**
 * recent-runs — Qantum Module
 * @module recent-runs
 * @path src/infrastructure/apps/dashboard/src/components/dashboard/recent-runs.tsx
 * @auto-documented BrutalDocEngine v2.1
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatDuration, formatDate, getStatusColor, getStatusBg } from '@/lib/utils';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Ghost,
  Wand2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface TestRun {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'running';
  duration: number;
  passedTests: number;
  failedTests: number;
  healedTests: number;
  ghostMode: boolean;
  createdAt: string;
}

export function RecentRuns() {
  const { data: runs, isLoading } = useQuery<TestRun[]>({
    queryKey: ['recent-runs'],
    queryFn: () => apiClient.getTestRuns() as Promise<TestRun[]>,
    refetchInterval: 15_000,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Test Runs</CardTitle>
        <Link
          href="/runs"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          View all
          <ExternalLink className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
        <div className="space-y-4">
          {runs?.map((run) => (
            <Link
              key={run.id}
              href={`/runs/${run.id}`}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {getStatusIcon(run.status)}
                <div>
                  <p className="font-medium">{run.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatDate(run.createdAt)}</span>
                    {run.duration > 0 && (
                      <>
                        <span>•</span>
                        <span>{formatDuration(run.duration)}</span>
                      </>
                    )}
                    {run.ghostMode && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-purple-400">
                          <Ghost className="h-3 w-3" />
                          Ghost
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Test counts */}
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                    {run.passedTests}
                  </span>
                  {run.failedTests > 0 && (
                    <span className="flex items-center gap-1 text-red-500">
                      <XCircle className="h-4 w-4" />
                      {run.failedTests}
                    </span>
                  )}
                  {run.healedTests > 0 && (
                    <span className="flex items-center gap-1 text-purple-500">
                      <Wand2 className="h-4 w-4" />
                      {run.healedTests}
                    </span>
                  )}
                </div>

                {/* Status badge */}
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
                    // Complexity: O(1)
                    getStatusBg(run.status),
                    // Complexity: O(1)
                    getStatusColor(run.status)
                  )}
                >
                  {run.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
        )}
      </CardContent>
    </Card>
  );
}
