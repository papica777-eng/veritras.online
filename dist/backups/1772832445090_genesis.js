"use strict";
/**
 * Genesis CLI Commands - КОМАНДНА ЛИНИЯ ЗА ОНТОЛОГИЧНАТА КОВАЧНИЦА
 *
 * qantum genesis create   - Create a new reality
 * qantum genesis manifest - Manifest reality as Docker environment
 * qantum genesis observe  - Execute tests within a reality
 * qantum genesis list     - List active realities
 * qantum genesis collapse - Destroy a reality
 * qantum genesis status   - Get reality status
 *
 * @author Димитър Продромов
 * @copyright 2026 QAntum. All Rights Reserved.
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genesisCreate = genesisCreate;
exports.genesisManifest = genesisManifest;
exports.genesisObserve = genesisObserve;
exports.genesisList = genesisList;
exports.genesisCollapse = genesisCollapse;
exports.genesisStatus = genesisStatus;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const config_js_1 = require("../lib/config.js");
const api_js_1 = require("../lib/api.js");
// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS CREATE
// ═══════════════════════════════════════════════════════════════════════════════
async function genesisCreate(options) {
    const config = (0, config_js_1.getConfig)();
    // Complexity: O(N) — linear scan
    (0, config_js_1.requireAuth)(config);
    const spinner = (0, ora_1.default)('Creating reality specification...').start();
    try {
        // Parse axioms from comma-separated string
        const axiomTypes = options.axioms
            ? options.axioms.split(',').map(a => a.trim().toUpperCase())
            : ['IDENTITY', 'CONSERVATION'];
        const payload = {
            name: options.name,
            dimensions: parseInt(options.dimensions, 10) || 4,
            entropy: parseFloat(options.entropy) || 0.1,
            causality: options.causality?.toUpperCase() || 'DETERMINISTIC',
            axiomTypes,
        };
        const result = await api_js_1.api.post('/api/v1/genesis/createAxiom', payload, config);
        spinner.succeed(chalk_1.default.green('Reality specification created!'));
        if (options.json) {
            console.log(JSON.stringify(result, null, 2));
        }
        else {
            console.log();
            console.log(chalk_1.default.magenta('  ⚛️  Genesis Reality Created'));
            console.log();
            console.log(`  ${chalk_1.default.dim('ID:')}        ${chalk_1.default.cyan(result.id)}`);
            console.log(`  ${chalk_1.default.dim('Name:')}      ${result.name}`);
            console.log(`  ${chalk_1.default.dim('Axioms:')}    ${result.axioms}`);
            console.log(`  ${chalk_1.default.dim('Dimensions:')} ${result.dimensions}D`);
            console.log(`  ${chalk_1.default.dim('Status:')}    ${chalk_1.default.yellow(result.status)}`);
            console.log();
            console.log(chalk_1.default.dim('  To manifest: qantum genesis manifest --reality ' + result.id));
        }
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('Failed to create reality'));
        console.error(chalk_1.default.red(error.message));
        process.exit(1);
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS MANIFEST
// ═══════════════════════════════════════════════════════════════════════════════
async function genesisManifest(options) {
    const config = (0, config_js_1.getConfig)();
    // Complexity: O(N*M) — nested iteration
    (0, config_js_1.requireAuth)(config);
    const spinner = (0, ora_1.default)('Manifesting reality into Docker environment...').start();
    try {
        const result = await api_js_1.api.post('/api/v1/genesis/manifestReality', {
            realityId: options.reality,
            timeout: parseInt(options.timeout, 10) || 60,
        }, config);
        if (options.wait) {
            spinner.text = 'Waiting for reality stabilization...';
            // Poll for stability
            let stable = false;
            const maxWait = parseInt(options.timeout, 10) * 1000 || 60000;
            const startTime = Date.now();
            while (!stable && Date.now() - startTime < maxWait) {
                // SAFETY: async operation — wrap in try-catch for production resilience
                const status = await api_js_1.api.get(`/api/v1/genesis/status/${result.manifestationId}`, config);
                if (status.status === 'STABLE') {
                    stable = true;
                }
                else if (status.status === 'COLLAPSING' || status.status === 'COLLAPSED') {
                    throw new Error('Reality collapsed during manifestation');
                }
                else {
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
            if (!stable) {
                throw new Error('Reality failed to stabilize within timeout');
            }
        }
        spinner.succeed(chalk_1.default.green('Reality manifested!'));
        if (options.json) {
            console.log(JSON.stringify(result, null, 2));
        }
        else {
            console.log();
            console.log(chalk_1.default.magenta('  🌌 Reality Manifested'));
            console.log();
            console.log(`  ${chalk_1.default.dim('Manifestation ID:')} ${chalk_1.default.cyan(result.manifestationId)}`);
            console.log(`  ${chalk_1.default.dim('Reality ID:')}       ${result.realityId}`);
            console.log(`  ${chalk_1.default.dim('Status:')}          ${chalk_1.default.green(result.status)}`);
            console.log(`  ${chalk_1.default.dim('Network:')}         ${result.network}`);
            console.log();
            console.log(chalk_1.default.dim('  Containers:'));
            for (const container of result.containers) {
                const statusColor = container.status === 'running' ? chalk_1.default.green : chalk_1.default.yellow;
                console.log(`    ${chalk_1.default.dim('•')} ${container.name}: ${statusColor(container.status)}`);
            }
            console.log();
            console.log(chalk_1.default.dim('  To observe: qantum genesis observe --reality ' + result.manifestationId));
        }
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('Failed to manifest reality'));
        console.error(chalk_1.default.red(error.message));
        process.exit(1);
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS OBSERVE
// ═══════════════════════════════════════════════════════════════════════════════
async function genesisObserve(options) {
    const config = (0, config_js_1.getConfig)();
    // Complexity: O(1)
    (0, config_js_1.requireAuth)(config);
    let testCode = options.code || '';
    // Read from file if provided
    if (options.file) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
        // SAFETY: async operation — wrap in try-catch for production resilience
        testCode = await fs.readFile(options.file, 'utf-8');
    }
    if (!testCode) {
        console.error(chalk_1.default.red('Error: Provide test code via --code or --file'));
        process.exit(1);
    }
    const spinner = (0, ora_1.default)('Observing reality (executing test)...').start();
    try {
        const result = await api_js_1.api.post('/api/v1/genesis/observe', {
            realityId: options.reality,
            testCode,
            targetService: options.target || 'api',
            collapseOnObservation: options.collapse,
        }, config);
        if (result.success) {
            spinner.succeed(chalk_1.default.green('Observation successful!'));
        }
        else {
            spinner.fail(chalk_1.default.red('Observation failed'));
        }
        if (options.json) {
            console.log(JSON.stringify(result, null, 2));
        }
        else {
            console.log();
            console.log(chalk_1.default.magenta('  👁️  Observation Result'));
            console.log();
            console.log(`  ${chalk_1.default.dim('Success:')}    ${result.success ? chalk_1.default.green('✓') : chalk_1.default.red('✗')}`);
            console.log(`  ${chalk_1.default.dim('Duration:')}   ${result.duration}ms`);
            console.log(`  ${chalk_1.default.dim('Collapsed:')}  ${result.waveformCollapsed ? chalk_1.default.yellow('Yes') : 'No'}`);
            if (result.error) {
                console.log(`  ${chalk_1.default.dim('Error:')}     ${chalk_1.default.red(result.error)}`);
            }
            if (Object.keys(result.measuredState).length > 0) {
                console.log();
                console.log(chalk_1.default.dim('  Measured State:'));
                for (const [key, value] of Object.entries(result.measuredState)) {
                    console.log(`    ${chalk_1.default.dim(key + ':')} ${JSON.stringify(value)}`);
                }
            }
            if (result.logs && result.logs.length > 0) {
                console.log();
                console.log(chalk_1.default.dim('  Logs:'));
                for (const log of result.logs) {
                    console.log(`    ${log}`);
                }
            }
        }
        process.exit(result.success ? 0 : 1);
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('Failed to observe reality'));
        console.error(chalk_1.default.red(error.message));
        process.exit(1);
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS LIST
// ═══════════════════════════════════════════════════════════════════════════════
async function genesisList(options) {
    const config = (0, config_js_1.getConfig)();
    // Complexity: O(N) — loop
    (0, config_js_1.requireAuth)(config);
    const spinner = (0, ora_1.default)('Fetching active realities...').start();
    try {
        const result = await api_js_1.api.get('/api/v1/genesis/myRealities' + (options.all ? '?all=true' : ''), config);
        spinner.stop();
        if (options.json) {
            console.log(JSON.stringify(result, null, 2));
        }
        else {
            console.log();
            console.log(chalk_1.default.magenta(`  🌌 Active Realities (${result.total})`));
            console.log();
            if (result.realities.length === 0) {
                console.log(chalk_1.default.dim('  No active realities'));
            }
            else {
                for (const reality of result.realities) {
                    const statusColor = reality.status === 'STABLE' ? chalk_1.default.green :
                        reality.status === 'MANIFESTING' ? chalk_1.default.yellow :
                            reality.status === 'UNSTABLE' ? chalk_1.default.red :
                                chalk_1.default.dim;
                    console.log(`  ${chalk_1.default.cyan(reality.id.slice(0, 8))}  ${reality.name}`);
                    console.log(`    ${chalk_1.default.dim('Status:')}     ${statusColor(reality.status)}`);
                    console.log(`    ${chalk_1.default.dim('Dimensions:')} ${reality.dimensions}D`);
                    console.log(`    ${chalk_1.default.dim('Containers:')} ${reality.containers}`);
                    console.log(`    ${chalk_1.default.dim('Created:')}    ${new Date(reality.createdAt).toLocaleString()}`);
                    console.log();
                }
            }
            console.log(chalk_1.default.dim('  Create new: qantum genesis create --name "My Reality"'));
        }
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('Failed to list realities'));
        console.error(chalk_1.default.red(error.message));
        process.exit(1);
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS COLLAPSE
// ═══════════════════════════════════════════════════════════════════════════════
async function genesisCollapse(realityId, options) {
    const config = (0, config_js_1.getConfig)();
    // Complexity: O(1)
    (0, config_js_1.requireAuth)(config);
    if (options.all) {
        const spinner = (0, ora_1.default)('Collapsing all realities...').start();
        try {
            const result = await api_js_1.api.delete('/api/v1/genesis/collapseAll', config);
            spinner.succeed(chalk_1.default.green(`Collapsed ${result.collapsed} realities`));
        }
        catch (error) {
            spinner.fail(chalk_1.default.red('Failed to collapse realities'));
            console.error(chalk_1.default.red(error.message));
            process.exit(1);
        }
        return;
    }
    if (!realityId) {
        console.error(chalk_1.default.red('Error: Provide reality ID or use --all'));
        process.exit(1);
    }
    // Confirm unless forced
    if (!options.force) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const readline = await Promise.resolve().then(() => __importStar(require('readline')));
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        // SAFETY: async operation — wrap in try-catch for production resilience
        const answer = await new Promise(resolve => {
            rl.question(chalk_1.default.yellow(`Collapse reality ${realityId}? [y/N] `), resolve);
        });
        rl.close();
        if (answer.toLowerCase() !== 'y') {
            console.log(chalk_1.default.dim('Cancelled'));
            return;
        }
    }
    const spinner = (0, ora_1.default)('Collapsing reality...').start();
    try {
        await api_js_1.api.delete(`/api/v1/genesis/collapse/${realityId}`, config);
        spinner.succeed(chalk_1.default.green('Reality collapsed'));
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('Failed to collapse reality'));
        console.error(chalk_1.default.red(error.message));
        process.exit(1);
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS STATUS
// ═══════════════════════════════════════════════════════════════════════════════
async function genesisStatus(options) {
    const config = (0, config_js_1.getConfig)();
    // Complexity: O(N) — loop
    (0, config_js_1.requireAuth)(config);
    const spinner = (0, ora_1.default)('Fetching reality status...').start();
    try {
        const result = await api_js_1.api.get(`/api/v1/genesis/status/${options.reality}`, config);
        spinner.stop();
        if (options.json) {
            console.log(JSON.stringify(result, null, 2));
        }
        else {
            console.log();
            console.log(chalk_1.default.magenta('  🌌 Reality Status'));
            console.log();
            console.log(`  ${chalk_1.default.dim('ID:')}          ${chalk_1.default.cyan(result.id)}`);
            console.log(`  ${chalk_1.default.dim('Name:')}        ${result.name}`);
            const statusColor = result.status === 'STABLE' ? chalk_1.default.green :
                result.status === 'MANIFESTING' ? chalk_1.default.yellow :
                    chalk_1.default.red;
            console.log(`  ${chalk_1.default.dim('Status:')}      ${statusColor(result.status)}`);
            console.log(`  ${chalk_1.default.dim('Coherence:')}   ${formatProgress(result.coherence)}`);
            console.log(`  ${chalk_1.default.dim('Entropy:')}     ${formatProgress(result.entropy, true)}`);
            console.log(`  ${chalk_1.default.dim('Dimensions:')} ${result.dimensions}D`);
            console.log(`  ${chalk_1.default.dim('Observers:')}   ${result.observerCount}`);
            console.log(`  ${chalk_1.default.dim('Uptime:')}      ${formatDuration(result.uptime)}`);
            console.log();
            console.log(chalk_1.default.dim('  Containers:'));
            for (const container of result.containers) {
                const healthIcon = container.health === 'healthy' ? chalk_1.default.green('♥') :
                    container.health === 'starting' ? chalk_1.default.yellow('◐') :
                        chalk_1.default.red('✗');
                console.log(`    ${healthIcon} ${container.name}`);
                console.log(`      ${chalk_1.default.dim('Status:')} ${container.status}`);
                if (container.ports.length > 0) {
                    console.log(`      ${chalk_1.default.dim('Ports:')}  ${container.ports.join(', ')}`);
                }
            }
        }
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('Failed to get reality status'));
        console.error(chalk_1.default.red(error.message));
        process.exit(1);
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function formatProgress(value, inverse = false) {
    const percent = Math.round(value * 100);
    const filled = Math.round(value * 20);
    const empty = 20 - filled;
    const color = inverse
        ? (value > 0.7 ? chalk_1.default.red : value > 0.3 ? chalk_1.default.yellow : chalk_1.default.green)
        : (value > 0.7 ? chalk_1.default.green : value > 0.3 ? chalk_1.default.yellow : chalk_1.default.red);
    return color('█'.repeat(filled)) + chalk_1.default.dim('░'.repeat(empty)) + ` ${percent}%`;
}
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    else {
        return `${seconds}s`;
    }
}
