
import React, { useState } from 'react';
import { ShoppingBag, Star, Zap, Video, ExternalLink, Copy, Crosshair, RefreshCw, Layers, ArrowRight, ShieldCheck, Cpu, Lightbulb, Bot } from 'lucide-react';
import { AIProduct, ApiKeyConfig, AffiliateHuntResult } from '../types';
import NeonButton from './NeonButton';
import { huntAffiliateProducts } from '../services/geminiService';

interface AIMarketplaceProps {
  onSelectProduct: (url: string) => void;
  apiKeys: ApiKeyConfig[];
  t?: any;
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
  // ... (Other products)
  { 
    id: 'gemini_adv', 
    name: 'Gemini Advanced', 
    description: 'The most capable AI model from Google. Promote the future.', 
    commission_rate: 'Custom', 
    tags: ['AI Model', 'Google'], 
    affiliate_link_template: 'https://one.google.com/explore-plan/gemini-advanced',
    icon_color: 'bg-gradient-to-r from-blue-500 to-purple-500',
    is_google_ecosystem: true
  }
];

const AIMarketplace: React.FC<AIMarketplaceProps> = ({ onSelectProduct, apiKeys, t }) => {
  const texts = t || {};
  const [activeMode, setActiveMode] = useState<'marketplace' | 'auto_hunter'>('marketplace');
  const [showGoogleOnly, setShowGoogleOnly] = useState(false);
  
  const [huntNiche, setHuntNiche] = useState('AI Tools & Tech');
  const [isHunting, setIsHunting] = useState(false);
  const [huntResult, setHuntResult] = useState<AffiliateHuntResult | null>(null);

  const affiliateKeys = apiKeys.filter(k => k.category === 'affiliate' && k.status === 'active');
  const connectedNetworks = affiliateKeys.map(k => k.provider.toUpperCase());

  const displayedProducts = showGoogleOnly 
    ? MOCK_AI_PRODUCTS.filter(p => p.is_google_ecosystem)
    : MOCK_AI_PRODUCTS;

  const handleAutoHunt = async () => {
    setIsHunting(true);
    setHuntResult(null);
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
    if (!googleKey) {
        alert("Key Error.");
        setIsHunting(false);
        return;
    }
    try {
        const result = await huntAffiliateProducts(googleKey.key, huntNiche, connectedNetworks.length > 0 ? connectedNetworks : ['GLOBAL_BESTSELLERS']);
        setHuntResult(result);
    } catch (e) {
        alert("Error hunting products.");
    } finally {
        setIsHunting(false);
    }
  };

  const setAiToolsPreset = () => {
      setHuntNiche("Trending AI SaaS Tools & High Ticket Software");
      // Optionally trigger immediately, but better to let user confirm
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      
      <div className="flex gap-4 border-b border-slate-800 pb-2 mb-4 justify-between items-center">
         <div className="flex gap-4">
             <button 
               onClick={() => setActiveMode('marketplace')}
               className={`text-sm font-bold px-4 py-2 rounded-t-lg transition-colors flex items-center gap-2 ${activeMode === 'marketplace' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}
             >
                <ShoppingBag size={16} /> {texts.tab_market}
             </button>
             <button 
               onClick={() => setActiveMode('auto_hunter')}
               className={`text-sm font-bold px-4 py-2 rounded-t-lg transition-colors flex items-center gap-2 ${activeMode === 'auto_hunter' ? 'bg-slate-800 text-primary' : 'text-slate-500 hover:text-white'}`}
             >
                <Crosshair size={16} /> {texts.tab_hunter}
             </button>
         </div>

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
                 {texts.filter_google}
             </button>
         )}
      </div>

      {activeMode === 'marketplace' && (
        <>
            <div className={`bg-gradient-to-r ${showGoogleOnly ? 'from-blue-900/50 to-cyan-900/50 border-blue-500/30' : 'from-indigo-900/50 to-purple-900/50 border-indigo-500/30'} border rounded-2xl p-8 relative overflow-hidden transition-colors duration-500`}>
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Zap size={28} className={showGoogleOnly ? "text-blue-400 fill-blue-400" : "text-yellow-400 fill-yellow-400"} /> 
                    {texts.title}
                    </h2>
                    <p className="text-indigo-200 max-w-2xl text-sm leading-relaxed">
                    {texts.desc}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {displayedProducts.map((product) => (
                <div key={product.id} className={`bg-slate-900 border ${product.is_google_ecosystem ? 'border-blue-900/50' : 'border-slate-800'} rounded-xl p-6 hover:border-primary/50 transition-all group hover:bg-slate-800/50 relative`}>
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
                        <NeonButton 
                            onClick={() => onSelectProduct(product.affiliate_link_template)} 
                            className="flex-1"
                            size="sm"
                        >
                            <span className="flex items-center gap-2">
                            <Video size={14} /> Review Video
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
              <div className="bg-slate-900/80 border border-primary/30 rounded-2xl p-6 relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                              <Crosshair size={24} className="text-primary" /> {texts.hunter_title}
                          </h3>
                          <p className="text-sm text-slate-400 mb-4">{texts.hunter_desc}</p>

                          <div className="flex gap-2 mb-2">
                              <input 
                                  type="text" 
                                  value={huntNiche}
                                  onChange={(e) => setHuntNiche(e.target.value)}
                                  placeholder={texts.niche_placeholder}
                                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                              />
                              <NeonButton onClick={handleAutoHunt} disabled={isHunting} size="md">
                                  {isHunting ? (
                                      <span className="flex items-center gap-2"><RefreshCw className="animate-spin" size={16} /> {texts.hunting}</span>
                                  ) : texts.activate_btn}
                              </NeonButton>
                          </div>
                          
                          {/* Quick Presets */}
                          <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500 uppercase font-bold">Quick Preset:</span>
                              <button 
                                onClick={setAiToolsPreset}
                                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-700 text-xs text-blue-300 font-bold transition-colors"
                              >
                                  <Bot size={12} /> AI Tools (High Recurring)
                              </button>
                          </div>
                      </div>
                      
                      <div className="w-full md:w-64 bg-slate-950/50 rounded-xl border border-slate-800 p-4 flex flex-col justify-center items-center text-center">
                          <Layers size={32} className="text-slate-600 mb-2" />
                          <div className="text-2xl font-bold text-white font-mono">{huntResult ? huntResult.products.length : 0}</div>
                          <div className="text-xs text-slate-500 uppercase tracking-wider">{texts.results_found}</div>
                      </div>
                  </div>
              </div>

              {huntResult && (
                  <div className="animate-fade-in">
                      <div className="mb-4 bg-primary/10 border-l-4 border-primary p-4 rounded-r-lg">
                          <h4 className="text-sm font-bold text-primary mb-1">Strategy Note</h4>
                          <p className="text-sm text-slate-300 italic">"{huntResult.strategy_note}"</p>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                          {huntResult.products.map((prod, idx) => (
                              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 hover:border-slate-600 transition-colors">
                                  <div className="flex-1 text-center md:text-left">
                                      <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                          <h4 className="font-bold text-white text-lg">{prod.product_name}</h4>
                                          {/* AI / Recurring Badge */}
                                          {(prod.product_name.toLowerCase().includes('ai') || prod.commission_est.includes('Month') || prod.commission_est.includes('Recurring')) && (
                                              <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 border border-blue-500/20 text-[10px] font-bold rounded uppercase">
                                                  Recurring / AI
                                              </span>
                                          )}
                                      </div>
                                      <p className="text-sm text-slate-400 mb-2">{prod.reason_to_promote}</p>
                                      <div className="flex items-center gap-2 justify-center md:justify-start">
                                          <span className="text-xs text-slate-500">{prod.network}</span>
                                          <span className="text-xs font-bold text-green-400 bg-green-900/10 px-2 py-0.5 rounded">{prod.commission_est}</span>
                                      </div>
                                  </div>
                                  <div className="shrink-0 flex gap-2 w-full md:w-auto">
                                      <NeonButton 
                                          onClick={() => onSelectProduct(prod.affiliate_link)}
                                          size="sm"
                                          className="w-full md:w-auto"
                                      >
                                          <span className="flex items-center gap-2"><Video size={14}/> Create</span>
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
