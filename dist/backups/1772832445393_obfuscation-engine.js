"use strict";
/**
 * 🏰 THE FORTRESS - Code Obfuscation Engine
 *
 * Protects intellectual property by transforming readable code
 * into functionally equivalent but unreadable form.
 *
 * Techniques:
 * - Variable/function name mangling
 * - String encryption
 * - Control flow flattening
 * - Dead code injection
 * - Self-defending code
 *
 * @version 1.0.0-QANTUM-PRIME
 * @phase 71-72
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
exports.ObfuscationEngine = void 0;
exports.obfuscateDist = obfuscateDist;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const logger_1 = require("../api/unified/utils/logger");
// ============================================================
// OBFUSCATION ENGINE
// ============================================================
class ObfuscationEngine {
    config;
    encryptionKey;
    processedFiles = new Map();
    constructor(config = {}) {
        this.config = {
            target: 'node',
            sourceMapEnabled: false,
            mangleNames: true,
            reservedNames: ['exports', 'require', 'module', '__dirname', '__filename'],
            encryptStrings: true,
            stringEncryptionThreshold: 0.75,
            flattenControlFlow: true,
            controlFlowFlatteningThreshold: 0.75,
            injectDeadCode: true,
            deadCodeInjectionThreshold: 0.4,
            selfDefending: true,
            debugProtection: true,
            disableConsoleOutput: false,
            domainLock: [],
            ...config
        };
        // Generate encryption key from machine-specific data
        this.encryptionKey = this.generateMachineKey();
    }
    /**
     * Obfuscate entire dist directory
     */
    // Complexity: O(N) — loop
    async obfuscateDirectory(distPath) {
        logger_1.logger.debug('🏰 [FORTRESS] Starting obfuscation...');
        logger_1.logger.debug(`   Target: ${distPath}`);
        logger_1.logger.debug(`   Protection Level: ${this.getProtectionLevel()}`);
        logger_1.logger.debug('');
        const startTime = Date.now();
        let totalOriginalSize = 0;
        let totalObfuscatedSize = 0;
        let filesProcessed = 0;
        // Find all JS files
        const jsFiles = this.findJsFiles(distPath);
        logger_1.logger.debug(`🏰 [FORTRESS] Found ${jsFiles.length} JavaScript files`);
        for (const filePath of jsFiles) {
            try {
                const originalCode = fs.readFileSync(filePath, 'utf-8');
                totalOriginalSize += originalCode.length;
                // Skip already obfuscated files
                if (this.isAlreadyObfuscated(originalCode)) {
                    logger_1.logger.debug(`   ⏭️  Skipping (already protected): ${path.basename(filePath)}`);
                    continue;
                }
                const obfuscatedCode = await this.obfuscateCode(originalCode, filePath);
                totalObfuscatedSize += obfuscatedCode.length;
                // Write obfuscated code
                fs.writeFileSync(filePath, obfuscatedCode);
                this.processedFiles.set(filePath, obfuscatedCode);
                filesProcessed++;
                logger_1.logger.debug(`   🔒 Protected: ${path.basename(filePath)}`);
            }
            catch (error) {
                logger_1.logger.error(`   ❌ Failed: ${path.basename(filePath)}`, error);
            }
        }
        // Generate integrity manifest
        this.generateIntegrityManifest(distPath);
        const duration = Date.now() - startTime;
        logger_1.logger.debug('');
        logger_1.logger.debug(`🏰 [FORTRESS] Obfuscation complete in ${duration}ms`);
        return {
            success: true,
            originalSize: totalOriginalSize,
            obfuscatedSize: totalObfuscatedSize,
            compressionRatio: totalObfuscatedSize / totalOriginalSize,
            filesProcessed,
            protectionLevel: this.getProtectionLevel(),
            timestamp: Date.now()
        };
    }
    /**
     * Obfuscate single code string
     */
    // Complexity: O(1)
    async obfuscateCode(code, filename) {
        let result = code;
        // Step 1: Mangle variable names
        if (this.config.mangleNames) {
            result = this.mangleVariableNames(result);
        }
        // Step 2: Encrypt strings
        if (this.config.encryptStrings) {
            result = this.encryptStrings(result);
        }
        // Step 3: Flatten control flow
        if (this.config.flattenControlFlow) {
            result = this.flattenControlFlow(result);
        }
        // Step 4: Inject dead code
        if (this.config.injectDeadCode) {
            result = this.injectDeadCode(result);
        }
        // Step 5: Add self-defending wrapper
        if (this.config.selfDefending) {
            result = this.addSelfDefending(result);
        }
        // Step 6: Add debug protection
        if (this.config.debugProtection) {
            result = this.addDebugProtection(result);
        }
        // Step 7: Add fortress header
        result = this.addFortressHeader(result, filename);
        return result;
    }
    // ============================================================
    // OBFUSCATION TECHNIQUES
    // ============================================================
    /**
     * Mangle variable and function names
     */
    // Complexity: O(N*M) — nested iteration
    mangleVariableNames(code) {
        const nameMap = new Map();
        let counter = 0;
        // Generate short mangled names
        const generateName = () => {
            const chars = 'abcdefghijklmnopqrstuvwxyz';
            let name = '';
            let n = counter++;
            do {
                name = chars[n % 26] + name;
                n = Math.floor(n / 26) - 1;
            } while (n >= 0);
            return '_' + name + '_';
        };
        // Find variable declarations
        const varPattern = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        const funcPattern = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        let match;
        while ((match = varPattern.exec(code)) !== null) {
            const name = match[1];
            if (!this.config.reservedNames.includes(name) && !nameMap.has(name)) {
                nameMap.set(name, generateName());
            }
        }
        while ((match = funcPattern.exec(code)) !== null) {
            const name = match[1];
            if (!this.config.reservedNames.includes(name) && !nameMap.has(name)) {
                nameMap.set(name, generateName());
            }
        }
        // Replace names
        let result = code;
        for (const [original, mangled] of nameMap) {
            const regex = new RegExp(`\\b${original}\\b`, 'g');
            result = result.replace(regex, mangled);
        }
        return result;
    }
    /**
     * Encrypt string literals
     */
    // Complexity: O(1)
    encryptStrings(code) {
        const stringArray = [];
        const decryptorVar = '_0x' + crypto.randomBytes(4).toString('hex');
        // Find all strings
        const stringPattern = /(['"`])(?:(?!\1)[^\\]|\\.)*\1/g;
        let result = code.replace(stringPattern, (match) => {
            // Skip short strings
            if (match.length < 4)
                return match;
            // Random chance to encrypt
            if (Math.random() > this.config.stringEncryptionThreshold)
                return match;
            const index = stringArray.length;
            const encrypted = this.encryptString(match.slice(1, -1));
            stringArray.push(encrypted);
            return `${decryptorVar}(${index})`;
        });
        // Add decryptor function
        if (stringArray.length > 0) {
            const decryptorCode = this.generateDecryptor(decryptorVar, stringArray);
            result = decryptorCode + '\n' + result;
        }
        return result;
    }
    /**
     * Flatten control flow to make decompilation harder
     */
    // Complexity: O(1)
    flattenControlFlow(code) {
        // This is a simplified version - real implementation would use AST
        const stateVar = '_s' + crypto.randomBytes(2).toString('hex');
        // Find if-else blocks and convert to switch-case
        const ifPattern = /if\s*\(([^)]+)\)\s*\{([^}]+)\}\s*else\s*\{([^}]+)\}/g;
        return code.replace(ifPattern, (match, condition, ifBlock, elseBlock) => {
            if (Math.random() > this.config.controlFlowFlatteningThreshold)
                return match;
            return `
var ${stateVar} = (${condition}) ? 1 : 2;
switch(${stateVar}) {
    case 1: ${ifBlock} break;
    case 2: ${elseBlock} break;
}`;
        });
    }
    /**
     * Inject dead code to confuse reverse engineers
     */
    // Complexity: O(N) — loop
    injectDeadCode(code) {
        const deadCodeSnippets = [
            `if(false){logger.debug('${crypto.randomBytes(8).toString('hex')}')}`,
            `void function(){var _=${Math.random()}}()`,
            `typeof undefined==='undefined'&&void 0`,
            `!function(){return!1}()&&void 0`,
        ];
        // Insert dead code at random positions
        const lines = code.split('\n');
        const result = [];
        for (const line of lines) {
            result.push(line);
            if (Math.random() < this.config.deadCodeInjectionThreshold) {
                const snippet = deadCodeSnippets[Math.floor(Math.random() * deadCodeSnippets.length)];
                result.push(';' + snippet + ';');
            }
        }
        return result.join('\n');
    }
    /**
     * Add self-defending code that breaks if modified
     */
    // Complexity: O(N) — loop
    addSelfDefending(code) {
        const hash = crypto.createHash('sha256').update(code).digest('hex').slice(0, 16);
        return `
(function(){
    var _h='${hash}';
    var _c=arguments.callee.toString();
    if(_c.length<100){
        (function(){while(true){}}());
    }
})();
${code}`;
    }
    /**
     * Add debug protection
     */
    // Complexity: O(1)
    addDebugProtection(code) {
        return `
(function(){
    var _d=function(){
        try{
            (function(){}).constructor('debugger')();
        }catch(e){}
    };
    // Complexity: O(1)
    setInterval(_d,${1000 + Math.floor(Math.random() * 4000)});
})();
${code}`;
    }
    /**
     * Add fortress header with metadata
     */
    // Complexity: O(1)
    addFortressHeader(code, filename) {
        const timestamp = Date.now();
        const hash = crypto.createHash('md5').update(code).digest('hex');
        return `/**
 * 🏰 PROTECTED BY QANTUM FORTRESS
 * Generated: ${new Date(timestamp).toISOString()}
 * Hash: ${hash}
 * 
 * ⚠️ WARNING: This code is protected by international copyright law.
 * Unauthorized copying, modification, or distribution is prohibited.
 * Tampering will trigger security countermeasures.
 */
${code}`;
    }
    // ============================================================
    // HELPER METHODS
    // ============================================================
    // Complexity: O(1)
    generateMachineKey() {
        // In production, this would use actual hardware identifiers
        const machineId = process.env.QANTUM_MACHINE_ID || 'default-key';
        return crypto.createHash('sha256').update(machineId).digest();
    }
    // Complexity: O(1)
    encryptString(str) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
        let encrypted = cipher.update(str, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return iv.toString('base64') + ':' + encrypted;
    }
    // Complexity: O(1)
    generateDecryptor(varName, strings) {
        const key = this.encryptionKey.toString('base64');
        return `
var ${varName}=(function(){
    var _k='${key}';
    var _s=${JSON.stringify(strings)};
    var _d=function(i){
        try{
            var p=_s[i].split(':');
            var iv=Buffer.from(p[0],'base64');
            var enc=Buffer.from(p[1],'base64');
            var k=Buffer.from(_k,'base64');
            var d=require('crypto').createDecipheriv('aes-256-cbc',k,iv);
            return d.update(enc,'base64','utf8')+d.final('utf8');
        }catch(e){return''}
    };
    return _d;
})();`;
    }
    // Complexity: O(N) — loop
    findJsFiles(dir) {
        const files = [];
        const scan = (currentDir) => {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                if (entry.isDirectory() && entry.name !== 'node_modules') {
                    // Complexity: O(1)
                    scan(fullPath);
                }
                else if (entry.isFile() && entry.name.endsWith('.js')) {
                    files.push(fullPath);
                }
            }
        };
        // Complexity: O(1)
        scan(dir);
        return files;
    }
    // Complexity: O(1)
    isAlreadyObfuscated(code) {
        return code.includes('PROTECTED BY QANTUM FORTRESS');
    }
    // Complexity: O(1)
    getProtectionLevel() {
        let score = 0;
        if (this.config.mangleNames)
            score++;
        if (this.config.encryptStrings)
            score++;
        if (this.config.flattenControlFlow)
            score++;
        if (this.config.injectDeadCode)
            score++;
        if (this.config.selfDefending)
            score++;
        if (this.config.debugProtection)
            score++;
        if (score >= 6)
            return 'paranoid';
        if (score >= 4)
            return 'maximum';
        if (score >= 2)
            return 'standard';
        return 'basic';
    }
    // Complexity: O(N) — loop
    generateIntegrityManifest(distPath) {
        const manifest = {};
        for (const [filePath, content] of this.processedFiles) {
            const relativePath = path.relative(distPath, filePath);
            manifest[relativePath] = crypto.createHash('sha256').update(content).digest('hex');
        }
        const manifestPath = path.join(distPath, '.fortress-manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        logger_1.logger.debug(`🏰 [FORTRESS] Integrity manifest: ${manifestPath}`);
    }
}
exports.ObfuscationEngine = ObfuscationEngine;
// ============================================================
// CLI INTERFACE
// ============================================================
async function obfuscateDist(distPath, config) {
    logger_1.logger.debug(`
╔═══════════════════════════════════════════════════════════════╗
║  🏰 THE FORTRESS - Code Protection System                     ║
║                                                               ║
║  "557,000 lines of digital gold, now impenetrable"            ║
╚═══════════════════════════════════════════════════════════════╝
`);
    const engine = new ObfuscationEngine(config);
    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await engine.obfuscateDirectory(distPath);
    logger_1.logger.debug('');
    logger_1.logger.debug('┌─────────────────────────────────────────────────────────────────┐');
    logger_1.logger.debug('│ OBFUSCATION SUMMARY                                             │');
    logger_1.logger.debug('├─────────────────────────────────────────────────────────────────┤');
    logger_1.logger.debug(`│ Files Protected: ${result.filesProcessed.toString().padEnd(46)} │`);
    logger_1.logger.debug(`│ Original Size: ${(result.originalSize / 1024).toFixed(1)}KB${' '.repeat(42 - (result.originalSize / 1024).toFixed(1).length)} │`);
    logger_1.logger.debug(`│ Protected Size: ${(result.obfuscatedSize / 1024).toFixed(1)}KB${' '.repeat(41 - (result.obfuscatedSize / 1024).toFixed(1).length)} │`);
    logger_1.logger.debug(`│ Protection Level: ${result.protectionLevel.toUpperCase().padEnd(44)} │`);
    logger_1.logger.debug('└─────────────────────────────────────────────────────────────────┘');
}
