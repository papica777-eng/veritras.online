/**
 * add-copyright — Qantum Module
 * @module add-copyright
 * @path scripts/add-copyright.js
 * @auto-documented BrutalDocEngine v2.1
 */

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const COPYRIGHT_YEAR = '2025';
const COPYRIGHT_HOLDER = 'Димитър Продромов (Dimitar Prodromov)';
const PROJECT_NAME = 'QAntum';

// Directories to skip
const SKIP_DIRS = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.nyc_output',
    '.vscode',
    '.idea',
    'vendor',
    '__pycache__'
];

// Files to skip
const SKIP_FILES = [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '.gitignore',
    '.env',
    '.env.local',
    '.env.example',
    'LICENSE',
    'CHANGELOG.md',
    'CONTRIBUTING.md',
    'SECURITY.md'
];

// ═══════════════════════════════════════════════════════════════════════════════
// 📜 COPYRIGHT HEADERS BY FILE TYPE
// ═══════════════════════════════════════════════════════════════════════════════

const HEADERS = {
    // JavaScript/TypeScript/Java/C-style comments
    js: `/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ${PROJECT_NAME}
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * @copyright ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER}. All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 * 
 * This file is part of ${PROJECT_NAME}.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 * 
 * For licensing inquiries: dp@qantum.site
 * ═══════════════════════════════════════════════════════════════════════════════
 */

`,

    // HTML/XML comments
    html: `<!--
═══════════════════════════════════════════════════════════════════════════════
${PROJECT_NAME}
═══════════════════════════════════════════════════════════════════════════════

@copyright ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER}. All Rights Reserved.
@license PROPRIETARY AND CONFIDENTIAL

This file is part of ${PROJECT_NAME}.
Unauthorized copying, modification, distribution, or use of this file,
via any medium, is strictly prohibited without express written permission.

For licensing inquiries: dp@qantum.site
═══════════════════════════════════════════════════════════════════════════════
-->

`,

    // CSS comments
    css: `/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ${PROJECT_NAME}
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * @copyright ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER}. All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 * ═══════════════════════════════════════════════════════════════════════════════
 */

`,

    // Python/Shell/YAML comments
    python: `# ═══════════════════════════════════════════════════════════════════════════════
# ${PROJECT_NAME}
# ═══════════════════════════════════════════════════════════════════════════════
#
# @copyright ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER}. All Rights Reserved.
# @license PROPRIETARY AND CONFIDENTIAL
#
# This file is part of ${PROJECT_NAME}.
# Unauthorized copying, modification, distribution, or use of this file,
# via any medium, is strictly prohibited without express written permission.
#
# For licensing inquiries: dp@qantum.site
# ═══════════════════════════════════════════════════════════════════════════════

`,

    // Markdown (special - at the end of frontmatter or at top)
    md: `<!-- 
═══════════════════════════════════════════════════════════════════════════════
${PROJECT_NAME} | © ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER}. All Rights Reserved.
═══════════════════════════════════════════════════════════════════════════════
-->

`
};

// File extension to header type mapping
const EXTENSION_MAP = {
    // JavaScript family
    '.js': 'js',
    '.jsx': 'js',
    '.ts': 'js',
    '.tsx': 'js',
    '.mjs': 'js',
    '.cjs': 'js',
    
    // Web
    '.html': 'html',
    '.htm': 'html',
    '.xml': 'html',
    '.svg': 'html',
    '.vue': 'html',
    
    // Styles
    '.css': 'css',
    '.scss': 'css',
    '.sass': 'css',
    '.less': 'css',
    
    // Python/Shell
    '.py': 'python',
    '.sh': 'python',
    '.bash': 'python',
    '.zsh': 'python',
    '.yaml': 'python',
    '.yml': 'python',
    
    // Documentation
    '.md': 'md',
    '.mdx': 'md',
    
    // Other languages with C-style comments
    '.java': 'js',
    '.c': 'js',
    '.cpp': 'js',
    '.h': 'js',
    '.hpp': 'js',
    '.cs': 'js',
    '.go': 'js',
    '.rs': 'js',
    '.swift': 'js',
    '.kt': 'js',
    '.scala': 'js',
    '.php': 'js',
    '.json': null  // Skip JSON files (no comments allowed)
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if file already has copyright header
 */
function hasCopyrightHeader(content) {
    // Only check for the NEW correct copyright - ignore old wrong names
    return content.includes('Димитър Продромов') || content.includes('Dimitar Prodromov');
}

/**
 * Get the appropriate header for a file extension
 */
function getHeaderForExtension(ext) {
    const headerType = EXTENSION_MAP[ext.toLowerCase()];
    if (headerType === null) return null; // Explicitly skip
    if (headerType === undefined) return null; // Unknown extension
    return HEADERS[headerType];
}

/**
 * Handle special cases like shebang lines
 */
function addHeaderToContent(content, header, ext) {
    // Handle shebang lines (#!/usr/bin/env node, etc.)
    if (content.startsWith('#!')) {
        const firstLineEnd = content.indexOf('\n');
        const shebang = content.substring(0, firstLineEnd + 1);
        const rest = content.substring(firstLineEnd + 1);
        return shebang + '\n' + header + rest;
    }
    
    // Handle XML declaration
    if (content.startsWith('<?xml')) {
        const firstLineEnd = content.indexOf('?>');
        const xmlDecl = content.substring(0, firstLineEnd + 2);
        const rest = content.substring(firstLineEnd + 2);
        return xmlDecl + '\n' + header + rest;
    }
    
    // Handle HTML doctype
    if (content.toLowerCase().startsWith('<!doctype')) {
        const firstLineEnd = content.indexOf('>');
        const doctype = content.substring(0, firstLineEnd + 1);
        const rest = content.substring(firstLineEnd + 1);
        return doctype + '\n' + header + rest;
    }
    
    return header + content;
}

/**
 * Recursively get all files in directory
 */
function getAllFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (!SKIP_DIRS.includes(item)) {
                // Complexity: O(1)
                getAllFiles(fullPath, files);
            }
        } else {
            if (!SKIP_FILES.includes(item)) {
                files.push(fullPath);
            }
        }
    }
    
    return files;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

console.log(`
████████████████████████████████████████████████████████████████████████████████
█══════════════════════════════════════════════════════════════════════════════█
█              🏆 QANTUM COPYRIGHT STAMPER v1.0 🏆                       █
█══════════════════════════════════════════════════════════════════════════════█
████████████████████████████████████████████████████████████████████████████████

📜 Copyright: © ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER}
🔒 License: PROPRIETARY AND CONFIDENTIAL
📁 Scanning project directory...
`);

const projectRoot = path.resolve(__dirname, '..');
const startTime = Date.now();

let stamped = 0;
let skipped = 0;
let alreadyHas = 0;
let errors = 0;

const stampedFiles = [];
const skippedFiles = [];
const errorFiles = [];

try {
    const files = getAllFiles(projectRoot);
    
    console.log(`📊 Found ${files.length} files to process\n`);
    console.log('─'.repeat(80));
    
    for (const file of files) {
        const ext = path.extname(file);
        const relativePath = path.relative(projectRoot, file);
        const header = getHeaderForExtension(ext);
        
        if (!header) {
            skipped++;
            skippedFiles.push(relativePath);
            continue;
        }
        
        try {
            const content = fs.readFileSync(file, 'utf-8');
            
            if (hasCopyrightHeader(content)) {
                alreadyHas++;
                console.log(`✅ [ALREADY] ${relativePath}`);
                continue;
            }
            
            const newContent = addHeaderToContent(content, header, ext);
            fs.writeFileSync(file, newContent, 'utf-8');
            
            stamped++;
            stampedFiles.push(relativePath);
            console.log(`🔏 [STAMPED] ${relativePath}`);
            
        } catch (err) {
            errors++;
            errorFiles.push({ file: relativePath, error: err.message });
            console.log(`❌ [ERROR]   ${relativePath}: ${err.message}`);
        }
    }
    
} catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
}

const duration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log(`
${'─'.repeat(80)}

████████████████████████████████████████████████████████████████████████████████
█══════════════════════════════════════════════════════════════════════════════█
█                    📊 COPYRIGHT STAMPING COMPLETE 📊                        █
█══════════════════════════════════════════════════════════════════════════════█
████████████████████████████████████████████████████████████████████████████████

⏱️  Duration: ${duration} seconds
📁 Files Processed: ${stamped + alreadyHas + skipped + errors}

────────────────────────────────────────────────────────────────────────────────
RESULTS:
────────────────────────────────────────────────────────────────────────────────
🔏 NEWLY STAMPED:    ${stamped} files
✅ ALREADY HAD:      ${alreadyHas} files
⏭️  SKIPPED:         ${skipped} files (unsupported extensions)
❌ ERRORS:           ${errors} files

────────────────────────────────────────────────────────────────────────────────
🏆 TOTAL PROTECTED:  ${stamped + alreadyHas} files
────────────────────────────────────────────────────────────────────────────────

${stamped > 0 ? `
🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
⚔️  ${PROJECT_NAME} IS NOW PROPRIETARY PROPERTY!
🏆 © ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER}. ALL RIGHTS RESERVED.
🔒 UNAUTHORIZED USE IS STRICTLY PROHIBITED!
🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
` : '✅ All files already have copyright headers!'}
`);

// Output stamped files list
if (stampedFiles.length > 0 && stampedFiles.length <= 50) {
    console.log('\n📋 STAMPED FILES:');
    stampedFiles.forEach((f, i) => console.log(`   ${(i + 1).toString().padStart(2)}. ${f}`));
}

// Output errors if any
if (errorFiles.length > 0) {
    console.log('\n⚠️  FILES WITH ERRORS:');
    errorFiles.forEach(({ file, error }) => console.log(`   ❌ ${file}: ${error}`));
}

console.log('\n🚀 ГАЗ ДО КРАЙ! Your code is now professionally marked! 🏆\n');
