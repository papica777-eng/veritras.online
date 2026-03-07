"use strict";
// AUTO-GENERATED TIME TRAVEL PATCH
// Butterfly Effect: butterfly-f9fc6865808a
// Failure Type: ANTI_BOT_DETECTION
// Generated: 2026-03-01T23:17:45.091Z
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyTLSRotationPatch = applyTLSRotationPatch;
const tls_phantom_1 = require("./ghost-protocol-v2/tls-phantom");
async function applyTLSRotationPatch() {
    const tlsEngine = (0, tls_phantom_1.getTLSPhantomEngine)();
    // Force profile rotation
    tlsEngine.rotateProfile();
    // Increase mutation intensity for future requests
    tlsEngine.setMutationIntensity(0.4);
    // Blacklist current JA3 fingerprint
    const currentProfile = tlsEngine.getCurrentProfile();
    tlsEngine.blacklistFingerprint(currentProfile.ja3);
    console.log('[CHRONOS-PATCH] TLS fingerprint rotated successfully');
}
