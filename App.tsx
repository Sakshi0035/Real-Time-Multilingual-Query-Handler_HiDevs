import React, { useState, useCallback } from 'react';
import { QueryTranslation } from './types';
import { translateAndAnalyzeQuery } from './services/geminiService';
import TranslationCard from './components/TranslationCard';

const App: React.FC = () => {
  const [queries, setQueries] = useState<QueryTranslation[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    const newId = crypto.randomUUID();
    const newQuery: QueryTranslation = {
      id: newId,
      timestamp: new Date(),
      originalText: inputText,
      translatedText: '',
      detectedLanguage: '',
      sentiment: 'neutral',
      suggestedResponse: '',
      status: 'pending'
    };

    setQueries(prev => [newQuery, ...prev]);
    setInputText('');
    setIsProcessing(true);

    try {
      const result = await translateAndAnalyzeQuery(inputText);
      setQueries(prev => prev.map(q => q.id === newId ? {
        ...q,
        ...result,
        status: 'completed'
      } : q));
    } catch (error) {
      setQueries(prev => prev.map(q => q.id === newId ? {
        ...q,
        status: 'error'
      } : q));
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, isProcessing]);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-200">
      {/* Dynamic Background Ornament */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-64 bg-violet-600/10 blur-[120px] pointer-events-none -z-10"></div>
      
      {/* Header */}
      <header className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-900/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">GlobalSupport</h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Language Command Center</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>AI Engine Connected</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Input Section */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="bg-zinc-900/40 backdrop-blur-sm rounded-3xl border border-zinc-800/50 p-8 shadow-2xl">
                <h2 className="text-xl font-bold mb-2 flex items-center text-white">
                  <span className="w-2 h-6 bg-violet-500 rounded-full mr-3"></span>
                  Incoming Stream
                </h2>
                <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                  Route global communications through the translation core for real-time English synthesis.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative group">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste query text here..."
                      className="w-full h-48 p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none text-zinc-100 placeholder-zinc-600 text-sm leading-relaxed"
                      disabled={isProcessing}
                    />
                    <div className="absolute top-3 right-3 text-[10px] font-bold text-zinc-700 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
                      RAW INPUT
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isProcessing || !inputText.trim()}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-white transition-all flex items-center justify-center space-x-3 shadow-xl ${
                      isProcessing || !inputText.trim() 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' 
                        : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-violet-900/20 active:transform active:scale-[0.98]'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <span>Process Stream</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-950/30 rounded-2xl border border-zinc-800/50">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Response Latency</p>
                    <p className="text-sm font-semibold text-zinc-300">&lt; 1.2s avg</p>
                  </div>
                  <div className="p-4 bg-zinc-950/30 rounded-2xl border border-zinc-800/50">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Synthesizer</p>
                    <p className="text-sm font-semibold text-zinc-300">Gemini 3F</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Translation List Section */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white flex items-center">
                <svg className="w-5 h-5 mr-3 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Output Ledger
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Logs</span>
                <span className="bg-zinc-900 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded text-xs font-bold">
                  {queries.length + (liveQuery ? 1 : 0)}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {(!liveQuery && queries.length === 0) ? (
                <div className="bg-zinc-900/20 rounded-3xl border-2 border-dashed border-zinc-800/50 p-16 text-center">
                  <div className="mx-auto w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
                    <svg className="w-10 h-10 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <h3 className="text-zinc-400 font-bold text-lg">System Idle</h3>
                  <p className="text-zinc-600 text-sm mt-2 max-w-xs mx-auto">Awaiting incoming language signals for real-time English mapping.</p>
                </div>
              ) : (
                <>
                  {liveQuery && <TranslationCard key={liveQuery.id} query={liveQuery} />}
                  {queries.map((q) => (
                    <TranslationCard key={q.id} query={q} />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-10 border-t border-zinc-900 text-center">
        <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.2em]">
          End-to-End Neural Translation Protocol v3.1
        </p>
      </footer>
    </div>
  );
};

export default App;
