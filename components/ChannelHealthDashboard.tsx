
import React, { useState, useEffect, useRef } from 'react';
import { 
  HeartPulse, Activity, AlertTriangle, CheckCircle, 
  ShieldCheck, AlertOctagon, RefreshCw, Video, Eye, MousePointer2, 
  ChevronRight, Send, Terminal, Lock, Unlock, Search, BarChart2, Zap
} from 'lucide-react';
import { ApiKeyConfig, ChannelHealthReport } from '../types';
import NeonButton from './NeonButton';
import { generateChannelAudit } from '../services/geminiService';

interface ChannelHealthDashboardProps {
  apiKeys: ApiKeyConfig[];
  onSendReportToChat: (report: string) => void;
  t?: any;
}

const ChannelHealthDashboard: React.FC<ChannelHealthDashboardProps> = ({ apiKeys, onSendReportToChat, t }) => {
  const texts = t || {};
  
  // State for Scanning Process
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const [report, setReport] = useState<ChannelHealthReport[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const socialKeys = apiKeys.filter(k => k.category === 'social' && k.status === 'active');

  // Auto-scroll logs
  useEffect(() => {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [scanLogs]);

  const addScanLog = (msg: string) => {
      setScanLogs(prev => [...prev, `> ${msg}`]);
  };

  const handleRunFullScan = async () => {
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
    if (!googleKey) {
        alert(texts.alert_key || "Google API Key required for AI analysis.");
        return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setScanLogs([]);
    setReport([]);

    addScanLog("INITIALIZING RISK PROTOCOL v2.0...");
    await new Promise(r => setTimeout(r, 800));

    const channelsToScan = socialKeys.length > 0 
        ? socialKeys 
        : [{ id: 'demo', alias: 'Demo Channel (TikTok)', provider: 'tiktok' }];

    const results: ChannelHealthReport[] = [];
    const progressStep = 100 / channelsToScan.length;

    try {
        for (let i = 0; i < channelsToScan.length; i++) {
            const channel = channelsToScan[i];
            addScanLog(`CONNECTING TO: ${channel.provider.toUpperCase()} [${channel.alias}]...`);
            
            // Simulation stages
            await new Promise(r => setTimeout(r, 600));
            addScanLog(`  - Fetching last 30 videos metadata...`);
            await new Promise(r => setTimeout(r, 500));
            addScanLog(`  - Analyzing engagement velocity...`);
            await new Promise(r => setTimeout(r, 500));
            addScanLog(`  - Checking copyright databases...`);
            
            // AI Call
            addScanLog(`  - SENDING DATA TO GEMINI AI FOR DIAGNOSIS...`);
            const audit = await generateChannelAudit(googleKey.key, channel.alias, channel.provider);
            results.push(audit);
            
            addScanLog(`COMPLETED SCAN FOR ${channel.alias}. Status: ${audit.status}`);
            setScanProgress((prev) => Math.min(prev + progressStep, 100));
        }

        addScanLog("COMPILING FINAL RISK REPORT...");
        await new Promise(r => setTimeout(r, 800));
        
        setReport(results);
        if (results.length > 0) setSelectedChannelId(results[0].channel_name); // Auto select first
        
        // Auto Report
        const summary = results.map(r => `channel: ${r.channel_name} | Score: ${r.health_score} | Status: ${r.status}`).join('\n');
        onSendReportToChat(`🚨 **SYSTEM REPORT: CHANNEL HEALTH AUDIT COMPLETED**\n\nI have scanned ${results.length} channels.\n\n${summary}\n\nPlease advise on next steps for "At Risk" channels.`);

    } catch (e) {
        console.error(e);
        addScanLog("CRITICAL ERROR DURING SCAN.");
    } finally {
        setIsScanning(false);
        setScanProgress(100);
    }
  };

  const selectedReport = report.find(r => r.channel_name === selectedChannelId) || report[0];

  return (
    <div className="animate-fade-in space-y-6 pb-12 flex flex-col h-[calc(100vh-140px)]">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-4 shrink-0">
        <div>
           <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
             <div className="relative">
                 <HeartPulse className={`text-red-500 ${isScanning ? 'animate-pulse' : ''}`} size={28} />
                 {isScanning && <span className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full animate-ping"></span>}
             </div>
             {texts.title || "Channel Health & Risk Center"}
           </h2>
           <p className="text-slate-400 text-sm max-w-2xl font-mono">
             Protocol: Shadowban Detection • Copyright Scan • Engagement Drops
           </p>
        </div>
        <div>
            <NeonButton onClick={handleRunFullScan} disabled={isScanning} size="lg" className="min-w-[200px]" variant="danger">
                {isScanning ? (
                    <span className="flex items-center gap-2"><RefreshCw className="animate-spin" /> {texts.btn_scanning || "Scanning Network..."}</span>
                ) : (
                    <span className="flex items-center gap-2"><Activity /> {texts.btn_scan || "RUN SYSTEM AUDIT"}</span>
                )}
            </NeonButton>
        </div>
      </div>

      {/* VIEW: SCANNING TERMINAL */}
      {isScanning && (
          <div className="flex-1 flex flex-col gap-4 justify-center items-center">
              <div className="w-full max-w-2xl bg-black border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
                  <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                      <Terminal size={14} className="text-slate-400" />
                      <span className="text-xs font-mono text-slate-300">SYSTEM_AUDIT_TERMINAL.exe</span>
                  </div>
                  <div className="p-4 h-64 overflow-y-auto font-mono text-xs space-y-1 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-90">
                      {scanLogs.map((log, i) => (
                          <div key={i} className={`break-words ${log.includes('CRITICAL') ? 'text-red-500' : log.includes('COMPLETED') ? 'text-green-400' : log.includes('CONNECTING') ? 'text-yellow-400' : 'text-slate-400'}`}>
                              {log}
                          </div>
                      ))}
                      <div ref={logsEndRef} />
                  </div>
                  {/* Progress Bar */}
                  <div className="h-1 bg-slate-800 w-full">
                      <div className="h-full bg-green-500 transition-all duration-300 ease-out" style={{ width: `${scanProgress}%` }}></div>
                  </div>
              </div>
              <p className="text-slate-500 text-xs animate-pulse">AI is analyzing metadata patterns...</p>
          </div>
      )}

      {/* VIEW: EMPTY STATE */}
      {!isScanning && report.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30 p-8 text-center">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                  <ShieldCheck size={40} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">System Secure. Ready to Scan.</h3>
              <p className="text-slate-400 max-w-md text-sm mb-6">
                  Press the button above to run a deep diagnostic scan across all connected channels. We will look for hidden risks like Shadowbans and algorithmic penalties.
              </p>
              <div className="flex gap-4 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1"><CheckCircle size={12}/> API Connected</span>
                  <span className="flex items-center gap-1"><CheckCircle size={12}/> AI Engine Ready</span>
              </div>
          </div>
      )}

      {/* VIEW: REPORT DASHBOARD */}
      {!isScanning && report.length > 0 && selectedReport && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
              
              {/* LEFT: CHANNEL SELECTOR */}
              <div className="lg:col-span-3 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Channels ({report.length})</h3>
                  {report.map(r => (
                      <button 
                          key={r.channel_name}
                          onClick={() => setSelectedChannelId(r.channel_name)}
                          className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden group ${
                              selectedChannelId === r.channel_name 
                              ? 'bg-slate-800 border-slate-600 shadow-lg' 
                              : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                          }`}
                      >
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                              r.status === 'HEALTHY' ? 'bg-green-500' : r.status === 'AT_RISK' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          
                          <div className="pl-3">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-sm text-white truncate w-24">{r.channel_name}</span>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                      r.status === 'HEALTHY' ? 'text-green-400 bg-green-900/20' : 
                                      r.status === 'AT_RISK' ? 'text-yellow-400 bg-yellow-900/20' : 'text-red-400 bg-red-900/20'
                                  }`}>{r.health_score}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                  {r.platform.toUpperCase()} • {r.status}
                              </div>
                          </div>
                      </button>
                  ))}
              </div>

              {/* CENTER: MAIN REPORT */}
              <div className="lg:col-span-6 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                  
                  {/* Score Card */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl flex items-center justify-between relative overflow-hidden">
                      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 rounded-full ${
                          selectedReport.status === 'HEALTHY' ? 'bg-green-500' : selectedReport.status === 'AT_RISK' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      
                      <div>
                          <h2 className="text-2xl font-bold text-white mb-1">{selectedReport.channel_name}</h2>
                          <div className="flex items-center gap-2 text-sm">
                              <span className={`font-bold ${
                                  selectedReport.status === 'HEALTHY' ? 'text-green-400' : selectedReport.status === 'AT_RISK' ? 'text-yellow-400' : 'text-red-400'
                              }`}>{selectedReport.status}</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-400">Last scanned: Just now</span>
                          </div>
                      </div>

                      <div className="text-right z-10">
                          <div className="text-5xl font-black text-white tracking-tighter">{selectedReport.health_score}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest">Health Score</div>
                      </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                          <div className="text-slate-500 text-[10px] uppercase font-bold mb-1 flex items-center gap-1"><Eye size={12}/> Growth</div>
                          <div className="text-lg font-mono text-white font-bold">{selectedReport.metrics.views_growth}</div>
                      </div>
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                          <div className="text-slate-500 text-[10px] uppercase font-bold mb-1 flex items-center gap-1"><Video size={12}/> Watch Time</div>
                          <div className="text-lg font-mono text-white font-bold">{selectedReport.metrics.avg_watch_time}</div>
                      </div>
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                          <div className="text-slate-500 text-[10px] uppercase font-bold mb-1 flex items-center gap-1"><MousePointer2 size={12}/> CTR</div>
                          <div className="text-lg font-mono text-white font-bold">{selectedReport.metrics.ctr}</div>
                      </div>
                  </div>

                  {/* Risks List */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <h4 className="text-sm font-bold text-slate-300 uppercase mb-4 flex items-center gap-2">
                          <AlertOctagon size={16} className="text-red-500"/> Risk Detections
                      </h4>
                      <div className="space-y-3">
                          {selectedReport.risks.length === 0 || (selectedReport.risks.length === 1 && selectedReport.risks[0].type === 'NONE') ? (
                              <div className="p-4 bg-green-900/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                                  <CheckCircle size={20} className="text-green-500" />
                                  <span className="text-sm text-green-400 font-medium">Clean Record. No issues detected.</span>
                              </div>
                          ) : (
                              selectedReport.risks.map((risk, idx) => (
                                  <div key={idx} className="p-3 bg-red-900/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                                      <div className="mt-0.5"><AlertTriangle size={16} className="text-red-500"/></div>
                                      <div>
                                          <div className="flex items-center gap-2">
                                              <span className="text-sm font-bold text-white">{risk.type}</span>
                                              <span className="text-[9px] bg-red-950 text-red-400 px-1.5 rounded border border-red-900">{risk.severity}</span>
                                          </div>
                                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{risk.description}</p>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>

                  {/* AI Diagnosis */}
                  <div className="bg-blue-900/10 border border-blue-500/20 p-5 rounded-xl">
                      <h4 className="text-sm font-bold text-blue-400 uppercase mb-3 flex items-center gap-2">
                          <Activity size={16} /> AI Chief Medical Officer
                      </h4>
                      <p className="text-sm text-slate-300 mb-4 italic leading-relaxed">"{selectedReport.ai_diagnosis}"</p>
                      
                      <div className="space-y-2">
                          {selectedReport.action_plan.map((action, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-white">
                                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400 font-bold">{i + 1}</div>
                                  <span className="mt-0.5">{action}</span>
                              </div>
                          ))}
                      </div>
                  </div>

              </div>

              {/* RIGHT: ACTIONS & HISTORY */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-white uppercase mb-3">Quick Actions</h4>
                      <div className="space-y-2">
                          <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2">
                              <Unlock size={14} /> Appeal Shadowban
                          </button>
                          <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2">
                              <RefreshCw size={14} /> Clear Cache
                          </button>
                      </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-1">
                      <h4 className="text-xs font-bold text-white uppercase mb-3">Protection Level</h4>
                      <div className="flex flex-col items-center justify-center h-40">
                          <ShieldCheck size={64} className={`${selectedReport.health_score > 70 ? 'text-green-500' : 'text-yellow-500'} mb-4`} />
                          <div className="text-2xl font-bold text-white">{selectedReport.health_score > 70 ? 'ACTIVE' : 'WARNING'}</div>
                          <div className="text-[10px] text-slate-500 text-center mt-1">Real-time monitoring is {selectedReport.health_score > 70 ? 'enabled' : 'restricted'}</div>
                      </div>
                  </div>
              </div>

          </div>
      )}
    </div>
  );
};

export default ChannelHealthDashboard;
