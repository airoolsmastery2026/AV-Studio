
import React, { useRef, useEffect, useState } from 'react';
import { 
    Infinity as InfinityIcon, Play, Pause, Zap, Crosshair, 
    Loader2, Activity, Sparkles, Target, ShieldCheck,
    SearchCode, Radar, CheckCircle, Clock, BrainCircuit, Globe, Rocket, Terminal, Cpu as Processor, MoveUpRight, Trophy, Coins, Settings2, ChevronDown, ChevronUp,
    ZapOff, BarChart3, TrendingUp, Search, Layers, Box, Fingerprint, Microscope
} from 'lucide-react';
import { 
    ApiKeyConfig, PostingJob, CompletedVideo, ScriptModel, VisualModel, VoiceModel, 
    VideoResolution, AspectRatio, AutoPilotStats, AutoPilotLog, AppStatus, ContentLanguage, MissionIntel 
} from '../types';
import NeonButton from './NeonButton';
import ModelSelector from './ModelSelector';

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
    isRunning, setIsRunning, stats, logs, currentAction, selectedNiche, setSelectedNiche,
    currentMission, t, scriptModel, setScriptModel, visualModel, setVisualModel, voiceModel, setVoiceModel,
    resolution, setResolution, aspectRatio, setAspectRatio
}) => {
    const logsEndRef = useRef<HTMLDivElement>(null);
    const [isConfigExpanded, setIsConfigExpanded] = useState(false);
    
    useEffect(() => { 
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); 
        }
    }, [logs]);

    const MISSION_STAGES = [
        { id: AppStatus.HUNTING, label: 'HUNTING', desc: 'Săn tìm sản phẩm Bounty cao' },
        { id: AppStatus.PLANNING, label: 'SCRIPTING', desc: 'Viết kịch bản phái sinh DNA' },
        { id: AppStatus.RENDERING, label: 'RENDERING', desc: 'Tổng hợp video VEO 3.1' },
        { id: AppStatus.SCHEDULING, label: 'DISPATCH', desc: 'Lên lịch đăng đa kênh' }
    ];

    const NICHES = [
        { value: 'AI_SAAS_TOOLS', label: "🤖 AI SaaS (Bounty cao nhất)" },
        { value: 'AI_HARDWARE', label: "💻 AI Workstations & GPUs" },
        { value: 'AI_PROMPT_MKT', label: "🎭 Prompt Engineering Market" }
    ];

    return (
        <div className="animate-fade-in space-y-6 pb-20">
            {/* Tactical Control Center */}
            <div className="bg-[#0A101F] border border-slate-800 rounded-[40px] p-6 md:p-10 shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className={`p-6 rounded-[28px] bg-slate-950 border transition-all duration-500 ${isRunning ? 'border-primary shadow-neon scale-105' : 'border-slate-800'}`}>
                        <div className="relative">
                           <InfinityIcon size={36} className={isRunning ? "text-primary animate-pulse" : "text-slate-700"} />
                           {isRunning && <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></span>}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none">Auto-Hunter Alpha</h2>
                        <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
                                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">
                                    {isRunning ? "AUTONOMOUS AGENT ONLINE" : "AGENT ON STANDBY"}
                                </span>
                            </div>
                            <span className="text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                               Target: {selectedNiche.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="hidden xl:grid grid-cols-3 gap-4 px-8 py-4 bg-black/40 rounded-[24px] border border-white/5 shadow-inner">
                        <div className="text-center border-r border-white/5 pr-4">
                            <div className="text-[8px] text-slate-500 font-black uppercase mb-1">Cycles</div>
                            <div className="font-mono text-xl text-primary font-black leading-none">{stats.cyclesRun}</div>
                        </div>
                        <div className="text-center border-r border-white/5 px-4">
                            <div className="text-[8px] text-slate-500 font-black uppercase mb-1">Success</div>
                            <div className="font-mono text-xl text-green-500 font-black leading-none">{stats.postedCount}</div>
                        </div>
                        <div className="text-center pl-4">
                            <div className="text-[8px] text-slate-500 font-black uppercase mb-1">Uptime</div>
                            <div className="font-mono text-xl text-white font-black leading-none">{stats.uptime}h</div>
                        </div>
                    </div>

                    <button 
                      onClick={() => setIsRunning(!isRunning)} 
                      className={`px-10 h-16 rounded-[24px] font-black uppercase text-xs flex items-center justify-center gap-3 transition-all shadow-2xl ${
                        isRunning ? 'bg-red-500/10 border border-red-500/40 text-red-500 hover:bg-red-500/20' : 'bg-primary border border-primary/40 text-white shadow-neon hover:scale-105 active:scale-95'
                      }`}
                    >
                        {isRunning ? <ZapOff size={20} /> : <Zap size={20} />}
                        {isRunning ? 'DEACTIVATE' : 'LAUNCH RADAR'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Pipeline & Strategic Controls */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-[#070B14] border border-slate-800 rounded-[32px] p-8 shadow-2xl">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-3">
                           <Microscope size={16} className="text-primary" /> Tactical Pipeline
                        </h3>
                        <div className="space-y-6">
                            {MISSION_STAGES.map((stage) => {
                                const isActive = currentAction === stage.id;
                                return (
                                    <div key={stage.id} className={`flex items-start gap-4 transition-all duration-500 ${isActive ? 'opacity-100 translate-x-1' : 'opacity-20'}`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isActive ? 'bg-primary border-primary shadow-neon-hover' : 'bg-slate-900 border-slate-800 text-slate-700'}`}>
                                            {isActive ? <Loader2 size={18} className="animate-spin text-white" /> : <CheckCircle size={18} />}
                                        </div>
                                        <div>
                                            <div className="text-xs font-black uppercase text-white tracking-tight">{stage.label}</div>
                                            <div className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest leading-none">{stage.desc}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-[#070B14] border border-slate-800 rounded-[32px] p-8 shadow-2xl space-y-6">
                        <div className="flex items-center gap-3">
                            <Target size={18} className="text-red-500" />
                            <label className="text-[10px] font-black text-white uppercase tracking-widest">Target Sector</label>
                        </div>
                        <div className="space-y-3">
                            {NICHES.map(n => (
                                <button
                                    key={n.value}
                                    onClick={() => setSelectedNiche(n.value)}
                                    disabled={isRunning}
                                    className={`w-full p-4 rounded-2xl text-[10px] font-black uppercase text-left transition-all border ${
                                        selectedNiche === n.value 
                                        ? 'bg-primary/10 border-primary text-primary shadow-neon' 
                                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                                    }`}
                                >
                                    {n.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Intelligence Mission Display */}
                <div className="lg:col-span-6">
                    <div className="bg-[#070B14] border border-slate-800 rounded-[40px] p-8 md:p-12 shadow-2xl min-h-[620px] flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                           <Processor size={300} />
                        </div>
                        
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                                <SearchCode size={24} className="text-primary" /> Current Intelligence Mission
                            </h3>
                            {isRunning && (
                                <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                                    <Radar size={14} className="text-primary animate-spin-slow" />
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Live Scanning API Tools...</span>
                                </div>
                            )}
                        </div>

                        {currentMission ? (
                            <div className="animate-fade-in space-y-10 flex-1 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-900/80 p-8 rounded-[32px] border border-primary/20 flex flex-col items-center shadow-xl group hover:border-primary transition-all">
                                        <div className="text-5xl font-black text-primary tracking-tighter group-hover:scale-110 transition-transform">{currentMission.trending_score}%</div>
                                        <div className="text-[9px] text-slate-500 font-black uppercase mt-2 tracking-widest">Algorithm Fit Score</div>
                                        <div className="mt-4 w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                                            <div className="bg-primary h-full shadow-neon" style={{ width: `${currentMission.trending_score}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/80 p-8 rounded-[32px] border border-green-500/20 flex flex-col items-center shadow-xl group hover:border-green-500 transition-all">
                                        <div className="text-4xl font-black text-green-500 flex items-center gap-2 tracking-tighter">
                                           <Coins size={32}/> {currentMission.commission_rate}
                                        </div>
                                        <div className="text-[9px] text-slate-500 font-black uppercase mt-2 tracking-widest">Commission Bounty</div>
                                        <div className="mt-4 flex gap-1">
                                            {[1, 2, 3, 4, 5].map(s => <div key={s} className={`w-3 h-1 rounded-full ${s <= 4 ? 'bg-green-500' : 'bg-slate-800'}`}></div>)}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-[40px] space-y-6 relative group hover:border-primary/30 transition-all">
                                    <div className="flex justify-between items-start">
                                       <div className="space-y-1">
                                           <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                              <Fingerprint size={14} className="text-primary" /> Target Identified
                                           </div>
                                           <h4 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">{currentMission.product_name}</h4>
                                       </div>
                                       <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                          <Box size={24} className="text-primary" />
                                       </div>
                                    </div>
                                    
                                    <div className="p-6 bg-slate-950/80 rounded-[28px] border border-slate-800 italic text-sm text-slate-300 leading-relaxed font-medium shadow-inner">
                                        "{currentMission.reason_to_promote}"
                                    </div>

                                    <div className="flex flex-col md:flex-row justify-between items-center pt-6 gap-4">
                                        <div className="flex gap-2">
                                            <span className="text-[9px] bg-slate-950 px-4 py-2 rounded-xl text-primary font-black uppercase border border-primary/20">#AI_Automation</span>
                                            <span className="text-[9px] bg-slate-950 px-4 py-2 rounded-xl text-blue-400 font-black uppercase border border-blue-400/20">#Efficiency</span>
                                        </div>
                                        <a href={currentMission.affiliate_link} target="_blank" className="w-full md:w-auto px-6 py-3 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-3 border border-primary/20">
                                            RECON SOURCE <MoveUpRight size={14} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 space-y-8 animate-pulse">
                                <div className="relative">
                                   <Radar size={120} className="animate-spin-slow text-primary" />
                                   <div className="absolute inset-0 flex items-center justify-center">
                                      <Search size={40} className="text-white opacity-20" />
                                   </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-2xl font-black text-white uppercase tracking-widest">Searching for High-Bounty AI Tools</h4>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Analyzing Global Signal Data...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Agent Intelligence Console */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-black border border-slate-800 rounded-[32px] overflow-hidden flex flex-col h-[620px] shadow-2xl">
                        <div className="bg-[#0A101F] px-8 py-5 border-b border-slate-800 shrink-0 flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                <Terminal size={16} className="text-primary" /> Agent Reasoning
                            </span>
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        </div>
                        <div className="flex-1 p-8 font-mono text-[10px] overflow-y-auto space-y-4 custom-scrollbar text-slate-400">
                            {logs.map((log, i) => (
                                <div key={i} className={`flex flex-col gap-2 border-l-2 pl-4 py-1 transition-all hover:bg-white/5 rounded-r-lg ${
                                    log.status === 'error' ? 'border-red-500 bg-red-500/5' : 
                                    log.status === 'success' ? 'border-green-500 bg-green-500/5' : 
                                    'border-primary/40'
                                }`}>
                                    <div className="flex justify-between text-[7px] opacity-40 font-black">
                                        <span className="uppercase tracking-widest">Process_{i.toString().padStart(3, '0')}</span>
                                        <span>{log.timestamp}</span>
                                    </div>
                                    <div className={`leading-relaxed ${log.status === 'error' ? 'text-red-400' : log.status === 'success' ? 'text-green-400' : 'text-slate-300'}`}>
                                        <strong className="uppercase mr-2">[{log.action}]</strong>
                                        {log.detail}
                                    </div>
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
