
import React, { useState } from 'react';
import { ShoppingBag, Star, Zap, Video, ExternalLink, Copy, Crosshair, RefreshCw, Layers, ArrowRight, ShieldCheck, Cpu, Lightbulb } from 'lucide-react';
import { AIProduct, ApiKeyConfig, AffiliateHuntResult } from '../types';
import NeonButton from './NeonButton';
import { huntAffiliateProducts } from '../services/geminiService';

interface AIMarketplaceProps {
  onSelectProduct: (url: string) => void;
  apiKeys: ApiKeyConfig[]; // Passed from App to check available networks
}

const MOCK_AI_PRODUCTS: AIProduct[] = [
  { 
    id: 'google_workspace', 
    name: 'Google Workspace', 
    description: 'Professional email, storage, and docs. High B2B Conversion.', 
    commission_rate: '$27 per user', 
    tags: ['Productivity', 'Google'], 
    affiliate_link_template: 'https://referworkspace.app.goo.gl/?ref=avstudio',
    icon_color: 'bg-blue-600',
    is_google_ecosystem: true
  },
  { 
    id: 'gemini_adv', 
    name: 'Gemini Advanced', 
    description: 'The most capable AI model from Google. Promote the future.', 
    commission_rate: 'Custom', 
    tags: ['AI Model', 'Google'], 
    affiliate_link_template: 'https://one.google.com/explore-plan/gemini-advanced',
    icon_color: 'bg-gradient-to-r from-blue-500 to-purple-500',
    is_google_ecosystem: true
  },
  { 
    id: 'google_cloud', 
    name: 'Google Cloud Platform', 
    description: 'Cloud computing services for developers and enterprises.', 
    commission_rate: '$100 credit', 
    tags: ['Cloud', 'DevOps', 'Google'], 
    affiliate_link_template: 'https://cloud.google.com/partners',
    icon_color: 'bg-blue-500',
    is_google_ecosystem: true
  },
  { 
    id: 'tube_mastery', 
    name: 'Tube Mastery & Monetization', 
    description: 'Top-selling YouTube course on Digistore24. High conversion for "Make Money Online" niche.', 
    commission_rate: '50% (~$200)', 
    tags: ['Course', 'YouTube', 'Digistore24'], 
    affiliate_link_template: 'https://www.digistore24.com/redir/299134/AFFILIATE/',
    icon_color: 'bg-blue-800'
  },
  { 
    id: 'jasper', 
    name: 'Jasper AI', 
    description: 'AI Copywriting Assistant for Enterprise. High retention.', 
    commission_rate: '30% Lifetime', 
    tags: ['Writing', 'B2B'], 
    affiliate_link_template: 'https://jasper.ai?fpr=user123',
    icon_color: 'bg-purple-500'
  },
  { 
    id: 'midjourney', 
    name: 'Midjourney Guide', 
    description: 'Selling comprehensive prompt engineering courses.', 
    commission_rate: '50% Per Sale', 
    tags: ['Image Gen', 'Course'], 
    affiliate_link_template: 'https://gumroad.com/l/mj-guide/aff123',
    icon_color: 'bg-slate-200 text-black'
  },
  { 
    id: 'lovo', 
    name: 'Lovo.ai', 
    description: 'Hyper-realistic AI Voice Generator. Great for creators.', 
    commission_rate: '20% Recurring', 
    tags: ['Audio', 'TTS'], 
    affiliate_link_template: 'https://lovo.ai?ref=avstudio',
    icon_color: 'bg-yellow-500'
  },
  { 
    id: 'fliki', 
    name: 'Fliki', 
    description: 'Text to Video generator. Viral on TikTok.', 
    commission_rate: '30% Lifetime', 
    tags: ['Video', 'Viral'], 
    affiliate_link_template: 'https://fliki.ai/?via=promo',
    icon_color: 'bg-red-500'
  },
];

const AIMarketplace: React.FC<AIMarketplaceProps> = ({ onSelectProduct, apiKeys }) => {
  const [activeMode, setActiveMode] = useState<'marketplace' | 'auto_hunter'>('marketplace');
  const [showGoogleOnly, setShowGoogleOnly] = useState(false);
  
  // Auto Hunter State
  const [huntNiche, setHuntNiche] = useState('AI Tools & Tech');
  const [isHunting, setIsHunting] = useState(false);
  const [huntResult, setHuntResult] = useState<AffiliateHuntResult | null>(null);

  // Identify connected affiliate networks
  const affiliateKeys = apiKeys.filter(k => k.category === 'affiliate' && k.status === 'active');
  const connectedNetworks = affiliateKeys.map(k => k.provider.toUpperCase());

  // Filter products
  const displayedProducts = showGoogleOnly 
    ? MOCK_AI_PRODUCTS.filter(p => p.is_google_ecosystem)
    : MOCK_AI_PRODUCTS;

  const handleAutoHunt = async () => {
    setIsHunting(true);
    setHuntResult(null);

    // Get Gemini Key
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
    
    if (!googleKey) {
        alert("Cần có Google Gemini API Key (Active) để kích hoạt Auto-Hunter.");
        setIsHunting(false);
        return;
    }

    try {
        const result = await huntAffiliateProducts(googleKey.key, huntNiche, connectedNetworks.length > 0 ? connectedNetworks : ['GLOBAL_BESTSELLERS']);
        setHuntResult(result);
    } catch (e) {
        alert("Lỗi khi săn tìm sản phẩm. Thử lại sau.");
    } finally {
        setIsHunting(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      
      {/* Header Tabs */}
      <div className="flex gap-4 border-b border-slate-800 pb-2 mb-4 justify-between items-center">
         <div className="flex gap-4">
             <button 
               onClick={() => setActiveMode('marketplace')}
               className={`text-sm font-bold px-4 py-2 rounded-t-lg transition-colors flex items-center gap-2 ${activeMode === 'marketplace' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}
             >
                <ShoppingBag size={16} /> Sàn AI Tuyển Chọn
             </button>
             <button 
               onClick={() => setActiveMode('auto_hunter')}
               className={`text-sm font-bold px-4 py-2 rounded-t-lg transition-colors flex items-center gap-2 ${activeMode === 'auto_hunter' ? 'bg-slate-800 text-primary' : 'text-slate-500 hover:text-white'}`}
             >
                <Crosshair size={16} /> Auto-Hunter (Tự động)
             </button>
         </div>

         {/* Google Ecosystem Filter */}
         {activeMode === 'marketplace' && (
             <button 
                onClick={() => setShowGoogleOnly(!showGoogleOnly)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-2 ${
                    showGoogleOnly 
                    ? 'bg-blue-900/30 border-blue-500 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                    : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-white'
                }`}
             >
                 <Cpu size={14} /> 
                 {showGoogleOnly ? 'Google Ecosystem: ON' : 'Show Google Products Only'}
             </button>
         )}
      </div>

      {activeMode === 'marketplace' && (
        <>
            <div className={`bg-gradient-to-r ${showGoogleOnly ? 'from-blue-900/50 to-cyan-900/50 border-blue-500/30' : 'from-indigo-900/50 to-purple-900/50 border-indigo-500/30'} border rounded-2xl p-8 relative overflow-hidden transition-colors duration-500`}>
                <div className={`absolute top-0 right-0 w-64 h-64 ${showGoogleOnly ? 'bg-blue-500/10' : 'bg-indigo-500/10'} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`}></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Zap size={28} className={showGoogleOnly ? "text-blue-400 fill-blue-400" : "text-yellow-400 fill-yellow-400"} /> 
                    {showGoogleOnly ? 'Google AI Ecosystem Affiliate' : 'Sàn AI Affiliate (High Ticket)'}
                    </h2>
                    <p className="text-indigo-200 max-w-2xl text-sm leading-relaxed">
                    {showGoogleOnly 
                        ? "Tuyển chọn các công cụ thuộc hệ sinh thái Google (Workspace, Cloud, Gemini). Hệ thống sẽ tự động sử dụng Google Stack (Veo, Imagen) khi bạn chọn các sản phẩm này."
                        : "Tuyển chọn các công cụ AI có hoa hồng cao nhất. Chọn một sản phẩm và Bot sẽ tự động tạo video Review & Hướng dẫn để tối ưu chuyển đổi."
                    }
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {displayedProducts.map((product) => (
                <div key={product.id} className={`bg-slate-900 border ${product.is_google_ecosystem ? 'border-blue-900/50' : 'border-slate-800'} rounded-xl p-6 hover:border-primary/50 transition-all group hover:bg-slate-800/50 relative`}>
                    
                    {product.is_google_ecosystem && (
                        <div className="absolute top-3 right-3 text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 flex items-center gap-1">
                            <Cpu size={10} /> Google Recommended
                        </div>
                    )}

                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${product.icon_color} text-white shadow-lg`}>
                            {product.name.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                            <h3 className="text-lg font-bold text-white">{product.name}</h3>
                            <div className="flex gap-2 mt-1">
                                {product.tags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-slate-950 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                                    {tag}
                                    </span>
                                ))}
                            </div>
                            </div>
                        </div>
                        <div className="text-right mt-6 sm:mt-0">
                            <span className="block text-xs text-slate-500 mb-1">Commission</span>
                            <span className="text-green-400 font-bold font-mono">{product.commission_rate}</span>
                        </div>
                    </div>
                    
                    <p className="text-slate-300 text-sm mb-6 line-clamp-2">{product.description}</p>
                    
                    <div className="flex gap-3 pt-4 border-t border-slate-800">
                        <button className="p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-400 hover:text-white transition-colors" title="Copy Link">
                            <Copy size={16} />
                        </button>
                        <NeonButton 
                            onClick={() => onSelectProduct(product.affiliate_link_template)} 
                            className="flex-1"
                            size="sm"
                        >
                            <span className="flex items-center gap-2">
                            <Video size={14} /> Tạo Video Review
                            </span>
                        </NeonButton>
                    </div>
                </div>
                ))}
            </div>
        </>
      )}

      {activeMode === 'auto_hunter' && (
          <div className="space-y-6">
              {/* Hunter Config */}
              <div className="bg-slate-900/80 border border-primary/30 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                  <div className="relative z-10 flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                              <Crosshair size={24} className="text-primary" /> Auto-Hunter Protocol
                          </h3>
                          <p className="text-sm text-slate-400 mb-4">
                              Hệ thống sẽ tự động sử dụng các API Key đã lưu để quét sản phẩm tiềm năng, lấy link affiliate và phân tích cơ hội.
                          </p>

                          {/* Connected Networks Display */}
                          <div className="flex flex-wrap gap-2 mb-4">
                              {connectedNetworks.length > 0 ? connectedNetworks.map(net => (
                                  <span key={net} className="px-2 py-1 rounded bg-green-900/20 text-green-400 border border-green-500/30 text-xs font-bold flex items-center gap-1">
                                      <ShieldCheck size={10} /> {net}
                                  </span>
                              )) : (
                                  <span className="px-2 py-1 rounded bg-red-900/20 text-red-400 border border-red-500/30 text-xs font-bold">
                                      Chưa kết nối Network nào
                                  </span>
                              )}
                          </div>

                          <div className="flex gap-2">
                              <input 
                                  type="text" 
                                  value={huntNiche}
                                  onChange={(e) => setHuntNiche(e.target.value)}
                                  placeholder="Nhập ngách (VD: Kitchen Gadgets, Pet Toys, Crypto Wallets)..."
                                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                              />
                              <NeonButton onClick={handleAutoHunt} disabled={isHunting} size="md">
                                  {isHunting ? (
                                      <span className="flex items-center gap-2"><RefreshCw className="animate-spin" size={16} /> Hunting...</span>
                                  ) : "Kích hoạt Hunter"}
                              </NeonButton>
                          </div>
                      </div>
                      
                      <div className="w-full md:w-64 bg-slate-950/50 rounded-xl border border-slate-800 p-4 flex flex-col justify-center items-center text-center">
                          <Layers size={32} className="text-slate-600 mb-2" />
                          <div className="text-2xl font-bold text-white font-mono">{huntResult ? huntResult.products.length : 0}</div>
                          <div className="text-xs text-slate-500 uppercase tracking-wider">Sản phẩm tìm thấy</div>
                      </div>
                  </div>
              </div>

              {/* Hunt Results */}
              {huntResult && (
                  <div className="animate-fade-in">
                      <div className="mb-4 bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                          <h4 className="text-sm font-bold text-primary mb-1">Chiến lược đề xuất (Strategy Note)</h4>
                          <p className="text-sm text-slate-300 italic">"{huntResult.strategy_note}"</p>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                          {huntResult.products.map((prod, idx) => (
                              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 hover:border-slate-600 transition-colors">
                                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center font-bold text-white border border-slate-700 shrink-0">
                                      {idx + 1}
                                  </div>
                                  
                                  <div className="flex-1 text-center md:text-left">
                                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                          <h4 className="font-bold text-white text-lg">{prod.product_name}</h4>
                                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700 w-fit mx-auto md:mx-0">
                                              {prod.network}
                                          </span>
                                      </div>
                                      <p className="text-sm text-slate-400 mb-2">{prod.reason_to_promote}</p>
                                      
                                      {/* CONTENT STRATEGY & METRICS */}
                                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono mb-2">
                                          <span className="text-green-400">Est. Comm: {prod.commission_est}</span>
                                          <span className="text-yellow-400">Opp Score: {prod.opportunity_score}/100</span>
                                      </div>
                                      
                                      {/* Content Angle */}
                                      <div className="flex items-start gap-2 bg-blue-900/10 p-2 rounded-lg border border-blue-500/20 text-left">
                                          <Lightbulb size={14} className="text-blue-400 shrink-0 mt-0.5" />
                                          <p className="text-xs text-blue-200"><strong>Angle:</strong> {prod.content_angle}</p>
                                      </div>
                                  </div>

                                  <div className="shrink-0 flex gap-2 w-full md:w-auto">
                                      <NeonButton 
                                          onClick={() => onSelectProduct(prod.affiliate_link)}
                                          size="sm"
                                          className="w-full md:w-auto"
                                      >
                                          <span className="flex items-center gap-2">Triển khai <ArrowRight size={14}/></span>
                                      </NeonButton>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      )}

    </div>
  );
};

export default AIMarketplace;
