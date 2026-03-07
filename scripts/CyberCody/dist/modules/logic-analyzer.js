// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v1.1.0 - LOGIC ANALYZER                                           ║
// ║  "The AI Eye" - Gemini 2.0 Powered Sensitive Data Detection                  ║
// ║  Specialization: Autonomous API Security Architect & Logic Hunter            ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
import { EventEmitter } from 'events';
// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 SENSITIVE DATA PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════
const SENSITIVE_PATTERNS = {
    pii: [
        { name: 'email', pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, severity: 'medium', compliance: ['GDPR', 'CCPA'] },
        { name: 'ssn', pattern: /\b\d{3}-\d{2}-\d{4}\b/g, severity: 'critical', compliance: ['GDPR', 'CCPA'] },
        { name: 'phone', pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, severity: 'medium', compliance: ['GDPR', 'CCPA'] },
        { name: 'dob', pattern: /\b(?:19|20)\d{2}[-\/](0[1-9]|1[0-2])[-\/](0[1-9]|[12]\d|3[01])\b/g, severity: 'medium', compliance: ['GDPR', 'HIPAA'] },
        { name: 'passport', pattern: /\b[A-Z]{1,2}\d{6,9}\b/g, severity: 'high', compliance: ['GDPR'] },
        { name: 'national_id', pattern: /\b[A-Z0-9]{8,12}\b/g, severity: 'medium', compliance: ['GDPR'] },
    ],
    financial: [
        { name: 'credit_card', pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g, severity: 'critical', compliance: ['PCI-DSS'] },
        { name: 'cvv', pattern: /\b(?:cvv|cvc|cvc2|cvv2)["':]\s*["']?\d{3,4}/gi, severity: 'critical', compliance: ['PCI-DSS'] },
        { name: 'iban', pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{4,30}\b/g, severity: 'high', compliance: ['GDPR', 'PCI-DSS'] },
        { name: 'bank_account', pattern: /\b(?:account|acct)["':]\s*["']?\d{8,17}/gi, severity: 'high', compliance: ['PCI-DSS', 'SOX'] },
        { name: 'routing_number', pattern: /\b(?:routing|aba)["':]\s*["']?\d{9}\b/gi, severity: 'high', compliance: ['PCI-DSS'] },
        { name: 'balance', pattern: /\b(?:balance|amount)["':]\s*["']?\$?[\d,]+\.?\d*/gi, severity: 'medium', compliance: ['SOX'] },
    ],
    auth: [
        { name: 'jwt', pattern: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, severity: 'critical', compliance: [] },
        { name: 'api_key', pattern: /(?:api[_-]?key|apikey)["':]\s*["']?[a-zA-Z0-9_-]{20,}/gi, severity: 'critical', compliance: [] },
        { name: 'bearer_token', pattern: /Bearer\s+[A-Za-z0-9_-]+/g, severity: 'critical', compliance: [] },
        { name: 'password', pattern: /(?:password|passwd|pwd)["':]\s*["']?[^"'\s,}]+/gi, severity: 'critical', compliance: [] },
        { name: 'secret', pattern: /(?:secret|private[_-]?key)["':]\s*["']?[a-zA-Z0-9_-]{16,}/gi, severity: 'critical', compliance: [] },
        { name: 'session', pattern: /(?:session[_-]?id|sid)["':]\s*["']?[a-zA-Z0-9_-]{20,}/gi, severity: 'high', compliance: [] },
        { name: 'oauth_token', pattern: /(?:access[_-]?token|refresh[_-]?token)["':]\s*["']?[a-zA-Z0-9_-]{20,}/gi, severity: 'critical', compliance: [] },
    ],
    health: [
        { name: 'medical_record', pattern: /\b(?:mrn|medical[_-]?record)["':]\s*["']?[A-Z0-9-]+/gi, severity: 'critical', compliance: ['HIPAA'] },
        { name: 'diagnosis', pattern: /\b(?:diagnosis|icd[_-]?10?)["':]\s*["']?[A-Z]\d{2,}/gi, severity: 'critical', compliance: ['HIPAA'] },
        { name: 'prescription', pattern: /\b(?:rx|prescription|medication)["':]\s*["']?[^"',}]+/gi, severity: 'high', compliance: ['HIPAA'] },
        { name: 'insurance_id', pattern: /\b(?:insurance[_-]?id|policy[_-]?number)["':]\s*["']?[A-Z0-9-]+/gi, severity: 'high', compliance: ['HIPAA'] },
    ],
    location: [
        { name: 'gps', pattern: /\b-?\d{1,3}\.\d{4,},\s*-?\d{1,3}\.\d{4,}\b/g, severity: 'medium', compliance: ['GDPR'] },
        { name: 'address', pattern: /\b\d+\s+[A-Za-z]+\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive)[.,]?\s*(?:#?\d+)?/gi, severity: 'medium', compliance: ['GDPR', 'CCPA'] },
        { name: 'zip_code', pattern: /\b\d{5}(?:-\d{4})?\b/g, severity: 'low', compliance: ['GDPR'] },
        { name: 'ip_address', pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, severity: 'low', compliance: ['GDPR'] },
    ],
    internal: [
        { name: 'stack_trace', pattern: /(?:at\s+[A-Za-z0-9$_.]+\s*\([^)]+\))|(?:Error:|Exception:)/g, severity: 'medium', compliance: [] },
        { name: 'debug_flag', pattern: /(?:debug|verbose|trace)["':]\s*(?:true|1)/gi, severity: 'low', compliance: [] },
        { name: 'internal_id', pattern: /(?:internal[_-]?id|system[_-]?id)["':]\s*["']?[a-zA-Z0-9_-]+/gi, severity: 'medium', compliance: [] },
        { name: 'database_id', pattern: /(?:_id|objectId)["':]\s*["']?[a-f0-9]{24}/gi, severity: 'low', compliance: [] },
        { name: 'server_info', pattern: /(?:server|host|instance)["':]\s*["']?[a-zA-Z0-9.-]+/gi, severity: 'low', compliance: [] },
    ],
    business: [
        { name: 'pricing', pattern: /(?:price|cost|rate)["':]\s*["']?\$?[\d,]+\.?\d*/gi, severity: 'medium', compliance: [] },
        { name: 'contract', pattern: /(?:contract[_-]?id|agreement)["':]\s*["']?[A-Z0-9-]+/gi, severity: 'high', compliance: ['SOX'] },
        { name: 'employee_id', pattern: /(?:employee[_-]?id|emp[_-]?id)["':]\s*["']?[A-Z0-9-]+/gi, severity: 'medium', compliance: ['GDPR'] },
        { name: 'salary', pattern: /(?:salary|compensation|wage)["':]\s*["']?\$?[\d,]+/gi, severity: 'high', compliance: ['GDPR'] },
    ],
};
// ═══════════════════════════════════════════════════════════════════════════════
// 🤖 GEMINI API INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Call Gemini 2.0 for AI-powered analysis
 */
async function analyzeWithGemini(responseBody, endpoint, apiKey) {
    const prompt = `You are a security analyst. Analyze this API response for sensitive data exposure and business logic vulnerabilities.

Endpoint: ${endpoint}

Response (first 5000 chars):
${responseBody.substring(0, 5000)}

Provide analysis in JSON format:
{
  "assessment": "Brief overall security assessment",
  "dataClassification": [
    {"field": "fieldName", "suggestedClassification": "public|internal|confidential|restricted", "reason": "why"}
  ],
  "businessLogicIssues": ["List of potential business logic vulnerabilities"],
  "fixes": ["Specific recommended fixes"],
  "confidence": 0.0-1.0
}`;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 2048,
                },
            }),
        });
        if (!response.ok) {
            console.warn(`   ⚠️  Gemini API error: ${response.status}`);
            return undefined;
        }
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text)
            return undefined;
        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            return undefined;
        return JSON.parse(jsonMatch[0]);
    }
    catch (error) {
        console.warn(`   ⚠️  Gemini analysis failed: ${error instanceof Error ? error.message : 'Unknown'}`);
        return undefined;
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// 🔬 LOCAL ANALYSIS ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
function analyzeLocally(responseBody, endpoint) {
    const exposures = [];
    const logicFlaws = [];
    let maxSeverity = 'info';
    const severityOrder = {
        info: 0, low: 1, medium: 2, high: 3, critical: 4
    };
    // Scan for sensitive data patterns
    for (const [category, patterns] of Object.entries(SENSITIVE_PATTERNS)) {
        for (const { name, pattern, severity, compliance } of patterns) {
            const matches = responseBody.match(pattern);
            if (matches) {
                const uniqueMatches = [...new Set(matches)];
                for (const match of uniqueMatches.slice(0, 3)) { // Limit to 3 samples
                    exposures.push({
                        category,
                        field: name,
                        sample: redactSensitive(match),
                        pattern: pattern.source,
                        severity,
                        compliance,
                        remediation: getRemediation(category, name),
                    });
                    if (severityOrder[severity] > severityOrder[maxSeverity]) {
                        maxSeverity = severity;
                    }
                }
            }
        }
    }
    // Detect logic flaws
    // 1. Excessive data exposure (large responses)
    if (responseBody.length > 50000) {
        logicFlaws.push({
            type: 'excessive_data_exposure',
            description: 'Response contains excessive amount of data',
            evidence: `Response size: ${(responseBody.length / 1024).toFixed(2)} KB`,
            severity: 'medium',
            exploitScenario: 'Attacker may extract unintended data from overly verbose API responses',
        });
    }
    // 2. Debug info leak
    if (/(?:debug|verbose|trace)["':]\s*true/i.test(responseBody) ||
        /(?:stack_trace|stackTrace|Error:)/i.test(responseBody)) {
        logicFlaws.push({
            type: 'debug_info_leak',
            description: 'Response contains debug information or stack traces',
            evidence: 'Debug flags or stack traces detected',
            severity: 'medium',
            exploitScenario: 'Attacker gains insight into application structure and potential vulnerabilities',
        });
    }
    // 3. Internal ID exposure
    if (/(?:internal[_-]?id|system[_-]?id|_id)/gi.test(responseBody)) {
        logicFlaws.push({
            type: 'internal_id_exposure',
            description: 'Internal system identifiers exposed',
            evidence: 'Internal IDs found in response',
            severity: 'low',
            exploitScenario: 'Attacker may use internal IDs to craft targeted attacks',
        });
    }
    // 4. Predictable identifiers (sequential numbers in response)
    const numbers = responseBody.match(/(?:id|Id|ID)["':]\s*(\d+)/g);
    if (numbers && numbers.length > 5) {
        const ids = numbers.map(n => parseInt(n.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
        const sorted = [...ids].sort((a, b) => a - b);
        let sequential = 0;
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] - sorted[i - 1] === 1)
                sequential++;
        }
        if (sequential > 3) {
            logicFlaws.push({
                type: 'predictable_identifiers',
                description: 'Sequential/predictable identifiers detected',
                evidence: `Found ${sequential} sequential IDs`,
                severity: 'medium',
                exploitScenario: 'Attacker can enumerate resources by incrementing IDs',
            });
        }
    }
    // 5. Verbose errors
    if (/(?:error|exception)["':]/gi.test(responseBody) && responseBody.length < 1000) {
        const hasDetails = /(?:message|detail|cause|reason)["':]/gi.test(responseBody);
        if (hasDetails) {
            logicFlaws.push({
                type: 'verbose_errors',
                description: 'Detailed error information exposed',
                evidence: 'Verbose error response detected',
                severity: 'low',
                exploitScenario: 'Attacker learns about application internals from error messages',
            });
        }
    }
    // Calculate risk score
    let riskScore = 0;
    for (const exposure of exposures) {
        riskScore += severityOrder[exposure.severity] * 10;
    }
    for (const flaw of logicFlaws) {
        riskScore += severityOrder[flaw.severity] * 5;
    }
    riskScore = Math.min(100, riskScore);
    return {
        endpoint,
        method: 'GET', // Will be overwritten
        timestamp: new Date(),
        exposures,
        logicFlaws,
        riskScore,
        severity: maxSeverity,
    };
}
function redactSensitive(value) {
    if (value.length <= 8)
        return '***';
    return value.substring(0, 4) + '****' + value.substring(value.length - 4);
}
function getRemediation(category, _field) {
    const remediations = {
        pii: 'Mask or remove PII from API responses. Use data minimization principles.',
        financial: 'Never expose full financial data. Use tokenization for sensitive fields.',
        auth: 'Remove authentication tokens from responses. Use httpOnly cookies.',
        health: 'Implement HIPAA-compliant data handling. Encrypt PHI at rest and in transit.',
        location: 'Anonymize location data. Consider geofencing for sensitive operations.',
        internal: 'Remove internal identifiers from public APIs. Use opaque external IDs.',
        business: 'Apply role-based access control. Audit access to sensitive business data.',
    };
    return remediations[category];
}
// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 LOGIC ANALYZER CLASS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Logic Analyzer - The AI Eye
 *
 * Uses pattern matching and optional Gemini 2.0 AI to detect
 * sensitive data exposure and business logic vulnerabilities.
 */
export class LogicAnalyzer extends EventEmitter {
    config;
    results = [];
    constructor(config = {}) {
        super();
        this.config = {
            geminiApiKey: config.geminiApiKey ?? process.env.GEMINI_API_KEY ?? '',
            useLocalOnly: config.useLocalOnly ?? (!config.geminiApiKey && !process.env.GEMINI_API_KEY),
            maxResponseSize: config.maxResponseSize ?? 1024 * 1024, // 1MB
            categories: config.categories ?? ['pii', 'financial', 'auth', 'health', 'internal'],
            customPatterns: config.customPatterns ?? [],
        };
    }
    /**
     * Analyze an API map for sensitive data exposure
     */
    async analyzeAPIMap(apiMap) {
        console.log('\n🧠 [LOGIC_ANALYZER] Starting sensitive data analysis...');
        console.log(`   Endpoints: ${apiMap.endpoints.size}`);
        console.log(`   AI Mode: ${this.config.useLocalOnly ? 'Local Only' : 'Gemini 2.0'}\n`);
        const startTime = new Date();
        // Iterate through all captured requests
        for (const request of apiMap.requests) {
            if (!request.response?.body)
                continue;
            const result = await this.analyzeResponse(request.response.body, request.endpoint ?? request.url, request.method);
            this.results.push(result);
            if (result.exposures.length > 0 || result.logicFlaws.length > 0) {
                this.emit('finding', result);
            }
        }
        const report = this.generateReport(apiMap.target, startTime);
        this.printReport(report);
        return report;
    }
    /**
     * Analyze a single response
     */
    async analyzeResponse(body, endpoint, method = 'GET') {
        console.log(`   Analyzing: ${method} ${endpoint}`);
        // Skip if too large
        if (body.length > this.config.maxResponseSize) {
            body = body.substring(0, this.config.maxResponseSize);
        }
        // Run local analysis
        const localResult = analyzeLocally(body, endpoint);
        localResult.method = method;
        // Run AI analysis if enabled
        let aiInsights;
        if (!this.config.useLocalOnly && this.config.geminiApiKey) {
            aiInsights = await analyzeWithGemini(body, endpoint, this.config.geminiApiKey);
        }
        return {
            ...localResult,
            aiInsights,
        };
    }
    /**
     * Add custom pattern for detection
     */
    addCustomPattern(pattern) {
        this.config.customPatterns.push(pattern);
    }
    /**
     * Generate analysis report
     */
    generateReport(target, _startTime) {
        const allExposures = this.results.flatMap(r => r.exposures);
        const criticalExposures = allExposures.filter(e => e.severity === 'critical');
        const highRiskEndpoints = this.results
            .filter(r => r.riskScore >= 50)
            .map(r => r.endpoint);
        const complianceViolations = {
            'GDPR': 0, 'HIPAA': 0, 'PCI-DSS': 0, 'SOX': 0, 'CCPA': 0,
        };
        for (const exposure of allExposures) {
            for (const tag of exposure.compliance) {
                complianceViolations[tag]++;
            }
        }
        const overallRiskScore = this.results.length > 0
            ? Math.round(this.results.reduce((sum, r) => sum + r.riskScore, 0) / this.results.length)
            : 0;
        const recommendations = [];
        if (criticalExposures.length > 0) {
            recommendations.push('🔴 CRITICAL: Immediately review and remediate critical data exposures');
        }
        if (complianceViolations['PCI-DSS'] > 0) {
            recommendations.push('💳 PCI-DSS: Payment card data detected - ensure PCI compliance');
        }
        if (complianceViolations['HIPAA'] > 0) {
            recommendations.push('🏥 HIPAA: Health information detected - verify HIPAA compliance');
        }
        if (complianceViolations['GDPR'] > 0) {
            recommendations.push('🇪🇺 GDPR: Personal data detected - review data processing agreements');
        }
        recommendations.push('💡 Implement response filtering middleware');
        recommendations.push('💡 Use DTOs to control API response shapes');
        recommendations.push('💡 Add data classification labels to sensitive fields');
        return {
            target,
            analyzedAt: new Date(),
            totalEndpoints: this.results.length,
            totalExposures: allExposures.length,
            totalLogicFlaws: this.results.reduce((sum, r) => sum + r.logicFlaws.length, 0),
            results: this.results,
            summary: {
                criticalExposures,
                highRiskEndpoints,
                complianceViolations,
                overallRiskScore,
            },
            recommendations,
        };
    }
    /**
     * Print report to console
     */
    printReport(report) {
        console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🧠 LOGIC ANALYZER REPORT                                  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Target: ${report.target.substring(0, 65).padEnd(65)}║
║ Endpoints Analyzed: ${report.totalEndpoints.toString().padStart(5)}                                              ║
║ Overall Risk Score: ${report.summary.overallRiskScore.toString().padStart(3)}/100                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ DATA EXPOSURES: ${report.totalExposures.toString().padStart(3)}                                                     ║
║   🔴 Critical: ${report.summary.criticalExposures.length.toString().padStart(3)} exposures                                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ COMPLIANCE VIOLATIONS:                                                       ║
║   GDPR:    ${report.summary.complianceViolations['GDPR'].toString().padStart(3)}  │  HIPAA:   ${report.summary.complianceViolations['HIPAA'].toString().padStart(3)}  │  PCI-DSS: ${report.summary.complianceViolations['PCI-DSS'].toString().padStart(3)}            ║
║   SOX:     ${report.summary.complianceViolations['SOX'].toString().padStart(3)}  │  CCPA:    ${report.summary.complianceViolations['CCPA'].toString().padStart(3)}                                  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ CRITICAL EXPOSURES:                                                          ║`);
        for (const exposure of report.summary.criticalExposures.slice(0, 5)) {
            console.log(`║   🔴 ${exposure.category.toUpperCase().padEnd(10)} ${exposure.field.padEnd(20)} ${exposure.sample.padEnd(20)}║`);
        }
        if (report.summary.criticalExposures.length === 0) {
            console.log(`║   ✅ No critical data exposures found                                        ║`);
        }
        console.log(`╠══════════════════════════════════════════════════════════════════════════════╣
║ RECOMMENDATIONS:                                                             ║`);
        for (const rec of report.recommendations.slice(0, 4)) {
            console.log(`║ ${rec.substring(0, 72).padEnd(72)}║`);
        }
        console.log(`╚══════════════════════════════════════════════════════════════════════════════╝`);
    }
    /**
     * Get all results
     */
    getResults() {
        return this.results;
    }
    /**
     * Export results to JSON
     */
    exportToJSON() {
        return JSON.stringify(this.results, null, 2);
    }
}
export default LogicAnalyzer;
//# sourceMappingURL=logic-analyzer.js.map