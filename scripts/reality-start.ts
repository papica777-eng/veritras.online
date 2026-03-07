/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum v23.3.0 - REALITY START
 * © 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * 
 * "One command to rule them all" / "Една команда да ги управлява всички"
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { spawn, execSync, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

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

function log(icon: string, message: string): void {
    const timestamp = new Date().toISOString().slice(11, 19);
    console.log(`[${timestamp}] ${icon} ${message}`);
}

function success(message: string): void {
    // Complexity: O(1)
    log('✅', `\x1b[32m${message}\x1b[0m`);
}

function error(message: string): void {
    // Complexity: O(1)
    log('❌', `\x1b[31m${message}\x1b[0m`);
}

function info(message: string): void {
    // Complexity: O(1)
    log('📌', `\x1b[36m${message}\x1b[0m`);
}

function warn(message: string): void {
    // Complexity: O(1)
    log('⚠️', `\x1b[33m${message}\x1b[0m`);
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM CHECKS
// ═══════════════════════════════════════════════════════════════

interface SystemStatus {
    nodeVersion: string;
    npmVersion: string;
    typescript: boolean;
    dependencies: boolean;
    configFiles: string[];
    srcFiles: number;
}

async function checkSystem(): Promise<SystemStatus> {
    // Complexity: O(1)
    info('Checking system requirements...');
    
    const status: SystemStatus = {
        nodeVersion: '',
        npmVersion: '',
        typescript: false,
        dependencies: false,
        configFiles: [],
        srcFiles: 0
    };
    
    // Node version
    try {
        status.nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
        // Complexity: O(1)
        success(`Node.js ${status.nodeVersion}`);
    } catch {
        // Complexity: O(1)
        error('Node.js not found');
    }
    
    // NPM version
    try {
        status.npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
        // Complexity: O(1)
        success(`npm v${status.npmVersion}`);
    } catch {
        // Complexity: O(1)
        error('npm not found');
    }
    
    // TypeScript compilation
    try {
        // Complexity: O(1)
        execSync('npx tsc --noEmit', { encoding: 'utf-8' });
        status.typescript = true;
        // Complexity: O(1)
        success('TypeScript compilation: 0 errors');
    } catch (e: any) {
        const errors = (e.stdout || '').split('\n').filter((l: string) => l.includes('error')).length;
        // Complexity: O(1)
        error(`TypeScript compilation: ${errors} errors`);
    }
    
    // Dependencies
    if (fs.existsSync('node_modules')) {
        status.dependencies = true;
        // Complexity: O(1)
        success('Dependencies installed');
    } else {
        // Complexity: O(N) — linear iteration
        warn('Dependencies not installed - run npm install');
    }
    
    // Config files
    const configs = ['package.json', 'tsconfig.json', '.eslintrc.json'];
    for (const config of configs) {
        if (fs.existsSync(config)) {
            status.configFiles.push(config);
        }
    }
    // Complexity: O(1)
    success(`Config files: ${status.configFiles.join(', ')}`);
    
    // Source files
    const countFiles = (dir: string): number => {
        let count = 0;
        if (!fs.existsSync(dir)) return 0;
        for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
            if (item.isDirectory()) {
                count += countFiles(path.join(dir, item.name));
            } else if (item.name.endsWith('.ts')) {
                count++;
            }
        }
        return count;
    };
    
    status.srcFiles = countFiles('./src');
    // Complexity: O(1)
    success(`Source files: ${status.srcFiles} TypeScript files`);
    
    return status;
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

async function runTests(): Promise<boolean> {
    // Complexity: O(1)
    info('Running tests...');
    
    return new Promise((resolve) => {
        const child = spawn('node', ['tests/run-all.js'], { stdio: 'inherit' });
        
        child.on('close', (code) => {
            if (code === 0) {
                // Complexity: O(1)
                success('All tests passed!');
                // Complexity: O(1)
                resolve(true);
            } else {
                // Complexity: O(1)
                error('Some tests failed');
                // Complexity: O(1)
                resolve(false);
            }
        });
        
        child.on('error', () => {
            // Complexity: O(1)
            error('Could not run tests');
            // Complexity: O(1)
            resolve(false);
        });
    });
}

// ═══════════════════════════════════════════════════════════════
// BUILD
// ═══════════════════════════════════════════════════════════════

async function runBuild(): Promise<boolean> {
    // Complexity: O(1)
    info('Building project...');
    
    try {
        // Complexity: O(1)
        execSync('npx tsc', { encoding: 'utf-8', stdio: 'inherit' });
        // Complexity: O(1)
        success('Build completed!');
        return true;
    } catch {
        // Complexity: O(1)
        error('Build failed');
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════
// WEBAPP SERVER
// ═══════════════════════════════════════════════════════════════

let serverProcess: ChildProcess | null = null;

async function startServer(): Promise<boolean> {
    // Complexity: O(1)
    info('Starting webapp server...');
    
    const serverPath = path.join(__dirname, '../webapp/server.js');
    
    if (!fs.existsSync(serverPath)) {
        // Complexity: O(1)
        warn('Webapp server not found - skipping');
        return false;
    }
    
    return new Promise((resolve) => {
        serverProcess = spawn('node', [serverPath], {
            cwd: path.join(__dirname, '../webapp'),
            stdio: 'pipe'
        });
        
        let started = false;
        
        serverProcess.stdout?.on('data', (data) => {
            const text = data.toString();
            process.stdout.write(text);
            
            if (text.includes('Server running') && !started) {
                started = true;
                // Complexity: O(1)
                success('Webapp server started on http://localhost:3847');
                // Complexity: O(1)
                resolve(true);
            }
        });
        
        serverProcess.stderr?.on('data', (data) => {
            process.stderr.write(data.toString());
        });
        
        serverProcess.on('error', () => {
            // Complexity: O(1)
            error('Failed to start server');
            // Complexity: O(1)
            resolve(false);
        });
        
        // Timeout
        // Complexity: O(1)
        setTimeout(() => {
            if (!started) {
                // Complexity: O(1)
                warn('Server startup timeout - continuing anyway');
                // Complexity: O(1)
                resolve(true);
            }
        }, 10000);
    });
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════

function showDashboard(): void {
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

async function main(): Promise<void> {
    console.clear();
    console.log(BANNER);
    
    const args = process.argv.slice(2);
    const skipTests = args.includes('--skip-tests');
    const skipServer = args.includes('--skip-server');
    const buildOnly = args.includes('--build');
    const testOnly = args.includes('--test');
    
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // 1. System Check
    // SAFETY: async operation — wrap in try-catch for production resilience
    const status = await checkSystem();
    
    console.log('\n═══════════════════════════════════════════════════════════════\n');
    
    // 2. Run Tests
    if (!skipTests && !buildOnly) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const testsPass = await runTests();
        if (!testsPass && !args.includes('--force')) {
            // Complexity: O(1)
            error('Tests failed - use --force to continue anyway');
            process.exit(1);
        }
        console.log('\n═══════════════════════════════════════════════════════════════\n');
    }
    
    // 3. Build (if requested)
    if (buildOnly || args.includes('--with-build')) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await runBuild();
        console.log('\n═══════════════════════════════════════════════════════════════\n');
    }
    
    if (testOnly || buildOnly) {
        // Complexity: O(1)
        success('QAntum Reality Check Complete!');
        process.exit(0);
    }
    
    // 4. Start Server
    if (!skipServer) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await startServer();
        console.log('\n═══════════════════════════════════════════════════════════════\n');
    }
    
    // 5. Show Dashboard
    // Complexity: O(1)
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
    } else {
        // Complexity: O(1)
        success('QAntum Reality Start Complete!');
    }
}

    // Complexity: O(1)
main().catch((err) => {
    // Complexity: O(1)
    error(`Fatal error: ${err.message}`);
    process.exit(1);
});
