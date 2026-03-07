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
  apiUrl: process.env.QAntum_API_URL || 'https://api.QAntum.cloud',
};

let configInstance: Conf<ConfigSchema> | null = null;

export function getConfig(): Conf<ConfigSchema> {
  if (!configInstance) {
    configInstance = new Conf<ConfigSchema>({
      projectName: 'QAntum-cli',
      defaults,
    });
  }
  return configInstance;
}

export function requireAuth(config: Conf<ConfigSchema>): void {
  const token = config.get('apiToken') || process.env.QAntum_API_TOKEN;
  
  if (!token) {
    console.log(chalk.red('✗') + ' Not authenticated. Run `QAntum login` first.');
    process.exit(1);
  }
  
  // Set token from env if not in config
  if (!config.get('apiToken') && process.env.QAntum_API_TOKEN) {
    config.set('apiToken', process.env.QAntum_API_TOKEN);
  }
}
