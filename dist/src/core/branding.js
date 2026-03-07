"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⚛️ QANTUM BRANDING - Single Source of Truth for Identity
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This file is the CENTRAL authority for all branding elements.
 * Any change here propagates to the entire system.
 *
 * @author dp
 * @organization QAntum Labs
 * @version 1.0.0-QANTUM-PRIME
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.styled = exports.COLORS = exports.QANTUM_FOOTER = exports.QANTUM_BANNER = exports.QANTUM_LOGO_COMPACT = exports.QANTUM_LOGO = exports.AUTHOR_LOGO_INLINE = exports.AUTHOR_LOGO_MINIMAL = exports.AUTHOR_LOGO = exports.QANTUM_IDENTITY = void 0;
exports.printBanner = printBanner;
exports.printHeader = printHeader;
exports.printFooter = printFooter;
exports.getVersionString = getVersionString;
exports.getCopyright = getCopyright;
const logger_1 = require("../api/unified/utils/logger");
exports.QANTUM_IDENTITY = {
    name: 'QAntum',
    version: '1.0.0',
    tagline: 'The Autonomous QA Agent - Beyond Classical Testing',
    author: {
        name: 'dp',
        organization: 'QAntum Labs',
        year: 2025
    }
};
/**
 * ┌──────────────────────────────────────┐
 * │                                      │
 * │            ╭──────────╮              │
 * │            │    dp    │              │
 * │            ╰──────────╯              │
 * │                                      │
 * │         qantum labs © 2025           │
 * └──────────────────────────────────────┘
 */
exports.AUTHOR_LOGO = `
┌──────────────────────────────────────┐
│                                      │
│            ╭──────────╮              │
│            │    dp    │              │
│            ╰──────────╯              │
│                                      │
│         qantum labs © 2025           │
└──────────────────────────────────────┘
`;
exports.AUTHOR_LOGO_MINIMAL = `  dp  `;
exports.AUTHOR_LOGO_INLINE = `[ dp ] qantum labs`;
/**
 * Primary QAntum ASCII Art Logo
 */
exports.QANTUM_LOGO = `
    ██████╗  █████╗ ███╗   ██╗████████╗██╗   ██╗███╗   ███╗
   ██╔═══██╗██╔══██╗████╗  ██║╚══██╔══╝██║   ██║████╗ ████║
   ██║   ██║███████║██╔██╗ ██║   ██║   ██║   ██║██╔████╔██║
   ██║▄▄ ██║██╔══██║██║╚██╗██║   ██║   ██║   ██║██║╚██╔╝██║
   ╚██████╔╝██║  ██║██║ ╚████║   ██║   ╚██████╔╝██║ ╚═╝ ██║
    ╚══▀▀═╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝
`;
/**
 * Compact QAntum Logo
 */
exports.QANTUM_LOGO_COMPACT = `
 ╔═══════════════════════════════════════════════╗
 ║  ⚛️  QAntum v${exports.QANTUM_IDENTITY.version.padEnd(6)}                        ║
 ║  The Autonomous QA Agent                      ║
 ╚═══════════════════════════════════════════════╝
`;
/**
 * Full banner with author branding
 */
exports.QANTUM_BANNER = `
═══════════════════════════════════════════════════════════════════════════════

    ██████╗  █████╗ ███╗   ██╗████████╗██╗   ██╗███╗   ███╗
   ██╔═══██╗██╔══██╗████╗  ██║╚══██╔══╝██║   ██║████╗ ████║
   ██║   ██║███████║██╔██╗ ██║   ██║   ██║   ██║██╔████╔██║
   ██║▄▄ ██║██╔══██║██║╚██╗██║   ██║   ██║   ██║██║╚██╔╝██║
   ╚██████╔╝██║  ██║██║ ╚████║   ██║   ╚██████╔╝██║ ╚═╝ ██║
    ╚══▀▀═╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝

                     ⚛️ VERSION ${exports.QANTUM_IDENTITY.version} ⚛️
           "${exports.QANTUM_IDENTITY.tagline}"

═══════════════════════════════════════════════════════════════════════════════
                            ╭──────────╮
                            │    dp    │
                            ╰──────────╯
                       qantum labs © ${exports.QANTUM_IDENTITY.author.year}
═══════════════════════════════════════════════════════════════════════════════
`;
/**
 * Footer with minimal branding
 */
exports.QANTUM_FOOTER = `
───────────────────────────────────────────────────────────────────────────────
  ⚛️ QAntum v${exports.QANTUM_IDENTITY.version}  │  ${exports.QANTUM_IDENTITY.tagline}  │  [ dp ] qantum labs
───────────────────────────────────────────────────────────────────────────────
`;
/**
 * Print the full banner to console
 */
function printBanner() {
    logger_1.logger.debug(exports.QANTUM_BANNER);
}
/**
 * Print compact header
 */
function printHeader() {
    logger_1.logger.debug(exports.QANTUM_LOGO_COMPACT);
}
/**
 * Print footer
 */
function printFooter() {
    logger_1.logger.debug(exports.QANTUM_FOOTER);
}
/**
 * Get version string with branding
 */
function getVersionString() {
    return `⚛️ QAntum v${exports.QANTUM_IDENTITY.version} by dp`;
}
/**
 * Get copyright string
 */
function getCopyright() {
    return `© ${exports.QANTUM_IDENTITY.author.year} ${exports.QANTUM_IDENTITY.author.organization}`;
}
/**
 * Color codes for terminal output
 */
exports.COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    // Brand colors
    primary: '\x1b[38;5;99m', // Purple/Indigo
    accent: '\x1b[38;5;141m', // Light purple
    success: '\x1b[38;5;82m', // Green
    warning: '\x1b[38;5;220m', // Yellow
    error: '\x1b[38;5;196m', // Red
    info: '\x1b[38;5;39m', // Blue
    // Grayscale
    white: '\x1b[37m',
    gray: '\x1b[90m',
};
/**
 * Styled console output
 */
exports.styled = {
    brand: (text) => `${exports.COLORS.primary}${exports.COLORS.bright}${text}${exports.COLORS.reset}`,
    success: (text) => `${exports.COLORS.success}✓ ${text}${exports.COLORS.reset}`,
    error: (text) => `${exports.COLORS.error}✗ ${text}${exports.COLORS.reset}`,
    warning: (text) => `${exports.COLORS.warning}⚠ ${text}${exports.COLORS.reset}`,
    info: (text) => `${exports.COLORS.info}ℹ ${text}${exports.COLORS.reset}`,
    dim: (text) => `${exports.COLORS.dim}${text}${exports.COLORS.reset}`,
};
exports.default = {
    QANTUM_IDENTITY: exports.QANTUM_IDENTITY,
    QANTUM_LOGO: exports.QANTUM_LOGO,
    QANTUM_BANNER: exports.QANTUM_BANNER,
    QANTUM_FOOTER: exports.QANTUM_FOOTER,
    AUTHOR_LOGO: exports.AUTHOR_LOGO,
    AUTHOR_LOGO_MINIMAL: exports.AUTHOR_LOGO_MINIMAL,
    AUTHOR_LOGO_INLINE: exports.AUTHOR_LOGO_INLINE,
    COLORS: exports.COLORS,
    styled: exports.styled,
    printBanner,
    printHeader,
    printFooter,
    getVersionString,
    getCopyright,
};
