const { execSync } = require('child_process');

console.log('🔒 Starting Security Scan...');

try {
  // Run npm audit
  // Using --audit-level=high to only fail on high/critical vulnerabilities
  console.log('Running npm audit...');
  execSync('npm audit --audit-level=high', { stdio: 'inherit' });
  console.log('✅ No high or critical vulnerabilities found.');
} catch (error) {
  console.error('❌ Security check failed!');
  console.error('High or critical vulnerabilities detected. Please run "npm audit fix" or resolve manually.');
  process.exit(1);
}

// Placeholder for other security checks (e.g., SAST tools like SonarQube or Snyk)
console.log('🔍 Running static analysis for security patterns...');
// Example: Check for hardcoded secrets (simplified)
const fs = require('fs');
const path = require('path');

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Simple regex for AWS keys (example)
  if (content.match(/AKIA[0-9A-Z]{16}/)) {
    console.error(`❌ Potential AWS Access Key found in ${filePath}`);
    process.exit(1);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !['node_modules', '.git', 'dist'].includes(file)) {
      walkDir(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.ts')) {
      scanFile(filePath);
    }
  }
}

try {
  walkDir('.');
  console.log('✅ Static analysis passed.');
} catch (error) {
  console.error('❌ Static analysis failed:', error.message);
  process.exit(1);
}

console.log('🛡️ Security Scan Complete.');
