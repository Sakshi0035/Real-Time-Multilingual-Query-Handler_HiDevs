
import React from 'react';
import { QueryTranslation } from '../types';

interface TranslationCardProps {
  query: QueryTranslation;
}

const TranslationCard: React.FC<TranslationCardProps> = ({ query }) => {
  const sentimentColors = {
    positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    neutral: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
    negative: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
  };

  return (
    <div className="group relative bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800 overflow-hidden transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/50">
      {/* Accent strip on hover */}
      <div className="absolute top-0 left-0 w-1 h-full bg-violet-600/0 group-hover:bg-violet-600 transition-all duration-300"></div>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-md">
              <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-400">
                {query.detectedLanguage || 'DETECTION IN PROGRESS'}
              </span>
            </div>
            <span className="text-zinc-800 text-lg">•</span>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              {query.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {query.status === 'completed' && (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border transition-all ${sentimentColors[query.sentiment]}`}>
              {query.sentiment}
            </span>
          )}
        </div>

        <div className="space-y-6">
          <div className="relative pl-4 border-l-2 border-zinc-800">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Captured Signal</h4>
            <p className="text-zinc-400 italic text-sm leading-relaxed">"{query.originalText}"</p>
          </div>

          {query.status === 'pending' ? (
            <div className="flex flex-col items-center py-8 space-y-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-500 animate-pulse">Running Neural Translation</span>
            </div>
          ) : query.status === 'error' ? (
            <div className="p-4 bg-rose-500/5 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/20 uppercase tracking-wider flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Translation Failure: Hardware Interrupt
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800/50">
                <h4 className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-2">Refined English Output</h4>
                <p className="text-zinc-100 font-medium text-base leading-relaxed tracking-tight">{query.translatedText}</p>
              </div>

              {query.suggestedResponse ? (
                <div className="pt-2">
                  <h4 className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-widest mb-3">AI Recommendation</h4>
                  <div className="bg-zinc-950/40 p-5 rounded-2xl border border-fuchsia-500/10 group-hover:border-fuchsia-500/20 transition-all duration-300">
                    <p className="text-zinc-300 text-sm leading-relaxed">{query.suggestedResponse}</p>
                    <button 
                      onClick={() => navigator.clipboard.writeText(query.suggestedResponse)}
                      className="mt-4 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 transition-all flex items-center uppercase tracking-widest"
                    >
                      <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy Response Buffer
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslationCard;
