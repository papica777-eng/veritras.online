#!/usr/bin/env ts-node
"use strict";
/**
 * @fileoverview QAntum v23.3.0 Production Build Script
 *
 * Uses esbuild for blazing-fast TypeScript compilation with:
 * - Tree shaking for minimal bundle size
 * - Source maps for production debugging
 * - Minification for smaller payloads
 * - Banner injection for copyright
 * - Multiple output formats (CJS, ESM)
 *
 * @author Димитър Продромов (Dimitar Prodromov) <dimitar@QAntum.bg>
 * @copyright 2025 QAntum. All Rights Reserved.
 * @version 23.3.0
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
const esbuild = __importStar(require("esbuild"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ═══════════════════════════════════════════════════════════════════════════════
// 📊 Build Configuration
// ═══════════════════════════════════════════════════════════════════════════════
const VERSION = '23.3.0';
const VERSION_CODENAME = 'Type-Safe Sovereign';
const BUILD_DATE = new Date().toISOString();
const COPYRIGHT_BANNER = `/**
 * QAntum v${VERSION} "${VERSION_CODENAME}"
 * AI-Powered QA Framework with Autonomous Test Execution
 * 
 * @copyright 2025 QAntum. All Rights Reserved.
 * @license PROPRIETARY - See LICENSE file
 * @see https://qantum.dev
 * 
 * Built: ${BUILD_DATE}
 */
`;
// External packages that should NOT be bundled
const EXTERNAL_PACKAGES = [
    'playwright',
    'playwright-core',
    'ws',
    'axios',
    'crypto',
    'fs',
    'path',
    'os',
    'child_process',
    'worker_threads',
    'perf_hooks',
    'util',
    'events',
    'stream',
    'http',
    'https',
    'net',
    'tls',
    'zlib',
    'url',
    'querystring',
    'buffer',
];
// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 Console Styling
// ═══════════════════════════════════════════════════════════════════════════════
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};
function log(emoji, message, color = colors.reset) {
    console.log(`${color}${emoji} ${message}${colors.reset}`);
}
function logSuccess(message) {
    log('✅', message, colors.green);
}
function logInfo(message) {
    log('ℹ️', message, colors.cyan);
}
function logWarn(message) {
    log('⚠️', message, colors.yellow);
}
function logError(message) {
    log('❌', message, colors.red);
}
function formatBytes(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
function formatDuration(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}
// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 Build Functions
// ═══════════════════════════════════════════════════════════════════════════════
async function cleanDist() {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
        logInfo('Cleaning dist/ directory...');
        fs.rmSync(distPath, { recursive: true });
    }
    fs.mkdirSync(distPath, { recursive: true });
}
async function buildCJS() {
    logInfo('Building CommonJS bundle...');
    return esbuild.build({
        entryPoints: ['src/index.ts'],
        bundle: true,
        minify: true,
        sourcemap: true,
        sourceRoot: '../src',
        target: ['node18'],
        platform: 'node',
        format: 'cjs',
        outfile: 'dist/index.js',
        external: EXTERNAL_PACKAGES,
        banner: {
            js: COPYRIGHT_BANNER,
        },
        define: {
            'process.env.MISTER_MIND_VERSION': `"${VERSION}"`,
            'process.env.MISTER_MIND_CODENAME': `"${VERSION_CODENAME}"`,
        },
        treeShaking: true,
        metafile: true,
        legalComments: 'none',
        drop: ['debugger'],
    });
}
async function buildESM() {
    logInfo('Building ES Module bundle...');
    return esbuild.build({
        entryPoints: ['src/index.ts'],
        bundle: true,
        minify: true,
        sourcemap: true,
        sourceRoot: '../src',
        target: ['node18', 'es2022'],
        platform: 'node',
        format: 'esm',
        outfile: 'dist/index.esm.js',
        external: EXTERNAL_PACKAGES,
        banner: {
            js: COPYRIGHT_BANNER,
        },
        define: {
            'process.env.MISTER_MIND_VERSION': `"${VERSION}"`,
            'process.env.MISTER_MIND_CODENAME': `"${VERSION_CODENAME}"`,
        },
        treeShaking: true,
        metafile: true,
        legalComments: 'none',
        drop: ['debugger'],
    });
}
async function buildTypes() {
    logInfo('Generating TypeScript declarations...');
    // Use tsc for declaration files only
    const { execSync } = await Promise.resolve().then(() => __importStar(require('child_process')));
    try {
        execSync('npx tsc --emitDeclarationOnly --declaration --declarationDir dist', {
            stdio: 'pipe',
            cwd: process.cwd(),
        });
    }
    catch (error) {
        logWarn('TypeScript declaration generation had warnings (this is normal for complex types)');
    }
}
function analyzeBuild(result, label) {
    if (!result.metafile)
        return;
    const { outputs } = result.metafile;
    for (const [file, info] of Object.entries(outputs)) {
        const size = formatBytes(info.bytes);
        logSuccess(`${label}: ${path.basename(file)} (${size})`);
    }
}
function generateBuildInfo() {
    const buildInfo = {
        version: VERSION,
        codename: VERSION_CODENAME,
        buildDate: BUILD_DATE,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
    };
    const buildInfoPath = path.join(process.cwd(), 'dist', 'build-info.json');
    fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
    logInfo(`Build info saved to ${buildInfoPath}`);
}
// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 Main Build Process
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
    console.log('');
    console.log(`${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}  🧠 QAntum v${VERSION} "${VERSION_CODENAME}" - Production Build${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════════════════════${colors.reset}`);
    console.log('');
    const startTime = Date.now();
    try {
        // Step 1: Clean
        await cleanDist();
        // Step 2: Build bundles in parallel
        logInfo('Starting parallel builds...');
        const [cjsResult, esmResult] = await Promise.all([
            buildCJS(),
            buildESM(),
        ]);
        // Step 3: Generate TypeScript declarations
        await buildTypes();
        // Step 4: Analyze outputs
        console.log('');
        logInfo('Build artifacts:');
        analyzeBuild(cjsResult, 'CJS');
        analyzeBuild(esmResult, 'ESM');
        // Step 5: Generate build info
        generateBuildInfo();
        // Done!
        const duration = Date.now() - startTime;
        console.log('');
        console.log(`${colors.green}${colors.bright}═══════════════════════════════════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.green}${colors.bright}  ✅ Build completed in ${formatDuration(duration)}${colors.reset}`);
        console.log(`${colors.green}${colors.bright}═══════════════════════════════════════════════════════════════════════${colors.reset}`);
        console.log('');
        // Print summary
        const distFiles = fs.readdirSync(path.join(process.cwd(), 'dist'));
        console.log(`${colors.dim}Output files:${colors.reset}`);
        distFiles.forEach(file => {
            const stats = fs.statSync(path.join(process.cwd(), 'dist', file));
            if (stats.isFile()) {
                console.log(`  ${colors.dim}→${colors.reset} dist/${file} (${formatBytes(stats.size)})`);
            }
        });
        console.log('');
    }
    catch (error) {
        logError(`Build failed: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 Entry Point
// ═══════════════════════════════════════════════════════════════════════════════
main().catch((error) => {
    logError(`Unexpected error: ${error}`);
    process.exit(1);
});
