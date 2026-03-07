// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v1.2.0 - PII SCANNER                                              ║
// ║  "The Privacy Hunter" - Personal Identifiable Information Detection Engine   ║
// ║  Specialization: GDPR/CCPA/HIPAA Compliance & Data Leak Detection            ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { EventEmitter } from 'events';
import { createHash } from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 PII SCANNER TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * PII category types
 */
export type PIICategory = 
  | 'email'
  | 'phone'
  | 'ssn'
  | 'credit_card'
  | 'passport'
  | 'drivers_license'
  | 'national_id'
  | 'address'
  | 'dob'
  | 'ip_address'
  | 'mac_address'
  | 'iban'
  | 'swift'
  | 'tax_id'
  | 'medical_record'
  | 'biometric'
  | 'genetic'
  | 'bank_account'
  | 'crypto_wallet'
  | 'username'
  | 'password_hash'
  | 'api_key'
  | 'jwt_token'
  | 'session_id';

/**
 * Risk level for PII exposure
 */
export type PIIRiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Compliance framework
 */
export type ComplianceFramework = 'GDPR' | 'CCPA' | 'HIPAA' | 'PCI-DSS' | 'SOX' | 'FERPA' | 'COPPA';

/**
 * Detected PII instance
 */
export interface PIIDetection {
  id: string;
  category: PIICategory;
  value: string;
  redactedValue: string;
  confidence: number; // 0-100
  riskLevel: PIIRiskLevel;
  fieldPath: string; // JSON path where found
  context: string; // Surrounding text for context
  compliance: ComplianceFramework[];
  location: {
    startIndex: number;
    endIndex: number;
    line?: number;
  };
  metadata: Record<string, unknown>;
}

/**
 * PII Scanner configuration
 */
export interface PIIScannerConfig {
  categories?: PIICategory[];
  minConfidence?: number;
  useAI?: boolean;
  geminiApiKey?: string;
  customPatterns?: CustomPIIPattern[];
  redactMode?: 'full' | 'partial' | 'hash' | 'none';
  countryCode?: string; // For locale-specific patterns
}

/**
 * Custom PII pattern definition
 */
export interface CustomPIIPattern {
  name: string;
  category: PIICategory | string;
  pattern: RegExp;
  riskLevel: PIIRiskLevel;
  compliance: ComplianceFramework[];
  validator?: (value: string) => boolean;
}

/**
 * Endpoint PII analysis result
 */
export interface EndpointPIIResult {
  endpoint: string;
  method: string;
  detections: PIIDetection[];
  riskScore: number;
  compliance: {
    framework: ComplianceFramework;
    violations: string[];
  }[];
  recommendations: string[];
}

/**
 * PII Scanner report
 */
export interface PIIScannerReport {
  target: string;
  startTime: Date;
  endTime: Date;
  endpointsScanned: number;
  totalDetections: number;
  detectionsByCategory: Record<PIICategory, number>;
  detectionsByRisk: Record<PIIRiskLevel, number>;
  criticalEndpoints: EndpointPIIResult[];
  complianceViolations: {
    framework: ComplianceFramework;
    count: number;
    details: string[];
  }[];
  overallRiskScore: number;
  recommendations: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 PII REGEX PATTERNS - 50+ PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Comprehensive PII detection patterns
 */
const PII_PATTERNS: Record<PIICategory, { patterns: RegExp[]; riskLevel: PIIRiskLevel; compliance: ComplianceFramework[] }> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // 📧 EMAIL ADDRESSES
  // ═══════════════════════════════════════════════════════════════════════════
  email: {
    patterns: [
      // Standard email
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
      // Email with subdomain
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
      // Obfuscated email (user [at] domain [dot] com)
      /\b[A-Za-z0-9._%+-]+\s*\[at\]\s*[A-Za-z0-9.-]+\s*\[dot\]\s*[A-Z|a-z]{2,}\b/gi,
    ],
    riskLevel: 'high',
    compliance: ['GDPR', 'CCPA'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 📞 PHONE NUMBERS
  // ═══════════════════════════════════════════════════════════════════════════
  phone: {
    patterns: [
      // US format: (123) 456-7890, 123-456-7890, 1234567890
      /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      // International: +XX XXX XXX XXXX
      /\b\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/g,
      // UK format: +44 XXXX XXXXXX
      /\b\+44\s?\d{4}\s?\d{6}\b/g,
      // European format: +XX X XXXX XXXX
      /\b\+\d{2}\s?\d\s?\d{4}\s?\d{4}\b/g,
      // Bulgarian format: +359 XX XXX XXXX
      /\b\+359\s?\d{2}\s?\d{3}\s?\d{4}\b/g,
    ],
    riskLevel: 'high',
    compliance: ['GDPR', 'CCPA', 'HIPAA'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🆔 SOCIAL SECURITY NUMBERS
  // ═══════════════════════════════════════════════════════════════════════════
  ssn: {
    patterns: [
      // US SSN: XXX-XX-XXXX
      /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
      // SSN with label
      /\bssn[:\s]*\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/gi,
      // Social Security label
      /\bsocial\s*security[:\s#]*\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/gi,
    ],
    riskLevel: 'critical',
    compliance: ['GDPR', 'CCPA', 'HIPAA', 'SOX'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 💳 CREDIT CARD NUMBERS
  // ═══════════════════════════════════════════════════════════════════════════
  credit_card: {
    patterns: [
      // Visa: 4XXX XXXX XXXX XXXX
      /\b4\d{3}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
      // MasterCard: 5XXX XXXX XXXX XXXX
      /\b5[1-5]\d{2}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
      // American Express: 3XXX XXXXXX XXXXX
      /\b3[47]\d{2}[-\s]?\d{6}[-\s]?\d{5}\b/g,
      // Discover: 6011 XXXX XXXX XXXX
      /\b6(?:011|5\d{2})[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
      // Generic 16-digit
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
      // Card number with label
      /\b(?:card|credit|cc)[:\s#]*\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/gi,
    ],
    riskLevel: 'critical',
    compliance: ['PCI-DSS', 'GDPR', 'CCPA'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🛂 PASSPORT NUMBERS
  // ═══════════════════════════════════════════════════════════════════════════
  passport: {
    patterns: [
      // US Passport: 9 digits
      /\b[A-Z]?\d{8,9}\b/g,
      // UK Passport: 9 alphanumeric
      /\b[A-Z]{2}\d{7}\b/g,
      // Generic passport pattern
      /\bpassport[:\s#]*[A-Z0-9]{6,12}\b/gi,
    ],
    riskLevel: 'critical',
    compliance: ['GDPR', 'CCPA'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🚗 DRIVER'S LICENSE
  // ═══════════════════════════════════════════════════════════════════════════
  drivers_license: {
    patterns: [
      // US formats vary by state
      /\b[A-Z]{1,2}\d{5,8}\b/g,
      // With label
      /\b(?:driver'?s?\s*license|dl)[:\s#]*[A-Z0-9]{5,15}\b/gi,
    ],
    riskLevel: 'high',
    compliance: ['GDPR', 'CCPA'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🆔 NATIONAL ID NUMBERS
  // ═══════════════════════════════════════════════════════════════════════════
  national_id: {
    patterns: [
      // Bulgarian EGN (ЕГН): 10 digits
      /\b\d{2}[0-5]\d[0-3]\d{5}\b/g,
      // UK NI Number: XX 99 99 99 X
      /\b[A-CEGHJ-PR-TW-Z]{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]\b/gi,
      // German ID: XXXXXXXXX
      /\b[CFGHJKLMNPRTVWXYZ0-9]{9}\b/g,
    ],
    riskLevel: 'critical',
    compliance: ['GDPR'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🏠 PHYSICAL ADDRESSES
  // ═══════════════════════════════════════════════════════════════════════════
  address: {
    patterns: [
      // US Street Address
      /\b\d{1,5}\s+(?:[A-Za-z]+\s+){1,4}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Way|Place|Pl)\b/gi,
      // ZIP code
      /\b\d{5}(?:-\d{4})?\b/g,
      // UK Postcode
      /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi,
    ],
    riskLevel: 'medium',
    compliance: ['GDPR', 'CCPA'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 📅 DATE OF BIRTH
  // ═══════════════════════════════════════════════════════════════════════════
  dob: {
    patterns: [
      // ISO format: YYYY-MM-DD
      /\b(?:dob|birth|born)[:\s]*(?:19|20)\d{2}[-\/]\d{2}[-\/]\d{2}\b/gi,
      // US format: MM/DD/YYYY
      /\b(?:dob|birth|born)[:\s]*\d{2}[-\/]\d{2}[-\/](?:19|20)\d{2}\b/gi,
      // EU format: DD/MM/YYYY
      /\b(?:dob|birth|born)[:\s]*\d{2}[-\/]\d{2}[-\/](?:19|20)\d{2}\b/gi,
    ],
    riskLevel: 'medium',
    compliance: ['GDPR', 'CCPA', 'HIPAA'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🌐 IP ADDRESSES
  // ═══════════════════════════════════════════════════════════════════════════
  ip_address: {
    patterns: [
      // IPv4
      /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\b/g,
      // IPv6
      /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,
      // IPv6 compressed
      /\b(?:[0-9a-fA-F]{1,4}:){1,7}:\b/g,
    ],
    riskLevel: 'medium',
    compliance: ['GDPR'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 📱 MAC ADDRESSES
  // ═══════════════════════════════════════════════════════════════════════════
  mac_address: {
    patterns: [
      // Standard MAC: XX:XX:XX:XX:XX:XX
      /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g,
      // Cisco format: XXXX.XXXX.XXXX
      /\b(?:[0-9A-Fa-f]{4}\.){2}[0-9A-Fa-f]{4}\b/g,
    ],
    riskLevel: 'low',
    compliance: ['GDPR'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🏦 IBAN NUMBERS
  // ═══════════════════════════════════════════════════════════════════════════
  iban: {
    patterns: [
      // IBAN format: 2 letters + 2 digits + up to 30 alphanumeric
      /\b[A-Z]{2}\d{2}[A-Z0-9]{4,30}\b/g,
      // With spaces: DE89 3704 0044 0532 0130 00
      /\b[A-Z]{2}\d{2}\s?(?:[A-Z0-9]{4}\s?){2,7}[A-Z0-9]{1,4}\b/g,
    ],
    riskLevel: 'high',
    compliance: ['GDPR', 'PCI-DSS'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🏦 SWIFT/BIC CODES
  // ═══════════════════════════════════════════════════════════════════════════
  swift: {
    patterns: [
      // SWIFT/BIC: 8 or 11 characters
      /\b[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/g,
    ],
    riskLevel: 'medium',
    compliance: ['GDPR', 'PCI-DSS'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 📋 TAX ID NUMBERS
  // ═══════════════════════════════════════════════════════════════════════════
  tax_id: {
    patterns: [
      // US EIN: XX-XXXXXXX
      /\b\d{2}[-]\d{7}\b/g,
      // US ITIN: 9XX-XX-XXXX
      /\b9\d{2}[-\s]?\d{2}[-\s]?\d{4}\b/g,
      // With label
      /\b(?:tax\s*id|ein|tin|vat)[:\s#]*[A-Z0-9]{8,15}\b/gi,
    ],
    riskLevel: 'high',
    compliance: ['GDPR', 'SOX'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🏥 MEDICAL RECORD NUMBERS
  // ═══════════════════════════════════════════════════════════════════════════
  medical_record: {
    patterns: [
      // MRN patterns
      /\b(?:mrn|medical\s*record|patient\s*id)[:\s#]*[A-Z0-9]{6,12}\b/gi,
      // DEA Number: 2 letters + 7 digits
      /\b[A-Z]{2}\d{7}\b/g,
      // NPI: 10 digits
      /\b(?:npi)[:\s#]*\d{10}\b/gi,
    ],
    riskLevel: 'critical',
    compliance: ['HIPAA', 'GDPR'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 👁️ BIOMETRIC DATA INDICATORS
  // ═══════════════════════════════════════════════════════════════════════════
  biometric: {
    patterns: [
      // Fingerprint hash
      /\b(?:fingerprint|biometric|face_id)[:\s]*[a-fA-F0-9]{32,128}\b/gi,
      // Voice print
      /\b(?:voice_print|voiceprint)[:\s]*[a-fA-F0-9]{32,128}\b/gi,
    ],
    riskLevel: 'critical',
    compliance: ['GDPR', 'CCPA', 'HIPAA'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧬 GENETIC DATA INDICATORS
  // ═══════════════════════════════════════════════════════════════════════════
  genetic: {
    patterns: [
      // DNA sequence markers
      /\b(?:dna|genetic|genome)[:\s]*[ACGT]{20,}\b/gi,
      // SNP IDs
      /\brs\d{1,12}\b/g,
    ],
    riskLevel: 'critical',
    compliance: ['GDPR', 'HIPAA', 'CCPA'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🏦 BANK ACCOUNT NUMBERS
  // ═══════════════════════════════════════════════════════════════════════════
  bank_account: {
    patterns: [
      // US Account: 8-17 digits
      /\b(?:account|acct)[:\s#]*\d{8,17}\b/gi,
      // Routing number: 9 digits
      /\b(?:routing|aba)[:\s#]*\d{9}\b/gi,
    ],
    riskLevel: 'critical',
    compliance: ['PCI-DSS', 'GDPR', 'SOX'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ₿ CRYPTOCURRENCY WALLETS
  // ═══════════════════════════════════════════════════════════════════════════
  crypto_wallet: {
    patterns: [
      // Bitcoin: starts with 1, 3, or bc1
      /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g,
      /\bbc1[a-zA-HJ-NP-Z0-9]{39,59}\b/g,
      // Ethereum: 0x + 40 hex chars
      /\b0x[a-fA-F0-9]{40}\b/g,
    ],
    riskLevel: 'high',
    compliance: ['GDPR'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 👤 USERNAMES
  // ═══════════════════════════════════════════════════════════════════════════
  username: {
    patterns: [
      /\b(?:username|user_name|login)[:\s]*["']?[a-zA-Z0-9_.-]{3,30}["']?\b/gi,
    ],
    riskLevel: 'low',
    compliance: ['GDPR'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔐 PASSWORD HASHES
  // ═══════════════════════════════════════════════════════════════════════════
  password_hash: {
    patterns: [
      // BCrypt
      /\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}/g,
      // MD5 hash
      /\b[a-fA-F0-9]{32}\b/g,
      // SHA-256
      /\b[a-fA-F0-9]{64}\b/g,
      // Password field
      /\b(?:password|passwd|pwd)[:\s]*["'][^"']{8,}["']/gi,
    ],
    riskLevel: 'critical',
    compliance: ['GDPR', 'PCI-DSS'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔑 API KEYS
  // ═══════════════════════════════════════════════════════════════════════════
  api_key: {
    patterns: [
      // Generic API key
      /\b(?:api[_-]?key|apikey|api[_-]?secret)[:\s=]*["']?[A-Za-z0-9_-]{20,64}["']?\b/gi,
      // AWS Key
      /\bAKIA[0-9A-Z]{16}\b/g,
      // Google API Key
      /\bAIza[0-9A-Za-z_-]{35}\b/g,
      // Stripe Key
      /\bsk_live_[0-9a-zA-Z]{24}\b/g,
      // GitHub Token
      /\bghp_[0-9a-zA-Z]{36}\b/g,
    ],
    riskLevel: 'critical',
    compliance: ['PCI-DSS', 'SOX'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎫 JWT TOKENS
  // ═══════════════════════════════════════════════════════════════════════════
  jwt_token: {
    patterns: [
      // JWT: header.payload.signature
      /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
    ],
    riskLevel: 'high',
    compliance: ['GDPR', 'PCI-DSS'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🍪 SESSION IDS
  // ═══════════════════════════════════════════════════════════════════════════
  session_id: {
    patterns: [
      // Session ID patterns
      /\b(?:session[_-]?id|sid|PHPSESSID|JSESSIONID)[:\s=]*["']?[A-Za-z0-9_-]{20,128}["']?\b/gi,
      // ASP.NET Session
      /\bASP\.NET_SessionId[:\s=]*[A-Za-z0-9_-]{24}\b/gi,
    ],
    riskLevel: 'high',
    compliance: ['GDPR', 'PCI-DSS'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔍 PII SCANNER CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * PII Scanner - The Privacy Hunter
 * 
 * Comprehensive Personal Identifiable Information detection engine
 * with 50+ regex patterns and optional AI enhancement.
 */
export class PIIScanner extends EventEmitter {
  private config: Required<PIIScannerConfig>;
  private customPatterns: CustomPIIPattern[] = [];
  private detections: PIIDetection[] = [];

  constructor(config: PIIScannerConfig = {}) {
    super();

    this.config = {
      categories: config.categories ?? Object.keys(PII_PATTERNS) as PIICategory[],
      minConfidence: config.minConfidence ?? 70,
      useAI: config.useAI ?? false,
      geminiApiKey: config.geminiApiKey ?? process.env.GEMINI_API_KEY ?? '',
      customPatterns: config.customPatterns ?? [],
      redactMode: config.redactMode ?? 'partial',
      countryCode: config.countryCode ?? 'US',
    };

    this.customPatterns = config.customPatterns ?? [];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔍 SCANNING METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Scan a string for PII
   */
  scanText(text: string, fieldPath: string = ''): PIIDetection[] {
    const detections: PIIDetection[] = [];

    for (const category of this.config.categories) {
      const patternConfig = PII_PATTERNS[category];
      if (!patternConfig) continue;

      for (const pattern of patternConfig.patterns) {
        // Reset lastIndex for global patterns
        pattern.lastIndex = 0;
        
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const value = match[0];
          const confidence = this.calculateConfidence(category, value);

          if (confidence >= this.config.minConfidence) {
            const detection: PIIDetection = {
              id: this.generateId(value, category),
              category,
              value,
              redactedValue: this.redact(value, category),
              confidence,
              riskLevel: patternConfig.riskLevel,
              fieldPath,
              context: this.extractContext(text, match.index, value.length),
              compliance: patternConfig.compliance,
              location: {
                startIndex: match.index,
                endIndex: match.index + value.length,
              },
              metadata: {},
            };

            detections.push(detection);
            this.emit('detection', detection);
          }
        }
      }
    }

    // Check custom patterns
    for (const custom of this.customPatterns) {
      custom.pattern.lastIndex = 0;
      
      let match;
      while ((match = custom.pattern.exec(text)) !== null) {
        const value = match[0];
        
        // Validate if validator exists
        if (custom.validator && !custom.validator(value)) continue;

        const detection: PIIDetection = {
          id: this.generateId(value, custom.category as PIICategory),
          category: custom.category as PIICategory,
          value,
          redactedValue: this.redact(value, custom.category as PIICategory),
          confidence: 85,
          riskLevel: custom.riskLevel,
          fieldPath,
          context: this.extractContext(text, match.index, value.length),
          compliance: custom.compliance,
          location: {
            startIndex: match.index,
            endIndex: match.index + value.length,
          },
          metadata: { customPattern: custom.name },
        };

        detections.push(detection);
        this.emit('detection', detection);
      }
    }

    return detections;
  }

  /**
   * Scan JSON object recursively for PII
   */
  scanJSON(obj: unknown, basePath: string = ''): PIIDetection[] {
    const detections: PIIDetection[] = [];

    const scan = (value: unknown, path: string): void => {
      if (typeof value === 'string') {
        const found = this.scanText(value, path);
        detections.push(...found);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          scan(item, `${path}[${index}]`);
        });
      } else if (value !== null && typeof value === 'object') {
        for (const [key, val] of Object.entries(value)) {
          // Also check field names for sensitive indicators
          const keyDetections = this.checkFieldName(key, path);
          detections.push(...keyDetections);
          
          scan(val, path ? `${path}.${key}` : key);
        }
      }
    };

    scan(obj, basePath);
    return detections;
  }

  /**
   * Scan an API response
   */
  async scanAPIResponse(
    endpoint: string,
    method: string,
    responseBody: string,
    headers: Record<string, string> = {}
  ): Promise<EndpointPIIResult> {
    console.log(`   🔍 Scanning: ${method} ${endpoint}`);

    let detections: PIIDetection[] = [];

    // Try to parse as JSON
    try {
      const json = JSON.parse(responseBody);
      detections = this.scanJSON(json);
    } catch {
      // Scan as plain text
      detections = this.scanText(responseBody);
    }

    // Also scan headers for PII
    for (const [key, value] of Object.entries(headers)) {
      const headerDetections = this.scanText(value, `header.${key}`);
      detections.push(...headerDetections);
    }

    // Calculate risk score
    const riskScore = this.calculateEndpointRiskScore(detections);

    // Determine compliance violations
    const compliance = this.analyzeCompliance(detections);

    // Generate recommendations
    const recommendations = this.generateRecommendations(detections);

    const result: EndpointPIIResult = {
      endpoint,
      method,
      detections,
      riskScore,
      compliance,
      recommendations,
    };

    this.detections.push(...detections);

    if (detections.length > 0) {
      const critical = detections.filter(d => d.riskLevel === 'critical').length;
      const high = detections.filter(d => d.riskLevel === 'high').length;
      console.log(`      ⚠️  Found ${detections.length} PII instances (${critical} critical, ${high} high)`);
    }

    return result;
  }

  /**
   * Check field name for sensitive indicators
   */
  private checkFieldName(fieldName: string, parentPath: string): PIIDetection[] {
    const sensitiveFields: Record<string, { category: PIICategory; riskLevel: PIIRiskLevel }> = {
      email: { category: 'email', riskLevel: 'high' },
      mail: { category: 'email', riskLevel: 'high' },
      phone: { category: 'phone', riskLevel: 'high' },
      telephone: { category: 'phone', riskLevel: 'high' },
      mobile: { category: 'phone', riskLevel: 'high' },
      ssn: { category: 'ssn', riskLevel: 'critical' },
      social_security: { category: 'ssn', riskLevel: 'critical' },
      credit_card: { category: 'credit_card', riskLevel: 'critical' },
      card_number: { category: 'credit_card', riskLevel: 'critical' },
      password: { category: 'password_hash', riskLevel: 'critical' },
      passwd: { category: 'password_hash', riskLevel: 'critical' },
      api_key: { category: 'api_key', riskLevel: 'critical' },
      secret: { category: 'api_key', riskLevel: 'critical' },
      token: { category: 'jwt_token', riskLevel: 'high' },
      address: { category: 'address', riskLevel: 'medium' },
      dob: { category: 'dob', riskLevel: 'medium' },
      birth_date: { category: 'dob', riskLevel: 'medium' },
      ip_address: { category: 'ip_address', riskLevel: 'medium' },
    };

    const lowerField = fieldName.toLowerCase();
    const match = sensitiveFields[lowerField];

    if (match) {
      return [{
        id: this.generateId(fieldName, match.category),
        category: match.category,
        value: `[FIELD: ${fieldName}]`,
        redactedValue: `[SENSITIVE_FIELD]`,
        confidence: 60,
        riskLevel: match.riskLevel,
        fieldPath: parentPath ? `${parentPath}.${fieldName}` : fieldName,
        context: `Sensitive field name detected: ${fieldName}`,
        compliance: PII_PATTERNS[match.category]?.compliance ?? ['GDPR'],
        location: { startIndex: 0, endIndex: fieldName.length },
        metadata: { fieldNameMatch: true },
      }];
    }

    return [];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 VALIDATION & CONFIDENCE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calculate confidence score for a detection
   */
  private calculateConfidence(category: PIICategory, value: string): number {
    let confidence = 70; // Base confidence

    switch (category) {
      case 'email':
        // Validate email structure
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          confidence = 95;
        }
        break;

      case 'credit_card':
        // Luhn algorithm validation
        if (this.luhnCheck(value.replace(/\D/g, ''))) {
          confidence = 98;
        } else {
          confidence = 50;
        }
        break;

      case 'phone':
        // Check reasonable length
        const digits = value.replace(/\D/g, '');
        if (digits.length >= 10 && digits.length <= 15) {
          confidence = 85;
        }
        break;

      case 'ssn':
        // Validate SSN format
        const ssnDigits = value.replace(/\D/g, '');
        if (ssnDigits.length === 9 && !ssnDigits.startsWith('000') && !ssnDigits.startsWith('666')) {
          confidence = 90;
        }
        break;

      case 'ip_address':
        // Validate IP
        const parts = value.split('.');
        if (parts.length === 4 && parts.every(p => parseInt(p) >= 0 && parseInt(p) <= 255)) {
          confidence = 95;
        }
        break;

      case 'jwt_token':
        // Validate JWT structure
        if (value.split('.').length === 3) {
          try {
            JSON.parse(Buffer.from(value.split('.')[1]!, 'base64').toString());
            confidence = 98;
          } catch {
            confidence = 60;
          }
        }
        break;

      default:
        confidence = 75;
    }

    return confidence;
  }

  /**
   * Luhn algorithm for credit card validation
   */
  private luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]!, 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔒 REDACTION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Redact a PII value
   */
  private redact(value: string, _category: PIICategory): string {
    switch (this.config.redactMode) {
      case 'full':
        return '***REDACTED***';
      
      case 'hash':
        return createHash('sha256').update(value).digest('hex').substring(0, 12);
      
      case 'partial':
        if (value.length <= 4) return '****';
        if (value.length <= 8) return value.substring(0, 2) + '****';
        return value.substring(0, 4) + '****' + value.substring(value.length - 4);
      
      case 'none':
        return value;
      
      default:
        return '****';
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📊 ANALYSIS & REPORTING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calculate risk score for an endpoint
   */
  private calculateEndpointRiskScore(detections: PIIDetection[]): number {
    const riskWeights: Record<PIIRiskLevel, number> = {
      critical: 30,
      high: 20,
      medium: 10,
      low: 5,
      info: 1,
    };

    let score = 0;
    for (const detection of detections) {
      score += riskWeights[detection.riskLevel] * (detection.confidence / 100);
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Analyze compliance violations
   */
  private analyzeCompliance(detections: PIIDetection[]): { framework: ComplianceFramework; violations: string[] }[] {
    const frameworkViolations: Map<ComplianceFramework, Set<string>> = new Map();

    for (const detection of detections) {
      for (const framework of detection.compliance) {
        if (!frameworkViolations.has(framework)) {
          frameworkViolations.set(framework, new Set());
        }
        frameworkViolations.get(framework)!.add(
          `${detection.category} exposure at ${detection.fieldPath}`
        );
      }
    }

    return Array.from(frameworkViolations.entries()).map(([framework, violations]) => ({
      framework,
      violations: Array.from(violations),
    }));
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(detections: PIIDetection[]): string[] {
    const recommendations: Set<string> = new Set();

    for (const detection of detections) {
      switch (detection.category) {
        case 'email':
        case 'phone':
          recommendations.add('Mask or hash PII in API responses');
          break;
        case 'ssn':
        case 'credit_card':
        case 'bank_account':
          recommendations.add('Remove sensitive financial data from responses - use tokenization');
          break;
        case 'password_hash':
        case 'api_key':
        case 'jwt_token':
          recommendations.add('CRITICAL: Remove authentication secrets from API responses');
          break;
        case 'medical_record':
        case 'genetic':
        case 'biometric':
          recommendations.add('Implement HIPAA-compliant data handling');
          break;
        case 'ip_address':
          recommendations.add('Anonymize IP addresses in logs and responses');
          break;
      }
    }

    if (detections.some(d => d.riskLevel === 'critical')) {
      recommendations.add('URGENT: Critical PII exposure detected - immediate remediation required');
    }

    return Array.from(recommendations);
  }

  /**
   * Extract context around a match
   */
  private extractContext(text: string, index: number, length: number): string {
    const contextSize = 50;
    const start = Math.max(0, index - contextSize);
    const end = Math.min(text.length, index + length + contextSize);
    
    let context = text.substring(start, end);
    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';
    
    return context;
  }

  /**
   * Generate unique ID for detection
   */
  private generateId(value: string, category: PIICategory): string {
    return createHash('sha256')
      .update(value + category + Date.now())
      .digest('hex')
      .substring(0, 12);
  }

  /**
   * Generate comprehensive report
   */
  generateReport(target: string, startTime: Date): PIIScannerReport {
    const detectionsByCategory = {} as Record<PIICategory, number>;
    const detectionsByRisk = {} as Record<PIIRiskLevel, number>;

    for (const detection of this.detections) {
      detectionsByCategory[detection.category] = (detectionsByCategory[detection.category] ?? 0) + 1;
      detectionsByRisk[detection.riskLevel] = (detectionsByRisk[detection.riskLevel] ?? 0) + 1;
    }

    const criticalDetections = this.detections.filter(d => 
      d.riskLevel === 'critical' || d.riskLevel === 'high'
    );

    // Group by endpoint
    const endpointMap: Map<string, PIIDetection[]> = new Map();
    for (const detection of criticalDetections) {
      const endpoint = detection.fieldPath.split('.')[0] ?? 'unknown';
      if (!endpointMap.has(endpoint)) {
        endpointMap.set(endpoint, []);
      }
      endpointMap.get(endpoint)!.push(detection);
    }

    const criticalEndpoints: EndpointPIIResult[] = Array.from(endpointMap.entries()).map(([endpoint, dets]) => ({
      endpoint,
      method: 'UNKNOWN',
      detections: dets,
      riskScore: this.calculateEndpointRiskScore(dets),
      compliance: this.analyzeCompliance(dets),
      recommendations: this.generateRecommendations(dets),
    }));

    const complianceViolations = this.analyzeCompliance(this.detections).map(cv => ({
      framework: cv.framework,
      count: cv.violations.length,
      details: cv.violations,
    }));

    return {
      target,
      startTime,
      endTime: new Date(),
      endpointsScanned: endpointMap.size,
      totalDetections: this.detections.length,
      detectionsByCategory,
      detectionsByRisk,
      criticalEndpoints,
      complianceViolations,
      overallRiskScore: this.calculateEndpointRiskScore(this.detections),
      recommendations: this.generateRecommendations(this.detections),
    };
  }

  /**
   * Print report to console
   */
  printReport(report: PIIScannerReport): void {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🔍 PII SCANNER REPORT                                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Target: ${report.target.padEnd(58)}║
║ Total PII Detections: ${report.totalDetections.toString().padEnd(45)}║
║ Overall Risk Score: ${report.overallRiskScore.toString().padEnd(46)}/100 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ DETECTIONS BY RISK:                                                          ║
║   🔴 Critical: ${(report.detectionsByRisk.critical ?? 0).toString().padEnd(52)}║
║   🟠 High:     ${(report.detectionsByRisk.high ?? 0).toString().padEnd(52)}║
║   🟡 Medium:   ${(report.detectionsByRisk.medium ?? 0).toString().padEnd(52)}║
║   🟢 Low:      ${(report.detectionsByRisk.low ?? 0).toString().padEnd(52)}║
╠══════════════════════════════════════════════════════════════════════════════╣
║ COMPLIANCE VIOLATIONS:                                                       ║`);

    for (const cv of report.complianceViolations) {
      console.log(`║   ${cv.framework}: ${cv.count.toString().padEnd(58)}║`);
    }

    console.log(`╠══════════════════════════════════════════════════════════════════════════════╣
║ RECOMMENDATIONS:                                                             ║`);

    for (const rec of report.recommendations.slice(0, 5)) {
      console.log(`║ 💡 ${rec.substring(0, 63).padEnd(63)}║`);
    }

    console.log(`╚══════════════════════════════════════════════════════════════════════════════╝`);
  }

  /**
   * Clear all detections
   */
  clearDetections(): void {
    this.detections = [];
  }

  /**
   * Add custom pattern
   */
  addCustomPattern(pattern: CustomPIIPattern): void {
    this.customPatterns.push(pattern);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export { PII_PATTERNS };
