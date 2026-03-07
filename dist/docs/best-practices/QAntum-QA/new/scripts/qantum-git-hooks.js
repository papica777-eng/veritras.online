"use strict";
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     🔗 QANTUM GIT HOOKS                                                      ║
 * ║     "Скриптът не греши никога защото е математика."                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║     Pre-commit • Pre-push • Commit-msg • Prepare-commit-msg                  ║
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
// ═══════════════════════════════════════════════════════════════════════════════
// HOOK TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════
const HOOKS = {
    'pre-commit': `#!/bin/sh
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║     🔗 QANTUM PRE-COMMIT HOOK                                                ║
# ║     "Скриптът не греши никога защото е математика."                          ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

echo "🔍 Running pre-commit checks..."

# 1. Check for staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(ts|tsx|js|jsx)$')

if [ -z "$STAGED_FILES" ]; then
  echo "✅ No staged TypeScript/JavaScript files to check"
  exit 0
fi

# 2. Run TypeScript type check
echo "📝 Running type check..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ Type check failed. Please fix errors before committing."
  exit 1
fi

# 3. Run ESLint on staged files
echo "📝 Running ESLint..."
echo "$STAGED_FILES" | xargs npx eslint --fix
if [ $? -ne 0 ]; then
  echo "❌ ESLint found errors. Please fix them before committing."
  exit 1
fi

# 4. Re-add fixed files
echo "$STAGED_FILES" | xargs git add

# 5. Check for TODO/FIXME in new code
echo "🔍 Checking for TODO/FIXME..."
TODO_COUNT=$(echo "$STAGED_FILES" | xargs grep -l -E "(TODO|FIXME|XXX|HACK)" 2>/dev/null | wc -l)
if [ "$TODO_COUNT" -gt 0 ]; then
  echo "⚠️ Warning: Found $TODO_COUNT files with TODO/FIXME comments"
fi

# 6. Check for console.log
echo "🔍 Checking for console.log..."
CONSOLE_COUNT=$(echo "$STAGED_FILES" | xargs grep -l "console\\.log" 2>/dev/null | wc -l)
if [ "$CONSOLE_COUNT" -gt 0 ]; then
  echo "⚠️ Warning: Found $CONSOLE_COUNT files with console.log"
fi

# 7. Check for large files
echo "🔍 Checking file sizes..."
LARGE_FILES=$(git diff --cached --name-only | while read file; do
  if [ -f "$file" ]; then
    SIZE=$(wc -c < "$file")
    if [ "$SIZE" -gt 500000 ]; then
      echo "$file ($SIZE bytes)"
    fi
  fi
done)

if [ -n "$LARGE_FILES" ]; then
  echo "⚠️ Warning: Large files detected:"
  echo "$LARGE_FILES"
fi

echo "✅ Pre-commit checks passed!"
exit 0
`,
    'commit-msg': `#!/bin/sh
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║     🔗 QANTUM COMMIT-MSG HOOK                                                ║
# ║     "Скриптът не греши никога защото е математика."                          ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

echo "📝 Validating commit message..."

# Conventional Commits format
# type(scope?): description
# 
# Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

PATTERN="^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\\([a-z0-9-]+\\))?!?: .{3,100}$"

if ! echo "$COMMIT_MSG" | grep -qE "$PATTERN"; then
  echo "❌ Invalid commit message format!"
  echo ""
  echo "Expected format: type(scope): description"
  echo ""
  echo "Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert"
  echo ""
  echo "Examples:"
  echo "  feat(auth): add login functionality"
  echo "  fix(api): resolve memory leak in connection pool"
  echo "  docs: update README with installation instructions"
  echo "  chore(deps): update dependencies"
  echo ""
  exit 1
fi

# Check message length
MSG_LENGTH=\${#COMMIT_MSG}
if [ "$MSG_LENGTH" -gt 100 ]; then
  echo "⚠️ Warning: Commit message is longer than 100 characters ($MSG_LENGTH)"
fi

echo "✅ Commit message is valid!"
exit 0
`,
    'pre-push': `#!/bin/sh
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║     🔗 QANTUM PRE-PUSH HOOK                                                  ║
# ║     "Скриптът не греши никога защото е математика."                          ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

echo "🚀 Running pre-push checks..."

# 1. Run full test suite
echo "🧪 Running tests..."
npm test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Please fix before pushing."
  exit 1
fi

# 2. Run build
echo "🔨 Running build..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Please fix before pushing."
  exit 1
fi

# 3. Check for sensitive data
echo "🔒 Checking for sensitive data..."
SENSITIVE_PATTERNS="password=|api_key=|secret=|private_key|BEGIN RSA|BEGIN DSA|BEGIN EC"
SENSITIVE_FILES=$(git diff --name-only origin/main...HEAD | xargs grep -l -E "$SENSITIVE_PATTERNS" 2>/dev/null)

if [ -n "$SENSITIVE_FILES" ]; then
  echo "❌ Potentially sensitive data detected in:"
  echo "$SENSITIVE_FILES"
  echo "Please review and remove sensitive data before pushing."
  exit 1
fi

# 4. Check branch naming
BRANCH=$(git rev-parse --abbrev-ref HEAD)
BRANCH_PATTERN="^(main|master|develop|feature/|bugfix/|hotfix/|release/)[a-z0-9-]*$"

if ! echo "$BRANCH" | grep -qE "$BRANCH_PATTERN"; then
  echo "⚠️ Warning: Branch name '$BRANCH' doesn't follow naming convention"
  echo "Recommended: feature/xxx, bugfix/xxx, hotfix/xxx"
fi

echo "✅ Pre-push checks passed!"
exit 0
`,
    'prepare-commit-msg': `#!/bin/sh
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║     🔗 QANTUM PREPARE-COMMIT-MSG HOOK                                        ║
# ║     "Скриптът не греши никога защото е математика."                          ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2
SHA1=$3

# Get current branch name
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Extract issue/ticket number from branch name
TICKET=$(echo "$BRANCH" | grep -oE "[A-Z]+-[0-9]+" || echo "")

# Only modify if not a merge, squash, or amend
if [ -z "$COMMIT_SOURCE" ]; then
  if [ -n "$TICKET" ]; then
    # Prepend ticket number to commit message
    ORIGINAL_MSG=$(cat "$COMMIT_MSG_FILE")
    echo "[$TICKET] $ORIGINAL_MSG" > "$COMMIT_MSG_FILE"
  fi
fi

exit 0
`
};
// ═══════════════════════════════════════════════════════════════════════════════
// HUSKY CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const HUSKY_CONFIG = `#!/bin/sh
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║     🐺 HUSKY - Git Hooks Made Easy                                           ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# husky.sh
if [ -z "$husky_skip_init" ]; then
  debug () {
    if [ "$HUSKY_DEBUG" = "1" ]; then
      echo "husky (debug) - $1"
    fi
  }

  readonly hook_name="$(basename -- "$0")"
  debug "starting $hook_name..."

  if [ "$HUSKY" = "0" ]; then
    debug "HUSKY env variable is set to 0, skipping hook"
    exit 0
  fi

  if [ -f ~/.huskyrc ]; then
    debug "sourcing ~/.huskyrc"
    . ~/.huskyrc
  fi

  readonly husky_skip_init=1
  export husky_skip_init
  
  sh -e "$0" "$@"
  exitCode="$?"

  if [ $exitCode != 0 ]; then
    echo "husky - $hook_name hook exited with code $exitCode (error)"
  fi

  if [ $exitCode = 127 ]; then
    echo "husky - command not found in PATH=$PATH"
  fi

  exit $exitCode
fi
`;
// ═══════════════════════════════════════════════════════════════════════════════
// GIT HOOKS MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
class GitHooksManager {
    rootPath;
    gitPath;
    hooksPath;
    huskyPath;
    constructor(rootPath) {
        this.rootPath = rootPath;
        this.gitPath = path_1.default.join(rootPath, '.git');
        this.hooksPath = path_1.default.join(this.gitPath, 'hooks');
        this.huskyPath = path_1.default.join(rootPath, '.husky');
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // INSTALL HOOKS
    // ─────────────────────────────────────────────────────────────────────────────
    install(useHusky = false) {
        console.log();
        log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
        log('║     🔗 QANTUM GIT HOOKS INSTALLER                                            ║', 'cyan');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
        // Check if git repo
        if (!fs_1.default.existsSync(this.gitPath)) {
            log('\n❌ Not a git repository!', 'red');
            log('   Run "git init" first.', 'white');
            return;
        }
        if (useHusky) {
            this.installHusky();
        }
        else {
            this.installNative();
        }
    }
    installNative() {
        log('\n📦 Installing native Git hooks...', 'cyan');
        // Ensure hooks directory exists
        if (!fs_1.default.existsSync(this.hooksPath)) {
            fs_1.default.mkdirSync(this.hooksPath, { recursive: true });
        }
        // Install each hook
        for (const [hookName, hookContent] of Object.entries(HOOKS)) {
            const hookPath = path_1.default.join(this.hooksPath, hookName);
            // Backup existing hook
            if (fs_1.default.existsSync(hookPath)) {
                const backupPath = `${hookPath}.backup`;
                fs_1.default.copyFileSync(hookPath, backupPath);
                log(`  📋 Backed up existing ${hookName} hook`, 'yellow');
            }
            fs_1.default.writeFileSync(hookPath, hookContent);
            fs_1.default.chmodSync(hookPath, '755');
            log(`  ✅ Installed ${hookName}`, 'green');
        }
        log('\n✅ Git hooks installed successfully!', 'green');
    }
    installHusky() {
        log('\n🐺 Installing Husky hooks...', 'cyan');
        // Create .husky directory
        if (!fs_1.default.existsSync(this.huskyPath)) {
            fs_1.default.mkdirSync(this.huskyPath, { recursive: true });
        }
        // Create _/husky.sh
        const huskyShPath = path_1.default.join(this.huskyPath, '_');
        if (!fs_1.default.existsSync(huskyShPath)) {
            fs_1.default.mkdirSync(huskyShPath, { recursive: true });
        }
        fs_1.default.writeFileSync(path_1.default.join(huskyShPath, 'husky.sh'), HUSKY_CONFIG);
        log('  ✅ Created husky.sh', 'green');
        // Install each hook
        for (const [hookName, hookContent] of Object.entries(HOOKS)) {
            const hookPath = path_1.default.join(this.huskyPath, hookName);
            // Husky hooks need to source husky.sh
            const huskyHookContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

${hookContent.split('\n').slice(1).join('\n')}`;
            fs_1.default.writeFileSync(hookPath, huskyHookContent);
            fs_1.default.chmodSync(hookPath, '755');
            log(`  ✅ Installed ${hookName}`, 'green');
        }
        // Update package.json scripts
        const pkgPath = path_1.default.join(this.rootPath, 'package.json');
        if (fs_1.default.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs_1.default.readFileSync(pkgPath, 'utf-8'));
            pkg.scripts = pkg.scripts || {};
            pkg.scripts.prepare = 'husky install';
            fs_1.default.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
            log('  ✅ Updated package.json', 'green');
        }
        // Configure git
        try {
            (0, child_process_1.execSync)('git config core.hooksPath .husky', { cwd: this.rootPath });
            log('  ✅ Configured git hooks path', 'green');
        }
        catch (e) {
            log('  ⚠️ Could not configure git hooks path', 'yellow');
        }
        log('\n✅ Husky hooks installed successfully!', 'green');
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // UNINSTALL HOOKS
    // ─────────────────────────────────────────────────────────────────────────────
    uninstall() {
        log('\n🗑️ Uninstalling Git hooks...', 'cyan');
        // Remove native hooks
        for (const hookName of Object.keys(HOOKS)) {
            const hookPath = path_1.default.join(this.hooksPath, hookName);
            if (fs_1.default.existsSync(hookPath)) {
                fs_1.default.unlinkSync(hookPath);
                log(`  ✅ Removed ${hookName}`, 'green');
            }
            // Restore backup if exists
            const backupPath = `${hookPath}.backup`;
            if (fs_1.default.existsSync(backupPath)) {
                fs_1.default.renameSync(backupPath, hookPath);
                log(`  📋 Restored backup for ${hookName}`, 'yellow');
            }
        }
        // Remove husky directory
        if (fs_1.default.existsSync(this.huskyPath)) {
            fs_1.default.rmSync(this.huskyPath, { recursive: true });
            log('  ✅ Removed .husky directory', 'green');
        }
        log('\n✅ Git hooks uninstalled!', 'green');
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // LIST HOOKS
    // ─────────────────────────────────────────────────────────────────────────────
    list() {
        console.log();
        log('📋 Installed Git Hooks:', 'cyan');
        log('─'.repeat(50), 'dim');
        const locations = [
            { name: 'Native (.git/hooks)', path: this.hooksPath },
            { name: 'Husky (.husky)', path: this.huskyPath }
        ];
        for (const loc of locations) {
            if (fs_1.default.existsSync(loc.path)) {
                log(`\n${loc.name}:`, 'magenta');
                const files = fs_1.default.readdirSync(loc.path);
                for (const file of files) {
                    if (!file.startsWith('.') && !file.endsWith('.sample') && file !== '_') {
                        const fullPath = path_1.default.join(loc.path, file);
                        const stat = fs_1.default.statSync(fullPath);
                        if (stat.isFile()) {
                            const isExecutable = (stat.mode & 0o100) !== 0;
                            const status = isExecutable ? '✅' : '⚠️';
                            log(`  ${status} ${file}`, isExecutable ? 'green' : 'yellow');
                        }
                    }
                }
            }
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // TEST HOOK
    // ─────────────────────────────────────────────────────────────────────────────
    test(hookName) {
        log(`\n🧪 Testing ${hookName} hook...`, 'cyan');
        const locations = [
            path_1.default.join(this.huskyPath, hookName),
            path_1.default.join(this.hooksPath, hookName)
        ];
        const hookPath = locations.find(p => fs_1.default.existsSync(p));
        if (!hookPath) {
            log(`❌ Hook ${hookName} not found!`, 'red');
            return;
        }
        try {
            (0, child_process_1.execSync)(`sh ${hookPath}`, {
                cwd: this.rootPath,
                stdio: 'inherit',
                env: { ...process.env, GIT_DIR: this.gitPath }
            });
            log(`\n✅ Hook ${hookName} executed successfully!`, 'green');
        }
        catch (e) {
            log(`\n❌ Hook ${hookName} failed with exit code ${e.status}`, 'red');
        }
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
const args = process.argv.slice(2);
const command = args[0];
const rootPath = process.cwd();
const manager = new GitHooksManager(rootPath);
switch (command) {
    case 'install':
        manager.install(args.includes('--husky'));
        break;
    case 'uninstall':
        manager.uninstall();
        break;
    case 'list':
        manager.list();
        break;
    case 'test':
        const hookName = args[1];
        if (!hookName) {
            log('❌ Please specify hook name to test', 'red');
            log('   Example: npx tsx qantum-git-hooks.ts test pre-commit', 'white');
        }
        else {
            manager.test(hookName);
        }
        break;
    default:
        log(`
Usage: npx tsx qantum-git-hooks.ts <command> [options]

Commands:
  install     Install Git hooks
  uninstall   Remove Git hooks
  list        List installed hooks
  test        Test a specific hook

Options:
  --husky     Use Husky for hook management

Hooks included:
  pre-commit          Run linting, type check, and validation before commit
  commit-msg          Validate commit message format (Conventional Commits)
  pre-push            Run tests and build before push
  prepare-commit-msg  Auto-add ticket number from branch name

Examples:
  npx tsx qantum-git-hooks.ts install
  npx tsx qantum-git-hooks.ts install --husky
  npx tsx qantum-git-hooks.ts test pre-commit
  npx tsx qantum-git-hooks.ts uninstall
`, 'white');
}
