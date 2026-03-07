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

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import VectorSync from './VectorSync';
import { OllamaManager } from './OllamaManager';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DeepSeekConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface OllamaConfig {
  baseURL: string;
  model: string;
  timeout: number;
  enabled: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface EmpireQuery {
  query: string;
  context?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  includeContext?: boolean;
  projects?: string[];
}

export interface EmpireResponse {
  answer: string;
  context: string;
  tokensUsed: number;
  model: string;
  timestamp: number;
  cached: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEEPSEEK LINK - THE SOVEREIGN AI
// ═══════════════════════════════════════════════════════════════════════════════

export class DeepSeekLink {
  private config: DeepSeekConfig;
  private ollamaConfig: OllamaConfig;
  private vectorDB: VectorSync;
  private conversationHistory: ChatMessage[] = [];
  private responseCache: Map<string, EmpireResponse> = new Map();
  private providerStats = { deepseek: 0, ollama: 0, local: 0 };

  // Sovereign System Prompt
  private static readonly SOVEREIGN_PROMPT = `Ти си Sovereign AI на QAntum Prime v28.1.0 - Дигитална Държава с над 1.1 милиона реда код.

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

  constructor(config?: Partial<DeepSeekConfig>) {
    this.config = {
      apiKey: config?.apiKey || process.env.DEEPSEEK_API_KEY || '',
      baseURL: config?.baseURL || 'https://api.deepseek.com',
      model: config?.model || 'deepseek-chat',
      temperature: config?.temperature ?? 0.2, // Low for accuracy
      maxTokens: config?.maxTokens || 4096,
      systemPrompt: config?.systemPrompt || DeepSeekLink.SOVEREIGN_PROMPT,
    };

    this.ollamaConfig = {
      baseURL: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
      model: process.env.OLLAMA_MODEL || 'llama3',
      timeout: 120_000,
      enabled: true,
    };

    this.vectorDB = new VectorSync();

    this.log('🧠 DeepSeekLink initialized (3-Tier: DeepSeek → Ollama → Local)');
    this.log(`   Cloud Model: ${this.config.model}`);
    this.log(`   Local Model: ${this.ollamaConfig.model} @ ${this.ollamaConfig.baseURL}`);
    this.log(`   Temperature: ${this.config.temperature}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Питане към Империята с автоматично извличане на контекст
   */
  // Complexity: O(1) — hash/map lookup
  public async askEmpire(options: EmpireQuery | string): Promise<EmpireResponse> {
    const query = typeof options === 'string' ? { query: options } : options;

    this.log(`\n🏛️ ЗАПИТВАНЕ КЪМ ИМПЕРИЯТА`);
    this.log(`   "${query.query.slice(0, 60)}..."`);

    // Check cache
    const cacheKey = this.getCacheKey(query);
    if (this.responseCache.has(cacheKey)) {
      this.log(`   📦 Върнат от кеша`);
      return { ...this.responseCache.get(cacheKey)!, cached: true };
    }

    // Get relevant context from Vector DB
    let context = query.context || '';
    if (query.includeContext !== false) {
      this.log(`   🔍 Търсене на релевантен контекст...`);
      // SAFETY: async operation — wrap in try-catch for production resilience
      context = await this.vectorDB.getContextForQuery(query.query, 8000);
      this.log(`   📄 Извлечен контекст: ${context.length} символа`);
    }

    // Build messages
    const messages: ChatMessage[] = [
      { role: 'system', content: query.systemPrompt || this.config.systemPrompt },
      ...this.conversationHistory.slice(-6), // Keep last 3 exchanges
      {
        role: 'user',
        content: context
          ? `КОНТЕКСТ ОТ ИМПЕРИЯТА:\n\`\`\`\n${context}\n\`\`\`\n\nВЪПРОС: ${query.query}`
          : query.query
      }
    ];

    // Call DeepSeek API
    // SAFETY: async operation — wrap in try-catch for production resilience
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
  // Complexity: O(N) — potential recursive descent
  public async analyzeCode(code: string, focus: string): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const response = await this.askEmpire({
      query: `Анализирай следния код с фокус върху: ${focus}\n\n\`\`\`\n${code}\n\`\`\``,
      includeContext: false,
    });

    return response.answer;
  }

  /**
   * Генериране на код
   */
  // Complexity: O(1)
  public async generateCode(description: string, context?: string): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
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
  // Complexity: O(1)
  public async suggestRefactor(filePath: string, issue: string): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const response = await this.askEmpire({
      query: `Файл: ${filePath}\nПроблем: ${issue}\n\nПредложи рефакторинг, който решава този проблем, запазвайки съвместимост с останалата част от системата.`,
    });

    return response.answer;
  }

  /**
   * Търсене на бъгове
   */
  // Complexity: O(N) — linear iteration
  public async findBugs(code: string): Promise<string[]> {
    // SAFETY: async operation — wrap in try-catch for production resilience
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
  // Complexity: O(1)
  public clearHistory(): void {
    this.conversationHistory = [];
    this.log('🧹 История изчистена');
  }

  /**
   * Изчистване на кеша
   */
  // Complexity: O(1)
  public clearCache(): void {
    this.responseCache.clear();
    this.log('🧹 Кеш изчистен');
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // API COMMUNICATION
  // ═══════════════════════════════════════════════════════════════════════════════

  // Complexity: O(1) — amortized
  private async callAPI(messages: ChatMessage[], options: { temperature: number; maxTokens: number }): Promise<EmpireResponse> {
    // ═══ TIER 1: DeepSeek Cloud ═══
    if (this.config.apiKey) {
      try {
        const result = await this.callDeepSeek(messages, options);
        this.providerStats.deepseek++;
        this.log(`   ✅ DeepSeek responded (${result.tokensUsed} tokens)`);
        return result;
      } catch (err: any) {
        this.log(`   ⚠️ DeepSeek failed: ${err.message} — falling back to Ollama`);
      }
    } else {
      this.log('   ⚠️ Няма DEEPSEEK_API_KEY — опитвам Ollama...');
    }

    // ═══ TIER 2: Ollama Local LLM ═══
    if (this.ollamaConfig.enabled) {
      try {
        // Auto-detect best available model before first Ollama call
        const om = OllamaManager.getInstance();
        const bestModel = await om.adaptModel();
        if (bestModel) this.ollamaConfig.model = bestModel;

        const result = await this.callOllama(messages, options);
        this.providerStats.ollama++;
        this.log(`   ✅ Ollama (${this.ollamaConfig.model}) responded locally`);
        return result;
      } catch (err: any) {
        this.log(`   ⚠️ Ollama failed: ${err.message} — falling back to local analysis`);
      }
    }

    // ═══ TIER 3: Local Keyword Fallback ═══
    this.providerStats.local++;
    this.log(`   🔄 Using local keyword fallback`);
    return this.localFallback(messages, options);
  }

  /**
   * TIER 1: DeepSeek Cloud API
   */
  // Complexity: O(1) — hash/map lookup
  private callDeepSeek(messages: ChatMessage[], options: { temperature: number; maxTokens: number }): Promise<EmpireResponse> {
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
        timeout: 30_000,
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response: ChatResponse = JSON.parse(data);

            if (response.choices && response.choices.length > 0) {
              // Complexity: O(1) — hash/map lookup
              resolve({
                answer: response.choices[0].message.content,
                context: messages[messages.length - 1].content,
                tokensUsed: response.usage?.total_tokens || 0,
                model: response.model,
                timestamp: Date.now(),
                cached: false,
              });
            } else {
              // Log raw API response to diagnose auth/balance errors
              // Complexity: O(1)
              reject(new Error(`No response choices from DeepSeek — raw: ${data.slice(0, 300)}`));
            }
          } catch (e) {
            // Complexity: O(1)
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('DeepSeek timeout')); });
      req.write(JSON.stringify(requestBody));
      req.end();
    });
  }

  /**
   * TIER 2: Ollama Local LLM — напълно автономен, безплатен
   * Compatible with: llama3, mistral, gemma3, phi3, codellama, deepseek-coder
   */
  // Complexity: O(1) — amortized
  private callOllama(messages: ChatMessage[], options: { temperature: number; maxTokens: number }): Promise<EmpireResponse> {
    const requestBody = {
      model: this.ollamaConfig.model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature,
        num_predict: options.maxTokens,
      },
    };

    return new Promise((resolve, reject) => {
      const url = new URL('/api/chat', this.ollamaConfig.baseURL);
      const isHttps = url.protocol === 'https:';
      const transport = isHttps ? https : http;

      const req = transport.request({
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 11434),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: this.ollamaConfig.timeout,
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);

            if (response.message?.content) {
              // Complexity: O(1)
              resolve({
                answer: response.message.content,
                context: messages[messages.length - 1].content,
                tokensUsed: (response.prompt_eval_count || 0) + (response.eval_count || 0),
                model: `ollama/${this.ollamaConfig.model}`,
                timestamp: Date.now(),
                cached: false,
              });
            } else if (response.error) {
              // Complexity: O(1)
              reject(new Error(`Ollama error: ${response.error}`));
            } else {
              // Complexity: O(1)
              reject(new Error('Invalid Ollama response format'));
            }
          } catch (e) {
            // Complexity: O(1)
            reject(e);
          }
        });
      });

      req.on('error', (err: any) => {
        if (err.code === 'ECONNREFUSED') {
          // Complexity: O(1)
          reject(new Error('Ollama not running — install from https://ollama.com then: ollama run ' + this.ollamaConfig.model));
        } else {
          // Complexity: O(1)
          reject(err);
        }
      });
      req.on('timeout', () => { req.destroy(); reject(new Error('Ollama timeout')); });
      req.write(JSON.stringify(requestBody));
      req.end();
    });
  }

  /** Get AI provider usage stats */
  // Complexity: O(1)
  public getProviderStats() {
    return { ...this.providerStats };
  }

  /**
   * Локален fallback когато няма API ключ
   */
  // Complexity: O(1)
  private async localFallback(messages: ChatMessage[], options: any): Promise<EmpireResponse> {
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
  // Complexity: O(1) — amortized
  private localAnalysis(query: string): string {
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

  // Complexity: O(1)
  private getCacheKey(query: EmpireQuery): string {
    return `${query.query}:${query.context?.slice(0, 100) || ''}:${query.temperature || this.config.temperature}`;
  }

  // Complexity: O(1) — hash/map lookup
  private extractCodeBlock(text: string): string {
    const match = text.match(/```(?:typescript|ts|javascript|js)?\n?([\s\S]*?)```/);
    return match ? match[1].trim() : text;
  }

  // Complexity: O(1)
  private log(message: string): void {
    console.log(message);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // SPECIALIZED QUERIES
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Cross-project синергия анализ
   */
  // Complexity: O(1)
  public async analyzeSynergy(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
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
  // Complexity: O(1)
  public async analyzePerformance(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
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
  // Complexity: O(1)
  public async auditSecurity(): Promise<string> {
    // SAFETY: async operation — wrap in try-catch for production resilience
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

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let deepSeekInstance: DeepSeekLink | null = null;

export function getDeepSeekLink(config?: Partial<DeepSeekConfig>): DeepSeekLink {
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
  } else {
    console.log('Usage: npx tsx DeepSeekLink.ts "Твоят въпрос тук"');
  }
}

export default DeepSeekLink;
