"use strict";
/**
 * Configuration Management
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = getConfig;
exports.requireAuth = requireAuth;
const conf_1 = __importDefault(require("conf"));
const chalk_1 = __importDefault(require("chalk"));
const defaults = {
    apiUrl: process.env.QANTUM_API_URL || 'https://api.qantum.cloud',
};
let configInstance = null;
function getConfig() {
    if (!configInstance) {
        configInstance = new conf_1.default({
            projectName: 'qantum-cli',
            defaults,
        });
    }
    return configInstance;
}
function requireAuth(config) {
    const token = config.get('apiToken') || process.env.QANTUM_API_TOKEN;
    if (!token) {
        console.log(chalk_1.default.red('✗') + ' Not authenticated. Run `qantum login` first.');
        process.exit(1);
    }
    // Set token from env if not in config
    if (!config.get('apiToken') && process.env.QANTUM_API_TOKEN) {
        config.set('apiToken', process.env.QANTUM_API_TOKEN);
    }
}
