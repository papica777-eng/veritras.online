"use strict";
/**
 * Dashboard Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoutes = void 0;
const prisma_1 = require("../../../../modules/OMEGA_MIND/brain/logic/energy/prisma");
const auth_1 = require("../../../../../scripts/qantum/api/unified/middleware/auth");
const dashboardRoutes = async (app) => {
    // Apply auth middleware
    app.addHook('preHandler', auth_1.requireAuth);
    /**
     * GET /api/v1/dashboard/stats
     * Get dashboard statistics
     */
    app.get('/stats', async (request, reply) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const tenant = await (0, auth_1.getTenant)(request);
        // Get current month stats
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        // Current month runs
        // SAFETY: async operation — wrap in try-catch for production resilience
        const currentRuns = await prisma_1.prisma.testRun.findMany({
            where: {
                project: { tenantId: tenant.id },
                createdAt: { gte: startOfMonth },
            },
        });
        // Last month runs
        // SAFETY: async operation — wrap in try-catch for production resilience
        const lastMonthRuns = await prisma_1.prisma.testRun.findMany({
            where: {
                project: { tenantId: tenant.id },
                createdAt: {
                    gte: startOfLastMonth,
                    lt: endOfLastMonth,
                },
            },
        });
        const currentTotal = currentRuns.length;
        const lastTotal = lastMonthRuns.length;
        const totalRunsChange = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;
        // Calculate pass rate
        const totalTests = currentRuns.reduce((sum, run) => sum + run.totalTests, 0);
        const passedTests = currentRuns.reduce((sum, run) => sum + run.passed, 0);
        const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
        // Last month pass rate
        const lastTotalTests = lastMonthRuns.reduce((sum, run) => sum + run.totalTests, 0);
        const lastPassedTests = lastMonthRuns.reduce((sum, run) => sum + run.passed, 0);
        const lastPassRate = lastTotalTests > 0 ? (lastPassedTests / lastTotalTests) * 100 : 0;
        const passRateChange = lastPassRate > 0 ? ((passRate - lastPassRate) / lastPassRate) * 100 : 0;
        // Failed tests
        const failedTests = totalTests - passedTests;
        const lastFailedTests = lastTotalTests - lastPassedTests;
        const failedTestsChange = lastFailedTests > 0 ? ((failedTests - lastFailedTests) / lastFailedTests) * 100 : 0;
        // Healed selectors
        const healedSelectors = currentRuns.reduce((sum, run) => {
            return sum + run.results.reduce((rSum, result) => rSum + result.selectorsHealed, 0);
        }, 0);
        const lastHealedSelectors = lastMonthRuns.reduce((sum, run) => {
            return sum + run.results.reduce((rSum, result) => rSum + result.selectorsHealed, 0);
        }, 0);
        const healedSelectorsChange = lastHealedSelectors > 0 ? ((healedSelectors - lastHealedSelectors) / lastHealedSelectors) * 100 : 0;
        return {
            totalRuns: currentTotal,
            totalRunsChange,
            passRate,
            passRateChange,
            failedTests,
            failedTestsChange,
            healedSelectors,
            healedSelectorsChange,
        };
    });
};
exports.dashboardRoutes = dashboardRoutes;
