
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  AppStatus, TabView, AppContext, ApiKeyConfig, 
  KnowledgeBase, AutoPilotStats, AutoPilotLog, 
  PostingJob, CompletedVideo,
  ScriptModel, VisualModel, VoiceModel, VideoResolution, AspectRatio,
  ContentLanguage, AppLanguage, AgentCommand
} from './types';

// Components
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

// Services & Translations
import { huntAffiliateProducts, generateProScript, generateGeminiTTS } from './services/geminiService';
import { translations } from './constants/translations';

const VAULT_STORAGE_KEY = 'av_studio_secure_vault_v1';
const KNOWLEDGE_BASE_KEY = 'av_studio_brain_v1';

const App: React.FC = () => {
  const [appLang, setAppLang] = useState<AppLanguage>(() => {
    return (localStorage.getItem('av_studio_ui_lang') as AppLanguage) || 'vi';
  });
  
  // Safe Translation Fallback
  const t = useMemo(() => {
    const base = translations['en']; 
    const selected = translations[appLang] || base;
    return { ...base, ...selected };
  }, [appLang]);

  const [activeTab, setActiveTab] = useState<TabView>('auto_pilot');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);

  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>(() => {
    const saved = localStorage.getItem(VAULT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>(() => {
    const saved = localStorage.getItem(KNOWLEDGE_BASE_KEY);
    return saved ? JSON.parse(saved) : { customInstructions: '', learnedPreferences: [], autoImprovementEnabled: true, lastUpdated: Date.now() };
  });

  const [scriptModel, setScriptModel] = useState<ScriptModel>('Gemini 3 Pro');
  const [visualModel, setVisualModel] = useState<VisualModel>('VEO');
  const [voiceModel, setVoiceModel] = useState<VoiceModel>('Google Chirp');
  const [resolution, setResolution] = useState<VideoResolution>('1080p');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [contentLanguage, setContentLanguage] = useState<ContentLanguage>('vi');
  const [campaignTopic, setCampaignTopic] = useState('');

  const [autoPilotActive, setAutoPilotActive] = useState(false);
  const [autoPilotStats, setAutoPilotStats] = useState<AutoPilotStats>({ cyclesRun: 0, videosCreated: 0, postedCount: 0, uptime: 0 });
  const [autoPilotLogs, setAutoPilotLogs] = useState<AutoPilotLog[]>([]);
  const [autoPilotNiche, setAutoPilotNiche] = useState('AUTO');

  const [jobs, setJobs] = useState<PostingJob[]>([]);
  const loopRef = useRef<number | null>(null);

  const handleLangChange = (lang: AppLanguage) => {
    setAppLang(lang);
    localStorage.setItem('av_studio_ui_lang', lang);
  };

  const runAutonomousCycle = async () => {
      if (!autoPilotActive) return;
      const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
      if (!googleKey) {
          setAutoPilotActive(false);
          return;
      }
      try {
          setStatus(AppStatus.ANALYZING);
          const hunt = await huntAffiliateProducts(googleKey.key, autoPilotNiche, ['SHOPEE', 'TIKTOK_SHOP']);
          if (!hunt.products || hunt.products.length === 0) throw new Error("No trends found");
          
          setStatus(AppStatus.PLANNING);
          const target = hunt.products[0];
          const plan = await generateProScript(googleKey.key, {
              structure: { hook_type: 'Benefit', pacing: 'Fast', avg_scene_duration: 3 },
              emotional_curve: ['Curiosity'],
              keywords: [target.product_name],
              algorithm_fit_score: 90,
              risk_level: 'Safe'
          }, { topic: target.product_name, contentLanguage } as any, knowledgeBase);

          setStatus(AppStatus.RENDERING);
          await generateGeminiTTS(plan.production_plan.script_master);
          
          setAutoPilotStats(prev => ({
              ...prev,
              videosCreated: prev.videosCreated + 1,
              uptime: prev.uptime + 300
          }));
      } catch (e: any) {
          console.error(e);
      } finally {
          setStatus(AppStatus.IDLE);
      }
  };

  useEffect(() => {
    if (autoPilotActive) {
      runAutonomousCycle();
      loopRef.current = window.setInterval(runAutonomousCycle, 180000); 
    } else if (loopRef.current) {
      clearInterval(loopRef.current);
    }
    return () => { if (loopRef.current) clearInterval(loopRef.current); };
  }, [autoPilotActive]);

  const handleCommand = useCallback((command: AgentCommand) => {
    if (command.action === 'NAVIGATE') setActiveTab(command.payload);
  }, []);

  const handleCampaignStart = (topic: string) => {
    setCampaignTopic(topic);
    setActiveTab('studio');
  };

  return (
    <div className="flex bg-[#020617] min-h-screen text-slate-200 font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        t={t} 
      />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AGENT STATUS</span>
                <span className={`text-xs font-bold px-2 py-1 rounded border ${autoPilotActive ? 'text-primary border-primary/20 bg-primary/5' : 'text-slate-500 border-slate-800'}`}>
                    {autoPilotActive ? `LIVE: ${status}` : 'OFFLINE'}
                </span>
            </div>
            <div className="flex items-center gap-4">
                <select value={appLang} onChange={(e) => handleLangChange(e.target.value as AppLanguage)} className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[10px] font-bold outline-none cursor-pointer">
                    <option value="vi">VIỆT NAM</option>
                    <option value="en">ENGLISH</option>
                </select>
                <div className="hidden md:flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vercel 24/7 Node</span>
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            {activeTab === 'auto_pilot' && (
                <AutoPilotDashboard 
                    apiKeys={apiKeys} isRunning={autoPilotActive} 
                    setIsRunning={(v) => v ? setIsConsentOpen(true) : setAutoPilotActive(false)}
                    stats={autoPilotStats} logs={autoPilotLogs} currentAction={status} 
                    selectedNiche={autoPilotNiche} setSelectedNiche={setAutoPilotNiche}
                    onAddToQueue={(j) => setJobs([j, ...jobs])} onVideoGenerated={() => {}}
                    completedVideos={[]} scriptModel={scriptModel} setScriptModel={setScriptModel} 
                    visualModel={visualModel} setVisualModel={setVisualModel} voiceModel={voiceModel} setVoiceModel={setVoiceModel} 
                    resolution={resolution} setResolution={setResolution} aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
                    t={t}
                />
            )}
            {activeTab === 'settings' && <SettingsDashboard apiKeys={apiKeys} setApiKeys={setApiKeys} knowledgeBase={knowledgeBase} setKnowledgeBase={setKnowledgeBase} t={t} appLang={appLang} setAppLang={handleLangChange} contentLanguage={contentLanguage} setContentLanguage={setContentLanguage} />}
            {activeTab === 'studio' && <ViralDNAStudio predefinedTopic={campaignTopic} apiKeys={apiKeys} appLanguage={appLang} contentLanguage={contentLanguage} setContentLanguage={setContentLanguage} knowledgeBase={knowledgeBase} scriptModel={scriptModel} setScriptModel={setScriptModel} visualModel={visualModel} setVisualModel={setVisualModel} voiceModel={voiceModel} setVoiceModel={setVoiceModel} setResolution={setResolution} aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} t={t} />}
            {activeTab === 'analytics' && <AnalyticsDashboard apiKeys={apiKeys} onDeployStrategy={() => setActiveTab('studio')} t={t} />}
            {activeTab === 'marketplace' && <AIMarketplace apiKeys={apiKeys} onSelectProduct={() => setActiveTab('studio')} t={t} />}
            {activeTab === 'risk_center' && <ChannelHealthDashboard apiKeys={apiKeys} onSendReportToChat={() => {}} t={t} />}
            {activeTab === 'queue' && <QueueDashboard apiKeys={apiKeys} currentPlan={null} jobs={jobs} setJobs={setJobs} t={t} />}
            {activeTab === 'docs' && <Documentation t={t} />}
            {activeTab === 'campaign' && <CampaignWizard onStartProduction={handleCampaignStart} onNavigateToSettings={() => setActiveTab('settings')} t={t} />}
        </div>
      </main>

      <AIChatAssistant apiKey={apiKeys.find(k => k.provider === 'google' && k.status === 'active')?.key} appContext={{ activeTab, status, urlInput: campaignTopic, activeKeys: apiKeys.length, lastError: null, detectedStrategy: null, knowledgeBase, autoPilotContext: autoPilotNiche }} onCommand={handleCommand} t={t} />
      <ConsentModal isOpen={isConsentOpen} onClose={() => setIsConsentOpen(false)} onConfirm={() => { setIsConsentOpen(false); setAutoPilotActive(true); }} t={t} />
    </div>
  );
};

export default App;
