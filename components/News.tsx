import React from 'react';
import { motion } from 'motion/react';
import { NewspaperIcon, TrendingUpIcon, WalletIcon, CalendarIcon } from './icons';

const MARKET_INSIGHTS = [
  {
    title: "Global Market Resilience",
    description: "Major indices show steady growth despite inflationary pressures. Tech sector continues to lead with robust quarterly earnings.",
    category: "Market",
    date: "Mar 26, 2026"
  },
  {
    title: "Interest Rate Outlook",
    description: "Central banks signal a potential pause in rate hikes as consumer price indices begin to stabilize globally.",
    category: "Economy",
    date: "Mar 25, 2026"
  },
  {
    title: "Digital Asset Regulation",
    description: "New framework for digital assets aims to provide clarity for institutional investors and enhance consumer protection.",
    category: "Crypto",
    date: "Mar 24, 2026"
  },
  {
    title: "Sustainable Investing Surge",
    description: "ESG-focused funds see record inflows as investors prioritize long-term sustainability and ethical governance.",
    category: "Trends",
    date: "Mar 23, 2026"
  }
];

const News: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text-primary dark:text-white tracking-tight">Market Insights</h2>
          <p className="text-text-secondary dark:text-gray-400 mt-1">Curated financial intelligence and global trends.</p>
        </div>
        <div className="hidden md:flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-mono text-text-secondary dark:text-gray-400 uppercase tracking-widest">Live Feed Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MARKET_INSIGHTS.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-indigo-500/20 transition-all duration-500 relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono uppercase tracking-widest rounded-full border border-indigo-100 dark:border-indigo-500/20">
                  {insight.category}
                </span>
                <span className="text-[10px] font-mono text-text-secondary dark:text-gray-500 uppercase tracking-wider">
                  {insight.date}
                </span>
              </div>

              <h3 className="text-xl font-bold text-text-primary dark:text-white mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {insight.title}
              </h3>
              
              <p className="text-text-secondary dark:text-gray-400 leading-relaxed mb-8">
                {insight.description}
              </p>

              <div className="flex items-center text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform cursor-pointer">
                Read Analysis 
                <span className="ml-2">→</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Newsletter Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-[#0a0a0a] p-12 rounded-[3rem] text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-2xl mb-8 border border-white/10">
            <NewspaperIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-4 tracking-tight uppercase italic">The Weekly Horizon</h3>
          <p className="text-gray-400 mb-10 leading-relaxed">
            Join 50,000+ investors receiving our curated weekend briefing on global markets, emerging tech, and wealth strategies.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your professional email" 
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm"
            />
            <button className="bg-white text-black px-8 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all duration-300 text-sm">
              Subscribe
            </button>
          </div>
          <p className="text-[10px] text-gray-600 mt-6 font-mono uppercase tracking-widest">No spam. Only intelligence. Unsubscribe anytime.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default News;
