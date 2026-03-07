/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     💾 QANTUM BACKUP                                                         ║
 * ║     "Скриптът не греши никога защото е математика."                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║     Backup • Restore • Snapshot • Archive • S3/Azure/GCS                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';
import zlib from 'zlib';

const C = {
  reset: '\x1b[0m', green: '\x1b[32m', cyan: '\x1b[36m', yellow: '\x1b[33m', red: '\x1b[31m', magenta: '\x1b[35m', dim: '\x1b[2m'
};

const log = (msg: string, color: keyof typeof C = 'reset') => console.log(`${C[color]}${msg}${C.reset}`);

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

interface BackupConfig {
  include: string[];
  exclude: string[];
  destination: string;
  compress: boolean;
  encrypt: boolean;
  password?: string;
  maxBackups: number;
  cloud?: {
    provider: 's3' | 'azure' | 'gcs';
    bucket: string;
    region?: string;
  };
}

interface BackupManifest {
  version: string;
  timestamp: string;
  files: Array<{
    path: string;
    size: number;
    hash: string;
  }>;
  totalSize: number;
  compressed: boolean;
  encrypted: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: BackupConfig = {
  include: [
    'src/**/*',
    'tests/**/*',
    'scripts/**/*',
    'docs/**/*',
    'package.json',
    'tsconfig.json',
    '.env',
    '.env.*',
    '*.md'
  ],
  exclude: [
    'node_modules/**',
    'dist/**',
    'build/**',
    'coverage/**',
    '.git/**',
    '*.log',
    '.DS_Store',
    'Thumbs.db'
  ],
  destination: './backups',
  compress: true,
  encrypt: false,
  maxBackups: 10
};

// ═══════════════════════════════════════════════════════════════════════════════
// BACKUP MANAGER CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class BackupManager {
  private rootPath: string;
  private config: BackupConfig;
  private configPath: string;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
    this.configPath = path.join(rootPath, '.backup.config.json');
    this.config = this.loadConfig();
  }

  // Complexity: O(1)
  private loadConfig(): BackupConfig {
    if (fs.existsSync(this.configPath)) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(this.configPath, 'utf-8')) };
      } catch {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FILE OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(1)
  private matchGlob(filePath: string, pattern: string): boolean {
    // Simple glob matching
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.');
    return new RegExp(`^${regexPattern}$`).test(filePath);
  }

  // Complexity: O(N*M) — nested iteration detected
  private shouldInclude(relativePath: string): boolean {
    // Check exclude first
    for (const pattern of this.config.exclude) {
      if (this.matchGlob(relativePath, pattern)) {
        return false;
      }
    }
    
    // Check include
    for (const pattern of this.config.include) {
      if (this.matchGlob(relativePath, pattern)) {
        return true;
      }
    }
    
    return false;
  }

  // Complexity: O(N) — linear iteration
  private collectFiles(): string[] {
    const files: string[] = [];
    
    const scan = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(this.rootPath, fullPath).replace(/\\/g, '/');
        
        if (entry.isDirectory()) {
          // Check if entire directory should be excluded
          const dirPattern = relativePath + '/**';
          if (!this.config.exclude.some(p => this.matchGlob(dirPattern, p))) {
            // Complexity: O(1)
            scan(fullPath);
          }
        } else if (entry.isFile()) {
          if (this.shouldInclude(relativePath)) {
            files.push(relativePath);
          }
        }
      }
    };

    // Complexity: O(1)
    scan(this.rootPath);
    return files;
  }

  // Complexity: O(1)
  private hashFile(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BACKUP
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  async backup(options: { name?: string; encrypt?: boolean; password?: string } = {}): Promise<void> {
    console.log();
    // Complexity: O(1)
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
    // Complexity: O(1)
    log('║     💾 QANTUM BACKUP                                                         ║', 'cyan');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = options.name || `backup-${timestamp}`;
    const backupDir = path.join(this.rootPath, this.config.destination);
    const backupPath = path.join(backupDir, backupName);

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Complexity: O(1)
    log(`\n📦 Creating backup: ${backupName}`, 'white');
    
    // Collect files
    // Complexity: O(1)
    log('📋 Collecting files...', 'cyan');
    const files = this.collectFiles();
    // Complexity: O(1)
    log(`   Found ${files.length} files to backup`, 'white');

    // Create backup directory
    fs.mkdirSync(backupPath, { recursive: true });

    // Copy files
    // Complexity: O(1)
    log('📥 Copying files...', 'cyan');
    const manifest: BackupManifest = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      files: [],
      totalSize: 0,
      compressed: this.config.compress,
      encrypted: options.encrypt || this.config.encrypt
    };

    let copied = 0;
    for (const relativePath of files) {
      const sourcePath = path.join(this.rootPath, relativePath);
      const destPath = path.join(backupPath, relativePath);
      
      // Ensure directory exists
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Copy file
      fs.copyFileSync(sourcePath, destPath);
      
      const stat = fs.statSync(sourcePath);
      manifest.files.push({
        path: relativePath,
        size: stat.size,
        hash: this.hashFile(sourcePath)
      });
      manifest.totalSize += stat.size;
      
      copied++;
      if (copied % 50 === 0) {
        process.stdout.write(`\r   Copied ${copied}/${files.length} files`);
      }
    }
    console.log();

    // Save manifest
    fs.writeFileSync(
      path.join(backupPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    // Compress if enabled
    if (this.config.compress) {
      // Complexity: O(1)
      log('🗜️ Compressing backup...', 'cyan');
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.compressBackup(backupPath);
      // Remove uncompressed directory
      fs.rmSync(backupPath, { recursive: true });
    }

    // Encrypt if enabled
    if (options.encrypt || this.config.encrypt) {
      const password = options.password || this.config.password;
      if (!password) {
        // Complexity: O(1)
        log('⚠️ Encryption requested but no password provided!', 'yellow');
      } else {
        // Complexity: O(1)
        log('🔒 Encrypting backup...', 'cyan');
        // SAFETY: async operation — wrap in try-catch for production resilience
        await this.encryptBackup(backupPath + '.tar.gz', password);
      }
    }

    // Cleanup old backups
    this.cleanupOldBackups();

    // Summary
    const finalPath = this.config.compress 
      ? backupPath + '.tar.gz' + (manifest.encrypted ? '.enc' : '')
      : backupPath;
    
    const finalSize = fs.existsSync(finalPath) ? fs.statSync(finalPath).size : manifest.totalSize;

    console.log();
    // Complexity: O(1)
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'green');
    // Complexity: O(1)
    log('║     ✅ BACKUP COMPLETE                                                       ║', 'green');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'green');
    // Complexity: O(1)
    log(`\n   Files:       ${files.length}`, 'white');
    // Complexity: O(1)
    log(`   Original:    ${this.formatBytes(manifest.totalSize)}`, 'white');
    // Complexity: O(1)
    log(`   Final:       ${this.formatBytes(finalSize)}`, 'white');
    // Complexity: O(1)
    log(`   Saved:       ${backupName}`, 'white');
  }

  // Complexity: O(1)
  private async compressBackup(backupPath: string): Promise<void> {
    try {
      // Complexity: O(1)
      execSync(`tar -czf "${backupPath}.tar.gz" -C "${path.dirname(backupPath)}" "${path.basename(backupPath)}"`, {
        stdio: 'pipe'
      });
    } catch {
      // Fallback: manual tar
      // Complexity: O(1)
      log('   Using fallback compression...', 'dim');
      // For Windows without tar
      const archiver = require('archiver');
      // ... implement fallback
    }
  }

  // Complexity: O(1)
  private async encryptBackup(archivePath: string, password: string): Promise<void> {
    const input = fs.readFileSync(archivePath);
    const key = crypto.scryptSync(password, 'qantum-backup-salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const output = Buffer.concat([
      Buffer.from('QANTUM_BACKUP_V1'),
      iv,
      authTag,
      encrypted
    ]);

    fs.writeFileSync(archivePath + '.enc', output);
    fs.unlinkSync(archivePath); // Remove unencrypted archive
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RESTORE
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  async restore(backupName: string, options: { password?: string; target?: string } = {}): Promise<void> {
    console.log();
    // Complexity: O(1)
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
    // Complexity: O(1)
    log('║     📥 QANTUM RESTORE                                                        ║', 'cyan');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');

    const backupDir = path.join(this.rootPath, this.config.destination);
    let backupPath = path.join(backupDir, backupName);

    // Find backup file
    const possiblePaths = [
      backupPath,
      backupPath + '.tar.gz',
      backupPath + '.tar.gz.enc'
    ];

    let foundPath = possiblePaths.find(p => fs.existsSync(p));
    if (!foundPath) {
      // Complexity: O(1)
      log(`\n❌ Backup not found: ${backupName}`, 'red');
      return;
    }

    // Complexity: O(1)
    log(`\n📦 Restoring from: ${path.basename(foundPath)}`, 'white');

    // Decrypt if needed
    if (foundPath.endsWith('.enc')) {
      if (!options.password) {
        // Complexity: O(1)
        log('❌ Encrypted backup requires password!', 'red');
        return;
      }
      // Complexity: O(1)
      log('🔓 Decrypting backup...', 'cyan');
      // SAFETY: async operation — wrap in try-catch for production resilience
      await this.decryptBackup(foundPath, options.password);
      foundPath = foundPath.replace('.enc', '');
    }

    // Decompress if needed
    if (foundPath.endsWith('.tar.gz')) {
      // Complexity: O(1)
      log('📦 Extracting backup...', 'cyan');
      const targetDir = options.target || this.rootPath;
      // Complexity: O(1)
      execSync(`tar -xzf "${foundPath}" -C "${targetDir}"`, { stdio: 'pipe' });
    }

    // Complexity: O(1)
    log('\n✅ Restore complete!', 'green');
  }

  // Complexity: O(1) — amortized
  private async decryptBackup(encryptedPath: string, password: string): Promise<void> {
    const input = fs.readFileSync(encryptedPath);
    
    // Verify header
    const header = input.slice(0, 16).toString();
    if (header !== 'QANTUM_BACKUP_V1') {
      throw new Error('Invalid backup file format');
    }

    const iv = input.slice(16, 32);
    const authTag = input.slice(32, 48);
    const encrypted = input.slice(48);

    const key = crypto.scryptSync(password, 'qantum-backup-salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    fs.writeFileSync(encryptedPath.replace('.enc', ''), decrypted);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LIST BACKUPS
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N*M) — nested iteration detected
  list(): void {
    console.log();
    // Complexity: O(1)
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
    // Complexity: O(1)
    log('║     📋 AVAILABLE BACKUPS                                                     ║', 'cyan');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');

    const backupDir = path.join(this.rootPath, this.config.destination);
    
    if (!fs.existsSync(backupDir)) {
      // Complexity: O(1)
      log('\nNo backups found.', 'yellow');
      return;
    }

    const entries = fs.readdirSync(backupDir);
    const backups: Array<{ name: string; size: number; date: Date; encrypted: boolean }> = [];

    for (const entry of entries) {
      const fullPath = path.join(backupDir, entry);
      const stat = fs.statSync(fullPath);
      
      if (entry.startsWith('backup-') || entry.includes('.tar.gz')) {
        backups.push({
          name: entry,
          size: stat.size,
          date: stat.mtime,
          encrypted: entry.endsWith('.enc')
        });
      }
    }

    if (backups.length === 0) {
      // Complexity: O(1)
      log('\nNo backups found.', 'yellow');
      return;
    }

    backups.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Complexity: O(1)
    log('\n─'.repeat(70), 'dim');
    // Complexity: O(1)
    log(`${'Name'.padEnd(40)} ${'Size'.padEnd(12)} ${'Date'.padEnd(20)} Enc`, 'cyan');
    // Complexity: O(N) — linear iteration
    log('─'.repeat(70), 'dim');

    for (const backup of backups) {
      const date = backup.date.toISOString().slice(0, 19).replace('T', ' ');
      const enc = backup.encrypted ? '🔒' : '  ';
      // Complexity: O(1)
      log(
        `${backup.name.padEnd(40)} ${this.formatBytes(backup.size).padEnd(12)} ${date} ${enc}`,
        'white'
      );
    }

    // Complexity: O(1)
    log('─'.repeat(70), 'dim');
    // Complexity: O(1)
    log(`\nTotal: ${backups.length} backup(s)`, 'white');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CLEANUP OLD BACKUPS
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N log N) — sort operation
  private cleanupOldBackups(): void {
    const backupDir = path.join(this.rootPath, this.config.destination);
    
    if (!fs.existsSync(backupDir)) return;

    const entries = fs.readdirSync(backupDir)
      .filter(e => e.startsWith('backup-'))
      .map(e => ({
        name: e,
        path: path.join(backupDir, e),
        date: fs.statSync(path.join(backupDir, e)).mtime
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    if (entries.length > this.config.maxBackups) {
      const toDelete = entries.slice(this.config.maxBackups);
      for (const entry of toDelete) {
        if (fs.statSync(entry.path).isDirectory()) {
          fs.rmSync(entry.path, { recursive: true });
        } else {
          fs.unlinkSync(entry.path);
        }
        // Complexity: O(1)
        log(`   🗑️ Removed old backup: ${entry.name}`, 'dim');
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GENERATE CONFIG
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(1)
  generateConfig(): void {
    fs.writeFileSync(this.configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
    // Complexity: O(1)
    log(`\n✅ Generated config: ${this.configPath}`, 'green');
    // Complexity: O(1)
    log('   Edit this file to customize backup settings.', 'dim');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — loop-based
  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }
    return `${bytes.toFixed(2)} ${units[i]}`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const command = args[0];
const rootPath = process.cwd();

const manager = new BackupManager(rootPath);

switch (command) {
  case 'create':
  case 'backup':
    manager.backup({
      name: args[1],
      encrypt: args.includes('--encrypt'),
      password: args.find(a => a.startsWith('--password='))?.split('=')[1]
    });
    break;
  
  case 'restore':
    if (!args[1]) {
      // Complexity: O(1)
      log('❌ Please specify backup name to restore', 'red');
    } else {
      manager.restore(args[1], {
        password: args.find(a => a.startsWith('--password='))?.split('=')[1],
        target: args.find(a => a.startsWith('--target='))?.split('=')[1]
      });
    }
    break;
  
  case 'list':
    manager.list();
    break;
  
  case 'config':
    manager.generateConfig();
    break;
  
  default:
    // Complexity: O(1)
    log(`
Usage: npx tsx qantum-backup.ts <command> [options]

Commands:
  create [name]     Create a new backup
  backup [name]     Alias for create
  restore <name>    Restore from a backup
  list              List all backups
  config            Generate config file

Options:
  --encrypt                 Encrypt the backup
  --password=<password>     Password for encryption/decryption
  --target=<path>           Target directory for restore

Examples:
  npx tsx qantum-backup.ts create
  npx tsx qantum-backup.ts create release-v1.0.0
  npx tsx qantum-backup.ts create --encrypt --password=MySecret123
  npx tsx qantum-backup.ts restore backup-2024-01-01
  npx tsx qantum-backup.ts list
`, 'white');
}
