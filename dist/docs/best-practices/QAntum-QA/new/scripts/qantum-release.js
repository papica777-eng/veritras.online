"use strict";
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     📦 QANTUM RELEASE MANAGER                                                ║
 * ║     "Скриптът не греши никога защото е математика."                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║     Version bumping • Changelog • Git tags • NPM publish                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const C = {
    reset: '\x1b[0m', green: '\x1b[32m', cyan: '\x1b[36m', yellow: '\x1b[33m', red: '\x1b[31m', magenta: '\x1b[35m'
};
const log = (msg, color = 'reset') => console.log(`${C[color]}${msg}${C.reset}`);
function parseVersion(version) {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
    if (!match)
        throw new Error(`Invalid version: ${version}`);
    return {
        major: parseInt(match[1]),
        minor: parseInt(match[2]),
        patch: parseInt(match[3]),
        prerelease: match[4]
    };
}
function bumpVersion(current, type) {
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
function exec(cmd) {
    try {
        return (0, child_process_1.execSync)(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    }
    catch (e) {
        return e.stdout?.trim() || '';
    }
}
function getGitCommits(since) {
    const cmd = since
        ? `git log ${since}..HEAD --pretty=format:"%s" --no-merges`
        : `git log --pretty=format:"%s" --no-merges -50`;
    return exec(cmd).split('\n').filter(Boolean);
}
function getLastTag() {
    const tag = exec('git describe --tags --abbrev=0 2>/dev/null');
    return tag || null;
}
function createTag(version, message) {
    exec(`git tag -a v${version} -m "${message}"`);
}
function pushTags() {
    exec('git push --tags');
}
function parseCommit(commit) {
    // Conventional commits: type(scope): message
    const match = commit.match(/^(feat|fix|docs|style|refactor|perf|test|chore|BREAKING CHANGE)(?:\(([^)]+)\))?:\s*(.+)$/i);
    if (match) {
        return {
            type: match[1].toLowerCase().replace('breaking change', 'breaking'),
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
function generateChangelog(commits, version) {
    const entries = commits.map(parseCommit).filter(Boolean);
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
    rootPath;
    packageJsonPath;
    constructor(rootPath) {
        this.rootPath = rootPath;
        this.packageJsonPath = path_1.default.join(rootPath, 'package.json');
    }
    async release(bumpType, options = {}) {
        console.log();
        log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
        log('║     📦 QANTUM RELEASE MANAGER                                                ║', 'cyan');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
        console.log();
        // Step 1: Read current version
        const pkg = JSON.parse(fs_1.default.readFileSync(this.packageJsonPath, 'utf-8'));
        const currentVersion = pkg.version;
        const newVersion = bumpVersion(currentVersion, bumpType);
        log(`📌 Current version: ${currentVersion}`, 'yellow');
        log(`📌 New version:     ${newVersion}`, 'green');
        log(`📌 Bump type:       ${bumpType}`, 'cyan');
        console.log();
        if (options.dryRun) {
            log('🔍 DRY RUN - No changes will be made', 'yellow');
            console.log();
        }
        // Step 2: Get commits since last tag
        const lastTag = getLastTag();
        const commits = getGitCommits(lastTag || undefined);
        log(`📜 Found ${commits.length} commits since ${lastTag || 'beginning'}`, 'cyan');
        // Step 3: Generate changelog
        const changelogContent = generateChangelog(commits, newVersion);
        log('\n📝 Generated Changelog:', 'magenta');
        console.log(changelogContent);
        if (options.dryRun) {
            log('✅ Dry run complete!', 'green');
            return;
        }
        // Step 4: Update package.json
        pkg.version = newVersion;
        fs_1.default.writeFileSync(this.packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
        log('✅ Updated package.json', 'green');
        // Step 5: Update CHANGELOG.md
        const changelogPath = path_1.default.join(this.rootPath, 'CHANGELOG.md');
        let existingChangelog = '';
        if (fs_1.default.existsSync(changelogPath)) {
            existingChangelog = fs_1.default.readFileSync(changelogPath, 'utf-8');
        }
        const header = `# Changelog\n\nAll notable changes to this project.\n\n`;
        const newChangelog = header + changelogContent + existingChangelog.replace(/^# Changelog[\s\S]*?\n\n/, '');
        fs_1.default.writeFileSync(changelogPath, newChangelog);
        log('✅ Updated CHANGELOG.md', 'green');
        // Step 6: Git operations
        if (!options.skipGit) {
            exec('git add package.json CHANGELOG.md');
            exec(`git commit -m "chore(release): v${newVersion}"`);
            createTag(newVersion, `Release v${newVersion}`);
            log('✅ Created git commit and tag', 'green');
            // Push
            exec('git push');
            pushTags();
            log('✅ Pushed to remote', 'green');
        }
        // Step 7: NPM publish
        if (!options.skipNpm) {
            try {
                exec('npm publish --access public');
                log('✅ Published to NPM', 'green');
            }
            catch (e) {
                log('⚠️ NPM publish skipped (not configured)', 'yellow');
            }
        }
        console.log();
        log('╔══════════════════════════════════════════════════════════════════════════════╗', 'green');
        log(`║     🎉 RELEASE v${newVersion} COMPLETE!                                        ║`, 'green');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'green');
    }
    showStatus() {
        const pkg = JSON.parse(fs_1.default.readFileSync(this.packageJsonPath, 'utf-8'));
        const lastTag = getLastTag();
        const commits = getGitCommits(lastTag || undefined);
        console.log();
        log('📊 Release Status', 'cyan');
        log('─'.repeat(50), 'cyan');
        log(`Current version: ${pkg.version}`, 'white');
        log(`Last tag:        ${lastTag || 'none'}`, 'white');
        log(`Commits since:   ${commits.length}`, 'white');
        console.log();
        if (commits.length > 0) {
            log('Recent commits:', 'yellow');
            commits.slice(0, 10).forEach(c => log(`  • ${c}`, 'white'));
            if (commits.length > 10) {
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
        manager.release(command, {
            dryRun: args.includes('--dry-run'),
            skipGit: args.includes('--skip-git'),
            skipNpm: args.includes('--skip-npm'),
        });
        break;
    case 'status':
        manager.showStatus();
        break;
    default:
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
