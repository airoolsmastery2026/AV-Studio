
import React, { useState } from 'react';
import { BrainCircuit, Palette, Mic, MonitorPlay, Zap, Sparkles, MessageSquare, Video, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
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
  // Default to expanded to ensure user sees options first, but allow manual collapse
  const [isExpanded, setIsExpanded] = useState(true);

  const SelectInput = ({ label, value, options, onChange, icon: Icon, color }: any) => (
    <div className="flex flex-col gap-1 min-w-[140px] flex-1">
      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
        {Icon && <Icon size={12} className={color} />} {label}
      </label>
      <div className="relative group">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-lg py-2 pl-2 pr-8 text-xs text-white appearance-none focus:outline-none focus:border-primary transition-colors cursor-pointer shadow-sm"
          onClick={(e) => e.stopPropagation()} // Prevent bubble up closing
        >
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-white transition-colors">
           <ChevronDown size={14} />
        </div>
      </div>
    </div>
  );

  return (
    <div 
        className="w-full bg-slate-950 border-t border-slate-800 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-40 flex flex-col shrink-0 transition-all duration-300 ease-in-out"
        style={{ height: isExpanded ? 'auto' : '40px' }}
    >
        {/* Toggle Header */}
        <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-10 w-full flex items-center justify-between px-4 md:px-6 bg-slate-900/50 hover:bg-slate-900 transition-colors border-b border-slate-800/50 cursor-pointer group"
            title={isExpanded ? "Collapse Configuration" : "Expand Configuration"}
        >
            <div className="flex items-center gap-2">
                <Settings2 size={14} className="text-primary" />
                <span className="text-xs font-bold text-slate-300 group-hover:text-white uppercase tracking-wider">
                    {texts.specs_title || "AI Model Configuration"} 
                    {!isExpanded && <span className="text-slate-500 ml-2 font-normal lowercase">- {scriptModel} • {visualModel} • {resolution}</span>}
                </span>
            </div>
            <div className="text-slate-500 group-hover:text-white">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </div>
        </button>

        {/* Content Area */}
        {isExpanded && (
            <div className="p-4 md:px-6 pb-6 animate-fade-in">
                <div className="flex flex-col xl:flex-row gap-6 xl:items-end justify-between max-w-[1600px] mx-auto">
                    
                    {/* AI MODELS */}
                    <div className="flex flex-wrap gap-4 flex-1">
                        <SelectInput 
                            label={texts.script_title || "Script Intelligence"}
                            value={scriptModel}
                            onChange={setScriptModel}
                            icon={BrainCircuit}
                            color="text-purple-400"
                            options={[
                                { value: 'Gemini 2.5 Flash', label: 'Gemini 2.5 Flash (Fast)' },
                                { value: 'Gemini 3 Pro', label: 'Gemini 3 Pro (Deep)' },
                                { value: 'GPT-4o', label: 'GPT-4o (Creative)' },
                                { value: 'Grok Beta', label: 'Grok Beta (Edgy)' },
                            ]}
                        />
                        <SelectInput 
                            label={texts.visual_title || "Visual Engine"}
                            value={visualModel}
                            onChange={setVisualModel}
                            icon={Palette}
                            color="text-blue-400"
                            options={[
                                { value: 'VEO', label: 'Google Veo (Video)' },
                                { value: 'SORA', label: 'Sora (OpenAI)' },
                                { value: 'IMAGEN', label: 'Imagen 3 (HQ Photos)' },
                                { value: 'KLING', label: 'Kling AI (Motion)' },
                                { value: 'MIDJOURNEY', label: 'Midjourney (Art)' },
                            ]}
                        />
                        <SelectInput 
                            label={texts.voice_title || "Voice Synthesis"}
                            value={voiceModel}
                            onChange={setVoiceModel}
                            icon={Mic}
                            color="text-green-400"
                            options={[
                                { value: 'Google Chirp', label: 'Google Chirp (Multi-ling)' },
                                { value: 'Vbee TTS', label: 'Vbee VN (Local)' },
                                { value: 'ElevenLabs', label: 'ElevenLabs (Emotive)' },
                                { value: 'OpenAI TTS', label: 'OpenAI TTS (Clean)' },
                            ]}
                        />
                    </div>

                    {/* OUTPUT SPECS */}
                    <div className="flex gap-4 border-l border-slate-800 pl-6 xl:ml-4 shrink-0">
                        <SelectInput 
                            label="Quality"
                            value={resolution}
                            onChange={setResolution}
                            icon={MonitorPlay}
                            color="text-slate-400"
                            options={[
                                { value: '720p', label: '720p (HD)' },
                                { value: '1080p', label: '1080p (FHD)' },
                                { value: '4K', label: '4K (UHD)' },
                            ]}
                        />
                        <SelectInput 
                            label="Ratio"
                            value={aspectRatio}
                            onChange={setAspectRatio}
                            icon={Video}
                            color="text-slate-400"
                            options={[
                                { value: '9:16', label: '9:16 (Shorts)' },
                                { value: '16:9', label: '16:9 (Landscape)' },
                                { value: '1:1', label: '1:1 (Square)' },
                            ]}
                        />
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ModelSelector;
