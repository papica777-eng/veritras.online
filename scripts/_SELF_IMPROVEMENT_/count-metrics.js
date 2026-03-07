/**
 * count-metrics — Qantum Module
 * @module count-metrics
 * @path scripts/_SELF_IMPROVEMENT_/count-metrics.js
 * @auto-documented BrutalDocEngine v2.1
 */

const fs = require('fs');
const path = require('path');

const mapPath = path.join(process.cwd(), 'mega-map.json');

if (!fs.existsSync(mapPath)) {
    console.error('❌ mega-map.json not found');
    process.exit(1);
}

const modules = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
const totalLoc = modules.reduce((sum, m) => sum + (m.loc || 0), 0);

console.log('------------------------------------------------');
console.log(`📦 TOTAL MODULES: ${modules.length}`);
console.log(`📝 TOTAL LOC:     ${totalLoc.toLocaleString()}`);
console.log('------------------------------------------------');
console.log('Breakdown by Type:');

const byType = {};
modules.forEach(m => {
    byType[m.type] = (byType[m.type] || 0) + 1;
});

Object.keys(byType).forEach(type => {
    console.log(`  - ${type}: ${byType[type]}`);
});
console.log('------------------------------------------------');
