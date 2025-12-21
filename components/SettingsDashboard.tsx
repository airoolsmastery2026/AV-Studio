
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
                  <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => changeAppLang('vi')} className={`flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all ${appLang === 'vi' ? 'bg-primary/10 border-primary text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                          <span className="font-black uppercase text-xs">🇻🇳 {t.lang_vi}</span>
                          {appLang === 'vi' && <Check size={16} />}
                      </button>
                      <button onClick={() => changeAppLang('en')} className={`flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all ${appLang === 'en' ? 'bg-primary/10 border-primary text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                          <span className="font-black uppercase text-xs">🇺🇸 {t.lang_en}</span>
                          {appLang === 'en' && <Check size={16} />}
                      </button>
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
                      <p className="text-[10px] text-slate-500 leading-relaxed italic">{appLang === 'vi' ? 'Ép buộc AI sử dụng cùng một bộ phong cách hình ảnh cho tất cả các scene.' : 'Forces AI to use the same set of visual styles for all scenes in a video.'}</p>
                  </div>

                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                      <div className="flex justify-between items-center">
                          <label className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2"><Share2 size={16} className="text-blue-500"/> {t.settings_continuity}</label>
                          <button onClick={() => updateStrategy('seamlessTransitionLogic', !knowledgeBase.globalStrategyRules.seamlessTransitionLogic)} className={`p-2 rounded-lg transition-all ${knowledgeBase.globalStrategyRules.seamlessTransitionLogic ? 'bg-blue-600 text-white shadow-neon' : 'bg-slate-800 text-slate-500'}`}>
                             <RotateCcw size={18} />
                          </button>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic">{appLang === 'vi' ? 'Kích hoạt logic nối cảnh bằng kỹ thuật Match-cut để giữ chân khán giả.' : 'Activates transition logic using Match-cut techniques to maximize retention.'}</p>
                  </div>
               </div>

               <div className="bg-slate-950 p-8 rounded-[32px] border border-slate-800 space-y-6">
                   <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Rocket size={16} className="text-accent" /> {t.settings_viral_formula}</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {[
                           { id: 'f_01', name: appLang === 'vi' ? 'Infinite Loop (Vòng lặp)' : 'Infinite Loop', desc: appLang === 'vi' ? 'Tăng 30% tỷ lệ xem lại nhờ cảnh cuối nối cảnh đầu.' : 'Increase re-watch rate by 30% by matching start and end.' },
                           { id: 'f_02', name: appLang === 'vi' ? 'Pain-Solution (Nỗi đau)' : 'Pain-Solution', desc: appLang === 'vi' ? 'Đánh vào tâm lý khách hàng và đưa ra giải pháp AI.' : 'Target customer pain points and present AI solutions.' }
                       ].map(f => (
                           <button 
                             key={f.id} 
                             onClick={() => updateStrategy('viralFormulaId', f.id)}
                             className={`text-left p-6 rounded-2xl border-2 transition-all group ${knowledgeBase.globalStrategyRules.viralFormulaId === f.id ? 'bg-accent/10 border-accent shadow-neon' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                           >
                               <h5 className={`text-xs font-black uppercase mb-2 ${knowledgeBase.globalStrategyRules.viralFormulaId === f.id ? 'text-accent' : 'text-white'}`}>{f.name}</h5>
                               <p className="text-[10px] text-slate-500 group-hover:text-slate-400 font-medium">{f.desc}</p>
                           </button>
                       ))}
                   </div>
               </div>

               <div className="bg-slate-950 p-8 rounded-[32px] border border-slate-800 space-y-6">
                   <div className="flex justify-between items-center">
                       <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Cpu size={16} className="text-purple-500" /> {t.settings_algo_intensity}</h4>
                       <span className="text-xl font-black text-purple-500">{knowledgeBase.globalStrategyRules.algorithmOptimizationLevel}%</span>
                   </div>
                   <input 
                       type="range" 
                       min="0" max="100" 
                       value={knowledgeBase.globalStrategyRules.algorithmOptimizationLevel}
                       onChange={(e) => updateStrategy('algorithmOptimizationLevel', parseInt(e.target.value))}
                       className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
                   />
                   <div className="flex justify-between text-[9px] text-slate-600 font-black uppercase">
                       <span>{t.settings_creative}</span>
                       <span>{t.settings_algorithmic}</span>
                   </div>
               </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8">
               <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><Cpu className="text-purple-500"/> AI Neural Models</h3>
               </div>
               <div className="text-center py-20 opacity-20 italic">Key Management Module...</div>
            </div>
          )}

          {activeTab === 'brain' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8">
               <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><Brain className="text-primary"/> Brain Training</h3>
               </div>
               <div className="text-center py-20 opacity-20 italic">Machine Learning Preferences...</div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-950 border border-slate-800 rounded-[40px] p-8 shadow-2xl">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3"><ShieldCheck size={18} className="text-primary" /> {t.settings_health}</h3>
              <div className="space-y-4">
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500"><Check size={20}/></div>
                      <div>
                          <div className="text-[10px] text-slate-500 font-black uppercase">System Sync</div>
                          <div className="text-xs text-white font-bold">ALL MODULES LINKED</div>
                      </div>
                  </div>
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Zap size={20}/></div>
                      <div>
                          <div className="text-[10px] text-slate-500 font-black uppercase">Viral Force</div>
                          <div className="text-xs text-white font-bold">PEAK OPTIMIZATION</div>
                      </div>
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;
