
import React, { useRef, useEffect } from 'react';
import { 
    Infinity as InfinityIcon, Play, Pause, Zap, Crosshair, 
    BarChart3, Loader2, Activity, Cpu, Sparkles, 
    ArrowRight, Rocket, TrendingUp, DollarSign, Bot 
} from 'lucide-react';
import { 
    ApiKeyConfig, PostingJob, CompletedVideo, ScriptModel, VisualModel, VoiceModel, 
    VideoResolution, AspectRatio, AutoPilotStats, AutoPilotLog 
} from '../types';
import NeonButton from './NeonButton';

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

  // Injected Global State
  isRunning: boolean;
  setIsRunning: (v: boolean) => void;
  stats: AutoPilotStats;
  logs: AutoPilotLog[];
  currentAction: string;
  selectedNiche: string;
  setSelectedNiche: (n: string) => void;
}

const NICHE_PRESETS = [
    { value: 'AUTO', label: '🚀 AUTO-DETECT (Max Trending)', color: 'text-primary' },
    { value: 'AI SaaS Tools', label: '🤖 AI SaaS Tools (Recurring $)', color: 'text-blue-400' },
    { value: 'Machine Learning Platforms', label: '🧠 ML Platforms (High Ticket)', color: 'text-purple-400' },
    { value: 'AI Productivity Hacks', label: '⚡ AI Productivity Hacks (Viral)', color: 'text-cyan-400' },
    { value: 'Passive Income Methods', label: '💰 Passive Income Methods', color: 'text-green-400' },
    { value: 'Smart Home Gadgets', label: '🏠 Smart Home Gadgets (E-com)', color: 'text-orange-400' }
];

const AutoPilotDashboard: React.FC<AutoPilotDashboardProps> = ({ 
    t, scriptModel, visualModel, voiceModel,
    isRunning, setIsRunning, stats, logs, currentAction, selectedNiche, setSelectedNiche
}) => {
    const texts = t || {};
    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const formatUptime = (sec: number) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return `${h}h ${m}m ${s}s`;
    };

    return (
        <div className="animate-fade-in space-y-4 pb-12">
            
            {/* CONSOLIDATED HEADER: SYSTEM STATUS & CORE METRICS */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col xl:flex-row justify-between items-center gap-6 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl bg-slate-950 border ${isRunning ? 'border-primary shadow-[0_0_15px_rgba(14,165,164,0.4)]' : 'border-slate-800'}`}>
                        <InfinityIcon size={32} className={isRunning ? "text-primary animate-pulse" : "text-slate-600"} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
                            INFINITY AUTO-PILOT <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black animate-pulse">LIVE</span>
                        </h2>
                        <p className="text-slate-400 text-xs font-mono">Autonomous Hunter-Creator Protocol v2.5</p>
                    </div>
                </div>

                {/* MERGED STATS INTO HEADER */}
                <div className="flex flex-wrap items-center justify-center gap-8 px-8 py-3 bg-black/40 rounded-2xl border border-white/5">
                    <div className="text-center">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Session Uptime</div>
                        <div className="font-mono text-lg text-white font-bold">{formatUptime(stats.uptime)}</div>
                    </div>
                    <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>
                    <div className="text-center">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Cycles</div>
                        <div className="font-mono text-lg text-primary font-bold">{stats.cyclesRun}</div>
                    </div>
                    <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>
                    <div className="text-center">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Assets Minted</div>
                        <div className="font-mono text-lg text-blue-400 font-bold">{stats.videosCreated}</div>
                    </div>
                </div>

                <NeonButton 
                    onClick={() => setIsRunning(!isRunning)} 
                    variant={isRunning ? 'danger' : 'primary'}
                    size="lg"
                    className="min-w-[220px] h-14"
                >
                    {isRunning ? (
                        <span className="flex items-center gap-2"><Pause fill="currentColor" size={20} /> PAUSE SYSTEM</span>
                    ) : (
                        <span className="flex items-center gap-2"><Play fill="currentColor" size={20} /> ACTIVATE ENGINE</span>
                    )}
                </NeonButton>
            </div>

            {/* MAIN OPERATIONAL GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* LEFT: TACTICAL DEPLOYMENT CENTER (Consolidated) */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Rocket size={80} />
                        </div>
                        
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Crosshair size={14} className="text-primary"/> Deployment Parameters
                        </h3>
                        
                        <div className="space-y-6">
                            {/* NICHE SELECTOR */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Target Revenue Stream (Niche)</label>
                                <div className="relative group">
                                    <select 
                                        value={selectedNiche}
                                        onChange={(e) => setSelectedNiche(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-4 pr-10 text-sm text-white appearance-none focus:outline-none focus:border-primary transition-all font-bold cursor-pointer"
                                    >
                                        {NICHE_PRESETS.map(niche => (
                                            <option key={niche.value} value={niche.value} className="bg-slate-900 text-white font-sans">
                                                {niche.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                        <TrendingUp size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* DYNAMIC MODEL STACK INFO */}
                            <div className="pt-6 border-t border-slate-800/50">
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Injected AI Intelligence</label>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-white/5 group hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Bot size={14} className="text-purple-400" />
                                            <span className="text-xs text-slate-400">Logic Core:</span>
                                        </div>
                                        <span className="text-xs font-bold text-white">{scriptModel}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-white/5 group hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Sparkles size={14} className="text-blue-400" />
                                            <span className="text-xs text-slate-400">Visual Engine:</span>
                                        </div>
                                        <span className="text-xs font-bold text-white">{visualModel}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-white/5 group hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Zap size={14} className="text-yellow-400" />
                                            <span className="text-xs text-slate-400">Voice Synth:</span>
                                        </div>
                                        <span className="text-xs font-bold text-white">{voiceModel}</span>
                                    </div>
                                </div>
                            </div>

                            {/* QUICK ACTION BANNER */}
                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1"><DollarSign size={16} className="text-primary"/></div>
                                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                        Bot is currently monitoring global API signals. For faster results, ensure your <strong>Google Search Grounding</strong> is active in settings.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: LIVE INTELLIGENCE STREAM (Logs + Action integrated) */}
                <div className="lg:col-span-8 flex flex-col h-full">
                    <div className="flex-1 bg-black border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl min-h-[500px]">
                        {/* TERMINAL HEADER WITH ACTION INTEGRATION */}
                        <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></div>
                                <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest">
                                    Autonomous execution stream
                                </span>
                            </div>
                            
                            {/* CURRENT ACTION DISPLAYED HERE */}
                            <div className="flex items-center gap-3 px-4 py-1 bg-slate-950 border border-white/10 rounded-full">
                                <span className="text-[9px] font-bold text-slate-500 uppercase">Process:</span>
                                <span className="text-[11px] font-black text-primary font-mono tracking-tighter">
                                    {currentAction} {isRunning && currentAction !== 'IDLE' && currentAction !== 'COOLDOWN' && <Loader2 size={10} className="inline animate-spin ml-1" />}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex-1 p-6 font-mono text-xs overflow-y-auto space-y-3 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-fixed opacity-95 custom-scrollbar">
                            {logs.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
                                    <Activity size={48} className="opacity-20" />
                                    <p className="italic text-sm">System idle. Pending command initiation...</p>
                                </div>
                            )}
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-4 animate-fade-in group py-0.5">
                                    <span className="text-slate-600 shrink-0 select-none opacity-50">[{log.timestamp}]</span>
                                    <span className={`font-black shrink-0 w-24 tracking-tighter ${
                                        log.status === 'error' ? 'text-red-500' : 
                                        log.status === 'success' ? 'text-emerald-400' : 
                                        log.status === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                                    }`}>
                                        {log.action}
                                    </span>
                                    <span className="text-slate-200 break-all leading-relaxed">{log.detail}</span>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>

                        {/* TERMINAL FOOTER DECORATION */}
                        <div className="h-1.5 w-full bg-slate-800">
                            {isRunning && <div className="h-full bg-primary animate-[loading_2s_ease-in-out_infinite]" style={{width: '30%'}}></div>}
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(400%); }
                }
            `}</style>
        </div>
    );
};

export default AutoPilotDashboard;
