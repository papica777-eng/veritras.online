/**
 * 📊 Market Analyzer - Identifies profitable SaaS opportunities
 */

import { llm } from '../ai/LLMProvider';

export interface MarketOpportunity {
    niche: string;
    demandScore: number;
    competitionLevel: 'low' | 'medium' | 'high';
    estimatedMRR: number;
    suggestedFeatures: string[];
    keywords: string[];
}

export class MarketAnalyzer {
    /**
     * Find market opportunities in a niche using AI
     */
    public async findOpportunities(niche: string, keywords: string[] = []): Promise<MarketOpportunity[]> {
        console.log(`\n📊 [ANALYZER] Scanning market using AETERNA INTELLIGENCE: ${niche}`);

        const prompt = `Identify 3 highly profitable Micro-SaaS market opportunities in the niche: "${niche}".
Consider these keywords if provided: ${keywords.join(', ')}.
Output ONLY a valid JSON array of objects matching this exact structure:
[
  {
    "niche": "specific sub-niche string",
    "demandScore": 0.0 to 1.0 (float),
    "competitionLevel": "low" | "medium" | "high",
    "estimatedMRR": number (e.g. 5000),
    "suggestedFeatures": ["feature1", "feature2", "feature3"],
    "keywords": ["keyword1", "keyword2"]
  }
]`;

        try {
            const opportunities = await llm.generateJSON<MarketOpportunity[]>(prompt, { temperature: 0.8 });
            console.log(`   Found ${opportunities.length} real AI-generated opportunities.`);
            return opportunities;
        } catch (error: any) {
            console.error(`   ❌ Failed to analyze market: ${error.message}`);
            throw error;
        }
    }

    /**
     * Validate a SaaS idea using AI
     */
    public async validateIdea(name: string, description: string): Promise<{
        viable: boolean;
        score: number;
        suggestions: string[];
    }> {
        console.log(`\n🧠 [ANALYZER] Validating Micro-SaaS idea: ${name}`);

        const prompt = `Act as an expert SaaS investor and architect. Evaluate this Micro-SaaS idea:
Name: "${name}"
Description: "${description}"

Provide a viability analysis. Return ONLY valid JSON matching this exact structure:
{
    "viable": true | false,
    "score": 0.0 to 1.0 (float indicating likely success),
    "suggestions": ["improvement 1", "improvement 2", "improvement 3"]
}`;

        try {
            const result = await llm.generateJSON<{ viable: boolean; score: number; suggestions: string[] }>(prompt);
            return result;
        } catch (error: any) {
            console.error(`   ❌ Failed to validate idea: ${error.message}`);
            throw error;
        }
    }
}
