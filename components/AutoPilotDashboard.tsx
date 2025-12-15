
import React, { useState, useEffect, useRef } from 'react';
import { 
  Infinity as InfinityIcon, Power, Activity, Terminal, Shield, 
  Cpu, Globe, Zap, Clock, Video, Share2, 
  AlertTriangle, RotateCcw, FileText, Check, DollarSign, Download, PlayCircle, Target, ChevronDown, Layers, MonitorPlay, Palette, Mic, BrainCircuit
} from 'lucide-react';
import { ApiKeyConfig, AutoPilotLog, AutoPilotStats, SourceMetadata, PostingJob, CompletedVideo, ScriptModel, VisualModel, VoiceModel, VideoResolution, AspectRatio } from '../types';
import { huntAffiliateProducts, generateVideoPlan } from '../services/geminiService';
import { postVideoToSocial } from '../services/socialService';

interface AutoPilotDashboardProps {
  apiKeys: ApiKeyConfig[];
  onAddToQueue: (job: PostingJob) => void;
  onVideoGenerated?: (video: CompletedVideo) => void;
  completedVideos?: CompletedVideo[];
  t?: any;

  // Model State Props
  scriptModel?: ScriptModel;
  setScriptModel?: (model: ScriptModel) => void;
  visualModel?: VisualModel;
  setVisualModel?: (model: VisualModel) => void;
  voiceModel?: VoiceModel;
  setVoiceModel?: (model: VoiceModel) => void;
  resolution?: VideoResolution;
  setResolution?: (res: VideoResolution) => void;
  aspectRatio?: AspectRatio;
  setAspectRatio?: (ratio: AspectRatio) => void;
}

const AUTOPILOT_STORAGE_KEY = 'av_studio_autopilot_state_v1';

// Reusable Compact Select Component
const ConfigSelect = ({ 
    label, 
    value, 
    onChange, 
    options, 
    icon: Icon,
    disabled = false
}: { 
    label?: string, 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, 
    options: { value: string, label: string }[], 
    icon?: any,
    disabled?: boolean
}) => (
    <div className="relative group w-full">
        {label && <label className="text-[9px] uppercase font-bold text-slate-500 mb-1 block pl-1">{label}</label>}
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-primary transition-colors pointer-events-none">
                {Icon && <Icon size={14} />}
            </div>
            <select 
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-8 text-[11px] font-medium text-white appearance-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <ChevronDown size={12} />
            </div>
        </div>
    </div>
);

const AutoPilotDashboard: React.FC<AutoPilotDashboardProps> = ({ 
    apiKeys, onAddToQueue, onVideoGenerated, completedVideos = [], t,
    scriptModel = 'Gemini 2.5 Flash', setScriptModel = (_: ScriptModel) => {},
    visualModel = 'SORA', setVisualModel = (_: VisualModel) => {},
    voiceModel = 'Google Chirp', setVoiceModel = (_: VoiceModel) => {},
    resolution = '1080p', setResolution = (_: VideoResolution) => {},
    aspectRatio = '9:16', setAspectRatio = (_: AspectRatio) => {},
}) => {
  const texts = t || {};
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
  
  const [selectedNiche, setSelectedNiche] = useState(initialState.selectedNiche || 'AUTO');
  const [intervalTime, setIntervalTime] = useState(initialState.intervalTime || 30);
  const [draftMode, setDraftMode] = useState(initialState.draftMode || false);

  const processedLinks = useRef<Set<string>>(new Set());
  const errorCount = useRef<number>(0);

  const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
  const socialKeys = apiKeys.filter(k => k.category === 'social' && k.status === 'active');
  const affiliateKeys = apiKeys.filter(k => k.category === 'affiliate' && k.status === 'active');

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

  const addLog = (action: string, detail: string, status: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      const newLog: AutoPilotLog = {
          timestamp: new Date().toLocaleTimeString(),
          action,
          detail,
          status
      };
      setLogs(prev => [newLog, ...prev].slice(0, 50)); 
  };

  useEffect(() => {
      if (logsEndRef.current) {
          logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [logs]);

  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isRunning) {
          interval = setInterval(() => {
              setStats(prev => ({ ...prev, uptime: prev.uptime + 1 }));
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    let loopTimeout: ReturnType<typeof setTimeout>;

    const runCycle = async () => {
        if (!isRunning) return;

        if (!googleKey) {
            addLog("SYSTEM_CHECK", "Critical: No Google API Key found. Stopping...", "error");
            setIsRunning(false);
            return;
        }
        
        const effectiveDraftMode = draftMode || socialKeys.length === 0;

        setCurrentAction("HUNTING");
        addLog("CYCLE_START", `Starting Cycle #${stats.cyclesRun + 1}.`, "info");
        setStats(prev => ({ ...prev, cyclesRun: prev.cyclesRun + 1 }));

        try {
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
                targetNiche = trendingNiches[stats.cyclesRun % trendingNiches.length];
                addLog("AUTO_SCOUT", `🤖 Targeting High-Growth Sector: "${targetNiche}"`, "info");
            }

            const networkList = affiliateKeys.length > 0 ? affiliateKeys.map(k => k.provider.toUpperCase()) : ['AMAZON', 'CLICKBANK', 'SHOPEE', 'DIGISTORE24'];
            
            await new Promise(r => setTimeout(r, 1200));
            const huntResult = await huntAffiliateProducts(googleKey.key, targetNiche, networkList);
            
            if (!huntResult || huntResult.products.length === 0) {
                throw new Error("No products found in this sector.");
            }
            
            const freshProducts = huntResult.products.filter(p => !processedLinks.current.has(p.affiliate_link));
            
            if (freshProducts.length === 0) {
                 addLog("SKIPPING", "All found products have been processed recently. Skipping to next niche.", "warning");
                 throw new Error("Duplicate prevention triggered.");
            }

            const sortedProducts = freshProducts.sort((a, b) => b.opportunity_score - a.opportunity_score);
            const bestProduct = sortedProducts[0];
            processedLinks.current.add(bestProduct.affiliate_link);

            addLog("WINNER_FOUND", `💎 Selected: ${bestProduct.product_name} (${bestProduct.opportunity_score}/100)`, "success");

            setCurrentAction("PLANNING");
            const angle = bestProduct.content_angle || "Viral Review & Demo";
            addLog("STRATEGY_LOCK", `Deploying Content Strategy: "${angle}"`, "info");
            
            const metadata: SourceMetadata = {
                url: bestProduct.affiliate_link,
                type: 'product',
                detected_strategy: 'REVIEW_TUTORIAL', 
                manual_niche: 'AUTO',
                notes: `Auto-Hunter Intel: Promote "${bestProduct.product_name}" as a ${angle}. Focus on commission: ${bestProduct.commission_est}. Reason: ${bestProduct.reason_to_promote}`,
                prefer_google_stack: bestProduct.product_name.toLowerCase().includes('google'),
                video_config: {
                    resolution: resolution as VideoResolution,
                    aspectRatio: aspectRatio as AspectRatio,
                    scriptModel: scriptModel as ScriptModel,
                    visualModel: visualModel as VisualModel,
                    voiceModel: voiceModel as VoiceModel,
                    outputLanguage: 'vi'
                }
            };

            const plan = await generateVideoPlan(googleKey.key, metadata);
            addLog("SCRIPTING", `Script generated. Hooks: ${plan.deep_analysis?.viral_dna?.length || 0}`, "success");

            setCurrentAction("RENDERING");
            await new Promise(r => setTimeout(r, 800)); 
            addLog("RENDER_PROGRESS", "Rendering...", "info");
            
            setStats(prev => ({ ...prev, videosCreated: prev.videosCreated + 1 }));

            setCurrentAction(effectiveDraftMode ? "SAVING DRAFT" : "PUBLISHING");
            
            let targetPlatform = 'No-Account';
            let platformId = '';
            let postSuccess = false;
            
            const randomDelayMinutes = Math.floor(Math.random() * 43) + 2; 
            const scheduledTime = Date.now() + (randomDelayMinutes * 60 * 1000);
            
            if (!effectiveDraftMode && socialKeys.length > 0) {
                const account = socialKeys[Math.floor(Math.random() * socialKeys.length)];
                targetPlatform = `${account.alias} (${account.provider})`;
                platformId = account.id;
                
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
                     postSuccess = true; 
                }

            } else {
                addLog("DRAFTING", "Saving to queue (Draft Mode).", "warning");
                await new Promise(r => setTimeout(r, 500));
            }

            const job: PostingJob = {
                id: crypto.randomUUID(),
                content_title: plan.generated_content?.title || `Auto: ${bestProduct.product_name}`,
                caption: (plan.generated_content?.description || "") + `\n\n👉 Link: ${bestProduct.affiliate_link}`,
                hashtags: plan.generated_content?.hashtags || [],
                platforms: platformId ? [platformId] : [],
                scheduled_time: scheduledTime,
                status: (postSuccess && !effectiveDraftMode) ? 'scheduled' : 'draft', 
                thumbnail_url: "https://via.placeholder.com/1080x1920?text=Auto+Gen"
            };
            
            onAddToQueue(job);

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

            errorCount.current = 0;

        } catch (error: any) {
            addLog("ERROR", error.message || "Cycle failed", "error");
            errorCount.current += 1;
        }

        setCurrentAction("COOLDOWN");
        
        let cooldown = Math.max(10, intervalTime);
        if (errorCount.current > 0) {
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
  }, [isRunning]);

  const toggleAutoPilot = () => {
     if (!googleKey && !isRunning) {
         alert("Please add a Google API Key in Settings > Vault to enable Auto-Pilot.");
         return;
     }
     setIsRunning(!isRunning);
     if (!isRunning) {
         addLog("SYSTEM", "Auto-Pilot Engine INITIALIZED.", "success");
         errorCount.current = 0; 
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
       
       <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
           <div className={`absolute inset-0 z-0 opacity-20 bg-[size:40px_40px] bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] ${isRunning ? 'animate-[pulse_4s_infinite]' : ''}`}></div>
           {isRunning && <div className="absolute inset-0 bg-primary/5 z-0 animate-pulse"></div>}

           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="flex items-center gap-4">
                   <div className={`p-4 rounded-full border-2 transition-all duration-500 ${isRunning ? 'bg-primary/20 border-primary shadow-[0_0_30px_#0EA5A4]' : 'bg-slate-800 border-slate-600'}`}>
                       <InfinityIcon size={40} className={isRunning ? "text-primary animate-spin-slow" : "text-slate-500"} />
                   </div>
                   <div>
                       <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                           {texts.title}
                           {isRunning && <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-ping"></span>}
                       </h2>
                       <p className="text-slate-400 font-mono text-sm mt-1">
                           {texts.subtitle}
                       </p>
                   </div>
               </div>

               <div className="flex items-center gap-6">
                   <div className="text-right hidden md:block">
                       <div className="text-xs text-slate-500 font-bold uppercase">{texts.status_label}</div>
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

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           
           <div className="lg:col-span-1 space-y-4">
               {/* CONFIG PANEL - REFACTORED */}
               <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                   <div className="flex items-center justify-between mb-4">
                       <h3 className="text-sm font-bold text-white flex items-center gap-2">
                           <Target size={16} className="text-blue-400" /> {texts.config_title}
                       </h3>
                       <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
                   </div>
                   
                   <div className="space-y-4">
                       
                       {/* Section 1: Mission Params */}
                       <div>
                           <div className="space-y-3">
                                <ConfigSelect 
                                    label={texts.niche_label}
                                    value={selectedNiche} 
                                    onChange={(e) => setSelectedNiche(e.target.value)} 
                                    disabled={isRunning}
                                    options={[
                                        { value: "AUTO", label: "🤖 AUTO (Smart Rotation)" },
                                        { value: "AI SaaS & Tools", label: "🧠 AI SaaS" },
                                        { value: "Crypto & Finance", label: "💰 Crypto" },
                                        { value: "Make Money Online", label: "💸 MMO" }
                                    ]}
                                    icon={Layers}
                                />
                               
                               <div className="grid grid-cols-2 gap-2">
                                   <div>
                                       <label className="text-[9px] uppercase font-bold text-slate-500 mb-1 block pl-1">Cooldown (s)</label>
                                       <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                                <Clock size={14} />
                                            </div>
                                            <input 
                                                type="number"
                                                min="10"
                                                value={intervalTime}
                                                onChange={(e) => setIntervalTime(Math.max(10, Number(e.target.value)))}
                                                disabled={isRunning}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-2 text-[11px] font-medium text-white font-mono disabled:opacity-50 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none" 
                                            />
                                       </div>
                                   </div>

                                   <div>
                                       <label className="text-[9px] uppercase font-bold text-slate-500 mb-1 block pl-1">Mode</label>
                                       <button 
                                           onClick={() => !isRunning && setDraftMode(!draftMode)}
                                           disabled={isRunning}
                                           className={`w-full py-2 px-3 rounded-lg border flex items-center justify-between text-[11px] font-bold transition-all h-[34px] ${
                                               draftMode 
                                               ? 'bg-yellow-900/20 border-yellow-500/50 text-yellow-400' 
                                               : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                                           } disabled:opacity-50`}
                                       >
                                           <span className="truncate">{draftMode ? 'Draft' : 'Public'}</span>
                                           <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${draftMode ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                       </button>
                                   </div>
                               </div>
                           </div>
                       </div>

                       {/* Section 2: AI Engine Specs */}
                       <div className="border-t border-slate-800 pt-3">
                            <h4 className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-2 mb-2 pl-1">
                                <Cpu size={10} /> AI Engine Config
                            </h4>
                            
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <ConfigSelect 
                                        value={resolution} 
                                        onChange={(e) => setResolution(e.target.value as VideoResolution)} 
                                        options={[
                                            { value: '720p', label: '720p' },
                                            { value: '1080p', label: '1080p' },
                                            { value: '4K', label: '4K' }
                                        ]}
                                        icon={MonitorPlay}
                                        disabled={isRunning}
                                    />
                                    <ConfigSelect 
                                        value={aspectRatio} 
                                        onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} 
                                        options={[
                                            { value: '9:16', label: '9:16' },
                                            { value: '16:9', label: '16:9' },
                                            { value: '1:1', label: '1:1' }
                                        ]}
                                        disabled={isRunning}
                                    />
                                </div>

                                <ConfigSelect 
                                    label="Script Intelligence"
                                    value={scriptModel} 
                                    onChange={(e) => setScriptModel(e.target.value as ScriptModel)} 
                                    options={[
                                        { value: 'Gemini 2.5 Flash', label: 'Gemini 2.5 Flash' },
                                        { value: 'Gemini 3 Pro', label: 'Gemini 3 Pro' },
                                        { value: 'GPT-4o', label: 'GPT-4o (OpenAI)' },
                                        { value: 'Grok Beta', label: 'Grok Beta (xAI)' }
                                    ]}
                                    icon={BrainCircuit}
                                    disabled={isRunning}
                                />

                                <ConfigSelect 
                                    label="Visual Engine"
                                    value={visualModel} 
                                    onChange={(e) => setVisualModel(e.target.value as VisualModel)} 
                                    options={[
                                        { value: 'VEO', label: 'Google Veo' },
                                        { value: 'IMAGEN', label: 'Imagen 3' },
                                        { value: 'SORA', label: 'Sora (OpenAI)' },
                                        { value: 'KLING', label: 'Kling AI' },
                                        { value: 'MIDJOURNEY', label: 'Midjourney' }
                                    ]}
                                    icon={Palette}
                                    disabled={isRunning}
                                />

                                <ConfigSelect 
                                    label="Voice Synthesis"
                                    value={voiceModel} 
                                    onChange={(e) => setVoiceModel(e.target.value as VoiceModel)} 
                                    options={[
                                        { value: 'Google Chirp', label: 'Google Chirp (USM)' },
                                        { value: 'Vbee TTS', label: 'Vbee AIVoice (VN)' },
                                        { value: 'ElevenLabs', label: 'ElevenLabs' },
                                        { value: 'OpenAI TTS', label: 'OpenAI TTS' }
                                    ]}
                                    icon={Mic}
                                    disabled={isRunning}
                                />
                            </div>
                       </div>
                   </div>
               </div>

               {/* Stats Panels */}
               <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                       <div className="text-[9px] text-slate-500 uppercase font-bold">{texts.stats_videos}</div>
                       <div className="text-xl font-mono text-white font-bold">{stats.videosCreated}</div>
                   </div>
                   <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                       <div className="text-[9px] text-slate-500 uppercase font-bold">{texts.stats_posted}</div>
                       <div className="text-xl font-mono text-green-400 font-bold">{stats.postedCount}</div>
                   </div>
                   <div className="col-span-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                       <div>
                           <div className="text-[9px] text-slate-500 uppercase font-bold">{texts.stats_uptime}</div>
                           <div className="text-lg font-mono text-blue-400 font-bold">{formatUptime(stats.uptime)}</div>
                       </div>
                       <Activity size={18} className={isRunning ? "text-blue-500 animate-pulse" : "text-slate-700"} />
                   </div>
               </div>
           </div>

           <div className="lg:col-span-3 bg-black border border-slate-800 rounded-xl p-0 flex flex-col h-[650px] font-mono text-xs relative overflow-hidden shadow-2xl">
               <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                   <div className="flex items-center gap-2 text-slate-400">
                       <Terminal size={14} />
                       <span className="font-bold">{texts.logs_title}</span>
                   </div>
               </div>

               <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scroll-smooth">
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
               </div>
           </div>

       </div>

       <div className="pt-8 border-t border-slate-800">
           <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Video size={24} className="text-purple-500" /> {texts.library_title}
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
                           <div className="relative aspect-[9/16] bg-black group">
                               <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                               <div className="absolute bottom-4 left-4 right-4">
                                   <div className="flex gap-2 mb-2">
                                       <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30 font-bold">{video.niche}</span>
                                   </div>
                                   <h4 className="text-sm font-bold text-white line-clamp-2 leading-tight">{video.title}</h4>
                               </div>
                           </div>
                           <div className="p-3 bg-slate-950 flex justify-between items-center">
                               <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
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
