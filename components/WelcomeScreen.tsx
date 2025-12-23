
import React, { useState } from 'react';
import { Power, ShieldCheck, Cpu, Zap, Activity, Mic, MapPin, Camera, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';

interface WelcomeScreenProps {
  onActivate: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onActivate }) => {
  const [isActivating, setIsActivating] = useState(false);
  const [authStatus, setAuthStatus] = useState({
    mic: 'pending', // pending, granted, denied
    geo: 'pending',
    cam: 'pending'
  });
  const [statusText, setStatusText] = useState('SYSTEM STANDBY');

  const requestPermissions = async () => {
    setStatusText('INITIALIZING SECURITY PROTOCOLS...');
    
    // Request Microphone & Camera
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setAuthStatus(prev => ({ ...prev, mic: 'granted', cam: 'granted' }));
    } catch (e) {
      console.warn("Media access denied or not available.", e);
      setAuthStatus(prev => ({ ...prev, mic: 'denied', cam: 'denied' }));
    }

    // Request Location
    try {
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      setAuthStatus(prev => ({ ...prev, geo: 'granted' }));
    } catch (e) {
      console.warn("Location access denied or timed out.", e);
      setAuthStatus(prev => ({ ...prev, geo: 'denied' }));
    }
  };

  const handleStart = async () => {
    setIsActivating(true);
    
    // Bắt đầu yêu cầu quyền ngay khi nhấn
    await requestPermissions();
    
    setStatusText('AUTHORIZATION COMPLETE. LINKING NEURAL CORE...');
    
    // Delay để người dùng thấy hiệu ứng ánh sáng lan tỏa và trạng thái quyền
    setTimeout(() => {
      onActivate();
    }, 1500);
  };

  return (
    <div className={`fixed inset-0 z-[1000] bg-[#020617] flex items-center justify-center overflow-hidden transition-all duration-1000 ${isActivating && authStatus.mic !== 'pending' ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}>
      
      {/* 3D Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:60px_60px] [transform:perspective(1000px)_rotateX(60deg)_translateY(-100px)_scale(2)] opacity-20"></div>
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
          "Khởi tạo trí tuệ nhân tạo, giải mã Viral DNA và thống trị thị trường Affiliate toàn cầu."
        </p>

        {/* 3D Power Button */}
        <div className="relative group">
          {/* Permission Status Indicators (Floating) */}
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 flex flex-col gap-4 animate-fade-in">
            <div className={`p-3 rounded-xl border transition-all duration-500 flex items-center justify-center ${authStatus.mic === 'granted' ? 'bg-green-500/20 border-green-500 text-green-500 shadow-neon' : authStatus.mic === 'denied' ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-slate-900 border-slate-800 text-slate-700'}`}>
              <Mic size={20} />
            </div>
            <div className={`p-3 rounded-xl border transition-all duration-500 flex items-center justify-center ${authStatus.cam === 'granted' ? 'bg-purple-500/20 border-purple-500 text-purple-500 shadow-neon' : authStatus.cam === 'denied' ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-slate-900 border-slate-800 text-slate-700'}`}>
              <Camera size={20} />
            </div>
            <div className={`p-3 rounded-xl border transition-all duration-500 flex items-center justify-center ${authStatus.geo === 'granted' ? 'bg-blue-500/20 border-blue-500 text-blue-500 shadow-neon' : authStatus.geo === 'denied' ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-slate-900 border-slate-800 text-slate-700'}`}>
              <MapPin size={20} />
            </div>
          </div>

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
            
            {isActivating ? (
                <Loader2 size={48} className="text-white animate-spin" />
            ) : (
                <Power 
                  size={48} 
                  className={`transition-all duration-500 text-primary/40 group-hover:text-primary group-hover:drop-shadow-[0_0_10px_rgba(14,165,164,1)]`} 
                />
            )}
            
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${isActivating ? 'text-white' : 'text-slate-500 group-hover:text-primary'}`}>
              {isActivating ? 'SYNCING...' : 'ACTIVATE'}
            </span>
          </button>
          
          {/* Status Text under button */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-64">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] animate-pulse whitespace-nowrap">
              {statusText}
            </span>
          </div>

          <div className="absolute -top-4 -right-12 animate-bounce transition-all duration-500 opacity-0 group-hover:opacity-100">
             <div className="bg-slate-900 border border-primary/30 px-3 py-1 rounded-lg text-[8px] font-black text-primary shadow-neon uppercase">Allow Perms</div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-20 flex flex-col items-center gap-3">
          <div className="flex items-center gap-6 opacity-30">
            <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className={authStatus.mic === 'granted' ? 'text-green-500' : 'text-slate-700'} />
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Audio</span>
            </div>
            <div className="w-px h-4 bg-slate-800"></div>
            <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className={authStatus.cam === 'granted' ? 'text-purple-500' : 'text-slate-700'} />
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Visual</span>
            </div>
            <div className="w-px h-4 bg-slate-800"></div>
            <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className={authStatus.geo === 'granted' ? 'text-blue-500' : 'text-slate-700'} />
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Geo</span>
            </div>
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
