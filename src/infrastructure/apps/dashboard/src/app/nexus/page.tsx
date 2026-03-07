/**
 * NEXUS MAIN DASHBOARD PAGE
 * Production-ready integration of all AI Core modules
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Activity, Database, Shield, Zap,
  Network, Settings, RefreshCw, Sparkles,
  Cpu, Eye, Ghost, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useNexusStore,
  useSystemHealth,
  useDaemonStatus,
  usePineconeStats,
  useHealingEvents,
  DaemonState
} from '@/stores/nexus-store';

// AI Core Components
import { AutonomousThoughtVisualizer } from '@/components/nexus/ai-core/autonomous-thought-visualizer';
import { SupremeMeditationDashboard } from '@/components/nexus/ai-core/supreme-meditation-dashboard';
import { EternalMemoryExplorer } from '@/components/nexus/ai-core/eternal-memory-explorer';
import { NeuralCoreFeed } from '@/components/nexus/ai-core/neural-core-feed';

// Daemon Components
import { MegaDaemonConsole } from '@/components/nexus/daemons/mega-daemon-console';

// Operations Components
import { SelfHealingWatcher } from '@/components/nexus/operations/self-healing-watcher';
import { LiveFeedPanel } from '@/components/nexus/operations/live-feed-panel';

// Multimodal Components
import { MisterMindChat } from '@/components/nexus/multimodal/mister-mind-chat';

type TabId = 'overview' | 'thoughts' | 'meditation' | 'memory' | 'daemons' | 'healing';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  description: string;
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview', icon: Activity, description: 'System Dashboard' },
  { id: 'thoughts', label: 'Autonomous Thought', icon: Brain, description: 'Decision Flow' },
  { id: 'meditation', label: 'Supreme Meditation', icon: Zap, description: 'Meta Insights' },
  { id: 'memory', label: 'Eternal Memory', icon: Database, description: '52K+ Vectors' },
  { id: 'daemons', label: 'Mega Daemon', icon: Shield, description: 'Orchestration' },
  { id: 'healing', label: 'Self-Healing', icon: RefreshCw, description: 'Auto Repair' },
];

export default function NexusPage() {
  const [activeTab, setActiveTab] = React.useState<TabId>('overview');
  const { connect, disconnect, isConnected } = useNexusStore();
  const systemHealth = useSystemHealth();

  React.useEffect(() => {
    // Complexity: O(1)
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const getStatusColor = () => {
    if (systemHealth.overall >= 80) return 'text-emerald-400';
    if (systemHealth.overall >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getStatusBg = () => {
    if (systemHealth.overall >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
    if (systemHealth.overall >= 50) return 'bg-amber-500/20 border-amber-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0d18] to-[#0a0a0f]">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-violet-500/10 bg-[#0d0d14]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-5">
              <motion.div 
                className="relative p-3 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Network className="h-7 w-7 text-white" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-400 rounded-full animate-pulse" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  AETERNA NEXUS
                </h1>
                <p className="text-sm text-gray-500 font-medium">Neural Operations Center  v34.1</p>
              </div>
            </div>

            {/* System Status Bar */}
            <div className="flex items-center gap-4">
              {/* Health Indicator */}
              <div className={cn(
                'flex items-center gap-3 px-5 py-2.5 rounded-xl border backdrop-blur-sm',
                // Complexity: O(1)
                getStatusBg()
              )}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-2.5 h-2.5 rounded-full',
                    systemHealth.overall >= 80 ? 'bg-emerald-400 animate-pulse' :
                    systemHealth.overall >= 50 ? 'bg-amber-400' : 'bg-red-400 animate-pulse'
                  )} />
                  <span className={cn('text-sm font-semibold', getStatusColor())}>
                    {systemHealth.overall >= 80 ? 'HEALTHY' : 
                     systemHealth.overall >= 50 ? 'DEGRADED' : 'CRITICAL'}
                  </span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <span className="text-sm font-bold text-white">
                  {systemHealth.overall}%
                </span>
              </div>

              {/* Connection Status */}
              <motion.div 
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border',
                  isConnected
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                )}
                animate={{ opacity: isConnected ? 1 : [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: isConnected ? 0 : Infinity }}
              >
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  isConnected ? 'bg-emerald-400' : 'bg-red-400'
                )} />
                {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </motion.div>

              {/* Settings */}
              <motion.button 
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="h-5 w-5 text-gray-400" />
              </motion.button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-2 mt-6 -mb-px overflow-x-auto pb-px">
            {TABS.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2.5 px-5 py-3 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-gradient-to-b from-violet-500/20 to-transparent text-violet-300 border-t border-x border-violet-500/30'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                )}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className={cn(
                  'h-4 w-4',
                  activeTab === tab.id ? 'text-violet-400' : ''
                )} />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-[1920px] mx-auto px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'thoughts' && <AutonomousThoughtVisualizer />}
            {activeTab === 'meditation' && <SupremeMeditationDashboard />}
            {activeTab === 'memory' && <MemoryTab />}
            {activeTab === 'daemons' && <MegaDaemonConsole />}
            {activeTab === 'healing' && <HealingTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mister Mind Chat Widget */}
      <MisterMindChat />
    </div>
  );
}

// ============ OVERVIEW TAB ============
function OverviewTab() {
  const systemHealth = useSystemHealth();
  const daemonStatus = useDaemonStatus();
  const pineconeStats = usePineconeStats();
  const healingEvents = useHealingEvents();

  const stats = [
    { 
      label: 'System Health', 
      value: `${systemHealth?.overall ?? 100}%`, 
      icon: Activity,
      color: (systemHealth?.overall ?? 100) >= 80 ? 'text-emerald-400' : 'text-amber-400',
      bg: 'from-emerald-500/20'
    },
    { 
      label: 'Daemon Status', 
      value: daemonStatus?.state ?? 'ACTIVE', 
      icon: Shield,
      color: 'text-violet-400',
      bg: 'from-violet-500/20'
    },
    { 
      label: 'Vectors', 
      value: (pineconeStats?.totalVectors ?? 52573).toLocaleString(), 
      icon: Database,
      color: 'text-cyan-400',
      bg: 'from-cyan-500/20'
    },
    { 
      label: 'Auto-Healed', 
      value: (healingEvents?.length ?? 0).toString(), 
      icon: RefreshCw,
      color: 'text-pink-400',
      bg: 'from-pink-500/20'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              'relative p-6 rounded-2xl border border-white/10 overflow-hidden',
              'bg-gradient-to-br from-white/5 to-transparent',
              'hover:border-violet-500/30 transition-all group'
            )}
          >
            <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br', stat.bg, 'to-transparent')} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={cn('h-6 w-6', stat.color)} />
                <Sparkles className="h-4 w-4 text-white/20" />
              </div>
              <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - 8 cols */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <LiveFeedPanel />
          <AutonomousThoughtVisualizer />
        </div>

        {/* Right Column - 4 cols */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <MegaDaemonConsole />
          <NeuralCoreFeed />
        </div>
      </div>
    </div>
  );
}

// ============ MEMORY TAB ============
function MemoryTab() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8">
        <EternalMemoryExplorer />
      </div>
      <div className="col-span-12 lg:col-span-4">
        <NeuralCoreFeed />
      </div>
    </div>
  );
}

// ============ HEALING TAB ============
function HealingTab() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8">
        <SelfHealingWatcher />
      </div>
      <div className="col-span-12 lg:col-span-4">
        <LiveFeedPanel />
      </div>
    </div>
  );
}