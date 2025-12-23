import React, { useState, useRef } from 'react';
import { Columns, CheckCircle2, TrendingUp, AlertCircle, RefreshCw, Trophy, MousePointer2, Upload, FileImage, Sparkles } from 'lucide-react';
import { ABTestMetadata } from '../types';
import NeonButton from './NeonButton';
import { predictThumbnailPerformance } from '../services/geminiService';

interface ABThumbnailTesterProps {
  videoTitle: string;
  initialData?: ABTestMetadata;
  onSelectWinner: (variant: 'A' | 'B') => void;
  onUpdateUrls: (urls: { a: string; b: string }) => void;
}

const ABThumbnailTester: React.FC<ABThumbnailTesterProps> = ({ videoTitle, initialData, onSelectWinner, onUpdateUrls }) => {
  const [variantA, setVariantA] = useState(initialData?.variant_a_url || '');
  const [variantB, setVariantB] = useState(initialData?.variant_b_url || '');
  const [isSimulating, setIsSimulating] = useState(false);
  const [stats, setStats] = useState({
    a: initialData?.variant_a_ctr || 0,
    b: initialData?.variant_b_ctr || 0
  });

  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, variant: 'A' | 'B') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (variant === 'A') {
          setVariantA(base64);
          onUpdateUrls({ a: base64, b: variantB });
        } else {
          setVariantB(base64);
          onUpdateUrls({ a: variantA, b: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulate = async () => {
    if (!variantA || !variantB) return;
    setIsSimulating(true);
    try {
      const results = await predictThumbnailPerformance(variantA, variantB, videoTitle);
      setStats({
        a: results.a,
        b: results.b
      });
    } catch (e) {
      console.error("Simulation failed", e);
    } finally {
      setIsSimulating(false);
    }
  };

  const winner = stats.a > stats.b ? 'A' : 'B';

  const ThumbnailSlot = ({ variant, url, inputRef, label, color, ctr, isWinner }: any) => (
    <div className={`space-y-4 transition-all duration-500 ${isWinner && !isSimulating && ctr > 0 ? 'scale-105' : 'opacity-80'}`}>
      <div className="flex justify-between items-center">
        <span className={`text-[10px] font-black ${color} uppercase tracking-[0.2em]`}>{label}</span>
        {isWinner && ctr > 0 && <Trophy className="text-yellow-500 animate-bounce" size={18} />}
      </div>
      
      <div 
        onClick={() => inputRef.current?.click()}
        className="aspect-video bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden relative group cursor-pointer hover:border-primary/50 transition-all shadow-inner"
      >
        {url ? (
          <img src={url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={label} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-2">
            <Upload size={32} />
            <span className="text-[9px] font-black uppercase tracking-widest">Click to upload</span>
          </div>
        )}
        
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => handleFileChange(e, variant)} 
        />

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-[9px] font-black text-white uppercase">Thay đổi ảnh</div>
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center shadow-xl">
        <div className="text-[9px] text-slate-500 font-black uppercase">Dự đoán CTR</div>
        <div className={`text-2xl font-black ${color} font-mono`}>{ctr ? `${ctr.toFixed(1)}%` : '--%'}</div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 space-y-8 shadow-2xl animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none"><Sparkles size={200} /></div>
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-800 pb-6 relative z-10">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Columns className="text-primary" size={28} /> Neural A/B Tester
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Phân tích thị giác bằng Gemini 3 Vision Engine</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-950 border border-slate-800 rounded-2xl">
           <div className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-primary animate-pulse' : 'bg-green-500'}`}></div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             {isSimulating ? 'Neural Processing...' : 'Ready for Simulation'}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
        <ThumbnailSlot 
            variant="A" 
            url={variantA} 
            inputRef={fileInputARef} 
            label="Variant A (Control)" 
            color="text-primary" 
            ctr={stats.a} 
            isWinner={winner === 'A'} 
        />
        <ThumbnailSlot 
            variant="B" 
            url={variantB} 
            inputRef={fileInputBRef} 
            label="Variant B (Challenger)" 
            color="text-accent" 
            ctr={stats.b} 
            isWinner={winner === 'B'} 
        />
      </div>

      <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row gap-6 justify-center items-center relative z-10">
        {/* Fix: replaced undefined handleRunAnalysis with handleSimulate */}
        <NeonButton 
          onClick={handleSimulate} 
          className="hidden" // Just here for structure, handleSimulate is the primary
        />
        <button 
          onClick={handleSimulate} 
          disabled={isSimulating || !variantA || !variantB} 
          className={`w-full md:w-80 h-16 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl ${
            isSimulating ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-primary text-white shadow-neon hover:scale-105 active:scale-95'
          }`}
        >
          {isSimulating ? <RefreshCw className="animate-spin" /> : <TrendingUp size={20} />}
          {isSimulating ? 'Neural Scan in Progress...' : 'Start Neural Simulation'}
        </button>

        {stats.a > 0 && !isSimulating && (
          <button 
            onClick={() => onSelectWinner(winner as 'A' | 'B')}
            className="w-full md:w-80 h-16 bg-white text-black font-black uppercase text-[11px] tracking-[0.2em] rounded-[24px] hover:bg-slate-200 transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 animate-fade-in"
          >
            <CheckCircle2 size={20} /> Deploy Winning Variant ({winner})
          </button>
        )}
      </div>

      <div className="bg-primary/5 p-6 rounded-[32px] border border-primary/10 flex gap-5 items-start relative z-10">
        <div className="p-3 bg-primary/20 rounded-xl text-primary shrink-0"><AlertCircle size={24} /></div>
        <div className="space-y-1">
            <h4 className="text-xs font-black text-white uppercase tracking-tight">AI Vision Insight</h4>
            <p className="text-[10px] text-slate-400 italic leading-relaxed">
              "Mô phỏng sử dụng thị giác máy tính để đo lường độ tương phản, điểm tập trung của mắt và sự phù hợp với thuật toán đề xuất năm 2025."
            </p>
        </div>
      </div>
    </div>
  );
};

export default ABThumbnailTester;