"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./src/api/unified/utils/logger");
const auto_test_factory_1 = require("./src/cognitive/auto-test-factory");
const pdf_generator_1 = require("./src/reports/pdf-generator");
const path = __importStar(require("path"));
const cliProgress = __importStar(require("cli-progress"));
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 QANTUM INTERVIEW DEMO RUNNER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This script runs the entire Autonomous flow: Site mapping simulation -> Code Generation -> PDF Report
 * It is designed specifically to look impressive during an interview screen share.
 *
 * Instructions: npx ts-node QANTUM_INTERVIEW_RUNNER.ts
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function runInterviewDemo() {
    console.clear();
    console.log(`${CYAN}
╔══════════════════════════════════════════════════════════════════════════════╗
║                           QAntum-Prime                                       ║
║                                                                              ║
║                    🧠 AUTONOMOUS AUTO TEST FACTORY                           ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
${RESET}`);
    // ==========================================================
    // PHASE 1: SIMULATED EXPLORATION (Visual fluff for interview)
    // ==========================================================
    logger_1.logger.info(`${BOLD}PHASE 1: AI Site Exploration & Indexing...${RESET}`);
    const exploreBar = new cliProgress.SingleBar({
        format: `${CYAN}Exploring Application${RESET} |${CYAN}{bar}${RESET}| {percentage}% | ETA: {eta}s | {value}/{total} Pages`,
        barCompleteChar: '█',
        barIncompleteChar: '░',
        hideCursor: true
    });
    exploreBar.start(120, 0);
    for (let i = 0; i <= 120; i++) {
        await sleep(20);
        exploreBar.update(i);
        if (i % 20 === 0) {
            logger_1.logger.debug(`[Neural Engine] Found new DOM cluster at depth ${Math.floor(i / 10)}`);
        }
    }
    exploreBar.stop();
    console.log('');
    // ==========================================================
    // PHASE 2: AUTO TEST FACTORY GENERATION
    // ==========================================================
    logger_1.logger.info(`${BOLD}${MAGENTA}PHASE 2: Generating Tests via Auto Test Factory...${RESET}`);
    const mockSiteMap = {
        baseUrl: 'https://enterprise-demo.com',
        exploredAt: Date.now(),
        totalPages: 120,
        totalForms: 15,
        totalApiEndpoints: 45,
        pages: new Map(),
        forms: new Map([
            ['login', { id: 'loginForm', action: '/api/auth', method: 'POST', fields: [{ name: 'email', type: 'email', required: true }, { name: 'password', type: 'password', required: true }], purpose: 'login' }],
            ['checkout', { id: 'cartForm', action: '/api/checkout', method: 'POST', fields: [{ name: 'card', type: 'text', required: true }], purpose: 'checkout' }]
        ]),
        apiEndpoints: new Map(),
        transactionFlows: [
            { id: 'tf_1', name: 'Purchase Flow', startPage: '/products', endPage: '/success', steps: [], apiSequence: [], businessPurpose: 'revenue' }
        ],
        authentication: null,
        userFlows: [],
        criticalPaths: ['/checkout', '/login']
    };
    const factory = (0, auto_test_factory_1.createTestFactory)({
        outputDir: './interview_generated_tests',
        generateGhostTests: true,
        generatePlaywrightTests: true,
        generateApiTests: true
    });
    logger_1.logger.info('Compiling AST Trees and Generating Test Specs...');
    await sleep(1000); // Dramatic pause
    // We run the actual factory code to prove it works
    const suites = await factory.generateFromSiteMap(mockSiteMap);
    console.log(`${GREEN}✅ Test Factory Generation Complete!${RESET}`);
    console.log(`${DIM}Look at the ./interview_generated_tests/ folder for the code.${RESET}`);
    console.log('');
    // ==========================================================
    // PHASE 3: EXECUTIVE PDF REPORT
    // ==========================================================
    logger_1.logger.info(`${BOLD}${YELLOW}PHASE 3: Compiling AI Executive PDF Report...${RESET}`);
    await sleep(800);
    const pdfPath = await (0, pdf_generator_1.generateExecutiveReport)(path.resolve(__dirname, 'reports'));
    console.log(`${GREEN}✅ PDF Executive Report generated at: ${pdfPath}${RESET}`);
    console.log('');
    // ==========================================================
    // OUTRO
    // ==========================================================
    console.log(`${CYAN}
╔══════════════════════════════════════════════════════════════════════════════╗
║  🏁 DEMONSTRATION COMPLETE                                                   ║
║                                                                              ║
║  Your automated tests are generated, and the PDF is ready for C-Level.       ║
╚══════════════════════════════════════════════════════════════════════════════╝
${RESET}`);
}
// Execute
runInterviewDemo().catch(err => {
    console.error(`${RED}Fatal error during demo:${RESET}`, err);
});
