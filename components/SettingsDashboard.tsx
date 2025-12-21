import React, { useState } from 'react';
import { 
  Cpu, Database, Save, Trash2, Plus, X,
  Brain, Shield, RefreshCw, Key, 
  ChevronDown, ChevronUp, Check, 
  Terminal, Sparkles, BookOpen, Layers,
  Youtube, ShoppingBag, Languages, Zap, Sliders, AlertTriangle, KeyIcon,
  Facebook, Music, Globe, Info, Eye, EyeOff, Loader2
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
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  
  // New Key Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState<Partial<ApiKeyConfig>>({
    provider: 'google',
    category: 'model',
    alias: '',
    key: ''
  });
  const [showKey, setShowKey] = useState<string | null>(null);

  const handleAddKey = () => {
    if (!newKey.key || !newKey.alias) {
      alert("Vui lòng nhập đầy đủ Alias và API Key.");
      return;
    }

    const keyConfig: ApiKeyConfig = {
      id: crypto.randomUUID(),
      alias: newKey.alias || 'Unnamed Key',
      key: newKey.key || '',
      provider: newKey.provider as any || 'google',
      category: newKey.category as any || 'model',
      status: 'active',
      lastUsed: new Date().toISOString()
    };

    const updatedKeys = [...apiKeys, keyConfig];
    setApiKeys(updatedKeys);
    localStorage.setItem('av_studio_secure_vault_v1', JSON.stringify(updatedKeys));
    
    setNewKey({ provider: 'google', category: 'model', alias: '', key: '' });
    setShowAddForm(false);
  };

  const handleTrainBrain = async () => {
    if (!trainingText.trim()) return;
    
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
    if (!googleKey) {
      alert("Cần Google API Key để huấn luyện Trí não AI.");
      return;
    }

    setIsSynthesizing(true);
    try {
      const newPrefs = await synthesizeKnowledge(googleKey.key, trainingText, knowledgeBase.learnedPreferences);
      const updatedKB = {
        ...knowledgeBase,
        learnedPreferences: [...new Set([...knowledgeBase.learnedPreferences, ...newPrefs])],
        lastUpdated: Date.now()
      };
      setKnowledgeBase(updatedKB);
      localStorage.setItem('av_studio_brain_v1', JSON.stringify(updatedKB));
      setTrainingText('');
      alert("Trí não đã được cập nhật với kiến thức mới!");
    } catch (e) {
      console.error(e);
      alert("Lỗi khi huấn luyện trí não.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const deleteKey = (id: string) => {
    const updated = apiKeys.filter(k => k.id !== id);
    setApiKeys(updated);
    localStorage.setItem('av_studio_secure_vault_v1', JSON.stringify(updated));
  };

  const removePreference = (pref: string) => {
    const updatedKB = {
      ...knowledgeBase,
      learnedPreferences: knowledgeBase.learnedPreferences.filter(p => p !== pref),
      lastUpdated: Date.now()
    };
    setKnowledgeBase(updatedKB);
    localStorage.setItem('av_studio_brain_v1', JSON.stringify(updatedKB));
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'youtube': return <Youtube size={18} className="text-red-500" />;
      case 'facebook': return <Facebook size={18} className="text-blue-500" />;
      case 'tiktok': return <Music size={18} className="text-teal-400" />;
      case 'google': return <Globe size={18} className="text-blue-400" />;
      default: return <KeyIcon size={18} className="text-slate-500" />;
    }
  };

  const getInstructions = (provider: string) => {
    switch (provider) {
      case 'youtube': return "Google Cloud Console &rarr; API & Services &rarr; YouTube Data API v3 &rarr; Credentials.";
      case 'tiktok': return "TikTok for Developers &rarr; My Apps &rarr; Client Key & Access Token.";
      case 'facebook': return "Meta for Developers &rarr; App Dashboard &rarr; Tools &rarr; Graph API Explorer.";
      case 'google': return "Google AI Studio &rarr; Create API Key.";
      default: return "Vui lòng nhập mã bảo mật được cấp từ nhà cung cấp dịch vụ.";
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-xl">
           <Terminal size={32} className="text-primary" />
        </div>
        <div>
           <h2 className="text-3xl font-bold text-white">{texts.settings || "System Intelligence Hub"}</h2>
           <p className="text-slate-400">Configure global parameters, social connections, and AI brain training.</p>
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
                ? 'bg-slate-900 text-primary border-t border-x border-slate-800 shadow-[0_-4px_10px_rgba(14,165,164,0.1)]' 
                : 'text-slate-500 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 min-h-[500px] shadow-2xl backdrop-blur-sm">
        
        {activeTab === 'system' && (
            <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-8">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><Languages size={100} /></div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Languages size={18} className="text-primary" /> {texts.ui_lang || "UI LANGUAGE SELECTION"}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { id: 'vi', label: 'VIỆT NAM', icon: '🇻🇳' },
                                { id: 'en', label: 'ENGLISH', icon: '🇺🇸' },
                                { id: 'jp', label: '日本語', icon: '🇯🇵' },
                                { id: 'es', label: 'ESPAÑOL', icon: '🇲🇽' },
                                { id: 'cn', label: '中文', icon: '🇨🇳' }
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
                                    {texts.lang_desc || "Cài đặt này độc lập với giao diện. Nó ảnh hưởng trực tiếp đến ngôn ngữ kịch bản và giọng đọc AI (TTS) khi Render."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'vault' && (
            <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
                {/* VAULT HEADER & ADD ACTION */}
                <div className="flex justify-between items-center bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
                    <div>
                        <h3 className="text-xl font-black text-white flex items-center gap-3"><Shield size={24} className="text-red-500" /> API Security Vault</h3>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Kết nối mạng xã hội và các mô hình AI</p>
                    </div>
                    <button 
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary border border-primary/20 rounded-xl font-black text-xs hover:bg-primary hover:text-white transition-all shadow-neon-hover"
                    >
                      {showAddForm ? <X size={16} /> : <Plus size={16} />}
                      {showAddForm ? 'HUỶ BỎ' : 'THÊM KẾT NỐI MỚI'}
                    </button>
                </div>

                {/* ADD NEW KEY FORM */}
                {showAddForm && (
                  <div className="bg-slate-950 border border-primary/30 rounded-2xl p-8 shadow-2xl animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Plus size={120} /></div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Thêm Thông tin xác thực mới</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block tracking-widest">Dịch vụ (Provider)</label>
                          <select 
                            value={newKey.provider}
                            onChange={(e) => {
                              const provider = e.target.value;
                              const category = ['google', 'openai'].includes(provider) ? 'model' : 'social';
                              setNewKey({...newKey, provider: provider as any, category: category as any});
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-white outline-none focus:border-primary transition-all font-bold"
                          >
                            <optgroup label="AI Models" className="bg-slate-950">
                              <option value="google">Google Gemini (3.0 Pro / 2.5 Flash)</option>
                              <option value="openai">OpenAI (GPT-4o / Sora)</option>
                            </optgroup>
                            <optgroup label="Social Platforms" className="bg-slate-950">
                              <option value="youtube">YouTube (Shorts API)</option>
                              <option value="tiktok">TikTok (Content Posting API)</option>
                              <option value="facebook">Facebook (Graph API / Reels)</option>
                            </optgroup>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block tracking-widest">Tên định danh (Alias)</label>
                          <input 
                            type="text"
                            value={newKey.alias}
                            onChange={(e) => setNewKey({...newKey, alias: e.target.value})}
                            placeholder="VD: My YouTube Channel A"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-white outline-none focus:border-primary transition-all font-bold"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block tracking-widest">API Key / Access Token</label>
                          <div className="relative">
                            <input 
                              type="password"
                              value={newKey.key}
                              onChange={(e) => setNewKey({...newKey, key: e.target.value})}
                              placeholder={newKey.provider === 'youtube' ? 'AIzaSy...' : 'Ghi mã truy cập vào đây...'}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 pr-12 text-xs text-white outline-none focus:border-primary transition-all font-mono"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600">
                              <Shield size={18} />
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex gap-3">
                          <Info size={16} className="text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-1">Hướng dẫn lấy mã:</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed italic" dangerouslySetInnerHTML={{ __html: getInstructions(newKey.provider || 'google') }}></p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <NeonButton onClick={handleAddKey} className="w-full h-14">
                      LƯU KẾT NỐI VÀO VAULT
                    </NeonButton>
                  </div>
                )}

                {/* KEY LISTING */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Kết nối hiện có ({apiKeys.length})</h4>
                    <div className="space-y-4">
                        {apiKeys.length === 0 ? (
                            <div className="text-center py-16 text-slate-700 italic border-2 border-dashed border-slate-800 rounded-2xl">
                                <Database size={40} className="mx-auto mb-3 opacity-20" />
                                <p className="text-xs font-black uppercase">Chưa có thông tin xác thực nào trong Vault.</p>
                            </div>
                        ) : (
                            apiKeys.map(k => (
                                <div key={k.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex justify-between items-center group hover:border-slate-600 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 shadow-inner group-hover:scale-110 transition-transform">
                                            {getProviderIcon(k.provider)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                                              {k.alias}
                                              <span className={`text-[8px] px-1.5 py-0.5 rounded border font-black ${
                                                k.category === 'model' ? 'text-purple-400 border-purple-900/50 bg-purple-900/10' : 'text-blue-400 border-blue-900/50 bg-blue-900/10'
                                              }`}>
                                                {k.category.toUpperCase()}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1.5">
                                              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                <span className="text-primary opacity-50">STATUS:</span> {k.status}
                                              </div>
                                              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                <span className="text-primary opacity-50">KEY:</span> 
                                                <button 
                                                  onClick={() => setShowKey(showKey === k.id ? null : k.id)}
                                                  className="hover:text-white flex items-center gap-1"
                                                >
                                                  {showKey === k.id ? k.key : '••••••••••••••••'}
                                                  {showKey === k.id ? <EyeOff size={10}/> : <Eye size={10}/>}
                                                </button>
                                              </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => deleteKey(k.id)}
                                        className="p-3 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                        title="Xoá kết nối"
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
             <div className="animate-fade-in max-w-5xl mx-auto space-y-10 py-4">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* BRAIN TRAINING INPUT */}
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden h-fit">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full"></div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400 shadow-neon">
                                <Brain size={24} />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">AI Knowledge Base Training</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed uppercase tracking-wider">Dạy hệ thống về phong cách viết kịch bản, thị hiếu khán giả hoặc các kiến thức độc quyền để Video luôn có nét đặc trưng cá nhân.</p>
                        
                        <textarea 
                            value={trainingText}
                            onChange={(e) => setTrainingText(e.target.value)}
                            placeholder="VD: 'Khán giả của tôi thích phong cách nhanh, dứt khoát và thường sử dụng tiếng lóng GenZ. Đừng bao giờ bắt đầu video bằng lời chào quá dài dòng...'"
                            className="w-full h-64 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-sm text-white focus:border-primary outline-none mb-6 resize-none shadow-inner"
                        />
                        
                        <NeonButton onClick={handleTrainBrain} disabled={!trainingText || isSynthesizing} className="w-full h-14">
                            {isSynthesizing ? (
                              <span className="flex items-center gap-3"><Loader2 className="animate-spin" /> ĐANG TỔNG HỢP KIẾN THỨC...</span>
                            ) : (
                              <span className="flex items-center gap-2"><Sparkles size={18} /> {texts.save_brain || "TỔNG HỢP VÀO TRÍ NÃO"}</span>
                            )}
                        </NeonButton>
                    </div>

                    {/* LEARNED PREFERENCES */}
                    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col h-[520px]">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                           <Zap size={18} className="text-yellow-500" /> Learned Preferences ({knowledgeBase.learnedPreferences.length})
                        </h3>
                        
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {knowledgeBase.learnedPreferences.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                    <Brain size={48} className="mb-4" />
                                    <p className="text-xs font-black uppercase tracking-widest">Trí não hiện đang trống.</p>
                                </div>
                            ) : (
                                knowledgeBase.learnedPreferences.map((pref, i) => (
                                    <div key={i} className="group bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-start gap-3 hover:border-slate-600 transition-all animate-fade-in">
                                        <p className="text-xs text-slate-300 leading-relaxed italic">"{pref}"</p>
                                        <button 
                                          onClick={() => removePreference(pref)}
                                          className="text-slate-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono uppercase">
                            <span>Last Updated: {new Date(knowledgeBase.lastUpdated).toLocaleString()}</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${knowledgeBase.autoImprovementEnabled ? 'bg-green-500 shadow-neon' : 'bg-slate-700'}`}></div>
                                Auto-Improvement: {knowledgeBase.autoImprovementEnabled ? 'ON' : 'OFF'}
                            </div>
                        </div>
                    </div>
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default SettingsDashboard;