
import React from 'react';
import { BrainCircuit, Palette, Mic, MonitorPlay, Video, Cpu, Sparkles } from 'lucide-react';
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

  const SelectInput = ({ label, value, options, onChange, icon: Icon, color, glowColor }: any) => (
    <div className="flex flex-col gap-1.5 flex-1 group/input relative">
      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 select-none tracking-wider">
        {Icon && <Icon size={12} className={color} />} {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg py-2.5 pl-3 pr-2 text-xs text-white appearance-none focus:outline-none focus:border-${glowColor}-500 focus:ring-1 focus:ring-${glowColor}-500/50 transition-all cursor-pointer font-medium shadow-inner`}
        >
          {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {/* Decorative thin line at bottom to indicate active state */}
        <div className={`absolute bottom-0 left-2 right-2 h-[1px] bg-${glowColor}-500/50 scale-x-0 group-hover/input:scale-x-100 transition-transform duration-500`}></div>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[#020617] border-t border-slate-800 shrink-0 z-50">
        <div className="max-w-[1920px] mx-auto p-4 md:px-6">
            
            {/* Header Label - Static & Clean */}
            <div className="flex items-center gap-2 mb-4 opacity-80">
                <Cpu size={16} className="text-primary" />
                <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em]">AI Model Configuration</h3>
                <div className="h-px bg-slate-800 flex-1 ml-4"></div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6 lg:gap-12">
                
                {/* LEFT: AI CORE MODELS */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SelectInput 
                        label={texts.script_title || "Script Intelligence"}
                        value={scriptModel}
                        onChange={setScriptModel}
                        icon={BrainCircuit}
                        color="text-purple-400"
                        glowColor="purple"
                        options={[
                            { value: 'Gemini 2.5 Flash', label: 'Gemini 2.5 Flash (Fast)' },
                            { value: 'Gemini 3 Pro', label: 'Gemini 3 Pro (Reasoning)' },
                            { value: 'GPT-4o', label: 'GPT-4o (Creative)' },
                            { value: 'Grok Beta', label: 'Grok Beta (Uncensored)' },
                        ]}
                    />
                    <SelectInput 
                        label={texts.visual_title || "Visual Engine"}
                        value={visualModel}
                        onChange={setVisualModel}
                        icon={Palette}
                        color="text-blue-400"
                        glowColor="blue"
                        options={[
                            { value: 'VEO', label: 'Google Veo (Video Generation)' },
                            { value: 'SORA', label: 'Sora (OpenAI Video)' },
                            { value: 'IMAGEN', label: 'Imagen 3 (High Fidelity)' },
                            { value: 'KLING', label: 'Kling AI (Motion Control)' },
                            { value: 'MIDJOURNEY', label: 'Midjourney (Artistic)' },
                        ]}
                    />
                    <SelectInput 
                        label={texts.voice_title || "Voice Synthesis"}
                        value={voiceModel}
                        onChange={setVoiceModel}
                        icon={Mic}
                        color="text-green-400"
                        glowColor="green"
                        options={[
                            { value: 'Google Chirp', label: 'Google Chirp (Native Multi-ling)' },
                            { value: 'Vbee TTS', label: 'Vbee VN (Local Dialects)' },
                            { value: 'ElevenLabs', label: 'ElevenLabs (Emotive)' },
                            { value: 'OpenAI TTS', label: 'OpenAI TTS (Clean)' },
                        ]}
                    />
                </div>

                {/* RIGHT: OUTPUT SPECS (Separated Box) */}
                <div className="flex flex-col md:flex-row gap-4 xl:border-l border-slate-800 xl:pl-8 shrink-0 relative">
                    {/* Label Badge */}
                    <div className="absolute -top-3 left-8 xl:left-12 px-2 bg-[#020617] text-[9px] font-bold text-slate-500 uppercase tracking-wider hidden xl:block">
                        Output Specs
                    </div>

                    <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-3 flex gap-4 w-full md:w-auto items-center">
                        <div className="p-2 bg-slate-900 rounded-lg text-yellow-500 shadow-lg border border-slate-800">
                            <MonitorPlay size={18} />
                        </div>
                        <SelectInput 
                            label="Resolution"
                            value={resolution}
                            onChange={setResolution}
                            icon={Sparkles}
                            color="text-yellow-500"
                            glowColor="yellow"
                            options={[
                                { value: '720p', label: '720p (HD Speed)' },
                                { value: '1080p', label: '1080p (FHD Standard)' },
                                { value: '4K', label: '4K (UHD Cinema)' },
                            ]}
                        />
                    </div>

                    <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-3 flex gap-4 w-full md:w-auto items-center">
                        <div className="p-2 bg-slate-900 rounded-lg text-pink-500 shadow-lg border border-slate-800">
                            <Video size={18} />
                        </div>
                        <SelectInput 
                            label="Aspect Ratio"
                            value={aspectRatio}
                            onChange={setAspectRatio}
                            icon={null} // Icon is in the box
                            color="text-pink-500"
                            glowColor="pink"
                            options={[
                                { value: '9:16', label: '9:16 (TikTok/Reels)' },
                                { value: '16:9', label: '16:9 (YouTube)' },
                                { value: '1:1', label: '1:1 (Square/Feed)' },
                            ]}
                        />
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default ModelSelector;
