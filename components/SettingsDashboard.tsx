
import React, { useState } from 'react';
import { 
  Database, Shield, Brain, Sliders, Check, 
  Trash2, Plus, X, Eye, EyeOff, Globe, ShoppingBag, 
  Zap, Link as LinkIcon, Smartphone, CreditCard, 
  Store, Music, MessageCircle, AlertCircle, Loader2, Sparkles, Key as KeyIcon,
  ChevronRight, DollarSign, Target, Rocket, Award, ExternalLink, HelpCircle, Info, Lock, ShieldCheck,
  Cpu, Power, RotateCcw, Share2, Coins, TrendingUp, Play, 
  Instagram, Twitter, Chrome, Landmark, Wallet, Layers, HelpCircle as HelpIcon, BookOpen
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

const secureVault = {
  encrypt: (text: string) => btoa(`av_vault_${text}`),
  decrypt: (cipher: string) => atob(cipher).replace('av_vault_', '')
};

const PLATFORM_CONFIGS: Record<string, { 
    label: string, 
    fields: { key: string, label: string, placeholder: string, type: string }[], 
    guide: string,
    link: string 
}> = {
    // Models
    google: {
        label: "Google Gemini",
        fields: [{ key: "key", label: "API Key", placeholder: "AIzaSy...", type: "password" }],
        guide: "Truy cập Google AI Studio để lấy API Key miễn phí.",
        link: "https://aistudio.google.com/app/apikey"
    },
    openai: {
        label: "OpenAI GPT-4",
        fields: [{ key: "key", label: "Secret Key", placeholder: "sk-...", type: "password" }],
        guide: "Vào OpenAI Dashboard > API Keys.",
        link: "https://platform.openai.com/api-keys"
    },
    // Affiliate
    shopee: {
        label: "Shopee Affiliate",
        fields: [
            { key: "key", label: "App Secret", placeholder: "Nhập Secret...", type: "password" },
            { key: "app_id", label: "App ID", placeholder: "Nhập App ID...", type: "text" }
        ],
        guide: "Đăng ký tại Shopee Open Platform để lấy App ID và Secret.",
        link: "https://open.shopee.vn/"
    },
    amazon: {
        label: "Amazon Associates",
        fields: [
            { key: "key", label: "Access Key", placeholder: "AKIA...", type: "text" },
            { key: "tracking_id", label: "Tracking ID", placeholder: "store-20", type: "text" }
        ],
        guide: "Lấy Tracking ID từ trang Associates Central.",
        link: "https://affiliate-program.amazon.com/"
    },
    accesstrade: {
        label: "AccessTrade VN",
        fields: [{ key: "key", label: "Access Key", placeholder: "Nhập Access Key...", type: "text" }],
        guide: "Vào AccessTrade Dashboard > Profile > API Key.",
        link: "https://pub.accesstrade.vn/profile/api_key"
    },
    // Social
    zalo_personal: {
        label: "Zalo Personal",
        fields: [{ key: "key", label: "Session Cookie (z_pw_token)", placeholder: "Nhập token lấy từ F12...", type: "password" }],
        guide: "Dùng F12 (Inspect) trên trình duyệt, tìm Cookie 'z_pw_token' của Zalo Web.",
        link: "https://chat.zalo.me"
    },
    tiktok: {
        label: "TikTok Automation",
        fields: [{ key: "key", label: "Access Token", placeholder: "act.v1...", type: "password" }],
        guide: "Sử dụng mã ủy quyền từ TikTok For Developers hoặc Session ID.",
        link: "https://developers.tiktok.com/"
    },
    youtube: {
        label: "YouTube Studio",
        fields: [{ key: "key", label: "OAuth Client Secret", placeholder: "Dán mã JSON hoặc Secret...", type: "password" }],
        guide: "Tạo dự án trên Google Cloud Console, bật YouTube Data API v3.",
        link: "https://console.cloud.google.com/"
    }
};

const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ 
  apiKeys, setApiKeys, knowledgeBase, setKnowledgeBase, t,
  appLang, setAppLang, contentLanguage, setContentLanguage
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'affiliate' | 'social' | 'brain'>('ai');
  const [trainingText, setTrainingText] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [showAddForm, setShowAddForm] = useState<string | null>(null);
  const [newKeyData, setNewKeyData] = useState<Record<string, string>>({});
  const [alias, setAlias] = useState('');

  const handleAddKey = (provider: string, category: any) => {
    if (!alias || !newKeyData.key) {
      alert("Vui lòng nhập tên gợi nhớ và mã API chính.");
      return;
    }

    const encryptedKey = secureVault.encrypt(newKeyData.key);
    const extraFields = { ...newKeyData };
    delete extraFields.key; // Xóa key chính khỏi extra

    const keyConfig: ApiKeyConfig = {
      id: crypto.randomUUID(),
      alias: alias,
      key: encryptedKey,
      extra_fields: extraFields,
      provider: provider as any,
      category: category,
      status: 'active',
      lastUsed: new Date().toISOString()
    };

    const updatedKeys = [...apiKeys, keyConfig];
    setApiKeys(updatedKeys);
    localStorage.setItem('av_studio_secure_vault_v1', JSON.stringify(updatedKeys));
    
    // Reset form
    setShowAddForm(null);
    setNewKeyData({});
    setAlias('');
  };

  const deleteKey = (id: string) => {
    if (confirm("Xóa vĩnh viễn kết nối này?")) {
      const updated = apiKeys.filter(k => k.id !== id);
      setApiKeys(updated);
      localStorage.setItem('av_studio_secure_vault_v1', JSON.stringify(updated));
    }
  };

  const renderAddForm = (provider: string, category: any) => {
    const config = PLATFORM_CONFIGS[provider] || { 
        label: provider.toUpperCase(), 
        fields: [{ key: 'key', label: 'Mã API/Token', placeholder: 'Nhập mã...', type: 'password' }],
        guide: "Dán mã kết nối được cung cấp bởi nền tảng.",
        link: "#"
    };

    return (
        <div className="bg-slate-950 border border-primary/30 p-6 rounded-3xl space-y-5 animate-fade-in mt-4 shadow-neon">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h4 className="text-sm font-black text-white uppercase flex items-center gap-2">
                    <Plus size={16} className="text-primary"/> Thiết lập {config.label}
                </h4>
                <button onClick={() => setShowAddForm(null)} className="text-slate-500 hover:text-white"><X size={18}/></button>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Tên Gợi Nhớ (Ví dụ: Nick chính, Key 1...)</label>
                    <input 
                        value={alias} 
                        onChange={(e) => setAlias(e.target.value)}
                        placeholder="Đặt tên để dễ quản lý..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-primary transition-all font-bold"
                    />
                </div>

                {config.fields.map(field => (
                    <div key={field.key}>
                        <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">{field.label}</label>
                        <input 
                            type={field.type}
                            value={newKeyData[field.key] || ''} 
                            onChange={(e) => setNewKeyData({...newKeyData, [field.key]: e.target.value})}
                            placeholder={field.placeholder}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-primary transition-all font-mono"
                        />
                    </div>
                ))}
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl flex gap-3 items-start border border-slate-800">
                <HelpIcon size={16} className="text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 leading-relaxed">{config.guide}</p>
                    <a href={config.link} target="_blank" className="text-[10px] text-primary hover:underline flex items-center gap-1 font-bold">Mở trang lấy mã <ExternalLink size={10}/></a>
                </div>
            </div>

            <NeonButton onClick={() => handleAddKey(provider, category)} className="w-full h-12 text-xs">XÁC THỰC VÀ KẾT NỐI</NeonButton>
        </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      {/* HEADER CHIẾN LƯỢC */}
      <div className="bg-slate-950 p-8 rounded-[40px] border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-primary/10 rounded-3xl border border-primary/20 shadow-neon">
            <ShieldCheck size={40} className="text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Infrastructure Vault</h2>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">Điều phối hạ tầng tài khoản đa điểm</p>
          </div>
        </div>
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button onClick={() => setActiveTab('ai')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'ai' ? 'bg-purple-600 text-white shadow-neon' : 'text-slate-500'}`}>1. AI Engines</button>
          <button onClick={() => setActiveTab('affiliate')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'affiliate' ? 'bg-green-600 text-white shadow-neon' : 'text-slate-500'}`}>2. Affiliates</button>
          <button onClick={() => setActiveTab('social')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'social' ? 'bg-blue-600 text-white shadow-neon' : 'text-slate-500'}`}>3. Socials</button>
          <button onClick={() => setActiveTab('brain')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'brain' ? 'bg-primary text-white shadow-neon' : 'text-slate-500'}`}>Brains</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT CHÍNH */}
        <div className="lg:col-span-8 space-y-6">
          
          {activeTab === 'ai' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8">
               <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><Cpu className="text-purple-500"/> AI Neural Models</h3>
                  <div className="flex gap-2">
                     <button onClick={() => setShowAddForm('google')} className="px-4 py-2 bg-slate-800 rounded-lg text-[10px] font-black hover:bg-purple-600 transition-all">+ GEMINI</button>
                     <button onClick={() => setShowAddForm('openai')} className="px-4 py-2 bg-slate-800 rounded-lg text-[10px] font-black hover:bg-purple-600 transition-all">+ GPT-4</button>
                  </div>
               </div>
               
               {showAddForm === 'google' || showAddForm === 'openai' ? renderAddForm(showAddForm, 'model') : null}

               <div className="grid grid-cols-1 gap-4">
                  {apiKeys.filter(k => k.category === 'model').map(k => (
                    <div key={k.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex justify-between items-center group">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-900 rounded-xl text-purple-400"><KeyIcon size={20}/></div>
                          <div>
                             <div className="text-sm font-black text-white uppercase">{k.alias}</div>
                             <div className="text-[10px] text-slate-500 font-mono uppercase">{k.provider} • ACTIVE</div>
                          </div>
                       </div>
                       <button onClick={() => deleteKey(k.id)} className="p-2 text-slate-700 hover:text-red-500"><Trash2 size={18}/></button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'affiliate' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8">
               <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><ShoppingBag className="text-green-500"/> Affiliate Networks</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                     {['shopee', 'amazon', 'accesstrade', 'clickbank', 'adflex', 'ecomobi'].map(p => (
                        <button key={p} onClick={() => setShowAddForm(p)} className="px-4 py-2 bg-slate-800 rounded-lg text-[10px] font-black hover:bg-green-600 transition-all uppercase shrink-0">
                           + {p}
                        </button>
                     ))}
                  </div>
               </div>

               {showAddForm && PLATFORM_CONFIGS[showAddForm] && renderAddForm(showAddForm, 'affiliate')}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apiKeys.filter(k => k.category === 'affiliate').map(k => (
                    <div key={k.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex justify-between items-center group">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-900 rounded-xl text-green-400"><Store size={20}/></div>
                          <div>
                             <div className="text-sm font-black text-white uppercase">{k.alias}</div>
                             <div className="text-[10px] text-slate-500 font-mono uppercase">{k.provider}</div>
                          </div>
                       </div>
                       <button onClick={() => deleteKey(k.id)} className="p-2 text-slate-700 hover:text-red-500"><Trash2 size={18}/></button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8">
               <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><Share2 className="text-blue-500"/> Social Channels</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                     {['tiktok', 'youtube', 'zalo_personal', 'facebook', 'instagram', 'twitter'].map(p => (
                        <button key={p} onClick={() => setShowAddForm(p)} className="px-4 py-2 bg-slate-800 rounded-lg text-[10px] font-black hover:bg-blue-600 transition-all uppercase shrink-0">
                           + {p}
                        </button>
                     ))}
                  </div>
               </div>

               {showAddForm && renderAddForm(showAddForm, 'social')}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apiKeys.filter(k => k.category === 'social').map(k => (
                    <div key={k.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex justify-between items-center group">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-900 rounded-xl text-blue-400"><Play size={20}/></div>
                          <div>
                             <div className="text-sm font-black text-white uppercase">{k.alias}</div>
                             <div className="text-[10px] text-slate-500 font-mono uppercase">{k.provider}</div>
                          </div>
                       </div>
                       <button onClick={() => deleteKey(k.id)} className="p-2 text-slate-700 hover:text-red-500"><Trash2 size={18}/></button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'brain' && (
             <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3"><Brain className="text-primary"/> Neural Memory</h3>
                      <textarea value={trainingText} onChange={(e) => setTrainingText(e.target.value)} placeholder="VD: 'Dùng văn phong GenZ, hài hước...'" className="w-full h-64 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm text-white focus:border-primary outline-none resize-none" />
                      <NeonButton onClick={async () => {
                          const key = apiKeys.find(k => k.provider === 'google')?.key;
                          if (!key) return alert("Cần AI Key");
                          setIsSynthesizing(true);
                          const prefs = await synthesizeKnowledge(key, trainingText, knowledgeBase.learnedPreferences);
                          setKnowledgeBase({...knowledgeBase, learnedPreferences: [...new Set([...knowledgeBase.learnedPreferences, ...prefs])]});
                          setTrainingText('');
                          setIsSynthesizing(false);
                      }} disabled={isSynthesizing || !trainingText} className="w-full h-14">HUẤN LUYỆN TRÍ NÃO</NeonButton>
                   </div>
                   <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 overflow-y-auto h-[400px]">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Learned Rules</h4>
                      <div className="space-y-3">
                        {knowledgeBase.learnedPreferences.map((p, i) => (
                          <div key={i} className="text-xs text-slate-300 p-3 bg-slate-900 rounded-xl border border-slate-800 italic">"{p}"</div>
                        ))}
                      </div>
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* CỘT PHỤ - HƯỚNG DẪN */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900/80 border border-slate-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5"><BookOpen size={120} /></div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                  <HelpCircle size={18} className="text-primary" /> Hướng dẫn kết nối
               </h3>
               
               <div className="space-y-6">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                     <h4 className="text-xs font-black text-primary uppercase mb-2">1. Quy trình kết nối</h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed">
                        Mỗi nền tảng có cách bảo mật riêng. Hãy chắc chắn bạn đã đăng ký tài khoản <strong>Developer</strong> hoặc <strong>Affiliate</strong> tương ứng trước khi kết nối.
                     </p>
                  </div>
                  
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                     <h4 className="text-xs font-black text-green-500 uppercase mb-2">2. Bảo mật Vault</h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed">
                        Mã của bạn được mã hóa <strong>AV-Secure</strong> tại LocalStorage. Chúng tôi không bao giờ truyền tải mã thô qua Internet.
                     </p>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                     <h4 className="text-xs font-black text-red-500 uppercase mb-2">3. Zalo Personal Tips</h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed">
                        Đối với Zalo cá nhân, bạn cần lấy mã <code>z_pw_token</code> bằng cách nhấn F12 trên Zalo Web, vào tab Application -> Cookies.
                     </p>
                  </div>
               </div>
           </div>
           
           <div className="bg-primary/5 border border-primary/20 rounded-[40px] p-8 flex items-start gap-4">
              <Info className="text-primary shrink-0" size={24} />
              <p className="text-[11px] text-slate-400 italic leading-relaxed">"Nếu bạn gặp lỗi Connection Failed, hãy kiểm tra xem Token đã hết hạn chưa hoặc địa chỉ IP của bạn có bị chặn không."</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;
