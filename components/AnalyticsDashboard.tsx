
import React, { useState, useEffect, useRef } from 'react';
import { 
  ScanEye, Crosshair, Radar, Target, 
  Send, Lock, Unlock, TrendingUp, 
  Zap, BarChart2, Radio, Trophy, Activity, Loader2, StopCircle, Globe, Search, Link as LinkIcon, BrainCircuit, ShieldAlert, Layers, MapPin, ExternalLink
} from 'lucide-react';
import { ApiKeyConfig, HunterInsight, NetworkScanResult } from '../types';
import NeonButton from './NeonButton';
import { runHunterAnalysis, scanHighValueNetwork } from '../services/geminiService';

interface AnalyticsDashboardProps {
  apiKeys: ApiKeyConfig[];
  onDeployStrategy: (url: string, type: 'clone' | 'review') => void;
  onSendReportToChat?: (report: string) => void;
  onSyncToBrain?: (insight: HunterInsight) => void;
  t?: any;
}

const AUTO_TARGETS = [
    "Trending AI Tools 2024", "Skincare Routine Viral", "Crypto Gems under $1", 
    "Kitchen Gadgets Amazon", "Make Money Online Fast", "Tech Reviewer @MKBHD", 
    "Funny Cat Videos", "Weight Loss Tips", "Gaming Setup Cheap", "Travel Hacks Japan"
];

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ apiKeys, onDeployStrategy, onSendReportToChat, onSyncToBrain, t }) => {
  const texts = t || {};
  const [activeView, setActiveView] = useState<'standard' | 'deep_scan'>('standard');
  const [isAutoRecon, setIsAutoRecon] = useState(false);
  const [missionInput, setMissionInput] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'hunting' | 'analyzing' | 'complete'>('idle');
  const [insight, setInsight] = useState<HunterInsight | null>(null);
  const [winner, setWinner] = useState<HunterInsight | null>(null);
  const [scanCount, setScanCount] = useState(0);

  const [deepScanStatus, setDeepScanStatus] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [deepScanFocus, setDeepScanFocus] = useState('AI Software & SaaS Trends');
  const [networkResult, setNetworkResult] = useState<NetworkScanResult | null>(null);

  const [logs, setLogs] = useState<{time: string, msg: string, color: string}[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (msg: string, color: 'text-slate-400' | 'text-green-400' | 'text-yellow-400' | 'text-red-400' = 'text-slate-400') => {
      setLogs(prev => [...prev.slice(-15), {
          time: new Date().toLocaleTimeString('en-US', {hour12: false}), 
          msg, 
          color 
      }]);
  };

  const executeScan = async (target: string) => {
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
    if (!googleKey) {
        addLog("CRITICAL: No Google API Key found.", "text-red-400");
        setIsAutoRecon(false);
        return;
    }

    setStatus('hunting');
    addLog(`Initiating scan on target: "${target}"...`, "text-yellow-400");

    try {
        await new Promise(r => setTimeout(r, 1000));
        addLog("Interception competitor signals...", "text-green-400");
        setStatus('analyzing');
        
        await new Promise(r => setTimeout(r, 1000));
        addLog("Compiling Strategic Intelligence...", "text-green-400");
        
        const result = await runHunterAnalysis(googleKey.key, target);
        
        setInsight(result);
        setScanCount(prev => prev + 1);
        setStatus('complete');
        addLog(`Scan Complete. Match Score: ${result.match_score}/100`, "text-green-400");

        if (!winner || result.match_score > winner.match_score) {
            setWinner(result);
        }

    } catch (e: any) {
        addLog(`Error: ${e.message}`, "text-red-400");
        setStatus('idle');
    }
  };

  const handleStartManualMission = async () => {
    if (!missionInput.trim()) return;
    setIsAutoRecon(false);
    await executeScan(missionInput);
  };

  const handleDeepScan = async () => {
      const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
      if (!googleKey) {
          alert("Key Error.");
          return;
      }

      setDeepScanStatus('scanning');
      setNetworkResult(null);
      
      try {
          const result = await scanHighValueNetwork(googleKey.key, deepScanFocus);
          setNetworkResult(result);
          setDeepScanStatus('complete');
      } catch (e) {
          console.error(e);
          setDeepScanStatus('idle');
      }
  };

  useEffect(() => {
      let timeout: ReturnType<typeof setTimeout>;

      const runLoop = async () => {
          if (!isAutoRecon) return;
          const target = AUTO_TARGETS[Math.floor(Math.random() * AUTO_TARGETS.length)];
          await executeScan(target);
          timeout = setTimeout(runLoop, 8000);
      };

      if (isAutoRecon) {
          addLog("AUTO-RECON ENABLED. HUNTING 24/7...", "text-red-400");
          runLoop();
      }

      return () => clearTimeout(timeout);
  }, [isAutoRecon]); 

  const toggleAutoRecon = () => {
      setIsAutoRecon(!isAutoRecon);
      if (isAutoRecon) {
          setStatus('idle');
          addLog("Auto-Recon Disengaged.", "text-yellow-400");
      }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12 h-full flex flex-col">
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
         <div>
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                <Radar className={`text-red-500 ${isAutoRecon ? 'animate-spin-slow' : ''}`} size={28} />
                {texts.analytics || "Strategic Intelligence Hub"}
            </h2>
            <p className="text-slate-400 text-xs md:text-sm">
                Advanced Autonomous Reconnaissance Engine v3.1
            </p>
         </div>
         <div className="flex items-center gap-2">
             <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                 <button 
                    onClick={() => setActiveView('standard')}
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeView === 'standard' ? 'bg-slate-900 text-white shadow-neon' : 'text-slate-400 hover:text-white'}`}
                 >
                    Standard Recon
                 </button>
                 <button 
                    onClick={() => setActiveView('deep_scan')}
                    className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeView === 'deep_scan' ? 'bg-purple-900/50 text-purple-300 shadow border border-purple-500/30' : 'text-slate-400 hover:text-white'}`}
                 >
                    <Globe size={14} /> Deep Network Audit
                 </button>
             </div>

             <button 
                onClick={toggleAutoRecon}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                    isAutoRecon 
                    ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                disabled={activeView === 'deep_scan'}
             >
                 {isAutoRecon ? <StopCircle size={18} /> : <Activity size={18} />}
                 <span>{isAutoRecon ? "TERMINATE" : "AUTO-PILOT RECON"}</span>
             </button>
         </div>
      </div>

      {activeView === 'standard' && (
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          {/* TERMINAL & INPUT */}
          <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shrink-0 shadow-2xl">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                  <label className="text-[10px] font-black text-red-500 uppercase mb-3 flex items-center gap-2 tracking-widest">
                     <Target size={12} /> Target Signal Input
                  </label>
                  <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={missionInput}
                        onChange={(e) => setMissionInput(e.target.value)}
                        placeholder="Paste URL or Topic Keyword..."
                        disabled={isAutoRecon}
                        className="flex-1 bg-black border border-slate-700 rounded-xl px-4 py-3 text-sm text-green-400 font-mono focus:border-red-500 focus:outline-none disabled:opacity-30"
                        onKeyDown={(e) => e.key === 'Enter' && handleStartManualMission()}
                    />
                    <button 
                        onClick={handleStartManualMission}
                        disabled={isAutoRecon || !missionInput}
                        className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-500 disabled:opacity-30 transition-all shadow-lg active:scale-95"
                    >
                        <ScanEye size={20} />
                    </button>
                  </div>
              </div>

              <div className="flex-1 bg-black border border-slate-800 rounded-2xl p-0 flex flex-col font-mono text-xs overflow-hidden relative shadow-[inset_0_0_40px_rgba(0,0,0,1)]">
                   <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center shrink-0">
                       <span className="flex items-center gap-2 text-slate-400 font-black tracking-tighter italic">
                            <Radio size={14} className={isAutoRecon ? "text-green-500 animate-pulse" : ""} /> 
                            SYSTEM_OS_LOG_STREAM
                       </span>
                       <div className="flex gap-1.5">
                           <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                       </div>
                   </div>
                   <div className="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-95">
                       {logs.length === 0 && <span className="text-slate-800 italic uppercase tracking-widest text-[10px]">Standby... awaiting signal...</span>}
                       {logs.map((log, i) => (
                           <div key={i} className="flex gap-3 animate-fade-in group border-l border-slate-800 pl-3">
                               <span className="text-slate-600 shrink-0 font-bold">[{log.time}]</span>
                               <span className={`${log.color} break-all font-medium leading-relaxed`}>{`>> ${log.msg}`}</span>
                           </div>
                       ))}
                       <div ref={logsEndRef} />
                   </div>
              </div>
          </div>

          {/* INSIGHT VIEW */}
          <div className="lg:col-span-8 flex flex-col gap-4">
              {status === 'hunting' || status === 'analyzing' ? (
                  <div className="flex-1 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent"></div>
                      <div className="w-32 h-32 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-8"></div>
                      <ScanEye size={64} className="text-red-500 mb-6 absolute animate-pulse" />
                      <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Intercepting Signal...</h4>
                      <p className="text-slate-500 font-mono text-sm">Decrypting competitor strategy metadata...</p>
                  </div>
              ) : insight ? (
                  <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-8 overflow-y-auto relative group shadow-2xl">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Radar size={200} className="text-white" />
                      </div>
                      
                      <div className="flex justify-between items-start mb-8 border-b border-slate-800 pb-8">
                          <div>
                              <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">TARGET_ID: {insight.type}</div>
                              <h2 className="text-4xl font-black text-white leading-none tracking-tighter mb-2">{insight.target_name}</h2>
                              <div className="text-slate-500 font-mono text-xs italic">Market Status: {insight.market_status}</div>
                          </div>
                          <div className="text-center bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl min-w-[120px]">
                              <div className="text-[10px] text-slate-500 font-black uppercase mb-1">MATCH_SCORE</div>
                              <div className={`text-4xl font-mono font-black ${insight.match_score > 75 ? 'text-green-500' : 'text-yellow-500'}`}>
                                  {insight.match_score}
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                          <div className="space-y-6">
                              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={16} className="text-red-500" /> Hidden Intelligence
                              </h3>
                              <div className="space-y-4">
                                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                      <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Consumer Psychology</div>
                                      <p className="text-sm text-slate-300 leading-relaxed italic">"{insight.hidden_analysis.consumer_psychology}"</p>
                                  </div>
                                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                      <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Competitor Weakness</div>
                                      <p className="text-sm text-red-400/80 leading-relaxed font-bold">"{insight.hidden_analysis.competitor_weakness}"</p>
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-6">
                              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp size={16} className="text-green-500" /> Key Metrics Output
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                  {insight.key_metrics.map((m, i) => (
                                      <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                                          <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">{m.label}</div>
                                          <div className="text-xl font-black text-white">{m.value}</div>
                                          <div className={`text-[10px] font-bold mt-1 ${m.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                              {m.trend === 'up' ? '▲ POSITIVE' : '▼ NEGATIVE'}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>

                      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-8">
                          <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                             <Zap size={16} /> Strategic Deployment Suggestion
                          </h3>
                          <p className="text-white font-bold leading-relaxed">"{insight.strategic_suggestion}"</p>
                      </div>

                      <div className="flex gap-4">
                          <NeonButton onClick={() => onDeployStrategy(insight.target_name, 'clone')} className="flex-1 h-14">
                              DEPLOY AUTO-PILOT MISSION
                          </NeonButton>
                          <button 
                            onClick={() => onSendReportToChat?.(`RECON_REPORT: ${insight.target_name}\nSuggestion: ${insight.strategic_suggestion}`)}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-8 rounded-xl font-bold text-sm transition-all"
                          >
                            TRANSMIT TO COMMANDER
                          </button>
                      </div>
                  </div>
              ) : (
                  <div className="flex-1 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-12 text-center">
                      <Layers size={48} className="text-slate-800 mb-4" />
                      <h4 className="text-xl font-bold text-slate-600 uppercase tracking-tighter">Awaiting Signal Acquisition</h4>
                      <p className="text-slate-700 text-sm max-w-xs mt-2">Enter a target keyword or URL to begin autonomous reconnaissance.</p>
                  </div>
              )}
          </div>
      </div>
      )}

      {activeView === 'deep_scan' && (
          <div className="flex-1 animate-fade-in flex flex-col gap-6 overflow-hidden">
              <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
                  <div className="flex-1 w-full">
                      <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
                          <Globe className="text-purple-500 animate-pulse" size={32} /> DEEP NETWORK SIGNAL AUDIT
                      </h3>
                      <p className="text-slate-400 text-sm mb-6 max-w-2xl font-medium">
                          Scans the global network for hidden arbitrage opportunities, trending product gaps, and high-CPM niche clusters using Google Search grounding.
                      </p>
                      <div className="flex gap-3">
                          <input 
                              type="text" 
                              value={deepScanFocus}
                              onChange={(e) => setDeepScanFocus(e.target.value)}
                              placeholder="Focus Area (e.g. Health Tech VN, Global SaaS...)"
                              className="flex-1 bg-black border border-slate-700 rounded-2xl px-6 py-4 text-white focus:border-purple-500 focus:outline-none shadow-inner font-bold"
                          />
                          <NeonButton 
                              onClick={handleDeepScan} 
                              disabled={deepScanStatus === 'scanning'}
                              className="min-w-[200px]"
                          >
                              {deepScanStatus === 'scanning' ? (
                                  <span className="flex items-center gap-3"><Loader2 className="animate-spin" /> RUNNING AUDIT...</span>
                              ) : (
                                  <span className="flex items-center gap-3"><Search size={20} /> BEGIN SCAN</span>
                              )}
                          </NeonButton>
                      </div>
                  </div>
                  <div className="hidden lg:flex w-48 h-48 rounded-full border-4 border-purple-500/20 items-center justify-center relative">
                      <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                      <div className="text-center">
                          <div className="text-3xl font-black text-white">2.5k</div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Signals/sec</div>
                      </div>
                  </div>
              </div>

              {deepScanStatus === 'complete' && networkResult && (
                  <div className="flex-1 animate-fade-in bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                      <div className="bg-slate-950 px-8 py-5 border-b border-slate-800 flex justify-between items-center shrink-0">
                          <div className="flex items-center gap-3">
                              <ShieldAlert className="text-purple-500" size={20} />
                              <h4 className="text-sm font-black text-white uppercase tracking-widest">Audit Findings for: {networkResult.focus_area}</h4>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">SCAN_ID: {networkResult.scan_id}</div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                          <div className="grid grid-cols-1 gap-4">
                              {networkResult.targets.map((t, idx) => (
                                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-purple-500/50 transition-all shadow-lg">
                                      <div className="w-12 h-12 rounded-xl bg-purple-900/20 border border-purple-500/30 flex items-center justify-center text-xl font-black text-purple-400 shrink-0">
                                          #{t.rank}
                                      </div>
                                      <div className="flex-1 text-center md:text-left">
                                          <h4 className="text-lg font-black text-white mb-1 uppercase tracking-tight">{t.name}</h4>
                                          <p className="text-sm text-slate-400 font-medium mb-2">{t.reason}</p>
                                          <div className="flex items-center gap-2 justify-center md:justify-start">
                                              <MapPin size={12} className="text-slate-600" />
                                              <span className="text-[11px] font-mono text-slate-500 truncate max-w-md">{t.url}</span>
                                          </div>
                                      </div>
                                      <div className="shrink-0 flex gap-3 w-full md:w-auto">
                                          <button 
                                            onClick={() => onDeployStrategy(t.url, 'review')}
                                            className="flex-1 md:flex-none px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2"
                                          >
                                              DEPLOY UNIT <ExternalLink size={14} />
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
