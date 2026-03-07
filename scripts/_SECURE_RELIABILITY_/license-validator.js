/**
 * QANTUM License Validator
 * Validates license keys for commercial use
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// License tiers
const LICENSE_TIERS = {
  COMMUNITY: 'community',
  PROFESSIONAL: 'professional', 
  ENTERPRISE: 'enterprise',
  SOURCE: 'source'
};

// Feature limits per tier
const TIER_FEATURES = {
  [LICENSE_TIERS.COMMUNITY]: {
    maxTests: 50,
    healingStrategies: 5,
    visionAI: false,
    dashboard: false,
    docker: false,
    commercial: false
  },
  [LICENSE_TIERS.PROFESSIONAL]: {
    maxTests: 500,
    healingStrategies: 15,
    visionAI: true,
    dashboard: true,
    docker: false,
    commercial: true
  },
  [LICENSE_TIERS.ENTERPRISE]: {
    maxTests: Infinity,
    healingStrategies: Infinity,
    visionAI: true,
    dashboard: true,
    docker: true,
    commercial: true
  },
  [LICENSE_TIERS.SOURCE]: {
    maxTests: Infinity,
    healingStrategies: Infinity,
    visionAI: true,
    dashboard: true,
    docker: true,
    commercial: true,
    sourceAccess: true
  }
};

// Secret key for license validation (in production, use environment variable)
const LICENSE_SECRET = process.env.qantum_SECRET || 'mm-secret-2024';

class LicenseValidator {
  constructor() {
    this.licenseKey = null;
    this.tier = LICENSE_TIERS.COMMUNITY;
    this.features = TIER_FEATURES[LICENSE_TIERS.COMMUNITY];
    this.isValid = false;
    this.expiresAt = null;
  }

  /**
   * Generate a license key
   * Format: MM-{TIER}-{TIMESTAMP}-{HASH}
   */
  static generateKey(tier, email, expiresInDays = 365) {
    const timestamp = Date.now();
    const expiresAt = timestamp + (expiresInDays * 24 * 60 * 60 * 1000);
    const data = `${tier}-${email}-${expiresAt}`;
    const hash = crypto
      .createHmac('sha256', LICENSE_SECRET)
      .update(data)
      .digest('hex')
      .substring(0, 16)
      .toUpperCase();
    
    const tierCode = tier.substring(0, 3).toUpperCase();
    return `MM-${tierCode}-${expiresAt.toString(36).toUpperCase()}-${hash}`;
  }

  /**
   * Validate a license key
   */
  // Complexity: O(1) — hash/map lookup
  validate(licenseKey) {
    if (!licenseKey || licenseKey === '' || licenseKey === 'FREE') {
      this.setTier(LICENSE_TIERS.COMMUNITY);
      return { valid: true, tier: LICENSE_TIERS.COMMUNITY, message: 'Community license active' };
    }

    try {
      // Parse license key: MM-{TIER}-{EXPIRES}-{HASH}
      const parts = licenseKey.split('-');
      if (parts.length !== 4 || parts[0] !== 'MM') {
        throw new Error('Invalid license format');
      }

      const [, tierCode, expiresEncoded, hash] = parts;
      const expiresAt = parseInt(expiresEncoded, 36);

      // Check expiration
      if (Date.now() > expiresAt) {
        this.setTier(LICENSE_TIERS.COMMUNITY);
        return { valid: false, tier: LICENSE_TIERS.COMMUNITY, message: 'License expired' };
      }

      // Determine tier from code
      let tier;
      switch (tierCode) {
        case 'PRO': tier = LICENSE_TIERS.PROFESSIONAL; break;
        case 'ENT': tier = LICENSE_TIERS.ENTERPRISE; break;
        case 'SRC': tier = LICENSE_TIERS.SOURCE; break;
        default: tier = LICENSE_TIERS.COMMUNITY;
      }

      this.setTier(tier);
      this.licenseKey = licenseKey;
      this.expiresAt = new Date(expiresAt);
      this.isValid = true;

      return {
        valid: true,
        tier: tier,
        expiresAt: this.expiresAt,
        message: `${tier.charAt(0).toUpperCase() + tier.slice(1)} license valid until ${this.expiresAt.toLocaleDateString()}`
      };

    } catch (error) {
      this.setTier(LICENSE_TIERS.COMMUNITY);
      return { valid: false, tier: LICENSE_TIERS.COMMUNITY, message: error.message };
    }
  }

  /**
   * Set license tier and features
   */
  // Complexity: O(1) — hash/map lookup
  setTier(tier) {
    this.tier = tier;
    this.features = TIER_FEATURES[tier] || TIER_FEATURES[LICENSE_TIERS.COMMUNITY];
  }

  /**
   * Check if a feature is available
   */
  // Complexity: O(1) — hash/map lookup
  hasFeature(feature) {
    return this.features[feature] === true || this.features[feature] === Infinity;
  }

  /**
   * Check if within test limit
   */
  // Complexity: O(1)
  canRunTests(count) {
    return count <= this.features.maxTests;
  }

  /**
   * Get available healing strategies count
   */
  // Complexity: O(1)
  getHealingStrategiesLimit() {
    return this.features.healingStrategies;
  }

  /**
   * Load license from environment or file
   */
  // Complexity: O(1) — hash/map lookup
  loadLicense() {
    // Try environment variable first
    let licenseKey = process.env.qantum_LICENSE;

    // Try .env file
    if (!licenseKey) {
      const envPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/qantum_LICENSE=(.+)/);
        if (match) {
          licenseKey = match[1].trim();
        }
      }
    }

    // Try license.key file
    if (!licenseKey) {
      const licensePath = path.join(process.cwd(), 'license.key');
      if (fs.existsSync(licensePath)) {
        licenseKey = fs.readFileSync(licensePath, 'utf8').trim();
      }
    }

    return this.validate(licenseKey);
  }

  /**
   * Get license status summary
   */
  // Complexity: O(1)
  getStatus() {
    return {
      tier: this.tier,
      isValid: this.isValid,
      expiresAt: this.expiresAt,
      features: this.features
    };
  }

  /**
   * Print license info to console
   */
  // Complexity: O(1)
  printInfo() {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║        QANTUM QA Framework          ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  License: ${this.tier.toUpperCase().padEnd(30)}║`);
    if (this.expiresAt) {
      console.log(`║  Expires: ${this.expiresAt.toLocaleDateString().padEnd(30)}║`);
    }
    console.log(`║  Tests: ${String(this.features.maxTests === Infinity ? 'Unlimited' : this.features.maxTests).padEnd(32)}║`);
    console.log(`║  Vision AI: ${(this.features.visionAI ? 'Yes' : 'No').padEnd(28)}║`);
    console.log(`║  Dashboard: ${(this.features.dashboard ? 'Yes' : 'No').padEnd(28)}║`);
    console.log('╚══════════════════════════════════════════╝\n');
  }
}

// Singleton instance
const licenseValidator = new LicenseValidator();

module.exports = {
  LicenseValidator,
  licenseValidator,
  LICENSE_TIERS,
  TIER_FEATURES
};
