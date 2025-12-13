
import React, { useState } from 'react';
import { 
  Cpu, Database, Save, Trash2, Plus, 
  Brain, Shield, RefreshCw, Key, 
  ChevronDown, ChevronUp, AlertCircle, Check, 
  Terminal, Sparkles, BookOpen, Layers,
  Youtube, ShoppingBag, MessageCircle, Facebook, Instagram, Twitter, Globe, Banknote, CreditCard, ExternalLink, Info, Zap, Smartphone, TrendingUp, Image, Images, Linkedin, Send, Pin, ShoppingCart, Truck, MapPin, Video, MonitorPlay
} from 'lucide-react';
import NeonButton from './NeonButton';
import { ApiKeyConfig, KnowledgeBase } from '../types';

interface SettingsDashboardProps {
  apiKeys: ApiKeyConfig[];
  setApiKeys: (keys: ApiKeyConfig[]) => void;
  knowledgeBase: KnowledgeBase;
  setKnowledgeBase: (kb: KnowledgeBase) => void;
}

interface ProviderConfig {
  id: string;
  name: string;
  url: string;
  icon: any;
  desc: string;
  instructions: string;
  inputLabel: string;
  keyPlaceholder?: string; // New field for key examples
  region?: 'vn' | 'global';
}

// --- DATA: CONFIGURATION FOR PROVIDERS ---
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
      name: 'OpenAI (ChatGPT 5)', 
      url: 'https://platform.openai.com/api-keys', 
      icon: Sparkles, 
      desc: 'Next-Gen Reasoning & Multi-Modal',
      instructions: '1. Truy cập OpenAI Platform.\n2. Đăng nhập và vào API Keys.\n3. Tạo Secret Key mới (bắt đầu bằng sk-...).',
      inputLabel: 'OpenAI API Key',
      keyPlaceholder: 'sk-proj-...'
    },
    { 
      id: 'veo', 
      name: 'Google Veo (Video FX)', 
      url: 'https://deepmind.google/technologies/veo/', 
      icon: MonitorPlay, 
      desc: 'High-fidelity Video Generation',
      instructions: '1. Nếu bạn đã có quyền truy cập Veo trên AI Studio, hãy dùng lại Key Gemini ở trên.\n2. Nếu dùng qua Vertex AI (GCP), hãy nhập Token riêng tại đây.',
      inputLabel: 'Gemini Key / Vertex Token',
      keyPlaceholder: 'AIzaSy...'
    },
    { 
      id: 'stitch', 
      name: 'Google ImageFX (Stitch)', 
      url: 'https://stitch.withgoogle.com/', 
      icon: Image, 
      desc: 'Imagen 3 Generative Tools',
      instructions: '1. Thường dùng chung Key với Gemini (Google AI Studio).\n2. Nhập lại Key Gemini vào đây nếu muốn quản lý quota riêng.',
      inputLabel: 'API Key',
      keyPlaceholder: 'AIzaSy...'
    },
    { 
      id: 'wish', 
      name: 'Wish (Bulk Image Gen)', 
      url: 'https://wish.com/ai/developers', 
      icon: Images, 
      desc: 'Batch Processing & Asset Generation',
      instructions: '1. Truy cập Wish Developer Portal.\n2. Chọn dịch vụ "Batch Asset Generation".\n3. Tạo API Key với quyền Write Queue.',
      inputLabel: 'Batch API Key',
      keyPlaceholder: 'wish_live_...'
    },
  ],
  social: [
    { 
      id: 'tiktok', 
      name: 'TikTok for Developers', 
      url: 'https://developers.tiktok.com/apps/', 
      icon: Video, 
      desc: 'Viral, GenZ, High Engagement',
      instructions: '1. Tạo ứng dụng trên TikTok Developers.\n2. Trong App Settings, lấy "Client Key" và "Client Secret".\n3. Tạo "Long-lived Access Token" thông qua OAuth flow hoặc Testing Tool.',
      inputLabel: 'Access Token',
      keyPlaceholder: 'act.E8bb...'
    },
    { 
      id: 'youtube', 
      name: 'YouTube Data API v3', 
      url: 'https://console.cloud.google.com/apis/library/youtube.googleapis.com', 
      icon: Youtube, 
      desc: 'Search, Long-form, High RPM',
      instructions: '1. Google Cloud Console -> Tạo Project riêng -> Enable "YouTube Data API v3".\n2. Credentials -> Create API Key.\n3. (Quan trọng) Để upload, bạn cần tạo OAuth 2.0 Client ID và lấy Refresh Token.',
      inputLabel: 'API Key / OAuth Token',
      keyPlaceholder: 'AIzaSy... / 1//0g...'
    },
    { 
      id: 'zalo', 
      name: 'Zalo OA (Official Account)', 
      url: 'https://developers.zalo.me/', 
      icon: MessageCircle, 
      desc: 'Vietnam CRM & Zalo Video',
      instructions: '1. Truy cập Zalo Developers -> Tools -> API Explorer.\n2. Chọn ứng dụng và OA cần liên kết.\n3. Chọn quyền "zalo_video_publish" (Đăng video) và "oa_manage" (Quản lý).\n4. Copy Access Token (Lưu ý: Token ngắn hạn cần cơ chế refresh).',
      inputLabel: 'OA Access Token',
      keyPlaceholder: 'v4.public.ey...'
    },
    { 
      id: 'facebook', 
      name: 'Meta Graph API', 
      url: 'https://developers.facebook.com/tools/explorer/', 
      icon: Facebook, 
      desc: 'Community, GenX/Y, Retargeting',
      instructions: '1. Dùng Graph API Explorer.\n2. Chọn App và Quyền (pages_show_list, pages_read_engagement, pages_manage_posts).\n3. Generate Access Token (Chọn Page Token, không phải User Token).',
      inputLabel: 'Page Access Token',
      keyPlaceholder: 'EAA...'
    },
    { 
      id: 'instagram', 
      name: 'Instagram Graph API', 
      url: 'https://developers.facebook.com/docs/instagram-api/', 
      icon: Instagram, 
      desc: 'Lifestyle, Fashion, Visual High-End',
      instructions: '1. Liên kết Instagram Business với Facebook Page.\n2. Tạo App trên Meta Developers.\n3. Lấy Token có quyền instagram_content_publish.',
      inputLabel: 'Access Token',
      keyPlaceholder: 'IGQV...'
    },
    { 
      id: 'twitter', 
      name: 'X (Twitter) API', 
      url: 'https://developer.twitter.com/en/portal/dashboard', 
      icon: Twitter, 
      desc: 'Crypto, Tech, News, US/EU Market',
      instructions: '1. Đăng ký tài khoản Developer Portal.\n2. Tạo Project & App.\n3. Lấy API Key, API Secret và Bearer Token (v2).',
      inputLabel: 'Bearer Token',
      keyPlaceholder: 'AAAAAAAAAAAAAAAAAAAA...'
    },
    { 
      id: 'linkedin', 
      name: 'LinkedIn API', 
      url: 'https://www.linkedin.com/developers/apps', 
      icon: Linkedin, 
      desc: 'B2B, High Ticket, Professional',
      instructions: '1. Tạo App trên LinkedIn Developers.\n2. Xác thực doanh nghiệp (Verify).\n3. Lấy Client ID & Secret để tạo OAuth Token (Scope: w_member_social).',
      inputLabel: 'OAuth Token',
      keyPlaceholder: 'AQXu...'
    },
    { 
      id: 'pinterest', 
      name: 'Pinterest API', 
      url: 'https://developers.pinterest.com/', 
      icon: Pin, 
      desc: 'E-com, Decor, DIY, High Conversion',
      instructions: '1. Đăng ký tài khoản doanh nghiệp.\n2. Tạo App và lấy Access Token.\n3. Phù hợp nhất cho thị trường Mỹ/Âu (Traffic Source mạnh).',
      inputLabel: 'Access Token',
      keyPlaceholder: 'pina_...'
    },
    { 
      id: 'telegram', 
      name: 'Telegram Bot API', 
      url: 'https://core.telegram.org/bots', 
      icon: Send, 
      desc: 'Crypto Signals, MMO Community',
      instructions: '1. Chat với @BotFather trên Telegram.\n2. Gõ lệnh /newbot để tạo bot mới.\n3. Sao chép HTTP API Token.',
      inputLabel: 'Bot Token',
      keyPlaceholder: '123456789:AA...'
    },
  ],
  affiliate: [
    // --- VIETNAM PLATFORMS ---
    { 
      id: 'accesstrade', 
      name: 'AccessTrade Vietnam', 
      url: 'https://pub.accesstrade.vn/tools/api', 
      icon: Globe, 
      desc: 'Mạng lưới Affiliate số 1 VN',
      instructions: '1. Đăng ký Publisher tại AccessTrade.\n2. Vào Công cụ -> API.\n3. Tạo và sao chép Access Token.',
      inputLabel: 'Access Token',
      keyPlaceholder: 'Token...',
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
      keyPlaceholder: 'Token...',
      region: 'vn'
    },
    { 
      id: 'ecomobi', 
      name: 'Ecomobi SSP (KOC)', 
      url: 'https://ssp.ecomobi.com/', 
      icon: Smartphone, 
      desc: 'Social Selling tốt nhất cho KOC',
      instructions: '1. Đăng ký Ecomobi SSP/Passio.\n2. Vào Profile -> Thiết lập API.\n3. Lấy Access Token để tạo link tự động.',
      inputLabel: 'SSP Access Token',
      keyPlaceholder: 'Bearer ...',
      region: 'vn'
    },
    { 
      id: 'adflex', 
      name: 'AdFlex CPO', 
      url: 'https://cpo.adflex.vn/', 
      icon: TrendingUp, 
      desc: 'Hoa hồng cao (Dược/Mỹ phẩm)',
      instructions: '1. Đăng ký AdFlex CPO.\n2. Liên hệ AM (Account Manager) để mở API.\n3. Lấy API Key trong Dashboard.',
      inputLabel: 'API Key',
      keyPlaceholder: 'Token...',
      region: 'vn'
    },
    { 
      id: 'shopee', 
      name: 'Shopee Affiliate VN', 
      url: 'https://affiliate.shopee.vn/', 
      icon: ShoppingBag, 
      desc: 'Sàn TMĐT phổ biến nhất ĐNA',
      instructions: '1. Đăng ký Shopee Affiliate.\n2. Vào Open Platform nếu bạn là Developer, hoặc dùng Link Tracking thông thường.',
      inputLabel: 'App ID / Key',
      keyPlaceholder: 'Key...',
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
      keyPlaceholder: 'AppKey...',
      region: 'vn'
    },
    // --- GLOBAL PLATFORMS ---
    { 
      id: 'digistore24', 
      name: 'Digistore24', 
      url: 'https://www.digistore24.com/manager/account/details', 
      icon: CreditCard, 
      desc: 'Digital Products & CPO Commissions',
      instructions: '1. Vào Settings -> Account Access.\n2. Quan trọng: Thêm IP hiện tại vào "IP Access" (Whitelist).\n3. Tạo API Key quyền Read/Write để theo dõi CPO.',
      inputLabel: 'API Key',
      keyPlaceholder: 'xxxx-xxxx...',
      region: 'global'
    },
    { 
      id: 'amazon', 
      name: 'Amazon Associates', 
      url: 'https://affiliate-program.amazon.com/', 
      icon: ShoppingCart, 
      desc: 'Thị trường số 1 US/EU/JP',
      instructions: '1. Đăng ký Amazon Associates.\n2. Vào Tools -> Product Advertising API.\n3. Tạo Access Key và Secret Key.',
      inputLabel: 'Access Key ID:Secret Key',
      keyPlaceholder: 'AKIA...:SECRET...',
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
      keyPlaceholder: 'AppID...',
      region: 'global'
    },
    { 
      id: 'etsy', 
      name: 'Etsy Affiliate', 
      url: 'https://www.etsy.com/developers/documentation', 
      icon: ShoppingBag, 
      desc: 'Handmade, Vintage, Niche Gifts',
      instructions: '1. Tạo App tại Etsy Developers.\n2. Lấy Keystring (API Key).\n3. Sử dụng để quét sản phẩm trending.',
      inputLabel: 'Keystring API Key',
      keyPlaceholder: 'Key...',
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
      keyPlaceholder: 'UUID...',
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
      keyPlaceholder: 'Key...',
      region: 'global'
    },
    { 
      id: 'clickbank', 
      name: 'ClickBank (Global)', 
      url: 'https://accounts.clickbank.com/master/api_credentials', 
      icon: Banknote, 
      desc: 'Sản phẩm số (Digital) High Ticket',
      instructions: '1. Đăng nhập ClickBank -> Account Settings.\n2. Chọn Developer API Keys.\n3. Tạo Key mới (Clerk API Key).',
      inputLabel: 'Dev API Key',
      keyPlaceholder: 'API-Key...',
      region: 'global'
    },
    { 
      id: 'cj', 
      name: 'CJ Affiliate', 
      url: 'https://developers.cj.com/', 
      icon: Globe, 
      desc: 'Thương hiệu lớn (GoDaddy, HostGator...)',
      instructions: '1. CJ Developer Portal.\n2. Authentication -> Personal Access Tokens.',
      inputLabel: 'Personal Access Token',
      keyPlaceholder: 'Token...',
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
      inputLabel: 'REST_URL;TOKEN',
      keyPlaceholder: 'https://...;token...'
    },
  ]
};

const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ 
  apiKeys, 
  setApiKeys,
  knowledgeBase,
  setKnowledgeBase
}) => {
  const [activeTab, setActiveTab] = useState<'brain' | 'vault' | 'system'>('brain');
  
  // Vault specific states
  const [activeVaultTab, setActiveVaultTab] = useState<'model'|'social'|'affiliate'|'storage'>('model');
  const [affiliateRegion, setAffiliateRegion] = useState<'vn' | 'global'>('vn'); // NEW: Region Filter

  const [newKey, setNewKey] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter Logic
  let currentProviders = PROVIDERS_DATA[activeVaultTab];
  if (activeVaultTab === 'affiliate') {
    currentProviders = currentProviders.filter(p => p.region === affiliateRegion);
  }

  const selectedProviderConfig = PROVIDERS_DATA[activeVaultTab].find(p => p.id === selectedProviderId);
  const currentKeys = apiKeys.filter(k => k.category === activeVaultTab);

  const handleAddKey = () => {
    if (!newKey.trim() || !selectedProviderId) return;
    
    const keyConfig: ApiKeyConfig = {
      id: crypto.randomUUID(),
      alias: newAlias || `${selectedProviderId.toUpperCase()}-${apiKeys.length + 1}`,
      key: newKey.trim(),
      provider: selectedProviderId as any,
      category: activeVaultTab,
      status: 'active',
      credits: { remaining: 1000000, total: 1000000, unit: 'tokens' }
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

  // --- BRAIN LOGIC ---
  const handleUpdateInstructions = (text: string) => {
    setKnowledgeBase({ ...knowledgeBase, customInstructions: text, lastUpdated: Date.now() });
  };

  const handleClearMemory = () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ kiến thức bot đã học?")) {
      setKnowledgeBase({ ...knowledgeBase, learnedPreferences: [], lastUpdated: Date.now() });
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-xl">
           <SettingsIcon activeTab={activeTab} />
        </div>
        <div>
           <h2 className="text-3xl font-bold text-white">Trung Tâm Điều Khiển</h2>
           <p className="text-slate-400">Cấu hình Bot, Quản lý Key và Dạy AI học tập.</p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-1">
        {[
          { id: 'brain', label: 'AI Brain & Learning', icon: Brain },
          { id: 'vault', label: 'API Vault (Kết nối)', icon: Shield },
          { id: 'system', label: 'System Config', icon: Terminal },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-t-xl text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === tab.id 
                ? 'bg-slate-900 text-primary border-t border-x border-slate-800' 
                : 'text-slate-500 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 min-h-[500px]">
        
        {/* TAB: BRAIN */}
        {activeTab === 'brain' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     <BookOpen size={20} className="text-purple-400" /> Hướng dẫn Tùy chỉnh (System Prompt)
                   </h3>
                   <span className="text-xs text-slate-500">Bot sẽ luôn tuân thủ quy tắc này</span>
                </div>
                <textarea 
                  value={knowledgeBase.customInstructions}
                  onChange={(e) => handleUpdateInstructions(e.target.value)}
                  placeholder="VD: Luôn sử dụng giọng văn hài hước. Ưu tiên các sản phẩm công nghệ giá cao. Đừng bao giờ đề xuất nội dung quá dài..."
                  className="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono leading-relaxed resize-none"
                />
                <p className="text-xs text-slate-500 flex gap-2">
                  <Sparkles size={14} className="text-yellow-500" /> 
                  Mẹo: Bạn có thể yêu cầu Bot đóng vai một chuyên gia cụ thể tại đây.
                </p>
             </div>

             <div className="space-y-6">
                <div>
                   <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                     <Layers size={20} className="text-blue-400" /> Bộ nhớ Tự học (Auto-Learned)
                   </h3>
                   <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 h-64 overflow-y-auto space-y-2">
                      {knowledgeBase.learnedPreferences.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600">
                           <Brain size={32} className="mb-2 opacity-50" />
                           <p className="text-xs text-center">Chưa có dữ liệu học tập.<br/>Hãy chat với Bot và yêu cầu nó "ghi nhớ" điều gì đó.</p>
                        </div>
                      ) : (
                        knowledgeBase.learnedPreferences.map((pref, idx) => (
                          <div key={idx} className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                             <span className="text-blue-500 text-xs font-mono mt-0.5">#{idx + 1}</span>
                             <p className="text-sm text-slate-300">{pref}</p>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                <div className="flex gap-3">
                   <NeonButton onClick={() => {}} className="flex-1" size="sm">
                      Lưu cấu hình Brain
                   </NeonButton>
                   <button 
                    onClick={handleClearMemory}
                    className="px-4 py-2 bg-red-900/20 text-red-400 border border-red-900/50 rounded-lg text-sm hover:bg-red-900/40 flex items-center gap-2"
                   >
                     <Trash2 size={16} /> Reset Bộ nhớ
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* TAB: VAULT (RESTORED & IMPROVED) */}
        {activeTab === 'vault' && (
          <div className="flex flex-col md:flex-row gap-6">
             {/* Sub Sidebar */}
             <div className="w-full md:w-60 space-y-2 shrink-0">
                {[
                  { id: 'model', label: 'AI Models', icon: Cpu },
                  { id: 'social', label: 'Mạng Xã Hội', icon: Youtube },
                  { id: 'affiliate', label: 'Sàn Affiliate', icon: ShoppingBag },
                  { id: 'storage', label: 'Lưu trữ & Queue', icon: Database },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveVaultTab(item.id as any); setSelectedProviderId(''); setIsDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                      activeVaultTab === item.id 
                        ? 'bg-primary/10 text-white border border-primary/20 shadow-[0_0_15px_rgba(14,165,164,0.1)]' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
                    }`}
                  >
                    <item.icon size={18} className={activeVaultTab === item.id ? 'text-primary' : 'text-slate-500'} />
                    {item.label}
                  </button>
                ))}
             </div>

             {/* Right Content */}
             <div className="flex-1 space-y-6">
                
                {/* Add New Key Form */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative shadow-inner">
                  <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Plus size={16} className="text-primary" /> Thêm kết nối mới ({activeVaultTab})
                  </h4>

                  {/* REGION FILTER TOGGLE FOR AFFILIATE */}
                  {activeVaultTab === 'affiliate' && (
                     <div className="flex p-1 bg-slate-900 rounded-lg mb-4 border border-slate-800 w-fit">
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

                  {/* Dropdown */}
                  <div className="relative mb-4 z-20">
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-3 flex items-center justify-between text-left transition-all"
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

                  {/* Form Fields & Instructions */}
                  {selectedProviderConfig && (
                    <div className="animate-fade-in space-y-4 pt-2 border-t border-slate-800/50">
                      {/* Instructions Panel */}
                      <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                        <Info size={20} className="text-blue-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="text-xs font-bold text-blue-300 mb-2 uppercase tracking-wide">Hướng dẫn kết nối</h5>
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
                            Lấy Key ngay <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Tên Gợi Nhớ</label>
                          <input 
                            type="text" 
                            placeholder={`VD: ${selectedProviderConfig.name} - Acc 1`} 
                            value={newAlias}
                            onChange={(e) => setNewAlias(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">{selectedProviderConfig.inputLabel}</label>
                          <input 
                            type="password" 
                            placeholder={selectedProviderConfig.keyPlaceholder || "Dán key/token vào đây..."} 
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={handleAddKey}
                        className="w-full py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary hover:text-white transition-all text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <Plus size={16} /> Lưu kết nối
                      </button>
                    </div>
                  )}
                </div>

                {/* List Active Keys */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Key size={16} /> Active Connections ({currentKeys.length})
                    </h3>
                    {currentKeys.length === 0 && (
                      <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-xl">
                        Chưa có kết nối nào trong mục {activeVaultTab}.
                      </div>
                    )}
                    {currentKeys.map(k => {
                      const providerData = PROVIDERS_DATA[activeVaultTab].find(p => p.id === k.provider);
                      return (
                      <div key={k.id} className="flex justify-between items-center bg-slate-950 border border-slate-800 p-4 rounded-xl hover:border-slate-600 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${k.status === 'active' ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                              {React.createElement(providerData?.icon || Key, {size: 20})}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm flex items-center gap-2">
                                {k.alias}
                                {k.status === 'active' ? (
                                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_lime]"></span>
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 font-mono mt-0.5">
                                {k.provider.toUpperCase()} • {k.key.substring(0,6)}...{k.key.substring(k.key.length-4)}
                              </div>
                            </div>
                        </div>
                        <button onClick={() => handleDeleteKey(k.id)} className="p-2 hover:bg-red-900/20 text-slate-600 hover:text-red-500 rounded-lg transition-colors">
                            <Trash2 size={18} />
                        </button>
                      </div>
                    )})}
                </div>
             </div>
          </div>
        )}

        {/* TAB: SYSTEM */}
        {activeTab === 'system' && (
           <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Terminal size={48} className="mb-4 opacity-20" />
              <p>System Logs & Advanced Config coming soon.</p>
           </div>
        )}

      </div>
    </div>
  );
};

const SettingsIcon = ({ activeTab }: { activeTab: string }) => {
  if (activeTab === 'brain') return <Brain size={32} className="text-purple-500" />;
  if (activeTab === 'vault') return <Shield size={32} className="text-green-500" />;
  return <Terminal size={32} className="text-slate-500" />;
}

export default SettingsDashboard;
