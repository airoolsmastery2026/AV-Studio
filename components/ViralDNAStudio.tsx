
import React, { useState, useEffect } from 'react';
import { 
  Dna, FileText, MonitorPlay, Sparkles, AlertTriangle,
  Search, Plus, X, Loader2, BrainCircuit, BarChart2, Zap, Gauge, Info, Target, TrendingUp
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
        const dna = await extractViralDNA(key || '', urls, "Deep Audit", contentLanguage);
        setDnaProfile(dna);
        setStudioSettings(s => ({ ...s, topic: dna.keywords?.[0] || studioSettings.topic }));
        setChannels(prev => prev.map(c => c.url.trim() ? { ...c, status: 'completed', dna_preview: dna.keywords?.join(', ') } : c));
        setStatus('done');
        setTimeout(() => setActiveStudioTab('studio'), 800);
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
        
        // LOGIC AUTO-FIX: Kích hoạt NEURAL OVERHAUL nếu SEO thấp
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
    <div className="space-y-6">
      <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-fit">
        <button onClick={() => setActiveStudioTab('recon')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeStudioTab === 'recon' ? 'bg-primary text-white' : 'text-slate-500'}`}>{t.studio_tab_1}</button>
        <button onClick={() => setActiveStudioTab('studio')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeStudioTab === 'studio' ? 'bg-primary text-white' : 'text-slate-500'}`}>{t.studio_tab_3}</button>
      </div>

      {activeStudioTab === 'recon' ? (
        <div className="space-y-8 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Search className="text-primary" size={24} />
                  <h3 className="text-xl font-black text-white uppercase">{t.studio_recon_title}</h3>
                </div>
                <div className="flex gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
                    <Info size={14} className="text-slate-500" />
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Max 3 Sources</span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {channels.map((c) => (
                    <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 group relative overflow-hidden">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-600 uppercase">{c.name}</span>
                            <button onClick={() => handleRemoveChannel(c.id)} className="text-slate-700 hover:text-red-500 transition-colors"><X size={14}/></button>
                        </div>
                        <input 
                            value={c.url}
                            onChange={(e) => setChannels(prev => prev.map(ch => ch.id === c.id ? {...ch, url: e.target.value} : ch))}
                            placeholder="Dán link TikTok/YT..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-primary outline-none"
                        />
                        <div className="flex items-center gap-2">
                             {c.status === 'analyzing' && <Loader2 size={10} className="text-primary animate-spin" />}
                             <span className="text-[9px] font-black uppercase text-slate-500">{c.status}</span>
                        </div>
                    </div>
                ))}
                {channels.length < 3 && (
                    <button onClick={handleAddChannel} className="border-2 border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-600 hover:text-primary hover:border-primary transition-all">
                        <Plus size={24} className="mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t.studio_add_source}</span>
                    </button>
                )}
            </div>

            <NeonButton onClick={handleRunAnalysis} disabled={status === 'analyzing' || channels.every(c => !c.url.trim())} className="w-full h-14">
                {status === 'analyzing' ? <Loader2 className="animate-spin" /> : <Zap />}
                {status === 'analyzing' ? t.studio_analyzing : t.studio_run_analysis}
            </NeonButton>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in">
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 shadow-2xl space-y-6 relative overflow-hidden">
                {status === 'overhauling' && (
                  <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-fade-in border-2 border-amber-500/40 rounded-[40px]">
                      <AlertTriangle className="text-amber-500 animate-bounce" size={48} />
                      <h4 className="text-xl font-black text-white uppercase mt-4">{t.overhaul_active}</h4>
                      <p className="text-slate-300 text-xs font-medium mt-2">{t.overhaul_desc}</p>
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <BrainCircuit className="text-primary" size={24} />
                  <h3 className="text-xl font-black text-white uppercase">{t.studio_tab_2}</h3>
                </div>
                <textarea 
                    value={studioSettings.topic}
                    onChange={(e) => setStudioSettings({...studioSettings, topic: e.target.value})}
                    placeholder="Chủ đề hoặc mục tiêu sản phẩm..."
                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:border-primary outline-none resize-none"
                />
                <NeonButton onClick={handleGenerateScript} disabled={status === 'generating' || status === 'auditing' || status === 'overhauling'} className="w-full h-14">
                  {status === 'generating' ? <Loader2 className="animate-spin" /> : status === 'auditing' ? <Gauge className="animate-pulse" /> : <Sparkles />}
                  {status === 'generating' ? 'Đang soạn kịch bản...' : status === 'auditing' ? 'Đang tối ưu SEO...' : status === 'overhauling' ? 'RE-STRUCTURING...' : t.studio_gen_script}
                </NeonButton>
            </div>

            {generatedPlan && (
                <div className="space-y-8 animate-fade-in">
                    <PlanResult data={generatedPlan} t={t} />
                    
                    {seoAudit && (
                        <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5"><Gauge size={100} className="text-purple-500" /></div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 shadow-neon">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">{t.seo_score}</h3>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">VidIQ Artificial Intel Engine</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-3xl border border-slate-800">
                                    <div className="text-5xl font-black text-purple-500">{seoAudit.seo_score}</div>
                                    <div className="text-[9px] text-slate-500 font-black uppercase mt-1">SEO Score</div>
                                </div>
                                <div className="md:col-span-3 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                            <div className="text-[9px] text-slate-500 uppercase font-black mb-1">{t.keyword_difficulty}</div>
                                            <div className={`text-xs font-black uppercase ${seoAudit.keyword_difficulty === 'LOW' ? 'text-green-500' : 'text-yellow-500'}`}>{seoAudit.keyword_difficulty}</div>
                                        </div>
                                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                            <div className="text-[9px] text-slate-500 uppercase font-black mb-1">{t.viral_momentum}</div>
                                            <div className="text-xs font-black text-white uppercase">{seoAudit.trending_momentum}%</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {seoAudit.suggested_tags.map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] text-slate-400 font-bold">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 sticky top-20">
                <ModelSelector 
                  scriptModel={scriptModel} setScriptModel={setScriptModel}
                  visualModel={visualModel} setVisualModel={setVisualModel}
                  voiceModel={voiceModel} setVoiceModel={setVoiceModel}
                  resolution="1080p" setResolution={setResolution}
                  aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
                  t={t}
                />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViralDNAStudio;
