
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Zap, Video, ExternalLink, Crosshair, RefreshCw, Layers, ArrowRight, ShieldCheck, Cpu, Bot, TrendingUp, DollarSign, Globe, Sparkles, Activity } from 'lucide-react';
import { AIProduct, ApiKeyConfig, AffiliateHuntResult } from '../types';
import NeonButton from './NeonButton';
import { huntAffiliateProducts } from '../services/geminiService';

interface AIMarketplaceProps {
  onSelectProduct: (url: string) => void;
  apiKeys: ApiKeyConfig[];
  t?: any;
}

const AIMarketplace: React.FC<AIMarketplaceProps> = ({ onSelectProduct, apiKeys, t }) => {
  const texts = t || {};
  const [huntNiche, setHuntNiche] = useState('Global AI Software & SaaS Trends');
  const [isHunting, setIsHunting] = useState(false);
  const [liveFeed, setLiveFeed] = useState<any[]>([]);
  const [lastScanTime, setLastScanTime] = useState<number>(Date.now());

  const autoHuntInterval = useRef<number | null>(null);

  const affiliateKeys = apiKeys.filter(k => k.category === 'affiliate' && k.status === 'active');
  const connectedNetworks = affiliateKeys.map(k => k.provider.toUpperCase());

  const handleAutoHunt = async (silent = false) => {
    if (!silent) setIsHunting(true);
    const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
    if (!googleKey) {
        if (!silent) console.warn("Google API Key missing for hunter.");
        setIsHunting(false);
        return;
    }
    try {
        const result = await huntAffiliateProducts(googleKey.key, huntNiche, connectedNetworks.length > 0 ? connectedNetworks : ['GLOBAL_AFFILIATE_NETWORKS']);
        const newProducts = (result.products || []).map(p => ({
            ...p,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            strategy_note: result.strategy_note
        }));
        setLiveFeed(prev => {
            const combined = [...newProducts, ...prev];
            return combined.slice(0, 40);
        });
        setLastScanTime(Date.now());
    } catch (e) {
        console.error("Signal discovery failed", e);
    } finally {
        if (!silent) setIsHunting(false);
    }
  };

  useEffect(() => {
    handleAutoHunt();
    autoHuntInterval.current = window.setInterval(() => { handleAutoHunt(true); }, 45000);
    return () => { if (autoHuntInterval.current) clearInterval(autoHuntInterval.current); };
  }, [huntNiche]);

  return (
    <div className="animate-fade-in space-y-4 md:space-y-6 pb-12">
      {/* Banner - More compact on Mobile */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
              <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                      <Activity size={20} className="text-primary animate-pulse" />
                      <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase">{texts.market_feed_title || "AFFILIATE INTEL"}</h2>
                  </div>
                  <p className="text-slate-500 text-[10px] md:text-xs max-w-lg leading-relaxed mx-auto md:mx-0">
                      Discovery radar scours the web for trending AI tools and high-commission bounty programs.
                  </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2">
                  <div className="text-center">
                      <div className="text-[7px] text-slate-500 font-black uppercase mb-0.5">Live Signals</div>
                      <div className="text-lg font-black text-white font-mono">{liveFeed.length}</div>
                  </div>
                  <div className="w-px h-6 bg-slate-800"></div>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>
          </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Radar Controls - Full width on Mobile */}
          <div className="lg:w-72 shrink-0">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Crosshair size={14} className="text-primary" /> Sector Select
                  </h3>
                  <div className="space-y-3">
                      <select 
                        value={huntNiche} 
                        onChange={(e) => setHuntNiche(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] text-white outline-none focus:border-primary font-bold uppercase"
                      >
                          <option value="Global AI Software & SaaS Trends">🤖 AI SaaS</option>
                          <option value="Best selling AI Gadgets 2025">🏠 Smart Home</option>
                          <option value="High CPC Crypto & FinTech Tools">💰 Web3 Tools</option>
                      </select>
                      <button onClick={() => handleAutoHunt()} disabled={isHunting} className="w-full h-10 bg-primary text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-neon flex items-center justify-center gap-2">
                          {isHunting ? <RefreshCw className="animate-spin" size={14} /> : "RE-SCAN RADAR"}
                      </button>
                  </div>
              </div>
          </div>

          {/* Opportunity Feed - Mobile Card list */}
          <div className="flex-1 space-y-3">
              <div className="flex justify-between items-center px-1">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Globe size={12} className="text-blue-400" /> Market Pulse
                  </h3>
                  <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Auto-updating...</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[1000px] overflow-y-auto pr-1 custom-scrollbar">
                  {liveFeed.map((item, idx) => (
                      <div key={item.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 hover:border-primary/40 transition-all group animate-fade-in relative overflow-hidden">
                          <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center shrink-0">
                                  <span className="text-sm font-black text-primary font-mono">#{idx + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-black text-white truncate uppercase tracking-tight mb-1">{item.product_name}</h4>
                                  <div className="flex items-center gap-2 mb-2">
                                      <div className="px-1.5 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 text-[8px] font-black rounded uppercase flex items-center gap-1">
                                          <DollarSign size={8} /> {item.commission_est}
                                      </div>
                                      <div className="px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 text-[8px] font-black rounded uppercase">
                                          SCORE: {item.opportunity_score}
                                      </div>
                                  </div>
                                  <p className="text-slate-500 text-[9px] italic line-clamp-1">"{item.reason_to_promote}"</p>
                              </div>
                              <button onClick={() => onSelectProduct(item.affiliate_link)} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all">
                                  <Video size={16} />
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};

export default AIMarketplace;
