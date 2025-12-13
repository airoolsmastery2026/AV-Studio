
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
}

const QueueDashboard: React.FC<QueueDashboardProps> = ({ apiKeys, currentPlan, jobs, setJobs }) => {
  
  // --- STATE ---
  const [region, setRegion] = useState<TargetRegion>('VN');
  const [niche, setNiche] = useState<string>('General');
  
  // Drafting State
  const [draftTitle, setDraftTitle] = useState('');
  const [draftCaption, setDraftCaption] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleMode, setScheduleMode] = useState<'now' | 'auto' | 'manual' | 'smart_rule'>('smart_rule'); // Default to new smart rule
  const [manualTime, setManualTime] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  
  // AI State
  const [isPredicting, setIsPredicting] = useState(false);
  const [goldenHours, setGoldenHours] = useState<GoldenHourRecommendation[]>([]);

  // NEW: Smart Rule State
  const [targetAccount, setTargetAccount] = useState<string>('');
  const [generatedSlots, setGeneratedSlots] = useState<ScheduleSlot[]>([]);
  
  // Smart Rule Config
  const [postQuantity, setPostQuantity] = useState<number>(3);
  const [startHour, setStartHour] = useState<string>("08:00");
  const [endHour, setEndHour] = useState<string>("22:00");

  // Get connected social keys
  const socialKeys = apiKeys.filter(k => k.category === 'social' && k.status === 'active');

  // Load plan into draft if available
  useEffect(() => {
    if (currentPlan) {
      setDraftTitle("Video AI Auto-Generated");
      setDraftCaption(currentPlan.production_plan.script_master.substring(0, 150) + "...");
    }
  }, [currentPlan]);

  // --- ACTIONS ---

  const handlePlatformToggle = (providerId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(providerId) 
        ? prev.filter(p => p !== providerId) 
        : [...prev, providerId]
    );
  };

  const handleGetGoldenHours = async () => {
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
    if (!googleKey) {
        alert("Cần Google API Key để phân tích giờ vàng.");
        return;
    }
    
    setIsPredicting(true);
    try {
        const platforms = selectedPlatforms.length > 0 ? selectedPlatforms : ['General Social Media'];
        const recommendations = await predictGoldenHours(googleKey.key, region, niche, platforms);
        setGoldenHours(recommendations);
    } catch (e) {
        console.error(e);
        alert("Không thể phân tích giờ vàng. Vui lòng thử lại.");
    } finally {
        setIsPredicting(false);
    }
  };

  const handleGenerateSmartSchedule = async () => {
      const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
      if (!googleKey) {
          alert("Cần Google API Key.");
          return;
      }
      if (!targetAccount) {
          alert("Vui lòng chọn Nick/Tài khoản áp dụng.");
          return;
      }

      setIsPredicting(true);
      try {
          const accountAlias = socialKeys.find(k => k.id === targetAccount)?.alias || "My Channel";
          // Pass custom config
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
          alert("Lỗi khi tạo lịch.");
      } finally {
          setIsPredicting(false);
      }
  };

  const handleApplySmartRule = () => {
      if (generatedSlots.length === 0 || !targetAccount) return;

      const today = new Date();
      const newJobs: PostingJob[] = generatedSlots.map(slot => {
          // Parse time "HH:mm"
          const [hours, minutes] = slot.time_of_day.split(':').map(Number);
          const postTime = new Date(today);
          postTime.setHours(hours, minutes, 0, 0);
          
          // If time passed, move to tomorrow
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
      alert(`Đã lên lịch ${generatedSlots.length} video cho tài khoản đã chọn!`);
  };

  const handleCreateJob = async () => {
    if (!draftTitle || selectedPlatforms.length === 0) {
        alert("Vui lòng nhập tiêu đề và chọn ít nhất 1 nền tảng.");
        return;
    }

    let finalTime = Date.now();
    if (scheduleMode === 'manual' && manualTime) {
        finalTime = new Date(manualTime).getTime();
    } else if (scheduleMode === 'auto' && goldenHours.length > 0) {
        // Mock: just add 2 hours for auto if we have recommendations
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

    // Handle "Post Now" Logic
    if (scheduleMode === 'now') {
        setIsPosting(true);
        
        try {
            // Execute post for all selected platforms concurrently
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

            // Check if all succeeded
            const allSuccess = results.every(r => r.success);
            
            // Update job status
            setJobs(prev => prev.map(j => j.id === newJob.id ? { 
                ...j, 
                status: allSuccess ? 'published' : 'failed' 
            } : j));

            if (allSuccess) {
                // If Zalo was one of them, show specific message
                if (results.some(r => r.platform === 'zalo')) {
                    alert("Đã đăng thành công lên Zalo Video và các nền tảng khác!");
                } else {
                    alert("Đăng bài thành công!");
                }
            } else {
                alert("Một số nền tảng đăng thất bại. Kiểm tra console.");
            }

        } catch (error) {
            console.error("Posting error", error);
            setJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: 'failed' } : j));
        } finally {
            setIsPosting(false);
        }
    }
  };

  const handleDeleteJob = (id: string) => {
      setJobs(prev => prev.filter(j => j.id !== id));
  };

  // Helper to get platform icon
  const getPlatformIcon = (provider: string) => {
      switch(provider) {
          case 'youtube': return <Youtube size={16} />;
          case 'tiktok': return <Video size={16} />;
          case 'facebook': return <Facebook size={16} />;
          case 'instagram': return <Instagram size={16} />;
          case 'twitter': return <Twitter size={16} />;
          case 'zalo': return (
              <div className="flex items-center gap-1">
                  <MessageCircle size={16} />
                  <span className="text-[9px] font-bold text-blue-300">ZALO</span>
              </div>
          );
          default: return <Globe size={16} />;
      }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12 h-full flex flex-col md:flex-row gap-6">
       
       {/* LEFT COLUMN: DRAFT & SCHEDULE CONFIG */}
       <div className="flex-1 space-y-6 overflow-y-auto pr-2">
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Edit3 size={20} className="text-primary" /> Soạn thảo & Cấu hình
              </h3>
              
              {/* 1. Content Inputs */}
              <div className="space-y-4 mb-6">
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1">Tiêu đề Video</label>
                      <input 
                          type="text" 
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                          placeholder="Tiêu đề hấp dẫn..."
                      />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1">Mô tả / Caption</label>
                      <textarea 
                          value={draftCaption}
                          onChange={(e) => setDraftCaption(e.target.value)}
                          className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none resize-none"
                          placeholder="Nhập mô tả video..."
                      />
                  </div>
              </div>

              {/* 2. Platform Selector */}
              <div className="mb-6">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Chọn nền tảng (Connected)</label>
                  <div className="flex flex-wrap gap-2">
                      {socialKeys.length === 0 && (
                          <div className="text-xs text-red-400 flex items-center gap-1 border border-red-900/30 bg-red-900/10 px-2 py-1 rounded">
                              <AlertCircle size={12} /> Chưa kết nối MXH nào trong Vault.
                          </div>
                      )}
                      {socialKeys.map(key => {
                          const isSelected = selectedPlatforms.includes(key.id);
                          const isZalo = key.provider === 'zalo';
                          return (
                              <button
                                  key={key.id}
                                  onClick={() => handlePlatformToggle(key.id)}
                                  className={`px-3 py-2 rounded-lg border flex items-center gap-2 transition-all ${
                                      isSelected 
                                      ? isZalo ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-primary/20 border-primary text-white shadow-[0_0_10px_rgba(14,165,164,0.3)]' 
                                      : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                                  }`}
                              >
                                  {getPlatformIcon(key.provider)}
                                  <span className="text-xs font-bold">{key.alias}</span>
                              </button>
                          )
                      })}
                  </div>
              </div>

              {/* 3. Scheduling Logic */}
              <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                  <div className="flex justify-between items-center mb-4">
                      <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                          <Clock size={14} /> Chiến lược & Thời gian
                      </label>
                      
                      {/* Region & Niche for AI */}
                      <div className="flex gap-2">
                          <select 
                            value={region} 
                            onChange={(e) => setRegion(e.target.value as TargetRegion)}
                            className="bg-slate-900 border border-slate-700 text-[10px] text-white rounded px-2 py-1 focus:outline-none"
                          >
                              <option value="VN">Vietnam (VN)</option>
                              <option value="US">USA (US)</option>
                              <option value="GLOBAL">Global</option>
                          </select>
                          <input 
                             type="text" 
                             value={niche}
                             onChange={(e) => setNiche(e.target.value)}
                             className="bg-slate-900 border border-slate-700 text-[10px] text-white rounded px-2 py-1 w-24 focus:outline-none"
                             placeholder="Niche (AI, Tech...)"
                          />
                      </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                      <button 
                        onClick={() => setScheduleMode('smart_rule')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${scheduleMode === 'smart_rule' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      >
                          <Zap size={12} className="inline mr-1"/> Custom Rule
                      </button>
                      <button 
                        onClick={() => setScheduleMode('auto')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${scheduleMode === 'auto' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      >
                          AI Phân tích
                      </button>
                      <button 
                        onClick={() => setScheduleMode('manual')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${scheduleMode === 'manual' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      >
                          Thủ Công
                      </button>
                      <button 
                        onClick={() => setScheduleMode('now')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${scheduleMode === 'now' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      >
                          Đăng Ngay
                      </button>
                  </div>

                  {/* MODE: SMART RULE (CUSTOM) */}
                  {scheduleMode === 'smart_rule' && (
                      <div className="space-y-4 animate-fade-in bg-slate-900 p-4 rounded-xl border border-green-900/30">
                          <div className="flex items-center justify-between mb-2">
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                  <Sliders size={12} /> Cấu hình lịch tự động
                              </p>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-2">
                              <div>
                                  <label className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">Số lượng</label>
                                  <input 
                                      type="number"
                                      min="1"
                                      max="24"
                                      value={postQuantity}
                                      onChange={(e) => setPostQuantity(parseInt(e.target.value) || 1)}
                                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white text-center font-bold focus:border-green-500"
                                  />
                              </div>
                              <div>
                                  <label className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">Bắt đầu</label>
                                  <input 
                                      type="time"
                                      value={startHour}
                                      onChange={(e) => setStartHour(e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white text-center font-bold focus:border-green-500"
                                  />
                              </div>
                              <div>
                                  <label className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">Kết thúc</label>
                                  <input 
                                      type="time"
                                      value={endHour}
                                      onChange={(e) => setEndHour(e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-white text-center font-bold focus:border-green-500"
                                  />
                              </div>
                          </div>
                          
                          <div className="flex gap-2">
                              <select 
                                  value={targetAccount}
                                  onChange={(e) => setTargetAccount(e.target.value)}
                                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                              >
                                  <option value="">-- Chọn Nick / Kênh --</option>
                                  {socialKeys.map(k => (
                                      <option key={k.id} value={k.id}>{k.alias} ({k.provider})</option>
                                  ))}
                              </select>
                              <NeonButton 
                                  onClick={handleGenerateSmartSchedule} 
                                  disabled={isPredicting}
                                  size="sm"
                              >
                                  {isPredicting ? <RefreshCw className="animate-spin" /> : "Tạo Lịch"}
                              </NeonButton>
                          </div>

                          {generatedSlots.length > 0 && (
                              <div className="space-y-2 mt-2">
                                  {generatedSlots.map(slot => (
                                      <div key={slot.slot_id} className="flex justify-between items-center p-2 bg-slate-950 rounded border border-green-500/20">
                                          <div>
                                              <span className="text-green-400 font-bold font-mono mr-2">{slot.time_of_day}</span>
                                              <span className="text-xs text-white">{slot.purpose}</span>
                                          </div>
                                          <div className="text-[10px] text-slate-500">{slot.target_audience_activity}</div>
                                      </div>
                                  ))}
                                  <button 
                                      onClick={handleApplySmartRule}
                                      className="w-full mt-2 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                  >
                                      Áp dụng & Lên hàng chờ <ArrowRight size={14} />
                                  </button>
                              </div>
                          )}
                      </div>
                  )}

                  {scheduleMode === 'manual' && (
                      <input 
                        type="datetime-local" 
                        value={manualTime}
                        onChange={(e) => setManualTime(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm mb-4"
                      />
                  )}

                  {scheduleMode === 'auto' && (
                      <div className="space-y-3">
                          <button 
                             onClick={handleGetGoldenHours}
                             disabled={isPredicting}
                             className="w-full py-2 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-lg text-xs text-purple-300 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                             {isPredicting ? <RefreshCw size={12} className="animate-spin" /> : <Hash size={12} />} 
                             Phân tích Giờ Vàng ({region})
                          </button>

                          {goldenHours.length > 0 && (
                              <div className="space-y-2 animate-fade-in">
                                  {goldenHours.map((h, i) => (
                                      <div key={i} className="flex justify-between items-center p-2 bg-slate-900 rounded border border-slate-800">
                                          <div className="flex items-center gap-2">
                                              <span className="text-yellow-500 font-bold text-sm">{h.time_label}</span>
                                              <span className="text-[10px] text-slate-500 bg-slate-950 px-1 rounded">Score: {h.score}/10</span>
                                          </div>
                                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                      </div>
                                  ))}
                                  <p className="text-[10px] text-slate-500 italic mt-1">
                                      *AI Reason: {goldenHours[0].reason}
                                  </p>
                              </div>
                          )}
                      </div>
                  )}
              </div>

              {/* Action Button (For Manual/Draft/Now Post) */}
              {scheduleMode !== 'smart_rule' && (
                  <div className="mt-6">
                      <NeonButton onClick={handleCreateJob} disabled={isPosting} className="w-full" size="lg">
                          {isPosting ? (
                              <span className="flex items-center gap-2"><RefreshCw className="animate-spin" /> UPLOADING TO SERVERS...</span>
                          ) : scheduleMode === 'now' ? (
                              <span className="flex items-center gap-2"><Send size={18} /> POST IMMEDIATELY</span>
                          ) : (
                              <span className="flex items-center gap-2"><Calendar size={18} /> ADD TO QUEUE</span>
                          )}
                      </NeonButton>
                  </div>
              )}
          </div>
       </div>

       {/* RIGHT COLUMN: QUEUE LIST */}
       <div className="w-full md:w-96 bg-slate-900/80 border-l border-slate-800 p-6 overflow-y-auto">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
              <span>Hàng chờ ({jobs.filter(j => j.status === 'scheduled').length})</span>
              <UploadCloud size={18} className="text-slate-500" />
          </h3>

          <div className="space-y-4">
              {jobs.length === 0 && (
                  <div className="text-center py-10 text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
                      <Clock size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Chưa có bài đăng nào.</p>
                  </div>
              )}

              {jobs.map((job) => (
                  <div key={job.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl hover:border-slate-600 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                              job.status === 'published' ? 'bg-green-900/20 text-green-400 border-green-500/20' :
                              job.status === 'publishing' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20 animate-pulse' :
                              job.status === 'failed' ? 'bg-red-900/20 text-red-400 border-red-500/20' :
                              'bg-blue-900/20 text-blue-400 border-blue-500/20'
                          }`}>
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
                      
                      <div className="flex items-center gap-1">
                          {job.platforms.map(pid => {
                             const key = apiKeys.find(k => k.id === pid);
                             return (
                                 <span key={pid} className={`w-5 h-5 rounded flex items-center justify-center text-[10px] text-slate-300 border ${key?.provider === 'zalo' ? 'bg-blue-900/50 border-blue-500/50 text-blue-300' : 'bg-slate-800 border-slate-700'}`} title={key?.alias}>
                                     {key?.provider === 'zalo' ? 'Z' : key?.provider.charAt(0).toUpperCase()}
                                 </span>
                             )
                          })}
                      </div>
                  </div>
              ))}
          </div>
       </div>

    </div>
  );
};

export default QueueDashboard;
