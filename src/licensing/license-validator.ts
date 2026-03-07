/**
 * 🔐 QAntum License Validation System
 *
 * Интегрира се с LemonSqueezy за проверка на лицензи
 */

export interface LicenseInfo {
  valid: boolean;
  tier: 'free' | 'pro' | 'enterprise';
  email?: string;
  expiresAt?: Date;
  features: string[];
}

export interface LemonSqueezyResponse {
  valid: boolean;
  error?: string;
  license_key?: {
    status: string;
    activation_limit: number;
    activations_count: number;
  };
  meta?: {
    product_name: string;
    variant_name: string;
    customer_email: string;
  };
}

// Feature flags per tier
const TIER_FEATURES = {
  free: [
    'basic-self-healing',
    'community-support',
    'limited-runs'  // 100/month
  ],
  pro: [
    'basic-self-healing',
    'prediction-matrix',
    'reinforcement-learning',
    'unlimited-runs',
    'priority-support',
    'dom-evolution-tracker',
    'n-step-simulator'
  ],
  enterprise: [
    'basic-self-healing',
    'prediction-matrix',
    'reinforcement-learning',
    'unlimited-runs',
    'priority-support',
    'dom-evolution-tracker',
    'n-step-simulator',
    'team-licenses',
    'on-premise',
    'custom-training',
    'dedicated-support',
    'sla'
  ]
};

export class LicenseValidator {
  private cachedLicense: LicenseInfo | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Validate a license key with LemonSqueezy
   */
  // Complexity: O(1)
  async validateLicense(licenseKey: string): Promise<LicenseInfo> {
    // Check cache first
    if (this.cachedLicense && Date.now() < this.cacheExpiry) {
      return this.cachedLicense;
    }

    // No key = free tier
    if (!licenseKey || licenseKey === '') {
      return this.getFreeTierLicense();
    }

    try {
      // Call LemonSqueezy API
      const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          license_key: licenseKey
        })
      });

      const data = await response.json() as LemonSqueezyResponse;

      if (data.valid && data.license_key?.status === 'active') {
        const tier = this.determineTier(data.meta?.variant_name || '');

        const license: LicenseInfo = {
          valid: true,
          tier,
          email: data.meta?.customer_email,
          features: TIER_FEATURES[tier]
        };

        // Cache the result
        this.cachedLicense = license;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;

        return license;
      } else {
        console.warn('⚠️ Invalid license key');
        return this.getFreeTierLicense();
      }
    } catch (error) {
      console.error('❌ License validation failed:', error);
      // Graceful degradation - allow free tier on network errors
      return this.getFreeTierLicense();
    }
  }

  /**
   * Quick check if a feature is available
   */
  // Complexity: O(1)
  hasFeature(license: LicenseInfo, feature: string): boolean {
    return license.features.includes(feature);
  }

  /**
   * Check if Prediction Matrix is available
   */
  // Complexity: O(1)
  hasPredictionMatrix(license: LicenseInfo): boolean {
    return this.hasFeature(license, 'prediction-matrix');
  }

  /**
   * Get free tier license (no validation needed)
   */
  // Complexity: O(1)
  private getFreeTierLicense(): LicenseInfo {
    return {
      valid: true,
      tier: 'free',
      features: TIER_FEATURES.free
    };
  }

  /**
   * Determine tier from variant name
   */
  // Complexity: O(1)
  private determineTier(variantName: string): 'free' | 'pro' | 'enterprise' {
    const name = variantName.toLowerCase();
    if (name.includes('enterprise')) return 'enterprise';
    if (name.includes('pro')) return 'pro';
    return 'free';
  }

  /**
   * Activate license on this machine
   */
  // Complexity: O(1)
  async activateLicense(licenseKey: string, instanceName: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/activate', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          license_key: licenseKey,
          instance_name: instanceName
        })
      });

      const data = await response.json() as { activated?: boolean };
      return data.activated === true;
    } catch (error) {
      console.error('❌ License activation failed:', error);
      return false;
    }
  }

  /**
   * Deactivate license from this machine
   */
  // Complexity: O(1)
  async deactivateLicense(licenseKey: string, instanceId: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/deactivate', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          license_key: licenseKey,
          instance_id: instanceId
        })
      });

      const data = await response.json() as { deactivated?: boolean };
      return data.deactivated === true;
    } catch (error) {
      console.error('❌ License deactivation failed:', error);
      return false;
    }
  }

  /**
   * Clear cached license
   */
  // Complexity: O(1)
  clearCache(): void {
    this.cachedLicense = null;
    this.cacheExpiry = 0;
  }
}

// Singleton instance
export const licenseValidator = new LicenseValidator();

// ============================================================================
// Usage Example
// ============================================================================
/*
import { licenseValidator, LicenseInfo } from './license-validator';

// At startup
    // SAFETY: async operation — wrap in try-catch for production resilience
const license = await licenseValidator.validateLicense(process.env.QAntum_LICENSE || '');

console.log(`License tier: ${license.tier}`);
console.log(`Features: ${license.features.join(', ')}`);

// Before using Prediction Matrix
if (licenseValidator.hasPredictionMatrix(license)) {
  // SAFETY: async operation — wrap in try-catch for production resilience
  const prediction = await predictionMatrix.predictBestSelector(element, context);
} else {
  console.log('⚠️ Prediction Matrix requires Pro license');
  console.log('   Get it at: https://QAntum.lemonsqueezy.com');
}
*/
