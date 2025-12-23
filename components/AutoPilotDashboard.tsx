
import React, { useRef, useEffect, useState } from 'react';
import { 
    Infinity as InfinityIcon, Play, Pause, Zap, Crosshair, 
    Loader2, Activity, Sparkles, Target, ShieldCheck,
    SearchCode, Radar, CheckCircle, Clock, BrainCircuit, Globe, Rocket, Terminal, Cpu as Processor, MoveUpRight, Trophy, Coins, Settings2, ChevronDown, ChevronUp
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
        { value: 'AI_SAAS_TOOLS', label: "🤖 AI Tools (Khuyến nghị)" },
        { value: 'SMART_HOME', label: "🏠 Smart Home Gadgets" },
        { value: 'CRYPTO_FINTECH', label: "📈 Crypto & FinTech" }
    ];

    return (
        <div className="animate-fade-in space-y-6 pb-20">
            {/* Control Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-6 relative overflow-hidden">
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl bg-slate-950 border transition-all ${isRunning ? 'border-primary shadow-neon scale-105' : 'border-slate-800'}`}>
                        <InfinityIcon size={28} className={isRunning ? "text-primary animate-pulse" : "text-slate-700"} />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase leading-tight">Auto-Pilot Tự Trị</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                {isRunning ? `Đang săn ngách: ${selectedNiche}` : 'Hệ thống đang chờ'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="hidden sm:grid grid-cols-2 gap-2 px-6 py-3 bg-black/40 rounded-2xl border border-white/5">
                        <div className="text-center border-r border-white/5 pr-4">
                            <div className="text-[8px] text-slate-500 font-black uppercase mb-0.5">Cycles</div>
                            <div className="font-mono text-base text-primary font-black">{stats.cyclesRun}</div>
                        </div>
                        <div className="text-center pl-2">
                            <div className="text-[8px] text-slate-500 font-black uppercase mb-0.5">Assets</div>
                            <div className="font-mono text-base text-white font-black">{stats.videosCreated}</div>
                        </div>
                    </div>

                    <button 
                      onClick={() => setIsRunning(!isRunning)} 
                      className={`px-8 h-14 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all shadow-xl ${
                        isRunning ? 'bg-red-500/10 border border-red-500/40 text-red-500' : 'bg-primary border border-primary/40 text-white shadow-neon'
                      }`}
                    >
                        {isRunning ? <Pause size={18} /> : <Play size={18} />}
                        {isRunning ? 'Dừng hệ thống' : 'Kích hoạt Radar'}
                    </button>
                </div>
            </div>

            {/* AI Engine Config Collapsible for AutoPilot */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-[32px] overflow-hidden">
                <button 
                  onClick={() => setIsConfigExpanded(!isConfigExpanded)}
                  className="w-full p-6 flex justify-between items-center px-10 hover:bg-slate-800/40 transition-all"
                >
                   <div className="flex items-center gap-4">
                      <Settings2 className="text-primary" size={20} />
                      <span className="text-xs font-black text-white uppercase tracking-widest">Cấu hình Engine Sản xuất AI</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] text-slate-500 font-black uppercase hidden md:block">
                        {scriptModel} • {visualModel} • {aspectRatio}
                      </span>
                      {isConfigExpanded ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                   </div>
                </button>
                {isConfigExpanded && (
                    <div className="p-4 bg-black/20 border-t border-slate-800 animate-fade-in">
                        <ModelSelector 
                            scriptModel={scriptModel} setScriptModel={setScriptModel}
                            visualModel={visualModel} setVisualModel={setVisualModel}
                            voiceModel={voiceModel} setVoiceModel={setVoiceModel}
                            resolution={resolution} setResolution={setResolution}
                            aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
                            t={t}
                        />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Pipeline */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-slate-950 border border-slate-800 rounded-[32px] p-8 shadow-2xl">
                        <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                           <Activity size={16} className="text-primary" /> Core Pipeline
                        </h3>
                        <div className="space-y-8">
                            {MISSION_STAGES.map((stage) => {
                                const isActive = currentAction === stage.id;
                                return (
                                    <div key={stage.id} className={`flex items-start gap-4 transition-all ${isActive ? 'opacity-100 translate-x-1' : 'opacity-20'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${isActive ? 'bg-primary border-primary shadow-neon animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-700'}`}>
                                            {isActive ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase text-white tracking-tight">{stage.label}</div>
                                            <div className="text-[8px] text-slate-500 font-bold mt-0.5 uppercase tracking-widest">{stage.desc}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Ngách mục tiêu</label>
                        <select 
                            value={selectedNiche} 
                            onChange={(e) => setSelectedNiche(e.target.value)} 
                            disabled={isRunning}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-bold outline-none focus:border-primary appearance-none cursor-pointer shadow-inner"
                        >
                            {NICHES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Intelligence Feed */}
                <div className="lg:col-span-6">
                    <div className="bg-slate-950 border border-slate-800 rounded-[40px] p-8 shadow-2xl min-h-[500px] flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <SearchCode size={20} className="text-primary" /> Autonomous Feed
                            </h3>
                            {isRunning && (
                                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                    <Globe size={10} className="text-primary animate-spin-slow" />
                                    <span className="text-[8px] font-black text-primary uppercase">Live Scanning</span>
                                </div>
                            )}
                        </div>

                        {currentMission ? (
                            <div className="animate-fade-in space-y-6 flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900/50 p-6 rounded-3xl border border-primary/20 flex flex-col items-center">
                                        <div className="text-3xl font-black text-primary">{currentMission.trending_score}%</div>
                                        <div className="text-[8px] text-slate-500 font-black uppercase mt-1">Viral Potential</div>
                                    </div>
                                    <div className="bg-slate-900/50 p-6 rounded-3xl border border-green-500/20 flex flex-col items-center">
                                        <div className="text-2xl font-black text-green-500 flex items-center gap-1"><Coins size={18}/> {currentMission.commission_rate}</div>
                                        <div className="text-[8px] text-slate-500 font-black uppercase mt-1">Commission</div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] space-y-4">
                                    <div className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em]">Target Identified</div>
                                    <h4 className="text-2xl font-black text-white uppercase tracking-tight truncate">{currentMission.product_name}</h4>
                                    <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 italic text-xs text-slate-300 leading-relaxed font-medium">
                                        "{currentMission.reason_to_promote}"
                                    </div>
                                    <div className="flex justify-between items-center pt-4">
                                        <div className="flex gap-2">
                                            <span className="text-[9px] bg-slate-800 px-3 py-1 rounded-lg text-slate-400 font-black uppercase">#AutoYield</span>
                                        </div>
                                        <a href={currentMission.affiliate_link} target="_blank" className="text-[10px] font-black text-primary flex items-center gap-2 hover:text-white transition-all uppercase">
                                            Link Affiliate <MoveUpRight size={14} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 space-y-6">
                                <Radar size={100} className="animate-spin-slow text-primary" />
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black text-white uppercase tracking-widest">Awaiting Uplink</h4>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">Hệ thống đang quét tín hiệu thị trường...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Console Logs */}
                <div className="lg:col-span-3">
                    <div className="bg-black border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[500px] shadow-2xl">
                        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 shrink-0">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Terminal size={14} className="text-primary" /> Mission Console
                            </span>
                        </div>
                        <div className="flex-1 p-6 font-mono text-[9px] overflow-y-auto space-y-3 custom-scrollbar text-slate-400">
                            {logs.map((log, i) => (
                                <div key={i} className={`flex flex-col gap-1 border-l-2 pl-3 py-0.5 ${
                                    log.status === 'error' ? 'border-red-500' : log.status === 'success' ? 'border-green-500' : 'border-primary/30'
                                }`}>
                                    <div className="flex justify-between text-[7px] opacity-40 font-bold">
                                        <span>TASK_{i.toString().padStart(3, '0')}</span>
                                        <span>{log.timestamp}</span>
                                    </div>
                                    <span className={log.status === 'error' ? 'text-red-400' : log.status === 'success' ? 'text-green-400' : 'text-slate-300'}>
                                        {log.action.toUpperCase()}: {log.detail}
                                    </span>
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
