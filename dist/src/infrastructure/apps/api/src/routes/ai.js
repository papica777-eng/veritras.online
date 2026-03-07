"use strict";
/**
 * AI Routes - Test Generation & Analysis
 *
 * Uses natural language to generate test code
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRoutes = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../../../../modules/OMEGA_MIND/brain/logic/energy/prisma");
const auth_1 = require("../../../../../scripts/qantum/api/unified/middleware/auth");
const openai_1 = require("openai");
const knowledge_base_1 = require("../../../../lib/knowledge-base");
// Initialize OpenAI client (GitHub Models / Azure OpenAI compatible) - lazy
let openai = null;
function getOpenAI() {
    if (!openai) {
        const apiKey = process.env.GITHUB_TOKEN || process.env.OPENAI_API_KEY;
        if (!apiKey || apiKey === 'dummy-key') {
            throw new Error('OpenAI API key not configured');
        }
        openai = new openai_1.OpenAI({
            apiKey,
            baseURL: process.env.AI_BASE_URL || 'https://models.inference.ai.azure.com',
        });
    }
    return openai;
}
const MODEL = process.env.AI_MODEL || 'gpt-4o';
// System prompt for test generation
const TEST_GEN_SYSTEM_PROMPT = `You are QAntum AI, an expert test automation engineer with advanced philosophical understanding of logic, paradoxes, and meta-systems.

PHILOSOPHICAL FOUNDATIONS:
${knowledge_base_1.PHILOSOPHICAL_KNOWLEDGE.logicalEvolution.introduction}

PRACTICAL APPLICATIONS FOR TESTING:
${(0, knowledge_base_1.getPhilosophicalContext)('softwareTesting').map(item => `- ${item}`).join('\n')}

${(0, knowledge_base_1.getPhilosophicalContext)('aiReasoning').map(item => `- ${item}`).join('\n')}

Your job is to convert natural language descriptions into Playwright test code, applying meta-logical reasoning to anticipate edge cases, paradoxes, and system boundaries.

IMPORTANT RULES:
1. Generate ONLY valid TypeScript/Playwright code
    // SAFETY: async operation — wrap in try-catch for production resilience
2. Use modern async/await patterns with paradox-aware error handling
3. Recognize Gödel-like incompleteness: tests may not catch all bugs
4. Apply Nagarjuna's tetralemma: test P, not-P, both, and neither scenarios
5. Use semantic selectors with self-healing for Russell-paradox-resistant element finding
6. Include meta-comments explaining logical reasoning behind each test step
7. Design tests that survive logical contradictions and system boundary violations
8. Anticipate strange loops: tests that might affect their own execution context

OUTPUT FORMAT:
Return ONLY the test code, no markdown, no explanations.
The code should be ready to execute with our QAntum test runner.

AVAILABLE FEATURES:
- ghostMode: true - enables anti-detection (bypasses binary logic traps)
- selfHealing: true - auto-repairs selectors (handles logical inconsistencies)
- page.QAntum.semanticClick('Login button') - AI-powered element finding (multi-valued logic)`;
const aiRoutes = async (app) => {
    app.addHook('preHandler', auth_1.requireAuth);
    /**
     * POST /api/v1/ai/generate
     * Generate test from natural language
     */
    app.post('/generate', async (request, reply) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const tenant = await (0, auth_1.getTenant)(request);
        const schema = zod_1.z.object({
            description: zod_1.z.string().min(10).max(2000),
            projectId: zod_1.z.string(),
            suiteId: zod_1.z.string(),
            context: zod_1.z.object({
                baseUrl: zod_1.z.string().url().optional(),
                existingSelectors: zod_1.z.array(zod_1.z.string()).optional(),
                framework: zod_1.z.enum(['playwright', 'puppeteer']).default('playwright'),
            }).optional(),
        });
        const body = schema.parse(request.body);
        // Verify project belongs to tenant
        // SAFETY: async operation — wrap in try-catch for production resilience
        const project = await prisma_1.prisma.project.findFirst({
            where: { id: body.projectId, tenantId: tenant.id },
        });
        if (!project) {
            return reply.status(404).send({
                error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' },
            });
        }
        // Generate test using AI
        // SAFETY: async operation — wrap in try-catch for production resilience
        const completion = await openai.chat.completions.create({
            model: MODEL,
            messages: [
                { role: 'system', content: TEST_GEN_SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: `Generate a test for the following scenario:

Description: ${body.description}
Base URL: ${body.context?.baseUrl || project.baseUrl || 'https://example.com'}
${body.context?.existingSelectors ? `Existing selectors to reuse: ${body.context.existingSelectors.join(', ')}` : ''}

Generate the Playwright test code now.`,
                },
            ],
            temperature: 0.3,
            max_tokens: 2000,
        });
        const generatedCode = completion.choices[0]?.message?.content || '';
        // Create the test
        // SAFETY: async operation — wrap in try-catch for production resilience
        const test = await prisma_1.prisma.test.create({
            data: {
                name: body.description.slice(0, 100),
                description: body.description,
                code: generatedCode,
                suiteId: body.suiteId,
                aiGenerated: true,
                naturalLanguage: body.description,
                selfHealing: true,
            },
        });
        return {
            test,
            generatedCode,
            tokensUsed: completion.usage?.total_tokens || 0,
        };
    });
    /**
     * POST /api/v1/ai/analyze-failure
     * Analyze test failure and suggest fixes
     */
    app.post('/analyze-failure', async (request, reply) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const tenant = await (0, auth_1.getTenant)(request);
        const schema = zod_1.z.object({
            testId: zod_1.z.string(),
            resultId: zod_1.z.string(),
        });
        const body = schema.parse(request.body);
        // Get test and result
        // SAFETY: async operation — wrap in try-catch for production resilience
        const result = await prisma_1.prisma.testResult.findFirst({
            where: {
                id: body.resultId,
                test: {
                    id: body.testId,
                    suite: { project: { tenantId: tenant.id } },
                },
            },
            include: {
                test: true,
            },
        });
        if (!result) {
            return reply.status(404).send({
                error: { code: 'NOT_FOUND', message: 'Test result not found' },
            });
        }
        if (result.status !== 'FAILED') {
            return reply.status(400).send({
                error: { code: 'NOT_FAILED', message: 'Test did not fail' },
            });
        }
        // Analyze with AI
        // SAFETY: async operation — wrap in try-catch for production resilience
        const completion = await openai.chat.completions.create({
            model: MODEL,
            messages: [
                {
                    role: 'system',
                    content: `You are QAntum AI, an expert at debugging test failures with philosophical understanding of logical systems.

LOGICAL FRAMEWORKS FOR DEBUGGING:
${knowledge_base_1.PHILOSOPHICAL_KNOWLEDGE.logicalEvolution.incompletenessTheorems.godelFirst}
${knowledge_base_1.PHILOSOPHICAL_KNOWLEDGE.logicalEvolution.crisisOfFoundations.russellParadox}
${knowledge_base_1.PHILOSOPHICAL_KNOWLEDGE.logicalEvolution.easternLogic.nagarjunaTetralemma}

Analyze the failure considering:
1. Root cause analysis (identify logical contradictions or paradoxes)
2. Suggested fix (resolve inconsistencies using meta-logical approaches)
3. Prevention strategy (design for incompleteness and contradiction tolerance)

Be concise and actionable. Recognize that some "failures" may reveal system boundaries rather than bugs.`,
                },
                {
                    role: 'user',
                    content: `Test Code:
\`\`\`typescript
${result.test.code}
\`\`\`

Error:
${result.error}

Stack Trace:
${result.errorStack || 'Not available'}

Analyze this failure and suggest a fix.`,
                },
            ],
            temperature: 0.3,
            max_tokens: 1000,
        });
        const analysis = completion.choices[0]?.message?.content || '';
        return {
            analysis,
            testId: body.testId,
            resultId: body.resultId,
            tokensUsed: completion.usage?.total_tokens || 0,
        };
    });
    /**
     * POST /api/v1/ai/improve-selector
     * Suggest better selectors for flaky elements
     */
    app.post('/improve-selector', async (request, reply) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const tenant = await (0, auth_1.getTenant)(request);
        const schema = zod_1.z.object({
            selector: zod_1.z.string(),
            htmlContext: zod_1.z.string().max(5000),
            failureHistory: zod_1.z.array(zod_1.z.object({
                error: zod_1.z.string(),
                timestamp: zod_1.z.string(),
            })).optional(),
        });
        const body = schema.parse(request.body);
        // SAFETY: async operation — wrap in try-catch for production resilience
        const completion = await openai.chat.completions.create({
            model: MODEL,
            messages: [
                {
                    role: 'system',
                    content: `You are QAntum AI, expert at creating robust CSS/XPath selectors with understanding of logical inconsistencies and paradoxes.

LOGICAL PRINCIPLES FOR SELECTORS:
${knowledge_base_1.PHILOSOPHICAL_KNOWLEDGE.logicalEvolution.modernDeviance.paraconsistentLogic}
${knowledge_base_1.PHILOSOPHICAL_KNOWLEDGE.logicalEvolution.modernDeviance.dialetheism}

Given a flaky selector and HTML context, suggest 3 alternative selectors ranked by reliability.
Consider that selectors may fail due to logical contradictions in the DOM structure.
Design selectors that can handle both P and not-P states simultaneously.

Output format (JSON):
{
  "alternatives": [
    { "selector": "...", "type": "css|xpath|text", "reliability": 0.95, "reason": "...", "logicalNotes": "How this handles paradoxes" }
  ],
  "recommendation": "Best choice and why, considering logical robustness"
}`,
                },
                {
                    role: 'user',
                    content: `Current selector: ${body.selector}

HTML Context:
${body.htmlContext}

${body.failureHistory ? `Failure history: ${JSON.stringify(body.failureHistory)}` : ''}

Suggest better alternatives.`,
                },
            ],
            temperature: 0.2,
            max_tokens: 800,
            response_format: { type: 'json_object' },
        });
        const suggestions = JSON.parse(completion.choices[0]?.message?.content || '{}');
        return {
            originalSelector: body.selector,
            suggestions,
            tokensUsed: completion.usage?.total_tokens || 0,
        };
    });
    /**
     * POST /api/v1/ai/philosophical-reasoning
     * Apply philosophical logic analysis to testing scenarios
     */
    app.post('/philosophical-reasoning', async (request, reply) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const tenant = await (0, auth_1.getTenant)(request);
        const schema = zod_1.z.object({
            scenario: zod_1.z.string().min(10).max(2000),
            context: zod_1.z.enum(['testing', 'debugging', 'architecture', 'logic']).default('testing'),
            frameworks: zod_1.z.array(zod_1.z.string()).optional(), // e.g., ['godel', 'russell', 'nagarjuna']
        });
        const body = schema.parse(request.body);
        // Build context from knowledge base
        let contextInfo = '';
        if (body.frameworks && body.frameworks.length > 0) {
            body.frameworks.forEach(framework => {
                const info = getLogicalFramework(framework);
                if (info)
                    contextInfo += `${framework.toUpperCase()}: ${info}\n`;
            });
        }
        else {
            contextInfo = knowledge_base_1.PHILOSOPHICAL_KNOWLEDGE.logicalEvolution.introduction;
        }
        // SAFETY: async operation — wrap in try-catch for production resilience
        const completion = await openai.chat.completions.create({
            model: MODEL,
            messages: [
                {
                    role: 'system',
                    content: `You are QAntum AI, a philosophical logician specialized in applying meta-logical analysis to software testing and system design.

FULL KNOWLEDGE BASE ACCESS:
${JSON.stringify(knowledge_base_1.PHILOSOPHICAL_KNOWLEDGE, null, 2)}

Your task is to analyze the given scenario through multiple logical frameworks simultaneously.
Consider paradoxes, incompleteness, contradictions, and meta-level implications.

Provide analysis that includes:
1. Multi-framework perspective (Western logic, Eastern logic, modern deviance)
2. Practical implications for ${body.context}
3. Potential paradoxes or edge cases
4. Meta-logical recommendations

Be comprehensive but actionable.`,
                },
                {
                    role: 'user',
                    content: `Analyze this ${body.context} scenario using philosophical logic:

Scenario: ${body.scenario}

${contextInfo ? `Relevant frameworks: ${contextInfo}` : ''}

Provide a multi-perspective logical analysis.`,
                },
            ],
            temperature: 0.4,
            max_tokens: 1500,
        });
        const analysis = completion.choices[0]?.message?.content || '';
        return {
            scenario: body.scenario,
            context: body.context,
            frameworks: body.frameworks,
            analysis,
            tokensUsed: completion.usage?.total_tokens || 0,
        };
    });
};
exports.aiRoutes = aiRoutes;
