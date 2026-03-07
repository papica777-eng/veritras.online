/**
 * 🦁 MASS HUNTER - Pure JavaScript (FAST)
 * Usage: node scripts/mass-hunter-fast.js
 */

const https = require('https');

const TARGETS = [
  'ozone.bg',
  'chaos.com',
  'telerik.com',
  'superhosting.bg',
  'siteground.com',
  'gtmhub.com',
  'kanbanize.com',
  'payhawk.com',
  'officerentinfo.bg',
  'jobs.bg'
];

const HEADERS = [
  'strict-transport-security',
  'content-security-policy', 
  'x-frame-options',
  'x-content-type-options',
  'x-xss-protection',
  'referrer-policy',
  'permissions-policy'
];

function quickScan(domain) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = https.request({
      hostname: domain,
      port: 443,
      path: '/',
      method: 'HEAD',
      timeout: 8000,
      rejectUnauthorized: false
    }, (res) => {
      const ttfb = Date.now() - start;
      let score = 100;
      const issues = [];
      
      for (const h of HEADERS) {
        if (!res.headers[h]) {
          score -= 12;
          issues.push(h);
        }
      }
      
      score = Math.max(0, score);
      let grade = 'A+';
      if (score < 95) grade = 'A';
      if (score < 85) grade = 'B';
      if (score < 70) grade = 'C';
      if (score < 55) grade = 'D';
      if (score < 40) grade = 'F';
      
      // Complexity: O(1)
      resolve({ domain, score, grade, issues, ttfb });
    });
    
    req.on('error', () => resolve({ domain, score: 0, grade: 'ERR', issues: ['Connection failed'], ttfb: 0 }));
    req.on('timeout', () => { req.destroy(); resolve({ domain, score: 0, grade: 'TMO', issues: ['Timeout'], ttfb: 8000 }); });
    req.end();
  });
}

async function main() {
  console.log('\n🦁 MASS HUNTER v34.0 - Scanning ' + TARGETS.length + ' targets...\n');
  
  // SAFETY: async operation — wrap in try-catch for production resilience
  const results = await Promise.all(TARGETS.map(quickScan));
  results.sort((a, b) => a.score - b.score);
  
  console.log('┌────────────────────────┬───────┬───────┬────────┐');
  console.log('│ Domain                 │ Score │ Grade │ TTFB   │');
  console.log('├────────────────────────┼───────┼───────┼────────┤');
  
  for (const r of results) {
    const icon = r.grade === 'F' ? '🔴' : r.grade === 'D' ? '🟠' : r.grade === 'C' ? '🟡' : r.grade === 'ERR' || r.grade === 'TMO' ? '⚫' : '🟢';
    console.log(`│ ${r.domain.padEnd(22)} │ ${String(r.score).padStart(3)}/100│ ${icon} ${r.grade.padEnd(2)} │ ${String(r.ttfb).padStart(4)}ms │`);
  }
  
  console.log('└────────────────────────┴───────┴───────┴────────┘');
  
  const hotLeads = results.filter(r => r.score < 50 && r.grade !== 'ERR' && r.grade !== 'TMO');
  
  console.log('\n🔥 HOT LEADS (Grade F/D):');
  for (const lead of hotLeads) {
    console.log(`   ${lead.domain} - Score ${lead.score}/100`);
    console.log(`   Missing: ${lead.issues.slice(0,3).join(', ')}`);
  }
  
  console.log('\n💰 Potential Pipeline: €' + (hotLeads.length * 15000).toLocaleString());
}

    // Complexity: O(1)
main();
