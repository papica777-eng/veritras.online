/**
 * LIVE FEED PANEL
 * Real-time activity stream from all AETERNA systems
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Brain, Sparkles, Wrench, Database, AlertTriangle,
  Bell, Filter, Pause, Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLiveFeed, InsightSeverity } from '@/stores/nexus-store';

const feedTypeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  thought: { icon: Brain, color: 'text-violet-400 bg-violet-500/10' },
  insight: { icon: Sparkles, color: 'text-pink-400 bg-pink-500/10' },
  healing: { icon: Wrench, color: 'text-emerald-400 bg-emerald-500/10' },
  vector: { icon: Database, color: 'text-amber-400 bg-amber-500/10' },
  alert: { icon: AlertTriangle, color: 'text-red-400 bg-red-500/10' },
};

const severityColors: Partial<Record<InsightSeverity, string>> = {
  [InsightSeverity.WARNING]: 'border-l-amber-500',
  [InsightSeverity.CRITICAL]: 'border-l-red-500',
  [InsightSeverity.BREAKTHROUGH]: 'border-l-violet-500',
};

export function LiveFeedPanel() {
  const feed = useLiveFeed();
  const [isPaused, setIsPaused] = React.useState(false);
  const [filter, setFilter] = React.useState<string | null>(null);
  
  const filteredFeed = React.useMemo(() => {
    if (!filter) return feed;
    return feed.filter(item => item.type === filter);
  }, [feed, filter]);

  const displayFeed = isPaused ? filteredFeed.slice(0, 20) : filteredFeed.slice(0, 50);

  return (
    <div className="rounded-xl border border-violet-500/20 bg-[#0d0d14] overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-violet-500/20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Live Feed</h3>
            <p className="text-xs text-gray-500">Real-time activity stream</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filter */}
          <select
            value={filter || ''}
            onChange={(e) => setFilter(e.target.value || null)}
            className="px-2 py-1 rounded-lg bg-[#12121a] border border-violet-500/20 text-xs text-white focus:outline-none"
          >
            <option value="">All</option>
            <option value="thought">Thoughts</option>
            <option value="insight">Insights</option>
            <option value="healing">Healing</option>
            <option value="vector">Vectors</option>
            <option value="alert">Alerts</option>
          </select>
          
          {/* Pause/Play */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isPaused ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
            )}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {displayFeed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Activity className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm">No activity yet</p>
              </div>
            ) : (
              displayFeed.map((item) => {
                const config = feedTypeConfig[item.type];
                const Icon = config.icon;
                const severityBorder = item.severity ? severityColors[item.severity] : '';
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={cn(
                      'p-3 rounded-lg border border-violet-500/10 bg-[#12121a]',
                      'border-l-2',
                      severityBorder || 'border-l-transparent'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className={cn('p-1.5 rounded-lg', config.color.split(' ')[1])}>
                        <Icon className={cn('h-3 w-3', config.color.split(' ')[0])} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">{item.message}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-violet-500/20 text-xs text-gray-500 shrink-0">
        <span>{displayFeed.length} events</span>
        <div className="flex items-center gap-1">
          <span className={cn('h-2 w-2 rounded-full', isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse')} />
          <span>{isPaused ? 'Paused' : 'Streaming'}</span>
        </div>
      </div>
    </div>
  );
}

export default LiveFeedPanel;
