/**
 * @fileoverview Empty State Component
 * @description Beautiful empty states for pages without data
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  FolderOpen,
  FileText,
  TestTube2,
  PlayCircle,
  Search,
  Bell,
  Inbox,
  type LucideIcon,
} from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: 'default' | 'compact';
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  secondaryAction,
  className,
  variant = 'default',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        variant === 'default' ? 'py-16 px-4' : 'py-8 px-4',
        className
      )}
    >
      {/* Animated Icon Container */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-xl animate-pulse" />
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30">
          <Icon className="h-10 w-10 text-violet-400" />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-sm mb-6">{description}</p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button
              onClick={action.onClick}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Preset Empty States
export function EmptyTestCases({ onCreateTest }: { onCreateTest: () => void }) {
  return (
    <EmptyState
      icon={TestTube2}
      title="No test cases yet"
      description="Get started by creating your first test case. Use AI to generate tests automatically or write them manually."
      action={{
        label: 'Create Test Case',
        onClick: onCreateTest,
      }}
      secondaryAction={{
        label: 'Generate with AI',
        onClick: () => {},
      }}
    />
  );
}

export function EmptyTestRuns({ onRunTests }: { onRunTests: () => void }) {
  return (
    <EmptyState
      icon={PlayCircle}
      title="No test runs found"
      description="Run your first test suite to see results here. Test runs include detailed execution logs and reports."
      action={{
        label: 'Run Tests',
        onClick: onRunTests,
      }}
    />
  );
}

export function EmptyProjects({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No projects yet"
      description="Create your first project to organize your test suites and manage team collaboration."
      action={{
        label: 'Create Project',
        onClick: onCreateProject,
      }}
    />
  );
}

export function EmptySearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try adjusting your search or filters.`}
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={Bell}
      title="All caught up!"
      description="You have no new notifications. We'll let you know when something important happens."
      variant="compact"
    />
  );
}

export function EmptyInbox() {
  return (
    <EmptyState
      icon={Inbox}
      title="Inbox zero!"
      description="No messages or alerts to display. Your testing environment is running smoothly."
      variant="compact"
    />
  );
}
