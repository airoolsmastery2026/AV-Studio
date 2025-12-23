
import React, { useState, useEffect, useRef } from 'react';
import { 
  HeartPulse, Activity, AlertTriangle, CheckCircle, 
  ShieldCheck, AlertOctagon, RefreshCw, Video, Eye, MousePointer2, 
  ChevronRight, Send, Terminal, Lock, Unlock, Search, BarChart2, Zap, Stethoscope, Crosshair, Radar, Clock, ShieldAlert, MessageSquare, ExternalLink, Siren, Target, Crown, Sparkles, Wand2, History,
  // Fix: Added missing Loader2 import
  Loader2
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
  const [isSentinelActive, setIsSentinelActive] = useState(false);
  const [isGovernorActive, setIsGovernorActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [reports, setReports] = useState<ChannelHealthReport[]>([]);
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
      sentinelIntervalRef.current = window.setInterval(() => handleRunFullScan(true), 600000); // 10 mins
    }
    return () => { if (sentinelIntervalRef.current) clearInterval(sentinelIntervalRef.current); };
  }, [isSentinelActive]);

  const addScanLog = (msg: string) => {
      const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
      setScanLogs(prev => [...prev.slice(-40), `[${time}] ${msg}`]);
  };

  const handleRunFullScan = async (isAuto = false) => {
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
    if (!googleKey) {
        addScanLog("CRITICAL: Missing AI Intelligence Core for Audit.");
        return;
    }

    if (socialKeys.length === 0) {
        addScanLog("HALT: No social channels connected in Vault.");
        return;
    }

    setIsScanning(true);
    setScanProgress(0);
    addScanLog(`SENTINEL GUARD ${isAuto ? 'AUTO-PROBE' : 'MANUAL AUDIT'} INITIATED...`);

    const newReports: ChannelHealthReport[] = [];
    try {
        for (let i = 0; i < socialKeys.length; i++) {
            const channel = socialKeys[i];
            addScanLog(`PROBING NATIVE SIGNALS: ${channel.alias.toUpperCase()}...`);
            
            const audit = await generateChannelAudit(googleKey.key, channel.alias, channel.provider);
            newReports.push(audit);
            
            if (isGovernorActive && (audit.status === 'CRITICAL' || audit.status === 'AT_RISK')) {
                addScanLog(`GOVERNOR AUTONOMOUS INTERVENTION REQUIRED...`);
                const exec = await runGovernorExecution(channel.alias, audit.ai_diagnosis);
                setGovernorLog(prev => [exec, ...prev].slice(0, 30));
                addScanLog(`MITIGATION APPLIED: ${exec.action_type} (+${exec.impact_score}% Health)`);
            }

            addScanLog(`CHANNEL REPORT GENERATED: [${audit.status}] Score: ${audit.health_score}`);
            setScanProgress(((i + 1) / socialKeys.length) * 100);
        }
        setReports(newReports);
        if (newReports.length > 0) setSelectedChannelId(newReports[0].channel_name);
    } catch (e: any) {
        addScanLog(`NEURAL FAULT: ${e.message}`);
    } finally {
        setIsScanning(false);
    }
  };

  const selectedReport = reports.find(r => r.channel_name === selectedChannelId) || reports[0];

  return (
    <div className="animate-fade-in space-y-6 pb-20 flex flex-col h-full overflow-hidden">
      
      {/* HEADER CONTROL */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-8 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1 transition-all duration-700 ${isGovernorActive ? 'bg-amber-500 animate-pulse' : isSentinelActive ? 'bg-primary' : 'bg-slate-800'}`}></div>
          <div className="absolute right-0 top-0 p-8 opacity-5"><Crown size={150} /></div>
          
          <div className="flex items-center gap-6 relative z-10">
              <div className={`p-6 rounded-2xl bg-slate-950 border transition-all duration-500 ${isGovernorActive ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] scale-110' : isSentinelActive ? 'border-primary shadow-neon' : 'border-slate-800'}`}>
                  {isGovernorActive ? <Crown size={40} className="text-amber-500" /> : <Radar size={40} className={isSentinelActive ? "text-primary animate-spin-slow" : "text-slate-700"} />}
              </div>
              <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                      {isGovernorActive ? 'OVERLORD CORE ACTIVE' : 'AI SENTINEL GUARD'}
                      {isGovernorActive && <Sparkles size={20} className="text-amber-400" />}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${isGovernorActive ? 'bg-amber-500 animate-pulse' : isSentinelActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                          {isGovernorActive ? 'Autonomous Governance Protocol Enabled' : isSentinelActive ? 'Monitoring Infrastructure Health' : 'System Guard Offline'}
                      </span>
                  </div>
              </div>
          </div>

          <div className="flex gap-4 relative z-10">
              <button 
                onClick={() => setIsGovernorActive(!isGovernorActive)} 
                className={`flex flex-col items-center justify-center px-8 py-4 rounded-2xl border-2 transition-all ${isGovernorActive ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-amber-500/50'}`}
              >
                  <Crown size={24} />
                  <span className="text-[10px] font-black uppercase mt-1 tracking-widest">Governor</span>
              </button>
              <NeonButton onClick={() => setIsSentinelActive(!isSentinelActive)} variant={isSentinelActive ? 'danger' : 'primary'} size="lg" className="min-w-[240px] h-16">
                  {isSentinelActive ? <Lock size={20} /> : <Zap size={20} />}
                  {isSentinelActive ? 'HALT SENTINEL' : 'ACTIVATE SENTINEL'}
              </NeonButton>
          </div>
      </div>

      {reports.length === 0 && !isScanning ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-[40px] opacity-30 text-center space-y-6">
              <Stethoscope size={100} className="text-slate-700" />
              <div className="space-y-2">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tighter">No Health Data Available</h4>
                  <p className="text-xs font-bold uppercase tracking-widest">Click 'ACTIVATE SENTINEL' to initiate real-time channel audit.</p>
              </div>
          </div>
      ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
              {/* LOGS PANEL */}
              <div className="lg:col-span-4 flex flex-col gap-6 overflow-hidden">
                  <div className="bg-black border border-slate-800 rounded-[32px] overflow-hidden flex flex-col h-1/2 shadow-2xl">
                      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2"><Activity size={14}/> Sentinel Pulse</span>
                      </div>
                      <div className="flex-1 p-6 font-mono text-[10px] overflow-y-auto space-y-2 custom-scrollbar text-slate-400">
                          {scanLogs.map((log, i) => <div key={i} className="animate-fade-in leading-relaxed">{log}</div>)}
                          <div ref={logsEndRef} />
                      </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden flex flex-col h-1/2 shadow-2xl">
                      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800">
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2"><History size={14} /> Autonomous Governor History</span>
                      </div>
                      <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
                          {governorLog.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center opacity-10 text-center"><History size={40}/><span className="text-[9px] font-black uppercase mt-2">No interventions staged</span></div>
                          ) : (
                              governorLog.map((act) => (
                                  <div key={act.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl animate-fade-in group">
                                      <div className="flex justify-between items-center mb-2">
                                          <span className="text-[9px] font-black bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded uppercase border border-amber-500/20">{act.action_type}</span>
                                          <span className="text-[8px] font-mono text-slate-600">{new Date(act.timestamp).toLocaleTimeString()}</span>
                                      </div>
                                      <p className="text-[10px] text-white font-bold leading-relaxed">"{act.description}"</p>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>

              {/* DIAGNOSTIC PANEL */}
              <div className="lg:col-span-8 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-20">
                  {isScanning && (
                      <div className="p-12 bg-primary/5 border border-primary/20 rounded-[40px] text-center space-y-6 animate-pulse">
                          <Loader2 size={48} className="text-primary animate-spin mx-auto" />
                          <div className="space-y-2">
                              <h4 className="text-xl font-black text-white uppercase tracking-widest">Recon Probe in Progress...</h4>
                              <div className="w-full max-w-md mx-auto bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div className="bg-primary h-full transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
                              </div>
                          </div>
                      </div>
                  )}

                  {selectedReport && !isScanning && (
                      <div className="animate-fade-in space-y-8">
                          {/* Diagnostic Header */}
                          <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden flex justify-between items-center">
                              <div className={`absolute top-0 right-0 w-80 h-80 blur-[100px] opacity-10 rounded-full ${selectedReport.status === 'HEALTHY' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <div className="relative z-10 space-y-4">
                                  <div>
                                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">{selectedReport.platform} Neural Health</div>
                                      <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{selectedReport.channel_name}</h2>
                                  </div>
                                  <div className="flex items-center gap-4">
                                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase ${selectedReport.status === 'HEALTHY' ? 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{selectedReport.status}</span>
                                      <div className="flex items-center gap-2 text-slate-500">
                                          <Siren size={14}/>
                                          <span className="text-[9px] font-black uppercase tracking-widest">Recovery Window: {selectedReport.recovery_estimate}</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="text-right relative z-10">
                                  <div className={`text-8xl font-black tracking-tighter leading-none ${selectedReport.health_score > 80 ? 'text-green-500' : 'text-red-500'}`}>{selectedReport.health_score}</div>
                                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Neural Integrity Index</div>
                              </div>
                          </div>

                          {/* Risk Mapping */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {selectedReport.risks.map((risk, idx) => (
                                  <div key={idx} className="bg-slate-950 p-6 rounded-[32px] border border-slate-800 flex items-start gap-5 hover:border-primary/30 transition-all group shadow-xl">
                                      <div className={`p-4 rounded-2xl shrink-0 ${risk.severity === 'HIGH' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}><AlertTriangle size={24} /></div>
                                      <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                              <h4 className="text-sm font-black text-white uppercase tracking-tight">{risk.type}</h4>
                                              <span className="text-[8px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-500 font-mono italic">ICD-AI: {risk.medical_term}</span>
                                          </div>
                                          <p className="text-[11px] text-slate-400 leading-relaxed italic font-medium">"{risk.description}"</p>
                                      </div>
                                  </div>
                              ))}
                          </div>

                          {/* Strategic Treatment Plan */}
                          <div className="bg-primary/5 border border-primary/20 rounded-[40px] p-10 space-y-8 shadow-2xl">
                              <div className="flex justify-between items-center border-b border-primary/10 pb-6">
                                  <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3"><Wand2 className="text-primary" size={24} /> Strategic Restoration Plan</h3>
                                  <div className="px-4 py-1.5 bg-primary/20 text-primary text-[9px] font-black rounded-full uppercase">Priority Execution</div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  {selectedReport.action_plan.map((action, i) => (
                                      <div key={i} className="flex gap-5 group">
                                          <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center shrink-0 font-black text-sm transition-all ${action.priority === 'urgent' ? 'border-red-500 text-red-500 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-primary text-primary group-hover:bg-primary group-hover:text-white'}`}>{i + 1}</div>
                                          <div className="space-y-1">
                                              <h5 className="text-sm font-black text-white uppercase tracking-tight">{action.task}</h5>
                                              <p className="text-[11px] text-slate-400 italic leading-relaxed font-medium">"{action.instruction}"</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default ChannelHealthDashboard;
