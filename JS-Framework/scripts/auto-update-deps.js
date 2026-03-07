const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔄 Checking for dependency updates...');

// Using npm-check-updates concept but manual check since we can't easily install new tools globally
try {
  // Check for outdated packages
  console.log('📦 Querying npm for outdated packages...');
  const outdated = execSync('npm outdated --json || true').toString();
  const outdatedJson = JSON.parse(outdated);

  if (Object.keys(outdatedJson).length === 0) {
    console.log('✅ All dependencies are up to date.');
    process.exit(0);
  }

  console.log(`⚠️ Found ${Object.keys(outdatedJson).length} outdated packages.`);

  // In a real auto-update scenario, we would run:
  // execSync('npm update');
  // But for safety in this environment, we will just list them and recommend update.

  console.table(outdatedJson);

  console.log('💡 To update, run: npm update');

} catch (error) {
  console.error('❌ Failed to check updates:', error.message);
  // npm outdated exits with 1 if there are outdated packages, but we handled that with || true
}
