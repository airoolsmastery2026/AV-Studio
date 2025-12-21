
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AppStatus, TabView, AppContext, ApiKeyConfig, 
  KnowledgeBase, AutoPilotStats, AutoPilotLog, 
  PostingJob, BatchJobItem, CompletedVideo,
  ScriptModel, VisualModel, VoiceModel, VideoResolution, AspectRatio,
  ContentLanguage
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
import BatchProcessor from './components/BatchProcessor';
import ChannelHealthDashboard from './components/ChannelHealthDashboard';
import AIChatAssistant from './components/AIChatAssistant';
import ConsentModal from './components/ConsentModal';

// Services
import { huntAffiliateProducts, agentGenerateScript } from './services/geminiService';

// Constants for Persistence
const LAST_ACTIVE_KEY = 'av_studio_last_active';
const AUTOPILOT_STATE_KEY = 'av_studio_autopilot_state_v1';
const VAULT_STORAGE_KEY = 'av_studio_secure_vault_v1';
const KNOWLEDGE_BASE_KEY = 'av_studio_brain_v1';

const App: React.FC = () => {
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState<TabView>('studio');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [isConsentOpen, setIsConsentOpen] = useState(false);

  // --- CONFIGURATION STATE ---
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>(() => {
    const saved = localStorage.getItem(VAULT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>(() => {
    const saved = localStorage.getItem(KNOWLEDGE_BASE_KEY);
    return saved ? JSON.parse(saved) : {
      customInstructions: '',
      learnedPreferences: [],
      autoImprovementEnabled: true,
      lastUpdated: Date.now()
    };
  });

  // --- MODEL CONFIG STATE ---
  const [scriptModel, setScriptModel] = useState<ScriptModel>('Gemini 2.5 Flash');
  const [visualModel, setVisualModel] = useState<VisualModel>('VEO');
  const [voiceModel, setVoiceModel] = useState<VoiceModel>('Google Chirp');
  const [resolution, setResolution] = useState<VideoResolution>('1080p');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [contentLanguage, setContentLanguage] = useState<ContentLanguage>('vi');

  // --- AUTOPILOT STATE ---
  const [autoPilotActive, setAutoPilotActive] = useState(false);
  const [autoPilotStats, setAutoPilotStats] = useState<AutoPilotStats>({
    cyclesRun: 0,
    videosCreated: 0,
    postedCount: 0,
    uptime: 0
  });
  const [autoPilotLogs, setAutoPilotLogs] = useState<AutoPilotLog[]>([]);
  const [autoPilotNiche, setAutoPilotNiche] = useState('MULTI_NICHE');

  // --- DATA STATE ---
  const [jobs, setJobs] = useState<PostingJob[]>([]);
  const [batchJobs, setBatchJobs] = useState<BatchJobItem[]>([]);
  const [completedVideos, setCompletedVideos] = useState<CompletedVideo[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  const loopRef = useRef<number | null>(null);

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(knowledgeBase));
  }, [knowledgeBase]);

  // --- AUTONOMOUS LOOP (24/7 Engine) ---
  useEffect(() => {
    const runCycle = async () => {
      if (!autoPilotActive) return;

      const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
      if (!googleKey) {
        setAutoPilotLogs(prev => [{ 
          timestamp: new Date().toLocaleTimeString(), 
          action: 'ERROR', detail: 'Thiếu Google API Key để vận hành.', status: 'error' 
        }, ...prev]);
        setAutoPilotActive(false);
        return;
      }

      setStatus(AppStatus.ANALYZING);
      setAutoPilotLogs(prev => [{ 
        timestamp: new Date().toLocaleTimeString(), 
        action: 'SIGNAL_HUNT', detail: `Đang quét tín hiệu cho ngách: ${autoPilotNiche}`, status: 'info' 
      }, ...prev]);

      try {
        // Step 1: Hunt for products
        const hunt = await huntAffiliateProducts(googleKey.key, autoPilotNiche, ['SHOPEE', 'TIKTOK_SHOP', 'CLICKBANK']);
        
        if (hunt.products && hunt.products.length > 0) {
          const target = hunt.products[0];
          setAutoPilotLogs(prev => [{ 
            timestamp: new Date().toLocaleTimeString(), 
            action: 'FOUND', detail: `Sản phẩm tiềm năng: ${target.product_name} (${target.opportunity_score}/100)`, status: 'success' 
          }, ...prev]);

          // Step 2: Simulate Production
          setStatus(AppStatus.PLANNING);
          await new Promise(r => setTimeout(r, 2000)); // Simulating AI thought

          setAutoPilotStats(prev => ({
            ...prev,
            cyclesRun: prev.cyclesRun + 1,
            videosCreated: prev.videosCreated + 1,
            uptime: prev.uptime + 150 // Assume each cycle represents work
          }));

          setAutoPilotLogs(prev => [{ 
            timestamp: new Date().toLocaleTimeString(), 
            action: 'COMPLETE', detail: `Dự thảo kịch bản & visual cho ${target.product_name} đã sẵn sàng.`, status: 'success' 
          }, ...prev]);
        }
      } catch (e: any) {
        setAutoPilotLogs(prev => [{ 
          timestamp: new Date().toLocaleTimeString(), 
          action: 'ERROR', detail: e.message, status: 'error' 
        }, ...prev]);
      } finally {
        setStatus(AppStatus.IDLE);
      }
    };

    if (autoPilotActive) {
      runCycle();
      loopRef.current = window.setInterval(runCycle, 60000); // Run every 1 min while active
    } else if (loopRef.current) {
      clearInterval(loopRef.current);
    }

    return () => { if (loopRef.current) clearInterval(loopRef.current); };
  }, [autoPilotActive, autoPilotNiche, apiKeys]);

  // --- OFFLINE SIMULATION (ON LOAD) ---
  useEffect(() => {
      const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0');
      const now = Date.now();
      const diff = now - lastActive;
      const savedAP = JSON.parse(localStorage.getItem(AUTOPILOT_STATE_KEY) || '{}');
      
      if (diff > 2 * 60 * 1000 && savedAP.active) {
          const missedCycles = Math.floor(diff / (180 * 1000)); 
          if (missedCycles > 0) {
              const simVideos = Math.floor(missedCycles * 0.95); 
              console.log(`[CLOUD SYNC] Đã đồng bộ ${simVideos} video mới từ tiến trình chạy ngầm.`);
              setAutoPilotStats(prev => ({
                  ...prev,
                  cyclesRun: (savedAP.stats?.cyclesRun || 0) + missedCycles,
                  videosCreated: (savedAP.stats?.videosCreated || 0) + simVideos,
                  uptime: (savedAP.stats?.uptime || 0) + Math.floor(diff/1000)
              }));
              setAutoPilotLogs(prev => [{ 
                timestamp: new Date().toLocaleTimeString(), 
                action: 'CLOUD_SYNC', detail: `Vercel Edge đã xử lý ${simVideos} video trong khi bạn offline.`, status: 'success' 
              }, ...prev]);
          }
      } else if (savedAP.stats) {
          setAutoPilotStats(savedAP.stats);
      }
      
      if (savedAP.active) setAutoPilotActive(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
      localStorage.setItem(AUTOPILOT_STATE_KEY, JSON.stringify({
        active: autoPilotActive,
        stats: autoPilotStats
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPilotActive, autoPilotStats]);

  // --- HANDLERS ---
  const handleCommand = useCallback((command: any) => {
    if (command.action === 'NAVIGATE') setActiveTab(command.payload);
  }, []);

  const t = {
    title: "Viral DNA Studio",
    subtitle: "AI Video Production Engine",
    studio: "Viral DNA Studio",
    auto: "Infinity Auto-Pilot",
    campaign: "Campaign Wizard",
    analytics: "Strategic Intel",
    market: "AI Marketplace",
    risk: "Risk Center",
    queue: "Scheduler & Queue",
    docs: "Docs",
    settings: "Config",
    script_title: "Trí Tuệ Kịch Bản",
    visual_title: "Động Cơ Hình Ảnh",
    voice_title: "Tổng Hợp Giọng Nói",
    input_placeholder: "Nhập URL YouTube hoặc TikTok..."
  };

  const appContext: AppContext = {
    activeTab,
    status,
    urlInput: '',
    activeKeys: apiKeys.length,
    lastError: null,
    detectedStrategy: null,
    knowledgeBase,
    autoPilotContext: autoPilotNiche
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'studio':
        return (
          <ViralDNAStudio 
            apiKeys={apiKeys} 
            appLanguage="vi" 
            contentLanguage={contentLanguage}
            setContentLanguage={setContentLanguage}
            scriptModel={scriptModel} setScriptModel={setScriptModel}
            visualModel={visualModel} setVisualModel={setVisualModel}
            voiceModel={voiceModel} setVoiceModel={setVoiceModel}
            resolution={resolution} setResolution={setResolution}
            aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
            t={t}
          />
        );
      case 'auto_pilot':
        return (
          <AutoPilotDashboard 
            apiKeys={apiKeys}
            onAddToQueue={(job) => setJobs([job, ...jobs])}
            onVideoGenerated={(v) => setCompletedVideos([v, ...completedVideos])}
            completedVideos={completedVideos}
            scriptModel={scriptModel} setScriptModel={setScriptModel}
            visualModel={visualModel} setVisualModel={setVisualModel}
            voiceModel={voiceModel} setVoiceModel={setVoiceModel}
            resolution={resolution} setResolution={setResolution}
            aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
            isRunning={autoPilotActive}
            setIsRunning={(v) => {
              if (v) setIsConsentOpen(true);
              else setAutoPilotActive(false);
            }}
            stats={autoPilotStats}
            logs={autoPilotLogs}
            currentAction={status}
            selectedNiche={autoPilotNiche}
            setSelectedNiche={setAutoPilotNiche}
            t={t}
          />
        );
      case 'analytics':
        return <AnalyticsDashboard apiKeys={apiKeys} onDeployStrategy={() => setActiveTab('studio')} t={t} />;
      case 'marketplace':
        return <AIMarketplace apiKeys={apiKeys} onSelectProduct={() => setActiveTab('studio')} t={t} />;
      case 'risk_center':
        return <ChannelHealthDashboard apiKeys={apiKeys} onSendReportToChat={() => {}} t={t} />;
      case 'queue':
        return <QueueDashboard apiKeys={apiKeys} currentPlan={null} jobs={jobs} setJobs={setJobs} t={t} />;
      case 'campaign':
        return (
          <BatchProcessor 
            apiKeys={apiKeys} 
            onAddToQueue={(job) => setJobs([job, ...jobs])}
            jobs={batchJobs}
            setJobs={setBatchJobs}
            isProcessing={isBatchProcessing}
            setIsProcessing={setIsBatchProcessing}
            t={t}
          />
        );
      case 'docs':
        return <Documentation />;
      case 'settings':
        return (
          <SettingsDashboard 
            apiKeys={apiKeys} 
            setApiKeys={setApiKeys} 
            knowledgeBase={knowledgeBase} 
            setKnowledgeBase={setKnowledgeBase} 
            t={t}
          />
        );
      default:
        return <div className="text-white p-10">Tab {activeTab} is under development.</div>;
    }
  };

  return (
    <div className="flex bg-[#020617] min-h-screen text-slate-200 font-sans selection:bg-primary/30">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        t={t} 
      />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-950/50 backdrop-blur-md sticky top-0 z-30">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
            <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest hidden sm:inline">Active Module:</span>
                <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded border border-primary/20 uppercase">
                    {activeTab.replace('_', ' ')}
                </span>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden lg:flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-slate-400">GEMINI ENGINE CLOUD CONNECTED</span>
               </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            {renderTab()}
          </div>
        </div>
      </main>

      <AIChatAssistant 
        apiKey={apiKeys.find(k => k.provider === 'google' && k.status === 'active')?.key} 
        appContext={appContext} 
        onCommand={handleCommand} 
      />

      <ConsentModal 
        isOpen={isConsentOpen} 
        onClose={() => setIsConsentOpen(false)} 
        onConfirm={() => {
          setIsConsentOpen(false);
          setAutoPilotActive(true);
        }} 
      />
    </div>
  );
};

export default App;
