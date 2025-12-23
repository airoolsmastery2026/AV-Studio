
import React, { useState, useEffect, useRef } from 'react';
import { 
  ScanEye, Crosshair, Radar, Target, 
  Activity, Loader2, StopCircle, Globe, Search, BrainCircuit, ShieldAlert, Layers, MapPin, ExternalLink, Scissors, Dna, Rocket, Zap, Eye, BarChart3, TrendingUp, DollarSign, Terminal, ShieldCheck, AlertTriangle, Sparkles, Hash, Gauge, CheckSquare, Youtube, Flame, MoveUpRight, BarChartHorizontal
} from 'lucide-react';
import { ApiKeyConfig, CompetitorDeepAudit, SEOAudit, YouTubeTrend } from '../types';
import NeonButton from './NeonButton';
import { runCompetitorDeepDive, runSeoAudit, scoutYouTubeTrends } from '../services/geminiService';

interface AnalyticsDashboardProps {
  apiKeys: ApiKeyConfig[];
  onDeployStrategy: (url: string, type: 'clone' | 'review') => void;
  onSendReportToChat?: (report: string) => void;
  t?: any;
  predefinedTarget?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ apiKeys, onDeployStrategy, onSendReportToChat, t, predefinedTarget }) => {
  const texts = t || {};
  const [activeView, setActiveView] = useState<'neural_audit' | 'market_recon' | 'vidiq_intel' | 'yt_scout'>('neural_audit');
  
  // State for Neural Audit
  const [auditTarget, setAuditTarget] = useState(predefinedTarget || '');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<CompetitorDeepAudit | null>(null);
  
  // State for VidIQ Intel
  const [seoTarget, setSeoTarget] = useState('');
  const [isSeoAuditing, setIsSeoAuditing] = useState(false);
  const [seoResult, setSeoResult] = useState<SEOAudit | null>(null);

  // State for YouTube Scout
  const [ytNiche, setYtNiche] = useState('AI Technology & Tools');
  const [isScouting, setIsScouting] = useState(false);
  const [ytTrends, setYtTrends] = useState<YouTubeTrend[]>([]);

  const [logs, setLogs] = useState<{time: string, msg: string, color: string}[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (predefinedTarget) {
      setAuditTarget(predefinedTarget);
      handleNeuralAudit(predefinedTarget);
    }
  }, [predefinedTarget]);

  const addLog = (msg: string, color: string = 'text-slate-400') => {
      setLogs(prev => [...prev.slice(-15), { time: new Date().toLocaleTimeString('en-US', {hour12: false}), msg, color }]);
  };

  const handleNeuralAudit = async (targetOverride?: string) => {
      const target = targetOverride || auditTarget;
      if (!target.trim()) return;
      setIsAuditing(true);
      setAuditResult(null);
      addLog(`INITIATING NEURAL AUTOPSY ON: ${target}`, 'text-primary');
      
      try {
          const result = await runCompetitorDeepDive(target);
          setAuditResult(result);
          addLog(`AUTOPSY COMPLETE. CHANNEL: ${result.channel_name}`, 'text-green-400');
      } catch (e) {
          addLog(`CRITICAL ERROR IN SHADOW ANALYST: ${e}`, 'text-red-500');
      } finally {
          setIsAuditing(false);
      }
  };

  const handleSeoAudit = async () => {
    if (!seoTarget.trim()) return;
    setIsSeoAuditing(true);
    setSeoResult(null);
    addLog(`RUNNING VIDIQ SEO AUDIT ON: ${seoTarget}`, 'text-purple-400');
    
    try {
        const result = await runSeoAudit(seoTarget, "", "General AI");
        setSeoResult(result);
        addLog(`SEO AUDIT COMPLETE. SCORE: ${result.seo_score}/100`, 'text-green-400');
    } catch (e) {
        addLog(`SEO AUDIT FAILED: ${e}`, 'text-red-500');
    } finally {
        setIsSeoAuditing(false);
    }
  };

  const handleYtScout = async () => {
    setIsScouting(true);
    setYtTrends([]);
    addLog(`SCOUTING YOUTUBE SHORTS TRENDS FOR: ${ytNiche}`, 'text-red-400');
    try {
        const trends = await scoutYouTubeTrends(ytNiche);
        setYtTrends(trends);
        addLog(`SCOUT COMPLETE. FOUND ${trends.length} TRENDING CLUSTERS.`, 'text-green-400');
    } catch (e) {
        addLog(`SCOUT FAILED: ${e}`, 'text-red-500');
    } finally {
        setIsScouting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12 h-full flex flex-col">
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
         <div>
            <h2 className="text-2xl font-black text-white mb-1 flex items-center gap-3">
                <Radar className="text-red-500 animate-pulse" size={28} />
                Strategic Intelligence & VidIQ AI
            </h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Advanced Agentic Reconnaissance Center</p>
         </div>
         <div className="flex bg-slate-900 rounded-2xl p-1.5 border border-slate-800 shadow-inner overflow-x-auto no-scrollbar">
             <button onClick={() => setActiveView('neural_audit')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeView === 'neural_audit' ? 'bg-primary text-white shadow-neon' : 'text-slate-500 hover:text-slate-300'}`}>1. Neural Autopsy</button>
             <button onClick={() => setActiveView('vidiq_intel')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeView === 'vidiq_intel' ? 'bg-purple-600 text-white shadow-neon' : 'text-slate-500 hover:text-slate-300'}`}>2. VidIQ Intelligence</button>
             <button onClick={() => setActiveView('yt_scout')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeView === 'yt_scout' ? 'bg-red-600 text-white shadow-neon' : 'text-slate-500 hover:text-slate-300'}`}>3. YouTube Trend Scout</button>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
          
          {/* LEFT: COMMAND TERMINAL */}
          <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
              <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 shadow-2xl space-y-6">
                  <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Terminal size={16} className="text-primary" /> Intelligence Module
                      </h3>
                      <div className="space-y-4">
                          {activeView === 'neural_audit' ? (
                              <>
                                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                    <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Competitor URL / Handle</label>
                                    <input 
                                        value={auditTarget}
                                        onChange={(e) => setAuditTarget(e.target.value)}
                                        placeholder="e.g. youtube.com/@channel"
                                        className="w-full bg-transparent border-none text-primary font-mono font-bold focus:outline-none placeholder:text-slate-800"
                                    />
                                </div>
                                <NeonButton onClick={() => handleNeuralAudit()} disabled={isAuditing} className="w-full h-14">
                                    {isAuditing ? <Loader2 className="animate-spin" /> : <Scissors size={18} />} 
                                    {isAuditing ? 'DISSECTING DNA...' : 'START NEURAL AUTOPSY'}
                                </NeonButton>
                              </>
                          ) : activeView === 'vidiq_intel' ? (
                              <>
                                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                    <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Video Title to Optimize</label>
                                    <input 
                                        value={seoTarget}
                                        onChange={(e) => setSeoTarget(e.target.value)}
                                        placeholder="Nhập tiêu đề video dự kiến..."
                                        className="w-full bg-transparent border-none text-purple-400 font-mono font-bold focus:outline-none placeholder:text-slate-800"
                                    />
                                </div>
                                <NeonButton onClick={() => handleSeoAudit()} disabled={isSeoAuditing} className="w-full h-14" variant="primary">
                                    {isSeoAuditing ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />} 
                                    {isSeoAuditing ? 'AUDITING SEO...' : 'RUN VIDIQ AUDIT'}
                                </NeonButton>
                              </>
                          ) : activeView === 'yt_scout' ? (
                                <>
                                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                      <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Target Niche</label>
                                      <input 
                                          value={ytNiche}
                                          onChange={(e) => setYtNiche(e.target.value)}
                                          placeholder="e.g. Cooking Hacks, Crypto News..."
                                          className="w-full bg-transparent border-none text-red-500 font-mono font-bold focus:outline-none placeholder:text-slate-800"
                                      />
                                  </div>
                                  <NeonButton onClick={handleYtScout} disabled={isScouting} className="w-full h-14">
                                      {isScouting ? <Loader2 className="animate-spin" /> : <Flame size={18} />} 
                                      {isScouting ? 'SCOUTING TRENDS...' : 'INFILTRATE YOUTUBE'}
                                  </NeonButton>
                                </>
                          ) : null}
                      </div>
                  </div>

                  <div className="bg-black border border-slate-800 rounded-2xl p-4 h-64 flex flex-col font-mono text-[10px]">
                      <div className="flex justify-between items-center mb-3 text-slate-500 font-bold border-b border-slate-800 pb-2">
                          <span>SYSTEM_LOG_STREAM</span>
                          <span className="animate-pulse">● LIVE</span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                          {logs.map((log, i) => (
                              <div key={i} className={`flex gap-2 ${log.color}`}>
                                  <span className="opacity-40">[{log.time}]</span>
                                  <span className="font-medium">{log.msg}</span>
                              </div>
                          ))}
                          <div ref={logsEndRef} />
                      </div>
                  </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-[32px] p-6">
                  <div className="flex items-center gap-3 mb-3">
                      <ShieldCheck size={20} className="text-primary" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocol Shield</span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic leading-relaxed">
                      "YouTube Integration uses Search Grounding to bypass static keyword lists and reach live algorithm signals."
                  </p>
              </div>
          </div>

          {/* RIGHT: ANALYSIS DECK */}
          <div className="lg:col-span-8 overflow-y-auto pr-2 custom-scrollbar space-y-6">
              {activeView === 'neural_audit' && auditResult && (
                  <div className="animate-fade-in space-y-8">
                      <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Dna size={120} /></div>
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                              <div>
                                  <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">TARGET_ENTITY: {auditResult.channel_name}</div>
                                  <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{auditResult.channel_name}</h2>
                                  <p className="text-slate-400 text-sm italic font-medium mt-2">"{auditResult.overall_strategy}"</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center min-w-[120px]">
                                      <div className="text-[9px] text-slate-500 font-black uppercase">Success Prob.</div>
                                      <div className="text-3xl font-black text-green-500">{auditResult.success_probability}%</div>
                                  </div>
                                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center min-w-[120px]">
                                      <div className="text-[9px] text-slate-500 font-black uppercase">Authority</div>
                                      <div className="text-3xl font-black text-primary">{auditResult.niche_authority_score}</div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-6">
                          {auditResult.top_video_dissection.map((vid, idx) => (
                              <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-[32px] overflow-hidden">
                                  <div className="bg-slate-800 px-6 py-3 border-b border-slate-700 flex justify-between items-center">
                                      <span className="text-[10px] font-black text-white uppercase">Frame #{idx+1}</span>
                                      <span className="text-[9px] font-mono text-slate-400">{vid.timestamp}</span>
                                  </div>
                                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                      <div className="space-y-4">
                                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                              <div className="text-[9px] text-primary font-black mb-1 uppercase">Hook Analysis</div>
                                              <p className="text-xs text-slate-300 leading-relaxed">"{vid.hook_analysis}"</p>
                                          </div>
                                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                              <div className="text-[9px] text-accent font-black mb-1 uppercase">Visual Cues</div>
                                              <p className="text-xs text-slate-300 italic">"{vid.visual_style}"</p>
                                          </div>
                                      </div>
                                      <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                                          <h4 className="text-[10px] text-white font-black uppercase mb-4">AI Clone Strategy</h4>
                                          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] text-primary mb-4">
                                              {vid.clone_blueprint.prompt_equivalent}
                                          </div>
                                          <NeonButton onClick={() => onDeployStrategy(vid.clone_blueprint.prompt_equivalent, 'clone')} className="w-full py-2">DEPLOY CLONE</NeonButton>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {activeView === 'vidiq_intel' && (
                  <div className="animate-fade-in space-y-6">
                      {!seoResult && !isSeoAuditing && (
                          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                              <Gauge size={100} className="mb-6 text-purple-500" />
                              <h4 className="text-2xl font-black uppercase tracking-tighter">SEO Intelligence Ready</h4>
                              <p className="max-w-xs text-xs font-bold uppercase mt-2">Enter a title to evaluate SEO Score and Keyword Competition.</p>
                          </div>
                      )}

                      {isSeoAuditing && (
                          <div className="h-full flex flex-col items-center justify-center py-20">
                             <div className="w-24 h-24 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                             <h4 className="text-xl font-black text-white uppercase tracking-tighter mt-8">Scouring Search Data...</h4>
                          </div>
                      )}

                      {seoResult && (
                          <div className="space-y-6 animate-fade-in">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
                                      <div className="absolute inset-0 bg-purple-600/5 blur-3xl rounded-full"></div>
                                      <div className="text-6xl font-black text-purple-500 relative z-10">{seoResult.seo_score}</div>
                                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2 relative z-10">VidIQ SEO Score</div>
                                  </div>

                                  <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-2xl space-y-6">
                                      <div className="flex justify-between items-center">
                                          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><TrendingUp size={16} className="text-primary"/> Keyword Intel</h3>
                                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                                              seoResult.keyword_difficulty === 'LOW' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                              seoResult.keyword_difficulty === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                          }`}>Difficulty: {seoResult.keyword_difficulty}</span>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4">
                                          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                              <div className="text-[9px] text-slate-500 font-black uppercase mb-1">Search Volume</div>
                                              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
                                                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${seoResult.search_volume_score}%` }}></div>
                                              </div>
                                          </div>
                                          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                              <div className="text-[9px] text-slate-500 font-black uppercase mb-1">Viral Momentum</div>
                                              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
                                                  <div className="bg-accent h-full rounded-full" style={{ width: `${seoResult.trending_momentum}%` }}></div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-xl">
                                      <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3"><CheckSquare size={18} className="text-green-500"/> SEO Checklist</h3>
                                      <div className="space-y-4">
                                          {seoResult.checklist.map((item, i) => (
                                              <div key={i} className="flex items-center gap-4 group">
                                                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-700 text-transparent'}`}>
                                                      <CheckSquare size={12} />
                                                  </div>
                                                  <div className="flex-1">
                                                      <p className="text-xs text-slate-300 font-medium">{item.task}</p>
                                                      <p className="text-[9px] text-slate-500 uppercase font-black">Impact: {item.impact}</p>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>

                                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-xl space-y-6">
                                      <div>
                                          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2"><Hash size={16} className="text-primary"/> Suggested Tags</h3>
                                          <div className="flex flex-wrap gap-2">
                                              {seoResult.suggested_tags.map((tag, i) => (
                                                  <span key={i} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-400">#{tag}</span>
                                              ))}
                                          </div>
                                      </div>

                                      <div className="pt-4 border-t border-slate-800">
                                          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles size={16} className="text-yellow-500"/> Optimized Title Suggestion</h3>
                                          <div className="space-y-3">
                                              {seoResult.title_optimization_suggestions.map((title, i) => (
                                                  <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold leading-relaxed">
                                                      "{title}"
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {activeView === 'yt_scout' && (
                  <div className="animate-fade-in space-y-6">
                      {!isScouting && ytTrends.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                              <Youtube size={100} className="mb-6 text-red-500" />
                              <h4 className="text-2xl font-black uppercase tracking-tighter">YouTube Algorithm Scout</h4>
                              <p className="max-w-xs text-xs font-bold uppercase mt-2">Enter a niche and infiltrate the YouTube trending algorithm signals.</p>
                          </div>
                      )}

                      {isScouting && (
                          <div className="h-full flex flex-col items-center justify-center py-20">
                             <div className="w-24 h-24 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                             <h4 className="text-xl font-black text-white uppercase tracking-tighter mt-8">Infiltrating Algorithm Signals...</h4>
                          </div>
                      )}

                      {ytTrends.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                              {ytTrends.map((trend, idx) => (
                                  <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] hover:border-red-500/40 transition-all group shadow-xl">
                                      <div className="flex justify-between items-start mb-4">
                                          <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                                                  <Flame size={20} className="text-red-500" />
                                              </div>
                                              <div>
                                                  <h4 className="text-sm font-black text-white uppercase tracking-tight">{trend.keyword}</h4>
                                                  <span className="text-[10px] text-slate-500 font-bold uppercase">{trend.volume} Search Vol</span>
                                              </div>
                                          </div>
                                          <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase border ${
                                              trend.competition === 'LOW' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                              trend.competition === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                          }`}>Comp: {trend.competition}</div>
                                      </div>
                                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 mb-4">
                                          <div className="flex justify-between items-center mb-2">
                                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Est. Viral Potential</span>
                                              <span className="text-xs font-black text-red-400">{(trend.potential_ctr * 100).toFixed(1)}% CTR</span>
                                          </div>
                                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                              <div className="bg-red-500 h-full" style={{ width: `${trend.potential_ctr * 100}%` }}></div>
                                          </div>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                          {trend.tags.map((tag, i) => (
                                              <span key={i} className="px-2 py-1 bg-slate-800 text-slate-400 text-[9px] rounded-lg border border-slate-700 font-mono">#{tag}</span>
                                          ))}
                                      </div>
                                      <button 
                                        onClick={() => onDeployStrategy(trend.keyword, 'review')}
                                        className="w-full mt-6 py-3 bg-red-600/10 border border-red-600/20 text-red-500 text-[10px] font-black uppercase rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                      >
                                          Initialize Video for Trend <MoveUpRight size={14}/>
                                      </button>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
