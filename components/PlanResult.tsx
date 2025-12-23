
import React, { useState, useEffect } from 'react';
import { OrchestratorResponse, PostingJob } from '../types';
import { 
    Play, FileText, Target, TrendingUp, CheckCircle, Download, Film, 
    Zap, Brain, Crosshair, DollarSign, Activity, MonitorPlay, 
    Clock, Pause, Volume2, Maximize, Calendar, Share2, Hash, 
    Layers, Video, MessageSquare, BookOpen, Quote
} from 'lucide-react';
import NeonButton from './NeonButton';

interface PlanResultProps {
  data: OrchestratorResponse;
  videoUrl?: string | null;
  onPost?: (content: { title: string, description: string }) => Promise<boolean>;
  onAddToQueue?: (job: PostingJob) => void;
  t: any;
}

const PlanResult: React.FC<PlanResultProps> = ({ data, videoUrl, onPost, onAddToQueue, t }) => {
  const [autoPostTime, setAutoPostTime] = useState<number>(3600);
  const [isAutoPosting, setIsAutoPosting] = useState(true);
  const [postStatus, setPostStatus] = useState<'pending' | 'posted'>('pending');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAutoPosting && autoPostTime > 0 && postStatus === 'pending') {
      interval = setInterval(() => setAutoPostTime((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isAutoPosting, autoPostTime, postStatus]);

  useEffect(() => {
      let vidInterval: ReturnType<typeof setInterval>;
      if (isPlaying) {
          vidInterval = setInterval(() => setProgress(prev => (prev >= 100 ? 0 : prev + 1)), 100);
      }
      return () => clearInterval(vidInterval);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAddToQueue = () => {
      if (onAddToQueue && data.generated_content) {
          setIsAutoPosting(false);
          onAddToQueue({
              id: crypto.randomUUID(),
              content_title: data.generated_content.title,
              caption: data.generated_content.description,
              hashtags: data.generated_content.hashtags,
              platforms: [],
              scheduled_time: Date.now() + 86400000,
              status: 'draft'
          });
      }
  };

  const ratio = data.production_plan.technical_specs?.ratio || '9:16';
  const aspectClass = ratio === '16:9' ? 'aspect-video' : ratio === '1:1' ? 'aspect-square' : 'aspect-[9/16]';

  return (
    <div className="animate-fade-in pb-20 space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Stats & Content Deck */}
        <div className="xl:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform"><TrendingUp size={60}/></div>
                    <div className="flex items-center gap-2 mb-4 text-primary">
                        <TrendingUp size={18} />
                        <h3 className="font-black text-[10px] uppercase tracking-widest">Viral Reach Index</h3>
                    </div>
                    <div className="space-y-4 relative z-10">
                        <div>
                            <div className="flex justify-between text-[9px] font-black uppercase mb-1.5">
                                <span className="text-slate-500">TikTok Momentum</span>
                                <span className="text-white">{(data.market_scoring.tiktok_potential * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden shadow-inner border border-white/5">
                                <div className="bg-primary h-full rounded-full shadow-neon" style={{ width: `${data.market_scoring.tiktok_potential * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl md:col-span-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Target size={80}/></div>
                    <div className="flex items-center gap-2 mb-4 text-accent">
                        <Target size={18} />
                        <h3 className="font-black text-[10px] uppercase tracking-widest">Target Audience Intel</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                        {data.audience_personas.slice(0, 2).map((persona) => (
                            <div key={persona.id} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-[11px] shadow-inner hover:border-primary/20 transition-all">
                                <div className="font-black text-white mb-1 uppercase tracking-tighter text-[9px] flex items-center gap-2">
                                    <div className="w-1 h-3 bg-primary rounded-full"></div> {persona.name}
                                </div>
                                <p className="text-slate-500 italic leading-relaxed">"{persona.behavior}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SCRIPT MASTER DECK */}
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 md:p-10 shadow-2xl space-y-10">
                <div className="flex items-center justify-between border-b border-slate-800 pb-8">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-primary/10 rounded-[24px] border border-primary/20 text-primary shadow-neon"><FileText size={32} /></div>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Script Master Copy</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                <Zap size={12} className="text-yellow-500" /> Professional Paraphrased Narrative v5.0
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => navigator.clipboard.writeText(data.production_plan.script_master)} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-white hover:border-primary transition-all shadow-inner"><Share2 size={20}/></button>
                    </div>
                </div>

                <div className="bg-slate-950 p-8 rounded-[32px] border border-slate-800 shadow-inner relative group">
                    <div className="absolute -top-3 -left-3 p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-700"><Quote size={20}/></div>
                    <p className="text-slate-300 text-sm md:text-base leading-loose italic font-medium">"{data.production_plan.script_master}"</p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Layers size={22} className="text-blue-500" />
                            <h4 className="text-xs font-black text-white uppercase tracking-widest">Multi-Scene Dispatch Instructions</h4>
                        </div>
                        <span className="text-[10px] font-black text-slate-600 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full uppercase">{data.production_plan.scenes.length} Production Segments</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-5">
                        {data.production_plan.scenes.map((scene, idx) => (
                            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-[32px] p-6 hover:border-primary/40 transition-all group flex flex-col md:flex-row gap-8">
                                <div className="md:w-20 shrink-0 flex flex-col items-center justify-center border-r border-slate-800 md:pr-8">
                                    <span className="text-[9px] font-black text-slate-600 uppercase mb-2">Stage</span>
                                    <span className="text-4xl font-black text-primary font-mono tracking-tighter">{(idx + 1).toString().padStart(2, '0')}</span>
                                </div>
                                <div className="flex-1 space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]"><MessageSquare size={14} className="text-blue-500"/> Voiceover Direction</div>
                                        <p className="text-sm text-white font-bold leading-relaxed">"{scene.vo_text}"</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-accent uppercase tracking-[0.2em]"><Video size={14}/> Visual Prompt (VEO Hybrid)</div>
                                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-[11px] text-slate-400 font-mono italic leading-relaxed group-hover:text-slate-200 transition-colors shadow-inner">
                                            {scene.visual_cues}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Action Sidebar */}
        <div className="xl:col-span-1 space-y-8">
           <div className="xl:sticky xl:top-24 space-y-8">
              {/* Media Preview Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl relative group">
                  <div className={`${aspectClass} bg-black relative flex items-center justify-center overflow-hidden`}>
                      {isPlaying ? (
                          <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-neon"></div>
                          </div>
                      ) : (
                          <div className="text-center p-8">
                              <div className="w-24 h-24 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner group-hover:scale-110 transition-transform"><Film className="text-slate-800" size={40} /></div>
                              <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">Media Engine Standby</p>
                          </div>
                      )}
                      <button onClick={() => setIsPlaying(!isPlaying)} className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-2xl scale-90 group-hover:scale-100 transition-transform">{isPlaying ? <Pause size={32} className="text-white fill-white" /> : <Play size={32} className="text-white fill-white ml-1" />}</div>
                      </button>
                  </div>

                  <div className="bg-slate-950 p-8 border-t border-slate-800 space-y-8">
                     <div className="flex justify-between items-center bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-inner">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Neural Post Timer</span>
                            <span className="font-mono text-3xl font-black text-yellow-500 leading-none">{formatTime(autoPostTime)}</span>
                        </div>
                        <div className="p-4 bg-yellow-500/10 rounded-2xl text-yellow-500 border border-yellow-500/20"><Clock size={28}/></div>
                     </div>
                     
                     <div className="space-y-4">
                        <NeonButton onClick={() => {}} className="w-full h-16 uppercase text-xs font-black tracking-[0.2em] shadow-neon">
                           🚀 Fire Viral Deployment
                        </NeonButton>
                        <button onClick={handleAddToQueue} className="w-full py-5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-500 hover:text-white rounded-[24px] text-[10px] font-black transition-all uppercase tracking-[0.3em]">
                           Stage in Queue
                        </button>
                     </div>
                  </div>
              </div>

              {/* Deployment Strategy */}
              <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 shadow-xl space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03]"><Brain size={120} /></div>
                  <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500"><BookOpen size={24}/></div>
                      <h4 className="text-xs font-black text-white uppercase tracking-widest">Viral DNA Strategy</h4>
                  </div>
                  <div className="space-y-6 relative z-10">
                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                          <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Winning Angle</span>
                          <p className="text-[11px] text-white font-bold leading-relaxed">"{data.deep_analysis.winning_angle}"</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.generated_content.hashtags.map((tag, i) => (
                            <span key={i} className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-bold text-primary">#{tag.replace('#','')}</span>
                        ))}
                      </div>
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PlanResult;
