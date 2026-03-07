"use strict";
/**
 * Auth Commands - Login/Logout/Whoami
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.logout = logout;
exports.whoami = whoami;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const inquirer_1 = __importDefault(require("inquirer"));
const config_js_1 = require("../lib/config.js");
const api_js_1 = require("../lib/api.js");
async function login(options) {
    const config = (0, config_js_1.getConfig)();
    let token = options.token || process.env.QANTUM_API_TOKEN;
    if (!token) {
        // Interactive login
        // SAFETY: async operation — wrap in try-catch for production resilience
        const answers = await inquirer_1.default.prompt([
            {
                type: 'password',
                name: 'token',
                message: 'Enter your QAntum API token:',
                mask: '*',
                validate: (input) => input.length > 0 || 'Token is required',
            },
        ]);
        token = answers.token;
    }
    const spinner = (0, ora_1.default)('Verifying token...').start();
    try {
        // Verify token
        const user = await api_js_1.api.get('/api/v1/auth/me', { get: () => token });
        // Store token
        config.set('apiToken', token);
        config.set('userId', user.id);
        config.set('userEmail', user.email);
        spinner.succeed(`Logged in as ${chalk_1.default.cyan(user.email)}`);
    }
    catch (error) {
        spinner.fail(`Authentication failed: ${error.message}`);
        process.exit(1);
    }
}
async function logout() {
    const config = (0, config_js_1.getConfig)();
    config.delete('apiToken');
    config.delete('userId');
    config.delete('userEmail');
    config.delete('defaultProject');
    console.log(chalk_1.default.green('✓') + ' Logged out successfully');
}
async function whoami() {
    const config = (0, config_js_1.getConfig)();
    const email = config.get('userEmail');
    if (!email) {
        console.log(chalk_1.default.yellow('Not logged in. Run `qantum login` to authenticate.'));
        return;
    }
    const spinner = (0, ora_1.default)('Checking authentication...').start();
    try {
        const user = await api_js_1.api.get('/api/v1/auth/me', config);
        spinner.stop();
        console.log();
        console.log(chalk_1.default.bold('  Current User'));
        console.log(chalk_1.default.gray('  ────────────────────'));
        console.log(`  Email:   ${chalk_1.default.cyan(user.email)}`);
        console.log(`  Name:    ${user.name}`);
        console.log();
        console.log(chalk_1.default.bold('  Organization'));
        console.log(chalk_1.default.gray('  ────────────────────'));
        console.log(`  Name:    ${user.tenant.name}`);
        console.log(`  Plan:    ${chalk_1.default.magenta(user.tenant.plan)}`);
        console.log(`  Usage:   ${user.tenant.testsUsed}/${user.tenant.testsLimit} tests`);
        console.log();
    }
    catch (error) {
        spinner.fail('Session expired. Please run `qantum login` again.');
        config.delete('apiToken');
    }
}
