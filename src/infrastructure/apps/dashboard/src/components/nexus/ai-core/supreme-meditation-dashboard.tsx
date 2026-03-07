/**
 * SUPREME MEDITATION INSIGHT DASHBOARD
 * Real-time meta-insights from SupremeMeditation.ts
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Eye, TrendingUp, AlertTriangle, Lightbulb, 
  Activity, Zap, Clock, ChevronDown, X, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useInsights, 
  useNexusStore,
  InsightSeverity,
  type MeditationInsight 
} from '@/stores/nexus-store';

const severityConfig: Record<InsightSeverity, { color: string; bgColor: string; icon: React.ElementType }> = {
  [InsightSeverity.INFO]: { color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/30', icon: Lightbulb },
  [InsightSeverity.ADVISORY]: { color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 border-cyan-500/30', icon: Eye },
  [InsightSeverity.WARNING]: { color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/30', icon: AlertTriangle },
  [InsightSeverity.CRITICAL]: { color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/30', icon: Zap },
  [InsightSeverity.BREAKTHROUGH]: { color: 'text-violet-400', bgColor: 'bg-violet-500/10 border-violet-500/30', icon: Sparkles },
};

function InsightCard({ insight, onAcknowledge }: { insight: MeditationInsight; onAcknowledge: () => void }) {
  const [expanded, setExpanded] = React.useState(false);
  const config = severityConfig[insight.severity];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        'relative p-4 rounded-xl border transition-all duration-300',
        config.bgColor
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg', config.bgColor)}>
          <Icon className={cn('h-4 w-4', config.color)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={cn('text-xs font-medium uppercase tracking-wider', config.color)}>
              {insight.severity}
            </span>
            <button
              onClick={onAcknowledge}
              className="p-1 rounded hover:bg-white/5 transition-colors"
            >
              <X className="h-3 w-3 text-gray-500" />
            </button>
          </div>
          
          <h4 className="text-sm font-medium text-white mb-1">{insight.title}</h4>
          <p className="text-xs text-gray-400 line-clamp-2">{insight.description}</p>
          
          {/* Expandable content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 pt-3 border-t border-white/10"
              >
                {insight.evidence.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Evidence:</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      {insight.evidence.map((e, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-violet-400">•</span>
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {insight.recommendations.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Recommendations:</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      {insight.recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-emerald-400">→</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ChevronDown className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')} />
            {expanded ? 'Less' : 'More'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function MeditationStatus() {
  const { isInMeditation, meditationDepth, startMeditation, stopMeditation } = useNexusStore();
  const [topic, setTopic] = React.useState('system_health');

  return (
    <div className="p-4 rounded-xl border border-violet-500/20 bg-[#12121a]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-2 rounded-lg transition-colors',
            isInMeditation ? 'bg-violet-500/20' : 'bg-gray-800'
          )}>
            <Sparkles className={cn('h-4 w-4', isInMeditation ? 'text-violet-400 animate-pulse' : 'text-gray-500')} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Meditation</p>
            <p className="text-xs text-gray-500">
              {isInMeditation ? `Depth: ${meditationDepth}/10` : 'Idle'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => isInMeditation ? stopMeditation() : startMeditation(topic, 7)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            isInMeditation 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
          )}
        >
          {isInMeditation ? 'Stop' : 'Start'}
        </button>
      </div>
      
      {/* Topic selector */}
      {!isInMeditation && (
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full p-2 rounded-lg bg-[#0d0d14] border border-violet-500/20 text-sm text-white focus:outline-none focus:border-violet-500/40"
        >
          <option value="system_health">System Health Analysis</option>
          <option value="anomaly_detection">Anomaly Detection</option>
          <option value="pattern_discovery">Pattern Discovery</option>
          <option value="predictive_modeling">Predictive Modeling</option>
          <option value="knowledge_synthesis">Knowledge Synthesis</option>
        </select>
      )}
      
      {/* Meditation visualization */}
      {isInMeditation && (
        <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
        </div>
      )}
    </div>
  );
}

export function SupremeMeditationDashboard() {
  const insights = useInsights();
  const { acknowledgeInsight } = useNexusStore();

  const sortedInsights = React.useMemo(() => {
    const severityOrder = {
      [InsightSeverity.BREAKTHROUGH]: 0,
      [InsightSeverity.CRITICAL]: 1,
      [InsightSeverity.WARNING]: 2,
      [InsightSeverity.ADVISORY]: 3,
      [InsightSeverity.INFO]: 4,
    };
    return [...insights].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, [insights]);

  return (
    <div className="rounded-xl border border-violet-500/20 bg-[#0d0d14] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-violet-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-pink-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Supreme Meditation</h3>
            <p className="text-xs text-gray-500">Meta-insights from SupremeMeditation.ts</p>
          </div>
        </div>
        
        {insights.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30">
            <Bell className="h-3 w-3 text-violet-400" />
            <span className="text-xs text-violet-400 font-medium">{insights.length} insights</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Meditation Control */}
        <MeditationStatus />
        
        {/* Insights List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {sortedInsights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Eye className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm">No active insights</p>
                <p className="text-xs">Start a meditation to discover patterns</p>
              </div>
            ) : (
              sortedInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onAcknowledge={() => acknowledgeInsight(insight.id)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default SupremeMeditationDashboard;
