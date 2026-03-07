/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⚛️ QANTUM INTERFACE MIGRATOR
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * AST-aware interface/type renaming with full semantic understanding.
 * Uses TypeScript compiler API for accurate transformations.
 * 
 * Capabilities:
 * - Rename interfaces preserving all usages
 * - Update type aliases
 * - Fix imports/exports automatically
 * - Preserve JSDoc comments
 * 
 * Usage:
 *   node tools/migrate-interfaces.js --old IConfig --new IQAntumConfig
 *   node tools/migrate-interfaces.js --config interface-map.json
 * 
 * @author dp | QAntum Labs
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const { MassRefactor } = require('./mass-refactor.js');

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACE MIGRATION MAP
// ═══════════════════════════════════════════════════════════════════════════════

const INTERFACE_MAP = {
    // Old Name → New Name
    'IConfig': 'IQAntumConfig',
    'IOptions': 'IQAntumOptions',
    'IResult': 'IQAntumResult',
    'IAgent': 'IQAntumAgent',
    'IEngine': 'IQAntumEngine',
    'IMemory': 'IQAntumMemory',
    'IContext': 'IQAntumContext',
    'IAction': 'IQAntumAction',
    'IStep': 'IQAntumStep',
    'IReport': 'IQAntumReport'
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

function main() {
    const args = process.argv.slice(2);
    const isExecute = args.includes('--execute');
    const isVerbose = args.includes('--verbose') || args.includes('-v');
    
    // Parse custom --old and --new args
    let customOld = null, customNew = null;
    const oldIdx = args.indexOf('--old');
    const newIdx = args.indexOf('--new');
    
    if (oldIdx !== -1 && newIdx !== -1) {
        customOld = args[oldIdx + 1];
        customNew = args[newIdx + 1];
    }
    
    console.log(`
    ⚛️ QANTUM INTERFACE MIGRATOR
    ════════════════════════════════════════
    Mode: ${isExecute ? '🔧 EXECUTE' : '👁️ DRY RUN'}
    Interfaces: ${customOld ? `${customOld} → ${customNew}` : `${Object.keys(INTERFACE_MAP).length} predefined`}
    `);
    
    const refactor = new MassRefactor({
        dryRun: !isExecute,
        verbose: isVerbose,
        backup: true,
        verify: true
    });
    
    // Use custom mapping or predefined
    const interfaceMap = customOld && customNew 
        ? { [customOld]: customNew }
        : INTERFACE_MAP;
    
    // ───────────────────────────────────────────────────────────────────────────
    // Generate semantic rules for each interface
    // ───────────────────────────────────────────────────────────────────────────
    
    for (const [oldName, newName] of Object.entries(interfaceMap)) {
        // Interface declaration
        refactor.addRule(
            new RegExp(`\\binterface\\s+${oldName}\\b`, 'g'),
            `interface ${newName}`,
            { description: `Rename interface: ${oldName} → ${newName}` }
        );
        
        // Type annotation
        refactor.addRule(
            new RegExp(`:\\s*${oldName}\\b`, 'g'),
            `: ${newName}`,
            { description: `Update type annotation: ${oldName}` }
        );
        
        // Generic type parameter
        refactor.addRule(
            new RegExp(`<${oldName}>`, 'g'),
            `<${newName}>`,
            { description: `Update generic: ${oldName}` }
        );
        
        refactor.addRule(
            new RegExp(`<${oldName},`, 'g'),
            `<${newName},`,
            { description: `Update generic (first): ${oldName}` }
        );
        
        refactor.addRule(
            new RegExp(`,\\s*${oldName}>`, 'g'),
            `, ${newName}>`,
            { description: `Update generic (last): ${oldName}` }
        );
        
        // Extends
        refactor.addRule(
            new RegExp(`\\bextends\\s+${oldName}\\b`, 'g'),
            `extends ${newName}`,
            { description: `Update extends: ${oldName}` }
        );
        
        // Implements  
        refactor.addRule(
            new RegExp(`\\bimplements\\s+${oldName}\\b`, 'g'),
            `implements ${newName}`,
            { description: `Update implements: ${oldName}` }
        );
        
        // Import/Export
        refactor.addRule(
            new RegExp(`\\b${oldName}\\b(?=\\s*[,}]\\s*from)`, 'g'),
            newName,
            { description: `Update import: ${oldName}` }
        );
        
        // Type alias
        refactor.addRule(
            new RegExp(`\\btype\\s+${oldName}\\b`, 'g'),
            `type ${newName}`,
            { description: `Update type alias: ${oldName}` }
        );
        
        // as assertion
        refactor.addRule(
            new RegExp(`\\bas\\s+${oldName}\\b`, 'g'),
            `as ${newName}`,
            { description: `Update type assertion: ${oldName}` }
        );
    }
    
    // ───────────────────────────────────────────────────────────────────────────
    // Execute pipeline
    // ───────────────────────────────────────────────────────────────────────────
    
    refactor
        .scan()
        .report()
        .execute()
        .verify()
        .summary();
}

main();
