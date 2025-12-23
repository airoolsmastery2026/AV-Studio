
import { Bot, Send, X, Mic, MicOff, Zap, Volume2, VolumeX, Activity, UserCheck, Play, Loader2, Waves, ChevronDown, ExternalLink, Globe, Search, BrainCircuit, Sparkles, Terminal, Dna, Plus, Trash2, LayoutGrid, Layers, Radar, Target, BarChart2, Gauge, Info, TrendingUp, ChevronRight, Video as VideoIcon, Film, AlertTriangle, CheckCircle2, Filter, Library, SearchIcon, Clock, Download, ZapOff, BarChart3, Eraser, Scissors, ShoppingCart, Link, Columns, ChevronUp, Flame, TrendingDown, MoveUpRight, BarChartHorizontal, Rocket, Lightbulb, Lock, Unlock, ShieldCheck, HeartPulse, Sliders } from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ApiKeyConfig, KnowledgeBase, ScriptModel, VisualModel, VoiceModel, 
  VideoResolution, AspectRatio, OrchestratorResponse, SEOAudit, ViralDNAProfile, StudioSettings, AppLanguage, ContentLanguage, CompetitorChannel, CompletedVideo, ChannelIntelligence, ABTestMetadata 
} from '../types';
import NeonButton from './NeonButton';
import ModelSelector from './ModelSelector';
import PlanResult from './PlanResult';
import ABThumbnailTester from './ABThumbnailTester';
import { generateProScript, extractViralDNA, runSeoAudit, scanChannelIntelligence } from '../services/geminiService';

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
  setResolution: (r: VideoResolution) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (a: AspectRatio) => void;
  completedVideos?: CompletedVideo[];
  setCompletedVideos?: React.Dispatch<React.SetStateAction<CompletedVideo[]>>;
  t: any;
  onInitiateRender?: (plan: OrchestratorResponse) => Promise<any>;
}

const ViralDNAStudio: React.FC<ViralDNAStudioProps> = ({ 
  predefinedTopic, apiKeys, appLanguage, contentLanguage, setContentLanguage, 
  knowledgeBase, scriptModel, setScriptModel, visualModel, setVisualModel, 
  voiceModel, setVoiceModel, setResolution, aspectRatio, setAspectRatio,
  completedVideos = [], setCompletedVideos, t, onInitiateRender
}) => {
  const [activeStudioTab, setActiveStudioTab] = useState<'recon' | 'studio' | 'library'>('recon');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'generating' | 'done'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [isChannelScanMode, setIsChannelScanMode] = useState(false);
  const [channelIntel, setChannelIntel] = useState<ChannelIntelligence | null>(null);
  const [selectedVideoForAB, setSelectedVideoForAB] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const [channels, setChannels] = useState<ChannelAnalysis[]>([
    { id: '1', url: '', name: 'Target Alpha', status: 'pending', isExpanded: false }
  ]);

  const [generatedPlan, setGeneratedPlan] = useState<OrchestratorResponse | null>(null);
  const [studioSettings, setStudioSettings] = useState<StudioSettings>({
    quality: 'Standard', aspectRatio: '9:16', model: 'Balanced',
    hookStrength: 85, storyMode: 'One-shot', riskLevel: 'Safe',
    videoFormat: 'Shorts', contentLanguage: contentLanguage,
    topic: predefinedTopic || '', generationMode: 'Free Storyboard',
    characterLock: true, styleLock: true, musicSync: true
  });

  const addChannel = () => {
    setChannels([...channels, { id: Date.now().toString(), url: '', name: `Target Node ${channels.length + 1}`, status: 'pending', isExpanded: false }]);
  };

  const removeChannel = (id: string) => {
    if (channels.length <= 1) return;
    setChannels(channels.filter(c => c.id !== id));
  };

  const clearChannels = () => {
    setChannels([{ id: '1', url: '', name: 'Target Alpha', status: 'pending', isExpanded: false }]);
    setChannelIntel(null);
  };

  const updateChannelUrl = (id: string, url: string) => {
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
        const intel = await scanChannelIntelligence(validChannels[0].url);
        setChannelIntel(intel);
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
          extractViralDNA(process.env.API_KEY!, [ch.url], "Deep Autopsy Mode", contentLanguage),
          runSeoAudit(ch.url, "Competitor Recon", "Global Market")
        ]);
        
        setChannels(prev => prev.map(item => 
          item.id === ch.id ? { ...item, status: 'completed', profile, seoAudit } : item
        ));
        return true;
      } catch (e: any) {
        setChannels(prev => prev.map(item => 
          item.id === ch.id ? { ...item, status: 'error', error: e.message } : item
        ));
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
          studioSettings, 
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
    } catch (e) {
      console.error(e);
    } finally {
      setIsRendering(false);
    }
  };

  const filteredArchive = useMemo(() => {
    if (!searchQuery) return completedVideos;
    const query = searchQuery.toLowerCase();
    return completedVideos.filter(v => 
      v.title.toLowerCase().includes(query)
    );
  }, [completedVideos, searchQuery]);

  return (
    <div className="animate-fade-in space-y-6 pb-20 max-w-[1600px] mx-auto">
      {/* Navigation Header */}
      <div className="bg-[#0A101F] border border-slate-800/60 rounded-[32px] p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-4">
              <div className="p-3.5 bg-primary/10 rounded-2xl border border-primary/20 shadow-neon">
                <Scissors className="text-primary" size={28} />
              </div>
              <div>
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase leading-tight">DNA Dissection & Cloning</h2>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'idle' ? 'bg-green-500' : 'bg-primary animate-pulse'}`}></div>
                    <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.15em]">
                      {status === 'idle' ? "Targeting System Active" : "Scanning Multimodal success signals..."}
                    </span>
                  </div>
              </div>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800/50 shadow-inner w-full md:w-auto overflow-x-auto no-scrollbar">
              <button onClick={() => setActiveStudioTab('recon')} className={`flex-1 md:flex-none px-4 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest whitespace-nowrap ${activeStudioTab === 'recon' ? 'bg-primary text-white shadow-neon' : 'text-slate-500 hover:text-white'}`}>1. Target Autopsy</button>
              <button onClick={() => setActiveStudioTab('studio')} className={`flex-1 md:flex-none px-4 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest whitespace-nowrap ${activeStudioTab === 'studio' ? 'bg-primary text-white shadow-neon' : 'text-slate-500 hover:text-white'}`}>2. Genetic Cloning</button>
              <button onClick={() => setActiveStudioTab('library')} className={`flex-1 md:flex-none px-4 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest whitespace-nowrap ${activeStudioTab === 'library' ? 'bg-primary text-white shadow-neon' : 'text-slate-500 hover:text-white'}`}>Media Archive</button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
              {activeStudioTab === 'recon' && (
                  <div className="bg-[#070B14]/80 border border-slate-800 rounded-[32px] p-6 md:p-10 animate-fade-in space-y-10 relative overflow-hidden backdrop-blur-xl shadow-2xl">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none"><Radar size={200} /></div>
                      
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-800 pb-8">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3"><Target className="text-red-500 animate-pulse" size={28} /> {t.dna_viral_structure}</h3>
                            <p className="text-slate-500 text-xs italic font-medium leading-relaxed max-w-2xl">"Phân tích đa chiều kịch bản, âm thanh và chuyển cảnh để bẻ khóa thành công của đối thủ."</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={addChannel} className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary hover:bg-primary hover:text-white transition-all"><Plus size={20}/></button>
                            <button onClick={clearChannels} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-red-500 transition-all"><Eraser size={20}/></button>
                        </div>
                      </div>

                      <div className="space-y-6">
                          {channels.map((channel, i) => (
                              <div key={channel.id} className="space-y-4 animate-fade-in">
                                  <div className={`group relative flex items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border transition-all shadow-lg focus-within:border-primary/50 ${channel.status === 'analyzing' ? 'border-primary/40 bg-primary/5 animate-pulse' : 'border-slate-800/60 hover:border-primary/30'}`}>
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border text-[11px] font-black transition-colors ${channel.status === 'completed' ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-slate-900 border-slate-800 text-primary group-hover:bg-primary/10'}`}>
                                        {channel.status === 'analyzing' ? <Loader2 size={18} className="animate-spin" /> : channel.status === 'completed' ? <CheckCircle2 size={18} /> : i + 1}
                                      </div>
                                      <input value={channel.url} onChange={(e) => updateChannelUrl(channel.id, e.target.value)} disabled={channel.status === 'analyzing'} placeholder="Dán URL video đối thủ (TikTok, YouTube, Facebook...)" className="bg-transparent border-none outline-none text-white font-mono text-sm flex-1 placeholder:text-slate-800" />
                                      {channels.length > 1 && <button onClick={() => removeChannel(channel.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors"><X size={18}/></button>}
                                  </div>

                                  {channel.profile && (
                                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-10 animate-fade-in relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700"><Dna size={120} /></div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="space-y-3">
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Sparkles size={12} className="text-primary"/> {t.dna_hook_style}</div>
                                                <div className="p-4 bg-slate-950 rounded-2xl border border-primary/20 text-xs text-white font-bold uppercase tracking-tight shadow-inner group-hover:border-primary/40 transition-all">
                                                    {channel.profile.structure.hook_type || "N/A"}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Activity size={12} className="text-green-500"/> {t.dna_pacing}</div>
                                                <div className="p-4 bg-slate-950 rounded-2xl border border-green-500/20 text-xs text-white font-bold uppercase tracking-tight shadow-inner">
                                                    {channel.profile.structure.pacing || "N/A"} ({channel.profile.structure.visual_pacing_avg}ms)
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><HeartPulse size={12} className="text-red-500"/> {t.dna_emotional_curve}</div>
                                                <div className="flex gap-2 flex-wrap">
                                                    {channel.profile.emotional_curve.map((e, idx) => (
                                                        <span key={idx} className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[9px] font-black text-slate-300 uppercase tracking-tighter hover:text-white transition-colors">{e}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Algorithm Compatibility</h4>
                                                <span className="text-xl font-black text-white">{channel.profile.algorithm_fit_score}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden shadow-inner">
                                                <div className="h-full bg-primary shadow-neon transition-all duration-1000" style={{ width: `${channel.profile.algorithm_fit_score}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button onClick={() => { setStudioSettings({...studioSettings, topic: channel.profile?.keywords[0] || ""}); setActiveStudioTab('studio'); }} className="flex-1 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-neon hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                                                <Zap size={18} /> Clone DNA to Script Engine
                                            </button>
                                        </div>
                                    </div>
                                  )}
                              </div>
                          ))}
                      </div>

                      <div className="pt-8 border-t border-slate-800 flex justify-center">
                          <NeonButton onClick={handleRunAnalysis} disabled={status === 'analyzing' || channels.every(c => !c.url.trim())} size="lg" className="min-w-[400px] h-16 shadow-neon">
                              {status === 'analyzing' ? <Loader2 size={24} className="animate-spin" /> : <Radar size={24} />}
                              {status === 'analyzing' ? "Infiltrating Metadata..." : "Initiate DNA Autopsy"}
                          </NeonButton>
                      </div>
                  </div>
              )}

              {activeStudioTab === 'studio' && (
                  <div className="animate-fade-in space-y-6">
                      {!generatedPlan ? (
                          <div className="bg-[#070B14]/80 border border-slate-800 rounded-[32px] p-12 flex flex-col items-center justify-center text-center space-y-10 backdrop-blur-xl shadow-2xl">
                               <div className="w-24 h-24 bg-slate-950 rounded-[32px] flex items-center justify-center border border-slate-800/50 opacity-40 shadow-inner group relative">
                                   <div className="absolute inset-0 bg-primary/5 rounded-[32px] animate-pulse"></div>
                                   <BrainCircuit size={56} className="text-primary" />
                               </div>
                               <div className="space-y-3">
                                   <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Strategic Factory Locked</h4>
                                   <p className="text-slate-500 text-sm max-w-sm italic">"Kịch bản sẽ được băm nhỏ thành các Scene để xử lý phái sinh, đảm bảo không trùng lặp DNA gốc."</p>
                               </div>
                               <div className="w-full max-w-md relative">
                                  <input value={studioSettings.topic} onChange={(e) => setStudioSettings({...studioSettings, topic: e.target.value})} placeholder="Topic hoặc từ khóa chiến dịch..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm text-white font-bold outline-none focus:border-primary shadow-inner transition-all" />
                               </div>
                               <NeonButton onClick={handleGenerateScript} disabled={status === 'generating' || !studioSettings.topic} className="w-full max-w-md h-16">
                                   {status === 'generating' ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                                   {status === 'generating' ? "Processing DNA..." : "Synthesize AI Script"}
                               </NeonButton>
                          </div>
                      ) : (
                          <PlanResult data={generatedPlan} videoUrl={null} t={t} />
                      )}
                  </div>
              )}

              {activeStudioTab === 'library' && (
                <div className="animate-fade-in space-y-6">
                    <div className="bg-[#070B14]/80 border border-slate-800 rounded-[32px] p-10 backdrop-blur-xl shadow-2xl space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3"><Library className="text-primary" size={28} /> Video Archive</h3>
                            <div className="w-full md:w-80 relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors"><SearchIcon size={20} /></div>
                                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm kiếm trong kho..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-xs text-white font-bold outline-none focus:border-primary shadow-inner transition-all" />
                            </div>
                        </div>

                        {filteredArchive.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredArchive.map((video) => (
                                    <div key={video.id} className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden group hover:border-primary/40 transition-all shadow-xl flex flex-col">
                                        <div className="aspect-[9/16] bg-black relative flex items-center justify-center overflow-hidden">
                                            {video.thumbnail ? <img src={video.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" alt={video.title} /> : <div className="p-10 bg-slate-950/50 rounded-full border border-white/5"><VideoIcon size={36} className="text-slate-700" /></div>}
                                            <a href={video.url} target="_blank" className="absolute top-4 right-4 p-2.5 bg-black/60 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"><Download size={18}/></a>
                                        </div>
                                        <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-black text-white line-clamp-2 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{video.title}</h4>
                                                <div className="flex items-center gap-2 text-slate-500"><Clock size={12} /><span className="text-[10px] font-mono">{new Date(video.timestamp).toLocaleDateString()}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center space-y-4">
                                <SearchIcon size={80} />
                                <h4 className="text-2xl font-black uppercase tracking-tighter">Archive Empty</h4>
                            </div>
                        )}
                    </div>
                </div>
              )}
          </div>

          <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#0A101F] border border-slate-800 rounded-[32px] p-8 shadow-2xl backdrop-blur-md">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3"><Zap size={18} className="text-primary" /> Render Constraints</h3>
                  <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Character Lock</label>
                            <button onClick={() => setStudioSettings({...studioSettings, characterLock: !studioSettings.characterLock})} className={`p-2 rounded-xl border transition-all ${studioSettings.characterLock ? 'bg-primary/20 border-primary text-primary shadow-neon' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                              {studioSettings.characterLock ? <Lock size={16}/> : <Unlock size={16}/>}
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Consistency</label>
                            <button onClick={() => setStudioSettings({...studioSettings, styleLock: !studioSettings.styleLock})} className={`p-2 rounded-xl border transition-all ${studioSettings.styleLock ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-neon' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                              {studioSettings.styleLock ? <ShieldCheck size={16}/> : <Layers size={16}/>}
                            </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Viral DNA Adherence</label>
                            <span className="text-[11px] font-black text-primary">{studioSettings.hookStrength}%</span>
                          </div>
                          <input type="range" min="50" max="100" value={studioSettings.hookStrength} onChange={(e) => setStudioSettings({...studioSettings, hookStrength: parseInt(e.target.value)})} className="w-full accent-primary bg-slate-950 h-2 rounded-full cursor-pointer" />
                      </div>

                      <NeonButton onClick={handleRenderCycle} disabled={!generatedPlan || isRendering} className="w-full h-16 uppercase text-xs font-black shadow-neon">
                          {isRendering ? <Loader2 size={18} className="animate-spin" /> : <Film size={18} />}
                          {isRendering ? "RENDERING..." : "Initiate Final Render"}
                      </NeonButton>
                  </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-[32px] p-8 space-y-4">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><Lightbulb size={24}/></div>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight">AI Strategy Insight</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 italic leading-relaxed">"Sử dụng Target Autopsy sẽ giúp AI trích xuất các nhãn dán thị giác (visual tags) quan trọng nhất khiến video dễ dàng lên xu hướng."</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ViralDNAStudio;
