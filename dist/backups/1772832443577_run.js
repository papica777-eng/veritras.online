"use strict";
/**
 * Run Command - Execute tests on QAntum Cloud
 *
 * Supports CI/CD integration with proper exit codes
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTests = runTests;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const ws_1 = require("ws");
const config_js_1 = require("../lib/config.js");
const api_js_1 = require("../lib/api.js");
const format_js_1 = require("../lib/format.js");
async function runTests(tests, options) {
    const config = (0, config_js_1.getConfig)();
    // Complexity: O(N)
    (0, config_js_1.requireAuth)(config);
    const spinner = (0, ora_1.default)('Preparing test run...').start();
    try {
        // Determine project
        let projectId = options.project || config.get('defaultProject');
        if (!projectId) {
            spinner.fail('No project specified. Use --project or run `qantum init`');
            process.exit(1);
        }
        // Prepare request
        const payload = {
            projectId,
            suiteId: options.suite,
            testPatterns: tests.length > 0 ? tests : undefined,
            config: {
                browser: options.browser.toUpperCase(),
                parallelism: parseInt(options.parallel, 10),
                ghostMode: options.ghost,
                selfHealing: options.selfHealing,
                timeout: parseInt(options.timeout, 10),
            },
            metadata: {
                triggeredBy: 'ci',
                commitSha: process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA,
                branch: process.env.GITHUB_REF_NAME || process.env.CI_COMMIT_BRANCH,
                actor: process.env.GITHUB_ACTOR || process.env.GITLAB_USER_LOGIN,
            },
        };
        // Submit test run
        spinner.text = 'Submitting test run to QAntum Cloud...';
        // SAFETY: async operation — wrap in try-catch for production resilience
        const { runId, wsUrl } = await api_js_1.api.post('/api/v1/tests/run', payload, config);
        if (!options.wait) {
            spinner.succeed(`Test run submitted: ${chalk_1.default.cyan(runId)}`);
            console.log(`  View results: ${config.get('apiUrl')}/runs/${runId}`);
            return;
        }
        // Connect to WebSocket for real-time updates
        spinner.text = 'Connecting to execution stream...';
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await new Promise((resolve, reject) => {
            const ws = new ws_1.WebSocket(wsUrl, {
                headers: {
                    Authorization: `Bearer ${config.get('apiToken')}`,
                },
            });
            let currentRun = {};
            let completedTests = 0;
            ws.on('open', () => {
                spinner.text = 'Running tests...';
            });
            ws.on('message', (data) => {
                const message = JSON.parse(data.toString());
                switch (message.type) {
                    case 'run:started':
                        currentRun = {
                            id: runId,
                            status: 'running',
                            totalTests: message.totalTests,
                            passedTests: 0,
                            failedTests: 0,
                            skippedTests: 0,
                            healedTests: 0,
                            duration: 0,
                            results: [],
                        };
                        spinner.text = `Running ${message.totalTests} tests...`;
                        break;
                    case 'test:completed':
                        const test = message.test;
                        currentRun.results?.push(test);
                        completedTests++;
                        if (test.status === 'passed')
                            currentRun.passedTests++;
                        else if (test.status === 'failed')
                            currentRun.failedTests++;
                        else
                            currentRun.skippedTests++;
                        if (test.healed) {
                            currentRun.healedTests++;
                            if (!options.json) {
                                spinner.info(chalk_1.default.magenta('🔮 Self-healed: ') +
                                    chalk_1.default.gray(test.name) +
                                    chalk_1.default.gray(' → ') +
                                    chalk_1.default.cyan(test.healedSelector?.healed));
                                spinner.start();
                            }
                        }
                        const progress = `${completedTests}/${currentRun.totalTests}`;
                        const passRate = currentRun.passedTests / completedTests * 100;
                        spinner.text = `Running tests... ${progress} (${passRate.toFixed(0)}% passing)`;
                        if (!options.json && test.status === 'failed') {
                            spinner.fail(chalk_1.default.red(`✗ ${test.name}`));
                            if (test.error) {
                                console.log(chalk_1.default.gray(`  ${test.error}`));
                            }
                            spinner.start();
                        }
                        break;
                    case 'run:completed':
                        currentRun.status = message.status;
                        currentRun.duration = message.duration;
                        ws.close();
                        // Complexity: O(1)
                        resolve(currentRun);
                        break;
                    case 'run:error':
                        ws.close();
                        // Complexity: O(1)
                        reject(new Error(message.error));
                        break;
                }
            });
            ws.on('error', reject);
            ws.on('close', (code) => {
                if (code !== 1000) {
                    // Complexity: O(1)
                    reject(new Error(`WebSocket closed unexpectedly: ${code}`));
                }
            });
        });
        // Output results
        spinner.stop();
        if (options.json) {
            console.log(JSON.stringify(result, null, 2));
        }
        else {
            console.log();
            console.log((0, format_js_1.formatResults)(result));
        }
        // Generate JUnit report if requested
        if (options.junit) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            const { generateJUnit } = await Promise.resolve().then(() => __importStar(require('../lib/junit.js')));
            // SAFETY: async operation — wrap in try-catch for production resilience
            await generateJUnit(result, options.junit);
            console.log(chalk_1.default.gray(`JUnit report: ${options.junit}`));
        }
        // Exit with appropriate code
        if (options.ci || process.env.CI) {
            process.exit(result.status === 'passed' ? 0 : 1);
        }
    }
    catch (error) {
        spinner.fail(error.message);
        if (options.ci || process.env.CI) {
            process.exit(1);
        }
    }
}
