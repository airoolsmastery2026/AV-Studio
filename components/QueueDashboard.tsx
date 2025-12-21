
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Check, AlertCircle, RefreshCw, Send, 
  Hash, Globe, Video, Youtube, Facebook, Instagram, Twitter, MessageCircle, 
  MoreVertical, Trash2, Edit3, UploadCloud, PlayCircle, Zap, Sliders, ArrowRight, ChevronDown, CheckCircle2, ShieldCheck, Target, Layers, MapPin,
  Music, BrainCircuit
} from 'lucide-react';
import { ApiKeyConfig, OrchestratorResponse, PostingJob, TargetRegion, GoldenHourRecommendation, ScheduleSlot } from '../types';
import NeonButton from './NeonButton';
import { predictGoldenHours, generateDailySchedule } from '../services/geminiService';
import { postVideoToSocial } from '../services/socialService';

interface QueueDashboardProps {
  apiKeys: ApiKeyConfig[];
  currentPlan: OrchestratorResponse | null;
  jobs: PostingJob[];
  setJobs: React.Dispatch<React.SetStateAction<PostingJob[]>>;
  t?: any;
}

const QueueDashboard: React.FC<QueueDashboardProps> = ({ apiKeys, currentPlan, jobs, setJobs, t }) => {
  const texts = t || {};
  const [region, setRegion] = useState<TargetRegion>('VN');
  const [niche, setNiche] = useState<string>('AI & Technology');
  
  const [draftTitle, setDraftTitle] = useState('');
  const [draftCaption, setDraftCaption] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleMode, setScheduleMode] = useState<'now' | 'auto' | 'manual' | 'smart_rule'>('smart_rule'); 
  const [manualTime, setManualTime] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  
  const [isPredicting, setIsPredicting] = useState(false);
  const [goldenHours, setGoldenHours] = useState<GoldenHourRecommendation[]>([]);

  const [targetAccount, setTargetAccount] = useState<string>('');
  const [generatedSlots, setGeneratedSlots] = useState<ScheduleSlot[]>([]);
  
  const [postQuantity, setPostQuantity] = useState<number>(3);
  const [startHour, setStartHour] = useState<string>("08:00");
  const [endHour, setEndHour] = useState<string>("22:00");

  const socialKeys = apiKeys.filter(k => k.category === 'social' && k.status === 'active');

  useEffect(() => {
    if (currentPlan) {
      setDraftTitle(currentPlan.generated_content?.title || "Video AI Auto-Generated");
      setDraftCaption(currentPlan.generated_content?.description || currentPlan.production_plan.script_master.substring(0, 150) + "...");
    }
  }, [currentPlan]);

  const handlePlatformToggle = (providerId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(providerId) 
        ? prev.filter(p => p !== providerId) 
        : [...prev, providerId]
    );
  };

  const handleGetGoldenHours = async () => {
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
    if (!googleKey) { alert("Google API Key Required."); return; }
    
    setIsPredicting(true);
    try {
        const platforms = selectedPlatforms.length > 0 ? selectedPlatforms : ['TikTok', 'YouTube Shorts'];
        const recommendations = await predictGoldenHours(googleKey.key, region, niche, platforms);
        setGoldenHours(recommendations);
    } catch (e) {
        alert("Prediction failed.");
    } finally {
        setIsPredicting(false);
    }
  };

  const handleGenerateSmartSchedule = async () => {
      const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
      if (!googleKey) { alert("Google API Key Required."); return; }
      if (!targetAccount) { alert("Select Target Account"); return; }

      setIsPredicting(true);
      try {
          const accountAlias = socialKeys.find(k => k.id === targetAccount)?.alias || "Primary Channel";
          const slots = await generateDailySchedule(
              googleKey.key, 
              accountAlias, 
              niche, 
              region,
              { quantity: postQuantity, startHour, endHour }
          );
          setGeneratedSlots(slots);
      } catch(e) {
          console.error(e);
      } finally {
          setIsPredicting(false);
      }
  };

  const handleApplySmartRule = () => {
      if (generatedSlots.length === 0 || !targetAccount) return;
      const today = new Date();
      const newJobs: PostingJob[] = generatedSlots.map(slot => {
          const [hours, minutes] = slot.time_of_day.split(':').map(Number);
          const postTime = new Date(today);
          postTime.setHours(hours, minutes, 0, 0);
          if (postTime.getTime() < Date.now()) {
              postTime.setDate(postTime.getDate() + 1);
          }
          return {
              id: crypto.randomUUID(),
              content_title: `${slot.purpose} (AI Slot #${slot.slot_id})`,
              caption: `Scheduled for: ${slot.target_audience_activity}`,
              hashtags: ['#Scheduled', '#AutoViral', '#AVStudio'],
              platforms: [targetAccount],
              scheduled_time: postTime.getTime(),
              status: 'scheduled'
          };
      });
      setJobs(prev => [...newJobs, ...prev]);
      setGeneratedSlots([]);
      alert(`Đã nạp ${newJobs.length} lịch đăng thông minh vào hàng chờ.`);
  };

  const handleCreateJob = async () => {
    if (!draftTitle || selectedPlatforms.length === 0) { alert("Title and at least one Platform are required."); return; }

    let finalTime = Date.now();
    if (scheduleMode === 'manual' && manualTime) {
        finalTime = new Date(manualTime).getTime();
    } else if (scheduleMode === 'auto' && goldenHours.length > 0) {
        // Use best scoring hour
        const bestHour = goldenHours[0].time_label; // e.g. "20:30"
        const [h, m] = bestHour.split(':').map(Number);
        const t = new Date();
        t.setHours(h, m, 0, 0);
        if (t.getTime() < Date.now()) t.setDate(t.getDate() + 1);
        finalTime = t.getTime();
    }

    const newJob: PostingJob = {
        id: crypto.randomUUID(),
        content_title: draftTitle,
        caption: draftCaption,
        hashtags: ['#AI', '#Viral', '#AutoShorts'],
        platforms: selectedPlatforms,
        scheduled_time: finalTime,
        status: scheduleMode === 'now' ? 'publishing' : 'scheduled'
    };

    setJobs(prev => [newJob, ...prev]);

    if (scheduleMode === 'now') {
        setIsPosting(true);
        try {
            const results = await Promise.all(selectedPlatforms.map(async (platformId) => {
                const keyConfig = apiKeys.find(k => k.id === platformId);
                if (keyConfig) {
                    return await postVideoToSocial(keyConfig, { 
                        title: draftTitle, 
                        caption: draftCaption 
                    });
                }
                return { success: false, platform: 'unknown', error: 'Key not found' };
            }));
            const allSuccess = results.every(r => r.success);
            setJobs(prev => prev.map(j => j.id === newJob.id ? { 
                ...j, 
                status: allSuccess ? 'published' : 'failed' 
            } : j));
        } catch (error) {
            setJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: 'failed' } : j));
        } finally {
            setIsPosting(false);
        }
    }
  };

  const handleDeleteJob = (id: string) => {
      setJobs(prev => prev.filter(j => j.id !== id));
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12 h-full flex flex-col md:flex-row gap-6 overflow-hidden">
       
       {/* LEFT: SCHEDULER CONFIG */}
       <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                    <Calendar size={28} className="text-primary" /> {texts.queue || "Scheduler & Dispatch"}
                </h3>
                <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                    <Globe size={14} className="text-slate-500" />
                    <select 
                        value={region} 
                        onChange={(e) => setRegion(e.target.value)} 
                        className="bg-transparent text-xs font-bold text-white outline-none"
                    >
                        <option value="VN">VIETNAM (UTC+7)</option>
                        <option value="US">USA (EST)</option>
                        <option value="GLOBAL">GLOBAL (UTC)</option>
                    </select>
                </div>
              </div>
              
              <div className="space-y-5 mb-8">
                  <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Content Meta-Title</label>
                      <input 
                          type="text" 
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          placeholder="e.g. AI Tools Revolution 2024"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white font-bold focus:border-primary focus:outline-none transition-all shadow-inner"
                      />
                  </div>
                  <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Post Caption (Viral Optimized)</label>
                      <textarea 
                          value={draftCaption}
                          onChange={(e) => setDraftCaption(e.target.value)}
                          placeholder="Write your viral caption here..."
                          className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 focus:border-primary focus:outline-none resize-none transition-all shadow-inner"
                      />
                  </div>
              </div>

              <div className="mb-8">
                  <label className="text-[10px] font-black text-slate-500 uppercase mb-3 block tracking-widest">Active Channels Selection</label>
                  <div className="flex flex-wrap gap-3">
                      {socialKeys.length === 0 ? (
                          <div className="text-xs text-slate-600 italic">No social accounts connected in Vault.</div>
                      ) : (
                          socialKeys.map(key => {
                              const isSelected = selectedPlatforms.includes(key.id);
                              return (
                                  <button
                                      key={key.id}
                                      onClick={() => handlePlatformToggle(key.id)}
                                      className={`px-4 py-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                                          isSelected 
                                          ? 'bg-primary/10 border-primary text-white shadow-neon scale-105' 
                                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                                      }`}
                                  >
                                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-slate-900'}`}>
                                          {key.provider === 'youtube' ? <Youtube size={16}/> : key.provider === 'tiktok' ? <Music size={16}/> : <Target size={16}/>}
                                      </div>
                                      <span className="text-xs font-black uppercase tracking-tighter">{key.alias}</span>
                                      {isSelected && <CheckCircle2 size={14} className="text-primary ml-1" />}
                                  </button>
                              )
                          })
                      )}
                  </div>
              </div>

              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><Zap size={100} /></div>
                  
                  <div className="flex justify-between items-center mb-6">
                      <label className="text-xs font-black text-white uppercase flex items-center gap-2 tracking-widest">
                          <Clock size={16} className="text-yellow-500" /> Scheduling Strategy
                      </label>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      {[
                        { id: 'smart_rule', label: 'AI RULES', icon: BrainCircuit, color: 'text-green-400' },
                        { id: 'auto', label: 'GOLDEN HR', icon: Zap, color: 'text-purple-400' },
                        { id: 'manual', label: 'MANUAL', icon: Edit3, color: 'text-blue-400' },
                        { id: 'now', label: 'IMMEDIATE', icon: Send, color: 'text-red-400' }
                      ].map(mode => (
                          <button 
                            key={mode.id}
                            onClick={() => setScheduleMode(mode.id as any)} 
                            className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black border transition-all ${
                                scheduleMode === mode.id 
                                ? `bg-slate-900 border-white text-white shadow-lg scale-105` 
                                : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                            }`}
                          >
                              <mode.icon size={20} className={scheduleMode === mode.id ? mode.color : 'text-slate-700'} />
                              {mode.label}
                          </button>
                      ))}
                  </div>

                  {scheduleMode === 'smart_rule' && (
                      <div className="space-y-6 animate-fade-in bg-slate-900/80 p-6 rounded-2xl border border-green-500/20">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                  <label className="text-[10px] text-slate-500 block uppercase font-black tracking-widest">Post Frequency</label>
                                  <input type="number" min="1" max="24" value={postQuantity} onChange={(e) => setPostQuantity(parseInt(e.target.value) || 1)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono font-bold focus:border-green-500 outline-none" />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] text-slate-500 block uppercase font-black tracking-widest">Window Start</label>
                                  <input type="time" value={startHour} onChange={(e) => setStartHour(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono font-bold focus:border-green-500 outline-none" />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] text-slate-500 block uppercase font-black tracking-widest">Window End</label>
                                  <input type="time" value={endHour} onChange={(e) => setEndHour(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono font-bold focus:border-green-500 outline-none" />
                              </div>
                          </div>
                          
                          <div className="flex flex-col md:flex-row gap-4">
                              <div className="flex-1 space-y-2">
                                  <label className="text-[10px] text-slate-500 block uppercase font-black tracking-widest">Target Account</label>
                                  <select value={targetAccount} onChange={(e) => setTargetAccount(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-green-500">
                                      <option value="">-- Choose Connection --</option>
                                      {socialKeys.map(k => (<option key={k.id} value={k.id}>{k.alias} ({k.provider.toUpperCase()})</option>))}
                                  </select>
                              </div>
                              <div className="flex items-end">
                                  <button 
                                    onClick={handleGenerateSmartSchedule} 
                                    disabled={isPredicting || !targetAccount} 
                                    className="w-full md:w-auto px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-30 shadow-lg"
                                  >
                                      {isPredicting ? <RefreshCw className="animate-spin" size={16}/> : <Target size={16} />} 
                                      {isPredicting ? "CALCULATING..." : "GENERATE SLOTS"}
                                  </button>
                              </div>
                          </div>

                          {generatedSlots.length > 0 && (
                              <div className="pt-4 border-t border-slate-800 space-y-3 animate-fade-in">
                                  <div className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-3">AI Proposed Schedule Slots:</div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {generatedSlots.map(slot => (
                                          <div key={slot.slot_id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                                              <div className="bg-green-900/20 text-green-500 p-2 rounded-lg font-mono text-xs font-black">{slot.time_of_day}</div>
                                              <div className="flex-1 min-w-0">
                                                  <div className="text-[10px] text-white font-bold truncate">{slot.purpose}</div>
                                                  <div className="text-[9px] text-slate-500 truncate">{slot.target_audience_activity}</div>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                                  <button onClick={handleApplySmartRule} className="w-full py-4 bg-white text-black hover:bg-slate-200 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-3 mt-4 shadow-2xl active:scale-95">
                                      COMMIT AI SCHEDULE TO QUEUE <ArrowRight size={18} />
                                  </button>
                              </div>
                          )}
                      </div>
                  )}

                  {scheduleMode === 'auto' && (
                      <div className="space-y-6 animate-fade-in bg-slate-900/80 p-6 rounded-2xl border border-purple-500/20">
                          <div className="flex justify-between items-center">
                              <p className="text-xs text-slate-400 font-medium">Predict the best <strong>Golden Hours</strong> for maximum reach based on current 2024 algorithm trends.</p>
                              <button 
                                onClick={handleGetGoldenHours} 
                                disabled={isPredicting}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-2"
                              >
                                {isPredicting ? <RefreshCw className="animate-spin" size={14}/> : <Zap size={14}/>} PREDICT
                              </button>
                          </div>
                          
                          {goldenHours.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                                  {goldenHours.map((gh, i) => (
                                      <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl relative group hover:border-purple-500 transition-colors">
                                          <div className="absolute top-2 right-2 text-[10px] font-black text-purple-500">{gh.score}% Potential</div>
                                          <div className="text-2xl font-mono font-black text-white mb-1">{gh.time_label}</div>
                                          <p className="text-[10px] text-slate-500 leading-tight italic">"{gh.reason}"</p>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  )}

                  {scheduleMode === 'manual' && (
                      <div className="animate-fade-in space-y-4 bg-slate-900/80 p-6 rounded-2xl border border-blue-500/20">
                          <div className="space-y-2">
                             <label className="text-[10px] text-slate-500 block uppercase font-black tracking-widest">Select Precise Post Time</label>
                             <input 
                                type="datetime-local" 
                                value={manualTime} 
                                onChange={(e) => setManualTime(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono font-bold focus:border-blue-500 outline-none"
                             />
                          </div>
                      </div>
                  )}
              </div>

              {scheduleMode !== 'smart_rule' && (
                  <div className="mt-8">
                      <NeonButton onClick={handleCreateJob} disabled={isPosting} className="w-full h-16 text-lg" size="lg">
                          {isPosting ? (
                              <span className="flex items-center gap-3"><RefreshCw className="animate-spin" /> DISPATCHING MISSION...</span>
                          ) : scheduleMode === 'now' ? (
                              <span className="flex items-center gap-3"><Send size={20} /> FIRE MISSION IMMEDIATELY</span>
                          ) : (
                              <span className="flex items-center gap-3"><Calendar size={20} /> STAGE INTO QUEUE</span>
                          )}
                      </NeonButton>
                  </div>
              )}
          </div>
       </div>

       {/* RIGHT: QUEUE MONITOR */}
       <div className="w-full md:w-[400px] bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
          
          <div className="flex justify-between items-center mb-8 shrink-0">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Live Queue</h3>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                   {jobs.filter(j => j.status === 'scheduled').length} Pending Operations
                </div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500">
                <UploadCloud size={20} />
              </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {jobs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-950/30">
                      <Layers size={48} className="text-slate-800 mb-4" />
                      <p className="text-slate-600 text-sm font-bold uppercase tracking-widest">Awaiting staged content</p>
                      <p className="text-slate-700 text-xs mt-2">Commit items from the Studio or Auto-Pilot to see them here.</p>
                  </div>
              ) : (
                  jobs.map((job) => (
                      <div key={job.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl hover:border-slate-600 transition-all group shadow-xl relative overflow-hidden">
                          {job.status === 'published' && <div className="absolute inset-0 bg-green-500/5 pointer-events-none"></div>}
                          
                          <div className="flex justify-between items-start mb-3">
                              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border shadow-sm ${
                                  job.status === 'scheduled' ? 'bg-blue-900/20 text-blue-400 border-blue-500/30' :
                                  job.status === 'published' ? 'bg-green-900/20 text-green-400 border-green-500/30' :
                                  'bg-red-900/20 text-red-400 border-red-500/30'
                              }`}>
                                  {job.status}
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-1.5 text-slate-500 hover:text-white transition-colors"><Edit3 size={14}/></button>
                                  <button onClick={() => handleDeleteJob(job.id)} className="p-1.5 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                              </div>
                          </div>
                          <h4 className="font-black text-white text-sm line-clamp-1 mb-2 tracking-tight uppercase">{job.content_title}</h4>
                          
                          <div className="flex items-center gap-3">
                             <div className="flex-1 flex items-center gap-2 text-[11px] font-mono text-slate-500">
                                <Clock size={12} className="text-slate-700" /> 
                                {new Date(job.scheduled_time).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                             </div>
                             <div className="flex -space-x-2">
                                {job.platforms.map((p, i) => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[10px] font-black text-primary" title={p}>
                                        {p.substring(0,1).toUpperCase()}
                                    </div>
                                ))}
                             </div>
                          </div>
                      </div>
                  ))
              )}
          </div>
          
          {jobs.length > 0 && (
             <div className="mt-6 pt-6 border-t border-slate-800 shrink-0">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <ShieldCheck size={20} className="text-primary" />
                      <div>
                         <div className="text-[10px] font-black text-white uppercase">Network Relay</div>
                         <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Protocol 12 Secure</div>
                      </div>
                   </div>
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
             </div>
          )}
       </div>

    </div>
  );
};

export default QueueDashboard;
