
import React, { useState, useEffect, useRef } from 'react';
import { 
  Dna, Plus, Trash2, Zap, Target, Layers, CheckCircle, 
  AlertTriangle, RefreshCw, FileText, Sparkles, Youtube, 
  Link, Music, Video, Mic, Download, Play, Box, X
} from 'lucide-react';
import { CompetitorChannel, ViralDNAProfile, StudioSettings, OrchestratorResponse, ApiKeyConfig, AppLanguage, ContentLanguage, ScriptModel, VisualModel, VoiceModel, VideoResolution, AspectRatio } from '../types';
import NeonButton from './NeonButton';
import { extractViralDNA, generateProScript, generateGeminiTTS, generateVeoVideo } from '../services/geminiService';
import PlanResult from './PlanResult';
import ModelSelector from './ModelSelector';

interface ViralDNAStudioProps {
  apiKeys: ApiKeyConfig[];
  appLanguage: AppLanguage;
  contentLanguage: ContentLanguage;
  setContentLanguage: (lang: ContentLanguage) => void;
  t?: any;
  scriptModel?: ScriptModel;
  setScriptModel?: (model: ScriptModel) => void;
  visualModel?: VisualModel;
  setVisualModel?: (model: VisualModel) => void;
  voiceModel?: VoiceModel;
  setResolution?: (res: VideoResolution) => void;
  aspectRatio?: AspectRatio;
  setAspectRatio?: (ratio: AspectRatio) => void;
  predefinedTopic?: string;
}

type StudioTab = 'analyzer' | 'script' | 'studio';

const ViralDNAStudio: React.FC<ViralDNAStudioProps> = ({ 
    apiKeys, contentLanguage, scriptModel, visualModel, voiceModel, resolution, aspectRatio, t,
    setScriptModel, setVisualModel, setVoiceModel, setResolution, setAspectRatio,
    predefinedTopic = ''
}) => {
  const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>(predefinedTopic ? 'script' : 'analyzer');
  const [channels, setChannels] = useState<CompetitorChannel[]>([{ id: '1', url: '', name: 'Source 1', status: 'pending' }]);
  const [dnaProfile, setDnaProfile] = useState<ViralDNAProfile | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<OrchestratorResponse | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'generating' | 'rendering' | 'done'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [studioSettings, setStudioSettings] = useState<StudioSettings>({
    quality: 'Standard', aspectRatio: '9:16', model: 'Balanced', generationMode: 'Free Storyboard',
    videoFormat: 'Shorts', contentLanguage, topic: predefinedTopic, hookStrength: 8, storyMode: 'One-shot',
    riskLevel: 'Medium', characterLock: true, styleLock: true, musicSync: true
  });

  useEffect(() => {
    if (predefinedTopic) {
        setStudioSettings(s => ({ ...s, topic: predefinedTopic }));
    }
  }, [predefinedTopic]);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const handleAddChannel = () => {
    if (channels.length < 3) {
      setChannels([...channels, { id: crypto.randomUUID(), url: '', name: `Source ${channels.length + 1}`, status: 'pending' }]);
    }
  };

  const handleRemoveChannel = (id: string) => {
    if (channels.length > 1) {
      setChannels(channels.filter(c => c.id !== id));
    }
  };

  const handleRunAnalysis = async () => {
    const key = apiKeys.find(k => k.provider === 'google' && k.status === 'active')?.key || process.env.API_KEY;
    if (!key) {
      alert("Missing API Key for analysis.");
      return;
    }
    
    const validUrls = channels.map(c => c.url).filter(u => u.trim() !== '');
    if (validUrls.length === 0) {
      alert("Please enter at least one source URL.");
      return;
    }

    setStatus('analyzing');
    addLog(`Starting Deep DNA Extraction for ${validUrls.length} source(s)...`);
    try {
        const dna = await extractViralDNA(key, validUrls, "Comprehensive Analysis", contentLanguage);
        setDnaProfile(dna);
        setStudioSettings(s => ({ ...s, topic: dna.keywords[0] || '' }));
        setStatus('done');
        setActiveStudioTab('script');
        addLog("DNA Analysis completed successfully.");
    } catch (e: any) { 
        addLog(`Analysis failed: ${e.message}`);
        setStatus('idle'); 
    }
  };

  const handleGenerateScript = async () => {
    const key = apiKeys.find(k => k.provider === 'google' && k.status === 'active')?.key || process.env.API_KEY;
    if (!key) {
        alert("Missing API Key.");
        return;
    }
    // Note: dnaProfile is optional if user enters topic manually from Campaign Wizard
    setStatus('generating');
    addLog("Composing Professional Script with Gemini AI...");
    try {
        // Fallback DNA if missing (Manual mode)
        const mockDna: ViralDNAProfile = dnaProfile || {
            structure: { hook_type: 'Benefit', pacing: 'Fast', avg_scene_duration: 3 },
            emotional_curve: ['Curiosity'],
            keywords: [studioSettings.topic],
            algorithm_fit_score: 80,
            risk_level: 'Safe'
        };
        const plan = await generateProScript(key, mockDna, studioSettings);
        setGeneratedPlan(plan);
        setStatus('done');
        setActiveStudioTab('studio');
        addLog("Production plan generated.");
    } catch (e: any) { 
        addLog(`Script generation failed: ${e.message}`);
        setStatus('idle'); 
    }
  };

  const handleFullRender = async () => {
    if (!generatedPlan) return;
    setStatus('rendering');
    addLog("Initializing Google Veo Engine...");
    try {
        addLog("Synthesizing Voiceover with Gemini TTS...");
        const audioBase64 = await generateGeminiTTS(generatedPlan.production_plan.script_master);
        setAudioUrl(`data:audio/pcm;base64,${audioBase64}`);

        addLog("Generating Cinematic Visuals with Google Veo...");
        const url = await generateVeoVideo(generatedPlan.production_plan.scenes[0].visual_cues);
        setVideoUrl(url);
        
        addLog("Production Complete. Video & Audio assets ready.");
        setStatus('done');
    } catch (e: any) {
        addLog(`Render failed: ${e.message}`);
        setStatus('idle');
    }
  };

  return (
    <div className="animate-fade-in flex flex-col h-full bg-[#020617]">
      <div className="px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center bg-slate-950/50 gap-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg shadow-neon"><Dna className="text-white" size={24} /></div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">Viral DNA Studio <span className="hidden sm:inline-block text-[10px] bg-red-500 px-2 py-0.5 rounded text-white ml-2">Google VEO Enabled</span></h1>
        </div>
        <div className="flex gap-2 bg-slate-900 p-1 rounded-xl w-full md:auto overflow-x-auto">
            {['analyzer', 'script', 'studio'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveStudioTab(tab as any)} 
                  className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeStudioTab === tab ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {tab === 'analyzer' ? '1. DNA Analyzer' : tab === 'script' ? '2. AI Scripting' : '3. Render Studio'}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            {activeStudioTab === 'analyzer' && (
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Target size={20} className="text-primary"/> Source Strategy Recon</h3>
                          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{channels.length}/3 Sources</div>
                        </div>
                        
                        <div className="space-y-4">
                          {channels.map((c, i) => (
                              <div key={c.id} className="flex gap-3 items-center bg-slate-950 p-4 rounded-2xl border border-slate-800 transition-all focus-within:border-primary/50 group">
                                  <div className="p-2 bg-slate-900 rounded-lg text-slate-500 group-focus-within:text-primary transition-colors">
                                    <Link size={18} />
                                  </div>
                                  <input 
                                    value={c.url} 
                                    onChange={(e) => setChannels(prev => prev.map(ch => ch.id === c.id ? {...ch, url: e.target.value} : ch))} 
                                    placeholder="Paste YouTube or TikTok URL..." 
                                    className="flex-1 bg-transparent text-white outline-none text-sm placeholder:text-slate-700"
                                  />
                                  {channels.length > 1 && (
                                    <button 
                                      onClick={() => handleRemoveChannel(c.id)}
                                      className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                                      title="Remove Source"
                                    >
                                      <X size={18} />
                                    </button>
                                  )}
                              </div>
                          ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                          {channels.length < 3 && (
                            <button 
                              onClick={handleAddChannel}
                              className="flex-1 h-14 border-2 border-dashed border-slate-700 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-primary hover:border-primary/50 transition-all font-bold text-sm"
                            >
                              <Plus size={20} /> Add Source Slot
                            </button>
                          )}
                          <NeonButton 
                            onClick={handleRunAnalysis} 
                            disabled={status === 'analyzing' || channels.every(c => !c.url.trim())} 
                            className={`${channels.length < 3 ? 'sm:w-2/3' : 'w-full'} h-14`}
                          >
                            {status === 'analyzing' ? (
                              <span className="flex items-center gap-2"><RefreshCw className="animate-spin" size={20}/> Extracting DNA...</span>
                            ) : (
                              <span className="flex items-center gap-2"><Zap size={20}/> Run Deep Analysis</span>
                            )}
                          </NeonButton>
                        </div>

                        <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                          <div className="flex gap-3">
                            <Sparkles className="text-primary shrink-0" size={18} />
                            <p className="text-xs text-slate-400 leading-relaxed">
                              <strong>Pro Tip:</strong> Pasting multiple successful competitor channels allows the AI to identify <em>patterns of success</em> across your niche, ensuring your content has the "Viral DNA" required to trend.
                            </p>
                          </div>
                        </div>
                    </div>
                </div>
            )}

            {activeStudioTab === 'script' && (
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Primary Content Topic / Product</label>
                            <textarea 
                              value={studioSettings.topic} 
                              onChange={(e) => setStudioSettings({...studioSettings, topic: e.target.value})} 
                              placeholder="What is this video about? (e.g., Apple Vision Pro Review, Cooking Tutorial...)"
                              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-primary resize-none placeholder:text-slate-800" 
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                             <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest">Script Tone & Strategy</h4>
                             <div className="flex flex-wrap gap-2">
                               {['Aggressive', 'Informative', 'Funny', 'Urgent'].map(tone => (
                                 <button 
                                   key={tone} 
                                   onClick={() => setStudioSettings({...studioSettings, storyMode: tone as any})}
                                   className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${studioSettings.storyMode === tone ? 'bg-primary border-primary text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                                 >
                                   {tone}
                                 </button>
                               ))}
                             </div>
                          </div>
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                             <h4 className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest">Hook Strength</h4>
                             <input 
                                type="range" min="1" max="10" 
                                value={studioSettings.hookStrength} 
                                onChange={(e) => setStudioSettings({...studioSettings, hookStrength: parseInt(e.target.value)})}
                                className="w-full accent-primary"
                             />
                             <div className="flex justify-between text-[9px] font-bold text-slate-600 mt-1 uppercase">
                                <span>Soft</span>
                                <span className="text-primary">Level {studioSettings.hookStrength}</span>
                                <span>Extreme</span>
                             </div>
                          </div>
                        </div>
                        <NeonButton onClick={handleGenerateScript} disabled={status === 'generating'} className="w-full h-14">
                           {status === 'generating' ? <span className="flex items-center gap-2"><RefreshCw className="animate-spin" /> Composing...</span> : "Generate Pro Script"}
                        </NeonButton>
                    </div>
                </div>
            )}

            {activeStudioTab === 'studio' && (
                <div className="max-w-6xl mx-auto space-y-8 animate-fade-in py-4">
                    {generatedPlan ? (
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2"><PlanResult data={generatedPlan} videoUrl={videoUrl} /></div>
                            <div className="space-y-6">
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                                    <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Video size={18} className="text-primary"/> Ultimate Render Engine</h4>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                            <div className="text-[9px] text-slate-500 uppercase font-black mb-1">Visual Generation</div>
                                            <div className="text-sm text-white font-bold">Google Veo 3.1 Fast</div>
                                        </div>
                                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                                            <div className="text-[9px] text-slate-500 uppercase font-black mb-1">Voiceover Pipeline</div>
                                            <div className="text-sm text-white font-bold">Gemini Native TTS (Zephyr)</div>
                                        </div>
                                        <NeonButton onClick={handleFullRender} disabled={status === 'rendering'} className="w-full py-4" variant="danger">
                                            {status === 'rendering' ? <RefreshCw className="animate-spin" /> : <span className="flex items-center gap-2"><Zap size={18}/> PRODUCE FULL ASSETS</span>}
                                        </NeonButton>
                                    </div>
                                </div>
                                {(videoUrl || audioUrl) && (
                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Asset Preview</h4>
                                        {videoUrl && (
                                          <div className="bg-black border border-primary/30 rounded-xl overflow-hidden aspect-[9/16] relative shadow-neon">
                                              <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                                              <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded">VEO GENERATED</div>
                                          </div>
                                        )}
                                        {audioUrl && (
                                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                                            <Mic size={16} className="text-green-500" />
                                            <div className="flex-1 text-[10px] text-slate-400 font-bold uppercase">Voiceover Ready</div>
                                            <button className="text-primary p-2 hover:bg-slate-900 rounded-lg"><Play size={16} fill="currentColor"/></button>
                                          </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-96 flex flex-col items-center justify-center text-slate-700 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl p-8 text-center">
                            <Box size={64} className="opacity-10 mb-4" />
                            <p className="font-bold text-sm text-slate-500">Your production plan is waiting.</p>
                            <p className="text-xs text-slate-600 mt-2 max-w-xs">Complete the <strong>DNA Analyzer</strong> and <strong>AI Scripting</strong> tabs to unlock the Render Studio.</p>
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="hidden xl:flex w-80 bg-slate-950 border-l border-slate-800 flex-col">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Orchestrator Logs</span>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[9px] text-slate-500 custom-scrollbar">
                {logs.length === 0 && <div className="italic opacity-30">Monitoring system signals...</div>}
                {logs.map((l, i) => (
                  <div key={i} className="animate-fade-in border-l border-slate-800 pl-3 py-1 bg-slate-900/10 rounded-r">
                    <span className="text-primary opacity-50 block mb-1">SIG_INT_{logs.length - i}</span>
                    {l}
                  </div>
                ))}
            </div>
        </div>
      </div>

      <ModelSelector 
        scriptModel={scriptModel || 'Gemini 3 Pro'} 
        visualModel={visualModel || 'VEO'} 
        voiceModel={voiceModel || 'Google Chirp'}
        resolution={resolution || '1080p'} 
        aspectRatio={aspectRatio || '9:16'}
        setScriptModel={setScriptModel || (() => {})} 
        setVisualModel={setVisualModel || (() => {})} 
        setVoiceModel={setVoiceModel || (() => {})} 
        setResolution={setResolution || (() => {})} 
        setAspectRatio={setAspectRatio || (() => {})}
      />
    </div>
  );
};

export default ViralDNAStudio;
