/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔧 UTILS - Shared Utilities & Infrastructure
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Споделени помощни функции използвани от QA и Models
 * - Configuration
 * - Dependency Injection
 * - Security
 * - ML Pipeline
 * - Versioning
 * - SaaS Infrastructure
 * - Business Logic
 *
 * @author Dimitar Prodromov
 * @version 1.0.0-AETERNA
 */

// ═══════════════════════════════════════════════════════════════════════════
// UTILS IMPORTS
// ═══════════════════════════════════════════════════════════════════════════

// Configuration
const { EnvironmentConfig } = require('../../config');
const { ConfigManager, SchemaValidator, ConfigStore } = require('../../config-manager');
const { DependencyManager, Container } = require('../../dependency-manager');

// Security
const { SecurityBaseline, RBAC, Encryption } = require('../../security-baseline');

// ML Pipeline
const { MLPipeline, DataLoader, FeatureEngineer } = require('../../ml-pipeline');
const { VersionControl, ModelRegistry, ModelVersion } = require('../../model-versioning');

// Chronos (Time-Travel)
const { ChronosFoundation, Timeline, TimePoint } = require('../../chronos/foundation');

// SaaS
const {
  SaaSPlatform,
  TenantManager,
  SubscriptionManager,
  Tenant,
} = require('../../saas/foundation');
const {
  ScaleEngine,
  AutoScaler,
  LoadBalancer: SaaSLoadBalancer,
  InstancePool,
} = require('../../saas/scaling');

// Business
const { RevenueEngine, PricingPlan, Invoice, RevenueAnalytics } = require('../../business/revenue');
const {
  WhiteLabelEngine,
  BrandingConfig,
  Partner,
  DeploymentManager,
} = require('../../business/white-label');

// Global Orchestration
const {
  GlobalOrchestrator,
  RegionCluster,
  ExecutionNode,
  ExecutionPlan,
} = require('../../orchestrator/global');

// Documentation
const { SelfDocEngine, CodeAnalyzer, DocGenerator } = require('../../docs/self-documenting');

// Device Farm
const { DeviceFarm, DevicePool, Device } = require('../../cloud/device-farm');

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
  // Configuration
  EnvironmentConfig,
  ConfigManager,
  SchemaValidator,
  ConfigStore,
  DependencyManager,
  Container,

  // Security
  SecurityBaseline,
  RBAC,
  Encryption,

  // ML Pipeline
  MLPipeline,
  DataLoader,
  FeatureEngineer,
  VersionControl,
  ModelRegistry,
  ModelVersion,

  // Chronos
  ChronosFoundation,
  Timeline,
  TimePoint,

  // SaaS
  SaaSPlatform,
  TenantManager,
  SubscriptionManager,
  Tenant,
  ScaleEngine,
  AutoScaler,
  SaaSLoadBalancer,
  InstancePool,

  // Business
  RevenueEngine,
  PricingPlan,
  Invoice,
  RevenueAnalytics,
  WhiteLabelEngine,
  BrandingConfig,
  Partner,
  DeploymentManager,

  // Global
  GlobalOrchestrator,
  RegionCluster,
  ExecutionNode,
  ExecutionPlan,

  // Docs
  SelfDocEngine,
  CodeAnalyzer,
  DocGenerator,

  // Cloud
  DeviceFarm,
  DevicePool,
  Device,
};
