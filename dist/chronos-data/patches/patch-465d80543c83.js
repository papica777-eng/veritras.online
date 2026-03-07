"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyFingerprintMutationPatch = applyFingerprintMutationPatch;
// AUTO-GENERATED TIME TRAVEL PATCH
const visual_stealth_1 = require("./ghost-protocol-v2/visual-stealth");
async function applyFingerprintMutationPatch() {
    const visualEngine = (0, visual_stealth_1.getVisualStealthEngine)();
    // Regenerate all visual fingerprints
    visualEngine.regenerateAllProfiles();
    // Increase canvas noise
    visualEngine.setCanvasNoiseLevel(0.02);
    console.log('[CHRONOS-PATCH] Visual fingerprints regenerated');
}
