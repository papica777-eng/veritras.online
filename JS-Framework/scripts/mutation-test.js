const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('🧬 Starting Mutation Testing...');

// Target file to mutate (e.g., a core utility)
// For demonstration, we'll target a simple file if it exists, or create a dummy one.
const targetFile = 'src/utils/math-utils.js'; // Example target

// Ensure target exists for demo purposes
if (!fs.existsSync('src/utils')) fs.mkdirSync('src/utils', { recursive: true });
if (!fs.existsSync(targetFile)) {
  fs.writeFileSync(targetFile, `
    module.exports = {
      add: (a, b) => a + b,
      isPositive: (n) => n > 0
    };
  `);
}

// Create a corresponding test file
const testFile = 'tests/unit/math-utils.test.js';
if (!fs.existsSync(testFile)) {
  fs.writeFileSync(testFile, `
    const { add, isPositive } = require('../../src/utils/math-utils');
    const assert = require('assert');

    try {
      assert.strictEqual(add(2, 3), 5);
      assert.strictEqual(isPositive(5), true);
      console.log('Test Passed');
    } catch (e) {
      console.error('Test Failed');
      process.exit(1);
    }
  `);
}

// Mutation Operators
const mutations = [
  { original: '+', mutated: '-' },
  { original: '>', mutated: '<=' },
  { original: 'true', mutated: 'false' }
];

let originalContent = fs.readFileSync(targetFile, 'utf8');
let killedMutants = 0;
let totalMutants = 0;

console.log(`Target: ${targetFile}`);

mutations.forEach(mutation => {
  if (originalContent.includes(mutation.original)) {
    totalMutants++;
    console.log(`👾 Applying mutation: ${mutation.original} -> ${mutation.mutated}`);

    const mutatedContent = originalContent.replace(mutation.original, mutation.mutated);
    fs.writeFileSync(targetFile, mutatedContent);

    try {
      execSync(`node ${testFile}`, { stdio: 'ignore' });
      console.log('❌ Mutant Survived! (Test passed despite mutation)');
    } catch (e) {
      console.log('✅ Mutant Killed! (Test failed as expected)');
      killedMutants++;
    }
  }
});

// Restore original content
fs.writeFileSync(targetFile, originalContent);

const score = totalMutants > 0 ? (killedMutants / totalMutants) * 100 : 100;
console.log(`🧬 Mutation Score: ${score.toFixed(2)}% (${killedMutants}/${totalMutants})`);

if (score < 80) {
  console.error('⚠️ Mutation Score below threshold (80%)!');
  process.exit(1);
}
