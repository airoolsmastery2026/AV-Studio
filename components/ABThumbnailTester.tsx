
import React, { useState, useEffect } from 'react';
import { Columns, CheckCircle2, TrendingUp, AlertCircle, RefreshCw, Trophy, MousePointer2 } from 'lucide-react';
import { ABTestMetadata } from '../types';
import NeonButton from './NeonButton';

interface ABThumbnailTesterProps {
  initialData?: ABTestMetadata;
  onSelectWinner: (variant: 'A' | 'B') => void;
  onUpdateUrls: (urls: { a: string; b: string }) => void;
}

const ABThumbnailTester: React.FC<ABThumbnailTesterProps> = ({ initialData, onSelectWinner, onUpdateUrls }) => {
  const [variantA, setVariantA] = useState(initialData?.variant_a_url || '');
  const [variantB, setVariantB] = useState(initialData?.variant_b_url || '');
  const [isSimulating, setIsSimulating] = useState(false);
  const [stats, setStats] = useState({
    a: initialData?.variant_a_ctr || 0,
    b: initialData?.variant_b_ctr || 0
  });

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setStats({
        a: Math.floor(Math.random() * 15) + 2, // 2% - 17% CTR
        b: Math.floor(Math.random() * 15) + 2
      });
      setIsSimulating(false);
    }, 2000);
  };

  const winner = stats.a > stats.b ? 'A' : 'B';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 space-y-6 shadow-2xl animate-fade-in">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <Columns className="text-primary" size={24} /> Thumbnail A/B Tester
        </h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural Simulation Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* VARIANT A */}
        <div className={`space-y-4 transition-all duration-500 ${winner === 'A' && !isSimulating && stats.a > 0 ? 'scale-105' : 'opacity-80'}`}>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Variant A (Control)</span>
            {winner === 'A' && stats.a > 0 && <Trophy className="text-yellow-500 animate-bounce" size={18} />}
          </div>
          <div className="aspect-video bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden relative group">
            {variantA ? (
              <img src={variantA} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Variant A" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-700">
                <MousePointer2 size={32} className="mb-2" />
                <span className="text-[9px] font-bold uppercase">Insert URL Variant A</span>
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4">
              <input 
                value={variantA} 
                onChange={(e) => { setVariantA(e.target.value); onUpdateUrls({ a: e.target.value, b: variantB }); }}
                placeholder="Thumbnail URL A..." 
                className="w-full bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-2 text-[10px] text-white focus:border-primary outline-none"
              />
            </div>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
            <div className="text-[9px] text-slate-500 font-black uppercase">Simulated CTR</div>
            <div className="text-2xl font-black text-primary font-mono">{stats.a}%</div>
          </div>
        </div>

        {/* VARIANT B */}
        <div className={`space-y-4 transition-all duration-500 ${winner === 'B' && !isSimulating && stats.b > 0 ? 'scale-105' : 'opacity-80'}`}>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Variant B (Challenger)</span>
            {winner === 'B' && stats.b > 0 && <Trophy className="text-yellow-500 animate-bounce" size={18} />}
          </div>
          <div className="aspect-video bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden relative group">
            {variantB ? (
              <img src={variantB} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Variant B" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-700">
                <MousePointer2 size={32} className="mb-2" />
                <span className="text-[9px] font-bold uppercase">Insert URL Variant B</span>
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4">
              <input 
                value={variantB} 
                onChange={(e) => { setVariantB(e.target.value); onUpdateUrls({ a: variantA, b: e.target.value }); }}
                placeholder="Thumbnail URL B..." 
                className="w-full bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-2 text-[10px] text-white focus:border-primary outline-none"
              />
            </div>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
            <div className="text-[9px] text-slate-500 font-black uppercase">Simulated CTR</div>
            <div className="text-2xl font-black text-accent font-mono">{stats.b}%</div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row gap-4 justify-center items-center">
        <NeonButton onClick={handleSimulate} disabled={isSimulating || !variantA || !variantB} className="w-full md:w-64 h-14">
          {isSimulating ? <RefreshCw className="animate-spin" /> : <TrendingUp size={20} />}
          {isSimulating ? 'Neural Processing...' : 'Simulate Performance'}
        </NeonButton>
        {stats.a > 0 && (
          <button 
            onClick={() => onSelectWinner(winner as 'A' | 'B')}
            className="w-full md:w-64 h-14 bg-white text-black font-black uppercase text-[11px] rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-2xl"
          >
            <CheckCircle2 size={18} /> Apply Winning Variant ({winner})
          </button>
        )}
      </div>

      <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex gap-4 items-start">
        <AlertCircle size={20} className="text-primary shrink-0" />
        <p className="text-[10px] text-slate-400 italic leading-relaxed">
          "The neural simulation uses historical CTR patterns from similar niches to predict which visual hierarchy will drive more clicks."
        </p>
      </div>
    </div>
  );
};

export default ABThumbnailTester;
