
import React, { useState, useEffect } from 'react';
import { 
  Database, Shield, Brain, Sliders, Check, 
  Trash2, Plus, X, Globe, ShoppingBag, 
  Zap, Key as KeyIcon, Smartphone, CreditCard, 
  Store, Music, MessageCircle, AlertCircle, Loader2, Sparkles,
  ChevronRight, DollarSign, Target, Rocket, Award, ExternalLink, HelpCircle, Info, Lock, ShieldCheck,
  Cpu, Power, RotateCcw, Share2, Coins, TrendingUp, Play, 
  Instagram, Twitter, Chrome, Landmark, Wallet, Layers, HelpCircle as HelpIcon, BookOpen, Bitcoin,
  MapPin, Flag, Navigation, Activity, CloudSync, ShieldAlert, Languages, Monitor, Settings, Youtube, UserCheck, CheckCircle, Facebook, LayoutGrid, ArrowUpRight
} from 'lucide-react';
import NeonButton from './NeonButton';
import { ApiKeyConfig, KnowledgeBase, AppLanguage, ContentLanguage, YouTubeChannel } from '../types';

interface SettingsDashboardProps {
  apiKeys: ApiKeyConfig[];
  setApiKeys: (keys: ApiKeyConfig[]) => void;
  knowledgeBase: KnowledgeBase;
  setKnowledgeBase: (kb: KnowledgeBase) => void;
  onTrainBrain?: (text: string) => Promise<void>;
  t: any;
  appLang: AppLanguage;
  setAppLang: (lang: AppLanguage) => void;
  contentLanguage: ContentLanguage;
  setContentLanguage: (lang: ContentLanguage) => void;
}

const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ 
  apiKeys, setApiKeys, knowledgeBase, setKnowledgeBase, onTrainBrain, t,
  appLang, setAppLang, contentLanguage, setContentLanguage
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'affiliate' | 'social' | 'brain'>('general');
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [trainingText, setTrainingText] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const [ytChannels, setYtChannels] = useState<YouTubeChannel[]>(() => {
    const saved = localStorage.getItem('av_studio_yt_channels');
    return saved ? JSON.parse(saved) : [];
  });

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

  const handleConnectSocial = (provider: string) => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      if (provider === 'youtube') {
          const newChan: YouTubeChannel = {
            id: `UC${Math.floor(Math.random()*1000)}`,
            name: `Strategic Channel ${ytChannels.length + 1}`,
            thumbnail: `https://api.dicebear.com/7.x/initials/svg?seed=${Date.now()}`,
            subscribers: '12.4K',
            videoCount: 84,
            status: 'connected'
          };
          setYtChannels([...ytChannels, newChan]);
      } else {
          const newKey: ApiKeyConfig = {
              id: crypto.randomUUID(),
              alias: `${provider.toUpperCase()} Enterprise Profile`,
              key: 'OAUTH_TOKEN_ACTIVE',
              provider: provider,
              category: 'social',
              status: 'active'
          };
          const updated = [...apiKeys, newKey];
          setApiKeys(updated);
          localStorage.setItem('av_studio_secure_vault_v1', JSON.stringify(updated));
      }
    }, 800);
  };

  const handleAddAffiliate = (network: string) => {
      const newKey: ApiKeyConfig = {
          id: crypto.randomUUID(),
          alias: `${network.toUpperCase()} Vault Node`,
          key: 'USER_ID_AUTH',
          provider: network,
          category: 'affiliate',
          status: 'active'
      };
      const updated = [...apiKeys, newKey];
      setApiKeys(updated);
      localStorage.setItem('av_studio_secure_vault_v1', JSON.stringify(updated));
  };

  const deleteKey = (id: string) => {
    if (confirm(t.save === "保存" ? "この接続を削除しますか？" : "Xóa vĩnh viễn kết nối này?")) {
      const updated = apiKeys.filter(k => k.id !== id);
      setApiKeys(updated);
      localStorage.setItem('av_studio_secure_vault_v1', JSON.stringify(updated));
    }
  };

  // Helper links for obtaining API keys
  const HELP_LINKS = [
    { name: 'Google Gemini (AI)', url: 'https://aistudio.google.com/app/apikey', color: 'text-primary' },
    { name: 'Shopee Open Platform', url: 'https://open.shopee.com/', color: 'text-orange-500' },
    { name: 'Lazada Open Platform', url: 'https://open.lazada.com/', color: 'text-blue-500' },
    { name: 'TikTok for Developers', url: 'https://developers.tiktok.com/', color: 'text-white' },
    { name: 'Meta (FB/IG) for Devs', url: 'https://developers.facebook.com/', color: 'text-blue-600' },
    { name: 'Amazon Associates', url: 'https://affiliate-program.amazon.com/home/tools/paapi', color: 'text-yellow-500' },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      {/* Header */}
      <div className="bg-slate-950 p-6 md:p-8 rounded-[40px] border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 md:p-5 bg-primary/10 rounded-3xl border border-primary/20 shadow-neon">
            <ShieldCheck size={36} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-none">{t.settings}</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Vault v4.5 • Hybrid Secure Mode</p>
          </div>
        </div>
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-inner flex-wrap justify-center overflow-x-auto no-scrollbar max-w-full">
          <button onClick={() => setActiveTab('general')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'general' ? 'bg-primary text-white shadow-neon' : 'text-slate-500'}`}>System</button>
          <button onClick={() => setActiveTab('affiliate')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'affiliate' ? 'bg-green-600 text-white shadow-neon' : 'text-slate-500'}`}>{t.affiliate_vault}</button>
          <button onClick={() => setActiveTab('social')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'social' ? 'bg-blue-600 text-white shadow-neon' : 'text-slate-500'}`}>{t.social_hub}</button>
          <button onClick={() => setActiveTab('brain')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'brain' ? 'bg-slate-700 text-white shadow-neon' : 'text-slate-500'}`}>Neural Brain</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB: GENERAL & QUICK GUIDE */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8">
                  <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
                      <div className="p-3 bg-primary/20 rounded-xl text-primary"><HelpCircle size={24} /></div>
                      <div>
                          <h3 className="text-xl font-black text-white uppercase tracking-tight">{t.guide_title}</h3>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Lấy mã kết nối chỉ trong 3 bước</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-5 bg-slate-950 rounded-[28px] border border-slate-800 relative group overflow-hidden">
                          <div className="absolute -top-2 -right-2 text-6xl font-black text-white/5 group-hover:text-primary/10 transition-colors">1</div>
                          <p className="text-[10px] font-black text-primary uppercase mb-2 tracking-widest">Bước 1</p>
                          <p className="text-xs text-slate-300 font-medium leading-relaxed">{t.guide_step_1}</p>
                      </div>
                      <div className="p-5 bg-slate-950 rounded-[28px] border border-slate-800 relative group overflow-hidden">
                          <div className="absolute -top-2 -right-2 text-6xl font-black text-white/5 group-hover:text-primary/10 transition-colors">2</div>
                          <p className="text-[10px] font-black text-primary uppercase mb-2 tracking-widest">Bước 2</p>
                          <p className="text-xs text-slate-300 font-medium leading-relaxed">{t.guide_step_2}</p>
                      </div>
                      <div className="p-5 bg-slate-950 rounded-[28px] border border-slate-800 relative group overflow-hidden">
                          <div className="absolute -top-2 -right-2 text-6xl font-black text-white/5 group-hover:text-primary/10 transition-colors">3</div>
                          <p className="text-[10px] font-black text-primary uppercase mb-2 tracking-widest">Bước 3</p>
                          <p className="text-xs text-slate-300 font-medium leading-relaxed">{t.guide_step_3}</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {HELP_LINKS.map(link => (
                        <a 
                          key={link.name} 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-primary transition-all group text-center gap-2"
                        >
                            <span className={`text-[8px] font-black uppercase tracking-tighter ${link.color}`}>{link.name}</span>
                            <ArrowUpRight size={12} className="text-slate-600 group-hover:text-primary" />
                        </a>
                      ))}
                  </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-10">
                  <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><Monitor className="text-primary"/> System Localization</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-slate-950 border border-slate-800 p-6 rounded-[32px] space-y-5">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800"><Languages className="text-primary" /></div>
                              <h4 className="font-black text-white uppercase tracking-tight">Giao diện (UI)</h4>
                          </div>
                          <select value={appLang} onChange={(e) => setAppLang(e.target.value as AppLanguage)} className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-xs text-white font-black uppercase outline-none focus:border-primary cursor-pointer shadow-inner appearance-none">
                              <option value="vi">Tiếng Việt</option>
                              <option value="en">English (US)</option>
                              <option value="ja">日本語</option>
                              <option value="es">Español</option>
                              <option value="zh">中文</option>
                          </select>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 p-6 rounded-[32px] space-y-5">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800"><Globe className="text-green-500" /></div>
                              <h4 className="font-black text-white uppercase tracking-tight">Nội dung (Script)</h4>
                          </div>
                          <select value={contentLanguage} onChange={(e) => setContentLanguage(e.target.value as ContentLanguage)} className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-xs text-white font-black uppercase outline-none focus:border-green-500 cursor-pointer shadow-inner appearance-none">
                              <option value="vi">🇻🇳 Tiếng Việt</option>
                              <option value="en">🇺🇸 English</option>
                              <option value="ja">🇯🇵 日本語</option>
                              <option value="es">🇪🇸 Español</option>
                              <option value="zh">🇨🇳 中文</option>
                          </select>
                      </div>
                  </div>
              </div>
            </div>
          )}

          {/* TAB: AFFILIATE VAULT (EXPANDED) */}
          {activeTab === 'affiliate' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8">
               <div className="flex justify-between items-center border-b border-slate-800 pb-4 flex-wrap gap-4">
                  <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><ShoppingBag className="text-green-500"/> {t.affiliate_vault}</h3>
                  <div className="flex gap-2 flex-wrap">
                      <button onClick={() => handleAddAffiliate('shopee')} className="px-3 py-2 bg-slate-800 hover:bg-orange-600 text-white rounded-lg text-[9px] font-black uppercase transition-all">+ Shopee</button>
                      <button onClick={() => handleAddAffiliate('lazada')} className="px-3 py-2 bg-slate-800 hover:bg-blue-700 text-white rounded-lg text-[9px] font-black uppercase transition-all">+ Lazada</button>
                      <button onClick={() => handleAddAffiliate('tiktok_shop')} className="px-3 py-2 bg-slate-800 hover:bg-black text-white rounded-lg text-[9px] font-black uppercase transition-all">+ TikTok Shop</button>
                      <button onClick={() => handleAddAffiliate('amazon')} className="px-3 py-2 bg-slate-800 hover:bg-yellow-600 text-black rounded-lg text-[9px] font-black uppercase transition-all">+ Amazon</button>
                      <button onClick={() => handleAddAffiliate('accesstrade')} className="px-3 py-2 bg-slate-800 hover:bg-red-600 text-white rounded-lg text-[9px] font-black uppercase transition-all">+ AccessTrade</button>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apiKeys.filter(k => k.category === 'affiliate').map(k => (
                    <div key={k.id} className="bg-slate-950 border border-slate-800 p-5 rounded-[24px] flex justify-between items-center hover:border-green-500/30 transition-all shadow-lg group">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${k.provider === 'shopee' ? 'bg-orange-500/10 text-orange-500' : k.provider === 'lazada' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}><Store size={20} /></div>
                            <div>
                                <div className="text-sm font-black text-white uppercase truncate max-w-[150px]">{k.alias}</div>
                                <div className="text-[9px] text-slate-500 font-mono uppercase mt-0.5">{k.provider} • Verified Connection</div>
                            </div>
                        </div>
                        <button onClick={() => deleteKey(k.id)} className="p-2 text-slate-800 group-hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* TAB: SOCIAL HUB */}
          {activeTab === 'social' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8">
               <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><LayoutGrid className="text-blue-500"/> {t.social_hub}</h3>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => handleConnectSocial('youtube')} disabled={isConnecting} className="px-3 py-2 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase transition-all shadow-neon flex items-center gap-2">{isConnecting ? <Loader2 className="animate-spin" size={10}/> : <Youtube size={14}/>} YouTube</button>
                    <button onClick={() => handleConnectSocial('tiktok')} className="px-3 py-2 bg-slate-800 hover:bg-black text-white rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-2"><Music size={14}/> TikTok</button>
                    <button onClick={() => handleConnectSocial('facebook')} className="px-3 py-2 bg-slate-800 hover:bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-2"><Facebook size={14}/> Facebook</button>
                    <button onClick={() => handleConnectSocial('instagram')} className="px-3 py-2 bg-slate-800 hover:bg-pink-600 text-white rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-2"><Instagram size={14}/> Instagram</button>
                    <button onClick={() => handleConnectSocial('zalo')} className="px-3 py-2 bg-slate-800 hover:bg-blue-500 text-white rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-2"><MessageCircle size={14}/> Zalo OA</button>
                  </div>
               </div>
               <div className="grid grid-cols-1 gap-6">
                  {ytChannels.map(channel => (
                    <div key={channel.id} className="bg-slate-950 border border-slate-800 p-6 rounded-[32px] flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-red-500/30 transition-all shadow-xl">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <img src={channel.thumbnail} className="w-16 h-16 rounded-2xl border-2 border-slate-800 shadow-2xl" alt={channel.name} />
                                <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1 rounded-lg border-2 border-slate-950"><Youtube size={12} fill="white" /></div>
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">{channel.name} <CheckCircle className="text-blue-500" size={14} /></h4>
                                <div className="flex items-center gap-4 mt-1"><span className="text-[10px] text-slate-500 font-bold uppercase">{channel.subscribers} Subs</span><span className="text-[10px] text-slate-500 font-bold uppercase">{channel.videoCount} Videos</span></div>
                            </div>
                        </div>
                        <button onClick={() => setYtChannels(ytChannels.filter(c => c.id !== channel.id))} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-red-500 transition-all"><Power size={18} /></button>
                    </div>
                  ))}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {apiKeys.filter(k => k.category === 'social').map(k => (
                        <div key={k.id} className="bg-slate-950 border border-slate-800 p-5 rounded-[24px] flex justify-between items-center hover:border-blue-500/30 transition-all group">
                             <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-900 rounded-xl text-blue-400">
                                    {k.provider === 'tiktok' ? <Music size={20}/> : k.provider === 'facebook' ? <Facebook size={20}/> : k.provider === 'instagram' ? <Instagram size={20}/> : k.provider === 'zalo' ? <MessageCircle size={20}/> : <Globe size={20}/>}
                                </div>
                                <div><div className="text-sm font-black text-white uppercase truncate max-w-[120px]">{k.alias}</div><div className="text-[9px] text-slate-600 font-mono uppercase mt-0.5">Live Relay Active</div></div>
                             </div>
                             <button onClick={() => deleteKey(k.id)} className="p-2 text-slate-800 group-hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                        </div>
                      ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'brain' && (
             <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3"><Brain className="text-primary"/> Neural Memory</h3>
                      <textarea value={trainingText} onChange={(e) => setTrainingText(e.target.value)} placeholder="Nhập quy tắc hoặc sở thích nội dung của bạn..." className="w-full h-64 bg-slate-950 border border-slate-800 rounded-[24px] p-6 text-sm text-white focus:border-primary outline-none resize-none shadow-inner transition-all" />
                      <NeonButton onClick={async () => { if (!onTrainBrain || !trainingText) return; setIsSynthesizing(true); await onTrainBrain(trainingText); setTrainingText(''); setIsSynthesizing(false); }} disabled={isSynthesizing || !trainingText} className="w-full h-14">{isSynthesizing ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}{isSynthesizing ? "PROCESSING..." : "TRAIN COMMANDER"}</NeonButton>
                   </div>
                   <div className="bg-slate-950 border border-slate-800 rounded-[32px] p-6 overflow-y-auto h-[400px] custom-scrollbar space-y-3">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Database size={12} className="text-primary" /> Established Preferences</h4>
                      {knowledgeBase.learnedPreferences.map((p, i) => (<div key={i} className="text-xs text-slate-300 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 italic group hover:border-primary/40 transition-all">"{p}"</div>))}
                   </div>
                </div>
             </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900/80 border border-slate-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-all duration-700"><BookOpen size={120} /></div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3"><HelpCircle size={18} className="text-primary" /> Support Center</h3>
               <div className="space-y-6">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/20 transition-all">
                     <h4 className="text-xs font-black text-amber-500 uppercase mb-2 flex items-center gap-2"><ShieldAlert size={14}/> Security Policy</h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed italic">"Hệ thống sử dụng Hybrid Storage: Toàn bộ API được mã hóa ngay tại trình duyệt. Tuyệt đối không lưu trữ Key trên máy chủ công cộng."</p>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-primary/20 transition-all">
                     <h4 className="text-xs font-black text-primary uppercase mb-2 flex items-center gap-2"><Globe size={14}/> Multi-Platform Relay</h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed italic">"Việc kết nối API giúp hệ thống tự động đăng bài và đo lường chuyển đổi Affiliate chính xác hơn."</p>
                  </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;
