import React, { useState, useEffect } from 'react';
import { Globe, Menu, Clock } from 'lucide-react';
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
  AppContext, AgentCommand, ScriptModel, VisualModel, VoiceModel, VideoResolution, AspectRatio,
  AppStatus
} from './types';

// Full Translations Dictionary
const TRANSLATIONS: Record<AppLanguage, any> = {
  vi: {
    // Sidebar
    studio: 'Trạm Phân Tích Viral',
    auto: 'Auto-Pilot Vô Cực',
    campaign: 'Chiến Dịch Hàng Loạt',
    analytics: 'Tình Báo Chiến Lược',
    market: 'Chợ AI & Affiliate',
    risk: 'Trung Tâm Rủi Ro',
    queue: 'Lịch Trình & Đăng',
    docs: 'Hướng Dẫn',
    settings: 'Cấu Hình Hệ Thống',

    // Viral DNA Studio
    title: 'Viral DNA Studio',
    subtitle: 'Giải mã công thức thành công từ đối thủ & Tái tạo nội dung.',
    studio_tabs: {
        dna: 'Phân Tích DNA',
        script: 'Kịch Bản AI',
        studio: 'Dựng Video',
        quality: 'Kiểm Duyệt'
    },
    input_section: 'Nguồn Dữ Liệu Đầu Vào',
    input_placeholder: 'Dán liên kết video (TikTok, Shorts, Reels)...',
    btn_add_source: 'Thêm Nguồn Mới',
    btn_upload: 'Tải Video Mẫu (mp4)',
    analyze_btn: 'Trích Xuất Cấu Trúc Viral DNA',
    script_engine: {
        title: 'Bộ Máy Viết Kịch Bản Pro',
        topic_label: 'Chủ Đề Trọng Tâm (Bắt buộc)',
        generate_btn: 'Viết Kịch Bản Mới',
        generating: 'Đang Viết...'
    },
    video_studio: {
        title: 'Xưởng Dựng Phim Tự Động',
        render_btn: 'Render Video (Mô Phỏng)',
        rendering: 'Đang Dựng...'
    },

    // Auto Pilot
    status_label: 'Trạng Thái',
    config_title: 'Tham Số Nhiệm Vụ',
    niche_label: 'Ngách Mục Tiêu',
    stats_videos: 'Video Đã Tạo',
    stats_posted: 'Đã Đăng',
    stats_uptime: 'Thời Gian Chạy',
    logs_title: 'Nhật Ký Hoạt Động (Live Logs)',
    library_title: 'Kho Nội Dung Tự Động',

    // Queue
    input_title: 'Tiêu Đề Nội Dung',
    input_caption: 'Mô Tả & Hashtags',
    platform_label: 'Nền Tảng Đăng Tải',
    schedule_label: 'Chế Độ Lên Lịch',
    mode_smart: 'Thông Minh',
    mode_auto: 'Tự Động',
    mode_manual: 'Thủ Công',
    mode_now: 'Đăng Ngay',
    btn_analyzing: 'Đang Xử Lý...',
    btn_post_now: 'Xuất Bản Ngay Lập Tức',
    btn_schedule: 'Thêm Vào Hàng Chờ',
    queue_list_title: 'Danh Sách Chờ Đăng',

    // Analytics
    view_standard: 'Cơ Bản',
    view_deep: 'Quét Sâu (Deep Scan)',
    auto_recon_btn: 'Bật Trinh Sát Tự Động',
    stop_auto_btn: 'Dừng Trinh Sát',
    manual_target: 'Mục Tiêu Chỉ Định',
    waiting: 'Đang chờ dữ liệu...',
    analysis_title: 'Phân Tích Thời Gian Thực',
    deploy_btn: 'Triển Khai Ngay',
    winner_title: 'Cơ Hội Tốt Nhất (Winner)',

    // Marketplace
    tab_market: 'Sàn Sản Phẩm',
    tab_hunter: 'Thợ Săn (Hunter)',
    filter_google: 'Hệ Sinh Thái Google',
    hunter_title: 'AI Product Hunter',
    hunter_desc: 'Tự động quét các mạng lưới Affiliate để tìm sản phẩm có hoa hồng cao và độ cạnh tranh thấp.',
    niche_placeholder: 'Nhập ngách cần săn (VD: Gia dụng thông minh...)',
    activate_btn: 'Kích Hoạt Săn Tìm',
    hunting: 'Đang Săn...',
    results_found: 'Sản Phẩm Tìm Thấy',

    // Risk Center
    btn_scan: 'CHẠY KIỂM TRA TOÀN DIỆN',
    btn_scanning: 'Đang Quét Mạng Lưới...',
    alert_key: 'Cần Google API Key để phân tích rủi ro.',

    // Settings
    sections: {
        general: 'Tùy Chọn Chung'
    },
    settings_tabs: {
        brain: 'Bộ Não AI',
        vault: 'Kho Chìa Khóa (Vault)',
        studio: 'Cấu Hình Studio',
        system: 'Hệ Thống'
    },

    // Batch
    input_label: '1. Danh Sách Nguồn Đầu Vào',
    import_btn: 'Nhập Vào Hàng Chờ',
    control_title: '2. Điều Khiển',
    processing: 'Đang Xử Lý Hàng Loạt...',
    start_btn: 'Bắt Đầu Sản Xuất',
    clear_btn: 'Xóa Tất Cả',
    progress_title: 'Tiến Độ Sản Xuất',
    empty_state: 'Danh sách trống. Vui lòng nhập liên kết hoặc chủ đề.',
    done: 'Hoàn thành',

    // Plan Result
    viral_score: 'Điểm Tiềm Năng Viral',
    tiktok_trend: 'Xu Hướng TikTok',
    yt_shorts: 'YouTube Shorts',
    est_cpm: 'CPM Ước Tính',
    audience_persona: 'Chân Dung Khán Giả',
    deep_analysis: 'Phân Tích Chuyên Sâu',
    script_scenes: 'Kịch Bản & Phân Cảnh',
    voiceover: 'Lời Thoại (Voiceover)',
    visual: 'Hình Ảnh Mô Tả',
    live_preview: 'XEM TRƯỚC (LIVE)',
    auto_post_timer: 'Tự Động Đăng Sau',
    posted_success: 'ĐÃ ĐĂNG THÀNH CÔNG',
    schedule: 'Lên Lịch / Hàng Chờ',
    post_now: 'ĐĂNG NGAY LẬP TỨC',
    gen_metadata: 'Metadata Đã Tạo',
    title_viral: 'Tiêu Đề (Viral Hook)',
    desc_seo: 'Mô Tả (Chuẩn SEO)',
    hashtags: 'Hashtags',
    share: 'Chia Sẻ',
    download: 'Tải Về JSON',

    // Model Selector
    specs_title: 'Thông Số Kỹ Thuật Đầu Ra',
    script_title: 'Trí Tuệ Kịch Bản (Script)',
    visual_title: 'Động Cơ Hình Ảnh (Visual)',
    voice_title: 'Tổng Hợp Giọng Nói (Voice)'
  },
  en: {
    // Sidebar
    studio: 'Viral DNA Studio',
    auto: 'Infinity Auto-Pilot',
    campaign: 'Batch Campaign',
    analytics: 'Strategic Intel',
    market: 'AI Marketplace',
    risk: 'Risk Center',
    queue: 'Scheduler & Queue',
    docs: 'Documentation',
    settings: 'System Config',

    // Viral DNA Studio
    title: 'Viral DNA Studio',
    subtitle: 'Decode competitor success & Replicate content.',
    studio_tabs: {
        dna: 'Viral DNA',
        script: 'AI Script',
        studio: 'Video Studio',
        quality: 'Quality Gate'
    },
    input_section: 'Input Data Source',
    input_placeholder: 'Paste video link (TikTok, Shorts, Reels)...',
    btn_add_source: 'Add Source',
    btn_upload: 'Upload Sample (mp4)',
    analyze_btn: 'Extract Viral DNA',
    script_engine: {
        title: 'Pro Script Engine',
        topic_label: 'Core Topic (Required)',
        generate_btn: 'Generate Script',
        generating: 'Writing...'
    },
    video_studio: {
        title: 'Automated Video Studio',
        render_btn: 'Render Video (Sim)',
        rendering: 'Rendering...'
    },

    // Auto Pilot
    status_label: 'Status',
    config_title: 'Mission Params',
    niche_label: 'Target Niche',
    stats_videos: 'Videos Created',
    stats_posted: 'Posted',
    stats_uptime: 'Uptime',
    logs_title: 'Live Activity Logs',
    library_title: 'Content Library',

    // Queue
    input_title: 'Content Title',
    input_caption: 'Caption & Hashtags',
    platform_label: 'Target Platforms',
    schedule_label: 'Schedule Mode',
    mode_smart: 'Smart',
    mode_auto: 'Auto',
    mode_manual: 'Manual',
    mode_now: 'Post Now',
    btn_analyzing: 'Processing...',
    btn_post_now: 'Publish Immediately',
    btn_schedule: 'Add to Queue',
    queue_list_title: 'Pending Queue',

    // Analytics
    view_standard: 'Standard',
    view_deep: 'Deep Scan',
    auto_recon_btn: 'Enable Auto-Recon',
    stop_auto_btn: 'Stop Recon',
    manual_target: 'Manual Target',
    waiting: 'Waiting for data...',
    analysis_title: 'Real-time Analysis',
    deploy_btn: 'Deploy Strategy',
    winner_title: 'Best Opportunity',

    // Marketplace
    tab_market: 'Marketplace',
    tab_hunter: 'Hunter',
    filter_google: 'Google Ecosystem',
    hunter_title: 'AI Product Hunter',
    hunter_desc: 'Automatically scan affiliate networks for high commission & low competition products.',
    niche_placeholder: 'Enter niche (e.g. Smart Home...)',
    activate_btn: 'Activate Hunter',
    hunting: 'Hunting...',
    results_found: 'Products Found',

    // Risk Center
    btn_scan: 'RUN SYSTEM AUDIT',
    btn_scanning: 'Scanning Network...',
    alert_key: 'Google API Key required for risk analysis.',

    // Settings
    sections: {
        general: 'General Preferences'
    },
    settings_tabs: {
        brain: 'AI Brain',
        vault: 'API Vault',
        studio: 'Studio Config',
        system: 'System'
    },

    // Batch
    input_label: '1. Input Source List',
    import_btn: 'Import to Queue',
    control_title: '2. Controls',
    processing: 'Batch Processing...',
    start_btn: 'Start Production',
    clear_btn: 'Clear All',
    progress_title: 'Production Progress',
    empty_state: 'List empty. Please enter links or topics.',
    done: 'Done',

    // Plan Result
    viral_score: 'Viral Potential Score',
    tiktok_trend: 'TikTok Trend',
    yt_shorts: 'YouTube Shorts',
    est_cpm: 'Est. CPM',
    audience_persona: 'Target Audience',
    deep_analysis: 'Deep Analysis',
    script_scenes: 'Script & Scenes',
    voiceover: 'Voiceover',
    visual: 'Visual Cues',
    live_preview: 'LIVE PREVIEW',
    auto_post_timer: 'Auto-Post Timer',
    posted_success: 'POSTED SUCCESSFULLY',
    schedule: 'Schedule / Queue',
    post_now: 'POST NOW',
    gen_metadata: 'Generated Metadata',
    title_viral: 'Title (Viral)',
    desc_seo: 'Description (SEO)',
    hashtags: 'Hashtags',
    share: 'Share',
    download: 'Download JSON',

    // Model Selector
    specs_title: 'Output Specifications',
    script_title: 'Script Intelligence',
    visual_title: 'Visual Engine',
    voice_title: 'Voice Synthesis'
  },
  // Placeholders for other languages to prevent crash
  jp: {}, es: {}, cn: {}
};

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState<TabView>('studio');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
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

  // --- CLOCK EFFECT ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- ACTIONS ---
  const handleAddToQueue = (job: PostingJob) => {
      setJobs(prev => [job, ...prev]);
  };

  const handleVideoGenerated = (video: CompletedVideo) => {
      setCompletedVideos(prev => [video, ...prev]);
  };

  const handleDeployStrategy = (url: string, type: 'clone' | 'review') => {
      setActiveTab('studio');
      // Logic to pre-fill studio inputs could go here via context or event bus
      console.log(`Deploying strategy for ${url} [${type}]`);
  };

  // --- CHAT CONTEXT & COMMANDS ---
  const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active')?.key;
  
  const appContext: AppContext = {
      activeTab,
      status: AppStatus.IDLE,
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

    // Use current language translations, fallback to Vietnamese if missing
    const t = TRANSLATIONS[appLanguage] || TRANSLATIONS['vi'];

    switch (activeTab) {
      case 'studio':
        return <ViralDNAStudio 
            apiKeys={apiKeys} 
            appLanguage={appLanguage} 
            contentLanguage={contentLanguage} 
            setContentLanguage={setContentLanguage}
            t={t}
            {...commonModelProps}
        />;
      case 'auto_pilot':
        return <AutoPilotDashboard 
            apiKeys={apiKeys} 
            onAddToQueue={handleAddToQueue} 
            onVideoGenerated={handleVideoGenerated}
            completedVideos={completedVideos}
            t={t}
            {...commonModelProps}
        />;
      case 'queue':
        return <QueueDashboard 
            apiKeys={apiKeys} 
            currentPlan={currentPlan} 
            jobs={jobs} 
            setJobs={setJobs} 
            t={t}
        />;
      case 'analytics':
        return <AnalyticsDashboard 
            apiKeys={apiKeys} 
            onDeployStrategy={handleDeployStrategy}
            onSendReportToChat={(msg) => console.log(msg)}
            t={t}
        />;
      case 'marketplace':
        return <AIMarketplace 
            apiKeys={apiKeys} 
            onSelectProduct={(url) => handleDeployStrategy(url, 'review')}
            t={t}
        />;
      case 'risk_center':
        return <ChannelHealthDashboard 
            apiKeys={apiKeys} 
            onSendReportToChat={(msg) => console.log(msg)}
            t={t}
        />;
      case 'campaign': 
        return <BatchProcessor 
            apiKeys={apiKeys} 
            onAddToQueue={handleAddToQueue}
            t={t}
            {...commonModelProps}
        />;
      case 'settings':
        return <SettingsDashboard 
            apiKeys={apiKeys} 
            setApiKeys={setApiKeys} 
            knowledgeBase={knowledgeBase} 
            setKnowledgeBase={setKnowledgeBase}
            t={t}
        />;
      case 'docs':
        return <Documentation />;
      default:
        return <div className="p-10 text-center text-slate-500">Component Not Found</div>;
    }
  };

  return (
    // Changed h-screen to h-[100dvh] for mobile browser optimization
    <div className="flex h-[100dvh] bg-[#020617] text-white font-sans overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            t={TRANSLATIONS[appLanguage] || TRANSLATIONS['vi']}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
            
            {/* Top Bar */}
            <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-30 relative">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden p-2 text-slate-400 hover:text-white"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs">v2.5.0-beta</span>
                        <span>Enterprise</span>
                    </div>
                </div>

                {/* CENTRAL CLOCK (FIXED ON HEADER) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-3 bg-slate-900/50 px-4 py-1.5 rounded-full border border-slate-800/50 shadow-inner backdrop-blur-md group">
                    <Clock size={14} className="text-primary animate-pulse group-hover:text-white transition-colors" />
                    <span className="text-sm font-mono font-bold text-slate-200 tracking-widest tabular-nums group-hover:text-primary transition-colors">
                        {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase border-l border-slate-700 pl-3">
                         {currentTime.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* APP UI LANGUAGE TOGGLE */}
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 gap-1 relative">
                        <span className="text-slate-500 px-2 flex items-center justify-center">
                            <Globe size={16} />
                        </span>
                        <select 
                            value={appLanguage}
                            onChange={(e) => setAppLanguage(e.target.value as AppLanguage)}
                            className="bg-transparent text-xs font-bold text-white focus:outline-none py-1 pr-2 cursor-pointer w-full h-full opacity-0 absolute inset-0 z-10"
                            title="Change Language"
                        >
                            <option value="vi">Tiếng Việt</option>
                            <option value="en">English</option>
                            <option value="jp">日本語</option>
                            <option value="es">Español</option>
                            <option value="cn">中文</option>
                        </select>
                         <span className="text-xs font-bold text-slate-300 pr-2 pointer-events-none uppercase">{appLanguage}</span>
                    </div>

                    <div className="h-4 w-px bg-slate-800 mx-2 hidden sm:block"></div>
                    
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${apiKeys.some(k => k.status === 'active') ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>
                        <span className="text-xs font-bold text-slate-300 hidden md:block">System Status</span>
                    </div>
                </div>
            </header>

            {/* Scrollable Content Area - Using flex-1 to take remaining space */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 relative scroll-smooth bg-[#020617]">
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