
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

const SelectInput = ({ label, value, options, onChange, icon: Icon, color, glowColor }: any) => (
  <div className="flex flex-col gap-1.5 flex-1 group/input relative">
    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5 select-none tracking-wider">
      {Icon && <Icon size={12} className={color} />} {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg py-2.5 pl-3 pr-2 text-xs text-white appearance-none focus:outline-none focus:border-${glowColor}-500 focus:ring-1 focus:ring-${glowColor}-500/50 transition-all cursor-pointer font-bold shadow-inner uppercase`}
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-300">{opt.label}</option>
        ))}
      </select>
    </div>
  </div>
);

const ModelSelector: React.FC<ModelSelectorProps> = ({
  scriptModel, setScriptModel,
  visualModel, setVisualModel,
  voiceModel, setVoiceModel,
  resolution, setResolution,
  aspectRatio, setAspectRatio,
  t
}) => {
  const texts = t || {};

  return (
    <div className="w-full bg-[#020617] border-t border-slate-800 shrink-0 z-50">
        <div className="max-w-[1920px] mx-auto p-4 md:px-6">
            <div className="flex items-center gap-2 mb-4 opacity-80">
                <Cpu size={16} className="text-primary" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">NEURAL CORE CONFIGURATION (2025 STACK)</h3>
                <div className="h-px bg-slate-800 flex-1 ml-4"></div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6 lg:gap-12">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SelectInput 
                        label={texts.engine_script || "Script Intelligence"}
                        value={scriptModel}
                        onChange={setScriptModel}
                        icon={BrainCircuit}
                        color="text-purple-400"
                        glowColor="purple"
                        options={[
                            { value: 'Gemini 3 Pro', label: 'Gemini 3 Pro (Ultimate)' },
                            { value: 'Gemini 3 Flash', label: 'Gemini 3 Flash (Fastest)' },
                            { value: 'GPT-4o', label: 'OpenAI GPT-4o' },
                            { value: 'Grok 3', label: 'xAI Grok 3' },
                        ]}
                    />
                    <SelectInput 
                        label={texts.engine_visual || "Video Engine"}
                        value={visualModel}
                        onChange={setVisualModel}
                        icon={Palette}
                        color="text-blue-400"
                        glowColor="blue"
                        options={[
                            { value: 'VEO 3.1', label: 'Google Veo 3.1 (Latest)' },
                            { value: 'KLING 1.5', label: 'Kling 1.5 Pro' },
                            { value: 'HAILUO AI', label: 'Hailuo AI (MiniMax)' },
                            { value: 'SORA', label: 'OpenAI Sora' },
                            { value: 'IMAGEN 4', label: 'Imagen 4 (High Res)' },
                        ]}
                    />
                    <SelectInput 
                        label={texts.voice_clone_select || "Vocal Synthesis"}
                        value={voiceModel}
                        onChange={setVoiceModel}
                        icon={Mic}
                        color="text-green-400"
                        glowColor="green"
                        options={[
                            { value: 'Google Chirp', label: 'Google Chirp (Realistic)' },
                            { value: 'ElevenLabs Clone', label: 'ElevenLabs (Voice Clone)' },
                            { value: 'OpenAI TTS', label: 'OpenAI HD TTS' },
                            { value: 'Vbee TTS', label: 'Vbee Vietnam (Native)' },
                        ]}
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4 xl:border-l border-slate-800 xl:pl-8 shrink-0 relative">
                    <div className="absolute -top-3 left-8 xl:left-12 px-2 bg-[#020617] text-[9px] font-black text-slate-500 uppercase tracking-wider hidden xl:block">
                        Dispatch Specs
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
                                { value: '1080p', label: '1080p Standard' },
                                { value: '4K', label: '4K Cinematic' },
                                { value: '720p', label: '720p Saving' },
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
                            icon={null}
                            color="text-pink-500"
                            glowColor="pink"
                            options={[
                                { value: '9:16', label: '9:16 (Shorts)' },
                                { value: '16:9', label: '16:9 (Landscape)' },
                                { value: '1:1', label: '1:1 (Social)' },
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
