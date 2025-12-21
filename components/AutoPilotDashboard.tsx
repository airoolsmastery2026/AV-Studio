
import React, { useRef, useEffect, useState } from 'react';
import { 
    Infinity as InfinityIcon, Play, Pause, Zap, Crosshair, 
    Loader2, Activity, Cpu, Sparkles, Target, ShieldCheck,
    ChevronDown, Layers, Search, FileText, Video, Mic, Share2, TrendingUp, DollarSign,
    SearchCode, BarChartHorizontal, Eye, Radar, CheckCircle, Clock, ShoppingBag, Store, UserCircle2, AlertTriangle, ExternalLink, Flame, BrainCircuit, Globe, Rocket, Scissors, Gauge
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
  onNavigateToAnalytics?: (target: string) => void;
}

const MISSION_STAGES = [
    { id: AppStatus.HUNTING, label: 'A. RECON', desc: 'Google Search Digital Hunt' },
    { id: AppStatus.PLANNING, label: 'B. STRATEGY', desc: 'VidIQ SEO Blueprinting' },
    { id: AppStatus.RENDERING, label: 'C. PRODUCTION', desc: 'Neural Asset Engine' },
    { id: AppStatus.SCHEDULING, label: 'D. DISPATCH', desc: 'Smart Platform Push' }
];

const AutoPilotDashboard: React.FC<AutoPilotDashboardProps> = ({ 
    isRunning, setIsRunning, stats, logs, currentAction, selectedNiche, setSelectedNiche,
    isRunning: _ignored, currentMission, onNavigateToAnalytics
}) => {
    const logsEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

    const formatUptime = (sec: number) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        return `${h}h ${m}m`;
    };

    return (
        <div className="animate-fade-in space-y-6 pb-20">
            
            {/* CENTRAL COMMAND BAR */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-8 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-accent opacity-50`}></div>
                
                <div className="flex items-center gap-6">
                    <div className={`p-5 rounded-2xl bg-slate-950 border ${isRunning ? 'border-primary shadow-neon' : 'border-slate-800'}`}>
                        <InfinityIcon size={40} className={isRunning ? "text-primary animate-pulse" : "text-slate-700"} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Digital Factory <span className="text-[10px] bg-primary px-2 py-1 rounded ml-2">AUTO-PILOT AI</span></h2>
                        <div className="flex items-center gap-3 mt-1">
                            <Radar size={14} className="text-primary animate-spin-slow" /> 
                            <span className="text-slate-500 text-xs font-mono uppercase tracking-widest italic">Multi-Niche Grounding Active...</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-10 px-10 py-4 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                    <div className="text-center">
                        <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Missions</div>
                        <div className="font-mono text-xl text-primary font-black">{stats.cyclesRun}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Engaged</div>
                        <div className="font-mono text-xl text-white font-black">{stats.videosCreated}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Uptime</div>
                        <div className="font-mono text-xl text-slate-400 font-black">{formatUptime(stats.uptime)}</div>
                    </div>
                </div>

                <div className="flex gap-3">
                   <NeonButton onClick={() => setIsRunning(!isRunning)} variant={isRunning ? 'danger' : 'primary'} size="lg" className="min-w-[220px] h-16">
                       {isRunning ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                       {isRunning ? 'HALT FACTORY' : 'ENGAGE FACTORY'}
                   </NeonButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT: MISSION PIPELINE STATUS */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-slate-950 border border-slate-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                           <Activity size={20} className="text-primary" /> Active Pipeline
                        </h3>

                        <div className="space-y-10 relative">
                            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-800"></div>

                            {MISSION_STAGES.map((stage) => {
                                const isActive = currentAction === stage.id;
                                const isPast = stats.cyclesRun > 0 && !isActive; 
                                
                                return (
                                    <div key={stage.id} className={`flex items-start gap-5 relative z-10 transition-all ${isActive ? 'scale-105' : 'opacity-40'}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                            isActive ? 'bg-primary border-primary shadow-neon text-white animate-pulse' : 
                                            isPast ? 'bg-slate-800 border-primary text-primary' : 'bg-slate-900 border-slate-800 text-slate-700'
                                        }`}>
                                            {isActive ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                        </div>
                                        <div>
                                            <div className={`text-[11px] font-black uppercase tracking-tighter ${isActive ? 'text-primary' : 'text-slate-500'}`}>{stage.label}</div>
                                            <div className="text-[10px] text-slate-600 font-bold">{stage.desc}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 shadow-xl">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Target size={16} className="text-primary"/> Target Sector</h3>
                        <div className="space-y-4">
                             <select 
                                value={selectedNiche} 
                                onChange={(e) => setSelectedNiche(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white outline-none focus:border-primary transition-all font-bold"
                            >
                                <option value="AUTO">🌟 AUTO (Smart Select)</option>
                                <option value="AI_SAAS_TOOLS">🤖 AI SaaS Tools</option>
                                <option value="ML_PLATFORMS">🧠 Machine Learning Platforms</option>
                                <option value="AI_PRODUCTIVITY_HACKS">⚡ AI Productivity Hacks</option>
                                <option value="PASSIVE_INCOME">💰 Passive Income Methods</option>
                                <option value="SMART_HOME_GADGETS">🏠 Smart Home Gadgets</option>
                                <option value="CRYPTO">💎 Web3 & DeFi Apps</option>
                                <option value="FINANCE">🏦 FinTech & Trading</option>
                            </select>
                            <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-[10px] text-slate-400 italic font-medium">
                                Robot ưu tiên tìm kiếm các tín hiệu trending thuộc ngách bạn chọn.
                            </div>
                        </div>
                    </div>
                </div>

                {/* CENTER: MISSION REPORT */}
                <div className="lg:col-span-6 space-y-6">
                    <div className="bg-slate-950 border border-slate-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden flex flex-col min-h-[600px]">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <SearchCode size={20} className="text-primary" /> Strategic Intelligence Report
                            </h3>
                            {currentMission && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                                    <Flame size={12} className="text-primary" />
                                    <span className="text-[10px] font-black text-primary">TRENDING: {currentMission.trending_score || 85}%</span>
                                </div>
                            )}
                        </div>

                        {currentMission ? (
                            <div className="animate-fade-in space-y-8">
                                {/* VidIQ SEO Dashboard */}
                                {currentMission.vidiq_score && (
                                    <div className="grid grid-cols-3 gap-4 bg-slate-900/50 p-6 rounded-3xl border border-primary/20 shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5"><Gauge size={80} /></div>
                                        <div className="flex flex-col items-center justify-center text-center border-r border-slate-800">
                                            <div className="text-4xl font-black text-primary">{currentMission.vidiq_score.seo_score}</div>
                                            <div className="text-[9px] text-slate-500 font-black uppercase mt-1">SEO Score</div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center text-center border-r border-slate-800">
                                            <div className={`text-sm font-black px-2 py-0.5 rounded border ${
                                                currentMission.vidiq_score.keyword_difficulty === 'LOW' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 
                                                currentMission.vidiq_score.keyword_difficulty === 'MEDIUM' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'
                                            }`}>
                                                {currentMission.vidiq_score.keyword_difficulty}
                                            </div>
                                            <div className="text-[9px] text-slate-500 font-black uppercase mt-1">Difficulty</div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="text-lg font-black text-accent">{currentMission.vidiq_score.trending_momentum}%</div>
                                            <div className="text-[9px] text-slate-500 font-black uppercase mt-1">Momentum</div>
                                        </div>
                                    </div>
                                )}

                                {/* Product Summary Card */}
                                <div className="bg-slate-900 rounded-3xl p-7 border border-slate-800 relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><BrainCircuit size={100} /></div>
                                    <div className="flex gap-8 items-start relative z-10">
                                        <div className="w-24 h-24 bg-slate-950 rounded-3xl flex items-center justify-center border border-slate-800 shadow-inner group-hover:border-primary/50 transition-colors">
                                            {currentMission.pricing_model === 'Course' ? <Globe className="text-primary" size={40} /> : <Cpu className="text-primary" size={40} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-2">
                                                <Store size={12} /> {currentMission.store_name} • {currentMission.platform}
                                            </div>
                                            <h4 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter mb-3">{currentMission.product_name}</h4>
                                            <div className="flex flex-wrap gap-4">
                                                <div className="flex items-center gap-1.5 text-xs text-green-400 font-bold bg-green-400/5 px-3 py-1 rounded-full border border-green-400/20">
                                                    <DollarSign size={14} /> Price: {currentMission.price_range}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/5 px-3 py-1 rounded-full border border-primary/20">
                                                    <TrendingUp size={14} /> Commission: {currentMission.commission_rate}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SEO Insight Tags */}
                                {currentMission.vidiq_score?.suggested_tags && (
                                    <div className="space-y-3">
                                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                                            <Sparkles size={14} className="text-primary" /> Viral Keyword Pulse
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {currentMission.vidiq_score.suggested_tags.map((tag, i) => (
                                                <span key={i} className="text-[9px] bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-400 font-black uppercase tracking-tight hover:border-primary/50 transition-all cursor-default">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Competitor Quick-Action */}
                                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                                            <Scissors size={14} className="text-red-500" /> Competitor Dissection Ready
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {currentMission.competitor_urls.slice(0, 2).map((url, i) => (
                                            <div key={i} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 group/comp">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-500">#{i+1}</div>
                                                    <span className="text-[11px] text-slate-400 truncate font-mono">{url}</span>
                                                </div>
                                                <button 
                                                    onClick={() => onNavigateToAnalytics?.(url)}
                                                    className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-lg transition-all text-[10px] font-black flex items-center gap-1"
                                                >
                                                    <Scissors size={14} /> DISSECT
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 space-y-6">
                                <Radar size={80} className="animate-spin-slow text-primary" />
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black text-white uppercase tracking-tighter">Hunting Digital Products...</h4>
                                    <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Scanning SaaS & SEO Data</p>
                                </div>
                                <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary animate-[moveRight_2s_infinite]"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: LIVE DATA STREAM */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-black border border-slate-800 rounded-[40px] overflow-hidden flex flex-col h-[600px] shadow-2xl relative">
                        <div className="bg-slate-900 px-8 py-5 border-b border-slate-800 flex justify-between items-center z-10">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Cpu size={14} /> Mission Logs
                            </span>
                            <div className="flex gap-2">
                                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-black rounded uppercase border border-green-500/20">Online</span>
                            </div>
                        </div>

                        <div className="flex-1 p-8 font-mono text-[11px] overflow-y-auto space-y-4 custom-scrollbar relative">
                            {logs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                    <Clock size={40} className="mb-4" />
                                    <span className="uppercase font-black tracking-widest text-[10px]">Awaiting Dispatch</span>
                                </div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className={`flex gap-4 animate-fade-in border-l-2 pl-4 py-1 ${
                                        log.status === 'error' ? 'border-red-500 bg-red-500/5' : 
                                        log.status === 'success' ? 'border-green-500 bg-green-500/5' : 'border-primary bg-primary/5'
                                    }`}>
                                        <span className="text-slate-600 shrink-0 font-bold">[{log.timestamp}]</span>
                                        <div>
                                            <span className={`font-black uppercase text-[10px] block ${
                                                log.status === 'error' ? 'text-red-500' : 'text-primary'
                                            }`}>{log.action}</span>
                                            <span className="text-slate-300 italic">{log.detail}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={logsEndRef} />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[40px] p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck size={20} className="text-primary" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">SEO Protocol Active</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed italic">
                            "Auto-Hunter logic now integrates VidIQ-style scoring to ensure only high-CTR content enters production."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutoPilotDashboard;
