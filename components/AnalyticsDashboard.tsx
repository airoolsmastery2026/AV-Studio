
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
}

// Mock targets for simulation when auto-scanning
const AUTO_TARGETS = [
    "Trending AI Tools 2024", "Skincare Rutine Viral", "Crypto Gems under $1", 
    "Kitchen Gadgets Amazon", "Make Money Online Fast", "Tech Reviewer @MKBHD", 
    "Funny Cat Videos", "Weight Loss Tips", "Gaming Setup Cheap", "Travel Hacks Japan"
];

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ apiKeys, onDeployStrategy, onSendReportToChat, onSyncToBrain }) => {
  // Mode: Manual vs Auto vs Deep Scan
  const [activeView, setActiveView] = useState<'standard' | 'deep_scan'>('standard');
  const [isAutoRecon, setIsAutoRecon] = useState(false);
  const [missionInput, setMissionInput] = useState('');
  
  // Standard Scan State
  const [status, setStatus] = useState<'idle' | 'hunting' | 'analyzing' | 'complete'>('idle');
  const [insight, setInsight] = useState<HunterInsight | null>(null);
  const [winner, setWinner] = useState<HunterInsight | null>(null); // The Best Result found so far
  const [scanCount, setScanCount] = useState(0);

  // Deep Scan State
  const [deepScanStatus, setDeepScanStatus] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [deepScanFocus, setDeepScanFocus] = useState('High RPM & Trending');
  const [networkResult, setNetworkResult] = useState<NetworkScanResult | null>(null);

  // Live Logs
  const [logs, setLogs] = useState<{time: string, msg: string, color: string}[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-Scroll Logs
  useEffect(() => {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // --- LOGGING HELPER ---
  const addLog = (msg: string, color: 'text-slate-400' | 'text-green-400' | 'text-yellow-400' | 'text-red-400' = 'text-slate-400') => {
      setLogs(prev => [...prev.slice(-15), { // Keep last 15 logs
          time: new Date().toLocaleTimeString('en-US', {hour12: false}), 
          msg, 
          color 
      }]);
  };

  // --- MANUAL MISSION ---
  const handleStartManualMission = async () => {
    if (!missionInput.trim()) return;
    setIsAutoRecon(false);
    await executeScan(missionInput);
  };

  // --- CORE SCAN LOGIC (STANDARD) ---
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
        // Simulate scanning steps
        await new Promise(r => setTimeout(r, 1000));
        addLog("Interception competitor signals...", "text-green-400");
        setStatus('analyzing');
        
        await new Promise(r => setTimeout(r, 1000));
        addLog("Compiling Strategic Intelligence...", "text-green-400");
        
        // Call API
        const result = await runHunterAnalysis(googleKey.key, target);
        
        setInsight(result);
        setScanCount(prev => prev + 1);
        setStatus('complete');
        addLog(`Scan Complete. Match Score: ${result.match_score}/100`, "text-green-400");

        // WINNER LOGIC: If new result is better than current winner, update winner
        if (!winner || result.match_score > winner.match_score) {
            setWinner(result);
            addLog(">>> NEW WINNER IDENTIFIED <<<", "text-red-400");
            
            // AUTO SYNC TO BRAIN IF HIGH SCORE
            if (result.match_score >= 80 && onSyncToBrain) {
                onSyncToBrain(result);
                addLog("🧠 TRANSMITTING WINNER DATA TO BRAIN...", "text-yellow-400");
            }

            if (isAutoRecon) {
                // Auto report winner to chat if in auto mode
                onSendReportToChat?.(`🏆 **AUTO-RECON WINNER FOUND**\nTarget: ${result.target_name}\nScore: ${result.match_score}\nStrategy: ${result.strategic_suggestion}`);
            }
        }

    } catch (e: any) {
        addLog(`Error: ${e.message}`, "text-red-400");
        setStatus('idle');
    }
  };

  // --- DEEP NET SCAN LOGIC ---
  const handleDeepScan = async () => {
      const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
      if (!googleKey) {
          alert("Cần Google API Key.");
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
          alert("Deep Scan failed.");
          setDeepScanStatus('idle');
      }
  };

  // --- AUTO RECON LOOP ---
  useEffect(() => {
      let timeout: ReturnType<typeof setTimeout>;

      const runLoop = async () => {
          if (!isAutoRecon) return;

          // Pick random target
          const target = AUTO_TARGETS[Math.floor(Math.random() * AUTO_TARGETS.length)];
          await executeScan(target);

          // Cooldown before next scan
          addLog("Cooling down sensors... (5s)", "text-slate-400");
          timeout = setTimeout(runLoop, 5000);
      };

      if (isAutoRecon) {
          addLog("AUTO-RECON ENABLED. HUNTING 24/7...", "text-red-400");
          runLoop();
      }

      return () => clearTimeout(timeout);
  }, [isAutoRecon]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleAutoRecon = () => {
      setIsAutoRecon(!isAutoRecon);
      if (isAutoRecon) {
          setStatus('idle');
          addLog("Auto-Recon Disengaged.", "text-yellow-400");
      }
  };

  const handleTransmitToCommander = (data: HunterInsight) => {
      if (!onSendReportToChat) return;

      const report = `
🦅 **HUNTER BOT REPORT: ${data.target_name}**
--------------------------------------------
🎯 **Verdict:** ${data.type} (Score: ${data.match_score}/100)
🌊 **Market Status:** ${data.market_status}

📊 **Key Metrics:**
${data.key_metrics.map(m => `- ${m.label}: ${m.value} (${m.trend})`).join('\n')}

🔓 **DECLASSIFIED INTEL:**
🧠 Psychology: ${data.hidden_analysis.consumer_psychology}
⚔️ Weakness: ${data.hidden_analysis.competitor_weakness}
💰 Profit: ${data.hidden_analysis.profit_potential}
⚠️ Risk: ${data.hidden_analysis.risk_assessment}

💡 **STRATEGIC ORDER:**
"${data.strategic_suggestion}"
      `;

      onSendReportToChat(report);
      alert("Report sent to Commander Chat.");
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12 h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
         <div>
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                <Radar className={`text-red-500 ${isAutoRecon ? 'animate-spin-slow' : ''}`} size={28} />
                Strategic Intelligence Hub
            </h2>
            <p className="text-slate-400 text-xs md:text-sm">
                Trung tâm trinh sát tự động. Bot tự động săn lùng và tìm ra "The Winner".
            </p>
         </div>
         <div className="flex items-center gap-2">
             {/* VIEW TOGGLE */}
             <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                 <button 
                    onClick={() => setActiveView('standard')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeView === 'standard' ? 'bg-slate-900 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                 >
                    Standard Scan
                 </button>
                 <button 
                    onClick={() => setActiveView('deep_scan')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${activeView === 'deep_scan' ? 'bg-purple-900/50 text-purple-300 shadow border border-purple-500/30' : 'text-slate-400 hover:text-white'}`}
                 >
                    <Globe size={12} /> Deep Net Scanner
                 </button>
             </div>

             <button 
                onClick={toggleAutoRecon}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border ${
                    isAutoRecon 
                    ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                disabled={activeView === 'deep_scan'} // Disable auto recon when in deep scan mode
             >
                 {isAutoRecon ? <StopCircle size={18} /> : <Activity size={18} />}
                 <span className="hidden md:inline">{isAutoRecon ? "STOP AUTO" : "AUTO-RECON"}</span>
             </button>
         </div>
      </div>

      {activeView === 'standard' && (
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          
          {/* LEFT: COMMAND TERMINAL & LIVE FEED (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
              
              {/* Manual Input (Disable if Auto is On) */}
              <div className="bg-black border border-slate-700 rounded-xl p-4 relative overflow-hidden shrink-0">
                  <label className="text-[10px] font-bold text-red-500 uppercase mb-2 flex items-center gap-2">
                     <Crosshair size={12} /> Manual Targeting
                  </label>
                  <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={missionInput}
                        onChange={(e) => setMissionInput(e.target.value)}
                        placeholder="Keyword / URL / Niche..."
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

              {/* LIVE FEED (Matrix Style) */}
              <div className="flex-1 bg-black border border-slate-800 rounded-xl p-0 flex flex-col font-mono text-xs overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                   <div className="bg-slate-900/80 px-3 py-2 border-b border-slate-800 flex justify-between items-center shrink-0">
                       <span className="flex items-center gap-2 text-slate-400 font-bold"><Radio size={12} className={isAutoRecon ? "text-green-500 animate-pulse" : ""} /> SIGNAL FEED</span>
                       <div className="flex gap-1">
                           <div className="w-2 h-2 rounded-full bg-red-500/30"></div>
                           <div className="w-2 h-2 rounded-full bg-yellow-500/30"></div>
                           <div className="w-2 h-2 rounded-full bg-green-500/30"></div>
                       </div>
                   </div>
                   <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scroll-smooth bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-90">
                       {logs.length === 0 && <span className="text-slate-700 italic">System ready. Awaiting command...</span>}
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

          {/* MIDDLE: CURRENT ANALYSIS (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                  <Target size={16} className="text-blue-500" /> Current Target Analysis
              </h3>
              
              {status === 'hunting' || status === 'analyzing' ? (
                  <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center animate-pulse">
                      <ScanEye size={48} className="text-blue-500 mb-4 animate-bounce" />
                      <h4 className="text-xl font-bold text-white mb-2">Analyzing Data Streams...</h4>
                      <p className="text-slate-400 text-sm">Intercepting packets & calculating potential.</p>
                  </div>
              ) : insight ? (
                  <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-y-auto relative group">
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
                          <Target size={120} />
                      </div>
                      
                      <div className="mb-4">
                          <div className="text-xs text-slate-500 font-bold uppercase mb-1">Target Identified</div>
                          <h2 className="text-xl font-bold text-white leading-tight">{insight.target_name}</h2>
                          <div className="flex gap-2 mt-2">
                              <span className="px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded text-[10px] border border-blue-500/20">{insight.type}</span>
                              <span className="px-2 py-0.5 bg-purple-900/30 text-purple-300 rounded text-[10px] border border-purple-500/20">{insight.market_status}</span>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                              <div className="text-[10px] text-slate-500 mb-1">Match Score</div>
                              <div className={`text-2xl font-bold ${insight.match_score > 75 ? 'text-green-400' : 'text-yellow-400'}`}>
                                  {insight.match_score}
                              </div>
                          </div>
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                              <div className="text-[10px] text-slate-500 mb-1">Profitability</div>
                              <div className="text-sm font-bold text-white mt-1 line-clamp-1">{insight.hidden_analysis.profit_potential}</div>
                          </div>
                      </div>

                      <div className="space-y-3">
                          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                              <div className="text-[10px] text-red-400 font-bold uppercase mb-1">Weakness Detected</div>
                              <p className="text-xs text-slate-300">{insight.hidden_analysis.competitor_weakness}</p>
                          </div>
                          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                              <div className="text-[10px] text-yellow-400 font-bold uppercase mb-1">Strategic Order</div>
                              <p className="text-xs text-slate-300 italic">"{insight.strategic_suggestion}"</p>
                          </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
                          <NeonButton onClick={() => onDeployStrategy(insight.target_name, 'clone')} size="sm" className="flex-1">
                              DEPLOY
                          </NeonButton>
                          <button onClick={() => handleTransmitToCommander(insight)} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white">
                              <Send size={16} />
                          </button>
                      </div>
                  </div>
              ) : (
                  <div className="flex-1 bg-slate-900/30 border border-slate-800/50 rounded-2xl flex items-center justify-center text-slate-600 text-sm">
                      Waiting for scan results...
                  </div>
              )}
          </div>

          {/* RIGHT: THE WINNER (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                  <Trophy size={16} className="text-yellow-500" /> The Winner (Best Found)
              </h3>

              {winner ? (
                  <div className="flex-1 bg-gradient-to-b from-yellow-900/20 to-slate-900 border border-yellow-500/30 rounded-2xl p-1 relative overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-[pulse_4s_infinite]"></div>
                      
                      <div className="h-full bg-slate-900/90 rounded-xl p-5 flex flex-col relative z-10">
                          <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
                              <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                                  <Trophy size={24} />
                              </div>
                              <div>
                                  <div className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                      Top Opportunity 
                                      {/* SYNCED BADGE */}
                                      <span className="flex items-center gap-1 bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded text-[8px] border border-blue-500/30">
                                          <BrainCircuit size={8} /> Synced to Brain
                                      </span>
                                  </div>
                                  <h2 className="text-lg font-bold text-white line-clamp-2">{winner.target_name}</h2>
                              </div>
                          </div>

                          <div className="flex-1 space-y-4">
                              <div className="grid grid-cols-2 gap-2 text-center">
                                  <div className="bg-slate-950 p-2 rounded-lg">
                                      <div className="text-[10px] text-slate-500 uppercase">Match Score</div>
                                      <div className="text-xl font-bold text-green-400">{winner.match_score}</div>
                                  </div>
                                  <div className="bg-slate-950 p-2 rounded-lg">
                                      <div className="text-[10px] text-slate-500 uppercase">Est. Profit</div>
                                      <div className="text-xs font-bold text-white mt-1 line-clamp-1">{winner.hidden_analysis.profit_potential.split(' ')[0]}</div>
                                  </div>
                              </div>

                              <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                                  <div className="text-[10px] text-blue-400 font-bold uppercase mb-1">Why it wins?</div>
                                  <p className="text-xs text-slate-300 leading-relaxed">{winner.hidden_analysis.consumer_psychology}</p>
                              </div>
                          </div>

                          <div className="mt-4 pt-4">
                              <NeonButton 
                                onClick={() => onDeployStrategy(winner.target_name, 'clone')} 
                                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 border-none text-white hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                              >
                                  CLAIM WINNER & GENERATE
                              </NeonButton>
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="flex-1 bg-slate-900/30 border border-slate-800 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center">
                      <Trophy size={40} className="text-slate-700 mb-3" />
                      <p className="text-slate-500 text-xs">Scanning for High-Value Targets...</p>
                      <p className="text-slate-600 text-[10px] mt-1">Activate Auto-Recon to find a winner.</p>
                  </div>
              )}
          </div>
      </div>
      )}

      {/* NEW VIEW: DEEP NET SCANNER */}
      {activeView === 'deep_scan' && (
          <div className="flex-1 animate-fade-in flex flex-col gap-6">
              
              {/* DEEP SCAN CONTROL */}
              <div className="bg-slate-900/50 border border-purple-500/20 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1 w-full">
                      <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                          <Globe className="text-purple-500" size={24} /> DEEP NETWORK SCANNER
                      </h3>
                      <p className="text-slate-400 text-sm mb-4">
                          Quét toàn bộ không gian mạng để tìm các kênh, ngách và tài khoản đang có chỉ số Views & RPM đột biến.
                      </p>
                      
                      <div className="flex gap-2">
                          <input 
                              type="text" 
                              value={deepScanFocus}
                              onChange={(e) => setDeepScanFocus(e.target.value)}
                              placeholder="Nhập trọng tâm (VD: High RPM, Tech, Crypto, Viral...)"
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none shadow-inner"
                          />
                          <NeonButton 
                              onClick={handleDeepScan} 
                              disabled={deepScanStatus === 'scanning'}
                              className="min-w-[150px]"
                          >
                              {deepScanStatus === 'scanning' ? (
                                  <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Scanning...</span>
                              ) : (
                                  <span className="flex items-center gap-2"><Search size={18} /> Deep Scan</span>
                              )}
                          </NeonButton>
                      </div>
                  </div>
                  
                  {/* Status Display */}
                  <div className="w-full md:w-auto flex flex-col items-center justify-center p-4 bg-black/40 rounded-xl border border-slate-800 min-w-[200px]">
                      <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">SCAN STATUS</div>
                      <div className={`text-2xl font-mono font-bold ${deepScanStatus === 'scanning' ? 'text-yellow-400 animate-pulse' : deepScanStatus === 'complete' ? 'text-green-400' : 'text-slate-400'}`}>
                          {deepScanStatus === 'idle' && "READY"}
                          {deepScanStatus === 'scanning' && "SCANNING..."}
                          {deepScanStatus === 'complete' && "DONE"}
                      </div>
                  </div>
              </div>

              {/* SCAN RESULTS TABLE */}
              {networkResult ? (
                  <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
                      <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                          <div>
                              <h4 className="font-bold text-white text-sm">Targets Identified</h4>
                              <p className="text-xs text-slate-500">Focus: {networkResult.focus_area} • ID: {networkResult.scan_id.substring(0,8)}</p>
                          </div>
                          <span className="text-xs font-mono text-purple-400 bg-purple-900/20 px-2 py-1 rounded border border-purple-500/20">
                              {networkResult.targets.length} Results Found
                          </span>
                      </div>
                      
                      <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                              <thead>
                                  <tr className="bg-slate-950 text-xs text-slate-500 uppercase border-b border-slate-800">
                                      <th className="p-4 font-bold">Rank</th>
                                      <th className="p-4 font-bold">Target Name</th>
                                      <th className="p-4 font-bold">Type</th>
                                      <th className="p-4 font-bold">RPM Est.</th>
                                      <th className="p-4 font-bold">Search Vol.</th>
                                      <th className="p-4 font-bold">Competition</th>
                                      <th className="p-4 font-bold text-right">Action</th>
                                  </tr>
                              </thead>
                              <tbody className="text-sm text-slate-300">
                                  {networkResult.targets.map((target, idx) => (
                                      <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                                          <td className="p-4">
                                              <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center font-mono font-bold text-white text-xs">
                                                  #{target.rank}
                                              </span>
                                          </td>
                                          <td className="p-4">
                                              <div className="font-bold text-white">{target.name}</div>
                                              <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{target.reason}</div>
                                          </td>
                                          <td className="p-4">
                                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                                                  {target.type}
                                              </span>
                                          </td>
                                          <td className="p-4">
                                              <span className="text-green-400 font-mono font-bold">{target.metrics.rpm_est}</span>
                                          </td>
                                          <td className="p-4">
                                              <div className="flex items-center gap-1">
                                                  <TrendingUp size={12} className="text-blue-400" />
                                                  {target.metrics.search_volume}
                                              </div>
                                          </td>
                                          <td className="p-4">
                                              <span className={`text-[10px] font-bold ${
                                                  target.metrics.competition === 'LOW' ? 'text-green-500' :
                                                  target.metrics.competition === 'MEDIUM' ? 'text-yellow-500' : 'text-red-500'
                                              }`}>
                                                  {target.metrics.competition}
                                              </span>
                                          </td>
                                          <td className="p-4 text-right">
                                              <div className="flex justify-end gap-2">
                                                  <button 
                                                      onClick={() => window.open(`https://${target.url}`, '_blank')}
                                                      className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded hover:bg-slate-700"
                                                      title="Open Link"
                                                  >
                                                      <LinkIcon size={14} />
                                                  </button>
                                                  <button 
                                                      onClick={() => onDeployStrategy(target.url, target.type === 'CHANNEL' ? 'clone' : 'review')}
                                                      className="p-1.5 bg-purple-900/30 text-purple-300 border border-purple-500/30 hover:bg-purple-500 hover:text-white rounded transition-colors text-xs font-bold px-3"
                                                  >
                                                      Attack
                                                  </button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              ) : (
                  <div className="flex-1 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-12 text-center">
                      <Globe size={64} className="text-slate-800 mb-4" />
                      <h4 className="text-lg font-bold text-slate-500">Ready to Scan</h4>
                      <p className="text-slate-600 text-sm max-w-md mt-2">
                          Nhập chủ đề hoặc từ khóa vào thanh tìm kiếm phía trên để bắt đầu quét toàn bộ mạng lưới và tìm kiếm cơ hội High-RPM.
                      </p>
                  </div>
              )}
          </div>
      )}

    </div>
  );
};

export default AnalyticsDashboard;
