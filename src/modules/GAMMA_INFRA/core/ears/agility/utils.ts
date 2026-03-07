/**
 * utils — Qantum Module
 * @module utils
 * @path src/modules/GAMMA_INFRA/core/ears/agility/utils.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'passed':
    case 'success':
      return 'text-green-500';
    case 'failed':
    case 'error':
      return 'text-red-500';
    case 'running':
    case 'pending':
      return 'text-blue-500';
    case 'healed':
      return 'text-purple-500';
    case 'skipped':
      return 'text-yellow-500';
    default:
      return 'text-zinc-500';
  }
}

export function getStatusBg(status: string): string {
  switch (status.toLowerCase()) {
    case 'passed':
    case 'success':
      return 'bg-green-500/10 border-green-500/30';
    case 'failed':
    case 'error':
      return 'bg-red-500/10 border-red-500/30';
    case 'running':
    case 'pending':
      return 'bg-blue-500/10 border-blue-500/30';
    case 'healed':
      return 'bg-purple-500/10 border-purple-500/30';
    case 'skipped':
      return 'bg-yellow-500/10 border-yellow-500/30';
    default:
      return 'bg-zinc-500/10 border-zinc-500/30';
  }
}
