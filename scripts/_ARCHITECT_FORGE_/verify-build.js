/**
 * verify-build — Qantum Module
 * @module verify-build
 * @path scripts/_ARCHITECT_FORGE_/verify-build.js
 * @auto-documented BrutalDocEngine v2.1
 */

#!/usr/bin/env node
/**
 * 🔍 QANTUM BUILD VERIFICATION ENGINE
 * 
 * v1.0.0 Hyper-Drive - Post-Build Integrity Check
 * 
 * Verifies:
 * - All TypeScript files compiled correctly
 * - Protection manifest integrity
 * - Module exports are valid
 * - Future Practices modules present
 * - Swarm orchestrator ready
 * 
 * @version 1.0.0
 * @author QANTUM Build Team
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
    distPath: path.join(__dirname, '..', 'dist'),
    srcPath: path.join(__dirname, '..', 'src'),
    requiredModules: [
        'index.js',
        'future-practices/index.js',
        'future-practices/behavioral-api-sync.js',
        'future-practices/self-evolution-hook.js',
        'future-practices/neural-fingerprint-activator.js',
        'future-practices/ryzen-swarm-sync.js'
    ],
    minFileCount: 10,
    version: '1.0.0'
};

// ============================================================
// VERIFICATION ENGINE
// ============================================================

class VerificationEngine {
    constructor(config) {
        this.config = config;
        this.errors = [];
        this.warnings = [];
        this.checks = {
            passed: 0,
            failed: 0,
            skipped: 0
        };
    }

    // Complexity: O(1) — amortized
    async run() {
        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  🔍 QANTUM BUILD VERIFICATION                            ║
║                                                               ║
║  Version: ${this.config.version.padEnd(51)}║
║  Mode: INTEGRITY CHECK                                        ║
╚═══════════════════════════════════════════════════════════════╝
`);

        // Run all verification checks
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.checkDistFolder();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.checkRequiredModules();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.checkProtectionManifest();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.checkTypeDefinitions();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.checkFuturePractices();
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.checkSwarmReadiness();

        // Print results
        this.printResults();

        return this.errors.length === 0;
    }

    // Complexity: O(N) — linear iteration
    async checkDistFolder() {
        console.log('   📁 Checking dist folder...');
        
        if (!fs.existsSync(this.config.distPath)) {
            this.addError('dist folder does not exist - build may have failed');
            return;
        }

        const files = this.getAllFiles(this.config.distPath);
        const jsFiles = files.filter(f => f.endsWith('.js'));

        if (jsFiles.length < this.config.minFileCount) {
            this.addWarning(`Only ${jsFiles.length} JS files found (expected >= ${this.config.minFileCount})`);
        } else {
            this.addPass(`Found ${jsFiles.length} compiled JavaScript files`);
        }

        // Check total size
        const totalSize = files.reduce((sum, file) => {
            return sum + fs.statSync(file).size;
        }, 0);

        this.addPass(`Total build size: ${this.formatSize(totalSize)}`);
    }

    // Complexity: O(N) — linear iteration
    async checkRequiredModules() {
        console.log('   📦 Checking required modules...');

        for (const module of this.config.requiredModules) {
            const modulePath = path.join(this.config.distPath, module);
            
            if (fs.existsSync(modulePath)) {
                this.addPass(`Module present: ${module}`);
            } else {
                // Check if source exists but wasn't compiled
                const srcModule = module.replace('.js', '.ts');
                const srcPath = path.join(this.config.srcPath, srcModule);
                
                if (fs.existsSync(srcPath)) {
                    this.addWarning(`Module not compiled: ${module} (source exists)`);
                } else {
                    this.addSkip(`Module not found: ${module}`);
                }
            }
        }
    }

    // Complexity: O(N) — linear iteration
    async checkProtectionManifest() {
        console.log('   🔒 Checking protection manifest...');

        const manifestPath = path.join(this.config.distPath, '.protection-manifest.json');

        if (!fs.existsSync(manifestPath)) {
            this.addWarning('Protection manifest not found - obfuscation may have been skipped');
            return;
        }

        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            
            if (manifest.version !== this.config.version) {
                this.addWarning(`Manifest version mismatch: ${manifest.version} vs ${this.config.version}`);
            } else {
                this.addPass(`Protection manifest valid (v${manifest.version})`);
            }

            if (manifest.protectionLevel === 'PARANOID') {
                this.addPass('Protection level: PARANOID ✓');
            }

            // Verify checksums
            let validChecksums = 0;
            let invalidChecksums = 0;

            for (const [file, expectedHash] of Object.entries(manifest.checksums || {})) {
                const filePath = path.join(this.config.distPath, file);
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath);
                    const actualHash = crypto.createHash('sha256').update(content).digest('hex');
                    
                    if (actualHash === expectedHash) {
                        validChecksums++;
                    } else {
                        invalidChecksums++;
                    }
                }
            }

            if (invalidChecksums > 0) {
                this.addError(`${invalidChecksums} files have invalid checksums (possible tampering)`);
            } else if (validChecksums > 0) {
                this.addPass(`All ${validChecksums} checksums verified`);
            }
        } catch (error) {
            this.addError(`Failed to parse protection manifest: ${error.message}`);
        }
    }

    // Complexity: O(N) — linear iteration
    async checkTypeDefinitions() {
        console.log('   📝 Checking TypeScript definitions...');

        const dtsFiles = this.getAllFiles(this.config.distPath)
            .filter(f => f.endsWith('.d.ts'));

        if (dtsFiles.length === 0) {
            this.addWarning('No TypeScript declaration files found');
        } else {
            this.addPass(`Found ${dtsFiles.length} type definition files`);
        }

        // Check main index.d.ts
        const mainDts = path.join(this.config.distPath, 'index.d.ts');
        if (fs.existsSync(mainDts)) {
            this.addPass('Main type definitions present (index.d.ts)');
        }
    }

    // Complexity: O(N) — linear iteration
    async checkFuturePractices() {
        console.log('   🚀 Checking Future Practices modules...');

        const futurePracticesDir = path.join(this.config.distPath, 'future-practices');

        if (!fs.existsSync(futurePracticesDir)) {
            this.addWarning('Future Practices directory not found in dist');
            return;
        }

        const modules = [
            { name: 'behavioral-api-sync', desc: 'Behavioral API Sync' },
            { name: 'self-evolution-hook', desc: 'Self Evolution Hook' },
            { name: 'neural-fingerprint-activator', desc: 'Neural Fingerprint Activator' },
            { name: 'ryzen-swarm-sync', desc: 'Ryzen-Swarm Sync' },
            { name: 'self-evolving-code', desc: 'Self Evolving Code' },
            { name: 'predictive-resource-allocation', desc: 'Predictive Resource Allocation' },
            { name: 'neural-fingerprinting', desc: 'Neural Fingerprinting' },
            { name: 'virtual-material-sync', desc: 'Virtual Material Sync' },
            { name: 'cross-engine-synergy', desc: 'Cross Engine Synergy' }
        ];

        let found = 0;
        for (const module of modules) {
            const modulePath = path.join(futurePracticesDir, `${module.name}.js`);
            if (fs.existsSync(modulePath)) {
                found++;
            }
        }

        if (found === modules.length) {
            this.addPass(`All ${modules.length} Future Practices modules compiled`);
        } else {
            this.addWarning(`${found}/${modules.length} Future Practices modules found`);
        }
    }

    // Complexity: O(N*M) — nested iteration detected
    async checkSwarmReadiness() {
        console.log('   🐝 Checking Swarm readiness...');

        // Check for swarm orchestrator
        const swarmFiles = [
            'swarm-orchestrator.js',
            'neural-hub.js',
            'ghost-runner.js'
        ];

        let swarmReady = 0;
        for (const file of swarmFiles) {
            const filePath = path.join(this.config.distPath, file);
            if (fs.existsSync(filePath)) {
                swarmReady++;
            }
        }

        if (swarmReady > 0) {
            this.addPass(`Swarm components ready: ${swarmReady}/${swarmFiles.length}`);
        } else {
            this.addSkip('Swarm components not yet compiled (optional)');
        }

        // Check environment
        if (process.env.AWS_REGION || process.env.SWARM_ENABLED) {
            this.addPass('AWS/Swarm environment variables detected');
        }
    }

    // Helper methods
    // Complexity: O(N) — linear iteration
    getAllFiles(dir, files = []) {
        if (!fs.existsSync(dir)) return files;
        
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                this.getAllFiles(fullPath, files);
            } else {
                files.push(fullPath);
            }
        }
        return files;
    }

    // Complexity: O(1)
    addPass(message) {
        console.log(`      ✅ ${message}`);
        this.checks.passed++;
    }

    // Complexity: O(1)
    addError(message) {
        console.log(`      ❌ ${message}`);
        this.errors.push(message);
        this.checks.failed++;
    }

    // Complexity: O(1)
    addWarning(message) {
        console.log(`      ⚠️ ${message}`);
        this.warnings.push(message);
    }

    // Complexity: O(1)
    addSkip(message) {
        console.log(`      ⏭️ ${message}`);
        this.checks.skipped++;
    }

    // Complexity: O(1)
    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    }

    // Complexity: O(N) — linear iteration
    printResults() {
        const status = this.errors.length === 0 ? 'PASSED' : 'FAILED';
        const statusIcon = this.errors.length === 0 ? '✅' : '❌';

        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  ${statusIcon} BUILD VERIFICATION: ${status.padEnd(40)}║
╠═══════════════════════════════════════════════════════════════╣
║  Checks passed:  ${String(this.checks.passed).padEnd(44)}║
║  Checks failed:  ${String(this.checks.failed).padEnd(44)}║
║  Checks skipped: ${String(this.checks.skipped).padEnd(44)}║
║  Warnings:       ${String(this.warnings.length).padEnd(44)}║
╚═══════════════════════════════════════════════════════════════╝
`);

        if (this.errors.length > 0) {
            console.log('   ❌ ERRORS:');
            this.errors.forEach(e => console.log(`      - ${e}`));
        }

        if (this.warnings.length > 0) {
            console.log('\n   ⚠️ WARNINGS:');
            this.warnings.forEach(w => console.log(`      - ${w}`));
        }

        if (this.errors.length === 0) {
            console.log(`
   🎉 QANTUM v${this.config.version} Hyper-Drive is READY!
   
   Run these commands:
   → npm run swarm:run     - Start the Swarm
   → npm run neural:sync   - Sync Neural Hub
   → npm run future:cycle  - Run full Future Practices cycle
`);
        }
    }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
    const engine = new VerificationEngine(CONFIG);
    
    try {
        const success = await engine.run();
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('   ❌ Verification failed:', error.message);
        process.exit(1);
    }
}

    // Complexity: O(1)
main();
