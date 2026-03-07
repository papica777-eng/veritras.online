/**
 * debug-self-reinvestment — Qantum Module
 * @module debug-self-reinvestment
 * @path scripts/_SELF_IMPROVEMENT_/debug-self-reinvestment.ts
 * @auto-documented BrutalDocEngine v2.1
 */


import * as fs from 'fs';
import * as path from 'path';

// Path to the failing module
const modulePath = path.resolve('src/modules/_root_migrated/core/mouth/energy/SelfReinvestment.ts');

if (fs.existsSync(modulePath)) {
    console.log(`✅ Module found at: ${modulePath}`);
    try {
        // Attempt to read the file content to verify readability
        const content = fs.readFileSync(modulePath, 'utf8');
        console.log(`✅ File content read successfully (${content.length} bytes).`);
    } catch (e) {
        console.error(`❌ Failed to read file content: ${e.message}`);
    }
} else {
    console.error(`❌ Module NOT found at: ${modulePath}`);
}
