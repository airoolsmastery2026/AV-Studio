
import React, { useState, useEffect } from 'react';
import { 
  Dna, FileText, MonitorPlay, Sparkles, AlertTriangle,
  Search, Plus, X, Loader2, BrainCircuit, BarChart2, Zap, Gauge, Info, Target, TrendingUp, Activity, BarChartHorizontal, ShieldCheck, Radar, 
  Layers, Scissors, Globe, ArrowRight, MousePointer2, Settings, ChevronRight, CheckCircle2, Waves, Hash
} from 'lucide-react';
import { 
  ApiKeyConfig, KnowledgeBase, ScriptModel, VisualModel, VoiceModel, 
  VideoResolution, AspectRatio, OrchestratorResponse, SEOAudit, ViralDNAProfile, StudioSettings, AppLanguage, ContentLanguage, CompetitorChannel
} from '../types';
import NeonButton from './NeonButton';
import ModelSelector from './ModelSelector';
import PlanResult from './PlanResult';
import { generateProScript, runSeoAudit, runNeuralOverhaul, extractViralDNA } from '../services/geminiService';

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
  t: any;
}

const ViralDNAStudio: React.FC<ViralDNAStudioProps> = ({ 
  predefinedTopic, apiKeys, appLanguage, contentLanguage, setContentLanguage, 
  knowledgeBase, scriptModel, setScriptModel, visualModel, setVisualModel, 
  voiceModel, setVoiceModel, setResolution, aspectRatio, setAspectRatio, t 
}) => {
  const [activeStudioTab, setActiveStudioTab] = useState<'recon' | 'studio'>('recon');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'generating' | 'auditing' | 'overhauling' | 'done'>('idle');
  
  const [channels, setChannels] = useState<CompetitorChannel[]>([
    { id: '1', url: '', name: 'Nguồn Alpha', status: 'pending' }
  ]);

  const [dnaProfile, setDnaProfile] = useState<ViralDNAProfile | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<OrchestratorResponse | null>(null);
  const [seoAudit, setSeoAudit] = useState<SEOAudit | null>(null);
  
  const [studioSettings, setStudioSettings] = useState<StudioSettings>({
    quality: 'Standard',
    aspectRatio: '9:16',
    model: 'Balanced',
    hookStrength: 85,
    storyMode: 'One-shot',
    riskLevel: 'Safe',
    videoFormat: 'Shorts',
    contentLanguage: contentLanguage,
    topic: predefinedTopic || '',
    generationMode: 'Free Storyboard',
    characterLock: false,
    styleLock: false,
    musicSync: true
  });

  const handleAddChannel = () => {
    if (channels.length >= 3) return;
    setChannels([...channels, { id: crypto.randomUUID(), url: '', name: `Tín hiệu ${channels.length + 1}`, status: 'pending' }]);
  };

  const handleRemoveChannel = (id: string) => {
    if (channels.length > 1) setChannels(channels.filter(c => c.id !== id));
  };

  const handleRunAnalysis = async () => {
    const key = apiKeys.find(k => k.provider === 'google' && k.status === 'active')?.key;
    const urls = channels.map(c => c.url.trim()).filter(u => u !== '');
    if (urls.length === 0) return;

    setStatus('analyzing');
    setChannels(prev => prev.map(c => c.url.trim() ? { ...c, status: 'analyzing' } : c));

    try {
        const dna = await extractViralDNA(key || '', urls, "VidIQ Deep Audit", contentLanguage);
        setDnaProfile(dna);
        setStudioSettings(s => ({ ...s, topic: dna.keywords?.[0] || studioSettings.topic }));
        setChannels(prev => prev.map(c => c.url.trim() ? { ...c, status: 'completed', dna_preview: dna.keywords?.slice(0, 3).join(', ') } : c));
        setStatus('done');
    } catch (e: any) { 
        setChannels(prev => prev.map(c => c.status === 'analyzing' ? { ...c, status: 'error' } : c));
        setStatus('idle'); 
    }
  };

  const handleGenerateScript = async () => {
    const key = apiKeys.find(k => k.provider === 'google' && k.status === 'active')?.key;
    setStatus('generating');
    try {
        let profile: ViralDNAProfile = dnaProfile || {
          structure: { hook_type: 'Lợi ích', pacing: 'Fast', avg_scene_duration: 3 },
          emotional_curve: ['Tò mò', 'Hào hứng'],
          keywords: studioSettings.topic.split(' '),
          algorithm_fit_score: 90,
          risk_level: 'Safe'
        };

        let plan = await generateProScript(key || '', profile, studioSettings, knowledgeBase);
        
        setStatus('auditing');
        let audit = await runSeoAudit(plan.generated_content?.title || '', plan.generated_content?.description || studioSettings.topic, studioSettings.topic);
        
        if (audit.seo_score < 70) {
            setStatus('overhauling');
            plan = await runNeuralOverhaul(plan, audit);
            audit = await runSeoAudit(plan.generated_content?.title || '', plan.generated_content?.description || studioSettings.topic, studioSettings.topic);
        }

        setGeneratedPlan(plan);
        setSeoAudit(audit);
        setStatus('done');
    } catch (e: any) { 
      console.error(e);
      setStatus('idle'); 
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-[1600px] mx-auto animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-2xl shadow-neon">
              <Dna className="text-primary" size={32} />
            </div>
            Xưởng Phim DNA <span className="text-primary/50 text-xl font-mono">v4.0</span>
          </h1>
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mt-2">Môi trường sản xuất kịch bản phái sinh & tối ưu thuật toán</p>
        </div>

        <div className="flex bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl ring-1 ring-white/5">
          <button 
            onClick={() => setActiveStudioTab('recon')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeStudioTab === 'recon' ? 'bg-primary text-white shadow-neon' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Radar size={14} /> {t.studio_tab_1}
          </button>
          <button 
            onClick={() => setActiveStudioTab('studio')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeStudioTab === 'studio' ? 'bg-primary text-white shadow-neon' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <MonitorPlay size={14} /> {t.studio_tab_3}
          </button>
        </div>
      </div>

      {activeStudioTab === 'recon' ? (
        <div className="space-y-8 animate-fade-in">
          {/* RECON CONTROL PANEL */}
          <div className="bg-slate-950 border border-slate-800 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
                <Radar size={200} className="text-primary" />
            </div>
            
            <div className="flex justify-between items-center mb-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-10 bg-primary rounded-full shadow-neon"></div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{t.studio_recon_title}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Sử dụng Google Search Grounding để giải mã tín hiệu viral</p>
                  </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
                        <Globe size={14} className="text-primary" />
                        <span className="text-[9px] text-slate-400 font-black uppercase">Deep Web Scanning Active</span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {channels.map((c, idx) => (
                    <div key={c.id} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-4 group/card relative overflow-hidden hover:border-primary/40 transition-all shadow-inner">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-slate-950 flex items-center justify-center text-primary border border-slate-800">{idx+1}</div>
                                {c.name}
                            </span>
                            <button onClick={() => handleRemoveChannel(c.id)} className="text-slate-700 hover:text-red-500 transition-colors bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                                <X size={14}/>
                            </button>
                        </div>
                        <div className="relative">
                            <input 
                                value={c.url}
                                onChange={(e) => setChannels(prev => prev.map(ch => ch.id === c.id ? {...ch, url: e.target.value} : ch))}
                                placeholder="Link TikTok, YouTube Shorts, Reels..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:border-primary outline-none transition-all placeholder:text-slate-800 font-medium"
                            />
                            {c.status === 'analyzing' && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 size={16} className="text-primary animate-spin" /></div>}
                        </div>
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${c.status === 'completed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-700'}`}></span>
                                <span className={`text-[9px] font-black uppercase ${c.status === 'completed' ? 'text-green-500' : 'text-slate-500'}`}>{c.status}</span>
                             </div>
                             {c.dna_preview && <span className="text-[8px] text-slate-600 font-mono truncate max-w-[150px]">{c.dna_preview}</span>}
                        </div>
                    </div>
                ))}
                {channels.length < 3 && (
                    <button onClick={handleAddChannel} className="border-2 border-dashed border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-slate-600 hover:text-primary hover:border-primary transition-all bg-slate-900/10 group/add">
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 group-hover/add:bg-primary/10 group-hover/add:border-primary/50 transition-all mb-3">
                            <Plus size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{t.studio_add_source}</span>
                    </button>
                )}
            </div>

            <div className="mt-12 relative z-10">
                <NeonButton onClick={handleRunAnalysis} disabled={status === 'analyzing' || channels.every(c => !c.url.trim())} className="w-full h-16 text-lg font-black tracking-tighter shadow-2xl">
                    {status === 'analyzing' ? <Loader2 className="animate-spin" /> : <Zap className="fill-current" />}
                    {status === 'analyzing' ? "ĐANG CHIẾT XUẤT CẤU TRÚC DNA..." : "GIẢI MÃ VIRAL DNA (VIDIQ DEEP ANALYTICS)"}
                </NeonButton>
            </div>
          </div>

          {dnaProfile && (
            <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* BLUEPRINT HEADER */}
                <div className="lg:col-span-12 bg-slate-950 border border-slate-800 p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10"><ShieldCheck size={120} className="text-primary" /></div>
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10">
                        <div className="p-5 bg-primary/10 rounded-3xl text-primary shadow-neon border border-primary/20">
                            <BrainCircuit size={40} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Bản thiết kế Viral DNA</h3>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Cấu trúc phái sinh được AI tối ưu</span>
                                <div className="h-px bg-slate-800 flex-1"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <NeonButton onClick={() => setActiveStudioTab('studio')} className="px-8 h-14" size="md">
                                DÙNG DNA NÀY SẢN XUẤT <TrendingUp size={18} />
                            </NeonButton>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-inner group hover:border-primary/30 transition-all">
                            <div className="text-[9px] text-slate-500 font-black uppercase mb-2 tracking-widest flex items-center gap-2"><Target size={12} className="text-primary"/> Hook Strategy</div>
                            <div className="text-xl font-black text-white uppercase leading-tight group-hover:text-primary transition-colors">{dnaProfile.structure.hook_type}</div>
                        </div>
                        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-inner group hover:border-accent/30 transition-all">
                            <div className="text-[9px] text-slate-500 font-black uppercase mb-2 tracking-widest flex items-center gap-2"><Waves size={12} className="text-accent"/> Pacing & Rhytm</div>
                            <div className="text-xl font-black text-white uppercase group-hover:text-accent transition-colors">{dnaProfile.structure.pacing}</div>
                        </div>
                        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-inner group">
                            <div className="text-[9px] text-slate-500 font-black uppercase mb-2 tracking-widest flex items-center gap-2"><Gauge size={12} className="text-green-500"/> Algo-Fit Score</div>
                            <div className="text-4xl font-black text-green-500 group-hover:scale-110 transition-transform origin-left">{dnaProfile.algorithm_fit_score}%</div>
                        </div>
                        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-inner group">
                            <div className="text-[9px] text-slate-500 font-black uppercase mb-2 tracking-widest flex items-center gap-2"><ShieldCheck size={12} className="text-blue-500"/> Risk Assessment</div>
                            <div className="text-xl font-black text-blue-400 uppercase">{dnaProfile.risk_level || 'Safe'}</div>
                        </div>
                    </div>
                </div>

                {/* EMOTIONAL CURVE */}
                <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-8 rounded-[40px] space-y-6 shadow-xl">
                    <h4 className="text-xs font-black text-white uppercase flex items-center gap-3">
                        <BarChartHorizontal size={18} className="text-accent" /> Emotional Engagement Curve
                    </h4>
                    <div className="space-y-4">
                        {dnaProfile.emotional_curve.map((emo, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:text-primary group-hover:border-primary transition-all shadow-inner">{i+1}</div>
                                <div className="flex-1 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 group-hover:border-slate-700 transition-all">
                                    <span className="text-xs text-slate-300 font-bold uppercase tracking-tight">{emo}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* KEYWORD SYNERGY */}
                <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-8 rounded-[40px] space-y-6 shadow-xl flex flex-col">
                    <h4 className="text-xs font-black text-white uppercase flex items-center gap-3">
                        <Sparkles size={18} className="text-primary" /> Semantic Keyword Synergy
                    </h4>
                    <div className="flex-1 bg-slate-950 p-8 rounded-3xl border border-slate-800 shadow-inner">
                        <div className="flex flex-wrap gap-4">
                            {dnaProfile.keywords.map((kw, i) => (
                                <div key={i} className="px-5 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-black text-slate-400 hover:text-white hover:border-primary hover:bg-primary/5 transition-all cursor-default flex items-center gap-2">
                                    <Hash size={12} className="text-primary/50" />
                                    {kw.toUpperCase()}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                         <p className="text-[10px] text-slate-500 italic flex items-center gap-2">
                            <Info size={14} className="text-primary" /> AI đã tính toán bộ từ khóa có tỉ lệ cạnh tranh thấp nhưng lượng tìm kiếm cao nhất trong ngách này.
                         </p>
                    </div>
                </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-fade-in items-start">
          
          {/* PRODUCTION MAIN PANEL */}
          <div className="xl:col-span-8 space-y-10">
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-10 shadow-2xl space-y-8 relative overflow-hidden">
                {status === 'overhauling' && (
                  <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-xl z-20 flex flex-col items-center justify-center animate-fade-in border-4 border-amber-500/40 rounded-[40px] p-12 text-center">
                      <div className="p-6 bg-amber-500/20 rounded-full border border-amber-500/50 mb-6">
                        <AlertTriangle className="text-amber-500 animate-bounce" size={64} />
                      </div>
                      <h4 className="text-3xl font-black text-white uppercase tracking-tighter">{t.overhaul_active}</h4>
                      <p className="text-slate-300 text-sm font-medium mt-4 max-w-md leading-relaxed">{t.overhaul_desc}</p>
                      <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden mt-8">
                         <div className="h-full bg-amber-500 animate-[moveRight_2s_infinite]"></div>
                      </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
                            <BrainCircuit size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">{t.studio_tab_2}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Hệ thống kịch bản phái sinh tối ưu hóa SEO</p>
                        </div>
                    </div>
                    {status === 'generating' && (
                         <div className="flex items-center gap-3 px-4 py-2 bg-slate-950 rounded-xl border border-slate-800">
                             <Loader2 size={14} className="text-primary animate-spin" />
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Syncing...</span>
                         </div>
                    )}
                </div>

                <div className="relative">
                    <textarea 
                        value={studioSettings.topic}
                        onChange={(e) => setStudioSettings({...studioSettings, topic: e.target.value})}
                        placeholder="Mô tả mục tiêu sản phẩm, tính năng cốt lõi hoặc dán link affiliate..."
                        className="w-full h-48 bg-slate-950 border border-slate-800 rounded-[32px] p-8 text-white focus:border-primary outline-none resize-none shadow-inner text-base font-medium placeholder:text-slate-800 transition-all leading-relaxed"
                    />
                    <div className="absolute bottom-6 right-8 flex gap-3">
                         <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all"><Sparkles size={18} /></button>
                         <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all"><FileText size={18} /></button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <NeonButton onClick={handleGenerateScript} disabled={status === 'generating' || status === 'auditing' || status === 'overhauling'} className="flex-1 h-16 text-lg">
                        {status === 'generating' ? <Loader2 className="animate-spin" /> : status === 'auditing' ? <Gauge className="animate-pulse" /> : <Sparkles className="fill-current" />}
                        {status === 'generating' ? 'ĐANG SOẠN KỊCH BẢN...' : status === 'auditing' ? 'ĐANG ĐÁNH GIÁ SEO...' : status === 'overhauling' ? 'RE-STRUCTURING...' : t.studio_gen_script}
                    </NeonButton>
                    <button className="px-8 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white hover:border-slate-600 transition-all">
                        Lưu bản nháp
                    </button>
                </div>
            </div>

            {generatedPlan && (
                <div className="space-y-10 animate-fade-in">
                    <PlanResult data={generatedPlan} t={t} />
                    
                    {seoAudit && (
                        <div className="bg-slate-950 border border-slate-800 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Gauge size={120} className="text-purple-500" /></div>
                            
                            <div className="flex items-center gap-6 mb-10 border-b border-slate-800 pb-6">
                                <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-500 shadow-neon border border-purple-500/20">
                                    <TrendingUp size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{t.seo_score}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">VidIQ AI Predictive Engine</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                <div className="md:col-span-4 flex flex-col items-center justify-center p-10 bg-slate-900 rounded-[32px] border border-slate-800 shadow-inner group-hover:border-purple-500/30 transition-all">
                                    <div className="text-8xl font-black text-purple-500 tracking-tighter">{seoAudit.seo_score}</div>
                                    <div className="text-[10px] text-slate-500 font-black uppercase mt-4 tracking-widest">SEO Score / 100</div>
                                </div>
                                
                                <div className="md:col-span-8 space-y-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-sm">
                                            <div className="text-[9px] text-slate-500 uppercase font-black mb-2 tracking-widest">{t.keyword_difficulty}</div>
                                            <div className={`text-lg font-black uppercase ${seoAudit.keyword_difficulty === 'LOW' ? 'text-green-500' : 'text-yellow-500'}`}>{seoAudit.keyword_difficulty}</div>
                                        </div>
                                        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-sm">
                                            <div className="text-[9px] text-slate-500 uppercase font-black mb-2 tracking-widest">{t.viral_momentum}</div>
                                            <div className="text-lg font-black text-white uppercase">{seoAudit.trending_momentum}% Potential</div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Hashtag Synergy</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {seoAudit.suggested_tags.map((tag, i) => (
                                                <span key={i} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-[10px] text-slate-300 font-bold hover:border-purple-500 transition-all">#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
          </div>

          {/* SIDEBAR CONFIG */}
          <div className="xl:col-span-4 space-y-8 sticky top-24">
            <div className="bg-slate-950 border border-slate-800 rounded-[40px] p-8 shadow-2xl space-y-8">
                <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                    <Settings className="text-slate-500" size={20} />
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Cấu hình xuất bản</h3>
                </div>

                <ModelSelector 
                  scriptModel={scriptModel} setScriptModel={setScriptModel}
                  visualModel={visualModel} setVisualModel={setVisualModel}
                  voiceModel={voiceModel} setVoiceModel={setVoiceModel}
                  resolution="1080p" setResolution={setResolution}
                  aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
                  t={t}
                />

                <div className="pt-8 space-y-4 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500 border border-green-500/20">
                            <ShieldCheck size={16} />
                        </div>
                        <div className="flex-1">
                            <div className="text-[10px] text-white font-black uppercase">Originality Gate</div>
                            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Đã kiểm duyệt đạo văn</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 rounded-[40px] p-8 flex items-center gap-6 group hover:bg-primary/5 transition-all">
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 group-hover:border-primary/30">
                    <Zap size={24} className="text-primary" />
                </div>
                <div>
                    <h4 className="text-xs font-black text-white uppercase mb-1">Cần hỗ trợ?</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Hỏi AI Commander để tinh chỉnh kịch bản theo ý muốn.</p>
                </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ViralDNAStudio;
