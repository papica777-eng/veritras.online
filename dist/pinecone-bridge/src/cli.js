#!/usr/bin/env node
"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM CONTEXT BRIDGE CLI v1.0                                              ║
 * ║   "Query 52K Vectors from Command Line"                                       ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum Empire | Dimitar Prodromov                               ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
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
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const PineconeContextBridge_js_1 = require("./PineconeContextBridge.js");
const PersistentContextStore_js_1 = require("./PersistentContextStore.js");
const EmbeddingEngine_js_1 = require("./EmbeddingEngine.js");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment
dotenv_1.default.config();
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
dotenv_1.default.config({ path: 'C:/MisteMind/.env' });
// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
const bridge = new PineconeContextBridge_js_1.PineconeContextBridge({
    apiKey: process.env.PINECONE_API_KEY,
});
const store = new PersistentContextStore_js_1.PersistentContextStore();
const embedEngine = new EmbeddingEngine_js_1.EmbeddingEngine();
// ═══════════════════════════════════════════════════════════════════════════════
// CLI PROGRAM
// ═══════════════════════════════════════════════════════════════════════════════
const program = new commander_1.Command();
program
    .name('qbridge')
    .description('🧠 QANTUM Context Bridge CLI - Query 52K+ Vectors')
    .version('1.0.0');
// ═══════════════════════════════════════════════════════════════════════════════
// QUERY COMMAND
// ═══════════════════════════════════════════════════════════════════════════════
program
    .command('query <text>')
    .description('Search the vector database with natural language')
    .option('-n, --top <number>', 'Number of results', '10')
    .option('-s, --score <number>', 'Minimum similarity score', '0.5')
    .option('-p, --project <name>', 'Filter by project name')
    .option('-f, --file <pattern>', 'Filter by file pattern')
    .option('--session <id>', 'Use session for context')
    .option('--json', 'Output as JSON')
    .action(async (text, options) => {
    const spinner = (0, ora_1.default)('Initializing...').start();
    try {
        // Load model
        spinner.text = 'Loading embedding model...';
        await embedEngine.load();
        // Connect to Pinecone
        spinner.text = 'Connecting to Pinecone...';
        await bridge.connect();
        // Build filter
        const filter = {};
        if (options.project) {
            filter.project = options.project;
        }
        // Execute query
        spinner.text = `Searching for: "${text}"`;
        const embedFn = (0, EmbeddingEngine_js_1.createEmbedFunction)(embedEngine);
        const result = await bridge.queryByText(text, embedFn, {
            topK: parseInt(options.top),
            minScore: parseFloat(options.score),
            filter: Object.keys(filter).length > 0 ? filter : undefined,
            sessionId: options.session,
        });
        spinner.stop();
        if (options.json) {
            console.log(JSON.stringify(result, null, 2));
            return;
        }
        // Pretty print results
        console.log('\n' + chalk_1.default.cyan.bold('═'.repeat(80)));
        console.log(chalk_1.default.cyan.bold(`  🔍 QUERY: "${text}"`));
        console.log(chalk_1.default.cyan.bold('═'.repeat(80)));
        console.log(chalk_1.default.dim(`  Total vectors: ${result.totalVectors.toLocaleString()} | Query time: ${result.queryTimeMs}ms`));
        console.log(chalk_1.default.dim(`  Results: ${result.matches.length} matches\n`));
        if (result.matches.length === 0) {
            console.log(chalk_1.default.yellow('  No matches found. Try a different query or lower the score threshold.\n'));
            return;
        }
        for (let i = 0; i < result.matches.length; i++) {
            const match = result.matches[i];
            const scoreColor = match.score > 0.8 ? chalk_1.default.green : match.score > 0.6 ? chalk_1.default.yellow : chalk_1.default.red;
            console.log(chalk_1.default.white.bold(`  ${i + 1}. `) + chalk_1.default.blue(match.filePath));
            console.log(chalk_1.default.dim(`     Project: ${match.project} | Lines: ${match.startLine}-${match.endLine} | Score: `) + scoreColor(`${(match.score * 100).toFixed(1)}%`));
            // Show snippet
            const snippet = match.content.slice(0, 200).replace(/\n/g, ' ').trim();
            console.log(chalk_1.default.gray(`     ${snippet}${match.content.length > 200 ? '...' : ''}`));
            console.log();
        }
        console.log(chalk_1.default.cyan.bold('═'.repeat(80)) + '\n');
    }
    catch (error) {
        spinner.fail('Query failed');
        console.error(chalk_1.default.red(error.message));
        process.exit(1);
    }
});
// ═══════════════════════════════════════════════════════════════════════════════
// STATUS COMMAND
// ═══════════════════════════════════════════════════════════════════════════════
program
    .command('status')
    .description('Show bridge status and statistics')
    .action(async () => {
    const spinner = (0, ora_1.default)('Checking status...').start();
    try {
        await bridge.connect();
        const bridgeStats = bridge.getStats();
        const storeStats = store.getStats();
        spinner.stop();
        console.log('\n' + chalk_1.default.cyan.bold('═'.repeat(60)));
        console.log(chalk_1.default.cyan.bold('  🧠 QANTUM CONTEXT BRIDGE STATUS'));
        console.log(chalk_1.default.cyan.bold('═'.repeat(60)));
        console.log(chalk_1.default.white.bold('\n  📡 Pinecone Connection:'));
        console.log(`     Status: ${bridgeStats.isConnected ? chalk_1.default.green('✅ Connected') : chalk_1.default.red('❌ Disconnected')}`);
        console.log(`     Index: ${chalk_1.default.cyan(bridgeStats.indexName)}`);
        console.log(`     Namespace: ${chalk_1.default.cyan(bridgeStats.namespace)}`);
        console.log(`     Total Vectors: ${chalk_1.default.yellow(bridgeStats.totalVectors.toLocaleString())}`);
        console.log(`     Dimension: ${chalk_1.default.dim(bridgeStats.dimension)}`);
        console.log(chalk_1.default.white.bold('\n  💾 Persistent Store:'));
        console.log(`     Sessions: ${chalk_1.default.yellow(storeStats.sessions)}`);
        console.log(`     Queries: ${chalk_1.default.yellow(storeStats.queries)}`);
        console.log(`     Conversations: ${chalk_1.default.yellow(storeStats.conversations)}`);
        console.log(`     Knowledge Items: ${chalk_1.default.yellow(storeStats.knowledge)}`);
        console.log(`     Cached Embeddings: ${chalk_1.default.yellow(storeStats.cachedEmbeddings)}`);
        console.log(`     Database Size: ${chalk_1.default.dim((storeStats.dbSizeBytes / 1024).toFixed(1) + ' KB')}`);
        console.log(chalk_1.default.cyan.bold('\n' + '═'.repeat(60)) + '\n');
    }
    catch (error) {
        spinner.fail('Status check failed');
        console.error(chalk_1.default.red(error.message));
        process.exit(1);
    }
});
// ═══════════════════════════════════════════════════════════════════════════════
// SESSIONS COMMAND
// ═══════════════════════════════════════════════════════════════════════════════
program
    .command('sessions')
    .description('List all saved sessions')
    .option('--create <name>', 'Create a new session')
    .option('--delete <id>', 'Delete a session')
    .action(async (options) => {
    try {
        if (options.create) {
            await bridge.connect();
            const session = bridge.createSession();
            store.saveSession({
                ...session,
                name: options.create,
                metadata: {},
            });
            console.log(chalk_1.default.green(`\n✅ Session created: ${session.sessionId}`));
            console.log(chalk_1.default.dim(`   Name: ${options.create}\n`));
            return;
        }
        if (options.delete) {
            store.deleteSession(options.delete);
            console.log(chalk_1.default.green(`\n✅ Session deleted: ${options.delete}\n`));
            return;
        }
        const sessions = store.getAllSessions();
        console.log('\n' + chalk_1.default.cyan.bold('  📋 SAVED SESSIONS'));
        console.log(chalk_1.default.cyan('  ' + '─'.repeat(56)));
        if (sessions.length === 0) {
            console.log(chalk_1.default.yellow('  No sessions found.\n'));
            return;
        }
        for (const session of sessions) {
            const lastUsed = new Date(session.lastAccessedAt).toLocaleString();
            console.log(`  ${chalk_1.default.white.bold(session.name)}`);
            console.log(`     ID: ${chalk_1.default.dim(session.sessionId)}`);
            console.log(`     Queries: ${chalk_1.default.yellow(session.queryHistory.length)} | Last used: ${chalk_1.default.dim(lastUsed)}`);
            console.log();
        }
    }
    catch (error) {
        console.error(chalk_1.default.red(error.message));
        process.exit(1);
    }
});
// ═══════════════════════════════════════════════════════════════════════════════
// KNOWLEDGE COMMAND
// ═══════════════════════════════════════════════════════════════════════════════
program
    .command('knowledge')
    .description('Manage knowledge base')
    .option('--set <category:key:value>', 'Set a knowledge item')
    .option('--get <category:key>', 'Get a knowledge item')
    .option('--search <term>', 'Search knowledge')
    .option('--list <category>', 'List all items in category')
    .action(async (options) => {
    try {
        if (options.set) {
            const [category, key, ...valueParts] = options.set.split(':');
            const value = valueParts.join(':');
            store.setKnowledge(category, key, value);
            console.log(chalk_1.default.green(`\n✅ Knowledge saved: ${category}:${key}\n`));
            return;
        }
        if (options.get) {
            const [category, key] = options.get.split(':');
            const value = store.getKnowledge(category, key);
            if (value) {
                console.log(`\n${chalk_1.default.cyan(category)}:${chalk_1.default.white(key)} = ${chalk_1.default.yellow(value)}\n`);
            }
            else {
                console.log(chalk_1.default.yellow('\nNot found.\n'));
            }
            return;
        }
        if (options.search) {
            const results = store.searchKnowledge(options.search);
            console.log(`\n${chalk_1.default.cyan.bold('  🔍 Knowledge Search Results:')}\n`);
            for (const item of results) {
                console.log(`  ${chalk_1.default.cyan(item.category)}:${chalk_1.default.white(item.key)} = ${chalk_1.default.yellow(item.value)}`);
            }
            console.log();
            return;
        }
        if (options.list) {
            const knowledge = store.getKnowledgeByCategory(options.list);
            console.log(`\n${chalk_1.default.cyan.bold(`  📚 Knowledge: ${options.list}`)}\n`);
            for (const [key, value] of Object.entries(knowledge)) {
                console.log(`  ${chalk_1.default.white(key)}: ${chalk_1.default.yellow(value)}`);
            }
            console.log();
            return;
        }
        // Default: show all categories
        const stats = store.getStats();
        console.log(`\n${chalk_1.default.cyan.bold('  📚 Knowledge Base')}`);
        console.log(`     Total items: ${chalk_1.default.yellow(stats.knowledge)}\n`);
    }
    catch (error) {
        console.error(chalk_1.default.red(error.message));
        process.exit(1);
    }
});
// ═══════════════════════════════════════════════════════════════════════════════
// SERVE COMMAND
// ═══════════════════════════════════════════════════════════════════════════════
program
    .command('serve')
    .description('Start the Bridge HTTP server')
    .option('-p, --port <number>', 'Port number', '8899')
    .action(async (options) => {
    process.env.BRIDGE_PORT = options.port;
    const { startServer } = await Promise.resolve().then(() => __importStar(require('./server.js')));
    await startServer();
});
// ═══════════════════════════════════════════════════════════════════════════════
// HELP FORMATTING
// ═══════════════════════════════════════════════════════════════════════════════
program.addHelpText('before', `
${chalk_1.default.cyan.bold('╔═══════════════════════════════════════════════════════════════════════════════╗')}
${chalk_1.default.cyan.bold('║                                                                               ║')}
${chalk_1.default.cyan.bold('║   🧠 QANTUM CONTEXT BRIDGE CLI                                                ║')}
${chalk_1.default.cyan.bold('║   Query 52,573+ vectors from the command line                                 ║')}
${chalk_1.default.cyan.bold('║                                                                               ║')}
${chalk_1.default.cyan.bold('╚═══════════════════════════════════════════════════════════════════════════════╝')}
`);
program.addHelpText('after', `
${chalk_1.default.dim('Examples:')}
  ${chalk_1.default.cyan('qbridge query "Ghost Protocol logic"')}           Search for code
  ${chalk_1.default.cyan('qbridge query "authentication flow" -n 5')}       Get top 5 results
  ${chalk_1.default.cyan('qbridge query "api routes" -p MisteMind')}        Filter by project
  ${chalk_1.default.cyan('qbridge status')}                                 Show connection status
  ${chalk_1.default.cyan('qbridge sessions --create "My Session"')}         Create a session
  ${chalk_1.default.cyan('qbridge serve --port 8899')}                      Start HTTP server
`);
// Parse CLI arguments
program.parse();
