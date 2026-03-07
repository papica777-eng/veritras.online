/**
 * ⚛️🛡️ QANTUM OBSIDIAN SHIELD - PARANOID OBFUSCATION CONFIG
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 *    ██████╗ ██████╗ ███████╗██╗██████╗ ██╗ █████╗ ███╗   ██╗
 *   ██╔═══██╗██╔══██╗██╔════╝██║██╔══██╗██║██╔══██╗████╗  ██║
 *   ██║   ██║██████╔╝███████╗██║██║  ██║██║███████║██╔██╗ ██║
 *   ██║   ██║██╔══██╗╚════██║██║██║  ██║██║██╔══██║██║╚██╗██║
 *   ╚██████╔╝██████╔╝███████║██║██████╔╝██║██║  ██║██║ ╚████║
 *    ╚═════╝ ╚═════╝ ╚══════╝╚═╝╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
 *                                                             
 *   ███████╗██╗  ██╗██╗███████╗██╗     ██████╗                
 *   ██╔════╝██║  ██║██║██╔════╝██║     ██╔══██╗               
 *   ███████╗███████║██║█████╗  ██║     ██║  ██║               
 *   ╚════██║██╔══██║██║██╔══╝  ██║     ██║  ██║               
 *   ███████║██║  ██║██║███████╗███████╗██████╔╝               
 *   ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═════╝                
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 *   PARANOID LEVEL OBFUSCATION
 *   
 *   "When they try to read the code, they see only shadows."
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════════════════════════════
// DOMAIN LOCK - Only runs on authorized domains
// ═══════════════════════════════════════════════════════════════════════════════════════

const AUTHORIZED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'qantum.local',
  'api.qantum-prime.com',
  'sentinel.qantum-prime.com'
];

// ═══════════════════════════════════════════════════════════════════════════════════════
// RESERVED NAMES - Critical identifiers to preserve
// ═══════════════════════════════════════════════════════════════════════════════════════

const RESERVED_NAMES = [
  // Node.js globals
  'require', 'module', 'exports', '__dirname', '__filename',
  'process', 'Buffer', 'console', 'global', 'setTimeout', 'setInterval',
  'clearTimeout', 'clearInterval', 'setImmediate', 'clearImmediate',
  
  // Critical classes
  'EventEmitter', 'Promise', 'Error', 'TypeError', 'RangeError',
  
  // Playwright/Puppeteer
  'chromium', 'firefox', 'webkit', 'Browser', 'BrowserContext', 'Page',
  'Frame', 'ElementHandle', 'JSHandle', 'Request', 'Response',
  
  // Express/HTTP
  'express', 'app', 'req', 'res', 'next', 'http', 'https',
  
  // Our critical exports (preserve API surface)
  'QAntum', 'ParadoxEngine', 'GhostProtocol', 'PhantomEngine',
  'SwarmOrchestrator', 'NeuralMapper', 'ChronosEngine'
];

// ═══════════════════════════════════════════════════════════════════════════════════════
// PARANOID CONFIGURATION - Maximum Protection
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * 🔥 PARANOID LEVEL - Maximum obfuscation for production builds
 * Use this for client distributions
 */
const PARANOID_CONFIG = {
  // ═══════════════════════════════════════════════════════════════════════════════════
  // CORE PROTECTION
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 1,      // 100% - Maximum flattening
  
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.5,        // 50% dead code injection
  
  debugProtection: true,
  debugProtectionInterval: 4000,          // Anti-debug check every 4 seconds
  
  disableConsoleOutput: true,             // No console.log in production
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // DOMAIN LOCK
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  domainLock: AUTHORIZED_DOMAINS,
  domainLockRedirectUrl: 'about:blank',
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // IDENTIFIER TRANSFORMATION
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  identifierNamesGenerator: 'hexadecimal', // '_0x4a2f3b' style names
  identifiersPrefix: 'qntm',               // Prefix all identifiers
  renameGlobals: true,
  renameProperties: true,
  renamePropertiesMode: 'safe',
  
  reservedNames: RESERVED_NAMES,
  reservedStrings: ['QAntum', 'Dimitаr', 'Prodromov'],
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // STRING PROTECTION - Encrypt all strings
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayCallsTransformThreshold: 1,
  stringArrayEncoding: ['rc4', 'base64'],  // Double encoding
  stringArrayIndexesType: ['hexadecimal-number', 'hexadecimal-numeric-string'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 5,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 5,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 1,                 // 100% - Encode ALL strings
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // CODE SPLITTING & TRANSFORMATION
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  splitStrings: true,
  splitStringsChunkLength: 3,              // Split into 3-char chunks
  
  transformObjectKeys: true,
  
  unicodeEscapeSequence: true,             // Convert to \uXXXX
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // SELF-DEFENDING CODE
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  selfDefending: true,                     // Code breaks if formatted/modified
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // SOURCE MAP - NEVER in production
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  sourceMap: false,
  sourceMapBaseUrl: '',
  sourceMapFileName: '',
  sourceMapMode: 'separate',
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // TARGET
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  target: 'node',
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // NUMBERS TRANSFORMATION
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  numbersToExpressions: true,              // 42 becomes (0x2a | 0)
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // SIMPLIFY - Keep code size manageable
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  simplify: false,                         // Don't simplify - keeps protection
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // SEED - Reproducible builds
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  seed: 0,                                 // Random seed each build
  
  // ═══════════════════════════════════════════════════════════════════════════════════
  // IGNORE REQUIRE IMPORTS - Critical for Node.js
  // ═══════════════════════════════════════════════════════════════════════════════════
  
  ignoreRequireImports: true
};

/**
 * 🔒 HIGH SECURITY - Strong protection with better performance
 */
const HIGH_SECURITY_CONFIG = {
  ...PARANOID_CONFIG,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjectionThreshold: 0.3,
  stringArrayThreshold: 0.8,
  stringArrayWrappersCount: 3
};

/**
 * ⚡ BALANCED - Good protection with reasonable performance
 */
const BALANCED_CONFIG = {
  ...PARANOID_CONFIG,
  controlFlowFlatteningThreshold: 0.5,
  deadCodeInjection: false,
  debugProtection: true,
  debugProtectionInterval: 0,
  stringArrayThreshold: 0.5,
  stringArrayEncoding: ['base64'],
  stringArrayWrappersCount: 2,
  splitStrings: false
};

/**
 * 🔧 DEVELOPMENT - Minimal obfuscation for debugging
 */
const DEVELOPMENT_CONFIG = {
  compact: true,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'mangled',
  renameGlobals: false,
  renameProperties: false,
  selfDefending: false,
  stringArray: false,
  target: 'node',
  sourceMap: true,
  sourceMapMode: 'separate'
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// CUSTOM TRANSFORMERS - Additional protection layers
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Generate unique build fingerprint
 */
function generateBuildFingerprint() {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  return crypto
    .createHash('sha256')
    .update(`QAntum-${timestamp}-${random}`)
    .digest('hex')
    .substring(0, 32);
}

/**
 * Inject build metadata
 */
function injectBuildMetadata(code, fingerprint) {
  const metadata = `
    Object.defineProperty(globalThis, '__QANTUM_BUILD__', {
      value: '${fingerprint}',
      writable: false,
      configurable: false,
      enumerable: false
    });
  `;
  return metadata + code;
}

/**
 * Add integrity check
 */
function addIntegrityCheck(code, expectedHash) {
  const check = `
    (function() {
      const crypto = require('crypto');
      const fs = require('fs');
      const expected = '${expectedHash}';
      const actual = crypto.createHash('sha256').update(__filename ? fs.readFileSync(__filename) : '').digest('hex');
      if (actual !== expected && process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    })();
  `;
  return check + code;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

module.exports = {
  // Configurations
  PARANOID: PARANOID_CONFIG,
  HIGH_SECURITY: HIGH_SECURITY_CONFIG,
  BALANCED: BALANCED_CONFIG,
  DEVELOPMENT: DEVELOPMENT_CONFIG,
  
  // Helpers
  AUTHORIZED_DOMAINS,
  RESERVED_NAMES,
  generateBuildFingerprint,
  injectBuildMetadata,
  addIntegrityCheck,
  
  // Default export (PARANOID for production)
  default: PARANOID_CONFIG,
  
  /**
   * Get config by environment
   */
  // Complexity: O(1)
  getConfig(env = process.env.NODE_ENV) {
    switch (env) {
      case 'production':
        return PARANOID_CONFIG;
      case 'staging':
        return HIGH_SECURITY_CONFIG;
      case 'development':
        return DEVELOPMENT_CONFIG;
      default:
        return BALANCED_CONFIG;
    }
  },
  
  /**
   * Create custom config
   */
  // Complexity: O(1)
  createConfig(overrides = {}) {
    return {
      ...PARANOID_CONFIG,
      ...overrides
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// CLI USAGE EXAMPLE
// ═══════════════════════════════════════════════════════════════════════════════════════

/*
Usage with javascript-obfuscator CLI:

npx javascript-obfuscator ./dist --output ./dist-protected --config ./src/security/obfuscator-config.js

Or programmatically:

const JavaScriptObfuscator = require('javascript-obfuscator');
const config = require('./src/security/obfuscator-config');

const obfuscatedCode = JavaScriptObfuscator.obfuscate(sourceCode, config.PARANOID);
*/
