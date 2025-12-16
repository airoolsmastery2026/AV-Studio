
import React, { useState, useEffect, useRef } from 'react';
import { Infinity as InfinityIcon, Play, Pause, Zap, Crosshair, BarChart3, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { 
    ApiKeyConfig, PostingJob, CompletedVideo, ScriptModel, VisualModel, VoiceModel, 
    VideoResolution, AspectRatio, SourceMetadata, ContentWorkflow, AutoPilotStats, AutoPilotLog 
} from '../types';
import NeonButton from './NeonButton';
import { huntAffiliateProducts, generateVideoPlan } from '../services/geminiService';
import ModelSelector from './ModelSelector';

interface AutoPilotDashboardProps {
  apiKeys: ApiKeyConfig[];
  onAddToQueue: (job: PostingJob) => void;
  onVideoGenerated: (video: CompletedVideo) => void;
  completedVideos: CompletedVideo[];
  t?: any;
  
  // Shared Model State
  scriptModel: ScriptModel;
  setScriptModel: (model: ScriptModel) => void;
  visualModel: VisualModel;
  setVisualModel: (model: VisualModel) => void;
  voiceModel: VoiceModel;
  setVoiceModel: (model: VoiceModel) => void;
  resolution: VideoResolution;
  setResolution: (res: VideoResolution) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
}

const AutoPilotDashboard: React.FC<AutoPilotDashboardProps> = ({ 
    apiKeys, onAddToQueue, onVideoGenerated, completedVideos, t,
    scriptModel, setScriptModel,
    visualModel, setVisualModel,
    voiceModel, setVoiceModel,
    resolution, setResolution,
    aspectRatio, setAspectRatio,
}) => {
    const texts = t || {};
    const [isRunning, setIsRunning] = useState(false);
    const [selectedNiche, setSelectedNiche] = useState<string>('AUTO');
    const [currentAction, setCurrentAction] = useState<string>('IDLE');
    
    const [stats, setStats] = useState<AutoPilotStats>({
        cyclesRun: 0,
        videosCreated: completedVideos.length,
        postedCount: 0,
        uptime: 0
    });

    const [logs, setLogs] = useState<AutoPilotLog[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);
    const processedLinks = useRef<Set<string>>(new Set());

    const affiliateKeys = apiKeys.filter(k => k.category === 'affiliate' && k.status === 'active');
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (isRunning) {
            timer = setInterval(() => {
                setStats(prev => ({...prev, uptime: prev.uptime + 1}));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isRunning]);

    const addLog = (action: string, detail: string, status: 'info' | 'success' | 'warning' | 'error' = 'info') => {
        const newLog: AutoPilotLog = {
            timestamp: new Date().toLocaleTimeString(),
            action,
            detail,
            status
        };
        setLogs(prev => [...prev.slice(-20), newLog]);
    };

    const handleRunCycle = async () => {
        if (!googleKey) {
            addLog("ERROR", "Google API Key missing. Stopping.", "error");
            setIsRunning(false);
            return;
        }

        try {
            // STEP 1: HUNTING
            setCurrentAction("HUNTING");
            let targetNiche = selectedNiche;
            if (selectedNiche === 'AUTO') {
                const trendingNiches = [
                    'New AI Video Generators 2025', 
                    'Undetectable AI Writing Tools', 
                    'AI Side Hustle Automation',
                    'AI Crypto Trading Bots', 
                    'Hidden AI Marketing Tools', 
                    'High Ticket AI SaaS Affiliate',
                    'AI Avatar Generators',
                    'Autonomous AI Agents'
                ];
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
            
            const freshProducts = huntResult.products.filter(p => !processedLinks.current.has(p.affiliate_link));
            
            if (freshProducts.length === 0) {
                 addLog("SKIPPING", "All found products have been processed recently. Skipping to next niche.", "warning");
                 // Don't throw, just return to loop next cycle
                 return;
            }

            const sortedProducts = freshProducts.sort((a, b) => b.opportunity_score - a.opportunity_score);
            const bestProduct = sortedProducts[0];
            processedLinks.current.add(bestProduct.affiliate_link);

            addLog("WINNER_FOUND", `💎 Selected: ${bestProduct.product_name} (${bestProduct.opportunity_score}/100)`, "success");
            addLog("STRATEGY_INTEL", `💡 Angle: "${bestProduct.content_angle}" | Comm: ${bestProduct.commission_est}`, "info");

            // STEP 2: PLANNING
            setCurrentAction("PLANNING");
            const angle = bestProduct.content_angle || "Viral Review & Demo";
            
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
            addLog("SCRIPTING", `Generated Script: "${plan.generated_content?.title}"`, "success");

            // STEP 3: EXECUTION (Simulated add to queue)
            setCurrentAction("QUEUEING");
            if (plan.generated_content) {
                const newJob: PostingJob = {
                    id: crypto.randomUUID(),
                    content_title: plan.generated_content.title,
                    caption: plan.generated_content.description,
                    hashtags: plan.generated_content.hashtags,
                    platforms: ['youtube', 'tiktok'],
                    scheduled_time: Date.now() + 3600000,
                    status: 'scheduled',
                    scriptData: plan
                };
                onAddToQueue(newJob);
                addLog("DISPATCH", "Job sent to Production Queue", "success");
                setStats(prev => ({...prev, cyclesRun: prev.cyclesRun + 1, videosCreated: prev.videosCreated + 1}));
            }

        } catch (e: any) {
            addLog("ERROR", e.message, "error");
        } finally {
            setCurrentAction("COOLDOWN");
        }
    };

    useEffect(() => {
        let interval: ReturnType<typeof setTimeout>;
        if (isRunning && googleKey) {
            const loop = async () => {
                await handleRunCycle();
                if (isRunning) {
                    addLog("COOLDOWN", "Cooling down engines (10s)...", "info");
                    interval = setTimeout(loop, 10000);
                }
            };
            loop();
        }
        return () => clearTimeout(interval);
    }, [isRunning, googleKey]);

    const formatUptime = (sec: number) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return `${h}h ${m}m ${s}s`;
    };

    return (
        <div className="animate-fade-in space-y-6 pb-12">
            
            {/* Header Status Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <InfinityIcon size={32} className={isRunning ? "text-primary animate-pulse" : "text-slate-600"} />
                        {texts.auto || "Infinity Auto-Pilot"}
                    </h2>
                    <p className="text-slate-400 text-sm">{texts.hunter_desc || "Autonomous Agent Loop: Hunt -> Plan -> Create -> Repeat"}</p>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="text-right hidden md:block">
                        <div className="text-xs text-slate-500 font-bold uppercase">Uptime</div>
                        <div className="font-mono text-xl text-white">{formatUptime(stats.uptime)}</div>
                    </div>
                    
                    <NeonButton 
                        onClick={() => setIsRunning(!isRunning)} 
                        variant={isRunning ? 'danger' : 'primary'}
                        size="lg"
                    >
                        {isRunning ? (
                            <span className="flex items-center gap-2"><Pause fill="currentColor" /> STOP ENGINE</span>
                        ) : (
                            <span className="flex items-center gap-2"><Play fill="currentColor" /> START ENGINE</span>
                        )}
                    </NeonButton>
                </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Configuration */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <Crosshair size={16} className="text-primary"/> {texts.config_title || "Mission Config"}
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Niche Mode</label>
                                <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                                    <button 
                                        onClick={() => setSelectedNiche('AUTO')}
                                        className={`flex-1 py-2 rounded text-xs font-bold transition-all ${selectedNiche === 'AUTO' ? 'bg-primary text-white shadow' : 'text-slate-400'}`}
                                    >
                                        AUTO (Trend)
                                    </button>
                                    <button 
                                        onClick={() => setSelectedNiche('MANUAL')}
                                        className={`flex-1 py-2 rounded text-xs font-bold transition-all ${selectedNiche === 'MANUAL' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                                    >
                                        MANUAL
                                    </button>
                                </div>
                                {selectedNiche === 'MANUAL' && (
                                    <input 
                                        type="text" 
                                        placeholder="Enter specific niche..."
                                        className="w-full mt-2 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
                                    />
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-800">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">AI Model Stack</label>
                                <div className="text-[10px] text-slate-400 space-y-1 bg-slate-950 p-2 rounded border border-slate-800">
                                    <div className="flex justify-between"><span>Script:</span> <span className="text-white">{scriptModel}</span></div>
                                    <div className="flex justify-between"><span>Visual:</span> <span className="text-white">{visualModel}</span></div>
                                    <div className="flex justify-between"><span>Voice:</span> <span className="text-white">{voiceModel}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                         <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <BarChart3 size={16} className="text-green-500"/> Live Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                                <div className="text-2xl font-bold text-white">{stats.cyclesRun}</div>
                                <div className="text-[10px] text-slate-500 uppercase">Cycles</div>
                            </div>
                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                                <div className="text-2xl font-bold text-primary">{stats.videosCreated}</div>
                                <div className="text-[10px] text-slate-500 uppercase">Videos</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Live Terminal & Visualizer */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    
                    {/* Status Display */}
                    <div className="grid grid-cols-4 gap-2">
                        {['HUNTING', 'PLANNING', 'QUEUEING', 'COOLDOWN'].map((step, i) => {
                            const isActive = currentAction === step;
                            const isPast = ['HUNTING', 'PLANNING', 'QUEUEING', 'COOLDOWN'].indexOf(currentAction) > i;
                            return (
                                <div key={step} className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                                    isActive 
                                    ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(14,165,164,0.3)]' 
                                    : isPast ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-slate-950 border-slate-800 text-slate-700'
                                }`}>
                                    <div className={`text-xs font-bold mb-1 ${isActive ? 'animate-pulse' : ''}`}>{step}</div>
                                    {isActive && <Loader2 size={14} className="animate-spin" />}
                                </div>
                            )
                        })}
                    </div>

                    {/* Live Logs */}
                    <div className="flex-1 bg-black border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl min-h-[400px]">
                        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Zap size={14} className={isRunning ? "text-yellow-400" : "text-slate-600"} />
                                <span className="text-xs font-mono font-bold text-slate-300">SYSTEM_LOGS.exe</span>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                            </div>
                        </div>
                        
                        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-90">
                            {logs.length === 0 && <div className="text-slate-700 italic text-center mt-10">System Ready. Initiate Engine to start logs...</div>}
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-3 animate-fade-in group hover:bg-white/5 p-1 rounded">
                                    <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                                    <span className={`font-bold shrink-0 w-24 ${
                                        log.status === 'error' ? 'text-red-500' : 
                                        log.status === 'success' ? 'text-green-400' : 
                                        log.status === 'warning' ? 'text-yellow-400' : 'text-blue-400'
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

            </div>
        </div>
    );
};

export default AutoPilotDashboard;
