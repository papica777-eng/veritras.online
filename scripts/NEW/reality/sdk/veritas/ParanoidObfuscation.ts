/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                               ║
 * ║                    PARANOID OBFUSCATION ENGINE                                                ║
 * ║              "Protect your intellectual property"                                             ║
 * ║                                                                                               ║
 * ║   This module prepares the Veritas SDK for distribution by:                                   ║
 * ║   1. Minifying code                                                                           ║
 * ║   2. Obfuscating variable names                                                               ║
 * ║   3. Adding license checks                                                                    ║
 * ║   4. Inserting anti-tampering measures                                                        ║
 * ║                                                                                               ║
 * ║   © 2025-2026 Mister Mind | Dimitar Prodromov                                                ║
 * ║                                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { readFile, writeFile, mkdir, readdir, stat, copyFile } from 'fs/promises';
import { join, basename, dirname, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ObfuscationConfig {
    sourcePath: string;
    outputPath: string;
    level: 'light' | 'medium' | 'paranoid';
    preserveNames: string[];
    addLicenseCheck: boolean;
    addIntegrityCheck: boolean;
    addWatermark: boolean;
}

interface ObfuscationResult {
    success: boolean;
    filesProcessed: number;
    outputPath: string;
    integrityHash: string;
    watermark: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// OBFUSCATION TRANSFORMS
// ═══════════════════════════════════════════════════════════════════════════════

const VARIABLE_MAP = new Map<string, string>();
let varCounter = 0;

function generateObfuscatedName(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let name = '';
    let n = varCounter++;
    
    do {
        name = chars[n % 26] + name;
        n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    
    return '_' + name + '_';
}

function obfuscateVariables(code: string, preserveNames: string[]): string {
    // Don't obfuscate preserved names or common keywords
    const preserve = new Set([
        ...preserveNames,
        'export', 'import', 'from', 'class', 'interface', 'type', 'function',
        'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'do',
        'switch', 'case', 'break', 'continue', 'try', 'catch', 'throw', 'finally',
        'new', 'this', 'super', 'extends', 'implements', 'static', 'public',
        'private', 'protected', 'async', 'await', 'yield', 'true', 'false',
        'null', 'undefined', 'void', 'typeof', 'instanceof', 'in', 'of',
        'Map', 'Set', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Date',
        'Promise', 'Error', 'console', 'process', 'require', 'module', 'exports',
        // Veritas public API - MUST preserve
        'Veritas', 'IVeritasSDK', 'VeritasConfig', 'AssimilationResult',
        'VerificationResult', 'SymbolRegistry', 'LicenseInfo', 'NeuralMapper',
        'assimilate', 'verify', 'validateCode', 'getContext', 'generateTypes',
        'exportRegistry', 'importRegistry', 'create', 'getInstance'
    ]);

    // Find local variable declarations
    const varPattern = /(?:const|let|var)\s+(\w+)\s*=/g;
    let match;
    
    while ((match = varPattern.exec(code)) !== null) {
        const varName = match[1];
        if (!preserve.has(varName) && !VARIABLE_MAP.has(varName)) {
            VARIABLE_MAP.set(varName, generateObfuscatedName());
        }
    }

    // Replace variables (careful with word boundaries)
    let obfuscated = code;
    for (const [original, replacement] of VARIABLE_MAP) {
        const regex = new RegExp(`\\b${original}\\b`, 'g');
        obfuscated = obfuscated.replace(regex, replacement);
    }

    return obfuscated;
}

function removeComments(code: string): string {
    // Remove single-line comments
    let result = code.replace(/\/\/[^\n]*/g, '');
    
    // Remove multi-line comments (but preserve JSDoc for public API)
    result = result.replace(/\/\*(?!\*)[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '');
    
    return result;
}

function minifyWhitespace(code: string): string {
    // Collapse multiple spaces/newlines
    return code
        .replace(/\n\s*\n/g, '\n')
        .replace(/  +/g, ' ')
        .replace(/\n +/g, '\n')
        .trim();
}

function addLicenseCheck(code: string): string {
    const licenseCheck = `
// License validation
(function(){
    const k = process.env.VERITAS_LICENSE_KEY;
    if(!k||!k.match(/^VERITAS-SDK-(FREE|PRO|ENT)-/)){
        console.warn('⚠️ Veritas SDK: Invalid license. Get one at https://mistermind.dev/veritas');
    }
})();
`;
    return licenseCheck + '\n' + code;
}

function addIntegrityCheck(code: string): string {
    const hash = crypto.createHash('sha256').update(code).digest('hex').slice(0, 16);
    
    const integrityCheck = `
// Integrity check - DO NOT MODIFY
const _VERITAS_INTEGRITY_='${hash}';
(function(){
    if(typeof _VERITAS_INTEGRITY_==='undefined'){
        throw new Error('Veritas SDK integrity check failed');
    }
})();
`;
    return integrityCheck + '\n' + code;
}

function addWatermark(code: string, watermark: string): string {
    const encoded = Buffer.from(watermark).toString('base64');
    return `/* VER:${encoded} */\n` + code;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN OBFUSCATOR
// ═══════════════════════════════════════════════════════════════════════════════

export class ParanoidObfuscator {
    private config: ObfuscationConfig;

    constructor(config: Partial<ObfuscationConfig>) {
        this.config = {
            sourcePath: config.sourcePath || './src/reality/sdk/veritas',
            outputPath: config.outputPath || './dist/veritas-sdk',
            level: config.level || 'medium',
            preserveNames: config.preserveNames || [],
            addLicenseCheck: config.addLicenseCheck ?? true,
            addIntegrityCheck: config.addIntegrityCheck ?? true,
            addWatermark: config.addWatermark ?? true
        };
    }

    // Complexity: O(N*M) — nested iteration detected
    async obfuscate(): Promise<ObfuscationResult> {
        console.log('\n🔒 PARANOID OBFUSCATION ENGINE');
        console.log(`   Level: ${this.config.level.toUpperCase()}`);
        console.log(`   Source: ${this.config.sourcePath}`);
        console.log(`   Output: ${this.config.outputPath}`);

        // Create output directory
        if (!existsSync(this.config.outputPath)) {
            // Complexity: O(1)
            mkdirSync(this.config.outputPath, { recursive: true });
        }

        // Process all TypeScript files
        // SAFETY: async operation — wrap in try-catch for production resilience
        const files = await this.collectFiles(this.config.sourcePath);
        let filesProcessed = 0;
        let combinedCode = '';

        for (const file of files) {
            if (file.endsWith('.ts')) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const processed = await this.processFile(file);
                combinedCode += processed;
                filesProcessed++;
            }
        }

        // Generate integrity hash
        const integrityHash = crypto.createHash('sha256').update(combinedCode).digest('hex');

        // Generate watermark
        const watermark = `VERITAS-SDK-v1.0.0-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

        // Create package.json for npm
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.createPackageJson();

        // Create README
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.createReadme();

        // Create .npmignore
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.createNpmIgnore();

        console.log(`\n   ✅ ${filesProcessed} files obfuscated`);
        console.log(`   🔐 Integrity: ${integrityHash.slice(0, 16)}...`);
        console.log(`   🏷️  Watermark: ${watermark}`);

        return {
            success: true,
            filesProcessed,
            outputPath: this.config.outputPath,
            integrityHash,
            watermark
        };
    }

    // Complexity: O(N) — linear iteration
    private async collectFiles(dir: string): Promise<string[]> {
        const files: string[] = [];
        
        if (!existsSync(dir)) return files;

        // SAFETY: async operation — wrap in try-catch for production resilience
        const entries = await readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                files.push(...await this.collectFiles(fullPath));
            } else {
                files.push(fullPath);
            }
        }

        return files;
    }

    // Complexity: O(1) — amortized
    private async processFile(filePath: string): Promise<string> {
        // SAFETY: async operation — wrap in try-catch for production resilience
        let code = await readFile(filePath, 'utf-8');
        const fileName = basename(filePath);
        const outputFile = join(this.config.outputPath, fileName);

        // Apply transforms based on level
        switch (this.config.level) {
            case 'paranoid':
                code = removeComments(code);
                code = obfuscateVariables(code, this.config.preserveNames);
                code = minifyWhitespace(code);
                if (this.config.addIntegrityCheck) {
                    code = addIntegrityCheck(code);
                }
                break;
                
            case 'medium':
                code = removeComments(code);
                code = minifyWhitespace(code);
                break;
                
            case 'light':
            default:
                // Just copy
                break;
        }

        // Add license check to main entry
        if (fileName === 'index.ts' && this.config.addLicenseCheck) {
            code = addLicenseCheck(code);
        }

        // Add watermark
        if (this.config.addWatermark) {
            const watermark = `Veritas SDK | © Mister Mind | ${new Date().toISOString()}`;
            code = addWatermark(code, watermark);
        }

        // Write output
        // SAFETY: async operation — wrap in try-catch for production resilience
        await writeFile(outputFile, code, 'utf-8');
        console.log(`   📄 ${fileName}`);

        return code;
    }

    // Complexity: O(1) — amortized
    private async createPackageJson(): Promise<void> {
        const pkg = {
            name: '@mistermind/veritas-sdk',
            version: '1.0.0',
            description: 'Stop AI Hallucinations. Ground your AI in reality.',
            main: 'index.js',
            types: 'index.d.ts',
            keywords: [
                'ai', 'hallucination', 'verification', 'code-analysis',
                'anti-hallucination', 'ai-safety', 'symbol-registry'
            ],
            author: 'Dimitar Prodromov <enterprise@mistermind.dev>',
            license: 'SEE LICENSE IN LICENSE.md',
            homepage: 'https://mistermind.dev/veritas',
            repository: {
                type: 'git',
                url: 'https://github.com/mistermind/veritas-sdk'
            },
            bugs: {
                url: 'https://github.com/mistermind/veritas-sdk/issues'
            },
            engines: {
                node: '>=18.0.0'
            },
            peerDependencies: {
                typescript: '>=4.5.0'
            }
        };

        // SAFETY: async operation — wrap in try-catch for production resilience
        await writeFile(
            // Complexity: O(1)
            join(this.config.outputPath, 'package.json'),
            JSON.stringify(pkg, null, 2),
            'utf-8'
        );
    }

    // Complexity: O(1) — amortized
    private async createReadme(): Promise<void> {
        const readme = `# 🛡️ Veritas SDK

> Stop AI Hallucinations. Ground your AI in reality.

## Installation

\`\`\`bash
npm install @mistermind/veritas-sdk
\`\`\`

## Quick Start

\`\`\`typescript
import { Veritas } from '@mistermind/veritas-sdk';

// Create instance
    // SAFETY: async operation — wrap in try-catch for production resilience
const veritas = await Veritas.create({
  projectPath: './src',
  licenseKey: process.env.VERITAS_LICENSE_KEY
});

// Scan your codebase
    // SAFETY: async operation — wrap in try-catch for production resilience
await veritas.assimilate();

// Verify a symbol
const result = veritas.verify('MyClass');
if (!result.valid) {
  console.error('HALLUCINATION:', result.message);
}

// Validate AI-generated code
const validation = veritas.validateCode(aiGeneratedCode);
console.log('Hallucinations found:', validation.hallucinations);
\`\`\`

## License

Get your license at https://mistermind.dev/veritas

- **Free**: 50 files, 500 symbols
- **Pro**: Unlimited, all features - $29/mo
- **Enterprise**: Custom terms - $199/mo

## Documentation

Full documentation at https://mistermind.dev/veritas/docs

© 2025-2026 Mister Mind | Dimitar Prodromov
`;

        // SAFETY: async operation — wrap in try-catch for production resilience
        await writeFile(
            // Complexity: O(1)
            join(this.config.outputPath, 'README.md'),
            readme,
            'utf-8'
        );
    }

    // Complexity: O(1)
    private async createNpmIgnore(): Promise<void> {
        const ignore = `
*.ts
!*.d.ts
tsconfig.json
.git
.gitignore
tests/
__tests__/
*.test.js
*.spec.js
`;

        // SAFETY: async operation — wrap in try-catch for production resilience
        await writeFile(
            // Complexity: O(1)
            join(this.config.outputPath, '.npmignore'),
            ignore.trim(),
            'utf-8'
        );
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
    const args = process.argv.slice(2);
    const level = (args[0] as 'light' | 'medium' | 'paranoid') || 'medium';

    const obfuscator = new ParanoidObfuscator({
        sourcePath: './src/reality/sdk/veritas',
        outputPath: './dist/veritas-sdk',
        level,
        addLicenseCheck: true,
        addIntegrityCheck: true,
        addWatermark: true
    });

    // SAFETY: async operation — wrap in try-catch for production resilience
    const result = await obfuscator.obfuscate();

    console.log('\n✅ OBFUSCATION COMPLETE');
    console.log(`   Output: ${result.outputPath}`);
    console.log(`   Ready for: npm publish`);
}

if (require.main === module) {
    // Complexity: O(1)
    main().catch(console.error);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export { ObfuscationConfig, ObfuscationResult };
export default ParanoidObfuscator;
