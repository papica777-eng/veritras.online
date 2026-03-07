/**
 * @fileoverview Skeleton Loading Component
 * @description Animated skeleton loaders for content placeholders
 */

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'text' | 'card';
}

function Skeleton({
  className,
  variant = 'default',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-violet-500/10 via-violet-500/20 to-violet-500/10',
        'bg-[length:200%_100%]',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'h-4 rounded',
        variant === 'card' && 'rounded-xl',
        variant === 'default' && 'rounded-lg',
        className
      )}
      {...props}
    />
  );
}

// Preset skeleton components
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-violet-500/20 bg-[#12121a] p-6', className)}>
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="h-12 w-12" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="h-4 w-3/4" />
          <Skeleton variant="text" className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <Skeleton variant="text" className="h-3" />
        <Skeleton variant="text" className="h-3 w-5/6" />
        <Skeleton variant="text" className="h-3 w-4/6" />
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-violet-500/20 bg-[#12121a] overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-violet-500/20">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-violet-500/10 last:border-0">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-violet-500/20 bg-[#12121a] p-6">
          <Skeleton variant="text" className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-8 w-3/4 mb-1" />
          <Skeleton variant="text" className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-violet-500/20 bg-[#12121a] p-6', className)}>
      <Skeleton variant="text" className="h-5 w-1/4 mb-4" />
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1" 
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonStats, SkeletonChart };
