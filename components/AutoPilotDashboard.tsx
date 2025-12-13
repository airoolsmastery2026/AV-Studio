
import React, { useState, useEffect, useRef } from 'react';
import { 
  Infinity as InfinityIcon, Power, Activity, Terminal, Shield, 
  Cpu, Globe, Zap, Clock, Video, Share2, 
  AlertTriangle, RotateCcw, FileText, Check
} from 'lucide-react';
import { ApiKeyConfig, AutoPilotLog, AutoPilotStats, SourceMetadata, PostingJob } from '../types';
import { huntAffiliateProducts, generateVideoPlan } from '../services/geminiService';

interface AutoPilotDashboardProps {
  apiKeys: ApiKeyConfig[];
  onAddToQueue: (job: PostingJob) => void;
}

const AutoPilotDashboard: React.FC<AutoPilotDashboardProps> = ({ apiKeys, onAddToQueue }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentAction, setCurrentAction] = useState('IDLE');
  const [logs, setLogs] = useState<AutoPilotLog[]>([]);
  const [stats, setStats] = useState<AutoPilotStats>({
      cyclesRun: 0,
      videosCreated: 0,
      postedCount: 0,
      uptime: 0
  });

  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Configuration
  const [selectedNiche, setSelectedNiche] = useState('AUTO');
  const [intervalTime, setIntervalTime] = useState(30); // seconds
  const [draftMode, setDraftMode] = useState(false); // Draft Mode State

  // System Resources
  const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
  const socialKeys = apiKeys.filter(k => k.category === 'social' && k.status === 'active');
  const affiliateKeys = apiKeys.filter(k => k.category === 'affiliate' && k.status === 'active');

  // --- LOGGING HELPER ---
  const addLog = (action: string, detail: string, status: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      const newLog: AutoPilotLog = {
          timestamp: new Date().toLocaleTimeString(),
          action,
          detail,
          status
      };
      setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
  };

  // --- AUTO SCROLL LOGS ---
  useEffect(() => {
      if (logsEndRef.current) {
          logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [logs]);

  // --- UPTIME COUNTER ---
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isRunning) {
          interval = setInterval(() => {
              setStats(prev => ({ ...prev, uptime: prev.uptime + 1 }));
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [isRunning]);

  // --- MAIN LOOP LOGIC ---
  useEffect(() => {
    let loopTimeout: ReturnType<typeof setTimeout>;

    const runCycle = async () => {
        if (!isRunning) return;

        // 1. RESOURCE CHECK
        if (!googleKey) {
            addLog("SYSTEM_CHECK", "Critical: No Google API Key found.", "error");
            setIsRunning(false);
            return;
        }
        
        // Determine if we are effectively in draft mode (Explicit or No Keys)
        const effectiveDraftMode = draftMode || socialKeys.length === 0;

        if (!effectiveDraftMode && socialKeys.length === 0) {
            addLog("SYSTEM_CHECK", "Warning: No Social Keys. Forced into Draft Mode.", "warning");
        } else if (draftMode) {
            addLog("SYSTEM_CHECK", "Running in DRAFT MODE (No Posting).", "info");
        }

        // START CYCLE
        setCurrentAction("HUNTING");
        addLog("CYCLE_START", `Starting Cycle #${stats.cyclesRun + 1}.`, "info");
        setStats(prev => ({ ...prev, cyclesRun: prev.cyclesRun + 1 }));

        try {
            // 2. HUNTING PHASE
            addLog("HUNTING", `Initiating Deep Scan for niche: ${selectedNiche}...`, "info");
            await new Promise(r => setTimeout(r, 1500)); 

            // Determine Target Niche (Round Robin if AUTO)
            let targetNiche = selectedNiche;
            if (selectedNiche === 'AUTO') {
                const niches = ['AI Tools', 'Smart Home', 'Crypto Trading', 'Biohacking', 'Kitchen Gadgets', 'Pet Tech'];
                targetNiche = niches[Math.floor(Math.random() * niches.length)];
                addLog("AUTO_NICHE", `Detected high-value niche: ${targetNiche}`, "info");
            }

            // Call Hunter API (Smart Hunt)
            const networkList = affiliateKeys.length > 0 ? affiliateKeys.map(k => k.provider.toUpperCase()) : ['AMAZON', 'CLICKBANK', 'SHOPEE', 'TIKTOK_SHOP'];
            
            const huntResult = await huntAffiliateProducts(googleKey.key, targetNiche, networkList);
            if (!huntResult || huntResult.products.length === 0) {
                throw new Error("No products found in this sector.");
            }
            
            // SMART SELECTION LOGIC: Sort by Opportunity Score
            addLog("ANALYZING", `Found ${huntResult.products.length} candidates. Comparing ROI...`, "info");
            await new Promise(r => setTimeout(r, 1000));

            const sortedProducts = [...huntResult.products].sort((a, b) => b.opportunity_score - a.opportunity_score);
            const bestProduct = sortedProducts[0];

            addLog("WINNER_FOUND", `Top Pick: ${bestProduct.product_name}`, "success");
            addLog("METRICS", `Score: ${bestProduct.opportunity_score}/100 | Angle: ${bestProduct.content_angle}`, "success");

            // 3. PLANNING PHASE
            setCurrentAction("PLANNING");
            addLog("STRATEGY", `Generating viral script for ${bestProduct.product_name}...`, "info");
            
            const metadata: SourceMetadata = {
                url: bestProduct.affiliate_link,
                type: 'product',
                detected_strategy: 'REVIEW_TUTORIAL', // Default strategy for products
                manual_niche: 'AUTO',
                manual_workflow: 'REVIEW_TUTORIAL', // Enforce review workflow
                notes: `Focus on this angle: ${bestProduct.content_angle}. Commission: ${bestProduct.commission_est}`,
                video_config: {
                    resolution: '1080p',
                    aspectRatio: '9:16',
                    scriptModel: 'Gemini 2.5 Flash',
                    visualModel: 'SORA', // Prefer Sora for high quality
                    voiceModel: 'Google Chirp'
                }
            };

            const plan = await generateVideoPlan(googleKey.key, metadata);
            addLog("SCRIPTING", "Script & Scenes generated successfully.", "success");

            // 4. PRODUCTION PHASE
            setCurrentAction("RENDERING");
            addLog("PRODUCTION", "Simulating Asset Generation (Veo/Imagen)...", "info");
            await new Promise(r => setTimeout(r, 3000)); // Sim Rendering Time
            
            setStats(prev => ({ ...prev, videosCreated: prev.videosCreated + 1 }));

            // 5. POSTING PHASE
            setCurrentAction(effectiveDraftMode ? "SAVING DRAFT" : "PUBLISHING");
            
            let targetPlatform = 'No-Account';
            let platformId = '';
            
            if (!effectiveDraftMode && socialKeys.length > 0) {
                // Pick a random account or cycle through
                const account = socialKeys[Math.floor(Math.random() * socialKeys.length)];
                targetPlatform = `${account.alias} (${account.provider})`;
                platformId = account.id;
                addLog("ROUTING", `Selected Account: ${targetPlatform}`, "info");
                
                addLog("UPLOADING", `Uploading to ${targetPlatform}...`, "info");
                await new Promise(r => setTimeout(r, 2000)); // Sim Upload
            } else {
                addLog("DRAFTING", "Skipping upload. Saving to queue...", "warning");
                await new Promise(r => setTimeout(r, 500));
            }

            // Create Job Object
            const job: PostingJob = {
                id: crypto.randomUUID(),
                content_title: plan.generated_content?.title || `Auto: ${bestProduct.product_name}`,
                caption: (plan.generated_content?.description || "") + `\n\n👉 Link: ${bestProduct.affiliate_link}`,
                hashtags: plan.generated_content?.hashtags || [],
                platforms: platformId ? [platformId] : [],
                scheduled_time: Date.now(),
                status: effectiveDraftMode ? 'draft' : 'published'
            };
            
            onAddToQueue(job);

            if (effectiveDraftMode) {
                addLog("DRAFT_SAVED", `Content saved to Drafts. ID: ${job.id.substring(0,8)}`, "success");
            } else {
                setStats(prev => ({ ...prev, postedCount: prev.postedCount + 1 }));
                addLog("PUBLISHED", "Content live! Link copied to clipboard.", "success");
            }

        } catch (error: any) {
            addLog("ERROR", error.message || "Cycle failed", "error");
        }

        // 6. COOLDOWN
        setCurrentAction("COOLDOWN");
        const cooldown = Math.max(10, intervalTime); // Ensure at least 10s cooldown
        addLog("SLEEP", `Cooling down for ${cooldown} seconds...`, "info");
        
        loopTimeout = setTimeout(runCycle, cooldown * 1000);
    };

    if (isRunning) {
        runCycle();
    }

    return () => clearTimeout(loopTimeout);
  }, [isRunning]); // Dependencies: isRunning, apiKeys, selectedNiche, intervalTime, draftMode

  const toggleAutoPilot = () => {
     setIsRunning(!isRunning);
     if (!isRunning) {
         addLog("SYSTEM", "Auto-Pilot Engine INITIALIZED.", "success");
     } else {
         addLog("SYSTEM", "Auto-Pilot STOPPED by User.", "warning");
         setCurrentAction("IDLE");
     }
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
       
       {/* CONTROL PANEL HEADER */}
       <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
           {/* Background Grid Animation */}
           <div className={`absolute inset-0 z-0 opacity-20 bg-[size:40px_40px] bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] ${isRunning ? 'animate-[pulse_4s_infinite]' : ''}`}></div>
           {isRunning && <div className="absolute inset-0 bg-primary/5 z-0 animate-pulse"></div>}

           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="flex items-center gap-4">
                   <div className={`p-4 rounded-full border-2 transition-all duration-500 ${isRunning ? 'bg-primary/20 border-primary shadow-[0_0_30px_#0EA5A4]' : 'bg-slate-800 border-slate-600'}`}>
                       <InfinityIcon size={40} className={isRunning ? "text-primary animate-spin-slow" : "text-slate-500"} />
                   </div>
                   <div>
                       <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                           INFINITY AUTO-PILOT
                           {isRunning && <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-ping"></span>}
                       </h2>
                       <p className="text-slate-400 font-mono text-sm mt-1">
                           Autonomous Affiliate Video Production System v2.5
                       </p>
                   </div>
               </div>

               <div className="flex items-center gap-6">
                   <div className="text-right hidden md:block">
                       <div className="text-xs text-slate-500 font-bold uppercase">System Status</div>
                       <div className={`text-xl font-mono font-bold ${isRunning ? 'text-green-400' : 'text-slate-400'}`}>
                           {isRunning ? currentAction : "STANDBY"}
                       </div>
                   </div>
                   
                   <button 
                       onClick={toggleAutoPilot}
                       className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95 ${
                           isRunning 
                           ? 'bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
                           : 'bg-green-500/10 border-green-500 text-green-500 hover:bg-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.4)]'
                       }`}
                   >
                       <Power size={32} />
                       <span className="text-[10px] font-bold mt-1">{isRunning ? "STOP" : "START"}</span>
                   </button>
               </div>
           </div>
       </div>

       {/* STATS & CONFIG GRID */}
       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           
           {/* LEFT: CONFIG */}
           <div className="lg:col-span-1 space-y-4">
               <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                   <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                       <Shield size={16} className="text-blue-400" /> Mission Config
                   </h3>
                   
                   <div className="space-y-4">
                       <div>
                           <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Target Niche</label>
                           <select 
                               value={selectedNiche}
                               onChange={(e) => setSelectedNiche(e.target.value)}
                               disabled={isRunning}
                               className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white focus:border-primary disabled:opacity-50"
                           >
                               <option value="AUTO">🤖 AUTO (Smart Scout)</option>
                               <option value="Tech & Gadgets">📱 Tech & Gadgets</option>
                               <option value="Health & Beauty">💄 Health & Beauty</option>
                               <option value="Crypto & Finance">💰 Crypto & Finance</option>
                               <option value="Pet Care">🐶 Pet Care</option>
                               <option value="Home Office">🏠 Home Office</option>
                           </select>
                       </div>
                       
                       <div>
                           <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Loop Interval (sec)</label>
                           <input 
                               type="number"
                               min="10"
                               value={intervalTime}
                               onChange={(e) => setIntervalTime(Math.max(10, Number(e.target.value)))}
                               disabled={isRunning}
                               className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white font-mono disabled:opacity-50" 
                           />
                           <p className="text-[9px] text-slate-600 mt-1">Minimum 10s cooldown.</p>
                       </div>

                       {/* Draft Mode Toggle */}
                       <div>
                           <label className="flex items-center justify-between cursor-pointer p-2 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
                               <div className="flex items-center gap-2">
                                   <FileText size={14} className={draftMode ? "text-yellow-500" : "text-slate-500"} />
                                   <div>
                                       <span className="text-[10px] font-bold text-white block">Draft Mode</span>
                                       <span className="text-[9px] text-slate-500 block">Save only, no posting</span>
                                   </div>
                               </div>
                               <button 
                                   onClick={() => !isRunning && setDraftMode(!draftMode)}
                                   disabled={isRunning}
                                   className={`w-8 h-4 rounded-full p-0.5 transition-colors ${draftMode ? 'bg-yellow-500' : 'bg-slate-700'} disabled:opacity-50`}
                               >
                                   <div className={`w-3 h-3 bg-white rounded-full transition-transform ${draftMode ? 'translate-x-4' : ''}`}></div>
                               </button>
                           </label>
                       </div>

                       <div className="pt-2 border-t border-slate-800">
                           <div className="flex justify-between items-center text-xs mb-1">
                               <span className="text-slate-400">API Resources</span>
                               <span className="text-green-500 font-bold">Connected</span>
                           </div>
                           <div className="flex gap-1">
                               <div className={`h-1.5 flex-1 rounded-full ${googleKey ? 'bg-green-500' : 'bg-red-500'}`} title="Google API"></div>
                               <div className={`h-1.5 flex-1 rounded-full ${socialKeys.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`} title="Social Accounts"></div>
                               <div className={`h-1.5 flex-1 rounded-full ${affiliateKeys.length > 0 ? 'bg-green-500' : 'bg-slate-700'}`} title="Affiliate Networks"></div>
                           </div>
                       </div>
                   </div>
               </div>

               {/* REAL-TIME STATS */}
               <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase font-bold">Videos</div>
                       <div className="text-2xl font-mono text-white font-bold">{stats.videosCreated}</div>
                   </div>
                   <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase font-bold">Posted</div>
                       <div className="text-2xl font-mono text-green-400 font-bold">{stats.postedCount}</div>
                   </div>
                   <div className="col-span-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                       <div>
                           <div className="text-[10px] text-slate-500 uppercase font-bold">Session Uptime</div>
                           <div className="text-xl font-mono text-blue-400 font-bold">{formatUptime(stats.uptime)}</div>
                       </div>
                       <Activity className={isRunning ? "text-blue-500 animate-pulse" : "text-slate-700"} />
                   </div>
               </div>
           </div>

           {/* RIGHT: LIVE TERMINAL */}
           <div className="lg:col-span-3 bg-black border border-slate-800 rounded-xl p-0 flex flex-col h-[500px] font-mono text-xs relative overflow-hidden shadow-2xl">
               <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                   <div className="flex items-center gap-2 text-slate-400">
                       <Terminal size={14} />
                       <span className="font-bold">LIVE EXECUTION LOGS</span>
                   </div>
                   <div className="flex gap-1.5">
                       <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500"></div>
                   </div>
               </div>

               <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scroll-smooth">
                   {logs.length === 0 && (
                       <div className="text-slate-600 italic opacity-50">System ready. Waiting for start command...</div>
                   )}
                   {logs.map((log, idx) => (
                       <div key={idx} className="flex gap-3 animate-fade-in">
                           <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                           <span className={`font-bold shrink-0 w-24 ${
                               log.status === 'success' ? 'text-green-500' :
                               log.status === 'error' ? 'text-red-500' :
                               log.status === 'warning' ? 'text-yellow-500' : 'text-blue-400'
                           }`}>
                               {log.action}
                           </span>
                           <span className="text-slate-300 break-all">{log.detail}</span>
                       </div>
                   ))}
                   <div ref={logsEndRef} />
                   
                   {/* Typing Cursor */}
                   {isRunning && (
                       <div className="flex gap-2 items-center mt-2">
                           <span className="w-2 h-4 bg-primary animate-pulse"></span>
                       </div>
                   )}
               </div>
           </div>

       </div>
    </div>
  );
};

export default AutoPilotDashboard;
