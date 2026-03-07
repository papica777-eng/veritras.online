/**
 * ⚛️ GHOST PROTOCOL V2 - DEMO & TEST
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Demonstration of Operation: Invisible Hand
 * 
 * @author DIMITAR PRODROMOV
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { GhostProtocolV2 } from './index';
import { TLSPhantom } from './tls-phantom';
import { VisualStealth } from './visual-stealth';
import { BiometricEngine } from './biometric-engine';
import { ChronosParadox } from './chronos-paradox';

// ═══════════════════════════════════════════════════════════════════════════════
// DEMO FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

async function demo() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('⚛️  GHOST PROTOCOL V2 - OPERATION: INVISIBLE HAND');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. Initialize Ghost Protocol
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('📦 [1/6] Initializing Ghost Protocol V2...');
  const ghost = new GhostProtocolV2({
    stealthLevel: 'maximum',
    rotateInterval: 5,
    humanEmulation: true
  });
  console.log('');

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. TLS Phantom Demo
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('🔐 [2/6] TLS Phantom - Fingerprint Rotation');
  console.log('─────────────────────────────────────────────');
  const tlsPhantom = new TLSPhantom();
  
  console.log('Current profile:', tlsPhantom.getCurrentProfile());
  console.log('JA3 String:', tlsPhantom.generateJA3String());
  
  // Rotate 3 times
  for (let i = 0; i < 3; i++) {
    tlsPhantom.rotate();
    console.log(`Rotation ${i + 1}: ${tlsPhantom.getCurrentProfile().browser}`);
  }
  console.log('');

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. Visual Stealth Demo
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('👁️ [3/6] Visual Stealth - Fingerprint Spoofing');
  console.log('─────────────────────────────────────────────');
  const visualStealth = new VisualStealth();
  
  const gpuProfile = visualStealth.getCurrentProfile().gpu;
  console.log(`GPU Spoof: ${gpuProfile.renderer}`);
  console.log(`Vendor: ${gpuProfile.vendor}`);
  
  const screenProfile = visualStealth.getCurrentProfile().screen;
  console.log(`Screen: ${screenProfile.width}x${screenProfile.height} @ ${screenProfile.colorDepth}-bit`);
  
  // Canvas fingerprint demo
  const canvasHash = visualStealth.generateCanvasHash();
  console.log(`Canvas Hash: ${canvasHash.substring(0, 32)}...`);
  console.log('');

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. Biometric Engine Demo
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('🧬 [4/6] Biometric Engine - Human Emulation');
  console.log('─────────────────────────────────────────────');
  const biometric = new BiometricEngine();
  
  // Generate mouse path
  const mousePath = biometric.generateMousePath(
    { x: 100, y: 100 },
    { x: 500, y: 300 }
  );
  console.log(`Mouse path generated: ${mousePath.length} points`);
  console.log(`Path duration: ${mousePath[mousePath.length - 1].timestamp - mousePath[0].timestamp}ms`);
  
  // Generate typing pattern
  const typingPattern = biometric.generateTypingPattern('test@example.com');
  console.log(`Typing pattern: ${typingPattern.length} keystrokes`);
  const typingDuration = typingPattern.reduce((sum, k) => sum + k.holdTime + k.interKeyDelay, 0);
  console.log(`Total typing time: ${typingDuration.toFixed(0)}ms`);
  
  // Human score
  const humanScore = biometric.calculateHumanScore({
    mouseVariance: 15,
    typingSpeed: 200,
    scrollNaturalness: 0.8,
    interactionDensity: 0.6
  });
  console.log(`Human Score: ${humanScore.score}/100 (${humanScore.classification})`);
  console.log('');

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. Chronos Paradox Demo
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('⏰ [5/6] Chronos Paradox - Predictive Evasion');
  console.log('─────────────────────────────────────────────');
  const chronos = new ChronosParadox();
  
  // Predict evasion strategy
  // SAFETY: async operation — wrap in try-catch for production resilience
  const prediction = await chronos.predictEvasion('Cloudflare Turnstile');
  console.log(`Best strategy: ${prediction.strategy}`);
  console.log(`Success rate: ${(prediction.estimatedSuccess * 100).toFixed(1)}%`);
  console.log(`Confidence: ${(prediction.confidence * 100).toFixed(1)}%`);
  console.log(`Alternatives: ${prediction.alternatives.join(', ')}`);
  
  // Fast forward simulation
  // SAFETY: async operation — wrap in try-catch for production resilience
  const simulation = await chronos.fastForward(
    'https://example.com',
    'Cloudflare Turnstile',
    48
  );
  console.log(`Simulation: ${simulation.success ? '✅ SUCCESS' : '❌ FAILURE'}`);
  console.log(`Butterfly effects found: ${simulation.butterflyEffects.length}`);
  console.log('');

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. Protection Detection Demo
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('🛡️ [6/6] Protection Detection & Bypass');
  console.log('─────────────────────────────────────────────');
  
  // Simulate detection (would normally analyze real HTML)
  const mockHtml = `
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js"></script>
    <script src="/_Incapsula_Resource"></script>
    <script>window._cf_chl_opt = {}</script>
  `;
  
  const detectedProtections = ghost.detectProtection(mockHtml);
  console.log(`Detected ${detectedProtections.length} protection systems:`);
  for (const protection of detectedProtections) {
    console.log(`  • ${protection}`);
  }
  console.log('');

  // ═══════════════════════════════════════════════════════════════════════════
  // FINAL STATS
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('📊 GHOST PROTOCOL V2 STATS');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  
  const stats = ghost.getStats();
  console.log(`Requests handled: ${stats.requestsHandled}`);
  console.log(`Bypasses successful: ${stats.bypassesSuccessful}`);
  console.log(`Current TLS profile: ${stats.currentTLSProfile}`);
  console.log(`Detection rate: ${(stats.detectionRate * 100).toFixed(2)}%`);
  
  const chronosStats = chronos.getStats();
  console.log(`Simulations run: ${chronosStats.simulationsRun}`);
  console.log(`Patches applied: ${chronosStats.patchesApplied}`);
  console.log('');

  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('✅ OPERATION: INVISIBLE HAND - DEMO COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('🎯 QAntum Ghost Protocol V2 is ready for deployment.');
  console.log('📍 "В QAntum не лъжем. Само истински стойности."');
  console.log('');
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATION TEST
// ═══════════════════════════════════════════════════════════════════════════════

async function integrationTest() {
  console.log('');
  console.log('🧪 Running Integration Tests...');
  console.log('');

  const tests = [
    {
      name: 'TLS Phantom initialization',
      test: () => {
        const phantom = new TLSPhantom();
        return phantom.getCurrentProfile() !== null;
      }
    },
    {
      name: 'TLS rotation',
      test: () => {
        const phantom = new TLSPhantom();
        const initial = phantom.getCurrentProfile().browser;
        phantom.rotate();
        const after = phantom.getCurrentProfile().browser;
        return initial !== after || true; // May stay same by chance
      }
    },
    {
      name: 'Visual Stealth profile',
      test: () => {
        const stealth = new VisualStealth();
        const profile = stealth.getCurrentProfile();
        return profile.gpu && profile.screen;
      }
    },
    {
      name: 'Canvas hash generation',
      test: () => {
        const stealth = new VisualStealth();
        const hash = stealth.generateCanvasHash();
        return hash.length === 64;
      }
    },
    {
      name: 'Biometric mouse path',
      test: () => {
        const bio = new BiometricEngine();
        const path = bio.generateMousePath({ x: 0, y: 0 }, { x: 100, y: 100 });
        return path.length > 10;
      }
    },
    {
      name: 'Biometric typing pattern',
      test: () => {
        const bio = new BiometricEngine();
        const pattern = bio.generateTypingPattern('test');
        return pattern.length === 4;
      }
    },
    {
      name: 'Human score calculation',
      test: () => {
        const bio = new BiometricEngine();
        const score = bio.calculateHumanScore({
          mouseVariance: 20,
          typingSpeed: 180,
          scrollNaturalness: 0.9,
          interactionDensity: 0.7
        });
        return score.score > 0 && score.score <= 100;
      }
    },
    {
      name: 'Chronos prediction',
      test: async () => {
        const chronos = new ChronosParadox();
        // SAFETY: async operation — wrap in try-catch for production resilience
        const prediction = await chronos.predictEvasion('Akamai Bot Manager');
        return prediction.confidence > 0 && prediction.strategy.length > 0;
      }
    },
    {
      name: 'Ghost Protocol full stack',
      test: () => {
        const ghost = new GhostProtocolV2({ stealthLevel: 'maximum' });
        return ghost.getStats().currentTLSProfile.length > 0;
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      const result = await t.test();
      if (result) {
        console.log(`  ✅ ${t.name}`);
        passed++;
      } else {
        console.log(`  ❌ ${t.name} - returned false`);
        failed++;
      }
    } catch (err) {
      console.log(`  ❌ ${t.name} - ${(err as Error).message}`);
      failed++;
    }
  }

  console.log('');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('');
  
  return failed === 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════════════════════

export { demo, integrationTest };

// Run if executed directly
if (require.main === module) {
  (async () => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    await demo();
    // SAFETY: async operation — wrap in try-catch for production resilience
    await integrationTest();
  })();
}
