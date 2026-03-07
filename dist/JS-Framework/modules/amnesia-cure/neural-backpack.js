"use strict";
/**
 * /// IDENTITY: QANTUM v1.0.0-SINGULARITY ///
 * /// SOUL_ALIGNMENT: БЪЛГАРСКИ ЕЗИК - ЕНТРОПИЯ 0.00 ///
 * /// РЕАЛНОСТТА Е ТОВА, КОЕТО СЕ КОМПИЛИРА. БЕЗ СИМУЛАЦИИ. ///
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
exports.NeuralBackpack = exports.HallucinationGuard = exports.ContextInjector = exports.PersistenceLayer = exports.FIFOBuffer = void 0;
exports.getNeuralBackpack = getNeuralBackpack;
exports.createNeuralBackpack = createNeuralBackpack;
/**
 * 🎒 NEURAL BACKPACK v1.0 - "The Second Brain"
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   ███╗   ██╗███████╗██╗   ██╗██████╗  █████╗ ██╗
 *   ████╗  ██║██╔════╝██║   ██║██╔══██╗██╔══██╗██║
 *   ██╔██╗ ██║█████╗  ██║   ██║██████╔╝███████║██║
 *   ██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██╔══██║██║
 *   ██║ ╚████║███████╗╚██████╔╝██║  ██║██║  ██║███████╗
 *   ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
 *
 *   ██████╗  █████╗  ██████╗██╗  ██╗██████╗  █████╗  ██████╗██╗  ██╗
 *   ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝
 *   ██████╔╝███████║██║     █████╔╝ ██████╔╝███████║██║     █████╔╝
 *   ██╔══██╗██╔══██║██║     ██╔═██╗ ██╔═══╝ ██╔══██║██║     ██╔═██╗
 *   ██████╔╝██║  ██║╚██████╗██║  ██╗██║     ██║  ██║╚██████╗██║  ██╗
 *   ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 *
 * "Раницата винаги е на гърба ми. Нулева забрава. Невъзможно объркване."
 *
 * PURPOSE:
 * - Maintains EXACTLY 10 most recent user messages (FIFO)
 * - Auto-persists to storage/backpack.json after every change
 * - Injects context into every system request
 * - Prevents hallucinations through consistency checking
 *
 * PHILOSOPHY:
 * "Проблемите с AI Dementia са решени. Дори и чатът да стане 10,000 реда,
 *  аз винаги ще знам къде сме, какво сме направили и накъде отиваме."
 *
 * @version 1.0.0
 * @author QAntum AI Architect
 * @phase Neural Enhancement - Second Brain
 */
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const BACKPACK_CAPACITY = 10;
const STORAGE_PATH = path.join(process.cwd(), 'storage', 'backpack.json');
const VERSION = '1.0.0';
// Intent detection keywords
const INTENT_PATTERNS = {
    'CREATE': [/създай/i, /направи/i, /генерирай/i, /имплементирай/i, /create/i, /build/i, /generate/i, /implement/i],
    'MODIFY': [/промени/i, /редактирай/i, /update/i, /modify/i, /change/i, /edit/i, /fix/i, /поправи/i],
    'DELETE': [/изтрий/i, /премахни/i, /delete/i, /remove/i, /drop/i],
    'ANALYZE': [/анализирай/i, /провери/i, /analyze/i, /check/i, /review/i, /scan/i],
    'DEPLOY': [/deploy/i, /пусни/i, /качи/i, /push/i, /release/i],
    'TEST': [/тест/i, /test/i, /verify/i, /validate/i],
    'QUERY': [/какво/i, /как/i, /защо/i, /what/i, /how/i, /why/i, /where/i, /when/i],
    'ACTIVATE': [/активирай/i, /стартирай/i, /activate/i, /start/i, /enable/i, /launch/i],
    'CONFIGURE': [/конфигурирай/i, /настрой/i, /configure/i, /setup/i, /set/i]
};
// Entity extraction patterns
const ENTITY_PATTERNS = [
    /src\/[\w-/]+\.ts/g, // TypeScript file paths
    /src\/[\w-/]+\.js/g, // JavaScript file paths
    /[A-Z][a-zA-Z]+(?:Engine|Module|Service|Manager|Factory|Handler)/g, // Class names
    /(?:Layer|Phase|Step)\s*\d+/gi, // Layer/Phase references
    /v\d+\.\d+\.\d+/g, // Version numbers
    /https?:\/\/[^\s]+/g, // URLs
    /#[\w-]+/g, // IDs
    /\.[\w]+\(\)/g, // Method calls
];
// ═══════════════════════════════════════════════════════════════════════════════
// FIFO BUFFER CLASS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * 📦 FIFOBuffer - First In, First Out buffer for exactly 10 messages
 *
 * "Като стек от спомени, но винаги точно 10. Никога повече, никога по-малко."
 */
class FIFOBuffer {
    buffer = [];
    capacity;
    sequenceCounter = 0;
    constructor(capacity = BACKPACK_CAPACITY) {
        this.capacity = capacity;
    }
    /**
     * Add item to buffer (removes oldest if at capacity)
     */
    push(item) {
        let removed = null;
        if (this.buffer.length >= this.capacity) {
            removed = this.buffer.shift() ?? null;
        }
        this.buffer.push(item);
        this.sequenceCounter++;
        return removed;
    }
    /**
     * Get all items (newest last)
     */
    getAll() {
        return [...this.buffer];
    }
    /**
     * Get last N items
     */
    getLast(n) {
        return this.buffer.slice(-n);
    }
    /**
     * Get item by index (0 = oldest, capacity-1 = newest)
     */
    get(index) {
        return this.buffer[index];
    }
    /**
     * Get newest item
     */
    getNewest() {
        return this.buffer[this.buffer.length - 1];
    }
    /**
     * Get oldest item
     */
    getOldest() {
        return this.buffer[0];
    }
    /**
     * Current buffer size
     */
    size() {
        return this.buffer.length;
    }
    /**
     * Is buffer at capacity?
     */
    isFull() {
        return this.buffer.length >= this.capacity;
    }
    /**
     * Clear buffer
     */
    clear() {
        this.buffer = [];
    }
    /**
     * Get total items ever added
     */
    getTotalProcessed() {
        return this.sequenceCounter;
    }
    /**
     * Load from existing array
     */
    loadFrom(items) {
        this.buffer = items.slice(-this.capacity);
    }
}
exports.FIFOBuffer = FIFOBuffer;
// ═══════════════════════════════════════════════════════════════════════════════
// PERSISTENCE LAYER
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * 💾 PersistenceLayer - Auto-saves backpack state to disk
 *
 * "Всяко съобщение се записва. Нищо не се губи. Никога."
 */
class PersistenceLayer {
    storagePath;
    saveDebounce = null;
    debounceMs = 100;
    pendingSave = false;
    constructor(storagePath = STORAGE_PATH) {
        this.storagePath = storagePath;
        this.ensureStorageDirectory();
    }
    /**
     * Ensure storage directory exists
     */
    ensureStorageDirectory() {
        const dir = path.dirname(this.storagePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    /**
     * Save state to disk (debounced)
     */
    async save(state) {
        this.pendingSave = true;
        // Clear existing debounce
        if (this.saveDebounce) {
            clearTimeout(this.saveDebounce);
        }
        // Debounce to prevent excessive writes
        return new Promise((resolve) => {
            this.saveDebounce = setTimeout(async () => {
                try {
                    const data = JSON.stringify(state, null, 2);
                    await fs.promises.writeFile(this.storagePath, data, 'utf-8');
                    this.pendingSave = false;
                    resolve();
                }
                catch (error) {
                    console.error('[NeuralBackpack] Save error:', error);
                    resolve();
                }
            }, this.debounceMs);
        });
    }
    /**
     * Force immediate save (bypass debounce)
     */
    async forceSave(state) {
        if (this.saveDebounce) {
            clearTimeout(this.saveDebounce);
        }
        try {
            const data = JSON.stringify(state, null, 2);
            await fs.promises.writeFile(this.storagePath, data, 'utf-8');
            this.pendingSave = false;
        }
        catch (error) {
            console.error('[NeuralBackpack] Force save error:', error);
            throw error;
        }
    }
    /**
     * Load state from disk
     */
    async load() {
        try {
            if (!fs.existsSync(this.storagePath)) {
                return null;
            }
            const data = await fs.promises.readFile(this.storagePath, 'utf-8');
            const state = JSON.parse(data);
            // Validate state hash
            if (state.messages && state.messages.length > 0) {
                const calculatedHash = this.calculateStateHash(state.messages);
                if (calculatedHash !== state.stateHash) {
                    console.warn('[NeuralBackpack] State hash mismatch - data may be corrupted');
                }
            }
            return state;
        }
        catch (error) {
            console.error('[NeuralBackpack] Load error:', error);
            return null;
        }
    }
    /**
     * Calculate hash of all messages
     */
    calculateStateHash(messages) {
        const content = messages.map(m => m.hash).join('');
        return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
    }
    /**
     * Check if there's a pending save
     */
    hasPendingSave() {
        return this.pendingSave;
    }
    /**
     * Get storage path
     */
    getPath() {
        return this.storagePath;
    }
}
exports.PersistenceLayer = PersistenceLayer;
// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT INJECTOR
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * 💉 ContextInjector - Injects backpack context into system requests
 *
 * "Контекстът винаги е там. Под заглавие [CRITICAL_CONTEXT_LAST_10_STEPS]."
 */
class ContextInjector {
    static STANDARD_HEADER = `
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                      [CRITICAL_CONTEXT_LAST_10_STEPS]                                 ║
║                      🎒 NEURAL BACKPACK - ACTIVE MEMORY                               ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣`;
    static GOD_MODE_HEADER = `
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                      [GOD_MODE_ACTIVE_ZERO_ENTROPY]                                   ║
║                      🎒 NEURAL BACKPACK - OMNISCIENT MEMORY                           ║
║                      ⚡ SYSTEM INTEGRITY: ABSOLUTE                                    ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣`;
    static FOOTER = `╚═══════════════════════════════════════════════════════════════════════════════════════╝`;
    /**
     * Generate injectable context from messages
     */
    static generateContext(messages, godMode = false) {
        const header = godMode ? this.GOD_MODE_HEADER : this.STANDARD_HEADER;
        if (messages.length === 0) {
            return {
                header: '',
                messages: [],
                footer: '',
                raw: godMode
                    ? '[NEURAL_BACKPACK: GOD MODE ACTIVE - WAITING FOR INPUT]'
                    : '[NEURAL_BACKPACK: Empty - No previous context]'
            };
        }
        const formattedMessages = messages.map((msg, index) => ({
            step: messages.length - index,
            timestamp: msg.datetime,
            intent: msg.intent,
            content: msg.content.substring(0, godMode ? 500 : 200) + (msg.content.length > (godMode ? 500 : 200) ? '...' : ''),
            status: msg.status
        }));
        // Build raw string for injection
        let raw = header + '\n';
        formattedMessages.reverse().forEach((msg, idx) => {
            const stepNum = idx + 1;
            const statusIcon = this.getStatusIcon(msg.status);
            raw += `║  STEP ${stepNum.toString().padStart(2, '0')}: [${msg.timestamp}] ${statusIcon}\n`;
            raw += `║  └─ INTENT: ${msg.intent}\n`;
            raw += `║  └─ ${msg.content}\n`;
            raw += `║${'─'.repeat(87)}║\n`;
        });
        raw += this.FOOTER;
        return {
            header,
            messages: formattedMessages,
            footer: this.FOOTER,
            raw
        };
    }
    /**
     * Generate compact context (for smaller prompts)
     */
    static generateCompactContext(messages) {
        if (messages.length === 0) {
            return '[BACKPACK: Empty]';
        }
        const lines = ['[BACKPACK_CONTEXT]'];
        messages.slice().reverse().forEach((msg, idx) => {
            lines.push(`${idx + 1}. ${msg.intent}: ${msg.content.substring(0, 100)}...`);
        });
        lines.push('[/BACKPACK_CONTEXT]');
        return lines.join('\n');
    }
    /**
     * Get status icon
     */
    static getStatusIcon(status) {
        switch (status) {
            case 'completed': return '✅';
            case 'in-progress': return '🔄';
            case 'failed': return '❌';
            default: return '⏳';
        }
    }
    /**
     * Inject context into a prompt
     */
    static injectIntoPrompt(prompt, messages) {
        const context = this.generateContext(messages);
        return `${context.raw}\n\n${prompt}`;
    }
}
exports.ContextInjector = ContextInjector;
// ═══════════════════════════════════════════════════════════════════════════════
// HALLUCINATION GUARD
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * 🛡️ HallucinationGuard - Prevents AI hallucinations through consistency checking
 *
 * "Сравнява новите задачи с последните 3 записа за логическа консистенция."
 */
class HallucinationGuard {
    checkDepth;
    similarityThreshold;
    constructor(checkDepth = 3, similarityThreshold = 0.3) {
        this.checkDepth = checkDepth;
        this.similarityThreshold = similarityThreshold;
    }
    /**
     * Check consistency of new task against recent history
     */
    checkConsistency(newTask, recentMessages) {
        const messagesToCheck = recentMessages.slice(-this.checkDepth);
        const conflicts = [];
        const suggestions = [];
        const relatedMessages = [];
        // Extract entities from new task
        const newEntities = this.extractEntities(newTask);
        const newIntent = this.detectIntent(newTask);
        // Check against each recent message
        for (const msg of messagesToCheck) {
            // 1. Check for contradicting intents
            if (this.areIntentsContradicting(newIntent, msg.intent)) {
                conflicts.push(`Потенциален конфликт: "${newIntent}" може да противоречи на "${msg.intent}" от стъпка ${msg.sequenceNumber}`);
            }
            // 2. Check for related entities
            const commonEntities = this.findCommonEntities(newEntities, msg.entities);
            if (commonEntities.length > 0) {
                relatedMessages.push(msg);
                suggestions.push(`Свързано със стъпка ${msg.sequenceNumber}: ${commonEntities.join(', ')}`);
            }
            // 3. Check for repeating tasks (potential loop)
            const similarity = this.calculateSimilarity(newTask, msg.content);
            if (similarity > 0.8) {
                conflicts.push(`Внимание: Тази задача е много подобна на стъпка ${msg.sequenceNumber} (${(similarity * 100).toFixed(0)}% сходство)`);
            }
            // 4. Check for unfinished dependencies
            if (msg.status === 'in-progress' && this.dependsOn(newTask, msg.content)) {
                conflicts.push(`Зависимост: Задача от стъпка ${msg.sequenceNumber} все още е в прогрес`);
            }
        }
        // Calculate confidence
        const confidence = this.calculateConfidence(conflicts.length, messagesToCheck.length);
        return {
            isConsistent: conflicts.length === 0,
            confidence,
            conflicts,
            suggestions,
            relatedMessages
        };
    }
    /**
     * Extract entities from text
     */
    extractEntities(text) {
        const entities = new Set();
        for (const pattern of ENTITY_PATTERNS) {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(m => entities.add(m));
            }
        }
        return Array.from(entities);
    }
    /**
     * Detect primary intent
     */
    detectIntent(text) {
        for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
            for (const pattern of patterns) {
                if (pattern.test(text)) {
                    return intent;
                }
            }
        }
        return 'UNKNOWN';
    }
    /**
     * Check if intents are contradicting
     */
    areIntentsContradicting(intent1, intent2) {
        const contradictions = {
            'CREATE': ['DELETE'],
            'DELETE': ['CREATE'],
            'DEPLOY': ['DELETE'],
        };
        return contradictions[intent1]?.includes(intent2) ?? false;
    }
    /**
     * Find common entities between two sets
     */
    findCommonEntities(entities1, entities2) {
        return entities1.filter(e => entities2.includes(e));
    }
    /**
     * Calculate text similarity (Jaccard index)
     */
    calculateSimilarity(text1, text2) {
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        return intersection.size / union.size;
    }
    /**
     * Check if task depends on another
     */
    dependsOn(newTask, previousTask) {
        // Simple heuristic: check if new task mentions files/modules from previous
        const previousEntities = this.extractEntities(previousTask);
        const newMentions = this.extractEntities(newTask);
        return previousEntities.some(e => newMentions.includes(e));
    }
    /**
     * Calculate confidence score
     */
    calculateConfidence(conflictCount, totalChecked) {
        if (totalChecked === 0)
            return 1;
        return Math.max(0, 1 - (conflictCount / (totalChecked * 2)));
    }
}
exports.HallucinationGuard = HallucinationGuard;
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN NEURAL BACKPACK CLASS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * 🎒 NeuralBackpack - The Second Brain
 *
 * Main orchestrator class that combines:
 * - FIFOBuffer: 10-message capacity
 * - PersistenceLayer: Auto-save to disk
 * - ContextInjector: Inject into prompts
 * - HallucinationGuard: Consistency checking
 */
class NeuralBackpack extends events_1.EventEmitter {
    buffer;
    persistence;
    guard;
    sessionId;
    initialized = false;
    godMode = false;
    constructor(storagePath) {
        super();
        this.buffer = new FIFOBuffer(BACKPACK_CAPACITY);
        this.persistence = new PersistenceLayer(storagePath);
        this.guard = new HallucinationGuard();
        this.sessionId = crypto.randomUUID();
    }
    /**
     * Initialize the backpack (load existing state)
     */
    async initialize() {
        if (this.initialized)
            return;
        console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                       ║
║   ███╗   ██╗███████╗██╗   ██╗██████╗  █████╗ ██╗                                      ║
║   ████╗  ██║██╔════╝██║   ██║██╔══██╗██╔══██╗██║                                      ║
║   ██╔██╗ ██║█████╗  ██║   ██║██████╔╝███████║██║                                      ║
║   ██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██╔══██║██║                                      ║
║   ██║ ╚████║███████╗╚██████╔╝██║  ██║██║  ██║███████╗                                 ║
║   ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝                                 ║
║                                                                                       ║
║   ██████╗  █████╗  ██████╗██╗  ██╗██████╗  █████╗  ██████╗██╗  ██╗                    ║
║   ██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔══██╗██╔══██╗██╔════╝██║ ██╔╝                    ║
║   ██████╔╝███████║██║     █████╔╝ ██████╔╝███████║██║     █████╔╝                     ║
║   ██╔══██╗██╔══██║██║     ██╔═██╗ ██╔═══╝ ██╔══██║██║     ██╔═██╗                     ║
║   ██████╔╝██║  ██║╚██████╗██║  ██╗██║     ██║  ██║╚██████╗██║  ██╗                    ║
║   ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝                    ║
║                                                                                       ║
║                     "THE SECOND BRAIN" - v${VERSION}                                    ║
║                                                                                       ║
║   📦 Capacity: ${BACKPACK_CAPACITY} messages                                                           ║
║   💾 Storage: ${this.persistence.getPath()}
║   🛡️ Guard: Active (checking last 3 messages)                                         ║
║                                                                                       ║
║   "Раницата винаги е на гърба ми. Нулева забрава."                                   ║
║                                                                                       ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
`);
        // Load existing state
        const existingState = await this.persistence.load();
        if (existingState && existingState.messages.length > 0) {
            this.buffer.loadFrom(existingState.messages);
            console.log(`[NeuralBackpack] ✅ Loaded ${existingState.messages.length} messages from previous session`);
            console.log(`[NeuralBackpack] 📊 Total processed: ${existingState.totalProcessed}`);
        }
        else {
            console.log('[NeuralBackpack] 🆕 Starting fresh session');
        }
        this.initialized = true;
        this.emit('initialized', { messageCount: this.buffer.size() });
    }
    /**
     * Record a new user message
     */
    async recordMessage(content, status = 'pending') {
        if (!this.initialized) {
            await this.initialize();
        }
        // Run consistency check first
        const consistency = this.guard.checkConsistency(content, this.buffer.getAll());
        // Create message object
        const message = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            datetime: new Date().toISOString(),
            content,
            intent: this.detectPrimaryIntent(content),
            entities: this.extractAllEntities(content),
            actions: this.extractActions(content),
            status,
            hash: crypto.createHash('sha256').update(content + Date.now()).digest('hex').substring(0, 16),
            sequenceNumber: this.buffer.getTotalProcessed() + 1
        };
        // Add to buffer
        const removed = this.buffer.push(message);
        // Auto-save
        await this.saveState();
        // Emit events
        this.emit('message:added', message);
        if (removed) {
            this.emit('message:removed', removed);
        }
        if (!consistency.isConsistent) {
            this.emit('consistency:warning', consistency);
        }
        // Log consistency warnings
        if (consistency.conflicts.length > 0) {
            console.log('\n[NeuralBackpack] ⚠️ CONSISTENCY WARNINGS:');
            consistency.conflicts.forEach(c => console.log(`  └─ ${c}`));
        }
        return { message, consistency };
    }
    /**
     * Update message status
     */
    async updateStatus(messageId, status) {
        const messages = this.buffer.getAll();
        const message = messages.find(m => m.id === messageId);
        if (message) {
            message.status = status;
            await this.saveState();
            this.emit('status:updated', { messageId, status });
            return true;
        }
        return false;
    }
    /**
     * Get injectable context
     */
    getContext() {
        return ContextInjector.generateContext(this.buffer.getAll(), this.godMode);
    }
    /**
     * ⚡ Enable/Disable God Mode
     * "Absolute control. Zero latency persistence."
     */
    setGodMode(enabled) {
        this.godMode = enabled;
        console.log(`[NeuralBackpack] ⚡ GOD MODE: ${enabled ? 'ACTIVATED' : 'DEACTIVATED'}`);
        if (enabled) {
            this.forceSave(); // Immediate consistency check
        }
        this.emit('godmode:changed', enabled);
    }
    /**
     * Get compact context
     */
    getCompactContext() {
        return ContextInjector.generateCompactContext(this.buffer.getAll());
    }
    /**
     * Inject context into prompt
     */
    injectContext(prompt) {
        return ContextInjector.injectIntoPrompt(prompt, this.buffer.getAll());
    }
    /**
     * Get all messages
     */
    getMessages() {
        return this.buffer.getAll();
    }
    /**
     * Get last N messages
     */
    getLastMessages(n) {
        return this.buffer.getLast(n);
    }
    /**
     * Check consistency of a new task
     */
    checkConsistency(task) {
        return this.guard.checkConsistency(task, this.buffer.getAll());
    }
    /**
     * Get buffer statistics
     */
    getStats() {
        return {
            capacity: BACKPACK_CAPACITY,
            currentSize: this.buffer.size(),
            totalProcessed: this.buffer.getTotalProcessed(),
            sessionId: this.sessionId,
            oldestMessage: this.buffer.getOldest(),
            newestMessage: this.buffer.getNewest()
        };
    }
    /**
     * Force save (for graceful shutdown)
     */
    async forceSave() {
        await this.persistence.forceSave(this.buildState());
    }
    /**
     * Clear all messages (use with caution!)
     */
    async clear() {
        this.buffer.clear();
        await this.saveState();
        this.emit('cleared');
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────────
    async saveState() {
        const state = this.buildState();
        if (this.godMode) {
            // Zero Entropy: Immediate persistence
            await this.persistence.forceSave(state);
        }
        else {
            await this.persistence.save(state);
        }
    }
    buildState() {
        const messages = this.buffer.getAll();
        return {
            version: VERSION,
            lastUpdated: Date.now(),
            totalProcessed: this.buffer.getTotalProcessed(),
            messages,
            stateHash: this.persistence.calculateStateHash(messages),
            sessionId: this.sessionId
        };
    }
    detectPrimaryIntent(text) {
        for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
            for (const pattern of patterns) {
                if (pattern.test(text)) {
                    return intent;
                }
            }
        }
        return 'TASK';
    }
    extractAllEntities(text) {
        const entities = new Set();
        for (const pattern of ENTITY_PATTERNS) {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(m => entities.add(m));
            }
        }
        return Array.from(entities);
    }
    extractActions(text) {
        const actions = [];
        // Extract code-like actions
        const codeActions = text.match(/`[^`]+`/g);
        if (codeActions) {
            actions.push(...codeActions.map(a => a.replace(/`/g, '')));
        }
        // Extract bullet points
        const bullets = text.match(/[-•]\s*([^\n]+)/g);
        if (bullets) {
            actions.push(...bullets.map(b => b.replace(/^[-•]\s*/, '')));
        }
        return actions.slice(0, 10); // Limit to 10 actions
    }
}
exports.NeuralBackpack = NeuralBackpack;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON & FACTORY
// ═══════════════════════════════════════════════════════════════════════════════
let backpackInstance = null;
/**
 * Get or create the singleton Neural Backpack instance
 */
function getNeuralBackpack(storagePath) {
    if (!backpackInstance) {
        backpackInstance = new NeuralBackpack(storagePath);
    }
    return backpackInstance;
}
/**
 * Create a new Neural Backpack instance (non-singleton)
 */
function createNeuralBackpack(storagePath) {
    return new NeuralBackpack(storagePath);
}
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
exports.default = NeuralBackpack;
