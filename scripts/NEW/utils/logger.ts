/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  PRIVATE-CORE Logger Utility                                              ║
 * ║  Unified logging interface for all engines                                ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

export const logger = {
    debug: (...args: any[]) => console.log('[DEBUG]', ...args),
    info: (...args: any[]) => console.log('[INFO]', ...args),
    warn: (...args: any[]) => console.warn('[WARN]', ...args),
    error: (...args: any[]) => console.error('[ERROR]', ...args),
};

export default logger;
