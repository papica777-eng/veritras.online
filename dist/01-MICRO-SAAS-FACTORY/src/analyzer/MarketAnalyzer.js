"use strict";
/**
 * 📊 Market Analyzer - Identifies profitable SaaS opportunities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketAnalyzer = void 0;
const LLMProvider_1 = require("../ai/LLMProvider");
class MarketAnalyzer {
    /**
     * Find market opportunities in a niche using AI
     */
    async findOpportunities(niche, keywords = []) {
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
            const opportunities = await LLMProvider_1.llm.generateJSON(prompt, { temperature: 0.8 });
            console.log(`   Found ${opportunities.length} real AI-generated opportunities.`);
            return opportunities;
        }
        catch (error) {
            console.error(`   ❌ Failed to analyze market: ${error.message}`);
            throw error;
        }
    }
    /**
     * Validate a SaaS idea using AI
     */
    async validateIdea(name, description) {
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
            const result = await LLMProvider_1.llm.generateJSON(prompt);
            return result;
        }
        catch (error) {
            console.error(`   ❌ Failed to validate idea: ${error.message}`);
            throw error;
        }
    }
}
exports.MarketAnalyzer = MarketAnalyzer;
