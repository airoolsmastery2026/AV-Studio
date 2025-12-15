
import React, { useState, useEffect } from 'react';
import { 
  Cpu, Database, Save, Trash2, Plus, 
  Brain, Shield, RefreshCw, Key, 
  ChevronDown, ChevronUp, Check, 
  Terminal, Sparkles, BookOpen, Layers,
  Youtube, ShoppingBag, MessageCircle, Facebook, Instagram, Twitter, Globe, Banknote, CreditCard, ExternalLink, Info, Zap, Smartphone, TrendingUp, Image, Images, Linkedin, Send, Pin, ShoppingCart, Truck, MapPin, Video, MonitorPlay,
  Download, Upload, AlertOctagon, HardDrive, Bell, Moon, Languages, FileJson, AlertTriangle, Sliders, LayoutTemplate, FileOutput, ShieldAlert,
  User, Power, Music, Share2, Link as LinkIcon, Target, Loader2
} from 'lucide-react';
import NeonButton from './NeonButton';
import { ApiKeyConfig, KnowledgeBase, AppLanguage } from '../types';
import { synthesizeKnowledge } from '../services/geminiService';

// ... (Storage Keys) ...
const VAULT_STORAGE_KEY = 'av_studio_secure_vault_v1';
const BRAIN_STORAGE_KEY = 'av_studio_brain_v1';
const QUEUE_STORAGE_KEY = 'av_studio_queue_v1';
const UI_STATE_STORAGE_KEY = 'av_studio_ui_state_v1';
const GALLERY_STORAGE_KEY = 'av_studio_gallery_v1';
const CHAT_STORAGE_KEY = 'av_studio_chat_sessions_v2';
const AUTOPILOT_STORAGE_KEY = 'av_studio_autopilot_state_v1';
const STUDIO_CONFIG_KEY = 'av_studio_config_v1';

interface SettingsDashboardProps {
  apiKeys: ApiKeyConfig[];
  setApiKeys: (keys: ApiKeyConfig[]) => void;
  knowledgeBase: KnowledgeBase;
  setKnowledgeBase: (kb: KnowledgeBase) => void;
  t?: any; // Translation Prop
}

interface StudioGlobalConfig {
  performanceMode: 'turbo' | 'eco';
  parallelChannels: number;
  autoFolder: boolean;
  autoDownload: boolean;
  namingRule: string;
  minOriginality: number;
  minRetention: number;
}

const DEFAULT_STUDIO_CONFIG: StudioGlobalConfig = {
  performanceMode: 'turbo',
  parallelChannels: 3,
  autoFolder: true,
  autoDownload: true,
  namingRule: '[channel]_[title]_[index]',
  minOriginality: 85,
  minRetention: 75
};

// ... (Provider Data) ...
interface ProviderConfig {
  id: string;
  name: string;
  url: string;
  icon: any;
  desc: string;
  instructions: string;
  inputLabel: string;
  keyPlaceholder?: string;
  region?: 'vn' | 'global';
}

const PROVIDERS_DATA: Record<string, ProviderConfig[]> = {
    model: [
    { 
      id: 'google', 
      name: 'Google AI Studio (Gemini)', 
      url: 'https://aistudio.google.com/app/apikey', 
      icon: Cpu, 
      desc: 'ALL-IN-ONE: Script, Vision, Audio',
      instructions: '1. Truy cập Google AI Studio.\n2. Nhấn "Create API Key".\n3. MẸO: Key này dùng được cho cả Gemini Flash/Pro, Imagen (Ảnh) và Veo (nếu được cấp quyền).',
      inputLabel: 'Gemini API Key',
      keyPlaceholder: 'AIzaSy...'
    },
    {
      id: 'openai',
      name: 'OpenAI (GPT-4 / Sora)',
      url: 'https://platform.openai.com/api-keys',
      icon: Sparkles,
      desc: 'Advanced Reasoning & Video (Sora)',
      instructions: '1. Truy cập OpenAI Platform.\n2. Tạo Secret Key mới.',
      inputLabel: 'OpenAI API Key',
      keyPlaceholder: 'sk-...'
    }
  ],
  social: [
      { id: 'zalo', name: 'Zalo OA', url: 'https://oa.zalo.me/manage/setting', icon: MessageCircle, desc: 'Vietnam CRM', instructions: 'Lấy Access Token từ Zalo Developers.', inputLabel: 'Access Token', keyPlaceholder: 'oA_Token...' },
      { id: 'tiktok', name: 'TikTok API', url: 'https://developers.tiktok.com/', icon: Music, desc: 'Viral Video', instructions: 'Tạo App trên TikTok Developers.', inputLabel: 'Access Token', keyPlaceholder: 'tk_...' },
      { id: 'youtube', name: 'YouTube Data API', url: 'https://console.cloud.google.com/', icon: Youtube, desc: 'Video Hosting', instructions: 'Enable YouTube Data API v3.', inputLabel: 'API Key', keyPlaceholder: 'AIzaSy...' },
      { id: 'facebook', name: 'Facebook Graph API', url: 'https://developers.facebook.com/', icon: Facebook, desc: 'Social Network', instructions: 'Lấy Page Access Token.', inputLabel: 'Page Token', keyPlaceholder: 'EAA...' },
      { id: 'instagram', name: 'Instagram Graph API', url: 'https://developers.facebook.com/', icon: Instagram, desc: 'Visual Social', instructions: 'Liên kết Insta Business với FB Page.', inputLabel: 'Access Token', keyPlaceholder: 'EAA...' },
      { id: 'twitter', name: 'X (Twitter) API', url: 'https://developer.twitter.com/en/portal/dashboard', icon: Twitter, desc: 'Real-time News', instructions: 'API Key & Secret.', inputLabel: 'Bearer Token', keyPlaceholder: 'AAAA...' },
      { id: 'linkedin', name: 'LinkedIn API', url: 'https://www.linkedin.com/developers/', icon: Linkedin, desc: 'B2B Network', instructions: 'Create App in Developer Portal.', inputLabel: 'Access Token', keyPlaceholder: 'AQ...' },
      { id: 'pinterest', name: 'Pinterest API', url: 'https://developers.pinterest.com/', icon: Pin, desc: 'Visual Discovery', instructions: 'App ID & Secret.', inputLabel: 'Access Token', keyPlaceholder: 'pina_...' },
      { id: 'telegram', name: 'Telegram Bot API', url: 'https://t.me/BotFather', icon: Send, desc: 'Messaging', instructions: 'Chat with @BotFather to get token.', inputLabel: 'Bot Token', keyPlaceholder: '123456:ABC-...' }
  ],
  affiliate: [
      { id: 'shopee', name: 'Shopee Affiliate', url: 'https://shopee.vn/affiliate', icon: ShoppingBag, desc: 'E-commerce VN', instructions: 'Lấy API Key từ Shopee Open Platform.', inputLabel: 'API Key', keyPlaceholder: 'shopee_...' },
      { id: 'lazada', name: 'Lazada Affiliate', url: 'https://adsense.lazada.vn/', icon: ShoppingCart, desc: 'E-commerce SEA', instructions: 'Lấy Token từ Lazada Adsense.', inputLabel: 'Token', keyPlaceholder: 'laz_...' },
      { id: 'accesstrade', name: 'AccessTrade', url: 'https://pub.accesstrade.vn/', icon: LinkIcon, desc: 'Affiliate Network VN', instructions: 'Lấy API Key trong Profile.', inputLabel: 'Access Key', keyPlaceholder: 'H8s...' },
      { id: 'masoffer', name: 'MasOffer', url: 'https://pub.masoffer.com/', icon: Target, desc: 'CPA Network VN', instructions: 'API Token trong Settings.', inputLabel: 'Token', keyPlaceholder: 'mo_...' },
      { id: 'ecomobi', name: 'Ecomobi (SSP)', url: 'https://ssp.ecomobi.com/', icon: Smartphone, desc: 'Social Selling', instructions: 'API Key from Dashboard.', inputLabel: 'API Key', keyPlaceholder: 'eco_...' },
      { id: 'adflex', name: 'AdFlex', url: 'https://cpo.adflex.vn/', icon: Zap, desc: 'CPO Network', instructions: 'User ID & Key.', inputLabel: 'API Key', keyPlaceholder: 'adf_...' },
      { id: 'amazon', name: 'Amazon Associates', url: 'https://affiliate-program.amazon.com/', icon: Globe, desc: 'Global E-commerce', instructions: 'Product Advertising API.', inputLabel: 'Access Key', keyPlaceholder: 'AKIA...' },
      { id: 'clickbank', name: 'ClickBank', url: 'https://www.clickbank.com/', icon: Banknote, desc: 'High Ticket Digital', instructions: 'Developer API Keys.', inputLabel: 'Clerk API Key', keyPlaceholder: 'DEV-...' },
      { id: 'digistore24', name: 'Digistore24', url: 'https://www.digistore24.com/', icon: CreditCard, desc: 'Digital Products', instructions: 'API Key in Account Settings.', inputLabel: 'API Key', keyPlaceholder: 'ds24_...' },
      { id: 'cj', name: 'CJ Affiliate', url: 'https://developers.cj.com/', icon: Layers, desc: 'Global Brands', instructions: 'Personal Access Token.', inputLabel: 'Bearer Token', keyPlaceholder: 'cj_...' },
      { id: 'ebay', name: 'eBay Partner', url: 'https://developer.ebay.com/', icon: ShoppingBag, desc: 'Auction & Retail', instructions: 'Developer Program.', inputLabel: 'App ID', keyPlaceholder: 'ebay_...' },
      { id: 'aliexpress', name: 'AliExpress Portals', url: 'https://portals.aliexpress.com/', icon: Truck, desc: 'Global Dropship', instructions: 'API Signature.', inputLabel: 'App Key', keyPlaceholder: 'ali_...' }
  ],
  storage: [
      { id: 'upstash', name: 'Upstash Redis', url: 'https://upstash.com/', icon: Database, desc: 'Serverless Data', instructions: 'REST API Url & Token.', inputLabel: 'REST URL', keyPlaceholder: 'https://...' }
  ]
};

const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ 
  apiKeys, 
  setApiKeys,
  knowledgeBase,
  setKnowledgeBase,
  t
}) => {
  const texts = t || {};

  const [activeTab, setActiveTab] = useState<'brain' | 'vault' | 'studio' | 'system'>('system');
  const [activeVaultTab, setActiveVaultTab] = useState<'model'|'social'|'affiliate'|'storage'>('model');
  const [newKey, setNewKey] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('google');
  
  // Training State
  const [trainingText, setTrainingText] = useState('');
  const [isTraining, setIsTraining] = useState(false);

  // System State
  const [storageUsage, setStorageUsage] = useState<string>('0 KB');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [studioConfig, setStudioConfig] = useState<StudioGlobalConfig>(() => {
      try {
          const saved = localStorage.getItem(STUDIO_CONFIG_KEY);
          return saved ? JSON.parse(saved) : DEFAULT_STUDIO_CONFIG;
      } catch (e) { return DEFAULT_STUDIO_CONFIG; }
  });

  useEffect(() => {
      // Calculate Storage Usage
      let total = 0;
      for(let x in localStorage) {
          if(localStorage.hasOwnProperty(x)) {
              total += ((localStorage[x].length + x.length) * 2);
          }
      }
      setStorageUsage((total / 1024).toFixed(2) + " KB");
  }, []);

  useEffect(() => {
      localStorage.setItem(STUDIO_CONFIG_KEY, JSON.stringify(studioConfig));
  }, [studioConfig]);

  // --- HANDLERS ---

  const handleAddKey = () => {
      if (!newKey || !selectedProviderId) return;
      const provider = PROVIDERS_DATA[activeVaultTab].find(p => p.id === selectedProviderId);
      if (!provider) return;

      const newConfig: ApiKeyConfig = {
          id: crypto.randomUUID(),
          alias: newAlias || provider.name,
          key: newKey,
          provider: provider.id as any,
          category: activeVaultTab,
          status: 'active'
      };
      setApiKeys([...apiKeys, newConfig]);
      setNewKey('');
      setNewAlias('');
  };

  const handleDeleteKey = (id: string) => {
      setApiKeys(apiKeys.filter(k => k.id !== id));
  };

  const handleBackup = () => {
    const data = {
      vault: localStorage.getItem(VAULT_STORAGE_KEY),
      brain: localStorage.getItem(BRAIN_STORAGE_KEY),
      queue: localStorage.getItem(QUEUE_STORAGE_KEY),
      config: localStorage.getItem(STUDIO_CONFIG_KEY),
      autopilot: localStorage.getItem(AUTOPILOT_STORAGE_KEY),
      ui: localStorage.getItem(UI_STATE_STORAGE_KEY)
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `av_studio_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (confirm("Restore will overwrite current settings. Continue?")) {
            if (data.vault) localStorage.setItem(VAULT_STORAGE_KEY, data.vault);
            if (data.brain) localStorage.setItem(BRAIN_STORAGE_KEY, data.brain);
            if (data.queue) localStorage.setItem(QUEUE_STORAGE_KEY, data.queue);
            if (data.config) localStorage.setItem(STUDIO_CONFIG_KEY, data.config);
            if (data.autopilot) localStorage.setItem(AUTOPILOT_STORAGE_KEY, data.autopilot);
            if (data.ui) localStorage.setItem(UI_STATE_STORAGE_KEY, data.ui);
            alert("Restore successful. Reloading app...");
            window.location.reload();
        }
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = () => {
    if (confirm("DANGER: This will wipe ALL data including API Keys and Chat History. Are you sure?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleClearCache = () => {
      localStorage.removeItem(QUEUE_STORAGE_KEY);
      localStorage.removeItem(GALLERY_STORAGE_KEY);
      localStorage.removeItem(CHAT_STORAGE_KEY);
      alert("Temporary cache cleared (Queue, Gallery, Chats).");
      window.location.reload();
  };

  // --- BRAIN TRAINING HANDLERS ---
  const handleTrainBrain = async () => {
      const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
      if (!googleKey) {
          alert("Key Error: Please add a Google API Key in the Vault to use Brain features.");
          return;
      }
      if (!trainingText.trim()) return;

      setIsTraining(true);
      try {
          const newInsights = await synthesizeKnowledge(googleKey.key, trainingText, knowledgeBase.learnedPreferences);
          
          if (newInsights.length > 0) {
              setKnowledgeBase({
                  ...knowledgeBase,
                  learnedPreferences: [...knowledgeBase.learnedPreferences, ...newInsights],
                  lastUpdated: Date.now()
              });
              setTrainingText('');
              alert(`Successfully added ${newInsights.length} new insights to the knowledge base.`);
          } else {
              alert("No actionable insights found in the text.");
          }
      } catch (error: any) {
          alert(`Training failed: ${error.message}`);
      } finally {
          setIsTraining(false);
      }
  };

  const handleDeleteKnowledge = (index: number) => {
      const newPrefs = [...knowledgeBase.learnedPreferences];
      newPrefs.splice(index, 1);
      setKnowledgeBase({
          ...knowledgeBase,
          learnedPreferences: newPrefs,
          lastUpdated: Date.now()
      });
  };

  const currentProviders = PROVIDERS_DATA[activeVaultTab] || [];
  const currentKeys = apiKeys.filter(k => k.category === activeVaultTab);

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-xl">
           <SettingsIcon activeTab={activeTab} />
        </div>
        <div>
           <h2 className="text-3xl font-bold text-white">{texts.title || "Trung Tâm Điều Khiển"}</h2>
           <p className="text-slate-400">{texts.subtitle || "Cấu hình Bot, Quản lý Key và Dạy AI học tập."}</p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-1 overflow-x-auto">
        {[
          { id: 'brain', label: texts.settings_tabs?.brain || 'AI Brain', icon: Brain },
          { id: 'vault', label: texts.settings_tabs?.vault || 'API Vault', icon: Shield },
          { id: 'studio', label: texts.settings_tabs?.studio || 'Studio Config', icon: Sliders },
          { id: 'system', label: texts.settings_tabs?.system || 'System Config', icon: Terminal },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-t-xl text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-slate-900 text-primary border-t border-x border-slate-800' 
                : 'text-slate-500 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 min-h-[500px]">
        
        {/* === TAB: BRAIN (Self-Learning) === */}
        {activeTab === 'brain' && (
            <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Training Input */}
                <div className="space-y-6">
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <Sparkles size={16} className="text-purple-500"/> Neural Ingestion (Training)
                        </h3>
                        <p className="text-xs text-slate-400 mb-3">
                            Paste strategies from <strong>ChatGPT, Grok, or Claude</strong> here. The system will synthesize them into "Universal Truths" for the bot to remember.
                        </p>
                        <textarea 
                            value={trainingText}
                            onChange={(e) => setTrainingText(e.target.value)}
                            placeholder="Example: 'Always start videos with a negative hook...' or paste a full strategy guide."
                            className="w-full h-48 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-purple-500 focus:outline-none mb-4 resize-none"
                        />
                        <NeonButton onClick={handleTrainBrain} disabled={isTraining || !trainingText} className="w-full">
                            {isTraining ? (
                                <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Synthesizing Knowledge...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Brain size={16}/> Train & Synthesize</span>
                            )}
                        </NeonButton>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-white">Auto-Improvement</h3>
                            <button 
                                onClick={() => setKnowledgeBase({...knowledgeBase, autoImprovementEnabled: !knowledgeBase.autoImprovementEnabled})}
                                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${knowledgeBase.autoImprovementEnabled ? 'bg-green-500' : 'bg-slate-700'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${knowledgeBase.autoImprovementEnabled ? 'translate-x-5' : ''}`}></div>
                            </button>
                        </div>
                        <p className="text-xs text-slate-400">
                            If enabled, the bot will automatically extract preferences from your chat history after every session.
                        </p>
                    </div>
                </div>

                {/* Right: Knowledge Base */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col h-full max-h-[600px]">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Database size={16} className="text-blue-500"/> Knowledge Base
                        </h3>
                        <span className="text-xs text-slate-500">{knowledgeBase.learnedPreferences.length} nodes</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar bg-slate-900/50 rounded-lg p-2">
                        {knowledgeBase.learnedPreferences.length === 0 && (
                            <div className="text-center text-slate-500 py-10 text-xs italic">
                                Brain is empty. Start training...
                            </div>
                        )}
                        {knowledgeBase.learnedPreferences.map((pref, idx) => (
                            <div key={idx} className="bg-slate-800 border border-slate-700 p-3 rounded-lg flex gap-3 group hover:border-purple-500/50 transition-colors">
                                <div className="mt-0.5"><Zap size={12} className="text-purple-400"/></div>
                                <p className="text-xs text-slate-200 flex-1 leading-relaxed">{pref}</p>
                                <button 
                                    onClick={() => handleDeleteKnowledge(idx)}
                                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* === TAB: VAULT === */}
        {activeTab === 'vault' && (
            <div className="animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Vault Sidebar */}
                    <div className="lg:col-span-3 border-r border-slate-800/50 pr-4 space-y-1">
                        {[
                            { id: 'model', label: 'AI Models', icon: Cpu },
                            { id: 'social', label: 'Social Networks', icon: Share2 },
                            { id: 'affiliate', label: 'Affiliate Networks', icon: ShoppingBag },
                            { id: 'storage', label: 'Cloud Storage', icon: HardDrive }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveVaultTab(t.id as any)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 text-xs font-bold transition-all ${
                                    activeVaultTab === t.id 
                                    ? 'bg-primary/10 text-primary border border-primary/20' 
                                    : 'text-slate-500 hover:text-white hover:bg-slate-800'
                                }`}
                            >
                                <t.icon size={16} /> {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Vault Content */}
                    <div className="lg:col-span-9">
                        {/* Add Key Form */}
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 mb-6">
                            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <Plus size={16} className="text-green-500"/> Add New Connection
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Provider</label>
                                    <div className="relative">
                                        <select 
                                            value={selectedProviderId}
                                            onChange={(e) => setSelectedProviderId(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-xs text-white appearance-none focus:border-primary focus:outline-none"
                                        >
                                            {currentProviders.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-3 top-2.5 text-slate-500 pointer-events-none">
                                            {currentProviders.find(p => p.id === selectedProviderId)?.icon && React.createElement(currentProviders.find(p => p.id === selectedProviderId)?.icon, { size: 14 })}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Alias (Optional)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. My Personal Account"
                                        value={newAlias}
                                        onChange={(e) => setNewAlias(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>
                            
                            {/* Dynamic Instruction */}
                            {selectedProviderId && (
                                <div className="mb-4 bg-blue-900/10 border border-blue-500/20 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
                                        <div className="text-xs text-slate-300 space-y-1">
                                            {currentProviders.find(p => p.id === selectedProviderId)?.instructions.split('\n').map((line, i) => (
                                                <p key={i}>{line}</p>
                                            ))}
                                            <a 
                                                href={currentProviders.find(p => p.id === selectedProviderId)?.url} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="text-blue-400 hover:underline flex items-center gap-1 mt-1 font-bold"
                                            >
                                                Get Key Here <ExternalLink size={10} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input 
                                    type="password" 
                                    placeholder={currentProviders.find(p => p.id === selectedProviderId)?.keyPlaceholder || "Paste Key Here..."}
                                    value={newKey}
                                    onChange={(e) => setNewKey(e.target.value)}
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-primary focus:outline-none font-mono"
                                />
                                <NeonButton onClick={handleAddKey} disabled={!newKey} size="sm">
                                    Save
                                </NeonButton>
                            </div>
                        </div>

                        {/* Existing Keys List */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase">Active Connections ({currentKeys.length})</h4>
                            {currentKeys.length === 0 && (
                                <p className="text-xs text-slate-600 italic">No keys found for this category.</p>
                            )}
                            {currentKeys.map(key => (
                                <div key={key.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center group hover:border-slate-600 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${key.status === 'active' ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                                            <Key size={16} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-xs">{key.alias}</div>
                                            <div className="text-[10px] text-slate-500 font-mono">
                                                {key.provider.toUpperCase()} • {key.key.substring(0, 8)}... • <span className={key.status === 'active' ? 'text-green-500' : 'text-red-500'}>{key.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteKey(key.id)}
                                        className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* === TAB: STUDIO === */}
        {activeTab === 'studio' && (
            <div className="text-center text-slate-500 py-12">
                <Sliders size={48} className="mx-auto mb-4 opacity-50" />
                <p>Studio Global Settings (See Main Implementation)</p>
            </div>
        )}

        {/* === TAB: SYSTEM CONFIGURATION (RESTORED) === */}
        {activeTab === 'system' && (
           <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* LEFT: GENERAL PREFERENCES */}
              <div className="space-y-6">
                  {/* Language Info */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                          <MonitorPlay size={16} className="text-blue-400"/> {texts.sections?.general || "General Preferences"}
                      </h3>
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400">
                          <p className="mb-2"><strong>International SaaS Architecture:</strong></p>
                          <p>System language logic has been decoupled:</p>
                          <ul className="list-disc pl-4 mt-1 space-y-1">
                              <li><strong>UI Language:</strong> Controls interface labels (Top Bar).</li>
                              <li><strong>Content Language:</strong> Configured per project in Studio.</li>
                          </ul>
                      </div>
                  </div>

                  {/* Performance & Notifications */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                          <Zap size={16} className="text-yellow-400"/> Performance & Alerts
                      </h3>
                      
                      <div className="space-y-4">
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Cpu size={18}/></div>
                                  <div>
                                      <div className="text-sm font-bold text-white">Performance Mode</div>
                                      <div className="text-xs text-slate-500">Turbo utilizes more API calls for quality.</div>
                                  </div>
                              </div>
                              <button 
                                  onClick={() => setStudioConfig({...studioConfig, performanceMode: studioConfig.performanceMode === 'turbo' ? 'eco' : 'turbo'})}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                      studioConfig.performanceMode === 'turbo' 
                                      ? 'bg-primary/20 border-primary text-primary' 
                                      : 'bg-slate-950 border-slate-700 text-slate-400'
                                  }`}
                              >
                                  {studioConfig.performanceMode.toUpperCase()}
                              </button>
                          </div>

                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Bell size={18}/></div>
                                  <div>
                                      <div className="text-sm font-bold text-white">System Notifications</div>
                                      <div className="text-xs text-slate-500">Alerts on job completion.</div>
                                  </div>
                              </div>
                              <button 
                                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${notificationsEnabled ? 'bg-green-500' : 'bg-slate-700'}`}
                              >
                                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notificationsEnabled ? 'translate-x-5' : ''}`}></div>
                              </button>
                          </div>
                      </div>
                  </div>
              </div>

              {/* RIGHT: DATA & DANGER ZONE */}
              <div className="space-y-6">
                  {/* Data Management */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                          <HardDrive size={16} className="text-purple-400"/> Data Management
                      </h3>
                      
                      <div className="mb-4">
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>Local Storage Usage</span>
                              <span>{storageUsage}</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                              <div className="bg-purple-500 h-full w-[5%]" style={{width: '10%'}}></div>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          <button 
                              onClick={handleBackup}
                              className="flex items-center justify-center gap-2 p-3 bg-slate-950 border border-slate-700 hover:border-slate-500 rounded-lg text-xs font-bold text-white transition-colors"
                          >
                              <Download size={14} /> Backup Data (JSON)
                          </button>
                          <label className="flex items-center justify-center gap-2 p-3 bg-slate-950 border border-slate-700 hover:border-slate-500 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer">
                              <Upload size={14} /> Restore Data
                              <input type="file" className="hidden" accept=".json" onChange={handleRestore} />
                          </label>
                      </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-5">
                      <h3 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
                          <AlertOctagon size={16}/> Danger Zone
                      </h3>
                      
                      <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-red-950/20 rounded-lg border border-red-900/20">
                              <div>
                                  <div className="text-xs font-bold text-white">Clear Cache</div>
                                  <div className="text-[10px] text-red-300/60">Removes temp queues, history (Keeps Keys).</div>
                              </div>
                              <button onClick={handleClearCache} className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 text-xs font-bold rounded border border-red-900/50 transition-colors">
                                  Clear
                              </button>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-red-950/20 rounded-lg border border-red-900/20">
                              <div>
                                  <div className="text-xs font-bold text-white">Factory Reset</div>
                                  <div className="text-[10px] text-red-300/60">Wipes ALL data including API Keys.</div>
                              </div>
                              <button onClick={handleFactoryReset} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded shadow-lg shadow-red-900/20 transition-colors">
                                  Reset All
                              </button>
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

const SettingsIcon = ({ activeTab }: { activeTab: string }) => {
  if (activeTab === 'brain') return <Brain size={32} className="text-purple-500" />;
  if (activeTab === 'vault') return <Shield size={32} className="text-green-500" />;
  if (activeTab === 'studio') return <Sliders size={32} className="text-blue-500" />;
  return <Terminal size={32} className="text-slate-500" />;
}

export default SettingsDashboard;
