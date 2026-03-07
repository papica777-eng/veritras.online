#!/usr/bin/env tsx
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QANTUM VECTOR SYNC v1.0 - AUTOMATIC DELTA SYNCHRONIZATION                   ║
 * ║   "No More Manual Bullshit. Auto-Everything."                                 ║
 * ║                                                                               ║
 * ║   Функции:                                                                    ║
 * ║   • Delta Calculator - Изчислява разлики между локални файлове и Pinecone     ║
 * ║   • Auto-Sync - Автоматично синхронизира нови/променени файлове               ║
 * ║   • Cleanup - Премахва orphaned вектори                                       ║
 * ║   • Watch Mode - Следи файловата система в реално време                       ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum Empire | Dimitar Prodromov                               ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { Pinecone, RecordMetadata } from '@pinecone-database/pinecone';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { config } from 'dotenv';

config();

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface FileInfo {
  path: string;
  relativePath: string;
  hash: string;
  size: number;
  modifiedAt: number;
  content?: string;
}

interface VectorInfo {
  id: string;
  filePath: string;
  hash: string;
  project: string;
  lastSync: number;
}

interface SyncDelta {
  toAdd: FileInfo[];          // Нови файлове - не съществуват в Pinecone
  toUpdate: FileInfo[];       // Променени файлове - hash е различен
  toDelete: VectorInfo[];     // Orphaned вектори - файловете вече не съществуват
  unchanged: number;          // Брой непроменени
  stats: {
    localFiles: number;
    remoteVectors: number;
    deltaSize: number;
    calculatedAt: number;
  };
}

interface SyncConfig {
  pineconeApiKey: string;
  indexName: string;
  namespace: string;
  projectRoot: string;
  projects: string[];
  extensions: string[];
  excludeDirs: string[];
  excludePatterns: RegExp[];
  batchSize: number;
  dryRun: boolean;
}

interface SyncResult {
  added: number;
  updated: number;
  deleted: number;
  errors: string[];
  duration: number;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: SyncConfig = {
  pineconeApiKey: process.env.PINECONE_API_KEY || '',
  indexName: process.env.PINECONE_INDEX_NAME || 'qantum-empire',
  namespace: process.env.PINECONE_NAMESPACE || 'empire',
  projectRoot: process.env.PROJECT_ROOT || 'C:/MisteMind',
  projects: (process.env.PROJECTS || 'PROJECT').split(',').map(p => p.trim()),
  extensions: ['.ts', '.tsx', '.js', '.jsx', '.py', '.cs', '.json', '.md'],
  excludeDirs: ['node_modules', '.git', 'dist', 'build', '.next', '__pycache__', 'coverage', '.pnpm'],
  excludePatterns: [/\.min\./, /\.map$/, /\.d\.ts$/, /package-lock/, /pnpm-lock/],
  batchSize: 100,
  dryRun: false,
};

// ═══════════════════════════════════════════════════════════════════════════════
// VECTOR SYNC ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export class VectorSyncEngine extends EventEmitter {
  private config: SyncConfig;
  private client: Pinecone | null = null;
  private index: any = null;
  private isConnected = false;

  constructor(config: Partial<SyncConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONNECTION
  // ═══════════════════════════════════════════════════════════════════════════

  async connect(): Promise<void> {
    if (this.isConnected) return;

    if (!this.config.pineconeApiKey) {
      this.log('⚠️ PINECONE_API_KEY not set - running in local-only mode');
      return;
    }

    this.log('🔌 Connecting to Pinecone...');
    
    this.client = new Pinecone({
      apiKey: this.config.pineconeApiKey,
    });

    this.index = this.client.index(this.config.indexName);
    this.isConnected = true;
    
    const stats = await this.index.describeIndexStats();
    this.log(`✅ Connected! Index: ${this.config.indexName}, Vectors: ${stats.totalRecordCount}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOCAL FILE SCANNER
  // ═══════════════════════════════════════════════════════════════════════════

  async scanLocalFiles(): Promise<FileInfo[]> {
    this.log('📂 Scanning local files...');
    const files: FileInfo[] = [];

    for (const project of this.config.projects) {
      const projectPath = path.join(this.config.projectRoot, project);
      
      if (!fs.existsSync(projectPath)) {
        this.log(`⚠️ Project not found: ${project}`);
        continue;
      }

      await this.scanDirectory(projectPath, project, files);
    }

    this.log(`📊 Found ${files.length} local files`);
    return files;
  }

  private async scanDirectory(dir: string, project: string, files: FileInfo[]): Promise<void> {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip excluded directories
      if (entry.isDirectory()) {
        if (this.config.excludeDirs.includes(entry.name)) continue;
        await this.scanDirectory(fullPath, project, files);
        continue;
      }

      // Check file extension
      const ext = path.extname(entry.name).toLowerCase();
      if (!this.config.extensions.includes(ext)) continue;

      // Check exclude patterns
      if (this.config.excludePatterns.some(p => p.test(entry.name))) continue;

      try {
        const stat = fs.statSync(fullPath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const hash = this.hashContent(content);
        const relativePath = path.relative(this.config.projectRoot, fullPath).replace(/\\/g, '/');

        files.push({
          path: fullPath,
          relativePath,
          hash,
          size: stat.size,
          modifiedAt: stat.mtimeMs,
          content,
        });
      } catch (err) {
        // Skip unreadable files
      }
    }
  }

  private hashContent(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REMOTE VECTOR SCANNER
  // ═══════════════════════════════════════════════════════════════════════════

  async scanRemoteVectors(): Promise<Map<string, VectorInfo>> {
    await this.connect();
    this.log('🌐 Fetching remote vectors from Pinecone...');
    
    const vectors = new Map<string, VectorInfo>();
    
    // Pinecone doesn't have list all - we need to use metadata filtering
    // We'll query with a broad filter to get vector IDs
    const stats = await this.index.describeIndexStats();
    const totalVectors = stats.totalRecordCount || 0;
    
    this.log(`📊 Total vectors in index: ${totalVectors}`);
    
    // For each project, fetch vectors
    for (const project of this.config.projects) {
      try {
        // Use list() if available, otherwise query with filter
        const ns = this.index.namespace(this.config.namespace);
        
        // Try to list vectors by prefix
        const prefix = `${project}/`;
        let paginationToken: string | undefined;
        
        do {
          const listResult = await ns.listPaginated({
            prefix,
            limit: 1000,
            paginationToken,
          });
          
          if (listResult.vectors) {
            for (const v of listResult.vectors) {
              // Fetch metadata for each vector
              const fetchResult = await ns.fetch([v.id]);
              const record = fetchResult.records[v.id];
              
              if (record?.metadata) {
                vectors.set(v.id, {
                  id: v.id,
                  filePath: (record.metadata.filePath as string) || v.id,
                  hash: (record.metadata.hash as string) || '',
                  project: (record.metadata.project as string) || project,
                  lastSync: (record.metadata.lastSync as number) || 0,
                });
              }
            }
          }
          
          paginationToken = listResult.pagination?.next;
        } while (paginationToken);
        
      } catch (err: any) {
        this.log(`⚠️ Error scanning project ${project}: ${err.message}`);
      }
    }

    this.log(`📊 Fetched ${vectors.size} remote vectors`);
    return vectors;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DELTA CALCULATOR - THE BRAIN
  // ═══════════════════════════════════════════════════════════════════════════

  async calculateDelta(localOnly = false): Promise<SyncDelta> {
    this.log('🧮 Calculating delta between local files and remote vectors...');
    
    const localFiles = await this.scanLocalFiles();
    
    // If no API key or local-only mode, show local stats only
    let remoteVectors = new Map<string, VectorInfo>();
    
    if (!localOnly && this.config.pineconeApiKey) {
      try {
        remoteVectors = await this.scanRemoteVectors();
      } catch (err: any) {
        this.log(`⚠️ Could not connect to Pinecone: ${err.message}`);
        this.log('📊 Showing local files only...');
      }
    } else if (!this.config.pineconeApiKey) {
      this.log('⚠️ PINECONE_API_KEY not set - showing local files only');
    }
    
    const toAdd: FileInfo[] = [];
    const toUpdate: FileInfo[] = [];
    const toDelete: VectorInfo[] = [];
    let unchanged = 0;

    // Create lookup by file path
    const localByPath = new Map(localFiles.map(f => [f.relativePath, f]));
    const remoteByPath = new Map<string, VectorInfo>();
    
    for (const [id, v] of remoteVectors) {
      remoteByPath.set(v.filePath, v);
    }

    // Find new and updated files
    for (const file of localFiles) {
      const remote = remoteByPath.get(file.relativePath);
      
      if (!remote) {
        // New file - doesn't exist in Pinecone
        toAdd.push(file);
      } else if (remote.hash !== file.hash) {
        // Changed file - hash is different
        toUpdate.push(file);
      } else {
        unchanged++;
      }
    }

    // Find orphaned vectors (files that no longer exist locally)
    for (const [id, vector] of remoteVectors) {
      if (!localByPath.has(vector.filePath)) {
        toDelete.push(vector);
      }
    }

    const delta: SyncDelta = {
      toAdd,
      toUpdate,
      toDelete,
      unchanged,
      stats: {
        localFiles: localFiles.length,
        remoteVectors: remoteVectors.size,
        deltaSize: toAdd.length + toUpdate.length + toDelete.length,
        calculatedAt: Date.now(),
      },
    };

    this.printDeltaReport(delta);
    return delta;
  }

  private printDeltaReport(delta: SyncDelta): void {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║              VECTOR SYNC DELTA REPORT                            ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log(`║  📂 Local Files:     ${delta.stats.localFiles.toString().padStart(6)}                                  ║`);
    console.log(`║  🌐 Remote Vectors:  ${delta.stats.remoteVectors.toString().padStart(6)}                                  ║`);
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log(`║  ✅ Unchanged:       ${delta.unchanged.toString().padStart(6)}                                  ║`);
    console.log(`║  ➕ To Add:          ${delta.toAdd.length.toString().padStart(6)}  (new files)                     ║`);
    console.log(`║  🔄 To Update:       ${delta.toUpdate.length.toString().padStart(6)}  (changed files)                 ║`);
    console.log(`║  🗑️  To Delete:       ${delta.toDelete.length.toString().padStart(6)}  (orphaned vectors)              ║`);
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log(`║  📊 Total Delta:     ${delta.stats.deltaSize.toString().padStart(6)} operations needed               ║`);
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('\n');

    if (delta.toAdd.length > 0 && delta.toAdd.length <= 20) {
      console.log('📁 Files to ADD:');
      delta.toAdd.forEach(f => console.log(`   + ${f.relativePath}`));
      console.log('');
    }

    if (delta.toUpdate.length > 0 && delta.toUpdate.length <= 20) {
      console.log('🔄 Files to UPDATE:');
      delta.toUpdate.forEach(f => console.log(`   ~ ${f.relativePath}`));
      console.log('');
    }

    if (delta.toDelete.length > 0 && delta.toDelete.length <= 20) {
      console.log('🗑️  Orphaned vectors to DELETE:');
      delta.toDelete.forEach(v => console.log(`   - ${v.filePath}`));
      console.log('');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC EXECUTOR
  // ═══════════════════════════════════════════════════════════════════════════

  async sync(options: { force?: boolean; addOnly?: boolean; deleteOrphans?: boolean } = {}): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      added: 0,
      updated: 0,
      deleted: 0,
      errors: [],
      duration: 0,
      timestamp: startTime,
    };

    await this.connect();
    const delta = await this.calculateDelta();

    if (delta.stats.deltaSize === 0) {
      this.log('✅ Everything is in sync! No operations needed.');
      result.duration = Date.now() - startTime;
      return result;
    }

    if (this.config.dryRun) {
      this.log('🔍 DRY RUN - No changes will be made');
      result.duration = Date.now() - startTime;
      return result;
    }

    const ns = this.index.namespace(this.config.namespace);

    // Process additions
    if (delta.toAdd.length > 0) {
      this.log(`➕ Adding ${delta.toAdd.length} new vectors...`);
      result.added = await this.upsertFiles(ns, delta.toAdd, result.errors);
    }

    // Process updates
    if (delta.toUpdate.length > 0 && !options.addOnly) {
      this.log(`🔄 Updating ${delta.toUpdate.length} changed vectors...`);
      result.updated = await this.upsertFiles(ns, delta.toUpdate, result.errors);
    }

    // Process deletions
    if (delta.toDelete.length > 0 && options.deleteOrphans) {
      this.log(`🗑️ Deleting ${delta.toDelete.length} orphaned vectors...`);
      result.deleted = await this.deleteVectors(ns, delta.toDelete, result.errors);
    }

    result.duration = Date.now() - startTime;
    
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                    SYNC COMPLETE                                 ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log(`║  ➕ Added:    ${result.added.toString().padStart(6)}                                        ║`);
    console.log(`║  🔄 Updated:  ${result.updated.toString().padStart(6)}                                        ║`);
    console.log(`║  🗑️  Deleted:  ${result.deleted.toString().padStart(6)}                                        ║`);
    console.log(`║  ⏱️  Duration: ${(result.duration / 1000).toFixed(2).padStart(6)}s                                       ║`);
    if (result.errors.length > 0) {
      console.log(`║  ❌ Errors:   ${result.errors.length.toString().padStart(6)}                                        ║`);
    }
    console.log('╚══════════════════════════════════════════════════════════════════╝');

    return result;
  }

  private async upsertFiles(ns: any, files: FileInfo[], errors: string[]): Promise<number> {
    let success = 0;
    
    // Process in batches
    for (let i = 0; i < files.length; i += this.config.batchSize) {
      const batch = files.slice(i, i + this.config.batchSize);
      
      try {
        const vectors = batch.map(file => ({
          id: this.generateVectorId(file.relativePath),
          values: this.generateDummyVector(), // TODO: Replace with actual embedding
          metadata: {
            filePath: file.relativePath,
            hash: file.hash,
            project: file.relativePath.split('/')[0],
            size: file.size,
            lastSync: Date.now(),
            extension: path.extname(file.path),
          },
        }));

        await ns.upsert(vectors);
        success += batch.length;
        
        this.log(`   Batch ${Math.floor(i / this.config.batchSize) + 1}: ${batch.length} vectors`);
      } catch (err: any) {
        errors.push(`Batch error: ${err.message}`);
      }
    }

    return success;
  }

  private async deleteVectors(ns: any, vectors: VectorInfo[], errors: string[]): Promise<number> {
    let success = 0;
    
    try {
      const ids = vectors.map(v => v.id);
      
      // Delete in batches of 1000
      for (let i = 0; i < ids.length; i += 1000) {
        const batch = ids.slice(i, i + 1000);
        await ns.deleteMany(batch);
        success += batch.length;
      }
    } catch (err: any) {
      errors.push(`Delete error: ${err.message}`);
    }

    return success;
  }

  private generateVectorId(filePath: string): string {
    return filePath.replace(/[\/\\]/g, '-').replace(/\./g, '_');
  }

  private generateDummyVector(): number[] {
    // Placeholder - should be replaced with actual embedding generation
    return Array(512).fill(0).map(() => Math.random() * 2 - 1);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY
  // ═══════════════════════════════════════════════════════════════════════════

  private log(message: string): void {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${timestamp}] ${message}`);
    this.emit('log', message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'delta';

  const engine = new VectorSyncEngine();

  console.log('');
  console.log('🧠 QANTUM VECTOR SYNC ENGINE v1.0');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');

  try {
    switch (command) {
      case 'delta':
      case 'diff':
        await engine.calculateDelta();
        break;

      case 'sync':
        await engine.sync({ addOnly: args.includes('--add-only') });
        break;

      case 'sync-all':
        await engine.sync({ deleteOrphans: true });
        break;

      case 'cleanup':
        await engine.sync({ addOnly: false, deleteOrphans: true });
        break;

      case 'dry-run':
        const dryEngine = new VectorSyncEngine({ dryRun: true });
        await dryEngine.sync();
        break;

      default:
        console.log('Usage: vector-sync <command>');
        console.log('');
        console.log('Commands:');
        console.log('  delta, diff    Calculate delta between local and remote');
        console.log('  sync           Sync new and changed files');
        console.log('  sync-all       Sync everything including orphan cleanup');
        console.log('  cleanup        Only delete orphaned vectors');
        console.log('  dry-run        Show what would be done without making changes');
        console.log('');
        console.log('Options:');
        console.log('  --add-only     Only add new files, skip updates');
    }
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Export types for use as module
export type { SyncConfig, SyncDelta, SyncResult };

// Run if executed directly
main().catch(console.error);
