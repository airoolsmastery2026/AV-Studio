
import React, { useRef, useEffect, useState } from 'react';
import { 
    Infinity as InfinityIcon, Play, Pause, Zap, Crosshair, 
    Loader2, Activity, Cpu, Sparkles, Target, ShieldCheck,
    ChevronDown, Layers, Search, FileText, Video, Mic, Share2, TrendingUp, DollarSign
} from 'lucide-react';
import { 
    ApiKeyConfig, PostingJob, CompletedVideo, ScriptModel, VisualModel, VoiceModel, 
    VideoResolution, AspectRatio, AutoPilotStats, AutoPilotLog, PipelineStage 
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
}

const AutoPilotDashboard: React.FC<AutoPilotDashboardProps> = ({ 
    isRunning, setIsRunning, stats, logs, currentAction, selectedNiche, setSelectedNiche,
    scriptModel, visualModel, voiceModel
}) => {
    const logsEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

    const formatUptime = (sec: number) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        return `${h}h ${m}m`;
    };

    // Simulated Hunter Discovery for AI Tools
    const [hunterDiscovery] = useState([
        { name: 'Leonardo.ai Premium', commission: '30% Recurring', hook: 'The Midjourney Killer you didn\'t know...', potential: 98 },
        { name: 'Veed.io Pro', commission: '$40 per sale', hook: 'How I edit videos in 5 minutes with AI...', potential: 92 },
        { name: 'Copy.ai Enterprise', commission: '40% Lifetime', hook: 'Stop writing captions, let AI do it...', potential: 95 }
    ]);

    return (
        <div className="animate-fade-in space-y-6">
            
            {/* COMMAND BAR */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-8 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-accent opacity-50`}></div>
                
                <div className="flex items-center gap-6">
                    <div className={`p-5 rounded-2xl bg-slate-950 border ${isRunning ? 'border-primary shadow-neon' : 'border-slate-800'}`}>
                        <InfinityIcon size={40} className={isRunning ? "text-primary animate-pulse" : "text-slate-700"} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter">AGENTIC AUTO-PILOT <span className="text-[10px] bg-red-600 px-2 py-1 rounded ml-2">ULTIMATE</span></h2>
                        <div className="flex items-center gap-3 mt-1">
                            <ShieldCheck size={14} className="text-green-500" /> 
                            <span className="text-slate-500 text-xs font-mono uppercase tracking-widest">Autonomous Loop: Search &rarr; Script &rarr; Voice &rarr; Video</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-10 px-10 py-4 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                    <div className="text-center">
                        <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Status</div>
                        <div className="font-mono text-xl text-primary font-black">{isRunning ? 'ACTIVE' : 'IDLE'}</div>
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

                <NeonButton onClick={() => setIsRunning(!isRunning)} variant={isRunning ? 'danger' : 'primary'} size="lg" className="min-w-[280px] h-16">
                    {isRunning ? <span className="flex items-center gap-3"><Pause fill="currentColor" /> DỪNG HỆ THỐNG</span> : <span className="flex items-center gap-3"><Play fill="currentColor" /> KÍCH HOẠT AGENT A-Z</span>}
                </NeonButton>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LOGS MONITOR */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* AUTO HUNTER PANEL */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Crosshair size={18} className="text-red-500" /> HOT AI TOOLS DISCOVERY (AUTO-HUNTER)
                            </h3>
                            <span className="text-[10px] font-mono text-slate-500 animate-pulse">Scanning Global Marketplace...</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {hunterDiscovery.map((tool, idx) => (
                                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 hover:border-primary/50 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                                        <TrendingUp size={40} className="text-primary" />
                                    </div>
                                    <h4 className="font-bold text-white text-sm mb-1">{tool.name}</h4>
                                    <div className="flex items-center gap-1.5 text-green-400 text-[10px] font-black mb-3">
                                        <DollarSign size={10} /> {tool.commission}
                                    </div>
                                    <p className="text-[10px] text-slate-500 italic mb-4 leading-relaxed line-clamp-2">"Hook: {tool.hook}"</p>
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(s => <div key={s} className={`w-1 h-3 rounded-full ${s <= 4 ? 'bg-primary' : 'bg-slate-800'}`}></div>)}
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400">{tool.potential}% Match</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-black border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[400px] shadow-2xl">
                        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse shadow-neon' : 'bg-slate-700'}`}></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Autonomous Engine Stream</span>
                            </div>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                                <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                                <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
                            </div>
                        </div>
                        <div className="flex-1 p-6 font-mono text-[11px] overflow-y-auto space-y-2 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-95 custom-scrollbar">
                            {logs.length === 0 && <div className="text-slate-800 italic h-full flex items-center justify-center">Hệ thống đang chờ lệnh...</div>}
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-4 animate-fade-in group border-l border-slate-800 pl-3">
                                    <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                                    <span className={`font-black shrink-0 w-24 uppercase ${
                                        log.status === 'error' ? 'text-red-500' : 
                                        log.status === 'success' ? 'text-green-400' : 
                                        log.status === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                                    }`}>
                                        {log.action}
                                    </span>
                                    <span className="text-slate-300 italic flex-1">{log.detail}</span>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                </div>

                {/* CONTROL PANEL */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Target size={16} className="text-primary"/> Strategic Control</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Profit Niche</label>
                                <select 
                                    value={selectedNiche} 
                                    onChange={(e) => setSelectedNiche(e.target.value)} 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs text-white outline-none focus:border-primary transition-all font-bold"
                                >
                                    <option value="AUTO">🤖 TỰ ĐỘNG (Phân tích Trend Tổng hợp)</option>
                                    <option value="AI_SAAS">🛠️ AI SaaS Tools</option>
                                    <option value="ML_PLATFORMS">🧠 Machine Learning Platforms</option>
                                    <option value="AI_HACKS">⚡ AI Productivity Hacks</option>
                                    <option value="PASSIVE_INCOME">💰 Phương pháp Kiếm tiền Thụ động</option>
                                    <option value="SMART_HOME">🏠 Thiết bị Nhà thông minh</option>
                                    <option value="MULTI_NICHE">🚀 ĐA NGÁCH (Hybrid Profit)</option>
                                </select>
                            </div>
                            
                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-500 uppercase tracking-tighter">Script Engine</span>
                                    <span className="text-white bg-slate-900 px-2 py-1 rounded">{scriptModel}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-500 uppercase tracking-tighter">Visual Engine</span>
                                    <span className="text-primary bg-primary/10 px-2 py-1 rounded">{visualModel}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-500 uppercase tracking-tighter">Voice Talent</span>
                                    <span className="text-green-400 bg-green-900/10 px-2 py-1 rounded">{voiceModel}</span>
                                </div>
                            </div>

                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Sparkles size={16} className="text-primary mt-1 shrink-0" />
                                    <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                        "Agent đang sử dụng Google Search Grounding để đảm bảo kịch bản luôn có dữ liệu mới nhất từ thị trường."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutoPilotDashboard;
