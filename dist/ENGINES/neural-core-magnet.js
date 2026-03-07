#!/usr/bin/env npx ts-node
"use strict";
// @ts-nocheck
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                               ║
 * ║  ███╗   ██╗███████╗██╗   ██╗██████╗  █████╗ ██╗          ██████╗ ██████╗ ██████╗ ███████╗     ║
 * ║  ████╗  ██║██╔════╝██║   ██║██╔══██╗██╔══██╗██║         ██╔════╝██╔═══██╗██╔══██╗██╔════╝     ║
 * ║  ██╔██╗ ██║█████╗  ██║   ██║██████╔╝███████║██║         ██║     ██║   ██║██████╔╝█████╗       ║
 * ║  ██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██╔══██║██║         ██║     ██║   ██║██╔══██╗██╔══╝       ║
 * ║  ██║ ╚████║███████╗╚██████╔╝██║  ██║██║  ██║███████╗    ╚██████╗╚██████╔╝██║  ██║███████╗     ║
 * ║  ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝     ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝     ║
 * ║                                                                                               ║
 * ║  ███╗   ███╗ █████╗  ██████╗ ███╗   ██╗███████╗████████╗                                      ║
 * ║  ████╗ ████║██╔══██╗██╔════╝ ████╗  ██║██╔════╝╚══██╔══╝                                      ║
 * ║  ██╔████╔██║███████║██║  ███╗██╔██╗ ██║█████╗     ██║                                         ║
 * ║  ██║╚██╔╝██║██╔══██║██║   ██║██║╚██╗██║██╔══╝     ██║                                         ║
 * ║  ██║ ╚═╝ ██║██║  ██║╚██████╔╝██║ ╚████║███████╗   ██║                                         ║
 * ║  ╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝   ╚═╝                                         ║
 * ║                                                                                               ║
 * ║                    THE EVOLVED MEMORY CONSOLIDATION ENGINE                                    ║
 * ║              "Беглият спомен, който изяснява цялата картинка"                                 ║
 * ║                                                                                               ║
 * ║   Събира всичката информация в едно мозъчно ядро:                                             ║
 * ║   - Meditation Results (система анализ)                                                       ║
 * ║   - Neural Backpack (мисли и идеи)                                                            ║
 * ║   - Change History (промени)                                                                  ║
 * ║   - Cosmic Taxonomy (модули)                                                                  ║
 * ║   - Git Changes (uncommitted)                                                                 ║
 * ║                                                                                               ║
 * ║   Генерира:                                                                                   ║
 * ║   - 🧠 NEURAL-CORE.md - Пълен контекст                                                        ║
 * ║   - ⚡ FLEETING-MEMORY.md - Бегъл спомен (кратък summary)                                     ║
 * ║   - 📜 AUTO-DOCS.md - Автоматична документация                                                ║
 * ║   - 🔄 Auto-commit ако има промени                                                            ║
 * ║                                                                                               ║
 * ║   © 2026 QAntum | Dimitar Prodromov                                                           ║
 * ║                                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const path_1 = require("path");
const fs_1 = require("fs");
const child_process_1 = require("child_process");
// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
const ROOT_DIR = process.cwd();
const DATA_DIR = (0, path_1.join)(ROOT_DIR, 'data');
const CONFIG = {
    rootDir: ROOT_DIR,
    dataDir: DATA_DIR,
    outputDir: (0, path_1.join)(DATA_DIR, 'neural-core'),
    // Input sources
    sources: {
        meditation: (0, path_1.join)(DATA_DIR, 'supreme-meditation', 'meditation-result.json'),
        backpack: (0, path_1.join)(DATA_DIR, 'backpack.json'),
        changeHistory: (0, path_1.join)(DATA_DIR, 'change-history.json'),
        ecosystemManifest: (0, path_1.join)(DATA_DIR, 'ecosystem-manifest.json'),
        nerveState: (0, path_1.join)(DATA_DIR, 'nerve-center-state.json'),
        predictiveMemory: (0, path_1.join)(DATA_DIR, 'predictive-memory.json'),
        autonomousThoughts: (0, path_1.join)(DATA_DIR, 'autonomous-thought'),
    },
    // Output files
    outputs: {
        neuralCore: 'NEURAL-CORE.md',
        fleetingMemory: 'FLEETING-MEMORY.md',
        autoDocs: 'AUTO-DOCS.md',
        contextFrame: 'CONTEXT-FRAME.json',
    },
    // Limits
    maxFleetingLines: 50,
    maxRecentChanges: 20,
    maxThoughts: 10,
};
// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════
async function safeReadJSON(path, defaultValue) {
    try {
        if (!(0, fs_1.existsSync)(path))
            return defaultValue;
        const content = await (0, promises_1.readFile)(path, 'utf-8');
        return JSON.parse(content);
    }
    catch {
        return defaultValue;
    }
}
async function ensureDir(dir) {
    if (!(0, fs_1.existsSync)(dir)) {
        await (0, promises_1.mkdir)(dir, { recursive: true });
    }
}
function getGitChanges() {
    try {
        const status = (0, child_process_1.execSync)('git status --porcelain', {
            cwd: CONFIG.rootDir,
            encoding: 'utf-8'
        });
        return status.split('\n').filter(Boolean);
    }
    catch {
        return [];
    }
}
function getGitDiff() {
    try {
        return (0, child_process_1.execSync)('git diff --stat', {
            cwd: CONFIG.rootDir,
            encoding: 'utf-8',
            maxBuffer: 1024 * 1024
        });
    }
    catch {
        return '';
    }
}
function autoCommit(message) {
    try {
        (0, child_process_1.execSync)('git add -A', { cwd: CONFIG.rootDir });
        (0, child_process_1.execSync)(`git commit -m "${message}"`, { cwd: CONFIG.rootDir });
        console.log(`✅ Auto-committed: ${message}`);
        return true;
    }
    catch {
        return false;
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
// DATA COLLECTORS
// ═══════════════════════════════════════════════════════════════════════════════
async function collectMeditation() {
    return await safeReadJSON(CONFIG.sources.meditation, {});
}
async function collectBackpack() {
    const backpack = await safeReadJSON(CONFIG.sources.backpack, { slots: [] });
    return (backpack.slots || []).slice(-CONFIG.maxThoughts);
}
async function collectChangeHistory() {
    const history = await safeReadJSON(CONFIG.sources.changeHistory, { changes: [] });
    return (history.changes || []).slice(-CONFIG.maxRecentChanges);
}
async function collectAutonomousThoughts() {
    const thoughts = [];
    const thoughtDir = CONFIG.sources.autonomousThoughts;
    if (!(0, fs_1.existsSync)(thoughtDir))
        return thoughts;
    try {
        const files = await (0, promises_1.readdir)(thoughtDir);
        for (const file of files.filter(f => f.endsWith('.json')).slice(-CONFIG.maxThoughts)) {
            const thought = await safeReadJSON((0, path_1.join)(thoughtDir, file), null);
            if (thought)
                thoughts.push(thought);
        }
    }
    catch { }
    return thoughts;
}
// ═══════════════════════════════════════════════════════════════════════════════
// FLEETING MEMORY GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
function generateFleetingMemory(core) {
    const lines = [];
    const now = new Date().toISOString();
    lines.push('⚡ БЕГЪЛ СПОМЕН / FLEETING MEMORY');
    lines.push(`📅 ${now}`);
    lines.push('═'.repeat(50));
    lines.push('');
    // System State - 1 line
    if (core.systemHealth) {
        const h = core.systemHealth;
        lines.push(`🏥 Здраве: ${h.overallScore}% | ${h.files} файла | ${h.lines.toLocaleString()} LOC | ${h.symbols} символа`);
        if (h.violations > 0)
            lines.push(`⚠️ ${h.violations} нарушения | ${h.deadSymbols} мъртви символа`);
    }
    lines.push('');
    // Current Focus
    if (core.contextFrame?.currentFocus) {
        lines.push(`🎯 ФОКУС: ${core.contextFrame.currentFocus}`);
    }
    // Critical Alerts
    if (core.contextFrame?.criticalAlerts?.length) {
        lines.push('');
        lines.push('🚨 КРИТИЧНИ:');
        core.contextFrame.criticalAlerts.forEach(a => lines.push(`   • ${a}`));
    }
    // Latest Thought
    if (core.autonomousThoughts?.length) {
        const latest = core.autonomousThoughts[core.autonomousThoughts.length - 1];
        lines.push('');
        lines.push(`💡 ПОСЛЕДНА МИСЪЛ: ${latest.title || 'Без заглавие'}`);
        const desc = latest.description || '';
        lines.push(`   ${desc.slice(0, 100)}${desc.length > 100 ? '...' : ''}`);
    }
    // Recent Changes Summary
    if (core.recentChanges?.length) {
        lines.push('');
        lines.push(`📝 ПРОМЕНИ: ${core.recentChanges.length} файла наскоро`);
        const created = core.recentChanges.filter(c => c.type === 'created').length;
        const modified = core.recentChanges.filter(c => c.type === 'modified').length;
        if (created || modified) {
            lines.push(`   +${created} нови | ~${modified} редактирани`);
        }
    }
    // Git Status
    const gitChanges = getGitChanges();
    if (gitChanges.length) {
        lines.push('');
        lines.push(`🔄 GIT: ${gitChanges.length} uncommitted промени`);
    }
    lines.push('');
    lines.push('═'.repeat(50));
    lines.push('💾 Пълен контекст: NEURAL-CORE.md');
    return lines.slice(0, CONFIG.maxFleetingLines).join('\n');
}
// ═══════════════════════════════════════════════════════════════════════════════
// NEURAL CORE GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
function generateNeuralCoreMarkdown(core) {
    const lines = [];
    lines.push('# 🧠 NEURAL CORE - Мозъчно Ядро на QAntum');
    lines.push('');
    lines.push(`> Генерирано: ${core.generatedAt}`);
    lines.push(`> Версия: ${core.version}`);
    lines.push('');
    lines.push('---');
    lines.push('');
    // ═══════════════════════════════════════════════════════════════════════════
    // SYSTEM HEALTH
    // ═══════════════════════════════════════════════════════════════════════════
    lines.push('## 🏥 Системно Здраве');
    lines.push('');
    lines.push('| Метрика | Стойност |');
    lines.push('|---------|----------|');
    lines.push(`| Overall Health | **${core.systemHealth.overallScore}%** |`);
    lines.push(`| Total Files | ${core.systemHealth.files} |`);
    lines.push(`| Total Lines | ${core.systemHealth.lines.toLocaleString()} |`);
    lines.push(`| Total Symbols | ${core.systemHealth.symbols} |`);
    lines.push(`| Layer Violations | ${core.systemHealth.violations} |`);
    lines.push(`| Dead Symbols | ${core.systemHealth.deadSymbols} |`);
    lines.push('');
    // ═══════════════════════════════════════════════════════════════════════════
    // CONTEXT FRAME
    // ═══════════════════════════════════════════════════════════════════════════
    lines.push('## 🎯 Контекстна Рамка');
    lines.push('');
    lines.push(`**Текущ Фокус:** ${core.contextFrame.currentFocus || 'Не е дефиниран'}`);
    lines.push('');
    if (core.contextFrame.activeProjects.length) {
        lines.push('### Активни Проекти');
        core.contextFrame.activeProjects.forEach(p => lines.push(`- ${p}`));
        lines.push('');
    }
    if (core.contextFrame.pendingTasks.length) {
        lines.push('### Чакащи Задачи');
        core.contextFrame.pendingTasks.forEach(t => lines.push(`- [ ] ${t}`));
        lines.push('');
    }
    if (core.contextFrame.criticalAlerts.length) {
        lines.push('### 🚨 Критични Сигнали');
        core.contextFrame.criticalAlerts.forEach(a => lines.push(`- ⚠️ ${a}`));
        lines.push('');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // AUTONOMOUS THOUGHTS
    // ═══════════════════════════════════════════════════════════════════════════
    if (core.autonomousThoughts.length) {
        lines.push('## 💡 Автономни Мисли');
        lines.push('');
        for (const thought of core.autonomousThoughts) {
            lines.push(`### ${thought.title}`);
            lines.push(`- **Категория:** ${thought.category}`);
            lines.push(`- **Confidence:** ${thought.confidence}%`);
            if (thought.novelty) {
                lines.push(`- **Novelty:** ${thought.novelty.score}/100`);
            }
            lines.push(`- **Описание:** ${thought.description}`);
            lines.push('');
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // RECENT CHANGES
    // ═══════════════════════════════════════════════════════════════════════════
    if (core.recentChanges.length) {
        lines.push('## 📝 Скорошни Промени');
        lines.push('');
        lines.push('| Файл | Тип | Време |');
        lines.push('|------|-----|-------|');
        for (const change of core.recentChanges.slice(-10)) {
            const icon = change.type === 'created' ? '🆕' :
                change.type === 'modified' ? '📝' : '🗑️';
            lines.push(`| ${icon} ${(0, path_1.basename)(change.file)} | ${change.type} | ${change.timestamp} |`);
        }
        lines.push('');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // GIT STATUS
    // ═══════════════════════════════════════════════════════════════════════════
    const gitChanges = getGitChanges();
    if (gitChanges.length) {
        lines.push('## 🔄 Git Status (Uncommitted)');
        lines.push('');
        lines.push('```');
        gitChanges.slice(0, 20).forEach(c => lines.push(c));
        if (gitChanges.length > 20) {
            lines.push(`... и още ${gitChanges.length - 20} файла`);
        }
        lines.push('```');
        lines.push('');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // RECOMMENDATIONS
    // ═══════════════════════════════════════════════════════════════════════════
    if (core.recommendations.length) {
        lines.push('## 📋 Препоръки');
        lines.push('');
        core.recommendations.forEach(r => lines.push(`- ${r}`));
        lines.push('');
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // BACKPACK
    // ═══════════════════════════════════════════════════════════════════════════
    if (core.backpackContents.length) {
        lines.push('## 🎒 Neural Backpack');
        lines.push('');
        for (const entry of core.backpackContents.slice(-5)) {
            lines.push(`### Slot ${entry.slot}: ${entry.title || entry.type}`);
            lines.push(`- **Тип:** ${entry.type}`);
            lines.push(`- **Време:** ${entry.timestamp}`);
            lines.push('');
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // FLEETING MEMORY
    // ═══════════════════════════════════════════════════════════════════════════
    lines.push('## ⚡ Бегъл Спомен (Quick Context)');
    lines.push('');
    lines.push('```');
    lines.push(core.fleetingMemory);
    lines.push('```');
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('*Генерирано автоматично от Neural Core Magnet v1.0*');
    lines.push('*"Беглият спомен, който изяснява цялата картинка"*');
    return lines.join('\n');
}
// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-DOCS GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
function generateAutoDocs(core) {
    const lines = [];
    lines.push('# 📜 AUTO-DOCS - Автоматична Документация');
    lines.push('');
    lines.push(`> Генерирано: ${core.generatedAt}`);
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## Промени за Документиране');
    lines.push('');
    if (core.recentChanges.length) {
        const created = core.recentChanges.filter(c => c.type === 'created');
        const modified = core.recentChanges.filter(c => c.type === 'modified');
        if (created.length) {
            lines.push('### 🆕 Нови Файлове');
            created.forEach(c => {
                lines.push(`- **${c.file}**`);
                if (c.summary)
                    lines.push(`  - ${c.summary}`);
            });
            lines.push('');
        }
        if (modified.length) {
            lines.push('### 📝 Модифицирани Файлове');
            modified.forEach(c => {
                lines.push(`- **${c.file}**`);
                if (c.summary)
                    lines.push(`  - ${c.summary}`);
            });
            lines.push('');
        }
    }
    lines.push('## Commit Message Suggestion');
    lines.push('');
    lines.push('```');
    // Generate commit message based on changes
    const gitChanges = getGitChanges();
    const addedFiles = gitChanges.filter(c => c.startsWith('A') || c.startsWith('?')).length;
    const modifiedFiles = gitChanges.filter(c => c.startsWith('M')).length;
    const deletedFiles = gitChanges.filter(c => c.startsWith('D')).length;
    let commitType = 'chore';
    let commitScope = 'core';
    let commitDesc = 'update system';
    if (addedFiles > modifiedFiles) {
        commitType = 'feat';
        commitDesc = `add ${addedFiles} new files`;
    }
    else if (modifiedFiles > 0) {
        commitType = 'refactor';
        commitDesc = `update ${modifiedFiles} files`;
    }
    if (core.autonomousThoughts.length) {
        const latestThought = core.autonomousThoughts[core.autonomousThoughts.length - 1];
        if (latestThought.category) {
            commitScope = latestThought.category.toLowerCase();
        }
    }
    lines.push(`${commitType}(${commitScope}): ${commitDesc}`);
    lines.push('');
    lines.push('Changes:');
    if (addedFiles)
        lines.push(`- Added ${addedFiles} files`);
    if (modifiedFiles)
        lines.push(`- Modified ${modifiedFiles} files`);
    if (deletedFiles)
        lines.push(`- Deleted ${deletedFiles} files`);
    lines.push('');
    lines.push('Generated by Neural Core Magnet');
    lines.push('```');
    lines.push('');
    return lines.join('\n');
}
// ═══════════════════════════════════════════════════════════════════════════════
// MAIN CONSOLIDATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
async function consolidate() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                    🧲 NEURAL CORE MAGNET v1.0                            ║
║           "Беглият спомен, който изяснява цялата картинка"               ║
╚══════════════════════════════════════════════════════════════════════════╝
`);
    console.log('📡 Събиране на данни от всички източници...\n');
    // Collect all data
    const [meditation, backpack, changes, thoughts] = await Promise.all([
        collectMeditation(),
        collectBackpack(),
        collectChangeHistory(),
        collectAutonomousThoughts(),
    ]);
    console.log('   ✓ Meditation Results');
    console.log('   ✓ Neural Backpack');
    console.log('   ✓ Change History');
    console.log('   ✓ Autonomous Thoughts');
    console.log('');
    // Build Neural Core
    const core = {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        systemHealth: {
            overallScore: meditation.overallHealth || 0,
            files: meditation.assimilation?.totalFiles || 0,
            lines: meditation.assimilation?.totalLines || 0,
            symbols: meditation.assimilation?.totalSymbols || 0,
            violations: meditation.layerAudit?.violations?.length || 0,
            deadSymbols: (meditation.deadSymbols?.unusedExports?.length || 0) +
                (meditation.deadSymbols?.unusedInterfaces?.length || 0),
        },
        recentChanges: changes,
        autonomousThoughts: thoughts,
        backpackContents: backpack,
        recommendations: meditation.recommendations || [],
        contextFrame: {
            currentFocus: 'QAntum Empire Development',
            activeProjects: [
                'QA-SAAS - SaaS платформа',
                'Genesis Engine - Онтологична ковачница',
                'Cosmic Taxonomy - 7 сетива',
                'Neural Core Magnet - Този скрипт',
            ],
            pendingTasks: [
                'Довърши Cosmic Taxonomy с всички 180+ модула',
                'Интегрирай Genesis с production',
                'Прочисти 926 мъртви символа',
                'Fix 2 layer violations',
            ],
            criticalAlerts: meditation.layerAudit?.violations?.length
                ? [`${meditation.layerAudit.violations.length} layer violations`]
                : [],
        },
        fleetingMemory: '', // Will be generated
    };
    // Generate Fleeting Memory
    core.fleetingMemory = generateFleetingMemory(core);
    console.log('🧠 Консолидиране в Neural Core...\n');
    // Ensure output directory
    await ensureDir(CONFIG.outputDir);
    // Generate and save all outputs
    const neuralCoreMd = generateNeuralCoreMarkdown(core);
    const autoDocsMd = generateAutoDocs(core);
    await (0, promises_1.writeFile)((0, path_1.join)(CONFIG.outputDir, CONFIG.outputs.neuralCore), neuralCoreMd);
    console.log('   ✓ NEURAL-CORE.md');
    await (0, promises_1.writeFile)((0, path_1.join)(CONFIG.outputDir, CONFIG.outputs.fleetingMemory), core.fleetingMemory);
    console.log('   ✓ FLEETING-MEMORY.md');
    await (0, promises_1.writeFile)((0, path_1.join)(CONFIG.outputDir, CONFIG.outputs.autoDocs), autoDocsMd);
    console.log('   ✓ AUTO-DOCS.md');
    await (0, promises_1.writeFile)((0, path_1.join)(CONFIG.outputDir, CONFIG.outputs.contextFrame), JSON.stringify(core, null, 2));
    console.log('   ✓ CONTEXT-FRAME.json');
    console.log('');
    // Show Fleeting Memory
    console.log('═'.repeat(70));
    console.log(core.fleetingMemory);
    console.log('═'.repeat(70));
    console.log('');
    // Check for auto-commit
    const gitChanges = getGitChanges();
    if (gitChanges.length > 0) {
        console.log(`\n🔄 Открити ${gitChanges.length} uncommitted промени.`);
        // Auto-commit option
        if (process.argv.includes('--auto-commit')) {
            const commitMsg = `chore(neural-core): auto-consolidation ${new Date().toISOString().split('T')[0]}`;
            autoCommit(commitMsg);
        }
        else {
            console.log('   Използвай --auto-commit за автоматичен commit');
        }
    }
    console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                         ✅ CONSOLIDATION COMPLETE                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║  📁 Output: ${CONFIG.outputDir.padEnd(52)}║
║  🧠 Neural Core: ${core.systemHealth.files} файла | ${core.systemHealth.lines.toLocaleString().padEnd(6)} LOC               ║
║  💡 Thoughts: ${core.autonomousThoughts.length} | 📝 Changes: ${core.recentChanges.length.toString().padEnd(25)}║
╚══════════════════════════════════════════════════════════════════════════╝
`);
    return core;
}
// ═══════════════════════════════════════════════════════════════════════════════
// WATCH MODE
// ═══════════════════════════════════════════════════════════════════════════════
async function watchMode() {
    console.log('👁️ Watch mode активиран. Консолидация на всеки 5 минути...');
    // Initial consolidation
    await consolidate();
    // Set up interval
    setInterval(async () => {
        console.log(`\n⏰ [${new Date().toLocaleTimeString()}] Автоматична консолидация...`);
        await consolidate();
    }, 5 * 60 * 1000); // Every 5 minutes
}
// ═══════════════════════════════════════════════════════════════════════════════
// ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════
const isWatch = process.argv.includes('--watch');
if (isWatch) {
    watchMode();
}
else {
    consolidate()
        .then(() => process.exit(0))
        .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
}
