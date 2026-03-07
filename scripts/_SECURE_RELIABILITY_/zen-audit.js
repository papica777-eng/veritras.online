/**
 * 🧘 ZEN-AUDIT: ONTOLOGICAL SCANNER
 * Uses S.O.U.L. to detect "Logical Rot" and "Disharmony" across the Empire.
 */

const fs = require('fs');
const path = require('path');
const { SoulExecutor } = require('./soul-engine');

const EMPIRE_ROOT = "c:/MAGICSTICK/QAntum-Empire-1M-CODE-2026-01-02/MisteMind.-star";
const soul = new SoulExecutor();

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Convert code patterns into SOUL incantations
    let incantation = '';
    if (content.includes('TODO')) incantation += '🌑'; // TODOs are void
    if (content.includes('fixme')) incantation += '🌑';
    if (content.includes('try {') && !content.includes('catch')) incantation += '🌑'; // Dangerous
    if (content.length > 5000) incantation += '🌀'; // Complexity
    if (content.includes('class')) incantation += '🛡️'; // Structure
    if (content.includes('export')) incantation += '🕯️'; // Manifestation

    const state = soul.execute(incantation);
    return state;
}

async function runZenAudit() {
    console.log("🕯️ Initiating ZEN-AUDIT...");
    const files = getAllFiles(path.join(EMPIRE_ROOT, "src"));

    let totalEssence = 0;
    let corruptedFiles = [];

    files.forEach(file => {
        const state = scanFile(file);
        totalEssence += state.essence;

        if (state.essence < 0) {
            corruptedFiles.push({ file, essence: state.essence });
        }
    });

    console.log("\n--- 🏛️ EMPIRE ONTOLOGICAL STATUS ---");
    console.log(`Total Files Scanned: ${files.length}`);
    console.log(`Imperial Essence: ${totalEssence}`);
    console.log(`Corrupted Nodes Detected: ${corruptedFiles.length}`);

    if (corruptedFiles.length > 0) {
        console.log("\n🚩 FILES REQUIRING MEDITATION:");
        corruptedFiles.forEach(f => console.log(`- ${path.relative(EMPIRE_ROOT, f.file)} (Essence: ${f.essence})`));
    } else {
        console.log("\n✅ THE EMPIRE IS IN PERFECT HARMONY.");
    }
}

function getAllFiles(dir, files_ = []) {
    const files = fs.readdirSync(dir);
    for (const i in files) {
        const name = path.join(dir, files[i]);
        if (fs.statSync(name).isDirectory()) {
            if (!name.includes('node_modules')) getAllFiles(name, files_);
        } else {
            if (/\.(ts|js)$/.test(name)) files_.push(name);
        }
    }
    return files_;
}

    // Complexity: O(1)
runZenAudit();
