
import React from 'react';
import { ScriptModel, VisualModel, VoiceModel, VideoResolution, AspectRatio } from '../types';
import { Bot, Palette, Mic, Video, Zap, FileText, Smartphone, Monitor, ShieldCheck } from 'lucide-react';

interface ModelFlowDiagramProps {
  scriptModel: ScriptModel;
  visualModel: VisualModel;
  voiceModel: VoiceModel;
  resolution: VideoResolution;
  aspectRatio: AspectRatio;
}

const ModelFlowDiagram: React.FC<ModelFlowDiagramProps> = ({ 
  scriptModel, 
  visualModel, 
  voiceModel,
  resolution,
  aspectRatio
}) => {
  // Detect Ecosystem
  const isGoogleStack = scriptModel.includes('Gemini') && (visualModel.includes('VEO') || visualModel.includes('IMAGEN')) && voiceModel.includes('Google');
  const isOpenAIStack = scriptModel.includes('GPT') && visualModel.includes('SORA') && voiceModel.includes('OpenAI');
  const isXAIStack = scriptModel.includes('Grok');
  const isNextGenVisual = visualModel.includes('KLING') || visualModel.includes('HAILUO');

  // Dynamic Styles
  const scriptColor = scriptModel.includes('Gemini') ? 'text-blue-400' : scriptModel.includes('GPT') ? 'text-green-400' : scriptModel.includes('Grok') ? 'text-white' : 'text-purple-400';
  const scriptBorder = scriptModel.includes('Gemini') ? 'border-blue-500' : scriptModel.includes('GPT') ? 'border-green-500' : scriptModel.includes('Grok') ? 'border-white' : 'border-purple-500';
  
  // Output Icon
  const OutputIcon = aspectRatio === '9:16' ? Smartphone : Monitor;

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden mb-8">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[size:40px_40px] bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] opacity-20"></div>
      
      {/* Ecosystem Badge */}
      {isGoogleStack && (
          <div className="absolute top-4 right-4 z-10 bg-blue-900/20 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 animate-fade-in">
              <ShieldCheck size={12} /> Google Ecosystem Active
          </div>
      )}
      {isXAIStack && (
          <div className="absolute top-4 right-4 z-10 bg-slate-800/50 border border-white/20 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 animate-fade-in">
              <Zap size={12} className="text-white" /> xAI Grok Engine Active
          </div>
      )}

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 min-h-[300px] md:min-h-[200px]">
        
        {/* NODE 1: INPUT */}
        <div className="flex flex-col items-center gap-2 z-20 group">
           <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg relative transition-transform hover:scale-105">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 blur rounded-2xl group-hover:opacity-40 transition-opacity"></div>
              <FileText size={28} className="text-slate-400" />
           </div>
           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Input</span>
        </div>

        {/* CONNECTION 1: INPUT -> SCRIPT */}
        <div className="flex-1 h-px bg-slate-800 relative hidden md:block w-full md:w-auto">
           <div className="absolute top-1/2 left-0 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6] -translate-y-1/2 animate-[moveRight_2s_linear_infinite]"></div>
        </div>

        {/* NODE 2: SCRIPT BRAIN */}
        <div className="flex flex-col items-center gap-2 z-20">
           <div className={`w-24 h-24 rounded-2xl bg-slate-900 border-2 ${scriptBorder} flex flex-col items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.15)] relative group transition-all`}>
              <div className={`absolute -inset-2 ${scriptModel.includes('Gemini') ? 'bg-blue-500/10' : 'bg-purple-500/10'} blur-xl rounded-full animate-pulse`}></div>
              <Bot size={32} className={`${scriptColor} mb-1`} />
              <div className={`text-[10px] ${scriptColor.replace('400', '300')} font-bold text-center px-1 leading-tight`}>{scriptModel}</div>
           </div>
           <span className={`text-xs font-bold ${scriptColor} uppercase tracking-widest`}>Logic Core</span>
        </div>

        {/* CONNECTION 2: SPLIT FLOW */}
        <div className="flex-1 relative h-24 hidden md:flex items-center">
            <div className="absolute top-0 left-0 w-full h-1/2 border-l border-t border-slate-700 rounded-tl-3xl"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 border-l border-b border-slate-700 rounded-bl-3xl"></div>
        </div>

        {/* NODE 3 & 4: PARALLEL PROCESSING */}
        <div className="flex flex-row md:flex-col gap-8 md:gap-4 z-20">
            {/* Visual Node */}
            <div className={`flex items-center gap-3 bg-slate-900 border ${isNextGenVisual ? 'border-accent' : 'border-slate-700'} p-3 rounded-xl shadow-lg min-w-[160px] transition-colors`}>
               <div className={`p-2 rounded-lg ${isNextGenVisual ? 'bg-accent/20' : 'bg-slate-800'}`}>
                  <Palette size={20} className={isNextGenVisual ? 'text-accent' : 'text-slate-400'} />
               </div>
               <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Visual Engine</div>
                  <div className="text-xs text-white font-bold">{visualModel}</div>
               </div>
            </div>

            {/* Voice Node */}
            <div className={`flex items-center gap-3 bg-slate-900 border ${voiceModel.includes('Chirp') || voiceModel.includes('Eleven') ? 'border-green-500' : 'border-slate-700'} p-3 rounded-xl shadow-lg min-w-[160px] transition-colors`}>
               <div className={`p-2 rounded-lg ${voiceModel.includes('Chirp') || voiceModel.includes('Eleven') ? 'bg-green-500/20' : 'bg-slate-800'}`}>
                  <Mic size={20} className={voiceModel.includes('Chirp') || voiceModel.includes('Eleven') ? 'text-green-400' : 'text-slate-400'} />
               </div>
               <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Voice Engine</div>
                  <div className="text-xs text-white font-bold">{voiceModel}</div>
               </div>
            </div>
        </div>

        {/* NODE 5: OUTPUT */}
        <div className="flex flex-col items-center gap-2 z-20">
           <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-800 to-black border-2 border-primary flex flex-col items-center justify-center shadow-[0_0_30px_rgba(14,165,164,0.4)] relative group">
              <div className="absolute inset-1 rounded-full border border-white/10 animate-spin-slow"></div>
              <OutputIcon size={32} className="text-primary mb-1 group-hover:scale-110 transition-transform" />
              <div className="text-[9px] text-slate-400 font-mono flex flex-col items-center">
                  <span className="font-bold text-white">{resolution}</span>
                  <span>{aspectRatio}</span>
              </div>
           </div>
           <span className="text-xs font-bold text-primary uppercase tracking-widest">Final Render</span>
        </div>

      </div>

      <style>{`
        @keyframes moveRight {
          0% { left: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ModelFlowDiagram;
