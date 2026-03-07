"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dimitar.papazov@QAntum.dev
 * ═══════════════════════════════════════════════════════════════════════════════
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * QANTUM - Basic Example (FREE Tier)
 *
 * This example shows how to use the FREE features:
 * - audit() - Page accessibility and performance audit
 * - checkLinks() - Find broken links
 * - testAPI() - Test API endpoints
 */
const qantum_1 = __importDefault(require("qantum"));
async function main() {
    console.log('🧠 QANTUM - Basic Example\n');
    // Initialize without license (FREE tier)
    const mm = new qantum_1.default();
    try {
        // 1. Audit a webpage
        console.log('📊 Running audit...');
        const auditResult = await mm.audit('https://example.com');
        console.log('Audit Result:', auditResult);
        console.log('');
        // 2. Check for broken links
        console.log('🔗 Checking links...');
        const linksResult = await mm.checkLinks('https://example.com');
        console.log('Links Result:', linksResult);
        console.log('');
        // 3. Test an API endpoint
        console.log('🌐 Testing API...');
        const apiResult = await mm.testAPI('https://jsonplaceholder.typicode.com/posts/1');
        console.log('API Result:', apiResult);
        console.log('');
        console.log('✅ All FREE features executed successfully!');
        console.log('');
        console.log('💡 Want more? Get PRO features at:');
        console.log('   https://buy.polar.sh/polar_cl_XBbOE1Qr4Vfv9QHRn7exBdaOB9qoC2Wees7zX1yQsOe');
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
}
main();
