
import React, { useState } from 'react';
import { Factory, Play, AlertCircle, CheckCircle, Loader2, FileText, Image as ImageIcon, Video, Clock, Cpu, ChevronDown, ChevronUp } from 'lucide-react';
import { ApiKeyConfig, BatchJobItem, PostingJob, ScriptModel, VisualModel, VoiceModel, VideoResolution, AspectRatio } from '../types';
import NeonButton from './NeonButton';
import ModelSelector from './ModelSelector';

interface BatchProcessorProps {
  apiKeys: ApiKeyConfig[];
  onAddToQueue: (job: PostingJob) => void;
  t?: any;
  
  // Model State Props
  scriptModel?: ScriptModel;
  setScriptModel?: (model: ScriptModel) => void;
  visualModel?: VisualModel;
  setVisualModel?: (model: VisualModel) => void;
  voiceModel?: VoiceModel;
  setVoiceModel?: (model: VoiceModel) => void;
  resolution?: VideoResolution;
  setResolution?: (res: VideoResolution) => void;
  aspectRatio?: AspectRatio;
  setAspectRatio?: (ratio: AspectRatio) => void;

  // Injected Global State
  jobs: BatchJobItem[];
  setJobs: React.Dispatch<React.SetStateAction<BatchJobItem[]>>;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
}

const BatchProcessor: React.FC<BatchProcessorProps> = ({ 
    apiKeys, onAddToQueue, t,
    scriptModel = 'Gemini 2.5 Flash', setScriptModel = () => {},
    visualModel = 'SORA', setVisualModel = () => {},
    voiceModel = 'Google Chirp', setVoiceModel = () => {},
    resolution = '1080p', setResolution = () => {},
    aspectRatio = '9:16', setAspectRatio = () => {},
    jobs, setJobs, isProcessing, setIsProcessing
}) => {
  const texts = t || {};
  const [inputText, setInputText] = useState('');
  const [showModelConfig, setShowModelConfig] = useState(false);

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

  const handleStartBatch = () => {
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
    if (!googleKey) {
        alert("Cần Google API Key (Active) để chạy Batch.");
        return;
    }
    // Just toggle the switch, App.tsx handles the logic
    setIsProcessing(true);
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
                {texts.title || "Batch Video Factory"}
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
                {texts.subtitle || "Enter URL list. Auto Analyze → Script → Render → Schedule."}
            </p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
           
           {/* LEFT: INPUT AREA */}
           <div className="lg:col-span-1 space-y-4">
               {/* AI Model Config Collapsible */}
               <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                    <button 
                        onClick={() => setShowModelConfig(!showModelConfig)}
                        className="w-full p-4 flex justify-between items-center hover:bg-slate-800/50 transition-colors"
                    >
                        <span className="text-xs font-bold text-primary flex items-center gap-2">
                            <Cpu size={14} /> AI Model Configuration
                        </span>
                        {showModelConfig ? <ChevronUp size={14} className="text-slate-500"/> : <ChevronDown size={14} className="text-slate-500"/>}
                    </button>
                    
                    {showModelConfig && (
                        <div className="p-4 border-t border-slate-800 animate-fade-in max-h-[400px] overflow-y-auto custom-scrollbar">
                            <ModelSelector 
                                scriptModel={scriptModel} setScriptModel={setScriptModel}
                                visualModel={visualModel} setVisualModel={setVisualModel}
                                voiceModel={voiceModel} setVoiceModel={setVoiceModel}
                                resolution={resolution} setResolution={setResolution}
                                aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
                            />
                        </div>
                    )}
               </div>

               <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 md:p-5">
                   <label className="text-sm font-bold text-white mb-2 block">{texts.input_label || "1. Input Source List"}</label>
                   <textarea 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`https://tiktok.com/@channel/video1\nhttps://shopee.vn/san-pham-a\nChủ đề: Top 5 AI Tools`}
                      className="w-full h-48 md:h-64 bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-white focus:border-primary focus:outline-none font-mono resize-none mb-4"
                   />
                   <NeonButton onClick={handleImport} size="md" className="w-full">
                       <span className="flex items-center gap-2"><FileText size={16} /> {texts.import_btn || "Import to Queue"}</span>
                   </NeonButton>
               </div>

               <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 md:p-5">
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="text-sm font-bold text-white">{texts.control_title || "2. Controls"}</h3>
                       <div className="text-xs text-slate-500">
                           {jobs.filter(j => j.status === 'queued').length} {texts.waiting || "waiting"} • {jobs.filter(j => j.status === 'completed').length} {texts.done || "done"}
                       </div>
                   </div>
                   
                   <div className="space-y-3">
                       <NeonButton 
                           onClick={handleStartBatch} 
                           disabled={isProcessing || jobs.filter(j => j.status === 'queued' || j.status === 'failed').length === 0} 
                           variant="primary" 
                           className="w-full"
                       >
                           {isProcessing ? (
                               <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> {texts.processing || "Processing..."}</span>
                           ) : (
                               <span className="flex items-center gap-2"><Play /> {texts.start_btn || "Start Production"}</span>
                           )}
                       </NeonButton>
                       
                       <button 
                           onClick={() => setJobs([])}
                           className="w-full py-3 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-bold"
                       >
                           {texts.clear_btn || "Clear All"}
                       </button>
                   </div>
               </div>
           </div>

           {/* RIGHT: JOB MONITOR */}
           <div className="lg:col-span-2">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                       <Clock size={20} className="text-slate-500" /> {texts.progress_title || "Production Progress"}
                   </h3>
                   {jobs.some(j => j.status === 'completed') && (
                       <button onClick={clearCompleted} className="text-xs text-primary hover:underline">
                           {texts.clear_done || "Clear Completed"}
                       </button>
                   )}
               </div>

               <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                   {jobs.length === 0 && (
                       <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                           <Factory size={48} className="mx-auto mb-3 text-slate-700" />
                           <p className="text-slate-500">{texts.empty_state || "List empty."}</p>
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
