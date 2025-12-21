
import React from 'react';
import { 
  LayoutDashboard, 
  ListVideo, 
  Settings, 
  BarChart3, 
  ShoppingBag,
  HeartPulse,
  X,
  Infinity as InfinityIcon,
  Dna,
  BookOpen,
  UserCircle2,
  LogOut
} from 'lucide-react';
import { TabView } from '../types';

interface SidebarProps {
  activeTab: TabView;
  setActiveTab: (tab: TabView) => void;
  isOpen: boolean;
  onClose: () => void;
  t: any; 
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose, t }) => {
  const mainNavItems: { id: TabView, icon: any, label: string, colorClass: string, pro?: boolean }[] = [
    { 
        id: 'studio', 
        icon: Dna, 
        label: t.studio, 
        colorClass: 'from-teal-500/10 to-emerald-500/10 border-teal-500/30 text-teal-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:border-teal-400',
        pro: true 
    },
    { 
        id: 'auto_pilot', 
        icon: InfinityIcon, 
        label: t.auto, 
        colorClass: 'from-pink-500/10 to-rose-500/10 border-pink-500/30 text-pink-400 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:border-pink-400' 
    }, 
    { 
        id: 'campaign', 
        icon: LayoutDashboard, 
        label: t.campaign,
        colorClass: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:border-blue-400'
    },
    { 
        id: 'analytics', 
        icon: BarChart3, 
        label: t.analytics,
        colorClass: 'from-amber-500/10 to-yellow-500/10 border-amber-500/30 text-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:border-amber-400'
    },
    { 
        id: 'marketplace', 
        icon: ShoppingBag, 
        label: t.market,
        colorClass: 'from-orange-500/10 to-red-500/10 border-orange-500/30 text-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:border-orange-400'
    },
    { 
        id: 'risk_center', 
        icon: HeartPulse, 
        label: t.risk,
        colorClass: 'from-red-500/10 to-rose-600/10 border-red-500/30 text-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:border-red-400'
    },
    { 
        id: 'queue', 
        icon: ListVideo, 
        label: t.queue,
        colorClass: 'from-indigo-500/10 to-blue-600/10 border-indigo-500/30 text-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:border-indigo-400'
    },
  ];

  const bottomNavItems: { id: TabView, icon: any, label: string }[] = [
    { id: 'docs', icon: BookOpen, label: t.docs },
    { id: 'settings', icon: Settings, label: t.settings },
  ];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#020617] border-r border-slate-800 z-50 transform transition-transform duration-300 md:translate-x-0 flex flex-col shadow-2xl ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-950/50 backdrop-blur-sm">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent transform -skew-x-6">
              {t.app_name}
            </h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest mt-1 uppercase">{t.system_enterprise}</p>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2 custom-scrollbar">
            {mainNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button 
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-300 group relative overflow-hidden border ${
                    isActive 
                      ? 'bg-slate-100 text-slate-900 border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-[1.02] z-10' 
                      : `bg-gradient-to-r ${item.colorClass} hover:text-white hover:scale-[1.01]`
                  }`}
                >
                  {isActive && <div className="absolute inset-0 bg-white opacity-10"></div>}
                  <item.icon 
                    size={18} 
                    className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-slate-900' : 'fill-current opacity-80'}`} 
                  />
                  <span className="truncate">{item.label}</span>
                  {item.pro && (
                    <span className={`ml-auto text-[8px] px-1.5 py-0.5 rounded font-black border ${isActive ? 'bg-black text-white border-black' : 'bg-slate-900/50 border-current'}`}>
                      {t.vip_badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>

        <div className="p-3 border-t border-slate-800/50 bg-slate-950/30">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {bottomNavItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); onClose(); }}
                    className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                        activeTab === item.id
                        ? 'bg-slate-800 text-white border-slate-600 shadow-inner'
                        : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:bg-slate-800 hover:text-white hover:border-slate-600'
                    }`}
                >
                    <item.icon size={16} />
                    {item.label}
                </button>
            ))}
          </div>

          <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                  <UserCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">{t.admin_label}</p>
                <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-[10px] text-slate-500">{t.system_ready}</p>
                </div>
              </div>
            </div>
            <button className="text-slate-600 hover:text-red-400 transition-colors p-1" title={t.logout}>
                <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
