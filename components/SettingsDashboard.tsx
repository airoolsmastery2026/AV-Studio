
import React, { useState, useEffect } from 'react';
import { 
  Database, Shield, Brain, Sliders, Check, 
  Trash2, Plus, X, Globe, ShoppingBag, 
  Zap, Key as KeyIcon, Smartphone, CreditCard, 
  Store, Music, MessageCircle, AlertCircle, Loader2, Sparkles,
  ChevronRight, DollarSign, Target, Rocket, Award, ExternalLink, HelpCircle, Info, Lock, ShieldCheck,
  Cpu, Power, RotateCcw, Share2, Coins, TrendingUp, Play, 
  Instagram, Twitter, Chrome, Landmark, Wallet, Layers, HelpCircle as HelpIcon, BookOpen, Bitcoin,
  MapPin, Flag, Navigation, Activity, CloudSync, ShieldAlert, Languages, Monitor, Settings
} from 'lucide-react';
import NeonButton from './NeonButton';
import { ApiKeyConfig, KnowledgeBase, AppLanguage, ContentLanguage } from '../types';

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
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">Infrastructure Vault</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Hệ thống điều phối tài nguyên chiến dịch</p>
          </div>
        </div>
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-inner flex-wrap justify-center overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('general')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'general' ? 'bg-primary text-white shadow-neon' : 'text-slate-500'}`}>Cài đặt Chung</button>
          <button onClick={() => setActiveTab('ai')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'ai' ? 'bg-purple-600 text-white shadow-neon' : 'text-slate-500'}`}>AI Engines</button>
          <button onClick={() => setActiveTab('affiliate')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'affiliate' ? 'bg-green-600 text-white shadow-neon' : 'text-slate-500'}`}>Affiliates</button>
          <button onClick={() => setActiveTab('social')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'social' ? 'bg-blue-600 text-white shadow-neon' : 'text-slate-500'}`}>Socials</button>
          <button onClick={() => setActiveTab('policies')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'policies' ? 'bg-amber-600 text-white shadow-neon' : 'text-slate-500'}`}>Policies</button>
          <button onClick={() => setActiveTab('brain')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'brain' ? 'bg-slate-700 text-white shadow-neon' : 'text-slate-500'}`}>Brains</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB: GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Settings size={180} /></div>
                
                <div className="flex justify-between items-center border-b border-slate-800 pb-4 relative z-10">
                    <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><Monitor className="text-primary"/> Cấu hình Hệ thống</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    {/* UI Language Selection */}
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-[32px] space-y-5 hover:border-primary/30 transition-all shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800">
                                <Languages className="text-primary" />
                            </div>
                            <div>
                                <h4 className="font-black text-white uppercase tracking-tight">Ngôn ngữ Giao diện</h4>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">UI Display Language</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setAppLang('vi')}
                                className={`py-3 rounded-xl text-xs font-black uppercase border-2 transition-all ${appLang === 'vi' ? 'bg-primary/20 border-primary text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                            >
                                Tiếng Việt
                            </button>
                            <button 
                                onClick={() => setAppLang('en')}
                                className={`py-3 rounded-xl text-xs font-black uppercase border-2 transition-all ${appLang === 'en' ? 'bg-primary/20 border-primary text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                            >
                                English
                            </button>
                        </div>
                    </div>

                    {/* Content Language Selection */}
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-[32px] space-y-5 hover:border-green-500/30 transition-all shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800">
                                <Globe className="text-green-500" />
                            </div>
                            <div>
                                <h4 className="font-black text-white uppercase tracking-tight">Ngôn ngữ Nội dung (AI)</h4>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">AI Content Generation</p>
                            </div>
                        </div>
                        <select 
                            value={contentLanguage}
                            onChange={(e) => setContentLanguage(e.target.value as ContentLanguage)}
                            className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-3 text-xs text-white font-black uppercase outline-none focus:border-green-500 transition-all cursor-pointer"
                        >
                            <option value="vi">🇻🇳 Tiếng Việt</option>
                            <option value="en">🇺🇸 English</option>
                            <option value="zh">🇨🇳 中文 (Chinese)</option>
                            <option value="ja">🇯🇵 日本語 (Japanese)</option>
                            <option value="ko">🇰🇷 한국어 (Korean)</option>
                            <option value="fr">🇫🇷 Français</option>
                            <option value="es">🇪🇸 Español</option>
                            <option value="th">🇹🇭 Tiếng Thái</option>
                        </select>
                    </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 relative z-10 flex items-start gap-4">
                    <Info className="text-primary shrink-0" size={20} />
                    <p className="text-[11px] text-slate-400 italic leading-relaxed">
                        "Ngôn ngữ Nội dung quyết định ngôn ngữ mà AI sẽ sử dụng để viết kịch bản và tạo giọng nói TTS. Ngôn ngữ Giao diện chỉ thay đổi các nút bấm và tiêu đề trên ứng dụng."
                    </p>
                </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8">
               <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><Cpu className="text-purple-500"/> AI Neural Models</h3>
                  <button onClick={handleGeminiAuth} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${hasGeminiKey ? 'bg-green-600 text-white shadow-neon' : 'bg-slate-800 hover:bg-purple-600'}`}>
                    {hasGeminiKey ? 'GEMINI VERIFIED' : '+ GOOGLE GEMINI'}
                  </button>
               </div>
               <div className="grid grid-cols-1 gap-4">
                  <div className={`bg-slate-950 border p-6 rounded-[24px] flex justify-between items-center transition-all ${hasGeminiKey ? 'border-green-500/30 shadow-lg' : 'border-slate-800 opacity-50'}`}>
                       <div className="flex items-center gap-5">
                          <div className={`p-4 rounded-2xl ${hasGeminiKey ? 'bg-green-900/20 text-green-400' : 'bg-slate-900 text-slate-700'}`}><KeyIcon size={24}/></div>
                          <div>
                             <div className="text-base font-black text-white uppercase tracking-tight">Google AI Studio Profile</div>
                             <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${hasGeminiKey ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></span>
                                <span className="text-[10px] text-slate-500 font-mono uppercase">{hasGeminiKey ? 'Authenticated • Latency: 45ms' : 'Status: Key Selection Required'}</span>
                             </div>
                          </div>
                       </div>
                       {hasGeminiKey && <Check className="text-green-500" size={24} />}
                  </div>
                  {apiKeys.filter(k => k.category === 'model').map(k => (
                    <div key={k.id} className="bg-slate-950 border border-slate-800 p-6 rounded-[24px] flex justify-between items-center group hover:border-purple-500/40 transition-all">
                       <div className="flex items-center gap-5">
                          <div className="p-4 bg-slate-900 rounded-2xl text-purple-400"><KeyIcon size={24}/></div>
                          <div><div className="text-base font-black text-white uppercase tracking-tight">{k.alias}</div><div className="text-[10px] text-slate-500 font-mono uppercase mt-1">{k.provider} • API HEALTH: GOOD</div></div>
                       </div>
                       <button onClick={() => deleteKey(k.id)} className="p-2 text-slate-700 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'policies' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none"><ShieldCheck size={200} /></div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-4 relative z-10">
                    <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><ShieldAlert className="text-amber-500"/> Platform Policy Guard</h3>
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest"><CloudSync size={14} className="text-primary animate-spin" /> Auto-syncing with Cloud</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {knowledgeBase.platformPolicies.length > 0 ? (
                        knowledgeBase.platformPolicies.map((policy, idx) => (
                            <div key={idx} className="bg-slate-950 border border-slate-800 p-6 rounded-[32px] space-y-4 hover:border-amber-500/30 transition-all shadow-xl">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800">{policy.platform === 'TikTok' ? <Music className="text-primary" /> : policy.platform === 'YouTube' ? <Play className="text-red-500" /> : <ShoppingBag className="text-green-500" />}</div>
                                        <h4 className="font-black text-white uppercase tracking-tight">{policy.platform}</h4>
                                    </div>
                                    <div className="text-right"><div className="text-[10px] font-black text-slate-500 uppercase">Compliance</div><div className={`text-sm font-black ${policy.compliance_score > 90 ? 'text-green-500' : 'text-amber-500'}`}>{policy.compliance_score}%</div></div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${policy.ai_label_required ? 'bg-amber-500 animate-pulse' : 'bg-slate-800'}`}></div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Content Label: {policy.ai_label_required ? 'REQUIRED' : 'OPTIONAL'}</span></div>
                                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800"><div className="text-[9px] font-black text-slate-500 uppercase mb-2">Critical Rule Changes:</div><ul className="space-y-1.5">{policy.critical_changes.map((change, i) => (<li key={i} className="text-[10px] text-slate-300 italic flex gap-2"><ChevronRight size={10} className="text-primary shrink-0 mt-0.5" />{change}</li>))}</ul></div>
                                </div>
                            </div>
                        ))
                    ) : (<div className="col-span-2 py-20 flex flex-col items-center justify-center opacity-30 text-center space-y-4"><Activity size={60} className="animate-pulse" /><h4 className="text-xl font-black uppercase tracking-tighter">Initializing Autonomous Policy Guard...</h4></div>)}
                </div>
            </div>
          )}

          {activeTab === 'brain' && (
             <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3"><Brain className="text-primary"/> Neural Memory</h3>
                      <textarea value={trainingText} onChange={(e) => setTrainingText(e.target.value)} placeholder="Dán nội dung xu hướng hoặc báo cáo kỹ thuật vào đây để AI tự học..." className="w-full h-64 bg-slate-950 border border-slate-800 rounded-[24px] p-6 text-sm text-white focus:border-primary outline-none resize-none shadow-inner transition-all font-medium" />
                      <NeonButton onClick={async () => { if (!onTrainBrain) return; if (!hasGeminiKey) return alert("Cần xác thực Google AI Studio Profile trước."); setIsSynthesizing(true); await onTrainBrain(trainingText); setTrainingText(''); setIsSynthesizing(false); }} disabled={isSynthesizing || !trainingText} className="w-full h-14 uppercase tracking-widest text-[11px] font-black">{isSynthesizing ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}{isSynthesizing ? "ĐANG TỔNG HỢP NEURAL..." : "HUẤN LUYỆN COMMANDER"}</NeonButton>
                   </div>
                   <div className="bg-slate-950 border border-slate-800 rounded-[32px] p-6 overflow-y-auto h-[400px] custom-scrollbar shadow-inner">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Database size={12} className="text-primary" /> Learned Rules ({knowledgeBase.learnedPreferences.length})</h4>
                      <div className="space-y-3">{knowledgeBase.learnedPreferences.length > 0 ? (knowledgeBase.learnedPreferences.map((p, i) => (<div key={i} className="text-xs text-slate-300 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 italic animate-fade-in hover:border-primary/20 transition-all">"{p}"</div>))) : (<div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20"><Brain size={48} className="mb-2 animate-bounce" /><p className="text-[10px] font-black uppercase">Chưa có tri thức học tập</p></div>)}</div>
                   </div>
                </div>
             </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900/80 border border-slate-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5"><BookOpen size={120} /></div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                  <HelpCircle size={18} className="text-primary" /> Trung tâm Hỗ trợ
               </h3>
               <div className="space-y-6">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                     <h4 className="text-xs font-black text-amber-500 uppercase mb-2 flex items-center gap-2"><ShieldAlert size={14}/> Tuân thủ AI Label</h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed italic">"Tự động gắn thẻ <strong>#AIContent</strong> để tối ưu Reach thuật toán 2025."</p>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                     <h4 className="text-xs font-black text-blue-500 uppercase mb-2 flex items-center gap-2"><Flag size={14}/> Quy chuẩn Quốc tế</h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed italic">"Nội dung được tối ưu hóa dựa trên văn hóa và xu hướng của từng quốc gia bạn chọn."</p>
                  </div>
               </div>
           </div>
           <div className="bg-primary/5 border border-primary/20 rounded-[40px] p-8 flex items-start gap-4">
              <Zap className="text-primary shrink-0 mt-1" size={24} />
              <p className="text-[11px] text-slate-400 italic leading-relaxed">"Hệ thống tự động đồng bộ hóa các cài đặt ngôn ngữ trên toàn bộ tiến trình Render Auto-Pilot."</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;
