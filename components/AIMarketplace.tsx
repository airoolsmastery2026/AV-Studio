
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
            return combined.slice(0, 40); // Keep top 40 signals
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
    autoHuntInterval.current = window.setInterval(() => {
        handleAutoHunt(true);
    }, 45000); // 45s cycle for fresh data

    return () => { if (autoHuntInterval.current) clearInterval(autoHuntInterval.current); };
  }, [huntNiche]);

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      
      {/* REAL-TIME STATUS BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
              <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary animate-pulse">
                        <Activity size={24} />
                      </div>
                      <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{texts.market_feed_title || "REAL-TIME AFFILIATE INTELLIGENCE"}</h2>
                  </div>
                  <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                      Hệ thống tự động sử dụng Google Search Grounding để quét mạng lưới, phát hiện các AI Tools mới nổi có tỉ lệ hoa hồng cao và tiềm năng Viral vượt trội.
                  </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center min-w-[240px] shadow-xl">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Network Status</div>
                  <div className="flex items-center gap-2 mb-4">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-neon"></span>
                      <span className="text-xs font-mono font-black text-green-400">RADAR ACTIVE</span>
                  </div>
                  <div className="text-[9px] text-slate-600 uppercase font-black mb-1">Signals Processed</div>
                  <div className="text-2xl font-black text-white font-mono">{liveFeed.length}</div>
              </div>
          </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
          {/* CONTROL RADAR */}
          <div className="lg:w-80 shrink-0 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-20">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Crosshair size={14} className="text-primary" /> Intelligence focus
                  </h3>
                  <div className="space-y-4">
                      <div>
                          <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block">Industry Sector</label>
                          <select 
                            value={huntNiche} 
                            onChange={(e) => setHuntNiche(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-primary transition-all font-bold"
                          >
                              <option value="Global AI Software & SaaS Trends">🤖 Global AI SaaS (Premium)</option>
                              <option value="Best selling AI Gadgets 2025">🏠 AI Smart Home</option>
                              <option value="High CPC Crypto & FinTech Tools">💰 Finance & Web3</option>
                              <option value="Viral Beauty & Health Trends Global">🥗 Health & Wellness</option>
                          </select>
                      </div>
                      <NeonButton onClick={() => handleAutoHunt()} disabled={isHunting} className="w-full h-12">
                          {isHunting ? <RefreshCw className="animate-spin" size={18} /> : "RE-SCAN MARKET"}
                      </NeonButton>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500">
                          <span>Grounding Logic</span>
                          <span className="text-white">Active</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500">
                          <span>Search Depth</span>
                          <span className="text-primary">Deep Scan</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* OPPORTUNITY FEED: DANHSACH1 STYLE */}
          <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center px-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Globe size={14} className="text-blue-400" /> Live Opportunity Pulse
                  </h3>
                  <div className="flex items-center gap-3">
                     {isHunting && <span className="text-[10px] text-slate-500 animate-pulse italic">{texts.market_live_discovery}</span>}
                     <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Update every 45s</span>
                  </div>
              </div>

              <div className="space-y-3 custom-scrollbar max-h-[1200px] overflow-y-auto pr-2">
                  {liveFeed.length === 0 && !isHunting && (
                      <div className="text-center py-20 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl">
                          <Layers size={48} className="text-slate-800 mx-auto mb-4 opacity-20" />
                          <p className="text-slate-600 font-bold uppercase tracking-widest">No signals yet. Scaning...</p>
                      </div>
                  )}

                  {liveFeed.map((item, idx) => (
                      <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-primary/50 transition-all group relative overflow-hidden shadow-lg animate-fade-in">
                          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                              <Zap size={100} />
                          </div>
                          
                          <div className="flex flex-col md:flex-row md:items-center gap-5">
                              {/* Icon/Rank - Unique design per rank */}
                              <div className="w-12 h-12 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center shrink-0 shadow-inner">
                                  <span className="text-lg font-black text-primary font-mono">#{idx + 1}</span>
                              </div>

                              {/* Info Content */}
                              <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-3 mb-2">
                                      <h4 className="text-lg font-black text-white truncate group-hover:text-primary transition-colors tracking-tight uppercase">{item.product_name}</h4>
                                      <div className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 text-[9px] font-black rounded uppercase flex items-center gap-1">
                                          <TrendingUp size={10} /> Opp Score: {item.opportunity_score}
                                      </div>
                                  </div>
                                  <p className="text-slate-400 text-xs mb-3 line-clamp-2 italic font-medium leading-relaxed">
                                      "{item.reason_to_promote}"
                                  </p>
                                  
                                  <div className="flex flex-wrap gap-4 items-center text-[10px] font-black uppercase">
                                      <div className="flex items-center gap-1.5 text-green-400 bg-green-900/10 px-2.5 py-1 rounded-lg border border-green-900/30">
                                          <DollarSign size={10} /> {item.commission_est}
                                      </div>
                                      <div className="flex items-center gap-1.5 text-slate-500 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                                          <Globe size={10} /> {item.network}
                                      </div>
                                      <div className="text-slate-600 font-mono tracking-tighter">
                                          Detected: {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
                                      </div>
                                  </div>
                              </div>

                              {/* Quick Action */}
                              <div className="shrink-0">
                                  <NeonButton 
                                      onClick={() => onSelectProduct(item.affiliate_link)} 
                                      className="w-full md:w-auto px-6 h-12"
                                      size="sm"
                                  >
                                      <Video size={16} /> START PRODUCTION
                                  </NeonButton>
                              </div>
                          </div>
                          
                          {/* Bottom Intel Bar */}
                          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                  <Sparkles size={12} className="text-primary" />
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Recommended Angle:</span>
                                  <span className="text-[10px] text-slate-400 truncate max-w-md">{item.content_angle || "Strategic Clone / Hybrid Review"}</span>
                              </div>
                              <ArrowRight size={14} className="text-slate-700 group-hover:text-primary transition-colors" />
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
