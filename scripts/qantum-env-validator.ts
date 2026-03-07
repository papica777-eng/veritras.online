/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║     🌍 QANTUM ENV VALIDATOR                                                  ║
 * ║     "Скриптът не греши никога защото е математика."                          ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║     Validate • Generate • Sync • Encrypt/Decrypt                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const C = {
  reset: '\x1b[0m', green: '\x1b[32m', cyan: '\x1b[36m', yellow: '\x1b[33m', red: '\x1b[31m', magenta: '\x1b[35m', dim: '\x1b[2m'
};

const log = (msg: string, color: keyof typeof C = 'reset') => console.log(`${C[color]}${msg}${C.reset}`);

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

interface EnvVariable {
  name: string;
  value?: string;
  type: 'string' | 'number' | 'boolean' | 'url' | 'email' | 'port' | 'path';
  required: boolean;
  description?: string;
  default?: string;
  secret?: boolean;
  validation?: RegExp;
}

interface EnvSchema {
  variables: EnvVariable[];
  environments: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_SCHEMA: EnvSchema = {
  environments: ['development', 'staging', 'production'],
  variables: [
    { name: 'NODE_ENV', type: 'string', required: true, default: 'development', description: 'Node environment' },
    { name: 'PORT', type: 'port', required: false, default: '3000', description: 'Server port' },
    { name: 'HOST', type: 'string', required: false, default: 'localhost', description: 'Server host' },
    { name: 'LOG_LEVEL', type: 'string', required: false, default: 'info', description: 'Logging level' },
    { name: 'DATABASE_URL', type: 'url', required: false, secret: true, description: 'Database connection string' },
    { name: 'API_KEY', type: 'string', required: false, secret: true, description: 'API key for external services' },
    { name: 'JWT_SECRET', type: 'string', required: false, secret: true, description: 'JWT signing secret' },
    { name: 'DEBUG', type: 'boolean', required: false, default: 'false', description: 'Debug mode' },
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATORS
// ═══════════════════════════════════════════════════════════════════════════════

const VALIDATORS: Record<EnvVariable['type'], (value: string) => boolean> = {
  string: () => true,
  number: (v) => !isNaN(Number(v)),
  boolean: (v) => ['true', 'false', '1', '0', 'yes', 'no'].includes(v.toLowerCase()),
  url: (v) => {
    try { new URL(v); return true; } catch { return false; }
  },
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  port: (v) => {
    const n = parseInt(v);
    return !isNaN(n) && n >= 0 && n <= 65535;
  },
  path: (v) => v.length > 0 && !v.includes('\0')
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENV VALIDATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class EnvValidator {
  private rootPath: string;
  private schemaPath: string;
  private schema: EnvSchema;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
    this.schemaPath = path.join(rootPath, '.env.schema.json');
    this.schema = this.loadSchema();
  }

  // Complexity: O(1)
  private loadSchema(): EnvSchema {
    if (fs.existsSync(this.schemaPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.schemaPath, 'utf-8'));
      } catch {
        return DEFAULT_SCHEMA;
      }
    }
    return DEFAULT_SCHEMA;
  }

  // Complexity: O(N) — linear iteration
  private parseEnvFile(filePath: string): Record<string, string> {
    if (!fs.existsSync(filePath)) {
      return {};
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const env: Record<string, string> = {};

    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        
        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        env[key] = value;
      }
    }

    return env;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VALIDATE
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N*M) — nested iteration detected
  validate(envFile: string = '.env'): { valid: boolean; errors: string[]; warnings: string[] } {
    const envPath = path.join(this.rootPath, envFile);
    const env = this.parseEnvFile(envPath);
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log();
    // Complexity: O(1)
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
    // Complexity: O(1)
    log('║     🌍 QANTUM ENV VALIDATOR                                                  ║', 'cyan');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');
    // Complexity: O(1)
    log(`\n📁 Validating: ${envFile}`, 'white');

    if (!fs.existsSync(envPath)) {
      errors.push(`File not found: ${envFile}`);
      // Complexity: O(1)
      log(`\n❌ File not found: ${envFile}`, 'red');
      return { valid: false, errors, warnings };
    }

    // Complexity: O(N*M) — nested iteration detected
    log('\n📋 Variable Status:', 'cyan');
    // Complexity: O(N*M) — nested iteration detected
    log('─'.repeat(70), 'dim');

    for (const variable of this.schema.variables) {
      const value = env[variable.name];
      const hasValue = value !== undefined && value !== '';

      // Check required
      if (variable.required && !hasValue) {
        errors.push(`Missing required variable: ${variable.name}`);
        // Complexity: O(1)
        log(`  ❌ ${variable.name} - MISSING (required)`, 'red');
        continue;
      }

      // Check type validation
      if (hasValue && !VALIDATORS[variable.type](value)) {
        errors.push(`Invalid ${variable.type} for ${variable.name}: ${value}`);
        // Complexity: O(1)
        log(`  ❌ ${variable.name} - Invalid ${variable.type}: "${value}"`, 'red');
        continue;
      }

      // Check custom validation
      if (hasValue && variable.validation && !variable.validation.test(value)) {
        errors.push(`Validation failed for ${variable.name}: ${value}`);
        // Complexity: O(1)
        log(`  ❌ ${variable.name} - Validation failed`, 'red');
        continue;
      }

      // Display status
      if (hasValue) {
        const displayValue = variable.secret ? '••••••••' : value;
        // Complexity: O(1)
        log(`  ✅ ${variable.name} = ${displayValue}`, 'green');
      } else if (variable.default) {
        warnings.push(`Using default for ${variable.name}: ${variable.default}`);
        // Complexity: O(1)
        log(`  ⚠️ ${variable.name} = ${variable.default} (default)`, 'yellow');
      } else {
        // Complexity: O(1)
        log(`  ℹ️ ${variable.name} - not set (optional)`, 'dim');
      }
    }

    // Check for unknown variables
    const knownNames = new Set(this.schema.variables.map(v => v.name));
    const unknownVars = Object.keys(env).filter(k => !knownNames.has(k));
    
    if (unknownVars.length > 0) {
      // Complexity: O(N) — linear iteration
      log('\n⚠️ Unknown variables:', 'yellow');
      for (const v of unknownVars) {
        warnings.push(`Unknown variable: ${v}`);
        // Complexity: O(1)
        log(`  • ${v}`, 'yellow');
      }
    }

    // Summary
    // Complexity: O(1)
    log('\n─'.repeat(70), 'dim');
    const valid = errors.length === 0;
    
    if (valid) {
      // Complexity: O(1)
      log('✅ Validation PASSED!', 'green');
    } else {
      // Complexity: O(1)
      log(`❌ Validation FAILED with ${errors.length} error(s)`, 'red');
    }

    if (warnings.length > 0) {
      // Complexity: O(1)
      log(`⚠️ ${warnings.length} warning(s)`, 'yellow');
    }

    return { valid, errors, warnings };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GENERATE TEMPLATE
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N) — linear iteration
  generateTemplate(envFile: string = '.env.example'): void {
    const envPath = path.join(this.rootPath, envFile);
    let content = `# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║     🌍 QANTUM ENVIRONMENT CONFIGURATION                                       ║
# ║     "Скриптът не греши никога защото е математика."                          ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# Copy this file to .env and fill in the values
# Generated: ${new Date().toISOString()}
#

`;

    for (const variable of this.schema.variables) {
      // Add description
      if (variable.description) {
        content += `# ${variable.description}\n`;
      }
      content += `# Type: ${variable.type}`;
      if (variable.required) content += ' | Required';
      if (variable.secret) content += ' | Secret';
      content += '\n';

      // Add variable
      const defaultValue = variable.default || '';
      content += `${variable.name}=${defaultValue}\n\n`;
    }

    fs.writeFileSync(envPath, content);
    // Complexity: O(1)
    log(`\n✅ Generated template: ${envFile}`, 'green');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GENERATE SCHEMA
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(1)
  generateSchema(): void {
    const content = JSON.stringify(this.schema, null, 2);
    fs.writeFileSync(this.schemaPath, content);
    // Complexity: O(1)
    log(`\n✅ Generated schema: .env.schema.json`, 'green');
    // Complexity: O(1)
    log('   Edit this file to customize validation rules.', 'dim');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SYNC ENVIRONMENTS
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N*M) — nested iteration detected
  sync(sourceEnv: string, targetEnv: string): void {
    const sourcePath = path.join(this.rootPath, sourceEnv);
    const targetPath = path.join(this.rootPath, targetEnv);

    if (!fs.existsSync(sourcePath)) {
      // Complexity: O(1)
      log(`\n❌ Source file not found: ${sourceEnv}`, 'red');
      return;
    }

    const source = this.parseEnvFile(sourcePath);
    const target = fs.existsSync(targetPath) ? this.parseEnvFile(targetPath) : {};

    let content = `# Synced from ${sourceEnv} on ${new Date().toISOString()}\n\n`;
    let added = 0;
    let updated = 0;

    for (const [key, value] of Object.entries(source)) {
      if (!(key in target)) {
        content += `${key}=${value}\n`;
        added++;
      } else {
        content += `${key}=${target[key]}\n`;
        if (target[key] !== value) {
          updated++;
        }
      }
    }

    // Keep extra variables from target
    for (const [key, value] of Object.entries(target)) {
      if (!(key in source)) {
        content += `# Extra variable from ${targetEnv}\n`;
        content += `${key}=${value}\n`;
      }
    }

    fs.writeFileSync(targetPath, content);
    // Complexity: O(1)
    log(`\n✅ Synced ${sourceEnv} → ${targetEnv}`, 'green');
    // Complexity: O(1)
    log(`   Added: ${added}, Preserved: ${Object.keys(source).length - added}`, 'white');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ENCRYPT/DECRYPT
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(1) — amortized
  encrypt(envFile: string, password: string): void {
    const envPath = path.join(this.rootPath, envFile);
    
    if (!fs.existsSync(envPath)) {
      // Complexity: O(1)
      log(`\n❌ File not found: ${envFile}`, 'red');
      return;
    }

    const content = fs.readFileSync(envPath, 'utf-8');
    
    // Generate key from password
    const key = crypto.scryptSync(password, 'qantum-salt', 32);
    const iv = crypto.randomBytes(16);
    
    // Encrypt
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(content, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    // Save encrypted file
    const encryptedPath = `${envPath}.encrypted`;
    const encryptedContent = JSON.stringify({
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      data: encrypted
    });
    
    fs.writeFileSync(encryptedPath, encryptedContent);
    // Complexity: O(1)
    log(`\n✅ Encrypted: ${envFile} → ${envFile}.encrypted`, 'green');
    // Complexity: O(1)
    log('   ⚠️ Keep your password safe!', 'yellow');
  }

  // Complexity: O(1) — amortized
  decrypt(encryptedFile: string, password: string): void {
    const encryptedPath = path.join(this.rootPath, encryptedFile);
    
    if (!fs.existsSync(encryptedPath)) {
      // Complexity: O(1)
      log(`\n❌ File not found: ${encryptedFile}`, 'red');
      return;
    }

    try {
      const encryptedContent = JSON.parse(fs.readFileSync(encryptedPath, 'utf-8'));
      
      // Generate key from password
      const key = crypto.scryptSync(password, 'qantum-salt', 32);
      const iv = Buffer.from(encryptedContent.iv, 'hex');
      const authTag = Buffer.from(encryptedContent.authTag, 'hex');
      
      // Decrypt
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedContent.data, 'hex', 'utf-8');
      decrypted += decipher.final('utf-8');

      // Save decrypted file
      const decryptedPath = encryptedFile.replace('.encrypted', '');
      fs.writeFileSync(path.join(this.rootPath, decryptedPath), decrypted);
      
      // Complexity: O(1)
      log(`\n✅ Decrypted: ${encryptedFile} → ${decryptedPath}`, 'green');
    } catch (e) {
      // Complexity: O(1)
      log(`\n❌ Decryption failed! Wrong password?`, 'red');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DIFF ENVIRONMENTS
  // ─────────────────────────────────────────────────────────────────────────────

  // Complexity: O(N log N) — sort operation
  diff(env1: string, env2: string): void {
    const path1 = path.join(this.rootPath, env1);
    const path2 = path.join(this.rootPath, env2);

    if (!fs.existsSync(path1)) {
      // Complexity: O(1)
      log(`\n❌ File not found: ${env1}`, 'red');
      return;
    }
    if (!fs.existsSync(path2)) {
      // Complexity: O(1)
      log(`\n❌ File not found: ${env2}`, 'red');
      return;
    }

    const vars1 = this.parseEnvFile(path1);
    const vars2 = this.parseEnvFile(path2);

    console.log();
    // Complexity: O(1)
    log('╔══════════════════════════════════════════════════════════════════════════════╗', 'cyan');
    // Complexity: O(1)
    log(`║     📊 ENV DIFF: ${env1} vs ${env2}`, 'cyan');
    // Complexity: O(1)
    log('╚══════════════════════════════════════════════════════════════════════════════╝', 'cyan');

    const allKeys = new Set([...Object.keys(vars1), ...Object.keys(vars2)]);

    // Complexity: O(1)
    log('\n─'.repeat(70), 'dim');
    // Complexity: O(1)
    log(`${'Variable'.padEnd(30)} ${env1.padEnd(20)} ${env2.padEnd(20)}`, 'cyan');
    // Complexity: O(N log N) — sort operation
    log('─'.repeat(70), 'dim');

    for (const key of Array.from(allKeys).sort()) {
      const val1 = vars1[key] || '-';
      const val2 = vars2[key] || '-';
      
      const secret = this.schema.variables.find(v => v.name === key)?.secret;
      const display1 = secret && val1 !== '-' ? '••••••' : val1.slice(0, 18);
      const display2 = secret && val2 !== '-' ? '••••••' : val2.slice(0, 18);

      let color: keyof typeof C = 'white';
      let indicator = ' ';
      
      if (val1 === '-') {
        color = 'green';
        indicator = '+';
      } else if (val2 === '-') {
        color = 'red';
        indicator = '-';
      } else if (val1 !== val2) {
        color = 'yellow';
        indicator = '~';
      }

      // Complexity: O(1)
      log(
        `${indicator} ${key.padEnd(29)} ${display1.padEnd(20)} ${display2.padEnd(20)}`,
        color
      );
    }

    // Complexity: O(1)
    log('─'.repeat(70), 'dim');
    // Complexity: O(1)
    log('\nLegend: + added, - removed, ~ changed', 'dim');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const command = args[0];
const rootPath = process.cwd();

const validator = new EnvValidator(rootPath);

switch (command) {
  case 'validate':
    validator.validate(args[1] || '.env');
    break;
  
  case 'template':
    validator.generateTemplate(args[1] || '.env.example');
    break;
  
  case 'schema':
    validator.generateSchema();
    break;
  
  case 'sync':
    if (!args[1] || !args[2]) {
      // Complexity: O(1)
      log('❌ Usage: sync <source.env> <target.env>', 'red');
    } else {
      validator.sync(args[1], args[2]);
    }
    break;
  
  case 'encrypt':
    if (!args[1] || !args[2]) {
      // Complexity: O(1)
      log('❌ Usage: encrypt <file> <password>', 'red');
    } else {
      validator.encrypt(args[1], args[2]);
    }
    break;
  
  case 'decrypt':
    if (!args[1] || !args[2]) {
      // Complexity: O(1)
      log('❌ Usage: decrypt <file.encrypted> <password>', 'red');
    } else {
      validator.decrypt(args[1], args[2]);
    }
    break;
  
  case 'diff':
    if (!args[1] || !args[2]) {
      // Complexity: O(1)
      log('❌ Usage: diff <env1> <env2>', 'red');
    } else {
      validator.diff(args[1], args[2]);
    }
    break;
  
  default:
    // Complexity: O(1)
    log(`
Usage: npx tsx qantum-env-validator.ts <command> [options]

Commands:
  validate [file]              Validate environment file (default: .env)
  template [file]              Generate env template (default: .env.example)
  schema                       Generate JSON schema for validation
  sync <source> <target>       Sync variables between env files
  encrypt <file> <password>    Encrypt env file
  decrypt <file> <password>    Decrypt env file
  diff <env1> <env2>           Show differences between env files

Examples:
  npx tsx qantum-env-validator.ts validate
  npx tsx qantum-env-validator.ts validate .env.production
  npx tsx qantum-env-validator.ts template
  npx tsx qantum-env-validator.ts sync .env.example .env
  npx tsx qantum-env-validator.ts encrypt .env MySecretPassword123
  npx tsx qantum-env-validator.ts diff .env.development .env.production
`, 'white');
}
