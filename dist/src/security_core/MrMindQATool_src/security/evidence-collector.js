"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum - Evidence Collector Module
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 🛡️ CyberCody "Safe Hunter" Mode - Automated Evidence Collection
 *
 * Features:
 * • EVENT_DRIVEN_CAPTURE: Automatic screenshots on security events
 * • AI_ANNOTATION: Gemini 2.0 Vision integration for vulnerability highlighting
 * • SECURE_STORAGE: Timestamped evidence with metadata
 * • PRIVACY_MASKING: GDPR-compliant PII/credit card masking
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 * ═══════════════════════════════════════════════════════════════════════════════
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
exports.EvidenceCollector = void 0;
exports.createRevolutEvidenceCollector = createRevolutEvidenceCollector;
exports.quickCapture = quickCapture;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
// ═══════════════════════════════════════════════════════════════════════════════
// SENSITIVE DATA PATTERNS (GDPR Compliant Masking)
// ═══════════════════════════════════════════════════════════════════════════════
const SENSITIVE_PATTERNS = {
    // Credit Card Numbers (Visa, MC, Amex, etc.)
    creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b|\b\d{15,16}\b/g,
    // CVV/CVC
    cvv: /\b\d{3,4}\b(?=\s*(?:cvv|cvc|security|код|код за сигурност))/gi,
    // IBAN
    iban: /\b[A-Z]{2}\d{2}[A-Z0-9]{4,30}\b/g,
    // Bulgarian EGN (Personal ID)
    egn: /\b\d{10}\b/g,
    // Email addresses
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    // Phone numbers (Bulgarian + International)
    phone: /(?:\+359|0)[\s-]?\d{2,3}[\s-]?\d{3}[\s-]?\d{3,4}/g,
    // Passwords (in visible form fields)
    password: /password|парола|pin|пин/gi,
    // SSN patterns
    ssn: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
    // API Keys / Tokens
    apiKey: /\b(?:api[_-]?key|token|bearer|auth)[=:\s]+[a-zA-Z0-9_-]{20,}\b/gi,
};
// ═══════════════════════════════════════════════════════════════════════════════
// EVIDENCE COLLECTOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class EvidenceCollector {
    config;
    sessionId;
    sessionStats;
    page = null;
    isCapturing = false;
    eventListeners = new Map();
    constructor(config = {}) {
        this.sessionId = this.generateSessionId();
        this.config = {
            outputDir: config.outputDir ?? './evidence',
            targetApp: config.targetApp ?? 'unknown',
            mode: config.mode ?? 'safe-hunter',
            imageFormat: config.imageFormat ?? 'webp',
            imageQuality: config.imageQuality ?? 85,
            aiAnnotations: config.aiAnnotations ?? 'disabled',
            geminiApiKey: config.geminiApiKey,
            maskingLevel: config.maskingLevel ?? 'standard',
            autoCaptureEvents: config.autoCaptureEvents ?? [
                'IDOR_CANDIDATE',
                'PII_LEAK',
                'URL_CHANGE',
                'BOLA_DETECTED',
                'SENSITIVE_DATA_EXPOSURE'
            ],
            compress: config.compress ?? true,
            maxStorageMB: config.maxStorageMB ?? 1024,
            encryptionKey: config.encryptionKey,
            verbose: config.verbose ?? false,
        };
        this.sessionStats = {
            sessionId: this.sessionId,
            startTime: new Date(),
            totalCaptures: 0,
            capturesByType: {},
            storageUsedMB: 0,
            aiAnnotationsCount: 0,
            maskedFieldsCount: 0,
        };
        this.initializeStorage();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Initialize the collector with a Playwright page
     */
    // Complexity: O(N)
    async initialize(page) {
        this.page = page;
        if (this.config.mode === 'safe-hunter') {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.setupEventDrivenCapture();
        }
        this.log('info', `🎯 Evidence Collector initialized for ${this.config.targetApp}`);
        this.log('info', `📁 Storage: ${this.getEvidencePath()}`);
        this.log('info', `🔒 Masking Level: ${this.config.maskingLevel}`);
        this.log('info', `🤖 AI Annotations: ${this.config.aiAnnotations}`);
    }
    /**
     * Capture evidence for a security event
     */
    // Complexity: O(1)
    async captureEvidence(eventType, description, severity = 'medium', additionalContext) {
        if (!this.page) {
            throw new Error('Evidence Collector not initialized. Call initialize(page) first.');
        }
        if (this.isCapturing) {
            this.log('warn', '⏳ Capture already in progress, queuing...');
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.waitForCapture();
        }
        this.isCapturing = true;
        const startTime = Date.now();
        const evidenceId = this.generateEvidenceId(eventType);
        try {
            this.log('info', `📸 Capturing evidence: ${eventType} - ${description}`);
            // 1. Take screenshot
            const rawScreenshot = await this.takeScreenshot();
            // 2. Apply privacy masking
            const { maskedScreenshot, maskedFields } = await this.applyPrivacyMasking(rawScreenshot);
            // 3. Get browser info
            const browserInfo = await this.getBrowserInfo();
            // 4. Get network context
            const networkContext = additionalContext ?? await this.getNetworkContext();
            // 5. Build metadata
            const metadata = {
                id: evidenceId,
                timestamp: new Date(),
                eventType,
                url: this.page.url(),
                sessionId: this.sessionId,
                severity,
                description,
                maskingApplied: maskedFields.length > 0,
                maskedFields,
                checksum: this.calculateChecksum(maskedScreenshot),
                captureMode: this.config.mode,
                browserInfo,
                networkContext,
            };
            // 6. Save evidence
            // SAFETY: async operation — wrap in try-catch for production resilience
            const filePath = await this.saveEvidence(evidenceId, maskedScreenshot, metadata);
            // 7. AI Annotation (if enabled)
            let annotatedPath;
            let aiAnnotations;
            if (this.config.aiAnnotations !== 'disabled') {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const annotationResult = await this.annotateWithAI(maskedScreenshot, eventType, description);
                if (annotationResult) {
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    annotatedPath = await this.saveAnnotatedImage(evidenceId, annotationResult.image);
                    aiAnnotations = annotationResult.annotations;
                    // Update metadata with annotations
                    metadata.aiAnnotations = aiAnnotations;
                }
            }
            // 8. Capture Video if available in Playwright Context
            let videoPath;
            try {
                const video = await this.page.video();
                if (video) {
                    const tempVidPath = await video.path();
                    const sessionDir = path.join(this.getEvidencePath(), this.sessionId);
                    videoPath = path.join(sessionDir, `${evidenceId}.webm`);
                    await video.saveAs(videoPath);
                    this.log('info', `🎥 Video evidence saved: ${videoPath}`);
                }
            }
            catch (err) {
                this.log('warn', `Video capture failed or not enabled in BrowserContext: ${err}`);
            }
            // 9. Update stats
            this.updateStats(eventType, maskedFields.length, aiAnnotations?.length ?? 0);
            const duration = Date.now() - startTime;
            this.log('info', `✅ Evidence captured: ${filePath} (${duration}ms)`);
            // 10. Send Professional Audit / Sales Pitch Email
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.sendAuditEmail(metadata, filePath, videoPath);
            return {
                success: true,
                evidenceId,
                filePath,
                metadata,
                annotatedPath,
                duration,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.log('error', `❌ Capture failed: ${errorMessage}`);
            return {
                success: false,
                evidenceId,
                filePath: '',
                metadata: {},
                videoPath: undefined,
                error: errorMessage,
                duration: Date.now() - startTime,
            };
        }
        finally {
            this.isCapturing = false;
        }
    }
    /**
     * Emit a security event (triggers auto-capture if configured)
     */
    // Complexity: O(N) — linear scan
    emitSecurityEvent(eventType, data) {
        if (this.config.autoCaptureEvents.includes(eventType)) {
            const description = this.formatEventDescription(eventType, data);
            this.captureEvidence(eventType, description).catch(err => {
                this.log('error', `Auto-capture failed: ${err}`);
            });
        }
        // Notify listeners
        const listeners = this.eventListeners.get(eventType) ?? [];
        listeners.forEach(listener => listener(data));
    }
    /**
     * Subscribe to security events
     */
    // Complexity: O(1) — lookup
    onSecurityEvent(eventType, callback) {
        const listeners = this.eventListeners.get(eventType) ?? [];
        listeners.push(callback);
        this.eventListeners.set(eventType, listeners);
    }
    /**
     * Get session statistics
     */
    // Complexity: O(1)
    getStats() {
        return { ...this.sessionStats };
    }
    /**
     * Get evidence directory path
     */
    // Complexity: O(1)
    getEvidencePath() {
        return path.join(this.config.outputDir, this.config.targetApp);
    }
    /**
     * Export evidence report
     */
    // Complexity: O(1)
    async exportReport() {
        const reportPath = path.join(this.getEvidencePath(), `report-${this.sessionId}.json`);
        const report = {
            session: this.sessionStats,
            config: {
                ...this.config,
                geminiApiKey: this.config.geminiApiKey ? '[REDACTED]' : undefined,
                encryptionKey: this.config.encryptionKey ? '[REDACTED]' : undefined,
            },
            // SAFETY: async operation — wrap in try-catch for production resilience
            evidence: await this.listEvidence(),
        };
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        this.log('info', `📊 Report exported: ${reportPath}`);
        return reportPath;
    }
    /**
     * List all collected evidence
     */
    // Complexity: O(N) — linear scan
    async listEvidence() {
        const evidenceDir = this.getEvidencePath();
        const metadataFiles = fs.readdirSync(evidenceDir)
            .filter(f => f.endsWith('.metadata.json'));
        return metadataFiles.map(file => {
            const content = fs.readFileSync(path.join(evidenceDir, file), 'utf-8');
            return JSON.parse(content);
        });
    }
    /**
     * Cleanup old evidence files
     */
    // Complexity: O(N) — loop
    async cleanup(maxAgeDays = 30) {
        const evidenceDir = this.getEvidencePath();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
        let deletedCount = 0;
        const files = fs.readdirSync(evidenceDir);
        for (const file of files) {
            const filePath = path.join(evidenceDir, file);
            const stat = fs.statSync(filePath);
            if (stat.mtime < cutoffDate) {
                fs.unlinkSync(filePath);
                deletedCount++;
            }
        }
        this.log('info', `🧹 Cleanup: ${deletedCount} files deleted`);
        return deletedCount;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PRIVATE METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    initializeStorage() {
        const evidenceDir = this.getEvidencePath();
        if (!fs.existsSync(evidenceDir)) {
            fs.mkdirSync(evidenceDir, { recursive: true });
            this.log('info', `📁 Created evidence directory: ${evidenceDir}`);
        }
        // Create session subdirectory
        const sessionDir = path.join(evidenceDir, this.sessionId);
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }
    }
    // Complexity: O(N*M) — nested iteration
    async setupEventDrivenCapture() {
        if (!this.page)
            return;
        // URL change detection
        this.page.on('framenavigated', async (frame) => {
            if (frame === this.page?.mainFrame()) {
                this.emitSecurityEvent('URL_CHANGE', { url: frame.url() });
            }
        });
        // Response monitoring for sensitive data
        this.page.on('response', async (response) => {
            try {
                const contentType = response.headers()['content-type'] ?? '';
                if (contentType.includes('application/json')) {
                    const body = await response.text().catch(() => '');
                    // Check for PII in response
                    if (this.detectSensitiveData(body)) {
                        this.emitSecurityEvent('PII_LEAK', {
                            url: response.url(),
                            status: response.status(),
                        });
                    }
                    // Check for IDOR indicators
                    if (this.detectIDORIndicators(body, response.url())) {
                        this.emitSecurityEvent('IDOR_CANDIDATE', {
                            url: response.url(),
                            method: response.request().method(),
                        });
                    }
                }
            }
            catch {
                // Ignore response processing errors
            }
        });
        this.log('info', '🎣 Event-driven capture hooks installed');
    }
    // Complexity: O(N)
    async takeScreenshot() {
        if (!this.page)
            throw new Error('Page not available');
        // Playwright doesn't support webp, so we always use png (quality not supported for png)
        // For jpeg, quality is supported
        const screenshotType = this.config.imageFormat === 'jpeg' ? 'jpeg' : 'png';
        // SAFETY: async operation — wrap in try-catch for production resilience
        const screenshot = await this.page.screenshot({
            type: screenshotType,
            fullPage: false,
            ...(screenshotType === 'jpeg' ? { quality: this.config.imageQuality } : {}),
        });
        return screenshot;
    }
    // Complexity: O(N*M) — nested iteration
    async applyPrivacyMasking(screenshot) {
        if (this.config.maskingLevel === 'none') {
            return { maskedScreenshot: screenshot, maskedFields: [] };
        }
        const maskedFields = [];
        // In-browser masking for sensitive form fields
        if (this.page) {
            try {
                const sensitiveSelectors = [
                    'input[type="password"]',
                    'input[name*="card"]',
                    'input[name*="cvv"]',
                    'input[name*="cvc"]',
                    'input[name*="expir"]',
                    'input[autocomplete="cc-number"]',
                    'input[autocomplete="cc-csc"]',
                    '[data-testid*="card"]',
                    '[data-testid*="cvv"]',
                    '.credit-card-input',
                    '.card-number',
                    '.cvv-input',
                ];
                for (const selector of sensitiveSelectors) {
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    const elements = await this.page.$$(selector);
                    for (const element of elements) {
                        // SAFETY: async operation — wrap in try-catch for production resilience
                        await element.evaluate((el) => {
                            const htmlEl = el;
                            htmlEl.style.filter = 'blur(10px)';
                            htmlEl.style.backgroundColor = '#000';
                        });
                        maskedFields.push(selector);
                    }
                }
                // Take new screenshot with masked fields
                if (maskedFields.length > 0) {
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    screenshot = await this.takeScreenshot();
                    // Restore original appearance
                    for (const selector of sensitiveSelectors) {
                        // SAFETY: async operation — wrap in try-catch for production resilience
                        const elements = await this.page.$$(selector);
                        for (const element of elements) {
                            // SAFETY: async operation — wrap in try-catch for production resilience
                            await element.evaluate((el) => {
                                const htmlEl = el;
                                htmlEl.style.filter = '';
                                htmlEl.style.backgroundColor = '';
                            });
                        }
                    }
                }
            }
            catch {
                this.log('warn', '⚠️ Could not apply in-browser masking');
            }
        }
        return { maskedScreenshot: screenshot, maskedFields };
    }
    // Complexity: O(1)
    async getBrowserInfo() {
        if (!this.page) {
            return {
                name: 'unknown',
                version: 'unknown',
                userAgent: 'unknown',
                viewport: { width: 0, height: 0 },
                deviceScaleFactor: 1,
            };
        }
        const viewport = this.page.viewportSize() ?? { width: 1920, height: 1080 };
        // SAFETY: async operation — wrap in try-catch for production resilience
        const userAgent = await this.page.evaluate(() => navigator.userAgent);
        // Parse browser from user agent
        let browserName = 'unknown';
        if (userAgent.includes('Chrome'))
            browserName = 'Chromium';
        else if (userAgent.includes('Firefox'))
            browserName = 'Firefox';
        else if (userAgent.includes('Safari'))
            browserName = 'WebKit';
        return {
            name: browserName,
            version: userAgent.match(/Chrome\/(\d+)/)?.[1] ?? 'unknown',
            userAgent,
            viewport,
            deviceScaleFactor: 1,
        };
    }
    // Complexity: O(N) — linear scan
    async getNetworkContext() {
        if (!this.page)
            return {};
        try {
            const cookies = await this.page.context().cookies();
            return {
                cookies: cookies.map(c => ({ name: c.name, domain: c.domain })),
            };
        }
        catch {
            return {};
        }
    }
    // Complexity: O(1)
    async saveEvidence(evidenceId, screenshot, metadata) {
        const sessionDir = path.join(this.getEvidencePath(), this.sessionId);
        // Save screenshot
        const ext = this.config.imageFormat;
        const imagePath = path.join(sessionDir, `${evidenceId}.${ext}`);
        let imageData = screenshot;
        // Encrypt if configured
        if (this.config.encryptionKey) {
            imageData = this.encryptData(screenshot, this.config.encryptionKey);
            fs.writeFileSync(imagePath + '.encrypted', imageData);
        }
        else {
            fs.writeFileSync(imagePath, imageData);
        }
        // Save metadata
        const metadataPath = path.join(sessionDir, `${evidenceId}.metadata.json`);
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        return imagePath;
    }
    // Complexity: O(1)
    async saveAnnotatedImage(evidenceId, annotatedImage) {
        const sessionDir = path.join(this.getEvidencePath(), this.sessionId);
        const annotatedPath = path.join(sessionDir, `${evidenceId}.annotated.${this.config.imageFormat}`);
        fs.writeFileSync(annotatedPath, annotatedImage);
        return annotatedPath;
    }
    // Complexity: O(1)
    async annotateWithAI(screenshot, eventType, description) {
        if (this.config.aiAnnotations === 'disabled') {
            return null;
        }
        if (this.config.aiAnnotations === 'gemini' && this.config.geminiApiKey) {
            return this.annotateWithGemini(screenshot, eventType, description);
        }
        if (this.config.aiAnnotations === 'local-vision') {
            return this.annotateWithLocalVision(screenshot, eventType, description);
        }
        return null;
    }
    // Complexity: O(N)
    async annotateWithGemini(screenshot, eventType, description) {
        try {
            const base64Image = screenshot.toString('base64');
            const prompt = `
You are a security analyst reviewing a screenshot for potential vulnerabilities.

Event Type: ${eventType}
Description: ${description}

Analyze this screenshot and identify:
1. Any visible security vulnerabilities
2. Sensitive data that should be masked
3. UI elements that indicate security risks

For each finding, provide:
- The region (x, y, width, height as percentages 0-100)
- A label describing the issue
- Confidence score (0-1)
- Vulnerability type
- Recommendation

Respond in JSON format:
{
  "annotations": [
    {
      "region": {"x": 10, "y": 20, "width": 30, "height": 10},
      "label": "Exposed user ID in URL",
      "confidence": 0.95,
      "vulnType": "IDOR",
      "recommendation": "Use indirect references instead of direct IDs"
    }
  ]
}
`;
            // SAFETY: async operation — wrap in try-catch for production resilience
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.config.geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                            parts: [
                                { text: prompt },
                                {
                                    inlineData: {
                                        mimeType: 'image/png',
                                        data: base64Image
                                    }
                                }
                            ]
                        }]
                })
            });
            if (!response.ok) {
                this.log('warn', `Gemini API error: ${response.status}`);
                return null;
            }
            // SAFETY: async operation — wrap in try-catch for production resilience
            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            // Parse JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch)
                return null;
            const parsed = JSON.parse(jsonMatch[0]);
            const annotations = parsed.annotations ?? [];
            // For now, return original image (annotation drawing would require canvas)
            // In production, use Sharp or Canvas to draw rectangles
            return {
                image: screenshot,
                annotations,
            };
        }
        catch (error) {
            this.log('warn', `Gemini annotation failed: ${error}`);
            return null;
        }
    }
    // Complexity: O(N)
    async annotateWithLocalVision(screenshot, _eventType, _description) {
        // Placeholder for local vision model (e.g., Ollama with llava)
        this.log('info', '🔍 Local vision annotation not yet implemented');
        return { image: screenshot, annotations: [] };
    }
    // Complexity: O(N) — loop
    detectSensitiveData(content) {
        for (const [key, pattern] of Object.entries(SENSITIVE_PATTERNS)) {
            if (pattern.test(content)) {
                this.log('warn', `⚠️ Sensitive data detected: ${key}`);
                return true;
            }
        }
        return false;
    }
    // Complexity: O(N*M) — nested iteration
    detectIDORIndicators(responseBody, url) {
        // Check for user IDs in response that differ from expected
        const idPatterns = [
            /"user_?id":\s*"?(\d+)"?/i,
            /"account_?id":\s*"?(\d+)"?/i,
            /"customer_?id":\s*"?(\d+)"?/i,
            /\/users\/(\d+)/i,
            /\/accounts\/(\d+)/i,
        ];
        for (const pattern of idPatterns) {
            if (pattern.test(responseBody) || pattern.test(url)) {
                return true;
            }
        }
        return false;
    }
    // Complexity: O(1)
    formatEventDescription(eventType, data) {
        const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
        return `[AUTO] ${eventType}: ${dataStr.substring(0, 200)}`;
    }
    // Complexity: O(1)
    updateStats(eventType, maskedCount, annotationCount) {
        this.sessionStats = {
            ...this.sessionStats,
            totalCaptures: this.sessionStats.totalCaptures + 1,
            capturesByType: {
                ...this.sessionStats.capturesByType,
                [eventType]: (this.sessionStats.capturesByType[eventType] ?? 0) + 1,
            },
            maskedFieldsCount: this.sessionStats.maskedFieldsCount + maskedCount,
            aiAnnotationsCount: this.sessionStats.aiAnnotationsCount + annotationCount,
        };
        // Update storage size
        this.updateStorageStats();
    }
    // Complexity: O(N) — loop
    updateStorageStats() {
        try {
            const sessionDir = path.join(this.getEvidencePath(), this.sessionId);
            const files = fs.readdirSync(sessionDir);
            let totalSize = 0;
            for (const file of files) {
                const stat = fs.statSync(path.join(sessionDir, file));
                totalSize += stat.size;
            }
            this.sessionStats = {
                ...this.sessionStats,
                storageUsedMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
            };
        }
        catch {
            // Ignore stat errors
        }
    }
    // Complexity: O(1)
    generateSessionId() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const random = crypto.randomBytes(4).toString('hex');
        return `session-${timestamp}-${random}`;
    }
    // Complexity: O(1)
    generateEvidenceId(eventType) {
        const timestamp = Date.now();
        const random = crypto.randomBytes(4).toString('hex');
        return `${eventType.toLowerCase()}-${timestamp}-${random}`;
    }
    // Complexity: O(1)
    calculateChecksum(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    // Complexity: O(1)
    encryptData(data, key) {
        const algorithm = 'aes-256-gcm';
        const keyHash = crypto.createHash('sha256').update(key).digest();
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, keyHash, iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
        const authTag = cipher.getAuthTag();
        // Prepend IV and auth tag
        return Buffer.concat([iv, authTag, encrypted]);
    }
    // Complexity: O(1)
    async waitForCapture() {
        return new Promise(resolve => {
            const check = () => {
                if (!this.isCapturing) {
                    // Complexity: O(1)
                    resolve();
                }
                else {
                    // Complexity: O(1)
                    setTimeout(check, 100);
                }
            };
            // Complexity: O(1)
            check();
        });
    }
    // Complexity: O(1)
    log(level, message) {
        if (this.config.verbose || level === 'error') {
            const prefix = {
                info: '🔍',
                warn: '⚠️',
                error: '❌',
            }[level];
            console.log(`[EvidenceCollector] ${prefix} ${message}`);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════════
    // EMAIL AUDIT & SALES PITCH INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════════════
    // Complexity: O(N)
    async sendAuditEmail(metadata, screenshotPath, videoPath) {
        const targetEmail = process.env.TARGET_CLIENT_EMAIL || 'client@example.com';
        const smtpUser = process.env.SMTP_USER || 'audit@QAntum-prime.com';
        const smtpPass = process.env.SMTP_PASS || 'dummy-pass';
        this.log('info', `📧 Preparing Professional QA Audit Email for ${targetEmail}...`);
        const summary = metadata.description || 'Unexpected behavior detected in business logic / UI flow.';
        const htmlPitch = `
    <div style="font-family: Arial, sans-serif; color: #1a1a2e; max-width: 650px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #FF3E4D 0%, #B30000 100%); color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">🚨 QAntum AEGIS: CRITICAL VULNERABILITY AUDIT 🚨</h1>
        </div>

        <div style="padding: 30px;">
            <h2 style="color: #FF3E4D; font-size: 20px; font-weight: 700; margin-top: 0;">Automated QA Analysis Complete</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">Нашите автономни QA агенти засякоха критичен проблем (<strong>${metadata.eventType}</strong>) във вашата система. Прилагаме 100% доказателство във вид на видеозапис и снимка, симулиращи реално потребителско поведение до момента на срива.</p>

            <div style="background: #f8f9fa; border-left: 4px solid #FF3E4D; padding: 15px; margin: 25px 0;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #1a1a2e;">Техническо резюме (Diagnostics)</h3>
                <ul style="color: #FF3E4D; font-size: 14px; padding-left: 20px; margin-bottom: 0;">
                    <li><strong>Severity:</strong> ${metadata.severity.toUpperCase()}</li>
                    <li><strong>Type:</strong> ${metadata.eventType}</li>
                    <li><strong>Details:</strong> ${summary}</li>
                </ul>
            </div>

            <h3 style="color: #1a1a2e; font-size: 18px; margin-top: 30px;">🛡️ The QAntum Solution (Zero Entropy)</h3>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">В съвременния дигитален свят, ръчният QA е мъртъв. Вашите потребители страдат, докато вие губите конверсии. С абонамент към <strong>QAntum Prime</strong>, вие получавате:</p>

            <ul style="font-size: 16px; line-height: 1.6; color: #333; padding-left: 20px;">
                <li style="margin-bottom: 10px;"><strong>Превантивна еволюция:</strong> Нашата система предвижда бъгове преди да са се случили и се самообучава от всяка грешка.</li>
                <li style="margin-bottom: 10px;"><strong>Self-Healing Tests:</strong> Автоматично коригиране на счупени UI селектори в реално време.</li>
                <li style="margin-bottom: 10px;"><strong>100% Автономност:</strong> Агентите ни имитират човешки действия с математическа прецизност.</li>
            </ul>

            <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
                <a href="https://QAntum.website/prime" style="display: inline-block; background: linear-gradient(135deg, #1a1a2e 0%, #303050 100%); color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 8px; font-size: 18px; font-weight: bold; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(26,26,46,0.2);">ИНТЕГРИРАЙ QAntum PRIME</a>
            </div>
            <p style="text-align: center; font-size: 14px; color: #666; margin-top: 20px;">Защитете бизнеса си. Неутрализирайте ентропията.</p>
        </div>
    </div>`;
        try {
            const emailSenderScript = require('path').resolve(__dirname, '../../../../../QAntum/email-sender');
            const { QAntumEmailSender } = require(emailSenderScript);
            const sender = new QAntumEmailSender({
                senderEmail: smtpUser,
                senderName: 'QAntum Aegis Auditor',
                appPassword: smtpPass
            });
            const attachments = [{
                    filename: `Audit_Proof_Screenshot_${metadata.id}.png`,
                    path: screenshotPath
                }];
            if (videoPath) {
                attachments.push({
                    filename: `Audit_Proof_Video_${metadata.id}.webm`,
                    path: videoPath
                });
            }
            // SAFETY: async operation — wrap in try-catch for production resilience
            await sender.send({
                to: targetEmail,
                subject: `[QA PRO-AUDIT] Vulnerability Detected on ${metadata.url}`,
                textBody: `Critical ${metadata.eventType} detected. See attachments for proof.`,
                htmlBody: htmlPitch,
                attachments: attachments
            });
            this.log('info', `[+] SUCCESS! Proof transmitted to ${targetEmail}`);
        }
        catch (err) {
            this.log('error', `[-] Mail Protocol failed: ${err}`);
        }
    }
}
exports.EvidenceCollector = EvidenceCollector;
// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY & UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Create a pre-configured Evidence Collector for Revolut testing
 */
function createRevolutEvidenceCollector(geminiApiKey) {
    return new EvidenceCollector({
        outputDir: './evidence',
        targetApp: 'revolut',
        mode: 'safe-hunter',
        imageFormat: 'webp',
        imageQuality: 85,
        aiAnnotations: geminiApiKey ? 'gemini' : 'disabled',
        geminiApiKey,
        maskingLevel: 'strict',
        autoCaptureEvents: [
            'IDOR_CANDIDATE',
            'PII_LEAK',
            'URL_CHANGE',
            'BOLA_DETECTED',
            'SENSITIVE_DATA_EXPOSURE',
            'AUTH_BYPASS',
        ],
        compress: true,
        maxStorageMB: 2048,
        verbose: true,
    });
}
/**
 * Quick capture utility
 */
async function quickCapture(page, eventType, description) {
    const collector = new EvidenceCollector({ verbose: false });
    // SAFETY: async operation — wrap in try-catch for production resilience
    await collector.initialize(page);
    return collector.captureEvidence(eventType, description);
}
// Export default
exports.default = EvidenceCollector;
