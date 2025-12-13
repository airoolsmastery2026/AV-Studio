import React, { useState } from 'react';
import { 
  HeartPulse, Activity, AlertTriangle, CheckCircle, 
  ShieldCheck, AlertOctagon, RefreshCw, Video, Eye, MousePointer2, 
  ChevronRight, Send
} from 'lucide-react';
import { ApiKeyConfig, ChannelHealthReport } from '../types';
import NeonButton from './NeonButton';
import { generateChannelAudit } from '../services/geminiService';

interface ChannelHealthDashboardProps {
  apiKeys: ApiKeyConfig[];
  onSendReportToChat: (report: string) => void;
}

const ChannelHealthDashboard: React.FC<ChannelHealthDashboardProps> = ({ apiKeys, onSendReportToChat }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<ChannelHealthReport[]>([]);

  // Identify connected social channels
  const socialKeys = apiKeys.filter(k => k.category === 'social' && k.status === 'active');

  const handleRunFullScan = async () => {
    setIsScanning(true);
    setReport([]);

    // We need a Google Key for AI Analysis
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
    if (!googleKey) {
        alert("Cần Google API Key để AI phân tích rủi ro.");
        setIsScanning(false);
        return;
    }

    // If no social keys, we simulate a "Demo Channel"
    const channelsToScan = socialKeys.length > 0 
        ? socialKeys 
        : [{ id: 'demo', alias: 'Demo Channel (TikTok)', provider: 'tiktok' }];

    const results: ChannelHealthReport[] = [];

    try {
        for (const channel of channelsToScan) {
            // Artificial delay for UX "Scanning" effect
            await new Promise(r => setTimeout(r, 1200));
            const audit = await generateChannelAudit(googleKey.key, channel.alias, channel.provider);
            results.push(audit);
        }
        setReport(results);
        
        // AUTO REPORT TO COMMANDER
        const summary = results.map(r => 
            `channel: ${r.channel_name} | Score: ${r.health_score} | Status: ${r.status}`
        ).join('\n');
        
        onSendReportToChat(`🚨 **SYSTEM REPORT: CHANNEL HEALTH AUDIT COMPLETED**\n\nI have scanned ${results.length} channels.\n\n${summary}\n\nPlease advise on next steps for "At Risk" channels.`);

    } catch (e) {
        console.error(e);
        alert("Lỗi trong quá trình quét kênh.");
    } finally {
        setIsScanning(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
        <div>
           <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
             <HeartPulse className="text-red-500 animate-pulse" size={32} />
             Channel Health & Risk Center
           </h2>
           <p className="text-slate-400 max-w-2xl">
             Hệ thống chẩn đoán sức khỏe kênh chuyên sâu. Phát hiện Shadowban, Vi phạm bản quyền, Gậy cộng đồng và Sụt giảm tương tác bất thường.
           </p>
        </div>
        <div>
            <NeonButton onClick={handleRunFullScan} disabled={isScanning} size="lg" className="min-w-[200px]" variant="danger">
                {isScanning ? (
                    <span className="flex items-center gap-2"><RefreshCw className="animate-spin" /> Scanning...</span>
                ) : (
                    <span className="flex items-center gap-2"><Activity /> Run Risk Audit</span>
                )}
            </NeonButton>
        </div>
      </div>

      {/* 1. Overview Cards */}
      {!isScanning && report.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                  <div className="text-slate-500 text-xs font-bold uppercase mb-2">Connected Channels</div>
                  <div className="text-3xl font-bold text-white">{socialKeys.length > 0 ? socialKeys.length : '0 (Demo)'}</div>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                  <div className="text-slate-500 text-xs font-bold uppercase mb-2">Avg. Health Score</div>
                  <div className="text-3xl font-bold text-slate-600">--</div>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                  <div className="text-slate-500 text-xs font-bold uppercase mb-2">Shadowban Risk</div>
                  <div className="text-3xl font-bold text-slate-600">--</div>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex items-center justify-center">
                  <p className="text-xs text-center text-slate-500">Nhấn "Run Risk Audit" để AI quét toàn bộ hệ thống.</p>
              </div>
          </div>
      )}

      {/* 2. Audit Results */}
      {report.length > 0 && (
          <div className="space-y-6 animate-fade-in">
              {report.map((item, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative group">
                      {/* Status Stripe */}
                      <div className={`absolute top-0 left-0 w-1 h-full ${
                          item.status === 'HEALTHY' ? 'bg-green-500' : 
                          item.status === 'AT_RISK' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>

                      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {/* Col 1: Identity & Score */}
                          <div className="border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 pr-0 lg:pr-6">
                              <div className="flex items-center gap-3 mb-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                                      item.platform === 'tiktok' ? 'bg-black text-white border border-slate-700' :
                                      item.platform === 'youtube' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                                  }`}>
                                      {item.platform.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-white text-lg">{item.channel_name}</h3>
                                      <span className="text-xs text-slate-500 uppercase tracking-wider">{item.platform} Channel</span>
                                  </div>
                              </div>

                              <div className="flex items-end gap-2 mb-4">
                                  <span className="text-5xl font-bold text-white">{item.health_score}</span>
                                  <span className="text-sm text-slate-500 mb-1.5">/ 100 Health Score</span>
                              </div>

                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold uppercase border ${
                                  item.status === 'HEALTHY' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                  item.status === 'AT_RISK' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                                  'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}>
                                  {item.status === 'HEALTHY' && <CheckCircle size={14} />}
                                  {item.status === 'AT_RISK' && <AlertTriangle size={14} />}
                                  {item.status === 'CRITICAL' && <AlertOctagon size={14} />}
                                  {item.status}
                              </div>
                          </div>

                          {/* Col 2: Risks & Metrics */}
                          <div className="lg:col-span-2 space-y-6">
                              {/* Metrics */}
                              <div className="grid grid-cols-3 gap-4">
                                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                      <div className="text-slate-500 text-[10px] uppercase font-bold mb-1 flex items-center gap-1"><Eye size={12}/> Growth</div>
                                      <div className="text-lg font-mono text-white">{item.metrics.views_growth}</div>
                                  </div>
                                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                      <div className="text-slate-500 text-[10px] uppercase font-bold mb-1 flex items-center gap-1"><Video size={12}/> Watch Time</div>
                                      <div className="text-lg font-mono text-white">{item.metrics.avg_watch_time}</div>
                                  </div>
                                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                      <div className="text-slate-500 text-[10px] uppercase font-bold mb-1 flex items-center gap-1"><MousePointer2 size={12}/> CTR</div>
                                      <div className="text-lg font-mono text-white">{item.metrics.ctr}</div>
                                  </div>
                              </div>

                              {/* Risk Analysis */}
                              <div>
                                  <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                      <ShieldCheck size={16} /> Risk Detection Protocol
                                  </h4>
                                  {item.risks.length === 0 || (item.risks.length === 1 && item.risks[0].type === 'NONE') ? (
                                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2">
                                          <CheckCircle size={16} /> No anomalies detected. System secure.
                                      </div>
                                  ) : (
                                      <div className="space-y-2">
                                          {item.risks.map((risk, rIdx) => (
                                              <div key={rIdx} className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-3">
                                                  <AlertOctagon size={18} className="text-red-500 shrink-0 mt-0.5" />
                                                  <div>
                                                      <div className="flex items-center gap-2">
                                                          <span className="font-bold text-red-400 text-sm">{risk.type}</span>
                                                          <span className="text-[10px] bg-red-950 text-red-300 px-1.5 rounded border border-red-800">{risk.severity}</span>
                                                      </div>
                                                      <p className="text-xs text-slate-300 mt-1">{risk.description}</p>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </div>

                              {/* Action Plan */}
                              <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl">
                                  <h4 className="text-sm font-bold text-blue-400 uppercase mb-2 flex items-center gap-2">
                                      <Activity size={16} /> AI Diagnosis & Fix
                                  </h4>
                                  <p className="text-sm text-slate-300 mb-3 italic">"{item.ai_diagnosis}"</p>
                                  <div className="space-y-1">
                                      {item.action_plan.map((action, aIdx) => (
                                          <div key={aIdx} className="flex items-start gap-2 text-xs text-slate-200">
                                              <ChevronRight size={12} className="text-blue-500 mt-0.5" />
                                              {action}
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </div>
                      
                      {/* Notification Trigger Badge */}
                      <div className="absolute top-4 right-4 text-xs text-slate-600 flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-full opacity-50">
                          <Send size={10} /> Auto-reported
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default ChannelHealthDashboard;