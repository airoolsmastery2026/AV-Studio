
import React, { useState, useEffect, useRef } from 'react';
import { 
  HeartPulse, Activity, AlertTriangle, CheckCircle, 
  ShieldCheck, AlertOctagon, RefreshCw, Video, Eye, MousePointer2, 
  ChevronRight, Send, Terminal, Lock, Unlock, Search, BarChart2, Zap, Stethoscope, Crosshair, Radar, Clock, ShieldAlert, MessageSquare, ExternalLink, Siren, Target, Crown, Sparkles, Wand2, History
} from 'lucide-react';
import { ApiKeyConfig, ChannelHealthReport, GovernorAction } from '../types';
import NeonButton from './NeonButton';
import { generateChannelAudit, runGovernorExecution } from '../services/geminiService';

interface ChannelHealthDashboardProps {
  apiKeys: ApiKeyConfig[];
  onSendReportToChat: (report: string) => void;
  t?: any;
}

const ChannelHealthDashboard: React.FC<ChannelHealthDashboardProps> = ({ apiKeys, onSendReportToChat, t }) => {
  const texts = t || {};
  
  // States
  const [isSentinelActive, setIsSentinelActive] = useState(false);
  const [isGovernorActive, setIsGovernorActive] = useState(false); // Chế độ Tự trị tối cao
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [report, setReport] = useState<ChannelHealthReport[]>([]);
  const [governorLog, setGovernorLog] = useState<GovernorAction[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  
  const logsEndRef = useRef<HTMLDivElement>(null);
  const sentinelIntervalRef = useRef<number | null>(null);

  const socialKeys = apiKeys.filter(k => k.category === 'social' && k.status === 'active');

  useEffect(() => {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [scanLogs]);

  // Sentinel & Governor Loop
  useEffect(() => {
    if (isSentinelActive) {
      handleRunFullScan(true);
      sentinelIntervalRef.current = window.setInterval(() => handleRunFullScan(true), 300000); // 5 mins
    } else if (sentinelIntervalRef.current) {
      clearInterval(sentinelIntervalRef.current);
    }
    return () => { if (sentinelIntervalRef.current) clearInterval(sentinelIntervalRef.current); };
  }, [isSentinelActive]);

  const addScanLog = (msg: string, color: string = 'text-slate-400') => {
      const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
      setScanLogs(prev => [...prev.slice(-30), `[${time}] ${msg}`]);
  };

  const handleRunFullScan = async (isAuto = false) => {
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
    if (!googleKey) return;

    setIsScanning(true);
    setScanProgress(0);
    addScanLog(`SENTINEL ${isAuto ? 'AUTO' : 'MANUAL'} AUDIT INITIATED...`, 'text-primary');

    const channelsToScan = socialKeys.length > 0 ? socialKeys : [{ id: 'demo', alias: 'Demo Channel', provider: 'tiktok' }];
    const results: ChannelHealthReport[] = [];
    const progressStep = 100 / channelsToScan.length;

    try {
        for (let i = 0; i < channelsToScan.length; i++) {
            const channel = channelsToScan[i];
            addScanLog(`ANALYZING: ${channel.alias.toUpperCase()}...`);
            const audit = await generateChannelAudit(googleKey.key, channel.alias, channel.provider);
            results.push(audit);
            
            // GOVERNOR AUTONOMOUS LOGIC
            if (isGovernorActive && (audit.status === 'CRITICAL' || audit.status === 'AT_RISK')) {
                addScanLog(`GOVERNOR INTERVENTION REQUIRED: EXECUTION STARTING...`, 'text-amber-500');
                const exec = await runGovernorExecution(channel.alias, audit.ai_diagnosis);
                setGovernorLog(prev => [exec, ...prev].slice(0, 20));
                addScanLog(`GOVERNOR APPLIED: ${exec.action_type} - Impact: ${exec.impact_score}%`, 'text-green-400');
            }

            addScanLog(`AUDIT COMPLETE: ${audit.status} (Score: ${audit.health_score})`, audit.status === 'CRITICAL' ? 'text-red-500' : 'text-green-500');
            setScanProgress((prev) => Math.min(prev + progressStep, 100));
        }
        setReport(results);
        if (!selectedChannelId && results.length > 0) setSelectedChannelId(results[0].channel_name);
    } catch (e) {
        addScanLog("CRITICAL_FAULT: AI Engine Interrupted.", 'text-red-600');
    } finally {
        setIsScanning(false);
        setScanProgress(100);
    }
  };

  const selectedReport = report.find(r => r.channel_name === selectedChannelId) || report[0];

  return (
    <div className="animate-fade-in space-y-6 pb-20 flex flex-col h-full overflow-hidden">
      
      {/* OVERLORD STATUS BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-8 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1 ${isGovernorActive ? 'bg-amber-500 animate-pulse' : isSentinelActive ? 'bg-primary' : 'bg-slate-800'}`}></div>
          <div className="absolute right-0 top-0 p-8 opacity-5"><Crown size={120} /></div>
          
          <div className="flex items-center gap-6 relative z-10">
              <div className={`p-5 rounded-2xl bg-slate-950 border transition-all duration-500 ${isGovernorActive ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-110' : isSentinelActive ? 'border-primary shadow-neon' : 'border-slate-800'}`}>
                  {isGovernorActive ? <Crown size={40} className="text-amber-500 animate-bounce" /> : <Radar size={40} className={isSentinelActive ? "text-primary animate-spin-slow" : "text-slate-700"} />}
              </div>
              <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                      {isGovernorActive ? 'AURA OVERLORD ACTIVE' : 'AI SENTINEL GUARD'}
                      {isGovernorActive && <Sparkles size={20} className="text-amber-400" />}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                      <span className={`w-2 h-2 rounded-full ${isGovernorActive ? 'bg-amber-500 animate-pulse' : isSentinelActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-slate-500 text-[10px] font-mono uppercase tracking-widest italic">
                          {isGovernorActive ? 'Full Autonomous Governance: Sửa lỗi & Tối ưu tự động không cần lệnh' : isSentinelActive ? 'Continuous Monitoring Active' : 'System Guard Offline'}
                      </span>
                  </div>
              </div>
          </div>

          <div className="flex gap-4 relative z-10">
              <button 
                onClick={() => setIsGovernorActive(!isGovernorActive)} 
                className={`flex flex-col items-center justify-center px-6 py-3 rounded-2xl border-2 transition-all ${isGovernorActive ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-amber-500/50'}`}
              >
                  <Crown size={20} />
                  <span className="text-[9px] font-black uppercase mt-1">Overlord Mode</span>
              </button>
              <NeonButton onClick={() => setIsSentinelActive(!isSentinelActive)} variant={isSentinelActive ? 'danger' : 'primary'} size="lg" className="min-w-[200px] h-14">
                  {isSentinelActive ? <Lock size={18} /> : <Zap size={18} />}
                  {isSentinelActive ? 'HALT GUARD' : 'ACTIVATE RADAR'}
              </NeonButton>
          </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
          
          {/* LEFT: MISSION & GOVERNOR LOGS */}
          <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
              <div className="bg-black border border-slate-800 rounded-[32px] overflow-hidden flex flex-col h-1/2 shadow-2xl relative">
                  <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center z-10">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Activity size={14} className="text-red-500" /> Sentinel Pulse
                      </span>
                  </div>
                  <div className="flex-1 p-6 font-mono text-[10px] overflow-y-auto space-y-2 custom-scrollbar">
                      {scanLogs.map((log, i) => <div key={i} className="animate-fade-in text-slate-400">{log}</div>)}
                      <div ref={logsEndRef} />
                  </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden flex flex-col h-1/2 shadow-2xl relative">
                  <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center z-10">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                          <History size={14} /> Governor Activity (Lịch sử tự trị)
                      </span>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
                      {governorLog.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale text-center">
                              <Crown size={40} className="mb-2" />
                              <span className="uppercase font-black text-[9px]">Awaiting Intervention</span>
                          </div>
                      ) : (
                          governorLog.map((act) => (
                              <div key={act.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl relative group hover:border-amber-500/30 transition-all">
                                  <div className="flex justify-between items-start mb-2">
                                      <span className="text-[9px] font-black bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 uppercase">{act.action_type}</span>
                                      <span className="text-[8px] font-mono text-slate-600">{new Date(act.timestamp).toLocaleTimeString()}</span>
                                  </div>
                                  <p className="text-[10px] text-white font-bold mb-1">{act.description}</p>
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                      <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[9px]">
                                          <div className="text-slate-600 uppercase font-black mb-1">Before:</div>
                                          <div className="text-slate-400 italic line-clamp-2">{act.before}</div>
                                      </div>
                                      <div className="p-2 bg-amber-900/10 rounded border border-amber-500/10 text-[9px]">
                                          <div className="text-amber-600 uppercase font-black mb-1">After:</div>
                                          <div className="text-white font-medium line-clamp-2">{act.after}</div>
                                      </div>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>

          {/* CENTER: DIAGNOSTIC BAY */}
          <div className="lg:col-span-5 overflow-y-auto pr-2 custom-scrollbar space-y-6">
              {report.length === 0 && !isScanning ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                      <Stethoscope size={100} className="mb-6" />
                      <h4 className="text-2xl font-black uppercase tracking-tighter">Diagnostic Bay Empty</h4>
                  </div>
              ) : selectedReport ? (
                  <div className="animate-fade-in space-y-6 pb-12">
                      {/* Diagnostic Header */}
                      <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden flex justify-between items-center">
                          <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl opacity-10 rounded-full ${selectedReport.status === 'HEALTHY' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <div className="relative z-10">
                              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{selectedReport.platform} Diagnostic</div>
                              <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{selectedReport.channel_name}</h2>
                              <div className="mt-3 flex items-center gap-3">
                                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase ${selectedReport.status === 'HEALTHY' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{selectedReport.status}</span>
                                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">Recovery: {selectedReport.recovery_estimate}</span>
                              </div>
                          </div>
                          <div className="text-right relative z-10">
                              <div className={`text-7xl font-black tracking-tighter ${selectedReport.health_score > 80 ? 'text-green-500' : 'text-red-500'}`}>{selectedReport.health_score}</div>
                              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Health Index</div>
                          </div>
                      </div>

                      {/* Pathology Cards */}
                      <div className="space-y-4">
                          {selectedReport.risks.map((risk, idx) => (
                              <div key={idx} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-start gap-5 group hover:border-red-500/30 transition-all">
                                  <div className={`p-4 rounded-2xl ${risk.severity === 'HIGH' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}><AlertTriangle size={24} /></div>
                                  <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-1">
                                          <h4 className="text-sm font-black text-white uppercase tracking-tight">{risk.type}</h4>
                                          <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-500 font-mono italic">ICD-AI: {risk.medical_term}</span>
                                      </div>
                                      <p className="text-xs text-slate-400 leading-relaxed font-medium italic">"{risk.description}"</p>
                                      {isGovernorActive && risk.severity === 'HIGH' && (
                                          <div className="mt-3 flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase animate-pulse">
                                              <Crown size={12}/> Overlord Auto-Fixing this risk...
                                          </div>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>

                      {/* Treatment Center */}
                      <div className="bg-primary/5 border border-primary/20 rounded-[40px] p-8">
                          <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-3 mb-6"><Zap size={18} /> Treatment & Optimization Plan</h3>
                          <div className="space-y-4">
                              {selectedReport.action_plan.map((action, i) => (
                                  <div key={i} className="flex gap-4">
                                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 font-black text-xs ${action.priority === 'urgent' ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-primary text-primary'}`}>{i + 1}</div>
                                      <div>
                                          <h5 className="text-xs font-black text-white uppercase mb-1">{action.task}</h5>
                                          <p className="text-[11px] text-slate-400 italic leading-relaxed">{action.instruction}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              ) : null}
          </div>

          {/* RIGHT: OVERLORD COMMANDS */}
          <div className="lg:col-span-3 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 shadow-xl">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Crown size={16} className="text-amber-500"/> Executive Suite</h3>
                  <div className="space-y-4">
                      <button 
                        onClick={() => handleRunFullScan()}
                        className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl hover:border-primary transition-all group flex flex-col gap-3"
                      >
                          <div className="p-3 bg-primary/10 rounded-xl text-primary w-fit group-hover:scale-110 transition-transform"><Wand2 size={24} /></div>
                          <div className="text-left">
                             <div className="text-xs font-black text-white uppercase">Manual Optimization</div>
                             <div className="text-[9px] text-slate-500 uppercase font-black mt-1">Cưỡng chế tối ưu ngay bây giờ</div>
                          </div>
                      </button>

                      <button 
                        onClick={() => onSendReportToChat?.(`Yêu cầu Overlord viết lại bộ Metadata cho kênh: ${selectedReport?.channel_name}`)}
                        className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl hover:border-amber-500 transition-all group flex flex-col gap-3"
                      >
                          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 w-fit"><Crown size={24} /></div>
                          <div className="text-left">
                             <div className="text-xs font-black text-white uppercase">Neural Overhaul</div>
                             <div className="text-[9px] text-slate-500 uppercase font-black mt-1">Viết lại toàn bộ giới thiệu & tên video</div>
                          </div>
                      </button>
                  </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-[40px] p-8">
                  <div className="flex items-center gap-3 mb-4">
                      <ShieldCheck size={20} className="text-green-500" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Authority Status</span>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase">
                          <span className="text-slate-500">Bot Logic:</span>
                          <span className="text-green-500">Autonomous</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-black uppercase">
                          <span className="text-slate-500">API Priority:</span>
                          <span className="text-primary">Executive</span>
                      </div>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};

export default ChannelHealthDashboard;
