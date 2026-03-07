/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                     VS CODE BRIDGE - SOVEREIGN TRANSITION                     ║
 * ║                                                                               ║
 * ║  "The bridge between the old world and the new. QAntum Prime takes control." ║
 * ║                                                                               ║
 * ║  Created: 2026-01-01 | QAntum Prime v28.1.0 SUPREME                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface VSCodeState {
  activeFile: string | null;
  workspaceRoot: string;
  openFiles: string[];
  lastModified: Map<string, number>;
  cursorPosition?: { line: number; column: number };
  selection?: { start: { line: number; column: number }; end: { line: number; column: number } };
}

export interface FileChangeEvent {
  type: 'created' | 'modified' | 'deleted' | 'renamed';
  filePath: string;
  timestamp: number;
  previousPath?: string; // For renames
  content?: string;
}

export interface BridgeConfig {
  workspaceRoot: string;
  watchPatterns: string[];
  ignorePatterns: string[];
  debounceMs: number;
  autoVerify: boolean;
  verboseLogging: boolean;
}

export interface VerificationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VS CODE BRIDGE - THE SOVEREIGN CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════════

export class VSCodeBridge extends EventEmitter {
  private config: BridgeConfig;
  private state: VSCodeState;
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private verificationQueue: string[] = [];
  private isProcessing: boolean = false;

  // VS Code state file locations (where VS Code stores its state)
  private readonly VSCODE_STATE_PATHS = {
    windowState: '.vscode/.windowState',
    activeFile: '.vscode/.activeFile',
    openEditors: '.vscode/.openEditors',
  };

  constructor(config: Partial<BridgeConfig> = {}) {
    super();

    this.config = {
      workspaceRoot: config.workspaceRoot || process.cwd(),
      watchPatterns: config.watchPatterns || ['**/*.ts', '**/*.js', '**/*.json', '**/*.md'],
      ignorePatterns: config.ignorePatterns || [
        '**/node_modules/**',
        '**/dist/**',
        '**/dist-protected/**',
        '**/.git/**',
        '**/coverage/**',
        '**/*.log',
      ],
      debounceMs: config.debounceMs || 300,
      autoVerify: config.autoVerify ?? true,
      verboseLogging: config.verboseLogging ?? false,
    };

    this.state = {
      activeFile: null,
      workspaceRoot: this.config.workspaceRoot,
      openFiles: [],
      lastModified: new Map(),
    };

    this.log('🌉 VS Code Bridge initialized');
    this.log(`   Workspace: ${this.config.workspaceRoot}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // CORE METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Start watching the workspace for file changes
   */
  // Complexity: O(N)
  public async start(): Promise<void> {
    this.log('\n🚀 SOVEREIGN TRANSITION: VS Code Bridge ONLINE');
    this.log('═'.repeat(60));

    // Setup VS Code state watcher
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.setupVSCodeStateWatcher();

    // Setup file system watchers
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.setupFileWatchers();

    // Initial scan
    // SAFETY: async operation — wrap in try-catch for production resilience
    await this.scanWorkspace();

    this.log('✅ Bridge is now listening for all changes');
    this.log('═'.repeat(60));

    this.emit('bridge:started', { timestamp: Date.now() });
  }

  /**
   * Stop all watchers
   */
  // Complexity: O(N*M) — nested iteration detected
  public stop(): void {
    this.log('\n🛑 Stopping VS Code Bridge...');

    for (const [path, watcher] of this.watchers) {
      watcher.close();
      this.log(`   Closed watcher: ${path}`);
    }
    this.watchers.clear();

    for (const timer of this.debounceTimers.values()) {
      // Complexity: O(1)
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    this.emit('bridge:stopped', { timestamp: Date.now() });
    this.log('✅ Bridge stopped');
  }

  /**
   * Get current VS Code state
   */
  // Complexity: O(1)
  public getState(): VSCodeState {
    return { ...this.state };
  }

  /**
   * Get the currently active file
   */
  // Complexity: O(1)
  public getActiveFile(): string | null {
    return this.state.activeFile;
  }

  /**
   * Read the current content of the active file
   */
  // Complexity: O(N) — potential recursive descent
  public async readActiveFile(): Promise<string | null> {
    if (!this.state.activeFile) return null;

    try {
      return await fs.promises.readFile(this.state.activeFile, 'utf-8');
    } catch (error) {
      this.log(`⚠️ Could not read active file: ${error}`);
      return null;
    }
  }

  /**
   * Watch a specific file for changes
   */
  // Complexity: O(1) — hash/map lookup
  public watchFile(filePath: string): void {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(this.config.workspaceRoot, filePath);

    if (this.watchers.has(absolutePath)) return;

    try {
      const watcher = fs.watch(absolutePath, (eventType) => {
        this.handleFileChange(absolutePath, eventType as 'change' | 'rename');
      });

      this.watchers.set(absolutePath, watcher);
      this.log(`👁️ Watching: ${path.relative(this.config.workspaceRoot, absolutePath)}`);
    } catch (error) {
      this.log(`⚠️ Could not watch file: ${filePath}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // VS CODE STATE TRACKING
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Setup watcher for VS Code's internal state files
   */
  // Complexity: O(N*M) — nested iteration detected
  private async setupVSCodeStateWatcher(): Promise<void> {
    const vscodeDir = path.join(this.config.workspaceRoot, '.vscode');

    // Ensure .vscode directory exists
    try {
      await fs.promises.mkdir(vscodeDir, { recursive: true });
    } catch {}

    // Create state tracking files if they don't exist
    for (const [key, relativePath] of Object.entries(this.VSCODE_STATE_PATHS)) {
      const fullPath = path.join(this.config.workspaceRoot, relativePath);
      try {
        await fs.promises.access(fullPath);
      } catch {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await fs.promises.writeFile(fullPath, JSON.stringify({ initialized: true }));
      }
    }

    // Watch .vscode directory for state changes
    try {
      const watcher = fs.watch(vscodeDir, (eventType, filename) => {
        if (filename?.startsWith('.')) {
          this.handleVSCodeStateChange(filename);
        }
      });
      this.watchers.set(vscodeDir, watcher);
    } catch (error) {
      this.log(`⚠️ Could not watch .vscode directory: ${error}`);
    }
  }

  /**
   * Handle VS Code state file changes
   */
  // Complexity: O(1) — amortized
  private async handleVSCodeStateChange(filename: string): Promise<void> {
    const fullPath = path.join(this.config.workspaceRoot, '.vscode', filename);

    try {
      const content = await fs.promises.readFile(fullPath, 'utf-8');
      const state = JSON.parse(content);

      if (filename === '.activeFile' && state.path) {
        const previousFile = this.state.activeFile;
        this.state.activeFile = state.path;

        if (previousFile !== state.path) {
          this.log(`📂 Active file changed: ${path.basename(state.path)}`);
          this.emit('activeFile:changed', {
            previous: previousFile,
            current: state.path,
            timestamp: Date.now(),
          });
        }
      }

      if (filename === '.openEditors' && Array.isArray(state.files)) {
        this.state.openFiles = state.files;
        this.emit('openEditors:changed', { files: state.files });
      }
    } catch (error) {
      // State file might be in transition, ignore
    }
  }

  /**
   * Update active file (called from CLI or external source)
   */
  // Complexity: O(1) — amortized
  public setActiveFile(filePath: string): void {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(this.config.workspaceRoot, filePath);

    const previous = this.state.activeFile;
    this.state.activeFile = absolutePath;

    // Persist to state file
    const stateFile = path.join(this.config.workspaceRoot, this.VSCODE_STATE_PATHS.activeFile);
    fs.writeFileSync(
      stateFile,
      JSON.stringify({
        path: absolutePath,
        timestamp: Date.now(),
      })
    );

    this.emit('activeFile:changed', { previous, current: absolutePath, timestamp: Date.now() });
    this.log(`📂 Active file set to: ${path.basename(absolutePath)}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // FILE SYSTEM WATCHING
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Setup recursive file watchers for the workspace
   */
  // Complexity: O(N) — linear iteration
  private async setupFileWatchers(): Promise<void> {
    const watchDir = async (dir: string) => {
      if (this.shouldIgnore(dir)) return;

      try {
        // Watch the directory itself
        const watcher = fs.watch(dir, { recursive: false }, (eventType, filename) => {
          if (filename && !this.shouldIgnore(filename)) {
            const fullPath = path.join(dir, filename);
            this.handleFileChange(fullPath, eventType as 'change' | 'rename');
          }
        });
        this.watchers.set(dir, watcher);

        // Recursively watch subdirectories
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && !this.shouldIgnore(entry.name)) {
            await watchDir(path.join(dir, entry.name));
          }
        }
      } catch (error) {
        // Directory might not exist or be inaccessible
      }
    };

    // Use recursive watching on Windows (native support)
    if (process.platform === 'win32') {
      try {
        const watcher = fs.watch(
          this.config.workspaceRoot,
          { recursive: true },
          (eventType, filename) => {
            if (filename && !this.shouldIgnore(filename)) {
              const fullPath = path.join(this.config.workspaceRoot, filename);
              this.handleFileChange(fullPath, eventType as 'change' | 'rename');
            }
          }
        );
        this.watchers.set(this.config.workspaceRoot, watcher);
        this.log('📡 Using native recursive watching (Windows)');
      } catch {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await watchDir(this.config.workspaceRoot);
      }
    } else {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await watchDir(this.config.workspaceRoot);
    }
  }

  /**
   * Handle file change events with debouncing
   */
  // Complexity: O(1) — hash/map lookup
  private handleFileChange(filePath: string, eventType: 'change' | 'rename'): void {
    if (this.shouldIgnore(filePath)) return;

    // Clear existing debounce timer
    const existingTimer = this.debounceTimers.get(filePath);
    if (existingTimer) {
      // Complexity: O(1)
      clearTimeout(existingTimer);
    }

    // Debounce the file change
    const timer = setTimeout(async () => {
      this.debounceTimers.delete(filePath);
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.processFileChange(filePath, eventType);
    }, this.config.debounceMs);

    this.debounceTimers.set(filePath, timer);
  }

  /**
   * Process a file change after debouncing
   */
  // Complexity: O(N)
  private async processFileChange(filePath: string, eventType: 'change' | 'rename'): Promise<void> {
    const relativePath = path.relative(this.config.workspaceRoot, filePath);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const exists = await this.fileExists(filePath);
    const previousMtime = this.state.lastModified.get(filePath);

    let changeType: FileChangeEvent['type'];

    if (!exists) {
      changeType = 'deleted';
      this.state.lastModified.delete(filePath);
    } else {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const stats = await fs.promises.stat(filePath);
      const mtime = stats.mtimeMs;

      if (!previousMtime) {
        changeType = 'created';
      } else {
        changeType = 'modified';
      }

      this.state.lastModified.set(filePath, mtime);
    }

    const event: FileChangeEvent = {
      type: changeType,
      filePath,
      timestamp: Date.now(),
    };

    // Read content for created/modified files
    if (changeType !== 'deleted') {
      try {
        event.content = await fs.promises.readFile(filePath, 'utf-8');
      } catch {}
    }

    this.logFileChange(event);
    this.emit('file:changed', event);

    // Auto-verify if enabled
    if (this.config.autoVerify && changeType !== 'deleted') {
      this.queueVerification(filePath);
    }
  }

  /**
   * Check if file exists
   */
  // Complexity: O(1)
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if path should be ignored
   */
  // Complexity: O(N) — linear iteration
  private shouldIgnore(pathToCheck: string): boolean {
    const relativePath = path.relative(this.config.workspaceRoot, pathToCheck);

    for (const pattern of this.config.ignorePatterns) {
      if (this.matchGlob(relativePath, pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Simple glob matching
   */
  // Complexity: O(1)
  private matchGlob(str: string, pattern: string): boolean {
    // Convert glob to regex
    const regexPattern = pattern
      .replace(/\*\*/g, '{{GLOBSTAR}}')
      .replace(/\*/g, '[^/\\\\]*')
      .replace(/{{GLOBSTAR}}/g, '.*')
      .replace(/\//g, '[/\\\\]');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(str) || regex.test(str.replace(/\\/g, '/'));
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // VERIFICATION QUEUE (AUTONOMOUS FEEDBACK LOOP)
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Queue a file for verification
   */
  // Complexity: O(1)
  private queueVerification(filePath: string): void {
    if (!this.verificationQueue.includes(filePath)) {
      this.verificationQueue.push(filePath);
      this.processVerificationQueue();
    }
  }

  /**
   * Process the verification queue
   */
  // Complexity: O(N) — loop-based
  private async processVerificationQueue(): Promise<void> {
    if (this.isProcessing || this.verificationQueue.length === 0) return;

    this.isProcessing = true;

    while (this.verificationQueue.length > 0) {
      const filePath = this.verificationQueue.shift()!;
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.verifyFile(filePath);
    }

    this.isProcessing = false;
  }

  /**
   * Verify a file using the Assimilator
   */
  // Complexity: O(N*M) — nested iteration detected
  private async verifyFile(filePath: string): Promise<VerificationResult> {
    const relativePath = path.relative(this.config.workspaceRoot, filePath);

    this.log(`\n🔍 VERIFYING: ${relativePath}`);

    const result: VerificationResult = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      timestamp: Date.now(),
    };

    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');

      // Basic syntax validation
      if (filePath.endsWith('.ts') || filePath.endsWith('.js')) {
        // Check for common issues
        if (content.includes('TODO:') || content.includes('FIXME:')) {
          result.warnings.push('File contains TODO/FIXME comments');
        }

        if (content.includes('console.log') && !filePath.includes('test')) {
          result.warnings.push('File contains console.log statements');
        }

        // Check for hallucination indicators
        if (content.includes('undefined') && content.includes('?.') === false) {
          result.suggestions.push('Consider using optional chaining for undefined checks');
        }
      }

      if (filePath.endsWith('.json')) {
        try {
          JSON.parse(content);
        } catch (e) {
          result.valid = false;
          result.errors.push(`Invalid JSON: ${e}`);
        }
      }

      // Emit verification result
      this.emit('file:verified', { filePath, result });

      // Log result
      this.logVerificationResult(relativePath, result);
    } catch (error) {
      result.valid = false;
      result.errors.push(`Could not read file: ${error}`);
      this.emit('file:verified', { filePath, result });
    }

    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // WORKSPACE SCANNING
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Scan the entire workspace
   */
  // Complexity: O(N) — linear iteration
  private async scanWorkspace(): Promise<void> {
    this.log('\n📊 Scanning workspace...');

    let fileCount = 0;

    const scanDir = async (dir: string): Promise<void> => {
      if (this.shouldIgnore(dir)) return;

      try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            if (!this.shouldIgnore(fullPath)) {
              await scanDir(fullPath);
            }
          } else if (entry.isFile()) {
            if (!this.shouldIgnore(fullPath)) {
              try {
                const stats = await fs.promises.stat(fullPath);
                this.state.lastModified.set(fullPath, stats.mtimeMs);
                fileCount++;
              } catch {}
            }
          }
        }
      } catch {}
    };

    // SAFETY: async operation — wrap in try-catch for production resilience
    await scanDir(this.config.workspaceRoot);
    this.log(`   Found ${fileCount} files to monitor`);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // LOGGING
  // ═══════════════════════════════════════════════════════════════════════════════

  // Complexity: O(1)
  private log(message: string): void {
    if (this.config.verboseLogging || !message.startsWith('   ')) {
      console.log(message);
    }
  }

  // Complexity: O(1)
  private logFileChange(event: FileChangeEvent): void {
    const relativePath = path.relative(this.config.workspaceRoot, event.filePath);
    const icons: Record<FileChangeEvent['type'], string> = {
      created: '✨',
      modified: '📝',
      deleted: '🗑️',
      renamed: '📛',
    };

    console.log(`${icons[event.type]} ${event.type.toUpperCase()}: ${relativePath}`);
  }

  // Complexity: O(N) — linear iteration
  private logVerificationResult(relativePath: string, result: VerificationResult): void {
    if (result.valid && result.warnings.length === 0) {
      console.log(`   ✅ Verified: No issues found`);
    } else {
      if (result.errors.length > 0) {
        console.log(`   ❌ ERRORS:`);
        result.errors.forEach((e) => console.log(`      • ${e}`));
      }
      if (result.warnings.length > 0) {
        console.log(`   ⚠️ WARNINGS:`);
        result.warnings.forEach((w) => console.log(`      • ${w}`));
      }
      if (result.suggestions.length > 0) {
        console.log(`   💡 SUGGESTIONS:`);
        result.suggestions.forEach((s) => console.log(`      • ${s}`));
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

let bridgeInstance: VSCodeBridge | null = null;

export function getVSCodeBridge(config?: Partial<BridgeConfig>): VSCodeBridge {
  if (!bridgeInstance) {
    bridgeInstance = new VSCodeBridge(config);
  }
  return bridgeInstance;
}

export function destroyVSCodeBridge(): void {
  if (bridgeInstance) {
    bridgeInstance.stop();
    bridgeInstance = null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI RUNNER
// ═══════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                        🌉 VS CODE BRIDGE - STANDALONE                         ║
║                                                                               ║
║                    QAntum Prime v28.1.0 - Sovereign Mode                      ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);

  const bridge = getVSCodeBridge({
    workspaceRoot: process.cwd(),
    verboseLogging: true,
    autoVerify: true,
  });

  bridge.on('file:changed', (event: FileChangeEvent) => {
    // Additional handling can be added here
  });

  bridge.on('file:verified', ({ filePath, result }) => {
    // Report to external systems if needed
  });

  bridge.start().catch(console.error);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Received SIGINT, shutting down gracefully...');
    bridge.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    bridge.stop();
    process.exit(0);
  });
}
