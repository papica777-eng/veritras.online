#!/usr/bin/env tsx
"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoWatcher = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
const vector_sync_js_1 = require("./vector-sync.js");
// ═══════════════════════════════════════════════════════════════════════════════
// AUTO WATCHER
// ═══════════════════════════════════════════════════════════════════════════════
class AutoWatcher extends events_1.EventEmitter {
    config;
    syncEngine;
    pendingChanges = new Map();
    batchTimer = null;
    watchers = [];
    isRunning = false;
    stats = {
        filesWatched: 0,
        changesDetected: 0,
        syncOperations: 0,
        lastSync: 0,
    };
    constructor(config = {}) {
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
        this.syncEngine = new vector_sync_js_1.VectorSyncEngine();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // START WATCHING
    // ═══════════════════════════════════════════════════════════════════════════
    async start() {
        if (this.isRunning)
            return;
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
    async watchDirectory(dir) {
        try {
            const watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
                if (!filename)
                    return;
                const fullPath = path.join(dir, filename);
                this.handleFileEvent(eventType, fullPath);
            });
            this.watchers.push(watcher);
            this.stats.filesWatched++;
        }
        catch (err) {
            // Directory might not exist or be inaccessible
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // FILE EVENT HANDLING
    // ═══════════════════════════════════════════════════════════════════════════
    handleFileEvent(eventType, filePath) {
        // Check if file should be watched
        if (!this.shouldWatch(filePath))
            return;
        const exists = fs.existsSync(filePath);
        const changeType = eventType === 'rename' && !exists ? 'unlink' :
            eventType === 'rename' && exists ? 'add' : 'change';
        const change = {
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
    shouldWatch(filePath) {
        // Check extension
        const ext = path.extname(filePath).toLowerCase();
        if (!this.config.extensions.includes(ext))
            return false;
        // Check excluded directories
        const normalizedPath = filePath.replace(/\\/g, '/');
        for (const excluded of this.config.excludeDirs) {
            if (normalizedPath.includes(`/${excluded}/`))
                return false;
        }
        return true;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // BATCH SYNC
    // ═══════════════════════════════════════════════════════════════════════════
    scheduleBatchSync() {
        // Clear existing timer
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
        }
        // Schedule new batch
        this.batchTimer = setTimeout(() => this.processBatch(), this.config.batchIntervalMs);
    }
    async processBatch() {
        if (this.pendingChanges.size === 0)
            return;
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
        }
        catch (err) {
            this.log(`❌ Sync error: ${err.message}\n`);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // STOP
    // ═══════════════════════════════════════════════════════════════════════════
    stop() {
        if (!this.isRunning)
            return;
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
    log(message) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        console.log(`[${timestamp}] ${message}`);
    }
}
exports.AutoWatcher = AutoWatcher;
// ═══════════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
    const watcher = new AutoWatcher();
    await watcher.start();
}
main().catch(console.error);
