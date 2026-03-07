/**
 * usage-chart — Qantum Module
 * @module usage-chart
 * @path src/infrastructure/apps/dashboard/src/components/dashboard/usage-chart.tsx
 * @auto-documented BrutalDocEngine v2.1
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const usageData = [
  { date: 'Dec 21', tests: 89, passed: 82, failed: 7, healed: 12 },
  { date: 'Dec 22', tests: 120, passed: 110, failed: 10, healed: 8 },
  { date: 'Dec 23', tests: 95, passed: 88, failed: 7, healed: 15 },
  { date: 'Dec 24', tests: 78, passed: 72, failed: 6, healed: 9 },
  { date: 'Dec 25', tests: 45, passed: 42, failed: 3, healed: 5 },
  { date: 'Dec 26', tests: 110, passed: 102, failed: 8, healed: 11 },
  { date: 'Dec 27', tests: 134, passed: 125, failed: 9, healed: 14 },
  { date: 'Dec 28', tests: 98, passed: 91, failed: 7, healed: 10 },
  { date: 'Dec 29', tests: 142, passed: 132, failed: 10, healed: 18 },
  { date: 'Dec 30', tests: 156, passed: 146, failed: 10, healed: 16 },
  { date: 'Dec 31', tests: 88, passed: 82, failed: 6, healed: 7 },
  { date: 'Jan 1', tests: 67, passed: 63, failed: 4, healed: 6 },
  { date: 'Jan 2', tests: 145, passed: 136, failed: 9, healed: 13 },
  { date: 'Jan 3', tests: 178, passed: 168, failed: 10, healed: 19 },
];

export function UsageChart() {

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Test Execution Trends</CardTitle>
        <CardDescription>Daily test runs over the last 14 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="passed"
                stroke="hsl(142 76% 36%)"
                strokeWidth={2}
                dot={false}
                name="Passed"
              />
              <Line
                type="monotone"
                dataKey="failed"
                stroke="hsl(0 84% 60%)"
                strokeWidth={2}
                dot={false}
                name="Failed"
              />
              <Line
                type="monotone"
                dataKey="healed"
                stroke="hsl(270 60% 50%)"
                strokeWidth={2}
                dot={false}
                name="Healed"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
