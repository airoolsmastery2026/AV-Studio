
import React from 'react';
import { BrainCircuit, Check, Palette, Mic, Cpu, Sparkles, Zap, MonitorPlay, Ratio, Scan, MessageSquare, Speaker } from 'lucide-react';
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
  t?: any;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  scriptModel, setScriptModel,
  visualModel, setVisualModel,
  voiceModel, setVoiceModel,
  resolution, setResolution,
  aspectRatio, setAspectRatio,
  t
}) => {
  const texts = t || {};

  // Common Card Style with Delayed Hover Effect
  const renderModelCard = (
    id: string, 
    name: string, 
    desc: string, 
    badge: string, 
    Icon: any, 
    isSelected: boolean, 
    onClick: () => void,
    accentColor: string
  ) => (
    <button 
        key={id}
        onClick={onClick}
        className={`group text-left p-2.5 rounded-lg border transition-all duration-300 relative w-full overflow-hidden ${
            isSelected 
            ? `bg-${accentColor}-900/20 border-${accentColor}-500 shadow-[0_0_10px_rgba(var(--${accentColor}),0.2)]` 
            : 'bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
        }`}
    >
        <div className="flex justify-between items-center h-8">
            <span className={`font-bold text-xs flex items-center gap-2 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                <Icon size={14} className={isSelected ? `text-${accentColor}-400` : "text-slate-500"} />
                {name}
            </span>
            {isSelected && <div className={`bg-${accentColor}-500 rounded-full p-0.5`}><Check size={10} className="text-white" /></div>}
        </div>
        
        {/* Hidden Details with 1.5s Delay */}
        <div className="max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-500 ease-out delay-[1500ms] overflow-hidden">
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed border-t border-slate-800/50 pt-1">{desc}</p>
            <div className="mt-1">
                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                    isSelected
                    ? `bg-${accentColor}-500/20 text-${accentColor}-300 border-${accentColor}-500/30` 
                    : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}>{badge}</span>
            </div>
        </div>
    </button>
  );

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* GLOBAL SPECS (Compact) */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2 mb-3">
              <MonitorPlay size={14} className="text-primary" /> {texts.specs_title || "Output Specifications"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
              <div>
                  <div className="flex gap-1">
                      {['720p', '1080p', '4K'].map((res) => (
                          <button
                              key={res}
                              onClick={() => setResolution(res as VideoResolution)}
                              className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold transition-all border ${
                                  resolution === res 
                                  ? 'bg-primary/20 border-primary text-white' 
                                  : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                              }`}
                          >
                              {res}
                          </button>
                      ))}
                  </div>
              </div>
              <div>
                  <div className="flex gap-1">
                      {['9:16', '16:9', '1:1'].map((ratio) => (
                          <button
                              key={ratio}
                              onClick={() => setAspectRatio(ratio as AspectRatio)}
                              className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold transition-all border ${
                                  aspectRatio === ratio 
                                  ? 'bg-primary/20 border-primary text-white' 
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SCRIPT INTEL */}
          <div className="space-y-2">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <BrainCircuit size={14} className="text-purple-400" /> {texts.script_title || "Script Intelligence"}
                </h3>
             </div>
             <div className="grid gap-2">
                {[
                  { id: 'Gemini 2.5 Flash', name: 'Gemini 2.5 Flash', desc: 'Fastest, low latency. Best for viral hooks.', badge: 'Speed', icon: Zap },
                  { id: 'Gemini 3 Pro', name: 'Gemini 3 Pro', desc: 'Deep reasoning. Best for tutorials & analysis.', badge: 'Logic', icon: BrainCircuit },
                  { id: 'GPT-4o', name: 'GPT-4o (OpenAI)', desc: 'Creative storytelling & nuance.', badge: 'Creative', icon: Sparkles },
                  { id: 'Grok Beta', name: 'Grok Beta (xAI)', desc: 'Real-time knowledge, roast-heavy & unfiltered.', badge: 'Rebel', icon: MessageSquare },
                ].map((m) => renderModelCard(m.id, m.name, m.desc, m.badge, m.icon, scriptModel === m.id, () => setScriptModel(m.id as ScriptModel), 'purple'))}
             </div>
          </div>

          {/* VISUAL ENGINE */}
          <div className="space-y-2">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <Palette size={14} className="text-blue-400" /> {texts.visual_title || "Visual Engine"}
                </h3>
             </div>
             <div className="grid gap-2">
                {[
                  { id: 'VEO', name: 'Google Veo', desc: 'High-fidelity video generation. (Preview)', badge: 'Video' },
                  { id: 'IMAGEN', name: 'Imagen 3', desc: 'Photorealistic image generation.', badge: 'Image' },
                  { id: 'SORA', name: 'Sora (OpenAI)', desc: 'Cinematic video physics.', badge: 'Video' },
                  { id: 'KLING', name: 'Kling AI', desc: 'Realistic motion handling.', badge: 'Video' },
                  { id: 'MIDJOURNEY', name: 'Midjourney', desc: 'Artistic & stylized visuals.', badge: 'Art' },
                ].map((m) => renderModelCard(m.id, m.name, m.desc, m.badge, Palette, visualModel === m.id, () => setVisualModel(m.id as VisualModel), 'blue'))}
             </div>
          </div>

          {/* VOICE SYNTHESIS */}
          <div className="space-y-2">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <Mic size={14} className="text-green-400" /> {texts.voice_title || "Voice Synthesis"}
                </h3>
             </div>
             <div className="grid gap-2">
                {[
                  { id: 'Google Chirp', name: 'Google Chirp (USM)', desc: 'Universal Speech Model. Multi-lingual.', badge: 'Native' },
                  { id: 'Vbee TTS', name: 'Vbee AIVoice (VN)', desc: 'Giọng đọc cảm xúc chuẩn Việt Nam (Bắc/Nam/Huế).', badge: 'Local', icon: Speaker },
                  { id: 'ElevenLabs', name: 'ElevenLabs', desc: 'Most expressive & emotional voices.', badge: 'Premium' },
                  { id: 'OpenAI TTS', name: 'OpenAI TTS', desc: 'Natural & consistent tone.', badge: 'Standard' },
                ].map((m) => renderModelCard(m.id, m.name, m.desc, m.badge, m.icon || Mic, voiceModel === m.id, () => setVoiceModel(m.id as VoiceModel), 'green'))}
             </div>
          </div>

      </div>
    </div>
  );
};

export default ModelSelector;
