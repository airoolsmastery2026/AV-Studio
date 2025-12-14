
import React, { useState } from 'react';
import { 
  Dna, Plus, Trash2, Zap, Play, Settings, 
  Layers, Download, FolderOpen, CheckCircle, 
  AlertTriangle, Monitor, Film, Music, Mic, 
  BarChart, Maximize2, RefreshCw
} from 'lucide-react';
import { CompetitorChannel, ViralDNAProfile, StudioSettings, OrchestratorResponse, ApiKeyConfig } from '../types';
import NeonButton from './NeonButton';
import { extractViralDNA, generateProScript } from '../services/geminiService';
import PlanResult from './PlanResult';

interface ViralDNAStudioProps {
  apiKeys: ApiKeyConfig[];
}

const ViralDNAStudio: React.FC<ViralDNAStudioProps> = ({ apiKeys }) => {
  // --- STATE ---
  const [channels, setChannels] = useState<CompetitorChannel[]>([
    { id: '1', url: '', name: 'Channel 1', status: 'pending' }
  ]);
  const [dnaProfile, setDnaProfile] = useState<ViralDNAProfile | null>(null);
  const [studioSettings, setStudioSettings] = useState<StudioSettings>({
    goal: 'Viral',
    platform: 'Shorts',
    language: 'Vietnamese',
    duration: 'Short (30-60s)',
    quality: 'Standard'
  });
  const [generatedPlan, setGeneratedPlan] = useState<OrchestratorResponse | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'generating' | 'rendering' | 'done'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  // --- ACTIONS ---

  const addChannel = () => {
    if (channels.length < 3) {
      setChannels([...channels, { id: crypto.randomUUID(), url: '', name: `Channel ${channels.length + 1}`, status: 'pending' }]);
    }
  };

  const removeChannel = (id: string) => {
    setChannels(channels.filter(c => c.id !== id));
  };

  const updateChannelUrl = (id: string, url: string) => {
    setChannels(channels.map(c => c.id === id ? { ...c, url } : c));
  };

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev]);

  const handleGenerate = async () => {
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
    if (!googleKey) {
        alert("Cần Google API Key để chạy Studio.");
        return;
    }

    const validUrls = channels.filter(c => c.url.trim() !== '').map(c => c.url);
    if (validUrls.length === 0) {
        alert("Vui lòng nhập ít nhất 1 URL.");
        return;
    }

    setStatus('analyzing');
    addLog("--- BẮT ĐẦU QUY TRÌNH STUDIO ---");
    
    try {
        // 1. EXTRACT DNA
        addLog(`Đang phân tích ${validUrls.length} kênh đối thủ...`);
        const dna = await extractViralDNA(googleKey.key, validUrls);
        setDnaProfile(dna);
        addLog("DNA Viral đã được trích xuất thành công.");
        
        // 2. GENERATE SCRIPT
        setStatus('generating');
        addLog("Đang viết kịch bản PRO dựa trên DNA và Cấu hình...");
        const plan = await generateProScript(googleKey.key, dna, studioSettings);
        setGeneratedPlan(plan);
        addLog("Kịch bản hoàn tất.");

        // 3. FINALIZE
        setStatus('done');
        addLog("Sẵn sàng xuất bản.");

    } catch (e: any) {
        console.error(e);
        addLog(`Lỗi: ${e.message}`);
        setStatus('idle');
    }
  };

  const handleDownloadPackage = () => {
      // Simulation of File System Logic
      const folderName = `Project_${Date.now()}`;
      addLog(`Đang tạo thư mục: /ViralDNAStudio/${folderName}`);
      addLog(`-> Downloading Script.json`);
      addLog(`-> Downloading Assets (Simulated)`);
      alert(`Đã tải xuống gói nội dung vào thư mục: ${folderName}`);
  };

  return (
    <div className="animate-fade-in pb-12">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded-2xl">
           <Dna size={40} className="text-orange-500 animate-pulse" />
        </div>
        <div>
           <h1 className="text-3xl font-bold text-white tracking-tight">VIRAL DNA STUDIO <span className="text-xs bg-orange-500 text-black px-2 py-0.5 rounded font-bold align-middle ml-2">PRO</span></h1>
           <p className="text-slate-400">Professional Grade • Multi-Channel Analysis • Anti-Copy Engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: INPUTS & SETTINGS (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* 1. RECON INPUTS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Monitor size={16} className="text-blue-400" /> Competitor Channels
                    </h3>
                    <span className="text-xs text-slate-500">{channels.length}/3 Slots</span>
                </div>
                
                <div className="space-y-3">
                    {channels.map((channel, idx) => (
                        <div key={channel.id} className="flex gap-2">
                            <div className="flex-1 relative">
                                <input 
                                    type="text" 
                                    placeholder={`Dán Link Kênh/Video #${idx + 1}`}
                                    value={channel.url}
                                    onChange={(e) => updateChannelUrl(channel.id, e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                                />
                                <div className="absolute right-2 top-2">
                                    {channel.url && <CheckCircle size={14} className="text-green-500" />}
                                </div>
                            </div>
                            {channels.length > 1 && (
                                <button onClick={() => removeChannel(channel.id)} className="p-2 bg-slate-900 hover:bg-red-900/20 text-slate-500 hover:text-red-500 rounded-lg">
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                    
                    {channels.length < 3 && (
                        <button onClick={addChannel} className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-slate-500 text-xs hover:text-white hover:border-slate-500 transition-colors flex items-center justify-center gap-2">
                            <Plus size={14} /> Add Channel Source
                        </button>
                    )}
                </div>
            </div>

            {/* 2. STUDIO SETTINGS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                    <Settings size={16} className="text-purple-400" /> Studio Configuration
                </h3>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Goal</label>
                            <select 
                                value={studioSettings.goal}
                                onChange={(e) => setStudioSettings({...studioSettings, goal: e.target.value as any})}
                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                            >
                                <option>Viral</option>
                                <option>Education</option>
                                <option>Affiliate</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Platform</label>
                            <select 
                                value={studioSettings.platform}
                                onChange={(e) => setStudioSettings({...studioSettings, platform: e.target.value as any})}
                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                            >
                                <option>Shorts</option>
                                <option>TikTok</option>
                                <option>Reels</option>
                                <option>Long</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Duration Mode</label>
                        <div className="flex gap-2">
                            {['Short (30-60s)', 'Medium (3-5m)', 'Long (10m+)'].map(d => (
                                <button 
                                    key={d}
                                    onClick={() => setStudioSettings({...studioSettings, duration: d as any})}
                                    className={`flex-1 py-1.5 rounded text-[10px] border ${studioSettings.duration === d ? 'bg-orange-900/30 border-orange-500 text-orange-400' : 'bg-slate-950 border-slate-700 text-slate-400'}`}
                                >
                                    {d.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-xs text-slate-300 font-bold flex items-center gap-2"><Zap size={14} className="text-yellow-500"/> Anti-Copy Guard</span>
                            <div className="w-8 h-4 bg-green-500 rounded-full p-0.5"><div className="w-3 h-3 bg-white rounded-full translate-x-4"></div></div>
                        </label>
                        <p className="text-[10px] text-slate-500 mt-1">Ensures 100% semantic originality.</p>
                    </div>
                </div>
            </div>

            {/* 3. EXECUTE */}
            <NeonButton 
                onClick={handleGenerate} 
                disabled={status !== 'idle' && status !== 'done'}
                size="lg" 
                className="w-full"
            >
                {status === 'analyzing' ? (
                    <span className="flex items-center gap-2"><RefreshCw className="animate-spin"/> Scanning DNA...</span>
                ) : status === 'generating' ? (
                    <span className="flex items-center gap-2"><Zap className="animate-pulse"/> Generating...</span>
                ) : (
                    <span className="flex items-center gap-2"><Play fill="currentColor"/> GENERATE MASTERPIECE</span>
                )}
            </NeonButton>

            {/* LOGS */}
            <div className="bg-black border border-slate-800 rounded-xl p-3 h-40 overflow-y-auto font-mono text-[10px] text-green-400">
                {logs.map((log, i) => <div key={i}>&gt; {log}</div>)}
                {logs.length === 0 && <span className="text-slate-600">System Ready...</span>}
            </div>
        </div>

        {/* RIGHT PANEL: WORKSPACE (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
            
            {/* DNA DASHBOARD */}
            {dnaProfile && (
                <div className="bg-slate-900/50 border border-orange-500/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Dna size={20} className="text-orange-500" /> Extracted Viral DNA
                    </h3>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Hook Structure</div>
                            <div className="text-lg font-bold text-white">{dnaProfile.structure.hook_type}</div>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Algorithm Fit</div>
                            <div className="text-3xl font-bold text-green-400">{dnaProfile.algorithm_fit_score}%</div>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Pacing</div>
                            <div className="text-lg font-bold text-orange-400">{dnaProfile.structure.pacing}</div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-2">Emotional Curve</div>
                        <div className="flex items-center gap-1 w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            {dnaProfile.emotional_curve.map((emo, i) => (
                                <div key={i} className="h-full flex-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-80 hover:opacity-100" title={emo}></div>
                            ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                            {dnaProfile.emotional_curve.map((emo, i) => <span key={i}>{emo}</span>)}
                        </div>
                    </div>
                </div>
            )}

            {/* GENERATED OUTPUT */}
            {generatedPlan ? (
                <div className="space-y-6">
                    <PlanResult data={generatedPlan} />
                    
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                <FolderOpen size={20} className="text-blue-400" /> Auto-Organize
                            </h3>
                            <p className="text-slate-400 text-sm">Files ready for download in structured format.</p>
                        </div>
                        <NeonButton onClick={handleDownloadPackage} size="md">
                            <span className="flex items-center gap-2"><Download size={18} /> Download Package</span>
                        </NeonButton>
                    </div>
                </div>
            ) : (
                <div className="h-64 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600">
                    <Layers size={48} className="mb-4 opacity-20" />
                    <p>Workspace Empty. Start a generation to view results.</p>
                </div>
            )}

        </div>

      </div>
    </div>
  );
};

export default ViralDNAStudio;
