
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
  MinusCircle, BrainCircuit, Globe, Fingerprint, Clapperboard, ChevronDown, ChevronUp, Cpu
} from 'lucide-react';
import { CompetitorChannel, ViralDNAProfile, StudioSettings, OrchestratorResponse, ApiKeyConfig, AppLanguage, ContentLanguage, ScriptModel, VisualModel, VoiceModel, VideoResolution, AspectRatio } from '../types';
import NeonButton from './NeonButton';
import { extractViralDNA, generateProScript } from '../services/geminiService';
import PlanResult from './PlanResult';
import ModelSelector from './ModelSelector';
import ModelFlowDiagram from './ModelFlowDiagram';

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

type StudioTab = 'cloner' | 'script' | 'studio' | 'quality';

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
  const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>('cloner');
  const [inputMode, setInputMode] = useState<'link' | 'upload'>('link');
  const [showModelConfig, setShowModelConfig] = useState(false);
  
  const [channels, setChannels] = useState<CompetitorChannel[]>([
    { id: '1', url: '', name: 'Source 1', status: 'pending' },
    { id: '2', url: '', name: 'Source 2', status: 'pending' }
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

  // Force SORA Visual Model Logic
  const activeVisualModel = 'SORA';
  // We ignore external visualModel changes for this component to enforce SORA

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

    setStatus('analyzing');
    addLog(`>>> STARTING STRUCTURAL ANALYSIS`);
    addLog(`LOCKED CONTENT LANGUAGE: ${contentLanguage.toUpperCase()}`);
    
    try {
        // Simulation
        const analyzedChannels = [...channels];
        for (let i = 0; i < analyzedChannels.length; i++) {
            if (analyzedChannels[i].url.trim()) {
                setAnalyzingChannelId(analyzedChannels[i].id);
                await new Promise(r => setTimeout(r, 1000));
                analyzedChannels[i].status = 'done';
            }
        }
        setAnalyzingChannelId(null);
        setChannels(analyzedChannels);

        // API Call
        const dna = await extractViralDNA(googleKey.key, validChannels.map(c => c.url), refContext, contentLanguage);
        setDnaProfile(dna);
        
        if (dna.keywords && dna.keywords.length > 0) {
            setStudioSettings(prev => ({...prev, topic: `Viral Video about ${dna.keywords[0]}`}));
        }

        addLog("Viral DNA Structure Extracted.");
        setActiveStudioTab('script');

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

          // Force SORA Visual Model
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

  const handleAutoClone = async () => {
      if (!generatedPlan) return;
      setStatus('rendering');
      addLog(`Rendering with ${activeVisualModel}...`);
      await new Promise(r => setTimeout(r, 2500));
      setActiveStudioTab('quality');
      setStatus('done');
  };

  const handleDownloadPackage = () => {
      if (!generatedPlan) return;
      alert(`Exported to: ViralVideoStudio/${channels[0].name}/`);
  };

  return (
    <div className="animate-fade-in pb-12 flex flex-col h-[calc(100vh-100px)]">
      
      {/* 1. STUDIO HEADER (CLEAN & DUAL LANGUAGE) */}
      <div className="flex flex-col gap-4 mb-6 border-b border-slate-800 pb-4 shrink-0">
        
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
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        {texts.subtitle}
                    </p>
                </div>
            </div>

            {/* CONTENT LANGUAGE SELECTOR REMOVED AS REQUESTED */}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
        
        {/* LEFT PANEL */}
        <div className="hidden lg:flex lg:col-span-2 flex-col gap-2 border-r border-slate-800 pr-4">
            {[
                { id: 'cloner', label: texts.tabs?.dna, icon: Dna },
                { id: 'script', label: texts.tabs?.script, icon: FileText },
                { id: 'studio', label: texts.tabs?.studio, icon: Sliders },
                { id: 'quality', label: texts.tabs?.quality, icon: ShieldAlert },
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
        </div>

        {/* CENTER PANEL */}
        <div ref={centerPanelRef} className="lg:col-span-7 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[500px] relative">
                
                {/* TAB 1: ANALYZER */}
                {activeStudioTab === 'cloner' && (
                    <div className="flex flex-col gap-6 animate-fade-in">
                        
                        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Monitor size={16} className="text-blue-500" /> {texts.input_section}
                                </h3>
                                <div className="flex gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                                    <button onClick={() => setInputMode('link')} className={`px-3 py-1 rounded text-[10px] font-bold ${inputMode === 'link' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}><Link size={12} className="inline mr-1"/> Link</button>
                                    <button onClick={() => setInputMode('upload')} className={`px-3 py-1 rounded text-[10px] font-bold ${inputMode === 'upload' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}><Upload size={12} className="inline mr-1"/> Upload</button>
                                </div>
                            </div>

                            {inputMode === 'link' ? (
                                <div className="space-y-3">
                                    {channels.map((channel, idx) => (
                                        <div key={channel.id} className="relative group">
                                            <div className={`bg-slate-900 border ${analyzingChannelId === channel.id ? 'border-yellow-500 animate-pulse' : channel.status === 'done' ? 'border-green-500/50' : 'border-slate-700'} rounded-lg p-2 flex items-center gap-2 transition-colors`}>
                                                <div className="text-slate-500 text-xs font-bold w-6 text-center">#{idx + 1}</div>
                                                <input 
                                                    type="text" 
                                                    placeholder={texts.input_placeholder}
                                                    value={channel.url}
                                                    onChange={(e) => updateChannelUrl(channel.id, e.target.value)}
                                                    className="flex-1 bg-transparent border-none text-xs text-white p-1 focus:ring-0 placeholder:text-slate-600"
                                                />
                                                {channel.status === 'done' && <CheckCircle size={14} className="text-green-500" />}
                                                
                                                <button onClick={() => handleRemoveChannel(channel.id)} className="p-1 text-slate-600 hover:text-red-500"><Trash2 size={12} /></button>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={handleAddChannel} className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-slate-500 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-bold">
                                        <Plus size={14} /> {texts.btn_add_source}
                                    </button>
                                </div>
                            ) : (
                                <div className="h-32 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-indigo-500/50 hover:bg-slate-800/30 transition-all cursor-pointer relative">
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="video/mp4,video/webm" onChange={(e) => handleFileUpload(e, 'video', '1')} />
                                    <FileVideo size={32} className="mb-2 text-slate-600" />
                                    <p className="text-xs font-bold text-slate-300">{texts.btn_upload}</p>
                                </div>
                            )}
                        </div>

                        {/* AI MODEL CONFIGURATION (Integrated) */}
                        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/30">
                            <button 
                                onClick={() => setShowModelConfig(!showModelConfig)}
                                className="w-full p-3 flex justify-between items-center bg-slate-900/50 hover:bg-slate-900 transition-colors"
                            >
                                <span className="text-xs font-bold text-primary flex items-center gap-2">
                                    <Cpu size={14} /> AI Model Configuration
                                </span>
                                {showModelConfig ? <ChevronUp size={14} className="text-slate-500"/> : <ChevronDown size={14} className="text-slate-500"/>}
                            </button>
                            
                            {showModelConfig && (
                                <div className="p-4 space-y-6 border-t border-slate-800 animate-fade-in">
                                    <ModelFlowDiagram 
                                        scriptModel={scriptModel}
                                        visualModel={activeVisualModel}
                                        voiceModel={voiceModel}
                                        resolution={resolution}
                                        aspectRatio={aspectRatio}
                                    />
                                    <ModelSelector 
                                        scriptModel={scriptModel} setScriptModel={setScriptModel}
                                        visualModel={activeVisualModel} setVisualModel={() => {}} 
                                        voiceModel={voiceModel} setVoiceModel={setVoiceModel}
                                        resolution={resolution} setResolution={setResolution}
                                        aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-slate-800 group relative">
                            <NeonButton onClick={handleRunAnalysis} disabled={status === 'analyzing'} size="lg" className="w-full">
                                {status === 'analyzing' ? (
                                    <span className="flex items-center gap-2"><RefreshCw className="animate-spin"/> Analyzing...</span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Dna /> {texts.analyze_btn}
                                    </span>
                                )}
                            </NeonButton>
                        </div>
                    </div>
                )}

                {/* TAB 2: SCRIPT ENGINE */}
                {activeStudioTab === 'script' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FileText size={20} className="text-pink-500" /> {texts.script_engine?.title}
                            </h3>
                            <span className="text-xs bg-pink-900/20 text-pink-300 px-2 py-1 rounded border border-pink-500/30 font-bold flex items-center gap-1">
                                <Lock size={10}/> Output: {getLangDisplayName(contentLanguage)}
                            </span>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{texts.script_engine?.topic_label}</label>
                            <input 
                                type="text"
                                value={studioSettings.topic}
                                onChange={(e) => setStudioSettings({...studioSettings, topic: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-pink-500 focus:outline-none"
                            />
                        </div>

                        <NeonButton onClick={handleGenerateScript} disabled={status === 'generating'} size="lg" className="w-full">
                            {status === 'generating' ? (
                                <span className="flex items-center gap-2"><RefreshCw className="animate-spin"/> {texts.script_engine?.generating}</span>
                            ) : (
                                <span className="flex items-center gap-2"><Wand2 /> {texts.script_engine?.generate_btn}</span>
                            )}
                        </NeonButton>
                    </div>
                )}

                {/* TAB 3: VIDEO STUDIO */}
                {activeStudioTab === 'studio' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Sliders size={20} className="text-indigo-500" /> {texts.video_studio?.title}
                        </h3>

                        <NeonButton onClick={handleAutoClone} disabled={status === 'rendering'} size="lg" className="w-full">
                            {status === 'rendering' ? (
                                <span className="flex items-center gap-2"><RefreshCw className="animate-spin"/> {texts.video_studio?.rendering}</span>
                            ) : (
                                <span className="flex items-center gap-2"><Play /> {texts.video_studio?.render_btn}</span>
                            )}
                        </NeonButton>
                    </div>
                )}

                {/* TAB 4: QUALITY */}
                {activeStudioTab === 'quality' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                            <ShieldAlert size={20} className="text-red-500" /> Quality Gate
                        </h3>
                        {generatedPlan && (
                            <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-xl flex items-center gap-3">
                                <FileCheck size={24} className="text-green-500" />
                                <div>
                                    <h4 className="text-sm font-bold text-white">Ready to Export</h4>
                                </div>
                                <div className="ml-auto flex gap-2">
                                    <NeonButton onClick={handleDownloadPackage} size="sm">Export</NeonButton>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* LOGS */}
            <div className="bg-black border border-slate-800 rounded-xl p-3 h-32 overflow-y-auto font-mono text-[10px] text-green-400 shadow-inner">
                {logs.map((log, i) => <div key={i} className="border-l-2 border-green-900 pl-2 mb-1">{log}</div>)}
            </div>
        </div>

        {/* RIGHT PANEL: PREVIEW */}
        <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 h-full flex flex-col">
                <div className="bg-black rounded-xl flex-1 flex items-center justify-center relative overflow-hidden group">
                    <div className="text-center opacity-50 group-hover:opacity-20 transition-opacity">
                        <Film size={48} className="mx-auto mb-2 text-slate-700" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Preview</span>
                    </div>
                    {generatedPlan && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-4">
                            <h3 className="text-white font-bold leading-tight">{generatedPlan.generated_content?.title}</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ViralDNAStudio;
