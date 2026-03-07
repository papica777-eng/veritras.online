/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    GROQ CLOUD AGENT - LLAMA 3.3 70B                          ║
 * ║             100% БЕЗПЛАТЕН • 500+ tok/sec • Без RAM/GPU                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 * 
 * Регистрирай се безплатно: https://console.groq.com/keys
 */

// Получи безплатен ключ от: https://console.groq.com/keys
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface GroqResponse {
  success: boolean;
  response: string;
  model: string;
  tokens?: number;
  speed?: string;
}

const QANTUM_SYSTEM = `Ти си QANTUM v35 - Суверенен Когнитивен Агент на QAntum Empire.

ПРАВИЛА:
1. Отговаряй КРАТКО и ТОЧНО
2. Код = само код, без обяснения освен ако не се иска
3. TypeScript е основен език
4. Bulgarian за комуникация с оператора

ФУНКЦИИ:
- RUN_AUDIT: Системна диагностика
- SCAN_MODULES: Сканиране на модули
- GENERATE_CODE: Генериране на код
- ANALYZE_CODE: Анализ на код
- GIT_STATUS: Git състояние
- HEAL_SYSTEM: Самопоправка

OUTPUT FORMAT (JSON):
{"thought":"вътрешно разсъждение","action":"FUNCTION_NAME или null","response":"отговор към оператора"}`;

export async function askGroq(prompt: string, model: string = 'llama-3.3-70b-versatile'): Promise<GroqResponse> {
  if (!GROQ_API_KEY) {
    return {
      success: false,
      response: 'GROQ_API_KEY липсва! Вземи безплатен от: https://console.groq.com/keys',
      model
    };
  }

  console.log(`[GROQ] ☁️ Sending to ${model}...`);
  const startTime = Date.now();
  
  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: QANTUM_SYSTEM },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    const data = await response.json();
    const elapsed = Date.now() - startTime;
    const text = data.choices?.[0]?.message?.content || '';
    const tokens = data.usage?.total_tokens || 0;
    const tokPerSec = Math.round(tokens / (elapsed / 1000));

    console.log(`[GROQ] ✅ ${tokens} tokens in ${elapsed}ms (${tokPerSec} tok/sec)`);

    return {
      success: true,
      response: text,
      model,
      tokens,
      speed: `${tokPerSec} tok/sec`
    };
  } catch (error: any) {
    console.error('[GROQ] ❌ Error:', error.message);
    return {
      success: false,
      response: error.message,
      model
    };
  }
}

// Достъпни модели в Groq (всички безплатни!)
export const GROQ_MODELS = {
  'llama-3.3-70b-versatile': 'Llama 3.3 70B - Най-мощен',
  'llama-3.1-8b-instant': 'Llama 3.1 8B - Най-бърз',
  'mixtral-8x7b-32768': 'Mixtral 8x7B - 32K контекст',
  'gemma2-9b-it': 'Gemma 2 9B - Google'
};

// ═══════════════════════════════════════════════════════════════════════════
// TEST
// ═══════════════════════════════════════════════════════════════════════════

async function test() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                    GROQ CLOUD AGENT TEST                                     ║
║                    100% FREE • 500+ tok/sec                                  ║
╚══════════════════════════════════════════════════════════════════════════════╝
  `);
  
  if (!GROQ_API_KEY) {
    console.log('❌ GROQ_API_KEY не е зададен!');
    console.log('');
    console.log('🔑 Вземи БЕЗПЛАТЕН ключ от: https://console.groq.com/keys');
    console.log('');
    console.log('След това добави в .env:');
    console.log('GROQ_API_KEY=gsk_xxxxxxxxxxxxx');
    return;
  }
  
  // Test 1: Identity
  console.log('1️⃣ Testing identity...');
  // SAFETY: async operation — wrap in try-catch for production resilience
  const r1 = await askGroq('Кой си ти? Отговори на български.');
  console.log('Response:', r1.response.substring(0, 300));
  
  // Test 2: Code
  console.log('\n2️⃣ Testing code generation...');
  // SAFETY: async operation — wrap in try-catch for production resilience
  const r2 = await askGroq('Write a TypeScript function for binary search. Only code, no explanation.');
  console.log('Response:', r2.response.substring(0, 400));
  
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                         TEST COMPLETE                                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 💰 Cost: $0.00 (100% FREE)                                                   ║
║ 💻 RAM: 0 MB (cloud)                                                         ║
║ 🎮 GPU: 0% (cloud)                                                           ║
║ ⚡ Speed: ${(r1.speed || 'N/A').padEnd(62)}║
╚══════════════════════════════════════════════════════════════════════════════╝
  `);
}

if (require.main === module) {
  // Complexity: O(1)
  test().catch(console.error);
}
