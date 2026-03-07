/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⚛️ QANTUM DOMAIN BRIDGE UPDATER
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Specialized script for replacing local development hostnames with the production
 * live domain across the entire project. Uses the safe MassRefactor engine.
 * 
 * Transformations:
 * - http://localhost:PORT -> https://qantum.site
 * - ws://localhost:PORT   -> wss://qantum.site
 * - localhost:PORT        -> qantum.site
 * 
 * Usage:
 *   node tools/update-domain.js --dry-run          Preview changes
 *   node tools/update-domain.js --execute          Apply changes
 * 
 * @author dp | QAntum Labs
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const { MassRefactor } = require('./mass-refactor.js');

const DOMAIN_CONFIG = {
    newHttpDomain: 'https://qantum.site',
    newWsDomain: 'wss://qantum.site',
    newRawDomain: 'qantum.site'
};

function main() {
    const args = process.argv.slice(2);
    const isExecute = args.includes('--execute');
    const isVerbose = args.includes('--verbose') || args.includes('-v');

    console.log(`
    ⚛️ QANTUM DOMAIN BRIDGE UPDATER
    ════════════════════════════════════════
    Mode: ${isExecute ? '🔧 EXECUTE' : '👁️ DRY RUN'}
    `);

    const refactor = new MassRefactor({
        dryRun: !isExecute,
        verbose: isVerbose,
        backup: true,
        verify: false // We don't want to run heavy type-checks during dry-run mappings
    });

    // ───────────────────────────────────────────────────────────────────────────
    // HTTP/HTTPS Links
    // ───────────────────────────────────────────────────────────────────────────
    refactor.addRule(
        /https?:\/\/localhost:\d+/g,
        DOMAIN_CONFIG.newHttpDomain,
        { description: 'Update HTTP localhost ports to production HTTPS domain' }
    );

    // ───────────────────────────────────────────────────────────────────────────
    // WebSocket Links
    // ───────────────────────────────────────────────────────────────────────────
    refactor.addRule(
        /ws:\/\/localhost:\d+/g,
        DOMAIN_CONFIG.newWsDomain,
        { description: 'Update WebSocket localhost ports to production WSS domain' }
    );

    // ───────────────────────────────────────────────────────────────────────────
    // Raw Localhost strings
    // ───────────────────────────────────────────────────────────────────────────
    refactor.addRule(
        /localhost:\d+/g,
        DOMAIN_CONFIG.newRawDomain,
        { description: 'Update raw localhost bindings to production domain' }
    );

    // ───────────────────────────────────────────────────────────────────────────
    // Execute pipeline
    // ───────────────────────────────────────────────────────────────────────────
    refactor
        .scan()
        .report()
        .execute()
        .summary();
}

main();
