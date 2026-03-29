import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Globe, 
  Rocket, 
  User, 
  IndianRupee, 
  Cpu, 
  RefreshCw, 
  ExternalLink,
  ShieldAlert,
  Loader2,
  Calendar,
  BarChart3,
  Plus,
  Trash2,
  Search
} from 'lucide-react';
import { predictFuture, PredictionResult } from './services/geminiService';
import { cn } from './lib/utils';

interface Topic {
  id: string;
  label: string;
  iconName: string;
  query: string;
}

const ICON_MAP: Record<string, any> = {
  TrendingUp, 
  Globe, 
  Rocket, 
  User, 
  IndianRupee, 
  Cpu, 
  Search,
  RefreshCw,
  Calendar,
  BarChart3
};

const DEFAULT_TOPICS: Topic[] = [
  { id: 'ipl', label: 'IPL 2026 Winner', iconName: 'TrendingUp', query: 'Who will win Indian Premier league 2026?' },
  { id: 'rupee', label: 'USD/INR @ 100', iconName: 'IndianRupee', query: 'On what date the value of ruppee will touch 100 against 1 dollar? I want exact date' },
  { id: 'mars', label: 'Mars Landing', iconName: 'Rocket', query: 'On what date humans will land on mars? I want exact date' },
  { id: 'us-election', label: 'US Election 2028', iconName: 'User', query: 'Who will win next US presidential election?' },
  { id: 'economy', label: 'India Economy 2040', iconName: 'Globe', query: 'What will be the value of indian economy in 2040?' },
  { id: 'agi', label: 'AGI Achievement', iconName: 'Cpu', query: 'When will Artificial General Intelligence (AGI) be achieved? Provide an exact date or year.' },
];

export default function App() {
  const [topics, setTopics] = useState<Topic[]>(() => {
    const saved = localStorage.getItem('oracle_topics');
    return saved ? JSON.parse(saved) : DEFAULT_TOPICS;
  });
  const [newTopicQuery, setNewTopicQuery] = useState('');
  const [predictions, setPredictions] = useState<Record<string, PredictionResult | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('oracle_topics', JSON.stringify(topics));
  }, [topics]);

  const fetchPrediction = async (id: string, query: string) => {
    if (loading[id]) return;
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const result = await predictFuture(query);
      setPredictions(prev => ({ ...prev, [id]: result }));
    } catch (err) {
      console.error(`Error fetching prediction for ${id}:`, err);
      setError("Failed to connect to the Oracle. Please check your API key or connection.");
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const fetchAll = () => {
    topics.forEach(topic => fetchPrediction(topic.id, topic.query));
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicQuery.trim()) return;

    const id = `custom-${Date.now()}`;
    const newTopic: Topic = {
      id,
      label: newTopicQuery.length > 20 ? newTopicQuery.substring(0, 17) + '...' : newTopicQuery,
      iconName: 'Search',
      query: newTopicQuery
    };

    setTopics(prev => [...prev, newTopic]);
    setNewTopicQuery('');
    fetchPrediction(id, newTopicQuery);
  };

  const handleRemoveTopic = (id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
    setPredictions(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-green-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,0,0.05),transparent_70%)]" />
        <div className="scanline" />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-white/10 bg-black/50 backdrop-blur-md px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#00ff00]" />
            <span className="data-label">System Status: Operational</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter glow-text">FUTURE ORACLE <span className="text-green-500">v1.1</span></h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <form onSubmit={handleAddTopic} className="relative group w-full sm:w-64">
            <input 
              type="text"
              value={newTopicQuery}
              onChange={(e) => setNewTopicQuery(e.target.value)}
              placeholder="Inject new query..."
              className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-green-500/50 transition-all font-mono"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-green-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <button 
            onClick={fetchAll}
            disabled={Object.values(loading).some(v => v)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group whitespace-nowrap"
          >
            <RefreshCw className={cn("w-4 h-4", Object.values(loading).some(v => v) && "animate-spin")} />
            <span className="text-sm font-medium">Recalibrate All</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-12 px-8">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center justify-between gap-3 text-red-400"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5" />
              <p>{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-xs uppercase font-mono hover:text-white transition-colors">Dismiss</button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => (
            <PredictionCard 
              key={topic.id}
              topic={topic}
              prediction={predictions[topic.id]}
              isLoading={loading[topic.id]}
              delay={index * 0.1}
              onRemove={() => handleRemoveTopic(topic.id)}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/10 py-8 px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-xs font-mono">
        <p>© 2026 FUTURE ORACLE SYSTEMS • ALL PREDICTIONS ARE PROBABILISTIC</p>
        <div className="flex items-center gap-6">
          <span>LATENCY: 242MS</span>
          <span>UPTIME: 99.99%</span>
          <span>DATA_SOURCE: GLOBAL_SEARCH_GROUNDING</span>
        </div>
      </footer>
    </div>
  );
}

function PredictionCard({ topic, prediction, isLoading, delay, onRemove }: { 
  topic: Topic, 
  prediction: PredictionResult | null, 
  isLoading: boolean,
  delay: number,
  onRemove: () => void
}) {
  const Icon = ICON_MAP[topic.iconName] || Search;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="prediction-card group"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
            <Icon className="w-5 h-5 text-green-500" />
          </div>
          <button 
            onClick={onRemove}
            className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove topic"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="text-right">
          <span className="data-label block">Confidence</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-mono text-green-500">
              {isLoading ? '???' : `${prediction?.confidence || 0}%`}
            </span>
          </div>
        </div>
      </div>

      <h3 className="text-sm font-mono text-white/50 uppercase tracking-widest mb-2">{topic.label}</h3>
      
      <div className="min-h-[120px] mb-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            <span className="text-xs font-mono text-white/30 animate-pulse">ANALYZING GLOBAL DATA...</span>
          </div>
        ) : prediction ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-xl font-bold mb-4 leading-tight group-hover:text-green-400 transition-colors">
              {prediction.prediction}
            </p>
            <p className="text-sm text-white/60 leading-relaxed line-clamp-4 hover:line-clamp-none transition-all cursor-default">
              {prediction.reasoning}
            </p>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full text-white/20 italic text-sm">
            Waiting for recalibration...
          </div>
        )}
      </div>

      {!isLoading && prediction && (
        <div className="space-y-4">
          <div className="confidence-bar">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${prediction.confidence}%` }}
              className="confidence-fill" 
            />
          </div>

          <div className="pt-4 border-t border-white/5">
            <span className="data-label block mb-2">Sources Found</span>
            <div className="flex flex-wrap gap-2">
              {prediction.sources.map((source, i) => (
                <a 
                  key={i}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors text-white/40 hover:text-green-500"
                  title={source.title}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
