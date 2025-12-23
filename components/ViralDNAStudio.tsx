
import { Bot, Send, X, Mic, MicOff, Zap, Volume2, VolumeX, Activity, UserCheck, Play, Loader2, Waves, ChevronDown, ExternalLink, Globe, Search, BrainCircuit, Sparkles, Terminal, Dna, Plus, Trash2, LayoutGrid, Layers, Radar, Target, BarChart2, Gauge, Info, TrendingUp, ChevronRight, Video as VideoIcon, Film, AlertTriangle, CheckCircle2, Filter, Library, SearchIcon, Clock, Download, ZapOff, BarChart3, Eraser, Scissors, ShoppingCart, Link, Columns, ChevronUp, Flame, TrendingDown, MoveUpRight, BarChartHorizontal, Rocket, Lightbulb, Lock, Unlock, ShieldCheck, HeartPulse, Settings2, Eye, MousePointer2, Users } from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ApiKeyConfig, KnowledgeBase, ScriptModel, VisualModel, VoiceModel, 
  VideoResolution, AspectRatio, OrchestratorResponse, SEOAudit, ViralDNAProfile, StudioSettings, AppLanguage, ContentLanguage, CompetitorChannel, CompletedVideo, ChannelIntelligence, ABTestMetadata 
} from '../types';
import NeonButton from './NeonButton';
import ModelSelector from './ModelSelector';
import PlanResult from './PlanResult';
import ABThumbnailTester from './ABThumbnailTester';
import { generateProScript, extractViralDNA, runSeoAudit, scanChannelIntelligence, getApiHealthStatus } from '../services/geminiService';

interface ChannelAnalysis extends CompetitorChannel {
  profile?: ViralDNAProfile;
  seoAudit?: SEOAudit;
  error?: string;
  isExpanded?: boolean;
}

interface ViralDNAStudioProps {
  predefinedTopic: string;
  apiKeys: ApiKeyConfig[];
  appLanguage: AppLanguage;
  contentLanguage: ContentLanguage;
  setContentLanguage: (lang: ContentLanguage) => void;
  knowledgeBase: KnowledgeBase;
  scriptModel: ScriptModel;
  setScriptModel: (m: ScriptModel) => void;
  visualModel: VisualModel;
  setVisualModel: (m: VisualModel) => void;
  voiceModel: VoiceModel;
  setVoiceModel: (m: VoiceModel) => void;
  resolution: VideoResolution;
  setResolution: (r: VideoResolution) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (a: AspectRatio) => void;
  completedVideos?: CompletedVideo[];
  setCompletedVideos?: React.Dispatch<React.SetStateAction<CompletedVideo[]>>;
  t: any;
  onInitiateRender?: (plan: OrchestratorResponse) => Promise<any>;
}

const ViralDNAStudio: React.FC<ViralDNAStudioProps> = ({ 
  predefinedTopic, apiKeys, appLanguage: appLang, contentLanguage, setContentLanguage, 
  knowledgeBase, scriptModel, setScriptModel, visualModel, setVisualModel, 
  voiceModel, setVoiceModel, resolution, setResolution, aspectRatio, setAspectRatio,
  completedVideos = [], setCompletedVideos, t, onInitiateRender
}) => {
  const [activeStudioTab, setActiveStudioTab] = useState<'recon' | 'studio' | 'library'>('recon');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'generating' | 'done'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [isChannelScanMode, setIsChannelScanMode] = useState(false);
  const [channelIntels, setChannelIntels] = useState<ChannelIntelligence[]>([]);
  const [selectedVideoForAB, setSelectedVideoForAB] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const addLog = (tag: string, detail: string) => {
    console.log(`[${tag}] ${detail}`);
  };

  const [channels, setChannels] = useState<ChannelAnalysis[]>([
    { id: '1', url: '', name: 'Target Alpha', status: 'pending', isExpanded: false }
  ]);

  const [generatedPlan, setGeneratedPlan] = useState<OrchestratorResponse | null>(null);
  const [studioSettings, setStudioSettings] = useState<StudioSettings>({
    quality: 'Standard', aspectRatio: aspectRatio, model: 'Balanced',
    hookStrength: 85, storyMode: 'One-shot', riskLevel: 'Safe',
    videoFormat: 'Shorts', contentLanguage: contentLanguage,
    topic: predefinedTopic || '', generationMode: 'Free Storyboard',
    characterLock: true, styleLock: true, musicSync: true
  });

  useEffect(() => {
    setStudioSettings(prev => ({ ...prev, aspectRatio }));
  }, [aspectRatio]);

  const addChannel = () => {
    if (channels.length >= 3) return;
    setChannels([...channels, { id: Date.now().toString(), url: '', name: `Target Node ${channels.length + 1}`, status: 'pending', isExpanded: false }]);
  };

  const removeChannel = (id: string) => {
    if (channels.length <= 1) return;
    setChannels(channels.filter(c => c.id !== id));
  };

  const clearChannels = () => {
    setChannels([{ id: '1', url: '', name: 'Target Alpha', status: 'pending', isExpanded: false }]);
    setChannelIntels([]);
  };

  const updateChannelUrl = (id: string, url: string) => {
    const rawUrls = url.split(/[\n,]+/).map(u => u.trim()).filter(u => u !== '');
    if (rawUrls.length > 1) {
      const newChannels = [...channels];
      const targetIdx = newChannels.findIndex(c => c.id === id);
      newChannels[targetIdx] = { ...newChannels[targetIdx], url: rawUrls[0], status: 'pending', profile: undefined, seoAudit: undefined, error: undefined };
      rawUrls.slice(1).forEach((u, idx) => {
        if (newChannels.length < 3) {
          newChannels.push({ id: (Date.now() + idx + 1).toString(), url: u, name: `Target Node ${newChannels.length + 1}`, status: 'pending', isExpanded: false });
        }
      });
      setChannels(newChannels);
      return;
    }
    setChannels(channels.map(c => c.id === id ? { ...c, url, status: 'pending', profile: undefined, seoAudit: undefined, error: undefined } : c));
  };

  const toggleExpand = (id: string) => {
    setChannels(channels.map(c => c.id === id ? { ...c, isExpanded: !c.isExpanded } : c));
  };

  const handleRunAnalysis = async () => {
    const validChannels = channels.filter(c => c.url.trim() !== '');
    if (validChannels.length === 0) return;
    setStatus('analyzing');
    if (isChannelScanMode) {
      try {
        const intelResults = await Promise.all(validChannels.map(ch => scanChannelIntelligence(ch.url)));
        setChannelIntels(intelResults);
        setStatus('done');
      } catch (e: any) {
        setChannels(prev => prev.map(c => ({...c, status: 'error', error: e.message})));
        setStatus('idle');
      }
      return;
    }
    setChannels(prev => prev.map(c => c.url.trim() ? { ...c, status: 'analyzing' } : c));
    const analysisTasks = validChannels.map(async (ch) => {
      try {
        const [profile, seoAudit] = await Promise.all([
          extractViralDNA(process.env.API_KEY!, [ch.url], "VidIQ-Enhanced Deep Recon", contentLanguage),
          runSeoAudit(ch.url, "Competitor Analysis Mode", "Affiliate Market")
        ]);
        setChannels(prev => prev.map(item => item.id === ch.id ? { ...item, status: 'completed', profile, seoAudit } : item));
        return true;
      } catch (e: any) {
        setChannels(prev => prev.map(item => item.id === ch.id ? { ...item, status: 'error', error: e.message } : item));
        return false;
      }
    });
    await Promise.all(analysisTasks);
    setStatus('done');
  };

  const handleGenerateScript = async () => {
    const masterProfile = channels.find(c => c.profile)?.profile;
    setStatus('generating');
    try {
        const plan = await generateProScript(
          process.env.API_KEY!, 
          masterProfile || { keywords: [studioSettings.topic], algorithm_fit_score: 80, risk_level: 'Safe', structure: { hook_type: 'visual', pacing: 'Fast', avg_scene_duration: 3 }, emotional_curve: [] }, 
          { ...studioSettings, aspectRatio }, 
          knowledgeBase
        );
        setGeneratedPlan(plan);
        setStatus('done');
    } catch (e) { setStatus('idle'); }
  };

  const handleRenderCycle = async () => {
    if (!generatedPlan || !onInitiateRender) return;
    setIsRendering(true);
    try {
      await onInitiateRender(generatedPlan);
      setActiveStudioTab('library');
    } catch (e) { console.error(e); } finally { setIsRendering(false); }
  };

  const filteredArchive = useMemo(() => {
    if (!searchQuery) return completedVideos;
    const query = searchQuery.toLowerCase();
    return completedVideos.filter(v => v.title.toLowerCase().includes(query));
  }, [completedVideos, searchQuery]);

  const handleWinnerSelect = (winner: 'A' | 'B') => {
    if (!selectedVideoForAB || !setCompletedVideos) return;
    setCompletedVideos(prev => prev.map(v => {
      if (v.id === selectedVideoForAB) {
        const url = winner === 'A' ? v.ab_test?.variant_a_url : v.ab_test?.variant_b_url;
        return { ...v, thumbnail: url || v.thumbnail, ab_test: v.ab_test ? { ...v.ab_test, winner } : undefined };
      }
      return v;
    }));
    setSelectedVideoForAB(null);
  };

  const handleUpdateABUrls = (urls: { a: string; b: string }) => {
    if (!selectedVideoForAB || !setCompletedVideos) return;
    setCompletedVideos(prev => prev.map(v => {
      if (v.id === selectedVideoForAB) {
        return { ...v, ab_test: { variant_a_url: urls.a, variant_b_url: urls.b, variant_a_ctr: v.ab_test?.variant_a_ctr || 0, variant_b_ctr: v.ab_test?.variant_b_ctr || 0, test_started_at: v.ab_test?.test_started_at || Date.now() } };
      }
      return v;
    }));
  };

  const currentVideoForAB = completedVideos.find(v => v.id === selectedVideoForAB);

  return (
    <div className="animate-fade-in space-y-6 pb-20 max-w-[1600px] mx-auto">
      <div className="bg-[#0A101F] border border-slate-800/60 rounded-[32px] p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-4">
              <div className="p-3.5 bg-primary/10 rounded-2xl border border-primary/20 shadow-neon"><Scissors className="text-primary" size={28} /></div>
              <div>
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase leading-tight">Clone & Dissection Studio</h2>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'idle' ? 'bg-green-500' : 'bg-primary animate-pulse'}`}></div>
                    <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.15em]">{status === 'idle' ? "Neural Radar Ready" : "Extracting Patterns..."}</span>
                  </div>
              </div>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800/50 shadow-inner w-full md:w-auto overflow-x-auto no-scrollbar">
              <button onClick={() => setActiveStudioTab('recon')} className={`flex-1 md:flex-none px-4 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest whitespace-nowrap ${activeStudioTab === 'recon' ? 'bg-primary text-white shadow-neon' : 'text-slate-500 hover:text-white'}`}>1. Target Autopsy</button>
              <button onClick={() => setActiveStudioTab('studio')} className={`flex-1 md:flex-none px-4 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest whitespace-nowrap ${activeStudioTab === 'studio' ? 'bg-primary text-white shadow-neon' : 'text-slate-500 hover:text-white'}`}>2. Genetic Cloning</button>
              <button onClick={() => setActiveStudioTab('library')} className={`flex-1 md:flex-none px-4 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest whitespace-nowrap ${activeStudioTab === 'library' ? 'bg-primary text-white shadow-neon' : 'text-slate-500 hover:text-white'}`}>Media Archive</button>
          </div>
      </div>

      <div className="bg-[#070B14]/60 border border-slate-800 rounded-[32px] overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900/50 flex justify-between items-center px-8 border-b border-slate-800">
           <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-3"><Settings2 size={16} /> Cấu hình Engine AI</h3>
           <div className="flex gap-4"><span className="text-[10px] font-bold text-slate-500 uppercase">{scriptModel} • {visualModel} • {aspectRatio}</span></div>
        </div>
        <div className="p-2">
           <ModelSelector scriptModel={scriptModel} setScriptModel={setScriptModel} visualModel={visualModel} setVisualModel={setVisualModel} voiceModel={voiceModel} setVoiceModel={setVoiceModel} resolution={resolution} setResolution={setResolution} aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} t={t} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
              {activeStudioTab === 'recon' && (
                  <div className="bg-[#070B14]/80 border border-slate-800 rounded-[32px] p-6 md:p-10 animate-fade-in space-y-10 relative overflow-hidden backdrop-blur-xl shadow-2xl">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none"><Radar size={200} /></div>
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-800 pb-8">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-3"><Target className="text-red-500 animate-pulse" size={24} /> Multimodal Acquisition</h3>
                            <p className="text-slate-500 text-xs italic font-medium leading-relaxed max-w-2xl">"Giải phẫu kịch bản & visual từ đối thủ."</p>
                        </div>
                        <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
                            <button onClick={() => { setIsChannelScanMode(false); clearChannels(); }} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${!isChannelScanMode ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Video Mode</button>
                            <button onClick={() => { setIsChannelScanMode(true); clearChannels(); }} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${isChannelScanMode ? 'bg-red-500 text-white shadow-neon' : 'text-slate-500'}`}>Channel Recon</button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {channels.map((channel, i) => (
                            <div key={channel.id} className={`group relative flex items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border transition-all shadow-lg focus-within:border-primary/50 ${channel.status === 'analyzing' ? 'border-primary/40 bg-primary/5 animate-pulse' : 'border-slate-800/60 hover:border-primary/30'}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-[10px] font-black transition-colors ${channel.status === 'completed' ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-slate-900 border-slate-800 text-primary'}`}>{channel.status === 'analyzing' ? <Loader2 size={14} className="animate-spin" /> : i + 1}</div>
                                <input value={channel.url} onChange={(e) => updateChannelUrl(channel.id, e.target.value)} disabled={channel.status === 'analyzing'} placeholder={isChannelScanMode ? "URL Kênh..." : "URL Video..."} className="bg-transparent border-none outline-none text-white font-mono text-xs flex-1 placeholder:text-slate-800" />
                                {channels.length > 1 && <button onClick={() => removeChannel(channel.id)} className="p-2 text-slate-600 hover:text-red-500"><X size={16}/></button>}
                            </div>
                        ))}
                      </div>
                      <div className="pt-8 flex justify-center">
                          <NeonButton onClick={handleRunAnalysis} disabled={status === 'analyzing' || channels.every(c => !c.url.trim())} size="lg" className="min-w-[400px] h-16 shadow-neon">{status === 'analyzing' ? <Loader2 size={24} className="animate-spin" /> : <Radar size={24} />}{status === 'analyzing' ? "Analyzing..." : "Initiate Recon"}</NeonButton>
                      </div>
                  </div>
              )}

              {activeStudioTab === 'studio' && (
                  <div className="animate-fade-in space-y-6">
                      {!generatedPlan ? (
                          <div className="bg-[#070B14]/80 border border-slate-800 rounded-[32px] p-12 flex flex-col items-center justify-center text-center space-y-10 backdrop-blur-xl shadow-2xl">
                               <div className="w-24 h-24 bg-slate-950 rounded-3xl flex items-center justify-center border border-slate-800/50 opacity-40 shadow-inner group relative"><BrainCircuit size={56} className="text-primary" /></div>
                               <div className="space-y-3"><h4 className="text-2xl font-black text-white uppercase tracking-tighter">Strategic Factory Locked</h4></div>
                               <input value={studioSettings.topic} onChange={(e) => setStudioSettings({...studioSettings, topic: e.target.value})} placeholder="Topic hoặc từ khóa..." className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm text-white font-bold outline-none focus:border-primary shadow-inner" />
                               <NeonButton onClick={handleGenerateScript} disabled={status === 'generating' || !studioSettings.topic} className="w-full max-w-md h-16">{status === 'generating' ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}{status === 'generating' ? "Synchronizing..." : "Start Cloning"}</NeonButton>
                          </div>
                      ) : (
                          <PlanResult data={generatedPlan} videoUrl={null} t={t} onInitiateRender={onInitiateRender} />
                      )}
                  </div>
              )}

              {activeStudioTab === 'library' && (
                <div className="animate-fade-in space-y-6">
                    {selectedVideoForAB && currentVideoForAB && (
                      <div className="space-y-4">
                        <button onClick={() => setSelectedVideoForAB(null)} className="text-[10px] font-black text-slate-500 hover:text-white uppercase flex items-center gap-1"><ChevronRight className="rotate-180" size={14}/> Back to Archive</button>
                        <ABThumbnailTester 
                          videoTitle={currentVideoForAB.title}
                          initialData={currentVideoForAB.ab_test}
                          onSelectWinner={handleWinnerSelect}
                          onUpdateUrls={handleUpdateABUrls}
                        />
                      </div>
                    )}
                    <div className={`${selectedVideoForAB ? 'hidden' : 'bg-[#070B14]/80'} border border-slate-800 rounded-[32px] p-10 shadow-2xl space-y-8`}>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6"><h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3"><Library className="text-primary" size={28} /> Video Archive</h3><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full md:w-80 bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-xs text-white font-bold" /></div>
                        {filteredArchive.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredArchive.map((video) => (
                                    <div key={video.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group hover:border-primary/40 transition-all shadow-xl flex flex-col">
                                        <div className="aspect-[9/16] bg-black relative flex items-center justify-center overflow-hidden">
                                            {video.thumbnail ? <img src={video.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" alt={video.title} /> : <div className="p-10 bg-slate-950/50 border border-white/5"><VideoIcon size={36} className="text-slate-700" /></div>}
                                        </div>
                                        <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                                            <div><h4 className="text-sm font-black text-white line-clamp-2 uppercase tracking-tight leading-tight">{video.title}</h4></div>
                                            <button onClick={() => setSelectedVideoForAB(video.id)} className="w-full py-2 bg-slate-950 border border-slate-800 rounded-xl text-[9px] font-black text-slate-500 hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2"><Columns size={12}/> {video.ab_test ? 'Review A/B Test' : 'Setup A/B Test'}</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (<div className="py-20 opacity-20 text-center"><SearchIcon size={80} /></div>)}
                    </div>
                </div>
              )}
          </div>

          <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#0A101F] border border-slate-800 rounded-[32px] p-8 shadow-2xl backdrop-blur-md">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3"><Zap size={18} className="text-primary" /> Multi-Layer Constraints</h3>
                  <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Character Lock</label><button onClick={() => setStudioSettings({...studioSettings, characterLock: !studioSettings.characterLock})} className={`p-2 rounded-xl border transition-all ${studioSettings.characterLock ? 'bg-primary/20 border-primary text-primary shadow-neon' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>{studioSettings.characterLock ? <Lock size={16}/> : <Unlock size={16}/>}</button></div>
                        <div className="flex items-center justify-between"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Consistency</label><button onClick={() => setStudioSettings({...studioSettings, styleLock: !studioSettings.styleLock})} className={`p-2 rounded-xl border transition-all ${studioSettings.styleLock ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-neon' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>{studioSettings.styleLock ? <ShieldCheck size={16}/> : <Layers size={16}/>}</button></div>
                      </div>
                      <div className="space-y-4">
                          <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pattern Strength</label><span className="text-[11px] font-black text-primary">{studioSettings.hookStrength}%</span></div>
                          <input type="range" min="50" max="100" value={studioSettings.hookStrength} onChange={(e) => setStudioSettings({...studioSettings, hookStrength: parseInt(e.target.value)})} className="w-full accent-primary bg-slate-950 h-2 rounded-full cursor-pointer" />
                      </div>
                      <NeonButton onClick={handleRenderCycle} disabled={!generatedPlan || isRendering} className="w-full h-16 uppercase text-xs font-black shadow-neon">{isRendering ? <Loader2 size={18} className="animate-spin" /> : <Film size={18} />}{isRendering ? "RENDER..." : "Initiate Render"}</NeonButton>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ViralDNAStudio;
