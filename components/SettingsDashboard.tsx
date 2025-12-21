
import React, { useState } from 'react';
import { 
  Database, Shield, Brain, Sliders, Check, 
  Trash2, Plus, X, Eye, EyeOff, Globe, ShoppingBag, 
  Zap, Link as LinkIcon, Smartphone, CreditCard, 
  Store, Music, MessageCircle, AlertCircle, Loader2, Sparkles, Key as KeyIcon,
  ChevronRight, DollarSign, Target, Rocket, Award, ExternalLink, HelpCircle, Info, Lock, ShieldCheck,
  Cpu, Power, RotateCcw, Share2, Coins, TrendingUp, Play, 
  Instagram, Twitter, Chrome, Landmark, Wallet, Layers, HelpCircle as HelpIcon, BookOpen, Bitcoin,
  MapPin, Flag, Navigation, Activity, Gauge, Languages
} from 'lucide-react';
import NeonButton from './NeonButton';
import { ApiKeyConfig, KnowledgeBase, AppLanguage, ContentLanguage } from '../types';

interface SettingsDashboardProps {
  apiKeys: ApiKeyConfig[];
  setApiKeys: (keys: ApiKeyConfig[]) => void;
  knowledgeBase: KnowledgeBase;
  setKnowledgeBase: (kb: KnowledgeBase) => void;
  t: any;
  appLang: AppLanguage;
  setAppLang: (lang: AppLanguage) => void;
  contentLanguage: ContentLanguage;
  setContentLanguage: (lang: ContentLanguage) => void;
}

const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ 
  apiKeys, setApiKeys, knowledgeBase, setKnowledgeBase, t,
  appLang, setAppLang, contentLanguage, setContentLanguage
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'affiliate' | 'social' | 'brain' | 'strategy'>('strategy');

  const updateStrategy = (field: string, value: any) => {
    setKnowledgeBase({
      ...knowledgeBase,
      globalStrategyRules: {
        ...knowledgeBase.globalStrategyRules,
        [field]: value
      }
    });
  };

  const changeAppLang = (lang: AppLanguage) => {
    setAppLang(lang);
    localStorage.setItem('av_studio_ui_lang', lang);
  };

  const languages: { code: AppLanguage, label: string, flag: string }[] = [
    { code: 'vi', label: t.lang_vi, flag: '🇻🇳' },
    { code: 'en', label: t.lang_en, flag: '🇺🇸' },
    { code: 'es', label: t.lang_es, flag: '🇪🇸' },
    { code: 'fr', label: t.lang_fr, flag: '🇫🇷' },
    { code: 'ja', label: t.lang_ja, flag: '🇯🇵' },
    { code: 'ko', label: t.lang_ko, flag: '🇰🇷' },
    { code: 'zh', label: t.lang_zh, flag: '🇨🇳' },
    { code: 'th', label: t.lang_th, flag: '🇹🇭' },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="bg-slate-950 p-8 rounded-[40px] border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-primary/10 rounded-3xl border border-primary/20 shadow-neon">
            <Activity size={40} className="text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{t.settings_command}</h2>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">{t.settings_command_desc}</p>
          </div>
        </div>
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-inner flex-wrap justify-center">
          <button onClick={() => setActiveTab('strategy')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'strategy' ? 'bg-amber-600 text-white shadow-neon' : 'text-slate-500'}`}>{t.settings_tab_neural}</button>
          <button onClick={() => setActiveTab('ai')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'ai' ? 'bg-purple-600 text-white shadow-neon' : 'text-slate-500'}`}>{t.settings_tab_ai}</button>
          <button onClick={() => setActiveTab('affiliate')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'affiliate' ? 'bg-green-600 text-white shadow-neon' : 'text-slate-500'}`}>{t.settings_tab_aff}</button>
          <button onClick={() => setActiveTab('brain')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'brain' ? 'bg-primary text-white shadow-neon' : 'text-slate-500'}`}>{t.settings_tab_brain}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          
          {activeTab === 'strategy' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8">
               
               {/* Language Selection Logic */}
               <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Languages size={18} className="text-primary"/> {t.ui_language}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {languages.map((lang) => (
                        <button 
                          key={lang.code}
                          onClick={() => changeAppLang(lang.code)} 
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${appLang === lang.code ? 'bg-primary/10 border-primary text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                        >
                            <span className="text-2xl">{lang.flag}</span>
                            <span className="font-black uppercase text-[9px] text-center">{lang.label}</span>
                            {appLang === lang.code && <Check size={12} className="text-primary" />}
                        </button>
                      ))}
                  </div>
               </div>

               <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Globe size={18} className="text-blue-400"/> {t.content_language}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {languages.map((lang) => (
                        <button 
                          key={lang.code}
                          onClick={() => setContentLanguage(lang.code as any)} 
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${contentLanguage === lang.code ? 'bg-blue-600/10 border-blue-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                        >
                            <span className="text-2xl">{lang.flag}</span>
                            <span className="font-black uppercase text-[9px] text-center">{lang.label}</span>
                            {contentLanguage === lang.code && <Check size={12} className="text-blue-400" />}
                        </button>
                      ))}
                  </div>
               </div>

               <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><Gauge className="text-amber-500"/> {t.settings_strategy_gate}</h3>
                  <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded border border-green-500/20 animate-pulse">{t.settings_sync_active}</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                      <div className="flex justify-between items-center">
                          <label className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2"><Target size={16} className="text-primary"/> {t.settings_consistency}</label>
                          <button onClick={() => updateStrategy('enforceConsistency', !knowledgeBase.globalStrategyRules.enforceConsistency)} className={`p-2 rounded-lg transition-all ${knowledgeBase.globalStrategyRules.enforceConsistency ? 'bg-primary text-white shadow-neon' : 'bg-slate-800 text-slate-500'}`}>
                             <ShieldCheck size={18} />
                          </button>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic">
                        {appLang === 'vi' ? 'Ép buộc AI sử dụng cùng một bộ phong cách hình ảnh cho tất cả các scene.' : 'Forces AI to use the same set of visual styles for all scenes in a video.'}
                      </p>
                  </div>

                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                      <div className="flex justify-between items-center">
                          <label className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2"><Share2 size={16} className="text-blue-500"/> {t.settings_continuity}</label>
                          <button onClick={() => updateStrategy('seamlessTransitionLogic', !knowledgeBase.globalStrategyRules.seamlessTransitionLogic)} className={`p-2 rounded-lg transition-all ${knowledgeBase.globalStrategyRules.seamlessTransitionLogic ? 'bg-blue-600 text-white shadow-neon' : 'bg-slate-800 text-slate-500'}`}>
                             <RotateCcw size={18} />
                          </button>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic">
                        {appLang === 'vi' ? 'Kích hoạt logic nối cảnh bằng kỹ thuật Match-cut để giữ chân khán giả.' : 'Activates transition logic using Match-cut techniques to maximize retention.'}
                      </p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;
