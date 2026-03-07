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

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

//
// TYPES FROM BACKEND MODULES
//

export enum ThoughtType {
  STRATEGIC = 'STRATEGIC',
  TACTICAL = 'TACTICAL',
  REACTIVE = 'REACTIVE',
  PREDICTIVE = 'PREDICTIVE',
  DIAGNOSTIC = 'DIAGNOSTIC',
  CREATIVE = 'CREATIVE',
  CORRECTIVE = 'CORRECTIVE',
  EVOLUTIONARY = 'EVOLUTIONARY',
}

export enum DecisionOutcome {
  EXECUTE = 'EXECUTE',
  DEFER = 'DEFER',
  ESCALATE = 'ESCALATE',
  REJECT = 'REJECT',
  INVESTIGATE = 'INVESTIGATE',
  ADAPT = 'ADAPT',
}

export enum DaemonState {
  DORMANT = 'DORMANT',
  INITIALIZING = 'INITIALIZING',
  AWAKENING = 'AWAKENING',
  ACTIVE = 'ACTIVE',
  PATROLLING = 'PATROLLING',
  HEALING = 'HEALING',
  MEDITATING = 'MEDITATING',
  EVOLVING = 'EVOLVING',
  EMERGENCY = 'EMERGENCY',
  TERMINATED = 'TERMINATED',
}

export enum InsightSeverity {
  INFO = 'INFO',
  ADVISORY = 'ADVISORY',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  BREAKTHROUGH = 'BREAKTHROUGH',
}

export enum ThreatLevel {
  NONE = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
  EXISTENTIAL = 5,
}

//
// INTERFACES
//

export interface ThoughtNode {
  id: string;
  type: ThoughtType;
  query: string;
  confidence: number;
  timestamp: Date;
  precedents: VectorMatch[];
  decision: {
    outcome: DecisionOutcome;
    action: string;
    justification: string;
  };
  children?: string[];
}

export interface VectorMatch {
  id: string;
  score: number;
  content: string;
  filePath: string;
  project: string;
  metadata: Record<string, any>;
}

export interface MeditationInsight {
  id: string;
  type: string;
  severity: InsightSeverity;
  title: string;
  description: string;
  evidence: string[];
  recommendations: string[];
  timestamp: Date;
}

export interface DaemonStatus {
  id: string;
  name: string;
  state: DaemonState;
  uptime: number;
  lastHeartbeat: Date;
  metrics: {
    cpu: number;
    memory: number;
    tasksProcessed: number;
    errorsHandled: number;
  };
  subSystems: SubSystemStatus[];
}

export interface SubSystemStatus {
  type: string;
  state: DaemonState;
  healthScore: number;
  lastActivity: Date;
}

export interface HealingEvent {
  id: string;
  timestamp: Date;
  type: 'ERROR_FIX' | 'TODO_RESOLVED' | 'DEPENDENCY_UPDATE' | 'CODE_REFACTOR';
  target: string;
  description: string;
  autoFixed: boolean;
  rollbackAvailable: boolean;
}

export interface SystemHealth {
  overall: number;
  components: {
    pinecone: { status: 'healthy' | 'degraded' | 'down'; vectors: number; latency: number };
    daemon: { status: 'healthy' | 'degraded' | 'down'; activeProcesses: number };
    watchdog: { status: 'healthy' | 'degraded' | 'down'; threatLevel: ThreatLevel };
    healing: { status: 'healthy' | 'degraded' | 'down'; autoFixRate: number };
  };
}

//
// NEXUS STORE - CENTRAL STATE MANAGEMENT
//

interface NexusState {
  // Connection Status
  isConnected: boolean;
  connectionError: string | null;

  // Autonomous Thought
  thoughtFlow: ThoughtNode[];
  activeThought: ThoughtNode | null;

  // Supreme Meditation
  insights: MeditationInsight[];
  meditationDepth: number;
  isInMeditation: boolean;

  // Daemon Status
  daemonStatus: DaemonStatus | null;
  subSystems: SubSystemStatus[];

  // Self-Healing
  healingEvents: HealingEvent[];
  autoHealingEnabled: boolean;
  healingPolicy: 'conservative' | 'balanced' | 'aggressive';

  // System Health
  systemHealth: SystemHealth;

  // Pinecone Stats
  pineconeStats: {
    totalVectors: number;
    queriesExecuted: number;
    avgLatency: number;
    lastSync: Date | null;
  };

  // Real-time Feed
  liveFeed: Array<{
    id: string;
    type: 'thought' | 'insight' | 'healing' | 'vector' | 'alert';
    message: string;
    timestamp: Date;
    severity?: InsightSeverity;
  }>;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  triggerThought: (query: string, type: ThoughtType) => Promise<ThoughtNode>;
  startMeditation: (topic: string, depth: number) => Promise<void>;
  stopMeditation: () => void;
  searchMemory: (query: string, topK?: number) => Promise<VectorMatch[]>;
  toggleAutoHealing: () => void;
  setHealingPolicy: (policy: 'conservative' | 'balanced' | 'aggressive') => void;
  acknowledgeInsight: (id: string) => void;
  rollbackHealing: (id: string) => Promise<boolean>;
  addToFeed: (item: NexusState['liveFeed'][0]) => void;
}

// API Base URL - connects to pinecone-bridge server
const API_BASE = process.env.NEXT_PUBLIC_NEXUS_API || 'http://localhost:3333';

export const useNexusStore = create<NexusState>()(
  // Complexity: O(1)
  persist(
    (set, get) => ({
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

          if (!response.ok) throw new Error('Connection failed');

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
        } catch (error) {
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

      triggerThought: async (query: string, type: ThoughtType) => {
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

      startMeditation: async (topic: string, depth: number) => {
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

      searchMemory: async (query: string, topK = 10) => {
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

      acknowledgeInsight: (id: string) => {
        // Complexity: O(N) — linear scan
        set(state => ({
          insights: state.insights.filter(i => i.id !== id),
        }));
      },

      rollbackHealing: async (id: string) => {
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
    }),
    {
      name: 'nexus-store',
      partialize: (state) => ({
        autoHealingEnabled: state.autoHealingEnabled,
        healingPolicy: state.healingPolicy,
      }),
    }
  )
);

//
// WEBSOCKET CONNECTION FOR REAL-TIME UPDATES
//

let ws: WebSocket | null = null;

export function initializeNexusWebSocket() {
  if (typeof window === 'undefined') return;

  const wsUrl = process.env.NEXT_PUBLIC_NEXUS_WS || 'ws://localhost:3333/ws';
  ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const store = useNexusStore.getState();

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
        useNexusStore.setState(state => ({
          insights: [...state.insights, data.payload],
        }));
        break;

      case 'HEALING_EVENT':
        useNexusStore.setState(state => ({
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
        useNexusStore.setState({ systemHealth: data.payload });
        break;
    }
  };

  ws.onclose = () => {
    useNexusStore.setState({ isConnected: false });
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

export const useIsConnected = () => useNexusStore(s => s.isConnected);
export const useThoughtFlow = () => useNexusStore(s => s.thoughtFlow);
export const useActiveThought = () => useNexusStore(s => s.activeThought);
export const useInsights = () => useNexusStore(s => s.insights);
export const useDaemonStatus = () => useNexusStore(s => s.daemonStatus);
export const useHealingEvents = () => useNexusStore(s => s.healingEvents);
export const useSystemHealth = () => useNexusStore(s => s.systemHealth);
export const usePineconeStats = () => useNexusStore(s => s.pineconeStats);
export const useLiveFeed = () => useNexusStore(s => s.liveFeed);
export const useAutoHealing = () => useNexusStore(s => ({
  enabled: s.autoHealingEnabled,
  policy: s.healingPolicy,
  toggle: s.toggleAutoHealing,
  setPolicy: s.setHealingPolicy,
}));
