# 🔐 Binance Login Scenario - Инструкции за Конфигурация

## Преглед

Този сценарий демонстрира **пълна автоматизация на Binance login процеса**, включително:

✅ Автоматично попълване на Email/Password  
✅ Динамично генериране на 2FA кодове (Google Authenticator съвместими)  
✅ CAPTCHA детекция (с опция за ръчна намеса)  
✅ Валидация на успешен вход

## 📋 Предпоставки

### 1. Инсталация на `otpauth`

```bash
npm install otpauth
```

### 2. Конфигурация на `.env` файла

Добави следните credentials в `PRIVATE-CORE/.env`:

```env
# ─── BINANCE BROWSER LOGIN ───────────────────────────────────
BINANCE_EMAIL=your_email@example.com
BINANCE_PASSWORD=your_password_here
BINANCE_2FA_SECRET=JBSWY3DPEHPK3PXP  # Твоят base32 secret от QR кода
```

### 3. Как да извлечеш 2FA Secret Key?

Когато активираш Google Authenticator за Binance, ще видиш **QR код**. Обикновено има и **текстов код** под него (например: `JBSWY3DPEHPK3PXP`).

**Алтернативен метод (ако вече си активирал 2FA):**
1. Отиди в Binance Security Settings
2. Избери "Disable" на Google Authenticator
3. При повторно включване, **запази текстовия код** преди да сканираш QR-а
4. Този код е твоят `BINANCE_2FA_SECRET`

⚠️ **ВАЖНО:** Този код е **еквивалентен на паролата ти** - никога не го споделяй и не го качвай в Git!

## 🚀 Стартиране на Сценария

### Режим 1: Debug (с визуален браузър)

Добра идея за първо изпълнение, за да видиш какво прави ботът.

```bash
npx ts-node --project PRIVATE-CORE/tsconfig.json PRIVATE-CORE/scenarios/binance-login.ts
```

### Режим 2: Headless (без прозорец)

За продукционна употреба:

1. Отвори `binance-login.ts`
2. Промени `headless: false` на `headless: true` (ред ~80)
3. Стартирай отново

```bash
npx ts-node --project PRIVATE-CORE/tsconfig.json PRIVATE-CORE/scenarios/binance-login.ts
```

## 🧠 Как работи?

### Фази на изпълнение:

**Phase 1: Boot Evolution Chamber**
- Зарежда Vision Engine, Memory, Embedding Engine
- Инициализира StealthTLS, Fingerprint, Proxies

**Phase 2: Login Sequence**
- Navigate → `https://accounts.binance.com/en/login`
- Чака страницата да се зареди
- `TYPE Email` → Използва heuristic команда
- `TYPE Password` → Използва heuristic команда
- `CLICK "Log In"`

**Phase 3: CAPTCHA Handling**
- Ако Binance изкара puzzle, чака **15 секунди** за ръчна намеса
- След това продължава към 2FA

**Phase 4: 2FA**
- `TwoFactorManager` генерира 6-цифрен код
- Кодът се въвежда автоматично
- Валидира успешен вход (проверява за "Dashboard" в URL/Title)

## 🛡️ Защити и Проблеми

### CAPTCHA (Пъзел)

Binance понякога показва **slide puzzle** или **image selection**.

**Решение:**
- В сценария има вградена **15-секундна пауза** след натискане на Login
- Това ти дава време да решиш пъзела **ръчно**
- След това скриптът автоматично продължава с 2FA

**Алтернатива (напълно автономна):**
- Можеш да интегрираш **2Captcha** или **Anti-Captcha** API
- Добави в `ScenarioRunner` метод `solveCaptcha()`, който праща screenshot към službата

### Rate Limiting / IP Ban

Binance има агресивна защита срещу ботове.

**Как да избегнеш блокове:**
1. **Използвай Residential Proxies:** Vimeo, Bright Data, Oxylabs
2. **Добави Random Delays:** Между стъпките (вече е имплементирано)
3. **Използвай StealthTLS:** Вече е активен в `EvolutionChamber`
4. **Ротирай Fingerprints:** Промени `FingerprintInjector` seed

### 2FA Token Invalid

Ако получиш грешка "Invalid code":

**Причини:**
1. **Времева несинхронизация:** Часът на компютъра ти не е синхронизиран
   - **Решение:** Провери `TwoFactorManager.getTimeRemaining()` - ако е < 5 сек, чакай нов код
2. **Грешен Secret Key:** Провери дали си копирал правилно base32 текста
   - **Тест:** Влез в Binance ръчно и сравни кода от Google Auth с `tfa.getToken()`

## 📊 Output Example

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   🔐 BINANCE INFILTRATION PROTOCOL                                            ║
║                                                                               ║
║   Target: https://accounts.binance.com/en/login                              ║
║   Mode: GUI (Debug)                                                           ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

🔢 2FA Generator: ACTIVE (22s until next refresh)

🚀 Initiating login sequence...

[SCENARIO] 2026-02-23T... | 📌 Step 1/6: "Navigate to https://accounts.binance.com/en/login"
[SCENARIO] 2026-02-23T... |    ✅ Step 1 PASSED (1 cycles, 2341ms)
[SCENARIO] 2026-02-23T... | 📌 Step 2/6: "Wait 3 seconds"
[SCENARIO] 2026-02-23T... |    ✅ Step 2 PASSED (1 cycles, 3012ms)
[SCENARIO] 2026-02-23T... | 📌 Step 3/6: "Type email..."
[SCENARIO] 2026-02-23T... |    ✅ Step 3 PASSED (1 cycles, 1523ms)
...

🔐 2FA Challenge Detected...
   Waiting for Authenticator Code field...
   🔢 Generated Token: 583921
   ✅ Token entered successfully.

✅ INFILTRATION SUCCESSFUL!
   Final URL: https://www.binance.com/en/my/dashboard
   Page Title: Dashboard | Binance

🏁 Mission Complete. Exiting in 5 seconds...
```

## 🔧 Разширена Конфигурация

### Промяна на CAPTCHA Timeout

В `binance-login.ts`, промени:

```typescript
const CONFIG = {
  // ...
  captchaWaitSeconds: 30, // По default е 15 секунди
};
```

### Добавяне на Proxy

Редактирай `EvolutionChamber` да използва proxy:

```typescript
// В ProxyManager конфигурацията
proxies: [
  { host: '123.45.67.89', port: 8080, username: 'user', password: 'pass' }
]
```

## 🆘 Troubleshooting

| Проблем | Решение |
| :------ | :------ |
| `❌ MISSING CREDENTIALS!` | Добави `BINANCE_EMAIL` и `BINANCE_PASSWORD` в `.env` |
| `Failed to initialize 2FA: Invalid secret` | Провери дали `BINANCE_2FA_SECRET` е **base32** формат (само главни букви A-Z и 2-7) |
| Браузърът не стартира | Инсталирай Playwright: `npx playwright install` |
| Stuck на CAPTCHA | Увеличи `captchaWaitSeconds` или го реши ръчно |
| "Element not found" грешки | Binance може да е променил HTML структурата. Проверигамен селекторите в `ScenarioRunner.tryDOMFallback()` |

## 📚 Следващи Стъпки

След успешен login, можеш да:

1. **Извличане на баланси:** Използвай Binance API (`GET /api/v3/account`)
2. **Place Orders:** През браузъра или API
3. **Monitor Dashboard:** С Vision Engine (`VisionEngine.captureAndAnalyze()`)
4. **Автоматична търговия:** Интегрирай с `market-reaper.ts`

## 🛠️ API за Разработчици

### Използване на TwoFactorManager самостоятелно:

```typescript
import { TwoFactorManager } from './utils/TwoFactorManager';

const tfa = new TwoFactorManager('JBSWY3DPEHPK3PXP', 'Binance');

console.log(tfa.getToken());          // "583921"
console.log(tfa.getTimeRemaining());  // 17 (seconds)
console.log(tfa.validate('583921'));  // true
```

---

**Успех! 🚀**

Ако имаш въпроси или срещнеш проблеми, моля провери errors в конзолата и логовете на `ScenarioRunner`.
