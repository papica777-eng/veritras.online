/**
 * Logger — Qantum Module
 * @module Logger
 * @path omni_core/telemetry/Logger.ts
 * @auto-documented BrutalDocEngine v2.1
 */

export class Logger {
    private static instance: Logger;

    private constructor() { }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    // Complexity: O(1) — hash/map lookup
    public debug(context: string, message: string, ...args: any[]): void {
        console.debug(`[DEBUG][${context}] ${message}`, ...args);
    }

    // Complexity: O(1) — hash/map lookup
    public info(context: string, message: string, ...args: any[]): void {
        console.info(`[INFO][${context}] ${message}`, ...args);
    }

    // Complexity: O(1) — hash/map lookup
    public warn(context: string, message: string, ...args: any[]): void {
        console.warn(`[WARN][${context}] ${message}`, ...args);
    }

    // Complexity: O(1) — hash/map lookup
    public error(context: string, message: string, error?: any): void {
        console.error(`[ERROR][${context}] ${message}`, error);
    }
}
