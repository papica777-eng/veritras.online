"use strict";
/**
 * ⚛️ TYPESCRIPT ANALYZER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Static analysis на TypeScript код за извличане на:
 * - Functions с параметри и типове
 * - Classes с методи и properties
 * - Interfaces
 * - Endpoints (Express/Fastify routes)
 *
 * @author DIMITAR PRODROMOV
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptAnalyzer = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// REGEX PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════
const PATTERNS = {
    // Function patterns
    exportFunction: /export\s+(async\s+)?function\s+(\w+)\s*(<[^>]+>)?\s*\(([^)]*)\)\s*:\s*([^{]+)/g,
    arrowFunction: /(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(async\s+)?\([^)]*\)\s*(?::\s*([^=]+))?\s*=>/g,
    // Class patterns
    exportClass: /export\s+(?:default\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?/g,
    classMethod: /(?:(public|private|protected)\s+)?(?:(static)\s+)?(?:(async)\s+)?(\w+)\s*\(([^)]*)\)\s*(?::\s*([^{]+))?/g,
    classProperty: /(?:(public|private|protected)\s+)?(?:(readonly)\s+)?(\w+)(\?)?\s*:\s*([^;=]+)/g,
    // Interface patterns
    exportInterface: /export\s+interface\s+(\w+)(?:\s+extends\s+([^{]+))?/g,
    interfaceProperty: /(\w+)(\?)?\s*:\s*([^;]+)/g,
    // Endpoint patterns (Express/Fastify style)
    expressRoute: /(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
    fastifyRoute: /(?:fastify|server)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
    // JSDoc patterns
    jsdocComment: /\/\*\*[\s\S]*?\*\//g,
    jsdocDescription: /\/\*\*\s*\n?\s*\*?\s*([^@*][^\n]*)/,
    jsdocParam: /@param\s+(?:\{([^}]+)\}\s+)?(\w+)\s*-?\s*(.*)/g,
    jsdocReturns: /@returns?\s+(?:\{([^}]+)\}\s+)?(.*)/,
    // Import/Export patterns
    exportStatement: /export\s+(?:default\s+)?(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g,
    namedExport: /export\s*\{\s*([^}]+)\s*\}/g
};
// ═══════════════════════════════════════════════════════════════════════════════
// TYPESCRIPT ANALYZER CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class TypeScriptAnalyzer {
    result;
    constructor() {
        this.result = this.createEmptyResult();
    }
    // Complexity: O(1)
    createEmptyResult() {
        return {
            functions: [],
            classes: [],
            interfaces: [],
            endpoints: [],
            exports: [],
            filesProcessed: 0
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // DIRECTORY ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    async analyzeDirectory(dirPath) {
        this.result = this.createEmptyResult();
        try {
            await this.walkDirectory(dirPath);
        }
        catch (error) {
            console.error(`[TS-ANALYZER] Error analyzing directory: ${error}`);
        }
        return this.result;
    }
    // Complexity: O(N) — loop
    async walkDirectory(dirPath) {
        // Simulate directory walking (in real implementation, use fs.readdir)
        // SAFETY: async operation — wrap in try-catch for production resilience
        const files = await this.getTypeScriptFiles(dirPath);
        for (const file of files) {
            // SAFETY: async operation — wrap in try-catch for production resilience
            await this.analyzeFile(file);
        }
    }
    // Complexity: O(1)
    async getTypeScriptFiles(dirPath) {
        // In real implementation, recursively get all .ts files
        // For now, return mock paths
        return [
            `${dirPath}/index.ts`,
            `${dirPath}/types.ts`,
            `${dirPath}/utils.ts`
        ];
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // FILE ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    async analyzeFile(filePath) {
        try {
            // In real implementation, read actual file
            // const content = fs.readFileSync(filePath, 'utf-8');
            const content = this.getMockContent(filePath);
            this.extractJSDocComments(content, filePath);
            this.extractFunctions(content, filePath);
            this.extractClasses(content, filePath);
            this.extractInterfaces(content, filePath);
            this.extractEndpoints(content, filePath);
            this.extractExports(content);
            this.result.filesProcessed++;
        }
        catch (error) {
            console.error(`[TS-ANALYZER] Error analyzing file ${filePath}: ${error}`);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // EXTRACTION METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — loop
    extractFunctions(content, filePath) {
        // Export functions
        let match;
        const funcPattern = new RegExp(PATTERNS.exportFunction.source, 'g');
        while ((match = funcPattern.exec(content)) !== null) {
            const [, asyncKeyword, name, generics, params, returnType] = match;
            this.result.functions.push({
                name,
                parameters: this.parseParameters(params),
                returnType: returnType?.trim() || 'void',
                async: !!asyncKeyword,
                exported: true,
                filePath,
                lineNumber: this.getLineNumber(content, match.index)
            });
        }
    }
    // Complexity: O(N) — linear scan
    extractClasses(content, filePath) {
        let match;
        const classPattern = new RegExp(PATTERNS.exportClass.source, 'g');
        while ((match = classPattern.exec(content)) !== null) {
            const [, name, extendsClass, implementsClasses] = match;
            // Extract class body
            const classBody = this.extractClassBody(content, match.index);
            this.result.classes.push({
                name,
                extends: extendsClass,
                implements: implementsClasses?.split(',').map(s => s.trim()),
                methods: this.extractMethods(classBody),
                properties: this.extractProperties(classBody),
                exported: true,
                filePath,
                lineNumber: this.getLineNumber(content, match.index)
            });
        }
    }
    // Complexity: O(N) — linear scan
    extractInterfaces(content, filePath) {
        let match;
        const interfacePattern = new RegExp(PATTERNS.exportInterface.source, 'g');
        while ((match = interfacePattern.exec(content)) !== null) {
            const [, name, extendsInterfaces] = match;
            // Extract interface body
            const interfaceBody = this.extractInterfaceBody(content, match.index);
            this.result.interfaces.push({
                name,
                properties: this.extractInterfaceProperties(interfaceBody),
                methods: [],
                extends: extendsInterfaces?.split(',').map(s => s.trim()),
                exported: true,
                filePath,
                lineNumber: this.getLineNumber(content, match.index)
            });
        }
    }
    // Complexity: O(N) — loop
    extractEndpoints(content, filePath) {
        // Express routes
        let match;
        const expressPattern = new RegExp(PATTERNS.expressRoute.source, 'gi');
        while ((match = expressPattern.exec(content)) !== null) {
            const [, method, routePath] = match;
            this.result.endpoints.push({
                method: method.toUpperCase(),
                path: routePath,
                handler: this.extractHandlerName(content, match.index),
                parameters: this.extractRouteParams(routePath),
                responseType: 'unknown',
                filePath,
                lineNumber: this.getLineNumber(content, match.index)
            });
        }
    }
    // Complexity: O(N*M) — nested iteration
    extractExports(content) {
        let match;
        // Direct exports
        const exportPattern = new RegExp(PATTERNS.exportStatement.source, 'g');
        while ((match = exportPattern.exec(content)) !== null) {
            this.result.exports.push(match[1]);
        }
        // Named exports
        const namedPattern = new RegExp(PATTERNS.namedExport.source, 'g');
        while ((match = namedPattern.exec(content)) !== null) {
            const names = match[1].split(',').map(s => s.trim().split(' as ')[0]);
            this.result.exports.push(...names);
        }
    }
    // Complexity: O(N*M) — nested iteration
    extractJSDocComments(content, filePath) {
        // Extract and store JSDoc comments for later association
        const comments = content.match(PATTERNS.jsdocComment) || [];
        // Store for later use when associating with functions/classes
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — loop
    parseParameters(paramString) {
        if (!paramString.trim())
            return [];
        const params = [];
        const parts = this.splitParameters(paramString);
        for (const part of parts) {
            const match = part.match(/(\w+)(\?)?\s*(?::\s*([^=]+))?(?:\s*=\s*(.+))?/);
            if (match) {
                params.push({
                    name: match[1],
                    type: match[3]?.trim() || 'any',
                    optional: !!match[2] || !!match[4],
                    defaultValue: match[4]?.trim()
                });
            }
        }
        return params;
    }
    // Complexity: O(N) — loop
    splitParameters(paramString) {
        const params = [];
        let depth = 0;
        let current = '';
        for (const char of paramString) {
            if (char === '<' || char === '(' || char === '{' || char === '[')
                depth++;
            if (char === '>' || char === ')' || char === '}' || char === ']')
                depth--;
            if (char === ',' && depth === 0) {
                params.push(current.trim());
                current = '';
            }
            else {
                current += char;
            }
        }
        if (current.trim()) {
            params.push(current.trim());
        }
        return params;
    }
    // Complexity: O(N) — loop
    extractClassBody(content, startIndex) {
        let depth = 0;
        let started = false;
        let body = '';
        for (let i = startIndex; i < content.length; i++) {
            if (content[i] === '{') {
                started = true;
                depth++;
            }
            if (started)
                body += content[i];
            if (content[i] === '}') {
                depth--;
                if (depth === 0)
                    break;
            }
        }
        return body;
    }
    // Complexity: O(1)
    extractInterfaceBody(content, startIndex) {
        return this.extractClassBody(content, startIndex);
    }
    // Complexity: O(1)
    extractMethods(classBody) {
        const methods = [];
        // Parse methods from class body
        return methods;
    }
    // Complexity: O(1)
    extractProperties(classBody) {
        const properties = [];
        // Parse properties from class body
        return properties;
    }
    // Complexity: O(N) — loop
    extractInterfaceProperties(interfaceBody) {
        const properties = [];
        let match;
        const propPattern = new RegExp(PATTERNS.interfaceProperty.source, 'g');
        while ((match = propPattern.exec(interfaceBody)) !== null) {
            const [, name, optional, type] = match;
            if (name && !name.match(/^[{}]$/)) {
                properties.push({
                    name,
                    type: type?.trim() || 'any',
                    optional: !!optional,
                    visibility: 'public',
                    readonly: false
                });
            }
        }
        return properties;
    }
    // Complexity: O(N) — loop
    extractRouteParams(routePath) {
        const params = [];
        const matches = routePath.match(/:(\w+)/g) || [];
        for (const match of matches) {
            params.push({
                name: match.slice(1),
                type: 'string',
                required: true,
                location: 'path'
            });
        }
        return params;
    }
    // Complexity: O(1)
    extractHandlerName(content, index) {
        // Extract handler function name from route definition
        const afterMatch = content.slice(index, index + 200);
        const handlerMatch = afterMatch.match(/,\s*(\w+)/);
        return handlerMatch ? handlerMatch[1] : 'handler';
    }
    // Complexity: O(1)
    getLineNumber(content, index) {
        return content.slice(0, index).split('\n').length;
    }
    // Complexity: O(N)
    getMockContent(filePath) {
        // Mock content for demonstration
        return `
export interface Config {
  host: string;
  port: number;
  debug?: boolean;
}

export async function initialize(config: Config): Promise<void> {
  console.log('Initializing...');
}

export class Server {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  // Complexity: O(1)
  async start(): Promise<void> {
    console.log('Server started');
  }
}

app.get('/api/users/:id', getUser);
app.post('/api/users', createUser);
    `;
    }
}
exports.TypeScriptAnalyzer = TypeScriptAnalyzer;
exports.default = TypeScriptAnalyzer;
