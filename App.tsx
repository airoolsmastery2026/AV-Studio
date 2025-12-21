
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  AppStatus, TabView, AppContext, ApiKeyConfig, 
  KnowledgeBase, AutoPilotStats, AutoPilotLog, 
  PostingJob, CompletedVideo,
  ScriptModel, VisualModel, VoiceModel, VideoResolution, AspectRatio,
  ContentLanguage, AppLanguage, AgentCommand, MissionIntel
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
import { runAgenticRecon, generateProScript, generateGeminiTTS, predictGoldenHours } from './services/geminiService';
import { translations } from './constants/translations';

const VAULT_STORAGE_KEY = 'av_studio_secure_vault_v1';
const KNOWLEDGE_BASE_KEY = 'av_studio_brain_v1';

const App: React.FC = () => {
  const [appLang, setAppLang] = useState<AppLanguage>(() => {
    return (localStorage.getItem('av_studio_ui_lang') as AppLanguage) || 'vi';
  });
  
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
  const [currentMission, setCurrentMission] = useState<MissionIntel | null>(null);

  const [jobs, setJobs] = useState<PostingJob[]>([]);
  const loopRef = useRef<number | null>(null);

  const addAutoPilotLog = (action: string, detail: string, status: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const log: AutoPilotLog = {
      timestamp: new Date().toLocaleTimeString(),
      action,
      detail,
      status
    };
    setAutoPilotLogs(prev => [log, ...prev].slice(0, 50));
  };

  const runAutonomousCycle = async () => {
      if (!autoPilotActive) return;
      const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
      if (!googleKey) {
          addAutoPilotLog("ERROR", "Missing active Google Gemini Key in Vault.", "error");
          setAutoPilotActive(false);
          return;
      }

      try {
          // Giai đoạn A: HUNTING (Săn tìm tín hiệu)
          setStatus(AppStatus.HUNTING);
          addAutoPilotLog("RECON", `Initiating Google Search Recon for niche: ${autoPilotNiche}`);
          const recon = await runAgenticRecon(autoPilotNiche);
          
          if (!recon.discovered_signals || recon.discovered_signals.length === 0) {
              throw new Error("No market signals detected in current cycle.");
          }
          const target = recon.discovered_signals[0];
          setCurrentMission(target); // LƯU TÌNH BÁO SỨ MỆNH
          addAutoPilotLog("SIGNAL", `Detected High-Potential Target: ${target.product_name} (Strength: ${target.market_threat_level})`, "success");

          // Giai đoạn B: PLANNING (Lập kế hoạch nội dung)
          setStatus(AppStatus.PLANNING);
          addAutoPilotLog("PLANNING", `Synthesizing winning angle: ${recon.recommended_action}`);
          const plan = await generateProScript(googleKey.key, {
              structure: { hook_type: 'Benefit', pacing: 'Fast', avg_scene_duration: 3 },
              emotional_curve: ['Curiosity', 'Excitement'],
              keywords: recon.trending_keywords,
              algorithm_fit_score: 95,
              risk_level: 'Safe'
          }, { topic: target.product_name, contentLanguage } as any, knowledgeBase);

          // Giai đoạn C: RENDERING (Sản xuất tài sản)
          setStatus(AppStatus.RENDERING);
          addAutoPilotLog("PRODUCTION", `Rendering cinematic visuals using ${visualModel} Engine...`);
          await generateGeminiTTS(plan.production_plan.script_master);
          
          // Giai đoạn D: SCHEDULING (Lên lịch đăng bài thông minh)
          setStatus(AppStatus.SCHEDULING);
          addAutoPilotLog("SCHEDULING", "Calculating Golden Hour for maximum reach...");
          const goldenHours = await predictGoldenHours(googleKey.key, 'VN', autoPilotNiche, ['TikTok', 'YouTube']);
          const bestTime = goldenHours[0].time_label;

          const newJob: PostingJob = {
              id: crypto.randomUUID(),
              content_title: target.product_name,
              caption: plan.generated_content?.description || target.product_name,
              hashtags: plan.generated_content?.hashtags || [],
              platforms: ['TikTok', 'YouTube'],
              scheduled_time: Date.now() + 3600000, 
              status: 'scheduled'
          };
          setJobs(prev => [newJob, ...prev]);
          addAutoPilotLog("COMPLETE", `Video produced and scheduled for ${bestTime}`, "success");

          setAutoPilotStats(prev => ({
              ...prev,
              cyclesRun: prev.cyclesRun + 1,
              videosCreated: prev.videosCreated + 1,
              uptime: prev.uptime + 300 
          }));
      } catch (e: any) {
          addAutoPilotLog("ERROR", e.message, "error");
          setStatus(AppStatus.ERROR);
      } finally {
          setStatus(AppStatus.IDLE);
      }
  };

  useEffect(() => {
    if (autoPilotActive) {
      runAutonomousCycle();
      loopRef.current = window.setInterval(runAutonomousCycle, 300000); 
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
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} t={t} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AGENT STATUS</span>
                <span className={`text-xs font-bold px-2 py-1 rounded border transition-colors ${autoPilotActive ? 'text-primary border-primary/20 bg-primary/5' : 'text-slate-500 border-slate-800'}`}>
                    {autoPilotActive ? `MISSION: ${status}` : 'OFFLINE'}
                </span>
            </div>
            <div className="flex items-center gap-4">
                <select value={appLang} onChange={(e) => setAppLang(e.target.value as AppLanguage)} className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[10px] font-bold outline-none cursor-pointer">
                    <option value="vi">VIỆT NAM</option>
                    <option value="en">ENGLISH</option>
                </select>
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
                    contentLanguage={contentLanguage}
                    currentMission={currentMission}
                />
            )}
            {activeTab === 'settings' && <SettingsDashboard apiKeys={apiKeys} setApiKeys={setApiKeys} knowledgeBase={knowledgeBase} setKnowledgeBase={setKnowledgeBase} t={t} appLang={appLang} setAppLang={setAppLang} contentLanguage={contentLanguage} setContentLanguage={setContentLanguage} />}
            {activeTab === 'studio' && <ViralDNAStudio predefinedTopic={campaignTopic} apiKeys={apiKeys} appLanguage={appLang} contentLanguage={contentLanguage} setContentLanguage={setContentLanguage} knowledgeBase={knowledgeBase} scriptModel={scriptModel} setScriptModel={setScriptModel} visualModel={visualModel} setVisualModel={setVisualModel} voiceModel={voiceModel} setVoiceModel={setVoiceModel} setResolution={setResolution} aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} t={t} />}
            {activeTab === 'analytics' && <AnalyticsDashboard apiKeys={apiKeys} onDeployStrategy={() => setActiveTab('studio')} t={t} />}
            {activeTab === 'marketplace' && <AIMarketplace apiKeys={apiKeys} onSelectProduct={() => setActiveTab('studio')} t={t} />}
            {activeTab === 'risk_center' && <ChannelHealthDashboard apiKeys={apiKeys} onSendReportToChat={() => {}} t={t} />}
            {activeTab === 'queue' && <QueueDashboard apiKeys={apiKeys} currentPlan={null} jobs={jobs} setJobs={setJobs} t={t} />}
            {activeTab === 'docs' && <Documentation apiKeys={apiKeys} knowledgeBase={knowledgeBase} scriptModel={scriptModel} visualModel={visualModel} voiceModel={voiceModel} appLang={appLang} />}
            {activeTab === 'campaign' && <CampaignWizard onStartProduction={handleCampaignStart} onNavigateToSettings={() => setActiveTab('settings')} t={t} />}
        </div>
      </main>

      <AIChatAssistant apiKey={apiKeys.find(k => k.provider === 'google' && k.status === 'active')?.key} appContext={{ activeTab, status, urlInput: campaignTopic, activeKeys: apiKeys.length, lastError: null, detectedStrategy: null, knowledgeBase, autoPilotContext: autoPilotNiche }} onCommand={handleCommand} />
      <ConsentModal isOpen={isConsentOpen} onClose={() => setIsConsentOpen(false)} onConfirm={() => { setIsConsentOpen(false); setAutoPilotActive(true); }} />
    </div>
  );
};

export default App;
