"use strict";
/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                               ║
 * ║    ██████╗ █████╗ ██████╗ ██╗     ███████╗                                                    ║
 * ║   ██╔════╝██╔══██╗██╔══██╗██║     ██╔════╝                                                    ║
 * ║   ██║     ███████║██████╔╝██║     █████╗                                                      ║
 * ║   ██║     ██╔══██║██╔══██╗██║     ██╔══╝                                                      ║
 * ║   ╚██████╗██║  ██║██████╔╝███████╗███████╗                                                    ║
 * ║    ╚═════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝                                                    ║
 * ║                                                                                               ║
 * ║   ███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗                                       ║
 * ║   ██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║                                       ║
 * ║   ███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║                                       ║
 * ║   ╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║                                       ║
 * ║   ███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║                                       ║
 * ║   ╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝                                       ║
 * ║                                                                                               ║
 * ║   КАБЕЛНА СИСТЕМА - Свързва класовете като нервна система                                     ║
 * ║                                                                                               ║
 * ║   "Когато кабел се скъса, веднага знаем къде е проблемът."                                    ║
 * ║                                                                                               ║
 * ║   Created: 2026-01-02 | QAntum Empire                                                         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CableSystem = void 0;
exports.getCableSystem = getCableSystem;
const events_1 = require("events");
const ModuleClasses_1 = require("../ModuleClasses");
// ═══════════════════════════════════════════════════════════════════════════════
// CABLE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════
const CABLE_DEFINITIONS = [
    // PHYSICS е основата - захранва всичко
    { from: 'PHYSICS', to: 'OMEGA', type: 'power' },
    { from: 'PHYSICS', to: 'INTELLIGENCE', type: 'power' },
    { from: 'PHYSICS', to: 'BIOLOGY', type: 'power' },
    { from: 'PHYSICS', to: 'FORTRESS', type: 'power' },
    // OMEGA командва
    { from: 'OMEGA', to: 'GUARDIANS', type: 'power' },
    { from: 'OMEGA', to: 'INTELLIGENCE', type: 'sync' },
    { from: 'OMEGA', to: 'REALITY', type: 'sync' },
    // INTELLIGENCE анализира
    { from: 'INTELLIGENCE', to: 'GUARDIANS', type: 'data' },
    { from: 'INTELLIGENCE', to: 'BIOLOGY', type: 'data' },
    { from: 'INTELLIGENCE', to: 'OMEGA', type: 'event' },
    // FORTRESS защитава
    { from: 'FORTRESS', to: 'OMEGA', type: 'sync' },
    { from: 'FORTRESS', to: 'REALITY', type: 'power' },
    // BIOLOGY еволюира
    { from: 'BIOLOGY', to: 'INTELLIGENCE', type: 'event' },
    // GUARDIANS наблюдават всичко
    { from: 'GUARDIANS', to: 'OMEGA', type: 'health' },
    { from: 'GUARDIANS', to: 'INTELLIGENCE', type: 'health' },
    { from: 'GUARDIANS', to: 'PHYSICS', type: 'health' },
    { from: 'GUARDIANS', to: 'FORTRESS', type: 'health' },
    { from: 'GUARDIANS', to: 'BIOLOGY', type: 'health' },
    { from: 'GUARDIANS', to: 'REALITY', type: 'health' },
    // CHEMISTRY свързва
    { from: 'CHEMISTRY', to: 'INTELLIGENCE', type: 'data' },
    { from: 'CHEMISTRY', to: 'OMEGA', type: 'data' },
    { from: 'CHEMISTRY', to: 'REALITY', type: 'data' },
    // REALITY комуникира навън
    { from: 'REALITY', to: 'INTELLIGENCE', type: 'event' },
    { from: 'REALITY', to: 'FORTRESS', type: 'sync' }
];
// ═══════════════════════════════════════════════════════════════════════════════
// CABLE MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
class CableSystem extends events_1.EventEmitter {
    cables = new Map();
    pingInterval = null;
    constructor() {
        super();
        this.initializeCables();
    }
    initializeCables() {
        for (const def of CABLE_DEFINITIONS) {
            const id = `${def.from}->${def.to}:${def.type}`;
            this.cables.set(id, {
                ...def,
                id,
                status: 'active',
                bandwidth: 100,
                latency: 0,
                lastPing: new Date(),
                errors: []
            });
        }
    }
    /**
     * Стартира мониторинг на кабелите
     */
    startMonitoring(intervalMs = 5000) {
        if (this.pingInterval)
            return;
        this.pingInterval = setInterval(() => {
            this.pingAllCables();
        }, intervalMs);
        this.emit('monitoring:started');
    }
    stopMonitoring() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
            this.emit('monitoring:stopped');
        }
    }
    /**
     * Пингва всички кабели
     */
    pingAllCables() {
        for (const cable of this.cables.values()) {
            this.pingCable(cable.id);
        }
    }
    /**
     * Пингва конкретен кабел
     */
    pingCable(cableId) {
        const cable = this.cables.get(cableId);
        if (!cable)
            return 'disconnected';
        // Симулираме ping (в реална система това би проверило реална връзка)
        const now = new Date();
        cable.latency = Math.random() * 10; // 0-10ms
        cable.lastPing = now;
        // Проверка за проблеми
        if (cable.errors.filter(e => !e.resolved).length > 0) {
            cable.status = 'degraded';
            cable.bandwidth = 50;
        }
        else {
            cable.status = 'active';
            cable.bandwidth = 100;
        }
        this.emit('cable:pinged', { cable, latency: cable.latency });
        return cable.status;
    }
    /**
     * Симулира прекъсване на кабел
     */
    breakCable(cableId, reason) {
        const cable = this.cables.get(cableId);
        if (!cable)
            return;
        cable.status = 'broken';
        cable.bandwidth = 0;
        cable.errors.push({
            timestamp: new Date(),
            type: 'break',
            message: reason,
            resolved: false
        });
        this.emit('cable:broken', { cable, reason });
        // Автоматично известяване
        console.log(`\n🔴 CABLE BROKEN: ${cableId}`);
        console.log(`   From: ${ModuleClasses_1.MODULE_CLASS_REGISTRY[cable.from].emoji} ${cable.from}`);
        console.log(`   To: ${ModuleClasses_1.MODULE_CLASS_REGISTRY[cable.to].emoji} ${cable.to}`);
        console.log(`   Type: ${cable.type}`);
        console.log(`   Reason: ${reason}\n`);
    }
    /**
     * Поправя кабел
     */
    repairCable(cableId) {
        const cable = this.cables.get(cableId);
        if (!cable)
            return false;
        // Маркираме грешките като resolved
        cable.errors.forEach(e => e.resolved = true);
        cable.status = 'active';
        cable.bandwidth = 100;
        this.emit('cable:repaired', { cable });
        console.log(`\n🟢 CABLE REPAIRED: ${cableId}`);
        return true;
    }
    /**
     * Връща всички кабели от даден клас
     */
    getCablesFrom(className) {
        return Array.from(this.cables.values())
            .filter(c => c.from === className);
    }
    /**
     * Връща всички кабели към даден клас
     */
    getCablesTo(className) {
        return Array.from(this.cables.values())
            .filter(c => c.to === className);
    }
    /**
     * Връща всички счупени кабели
     */
    getBrokenCables() {
        return Array.from(this.cables.values())
            .filter(c => c.status === 'broken' || c.status === 'degraded');
    }
    /**
     * Проверява дали клас е изолиран (няма активни входящи кабели)
     */
    isClassIsolated(className) {
        const incomingCables = this.getCablesTo(className);
        const activeCables = incomingCables.filter(c => c.status === 'active');
        return activeCables.length === 0 && incomingCables.length > 0;
    }
    /**
     * Генерира доклад за състоянието на кабелите
     */
    generateReport() {
        const allCables = Array.from(this.cables.values());
        const active = allCables.filter(c => c.status === 'active');
        const degraded = allCables.filter(c => c.status === 'degraded');
        const broken = allCables.filter(c => c.status === 'broken');
        const avgLatency = active.reduce((sum, c) => sum + c.latency, 0) / Math.max(1, active.length);
        const avgBandwidth = allCables.reduce((sum, c) => sum + c.bandwidth, 0) / allCables.length;
        return {
            timestamp: new Date(),
            totalCables: allCables.length,
            activeCables: active.length,
            degradedCables: degraded.length,
            brokenCables: broken.length,
            averageLatency: avgLatency,
            averageBandwidth: avgBandwidth,
            healthScore: (active.length / allCables.length) * 100,
            isolatedClasses: this.getIsolatedClasses(),
            cables: allCables
        };
    }
    getIsolatedClasses() {
        const classNames = Object.keys(ModuleClasses_1.MODULE_CLASS_REGISTRY);
        return classNames.filter(c => this.isClassIsolated(c));
    }
    /**
     * Визуализира кабелната система
     */
    visualize() {
        const report = this.generateReport();
        let output = '\n╔═══════════════════════════════════════════════════════════════════════════════╗\n';
        output += '║                         🔌 CABLE SYSTEM STATUS 🔌                              ║\n';
        output += '╠═══════════════════════════════════════════════════════════════════════════════╣\n';
        output += `║  Total Cables: ${report.totalCables.toString().padEnd(5)} │ Active: ${report.activeCables.toString().padEnd(3)} │ Degraded: ${report.degradedCables.toString().padEnd(3)} │ Broken: ${report.brokenCables.toString().padEnd(3)} ║\n`;
        output += `║  Avg Latency: ${report.averageLatency.toFixed(2).padEnd(6)}ms │ Bandwidth: ${report.averageBandwidth.toFixed(0).padEnd(3)}% │ Health: ${report.healthScore.toFixed(0).padEnd(3)}%       ║\n`;
        output += '╠═══════════════════════════════════════════════════════════════════════════════╣\n';
        // Group by type
        const byType = {
            power: [],
            data: [],
            event: [],
            sync: [],
            health: []
        };
        for (const cable of report.cables) {
            byType[cable.type].push(cable);
        }
        const typeEmoji = {
            power: '⚡',
            data: '📊',
            event: '🔔',
            sync: '🔄',
            health: '💓'
        };
        for (const [type, cables] of Object.entries(byType)) {
            const active = cables.filter(c => c.status === 'active').length;
            output += `║  ${typeEmoji[type]} ${type.toUpperCase().padEnd(8)} │ ${active}/${cables.length} active `.padEnd(76) + '║\n';
        }
        if (report.brokenCables > 0) {
            output += '╠═══════════════════════════════════════════════════════════════════════════════╣\n';
            output += '║  🔴 BROKEN CABLES:                                                            ║\n';
            for (const cable of report.cables.filter(c => c.status === 'broken')) {
                output += `║     ${cable.from} → ${cable.to} (${cable.type})`.padEnd(76) + '║\n';
            }
        }
        if (report.isolatedClasses.length > 0) {
            output += '╠═══════════════════════════════════════════════════════════════════════════════╣\n';
            output += '║  ⚠️ ISOLATED CLASSES:                                                          ║\n';
            for (const cls of report.isolatedClasses) {
                output += `║     ${ModuleClasses_1.MODULE_CLASS_REGISTRY[cls].emoji} ${cls}`.padEnd(76) + '║\n';
            }
        }
        output += '╚═══════════════════════════════════════════════════════════════════════════════╝\n';
        return output;
    }
}
exports.CableSystem = CableSystem;
// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════
let cableSystemInstance = null;
function getCableSystem() {
    if (!cableSystemInstance) {
        cableSystemInstance = new CableSystem();
    }
    return cableSystemInstance;
}
// ═══════════════════════════════════════════════════════════════════════════════
// CLI TEST
// ═══════════════════════════════════════════════════════════════════════════════
if (require.main === module) {
    const system = getCableSystem();
    console.log(system.visualize());
    // Test cable break
    console.log('Testing cable break...');
    system.breakCable('PHYSICS->OMEGA:power', 'Test break');
    console.log(system.visualize());
    // Test repair
    console.log('Repairing cable...');
    system.repairCable('PHYSICS->OMEGA:power');
    console.log(system.visualize());
}
