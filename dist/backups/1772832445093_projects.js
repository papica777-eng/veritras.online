"use strict";
/**
 * Projects Commands
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProjects = listProjects;
exports.createProject = createProject;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const config_js_1 = require("../lib/config.js");
const api_js_1 = require("../lib/api.js");
async function listProjects() {
    const config = (0, config_js_1.getConfig)();
    // Complexity: O(N) — loop
    (0, config_js_1.requireAuth)(config);
    const spinner = (0, ora_1.default)('Fetching projects...').start();
    try {
        const projects = await api_js_1.api.get('/api/v1/projects', config);
        spinner.stop();
        if (projects.length === 0) {
            console.log(chalk_1.default.yellow('No projects found. Run `qantum init` to create one.'));
            return;
        }
        const defaultProject = config.get('defaultProject');
        console.log();
        console.log(chalk_1.default.bold('  Projects'));
        console.log(chalk_1.default.gray('  ────────────────────────────────────────'));
        for (const project of projects) {
            const isDefault = project.id === defaultProject;
            const marker = isDefault ? chalk_1.default.green('●') : chalk_1.default.gray('○');
            const name = isDefault ? chalk_1.default.cyan.bold(project.name) : project.name;
            console.log(`  ${marker} ${name}`);
            console.log(chalk_1.default.gray(`    ID: ${project.id}`));
            console.log(chalk_1.default.gray(`    Tests: ${project.testsCount}`));
            if (project.lastRunAt) {
                console.log(chalk_1.default.gray(`    Last run: ${new Date(project.lastRunAt).toLocaleString()}`));
            }
            console.log();
        }
    }
    catch (error) {
        spinner.fail(error.message);
    }
}
async function createProject(name) {
    const config = (0, config_js_1.getConfig)();
    // Complexity: O(1)
    (0, config_js_1.requireAuth)(config);
    const spinner = (0, ora_1.default)('Creating project...').start();
    try {
        const project = await api_js_1.api.post('/api/v1/projects', { name }, config);
        spinner.succeed(`Created project: ${chalk_1.default.cyan(project.name)}`);
        console.log(chalk_1.default.gray(`  ID: ${project.id}`));
    }
    catch (error) {
        spinner.fail(error.message);
    }
}
