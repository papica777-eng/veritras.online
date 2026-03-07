/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⚛️ QANTUM LOGO UPDATER
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Specialized script for updating logo references across the entire project.
 * 
 * What it finds:
 * - SystemLogo properties
 * - Logo file paths (SVG, PNG, ICO)
 * - CSS classes with "logo" 
 * - HTML img tags with logo
 * - Brand-related strings
 * 
 * Usage:
 *   node tools/update-logo.js --dry-run          Preview changes
 *   node tools/update-logo.js --execute          Apply changes
 * 
 * @author dp | QAntum Labs
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const { MassRefactor } = require('./mass-refactor.js');

// ═══════════════════════════════════════════════════════════════════════════════
// LOGO UPDATE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const LOGO_CONFIG = {
    // New logo paths
    newLogoSvg: 'assets/brand/qantum-logo.svg',
    newLogoFull: 'assets/brand/qantum-logo-full.svg',
    newLogoPng: 'assets/brand/qantum-logo.png',
    newFavicon: 'assets/brand/favicon.ico',
    
    // New CSS class prefix
    newCssClass: 'qantum-logo',
    
    // New alt text
    newAltText: 'QAntum - The Autonomous QA Agent'
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

function main() {
    const args = process.argv.slice(2);
    const isExecute = args.includes('--execute');
    const isVerbose = args.includes('--verbose') || args.includes('-v');
    
    console.log(`
    ⚛️ QANTUM LOGO UPDATER
    ════════════════════════════════════════
    Mode: ${isExecute ? '🔧 EXECUTE' : '👁️ DRY RUN'}
    `);
    
    const refactor = new MassRefactor({
        dryRun: !isExecute,
        verbose: isVerbose,
        backup: true,
        verify: true
    });
    
    // ───────────────────────────────────────────────────────────────────────────
    // SystemLogo property patterns
    // ───────────────────────────────────────────────────────────────────────────
    
    refactor.addRule(
        /SystemLogo\s*:\s*['"].*?['"]/g,
        `SystemLogo: '${LOGO_CONFIG.newLogoSvg}'`,
        { description: 'Update SystemLogo property' }
    );
    
    refactor.addRule(
        /logoPath\s*:\s*['"].*?['"]/g,
        `logoPath: '${LOGO_CONFIG.newLogoSvg}'`,
        { description: 'Update logoPath property' }
    );
    
    // ───────────────────────────────────────────────────────────────────────────
    // SVG/PNG file references
    // ───────────────────────────────────────────────────────────────────────────
    
    refactor.addRule(
        /['"].*?(?:logo|brand).*?\.svg['"]/gi,
        `'${LOGO_CONFIG.newLogoSvg}'`,
        { description: 'Update SVG logo paths' }
    );
    
    refactor.addRule(
        /['"].*?(?:logo|brand).*?\.png['"]/gi,
        `'${LOGO_CONFIG.newLogoPng}'`,
        { description: 'Update PNG logo paths' }
    );
    
    // ───────────────────────────────────────────────────────────────────────────
    // CSS classes
    // ───────────────────────────────────────────────────────────────────────────
    
    refactor.addRule(
        /class\s*=\s*["'][^"']*\b(?:old-logo|main-logo|brand-logo|app-logo)\b[^"']*["']/gi,
        `class="${LOGO_CONFIG.newCssClass}"`,
        { description: 'Update CSS logo classes', extensions: ['.html', '.tsx', '.jsx'] }
    );
    
    refactor.addRule(
        /\.(?:old-logo|main-logo|brand-logo|app-logo)\b/g,
        `.${LOGO_CONFIG.newCssClass}`,
        { description: 'Update CSS selectors', extensions: ['.css', '.scss', '.less'] }
    );
    
    // ───────────────────────────────────────────────────────────────────────────
    // HTML img tags
    // ───────────────────────────────────────────────────────────────────────────
    
    refactor.addRule(
        /alt\s*=\s*["'][^"']*(?:logo|Logo|LOGO)[^"']*["']/gi,
        `alt="${LOGO_CONFIG.newAltText}"`,
        { description: 'Update logo alt text', extensions: ['.html', '.tsx', '.jsx', '.md'] }
    );
    
    // ───────────────────────────────────────────────────────────────────────────
    // Favicon
    // ───────────────────────────────────────────────────────────────────────────
    
    refactor.addRule(
        /href\s*=\s*["'][^"']*favicon[^"']*\.ico["']/gi,
        `href="${LOGO_CONFIG.newFavicon}"`,
        { description: 'Update favicon path', extensions: ['.html'] }
    );
    
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
