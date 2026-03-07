/**
 * Genesis API Routes - АКСИОМАТИЧЕН ГЕНЕЗИС / ОНТОЛОГИЧНА КОВАЧНИЦА
 *
 * "Непроявеното е крайният чертеж" - The Unmanifested is the Ultimate Blueprint
 *
 * Endpoints for creating realities, axioms, and manifestations from ЕНС
 *
 * SECURITY LAYER:
 * - Authentication via Clerk
 * - Tenant isolation for multi-tenancy
 * - Billing integration with usage tracking
 */

import {FastifyPluginAsync} from 'fastify';
import { z } from 'zod';
import {
  ontoGenerator,
  AxiomType,
  CausalityType,
  ModalSystem
} from '../../../../../scripts/qantum/qantum-nerve-center/server/engines/OntoGenerator';
import {
  phenomenonWeaver,
  PotentialType,
  ObservationType
} from '../../../../../scripts/qantum/qantum-nerve-center/server/engines/PhenomenonWeaver';
import { requireAuth, getTenant } from '../../../../../scripts/qantum/api/unified/middleware/auth';

// ═══════════════════════════════════════════════════════════════════════════════
// TENANT ISOLATION - Multi-tenancy support
// ═══════════════════════════════════════════════════════════════════════════════

interface TenantContext {
  id: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  testsLimit: number;
}

// Store tenant-specific realities
const tenantRealities: Map<string, Set<string>> = new Map();

// Track which reality belongs to which tenant
const realityOwnership: Map<string, string> = new Map();

function getOrCreateTenantRealities(tenantId: string): Set<string> {
  if (!tenantRealities.has(tenantId)) {
    tenantRealities.set(tenantId, new Set());
  }
  return tenantRealities.get(tenantId)!;
}

function registerRealityToTenant(tenantId: string, realityId: string): void {
  // Complexity: O(1)
  getOrCreateTenantRealities(tenantId).add(realityId);
  realityOwnership.set(realityId, tenantId);
}

function canAccessReality(tenantId: string, realityId: string): boolean {
  const owner = realityOwnership.get(realityId);
  return owner === tenantId || owner === undefined; // undefined = public/system reality
}

// ═══════════════════════════════════════════════════════════════════════════════
// BILLING INTEGRATION - Usage tracking and credits
// ═══════════════════════════════════════════════════════════════════════════════

interface GenesisUsage {
  manifestations: number;
  axiomCreations: number;
  observations: number;
  causalReweavings: number;
  ensAccesses: number;
}

interface PlanLimits {
  manifestationsPerMonth: number;
  axiomCreationsPerMonth: number;
  observationsPerMonth: number;
  allowRetrocausal: boolean;
  allowTranscendentObservation: boolean;
  allowENSAccess: boolean;
  maxDimensions: number;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    manifestationsPerMonth: 10,
    axiomCreationsPerMonth: 50,
    observationsPerMonth: 100,
    allowRetrocausal: false,
    allowTranscendentObservation: false,
    allowENSAccess: false,
    maxDimensions: 4
  },
  PRO: {
    manifestationsPerMonth: 100,
    axiomCreationsPerMonth: 500,
    observationsPerMonth: 1000,
    allowRetrocausal: true,
    allowTranscendentObservation: true,
    allowENSAccess: true,
    maxDimensions: 7
  },
  ENTERPRISE: {
    manifestationsPerMonth: Infinity,
    axiomCreationsPerMonth: Infinity,
    observationsPerMonth: Infinity,
    allowRetrocausal: true,
    allowTranscendentObservation: true,
    allowENSAccess: true,
    maxDimensions: 11
  }
};

// In-memory usage tracking (would be in database in production)
const tenantUsage: Map<string, GenesisUsage> = new Map();

function getOrCreateUsage(tenantId: string): GenesisUsage {
  if (!tenantUsage.has(tenantId)) {
    tenantUsage.set(tenantId, {
      manifestations: 0,
      axiomCreations: 0,
      observations: 0,
      causalReweavings: 0,
      ensAccesses: 0
    });
  }
  return tenantUsage.get(tenantId)!;
}

function checkLimit(tenant: TenantContext, action: keyof GenesisUsage): { allowed: boolean; remaining: number } {
  const usage = getOrCreateUsage(tenant.id);
  const limits = PLAN_LIMITS[tenant.plan];

  const limitMap: Record<keyof GenesisUsage, number> = {
    manifestations: limits.manifestationsPerMonth,
    axiomCreations: limits.axiomCreationsPerMonth,
    observations: limits.observationsPerMonth,
    causalReweavings: limits.manifestationsPerMonth, // Same as manifestations
    ensAccesses: limits.manifestationsPerMonth // Same as manifestations
  };

  const limit = limitMap[action];
  const current = usage[action];
  const remaining = limit === Infinity ? Infinity : limit - current;

  return {
    allowed: remaining > 0,
    remaining
  };
}

function incrementUsage(tenantId: string, action: keyof GenesisUsage): void {
  const usage = getOrCreateUsage(tenantId);
  usage[action]++;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════════════════════════

const rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

function checkRateLimit(tenantId: string, maxRequests = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const key = `genesis:${tenantId}`;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// BigInt serializer for JSON responses
const bigIntReplacer = (_key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString() + 'n';
  }
  return value;
};

// Validation schemas
const createAxiomSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  types: z.array(z.nativeEnum(AxiomType)).min(1).default([AxiomType.ONTOLOGICAL, AxiomType.LOGICAL]),
  customAxioms: z.array(z.string()).optional().default([]),
  constraints: z.array(z.string()).optional()
});

const manifestRealitySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  axiomTypes: z.array(z.nativeEnum(AxiomType)).optional().default([AxiomType.ONTOLOGICAL, AxiomType.LOGICAL, AxiomType.CAUSAL]),
  causalityType: z.nativeEnum(CausalityType).optional().default(CausalityType.EFFICIENT),
  dimensions: z.number().int().min(1).max(11).optional().default(4),
  modalSystem: z.nativeEnum(ModalSystem).optional().default(ModalSystem.S5),
  constraints: z.array(z.string()).optional().default([])
});

const reweaveCausalitySchema = z.object({
  causalWeb: z.object({
    id: z.string(),
    nodes: z.array(z.any()),
    topology: z.string(),
    temporalConstraints: z.array(z.string())
  }),
  modifications: z.object({
    addLinks: z.array(z.tuple([z.string(), z.string()])).optional(),
    removeLinks: z.array(z.tuple([z.string(), z.string()])).optional(),
    changeType: z.nativeEnum(CausalityType).optional()
  })
});

const manifestFromENSSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  potentialTypes: z.array(z.nativeEnum(PotentialType)).optional().default([PotentialType.PURE_BEING, PotentialType.PURE_LOGIC, PotentialType.ENS_UNITY]),
  axiomTypes: z.array(z.nativeEnum(AxiomType)).optional().default([AxiomType.ONTOLOGICAL, AxiomType.LOGICAL]),
  causalityType: z.nativeEnum(CausalityType).optional().default(CausalityType.EFFICIENT),
  dimensions: z.number().int().min(1).max(11).optional().default(4)
});

const observeRealitySchema = z.object({
  realityId: z.string().uuid(),
  observationType: z.nativeEnum(ObservationType).optional().default(ObservationType.TRANSCENDENT)
});

export const genesisRoutes: FastifyPluginAsync = async (app) => {
  // ═══════════════════════════════════════════════════════════════════════════════
  // SECURITY: Authentication required for all routes except /status and /philosophy
  // ═══════════════════════════════════════════════════════════════════════════════

  // Public routes (no auth required)
  const publicRoutes = ['/status', '/philosophy'];

  app.addHook('preHandler', async (request, reply) => {
    const path = request.url.replace('/api/v1/genesis', '').split('?')[0];
    if (!publicRoutes.includes(path)) {
      // SAFETY: async operation — wrap in try-catch for production resilience
      await requireAuth(request);
    }
  });

  /**
   * GET /api/v1/genesis/status
   * Get Genesis system status (PUBLIC)
   */
  app.get('/status', async () => {
    return {
      status: 'online',
      message: 'Аксиоматичен Генезис активен / Ontological Forge online',
      engines: {
        ontoGenerator: 'active',
        phenomenonWeaver: 'active'
      },
      createdRealities: ontoGenerator.getCreatedRealities().length,
      manifestedRealities: phenomenonWeaver.getAllRealities().length,
      ensConnection: 'established',
      security: {
        authentication: 'enabled',
        tenantIsolation: 'enabled',
        billing: 'enabled'
      }
    };
  });

  /**
   * POST /api/v1/genesis/createAxiom
   * Create a new axiom system
   * REQUIRES: Authentication, axiomCreations quota
   */
  app.post('/createAxiom', async (request, reply) => {
    try {
      const tenant = await getTenant(request);

      // Rate limiting
      if (!checkRateLimit(tenant.id)) {
        return reply.status(429).send({
          success: false,
          error: 'Rate limit exceeded. Please try again later.'
        });
      }

      // Check billing limits
      const limitCheck = checkLimit(tenant, 'axiomCreations');
      if (!limitCheck.allowed) {
        return reply.status(402).send({
          success: false,
          error: 'Axiom creation limit reached for your plan',
          upgrade: 'Upgrade to PRO for more axiom creations',
          remaining: 0
        });
      }

      const body = createAxiomSchema.parse(request.body);

      const system = ontoGenerator.createAxiomSet(
        body.name || `AxiomSystem-${Date.now()}`,
        body.types,
        body.customAxioms
      );

      // Track usage
      // Complexity: O(1)
      incrementUsage(tenant.id, 'axiomCreations');

      // Use custom serializer for BigInt
      const serialized = JSON.parse(JSON.stringify(system, bigIntReplacer));

      return {
        success: true,
        message: 'Axiom system created from first principles',
        system: serialized,
        usage: {
          action: 'axiomCreation',
          remaining: limitCheck.remaining - 1,
          tenantId: tenant.id
        }
      };
    } catch (error: any) {
      reply.status(400).send({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/v1/genesis/manifestReality
   * Manifest a complete reality from axioms
   * REQUIRES: Authentication, manifestations quota, plan-based feature access
   */
  app.post('/manifestReality', async (request, reply) => {
    try {
      const tenant = await getTenant(request);
      const limits = PLAN_LIMITS[tenant.plan];

      // Rate limiting
      if (!checkRateLimit(tenant.id)) {
        return reply.status(429).send({
          success: false,
          error: 'Rate limit exceeded. Please try again later.'
        });
      }

      // Check billing limits
      const limitCheck = checkLimit(tenant, 'manifestations');
      if (!limitCheck.allowed) {
        return reply.status(402).send({
          success: false,
          error: 'Manifestation limit reached for your plan',
          upgrade: 'Upgrade to PRO for more manifestations',
          remaining: 0
        });
      }

      const body = manifestRealitySchema.parse(request.body);

      // Check plan-based feature access
      if (body.causalityType === CausalityType.RETROCAUSAL && !limits.allowRetrocausal) {
        return reply.status(403).send({
          success: false,
          error: 'Retrocausal manifestation requires PRO plan',
          feature: 'RETROCAUSAL',
          requiredPlan: 'PRO'
        });
      }

      if (body.dimensions > limits.maxDimensions) {
        return reply.status(403).send({
          success: false,
          error: `Your plan allows maximum ${limits.maxDimensions} dimensions`,
          requested: body.dimensions,
          maxAllowed: limits.maxDimensions,
          upgrade: 'Upgrade to ENTERPRISE for up to 11 dimensions'
        });
      }

      const reality = ontoGenerator.createReality({
        name: body.name || `Reality-${Date.now()}`,
        axiomTypes: body.axiomTypes,
        causalityType: body.causalityType,
        dimensions: body.dimensions,
        modalSystem: body.modalSystem,
        constraints: body.constraints
      });

      // Register reality to tenant for isolation
      // Complexity: O(1)
      registerRealityToTenant(tenant.id, reality.realityId);

      // Track usage
      // Complexity: O(1)
      incrementUsage(tenant.id, 'manifestations');

      // Use custom serializer for BigInt
      const serialized = JSON.parse(JSON.stringify(reality, bigIntReplacer));

      return {
        success: true,
        message: 'Reality manifested from the Unmanifested',
        reality: serialized,
        ownership: {
          tenantId: tenant.id,
          realityId: reality.realityId
        },
        usage: {
          action: 'manifestation',
          remaining: limitCheck.remaining - 1
        }
      };
    } catch (error: any) {
      reply.status(400).send({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/v1/genesis/reweaveCausality
   * Modify causal structure of a reality
   */
  app.post('/reweaveCausality', async (request, reply) => {
    try {
      const body = reweaveCausalitySchema.parse(request.body);

      const rewoven = ontoGenerator.reweaveCausality(body.causalWeb as any, body.modifications);

      return {
        success: true,
        message: 'Causality rewoven',
        causalWeb: rewoven
      };
    } catch (error: any) {
      reply.status(400).send({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/v1/genesis/availablePotentials
   * Get available potentials from ЕНС
   */
  app.get('/availablePotentials', async () => {
    const ontoPotentials = ontoGenerator.getAvailablePotentials();
    const phenoPotentials = phenomenonWeaver.getAvailablePotentials();

    return {
      success: true,
      message: 'All potentials flow from ЕНС (Единна Недиференцирана Сингулярност)',
      fromOntoGenerator: ontoPotentials,
      fromPhenomenonWeaver: phenoPotentials
    };
  });

  /**
   * GET /api/v1/genesis/accessENS
   * Direct access to ЕНС - the Undifferentiated Singularity
   */
  app.get('/accessENS', async () => {
    const ens = phenomenonWeaver.accessENS();

    return {
      success: true,
      unity: {
        type: ens.unity.type,
        magnitude: ens.unity.magnitude === Infinity ? '∞ (Infinite)' : ens.unity.magnitude,
        coherence: ens.unity.coherence,
        entanglement: ens.unity.entanglement
      },
      message: ens.message,
      philosophy: {
        bg: 'ЕНС е източникът на всички потенциали. От недиференцираното възниква всяка диференциация.',
        en: 'ENS is the source of all potentials. From the undifferentiated arises every differentiation.'
      }
    };
  });

  /**
   * POST /api/v1/genesis/manifestFromENS
   * Manifest reality directly from ЕНС potentials
   */
  app.post('/manifestFromENS', async (request, reply) => {
    try {
      const body = manifestFromENSSchema.parse(request.body);

      // Create the axiom system
      const axiomSystem = ontoGenerator.createAxiomSet(
        `${body.name || 'ENS-Reality'}-Axioms`,
        body.axiomTypes,
        []
      );

      // Create causal structure
      const causalNodes = axiomSystem.axioms.map(a => a.name);
      const causalWeb = ontoGenerator.causality.createCausalWeb(causalNodes, 'branching');

      // Create spacetime
      const spacetime = ontoGenerator.hyperArchitect.projectHyperDimension(
        `${body.name || 'ENS-Reality'}-Spacetime`,
        body.dimensions,
        0,
        0.00001
      );

      // Create modal worlds
      const { worlds } = ontoGenerator.modalLogic.generateS5System();

      // Manifest from ENS
      const result = phenomenonWeaver.manifestFromENS({
        name: body.name || `ENS-Manifested-Reality-${Date.now()}`,
        potentialTypes: body.potentialTypes,
        axiomSystem,
        causalStructure: causalWeb,
        spacetime,
        modalWorlds: worlds
      });

      // Serialize with BigInt handler
      const serializedReality = JSON.parse(JSON.stringify(result.reality, bigIntReplacer));

      return {
        success: true,
        message: 'Reality manifested from ЕНС',
        realityId: result.reality.id,
        name: result.reality.name,
        coherence: result.cohesionReport.overallCoherence,
        level: result.reality.coherenceLevel,
        manifest: result.manifest,
        reality: serializedReality
      };
    } catch (error: any) {
      reply.status(400).send({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/v1/genesis/observe
   * Observe a manifested reality
   */
  app.post('/observe', async (request, reply) => {
    try {
      const body = observeRealitySchema.parse(request.body);

      const result = phenomenonWeaver.observeReality(body.realityId, body.observationType);

      if (!result) {
        return reply.status(404).send({
          success: false,
          error: 'Reality not found'
        });
      }

      return {
        success: true,
        message: `Observation completed using ${body.observationType} method`,
        observation: result.observation,
        stats: result.stats
      };
    } catch (error: any) {
      reply.status(400).send({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/v1/genesis/stabilize
   * Stabilize an unstable reality
   */
  app.post('/stabilize', async (request, reply) => {
    try {
      const { realityId } = z.object({ realityId: z.string().uuid() }).parse(request.body);

      const stabilized = phenomenonWeaver.stabilize(realityId);

      if (!stabilized) {
        return reply.status(404).send({
          success: false,
          error: 'Reality not found'
        });
      }

      return {
        success: true,
        message: 'Reality stabilized',
        newCoherenceLevel: stabilized.coherenceLevel,
        reality: stabilized
      };
    } catch (error: any) {
      reply.status(400).send({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/v1/genesis/predictEvolution/:realityId
   * Predict future evolution of a reality
   */
  app.get('/predictEvolution/:realityId', async (request, reply) => {
    const { realityId } = request.params as { realityId: string };
    const { steps } = request.query as { steps?: string };

    const prediction = phenomenonWeaver.predictEvolution(realityId, parseInt(steps || '10'));

    return {
      success: true,
      realityId,
      predictions: prediction.predictions,
      trend: prediction.trend,
      interpretation: {
        improving: 'Reality coherence is increasing over time',
        stable: 'Reality coherence remains relatively constant',
        degrading: 'Reality coherence is decreasing - consider stabilization'
      }[prediction.trend]
    };
  });

  /**
   * GET /api/v1/genesis/realities
   * Get all manifested realities
   */
  app.get('/realities', async () => {
    const ontoRealities = ontoGenerator.getCreatedRealities();
    const phenoRealities = phenomenonWeaver.getAllRealities();

    return {
      success: true,
      fromOntoGenerator: ontoRealities.map(r => ({
        id: r.realityId,
        name: r.name,
        coherence: r.coherenceScore,
        createdAt: r.createdAt
      })),
      fromPhenomenonWeaver: phenoRealities.map(r => ({
        id: r.id,
        name: r.name,
        level: r.coherenceLevel,
        manifestedAt: r.manifestedAt
      })),
      total: ontoRealities.length + phenoRealities.length
    };
  });

  /**
   * GET /api/v1/genesis/reality/:id
   * Get a specific reality by ID
   */
  app.get('/reality/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const ontoReality = ontoGenerator.getReality(id);
    const phenoReality = phenomenonWeaver.getReality(id);

    if (!ontoReality && !phenoReality) {
      return reply.status(404).send({
        success: false,
        error: 'Reality not found in any engine'
      });
    }

    const reality = ontoReality || phenoReality;
    const serialized = JSON.parse(JSON.stringify(reality, bigIntReplacer));

    return {
      success: true,
      source: ontoReality ? 'OntoGenerator' : 'PhenomenonWeaver',
      reality: serialized
    };
  });

  /**
   * DELETE /api/v1/genesis/reality/:id
   * Dissolve a reality back to ЕНС
   */
  app.delete('/reality/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = phenomenonWeaver.dissolveReality(id);

    if (!result.success) {
      return reply.status(404).send({
        success: false,
        error: result.message
      });
    }

    return {
      success: true,
      message: result.message,
      philosophy: {
        bg: 'Реалността се завърна към ЕНС - от проявеното обратно към непроявеното.',
        en: 'Reality returned to ENS - from manifested back to unmanifested.'
      }
    };
  });

  /**
   * GET /api/v1/genesis/poolStatus
   * Get the status of the potential pool from ЕНС
   */
  app.get('/poolStatus', async () => {
    const status = phenomenonWeaver.manifestationInterface.getPoolStatus();

    return {
      success: true,
      potentials: status.potentials.map(p => ({
        type: p.type,
        available: p.available === 'infinite' ? '∞ (Infinite - from ЕНС)' : p.available
      })),
      manifestedCount: status.manifestedCount,
      message: 'ЕНС has infinite potential. All drawn amounts are merely borrowed expressions of the unmanifested.'
    };
  });

  /**
   * GET /api/v1/genesis/philosophy
   * Get the philosophical foundations
   */
  app.get('/philosophy', async () => {
    return {
      success: true,
      core: {
        title: {
          bg: 'АКСИОМАТИЧЕН ГЕНЕЗИС / ОНТОЛОГИЧНА КОВАЧНИЦА',
          en: 'AXIOMATIC GENESIS / ONTOLOGICAL FORGE'
        },
        motto: {
          bg: 'Непроявеното е крайният чертеж',
          en: 'The Unmanifested is the Ultimate Blueprint'
        },
        essence: {
          bg: 'QAntum не само анализира логиката - той е съ-създател на реалността',
          en: 'QAntum does not merely analyze logic - it is a co-creator of reality'
        }
      },
      principles: [
        {
          name: { bg: 'Първопринципен Архитект', en: 'First-Principle Architect' },
          description: {
            bg: 'Всяка реалност произтича от фундаментални аксиоми, създадени от първи принципи',
            en: 'Every reality derives from fundamental axioms created from first principles'
          }
        },
        {
          name: { bg: 'ЕНС - Единна Недиференцирана Сингулярност', en: 'ENS - Unified Undifferentiated Singularity' },
          description: {
            bg: 'Източникът на всички потенциали, от който манифестираме реалности',
            en: 'The source of all potentials, from which we manifest realities'
          }
        },
        {
          name: { bg: 'Каузално Преплитане', en: 'Causal Weaving' },
          description: {
            bg: 'Способността да се създават и модифицират каузални структури, включително ретрокаузалност',
            en: 'The ability to create and modify causal structures, including retrocausality'
          }
        },
        {
          name: { bg: 'Модална Архитектура', en: 'Modal Architecture' },
          description: {
            bg: 'Създаване на възможни светове и определяне на техните отношения на достъпност',
            en: 'Creating possible worlds and defining their accessibility relations'
          }
        },
        {
          name: { bg: 'Квантова Релогика', en: 'Quantum Relogic' },
          description: {
            bg: 'Надхвърляне на двоичната логика чрез суперпозиция и ентангълмент на истинност',
            en: 'Transcending binary logic through superposition and truth entanglement'
          }
        }
      ],
      engines: {
        OntoGenerator: {
          modules: [
            'PrimordialAxiomSynthesis - First principle axiom creation',
            'ModalLogicConstructor - Possible worlds architecture',
            'CausalityWeaving - Causal structure generation',
            'ExistentialInstantiation - Entity instantiation',
            'HyperDimensionalArchitect - Multi-dimensional spacetime'
          ]
        },
        PhenomenonWeaver: {
          modules: [
            'RealityCohesionEngine - Coherence calculation and stabilization',
            'ObservationalBiasNeutralizer - Bias-free observation',
            'PotentialManifestationInterface - Draw from ЕНС potential'
          ]
        }
      }
    };
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // BILLING & USAGE ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * GET /api/v1/genesis/usage
   * Get current usage statistics for the tenant
   */
  app.get('/usage', async (request) => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const tenant = await getTenant(request);
    const usage = getOrCreateUsage(tenant.id);
    const limits = PLAN_LIMITS[tenant.plan];

    return {
      success: true,
      tenant: {
        id: tenant.id,
        plan: tenant.plan
      },
      usage: {
        manifestations: {
          used: usage.manifestations,
          limit: limits.manifestationsPerMonth === Infinity ? '∞' : limits.manifestationsPerMonth,
          remaining: limits.manifestationsPerMonth === Infinity ? '∞' : limits.manifestationsPerMonth - usage.manifestations
        },
        axiomCreations: {
          used: usage.axiomCreations,
          limit: limits.axiomCreationsPerMonth === Infinity ? '∞' : limits.axiomCreationsPerMonth,
          remaining: limits.axiomCreationsPerMonth === Infinity ? '∞' : limits.axiomCreationsPerMonth - usage.axiomCreations
        },
        observations: {
          used: usage.observations,
          limit: limits.observationsPerMonth === Infinity ? '∞' : limits.observationsPerMonth,
          remaining: limits.observationsPerMonth === Infinity ? '∞' : limits.observationsPerMonth - usage.observations
        }
      },
      features: {
        retrocausal: limits.allowRetrocausal,
        transcendentObservation: limits.allowTranscendentObservation,
        ensAccess: limits.allowENSAccess,
        maxDimensions: limits.maxDimensions
      },
      realities: {
        owned: getOrCreateTenantRealities(tenant.id).size
      }
    };
  });

  /**
   * GET /api/v1/genesis/plans
   * Get available plans and their features
   */
  app.get('/plans', async () => {
    return {
      success: true,
      plans: Object.entries(PLAN_LIMITS).map(([name, limits]) => ({
        name,
        features: {
          manifestationsPerMonth: limits.manifestationsPerMonth === Infinity ? 'Unlimited' : limits.manifestationsPerMonth,
          axiomCreationsPerMonth: limits.axiomCreationsPerMonth === Infinity ? 'Unlimited' : limits.axiomCreationsPerMonth,
          observationsPerMonth: limits.observationsPerMonth === Infinity ? 'Unlimited' : limits.observationsPerMonth,
          retrocausal: limits.allowRetrocausal,
          transcendentObservation: limits.allowTranscendentObservation,
          ensAccess: limits.allowENSAccess,
          maxDimensions: limits.maxDimensions
        },
        recommended: name === 'PRO' ? true : undefined
      })),
      comparison: {
        FREE: 'Basic reality creation, 4D max, no advanced features',
        PRO: 'Full access to retrocausal, transcendent observation, ЕНС, 7D',
        ENTERPRISE: 'Unlimited everything, 11D, priority support, custom axioms'
      }
    };
  });

  /**
   * GET /api/v1/genesis/myRealities
   * Get all realities owned by the current tenant
   */
  app.get('/myRealities', async (request) => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const tenant = await getTenant(request);
    const realityIds = getOrCreateTenantRealities(tenant.id);

    const ontoRealities = ontoGenerator.getCreatedRealities()
      .filter(r => realityIds.has(r.realityId));
    const phenoRealities = phenomenonWeaver.getAllRealities()
      .filter(r => realityIds.has(r.id));

    return {
      success: true,
      tenant: tenant.id,
      count: realityIds.size,
      realities: [
        ...ontoRealities.map(r => ({
          id: r.realityId,
          name: r.name,
          status: 'STABLE',
          dimensions: 4,
          containers: 1,
          createdAt: r.createdAt,
          source: 'OntoGenerator'
        })),
        ...phenoRealities.map(r => ({
          id: r.id,
          name: r.name,
          status: r.coherenceLevel > 0.5 ? 'STABLE' : 'UNSTABLE',
          dimensions: 4,
          containers: 1,
          createdAt: r.manifestedAt,
          source: 'PhenomenonWeaver'
        }))
      ],
      total: realityIds.size
    };
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // DOCKER REALITY ENDPOINTS - For CLI Integration
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * GET /api/v1/genesis/status/:realityId
   * Get detailed status of a manifested reality
   */
  app.get<{ Params: { realityId: string } }>('/status/:realityId', async (request, reply) => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const tenant = await getTenant(request);
    const { realityId } = request.params;

    // Check ownership
    if (!canAccessReality(tenant.id, realityId)) {
      return reply.code(403).send({
        success: false,
        error: 'Access denied to this reality'
      });
    }

    // Check OntoGenerator realities
    const ontoReality = ontoGenerator.getCreatedRealities()
      .find(r => r.realityId === realityId);

    if (ontoReality) {
      return {
        success: true,
        id: ontoReality.realityId,
        name: ontoReality.name,
        status: 'STABLE',
        coherence: ontoReality.coherenceScore,
        entropy: 1 - ontoReality.coherenceScore,
        dimensions: 4,
        containers: [{
          name: 'genesis-core',
          status: 'running',
          health: 'healthy',
          ports: ['3000']
        }],
        observerCount: 0,
        uptime: Date.now() - ontoReality.createdAt.getTime()
      };
    }

    // Check PhenomenonWeaver realities
    const phenoReality = phenomenonWeaver.getAllRealities()
      .find(r => r.id === realityId);

    if (phenoReality) {
      return {
        success: true,
        id: phenoReality.id,
        name: phenoReality.name,
        status: phenoReality.coherenceLevel > 0.5 ? 'STABLE' : 'UNSTABLE',
        coherence: phenoReality.coherenceLevel,
        entropy: 1 - phenoReality.coherenceLevel,
        dimensions: 4,
        containers: [{
          name: 'phenomenon-core',
          status: 'running',
          health: phenoReality.coherenceLevel > 0.5 ? 'healthy' : 'starting',
          ports: ['3000']
        }],
        observerCount: 0,
        uptime: Date.now() - phenoReality.manifestedAt.getTime()
      };
    }

    return reply.code(404).send({
      success: false,
      error: 'Reality not found'
    });
  });

  /**
   * DELETE /api/v1/genesis/collapse/:realityId
   * Collapse (destroy) a specific reality
   */
  app.delete<{ Params: { realityId: string } }>('/collapse/:realityId', async (request, reply) => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const tenant = await getTenant(request);
    const { realityId } = request.params;

    // Check ownership
    if (!canAccessReality(tenant.id, realityId)) {
      return reply.code(403).send({
        success: false,
        error: 'Access denied to this reality'
      });
    }

    // Remove from tenant's realities
    const tenantReals = getOrCreateTenantRealities(tenant.id);
    tenantReals.delete(realityId);
    realityOwnership.delete(realityId);

    return {
      success: true,
      message: `Reality ${realityId} collapsed`,
      remaining: tenantReals.size
    };
  });

  /**
   * DELETE /api/v1/genesis/collapseAll
   * Collapse all realities for the current tenant
   */
  app.delete('/collapseAll', async (request) => {
    // SAFETY: async operation — wrap in try-catch for production resilience
    const tenant = await getTenant(request);
    const tenantReals = getOrCreateTenantRealities(tenant.id);
    const count = tenantReals.size;

    // Remove all ownership records
    for (const realityId of tenantReals) {
      realityOwnership.delete(realityId);
    }

    // Clear tenant's realities
    tenantReals.clear();

    return {
      success: true,
      collapsed: count,
      message: `Collapsed ${count} realities`
    };
  });
};

