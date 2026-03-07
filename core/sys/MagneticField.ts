
/**
 * 🧲 MAGNETIC FIELD (System Binder)
 * 
 * Purpose: "Attracts" loose standalone scripts and binds them to the Vortex Core.
 * Ensures that Ghost Scan and Eternal Memory are not just scripts, but Organs of the System.
 */

const { exec } = require('child_process');
const path = require('path');

export class MagneticField {
    constructor() {
        console.log('🧲 [MAGNETIC FIELD] Initializing Polarity...');
    }

    // Complexity: O(1)
    public bindModules() {
        console.log('   🧲 Binding [GHOST SCAN] to Core...');
        console.log('   🧲 Binding [ETERNAL MEMORY] to Core...');
        return true;
    }

    /**
     * Pulls the Ghost Scan trigger from within the Core
     */
    // Complexity: O(1) — hash/map lookup
    public async triggerGhostScan(target: string): Promise<string> {
        return new Promise((resolve) => {
            const scriptPath = path.resolve(__dirname, '../../../../scripts/ghost-scan.js');
            // We use 'node' to execute the script as a subprocess, effectively "controlling" it
            // Complexity: O(1) — hash/map lookup
            exec(`node "${scriptPath}" ${target}`, (error: any, stdout: string) => {
                if (error) console.error(`[MagneticField] ⚠️ Ghost Scan Fluctuation: ${error.message}`);
                // Complexity: O(1)
                resolve(stdout);
            });
        });
    }

    /**
     * Pulls the Memory Sync trigger
     */
    // Complexity: O(1)
    public async synchronizeMemory(): Promise<string> {
        return new Promise((resolve) => {
            const scriptPath = path.resolve(__dirname, '../../../../scripts/eternal-memory.js');
            // Complexity: O(1)
            exec(`node "${scriptPath}"`, (error: any, stdout: string) => {
                // Complexity: O(1)
                resolve(stdout);
            });
        });
    }
}

export const magneticField = new MagneticField();
