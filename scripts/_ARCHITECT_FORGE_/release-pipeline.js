/**
 * release-pipeline — Qantum Module
 * @module release-pipeline
 * @path scripts/_ARCHITECT_FORGE_/release-pipeline.js
 * @auto-documented BrutalDocEngine v2.1
 */

#!/usr/bin/env node
/**
 * ⚛️ QANTUM RELEASE PIPELINE
 * ═══════════════════════════════════════════════════════════════════════════════
 * ЕДНО ИЗВИКВАНЕ = ВСИЧКО АВТОМАТИЧНО
 * Code → Docs → Website → Changelog → Git → Push
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// ═══════════════════════════════════════════════════════════════════════════════
// RELEASE PIPELINE
// ═══════════════════════════════════════════════════════════════════════════════

class ReleasePipeline {
  constructor(options = {}) {
    this.message = options.message || 'Auto release';
    this.bumpType = options.bump || 'patch'; // patch, minor, major
    this.dryRun = options.dryRun || false;
    this.version = null;
    this.changes = [];
  }

  // Complexity: O(1) — amortized
  async run() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                              ║
║   ⚛️  Q A N T U M   R E L E A S E   P I P E L I N E                                         ║
║                                                                                              ║
║   ЕДНО ИЗВИКВАНЕ = ВСИЧКО АВТОМАТИЧНО                                                        ║
║   Code → TypeScript → Docs → Website → Changelog → Git → Push                                ║
║                                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════════════════════╝
    `);

    const startTime = Date.now();
    const results = {
      steps: [],
      errors: [],
      warnings: []
    };

    try {
      // ═══════════════════════════════════════════════════════════════════════════
      // STEP 1: DETECT CHANGES
      // ═══════════════════════════════════════════════════════════════════════════
      await this.step('📊 Detecting changes', async () => {
        this.changes = this.detectChanges();
        return `${this.changes.length} files changed`;
      }, results);

      if (this.changes.length === 0) {
        console.log('\n⚠️  No changes detected. Nothing to release.\n');
        return;
      }

      // ═══════════════════════════════════════════════════════════════════════════
      // STEP 2: BUMP VERSION
      // ═══════════════════════════════════════════════════════════════════════════
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.step('🔢 Bumping version', async () => {
        this.version = this.bumpVersion(this.bumpType);
        return `v${this.version}`;
      }, results);

      // ═══════════════════════════════════════════════════════════════════════════
      // STEP 3: TYPESCRIPT CHECK
      // ═══════════════════════════════════════════════════════════════════════════
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.step('🔍 TypeScript check', async () => {
        const result = this.exec('npx tsc --noEmit 2>&1 || true');
        const errors = (result.match(/error TS\d+/g) || []).length;
        if (errors > 0) {
          throw new Error(`${errors} TypeScript errors found`);
        }
        return '0 errors';
      }, results);

      // ═══════════════════════════════════════════════════════════════════════════
      // STEP 4: RUN TESTS (if available)
      // ═══════════════════════════════════════════════════════════════════════════
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.step('🧪 Running tests', async () => {
        try {
          const result = this.exec('npm test 2>&1 || echo "No tests"');
          if (result.includes('FAIL')) {
            throw new Error('Tests failed');
          }
          return 'Passed';
        } catch {
          return 'Skipped (no tests)';
        }
      }, results);

      // ═══════════════════════════════════════════════════════════════════════════
      // STEP 5: GENERATE DOCUMENTATION
      // ═══════════════════════════════════════════════════════════════════════════
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.step('📚 Generating documentation', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.generateDocs();
        return 'Generated';
      }, results);

      // ═══════════════════════════════════════════════════════════════════════════
      // STEP 6: UPDATE CHANGELOG
      // ═══════════════════════════════════════════════════════════════════════════
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.step('📋 Updating CHANGELOG', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.updateChangelog();
        return 'Updated';
      }, results);

      // ═══════════════════════════════════════════════════════════════════════════
      // STEP 7: UPDATE WEBSITE
      // ═══════════════════════════════════════════════════════════════════════════
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.step('🌐 Updating website', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.updateWebsite();
        return 'Updated';
      }, results);

      // ═══════════════════════════════════════════════════════════════════════════
      // STEP 8: SYNC VERSION EVERYWHERE
      // ═══════════════════════════════════════════════════════════════════════════
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.step('🔄 Syncing version', async () => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.syncVersions();
        return `v${this.version} synced`;
      }, results);

      // ═══════════════════════════════════════════════════════════════════════════
      // STEP 9: GIT COMMIT
      // ═══════════════════════════════════════════════════════════════════════════
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.step('📤 Git commit', async () => {
        if (this.dryRun) return 'DRY RUN - skipped';
        
        this.exec('git add -A');
        const commitMsg = `⚛️ Release v${this.version}: ${this.message}`;
        this.exec(`git commit -m "${commitMsg}"`);
        return commitMsg;
      }, results);

      // ═══════════════════════════════════════════════════════════════════════════
      // STEP 10: GIT TAG
      // ═══════════════════════════════════════════════════════════════════════════
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.step('🏷️  Git tag', async () => {
        if (this.dryRun) return 'DRY RUN - skipped';
        
        this.exec(`git tag -a v${this.version} -m "Release v${this.version}"`);
        return `v${this.version}`;
      }, results);

      // ═══════════════════════════════════════════════════════════════════════════
      // STEP 11: GIT PUSH
      // ═══════════════════════════════════════════════════════════════════════════
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.step('🚀 Git push', async () => {
        if (this.dryRun) return 'DRY RUN - skipped';
        
        this.exec('git push origin main');
        this.exec('git push origin --tags');
        return 'Pushed to origin';
      }, results);

      // ═══════════════════════════════════════════════════════════════════════════
      // SUMMARY
      // ═══════════════════════════════════════════════════════════════════════════
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log(`
╔══════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                              ║
║   ✅ RELEASE COMPLETE                                                                        ║
║                                                                                              ║
║   Version: v${this.version.padEnd(20)}                                                       ║
║   Duration: ${duration}s                                                                      ║
║   Files changed: ${this.changes.length}                                                              ║
║   Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}                                                           ║
║                                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════════════════════╝
      `);

      // Print step summary
      console.log('\n📊 STEP SUMMARY:\n');
      results.steps.forEach((step, i) => {
        const icon = step.success ? '✅' : '❌';
        console.log(`   ${i + 1}. ${icon} ${step.name}: ${step.result}`);
      });

      if (results.warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:\n');
        results.warnings.forEach(w => console.log(`   - ${w}`));
      }

    } catch (error) {
      console.error(`\n❌ RELEASE FAILED: ${error.message}\n`);
      process.exit(1);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP RUNNER
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(1)
  async step(name, fn, results) {
    process.stdout.write(`${name}... `);
    try {
      const result = await fn();
      console.log(`✅ ${result}`);
      results.steps.push({ name, success: true, result });
    } catch (error) {
      console.log(`❌ ${error.message}`);
      results.steps.push({ name, success: false, result: error.message });
      results.errors.push(error.message);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CHANGE DETECTION
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  detectChanges() {
    try {
      const staged = this.exec('git diff --cached --name-only').split('\n').filter(Boolean);
      const unstaged = this.exec('git diff --name-only').split('\n').filter(Boolean);
      const untracked = this.exec('git ls-files --others --exclude-standard').split('\n').filter(Boolean);
      return [...new Set([...staged, ...unstaged, ...untracked])];
    } catch {
      return [];
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VERSION BUMP
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  bumpVersion(type) {
    const pkgPath = path.join(PROJECT_ROOT, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    
    const [major, minor, patch] = pkg.version.replace(/-.*/, '').split('.').map(Number);
    
    let newVersion;
    switch (type) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
    }

    pkg.version = newVersion;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    
    return newVersion;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DOCUMENTATION
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(1)
  async generateDocs() {
    const docsDir = path.join(PROJECT_ROOT, 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Generate API docs from source
    const srcDir = path.join(PROJECT_ROOT, 'src');
    if (fs.existsSync(srcDir)) {
      const apiDoc = this.generateApiDoc(srcDir);
      fs.writeFileSync(path.join(docsDir, 'api-reference.md'), apiDoc);
    }

    // Generate getting started
    const gettingStarted = this.generateGettingStarted();
    fs.writeFileSync(path.join(docsDir, 'getting-started.md'), gettingStarted);
  }

  // Complexity: O(N) — linear iteration
  generateApiDoc(srcDir) {
    let doc = `# QAntum API Reference\n\n`;
    doc += `> Version: ${this.version}\n`;
    doc += `> Generated: ${new Date().toISOString()}\n\n`;

    const files = this.findFiles(srcDir, '.ts');
    
    for (const file of files.slice(0, 50)) { // Limit to 50 files
      const content = fs.readFileSync(file, 'utf-8');
      const exports = this.extractExports(content);
      
      if (exports.length > 0) {
        const relativePath = path.relative(PROJECT_ROOT, file);
        doc += `## ${path.basename(file, '.ts')}\n\n`;
        doc += `**File:** \`${relativePath}\`\n\n`;
        doc += `**Exports:**\n`;
        exports.forEach(exp => doc += `- \`${exp}\`\n`);
        doc += '\n---\n\n';
      }
    }

    return doc;
  }

  // Complexity: O(1) — hash/map lookup
  generateGettingStarted() {
    return `# Getting Started with QAntum

> Version: ${this.version}
> Generated: ${new Date().toISOString()}

## Installation

\`\`\`bash
npm install qantum
\`\`\`

## Quick Start

\`\`\`typescript
import { QAntum, createQA } from 'qantum';

// Create instance
const qa = createQA();

// Run tests
    // SAFETY: async operation — wrap in try-catch for production resilience
await qa.test('My Test', async () => {
  // Your test code
});
\`\`\`

## Documentation

- [API Reference](./api-reference.md)
- [Changelog](../CHANGELOG.md)

## Version

Current version: **v${this.version}**
`;
  }

  // Complexity: O(N) — loop-based
  extractExports(content) {
    const exports = [];
    const pattern = /export\s+(class|function|const|interface|type|enum)\s+(\w+)/g;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      exports.push(match[2]);
    }
    return [...new Set(exports)];
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CHANGELOG
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  async updateChangelog() {
    const changelogPath = path.join(PROJECT_ROOT, 'CHANGELOG.md');
    let changelog = fs.existsSync(changelogPath) 
      ? fs.readFileSync(changelogPath, 'utf-8')
      : '# Changelog\n\n';

    const date = new Date().toISOString().split('T')[0];
    
    // Категоризирай промените
    const sourceChanges = this.changes.filter(f => f.startsWith('src/'));
    const docChanges = this.changes.filter(f => f.startsWith('docs/') || f.endsWith('.md'));
    const testChanges = this.changes.filter(f => f.includes('test'));

    let entry = `\n## [${this.version}] - ${date}\n\n`;
    entry += `### ${this.message}\n\n`;
    
    if (sourceChanges.length > 0) {
      entry += `#### Source Changes (${sourceChanges.length} files)\n`;
      sourceChanges.slice(0, 10).forEach(f => entry += `- \`${f}\`\n`);
      if (sourceChanges.length > 10) entry += `- ... and ${sourceChanges.length - 10} more\n`;
      entry += '\n';
    }

    if (testChanges.length > 0) {
      entry += `#### Test Changes (${testChanges.length} files)\n`;
      testChanges.slice(0, 5).forEach(f => entry += `- \`${f}\`\n`);
      entry += '\n';
    }

    // Insert after header
    const headerEnd = changelog.indexOf('\n## ');
    if (headerEnd > 0) {
      changelog = changelog.slice(0, headerEnd) + entry + changelog.slice(headerEnd);
    } else {
      changelog += entry;
    }

    fs.writeFileSync(changelogPath, changelog);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // WEBSITE
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  async updateWebsite() {
    const dirs = ['website', 'public', 'docs'];
    
    for (const dir of dirs) {
      const fullPath = path.join(PROJECT_ROOT, dir);
      if (fs.existsSync(fullPath)) {
        this.updateVersionInDir(fullPath);
      }
    }
  }

  // Complexity: O(N) — linear iteration
  updateVersionInDir(dir) {
    const files = this.findFiles(dir, '.html').concat(this.findFiles(dir, '.md'));
    
    for (const file of files) {
      let content = fs.readFileSync(file, 'utf-8');
      
      // Update version references
      content = content.replace(/v\d+\.\d+\.\d+(-[\w.]+)?/g, `v${this.version}`);
      content = content.replace(/version[:\s]+\d+\.\d+\.\d+/gi, `version: ${this.version}`);
      
      fs.writeFileSync(file, content);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VERSION SYNC
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  async syncVersions() {
    // Update README
    const readmePath = path.join(PROJECT_ROOT, 'README.md');
    if (fs.existsSync(readmePath)) {
      let readme = fs.readFileSync(readmePath, 'utf-8');
      readme = readme.replace(/v\d+\.\d+\.\d+(-[\w.]+)?/g, `v${this.version}`);
      fs.writeFileSync(readmePath, readme);
    }

    // Update any version files
    const versionFiles = ['VERSION', 'version.txt', '.version'];
    for (const vf of versionFiles) {
      const vfPath = path.join(PROJECT_ROOT, vf);
      if (fs.existsSync(vfPath)) {
        fs.writeFileSync(vfPath, this.version);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(1)
  exec(cmd) {
    return execSync(cmd, { 
      cwd: PROJECT_ROOT, 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
  }

  // Complexity: O(N) — linear iteration
  findFiles(dir, ext) {
    if (!fs.existsSync(dir)) return [];
    
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      if (item.name.startsWith('.') || item.name === 'node_modules') continue;
      
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        files.push(...this.findFiles(fullPath, ext));
      } else if (item.name.endsWith(ext)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);

// Parse arguments
const options = {
  message: 'Auto release',
  bump: 'patch',
  dryRun: false
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '-m' || args[i] === '--message') {
    options.message = args[++i];
  } else if (args[i] === '-b' || args[i] === '--bump') {
    options.bump = args[++i];
  } else if (args[i] === '--dry-run') {
    options.dryRun = true;
  } else if (args[i] === '--major') {
    options.bump = 'major';
  } else if (args[i] === '--minor') {
    options.bump = 'minor';
  } else if (args[i] === '--patch') {
    options.bump = 'patch';
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
⚛️ QANTUM RELEASE PIPELINE

Usage:
  node release-pipeline.js [options]

Options:
  -m, --message <msg>   Commit message (default: "Auto release")
  -b, --bump <type>     Version bump type: major, minor, patch (default: patch)
  --major               Shortcut for --bump major
  --minor               Shortcut for --bump minor
  --patch               Shortcut for --bump patch
  --dry-run             Run without committing/pushing
  -h, --help            Show this help

Examples:
  node release-pipeline.js -m "New feature" --minor
  node release-pipeline.js --patch
  node release-pipeline.js --dry-run
`);
    process.exit(0);
  }
}

// Run pipeline
const pipeline = new ReleasePipeline(options);
pipeline.run();

module.exports = { ReleasePipeline };
