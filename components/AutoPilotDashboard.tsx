
import React, { useRef, useEffect, useState } from 'react';
import { 
    Infinity as InfinityIcon, Play, Pause, Zap, Crosshair, 
    Loader2, Activity, Cpu, Sparkles, Target, ShieldCheck,
    ChevronDown, Layers, Search, FileText, Video, Mic, Share2, TrendingUp, DollarSign,
    SearchCode, BarChartHorizontal, Eye, Radar, CheckCircle, Clock, ShoppingBag, Store, UserCircle2, AlertTriangle, ExternalLink, Flame, BrainCircuit, Globe, Rocket, Scissors, Gauge, Wand2, Lightbulb, Trophy, Fingerprint, MessageSquareText, Coins, Star, TrendingDown, MoveUpRight,
    // Fix: Added missing Terminal import
    Terminal
} from 'lucide-react';
import { 
    ApiKeyConfig, PostingJob, CompletedVideo, ScriptModel, VisualModel, VoiceModel, 
    VideoResolution, AspectRatio, AutoPilotStats, AutoPilotLog, AppStatus, ContentLanguage, MissionIntel 
} from '../types';
import NeonButton from './NeonButton';

interface AutoPilotDashboardProps {
  apiKeys: ApiKeyConfig[];
  isRunning: boolean;
  setIsRunning: (v: boolean) => void;
  stats: AutoPilotStats;
  logs: AutoPilotLog[];
  currentAction: string;
  selectedNiche: string;
  setSelectedNiche: (n: string) => void;
  onAddToQueue: (job: PostingJob) => void;
  onVideoGenerated: (video: CompletedVideo) => void;
  completedVideos: CompletedVideo[];
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
  contentLanguage: ContentLanguage;
  currentMission: MissionIntel | null;
  t: any;
}

const AutoPilotDashboard: React.FC<AutoPilotDashboardProps> = ({ 
    apiKeys, isRunning, setIsRunning, stats, logs, currentAction, selectedNiche, setSelectedNiche,
    currentMission, t
}) => {
    const logsEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

    const hasActiveAiKey = apiKeys.some(k => k.provider === 'google' && k.status === 'active');

    const formatUptime = (sec: number) => {
        const m = Math.floor(sec / 60);
        return `${m}m Active`;
    };

    const MISSION_STAGES = [
        { id: AppStatus.HUNTING, label: 'ALPHA RECON', desc: 'Real-time Market Scouring' },
        { id: AppStatus.PLANNING, label: 'NEURAL SCRIPT', desc: 'Generating Paraphrased Script' },
        { id: AppStatus.RENDERING, label: 'VEO RENDER', desc: 'Visual Synthesis in Cloud' },
        { id: AppStatus.SCHEDULING, label: 'DISPATCH', desc: 'Social API Handover' }
    ];

    if (!hasActiveAiKey && isRunning) {
        return (
            <div className="bg-red-900/10 border border-red-500/20 p-12 rounded-[40px] text-center space-y-4 animate-fade-in">
                <AlertTriangle size={48} className="text-red-500 mx-auto" />
                <h3 className="text-xl font-black text-white uppercase">Critical Halt: No AI Core Connected</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">Auto-Pilot requires an active Google Gemini API Key in the Infrastructure Vault to perform autonomous scouting.</p>
                <button onClick={() => setIsRunning(false)} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold text-xs uppercase">Disable Auto-Pilot</button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-4 md:space-y-6 pb-20">
            {/* Control Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-8 shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-6 relative overflow-hidden">
                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className={`p-4 rounded-2xl bg-slate-950 border transition-all duration-500 ${isRunning ? 'border-primary shadow-neon scale-110' : 'border-slate-800'}`}>
                        <InfinityIcon size={28} className={isRunning ? "text-primary animate-pulse" : "text-slate-700"} />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase leading-tight">Agentic Auto-Pilot</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                {isRunning ? `Hunting Niche: ${selectedNiche}` : 'System Offline'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 w-full lg:w-auto">
                    <div className="flex-1 grid grid-cols-3 gap-2 px-6 py-3 bg-black/40 rounded-2xl border border-white/5 min-w-[280px]">
                        <div className="text-center border-r border-white/5">
                            <div className="text-[8px] text-slate-500 font-black uppercase mb-0.5">Cycles</div>
                            <div className="font-mono text-base text-primary font-black">{stats.cyclesRun}</div>
                        </div>
                        <div className="text-center border-r border-white/5">
                            <div className="text-size-[8px] text-slate-500 font-black uppercase mb-0.5">Assets</div>
                            <div className="font-mono text-base text-white font-black">{stats.videosCreated}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[8px] text-slate-500 font-black uppercase mb-0.5">Ops Time</div>
                            <div className="font-mono text-base text-slate-400 font-black">{formatUptime(stats.uptime)}</div>
                        </div>
                    </div>

                    <button 
                      onClick={() => setIsRunning(!isRunning)} 
                      className={`px-8 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 whitespace-nowrap ${
                        isRunning ? 'bg-red-500/10 border border-red-500/40 text-red-500' : 'bg-primary border border-primary/40 text-white shadow-neon'
                      }`}
                    >
                        {isRunning ? <Pause fill="currentColor" size={18} /> : <Play fill="currentColor" size={18} />}
                        {isRunning ? 'Emergency Stop' : 'Engage Hunter'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Pipeline Progress */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-slate-950 border border-slate-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                           <Activity size={16} className="text-primary" /> Core Pipeline
                        </h3>

                        <div className="space-y-8">
                            {MISSION_STAGES.map((stage) => {
                                const isActive = currentAction === stage.id;
                                return (
                                    <div key={stage.id} className={`flex items-start gap-4 transition-all duration-500 ${isActive ? 'opacity-100 translate-x-2' : 'opacity-20'}`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 shrink-0 transition-all ${isActive ? 'bg-primary border-primary shadow-neon animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-700'}`}>
                                            {isActive ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase text-white tracking-tight">{stage.label}</div>
                                            <div className="text-[8px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{stage.desc}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Target size={14} className="text-primary"/> Target Sector</h3>
                        <select 
                            value={selectedNiche} 
                            onChange={(e) => setSelectedNiche(e.target.value)} 
                            disabled={isRunning}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white outline-none focus:border-primary transition-all font-black uppercase disabled:opacity-50"
                        >
                            <option value="AUTO">🚀 Global Trending</option>
                            <option value="AI_SAAS_TOOLS">🤖 AI Software</option>
                            <option value="AI_PRODUCTIVITY_HACKS">⚡ Productivity</option>
                            <option value="SMART_HOME_GADGETS">🏠 Smart Gadgets</option>
                        </select>
                    </div>
                </div>

                {/* Real-time Intel Display */}
                <div className="lg:col-span-6 space-y-4">
                    <div className="bg-slate-950 border border-slate-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <SearchCode size={20} className="text-primary" /> Alpha Acquisition Feed
                            </h3>
                            {isRunning && <span className="flex items-center gap-2 text-[8px] font-black text-primary animate-pulse uppercase tracking-[0.2em]"><Globe size={10}/> Scouring Live Market...</span>}
                        </div>

                        {currentMission ? (
                            <div className="animate-fade-in space-y-8 flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900/50 p-6 rounded-3xl border border-primary/20 flex flex-col items-center justify-center text-center shadow-xl">
                                        <div className="text-4xl font-black text-primary tracking-tighter">{currentMission.trending_score}%</div>
                                        <div className="text-[9px] text-slate-500 font-black uppercase mt-2 tracking-widest">Viral Momentum</div>
                                    </div>
                                    <div className="bg-slate-900/50 p-6 rounded-3xl border border-green-500/20 flex flex-col items-center justify-center text-center shadow-xl">
                                        <div className="text-2xl font-black text-green-500 tracking-tight flex items-center gap-1"><Coins size={20}/> {currentMission.commission_rate}</div>
                                        <div className="text-[9px] text-slate-500 font-black uppercase mt-2 tracking-widest">Bounty Level</div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] space-y-6 relative group">
                                    <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity"><Trophy className="text-yellow-500" size={24}/></div>
                                    
                                    <div className="space-y-1">
                                        <div className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em]">Identified Rising Star</div>
                                        <h4 className="text-2xl font-black text-white uppercase tracking-tight truncate">{currentMission.product_name}</h4>
                                    </div>

                                    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 shadow-inner">
                                        <div className="text-[9px] text-primary font-black uppercase flex items-center gap-2"><BrainCircuit size={12}/> Strategy Rationale</div>
                                        <p className="text-xs text-slate-300 italic leading-relaxed font-medium">"{currentMission.reason_to_promote}"</p>
                                    </div>

                                    <div className="flex justify-between items-center pt-4">
                                        <div className="flex gap-2">
                                            <span className="text-[9px] bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 font-black uppercase">#AutoDetect</span>
                                            <span className="text-[9px] bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 text-primary font-black uppercase">#ViralHigh</span>
                                        </div>
                                        <a href={currentMission.affiliate_link} target="_blank" className="text-[10px] font-black text-primary hover:text-white uppercase flex items-center gap-2 transition-all">
                                            View Affiliate Portal <ExternalLink size={14}/>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 space-y-8">
                                <Radar size={100} className="animate-spin-slow text-primary" />
                                <h4 className="text-xl font-black text-white uppercase tracking-[0.4em]">Predicting Waves...</h4>
                            </div>
                        )}
                    </div>
                </div>

                {/* Execution Logs */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-black border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[300px] md:h-[650px] shadow-2xl relative">
                        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Terminal size={14} /> Agentic Logs
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        </div>
                        <div className="flex-1 p-6 font-mono text-[10px] overflow-y-auto space-y-3 custom-scrollbar">
                            {logs.length === 0 ? (
                                <div className="text-slate-800 italic uppercase font-black text-center mt-20 opacity-20">Awaiting Signal...</div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className={`flex gap-3 animate-fade-in border-l-2 pl-4 py-1.5 ${
                                        log.status === 'error' ? 'border-red-500/50 bg-red-500/5' : log.status === 'success' ? 'border-green-500/50 bg-green-500/5' : 'border-primary/50'
                                    }`}>
                                        <span className="text-slate-700 shrink-0 text-[8px]">[{log.timestamp}]</span>
                                        <span className="text-slate-300 italic leading-snug">{log.detail}</span>
                                    </div>
                                ))
                            )}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutoPilotDashboard;
