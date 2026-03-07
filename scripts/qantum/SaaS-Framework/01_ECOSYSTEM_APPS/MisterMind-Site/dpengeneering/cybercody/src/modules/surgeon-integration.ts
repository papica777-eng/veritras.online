/**
 * surgeon-integration — Qantum Module
 * @module surgeon-integration
 * @path scripts/qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/surgeon-integration.ts
 * @auto-documented BrutalDocEngine v2.1
 */

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v1.1.0 - SURGEON INTEGRATION                                      ║
// ║  "The Healer" - Auto-Generate Middleware Patches for Vulnerabilities         ║
// ║  Specialization: Autonomous API Security Architect & Logic Hunter            ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { EventEmitter } from 'events';
import type { BOLATestResult } from './bola-tester.js';
import type { DataExposure, LogicAnalysisResult } from '../../../../../../../../CyberCody/src/modules/logic-analyzer';

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 SURGEON TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Supported frameworks for patch generation
 */
export type Framework = 
  | 'express'      // Express.js
  | 'fastify'      // Fastify
  | 'koa'          // Koa.js
  | 'nest'         // NestJS
  | 'nextjs'       // Next.js API routes
  | 'django'       // Django REST
  | 'flask'        // Flask
  | 'fastapi'      // FastAPI
  | 'spring'       // Spring Boot
  | 'aspnet';      // ASP.NET Core

/**
 * Language for code generation
 */
export type Language = 'typescript' | 'javascript' | 'python' | 'java' | 'csharp';

/**
 * Configuration for Surgeon
 */
export interface SurgeonConfig {
  /** Target framework */
  framework: Framework;
  /** Target language */
  language?: Language;
  /** Generate inline fixes or separate middleware */
  patchStyle?: 'middleware' | 'inline' | 'decorator';
  /** Include comments explaining the fix */
  includeComments?: boolean;
  /** Output directory for generated patches */
  outputDir?: string;
}

/**
 * Generated patch/fix
 */
export interface GeneratedPatch {
  /** Unique ID */
  id: string;
  /** Vulnerability type this fixes */
  vulnerabilityType: string;
  /** Affected endpoint */
  endpoint: string;
  /** Framework */
  framework: Framework;
  /** Language */
  language: Language;
  /** Patch style */
  style: 'middleware' | 'inline' | 'decorator';
  /** Generated code */
  code: string;
  /** Filename suggestion */
  suggestedFilename: string;
  /** Dependencies required */
  dependencies: string[];
  /** Installation instructions */
  installInstructions: string;
  /** Integration instructions */
  integrationSteps: string[];
  /** Test code */
  testCode?: string;
}

/**
 * Patch generation report
 */
export interface SurgeonReport {
  generatedAt: Date;
  framework: Framework;
  totalPatches: number;
  patches: GeneratedPatch[];
  summary: {
    bolaFixes: number;
    dataExposureFixes: number;
    logicFlawFixes: number;
    middlewareCount: number;
    decoratorCount: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 PATCH GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate BOLA protection middleware
 */
function generateBOLAMiddleware(
  result: BOLATestResult,
  framework: Framework,
  _language: Language
): string {
  const endpoint = result.target.endpoint;
  const param = result.target.parameter;

  switch (framework) {
    case 'express':
      return `
// ═══════════════════════════════════════════════════════════════════════════
// BOLA Protection Middleware - CyberCody Auto-Generated
// Endpoint: ${endpoint}
// Parameter: ${param}
// ═══════════════════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';

/**
 * Validates that the authenticated user has access to the requested resource.
 * Prevents Broken Object Level Authorization (BOLA/IDOR) attacks.
 */
export const validateResourceOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const requestedId = req.params.${param} || req.query.${param};
    const userId = req.user?.id; // Assumes user is attached by auth middleware

    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!requestedId) {
      res.status(400).json({ error: 'Resource ID required' });
      return;
    }

    // TODO: Replace with your actual ownership check
    const resource = await getResourceById(requestedId as string);
    
    if (!resource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    // Check if user owns this resource
    if (resource.ownerId !== userId) {
      // Log the attempted unauthorized access
      console.warn(\`[BOLA_BLOCKED] User \${userId} attempted to access resource \${requestedId}\`);
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Attach resource to request for downstream use
    req.resource = resource;
    // Complexity: O(1)
    next();
  } catch (error) {
    console.error('[BOLA_CHECK_ERROR]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function - implement based on your data layer
async function getResourceById(id: string): Promise<{ ownerId: string } | null> {
  // TODO: Implement actual database lookup
  // Example: return await db.resources.findUnique({ where: { id } });
  throw new Error('Implement getResourceById');
}

// Express type extension
declare global {
  namespace Express {
    interface Request {
      resource?: { ownerId: string };
    }
  }
}
`;

    case 'fastify':
      return `
// ═══════════════════════════════════════════════════════════════════════════
// BOLA Protection Hook - CyberCody Auto-Generated
// Endpoint: ${endpoint}
// Parameter: ${param}
// ═══════════════════════════════════════════════════════════════════════════

import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify';

interface BOLAProtectionOptions {
  paramName?: string;
  getResource: (id: string) => Promise<{ ownerId: string } | null>;
}

export const bolaProtection: FastifyPluginAsync<BOLAProtectionOptions> = async (
  fastify,
  options
) => {
  const paramName = options.paramName || '${param}';

  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const requestedId = (request.params as Record<string, string>)[paramName] 
      || (request.query as Record<string, string>)[paramName];
    const userId = (request.user as { id: string })?.id;

    if (!userId) {
      return reply.status(401).send({ error: 'Authentication required' });
    }

    if (!requestedId) {
      return reply.status(400).send({ error: 'Resource ID required' });
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    const resource = await options.getResource(requestedId);

    if (!resource) {
      return reply.status(404).send({ error: 'Resource not found' });
    }

    if (resource.ownerId !== userId) {
      request.log.warn({ userId, requestedId }, 'BOLA attack blocked');
      return reply.status(403).send({ error: 'Access denied' });
    }

    request.resource = resource;
  });
};
`;

    case 'nest':
      return `
// ═══════════════════════════════════════════════════════════════════════════
// BOLA Protection Guard - CyberCody Auto-Generated
// Endpoint: ${endpoint}
// Parameter: ${param}
// ═══════════════════════════════════════════════════════════════════════════

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const RESOURCE_KEY = 'resourceKey';
export const ResourceParam = (paramName: string) =>
  // Complexity: O(1) — hash/map lookup
  SetMetadata(RESOURCE_KEY, paramName);

@Injectable()
export class BOLAGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private resourceService: ResourceService, // Inject your resource service
  ) {}

  // Complexity: O(1) — hash/map lookup
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const paramName = this.reflector.get<string>(RESOURCE_KEY, context.getHandler()) || '${param}';
    const request = context.switchToHttp().getRequest();
    
    const requestedId = request.params[paramName] || request.query[paramName];
    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    if (!requestedId) {
      return true; // No resource ID to check
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    const resource = await this.resourceService.findById(requestedId);

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (resource.ownerId !== userId) {
      // Log the attempt
      console.warn(\`[BOLA_BLOCKED] User \${userId} attempted to access \${requestedId}\`);
      throw new ForbiddenException('Access denied');
    }

    request.resource = resource;
    return true;
  }
}

// Usage:
// @UseGuards(BOLAGuard)
// @ResourceParam('${param}')
// @Get(':${param}')
// getResource(@Param('${param}') id: string) { ... }
`;

    case 'fastapi':
      return `
# ═══════════════════════════════════════════════════════════════════════════
# BOLA Protection Dependency - CyberCody Auto-Generated
# Endpoint: ${endpoint}
# Parameter: ${param}
# ═══════════════════════════════════════════════════════════════════════════

from fastapi import Depends, HTTPException, status, Request
from typing import Optional, Callable
import logging

logger = logging.getLogger("bola_protection")


def validate_resource_ownership(
    resource_getter: Callable[[str], Optional[dict]],
    param_name: str = "${param}"
):
    """
    Dependency factory for BOLA protection.
    
    Usage:
        @app.get("/users/{user_id}")
        async def get_user(
            user_id: str,
            resource: dict = Depends(validate_resource_ownership(get_user_by_id))
        ):
            return resource
    """
    async def dependency(
        request: Request,
        ${param}: str
    ) -> dict:
        # Get authenticated user
        user = getattr(request.state, 'user', None)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )
        
        # Get requested resource
        // SAFETY: async operation — wrap in try-catch for production resilience
        resource = await resource_getter(${param})
        if not resource:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resource not found"
            )
        
        # Check ownership
        if resource.get('owner_id') != user.get('id'):
            logger.warning(
                f"BOLA_BLOCKED: User {user.get('id')} attempted to access {${param}}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return resource
    
    return dependency
`;

    case 'django':
      return `
# ═══════════════════════════════════════════════════════════════════════════
# BOLA Protection Mixin - CyberCody Auto-Generated
# Endpoint: ${endpoint}
# Parameter: ${param}
# ═══════════════════════════════════════════════════════════════════════════

from rest_framework import permissions, exceptions
from rest_framework.views import APIView
import logging

logger = logging.getLogger("bola_protection")


class ResourceOwnershipPermission(permissions.BasePermission):
    """
    Permission class that checks if the authenticated user owns the resource.
    """
    owner_field = 'owner_id'
    lookup_field = '${param}'
    
    def has_object_permission(self, request, view, obj):
        user_id = request.user.id if request.user.is_authenticated else None
        
        if not user_id:
            return False
        
        owner_id = getattr(obj, self.owner_field, None)
        
        if owner_id != user_id:
            logger.warning(
                f"BOLA_BLOCKED: User {user_id} attempted to access "
                f"{self.lookup_field}={getattr(obj, 'id', 'unknown')}"
            )
            return False
        
        return True


class BOLAProtectedMixin:
    """
    Mixin for ViewSets that enforces BOLA protection.
    
    Usage:
        class UserViewSet(BOLAProtectedMixin, viewsets.ModelViewSet):
            queryset = User.objects.all()
            serializer_class = UserSerializer
    """
    permission_classes = [permissions.IsAuthenticated, ResourceOwnershipPermission]
    
    def get_queryset(self):
        """Filter queryset to only include user's own resources."""
        queryset = super().get_queryset()
        if self.request.user.is_authenticated:
            return queryset.filter(owner_id=self.request.user.id)
        return queryset.none()
`;

    default:
      return `// BOLA protection for ${framework} - implement manually`;
  }
}

/**
 * Generate data exposure filtering middleware
 */
function generateDataExposureFilter(
  exposure: DataExposure,
  framework: Framework,
  _language: Language
): string {
  const fieldsToFilter = [exposure.field];
  
  switch (framework) {
    case 'express':
      return `
// ═══════════════════════════════════════════════════════════════════════════
// Response Sanitizer - CyberCody Auto-Generated
// Exposure Type: ${exposure.category}
// Field: ${exposure.field}
// ═══════════════════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';

/**
 * List of fields to mask or remove from responses.
 * Compliance: ${exposure.compliance.join(', ') || 'General Security'}
 */
const SENSITIVE_FIELDS = ${JSON.stringify(fieldsToFilter)};

const MASK_PATTERNS: Record<string, (value: string) => string> = {
  email: (v) => v.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
  phone: (v) => v.replace(/(.{3})(.*)(.{2})/, '$1****$3'),
  ssn: () => '***-**-****',
  credit_card: (v) => v.replace(/(.{4})(.*)(.{4})/, '$1 **** **** $3'),
  default: () => '[REDACTED]',
};

/**
 * Recursively sanitizes sensitive data in response objects.
 */
function sanitizeObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
        const maskFn = MASK_PATTERNS[key.toLowerCase()] || MASK_PATTERNS.default;
        sanitized[key] = typeof value === 'string' ? maskFn(value) : '[REDACTED]';
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    }
    
    return sanitized;
  }
  
  return obj;
}

/**
 * Response sanitizer middleware.
 * Intercepts res.json() to filter sensitive data.
 */
export const responseSanitizer = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const originalJson = res.json.bind(res);
  
  res.json = (body: unknown): Response => {
    const sanitizedBody = sanitizeObject(body);
    return originalJson(sanitizedBody);
  };
  
  // Complexity: O(1)
  next();
};

// Alternative: Use with express-transform-body-response
export const sanitizerTransform = (body: unknown): unknown => {
  return sanitizeObject(body);
};
`;

    case 'fastapi':
      return `
# ═══════════════════════════════════════════════════════════════════════════
# Response Sanitizer - CyberCody Auto-Generated
# Exposure Type: ${exposure.category}
# Field: ${exposure.field}
# ═══════════════════════════════════════════════════════════════════════════

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import json
import re
from typing import Any, Dict, List

# Fields to mask
SENSITIVE_FIELDS = ${JSON.stringify(fieldsToFilter)}

# Masking functions
def mask_email(v: str) -> str:
    return re.sub(r'(.{2})(.*)(@.*)', r'\\1***\\3', v)

def mask_phone(v: str) -> str:
    return re.sub(r'(.{3})(.*)(.{2})', r'\\1****\\3', v)

def mask_ssn(v: str) -> str:
    return '***-**-****'

def mask_credit_card(v: str) -> str:
    return re.sub(r'(.{4})(.*)(.{4})', r'\\1 **** **** \\3', v)

MASK_PATTERNS = {
    'email': mask_email,
    'phone': mask_phone,
    'ssn': mask_ssn,
    'credit_card': mask_credit_card,
}


def sanitize_object(obj: Any) -> Any:
    """Recursively sanitize sensitive data."""
    if obj is None:
        return obj
    
    if isinstance(obj, list):
        return [sanitize_object(item) for item in obj]
    
    if isinstance(obj, dict):
        sanitized = {}
        for key, value in obj.items():
            if key.lower() in SENSITIVE_FIELDS:
                mask_fn = MASK_PATTERNS.get(key.lower(), lambda _: '[REDACTED]')
                sanitized[key] = mask_fn(str(value)) if isinstance(value, str) else '[REDACTED]'
            else:
                sanitized[key] = sanitize_object(value)
        return sanitized
    
    return obj


class ResponseSanitizerMiddleware(BaseHTTPMiddleware):
    """
    Middleware that sanitizes sensitive data from JSON responses.
    Compliance: ${exposure.compliance.join(', ') || 'General Security'}
    """
    
    async def dispatch(self, request: Request, call_next):
        // SAFETY: async operation — wrap in try-catch for production resilience
        response = await call_next(request)
        
        # Only process JSON responses
        content_type = response.headers.get('content-type', '')
        if 'application/json' not in content_type:
            return response
        
        # Read and sanitize body
        body = b''
        async for chunk in response.body_iterator:
            body += chunk
        
        try:
            data = json.loads(body)
            sanitized = sanitize_object(data)
            return JSONResponse(
                content=sanitized,
                status_code=response.status_code,
                headers=dict(response.headers)
            )
        except json.JSONDecodeError:
            return response


# Usage: app.add_middleware(ResponseSanitizerMiddleware)
`;

    default:
      return `// Data exposure filter for ${framework} - implement manually`;
  }
}

/**
 * Generate rate limiter middleware
 */
function generateRateLimiter(framework: Framework): string {
  switch (framework) {
    case 'express':
      return `
// ═══════════════════════════════════════════════════════════════════════════
// Rate Limiter - CyberCody Auto-Generated
// Prevents enumeration and brute force attacks
// ═══════════════════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';

// Per-IP rate limiter
const ipLimiter = new RateLimiterMemory({
  points: 100,       // Number of requests
  duration: 60,      // Per 60 seconds
  blockDuration: 60, // Block for 60 seconds if exceeded
});

// Per-user rate limiter (stricter for authenticated actions)
const userLimiter = new RateLimiterMemory({
  points: 30,
  duration: 60,
  blockDuration: 120,
});

// Aggressive limiter for auth endpoints
const authLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
  blockDuration: 300, // 5 minutes block
});

export const rateLimiter = (type: 'ip' | 'user' | 'auth' = 'ip') => {
  const limiter = type === 'auth' ? authLimiter : type === 'user' ? userLimiter : ipLimiter;
  
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = type === 'user' && req.user 
      ? req.user.id 
      : req.ip || req.socket.remoteAddress || 'unknown';
    
    try {
      await limiter.consume(key);
      // Complexity: O(1)
      next();
    } catch (error) {
      const rateLimitRes = error as RateLimiterRes;
      res.set({
        'Retry-After': String(Math.ceil(rateLimitRes.msBeforeNext / 1000)),
        'X-RateLimit-Limit': String(limiter.points),
        'X-RateLimit-Remaining': String(rateLimitRes.remainingPoints),
        'X-RateLimit-Reset': String(Date.now() + rateLimitRes.msBeforeNext),
      });
      
      console.warn(\`[RATE_LIMIT] Key: \${key}, Type: \${type}\`);
      res.status(429).json({ error: 'Too many requests' });
    }
  };
};

// Usage:
// app.use('/api/', rateLimiter('ip'));
// app.post('/auth/login', rateLimiter('auth'), loginHandler);
// app.get('/user/profile', auth, rateLimiter('user'), profileHandler);
`;

    default:
      return `// Rate limiter for ${framework} - implement manually`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔬 SURGEON CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Surgeon Integration - The Healer
 * 
 * Auto-generates middleware patches and code fixes for 
 * discovered vulnerabilities.
 */
export class SurgeonIntegration extends EventEmitter {
  private config: Required<SurgeonConfig>;
  private patches: GeneratedPatch[] = [];

  constructor(config: SurgeonConfig) {
    super();
    
    this.config = {
      framework: config.framework,
      language: config.language ?? this.inferLanguage(config.framework),
      patchStyle: config.patchStyle ?? 'middleware',
      includeComments: config.includeComments ?? true,
      outputDir: config.outputDir ?? './patches',
    };
  }

  /**
   * Infer language from framework
   */
  // Complexity: O(1)
  private inferLanguage(framework: Framework): Language {
    switch (framework) {
      case 'express':
      case 'fastify':
      case 'koa':
      case 'nest':
      case 'nextjs':
        return 'typescript';
      case 'django':
      case 'flask':
      case 'fastapi':
        return 'python';
      case 'spring':
        return 'java';
      case 'aspnet':
        return 'csharp';
    }
  }

  /**
   * Generate patches for BOLA vulnerabilities
   */
  // Complexity: O(N*M) — nested iteration detected
  generateBOLAPatches(results: BOLATestResult[]): GeneratedPatch[] {
    const confirmedVulns = results.filter(r => 
      r.vulnerability.detected && r.vulnerability.confidence !== 'low'
    );

    console.log(`\n🔧 [SURGEON] Generating BOLA patches for ${confirmedVulns.length} vulnerabilities...`);

    for (const result of confirmedVulns) {
      const code = generateBOLAMiddleware(result, this.config.framework, this.config.language);
      
      const patch: GeneratedPatch = {
        id: `bola-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        vulnerabilityType: 'BOLA',
        endpoint: result.target.endpoint,
        framework: this.config.framework,
        language: this.config.language,
        style: this.config.patchStyle,
        code,
        suggestedFilename: `bola-protection.${this.getExtension()}`,
        dependencies: this.getDependencies('bola'),
        installInstructions: this.getInstallInstructions('bola'),
        integrationSteps: this.getIntegrationSteps('bola', result.target.endpoint),
      };

      this.patches.push(patch);
      this.emit('patch', patch);
    }

    return this.patches.filter(p => p.vulnerabilityType === 'BOLA');
  }

  /**
   * Generate patches for data exposure
   */
  // Complexity: O(N) — linear iteration
  generateDataExposurePatches(results: LogicAnalysisResult[]): GeneratedPatch[] {
    const allExposures = results.flatMap(r => r.exposures);
    
    // Group by field to avoid duplicate patches
    const uniqueFields = [...new Set(allExposures.map(e => e.field))];
    
    console.log(`\n🔧 [SURGEON] Generating data exposure patches for ${uniqueFields.length} field types...`);

    // Generate one comprehensive sanitizer
    if (allExposures.length > 0) {
      const code = generateDataExposureFilter(allExposures[0]!, this.config.framework, this.config.language);
      
      const patch: GeneratedPatch = {
        id: `data-exposure-${Date.now()}`,
        vulnerabilityType: 'DATA_EXPOSURE',
        endpoint: '*',
        framework: this.config.framework,
        language: this.config.language,
        style: 'middleware',
        code,
        suggestedFilename: `response-sanitizer.${this.getExtension()}`,
        dependencies: this.getDependencies('sanitizer'),
        installInstructions: this.getInstallInstructions('sanitizer'),
        integrationSteps: this.getIntegrationSteps('sanitizer'),
      };

      this.patches.push(patch);
      this.emit('patch', patch);
    }

    return this.patches.filter(p => p.vulnerabilityType === 'DATA_EXPOSURE');
  }

  /**
   * Generate rate limiter patch
   */
  // Complexity: O(1) — hash/map lookup
  generateRateLimiterPatch(): GeneratedPatch {
    console.log(`\n🔧 [SURGEON] Generating rate limiter...`);

    const code = generateRateLimiter(this.config.framework);
    
    const patch: GeneratedPatch = {
      id: `rate-limiter-${Date.now()}`,
      vulnerabilityType: 'RATE_LIMITING',
      endpoint: '*',
      framework: this.config.framework,
      language: this.config.language,
      style: 'middleware',
      code,
      suggestedFilename: `rate-limiter.${this.getExtension()}`,
      dependencies: this.getDependencies('ratelimit'),
      installInstructions: this.getInstallInstructions('ratelimit'),
      integrationSteps: this.getIntegrationSteps('ratelimit'),
    };

    this.patches.push(patch);
    this.emit('patch', patch);

    return patch;
  }

  /**
   * Get file extension for language
   */
  // Complexity: O(1)
  private getExtension(): string {
    const extensions: Record<Language, string> = {
      typescript: 'ts',
      javascript: 'js',
      python: 'py',
      java: 'java',
      csharp: 'cs',
    };
    return extensions[this.config.language];
  }

  /**
   * Get dependencies for patch type
   */
  // Complexity: O(1) — hash/map lookup
  private getDependencies(type: string): string[] {
    const deps: Record<string, Record<Framework, string[]>> = {
      bola: {
        express: [],
        fastify: [],
        nest: ['@nestjs/common'],
        koa: [],
        nextjs: [],
        django: ['djangorestframework'],
        flask: [],
        fastapi: ['fastapi'],
        spring: [],
        aspnet: [],
      },
      sanitizer: {
        express: [],
        fastify: [],
        nest: [],
        koa: [],
        nextjs: [],
        django: [],
        flask: [],
        fastapi: ['starlette'],
        spring: [],
        aspnet: [],
      },
      ratelimit: {
        express: ['rate-limiter-flexible'],
        fastify: ['@fastify/rate-limit'],
        nest: ['@nestjs/throttler'],
        koa: ['koa-ratelimit'],
        nextjs: [],
        django: ['django-ratelimit'],
        flask: ['flask-limiter'],
        fastapi: ['slowapi'],
        spring: ['bucket4j'],
        aspnet: ['AspNetCoreRateLimit'],
      },
    };
    return deps[type]?.[this.config.framework] ?? [];
  }

  /**
   * Get install instructions
   */
  // Complexity: O(1)
  private getInstallInstructions(type: string): string {
    const deps = this.getDependencies(type);
    if (deps.length === 0) return 'No additional dependencies required';

    if (['typescript', 'javascript'].includes(this.config.language)) {
      return `npm install ${deps.join(' ')}`;
    }
    if (this.config.language === 'python') {
      return `pip install ${deps.join(' ')}`;
    }
    return `Install: ${deps.join(', ')}`;
  }

  /**
   * Get integration steps
   */
  // Complexity: O(N)
  private getIntegrationSteps(type: string, endpoint?: string): string[] {
    const steps: string[] = [];

    switch (type) {
      case 'bola':
        steps.push(`1. Copy the generated file to your middleware directory`);
        steps.push(`2. Implement the getResourceById function for your data layer`);
        if (this.config.framework === 'express') {
          steps.push(`3. Add middleware to route: app.get('${endpoint}', validateResourceOwnership, handler)`);
        } else if (this.config.framework === 'nest') {
          steps.push(`3. Add @UseGuards(BOLAGuard) decorator to your controller method`);
        }
        steps.push(`4. Test with different user credentials`);
        break;

      case 'sanitizer':
        if (this.config.framework === 'express') {
          steps.push(`1. Import the middleware: import { responseSanitizer } from './response-sanitizer'`);
          steps.push(`2. Add to app: app.use(responseSanitizer)`);
        } else if (this.config.framework === 'fastapi') {
          steps.push(`1. Import the middleware`);
          steps.push(`2. Add to app: app.add_middleware(ResponseSanitizerMiddleware)`);
        }
        steps.push(`3. Update SENSITIVE_FIELDS array with your specific fields`);
        break;

      case 'ratelimit':
        steps.push(`1. Install dependencies: ${this.getInstallInstructions(type)}`);
        steps.push(`2. Import the rate limiter middleware`);
        steps.push(`3. Apply to routes: high-risk endpoints first`);
        steps.push(`4. Configure limits based on your traffic patterns`);
        break;
    }

    return steps;
  }

  /**
   * Generate report
   */
  // Complexity: O(N) — linear iteration
  generateReport(): SurgeonReport {
    return {
      generatedAt: new Date(),
      framework: this.config.framework,
      totalPatches: this.patches.length,
      patches: this.patches,
      summary: {
        bolaFixes: this.patches.filter(p => p.vulnerabilityType === 'BOLA').length,
        dataExposureFixes: this.patches.filter(p => p.vulnerabilityType === 'DATA_EXPOSURE').length,
        logicFlawFixes: this.patches.filter(p => p.vulnerabilityType === 'LOGIC_FLAW').length,
        middlewareCount: this.patches.filter(p => p.style === 'middleware').length,
        decoratorCount: this.patches.filter(p => p.style === 'decorator').length,
      },
    };
  }

  /**
   * Export all patches
   */
  // Complexity: O(N) — linear iteration
  exportPatches(): Map<string, string> {
    const files = new Map<string, string>();
    for (const patch of this.patches) {
      files.set(patch.suggestedFilename, patch.code);
    }
    return files;
  }

  /**
   * Get all patches
   */
  // Complexity: O(1)
  getPatches(): GeneratedPatch[] {
    return this.patches;
  }
}

export default SurgeonIntegration;
