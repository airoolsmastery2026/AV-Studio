
import React, { useState, useEffect } from 'react';
import { 
  Cpu, Database, Save, Trash2, Plus, 
  Brain, Shield, RefreshCw, Key, 
  ChevronDown, ChevronUp, Check, 
  Terminal, Sparkles, BookOpen, Layers,
  Youtube, ShoppingBag, Languages, Zap, Sliders, AlertTriangle, KeyIcon
} from 'lucide-react';
import NeonButton from './NeonButton';
import { ApiKeyConfig, KnowledgeBase, AppLanguage, ContentLanguage } from '../types';
import { synthesizeKnowledge } from '../services/geminiService';

interface SettingsDashboardProps {
  apiKeys: ApiKeyConfig[];
  setApiKeys: (keys: ApiKeyConfig[]) => void;
  knowledgeBase: KnowledgeBase;
  setKnowledgeBase: (kb: KnowledgeBase) => void;
  t?: any;
  appLang: AppLanguage;
  setAppLang: (lang: AppLanguage) => void;
  contentLanguage: ContentLanguage;
  setContentLanguage: (lang: ContentLanguage) => void;
}

const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ 
  apiKeys, setApiKeys, knowledgeBase, setKnowledgeBase, t,
  appLang, setAppLang, contentLanguage, setContentLanguage
}) => {
  const texts = t || {};
  const [activeTab, setActiveTab] = useState<'brain' | 'vault' | 'system'>('system');
  const [trainingText, setTrainingText] = useState('');

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-xl">
           <Terminal size={32} className="text-primary" />
        </div>
        <div>
           <h2 className="text-3xl font-bold text-white">{texts.settings || "System Intelligence Hub"}</h2>
           <p className="text-slate-400">Configure global parameters, languages, and AI brain training.</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-800 pb-1 overflow-x-auto custom-scrollbar">
        {[
          { id: 'system', label: 'Systems & Language', icon: Sliders },
          { id: 'vault', label: 'API Security Vault', icon: Shield },
          { id: 'brain', label: 'AI Knowledge Base', icon: Brain },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-t-xl text-sm font-black uppercase tracking-tighter flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-slate-900 text-primary border-t border-x border-slate-800' 
                : 'text-slate-500 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 min-h-[500px] shadow-2xl">
        
        {activeTab === 'system' && (
            <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* UI LANGUAGE CONFIG */}
                <div className="space-y-8">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><Languages size={100} /></div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Languages size={18} className="text-primary" /> {texts.ui_lang || "UI LANGUAGE SELECTION"}
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { id: 'vi', label: 'VIỆT NAM (Default)', icon: '🇻🇳' },
                                { id: 'en', label: 'ENGLISH (Global)', icon: '🇺🇸' },
                                { id: 'jp', label: '日本語 (Japan)', icon: '🇯🇵' },
                                { id: 'es', label: 'ESPAÑOL (Latam)', icon: '🇲🇽' },
                                { id: 'cn', label: '中文 (Simplified)', icon: '🇨🇳' }
                            ].map(lang => (
                                <button 
                                    key={lang.id}
                                    onClick={() => setAppLang(lang.id as AppLanguage)}
                                    className={`px-4 py-4 rounded-xl text-xs font-black border transition-all flex items-center justify-between group ${appLang === lang.id ? 'bg-primary border-primary text-white shadow-neon scale-[1.02]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                                >
                                    <span>{lang.icon} {lang.label}</span>
                                    {appLang === lang.id && <Check size={16} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CONTENT LANGUAGE CONFIG */}
                <div className="space-y-8">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 p-4 opacity-5 rotate-12"><Sparkles size={100} /></div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Zap size={18} className="text-yellow-500" /> {texts.content_lang || "PRODUCTION ENGINE LANGUAGE"}
                        </h3>
                        
                        <div className="space-y-6">
                            <select 
                                value={contentLanguage}
                                onChange={(e) => setContentLanguage(e.target.value as ContentLanguage)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-white font-black uppercase tracking-tighter focus:border-primary outline-none shadow-inner"
                            >
                                <option value="vi">VIETNAMESE ENGINE</option>
                                <option value="en">ENGLISH ENGINE</option>
                                <option value="jp">JAPANESE ENGINE</option>
                                <option value="es">SPANISH ENGINE</option>
                                <option value="cn">CHINESE ENGINE</option>
                            </select>
                            
                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                    <AlertTriangle size={12} className="inline mr-1 text-yellow-500" />
                                    {texts.lang_desc || "Cài đặt này độc lập với giao diện. Nó ảnh hưởng trực tiếp đến ngôn ngữ kịch bản trích xuất DNA và giọng đọc AI (TTS) khi Render."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'vault' && (
            <div className="animate-fade-in max-w-4xl mx-auto">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3"><Shield size={24} className="text-red-500" /> Secure Key Management</h3>
                    <div className="space-y-4">
                        {apiKeys.length === 0 ? (
                            <div className="text-center py-20 text-slate-600 italic border-2 border-dashed border-slate-800 rounded-2xl">
                                Vault is currently empty.
                            </div>
                        ) : (
                            apiKeys.map(k => (
                                <div key={k.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex justify-between items-center group hover:border-slate-600 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-500 group-hover:text-primary transition-colors"><KeyIcon size={20}/></div>
                                        <div>
                                            <div className="text-sm font-black text-white uppercase tracking-tight">{k.alias}</div>
                                            <div className="text-[10px] font-mono text-slate-500 mt-1 uppercase">{k.provider} • {k.category} • {k.status}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setApiKeys(apiKeys.filter(key => key.id !== k.id))}
                                        className="p-3 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'brain' && (
             <div className="animate-fade-in max-w-2xl mx-auto">
                 <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full"></div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400 shadow-neon">
                            <Brain size={24} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">AI Knowledge Base</h3>
                    </div>
                    <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed uppercase tracking-wider">Dạy hệ thống về phong cách viết kịch bản, thị hiếu khán giả hoặc các kiến thức độc quyền để Video luôn có nét đặc trưng cá nhân.</p>
                    
                    <textarea 
                        value={trainingText}
                        onChange={(e) => setTrainingText(e.target.value)}
                        placeholder="VD: 'Khán giả của tôi thích phong cách nhanh, dứt khoát và thường sử dụng tiếng lóng GenZ...'"
                        className="w-full h-48 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-sm text-white focus:border-primary outline-none mb-6 resize-none shadow-inner"
                    />
                    
                    <NeonButton onClick={() => setTrainingText('')} disabled={!trainingText} className="w-full h-14">
                        {texts.save_brain || "SAVE TO BRAIN"}
                    </NeonButton>
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default SettingsDashboard;
