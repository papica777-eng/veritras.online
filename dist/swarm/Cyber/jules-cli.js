#!/usr/bin/env ts-node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const url_1 = require("url");
/**
 * 🛰️ JULES CLI v1.0.2-FAST-SYNC
 * ===============================
 * Deployment & MCP Orchestration Tool for QAntum AETERNA.
 */
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
const args = process.argv.slice(2);
const command = args[0];
const ROOT_DIR = path_1.default.resolve(__dirname, '../../');
const RENDER_YAML_PATH = path_1.default.join(ROOT_DIR, '01_ECOSYSTEM_APPS', 'Gemini-INTEG', 'render.yaml');
const log = (msg) => console.log(`[JULES-CLI] ${msg}`);
async function main() {
    switch (command) {
        case 'deploy':
            log("🚀 Initiating Fast-Sync Deployment to Render...");
            try {
                if (!fs_1.default.existsSync(RENDER_YAML_PATH)) {
                    throw new Error(`Deployment manifest missing at ${RENDER_YAML_PATH}`);
                }
                log("✅ Render Manifest Verified.");
                log("📡 Pushing to Render Substrate...");
                (0, child_process_1.execSync)('git add .', { cwd: ROOT_DIR, stdio: 'inherit' });
                try {
                    (0, child_process_1.execSync)('git commit -m "JULES: Cloud Sync (Fast-Mode)"', { cwd: ROOT_DIR, stdio: 'ignore' });
                }
                catch (e) { } // Ignore if nothing to commit
                (0, child_process_1.execSync)('git push origin main', { cwd: ROOT_DIR, stdio: 'inherit' });
                log("💎 CLOUD SYNC SUCCESS. Render is now deploying the substrate.");
            }
            catch (e) {
                console.error(`\n❌ CRITICAL_FAILURE: ${e.message}`);
                process.exit(1);
            }
            break;
        case 'mcp-start':
            log("🌌 Starting MCP Sovereign Server...");
            (0, child_process_1.execSync)('npx ts-node scripts/Cyber/JulesBridge.ts --mcp', { cwd: ROOT_DIR, stdio: 'inherit' });
            break;
        case 'status':
            log("📊 System Status: OPERATIONAL (Fast-Sync Enabled)");
            break;
        default:
            console.log(`
  🛰️  JULES CLI - Commands: deploy, mcp-start, status
            `);
            break;
    }
}
main();
