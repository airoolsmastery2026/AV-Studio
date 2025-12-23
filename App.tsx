
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Activity, ShieldAlert, ShieldCheck, Menu, CloudSync, ZapOff, Timer, Loader2 } from 'lucide-react';
import { 
  AppStatus, TabView, ApiKeyConfig, KnowledgeBase, 
  AutoPilotStats, AutoPilotLog, PostingJob, MissionIntel, 
  CompletedVideo, ScriptModel, VisualModel, VoiceModel, 
  VideoResolution, AspectRatio, ContentLanguage, AppLanguage, AgentCommand 
} from './types';

import Sidebar from './components/Sidebar';
import ViralDNAStudio from './components/ViralDNAStudio';
import AutoPilotDashboard from './components/AutoPilotDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import QueueDashboard from './components/QueueDashboard';
import AIMarketplace from './components/AIMarketplace';
import SettingsDashboard from './components/SettingsDashboard';
import Documentation from './components/Documentation';
import AIChatAssistant from './components/AIChatAssistant';
import ConsentModal from './components/ConsentModal';
import CampaignWizard from './components/CampaignWizard';
import ChannelHealthDashboard from './components/ChannelHealthDashboard';

import { translations } from './constants/translations';
import { huntAffiliateProducts, runSeoAudit, synthesizeKnowledge, syncPlatformPolicies, getApiHealthStatus, generateVeoVideo, generateAIImage } from './services/geminiService';

const VAULT_STORAGE_KEY = 'av_studio_secure_vault_v1';
const KNOWLEDGE_BASE_KEY = 'av_studio_brain_v1';
const LIBRARY_STORAGE_KEY = 'av_studio_video_library_v1';
const UI_LANG_KEY = 'av_studio_ui_lang';
const CONTENT_LANG_KEY = 'av_studio_content_lang';

const App: React.FC = () => {
  const [appLang, setAppLang] = useState<AppLanguage>(() => (localStorage.getItem(UI_LANG_KEY) as AppLanguage) || 'vi');
  const [contentLanguage, setContentLanguage] = useState<ContentLanguage>(() => (localStorage.getItem(CONTENT_LANG_KEY) as ContentLanguage) || 'vi');
  
  const t = useMemo(() => ({ ...translations['vi'], ...(translations[appLang] || {}) }), [appLang]);

  const [activeTab, setActiveTab] = useState<TabView>('auto_pilot');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [isPolicySyncing, setIsPolicySyncing] = useState(false);
  const [apiHealth, setApiHealth] = useState(getApiHealthStatus());

  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>(() => JSON.parse(localStorage.getItem(VAULT_STORAGE_KEY) || '[]'));
  const [completedVideos, setCompletedVideos] = useState<CompletedVideo[]>(() => JSON.parse(localStorage.getItem(LIBRARY_STORAGE_KEY) || '[]'));
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>(() => {
    const saved = localStorage.getItem(KNOWLEDGE_BASE_KEY);
    return saved ? JSON.parse(saved) : { 
      customInstructions: '', learnedPreferences: [], autoImprovementEnabled: true, lastUpdated: 0,
      platformPolicies: [], globalStrategyRules: { enforceConsistency: true, seamlessTransitionLogic: true, viralFormulaId: 'f_01', algorithmOptimizationLevel: 85 }
    };
  });

  const [autoPilotActive, setAutoPilotActive] = useState(false);
  const [autoPilotStats, setAutoPilotStats] = useState<AutoPilotStats>({ cyclesRun: 0, videosCreated: 0, postedCount: 0, uptime: 0 });
  const [autoPilotLogs, setAutoPilotLogs] = useState<AutoPilotLog[]>([]);
  const [autoPilotNiche, setAutoPilotNiche] = useState('AUTO'); 
  const [currentMission, setCurrentMission] = useState<MissionIntel | null>(null);

  const [scriptModel, setScriptModel] = useState<ScriptModel>('Gemini 3 Pro');
  const [visualModel, setVisualModel] = useState<VisualModel>('VEO 3.1');
  const [voiceModel, setVoiceModel] = useState<VoiceModel>('Google Chirp');
  const [resolution, setResolution] = useState<VideoResolution>('1080p');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [jobs, setJobs] = useState<PostingJob[]>([]);

  const lastSyncAttemptRef = useRef<number>(0);

  // Persistence effects
  useEffect(() => { localStorage.setItem(UI_LANG_KEY, appLang); }, [appLang]);
  useEffect(() => { localStorage.setItem(CONTENT_LANG_KEY, contentLanguage); }, [contentLanguage]);
  useEffect(() => { localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(knowledgeBase)); }, [knowledgeBase]);
  useEffect(() => { localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(completedVideos)); }, [completedVideos]);

  // Periodically update UI about API Health
  useEffect(() => {
    const timer = setInterval(() => setApiHealth(getApiHealthStatus()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Unified Autonomous Policy Guard
  useEffect(() => {
    const runPolicySync = async () => {
      if (!process.env.API_KEY || isPolicySyncing) return;
      const now = Date.now();
      if (now - lastSyncAttemptRef.current < 900000) return; 
      
      const health = getApiHealthStatus();
      if (health.status === 'exhausted' || health.status === 'throttled') return;

      const lastSync = knowledgeBase.lastUpdated || 0;
      const hoursSinceSync = (now - lastSync) / 3600000;
      if (hoursSinceSync < 48 && knowledgeBase.platformPolicies.length > 0) return;

      setIsPolicySyncing(true);
      lastSyncAttemptRef.current = now;
      try {
        const updated = await syncPlatformPolicies(['TikTok', 'YouTube', 'Shopee']);
        if (updated && updated.length > 0) {
          setKnowledgeBase(prev => ({ ...prev, platformPolicies: updated, lastUpdated: Date.now() }));
        }
      } catch (e: any) {
        if (e.message.includes("QUOTA") || e.message.includes("429")) {
            console.warn("Policy Sync: Quota hit.");
            lastSyncAttemptRef.current = Date.now() + 21600000; 
        }
      } finally {
        setIsPolicySyncing(false);
      }
    };
    const timeout = setTimeout(runPolicySync, 20000); 
    return () => clearTimeout(timeout);
  }, [knowledgeBase.lastUpdated, knowledgeBase.platformPolicies.length, isPolicySyncing]);

  const addLog = (action: string, detail: string, status: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const newLog: AutoPilotLog = { timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }), action, detail, status };
    setAutoPilotLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  /**
   * GLOBAL RENDERER: Connects to Veo/Imagen
   */
  const handleInitiateRender = async (plan: OrchestratorResponse) => {
    if (status === AppStatus.RENDERING) return;
    
    setStatus(AppStatus.RENDERING);
    addLog("FACTORY", "Initiating Neural Render Cycle (Veo 3.1)...", "info");

    try {
      // 1. Generate Main Video
      const videoUrl = await generateVeoVideo(plan.production_plan.script_master, plan.production_plan.technical_specs.ratio);
      
      // 2. Generate Optimized Thumbnail
      const thumbUrl = await generateAIImage(plan.generated_content.thumbnail_prompt, "1:1");

      const newVideo: CompletedVideo = {
        id: crypto.randomUUID(),
        url: videoUrl,
        thumbnail: thumbUrl,
        title: plan.generated_content.title,
        timestamp: Date.now()
      };

      setCompletedVideos(prev => [newVideo, ...prev]);
      addLog("FACTORY", `Render Complete: ${plan.generated_content.title}`, "success");
      setStatus(AppStatus.COMPLETE);
      setTimeout(() => setStatus(AppStatus.IDLE), 5000);

      return newVideo;
    } catch (e: any) {
      addLog("FACTORY", `Render Failure: ${e.message}`, "error");
      setStatus(AppStatus.ERROR);
      setTimeout(() => setStatus(AppStatus.IDLE), 5000);
    }
  };

  const runAutoPilotCycle = useCallback(async () => {
    if (!process.env.API_KEY) {
        addLog("SYSTEM", "API Key required for AutoPilot", "error");
        setAutoPilotActive(false);
        return;
    }
    const health = getApiHealthStatus();
    if (health.status === 'exhausted' || health.status === 'throttled') return;
    
    try {
        setStatus(AppStatus.HUNTING);
        addLog("HUNTER", `Scouring web for ${autoPilotNiche}...`, "info");
        const hunt = await huntAffiliateProducts(process.env.API_KEY, autoPilotNiche, ['SHOPEE', 'AMAZON']);
        if (!hunt.products?.length) {
            setStatus(AppStatus.IDLE);
            return;
        }
        const target = hunt.products[0];
        addLog("HUNTER", `Target Locked: ${target.product_name}`, "success");
        
        await new Promise(r => setTimeout(r, 35000));

        setStatus(AppStatus.ANALYZING);
        const seo = await runSeoAudit(target.product_name, target.reason_to_promote, autoPilotNiche);
        setCurrentMission({ ...target, vidiq_score: seo });
        
        // AutoPilot creates the plan
        setStatus(AppStatus.PLANNING);
        const plan = await synthesizeKnowledge(process.env.API_KEY!, `Create video strategy for ${target.product_name}`, []);
        // In a real flow, we'd call generateProScript here and then handleInitiateRender
        
        setAutoPilotStats(prev => ({ ...prev, cyclesRun: prev.cyclesRun + 1 }));
        setStatus(AppStatus.IDLE);
    } catch (error: any) {
        setStatus(AppStatus.IDLE);
    }
  }, [autoPilotNiche]);

  useEffect(() => {
    if (autoPilotActive) {
        runAutoPilotCycle();
        const cycle = setInterval(runAutoPilotCycle, 1800000);
        const uptime = setInterval(() => setAutoPilotStats(p => ({ ...p, uptime: p.uptime + 1 })), 1000);
        return () => { clearInterval(cycle); clearInterval(uptime); };
    }
  }, [autoPilotActive, runAutoPilotCycle]);

  const handleCommand = (cmd: AgentCommand) => {
    if (cmd.action === 'NAVIGATE') setActiveTab(cmd.payload);
  };

  return (
    <div className="flex bg-[#020617] min-h-screen text-slate-200 font-sans overflow-hidden select-none">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} t={t} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-14 md:h-16 border-b border-slate-800/60 flex items-center justify-between px-4 md:px-6 bg-slate-950/90 backdrop-blur-2xl sticky top-0 z-[60] shadow-xl">
            <div className="flex items-center gap-3">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden"><Menu size={20} /></button>
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-primary animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white uppercase">{scriptModel.split(' ')[0]} REAL-TIME</span>
                        {isPolicySyncing && <CloudSync size={10} className="text-primary animate-spin" />}
                    </div>
                </div>
            </div>
            
            {status === AppStatus.RENDERING && (
              <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 px-5 py-2 rounded-full animate-fade-in shadow-neon">
                  <Loader2 size={16} className="text-primary animate-spin" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Veo Render Core Active...</span>
              </div>
            )}

            {apiHealth.status === 'exhausted' && (
                <div className="flex items-center gap-2 bg-red-950/50 border border-red-500/30 px-4 py-1.5 rounded-full animate-pulse">
                    <ZapOff size={14} className="text-red-500" />
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Neural Cooldown: {apiHealth.remainingCooldown}s</span>
                </div>
            )}
            
            {apiHealth.status === 'throttled' && (
                <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-500/20 px-4 py-1.5 rounded-full">
                    <Timer size={14} className="text-amber-500 animate-spin-slow" />
                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Grounding Gap: {apiHealth.remainingCooldown}s</span>
                </div>
            )}

            <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden lg:flex items-center gap-2 bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-1.5">
                   <ShieldCheck size={14} className={knowledgeBase.platformPolicies.length > 0 ? "text-green-500" : "text-slate-700"} />
                   <span className="text-[9px] font-black text-slate-400 uppercase">Policy Guard Active</span>
                </div>
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-1.5 md:px-4 md:py-2 flex items-center gap-2 shadow-inner">
                   <ShieldAlert size={14} className="text-primary" />
                   <span className="text-[9px] font-black text-white uppercase">{t.vip_badge}</span>
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            {activeTab === 'auto_pilot' && <AutoPilotDashboard apiKeys={apiKeys} isRunning={autoPilotActive} setIsRunning={(v) => v ? setIsConsentOpen(true) : setAutoPilotActive(false)} stats={autoPilotStats} logs={autoPilotLogs} currentAction={status} selectedNiche={autoPilotNiche} setSelectedNiche={setAutoPilotNiche} onAddToQueue={(j) => setJobs([j, ...jobs])} onVideoGenerated={(v) => setCompletedVideos([v, ...completedVideos])} completedVideos={completedVideos} scriptModel={scriptModel} setScriptModel={setScriptModel} visualModel={visualModel} setVisualModel={setVisualModel} voiceModel={voiceModel} setVoiceModel={setVoiceModel} resolution={resolution} setResolution={setResolution} aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} contentLanguage={contentLanguage} currentMission={currentMission} t={t} />}
            {activeTab === 'settings' && <SettingsDashboard apiKeys={apiKeys} setApiKeys={setApiKeys} knowledgeBase={knowledgeBase} setKnowledgeBase={setKnowledgeBase} onTrainBrain={async (text) => { const rules = await synthesizeKnowledge(process.env.API_KEY!, text, knowledgeBase.learnedPreferences); setKnowledgeBase(prev => ({ ...prev, learnedPreferences: [...new Set([...prev.learnedPreferences, ...rules])] })); }} t={t} appLang={appLang} setAppLang={setAppLang} contentLanguage={contentLanguage} setContentLanguage={setContentLanguage} />}
            {activeTab === 'studio' && <ViralDNAStudio predefinedTopic="" apiKeys={apiKeys} appLanguage={appLang} contentLanguage={contentLanguage} setContentLanguage={setContentLanguage} knowledgeBase={knowledgeBase} scriptModel={scriptModel} setScriptModel={setScriptModel} visualModel={visualModel} setVisualModel={setVisualModel} voiceModel={voiceModel} setVoiceModel={setVoiceModel} setResolution={setResolution} aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} completedVideos={completedVideos} setCompletedVideos={setCompletedVideos} t={t} onInitiateRender={handleInitiateRender} />}
            {activeTab === 'analytics' && <AnalyticsDashboard apiKeys={apiKeys} onDeployStrategy={() => setActiveTab('studio')} t={t} />}
            {activeTab === 'marketplace' && <AIMarketplace apiKeys={apiKeys} onSelectProduct={() => setActiveTab('studio')} t={t} />}
            {activeTab === 'risk_center' && <ChannelHealthDashboard apiKeys={apiKeys} onSendReportToChat={() => {}} t={t} />}
            {activeTab === 'queue' && <QueueDashboard apiKeys={apiKeys} currentPlan={null} jobs={jobs} setJobs={setJobs} t={t} />}
            {activeTab === 'docs' && <Documentation apiKeys={apiKeys} knowledgeBase={knowledgeBase} scriptModel={scriptModel} visualModel={visualModel} voiceModel={voiceModel} appLang={appLang} />}
            {activeTab === 'campaign' && <CampaignWizard onStartProduction={(topic) => { setActiveTab('studio'); }} onNavigateToSettings={() => setActiveTab('settings')} t={t} />}
        </div>
      </main>

      <AIChatAssistant t={t} apiKey={apiKeys.find(k => k.provider === 'google' && k.status === 'active')?.key} appContext={{ activeTab, status, urlInput: '', activeKeys: apiKeys.length, knowledgeBase }} onCommand={handleCommand} />
      <ConsentModal isOpen={isConsentOpen} onClose={() => setIsConsentOpen(false)} onConfirm={() => { setIsConsentOpen(false); setAutoPilotActive(true); }} />
    </div>
  );
};

export default App;
