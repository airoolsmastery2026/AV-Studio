
import React, { useState } from 'react';
import { 
  Database, Shield, Brain, ShoppingBag, 
  Zap, Key as KeyIcon, 
  Store, Music, X, Loader2, Sparkles,
  ExternalLink, Lock, ShieldCheck,
  Languages, Monitor, Youtube, Facebook, LayoutGrid, ArrowUpRight, Save, Trash2, Share2, Globe, Instagram, MessageCircle, MoreVertical,
  Layers, BookOpen, Plus, CheckCircle2, AlertCircle
} from 'lucide-react';
import NeonButton from './NeonButton';
import { ApiKeyConfig, KnowledgeBase, AppLanguage, ContentLanguage } from '../types';

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
  const [activeTab, setActiveTab] = useState<'affiliate' | 'social' | 'brain' | 'system'>('affiliate');
  const [trainingText, setTrainingText] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [showFormFor, setShowFormFor] = useState<{platform: string, category: 'social' | 'affiliate'} | null>(null);
  
  const [formData, setFormData] = useState({ 
    alias: '', 
    key: '', 
    clientId: '', 
    secret: '', 
    partnerId: '', 
    trackingId: '' 
  });

  const PLATFORM_CONFIG: Record<string, { label: string, link: string, fields: string[], icon: any, color: string, bgColor: string }> = {
    'shopee': { label: 'Shopee Open Platform', link: 'https://open.shopee.com/apps', fields: ['alias', 'clientId', 'secret', 'partnerId'], icon: ShoppingBag, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    'lazada': { label: 'Lazada Open Platform', link: 'https://open.lazada.com/apps/', fields: ['alias', 'clientId', 'secret'], icon: Store, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    'tiktok_shop': { label: 'TikTok Shop Partner', link: 'https://partner.tiktokshop.com/service/list', fields: ['alias', 'clientId', 'secret', 'partnerId'], icon: Music, color: 'text-white', bgColor: 'bg-slate-800' },
    'amazon': { label: 'Amazon Associates API', link: 'https://affiliate-program.amazon.com/home/tools/paapi', fields: ['alias', 'key', 'secret', 'trackingId'], icon: ShoppingBag, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
    'accesstrade': { label: 'AccessTrade API V2', link: 'https://pub.accesstrade.vn/tools/api_key', fields: ['alias', 'key'], icon: Zap, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    'youtube': { label: 'Google Cloud (YouTube API)', link: 'https://console.cloud.google.com/apis/credentials', fields: ['alias', 'key', 'clientId'], icon: Youtube, color: 'text-red-600', bgColor: 'bg-red-600/10' },
    'tiktok': { label: 'TikTok For Developers', link: 'https://developers.tiktok.com/console/app', fields: ['alias', 'clientId', 'secret'], icon: Music, color: 'text-white', bgColor: 'bg-slate-800' },
    'facebook': { label: 'Meta For Developers', link: 'https://developers.facebook.com/apps/', fields: ['alias', 'clientId', 'key'], icon: Facebook, color: 'text-blue-600', bgColor: 'bg-blue-600/10' },
    'instagram': { label: 'Instagram Graph API', link: 'https://developers.facebook.com/docs/instagram-api/', fields: ['alias', 'key'], icon: Instagram, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
    'zalo': { label: 'Zalo Developers Platform', link: 'https://developers.zalo.me/apps/', fields: ['alias', 'clientId', 'key'], icon: MessageCircle, color: 'text-blue-400', bgColor: 'bg-blue-400/10' }
  };

  const handleSaveConnection = () => {
    if (!showFormFor || !formData.alias) return;
    const newKey: ApiKeyConfig = {
        id: crypto.randomUUID(),
        alias: formData.alias,
        key: formData.key || 'MANAGED_KEY',
        provider: showFormFor.platform,
        category: showFormFor.category,
        status: 'active',
        extra_fields: { 
          client_id: formData.clientId, 
          secret: formData.secret, 
          partner_id: formData.partnerId, 
          tracking_id: formData.trackingId 
        }
    };
    setApiKeys([...apiKeys, newKey]);
    setShowFormFor(null);
    setFormData({ alias: '', key: '', clientId: '', secret: '', partnerId: '', trackingId: '' });
  };

  const removeNode = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };

  const renderActiveNodes = (category: 'social' | 'affiliate') => {
    const nodes = apiKeys.filter(k => k.category === category);
    if (nodes.length === 0) return (
      <div className="py-12 text-center opacity-30 border-2 border-dashed border-slate-800 rounded-[32px]">
        <AlertCircle size={48} className="mx-auto mb-3" />
        <p className="text-xs font-black uppercase tracking-widest">Không có Node nào đang hoạt động</p>
      </div>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nodes.map(node => {
          const config = PLATFORM_CONFIG[node.provider];
          return (
            <div key={node.id} className="bg-slate-900 border border-slate-800 p-5 rounded-[24px] flex justify-between items-center group hover:border-primary/40 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${config?.bgColor || 'bg-slate-800'} flex items-center justify-center`}>
                  {config ? <config.icon size={20} className={config.color} /> : <Database size={20} />}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase">{node.alias}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{node.provider} • ACTIVE</p>
                </div>
              </div>
              <button onClick={() => removeNode(node.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      {/* Header */}
      <div className="bg-[#0A101F] border border-slate-800 rounded-[40px] p-6 md:p-8 flex flex-col xl:flex-row justify-between items-center gap-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-primary/10 rounded-3xl border border-primary/20 shadow-neon">
            <ShieldCheck size={36} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-none">{t.vault_title}</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">{t.vault_subtitle}</p>
          </div>
        </div>
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner flex-wrap justify-center overflow-x-auto no-scrollbar max-w-full">
          <button onClick={() => setActiveTab('affiliate')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'affiliate' ? 'bg-green-600 text-white shadow-neon' : 'text-slate-500 hover:text-white'}`}>{t.affiliate_vault}</button>
          <button onClick={() => setActiveTab('social')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'social' ? 'bg-blue-600 text-white shadow-neon' : 'text-slate-500 hover:text-white'}`}>{t.social_hub}</button>
          <button onClick={() => setActiveTab('brain')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'brain' ? 'bg-slate-700 text-white shadow-neon' : 'text-slate-500 hover:text-white'}`}>{t.neural_brain}</button>
          <button onClick={() => setActiveTab('system')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'system' ? 'bg-primary text-white shadow-neon' : 'text-slate-500 hover:text-white'}`}>{t.locales}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          
          {(activeTab === 'affiliate' || activeTab === 'social') && (
            <div className="animate-fade-in space-y-8">
              {/* Node Registration Grid */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 space-y-8 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                  <h3 className="text-xl font-black text-white uppercase flex items-center gap-3">
                    {activeTab === 'affiliate' ? <ShoppingBag className="text-green-500" /> : <Globe className="text-blue-500" />}
                    {activeTab === 'affiliate' ? 'ĐĂNG KÝ KẾT NỐI AFFILIATE' : 'LIÊN KẾT MẠNG XÃ HỘI'}
                  </h3>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">V5.0 Multi-Node Support</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {Object.entries(PLATFORM_CONFIG)
                    .filter(([key, val]) => activeTab === 'affiliate' ? ['shopee', 'lazada', 'tiktok_shop', 'amazon', 'accesstrade'].includes(key) : ['youtube', 'tiktok', 'facebook', 'instagram', 'zalo'].includes(key))
                    .map(([key, config]) => (
                      <button 
                        key={key} 
                        onClick={() => setShowFormFor({ platform: key, category: activeTab as any })}
                        className="group flex flex-col items-center gap-3 p-6 bg-slate-950 border border-slate-800 rounded-[32px] hover:border-primary/50 transition-all hover:-translate-y-1 shadow-lg"
                      >
                        <div className={`p-4 rounded-2xl ${config.bgColor} ${config.color} group-hover:shadow-neon transition-all`}>
                          <config.icon size={24} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase text-center">{key.replace('_', ' ')}</span>
                      </button>
                  ))}
                </div>
              </div>

              {/* Active Nodes List */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-[40px] p-8 space-y-6">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Layers size={16} className="text-primary" /> {t.nodes_connected}
                </h3>
                {renderActiveNodes(activeTab)}
              </div>
            </div>
          )}

          {activeTab === 'brain' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none"><Brain size={200} /></div>
                <div className="flex justify-between items-start border-b border-slate-800 pb-8 relative z-10">
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3"><Brain className="text-purple-500" size={32} /> Huấn luyện Trí não AI</h3>
                        <p className="text-slate-500 text-xs font-medium mt-2 italic">Dán tài liệu sản phẩm hoặc quy tắc thương hiệu để AI học cách tư duy.</p>
                    </div>
                </div>

                <div className="space-y-6 relative z-10">
                    <textarea 
                      value={trainingText}
                      onChange={(e) => setTrainingText(e.target.value)}
                      placeholder="Dán nội dung huấn luyện tại đây... (Ví dụ: Quy tắc xưng hô, USP sản phẩm, đối tượng khách hàng mục tiêu)"
                      className="w-full h-64 bg-slate-950 border border-slate-800 rounded-[32px] p-8 text-sm text-slate-300 font-medium outline-none focus:border-purple-500 shadow-inner transition-all resize-none"
                    />
                    <div className="flex justify-end">
                        <NeonButton 
                          onClick={async () => {
                            if (!trainingText.trim() || !onTrainBrain) return;
                            setIsSynthesizing(true);
                            await onTrainBrain(trainingText);
                            setTrainingText('');
                            setIsSynthesizing(false);
                          }} 
                          disabled={isSynthesizing || !trainingText.trim()}
                          className="h-16 min-w-[240px]"
                        >
                          {isSynthesizing ? <Loader2 className="animate-spin" /> : <Zap />}
                          {isSynthesizing ? "ĐANG HỌC..." : "HUẤN LUYỆN NGAY"}
                        </NeonButton>
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'system' && (
             <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-10 shadow-2xl">
                <h3 className="text-2xl font-black text-white uppercase flex items-center gap-3 tracking-tighter"><Monitor className="text-primary" size={32}/> {t.locales}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-950 border border-slate-800 p-8 rounded-[40px] space-y-6 shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800 shadow-inner"><Languages className="text-primary" /></div>
                            <h4 className="text-lg font-black text-white uppercase tracking-tight">{t.ui_lang}</h4>
                        </div>
                        <select value={appLang} onChange={(e) => setAppLang(e.target.value as AppLanguage)} className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-5 text-sm text-white font-black uppercase outline-none focus:border-primary cursor-pointer shadow-inner appearance-none transition-all">
                            <option value="vi">🇻🇳 Tiếng Việt</option>
                            <option value="en">🇺🇸 English</option>
                        </select>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-8 rounded-[40px] space-y-6 shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800 shadow-inner"><Globe className="text-green-500" /></div>
                            <h4 className="text-lg font-black text-white uppercase tracking-tight">{t.script_lang}</h4>
                        </div>
                        <select value={contentLanguage} onChange={(e) => setContentLanguage(e.target.value as ContentLanguage)} className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-5 text-sm text-white font-black uppercase outline-none focus:border-green-500 cursor-pointer shadow-inner appearance-none transition-all">
                            <option value="vi">Tiếng Việt</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>
            </div>
          )}
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-[40px] p-8 space-y-4">
                <div className="flex items-center gap-3">
                    <Shield className="text-primary" />
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Bảo mật LocalStorage</h4>
                </div>
                <p className="text-[11px] text-slate-400 italic leading-relaxed">{t.vault_local_desc}</p>
            </div>
            
            <div className="bg-slate-950 border border-slate-800 rounded-[40px] p-8 space-y-6 shadow-2xl">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3"><Zap size={14} className="text-yellow-500"/> Node Dispatcher Intel</h4>
                <div className="space-y-4">
                   <p className="text-[10px] text-slate-400 leading-loose font-medium">Hệ thống v5.0 hỗ trợ <span className="text-primary">Multi-Node</span>. Mỗi tài khoản kết nối đóng vai trò là một Node phân phối nội dung song song để tối đa hóa độ phủ thương hiệu.</p>
                   <div className="flex items-center gap-3 text-green-500">
                      <CheckCircle2 size={16} />
                      <span className="text-[10px] font-black uppercase">AES-256 Client-Side Encryption</span>
                   </div>
                </div>
            </div>
        </div>
      </div>

      {/* MODAL FORM ĐĂNG KÝ NODE */}
      {showFormFor && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-[48px] max-w-2xl w-full shadow-2xl overflow-hidden relative border-t-primary/20">
            <div className="p-10 space-y-10">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-6">
                  <div className={`p-6 rounded-3xl ${PLATFORM_CONFIG[showFormFor.platform].bgColor} ${PLATFORM_CONFIG[showFormFor.platform].color}`}>
                    {React.createElement(PLATFORM_CONFIG[showFormFor.platform].icon, { size: 40 })}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">{showFormFor.platform.replace('_', ' ')}</h2>
                    <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-widest">Cấu hình kết nối Node</p>
                  </div>
                </div>
                <button onClick={() => setShowFormFor(null)} className="p-3 text-slate-500 hover:text-white transition-colors bg-slate-950 rounded-2xl border border-slate-800">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PLATFORM_CONFIG[showFormFor.platform].fields.map(field => (
                  <div key={field} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      {field === 'alias' ? t.input_alias : field === 'key' ? t.input_key_label : field === 'clientId' ? t.input_client_id : field === 'secret' ? t.input_secret : field === 'partnerId' ? t.input_partner_id : t.input_tracking_id}
                    </label>
                    <input 
                      value={(formData as any)[field]}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      placeholder="..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white font-bold outline-none focus:border-primary shadow-inner"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ExternalLink size={18} className="text-primary" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cần hỗ trợ lấy API Key?</span>
                </div>
                <a href={PLATFORM_CONFIG[showFormFor.platform].link} target="_blank" rel="noreferrer" className="text-[10px] font-black text-white bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-xl hover:bg-primary transition-all uppercase tracking-widest">
                  {t.get_key_btn}
                </a>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowFormFor(null)} className="flex-1 py-5 bg-slate-950 border border-slate-800 rounded-3xl text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">
                  {t.cancel}
                </button>
                <NeonButton onClick={handleSaveConnection} className="flex-[2] h-[64px] rounded-3xl text-sm shadow-neon">
                  <Save size={20} /> {t.save}
                </NeonButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsDashboard;
