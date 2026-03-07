/**
 * Configuration Management
 */

import Conf from 'conf';
import chalk from 'chalk';

interface ConfigSchema {
  apiUrl: string;
  apiToken?: string;
  userId?: string;
  userEmail?: string;
  defaultProject?: string;
}

const defaults: ConfigSchema = {
  apiUrl: process.env.QANTUM_API_URL || 'https://api.qantum.cloud',
};

let configInstance: Conf<ConfigSchema> | null = null;

export function getConfig(): Conf<ConfigSchema> {
  if (!configInstance) {
    configInstance = new Conf<ConfigSchema>({
      projectName: 'qantum-cli',
      defaults,
    });
  }
  return configInstance;
}

export function requireAuth(config: Conf<ConfigSchema>): void {
  const token = config.get('apiToken') || process.env.QANTUM_API_TOKEN;
  
  if (!token) {
    console.log(chalk.red('✗') + ' Not authenticated. Run `qantum login` first.');
    process.exit(1);
  }
  
  // Set token from env if not in config
  if (!config.get('apiToken') && process.env.QANTUM_API_TOKEN) {
    config.set('apiToken', process.env.QANTUM_API_TOKEN);
  }
}
