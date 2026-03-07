const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════════
// QANTUM ENTROPY CLEANER (DUPLICATE PURGER)
// ═══════════════════════════════════════════════════════════════════════════════

const TARGET_DIR = process.cwd();
const SIMILARITY_THRESHOLD = 0.60; // 60% - Да хване старите бекъпи
const EXCLUDED_FILES = ['QantumCleaner.js', 'Clean-Directory.bat', 'node_modules', '.git', 'AETERNA_ARCHIVE'];

function normalizeName(name) {
    return name.replace(/_\d+/g, '').toLowerCase(); // премахва "_1576216242"
}

// Бързо сравнение на множества от редове или думи, вместо триграми за всяка буква
function getChunks(str) {
    const chunks = new Set();
    const items = str.split(/\n/);
    for (let item of items) {
        const trimmed = item.trim();
        if (trimmed.length > 2) chunks.add(trimmed);
    }
    return chunks;
}

function calculateSimilarity(str1, str2) {
    if (str1 === str2) return 1.0;

    const set1 = getChunks(str1);
    const set2 = getChunks(str2);

    if (set1.size === 0 || set2.size === 0) return str1 === str2 ? 1.0 : 0.0;

    let intersectionSize = 0;
    for (let elem of set1) {
        if (set2.has(elem)) intersectionSize++;
    }

    const maxLines = Math.max(set1.size, set2.size);
    return maxLines === 0 ? 1.0 : intersectionSize / maxLines;
}

function getTitleCasedName(str) {
    // Вземаме името без разширението
    const ext = path.extname(str);
    const name = path.basename(str, ext);

    // Правим Title Case на името (всяка дума с главна буква)
    // Разделяме по интервали, тирета или долни черти
    const titleCasedName = name.replace(/([^\W_]+[^\s-_]*)/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    return titleCasedName + ext;
}

function scanDirectory(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (EXCLUDED_FILES.some(ex => file.includes(ex))) return;

        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(scanDirectory(fullPath));
        } else {
            // Филтрираме само текстови/кодови файлове (избягваме бинарни)
            const ext = path.extname(file).toLowerCase();
            const allowedExts = ['.ts', '.js', '.json', '.md', '.txt', '.html', '.css', '.py', '.rs'];
            if (allowedExts.includes(ext) || ext === '') {
                results.push({
                    path: fullPath,
                    name: file,
                    size: stat.size,
                    content: fs.readFileSync(fullPath, 'utf8')
                });
            }
        }
    });
    return results;
}

console.log("⚡ [QANTUM PURGER] Scanning directory for entropy...", TARGET_DIR);
const files = scanDirectory(TARGET_DIR);
console.log(`🔍 [QANTUM PURGER] Found ${files.length} valid files for inspection.`);

const duplicatesToRemove = new Set();
const renameMap = new Map();

for (let i = 0; i < files.length; i++) {
    if (duplicatesToRemove.has(files[i].path)) continue;

    for (let j = i + 1; j < files.length; j++) {
        if (duplicatesToRemove.has(files[j].path)) continue;

        const file1 = files[i];
        const file2 = files[j];

        // Бърза проверка на размера (разлика над 20% обикновено значи, че не са 90% еднакви)
        const sizeDiff = Math.abs(file1.size - file2.size) / Math.max(file1.size, file2.size);
        if (sizeDiff > 0.20) continue;

        // Проверка на името първо (МНОГО ПО-БЪРЗО!)
        const normalizedName1 = normalizeName(file1.name);
        const normalizedName2 = normalizeName(file2.name);
        // За имена, ако премахнем суфиксите _число, може да са 100% еднакви
        const nameSimilarity = calculateSimilarity(normalizedName1, normalizedName2);

        if (nameSimilarity < SIMILARITY_THRESHOLD) continue;

        // Проверка на съдържанието (само ако имат сходни имена)
        const contentSimilarity = calculateSimilarity(file1.content, file2.content);

        if (contentSimilarity >= SIMILARITY_THRESHOLD) {
            const stat1 = fs.statSync(file1.path);
            const stat2 = fs.statSync(file2.path);

            console.log(`\n💀 [DUPLICATE DETECTED] Match: ${(contentSimilarity * 100).toFixed(1)}%`);
            if (stat1.mtimeMs >= stat2.mtimeMs) {
                console.log(`   - Keep (Newer): ${file1.name}`);
                console.log(`   - Archive (Older): ${file2.name}`);
                duplicatesToRemove.add(file2.path);
            } else {
                console.log(`   - Keep (Newer): ${file2.name}`);
                console.log(`   - Archive (Older): ${file1.name}`);
                duplicatesToRemove.add(file1.path);
            }
        }
    }
}

// Преместване на дубликатите в АРХИВ (Вместо изтриване)
let purgedCounts = 0;
const archiveDir = path.join(TARGET_DIR, 'AETERNA_ARCHIVE');

if (duplicatesToRemove.size > 0 && !fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir);
}

duplicatesToRemove.forEach(filePath => {
    try {
        const fileName = path.basename(filePath);
        const destPath = path.join(archiveDir, fileName);

        // Преместване (Rename) на файла в архива
        fs.renameSync(filePath, destPath);
        purgedCounts++;
    } catch (e) {
        console.error(`❌ Error moving ${filePath} to archive:`, e.message);
    }
});
console.log(`\n🛡️  [PURGE COMPLETE] Moved ${purgedCounts} redundant files to AETERNA_ARCHIVE for safety.`);

// Преименуване на останалите
let renamedCounts = 0;
files.forEach(file => {
    if (duplicatesToRemove.has(file.path)) return; // Избягваме изтритите

    const newName = getTitleCasedName(file.name);
    if (newName !== file.name) {
        const newPath = path.join(path.dirname(file.path), newName);
        try {
            if (!fs.existsSync(newPath) || newPath.toLowerCase() === file.path.toLowerCase()) {
                fs.renameSync(file.path, newPath);
                renamedCounts++;
            }
        } catch (e) {
            console.error(`❌ Error renaming ${file.name}:`, e.message);
        }
    }
});
console.log(`💎 [CRYSTALLIZATION] Renamed ${renamedCounts} files to strict Title Case.`);
console.log(`\n/// [ENTROPY: 0.00] /// SYSTEM STABILIZED.`);
