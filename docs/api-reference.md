# QAntum API Reference

> version: 1.0.0-AETERNA
> Auto-generated: 2026-02-27T02:42:44.436Z

---

## index

**File:** `src\api\index.ts`

### Exports

- `APIClientConfig`
- `APIClient`
- `createAPIClient`
- `RateLimiter`
- `TokenBucket`
- `SlidingWindowCounter`
- `RateLimitPresets`
- `RateLimitError`
- `RateLimit`
- `ThrottleMethod`
- `createRateLimiter`
- `createTokenBucket`
- `type RateLimitConfig`
- `type RateLimitResult`
- `type RateLimitInfo`
- `type RateLimiterConfig`
- `type RateLimitStrategy`
- ``
- `APIVersionManager`
- `VersionParser`
- `MigrationManager`
- `Version`
- `Deprecated`
- `Since`
- `createVersionManager`
- `createMigrationManager`
- `type SemanticVersion`
- `type VersionedRoute`
- `type VersionConfig`
- `type VersionNegotiationResult`
- `type Migration`
- `type DeprecationInfo`

### Interfaces

```typescript
export interface APIClientConfig {
  baseUrl: string;
  version?: string;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  }
```

### Methods

- `constructor(config: APIClientConfig)`
- `RateLimiter({
          strategy: 'sliding-window',
          windowMs: config.rateLimit.windowMs,
          maxRequests: config.rateLimit.maxRequests,
        })
      : RateLimitPresets.api();

    this.versionManager = new APIVersionManager(`
- `setVersion(version: string): this`
- `getVersion(): string`
- `getRateLimitInfo(path: string = 'default'): any`
- `private buildUrl(path: string, query?: Record<string, string>): string`
- `private async makeRequest(method: string, url: string, options: any): Promise<any>`
- `createAPIClient(config: APIClientConfig): APIClient`

---

## rate-limiter

**File:** `src\api\rate-limiter.ts`

### Exports

- `RateLimitConfig`
- `RateLimitResult`
- `RateLimitInfo`
- `TokenBucket`
- `SlidingWindowCounter`
- `RateLimitStrategy`
- `RateLimiterConfig`
- `RateLimiter`
- `RateLimit`
- `ThrottleMethod`
- `RateLimitError`
- `RateLimitPresets`
- `createRateLimiter`
- `createTokenBucket`

### Interfaces

```typescript
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix?: string; // Prefix for storage keys
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
}
```

```typescript
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number; // Seconds until retry
}
```

```typescript
export interface RateLimitInfo {
  key: string;
  requests: number;
  windowStart: number;
  windowEnd: number;
  remaining: number;
}
```

```typescript
export interface RateLimiterConfig {
  strategy: RateLimitStrategy;
  windowMs: number;
  maxRequests: number;
  burstCapacity?: number; // For token bucket
}
```

### Methods

- `constructor(
    private capacity: number,
    private refillRate: number, // tokens per second
    private refillAmount: number = 1
  )`
- `consume(amount: number = 1): RateLimitResult`
- `private refill(): void`
- `getState():`
- `reset(): void`
- `constructor(
    private windowMs: number,
    private maxRequests: number
  )`
- `private cleanup(currentWindow: number): void`
- `constructor(config: RateLimiterConfig)`
- `check(key: string): RateLimitResult`
- `peek(key: string): RateLimitResult`

---

## versioning

**File:** `src\api\versioning.ts`

### Exports

- `SemanticVersion`
- `VersionedRoute`
- `RouteHandler`
- `DeprecationInfo`
- `VersionConfig`
- `VersionNegotiationResult`
- `VersionParser`
- `APIVersionManager`
- `Version`
- `Deprecated`
- `Since`
- `Migration`
- `MigrationManager`
- `createVersionManager`
- `createMigrationManager`

### Interfaces

```typescript
export interface SemanticVersion {
    major: number;
    minor: number;
    patch: number;
    prerelease?: string;
}
```

```typescript
export interface VersionedRoute {
    path: string;
    versions: Map<string, RouteHandler>;
    deprecated: Map<string, DeprecationInfo>;
}
```

```typescript
export interface DeprecationInfo {
    since: string;
    sunset: string;
    replacement?: string;
    message?: string;
}
```

```typescript
export interface VersionConfig {
    header?: string;          // e.g., 'X-API-Version'
    queryParam?: string;      // e.g., 'api-version'
    urlPrefix?: boolean;      // e.g., /v1/users
    defaultVersion: string;
    supportedVersions: string[];
}
```

```typescript
export interface VersionNegotiationResult {
    version: string;
    source: 'header' | 'query' | 'url' | 'default';
    isDeprecated: boolean;
    deprecationInfo?: DeprecationInfo;
}
```

### Methods

- `parse(version: string): SemanticVersion | null`
- `parseInt(match[2], 10) : 0,
            patch: match[3] ? parseInt(match[3], 10) : 0,
            prerelease: match[4]
        };
    }

    /**
     * Convert SemanticVersion to string
     */
    static stringify(version: SemanticVersion): string`
- `compare(a: string | SemanticVersion, b: string | SemanticVersion): number`
- `parse(a) : a;
        const vB = typeof b === 'string' ? this.parse(b) : b;

        if (!vA || !vB) return 0;

        if (vA.major !== vB.major) return vA.major > vB.major ? 1 : -1;
        if (vA.minor !== vB.minor) return vA.minor > vB.minor ? 1 : -1;
        if (vA.patch !== vB.patch) return vA.patch > vB.patch ? 1 : -1;

        // Pre-release versions have lower precedence
        if (vA.prerelease && !vB.prerelease) return -1;
        if (!vA.prerelease && vB.prerelease) return 1;
        if (vA.prerelease && vB.prerelease)`
- `satisfies(version: string, range: string): boolean`
- `major(version: string): number`
- `isBreaking(oldVersion: string, newVersion: string): boolean`
- `constructor(config: Partial<VersionConfig> = {})`
- `register(
        path: string,
        version: string,
        handler: RouteHandler
    ): this`
- `deprecate(
        version: string,
        sunset: string,
        replacement?: string,
        message?: string
    ): this`

---

