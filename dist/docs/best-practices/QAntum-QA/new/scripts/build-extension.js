#!/usr/bin/env npx tsx
"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BUILD EXTENSION - Compile QAntum OMEGA as .vsix
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This script compiles the extension for LOCAL USE ONLY.
 * The .vsix file is hardware-locked and will not work on any other machine.
 *
 * Usage:
 *   npx tsx scripts/build-extension.ts
 *
 * Output:
 *   dist/qantum-omega-30.5.0.vsix
 *
 * @author Димитър Продромов / Mister Mind
 * @copyright 2026 QAntum Empire. ЛИЧЕН. НЕ ЗА РАЗПРОСТРАНЕНИЕ.
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
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const SovereignLock_1 = require("../src/ide/SovereignLock");
const IDE_DIR = path.join(process.cwd(), 'src', 'ide');
const DIST_DIR = path.join(process.cwd(), 'dist');
async function buildExtension() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🔨 BUILDING QANTUM OMEGA EXTENSION 🔨                       ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);
    // Step 0: Verify creator
    console.log('🔐 [STEP 0] Verifying Creator...');
    const lock = SovereignLock_1.SovereignLock.getInstance();
    const verified = await lock.verify();
    if (!verified) {
        console.error('❌ Build aborted: Unauthorized machine');
        process.exit(1);
    }
    console.log('   ✓ Creator verified\n');
    // Step 1: Ensure dist directory exists
    console.log('📁 [STEP 1] Creating dist directory...');
    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR, { recursive: true });
    }
    console.log('   ✓ dist/ ready\n');
    // Step 2: Compile TypeScript
    console.log('📝 [STEP 2] Compiling TypeScript...');
    try {
        (0, child_process_1.execSync)('npx tsc -p src/ide/tsconfig.extension.json', {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        console.log('   ✓ TypeScript compiled\n');
    }
    catch (error) {
        console.warn('   ⚠️ TypeScript compilation had warnings (continuing...)\n');
    }
    // Step 3: Bundle with esbuild
    console.log('📦 [STEP 3] Bundling with esbuild...');
    try {
        (0, child_process_1.execSync)('npx esbuild src/ide/extension.ts ' +
            '--bundle ' +
            '--outfile=dist/extension.js ' +
            '--external:vscode ' +
            '--external:node-schedule ' +
            '--external:@pinecone-database/pinecone ' +
            '--format=cjs ' +
            '--platform=node ' +
            '--minify ' +
            '--sourcemap', { stdio: 'inherit', cwd: process.cwd() });
        console.log('   ✓ Bundle created (dist/extension.js)\n');
    }
    catch (error) {
        console.error('❌ Bundle failed:', error);
        process.exit(1);
    }
    // Step 4: Copy assets
    console.log('🎨 [STEP 4] Copying assets...');
    const assetsDir = path.join(DIST_DIR, 'assets');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }
    // Copy icon
    const iconSrc = path.join(IDE_DIR, 'assets', 'omega-icon.svg');
    const iconDest = path.join(assetsDir, 'omega-icon.svg');
    if (fs.existsSync(iconSrc)) {
        fs.copyFileSync(iconSrc, iconDest);
    }
    console.log('   ✓ Assets copied\n');
    // Step 5: Create package.json for vsix
    console.log('📋 [STEP 5] Creating package.json...');
    const packageJson = {
        name: "qantum-omega-sovereign",
        displayName: "QAntum OMEGA - Sovereign Agent",
        description: "🔐 LOCKED TO CREATOR - AI Agent Expert with Neural Overlay",
        version: "30.5.0",
        publisher: "DimitarProdromov",
        private: true, // Prevent accidental publishing
        engines: { vscode: "^1.85.0" },
        categories: ["Machine Learning", "Other"],
        activationEvents: ["onStartupFinished"],
        main: "./extension.js",
        contributes: {
            viewsContainers: {
                activitybar: [{
                        id: "qantum-omega",
                        title: "QAntum OMEGA",
                        icon: "assets/omega-icon.svg"
                    }]
            },
            views: {
                "qantum-omega": [{
                        type: "webview",
                        id: "qantum-omega-sidebar",
                        name: "AIAgentExpert"
                    }]
            },
            commands: [
                { command: "qantum.askExpert", title: "Ask AIAgentExpert", category: "QAntum" },
                { command: "qantum.omegaHeal", title: "Omega Heal", category: "QAntum" },
                { command: "qantum.ghostAudit", title: "Ghost Audit", category: "QAntum" },
                { command: "qantum.failoverSwap", title: "Failover Swap", category: "QAntum" },
                { command: "qantum.synthesize", title: "Synthesize", category: "QAntum" },
                { command: "qantum.showMenu", title: "Show Menu", category: "QAntum" }
            ],
            keybindings: [
                { command: "qantum.askExpert", key: "ctrl+shift+q", mac: "cmd+shift+q" },
                { command: "qantum.omegaHeal", key: "ctrl+shift+h", mac: "cmd+shift+h" },
                { command: "qantum.failoverSwap", key: "ctrl+shift+s", mac: "cmd+shift+s" }
            ]
        }
    };
    fs.writeFileSync(path.join(DIST_DIR, 'package.json'), JSON.stringify(packageJson, null, 2));
    console.log('   ✓ package.json created\n');
    // Step 6: Package as .vsix
    console.log('📦 [STEP 6] Packaging as .vsix...');
    try {
        // Check if vsce is installed
        try {
            (0, child_process_1.execSync)('npx vsce --version', { stdio: 'pipe' });
        }
        catch {
            console.log('   Installing @vscode/vsce...');
            (0, child_process_1.execSync)('npm install -D @vscode/vsce', { stdio: 'inherit' });
        }
        // Create vsix
        (0, child_process_1.execSync)('npx vsce package --no-dependencies', {
            stdio: 'inherit',
            cwd: DIST_DIR
        });
        // Move to dist root
        const vsixFiles = fs.readdirSync(DIST_DIR).filter(f => f.endsWith('.vsix'));
        if (vsixFiles.length > 0) {
            const vsixName = vsixFiles[0];
            console.log(`   ✓ Created: dist/${vsixName}\n`);
        }
    }
    catch (error) {
        console.warn('   ⚠️ vsce packaging failed, but extension.js is ready');
        console.log('   You can manually install using the extension development host\n');
    }
    // Done
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    ✅ BUILD COMPLETE ✅                                        ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  Output:                                                                      ║
║    dist/extension.js     - Bundled extension                                  ║
║    dist/package.json     - Extension manifest                                 ║
║    dist/*.vsix           - Installable package (if vsce succeeded)            ║
║                                                                               ║
║  Installation:                                                                ║
║    1. Open VS Code                                                            ║
║    2. Ctrl+Shift+P -> "Extensions: Install from VSIX..."                      ║
║    3. Select the .vsix file from dist/                                        ║
║                                                                               ║
║  Or for development:                                                          ║
║    1. Open this folder in VS Code                                             ║
║    2. Press F5 to launch Extension Development Host                           ║
║                                                                               ║
║  🔐 This extension is LOCKED to your machine.                                 ║
║     It will NOT work if copied elsewhere.                                     ║
║                                                                               ║
║  "В QAntum не лъжем."                                                         ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);
}
buildExtension().catch(console.error);
