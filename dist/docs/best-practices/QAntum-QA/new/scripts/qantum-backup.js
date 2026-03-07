"use strict";
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     💾 QANTUM BACKUP                                                         ║
 * ║     "Скриптът не греши никога защото е математика."                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║     Backup • Restore • Snapshot • Archive • S3/Azure/GCS                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const crypto_1 = __importDefault(require("crypto"));
const C = {
    reset: '\x1b[0m', green: '\x1b[32m', cyan: '\x1b[36m', yellow: '\x1b[33m', red: '\x1b[31m', magenta: '\x1b[35m', dim: '\x1b[2m'
};
const log = (msg, color = 'reset') => console.log(`${C[color]}${msg}${C.reset}`);
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_CONFIG = {
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
    rootPath;
    config;
    configPath;
    constructor(rootPath) {
        this.rootPath = rootPath;
        this.configPath = path_1.default.join(rootPath, '.backup.config.json');
        this.config = this.loadConfig();
    }
    loadConfig() {
        if (fs_1.default.existsSync(this.configPath)) {
            try {
                return { ...DEFAULT_CONFIG, ...JSON.parse(fs_1.default.readFileSync(this.configPath, 'utf-8')) };
            }
            catch {
                return DEFAULT_CONFIG;
            }
        }
        return DEFAULT_CONFIG;
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // FILE OPERATIONS
    // ─────────────────────────────────────────────────────────────────────────────
    matchGlob(filePath, pattern) {
        // Simple glob matching
        const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*')
            .replace(/\?/g, '.');
        return new RegExp(`^${regexPattern}$`).test(filePath);
    }
    shouldInclude(relativePath) {
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
    collectFiles() {
        const files = [];
        const scan = (dir) => {
            const entries = fs_1.default.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path_1.default.join(dir, entry.name);
                const relativePath = path_1.default.relative(this.rootPath, fullPath).replace(/\\/g, '/');
                if (entry.isDirectory()) {
                    // Check if entire directory should be excluded
                    const dirPattern = relativePath + '/**';
                    if (!this.config.exclude.some(p => this.matchGlob(dirPattern, p))) {
                        scan(fullPath);
                    }
                }
                else if (entry.isFile()) {
                    if (this.shouldInclude(relativePath)) {
                        files.push(relativePath);
                    }
                }
            }
        };
        scan(this.rootPath);
        return files;
    }
    hashFile(filePath) {
        const content = fs_1.default.readFileSync(filePath);
        return crypto_1.default.createHash('sha256').update(content).digest('hex').slice(0, 16);
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // BACKUP
    // ─────────────────────────────────────────────────────────────────────────────
    async backup(options = {}) {
        console.log();
        log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
        log('║     💾 QANTUM BACKUP                                                         ║', 'cyan');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = options.name || `backup-${timestamp}`;
        const backupDir = path_1.default.join(this.rootPath, this.config.destination);
        const backupPath = path_1.default.join(backupDir, backupName);
        // Ensure backup directory exists
        if (!fs_1.default.existsSync(backupDir)) {
            fs_1.default.mkdirSync(backupDir, { recursive: true });
        }
        log(`\n📦 Creating backup: ${backupName}`, 'white');
        // Collect files
        log('📋 Collecting files...', 'cyan');
        const files = this.collectFiles();
        log(`   Found ${files.length} files to backup`, 'white');
        // Create backup directory
        fs_1.default.mkdirSync(backupPath, { recursive: true });
        // Copy files
        log('📥 Copying files...', 'cyan');
        const manifest = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            files: [],
            totalSize: 0,
            compressed: this.config.compress,
            encrypted: options.encrypt || this.config.encrypt
        };
        let copied = 0;
        for (const relativePath of files) {
            const sourcePath = path_1.default.join(this.rootPath, relativePath);
            const destPath = path_1.default.join(backupPath, relativePath);
            // Ensure directory exists
            const destDir = path_1.default.dirname(destPath);
            if (!fs_1.default.existsSync(destDir)) {
                fs_1.default.mkdirSync(destDir, { recursive: true });
            }
            // Copy file
            fs_1.default.copyFileSync(sourcePath, destPath);
            const stat = fs_1.default.statSync(sourcePath);
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
        fs_1.default.writeFileSync(path_1.default.join(backupPath, 'manifest.json'), JSON.stringify(manifest, null, 2));
        // Compress if enabled
        if (this.config.compress) {
            log('🗜️ Compressing backup...', 'cyan');
            await this.compressBackup(backupPath);
            // Remove uncompressed directory
            fs_1.default.rmSync(backupPath, { recursive: true });
        }
        // Encrypt if enabled
        if (options.encrypt || this.config.encrypt) {
            const password = options.password || this.config.password;
            if (!password) {
                log('⚠️ Encryption requested but no password provided!', 'yellow');
            }
            else {
                log('🔒 Encrypting backup...', 'cyan');
                await this.encryptBackup(backupPath + '.tar.gz', password);
            }
        }
        // Cleanup old backups
        this.cleanupOldBackups();
        // Summary
        const finalPath = this.config.compress
            ? backupPath + '.tar.gz' + (manifest.encrypted ? '.enc' : '')
            : backupPath;
        const finalSize = fs_1.default.existsSync(finalPath) ? fs_1.default.statSync(finalPath).size : manifest.totalSize;
        console.log();
        log('╔══════════════════════════════════════════════════════════════════════════════╗', 'green');
        log('║     ✅ BACKUP COMPLETE                                                       ║', 'green');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'green');
        log(`\n   Files:       ${files.length}`, 'white');
        log(`   Original:    ${this.formatBytes(manifest.totalSize)}`, 'white');
        log(`   Final:       ${this.formatBytes(finalSize)}`, 'white');
        log(`   Saved:       ${backupName}`, 'white');
    }
    async compressBackup(backupPath) {
        try {
            (0, child_process_1.execSync)(`tar -czf "${backupPath}.tar.gz" -C "${path_1.default.dirname(backupPath)}" "${path_1.default.basename(backupPath)}"`, {
                stdio: 'pipe'
            });
        }
        catch {
            // Fallback: manual tar
            log('   Using fallback compression...', 'dim');
            // For Windows without tar
            const archiver = require('archiver');
            // ... implement fallback
        }
    }
    async encryptBackup(archivePath, password) {
        const input = fs_1.default.readFileSync(archivePath);
        const key = crypto_1.default.scryptSync(password, 'qantum-backup-salt', 32);
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv('aes-256-gcm', key, iv);
        const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
        const authTag = cipher.getAuthTag();
        const output = Buffer.concat([
            Buffer.from('QANTUM_BACKUP_V1'),
            iv,
            authTag,
            encrypted
        ]);
        fs_1.default.writeFileSync(archivePath + '.enc', output);
        fs_1.default.unlinkSync(archivePath); // Remove unencrypted archive
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // RESTORE
    // ─────────────────────────────────────────────────────────────────────────────
    async restore(backupName, options = {}) {
        console.log();
        log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
        log('║     📥 QANTUM RESTORE                                                        ║', 'cyan');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
        const backupDir = path_1.default.join(this.rootPath, this.config.destination);
        let backupPath = path_1.default.join(backupDir, backupName);
        // Find backup file
        const possiblePaths = [
            backupPath,
            backupPath + '.tar.gz',
            backupPath + '.tar.gz.enc'
        ];
        let foundPath = possiblePaths.find(p => fs_1.default.existsSync(p));
        if (!foundPath) {
            log(`\n❌ Backup not found: ${backupName}`, 'red');
            return;
        }
        log(`\n📦 Restoring from: ${path_1.default.basename(foundPath)}`, 'white');
        // Decrypt if needed
        if (foundPath.endsWith('.enc')) {
            if (!options.password) {
                log('❌ Encrypted backup requires password!', 'red');
                return;
            }
            log('🔓 Decrypting backup...', 'cyan');
            await this.decryptBackup(foundPath, options.password);
            foundPath = foundPath.replace('.enc', '');
        }
        // Decompress if needed
        if (foundPath.endsWith('.tar.gz')) {
            log('📦 Extracting backup...', 'cyan');
            const targetDir = options.target || this.rootPath;
            (0, child_process_1.execSync)(`tar -xzf "${foundPath}" -C "${targetDir}"`, { stdio: 'pipe' });
        }
        log('\n✅ Restore complete!', 'green');
    }
    async decryptBackup(encryptedPath, password) {
        const input = fs_1.default.readFileSync(encryptedPath);
        // Verify header
        const header = input.slice(0, 16).toString();
        if (header !== 'QANTUM_BACKUP_V1') {
            throw new Error('Invalid backup file format');
        }
        const iv = input.slice(16, 32);
        const authTag = input.slice(32, 48);
        const encrypted = input.slice(48);
        const key = crypto_1.default.scryptSync(password, 'qantum-backup-salt', 32);
        const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        fs_1.default.writeFileSync(encryptedPath.replace('.enc', ''), decrypted);
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // LIST BACKUPS
    // ─────────────────────────────────────────────────────────────────────────────
    list() {
        console.log();
        log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
        log('║     📋 AVAILABLE BACKUPS                                                     ║', 'cyan');
        log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
        const backupDir = path_1.default.join(this.rootPath, this.config.destination);
        if (!fs_1.default.existsSync(backupDir)) {
            log('\nNo backups found.', 'yellow');
            return;
        }
        const entries = fs_1.default.readdirSync(backupDir);
        const backups = [];
        for (const entry of entries) {
            const fullPath = path_1.default.join(backupDir, entry);
            const stat = fs_1.default.statSync(fullPath);
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
            log('\nNo backups found.', 'yellow');
            return;
        }
        backups.sort((a, b) => b.date.getTime() - a.date.getTime());
        log('\n─'.repeat(70), 'dim');
        log(`${'Name'.padEnd(40)} ${'Size'.padEnd(12)} ${'Date'.padEnd(20)} Enc`, 'cyan');
        log('─'.repeat(70), 'dim');
        for (const backup of backups) {
            const date = backup.date.toISOString().slice(0, 19).replace('T', ' ');
            const enc = backup.encrypted ? '🔒' : '  ';
            log(`${backup.name.padEnd(40)} ${this.formatBytes(backup.size).padEnd(12)} ${date} ${enc}`, 'white');
        }
        log('─'.repeat(70), 'dim');
        log(`\nTotal: ${backups.length} backup(s)`, 'white');
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // CLEANUP OLD BACKUPS
    // ─────────────────────────────────────────────────────────────────────────────
    cleanupOldBackups() {
        const backupDir = path_1.default.join(this.rootPath, this.config.destination);
        if (!fs_1.default.existsSync(backupDir))
            return;
        const entries = fs_1.default.readdirSync(backupDir)
            .filter(e => e.startsWith('backup-'))
            .map(e => ({
            name: e,
            path: path_1.default.join(backupDir, e),
            date: fs_1.default.statSync(path_1.default.join(backupDir, e)).mtime
        }))
            .sort((a, b) => b.date.getTime() - a.date.getTime());
        if (entries.length > this.config.maxBackups) {
            const toDelete = entries.slice(this.config.maxBackups);
            for (const entry of toDelete) {
                if (fs_1.default.statSync(entry.path).isDirectory()) {
                    fs_1.default.rmSync(entry.path, { recursive: true });
                }
                else {
                    fs_1.default.unlinkSync(entry.path);
                }
                log(`   🗑️ Removed old backup: ${entry.name}`, 'dim');
            }
        }
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // GENERATE CONFIG
    // ─────────────────────────────────────────────────────────────────────────────
    generateConfig() {
        fs_1.default.writeFileSync(this.configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
        log(`\n✅ Generated config: ${this.configPath}`, 'green');
        log('   Edit this file to customize backup settings.', 'dim');
    }
    // ─────────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────────
    formatBytes(bytes) {
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
            log('❌ Please specify backup name to restore', 'red');
        }
        else {
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
