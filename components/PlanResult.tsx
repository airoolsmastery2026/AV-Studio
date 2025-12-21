
import React, { useState, useEffect } from 'react';
import { OrchestratorResponse, PostingJob } from '../types';
import { Play, FileText, Target, TrendingUp, CheckCircle, Download, Film, Zap, Brain, Crosshair, DollarSign, Activity, MonitorPlay, Clock, Pause, Volume2, Maximize, Calendar, Share2, Hash } from 'lucide-react';
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
    <div className="animate-fade-in pb-12">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 backdrop-blur-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-primary">
                            <TrendingUp size={20} />
                            <h3 className="font-semibold text-sm">{t.viral_score || "Viral Potential"}</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-500">TikTok Trend</span>
                                    <span className="text-white">{(data.market_scoring.tiktok_potential * 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${data.market_scoring.tiktok_potential * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 backdrop-blur-sm md:col-span-2">
                    <div className="flex items-center gap-2 mb-3 text-accent">
                        <Target size={20} />
                        <h3 className="font-semibold text-sm">{t.audience_persona}</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.audience_personas.slice(0, 2).map((persona) => (
                            <div key={persona.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                                <div className="font-bold text-white mb-1 uppercase tracking-tighter">{persona.name}</div>
                                <p className="text-slate-500 italic">"{persona.behavior}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                        <Brain className="text-purple-400" size={24} />
                        <h3 className="text-lg font-bold text-white uppercase tracking-tighter">{t.deep_analysis}</h3>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase mb-2">DNA & Psychology</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.deep_analysis.viral_dna.map((dna, i) => (
                                <span key={i} className="px-3 py-1 bg-slate-800 text-slate-300 text-[10px] rounded-lg border border-slate-700 font-bold">🧬 {dna}</span>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                            <h4 className="text-[9px] font-black text-primary uppercase mb-1">Winning Strategy</h4>
                            <p className="text-xs text-white font-medium leading-relaxed">"{data.deep_analysis.winning_angle}"</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="xl:col-span-1">
           <div className="xl:sticky xl:top-20 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative group">
                  <div className={`${aspectClass} bg-black relative flex items-center justify-center overflow-hidden`}>
                      {isPlaying ? (
                          <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                      ) : (
                          <div className="text-center">
                              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2"><Film className="text-slate-600" /></div>
                              <p className="text-slate-600 text-[10px] font-mono uppercase tracking-widest">Preview Ready</p>
                          </div>
                      )}
                      <button onClick={() => setIsPlaying(!isPlaying)} className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">{isPlaying ? <Pause size={20} className="text-white fill-white" /> : <Play size={20} className="text-white fill-white ml-1" />}</div>
                      </button>
                  </div>

                  <div className="bg-slate-900 p-4 border-t border-slate-800">
                     <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-white uppercase tracking-tighter">Auto-Post Timer</span>
                        <span className="font-mono text-lg font-bold text-yellow-500">{formatTime(autoPostTime)}</span>
                     </div>
                     <div className="flex flex-col gap-2">
                        <NeonButton onClick={() => {}} size="md" className="w-full">{t.post_now}</NeonButton>
                        <button onClick={handleAddToQueue} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all uppercase">{t.schedule}</button>
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
