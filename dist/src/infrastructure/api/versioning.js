"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                               ║
 * ║   QAntum API VERSIONING                                                       ║
 * ║   "Semantic versioning for API routes"                                        ║
 * ║                                                                               ║
 * ║   TODO B #45 - API: Versioning                                                ║
 * ║                                                                               ║
 * ║   © 2025-2026 QAntum | Dimitar Prodromov                                        ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMigrationManager = exports.createVersionManager = exports.MigrationManager = exports.APIVersionManager = exports.VersionParser = void 0;
exports.Version = Version;
exports.Deprecated = Deprecated;
// ═══════════════════════════════════════════════════════════════════════════════
// VERSION PARSER
// ═══════════════════════════════════════════════════════════════════════════════
class VersionParser {
    static VERSION_REGEX = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-(.+))?$/;
    /**
     * Parse version string to SemanticVersion
     */
    static parse(version) {
        const match = version.match(this.VERSION_REGEX);
        if (!match)
            return null;
        return {
            major: parseInt(match[1], 10),
            minor: match[2] ? parseInt(match[2], 10) : 0,
            patch: match[3] ? parseInt(match[3], 10) : 0,
            prerelease: match[4]
        };
    }
    /**
     * Convert SemanticVersion to string
     */
    static stringify(version) {
        let str = `${version.major}.${version.minor}.${version.patch}`;
        if (version.prerelease) {
            str += `-${version.prerelease}`;
        }
        return str;
    }
    /**
     * Compare two versions
     * Returns: -1 if a < b, 0 if equal, 1 if a > b
     */
    static compare(a, b) {
        const vA = typeof a === 'string' ? this.parse(a) : a;
        const vB = typeof b === 'string' ? this.parse(b) : b;
        if (!vA || !vB)
            return 0;
        if (vA.major !== vB.major)
            return vA.major > vB.major ? 1 : -1;
        if (vA.minor !== vB.minor)
            return vA.minor > vB.minor ? 1 : -1;
        if (vA.patch !== vB.patch)
            return vA.patch > vB.patch ? 1 : -1;
        // Pre-release versions have lower precedence
        if (vA.prerelease && !vB.prerelease)
            return -1;
        if (!vA.prerelease && vB.prerelease)
            return 1;
        if (vA.prerelease && vB.prerelease) {
            return vA.prerelease.localeCompare(vB.prerelease);
        }
        return 0;
    }
    /**
     * Check if version satisfies a range
     */
    static satisfies(version, range) {
        const parsed = this.parse(version);
        if (!parsed)
            return false;
        // Handle exact match
        if (!range.includes('^') && !range.includes('~') && !range.includes('-')) {
            const rangeVer = this.parse(range);
            return rangeVer ? this.compare(parsed, rangeVer) === 0 : false;
        }
        // Handle caret range (^1.2.3 = >=1.2.3 <2.0.0)
        if (range.startsWith('^')) {
            const base = this.parse(range.slice(1));
            if (!base)
                return false;
            if (this.compare(parsed, base) < 0)
                return false;
            if (parsed.major !== base.major)
                return false;
            return true;
        }
        // Handle tilde range (~1.2.3 = >=1.2.3 <1.3.0)
        if (range.startsWith('~')) {
            const base = this.parse(range.slice(1));
            if (!base)
                return false;
            if (this.compare(parsed, base) < 0)
                return false;
            if (parsed.major !== base.major)
                return false;
            if (parsed.minor !== base.minor)
                return false;
            return true;
        }
        // Handle range (1.0.0-2.0.0)
        if (range.includes(' - ')) {
            const [minStr, maxStr] = range.split(' - ');
            const min = this.parse(minStr.trim());
            const max = this.parse(maxStr.trim());
            if (!min || !max)
                return false;
            return this.compare(parsed, min) >= 0 && this.compare(parsed, max) <= 0;
        }
        return false;
    }
    /**
     * Get major version number
     */
    static major(version) {
        const parsed = this.parse(version);
        return parsed ? parsed.major : 0;
    }
    /**
     * Check if breaking change (major version bump)
     */
    static isBreaking(oldVersion, newVersion) {
        return this.major(newVersion) > this.major(oldVersion);
    }
}
exports.VersionParser = VersionParser;
// ═══════════════════════════════════════════════════════════════════════════════
// API VERSION MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
class APIVersionManager {
    routes = new Map();
    config;
    deprecations = new Map();
    constructor(config = {}) {
        this.config = {
            header: 'X-API-Version',
            queryParam: 'version',
            urlPrefix: true,
            defaultVersion: '1.0.0',
            supportedVersions: ['1.0.0'],
            ...config
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // ROUTE REGISTRATION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Register a versioned route
     */
    // Complexity: O(N log N) — sort
    register(path, version, handler) {
        let route = this.routes.get(path);
        if (!route) {
            route = {
                path,
                versions: new Map(),
                deprecated: new Map()
            };
            this.routes.set(path, route);
        }
        route.versions.set(version, handler);
        // Add to supported versions if not present
        if (!this.config.supportedVersions.includes(version)) {
            this.config.supportedVersions.push(version);
            this.config.supportedVersions.sort((a, b) => VersionParser.compare(a, b));
        }
        return this;
    }
    /**
     * Mark a version as deprecated
     */
    // Complexity: O(1) — lookup
    deprecate(version, sunset, replacement, message) {
        this.deprecations.set(version, {
            since: new Date().toISOString().split('T')[0],
            sunset,
            replacement,
            message
        });
        return this;
    }
    /**
     * Deprecate a specific route version
     */
    // Complexity: O(1) — lookup
    deprecateRoute(path, version, info) {
        const route = this.routes.get(path);
        if (route) {
            route.deprecated.set(version, info);
        }
        return this;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // VERSION RESOLUTION
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Resolve handler for a path and version
     */
    // Complexity: O(N log N) — sort
    resolve(path, version) {
        const effectiveVersion = version || this.config.defaultVersion;
        const route = this.routes.get(path);
        if (!route) {
            return {
                handler: null,
                version: effectiveVersion,
                deprecated: false
            };
        }
        // Exact match
        let handler = route.versions.get(effectiveVersion);
        // Fallback to closest lower version
        if (!handler) {
            const versions = [...route.versions.keys()]
                .sort((a, b) => VersionParser.compare(b, a)); // Descending
            for (const v of versions) {
                if (VersionParser.compare(v, effectiveVersion) <= 0) {
                    handler = route.versions.get(v);
                    break;
                }
            }
        }
        // Check deprecation
        const routeDeprecation = route.deprecated.get(effectiveVersion);
        const globalDeprecation = this.deprecations.get(effectiveVersion);
        const deprecationInfo = routeDeprecation || globalDeprecation;
        return {
            handler: handler || null,
            version: effectiveVersion,
            deprecated: !!deprecationInfo,
            deprecationInfo
        };
    }
    /**
     * Negotiate version from request context
     */
    // Complexity: O(1) — lookup
    negotiate(context) {
        let version;
        let source = 'default';
        // Check URL prefix first
        if (this.config.urlPrefix && context.url) {
            const match = context.url.match(/\/v(\d+(?:\.\d+)?(?:\.\d+)?)\//);
            if (match) {
                version = match[1];
                source = 'url';
            }
        }
        // Check header
        if (!version && context.headers && this.config.header) {
            version = context.headers[this.config.header] ||
                context.headers[this.config.header.toLowerCase()];
            if (version)
                source = 'header';
        }
        // Check query param
        if (!version && context.query && this.config.queryParam) {
            version = context.query[this.config.queryParam];
            if (version)
                source = 'query';
        }
        // Use default
        const finalVersion = version || this.config.defaultVersion;
        const deprecationInfo = this.deprecations.get(finalVersion);
        return {
            version: finalVersion,
            source,
            isDeprecated: !!deprecationInfo,
            deprecationInfo
        };
    }
    // ─────────────────────────────────────────────────────────────────────────
    // QUERIES
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Get all supported versions
     */
    // Complexity: O(1)
    getSupportedVersions() {
        return [...this.config.supportedVersions];
    }
    /**
     * Get latest version
     */
    // Complexity: O(1)
    getLatestVersion() {
        const versions = this.getSupportedVersions();
        return versions[versions.length - 1] || this.config.defaultVersion;
    }
    /**
     * Check if version is supported
     */
    // Complexity: O(1)
    isSupported(version) {
        return this.config.supportedVersions.some(v => VersionParser.major(v) === VersionParser.major(version));
    }
    /**
     * Get all routes for a version
     */
    // Complexity: O(N) — loop
    getRoutesForVersion(version) {
        const paths = [];
        for (const [path, route] of this.routes) {
            if (route.versions.has(version)) {
                paths.push(path);
            }
        }
        return paths;
    }
    /**
     * Get deprecation info for a version
     */
    // Complexity: O(1) — lookup
    getDeprecationInfo(version) {
        return this.deprecations.get(version);
    }
}
exports.APIVersionManager = APIVersionManager;
// ═══════════════════════════════════════════════════════════════════════════════
// DECORATORS
// ═══════════════════════════════════════════════════════════════════════════════
const versionMetadata = new Map();
/**
 * @Version - Mark method as available for specific versions
 */
function Version(...versions) {
    return function (target, propertyKey, descriptor) {
        const key = String(propertyKey);
        if (!versionMetadata.has(target.constructor)) {
            versionMetadata.set(target.constructor, new Map());
        }
        versionMetadata.get(target.constructor).set(key, versions);
        return descriptor;
    };
}
/**
 * @Deprecated - Mark method as deprecated
 */
function Deprecated(sunset, replacement) {
    return function (target, propertyKey, descriptor) {
        const original = descriptor.value;
        descriptor.value = function (...args) {
            console.warn(`[DEPRECATED] ${String(propertyKey)} is deprecated. ` +
                `Sunset: ${sunset}. ` +
                //                 (replacement ? `Use ${replacement} instead.` : ')
                //             );
                //             return original.apply(this, args);
                //         };
                //         return descriptor;
                //     };
                // }
                /**
                 * @Since - Mark method as available since version
                 */
                // export function Since(version: string): MethodDecorator {
                //     return function (
                //         target: any,
                //         propertyKey: string | symbol,
                //         descriptor: PropertyDescriptor
                //     ) {
                //         const original = descriptor.value;
                //         descriptor.value = function (this: any, ...args: any[]) {
                //             const requestVersion = (this as any)._currentVersion || '1.0.0';
                //             if (VersionParser.compare(requestVersion, version) < 0) {
                //                 throw new Error(
                `${String(propertyKey)} requires API version ${version} or higher. ` +
                `Current: ${requestVersion}`);
        };
        return original.apply(this, args);
        //         };
        return descriptor;
    };
}
class MigrationManager {
    migrations = [];
    /**
     * Register a migration
     */
    // Complexity: O(1)
    register(migration) {
        this.migrations.push(migration);
        return this;
    }
    /**
     * Transform request from old version to new
     */
    // Complexity: O(N) — loop
    upgradeRequest(request, fromVersion, toVersion) {
        const path = this.findMigrationPath(fromVersion, toVersion);
        let result = request;
        for (const migration of path) {
            if (migration.transformRequest) {
                result = migration.transformRequest(result);
            }
        }
        return result;
    }
    /**
     * Transform response from new version to old
     */
    // Complexity: O(N) — loop
    downgradeResponse(response, fromVersion, toVersion) {
        const path = this.findMigrationPath(toVersion, fromVersion).reverse();
        let result = response;
        for (const migration of path) {
            if (migration.transformResponse) {
                result = migration.transformResponse(result);
            }
        }
        return result;
    }
    // Complexity: O(N) — linear scan
    findMigrationPath(from, to) {
        const path = [];
        let current = from;
        while (VersionParser.compare(current, to) < 0) {
            const next = this.migrations.find(m => m.fromVersion === current);
            if (!next)
                break;
            path.push(next);
            current = next.toVersion;
        }
        return path;
    }
}
exports.MigrationManager = MigrationManager;
// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
const createVersionManager = (config) => {
    return new APIVersionManager(config);
};
exports.createVersionManager = createVersionManager;
const createMigrationManager = () => {
    return new MigrationManager();
};
exports.createMigrationManager = createMigrationManager;
exports.default = APIVersionManager;
// // // // // // // // // // 
