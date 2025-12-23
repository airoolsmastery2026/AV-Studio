
import { Bot, Send, X, Mic, MicOff, Zap, Volume2, VolumeX, Activity, UserCheck, Play, Loader2, Waves, ChevronDown, ExternalLink, Globe, Search, BrainCircuit, Sparkles, Terminal, Dna, Plus, Trash2, LayoutGrid, Layers, Radar, Target, BarChart2, Gauge, Info, TrendingUp, ChevronRight, Video as VideoIcon, Film, AlertTriangle, CheckCircle2, Filter, Library, SearchIcon, Clock, Download, ZapOff, BarChart3, Eraser, Scissors, ShoppingCart, Link, Columns, ChevronUp, Flame, TrendingDown, MoveUpRight, BarChartHorizontal, Rocket, Lightbulb, Lock, Unlock, ShieldCheck } from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ApiKeyConfig, KnowledgeBase, ScriptModel, VisualModel, VoiceModel, 
  VideoResolution, AspectRatio, OrchestratorResponse, SEOAudit, ViralDNAProfile, StudioSettings, AppLanguage, ContentLanguage, CompetitorChannel, CompletedVideo, ChannelIntelligence, ABTestMetadata 
} from '../types';
import NeonButton from './NeonButton';
import ModelSelector from './ModelSelector';
import PlanResult from './PlanResult';
import ABThumbnailTester from './ABThumbnailTester';
// Fixed the missing scanChannelIntelligence by adding it to types.ts and geminiService.ts
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
}

const ViralDNAStudio: React.FC<ViralDNAStudioProps> = ({ 
  predefinedTopic, apiKeys, appLanguage, contentLanguage, setContentLanguage, 
  knowledgeBase, scriptModel, setScriptModel, visualModel, setVisualModel, 
  voiceModel, setVoiceModel, setResolution, aspectRatio, setAspectRatio,
  completedVideos = [], setCompletedVideos, t 
}) => {
  const [activeStudioTab, setActiveStudioTab] = useState<'recon' | 'studio' | 'library'>('recon');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'generating' | 'done'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [isChannelScanMode, setIsChannelScanMode] = useState(false);
  const [channelIntel, setChannelIntel] = useState<ChannelIntelligence | null>(null);
  const [selectedVideoForAB, setSelectedVideoForAB] = useState<string | null>(null);

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
      addLog("CHANNEL_RECON", `Initiating Multimodal Analysis for: ${validChannels[0].url}...`);
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
          extractViralDNA(process.env.API_KEY!, [ch.url], "VidIQ-Enhanced Deep Recon", contentLanguage),
          runSeoAudit(ch.url, "Competitor Analysis Mode", "Affiliate Market")
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

    const results = await Promise.all(analysisTasks);
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

  const filteredArchive = useMemo(() => {
    if (!searchQuery) return completedVideos;
    const query = searchQuery.toLowerCase();
    return completedVideos.filter(v => 
      v.title.toLowerCase().includes(query)
    );
  }, [completedVideos, searchQuery]);

  const addLog = (tag: string, detail: string) => {
    console.log(`[${tag}] ${detail}`);
  };

  const startABTest = (videoId: string) => {
    setSelectedVideoForAB(videoId);
  };

  const handleWinnerSelect = (winner: 'A' | 'B') => {
    if (!selectedVideoForAB || !setCompletedVideos) return;
    
    setCompletedVideos(prev => prev.map(v => {
      if (v.id === selectedVideoForAB) {
        const url = winner === 'A' ? v.ab_test?.variant_a_url : v.ab_test?.variant_b_url;
        return { 
          ...v, 
          thumbnail: url || v.thumbnail,
          ab_test: v.ab_test ? { ...v.ab_test, winner } : undefined
        };
      }
      return v;
    }));
    setSelectedVideoForAB(null);
  };

  const handleUpdateABUrls = (urls: { a: string; b: string }) => {
    if (!selectedVideoForAB || !setCompletedVideos) return;
    setCompletedVideos(prev => prev.map(v => {
      if (v.id === selectedVideoForAB) {
        return {
          ...v,
          ab_test: {
            variant_a_url: urls.a,
            variant_b_url: urls.b,
            variant_a_ctr: v.ab_test?.variant_a_ctr || 0,
            variant_b_ctr: v.ab_test?.variant_b_ctr || 0,
            test_started_at: v.ab_test?.test_started_at || Date.now()
          }
        };
      }
      return v;
    }));
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20 max-w-[1600px] mx-auto">
      {/* Header Studio Navigation */}
      <div className="bg-[#0A101F] border border-slate-800/60 rounded-[32px] p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-4">
              <div className="p-3.5 bg-primary/10 rounded-2xl border border-primary/20 shadow-neon">
                <Scissors className="text-primary" size={28} />
              </div>
              <div>
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase leading-tight">Clone & Dissection Studio</h2>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'idle' ? 'bg-green-500' : 'bg-primary animate-pulse'}`}></div>
                    <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.15em]">
                      {status === 'idle' ? "Neural Radar Ready" : "Extracting Multimodal Success Patterns..."}
                    </span>
                  </div>
              </div>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800/50 shadow-inner w-full md:w-auto overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveStudioTab('recon')} 
                className={`flex-1 md:flex-none px-4 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest whitespace-nowrap ${activeStudioTab === 'recon' ? 'bg-primary text-white shadow-neon' : 'text-slate-500 hover:text-white'}`}
              >
                1. Target Autopsy
              </button>
              <button 
                onClick={() => setActiveStudioTab('studio')} 
                className={`flex-1 md:flex-none px-4 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest whitespace-nowrap ${activeStudioTab === 'studio' ? 'bg-primary text-white shadow-neon' : 'text-slate-500 hover:text-white'}`}
              >
                2. Genetic Cloning
              </button>
              <button 
                onClick={() => setActiveStudioTab('library')} 
                className={`flex-1 md:flex-none px-4 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest whitespace-nowrap ${activeStudioTab === 'library' ? 'bg-primary text-white shadow-neon' : 'text-slate-500 hover:text-white'}`}
              >
                Media Archive
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
              {activeStudioTab === 'recon' && (
                  <div className="bg-[#070B14]/80 border border-slate-800 rounded-[32px] p-6 md:p-10 animate-fade-in space-y-8 relative overflow-hidden backdrop-blur-xl shadow-2xl">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none"><Radar size={200} /></div>
                      
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                              <Target className="text-red-500 animate-pulse" size={24} /> Multimodal Acquisition
                            </h3>
                            <p className="text-slate-500 text-xs italic font-medium leading-relaxed max-w-2xl">"Hệ thống thực hiện giải phẫu Frame-by-Frame kết hợp VidIQ Intelligence để trích xuất nhịp điệu (Visual Pacing) và Character DNA của đối thủ."</p>
                        </div>
                        <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
                            <button 
                              onClick={() => { setIsChannelScanMode(false); clearChannels(); }} 
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${!isChannelScanMode ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                            >Video Mode</button>
                            <button 
                              onClick={() => { setIsChannelScanMode(true); setChannels([{ id: '1', url: '', name: 'Target Channel', status: 'pending', isExpanded: false }]); }} 
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${isChannelScanMode ? 'bg-red-500 text-white shadow-neon' : 'text-slate-500'}`}
                            >Deep Channel Scan</button>
                        </div>
                      </div>

                      <div className="space-y-4">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{isChannelScanMode ? 'Primary Target Channel' : `Parallel Multimodal Recon (${channels.length})`}</span>
                            <div className="flex gap-4">
                              <button onClick={clearChannels} className="text-[9px] font-black text-slate-600 hover:text-red-500 uppercase flex items-center gap-1.5 transition-colors">
                                <Eraser size={14} /> Reset Radar
                              </button>
                              {!isChannelScanMode && (
                                <button onClick={addChannel} className="text-[9px] font-black text-primary hover:text-white uppercase flex items-center gap-1.5 transition-colors">
                                  <Plus size={14} /> Add Target
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div className="max-h-[320px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                            {channels.map((channel, i) => (
                                <div key={channel.id} className={`group relative flex items-center gap-3 bg-slate-950/60 p-3.5 rounded-2xl border transition-all shadow-lg focus-within:border-primary/50 ${channel.status === 'analyzing' ? 'border-primary/40 bg-primary/5 animate-pulse' : 'border-slate-800/60 hover:border-primary/30'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-[10px] font-black transition-colors ${channel.status === 'completed' ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-slate-900 border-slate-800 text-primary group-hover:bg-primary/10'}`}>
                                      {channel.status === 'analyzing' ? <Loader2 size={14} className="animate-spin" /> : channel.status === 'completed' ? <CheckCircle2 size={14} /> : i + 1}
                                    </div>
                                    <input 
                                        value={channel.url}
                                        onChange={(e) => updateChannelUrl(channel.id, e.target.value)}
                                        disabled={channel.status === 'analyzing'}
                                        placeholder={isChannelScanMode ? "Dán URL kênh (e.g. youtube.com/@user)..." : "Dán URL video đối thủ (TikTok/YT Shorts)..."}
                                        className="bg-transparent border-none outline-none text-white font-mono text-xs flex-1 placeholder:text-slate-800 disabled:opacity-50"
                                    />
                                    {!isChannelScanMode && channels.length > 1 && channel.status !== 'analyzing' && (
                                      <button onClick={() => removeChannel(channel.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                                        <X size={16} />
                                      </button>
                                    )}
                                </div>
                            ))}
                          </div>
                      </div>

                      {/* Display Individual Video Autopsy results */}
                      {!isChannelScanMode && channels.some(c => c.profile || c.status === 'error' || c.seoAudit) && (
                        <div className="pt-6 border-t border-slate-800 space-y-4">
                          <div className="flex justify-between items-center px-1">
                            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Multimodal & SEO Extraction Results</h4>
                          </div>
                          <div className="flex flex-col gap-6">
                            {channels.filter(c => c.profile || c.status === 'error' || c.seoAudit).map((ch) => (
                              <div key={ch.id} className={`border rounded-[32px] overflow-hidden animate-fade-in shadow-xl transition-all ${ch.status === 'error' ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-900 border-slate-800 hover:border-primary/40'}`}>
                                <div className="p-6 md:p-8 space-y-6">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${ch.status === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-primary/20 text-primary'}`}>
                                        {ch.status === 'error' ? <AlertTriangle size={20}/> : <BarChart3 size={20}/>}
                                      </div>
                                      <div className="min-w-0">
                                        <span className="text-xs font-black text-white uppercase block truncate max-w-[300px]">{ch.name}</span>
                                        <span className="text-[10px] text-slate-600 truncate block max-w-[300px]">{ch.url}</span>
                                      </div>
                                    </div>
                                    <button onClick={() => toggleExpand(ch.id)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                      {ch.isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                    </button>
                                  </div>
                                  
                                  {ch.status === 'error' ? (
                                    <div className="py-8 text-center bg-black/20 rounded-2xl border border-dashed border-red-500/20">
                                      <ZapOff size={28} className="text-slate-700 mx-auto mb-3" />
                                      <p className="text-[10px] text-slate-500 italic px-4">Neural failure at this node.</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-6">
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center shadow-inner group">
                                          <div className="text-[8px] text-slate-500 font-black uppercase mb-1 group-hover:text-primary transition-colors">Visual Pacing</div>
                                          <div className="text-2xl font-black text-primary">{ch.profile?.structure.visual_pacing_avg || '--'}ms</div>
                                        </div>
                                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center shadow-inner group">
                                          <div className="text-[8px] text-slate-500 font-black uppercase mb-1 group-hover:text-white transition-colors">Style Match</div>
                                          <div className="text-2xl font-black text-white">{ch.profile?.algorithm_fit_score || '--'}%</div>
                                        </div>
                                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center shadow-inner group">
                                          <div className="text-[8px] text-slate-500 font-black uppercase mb-1 group-hover:text-blue-500 transition-colors">SEO Index</div>
                                          <div className="text-2xl font-black text-blue-500">{ch.seoAudit?.seo_score || '--'}</div>
                                        </div>
                                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center shadow-inner group">
                                          <div className="text-[8px] text-slate-500 font-black uppercase mb-1 group-hover:text-accent transition-colors">Sentiment</div>
                                          <div className={`text-sm font-black uppercase text-green-500`}>Positive</div>
                                        </div>
                                      </div>

                                      {/* Expanded Details */}
                                      {ch.isExpanded && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800 animate-fade-in">
                                           <div className="space-y-4">
                                              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                                                 <h5 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                                   <UserCheck size={14}/> Extracted Character Traits
                                                 </h5>
                                                 <p className="text-[10px] text-slate-400 italic">"Confident young expert, tech-focused, cinematic lighting, 4K clarity, professional attire."</p>
                                              </div>
                                           </div>

                                           <div className="space-y-4">
                                              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 h-full">
                                                 <h5 className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                   <Zap size={14}/> Optimization Suggestions
                                                 </h5>
                                                 <div className="space-y-3">
                                                    {ch.seoAudit?.title_optimization_suggestions.slice(0, 2).map((title, idx) => (
                                                      <div key={idx} className="text-[10px] text-slate-300 italic border-l-2 border-primary/30 pl-3 leading-relaxed">"{title}"</div>
                                                    ))}
                                                 </div>
                                              </div>
                                           </div>
                                        </div>
                                      )}

                                      <div className="flex gap-3">
                                        <button 
                                          onClick={() => {
                                            setStudioSettings({...studioSettings, topic: ch.seoAudit?.suggested_tags[0] || studioSettings.topic});
                                            setActiveStudioTab('studio');
                                          }} 
                                          className="flex-1 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 hover:text-white hover:bg-slate-800 hover:border-primary transition-all uppercase tracking-[0.2em] shadow-inner flex items-center justify-center gap-2"
                                        >
                                          <Dna size={16} /> Proceed to Advanced Cloning
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-6 flex justify-center">
                          <NeonButton onClick={handleRunAnalysis} disabled={status === 'analyzing' || channels.every(c => !c.url.trim())} size="lg" className="min-w-[360px] h-16 shadow-neon">
                              {status === 'analyzing' ? <Loader2 className="animate-spin" /> : isChannelScanMode ? <SearchIcon size={20} /> : <Radar size={20} />}
                              {status === 'analyzing' ? `Analyzing targets...` : isChannelScanMode ? "Start Multimodal Scan" : `Initiate Multimodal Recon`}
                          </NeonButton>
                      </div>
                  </div>
              )}

              {activeStudioTab === 'studio' && (
                  <div className="animate-fade-in space-y-6">
                      {!generatedPlan ? (
                          <div className="bg-[#070B14]/80 border border-slate-800 rounded-[32px] p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-8 backdrop-blur-xl shadow-2xl">
                               <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-950 rounded-3xl flex items-center justify-center border border-slate-800/50 opacity-40 shadow-inner group relative">
                                   <div className="absolute inset-0 bg-primary/5 rounded-3xl animate-pulse"></div>
                                   <BrainCircuit size={48} className="text-primary" />
                               </div>
                               <div className="space-y-2">
                                   <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Advanced Production Locked</h4>
                                   <p className="text-slate-500 text-xs md:text-sm max-w-sm italic">"Cung cấp tín hiệu kịch bản để AI bắt đầu quá trình tổng hợp phái sinh với Character Lock đồng nhất."</p>
                               </div>
                               <div className="w-full max-w-md relative">
                                  <input 
                                      value={studioSettings.topic} 
                                      onChange={(e) => setStudioSettings({...studioSettings, topic: e.target.value})}
                                      placeholder="What's the core mission or product?" 
                                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 md:p-5 text-xs md:text-sm text-white font-bold outline-none focus:border-primary shadow-inner transition-all" 
                                  />
                               </div>
                               <NeonButton onClick={handleGenerateScript} disabled={status === 'generating' || !studioSettings.topic} className="w-full max-w-md h-16">
                                   {status === 'generating' ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                                   {status === 'generating' ? "Synchronizing DNA..." : "Start Multimodal Cloning"}
                               </NeonButton>
                          </div>
                      ) : (
                          <PlanResult data={generatedPlan} videoUrl={null} t={t} />
                      )}
                  </div>
              )}

              {activeStudioTab === 'library' && (
                <div className="animate-fade-in space-y-6">
                    {/* A/B Testing Modal-like Overlay */}
                    {selectedVideoForAB && (
                      <div className="space-y-4">
                        <button 
                          onClick={() => setSelectedVideoForAB(null)}
                          className="text-[10px] font-black text-slate-500 hover:text-white uppercase flex items-center gap-1 transition-colors"
                        >
                          <ChevronRight className="rotate-180" size={14}/> Back to Archive
                        </button>
                        <ABThumbnailTester 
                          initialData={completedVideos.find(v => v.id === selectedVideoForAB)?.ab_test}
                          onSelectWinner={handleWinnerSelect}
                          onUpdateUrls={handleUpdateABUrls}
                        />
                      </div>
                    )}

                    <div className={`${selectedVideoForAB ? 'hidden' : 'bg-[#070B14]/80'} border border-slate-800 rounded-[32px] p-6 md:p-10 backdrop-blur-xl shadow-2xl space-y-8`}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                    <Library className="text-primary" size={24} /> Video Archive
                                </h3>
                                <p className="text-slate-500 text-xs font-medium">Lưu trữ các phiên bản phái sinh đã tạo.</p>
                            </div>
                            
                            <div className="w-full md:w-80 relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors">
                                    <SearchIcon size={18} />
                                </div>
                                <input 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search archive..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-white font-bold outline-none focus:border-primary shadow-inner transition-all"
                                />
                            </div>
                        </div>

                        {filteredArchive.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredArchive.map((video) => (
                                    <div key={video.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group hover:border-primary/40 transition-all shadow-xl flex flex-col">
                                        <div className="aspect-[9/16] bg-black relative flex items-center justify-center overflow-hidden">
                                            {video.thumbnail ? (
                                                <img src={video.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" alt={video.title} />
                                            ) : (
                                                <div className="p-10 bg-slate-950/50 rounded-full border border-white/5">
                                                    <VideoIcon size={32} className="text-slate-700" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                                            <div className="space-y-1">
                                                <h4 className="text-xs font-black text-white line-clamp-2 uppercase tracking-tight leading-tight">{video.title}</h4>
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Clock size={10} />
                                                    <span className="text-[9px] font-mono">{new Date(video.timestamp).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <button 
                                              onClick={() => startABTest(video.id)}
                                              className="w-full py-2 bg-slate-950 border border-slate-800 rounded-xl text-[9px] font-black text-slate-500 hover:text-white hover:border-primary transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                            >
                                              <Columns size={12}/> {video.ab_test ? 'Review A/B Test' : 'Setup A/B Test'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center space-y-4">
                                <SearchIcon size={64} />
                                <h4 className="text-xl font-black uppercase tracking-tighter">No assets staged yet</h4>
                            </div>
                        )}
                    </div>
                </div>
              )}
          </div>

          {/* Right Strategy Sidebar */}
          <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#0A101F] border border-slate-800 rounded-[32px] p-6 md:p-8 shadow-2xl backdrop-blur-md">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Zap size={16} className="text-primary" /> Multi-Layer Constraints
                  </h3>
                  <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em]">Character Lock (Consistency)</label>
                            <button 
                              onClick={() => setStudioSettings({...studioSettings, characterLock: !studioSettings.characterLock})}
                              className={`p-1.5 rounded-lg border transition-all ${studioSettings.characterLock ? 'bg-primary/20 border-primary text-primary shadow-neon' : 'bg-slate-900 border-slate-800 text-slate-600'}`}
                            >
                              {studioSettings.characterLock ? <Lock size={14}/> : <Unlock size={14}/>}
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em]">Visual Style Lock</label>
                            <button 
                              onClick={() => setStudioSettings({...studioSettings, styleLock: !studioSettings.styleLock})}
                              className={`p-1.5 rounded-lg border transition-all ${studioSettings.styleLock ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-neon' : 'bg-slate-900 border-slate-800 text-slate-600'}`}
                            >
                              {studioSettings.styleLock ? <ShieldCheck size={14}/> : <Layers size={14}/>}
                            </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em]">Viral Pattern Strength</label>
                            <span className="text-[10px] font-black text-primary">{studioSettings.hookStrength}%</span>
                          </div>
                          <input type="range" min="50" max="100" value={studioSettings.hookStrength} onChange={(e) => setStudioSettings({...studioSettings, hookStrength: parseInt(e.target.value)})} className="w-full accent-primary bg-slate-950 h-1.5 rounded-full" />
                      </div>

                      <NeonButton onClick={() => {}} disabled={!generatedPlan} className="w-full h-14 uppercase text-[11px] font-black shadow-neon">
                          Initiate Render Cycle
                      </NeonButton>
                  </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-[32px] p-6 flex items-start gap-4">
                  <Info className="text-primary shrink-0" size={20} />
                  <p className="text-[10px] text-slate-400 italic leading-relaxed">
                    "Character Lock đảm bảo nhân vật AI của bạn không bị biến dạng qua các scene quay bằng VEO. Điều này giúp tăng độ chuyên nghiệp cho kênh."
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ViralDNAStudio;
