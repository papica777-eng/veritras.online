#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUTO MODULE CONNECTOR - Автоматично свързване на модули
 * ═══════════════════════════════════════════════════════════════════════════════
 * Намира и свързва всички модули автоматично, без значение къде се намират
 */

import { readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Модули които търсим
const TARGET_MODULES = [
    'ModuleAdapter',
    'ModuleRegistry',
    'SystemOrchestrator',
    'QAntumConsole',
    'NeuralHub',
    'DepartmentEngine'
];

// Директории които пропускаме
const IGNORE_DIRS = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'coverage',
    '.vscode',
    '.idea'
];

/**
 * Рекурсивно сканиране на директории
 */
async function scanDirectory(dir, depth = 0, maxDepth = 5) {
    if (depth > maxDepth) return [];

    const found = [];

    try {
        const entries = await readdir(dir);

        for (const entry of entries) {
            // Пропускаме игнорирани директории
            if (IGNORE_DIRS.includes(entry)) continue;
            if (entry.startsWith('.')) continue;

            const fullPath = join(dir, entry);

            try {
                const stats = await stat(fullPath);

                if (stats.isDirectory()) {
                    // Рекурсивно сканиране
                    const subResults = await scanDirectory(fullPath, depth + 1, maxDepth);
                    found.push(...subResults);
                } else if (stats.isFile()) {
                    // Проверяваме дали файлът е модул
                    const ext = entry.split('.').pop();
                    if (['ts', 'js', 'mjs'].includes(ext)) {
                        const baseName = entry.replace(/\.(ts|js|mjs)$/, '');

                        if (TARGET_MODULES.includes(baseName)) {
                            found.push({
                                name: baseName,
                                path: fullPath,
                                relativePath: relative(PROJECT_ROOT, fullPath),
                                type: ext
                            });
                        }
                    }
                }
            } catch (err) {
                // Пропускаме файлове с грешки при достъп
            }
        }
    } catch (err) {
        console.error(`⚠️  Грешка при сканиране на ${dir}:`, err.message);
    }

    return found;
}

/**
 * Главна функция
 */
async function main() {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                                                               ║');
    console.log('║   🔍 AUTO MODULE CONNECTOR - Автоматично търсене на модули    ║');
    console.log('║                                                               ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    console.log(`📂 Сканиране на: ${PROJECT_ROOT}\n`);
    console.log(`🎯 Търсене на ${TARGET_MODULES.length} модула...\n`);

    const startTime = Date.now();
    const modules = await scanDirectory(PROJECT_ROOT);
    const duration = Date.now() - startTime;

    console.log(`\n⏱️  Сканирането завърши за ${duration}ms\n`);
    console.log('═'.repeat(65));
    console.log('📊 НАМЕРЕНИ МОДУЛИ:');
    console.log('═'.repeat(65));

    if (modules.length === 0) {
        console.log('\n❌ Не са намерени модули!\n');
        return;
    }

    // Групиране по име
    const grouped = {};
    for (const mod of modules) {
        if (!grouped[mod.name]) {
            grouped[mod.name] = [];
        }
        grouped[mod.name].push(mod);
    }

    // Показване на резултатите
    for (const [name, instances] of Object.entries(grouped)) {
        const status = instances.length === 1 ? '✅' : '⚠️';
        console.log(`\n${status} ${name} (${instances.length} ${instances.length === 1 ? 'екземпляр' : 'екземпляра'})`);

        for (const inst of instances) {
            console.log(`   📍 ${inst.relativePath}`);
        }
    }

    console.log('\n' + '═'.repeat(65));
    console.log(`\n✨ Общо намерени: ${modules.length} файла за ${Object.keys(grouped).length} модула\n`);

    // Проверка за липсващи модули
    const foundNames = new Set(Object.keys(grouped));
    const missing = TARGET_MODULES.filter(m => !foundNames.has(m));

    if (missing.length > 0) {
        console.log('⚠️  ЛИПСВАЩИ МОДУЛИ:');
        for (const m of missing) {
            console.log(`   ❌ ${m}`);
        }
        console.log('');
    }

    // Експортиране на резултатите
    const results = {
        scannedAt: new Date().toISOString(),
        projectRoot: PROJECT_ROOT,
        duration,
        modules: grouped,
        summary: {
            total: modules.length,
            unique: Object.keys(grouped).length,
            missing: missing.length
        }
    };

    // Записване в JSON файл
    const { writeFile } = await import('fs/promises');
    const outputPath = join(PROJECT_ROOT, 'module-map.json');
    await writeFile(outputPath, JSON.stringify(results, null, 2));

    console.log(`💾 Резултатите са записани в: module-map.json\n`);

    return results;
}

// Стартиране
main().catch(err => {
    console.error('❌ Фатална грешка:', err);
    process.exit(1);
});
