/**
 * healing-insights — Qantum Module
 * @module healing-insights
 * @path src/infrastructure/apps/dashboard/src/components/dashboard/healing-insights.tsx
 * @auto-documented BrutalDocEngine v2.1
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wand2, TrendingUp, Code2 } from 'lucide-react';

interface HealedSelector {
  id: string;
  originalSelector: string;
  healedSelector: string;
  testName: string;
  healedAt: string;
  confidence: number;
}

const insights = {
  totalHealed: 156,
  successRate: 98.7,
  recentHeals: [
    {
      id: '1',
      originalSelector: '#submit-btn',
      healedSelector: '[data-testid="submit-button"]',
      testName: 'Checkout Flow',
      healedAt: '2026-01-03T18:45:00.000Z',
      confidence: 94,
    },
    {
      id: '2',
      originalSelector: '.login-form .email',
      healedSelector: 'input[name="email"]',
      testName: 'Login Test',
      healedAt: '2026-01-03T18:15:00.000Z',
      confidence: 89,
    },
    {
      id: '3',
      originalSelector: '#nav-menu > li:nth-child(3)',
      healedSelector: '[aria-label="Settings"]',
      testName: 'Navigation Test',
      healedAt: '2026-01-03T17:00:00.000Z',
      confidence: 92,
    },
  ],
  topPatterns: [
    { pattern: 'ID → data-testid', count: 45 },
    { pattern: 'Class → aria-label', count: 32 },
    { pattern: 'XPath → CSS', count: 28 },
    { pattern: 'nth-child → semantic', count: 21 },
  ],
};

export function HealingInsights() {

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-purple-500" />
          <CardTitle>Self-Healing Insights</CardTitle>
        </div>
        <CardDescription>
          AI-powered selector healing performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{insights?.totalHealed}</p>
            <p className="text-sm text-muted-foreground">Selectors healed</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-500">
              {insights?.successRate}%
            </p>
            <p className="text-sm text-muted-foreground">Success rate</p>
          </div>
        </div>

        {/* Top Patterns */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Top Healing Patterns
          </h4>
          <div className="space-y-2">
            {insights?.topPatterns.map((pattern) => (
              <div
                key={pattern.pattern}
                className="flex items-center justify-between text-sm"
              >
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {pattern.pattern}
                </code>
                <span className="text-muted-foreground">{pattern.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Heals */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            Recent Heals
          </h4>
          <div className="space-y-3">
            {insights?.recentHeals.map((heal) => (
              <div
                key={heal.id}
                className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{heal.testName}</span>
                  <span className="text-xs text-purple-400">
                    {heal.confidence}% confidence
                  </span>
                </div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 line-through opacity-60">
                      {heal.originalSelector}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">{heal.healedSelector}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
