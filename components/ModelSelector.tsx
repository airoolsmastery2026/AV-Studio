
import React from 'react';
import { BrainCircuit, Palette, Mic, MonitorPlay, Video, Cpu, ShieldCheck, ChevronDown } from 'lucide-react';
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

const CompactSelect = ({ value, options, onChange, icon: Icon, color }: any) => (
  <div className="relative group shrink-0">
    <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2 hover:border-slate-600 transition-all cursor-pointer min-w-[150px]">
      <Icon size={14} className={color} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-[11px] font-black text-white uppercase outline-none appearance-none pr-4 w-full cursor-pointer"
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-300">{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={12} className="text-slate-600 absolute right-2 pointer-events-none group-hover:text-slate-400 transition-colors" />
    </div>
  </div>
);

const CompactPill = ({ value, options, onChange, icon: Icon, color }: any) => (
  <div className="flex bg-slate-950/50 border border-slate-800 rounded-xl p-1 gap-1 shrink-0">
    {options.map((opt: any) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-1.5 ${
          value === opt.value 
            ? 'bg-primary text-white shadow-neon' 
            : 'text-slate-600 hover:text-slate-400'
        }`}
      >
        {value === opt.value && Icon && <Icon size={10} />}
        {opt.label}
      </button>
    ))}
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
  return (
    <div className="w-full bg-slate-900/20 backdrop-blur-md border border-slate-800/50 rounded-[24px] p-3 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
      {/* Engine Stack */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-800 shrink-0">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Cpu size={16} className="text-primary" />
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-tighter hidden sm:block">AI STACK</span>
        </div>
        
        <CompactSelect 
          value={scriptModel}
          onChange={setScriptModel}
          icon={BrainCircuit}
          color="text-purple-400"
          options={[
              { value: 'Gemini 3 Pro', label: 'Gemini 3 Pro' },
              { value: 'Grok 3', label: 'xAI Grok 3' },
              { value: 'GPT-4o', label: 'OpenAI 4o' },
              { value: 'Claude 3.5 Sonnet', label: 'Claude 3.5' },
              { value: 'Gemini 2.5 Flash', label: 'Gemini Flash' },
          ]}
        />
        <CompactSelect 
          value={visualModel}
          onChange={setVisualModel}
          icon={Palette}
          color="text-blue-400"
          options={[
              { value: 'KLING 1.5', label: 'Kling 1.5 Pro' },
              { value: 'HAILUO AI', label: 'Hailuo (MiniMax)' },
              { value: 'VEO', label: 'Google Veo' },
              { value: 'SORA', label: 'OpenAI Sora' },
              { value: 'PIKA 2.1', label: 'Pika 2.1' },
              { value: 'IMAGEN', label: 'Imagen 3' },
          ]}
        />
        <CompactSelect 
          value={voiceModel}
          onChange={setVoiceModel}
          icon={Mic}
          color="text-green-400"
          options={[
              { value: 'ElevenLabs', label: 'ElevenLabs' },
              { value: 'Google Chirp', label: 'Google Chirp' },
              { value: 'Vbee TTS', label: 'Vbee AI' },
              { value: 'OpenAI TTS', label: 'OpenAI Voice' },
          ]}
        />
      </div>

      {/* Output Stack */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-3 pr-4 border-r border-slate-800">
           <CompactPill 
              value={resolution}
              onChange={setResolution}
              icon={MonitorPlay}
              options={[
                  { value: '720p', label: '720P' },
                  { value: '1080p', label: '1080P' },
                  { value: '4K', label: '4K' },
              ]}
           />
           <CompactPill 
              value={aspectRatio}
              onChange={setAspectRatio}
              icon={Video}
              options={[
                  { value: '9:16', label: '9:16' },
                  { value: '16:9', label: '16:9' },
                  { value: '1:1', label: '1:1' },
              ]}
           />
        </div>

        {/* Security Gate */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/5 border border-green-500/20 rounded-xl shrink-0">
          <ShieldCheck size={14} className="text-green-500" />
          <span className="text-[9px] text-green-500 font-black uppercase tracking-widest hidden xl:block">Originality Gate</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default ModelSelector;
