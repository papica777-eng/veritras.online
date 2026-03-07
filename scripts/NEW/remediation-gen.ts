/**
 * remediation-gen — Qantum Module
 * @module remediation-gen
 * @path scripts/NEW/remediation-gen.ts
 * @auto-documented BrutalDocEngine v2.1
 */

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  CYBERCODY v1.2.0 - REMEDIATION GENERATOR                                    ║
// ║  "The Surgeon's Apprentice" - Auto-Generate Security Patches                 ║
// ║  Specialization: Vulnerability-to-Fix Pipeline & Code Generation            ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { EventEmitter } from 'events';
import { createHash } from 'crypto';
import type { BOLATestResult, BOLATestReport } from '../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/bola-tester';
import type { CrossSessionVulnerability, SessionOrchestratorReport } from '../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/session-orchestrator';
import type { PIIScannerReport } from '../qantum/SaaS-Framework/01_ECOSYSTEM_APPS/MisterMind-Site/dpengeneering/cybercody/src/modules/pii-scanner';

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 REMEDIATION GENERATOR TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Supported frameworks for code generation
 */
export type Framework = 'express' | 'fastify' | 'nest' | 'koa' | 'hapi' | 'fastapi' | 'django' | 'flask' | 'spring';

/**
 * Programming language
 */
export type Language = 'javascript' | 'typescript' | 'python' | 'java';

/**
 * Vulnerability category for remediation
 */
export type VulnCategory = 'bola' | 'pii-exposure' | 'privilege-escalation' | 'rate-limit' | 'auth-bypass' | 'injection';

/**
 * Generated patch
 */
export interface GeneratedPatch {
  id: string;
  name: string;
  description: string;
  category: VulnCategory;
  framework: Framework;
  language: Language;
  code: string;
  filename: string;
  dependencies: string[];
  installCommands: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  vulnerability: {
    type: string;
    endpoint?: string;
    description: string;
  };
  instructions: string[];
}

/**
 * Remediation report
 */
export interface RemediationReport {
  target: string;
  generatedAt: Date;
  framework: Framework;
  language: Language;
  patches: GeneratedPatch[];
  summary: {
    totalPatches: number;
    bolaPatches: number;
    piiPatches: number;
    privEscPatches: number;
    rateLimitPatches: number;
  };
  implementationOrder: string[];
  estimatedEffort: string;
}

/**
 * Remediation generator configuration
 */
export interface RemediationGenConfig {
  framework?: Framework;
  language?: Language;
  includeTests?: boolean;
  includeComments?: boolean;
  outputDir?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 REMEDIATION GENERATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Remediation Generator - The Surgeon's Apprentice
 * 
 * Automatically generates security patches for detected vulnerabilities.
 * Integrates with BOLA Tester, Session Orchestrator, and PII Scanner.
 */
export class RemediationGenerator extends EventEmitter {
  private config: Required<RemediationGenConfig>;
  private patches: GeneratedPatch[] = [];

  constructor(config: RemediationGenConfig = {}) {
    super();

    this.config = {
      framework: config.framework ?? 'express',
      language: config.language ?? 'typescript',
      includeTests: config.includeTests ?? true,
      includeComments: config.includeComments ?? true,
      outputDir: config.outputDir ?? './patches',
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔐 BOLA REMEDIATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generate patches from BOLA test report
   */
  // Complexity: O(N) — linear iteration
  generateFromBOLAReport(report: BOLATestReport): GeneratedPatch[] {
    console.log('\n🔧 [REMEDIATION] Generating BOLA protection patches...');
    
    const patches: GeneratedPatch[] = [];

    for (const result of report.results) {
      if (result.vulnerability.detected && result.vulnerability.confidence === 'confirmed') {
        const patch = this.generateBOLAPatch(result);
        patches.push(patch);
        this.patches.push(patch);
        this.emit('patchGenerated', patch);
      }
    }

    console.log(`   ✅ Generated ${patches.length} BOLA protection patches`);
    return patches;
  }

  /**
   * Generate single BOLA protection patch
   */
  // Complexity: O(1) — amortized
  private generateBOLAPatch(result: BOLATestResult): GeneratedPatch {
    const endpoint = result.target.endpoint;
    const param = result.target.parameter;
    const id = this.generateId('bola', endpoint);

    const code = this.generateBOLAMiddleware(endpoint, param);
    
    return {
      id,
      name: `BOLA Protection - ${endpoint}`,
      description: `Prevents unauthorized access to ${endpoint} by validating resource ownership`,
      category: 'bola',
      framework: this.config.framework,
      language: this.config.language,
      code,
      filename: `bola-protection-${this.sanitizeFilename(endpoint)}.${this.getFileExtension()}`,
      dependencies: this.getBOLADependencies(),
      installCommands: this.getBOLAInstallCommands(),
      priority: 'critical',
      vulnerability: {
        type: 'Broken Object Level Authorization',
        endpoint,
        description: `User can access resources belonging to other users via ${param} parameter`,
      },
      instructions: this.getBOLAInstructions(endpoint),
    };
  }

  /**
   * Generate BOLA middleware code
   */
  // Complexity: O(1)
  private generateBOLAMiddleware(endpoint: string, param: string): string {
    switch (this.config.framework) {
      case 'express':
        return this.generateExpressBOLAMiddleware(endpoint, param);
      case 'fastify':
        return this.generateFastifyBOLAMiddleware(endpoint, param);
      case 'nest':
        return this.generateNestBOLAMiddleware(endpoint, param);
      case 'fastapi':
        return this.generateFastAPIBOLAMiddleware(endpoint, param);
      case 'django':
        return this.generateDjangoBOLAMiddleware(endpoint, param);
      default:
        return this.generateExpressBOLAMiddleware(endpoint, param);
    }
  }

  // Complexity: O(N)
  private generateExpressBOLAMiddleware(endpoint: string, param: string): string {
    return `// ═══════════════════════════════════════════════════════════════════════════
// BOLA Protection Middleware - Auto-Generated by CyberCody v1.2.0
// Endpoint: ${endpoint}
// Parameter: ${param}
// ═══════════════════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';

/**
 * Resource ownership types - extend based on your data model
 */
interface ResourceOwnership {
  resourceId: string;
  ownerId: string;
  resourceType: string;
}

/**
 * BOLA Protection Middleware
 * 
 * Validates that the authenticated user owns the requested resource
 * before allowing access to ${endpoint}
 */
export const bolaProtection = (resourceType: string = 'resource') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Extract authenticated user ID from request
      const userId = req.user?.id || req.headers['x-user-id'];
      
      if (!userId) {
        console.warn('[BOLA] No user ID found in request');
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'BOLA_NO_AUTH'
        });
      }

      // 2. Extract resource ID from request
      const resourceId = req.params.${param} || req.params.id || req.query.${param};
      
      if (!resourceId) {
        console.warn('[BOLA] No resource ID found in request');
        return res.status(400).json({ 
          error: 'Resource ID required',
          code: 'BOLA_NO_RESOURCE'
        });
      }

      // 3. Validate ownership (implement your database lookup here)
      // SAFETY: async operation — wrap in try-catch for production resilience
      const ownership = await validateResourceOwnership(
        // Complexity: O(N)
        String(resourceId), 
        // Complexity: O(N)
        String(userId),
        resourceType
      );
      
      if (!ownership.valid) {
        console.warn(\`[BOLA] Access denied: User \${userId} attempted to access \${resourceType} \${resourceId}\`);
        
        // Log for security monitoring
        // Complexity: O(1)
        logSecurityEvent({
          type: 'BOLA_ATTEMPT',
          userId,
          resourceId,
          resourceType,
          endpoint: req.originalUrl,
          ip: req.ip,
          timestamp: new Date()
        });
        
        return res.status(403).json({ 
          error: 'Access denied',
          code: 'BOLA_FORBIDDEN'
        });
      }

      // 4. Attach ownership info to request for downstream use
      req.resourceOwnership = ownership;
      
      // Complexity: O(1)
      next();
    } catch (error) {
      console.error('[BOLA] Error validating ownership:', error);
      return res.status(500).json({ 
        error: 'Authorization check failed',
        code: 'BOLA_ERROR'
      });
    }
  };
};

/**
 * Validate resource ownership against database
 * TODO: Implement with your actual database/ORM
 */
async function validateResourceOwnership(
  resourceId: string, 
  userId: string,
  resourceType: string
): Promise<{ valid: boolean; ownership?: ResourceOwnership }> {
  // Example implementation - replace with your actual database query
  /*
  // SAFETY: async operation — wrap in try-catch for production resilience
  const resource = await db.collection(resourceType).findOne({ _id: resourceId });
  
  if (!resource) {
    return { valid: false };
  }
  
  // Check if user owns the resource
  const isOwner = resource.ownerId === userId || 
                  resource.userId === userId ||
                  resource.createdBy === userId;
  
  // Also allow admins
  // SAFETY: async operation — wrap in try-catch for production resilience
  const isAdmin = await checkUserRole(userId, 'admin');
  
  return { 
    valid: isOwner || isAdmin,
    ownership: isOwner ? { resourceId, ownerId: userId, resourceType } : undefined
  };
  */
  
  // Placeholder - MUST be implemented
  throw new Error('validateResourceOwnership must be implemented with your database logic');
}

/**
 * Log security event for monitoring
 */
function logSecurityEvent(event: {
  type: string;
  userId: string;
  resourceId: string;
  resourceType: string;
  endpoint: string;
  ip: string;
  timestamp: Date;
}): void {
  // TODO: Send to your security monitoring system (SIEM, logging service, etc.)
  console.log('[SECURITY]', JSON.stringify(event));
}

// ═══════════════════════════════════════════════════════════════════════════
// USAGE EXAMPLE
// ═══════════════════════════════════════════════════════════════════════════
/*
import express from 'express';
import { bolaProtection } from './bola-protection';

const app = express();

// Apply BOLA protection to sensitive endpoints
app.get('/api/users/:${param}', bolaProtection('user'), (req, res) => {
  // Handler - user ownership already validated
  res.json(req.resourceOwnership);
});

app.put('/api/orders/:${param}', bolaProtection('order'), (req, res) => {
  // Handler - order ownership already validated
});

app.delete('/api/documents/:${param}', bolaProtection('document'), (req, res) => {
  // Handler - document ownership already validated
});
*/

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      resourceOwnership?: ResourceOwnership;
      user?: { id: string; role?: string };
    }
  }
}

export default bolaProtection;
`;
  }

  // Complexity: O(1) — hash/map lookup
  private generateFastifyBOLAMiddleware(endpoint: string, param: string): string {
    return `// ═══════════════════════════════════════════════════════════════════════════
// BOLA Protection Plugin - Auto-Generated by CyberCody v1.2.0
// Endpoint: ${endpoint}
// Parameter: ${param}
// ═══════════════════════════════════════════════════════════════════════════

import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

interface BOLAOptions {
  resourceType?: string;
  paramName?: string;
}

const bolaProtection: FastifyPluginAsync<BOLAOptions> = async (fastify, opts) => {
  const resourceType = opts.resourceType || 'resource';
  const paramName = opts.paramName || '${param}';

  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request.user as any)?.id;
    const resourceId = (request.params as any)[paramName];

    if (!userId) {
      return reply.code(401).send({ error: 'Authentication required', code: 'BOLA_NO_AUTH' });
    }

    if (!resourceId) {
      return reply.code(400).send({ error: 'Resource ID required', code: 'BOLA_NO_RESOURCE' });
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    const isOwner = await validateOwnership(resourceId, userId, resourceType);
    
    if (!isOwner) {
      fastify.log.warn({ userId, resourceId, resourceType }, 'BOLA attempt detected');
      return reply.code(403).send({ error: 'Access denied', code: 'BOLA_FORBIDDEN' });
    }
  });
};

async function validateOwnership(
  resourceId: string,
  userId: string,
  resourceType: string
): Promise<boolean> {
  // TODO: Implement with your database
  throw new Error('validateOwnership must be implemented');
}

export default fp(bolaProtection, { name: 'bola-protection' });
`;
  }

  // Complexity: O(1) — hash/map lookup
  private generateNestBOLAMiddleware(endpoint: string, param: string): string {
    return `// ═══════════════════════════════════════════════════════════════════════════
// BOLA Protection Guard - Auto-Generated by CyberCody v1.2.0
// Endpoint: ${endpoint}
// Parameter: ${param}
// ═══════════════════════════════════════════════════════════════════════════

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const RESOURCE_TYPE_KEY = 'resourceType';
export const ResourceType = (type: string) => SetMetadata(RESOURCE_TYPE_KEY, type);

@Injectable()
export class BOLAGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private resourceService: ResourceService, // Inject your service
  ) {}

  // Complexity: O(1) — amortized
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resourceType = this.reflector.get<string>(RESOURCE_TYPE_KEY, context.getHandler());
    const request = context.switchToHttp().getRequest();
    
    const userId = request.user?.id;
    const resourceId = request.params.${param} || request.params.id;

    if (!userId || !resourceId) {
      throw new ForbiddenException('Access denied');
    }

    // SAFETY: async operation — wrap in try-catch for production resilience
    const isOwner = await this.resourceService.validateOwnership(
      resourceId, 
      userId, 
      resourceType
    );

    if (!isOwner) {
      this.logBOLAAttempt(userId, resourceId, resourceType, request);
      throw new ForbiddenException('Access denied');
    }

    return true;
  }

  // Complexity: O(1) — hash/map lookup
  private logBOLAAttempt(userId: string, resourceId: string, resourceType: string, request: any) {
    console.warn('[BOLA]', { userId, resourceId, resourceType, ip: request.ip });
  }
}

// Usage:
// @UseGuards(BOLAGuard)
// @ResourceType('user')
// @Get(':${param}')
// async getResource(@Param('${param}') id: string) { ... }
`;
  }

  // Complexity: O(1) — amortized
  private generateFastAPIBOLAMiddleware(endpoint: string, param: string): string {
    return `# ═══════════════════════════════════════════════════════════════════════════
# BOLA Protection Dependency - Auto-Generated by CyberCody v1.2.0
# Endpoint: ${endpoint}
# Parameter: ${param}
# ═══════════════════════════════════════════════════════════════════════════

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from typing import Optional
import logging

security = HTTPBearer()
logger = logging.getLogger("bola_protection")

class BOLAProtection:
    """
    // Complexity: O(1)
    BOLA (Broken Object Level Authorization) Protection
    
    Validates that the authenticated user owns the requested resource.
    """
    
    def __init__(self, resource_type: str = "resource"):
        self.resource_type = resource_type
    
    async def __call__(
        self,
        ${param}: str,
        token: str = Depends(security),
        db = Depends(get_db)  # Your database dependency
    ):
        # 1. Get user ID from token
        // SAFETY: async operation — wrap in try-catch for production resilience
        user_id = await get_user_id_from_token(token.credentials)
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"error": "Authentication required", "code": "BOLA_NO_AUTH"}
            )
        
        # 2. Validate ownership
        // SAFETY: async operation — wrap in try-catch for production resilience
        is_owner = await self.validate_ownership(db, ${param}, user_id)
        
        if not is_owner:
            logger.warning(
                f"BOLA attempt: user={user_id} resource={${param}} type={self.resource_type}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": "Access denied", "code": "BOLA_FORBIDDEN"}
            )
        
        return {"user_id": user_id, "resource_id": ${param}}
    
    async def validate_ownership(self, db, resource_id: str, user_id: str) -> bool:
        """
        Validate resource ownership against database.
        TODO: Implement with your actual database query.
        """
        # Example:
        // SAFETY: async operation — wrap in try-catch for production resilience
        # resource = await db.resources.find_one({"_id": resource_id})
        # return resource and resource.get("owner_id") == user_id
        raise NotImplementedError("validate_ownership must be implemented")


# Usage:
# @app.get("/api/users/{${param}}")
# async def get_user(
#     ownership: dict = Depends(BOLAProtection("user"))
# ):
#     return {"resource": ownership}
`;
  }

  // Complexity: O(N*M) — nested iteration detected
  private generateDjangoBOLAMiddleware(endpoint: string, param: string): string {
    return `# ═══════════════════════════════════════════════════════════════════════════
# BOLA Protection Mixin - Auto-Generated by CyberCody v1.2.0
# Endpoint: ${endpoint}
# Parameter: ${param}
# ═══════════════════════════════════════════════════════════════════════════

from django.http import JsonResponse
from django.views import View
from functools import wraps
import logging

logger = logging.getLogger("bola_protection")


class BOLAProtectionMixin:
    """
    Mixin for Django views that validates resource ownership.
    """
    
    resource_model = None  # Set this in your view
    owner_field = "owner"  # Field name for owner relationship
    lookup_field = "${param}"
    
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse(
                {"error": "Authentication required", "code": "BOLA_NO_AUTH"},
                status=401
            )
        
        resource_id = kwargs.get(self.lookup_field)
        if not resource_id:
            return JsonResponse(
                {"error": "Resource ID required", "code": "BOLA_NO_RESOURCE"},
                status=400
            )
        
        if not self.validate_ownership(request.user, resource_id):
            logger.warning(
                f"BOLA attempt: user={request.user.id} "
                f"resource={resource_id} model={self.resource_model}"
            )
            return JsonResponse(
                {"error": "Access denied", "code": "BOLA_FORBIDDEN"},
                status=403
            )
        
        return super().dispatch(request, *args, **kwargs)
    
    def validate_ownership(self, user, resource_id):
        """
        Validate that user owns the resource.
        """
        if self.resource_model is None:
            raise NotImplementedError("resource_model must be set")
        
        try:
            resource = self.resource_model.objects.get(pk=resource_id)
            owner = getattr(resource, self.owner_field, None)
            
            # Check direct ownership or admin status
            return owner == user or user.is_staff
        except self.resource_model.DoesNotExist:
            return False


# Decorator version
def bola_protected(model, owner_field="owner", lookup_param="${param}"):
    """
    Decorator for function-based views.
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return JsonResponse({"error": "Authentication required"}, status=401)
            
            resource_id = kwargs.get(lookup_param)
            try:
                resource = model.objects.get(pk=resource_id)
                owner = getattr(resource, owner_field, None)
                
                if owner != request.user and not request.user.is_staff:
                    logger.warning(f"BOLA: user={request.user.id} resource={resource_id}")
                    return JsonResponse({"error": "Access denied"}, status=403)
            except model.DoesNotExist:
                return JsonResponse({"error": "Not found"}, status=404)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


# Usage (Class-based):
# class UserDetailView(BOLAProtectionMixin, View):
#     resource_model = User
#     owner_field = "id"  # User owns themselves
#
#     def get(self, request, ${param}):
#         return JsonResponse({"user": ${param}})

# Usage (Function-based):
# @bola_protected(Order, owner_field="customer")
# def order_detail(request, ${param}):
#     return JsonResponse({"order": ${param}})
`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔒 PII REMEDIATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generate patches from PII Scanner report
   */
  // Complexity: O(N*M) — nested iteration detected
  generateFromPIIReport(report: PIIScannerReport): GeneratedPatch[] {
    console.log('\n🔧 [REMEDIATION] Generating PII protection patches...');
    
    const patches: GeneratedPatch[] = [];

    // Generate response sanitizer
    if (report.totalDetections > 0) {
      const sanitizerPatch = this.generatePIISanitizer(report);
      patches.push(sanitizerPatch);
      this.patches.push(sanitizerPatch);
    }

    // Generate field-specific filters for critical detections
    const criticalCategories = new Set<string>();
    for (const endpoint of report.criticalEndpoints) {
      for (const detection of endpoint.detections) {
        if (detection.riskLevel === 'critical' || detection.riskLevel === 'high') {
          criticalCategories.add(detection.category);
        }
      }
    }

    if (criticalCategories.size > 0) {
      const filterPatch = this.generatePIIFilter(Array.from(criticalCategories));
      patches.push(filterPatch);
      this.patches.push(filterPatch);
    }

    console.log(`   ✅ Generated ${patches.length} PII protection patches`);
    return patches;
  }

  /**
   * Generate PII sanitizer middleware
   */
  // Complexity: O(1) — amortized
  private generatePIISanitizer(report: PIIScannerReport): GeneratedPatch {
    const id = this.generateId('pii', 'sanitizer');
    
    const code = this.generatePIISanitizerCode(report);
    
    return {
      id,
      name: 'PII Response Sanitizer',
      description: 'Automatically redacts PII from API responses before sending to client',
      category: 'pii-exposure',
      framework: this.config.framework,
      language: this.config.language,
      code,
      filename: `pii-sanitizer.${this.getFileExtension()}`,
      dependencies: [],
      installCommands: [],
      priority: 'high',
      vulnerability: {
        type: 'PII Exposure',
        description: `Detected ${report.totalDetections} PII instances across API responses`,
      },
      instructions: [
        '1. Add this middleware to your Express/Fastify app',
        '2. Place it AFTER your route handlers but BEFORE sending response',
        '3. Configure the fields to redact based on your data model',
        '4. Test thoroughly to ensure legitimate data is not affected',
      ],
    };
  }

  // Complexity: O(N)
  private generatePIISanitizerCode(report: PIIScannerReport): string {
    return `// ═══════════════════════════════════════════════════════════════════════════
// PII Response Sanitizer - Auto-Generated by CyberCody v1.2.0
// Detections: ${report.totalDetections} PII instances found
// ═══════════════════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';

/**
 * Fields to automatically redact from responses
 */
const REDACT_FIELDS = [
  'ssn', 'socialSecurityNumber', 'social_security',
  'creditCard', 'credit_card', 'cardNumber', 'card_number',
  'password', 'passwd', 'secret', 'apiKey', 'api_key',
  'token', 'accessToken', 'access_token', 'refreshToken',
  'bankAccount', 'bank_account', 'accountNumber',
  'driverLicense', 'drivers_license', 'passport',
];

/**
 * Regex patterns for PII detection
 */
const PII_PATTERNS = {
  email: /\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b/gi,
  phone: /\\b(\\+?1[-.]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b/g,
  ssn: /\\b\\d{3}[-\\s]?\\d{2}[-\\s]?\\d{4}\\b/g,
  creditCard: /\\b\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}\\b/g,
  ipAddress: /\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d{1,2})\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d{1,2})\\b/g,
};

/**
 * Redact a value based on type
 */
function redactValue(value: string, type: string): string {
  if (value.length <= 4) return '****';
  
  switch (type) {
    case 'email':
      const [local, domain] = value.split('@');
      return local?.substring(0, 2) + '***@' + domain;
    case 'phone':
      return value.replace(/\\d(?=\\d{4})/g, '*');
    case 'creditCard':
      return '**** **** **** ' + value.slice(-4);
    default:
      return value.substring(0, 2) + '****' + value.substring(value.length - 2);
  }
}

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj: any, depth: number = 0): any {
  if (depth > 10) return obj; // Prevent infinite recursion
  
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    let sanitized = obj;
    for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
      sanitized = sanitized.replace(pattern, (match) => redactValue(match, type));
    }
    return sanitized;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Check if field should be fully redacted
      if (REDACT_FIELDS.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeObject(value, depth + 1);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * PII Sanitizer Middleware
 */
export const piiSanitizer = (req: Request, res: Response, next: NextFunction) => {
  // Store original json method
  const originalJson = res.json.bind(res);
  
  // Override json method to sanitize before sending
  res.json = (body: any) => {
    const sanitized = sanitizeObject(body);
    return originalJson(sanitized);
  };
  
  // Complexity: O(1)
  next();
};

export default piiSanitizer;
`;
  }

  /**
   * Generate PII filter for specific categories
   */
  // Complexity: O(N)
  private generatePIIFilter(categories: string[]): GeneratedPatch {
    const id = this.generateId('pii', 'filter');
    
    return {
      id,
      name: 'PII Field Filter',
      description: `Filters specific PII categories: ${categories.join(', ')}`,
      category: 'pii-exposure',
      framework: this.config.framework,
      language: this.config.language,
      code: `// PII Field Filter for: ${categories.join(', ')}
// TODO: Implement field-specific filtering based on your data model`,
      filename: `pii-filter.${this.getFileExtension()}`,
      dependencies: [],
      installCommands: [],
      priority: 'high',
      vulnerability: {
        type: 'PII Exposure',
        description: `Critical PII categories detected: ${categories.join(', ')}`,
      },
      instructions: [
        '1. Review the detected PII categories',
        '2. Implement DTO/serializer to exclude sensitive fields',
        '3. Use database projections to avoid loading PII',
      ],
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔑 SESSION/PRIVILEGE ESCALATION REMEDIATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generate patches from Session Orchestrator report
   */
  // Complexity: O(N) — linear iteration
  generateFromSessionReport(report: SessionOrchestratorReport): GeneratedPatch[] {
    console.log('\n🔧 [REMEDIATION] Generating privilege protection patches...');
    
    const patches: GeneratedPatch[] = [];

    for (const vuln of report.vulnerabilitiesFound) {
      if (vuln.type === 'vertical-privilege-escalation') {
        const patch = this.generatePrivEscPatch(vuln);
        patches.push(patch);
        this.patches.push(patch);
      } else if (vuln.type === 'horizontal-bola') {
        // Already handled by BOLA patches
      }
    }

    console.log(`   ✅ Generated ${patches.length} privilege protection patches`);
    return patches;
  }

  /**
   * Generate privilege escalation protection patch
   */
  // Complexity: O(N)
  private generatePrivEscPatch(vuln: CrossSessionVulnerability): GeneratedPatch {
    const id = this.generateId('privesc', vuln.endpoint);
    
    return {
      id,
      name: `Privilege Escalation Protection - ${vuln.endpoint}`,
      description: `Prevents ${vuln.sourceProfile.role} from accessing ${vuln.targetProfile.role} resources`,
      category: 'privilege-escalation',
      framework: this.config.framework,
      language: this.config.language,
      code: this.generateRBACMiddleware(vuln),
      filename: `rbac-protection-${this.sanitizeFilename(vuln.endpoint)}.${this.getFileExtension()}`,
      dependencies: [],
      installCommands: [],
      priority: 'critical',
      vulnerability: {
        type: 'Vertical Privilege Escalation',
        endpoint: vuln.endpoint,
        description: vuln.description,
      },
      instructions: [
        '1. Implement role hierarchy in your authentication system',
        '2. Add this middleware to protected routes',
        '3. Configure minimum required role for each endpoint',
      ],
    };
  }

  // Complexity: O(1) — hash/map lookup
  private generateRBACMiddleware(vuln: CrossSessionVulnerability): string {
    return `// ═══════════════════════════════════════════════════════════════════════════
// RBAC Middleware - Auto-Generated by CyberCody v1.2.0
// Endpoint: ${vuln.endpoint}
// Required Role: ${vuln.targetProfile.role}
// ═══════════════════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';

const ROLE_HIERARCHY: Record<string, number> = {
  superadmin: 100,
  admin: 80,
  moderator: 60,
  user: 40,
  guest: 20,
};

export const requireRole = (minimumRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role || 'guest';
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole] || 100;

    if (userLevel < requiredLevel) {
      console.warn(\`[RBAC] Access denied: \${userRole} tried to access \${minimumRole}-level resource\`);
      return res.status(403).json({ 
        error: 'Insufficient privileges',
        code: 'RBAC_FORBIDDEN'
      });
    }

    // Complexity: O(1) — hash/map lookup
    next();
  };
};

// Usage:
// app.get('${vuln.endpoint}', requireRole('${vuln.targetProfile.role}'), handler);
`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📊 REPORTING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Generate comprehensive remediation report
   */
  // Complexity: O(N log N) — sort operation
  generateReport(target: string): RemediationReport {
    const summary = {
      totalPatches: this.patches.length,
      bolaPatches: this.patches.filter(p => p.category === 'bola').length,
      piiPatches: this.patches.filter(p => p.category === 'pii-exposure').length,
      privEscPatches: this.patches.filter(p => p.category === 'privilege-escalation').length,
      rateLimitPatches: this.patches.filter(p => p.category === 'rate-limit').length,
    };

    // Sort patches by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const sortedPatches = [...this.patches].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    return {
      target,
      generatedAt: new Date(),
      framework: this.config.framework,
      language: this.config.language,
      patches: sortedPatches,
      summary,
      implementationOrder: sortedPatches.map(p => p.id),
      estimatedEffort: this.estimateEffort(summary),
    };
  }

  /**
   * Estimate implementation effort
   */
  // Complexity: O(1)
  private estimateEffort(summary: RemediationReport['summary']): string {
    const hours = 
      summary.bolaPatches * 2 +
      summary.piiPatches * 1 +
      summary.privEscPatches * 3 +
      summary.rateLimitPatches * 1;

    if (hours <= 4) return '< 1 day';
    if (hours <= 16) return '1-2 days';
    if (hours <= 40) return '1 week';
    return '> 1 week';
  }

  /**
   * Print report to console
   */
  // Complexity: O(N) — linear iteration
  printReport(report: RemediationReport): void {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🔧 REMEDIATION GENERATOR REPORT                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Target: ${report.target.padEnd(58)}║
║ Framework: ${report.framework.padEnd(56)}║
║ Language: ${report.language.padEnd(57)}║
╠══════════════════════════════════════════════════════════════════════════════╣
║ GENERATED PATCHES:                                                           ║
║   Total:          ${report.summary.totalPatches.toString().padEnd(48)}║
║   BOLA:           ${report.summary.bolaPatches.toString().padEnd(48)}║
║   PII:            ${report.summary.piiPatches.toString().padEnd(48)}║
║   Priv Esc:       ${report.summary.privEscPatches.toString().padEnd(48)}║
║   Rate Limit:     ${report.summary.rateLimitPatches.toString().padEnd(48)}║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Estimated Effort: ${report.estimatedEffort.padEnd(49)}║
╚══════════════════════════════════════════════════════════════════════════════╝`);

    if (report.patches.length > 0) {
      console.log('\n📋 Implementation Order:');
      for (const patch of report.patches.slice(0, 5)) {
        const priorityIcon = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' }[patch.priority];
        console.log(`   ${priorityIcon} ${patch.name}`);
        console.log(`      File: ${patch.filename}`);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔧 UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  // Complexity: O(1)
  private generateId(prefix: string, context: string): string {
    return createHash('sha256')
      .update(prefix + context + Date.now())
      .digest('hex')
      .substring(0, 12);
  }

  // Complexity: O(1)
  private sanitizeFilename(input: string): string {
    return input
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
  }

  // Complexity: O(1)
  private getFileExtension(): string {
    return this.config.language === 'typescript' ? 'ts' : 
           this.config.language === 'python' ? 'py' :
           this.config.language === 'java' ? 'java' : 'js';
  }

  // Complexity: O(1)
  private getBOLADependencies(): string[] {
    switch (this.config.framework) {
      case 'fastify':
        return ['fastify-plugin'];
      default:
        return [];
    }
  }

  // Complexity: O(N) — potential recursive descent
  private getBOLAInstallCommands(): string[] {
    const deps = this.getBOLADependencies();
    if (deps.length === 0) return [];
    return [`npm install ${deps.join(' ')}`];
  }

  // Complexity: O(N)
  private getBOLAInstructions(endpoint: string): string[] {
    return [
      '1. Review the generated middleware code',
      '2. Implement the validateResourceOwnership function with your database logic',
      `3. Apply the middleware to the ${endpoint} route`,
      '4. Test with multiple user accounts to verify protection',
      '5. Monitor logs for BOLA attempt warnings',
    ];
  }

  /**
   * Get all generated patches
   */
  // Complexity: O(1)
  getPatches(): GeneratedPatch[] {
    return [...this.patches];
  }

  /**
   * Clear all patches
   */
  // Complexity: O(1)
  clearPatches(): void {
    this.patches = [];
  }
}

export default RemediationGenerator;
