/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   ETERNAL WATCHDOG - Zero Entropy Enforcer                                    ║
 * ║   "Automated Self-Healing & Debris Annihilation"                              ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                      ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { apoptosis } from './ApoptosisModule';

export interface WatchdogConfig {
    /** Directories to actively scan and purge */
    targetDirectories: string[];

    /** Maximum age of files in milliseconds before they are considered debris */
    maxAgeMs: number;

    /** Interval to run the watchdog (ms) */
    scanIntervalMs: number;

    /** Run immediately on startup */
    runOnStartup: boolean;
}

export class EternalWatchdog {
    private static instance: EternalWatchdog;
    private config: WatchdogConfig;
    private isRunning: boolean = false;
    private intervalTimer: NodeJS.Timeout | null = null;

    // Complexity: O(1)
    private constructor() {
        this.config = {
            targetDirectories: [
                path.join(process.cwd(), 'data/purge-backup'),
                path.join(process.cwd(), '.tmp'),
                path.join(process.cwd(), '.apoptosis/graveyard'),
                path.join(process.cwd(), 'logs/old')
            ],
            // Default max age: 24 hours (86,400,000 ms)
            // But for Zero Entropy, we can set it to a strict 1 hour: 3,600,000 ms
            maxAgeMs: 3600000,
            scanIntervalMs: 600000, // Every 10 minutes
            runOnStartup: true
        };
    }

    public static getInstance(): EternalWatchdog {
        if (!EternalWatchdog.instance) {
            EternalWatchdog.instance = new EternalWatchdog();
        }
        return EternalWatchdog.instance;
    }

    public configure(configOverrides: Partial<WatchdogConfig>): void {
        this.config = { ...this.config, ...configOverrides };
    }

    // Complexity: O(1) start operation
    public start(): void {
        if (this.isRunning) return;

        console.log('👁️ [ETERNAL WATCHDOG] Awakened. Zero Entropy Enforcement Active.');
        this.isRunning = true;

        if (this.config.runOnStartup) {
            this.executePurge()
                .catch(err => console.error('👁️ [ETERNAL WATCHDOG] Error on startup purge:', err));
        }

        this.intervalTimer = setInterval(() => {
            this.executePurge()
                .catch(err => console.error('👁️ [ETERNAL WATCHDOG] Error during purge cycle:', err));
        }, this.config.scanIntervalMs);
    }

    public stop(): void {
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
            this.intervalTimer = null;
        }
        this.isRunning = false;
        console.log('👁️ [ETERNAL WATCHDOG] Slumbering.');
    }

    // Complexity: O(D * F) where D is directories, F is files per directory
    public async executePurge(): Promise<void> {
        console.log(`\n👁️ [ETERNAL WATCHDOG] Scanning for debris across ${this.config.targetDirectories.length} domains...`);
        let totalDeleted = 0;
        let totalBytesFreed = 0;
        const now = Date.now();

        for (const dir of this.config.targetDirectories) {
            try {
                // Check if directory exists
                await fs.access(dir);

                const stats = await this.purgeDirectory(dir, now);
                totalDeleted += stats.deleted;
                totalBytesFreed += stats.freedBytes;
            } catch (err: any) {
                // If directory doesn't exist, just skip
                if (err.code !== 'ENOENT') {
                    console.warn(`👁️ [ETERNAL WATCHDOG] Failed to access ${dir}: ${err.message}`);
                }
            }
        }

        if (totalDeleted > 0) {
            console.log(`👁️ [ETERNAL WATCHDOG] Purge Complete. Eradicated ${totalDeleted} files.`);
            console.log(`👁️ [ETERNAL WATCHDOG] Reclaimed Entropy Space: ${(totalBytesFreed / 1024 / 1024).toFixed(2)} MB`);

            // Advance apoptosis cycle as a self-healing systemic interaction
            try {
                apoptosis.advanceCycle();
            } catch (e) {
                // Ignore if apoptosis fails
            }
        } else {
            console.log('👁️ [ETERNAL WATCHDOG] No debris found. System is in perfect Zero Entropy equilibrium.');
        }
    }

    // Recursively purge directory
    private async purgeDirectory(dir: string, now: number): Promise<{ deleted: number, freedBytes: number }> {
        let deleted = 0;
        let freedBytes = 0;

        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    const subStats = await this.purgeDirectory(fullPath, now);
                    deleted += subStats.deleted;
                    freedBytes += subStats.freedBytes;

                    // Try to remove directory if it is now empty
                    try {
                        const remaining = await fs.readdir(fullPath);
                        if (remaining.length === 0) {
                            await fs.rmdir(fullPath);
                        }
                    } catch (e) { }

                } else {
                    // SAFETY: async operation — wrap in try-catch for production resilience
                    const stats = await fs.stat(fullPath);
                    const ageMs = now - stats.mtimeMs;

                    if (ageMs > this.config.maxAgeMs) {
                        // SAFETY: async operation — wrap in try-catch for production resilience
                        await fs.unlink(fullPath);
                        deleted++;
                        freedBytes += stats.size;
                    }
                }
            }
        } catch (error) {
            // Error handling for locked files
        }

        return { deleted, freedBytes };
    }
}

export const eternalWatchdog = EternalWatchdog.getInstance();
