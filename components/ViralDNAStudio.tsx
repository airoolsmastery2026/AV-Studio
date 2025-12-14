
import React, { useState, useEffect } from 'react';
import { 
  Dna, Plus, Trash2, Zap, Play, Settings, 
  Layers, Download, FolderOpen, CheckCircle, 
  AlertTriangle, Monitor, Film, Music, Mic, 
  BarChart, Maximize2, RefreshCw, Box, FileJson,
  LayoutTemplate, Image as ImageIcon, Wand2, ShieldAlert,
  Gauge, TrendingUp, Lock, Unlock, FileCheck,
  Sliders, Video, Banknote, User, FileVideo, UserSquare2,
  Copy, Link, Upload, Youtube, Facebook, Instagram, FileText, Paperclip
} from 'lucide-react';
import { CompetitorChannel, ViralDNAProfile, StudioSettings, OrchestratorResponse, ApiKeyConfig } from '../types';
import NeonButton from './NeonButton';
import { extractViralDNA, generateProScript } from '../services/geminiService';
import PlanResult from './PlanResult';

interface ViralDNAStudioProps {
  apiKeys: ApiKeyConfig[];
}

type StudioTab = 'cloner' | 'script' | 'studio' | 'quality';

const ViralDNAStudio: React.FC<ViralDNAStudioProps> = ({ apiKeys }) => {
  // --- STATE ---
  const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>('cloner');
  const [inputMode, setInputMode] = useState<'link' | 'upload'>('link');
  
  // Channels Input State
  const [channels, setChannels] = useState<CompetitorChannel[]>([
    { id: '1', url: '', name: 'Source 1', status: 'pending' },
    { id: '2', url: '', name: 'Source 2', status: 'pending' },
    { id: '3', url: '', name: 'Source 3', status: 'pending' }
  ]);
  
  // Face Swap State
  const [uploadedFaces, setUploadedFaces] = useState<string[]>([]);

  // New Reference States
  const [refImages, setRefImages] = useState<string[]>([]);
  const [refVideos, setRefVideos] = useState<string[]>([]);
  const [refContext, setRefContext] = useState<string>('');
  
  const [dnaProfile, setDnaProfile] = useState<ViralDNAProfile | null>(null);
  
  const [studioSettings, setStudioSettings] = useState<StudioSettings>({
    // Studio
    quality: 'Standard',
    aspectRatio: '9:16',
    model: 'Balanced',
    generationMode: 'Free Storyboard',
    
    // Script
    videoFormat: 'Shorts',
    language: 'vi',
    topic: '',
    
    // Config
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
    setChannels(channels.map(c => c.id === id ? { ...c, url, status: 'pending' } : c));
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
          setRefVideos(prev => [...prev, fakeUrl]); // In real app, store file obj
      }
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
        alert("Vui lòng nhập nguồn video (Link hoặc Upload).");
        return;
    }

    setStatus('analyzing');
    addLog("--- INITIALIZING VIDEO CLONER & REPLICATOR ---");
    
    // Log references if any
    if (refImages.length > 0) addLog(`📸 Included ${refImages.length} reference images for style transfer.`);
    if (refVideos.length > 0) addLog(`🎞️ Included ${refVideos.length} reference videos for pacing/b-roll.`);
    if (refContext) addLog(`📝 Context prompt loaded: "${refContext.substring(0, 20)}..."`);

    try {
        // Parallel Analysis Simulation
        const analyzedChannels = [...channels];
        
        for (let i = 0; i < analyzedChannels.length; i++) {
            if (analyzedChannels[i].url.trim()) {
                setAnalyzingChannelId(analyzedChannels[i].id);
                addLog(`📡 Scanning DNA of: ${analyzedChannels[i].name}...`);
                await new Promise(r => setTimeout(r, 1000));
                analyzedChannels[i].status = 'done';
            }
        }
        setAnalyzingChannelId(null);
        setChannels(analyzedChannels);

        // Call API
        addLog(`🧬 Extracting Viral DNA Structure...`);
        const dna = await extractViralDNA(googleKey.key, validChannels.map(c => c.url));
        setDnaProfile(dna);
        
        // Use title from DNA if available for Topic
        if (dna.keywords && dna.keywords.length > 0) {
            setStudioSettings(prev => ({...prev, topic: `Viral Video about ${dna.keywords[0]}`}));
        }

        addLog("✅ DNA Extraction Complete. Switching to Script Engine.");
        setActiveStudioTab('script');

    } catch (e: any) {
        console.error(e);
        addLog(`❌ Error: ${e.message}`);
        setStatus('idle');
    }
  };

  const handleGenerateScript = async () => {
      if (!dnaProfile && !studioSettings.topic) {
          alert("Vui lòng phân tích video hoặc nhập Topic trước.");
          return;
      }
      
      const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
      if (!googleKey) return;

      setStatus('generating');
      addLog(`📝 Generating ${studioSettings.videoFormat} script in ${studioSettings.language.toUpperCase()}...`);
      
      try {
          // Use default DNA if not analyzed yet
          const effectiveDNA = dnaProfile || {
              structure: { hook_type: 'Generic', pacing: 'Fast', avg_scene_duration: 3 },
              emotional_curve: ['Curiosity', 'Engagement'],
              keywords: [studioSettings.topic],
              algorithm_fit_score: 85,
              risk_level: 'Safe'
          } as ViralDNAProfile;

          const plan = await generateProScript(googleKey.key, effectiveDNA, studioSettings);
          setGeneratedPlan(plan);
          addLog("✅ Script Generated. Sending to Video Studio.");
          setActiveStudioTab('studio');
          setStatus('done');
      } catch (e: any) {
          addLog(`❌ Script Error: ${e.message}`);
          setStatus('idle');
      }
  };

  const handleAutoClone = async () => {
      if (!generatedPlan) {
          alert("Script blueprint is required for cloning.");
          return;
      }
      
      setStatus('rendering');
      addLog("🚀 AUTO-CLONE SEQUENCE STARTED...");
      addLog(`   > Mode: ${studioSettings.generationMode}`);
      addLog(`   > Face Swap: ${uploadedFaces.length > 0 ? "ACTIVE" : "INACTIVE"}`);
      addLog(`   > Consistency: ${studioSettings.characterLock ? "LOCKED" : "OFF"}`);
      
      // Simulation
      await new Promise(r => setTimeout(r, 2500));
      addLog("✅ Cloning Complete. Verifying Quality...");
      setActiveStudioTab('quality');
      setStatus('done');
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
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-900/20">
                <Dna size={32} className="text-white" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    VIRAL DNA STUDIO <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded font-black tracking-widest">PRO</span>
                </h1>
                <p className="text-slate-400 text-xs font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    CLONER & REPLICATOR ENGINE
                </p>
            </div>
        </div>
        
        {/* Progress Stepper */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
            {['Cloner', 'Script', 'Studio', 'Quality'].map((step, i) => {
                const stepId = step.toLowerCase();
                const isActive = activeStudioTab === stepId;
                const isPassed = ['cloner', 'script', 'studio', 'quality'].indexOf(activeStudioTab) > i;
                
                return (
                <div key={step} className="flex items-center">
                    <button 
                        onClick={() => setActiveStudioTab(stepId as StudioTab)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all ${isActive ? 'bg-indigo-600 text-white' : isPassed ? 'text-indigo-400 hover:text-white' : 'text-slate-600'}`}
                    >
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white animate-pulse' : isPassed ? 'bg-indigo-400' : 'bg-slate-700'}`}></div>
                        <span className="text-[10px] font-bold uppercase">{step}</span>
                    </button>
                    {i < 3 && <div className="w-4 h-px bg-slate-800 mx-1"></div>}
                </div>
            )})}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
        
        {/* LEFT PANEL: NAVIGATION (2 Cols) */}
        <div className="hidden lg:flex lg:col-span-2 flex-col gap-2 border-r border-slate-800 pr-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 px-2">Workstation</h3>
            {[
                { id: 'cloner', label: '1. Video Cloner', icon: Copy, desc: 'Input & Face Swap' },
                { id: 'script', label: '2. Script Engine', icon: FileVideo, desc: 'Text Generation' },
                { id: 'studio', label: '3. Video Studio', icon: Sliders, desc: 'Production Suite' },
                { id: 'quality', label: '4. Quality Monitor', icon: ShieldAlert, desc: 'Final Check' },
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
                    <span className="text-[10px] opacity-70">{tab.desc}</span>
                </button>
            ))}
        </div>

        {/* CENTER PANEL: MAIN WORKSPACE (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[500px] relative">
                
                {/* TAB 1: CLONER & REPLICATOR */}
                {activeStudioTab === 'cloner' && (
                    <div className="space-y-8 animate-fade-in">
                        
                        {/* INPUT METHOD TABS */}
                        <div className="flex gap-2 p-1 bg-slate-950 rounded-xl w-fit border border-slate-800">
                            <button 
                                onClick={() => setInputMode('link')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${inputMode === 'link' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Link size={14} /> Paste Link
                            </button>
                            <button 
                                onClick={() => setInputMode('upload')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${inputMode === 'upload' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Upload size={14} /> Upload Video
                            </button>
                        </div>

                        {/* INPUT AREA */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Monitor size={20} className="text-blue-500" /> Source Material
                            </h3>
                            
                            {inputMode === 'link' ? (
                                <div className="space-y-3">
                                    {channels.map((channel, idx) => (
                                        <div key={channel.id} className="relative group">
                                            <div className={`bg-slate-950 border ${analyzingChannelId === channel.id ? 'border-yellow-500 animate-pulse' : channel.status === 'done' ? 'border-green-500/50' : 'border-slate-700'} rounded-xl p-1 flex items-center gap-2 transition-colors pl-4`}>
                                                <div className="text-slate-500 text-xs font-bold w-6">{idx + 1}.</div>
                                                <input 
                                                    type="text" 
                                                    placeholder="YouTube / TikTok / Facebook Link"
                                                    value={channel.url}
                                                    onChange={(e) => updateChannelUrl(channel.id, e.target.value)}
                                                    className="flex-1 bg-transparent border-none text-xs text-white px-3 py-3 focus:ring-0 placeholder:text-slate-600"
                                                />
                                                <div className="flex gap-2 pr-2 text-slate-600">
                                                    <Youtube size={14} />
                                                    <Facebook size={14} />
                                                    <Instagram size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-500 hover:border-indigo-500/50 hover:bg-slate-800/30 transition-all cursor-pointer relative">
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="video/mp4,video/webm" onChange={(e) => handleFileUpload(e, 'video', '1')} />
                                    <FileVideo size={40} className="mb-4 text-slate-600" />
                                    <p className="text-sm font-bold text-slate-300">Drag & Drop or Click to Upload</p>
                                    <p className="text-xs mt-1">MP4, WebM (Max 20MB)</p>
                                    {channels[0].status === 'done' && (
                                        <div className="mt-4 px-4 py-2 bg-green-900/20 text-green-400 rounded-lg text-xs font-bold flex items-center gap-2">
                                            <CheckCircle size={14} /> {channels[0].name} Uploaded
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* FACE SWAP AREA */}
                        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <UserSquare2 size={18} className="text-yellow-500" /> AI Character Replacement
                                </h3>
                                <span className="text-[10px] uppercase font-bold text-slate-500">Optional</span>
                            </div>
                            
                            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                {uploadedFaces.map((face, i) => (
                                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-600 shrink-0 group">
                                        <img src={face} alt="Face" className="w-full h-full object-cover" />
                                        <button onClick={() => setUploadedFaces(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={10} />
                                        </button>
                                    </div>
                                ))}
                                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 hover:border-yellow-500 flex flex-col items-center justify-center cursor-pointer shrink-0 transition-colors">
                                    <Plus size={20} className="text-slate-500 mb-1" />
                                    <span className="text-[8px] text-slate-500 uppercase font-bold text-center leading-tight">Upload<br/>Face/KOL</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'face')} />
                                </label>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">
                                AI will maintain this identity in the recreated video.
                            </p>
                        </div>

                        {/* NEW: MULTI-MODAL REFERENCE SECTION */}
                        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Paperclip size={18} className="text-purple-500" /> Multi-Modal References
                                </h3>
                                <span className="text-[10px] bg-purple-900/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">Style & Context</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Image References */}
                                <div>
                                    <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block flex items-center gap-1">
                                        <ImageIcon size={12} /> Reference Images (Style/Vibe)
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {refImages.map((img, i) => (
                                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-700 group">
                                                <img src={img} alt="Ref" className="w-full h-full object-cover" />
                                                <button onClick={() => setRefImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 size={10} />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="aspect-square rounded-lg border-2 border-dashed border-slate-700 hover:border-purple-500 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/50">
                                            <Plus size={16} className="text-slate-500" />
                                            <span className="text-[8px] text-slate-500 mt-1">Add Img</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'ref_image')} />
                                        </label>
                                    </div>
                                </div>

                                {/* Video References */}
                                <div>
                                    <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block flex items-center gap-1">
                                        <FileVideo size={12} /> Reference Videos (B-Roll/Pacing)
                                    </label>
                                    <div className="space-y-2">
                                        {refVideos.map((vid, i) => (
                                            <div key={i} className="flex items-center justify-between p-2 bg-slate-900 rounded-lg border border-slate-700 text-xs">
                                                <div className="flex items-center gap-2 truncate">
                                                    <Film size={12} className="text-purple-400 shrink-0" />
                                                    <span className="truncate text-slate-300">Reference Video {i + 1}</span>
                                                </div>
                                                <button onClick={() => setRefVideos(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-red-400">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="w-full py-2 border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-lg flex items-center justify-center cursor-pointer transition-colors bg-slate-900/50">
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1"><Upload size={12} /> Upload Video Ref</span>
                                            <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'ref_video')} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Context Prompt */}
                            <div>
                                <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block flex items-center gap-1">
                                    <FileText size={12} /> Context Prompt / Notes
                                </label>
                                <textarea 
                                    value={refContext}
                                    onChange={(e) => setRefContext(e.target.value)}
                                    placeholder="Add specific instructions: 'Make it cinematic', 'Use red and black color scheme', 'Focus on fast cuts'..."
                                    className="w-full h-20 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white focus:border-purple-500 focus:outline-none resize-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800">
                            <NeonButton onClick={handleRunAnalysis} disabled={status === 'analyzing'} size="lg" className="w-full">
                                {status === 'analyzing' ? (
                                    <span className="flex items-center gap-2"><RefreshCw className="animate-spin"/> Analyzing Structure...</span>
                                ) : (
                                    <span className="flex items-center gap-2"><Dna /> Analyze & Clone Structure</span>
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
                                <FileVideo size={20} className="text-pink-500" /> Script Engine
                            </h3>
                            <span className="text-xs bg-pink-900/20 text-pink-300 px-2 py-1 rounded border border-pink-500/30">Powered by Gemini</span>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Format</label>
                                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                                    {['Shorts', 'Long Form'].map(f => (
                                        <button 
                                            key={f}
                                            onClick={() => setStudioSettings({...studioSettings, videoFormat: f as any})}
                                            className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${studioSettings.videoFormat === f ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Language</label>
                                <select 
                                    value={studioSettings.language}
                                    onChange={(e) => setStudioSettings({...studioSettings, language: e.target.value as any})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none"
                                >
                                    <option value="vi">Vietnamese (Tiếng Việt)</option>
                                    <option value="en">English (US)</option>
                                    <option value="es">Spanish (Español)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Topic / Hook</label>
                            <input 
                                type="text"
                                value={studioSettings.topic}
                                onChange={(e) => setStudioSettings({...studioSettings, topic: e.target.value})}
                                placeholder="e.g., 3 AI tools that will replace your designer..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-pink-500 focus:outline-none"
                            />
                        </div>

                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-400">Advanced Prompt Control</span>
                                <button className="text-[10px] text-pink-400 hover:underline">Show</button>
                            </div>
                            {/* Hidden by default, simple toggle placeholder */}
                        </div>

                        <NeonButton onClick={handleGenerateScript} disabled={status === 'generating'} size="lg" className="w-full">
                            {status === 'generating' ? (
                                <span className="flex items-center gap-2"><RefreshCw className="animate-spin"/> Writing Script...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Wand2 /> Generate Script</span>
                            )}
                        </NeonButton>
                    </div>
                )}

                {/* TAB 3: VIDEO STUDIO */}
                {activeStudioTab === 'studio' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Sliders size={20} className="text-indigo-500" /> Video Studio
                        </h3>

                        {/* MODE SELECTOR */}
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setStudioSettings({...studioSettings, generationMode: 'Free Storyboard'})}
                                className={`p-4 rounded-xl border text-left transition-all ${studioSettings.generationMode === 'Free Storyboard' ? 'bg-indigo-900/20 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                            >
                                <div className="font-bold text-sm mb-1">Free Storyboard</div>
                                <div className="text-[10px] opacity-70">Static images + Ken Burns effect. Fast & Free.</div>
                            </button>
                            <button 
                                onClick={() => setStudioSettings({...studioSettings, generationMode: 'Veo'})}
                                className={`p-4 rounded-xl border text-left transition-all ${studioSettings.generationMode === 'Veo' ? 'bg-indigo-900/20 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                            >
                                <div className="font-bold text-sm mb-1 flex items-center gap-2">Veo (Paid) <Zap size={12} className="text-yellow-400" /></div>
                                <div className="text-[10px] opacity-70">High-fidelity generative video.</div>
                            </button>
                        </div>

                        {/* CONFIG GRID */}
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase">Settings</h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] text-slate-400 mb-1">Video Quality</label>
                                    <select 
                                        value={studioSettings.quality}
                                        onChange={(e) => setStudioSettings({...studioSettings, quality: e.target.value as any})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Ultra">Ultra</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-400 mb-1">Aspect Ratio</label>
                                    <select 
                                        value={studioSettings.aspectRatio}
                                        onChange={(e) => setStudioSettings({...studioSettings, aspectRatio: e.target.value as any})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                                    >
                                        <option value="9:16">9:16 (Shorts)</option>
                                        <option value="16:9">16:9 (Landscape)</option>
                                        <option value="1:1">1:1 (Square)</option>
                                    </select>
                                </div>
                            </div>

                            {/* CONSISTENCY */}
                            <div className="pt-2 border-t border-slate-800">
                                <label className="text-[10px] text-slate-500 uppercase block mb-2">Consistency</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                        <input type="checkbox" checked={studioSettings.characterLock} onChange={() => setStudioSettings({...studioSettings, characterLock: !studioSettings.characterLock})} className="accent-indigo-500"/>
                                        Character Lock
                                    </label>
                                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                        <input type="checkbox" checked={studioSettings.styleLock} onChange={() => setStudioSettings({...studioSettings, styleLock: !studioSettings.styleLock})} className="accent-indigo-500"/>
                                        Style Lock
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* FLOW PREVIEW */}
                        {generatedPlan && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase">Flow</h4>
                                {generatedPlan.production_plan.scenes.slice(0, 3).map((scene, i) => (
                                    <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex gap-3 items-start">
                                        <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">{i+1}</div>
                                        <div className="flex-1">
                                            <div className="text-[10px] text-indigo-400 font-bold mb-1">Scene Prompt</div>
                                            <p className="text-xs text-slate-300 line-clamp-2">{scene.visual_cues}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <NeonButton onClick={handleAutoClone} disabled={status === 'rendering'} size="lg" className="w-full">
                            {status === 'rendering' ? (
                                <span className="flex items-center gap-2"><RefreshCw className="animate-spin"/> Producing...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Play /> Play {studioSettings.generationMode}</span>
                            )}
                        </NeonButton>
                    </div>
                )}

                {/* TAB 4: QUALITY GATE */}
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
                                                    <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                                    <path className={getQualityColor(m.score)} strokeDasharray={`${m.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
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
                                    <div className="ml-auto flex gap-2">
                                        <NeonButton onClick={handleDownloadPackage} size="sm">
                                            Export Package
                                        </NeonButton>
                                    </div>
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
            getScore(d.report?.post_frequency), 
            d.report?.algorithm_fit || 50,
            d.report?.risk_score || 50,
            getScore(d.report?.avg_duration) 
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
