
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
  LogOut,
  ChevronRight
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
    { id: 'studio', icon: Dna, label: t.studio, colorClass: 'border-teal-500/20 text-teal-400', pro: true },
    { id: 'auto_pilot', icon: InfinityIcon, label: t.auto, colorClass: 'border-pink-500/20 text-pink-400' }, 
    { id: 'campaign', icon: LayoutDashboard, label: t.campaign, colorClass: 'border-blue-500/20 text-blue-400' },
    { id: 'analytics', icon: BarChart3, label: t.analytics, colorClass: 'border-amber-500/20 text-amber-400' },
    { id: 'marketplace', icon: ShoppingBag, label: t.market, colorClass: 'border-orange-500/20 text-orange-400' },
    { id: 'risk_center', icon: HeartPulse, label: t.risk, colorClass: 'border-red-500/20 text-red-400' },
    { id: 'queue', icon: ListVideo, label: t.queue, colorClass: 'border-indigo-500/20 text-indigo-400' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div className={`fixed inset-0 bg-black/90 backdrop-blur-md z-[100] md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />

      <div className={`fixed md:sticky top-0 left-0 h-screen w-72 md:w-64 bg-[#020617] border-r border-slate-800 z-[101] transform transition-transform duration-500 md:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-950/50">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent transform -skew-x-6 leading-none">AV STUDIO</h1>
            <p className="text-[8px] text-slate-500 font-mono tracking-widest mt-1 uppercase">Supreme Intelligence</p>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-500 p-2 rounded-xl hover:bg-slate-900 transition-colors"><X size={24} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
            {mainNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button 
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); onClose(); }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 border ${
                    isActive 
                      ? 'bg-primary text-white border-primary shadow-neon scale-105' 
                      : `bg-slate-900/40 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700`
                  }`}
                >
                  <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-600'} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive ? <ChevronRight size={14} className="animate-pulse" /> : item.pro && <span className="text-[7px] px-1.5 py-0.5 rounded border border-current opacity-40">PRO</span>}
                </button>
              );
            })}
        </nav>

        <div className="p-4 border-t border-slate-800/50 bg-slate-950/30 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { setActiveTab('docs'); onClose(); }} className="flex flex-col items-center gap-1 py-3 rounded-xl border border-slate-800 text-slate-600 text-[9px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all">
                <BookOpen size={16} /> Docs
            </button>
            <button onClick={() => { setActiveTab('settings'); onClose(); }} className="flex flex-col items-center gap-1 py-3 rounded-xl border border-slate-800 text-slate-600 text-[9px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all">
                <Settings size={16} /> Config
            </button>
          </div>
          <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary"><UserCircle2 size={18} /></div>
              <div className="text-[10px] font-black text-white uppercase truncate max-w-[100px]">Commander</div>
            </div>
            <LogOut size={14} className="text-slate-600 hover:text-red-500 cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
