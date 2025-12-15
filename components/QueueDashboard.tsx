
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Check, AlertCircle, RefreshCw, Send, 
  Hash, Globe, Video, Youtube, Facebook, Instagram, Twitter, MessageCircle, 
  MoreVertical, Trash2, Edit3, UploadCloud, PlayCircle, Zap, Sliders, ArrowRight
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
  const [niche, setNiche] = useState<string>('General');
  
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

  // World Clock State
  const [timeZone, setTimeZone] = useState<string>('Asia/Ho_Chi_Minh');
  const [currentTime, setCurrentTime] = useState(new Date());

  const socialKeys = apiKeys.filter(k => k.category === 'social' && k.status === 'active');

  useEffect(() => {
    if (currentPlan) {
      setDraftTitle("Video AI Auto-Generated");
      setDraftCaption(currentPlan.production_plan.script_master.substring(0, 150) + "...");
    }
  }, [currentPlan]);

  // Clock Timer Effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeWithZone = (date: Date, tz: string) => {
    try {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            timeZone: tz, hour12: false
        }).format(date);
    } catch (e) { return "00:00:00"; }
  };

  const handlePlatformToggle = (providerId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(providerId) 
        ? prev.filter(p => p !== providerId) 
        : [...prev, providerId]
    );
  };

  const handleGetGoldenHours = async () => {
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
    if (!googleKey) { alert("Key Error"); return; }
    
    setIsPredicting(true);
    try {
        const platforms = selectedPlatforms.length > 0 ? selectedPlatforms : ['General Social Media'];
        const recommendations = await predictGoldenHours(googleKey.key, region, niche, platforms);
        setGoldenHours(recommendations);
    } catch (e) {
        alert("Error.");
    } finally {
        setIsPredicting(false);
    }
  };

  const handleGenerateSmartSchedule = async () => {
      const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
      if (!googleKey) { alert("Key Error"); return; }
      if (!targetAccount) { alert("Select Account"); return; }

      setIsPredicting(true);
      try {
          const accountAlias = socialKeys.find(k => k.id === targetAccount)?.alias || "My Channel";
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
              content_title: `${slot.purpose} (Slot #${slot.slot_id})`,
              caption: `Auto-generated placeholder for ${slot.target_audience_activity}`,
              hashtags: ['#Scheduled', '#Auto'],
              platforms: [targetAccount],
              scheduled_time: postTime.getTime(),
              status: 'scheduled'
          };
      });
      setJobs(prev => [...newJobs, ...prev]);
  };

  const handleCreateJob = async () => {
    if (!draftTitle || selectedPlatforms.length === 0) { alert("Title & Platform required."); return; }

    let finalTime = Date.now();
    if (scheduleMode === 'manual' && manualTime) {
        finalTime = new Date(manualTime).getTime();
    } else if (scheduleMode === 'auto' && goldenHours.length > 0) {
        finalTime = Date.now() + 1000 * 60 * 60 * 2; 
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
    <div className="animate-fade-in space-y-6 pb-12 h-full flex flex-col md:flex-row gap-6">
       
       <div className="flex-1 space-y-6 overflow-y-auto pr-2">
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Edit3 size={20} className="text-primary" /> {texts.title}
              </h3>
              
              <div className="space-y-4 mb-6">
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1">{texts.input_title}</label>
                      <input 
                          type="text" 
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                      />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1">{texts.input_caption}</label>
                      <textarea 
                          value={draftCaption}
                          onChange={(e) => setDraftCaption(e.target.value)}
                          className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none resize-none"
                      />
                  </div>
              </div>

              <div className="mb-6">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">{texts.platform_label}</label>
                  <div className="flex flex-wrap gap-2">
                      {socialKeys.map(key => {
                          const isSelected = selectedPlatforms.includes(key.id);
                          return (
                              <button
                                  key={key.id}
                                  onClick={() => handlePlatformToggle(key.id)}
                                  className={`px-3 py-2 rounded-lg border flex items-center gap-2 transition-all ${
                                      isSelected 
                                      ? 'bg-primary/20 border-primary text-white shadow-[0_0_10px_rgba(14,165,164,0.3)]' 
                                      : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                                  }`}
                              >
                                  <span className="text-xs font-bold">{key.alias}</span>
                              </button>
                          )
                      })}
                  </div>
              </div>

              <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                  <div className="flex justify-between items-center mb-4">
                      <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                          <Clock size={14} /> {texts.schedule_label}
                      </label>
                  </div>

                  <div className="flex gap-2 mb-4">
                      <button onClick={() => setScheduleMode('smart_rule')} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${scheduleMode === 'smart_rule' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>{texts.mode_smart}</button>
                      <button onClick={() => setScheduleMode('auto')} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${scheduleMode === 'auto' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>{texts.mode_auto}</button>
                      <button onClick={() => setScheduleMode('manual')} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${scheduleMode === 'manual' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>{texts.mode_manual}</button>
                      <button onClick={() => setScheduleMode('now')} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${scheduleMode === 'now' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>{texts.mode_now}</button>
                  </div>

                  {scheduleMode === 'smart_rule' && (
                      <div className="space-y-4 animate-fade-in bg-slate-900 p-4 rounded-xl border border-green-900/30">
                          <div className="grid grid-cols-3 gap-2 mb-2">
                              <div>
                                  <label className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">Qty</label>
                                  <input type="number" min="1" max="24" value={postQuantity} onChange={(e) => setPostQuantity(parseInt(e.target.value) || 1)} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white text-center font-bold" />
                              </div>
                              <div>
                                  <label className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">Start</label>
                                  <input type="time" value={startHour} onChange={(e) => setStartHour(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white text-center font-bold" />
                              </div>
                              <div>
                                  <label className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">End</label>
                                  <input type="time" value={endHour} onChange={(e) => setEndHour(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white text-center font-bold" />
                              </div>
                          </div>
                          
                          <div className="flex gap-2">
                              <select value={targetAccount} onChange={(e) => setTargetAccount(e.target.value)} className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white">
                                  <option value="">-- Select Account --</option>
                                  {socialKeys.map(k => (<option key={k.id} value={k.id}>{k.alias} ({k.provider})</option>))}
                              </select>
                              <NeonButton onClick={handleGenerateSmartSchedule} disabled={isPredicting} size="sm">
                                  {isPredicting ? <RefreshCw className="animate-spin" /> : "Gen Schedule"}
                              </NeonButton>
                          </div>

                          {generatedSlots.length > 0 && (
                              <button onClick={handleApplySmartRule} className="w-full mt-2 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                                  Apply Rule <ArrowRight size={14} />
                              </button>
                          )}
                      </div>
                  )}
              </div>

              {scheduleMode !== 'smart_rule' && (
                  <div className="mt-6">
                      <NeonButton onClick={handleCreateJob} disabled={isPosting} className="w-full" size="lg">
                          {isPosting ? (
                              <span className="flex items-center gap-2"><RefreshCw className="animate-spin" /> {texts.btn_analyzing}</span>
                          ) : scheduleMode === 'now' ? (
                              <span className="flex items-center gap-2"><Send size={18} /> {texts.btn_post_now}</span>
                          ) : (
                              <span className="flex items-center gap-2"><Calendar size={18} /> {texts.btn_schedule}</span>
                          )}
                      </NeonButton>
                  </div>
              )}
          </div>
       </div>

       <div className="w-full md:w-96 bg-slate-900/80 border-l border-slate-800 p-6 overflow-y-auto">
          
          {/* WORLD CLOCK WIDGET */}
          <div className="mb-6 bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
              <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-primary uppercase flex items-center gap-2">
                      <Globe size={14} /> Global Time
                  </h4>
                  <select 
                      value={timeZone} 
                      onChange={(e) => setTimeZone(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-300 px-2 py-1 outline-none focus:border-primary cursor-pointer hover:bg-slate-800"
                  >
                      <option value="Asia/Ho_Chi_Minh">Vietnam (GMT+7)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                      <option value="America/New_York">New York (EST)</option>
                      <option value="America/Los_Angeles">Los Angeles (PST)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Australia/Sydney">Sydney (AEST)</option>
                  </select>
              </div>
              <div className="flex flex-col items-center justify-center py-2">
                  <div className="text-4xl font-mono font-bold text-white tracking-widest drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                      {formatTimeWithZone(currentTime, timeZone)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest">
                      {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: timeZone }).format(currentTime)}
                  </div>
              </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
              <span>{texts.queue_list_title} ({jobs.filter(j => j.status === 'scheduled').length})</span>
              <UploadCloud size={18} className="text-slate-500" />
          </h3>

          <div className="space-y-4">
              {jobs.map((job) => (
                  <div key={job.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl hover:border-slate-600 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border bg-blue-900/20 text-blue-400 border-blue-500/20">
                              {job.status}
                          </span>
                          <button onClick={() => handleDeleteJob(job.id)} className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={14} />
                          </button>
                      </div>
                      <h4 className="font-bold text-white text-sm line-clamp-1 mb-1">{job.content_title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2">
                          <Clock size={10} /> {new Date(job.scheduled_time).toLocaleString()}
                      </div>
                  </div>
              ))}
          </div>
       </div>

    </div>
  );
};

export default QueueDashboard;
