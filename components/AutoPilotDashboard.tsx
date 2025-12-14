
import React, { useState, useEffect, useRef } from 'react';
import { 
  Infinity as InfinityIcon, Power, Activity, Terminal, Shield, 
  Cpu, Globe, Zap, Clock, Video, Share2, 
  AlertTriangle, RotateCcw, FileText, Check, DollarSign, Download, PlayCircle, Target
} from 'lucide-react';
import { ApiKeyConfig, AutoPilotLog, AutoPilotStats, SourceMetadata, PostingJob, CompletedVideo } from '../types';
import { huntAffiliateProducts, generateVideoPlan } from '../services/geminiService';
import { postVideoToSocial } from '../services/socialService';

interface AutoPilotDashboardProps {
  apiKeys: ApiKeyConfig[];
  onAddToQueue: (job: PostingJob) => void;
  onVideoGenerated?: (video: CompletedVideo) => void;
  completedVideos?: CompletedVideo[];
}

const AUTOPILOT_STORAGE_KEY = 'av_studio_autopilot_state_v1';

const AutoPilotDashboard: React.FC<AutoPilotDashboardProps> = ({ apiKeys, onAddToQueue, onVideoGenerated, completedVideos = [] }) => {
  // Load initial state from storage
  const getInitialState = () => {
      try {
          const saved = localStorage.getItem(AUTOPILOT_STORAGE_KEY);
          if (saved) return JSON.parse(saved);
      } catch(e) {}
      return {};
  };
  const initialState = getInitialState();

  const [isRunning, setIsRunning] = useState<boolean>(initialState.isRunning || false);
  const [currentAction, setCurrentAction] = useState<string>(initialState.currentAction || 'IDLE');
  const [logs, setLogs] = useState<AutoPilotLog[]>(initialState.logs || []);
  const [stats, setStats] = useState<AutoPilotStats>(initialState.stats || {
      cyclesRun: 0,
      videosCreated: 0,
      postedCount: 0,
      uptime: 0
  });

  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Configuration
  const [selectedNiche, setSelectedNiche] = useState(initialState.selectedNiche || 'AUTO');
  const [intervalTime, setIntervalTime] = useState(initialState.intervalTime || 30); // seconds
  const [draftMode, setDraftMode] = useState(initialState.draftMode || false); // Draft Mode State

  // Internal Memory for Duplicate Prevention (Session based)
  const processedLinks = useRef<Set<string>>(new Set());
  const errorCount = useRef<number>(0);

  // System Resources
  const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
  const socialKeys = apiKeys.filter(k => k.category === 'social' && k.status === 'active');
  const affiliateKeys = apiKeys.filter(k => k.category === 'affiliate' && k.status === 'active');

  // --- PERSISTENCE ---
  useEffect(() => {
      const stateToSave = {
          isRunning,
          currentAction,
          logs,
          stats,
          selectedNiche,
          intervalTime,
          draftMode
      };
      localStorage.setItem(AUTOPILOT_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [isRunning, currentAction, logs, stats, selectedNiche, intervalTime, draftMode]);

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
        
        const effectiveDraftMode = draftMode || socialKeys.length === 0;

        // START CYCLE
        setCurrentAction("HUNTING");
        addLog("CYCLE_START", `Starting Cycle #${stats.cyclesRun + 1}.`, "info");
        setStats(prev => ({ ...prev, cyclesRun: prev.cyclesRun + 1 }));

        try {
            // 2. HUNTING PHASE (UPGRADED INTELLIGENCE)
            // Logic: Pick a niche. If AUTO, rotate through high-value keywords.
            let targetNiche = selectedNiche;
            if (selectedNiche === 'AUTO') {
                const trendingNiches = [
                    'Trending AI Video Generators 2024', 
                    'Best AI Writing Tools for SEO', 
                    'No-Code AI App Builders',
                    'AI Trading Bots Crypto', 
                    'Smart Home AI Gadgets', 
                    'High Ticket AI SaaS Affiliate',
                    'AI Avatar Generators',
                    'Productivity AI Extensions'
                ];
                // Deterministic rotation based on cycle count to ensure variety
                targetNiche = trendingNiches[stats.cyclesRun % trendingNiches.length];
                addLog("AUTO_SCOUT", `🤖 Targeting High-Growth Sector: "${targetNiche}"`, "info");
            }

            const networkList = affiliateKeys.length > 0 ? affiliateKeys.map(k => k.provider.toUpperCase()) : ['AMAZON', 'CLICKBANK', 'SHOPEE', 'DIGISTORE24'];
            
            // Artificial delay for realism
            await new Promise(r => setTimeout(r, 1200));
            const huntResult = await huntAffiliateProducts(googleKey.key, targetNiche, networkList);
            
            if (!huntResult || huntResult.products.length === 0) {
                throw new Error("No products found in this sector.");
            }
            
            // SMART SELECTION: Filter out already processed products
            const freshProducts = huntResult.products.filter(p => !processedLinks.current.has(p.affiliate_link));
            
            if (freshProducts.length === 0) {
                 addLog("SKIPPING", "All found products have been processed recently. Skipping to next niche.", "warning");
                 throw new Error("Duplicate prevention triggered.");
            }

            // Sort by Opportunity Score
            const sortedProducts = freshProducts.sort((a, b) => b.opportunity_score - a.opportunity_score);
            const bestProduct = sortedProducts[0];
            
            // Mark as processed
            processedLinks.current.add(bestProduct.affiliate_link);

            // INTELLIGENT REPORTING
            const isHighTicket = bestProduct.commission_est.includes('$') && parseInt(bestProduct.commission_est.replace(/\D/g, '')) > 50;
            const isAiTool = bestProduct.product_name.toLowerCase().includes('ai') || targetNiche.toLowerCase().includes('ai');

            if (isAiTool) {
                addLog("TREND_ALERT", `🔥 TREND DETECTED: ${bestProduct.product_name} in ${targetNiche}`, "warning");
            }
            
            if (isHighTicket) {
                addLog("COMMISSION_INTEL", `💰 High Yield Alert: ${bestProduct.commission_est} Commission`, "success");
            } else {
                addLog("WINNER_FOUND", `💎 Selected: ${bestProduct.product_name} (${bestProduct.opportunity_score}/100)`, "success");
            }

            // 3. PLANNING PHASE
            setCurrentAction("PLANNING");
            const angle = bestProduct.content_angle || "Viral Review & Demo";
            addLog("STRATEGY_LOCK", `Deploying Content Strategy: "${angle}"`, "info");
            
            const metadata: SourceMetadata = {
                url: bestProduct.affiliate_link,
                type: 'product',
                detected_strategy: 'REVIEW_TUTORIAL', 
                manual_niche: 'AUTO',
                notes: `Auto-Hunter Intel: Promote "${bestProduct.product_name}" as a ${angle}. Focus on commission: ${bestProduct.commission_est}. Reason: ${bestProduct.reason_to_promote}`,
                prefer_google_stack: bestProduct.product_name.toLowerCase().includes('google'), // Only use Google stack for Google products, prefer SORA otherwise
                video_config: {
                    resolution: '1080p',
                    aspectRatio: '9:16',
                    scriptModel: 'Gemini 2.5 Flash',
                    visualModel: 'SORA', // Updated to SORA
                    voiceModel: 'Google Chirp'
                }
            };

            const plan = await generateVideoPlan(googleKey.key, metadata);
            addLog("SCRIPTING", `Script generated. Hooks: ${plan.deep_analysis?.viral_dna?.length || 0}`, "success");

            // 4. PRODUCTION PHASE (Simulated with progress updates)
            setCurrentAction("RENDERING");
            const visualModel = metadata.video_config?.visualModel || "AI";
            addLog("PRODUCTION", `Initializing ${visualModel} Render Engine...`, "info");
            
            // Simulate granular progress
            const renderSteps = ["Generating Visuals...", "Synthesizing Audio...", "Compositing Scenes...", "Finalizing Render..."];
            for (const step of renderSteps) {
                await new Promise(r => setTimeout(r, 800)); // 800ms per step
                addLog("RENDER_PROGRESS", step, "info");
            }
            
            setStats(prev => ({ ...prev, videosCreated: prev.videosCreated + 1 }));

            // 5. POSTING PHASE
            setCurrentAction(effectiveDraftMode ? "SAVING DRAFT" : "PUBLISHING");
            
            let targetPlatform = 'No-Account';
            let platformId = '';
            let postSuccess = false;
            
            // Calculate Organic Scheduled Time (Jitter)
            // Add random delay between 2 minutes and 45 minutes to look natural
            const randomDelayMinutes = Math.floor(Math.random() * 43) + 2; 
            const scheduledTime = Date.now() + (randomDelayMinutes * 60 * 1000);
            
            if (!effectiveDraftMode && socialKeys.length > 0) {
                const account = socialKeys[Math.floor(Math.random() * socialKeys.length)];
                targetPlatform = `${account.alias} (${account.provider})`;
                platformId = account.id;
                
                // Simulation: 80% chance to schedule for "Organic" timing, 20% immediate
                const shouldPostNow = Math.random() > 0.8;
                
                if (shouldPostNow) {
                     addLog("ROUTING", `Instant Post to: ${targetPlatform}`, "info");
                     const result = await postVideoToSocial(account, { 
                        title: plan.generated_content?.title || `Auto: ${bestProduct.product_name}`, 
                        caption: (plan.generated_content?.description || "") + `\n\n👉 Link: ${bestProduct.affiliate_link}` 
                    });
                    
                    if (result.success) {
                        addLog("PUBLISHED", `Content live! ID: ${result.postId}`, "success");
                        postSuccess = true;
                    } else {
                        addLog("ERROR", `Failed to post: ${result.error}`, "error");
                    }
                } else {
                     addLog("SCHEDULING", `Scheduling for ${randomDelayMinutes} mins later (Organic Growth)`, "info");
                     // We mark success here because scheduling is the intended action
                     postSuccess = true; 
                }

            } else {
                addLog("DRAFTING", "Saving to queue (Draft Mode).", "warning");
                await new Promise(r => setTimeout(r, 500));
            }

            // Create Job Object
            const job: PostingJob = {
                id: crypto.randomUUID(),
                content_title: plan.generated_content?.title || `Auto: ${bestProduct.product_name}`,
                caption: (plan.generated_content?.description || "") + `\n\n👉 Link: ${bestProduct.affiliate_link}`,
                hashtags: plan.generated_content?.hashtags || [],
                platforms: platformId ? [platformId] : [],
                scheduled_time: scheduledTime,
                status: (postSuccess && !effectiveDraftMode) ? 'scheduled' : 'draft', // If we "scheduled", status is scheduled
                thumbnail_url: "https://via.placeholder.com/1080x1920?text=Auto+Gen"
            };
            
            onAddToQueue(job);

            // SAVE COMPLETED VIDEO TO LIBRARY
            if (onVideoGenerated) {
                onVideoGenerated({
                    id: crypto.randomUUID(),
                    title: job.content_title,
                    description: job.caption,
                    thumbnailUrl: `https://placehold.co/1080x1920/1e293b/FFF?text=${encodeURIComponent(bestProduct.product_name.substring(0,15))}`,
                    platform: targetPlatform,
                    niche: targetNiche,
                    createdAt: Date.now(),
                    stats: { views: 0, likes: 0 }
                });
            }

            if (postSuccess && !effectiveDraftMode) {
                setStats(prev => ({ ...prev, postedCount: prev.postedCount + 1 }));
            }

            // Reset error count on success
            errorCount.current = 0;

        } catch (error: any) {
            addLog("ERROR", error.message || "Cycle failed", "error");
            errorCount.current += 1;
        }

        // 6. COOLDOWN (Exponential Backoff if errors)
        setCurrentAction("COOLDOWN");
        
        let cooldown = Math.max(10, intervalTime);
        if (errorCount.current > 0) {
            // If errors, wait longer: 30s, 60s, 120s...
            cooldown = Math.min(300, 30 * Math.pow(2, errorCount.current - 1));
            addLog("BACKOFF", `Error detected. Pausing for ${cooldown}s...`, "warning");
        } else {
            addLog("SLEEP", `Cooling down for ${cooldown} seconds...`, "info");
        }
        
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
         errorCount.current = 0; // Reset errors on fresh start
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

  const handleDownloadVideo = (video: any) => {
      const content = JSON.stringify(video, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `video_assets_${video.title.substring(0, 10).replace(/\s/g, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
                           Affiliate & Sales Engine (Review, Ads, Demo Product)
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
           
           {/* Visual Progress Bar (When Running) */}
            {isRunning && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
                    <div className={`h-full ${
                        currentAction === 'HUNTING' ? 'bg-blue-500 w-1/4' : 
                        currentAction === 'PLANNING' ? 'bg-purple-500 w-2/4' : 
                        currentAction === 'RENDERING' ? 'bg-yellow-500 w-3/4' : 
                        currentAction === 'PUBLISHING' ? 'bg-green-500 w-full' : 'bg-slate-600 w-full'
                    } transition-all duration-1000 ease-in-out`}></div>
                </div>
            )}
       </div>

       {/* STATS & CONFIG GRID */}
       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           
           {/* LEFT: CONFIG */}
           <div className="lg:col-span-1 space-y-4">
               <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                   <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                       <Target size={16} className="text-blue-400" /> Sales Mission Config
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
                               <option value="AUTO">🤖 AUTO (Smart Sales Rotation)</option>
                               <optgroup label="🔥 High Ticket Affiliate">
                                   <option value="AI SaaS & Tools">🧠 AI SaaS (Software)</option>
                                   <option value="Crypto & Finance">💰 Crypto & Investment</option>
                                   <option value="Make Money Online">💸 MMO / BizOpp</option>
                                   <option value="Digital Marketing">📈 Marketing Tools</option>
                               </optgroup>
                               <optgroup label="🛍️ Consumer Sales">
                                   <option value="Tech & Gadgets">📱 Tech Gadgets</option>
                                   <option value="Smart Home">🏠 Smart Home</option>
                                   <option value="Health & Beauty">💄 Health & Beauty</option>
                                   <option value="Kitchen & Cooking">🍳 Kitchen</option>
                               </optgroup>
                           </select>
                       </div>
                       
                       <div>
                           <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Min Cooldown (sec)</label>
                           <input 
                               type="number"
                               min="10"
                               value={intervalTime}
                               onChange={(e) => setIntervalTime(Math.max(10, Number(e.target.value)))}
                               disabled={isRunning}
                               className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white font-mono disabled:opacity-50" 
                           />
                           <p className="text-[9px] text-slate-600 mt-1">Calculated pause between videos.</p>
                       </div>

                       {/* Draft Mode Toggle */}
                       <div>
                           <label className="flex items-center justify-between cursor-pointer p-2 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
                               <div className="flex items-center gap-2">
                                   <FileText size={14} className={draftMode ? "text-yellow-500" : "text-slate-500"} />
                                   <div>
                                       <span className="text-[10px] font-bold text-white block">Draft Mode</span>
                                       <span className="text-[9px] text-slate-500 block">Queue only, no posting</span>
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

       {/* FINISHED VIDEO LIBRARY (GALLERY) */}
       <div className="pt-8 border-t border-slate-800">
           <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Video size={24} className="text-purple-500" /> Finished Video Library
                <span className="text-sm font-normal text-slate-500 ml-2">({completedVideos.length} items)</span>
           </h3>
           
           {completedVideos.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-12 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed text-slate-500">
                   <Video size={48} className="mb-4 opacity-20" />
                   <p>No videos generated yet. Start Auto-Pilot to populate.</p>
               </div>
           ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                   {completedVideos.slice(0, 12).map((video) => (
                       <div key={video.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group hover:border-primary/50 transition-all duration-300">
                           {/* Thumbnail / Video Placeholder */}
                           <div className="relative aspect-[9/16] bg-black group">
                               <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                               <div className="absolute bottom-4 left-4 right-4">
                                   <div className="flex gap-2 mb-2">
                                       <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30 font-bold">{video.niche}</span>
                                       <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">{video.platform}</span>
                                   </div>
                                   <h4 className="text-sm font-bold text-white line-clamp-2 leading-tight">{video.title}</h4>
                                   <p className="text-[10px] text-slate-400 mt-1">{new Date(video.createdAt).toLocaleTimeString()} {new Date(video.createdAt).toLocaleDateString()}</p>
                               </div>
                               
                               {/* Hover Overlay */}
                               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm gap-2">
                                   <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 hover:scale-110 transition-all text-white backdrop-blur-md border border-white/20">
                                       <PlayCircle size={28} fill="white" className="text-transparent" />
                                   </button>
                               </div>
                           </div>
                           
                           {/* Actions Footer */}
                           <div className="p-3 bg-slate-950 flex justify-between items-center">
                               <button 
                                   onClick={() => handleDownloadVideo(video)}
                                   className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                               >
                                   <Download size={14} /> Download
                               </button>
                               <div className="text-[10px] font-mono text-green-500">Done</div>
                           </div>
                       </div>
                   ))}
               </div>
           )}
       </div>
    </div>
  );
};

export default AutoPilotDashboard;
