
import React, { useState } from 'react';
import { Power, ShieldCheck, Cpu, Zap, Activity } from 'lucide-react';

interface WelcomeScreenProps {
  onActivate: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onActivate }) => {
  const [isActivating, setIsActivating] = useState(false);

  const handleStart = () => {
    setIsActivating(true);
    // Delay để người dùng thấy hiệu ứng ánh sáng lan tỏa trước khi vào app
    setTimeout(() => {
      onActivate();
    }, 1200);
  };

  return (
    <div className={`fixed inset-0 z-[1000] bg-[#020617] flex items-center justify-center overflow-hidden transition-all duration-1000 ${isActivating ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}>
      
      {/* 3D Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:60px_60px] [transform:perspective(1000px)_rotateX(60deg)_translateY(-100px)_scale(2)] opacity-20"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl px-6">
        
        {/* Top Status Badges */}
        <div className="flex gap-4 mb-8 animate-fade-in">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full">
            <Activity size={12} className="text-primary animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-nowrap">Core v5.0 Active</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full">
            <ShieldCheck size={12} className="text-green-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-nowrap">AES-256 Vault Ready</span>
          </div>
        </div>

        {/* Welcome Text */}
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-4 drop-shadow-2xl">
          Chào mừng <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Chỉ Huy</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed mb-12 max-w-lg italic opacity-80">
          "Khởi tạo trí tuệ nhân tạo, giải mã Viral DNA và thống trị thị trường Affiliate toàn cầu bằng hệ thống tự động hóa tối tân."
        </p>

        {/* 3D Power Button */}
        <div className="relative group">
          {/* Outer Ring Glow */}
          <div className={`absolute inset-[-20px] rounded-full bg-primary/20 blur-2xl transition-all duration-500 group-hover:bg-primary/40 ${isActivating ? 'animate-ping' : ''}`}></div>
          
          <button 
            onClick={handleStart}
            disabled={isActivating}
            className={`
              relative w-32 h-32 md:w-40 md:h-40 rounded-full 
              bg-gradient-to-br from-slate-800 to-slate-950
              border-4 border-slate-800 shadow-[0_10px_40px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.1)]
              flex flex-col items-center justify-center gap-2
              transition-all duration-300
              hover:border-primary/50 hover:scale-105 active:scale-95
              group-hover:shadow-[0_0_50px_rgba(14,165,164,0.4)]
              ${isActivating ? 'border-primary' : ''}
            `}
          >
            {/* Inner Light Ring */}
            <div className={`absolute inset-2 rounded-full border border-primary/10 transition-all duration-500 group-hover:border-primary/30 ${isActivating ? 'border-primary animate-spin' : ''}`}></div>
            
            <Power 
              size={48} 
              className={`transition-all duration-500 ${isActivating ? 'text-white scale-125' : 'text-primary/40 group-hover:text-primary group-hover:drop-shadow-[0_0_10px_rgba(14,165,164,1)]'}`} 
            />
            
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${isActivating ? 'text-white' : 'text-slate-500 group-hover:text-primary'}`}>
              {isActivating ? 'SYSTEM ON' : 'ACTIVATE'}
            </span>
          </button>
          
          {/* Floating Indicators around the button */}
          <div className="absolute -top-4 -right-12 animate-bounce transition-all duration-500 opacity-0 group-hover:opacity-100">
             <div className="bg-slate-900 border border-primary/30 px-3 py-1 rounded-lg text-[8px] font-black text-primary shadow-neon uppercase">Start Linking</div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 flex flex-col items-center gap-3">
          <div className="flex items-center gap-6 opacity-30 group-hover:opacity-100 transition-opacity">
            <Cpu size={24} className="text-slate-500" />
            <div className="w-px h-4 bg-slate-800"></div>
            <Zap size={24} className="text-slate-500" />
            <div className="w-px h-4 bg-slate-800"></div>
            <ShieldCheck size={24} className="text-slate-500" />
          </div>
          <span className="text-[8px] text-slate-700 font-mono tracking-[0.5em] uppercase mt-4">Security Protocol 9.0.4 Ready</span>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default WelcomeScreen;
