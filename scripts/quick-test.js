/**
 * quick-test — Qantum Module
 * @module quick-test
 * @path scripts/quick-test.js
 * @auto-documented BrutalDocEngine v2.1
 */

// ULTRA FAST TEST - 1 site, 3 sec timeout
const https = require('https');

console.log('Testing ozone.bg (3 sec max)...');
const start = Date.now();

const req = https.request({
  hostname: 'ozone.bg',
  port: 443,
  path: '/',
  method: 'HEAD',
  timeout: 3000
}, (res) => {
  console.log('✅ SUCCESS in ' + (Date.now() - start) + 'ms');
  console.log('Status:', res.statusCode);
  console.log('HSTS:', res.headers['strict-transport-security'] ? 'YES' : '❌ MISSING');
  console.log('CSP:', res.headers['content-security-policy'] ? 'YES' : '❌ MISSING');
  console.log('X-Frame:', res.headers['x-frame-options'] ? 'YES' : '❌ MISSING');
  process.exit(0);
});

req.on('timeout', () => {
  console.log('❌ TIMEOUT after 3 sec');
  req.destroy();
  process.exit(1);
});

req.on('error', (e) => {
  console.log('❌ ERROR:', e.message);
  process.exit(1);
});

req.end();
