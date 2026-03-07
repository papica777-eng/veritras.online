/**
 * Type declarations for external modules
 */

declare module 'better-sqlite3' {
  interface Database {
    exec(sql: string): this;
    prepare(sql: string): Statement;
    transaction<T extends (...args: any[]) => any>(fn: T): T;
    pragma(pragma: string, options?: { simple?: boolean }): any;
    close(): void;
    readonly open: boolean;
    readonly inTransaction: boolean;
    readonly name: string;
    readonly memory: boolean;
    readonly readonly: boolean;
  }

  interface Statement {
    run(...params: any[]): RunResult;
    get(...params: any[]): any;
    all(...params: any[]): any[];
    iterate(...params: any[]): IterableIterator<any>;
    pluck(toggle?: boolean): this;
    expand(toggle?: boolean): this;
    raw(toggle?: boolean): this;
    columns(): ColumnDefinition[];
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
    embed(sentences: string[]): Promise<{
      arraySync(): number[][];
      dispose(): void;
    }>;
  }
  
  export function load(): Promise<UniversalSentenceEncoder>;
}
