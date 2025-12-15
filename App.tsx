import React, { useState, useEffect } from 'react';
import { Globe, Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ViralDNAStudio from './components/ViralDNAStudio';
import AutoPilotDashboard from './components/AutoPilotDashboard';
import QueueDashboard from './components/QueueDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import SettingsDashboard from './components/SettingsDashboard';
import AIMarketplace from './components/AIMarketplace';
import ChannelHealthDashboard from './components/ChannelHealthDashboard';
import BatchProcessor from './components/BatchProcessor';
import Documentation from './components/Documentation';
import AIChatAssistant from './components/AIChatAssistant';
import { 
  AppLanguage, ContentLanguage, TabView, ApiKeyConfig, 
  KnowledgeBase, PostingJob, CompletedVideo, OrchestratorResponse,
  AppContext, AgentCommand, ScriptModel, VisualModel, VoiceModel, VideoResolution, AspectRatio 
} from './types';

// Mock Translations
const TRANSLATIONS: Record<AppLanguage, any> = {
  vi: {},
  en: {},
  jp: {},
  es: {},
  cn: {}
};

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState<TabView>('studio');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Languages
  const [appLanguage, setAppLanguage] = useState<AppLanguage>('vi');
  const [contentLanguage, setContentLanguage] = useState<ContentLanguage>('vi');

  // Data Persistence
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>(() => {
    try {
        const saved = localStorage.getItem('av_studio_api_keys');
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>(() => {
      try {
          const saved = localStorage.getItem('av_studio_kb');
          return saved ? JSON.parse(saved) : {
              customInstructions: '',
              learnedPreferences: [],
              autoImprovementEnabled: true,
              lastUpdated: Date.now()
          };
      } catch { 
          return {
              customInstructions: '',
              learnedPreferences: [],
              autoImprovementEnabled: true,
              lastUpdated: Date.now()
          };
      }
  });

  const [jobs, setJobs] = useState<PostingJob[]>(() => {
      try {
          const saved = localStorage.getItem('av_studio_queue_v1');
          return saved ? JSON.parse(saved) : [];
      } catch { return []; }
  });
  
  const [completedVideos, setCompletedVideos] = useState<CompletedVideo[]>(() => {
      try {
          const saved = localStorage.getItem('av_studio_gallery_v1');
          return saved ? JSON.parse(saved) : [];
      } catch { return []; }
  });

  // Current Plan (Transient)
  const [currentPlan, setCurrentPlan] = useState<OrchestratorResponse | null>(null);

  // Shared Model Configuration
  const [scriptModel, setScriptModel] = useState<ScriptModel>('Gemini 2.5 Flash');
  const [visualModel, setVisualModel] = useState<VisualModel>('SORA');
  const [voiceModel, setVoiceModel] = useState<VoiceModel>('Google Chirp');
  const [resolution, setResolution] = useState<VideoResolution>('1080p');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => { localStorage.setItem('av_studio_api_keys', JSON.stringify(apiKeys)); }, [apiKeys]);
  useEffect(() => { localStorage.setItem('av_studio_kb', JSON.stringify(knowledgeBase)); }, [knowledgeBase]);
  useEffect(() => { localStorage.setItem('av_studio_queue_v1', JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem('av_studio_gallery_v1', JSON.stringify(completedVideos)); }, [completedVideos]);

  // --- ACTIONS ---
  const handleAddToQueue = (job: PostingJob) => {
      setJobs(prev => [job, ...prev]);
  };

  const handleVideoGenerated = (video: CompletedVideo) => {
      setCompletedVideos(prev => [video, ...prev]);
  };

  const handleDeployStrategy = (url: string, type: 'clone' | 'review') => {
      // Switch to Studio and pre-fill (Conceptual)
      setActiveTab('studio');
      console.log(`Deploying strategy for ${url} [${type}]`);
  };

  // --- CHAT CONTEXT & COMMANDS ---
  const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active')?.key;
  
  const appContext: AppContext = {
      activeTab,
      status: 'IDLE',
      urlInput: '',
      activeKeys: apiKeys.filter(k => k.status === 'active').length,
      lastError: null,
      detectedStrategy: null,
      knowledgeBase,
      autoPilotContext: ''
  };

  const handleAgentCommand = (cmd: AgentCommand) => {
      console.log("Agent Command:", cmd);
      if (cmd.action === 'NAVIGATE') {
          if (['studio', 'auto_pilot', 'campaign', 'analytics', 'marketplace', 'risk_center', 'queue', 'settings', 'docs'].includes(cmd.payload)) {
              setActiveTab(cmd.payload as TabView);
          }
      }
  };

  // --- RENDER CONTENT ---
  const renderContent = () => {
    const commonModelProps = {
        scriptModel, setScriptModel,
        visualModel, setVisualModel,
        voiceModel, setVoiceModel,
        resolution, setResolution,
        aspectRatio, setAspectRatio
    };

    switch (activeTab) {
      case 'studio':
        return <ViralDNAStudio 
            apiKeys={apiKeys} 
            appLanguage={appLanguage} 
            contentLanguage={contentLanguage} 
            setContentLanguage={setContentLanguage}
            t={TRANSLATIONS[appLanguage]}
            {...commonModelProps}
        />;
      case 'auto_pilot':
        return <AutoPilotDashboard 
            apiKeys={apiKeys} 
            onAddToQueue={handleAddToQueue} 
            onVideoGenerated={handleVideoGenerated}
            completedVideos={completedVideos}
            t={TRANSLATIONS[appLanguage]}
            {...commonModelProps}
        />;
      case 'queue':
        return <QueueDashboard 
            apiKeys={apiKeys} 
            currentPlan={currentPlan} 
            jobs={jobs} 
            setJobs={setJobs} 
            t={TRANSLATIONS[appLanguage]}
        />;
      case 'analytics':
        return <AnalyticsDashboard 
            apiKeys={apiKeys} 
            onDeployStrategy={handleDeployStrategy}
            onSendReportToChat={(msg) => console.log(msg)}
            t={TRANSLATIONS[appLanguage]}
        />;
      case 'marketplace':
        return <AIMarketplace 
            apiKeys={apiKeys} 
            onSelectProduct={(url) => handleDeployStrategy(url, 'review')}
            t={TRANSLATIONS[appLanguage]}
        />;
      case 'risk_center':
        return <ChannelHealthDashboard 
            apiKeys={apiKeys} 
            onSendReportToChat={(msg) => console.log(msg)}
            t={TRANSLATIONS[appLanguage]}
        />;
      case 'campaign': 
        return <BatchProcessor 
            apiKeys={apiKeys} 
            onAddToQueue={handleAddToQueue}
            t={TRANSLATIONS[appLanguage]}
            {...commonModelProps}
        />;
      case 'settings':
        return <SettingsDashboard 
            apiKeys={apiKeys} 
            setApiKeys={setApiKeys} 
            knowledgeBase={knowledgeBase} 
            setKnowledgeBase={setKnowledgeBase}
            t={TRANSLATIONS[appLanguage]}
        />;
      case 'docs':
        return <Documentation />;
      default:
        return <div className="p-10 text-center text-slate-500">Component Not Found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-white font-sans overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            t={TRANSLATIONS[appLanguage]}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
            
            {/* Top Bar */}
            <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-30">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden p-2 text-slate-400 hover:text-white"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs">v2.5.0-beta</span>
                        <span>Enterprise Edition</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* APP UI LANGUAGE TOGGLE (LAYER 1) */}
                    <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 gap-1">
                        <span className="text-slate-500 px-2 flex items-center justify-center">
                            <Globe size={16} />
                        </span>
                        <select 
                            value={appLanguage}
                            onChange={(e) => setAppLanguage(e.target.value as AppLanguage)}
                            className="bg-transparent text-xs font-bold text-white focus:outline-none py-1 pr-2 cursor-pointer"
                        >
                            <option value="vi">Tiếng Việt</option>
                            <option value="en">English</option>
                            <option value="jp">日本語</option>
                            <option value="es">Español</option>
                            <option value="cn">中文</option>
                        </select>
                    </div>

                    <div className="h-4 w-px bg-slate-800 mx-2 hidden sm:block"></div>
                    
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${apiKeys.some(k => k.status === 'active') ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>
                        <span className="text-xs font-bold text-slate-300 hidden md:block">System Status</span>
                    </div>
                </div>
            </header>

            {/* Scrollable Content Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 relative scroll-smooth">
                {renderContent()}
            </main>

            {/* AI Assistant Floating Button/Window */}
            <AIChatAssistant 
                apiKey={googleKey} 
                appContext={appContext} 
                onCommand={handleAgentCommand} 
            />
        </div>
    </div>
  );
};

export default App;