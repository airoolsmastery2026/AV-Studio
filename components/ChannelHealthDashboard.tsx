
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
  t: any;
}

const ChannelHealthDashboard: React.FC<ChannelHealthDashboardProps> = ({ apiKeys, onSendReportToChat, t }) => {
  const [isSentinelActive, setIsSentinelActive] = useState(false);
  const [isGovernorActive, setIsGovernorActive] = useState(false);
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

  useEffect(() => {
    if (isSentinelActive) {
      handleRunFullScan(true);
      sentinelIntervalRef.current = window.setInterval(() => handleRunFullScan(true), 300000); 
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
    addScanLog(`${isAuto ? 'AUTO' : 'MANUAL'} AUDIT INITIATED...`, 'text-primary');

    const channelsToScan = socialKeys.length > 0 ? socialKeys : [{ id: 'demo', alias: 'Demo Channel', provider: 'tiktok' }];
    const results: ChannelHealthReport[] = [];
    const progressStep = 100 / channelsToScan.length;

    try {
        for (let i = 0; i < channelsToScan.length; i++) {
            const channel = channelsToScan[i];
            addScanLog(`ANALYZING: ${channel.alias.toUpperCase()}...`);
            const audit = await generateChannelAudit(googleKey.key, channel.alias, channel.provider);
            results.push(audit);
            
            if (isGovernorActive && (audit.status === 'CRITICAL' || audit.status === 'AT_RISK')) {
                addScanLog(`GOVERNOR INTERVENTION REQUIRED...`, 'text-amber-500');
                const exec = await runGovernorExecution(channel.alias, audit.ai_diagnosis);
                setGovernorLog(prev => [exec, ...prev].slice(0, 20));
            }

            addScanLog(`AUDIT COMPLETE: ${audit.status} (Score: ${audit.health_score})`);
            setScanProgress((prev) => Math.min(prev + progressStep, 100));
        }
        setReport(results);
        if (!selectedChannelId && results.length > 0) setSelectedChannelId(results[0].channel_name);
    } catch (e) {
        addScanLog("CRITICAL_FAULT: AI Engine Interrupted.");
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
                      {isGovernorActive ? t.risk_overlord : t.risk_title}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                      <span className={`w-2 h-2 rounded-full ${isGovernorActive ? 'bg-amber-500 animate-pulse' : isSentinelActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-slate-500 text-[10px] font-mono uppercase tracking-widest italic">
                          {isGovernorActive ? t.risk_overlord_desc : isSentinelActive ? 'Continuous Monitoring Active' : t.risk_guard_offline}
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
                  <span className="text-[9px] font-black uppercase mt-1">{t.risk_mode_overlord}</span>
              </button>
              <NeonButton onClick={() => setIsSentinelActive(!isSentinelActive)} variant={isSentinelActive ? 'danger' : 'primary'} size="lg" className="min-w-[200px] h-14">
                  {isSentinelActive ? <Lock size={18} /> : <Zap size={18} />}
                  {isSentinelActive ? t.risk_halt_guard : t.risk_activate_radar}
              </NeonButton>
          </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
          
          {/* LEFT: MISSION & GOVERNOR LOGS */}
          <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
              <div className="bg-black border border-slate-800 rounded-[32px] overflow-hidden flex flex-col h-1/2 shadow-2xl relative">
                  <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center z-10">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Activity size={14} className="text-red-500" /> {t.risk_sentinel_pulse}
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
                          <History size={14} /> {t.risk_gov_activity}
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
                                  <p className="text-[10px] text-white font-bold mb-1">{act.description}</p>
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
                      <h4 className="text-2xl font-black uppercase tracking-tighter">{t.risk_diag_bay} EMPTY</h4>
                  </div>
              ) : selectedReport ? (
                  <div className="animate-fade-in space-y-6 pb-12">
                      {/* Diagnostic Header */}
                      <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden flex justify-between items-center">
                          <div className="relative z-10">
                              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{selectedReport.platform} Diagnostic</div>
                              <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{selectedReport.channel_name}</h2>
                              <div className="mt-3 flex items-center gap-3">
                                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase ${selectedReport.status === 'HEALTHY' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{selectedReport.status}</span>
                                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">{t.risk_recovery}: {selectedReport.recovery_estimate}</span>
                              </div>
                          </div>
                          <div className="text-right relative z-10">
                              <div className={`text-7xl font-black tracking-tighter ${selectedReport.health_score > 80 ? 'text-green-500' : 'text-red-500'}`}>{selectedReport.health_score}</div>
                              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t.risk_health_index}</div>
                          </div>
                      </div>

                      {/* Pathology Cards */}
                      <div className="space-y-4">
                          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3 px-4"><AlertTriangle size={16} className="text-red-500"/> {t.risk_pathology}</h3>
                          {selectedReport.risks.map((risk, idx) => (
                              <div key={idx} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-start gap-5 group hover:border-red-500/30 transition-all">
                                  <div className={`p-4 rounded-2xl ${risk.severity === 'HIGH' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}><AlertTriangle size={24} /></div>
                                  <div className="flex-1">
                                      <h4 className="text-sm font-black text-white uppercase tracking-tight">{risk.type}</h4>
                                      <p className="text-xs text-slate-400 leading-relaxed font-medium italic">"{risk.description}"</p>
                                  </div>
                              </div>
                          ))}
                      </div>

                      {/* Treatment Center */}
                      <div className="bg-primary/5 border border-primary/20 rounded-[40px] p-8">
                          <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-3 mb-6"><Zap size={18} /> {t.risk_treatment}</h3>
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
                             <div className="text-xs font-black text-white uppercase">{t.risk_manual_opt}</div>
                             <div className="text-[9px] text-slate-500 uppercase font-black mt-1">Manual Intelligence Polish</div>
                          </div>
                      </button>

                      <button 
                        className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl hover:border-amber-500 transition-all group flex flex-col gap-3"
                      >
                          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 w-fit"><Crown size={24} /></div>
                          <div className="text-left">
                             <div className="text-xs font-black text-white uppercase">{t.risk_neural_overhaul}</div>
                             <div className="text-[9px] text-slate-500 uppercase font-black mt-1">Deep Metadata Reconstruction</div>
                          </div>
                      </button>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};

export default ChannelHealthDashboard;
