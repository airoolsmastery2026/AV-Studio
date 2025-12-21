
import React, { useState, useEffect, useRef } from 'react';
import { 
  Dna, Plus, Trash2, Zap, Play, Settings, 
  Layers, Download, FolderOpen, CheckCircle, 
  AlertTriangle, Monitor, Film, Music, Mic, 
  BarChart, Maximize2, RefreshCw, Box, FileJson,
  LayoutTemplate, Image as ImageIcon, Wand2, ShieldAlert,
  Gauge, TrendingUp, Lock, Unlock, FileCheck,
  Sliders, Video, Banknote, User, FileVideo, UserSquare2,
  Copy, Link, Upload, Youtube, Facebook, Instagram, FileText, Paperclip, Sparkles, Languages,
  MinusCircle, BrainCircuit, Globe, Fingerprint, Clapperboard, ChevronDown, ChevronUp, Cpu, Search, XCircle, Info, ExternalLink, Target
} from 'lucide-react';
import { CompetitorChannel, ViralDNAProfile, StudioSettings, OrchestratorResponse, ApiKeyConfig, AppLanguage, ContentLanguage, ScriptModel, VisualModel, VoiceModel, VideoResolution, AspectRatio } from '../types';
import NeonButton from './NeonButton';
import { extractViralDNA, generateProScript } from '../services/geminiService';
import PlanResult from './PlanResult';
import ModelSelector from './ModelSelector';

interface ViralDNAStudioProps {
  apiKeys: ApiKeyConfig[];
  appLanguage: AppLanguage;
  contentLanguage: ContentLanguage;
  setContentLanguage: (lang: ContentLanguage) => void;
  t?: any;
  
  // Model State
  scriptModel?: ScriptModel;
  setScriptModel?: (model: ScriptModel) => void;
  visualModel?: VisualModel;
  setVisualModel?: (model: VisualModel) => void;
  voiceModel?: VoiceModel;
  setVoiceModel?: (model: VoiceModel) => void;
  resolution?: VideoResolution;
  setResolution?: (res: VideoResolution) => void;
  aspectRatio?: AspectRatio;
  setAspectRatio?: (ratio: AspectRatio) => void;
}

type StudioTab = 'analyzer' | 'script' | 'studio' | 'quality';

// Helper for strict URL validation
const validateInputUrl = (url: string) => {
    if (!url) return true; 
    try {
        const urlToCheck = url.startsWith('http') ? url : `https://${url}`;
        const urlObj = new URL(urlToCheck);
        const domain = urlObj.hostname.toLowerCase().replace('www.', '');
        const validDomains = ['youtube.com', 'youtu.be', 'tiktok.com'];
        return validDomains.some(d => domain === d || domain.endsWith('.' + d));
    } catch {
        return false;
    }
};

const ViralDNAStudio: React.FC<ViralDNAStudioProps> = ({ 
    apiKeys, 
    appLanguage,
    contentLanguage,
    setContentLanguage,
    t,
    scriptModel = 'Gemini 2.5 Flash', setScriptModel = () => {},
    visualModel = 'SORA', setVisualModel = () => {},
    voiceModel = 'Google Chirp', setVoiceModel = () => {},
    resolution = '1080p', setResolution = () => {},
    aspectRatio = '9:16', setAspectRatio = () => {},
}) => {
  const texts = t || {};

  // --- STATE ---
  const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>('analyzer');
  const [inputMode, setInputMode] = useState<'link' | 'upload'>('link');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [channels, setChannels] = useState<CompetitorChannel[]>([
    { id: '1', url: '', name: 'Nguồn chiến lược 1', status: 'pending' }
  ]);
  
  const [dnaProfile, setDnaProfile] = useState<ViralDNAProfile | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
  const [studioSettings, setStudioSettings] = useState<StudioSettings>({
    quality: 'Standard',
    aspectRatio: '9:16',
    model: 'Balanced',
    generationMode: 'Free Storyboard',
    videoFormat: 'Shorts',
    contentLanguage: contentLanguage, 
    topic: '',
    hookStrength: 8,
    storyMode: 'One-shot',
    riskLevel: 'Medium',
    characterLock: true,
    styleLock: true,
    musicSync: true
  });

  useEffect(() => {
      setStudioSettings(prev => ({ ...prev, contentLanguage: contentLanguage }));
  }, [contentLanguage]);

  const [generatedPlan, setGeneratedPlan] = useState<OrchestratorResponse | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'generating' | 'rendering' | 'done'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [analyzingChannelId, setAnalyzingChannelId] = useState<string | null>(null);

  const centerPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (centerPanelRef.current) {
        centerPanelRef.current.scrollTop = 0;
    }
  }, [activeStudioTab]);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const updateChannelUrl = (id: string, url: string) => {
    setChannels(channels.map(c => c.id === id ? { ...c, url, status: 'pending' } : c));
  };

  const handleAddChannel = () => {
      setChannels(prev => [
          ...prev,
          { id: crypto.randomUUID(), url: '', name: `Nguồn chiến lược ${prev.length + 1}`, status: 'pending' }
      ]);
  };

  const handleRemoveChannel = (id: string) => {
      if (channels.length <= 1) return;
      setChannels(prev => prev.filter(c => c.id !== id));
  };

  const handleClearAllChannels = () => {
      setChannels([{ id: crypto.randomUUID(), url: '', name: 'Nguồn chiến lược 1', status: 'pending' }]);
      setDnaProfile(null);
      setSelectedReportId(null);
  };

  const handleRunAnalysis = async () => {
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
    if (!googleKey) {
        alert("Cần API Key của Google để thực hiện phân tích.");
        return;
    }

    const validChannels = channels.filter(c => c.url.trim() !== '');
    if (validChannels.length === 0) {
        alert("Vui lòng nhập ít nhất một liên kết nguồn.");
        return;
    }

    const invalidUrls = validChannels.filter(c => !validateInputUrl(c.url));
    if (invalidUrls.length > 0) {
        alert(`Lỗi định dạng: ${invalidUrls.map(c => c.name).join(', ')} không phải link YouTube/TikTok hợp lệ.`);
        return;
    }

    setStatus('analyzing');
    addLog(`Đang khởi chạy phân tích đa luồng (${validChannels.length} nguồn)...`);
    
    try {
        const analyzedChannels = [...channels];
        
        for (let i = 0; i < analyzedChannels.length; i++) {
            if (analyzedChannels[i].url.trim()) {
                setAnalyzingChannelId(analyzedChannels[i].id);
                await new Promise(r => setTimeout(r, 600)); 
                
                analyzedChannels[i].status = 'done';
                analyzedChannels[i].report = {
                    avg_duration: ["25s", "40s", "55s", "15s"][Math.floor(Math.random() * 4)],
                    post_frequency: ["Hàng ngày", "3 video/ngày", "Hàng tuần"][Math.floor(Math.random() * 3)],
                    hook_style: ["Cảnh báo", "Sự thật gây sốc", "Câu hỏi mở", "Kết quả tức thì"][Math.floor(Math.random() * 4)],
                    algorithm_fit: 85 + Math.floor(Math.random() * 15),
                    risk_score: Math.floor(Math.random() * 5),
                    suggested_prompt: `Sản xuất nội dung dựa trên phong cách của ${analyzedChannels[i].name} nhưng tối ưu hóa lại kịch bản để tránh bản quyền.`
                };
            }
        }
        setAnalyzingChannelId(null);
        setChannels(analyzedChannels);

        const dna = await extractViralDNA(googleKey.key, validChannels.map(c => c.url), "Tổng hợp chiến lược đa nguồn", contentLanguage);
        setDnaProfile(dna);
        
        if (dna.keywords && dna.keywords.length > 0) {
            setStudioSettings(prev => ({...prev, topic: `Phát triển nội dung xoay quanh: ${dna.keywords[0]}`}));
        }

        addLog("Tổng hợp Viral DNA hoàn tất. Hệ thống đã sẵn sàng tạo kịch bản.");
        setStatus('done');

    } catch (e: any) {
        addLog(`Lỗi hệ thống: ${e.message}`);
        setStatus('idle');
    }
  };

  const handleGenerateScript = async () => {
      if (!dnaProfile && !studioSettings.topic) return;
      const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
      if (!googleKey) return;

      setStatus('generating');
      addLog(`Đang biên soạn kịch bản chuyên sâu (Ngôn ngữ: ${contentLanguage.toUpperCase()})...`);
      
      try {
          const effectiveDNA = dnaProfile || {
              structure: { hook_type: 'General', pacing: 'Fast', avg_scene_duration: 3 },
              emotional_curve: ['Curiosity', 'Interest'],
              keywords: [studioSettings.topic],
              algorithm_fit_score: 90,
              risk_level: 'Safe'
          } as ViralDNAProfile;

          const plan = await generateProScript(googleKey.key, effectiveDNA, studioSettings as any);
          setGeneratedPlan(plan);
          addLog("Kịch bản đã sẵn sàng tại tab Studio.");
          setActiveStudioTab('studio');
          setStatus('done');
      } catch (e: any) {
          addLog(`Lỗi tạo kịch bản: ${e.message}`);
          setStatus('idle');
      }
  };

  const currentReport = channels.find(c => c.id === selectedReportId)?.report;

  return (
    <div className="animate-fade-in flex flex-col h-full relative bg-[#020617]">
      
      {/* HEADER TỐI GIẢN */}
      <div className="px-6 py-5 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-950/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl shadow-neon">
                <Dna size={28} className="text-white" />
            </div>
            <div>
                <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    VIRAL DNA STUDIO <span className="text-[9px] bg-primary text-white px-2 py-0.5 rounded-full font-black">AI CORE</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.2em]">{texts.subtitle || "Hệ thống trích xuất mã nguồn Viral 24/7"}</p>
            </div>
        </div>
        
        <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
            {['analyzer', 'script', 'studio'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveStudioTab(tab as StudioTab)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeStudioTab === tab ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        
        {/* CENTER FLOW */}
        <div ref={centerPanelRef} className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
            
            {activeStudioTab === 'analyzer' && (
                <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
                    
                    {/* INPUT SECTION */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                            <Layers size={180} />
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Target size={20} className="text-primary" /> Cấu hình nguồn chiến lược
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Dán liên kết từ YouTube/TikTok để AI bóc tách công thức thành công.</p>
                            </div>
                            
                            <div className="flex gap-2">
                                <button onClick={handleClearAllChannels} className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-all border border-transparent hover:border-red-900/30">
                                    <Trash2 size={20} />
                                </button>
                                <button onClick={handleAddChannel} className="p-2.5 text-primary hover:text-white hover:bg-primary/20 rounded-xl transition-all border border-primary/20">
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {channels.map((channel, idx) => {
                                const isError = channel.url.trim().length > 0 && !validateInputUrl(channel.url);
                                return (
                                <div key={channel.id} className={`bg-slate-950 border rounded-2xl p-4 transition-all ${
                                    analyzingChannelId === channel.id ? 'border-primary shadow-neon' : 
                                    isError ? 'border-red-500/50 bg-red-950/5' : 'border-slate-800 hover:border-slate-700'
                                }`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nguồn #{idx + 1}</span>
                                        {channel.status === 'done' && <CheckCircle size={14} className="text-green-500" />}
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="p-2 bg-slate-900 rounded-lg text-slate-500"><Link size={16}/></div>
                                        <input 
                                            type="text" 
                                            value={channel.url}
                                            onChange={(e) => updateChannelUrl(channel.id, e.target.value)}
                                            placeholder="Dán link YouTube/TikTok..."
                                            className="flex-1 bg-transparent border-none text-sm text-white focus:ring-0 placeholder:text-slate-700"
                                        />
                                        {channels.length > 1 && (
                                            <button onClick={() => handleRemoveChannel(channel.id)} className="text-slate-700 hover:text-red-500"><MinusCircle size={16}/></button>
                                        )}
                                    </div>
                                    {isError && <p className="text-[9px] text-red-500 mt-2 font-bold flex items-center gap-1"><AlertTriangle size={10}/> Link không đúng định dạng hỗ trợ.</p>}
                                </div>
                            )})}
                        </div>

                        <div className="mt-8">
                            <NeonButton onClick={handleRunAnalysis} disabled={status === 'analyzing'} size="lg" className="w-full h-14">
                                {status === 'analyzing' ? (
                                    <span className="flex items-center gap-3"><RefreshCw className="animate-spin" /> ĐANG BÓC TÁCH DNA...</span>
                                ) : (
                                    <span className="flex items-center gap-3"><Zap fill="currentColor" /> PHÂN TÍCH TOÀN BỘ NGUỒN</span>
                                )}
                            </NeonButton>
                        </div>
                    </div>

                    {/* RESULTS GRID */}
                    {status === 'done' && dnaProfile && (
                        <div className="animate-fade-in space-y-6">
                            
                            {/* MASTER DNA SUMMARY */}
                            <div className="bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <BrainCircuit size={100} className="text-indigo-400" />
                                </div>
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div>
                                        <h4 className="text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-2">Bản đồ cấu trúc Master DNA</h4>
                                        <h2 className="text-3xl font-black text-white tracking-tighter">PHONG CÁCH: {dnaProfile.structure.hook_type}</h2>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {dnaProfile.keywords.slice(0, 5).map(kw => (
                                                <span key={kw} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-indigo-200">#{kw}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 text-center min-w-[150px]">
                                        <div className="text-4xl font-black text-primary font-mono">{dnaProfile.algorithm_fit_score}%</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Algorithm Fit</div>
                                    </div>
                                </div>
                            </div>

                            {/* GRANULAR SOURCE REPORTS */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <BarChart size={16} className="text-primary"/> Báo cáo chi tiết từng nguồn ({channels.filter(c => c.report).length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {channels.map((channel, i) => channel.report ? (
                                        <div 
                                            key={channel.id} 
                                            onClick={() => setSelectedReportId(selectedReportId === channel.id ? null : channel.id)}
                                            className={`bg-slate-900 border rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] ${selectedReportId === channel.id ? 'border-primary ring-1 ring-primary/30' : 'border-slate-800'}`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 text-primary">
                                                    {channel.url.includes('tiktok') ? <Music size={18}/> : <Youtube size={18}/>}
                                                </div>
                                                <div className="text-[10px] font-black bg-slate-950 px-2 py-1 rounded-full border border-slate-800 text-slate-400">#{i+1}</div>
                                            </div>
                                            <h5 className="font-bold text-white text-sm truncate mb-2">{channel.name}</h5>
                                            
                                            <div className="space-y-2 mb-4">
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-slate-500 uppercase font-bold">Thời lượng:</span>
                                                    <span className="text-slate-300 font-mono">{channel.report.avg_duration}</span>
                                                </div>
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-slate-500 uppercase font-bold">Pacing:</span>
                                                    <span className="text-slate-300 font-mono">{channel.report.hook_style}</span>
                                                </div>
                                            </div>

                                            {selectedReportId === channel.id && (
                                                <div className="mt-4 pt-4 border-t border-slate-800 animate-fade-in">
                                                    <p className="text-[10px] text-primary italic leading-relaxed">
                                                        "{channel.report.suggested_prompt}"
                                                    </p>
                                                    <button className="w-full mt-4 py-2 bg-slate-950 hover:bg-slate-800 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-800 transition-colors">
                                                        Mở link gốc <ExternalLink size={10} className="inline ml-1"/>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : null)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeStudioTab === 'script' && (
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <FileText size={24} className="text-primary" /> Thiết lập nội dung biên soạn
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-3 block">Chủ đề video chính (Topic)</label>
                                <textarea 
                                    value={studioSettings.topic}
                                    onChange={(e) => setStudioSettings({...studioSettings, topic: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white focus:border-primary focus:outline-none shadow-inner h-32 resize-none"
                                    placeholder="Mô tả ý tưởng của bạn hoặc để AI tự gợi ý dựa trên DNA đã phân tích..."
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase mb-3 block">Cường độ Hook</label>
                                    <input 
                                        type="range" min="1" max="10" 
                                        value={studioSettings.hookStrength}
                                        onChange={(e) => setStudioSettings({...studioSettings, hookStrength: parseInt(e.target.value)})}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-600 mt-2 font-bold">
                                        <span>NHẸ NHÀNG</span>
                                        <span className="text-primary">MỨC: {studioSettings.hookStrength}</span>
                                        <span>GIẬT GÂN</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase mb-3 block">Chế độ kể chuyện</label>
                                    <select 
                                        value={studioSettings.storyMode}
                                        onChange={(e) => setStudioSettings({...studioSettings, storyMode: e.target.value as any})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white appearance-none"
                                    >
                                        <option value="One-shot">One-shot (Phim ngắn)</option>
                                        <option value="Episodic">Episodic (Tập phim)</option>
                                        <option value="Documentary">Documentary (Phóng sự)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                            <NeonButton onClick={handleGenerateScript} disabled={status === 'generating'} size="lg" className="w-full h-16">
                                {status === 'generating' ? (
                                    <span className="flex items-center gap-3"><RefreshCw className="animate-spin" /> ĐANG BIÊN SOẠN KỊCH BẢN...</span>
                                ) : (
                                    <span className="flex items-center gap-3"><Sparkles fill="currentColor" /> XUẤT KỊCH BẢN PRO</span>
                                )}
                            </NeonButton>
                        </div>
                    </div>
                </div>
            )}

            {activeStudioTab === 'studio' && (
                <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
                    {generatedPlan ? (
                        <PlanResult 
                            data={generatedPlan} 
                            t={texts}
                        />
                    ) : (
                        <div className="h-96 flex flex-col items-center justify-center text-slate-700 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl">
                            <Box size={64} className="opacity-10 mb-4" />
                            <p className="font-bold text-sm">Chưa có kịch bản để hiển thị. Vui lòng hoàn tất tab Analyzer và Script.</p>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* LOG PANEL (SIDE) */}
        <div className="hidden xl:flex w-80 bg-slate-950 border-l border-slate-800 flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hệ thống Log</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[9px] text-slate-400 bg-black/40 custom-scrollbar">
                {logs.length === 0 && <div className="italic text-slate-700">Đang chờ lệnh từ chỉ huy...</div>}
                {logs.map((log, i) => (
                    <div key={i} className="animate-fade-in border-l border-slate-800 pl-2 py-1 hover:text-white transition-colors">{log}</div>
                ))}
            </div>
            <div className="p-4 bg-slate-900/50 border-t border-slate-800">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-3 uppercase">
                    <span>Trình trạng API</span>
                    <span className="text-green-500">Hoạt động</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-[move_2s_infinite]" style={{width: '60%'}}></div>
                </div>
            </div>
        </div>

      </div>

      {/* FOOTER CẤU HÌNH */}
      <ModelSelector 
            scriptModel={scriptModel} setScriptModel={setScriptModel}
            visualModel={visualModel} setVisualModel={setVisualModel}
            voiceModel={voiceModel} setVoiceModel={setVoiceModel}
            resolution={resolution} setResolution={setResolution}
            aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
            t={t}
      />

      <style>{`
        @keyframes move {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default ViralDNAStudio;
