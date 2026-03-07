/**
 * SovereignEconomy — Qantum Module
 * @module SovereignEconomy
 * @path scripts/core/SovereignEconomy.ts
 * @auto-documented BrutalDocEngine v2.1
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * 🏛️ SOVEREIGN ECONOMY ENGINE
 * 
 * Calculates the intrinsic value of the QAntum organism based on Logic Assets.
 * "Structure is Capital."
 */

export interface LogicAsset {
    name: string;
    type: 'Engine' | 'Module' | 'Script' | 'Fragment';
    complexityScore: number;
    estimatedValue: number;
    path: string;
}

export class SovereignEconomy {
    private assets: LogicAsset[] = [];
    private registryPath = path.join(process.cwd(), 'data', 'sovereign-economy.json');

    constructor() {
        this.ensureDataDir();
    }

    // Complexity: O(1)
    private ensureDataDir() {
        const dir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    }

    /**
     * Scan for logic assets and calculate value
     */
    // Complexity: O(N) — linear iteration
    public async manifestEconomy() {
        this.assets = [];
        const root = process.cwd();

        // Scan scripts, soul, and new src assets
        this.scanDirectory(path.join(root, 'scripts'));
        this.scanDirectory(path.join(root, 'soul'));
        this.scanDirectory(path.join(root, 'src'));

        const codeValue = this.assets.reduce((acc, asset) => acc + asset.estimatedValue, 0);

        // --- NEW: KNOWLEDGE EQUITY ---
        let knowledgeValue = 0;
        const backpackPath = path.join(process.cwd(), 'storage', 'backpack.json');
        if (fs.existsSync(backpackPath)) {
            const backpack = JSON.parse(fs.readFileSync(backpackPath, 'utf-8'));
            // Each unit of assimilated knowledge is worth $5,000
            knowledgeValue = (backpack.messages?.length || 0) * 5000;
        }

        // --- NEW: LIQUID EQUITY (REAL REVENUE) ---
        let liquidRevenue = 0;
        const treasuryPath = path.join(process.cwd(), 'data', 'treasury.json');
        if (fs.existsSync(treasuryPath)) {
            const treasury = JSON.parse(fs.readFileSync(treasuryPath, 'utf-8'));
            liquidRevenue = (treasury.totalLiquidRevenue || 0) * 1000; // Multiplier: Real revenue reflects 1000x of market validation
        }

        const totalValue = codeValue + knowledgeValue + liquidRevenue;

        const report = {
            timestamp: new Date().toISOString(),
            totalSovereignWealth: totalValue,
            codeEquity: codeValue,
            knowledgeEquity: knowledgeValue,
            liquidEquity: liquidRevenue,
            assetCount: this.assets.length,
            portfolio: this.assets,
            metrics: {
                logicDensity: (codeValue / this.assets.length || 0).toFixed(2),
                entropyResistance: 0.99
            }
        };



        fs.writeFileSync(this.registryPath, JSON.stringify(report, null, 2));
        return report;
    }

    // Complexity: O(N) — linear iteration
    private scanDirectory(dir: string) {
        if (!fs.existsSync(dir)) return;

        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                this.scanDirectory(fullPath);
            } else if (item.endsWith('.ts') || item.endsWith('.soul') || item.endsWith('.rs')) {
                const asset = this.evaluateFile(fullPath, item);
                if (asset) this.assets.push(asset);
            }
        }
    }

    // Complexity: O(1) — amortized
    private evaluateFile(fullPath: string, name: string): LogicAsset | null {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n').length;

        let type: LogicAsset['type'] = 'Script';
        if (name.endsWith('.soul')) type = 'Fragment';
        else if (content.includes('class') || content.includes('export class')) type = 'Engine';
        else if (fullPath.includes('SaaS') || fullPath.includes('Module')) type = 'Module';

        // Valuation Logic: $100 per line of logic + Complexity Multiplier
        let complexityMultiplier = 1.0;
        if (content.includes('Complexity: O(1)') || content.includes('O(log n)')) complexityMultiplier = 2.5;
        if (content.includes('Singularity') || content.includes('Vortex')) complexityMultiplier = 5.0;

        const value = lines * 100 * complexityMultiplier;

        return {
            name,
            type,
            complexityScore: lines,
            estimatedValue: value,
            path: path.relative(process.cwd(), fullPath)
        };
    }
}

// Auto-run if executed directly
if (require.main === module) {
    const economy = new SovereignEconomy();
    economy.manifestEconomy().then(report => {
        console.log(`/// ECONOMY_MANIFESTED: $${report.totalSovereignWealth.toLocaleString()} SOVEREIGN_TOTAL ///`);
    });
}
