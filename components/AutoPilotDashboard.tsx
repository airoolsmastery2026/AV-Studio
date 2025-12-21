
import React, { useRef, useEffect } from 'react';
import { 
    Infinity as InfinityIcon, Play, Pause, Zap, Crosshair, 
    BarChart3, Loader2, Activity, Cpu, Sparkles, 
    ArrowRight, Rocket, TrendingUp, DollarSign, Bot, Target, ShieldCheck,
    ChevronDown, Layers
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
    { value: 'MULTI_NICHE', label: '🚀 ĐA NGÁCH (Hybrid Profit Max)', color: 'text-primary' },
    { value: 'AUTO', label: '📊 TỰ ĐỘNG (Bắt Trend Toàn Cầu)', color: 'text-white' },
    { value: 'AI SaaS Tools', label: '🤖 AI SaaS Tools (Hoa hồng MRR)', color: 'text-blue-400' },
    { value: 'Machine Learning Platforms', label: '🧠 ML Platforms (B2B High Ticket)', color: 'text-purple-400' },
    { value: 'AI Productivity Hacks', label: '⚡ AI Productivity Hacks (Dễ Viral)', color: 'text-cyan-400' },
    { value: 'Passive Income Methods', label: '💰 Cách Kiếm Tiền Thụ Động', color: 'text-green-400' },
    { value: 'Smart Home Gadgets', label: '🏠 Đồ Gia Dụng Thông Minh', color: 'text-orange-400' }
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

    const isMultiNiche = selectedNiche === 'MULTI_NICHE';

    return (
        <div className="animate-fade-in space-y-4 pb-12">
            
            {/* 1. HEADER TÁC CHIẾN */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col xl:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isMultiNiche ? 'from-primary via-purple-500 to-accent' : 'from-primary via-slate-500 to-primary'} opacity-50`}></div>
                
                <div className="flex items-center gap-5">
                    <div className={`p-5 rounded-2xl bg-slate-950 border ${isRunning ? 'border-primary shadow-[0_0_20px_rgba(14,165,164,0.5)]' : 'border-slate-800'} transition-all duration-500`}>
                        {isMultiNiche ? (
                             <Layers size={40} className={isRunning ? "text-primary animate-pulse" : "text-slate-600"} />
                        ) : (
                             <InfinityIcon size={40} className={isRunning ? "text-primary animate-pulse" : "text-slate-600"} />
                        )}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                            INFINITY AUTO-PILOT <span className="text-[10px] bg-red-600 text-white px-2 py-1 rounded font-black animate-pulse uppercase">24/7 ACTIVE</span>
                        </h2>
                        <div className="flex items-center gap-4 mt-1">
                            <p className="text-slate-400 text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck size={14} className="text-green-500" /> 
                                {isMultiNiche ? "Đang chạy chế độ Đa Ngách chuyên sâu" : "Hệ thống đang tự vận hành"}
                            </p>
                            <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Ver 3.2 Hybrid</span>
                        </div>
                    </div>
                </div>

                {/* THỐNG KÊ NHANH */}
                <div className="flex flex-wrap items-center justify-center gap-10 px-10 py-4 bg-black/40 rounded-3xl border border-white/5 shadow-inner">
                    <div className="text-center group">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Uptime</div>
                        <div className="font-mono text-xl text-white font-black">{formatUptime(stats.uptime)}</div>
                    </div>
                    <div className="w-px h-10 bg-slate-800 hidden sm:block"></div>
                    <div className="text-center group">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Chu kỳ</div>
                        <div className="font-mono text-xl text-primary font-black">{stats.cyclesRun}</div>
                    </div>
                    <div className="w-px h-10 bg-slate-800 hidden sm:block"></div>
                    <div className="text-center group">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Tài sản (Video)</div>
                        <div className="font-mono text-xl text-blue-400 font-black">{stats.videosCreated}</div>
                    </div>
                </div>

                <NeonButton 
                    onClick={() => setIsRunning(!isRunning)} 
                    variant={isRunning ? 'danger' : 'primary'}
                    size="lg"
                    className="min-w-[260px] h-16 text-lg shadow-neon"
                >
                    {isRunning ? (
                        <span className="flex items-center gap-3"><Pause fill="currentColor" size={24} /> DỪNG HỆ THỐNG</span>
                    ) : (
                        <span className="flex items-center gap-3"><Play fill="currentColor" size={24} /> KÍCH HOẠT AUTO-HUNTER</span>
                    )}
                </NeonButton>
            </div>

            {/* 2. BẢNG ĐIỀU KHIỂN CHIẾN THUẬT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                            {isMultiNiche ? <Layers size={200} /> : <Bot size={200} />}
                        </div>
                        
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                <Target size={18} className="text-primary"/> Thiết lập Săn Tìm
                            </h3>
                        </div>
                        
                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-3 block tracking-widest">Ngách lợi nhuận mục tiêu</label>
                                <div className="relative">
                                    <select 
                                        value={selectedNiche}
                                        onChange={(e) => setSelectedNiche(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-5 pl-5 pr-12 text-sm text-white appearance-none focus:outline-none focus:border-primary transition-all font-bold cursor-pointer shadow-inner"
                                    >
                                        {NICHE_PRESETS.map(niche => (
                                            <option key={niche.value} value={niche.value} className="bg-slate-900 text-white py-2">
                                                {niche.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                        <ChevronDown size={20} />
                                    </div>
                                </div>
                                {isMultiNiche && (
                                    <p className="text-[10px] text-primary mt-2 font-bold animate-pulse">
                                        Chế độ ĐA NGÁCH: AI sẽ tìm giao điểm của Công nghệ, Tài chính và Đời sống.
                                    </p>
                                )}
                            </div>

                            <div className="pt-8 border-t border-slate-800/50">
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-4 block tracking-widest">Cấu hình Rendering</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5 group hover:border-primary/40 transition-all">
                                        <div className="flex items-center gap-4">
                                            <Bot size={18} className="text-purple-400" />
                                            <span className="text-xs text-slate-400 font-bold">Kịch bản:</span>
                                        </div>
                                        <span className="text-xs font-black text-white">{scriptModel}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5 group hover:border-primary/40 transition-all">
                                        <div className="flex items-center gap-4">
                                            <Sparkles size={18} className="text-blue-400" />
                                            <span className="text-xs text-slate-400 font-bold">Visual:</span>
                                        </div>
                                        <span className="text-xs font-black text-white">{visualModel}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-2 bg-primary/20 rounded-lg"><DollarSign size={20} className="text-primary"/></div>
                                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
                                        {isMultiNiche 
                                          ? "Đang quét tín hiệu Đa Ngách (Cross-Niche). Bot sẽ ưu tiên các sản phẩm có hoa hồng > 30% và tính ứng dụng cao."
                                          : "Hệ thống đang quét tín hiệu thị trường. Khi tắt máy, dữ liệu sẽ được lưu trữ và tiếp tục xử lý khi bạn quay lại."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 flex flex-col h-full">
                    <div className="flex-1 bg-black border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl min-h-[550px]">
                        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-700'}`}></div>
                                <span className="text-[11px] font-black font-mono text-slate-400 uppercase tracking-[0.3em]">
                                    Live Autonomous Stream
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-4 px-5 py-2 bg-slate-950 border border-white/10 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Process:</span>
                                <span className="text-xs font-black text-primary font-mono tracking-tighter">
                                    {currentAction} {isRunning && currentAction !== 'IDLE' && <Loader2 size={12} className="inline animate-spin ml-2" />}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex-1 p-8 font-mono text-xs overflow-y-auto space-y-4 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-fixed opacity-95 custom-scrollbar">
                            {logs.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-6">
                                    <Activity size={64} className="opacity-10" />
                                    <p className="italic text-base opacity-40">System standby. Awaiting mission start...</p>
                                </div>
                            )}
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-5 animate-fade-in group py-1 border-l-2 border-transparent hover:border-primary/30 pl-2 transition-all">
                                    <span className="text-slate-600 shrink-0 select-none opacity-50 font-bold">[{log.timestamp}]</span>
                                    <span className={`font-black shrink-0 w-28 tracking-tighter uppercase ${
                                        log.status === 'error' ? 'text-red-500' : 
                                        log.status === 'success' ? 'text-emerald-400' : 
                                        log.status === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                                    }`}>
                                        {log.action}
                                    </span>
                                    <span className="text-slate-300 break-all leading-relaxed font-medium">{log.detail}</span>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>

                        <div className="h-2 w-full bg-slate-800">
                            {isRunning && <div className="h-full bg-primary animate-[scan_3s_linear_infinite]" style={{width: '40%'}}></div>}
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                @keyframes scan {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
            `}</style>
        </div>
    );
};

export default AutoPilotDashboard;
