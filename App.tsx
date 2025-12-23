
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Activity, ShieldAlert, ShieldCheck, Menu, CloudSync, ZapOff, Timer, Loader2, Globe } from 'lucide-react';
import { 
  AppStatus, TabView, ApiKeyConfig, KnowledgeBase, 
  AutoPilotStats, AutoPilotLog, PostingJob, MissionIntel, 
  CompletedVideo, ScriptModel, VisualModel, VoiceModel, 
  VideoResolution, AspectRatio, ContentLanguage, AppLanguage, AgentCommand,
  OrchestratorResponse 
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
import { synthesizeKnowledge, syncPlatformPolicies, getApiHealthStatus, generateVeoVideo, generateAIImage } from './services/geminiService';

const VAULT_STORAGE_KEY = 'av_studio_secure_vault_v1';
const KNOWLEDGE_BASE_KEY = 'av_studio_brain_v1';
const LIBRARY_STORAGE_KEY = 'av_studio_video_library_v1';
const UI_LANG_KEY = 'av_studio_ui_lang';
const CONTENT_LANG_KEY = 'av_studio_content_lang';

const App: React.FC = () => {
  const [appLang, setAppLang] = useState<AppLanguage>(() => (localStorage.getItem(UI_LANG_KEY) as AppLanguage) || 'vi');
  const [contentLanguage, setContentLanguage] = useState<ContentLanguage>(() => (localStorage.getItem(CONTENT_LANG_KEY) as ContentLanguage) || 'vi');
  
  const t = useMemo(() => {
    return { ...translations['en'], ...(translations[appLang] || {}) };
  }, [appLang]);

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

  useEffect(() => { localStorage.setItem(UI_LANG_KEY, appLang); }, [appLang]);
  useEffect(() => { localStorage.setItem(CONTENT_LANG_KEY, contentLanguage); }, [contentLanguage]);
  useEffect(() => { localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(knowledgeBase)); }, [knowledgeBase]);
  useEffect(() => { localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(completedVideos)); }, [completedVideos]);

  useEffect(() => {
    const timer = setInterval(() => setApiHealth(getApiHealthStatus()), 2000);
    return () => clearInterval(timer);
  }, []);

  const addLog = (action: string, detail: string, status: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const newLog: AutoPilotLog = { timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }), action, detail, status };
    setAutoPilotLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const handleInitiateRender = async (plan: OrchestratorResponse) => {
    if (status === AppStatus.RENDERING) return;
    setStatus(AppStatus.RENDERING);
    addLog("FACTORY", "Initiating Render Cycle...", "info");
    try {
      const videoUrl = await generateVeoVideo(plan.production_plan.script_master, plan.production_plan.technical_specs.ratio);
      const thumbUrl = await generateAIImage(plan.generated_content.thumbnail_prompt, "1:1");
      const newVideo: CompletedVideo = { id: crypto.randomUUID(), url: videoUrl, thumbnail: thumbUrl, title: plan.generated_content.title, timestamp: Date.now() };
      setCompletedVideos(prev => [newVideo, ...prev]);
      addLog("FACTORY", `Success: ${plan.generated_content.title}`, "success");
      setStatus(AppStatus.IDLE);
      return newVideo;
    } catch (e: any) {
      addLog("FACTORY", `Error: ${e.message}`, "error");
      setStatus(AppStatus.ERROR);
      setTimeout(() => setStatus(AppStatus.IDLE), 3000);
    }
  };

  const handleCommand = (cmd: AgentCommand) => {
    if (cmd.action === 'NAVIGATE') setActiveTab(cmd.payload as TabView);
    if (cmd.action === 'NOTIFY') addLog("COMMANDER", cmd.payload, "info");
  };

  return (
    <div className="flex bg-[#020617] min-h-screen text-slate-200 font-sans overflow-hidden select-none">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} t={t} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 md:h-20 border-b border-slate-800/60 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-3xl sticky top-0 z-[60] shadow-2xl">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden transition-colors"><Menu size={24} /></button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-neon">
                        <Activity size={20} className="text-primary animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black text-white uppercase tracking-tighter">{scriptModel} Core</span>
                        <div className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                           <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{t.system_ready}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2 shadow-inner">
                   <ShieldAlert size={14} className="text-primary animate-pulse" />
                   <span className="text-[9px] font-black text-white uppercase">{t.vip_badge}</span>
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            {activeTab === 'auto_pilot' && <AutoPilotDashboard apiKeys={apiKeys} isRunning={autoPilotActive} setIsRunning={(v) => v ? setIsConsentOpen(true) : setAutoPilotActive(false)} stats={autoPilotStats} logs={autoPilotLogs} currentAction={status} selectedNiche={autoPilotNiche} setSelectedNiche={setAutoPilotNiche} onAddToQueue={(j) => setJobs([j, ...jobs])} onVideoGenerated={(v) => setCompletedVideos([v, ...completedVideos])} completedVideos={completedVideos} scriptModel={scriptModel} setScriptModel={setScriptModel} visualModel={visualModel} setVisualModel={setVisualModel} voiceModel={voiceModel} setVoiceModel={setVoiceModel} resolution={resolution} setResolution={setResolution} aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} contentLanguage={contentLanguage} currentMission={currentMission} t={t} />}
            {activeTab === 'studio' && <ViralDNAStudio predefinedTopic="" apiKeys={apiKeys} appLanguage={appLang} contentLanguage={contentLanguage} setContentLanguage={setContentLanguage} knowledgeBase={knowledgeBase} scriptModel={scriptModel} setScriptModel={setScriptModel} visualModel={visualModel} setVisualModel={setVisualModel} voiceModel={voiceModel} setVoiceModel={setVoiceModel} setResolution={setResolution} aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} completedVideos={completedVideos} setCompletedVideos={setCompletedVideos} t={t} onInitiateRender={handleInitiateRender} />}
            {activeTab === 'analytics' && <AnalyticsDashboard apiKeys={apiKeys} onDeployStrategy={() => setActiveTab('studio')} t={t} />}
            {activeTab === 'marketplace' && <AIMarketplace apiKeys={apiKeys} onSelectProduct={() => setActiveTab('studio')} t={t} />}
            {activeTab === 'risk_center' && <ChannelHealthDashboard apiKeys={apiKeys} onSendReportToChat={() => {}} t={t} />}
            {activeTab === 'queue' && <QueueDashboard apiKeys={apiKeys} currentPlan={null} jobs={jobs} setJobs={setJobs} t={t} />}
            {activeTab === 'settings' && <SettingsDashboard apiKeys={apiKeys} setApiKeys={setApiKeys} knowledgeBase={knowledgeBase} setKnowledgeBase={setKnowledgeBase} onTrainBrain={async (text) => { const rules = await synthesizeKnowledge(process.env.API_KEY!, text, knowledgeBase.learnedPreferences); setKnowledgeBase(prev => ({ ...prev, learnedPreferences: [...new Set([...prev.learnedPreferences, ...rules])] })); }} t={t} appLang={appLang} setAppLang={setAppLang} contentLanguage={contentLanguage} setContentLanguage={setContentLanguage} />}
            {activeTab === 'docs' && <Documentation apiKeys={apiKeys} knowledgeBase={knowledgeBase} scriptModel={scriptModel} visualModel={visualModel} voiceModel={voiceModel} appLang={appLang} />}
            {activeTab === 'campaign' && <CampaignWizard onStartProduction={() => setActiveTab('studio')} onNavigateToSettings={() => setActiveTab('settings')} t={t} />}
        </div>
      </main>

      <AIChatAssistant t={t} apiKey={apiKeys.find(k => k.provider === 'google' && k.status === 'active')?.key} appContext={{ activeTab, status, urlInput: '', activeKeys: apiKeys.length, knowledgeBase }} onCommand={handleCommand} />
      <ConsentModal isOpen={isConsentOpen} onClose={() => setIsConsentOpen(false)} onConfirm={() => { setIsConsentOpen(false); setAutoPilotActive(true); }} />
    </div>
  );
};

export default App;
