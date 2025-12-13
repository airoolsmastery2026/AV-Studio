
import React, { useState } from 'react';
import { 
  Key, Save, Server, Shield, X, Youtube, Database, Plus, Trash2, 
  RefreshCw, ExternalLink, Zap, ShoppingBag, Facebook, Video, Cpu, Activity,
  ChevronDown, ChevronUp, Info, Check, AlertCircle, Signal, MessageCircle, 
  Instagram, Twitter, Globe, Banknote, CreditCard, ShoppingCart, MapPin, Truck
} from 'lucide-react';
import NeonButton from './NeonButton';
import { ApiKeyConfig, CreditUsage } from '../types';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeyConfig[];
  setApiKeys: (keys: ApiKeyConfig[]) => void;
}

interface ProviderConfig {
  id: string;
  name: string;
  url: string;
  icon: any;
  desc: string;
  instructions: string;
  inputLabel: string;
  region?: 'vn' | 'global';
}

// Configuration for supported providers with detailed instructions
const PROVIDERS_DATA: Record<string, ProviderConfig[]> = {
  model: [
    { 
      id: 'google', 
      name: 'Google AI Studio (Gemini)', 
      url: 'https://aistudio.google.com/app/apikey', 
      icon: Cpu, 
      desc: 'Orchestrator Core & Text Generation',
      instructions: '1. Truy cập Google AI Studio.\n2. Nhấn "Create API Key".\n3. Chọn dự án Google Cloud hoặc tạo mới.\n4. Sao chép khóa bắt đầu bằng "AIza...".',
      inputLabel: 'Gemini API Key'
    },
    { 
      id: 'veo', 
      name: 'Google Veo (Video FX)', 
      url: 'https://deepmind.google/technologies/veo/', 
      icon: Video, 
      desc: 'High-fidelity Video Generation',
      instructions: '1. Đăng ký Waitlist hoặc truy cập qua Vertex AI (GCP).\n2. Kích hoạt API "Generative Video Service".\n3. Tạo Service Account Key (JSON) hoặc API Key.',
      inputLabel: 'Veo/Vertex API Token'
    },
    { 
      id: 'stick', 
      name: 'Stick.ai (Image Gen)', 
      url: 'https://stick.ai/settings/api', 
      icon: Zap, 
      desc: 'Flux & Stable Diffusion Pipelines',
      instructions: '1. Đăng nhập Stick.ai Dashboard.\n2. Vào Settings -> API.\n3. Tạo "New Secret Key".',
      inputLabel: 'Stick Secret Key'
    },
    { 
      id: 'switch', 
      name: 'Switch.ai (Voice/TTS)', 
      url: 'https://switch.ai/developer/tokens', 
      icon: Activity, 
      desc: 'Neural Voice Cloning & TTS',
      instructions: '1. Vào Developer Portal.\n2. Chọn "Access Tokens".\n3. Tạo token với quyền "Write" cho TTS.',
      inputLabel: 'Switch Access Token'
    },
  ],
  social: [
    { 
      id: 'zalo', 
      name: 'Zalo OA & Zalo Video', 
      url: 'https://developers.zalo.me/', 
      icon: MessageCircle, 
      desc: 'Zalo Video Posting & ZNS Messaging',
      instructions: '1. Truy cập Zalo Developers.\n2. Tạo ứng dụng mới -> Liên kết OA.\n3. Xin quyền "zalo_video_publish" để đăng video.\n4. Lấy OA Access Token.',
      inputLabel: 'OA Access Token'
    },
    { 
      id: 'youtube', 
      name: 'YouTube Data API v3', 
      url: 'https://console.cloud.google.com/apis/library/youtube.googleapis.com', 
      icon: Youtube, 
      desc: 'Upload & Analytics',
      instructions: '1. Vào Google Cloud Console.\n2. Kích hoạt "YouTube Data API v3".\n3. Vào Credentials -> Create API Key.\n4. (Khuyên dùng) Tạo OAuth 2.0 Client ID nếu cần upload.',
      inputLabel: 'Google API Key / OAuth Token'
    },
    { 
      id: 'tiktok', 
      name: 'TikTok for Developers', 
      url: 'https://developers.tiktok.com/apps/', 
      icon: Video, 
      desc: 'Posting & Trend Data',
      instructions: '1. Tạo ứng dụng trên TikTok Developers.\n2. Lấy "Client Key" và "Client Secret".\n3. Nhập chuỗi kết nối hoặc Access Token dài hạn.',
      inputLabel: 'Long-lived Access Token'
    },
    { 
      id: 'facebook', 
      name: 'Meta Graph API', 
      url: 'https://developers.facebook.com/tools/explorer/', 
      icon: Facebook, 
      desc: 'Page Publishing & Reels',
      instructions: '1. Dùng Graph API Explorer.\n2. Chọn App và Quyền (pages_show_list, pages_read_engagement).\n3. Generate Access Token.',
      inputLabel: 'User/Page Access Token'
    },
    { 
      id: 'instagram', 
      name: 'Instagram Graph API', 
      url: 'https://developers.facebook.com/docs/instagram-api/', 
      icon: Instagram, 
      desc: 'Photo & Reels Publishing',
      instructions: '1. Liên kết Instagram Business với Facebook Page.\n2. Tạo App trên Meta Developers.\n3. Lấy Token có quyền instagram_content_publish.',
      inputLabel: 'Access Token'
    },
    { 
      id: 'twitter', 
      name: 'X (Twitter) API', 
      url: 'https://developer.twitter.com/en/portal/dashboard', 
      icon: Twitter, 
      desc: 'Tweets & Thread Automation',
      instructions: '1. Đăng ký tài khoản Developer.\n2. Tạo Project & App.\n3. Lấy API Key, API Secret và Bearer Token.',
      inputLabel: 'Bearer Token'
    },
  ],
  affiliate: [
    { 
      id: 'accesstrade', 
      name: 'AccessTrade Vietnam', 
      url: 'https://pub.accesstrade.vn/tools/api', 
      icon: Globe, 
      desc: 'Mạng lưới Affiliate số 1 VN',
      instructions: '1. Đăng ký Publisher tại AccessTrade.\n2. Vào Công cụ -> API.\n3. Tạo và sao chép Access Token.',
      inputLabel: 'Access Token',
      region: 'vn'
    },
    { 
      id: 'masoffer', 
      name: 'MasOffer', 
      url: 'https://pub.masoffer.com/', 
      icon: ShoppingBag, 
      desc: 'Đối tác Tiki, NguyenKim, FPT...',
      instructions: '1. Đăng ký MasOffer Publisher.\n2. Vào Tài khoản -> API.\n3. Lấy Distribution ID và Token.',
      inputLabel: 'Token / Dist. ID',
      region: 'vn'
    },
    { 
      id: 'shopee', 
      name: 'Shopee Open Platform', 
      url: 'https://open.shopee.com/', 
      icon: ShoppingBag, 
      desc: 'Affiliate Links & Product Data',
      instructions: '1. Đăng ký Shopee Open Platform.\n2. Tạo App để lấy Partner ID & Key.\n3. Cần xác thực Shop Authorization.',
      inputLabel: 'Partner Key / Token',
      region: 'vn'
    },
    { 
      id: 'lazada', 
      name: 'Lazada Affiliate VN', 
      url: 'https://adsense.lazada.vn/', 
      icon: ShoppingBag, 
      desc: 'Tiếp thị liên kết Lazada',
      instructions: '1. Đăng ký Lazada Adsense.\n2. Vào Developer Center -> Create App.\n3. Lấy App Key và Secret.',
      inputLabel: 'App Key',
      region: 'vn'
    },
    { 
      id: 'clickbank', 
      name: 'ClickBank', 
      url: 'https://accounts.clickbank.com/master/api_credentials', 
      icon: Banknote, 
      desc: 'Sàn Global High-Commission',
      instructions: '1. Đăng nhập ClickBank -> Account Settings.\n2. Chọn Developer API Keys.\n3. Tạo Key mới (Clerk API Key).',
      inputLabel: 'Dev API Key',
      region: 'global'
    },
    { 
      id: 'digistore24', 
      name: 'Digistore24', 
      url: 'https://www.digistore24.com/manager/account/details', 
      icon: CreditCard, 
      desc: 'Digital Products & CPO Commissions',
      instructions: '1. Vào Settings -> Account Access.\n2. Quan trọng: Thêm IP hiện tại vào "IP Access" (Whitelist).\n3. Tạo API Key quyền Read/Write để theo dõi CPO.',
      inputLabel: 'API Key',
      region: 'global'
    },
    { 
      id: 'cj', 
      name: 'CJ Affiliate (Commission Junction)', 
      url: 'https://developers.cj.com/account/personal-access-tokens', 
      icon: Globe, 
      desc: 'Thương hiệu lớn uy tín',
      instructions: '1. Đăng nhập CJ Developer Portal.\n2. Vào Authentication -> Personal Access Tokens.\n3. Tạo Token mới.',
      inputLabel: 'Personal Access Token',
      region: 'global'
    },
    { 
      id: 'amazon', 
      name: 'Amazon Associates', 
      url: 'https://affiliate-program.amazon.com/assoc_credentials/home', 
      icon: ShoppingCart, 
      desc: 'Product Advertising API',
      instructions: '1. Vào Tools -> Product Advertising API.\n2. Chọn "Add Credentials".\n3. Bạn cần Access Key và Secret Key.',
      inputLabel: 'Access Key:Secret Key',
      region: 'global'
    },
    { 
      id: 'aliexpress', 
      name: 'AliExpress Portals', 
      url: 'https://portals.aliexpress.com/', 
      icon: Truck, 
      desc: 'Dropshipping & Giá rẻ (Global)',
      instructions: '1. Đăng ký AliExpress Portals.\n2. Vào Ad Center -> API Settings.\n3. Tạo App Key và App Secret.',
      inputLabel: 'App Key',
      region: 'global'
    },
    { 
      id: 'ebay', 
      name: 'eBay Partner Network', 
      url: 'https://partnernetwork.ebay.com/', 
      icon: ShoppingCart, 
      desc: 'Đấu giá & Đồ cũ tốt nhất US',
      instructions: '1. Đăng ký EPN Account.\n2. Vào Developer Program.\n3. Tạo Application Keys (Production) để lấy App ID và Cert ID.',
      inputLabel: 'App ID (Client ID)',
      region: 'global'
    },
    { 
      id: 'walmart', 
      name: 'Walmart Affiliate', 
      url: 'https://developer.walmart.com/', 
      icon: ShoppingBag, 
      desc: 'Bán lẻ hàng đầu US',
      instructions: '1. Tham gia qua Impact Radius hoặc Direct.\n2. Truy cập Walmart.io IO Developer.\n3. Lấy Consumer ID và Private Key.',
      inputLabel: 'Consumer ID',
      region: 'global'
    },
  ],
  storage: [
    { 
      id: 'upstash', 
      name: 'Upstash Redis', 
      url: 'https://console.upstash.com/', 
      icon: Database, 
      desc: 'Serverless Job Queue',
      instructions: '1. Tạo Database mới trên Upstash.\n2. Sao chép "UPSTASH_REDIS_REST_URL" và "TOKEN".\n3. Nhập theo định dạng URL;TOKEN',
      inputLabel: 'REST_URL;TOKEN'
    },
  ]
};

const CreditBar: React.FC<{ credits?: CreditUsage }> = ({ credits }) => {
  if (!credits) return <span className="text-[10px] text-slate-500">Chưa có thông tin tín dụng</span>;
  
  const percent = Math.min(100, Math.max(0, (credits.remaining / credits.total) * 100));
  const isLow = percent < 20;
  
  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-slate-400">Tín dụng: <span className="text-white font-mono">{credits.remaining.toLocaleString()}</span> / {credits.total.toLocaleString()} {credits.unit}</span>
        {credits.requiredPerRun && (
          <span className="text-primary">Cần: {credits.requiredPerRun} / run</span>
        )}
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${isLow ? 'bg-red-500' : 'bg-green-500'}`} 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};

const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ isOpen, onClose, apiKeys, setApiKeys }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'model'|'social'|'affiliate'|'storage'>('model');
  const [affiliateRegion, setAffiliateRegion] = useState<'vn' | 'global'>('vn'); // NEW: Filter state

  // Local state for adding new keys
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [newKey, setNewKey] = useState('');
  const [newAlias, setNewAlias] = useState('');

  // Filter Logic
  let currentProviders = PROVIDERS_DATA[activeTab];
  if (activeTab === 'affiliate') {
    currentProviders = currentProviders.filter(p => p.region === affiliateRegion);
  }

  const selectedProviderConfig = PROVIDERS_DATA[activeTab].find(p => p.id === selectedProviderId);
  const currentKeys = apiKeys.filter(k => k.category === activeTab);

  const handleAddKey = () => {
    if (!newKey.trim() || !selectedProviderId) return;
    
    // Simulate fetching credit info (Mock Data)
    const mockCredits: CreditUsage = {
      remaining: Math.floor(Math.random() * 500000) + 50000,
      total: 1000000,
      unit: 'tokens',
      requiredPerRun: 15000
    };

    const keyConfig: ApiKeyConfig = {
      id: crypto.randomUUID(),
      alias: newAlias || `${selectedProviderId.toUpperCase()}-${apiKeys.length + 1}`,
      key: newKey.trim(),
      provider: selectedProviderId as any,
      category: activeTab,
      status: 'active',
      credits: mockCredits
    };
    
    setApiKeys([...apiKeys, keyConfig]);
    setNewKey('');
    setNewAlias('');
    setSelectedProviderId('');
    setIsDropdownOpen(false);
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };

  const handleResetStatus = (id: string) => {
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, status: 'active' } : k));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#0B1120] border border-slate-700 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden h-[750px] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-xl text-primary border border-primary/20 shadow-neon">
              <Server size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">System Vault & Integrations</h2>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <Shield size={12} className="text-green-500" />
                End-to-end Encrypted • Auto-Rotation Enabled
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors bg-slate-900 p-2 rounded-full hover:bg-slate-800">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-60 bg-slate-950/50 border-r border-slate-800 p-4 space-y-2 shrink-0">
            {[
              { id: 'model', label: 'AI Models', icon: Cpu },
              { id: 'social', label: 'Mạng Xã Hội', icon: Youtube },
              { id: 'affiliate', label: 'Sàn Affiliate', icon: ShoppingBag },
              { id: 'storage', label: 'Lưu trữ & Queue', icon: Database },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setSelectedProviderId(''); setIsDropdownOpen(false); }}
                className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                  activeTab === tab.id 
                    ? 'bg-primary/10 text-white border border-primary/20 shadow-[0_0_15px_rgba(14,165,164,0.1)]' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-primary' : 'text-slate-500'} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-b from-[#0B1120] to-[#020617]">
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2 capitalize flex items-center gap-2">
                {activeTab === 'model' && <Cpu size={20} className="text-primary" />}
                {activeTab === 'social' && <Youtube size={20} className="text-red-500" />}
                {activeTab === 'affiliate' && <ShoppingBag size={20} className="text-orange-500" />}
                Quản lý {activeTab}
              </h3>
            </div>

            {/* Add New Integration Section */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 mb-8 backdrop-blur-sm relative shadow-inner">
              
              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Plus size={16} className="text-primary" /> Thêm kết nối mới
              </h4>

              {/* REGION FILTER TOGGLE FOR AFFILIATE */}
              {activeTab === 'affiliate' && (
                  <div className="flex p-1 bg-slate-950 rounded-lg mb-4 border border-slate-800 w-fit">
                    <button 
                        onClick={() => { setAffiliateRegion('vn'); setSelectedProviderId(''); setIsDropdownOpen(false); }}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${affiliateRegion === 'vn' ? 'bg-red-600 text-white shadow' : 'text-slate-500 hover:text-white'}`}
                    >
                        <MapPin size={12} /> Sàn Việt Nam
                    </button>
                    <button 
                        onClick={() => { setAffiliateRegion('global'); setSelectedProviderId(''); setIsDropdownOpen(false); }}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${affiliateRegion === 'global' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-white'}`}
                    >
                        <Globe size={12} /> Sàn Quốc Tế
                    </button>
                  </div>
              )}
              
              {/* Dropdown Selection */}
              <div className="relative mb-4 z-20">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-3 flex items-center justify-between text-left transition-all"
                >
                  <span className={`flex items-center gap-3 ${selectedProviderId ? 'text-white' : 'text-slate-400'}`}>
                     {selectedProviderId && selectedProviderConfig ? (
                       <>
                         <span className="p-1 bg-slate-800 rounded">{React.createElement(selectedProviderConfig.icon, {size: 16})}</span>
                         {selectedProviderConfig.name}
                       </>
                     ) : "Chọn dịch vụ / Ứng dụng để kết nối..."}
                  </span>
                  {isDropdownOpen ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto z-30 animate-fade-in">
                    {currentProviders.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setSelectedProviderId(p.id); setIsDropdownOpen(false); }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800 text-left transition-colors border-b border-slate-800/50 last:border-0"
                      >
                        <div className="p-2 bg-slate-950 rounded-lg text-slate-400">
                          <p.icon size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{p.name}</div>
                          <div className="text-[10px] text-slate-500">{p.desc}</div>
                        </div>
                        {selectedProviderId === p.id && <Check size={16} className="ml-auto text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Form Content */}
              {selectedProviderConfig && (
                <div className="animate-fade-in space-y-4 pt-2 border-t border-slate-800/50">
                  
                  {/* Instructions Panel */}
                  <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                    <Info size={20} className="text-blue-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h5 className="text-xs font-bold text-blue-300 mb-2 uppercase tracking-wide">Hướng dẫn lấy Key</h5>
                      <ul className="text-xs text-slate-300 space-y-1 mb-3 list-disc list-inside">
                        {selectedProviderConfig.instructions.split('\n').map((line, i) => (
                          <li key={i} className="pl-1">{line.replace(/^\d+\.\s/, '')}</li>
                        ))}
                      </ul>
                      <a 
                        href={selectedProviderConfig.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Lấy API Key / Token ngay <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Tên Gợi Nhớ (Alias)</label>
                      <input 
                        type="text" 
                        placeholder={`VD: ${selectedProviderConfig.name} - Account 1`} 
                        value={newAlias}
                        onChange={(e) => setNewAlias(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">{selectedProviderConfig.inputLabel}</label>
                      <input 
                        type="password" 
                        placeholder="Dán key vào đây..." 
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                     <button 
                      onClick={handleAddKey}
                      className="w-full py-3 bg-gradient-to-r from-primary/80 to-accent/80 hover:from-primary hover:to-accent border border-transparent rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40"
                    >
                      <Plus size={16} /> Kết nối & Kiểm tra Tín dụng
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Active Keys List */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
                <span>Kết nối đang hoạt động ({currentKeys.length})</span>
                {currentKeys.length > 0 && <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 flex items-center gap-1"><Check size={10} /> System Healthy</span>}
              </h4>
              
              <div className="space-y-3">
                {currentKeys.length === 0 && (
                   <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-600">
                        <Key size={24} />
                      </div>
                      <p className="text-sm text-slate-500">Chưa có key nào được thêm vào danh mục này.</p>
                   </div>
                )}
                
                {currentKeys.map((k) => {
                  const providerInfo = PROVIDERS_DATA[activeTab].find(p => p.id === k.provider);
                  const Icon = providerInfo ? providerInfo.icon : Key;
                  const name = providerInfo ? providerInfo.name : k.provider;

                  return (
                    <div key={k.id} className={`p-4 rounded-xl border transition-all hover:shadow-lg ${k.status === 'active' ? 'bg-slate-900 border-slate-800' : 'bg-red-950/20 border-red-900/50'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${k.status === 'active' ? 'bg-slate-800 text-white' : 'bg-red-900/30 text-red-500'}`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-white">{k.alias}</h5>
                              
                              {/* Connection Status Light Indicator */}
                              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                                k.status === 'active' 
                                  ? 'bg-green-500/10 border-green-500/20 text-green-400 shadow-[0_0_8px_rgba(74,222,128,0.1)]' 
                                  : 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_8px_rgba(248,113,113,0.1)]'
                              }`}>
                                <span className="relative flex h-1.5 w-1.5">
                                  {k.status === 'active' && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  )}
                                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${k.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                </span>
                                {k.status === 'active' ? 'Connected' : k.status.replace(/_/g, ' ')}
                              </div>

                            </div>
                            <p className="text-[10px] font-mono text-slate-500 mt-1">
                              {name} • {k.key.substring(0, 6)}...{k.key.substring(k.key.length - 4)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {k.status !== 'active' && (
                            <button onClick={() => handleResetStatus(k.id)} title="Thử lại / Reset" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                              <RefreshCw size={14} />
                            </button>
                          )}
                          <button onClick={() => handleDeleteKey(k.id)} title="Xoá Key" className="p-2 bg-slate-800 hover:bg-red-900/50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Credit Bar */}
                      <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                        <CreditBar credits={k.credits} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center shrink-0">
           <div className="text-[10px] text-slate-500 flex items-center gap-2">
             <AlertCircle size={12} />
             Dữ liệu được mã hóa và lưu trữ vĩnh viễn trên thiết bị này.
           </div>
           <NeonButton onClick={onClose} size="sm">
              <span className="flex items-center gap-2"><Save size={14} /> Lưu & Đóng Vault</span>
           </NeonButton>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsModal;
