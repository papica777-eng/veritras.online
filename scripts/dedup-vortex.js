/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BRUTALITY-VORTEX DEDUP ENGINE
 * Identifies duplicate files by extracting canonical names from path-encoded
 * filenames, keeps the best version (largest + highest priority source),
 * copies clean results to Desktop, generates audit report.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = String.raw`C:\Users\papic\Desktop\QANTUM_QA_NEXUS\GITHUB_QA_REPOS\QAntum-Mind-Engine-Self-Healing-copilot-create-fullstack-enterprise-project\enterprise\brutality-vortex`;
const DST_DIR = String.raw`C:\Users\papic\Desktop\brutality-vortex-clean`;

// ─── Priority tiers (higher = better source) ───
function getSourcePriority(filename) {
    // Lowest priority: backup copies
    if (filename.includes('.purge-backup')) return 1;
    if (filename.includes('.ascension-backup')) return 1;
    if (filename.includes('_ARCHIVE_')) return 2;
    if (filename.includes('jules_session')) return 3;
    if (filename.includes('QAntum-WEB-CORE')) return 4;
    if (filename.includes('QAntum-NEW')) return 4;
    // Mid priority: various project paths  
    if (filename.includes('ManualQATester')) return 5;
    if (filename.includes('MisterMind-Site')) return 5;
    if (filename.includes('MrMindQATool')) return 6;
    if (filename.includes('MisteMind')) return 6;
    if (filename.includes('Mind-Engine-Core')) return 7;
    if (filename.includes('QAntum-Empire')) return 7;
    // Higher: QAntumBVortex direct paths
    if (filename.includes('QAntumBVortex__scripts__src__')) return 8;
    if (filename.includes('QAntumBVortex__src__')) return 9;
    if (filename.includes('QAntumBVortex__scripts__')) return 8;
    // Highest: top-level files (no encoded path)
    if (!filename.includes('C__')) return 10;
    return 5;
}

// ─── Extract the canonical filename from path-encoded name ───
function extractCanonicalName(filename) {
    // Remove extension to work with base
    const ext = path.extname(filename);
    let base = path.basename(filename, ext);
    
    // Strip all path segments - the actual file name is the LAST segment after __
    const segments = base.split('__');
    
    // For files like "bola-tester.ts" with no __ encoding, return as-is
    if (segments.length <= 1) return filename;
    
    // The actual filename is the last segment
    let canonical = segments[segments.length - 1];
    
    // Sometimes last 2 segments form path like "evolution__HiveMind"
    // We want the deepest context: "subdir/filename"
    // But for dedup, we primarily care about the base filename
    // However, same name in different modules = different file (e.g. auto-test-factory in cognitive vs oracle)
    
    // Extract meaningful subdirectory context (last 2-3 meaningful segments)
    // Skip noise segments like C, Users, papic, Downloads, MAGICSTICK, timestamps, etc.
    const noisePatterns = /^(C|Users|papic|Downloads|Desktop|MAGICSTICK|Mind-Engine-Core|QAntum.*|MisteMind.*|MrMind.*|ManualQATester|MisterMind.*|QAntum.*|jules.*|TheArchitect|ALLIN.*|tools|scripts|src|tests|bug-reports|docs|TRAINING|PRIVATE|PROJECT|dpengeneering|cybercody_.*|SCRIPTS|purge-backup|ascension-backup|ARCHIVE|security_core|modules|apps|packages|api|worker)$/i;
    
    const meaningful = segments.filter(s => !noisePatterns.test(s) && !/^\d{4}-\d{2}-\d{2}/.test(s) && s.length > 1);
    
    if (meaningful.length >= 2) {
        // Use last 2 meaningful segments as "context/filename"
        canonical = meaningful.slice(-2).join('/');
    } else if (meaningful.length === 1) {
        canonical = meaningful[0];
    }
    
    return canonical + ext;
}

// ─── MAIN ───
console.log('═══════════════════════════════════════════════════');
console.log('  BRUTALITY-VORTEX DEDUP ENGINE');
console.log('═══════════════════════════════════════════════════\n');

const files = fs.readdirSync(SRC_DIR).filter(f => fs.statSync(path.join(SRC_DIR, f)).isFile());
console.log(`Total files scanned: ${files.length}`);

// Group by canonical name
const groups = {};
for (const f of files) {
    const canonical = extractCanonicalName(f);
    if (!groups[canonical]) groups[canonical] = [];
    const stat = fs.statSync(path.join(SRC_DIR, f));
    groups[canonical].push({
        original: f,
        size: stat.size,
        priority: getSourcePriority(f),
        canonical,
    });
}

const totalGroups = Object.keys(groups).length;
const dupeGroups = Object.entries(groups).filter(([, v]) => v.length > 1);
console.log(`Unique files (canonical): ${totalGroups}`);
console.log(`Duplicate groups: ${dupeGroups.length}`);
console.log(`Files that are duplicates: ${files.length - totalGroups}\n`);

// For each group, pick the winner: highest priority, then largest size
const winners = [];
const losers = [];

for (const [canonical, group] of Object.entries(groups)) {
    // Sort: priority DESC, then size DESC
    group.sort((a, b) => b.priority - a.priority || b.size - a.size);
    winners.push(group[0]);
    for (let i = 1; i < group.length; i++) {
        losers.push(group[i]);
    }
}

console.log(`WINNERS (keeping): ${winners.length}`);
console.log(`LOSERS (deleting): ${losers.length}`);

// Show duplicate groups with >3 copies
console.log('\n─── Top duplicate groups ───');
dupeGroups
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 20)
    .forEach(([canonical, group]) => {
        console.log(`  ${canonical} → ${group.length} copies (keeping: ${group[0].original.substring(0, 60)}...)`);
    });

// ─── Create clean output ───
console.log(`\n─── Creating clean folder: ${DST_DIR} ───`);
if (!fs.existsSync(DST_DIR)) fs.mkdirSync(DST_DIR, { recursive: true });

// Organize winners into subdirectories based on their canonical path
let copiedCount = 0;
let totalKeptSize = 0;

for (const w of winners) {
    const canonical = w.canonical;
    // If canonical has a "/" it means "subdir/filename"
    const parts = canonical.split('/');
    let destSubDir = DST_DIR;
    
    if (parts.length > 1) {
        destSubDir = path.join(DST_DIR, ...parts.slice(0, -1));
    }
    
    if (!fs.existsSync(destSubDir)) fs.mkdirSync(destSubDir, { recursive: true });
    
    const destFile = path.join(destSubDir, parts[parts.length - 1]);
    
    // Handle name collisions in dest
    let finalDest = destFile;
    if (fs.existsSync(finalDest)) {
        const ext = path.extname(finalDest);
        const base = path.basename(finalDest, ext);
        const dir = path.dirname(finalDest);
        let counter = 2;
        while (fs.existsSync(finalDest)) {
            finalDest = path.join(dir, `${base}_v${counter}${ext}`);
            counter++;
        }
    }
    
    fs.copyFileSync(path.join(SRC_DIR, w.original), finalDest);
    copiedCount++;
    totalKeptSize += w.size;
}

const totalOrigSize = files.reduce((sum, f) => sum + fs.statSync(path.join(SRC_DIR, f)).size, 0);

console.log(`\n═══════════════════════════════════════════════════`);
console.log(`  DEDUP RESULTS`);
console.log(`═══════════════════════════════════════════════════`);
console.log(`  Original files:  ${files.length}`);
console.log(`  Original size:   ${(totalOrigSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Kept (winners):  ${copiedCount}`);
console.log(`  Kept size:       ${(totalKeptSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Removed (dupes): ${losers.length}`);
console.log(`  Space saved:     ${((totalOrigSize - totalKeptSize) / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Reduction:       ${((1 - totalKeptSize / totalOrigSize) * 100).toFixed(1)}%`);
console.log(`  Clean folder:    ${DST_DIR}`);
console.log(`═══════════════════════════════════════════════════\n`);

// Save audit log
const audit = {
    timestamp: new Date().toISOString(),
    source: SRC_DIR,
    destination: DST_DIR,
    totalOriginal: files.length,
    totalKept: copiedCount,
    totalRemoved: losers.length,
    originalSizeMB: +(totalOrigSize / 1024 / 1024).toFixed(2),
    keptSizeMB: +(totalKeptSize / 1024 / 1024).toFixed(2),
    reductionPercent: +((1 - totalKeptSize / totalOrigSize) * 100).toFixed(1),
    winners: winners.map(w => ({ file: w.original, canonical: w.canonical, size: w.size, priority: w.priority })),
    losers: losers.map(l => ({ file: l.original, canonical: l.canonical, size: l.size, priority: l.priority })),
};
fs.writeFileSync(path.join(DST_DIR, '_DEDUP-AUDIT.json'), JSON.stringify(audit, null, 2));
console.log('Audit log saved: _DEDUP-AUDIT.json');
