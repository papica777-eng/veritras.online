/**
 * AUTONOMOUS THOUGHT FLOW VISUALIZER
 * Interactive decision chain from AutonomousThought.ts
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, GitBranch, Zap, Eye, Database, Sparkles, Activity,
  ChevronRight, Clock, Target, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useThoughtFlow, 
  useActiveThought,
  ThoughtType, 
  DecisionOutcome,
  type ThoughtNode 
} from '@/stores/nexus-store';

const thoughtTypeConfig: Record<ThoughtType, { color: string; icon: React.ElementType; label: string }> = {
  [ThoughtType.STRATEGIC]: { color: 'from-violet-500 to-purple-500', icon: Target, label: 'Strategic' },
  [ThoughtType.TACTICAL]: { color: 'from-blue-500 to-cyan-500', icon: GitBranch, label: 'Tactical' },
  [ThoughtType.REACTIVE]: { color: 'from-amber-500 to-orange-500', icon: Zap, label: 'Reactive' },
  [ThoughtType.PREDICTIVE]: { color: 'from-emerald-500 to-green-500', icon: Eye, label: 'Predictive' },
  [ThoughtType.DIAGNOSTIC]: { color: 'from-rose-500 to-red-500', icon: Activity, label: 'Diagnostic' },
  [ThoughtType.CREATIVE]: { color: 'from-pink-500 to-fuchsia-500', icon: Sparkles, label: 'Creative' },
  [ThoughtType.CORRECTIVE]: { color: 'from-yellow-500 to-amber-500', icon: AlertTriangle, label: 'Corrective' },
  [ThoughtType.EVOLUTIONARY]: { color: 'from-indigo-500 to-violet-500', icon: Brain, label: 'Evolutionary' },
};

const outcomeColors: Record<DecisionOutcome, string> = {
  [DecisionOutcome.EXECUTE]: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  [DecisionOutcome.DEFER]: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  [DecisionOutcome.ESCALATE]: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  [DecisionOutcome.REJECT]: 'text-red-400 bg-red-500/10 border-red-500/30',
  [DecisionOutcome.INVESTIGATE]: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  [DecisionOutcome.ADAPT]: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
};

function ThoughtCard({ thought, isActive }: { thought: ThoughtNode; isActive: boolean }) {
  const config = thoughtTypeConfig[thought.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative p-4 rounded-xl border transition-all duration-300',
        'bg-[#12121a]/80 backdrop-blur-sm',
        isActive 
          ? 'border-violet-500 shadow-lg shadow-violet-500/20 ring-2 ring-violet-500/20' 
          : 'border-violet-500/20 hover:border-violet-500/40'
      )}
    >
      {/* Glow */}
      {isActive && (
        <motion.div 
          layoutId="thought-glow"
          className={cn('absolute inset-0 rounded-xl bg-gradient-to-r opacity-10', config.color)} 
        />
      )}
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-lg bg-gradient-to-r', config.color)}>
              <Icon className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">{config.label}</span>
          </div>
          <span className={cn('text-xs px-2 py-0.5 rounded-full border', outcomeColors[thought.decision.outcome])}>
            {thought.decision.outcome}
          </span>
        </div>
        
        {/* Query */}
        <p className="text-sm text-white mb-3 line-clamp-2">{thought.query}</p>
        
        {/* Decision */}
        <div className="p-2 rounded-lg bg-violet-500/5 border border-violet-500/10">
          <p className="text-xs text-violet-300 font-medium">{thought.decision.action}</p>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            <span>{thought.precedents?.length || 0} precedents</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{(thought.confidence * 100).toFixed(0)}%</span>
            <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${thought.confidence * 100}%` }}
                className={cn('h-full bg-gradient-to-r rounded-full', config.color)}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function AutonomousThoughtVisualizer() {
  const thoughtFlow = useThoughtFlow();
  const activeThought = useActiveThought();
  const [selectedThought, setSelectedThought] = React.useState<string | null>(null);

  return (
    <div className="rounded-xl border border-violet-500/20 bg-[#0d0d14] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-violet-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Autonomous Thought Flow</h3>
            <p className="text-xs text-gray-500">Decision chains from AutonomousThought.ts</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
          <div className="text-xs text-gray-400">
            {thoughtFlow.length} thoughts
          </div>
        </div>
      </div>

      {/* Flow Grid */}
      <div className="p-4">
        {thoughtFlow.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Brain className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">No thoughts yet</p>
            <p className="text-xs">Trigger a thought to see the decision flow</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {thoughtFlow.slice(-9).map((thought) => (
                <ThoughtCard
                  key={thought.id}
                  thought={thought}
                  isActive={activeThought?.id === thought.id}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Active Thought Detail */}
      {activeThought && (
        <div className="p-4 bg-gradient-to-r from-violet-500/5 to-cyan-500/5 border-t border-violet-500/20">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-violet-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-white font-medium mb-1">Active Decision</p>
              <p className="text-sm text-gray-400">{activeThought.decision.justification}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AutonomousThoughtVisualizer;
