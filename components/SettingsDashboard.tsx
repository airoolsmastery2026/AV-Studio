
import React, { useState, useEffect } from 'react';
import { 
  Database, Shield, Brain, Sliders, Check, 
  Trash2, Plus, X, Globe, ShoppingBag, 
  Zap, Key as KeyIcon, Smartphone, CreditCard, 
  Store, Music, MessageCircle, AlertCircle, Loader2, Sparkles,
  ChevronRight, DollarSign, Target, Rocket, Award, ExternalLink, HelpCircle, Info, Lock, ShieldCheck,
  Cpu, Power, RotateCcw, Share2, Coins, TrendingUp, Play, 
  Instagram, Twitter, Chrome, Landmark, Wallet, Layers, HelpCircle as HelpIcon, BookOpen, Bitcoin,
  MapPin, Flag, Navigation, Activity, CloudSync, ShieldAlert, Languages, Monitor, Settings, Youtube, UserCheck, CheckCircle
} from 'lucide-react';
import NeonButton from './NeonButton';
import { ApiKeyConfig, KnowledgeBase, AppLanguage, ContentLanguage, YouTubeChannel } from '../types';

interface SettingsDashboardProps {
  apiKeys: ApiKeyConfig[];
  setApiKeys: (keys: ApiKeyConfig[]) => void;
  knowledgeBase: KnowledgeBase;
  setKnowledgeBase: (kb: KnowledgeBase) => void;
  onTrainBrain?: (text: string) => Promise<void>;
  t?: any;
  appLang: AppLanguage;
  setAppLang: (lang: AppLanguage) => void;
  contentLanguage: ContentLanguage;
  setContentLanguage: (lang: ContentLanguage) => void;
}

const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ 
  apiKeys, setApiKeys, knowledgeBase, setKnowledgeBase, onTrainBrain, t,
  appLang, setAppLang, contentLanguage, setContentLanguage
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'affiliate' | 'social' | 'brain' | 'policies'>('general');
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [trainingText, setTrainingText] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // YouTube State
  const [ytChannels, setYtChannels] = useState<YouTubeChannel[]>(() => {
    const saved = localStorage.getItem('av_studio_yt_channels');
    return saved ? JSON.parse(saved) : [];
  });
  const [isConnectingYt, setIsConnectingYt] = useState(false);

  useEffect(() => {
    localStorage.setItem('av_studio_yt_channels', JSON.stringify(ytChannels));
  }, [ytChannels]);

  useEffect(() => {
      const checkKey = async () => {
          if (window.aistudio) {
              const hasKey = await window.aistudio.hasSelectedApiKey();
              setHasGeminiKey(hasKey);
          }
      };
      checkKey();
  }, []);

  const handleGeminiAuth = async () => {
      if (window.aistudio) {
          await window.aistudio.openSelectKey();
          setHasGeminiKey(true);
      }
  };

  const handleConnectYouTube = () => {
    setIsConnectingYt(true);
    setTimeout(() => {
      setIsConnectingYt(false);
      const newChan: YouTubeChannel = {
        id: `UC${Math.floor(Math.random()*1000)}`,
        name: `Strategic Channel ${ytChannels.length + 1}`,
        thumbnail: `https://api.dicebear.com/7.x/initials/svg?seed=${Date.now()}`,
        subscribers: '12K',
        videoCount: 45,
        status: 'connected'
      };
      setYtChannels([...ytChannels, newChan]);
    }, 1500);
  };

  const deleteKey = (id: string) => {
    if (confirm("Xóa vĩnh viễn kết nối này?")) {
      const updated = apiKeys.filter(k => k.id !== id);
      setApiKeys(updated);
      localStorage.setItem('av_studio_secure_vault_v1', JSON.stringify(updated));
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="bg-slate-950 p-6 md:p-8 rounded-[40px] border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 md:p-5 bg-primary/10 rounded-3xl border border-primary/20 shadow-neon">
            <ShieldCheck size={36} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">{t.settings || "Infrastructure Vault"}</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Hệ thống điều phối tài nguyên chiến dịch</p>
          </div>
        </div>
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-inner flex-wrap justify-center overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('general')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'general' ? 'bg-primary text-white shadow-neon' : 'text-slate-500'}`}>General</button>
          <button onClick={() => setActiveTab('ai')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'ai' ? 'bg-purple-600 text-white shadow-neon' : 'text-slate-500'}`}>AI Engines</button>
          <button onClick={() => setActiveTab('affiliate')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'affiliate' ? 'bg-green-600 text-white shadow-neon' : 'text-slate-500'}`}>Affiliates</button>
          <button onClick={() => setActiveTab('social')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'social' ? 'bg-blue-600 text-white shadow-neon' : 'text-slate-500'}`}>Social Hub</button>
          <button onClick={() => setActiveTab('brain')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'brain' ? 'bg-slate-700 text-white shadow-neon' : 'text-slate-500'}`}>Neural Brain</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Settings size={180} /></div>
                <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><Monitor className="text-primary"/> System Configuration</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* UI Language */}
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-[32px] space-y-5 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800"><Languages className="text-primary" /></div>
                            <div><h4 className="font-black text-white uppercase tracking-tight">Ngôn ngữ Giao diện</h4><p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">UI Display</p></div>
                        </div>
                        <select value={appLang} onChange={(e) => setAppLang(e.target.value as AppLanguage)} className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-xs text-white font-black uppercase outline-none focus:border-primary transition-all cursor-pointer shadow-inner appearance-none">
                            <option value="vi">Tiếng Việt</option>
                            <option value="en">English (US)</option>
                            <option value="ja">日本語 (Japan)</option>
                            <option value="es">Español (Spain)</option>
                            <option value="zh">中文 (China)</option>
                        </select>
                    </div>

                    {/* AI Language */}
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-[32px] space-y-5 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800"><Globe className="text-green-500" /></div>
                            <div><h4 className="font-black text-white uppercase tracking-tight">Ngôn ngữ AI</h4><p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">AI Scripting</p></div>
                        </div>
                        <select value={contentLanguage} onChange={(e) => setContentLanguage(e.target.value as ContentLanguage)} className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-xs text-white font-black uppercase outline-none focus:border-green-500 transition-all cursor-pointer appearance-none shadow-inner">
                            <option value="vi">🇻🇳 Tiếng Việt</option>
                            <option value="en">🇺🇸 English</option>
                            <option value="zh">🇨🇳 中文</option>
                            <option value="ja">🇯🇵 日本語</option>
                            <option value="fr">🇫🇷 Français</option>
                            <option value="es">🇪🇸 Español</option>
                        </select>
                    </div>
                </div>
            </div>
          )}

          {/* Social Hub Tab */}
          {activeTab === 'social' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8">
               <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><Youtube className="text-red-500"/> Social Channel Hub</h3>
                  <button onClick={handleConnectYouTube} disabled={isConnectingYt} className="px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-neon flex items-center gap-2">
                    {isConnectingYt ? <Loader2 className="animate-spin" size={14}/> : <Plus size={14}/>} {isConnectingYt ? 'Authorizing...' : 'Connect YouTube'}
                  </button>
               </div>
               
               <div className="grid grid-cols-1 gap-6">
                  {ytChannels.map(channel => (
                    <div key={channel.id} className="bg-slate-950 border border-slate-800 p-6 rounded-[32px] flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-red-500/30 transition-all">
                        <div className="flex items-center gap-6">
                            <img src={channel.thumbnail} className="w-16 h-16 rounded-2xl border-2 border-slate-800" alt={channel.name} />
                            <div>
                                <h4 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">{channel.name} <CheckCircle className="text-blue-500" size={14} /></h4>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{channel.subscribers} Subs</span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{channel.videoCount} Uploads</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 text-[9px] font-black rounded-full uppercase">Active Sync</div>
                            <button onClick={() => setYtChannels(ytChannels.filter(c => c.id !== channel.id))} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-red-500 transition-all"><Power size={18} /></button>
                        </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Brain Tab */}
          {activeTab === 'brain' && (
             <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3"><Brain className="text-primary"/> Neural Memory</h3>
                      <textarea value={trainingText} onChange={(e) => setTrainingText(e.target.value)} placeholder="Dán văn bản xu hướng hoặc quy tắc bạn muốn AI học tập..." className="w-full h-64 bg-slate-950 border border-slate-800 rounded-[24px] p-6 text-sm text-white focus:border-primary outline-none resize-none shadow-inner transition-all font-medium" />
                      <NeonButton onClick={async () => { if (!onTrainBrain || !trainingText) return; setIsSynthesizing(true); await onTrainBrain(trainingText); setTrainingText(''); setIsSynthesizing(false); }} disabled={isSynthesizing || !trainingText} className="w-full h-14 uppercase tracking-widest text-[11px] font-black">{isSynthesizing ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}{isSynthesizing ? "ĐANG TỔNG HỢP..." : "HUẤN LUYỆN COMMANDER"}</NeonButton>
                   </div>
                   <div className="bg-slate-950 border border-slate-800 rounded-[32px] p-6 overflow-y-auto h-[400px] custom-scrollbar shadow-inner">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Database size={12} className="text-primary" /> Learned Rules ({knowledgeBase.learnedPreferences.length})</h4>
                      <div className="space-y-3">
                         {knowledgeBase.learnedPreferences.map((p, i) => (<div key={i} className="text-xs text-slate-300 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 italic animate-fade-in group hover:border-primary/30">"{p}"</div>))}
                      </div>
                   </div>
                </div>
             </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900/80 border border-slate-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5"><BookOpen size={120} /></div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3"><HelpCircle size={18} className="text-primary" /> Documentation</h3>
               <div className="space-y-6">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                     <h4 className="text-xs font-black text-amber-500 uppercase mb-2 flex items-center gap-2"><ShieldAlert size={14}/> AI Policy Guard</h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed italic">"Tự động gắn thẻ <strong>#AIContent</strong> để đảm bảo tuân thủ luật pháp và thuật toán 2025."</p>
                  </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;
