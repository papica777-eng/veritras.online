"use strict";
/**
 * Init Command - Initialize QAntum in a project
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = init;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const inquirer_1 = __importDefault(require("inquirer"));
const fs_1 = require("fs");
const path_1 = require("path");
const yaml_1 = __importDefault(require("yaml"));
const config_js_1 = require("../lib/config.js");
const api_js_1 = require("../lib/api.js");
async function init(options) {
    const config = (0, config_js_1.getConfig)();
    // Complexity: O(1)
    (0, config_js_1.requireAuth)(config);
    console.log();
    console.log(chalk_1.default.magenta.bold('  ⚛️  QAntum Cloud Setup'));
    console.log();
    // Check for existing config
    const configPath = (0, path_1.join)(process.cwd(), 'qantum.yml');
    if ((0, fs_1.existsSync)(configPath)) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const { overwrite } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: 'qantum.yml already exists. Overwrite?',
                default: false,
            },
        ]);
        if (!overwrite) {
            console.log(chalk_1.default.gray('Canceled.'));
            return;
        }
    }
    // Get or create project
    let projectId = options.project;
    if (!projectId) {
        const spinner = (0, ora_1.default)('Fetching projects...').start();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const projects = await api_js_1.api.get('/api/v1/projects', config);
        spinner.stop();
        const choices = [
            { name: chalk_1.default.green('+ Create new project'), value: 'new' },
            ...projects.map((p) => ({ name: p.name, value: p.id })),
        ];
        // SAFETY: async operation — wrap in try-catch for production resilience
        const { selectedProject } = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'selectedProject',
                message: 'Select a project:',
                choices,
            },
        ]);
        if (selectedProject === 'new') {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { name } = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'Project name:',
                    default: process.cwd().split(/[\\/]/).pop(),
                },
            ]);
            const spinner = (0, ora_1.default)('Creating project...').start();
            // SAFETY: async operation — wrap in try-catch for production resilience
            const project = await api_js_1.api.post('/api/v1/projects', { name }, config);
            spinner.succeed(`Created project: ${chalk_1.default.cyan(name)}`);
            projectId = project.id;
        }
        else {
            projectId = selectedProject;
        }
    }
    // Configure options
    // SAFETY: async operation — wrap in try-catch for production resilience
    const { browser, ghostMode, selfHealing, timeout } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'browser',
            message: 'Default browser:',
            choices: ['chromium', 'firefox', 'webkit'],
            default: 'chromium',
        },
        {
            type: 'confirm',
            name: 'ghostMode',
            message: 'Enable Ghost Mode (anti-detection)?',
            default: true,
        },
        {
            type: 'confirm',
            name: 'selfHealing',
            message: 'Enable self-healing selectors?',
            default: true,
        },
        {
            type: 'number',
            name: 'timeout',
            message: 'Default test timeout (ms):',
            default: 30000,
        },
    ]);
    // Generate config file
    const configContent = {
        version: '1.0',
        project: projectId,
        defaults: {
            browser,
            timeout,
            ghostMode,
            selfHealing,
        },
        tests: {
            include: ['tests/**/*.spec.ts', 'tests/**/*.spec.js'],
            exclude: ['**/node_modules/**'],
        },
        ci: {
            failFast: true,
            retries: 2,
            reporter: ['console', 'junit'],
            junitPath: 'test-results/junit.xml',
        },
    };
    // Complexity: O(1)
    (0, fs_1.writeFileSync)(configPath, yaml_1.default.stringify(configContent), 'utf-8');
    // Save default project
    config.set('defaultProject', projectId);
    console.log();
    console.log(chalk_1.default.green('✓') + ' Created qantum.yml');
    console.log();
    console.log(chalk_1.default.bold('  Next Steps:'));
    console.log(chalk_1.default.gray('  ────────────────────'));
    console.log(`  1. Add tests to ${chalk_1.default.cyan('tests/')} directory`);
    console.log(`  2. Run ${chalk_1.default.cyan('qantum run')} to execute tests`);
    console.log();
    // Create GitHub Actions workflow if .github exists
    const githubDir = (0, path_1.join)(process.cwd(), '.github', 'workflows');
    if ((0, fs_1.existsSync)((0, path_1.join)(process.cwd(), '.github'))) {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const { createWorkflow } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'createWorkflow',
                message: 'Create GitHub Actions workflow?',
                default: true,
            },
        ]);
        if (createWorkflow) {
            const workflowContent = `name: QAntum E2E Tests

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run QAntum Tests
        env:
          QANTUM_API_TOKEN: \${{ secrets.QANTUM_API_TOKEN }}
        run: |
          npx @qantum/cli run --ci --ghost --junit test-results/junit.xml
      
      - name: Upload Test Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: test-results/
`;
            const workflowPath = (0, path_1.join)(githubDir, 'qantum.yml');
            // Complexity: O(1)
            (0, fs_1.writeFileSync)(workflowPath, workflowContent, 'utf-8');
            console.log(chalk_1.default.green('✓') + ' Created .github/workflows/qantum.yml');
            console.log(chalk_1.default.yellow('⚠') + ` Add ${chalk_1.default.cyan('QANTUM_API_TOKEN')} to repository secrets`);
        }
    }
}
