
import React, { useState, useEffect } from 'react';
import { OrchestratorResponse, PostingJob } from '../types';
import { Play, FileText, Target, TrendingUp, CheckCircle, Lock, Download, Film, Zap, Brain, Crosshair, DollarSign, Activity, Video as VideoIcon, MonitorPlay, Clock, Send, Share2, Hash, Pause, Volume2, Maximize, Calendar } from 'lucide-react';
import NeonButton from './NeonButton';

interface PlanResultProps {
  data: OrchestratorResponse;
  onPost?: (content: { title: string, description: string }) => Promise<boolean>;
  onAddToQueue?: (job: PostingJob) => void;
  t?: any;
}

const PlanResult: React.FC<PlanResultProps> = ({ data, onPost, onAddToQueue, t }) => {
  const texts = t || {};
  const [autoPostTime, setAutoPostTime] = useState<number>(3600); // 1 hour in seconds
  const [isAutoPosting, setIsAutoPosting] = useState(true);
  const [postStatus, setPostStatus] = useState<'pending' | 'posted'>('pending');
  
  // Video Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAutoPosting && autoPostTime > 0 && postStatus === 'pending') {
      interval = setInterval(() => {
        setAutoPostTime((prev) => prev - 1);
      }, 1000);
    } else if (autoPostTime === 0 && postStatus === 'pending') {
       // Auto-Post Trigger
       if (onPost && data.generated_content) {
           onPost({
               title: data.generated_content.title,
               description: data.generated_content.description
           }).then(success => {
               if (success) setPostStatus('posted');
           });
       } else {
           setPostStatus('posted');
       }
    }
    return () => clearInterval(interval);
  }, [isAutoPosting, autoPostTime, postStatus, onPost, data]);

  // Video Progress Simulation
  useEffect(() => {
      let vidInterval: ReturnType<typeof setInterval>;
      if (isPlaying) {
          vidInterval = setInterval(() => {
              setProgress(prev => (prev >= 100 ? 0 : prev + 1));
          }, 100); // Fast simulation
      }
      return () => clearInterval(vidInterval);
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleApprove = async () => {
      setIsAutoPosting(false);
      
      if (onPost && data.generated_content) {
          const success = await onPost({
              title: data.generated_content.title,
              description: data.generated_content.description
          });
          if (success) {
              setPostStatus('posted');
          }
      } else {
          setPostStatus('posted');
          alert("Posted!");
      }
  };

  const handleAddToQueue = () => {
      if (onAddToQueue && data.generated_content) {
          setIsAutoPosting(false); // Stop auto post
          const job: PostingJob = {
              id: crypto.randomUUID(),
              content_title: data.generated_content.title,
              caption: data.generated_content.description,
              hashtags: data.generated_content.hashtags,
              platforms: [], // User will select platform in Queue
              scheduled_time: Date.now() + 86400000, // Default +24h
              status: 'draft', // Saved as draft
              thumbnail_url: 'https://via.placeholder.com/150' 
          };
          onAddToQueue(job);
      }
  };

  const handleDownload = () => {
      const content = JSON.stringify(data, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AV_Studio_Plan_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // Determine Aspect Ratio Class dynamically
  const ratio = data.production_plan.technical_specs?.ratio || '9:16';
  const aspectClass = ratio === '16:9' ? 'aspect-video' : ratio === '1:1' ? 'aspect-square' : 'aspect-[9/16]';

  return (
    <div className="animate-fade-in pb-12">
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ANALYSIS & SCRIPT (SPAN 2) */}
        <div className="xl:col-span-2 space-y-4 md:space-y-6">
            {/* 1. Market & Audience Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Market Potential */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 backdrop-blur-sm flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-primary">
                    <TrendingUp size={20} />
                    <h3 className="font-semibold text-sm md:text-base">{texts.viral_score || "Viral Potential Score"}</h3>
                    </div>
                    <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">{texts.tiktok_trend || "TikTok Trend"}</span>
                        <span className="text-white font-mono">{(data.market_scoring.tiktok_potential * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full">
                        <div className="bg-primary h-1.5 rounded-full shadow-[0_0_10px_#0EA5A4]" style={{ width: `${data.market_scoring.tiktok_potential * 100}%` }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">{texts.yt_shorts || "YouTube Shorts"}</span>
                        <span className="text-white font-mono">{(data.market_scoring.youtube_shorts_potential * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full">
                        <div className="bg-red-500 h-1.5 rounded-full shadow-[0_0_10px_#EF4444]" style={{ width: `${data.market_scoring.youtube_shorts_potential * 100}%` }}></div>
                        </div>
                    </div>
                    </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium">{texts.est_cpm || "EST. CPM"}</span>
                    <span className="text-accent font-bold font-mono text-sm tracking-wide">{data.market_scoring.estimated_cpm}</span>
                </div>
                </div>

                {/* Audience Personas */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 backdrop-blur-sm md:col-span-2">
                <div className="flex items-center gap-2 mb-3 text-accent">
                    <Target size={20} />
                    <h3 className="font-semibold text-sm md:text-base">{texts.audience_persona || "Target Audience"}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-[calc(100%-2rem)]">
                    {data.audience_personas.slice(0, 2).map((persona) => (
                    <div key={persona.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm flex flex-col justify-between">
                        <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-white text-base">{persona.name}</span>
                            <span className="bg-slate-800 text-xs px-2 py-0.5 rounded text-slate-300 font-mono">{persona.age_range}</span>
                        </div>
                        <p className="text-slate-400 text-xs mb-2 leading-relaxed line-clamp-2 md:line-clamp-none">{persona.behavior}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                        {persona.interests.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[10px] bg-slate-900 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded">
                            #{tag}
                            </span>
                        ))}
                        <span className="text-[10px] text-primary px-1.5 py-0.5 ml-auto italic">
                            {persona.script_tone}
                        </span>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            </div>

            {/* 2. ULTIMATE DEEP ANALYSIS DASHBOARD */}
            {data.deep_analysis && (
                <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent opacity-20 blur transition duration-1000 group-hover:opacity-40 rounded-xl"></div>
                <div className="relative bg-slate-900 border border-slate-700 rounded-xl p-4 md:p-6 backdrop-blur-xl">
                    
                    <div className="flex items-center justify-between mb-4 md:mb-6 border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                            <Brain size={24} />
                        </div>
                        <div>
                            <h3 className="text-base md:text-lg font-bold text-white">{texts.deep_analysis || "Deep Analysis"}</h3>
                            <p className="text-xs text-slate-400 hidden md:block">Forensic Analysis • Competitor Gap • Monetization</p>
                        </div>
                        </div>
                        <div className="text-[10px] md:text-xs font-mono px-2 md:px-3 py-1 bg-purple-900/30 border border-purple-500/30 text-purple-300 rounded-full animate-pulse">
                        ULTIMATE MODE
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {/* Left: DNA & Triggers */}
                        <div className="space-y-4 md:space-y-6">
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                <Activity size={14} /> Viral DNA & Hooks
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {data.deep_analysis.viral_dna.map((dna, i) => (
                                <span key={i} className="px-2 md:px-3 py-1 bg-slate-800 text-slate-200 text-xs rounded-lg border border-slate-700 font-medium">
                                    🧬 {dna}
                                </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                <Zap size={14} /> Trigger (NLP)
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {data.deep_analysis.psychological_triggers.map((trigger, i) => (
                                <span key={i} className="px-2 md:px-3 py-1 bg-red-900/20 text-red-400 text-xs rounded-lg border border-red-900/30 font-bold">
                                    ⚡ {trigger}
                                </span>
                                ))}
                            </div>
                        </div>
                        </div>

                        {/* Right: Strategy & Gap */}
                        <div className="space-y-3 md:space-y-4">
                        <div className="bg-slate-950/50 p-3 md:p-4 rounded-xl border border-slate-800/50">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-2">
                                <Crosshair size={14} className="text-yellow-500"/> Competitor Gap
                            </h4>
                            <p className="text-xs md:text-sm text-slate-300 italic">"{data.deep_analysis.competitor_gap}"</p>
                        </div>
                        
                        <div className="bg-slate-950/50 p-3 md:p-4 rounded-xl border border-slate-800/50">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-2">
                                <CheckCircle size={14} className="text-green-500"/> Winning Angle
                            </h4>
                            <p className="text-xs md:text-sm text-green-400 font-medium">"{data.deep_analysis.winning_angle}"</p>
                        </div>

                        <div className="bg-gradient-to-r from-primary/10 to-blue-600/10 p-3 md:p-4 rounded-xl border border-primary/20">
                            <h4 className="text-xs font-bold text-primary uppercase mb-1 flex items-center gap-2">
                                <DollarSign size={14} /> Monetization
                            </h4>
                            <p className="text-xs md:text-sm text-white font-bold">"{data.deep_analysis.monetization_strategy}"</p>
                        </div>
                        </div>
                    </div>

                </div>
                </div>
            )}

            {/* 3. Script & Scenes */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 md:p-6 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-2">
                  <div className="flex items-center gap-2 text-white">
                      <FileText size={20} />
                      <h3 className="text-base md:text-lg font-semibold">{texts.script_scenes || "Script & Scenes"}</h3>
                  </div>
                  
                  {/* TECHNICAL SPECS BADGE */}
                  {data.production_plan.technical_specs && (
                      <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 w-fit">
                          <MonitorPlay size={12} />
                          <span className="font-mono font-bold text-slate-200">
                              {data.production_plan.technical_specs.resolution} • {data.production_plan.technical_specs.ratio} • {data.production_plan.technical_specs.fps}FPS
                          </span>
                      </div>
                  )}
                </div>

                <div className="mb-6 p-4 bg-slate-950/80 rounded-lg border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/50"></div>
                <h4 className="text-[10px] uppercase text-slate-500 font-bold mb-2 tracking-wider">Master Hook</h4>
                <p className="text-sm text-slate-200 italic font-medium leading-relaxed">"{data.production_plan.script_master}"</p>
                </div>

                <div className="space-y-3">
                {data.production_plan.scenes.map((scene, idx) => (
                    <div key={scene.scene_id} className="flex gap-3 md:gap-4 p-3 md:p-4 bg-slate-800/20 rounded-xl border border-slate-800/50 hover:border-slate-700 hover:bg-slate-800/40 transition-all duration-300 group">
                    <div className="flex flex-col items-center justify-center w-8 md:w-12 shrink-0 rounded-lg bg-slate-900 border border-slate-700 text-slate-500 font-bold font-mono text-xs md:text-sm group-hover:text-primary group-hover:border-primary/50 transition-colors">
                        S{idx + 1}
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4">
                        <div className="md:col-span-7">
                        <h5 className="text-[10px] text-primary font-bold uppercase mb-1 tracking-wider">{texts.voiceover || "Voiceover"}</h5>
                        <p className="text-xs md:text-sm text-slate-200 leading-snug">{scene.vo_text}</p>
                        </div>
                        <div className="md:col-span-5 border-l border-slate-800/50 pl-2 md:pl-4 mt-1 md:mt-0">
                        <div className="flex justify-between items-start mb-1">
                            <h5 className="text-[10px] text-accent font-bold uppercase tracking-wider">{texts.visual || "Visual"}</h5>
                            <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-1.5 rounded">{scene.duration}s</span>
                        </div>
                        <p className="text-[10px] md:text-xs text-slate-400 line-clamp-2">{scene.visual_cues}</p>
                        <div className="mt-2 hidden md:block">
                            <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${scene.priority === 'final' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-slate-700/50 border-slate-600/50 text-slate-500'}`}>
                            {scene.priority} render
                            </span>
                        </div>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: VIDEO PREVIEW & ACTIONS (STICKY) */}
        <div className="xl:col-span-1">
           <div className="xl:sticky xl:top-6 space-y-6">
              
              {/* VIDEO PLAYER CARD */}
              <div className="bg-slate-950 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative group select-none">
                  <div className={`${aspectClass} bg-black relative flex items-center justify-center overflow-hidden transition-all duration-500 max-h-[60vh] md:max-h-none`}>
                      
                      {/* Live Video Simulation */}
                      {isPlaying ? (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 animate-pulse">
                              {/* LIVE BADGE */}
                              <div className="absolute top-4 left-4 z-20">
                                <span className="flex items-center gap-1.5 px-2 py-1 bg-red-600/90 text-white text-[10px] font-bold rounded animate-pulse shadow-lg backdrop-blur-sm">
                                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span> {texts.live_preview || "LIVE PREVIEW"}
                                </span>
                              </div>

                              {/* Simulate Moving Visuals */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-[spin_4s_linear_infinite]"></div>
                              </div>
                              <div className="absolute bottom-12 left-4 right-4 text-center z-20">
                                  <div className="bg-black/60 px-3 py-2 rounded-xl text-white text-xs md:text-sm font-medium backdrop-blur-md border border-white/10 shadow-lg">
                                      {data.production_plan.scenes[Math.floor((progress / 100) * data.production_plan.scenes.length)]?.vo_text || "Scene transition..."}
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
                            {/* Grid Background Effect */}
                            <div className="absolute inset-0 z-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                            {/* Static Placeholder Content */}
                            <div className="text-center z-0 opacity-50 relative">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800/50">
                                    <Film size={32} className="text-slate-600 md:hidden" />
                                    <Film size={40} className="text-slate-600 hidden md:block" />
                                </div>
                                <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Preview Mode</p>
                                <p className="text-[10px] text-slate-600 font-mono mt-1">{ratio} • 60FPS</p>
                            </div>
                          </>
                      )}
                      
                      {/* Play/Pause Overlay */}
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`absolute inset-0 z-30 flex items-center justify-center transition-all duration-300 ${isPlaying ? 'opacity-0 hover:opacity-100 bg-black/40' : 'opacity-100'}`}
                      >
                          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg group-hover:bg-white/20 hover:scale-110 transition-transform">
                             {isPlaying ? (
                                <Pause size={28} className="text-white fill-white ml-1" />
                             ) : (
                                <Play size={28} className="text-white fill-white ml-1" />
                             )}
                          </div>
                      </button>

                      {/* Video Controls (Fake) */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 z-40 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-full h-1 bg-slate-700 rounded-full mb-2 overflow-hidden cursor-pointer hover:h-1.5 transition-all">
                              <div className="h-full bg-primary transition-all duration-100 relative" style={{ width: `${progress}%` }}>
                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow"></div>
                              </div>
                          </div>
                          <div className="flex justify-between items-center text-white/80">
                              <div className="flex items-center gap-3">
                                  <button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}>
                                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                                  </button>
                                  <Volume2 size={14} className="hover:text-white cursor-pointer" />
                                  <span className="text-[10px] font-mono">00:{Math.floor(progress/100 * 30).toString().padStart(2,'0')} / 00:30</span>
                              </div>
                              <Maximize size={14} className="hover:text-white cursor-pointer" />
                          </div>
                      </div>
                  </div>

                  {/* AUTO-POST COUNTDOWN */}
                  <div className="bg-slate-900 p-4 border-t border-slate-800">
                     <div className="flex justify-between items-center mb-3">
                         <div className="flex items-center gap-2">
                            <Clock size={16} className={isAutoPosting ? "text-yellow-500 animate-pulse" : "text-slate-500"} />
                            <span className="text-sm font-bold text-white">{texts.auto_post_timer || "Auto-Post Timer"}</span>
                         </div>
                         <span className="font-mono text-xl font-bold text-yellow-500">{formatTime(autoPostTime)}</span>
                     </div>
                     <div className="w-full bg-slate-800 h-1.5 rounded-full mb-4">
                        <div 
                          className="bg-yellow-500 h-1.5 rounded-full transition-all duration-1000" 
                          style={{ width: `${(autoPostTime / 3600) * 100}%` }}
                        ></div>
                     </div>
                     
                     {postStatus === 'posted' ? (
                        <div className="w-full py-3 bg-green-500/10 border border-green-500/30 text-green-500 rounded-xl font-bold flex items-center justify-center gap-2">
                           <CheckCircle size={18} /> {texts.posted_success || "POSTED SUCCESSFULLY"}
                        </div>
                     ) : (
                        <div className="grid grid-cols-2 gap-3">
                           {/* Add to Queue Button */}
                           <button 
                             onClick={handleAddToQueue}
                             className="py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
                           >
                              <Calendar size={14} /> {texts.schedule || "SCHEDULE / QUEUE"}
                           </button>
                           <NeonButton onClick={handleApprove} size="md">
                              {texts.post_now || "POST NOW"}
                           </NeonButton>
                        </div>
                     )}
                  </div>
              </div>

              {/* GENERATED METADATA CARD */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
                  <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                     <FileText size={16} className="text-primary" /> {texts.gen_metadata || "Generated Metadata"}
                  </h4>
                  
                  {data.generated_content ? (
                      <div className="space-y-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">{texts.title_viral || "Title (Viral)"}</label>
                            <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white font-medium break-words">
                               {data.generated_content.title}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">{texts.desc_seo || "Description (SEO)"}</label>
                            <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 h-24 overflow-y-auto leading-relaxed">
                               {data.generated_content.description}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block flex items-center gap-1"><Hash size={10} /> {texts.hashtags || "Hashtags"}</label>
                            <div className="flex flex-wrap gap-1.5">
                                {data.generated_content.hashtags.map((tag, i) => (
                                    <span key={i} className="text-[10px] bg-blue-900/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                      </div>
                  ) : (
                      <div className="text-center py-8 text-slate-500 text-xs">
                          Metadata...
                      </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
                     <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                        <Share2 size={14} /> {texts.share || "Share"}
                     </button>
                     <button 
                        onClick={handleDownload}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                     >
                        <Download size={14} /> {texts.download || "Download"}
                     </button>
                  </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
};

export default PlanResult;
