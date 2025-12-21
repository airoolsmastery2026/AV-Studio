
import React, { useState, useEffect } from 'react';
import { 
  Dna, Plus, Trash2, Zap, Target, RefreshCw, Link, 
  Video, Mic, Box, X, Search, CheckCircle2, AlertCircle, LayoutGrid, List
} from 'lucide-react';
import { CompetitorChannel, ViralDNAProfile, StudioSettings, OrchestratorResponse, ApiKeyConfig, AppLanguage, ContentLanguage, ScriptModel, VisualModel, VoiceModel, VideoResolution, AspectRatio, KnowledgeBase } from '../types';
import NeonButton from './NeonButton';
import { extractViralDNA, generateProScript, generateGeminiTTS, generateVeoVideo } from '../services/geminiService';
import PlanResult from './PlanResult';
import ModelSelector from './ModelSelector';

interface ViralDNAStudioProps {
  apiKeys: ApiKeyConfig[];
  appLanguage: AppLanguage;
  contentLanguage: ContentLanguage;
  setContentLanguage: (lang: ContentLanguage) => void;
  knowledgeBase: KnowledgeBase;
  t: any;
  scriptModel: ScriptModel;
  setScriptModel: (model: ScriptModel) => void;
  visualModel: VisualModel;
  setVisualModel: (model: VisualModel) => void;
  voiceModel: VoiceModel;
  setVoiceModel: (model: VoiceModel) => void;
  setResolution: (res: VideoResolution) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  predefinedTopic?: string;
}

type StudioTab = 'analyzer' | 'script' | 'studio';

const ViralDNAStudio: React.FC<ViralDNAStudioProps> = ({ 
    apiKeys, contentLanguage, scriptModel, visualModel, voiceModel, resolution, aspectRatio, t,
    setScriptModel, setVisualModel, setVoiceModel, setResolution, setAspectRatio,
    knowledgeBase, predefinedTopic = ''
}) => {
  const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>('analyzer');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Nâng cấp: Cho phép dán nhiều hơn 3 link
  const [channels, setChannels] = useState<CompetitorChannel[]>([
      { id: '1', url: '', name: 'Target Alpha', status: 'pending' }
  ]);
  
  const [dnaProfile, setDnaProfile] = useState<ViralDNAProfile | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<OrchestratorResponse | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'generating' | 'rendering' | 'done'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const [studioSettings, setStudioSettings] = useState<StudioSettings>({
    quality: 'Standard', aspectRatio: '9:16', model: 'Balanced', generationMode: 'Free Storyboard',
    videoFormat: 'Shorts', contentLanguage, topic: predefinedTopic, hookStrength: 8, storyMode: 'One-shot',
    riskLevel: 'Medium', characterLock: true, styleLock: true, musicSync: true
  });

  useEffect(() => {
    if (predefinedTopic) {
        setStudioSettings(s => ({ ...s, topic: predefinedTopic }));
        setActiveStudioTab('script');
    }
  }, [predefinedTopic]);

  const handleAddChannel = () => {
    setChannels([...channels, { id: crypto.randomUUID(), url: '', name: `Signal ${channels.length + 1}`, status: 'pending' }]);
  };

  const handleRemoveChannel = (id: string) => {
    if (channels.length > 1) setChannels(channels.filter(c => c.id !== id));
  };

  const handleRunAnalysis = async () => {
    const key = apiKeys.find(k => k.provider === 'google' && k.status === 'active')?.key;
    const urlEntries = channels.map(c => c.url.trim()).filter(u => u !== '');
    if (urlEntries.length === 0) return;

    setStatus('analyzing');
    // Cập nhật trạng thái từng kênh sang 'analyzing'
    setChannels(prev => prev.map(c => c.url.trim() ? { ...c, status: 'analyzing' } : c));

    try {
        const dna = await extractViralDNA(key || '', urlEntries, "Deep Audit", contentLanguage);
        setDnaProfile(dna);
        setStudioSettings(s => ({ ...s, topic: dna.keywords[0] || studioSettings.topic }));
        
        // Cập nhật trạng thái từng kênh sang 'completed'
        setChannels(prev => prev.map(c => c.url.trim() ? { ...c, status: 'completed', dna_preview: dna.keywords.join(', ') } : c));
        
        setStatus('done');
        // Tự động chuyển sang tab kịch bản sau khi phân tích xong (Clean flow)
        setTimeout(() => setActiveStudioTab('script'), 800);
    } catch (e: any) { 
        setChannels(prev => prev.map(c => c.status === 'analyzing' ? { ...c, status: 'error' } : c));
        setStatus('idle'); 
    }
  };

  const handleGenerateScript = async () => {
    const key = apiKeys.find(k => k.provider === 'google' && k.status === 'active')?.key;
    setStatus('generating');
    try {
        const plan = await generateProScript(key || '', dnaProfile!, studioSettings, knowledgeBase);
        setGeneratedPlan(plan);
        setStatus('done');
        setTimeout(() => setActiveStudioTab('studio'), 500);
    } catch (e: any) { setStatus('idle'); }
  };

  const handleFullRender = async () => {
    if (!generatedPlan) return;
    setStatus('rendering');
    try {
        await generateGeminiTTS(generatedPlan.production_plan.script_master);
        const url = await generateVeoVideo(generatedPlan.production_plan.scenes[0].visual_cues);
        setVideoUrl(url);
        setStatus('done');
    } catch (e: any) { setStatus('idle'); }
  };

  return (
    <div className="animate-fade-in flex flex-col h-full bg-[#020617]">
      <div className="px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center bg-slate-950/50 gap-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg shadow-neon"><Dna className="text-white" size={20} /></div>
            <h1 className="text-lg font-black text-white tracking-tight uppercase">{t.studio}</h1>
        </div>
        <div className="flex gap-2 bg-slate-900 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            {['analyzer', 'script', 'studio'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveStudioTab(tab as any)} 
                  className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeStudioTab === tab ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {t[`studio_tab_${['1','2','3'][['analyzer','script','studio'].indexOf(tab)]}`]}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-6xl mx-auto space-y-8">
            {activeStudioTab === 'analyzer' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-3"><Search className="text-primary"/> {t.studio_recon_title}</h3>
                            <p className="text-xs text-slate-500 mt-1 uppercase font-mono tracking-widest">Multi-Source Neural Extraction Engine</p>
                        </div>
                        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}><LayoutGrid size={16}/></button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}><List size={16}/></button>
                        </div>
                    </div>

                    <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'flex flex-col gap-3'} transition-all`}>
                        {channels.map((c) => (
                            <div key={c.id} className={`bg-slate-900 border ${c.status === 'completed' ? 'border-green-500/30' : 'border-slate-800'} rounded-2xl p-4 group transition-all relative overflow-hidden`}>
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                                            <Link size={14} />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{c.name}</span>
                                    </div>
                                    <button onClick={() => handleRemoveChannel(c.id)} className="text-slate-700 hover:text-red-500 transition-colors"><X size={14}/></button>
                                </div>
                                <input 
                                    value={c.url} 
                                    onChange={(e) => setChannels(prev => prev.map(ch => ch.id === c.id ? {...ch, url: e.target.value} : ch))} 
                                    placeholder="TikTok/YouTube URL..." 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-white focus:border-primary outline-none transition-all placeholder:text-slate-800 font-mono"
                                />
                                <div className="mt-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {c.status === 'analyzing' && <RefreshCw size={10} className="text-primary animate-spin" />}
                                        {c.status === 'completed' && <CheckCircle2 size={10} className="text-green-500" />}
                                        {c.status === 'error' && <AlertCircle size={10} className="text-red-500" />}
                                        <span className={`text-[9px] font-black uppercase ${c.status === 'completed' ? 'text-green-400' : 'text-slate-600'}`}>{c.status}</span>
                                    </div>
                                    {c.dna_preview && <span className="text-[9px] text-slate-500 truncate max-w-[120px] italic">DNA: {c.dna_preview}</span>}
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={handleAddChannel}
                            className={`border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-slate-600 hover:text-primary hover:border-primary/40 transition-all group ${viewMode === 'list' ? 'py-4' : ''}`}
                        >
                            <Plus size={24} className="group-hover:scale-110 transition-transform mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{t.studio_add_source}</span>
                        </button>
                    </div>

                    <div className="mt-8">
                        <NeonButton 
                            onClick={handleRunAnalysis} 
                            disabled={status === 'analyzing' || channels.every(c => !c.url.trim())} 
                            className="w-full h-14"
                        >
                            {status === 'analyzing' ? (
                                <span className="flex items-center gap-3"><RefreshCw size={20} className="animate-spin" /> {t.studio_analyzing}</span>
                            ) : (
                                <span className="flex items-center gap-3"><Zap size={20}/> {t.studio_run_analysis}</span>
                            )}
                        </NeonButton>
                    </div>
                </div>
            )}

            {activeStudioTab === 'script' && (
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                        <div className="mb-6">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Topic / Target Product</label>
                            <textarea 
                              value={studioSettings.topic} 
                              onChange={(e) => setStudioSettings({...studioSettings, topic: e.target.value})} 
                              placeholder="Describe your video goal..."
                              className="w-full h-40 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-primary resize-none placeholder:text-slate-800 text-sm font-medium" 
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                             <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest">HOOK INTENSITY</h4>
                             <input type="range" min="1" max="10" value={studioSettings.hookStrength} onChange={(e) => setStudioSettings({...studioSettings, hookStrength: parseInt(e.target.value)})} className="w-full accent-primary" />
                             <div className="flex justify-between text-[9px] font-black text-slate-600 mt-2 uppercase"><span>Casual</span><span className="text-primary">LVL {studioSettings.hookStrength}</span><span>Extreme</span></div>
                          </div>
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                             <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest">CREATIVE MODE</h4>
                             <div className="flex flex-wrap gap-2">
                               {['Viral', 'Story', 'Pro Review'].map(m => (
                                 <button key={m} onClick={() => setStudioSettings({...studioSettings, storyMode: m as any})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black border transition-all ${studioSettings.storyMode === m ? 'bg-primary border-primary text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>{m}</button>
                               ))}
                             </div>
                          </div>
                        </div>
                        <NeonButton onClick={handleGenerateScript} disabled={status === 'generating' || !studioSettings.topic} className="w-full h-14">
                           {status === 'generating' ? <span className="flex items-center gap-2"><RefreshCw className="animate-spin" /> {t.loading}</span> : <span className="flex items-center gap-2"><Zap size={18}/> {t.studio_gen_script}</span>}
                        </NeonButton>
                    </div>
                </div>
            )}

            {activeStudioTab === 'studio' && (
                <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                    {generatedPlan ? (
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2"><PlanResult data={generatedPlan} videoUrl={videoUrl} t={t} /></div>
                            <div className="space-y-6">
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full"></div>
                                    <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Video size={18} className="text-primary"/> {t.studio_render_title}</h4>
                                    <div className="space-y-4 relative z-10">
                                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                            <div className="text-[9px] text-slate-500 uppercase font-black mb-1">{t.mod_visual}</div>
                                            <div className="text-xs text-white font-bold">{visualModel} AI Engine</div>
                                        </div>
                                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                            <div className="text-[9px] text-slate-500 uppercase font-black mb-1">{t.mod_voice}</div>
                                            <div className="text-xs text-white font-bold">{voiceModel} Native Pipeline</div>
                                        </div>
                                        <NeonButton onClick={handleFullRender} disabled={status === 'rendering'} className="w-full py-4 h-14" variant="danger">
                                            {status === 'rendering' ? <RefreshCw className="animate-spin" /> : <span className="flex items-center gap-2"><Zap size={18}/> {t.studio_produce_btn}</span>}
                                        </NeonButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-96 flex flex-col items-center justify-center bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl p-8 text-center">
                            <Box size={64} className="opacity-10 mb-4" />
                            <p className="font-bold text-sm text-slate-500 uppercase tracking-widest">Production Area Restricted</p>
                            <p className="text-[10px] text-slate-600 mt-2 max-w-xs uppercase font-mono">Run DNA Analyzer and Generate Script to Unlock Full Studio Pipeline.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>

      <ModelSelector 
        scriptModel={scriptModel} 
        visualModel={visualModel} 
        voiceModel={voiceModel}
        resolution={resolution} 
        aspectRatio={aspectRatio}
        setScriptModel={setScriptModel} 
        setVisualModel={setVisualModel} 
        setVoiceModel={setVoiceModel} 
        setResolution={setResolution} 
        setAspectRatio={setAspectRatio}
        t={t}
      />
    </div>
  );
};

export default ViralDNAStudio;
