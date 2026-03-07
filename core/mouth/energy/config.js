/**
 * Configuration Management
 */
import Conf from 'conf';
import chalk from 'chalk';
const defaults = {
    apiUrl: process.env.QANTUM_API_URL || 'https://api.qantum.cloud',
};
let configInstance = null;
export function getConfig() {
    if (!configInstance) {
        configInstance = new Conf({
            projectName: 'qantum-cli',
            defaults,
        });
    }
    return configInstance;
}
export function requireAuth(config) {
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
//# sourceMappingURL=config.js.map