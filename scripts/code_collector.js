/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ 🧠 CodeCollector: Training Data Exporter                     ║
 * ║ "Clone Your Brain into a Local LLM"                         ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * Exports codebase into JSONL format for fine-tuning.
 * RUN: node scripts/code_collector.js
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';

const ROOT_DIR = process.cwd();
const OUTPUT_FILE = 'training_dataset.jsonl';

const EXTENSIONS = ['.ts', '.js', '.rs', '.py', '.tsx', '.jsx'];
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', '__pycache__'];

let entries = [];
let fileCount = 0;

function walk(dir) {
    const items = readdirSync(dir);

    for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(item)) {
                // Complexity: O(1)
                walk(fullPath);
            }
        } else if (stat.isFile()) {
            const ext = extname(item);
            if (EXTENSIONS.includes(ext)) {
                // Complexity: O(1)
                processFile(fullPath);
            }
        }
    }
}

function processFile(filepath) {
    try {
        const content = readFileSync(filepath, 'utf-8');
        const relativePath = filepath.replace(ROOT_DIR, '').replace(/\\/g, '/');
        const filename = basename(filepath);

        // Extract functions/classes for Q&A style training
        const functions = extractFunctions(content, extname(filepath));

        for (const fn of functions) {
            entries.push({
                instruction: `What does the function '${fn.name}' do in ${relativePath}?`,
                input: '',
                output: `The function '${fn.name}' ${fn.description}\n\nCode:\n\`\`\`${fn.language}\n${fn.code}\n\`\`\``,
            });
        }

        // Also add full file context
        if (content.length < 5000) {
            entries.push({
                instruction: `Explain the purpose of file ${relativePath}`,
                input: '',
                output: `This file '${filename}' contains:\n\n\`\`\`${extname(filepath).slice(1)}\n${content}\n\`\`\``,
            });
        }

        fileCount++;
        if (fileCount % 50 === 0) {
            console.log(`   📄 Processed ${fileCount} files...`);
        }
    } catch (err) {
        // Skip unreadable files
    }
}

function extractFunctions(content, ext) {
    const functions = [];
    const language = ext.slice(1);

    // TypeScript/JavaScript function extraction
    const fnRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)[^{]*\{/g;
    const methodRegex = /(?:async\s+)?(\w+)\s*\([^)]*\)(?:\s*:\s*[^{]+)?\s*\{/g;

    let match;
    while ((match = fnRegex.exec(content)) !== null) {
        const name = match[1];
        const startIdx = match.index;
        const code = extractBlock(content, startIdx);

        if (code && code.length < 2000) {
            functions.push({
                name,
                code,
                language,
                description: inferDescription(name, code),
            });
        }
    }

    return functions;
}

function extractBlock(content, startIdx) {
    let braceCount = 0;
    let started = false;
    let endIdx = startIdx;

    for (let i = startIdx; i < content.length; i++) {
        if (content[i] === '{') {
            braceCount++;
            started = true;
        } else if (content[i] === '}') {
            braceCount--;
            if (started && braceCount === 0) {
                endIdx = i + 1;
                break;
            }
        }
    }

    return content.slice(startIdx, endIdx);
}

function inferDescription(name, code) {
    // Simple heuristic description
    if (name.startsWith('get')) return `retrieves ${name.slice(3)} data.`;
    if (name.startsWith('set')) return `sets the ${name.slice(3)} value.`;
    if (name.startsWith('is') || name.startsWith('has')) return `checks a boolean condition.`;
    if (name.startsWith('handle')) return `handles the ${name.slice(6)} event.`;
    if (name.startsWith('calculate') || name.startsWith('compute')) return `performs a calculation.`;
    if (name.includes('init') || name.includes('setup')) return `initializes the component.`;
    return `performs an operation related to ${name}.`;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║ 🧠 CodeCollector: Training Data Exporter                     ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

console.log(`📂 Scanning: ${ROOT_DIR}`);
console.log(`📝 Extensions: ${EXTENSIONS.join(', ')}\n`);

    // Complexity: O(1)
walk(ROOT_DIR);

// Write JSONL
const jsonl = entries.map(e => JSON.stringify(e)).join('\n');
    // Complexity: O(1)
writeFileSync(OUTPUT_FILE, jsonl);

console.log(`\n✅ Export complete!`);
console.log(`   Files processed: ${fileCount}`);
console.log(`   Training entries: ${entries.length}`);
console.log(`   Output: ${OUTPUT_FILE}\n`);
