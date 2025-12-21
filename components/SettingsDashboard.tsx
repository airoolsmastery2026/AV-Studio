
import React, { useState } from 'react';
import { 
  Database, Shield, Brain, Sliders, Check, 
  Trash2, Plus, X, Eye, EyeOff, Globe, ShoppingBag, 
  Zap, Link as LinkIcon, Smartphone, CreditCard, 
  Store, Music, MessageCircle, AlertCircle, Loader2, Sparkles, Key as KeyIcon,
  ChevronRight, DollarSign, Target, Rocket, Award, ExternalLink, HelpCircle, Info, Lock, ShieldCheck,
  Cpu, Power, RotateCcw, Share2, Coins, TrendingUp, Play, 
  Instagram, Twitter, Chrome, Landmark, Wallet, Layers, HelpCircle as HelpIcon, BookOpen, Bitcoin,
  MapPin, Flag, Navigation
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
    // Affiliate VN
    shopee: {
        label: "Shopee Vietnam",
        fields: [
            { key: "key", label: "App Secret", placeholder: "Nhập Secret...", type: "password" },
            { key: "app_id", label: "App ID", placeholder: "Nhập App ID...", type: "text" }
        ],
        guide: "Yêu cầu đăng ký Shopee Open Platform để lấy API.",
        link: "https://open.shopee.vn/"
    },
    accesstrade: {
        label: "AccessTrade VN",
        fields: [{ key: "key", label: "Access Key", placeholder: "Nhập Access Key...", type: "text" }],
        guide: "Lấy Key tại Profile > API Key trên dashboard AccessTrade.",
        link: "https://pub.accesstrade.vn/"
    },
    // Affiliate Global
    amazon: {
        label: "Amazon Associates (US/Global)",
        fields: [
            { key: "key", label: "Access Key", placeholder: "AKIA...", type: "text" },
            { key: "tracking_id", label: "Tracking ID", placeholder: "store-20", type: "text" }
        ],
        guide: "Lấy Tracking ID từ trang Associates Central.",
        link: "https://affiliate-program.amazon.com/"
    },
    clickbank: {
        label: "ClickBank (Global SaaS)",
        fields: [
            { key: "key", label: "Dev API Key", placeholder: "Mã API...", type: "text" },
            { key: "affiliate_id", label: "NickName", placeholder: "Tên đăng nhập Clickbank", type: "text" }
        ],
        guide: "Cần API Key để AI có thể trích xuất danh sách sản phẩm tiềm năng.",
        link: "https://www.clickbank.com/"
    },
    ebay: {
        label: "eBay Partner Network",
        fields: [{ key: "key", label: "Campaign ID", placeholder: "Nhập Campaign ID...", type: "text" }],
        guide: "Sử dụng cho các thị trường Mỹ, Anh, Đức.",
        link: "https://partnernetwork.ebay.com/"
    },
    // Affiliate Asia
    rakuten_jp: {
        label: "Rakuten (Nhật Bản)",
        fields: [
            { key: "key", label: "Affiliate ID", placeholder: "Nhập ID...", type: "text" },
            { key: "app_id", label: "Application ID", placeholder: "Mã App...", type: "text" }
        ],
        guide: "Sàn thương mại điện tử lớn nhất Nhật Bản.",
        link: "https://affiliate.rakuten.co.jp/"
    },
    coupang_kr: {
        label: "Coupang Partners (Hàn Quốc)",
        fields: [
            { key: "key", label: "Access Key", placeholder: "Nhập Access Key...", type: "text" },
            { key: "secret", label: "Secret Key", placeholder: "Nhập Secret...", type: "password" }
        ],
        guide: "Sàn TMĐT số 1 Hàn Quốc, tốc độ ship siêu nhanh.",
        link: "https://partners.coupang.com/"
    },
    // Crypto
    binance: {
        label: "Binance",
        fields: [
            { key: "key", label: "API Key", placeholder: "Nhập API Key...", type: "password" },
            { key: "secret", label: "API Secret", placeholder: "Nhập Secret...", type: "password" }
        ],
        guide: "Bật quyền 'Enable Spot' để AI theo dõi danh mục.",
        link: "https://www.binance.com/en/my/settings/api-management"
    }
};

const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ 
  apiKeys, setApiKeys, knowledgeBase, setKnowledgeBase, t,
  appLang, setAppLang, contentLanguage, setContentLanguage
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'affiliate' | 'social' | 'crypto' | 'brain'>('ai');
  const [affiliateSubTab, setAffiliateSubTab] = useState<'vn' | 'global' | 'asia'>('vn');
  
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
    delete extraFields.key;

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
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Tên Gợi Nhớ (Ví dụ: Tài khoản Japan 1...)</label>
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
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-inner flex-wrap justify-center">
          <button onClick={() => setActiveTab('ai')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'ai' ? 'bg-purple-600 text-white shadow-neon' : 'text-slate-500'}`}>1. AI Engines</button>
          <button onClick={() => setActiveTab('affiliate')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'affiliate' ? 'bg-green-600 text-white shadow-neon' : 'text-slate-500'}`}>2. Affiliates</button>
          <button onClick={() => setActiveTab('crypto')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'crypto' ? 'bg-orange-600 text-white shadow-neon' : 'text-slate-500'}`}>3. Crypto</button>
          <button onClick={() => setActiveTab('social')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'social' ? 'bg-blue-600 text-white shadow-neon' : 'text-slate-500'}`}>4. Socials</button>
          <button onClick={() => setActiveTab('brain')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'brain' ? 'bg-primary text-white shadow-neon' : 'text-slate-500'}`}>Brains</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
               <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-4 gap-4">
                  <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><ShoppingBag className="text-green-500"/> Affiliate Networks</h3>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner overflow-x-auto no-scrollbar">
                     <button onClick={() => setAffiliateSubTab('vn')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${affiliateSubTab === 'vn' ? 'bg-green-600 text-white' : 'text-slate-500'}`}>1. Việt Nam</button>
                     <button onClick={() => setAffiliateSubTab('global')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${affiliateSubTab === 'global' ? 'bg-green-600 text-white' : 'text-slate-500'}`}>2. Âu Mỹ (Global)</button>
                     <button onClick={() => setAffiliateSubTab('asia')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${affiliateSubTab === 'asia' ? 'bg-green-600 text-white' : 'text-slate-500'}`}>3. Nhật - Hàn (Asia)</button>
                  </div>
               </div>

               <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                  {affiliateSubTab === 'vn' && ['shopee', 'lazada', 'tiki', 'accesstrade', 'adflex', 'ecomobi'].map(p => (
                      <button key={p} onClick={() => setShowAddForm(p)} className="px-4 py-2 bg-slate-800 rounded-lg text-[10px] font-black hover:bg-green-600 transition-all uppercase shrink-0">+ {p}</button>
                  ))}
                  {affiliateSubTab === 'global' && ['amazon', 'ebay', 'walmart', 'clickbank', 'cj', 'shareasale', 'target'].map(p => (
                      <button key={p} onClick={() => setShowAddForm(p)} className="px-4 py-2 bg-slate-800 rounded-lg text-[10px] font-black hover:bg-blue-600 transition-all uppercase shrink-0">+ {p}</button>
                  ))}
                  {affiliateSubTab === 'asia' && ['rakuten_jp', 'amazon_jp', 'coupang_kr', 'gmarket_kr', 'qoo10_jp'].map(p => (
                      <button key={p} onClick={() => setShowAddForm(p)} className="px-4 py-2 bg-slate-800 rounded-lg text-[10px] font-black hover:bg-red-600 transition-all uppercase shrink-0">+ {p}</button>
                  ))}
               </div>

               {showAddForm && renderAddForm(showAddForm, 'affiliate')}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apiKeys.filter(k => k.category === 'affiliate').map(k => (
                    <div key={k.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex justify-between items-center group hover:border-green-500/50 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-900 rounded-xl text-green-400">
                             {['rakuten_jp', 'amazon_jp', 'coupang_kr', 'gmarket_kr'].includes(k.provider) ? <Flag size={20}/> : <Store size={20}/>}
                          </div>
                          <div>
                             <div className="text-sm font-black text-white uppercase">{k.alias}</div>
                             <div className="text-[10px] text-slate-500 font-mono uppercase">{k.provider.replace('_', ' ')}</div>
                          </div>
                       </div>
                       <button onClick={() => deleteKey(k.id)} className="p-2 text-slate-700 hover:text-red-500"><Trash2 size={18}/></button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'crypto' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8">
               <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><Bitcoin className="text-orange-500"/> Crypto Exchanges</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                     {['binance', 'okx', 'bybit', 'kucoin', 'gateio', 'mexc', 'bitget'].map(p => (
                        <button key={p} onClick={() => setShowAddForm(p)} className="px-4 py-2 bg-slate-800 rounded-lg text-[10px] font-black hover:bg-orange-600 transition-all uppercase shrink-0">+ {p}</button>
                     ))}
                  </div>
               </div>
               {showAddForm && PLATFORM_CONFIGS[showAddForm] && renderAddForm(showAddForm, 'affiliate')}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apiKeys.filter(k => k.category === 'affiliate' && ['binance', 'okx', 'bybit', 'kucoin', 'gateio', 'mexc', 'bitget'].includes(k.provider)).map(k => (
                    <div key={k.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex justify-between items-center group">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-900 rounded-xl text-orange-400"><Coins size={20}/></div>
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
                        <button key={p} onClick={() => setShowAddForm(p)} className="px-4 py-2 bg-slate-800 rounded-lg text-[10px] font-black hover:bg-blue-600 transition-all uppercase shrink-0">+ {p}</button>
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

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900/80 border border-slate-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5"><BookOpen size={120} /></div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                  <HelpCircle size={18} className="text-primary" /> Hướng dẫn thị trường
               </h3>
               
               <div className="space-y-6">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                     <h4 className="text-xs font-black text-red-500 uppercase mb-2 flex items-center gap-2">
                        <Navigation size={14}/> Sàn Nhật & Hàn
                     </h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed">
                        Thị trường Nhật (Rakuten) và Hàn (Coupang) có tỷ lệ chuyển đổi cao cho đồ điện tử và mỹ phẩm. Hãy chắc chắn bạn đã đổi <strong>Content Language</strong> sang ngôn ngữ tương ứng trong tab Studio.
                     </p>
                  </div>
                  
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                     <h4 className="text-xs font-black text-blue-500 uppercase mb-2 flex items-center gap-2">
                        <Flag size={14}/> Amazon Associates
                     </h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed">
                        Luôn nhập <strong>Tracking ID</strong> chính xác để AI tự động chèn link affiliate vào mô tả video Reels/TikTok.
                     </p>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                     <h4 className="text-xs font-black text-green-500 uppercase mb-2 flex items-center gap-2">
                        <MapPin size={14}/> Affiliate Việt Nam
                     </h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed">
                        Sử dụng AccessTrade nếu bạn muốn chạy đa chiến dịch từ tài chính đến du lịch. Shopee/Lazada phù hợp cho review sản phẩm gia dụng.
                     </p>
                  </div>
               </div>
           </div>
           
           <div className="bg-primary/5 border border-primary/20 rounded-[40px] p-8 flex items-start gap-4">
              <Info className="text-primary shrink-0" size={24} />
              <p className="text-[11px] text-slate-400 italic leading-relaxed">"Gợi ý: Hãy kết nối ít nhất 1 sàn cho mỗi khu vực để Robot có thể tự động so sánh hoa hồng và chọn sản phẩm tối ưu nhất."</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;
