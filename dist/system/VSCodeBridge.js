"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                     VS CODE BRIDGE - SOVEREIGN TRANSITION                     ║
 * ║                                                                               ║
 * ║  "The bridge between the old world and the new. QAntum Prime takes control." ║
 * ║                                                                               ║
 * ║  Created: 2026-01-01 | QAntum Prime v28.1.0 SUPREME                          ║
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
exports.VSCodeBridge = void 0;
exports.getVSCodeBridge = getVSCodeBridge;
exports.destroyVSCodeBridge = destroyVSCodeBridge;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// VS CODE BRIDGE - THE SOVEREIGN CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════════
class VSCodeBridge extends events_1.EventEmitter {
    config;
    state;
    watchers = new Map();
    debounceTimers = new Map();
    verificationQueue = [];
    isProcessing = false;
    // VS Code state file locations (where VS Code stores its state)
    VSCODE_STATE_PATHS = {
        windowState: '.vscode/.windowState',
        activeFile: '.vscode/.activeFile',
        openEditors: '.vscode/.openEditors',
    };
    constructor(config = {}) {
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
                '**/*.log'
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
    async start() {
        this.log('\n🚀 SOVEREIGN TRANSITION: VS Code Bridge ONLINE');
        this.log('═'.repeat(60));
        // Setup VS Code state watcher
        await this.setupVSCodeStateWatcher();
        // Setup file system watchers
        await this.setupFileWatchers();
        // Initial scan
        await this.scanWorkspace();
        this.log('✅ Bridge is now listening for all changes');
        this.log('═'.repeat(60));
        this.emit('bridge:started', { timestamp: Date.now() });
    }
    /**
     * Stop all watchers
     */
    stop() {
        this.log('\n🛑 Stopping VS Code Bridge...');
        for (const [path, watcher] of this.watchers) {
            watcher.close();
            this.log(`   Closed watcher: ${path}`);
        }
        this.watchers.clear();
        for (const timer of this.debounceTimers.values()) {
            clearTimeout(timer);
        }
        this.debounceTimers.clear();
        this.emit('bridge:stopped', { timestamp: Date.now() });
        this.log('✅ Bridge stopped');
    }
    /**
     * Get current VS Code state
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Get the currently active file
     */
    getActiveFile() {
        return this.state.activeFile;
    }
    /**
     * Read the current content of the active file
     */
    async readActiveFile() {
        if (!this.state.activeFile)
            return null;
        try {
            return await fs.promises.readFile(this.state.activeFile, 'utf-8');
        }
        catch (error) {
            this.log(`⚠️ Could not read active file: ${error}`);
            return null;
        }
    }
    /**
     * Watch a specific file for changes
     */
    watchFile(filePath) {
        const absolutePath = path.isAbsolute(filePath)
            ? filePath
            : path.join(this.config.workspaceRoot, filePath);
        if (this.watchers.has(absolutePath))
            return;
        try {
            const watcher = fs.watch(absolutePath, (eventType) => {
                this.handleFileChange(absolutePath, eventType);
            });
            this.watchers.set(absolutePath, watcher);
            this.log(`👁️ Watching: ${path.relative(this.config.workspaceRoot, absolutePath)}`);
        }
        catch (error) {
            this.log(`⚠️ Could not watch file: ${filePath}`);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // VS CODE STATE TRACKING
    // ═══════════════════════════════════════════════════════════════════════════════
    /**
     * Setup watcher for VS Code's internal state files
     */
    async setupVSCodeStateWatcher() {
        const vscodeDir = path.join(this.config.workspaceRoot, '.vscode');
        // Ensure .vscode directory exists
        try {
            await fs.promises.mkdir(vscodeDir, { recursive: true });
        }
        catch { }
        // Create state tracking files if they don't exist
        for (const [key, relativePath] of Object.entries(this.VSCODE_STATE_PATHS)) {
            const fullPath = path.join(this.config.workspaceRoot, relativePath);
            try {
                await fs.promises.access(fullPath);
            }
            catch {
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
        }
        catch (error) {
            this.log(`⚠️ Could not watch .vscode directory: ${error}`);
        }
    }
    /**
     * Handle VS Code state file changes
     */
    async handleVSCodeStateChange(filename) {
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
                        timestamp: Date.now()
                    });
                }
            }
            if (filename === '.openEditors' && Array.isArray(state.files)) {
                this.state.openFiles = state.files;
                this.emit('openEditors:changed', { files: state.files });
            }
        }
        catch (error) {
            // State file might be in transition, ignore
        }
    }
    /**
     * Update active file (called from CLI or external source)
     */
    setActiveFile(filePath) {
        const absolutePath = path.isAbsolute(filePath)
            ? filePath
            : path.join(this.config.workspaceRoot, filePath);
        const previous = this.state.activeFile;
        this.state.activeFile = absolutePath;
        // Persist to state file
        const stateFile = path.join(this.config.workspaceRoot, this.VSCODE_STATE_PATHS.activeFile);
        fs.writeFileSync(stateFile, JSON.stringify({
            path: absolutePath,
            timestamp: Date.now()
        }));
        this.emit('activeFile:changed', { previous, current: absolutePath, timestamp: Date.now() });
        this.log(`📂 Active file set to: ${path.basename(absolutePath)}`);
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // FILE SYSTEM WATCHING
    // ═══════════════════════════════════════════════════════════════════════════════
    /**
     * Setup recursive file watchers for the workspace
     */
    async setupFileWatchers() {
        const watchDir = async (dir) => {
            if (this.shouldIgnore(dir))
                return;
            try {
                // Watch the directory itself
                const watcher = fs.watch(dir, { recursive: false }, (eventType, filename) => {
                    if (filename && !this.shouldIgnore(filename)) {
                        const fullPath = path.join(dir, filename);
                        this.handleFileChange(fullPath, eventType);
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
            }
            catch (error) {
                // Directory might not exist or be inaccessible
            }
        };
        // Use recursive watching on Windows (native support)
        if (process.platform === 'win32') {
            try {
                const watcher = fs.watch(this.config.workspaceRoot, { recursive: true }, (eventType, filename) => {
                    if (filename && !this.shouldIgnore(filename)) {
                        const fullPath = path.join(this.config.workspaceRoot, filename);
                        this.handleFileChange(fullPath, eventType);
                    }
                });
                this.watchers.set(this.config.workspaceRoot, watcher);
                this.log('📡 Using native recursive watching (Windows)');
            }
            catch {
                await watchDir(this.config.workspaceRoot);
            }
        }
        else {
            await watchDir(this.config.workspaceRoot);
        }
    }
    /**
     * Handle file change events with debouncing
     */
    handleFileChange(filePath, eventType) {
        if (this.shouldIgnore(filePath))
            return;
        // Clear existing debounce timer
        const existingTimer = this.debounceTimers.get(filePath);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }
        // Debounce the file change
        const timer = setTimeout(async () => {
            this.debounceTimers.delete(filePath);
            await this.processFileChange(filePath, eventType);
        }, this.config.debounceMs);
        this.debounceTimers.set(filePath, timer);
    }
    /**
     * Process a file change after debouncing
     */
    async processFileChange(filePath, eventType) {
        const relativePath = path.relative(this.config.workspaceRoot, filePath);
        const exists = await this.fileExists(filePath);
        const previousMtime = this.state.lastModified.get(filePath);
        let changeType;
        if (!exists) {
            changeType = 'deleted';
            this.state.lastModified.delete(filePath);
        }
        else {
            const stats = await fs.promises.stat(filePath);
            const mtime = stats.mtimeMs;
            if (!previousMtime) {
                changeType = 'created';
            }
            else {
                changeType = 'modified';
            }
            this.state.lastModified.set(filePath, mtime);
        }
        const event = {
            type: changeType,
            filePath,
            timestamp: Date.now(),
        };
        // Read content for created/modified files
        if (changeType !== 'deleted') {
            try {
                event.content = await fs.promises.readFile(filePath, 'utf-8');
            }
            catch { }
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
    async fileExists(filePath) {
        try {
            await fs.promises.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Check if path should be ignored
     */
    shouldIgnore(pathToCheck) {
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
    matchGlob(str, pattern) {
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
    queueVerification(filePath) {
        if (!this.verificationQueue.includes(filePath)) {
            this.verificationQueue.push(filePath);
            this.processVerificationQueue();
        }
    }
    /**
     * Process the verification queue
     */
    async processVerificationQueue() {
        if (this.isProcessing || this.verificationQueue.length === 0)
            return;
        this.isProcessing = true;
        while (this.verificationQueue.length > 0) {
            const filePath = this.verificationQueue.shift();
            await this.verifyFile(filePath);
        }
        this.isProcessing = false;
    }
    /**
     * Verify a file using the Assimilator
     */
    async verifyFile(filePath) {
        const relativePath = path.relative(this.config.workspaceRoot, filePath);
        this.log(`\n🔍 VERIFYING: ${relativePath}`);
        const result = {
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
                }
                catch (e) {
                    result.valid = false;
                    result.errors.push(`Invalid JSON: ${e}`);
                }
            }
            // Emit verification result
            this.emit('file:verified', { filePath, result });
            // Log result
            this.logVerificationResult(relativePath, result);
        }
        catch (error) {
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
    async scanWorkspace() {
        this.log('\n📊 Scanning workspace...');
        let fileCount = 0;
        const scanDir = async (dir) => {
            if (this.shouldIgnore(dir))
                return;
            try {
                const entries = await fs.promises.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        if (!this.shouldIgnore(fullPath)) {
                            await scanDir(fullPath);
                        }
                    }
                    else if (entry.isFile()) {
                        if (!this.shouldIgnore(fullPath)) {
                            try {
                                const stats = await fs.promises.stat(fullPath);
                                this.state.lastModified.set(fullPath, stats.mtimeMs);
                                fileCount++;
                            }
                            catch { }
                        }
                    }
                }
            }
            catch { }
        };
        await scanDir(this.config.workspaceRoot);
        this.log(`   Found ${fileCount} files to monitor`);
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // LOGGING
    // ═══════════════════════════════════════════════════════════════════════════════
    log(message) {
        if (this.config.verboseLogging || !message.startsWith('   ')) {
            console.log(message);
        }
    }
    logFileChange(event) {
        const relativePath = path.relative(this.config.workspaceRoot, event.filePath);
        const icons = {
            created: '✨',
            modified: '📝',
            deleted: '🗑️',
            renamed: '📛',
        };
        console.log(`${icons[event.type]} ${event.type.toUpperCase()}: ${relativePath}`);
    }
    logVerificationResult(relativePath, result) {
        if (result.valid && result.warnings.length === 0) {
            console.log(`   ✅ Verified: No issues found`);
        }
        else {
            if (result.errors.length > 0) {
                console.log(`   ❌ ERRORS:`);
                result.errors.forEach(e => console.log(`      • ${e}`));
            }
            if (result.warnings.length > 0) {
                console.log(`   ⚠️ WARNINGS:`);
                result.warnings.forEach(w => console.log(`      • ${w}`));
            }
            if (result.suggestions.length > 0) {
                console.log(`   💡 SUGGESTIONS:`);
                result.suggestions.forEach(s => console.log(`      • ${s}`));
            }
        }
    }
}
exports.VSCodeBridge = VSCodeBridge;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
let bridgeInstance = null;
function getVSCodeBridge(config) {
    if (!bridgeInstance) {
        bridgeInstance = new VSCodeBridge(config);
    }
    return bridgeInstance;
}
function destroyVSCodeBridge() {
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
    bridge.on('file:changed', (event) => {
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
