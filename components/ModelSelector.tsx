
import React from 'react';
import { BrainCircuit, Check, Palette, Mic, Cpu, Sparkles, Zap, MonitorPlay, Ratio, Scan } from 'lucide-react';
import { ScriptModel, VisualModel, VoiceModel, VideoResolution, AspectRatio } from '../types';

interface ModelSelectorProps {
  scriptModel: ScriptModel;
  setScriptModel: (model: ScriptModel) => void;
  visualModel: VisualModel;
  setVisualModel: (model: VisualModel) => void;
  voiceModel: VoiceModel;
  setVoiceModel: (model: VoiceModel) => void;
  resolution: VideoResolution;
  setResolution: (res: VideoResolution) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  scriptModel, setScriptModel,
  visualModel, setVisualModel,
  voiceModel, setVoiceModel,
  resolution, setResolution,
  aspectRatio, setAspectRatio
}) => {
  return (
    <div className="animate-fade-in space-y-8">
      
      {/* GLOBAL SPECS */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2 mb-4">
              <MonitorPlay size={16} className="text-primary" /> Output Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block flex items-center gap-1">
                      <Scan size={12} /> Resolution
                  </label>
                  <div className="flex gap-2">
                      {['720p', '1080p', '4K'].map((res) => (
                          <button
                              key={res}
                              onClick={() => setResolution(res as VideoResolution)}
                              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                                  resolution === res 
                                  ? 'bg-primary/20 border-primary text-white shadow-[0_0_10px_rgba(14,165,164,0.2)]' 
                                  : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                              }`}
                          >
                              {res}
                          </button>
                      ))}
                  </div>
              </div>
              <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block flex items-center gap-1">
                      <Ratio size={12} /> Aspect Ratio
                  </label>
                  <div className="flex gap-2">
                      {['9:16', '16:9', '1:1'].map((ratio) => (
                          <button
                              key={ratio}
                              onClick={() => setAspectRatio(ratio as AspectRatio)}
                              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                                  aspectRatio === ratio 
                                  ? 'bg-primary/20 border-primary text-white shadow-[0_0_10px_rgba(14,165,164,0.2)]' 
                                  : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                              }`}
                          >
                              {ratio}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SCRIPT INTEL */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                    <BrainCircuit size={16} className="text-purple-400" /> Script Intelligence
                </h3>
                <span className="text-[10px] bg-purple-900/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">Reasoning Core</span>
             </div>
             <div className="grid gap-3">
                {[
                  { id: 'Gemini 2.5 Flash', name: 'Gemini 2.5 Flash', desc: 'Fastest, low latency. Best for viral hooks.', badge: 'Speed', icon: Zap },
                  { id: 'Gemini 1.5 Pro', name: 'Gemini 1.5 Pro', desc: 'Deep reasoning. Best for tutorials & analysis.', badge: 'Logic', icon: BrainCircuit },
                  { id: 'GPT-4o', name: 'GPT-4o (OpenAI)', desc: 'Creative storytelling & nuance.', badge: 'Creative', icon: Sparkles },
                ].map((m) => (
                   <button 
                      key={m.id}
                      onClick={() => setScriptModel(m.id as ScriptModel)}
                      className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group w-full ${
                        scriptModel === m.id 
                        ? 'bg-purple-900/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
                      }`}
                   >
                      <div className="flex justify-between items-start mb-2">
                         <span className={`font-bold flex items-center gap-2 ${scriptModel === m.id ? 'text-white' : 'text-slate-300'}`}>
                            <m.icon size={16} className={scriptModel === m.id ? "text-purple-400" : "text-slate-500"} />
                            {m.name}
                         </span>
                         {scriptModel === m.id && <div className="bg-purple-500 rounded-full p-0.5"><Check size={12} className="text-white" /></div>}
                      </div>
                      <p className="text-xs text-slate-500 mb-3 leading-relaxed">{m.desc}</p>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          scriptModel === m.id 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                          : 'bg-slate-950 text-slate-500 border-slate-800'
                      }`}>{m.badge}</span>
                   </button>
                ))}
             </div>
          </div>

          {/* VISUAL ENGINE */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                    <Palette size={16} className="text-blue-400" /> Visual Engine
                </h3>
                <span className="text-[10px] bg-blue-900/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">Image & Video</span>
             </div>
             <div className="grid gap-3">
                {[
                  { id: 'VEO', name: 'Google Veo', desc: 'High-fidelity video generation. (Preview)', badge: 'Video' },
                  { id: 'IMAGEN', name: 'Imagen 3', desc: 'Photorealistic image generation.', badge: 'Image' },
                  { id: 'SORA', name: 'Sora (OpenAI)', desc: 'Cinematic video physics.', badge: 'Video' },
                  { id: 'KLING', name: 'Kling AI', desc: 'Realistic motion handling.', badge: 'Video' },
                  { id: 'MIDJOURNEY', name: 'Midjourney', desc: 'Artistic & stylized visuals.', badge: 'Art' },
                ].map((m) => (
                   <button 
                      key={m.id}
                      onClick={() => setVisualModel(m.id as VisualModel)}
                      className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group w-full ${
                        visualModel === m.id 
                        ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
                      }`}
                   >
                      <div className="flex justify-between items-start mb-2">
                         <span className={`font-bold ${visualModel === m.id ? 'text-white' : 'text-slate-300'}`}>{m.name}</span>
                         {visualModel === m.id && <div className="bg-blue-500 rounded-full p-0.5"><Check size={12} className="text-white" /></div>}
                      </div>
                      <p className="text-xs text-slate-500 mb-3 leading-relaxed">{m.desc}</p>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          visualModel === m.id 
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                          : 'bg-slate-950 text-slate-500 border-slate-800'
                      }`}>{m.badge}</span>
                   </button>
                ))}
             </div>
          </div>

          {/* VOICE SYNTHESIS */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                    <Mic size={16} className="text-green-400" /> Voice Synthesis
                </h3>
                <span className="text-[10px] bg-green-900/20 text-green-300 px-2 py-0.5 rounded border border-green-500/30">TTS Audio</span>
             </div>
             <div className="grid gap-3">
                {[
                  { id: 'Google Chirp', name: 'Google Chirp (USM)', desc: 'Universal Speech Model. Multi-lingual.', badge: 'Native' },
                  { id: 'ElevenLabs', name: 'ElevenLabs', desc: 'Most expressive & emotional voices.', badge: 'Premium' },
                  { id: 'OpenAI TTS', name: 'OpenAI TTS', desc: 'Natural & consistent tone.', badge: 'Standard' },
                ].map((m) => (
                   <button 
                      key={m.id}
                      onClick={() => setVoiceModel(m.id as VoiceModel)}
                      className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group w-full ${
                        voiceModel === m.id 
                        ? 'bg-green-900/20 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
                      }`}
                   >
                      <div className="flex justify-between items-start mb-2">
                         <span className={`font-bold ${voiceModel === m.id ? 'text-white' : 'text-slate-300'}`}>{m.name}</span>
                         {voiceModel === m.id && <div className="bg-green-500 rounded-full p-0.5"><Check size={12} className="text-white" /></div>}
                      </div>
                      <p className="text-xs text-slate-500 mb-3 leading-relaxed">{m.desc}</p>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          voiceModel === m.id 
                          ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                          : 'bg-slate-950 text-slate-500 border-slate-800'
                      }`}>{m.badge}</span>
                   </button>
                ))}
             </div>
          </div>

      </div>
    </div>
  );
};

export default ModelSelector;
