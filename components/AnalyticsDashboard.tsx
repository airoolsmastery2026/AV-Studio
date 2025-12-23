
import React, { useState, useEffect } from 'react';
import { 
  Radar, Target, Loader2, Search, BrainCircuit, Dna, Zap, Eye, BarChart3, TrendingUp, Terminal, ShieldCheck, Sparkles, Hash, Gauge, CheckSquare, Youtube, Flame, MoveUpRight, Globe, TrendingDown, Layers, Coins, ArrowRight
} from 'lucide-react';
import { ApiKeyConfig, CompetitorDeepAudit, SEOAudit, YouTubeTrend, AIMarketReport } from '../types';
import NeonButton from './NeonButton';
import { runCompetitorDeepDive, runSeoAudit, scoutYouTubeTrends, analyzeAIMarketIntelligence } from '../services/geminiService';

interface AnalyticsDashboardProps {
  apiKeys: ApiKeyConfig[];
  onDeployStrategy: (target: string) => void;
  t?: any;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onDeployStrategy, t }) => {
  const [activeView, setActiveView] = useState<'market_analyst' | 'yt_scout' | 'vidiq_intel' | 'neural_audit'>('market_analyst');
  
  // Market Analyst State
  const [marketReports, setMarketReports] = useState<AIMarketReport[]>([]);
  const [isAnalyzingMarket, setIsAnalyzingMarket] = useState(false);

  // Existing States
  const [ytNiche, setYtNiche] = useState('AI Software & Tools 2025');
  const [isScouting, setIsScouting] = useState(false);
  const [ytTrends, setYtTrends] = useState<YouTubeTrend[]>([]);
  const [auditTarget, setAuditTarget] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [seoTarget, setSeoTarget] = useState('');
  const [isSeoAuditing, setIsSeoAuditing] = useState(false);

  const handleMarketAnalysis = async () => {
    setIsAnalyzingMarket(true);
    try {
      const data = await analyzeAIMarketIntelligence();
      setMarketReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingMarket(false);
    }
  };

  const handleYtScout = async () => {
    setIsScouting(true);
    try {
      const trends = await scoutYouTubeTrends(ytNiche);
      setYtTrends(trends);
    } catch (e) { console.error(e); } finally { setIsScouting(false); }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
         <div>
            <h2 className="text-2xl font-black text-white mb-1 flex items-center gap-3">
                <Radar className="text-red-500 animate-pulse" size={28} />
                Strategic Intel Center
            </h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Tình báo thuật toán & Phân tích cơ hội</p>
         </div>
         <div className="flex bg-slate-900 rounded-2xl p-1 border border-slate-800 shadow-inner overflow-x-auto no-scrollbar max-w-full">
             <button onClick={() => setActiveView('market_analyst')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeView === 'market_analyst' ? 'bg-primary text-white shadow-neon' : 'text-slate-500 hover:text-slate-300'}`}>0. Market Analyst</button>
             <button onClick={() => setActiveView('yt_scout')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeView === 'yt_scout' ? 'bg-red-600 text-white shadow-neon' : 'text-slate-500 hover:text-slate-300'}`}>1. YouTube Scout</button>
             <button onClick={() => setActiveView('vidiq_intel')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeView === 'vidiq_intel' ? 'bg-purple-600 text-white shadow-neon' : 'text-slate-500 hover:text-slate-300'}`}>2. VidIQ Audit</button>
             <button onClick={() => setActiveView('neural_audit')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeView === 'neural_audit' ? 'bg-slate-700 text-white shadow-neon' : 'text-slate-500 hover:text-slate-300'}`}>3. Neural Autopsy</button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl space-y-6">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <Terminal size={18} className="text-primary" /> Intelligence Core
                  </h3>
                  
                  <div className="space-y-4">
                      {activeView === 'market_analyst' ? (
                          <div className="space-y-4">
                              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Chế độ phân tích</p>
                                  <div className="text-xs text-white font-medium italic">"Deep Market Recon: Quét đại dương xanh, tìm ngách ít cạnh tranh hoa hồng cao."</div>
                              </div>
                              <NeonButton onClick={handleMarketAnalysis} disabled={isAnalyzingMarket} className="w-full h-14">
                                  {isAnalyzingMarket ? <Loader2 className="animate-spin" /> : <Globe size={18} />} 
                                  {isAnalyzingMarket ? 'SCANNING MARKET...' : 'SCAN BLUE OCEANS'}
                              </NeonButton>
                          </div>
                      ) : activeView === 'yt_scout' ? (
                          <>
                            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block">Target Niche</label>
                                <input value={ytNiche} onChange={(e) => setYtNiche(e.target.value)} className="w-full bg-transparent border-none text-red-500 font-mono font-bold focus:outline-none placeholder:text-slate-800" />
                            </div>
                            <NeonButton onClick={handleYtScout} disabled={isScouting} className="w-full h-14">
                                {isScouting ? <Loader2 className="animate-spin" /> : <Flame size={18} />} 
                                {isScouting ? 'SCOUTING...' : 'RE-SCAN TRENDS'}
                            </NeonButton>
                          </>
                      ) : (
                          <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700 italic text-[10px] text-slate-400">
                              Chọn tab để truy cập các bộ công cụ tình báo khác.
                          </div>
                      )}
                  </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-[32px] p-6 flex gap-4">
                  <ShieldCheck size={20} className="text-primary shrink-0" />
                  <p className="text-[10px] text-slate-400 italic">"Dữ liệu được trích xuất từ Google Search Real-time, đảm bảo độ trễ thấp nhất so với xu hướng toàn cầu."</p>
              </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-8">
              {activeView === 'market_analyst' && (
                  <div className="space-y-6 animate-fade-in">
                      {isAnalyzingMarket ? (
                          <div className="py-20 flex flex-col items-center justify-center space-y-6 opacity-40">
                              <div className="relative">
                                  <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                                  <Globe size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                              </div>
                              <h4 className="text-xl font-black uppercase tracking-widest text-white">Synthesizing Market Signals...</h4>
                          </div>
                      ) : marketReports.length > 0 ? (
                          <div className="grid grid-cols-1 gap-6">
                              {marketReports.map((report, idx) => (
                                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 hover:border-primary/40 transition-all group relative overflow-hidden shadow-2xl">
                                      <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform"><TrendingUp size={120}/></div>
                                      
                                      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                                          <div className="space-y-2">
                                              <div className="flex items-center gap-2">
                                                  <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg text-primary text-[9px] font-black uppercase">OPPORTUNITY #{idx+1}</span>
                                                  <div className="flex items-center gap-1 text-green-500">
                                                      <TrendingUp size={14} />
                                                      <span className="text-[10px] font-black">{report.growth_velocity}% Growth</span>
                                                  </div>
                                              </div>
                                              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{report.sub_niche}</h3>
                                              <p className="text-xs text-slate-400 italic max-w-xl">"{report.monetization_logic}"</p>
                                          </div>
                                          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center min-w-[120px]">
                                              <div className="text-[8px] text-slate-500 font-black uppercase mb-1">Bounty Score</div>
                                              <div className="text-3xl font-black text-primary font-mono">{report.bounty_score}</div>
                                          </div>
                                      </div>

                                      <div className="space-y-4">
                                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                              <Coins size={14} className="text-yellow-500" /> Top Bounty Targets
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                              {report.top_products.map((prod, pIdx) => (
                                                  <div key={pIdx} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 hover:bg-slate-900 transition-colors">
                                                      <div>
                                                          <h4 className="text-xs font-black text-white uppercase truncate">{prod.name}</h4>
                                                          <div className="text-[9px] text-slate-500 font-bold uppercase">{prod.network}</div>
                                                      </div>
                                                      <div className="flex justify-between items-center">
                                                          <span className="text-[10px] text-green-400 font-black">{prod.avg_commission} Comm.</span>
                                                          <span className={`text-[8px] px-2 py-0.5 rounded border font-black uppercase ${
                                                              prod.entry_barrier === 'Low' ? 'text-blue-400 border-blue-500/30 bg-blue-500/5' : 
                                                              prod.entry_barrier === 'Medium' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5' : 
                                                              'text-red-400 border-red-500/30 bg-red-500/5'
                                                          }`}>{prod.entry_barrier} Barrier</span>
                                                      </div>
                                                      <button 
                                                        onClick={() => onDeployStrategy(prod.name)}
                                                        className="w-full py-2 bg-slate-800 hover:bg-primary text-slate-400 hover:text-white rounded-lg text-[8px] font-black uppercase transition-all flex items-center justify-center gap-2"
                                                      >
                                                          Clone DNA <MoveUpRight size={10} />
                                                      </button>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="py-32 flex flex-col items-center justify-center text-center space-y-4 opacity-20 border-2 border-dashed border-slate-800 rounded-[40px]">
                              <Sparkles size={64} />
                              <div className="space-y-1">
                                  <h4 className="text-2xl font-black uppercase text-white">No Intelligence Staged</h4>
                                  <p className="text-xs font-bold uppercase">Nhấn "SCAN BLUE OCEANS" để Robot bắt đầu giải mã thị trường.</p>
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {activeView === 'yt_scout' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                      {isScouting ? (
                          <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-6 opacity-40">
                              <Loader2 size={40} className="animate-spin text-red-500" />
                              <h4 className="text-xl font-black uppercase tracking-widest">Scouring YouTube Signals...</h4>
                          </div>
                      ) : ytTrends.map((trend, idx) => (
                          <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] hover:border-red-500/30 transition-all group">
                              <div className="flex justify-between items-start mb-4">
                                  <div>
                                      <h4 className="text-sm font-black text-white uppercase truncate max-w-[200px]">{trend.keyword}</h4>
                                      <span className="text-[10px] text-slate-500 font-bold uppercase">{trend.volume} Search Vol</span>
                                  </div>
                                  <div className="px-2 py-1 bg-red-500/10 rounded-lg text-red-500 text-[8px] font-black uppercase border border-red-500/20">{trend.competition} COMP.</div>
                              </div>
                              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6">
                                  <div className="flex justify-between items-center mb-1.5">
                                      <span className="text-[9px] text-slate-500 font-black uppercase">Viral Potential</span>
                                      <span className="text-xs font-black text-red-400">{(trend.potential_ctr * 100).toFixed(0)}%</span>
                                  </div>
                                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                      <div className="bg-red-500 h-full" style={{ width: `${trend.potential_ctr * 100}%` }}></div>
                                  </div>
                              </div>
                              <button 
                                onClick={() => onDeployStrategy(trend.keyword)}
                                className="w-full py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-neon flex items-center justify-center gap-2"
                              >
                                Clone Viral DNA <MoveUpRight size={14}/>
                              </button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
