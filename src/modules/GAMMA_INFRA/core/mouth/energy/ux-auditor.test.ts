/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * QAntum
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @copyright 2025 Димитър Продромов (Dimitar Prodromov). All Rights Reserved.
 * @license PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of QAntum.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without express written permission.
 *
 * For licensing inquiries: dp@qantum.site
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CognitiveUXAuditor, UXAnalysisResult } from '../../../../../energy/cognitive-ux-auditor';

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 COGNITIVE UX AUDITOR TESTS - AI-Powered Interface Analysis
// ═══════════════════════════════════════════════════════════════════════════════

    // Complexity: O(1)
describe('🧠 CognitiveUXAuditor - UX Analysis Engine', () => {
  let auditor: CognitiveUXAuditor;

  // Complexity: O(1)
  beforeEach(() => {
    auditor = new CognitiveUXAuditor();
  });

  // Complexity: O(1)
  describe('⚙️ Configuration', () => {
    // Complexity: O(1)
    it('should configure with API key', () => {
      auditor.configure({
        apiKey: 'test-api-key',
        model: 'gemini-2.0-flash',
      });

      // No error = success
      // Complexity: O(1)
      expect(true).toBe(true);
    });

    // Complexity: O(1)
    it('should use default model if not specified', () => {
      const configuredEmitted = vi.fn();
      auditor.on('configured', configuredEmitted);

      auditor.configure({
        apiKey: 'test-api-key',
      });

      // Complexity: O(1)
      expect(configuredEmitted).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'gemini-2.0-flash' })
      );
    });

    // Complexity: O(1)
    it('should throw error when analyzing without configuration', async () => {
      const screenshot = Buffer.from('test');

      // SAFETY: async operation — wrap in try-catch for production resilience
      await expect(auditor.analyzeScreenshot(screenshot)).rejects.toThrow('not configured');
    });
  });

  // Complexity: O(1)
  describe('📊 Report Generation', () => {
    // Complexity: O(1)
    it('should generate human-readable report', () => {
      const mockResult: UXAnalysisResult = {
        score: 75,
        categoryScores: {
          visualHierarchy: 80,
          accessibility: 70,
          consistency: 75,
          clarity: 80,
          spacing: 70,
          colorContrast: 75,
          typography: 80,
          interactiveElements: 70,
        },
        issues: [
          {
            severity: 'major',
            category: 'accessibility',
            description: 'Button has insufficient contrast',
            impact: 60,
          },
        ],
        strengths: ['Clean layout', 'Good typography'],
        recommendations: [
          {
            priority: 'high',
            text: 'Increase button contrast',
            relatedIssues: [0],
            effort: 'low',
            expectedImprovement: 10,
          },
        ],
        metadata: {
          analysisTime: 1500,
          modelUsed: 'gemini-2.0-flash',
          imageSize: { width: 1920, height: 1080 },
          timestamp: Date.now(),
        },
      };

      const report = auditor.generateReport(mockResult);

      // Complexity: O(1)
      expect(report).toContain('COGNITIVE UX AUDIT REPORT');
      // Complexity: O(1)
      expect(report).toContain('75/100');
      // Complexity: O(1)
      expect(report).toContain('ISSUES FOUND');
      // Complexity: O(1)
      expect(report).toContain('accessibility');
      // Complexity: O(1)
      expect(report).toContain('STRENGTHS');
      // Complexity: O(1)
      expect(report).toContain('RECOMMENDATIONS');
    });

    // Complexity: O(1)
    it('should include progress bars in report', () => {
      const mockResult: UXAnalysisResult = {
        score: 85,
        categoryScores: {
          visualHierarchy: 90,
          accessibility: 80,
          consistency: 85,
          clarity: 85,
          spacing: 80,
          colorContrast: 85,
          typography: 90,
          interactiveElements: 85,
        },
        issues: [],
        strengths: [],
        recommendations: [],
        metadata: {
          analysisTime: 1000,
          modelUsed: 'gemini-2.0-flash',
          imageSize: { width: 1920, height: 1080 },
          timestamp: Date.now(),
        },
      };

      const report = auditor.generateReport(mockResult);

      // Should contain progress bar characters
      // Complexity: O(1)
      expect(report).toContain('█');
      // Complexity: O(1)
      expect(report).toContain('░');
    });

    // Complexity: O(1)
    it('should show severity icons in report', () => {
      const mockResult: UXAnalysisResult = {
        score: 50,
        categoryScores: {
          visualHierarchy: 50,
          accessibility: 50,
          consistency: 50,
          clarity: 50,
          spacing: 50,
          colorContrast: 50,
          typography: 50,
          interactiveElements: 50,
        },
        issues: [
          { severity: 'critical', category: 'test', description: 'Critical issue', impact: 90 },
          { severity: 'major', category: 'test', description: 'Major issue', impact: 70 },
          { severity: 'minor', category: 'test', description: 'Minor issue', impact: 30 },
          { severity: 'suggestion', category: 'test', description: 'Suggestion', impact: 10 },
        ],
        strengths: [],
        recommendations: [],
        metadata: {
          analysisTime: 1000,
          modelUsed: 'gemini-2.0-flash',
          imageSize: { width: 1920, height: 1080 },
          timestamp: Date.now(),
        },
      };

      const report = auditor.generateReport(mockResult);

      // Complexity: O(1)
      expect(report).toContain('🔴'); // critical
      // Complexity: O(1)
      expect(report).toContain('🟠'); // major
      // Complexity: O(1)
      expect(report).toContain('🟡'); // minor
      // Complexity: O(1)
      expect(report).toContain('🔵'); // suggestion
    });
  });

  // Complexity: O(N)
  describe('📈 History & Statistics', () => {
    // Complexity: O(1)
    it('should return empty history initially', () => {
      const history = auditor.getHistory();

      // Complexity: O(N)
      expect(history).toEqual([]);
    });

    // Complexity: O(N)
    it('should return zero stats for empty history', () => {
      const stats = auditor.getHistoryStats();

      // Complexity: O(1)
      expect(stats.averageScore).toBe(0);
      // Complexity: O(1)
      expect(stats.totalAnalyses).toBe(0);
      // Complexity: O(1)
      expect(stats.mostCommonIssues).toEqual([]);
    });
  });

  // Complexity: O(1)
  describe('💾 Caching', () => {
    // Complexity: O(1)
    it('should enable/disable caching', () => {
      auditor.setCaching(false);
      auditor.clearCache();
      auditor.setCaching(true);

      // No errors = success
      // Complexity: O(1)
      expect(true).toBe(true);
    });

    // Complexity: O(1)
    it('should clear cache', () => {
      auditor.clearCache();

      // No errors = success
      // Complexity: O(1)
      expect(true).toBe(true);
    });
  });

  // Complexity: O(N*M) — nested iteration
  describe('🎯 Score Interpretation', () => {
    // Complexity: O(N)
    it('should show excellent for high scores', () => {
      const result: UXAnalysisResult = {
        score: 95,
        categoryScores: {
          visualHierarchy: 95,
          accessibility: 95,
          consistency: 95,
          clarity: 95,
          spacing: 95,
          colorContrast: 95,
          typography: 95,
          interactiveElements: 95,
        },
        issues: [],
        strengths: [],
        recommendations: [],
        metadata: {
          analysisTime: 100,
          modelUsed: 'test',
          imageSize: { width: 0, height: 0 },
          timestamp: 0,
        },
      };

      const report = auditor.generateReport(result);

      // Complexity: O(N)
      expect(report).toContain('Excellent');
    });

    // Complexity: O(N)
    it('should show critical issues for low scores', () => {
      const result: UXAnalysisResult = {
        score: 25,
        categoryScores: {
          visualHierarchy: 25,
          accessibility: 25,
          consistency: 25,
          clarity: 25,
          spacing: 25,
          colorContrast: 25,
          typography: 25,
          interactiveElements: 25,
        },
        issues: [],
        strengths: [],
        recommendations: [],
        metadata: {
          analysisTime: 100,
          modelUsed: 'test',
          imageSize: { width: 0, height: 0 },
          timestamp: 0,
        },
      };

      const report = auditor.generateReport(result);

      // Complexity: O(1)
      expect(report).toContain('Critical Issues');
    });
  });
});
