
import React, { useState, useEffect } from 'react';
import { Factory, Play, AlertCircle, CheckCircle, Loader2, FileText, Image as ImageIcon, Video, Clock } from 'lucide-react';
import { ApiKeyConfig, BatchJobItem, SourceMetadata, PostingJob } from '../types';
import NeonButton from './NeonButton';
import { classifyInput, generateVideoPlan } from '../services/geminiService';

interface BatchProcessorProps {
  apiKeys: ApiKeyConfig[];
  onAddToQueue: (job: PostingJob) => void;
}

const BATCH_STORAGE_KEY = 'av_studio_batch_jobs_v1';

const BatchProcessor: React.FC<BatchProcessorProps> = ({ apiKeys, onAddToQueue }) => {
  const [inputText, setInputText] = useState('');
  
  // Load initial jobs
  const [jobs, setJobs] = useState<BatchJobItem[]>(() => {
      try {
          const saved = localStorage.getItem(BATCH_STORAGE_KEY);
          if (saved) return JSON.parse(saved);
      } catch(e) {}
      return [];
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Persistence Effect
  useEffect(() => {
      localStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs]);

  const handleImport = () => {
    const lines = inputText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return;

    const newJobs: BatchJobItem[] = lines.map(line => ({
      id: crypto.randomUUID(),
      input: line.trim(),
      status: 'queued',
      progress: 0,
      log: 'Waiting to start...',
    }));

    setJobs(prev => [...prev, ...newJobs]);
    setInputText('');
  };

  const processJob = async (job: BatchJobItem, apiKey: string) => {
    // Helper to update job state
    const updateJob = (updates: Partial<BatchJobItem>) => {
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, ...updates } : j));
    };

    try {
      // Step 1: Analyze
      updateJob({ status: 'analyzing', progress: 10, log: 'Analyzing content type...' });
      await new Promise(r => setTimeout(r, 500)); // Rate limit buffer
      
      const analysis = await classifyInput(apiKey, job.input);
      updateJob({ progress: 25, log: `Detected: ${analysis.strategy}` });

      // Step 2: Generate Plan (Script + Visuals)
      updateJob({ status: 'scripting', progress: 40, log: 'Generating script & visual cues...' });
      
      const metadata: SourceMetadata = {
          url: job.input,
          type: analysis.type,
          detected_strategy: analysis.strategy
      };

      const plan = await generateVideoPlan(apiKey, metadata);
      updateJob({ result: plan, progress: 60, log: 'Script generated successfully.' });

      // Step 3: Simulate Image Generation
      updateJob({ status: 'generating_assets', progress: 75, log: 'Generating AI Images (Veo/Imagen)...' });
      await new Promise(r => setTimeout(r, 1500)); // Simulate API time

      // Step 4: Simulate Video Rendering
      updateJob({ status: 'rendering', progress: 90, log: 'Rendering final video...' });
      await new Promise(r => setTimeout(r, 1500));

      // Step 5: Complete & Add to Queue
      updateJob({ status: 'completed', progress: 100, log: 'Video ready for publishing.' });
      
      if (plan.generated_content) {
          const postingJob: PostingJob = {
              id: crypto.randomUUID(),
              content_title: plan.generated_content.title,
              caption: plan.generated_content.description,
              hashtags: plan.generated_content.hashtags,
              platforms: ['tiktok', 'youtube'], // Default
              scheduled_time: Date.now() + 3600000, // +1 Hour
              status: 'scheduled'
          };
          onAddToQueue(postingJob);
      }

    } catch (error: any) {
      console.error(error);
      updateJob({ status: 'failed', progress: 100, log: `Error: ${error.message}`, error: error.message });
    }
  };

  const runBatch = async () => {
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
    if (!googleKey) {
        alert("Cần Google API Key (Active) để chạy Batch.");
        return;
    }

    setIsProcessing(true);
    
    // Process sequentially to avoid rate limits
    // Note: We use 'jobs' state ref via a loop to ensure we pick up the latest, but in React
    // we need to be careful. Here we iterate over the *current* list at start time.
    // Since processJob updates state, it's fine.
    // Improvement: Filter inside the loop to avoid processing jobs that got deleted/changed (if interactive)
    // but simplified here for stability.
    
    const queue = jobs.filter(j => j.status === 'queued' || j.status === 'failed'); // Retry failed ones too if user clicks start

    for (const job of queue) {
        // Check if job still exists and is queued (in case user cleared it mid-process)
        // We can't easily check live state inside async loop without refs, but this is acceptable for now.
        await processJob(job, googleKey.key);
    }

    setIsProcessing(false);
  };

  const clearCompleted = () => {
      setJobs(prev => prev.filter(j => j.status !== 'completed'));
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
       {/* Header */}
       <div className="border-b border-slate-800 pb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Factory className="text-primary animate-pulse" size={32} />
                Batch Video Factory
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
                Nhập danh sách URL hoặc Chủ đề. Hệ thống sẽ tự động Phân tích &rarr; Viết kịch bản &rarr; Tạo ảnh &rarr; Dựng video &rarr; Lên lịch đăng.
            </p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
           
           {/* LEFT: INPUT AREA */}
           <div className="lg:col-span-1 space-y-4">
               <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 md:p-5">
                   <label className="text-sm font-bold text-white mb-2 block">1. Nhập danh sách nguồn (1 dòng / 1 link)</label>
                   <textarea 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`https://tiktok.com/@channel/video1\nhttps://shopee.vn/san-pham-a\nChủ đề: Top 5 AI Tools`}
                      className="w-full h-48 md:h-64 bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-white focus:border-primary focus:outline-none font-mono resize-none mb-4"
                   />
                   <NeonButton onClick={handleImport} size="md" className="w-full">
                       <span className="flex items-center gap-2"><FileText size={16} /> Import vào Hàng chờ</span>
                   </NeonButton>
               </div>

               <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 md:p-5">
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="text-sm font-bold text-white">2. Điều khiển</h3>
                       <div className="text-xs text-slate-500">
                           {jobs.filter(j => j.status === 'queued').length} chờ • {jobs.filter(j => j.status === 'completed').length} xong
                       </div>
                   </div>
                   
                   <div className="space-y-3">
                       <NeonButton 
                           onClick={runBatch} 
                           disabled={isProcessing || jobs.filter(j => j.status === 'queued' || j.status === 'failed').length === 0} 
                           variant="primary" 
                           className="w-full"
                       >
                           {isProcessing ? (
                               <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Đang xử lý...</span>
                           ) : (
                               <span className="flex items-center gap-2"><Play /> Bắt đầu Sản xuất</span>
                           )}
                       </NeonButton>
                       
                       <button 
                           onClick={() => setJobs([])}
                           className="w-full py-3 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-bold"
                       >
                           Xóa tất cả
                       </button>
                   </div>
               </div>
           </div>

           {/* RIGHT: JOB MONITOR */}
           <div className="lg:col-span-2">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                       <Clock size={20} className="text-slate-500" /> Tiến độ Sản xuất
                   </h3>
                   {jobs.some(j => j.status === 'completed') && (
                       <button onClick={clearCompleted} className="text-xs text-primary hover:underline">
                           Xóa job đã xong
                       </button>
                   )}
               </div>

               <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                   {jobs.length === 0 && (
                       <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                           <Factory size={48} className="mx-auto mb-3 text-slate-700" />
                           <p className="text-slate-500">Danh sách trống. Hãy nhập URL bên trái.</p>
                       </div>
                   )}

                   {jobs.map(job => (
                       <div key={job.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative overflow-hidden group">
                           {/* Progress Bar Background */}
                           <div 
                               className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${
                                   job.status === 'failed' ? 'bg-red-500' : 
                                   job.status === 'completed' ? 'bg-green-500' : 'bg-primary'
                               }`} 
                               style={{ width: `${job.progress}%` }}
                           ></div>

                           <div className="flex justify-between items-start relative z-10 gap-2">
                               <div className="flex-1 min-w-0">
                                   <div className="flex flex-wrap items-center gap-2 mb-1">
                                       <span className="font-mono text-xs md:text-sm text-white truncate max-w-full" title={job.input}>{job.input}</span>
                                       
                                       {/* Status Badge */}
                                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border whitespace-nowrap ${
                                            job.status === 'queued' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                                            job.status === 'analyzing' ? 'bg-blue-900/20 text-blue-400 border-blue-500/20' :
                                            job.status === 'scripting' ? 'bg-purple-900/20 text-purple-400 border-purple-500/20' :
                                            job.status === 'generating_assets' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20' :
                                            job.status === 'rendering' ? 'bg-orange-900/20 text-orange-400 border-orange-500/20' :
                                            job.status === 'completed' ? 'bg-green-900/20 text-green-400 border-green-500/20' :
                                            'bg-red-900/20 text-red-400 border-red-500/20'
                                       }`}>
                                           {job.status.replace('_', ' ')}
                                       </span>
                                   </div>
                                   <p className="text-[10px] md:text-xs text-slate-500 font-mono flex items-center gap-2 truncate">
                                       <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-600 animate-pulse shrink-0"></span>
                                       {job.log}
                                   </p>
                               </div>

                               <div className="flex gap-2 shrink-0">
                                   {job.status === 'generating_assets' && <ImageIcon size={16} className="text-yellow-500 animate-bounce" />}
                                   {job.status === 'rendering' && <Video size={16} className="text-orange-500 animate-pulse" />}
                                   {job.status === 'completed' && <CheckCircle size={20} className="text-green-500" />}
                                   {job.status === 'failed' && <AlertCircle size={20} className="text-red-500" />}
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
       </div>
    </div>
  );
};

export default BatchProcessor;
