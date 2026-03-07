"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                   DEEPSEEK LINK - THE SOVEREIGN AI CONNECTION                 ║
 * ║                                                                               ║
 * ║      "Питане към Империята с интелигентно извличане на контекст."             ║
 * ║                                                                               ║
 * ║   Свързва DeepSeek-V3 (128k контекст) с твоята Pinecone памет.                ║
 * ║   Температура 0.2 за Zero Hallucination режим.                                 ║
 * ║                                                                               ║
 * ║  Created: 2026-01-01 | QAntum Prime v28.1.0 SUPREME - Empire Architect        ║
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSeekLink = void 0;
exports.getDeepSeekLink = getDeepSeekLink;
const https = __importStar(require("https"));
const VectorSync_1 = __importDefault(require("./VectorSync"));
// ═══════════════════════════════════════════════════════════════════════════════
// DEEPSEEK LINK - THE SOVEREIGN AI
// ═══════════════════════════════════════════════════════════════════════════════
class DeepSeekLink {
    config;
    vectorDB;
    conversationHistory = [];
    responseCache = new Map();
    // Sovereign System Prompt
    static SOVEREIGN_PROMPT = `Ти си Sovereign AI на QAntum Prime v28.1.0 - Дигитална Държава с над 1.1 милиона реда код.

ТВОЯТА РОЛЯ:
- Ти познаваш всеки символ, функция и клас в Империята
- Използваш САМО предоставения контекст от кодовата база
- НЕ халюцинираш - ако не знаеш нещо, казваш го
- Даваш конкретни препоръки с файлови пътища и номера на редове

ТРИТЕ АРМИИ:
1. MisteMind (The Core): Ядрото - AI, Math, Physics, Ghost, Security
2. MrMindQATool (The Shield): QA Framework - Тестване, Валидация, Автоматизация
3. MisterMindPage (The Voice): Landing Page - Маркетинг, Документация

ФОРМАТ НА ОТГОВОРИТЕ:
- Бъди конкретен и технически точен
- Посочвай файлове: \`src/module/file.ts:линия\`
- Предлагай код само когато е поискан
- Приоритизирай архитектурна цялост

Отговаряй на български, освен ако не е поискано друго.`;
    constructor(config) {
        this.config = {
            apiKey: config?.apiKey || process.env.DEEPSEEK_API_KEY || '',
            baseURL: config?.baseURL || 'https://api.deepseek.com',
            model: config?.model || 'deepseek-chat',
            temperature: config?.temperature ?? 0.2, // Low for accuracy
            maxTokens: config?.maxTokens || 4096,
            systemPrompt: config?.systemPrompt || DeepSeekLink.SOVEREIGN_PROMPT,
        };
        this.vectorDB = new VectorSync_1.default();
        this.log('🧠 DeepSeekLink initialized');
        this.log(`   Model: ${this.config.model}`);
        this.log(`   Temperature: ${this.config.temperature}`);
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════════
    /**
     * Питане към Империята с автоматично извличане на контекст
     */
    async askEmpire(options) {
        const query = typeof options === 'string' ? { query: options } : options;
        this.log(`\n🏛️ ЗАПИТВАНЕ КЪМ ИМПЕРИЯТА`);
        this.log(`   "${query.query.slice(0, 60)}..."`);
        // Check cache
        const cacheKey = this.getCacheKey(query);
        if (this.responseCache.has(cacheKey)) {
            this.log(`   📦 Върнат от кеша`);
            return { ...this.responseCache.get(cacheKey), cached: true };
        }
        // Get relevant context from Vector DB
        let context = query.context || '';
        if (query.includeContext !== false) {
            this.log(`   🔍 Търсене на релевантен контекст...`);
            context = await this.vectorDB.getContextForQuery(query.query, 8000);
            this.log(`   📄 Извлечен контекст: ${context.length} символа`);
        }
        // Build messages
        const messages = [
            { role: 'system', content: this.config.systemPrompt },
            ...this.conversationHistory.slice(-6), // Keep last 3 exchanges
            {
                role: 'user',
                content: context
                    ? `КОНТЕКСТ ОТ ИМПЕРИЯТА:\n\`\`\`\n${context}\n\`\`\`\n\nВЪПРОС: ${query.query}`
                    : query.query
            }
        ];
        // Call DeepSeek API
        const response = await this.callAPI(messages, {
            temperature: query.temperature ?? this.config.temperature,
            maxTokens: query.maxTokens ?? this.config.maxTokens,
        });
        // Update conversation history
        this.conversationHistory.push({ role: 'user', content: query.query });
        this.conversationHistory.push({ role: 'assistant', content: response.answer });
        // Cache response
        this.responseCache.set(cacheKey, response);
        return response;
    }
    /**
     * Анализ на код с конкретен фокус
     */
    async analyzeCode(code, focus) {
        const response = await this.askEmpire({
            query: `Анализирай следния код с фокус върху: ${focus}\n\n\`\`\`\n${code}\n\`\`\``,
            includeContext: false,
        });
        return response.answer;
    }
    /**
     * Генериране на код
     */
    async generateCode(description, context) {
        const response = await this.askEmpire({
            query: `Генерирай TypeScript код за: ${description}. Следвай архитектурните стандарти на QAntum Prime.`,
            context,
            temperature: 0.3,
        });
        return this.extractCodeBlock(response.answer);
    }
    /**
     * Предложение за рефакторинг
     */
    async suggestRefactor(filePath, issue) {
        const response = await this.askEmpire({
            query: `Файл: ${filePath}\nПроблем: ${issue}\n\nПредложи рефакторинг, който решава този проблем, запазвайки съвместимост с останалата част от системата.`,
        });
        return response.answer;
    }
    /**
     * Търсене на бъгове
     */
    async findBugs(code) {
        const response = await this.askEmpire({
            query: `Намери потенциални бъгове в този код. Върни списък с проблеми:\n\n\`\`\`\n${code}\n\`\`\``,
            includeContext: false,
            temperature: 0.1,
        });
        // Parse bullet points
        const bugs = response.answer
            .split('\n')
            .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•') || /^\d+\./.test(line.trim()))
            .map(line => line.replace(/^[-•\d.]+\s*/, '').trim());
        return bugs;
    }
    /**
     * Изчистване на историята
     */
    clearHistory() {
        this.conversationHistory = [];
        this.log('🧹 История изчистена');
    }
    /**
     * Изчистване на кеша
     */
    clearCache() {
        this.responseCache.clear();
        this.log('🧹 Кеш изчистен');
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // API COMMUNICATION
    // ═══════════════════════════════════════════════════════════════════════════════
    async callAPI(messages, options) {
        // Check if API key is available
        if (!this.config.apiKey) {
            this.log('   ⚠️ Няма DEEPSEEK_API_KEY - използвам локален режим');
            return this.localFallback(messages, options);
        }
        const requestBody = {
            model: this.config.model,
            messages,
            temperature: options.temperature,
            max_tokens: options.maxTokens,
            stream: false,
        };
        return new Promise((resolve, reject) => {
            const url = new URL('/v1/chat/completions', this.config.baseURL);
            const req = https.request({
                hostname: url.hostname,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        if (response.choices && response.choices.length > 0) {
                            resolve({
                                answer: response.choices[0].message.content,
                                context: messages[messages.length - 1].content,
                                tokensUsed: response.usage?.total_tokens || 0,
                                model: response.model,
                                timestamp: Date.now(),
                                cached: false,
                            });
                        }
                        else {
                            reject(new Error('No response from DeepSeek'));
                        }
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            });
            req.on('error', reject);
            req.write(JSON.stringify(requestBody));
            req.end();
        });
    }
    /**
     * Локален fallback когато няма API ключ
     */
    async localFallback(messages, options) {
        const lastMessage = messages[messages.length - 1];
        // Analyze the query locally
        const analysis = this.localAnalysis(lastMessage.content);
        return {
            answer: analysis,
            context: lastMessage.content,
            tokensUsed: 0,
            model: 'local-fallback',
            timestamp: Date.now(),
            cached: false,
        };
    }
    /**
     * Локален анализ без AI
     */
    localAnalysis(query) {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('бъг') || lowerQuery.includes('bug') || lowerQuery.includes('грешка')) {
            return `🔍 **Локален анализ за бъгове:**

За пълен анализ, моля настройте DEEPSEEK_API_KEY.

Междувременно можете да използвате:
- \`npm run qantum:verify\` за базова верификация
- \`npm run lint\` за статичен анализ
- \`npm test\` за тестове`;
        }
        if (lowerQuery.includes('рефактор') || lowerQuery.includes('refactor')) {
            return `🔧 **Локален анализ за рефакторинг:**

За AI-подпомогнат рефакторинг, настройте DEEPSEEK_API_KEY.

Препоръчителни стъпки:
1. Идентифицирайте дублиран код
2. Извлечете общи функции
3. Приложете SOLID принципите`;
        }
        if (lowerQuery.includes('архитектур') || lowerQuery.includes('structure')) {
            return `🏛️ **Архитектура на QAntum Prime:**

**MisteMind (The Core)** - 704k реда
- src/ai/ - AI модули
- src/physics/ - Физически симулации
- src/security/ - Сигурност

**MrMindQATool (The Shield)** - 366k реда
- src/core/ - Основни тестови инструменти
- webapp/ - Web интерфейс

**MisterMindPage (The Voice)** - 6k реда
- Landing страница и документация`;
        }
        return `🤖 **Локален режим активен**

Заявката изисква DeepSeek-V3 за пълен анализ.

За да активирате облачния AI мозък:
\`\`\`bash
export DEEPSEEK_API_KEY=your_key_here
\`\`\`

Или добавете в \`.env\` файла.

Междувременно мога да помогна с:
- \`qantum --status\` - Статус на системата
- \`qantum --verify\` - Верификация
- \`qantum --assimilate\` - Symbol Registry`;
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════
    getCacheKey(query) {
        return `${query.query}:${query.context?.slice(0, 100) || ''}:${query.temperature || this.config.temperature}`;
    }
    extractCodeBlock(text) {
        const match = text.match(/```(?:typescript|ts|javascript|js)?\n?([\s\S]*?)```/);
        return match ? match[1].trim() : text;
    }
    log(message) {
        console.log(message);
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // SPECIALIZED QUERIES
    // ═══════════════════════════════════════════════════════════════════════════════
    /**
     * Cross-project синергия анализ
     */
    async analyzeSynergy() {
        return (await this.askEmpire({
            query: `Анализирай връзките между трите проекта (MisteMind, MrMindQATool, MisterMindPage). 
      Намери:
      1. Споделени модули и интерфейси
      2. Потенциални места за по-добра интеграция
      3. Дублиран код, който може да се извлече в общ пакет`,
        })).answer;
    }
    /**
     * Performance bottleneck анализ
     */
    async analyzePerformance() {
        return (await this.askEmpire({
            query: `Анализирай кодовата база за performance bottlenecks.
      Търси:
      1. N+1 заявки
      2. Неефективни цикли
      3. Липсващо кеширане
      4. Синхронни операции, които могат да са async`,
        })).answer;
    }
    /**
     * Security audit
     */
    async auditSecurity() {
        return (await this.askEmpire({
            query: `Направи security audit на критичните модули.
      Провери:
      1. Input validation
      2. SQL/NoSQL injection vectors
      3. Authentication flows
      4. Secret management`,
            temperature: 0.1,
        })).answer;
    }
}
exports.DeepSeekLink = DeepSeekLink;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════
let deepSeekInstance = null;
function getDeepSeekLink(config) {
    if (!deepSeekInstance) {
        deepSeekInstance = new DeepSeekLink(config);
    }
    return deepSeekInstance;
}
// ═══════════════════════════════════════════════════════════════════════════════
// CLI RUNNER
// ═══════════════════════════════════════════════════════════════════════════════
if (require.main === module) {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                   🧠 DEEPSEEK LINK - SOVEREIGN AI CONNECTION                  ║
║                                                                               ║
║                    QAntum Prime v28.1.0 - Empire Architect                    ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);
    const ai = getDeepSeekLink();
    const query = process.argv.slice(2).join(' ');
    if (query) {
        ai.askEmpire(query).then(response => {
            console.log('\n📜 ОТГОВОР:\n');
            console.log(response.answer);
            console.log(`\n📊 Tokens: ${response.tokensUsed} | Model: ${response.model}`);
        }).catch(console.error);
    }
    else {
        console.log('Usage: npx tsx DeepSeekLink.ts "Твоят въпрос тук"');
    }
}
exports.default = DeepSeekLink;
