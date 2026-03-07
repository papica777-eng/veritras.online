"use strict";
/**
 * cli — Qantum Module
 * @module cli
 * @path src/cli.ts
 * @auto-documented BrutalDocEngine v2.1
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
!/usr/bin / env;
node;
/**
 * QAntum CLI - Command Line Interface for QAntum Cloud
 *
 * Run AI-powered tests from CI/CD pipelines
 *
 * @author Димитър Продромов
 * @copyright 2026 QAntum. All Rights Reserved.
 */
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const run_js_1 = require("./commands/run.js");
const auth_js_1 = require("./commands/auth.js");
const init_js_1 = require("./commands/init.js");
const projects_js_1 = require("./commands/projects.js");
const upload_js_1 = require("./commands/upload.js");
const genesis_js_1 = require("./commands/genesis.js");
const version_js_1 = require("./version.js");
const program = new commander_1.Command();
// ═══════════════════════════════════════════════════════════════════════════════
// CLI SETUP
// ═══════════════════════════════════════════════════════════════════════════════
program
    .name('qantum')
    .description(chalk_1.default.magenta('⚛️  QAntum Cloud') + ' - AI-Powered Test Automation')
    .version(version_js_1.version, '-v, --version', 'Display version')
    .configureOutput({
    writeErr: (str) => process.stderr.write(chalk_1.default.red(str)),
});
// ═══════════════════════════════════════════════════════════════════════════════
// AUTH COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════
program
    .command('login')
    .description('Authenticate with QAntum Cloud')
    .option('-t, --token <token>', 'API token (or set QANTUM_API_TOKEN)')
    .action(auth_js_1.login);
program
    .command('logout')
    .description('Log out and clear stored credentials')
    .action(auth_js_1.logout);
program
    .command('whoami')
    .description('Display current authenticated user')
    .action(auth_js_1.whoami);
// ═══════════════════════════════════════════════════════════════════════════════
// PROJECT COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════
program
    .command('init')
    .description('Initialize QAntum in current directory')
    .option('-p, --project <name>', 'Project name')
    .action(init_js_1.init);
const projects = program
    .command('projects')
    .description('Manage projects');
projects
    .command('list')
    .alias('ls')
    .description('List all projects')
    .action(projects_js_1.listProjects);
projects
    .command('create <name>')
    .description('Create a new project')
    .action(projects_js_1.createProject);
// ═══════════════════════════════════════════════════════════════════════════════
// TEST COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════
program
    .command('run')
    .description('Execute tests on QAntum Cloud')
    .argument('[tests...]', 'Test files or patterns to run')
    .option('-p, --project <id>', 'Project ID')
    .option('-s, --suite <id>', 'Test suite ID')
    .option('-b, --browser <browser>', 'Browser to use (chromium|firefox|webkit)', 'chromium')
    .option('--parallel <n>', 'Number of parallel workers', '1')
    .option('--ghost', 'Enable Ghost Mode (anti-detection)', false)
    .option('--no-self-healing', 'Disable self-healing selectors')
    .option('--timeout <ms>', 'Test timeout in milliseconds', '30000')
    .option('--ci', 'CI mode (non-interactive, fail on error)')
    .option('--json', 'Output results as JSON')
    .option('--junit <path>', 'Output JUnit XML report')
    .option('--wait', 'Wait for tests to complete', true)
    .option('--no-wait', 'Return immediately after submitting')
    .action(run_js_1.runTests);
program
    .command('upload')
    .description('Upload test files to QAntum Cloud')
    .argument('<files...>', 'Test files or directories to upload')
    .option('-p, --project <id>', 'Project ID')
    .action(upload_js_1.upload);
// ═══════════════════════════════════════════════════════════════════════════════
// GENESIS COMMANDS - ОНТОЛОГИЧНА КОВАЧНИЦА
// ═══════════════════════════════════════════════════════════════════════════════
const genesis = program
    .command('genesis')
    .description(chalk_1.default.magenta('⚛️  Genesis') + ' - Create and manage test realities');
genesis
    .command('create')
    .description('Create a new reality specification')
    .option('-n, --name <name>', 'Reality name', 'Unnamed Reality')
    .option('-d, --dimensions <n>', 'Number of dimensions (4-11)', '4')
    .option('-e, --entropy <level>', 'Chaos level (0-1)', '0.1')
    .option('-c, --causality <type>', 'Causality type', 'DETERMINISTIC')
    .option('-a, --axioms <types>', 'Comma-separated axiom types')
    .option('--json', 'Output as JSON')
    .action(genesis_js_1.genesisCreate);
genesis
    .command('manifest')
    .description('Manifest reality into Docker environment')
    .requiredOption('-r, --reality <id>', 'Reality ID to manifest')
    .option('--wait', 'Wait for stability', true)
    .option('--no-wait', 'Return immediately')
    .option('-t, --timeout <seconds>', 'Wait timeout', '60')
    .option('--json', 'Output as JSON')
    .action(genesis_js_1.genesisManifest);
genesis
    .command('observe')
    .description('Execute test within a manifested reality')
    .requiredOption('-r, --reality <id>', 'Reality ID to observe')
    .option('-t, --target <service>', 'Target service name')
    .option('-c, --code <code>', 'Test code to execute')
    .option('-f, --file <path>', 'Test file to execute')
    .option('--collapse', 'Collapse reality after observation', false)
    .option('--json', 'Output as JSON')
    .action(genesis_js_1.genesisObserve);
genesis
    .command('list')
    .alias('ls')
    .description('List active realities')
    .option('-a, --all', 'Include collapsed realities')
    .option('--json', 'Output as JSON')
    .action(genesis_js_1.genesisList);
genesis
    .command('collapse [realityId]')
    .description('Collapse (destroy) a reality')
    .option('-f, --force', 'Skip confirmation')
    .option('--all', 'Collapse all realities')
    .action(genesis_js_1.genesisCollapse);
genesis
    .command('status')
    .description('Get detailed reality status')
    .requiredOption('-r, --reality <id>', 'Reality ID')
    .option('--json', 'Output as JSON')
    .action(genesis_js_1.genesisStatus);
// ═══════════════════════════════════════════════════════════════════════════════
// PARSE & EXECUTE
// ═══════════════════════════════════════════════════════════════════════════════
program.parse(process.argv);
// Show help if no command provided
if (!process.argv.slice(2).length) {
    console.log();
    console.log(chalk_1.default.magenta.bold('  ⚛️  QAntum Cloud CLI'));
    console.log(chalk_1.default.gray('  AI-Powered Test Automation'));
    console.log();
    program.help();
}
