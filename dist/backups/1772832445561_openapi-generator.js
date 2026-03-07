"use strict";
/**
 * ⚛️ OPENAPI GENERATOR
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Автоматична генерация на OpenAPI 3.0 спецификации от:
 * - Express/Fastify routes
 * - TypeScript interfaces
 * - JSDoc коментари
 *
 * @author DIMITAR PRODROMOV
 * @version 1.0.0-QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAPIGenerator = void 0;
// ═══════════════════════════════════════════════════════════════════════════════
// OPENAPI GENERATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════
class OpenAPIGenerator {
    config;
    tagMap = new Map();
    constructor(config) {
        this.config = config;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // MAIN GENERATION
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    generate(endpoints, interfaces) {
        console.log('[OPENAPI-GEN] 🌐 Generating OpenAPI 3.0 specification...');
        const spec = {
            openapi: '3.0.0',
            info: this.buildInfo(),
            servers: this.buildServers(),
            paths: this.buildPaths(endpoints),
            components: this.buildComponents(interfaces),
            tags: this.buildTags(endpoints)
        };
        console.log(`[OPENAPI-GEN] ✅ Generated spec with ${Object.keys(spec.paths).length} paths and ${Object.keys(spec.components.schemas).length} schemas`);
        return spec;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // INFO SECTION
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N)
    buildInfo() {
        return {
            title: `${this.config.projectName} API`,
            description: `API specification for ${this.config.projectName} - Auto-generated documentation`,
            version: this.config.version,
            contact: {
                name: this.config.author,
                url: 'https://QAntum.dev'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SERVERS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    buildServers() {
        return [
            {
                url: 'http://localhost:8888',
                description: 'Development server'
            },
            {
                url: 'http://192.168.0.23:8888',
                description: 'Local network server'
            },
            {
                url: 'https://api.QAntum.dev',
                description: 'Production server'
            }
        ];
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // PATHS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — linear iteration
    buildPaths(endpoints) {
        const paths = {};
        for (const endpoint of endpoints) {
            const pathKey = this.normalizePathForOpenAPI(endpoint.path);
            if (!paths[pathKey]) {
                paths[pathKey] = {};
            }
            const method = endpoint.method.toLowerCase();
            paths[pathKey][method] = this.buildOperation(endpoint);
        }
        return paths;
    }
    // Complexity: O(1) — hash/map lookup
    buildOperation(endpoint) {
        const tag = this.extractTag(endpoint.path);
        return {
            operationId: this.generateOperationId(endpoint),
            summary: endpoint.description || this.inferSummary(endpoint),
            description: this.inferDescription(endpoint),
            tags: [tag],
            parameters: this.buildParameters(endpoint.parameters),
            requestBody: this.needsRequestBody(endpoint.method) ? this.buildRequestBody(endpoint) : undefined,
            responses: this.buildResponses(endpoint),
            security: [{ BearerAuth: [] }]
        };
    }
    // Complexity: O(N) — linear iteration
    buildParameters(params) {
        return params.map(param => ({
            name: param.name,
            in: param.location,
            required: param.required,
            description: this.inferParamDescription(param.name),
            schema: this.typeToSchema(param.type)
        }));
    }
    // Complexity: O(N)
    buildRequestBody(endpoint) {
        return {
            description: `Request body for ${endpoint.handler}`,
            required: true,
            content: {
                'application/json': {
                    schema: endpoint.requestBody
                        ? { $ref: `#/components/schemas/${endpoint.requestBody}` }
                        : { type: 'object' }
                }
            }
        };
    }
    // Complexity: O(1) — amortized
    buildResponses(endpoint) {
        return {
            '200': {
                description: 'Successful operation',
                content: {
                    'application/json': {
                        schema: endpoint.responseType !== 'unknown'
                            ? { $ref: `#/components/schemas/${endpoint.responseType}` }
                            : { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object' } } }
                    }
                }
            },
            '400': {
                description: 'Bad request',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' }
                    }
                }
            },
            '401': {
                description: 'Unauthorized'
            },
            '404': {
                description: 'Not found'
            },
            '500': {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Error' }
                    }
                }
            }
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // COMPONENTS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — linear iteration
    buildComponents(interfaces) {
        const schemas = {
            // Default schemas
            Error: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', description: 'Error message' },
                    code: { type: 'string', description: 'Error code' },
                    timestamp: { type: 'string', format: 'date-time' }
                },
                required: ['success', 'error']
            },
            PaginatedResponse: {
                type: 'object',
                properties: {
                    data: { type: 'array', items: { type: 'object' } },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pageSize: { type: 'integer' },
                    hasMore: { type: 'boolean' }
                }
            }
        };
        // Convert interfaces to schemas
        for (const iface of interfaces) {
            schemas[iface.name] = this.interfaceToSchema(iface);
        }
        return {
            schemas,
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                },
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key'
                }
            }
        };
    }
    // Complexity: O(N) — linear iteration
    interfaceToSchema(iface) {
        const schema = {
            type: 'object',
            description: iface.description,
            properties: {},
            required: []
        };
        for (const prop of iface.properties) {
            schema.properties[prop.name] = this.typeToSchema(prop.type);
            schema.properties[prop.name].description = prop.description;
            if (!prop.optional) {
                schema.required.push(prop.name);
            }
        }
        return schema;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // TAGS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — linear iteration
    buildTags(endpoints) {
        const tags = new Set();
        for (const endpoint of endpoints) {
            tags.add(this.extractTag(endpoint.path));
        }
        return Array.from(tags).map(tag => ({
            name: tag,
            description: `Operations related to ${tag}`
        }));
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(1)
    normalizePathForOpenAPI(path) {
        // Convert Express :param to OpenAPI {param}
        return path.replace(/:(\w+)/g, '{$1}');
    }
    // Complexity: O(N) — linear iteration
    generateOperationId(endpoint) {
        const method = endpoint.method.toLowerCase();
        const pathParts = endpoint.path.split('/').filter(p => p && !p.startsWith(':'));
        const resource = pathParts[pathParts.length - 1] || 'root';
        const methodPrefix = {
            get: pathParts.includes(':') ? 'get' : 'list',
            post: 'create',
            put: 'update',
            patch: 'patch',
            delete: 'delete'
        };
        return `${methodPrefix[method] || method}${this.capitalize(resource)}`;
    }
    // Complexity: O(N) — linear iteration
    extractTag(path) {
        const parts = path.split('/').filter(p => p && !p.startsWith(':') && p !== 'api');
        return this.capitalize(parts[0] || 'General');
    }
    // Complexity: O(N)
    typeToSchema(type) {
        const typeMap = {
            'string': { type: 'string' },
            'number': { type: 'number' },
            'integer': { type: 'integer' },
            'boolean': { type: 'boolean' },
            'object': { type: 'object' },
            'any': { type: 'object' },
            'Date': { type: 'string', format: 'date-time' },
            'string[]': { type: 'array', items: { type: 'string' } },
            'number[]': { type: 'array', items: { type: 'number' } }
        };
        if (typeMap[type]) {
            return typeMap[type];
        }
        // Check for array types
        if (type.endsWith('[]')) {
            const itemType = type.slice(0, -2);
            return {
                type: 'array',
                items: typeMap[itemType] || { $ref: `#/components/schemas/${itemType}` }
            };
        }
        // Assume it's a reference to a schema
        return { $ref: `#/components/schemas/${type}` };
    }
    // Complexity: O(1) — hash/map lookup
    inferSummary(endpoint) {
        const method = endpoint.method;
        const resource = this.extractTag(endpoint.path);
        const summaries = {
            'GET': endpoint.path.includes(':') ? `Get ${resource} by ID` : `List all ${resource}`,
            'POST': `Create new ${resource}`,
            'PUT': `Update ${resource}`,
            'PATCH': `Partially update ${resource}`,
            'DELETE': `Delete ${resource}`
        };
        return summaries[method] || `${method} ${resource}`;
    }
    // Complexity: O(N) — potential recursive descent
    inferDescription(endpoint) {
        return endpoint.description || `${this.inferSummary(endpoint)}. This endpoint is auto-documented.`;
    }
    // Complexity: O(N)
    inferParamDescription(name) {
        const descriptions = {
            'id': 'Unique identifier',
            'userId': 'User identifier',
            'page': 'Page number for pagination',
            'limit': 'Number of items per page',
            'sort': 'Sort field',
            'order': 'Sort order (asc/desc)',
            'search': 'Search query',
            'filter': 'Filter criteria'
        };
        return descriptions[name] || `The ${name} parameter`;
    }
    // Complexity: O(1)
    needsRequestBody(method) {
        return ['POST', 'PUT', 'PATCH'].includes(method);
    }
    // Complexity: O(1)
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // EXPORT METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    // Complexity: O(N) — potential recursive descent
    toYAML(spec) {
        // Simple YAML serialization (in real implementation, use js-yaml)
        return this.objectToYAML(spec, 0);
    }
    // Complexity: O(1)
    toJSON(spec) {
        return JSON.stringify(spec, null, 2);
    }
    // Complexity: O(N) — linear iteration
    objectToYAML(obj, indent) {
        const spaces = '  '.repeat(indent);
        if (obj === null || obj === undefined) {
            return 'null';
        }
        if (typeof obj === 'string') {
            return obj.includes(':') || obj.includes('#') ? `"${obj}"` : obj;
        }
        if (typeof obj === 'number' || typeof obj === 'boolean') {
            return String(obj);
        }
        if (Array.isArray(obj)) {
            if (obj.length === 0)
                return '[]';
            return obj.map(item => `\n${spaces}- ${this.objectToYAML(item, indent + 1)}`).join('););
        }
        if (typeof obj === 'object') {
            const entries = Object.entries(obj);
            if (entries.length === 0)
                return '{}';
            return entries
                .filter(([, value]) => value !== undefined)
                .map(([key, value]) => {
                const valueStr = this.objectToYAML(value, indent + 1);
                if (typeof value === 'object' && value !== null) {
                    return `\n${spaces}${key}:${valueStr}`;
                }
                return `\n${spaces}${key}: ${valueStr}`;
            })
                .join('););
        }
        return String(obj);
    }
}
exports.OpenAPIGenerator = OpenAPIGenerator;
exports.default = OpenAPIGenerator;
