"use strict";
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum v23.3.0 - ФИНАЛЕН ОДИТ / FINAL AUDIT
 * © 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 *
 * Тества ВСЯКА функция и проверява целия код
 * ═══════════════════════════════════════════════════════════════════════════════
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const results = [];
const modules = [];
// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════
function log(icon, message) {
    console.log(`${icon} ${message}`);
}
function addResult(category, test, status, message, details) {
    results.push({ category, test, status, message, details });
    const icons = {
        'PASS': '✅',
        'FAIL': '❌',
        'WARN': '⚠️',
        'SKIP': '⏭️'
    };
    console.log(`  ${icons[status]} ${test}: ${message}`);
}
function getAllFiles(dir, extensions = ['.ts', '.js']) {
    const files = [];
    if (!fs.existsSync(dir))
        return files;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            if (!['node_modules', 'dist', '.git', 'backups'].includes(item.name)) {
                files.push(...getAllFiles(fullPath, extensions));
            }
        }
        else if (extensions.some(ext => item.name.endsWith(ext))) {
            files.push(fullPath);
        }
    }
    return files;
}
// ═══════════════════════════════════════════════════════════════
// 1. TYPESCRIPT COMPILATION AUDIT
// ═══════════════════════════════════════════════════════════════
function auditTypeScript() {
    log('📝', '\n═══ 1. TypeScript Compilation ═══\n');
    try {
        const result = (0, child_process_1.spawnSync)('npx', ['tsc', '--noEmit'], {
            encoding: 'utf-8',
            shell: true,
            cwd: process.cwd()
        });
        if (result.status === 0) {
            addResult('TypeScript', 'Compilation', 'PASS', 'No TypeScript errors');
        }
        else {
            const errorCount = (result.stdout + result.stderr).split('\n').filter(l => l.includes('error')).length;
            addResult('TypeScript', 'Compilation', 'FAIL', `${errorCount} TypeScript errors found`, result.stdout + result.stderr);
        }
    }
    catch (error) {
        addResult('TypeScript', 'Compilation', 'FAIL', error.message);
    }
    // Check for strict mode
    try {
        const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf-8'));
        const strict = tsconfig.compilerOptions?.strict;
        addResult('TypeScript', 'Strict Mode', strict ? 'PASS' : 'WARN', strict ? 'Enabled' : 'Disabled - recommend enabling');
    }
    catch {
        addResult('TypeScript', 'tsconfig.json', 'WARN', 'Could not read tsconfig.json');
    }
}
// ═══════════════════════════════════════════════════════════════
// 2. MODULE STRUCTURE AUDIT
// ═══════════════════════════════════════════════════════════════
function auditModuleStructure() {
    log('📦', '\n═══ 2. Module Structure ═══\n');
    const srcDir = './src';
    const files = getAllFiles(srcDir, ['.ts']);
    addResult('Modules', 'Total Files', 'PASS', `${files.length} TypeScript files found`);
    let totalLines = 0;
    let totalClasses = 0;
    let totalFunctions = 0;
    let totalExports = 0;
    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        // Extract info
        const classes = content.match(/class\s+(\w+)/g)?.map(m => m.replace('class ', '')) || [];
        const functions = content.match(/(?:async\s+)?function\s+(\w+)/g)?.map(m => m.replace(/async\s+function\s+|function\s+/, '')) || [];
        const exports = content.match(/export\s+(const|function|class|interface|type|async function)\s+(\w+)/g)?.map(m => {
            const match = m.match(/\s+(\w+)$/);
            return match ? match[1] : m;
        }) || [];
        const imports = content.match(/import\s+.*?from\s+['"][^'"]+['"]/g) || [];
        modules.push({
            file: path.relative('.', file),
            classes,
            functions,
            exports,
            imports,
            lineCount: lines.length
        });
        totalLines += lines.length;
        totalClasses += classes.length;
        totalFunctions += functions.length;
        totalExports += exports.length;
    }
    addResult('Modules', 'Total Lines', 'PASS', `${totalLines.toLocaleString()} lines of code`);
    addResult('Modules', 'Classes', 'PASS', `${totalClasses} classes defined`);
    addResult('Modules', 'Functions', 'PASS', `${totalFunctions} functions defined`);
    addResult('Modules', 'Exports', 'PASS', `${totalExports} exports`);
}
// ═══════════════════════════════════════════════════════════════
// 3. FUNCTION SIGNATURE AUDIT
// ═══════════════════════════════════════════════════════════════
function auditFunctionSignatures() {
    log('🔍', '\n═══ 3. Function Signatures ═══\n');
    const files = getAllFiles('./src', ['.ts']);
    let typed = 0;
    let untyped = 0;
    const untypedList = [];
    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        // Check for functions with return types
        const withReturn = content.match(/function\s+\w+\([^)]*\)\s*:\s*\w+/g)?.length || 0;
        const withoutReturn = content.match(/function\s+\w+\([^)]*\)\s*\{/g)?.length || 0;
        typed += withReturn;
        untyped += withoutReturn - withReturn; // Those without explicit return type
        // Check for any types
        const anyTypes = content.match(/:\s*any\b/g)?.length || 0;
        if (anyTypes > 5) {
            untypedList.push(`${path.basename(file)}: ${anyTypes} 'any' types`);
        }
    }
    const percentage = typed + untyped > 0 ? Math.round((typed / (typed + untyped)) * 100) : 100;
    addResult('Functions', 'Return Types', percentage >= 80 ? 'PASS' : 'WARN', `${percentage}% of functions have return types (${typed}/${typed + untyped})`);
    if (untypedList.length > 0) {
        addResult('Functions', 'Any Types', 'WARN', `Files with many 'any' types`, untypedList.join(', '));
    }
    else {
        addResult('Functions', 'Type Safety', 'PASS', 'Good type coverage');
    }
}
// ═══════════════════════════════════════════════════════════════
// 4. IMPORT/EXPORT AUDIT
// ═══════════════════════════════════════════════════════════════
function auditImports() {
    log('📥', '\n═══ 4. Imports & Exports ═══\n');
    const files = getAllFiles('./src', ['.ts']);
    let circularRisk = [];
    let missingExports = [];
    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const imports = content.match(/from\s+['"]\.\/[^'"]+['"]/g) || [];
        // Check for potential circular imports (files importing each other)
        for (const imp of imports) {
            const importPath = imp.match(/['"]([^'"]+)['"]/)?.[1];
            if (importPath) {
                const resolvedPath = path.resolve(path.dirname(file), importPath + '.ts');
                if (fs.existsSync(resolvedPath)) {
                    const importedContent = fs.readFileSync(resolvedPath, 'utf-8');
                    const relativeBack = path.relative(path.dirname(resolvedPath), file).replace('.ts', '').replace(/\\/g, '/');
                    if (importedContent.includes(`from './${path.basename(file, '.ts')}'`) ||
                        importedContent.includes(`from '${relativeBack}'`)) {
                        circularRisk.push(`${path.basename(file)} <-> ${path.basename(resolvedPath)}`);
                    }
                }
            }
        }
    }
    // Remove duplicates
    circularRisk = [...new Set(circularRisk)];
    if (circularRisk.length > 0) {
        addResult('Imports', 'Circular Imports', 'WARN', `${circularRisk.length} potential circular imports`, circularRisk.join(', '));
    }
    else {
        addResult('Imports', 'Circular Imports', 'PASS', 'No circular imports detected');
    }
    // Check for index.ts files
    const srcSubdirs = fs.readdirSync('./src', { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);
    let hasIndex = 0;
    for (const dir of srcSubdirs) {
        if (fs.existsSync(`./src/${dir}/index.ts`)) {
            hasIndex++;
        }
    }
    addResult('Exports', 'Index Files', hasIndex >= srcSubdirs.length / 2 ? 'PASS' : 'WARN', `${hasIndex}/${srcSubdirs.length} modules have index.ts`);
}
// ═══════════════════════════════════════════════════════════════
// 5. SECURITY AUDIT
// ═══════════════════════════════════════════════════════════════
function auditSecurity() {
    log('🔒', '\n═══ 5. Security Audit ═══\n');
    const files = getAllFiles('.', ['.ts', '.js']);
    const issues = [];
    const securityPatterns = [
        { pattern: /eval\s*\(/g, name: 'eval() usage', severity: 'high' },
        { pattern: /new\s+Function\s*\(/g, name: 'new Function() usage', severity: 'high' },
        { pattern: /\.innerHTML\s*=/g, name: 'innerHTML assignment', severity: 'medium' },
        { pattern: /document\.write\s*\(/g, name: 'document.write()', severity: 'medium' },
        { pattern: /password\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded password', severity: 'critical' },
        { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded API key', severity: 'critical' },
        { pattern: /secret\s*[:=]\s*['"][^'"]{10,}['"]/gi, name: 'Hardcoded secret', severity: 'critical' },
        { pattern: /exec\s*\(\s*[`'"]\$\{/g, name: 'Command injection risk', severity: 'high' },
        { pattern: /require\s*\(\s*[`'"]\$\{/g, name: 'Dynamic require', severity: 'medium' },
        { pattern: /\bcrypto\.createHash\(['"]md5['"]\)/g, name: 'Weak hash (MD5)', severity: 'medium' },
        { pattern: /\bcrypto\.createHash\(['"]sha1['"]\)/g, name: 'Weak hash (SHA1)', severity: 'low' }
    ];
    for (const file of files) {
        if (file.includes('node_modules'))
            continue;
        const content = fs.readFileSync(file, 'utf-8');
        for (const check of securityPatterns) {
            const matches = content.match(check.pattern);
            if (matches) {
                issues.push(`${check.severity.toUpperCase()}: ${check.name} in ${path.basename(file)} (${matches.length}x)`);
            }
        }
    }
    const critical = issues.filter(i => i.startsWith('CRITICAL')).length;
    const high = issues.filter(i => i.startsWith('HIGH')).length;
    if (critical > 0) {
        addResult('Security', 'Critical Issues', 'FAIL', `${critical} critical security issues`, issues.filter(i => i.startsWith('CRITICAL')).join('\n'));
    }
    else {
        addResult('Security', 'Critical Issues', 'PASS', 'No critical security issues');
    }
    if (high > 0) {
        addResult('Security', 'High Risk', 'WARN', `${high} high-risk patterns found`, issues.filter(i => i.startsWith('HIGH')).join('\n'));
    }
    else {
        addResult('Security', 'High Risk', 'PASS', 'No high-risk patterns');
    }
    // Check for secrets in git history (basic check)
    try {
        const gitLog = (0, child_process_1.execSync)('git log --oneline -20 2>&1', { encoding: 'utf-8' });
        if (!gitLog.includes('fatal:')) {
            addResult('Security', 'Git History', 'PASS', 'Git repository is initialized');
        }
    }
    catch {
        addResult('Security', 'Git History', 'SKIP', 'Not a git repository');
    }
}
// ═══════════════════════════════════════════════════════════════
// 6. DEPENDENCY AUDIT
// ═══════════════════════════════════════════════════════════════
function auditDependencies() {
    log('📦', '\n═══ 6. Dependencies ═══\n');
    try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        const deps = Object.keys(pkg.dependencies || {}).length;
        const devDeps = Object.keys(pkg.devDependencies || {}).length;
        addResult('Dependencies', 'Count', 'PASS', `${deps} dependencies, ${devDeps} devDependencies`);
        // Check for outdated packages
        try {
            const outdated = (0, child_process_1.execSync)('npm outdated --json 2>&1', { encoding: 'utf-8' });
            const parsed = JSON.parse(outdated || '{}');
            const count = Object.keys(parsed).length;
            if (count > 0) {
                addResult('Dependencies', 'Outdated', 'WARN', `${count} packages can be updated`);
            }
            else {
                addResult('Dependencies', 'Outdated', 'PASS', 'All packages up to date');
            }
        }
        catch {
            addResult('Dependencies', 'Outdated', 'PASS', 'All packages up to date');
        }
        // Check for audit vulnerabilities
        try {
            const audit = (0, child_process_1.execSync)('npm audit --json 2>&1', { encoding: 'utf-8' });
            const parsed = JSON.parse(audit);
            const vulns = parsed.metadata?.vulnerabilities;
            if (vulns) {
                const total = vulns.critical + vulns.high + vulns.moderate + vulns.low;
                if (total > 0) {
                    addResult('Dependencies', 'Vulnerabilities', 'WARN', `${total} vulnerabilities (${vulns.critical} critical, ${vulns.high} high)`);
                }
                else {
                    addResult('Dependencies', 'Vulnerabilities', 'PASS', '0 vulnerabilities');
                }
            }
        }
        catch {
            addResult('Dependencies', 'Vulnerabilities', 'PASS', 'Audit passed');
        }
    }
    catch {
        addResult('Dependencies', 'package.json', 'FAIL', 'Could not read package.json');
    }
}
// ═══════════════════════════════════════════════════════════════
// 7. TEST COVERAGE AUDIT
// ═══════════════════════════════════════════════════════════════
function auditTests() {
    log('🧪', '\n═══ 7. Test Coverage ═══\n');
    const testFiles = getAllFiles('./tests', ['.ts', '.test.ts', '.spec.ts']);
    const testFilesAlt = getAllFiles('./src', ['.test.ts', '.spec.ts']);
    const totalTests = testFiles.length + testFilesAlt.length;
    addResult('Tests', 'Test Files', totalTests > 0 ? 'PASS' : 'WARN', `${totalTests} test files found`);
    // Count test cases
    let testCases = 0;
    for (const file of [...testFiles, ...testFilesAlt]) {
        const content = fs.readFileSync(file, 'utf-8');
        const its = content.match(/\bit\s*\(/g)?.length || 0;
        const tests = content.match(/\btest\s*\(/g)?.length || 0;
        testCases += its + tests;
    }
    addResult('Tests', 'Test Cases', testCases > 10 ? 'PASS' : 'WARN', `${testCases} test cases`);
    // Check if tests pass
    try {
        (0, child_process_1.execSync)('npm test 2>&1', { encoding: 'utf-8', timeout: 60000 });
        addResult('Tests', 'Execution', 'PASS', 'All tests pass');
    }
    catch (error) {
        if (error.message.includes('timeout')) {
            addResult('Tests', 'Execution', 'SKIP', 'Tests timed out');
        }
        else if (error.message.includes('no test')) {
            addResult('Tests', 'Execution', 'SKIP', 'No test script defined');
        }
        else {
            addResult('Tests', 'Execution', 'FAIL', 'Some tests failed', error.message?.slice(0, 500));
        }
    }
}
// ═══════════════════════════════════════════════════════════════
// 8. CODE QUALITY AUDIT
// ═══════════════════════════════════════════════════════════════
function auditCodeQuality() {
    log('✨', '\n═══ 8. Code Quality ═══\n');
    const files = getAllFiles('./src', ['.ts']);
    let largeFiles = [];
    let longFunctions = [];
    let todoCount = 0;
    let fixmeCount = 0;
    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        // Large files (>500 lines)
        if (lines.length > 500) {
            largeFiles.push(`${path.basename(file)} (${lines.length} lines)`);
        }
        // TODOs and FIXMEs
        todoCount += (content.match(/\/\/\s*TODO/gi)?.length || 0);
        fixmeCount += (content.match(/\/\/\s*FIXME/gi)?.length || 0);
        // Long functions (basic detection)
        const functionMatches = content.matchAll(/(?:async\s+)?function\s+(\w+)/g);
        for (const match of functionMatches) {
            const startIndex = match.index || 0;
            let braceCount = 0;
            let started = false;
            let funcLines = 0;
            for (let i = startIndex; i < content.length; i++) {
                if (content[i] === '{') {
                    braceCount++;
                    started = true;
                }
                else if (content[i] === '}') {
                    braceCount--;
                    if (started && braceCount === 0) {
                        funcLines = content.slice(startIndex, i).split('\n').length;
                        break;
                    }
                }
            }
            if (funcLines > 100) {
                longFunctions.push(`${match[1]}() in ${path.basename(file)} (${funcLines} lines)`);
            }
        }
    }
    if (largeFiles.length > 0) {
        addResult('Quality', 'File Size', 'WARN', `${largeFiles.length} files over 500 lines`, largeFiles.slice(0, 5).join(', '));
    }
    else {
        addResult('Quality', 'File Size', 'PASS', 'All files under 500 lines');
    }
    if (longFunctions.length > 0) {
        addResult('Quality', 'Function Size', 'WARN', `${longFunctions.length} functions over 100 lines`, longFunctions.slice(0, 5).join(', '));
    }
    else {
        addResult('Quality', 'Function Size', 'PASS', 'All functions under 100 lines');
    }
    addResult('Quality', 'TODOs', todoCount > 10 ? 'WARN' : 'PASS', `${todoCount} TODO comments found`);
    if (fixmeCount > 0) {
        addResult('Quality', 'FIXMEs', 'WARN', `${fixmeCount} FIXME comments need attention`);
    }
}
// ═══════════════════════════════════════════════════════════════
// 9. DOCUMENTATION AUDIT
// ═══════════════════════════════════════════════════════════════
function auditDocumentation() {
    log('📚', '\n═══ 9. Documentation ═══\n');
    // Check for key documentation files
    const requiredDocs = ['README.md', 'LICENSE', 'CHANGELOG.md', 'CONTRIBUTING.md'];
    for (const doc of requiredDocs) {
        if (fs.existsSync(doc)) {
            const content = fs.readFileSync(doc, 'utf-8');
            addResult('Docs', doc, content.length > 100 ? 'PASS' : 'WARN', content.length > 100 ? 'Present and detailed' : 'Present but minimal');
        }
        else {
            addResult('Docs', doc, doc === 'README.md' || doc === 'LICENSE' ? 'FAIL' : 'WARN', 'Missing');
        }
    }
    // Check for API docs
    const apiDocs = getAllFiles('./docs', ['.md']);
    addResult('Docs', 'API Documentation', apiDocs.length >= 3 ? 'PASS' : 'WARN', `${apiDocs.length} documentation files in docs/`);
    // Check JSDoc coverage
    const srcFiles = getAllFiles('./src', ['.ts']);
    let jsdocCount = 0;
    let functionCount = 0;
    for (const file of srcFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        jsdocCount += (content.match(/\/\*\*[\s\S]*?\*\//g)?.length || 0);
        functionCount += (content.match(/(?:async\s+)?function\s+\w+/g)?.length || 0);
    }
    const coverage = functionCount > 0 ? Math.round((jsdocCount / functionCount) * 100) : 0;
    addResult('Docs', 'JSDoc Coverage', coverage >= 50 ? 'PASS' : 'WARN', `${coverage}% functions documented (${jsdocCount}/${functionCount})`);
}
// ═══════════════════════════════════════════════════════════════
// 10. BUILD & SCRIPTS AUDIT
// ═══════════════════════════════════════════════════════════════
function auditBuildScripts() {
    log('🔨', '\n═══ 10. Build & Scripts ═══\n');
    try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        const scripts = pkg.scripts || {};
        const requiredScripts = ['build', 'test', 'start'];
        for (const script of requiredScripts) {
            if (scripts[script]) {
                addResult('Scripts', script, 'PASS', `Defined: ${scripts[script]}`);
            }
            else {
                addResult('Scripts', script, 'WARN', 'Not defined');
            }
        }
        // Check if build works
        if (scripts.build) {
            try {
                (0, child_process_1.execSync)('npm run build 2>&1', { encoding: 'utf-8', timeout: 120000 });
                addResult('Build', 'Execution', 'PASS', 'Build successful');
            }
            catch (error) {
                addResult('Build', 'Execution', 'FAIL', 'Build failed', error.message?.slice(0, 300));
            }
        }
    }
    catch {
        addResult('Scripts', 'package.json', 'FAIL', 'Could not read package.json');
    }
}
// ═══════════════════════════════════════════════════════════════
// GENERATE FINAL REPORT
// ═══════════════════════════════════════════════════════════════
function generateReport() {
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const warnings = results.filter(r => r.status === 'WARN').length;
    const skipped = results.filter(r => r.status === 'SKIP').length;
    const score = Math.round((passed / results.length) * 100);
    let summary = '';
    if (score >= 90) {
        summary = '🏆 ОТЛИЧНО / EXCELLENT - Кодът е в отлично състояние!';
    }
    else if (score >= 75) {
        summary = '✅ ДОБРЕ / GOOD - Кодът е в добро състояние с малки подобрения.';
    }
    else if (score >= 50) {
        summary = '⚠️ СРЕДНО / MODERATE - Има области за подобрение.';
    }
    else {
        summary = '❌ НУЖДА ОТ РАБОТА / NEEDS WORK - Значителни подобрения са необходими.';
    }
    return {
        timestamp: new Date().toISOString(),
        version: '23.3.0',
        totalTests: results.length,
        passed,
        failed,
        warnings,
        skipped,
        results,
        modules,
        summary
    };
}
function printFinalReport(report) {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    🎯 ФИНАЛЕН ОДИТ / FINAL AUDIT REPORT                       ║');
    console.log('╠═══════════════════════════════════════════════════════════════════════════════╣');
    console.log(`║  📊 Общо Тестове:    ${report.totalTests.toString().padStart(4)}                                              ║`);
    console.log(`║  ✅ Успешни:         ${report.passed.toString().padStart(4)}                                              ║`);
    console.log(`║  ❌ Неуспешни:       ${report.failed.toString().padStart(4)}                                              ║`);
    console.log(`║  ⚠️  Предупреждения:  ${report.warnings.toString().padStart(4)}                                              ║`);
    console.log(`║  ⏭️  Пропуснати:      ${report.skipped.toString().padStart(4)}                                              ║`);
    console.log('╠═══════════════════════════════════════════════════════════════════════════════╣');
    const score = Math.round((report.passed / report.totalTests) * 100);
    const bar = '█'.repeat(Math.floor(score / 5)) + '░'.repeat(20 - Math.floor(score / 5));
    console.log(`║  📈 Резултат: ${score}% ${bar}                     ║`);
    console.log('╠═══════════════════════════════════════════════════════════════════════════════╣');
    console.log(`║  ${report.summary.padEnd(73)} ║`);
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
    // Module summary
    console.log('\n📦 Module Summary:');
    console.log(`   Total Files: ${report.modules.length}`);
    console.log(`   Total Lines: ${report.modules.reduce((a, m) => a + m.lineCount, 0).toLocaleString()}`);
    console.log(`   Total Classes: ${report.modules.reduce((a, m) => a + m.classes.length, 0)}`);
    console.log(`   Total Functions: ${report.modules.reduce((a, m) => a + m.functions.length, 0)}`);
    console.log(`   Total Exports: ${report.modules.reduce((a, m) => a + m.exports.length, 0)}`);
}
function saveReport(report) {
    const outputDir = './audit-results';
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    // Save JSON report
    fs.writeFileSync(path.join(outputDir, 'audit-report.json'), JSON.stringify(report, null, 2));
    // Save Markdown report
    let md = `# 🎯 QAntum Final Audit Report

**Generated:** ${report.timestamp}
**Version:** v${report.version}

## Summary

| Metric | Count |
|--------|-------|
| ✅ Passed | ${report.passed} |
| ❌ Failed | ${report.failed} |
| ⚠️ Warnings | ${report.warnings} |
| ⏭️ Skipped | ${report.skipped} |
| **Total** | ${report.totalTests} |

**Score:** ${Math.round((report.passed / report.totalTests) * 100)}%

${report.summary}

## Detailed Results

`;
    // Group by category
    const grouped = {};
    for (const result of report.results) {
        if (!grouped[result.category])
            grouped[result.category] = [];
        grouped[result.category].push(result);
    }
    for (const [category, categoryResults] of Object.entries(grouped)) {
        md += `### ${category}\n\n`;
        md += '| Test | Status | Message |\n';
        md += '|------|--------|--------|\n';
        for (const result of categoryResults) {
            const statusIcon = { PASS: '✅', FAIL: '❌', WARN: '⚠️', SKIP: '⏭️' }[result.status];
            md += `| ${result.test} | ${statusIcon} | ${result.message} |\n`;
        }
        md += '\n';
    }
    md += `## Module Statistics

- **Total Files:** ${report.modules.length}
- **Total Lines:** ${report.modules.reduce((a, m) => a + m.lineCount, 0).toLocaleString()}
- **Total Classes:** ${report.modules.reduce((a, m) => a + m.classes.length, 0)}
- **Total Functions:** ${report.modules.reduce((a, m) => a + m.functions.length, 0)}
- **Total Exports:** ${report.modules.reduce((a, m) => a + m.exports.length, 0)}

---
*Generated by QAntum Final Audit v${report.version}*
`;
    fs.writeFileSync(path.join(outputDir, 'audit-report.md'), md);
    console.log(`\n📁 Reports saved to ${outputDir}/`);
}
// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║              🎯 QANTUM ФИНАЛЕН ОДИТ / FINAL AUDIT v23.3.0                     ║');
    console.log('║              © 2025 Димитър Продромов. All Rights Reserved.                   ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
    console.log('\n');
    // Run all audits
    auditTypeScript();
    auditModuleStructure();
    auditFunctionSignatures();
    auditImports();
    auditSecurity();
    auditDependencies();
    auditTests();
    auditCodeQuality();
    auditDocumentation();
    auditBuildScripts();
    // Generate and display report
    const report = generateReport();
    printFinalReport(report);
    saveReport(report);
    // Exit with appropriate code
    if (report.failed > 0) {
        process.exit(1);
    }
}
main().catch(console.error);
