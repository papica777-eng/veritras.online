"use strict";
/**
 * Upload Command - Upload test files to QAntum Cloud
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = upload;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs_1 = require("fs");
const glob_1 = require("glob");
const path_1 = require("path");
const config_js_1 = require("../lib/config.js");
const api_js_1 = require("../lib/api.js");
async function upload(files, options) {
    const config = (0, config_js_1.getConfig)();
    // Complexity: O(1)
    (0, config_js_1.requireAuth)(config);
    const projectId = options.project || config.get('defaultProject');
    if (!projectId) {
        console.log(chalk_1.default.red('✗') + ' No project specified. Use --project or run `qantum init`');
        process.exit(1);
    }
    const spinner = (0, ora_1.default)('Scanning files...').start();
    try {
        // Expand glob patterns
        const allFiles = [];
        for (const pattern of files) {
            const stat = (0, fs_1.statSync)(pattern, { throwIfNoEntry: false });
            if (stat?.isDirectory()) {
                // If directory, scan for test files
                const found = await (0, glob_1.glob)(`${pattern}/**/*.{spec,test}.{ts,js}`, {
                    ignore: ['**/node_modules/**'],
                });
                allFiles.push(...found);
            }
            else if (stat?.isFile()) {
                allFiles.push(pattern);
            }
            else {
                // Treat as glob pattern
                // SAFETY: async operation — wrap in try-catch for production resilience
                const found = await (0, glob_1.glob)(pattern, {
                    ignore: ['**/node_modules/**'],
                });
                allFiles.push(...found);
            }
        }
        if (allFiles.length === 0) {
            spinner.fail('No test files found');
            return;
        }
        spinner.text = `Uploading ${allFiles.length} files...`;
        // Prepare upload payload
        const uploadFiles = allFiles.map((file) => ({
            path: (0, path_1.relative)(process.cwd(), file),
            name: (0, path_1.basename)(file),
            content: (0, fs_1.readFileSync)(file, 'utf-8'),
        }));
        // Upload files
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await api_js_1.api.post('/api/v1/tests/upload', {
            projectId,
            files: uploadFiles,
        }, config);
        spinner.succeed(`Uploaded ${result.uploaded} test files`);
        console.log(chalk_1.default.gray(`  Suite ID: ${result.suiteId}`));
        console.log(chalk_1.default.gray(`  Tests: ${result.tests.length}`));
        console.log();
        console.log(`Run tests: ${chalk_1.default.cyan(`qantum run --suite ${result.suiteId}`)}`);
    }
    catch (error) {
        spinner.fail(error.message);
    }
}
