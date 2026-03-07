/**
 * Type declarations for external modules
 */

declare module 'better-sqlite3' {
  interface Database {
    // Complexity: O(1)
    exec(sql: string): this;
    // Complexity: O(1)
    prepare(sql: string): Statement;
    transaction<T extends (...args: any[]) => any>(fn: T): T;
    // Complexity: O(1)
    pragma(pragma: string, options?: { simple?: boolean }): any;
    // Complexity: O(1)
    close(): void;
    readonly open: boolean;
    readonly inTransaction: boolean;
    readonly name: string;
    readonly memory: boolean;
    readonly readonly: boolean;
  }

  interface Statement {
    // Complexity: O(1)
    run(...params: any[]): RunResult;
    // Complexity: O(1)
    get(...params: any[]): any;
    // Complexity: O(1)
    all(...params: any[]): any[];
    // Complexity: O(1)
    iterate(...params: any[]): IterableIterator<any>;
    // Complexity: O(1)
    pluck(toggle?: boolean): this;
    // Complexity: O(1)
    expand(toggle?: boolean): this;
    // Complexity: O(1)
    raw(toggle?: boolean): this;
    // Complexity: O(1)
    columns(): ColumnDefinition[];
    // Complexity: O(1)
    bind(...params: any[]): this;
  }

  interface RunResult {
    changes: number;
    lastInsertRowid: number | bigint;
  }

  interface ColumnDefinition {
    name: string;
    column: string | null;
    table: string | null;
    database: string | null;
    type: string | null;
  }

  interface DatabaseConstructor {
    new (filename: string | Buffer, options?: Options): Database;
    (filename: string | Buffer, options?: Options): Database;
  }

  interface Options {
    readonly?: boolean;
    fileMustExist?: boolean;
    timeout?: number;
    verbose?: (message?: any, ...additionalArgs: any[]) => void;
    nativeBinding?: string;
  }

  const Database: DatabaseConstructor;
  export = Database;
}

declare module '@tensorflow/tfjs-node' {
  export * from '@tensorflow/tfjs';
}

declare module '@tensorflow-models/universal-sentence-encoder' {
  export interface UniversalSentenceEncoder {
    // Complexity: O(1)
    embed(sentences: string[]): Promise<{
      // Complexity: O(1)
      arraySync(): number[][];
      // Complexity: O(1)
      dispose(): void;
    }>;
  }
  
  export function load(): Promise<UniversalSentenceEncoder>;
}
