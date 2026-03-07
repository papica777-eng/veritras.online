// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v1.0.0 - VULNERABILITY SNAPSHOT                                   ║
// ║  "The Neural Witness" - Capture & Document Security Findings                 ║
// ║  Auto-generates Proof of Concept (PoC) Code for Every Discovery              ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { randomUUID } from 'crypto';
import type {
  VulnerabilitySnapshot,
  VulnerabilitySeverity,
  VulnerabilityClassification,
  ProofOfConcept,
  RemediationInfo,
  FuzzIteration,
  AnomalyType,
  PayloadCategory,
} from '../types/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 VULNERABILITY CLASSIFICATION DATABASE
// ═══════════════════════════════════════════════════════════════════════════════

interface VulnClassificationData {
  owaspCategory: string;
  cweId: number;
  baseCvss: number;
  description: string;
  remediation: RemediationInfo;
}

const VULN_CLASSIFICATIONS: Record<PayloadCategory | AnomalyType, VulnClassificationData> = {
  // Payload categories
  xss: {
    owaspCategory: 'A03:2021 - Injection',
    cweId: 79,
    baseCvss: 6.1,
    description: 'Cross-Site Scripting (XSS) allows attackers to inject malicious scripts into web pages viewed by other users.',
    remediation: {
      description: 'Implement proper output encoding and Content Security Policy',
      steps: [
        'Encode all user input before rendering in HTML context',
        'Use Content-Security-Policy header to restrict script sources',
        'Implement HTTPOnly and Secure flags on cookies',
        'Use modern frameworks with auto-escaping (React, Vue, Angular)',
      ],
      references: [
        'https://owasp.org/www-community/attacks/xss/',
        'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
      ],
      estimatedEffort: 'moderate',
    },
  },
  sqli: {
    owaspCategory: 'A03:2021 - Injection',
    cweId: 89,
    baseCvss: 9.8,
    description: 'SQL Injection allows attackers to interfere with database queries, potentially accessing or modifying sensitive data.',
    remediation: {
      description: 'Use parameterized queries and input validation',
      steps: [
        'Use prepared statements/parameterized queries for all database operations',
        'Implement input validation using allowlists',
        'Apply principle of least privilege to database accounts',
        'Use stored procedures where appropriate',
        'Implement Web Application Firewall (WAF)',
      ],
      references: [
        'https://owasp.org/www-community/attacks/SQL_Injection',
        'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
      ],
      estimatedEffort: 'moderate',
    },
  },
  nosqli: {
    owaspCategory: 'A03:2021 - Injection',
    cweId: 943,
    baseCvss: 8.1,
    description: 'NoSQL Injection allows attackers to manipulate NoSQL database queries.',
    remediation: {
      description: 'Sanitize inputs and use safe query methods',
      steps: [
        'Never use string concatenation for queries',
        'Use parameterized queries or ODM/ORM methods',
        'Validate and sanitize all user inputs',
        'Implement strict type checking',
      ],
      references: [
        'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05.6-Testing_for_NoSQL_Injection',
      ],
      estimatedEffort: 'moderate',
    },
  },
  cmdi: {
    owaspCategory: 'A03:2021 - Injection',
    cweId: 78,
    baseCvss: 9.8,
    description: 'Command Injection allows attackers to execute arbitrary system commands on the host.',
    remediation: {
      description: 'Avoid system calls with user input, use safe APIs',
      steps: [
        'Avoid using system shell commands with user input',
        'Use language-specific APIs instead of shell commands',
        'If shell commands are necessary, use strict allowlists',
        'Implement sandboxing and containerization',
        'Run services with minimal privileges',
      ],
      references: [
        'https://owasp.org/www-community/attacks/Command_Injection',
        'https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html',
      ],
      estimatedEffort: 'major',
    },
  },
  pathtraversal: {
    owaspCategory: 'A01:2021 - Broken Access Control',
    cweId: 22,
    baseCvss: 7.5,
    description: 'Path Traversal allows attackers to access files outside the intended directory.',
    remediation: {
      description: 'Validate file paths and use safe file access methods',
      steps: [
        'Use allowlists for permitted file names/paths',
        'Normalize and validate all file paths',
        'Use chroot or containerization',
        'Implement proper access controls',
      ],
      references: [
        'https://owasp.org/www-community/attacks/Path_Traversal',
      ],
      estimatedEffort: 'minor',
    },
  },
  ssti: {
    owaspCategory: 'A03:2021 - Injection',
    cweId: 1336,
    baseCvss: 9.8,
    description: 'Server-Side Template Injection allows attackers to inject malicious template code.',
    remediation: {
      description: 'Avoid passing user input to template engines',
      steps: [
        'Never pass user input directly to template engines',
        'Use sandboxed template engines',
        'Implement strict input validation',
        'Consider using logic-less templates',
      ],
      references: [
        'https://portswigger.net/research/server-side-template-injection',
      ],
      estimatedEffort: 'moderate',
    },
  },
  xxe: {
    owaspCategory: 'A05:2021 - Security Misconfiguration',
    cweId: 611,
    baseCvss: 7.5,
    description: 'XML External Entity (XXE) allows attackers to interfere with XML processing.',
    remediation: {
      description: 'Disable external entities and DTD processing',
      steps: [
        'Disable DTD processing entirely if not needed',
        'Disable external entity and external DTD processing',
        'Use JSON instead of XML where possible',
        'Update XML parsers to latest versions',
      ],
      references: [
        'https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing',
      ],
      estimatedEffort: 'minor',
    },
  },
  ssrf: {
    owaspCategory: 'A10:2021 - Server-Side Request Forgery',
    cweId: 918,
    baseCvss: 9.1,
    description: 'Server-Side Request Forgery allows attackers to make requests from the server.',
    remediation: {
      description: 'Validate and sanitize all URLs, use allowlists',
      steps: [
        'Implement URL allowlists for external requests',
        'Block requests to internal IP ranges (127.0.0.1, 10.x.x.x, etc.)',
        'Disable unnecessary URL schemes (file://, gopher://, etc.)',
        'Use network segmentation',
      ],
      references: [
        'https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/',
      ],
      estimatedEffort: 'moderate',
    },
  },
  idor: {
    owaspCategory: 'A01:2021 - Broken Access Control',
    cweId: 639,
    baseCvss: 6.5,
    description: 'Insecure Direct Object Reference allows unauthorized access to objects.',
    remediation: {
      description: 'Implement proper authorization checks',
      steps: [
        'Implement access control checks on every request',
        'Use indirect object references (UUIDs)',
        'Validate user permissions before serving resources',
        'Log and monitor access patterns',
      ],
      references: [
        'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References',
      ],
      estimatedEffort: 'moderate',
    },
  },
  overflow: {
    owaspCategory: 'A03:2021 - Injection',
    cweId: 120,
    baseCvss: 7.5,
    description: 'Buffer/Integer Overflow can lead to crashes or code execution.',
    remediation: {
      description: 'Use safe memory handling and input length validation',
      steps: [
        'Validate input lengths before processing',
        'Use safe string functions',
        'Enable compiler security features (ASLR, stack canaries)',
        'Use memory-safe languages where possible',
      ],
      references: [
        'https://owasp.org/www-community/vulnerabilities/Buffer_Overflow',
      ],
      estimatedEffort: 'major',
    },
  },
  format: {
    owaspCategory: 'A03:2021 - Injection',
    cweId: 134,
    baseCvss: 7.5,
    description: 'Format String Vulnerability allows attackers to read/write memory.',
    remediation: {
      description: 'Never use user input as format strings',
      steps: [
        'Never pass user input directly to printf-like functions',
        'Use format specifiers explicitly',
        'Enable compiler warnings for format string issues',
      ],
      references: [
        'https://owasp.org/www-community/attacks/Format_string_attack',
      ],
      estimatedEffort: 'minor',
    },
  },
  unicode: {
    owaspCategory: 'A03:2021 - Injection',
    cweId: 176,
    baseCvss: 5.3,
    description: 'Unicode encoding attacks can bypass security filters.',
    remediation: {
      description: 'Normalize and validate Unicode input',
      steps: [
        'Normalize Unicode input before validation',
        'Use consistent character encoding throughout',
        'Validate after normalization',
      ],
      references: [
        'https://owasp.org/www-community/attacks/Unicode_Encoding',
      ],
      estimatedEffort: 'minor',
    },
  },
  null: {
    owaspCategory: 'A03:2021 - Injection',
    cweId: 626,
    baseCvss: 5.3,
    description: 'Null Byte Injection can bypass security controls.',
    remediation: {
      description: 'Filter null bytes from all input',
      steps: [
        'Strip null bytes from all user input',
        'Use binary-safe functions',
        'Validate file extensions properly',
      ],
      references: [
        'https://owasp.org/www-community/attacks/Embedding_Null_Code',
      ],
      estimatedEffort: 'trivial',
    },
  },
  boundary: {
    owaspCategory: 'A04:2021 - Insecure Design',
    cweId: 20,
    baseCvss: 4.3,
    description: 'Improper input validation at boundary conditions.',
    remediation: {
      description: 'Implement comprehensive input validation',
      steps: [
        'Test and handle edge cases',
        'Validate input types and ranges',
        'Implement proper error handling',
      ],
      references: [
        'https://owasp.org/www-community/Improper_Input_Validation',
      ],
      estimatedEffort: 'minor',
    },
  },
  // Anomaly types
  status_change: {
    owaspCategory: 'A05:2021 - Security Misconfiguration',
    cweId: 209,
    baseCvss: 4.3,
    description: 'Unexpected status code changes may indicate security issues.',
    remediation: {
      description: 'Implement consistent error handling',
      steps: ['Use generic error messages', 'Log detailed errors server-side only'],
      references: [],
      estimatedEffort: 'trivial',
    },
  },
  error_disclosure: {
    owaspCategory: 'A05:2021 - Security Misconfiguration',
    cweId: 209,
    baseCvss: 5.3,
    description: 'Error messages reveal sensitive information about the system.',
    remediation: {
      description: 'Implement generic error pages and proper logging',
      steps: [
        'Use generic user-facing error messages',
        'Log detailed errors server-side',
        'Disable debug mode in production',
      ],
      references: [
        'https://owasp.org/www-community/Improper_Error_Handling',
      ],
      estimatedEffort: 'trivial',
    },
  },
  timing_anomaly: {
    owaspCategory: 'A07:2021 - Identification and Authentication Failures',
    cweId: 208,
    baseCvss: 3.7,
    description: 'Timing differences may allow information extraction.',
    remediation: {
      description: 'Use constant-time comparison functions',
      steps: ['Implement constant-time comparisons', 'Add random delays'],
      references: [],
      estimatedEffort: 'minor',
    },
  },
  size_anomaly: {
    owaspCategory: 'A05:2021 - Security Misconfiguration',
    cweId: 200,
    baseCvss: 3.7,
    description: 'Response size variations may indicate information leakage.',
    remediation: {
      description: 'Normalize response sizes where possible',
      steps: ['Implement consistent response formats', 'Review information disclosure'],
      references: [],
      estimatedEffort: 'minor',
    },
  },
  reflection: {
    owaspCategory: 'A03:2021 - Injection',
    cweId: 79,
    baseCvss: 6.1,
    description: 'User input is reflected in the response without proper encoding.',
    remediation: {
      description: 'Encode all reflected input',
      steps: ['HTML encode reflected data', 'Implement CSP', 'Use auto-escaping frameworks'],
      references: [],
      estimatedEffort: 'moderate',
    },
  },
  header_anomaly: {
    owaspCategory: 'A05:2021 - Security Misconfiguration',
    cweId: 16,
    baseCvss: 3.7,
    description: 'Unusual headers may reveal security misconfigurations.',
    remediation: {
      description: 'Review and harden HTTP headers',
      steps: ['Remove unnecessary headers', 'Add security headers'],
      references: [],
      estimatedEffort: 'trivial',
    },
  },
  behavior_change: {
    owaspCategory: 'A04:2021 - Insecure Design',
    cweId: 754,
    baseCvss: 4.3,
    description: 'Application behavior changed unexpectedly.',
    remediation: {
      description: 'Investigate and fix inconsistent behavior',
      steps: ['Review error handling', 'Implement proper input validation'],
      references: [],
      estimatedEffort: 'moderate',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📸 VULNERABILITY SNAPSHOT CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Vulnerability Snapshot Module for CyberCody
 * Captures, classifies, and documents security findings with PoC generation
 */
export class VulnerabilitySnapshotModule {
  private snapshots: Map<string, VulnerabilitySnapshot> = new Map();

  /**
   * Create a snapshot from a fuzzing iteration with anomaly
   */
  createFromFuzzIteration(iteration: FuzzIteration): VulnerabilitySnapshot {
    const classification = this.classify(iteration.category, iteration.anomaly.type);
    const severity = this.calculateSeverity(iteration.anomaly, classification);

    const snapshot: VulnerabilitySnapshot = {
      id: randomUUID(),
      timestamp: new Date(),
      type: this.getVulnerabilityType(iteration.category, iteration.anomaly.type),
      severity,
      classification,
      target: iteration.request.url,
      endpoint: new URL(iteration.request.url).pathname,
      parameter: iteration.parameter,
      request: {
        url: iteration.request.url,
        method: iteration.request.method,
        headers: iteration.request.headers,
        body: iteration.request.body,
        timestamp: iteration.timestamp,
      },
      response: {
        statusCode: iteration.response.statusCode,
        statusText: this.getStatusText(iteration.response.statusCode),
        headers: iteration.response.headers,
        body: iteration.response.body,
        responseTime: iteration.response.responseTime,
        timestamp: new Date(),
      },
      evidence: iteration.anomaly.indicators,
      poc: this.generatePoC(iteration),
      remediation: this.getRemediation(iteration.category, iteration.anomaly.type),
    };

    this.snapshots.set(snapshot.id, snapshot);
    return snapshot;
  }

  /**
   * Get vulnerability type name
   */
  private getVulnerabilityType(category: PayloadCategory, _anomalyTypes: AnomalyType[]): string {
    const typeNames: Record<PayloadCategory, string> = {
      xss: 'Cross-Site Scripting (XSS)',
      sqli: 'SQL Injection',
      nosqli: 'NoSQL Injection',
      cmdi: 'Command Injection',
      pathtraversal: 'Path Traversal',
      ssti: 'Server-Side Template Injection',
      xxe: 'XML External Entity (XXE)',
      ssrf: 'Server-Side Request Forgery',
      idor: 'Insecure Direct Object Reference',
      overflow: 'Buffer/Integer Overflow',
      format: 'Format String Vulnerability',
      unicode: 'Unicode Encoding Attack',
      null: 'Null Byte Injection',
      boundary: 'Boundary Condition Issue',
    };

    return typeNames[category] || `Security Issue (${category})`;
  }

  /**
   * Classify vulnerability based on category and anomaly
   */
  private classify(
    category: PayloadCategory,
    _anomalyTypes: AnomalyType[]
  ): VulnerabilityClassification {
    const data = VULN_CLASSIFICATIONS[category];
    return {
      owaspCategory: data.owaspCategory,
      cweId: data.cweId,
      cvssScore: data.baseCvss,
    };
  }

  /**
   * Calculate severity based on anomaly and classification
   */
  private calculateSeverity(
    anomaly: FuzzIteration['anomaly'],
    classification: VulnerabilityClassification
  ): VulnerabilitySeverity {
    // Use anomaly severity as base
    if (anomaly.severity === 'critical') return 'critical';
    if (anomaly.severity === 'high') return 'high';

    // Adjust based on CVSS
    const cvss = classification.cvssScore ?? 0;
    if (cvss >= 9.0) return 'critical';
    if (cvss >= 7.0) return 'high';
    if (cvss >= 4.0) return 'medium';
    if (cvss >= 0.1) return 'low';
    return 'info';
  }

  /**
   * Generate Proof of Concept code
   */
  private generatePoC(iteration: FuzzIteration): ProofOfConcept {
    const { request, response, payload, category, anomaly } = iteration;

    // Generate curl command
    const curlHeaders = Object.entries(request.headers)
      .map(([k, v]) => `-H '${k}: ${v}'`)
      .join(' ');
    const curlBody = request.body ? `-d '${request.body}'` : '';
    const curl = `curl -X ${request.method} '${request.url}' ${curlHeaders} ${curlBody}`.trim();

    // Generate Python code
    const python = `
import requests

url = "${request.url}"
headers = ${JSON.stringify(request.headers, null, 2)}
${request.body ? `data = ${request.body}` : ''}

response = requests.${request.method.toLowerCase()}(
    url,
    headers=headers${request.body ? ',\n    json=data' : ''}
)

print(f"Status: {response.status_code}")
print(f"Response: {response.text[:500]}")
`.trim();

    // Generate JavaScript code
    const javascript = `
const response = await fetch("${request.url}", {
  method: "${request.method}",
  headers: ${JSON.stringify(request.headers, null, 2)}${request.body ? `,\n  body: JSON.stringify(${request.body})` : ''}
});

const data = await response.text();
console.log("Status:", response.status);
console.log("Response:", data.substring(0, 500));
`.trim();

    // Generate PowerShell code
    const powershell = `
$headers = @{
${Object.entries(request.headers).map(([k, v]) => `  "${k}" = "${v}"`).join('\n')}
}

$response = Invoke-WebRequest -Uri "${request.url}" -Method ${request.method} -Headers $headers${request.body ? ` -Body '${request.body}'` : ''}

Write-Host "Status:" $response.StatusCode
Write-Host "Response:" $response.Content.Substring(0, [Math]::Min(500, $response.Content.Length))
`.trim();

    return {
      description: `Vulnerability discovered using ${category} payload: "${payload.substring(0, 100)}${payload.length > 100 ? '...' : ''}"`,
      steps: [
        `1. Navigate to or target: ${request.url}`,
        `2. Send ${request.method} request with payload in '${iteration.parameter}' parameter`,
        `3. Observe the response: Status ${response.statusCode}, ${anomaly.indicators.join(', ')}`,
        `4. The vulnerability is confirmed by: ${anomaly.type.join(', ')}`,
      ],
      code: { curl, python, javascript, powershell },
      impact: `This vulnerability could allow an attacker to ${this.getImpactDescription(category)}`,
      riskLevel: iteration.anomaly.severity === 'none' ? 'info' : iteration.anomaly.severity,
    };
  }

  /**
   * Get impact description for vulnerability type
   */
  private getImpactDescription(category: PayloadCategory): string {
    const impacts: Record<PayloadCategory, string> = {
      xss: 'execute arbitrary JavaScript in victim browsers, steal cookies, deface pages, or redirect users',
      sqli: 'read, modify, or delete database contents, potentially gaining full control of the database server',
      nosqli: 'bypass authentication, extract sensitive data, or manipulate NoSQL database queries',
      cmdi: 'execute arbitrary system commands, potentially gaining full control of the server',
      pathtraversal: 'read sensitive files outside the web root, including configuration files and source code',
      ssti: 'execute arbitrary code on the server through template injection',
      xxe: 'read local files, perform SSRF attacks, or cause denial of service',
      ssrf: 'access internal services, scan internal networks, or read cloud metadata',
      idor: 'access unauthorized resources belonging to other users',
      overflow: 'crash the application, corrupt memory, or potentially execute arbitrary code',
      format: 'read sensitive memory contents or execute arbitrary code',
      unicode: 'bypass security filters and inject malicious content',
      null: 'bypass file extension checks or truncate strings unexpectedly',
      boundary: 'cause unexpected application behavior or bypass validation',
    };
    return impacts[category] || 'cause unexpected application behavior';
  }

  /**
   * Get remediation info for vulnerability type
   */
  private getRemediation(category: PayloadCategory, _anomalyTypes: AnomalyType[]): RemediationInfo {
    return VULN_CLASSIFICATIONS[category].remediation;
  }

  /**
   * Get HTTP status text
   */
  private getStatusText(code: number): string {
    const statusTexts: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };
    return statusTexts[code] ?? 'Unknown';
  }

  /**
   * Get all captured snapshots
   */
  getSnapshots(): VulnerabilitySnapshot[] {
    return Array.from(this.snapshots.values());
  }

  /**
   * Get snapshot by ID
   */
  getSnapshot(id: string): VulnerabilitySnapshot | undefined {
    return this.snapshots.get(id);
  }

  /**
   * Get snapshots by severity
   */
  getSnapshotsBySeverity(severity: VulnerabilitySeverity): VulnerabilitySnapshot[] {
    return this.getSnapshots().filter((s) => s.severity === severity);
  }

  /**
   * Export snapshots to JSON
   */
  exportToJSON(): string {
    return JSON.stringify(this.getSnapshots(), null, 2);
  }

  /**
   * Generate summary report
   */
  generateSummary(): {
    total: number;
    bySeverity: Record<VulnerabilitySeverity, number>;
    byType: Record<string, number>;
  } {
    const snapshots = this.getSnapshots();
    const bySeverity: Record<VulnerabilitySeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };
    const byType: Record<string, number> = {};

    for (const snapshot of snapshots) {
      bySeverity[snapshot.severity]++;
      byType[snapshot.type] = (byType[snapshot.type] ?? 0) + 1;
    }

    return { total: snapshots.length, bySeverity, byType };
  }
}

export default VulnerabilitySnapshotModule;
