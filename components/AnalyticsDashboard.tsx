
import React, { useState, useEffect, useRef } from 'react';
import { 
  ScanEye, Crosshair, Radar, Target, 
  Send, Lock, Unlock, TrendingUp, 
  Zap, BarChart2, Radio, Trophy, Activity, Loader2, StopCircle, Globe, Search, Link as LinkIcon, BrainCircuit
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
    "Trending AI Tools 2024", "Skincare Rutine Viral", "Crypto Gems under $1", 
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
  const [deepScanFocus, setDeepScanFocus] = useState('High RPM & Trending');
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

  const handleStartManualMission = async () => {
    if (!missionInput.trim()) return;
    setIsAutoRecon(false);
    await executeScan(missionInput);
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
            addLog(">>> NEW WINNER IDENTIFIED <<<", "text-red-400");
            
            if (result.match_score >= 80 && onSyncToBrain) {
                onSyncToBrain(result);
                addLog("🧠 TRANSMITTING WINNER DATA TO BRAIN...", "text-yellow-400");
            }

            if (isAutoRecon) {
                onSendReportToChat?.(`🏆 **AUTO-RECON WINNER FOUND**\nTarget: ${result.target_name}\nScore: ${result.match_score}\nStrategy: ${result.strategic_suggestion}`);
            }
        }

    } catch (e: any) {
        addLog(`Error: ${e.message}`, "text-red-400");
        setStatus('idle');
    }
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
          addLog("Cooling down sensors... (5s)", "text-slate-400");
          timeout = setTimeout(runLoop, 5000);
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

  const handleTransmitToCommander = (data: HunterInsight) => {
      if (!onSendReportToChat) return;
      const report = `🦅 **HUNTER BOT REPORT: ${data.target_name}**\n...\n💡 "${data.strategic_suggestion}"`;
      onSendReportToChat(report);
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12 h-full flex flex-col">
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
         <div>
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                <Radar className={`text-red-500 ${isAutoRecon ? 'animate-spin-slow' : ''}`} size={28} />
                {texts.title || "Strategic Intelligence Hub"}
            </h2>
            <p className="text-slate-400 text-xs md:text-sm">
                {texts.subtitle || "Automatic reconnaissance."}
            </p>
         </div>
         <div className="flex items-center gap-2">
             <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                 <button 
                    onClick={() => setActiveView('standard')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeView === 'standard' ? 'bg-slate-900 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                 >
                    {texts.view_standard}
                 </button>
                 <button 
                    onClick={() => setActiveView('deep_scan')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${activeView === 'deep_scan' ? 'bg-purple-900/50 text-purple-300 shadow border border-purple-500/30' : 'text-slate-400 hover:text-white'}`}
                 >
                    <Globe size={12} /> {texts.view_deep}
                 </button>
             </div>

             <button 
                onClick={toggleAutoRecon}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border ${
                    isAutoRecon 
                    ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                disabled={activeView === 'deep_scan'}
             >
                 {isAutoRecon ? <StopCircle size={18} /> : <Activity size={18} />}
                 <span className="hidden md:inline">{isAutoRecon ? texts.stop_auto_btn : texts.auto_recon_btn}</span>
             </button>
         </div>
      </div>

      {activeView === 'standard' && (
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
              <div className="bg-black border border-slate-700 rounded-xl p-4 relative overflow-hidden shrink-0">
                  <label className="text-[10px] font-bold text-red-500 uppercase mb-2 flex items-center gap-2">
                     <Crosshair size={12} /> {texts.manual_target}
                  </label>
                  <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={missionInput}
                        onChange={(e) => setMissionInput(e.target.value)}
                        placeholder="..."
                        disabled={isAutoRecon}
                        className="flex-1 bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 text-sm text-green-400 font-mono focus:border-red-500 focus:outline-none disabled:opacity-30"
                        onKeyDown={(e) => e.key === 'Enter' && handleStartManualMission()}
                    />
                    <button 
                        onClick={handleStartManualMission}
                        disabled={isAutoRecon || !missionInput}
                        className="bg-slate-800 text-white p-2 rounded-lg hover:bg-red-900/50 disabled:opacity-30 transition-colors"
                    >
                        <ScanEye size={18} />
                    </button>
                  </div>
              </div>

              <div className="flex-1 bg-black border border-slate-800 rounded-xl p-0 flex flex-col font-mono text-xs overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                   <div className="bg-slate-900/80 px-3 py-2 border-b border-slate-800 flex justify-between items-center shrink-0">
                       <span className="flex items-center gap-2 text-slate-400 font-bold"><Radio size={12} className={isAutoRecon ? "text-green-500 animate-pulse" : ""} /> {texts.logs_title}</span>
                       <div className="flex gap-1">
                           <div className="w-2 h-2 rounded-full bg-red-500/30"></div>
                           <div className="w-2 h-2 rounded-full bg-yellow-500/30"></div>
                           <div className="w-2 h-2 rounded-full bg-green-500/30"></div>
                       </div>
                   </div>
                   <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scroll-smooth bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-90">
                       {logs.length === 0 && <span className="text-slate-700 italic">{texts.waiting}</span>}
                       {logs.map((log, i) => (
                           <div key={i} className="flex gap-2 animate-fade-in">
                               <span className="text-slate-600 shrink-0">[{log.time}]</span>
                               <span className={`${log.color} break-all`}>{`> ${log.msg}`}</span>
                           </div>
                       ))}
                       <div ref={logsEndRef} />
                   </div>
              </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                  <Target size={16} className="text-blue-500" /> {texts.analysis_title}
              </h3>
              
              {status === 'hunting' || status === 'analyzing' ? (
                  <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center animate-pulse">
                      <ScanEye size={48} className="text-blue-500 mb-4 animate-bounce" />
                      <h4 className="text-xl font-bold text-white mb-2">Analyzing Data Streams...</h4>
                  </div>
              ) : insight ? (
                  <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-y-auto relative group">
                      <div className="mb-4">
                          <h2 className="text-xl font-bold text-white leading-tight">{insight.target_name}</h2>
                          <div className="flex gap-2 mt-2">
                              <span className="px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded text-[10px] border border-blue-500/20">{insight.type}</span>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                              <div className="text-[10px] text-slate-500 mb-1">Score</div>
                              <div className={`text-2xl font-bold ${insight.match_score > 75 ? 'text-green-400' : 'text-yellow-400'}`}>
                                  {insight.match_score}
                              </div>
                          </div>
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                              <div className="text-[10px] text-slate-500 mb-1">Profit</div>
                              <div className="text-sm font-bold text-white mt-1 line-clamp-1">{insight.hidden_analysis.profit_potential}</div>
                          </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
                          <NeonButton onClick={() => onDeployStrategy(insight.target_name, 'clone')} size="sm" className="flex-1">
                              {texts.deploy_btn}
                          </NeonButton>
                          <button onClick={() => handleTransmitToCommander(insight)} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white">
                              <Send size={16} />
                          </button>
                      </div>
                  </div>
              ) : (
                  <div className="flex-1 bg-slate-900/30 border border-slate-800/50 rounded-2xl flex items-center justify-center text-slate-600 text-sm">
                      Waiting...
                  </div>
              )}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                  <Trophy size={16} className="text-yellow-500" /> {texts.winner_title}
              </h3>

              {winner ? (
                  <div className="flex-1 bg-gradient-to-b from-yellow-900/20 to-slate-900 border border-yellow-500/30 rounded-2xl p-1 relative overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                      <div className="h-full bg-slate-900/90 rounded-xl p-5 flex flex-col relative z-10">
                          <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
                              <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                                  <Trophy size={24} />
                              </div>
                              <div>
                                  <h2 className="text-lg font-bold text-white line-clamp-2">{winner.target_name}</h2>
                              </div>
                          </div>
                          <div className="mt-4 pt-4">
                              <NeonButton 
                                onClick={() => onDeployStrategy(winner.target_name, 'clone')} 
                                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 border-none text-white hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                              >
                                  {texts.deploy_btn}
                              </NeonButton>
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="flex-1 bg-slate-900/30 border border-slate-800 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center">
                      <Trophy size={40} className="text-slate-700 mb-3" />
                      <p className="text-slate-500 text-xs">Scanning...</p>
                  </div>
              )}
          </div>
      </div>
      )}

      {activeView === 'deep_scan' && (
          <div className="flex-1 animate-fade-in flex flex-col gap-6">
              <div className="bg-slate-900/50 border border-purple-500/20 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1 w-full">
                      <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                          <Globe className="text-purple-500" size={24} /> {texts.view_deep}
                      </h3>
                      <div className="flex gap-2">
                          <input 
                              type="text" 
                              value={deepScanFocus}
                              onChange={(e) => setDeepScanFocus(e.target.value)}
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none shadow-inner"
                          />
                          <NeonButton 
                              onClick={handleDeepScan} 
                              disabled={deepScanStatus === 'scanning'}
                              className="min-w-[150px]"
                          >
                              {deepScanStatus === 'scanning' ? (
                                  <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> ...</span>
                              ) : (
                                  <span className="flex items-center gap-2"><Search size={18} /> Scan</span>
                              )}
                          </NeonButton>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
