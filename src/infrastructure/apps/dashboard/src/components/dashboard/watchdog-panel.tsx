/**
 * watchdog-panel — Qantum Module
 * @module watchdog-panel
 * @path src/infrastructure/apps/dashboard/src/components/dashboard/watchdog-panel.tsx
 * @auto-documented BrutalDocEngine v2.1
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Eye, 
  Zap, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  Cpu,
  HardDrive,
  Database,
  GitBranch,
  Radio,
  RefreshCw,
  Play,
  Pause,
  Terminal,
  Send,
  X
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// BOOT SEQUENCE & COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

const BOOT_SEQUENCE = [
  "⚡ INITIALIZING ETERNAL WATCHDOG v34.1...",
  "🔒 LOADING ETERNAL HANDCUFFS MODULE... OK",
  "👁️ ACTIVATING SURVEILLANCE NETWORK... OK", 
  "⚛️ ARMING ATOMIC SENSORS... OK",
  "🏛️ OPENING ETERNAL PRISON GATES... OK",
  "📡 PATROL FREQUENCY: 5000ms",
  "✅ ДЕЖУРНИЯТ ГОТОВ. НИКОГА НЕ СПИ.",
];

const WATCHDOG_COMMANDS: Record<string, () => string> = {
  help: () => `
╔═══════════════════════════════════════════════════════════════╗
║              🛡️ ETERNAL WATCHDOG COMMANDS                     ║
╠═══════════════════════════════════════════════════════════════╣
║  help        - Показва тази помощ                             ║
║  status      - Статус на Дежурния                             ║
║  patrol      - Стартира патрул                                ║
║  prisoners   - Списък на затворниците                         ║
║  health      - Проверка на здравето                           ║
║  stats       - Статистика                                     ║
║  teleport    - Телепортира се до проблем                      ║
║  clear       - Изчиства терминала                             ║
╚═══════════════════════════════════════════════════════════════╝`,
  status: () => `
🛡️ ETERNAL WATCHDOG STATUS
═══════════════════════════════════
  Status:         PATROLLING ✓
  Uptime:         72h 34m 12s
  Patrols:        4,521
  Teleports:      89
  Neutralized:    12
  Prisoners:      7
  Health:         99.9%
═══════════════════════════════════`,
  patrol: () => `
👁️ PATROL #4522 INITIATED
═══════════════════════════════════
  [✓] Data Integrity......... OK
  [✓] Sensor Pulse........... OK
  [✓] Memory Usage........... 67% OK
  [✓] Disk Space............. 45% OK
  [!] Git Status............. 3 uncommitted
═══════════════════════════════════
  Result: ALL CLEAR (1 warning)
  Duration: 127ms`,
  prisoners: () => `
🔒 ETERNAL PRISON - INMATES
═══════════════════════════════════
ID                      TYPE            CAPTURED    ESCAPE
sensor_pulse_auth       PULSE_TIMEOUT   2h ago      2 💥
data_integrity_config   CORRUPTED       5h ago      0
memory_leak_worker_3    MEMORY_LEAK     1d ago      5 💥
api_rate_limiter        THROTTLE        2d ago      1 💥
cache_overflow_v2       OVERFLOW        3d ago      0
ssl_cert_expired        EXPIRED         5d ago      3 💥
db_connection_pool      EXHAUSTED       7d ago      0
═══════════════════════════════════
Total: 7 prisoners | NO ESCAPE POSSIBLE`,
  health: () => `
💚 SYSTEM HEALTH CHECK
═══════════════════════════════════
  CPU:       ████████░░ 78%
  Memory:    ██████░░░░ 67%
  Disk:      ████░░░░░░ 45%
  Network:   ██████████ 100%
  Sensors:   ██████████ 100%
═══════════════════════════════════
  Overall: 99.9% HEALTHY`,
  stats: () => `
📊 WATCHDOG STATISTICS
═══════════════════════════════════
  Total Patrols:      4,521
  Total Teleports:    89
  Threats Detected:   156
  Threats Neutralized: 12
  Prisoners:          7
  Escape Attempts:    11 (all failed)
  Uptime:             72h 34m 12s
  Last Patrol:        5 seconds ago
═══════════════════════════════════`,
  teleport: () => `
⚡ TELEPORT INITIATED
═══════════════════════════════════
  Scanning for anomalies...
  Location: sensor_pulse_auth
  Distance: 0ms (INSTANT)
  Status: ARRIVED
  Action: Monitoring threat
═══════════════════════════════════`,
};

// Static data - no Date.now() to avoid hydration issues
const WATCHDOG_STATE = {
  status: 'PATROLLING',
  uptime: '72h 34m',
  patrolCount: 4521,
  teleportCount: 89,
  threatsNeutralized: 12,
  prisonerCount: 7,
  lastPatrol: '2026-01-03T19:00:00.000Z',
  healthChecks: [
    { name: 'Data Integrity', status: 'healthy', icon: Database, lastCheck: '5s ago' },
    { name: 'Sensor Pulse', status: 'healthy', icon: Radio, lastCheck: '5s ago' },
    { name: 'Memory Usage', status: 'healthy', icon: Cpu, value: '67%', lastCheck: '5s ago' },
    { name: 'Disk Space', status: 'healthy', icon: HardDrive, value: '45%', lastCheck: '5s ago' },
    { name: 'Git Status', status: 'warning', icon: GitBranch, value: '3 uncommitted', lastCheck: '5s ago' },
  ],
  recentEvents: [
    { id: '1', type: 'PATROL', message: 'Patrol #4521 completed - all clear', time: '5s ago', severity: 'info' },
    { id: '2', type: 'TELEPORT', message: 'Teleported to sensor-pulse check', time: '2m ago', severity: 'info' },
    { id: '3', type: 'NEUTRALIZE', message: 'Neutralized: CORRUPTED_FILE threat', time: '15m ago', severity: 'critical' },
    { id: '4', type: 'PRISON', message: 'Threat imprisoned with ETERNAL HANDCUFFS', time: '15m ago', severity: 'warning' },
    { id: '5', type: 'PATROL', message: 'Patrol #4520 completed - 1 issue found', time: '20m ago', severity: 'warning' },
  ],
  prisoners: [
    { id: 'sensor_pulse_auth', type: 'PULSE_TIMEOUT', captured: '2h ago', escapeAttempts: 2 },
    { id: 'data_integrity_config', type: 'CORRUPTED', captured: '5h ago', escapeAttempts: 0 },
    { id: 'memory_leak_worker_3', type: 'MEMORY_LEAK', captured: '1d ago', escapeAttempts: 5 },
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// LIVE TERMINAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function LiveTerminal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isBooted, setIsBooted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Complexity: O(1)
  useEffect(() => {
    // Complexity: O(1)
    setMounted(true);
  }, []);

  // Complexity: O(1)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Complexity: O(N) — linear scan
  useEffect(() => {
    if (isOpen && !isBooted) {
      // Complexity: O(N) — linear scan
      setLogs([]);
      let delay = 0;
      BOOT_SEQUENCE.forEach(line => {
        // Complexity: O(1)
        setTimeout(() => {
          // Complexity: O(1)
          setLogs(prev => [...prev, line]);
        }, delay);
        delay += 400;
      });
      // Complexity: O(1)
      setTimeout(() => setIsBooted(true), delay);
    }
    if (!isOpen) {
      // Complexity: O(1)
      setIsBooted(false);
    }
  }, [isOpen]);

  // Complexity: O(1)
  useEffect(() => {
    if (isOpen && isBooted && inputRef.current) {
      // Complexity: O(1)
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isBooted]);

  // Escape key to close
  // Complexity: O(1)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        // Complexity: O(1)
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim().toLowerCase();
    // Complexity: O(1)
    setInput('');
    // Complexity: O(1)
    setLogs(prev => [...prev, `watchdog@aeterna:~$ ${input}`]);

    if (cmd === 'clear') {
      // Complexity: O(1)
      setLogs([]);
      return;
    }

    const handler = WATCHDOG_COMMANDS[cmd];
    if (handler) {
      // Complexity: O(1)
      setLogs(prev => [...prev, handler()]);
    } else {
      // Complexity: O(N)
      setLogs(prev => [...prev, `❌ Unknown command: ${cmd}\nType 'help' for available commands.`]);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 99999,
        pointerEvents: 'auto'
      }}
    >
      {/* Dark Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
        style={{ cursor: 'pointer' }}
      />
      
      {/* Terminal Window */}
      <div 
        className="relative w-full max-w-4xl mx-4 bg-[#0a0a0f] border-2 border-purple-500/50 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(139,92,246,0.3)]"
        style={{ 
          height: '70vh',
          maxHeight: '600px',
          minHeight: '400px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header - macOS style */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 flex items-center justify-between border-b border-purple-500/30">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button 
                onClick={onClose} 
                className="w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-400 transition-colors shadow-sm"
                title="Close"
              />
              <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 shadow-sm" />
              <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-mono font-bold">
                🛡️ ETERNAL WATCHDOG TERMINAL
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Terminal Content */}
        <div
          ref={scrollRef}
          className="p-4 overflow-y-auto font-mono text-sm"
          style={{ height: 'calc(100% - 110px)' }}
          onClick={() => inputRef.current?.focus()}
        >
          {logs.map((log, i) => (
            <div 
              key={i} 
              className={`whitespace-pre-wrap mb-1.5 leading-relaxed ${
                log.startsWith('watchdog@') ? 'text-purple-400 font-bold' : 
                log.includes('OK') ? 'text-emerald-400' :
                log.includes('❌') ? 'text-red-400' :
                log.includes('⚡') || log.includes('🛡️') || log.includes('═') ? 'text-amber-400' :
                log.includes('✅') || log.includes('✓') ? 'text-emerald-400' :
                log.includes('💥') || log.includes('💀') ? 'text-red-400' :
                'text-slate-300'
              }`}
            >
              {log}
            </div>
          ))}
          {!isBooted && (
            <div className="flex items-center gap-2 text-purple-400">
              <div className="w-2 h-4 bg-purple-500 animate-pulse" />
            </div>
          )}
        </div>

        {/* Input Line */}
        <form 
          onSubmit={handleSubmit} 
          className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-slate-900/95 border-t border-purple-500/30 flex items-center gap-3"
        >
          <span className="text-purple-400 font-mono text-sm font-bold flex-shrink-0">
            watchdog@aeterna:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-emerald-400 font-mono text-sm caret-emerald-400 placeholder-slate-600"
            placeholder="Type 'help' for commands..."
            autoFocus
            disabled={!isBooted}
          />
          <button 
            type="submit" 
            className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
            disabled={!isBooted}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAT CARD COMPONENT (NerveCenter style)
// ═══════════════════════════════════════════════════════════════════════════════

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color,
  trend,
  trendValue 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  color: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}) {
  const colorStyles: Record<string, string> = {
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    blue: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
    red: 'text-red-400 border-red-500/30 bg-red-500/5',
    purple: 'text-purple-400 border-purple-500/30 bg-purple-500/5',
    cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorStyles[color]} transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-xs uppercase tracking-wider">{label}</span>
        <Icon className="h-4 w-4 opacity-60" />
      </div>
      <div className="text-2xl font-bold font-mono">{value}</div>
      {trend && trendValue && (
        <div className="flex items-center mt-2 text-xs">
          {trend === 'up' && <span className="text-emerald-400">▲ {trendValue}</span>}
          {trend === 'down' && <span className="text-red-400">▼ {trendValue}</span>}
          {trend === 'stable' && <span className="text-slate-400">● {trendValue}</span>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATUS BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    healthy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.info}`}>
      {status.toUpperCase()}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PULSING DOT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const PulsingDot = ({ color = 'emerald' }: { color?: string }) => (
  <span className="relative flex h-3 w-3">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
      color === 'emerald' ? 'bg-emerald-400' : 
      color === 'purple' ? 'bg-purple-400' : 
      color === 'amber' ? 'bg-amber-400' : 'bg-emerald-400'
    }`}></span>
    <span className={`relative inline-flex rounded-full h-3 w-3 ${
      color === 'emerald' ? 'bg-emerald-500' : 
      color === 'purple' ? 'bg-purple-500' : 
      color === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'
    }`}></span>
  </span>
);

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESS BAR COMPONENT  
// ═══════════════════════════════════════════════════════════════════════════════

function ProgressBar({ value, color = 'purple' }: { value: number; color?: string }) {
  const colorClasses: Record<string, string> = {
    purple: 'from-purple-600 to-pink-600',
    emerald: 'from-emerald-600 to-cyan-600',
    amber: 'from-amber-600 to-orange-600',
    red: 'from-red-600 to-pink-600',
  };

  return (
    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
      <div 
        className={`h-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-500`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN WATCHDOG PANEL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function WatchdogPanel() {
  const [isActive, setIsActive] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'prison'>('overview');

  return (
    <>
      <LiveTerminal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
      
      <Card className="border-purple-500/30 bg-gradient-to-br from-slate-900/95 to-purple-950/30 backdrop-blur-xl overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)`
          }} />
        </div>

        <CardHeader className="pb-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <PulsingDot color="emerald" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                    🛡️ ETERNAL WATCHDOG v34.1
                  </span>
                </CardTitle>
                <CardDescription className="text-slate-400 italic">
                  "Дежурният винаги е на смяна. Никога не спи."
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Tab Buttons */}
              <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
                {(['overview', 'health', 'prison'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {tab === 'overview' ? '📊 Overview' : tab === 'health' ? '💚 Health' : '🔒 Prison'}
                  </button>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setTerminalOpen(true)}
                className="border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10 text-purple-400"
              >
                <Terminal className="h-4 w-4 mr-2" />
                Terminal
              </Button>
              
              <Button 
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setIsActive(!isActive)}
                className={isActive 
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20" 
                  : "border-slate-600 hover:border-amber-500"
                }
              >
                {isActive ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard icon={Activity} label="Status" value={WATCHDOG_STATE.status} color="emerald" />
                <StatCard icon={Eye} label="Patrols" value={WATCHDOG_STATE.patrolCount.toLocaleString()} color="blue" trend="up" trendValue="+12/hr" />
                <StatCard icon={Zap} label="Teleports" value={WATCHDOG_STATE.teleportCount.toString()} color="amber" />
                <StatCard icon={AlertTriangle} label="Neutralized" value={WATCHDOG_STATE.threatsNeutralized.toString()} color="red" />
                <StatCard icon={Lock} label="Prisoners" value={WATCHDOG_STATE.prisonerCount.toString()} color="purple" />
                <StatCard icon={RefreshCw} label="Uptime" value={WATCHDOG_STATE.uptime} color="cyan" />
              </div>

              {/* Event Feed */}
              <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Radio className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Live Event Feed</h3>
                  <PulsingDot color="amber" />
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {WATCHDOG_STATE.recentEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border-l-2 hover:bg-slate-800/70 transition-colors"
                      style={{
                        borderLeftColor: event.severity === 'critical' ? '#ef4444' : event.severity === 'warning' ? '#f59e0b' : '#3b82f6'
                      }}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {event.type === 'PATROL' && <Eye className="h-4 w-4 text-blue-400" />}
                        {event.type === 'TELEPORT' && <Zap className="h-4 w-4 text-amber-400" />}
                        {event.type === 'NEUTRALIZE' && <AlertTriangle className="h-4 w-4 text-red-400" />}
                        {event.type === 'PRISON' && <Lock className="h-4 w-4 text-purple-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200">{event.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{event.time}</span>
                          <StatusBadge status={event.severity} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Health Tab */}
          {activeTab === 'health' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Health Checks */}
              <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-semibold text-white">Health Checks</h3>
                </div>
                <div className="space-y-3">
                  {WATCHDOG_STATE.healthChecks.map((check, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${check.status === 'healthy' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                          <check.icon className={`h-4 w-4 ${check.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{check.name}</p>
                          {check.value && <p className="text-sm text-slate-400">{check.value}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">{check.lastCheck}</span>
                        {check.status === 'healthy' ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Resources */}
              <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="h-5 w-5 text-purple-400" />
                  <h3 className="font-semibold text-white">System Resources</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">CPU Usage</span>
                      <span className="text-purple-400 font-mono">78%</span>
                    </div>
                    <ProgressBar value={78} color="purple" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Memory</span>
                      <span className="text-emerald-400 font-mono">67%</span>
                    </div>
                    <ProgressBar value={67} color="emerald" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Disk Space</span>
                      <span className="text-amber-400 font-mono">45%</span>
                    </div>
                    <ProgressBar value={45} color="amber" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Network</span>
                      <span className="text-emerald-400 font-mono">100%</span>
                    </div>
                    <ProgressBar value={100} color="emerald" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prison Tab */}
          {activeTab === 'prison' && (
            <div className="space-y-4">
              {/* Prison Header */}
              <div className="bg-gradient-to-r from-red-950/30 to-slate-900/50 rounded-xl p-4 border border-red-900/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">🔒 ETERNAL PRISON</h3>
                      <p className="text-sm text-slate-400">ВЕЧНИ БЕЛЕЗНИЦИ • БЕЗ КЛЮЧ • АТОМЕН ДАТЧИК</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-red-400">{WATCHDOG_STATE.prisonerCount}</p>
                    <p className="text-xs text-slate-500">Total Inmates</p>
                  </div>
                </div>
              </div>

              {/* Prisoners List */}
              <div className="space-y-2">
                {WATCHDOG_STATE.prisoners.map((prisoner) => (
                  <div 
                    key={prisoner.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-red-900/30 hover:border-red-800/50 transition-all hover:bg-slate-800/70"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-red-500/20">
                        <Lock className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <p className="font-mono text-sm text-slate-200">{prisoner.id}</p>
                        <p className="text-xs text-slate-500">Type: <span className="text-red-400">{prisoner.type}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Captured</p>
                        <p className="text-sm text-slate-300">{prisoner.captured}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Escape Attempts</p>
                        <p className={`text-sm font-bold ${prisoner.escapeAttempts > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                          {prisoner.escapeAttempts} {prisoner.escapeAttempts > 0 && '💥'}
                        </p>
                      </div>
                      <div className="px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
                        <span className="text-xs font-bold text-red-400">ETERNAL</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Prison Warning */}
              <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <p className="text-center text-sm text-slate-500 font-mono">
                  ⚠️ NO KEY EXISTS • ATOMIC SENSOR ARMED • ESCAPE IMPOSSIBLE ⚠️
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
