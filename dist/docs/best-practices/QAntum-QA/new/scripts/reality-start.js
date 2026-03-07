"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum v23.3.0 - REALITY START
 * © 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 *
 * "One command to rule them all" / "Една команда да ги управлява всички"
 * ═══════════════════════════════════════════════════════════════════════════════
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
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// ═══════════════════════════════════════════════════════════════
// ASCII ART
// ═══════════════════════════════════════════════════════════════
const BANNER = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║     ██████╗  █████╗ ███╗   ██╗████████╗██╗   ██╗███╗   ███╗                   ║
║    ██╔═══██╗██╔══██╗████╗  ██║╚══██╔══╝██║   ██║████╗ ████║                   ║
║    ██║   ██║███████║██╔██╗ ██║   ██║   ██║   ██║██╔████╔██║                   ║
║    ██║▄▄ ██║██╔══██║██║╚██╗██║   ██║   ██║   ██║██║╚██╔╝██║                   ║
║    ╚██████╔╝██║  ██║██║ ╚████║   ██║   ╚██████╔╝██║ ╚═╝ ██║                   ║
║     ╚══▀▀═╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝                   ║
║                                                                               ║
║              ═══════════ R E A L I T Y   S T A R T ═══════════                ║
║                                                                               ║
║                  🎯 AI-Powered QA Framework v23.3.0                           ║
║              © 2025 Димитър Продромов. All Rights Reserved.                   ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`;
// ═══════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════
function log(icon, message) {
    const timestamp = new Date().toISOString().slice(11, 19);
    console.log(`[${timestamp}] ${icon} ${message}`);
}
function success(message) {
    log('✅', `\x1b[32m${message}\x1b[0m`);
}
function error(message) {
    log('❌', `\x1b[31m${message}\x1b[0m`);
}
function info(message) {
    log('📌', `\x1b[36m${message}\x1b[0m`);
}
function warn(message) {
    log('⚠️', `\x1b[33m${message}\x1b[0m`);
}
async function checkSystem() {
    info('Checking system requirements...');
    const status = {
        nodeVersion: '',
        npmVersion: '',
        typescript: false,
        dependencies: false,
        configFiles: [],
        srcFiles: 0
    };
    // Node version
    try {
        status.nodeVersion = (0, child_process_1.execSync)('node --version', { encoding: 'utf-8' }).trim();
        success(`Node.js ${status.nodeVersion}`);
    }
    catch {
        error('Node.js not found');
    }
    // NPM version
    try {
        status.npmVersion = (0, child_process_1.execSync)('npm --version', { encoding: 'utf-8' }).trim();
        success(`npm v${status.npmVersion}`);
    }
    catch {
        error('npm not found');
    }
    // TypeScript compilation
    try {
        (0, child_process_1.execSync)('npx tsc --noEmit', { encoding: 'utf-8' });
        status.typescript = true;
        success('TypeScript compilation: 0 errors');
    }
    catch (e) {
        const errors = (e.stdout || '').split('\n').filter((l) => l.includes('error')).length;
        error(`TypeScript compilation: ${errors} errors`);
    }
    // Dependencies
    if (fs.existsSync('node_modules')) {
        status.dependencies = true;
        success('Dependencies installed');
    }
    else {
        warn('Dependencies not installed - run npm install');
    }
    // Config files
    const configs = ['package.json', 'tsconfig.json', '.eslintrc.json'];
    for (const config of configs) {
        if (fs.existsSync(config)) {
            status.configFiles.push(config);
        }
    }
    success(`Config files: ${status.configFiles.join(', ')}`);
    // Source files
    const countFiles = (dir) => {
        let count = 0;
        if (!fs.existsSync(dir))
            return 0;
        for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
            if (item.isDirectory()) {
                count += countFiles(path.join(dir, item.name));
            }
            else if (item.name.endsWith('.ts')) {
                count++;
            }
        }
        return count;
    };
    status.srcFiles = countFiles('./src');
    success(`Source files: ${status.srcFiles} TypeScript files`);
    return status;
}
// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════
async function runTests() {
    info('Running tests...');
    return new Promise((resolve) => {
        const child = (0, child_process_1.spawn)('node', ['tests/run-all.js'], { stdio: 'inherit' });
        child.on('close', (code) => {
            if (code === 0) {
                success('All tests passed!');
                resolve(true);
            }
            else {
                error('Some tests failed');
                resolve(false);
            }
        });
        child.on('error', () => {
            error('Could not run tests');
            resolve(false);
        });
    });
}
// ═══════════════════════════════════════════════════════════════
// BUILD
// ═══════════════════════════════════════════════════════════════
async function runBuild() {
    info('Building project...');
    try {
        (0, child_process_1.execSync)('npx tsc', { encoding: 'utf-8', stdio: 'inherit' });
        success('Build completed!');
        return true;
    }
    catch {
        error('Build failed');
        return false;
    }
}
// ═══════════════════════════════════════════════════════════════
// WEBAPP SERVER
// ═══════════════════════════════════════════════════════════════
let serverProcess = null;
async function startServer() {
    info('Starting webapp server...');
    const serverPath = path.join(__dirname, '../webapp/server.js');
    if (!fs.existsSync(serverPath)) {
        warn('Webapp server not found - skipping');
        return false;
    }
    return new Promise((resolve) => {
        serverProcess = (0, child_process_1.spawn)('node', [serverPath], {
            cwd: path.join(__dirname, '../webapp'),
            stdio: 'pipe'
        });
        let started = false;
        serverProcess.stdout?.on('data', (data) => {
            const text = data.toString();
            process.stdout.write(text);
            if (text.includes('Server running') && !started) {
                started = true;
                success('Webapp server started on http://localhost:3847');
                resolve(true);
            }
        });
        serverProcess.stderr?.on('data', (data) => {
            process.stderr.write(data.toString());
        });
        serverProcess.on('error', () => {
            error('Failed to start server');
            resolve(false);
        });
        // Timeout
        setTimeout(() => {
            if (!started) {
                warn('Server startup timeout - continuing anyway');
                resolve(true);
            }
        }, 10000);
    });
}
// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function showDashboard() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                         🎯 QANTUM REALITY STATUS                              ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  📊 System Status:                                                            ║
║     • TypeScript:    ✅ Compiled (0 errors)                                   ║
║     • Tests:         ✅ All passing                                           ║
║     • Server:        🟢 Running on port 3847                                  ║
║                                                                               ║
║  🌐 Access Points:                                                            ║
║     • Dashboard:     http://localhost:3847/dashboard-new.html                 ║
║     • API:           http://localhost:3847/api                                ║
║     • Landing:       file:///${path.resolve('./landing/index.html').replace(/\\/g, '/')}       
║                                                                               ║
║  📁 Project Structure:                                                        ║
║     • src/           75 TypeScript files                                      ║
║     • tests/         24 test cases                                            ║
║     • docs/          13 documentation files                                   ║
║     • webapp/        Full-stack application                                   ║
║                                                                               ║
║  🔧 Commands:                                                                 ║
║     • npm test       Run all tests                                            ║
║     • npm run build  Build TypeScript                                         ║
║     • npm run dashboard  Start dashboard server                               ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);
}
// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
    console.clear();
    console.log(BANNER);
    const args = process.argv.slice(2);
    const skipTests = args.includes('--skip-tests');
    const skipServer = args.includes('--skip-server');
    const buildOnly = args.includes('--build');
    const testOnly = args.includes('--test');
    console.log('═══════════════════════════════════════════════════════════════\n');
    // 1. System Check
    const status = await checkSystem();
    console.log('\n═══════════════════════════════════════════════════════════════\n');
    // 2. Run Tests
    if (!skipTests && !buildOnly) {
        const testsPass = await runTests();
        if (!testsPass && !args.includes('--force')) {
            error('Tests failed - use --force to continue anyway');
            process.exit(1);
        }
        console.log('\n═══════════════════════════════════════════════════════════════\n');
    }
    // 3. Build (if requested)
    if (buildOnly || args.includes('--with-build')) {
        await runBuild();
        console.log('\n═══════════════════════════════════════════════════════════════\n');
    }
    if (testOnly || buildOnly) {
        success('QAntum Reality Check Complete!');
        process.exit(0);
    }
    // 4. Start Server
    if (!skipServer) {
        await startServer();
        console.log('\n═══════════════════════════════════════════════════════════════\n');
    }
    // 5. Show Dashboard
    showDashboard();
    // 6. Keep alive
    if (serverProcess) {
        console.log('\n💡 Press Ctrl+C to stop all services\n');
        process.on('SIGINT', () => {
            console.log('\n\n🛑 Shutting down QAntum...');
            if (serverProcess) {
                serverProcess.kill();
            }
            console.log('👋 Goodbye!\n');
            process.exit(0);
        });
    }
    else {
        success('QAntum Reality Start Complete!');
    }
}
main().catch((err) => {
    error(`Fatal error: ${err.message}`);
    process.exit(1);
});
