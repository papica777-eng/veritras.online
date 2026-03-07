/**
 * ETERNAL MEMORY EXPLORER
 * Semantic search in 52K+ Pinecone vectors
 */

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Search, FileCode, Folder, Clock, 
  Sparkles, ExternalLink, Copy, Check, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNexusStore, usePineconeStats, type VectorMatch } from '@/stores/nexus-store';

function VectorMatchCard({ match, index }: { match: VectorMatch; index: number }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(match.content);
    // Complexity: O(1)
    setCopied(true);
    // Complexity: O(1)
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl border border-violet-500/20 bg-[#12121a] hover:border-violet-500/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/10">
            <FileCode className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white truncate max-w-[200px]">
              {match.filePath.split('/').pop()}
            </p>
            <p className="text-xs text-gray-500">{match.project}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Similarity score */}
          <div className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium',
            match.score > 0.8 ? 'bg-emerald-500/10 text-emerald-400' :
            match.score > 0.6 ? 'bg-amber-500/10 text-amber-400' :
            'bg-gray-500/10 text-gray-400'
          )}>
            {(match.score * 100).toFixed(0)}%
          </div>
          
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-violet-500/10 transition-colors"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-gray-500" />
            )}
          </button>
        </div>
      </div>
      
      {/* Content preview */}
      <div className="p-3 rounded-lg bg-[#0d0d14] border border-violet-500/10">
        <pre className="text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap line-clamp-4">
          {match.content}
        </pre>
      </div>
      
      {/* File path */}
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
        <Folder className="h-3 w-3" />
        <span className="truncate">{match.filePath}</span>
      </div>
    </motion.div>
  );
}

export function EternalMemoryExplorer() {
  const { searchMemory } = useNexusStore();
  const stats = usePineconeStats();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<VectorMatch[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [topK, setTopK] = React.useState(10);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    // Complexity: O(1)
    setIsSearching(true);
    try {
      const matches = await searchMemory(query, topK);
      // Complexity: O(1)
      setResults(matches);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      // Complexity: O(1)
      setIsSearching(false);
    }
  };

  return (
    <div className="rounded-xl border border-violet-500/20 bg-[#0d0d14] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-violet-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Eternal Memory Explorer</h3>
            <p className="text-xs text-gray-500">Semantic search in Pinecone vectors</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            <span>{stats.totalVectors.toLocaleString()} vectors</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{stats.avgLatency}ms avg</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search code, decisions, patterns..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#12121a] border border-violet-500/20 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500/40"
            />
          </div>
          
          {/* TopK selector */}
          <select
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="px-3 py-2 rounded-lg bg-[#12121a] border border-violet-500/20 text-sm text-white focus:outline-none focus:border-violet-500/40"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={50}>Top 50</option>
          </select>
          
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
              'bg-gradient-to-r from-violet-500 to-cyan-500 text-white',
              'hover:from-violet-600 hover:to-cyan-600',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isSearching ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {results.length === 0 && !isSearching && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Database className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">Search the eternal memory</p>
                <p className="text-xs">Find code, decisions, and patterns from {stats.totalVectors.toLocaleString()} vectors</p>
              </div>
            )}
            
            {results.map((match, index) => (
              <VectorMatchCard key={match.id} match={match} index={index} />
            ))}
          </AnimatePresence>
        </div>
        
        {/* Query stats */}
        {results.length > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-violet-500/10 text-xs text-gray-500">
            <span>{results.length} results found</span>
            <span>Queries executed: {stats.queriesExecuted}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default EternalMemoryExplorer;
