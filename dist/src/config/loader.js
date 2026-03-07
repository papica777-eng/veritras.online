"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum CONFIGURATION LOADER                                                 ║
 * ║   "Multi-format config loading with environment support"                      ║
 * ║                                                                               ║
 * ║   TODO B #43 - Configuration Management                                       ║
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
exports.TOML_FORMAT = exports.ENV_FORMAT = exports.YAML_FORMAT = exports.JSON_FORMAT = exports.ConfigLoader = exports.RemoteSource = exports.ObjectSource = exports.FileSource = exports.EnvSource = void 0;
exports.deepMerge = deepMerge;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ═══════════════════════════════════════════════════════════════════════════════
// PARSERS
// ═══════════════════════════════════════════════════════════════════════════════
const JSON_FORMAT = {
    extensions: ['.json', '.jsonc'],
    // Complexity: O(N)
    parse(content) {
        // Remove comments for JSONC
        const withoutComments = content.replace(/\/\/.*$/gm, ').replace(/\/\*[\s\S]*?\*\//g, ');
        return JSON.parse(withoutComments);
    },
    // Complexity: O(1)
    stringify(value) {
        return JSON.stringify(value, null, 2);
    }
};
exports.JSON_FORMAT = JSON_FORMAT;
const YAML_FORMAT = {
    extensions: ['.yml', '.yaml'],
    // Complexity: O(N*M) — nested iteration
    parse(content) {
        // Simple YAML parser (basic support)
        const result = {};
        const lines = content.split('\n');
        const stack = [{ indent: -1, obj: result }];
        for (const line of lines) {
            if (!line.trim() || line.trim().startsWith('#'))
                continue;
            const indent = line.search(/\S/);
            const trimmed = line.trim();
            // Pop stack until we find parent
            while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
                stack.pop();
            }
            const parent = stack[stack.length - 1].obj;
            if (trimmed.includes(':')) {
                const colonIndex = trimmed.indexOf(':');
                const key = trimmed.slice(0, colonIndex).trim();
                const value = trimmed.slice(colonIndex + 1).trim();
                if (value) {
                    // Parse value
                    parent[key] = parseYamlValue(value);
                }
                else {
                    // Nested object
                    parent[key] = {};
                    stack.push({ indent, obj: parent[key] });
                }
            }
            else if (trimmed.startsWith('-')) {
                // Array item
                const arrayKey = Object.keys(parent).pop();
                if (arrayKey && !Array.isArray(parent[arrayKey])) {
                    parent[arrayKey] = [];
                }
                const arrayParent = parent[arrayKey];
                if (Array.isArray(arrayParent)) {
                    arrayParent.push(parseYamlValue(trimmed.slice(1).trim()));
                }
            }
        }
        return result;
    }
};
exports.YAML_FORMAT = YAML_FORMAT;
function parseYamlValue(value) {
    if (value === 'true')
        return true;
    if (value === 'false')
        return false;
    if (value === 'null')
        return null;
    if (/^-?\d+$/.test(value))
        return parseInt(value, 10);
    if (/^-?\d+\.\d+$/.test(value))
        return parseFloat(value);
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1);
    }
    return value;
}
const ENV_FORMAT = {
    extensions: ['.env'],
    // Complexity: O(N) — loop
    parse(content) {
        const result = {};
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#'))
                continue;
            const equalIndex = trimmed.indexOf('=');
            if (equalIndex === -1)
                continue;
            const key = trimmed.slice(0, equalIndex).trim();
            let value = trimmed.slice(equalIndex + 1).trim();
            // Handle quoted values
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            // Convert to nested object using underscores
            // Complexity: O(1)
            setNestedValue(result, key.split('_'), value);
        }
        return result;
    }
};
exports.ENV_FORMAT = ENV_FORMAT;
const TOML_FORMAT = {
    extensions: ['.toml'],
    // Complexity: O(N*M) — nested iteration
    parse(content) {
        const result = {};
        let currentSection = result;
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#'))
                continue;
            // Section header
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                const section = trimmed.slice(1, -1);
                const parts = section.split('.');
                currentSection = result;
                for (const part of parts) {
                    currentSection[part] = currentSection[part] || {};
                    currentSection = currentSection[part];
                }
                continue;
            }
            // Key-value pair
            const equalIndex = trimmed.indexOf('=');
            if (equalIndex === -1)
                continue;
            const key = trimmed.slice(0, equalIndex).trim();
            const value = trimmed.slice(equalIndex + 1).trim();
            currentSection[key] = parseTomlValue(value);
        }
        return result;
    }
};
exports.TOML_FORMAT = TOML_FORMAT;
function parseTomlValue(value) {
    if (value === 'true')
        return true;
    if (value === 'false')
        return false;
    if (/^-?\d+$/.test(value))
        return parseInt(value, 10);
    if (/^-?\d+\.\d+$/.test(value))
        return parseFloat(value);
    if (value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1);
    }
    if (value.startsWith('[') && value.endsWith(']')) {
        // Simple array parsing
        const inner = value.slice(1, -1);
        return inner.split(',').map(v => parseTomlValue(v.trim()));
    }
    return value;
}
function setNestedValue(obj, keys, value) {
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i].toLowerCase();
        current[key] = current[key] || {};
        current = current[key];
    }
    current[keys[keys.length - 1].toLowerCase()] = value;
}
// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG SOURCES
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Environment variables source
 */
class EnvSource {
    name;
    priority;
    constructor(
    //         private prefix: string = ',
    //         priority: number = 100
    ) {
        this.name = `env:${prefix || '*'}`;
        this.priority = priority;
    }
    // Complexity: O(N) — loop
    load() {
        const result = {};
        for (const [key, value] of Object.entries(process.env)) {
            if (this.prefix && !key.startsWith(this.prefix))
                continue;
            const configKey = this.prefix;
            //                 ? key.slice(this.prefix.length).replace(/^_/, ')
            //                 : key;
            const parts = configKey.split('_');
            // Complexity: O(1)
            setNestedValue(result, parts, value);
        }
        return result;
    }
}
exports.EnvSource = EnvSource;
/**
 * File source
 */
class FileSource {
    filePath;
    name;
    priority;
    format;
    constructor(filePath, priority = 50, format) {
        this.filePath = filePath;
        this.name = `file:${filePath}`;
        this.priority = priority;
        this.format = format;
    }
    // Complexity: O(1)
    load() {
        if (!fs.existsSync(this.filePath)) {
            return {};
        }
        const content = fs.readFileSync(this.filePath, 'utf-8');
        const ext = path.extname(this.filePath).toLowerCase();
        const format = this.format || this.getFormat(ext);
        if (!format) {
            throw new Error(`Unsupported config format: ${ext}`);
        }
        return format.parse(content);
    }
    // Complexity: O(N) — linear scan
    getFormat(ext) {
        const formats = [JSON_FORMAT, YAML_FORMAT, ENV_FORMAT, TOML_FORMAT];
        return formats.find(f => f.extensions.includes(ext));
    }
}
exports.FileSource = FileSource;
/**
 * Object source (for programmatic config)
 */
class ObjectSource {
    config;
    name;
    priority;
    constructor(config, name = 'object', priority = 75) {
        this.config = config;
        this.name = name;
        this.priority = priority;
    }
    // Complexity: O(1)
    load() {
        return { ...this.config };
    }
}
exports.ObjectSource = ObjectSource;
/**
 * Remote source (for fetching config from URL)
 */
class RemoteSource {
    url;
    name;
    priority;
    constructor(url, priority = 25) {
        this.url = url;
        this.name = `remote:${url}`;
        this.priority = priority;
    }
    // Complexity: O(1) — lookup
    async load() {
        try {
            const response = await fetch(this.url);
            const content = await response.text();
            //             const contentType = response.headers.get('content-type') || ';
            if (contentType.includes('yaml') || this.url.endsWith('.yaml') || this.url.endsWith('.yml')) {
                return YAML_FORMAT.parse(content);
            }
            return JSON.parse(content);
        }
        catch (error) {
            console.warn(`Failed to load remote config from ${this.url}:`, error);
            return {};
        }
    }
}
exports.RemoteSource = RemoteSource;
// ═══════════════════════════════════════════════════════════════════════════════
// CONFIG LOADER
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Configuration Loader
 */
class ConfigLoader {
    options;
    sources = [];
    config = {};
    changeHandlers = [];
    watchers = [];
    loaded = false;
    constructor(options = {}) {
        this.options = options;
        this.config = options.defaults ? deepMerge({}, options.defaults) : {};
    }
    /**
     * Add configuration source
     */
    // Complexity: O(N log N) — sort
    addSource(source) {
        this.sources.push(source);
        this.sources.sort((a, b) => a.priority - b.priority);
        this.loaded = false;
        return this;
    }
    /**
     * Add file source
     */
    // Complexity: O(1)
    addFile(filePath, priority) {
        return this.addSource(new FileSource(filePath, priority));
    }
    /**
     * Add environment source
     */
    // Complexity: O(1)
    addEnv(prefix, priority) {
        return this.addSource(new EnvSource(prefix, priority));
    }
    /**
     * Add object source
     */
    // Complexity: O(1)
    addObject(config, name, priority) {
        return this.addSource(new ObjectSource(config, name, priority));
    }
    /**
     * Add remote source
     */
    // Complexity: O(1)
    addRemote(url, priority) {
        return this.addSource(new RemoteSource(url, priority));
    }
    /**
     * Load all sources
     */
    // Complexity: O(N*M) — nested iteration
    async load() {
        const loadedConfigs = [];
        for (const source of this.sources) {
            try {
                const config = await source.load();
                loadedConfigs.push(config);
            }
            catch (error) {
                console.warn(`Failed to load config from ${source.name}:`, error);
            }
        }
        // Merge all configs (higher priority sources later)
        this.config = this.options.defaults ? deepMerge({}, this.options.defaults) : {};
        for (const loaded of loadedConfigs) {
            if (this.options.mergeStrategy === 'shallow') {
                Object.assign(this.config, loaded);
            }
            else {
                // Complexity: O(1)
                deepMerge(this.config, loaded);
            }
        }
        this.loaded = true;
        // Setup watchers if needed
        if (this.options.watch) {
            this.setupWatchers();
        }
        return this.config;
    }
    /**
     * Load synchronously (file sources only)
     */
    // Complexity: O(N*M) — nested iteration
    loadSync() {
        const loadedConfigs = [];
        for (const source of this.sources) {
            if (source instanceof FileSource ||
                source instanceof ObjectSource ||
                source instanceof EnvSource) {
                try {
                    const config = source.load();
                    loadedConfigs.push(config);
                }
                catch (error) {
                    console.warn(`Failed to load config from ${source.name}:`, error);
                }
            }
        }
        this.config = this.options.defaults ? deepMerge({}, this.options.defaults) : {};
        for (const loaded of loadedConfigs) {
            if (this.options.mergeStrategy === 'shallow') {
                Object.assign(this.config, loaded);
            }
            else {
                // Complexity: O(1)
                deepMerge(this.config, loaded);
            }
        }
        this.loaded = true;
        return this.config;
    }
    /**
     * Get configuration value
     */
    get(key, defaultValue) {
        if (!this.loaded) {
            this.loadSync();
        }
        const parts = key.split('.');
        let current = this.config;
        for (const part of parts) {
            if (current === undefined || current === null) {
                return defaultValue;
            }
            current = current[part];
        }
        return current !== undefined ? current : defaultValue;
    }
    /**
     * Set configuration value
     */
    // Complexity: O(N*M) — nested iteration
    set(key, value) {
        const parts = key.split('.');
        let current = this.config;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            current[part] = current[part] || {};
            current = current[part];
        }
        const lastKey = parts[parts.length - 1];
        const oldValue = current[lastKey];
        current[lastKey] = value;
        // Notify change handlers
        for (const handler of this.changeHandlers) {
            // Complexity: O(1)
            handler(key, value, oldValue);
        }
        return this;
    }
    /**
     * Check if key exists
     */
    // Complexity: O(1) — lookup
    has(key) {
        return this.get(key) !== undefined;
    }
    /**
     * Get all configuration
     */
    // Complexity: O(1)
    getAll() {
        if (!this.loaded) {
            this.loadSync();
        }
        return { ...this.config };
    }
    /**
     * Subscribe to changes
     */
    // Complexity: O(1)
    onChange(handler) {
        this.changeHandlers.push(handler);
        return () => {
            const index = this.changeHandlers.indexOf(handler);
            if (index >= 0) {
                this.changeHandlers.splice(index, 1);
            }
        };
    }
    /**
     * Setup file watchers
     */
    // Complexity: O(N) — loop
    setupWatchers() {
        for (const source of this.sources) {
            if (source instanceof FileSource) {
                const filePath = source.filePath;
                if (fs.existsSync(filePath)) {
                    const watcher = fs.watch(filePath, async () => {
                        // SAFETY: async operation — wrap in try-catch for production resilience
                        await this.load();
                    });
                    this.watchers.push(watcher);
                }
            }
        }
    }
    /**
     * Stop watching
     */
    // Complexity: O(N) — loop
    stopWatching() {
        for (const watcher of this.watchers) {
            watcher.close();
        }
        this.watchers = [];
    }
}
exports.ConfigLoader = ConfigLoader;
// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Deep merge objects
 */
function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            target[key] = target[key] || {};
            // Complexity: O(1)
            deepMerge(target[key], source[key]);
        }
        else {
            target[key] = source[key];
        }
    }
    return target;
}
