
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import NeonButton from './components/NeonButton';
import PlanResult from './components/PlanResult';
import ConsentModal from './components/ConsentModal';
import SettingsDashboard from './components/SettingsDashboard'; 
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ChannelHealthDashboard from './components/ChannelHealthDashboard'; 
import AIMarketplace from './components/AIMarketplace';
import QueueDashboard from './components/QueueDashboard'; 
import BatchProcessor from './components/BatchProcessor'; 
import AIChatAssistant from './components/AIChatAssistant';
import ModelSelector from './components/ModelSelector';
import AutoPilotDashboard from './components/AutoPilotDashboard'; // NEW IMPORT
import { Zap, Link as LinkIcon, AlertTriangle, Cpu, Lock, LayoutDashboard, Settings, Layers, RotateCw, Bot, Filter, SlidersHorizontal, Sparkles, MonitorPlay, Ratio, Type, Palette, Mic, Check, BrainCircuit, ArrowRight, Menu, MessageCircle } from 'lucide-react';
import { generateVideoPlan, classifyInput } from './services/geminiService';
import { postVideoToSocial } from './services/socialService';
import { AppStatus, OrchestratorResponse, SourceMetadata, TabView, ApiKeyConfig, ContentNiche, ContentWorkflow, AppContext, KnowledgeBase, AgentCommand, PostingJob, ChatSession, ChatMessage, VideoResolution, AspectRatio, ScriptModel, VisualModel, VoiceModel } from './types';

// SECURITY & PERSISTENCE CONSTANTS
const VAULT_STORAGE_KEY = 'av_studio_secure_vault_v1';
const BRAIN_STORAGE_KEY = 'av_studio_brain_v1';
const QUEUE_STORAGE_KEY = 'av_studio_queue_v1';
const UI_STATE_STORAGE_KEY = 'av_studio_ui_state_v1';
const CHAT_STORAGE_KEY = 'av_studio_chat_sessions_v2'; 

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>('campaign');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- STATE 1: VAULT (API KEYS) ---
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>(() => {
    try {
      const encryptedData = localStorage.getItem(VAULT_STORAGE_KEY);
      if (encryptedData) {
        const decrypted = atob(encryptedData);
        return JSON.parse(decrypted);
      }
    } catch (e) {
      console.error("Vault data corrupted, resetting storage.", e);
    }
    return [];
  });

  // --- STATE 2: BRAIN (AI MEMORY) ---
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>(() => {
    try {
        const saved = localStorage.getItem(BRAIN_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {
        customInstructions: "",
        learnedPreferences: [],
        autoImprovementEnabled: true,
        lastUpdated: Date.now()
    };
  });

  // --- STATE 3: QUEUE (POSTING JOBS) ---
  const [queueJobs, setQueueJobs] = useState<PostingJob[]>(() => {
    try {
        const saved = localStorage.getItem(QUEUE_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [];
  });

  // --- STATE 4: UI PREFERENCES (URL, NICHE, WORKFLOW) ---
  const getUiState = () => {
      try {
          const saved = localStorage.getItem(UI_STATE_STORAGE_KEY);
          if (saved) return JSON.parse(saved);
      } catch(e) {}
      return {};
  };
  const uiState = getUiState();

  const [url, setUrl] = useState<string>(uiState.url || '');
  const [selectedNiche, setSelectedNiche] = useState<ContentNiche>(uiState.selectedNiche || 'AUTO');
  const [selectedWorkflow, setSelectedWorkflow] = useState<ContentWorkflow>(uiState.selectedWorkflow || 'AUTO');
  const [showAdvanced, setShowAdvanced] = useState(uiState.showAdvanced || false);
  // New: Google Ecosystem Preference
  const [preferGoogleStack, setPreferGoogleStack] = useState<boolean>(false);
  
  // --- NEW: VIDEO CONFIG STATE ---
  const [resolution, setResolution] = useState<VideoResolution>('1080p');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [scriptModel, setScriptModel] = useState<ScriptModel>('Gemini 2.5 Flash');
  const [visualModel, setVisualModel] = useState<VisualModel>('SORA');
  const [voiceModel, setVoiceModel] = useState<VoiceModel>('Google Chirp');

  const [detectedStrategy, setDetectedStrategy] = useState<ContentWorkflow | null>(null);

  const [plan, setPlan] = useState<OrchestratorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Modal States
  const [showConsent, setShowConsent] = useState(false);

  // --- PERSISTENCE EFFECTS ---

  useEffect(() => {
    try {
      if (apiKeys) {
        const jsonString = JSON.stringify(apiKeys);
        const encrypted = btoa(jsonString);
        localStorage.setItem(VAULT_STORAGE_KEY, encrypted);
      }
    } catch (e) {
      console.error("Failed to save to Vault", e);
    }
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem(BRAIN_STORAGE_KEY, JSON.stringify(knowledgeBase));
  }, [knowledgeBase]);

  useEffect(() => {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queueJobs));
  }, [queueJobs]);

  useEffect(() => {
    const stateToSave = { url, selectedNiche, selectedWorkflow, showAdvanced };
    localStorage.setItem(UI_STATE_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [url, selectedNiche, selectedWorkflow, showAdvanced]);


  // --- APP LOGIC ---

  const activeKeysCount = apiKeys.filter(k => k.status === 'active').length;
  const primaryApiKey = apiKeys.find(k => k.status === 'active' && k.provider === 'google')?.key;
  const hasZaloVideo = apiKeys.some(k => k.provider === 'zalo' && k.status === 'active');

  const appContext: AppContext = {
    activeTab,
    status,
    urlInput: url,
    activeKeys: activeKeysCount,
    lastError: error,
    detectedStrategy: detectedStrategy,
    knowledgeBase: knowledgeBase
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('vi-VN');
    setLogs(prev => [`[${time}] ${msg}`, ...prev]);
  };

  const handleStartRequest = () => {
    if (activeKeysCount === 0) {
      setError("⚠️ Không tìm thấy API Key khả dụng (Active). Vui lòng thêm key hoặc reset status trong Vault.");
      setActiveTab('settings');
      return;
    }
    if (!url) {
      setError("Vui lòng nhập URL nguồn.");
      return;
    }
    setShowConsent(true);
  };

  const handleSelectProduct = (link: string) => {
    setUrl(link);
    setSelectedWorkflow('REVIEW_TUTORIAL');
    
    // Auto-detect if it's a google product link to turn on the ecosystem mode
    if (link.includes('google') || link.includes('gemini') || link.includes('youtube')) {
        setPreferGoogleStack(true);
        addLog(`[MARKETPLACE] Đã phát hiện sản phẩm Google. Bật chế độ "Google Ecosystem Priority".`);
    } else {
        setPreferGoogleStack(false);
    }

    setActiveTab('campaign');
    addLog(`[MARKETPLACE] Đã chọn sản phẩm. Workflow tự động đặt là: REVIEW_TUTORIAL.`);
  };

  // Callback for Strategic Intelligence Hub (Analytics)
  const handleDeployStrategy = (targetName: string, type: 'clone' | 'review') => {
      setUrl(targetName); // Set URL as the target name (simulated for now, could be real URL)
      if (type === 'clone') {
          setSelectedWorkflow('VIRAL_CLONE');
          addLog(`[COMMANDER] Triển khai chiến lược CLONE từ Tình báo Chiến lược: ${targetName}`);
      } else {
          setSelectedWorkflow('REVIEW_TUTORIAL');
          addLog(`[COMMANDER] Triển khai chiến lược SẢN PHẨM MỚI từ Tình báo Chiến lược: ${targetName}`);
      }
      setActiveTab('campaign');
  };

  const handleAgentCommand = (cmd: AgentCommand) => {
    addLog(`🤖 COMMAND: ${cmd.action} - ${JSON.stringify(cmd.payload)}`);
    switch (cmd.action) {
      case 'NAVIGATE':
        if (['campaign', 'analytics', 'risk_center', 'marketplace', 'settings', 'queue', 'models', 'batch_factory', 'auto_pilot'].includes(cmd.payload)) {
          setActiveTab(cmd.payload as TabView);
        }
        break;
      case 'SET_INPUT':
        setUrl(cmd.payload);
        break;
      case 'EXECUTE_RUN':
        handleStartRequest();
        break;
      case 'UPDATE_MEMORY':
        if (typeof cmd.payload === 'string') {
           setKnowledgeBase(prev => ({
             ...prev,
             learnedPreferences: [...prev.learnedPreferences, cmd.payload],
             lastUpdated: Date.now()
           }));
           addLog("🧠 Đã cập nhật kiến thức mới vào bộ nhớ.");
        }
        break;
    }
  };

  // Helper to inject a system message into the active chat (Simulated notification)
  const handleSendReportToChat = (reportText: string) => {
    try {
        const savedSessionsRaw = localStorage.getItem(CHAT_STORAGE_KEY);
        let sessions: ChatSession[] = savedSessionsRaw ? JSON.parse(savedSessionsRaw) : [];
        
        // If no sessions, create one
        if (sessions.length === 0) {
            const newSession: ChatSession = {
                id: crypto.randomUUID(),
                name: "Hunter Report",
                messages: [],
                createdAt: Date.now()
            };
            sessions.push(newSession);
        }

        // Push to the first (most recent) session
        const updatedSession = { ...sessions[0] };
        const newMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'model',
            text: reportText,
            timestamp: Date.now()
        };
        updatedSession.messages.push(newMsg);
        sessions[0] = updatedSession;

        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sessions));
        
        // Trigger a custom event so AIChatAssistant knows to re-render if it's open
        addLog("📨 Report sent to AV Commander.");
        window.dispatchEvent(new Event('chat-storage-updated'));
        
    } catch(e) {
        console.error("Failed to send report to chat", e);
    }
  };

  // --- ZALO POSTING INTEGRATION ---
  const handlePostToZalo = async (content: { title: string, description: string }) => {
    const zaloKey = apiKeys.find(k => k.provider === 'zalo' && k.status === 'active');
    if (zaloKey) {
        addLog(`[ZALO] Initiating Auto-Post to Zalo OA...`);
        try {
            const result = await postVideoToSocial(zaloKey, { 
                title: content.title, 
                caption: content.description 
            });
            if (result.success) {
                addLog(`[ZALO] ✅ Posted Successfully! Post ID: ${result.postId}`);
                return true;
            } else {
                addLog(`[ZALO] ❌ Posting Failed: ${result.error}`);
            }
        } catch (e: any) {
            addLog(`[ZALO] Error: ${e.message}`);
        }
    } else {
        addLog(`[AUTO-POST] Skipped Zalo (No Active Key).`);
    }
    return false;
  };

  const executePipeline = async () => {
    setShowConsent(false);
    setStatus(AppStatus.ROUTING);
    setError(null);
    setLogs([]);
    setPlan(null);
    setDetectedStrategy(null);

    let localKeys = [...apiKeys]; 
    let success = false;
    let cachedStrategy: ContentWorkflow | null = null;
    let cachedType: 'channel' | 'product' | 'auto_detect' | null = null;

    try {
      while (!success) {
        const activeKeyIndex = localKeys.findIndex(k => k.status === 'active' && k.provider === 'google');
        
        if (activeKeyIndex === -1) {
            addLog("❌ FATAL: Tất cả API Key đều đã hết hạn mức hoặc bị lỗi.");
            setError("Hệ thống đã tự động thử tất cả key nhưng đều thất bại. Vui lòng kiểm tra Quota hoặc thêm Key mới trong Cài đặt.");
            setStatus(AppStatus.ERROR);
            setTimeout(() => setActiveTab('settings'), 2000);
            return;
        }

        const currentKeyConfig = localKeys[activeKeyIndex];
        const currentKey = currentKeyConfig.key;

        addLog(`🔄 Attempting with Key ID: ${currentKeyConfig.alias}...`);

        try {
            let effectiveWorkflow = selectedWorkflow;
            let effectiveType: 'channel' | 'product' | 'auto_detect' = cachedType || 'auto_detect';

            if (selectedWorkflow === 'AUTO') {
                if (!cachedStrategy) {
                    setStatus(AppStatus.ROUTING);
                    addLog("🤖 Smart Bot: Đang phân tích loại đường dẫn (Auto Mode)...");
                    await new Promise(r => setTimeout(r, 500));
                    const routeResult = await classifyInput(currentKey, url);
                    addLog(`[ROUTER] Phát hiện: ${routeResult.type.toUpperCase()}. Đề xuất: ${routeResult.strategy}`);
                    setDetectedStrategy(routeResult.strategy as ContentWorkflow);
                    cachedStrategy = routeResult.strategy as ContentWorkflow;
                    cachedType = routeResult.type;
                    effectiveWorkflow = routeResult.strategy as ContentWorkflow;
                    effectiveType = routeResult.type;
                } else {
                    addLog(`[ROUTER] Sử dụng kết quả đã cache: ${cachedStrategy}`);
                    effectiveWorkflow = cachedStrategy;
                }
            } else {
                addLog(`[MANUAL] Bỏ qua Router. Sử dụng Workflow cố định: ${selectedWorkflow}`);
                setDetectedStrategy(selectedWorkflow);
                effectiveWorkflow = selectedWorkflow;
            }

            setStatus(AppStatus.ANALYZING);
            addLog(`[SCRAPER] Đang trích xuất metadata...`);
            await new Promise(r => setTimeout(r, 800));

            setStatus(AppStatus.PLANNING);
            const metadata: SourceMetadata = { 
                url, 
                type: effectiveType,
                detected_strategy: effectiveWorkflow,
                manual_workflow: selectedWorkflow,
                manual_niche: selectedNiche,
                prefer_google_stack: preferGoogleStack,
                video_config: {
                    resolution,
                    aspectRatio,
                    scriptModel,
                    visualModel,
                    voiceModel
                }
            };

            const generatedPlan = await generateVideoPlan(currentKey, metadata);
            setPlan(generatedPlan);
            success = true;

            setStatus(AppStatus.PARAPHRASING);
            addLog(`[WRITER] Đang viết kịch bản theo phong cách: ${effectiveWorkflow}...`);
            await new Promise(r => setTimeout(r, 1000));
            
            setStatus(AppStatus.RENDERING);
            addLog(`[RENDER] Config: ${resolution} | ${aspectRatio} | Model: ${visualModel}`);
            
            if (preferGoogleStack) {
                addLog("⚡ GOOGLE ECOSYSTEM ACTIVE: Forcing Veo & Imagen models.");
            }

            await new Promise(r => setTimeout(r, 800));
            
            addLog("✅ Hoàn tất quy trình.");
            setStatus(AppStatus.COMPLETE);

        } catch (err: any) {
            const errMsg = err.message || "";
            let newStatus: 'quota_exceeded' | 'error' | null = null;
            if (errMsg.includes('429') || errMsg.includes('Quota') || errMsg.includes('resource_exhausted')) {
                newStatus = 'quota_exceeded';
                addLog(`⚠️ Quota Exceeded on Key "${currentKeyConfig.alias}". Rotating...`);
            } else {
                newStatus = 'error';
                addLog(`⛔ Error on Key "${currentKeyConfig.alias}": ${errMsg}. Rotating...`);
            }
            localKeys[activeKeyIndex] = { ...localKeys[activeKeyIndex], status: newStatus };
            setApiKeys([...localKeys]);
            await new Promise(r => setTimeout(r, 1000));
        }
      }
    } catch (err: any) {
        setStatus(AppStatus.ERROR);
        setError(err.message || "Lỗi hệ thống không xác định.");
        addLog(`CRITICAL ERROR: ${err.message}`);
    }
  };

  // RENDER CONTENT BASED ON TAB
  const renderContent = () => {
    switch(activeTab) {
      case 'risk_center':
        return <ChannelHealthDashboard apiKeys={apiKeys} onSendReportToChat={handleSendReportToChat} />;
      case 'analytics':
        return (
            <AnalyticsDashboard 
                apiKeys={apiKeys} 
                onDeployStrategy={handleDeployStrategy} 
                onSendReportToChat={handleSendReportToChat}
            />
        );
      case 'marketplace':
        return <AIMarketplace onSelectProduct={handleSelectProduct} apiKeys={apiKeys} />;
      case 'queue': 
        return <QueueDashboard apiKeys={apiKeys} currentPlan={plan} jobs={queueJobs} setJobs={setQueueJobs} />;
      case 'batch_factory': 
        return <BatchProcessor apiKeys={apiKeys} onAddToQueue={(job) => setQueueJobs(prev => [job, ...prev])} />;
      case 'auto_pilot': // NEW TAB
        return <AutoPilotDashboard apiKeys={apiKeys} onAddToQueue={(job) => setQueueJobs(prev => [job, ...prev])} />;
      case 'settings':
        return (
          <SettingsDashboard 
             apiKeys={apiKeys} 
             setApiKeys={setApiKeys}
             knowledgeBase={knowledgeBase}
             setKnowledgeBase={setKnowledgeBase}
          />
        );
      case 'models':
        return (
          <ModelSelector 
            scriptModel={scriptModel}
            setScriptModel={setScriptModel}
            visualModel={visualModel}
            setVisualModel={setVisualModel}
            voiceModel={voiceModel}
            setVoiceModel={setVoiceModel}
          />
        );
      case 'campaign':
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            <div className="lg:col-span-1 space-y-4 md:space-y-6">
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-4 md:p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Bot size={18} className="text-primary" /> Smart Bot Input
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Dán Link bất kỳ (Kênh / Sản phẩm / Affiliate)
                    </label>
                    <div className="relative">
                       <input 
                        type="text" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="VD: TikTok Channel hoặc Link Shopee/ClickBank..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-4 pr-10 py-3 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-slate-600"
                      />
                      <div className="absolute right-3 top-3 text-slate-500">
                        <LinkIcon size={16} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <button 
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-xs flex items-center gap-1.5 text-primary font-medium hover:text-white transition-colors"
                    >
                      <SlidersHorizontal size={12} />
                      {showAdvanced ? "Ẩn tùy chọn nâng cao" : "Cấu hình phân loại & Video"}
                    </button>
                    {showAdvanced && (
                      <div className="mt-3 space-y-4 animate-fade-in bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        
                        {/* Section 1: Classification */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-1">
                              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Chủ đề</label>
                              <select 
                                  value={selectedNiche}
                                  onChange={(e) => setSelectedNiche(e.target.value as ContentNiche)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-2 text-xs text-white focus:outline-none focus:border-primary"
                              >
                                  <option value="AUTO">🤖 Auto</option>
                                  <option value="TECH">💻 Tech</option>
                                  <option value="BEAUTY">💄 Beauty</option>
                                  <option value="FINANCE">💰 Finance</option>
                                  <option value="CRYPTO">🪙 Crypto</option>
                                  <option value="NEWS">📰 News</option>
                                  <option value="ENTERTAINMENT">🎬 Fun</option>
                              </select>
                            </div>
                            <div className="col-span-1">
                              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Luồng</label>
                              <select 
                                  value={selectedWorkflow}
                                  onChange={(e) => setSelectedWorkflow(e.target.value as ContentWorkflow)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-2 text-xs text-white focus:outline-none focus:border-primary"
                              >
                                  <option value="AUTO">🤖 Auto</option>
                                  <option value="VIRAL_CLONE">🔥 Clone</option>
                                  <option value="REVIEW_TUTORIAL">⭐ Review</option>
                                  <option value="NEWS_SUMMARY">📢 News</option>
                                  <option value="STORYTELLING">📖 Story</option>
                                  <option value="EDUCATIONAL">🎓 Edu</option>
                                  <option value="REACTION">😲 React</option>
                              </select>
                            </div>
                        </div>

                        {/* Section 2: Video Specs (New) */}
                        <div className="border-t border-slate-800 pt-3">
                           <h5 className="text-[10px] font-bold text-primary mb-2 flex items-center gap-1"><MonitorPlay size={10} /> THÔNG SỐ VIDEO</h5>
                           <div className="grid grid-cols-2 gap-3">
                               <div>
                                  <label className="block text-[10px] text-slate-500 mb-1 flex items-center gap-1"><Ratio size={10}/> Tỷ lệ</label>
                                  <select 
                                      value={aspectRatio}
                                      onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-2 text-xs text-white focus:outline-none"
                                  >
                                      <option value="9:16">9:16</option>
                                      <option value="16:9">16:9</option>
                                      <option value="1:1">1:1</option>
                                  </select>
                                </div>
                               <div>
                                  <label className="block text-[10px] text-slate-500 mb-1">Độ phân giải</label>
                                  <select 
                                      value={resolution}
                                      onChange={(e) => setResolution(e.target.value as VideoResolution)}
                                      className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-2 text-xs text-white focus:outline-none"
                                  >
                                      <option value="720p">720p</option>
                                      <option value="1080p">1080p</option>
                                      <option value="4K">4K</option>
                                  </select>
                               </div>
                           </div>
                        </div>

                        {/* Section 3: AI Models (New) */}
                        <div className="border-t border-slate-800 pt-3">
                           <div className="flex items-center justify-between mb-2">
                               <h5 className="text-[10px] font-bold text-primary flex items-center gap-1"><Cpu size={10} /> AI MODELS CONFIG</h5>
                               <button 
                                  onClick={() => setActiveTab('models')}
                                  className="text-[10px] text-blue-400 hover:text-white flex items-center gap-1 underline"
                               >
                                  Config <ArrowRight size={10} />
                               </button>
                           </div>
                           <div className="space-y-2">
                               <div className="flex items-center justify-between">
                                  <label className="text-[10px] text-slate-500 flex items-center gap-1"><Type size={10}/> Script:</label>
                                  <span className="text-[10px] text-white font-mono bg-slate-900 px-1.5 rounded border border-slate-700 truncate max-w-[120px]">{scriptModel}</span>
                               </div>
                               <div className="flex items-center justify-between">
                                  <label className="text-[10px] text-slate-500 flex items-center gap-1"><Palette size={10}/> Visual:</label>
                                  <span className="text-[10px] text-white font-mono bg-slate-900 px-1.5 rounded border border-slate-700 truncate max-w-[120px]">{visualModel}</span>
                               </div>
                               <div className="flex items-center justify-between">
                                  <label className="text-[10px] text-slate-500 flex items-center gap-1"><Mic size={10}/> Voice:</label>
                                  <span className="text-[10px] text-white font-mono bg-slate-900 px-1.5 rounded border border-slate-700 truncate max-w-[120px]">{voiceModel}</span>
                               </div>
                           </div>
                        </div>
                        
                        {/* GOOGLE ECOSYSTEM TOGGLE */}
                        <div className="col-span-2 mt-1 pt-2 border-t border-slate-800">
                           <button 
                              onClick={() => setPreferGoogleStack(!preferGoogleStack)}
                              className={`w-full py-2 px-3 rounded-lg border flex items-center justify-between text-xs transition-all ${
                                preferGoogleStack 
                                ? 'bg-blue-900/30 border-blue-500 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                                : 'bg-slate-900 border-slate-700 text-slate-500'
                              }`}
                           >
                              <span className="flex items-center gap-2 truncate">
                                <Sparkles size={14} className={preferGoogleStack ? "text-yellow-400" : ""} />
                                Prefer Google Stack (Gemini, Veo)
                              </span>
                              <div className={`w-8 h-4 rounded-full p-0.5 transition-colors shrink-0 ${preferGoogleStack ? 'bg-blue-500' : 'bg-slate-700'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${preferGoogleStack ? 'translate-x-4' : ''}`}></div>
                              </div>
                           </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pt-2">
                    <NeonButton 
                      onClick={handleStartRequest} 
                      disabled={status !== AppStatus.IDLE && status !== AppStatus.COMPLETE && status !== AppStatus.ERROR}
                      className="w-full"
                      size="lg"
                    >
                       {status !== AppStatus.IDLE && status !== AppStatus.COMPLETE && status !== AppStatus.ERROR ? (
                         <span className="flex items-center gap-2">
                           <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                           Routing...
                         </span>
                       ) : (
                         <>
                           <Zap size={20} className="fill-current" /> BẬT TỰ ĐỘNG
                         </>
                       )}
                    </NeonButton>
                  </div>
                </div>
              </div>
              <div className="bg-black border border-slate-800 rounded-xl p-4 h-40 md:h-64 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                   <span className="text-xs font-mono text-slate-500 flex items-center gap-2">
                     <Cpu size={12} /> SYSTEM LOGS
                   </span>
                   <span className="flex h-2 w-2 relative">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === AppStatus.IDLE ? 'bg-slate-500' : 'bg-green-500'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${status === AppStatus.IDLE ? 'bg-slate-500' : 'bg-green-500'}`}></span>
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1 pr-2">
                  {logs.length === 0 && <span className="text-slate-700 italic">Waiting for input...</span>}
                  {logs.map((log, i) => (
                    <div key={i} className={`border-l-2 pl-2 mb-1 break-words ${log.includes('ERROR') || log.includes('FATAL') ? 'text-red-400 border-red-500' : log.includes('Quota') ? 'text-orange-400 border-orange-500' : log.includes('ROUTER') ? 'text-purple-400 border-purple-500' : log.includes('MANUAL') ? 'text-yellow-400 border-yellow-500' : log.includes('GOOGLE') ? 'text-blue-400 border-blue-500' : 'text-green-400/80 border-slate-800'}`}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
                  <AlertTriangle size={20} />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {status === AppStatus.COMPLETE && plan ? (
                <PlanResult data={plan} onPost={handlePostToZalo} />
              ) : (
                <div className="h-full min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20 p-6 md:p-8">
                   {status !== AppStatus.IDLE && status !== AppStatus.COMPLETE && status !== AppStatus.ERROR ? (
                     <div className="max-w-md space-y-6 animate-fade-in">
                        <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto">
                          <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin"></div>
                          <div className="absolute inset-2 border-b-4 border-accent rounded-full animate-spin-slow"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Bot size={28} className="text-white animate-pulse" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                            {status === AppStatus.ROUTING && "AI Router Đang Phân Loại..."}
                            {status === AppStatus.ANALYZING && "Quét Metadata & Insight..."}
                            {status === AppStatus.PLANNING && "Lập Chiến Lược Nội Dung..."}
                            {status === AppStatus.PARAPHRASING && "Viết Kịch Bản Chuyển Đổi..."}
                            {status === AppStatus.RENDERING && "Dựng Video Demo..."}
                          </h3>
                          <p className="text-slate-400 text-xs md:text-sm">Hệ thống đang tự động tối ưu hoá nội dung dựa trên loại liên kết bạn cung cấp.</p>
                        </div>
                     </div>
                   ) : (
                     <div className="text-slate-600 max-w-sm">
                       <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                          <LayoutDashboard size={28} />
                       </div>
                       <h3 className="text-base md:text-lg font-medium text-slate-400 mb-2">Sẵn sàng nhận lệnh</h3>
                       <p className="text-xs md:text-sm">Nhập URL sản phẩm hoặc kênh, Smart Bot sẽ lo phần còn lại.</p>
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-primary/30 overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        {/* Mobile Header */}
        <div className="md:hidden p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-2">
             <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-slate-900">
                <Menu size={20} />
             </button>
             <span className="font-bold text-primary text-base">AV Studio</span>
          </div>
          <div className={`w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center ${activeKeysCount > 0 ? 'bg-green-500/10' : 'bg-slate-900'}`}>
             <div className={`w-1.5 h-1.5 rounded-full ${activeKeysCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-lg md:text-3xl font-bold text-white mb-1 md:mb-2 leading-tight truncate">
                  {activeTab === 'campaign' && "Smart Campaign Wizard"}
                  {activeTab === 'batch_factory' && "Batch Video Production"}
                  {activeTab === 'analytics' && "Strategic Intelligence"}
                  {activeTab === 'risk_center' && "Channel Risk Center"}
                  {activeTab === 'marketplace' && "AI Affiliate Hub"}
                  {activeTab === 'settings' && "System Control Center"}
                  {activeTab === 'queue' && "Social Scheduler"}
                  {activeTab === 'models' && "AI Model Orchestration"}
                  {activeTab === 'auto_pilot' && "Infinity Auto-Pilot"}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-slate-400 text-xs md:text-sm hidden md:block">
                    {activeTab === 'campaign' && "Tự động phân loại nguồn và tạo video theo chiến lược thông minh."}
                    {activeTab === 'batch_factory' && "Nhà máy sản xuất hàng loạt: Input danh sách -> Output video + lịch đăng tự động."}
                    {activeTab === 'analytics' && "Tình báo thị trường, giải mã đối thủ để Clone & Build New."}
                    {activeTab === 'risk_center' && "Phân tích sức khỏe kênh, phát hiện rủi ro và nhận diện Shadowban."}
                    {activeTab === 'marketplace' && "Khám phá các sản phẩm AI hoa hồng cao để review."}
                    {activeTab === 'settings' && "Quản lý API Vault, AI Brain và cấu hình hệ thống."}
                    {activeTab === 'queue' && "Lên lịch đăng bài tự động, tối ưu giờ vàng và quản lý đa kênh."}
                    {activeTab === 'models' && "Cấu hình sức mạnh lõi của hệ thống AI (Script, Visual, Voice)."}
                    {activeTab === 'auto_pilot' && "Chế độ chạy ngầm 24/7: Tự động săn tìm, tạo video và đăng bài liên tục."}
                    </p>
                    
                    {/* Zalo Video Indicator */}
                    {hasZaloVideo && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                            </span>
                            <MessageCircle size={10} /> Zalo Video Active
                        </span>
                    )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="px-3 py-2 md:py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white hover:border-slate-600 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Settings size={14} /> <span className="inline">Cấu hình Vault</span>
                </button>
                <div className="h-4 w-px bg-slate-800 mx-2 hidden sm:block"></div>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 md:py-1.5 border rounded-lg transition-all whitespace-nowrap ${
                    activeKeysCount > 0 
                      ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-green-500/50' 
                      : 'bg-red-900/20 border-red-500/50 text-red-400 animate-pulse'
                  }`}
                >
                   <Layers size={14} className={activeKeysCount > 0 ? "text-green-500" : "text-red-500"} />
                   <span className="text-xs font-mono">
                     {activeKeysCount > 0 ? `${activeKeysCount} Keys` : 'NO KEYS'}
                   </span>
                   {activeKeysCount > 0 && activeKeysCount < apiKeys.length && (
                     <RotateCw size={12} className="text-yellow-500 ml-1 hidden md:block" />
                   )}
                </button>
              </div>
            </div>
            {renderContent()}
          </div>
        </div>
        <AIChatAssistant 
           apiKey={primaryApiKey} 
           appContext={appContext} 
           onCommand={handleAgentCommand}
        />
        <ConsentModal 
          isOpen={showConsent} 
          onClose={() => setShowConsent(false)} 
          onConfirm={executePipeline} 
        />
      </main>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>
  );
}

export default App;
