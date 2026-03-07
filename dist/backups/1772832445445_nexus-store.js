"use strict";
/**
 *
 *   QAntum NEXUS - CORE INTEGRATION LAYER v1.0
 *   "Безкраен цикъл на самопоправка и адаптация"
 *
 *   Connects Dashboard to:
 *    AutonomousThought.ts (Decision Flow)
 *    SupremeMeditation.ts (Meta-Insights)
 *    MegaSupremeDaemon.ts (Orchestration)
 *    PineconeContextBridge.ts (52K+ Vectors)
 *    EternalWatchdog (Self-Healing)
 *
 *    2026 QAntum Empire | Dimitar Prodromov
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAutoHealing = exports.useLiveFeed = exports.usePineconeStats = exports.useSystemHealth = exports.useHealingEvents = exports.useDaemonStatus = exports.useInsights = exports.useActiveThought = exports.useThoughtFlow = exports.useIsConnected = exports.useNexusStore = exports.ThreatLevel = exports.InsightSeverity = exports.DaemonState = exports.DecisionOutcome = exports.ThoughtType = void 0;
exports.initializeNexusWebSocket = initializeNexusWebSocket;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
//
// TYPES FROM BACKEND MODULES
//
var ThoughtType;
(function (ThoughtType) {
    ThoughtType["STRATEGIC"] = "STRATEGIC";
    ThoughtType["TACTICAL"] = "TACTICAL";
    ThoughtType["REACTIVE"] = "REACTIVE";
    ThoughtType["PREDICTIVE"] = "PREDICTIVE";
    ThoughtType["DIAGNOSTIC"] = "DIAGNOSTIC";
    ThoughtType["CREATIVE"] = "CREATIVE";
    ThoughtType["CORRECTIVE"] = "CORRECTIVE";
    ThoughtType["EVOLUTIONARY"] = "EVOLUTIONARY";
})(ThoughtType || (exports.ThoughtType = ThoughtType = {}));
var DecisionOutcome;
(function (DecisionOutcome) {
    DecisionOutcome["EXECUTE"] = "EXECUTE";
    DecisionOutcome["DEFER"] = "DEFER";
    DecisionOutcome["ESCALATE"] = "ESCALATE";
    DecisionOutcome["REJECT"] = "REJECT";
    DecisionOutcome["INVESTIGATE"] = "INVESTIGATE";
    DecisionOutcome["ADAPT"] = "ADAPT";
})(DecisionOutcome || (exports.DecisionOutcome = DecisionOutcome = {}));
var DaemonState;
(function (DaemonState) {
    DaemonState["DORMANT"] = "DORMANT";
    DaemonState["INITIALIZING"] = "INITIALIZING";
    DaemonState["AWAKENING"] = "AWAKENING";
    DaemonState["ACTIVE"] = "ACTIVE";
    DaemonState["PATROLLING"] = "PATROLLING";
    DaemonState["HEALING"] = "HEALING";
    DaemonState["MEDITATING"] = "MEDITATING";
    DaemonState["EVOLVING"] = "EVOLVING";
    DaemonState["EMERGENCY"] = "EMERGENCY";
    DaemonState["TERMINATED"] = "TERMINATED";
})(DaemonState || (exports.DaemonState = DaemonState = {}));
var InsightSeverity;
(function (InsightSeverity) {
    InsightSeverity["INFO"] = "INFO";
    InsightSeverity["ADVISORY"] = "ADVISORY";
    InsightSeverity["WARNING"] = "WARNING";
    InsightSeverity["CRITICAL"] = "CRITICAL";
    InsightSeverity["BREAKTHROUGH"] = "BREAKTHROUGH";
})(InsightSeverity || (exports.InsightSeverity = InsightSeverity = {}));
var ThreatLevel;
(function (ThreatLevel) {
    ThreatLevel[ThreatLevel["NONE"] = 0] = "NONE";
    ThreatLevel[ThreatLevel["LOW"] = 1] = "LOW";
    ThreatLevel[ThreatLevel["MEDIUM"] = 2] = "MEDIUM";
    ThreatLevel[ThreatLevel["HIGH"] = 3] = "HIGH";
    ThreatLevel[ThreatLevel["CRITICAL"] = 4] = "CRITICAL";
    ThreatLevel[ThreatLevel["EXISTENTIAL"] = 5] = "EXISTENTIAL";
})(ThreatLevel || (exports.ThreatLevel = ThreatLevel = {}));
// API Base URL - connects to pinecone-bridge server
const API_BASE = process.env.NEXT_PUBLIC_NEXUS_API || 'http://localhost:3333';
exports.useNexusStore = (0, zustand_1.create)()(
// Complexity: O(1)
(0, middleware_1.persist)((set, get) => ({
    // Initial State
    isConnected: false,
    connectionError: null,
    thoughtFlow: [],
    activeThought: null,
    insights: [],
    meditationDepth: 0,
    isInMeditation: false,
    daemonStatus: null,
    subSystems: [],
    healingEvents: [],
    autoHealingEnabled: true,
    healingPolicy: 'balanced',
    systemHealth: {
        overall: 100,
        components: {
            pinecone: { status: 'healthy', vectors: 52573, latency: 45 },
            daemon: { status: 'healthy', activeProcesses: 7 },
            watchdog: { status: 'healthy', threatLevel: ThreatLevel.NONE },
            healing: { status: 'healthy', autoFixRate: 94 },
        },
    },
    pineconeStats: {
        totalVectors: 52573,
        queriesExecuted: 0,
        avgLatency: 45,
        lastSync: null,
    },
    liveFeed: [],
    // Actions
    connect: async () => {
        try {
            const response = await fetch(`${API_BASE}/api/nexus/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok)
                throw new Error('Connection failed');
            const data = await response.json();
            // Complexity: O(1)
            set({
                isConnected: true,
                connectionError: null,
                daemonStatus: data.daemon,
                pineconeStats: data.pinecone,
            });
            // Complexity: O(1)
            get().addToFeed({
                id: crypto.randomUUID(),
                type: 'alert',
                message: 'NEXUS Connection Established',
                timestamp: new Date(),
                severity: InsightSeverity.INFO,
            });
        }
        catch (error) {
            // Complexity: O(1)
            set({
                isConnected: false,
                connectionError: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    },
    disconnect: () => {
        // Complexity: O(1)
        set({ isConnected: false, daemonStatus: null });
    },
    triggerThought: async (query, type) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(`${API_BASE}/api/nexus/thought`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, type }),
        });
        // SAFETY: async operation — wrap in try-catch for production resilience
        const thought = await response.json();
        // Complexity: O(1)
        set(state => ({
            thoughtFlow: [...state.thoughtFlow, thought],
            activeThought: thought,
        }));
        // Complexity: O(1)
        get().addToFeed({
            id: crypto.randomUUID(),
            type: 'thought',
            message: `Thought: ${thought.decision.action}`,
            timestamp: new Date(),
        });
        return thought;
    },
    startMeditation: async (topic, depth) => {
        // Complexity: O(1)
        set({ isInMeditation: true, meditationDepth: depth });
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(`${API_BASE}/api/nexus/meditate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, depth }),
        });
        // SAFETY: async operation — wrap in try-catch for production resilience
        const session = await response.json();
        // Complexity: O(1)
        set(state => ({
            insights: [...state.insights, ...session.insights],
        }));
    },
    stopMeditation: () => {
        // Complexity: O(1)
        set({ isInMeditation: false, meditationDepth: 0 });
    },
    searchMemory: async (query, topK = 10) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(`${API_BASE}/api/nexus/memory/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, topK }),
        });
        // SAFETY: async operation — wrap in try-catch for production resilience
        const { matches } = await response.json();
        // Complexity: O(1)
        set(state => ({
            pineconeStats: {
                ...state.pineconeStats,
                queriesExecuted: state.pineconeStats.queriesExecuted + 1,
            },
        }));
        return matches;
    },
    toggleAutoHealing: () => {
        // Complexity: O(1)
        set(state => ({ autoHealingEnabled: !state.autoHealingEnabled }));
    },
    setHealingPolicy: (policy) => {
        // Complexity: O(1)
        set({ healingPolicy: policy });
    },
    acknowledgeInsight: (id) => {
        // Complexity: O(N) — linear scan
        set(state => ({
            insights: state.insights.filter(i => i.id !== id),
        }));
    },
    rollbackHealing: async (id) => {
        // SAFETY: async operation — wrap in try-catch for production resilience
        const response = await fetch(`${API_BASE}/api/nexus/healing/rollback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId: id }),
        });
        return response.ok;
    },
    addToFeed: (item) => {
        // Complexity: O(1)
        set(state => ({
            liveFeed: [item, ...state.liveFeed].slice(0, 100), // Keep last 100
        }));
    },
}), {
    name: 'nexus-store',
    partialize: (state) => ({
        autoHealingEnabled: state.autoHealingEnabled,
        healingPolicy: state.healingPolicy,
    }),
}));
//
// WEBSOCKET CONNECTION FOR REAL-TIME UPDATES
//
let ws = null;
function initializeNexusWebSocket() {
    if (typeof window === 'undefined')
        return;
    const wsUrl = process.env.NEXT_PUBLIC_NEXUS_WS || 'ws://localhost:3333/ws';
    ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const store = exports.useNexusStore.getState();
        switch (data.type) {
            case 'THOUGHT_COMPLETE':
                store.addToFeed({
                    id: crypto.randomUUID(),
                    type: 'thought',
                    message: data.payload.decision.action,
                    timestamp: new Date(),
                });
                break;
            case 'INSIGHT_DISCOVERED':
                exports.useNexusStore.setState(state => ({
                    insights: [...state.insights, data.payload],
                }));
                break;
            case 'HEALING_EVENT':
                exports.useNexusStore.setState(state => ({
                    healingEvents: [data.payload, ...state.healingEvents],
                }));
                store.addToFeed({
                    id: crypto.randomUUID(),
                    type: 'healing',
                    message: `Self-healed: ${data.payload.description}`,
                    timestamp: new Date(),
                    severity: InsightSeverity.INFO,
                });
                break;
            case 'VECTOR_SYNC':
                store.addToFeed({
                    id: crypto.randomUUID(),
                    type: 'vector',
                    message: `Vectors synced: +${data.payload.count}`,
                    timestamp: new Date(),
                });
                break;
            case 'THREAT_DETECTED':
                store.addToFeed({
                    id: crypto.randomUUID(),
                    type: 'alert',
                    message: data.payload.message,
                    timestamp: new Date(),
                    severity: InsightSeverity.WARNING,
                });
                break;
            case 'SYSTEM_HEALTH':
                exports.useNexusStore.setState({ systemHealth: data.payload });
                break;
        }
    };
    ws.onclose = () => {
        exports.useNexusStore.setState({ isConnected: false });
        // Auto-reconnect after 5 seconds
        // Complexity: O(1)
        setTimeout(initializeNexusWebSocket, 5000);
    };
    return () => {
        ws?.close();
        ws = null;
    };
}
//
// SELECTOR HOOKS FOR OPTIMIZED RENDERS
//
const useIsConnected = () => (0, exports.useNexusStore)(s => s.isConnected);
exports.useIsConnected = useIsConnected;
const useThoughtFlow = () => (0, exports.useNexusStore)(s => s.thoughtFlow);
exports.useThoughtFlow = useThoughtFlow;
const useActiveThought = () => (0, exports.useNexusStore)(s => s.activeThought);
exports.useActiveThought = useActiveThought;
const useInsights = () => (0, exports.useNexusStore)(s => s.insights);
exports.useInsights = useInsights;
const useDaemonStatus = () => (0, exports.useNexusStore)(s => s.daemonStatus);
exports.useDaemonStatus = useDaemonStatus;
const useHealingEvents = () => (0, exports.useNexusStore)(s => s.healingEvents);
exports.useHealingEvents = useHealingEvents;
const useSystemHealth = () => (0, exports.useNexusStore)(s => s.systemHealth);
exports.useSystemHealth = useSystemHealth;
const usePineconeStats = () => (0, exports.useNexusStore)(s => s.pineconeStats);
exports.usePineconeStats = usePineconeStats;
const useLiveFeed = () => (0, exports.useNexusStore)(s => s.liveFeed);
exports.useLiveFeed = useLiveFeed;
const useAutoHealing = () => (0, exports.useNexusStore)(s => ({
    enabled: s.autoHealingEnabled,
    policy: s.healingPolicy,
    toggle: s.toggleAutoHealing,
    setPolicy: s.setHealingPolicy,
}));
exports.useAutoHealing = useAutoHealing;
