
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
  <div className="flex flex-col gap-2 flex-1 group/input relative">
    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2 select-none tracking-widest">
      {Icon && <Icon size={14} className={color} />} {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl py-3 pl-4 pr-10 text-[11px] text-white appearance-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer font-black shadow-inner uppercase tracking-tight`}
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-300">{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
         <ChevronDown size={14} />
      </div>
    </div>
  </div>
);

// Tạm thời định nghĩa ChevronDown vì không import từ lucide-react ở đây
const ChevronDown = ({ size, className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);

const ModelSelector: React.FC<ModelSelectorProps> = ({
  scriptModel, setScriptModel,
  visualModel, setVisualModel,
  voiceModel, setVoiceModel,
  resolution, setResolution,
  aspectRatio, setAspectRatio,
  t
}) => {
  return (
    <div className="w-full bg-transparent">
        <div className="max-w-full mx-auto p-4 md:px-6">
            <div className="flex flex-col xl:flex-row gap-8 lg:gap-12">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SelectInput 
                        label={"Trí tuệ Kịch bản"}
                        value={scriptModel}
                        onChange={setScriptModel}
                        icon={BrainCircuit}
                        color="text-purple-400"
                        glowColor="purple"
                        options={[
                            { value: 'Gemini 3 Pro', label: 'Gemini 3 Pro (Tối ưu)' },
                            { value: 'Gemini 3 Flash', label: 'Gemini 3 Flash (Nhanh)' },
                            { value: 'Gemini 2.5 Flash', label: 'Gemini 2.5 Flash' },
                            { value: 'GPT-4o', label: 'OpenAI GPT-4o' },
                        ]}
                    />
                    <SelectInput 
                        label={"Engine Video AI"}
                        value={visualModel}
                        onChange={setVisualModel}
                        icon={Palette}
                        color="text-blue-400"
                        glowColor="blue"
                        options={[
                            { value: 'VEO 3.1', label: 'Google Veo 3.1' },
                            { value: 'KLING 1.5', label: 'Kling 1.5 Pro' },
                            { value: 'HAILUO AI', label: 'Hailuo AI' },
                            { value: 'IMAGEN 4', label: 'Imagen 4 (High Res)' },
                        ]}
                    />
                    <SelectInput 
                        label={"Tổng hợp Giọng nói"}
                        value={voiceModel}
                        onChange={setVoiceModel}
                        icon={Mic}
                        color="text-green-400"
                        glowColor="green"
                        options={[
                            { value: 'Google Chirp', label: 'Google Chirp (Thật)' },
                            { value: 'ElevenLabs Clone', label: 'ElevenLabs Clone' },
                            { value: 'OpenAI TTS', label: 'OpenAI HD TTS' },
                            { value: 'Vbee TTS', label: 'Vbee Việt Nam' },
                        ]}
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-6 xl:border-l border-slate-800 xl:pl-8 shrink-0">
                    <SelectInput 
                        label="Độ phân giải"
                        value={resolution}
                        onChange={setResolution}
                        icon={MonitorPlay}
                        color="text-yellow-500"
                        glowColor="yellow"
                        options={[
                            { value: '1080p', label: '1080p HD' },
                            { value: '4K', label: '4K Cinematic' },
                            { value: '720p', label: '720p Mobile' },
                        ]}
                    />

                    <SelectInput 
                        label="Tỷ lệ khung hình"
                        value={aspectRatio}
                        onChange={setAspectRatio}
                        icon={Video}
                        color="text-pink-500"
                        glowColor="pink"
                        options={[
                            { value: '9:16', label: '9:16 (Shorts/TikTok)' },
                            { value: '16:9', label: '16:9 (Nằm ngang)' },
                            { value: '1:1', label: '1:1 (Instagram)' },
                        ]}
                    />
                </div>
            </div>
        </div>
    </div>
  );
};

export default ModelSelector;
