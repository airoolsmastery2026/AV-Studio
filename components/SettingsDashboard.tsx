
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
    'shopee': { link: 'https://open.shopee.com/apps', fields: ['alias', 'clientId', 'secret', 'partnerId'], icon: ShoppingBag, color: 'text-orange-500' },
    'lazada': { link: 'https://open.lazada.com/apps/', fields: ['alias', 'clientId', 'secret'], icon: Store, color: 'text-blue-500' },
    'tiktok_shop': { link: 'https://partner.tiktokshop.com/service/list', fields: ['alias', 'clientId', 'secret', 'partnerId'], icon: Music, color: 'text-white' },
    'amazon': { link: 'https://affiliate-program.amazon.com/home/tools/paapi', fields: ['alias', 'key', 'secret', 'trackingId'], icon: ShoppingBag, color: 'text-yellow-500' },
    'accesstrade': { link: 'https://pub.accesstrade.vn/tools/api_key', fields: ['alias', 'key'], icon: Zap, color: 'text-red-500' },
    'youtube': { link: 'https://console.cloud.google.com/apis/credentials', fields: ['alias', 'key', 'clientId'], icon: Youtube, color: 'text-red-600' },
    'tiktok': { link: 'https://developers.tiktok.com/console/app', fields: ['alias', 'clientId', 'secret'], icon: Music, color: 'text-white' },
    'facebook': { link: 'https://developers.facebook.com/apps/', fields: ['alias', 'clientId', 'key'], icon: Facebook, color: 'text-blue-600' },
    'instagram': { link: 'https://developers.facebook.com/docs/instagram-api/', fields: ['alias', 'key'], icon: Instagram, color: 'text-pink-500' },
    'zalo': { link: 'https://developers.zalo.me/apps/', fields: ['alias', 'clientId', 'key'], icon: MessageCircle, color: 'text-blue-400' }
  };

  const handleSaveConnection = () => {
    if (!showFormFor || !formData.alias) return;
    const newKey: ApiKeyConfig = {
        id: crypto.randomUUID(),
        alias: formData.alias,
        key: formData.key || 'MANAGED',
        provider: showFormFor.platform,
        category: showFormFor.category,
        status: 'active',
        extra_fields: { client_id: formData.clientId, secret: formData.secret, partner_id: formData.partnerId, tracking_id: formData.trackingId }
    };
    setApiKeys([...apiKeys, newKey]);
    setShowFormFor(null);
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
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
          <button onClick={() => setActiveTab('affiliate')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'affiliate' ? 'bg-green-600 text-white shadow-neon' : 'text-slate-500'}`}>{t.affiliate_vault}</button>
          <button onClick={() => setActiveTab('social')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'social' ? 'bg-blue-600 text-white shadow-neon' : 'text-slate-500'}`}>{t.social_hub}</button>
          <button onClick={() => setActiveTab('brain')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'brain' ? 'bg-slate-700 text-white shadow-neon' : 'text-slate-500'}`}>{t.neural_brain}</button>
          <button onClick={() => setActiveTab('system')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'system' ? 'bg-primary text-white shadow-neon' : 'text-slate-500'}`}>{t.locales}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'system' && (
             <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in space-y-10">
                <h3 className="text-xl font-black text-white uppercase flex items-center gap-3"><Monitor className="text-primary"/> {t.locales}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-[32px] space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800"><Languages className="text-primary" /></div>
                            <h4 className="font-black text-white uppercase tracking-tight">{t.ui_lang}</h4>
                        </div>
                        <select value={appLang} onChange={(e) => setAppLang(e.target.value as AppLanguage)} className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-4 text-xs text-white font-black uppercase outline-none focus:border-primary cursor-pointer shadow-inner appearance-none">
                            <option value="vi">🇻🇳 Tiếng Việt</option>
                            <option value="en">🇺🇸 English</option>
                            <option value="jp">🇯🇵 日本語</option>
                            <option value="es">🇪🇸 Español</option>
                            <option value="zh">🇨🇳 中文</option>
                        </select>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-[32px] space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800"><Globe className="text-green-500" /></div>
                            <h4 className="font-black text-white uppercase tracking-tight">{t.script_lang}</h4>
                        </div>
                        <select value={contentLanguage} onChange={(e) => setContentLanguage(e.target.value as ContentLanguage)} className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl p-4 text-xs text-white font-black uppercase outline-none focus:border-green-500 cursor-pointer shadow-inner appearance-none">
                            <option value="vi">Tiếng Việt</option>
                            <option value="en">English</option>
                            <option value="jp">日本語</option>
                            <option value="es">Español</option>
                            <option value="zh">中文</option>
                        </select>
                    </div>
                </div>
            </div>
          )}

          {activeTab !== 'system' && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 animate-fade-in">
               <p className="text-slate-500 italic text-sm">{t.vault_local_desc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;
