
import React, { useRef, useEffect, useState } from 'react';
import { 
    Infinity as InfinityIcon, Play, Pause, Zap, Crosshair, 
    Loader2, Activity, Cpu, Sparkles, Target, ShieldCheck,
    ChevronDown, Layers, Search, FileText, Video, Mic, Share2, TrendingUp, DollarSign,
    SearchCode, BarChartHorizontal, Eye, Radar, CheckCircle, Clock, ShoppingBag, Store, UserCircle2, AlertTriangle, ExternalLink
} from 'lucide-react';
import { 
    ApiKeyConfig, PostingJob, CompletedVideo, ScriptModel, VisualModel, VoiceModel, 
    VideoResolution, AspectRatio, AutoPilotStats, AutoPilotLog, AppStatus, ContentLanguage, MissionIntel 
} from '../types';
import NeonButton from './NeonButton';
import { runAgenticRecon } from '../services/geminiService';

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
}

const MISSION_STAGES = [
    { id: AppStatus.HUNTING, label: 'A. HUNTING', desc: 'Google Search Recon' },
    { id: AppStatus.PLANNING, label: 'B. BRAIN', desc: 'Strategic Planning' },
    { id: AppStatus.RENDERING, label: 'C. CREATION', desc: 'AI Visual Rendering' },
    { id: AppStatus.SCHEDULING, label: 'D. DEPLOY', desc: 'Golden Hour Posting' }
];

const AutoPilotDashboard: React.FC<AutoPilotDashboardProps> = ({ 
    isRunning, setIsRunning, stats, logs, currentAction, selectedNiche, setSelectedNiche,
    scriptModel, visualModel, voiceModel, apiKeys, contentLanguage, currentMission
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
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Mission Control <span className="text-[10px] bg-primary px-2 py-1 rounded ml-2">ROBOT A-Z</span></h2>
                        <div className="flex items-center gap-3 mt-1">
                            <Radar size={14} className="text-primary animate-spin-slow" /> 
                            <span className="text-slate-500 text-xs font-mono uppercase tracking-widest">Autonomous Intelligence Loop Active</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-10 px-10 py-4 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                    <div className="text-center">
                        <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Cycles</div>
                        <div className="font-mono text-xl text-primary font-black">{stats.cyclesRun}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Produced</div>
                        <div className="font-mono text-xl text-white font-black">{stats.videosCreated}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Uptime</div>
                        <div className="font-mono text-xl text-slate-400 font-black">{formatUptime(stats.uptime)}</div>
                    </div>
                </div>

                <div className="flex gap-3">
                   <NeonButton onClick={() => setIsRunning(!isRunning)} variant={isRunning ? 'danger' : 'primary'} size="lg" className="min-w-[200px] h-16">
                       {isRunning ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                       {isRunning ? 'DISENGAGE' : 'KÍCH HOẠT A-Z'}
                   </NeonButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT: MISSION TIMELINE A-Z */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-slate-950 border border-slate-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                           <Activity size={20} className="text-primary" /> Mission Pipeline
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
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Target size={16} className="text-primary"/> Strategic Focus</h3>
                        <div className="space-y-4">
                             <select 
                                value={selectedNiche} 
                                onChange={(e) => setSelectedNiche(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white outline-none focus:border-primary transition-all font-bold"
                            >
                                <option value="AUTO">🤖 TỰ ĐỘNG (Analytic Loop)</option>
                                <option value="AI_SAAS">🛠️ AI Tools & SaaS</option>
                                <option value="BEAUTY">💄 Beauty & Skincare</option>
                                <option value="CRYPTO">📈 Crypto Market</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* CENTER: MISSION INTEL BRIEFING */}
                <div className="lg:col-span-6 space-y-6">
                    <div className="bg-slate-950 border border-slate-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden flex flex-col min-h-[500px]">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <SearchCode size={20} className="text-primary" /> Tactical Intelligence Briefing
                            </h3>
                            <div className="flex items-center gap-2">
                                <div className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-[9px] font-black text-primary rounded uppercase">Live Grounding</div>
                            </div>
                        </div>

                        {currentMission ? (
                            <div className="animate-fade-in space-y-8">
                                {/* Product Summary Card */}
                                <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><ShoppingBag size={80} /></div>
                                    <div className="flex gap-6 items-start">
                                        <div className="w-20 h-20 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 shadow-inner">
                                            <Store className="text-primary" size={32} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[10px] text-slate-500 font-black uppercase mb-1">{currentMission.platform} • {currentMission.store_name}</div>
                                            <h4 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter mb-2">{currentMission.product_name}</h4>
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-1.5 text-xs text-green-400 font-bold">
                                                    <DollarSign size={14} /> {currentMission.price_range}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                                                    <TrendingUp size={14} /> Hoa hồng: {currentMission.commission_rate}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Deep Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                                        <div className="text-[10px] text-slate-500 font-black uppercase mb-3 flex items-center gap-2">
                                            <UserCircle2 size={12} className="text-blue-400" /> Target Audience
                                        </div>
                                        <p className="text-xs text-white font-bold">{currentMission.target_audience}</p>
                                    </div>
                                    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                                        <div className="text-[10px] text-slate-500 font-black uppercase mb-3 flex items-center gap-2">
                                            <AlertTriangle size={12} className={currentMission.market_threat_level === 'HIGH' ? 'text-red-500' : 'text-yellow-500'} /> Market Threat Level
                                        </div>
                                        <p className={`text-xs font-black ${currentMission.market_threat_level === 'HIGH' ? 'text-red-500' : 'text-yellow-500'}`}>{currentMission.market_threat_level}</p>
                                    </div>
                                </div>

                                {/* Rationale Deck */}
                                <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl relative">
                                    <div className="absolute -top-3 left-6 px-3 bg-slate-950 border border-primary/20 text-[9px] font-black text-primary rounded-full uppercase">Robot's Rationale</div>
                                    <p className="text-sm text-slate-300 leading-relaxed italic font-medium">
                                        "{currentMission.winning_rationale}"
                                    </p>
                                </div>

                                {/* Action Bar */}
                                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                                    <div className="flex -space-x-3">
                                        {currentMission.competitor_urls.slice(0, 3).map((_, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[10px] text-slate-500 font-bold">#{i+1}</div>
                                        ))}
                                    </div>
                                    <button className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-2 hover:underline">
                                        View Grounding Sources <ExternalLink size={12} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 space-y-6">
                                <SearchCode size={64} />
                                <div className="space-y-2">
                                    <h4 className="text-lg font-black text-white uppercase tracking-tighter">Awaiting Mission Intel</h4>
                                    <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Robot is scanning for signals...</p>
                                </div>
                                <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary animate-[moveRight_2s_infinite]"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: LIVE DATA STREAM */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-black border border-slate-800 rounded-[40px] overflow-hidden flex flex-col h-[500px] shadow-2xl relative">
                        <div className="bg-slate-900 px-8 py-5 border-b border-slate-800 flex justify-between items-center z-10">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Cpu size={14} /> Data Stream
                            </span>
                            <div className="flex gap-2">
                                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-black rounded uppercase border border-green-500/20">Synced</span>
                            </div>
                        </div>

                        <div className="flex-1 p-8 font-mono text-[11px] overflow-y-auto space-y-4 custom-scrollbar relative">
                            {logs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-20">
                                    <Clock size={40} className="mb-4" />
                                    <span className="uppercase font-black tracking-widest text-[10px]">Awaiting First Mission Cycle...</span>
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
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Safety Shield</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed italic">
                            "Auto-Pilot uses Paraphrase-Only protocol. No copyright content is downloaded or stored."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutoPilotDashboard;
