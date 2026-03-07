#!/usr/bin/env npx ts-node
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                               ║
 * ║   ███████╗██╗   ██╗██████╗ ██████╗ ███████╗███╗   ███╗███████╗                                ║
 * ║   ██╔════╝██║   ██║██╔══██╗██╔══██╗██╔════╝████╗ ████║██╔════╝                                ║
 * ║   ███████╗██║   ██║██████╔╝██████╔╝█████╗  ██╔████╔██║█████╗                                  ║
 * ║   ╚════██║██║   ██║██╔═══╝ ██╔══██╗██╔══╝  ██║╚██╔╝██║██╔══╝                                  ║
 * ║   ███████║╚██████╔╝██║     ██║  ██║███████╗██║ ╚═╝ ██║███████╗                                ║
 * ║   ╚══════╝ ╚═════╝ ╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝                                ║
 * ║                                                                                               ║
 * ║   ██████╗  █████╗ ███████╗███╗   ███╗ ██████╗ ███╗   ██╗                                      ║
 * ║   ██╔══██╗██╔══██╗██╔════╝████╗ ████║██╔═══██╗████╗  ██║                                      ║
 * ║   ██║  ██║███████║█████╗  ██╔████╔██║██║   ██║██╔██╗ ██║                                      ║
 * ║   ██║  ██║██╔══██║██╔══╝  ██║╚██╔╝██║██║   ██║██║╚██╗██║                                      ║
 * ║   ██████╔╝██║  ██║███████╗██║ ╚═╝ ██║╚██████╔╝██║ ╚████║                                      ║
 * ║   ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝                                      ║
 * ║                                                                                               ║
 * ║   🔥 БЕЗКРАЙНА АВТОМАТИЗАЦИЯ - ВСИЧКИ СКРИПТОВЕ В ЕДИН ОРГАНИЗЪМ 🔥                          ║
 * ║                                                                                               ║
 * ║   Свързва:                                                                                    ║
 * ║   ├── neural-core-magnet.ts    → 🧠 Neural Core (5 min cycles)                                ║
 * ║   ├── eternal-watchdog.js      → 🛡️ Eternal Patrol (continuous)                              ║
 * ║   ├── unified-guardian.js      → 🔮 Self-Healing (10 sec cycles)                             ║
 * ║   ├── auto-sync-daemon.js      → 🔄 Git Auto-Sync (60 sec cycles)                            ║
 * ║   ├── supreme-meditation.ts    → 🧘 Deep Analysis (on demand)                                ║
 * ║   ├── autonomous-thought.ts    → 💭 Autonomous Thought (hourly)                              ║
 * ║   ├── auto-documenter.ts       → 📝 Documentation (on change)                                ║
 * ║   └── change-detector.ts       → 👁️ Change Detection (continuous)                           ║
 * ║                                                                                               ║
 * ║   Usage: npx ts-node scripts/supreme-daemon.ts                                                ║
 * ║          npx ts-node scripts/supreme-daemon.ts --no-meditation                                ║
 * ║          npx ts-node scripts/supreme-daemon.ts --aggressive (1 min cycles)                    ║
 * ║                                                                                               ║
 * ║   Created: 2026-01-02 | QAntum Empire v35.0 - THE SINGULARITY                                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { spawn, ChildProcess, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

interface DaemonConfig {
  name: string;
  script: string;
  type: 'js' | 'ts';
  mode: 'continuous' | 'interval' | 'oneshot';
  interval?: number;  // ms for interval mode
  args?: string[];
  priority: number;   // 1 = highest
  enabled: boolean;
  description: string;
}

const SCRIPTS_PATH = 'C:\\MisteMind\\scripts';
const DATA_PATH = 'C:\\MisteMind\\data';
const LOG_PATH = path.join(DATA_PATH, 'supreme-daemon.json');

const args = process.argv.slice(2);
const isAggressive = args.includes('--aggressive');
const noMeditation = args.includes('--no-meditation');
const isDryRun = args.includes('--dry-run');

// ═══════════════════════════════════════════════════════════════════════════════
// DAEMON REGISTRY - ALL AUTOMATION SCRIPTS
// ═══════════════════════════════════════════════════════════════════════════════

const DAEMONS: DaemonConfig[] = [
  // 🧠 NEURAL CORE - Събира всичко в едно
  {
    name: 'NeuralCoreMagnet',
    script: 'neural-core-magnet.ts',
    type: 'ts',
    mode: 'interval',
    interval: isAggressive ? 60_000 : 300_000, // 1 min or 5 min
    args: ['--auto-commit'],
    priority: 1,
    enabled: true,
    description: 'Събира всичката информация в Neural Core'
  },
  
  // 🛡️ ETERNAL WATCHDOG - Безкраен патрул
  {
    name: 'EternalWatchdog',
    script: 'eternal-watchdog.js',
    type: 'js',
    mode: 'continuous',
    priority: 2,
    enabled: true,
    description: 'Патрулира и неутрализира заплахи'
  },
  
  // 🔮 UNIFIED GUARDIAN - Self-Healing
  {
    name: 'UnifiedGuardian',
    script: 'unified-guardian.js',
    type: 'js',
    mode: 'continuous',
    args: ['--watch'],
    priority: 3,
    enabled: true,
    description: 'Self-healing код guardian'
  },
  
  // 🔄 AUTO SYNC - Git автоматизация
  {
    name: 'AutoSyncDaemon',
    script: 'auto-sync-daemon.js',
    type: 'js',
    mode: 'continuous',
    priority: 4,
    enabled: true,
    description: 'Автоматичен git commit/sync'
  },
  
  // 👁️ CHANGE DETECTOR - Следи за промени
  {
    name: 'ChangeDetector',
    script: 'change-detector.ts',
    type: 'ts',
    mode: 'continuous',
    args: ['--watch'],
    priority: 5,
    enabled: fs.existsSync(path.join(SCRIPTS_PATH, 'change-detector.ts')),
    description: 'Детектира промени в реално време'
  },
  
  // 📝 AUTO DOCUMENTER - Автоматична документация
  {
    name: 'AutoDocumenter',
    script: 'auto-documenter.ts',
    type: 'ts',
    mode: 'continuous',
    args: ['--watch'],
    priority: 6,
    enabled: fs.existsSync(path.join(SCRIPTS_PATH, 'auto-documenter.ts')),
    description: 'Автоматична документация при промени'
  },
  
  // 🧘 SUPREME MEDITATION - Дълбок анализ
  {
    name: 'SupremeMeditation',
    script: 'supreme-meditation.ts',
    type: 'ts',
    mode: 'interval',
    interval: isAggressive ? 600_000 : 3600_000, // 10 min or 1 hour
    priority: 7,
    enabled: !noMeditation,
    description: 'Дълбока медитация върху кода'
  },
  
  // 💭 AUTONOMOUS THOUGHT - Автономна мисъл
  {
    name: 'AutonomousThought',
    script: 'autonomous-thought.ts',
    type: 'ts',
    mode: 'interval',
    interval: 3600_000, // Every hour
    priority: 8,
    enabled: true,
    description: 'Автономни мисли и insights'
  },
  
  // 🌐 COMMAND CENTER SERVER
  {
    name: 'CommandCenter',
    script: 'command-center-server.js',
    type: 'js',
    mode: 'continuous',
    priority: 9,
    enabled: true,
    description: 'HTTP Dashboard сървър на порт 3400'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// SUPREME DAEMON CLASS
// ═══════════════════════════════════════════════════════════════════════════════

interface ProcessInfo {
  process: ChildProcess | null;
  status: 'running' | 'stopped' | 'error' | 'scheduled';
  lastRun: Date | null;
  nextRun: Date | null;
  runs: number;
  errors: number;
  pid?: number;
}

class SupremeDaemon {
  private processes: Map<string, ProcessInfo> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private log: Array<{ time: string; event: string; daemon: string; details?: string }> = [];
  private startTime: Date = new Date();
  private isShuttingDown: boolean = false;

  constructor() {
    this.setupShutdownHandlers();
    this.loadLog();
  }

  private loadLog(): void {
    try {
      if (fs.existsSync(LOG_PATH)) {
        const data = JSON.parse(fs.readFileSync(LOG_PATH, 'utf-8'));
        this.log = data.log || [];
      }
    } catch { /* ignore */ }
  }

  private saveLog(): void {
    const summary = {
      lastUpdate: new Date().toISOString(),
      uptime: this.getUptime(),
      daemons: Array.from(this.processes.entries()).map(([name, info]) => ({
        name,
        status: info.status,
        runs: info.runs,
        errors: info.errors,
        pid: info.pid
      })),
      log: this.log.slice(-100) // Keep last 100 entries
    };
    fs.writeFileSync(LOG_PATH, JSON.stringify(summary, null, 2));
  }

  private logEvent(event: string, daemon: string, details?: string): void {
    const entry = {
      time: new Date().toISOString(),
      event,
      daemon,
      details
    };
    this.log.push(entry);
    console.log(`[${entry.time}] ${event}: ${daemon}${details ? ` - ${details}` : ''}`);
    this.saveLog();
  }

  private getUptime(): string {
    const ms = Date.now() - this.startTime.getTime();
    const hours = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${hours}h ${mins}m ${secs}s`;
  }

  private setupShutdownHandlers(): void {
    const shutdown = async (signal: string) => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      
      console.log(`\n⚠️  Получен сигнал ${signal}. Спиране на всички daemon-и...`);
      
      // Stop all timers
      for (const [name, timer] of this.timers) {
        clearInterval(timer);
        this.logEvent('TIMER_STOPPED', name);
      }
      
      // Kill all processes
      for (const [name, info] of this.processes) {
        if (info.process && !info.process.killed) {
          info.process.kill('SIGTERM');
          this.logEvent('DAEMON_STOPPED', name, `PID: ${info.pid}`);
        }
      }
      
      console.log('✅ Всички daemon-и са спрени. Довиждане!');
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('uncaughtException', (err) => {
      this.logEvent('UNCAUGHT_ERROR', 'SYSTEM', err.message);
      console.error('❌ Uncaught Exception:', err);
    });
  }

  private getRunner(type: 'js' | 'ts'): { cmd: string; args: string[] } {
    if (type === 'ts') {
      return { cmd: 'npx', args: ['ts-node'] };
    }
    return { cmd: 'node', args: [] };
  }

  private startContinuousDaemon(config: DaemonConfig): void {
    const scriptPath = path.join(SCRIPTS_PATH, config.script);
    
    if (!fs.existsSync(scriptPath)) {
      this.logEvent('SCRIPT_NOT_FOUND', config.name, scriptPath);
      return;
    }

    const runner = this.getRunner(config.type);
    const allArgs = [...runner.args, scriptPath, ...(config.args || [])];

    if (isDryRun) {
      console.log(`[DRY-RUN] Would start: ${runner.cmd} ${allArgs.join(' ')}`);
      return;
    }

    const proc = spawn(runner.cmd, allArgs, {
      cwd: SCRIPTS_PATH,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });

    const info: ProcessInfo = {
      process: proc,
      status: 'running',
      lastRun: new Date(),
      nextRun: null,
      runs: 1,
      errors: 0,
      pid: proc.pid
    };

    this.processes.set(config.name, info);
    this.logEvent('DAEMON_STARTED', config.name, `PID: ${proc.pid}`);

    proc.stdout?.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      lines.forEach((line: string) => {
        if (line.includes('Error') || line.includes('error')) {
          console.log(`[${config.name}] ⚠️  ${line}`);
        }
      });
    });

    proc.stderr?.on('data', (data) => {
      console.error(`[${config.name}] ❌ ${data.toString().trim()}`);
      info.errors++;
    });

    proc.on('close', (code) => {
      if (!this.isShuttingDown) {
        this.logEvent('DAEMON_EXITED', config.name, `Code: ${code}`);
        info.status = code === 0 ? 'stopped' : 'error';
        
        // Auto-restart on crash
        if (code !== 0 && info.errors < 5) {
          console.log(`🔄 Auto-restarting ${config.name} in 5 seconds...`);
          setTimeout(() => this.startContinuousDaemon(config), 5000);
        }
      }
    });
  }

  private startIntervalDaemon(config: DaemonConfig): void {
    const scriptPath = path.join(SCRIPTS_PATH, config.script);
    
    if (!fs.existsSync(scriptPath)) {
      this.logEvent('SCRIPT_NOT_FOUND', config.name, scriptPath);
      return;
    }

    const runner = this.getRunner(config.type);
    const allArgs = [...runner.args, scriptPath, ...(config.args || [])];

    const runOnce = () => {
      if (this.isShuttingDown) return;

      const info = this.processes.get(config.name) || {
        process: null,
        status: 'scheduled',
        lastRun: null,
        nextRun: null,
        runs: 0,
        errors: 0
      };

      if (isDryRun) {
        console.log(`[DRY-RUN] Would run: ${runner.cmd} ${allArgs.join(' ')}`);
        return;
      }

      info.lastRun = new Date();
      info.nextRun = new Date(Date.now() + (config.interval || 60000));
      info.runs++;
      info.status = 'running';

      this.logEvent('DAEMON_RUN', config.name, `Run #${info.runs}`);

      const proc = spawn(runner.cmd, allArgs, {
        cwd: SCRIPTS_PATH,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      });

      info.process = proc;
      info.pid = proc.pid;
      this.processes.set(config.name, info);

      proc.on('close', (code) => {
        if (code === 0) {
          info.status = 'scheduled';
        } else {
          info.status = 'error';
          info.errors++;
        }
        this.logEvent('DAEMON_COMPLETED', config.name, `Code: ${code}`);
      });
    };

    // Run immediately, then on interval
    runOnce();
    const timer = setInterval(runOnce, config.interval || 60000);
    this.timers.set(config.name, timer);

    const intervalMin = ((config.interval || 60000) / 60000).toFixed(1);
    this.logEvent('TIMER_STARTED', config.name, `Every ${intervalMin} minutes`);
  }

  public async start(): Promise<void> {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                               ║
║   ███████╗██╗   ██╗██████╗ ██████╗ ███████╗███╗   ███╗███████╗    ██████╗  █████╗ ███████╗   ║
║   ██╔════╝██║   ██║██╔══██╗██╔══██╗██╔════╝████╗ ████║██╔════╝    ██╔══██╗██╔══██╗██╔════╝   ║
║   ███████╗██║   ██║██████╔╝██████╔╝█████╗  ██╔████╔██║█████╗      ██║  ██║███████║█████╗     ║
║   ╚════██║██║   ██║██╔═══╝ ██╔══██╗██╔══╝  ██║╚██╔╝██║██╔══╝      ██║  ██║██╔══██║██╔══╝     ║
║   ███████║╚██████╔╝██║     ██║  ██║███████╗██║ ╚═╝ ██║███████╗    ██████╔╝██║  ██║███████╗   ║
║   ╚══════╝ ╚═════╝ ╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝   ║
║                                                                                               ║
║   🔥 БЕЗКРАЙНА АВТОМАТИЗАЦИЯ НА QAntum ИМПЕРИЯТА 🔥                                          ║
║                                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
`);

    console.log(`📅 Стартирано: ${this.startTime.toISOString()}`);
    console.log(`⚡ Режим: ${isAggressive ? 'АГРЕСИВЕН (бързи цикли)' : 'НОРМАЛЕН'}`);
    console.log(`🧘 Медитация: ${noMeditation ? 'ИЗКЛЮЧЕНА' : 'ВКЛЮЧЕНА'}`);
    console.log(`💾 Log: ${LOG_PATH}`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('   DAEMON                    │ MODE        │ INTERVAL    │ STATUS');
    console.log('═══════════════════════════════════════════════════════════════════════════════');

    // Sort by priority
    const enabledDaemons = DAEMONS.filter(d => d.enabled).sort((a, b) => a.priority - b.priority);

    for (const daemon of enabledDaemons) {
      const mode = daemon.mode.toUpperCase().padEnd(11);
      const interval = daemon.mode === 'interval' 
        ? `${((daemon.interval || 0) / 60000).toFixed(0)} min`.padEnd(11)
        : '-'.padEnd(11);

      console.log(`   ${daemon.name.padEnd(24)} │ ${mode} │ ${interval} │ STARTING...`);

      if (daemon.mode === 'continuous') {
        this.startContinuousDaemon(daemon);
      } else if (daemon.mode === 'interval') {
        this.startIntervalDaemon(daemon);
      }

      // Stagger starts by 1 second
      await new Promise(r => setTimeout(r, 1000));
    }

    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('✅ Всички daemon-и са стартирани!');
    console.log('');
    console.log('📊 За статус: вижте ' + LOG_PATH);
    console.log('🛑 За спиране: натисни Ctrl+C');
    console.log('');
    console.log('🔄 Daemon-ите работят в безкрайни цикли...');
    console.log('');

    // Status update every 5 minutes
    setInterval(() => {
      if (!this.isShuttingDown) {
        console.log(`\n📊 [${new Date().toISOString()}] Uptime: ${this.getUptime()}`);
        console.log('   Active daemons:');
        for (const [name, info] of this.processes) {
          const status = info.status === 'running' ? '🟢' : info.status === 'scheduled' ? '🟡' : '🔴';
          console.log(`   ${status} ${name}: ${info.runs} runs, ${info.errors} errors`);
        }
      }
    }, 300_000); // Every 5 min
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

const daemon = new SupremeDaemon();
daemon.start().catch(console.error);
