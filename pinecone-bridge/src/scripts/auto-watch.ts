#!/usr/bin/env tsx
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM AUTO-WATCH v1.0 - FILE SYSTEM WATCHER FOR AUTO VECTORIZATION         ║
 * ║   "Real-Time Vector Sync. Zero Manual Effort."                                ║
 * ║                                                                               ║
 * ║   Следи файловата система и автоматично синхронизира промените към Pinecone   ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum Empire | Dimitar Prodromov                               ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import { VectorSyncEngine } from './vector-sync.js';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface WatchConfig {
  projectRoot: string;
  projects: string[];
  extensions: string[];
  excludeDirs: string[];
  debounceMs: number;
  batchIntervalMs: number;
}

interface FileChange {
  type: 'add' | 'change' | 'unlink';
  path: string;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO WATCHER
// ═══════════════════════════════════════════════════════════════════════════════

class AutoWatcher extends EventEmitter {
  private config: WatchConfig;
  private syncEngine: VectorSyncEngine;
  private pendingChanges: Map<string, FileChange> = new Map();
  private batchTimer: NodeJS.Timeout | null = null;
  private watchers: fs.FSWatcher[] = [];
  private isRunning = false;
  private stats = {
    filesWatched: 0,
    changesDetected: 0,
    syncOperations: 0,
    lastSync: 0,
  };

  constructor(config: Partial<WatchConfig> = {}) {
    super();
    this.config = {
      projectRoot: 'C:/MisteMind',
      projects: ['MisteMind', 'MrMindQATool', 'MisterMindPage', 'PROJECT'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.py', '.cs', '.json', '.md'],
      excludeDirs: ['node_modules', '.git', 'dist', 'build', '.next', '__pycache__'],
      debounceMs: 1000,
      batchIntervalMs: 5000,
      ...config,
    };
    this.syncEngine = new VectorSyncEngine();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // START WATCHING
  // ═══════════════════════════════════════════════════════════════════════════

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║       🔭 QANTUM AUTO-WATCH - REAL-TIME VECTOR SYNC              ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log('║  Watching for file changes and auto-syncing to Pinecone...      ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('');

    this.isRunning = true;

    for (const project of this.config.projects) {
      const projectPath = path.join(this.config.projectRoot, project);
      
      if (!fs.existsSync(projectPath)) {
        this.log(`⚠️ Project not found: ${project}`);
        continue;
      }

      await this.watchDirectory(projectPath);
    }

    this.log(`👁️ Watching ${this.stats.filesWatched} directories`);
    this.log('Press Ctrl+C to stop\n');

    // Handle graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  private async watchDirectory(dir: string): Promise<void> {
    try {
      const watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        
        const fullPath = path.join(dir, filename);
        this.handleFileEvent(eventType as 'rename' | 'change', fullPath);
      });

      this.watchers.push(watcher);
      this.stats.filesWatched++;
    } catch (err) {
      // Directory might not exist or be inaccessible
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FILE EVENT HANDLING
  // ═══════════════════════════════════════════════════════════════════════════

  private handleFileEvent(eventType: 'rename' | 'change', filePath: string): void {
    // Check if file should be watched
    if (!this.shouldWatch(filePath)) return;

    const exists = fs.existsSync(filePath);
    const changeType: 'add' | 'change' | 'unlink' = 
      eventType === 'rename' && !exists ? 'unlink' :
      eventType === 'rename' && exists ? 'add' : 'change';

    const change: FileChange = {
      type: changeType,
      path: filePath,
      timestamp: Date.now(),
    };

    // Debounce - only keep latest change per file
    this.pendingChanges.set(filePath, change);
    this.stats.changesDetected++;

    const relativePath = path.relative(this.config.projectRoot, filePath);
    const icon = changeType === 'add' ? '➕' : changeType === 'change' ? '🔄' : '🗑️';
    this.log(`${icon} ${changeType.toUpperCase()}: ${relativePath}`);

    // Schedule batch sync
    this.scheduleBatchSync();
  }

  private shouldWatch(filePath: string): boolean {
    // Check extension
    const ext = path.extname(filePath).toLowerCase();
    if (!this.config.extensions.includes(ext)) return false;

    // Check excluded directories
    const normalizedPath = filePath.replace(/\\/g, '/');
    for (const excluded of this.config.excludeDirs) {
      if (normalizedPath.includes(`/${excluded}/`)) return false;
    }

    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH SYNC
  // ═══════════════════════════════════════════════════════════════════════════

  private scheduleBatchSync(): void {
    // Clear existing timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    // Schedule new batch
    this.batchTimer = setTimeout(() => this.processBatch(), this.config.batchIntervalMs);
  }

  private async processBatch(): Promise<void> {
    if (this.pendingChanges.size === 0) return;

    const changes = Array.from(this.pendingChanges.values());
    this.pendingChanges.clear();

    this.log(`\n📦 Processing batch of ${changes.length} changes...`);

    const adds = changes.filter(c => c.type === 'add' || c.type === 'change');
    const deletes = changes.filter(c => c.type === 'unlink');

    if (adds.length > 0) {
      this.log(`   ➕ ${adds.length} files to sync`);
    }
    if (deletes.length > 0) {
      this.log(`   🗑️ ${deletes.length} files removed`);
    }

    try {
      // Run sync
      const result = await this.syncEngine.sync({
        addOnly: false,
        deleteOrphans: deletes.length > 0,
      });
      
      this.stats.syncOperations++;
      this.stats.lastSync = Date.now();
      
      this.log(`✅ Batch complete: +${result.added} ~${result.updated} -${result.deleted}\n`);
    } catch (err: any) {
      this.log(`❌ Sync error: ${err.message}\n`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STOP
  // ═══════════════════════════════════════════════════════════════════════════

  stop(): void {
    if (!this.isRunning) return;
    
    this.log('\n🛑 Stopping watcher...');
    
    // Clear timers
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    // Close all watchers
    for (const watcher of this.watchers) {
      watcher.close();
    }
    this.watchers = [];
    this.isRunning = false;

    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                    WATCH SESSION SUMMARY                         ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log(`║  📁 Directories watched:  ${this.stats.filesWatched.toString().padStart(6)}                             ║`);
    console.log(`║  👁️  Changes detected:     ${this.stats.changesDetected.toString().padStart(6)}                             ║`);
    console.log(`║  🔄 Sync operations:      ${this.stats.syncOperations.toString().padStart(6)}                             ║`);
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('');

    process.exit(0);
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${timestamp}] ${message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const watcher = new AutoWatcher();
  await watcher.start();
}

export { AutoWatcher };

main().catch(console.error);
