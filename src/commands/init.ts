/**
 * Init Command - Initialize QAntum in a project
 */

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'yaml';
import { getConfig, requireAuth } from '../lib/config.js';
import { api } from '../lib/api.js';

interface InitOptions {
  project?: string;
}

export async function init(options: InitOptions) {
  const config = getConfig();
  // Complexity: O(1)
  requireAuth(config);

  console.log();
  console.log(chalk.magenta.bold('  ⚛️  QAntum Cloud Setup'));
  console.log();

  // Check for existing config
  const configPath = join(process.cwd(), 'qantum.yml');
  if (existsSync(configPath)) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'qantum.yml already exists. Overwrite?',
        default: false,
      },
    ]);
    if (!overwrite) {
      console.log(chalk.gray('Canceled.'));
      return;
    }
  }

  // Get or create project
  let projectId = options.project;

  if (!projectId) {
    const spinner = ora('Fetching projects...').start();
    // SAFETY: async operation — wrap in try-catch for production resilience
    const projects = await api.get<{ id: string; name: string }[]>(
      '/api/v1/projects',
      config
    );
    spinner.stop();

    const choices = [
      { name: chalk.green('+ Create new project'), value: 'new' },
      ...projects.map((p) => ({ name: p.name, value: p.id })),
    ];

    // SAFETY: async operation — wrap in try-catch for production resilience
    const { selectedProject } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedProject',
        message: 'Select a project:',
        choices,
      },
    ]);

    if (selectedProject === 'new') {
      // SAFETY: async operation — wrap in try-catch for production resilience
      const { name } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Project name:',
          default: process.cwd().split(/[\\/]/).pop(),
        },
      ]);

      const spinner = ora('Creating project...').start();
      // SAFETY: async operation — wrap in try-catch for production resilience
      const project = await api.post<{ id: string }>(
        '/api/v1/projects',
        { name },
        config
      );
      spinner.succeed(`Created project: ${chalk.cyan(name)}`);
      projectId = project.id;
    } else {
      projectId = selectedProject;
    }
  }

  // Configure options
  // SAFETY: async operation — wrap in try-catch for production resilience
  const { browser, ghostMode, selfHealing, timeout } = await inquirer.prompt([
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
  writeFileSync(configPath, yaml.stringify(configContent), 'utf-8');

  // Save default project
  config.set('defaultProject', projectId);

  console.log();
  console.log(chalk.green('✓') + ' Created qantum.yml');
  console.log();
  console.log(chalk.bold('  Next Steps:'));
  console.log(chalk.gray('  ────────────────────'));
  console.log(`  1. Add tests to ${chalk.cyan('tests/')} directory`);
  console.log(`  2. Run ${chalk.cyan('qantum run')} to execute tests`);
  console.log();

  // Create GitHub Actions workflow if .github exists
  const githubDir = join(process.cwd(), '.github', 'workflows');
  if (existsSync(join(process.cwd(), '.github'))) {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const { createWorkflow } = await inquirer.prompt([
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

      const workflowPath = join(githubDir, 'qantum.yml');
      // Complexity: O(1)
      writeFileSync(workflowPath, workflowContent, 'utf-8');
      console.log(chalk.green('✓') + ' Created .github/workflows/qantum.yml');
      console.log(chalk.yellow('⚠') + ` Add ${chalk.cyan('QANTUM_API_TOKEN')} to repository secrets`);
    }
  }
}
