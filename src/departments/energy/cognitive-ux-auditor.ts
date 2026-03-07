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

import { EventEmitter } from 'events';

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 COGNITIVE UX AUDITOR - AI-Powered Interface Analysis
// ═══════════════════════════════════════════════════════════════════════════════
// Uses Gemini 2.0 Flash Vision to analyze UI screenshots and provide UX insights
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * UX Analysis Result
 */
export interface UXAnalysisResult {
    /** Overall UX score (0-100) */
    score: number;

    /** Detailed category scores */
    categoryScores: {
        visualHierarchy: number;
        accessibility: number;
        consistency: number;
        clarity: number;
        spacing: number;
        colorContrast: number;
        typography: number;
        interactiveElements: number;
    };

    /** Identified UX issues */
    issues: UXIssue[];

    /** Positive UX aspects */
    strengths: string[];

    /** Actionable recommendations */
    recommendations: UXRecommendation[];

    /** Analysis metadata */
    metadata: {
        analysisTime: number;
        modelUsed: string;
        imageSize: { width: number; height: number };
        timestamp: number;
    };
}

/**
 * UX Issue identified in the interface
 */
export interface UXIssue {
    /** Issue severity */
    severity: 'critical' | 'major' | 'minor' | 'suggestion';

    /** Issue category */
    category: string;

    /** Human-readable description */
    description: string;

    /** Location in the UI (if applicable) */
    location?: {
        x: number;
        y: number;
        width: number;
        height: number;
        element?: string;
    };

    /** WCAG guideline reference (if applicable) */
    wcagReference?: string;

    /** Estimated impact on user experience (0-100) */
    impact: number;
}

/**
 * UX Recommendation
 */
export interface UXRecommendation {
    /** Priority level */
    priority: 'high' | 'medium' | 'low';

    /** Recommendation text */
    text: string;

    /** Related issues */
    relatedIssues: number[];

    /** Estimated effort to implement */
    effort: 'low' | 'medium' | 'high';

    /** Expected improvement in UX score */
    expectedImprovement: number;
}

/**
 * Gemini API Configuration
 */
export interface GeminiConfig {
    apiKey: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
}

/**
 * UX Analysis prompt template
 */
const UX_ANALYSIS_PROMPT = `You are an expert UX auditor analyzing a screenshot of a web interface. Analyze the image and provide a comprehensive UX assessment.

Evaluate the following aspects on a scale of 0-100:
1. Visual Hierarchy - Is the content prioritized correctly?
2. Accessibility - Does it appear accessible to users with disabilities?
3. Consistency - Are design elements consistent throughout?
4. Clarity - Is the purpose and function of elements clear?
5. Spacing - Is whitespace used effectively?
6. Color Contrast - Are text and elements readable?
7. Typography - Is the text legible and well-organized?
8. Interactive Elements - Are buttons, links clearly identifiable?

For each issue found, specify:
- Severity (critical/major/minor/suggestion)
- Category (accessibility, usability, visual, layout, etc.)
- Description with specific details
- Approximate location if visible
- WCAG reference if applicable
- Impact score (0-100)

Respond in this exact JSON format:
{
  "overallScore": <number>,
  "categoryScores": {
    "visualHierarchy": <number>,
    "accessibility": <number>,
    "consistency": <number>,
    "clarity": <number>,
    "spacing": <number>,
    "colorContrast": <number>,
    "typography": <number>,
    "interactiveElements": <number>
  },
  "issues": [
    {
      "severity": "<string>",
      "category": "<string>",
      "description": "<string>",
      "location": { "x": <number>, "y": <number>, "element": "<string>" },
      "wcagReference": "<string or null>",
      "impact": <number>
    }
  ],
  "strengths": ["<string>"],
  "recommendations": [
    {
      "priority": "<string>",
      "text": "<string>",
      "effort": "<string>",
      "expectedImprovement": <number>
    }
  ]
}`;

/**
 * 🧠 CognitiveUXAuditor - AI-Powered UX Analysis Engine
 *
 * Leverages Gemini 2.0 Flash Vision to perform deep analysis of UI screenshots
 * and provide actionable UX insights.
 */
export class CognitiveUXAuditor extends EventEmitter {
    private config: GeminiConfig | null = null;
    private analysisHistory: UXAnalysisResult[] = [];
    private cacheEnabled: boolean = true;
    private cache: Map<string, UXAnalysisResult> = new Map();

    constructor(config?: GeminiConfig) {
        super();
        if (config) {
            this.configure(config);
        }
    }

    /**
     * Configure the Gemini API connection
     */
    // Complexity: O(1)
    configure(config: GeminiConfig): void {
        this.config = {
            model: 'gemini-2.0-flash',
            maxTokens: 4096,
            temperature: 0.3,
            ...config
        };

        this.emit('configured', { model: this.config.model });
    }

    /**
     * Analyze a screenshot for UX issues
     */
    // Complexity: O(1)
    async analyzeScreenshot(
        screenshot: Buffer | string,
        context?: {
            pageUrl?: string;
            pageName?: string;
            targetPersona?: string;
        }
    ): Promise<UXAnalysisResult> {
        if (!this.config) {
            throw new Error('CognitiveUXAuditor not configured. Call configure() first.');
        }

        const startTime = Date.now();

        // Convert buffer to base64 if needed
        const imageBase64 = Buffer.isBuffer(screenshot)
            ? screenshot.toString('base64')
            : screenshot;

        // Check cache
        const cacheKey = this.generateCacheKey(imageBase64);
        if (this.cacheEnabled && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey)!;
            this.emit('cache-hit', { cacheKey });
            return cached;
        }

        this.emit('analysis-started', { context });

        try {
            // Call Gemini API
            const response = await this.callGeminiVision(imageBase64, context);

            // Parse and validate response
            const result = this.parseGeminiResponse(response, startTime);

            // Cache result
            if (this.cacheEnabled) {
                this.cache.set(cacheKey, result);
            }

            // Store in history
            this.analysisHistory.push(result);

            this.emit('analysis-completed', {
                score: result.score,
                issueCount: result.issues.length,
                duration: result.metadata.analysisTime
            });

            return result;

        } catch (error) {
            this.emit('analysis-error', { error });
            throw error;
        }
    }

    /**
     * Call Gemini Vision API
     */
    // Complexity: O(1)
    private async callGeminiVision(
        imageBase64: string,
        context?: { pageUrl?: string; pageName?: string; targetPersona?: string }
    ): Promise<string> {
        if (!this.config) {
            throw new Error('Not configured');
        }

        const contextPrompt = context
            ? `\n\nContext:\n- Page URL: ${context.pageUrl || 'Unknown'}\n- Page Name: ${context.pageName || 'Unknown'}\n- Target Persona: ${context.targetPersona || 'General user'}`
//             : ';

//         const fullPrompt = UX_ANALYSIS_PROMPT + contextPrompt;

        // Construct API request
//         const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`;

//         const requestBody = {
//             contents: [{
//                 parts: [
//                     { text: fullPrompt },
//                     {
//                         inlineData: {
//                             mimeType: 'image/png',
//                             data: imageBase64
//                         }
//                     }
//                 ]
//             }],
//             generationConfig: {
//                 maxOutputTokens: this.config.maxTokens,
//                 temperature: this.config.temperature
//             }
//         };

        // SAFETY: async operation — wrap in try-catch for production resilience
//         const response = await fetch(apiUrl, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(requestBody)
//         });

//         if (!response.ok) {
            // SAFETY: async operation — wrap in try-catch for production resilience
//             const errorText = await response.text();
//             throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
//         }

        // SAFETY: async operation — wrap in try-catch for production resilience
//         const data = await response.json() as {
//             candidates?: Array<{
//                 content?: {
//                     parts?: Array<{ text?: string }>;
//                 };
//             }>;
//         };

        // Extract text from response
//         const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
//         if (!text) {
//             throw new Error('No response text from Gemini API');
//         }

//         return text;
//     }

    /**
     * Parse Gemini response into structured result
     */
    // Complexity: O(N) — linear iteration
//     private parseGeminiResponse(
//         response: string,
//         startTime: number
//     ): UXAnalysisResult {
        // Extract JSON from response (handle markdown code blocks)
//         let jsonStr = response;
//         const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
//         if (jsonMatch) {
//             jsonStr = jsonMatch[1];
//         }

//         try {
//             const parsed = JSON.parse(jsonStr) as {
//                 overallScore?: number;
//                 categoryScores?: {
//                     visualHierarchy?: number;
//                     accessibility?: number;
//                     consistency?: number;
//                     clarity?: number;
//                     spacing?: number;
//                     colorContrast?: number;
//                     typography?: number;
//                     interactiveElements?: number;
//                 };
//                 issues?: Array<{
//                     severity?: string;
//                     category?: string;
//                     description?: string;
//                     location?: { x?: number; y?: number; width?: number; height?: number; element?: string };
//                     wcagReference?: string;
//                     impact?: number;
//                 }>;
//                 strengths?: string[];
//                 recommendations?: Array<{
//                     priority?: string;
//                     text?: string;
//                     effort?: string;
//                     expectedImprovement?: number;
//                 }>;
//             };

//             return {
//                 score: parsed.overallScore || 50,
//                 categoryScores: {
//                     visualHierarchy: parsed.categoryScores?.visualHierarchy || 50,
//                     accessibility: parsed.categoryScores?.accessibility || 50,
//                     consistency: parsed.categoryScores?.consistency || 50,
//                     clarity: parsed.categoryScores?.clarity || 50,
//                     spacing: parsed.categoryScores?.spacing || 50,
//                     colorContrast: parsed.categoryScores?.colorContrast || 50,
//                     typography: parsed.categoryScores?.typography || 50,
//                     interactiveElements: parsed.categoryScores?.interactiveElements || 50
//                 },
//                 issues: (parsed.issues || []).map((issue, index) => ({
//                     severity: (issue.severity as UXIssue['severity']) || 'minor',
//                     category: issue.category || 'general',
//                     description: issue.description || 'Unknown issue',
//                     location: issue.location ? {
//                         x: issue.location.x || 0,
//                         y: issue.location.y || 0,
//                         width: issue.location.width || 100,
//                         height: issue.location.height || 100,
//                         element: issue.location.element
//                     } : undefined,
//                     wcagReference: issue.wcagReference,
//                     impact: issue.impact || 30
//                 })),
//                 strengths: parsed.strengths || [],
//                 recommendations: (parsed.recommendations || []).map((rec, index) => ({
//                     priority: (rec.priority as UXRecommendation['priority']) || 'medium',
//                     text: rec.text || ',
//                     relatedIssues: [],
//                     effort: (rec.effort as UXRecommendation['effort']) || 'medium',
//                     expectedImprovement: rec.expectedImprovement || 5
//                 })),
//                 metadata: {
//                     analysisTime: Date.now() - startTime,
//                     modelUsed: this.config?.model || 'unknown',
//                     imageSize: { width: 0, height: 0 },
//                     timestamp: Date.now()
//                 }
//             };

//         } catch (parseError) {
            // Return default result if parsing fails
//             this.emit('parse-warning', { error: parseError, rawResponse: response });

//             return {
//                 score: 50,
//                 categoryScores: {
//                     visualHierarchy: 50,
//                     accessibility: 50,
//                     consistency: 50,
//                     clarity: 50,
//                     spacing: 50,
//                     colorContrast: 50,
//                     typography: 50,
//                     interactiveElements: 50
//                 },
//                 issues: [{
//                     severity: 'suggestion',
//                     category: 'analysis',
//                     description: 'Unable to parse full analysis. Manual review recommended.',
//                     impact: 10
//                 }],
//                 strengths: [],
//                 recommendations: [],
//                 metadata: {
//                     analysisTime: Date.now() - startTime,
//                     modelUsed: this.config?.model || 'unknown',
//                     imageSize: { width: 0, height: 0 },
//                     timestamp: Date.now()
//                 }
//             };
//         }
//     }

    /**
     * Analyze multiple screenshots and compare
     */
    // Complexity: O(1)
//     async compareScreenshots(
//         screenshots: Array<{ buffer: Buffer; name: string }>
//     ): Promise<{
//         results: Array<{ name: string; result: UXAnalysisResult }>;
//         comparison: {
//             best: string;
//             worst: string;
//             averageScore: number;
//             commonIssues: string[];
//         };
//     }> {
//         const results: Array<{ name: string; result: UXAnalysisResult }> = [];

//         for (const screenshot of screenshots) {
            // SAFETY: async operation — wrap in try-catch for production resilience
//             const result = await this.analyzeScreenshot(screenshot.buffer, {
//                 pageName: screenshot.name
//             });
//             results.push({ name: screenshot.name, result });
//         }

        // Calculate comparison metrics
//         const scores = results.map(r => r.result.score);
//         const maxScore = Math.max(...scores);
//         const minScore = Math.min(...scores);
//         const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

//         const best = results.find(r => r.result.score === maxScore)!.name;
//         const worst = results.find(r => r.result.score === minScore)!.name;

        // Find common issues
//         const allIssues = results.flatMap(r => r.result.issues.map(i => i.category));
//         const issueCounts = allIssues.reduce((acc, issue) => {
//             acc[issue] = (acc[issue] || 0) + 1;
//             return acc;
//         }, {} as Record<string, number>);

//         const commonIssues = Object.entries(issueCounts)
//             .filter(([_, count]) => count > 1)
//             .map(([issue]) => issue);

//         return {
//             results,
//             comparison: {
//                 best,
//                 worst,
//                 averageScore: Math.round(avgScore),
//                 commonIssues
//             }
//         };
//     }

    /**
     * Generate a human-readable UX report
     */
    // Complexity: O(N*M) — nested iteration detected
//     generateReport(result: UXAnalysisResult): string {
//         const lines: string[] = [];

//         lines.push('═══════════════════════════════════════════════════════════════════════════════');
//         lines.push('                    🧠 COGNITIVE UX AUDIT REPORT                              ');
//         lines.push('═══════════════════════════════════════════════════════════════════════════════');
//         lines.push(');
//         lines.push(`📊 OVERALL UX SCORE: ${result.score}/100 ${this.getScoreEmoji(result.score)}`);
//         lines.push(');
//         lines.push('────────────────────────────────────────────────────────────────────────────────');
//         lines.push('CATEGORY BREAKDOWN:');
//         lines.push('────────────────────────────────────────────────────────────────────────────────');

//         const categories = [
//             ['Visual Hierarchy', result.categoryScores.visualHierarchy],
//             ['Accessibility', result.categoryScores.accessibility],
//             ['Consistency', result.categoryScores.consistency],
//             ['Clarity', result.categoryScores.clarity],
//             ['Spacing', result.categoryScores.spacing],
//             ['Color Contrast', result.categoryScores.colorContrast],
//             ['Typography', result.categoryScores.typography],
//             ['Interactive Elements', result.categoryScores.interactiveElements]
//         ] as const;

//         for (const [name, score] of categories) {
//             const bar = this.generateProgressBar(score);
//             lines.push(`${name.padEnd(22)} ${bar} ${score}/100`);
//         }

//         lines.push(');

//         if (result.issues.length > 0) {
//             lines.push('────────────────────────────────────────────────────────────────────────────────');
//             lines.push(`⚠️  ISSUES FOUND (${result.issues.length}):`);
//             lines.push('────────────────────────────────────────────────────────────────────────────────');

//             const sortedIssues = [...result.issues].sort((a, b) => b.impact - a.impact);

//             for (const issue of sortedIssues) {
//                 const severityIcon = {
//                     critical: '🔴',
//                     major: '🟠',
//                     minor: '🟡',
//                     suggestion: '🔵'
//                 }[issue.severity];

//                 lines.push(`${severityIcon} [${issue.severity.toUpperCase()}] ${issue.category}`);
//                 lines.push(`   ${issue.description}`);
//                 if (issue.wcagReference) {
//                     lines.push(`   📋 WCAG: ${issue.wcagReference}`);
//                 }
//                 lines.push(`   💥 Impact: ${issue.impact}/100`);
//                 lines.push(');
//             }
//         }

//         if (result.strengths.length > 0) {
//             lines.push('────────────────────────────────────────────────────────────────────────────────');
//             lines.push('✅ STRENGTHS:');
//             lines.push('────────────────────────────────────────────────────────────────────────────────');

//             for (const strength of result.strengths) {
//                 lines.push(`  • ${strength}`);
//             }
//             lines.push(');
//         }

//         if (result.recommendations.length > 0) {
//             lines.push('────────────────────────────────────────────────────────────────────────────────');
//             lines.push('💡 RECOMMENDATIONS:');
//             lines.push('────────────────────────────────────────────────────────────────────────────────');

//             for (const rec of result.recommendations) {
//                 const priorityIcon = {
//                     high: '🔥',
//                     medium: '⚡',
//                     low: '💤'
//                 }[rec.priority];

//                 lines.push(`${priorityIcon} [${rec.priority.toUpperCase()}] ${rec.text}`);
//                 lines.push(`   Effort: ${rec.effort} | Expected improvement: +${rec.expectedImprovement} points`);
//                 lines.push(');
//             }
//         }

//         lines.push('═══════════════════════════════════════════════════════════════════════════════');
// //         lines.push(`Analysis completed in ${result.metadata.analysisTime}ms using ${result.metadata.modelUsed}`);
//         lines.push('═══════════════════════════════════════════════════════════════════════════════');

//         return lines.join('\n');
//     }

    /**
     * Get emoji for score range
     */
    // Complexity: O(1)
//     private getScoreEmoji(score: number): string {
//         if (score >= 90) return '🏆 Excellent!';
//         if (score >= 75) return '✨ Good';
//         if (score >= 60) return '👍 Acceptable';
//         if (score >= 40) return '⚠️ Needs Improvement';
//         return '🚨 Critical Issues';
//     }

    /**
     * Generate ASCII progress bar
     */
    // Complexity: O(1)
//     private generateProgressBar(score: number): string {
//         const filled = Math.floor(score / 5);
//         const empty = 20 - filled;
//         return '█'.repeat(filled) + '░'.repeat(empty);
//     }

    /**
     * Generate cache key for image
     */
    // Complexity: O(N) — linear iteration
//     private generateCacheKey(imageBase64: string): string {
        // Simple hash of first 1000 chars
//         let hash = 0;
//         const sample = imageBase64.substring(0, 1000);
//         for (let i = 0; i < sample.length; i++) {
//             const char = sample.charCodeAt(i);
//             hash = ((hash << 5) - hash) + char;
//             hash = hash & hash;
//         }
// //         return `ux-analysis-${hash}`;
//     }

    /**
     * Enable/disable caching
     */
    // Complexity: O(1)
//     setCaching(enabled: boolean): void {
//         this.cacheEnabled = enabled;
//         if (!enabled) {
//             this.cache.clear();
//         }
//     }

    /**
     * Clear cache
     */
    // Complexity: O(1)
//     clearCache(): void {
//         this.cache.clear();
//     }

    /**
     * Get analysis history
     */
    // Complexity: O(1)
//     getHistory(): UXAnalysisResult[] {
//         return [...this.analysisHistory];
//     }

    /**
     * Get average scores from history
     */
    // Complexity: O(N*M) — nested iteration detected
//     getHistoryStats(): {
//         averageScore: number;
//         totalAnalyses: number;
//         mostCommonIssues: Array<{ category: string; count: number }>;
//     } {
//         if (this.analysisHistory.length === 0) {
//             return {
//                 averageScore: 0,
//                 totalAnalyses: 0,
//                 mostCommonIssues: []
//             };
//         }

//         const avgScore = this.analysisHistory.reduce((sum, r) => sum + r.score, 0)
//             / this.analysisHistory.length;

//         const issueCounts: Record<string, number> = {};
//         for (const result of this.analysisHistory) {
//             for (const issue of result.issues) {
//                 issueCounts[issue.category] = (issueCounts[issue.category] || 0) + 1;
//             }
//         }

//         const mostCommonIssues = Object.entries(issueCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
//             .map(([category, count]) => ({ category, count }));

//         return {
//             averageScore: Math.round(avgScore),
//             totalAnalyses: this.analysisHistory.length,
//             mostCommonIssues
//         };
//     }
// }

// Export singleton instance
// export const cognitiveUXAuditor = new CognitiveUXAuditor();
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 