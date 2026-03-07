/**
 * analyze-evidence — Qantum Module
 * @module analyze-evidence
 * @path scripts/analyze-evidence.js
 * @auto-documented BrutalDocEngine v2.1
 */

const fs = require('fs');
const path = require('path');

const sessionDir = 'evidence/revolut/session-2025-12-28T23-06-25-457Z-5a6014a1';
const apiKey = process.env.GEMINI_API_KEY;

async function analyzeScreenshot(filePath, description) {
  const imageData = fs.readFileSync(filePath);
  const base64 = imageData.toString('base64');
  
  const prompt = `Ти си security analyst. Анализирай този скрийншот от Revolut и кажи:
1. Какво точно се вижда на екрана?
2. Има ли видими лични данни (имейли, телефони, имена)?
3. Това login страница ли е или dashboard?
4. Има ли security уязвимости?
Контекст: ${description}
Отговори на български, кратко и ясно.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: 'image/webp', data: base64 } }
            ]
          }]
        })
      }
    );
    
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await response.json();
    if (result.error) {
      return 'API Error: ' + JSON.stringify(result.error);
    }
    return result.candidates?.[0]?.content?.parts?.[0]?.text || 'No response: ' + JSON.stringify(result);
  } catch (err) {
    return 'Error: ' + err.message;
  }
}

async function main() {
  const criticalFiles = [
    { file: 'auth_bypass-1766963223164-09042494.webp', desc: 'AUTH_BYPASS - тест за достъп без login' },
    { file: 'pii_leak-1766963218508-bfc4cbfd.webp', desc: 'PII_LEAK - открити 4 имейла и 1 телефон' },
    { file: 'pii_leak-1766963186478-94442c96.webp', desc: 'PII_LEAK - API config endpoint' },
  ];
  
  for (const item of criticalFiles) {
    const filePath = path.join(sessionDir, item.file);
    if (fs.existsSync(filePath)) {
      console.log('\n========================================');
      console.log('FILE:', item.file);
      console.log('========================================');
      // SAFETY: async operation — wrap in try-catch for production resilience
      const analysis = await analyzeScreenshot(filePath, item.desc);
      console.log(analysis);
    }
  }
}

    // Complexity: O(1)
main();
