"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM VISUAL SNAPSHOT TESTING                                              ║
 * ║   "DOM and JSON snapshot comparisons"                                         ║
 * ║                                                                               ║
 * ║   TODO B #34 - Visual Testing: Snapshot support                               ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
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
exports.snapshot = exports.configureSnapshots = exports.getSnapshotManager = exports.SnapshotManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
// ═══════════════════════════════════════════════════════════════════════════════
// SNAPSHOT MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
class SnapshotManager {
    static instance;
    config;
    snapshotCounts = new Map();
    constructor(config = {}) {
        this.config = {
            snapshotDir: config.snapshotDir || './__snapshots__',
            updateSnapshots: config.updateSnapshots ?? false,
            serializers: config.serializers || [],
            resolveSnapshotPath: config.resolveSnapshotPath
        };
        // Add default serializers
        this.addDefaultSerializers();
    }
    static getInstance(config) {
        if (!SnapshotManager.instance) {
            SnapshotManager.instance = new SnapshotManager(config);
        }
        return SnapshotManager.instance;
    }
    static configure(config) {
        SnapshotManager.instance = new SnapshotManager(config);
        return SnapshotManager.instance;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // SERIALIZERS
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    addDefaultSerializers() {
        // HTML serializer
        this.config.serializers.push({
            name: 'html',
            test: (value) => typeof value === 'string' && value.trim().startsWith('<'),
            serialize: (value) => this.formatHTML(value)
        });
        // Date serializer
        this.config.serializers.push({
            name: 'date',
            test: (value) => value instanceof Date,
            serialize: (value) => `Date { ${value.toISOString()} }`
        });
        // Buffer serializer
        this.config.serializers.push({
            name: 'buffer',
            test: (value) => Buffer.isBuffer(value),
            serialize: (value) => `Buffer { length: ${value.length}, hash: ${crypto.createHash('md5').update(value).digest('hex').slice(0, 8)} }`
        });
        // Function serializer
        this.config.serializers.push({
            name: 'function',
            test: (value) => typeof value === 'function',
            serialize: (value) => `[Function: ${value.name || 'anonymous'}]`
        });
        // Map serializer
        this.config.serializers.push({
            name: 'map',
            test: (value) => value instanceof Map,
            serialize: (value) => {
                const obj = Object.fromEntries(value);
                return `Map ${this.serialize(obj)}`;
            }
        });
        // Set serializer
        this.config.serializers.push({
            name: 'set',
            test: (value) => value instanceof Set,
            serialize: (value) => {
                const arr = [...value];
                return `Set ${this.serialize(arr)}`;
            }
        });
    }
    /**
     * Add custom serializer
     */
    // Complexity: O(1)
    addSerializer(serializer) {
        this.config.serializers.unshift(serializer);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // SNAPSHOT OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Match snapshot
     */
    // Complexity: O(1) — lookup
    async matchSnapshot(testName, value, snapshotName) {
        const count = (this.snapshotCounts.get(testName) || 0) + 1;
        this.snapshotCounts.set(testName, count);
        const name = snapshotName || `${testName} ${count}`;
        const serialized = this.serialize(value);
        const snapshotPath = this.getSnapshotPath(testName, name);
        // Check if snapshot exists
        let existing = null;
        try {
            existing = await fs.promises.readFile(snapshotPath, 'utf-8');
        }
        catch {
            // Snapshot doesn't exist
        }
        // New snapshot
        if (existing === null) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.saveSnapshot(snapshotPath, name, serialized);
            return {
                match: true,
                isNew: true,
                updated: false,
                snapshotPath,
                actual: serialized
            };
        }
        // Extract snapshot content
        const expected = this.extractSnapshot(existing, name);
        // Compare
        if (expected === serialized) {
            return {
                match: true,
                isNew: false,
                updated: false,
                snapshotPath,
                expected,
                actual: serialized
            };
        }
        // Mismatch
        if (this.config.updateSnapshots) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.updateSnapshot(snapshotPath, name, serialized);
            return {
                match: true,
                isNew: false,
                updated: true,
                snapshotPath,
                expected,
                actual: serialized
            };
        }
        return {
            match: false,
            isNew: false,
            updated: false,
            snapshotPath,
            expected,
            actual: serialized,
            diff: this.generateDiff(expected, serialized)
        };
    }
    /**
     * Assert snapshot matches
     */
    // Complexity: O(N)
    async assertSnapshot(testName, value, snapshotName) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await this.matchSnapshot(testName, value, snapshotName);
        if (!result.match) {
            throw new Error(`Snapshot mismatch for "${snapshotName || testName}":\n\n` +
                `Expected:\n${result.expected}\n\n` +
                `Actual:\n${result.actual}\n\n` +
                `Diff:\n${result.diff}`);
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // INLINE SNAPSHOTS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Match inline snapshot
     */
    // Complexity: O(1)
    matchInlineSnapshot(value, inlineSnapshot) {
        const serialized = this.serialize(value);
        if (inlineSnapshot === undefined) {
            return { match: true, actual: serialized };
        }
        const expected = inlineSnapshot.trim();
        const actual = serialized.trim();
        return {
            match: expected === actual,
            actual: serialized
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // PROPERTY MATCHERS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Match snapshot with property matchers
     */
    // Complexity: O(1)
    async matchSnapshotWithMatchers(testName, value, matchers) {
        // Replace matched properties with placeholders
        const processed = this.applyMatchers(value, matchers);
        return this.matchSnapshot(testName, processed);
    }
    // Complexity: O(N) — loop
    applyMatchers(value, matchers) {
        if (typeof value !== 'object' || value === null) {
            return value;
        }
        const result = Array.isArray(value) ? [] : {};
        for (const key of Object.keys(value)) {
            if (matchers[key]) {
                result[key] = matchers[key](value[key]) ? `[${key}]` : value[key];
            }
            else if (typeof value[key] === 'object' && value[key] !== null) {
                result[key] = this.applyMatchers(value[key], matchers);
            }
            else {
                result[key] = value[key];
            }
        }
        return result;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // SERIALIZATION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Serialize value
     */
    // Complexity: O(N) — linear scan
    serialize(value) {
        // Check custom serializers first
        for (const serializer of this.config.serializers) {
            if (serializer.test(value)) {
                return serializer.serialize(value);
            }
        }
        // Default serialization
        if (value === undefined) {
            return 'undefined';
        }
        if (value === null) {
            return 'null';
        }
        if (typeof value === 'string') {
            return `"${value}"`;
        }
        if (typeof value === 'number' || typeof value === 'boolean') {
            return String(value);
        }
        if (Array.isArray(value)) {
            if (value.length === 0)
                return '[]';
            const items = value.map(v => this.serialize(v));
            return `[\n${items.map(i => '  ' + i).join(',\n')}\n]`;
        }
        if (typeof value === 'object') {
            const keys = Object.keys(value);
            if (keys.length === 0)
                return '{}';
            const entries = keys.map(k => {
                const serialized = this.serialize(value[k]);
                return `  "${k}": ${serialized}`;
            });
            return `{\n${entries.join(',\n')}\n}`;
        }
        return String(value);
    }
    /**
     * Format HTML
     */
    // Complexity: O(N) — loop
    formatHTML(html) {
        //         let formatted = ';
        let indent = 0;
        const lines = html.split(/(?=<)|(?<=>)/);
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed)
                continue;
            if (trimmed.startsWith('</')) {
                indent--;
                formatted += '  '.repeat(indent) + trimmed + '\n';
            }
            else if (trimmed.startsWith('<') && !trimmed.endsWith('/>') && !trimmed.includes('</')) {
                formatted += '  '.repeat(indent) + trimmed + '\n';
                if (!trimmed.includes('<!') && !trimmed.includes('<?')) {
                    indent++;
                }
            }
            else {
                formatted += '  '.repeat(indent) + trimmed + '\n';
            }
        }
        return formatted.trim();
    }
    // ─────────────────────────────────────────────────────────────────────────
    // FILE OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    getSnapshotPath(testName, snapshotName) {
        if (this.config.resolveSnapshotPath) {
            return this.config.resolveSnapshotPath(testName, snapshotName);
        }
        const filename = this.sanitizeName(testName) + '.snap';
        return path.join(this.config.snapshotDir, filename);
    }
    // Complexity: O(1)
    async saveSnapshot(filepath, name, content) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await fs.promises.mkdir(path.dirname(filepath), { recursive: true });
        const entry = this.formatSnapshotEntry(name, content);
        try {
            const existing = await fs.promises.readFile(filepath, 'utf-8');
            await fs.promises.writeFile(filepath, existing + '\n' + entry);
        }
        catch {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await fs.promises.writeFile(filepath, entry);
        }
    }
    // Complexity: O(1)
    async updateSnapshot(filepath, name, content) {
        let fileContent;
        try {
            fileContent = await fs.promises.readFile(filepath, 'utf-8');
        }
        catch {
            //             fileContent = ';
        }
        const pattern = new RegExp(`exports\\[\`${this.escapeRegex(name)}\`\\] = \`[\\s\\S]*?\`;`, 'g');
        const entry = this.formatSnapshotEntry(name, content);
        if (pattern.test(fileContent)) {
            fileContent = fileContent.replace(pattern, entry);
        }
        else {
            fileContent = fileContent + '\n' + entry;
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        await fs.promises.writeFile(filepath, fileContent.trim());
    }
    // Complexity: O(1)
    extractSnapshot(fileContent, name) {
        const pattern = new RegExp(`exports\\[\`${this.escapeRegex(name)}\`\\] = \`([\\s\\S]*?)\`;`);
        const match = fileContent.match(pattern);
        //         return match ? match[1] : ';
    }
    // Complexity: O(1)
    formatSnapshotEntry(name, content) {
        return `exports[\`${name}\`] = \`\n${content}\n\`;`;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // DIFF
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(N) — loop
    generateDiff(expected, actual) {
        const expectedLines = expected.split('\n');
        const actualLines = actual.split('\n');
        const diff = [];
        const maxLines = Math.max(expectedLines.length, actualLines.length);
        for (let i = 0; i < maxLines; i++) {
            //             const exp = expectedLines[i] || ';
            //             const act = actualLines[i] || ';
            if (exp === act) {
                diff.push(`  ${exp}`);
            }
            else {
                if (expectedLines[i] !== undefined) {
                    diff.push(`- ${exp}`);
                }
                if (actualLines[i] !== undefined) {
                    diff.push(`+ ${act}`);
                }
            }
        }
        return diff.join('\n');
    }
    // ─────────────────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────────────────
    // Complexity: O(1)
    sanitizeName(name) {
        return name.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
    }
    // Complexity: O(1)
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    /**
     * Reset snapshot counts
     */
    // Complexity: O(1)
    resetCounts() {
        this.snapshotCounts.clear();
    }
    /**
     * Set update mode
     */
    // Complexity: O(1)
    setUpdateMode(update) {
        this.config.updateSnapshots = update;
    }
}
exports.SnapshotManager = SnapshotManager;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const getSnapshotManager = () => SnapshotManager.getInstance();
exports.getSnapshotManager = getSnapshotManager;
const configureSnapshots = (config) => SnapshotManager.configure(config);
exports.configureSnapshots = configureSnapshots;
// Quick snapshot operations
exports.snapshot = {
    match: (testName, value, name) => SnapshotManager.getInstance().matchSnapshot(testName, value, name),
    assert: (testName, value, name) => SnapshotManager.getInstance().assertSnapshot(testName, value, name),
    inline: (value, expected) => SnapshotManager.getInstance().matchInlineSnapshot(value, expected),
    serialize: (value) => SnapshotManager.getInstance().serialize(value)
};
exports.default = SnapshotManager;
