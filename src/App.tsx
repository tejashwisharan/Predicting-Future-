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
  BarChart3
} from 'lucide-react';
import { predictFuture, PredictionResult } from './services/geminiService';
import { cn } from './lib/utils';

const TOPICS = [
  { id: 'ipl', label: 'IPL 2026 Winner', icon: TrendingUp, query: 'Who will win Indian Premier league 2026?' },
  { id: 'rupee', label: 'USD/INR @ 100', icon: IndianRupee, query: 'On what date the value of ruppee will touch 100 against 1 dollar? I want exact date' },
  { id: 'mars', label: 'Mars Landing', icon: Rocket, query: 'On what date humans will land on mars? I want exact date' },
  { id: 'us-election', label: 'US Election 2028', icon: User, query: 'Who will win next US presidential election?' },
  { id: 'economy', label: 'India Economy 2040', icon: Globe, query: 'What will be the value of indian economy in 2040?' },
  { id: 'agi', label: 'AGI Achievement', icon: Cpu, query: 'When will Artificial General Intelligence (AGI) be achieved? Provide an exact date or year.' },
];

export default function App() {
  const [predictions, setPredictions] = useState<Record<string, PredictionResult | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchPrediction = async (id: string, query: string) => {
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
    TOPICS.forEach(topic => fetchPrediction(topic.id, topic.query));
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
      <header className="relative z-20 border-b border-white/10 bg-black/50 backdrop-blur-md px-8 py-6 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#00ff00]" />
            <span className="data-label">System Status: Operational</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter glow-text">FUTURE ORACLE <span className="text-green-500">v1.0</span></h1>
        </div>
        
        <button 
          onClick={fetchAll}
          disabled={Object.values(loading).some(v => v)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <RefreshCw className={cn("w-4 h-4", Object.values(loading).some(v => v) && "animate-spin")} />
          <span className="text-sm font-medium">Recalibrate All</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-12 px-8">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400"
          >
            <ShieldAlert className="w-5 h-5" />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOPICS.map((topic, index) => (
            <PredictionCard 
              key={topic.id}
              topic={topic}
              prediction={predictions[topic.id]}
              isLoading={loading[topic.id]}
              delay={index * 0.1}
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

function PredictionCard({ topic, prediction, isLoading, delay }: { 
  topic: typeof TOPICS[0], 
  prediction: PredictionResult | null, 
  isLoading: boolean,
  delay: number
}) {
  const Icon = topic.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="prediction-card group"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
          <Icon className="w-5 h-5 text-green-500" />
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
