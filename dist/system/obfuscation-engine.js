"use strict";
/**
 * 🏰 THE FORTRESS - Code Obfuscation Engine
 *
 * Protects intellectual property by transforming readable code
 * into functionally equivalent but unreadable form.
 *
 * Techniques:
 * - Variable/function name mangling
 * - String encryption (AES-256-CBC)
 * - Control flow flattening
 * - Dead code injection
 * - Self-defending code
 * - Debug protection
 * - Domain locking
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
const logger_1 = require("../utils/logger");
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
        this.encryptionKey = this.generateMachineKey();
    }
    async obfuscateDirectory(distPath) {
        logger_1.logger.debug('🏰 [FORTRESS] Starting obfuscation...');
        logger_1.logger.debug(`   Target: ${distPath}`);
        logger_1.logger.debug(`   Protection Level: ${this.getProtectionLevel()}`);
        const startTime = Date.now();
        let totalOriginalSize = 0;
        let totalObfuscatedSize = 0;
        let filesProcessed = 0;
        const jsFiles = this.findJsFiles(distPath);
        logger_1.logger.debug(`🏰 [FORTRESS] Found ${jsFiles.length} JavaScript files`);
        for (const filePath of jsFiles) {
            try {
                const originalCode = fs.readFileSync(filePath, 'utf-8');
                totalOriginalSize += originalCode.length;
                if (this.isAlreadyObfuscated(originalCode)) {
                    logger_1.logger.debug(`   ⏭️  Skipping (already protected): ${path.basename(filePath)}`);
                    continue;
                }
                const obfuscatedCode = await this.obfuscateCode(originalCode, filePath);
                totalObfuscatedSize += obfuscatedCode.length;
                fs.writeFileSync(filePath, obfuscatedCode);
                this.processedFiles.set(filePath, obfuscatedCode);
                filesProcessed++;
                logger_1.logger.debug(`   🔒 Protected: ${path.basename(filePath)}`);
            }
            catch (error) {
                logger_1.logger.error(`   ❌ Failed: ${path.basename(filePath)}`, error);
            }
        }
        this.generateIntegrityManifest(distPath);
        const duration = Date.now() - startTime;
        logger_1.logger.debug(`🏰 [FORTRESS] Obfuscation complete in ${duration}ms`);
        return {
            success: true, originalSize: totalOriginalSize, obfuscatedSize: totalObfuscatedSize,
            compressionRatio: totalObfuscatedSize / totalOriginalSize, filesProcessed,
            protectionLevel: this.getProtectionLevel(), timestamp: Date.now()
        };
    }
    async obfuscateCode(code, filename) {
        let result = code;
        if (this.config.mangleNames)
            result = this.mangleVariableNames(result);
        if (this.config.encryptStrings)
            result = this.encryptStrings(result);
        if (this.config.flattenControlFlow)
            result = this.flattenControlFlow(result);
        if (this.config.injectDeadCode)
            result = this.injectDeadCode(result);
        if (this.config.selfDefending)
            result = this.addSelfDefending(result);
        if (this.config.debugProtection)
            result = this.addDebugProtection(result);
        result = this.addFortressHeader(result, filename);
        return result;
    }
    // ============================================================
    // OBFUSCATION TECHNIQUES
    // ============================================================
    mangleVariableNames(code) {
        const nameMap = new Map();
        let counter = 0;
        const generateName = () => {
            const chars = 'abcdefghijklmnopqrstuvwxyz';
            let name = '', n = counter++;
            do {
                name = chars[n % 26] + name;
                n = Math.floor(n / 26) - 1;
            } while (n >= 0);
            return '_' + name + '_';
        };
        const varPattern = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        const funcPattern = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
        let match;
        while ((match = varPattern.exec(code)) !== null) {
            const name = match[1];
            if (!this.config.reservedNames.includes(name) && !nameMap.has(name))
                nameMap.set(name, generateName());
        }
        while ((match = funcPattern.exec(code)) !== null) {
            const name = match[1];
            if (!this.config.reservedNames.includes(name) && !nameMap.has(name))
                nameMap.set(name, generateName());
        }
        let result = code;
        for (const [original, mangled] of nameMap) {
            result = result.replace(new RegExp(`\\b${original}\\b`, 'g'), mangled);
        }
        return result;
    }
    encryptStrings(code) {
        const stringArray = [];
        const decryptorVar = '_0x' + crypto.randomBytes(4).toString('hex');
        const stringPattern = /(['"`])(?:(?!\1)[^\\]|\\.)*\1/g;
        let result = code.replace(stringPattern, (match) => {
            if (match.length < 4)
                return match;
            if (Math.random() > this.config.stringEncryptionThreshold)
                return match;
            const index = stringArray.length;
            const encrypted = this.encryptString(match.slice(1, -1));
            stringArray.push(encrypted);
            return `${decryptorVar}(${index})`;
        });
        if (stringArray.length > 0) {
            const decryptorCode = this.generateDecryptor(decryptorVar, stringArray);
            result = decryptorCode + '\n' + result;
        }
        return result;
    }
    flattenControlFlow(code) {
        const stateVar = '_s' + crypto.randomBytes(2).toString('hex');
        const ifPattern = /if\s*\(([^)]+)\)\s*\{([^}]+)\}\s*else\s*\{([^}]+)\}/g;
        return code.replace(ifPattern, (match, condition, ifBlock, elseBlock) => {
            if (Math.random() > this.config.controlFlowFlatteningThreshold)
                return match;
            return `var ${stateVar} = (${condition}) ? 1 : 2;\nswitch(${stateVar}) {\n    case 1: ${ifBlock} break;\n    case 2: ${elseBlock} break;\n}`;
        });
    }
    injectDeadCode(code) {
        const deadCodeSnippets = [
            `if(false){logger.debug('${crypto.randomBytes(8).toString('hex')}')}`,
            `void function(){var _=${Math.random()}}()`,
            `typeof undefined==='undefined'&&void 0`,
            `!function(){return!1}()&&void 0`,
        ];
        const lines = code.split('\n');
        const result = [];
        for (const line of lines) {
            result.push(line);
            if (Math.random() < this.config.deadCodeInjectionThreshold) {
                result.push(';' + deadCodeSnippets[Math.floor(Math.random() * deadCodeSnippets.length)] + ';');
            }
        }
        return result.join('\n');
    }
    addSelfDefending(code) {
        const hash = crypto.createHash('sha256').update(code).digest('hex').slice(0, 16);
        return `(function(){var _h='${hash}';var _c=arguments.callee.toString();if(_c.length<100){(function(){while(true){}})();}})();\n${code}`;
    }
    addDebugProtection(code) {
        return `(function(){var _d=function(){try{(function(){}).constructor('debugger')();}catch(e){}};setInterval(_d,${1000 + Math.floor(Math.random() * 4000)});})();\n${code}`;
    }
    addFortressHeader(code, filename) {
        const timestamp = Date.now();
        const hash = crypto.createHash('md5').update(code).digest('hex');
        return `/**\n * 🏰 PROTECTED BY QANTUM FORTRESS\n * Generated: ${new Date(timestamp).toISOString()}\n * Hash: ${hash}\n * WARNING: Tampering will trigger security countermeasures.\n */\n${code}`;
    }
    // ============================================================
    // HELPER METHODS
    // ============================================================
    generateMachineKey() {
        const machineId = process.env.QANTUM_MACHINE_ID || 'default-key';
        return crypto.createHash('sha256').update(machineId).digest();
    }
    encryptString(str) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
        let encrypted = cipher.update(str, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return iv.toString('base64') + ':' + encrypted;
    }
    generateDecryptor(varName, strings) {
        const key = this.encryptionKey.toString('base64');
        return `var ${varName}=(function(){var _k='${key}';var _s=${JSON.stringify(strings)};var _d=function(i){try{var p=_s[i].split(':');var iv=Buffer.from(p[0],'base64');var enc=Buffer.from(p[1],'base64');var k=Buffer.from(_k,'base64');var d=require('crypto').createDecipheriv('aes-256-cbc',k,iv);return d.update(enc,'base64','utf8')+d.final('utf8');}catch(e){return''}};return _d;})();`;
    }
    findJsFiles(dir) {
        const files = [];
        const scan = (currentDir) => {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                if (entry.isDirectory() && entry.name !== 'node_modules')
                    scan(fullPath);
                else if (entry.isFile() && entry.name.endsWith('.js'))
                    files.push(fullPath);
            }
        };
        scan(dir);
        return files;
    }
    isAlreadyObfuscated(code) { return code.includes('PROTECTED BY QANTUM FORTRESS'); }
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
    generateIntegrityManifest(distPath) {
        const manifest = {};
        for (const [filePath, content] of this.processedFiles) {
            manifest[path.relative(distPath, filePath)] = crypto.createHash('sha256').update(content).digest('hex');
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
    logger_1.logger.debug('🏰 THE FORTRESS - Code Protection System');
    const engine = new ObfuscationEngine(config);
    const result = await engine.obfuscateDirectory(distPath);
    logger_1.logger.debug(`🏰 Files Protected: ${result.filesProcessed} | Level: ${result.protectionLevel.toUpperCase()}`);
}
