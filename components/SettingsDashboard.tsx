
import React, { useState } from 'react';
import { 
  Database, Shield, Brain, ShoppingBag, 
  Zap, Key as KeyIcon, 
  Store, Music, X, Loader2, Sparkles,
  ExternalLink, Lock, ShieldCheck,
  Languages, Monitor, Youtube, Facebook, LayoutGrid, ArrowUpRight, Save, Trash2, Share2, Globe, Instagram, MessageCircle, MoreVertical,
  Layers, BookOpen
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

  const PLATFORM_CONFIG: Record<string, { link: string, fields: string[], icon: any, color: string }> = {
    'shopee': { 
        link: 'https://open.shopee.com/apps', 
        fields: ['alias', 'clientId', 'secret', 'partnerId'],
        icon: ShoppingBag,
        color: 'text-orange-500'
    },
    'lazada': { 
        link: 'https://open.lazada.com/apps/', 
        fields: ['alias', 'clientId', 'secret'],
        icon: Store,
        color: 'text-blue-500'
    },
    'tiktok_shop': { 
        link: 'https://partner.tiktokshop.com/service/list', 
        fields: ['alias', 'clientId', 'secret', 'partnerId'],
        icon: Music,
        color: 'text-white'
    },
    'amazon': { 
        link: 'https://affiliate-program.amazon.com/home/tools/paapi', 
        fields: ['alias', 'key', 'secret', 'trackingId'],
        icon: ShoppingBag,
        color: 'text-yellow-500'
    },
    'accesstrade': { 
        link: 'https://pub.accesstrade.vn/tools/api_key', 
        fields: ['alias', 'key'],
        icon: Zap,
        color: 'text-red-500'
    },
    'youtube': { 
        link: 'https://console.cloud.google.com/apis/credentials', 
        fields: ['alias', 'key', 'clientId'],
        icon: Youtube,
        color: 'text-red-600'
    },
    'tiktok': { 
        link: 'https://developers.tiktok.com/console/app', 
        fields: ['alias', 'clientId', 'secret'],
        icon: Music,
        color: 'text-white'
    },
    'facebook': { 
        link: 'https://developers.facebook.com/apps/', 
        fields: ['alias', 'clientId', 'key'],
        icon: Facebook,
        color: 'text-blue-600'
    },
    'instagram': { 
        link: 'https://developers.facebook.com/docs/instagram-api/', 
        fields: ['alias', 'key'],
        icon: Instagram,
        color: 'text-pink-500'
    },
    'zalo': { 
        link: 'https://developers.zalo.me/apps/', 
        fields: ['alias', 'clientId', 'key'],
        icon: MessageCircle,
        color: 'text-blue-400'
    }
  };

  const handleSaveConnection = () => {
    if (!showFormFor || !formData.alias) {
        alert(t.input_alias_alert || "Please enter an alias.");
        return;
    }
    
    const newKey: ApiKeyConfig = {
        id: crypto.randomUUID(),
        alias: formData.alias,
        key: formData.key || 'MANAGED_VIA_FIELDS',
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
    
    const updated = [...apiKeys, newKey];
    setApiKeys(updated);
    localStorage.setItem('av_studio_secure_vault_v1', JSON.stringify(updated));
    setFormData({ alias: '', key: '', clientId: '', secret: '', partnerId: '', trackingId: '' });
    setShowFormFor(null);
  };

  const deleteKey = (id: string) => {
    if (confirm(t.delete_confirm || "Delete this connection?")) {
      const updated = apiKeys.filter(k => k.id !== id);
      setApiKeys(updated);
      localStorage.setItem('av_studio_secure_vault_v1', JSON.stringify(updated));
    }
  };

  const currentPlatform = showFormFor ? PLATFORM_CONFIG[showFormFor.platform] : null;

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      {/* Header & Tabs */}
      <div className="bg-slate-950 p-6 md:p-8 rounded-[40px] border border-slate-800 shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-primary/10 rounded-3xl border border-primary/20 shadow-neon">
            <ShieldCheck size={36} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-none">{t.vault_title}</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">{t.vault_subtitle}</p>
          </div>
        </div>
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-inner flex-wrap justify-center overflow-x-auto no-scrollbar max-w-full">
          <button onClick={() => setActiveTab('affiliate')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'affiliate' ? 'bg-green-600 text-white shadow-neon' : 'text-slate-500'}`}>{t.affiliate_vault}</button>
          <button onClick={() => setActiveTab('social')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'social' ? 'bg-blue-600 text-white shadow-neon' : 'text-slate-500'}`}>{t.social_hub}</button>
          <button onClick={() => setActiveTab('brain')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'brain' ? 'bg-slate-700 text-white shadow-neon' : 'text-slate-500'}`}>{t.neural_brain}</button>
          <button onClick={() => setActiveTab('system')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === 'system' ? 'bg-primary text-white shadow-neon' : 'text-slate-500'}`}>{t.locales}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          
          {showFormFor && currentPlatform && (
            <div className="bg-slate-950 border-2 border-primary/50 rounded-[32px] p-8 animate-fade-in space-y-8 shadow-[0_0_80px_rgba(14,165,164,0.15)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none"><KeyIcon size={240} /></div>
                
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase flex items-center gap-3">
                            <Zap className="text-primary animate-pulse" /> {t.connect_node} {showFormFor.platform.replace('_', ' ').toUpperCase()}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Node Integration v5.0</p>
                    </div>
                    <button onClick={() => setShowFormFor(null)} className="p-3 bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-all"><X size={20}/></button>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-neon"><ExternalLink size={24}/></div>
                        <div className="text-left">
                            <h4 className="text-sm font-black text-white uppercase">{t.get_key_btn}</h4>
                            <p className="text-xs text-slate-400">Official Console Link</p>
                        </div>
                    </div>
                    <a href={currentPlatform.link} target="_blank" rel="noopener noreferrer" className="px-10 py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-neon hover:scale-105 transition-all flex items-center gap-2">
                        {t.get_key_btn} <ArrowUpRight size={18}/>
                    </a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {currentPlatform.fields.includes('alias') && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.input_alias}</label>
                            <input value={formData.alias} onChange={(e) => setFormData({...formData, alias: e.target.value})} placeholder="Node Alias..." className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-white font-bold outline-none focus:border-primary shadow-inner" />
                        </div>
                    )}
                    {currentPlatform.fields.includes('clientId') && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.input_client_id}</label>
                            <input value={formData.clientId} onChange={(e) => setFormData({...formData, clientId: e.target.value})} placeholder="Client ID..." className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-white font-bold outline-none focus:border-primary shadow-inner" />
                        </div>
                    )}
                    {currentPlatform.fields.includes('secret') && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.input_secret}</label>
                            <input value={formData.secret} onChange={(e) => setFormData({...formData, secret: e.target.value})} type="password" placeholder="Secret Key..." className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-white font-mono outline-none focus:border-primary shadow-inner" />
                        </div>
                    )}
                    {currentPlatform.fields.includes('partnerId') && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.input_partner_id}</label>
                            <input value={formData.partnerId} onChange={(e) => setFormData({...formData, partnerId: e.target.value})} placeholder="Partner ID..." className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-white font-bold outline-none focus:border-primary shadow-inner" />
                        </div>
                    )}
                    {currentPlatform.fields.includes('trackingId') && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.input_tracking_id}</label>
                            <input value={formData.trackingId} onChange={(e) => setFormData({...formData, trackingId: e.target.value})} placeholder="Tracking ID..." className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-white font-bold outline-none focus:border-primary shadow-inner" />
                        </div>
                    )}
                    {currentPlatform.fields.includes('key') && (
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.input_key_label}</label>
                            <input value={formData.key} onChange={(e) => setFormData({...formData, key: e.target.value})} type="password" placeholder="API Key / Token..." className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-white font-mono outline-none focus:border-primary shadow-inner" />
                        </div>
                    )}
                </div>

                <div className="flex gap-4 pt-4 relative z-10">
                    <NeonButton onClick={handleSaveConnection} className="flex-1 h-16 uppercase text-[11px] font-black">
                        <Save size={20}/> {t.save}
                    </NeonButton>
                    <button onClick={() => setShowFormFor(null)} className="px-10 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs font-black uppercase hover:bg-slate-800 transition-all">{t.cancel}</button>
                </div>
            </div>
          )}

          {(activeTab === 'affiliate' || activeTab === 'social') && !showFormFor && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8">
               <div className="flex justify-between items-center border-b border-slate-800 pb-8 flex-wrap gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl bg-slate-950 border ${activeTab === 'affiliate' ? 'border-green-500/30 text-green-500' : 'border-blue-500/30 text-blue-500'}`}>
                        {activeTab === 'affiliate' ? <ShoppingBag size={24}/> : <LayoutGrid size={24}/>}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">{activeTab === 'affiliate' ? t.affiliate_vault : t.social_hub}</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{apiKeys.filter(k => k.category === activeTab).length} {t.nodes_connected}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                      {(activeTab === 'affiliate' 
                        ? ['shopee', 'lazada', 'tiktok_shop', 'amazon', 'accesstrade'] 
                        : ['youtube', 'tiktok', 'facebook', 'instagram', 'zalo']
                      ).map(p => (
                        <button key={p} onClick={() => setShowFormFor({platform: p, category: activeTab as any})} className="px-4 py-2.5 bg-slate-800 hover:bg-primary text-white rounded-xl text-[10px] font-black uppercase transition-all border border-slate-700">+ {p.replace('_', ' ')}</button>
                      ))}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apiKeys.filter(k => k.category === activeTab).map(k => {
                    const iconConfig = PLATFORM_CONFIG[k.provider];
                    const PlatformIcon = iconConfig?.icon || Globe;
                    return (
                        <div key={k.id} className="bg-slate-950 border border-slate-800 p-5 rounded-[28px] flex justify-between items-center hover:border-primary/40 transition-all group shadow-xl">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl bg-slate-900 border border-slate-800 ${iconConfig?.color || 'text-slate-500'}`}>
                                    <PlatformIcon size={20} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-black text-white uppercase truncate max-w-[150px]">{k.alias}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        <div className="text-[9px] text-slate-600 font-mono uppercase truncate">{k.provider} • Node Active</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button className="p-2.5 text-slate-600 hover:text-white transition-colors"><MoreVertical size={16}/></button>
                                <button onClick={() => deleteKey(k.id)} className="p-2.5 text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    );
                  })}
               </div>
            </div>
          )}

          {activeTab === 'system' && (
             <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-10">
                <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><Monitor className="text-primary"/> {t.locales}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-[32px] space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800"><Languages className="text-primary" /></div>
                            <h4 className="font-black text-white uppercase tracking-tight">UI Language</h4>
                        </div>
                        <select value={appLang} onChange={(e) => setAppLang(e.target.value as AppLanguage)} className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-4 text-xs text-white font-black uppercase outline-none focus:border-primary cursor-pointer shadow-inner appearance-none">
                            <option value="vi">🇻🇳 Tiếng Việt</option>
                            <option value="en">🇺🇸 English</option>
                        </select>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-[32px] space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800"><Globe className="text-green-500" /></div>
                            <h4 className="font-black text-white uppercase tracking-tight">Script Language</h4>
                        </div>
                        <select value={contentLanguage} onChange={(e) => setContentLanguage(e.target.value as ContentLanguage)} className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-4 text-xs text-white font-black uppercase outline-none focus:border-green-500 cursor-pointer shadow-inner appearance-none">
                            <option value="vi">Tiếng Việt</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'brain' && (
             <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3"><Brain className="text-primary"/> {t.neural_brain}</h3>
                      <textarea value={trainingText} onChange={(e) => setTrainingText(e.target.value)} placeholder="Type rules or preferences..." className="w-full h-64 bg-slate-950 border border-slate-800 rounded-[24px] p-6 text-sm text-white focus:border-primary outline-none resize-none shadow-inner transition-all" />
                      <NeonButton onClick={async () => { if (!onTrainBrain || !trainingText) return; setIsSynthesizing(true); await onTrainBrain(trainingText); setTrainingText(''); setIsSynthesizing(false); }} disabled={isSynthesizing || !trainingText} className="w-full h-14">{isSynthesizing ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}{isSynthesizing ? t.loading : "TRAIN COMMANDER"}</NeonButton>
                   </div>
                   <div className="bg-slate-950 border border-slate-800 rounded-[32px] p-6 overflow-y-auto h-[400px] custom-scrollbar space-y-3 text-left">
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
               <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                  <Shield size={18} className="text-primary" /> Multi-Token Vault
               </h3>
               <div className="space-y-6">
                  <div className="bg-slate-950 p-6 rounded-[28px] border border-slate-800 hover:border-amber-500/20 transition-all">
                     <h4 className="text-xs font-black text-amber-500 uppercase mb-2 flex items-center gap-2"><Lock size={14}/> Local-Only Relay</h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed italic">"{t.vault_local_desc}"</p>
                  </div>
                  <div className="bg-slate-950 p-6 rounded-[28px] border border-slate-800 hover:border-primary/20 transition-all">
                     <h4 className="text-xs font-black text-primary uppercase mb-2 flex items-center gap-2"><Share2 size={14}/> Node Dispatcher</h4>
                     <p className="text-[11px] text-slate-400 leading-relaxed italic">"{t.node_dispatcher_desc}"</p>
                  </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;
