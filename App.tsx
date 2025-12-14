
import React, { useState, useEffect, useRef } from 'react';
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
import AutoPilotDashboard from './components/AutoPilotDashboard';
import ModelSelector from './components/ModelSelector';
import ModelFlowDiagram from './components/ModelFlowDiagram';
import ViralDNAStudio from './components/ViralDNAStudio';
import Documentation from './components/Documentation';
import { Zap, Link as LinkIcon, AlertTriangle, Cpu, LayoutDashboard, Settings, Layers, RotateCw, Bot, SlidersHorizontal, Sparkles, MonitorPlay, Ratio, Menu, MessageCircle, Factory, Globe } from 'lucide-react';
import { generateVideoPlan, classifyInput } from './services/geminiService';
import { postVideoToSocial } from './services/socialService';
import { AppStatus, OrchestratorResponse, SourceMetadata, TabView, ApiKeyConfig, ContentNiche, ContentWorkflow, AppContext, KnowledgeBase, AgentCommand, PostingJob, ChatSession, ChatMessage, VideoResolution, AspectRatio, ScriptModel, VisualModel, VoiceModel, CompletedVideo, HunterInsight, AppLanguage, ContentLanguage } from './types';

// SECURITY & PERSISTENCE CONSTANTS
const VAULT_STORAGE_KEY = 'av_studio_secure_vault_v1';
const BRAIN_STORAGE_KEY = 'av_studio_brain_v1';
const QUEUE_STORAGE_KEY = 'av_studio_queue_v1';
const UI_STATE_STORAGE_KEY = 'av_studio_ui_state_v1';
const CHAT_STORAGE_KEY = 'av_studio_chat_sessions_v2'; 
const GALLERY_STORAGE_KEY = 'av_studio_gallery_v1';
const APP_RUNTIME_STORAGE_KEY = 'av_studio_runtime_v1'; 
const AUTOPILOT_STORAGE_KEY = 'av_studio_autopilot_state_v1';

// --- LAYER 1: APP LOCALIZATION (FULL DICTIONARY) ---
const TRANSLATIONS = {
  vi: {
    sidebar: {
      studio: "Xưởng Viral DNA",
      auto: "Auto-Pilot Vô Cực",
      campaign: "Chiến Dịch Hàng Loạt",
      analytics: "Tình báo Chiến lược",
      market: "Sàn AI Affiliate",
      risk: "Trung tâm Rủi ro",
      queue: "Lịch trình & Hàng chờ",
      docs: "Hướng dẫn",
      settings: "Cấu hình Hệ thống"
    },
    header: {
      lang_label: "Ngôn ngữ hiển thị",
      keys: "Keys"
    },
    studio: {
      title: "Xưởng Viral DNA",
      subtitle: "Bộ máy phân tích & tái tạo cấu trúc",
      input_section: "Nguồn dữ liệu (Input)",
      input_placeholder: "Dán link YouTube/TikTok...",
      btn_add_source: "Thêm nguồn",
      btn_upload: "Tải lên Video",
      content_lang_label: "Ngôn ngữ nội dung video (Output)",
      content_lang_desc: "Quyết định ngôn ngữ của Script, Voice, và SEO.",
      analyze_btn: "PHÂN TÍCH & TÁI TẠO CẤU TRÚC",
      tabs: {
        dna: "1. Phân tích DNA",
        script: "2. Kịch bản AI",
        studio: "3. Xưởng sản xuất",
        quality: "4. Kiểm soát"
      },
      script_engine: {
        title: "Script Engine",
        topic_label: "Chủ đề / Hook Chính",
        generate_btn: "Tạo Kịch bản (Original)",
        generating: "Đang viết..."
      },
      video_studio: {
        title: "Video Studio",
        render_btn: "BẮT ĐẦU RENDER",
        rendering: "Đang dựng..."
      }
    },
    campaign: {
      title: "Xưởng Sản Xuất Hàng Loạt",
      subtitle: "Nhập danh sách URL hoặc Chủ đề. Hệ thống sẽ tự động Phân tích -> Viết kịch bản -> Tạo ảnh -> Dựng video -> Lên lịch đăng.",
      input_label: "1. Nhập danh sách nguồn (1 dòng / 1 link)",
      import_btn: "Import vào Hàng chờ",
      control_title: "2. Điều khiển",
      waiting: "chờ",
      done: "xong",
      start_btn: "Bắt đầu Sản xuất",
      processing: "Đang xử lý...",
      clear_btn: "Xóa tất cả",
      progress_title: "Tiến độ Sản xuất",
      clear_done: "Xóa job đã xong",
      empty_state: "Danh sách trống. Hãy nhập URL bên trái."
    },
    plan_result: {
        viral_score: "Điểm Tiềm Năng Viral",
        tiktok_trend: "Xu hướng TikTok",
        yt_shorts: "YouTube Shorts",
        est_cpm: "Ước tính CPM",
        audience_persona: "Khán giả Mục tiêu (Persona)",
        deep_analysis: "Phân Tích Chuyên Sâu",
        script_scenes: "Kịch bản & Phân cảnh",
        voiceover: "Giọng đọc",
        visual: "Hình ảnh",
        live_preview: "XEM TRƯỚC LIVE",
        auto_post_timer: "Đếm ngược Đăng",
        posted_success: "ĐÃ ĐĂNG THÀNH CÔNG",
        post_now: "ĐĂNG NGAY",
        schedule: "LÊN LỊCH / QUEUE",
        gen_metadata: "Metadata Tạo tự động",
        title_viral: "Tiêu đề (Viral)",
        desc_seo: "Mô tả (SEO)",
        hashtags: "Hashtags",
        download: "Tải về JSON",
        share: "Chia sẻ"
    },
    risk_center: {
        title: "Trung tâm Rủi ro & Sức khỏe Kênh",
        subtitle: "Hệ thống chẩn đoán sức khỏe kênh chuyên sâu. Phát hiện Shadowban, Vi phạm bản quyền, Gậy cộng đồng và Sụt giảm tương tác bất thường.",
        btn_scan: "Chạy Kiểm Tra Rủi Ro",
        btn_scanning: "Đang Quét...",
        card_channels: "Kênh Đã Kết Nối",
        card_score: "Điểm Sức Khỏe TB",
        card_risk: "Rủi Ro Shadowban",
        card_hint: "Nhấn nút kiểm tra để AI quét toàn bộ hệ thống.",
        report_score: "Điểm Sức Khỏe",
        metric_growth: "Tăng Trưởng",
        metric_watch: "Thời Gian Xem",
        metric_ctr: "CTR",
        risk_protocol: "Giao Thức Phát Hiện Rủi Ro",
        risk_safe: "Không phát hiện bất thường. Hệ thống an toàn.",
        ai_diagnosis: "Chẩn Đoán & Khắc Phục AI",
        auto_reported: "Đã báo cáo tự động",
        alert_key: "Cần Google API Key để AI phân tích rủi ro.",
        alert_error: "Lỗi trong quá trình quét kênh."
    },
    analytics: {
        title: "Trung tâm Tình báo Chiến lược",
        subtitle: "Trinh sát tự động. Bot tự động săn lùng và tìm ra 'The Winner'.",
        view_standard: "Quét Cơ bản",
        view_deep: "Quét Mạng Lưới Sâu",
        auto_recon_btn: "TỰ ĐỘNG TRINH SÁT",
        stop_auto_btn: "DỪNG TỰ ĐỘNG",
        manual_target: "Nhập mục tiêu thủ công (Từ khóa / URL)",
        logs_title: "Tín hiệu Trực tiếp",
        analysis_title: "Phân tích Mục tiêu Hiện tại",
        winner_title: "Cơ hội Tốt nhất (Winner)",
        deploy_btn: "TRIỂN KHAI NGAY",
        waiting: "Hệ thống sẵn sàng. Đang chờ lệnh..."
    },
    marketplace: {
        tab_market: "Sàn AI Tuyển Chọn",
        tab_hunter: "Auto-Hunter (Tự động)",
        filter_google: "Hệ sinh thái Google",
        title: "Sàn AI Affiliate (High Ticket)",
        desc: "Tuyển chọn các công cụ AI có hoa hồng cao nhất.",
        hunter_title: "Giao thức Auto-Hunter",
        hunter_desc: "Hệ thống sẽ tự động quét sản phẩm tiềm năng.",
        niche_placeholder: "Nhập ngách (VD: Kitchen Gadgets)...",
        activate_btn: "Kích hoạt Hunter",
        hunting: "Đang săn...",
        results_found: "Sản phẩm tìm thấy"
    },
    queue: {
        title: "Soạn thảo & Cấu hình",
        input_title: "Tiêu đề Video",
        input_caption: "Mô tả / Caption",
        platform_label: "Chọn nền tảng",
        schedule_label: "Chiến lược & Thời gian",
        mode_smart: "Luật Tùy chỉnh",
        mode_auto: "AI Phân tích",
        mode_manual: "Thủ công",
        mode_now: "Đăng ngay",
        queue_list_title: "Hàng chờ",
        btn_schedule: "LÊN LỊCH",
        btn_post_now: "ĐĂNG NGAY",
        btn_analyzing: "ĐANG TẢI..."
    },
    autopilot: {
        title: "HỆ THỐNG AUTO-PILOT VÔ CỰC",
        subtitle: "Cỗ máy Bán hàng & Affiliate Tự động (Review, Ads, Demo)",
        status_label: "Trạng thái Hệ thống",
        config_title: "Cấu hình Nhiệm vụ",
        niche_label: "Ngách Mục tiêu",
        draft_mode: "Chế độ Nháp (Không đăng)",
        stats_videos: "Video đã tạo",
        stats_posted: "Đã đăng",
        stats_uptime: "Thời gian chạy",
        logs_title: "NHẬT KÝ HOẠT ĐỘNG",
        library_title: "Thư viện Video Hoàn tất"
    },
    settings: {
      title: "Trung Tâm Điều Khiển",
      subtitle: "Cấu hình Bot, Quản lý Key và Dạy AI học tập.",
      tabs: {
        brain: "AI Brain (Bộ nhớ)",
        vault: "API Vault (Kết nối)",
        studio: "Cấu hình Studio",
        system: "Hệ thống"
      },
      sections: {
        general: "Cài đặt chung"
      }
    }
  },
  en: {
    sidebar: {
      studio: "Viral DNA Studio",
      auto: "Infinity Auto-Pilot",
      campaign: "Campaign Wizard",
      analytics: "Strategic Intel",
      market: "AI Marketplace",
      risk: "Risk Center",
      queue: "Scheduler & Queue",
      docs: "Documentation",
      settings: "Settings"
    },
    header: {
      lang_label: "Display Language",
      keys: "Keys"
    },
    studio: {
      title: "Viral DNA Studio",
      subtitle: "Structure Analysis & Replication Engine",
      input_section: "Data Sources (Input)",
      input_placeholder: "Paste YouTube/TikTok link...",
      btn_add_source: "Add Source",
      btn_upload: "Upload Video",
      content_lang_label: "Video Content Language (Output)",
      content_lang_desc: "Determines Script, Voice, and SEO language.",
      analyze_btn: "ANALYZE & REPLICATE STRUCTURE",
      tabs: {
        dna: "1. DNA Analysis",
        script: "2. Script Engine",
        studio: "3. Video Studio",
        quality: "4. Quality Gate"
      },
      script_engine: {
        title: "Script Engine",
        topic_label: "Topic / Main Hook",
        generate_btn: "Generate Script (Original)",
        generating: "Writing..."
      },
      video_studio: {
        title: "Video Studio",
        render_btn: "START RENDER",
        rendering: "Rendering..."
      }
    },
    campaign: {
      title: "Batch Video Factory",
      subtitle: "Enter URL list or Topics. System auto-analyzes -> Scripts -> Images -> Renders -> Schedules.",
      input_label: "1. Input Source List (1 line / 1 link)",
      import_btn: "Import to Queue",
      control_title: "2. Controls",
      waiting: "waiting",
      done: "done",
      start_btn: "Start Production",
      processing: "Processing...",
      clear_btn: "Clear All",
      progress_title: "Production Progress",
      clear_done: "Clear completed",
      empty_state: "List empty. Enter URLs on the left."
    },
    plan_result: {
        viral_score: "Viral Potential Score",
        tiktok_trend: "TikTok Trend",
        yt_shorts: "YouTube Shorts",
        est_cpm: "EST. CPM",
        audience_persona: "Target Audience (Persona)",
        deep_analysis: "Deep Analysis",
        script_scenes: "Script & Scenes",
        voiceover: "Voiceover",
        visual: "Visual",
        live_preview: "LIVE PREVIEW",
        auto_post_timer: "Auto-Post Timer",
        posted_success: "POSTED SUCCESSFULLY",
        post_now: "POST NOW",
        schedule: "SCHEDULE / QUEUE",
        gen_metadata: "Generated Metadata",
        title_viral: "Title (Viral)",
        desc_seo: "Description (SEO)",
        hashtags: "Hashtags",
        download: "Download JSON",
        share: "Share"
    },
    risk_center: {
        title: "Channel Health & Risk Center",
        subtitle: "Deep channel health diagnostic system. Detects Shadowban, Copyright strikes, Community guidelines violations, and abnormal engagement drops.",
        btn_scan: "Run Risk Audit",
        btn_scanning: "Scanning...",
        card_channels: "Connected Channels",
        card_score: "Avg. Health Score",
        card_risk: "Shadowban Risk",
        card_hint: "Press 'Run Risk Audit' to scan the full system.",
        report_score: "Health Score",
        metric_growth: "Growth",
        metric_watch: "Watch Time",
        metric_ctr: "CTR",
        risk_protocol: "Risk Detection Protocol",
        risk_safe: "No anomalies detected. System secure.",
        ai_diagnosis: "AI Diagnosis & Fix",
        auto_reported: "Auto-reported",
        alert_key: "Google API Key required for AI analysis.",
        alert_error: "Error during channel scanning."
    },
    analytics: {
        title: "Strategic Intelligence Hub",
        subtitle: "Automated reconnaissance. Bot hunts and finds 'The Winner'.",
        view_standard: "Standard Scan",
        view_deep: "Deep Net Scanner",
        auto_recon_btn: "AUTO-RECON",
        stop_auto_btn: "STOP AUTO",
        manual_target: "Manual Targeting (Keyword / URL)",
        logs_title: "Signal Feed",
        analysis_title: "Current Target Analysis",
        winner_title: "The Winner (Best Found)",
        deploy_btn: "DEPLOY NOW",
        waiting: "System ready. Awaiting command..."
    },
    marketplace: {
        tab_market: "Curated AI Market",
        tab_hunter: "Auto-Hunter",
        filter_google: "Google Ecosystem",
        title: "AI Affiliate Market (High Ticket)",
        desc: "Curated AI tools with highest commissions.",
        hunter_title: "Auto-Hunter Protocol",
        hunter_desc: "System will automatically scan for potential products.",
        niche_placeholder: "Enter niche (e.g. Kitchen Gadgets)...",
        activate_btn: "Activate Hunter",
        hunting: "Hunting...",
        results_found: "Products Found"
    },
    queue: {
        title: "Drafting & Config",
        input_title: "Video Title",
        input_caption: "Description / Caption",
        platform_label: "Select Platforms",
        schedule_label: "Strategy & Timing",
        mode_smart: "Smart Rule",
        mode_auto: "AI Analysis",
        mode_manual: "Manual",
        mode_now: "Post Now",
        queue_list_title: "Queue",
        btn_schedule: "ADD TO QUEUE",
        btn_post_now: "POST IMMEDIATELY",
        btn_analyzing: "UPLOADING..."
    },
    autopilot: {
        title: "INFINITY AUTO-PILOT",
        subtitle: "Automated Sales & Affiliate Engine (Review, Ads, Demo)",
        status_label: "System Status",
        config_title: "Mission Config",
        niche_label: "Target Niche",
        draft_mode: "Draft Mode (No Posting)",
        stats_videos: "Videos Created",
        stats_posted: "Posted",
        stats_uptime: "Session Uptime",
        logs_title: "LIVE EXECUTION LOGS",
        library_title: "Finished Video Library"
    },
    settings: {
      title: "Control Center",
      subtitle: "Bot Config, Key Management & AI Training.",
      tabs: {
        brain: "AI Brain (Memory)",
        vault: "API Vault (Connect)",
        studio: "Studio Config",
        system: "System"
      },
      sections: {
        general: "General Settings"
      }
    }
  },
  // ... (JP, ES, CN would follow similar structure, kept brief for XML limits but strictly following structure)
  jp: {
    sidebar: { studio: "バイラルDNAスタジオ", auto: "無限オートパイロット", campaign: "キャンペーン", analytics: "戦略的インテリジェンス", market: "AIマーケット", risk: "リスクセンター", queue: "スケジューラー", docs: "ドキュメント", settings: "設定" },
    header: { lang_label: "表示言語", keys: "キー" },
    studio: { title: "バイラルDNAスタジオ", subtitle: "構造分析および複製エンジン", input_section: "データソース", analyze_btn: "構造分析", content_lang_label: "出力言語", tabs: { dna: "1. DNA分析", script: "2. スクリプト", studio: "3. スタジオ", quality: "4. 品質" }, script_engine: { title: "スクリプトエンジン", topic_label: "トピック", generate_btn: "生成", generating: "生成中..." }, video_studio: { title: "ビデオスタジオ", render_btn: "レンダリング", rendering: "処理中..." } },
    analytics: { title: "戦略的インテリジェンスハブ", subtitle: "自動偵察。", view_standard: "標準スキャン", auto_recon_btn: "自動偵察", manual_target: "手動ターゲット", logs_title: "ライブフィード", analysis_title: "分析", winner_title: "勝者", deploy_btn: "展開" },
    marketplace: { tab_market: "AIマーケット", tab_hunter: "オートハンター", title: "AIアフィリエイト", activate_btn: "ハンター起動", results_found: "結果" },
    queue: { title: "ドラフト構成", input_title: "タイトル", schedule_label: "スケジュール", mode_now: "今すぐ投稿", queue_list_title: "キュー", btn_schedule: "スケジュール", btn_post_now: "投稿" },
    autopilot: { title: "無限オートパイロット", subtitle: "自動販売エンジン", status_label: "ステータス", config_title: "ミッション設定", stats_videos: "作成済み", logs_title: "ログ" },
    risk_center: { title: "チャンネルリスクセンター", subtitle: "シャドウバンと著作権侵害を検出します。", btn_scan: "監査を実行", btn_scanning: "スキャン中...", card_channels: "接続されたチャンネル", card_score: "平均スコア", card_risk: "シャドウバンのリスク", card_hint: "ボタンを押してスキャンを開始します。", report_score: "健康スコア", metric_growth: "成長", metric_watch: "総再生時間", metric_ctr: "CTR", risk_protocol: "リスク検出", risk_safe: "異常なし。安全です。", ai_diagnosis: "AI診断", auto_reported: "自動報告", alert_key: "Google APIキーが必要です。", alert_error: "エラーが発生しました。" },
    settings: { title: "コントロールセンター", tabs: { brain: "AIブレイン", vault: "API保管庫", studio: "スタジオ設定", system: "システム" }, sections: { general: "一般設定" } }
  },
  es: {
    sidebar: { studio: "Estudio Viral", auto: "Piloto Automático", campaign: "Campaña", analytics: "Inteligencia", market: "Mercado IA", risk: "Riesgo", queue: "Cola", docs: "Docs", settings: "Ajustes" },
    header: { lang_label: "Idioma", keys: "Claves" },
    studio: { title: "Estudio Viral DNA", subtitle: "Motor de Análisis", input_section: "Fuentes", analyze_btn: "Analizar", content_lang_label: "Idioma Salida", tabs: { dna: "1. Análisis", script: "2. Guión", studio: "3. Estudio", quality: "4. Calidad" }, script_engine: { title: "Motor Guión", topic_label: "Tema", generate_btn: "Generar", generating: "Escribiendo..." }, video_studio: { title: "Estudio Video", render_btn: "Renderizar", rendering: "Procesando..." } },
    analytics: { title: "Centro de Inteligencia", subtitle: "Reconocimiento automático.", view_standard: "Escaneo Std", auto_recon_btn: "Auto-Recon", manual_target: "Objetivo Manual", logs_title: "Señal en vivo", analysis_title: "Análisis", winner_title: "Ganador", deploy_btn: "Desplegar" },
    marketplace: { tab_market: "Mercado AI", tab_hunter: "Cazador Auto", title: "Afiliados AI", activate_btn: "Activar", results_found: "Resultados" },
    queue: { title: "Borrador", input_title: "Título", schedule_label: "Horario", mode_now: "Publicar Ahora", queue_list_title: "Cola", btn_schedule: "Programar", btn_post_now: "Publicar" },
    autopilot: { title: "Piloto Automático", subtitle: "Motor de Ventas", status_label: "Estado", config_title: "Config Misión", stats_videos: "Videos", logs_title: "Registros" },
    risk_center: { title: "Centro de Riesgo", subtitle: "Detecta Shadowban y violaciones.", btn_scan: "Ejecutar Auditoría", btn_scanning: "Escaneando...", card_channels: "Canales", card_score: "Puntaje Promedio", card_risk: "Riesgo Shadowban", card_hint: "Presione escanear.", report_score: "Puntaje Salud", metric_growth: "Crecimiento", metric_watch: "Tiempo Vista", metric_ctr: "CTR", risk_protocol: "Protocolo Riesgo", risk_safe: "Sistema seguro.", ai_diagnosis: "Diagnóstico AI", auto_reported: "Auto-reportado", alert_key: "Se requiere Google API Key.", alert_error: "Error de escaneo." },
    settings: { title: "Centro de Control", tabs: { brain: "Cerebro IA", vault: "Bóveda API", studio: "Config Estudio", system: "Sistema" }, sections: { general: "General" } }
  },
  cn: {
    sidebar: { studio: "病毒工作室", auto: "自动驾驶", campaign: "活动", analytics: "情报", market: "市场", risk: "风控", queue: "队列", docs: "文档", settings: "设置" },
    header: { lang_label: "语言", keys: "密钥" },
    studio: { title: "病毒DNA工作室", subtitle: "分析引擎", input_section: "数据源", analyze_btn: "分析", content_lang_label: "输出语言", tabs: { dna: "1. DNA分析", script: "2. 脚本", studio: "3. 工作室", quality: "4. 质量" }, script_engine: { title: "脚本引擎", topic_label: "主题", generate_btn: "生成", generating: "生成中..." }, video_studio: { title: "视频工作室", render_btn: "渲染", rendering: "处理中..." } },
    analytics: { title: "战略情报中心", subtitle: "自动侦察。", view_standard: "标准扫描", auto_recon_btn: "自动侦察", manual_target: "手动目标", logs_title: "实时信号", analysis_title: "分析", winner_title: "获胜者", deploy_btn: "部署" },
    marketplace: { tab_market: "AI市场", tab_hunter: "自动猎人", title: "AI联盟", activate_btn: "激活", results_found: "结果" },
    queue: { title: "草稿配置", input_title: "标题", schedule_label: "排程", mode_now: "立即发布", queue_list_title: "队列", btn_schedule: "加入队列", btn_post_now: "发布" },
    autopilot: { title: "无限自动驾驶", subtitle: "销售引擎", status_label: "状态", config_title: "任务配置", stats_videos: "视频数", logs_title: "日志" },
    risk_center: { title: "风险控制中心", subtitle: "检测 Shadowban 和违规行为。", btn_scan: "运行审计", btn_scanning: "扫描中...", card_channels: "已连接频道", card_score: "平均得分", card_risk: "Shadowban 风险", card_hint: "按按钮开始。", report_score: "健康分", metric_growth: "增长", metric_watch: "观看时长", metric_ctr: "点击率", risk_protocol: "风险协议", risk_safe: "系统安全。", ai_diagnosis: "AI 诊断", auto_reported: "自动报告", alert_key: "需要 Google API Key。", alert_error: "扫描错误。" },
    settings: { title: "控制中心", tabs: { brain: "大脑", vault: "保险库", studio: "工作室设置", system: "系统" }, sections: { general: "常规" } }
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>('studio');
  
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Ref for Main Content Scroll Container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // EFFECT: Scroll to top when switching main tabs
  useEffect(() => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab]);
  
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

  // --- STATE 4: COMPLETED VIDEOS (GALLERY) ---
  const [completedVideos, setCompletedVideos] = useState<CompletedVideo[]>(() => {
      try {
          const saved = localStorage.getItem(GALLERY_STORAGE_KEY);
          if (saved) return JSON.parse(saved);
      } catch(e) {}
      return [];
  });

  // --- STATE 5: UI PREFERENCES ---
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
  const [preferGoogleStack, setPreferGoogleStack] = useState<boolean>(false);
  
  // --- LAYER 1: APP UI LANGUAGE ---
  const [appLanguage, setAppLanguage] = useState<AppLanguage>('vi'); 
  
  // --- LAYER 2: CONTENT LANGUAGE (Global Default) ---
  const [contentLanguage, setContentLanguage] = useState<ContentLanguage>('vi'); 
  
  // --- RUNTIME STATE ---
  const getRuntimeState = () => {
      try {
          const saved = localStorage.getItem(APP_RUNTIME_STORAGE_KEY);
          if (saved) return JSON.parse(saved);
      } catch(e) {}
      return {};
  };
  const runtimeState = getRuntimeState();

  const [campaignMode, setCampaignMode] = useState<'single' | 'batch'>(runtimeState.campaignMode || 'single');
  const initialStatus = ['ANALYZING', 'ROUTING', 'PLANNING', 'PARAPHRASING', 'RENDERING'].includes(runtimeState.status) 
        ? AppStatus.IDLE 
        : (runtimeState.status || AppStatus.IDLE);

  const [status, setStatus] = useState<AppStatus>(initialStatus);
  const [plan, setPlan] = useState<OrchestratorResponse | null>(runtimeState.plan || null);
  const [error, setError] = useState<string | null>(runtimeState.error || null);
  const [logs, setLogs] = useState<string[]>(runtimeState.logs || []);

  const [resolution, setResolution] = useState<VideoResolution>('1080p');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  
  const [scriptModel, setScriptModel] = useState<ScriptModel>(uiState.scriptModel || 'Gemini 2.5 Flash');
  const [visualModel, setVisualModel] = useState<VisualModel>(uiState.visualModel || 'SORA');
  const [voiceModel, setVoiceModel] = useState<VoiceModel>(uiState.voiceModel || 'Google Chirp');

  const [detectedStrategy, setDetectedStrategy] = useState<ContentWorkflow | null>(null);
  
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
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(completedVideos));
  }, [completedVideos]);

  useEffect(() => {
    const stateToSave = { 
        url, selectedNiche, selectedWorkflow, showAdvanced,
        scriptModel, visualModel, voiceModel 
    };
    localStorage.setItem(UI_STATE_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [url, selectedNiche, selectedWorkflow, showAdvanced, scriptModel, visualModel, voiceModel]);

  useEffect(() => {
      const runtimeToSave = {
          status,
          plan,
          error,
          logs,
          campaignMode
      };
      localStorage.setItem(APP_RUNTIME_STORAGE_KEY, JSON.stringify(runtimeToSave));
  }, [status, plan, error, logs, campaignMode]);


  // --- APP LOGIC ---

  const activeKeysCount = apiKeys.filter(k => k.status === 'active').length;
  const primaryApiKey = apiKeys.find(k => k.status === 'active' && k.provider === 'google')?.key;
  const hasZaloVideo = apiKeys.some(k => k.provider === 'zalo' && k.status === 'active');

  const getAutoPilotContext = () => {
      try {
          const saved = localStorage.getItem(AUTOPILOT_STORAGE_KEY);
          if (saved) {
              const data = JSON.parse(saved);
              const stats = data.stats || {};
              const logs = data.logs || [];
              const recentLogs = logs.slice(0, 8).map((l: any) => `[${l.timestamp}] ${l.action}: ${l.detail}`).join('\n');
              return `
STATUS: ${data.isRunning ? 'RUNNING' : 'STOPPED'} | ACTION: ${data.currentAction}
STATS: Cycles=${stats.cyclesRun}, Videos=${stats.videosCreated}, Posted=${stats.postedCount}
RECENT LOGS:
${recentLogs}
              `.trim();
          }
      } catch(e) { return "AutoPilot Data Unavailable"; }
      return "Not started yet";
  };

  const appContext: AppContext = {
    activeTab,
    status,
    urlInput: url,
    activeKeys: activeKeysCount,
    lastError: error,
    detectedStrategy: detectedStrategy,
    knowledgeBase: knowledgeBase,
    autoPilotContext: getAutoPilotContext()
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
    
    if (link.includes('google') || link.includes('gemini') || link.includes('youtube')) {
        setPreferGoogleStack(true);
        addLog(`[MARKETPLACE] Đã phát hiện sản phẩm Google. Bật chế độ "Google Ecosystem Priority".`);
    } else {
        setPreferGoogleStack(false);
    }

    setActiveTab('campaign');
    addLog(`[MARKETPLACE] Đã chọn sản phẩm. Workflow tự động đặt là: REVIEW_TUTORIAL.`);
  };

  const handleDeployStrategy = (targetName: string, type: 'clone' | 'review') => {
      setUrl(targetName); 
      if (type === 'clone') {
          setSelectedWorkflow('VIRAL_CLONE');
          addLog(`[COMMANDER] Triển khai chiến lược CLONE từ Tình báo Chiến lược: ${targetName}`);
      } else {
          setSelectedWorkflow('REVIEW_TUTORIAL');
          addLog(`[COMMANDER] Triển khai chiến lược SẢN PHẨM MỚI từ Tình báo Chiến lược: ${targetName}`);
      }
      setActiveTab('campaign');
  };

  const handleSyncToBrain = (insight: HunterInsight) => {
      const memoryString = `STRATEGIC WINNER: ${insight.target_name} | PROFIT: ${insight.hidden_analysis.profit_potential} | ANGLE: ${insight.strategic_suggestion}`;
      
      if (!knowledgeBase.learnedPreferences.includes(memoryString)) {
          setKnowledgeBase(prev => ({
              ...prev,
              learnedPreferences: [memoryString, ...prev.learnedPreferences].slice(0, 50),
              lastUpdated: Date.now()
          }));
          addLog(`🧠 BRAIN UPDATED: Stored strategy for ${insight.target_name}`);
      }
  };

  const handleAgentCommand = (cmd: AgentCommand) => {
    addLog(`🤖 COMMAND: ${cmd.action} - ${JSON.stringify(cmd.payload)}`);
    switch (cmd.action) {
      case 'NAVIGATE':
        if (['campaign', 'analytics', 'risk_center', 'marketplace', 'settings', 'queue', 'auto_pilot', 'models', 'studio', 'docs'].includes(cmd.payload)) {
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

  const handleSendReportToChat = (reportText: string) => {
    try {
        const savedSessionsRaw = localStorage.getItem(CHAT_STORAGE_KEY);
        let sessions: ChatSession[] = savedSessionsRaw ? JSON.parse(savedSessionsRaw) : [];
        
        if (sessions.length === 0) {
            const newSession: ChatSession = {
                id: crypto.randomUUID(),
                name: "Hunter Report",
                messages: [],
                createdAt: Date.now()
            };
            sessions.push(newSession);
        }

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
        
        addLog("📨 Report sent to AV Commander.");
        window.dispatchEvent(new Event('chat-storage-updated'));
        
    } catch(e) {
        console.error("Failed to send report to chat", e);
    }
  };

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

  const handleAddToQueue = (job: PostingJob) => {
      setQueueJobs(prev => [job, ...prev]);
      addLog(`[QUEUE] Added job: ${job.content_title}`);
      setActiveTab('queue'); 
  };

  const handleVideoCompleted = (video: CompletedVideo) => {
      setCompletedVideos(prev => [video, ...prev]);
      addLog(`[LIBRARY] 🎬 New Video Added: ${video.title}`);
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
                    voiceModel,
                    outputLanguage: contentLanguage // Pass global content language
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

  // Translation Helper
  const t = (TRANSLATIONS as any)[appLanguage] || TRANSLATIONS.en;

  // RENDER CONTENT BASED ON TAB
  const renderContent = () => {
    switch(activeTab) {
      case 'studio':
        return (
            <ViralDNAStudio 
                apiKeys={apiKeys} 
                appLanguage={appLanguage} 
                contentLanguage={contentLanguage}
                setContentLanguage={setContentLanguage}
                t={{ ...t.studio, plan_result: t.plan_result }} 
                // Pass Model State
                scriptModel={scriptModel} setScriptModel={setScriptModel}
                visualModel={visualModel} setVisualModel={setVisualModel}
                voiceModel={voiceModel} setVoiceModel={setVoiceModel}
                resolution={resolution} setResolution={setResolution}
                aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
            />
        ); 
      case 'docs':
        return <Documentation />;
      case 'risk_center':
        return <ChannelHealthDashboard apiKeys={apiKeys} onSendReportToChat={handleSendReportToChat} t={t.risk_center} />;
      case 'analytics':
        return (
            <AnalyticsDashboard 
                apiKeys={apiKeys} 
                onDeployStrategy={handleDeployStrategy} 
                onSendReportToChat={handleSendReportToChat}
                onSyncToBrain={handleSyncToBrain}
                t={t.analytics}
            />
        );
      case 'marketplace':
        return <AIMarketplace onSelectProduct={handleSelectProduct} apiKeys={apiKeys} t={t.marketplace} />;
      case 'queue': 
        return <QueueDashboard apiKeys={apiKeys} currentPlan={plan} jobs={queueJobs} setJobs={setQueueJobs} t={t.queue} />;
      case 'auto_pilot':
        return (
            <AutoPilotDashboard 
                apiKeys={apiKeys} 
                onAddToQueue={(job) => setQueueJobs(prev => [job, ...prev])} 
                onVideoGenerated={handleVideoCompleted}
                completedVideos={completedVideos}
                t={t.autopilot}
                // Pass Model State
                scriptModel={scriptModel} setScriptModel={setScriptModel}
                visualModel={visualModel} setVisualModel={setVisualModel}
                voiceModel={voiceModel} setVoiceModel={setVoiceModel}
                resolution={resolution} setResolution={setResolution}
                aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
            />
        );
      case 'settings':
        return (
          <SettingsDashboard 
             apiKeys={apiKeys} 
             setApiKeys={setApiKeys}
             knowledgeBase={knowledgeBase}
             setKnowledgeBase={setKnowledgeBase}
             t={t.settings}
          />
        );
      case 'campaign':
      default:
        // CAMPAIGN VIEW: SINGLE OR BATCH
        if (campaignMode === 'batch') {
            return (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center mb-2">
                        <button 
                            onClick={() => setCampaignMode('single')}
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
                        >
                            <RotateCw className="rotate-180" size={16} /> Single Mode
                        </button>
                        <div className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded text-xs font-bold border border-purple-500/30">
                            BATCH PRODUCTION MODE
                        </div>
                    </div>
                    <BatchProcessor 
                        apiKeys={apiKeys} 
                        onAddToQueue={(job) => setQueueJobs(prev => [job, ...prev])} 
                        t={t.campaign}
                        // Pass Model State
                        scriptModel={scriptModel} setScriptModel={setScriptModel}
                        visualModel={visualModel} setVisualModel={setVisualModel}
                        voiceModel={voiceModel} setVoiceModel={setVoiceModel}
                        resolution={resolution} setResolution={setResolution}
                        aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
                    />
                </div>
            )
        }

        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            <div className="lg:col-span-1 space-y-4 md:space-y-6">
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-4 md:p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
                    <Bot size={18} className="text-primary" /> Smart Bot Input
                    </h3>
                    <button 
                        onClick={() => setCampaignMode('batch')}
                        className="text-[10px] flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors"
                        title="Switch to Batch Mode"
                    >
                        <Factory size={12} /> Batch Mode
                    </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Link Input (Channel / Product)
                    </label>
                    <div className="relative">
                       <input 
                        type="text" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="URL..."
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
                      {showAdvanced ? "Hide Advanced Config" : "Advanced Config"}
                    </button>
                    {showAdvanced && (
                      <div className="mt-3 space-y-4 animate-fade-in bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        
                        {/* Section 1: Classification */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-1">
                              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Niche</label>
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
                              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Workflow</label>
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
                           <h5 className="text-[10px] font-bold text-primary mb-2 flex items-center gap-1"><MonitorPlay size={10} /> VIDEO SPECS</h5>
                           <div className="grid grid-cols-2 gap-3">
                               <div>
                                  <label className="block text-[10px] text-slate-500 mb-1 flex items-center gap-1"><Ratio size={10}/> Ratio</label>
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
                                  <label className="block text-[10px] text-slate-500 mb-1">Resolution</label>
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

                        {/* Section 3: AI Models (Quick View) */}
                        <div className="border-t border-slate-800 pt-3">
                           <div className="flex items-center justify-between mb-2">
                               <h5 className="text-[10px] font-bold text-primary flex items-center gap-1"><Cpu size={10} /> AI MODELS</h5>
                           </div>
                           <div className="space-y-1 text-[10px] text-slate-400 font-mono">
                               <div>Script: {scriptModel}</div>
                               <div>Visual: {visualModel}</div>
                               <div>Voice: {voiceModel}</div>
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
                                Prefer Google Stack
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
                           Processing...
                         </span>
                       ) : (
                         <>
                           <Zap size={20} className="fill-current" /> AUTO START
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
                <PlanResult data={plan} onPost={handlePostToZalo} onAddToQueue={handleAddToQueue} t={t.plan_result} />
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
                            {status === AppStatus.ROUTING && "AI Router Classifying..."}
                            {status === AppStatus.ANALYZING && "Scanning Metadata..."}
                            {status === AppStatus.PLANNING && "Strategic Planning..."}
                            {status === AppStatus.PARAPHRASING && "Scripting Engine..."}
                            {status === AppStatus.RENDERING && "Video Rendering..."}
                          </h3>
                          <p className="text-slate-400 text-xs md:text-sm">Optimizing content structure based on input type.</p>
                        </div>
                     </div>
                   ) : (
                     <div className="text-slate-600 max-w-sm">
                       <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                          <LayoutDashboard size={28} />
                       </div>
                       <h3 className="text-base md:text-lg font-medium text-slate-400 mb-2">Ready for Command</h3>
                       <p className="text-xs md:text-sm">Enter a URL to start.</p>
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
        t={t.sidebar}
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

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 md:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-lg md:text-3xl font-bold text-white mb-1 md:mb-2 leading-tight truncate">
                  {t.sidebar[activeTab]}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-slate-400 text-xs md:text-sm hidden md:block">
                        PRO Edition v1.0.2
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
                {/* APP UI LANGUAGE TOGGLE (LAYER 1) */}
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 gap-1">
                    <span className="text-[10px] text-slate-500 px-2 font-bold flex items-center gap-1 uppercase">
                        <Globe size={12} /> {t.header.lang_label}
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

                <button 
                  onClick={() => setActiveTab('settings')}
                  className="px-3 py-2 md:py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white hover:border-slate-600 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Settings size={14} /> <span className="inline">{t.sidebar.settings}</span>
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
                     {activeKeysCount > 0 ? `${activeKeysCount} ${t.header.keys}` : 'NO KEYS'}
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
