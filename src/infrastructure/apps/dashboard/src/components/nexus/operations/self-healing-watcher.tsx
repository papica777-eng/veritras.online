/**
 * SELF-HEALING WATCHER PANEL
 * Auto-repair loop with infinite cycle of self-correction
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, RefreshCw, CheckCircle, AlertTriangle, Clock,
  Code, FileCode, Package, Undo2, Settings, Zap, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useHealingEvents, 
  useAutoHealing,
  useNexusStore,
  type HealingEvent 
} from '@/stores/nexus-store';

const healingTypeConfig: Record<HealingEvent['type'], { icon: React.ElementType; color: string; label: string }> = {
  ERROR_FIX: { icon: AlertTriangle, color: 'text-red-400 bg-red-500/10', label: 'Error Fix' },
  TODO_RESOLVED: { icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10', label: 'TODO Resolved' },
  DEPENDENCY_UPDATE: { icon: Package, color: 'text-blue-400 bg-blue-500/10', label: 'Dependency Update' },
  CODE_REFACTOR: { icon: Code, color: 'text-violet-400 bg-violet-500/10', label: 'Code Refactor' },
};

function HealingEventCard({ event, onRollback }: { event: HealingEvent; onRollback: () => void }) {
  const config = healingTypeConfig[event.type];
  const Icon = config.icon;
  const [isRollingBack, setIsRollingBack] = React.useState(false);

  const handleRollback = async () => {
    // Complexity: O(1)
    setIsRollingBack(true);
    // SAFETY: async operation — wrap in try-catch for production resilience
    await onRollback();
    // Complexity: O(1)
    setIsRollingBack(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-3 rounded-lg border border-violet-500/20 bg-[#12121a] hover:border-violet-500/30 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg', config.color.split(' ')[1])}>
          <Icon className={cn('h-4 w-4', config.color.split(' ')[0])} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-400">{config.label}</span>
            {event.autoFixed && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Auto</span>
            )}
          </div>
          
          <p className="text-sm text-white mb-1">{event.description}</p>
          
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <FileCode className="h-3 w-3" />
              <span className="truncate max-w-[150px]">{event.target}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
        
        {event.rollbackAvailable && (
          <button
            onClick={handleRollback}
            disabled={isRollingBack}
            className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-400 transition-colors disabled:opacity-50"
          >
            {isRollingBack ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Undo2 className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function HealingPolicySelector() {
  const { policy, setPolicy, enabled, toggle } = useAutoHealing();
  
  const policies = [
    { id: 'conservative', label: 'Conservative', desc: 'Only safe, reversible fixes' },
    { id: 'balanced', label: 'Balanced', desc: 'Smart risk assessment' },
    { id: 'aggressive', label: 'Aggressive', desc: 'Fix everything possible' },
  ] as const;

  return (
    <div className="p-4 rounded-lg border border-violet-500/20 bg-[#12121a]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-white">Healing Policy</span>
        </div>
        
        <button
          onClick={toggle}
          className={cn(
            'relative w-12 h-6 rounded-full transition-colors',
            enabled ? 'bg-emerald-500' : 'bg-gray-700'
          )}
        >
          <motion.div
            animate={{ x: enabled ? 24 : 2 }}
            className="absolute top-1 w-4 h-4 rounded-full bg-white"
          />
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {policies.map((p) => (
          <button
            key={p.id}
            onClick={() => setPolicy(p.id)}
            disabled={!enabled}
            className={cn(
              'p-2 rounded-lg border text-left transition-all',
              policy === p.id
                ? 'border-violet-500 bg-violet-500/10'
                : 'border-violet-500/20 hover:border-violet-500/40',
              !enabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <p className="text-xs font-medium text-white">{p.label}</p>
            <p className="text-[10px] text-gray-500">{p.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function HealingStats() {
  const events = useHealingEvents();
  
  const stats = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEvents = events.filter(e => new Date(e.timestamp) >= today);
    const autoFixed = todayEvents.filter(e => e.autoFixed).length;
    
    return {
      total: todayEvents.length,
      autoFixed,
      manual: todayEvents.length - autoFixed,
      successRate: todayEvents.length > 0 ? Math.round((autoFixed / todayEvents.length) * 100) : 100,
    };
  }, [events]);

  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="p-3 rounded-lg bg-[#12121a] border border-violet-500/10 text-center">
        <p className="text-2xl font-bold text-white">{stats.total}</p>
        <p className="text-xs text-gray-500">Today</p>
      </div>
      <div className="p-3 rounded-lg bg-[#12121a] border border-violet-500/10 text-center">
        <p className="text-2xl font-bold text-emerald-400">{stats.autoFixed}</p>
        <p className="text-xs text-gray-500">Auto-Fixed</p>
      </div>
      <div className="p-3 rounded-lg bg-[#12121a] border border-violet-500/10 text-center">
        <p className="text-2xl font-bold text-amber-400">{stats.manual}</p>
        <p className="text-xs text-gray-500">Manual</p>
      </div>
      <div className="p-3 rounded-lg bg-[#12121a] border border-violet-500/10 text-center">
        <p className="text-2xl font-bold text-violet-400">{stats.successRate}%</p>
        <p className="text-xs text-gray-500">Success</p>
      </div>
    </div>
  );
}

export function SelfHealingWatcher() {
  const events = useHealingEvents();
  const { rollbackHealing } = useNexusStore();

  return (
    <div className="rounded-xl border border-violet-500/20 bg-[#0d0d14] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-violet-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Self-Healing Watcher</h3>
            <p className="text-xs text-gray-500">Infinite cycle of self-correction</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <Shield className="h-3 w-3 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">Protected</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <HealingStats />
        
        {/* Policy Selector */}
        <HealingPolicySelector />
        
        {/* Recent Events */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">Recent Healing Events</h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Wrench className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">System is healthy</p>
                  <p className="text-xs">No healing events recorded</p>
                </div>
              ) : (
                events.slice(0, 10).map((event) => (
                  <HealingEventCard
                    key={event.id}
                    event={event}
                    onRollback={() => rollbackHealing(event.id)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelfHealingWatcher;
