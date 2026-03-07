// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v25.0 - PREDICTIVE ATTACK SURFACE                                 ║
// ║  "The Temporal Healer" - AI-Powered Vulnerability Trend Analysis             ║
// ║  Predicts future vulnerabilities before they manifest in production          ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { EventEmitter } from 'events';
import { readFileSync, existsSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Vulnerability categories
 */
export type VulnerabilityCategory = 
  | 'sqli'           // SQL Injection
  | 'xss'            // Cross-Site Scripting
  | 'nosqli'         // NoSQL Injection
  | 'cmdi'           // Command Injection
  | 'path_traversal' // Path Traversal
  | 'ssrf'           // Server-Side Request Forgery
  | 'xxe'            // XML External Entity
  | 'ssti'           // Server-Side Template Injection
  | 'bola'           // Broken Object Level Authorization
  | 'broken_auth'    // Broken Authentication
  | 'mass_assignment'// Mass Assignment
  | 'sensitive_data' // Sensitive Data Exposure
  | 'rate_limiting'  // Missing Rate Limiting
  | 'insecure_deserialization'; // Insecure Deserialization

/**
 * Code pattern that indicates potential vulnerability
 */
export interface VulnerabilityPattern {
  /** Pattern ID */
  id: string;
  /** Category */
  category: VulnerabilityCategory;
  /** Pattern name */
  name: string;
  /** Description */
  description: string;
  /** Regex patterns to detect */
  patterns: RegExp[];
  /** Languages this applies to */
  languages: string[];
  /** Base risk score (0-100) */
  baseRiskScore: number;
  /** Factors that increase risk */
  riskFactors: RiskFactor[];
  /** Remediation guidance */
  remediation: string;
  /** OWASP mapping */
  owaspMapping: string;
  /** CWE ID */
  cweId: number;
}

/**
 * Risk factor that modifies vulnerability score
 */
export interface RiskFactor {
  /** Factor name */
  name: string;
  /** Pattern to detect */
  pattern: RegExp;
  /** Score modifier (+/-) */
  scoreModifier: number;
  /** Description */
  description: string;
}

/**
 * Detected vulnerability trend
 */
export interface VulnerabilityTrend {
  /** Unique ID */
  id: string;
  /** File path */
  filePath: string;
  /** Line number */
  lineNumber: number;
  /** Code snippet */
  codeSnippet: string;
  /** Vulnerability category */
  category: VulnerabilityCategory;
  /** Pattern that matched */
  patternId: string;
  /** Current risk score */
  currentRiskScore: number;
  /** Predicted future risk score */
  predictedRiskScore: number;
  /** Prediction confidence (0-100) */
  predictionConfidence: number;
  /** Prediction reason */
  predictionReason: string;
  /** Time to vulnerability (estimated days) */
  estimatedDaysToVulnerability: number;
  /** Related code changes */
  relatedChanges: CodeChange[];
  /** Recommendations */
  recommendations: string[];
  /** Historical trend */
  historicalTrend: TrendPoint[];
}

/**
 * Code change that affects vulnerability
 */
export interface CodeChange {
  /** Change type */
  type: 'dependency_update' | 'config_change' | 'code_pattern' | 'schema_change' | 'api_change';
  /** Description */
  description: string;
  /** Impact score */
  impactScore: number;
  /** Source of change (git commit, dependency, etc.) */
  source: string;
}

/**
 * Historical trend point
 */
export interface TrendPoint {
  /** Timestamp */
  timestamp: Date;
  /** Risk score at this point */
  riskScore: number;
  /** Event that caused change */
  event?: string;
}

/**
 * Dependency vulnerability info
 */
export interface DependencyRisk {
  /** Package name */
  package: string;
  /** Current version */
  currentVersion: string;
  /** Known vulnerable versions */
  vulnerableVersions: string[];
  /** Vulnerability type */
  vulnerabilityType: VulnerabilityCategory;
  /** CVE ID if available */
  cveId?: string;
  /** Risk score */
  riskScore: number;
  /** Upgrade recommendation */
  upgradeRecommendation: string;
}

/**
 * Attack surface analysis result
 */
export interface AttackSurfaceAnalysis {
  /** Analysis timestamp */
  analyzedAt: Date;
  /** Total files analyzed */
  filesAnalyzed: number;
  /** Total lines of code */
  totalLinesOfCode: number;
  /** Current vulnerabilities */
  currentVulnerabilities: VulnerabilityTrend[];
  /** Predicted vulnerabilities */
  predictedVulnerabilities: VulnerabilityTrend[];
  /** Dependency risks */
  dependencyRisks: DependencyRisk[];
  /** Overall risk score */
  overallRiskScore: number;
  /** Predicted risk score (30 days) */
  predictedRiskScore30Days: number;
  /** Predicted risk score (90 days) */
  predictedRiskScore90Days: number;
  /** Hot spots (high risk areas) */
  hotSpots: Array<{
    path: string;
    riskScore: number;
    vulnerabilityCount: number;
  }>;
  /** Recommendations */
  recommendations: string[];
}

/**
 * Predictive analysis configuration
 */
export interface PredictiveConfig {
  /** Source directory to analyze */
  sourceDir: string;
  /** File extensions to analyze */
  fileExtensions?: string[];
  /** Exclude patterns */
  excludePatterns?: string[];
  /** Enable dependency analysis */
  analyzeDependencies?: boolean;
  /** Enable git history analysis */
  analyzeGitHistory?: boolean;
  /** Enable AI-powered analysis */
  enableAiAnalysis?: boolean;
  /** Gemini API key */
  geminiApiKey?: string;
  /** Risk threshold for alerts */
  riskThreshold?: number;
  /** Persist analysis history */
  persistHistory?: boolean;
  /** History file path */
  historyFilePath?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 VULNERABILITY PATTERNS DATABASE
// ═══════════════════════════════════════════════════════════════════════════════

const VULNERABILITY_PATTERNS: VulnerabilityPattern[] = [
  // SQL Injection
  {
    id: 'sqli-string-concat',
    category: 'sqli',
    name: 'SQL String Concatenation',
    description: 'Direct string concatenation in SQL queries',
    patterns: [
      /["'`]SELECT\s+.*?\+\s*\w+/gi,
      /["'`]INSERT\s+INTO.*?\+\s*\w+/gi,
      /["'`]UPDATE\s+.*?\+\s*\w+/gi,
      /["'`]DELETE\s+FROM.*?\+\s*\w+/gi,
      /\.query\s*\(\s*["'`].*?\$\{/gi,
      /\.execute\s*\(\s*["'`].*?\$\{/gi,
      /f["']SELECT.*?\{/gi,
      /f["']INSERT.*?\{/gi,
    ],
    languages: ['javascript', 'typescript', 'python', 'java'],
    baseRiskScore: 85,
    riskFactors: [
      { name: 'user_input', pattern: /req\.(body|query|params)|request\.(form|args)/gi, scoreModifier: 10, description: 'User input used directly' },
      { name: 'no_sanitization', pattern: /(?<!sanitize|escape|validate)/gi, scoreModifier: 5, description: 'No visible sanitization' },
    ],
    remediation: 'Use parameterized queries or prepared statements instead of string concatenation',
    owaspMapping: 'A03:2021-Injection',
    cweId: 89,
  },
  {
    id: 'sqli-raw-query',
    category: 'sqli',
    name: 'Raw SQL Query',
    description: 'Using raw SQL without ORM protection',
    patterns: [
      /\.raw\s*\(\s*["'`]/gi,
      /\.rawQuery\s*\(/gi,
      /sequelize\.query\s*\(/gi,
      /knex\.raw\s*\(/gi,
      /cursor\.execute\s*\(\s*f["']/gi,
    ],
    languages: ['javascript', 'typescript', 'python'],
    baseRiskScore: 70,
    riskFactors: [
      { name: 'dynamic_input', pattern: /\$\{|\%s|\%\(|\.format\(/gi, scoreModifier: 15, description: 'Dynamic input interpolation' },
    ],
    remediation: 'Use ORM methods or parameterized queries',
    owaspMapping: 'A03:2021-Injection',
    cweId: 89,
  },
  
  // XSS
  {
    id: 'xss-inner-html',
    category: 'xss',
    name: 'innerHTML Assignment',
    description: 'Direct innerHTML assignment with user data',
    patterns: [
      /\.innerHTML\s*=\s*[^"'`\s]/gi,
      /\.outerHTML\s*=\s*[^"'`\s]/gi,
      /dangerouslySetInnerHTML/gi,
      /v-html\s*=/gi,
    ],
    languages: ['javascript', 'typescript'],
    baseRiskScore: 75,
    riskFactors: [
      { name: 'user_data', pattern: /props\.|state\.|data\.|user\./gi, scoreModifier: 15, description: 'User-controlled data' },
    ],
    remediation: 'Use textContent instead of innerHTML, or properly sanitize HTML with DOMPurify',
    owaspMapping: 'A03:2021-Injection',
    cweId: 79,
  },
  {
    id: 'xss-document-write',
    category: 'xss',
    name: 'document.write Usage',
    description: 'Using document.write with dynamic content',
    patterns: [
      /document\.write\s*\(/gi,
      /document\.writeln\s*\(/gi,
    ],
    languages: ['javascript', 'typescript'],
    baseRiskScore: 80,
    riskFactors: [],
    remediation: 'Avoid document.write entirely; use DOM manipulation methods',
    owaspMapping: 'A03:2021-Injection',
    cweId: 79,
  },
  
  // Command Injection
  {
    id: 'cmdi-exec',
    category: 'cmdi',
    name: 'Command Execution',
    description: 'Direct command execution with dynamic input',
    patterns: [
      /child_process.*exec\s*\(/gi,
      /exec\s*\(\s*["'`].*?\$\{/gi,
      /spawn\s*\(\s*\w+\s*,/gi,
      /os\.system\s*\(/gi,
      /subprocess\.(call|run|Popen)\s*\(/gi,
      /shell=True/gi,
    ],
    languages: ['javascript', 'typescript', 'python'],
    baseRiskScore: 90,
    riskFactors: [
      { name: 'user_input', pattern: /req\.|request\.|args\./gi, scoreModifier: 10, description: 'User input in command' },
    ],
    remediation: 'Use execFile with argument arrays instead of exec, avoid shell=True',
    owaspMapping: 'A03:2021-Injection',
    cweId: 78,
  },
  
  // BOLA/IDOR
  {
    id: 'bola-direct-access',
    category: 'bola',
    name: 'Direct Object Reference',
    description: 'Accessing resources by ID without authorization check',
    patterns: [
      /findById\s*\(\s*req\.(params|query|body)\./gi,
      /findOne\s*\(\s*\{\s*id:\s*req\./gi,
      /\.get\s*\(\s*["'`]\/\w+\/:id["'`]/gi,
      /Model\.objects\.get\s*\(\s*pk=/gi,
    ],
    languages: ['javascript', 'typescript', 'python'],
    baseRiskScore: 75,
    riskFactors: [
      { name: 'no_auth_check', pattern: /(?<!isAuthenticated|authorize|permission)/gi, scoreModifier: 15, description: 'No authorization check visible' },
      { name: 'sensitive_resource', pattern: /user|account|payment|order|document/gi, scoreModifier: 10, description: 'Sensitive resource type' },
    ],
    remediation: 'Implement proper authorization checks before accessing resources',
    owaspMapping: 'A01:2021-Broken Access Control',
    cweId: 639,
  },
  
  // SSRF
  {
    id: 'ssrf-request',
    category: 'ssrf',
    name: 'Server-Side Request',
    description: 'Making HTTP requests with user-controlled URLs',
    patterns: [
      /fetch\s*\(\s*req\./gi,
      /axios\.(get|post|put)\s*\(\s*\w+/gi,
      /requests\.(get|post)\s*\(\s*\w+/gi,
      /http\.request\s*\(\s*\{.*url:\s*\w+/gi,
      /urllib\.request\.urlopen\s*\(/gi,
    ],
    languages: ['javascript', 'typescript', 'python'],
    baseRiskScore: 80,
    riskFactors: [
      { name: 'user_url', pattern: /req\.(body|query|params)\.url/gi, scoreModifier: 15, description: 'URL from user input' },
    ],
    remediation: 'Validate and whitelist allowed URLs, block internal IP ranges',
    owaspMapping: 'A10:2021-Server-Side Request Forgery',
    cweId: 918,
  },
  
  // Sensitive Data Exposure
  {
    id: 'sensitive-logging',
    category: 'sensitive_data',
    name: 'Sensitive Data in Logs',
    description: 'Logging sensitive information',
    patterns: [
      /console\.(log|info|debug)\s*\(.*password/gi,
      /logger\.(info|debug)\s*\(.*token/gi,
      /print\s*\(.*secret/gi,
      /logging\.(info|debug)\s*\(.*api.?key/gi,
    ],
    languages: ['javascript', 'typescript', 'python'],
    baseRiskScore: 60,
    riskFactors: [],
    remediation: 'Remove sensitive data from logs, use log redaction',
    owaspMapping: 'A02:2021-Cryptographic Failures',
    cweId: 532,
  },
  {
    id: 'sensitive-hardcoded',
    category: 'sensitive_data',
    name: 'Hardcoded Secrets',
    description: 'Secrets hardcoded in source code',
    patterns: [
      /api.?key\s*[:=]\s*["'`][A-Za-z0-9_\-]{20,}/gi,
      /secret\s*[:=]\s*["'`][A-Za-z0-9_\-]{20,}/gi,
      /password\s*[:=]\s*["'`][^"'`\s]{8,}/gi,
      /private.?key\s*[:=]\s*["'`]/gi,
      /AWS_SECRET/gi,
      /GITHUB_TOKEN/gi,
    ],
    languages: ['javascript', 'typescript', 'python', 'java'],
    baseRiskScore: 85,
    riskFactors: [],
    remediation: 'Use environment variables or secret management services',
    owaspMapping: 'A02:2021-Cryptographic Failures',
    cweId: 798,
  },
  
  // Mass Assignment
  {
    id: 'mass-assignment',
    category: 'mass_assignment',
    name: 'Mass Assignment',
    description: 'Directly using request body for model updates',
    patterns: [
      /\.create\s*\(\s*req\.body\s*\)/gi,
      /\.update\s*\(\s*req\.body\s*\)/gi,
      /Object\.assign\s*\(\s*\w+\s*,\s*req\.body\s*\)/gi,
      /\{\s*\.\.\.req\.body\s*\}/gi,
      /Model\s*\(\s*\*\*request\.data\s*\)/gi,
    ],
    languages: ['javascript', 'typescript', 'python'],
    baseRiskScore: 70,
    riskFactors: [
      { name: 'admin_field', pattern: /isAdmin|role|permissions/gi, scoreModifier: 20, description: 'Privilege escalation possible' },
    ],
    remediation: 'Explicitly specify allowed fields, use allowlists',
    owaspMapping: 'A01:2021-Broken Access Control',
    cweId: 915,
  },
  
  // Insecure Deserialization
  {
    id: 'insecure-deserial',
    category: 'insecure_deserialization',
    name: 'Insecure Deserialization',
    description: 'Deserializing untrusted data',
    patterns: [
      /pickle\.loads?\s*\(/gi,
      /yaml\.load\s*\([^,)]+\)(?!\s*,\s*Loader)/gi,
      /eval\s*\(\s*req\./gi,
      /JSON\.parse\s*\(\s*req\./gi,
      /unserialize\s*\(/gi,
    ],
    languages: ['javascript', 'typescript', 'python', 'php'],
    baseRiskScore: 85,
    riskFactors: [
      { name: 'user_data', pattern: /req\.|request\./gi, scoreModifier: 10, description: 'User-controlled data' },
    ],
    remediation: 'Avoid deserializing untrusted data, use safe loaders',
    owaspMapping: 'A08:2021-Software and Data Integrity Failures',
    cweId: 502,
  },
  
  // Path Traversal
  {
    id: 'path-traversal',
    category: 'path_traversal',
    name: 'Path Traversal',
    description: 'File path manipulation with user input',
    patterns: [
      /readFile\s*\(\s*req\./gi,
      /writeFile\s*\(\s*req\./gi,
      /path\.join\s*\([^)]*req\./gi,
      /open\s*\(\s*request\./gi,
      /sendFile\s*\(\s*req\./gi,
    ],
    languages: ['javascript', 'typescript', 'python'],
    baseRiskScore: 80,
    riskFactors: [
      { name: 'no_validation', pattern: /(?<!validate|sanitize|normalize)/gi, scoreModifier: 10, description: 'No path validation' },
    ],
    remediation: 'Validate and sanitize file paths, use allowlists',
    owaspMapping: 'A01:2021-Broken Access Control',
    cweId: 22,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 PREDICTIVE ATTACK SURFACE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class PredictiveAttackSurface extends EventEmitter {
  private config: Required<PredictiveConfig>;
  private analysisHistory: AttackSurfaceAnalysis[] = [];
  private geminiModel: unknown = null;

  constructor(config: PredictiveConfig) {
    super();
    this.config = {
      sourceDir: config.sourceDir,
      fileExtensions: config.fileExtensions ?? ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.php'],
      excludePatterns: config.excludePatterns ?? ['node_modules', 'dist', 'build', '.git', '__pycache__', 'venv'],
      analyzeDependencies: config.analyzeDependencies ?? true,
      analyzeGitHistory: config.analyzeGitHistory ?? true,
      enableAiAnalysis: config.enableAiAnalysis ?? true,
      geminiApiKey: config.geminiApiKey ?? process.env['GEMINI_API_KEY'] ?? '',
      riskThreshold: config.riskThreshold ?? 70,
      persistHistory: config.persistHistory ?? true,
      historyFilePath: config.historyFilePath ?? './attack-surface-history.json',
    };

    if (this.config.persistHistory) {
      this.loadHistory();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🚀 INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  async initialize(): Promise<void> {
    this.emit('info', '🔮 Initializing Predictive Attack Surface Analyzer...');

    if (this.config.enableAiAnalysis && this.config.geminiApiKey) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(this.config.geminiApiKey);
        this.geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        this.emit('info', '   ✅ Gemini 2.0 initialized for AI-powered analysis');
      } catch (error) {
        this.emit('warning', `   ⚠️ Gemini initialization failed: ${error}`);
      }
    }

    this.emit('info', '   ✅ Predictive Attack Surface Analyzer ready');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔍 CODE ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Analyze the entire codebase
   */
  async analyzeCodebase(): Promise<AttackSurfaceAnalysis> {
    this.emit('info', `📂 Analyzing codebase: ${this.config.sourceDir}`);
    
    const files = this.getAllFiles(this.config.sourceDir);
    this.emit('info', `   Found ${files.length} files to analyze`);

    const currentVulnerabilities: VulnerabilityTrend[] = [];
    let totalLines = 0;

    for (const filePath of files) {
      const vulnerabilities = await this.analyzeFile(filePath);
      currentVulnerabilities.push(...vulnerabilities);
      
      try {
        const content = readFileSync(filePath, 'utf-8');
        totalLines += content.split('\n').length;
      } catch {
        // Skip unreadable files
      }
    }

    // Analyze dependencies
    const dependencyRisks = this.config.analyzeDependencies 
      ? await this.analyzeDependencies()
      : [];

    // Generate predictions
    const predictedVulnerabilities = await this.generatePredictions(currentVulnerabilities);

    // Calculate risk scores
    const overallRiskScore = this.calculateOverallRisk(currentVulnerabilities, dependencyRisks);
    const predictedRiskScore30Days = this.predictRiskScore(currentVulnerabilities, 30);
    const predictedRiskScore90Days = this.predictRiskScore(currentVulnerabilities, 90);

    // Identify hot spots
    const hotSpots = this.identifyHotSpots(currentVulnerabilities);

    // Generate recommendations
    const recommendations = this.generateRecommendations(currentVulnerabilities, dependencyRisks);

    const analysis: AttackSurfaceAnalysis = {
      analyzedAt: new Date(),
      filesAnalyzed: files.length,
      totalLinesOfCode: totalLines,
      currentVulnerabilities,
      predictedVulnerabilities,
      dependencyRisks,
      overallRiskScore,
      predictedRiskScore30Days,
      predictedRiskScore90Days,
      hotSpots,
      recommendations,
    };

    // Store in history
    this.analysisHistory.push(analysis);
    if (this.config.persistHistory) {
      this.saveHistory();
    }

    this.emit('analysis_complete', analysis);
    return analysis;
  }

  /**
   * Get all files recursively
   */
  private getAllFiles(dir: string): string[] {
    const files: string[] = [];
    
    if (!existsSync(dir)) return files;

    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      
      // Skip excluded patterns
      if (this.config.excludePatterns.some(p => fullPath.includes(p))) continue;

      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          files.push(...this.getAllFiles(fullPath));
        } else if (this.config.fileExtensions.includes(extname(entry))) {
          files.push(fullPath);
        }
      } catch {
        // Skip inaccessible files
      }
    }

    return files;
  }

  /**
   * Analyze a single file
   */
  private async analyzeFile(filePath: string): Promise<VulnerabilityTrend[]> {
    const vulnerabilities: VulnerabilityTrend[] = [];
    
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const ext = extname(filePath).slice(1);
      const language = this.getLanguage(ext);

      for (const pattern of VULNERABILITY_PATTERNS) {
        if (!pattern.languages.includes(language)) continue;

        for (const regex of pattern.patterns) {
          // Reset regex state
          regex.lastIndex = 0;
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line && regex.test(line)) {
              // Calculate risk score with factors
              let riskScore = pattern.baseRiskScore;
              const contextLines = lines.slice(Math.max(0, i - 5), Math.min(lines.length, i + 5)).join('\n');
              
              for (const factor of pattern.riskFactors) {
                if (factor.pattern.test(contextLines)) {
                  riskScore += factor.scoreModifier;
                }
              }
              riskScore = Math.min(100, Math.max(0, riskScore));

              // Generate prediction
              const prediction = await this.predictVulnerabilityTrend(pattern, riskScore, filePath, i + 1);

              vulnerabilities.push({
                id: `${pattern.id}-${filePath}-${i + 1}`,
                filePath,
                lineNumber: i + 1,
                codeSnippet: line.trim().substring(0, 200),
                category: pattern.category,
                patternId: pattern.id,
                currentRiskScore: riskScore,
                predictedRiskScore: prediction.predictedScore,
                predictionConfidence: prediction.confidence,
                predictionReason: prediction.reason,
                estimatedDaysToVulnerability: prediction.daysToVuln,
                relatedChanges: [],
                recommendations: [pattern.remediation],
                historicalTrend: [],
              });

              // Reset regex for next iteration
              regex.lastIndex = 0;
              break; // Only report once per line per pattern
            }
          }
        }
      }
    } catch (error) {
      this.emit('warning', `Failed to analyze ${filePath}: ${error}`);
    }

    return vulnerabilities;
  }

  /**
   * Get language from extension
   */
  private getLanguage(ext: string): string {
    const mapping: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      php: 'php',
    };
    return mapping[ext] || ext;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔮 PREDICTION ENGINE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Predict vulnerability trend for a specific finding
   */
  private async predictVulnerabilityTrend(
    pattern: VulnerabilityPattern,
    currentScore: number,
    filePath: string,
    lineNumber: number
  ): Promise<{ predictedScore: number; confidence: number; reason: string; daysToVuln: number }> {
    // Base prediction: assume slight degradation over time without fixes
    let predictedScore = currentScore;
    let confidence = 70;
    let reason = 'Based on historical patterns and code complexity';
    let daysToVuln = 180; // Default 6 months

    // Factor 1: High-risk categories degrade faster
    if (['sqli', 'cmdi', 'ssrf', 'insecure_deserialization'].includes(pattern.category)) {
      predictedScore += 5;
      reason = 'Critical vulnerability type tends to become exploitable quickly';
      daysToVuln = 30;
    }

    // Factor 2: Check if this is in a frequently changing file
    const isHighChurn = await this.isHighChurnFile(filePath);
    if (isHighChurn) {
      predictedScore += 10;
      confidence -= 10;
      reason += '; File has high change frequency';
      daysToVuln = Math.max(7, daysToVuln - 30);
    }

    // Factor 3: Dependency-related vulnerabilities
    if (pattern.id.includes('dependency') || pattern.category === 'insecure_deserialization') {
      predictedScore += 8;
      reason += '; Dependency vulnerabilities are frequently discovered';
      daysToVuln = 60;
    }

    // Factor 4: Check historical trend if available
    const historicalAnalyses = this.analysisHistory.filter(a => 
      a.currentVulnerabilities.some(v => v.filePath === filePath && v.lineNumber === lineNumber)
    );
    if (historicalAnalyses.length > 1) {
      const scores = historicalAnalyses.map(a => {
        const vuln = a.currentVulnerabilities.find(v => v.filePath === filePath && v.lineNumber === lineNumber);
        return vuln?.currentRiskScore ?? 0;
      });
      const firstScore = scores[0] ?? 0;
      const lastScore = scores[scores.length - 1] ?? 0;
      const trend = lastScore - firstScore;
      if (trend > 0) {
        predictedScore += trend;
        reason = 'Historical trend shows increasing risk';
        confidence += 15;
      }
    }

    // AI-powered prediction if available
    if (this.geminiModel && currentScore >= this.config.riskThreshold) {
      try {
        const aiPrediction = await this.getAiPrediction(pattern, filePath, lineNumber);
        if (aiPrediction) {
          predictedScore = Math.round((predictedScore + aiPrediction.score) / 2);
          confidence = Math.min(95, confidence + 10);
          reason = aiPrediction.reason;
          daysToVuln = aiPrediction.days;
        }
      } catch {
        // Fall back to heuristic prediction
      }
    }

    return {
      predictedScore: Math.min(100, Math.max(0, predictedScore)),
      confidence: Math.min(100, Math.max(0, confidence)),
      reason,
      daysToVuln,
    };
  }

  /**
   * Check if file has high change frequency (mock implementation)
   */
  private async isHighChurnFile(filePath: string): Promise<boolean> {
    // In a real implementation, this would analyze git history
    // For now, use heuristics based on file patterns
    const highChurnPatterns = [
      /controller/i,
      /handler/i,
      /route/i,
      /api\//i,
      /service/i,
    ];
    return highChurnPatterns.some(p => p.test(filePath));
  }

  /**
   * Get AI-powered prediction
   */
  private async getAiPrediction(
    pattern: VulnerabilityPattern,
    filePath: string,
    lineNumber: number
  ): Promise<{ score: number; reason: string; days: number } | null> {
    if (!this.geminiModel) return null;

    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const contextStart = Math.max(0, lineNumber - 10);
      const contextEnd = Math.min(lines.length, lineNumber + 10);
      const context = lines.slice(contextStart, contextEnd).join('\n');

      const prompt = `Analyze this code for security vulnerability prediction:

File: ${filePath}
Line: ${lineNumber}
Vulnerability Type: ${pattern.name} (${pattern.category})
CWE: ${pattern.cweId}
OWASP: ${pattern.owaspMapping}

Code Context:
\`\`\`
${context}
\`\`\`

Based on:
1. Current code patterns
2. Typical vulnerability evolution
3. Industry trends

Predict:
1. Future risk score (0-100) considering dependency updates, API changes, and attack surface growth
2. Days until this becomes critical (if not fixed)
3. Brief reason for prediction

Respond in JSON format:
{"score": number, "days": number, "reason": "string"}`;

      const model = this.geminiModel as { generateContent: (args: unknown) => Promise<{ response: { text: () => string } }> };
      const result = await model.generateContent([prompt]);
      const text = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.emit('warning', `AI prediction failed: ${error}`);
    }
    return null;
  }

  /**
   * Generate predictions for all vulnerabilities
   */
  private async generatePredictions(current: VulnerabilityTrend[]): Promise<VulnerabilityTrend[]> {
    // Find patterns that might emerge based on current vulnerabilities
    const predictions: VulnerabilityTrend[] = [];

    // Group by file
    const fileGroups = new Map<string, VulnerabilityTrend[]>();
    for (const vuln of current) {
      const group = fileGroups.get(vuln.filePath) || [];
      group.push(vuln);
      fileGroups.set(vuln.filePath, group);
    }

    // Predict related vulnerabilities
    for (const [filePath, vulns] of fileGroups) {
      // If file has SQL injection, predict potential BOLA
      const firstVuln = vulns[0];
      if (vulns.some(v => v.category === 'sqli') && !vulns.some(v => v.category === 'bola') && firstVuln) {
        predictions.push({
          id: `predicted-bola-${filePath}`,
          filePath,
          lineNumber: firstVuln.lineNumber,
          codeSnippet: 'Predicted: BOLA vulnerability likely to emerge',
          category: 'bola',
          patternId: 'predicted',
          currentRiskScore: 0,
          predictedRiskScore: 65,
          predictionConfidence: 60,
          predictionReason: 'Files with SQL injection patterns often lack proper authorization checks',
          estimatedDaysToVulnerability: 90,
          relatedChanges: [],
          recommendations: ['Implement authorization middleware', 'Add object-level access control'],
          historicalTrend: [],
        });
      }

      // If file has XSS, predict potential sensitive data exposure
      const xssVuln = vulns.find(v => v.category === 'xss');
      if (xssVuln && !vulns.some(v => v.category === 'sensitive_data')) {
        predictions.push({
          id: `predicted-sensitive-${filePath}`,
          filePath,
          lineNumber: xssVuln.lineNumber,
          codeSnippet: 'Predicted: Sensitive data exposure risk',
          category: 'sensitive_data',
          patternId: 'predicted',
          currentRiskScore: 0,
          predictedRiskScore: 55,
          predictionConfidence: 50,
          predictionReason: 'XSS vulnerabilities often lead to data leakage',
          estimatedDaysToVulnerability: 120,
          relatedChanges: [],
          recommendations: ['Audit data exposure in templates', 'Implement output encoding'],
          historicalTrend: [],
        });
      }
    }

    return predictions;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📦 DEPENDENCY ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Analyze dependencies for known vulnerabilities
   */
  private async analyzeDependencies(): Promise<DependencyRisk[]> {
    const risks: DependencyRisk[] = [];
    
    // Check package.json
    const packageJsonPath = join(this.config.sourceDir, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies,
        };

        // Known vulnerable patterns (simplified - in production, use a vulnerability database)
        const vulnerablePackages: Record<string, { versions: string[]; type: VulnerabilityCategory; cve?: string }> = {
          'lodash': { versions: ['<4.17.21'], type: 'cmdi', cve: 'CVE-2021-23337' },
          'minimist': { versions: ['<1.2.6'], type: 'path_traversal', cve: 'CVE-2021-44906' },
          'axios': { versions: ['<0.21.1'], type: 'ssrf', cve: 'CVE-2021-3749' },
          'express': { versions: ['<4.17.3'], type: 'xss' },
          'sequelize': { versions: ['<6.3.5'], type: 'sqli' },
          'mongoose': { versions: ['<5.13.0'], type: 'sqli' },
          'handlebars': { versions: ['<4.7.7'], type: 'ssti', cve: 'CVE-2021-23369' },
          'serialize-javascript': { versions: ['<3.1.0'], type: 'xss' },
          'node-fetch': { versions: ['<2.6.7'], type: 'ssrf' },
        };

        for (const [pkg, version] of Object.entries(allDeps)) {
          const vuln = vulnerablePackages[pkg];
          if (vuln) {
            risks.push({
              package: pkg,
              currentVersion: version as string,
              vulnerableVersions: vuln.versions,
              vulnerabilityType: vuln.type,
              cveId: vuln.cve,
              riskScore: 75,
              upgradeRecommendation: `Upgrade ${pkg} to latest version`,
            });
          }
        }
      } catch (error) {
        this.emit('warning', `Failed to analyze package.json: ${error}`);
      }
    }

    // Check requirements.txt for Python
    const requirementsPath = join(this.config.sourceDir, 'requirements.txt');
    if (existsSync(requirementsPath)) {
      try {
        const content = readFileSync(requirementsPath, 'utf-8');
        const lines = content.split('\n');

        const vulnerablePythonPackages: Record<string, { type: VulnerabilityCategory; cve?: string }> = {
          'django': { type: 'sqli' },
          'flask': { type: 'xss' },
          'pyyaml': { type: 'insecure_deserialization', cve: 'CVE-2020-1747' },
          'pillow': { type: 'path_traversal' },
          'urllib3': { type: 'ssrf' },
        };

        for (const line of lines) {
          const match = line.match(/^([a-z0-9_-]+)/i);
          if (match && match[1]) {
            const pkg = match[1].toLowerCase();
            const vuln = vulnerablePythonPackages[pkg];
            if (vuln) {
              risks.push({
                package: pkg,
                currentVersion: 'unknown',
                vulnerableVersions: ['check latest advisories'],
                vulnerabilityType: vuln.type,
                cveId: vuln.cve,
                riskScore: 70,
                upgradeRecommendation: `Check ${pkg} for security updates`,
              });
            }
          }
        }
      } catch (error) {
        this.emit('warning', `Failed to analyze requirements.txt: ${error}`);
      }
    }

    return risks;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📊 RISK CALCULATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calculate overall risk score
   */
  private calculateOverallRisk(vulnerabilities: VulnerabilityTrend[], dependencies: DependencyRisk[]): number {
    if (vulnerabilities.length === 0 && dependencies.length === 0) return 0;

    // Weight: 70% code vulnerabilities, 30% dependency risks
    const vulnScores = vulnerabilities.map(v => v.currentRiskScore);
    const depScores = dependencies.map(d => d.riskScore);

    const avgVulnScore = vulnScores.length > 0 
      ? vulnScores.reduce((a, b) => a + b, 0) / vulnScores.length 
      : 0;
    const avgDepScore = depScores.length > 0 
      ? depScores.reduce((a, b) => a + b, 0) / depScores.length 
      : 0;

    // Boost score if there are many vulnerabilities
    const countBoost = Math.min(20, vulnerabilities.length * 2);

    return Math.min(100, Math.round(avgVulnScore * 0.7 + avgDepScore * 0.3 + countBoost));
  }

  /**
   * Predict risk score for future date
   */
  private predictRiskScore(vulnerabilities: VulnerabilityTrend[], daysAhead: number): number {
    if (vulnerabilities.length === 0) return 0;

    // Use predicted scores weighted by confidence
    const predictions = vulnerabilities.map(v => ({
      score: v.predictedRiskScore,
      confidence: v.predictionConfidence,
      daysToVuln: v.estimatedDaysToVulnerability,
    }));

    // Calculate weighted average, boosting scores for vulnerabilities that will become critical
    let totalWeight = 0;
    let weightedSum = 0;

    for (const pred of predictions) {
      const weight = pred.confidence / 100;
      const urgencyBoost = pred.daysToVuln <= daysAhead ? 15 : 0;
      weightedSum += (pred.score + urgencyBoost) * weight;
      totalWeight += weight;
    }

    return Math.min(100, Math.round(totalWeight > 0 ? weightedSum / totalWeight : 0));
  }

  /**
   * Identify hot spots (high-risk areas)
   */
  private identifyHotSpots(vulnerabilities: VulnerabilityTrend[]): Array<{
    path: string;
    riskScore: number;
    vulnerabilityCount: number;
  }> {
    const fileScores = new Map<string, { total: number; count: number }>();

    for (const vuln of vulnerabilities) {
      const current = fileScores.get(vuln.filePath) || { total: 0, count: 0 };
      current.total += vuln.currentRiskScore;
      current.count++;
      fileScores.set(vuln.filePath, current);
    }

    return Array.from(fileScores.entries())
      .map(([path, { total, count }]) => ({
        path,
        riskScore: Math.round(total / count),
        vulnerabilityCount: count,
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    vulnerabilities: VulnerabilityTrend[],
    dependencies: DependencyRisk[]
  ): string[] {
    const recommendations: string[] = [];

    // Priority 1: Critical vulnerabilities
    const critical = vulnerabilities.filter(v => v.currentRiskScore >= 85);
    if (critical.length > 0) {
      recommendations.push(`🚨 CRITICAL: ${critical.length} high-risk vulnerabilities require immediate attention`);
      const categories = [...new Set(critical.map(v => v.category))];
      recommendations.push(`   Focus on: ${categories.join(', ')}`);
    }

    // Priority 2: Soon-to-be-critical
    const upcoming = vulnerabilities.filter(v => v.estimatedDaysToVulnerability <= 30 && v.predictedRiskScore >= 70);
    if (upcoming.length > 0) {
      recommendations.push(`⚠️ URGENT: ${upcoming.length} vulnerabilities predicted to become critical within 30 days`);
    }

    // Priority 3: Dependency updates
    if (dependencies.length > 0) {
      recommendations.push(`📦 Update ${dependencies.length} packages with known vulnerabilities`);
    }

    // Priority 4: Category-specific recommendations
    const categoryCount = new Map<string, number>();
    for (const v of vulnerabilities) {
      categoryCount.set(v.category, (categoryCount.get(v.category) || 0) + 1);
    }

    if ((categoryCount.get('sqli') || 0) > 0) {
      recommendations.push('💉 Implement parameterized queries across all database operations');
    }
    if ((categoryCount.get('xss') || 0) > 0) {
      recommendations.push('🛡️ Add Content Security Policy headers and output encoding');
    }
    if ((categoryCount.get('bola') || 0) > 0) {
      recommendations.push('🔐 Implement object-level authorization middleware');
    }

    // Priority 5: Testing recommendations
    recommendations.push('🧪 Add security-focused unit tests for identified patterns');
    recommendations.push('📊 Schedule regular security scans in CI/CD pipeline');

    return recommendations;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 💾 PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════════════

  private saveHistory(): void {
    try {
      const data = this.analysisHistory.slice(-50); // Keep last 50 analyses
      writeFileSync(this.config.historyFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
      this.emit('warning', `Failed to save history: ${error}`);
    }
  }

  private loadHistory(): void {
    try {
      if (existsSync(this.config.historyFilePath)) {
        const data = JSON.parse(readFileSync(this.config.historyFilePath, 'utf-8'));
        this.analysisHistory = data.map((a: AttackSurfaceAnalysis) => ({
          ...a,
          analyzedAt: new Date(a.analyzedAt),
        }));
        this.emit('info', `   📂 Loaded ${this.analysisHistory.length} historical analyses`);
      }
    } catch (error) {
      this.emit('warning', `Failed to load history: ${error}`);
    }
  }

  /**
   * Get analysis history
   */
  getHistory(): AttackSurfaceAnalysis[] {
    return [...this.analysisHistory];
  }

  /**
   * Compare two analyses
   */
  compareAnalyses(older: AttackSurfaceAnalysis, newer: AttackSurfaceAnalysis): {
    newVulnerabilities: VulnerabilityTrend[];
    resolvedVulnerabilities: VulnerabilityTrend[];
    riskChange: number;
    summary: string;
  } {
    const olderIds = new Set(older.currentVulnerabilities.map(v => v.id));
    const newerIds = new Set(newer.currentVulnerabilities.map(v => v.id));

    const newVulns = newer.currentVulnerabilities.filter(v => !olderIds.has(v.id));
    const resolved = older.currentVulnerabilities.filter(v => !newerIds.has(v.id));
    const riskChange = newer.overallRiskScore - older.overallRiskScore;

    let summary = '';
    if (riskChange > 10) {
      summary = `⚠️ Risk increased by ${riskChange} points. ${newVulns.length} new vulnerabilities found.`;
    } else if (riskChange < -10) {
      summary = `✅ Risk decreased by ${Math.abs(riskChange)} points. ${resolved.length} vulnerabilities resolved.`;
    } else {
      summary = `➡️ Risk stable. ${newVulns.length} new, ${resolved.length} resolved.`;
    }

    return { newVulnerabilities: newVulns, resolvedVulnerabilities: resolved, riskChange, summary };
  }
}
