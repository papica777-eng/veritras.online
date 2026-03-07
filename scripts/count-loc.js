/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  QAntum Prime - ЧЕСТЕН LOC БРОЯЧ                                          ║
 * ║  Реални числа, без закръгляне, без измислици                              ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const EMPIRE_PATHS = {
  core: 'C:\\MisteMind',
  shield: 'C:\\MrMindQATool',
  voice: 'C:\\MisterMindPage',
};

const CODE_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.pyw',
  '.html', '.htm', '.css', '.scss', '.sass', '.less',
  '.json', '.yaml', '.yml', '.xml',
  '.md', '.mdx',
  '.sql', '.graphql', '.gql',
  '.sh', '.bash', '.ps1', '.bat', '.cmd',
  '.vue', '.svelte',
  '.java', '.kt', '.scala',
  '.go', '.rs', '.c', '.cpp', '.h', '.hpp',
  '.rb', '.php', '.swift', '.m',
];

const IGNORE_DIRS = [
  'node_modules', '.git', 'dist', 'build', 'coverage',
  '.next', '.nuxt', '.cache', '__pycache__', '.venv',
  'vendor', 'target', 'bin', 'obj',
];

// ═══════════════════════════════════════════════════════════════════════════
// LOC COUNTER
// ═══════════════════════════════════════════════════════════════════════════

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    let total = lines.length;
    let code = 0;
    let comments = 0;
    let blank = 0;
    
    let inBlockComment = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed === '') {
        blank++;
        continue;
      }
      
      // Block comment handling
      if (inBlockComment) {
        comments++;
        if (trimmed.includes('*/')) {
          inBlockComment = false;
        }
        continue;
      }
      
      if (trimmed.startsWith('/*')) {
        comments++;
        if (!trimmed.includes('*/')) {
          inBlockComment = true;
        }
        continue;
      }
      
      // Single line comments
      if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('<!--')) {
        comments++;
        continue;
      }
      
      code++;
    }
    
    return { total, code, comments, blank };
  } catch (error) {
    return { total: 0, code: 0, comments: 0, blank: 0 };
  }
}

function walkDir(dir, results = { files: 0, lines: { total: 0, code: 0, comments: 0, blank: 0 }, byExtension: {} }) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      
      try {
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!IGNORE_DIRS.includes(item) && !item.startsWith('.')) {
            // Complexity: O(1)
            walkDir(fullPath, results);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          
          if (CODE_EXTENSIONS.includes(ext)) {
            const counts = countLines(fullPath);
            
            results.files++;
            results.lines.total += counts.total;
            results.lines.code += counts.code;
            results.lines.comments += counts.comments;
            results.lines.blank += counts.blank;
            
            if (!results.byExtension[ext]) {
              results.byExtension[ext] = { files: 0, lines: 0 };
            }
            results.byExtension[ext].files++;
            results.byExtension[ext].lines += counts.total;
          }
        }
      } catch (e) {
        // Skip files we can't access
      }
    }
  } catch (e) {
    // Skip directories we can't access
  }
  
  return results;
}

function countProject(projectPath, projectName) {
  console.log(`\n📂 Counting ${projectName}: ${projectPath}`);
  
  if (!fs.existsSync(projectPath)) {
    console.log(`   ❌ Path does not exist`);
    return null;
  }
  
  const results = walkDir(projectPath);
  
  console.log(`   Files: ${results.files}`);
  console.log(`   Total Lines: ${results.lines.total.toLocaleString()}`);
  console.log(`   Code Lines: ${results.lines.code.toLocaleString()}`);
  console.log(`   Comments: ${results.lines.comments.toLocaleString()}`);
  console.log(`   Blank: ${results.lines.blank.toLocaleString()}`);
  
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
console.log('║  QAntum Prime - ЧЕСТЕН LOC БРОЯЧ                                          ║');
console.log('║  Реални числа, без закръгляне                                             ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════╝');

const timestamp = new Date().toISOString();
const empire = {};

// Count each project
empire.core = countProject(EMPIRE_PATHS.core, 'MisteMind (Core)');
empire.shield = countProject(EMPIRE_PATHS.shield, 'MrMindQATool (Shield)');
empire.voice = countProject(EMPIRE_PATHS.voice, 'MisterMindPage (Voice)');

// Calculate totals
const totals = {
  files: 0,
  lines: { total: 0, code: 0, comments: 0, blank: 0 },
};

for (const project of Object.values(empire)) {
  if (project) {
    totals.files += project.files;
    totals.lines.total += project.lines.total;
    totals.lines.code += project.lines.code;
    totals.lines.comments += project.lines.comments;
    totals.lines.blank += project.lines.blank;
  }
}

console.log('\n════════════════════════════════════════════════════════════════════════════');
console.log('📊 EMPIRE TOTALS:');
console.log('════════════════════════════════════════════════════════════════════════════');
console.log(`   Total Files: ${totals.files.toLocaleString()}`);
console.log(`   Total Lines: ${totals.lines.total.toLocaleString()}`);
console.log(`   Code Lines:  ${totals.lines.code.toLocaleString()}`);
console.log(`   Comments:    ${totals.lines.comments.toLocaleString()}`);
console.log(`   Blank Lines: ${totals.lines.blank.toLocaleString()}`);
console.log('════════════════════════════════════════════════════════════════════════════');

// Update MISTER-MIND-LEGACY.json
const legacyPath = path.join(EMPIRE_PATHS.core, 'MISTER-MIND-LEGACY.json');
let legacy = {};

try {
  if (fs.existsSync(legacyPath)) {
    legacy = JSON.parse(fs.readFileSync(legacyPath, 'utf-8'));
  }
} catch (e) {
  legacy = {};
}

legacy.locCount = {
  timestamp,
  verified: true,
  method: 'scripts/count-loc.js',
  projects: {
    core: empire.core ? {
      path: EMPIRE_PATHS.core,
      files: empire.core.files,
      totalLines: empire.core.lines.total,
      codeLines: empire.core.lines.code,
      comments: empire.core.lines.comments,
      blank: empire.core.lines.blank,
    } : null,
    shield: empire.shield ? {
      path: EMPIRE_PATHS.shield,
      files: empire.shield.files,
      totalLines: empire.shield.lines.total,
      codeLines: empire.shield.lines.code,
      comments: empire.shield.lines.comments,
      blank: empire.shield.lines.blank,
    } : null,
    voice: empire.voice ? {
      path: EMPIRE_PATHS.voice,
      files: empire.voice.files,
      totalLines: empire.voice.lines.total,
      codeLines: empire.voice.lines.code,
      comments: empire.voice.lines.comments,
      blank: empire.voice.lines.blank,
    } : null,
  },
  totals: {
    files: totals.files,
    totalLines: totals.lines.total,
    codeLines: totals.lines.code,
    comments: totals.lines.comments,
    blank: totals.lines.blank,
  },
};

fs.writeFileSync(legacyPath, JSON.stringify(legacy, null, 2));
console.log(`\n✅ Saved to: ${legacyPath}`);

// Also update backpack with this info
const backpackPath = path.join(EMPIRE_PATHS.core, 'data', 'backpack.json');
try {
  const backpack = JSON.parse(fs.readFileSync(backpackPath, 'utf-8'));
  backpack.lastLOCCount = legacy.locCount;
  backpack.metadata.lastUpdated = timestamp;
  fs.writeFileSync(backpackPath, JSON.stringify(backpack, null, 2));
  console.log(`✅ Updated: ${backpackPath}`);
} catch (e) {
  console.log(`⚠️ Could not update backpack: ${e.message}`);
}

console.log('\n🎯 LOC COUNT COMPLETE - ЧЕСТНИ ЧИСЛА!');
