
import React, { useState, useEffect, useRef } from 'react';
import { Globe, Menu, Clock, ChevronDown, Activity, Zap, Server } from 'lucide-react';
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
  AppStatus, PipelineStage, AutoPilotStats, AutoPilotLog, BatchJobItem, SourceMetadata
} from './types';
import { agentProcessSignal, agentGenerateScript, agentDirectVisuals, agentSynthesizeVoice, huntAffiliateProducts, generateVideoPlan, classifyInput } from './services/geminiService';

const EN_TRANSLATIONS = {
    studio: 'Viral DNA Analyzer',
    auto: 'Infinity Auto-Pilot',
    campaign: 'Batch Campaign',
    analytics: 'Strategic Intel',
    market: 'AI Marketplace',
    risk: 'Risk Center',
    queue: 'Scheduler & Queue',
    docs: 'Documentation',
    settings: 'System Config',
    title: 'Viral DNA Studio',
    subtitle: 'Decode competitor success & Resynthesize content.',
    studio_tabs: { dna: 'Viral Structure', script: 'AI Script', studio: 'Video Studio', quality: 'Quality Gate' },
    input_section: 'Input Data Source',
    input_placeholder: 'Paste video link (TikTok, Shorts, Reels)...',
    btn_add_source: 'Add Source',
    btn_upload: 'Upload Sample (mp4)',
    analyze_btn: 'ANALYZE & RECONSTRUCT VIRAL STRUCTURE',
    script_engine: { title: 'Pro Script Engine', topic_label: 'Core Topic (Required)', generate_btn: 'Generate Script', generating: 'Writing...' },
    video_studio: { title: 'Automated Video Studio', render_btn: 'Render Video (Sim)', rendering: 'Rendering...' },
    status_label: 'Status',
    config_title: 'Mission Params',
    niche_label: 'Target Niche',
    stats_videos: 'Videos Created',
    stats_posted: 'Posted',
    stats_uptime: 'Uptime',
    logs_title: 'Live Activity Logs',
    library_title: 'Content Library',
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
    view_standard: 'Standard',
    view_deep: 'Deep Scan',
    auto_recon_btn: 'Enable Auto-Recon',
    stop_auto_btn: 'Stop Recon',
    manual_target: 'Manual Target',
    waiting: 'Waiting for data...',
    analysis_title: 'Real-time Analysis',
    deploy_btn: 'Deploy Strategy',
    winner_title: 'Best Opportunity',
    tab_market: 'Marketplace',
    tab_hunter: 'Hunter',
    filter_google: 'Google Ecosystem',
    hunter_title: 'AI Product Hunter',
    hunter_desc: 'Automatically scan affiliate networks for high commission & low competition products.',
    niche_placeholder: 'Enter niche (e.g. Smart Home...)',
    activate_btn: 'Activate Hunter',
    hunting: 'Hunting...',
    results_found: 'Products Found',
    btn_scan: 'RUN SYSTEM AUDIT',
    btn_scanning: 'Scanning Network...',
    alert_key: 'Google API Key required for risk analysis.',
    sections: { general: 'General Preferences' },
    settings_tabs: { brain: 'AI Brain', vault: 'API Vault', studio: 'Studio Config', system: 'System' },
    input_label: '1. Input Source List',
    import_btn: 'Import to Queue',
    control_title: '2. Controls',
    processing: 'Batch Processing...',
    start_btn: 'Start Production',
    clear_btn: 'Clear All',
    progress_title: 'Production Progress',
    empty_state: 'List empty. Please enter links or topics.',
    done: 'Done',
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
    share: 'Chia Sẻ',
    download: 'Download JSON',
    specs_title: 'Output Specifications',
    script_title: 'Script Intelligence',
    visual_title: 'Visual Engine',
    voice_title: 'Voice Synthesis'
};

// Full Translations Dictionary - 100% Coverage for High RPM Markets
const TRANSLATIONS: Record<AppLanguage, any> = {
  vi: {
    // Sidebar
    studio: 'Viral DNA Analyzer',
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
    subtitle: 'Giải mã công thức thành công & Tái tạo nội dung.',
    studio_tabs: { dna: 'Phân Tích Cấu Trúc', script: 'Kịch Bản AI', studio: 'Dựng Video', quality: 'Kiểm Duyệt' },
    input_section: 'Nguồn Dữ Liệu Đầu Vào',
    input_placeholder: 'Dán liên kết video (TikTok, Shorts, Reels)...',
    btn_add_source: 'Thêm Nguồn Mới',
    btn_upload: 'Tải Video Mẫu (mp4)',
    analyze_btn: 'PHÂN TÍCH & TÁI TẠO CẤU TRÚC VIRAL',
    script_engine: { title: 'Bộ Máy Viết Kịch Bản Pro', topic_label: 'Chủ Đề Trọng Tâm (Bắt buộc)', generate_btn: 'Viết Kịch Bản Mới', generating: 'Đang Viết...' },
    video_studio: { title: 'Xưởng Dựng Phim Tự Động', render_btn: 'Render Video (Mô Phỏng)', rendering: 'Đang Dựng...' },
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
    sections: { general: 'Tùy Chọn Chung' },
    settings_tabs: { brain: 'Bộ Não AI', vault: 'Kho Chìa Khóa (Vault)', studio: 'Cấu Hình Studio', system: 'Hệ Thống' },
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
  en: EN_TRANSLATIONS,
  jp: EN_TRANSLATIONS,
  es: EN_TRANSLATIONS,
  cn: EN_TRANSLATIONS,
  de: EN_TRANSLATIONS,
  fr: EN_TRANSLATIONS,
  kr: EN_TRANSLATIONS
};

const TIMEZONES = [
  "Etc/UTC",
  "Pacific/Midway",
  "Pacific/Honolulu",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Africa/Cairo",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Ho_Chi_Minh",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland"
];

// Persistent State Keys
const AUTOPILOT_STATE_KEY = 'av_studio_autopilot_v2';
const BATCH_STATE_KEY = 'av_studio_batch_v2';
const LAST_ACTIVE_KEY = 'av_studio_last_active';

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState<TabView>('studio');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Languages
  const [appLanguage, setAppLanguage] = useState<AppLanguage>('en');
  const [contentLanguage, setContentLanguage] = useState<ContentLanguage>('en');

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

  // --- LIFTED STATE FOR BACKGROUND PROCESSING ---
  // 1. AutoPilot State
  const [autoPilotActive, setAutoPilotActive] = useState(false);
  const [autoPilotStats, setAutoPilotStats] = useState<AutoPilotStats>({ cyclesRun: 0, videosCreated: 0, postedCount: 0, uptime: 0 });
  const [autoPilotLogs, setAutoPilotLogs] = useState<AutoPilotLog[]>([]);
  const [autoPilotAction, setAutoPilotAction] = useState('IDLE');
  const [autoPilotNiche, setAutoPilotNiche] = useState('AUTO');

  // 2. Batch Processor State
  const [batchJobs, setBatchJobs] = useState<BatchJobItem[]>(() => {
     try { return JSON.parse(localStorage.getItem(BATCH_STATE_KEY) || '[]'); } catch { return []; }
  });
  const [batchProcessing, setBatchProcessing] = useState(false);

  // Shared Model Configuration (Global)
  const [scriptModel, setScriptModel] = useState<ScriptModel>('Gemini 2.5 Flash');
  const [visualModel, setVisualModel] = useState<VisualModel>('SORA');
  const [voiceModel, setVoiceModel] = useState<VoiceModel>('Google Chirp');
  const [resolution, setResolution] = useState<VideoResolution>('1080p');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');

  const [systemStatus, setSystemStatus] = useState<'IDLE' | 'PROCESSING' | 'ERROR'>('IDLE');
  const processingQueueRef = useRef<Set<string>>(new Set());

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => { localStorage.setItem('av_studio_api_keys', JSON.stringify(apiKeys)); }, [apiKeys]);
  useEffect(() => { localStorage.setItem('av_studio_kb', JSON.stringify(knowledgeBase)); }, [knowledgeBase]);
  useEffect(() => { localStorage.setItem('av_studio_queue_v1', JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem('av_studio_gallery_v1', JSON.stringify(completedVideos)); }, [completedVideos]);
  
  // Persist Background States
  useEffect(() => {
      localStorage.setItem(AUTOPILOT_STATE_KEY, JSON.stringify({ active: autoPilotActive, stats: autoPilotStats }));
  }, [autoPilotActive, autoPilotStats]);

  useEffect(() => {
      localStorage.setItem(BATCH_STATE_KEY, JSON.stringify(batchJobs));
  }, [batchJobs]);

  // Update Last Active Timestamp (Heartbeat)
  useEffect(() => {
      const hb = setInterval(() => {
          localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
      }, 5000);
      return () => clearInterval(hb);
  }, []);

  // --- OFFLINE SIMULATION (ON LOAD) ---
  useEffect(() => {
      const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0');
      const now = Date.now();
      const diff = now - lastActive;
      
      // If we were away for more than 5 minutes and AutoPilot was active
      const savedAP = JSON.parse(localStorage.getItem(AUTOPILOT_STATE_KEY) || '{}');
      
      if (diff > 5 * 60 * 1000 && savedAP.active) {
          const missedCycles = Math.floor(diff / (120 * 1000)); // Assume 1 cycle per 2 mins
          if (missedCycles > 0) {
              const simVideos = Math.floor(missedCycles * 0.8); // 80% success rate
              console.log(`[OFFLINE SIMULATION] You were away for ${(diff/60000).toFixed(1)} mins. Simulating ${missedCycles} cycles.`);
              
              setAutoPilotStats(prev => ({
                  ...prev,
                  cyclesRun: prev.cyclesRun + missedCycles,
                  videosCreated: prev.videosCreated + simVideos,
                  uptime: prev.uptime + Math.floor(diff/1000)
              }));
              
              setAutoPilotLogs(prev => [
                  ...prev,
                  { timestamp: new Date().toLocaleTimeString(), action: 'OFFLINE_SYNC', detail: `Simulated ${simVideos} videos created while offline.`, status: 'warning' }
              ]);
          }
      }
      
      if (savedAP.active) setAutoPilotActive(true);
      if (savedAP.stats) setAutoPilotStats(savedAP.stats);

  }, []);

  // --- ACTIONS ---
  const handleAddToQueue = (job: PostingJob) => {
      if (!job.pipelineStage) {
          job.pipelineStage = 'SIGNAL_ANALYSIS';
          job.status = 'processing';
      }
      setJobs(prev => [job, ...prev]);
  };

  const handleVideoGenerated = (video: CompletedVideo) => {
      setCompletedVideos(prev => [video, ...prev]);
  };

  const handleApiKeyIssue = (keyId: string, status: 'quota_exceeded' | 'error') => {
      setApiKeys(prev => prev.map(k => k.id === keyId ? { ...k, status } : k));
  };

  // --- ENGINE 1: AUTOPILOT HUNTER LOOP ---
  // Runs independently of UI
  useEffect(() => {
      if (!autoPilotActive) return;

      const runHunterCycle = async () => {
          const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
          const affiliateKeys = apiKeys.filter(k => k.category === 'affiliate' && k.status === 'active');
          
          if (!googleKey) {
              setAutoPilotLogs(p => [...p, { timestamp: new Date().toLocaleTimeString(), action: 'ERROR', detail: 'Missing Google Key', status: 'error'}]);
              setAutoPilotActive(false);
              return;
          }

          try {
              setAutoPilotAction('HUNTING');
              // Simulate Hunting Delay
              await new Promise(r => setTimeout(r, 2000));
              
              // Mock Hunt Logic
              const networks = affiliateKeys.length > 0 ? affiliateKeys.map(k => k.provider.toUpperCase()) : ['AMAZON', 'CLICKBANK'];
              const niche = autoPilotNiche === 'AUTO' ? 'Trending Tech' : autoPilotNiche;
              
              setAutoPilotLogs(p => [...p, { timestamp: new Date().toLocaleTimeString(), action: 'SCANNING', detail: `Scanning ${networks.length} networks for ${niche}...`, status: 'info'}]);
              
              const result = await huntAffiliateProducts(googleKey.key, niche, networks);
              
              // CRITICAL FIX: Ensure products exist before accessing
              if (!result || !result.products || result.products.length === 0) {
                  throw new Error("No products found in scan.");
              }

              const product = result.products[0];

              if (product) {
                  setAutoPilotAction('PLANNING');
                  setAutoPilotLogs(p => [...p, { timestamp: new Date().toLocaleTimeString(), action: 'FOUND', detail: `Winner: ${product.product_name} ($${product.commission_est})`, status: 'success'}]);
                  
                  // Generate Plan
                  const metadata: SourceMetadata = {
                      url: product.affiliate_link,
                      type: 'product',
                      detected_strategy: 'REVIEW_TUTORIAL',
                      notes: `AutoPilot: ${product.reason_to_promote}`,
                      video_config: { resolution, aspectRatio, scriptModel, visualModel, voiceModel, outputLanguage: 'vi' }
                  };
                  
                  const plan = await generateVideoPlan(googleKey.key, metadata);
                  
                  setAutoPilotAction('QUEUEING');
                  if (plan && plan.generated_content) {
                       const newJob: PostingJob = {
                          id: crypto.randomUUID(),
                          content_title: plan.generated_content.title,
                          caption: plan.generated_content.description,
                          hashtags: plan.generated_content.hashtags,
                          platforms: ['tiktok', 'youtube'],
                          scheduled_time: Date.now() + 3600000,
                          status: 'scheduled',
                          scriptData: plan
                      };
                      handleAddToQueue(newJob);
                      setAutoPilotStats(s => ({ ...s, cyclesRun: s.cyclesRun + 1, videosCreated: s.videosCreated + 1 }));
                      setAutoPilotLogs(p => [...p, { timestamp: new Date().toLocaleTimeString(), action: 'DISPATCH', detail: 'Job sent to Production Brain.', status: 'success'}]);
                  }
              }

          } catch (e: any) {
              setAutoPilotLogs(p => [...p, { timestamp: new Date().toLocaleTimeString(), action: 'FAIL', detail: e.message, status: 'error'}]);
          } finally {
              setAutoPilotAction('COOLDOWN');
          }
      };

      const interval = setInterval(runHunterCycle, 15000); // Run every 15s (simulated)
      
      // Uptime ticker
      const uptimeInt = setInterval(() => setAutoPilotStats(s => ({...s, uptime: s.uptime + 1})), 1000);

      return () => {
          clearInterval(interval);
          clearInterval(uptimeInt);
      };
  }, [autoPilotActive, autoPilotNiche, apiKeys, scriptModel, visualModel, resolution]);

  // --- ENGINE 2: BATCH PROCESSOR LOOP ---
  // Runs independently
  useEffect(() => {
      if (!batchProcessing) return;

      const processBatchQueue = async () => {
          const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active');
          if (!googleKey) { setBatchProcessing(false); return; }

          const pendingJob = batchJobs.find(j => j.status === 'queued');
          if (!pendingJob) {
              setBatchProcessing(false);
              return;
          }

          // Update Status
          const updateBatchJob = (id: string, updates: Partial<BatchJobItem>) => {
              setBatchJobs(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j));
          };

          try {
              updateBatchJob(pendingJob.id, { status: 'analyzing', progress: 10, log: 'Analyzing...' });
              await new Promise(r => setTimeout(r, 1000));
              
              const analysis = await classifyInput(googleKey.key, pendingJob.input);
              updateBatchJob(pendingJob.id, { status: 'scripting', progress: 40, log: `Strategy: ${analysis?.strategy || 'AUTO'}` });

              const metadata: SourceMetadata = {
                  url: pendingJob.input, 
                  type: analysis?.type || 'auto_detect', 
                  detected_strategy: (analysis?.strategy || 'AUTO') as any,
                  video_config: { resolution, aspectRatio, scriptModel, visualModel, voiceModel, outputLanguage: 'vi' }
              };
              
              const plan = await generateVideoPlan(googleKey.key, metadata);
              updateBatchJob(pendingJob.id, { status: 'rendering', progress: 80, log: 'Simulating Render...', result: plan });
              
              await new Promise(r => setTimeout(r, 1000));
              
              if (plan && plan.generated_content) {
                   const postingJob: PostingJob = {
                      id: crypto.randomUUID(),
                      content_title: plan.generated_content.title,
                      caption: plan.generated_content.description,
                      hashtags: plan.generated_content.hashtags,
                      platforms: ['youtube'],
                      scheduled_time: Date.now() + 3600000,
                      status: 'scheduled'
                  };
                  handleAddToQueue(postingJob);
              }
              
              updateBatchJob(pendingJob.id, { status: 'completed', progress: 100, log: 'Done.' });

          } catch (e: any) {
              updateBatchJob(pendingJob.id, { status: 'failed', log: e.message, error: e.message });
          }
      };

      const interval = setInterval(processBatchQueue, 2000);
      return () => clearInterval(interval);
  }, [batchProcessing, batchJobs, apiKeys]);

  // --- ENGINE 3: THE BRAIN (PRODUCTION PIPELINE) ---
  // Processes individual 'processing' jobs from queue
  useEffect(() => {
      const runPipeline = async () => {
          const activeJob = jobs.find(j => j.status === 'processing' && !processingQueueRef.current.has(j.id));
          const googleKey = apiKeys.find(k => k.provider === 'google' && k.status === 'active')?.key;

          if (!activeJob) { setSystemStatus('IDLE'); return; }
          if (!googleKey) return;

          setSystemStatus('PROCESSING');
          processingQueueRef.current.add(activeJob.id);

          const updateJob = (updates: Partial<PostingJob>) => {
              setJobs(prev => prev.map(j => j.id === activeJob.id ? { ...j, ...updates } : j));
          };

          const addPipelineLog = (msg: string) => {
              const newLog = { 
                  stage: activeJob.pipelineStage || 'IDLE', 
                  message: msg, 
                  timestamp: Date.now(),
                  agentName: 'System Brain'
              };
              setJobs(prev => prev.map(j => j.id === activeJob.id ? { ...j, pipelineLogs: [...(j.pipelineLogs || []), newLog] } : j));
          };

          try {
              // Simulate complex pipeline steps
              switch (activeJob.pipelineStage) {
                  case 'SIGNAL_ANALYSIS':
                      addPipelineLog(`Deciphering signal...`);
                      await new Promise(r => setTimeout(r, 1000)); 
                      if (activeJob.caption.startsWith('http')) {
                          const metadata = await agentProcessSignal(googleKey, activeJob.caption);
                          updateJob({ sourceMetadata: metadata, pipelineStage: 'SCRIPTING' });
                      } else {
                          updateJob({ pipelineStage: 'SCRIPTING' });
                      }
                      break;
                  case 'SCRIPTING':
                      addPipelineLog(`Writing script with ${scriptModel}...`);
                      const dummyMeta: any = activeJob.sourceMetadata || { url: activeJob.caption, type: 'topic' };
                      const scriptData = await agentGenerateScript(googleKey, dummyMeta);
                      updateJob({ scriptData, pipelineStage: 'VISUAL_PROMPTING', content_title: scriptData.generated_content?.title });
                      break;
                  case 'VISUAL_PROMPTING':
                      addPipelineLog(`Prompting ${visualModel}...`);
                      if (!activeJob.scriptData) throw new Error("No script");
                      const prompts = await agentDirectVisuals(googleKey, activeJob.scriptData);
                      updateJob({ visualAssets: prompts, pipelineStage: 'VOICE_SYNTHESIS' });
                      break;
                  case 'VOICE_SYNTHESIS':
                      addPipelineLog(`Synthesizing ${voiceModel}...`);
                      await new Promise(r => setTimeout(r, 1000));
                      updateJob({ audioUrl: 'simulated_audio.mp3', pipelineStage: 'RENDERING' });
                      break;
                  case 'RENDERING':
                      addPipelineLog(`Final Rendering ${resolution}...`);
                      await new Promise(r => setTimeout(r, 2000));
                      updateJob({ pipelineStage: 'COMPLETED', status: 'scheduled' });
                      handleVideoGenerated({
                          id: activeJob.id,
                          title: activeJob.content_title,
                          description: activeJob.caption,
                          thumbnailUrl: "https://via.placeholder.com/1080x1920",
                          platform: "Auto-Gen",
                          niche: "Auto",
                          createdAt: Date.now()
                      });
                      break;
              }
          } catch (e: any) {
              updateJob({ status: 'failed', pipelineStage: 'FAILED' });
          } finally {
              processingQueueRef.current.delete(activeJob.id);
          }
      };

      const interval = setInterval(runPipeline, 1500);
      return () => clearInterval(interval);
  }, [jobs, apiKeys, scriptModel, visualModel, voiceModel]);

  // ... (Clock Effect, Scroll Effect, Chat Handlers - Unchanged) ...
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAgentCommand = (cmd: AgentCommand) => {
      if (cmd.action === 'NAVIGATE') setActiveTab(cmd.payload as TabView);
      // ... other commands
  };

  const appContext: AppContext = {
      activeTab,
      status: systemStatus === 'PROCESSING' ? AppStatus.PLANNING : AppStatus.IDLE,
      urlInput: '',
      activeKeys: apiKeys.filter(k => k.status === 'active').length,
      lastError: null,
      detectedStrategy: null,
      knowledgeBase,
      autoPilotContext: `Active: ${autoPilotActive}`
  };

  const commonModelProps = {
      scriptModel, setScriptModel,
      visualModel, setVisualModel,
      voiceModel, setVoiceModel,
      resolution, setResolution,
      aspectRatio, setAspectRatio
  };

  const t = TRANSLATIONS[appLanguage] || TRANSLATIONS['en'];

  const renderContent = () => {
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
        // Pass global state down
        return <AutoPilotDashboard 
            apiKeys={apiKeys} 
            onAddToQueue={handleAddToQueue} 
            onVideoGenerated={handleVideoGenerated}
            completedVideos={completedVideos}
            t={t}
            {...commonModelProps}
            // Injected State
            isRunning={autoPilotActive}
            setIsRunning={setAutoPilotActive}
            stats={autoPilotStats}
            logs={autoPilotLogs}
            currentAction={autoPilotAction}
            selectedNiche={autoPilotNiche}
            setSelectedNiche={setAutoPilotNiche}
        />;
      case 'queue':
        return <QueueDashboard 
            apiKeys={apiKeys} 
            currentPlan={null} 
            jobs={jobs} 
            setJobs={setJobs} 
            t={t}
        />;
      case 'analytics':
        return <AnalyticsDashboard 
            apiKeys={apiKeys} 
            onDeployStrategy={(url) => console.log(url)}
            t={t}
        />;
      case 'marketplace':
        return <AIMarketplace 
            apiKeys={apiKeys} 
            onSelectProduct={(url) => console.log(url)}
            t={t}
        />;
      case 'risk_center':
        return <ChannelHealthDashboard 
            apiKeys={apiKeys} 
            onSendReportToChat={(msg) => console.log(msg)}
            t={t}
        />;
      case 'campaign': 
        // Pass global batch state down
        return <BatchProcessor 
            apiKeys={apiKeys} 
            onAddToQueue={handleAddToQueue}
            t={t}
            {...commonModelProps}
            // Injected State
            jobs={batchJobs}
            setJobs={setBatchJobs}
            isProcessing={batchProcessing}
            setIsProcessing={setBatchProcessing}
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
    <div className="flex h-[100dvh] bg-[#020617] text-white font-sans overflow-hidden">
        <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            t={t}
        />

        <div className="flex-1 flex flex-col min-w-0 h-full relative">
            {/* Header */}
            <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-30 relative">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-slate-400 hover:text-white"><Menu size={24} /></button>
                    <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs">v2.5.0-beta</span>
                        <span>Enterprise</span>
                        {/* Server Status Indicator */}
                        <div className="flex items-center gap-1.5 ml-4 px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-[10px] text-green-400">
                            <Server size={10} />
                            <span className="uppercase font-bold tracking-wider">Background Engine: Active</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                     {/* System Status */}
                    <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full border ${
                        systemStatus === 'PROCESSING' || autoPilotActive || batchProcessing
                        ? 'bg-purple-900/20 border-purple-500/50 text-purple-400' 
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                    }`}>
                        <Activity size={14} />
                        <span className="text-[10px] font-bold tracking-wider">
                            {(systemStatus === 'PROCESSING' || batchProcessing) ? 'PROCESSING' : autoPilotActive ? 'AUTOPILOT ON' : 'IDLE'}
                        </span>
                    </div>

                    <div className="group relative flex items-center gap-3 px-4 py-2 bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-white/10 rounded-full backdrop-blur-md transition-all duration-500 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                        <div className="relative z-10 font-mono text-base md:text-lg font-medium tracking-widest text-slate-200 group-hover:text-white transition-colors">
                            {currentTime.toLocaleTimeString('en-US', { timeZone: timeZone, hour12: false })}
                        </div>
                    </div>

                    <div className="flex items-center bg-emerald-600 border border-emerald-500 rounded-lg p-1 gap-1 relative hover:bg-emerald-500 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        <span className="text-white px-2 flex items-center justify-center"><Globe size={16} /></span>
                        <select 
                            value={appLanguage}
                            onChange={(e) => setAppLanguage(e.target.value as AppLanguage)}
                            className="bg-transparent text-xs font-bold text-white focus:outline-none py-1 pr-2 cursor-pointer w-full h-full opacity-0 absolute inset-0 z-10"
                        >
                            <option value="en">English (US)</option>
                            <option value="vi">Tiếng Việt</option>
                        </select>
                         <span className="text-xs font-bold text-white pr-2 pointer-events-none uppercase hidden md:block">{appLanguage}</span>
                    </div>
                </div>
            </header>

            <main ref={mainContentRef} className="flex-1 overflow-y-auto p-4 md:p-6 relative scroll-smooth bg-[#020617]">
                {renderContent()}
            </main>

            <AIChatAssistant 
                apiKey={apiKeys.find(k => k.provider === 'google' && k.status === 'active')?.key} 
                appContext={appContext} 
                onCommand={handleAgentCommand} 
            />
        </div>
    </div>
  );
};

export default App;
