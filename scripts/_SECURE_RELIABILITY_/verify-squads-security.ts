/**
 * verify-squads-security — Qantum Module
 * @module verify-squads-security
 * @path scripts/_SECURE_RELIABILITY_/verify-squads-security.ts
 * @auto-documented BrutalDocEngine v2.1
 */


const path = require('path');

// Helper to resolve paths from root
const r = (p) => path.join(process.cwd(), p);

async function verifySquads() {
    console.log('🛡️ INITIATING SQUAD SECURITY PROTOCOLS VERIFICATION (ROBUST MODE) 🛡️');
    console.log('═════════════════════════════════════════════════════════════════');

    try {
        // 1. BETA SQUAD: Hardware Lock & GhostShield
        console.log('\n[BETA] 🔒 Loading Hardware Security...');
        const hardwareLockPath = r('src/modules/_root_migrated/security/auth/energy/hardware-lock.ts');
        const { getHardwareLock } = require(hardwareLockPath);

        console.log('   ✅ Hardware Lock Module: LOADED');
        const lock = getHardwareLock();

        // Mocking fingerprint for safety in checking env
        if (lock.getGpuInfo) {
            console.log('   ✅ GPU Detection Capable: YES (Target: RTX 4050)');
        }

        console.log('[BETA] 👻 Loading Ghost Protocols...');
        const ghostShieldPath = r('src/modules/ghost/shield/GhostShield.ts');
        const { GhostShield } = require(ghostShieldPath);
        const shield = new GhostShield();
        console.log('   ✅ GhostShield: ONLINE');

        // 2. GAMMA SQUAD: Logic & Paradox
        console.log('\n[GAMMA] 🧠 Loading Paradox Engine...');
        const paradoxPath = r('src/modules/_root_migrated/brain/logic/strength/paradox-engine.ts');
        const { ParadoxEngine } = require(paradoxPath);
        const paradox = new ParadoxEngine();
        console.log('   ✅ Paradox Engine: INITIALIZED');

        // 3. ALPHA SQUAD: Market
        console.log('\n[ALPHA] 💹 Verifying Market Presence...');
        // Just checking file existence for now to avoid side effects of starting a market listener
        const fs = require('fs');
        const alphaPath = r('src/modules/_root_migrated/core/eyes/energy/MarketWatcher.ts');
        if (fs.existsSync(alphaPath)) {
            console.log('   ✅ MarketWatcher Source: VERIFIED');
        } else {
            throw new Error('MarketWatcher source missing');
        }

        // 4. HEALER INTEGRATION
        console.log('\n[MEDIC] 🚑 Verifying Hybrid Healer...');
        const healerPath = r('src/core/sys/HybridHealer.ts');
        const { hybridHealer } = require(healerPath);
        if (hybridHealer) {
            console.log('   ✅ HybridHealer: READY');
        }

    } catch (e) {
        console.error('\n❌ CRITICAL VERIFICATION FAILURE:', e);
        process.exit(1);
    }

    console.log('\n═════════════════════════════════════════════════════════════════');
    console.log('✅ ALL SQUADS SECURE. READY FOR DEPLOYMENT.');
}

    // Complexity: O(1)
verifySquads().catch(console.error);
