#!/usr/bin/env node
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

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { PineconeContextBridge } from './PineconeContextBridge.js';
import { PersistentContextStore } from './PersistentContextStore.js';
import { EmbeddingEngine, createEmbedFunction } from './EmbeddingEngine.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: 'C:/MisteMind/.env' });

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const bridge = new PineconeContextBridge({
  apiKey: process.env.PINECONE_API_KEY,
});

const store = new PersistentContextStore();
const embedEngine = new EmbeddingEngine();

// ═══════════════════════════════════════════════════════════════════════════════
// CLI PROGRAM
// ═══════════════════════════════════════════════════════════════════════════════

const program = new Command();

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
    const spinner = ora('Initializing...').start();
    
    try {
      // Load model
      spinner.text = 'Loading embedding model...';
      await embedEngine.load();
      
      // Connect to Pinecone
      spinner.text = 'Connecting to Pinecone...';
      await bridge.connect();
      
      // Build filter
      const filter: Record<string, any> = {};
      if (options.project) {
        filter.project = options.project;
      }
      
      // Execute query
      spinner.text = `Searching for: "${text}"`;
      const embedFn = createEmbedFunction(embedEngine);
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
      console.log('\n' + chalk.cyan.bold('═'.repeat(80)));
      console.log(chalk.cyan.bold(`  🔍 QUERY: "${text}"`));
      console.log(chalk.cyan.bold('═'.repeat(80)));
      console.log(chalk.dim(`  Total vectors: ${result.totalVectors.toLocaleString()} | Query time: ${result.queryTimeMs}ms`));
      console.log(chalk.dim(`  Results: ${result.matches.length} matches\n`));
      
      if (result.matches.length === 0) {
        console.log(chalk.yellow('  No matches found. Try a different query or lower the score threshold.\n'));
        return;
      }
      
      for (let i = 0; i < result.matches.length; i++) {
        const match = result.matches[i];
        const scoreColor = match.score > 0.8 ? chalk.green : match.score > 0.6 ? chalk.yellow : chalk.red;
        
        console.log(chalk.white.bold(`  ${i + 1}. `) + chalk.blue(match.filePath));
        console.log(chalk.dim(`     Project: ${match.project} | Lines: ${match.startLine}-${match.endLine} | Score: `) + scoreColor(`${(match.score * 100).toFixed(1)}%`));
        
        // Show snippet
        const snippet = match.content.slice(0, 200).replace(/\n/g, ' ').trim();
        console.log(chalk.gray(`     ${snippet}${match.content.length > 200 ? '...' : ''}`));
        console.log();
      }
      
      console.log(chalk.cyan.bold('═'.repeat(80)) + '\n');
      
    } catch (error) {
      spinner.fail('Query failed');
      console.error(chalk.red((error as Error).message));
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
    const spinner = ora('Checking status...').start();
    
    try {
      await bridge.connect();
      
      const bridgeStats = bridge.getStats();
      const storeStats = store.getStats();
      
      spinner.stop();
      
      console.log('\n' + chalk.cyan.bold('═'.repeat(60)));
      console.log(chalk.cyan.bold('  🧠 QANTUM CONTEXT BRIDGE STATUS'));
      console.log(chalk.cyan.bold('═'.repeat(60)));
      
      console.log(chalk.white.bold('\n  📡 Pinecone Connection:'));
      console.log(`     Status: ${bridgeStats.isConnected ? chalk.green('✅ Connected') : chalk.red('❌ Disconnected')}`);
      console.log(`     Index: ${chalk.cyan(bridgeStats.indexName)}`);
      console.log(`     Namespace: ${chalk.cyan(bridgeStats.namespace)}`);
      console.log(`     Total Vectors: ${chalk.yellow(bridgeStats.totalVectors.toLocaleString())}`);
      console.log(`     Dimension: ${chalk.dim(bridgeStats.dimension)}`);
      
      console.log(chalk.white.bold('\n  💾 Persistent Store:'));
      console.log(`     Sessions: ${chalk.yellow(storeStats.sessions)}`);
      console.log(`     Queries: ${chalk.yellow(storeStats.queries)}`);
      console.log(`     Conversations: ${chalk.yellow(storeStats.conversations)}`);
      console.log(`     Knowledge Items: ${chalk.yellow(storeStats.knowledge)}`);
      console.log(`     Cached Embeddings: ${chalk.yellow(storeStats.cachedEmbeddings)}`);
      console.log(`     Database Size: ${chalk.dim((storeStats.dbSizeBytes / 1024).toFixed(1) + ' KB')}`);
      
      console.log(chalk.cyan.bold('\n' + '═'.repeat(60)) + '\n');
      
    } catch (error) {
      spinner.fail('Status check failed');
      console.error(chalk.red((error as Error).message));
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
        console.log(chalk.green(`\n✅ Session created: ${session.sessionId}`));
        console.log(chalk.dim(`   Name: ${options.create}\n`));
        return;
      }
      
      if (options.delete) {
        store.deleteSession(options.delete);
        console.log(chalk.green(`\n✅ Session deleted: ${options.delete}\n`));
        return;
      }
      
      const sessions = store.getAllSessions();
      
      console.log('\n' + chalk.cyan.bold('  📋 SAVED SESSIONS'));
      console.log(chalk.cyan('  ' + '─'.repeat(56)));
      
      if (sessions.length === 0) {
        console.log(chalk.yellow('  No sessions found.\n'));
        return;
      }
      
      for (const session of sessions) {
        const lastUsed = new Date(session.lastAccessedAt).toLocaleString();
        console.log(`  ${chalk.white.bold(session.name)}`);
        console.log(`     ID: ${chalk.dim(session.sessionId)}`);
        console.log(`     Queries: ${chalk.yellow(session.queryHistory.length)} | Last used: ${chalk.dim(lastUsed)}`);
        console.log();
      }
      
    } catch (error) {
      console.error(chalk.red((error as Error).message));
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
        console.log(chalk.green(`\n✅ Knowledge saved: ${category}:${key}\n`));
        return;
      }
      
      if (options.get) {
        const [category, key] = options.get.split(':');
        const value = store.getKnowledge(category, key);
        if (value) {
          console.log(`\n${chalk.cyan(category)}:${chalk.white(key)} = ${chalk.yellow(value)}\n`);
        } else {
          console.log(chalk.yellow('\nNot found.\n'));
        }
        return;
      }
      
      if (options.search) {
        const results = store.searchKnowledge(options.search);
        console.log(`\n${chalk.cyan.bold('  🔍 Knowledge Search Results:')}\n`);
        for (const item of results) {
          console.log(`  ${chalk.cyan(item.category)}:${chalk.white(item.key)} = ${chalk.yellow(item.value)}`);
        }
        console.log();
        return;
      }
      
      if (options.list) {
        const knowledge = store.getKnowledgeByCategory(options.list);
        console.log(`\n${chalk.cyan.bold(`  📚 Knowledge: ${options.list}`)}\n`);
        for (const [key, value] of Object.entries(knowledge)) {
          console.log(`  ${chalk.white(key)}: ${chalk.yellow(value)}`);
        }
        console.log();
        return;
      }
      
      // Default: show all categories
      const stats = store.getStats();
      console.log(`\n${chalk.cyan.bold('  📚 Knowledge Base')}`);
      console.log(`     Total items: ${chalk.yellow(stats.knowledge)}\n`);
      
    } catch (error) {
      console.error(chalk.red((error as Error).message));
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
    const { startServer } = await import('./server.js');
    await startServer();
  });

// ═══════════════════════════════════════════════════════════════════════════════
// HELP FORMATTING
// ═══════════════════════════════════════════════════════════════════════════════

program.addHelpText('before', `
${chalk.cyan.bold('╔═══════════════════════════════════════════════════════════════════════════════╗')}
${chalk.cyan.bold('║                                                                               ║')}
${chalk.cyan.bold('║   🧠 QANTUM CONTEXT BRIDGE CLI                                                ║')}
${chalk.cyan.bold('║   Query 52,573+ vectors from the command line                                 ║')}
${chalk.cyan.bold('║                                                                               ║')}
${chalk.cyan.bold('╚═══════════════════════════════════════════════════════════════════════════════╝')}
`);

program.addHelpText('after', `
${chalk.dim('Examples:')}
  ${chalk.cyan('qbridge query "Ghost Protocol logic"')}           Search for code
  ${chalk.cyan('qbridge query "authentication flow" -n 5')}       Get top 5 results
  ${chalk.cyan('qbridge query "api routes" -p MisteMind')}        Filter by project
  ${chalk.cyan('qbridge status')}                                 Show connection status
  ${chalk.cyan('qbridge sessions --create "My Session"')}         Create a session
  ${chalk.cyan('qbridge serve --port 8899')}                      Start HTTP server
`);

// Parse CLI arguments
program.parse();
