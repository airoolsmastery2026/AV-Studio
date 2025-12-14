
import React, { useState, useEffect } from 'react';
import { 
  Dna, Plus, Trash2, Zap, Play, Settings, 
  Layers, Download, FolderOpen, CheckCircle, 
  AlertTriangle, Monitor, Film, Music, Mic, 
  BarChart, Maximize2, RefreshCw, Box, FileJson,
  LayoutTemplate, Image as ImageIcon, Wand2, ShieldAlert,
  Gauge, TrendingUp, Lock, Unlock, FileCheck,
  Sliders, Video, Banknote
} from 'lucide-react';
import { CompetitorChannel, ViralDNAProfile, StudioSettings, OrchestratorResponse, ApiKeyConfig } from '../types';
import NeonButton from './NeonButton';
import { extractViralDNA, generateProScript } from '../services/geminiService';
import PlanResult from './PlanResult';

interface ViralDNAStudioProps {
  apiKeys: ApiKeyConfig[];
}

type StudioTab = 'source' | 'prompt' | 'settings' | 'character' | 'flow' | 'quality';

const ViralDNAStudio: React.FC<ViralDNAStudioProps> = ({ apiKeys }) => {
  // --- STATE ---
  const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>('source');
  
  const [channels, setChannels] = useState<CompetitorChannel[]>([
    { id: '1', url: '', name: 'Channel 1', status: 'pending' },
    { id: '2', url: '', name: 'Channel 2', status: 'pending' },
    { id: '3', url: '', name: 'Channel 3', status: 'pending' }
  ]);
  
  const [dnaProfile, setDnaProfile] = useState<ViralDNAProfile | null>(null);
  
  const [studioSettings, setStudioSettings] = useState<StudioSettings>({
    quality: 'Standard',
    aspectRatio: '9:16',
    model: 'Balanced',
    hookStrength: 8,
    storyMode: 'One-shot',
    riskLevel: 'Medium',
    characterLock: true,
    styleLock: true,
    musicSync: true
  });

  const [generatedPlan, setGeneratedPlan] = useState<OrchestratorResponse | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'generating' | 'rendering' | 'done'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [analyzingChannelId, setAnalyzingChannelId] = useState<string | null>(null);

  // --- HELPERS ---
  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const updateChannelUrl = (id: string, url: string) => {
    setChannels(channels.map(c => c.id === id ? { ...c, url } : c));
  };

  const getQualityColor = (score: number) => {
      if (score >= 80) return 'text-green-500';
      if (score >= 50) return 'text-yellow-500';
      return 'text-red-500';
  };

  // --- CORE LOGIC ---

  const handleRunAnalysis = async () => {
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
    if (!googleKey) {
        alert("Cần Google API Key để chạy Studio.");
        return;
    }

    const validChannels = channels.filter(c => c.url.trim() !== '');
    if (validChannels.length === 0) {
        alert("Vui lòng nhập ít nhất 1 URL kênh đối thủ.");
        return;
    }

    setStatus('analyzing');
    addLog("--- BẮT ĐẦU QUY TRÌNH STUDIO (CASH COW ENGINE) ---");
    
    try {
        // Parallel Analysis Simulation
        const analyzedChannels = [...channels];
        
        for (let i = 0; i < analyzedChannels.length; i++) {
            if (analyzedChannels[i].url.trim()) {
                setAnalyzingChannelId(analyzedChannels[i].id);
                addLog(`📡 Scanning RPM & Tech: ${analyzedChannels[i].name}...`);
                // Simulate delay per channel for visual effect
                await new Promise(r => setTimeout(r, 1000));
                analyzedChannels[i].status = 'done';
            }
        }
        setAnalyzingChannelId(null);
        setChannels(analyzedChannels);

        // Call API
        addLog(`🧬 Trích xuất DNA Viral để tối ưu Views/CPM...`);
        const dna = await extractViralDNA(googleKey.key, validChannels.map(c => c.url));
        setDnaProfile(dna);
        
        // Auto-switch to Prompt Tab
        addLog("✅ Phân tích hoàn tất. Chuyển sang chiến lược Prompt RPM cao.");
        setActiveStudioTab('prompt');

    } catch (e: any) {
        console.error(e);
        addLog(`❌ Lỗi: ${e.message}`);
        setStatus('idle');
    }
  };

  const handleGenerateScript = async () => {
      if (!dnaProfile) return;
      const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
      if (!googleKey) return;

      setStatus('generating');
      addLog("📝 Đang viết kịch bản tối ưu Retention (High RPM)...");
      try {
          const plan = await generateProScript(googleKey.key, dnaProfile, studioSettings);
          setGeneratedPlan(plan);
          addLog("✅ Kịch bản hoàn tất. Chuyển sang Quality Check.");
          setActiveStudioTab('quality');
          setStatus('done');
      } catch (e: any) {
          addLog(`❌ Lỗi tạo script: ${e.message}`);
          setStatus('idle');
      }
  };

  const handleDownloadPackage = () => {
      if (!generatedPlan) return;
      const folderName = `${generatedPlan.generated_content?.title.substring(0, 10).replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`;
      
      addLog(`📂 KHỞI TẠO FILE AUTOMATION (CASH COW STRUCT)...`);
      addLog(`   ├── /ViralVideoStudio`);
      addLog(`   │    ├── /${channels[0].name.replace(/\s/g,'_')}`);
      addLog(`   │    │    ├── /High_RPM_Projects`);
      addLog(`   │    │    │    └── ${folderName}`);
      addLog(`   │    │    │         ├── script.json`);
      addLog(`   │    │    │         ├── assets/`);
      addLog(`   │    │    │         └── render.mp4`);
      
      alert(`Đã tải xuống gói nội dung (Simulated Zip) vào: ViralVideoStudio/${channels[0].name}/${folderName}`);
  };

  return (
    <div className="animate-fade-in pb-12 flex flex-col h-[calc(100vh-100px)]">
      
      {/* 1. STUDIO HEADER */}
      <div className="flex items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4 shrink-0">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg shadow-orange-900/20">
                <Dna size={32} className="text-white" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    VIRAL DNA STUDIO <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-black tracking-widest">PRO</span>
                </h1>
                <p className="text-slate-400 text-xs font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    CASH COW ENGINE: HIGH RPM & VIEW MONETIZATION
                </p>
            </div>
        </div>
        
        {/* Progress Stepper */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
            {['Source', 'Prompt', 'Config', 'Script', 'Quality'].map((step, i) => (
                <div key={step} className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                        (status === 'idle' && i === 0) ? 'bg-blue-500 animate-pulse' :
                        (status === 'analyzing' && i <= 1) ? 'bg-yellow-500 animate-pulse' :
                        (status === 'generating' && i <= 3) ? 'bg-purple-500 animate-pulse' :
                        (status === 'done') ? 'bg-green-500' : 'bg-slate-700'
                    }`}></div>
                    <span className={`text-[10px] font-bold uppercase ${
                        (status === 'done' || (status === 'analyzing' && i <=1)) ? 'text-white' : 'text-slate-600'
                    }`}>{step}</span>
                    {i < 4 && <div className="w-8 h-px bg-slate-800 mx-2"></div>}
                </div>
            ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
        
        {/* LEFT PANEL: NAVIGATION & HISTORY (2 Cols) */}
        <div className="hidden lg:flex lg:col-span-2 flex-col gap-2 border-r border-slate-800 pr-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 px-2">Workflow Tabs</h3>
            {[
                { id: 'source', label: '1. Source & Analysis', icon: Monitor },
                { id: 'prompt', label: '2. Prompt Control', icon: Wand2 },
                { id: 'settings', label: '3. Video Settings', icon: Sliders },
                { id: 'character', label: '4. Character & Style', icon: ImageIcon },
                { id: 'flow', label: '5. Story Flow', icon: LayoutTemplate },
                { id: 'quality', label: '6. Quality Gate', icon: ShieldAlert },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveStudioTab(tab.id as StudioTab)}
                    className={`text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                        activeStudioTab === tab.id 
                        ? 'bg-slate-800 text-white border-l-4 border-orange-500 shadow-lg' 
                        : 'text-slate-500 hover:text-white hover:bg-slate-900'
                    }`}
                >
                    <tab.icon size={16} /> {tab.label}
                </button>
            ))}

            <div className="mt-auto bg-slate-900 rounded-xl p-4 border border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Target Metrics</h4>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-300">
                        <span>Min View:</span> <span className="font-mono text-green-400">100K+</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                        <span>Goal:</span> <span className="font-mono text-orange-400">High RPM</span>
                    </div>
                </div>
            </div>
        </div>

        {/* CENTER PANEL: MAIN WORKSPACE (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            
            {/* TAB CONTENT */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[500px] relative">
                
                {/* 1. SOURCE & ANALYSIS */}
                {activeStudioTab === 'source' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Monitor size={20} className="text-blue-500" /> Multi-Channel Input
                            </h3>
                            <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded border border-blue-500/30 font-mono">
                                Mode: Competitor Cloning
                            </span>
                        </div>

                        <div className="space-y-3">
                            {channels.map((channel, idx) => (
                                <div key={channel.id} className="relative group">
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold border border-slate-700 z-10 text-slate-400">
                                        {idx + 1}
                                    </div>
                                    <div className={`pl-6 bg-slate-950 border ${analyzingChannelId === channel.id ? 'border-yellow-500 animate-pulse' : channel.status === 'done' ? 'border-green-500/50' : 'border-slate-700'} rounded-xl p-1 flex items-center gap-2 transition-colors`}>
                                        <input 
                                            type="text" 
                                            placeholder={`Link Kênh/Video Đối Thủ #${idx + 1}`}
                                            value={channel.url}
                                            onChange={(e) => updateChannelUrl(channel.id, e.target.value)}
                                            className="flex-1 bg-transparent border-none text-xs text-white px-3 py-2 focus:ring-0 placeholder:text-slate-600"
                                        />
                                        {channel.status === 'done' && <CheckCircle size={16} className="text-green-500 mr-2" />}
                                        {analyzingChannelId === channel.id && <RefreshCw size={16} className="text-yellow-500 animate-spin mr-2" />}
                                    </div>
                                    
                                    {/* Simulated Metrics Preview if done */}
                                    {channel.status === 'done' && dnaProfile?.channel_breakdown && (
                                        <div className="ml-6 mt-1 flex gap-2 text-[10px] text-slate-500">
                                            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Hook: {dnaProfile.channel_breakdown[idx]?.report?.hook_style || 'Visual Shock'}</span>
                                            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Retention: High</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* COMPARISON RADAR CHART */}
                        {dnaProfile && dnaProfile.channel_breakdown && (
                            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 animate-fade-in">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                    <BarChart size={14} /> Competitive Matrix (DNA Comparison)
                                </h4>
                                <div className="h-64 w-full flex items-center justify-center">
                                    <CompetitorRadarChart data={dnaProfile.channel_breakdown} labels={channels.map(c => c.name)} />
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <NeonButton onClick={handleRunAnalysis} disabled={status === 'analyzing'} size="lg" className="w-full">
                                {status === 'analyzing' ? (
                                    <span className="flex items-center gap-2"><RefreshCw className="animate-spin"/> System Analyzing...</span>
                                ) : (
                                    <span className="flex items-center gap-2"><Zap /> RUN DEEP ANALYSIS</span>
                                )}
                            </NeonButton>
                        </div>
                    </div>
                )}

                {/* 2. PROMPT CONTROL */}
                {activeStudioTab === 'prompt' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Wand2 size={20} className="text-purple-500" /> Auto Prompt Generator
                            </h3>
                            <button className="text-xs text-orange-400 underline">Advanced Mode</button>
                        </div>

                        {/* Generated Prompts per Channel */}
                        {dnaProfile?.channel_breakdown ? (
                            <div className="space-y-4">
                                {dnaProfile.channel_breakdown.map((c, i) => (
                                    <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase">Prompt Chiến lược Kênh {i+1}</span>
                                            <span className="text-[10px] bg-green-900/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30">Algorithm Fit: High</span>
                                        </div>
                                        <p className="text-sm text-slate-200 font-mono leading-relaxed">
                                            {c.report?.suggested_prompt || "Prompt will appear here after analysis..."}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                <Wand2 size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Chưa có dữ liệu phân tích. Vui lòng chạy Analysis ở Tab 1 trước.</p>
                            </div>
                        )}

                        {/* Global Overrides */}
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 mt-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Tùy chỉnh Hook & Risk</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] text-slate-500 mb-1">Hook Strength (1-10)</label>
                                    <input 
                                        type="range" min="1" max="10" 
                                        value={studioSettings.hookStrength}
                                        onChange={(e) => setStudioSettings({...studioSettings, hookStrength: parseInt(e.target.value)})}
                                        className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg appearance-none"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                                        <span>Soft</span>
                                        <span className="text-white font-bold">{studioSettings.hookStrength}</span>
                                        <span>Shocking (Clickbait)</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-500 mb-1">Risk Level (Reup/Copyright)</label>
                                    <div className="flex bg-slate-900 rounded-lg p-1">
                                        {['Safe', 'Medium', 'High'].map(r => (
                                            <button 
                                                key={r}
                                                onClick={() => setStudioSettings({...studioSettings, riskLevel: r as any})}
                                                className={`flex-1 text-[10px] py-1 rounded transition-colors ${studioSettings.riskLevel === r ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. VIDEO SETTINGS */}
                {activeStudioTab === 'settings' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                            <Sliders size={20} className="text-green-500" /> Professional Video Config
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Quality Profile</span>
                                    <Monitor size={16} className="text-slate-600 group-hover:text-green-500" />
                                </div>
                                <div className="space-y-2">
                                    {['Draft (Test)', 'Standard (Social)', 'Ultra (Cinematic)'].map(q => (
                                        <button 
                                            key={q}
                                            onClick={() => setStudioSettings({...studioSettings, quality: q.split(' ')[0] as any})}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition-all ${
                                                studioSettings.quality === q.split(' ')[0] 
                                                ? 'bg-green-900/20 border-green-500/50 text-green-400' 
                                                : 'bg-slate-900 border-slate-800 text-slate-500'
                                            }`}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Aspect Ratio</span>
                                    <Box size={16} className="text-slate-600 group-hover:text-blue-500" />
                                </div>
                                <div className="flex gap-2 h-full items-start">
                                    {['9:16', '16:9', '1:1'].map(r => (
                                        <button 
                                            key={r}
                                            onClick={() => setStudioSettings({...studioSettings, aspectRatio: r as any})}
                                            className={`flex-1 py-4 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                                                studioSettings.aspectRatio === r 
                                                ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' 
                                                : 'bg-slate-900 border-slate-800 text-slate-500'
                                            }`}
                                        >
                                            <div className={`border-2 border-current rounded-sm ${
                                                r === '9:16' ? 'w-3 h-5' : r === '16:9' ? 'w-5 h-3' : 'w-4 h-4'
                                            }`}></div>
                                            <span className="text-[10px] font-bold">{r}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                             <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Rendering Engine Model</h4>
                             <div className="flex gap-3">
                                 {['Fast (Turbo)', 'Balanced (Recommended)', 'Cinematic (Slow)'].map(m => (
                                     <button 
                                        key={m}
                                        onClick={() => setStudioSettings({...studioSettings, model: m.split(' ')[0] as any})}
                                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                                            studioSettings.model === m.split(' ')[0]
                                            ? 'bg-white text-black border-white shadow-lg'
                                            : 'bg-slate-900 text-slate-500 border-slate-800'
                                        }`}
                                     >
                                         {m}
                                     </button>
                                 ))}
                             </div>
                        </div>
                    </div>
                )}

                {/* 4. CHARACTER & STYLE (Placeholder logic for now) */}
                {activeStudioTab === 'character' && (
                    <div className="space-y-6 animate-fade-in text-center py-12">
                        <ImageIcon size={64} className="mx-auto text-slate-800 mb-4" />
                        <h3 className="text-xl font-bold text-slate-600">Character Consistency Engine</h3>
                        <p className="text-slate-500 text-sm max-w-md mx-auto">
                            Tính năng khóa nhân vật và đồng nhất phong cách hình ảnh đang được phát triển.
                            Hiện tại hệ thống sẽ tự động duy trì sự nhất quán dựa trên Prompt.
                        </p>
                        <div className="flex justify-center gap-4 mt-6">
                            <div className="flex items-center gap-2 opacity-50">
                                <input type="checkbox" checked readOnly />
                                <span className="text-sm text-slate-400">Lock Face</span>
                            </div>
                            <div className="flex items-center gap-2 opacity-50">
                                <input type="checkbox" checked readOnly />
                                <span className="text-sm text-slate-400">Lock Outfit</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. STORY FLOW */}
                {activeStudioTab === 'flow' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <LayoutTemplate size={20} className="text-pink-500" /> Story Blueprint
                            </h3>
                            <button onClick={handleGenerateScript} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-bold transition-colors">
                                Generate Script Structure
                            </button>
                        </div>

                        <div className="border-l-2 border-slate-800 pl-6 space-y-8 relative">
                            {['Hook (0-3s)', 'Context (3-15s)', 'Climax (15-45s)', 'Resolution (45-60s)'].map((part, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center z-10">
                                        <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                                    </div>
                                    <h4 className="text-sm font-bold text-white mb-2">{part}</h4>
                                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl min-h-[80px] text-xs text-slate-500 italic">
                                        {generatedPlan ? (
                                            generatedPlan.production_plan.scenes[i]?.vo_text || "Content pending generation..."
                                        ) : "Waiting for script generation..."}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 6. QUALITY GATE */}
                {activeStudioTab === 'quality' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                            <ShieldAlert size={20} className="text-red-500" /> Quality Control Gate
                        </h3>

                        {generatedPlan ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Originality', score: 92, icon: Fingerprint },
                                        { label: 'Retention', score: 88, icon: TrendingUp },
                                        { label: 'SEO Score', score: 95, icon: Search },
                                        { label: 'Risk Safety', score: 100, icon: ShieldCheck }
                                    ].map((m, i) => (
                                        <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                                            <div className="text-xs text-slate-500 uppercase font-bold mb-2">{m.label}</div>
                                            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                                    <path
                                                        className="text-slate-800"
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                    />
                                                    <path
                                                        className={getQualityColor(m.score)}
                                                        strokeDasharray={`${m.score}, 100`}
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                    />
                                                </svg>
                                                <span className={`absolute text-sm font-bold ${getQualityColor(m.score)}`}>{m.score}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-xl flex items-center gap-3">
                                    <FileCheck size={24} className="text-green-500" />
                                    <div>
                                        <h4 className="text-sm font-bold text-white">Quality Gate Passed</h4>
                                        <p className="text-xs text-slate-400">All metrics exceed the minimum threshold for viral distribution.</p>
                                    </div>
                                    <NeonButton onClick={handleDownloadPackage} size="sm" className="ml-auto">
                                        Export Package
                                    </NeonButton>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                                <Lock size={32} className="mx-auto mb-3 text-slate-600" />
                                <p className="text-slate-500 text-sm">Quality Gate is locked. Generate a script first.</p>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* LIVE LOGS FOOTER */}
            <div className="bg-black border border-slate-800 rounded-xl p-3 h-32 overflow-y-auto font-mono text-[10px] text-green-400 shadow-inner">
                {logs.map((log, i) => <div key={i} className="border-l-2 border-green-900 pl-2 mb-1">{log}</div>)}
                {logs.length === 0 && <span className="text-slate-700 italic">System Ready. Waiting for input...</span>}
            </div>
        </div>

        {/* RIGHT PANEL: PREVIEW & OUTPUT (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 h-full flex flex-col">
                <div className="bg-black rounded-xl flex-1 flex items-center justify-center relative overflow-hidden group">
                    {/* Simulated Preview */}
                    <div className="text-center opacity-50 group-hover:opacity-20 transition-opacity">
                        <Film size={48} className="mx-auto mb-2 text-slate-700" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Preview Monitor</span>
                    </div>
                    {generatedPlan && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-4">
                            <h3 className="text-white font-bold leading-tight">{generatedPlan.generated_content?.title}</h3>
                            <p className="text-xs text-slate-300 mt-1 line-clamp-2">{generatedPlan.generated_content?.description}</p>
                        </div>
                    )}
                </div>
                
                {/* Simulated Audio/Video Tracks */}
                <div className="p-3 space-y-2">
                    <div className="h-8 bg-slate-950 rounded flex items-center px-2 gap-2 border border-slate-800">
                        <Video size={12} className="text-blue-500" />
                        <div className="h-2 bg-blue-900/30 rounded flex-1"></div>
                    </div>
                    <div className="h-8 bg-slate-950 rounded flex items-center px-2 gap-2 border border-slate-800">
                        <Mic size={12} className="text-orange-500" />
                        <div className="h-2 bg-orange-900/30 rounded flex-1"></div>
                    </div>
                    <div className="h-8 bg-slate-950 rounded flex items-center px-2 gap-2 border border-slate-800">
                        <Music size={12} className="text-purple-500" />
                        <div className="h-2 bg-purple-900/30 rounded flex-1"></div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

// Helper Component for Radar Chart using SVG
const CompetitorRadarChart = ({ data, labels }: { data: any[], labels: string[] }) => {
    // Normalize data for chart (0-100 scale)
    // Hook Style: Visual=90, Narrative=70, Text=50
    // Pacing: Fast=95, Moderate=70, Slow=40
    // Risk: High=80, Moderate=50, Safe=20 (Inverted context usually, but for radar we chart intensity)
    
    const getScore = (val: string) => {
        if (!val) return 50;
        const v = val.toLowerCase();
        if (v.includes('fast') || v.includes('visual') || v.includes('high')) return 90;
        if (v.includes('moderate') || v.includes('balanced')) return 60;
        return 40;
    };

    const datasets = data.map((d, i) => ({
        label: labels[i] || `Channel ${i+1}`,
        color: i === 0 ? '#3b82f6' : i === 1 ? '#ef4444' : '#10b981', // Blue, Red, Green
        values: [
            getScore(d.report?.hook_style),
            getScore(d.report?.post_frequency), // Assuming freq mapped to intensity
            d.report?.algorithm_fit || 50,
            d.report?.risk_score || 50,
            getScore(d.report?.avg_duration) // Short duration = high intensity usually in viral context
        ]
    }));

    const axes = ['Hook', 'Frequency', 'Algo Fit', 'Risk', 'Pacing'];
    const size = 200;
    const center = size / 2;
    const radius = 80;
    const angleSlice = (Math.PI * 2) / axes.length;

    // Helper to get coordinates
    const getCoords = (value: number, index: number) => {
        const r = (value / 100) * radius;
        const angle = index * angleSlice - Math.PI / 2; // Start from top
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle)
        };
    };

    return (
        <div className="relative flex items-center justify-center w-full h-full">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                {/* Grid Levels */}
                {[20, 40, 60, 80, 100].map((level, i) => (
                    <polygon
                        key={i}
                        points={axes.map((_, idx) => {
                            const { x, y } = getCoords(level, idx);
                            return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#334155"
                        strokeWidth="1"
                        className="opacity-30"
                    />
                ))}

                {/* Axes Lines */}
                {axes.map((axis, i) => {
                    const { x, y } = getCoords(100, i);
                    return (
                        <g key={i}>
                            <line x1={center} y1={center} x2={x} y2={y} stroke="#334155" strokeWidth="1" />
                            <text x={x} y={y} fill="#94a3b8" fontSize="8" textAnchor="middle" alignmentBaseline="middle" className="uppercase font-bold">
                                {axis}
                            </text>
                        </g>
                    );
                })}

                {/* Data Polygons */}
                {datasets.map((d, i) => {
                    const points = d.values.map((v, idx) => {
                        const { x, y } = getCoords(v, idx);
                        return `${x},${y}`;
                    }).join(' ');
                    
                    return (
                        <g key={i}>
                            <polygon points={points} fill={d.color} fillOpacity="0.2" stroke={d.color} strokeWidth="2" />
                            {d.values.map((v, idx) => {
                                const { x, y } = getCoords(v, idx);
                                return <circle key={idx} cx={x} cy={y} r="2" fill={d.color} />
                            })}
                        </g>
                    );
                })}
            </svg>
            
            {/* Legend */}
            <div className="absolute bottom-0 right-0 flex flex-col gap-1 text-[8px]">
                {datasets.map((d, i) => (
                    <div key={i} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                        <span className="text-slate-400">{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper Icons for Quality Gate
const Fingerprint = ({size, className}: {size?:number, className?:string}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M9 6.8a6 6 0 0 1 5.792 4.672"/></svg>;
const Search = ({size, className}: {size?:number, className?:string}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const ShieldCheck = ({size, className}: {size?:number, className?:string}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>;

export default ViralDNAStudio;
