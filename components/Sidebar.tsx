
import React from 'react';
import { 
  LayoutDashboard, 
  ListVideo, 
  Settings, 
  BarChart3, 
  ShoppingBag,
  HeartPulse,
  X,
  Infinity as InfinityIcon
} from 'lucide-react';
import { TabView } from '../types';

interface SidebarProps {
  activeTab: TabView;
  setActiveTab: (tab: TabView) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const menuItems: { id: TabView, icon: any, label: string, special?: boolean }[] = [
    { id: 'auto_pilot', icon: InfinityIcon, label: 'Infinity Auto-Pilot', special: true }, 
    { id: 'campaign', icon: LayoutDashboard, label: 'Sản xuất & Chiến dịch' },
    { id: 'analytics', icon: BarChart3, label: 'Tình báo Chiến lược' },
    { id: 'marketplace', icon: ShoppingBag, label: 'Sản phẩm AI' },
    { id: 'risk_center', icon: HeartPulse, label: 'Sức khỏe Kênh' },
    { id: 'queue', icon: ListVideo, label: 'Lịch đăng & Queue' },
    { id: 'settings', icon: Settings, label: 'Cấu hình Hệ thống' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-950 border-r border-slate-800 z-50 transform transition-transform duration-300 md:translate-x-0 flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AV Studio
            </h1>
            <p className="text-xs text-slate-500 mt-1">Affiliate Automation</p>
          </div>
          {/* Close Button (Mobile Only) */}
          <button 
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button 
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose(); // Auto close on mobile selection
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.id 
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(14,165,164,0.1)]' 
                      : item.special 
                        ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 text-purple-300 border border-purple-500/30 hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <item.icon size={18} className={item.special ? "animate-pulse" : ""} />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-500"></div>
              <div>
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-slate-500">Pro Plan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
