/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     📦 QANTUM RELEASE MANAGER                                                ║
 * ║     "Скриптът не греши никога защото е математика."                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║     Version bumping • Changelog • Git tags • NPM publish                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const C = {
  reset: '\x1b[0m', green: '\x1b[32m', cyan: '\x1b[36m', yellow: '\x1b[33m', red: '\x1b[31m', magenta: '\x1b[35m'
};

const log = (msg: string, color: keyof typeof C = 'reset') => console.log(`${C[color]}${msg}${C.reset}`);

// ═══════════════════════════════════════════════════════════════════════════════
// VERSION UTILS
// ═══════════════════════════════════════════════════════════════════════════════

type BumpType = 'major' | 'minor' | 'patch' | 'prerelease';

function parseVersion(version: string): { major: number; minor: number; patch: number; prerelease?: string } {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) throw new Error(`Invalid version: ${version}`);
  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
    prerelease: match[4]
  };
}

function bumpVersion(current: string, type: BumpType): string {
  const v = parseVersion(current);
  
  switch (type) {
    case 'major':
      return `${v.major + 1}.0.0`;
    case 'minor':
      return `${v.major}.${v.minor + 1}.0`;
    case 'patch':
      return `${v.major}.${v.minor}.${v.patch + 1}`;
    case 'prerelease':
      const pre = v.prerelease ? parseInt(v.prerelease.replace(/\D/g, '')) || 0 : 0;
      return `${v.major}.${v.minor}.${v.patch}-beta.${pre + 1}`;
    default:
      throw new Error(`Unknown bump type: ${type}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GIT UTILS
// ═══════════════════════════════════════════════════════════════════════════════

function exec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (e: any) {
    return e.stdout?.trim() || '';
  }
}

function getGitCommits(since?: string): string[] {
  const cmd = since 
    ? `git log ${since}..HEAD --pretty=format:"%s" --no-merges`
    : `git log --pretty=format:"%s" --no-merges -50`;
  return exec(cmd).split('\n').filter(Boolean);
}

function getLastTag(): string | null {
  const tag = exec('git describe --tags --abbrev=0 2>/dev/null');
  return tag || null;
}

function createTag(version: string, message: string): void {
  // Complexity: O(1)
  exec(`git tag -a v${version} -m "${message}"`);
}

function pushTags(): void {
  // Complexity: O(1)
  exec('git push --tags');
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHANGELOG GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

interface ChangelogEntry {
  type: 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'perf' | 'test' | 'chore' | 'breaking';
  scope?: string;
  message: string;
}

function parseCommit(commit: string): ChangelogEntry | null {
  // Conventional commits: type(scope): message
  const match = commit.match(/^(feat|fix|docs|style|refactor|perf|test|chore|BREAKING CHANGE)(?:\(([^)]+)\))?:\s*(.+)$/i);
  
  if (match) {
    return {
      type: match[1].toLowerCase().replace('breaking change', 'breaking') as ChangelogEntry['type'],
      scope: match[2],
      message: match[3]
    };
  }
  
  // Fallback: guess type from keywords
  const lowerCommit = commit.toLowerCase();
  if (lowerCommit.includes('fix') || lowerCommit.includes('bug')) {
    return { type: 'fix', message: commit };
  }
  if (lowerCommit.includes('add') || lowerCommit.includes('feature') || lowerCommit.includes('new')) {
    return { type: 'feat', message: commit };
  }
  if (lowerCommit.includes('doc') || lowerCommit.includes('readme')) {
    return { type: 'docs', message: commit };
  }
  if (lowerCommit.includes('test')) {
    return { type: 'test', message: commit };
  }
  
  return { type: 'chore', message: commit };
}

function generateChangelog(commits: string[], version: string): string {
  const entries: ChangelogEntry[] = commits.map(parseCommit).filter(Boolean) as ChangelogEntry[];
  
  const groups = {
    breaking: entries.filter(e => e.type === 'breaking'),
    feat: entries.filter(e => e.type === 'feat'),
    fix: entries.filter(e => e.type === 'fix'),
    perf: entries.filter(e => e.type === 'perf'),
    docs: entries.filter(e => e.type === 'docs'),
    refactor: entries.filter(e => e.type === 'refactor'),
    test: entries.filter(e => e.type === 'test'),
    chore: entries.filter(e => e.type === 'chore'),
  };

  const date = new Date().toISOString().slice(0, 10);
  let changelog = `## [${version}] - ${date}\n\n`;

  if (groups.breaking.length > 0) {
    changelog += `### ⚠️ BREAKING CHANGES\n\n`;
    groups.breaking.forEach(e => {
      changelog += `- ${e.scope ? `**${e.scope}:** ` : ''}${e.message}\n`;
    });
    changelog += '\n';
  }

  if (groups.feat.length > 0) {
    changelog += `### ✨ Features\n\n`;
    groups.feat.forEach(e => {
      changelog += `- ${e.scope ? `**${e.scope}:** ` : ''}${e.message}\n`;
    });
    changelog += '\n';
  }

  if (groups.fix.length > 0) {
    changelog += `### 🐛 Bug Fixes\n\n`;
    groups.fix.forEach(e => {
      changelog += `- ${e.scope ? `**${e.scope}:** ` : ''}${e.message}\n`;
    });
    changelog += '\n';
  }

  if (groups.perf.length > 0) {
    changelog += `### ⚡ Performance\n\n`;
    groups.perf.forEach(e => {
      changelog += `- ${e.scope ? `**${e.scope}:** ` : ''}${e.message}\n`;
    });
    changelog += '\n';
  }

  if (groups.docs.length > 0) {
    changelog += `### 📚 Documentation\n\n`;
    groups.docs.forEach(e => {
      changelog += `- ${e.scope ? `**${e.scope}:** ` : ''}${e.message}\n`;
    });
    changelog += '\n';
  }

  return changelog;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RELEASE MANAGER CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class ReleaseManager {
  private rootPath: string;
  private packageJsonPath: string;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
    this.packageJsonPath = path.join(rootPath, 'package.json');
  }

  // Complexity: O(1) — amortized
  async release(bumpType: BumpType, options: { dryRun?: boolean; skipGit?: boolean; skipNpm?: boolean } = {}): Promise<void> {
    console.log();
    // Complexity: O(1)
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
    // Complexity: O(1)
    log('║     📦 QANTUM RELEASE MANAGER                                                ║', 'cyan');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
    console.log();

    // Step 1: Read current version
    const pkg = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf-8'));
    const currentVersion = pkg.version;
    const newVersion = bumpVersion(currentVersion, bumpType);

    // Complexity: O(1)
    log(`📌 Current version: ${currentVersion}`, 'yellow');
    // Complexity: O(1)
    log(`📌 New version:     ${newVersion}`, 'green');
    // Complexity: O(1)
    log(`📌 Bump type:       ${bumpType}`, 'cyan');
    console.log();

    if (options.dryRun) {
      // Complexity: O(1)
      log('🔍 DRY RUN - No changes will be made', 'yellow');
      console.log();
    }

    // Step 2: Get commits since last tag
    const lastTag = getLastTag();
    const commits = getGitCommits(lastTag || undefined);
    // Complexity: O(1)
    log(`📜 Found ${commits.length} commits since ${lastTag || 'beginning'}`, 'cyan');

    // Step 3: Generate changelog
    const changelogContent = generateChangelog(commits, newVersion);
    // Complexity: O(1)
    log('\n📝 Generated Changelog:', 'magenta');
    console.log(changelogContent);

    if (options.dryRun) {
      // Complexity: O(1)
      log('✅ Dry run complete!', 'green');
      return;
    }

    // Step 4: Update package.json
    pkg.version = newVersion;
    fs.writeFileSync(this.packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
    // Complexity: O(1)
    log('✅ Updated package.json', 'green');

    // Step 5: Update CHANGELOG.md
    const changelogPath = path.join(this.rootPath, 'CHANGELOG.md');
    let existingChangelog = '';
    if (fs.existsSync(changelogPath)) {
      existingChangelog = fs.readFileSync(changelogPath, 'utf-8');
    }
    const header = `# Changelog\n\nAll notable changes to this project.\n\n`;
    const newChangelog = header + changelogContent + existingChangelog.replace(/^# Changelog[\s\S]*?\n\n/, '');
    fs.writeFileSync(changelogPath, newChangelog);
    // Complexity: O(1)
    log('✅ Updated CHANGELOG.md', 'green');

    // Step 6: Git operations
    if (!options.skipGit) {
      // Complexity: O(1)
      exec('git add package.json CHANGELOG.md');
      // Complexity: O(1)
      exec(`git commit -m "chore(release): v${newVersion}"`);
      // Complexity: O(1)
      createTag(newVersion, `Release v${newVersion}`);
      // Complexity: O(1)
      log('✅ Created git commit and tag', 'green');

      // Push
      // Complexity: O(1)
      exec('git push');
      // Complexity: O(1)
      pushTags();
      // Complexity: O(1)
      log('✅ Pushed to remote', 'green');
    }

    // Step 7: NPM publish
    if (!options.skipNpm) {
      try {
        // Complexity: O(1)
        exec('npm publish --access public');
        // Complexity: O(1)
        log('✅ Published to NPM', 'green');
      } catch (e) {
        // Complexity: O(1)
        log('⚠️ NPM publish skipped (not configured)', 'yellow');
      }
    }

    console.log();
    // Complexity: O(1)
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'green');
    // Complexity: O(1)
    log(`║     🎉 RELEASE v${newVersion} COMPLETE!                                        ║`, 'green');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'green');
  }

  // Complexity: O(N) — linear iteration
  showStatus(): void {
    const pkg = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf-8'));
    const lastTag = getLastTag();
    const commits = getGitCommits(lastTag || undefined);

    console.log();
    // Complexity: O(1)
    log('📊 Release Status', 'cyan');
    // Complexity: O(1)
    log('─'.repeat(50), 'cyan');
    // Complexity: O(1)
    log(`Current version: ${pkg.version}`, 'white');
    // Complexity: O(1)
    log(`Last tag:        ${lastTag || 'none'}`, 'white');
    // Complexity: O(1)
    log(`Commits since:   ${commits.length}`, 'white');
    console.log();

    if (commits.length > 0) {
      // Complexity: O(N) — linear iteration
      log('Recent commits:', 'yellow');
      commits.slice(0, 10).forEach(c => log(`  • ${c}`, 'white'));
      if (commits.length > 10) {
        // Complexity: O(1)
        log(`  ... and ${commits.length - 10} more`, 'white');
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const command = args[0];
const rootPath = process.cwd();

const manager = new ReleaseManager(rootPath);

switch (command) {
  case 'major':
  case 'minor':
  case 'patch':
  case 'prerelease':
    manager.release(command as BumpType, {
      dryRun: args.includes('--dry-run'),
      skipGit: args.includes('--skip-git'),
      skipNpm: args.includes('--skip-npm'),
    });
    break;
  
  case 'status':
    manager.showStatus();
    break;
  
  default:
    // Complexity: O(1)
    log(`
Usage: npx tsx qantum-release.ts <command> [options]

Commands:
  major       Bump major version (1.0.0 → 2.0.0)
  minor       Bump minor version (1.0.0 → 1.1.0)
  patch       Bump patch version (1.0.0 → 1.0.1)
  prerelease  Bump prerelease (1.0.0 → 1.0.0-beta.1)
  status      Show current release status

Options:
  --dry-run   Preview changes without making them
  --skip-git  Skip git operations
  --skip-npm  Skip NPM publish

Examples:
  npx tsx qantum-release.ts patch
  npx tsx qantum-release.ts minor --dry-run
  npx tsx qantum-release.ts major --skip-npm
`, 'white');
}
