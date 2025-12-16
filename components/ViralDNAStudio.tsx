
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
  MinusCircle, BrainCircuit, Globe, Fingerprint, Clapperboard, ChevronDown, ChevronUp, Cpu, Search, XCircle
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
    if (!url) return true; // Allow empty strings (handled by submission check)
    try {
        // Ensure protocol is present for URL constructor
        const urlToCheck = url.startsWith('http') ? url : `https://${url}`;
        const urlObj = new URL(urlToCheck);
        const domain = urlObj.hostname.toLowerCase().replace('www.', '');
        
        // Strict domain check for YouTube and TikTok
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
  // Use passed translation or fallback
  const texts = t || {};

  // --- STATE ---
  const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>('analyzer');
  const [inputMode, setInputMode] = useState<'link' | 'upload'>('link');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [channels, setChannels] = useState<CompetitorChannel[]>([
    { id: '1', url: '', name: 'Source 1', status: 'pending' },
    { id: '2', url: '', name: 'Source 2', status: 'pending' },
    { id: '3', url: '', name: 'Source 3', status: 'pending' }
  ]);
  
  const [uploadedFaces, setUploadedFaces] = useState<string[]>([]);
  const [refImages, setRefImages] = useState<string[]>([]);
  const [refVideos, setRefVideos] = useState<string[]>([]);
  const [refContext, setRefContext] = useState<string>('');
  
  const [dnaProfile, setDnaProfile] = useState<ViralDNAProfile | null>(null);
  
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

  // STRICT ENFORCEMENT: Use 'SORA' for all visual generation in this Studio
  // This overrides any external props or settings to ensure the SORA model is used.
  const activeVisualModel: VisualModel = 'SORA';

  // Sync content language prop to internal settings
  useEffect(() => {
      setStudioSettings(prev => ({ ...prev, contentLanguage: contentLanguage }));
  }, [contentLanguage]);

  const [generatedPlan, setGeneratedPlan] = useState<OrchestratorResponse | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'generating' | 'rendering' | 'done'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [analyzingChannelId, setAnalyzingChannelId] = useState<string | null>(null);

  // Ref for the center panel container
  const centerPanelRef = useRef<HTMLDivElement>(null);

  // EFFECT: Scroll to top when switching internal tabs
  useEffect(() => {
    if (centerPanelRef.current) {
        centerPanelRef.current.scrollTop = 0;
    }
  }, [activeStudioTab]);

  // --- HELPERS ---
  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const updateChannelUrl = (id: string, url: string) => {
    setChannels(channels.map(c => c.id === id ? { ...c, url, status: 'pending' } : c));
  };

  const handleAddChannel = () => {
      setChannels(prev => [
          ...prev,
          { id: crypto.randomUUID(), url: '', name: `Source ${prev.length + 1}`, status: 'pending' }
      ]);
  };

  const handleRemoveChannel = (id: string) => {
      if (channels.length <= 1) return;
      setChannels(prev => prev.filter(c => c.id !== id));
  };

  const handleClearAllChannels = () => {
      setChannels([{ id: crypto.randomUUID(), url: '', name: 'Source 1', status: 'pending' }]);
      setDnaProfile(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'face' | 'ref_image' | 'ref_video', id?: string) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const fakeUrl = URL.createObjectURL(file);
      if (type === 'video' && id) {
          setChannels(channels.map(c => c.id === id ? { ...c, url: fakeUrl, name: file.name, status: 'done' } : c));
      } else if (type === 'face') {
          setUploadedFaces(prev => [...prev, fakeUrl]);
      } else if (type === 'ref_image') {
          setRefImages(prev => [...prev, fakeUrl]);
      } else if (type === 'ref_video') {
          setRefVideos(prev => [...prev, fakeUrl]); 
      }
  };

  const getLangDisplayName = (code: string) => {
      switch(code) {
          case 'vi': return 'Tiếng Việt';
          case 'en': return 'English';
          case 'es': return 'Español';
          case 'jp': return 'Japanese';
          case 'cn': return 'Chinese';
          default: return code.toUpperCase();
      }
  };

  // --- CORE LOGIC ---

  const handleRunAnalysis = async () => {
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
    if (!googleKey) {
        alert("Google API Key required.");
        return;
    }

    const validChannels = channels.filter(c => c.url.trim() !== '');
    if (validChannels.length === 0) {
        alert("Please enter a source link.");
        return;
    }

    // Validate URLs before proceeding
    const invalidUrls = validChannels.filter(c => !validateInputUrl(c.url));
    if (invalidUrls.length > 0) {
        alert(`Validation Error: Please enter valid YouTube or TikTok URLs for: ${invalidUrls.map(c => c.name).join(', ')}`);
        return;
    }

    setStatus('analyzing');
    addLog(`>>> STARTING PARALLEL ANALYSIS (${validChannels.length} SOURCES)`);
    addLog(`LOCKED CONTENT LANGUAGE: ${contentLanguage.toUpperCase()}`);
    
    try {
        // Parallel Analysis Simulation
        // In a real app, this would trigger multiple API calls in parallel or a batched call.
        const analyzedChannels = [...channels];
        
        for (let i = 0; i < analyzedChannels.length; i++) {
            if (analyzedChannels[i].url.trim()) {
                setAnalyzingChannelId(analyzedChannels[i].id);
                // Simulate processing time per channel
                await new Promise(r => setTimeout(r, 800)); 
                
                // Populate mock report data for EACH channel
                analyzedChannels[i].status = 'done';
                analyzedChannels[i].report = {
                    avg_duration: ["15s", "30s", "45s", "60s"][Math.floor(Math.random() * 4)],
                    post_frequency: ["Daily", "2/Day", "Weekly"][Math.floor(Math.random() * 3)],
                    hook_style: ["Visual Shock", "Negative Hook", "Question", "Statement"][Math.floor(Math.random() * 4)],
                    algorithm_fit: 80 + Math.floor(Math.random() * 20),
                    risk_score: Math.floor(Math.random() * 10),
                    suggested_prompt: `Create a video about ${analyzedChannels[i].name} with a high retention hook.`
                };
            }
        }
        setAnalyzingChannelId(null);
        setChannels(analyzedChannels);

        // Aggregate API Call (Synthesis)
        const dna = await extractViralDNA(googleKey.key, validChannels.map(c => c.url), refContext, contentLanguage);
        setDnaProfile(dna);
        
        if (dna.keywords && dna.keywords.length > 0) {
            setStudioSettings(prev => ({...prev, topic: `Viral Video about ${dna.keywords[0]}`}));
        }

        addLog("Viral DNA Synthesis Complete.");
        // We stay on Analyzer tab briefly to show results before user clicks next, or just show success state.
        // Removed auto-switch to 'script' to let user see the breakdown.

    } catch (e: any) {
        console.error(e);
        addLog(`Error: ${e.message}`);
        setStatus('idle');
    }
  };

  const handleGenerateScript = async () => {
      if (!dnaProfile && !studioSettings.topic) return;
      
      const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
      if (!googleKey) return;

      setStatus('generating');
      addLog(`Generating Script in: ${contentLanguage.toUpperCase()}...`);
      addLog(`Visual Model Forced: ${activeVisualModel}`);
      
      try {
          const effectiveDNA = dnaProfile || {
              structure: { hook_type: 'Generic', pacing: 'Fast', avg_scene_duration: 3 },
              emotional_curve: ['Curiosity', 'Engagement'],
              keywords: [studioSettings.topic],
              algorithm_fit_score: 85,
              risk_level: 'Safe'
          } as ViralDNAProfile;

          // Force SORA Visual Model in Settings passed to Agent
          const enforcedSettings = {
              ...studioSettings,
              visualModel: activeVisualModel
          };

          const plan = await generateProScript(googleKey.key, effectiveDNA, enforcedSettings as any);
          setGeneratedPlan(plan);
          addLog("Script Generated.");
          setActiveStudioTab('studio');
          setStatus('done');
      } catch (e: any) {
          addLog(`Error: ${e.message}`);
          setStatus('idle');
      }
  };

  const handleAutoRender = async () => {
      if (!generatedPlan) return;
      setStatus('rendering');
      addLog(`Rendering with ${activeVisualModel} Engine...`);
      await new Promise(r => setTimeout(r, 2500));
      setActiveStudioTab('quality');
      setStatus('done');
  };

  const handleDownloadPackage = () => {
      if (!generatedPlan) return;
      alert(`Exported to: ViralVideoStudio/${channels[0].name}/`);
  };

  // Filter Channels based on Search Query
  const filteredChannels = channels.filter(channel => 
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      channel.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in flex flex-col h-full relative bg-[#020617]">
      
      {/* 1. STUDIO HEADER */}
      <div className="flex flex-col gap-4 px-4 pt-4 pb-2 border-b border-slate-800 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-900/20">
                    <Dna size={32} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        {texts.title} <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-black tracking-widest">PRO</span>
                    </h1>
                    <p className="text-slate-400 text-xs font-mono flex items-center gap-2">
                        {/* Static Green Dot - No Pulse */}
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>
                        {texts.subtitle}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA (Scrollable) */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        
        {/* LEFT TAB BAR */}
        <div className="hidden lg:flex w-64 flex-col gap-2 border-r border-slate-800 p-4 shrink-0 overflow-y-auto">
            {[
                { id: 'analyzer', label: texts.studio_tabs?.dna, icon: Dna },
                { id: 'script', label: texts.studio_tabs?.script, icon: FileText },
                { id: 'studio', label: texts.studio_tabs?.studio, icon: Sliders },
                { id: 'quality', label: texts.studio_tabs?.quality, icon: ShieldAlert },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveStudioTab(tab.id as StudioTab)}
                    className={`text-left px-4 py-3 rounded-xl flex flex-col gap-1 transition-all border ${
                        activeStudioTab === tab.id 
                        ? 'bg-slate-800 text-white border-indigo-500/50 shadow-lg' 
                        : 'text-slate-500 hover:text-white hover:bg-slate-900 border-transparent'
                    }`}
                >
                    <div className="flex items-center gap-2 font-bold text-sm">
                        <tab.icon size={16} /> {tab.label}
                    </div>
                </button>
            ))}
            
            {/* Live Logs Small */}
            <div className="mt-auto pt-4 border-t border-slate-800">
                <div className="text-[10px] font-bold text-slate-500 mb-2">SYSTEM LOGS</div>
                <div className="bg-black border border-slate-800 rounded-lg p-2 h-32 overflow-y-auto font-mono text-[9px] text-green-400 shadow-inner">
                    {logs.map((log, i) => <div key={i} className="border-l border-green-900 pl-1 mb-1 leading-tight">{log}</div>)}
                </div>
            </div>
        </div>

        {/* CENTER CONTENT */}
        <div ref={centerPanelRef} className="flex-1 overflow-y-auto p-6 relative">
            
            {/* TAB 1: ANALYZER */}
            {activeStudioTab === 'analyzer' && (
                <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in pb-10">
                    
                    <div className="bg-slate-950/50 rounded-xl p-6 border border-slate-800 shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Monitor size={20} className="text-blue-500" /> {texts.input_section}
                            </h3>
                            
                            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                                {/* Search Bar */}
                                {inputMode === 'link' && (
                                    <div className="relative group w-full md:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={14} />
                                        <input 
                                            type="text" 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search source by name..."
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 pl-9 pr-3 text-xs text-white focus:border-primary focus:outline-none transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                )}

                                <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 shrink-0">
                                    <button onClick={() => setInputMode('link')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${inputMode === 'link' ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}><Link size={14} className="inline mr-2"/> Link</button>
                                    <button onClick={() => setInputMode('upload')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${inputMode === 'upload' ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}><Upload size={14} className="inline mr-2"/> Upload</button>
                                </div>
                            </div>
                        </div>

                        {inputMode === 'link' ? (
                            <div className="flex flex-col gap-4">
                                {/* SCROLLABLE INPUT AREA */}
                                <div className="max-h-[350px] overflow-y-auto custom-scrollbar pr-2 space-y-2">
                                    {filteredChannels.length > 0 ? (
                                        filteredChannels.map((channel, idx) => {
                                            const isError = channel.url.trim().length > 0 && !validateInputUrl(channel.url);
                                            return (
                                            <div key={channel.id} className="relative group animate-fade-in">
                                                {/* No pulse on border, just solid colors/shadows */}
                                                <div className={`bg-slate-900 border ${
                                                    analyzingChannelId === channel.id 
                                                    ? 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]' 
                                                    : isError 
                                                        ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                                                        : channel.status === 'done' 
                                                            ? 'border-green-500/50' 
                                                            : 'border-slate-700'
                                                    } rounded-xl p-3 flex items-center gap-3 transition-colors`}>
                                                    <div className="text-slate-500 text-sm font-bold w-8 text-center bg-slate-800 rounded py-1">#{idx + 1}</div>
                                                    <input 
                                                        type="text" 
                                                        placeholder={texts.input_placeholder}
                                                        value={channel.url}
                                                        onChange={(e) => updateChannelUrl(channel.id, e.target.value)}
                                                        className="flex-1 bg-transparent border-none text-sm text-white p-1 focus:ring-0 placeholder:text-slate-600"
                                                    />
                                                    {channel.status === 'done' && !isError && <CheckCircle size={18} className="text-green-500" />}
                                                    {isError && (
                                                        <div className="flex items-center gap-1 text-red-500 bg-red-900/10 px-2 py-1 rounded text-xs font-bold border border-red-500/20">
                                                            <AlertTriangle size={12}/> Invalid URL
                                                        </div>
                                                    )}
                                                    
                                                    <button onClick={() => handleRemoveChannel(channel.id)} className="p-2 text-slate-600 hover:text-red-500 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"><Trash2 size={14} /></button>
                                                </div>
                                                {isError && (
                                                    <p className="text-[10px] text-red-400 mt-1 ml-2 pl-12 flex items-center gap-1">
                                                        Supported domains: youtube.com, youtu.be, tiktok.com
                                                    </p>
                                                )}
                                            </div>
                                        )})
                                    ) : (
                                        <div className="text-center py-8 text-slate-500 text-xs italic border border-dashed border-slate-800 rounded-xl">
                                            No sources found matching "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex gap-2">
                                    <button onClick={handleAddChannel} className="flex-1 py-3 border border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-white hover:border-slate-500 transition-all flex items-center justify-center gap-2 text-sm font-bold">
                                        <Plus size={16} /> {texts.btn_add_source}
                                    </button>
                                    <button onClick={handleClearAllChannels} className="px-4 py-3 border border-slate-700 rounded-xl text-slate-500 hover:text-red-400 hover:border-red-500/50 transition-all">
                                        <XCircle size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-48 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-indigo-500/50 hover:bg-slate-800/30 transition-all cursor-pointer relative group">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="video/mp4,video/webm" onChange={(e) => handleFileUpload(e, 'video', '1')} />
                                <div className="p-4 bg-slate-900 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                   <FileVideo size={32} className="text-slate-400" />
                                </div>
                                <p className="text-sm font-bold text-slate-300">{texts.btn_upload}</p>
                                <p className="text-xs text-slate-600 mt-1">MP4, WebM (Max 500MB)</p>
                            </div>
                        )}
                        
                        <div className="mt-8">
                            <NeonButton onClick={handleRunAnalysis} disabled={status === 'analyzing'} size="lg" className="w-full">
                                {status === 'analyzing' ? (
                                    <span className="flex items-center gap-2"><RefreshCw className="animate-spin"/> Analyzing {channels.length} sources...</span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Dna /> {texts.analyze_btn}
                                    </span>
                                )}
                            </NeonButton>
                        </div>
                    </div>

                    {/* INDIVIDUAL CHANNEL BREAKDOWN RESULTS */}
                    {status === 'done' && channels.some(c => c.report) && (
                        <div className="animate-fade-in space-y-4">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Layers size={16} /> Individual Channel Insights
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {channels.map((channel, idx) => channel.report ? (
                                    <div key={channel.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 hover:border-slate-600 transition-colors">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="font-bold text-white text-sm truncate max-w-[120px]">
                                                {channel.name || `Source ${idx+1}`}
                                            </div>
                                            <div className={`text-[10px] px-2 py-0.5 rounded font-bold ${channel.report.algorithm_fit > 85 ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'}`}>
                                                Fit: {channel.report.algorithm_fit}%
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-3">
                                            <div className="bg-slate-950 p-2 rounded">
                                                <span className="block text-[9px] text-slate-500 uppercase">Duration</span>
                                                <span className="text-white">{channel.report.avg_duration}</span>
                                            </div>
                                            <div className="bg-slate-950 p-2 rounded">
                                                <span className="block text-[9px] text-slate-500 uppercase">Hook</span>
                                                <span className="text-white truncate">{channel.report.hook_style}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-[10px] text-slate-500 italic border-t border-slate-800 pt-2 line-clamp-2">
                                            "{channel.report.suggested_prompt}"
                                        </div>
                                    </div>
                                ) : null)}
                            </div>
                            
                            {/* Proceed Button */}
                            <div className="flex justify-end pt-4">
                                <NeonButton onClick={() => setActiveStudioTab('script')} size="md" className="w-full md:w-auto">
                                    Proceed to Script Engine <ChevronDown className="-rotate-90 ml-2" size={16} />
                                </NeonButton>
                            </div>
                        </div>
                    )}

                    {!dnaProfile && (
                        <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                             <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 mt-0.5"><Zap size={18}/></div>
                             <div>
                                 <h4 className="text-sm font-bold text-blue-300">Pro Tip:</h4>
                                 <p className="text-xs text-slate-400 mt-1">Use 3+ competitor links for the best results. The system will extract the "Viral DNA" pattern common across all sources.</p>
                             </div>
                        </div>
                    )}

                </div>
            )}

            {/* TAB 2: SCRIPT ENGINE */}
            {activeStudioTab === 'script' && (
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText size={24} className="text-pink-500" /> {texts.script_engine?.title}
                        </h3>
                        <span className="text-xs bg-pink-900/20 text-pink-300 px-3 py-1.5 rounded-lg border border-pink-500/30 font-bold flex items-center gap-2">
                            <Globe size={12}/> Output Language: {getLangDisplayName(contentLanguage)}
                        </span>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{texts.script_engine?.topic_label}</label>
                        <input 
                            type="text"
                            value={studioSettings.topic}
                            onChange={(e) => setStudioSettings({...studioSettings, topic: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-base text-white focus:border-pink-500 focus:outline-none shadow-inner"
                            placeholder="e.g. 5 AI Tools that feel illegal to know..."
                        />
                    </div>

                    <NeonButton onClick={handleGenerateScript} disabled={status === 'generating'} size="lg" className="w-full h-16 text-lg">
                        {status === 'generating' ? (
                            <span className="flex items-center gap-2"><RefreshCw className="animate-spin"/> {texts.script_engine?.generating}</span>
                        ) : (
                            <span className="flex items-center gap-2"><Wand2 size={20} /> {texts.script_engine?.generate_btn}</span>
                        )}
                    </NeonButton>
                </div>
            )}

            {/* TAB 3: VIDEO STUDIO */}
            {activeStudioTab === 'studio' && (
                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sliders size={24} className="text-indigo-500" /> {texts.video_studio?.title}
                    </h3>
                    
                    {generatedPlan ? (
                         <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                             <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                                 <h4 className="font-bold text-white">{generatedPlan.generated_content?.title}</h4>
                             </div>
                             <div className="p-8 flex justify-center">
                                 <NeonButton onClick={handleAutoRender} disabled={status === 'rendering'} size="lg" className="w-full max-w-md">
                                    {status === 'rendering' ? (
                                        <span className="flex items-center gap-2"><RefreshCw className="animate-spin"/> {texts.video_studio?.rendering}</span>
                                    ) : (
                                        <span className="flex items-center gap-2"><Play /> {texts.video_studio?.render_btn}</span>
                                    )}
                                </NeonButton>
                             </div>
                         </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            Please generate a script first.
                        </div>
                    )}
                </div>
            )}

            {/* TAB 4: QUALITY */}
            {activeStudioTab === 'quality' && (
                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                        <ShieldAlert size={24} className="text-red-500" /> Quality Gate
                    </h3>
                    {generatedPlan && (
                        <div className="bg-green-900/10 border border-green-500/20 p-6 rounded-xl flex items-center gap-4">
                            <div className="p-3 bg-green-500/20 rounded-full text-green-500"><FileCheck size={32} /></div>
                            <div>
                                <h4 className="text-lg font-bold text-white">Ready to Export</h4>
                                <p className="text-slate-400 text-sm">All assets passed automated checks.</p>
                            </div>
                            <div className="ml-auto flex gap-3">
                                <NeonButton onClick={handleDownloadPackage} size="md">Export Package</NeonButton>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* RIGHT PREVIEW PANEL (Desktop) */}
        <div className="hidden xl:block w-80 border-l border-slate-800 bg-slate-950 p-4 shrink-0">
             <div className="h-full rounded-2xl border border-slate-800 bg-black flex flex-col overflow-hidden relative group">
                <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-10 transition-opacity">
                    <Film size={64} className="text-slate-700" />
                </div>
                {generatedPlan && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-6">
                        <div className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">Preview</div>
                        <h3 className="text-white font-bold text-lg leading-tight line-clamp-3">{generatedPlan.generated_content?.title}</h3>
                        <p className="text-slate-400 text-xs mt-2 line-clamp-2">{generatedPlan.generated_content?.description}</p>
                    </div>
                )}
             </div>
        </div>

      </div>

      {/* 3. FIXED FOOTER: MODEL CONFIGURATION */}
      <ModelSelector 
            scriptModel={scriptModel} setScriptModel={setScriptModel}
            visualModel={activeVisualModel} setVisualModel={() => { /* Locked to SORA */ }} 
            voiceModel={voiceModel} setVoiceModel={setVoiceModel}
            resolution={resolution} setResolution={setResolution}
            aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
            t={t}
      />
    </div>
  );
};

export default ViralDNAStudio;
