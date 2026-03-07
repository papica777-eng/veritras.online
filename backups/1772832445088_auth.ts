/**
 * Auth Commands - Login/Logout/Whoami
 */

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { getConfig } from '../lib/config.js';
import { api } from '../lib/api.js';

interface LoginOptions {
  token?: string;
}

export async function login(options: LoginOptions) {
  const config = getConfig();
  
  let token = options.token || process.env.QANTUM_API_TOKEN;
  
  if (!token) {
    // Interactive login
    // SAFETY: async operation — wrap in try-catch for production resilience
    const answers = await inquirer.prompt([
      {
        type: 'password',
        name: 'token',
        message: 'Enter your QAntum API token:',
        mask: '*',
        validate: (input: string) => input.length > 0 || 'Token is required',
      },
    ]);
    token = answers.token;
  }

  const spinner = ora('Verifying token...').start();

  try {
    // Verify token
    const user = await api.get<{ id: string; email: string; name: string }>(
      '/api/v1/auth/me',
      { get: () => token } as any
    );

    // Store token
    config.set('apiToken', token);
    config.set('userId', user.id);
    config.set('userEmail', user.email);

    spinner.succeed(`Logged in as ${chalk.cyan(user.email)}`);
  } catch (error: any) {
    spinner.fail(`Authentication failed: ${error.message}`);
    process.exit(1);
  }
}

export async function logout() {
  const config = getConfig();
  
  config.delete('apiToken');
  config.delete('userId');
  config.delete('userEmail');
  config.delete('defaultProject');

  console.log(chalk.green('✓') + ' Logged out successfully');
}

export async function whoami() {
  const config = getConfig();
  const email = config.get('userEmail');

  if (!email) {
    console.log(chalk.yellow('Not logged in. Run `qantum login` to authenticate.'));
    return;
  }

  const spinner = ora('Checking authentication...').start();

  try {
    const user = await api.get<{
      id: string;
      email: string;
      name: string;
      tenant: {
        name: string;
        plan: string;
        testsUsed: number;
        testsLimit: number;
      };
    }>('/api/v1/auth/me', config);

    spinner.stop();

    console.log();
    console.log(chalk.bold('  Current User'));
    console.log(chalk.gray('  ────────────────────'));
    console.log(`  Email:   ${chalk.cyan(user.email)}`);
    console.log(`  Name:    ${user.name}`);
    console.log();
    console.log(chalk.bold('  Organization'));
    console.log(chalk.gray('  ────────────────────'));
    console.log(`  Name:    ${user.tenant.name}`);
    console.log(`  Plan:    ${chalk.magenta(user.tenant.plan)}`);
    console.log(`  Usage:   ${user.tenant.testsUsed}/${user.tenant.testsLimit} tests`);
    console.log();
  } catch (error: any) {
    spinner.fail('Session expired. Please run `qantum login` again.');
    config.delete('apiToken');
  }
}
