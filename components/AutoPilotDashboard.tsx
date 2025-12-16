
import React, { useRef, useEffect } from 'react';
import { Infinity as InfinityIcon, Play, Pause, Zap, Crosshair, BarChart3, Loader2, Activity } from 'lucide-react';
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
        <div className="animate-fade-in space-y-6 pb-12">
            
            {/* Header Status Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <InfinityIcon size={32} className={isRunning ? "text-primary drop-shadow-[0_0_8px_rgba(14,165,164,0.8)]" : "text-slate-600"} />
                        {texts.auto || "Infinity Auto-Pilot"}
                    </h2>
                    <p className="text-slate-400 text-sm">Autonomous Agent Loop: Hunt -> Plan -> Create -> Repeat</p>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="text-right hidden md:block">
                        <div className="text-xs text-slate-500 font-bold uppercase">Uptime (Session)</div>
                        <div className="font-mono text-xl text-white">{formatUptime(stats.uptime)}</div>
                    </div>
                    
                    <NeonButton 
                        onClick={() => setIsRunning(!isRunning)} 
                        variant={isRunning ? 'danger' : 'primary'}
                        size="lg"
                    >
                        {isRunning ? (
                            <span className="flex items-center gap-2"><Pause fill="currentColor" /> PAUSE ENGINE</span>
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
                    
                    {/* Compact Status Display */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${isRunning ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-500'}`}>
                                <Activity size={18} className={isRunning ? "animate-pulse" : ""} />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Action</div>
                                <div className="text-lg font-bold text-white flex items-center gap-2">
                                    {currentAction}
                                    {isRunning && currentAction !== 'IDLE' && currentAction !== 'COOLDOWN' && (
                                        <Loader2 size={14} className="animate-spin text-primary" />
                                    )}
                                </div>
                            </div>
                        </div>
                        {isRunning && (
                            <div className="flex gap-1.5">
                                <span className="w-1.5 h-6 bg-primary/20 rounded-full animate-[pulse_1s_ease-in-out_infinite]"></span>
                                <span className="w-1.5 h-6 bg-primary/40 rounded-full animate-[pulse_1s_ease-in-out_0.2s_infinite]"></span>
                                <span className="w-1.5 h-6 bg-primary/60 rounded-full animate-[pulse_1s_ease-in-out_0.4s_infinite]"></span>
                                <span className="w-1.5 h-6 bg-primary rounded-full animate-[pulse_1s_ease-in-out_0.6s_infinite]"></span>
                            </div>
                        )}
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
