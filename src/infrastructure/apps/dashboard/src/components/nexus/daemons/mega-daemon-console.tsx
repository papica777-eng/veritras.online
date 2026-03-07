/**
 * MEGADAEMON CONTROL CONSOLE
 * Command & Control for MegaSupremeDaemon.ts orchestration
 */

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  Server, Activity, Cpu, HardDrive, Clock, Shield, 
  Play, Pause, RefreshCw, AlertTriangle, CheckCircle,
  Zap, Eye, Brain, Database, Ghost
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useDaemonStatus, 
  useSystemHealth,
  DaemonState,
  ThreatLevel,
  type SubSystemStatus 
} from '@/stores/nexus-store';

const stateColors: Record<DaemonState, { bg: string; text: string; pulse: boolean }> = {
  [DaemonState.DORMANT]: { bg: 'bg-gray-500/20', text: 'text-gray-400', pulse: false },
  [DaemonState.INITIALIZING]: { bg: 'bg-blue-500/20', text: 'text-blue-400', pulse: true },
  [DaemonState.AWAKENING]: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', pulse: true },
  [DaemonState.ACTIVE]: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', pulse: false },
  [DaemonState.PATROLLING]: { bg: 'bg-violet-500/20', text: 'text-violet-400', pulse: true },
  [DaemonState.HEALING]: { bg: 'bg-amber-500/20', text: 'text-amber-400', pulse: true },
  [DaemonState.MEDITATING]: { bg: 'bg-pink-500/20', text: 'text-pink-400', pulse: true },
  [DaemonState.EVOLVING]: { bg: 'bg-purple-500/20', text: 'text-purple-400', pulse: true },
  [DaemonState.EMERGENCY]: { bg: 'bg-red-500/20', text: 'text-red-400', pulse: true },
  [DaemonState.TERMINATED]: { bg: 'bg-gray-800', text: 'text-gray-600', pulse: false },
};

const subSystemIcons: Record<string, React.ElementType> = {
  ETERNAL_WATCHDOG: Shield,
  UNIFIED_GUARDIAN: Eye,
  MEMORY_WATCHDOG: HardDrive,
  ECOSYSTEM_MONITOR: Activity,
  VECTOR_SYNC: Database,
  AUTONOMOUS_THOUGHT: Brain,
  GHOST_PROTOCOL: Ghost,
  KILL_SWITCH: Zap,
};

function SubSystemCard({ system }: { system: SubSystemStatus }) {
  const Icon = subSystemIcons[system.type] || Server;
  const stateConfig = stateColors[system.state];

  return (
    <div className={cn(
      'p-3 rounded-lg border transition-all',
      stateConfig.bg,
      'border-violet-500/20 hover:border-violet-500/30'
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('h-4 w-4', stateConfig.text)} />
        <span className="text-xs font-medium text-white truncate">{system.type.replace(/_/g, ' ')}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full',
          stateConfig.bg, stateConfig.text
        )}>
          {system.state}
        </span>
        
        <div className="flex items-center gap-1">
          <div className={cn(
            'h-2 w-2 rounded-full',
            system.healthScore > 80 ? 'bg-emerald-500' :
            system.healthScore > 50 ? 'bg-amber-500' : 'bg-red-500',
            stateConfig.pulse && 'animate-pulse'
          )} />
          <span className="text-xs text-gray-400">{system.healthScore}%</span>
        </div>
      </div>
    </div>
  );
}

function MetricGauge({ label, value, max, icon: Icon, color }: { 
  label: string; 
  value: number; 
  max: number; 
  icon: React.ElementType;
  color: string;
}) {
  const percentage = (value / max) * 100;
  
  return (
    <div className="p-3 rounded-lg bg-[#12121a] border border-violet-500/10">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('h-4 w-4', color)} />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      
      <div className="flex items-end gap-2">
        <span className="text-xl font-bold text-white">{value}</span>
        <span className="text-xs text-gray-500 mb-1">/ {max}</span>
      </div>
      
      <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={cn('h-full rounded-full', color.replace('text-', 'bg-'))}
        />
      </div>
    </div>
  );
}

export function MegaDaemonConsole() {
  const daemonStatus = useDaemonStatus();
  const systemHealth = useSystemHealth();
  
  // Mock data if not connected
  const daemon = daemonStatus || {
    id: 'mega-supreme-001',
    name: 'MegaSupremeDaemon',
    state: DaemonState.ACTIVE,
    uptime: 86400,
    lastHeartbeat: new Date(),
    metrics: { cpu: 12, memory: 45, tasksProcessed: 1247, errorsHandled: 23 },
    subSystems: [
      { type: 'ETERNAL_WATCHDOG', state: DaemonState.PATROLLING, healthScore: 98, lastActivity: new Date() },
      { type: 'UNIFIED_GUARDIAN', state: DaemonState.ACTIVE, healthScore: 95, lastActivity: new Date() },
      { type: 'MEMORY_WATCHDOG', state: DaemonState.ACTIVE, healthScore: 92, lastActivity: new Date() },
      { type: 'VECTOR_SYNC', state: DaemonState.ACTIVE, healthScore: 100, lastActivity: new Date() },
      { type: 'AUTONOMOUS_THOUGHT', state: DaemonState.MEDITATING, healthScore: 97, lastActivity: new Date() },
      { type: 'GHOST_PROTOCOL', state: DaemonState.ACTIVE, healthScore: 100, lastActivity: new Date() },
    ],
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  const stateConfig = stateColors[daemon.state];

  return (
    <div className="rounded-xl border border-violet-500/20 bg-[#0d0d14] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-violet-500/20">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', stateConfig.bg)}>
            <Server className={cn('h-5 w-5', stateConfig.text, stateConfig.pulse && 'animate-pulse')} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{daemon.name}</h3>
            <p className="text-xs text-gray-500">Orchestration Control Console</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* State badge */}
          <div className={cn('px-3 py-1.5 rounded-full text-xs font-medium', stateConfig.bg, stateConfig.text)}>
            {stateConfig.pulse && (
              <span className={cn('inline-block h-2 w-2 rounded-full mr-2', stateConfig.text.replace('text-', 'bg-'), 'animate-pulse')} />
            )}
            {daemon.state}
          </div>
          
          {/* Uptime */}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            <span>{formatUptime(daemon.uptime)}</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricGauge 
            label="CPU" 
            value={daemon.metrics.cpu} 
            max={100} 
            icon={Cpu} 
            color="text-cyan-400" 
          />
          <MetricGauge 
            label="Memory" 
            value={daemon.metrics.memory} 
            max={100} 
            icon={HardDrive} 
            color="text-violet-400" 
          />
          <MetricGauge 
            label="Tasks" 
            value={daemon.metrics.tasksProcessed} 
            max={2000} 
            icon={Activity} 
            color="text-emerald-400" 
          />
          <MetricGauge 
            label="Errors Handled" 
            value={daemon.metrics.errorsHandled} 
            max={100} 
            icon={AlertTriangle} 
            color="text-amber-400" 
          />
        </div>

        {/* SubSystems Grid */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">SubSystems</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {daemon.subSystems.map((system) => (
              <SubSystemCard key={system.type} system={system} />
            ))}
          </div>
        </div>

        {/* Overall Health */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-medium text-white">System Health</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-emerald-400">{systemHealth.overall}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MegaDaemonConsole;
