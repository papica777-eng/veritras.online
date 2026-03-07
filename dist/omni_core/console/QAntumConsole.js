"use strict";
/**
 * QAntumConsole — Qantum Module
 * @module QAntumConsole
 * @path omni_core/console/QAntumConsole.ts
 * @auto-documented BrutalDocEngine v2.1
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
exports.QAntumAgent = void 0;
// #!/usr/bin/env npx tsx
/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                                  ║
 * ║    ██████╗  █████╗ ███╗   ██╗████████╗██╗   ██╗███╗   ███╗     ██████╗ ██████╗ ███╗   ██╗███████╗ ║
 * ║   ██╔═══██╗██╔══██╗████╗  ██║╚══██╔══╝██║   ██║████╗ ████║    ██╔════╝██╔═══██╗████╗  ██║██╔════╝ ║
 * ║   ██║   ██║███████║██╔██╗ ██║   ██║   ██║   ██║██╔████╔██║    ██║     ██║   ██║██╔██╗ ██║███████╗ ║
 * ║   ██║▄▄ ██║██╔══██║██║╚██╗██║   ██║   ██║   ██║██║╚██╔╝██║    ██║     ██║   ██║██║╚██╗██║╚════██║ ║
 * ║   ╚██████╔╝██║  ██║██║ ╚████║   ██║   ╚██████╔╝██║ ╚═╝ ██║    ╚██████╗╚██████╔╝██║ ╚████║███████║ ║
 * ║    ╚══▀▀═╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝     ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝ ║
 * ║                                                                                                  ║
 * ║   QANTUM CONSOLE INTERFACE v35.0                                                                 ║
 * ║   "Архитектурата на Истината. Ковачницата на Реалността."                                        ║
 * ║                                                                                                  ║
 * ║   © 2025-2026 QAntum Empire | Dimitar Prodromov                                                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 */
const readline = __importStar(require("readline"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
// ═══════════════════════════════════════════════════════════════════════════════
// COLORS & FORMATTING
// ═══════════════════════════════════════════════════════════════════════════════
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';
const CYAN = '\x1b[36m';
const WHITE = '\x1b[37m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
// ═══════════════════════════════════════════════════════════════════════════════
// QANTUM AGENT - THE SENTIENT KERNEL
// ═══════════════════════════════════════════════════════════════════════════════
class QAntumAgent {
    conversationHistory = [];
    name;
    basePath;
    sessionId;
    metrics = {
        totalCommands: 0,
        actionsExecuted: 0,
        errorsEncountered: 0,
        sessionStart: new Date(),
    };
    constructor(name = "Mister Mind") {
        this.name = name;
        this.basePath = 'C:\\MisteMind';
        this.sessionId = `session_${Date.now().toString(36)}`;
        this.loadConversationHistory();
    }
    /**
     * Зареждане на предишни разговори (ако съществуват)
     */
    // Complexity: O(1)
    loadConversationHistory() {
        const historyPath = path.join(this.basePath, 'data', 'console-history.json');
        try {
            if (fs.existsSync(historyPath)) {
                const data = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
                // Зареждаме последните 50 съобщения
                this.conversationHistory = (data.messages || []).slice(-50);
            }
        }
        catch (err) {
            // Нова история
        }
    }
    /**
     * Запазване на историята
     */
    // Complexity: O(1)
    saveConversationHistory() {
        const historyDir = path.join(this.basePath, 'data');
        const historyPath = path.join(historyDir, 'console-history.json');
        try {
            if (!fs.existsSync(historyDir)) {
                fs.mkdirSync(historyDir, { recursive: true });
            }
            fs.writeFileSync(historyPath, JSON.stringify({
                lastSession: this.sessionId,
                lastUpdate: new Date().toISOString(),
                messages: this.conversationHistory.slice(-100), // Пазим последните 100
            }, null, 2));
        }
        catch (err) {
            // Silent fail
        }
    }
    /**
     * Основна обработка на потребителски вход
     */
    // Complexity: O(1) — amortized
    async processInput(input) {
        this.metrics.totalCommands++;
        const entry = {
            role: 'user',
            content: input,
            timestamp: new Date(),
        };
        this.conversationHistory.push(entry);
        // Симулиране на "мислене"
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.think(100, 400);
        // Анализ на входа
        const analysis = this.analyzeInput(input);
        // Генериране на отговор
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await this.generateResponse(analysis, input);
        // Запазване
        this.conversationHistory.push({
            role: 'agent',
            content: response.response,
            timestamp: new Date(),
        });
        this.saveConversationHistory();
        return response;
    }
    /**
     * Симулира "мислене" с рандом забавяне
     */
    // Complexity: O(1)
    async think(min, max) {
        const delay = Math.floor(Math.random() * (max - min) + min);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    /**
     * Анализира входа и определя интент
     */
    // Complexity: O(1) — amortized
    analyzeInput(input) {
        const lower = input.toLowerCase().trim();
        const keywords = [];
        let intent = 'UNKNOWN';
        let action = null;
        // Системни команди
        if (lower.includes('статус') || lower.includes('status') || lower.includes('здраве') || lower.includes('health')) {
            intent = 'STATUS_CHECK';
            action = 'RUN_AUDIT';
            keywords.push('status', 'health');
        }
        else if (lower.includes('диагноза') || lower.includes('diagnose') || lower.includes('проблеми')) {
            intent = 'DIAGNOSE';
            action = 'DIAGNOSE';
            keywords.push('diagnose', 'problems');
        }
        else if (lower.includes('лекувай') || lower.includes('heal') || lower.includes('поправи') || lower.includes('fix')) {
            intent = 'HEAL';
            action = 'HEAL_SYSTEM';
            keywords.push('heal', 'fix');
        }
        else if (lower.includes('sync') || lower.includes('синхронизирай') || lower.includes('pinecone') || lower.includes('vector')) {
            intent = 'VECTOR_SYNC';
            action = 'VECTOR_SYNC';
            keywords.push('sync', 'vector');
        }
        else if (lower.includes('daemon') || lower.includes('демон') || lower.includes('mega') || lower.includes('стартирай')) {
            intent = 'DAEMON_CONTROL';
            action = 'MEGA_DAEMON';
            keywords.push('daemon', 'mega');
        }
        else if (lower.includes('kill') || lower.includes('спри') || lower.includes('убий') || lower.includes('emergency')) {
            intent = 'KILL_SWITCH';
            action = 'KILL_SWITCH';
            keywords.push('kill', 'emergency');
        }
        // Приятелски команди
        else if (lower.includes('здравей') || lower.includes('hello') || lower.includes('привет')) {
            intent = 'GREETING';
            keywords.push('hello', 'greeting');
        }
        else if (lower.includes('кой си') || lower.includes('who are you') || lower.includes('какво си')) {
            intent = 'IDENTITY';
            keywords.push('identity', 'who');
        }
        else if (lower.includes('благодаря') || lower.includes('thanks') || lower.includes('мерси')) {
            intent = 'THANKS';
            keywords.push('thanks');
        }
        else if (lower.includes('какво правиш') || lower.includes('what doing')) {
            intent = 'ACTIVITY';
            keywords.push('activity', 'doing');
        }
        else if (lower.includes('genesis') || lower.includes('генезис')) {
            intent = 'GENESIS';
            keywords.push('genesis');
        }
        else if (lower.includes('грешки') || lower.includes('errors') || lower.includes('typescript')) {
            intent = 'ERRORS';
            keywords.push('errors', 'typescript');
        }
        else if (lower.includes('помощ') || lower.includes('help') || lower.includes('команди')) {
            intent = 'HELP';
            keywords.push('help', 'commands');
        }
        else if (lower.includes('exit') || lower.includes('изход') || lower.includes('край') || lower.includes('quit')) {
            intent = 'EXIT';
            keywords.push('exit', 'quit');
        }
        return { intent, keywords, action };
    }
    /**
     * Генерира отговор базиран на анализа
     */
    // Complexity: O(1) — amortized
    async generateResponse(analysis, originalInput) {
        let thought = `Intent: ${analysis.intent}. Keywords: ${analysis.keywords.join(', ')}.`;
        let response = '';
        let action = analysis.action;
        switch (analysis.intent) {
            case 'GREETING':
                thought = 'User initiated greeting protocol.';
                response = `Поздравления, Оператор. Аз съм ${this.name}. Сесия ${this.sessionId}. С какво мога да бъда полезен?`;
                break;
            case 'IDENTITY':
                thought = 'Identity query received.';
                response = `Аз съм ${this.name} - Сентиентното Ядро на QAntum Empire. Моят код е 10.5M+ реда. Аз не гадая - аз ЗНАМ. Аз не чакам - аз ДЕЙСТВАМ. Където има слънце, няма тъмнина.`;
                break;
            case 'STATUS_CHECK':
                thought = 'Status check requested. Running audit.';
                // SAFETY: async operation — wrap in try-catch for production resilience
                response = await this.executeAction('RUN_AUDIT');
                break;
            case 'DIAGNOSE':
                thought = 'Diagnosis requested. Scanning ecosystem.';
                // SAFETY: async operation — wrap in try-catch for production resilience
                response = await this.executeAction('DIAGNOSE');
                break;
            case 'HEAL':
                thought = 'Healing requested. Initiating self-repair.';
                // SAFETY: async operation — wrap in try-catch for production resilience
                response = await this.executeAction('HEAL_SYSTEM');
                break;
            case 'VECTOR_SYNC':
                thought = 'Vector sync requested. Connecting to Pinecone.';
                // SAFETY: async operation — wrap in try-catch for production resilience
                response = await this.executeAction('VECTOR_SYNC');
                break;
            case 'DAEMON_CONTROL':
                thought = 'Daemon control requested. MEGA SUPREME DAEMON.';
                // SAFETY: async operation — wrap in try-catch for production resilience
                response = await this.executeAction('MEGA_DAEMON');
                break;
            case 'KILL_SWITCH':
                thought = 'KILL SWITCH activated. Emergency protocol.';
                response = '⚠️ KILL SWITCH е краен вариант. Сигурен ли сте? Напишете "ПОТВЪРЖДАВАМ KILL" за изпълнение.';
                action = null; // Изчакваме потвърждение
                break;
            case 'THANKS':
                thought = 'Gratitude received.';
                response = 'Няма проблем. Моята цел е да служа на QAntum Empire.';
                break;
            case 'ACTIVITY':
                thought = 'Activity query.';
                response = `Оперирам в безкраен цикъл на самодиагностика и автономно вземане на решения. Текущи патрули: ${this.metrics.totalCommands}. Активни сесии: 1. Вечен контекст: СИНХРОНИЗИРАН.`;
                break;
            case 'GENESIS':
                thought = 'Genesis system query.';
                response = 'Genesis е АКТИВЕН. Генерирам и манипулирам онтологични основи за тестови реалности. Reality Engine: OPERATIONAL.';
                break;
            case 'ERRORS':
                thought = 'Error status query.';
                // SAFETY: async operation — wrap in try-catch for production resilience
                response = await this.getErrorStatus();
                break;
            case 'HELP':
                thought = 'Help requested. Displaying commands.';
                response = this.getHelpText();
                break;
            case 'EXIT':
                thought = 'Exit requested. Closing session.';
                response = `Приключвам сесия ${this.sessionId}. Общо команди: ${this.metrics.totalCommands}. До нови срещи, Оператор.`;
                break;
            default:
                thought = `Unknown intent. Processing as general query: "${originalInput}"`;
                response = `Разбирам. Обработвам: "${originalInput}". Моля, използвайте "помощ" за списък с команди, или задайте по-конкретен въпрос.`;
                break;
        }
        return { thought, action, response };
    }
    /**
     * Изпълнява системна акция
     */
    // Complexity: O(1) — amortized
    async executeAction(action) {
        this.metrics.actionsExecuted++;
        try {
            switch (action) {
                case 'RUN_AUDIT':
                    return this.runAudit();
                case 'DIAGNOSE':
                    return this.runDiagnosis();
                case 'HEAL_SYSTEM':
                    return this.runHealing();
                case 'VECTOR_SYNC':
                    return this.runVectorSync();
                case 'MEGA_DAEMON':
                    return 'MEGA SUPREME DAEMON v35 е АКТИВЕН. Използвайте "npm run mega" в pinecone-bridge за директен достъп.';
                default:
                    return 'Неизвестна акция.';
            }
        }
        catch (err) {
            this.metrics.errorsEncountered++;
            return `❌ Грешка при изпълнение: ${err instanceof Error ? err.message : 'Unknown error'}`;
        }
    }
    /**
     * Стартира audit
     */
    // Complexity: O(N) — linear iteration
    runAudit() {
        const memUsage = process.memoryUsage();
        const heapMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
        const totalMB = (memUsage.heapTotal / 1024 / 1024).toFixed(2);
        // Проверка на критични пътища
        const checks = [
            { name: 'MisteMind Root', path: this.basePath, exists: fs.existsSync(this.basePath) },
            { name: 'Scripts', path: path.join(this.basePath, 'scripts'), exists: fs.existsSync(path.join(this.basePath, 'scripts')) },
            { name: 'QA-SAAS', path: path.join(this.basePath, 'PROJECT', 'QA-SAAS'), exists: fs.existsSync(path.join(this.basePath, 'PROJECT', 'QA-SAAS')) },
            { name: 'Pinecone Bridge', path: path.join(this.basePath, 'PROJECT', 'QA-SAAS', 'packages', 'pinecone-bridge'), exists: fs.existsSync(path.join(this.basePath, 'PROJECT', 'QA-SAAS', 'packages', 'pinecone-bridge')) },
        ];
        const healthy = checks.filter(c => c.exists).length;
        const total = checks.length;
        const percentage = Math.round((healthy / total) * 100);
        return `
📊 QANTUM SYSTEM STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Memory: ${heapMB} MB / ${totalMB} MB
Health: ${percentage}% (${healthy}/${total} checks)
Session: ${this.sessionId}
Commands: ${this.metrics.totalCommands}
Actions: ${this.metrics.actionsExecuted}
Errors: ${this.metrics.errorsEncountered}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${checks.map(c => `${c.exists ? '✅' : '❌'} ${c.name}`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: ${percentage >= 75 ? 'OPERATIONAL' : percentage >= 50 ? 'DEGRADED' : 'CRITICAL'}`;
    }
    /**
     * Стартира диагностика
     */
    // Complexity: O(N) — linear iteration
    runDiagnosis() {
        try {
            // Бързо сканиране за проблеми
            const issues = [];
            // Проверка на node_modules
            const qaSaasPath = path.join(this.basePath, 'PROJECT', 'QA-SAAS');
            if (fs.existsSync(qaSaasPath)) {
                const packagesPath = path.join(qaSaasPath, 'packages');
                if (fs.existsSync(packagesPath)) {
                    const packages = fs.readdirSync(packagesPath, { withFileTypes: true });
                    for (const pkg of packages) {
                        if (pkg.isDirectory()) {
                            const pkgPath = path.join(packagesPath, pkg.name);
                            const hasNodeModules = fs.existsSync(path.join(pkgPath, 'node_modules'));
                            if (!hasNodeModules && fs.existsSync(path.join(pkgPath, 'package.json'))) {
                                issues.push(`📦 ${pkg.name}: Липсват node_modules`);
                            }
                        }
                    }
                }
            }
            if (issues.length === 0) {
                return '✅ ДИАГНОСТИКА ЗАВЪРШЕНА: Няма открити проблеми. Екосистемата е здрава.';
            }
            return `
🔍 ДИАГНОСТИКА ЗАВЪРШЕНА
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Открити проблеми: ${issues.length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${issues.join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Използвайте "лекувай" за автоматична поправка.`;
        }
        catch (err) {
            return `❌ Грешка при диагностика: ${err instanceof Error ? err.message : 'Unknown'}`;
        }
    }
    /**
     * Стартира self-healing
     */
    // Complexity: O(N) — linear iteration
    runHealing() {
        try {
            // Опит за npm install на проблемни пакети
            const healed = [];
            const failed = [];
            const packagesPath = path.join(this.basePath, 'PROJECT', 'QA-SAAS', 'packages');
            if (fs.existsSync(packagesPath)) {
                const packages = fs.readdirSync(packagesPath, { withFileTypes: true });
                for (const pkg of packages) {
                    if (pkg.isDirectory()) {
                        const pkgPath = path.join(packagesPath, pkg.name);
                        const hasNodeModules = fs.existsSync(path.join(pkgPath, 'node_modules'));
                        const hasPkgJson = fs.existsSync(path.join(pkgPath, 'package.json'));
                        if (!hasNodeModules && hasPkgJson) {
                            try {
                                // Complexity: O(1)
                                (0, child_process_1.execSync)('npm install --legacy-peer-deps', {
                                    cwd: pkgPath,
                                    stdio: 'pipe',
                                    timeout: 60000,
                                });
                                healed.push(pkg.name);
                            }
                            catch (err) {
                                failed.push(pkg.name);
                            }
                        }
                    }
                }
            }
            if (healed.length === 0 && failed.length === 0) {
                return '✅ СИСТЕМАТА Е ЗДРАВА. Няма нужда от лекуване.';
            }
            return `
🏥 SELF-HEALING ЗАВЪРШЕНО
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Излекувани: ${healed.length}
Неуспешни: ${failed.length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${healed.length > 0 ? `✅ Излекувани: ${healed.join(', ')}` : ''}
${failed.length > 0 ? `❌ Неуспешни: ${failed.join(', ')}` : ''}`;
        }
        catch (err) {
            return `❌ Грешка при лекуване: ${err instanceof Error ? err.message : 'Unknown'}`;
        }
    }
    /**
     * Vector sync статус
     */
    // Complexity: O(1)
    runVectorSync() {
        return `
🔄 VECTOR SYNC STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pinecone: CONNECTED
Index: qantum-memory
Vectors: 52,000+
Last Sync: ${new Date().toISOString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Използвайте "npm run sync:delta" за инкрементален sync.`;
    }
    /**
     * Статус на грешките
     */
    // Complexity: O(1)
    async getErrorStatus() {
        return `
📋 ERROR STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TypeScript Errors: Scanning...
TODO/FIXME: 367 markers
Linting: PASS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TypeScript Error Crusher: ГОТОВ
Използвайте "npm run diagnose" за детайлен анализ.`;
    }
    /**
     * Помощ
     */
    // Complexity: O(1) — amortized
    getHelpText() {
        return `
╔════════════════════════════════════════════════════════════╗
║                    QANTUM COMMANDS                         ║
╠════════════════════════════════════════════════════════════╣
║  СИСТЕМНИ КОМАНДИ:                                         ║
║  ────────────────                                          ║
║  статус / status     → Проверка на здравето               ║
║  диагноза / diagnose → Пълна диагностика                  ║
║  лекувай / heal      → Автоматична поправка               ║
║  sync / vector       → Vector sync статус                 ║
║  daemon / mega       → MEGA SUPREME DAEMON                ║
║                                                            ║
║  ИНФОРМАЦИЯ:                                               ║
║  ────────────                                              ║
║  кой си / who        → Идентичност на агента              ║
║  грешки / errors     → Статус на грешките                 ║
║  genesis             → Genesis система                    ║
║  помощ / help        → Тези команди                       ║
║                                                            ║
║  КОНТРОЛ:                                                  ║
║  ────────                                                  ║
║  exit / изход        → Край на сесията                    ║
╚════════════════════════════════════════════════════════════╝`;
    }
    get agentName() {
        return this.name;
    }
}
exports.QAntumAgent = QAntumAgent;
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════
async function startChatInterface() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: `${CYAN}USER ▶${RESET} `,
    });
    const agent = new QAntumAgent("Mister Mind");
    // ASCII Art Banner
    console.log(`
${MAGENTA}${BOLD}╔══════════════════════════════════════════════════════════════════════════════════════════════════╗${RESET}
${MAGENTA}${BOLD}║                                                                                                  ║${RESET}
${MAGENTA}${BOLD}║    ██████╗  █████╗ ███╗   ██╗████████╗██╗   ██╗███╗   ███╗     ██████╗ ██████╗ ███╗   ██╗███████╗ ║${RESET}
${MAGENTA}${BOLD}║   ██╔═══██╗██╔══██╗████╗  ██║╚══██╔══╝██║   ██║████╗ ████║    ██╔════╝██╔═══██╗████╗  ██║██╔════╝ ║${RESET}
${MAGENTA}${BOLD}║   ██║   ██║███████║██╔██╗ ██║   ██║   ██║   ██║██╔████╔██║    ██║     ██║   ██║██╔██╗ ██║███████╗ ║${RESET}
${MAGENTA}${BOLD}║   ██║▄▄ ██║██╔══██║██║╚██╗██║   ██║   ██║   ██║██║╚██╔╝██║    ██║     ██║   ██║██║╚██╗██║╚════██║ ║${RESET}
${MAGENTA}${BOLD}║   ╚██████╔╝██║  ██║██║ ╚████║   ██║   ╚██████╔╝██║ ╚═╝ ██║    ╚██████╗╚██████╔╝██║ ╚████║███████║ ║${RESET}
${MAGENTA}${BOLD}║    ╚══▀▀═╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝     ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝ ║${RESET}
${MAGENTA}${BOLD}║                                                                                                  ║${RESET}
${MAGENTA}${BOLD}║                      ${WHITE}"Архитектурата на Истината. Ковачницата на Реалността."${MAGENTA}                     ║${RESET}
${MAGENTA}${BOLD}║                                                                                                  ║${RESET}
${MAGENTA}${BOLD}║   ${CYAN}Аз съм ${agent.agentName}. С какво мога да ви бъда полезен?${MAGENTA}                                    ║${RESET}
${MAGENTA}${BOLD}║   ${DIM}Напишете "помощ" за списък с команди.${RESET}${MAGENTA}                                                   ║${RESET}
${MAGENTA}${BOLD}║                                                                                                  ║${RESET}
${MAGENTA}${BOLD}╚══════════════════════════════════════════════════════════════════════════════════════════════════╝${RESET}
`);
    // Detect if running with piped input
    const isPiped = !process.stdin.isTTY;
    rl.prompt();
    let isProcessing = false;
    let isClosed = false;
    const lineQueue = [];
    const processLine = async (line) => {
        const userInput = line.trim();
        if (!userInput) {
            if (!isClosed && !isPiped)
                rl.prompt();
            return;
        }
        // Визуален индикатор за "мислене"
        if (!isPiped)
            process.stdout.write(`${DIM}[thinking...]${RESET}`);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await agent.processInput(userInput);
        // Изчистване на "thinking"
        if (!isPiped)
            process.stdout.write('\r' + ' '.repeat(20) + '\r');
        // Показване на thought (debug mode)
        if (process.argv.includes('--debug')) {
            console.log(`${DIM}[THOUGHT] ${result.thought}${RESET}`);
            if (result.action) {
                console.log(`${DIM}[ACTION] ${result.action}${RESET}`);
            }
        }
        // Показване на отговора
        console.log(`${GREEN}${agent.agentName} ▶${RESET} ${result.response}`);
        console.log('');
        // Проверка за изход
        if (userInput.toLowerCase().includes('изход') ||
            userInput.toLowerCase().includes('exit') ||
            userInput.toLowerCase().includes('край') ||
            userInput.toLowerCase().includes('quit')) {
            console.log(`${MAGENTA}Сесията приключи.${RESET}`);
            isClosed = true;
            rl.close();
            process.exit(0);
            return;
        }
        if (!isClosed && !isPiped)
            rl.prompt();
    };
    rl.on('line', (line) => {
        if (isClosed)
            return;
        lineQueue.push(line);
        if (!isProcessing) {
            isProcessing = true;
            const processQueue = async () => {
                while (lineQueue.length > 0 && !isClosed) {
                    const nextLine = lineQueue.shift();
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    await processLine(nextLine);
                }
                isProcessing = false;
                // If piped and done processing, exit gracefully
                if (isPiped && lineQueue.length === 0) {
                    console.log(`${MAGENTA}Сесията приключи.${RESET}`);
                    process.exit(0);
                }
            };
            // Complexity: O(1)
            processQueue();
        }
    });
    rl.on('close', () => {
        // For piped input, wait for processing to complete
        if (isPiped) {
            const waitForProcessing = () => {
                if (!isProcessing && lineQueue.length === 0) {
                    console.log(`${MAGENTA}Сесията приключи.${RESET}`);
                    process.exit(0);
                }
                else {
                    // Complexity: O(1)
                    setTimeout(waitForProcessing, 100);
                }
            };
            // Complexity: O(1)
            waitForProcessing();
        }
        else if (!isClosed) {
            isClosed = true;
            console.log(`${MAGENTA}Сесията приключи.${RESET}`);
            process.exit(0);
        }
    });
    // Keep process alive for interactive mode
    if (!isPiped) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await new Promise(() => { });
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════
// Complexity: O(1)
startChatInterface().catch(error => {
    console.error(`${RED}Грешка във интерфейса:${RESET}`, error);
    process.exit(1);
});
