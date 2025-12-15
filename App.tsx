import React, { useState, useEffect, useRef } from 'react';
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

// Full Translations Dictionary - 100% Coverage for High RPM Markets
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
    studio_tabs: { dna: 'Phân Tích DNA', script: 'Kịch Bản AI', studio: 'Dựng Video', quality: 'Kiểm Duyệt' },
    input_section: 'Nguồn Dữ Liệu Đầu Vào',
    input_placeholder: 'Dán liên kết video (TikTok, Shorts, Reels)...',
    btn_add_source: 'Thêm Nguồn Mới',
    btn_upload: 'Tải Video Mẫu (mp4)',
    analyze_btn: 'Trích Xuất Cấu Trúc Viral DNA',
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
  en: {
    studio: 'Viral DNA Studio',
    auto: 'Infinity Auto-Pilot',
    campaign: 'Batch Campaign',
    analytics: 'Strategic Intel',
    market: 'AI Marketplace',
    risk: 'Risk Center',
    queue: 'Scheduler & Queue',
    docs: 'Documentation',
    settings: 'System Config',
    title: 'Viral DNA Studio',
    subtitle: 'Decode competitor success & Replicate content.',
    studio_tabs: { dna: 'Viral DNA', script: 'AI Script', studio: 'Video Studio', quality: 'Quality Gate' },
    input_section: 'Input Data Source',
    input_placeholder: 'Paste video link (TikTok, Shorts, Reels)...',
    btn_add_source: 'Add Source',
    btn_upload: 'Upload Sample (mp4)',
    analyze_btn: 'Extract Viral DNA',
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
    share: 'Share',
    download: 'Download JSON',
    specs_title: 'Output Specifications',
    script_title: 'Script Intelligence',
    visual_title: 'Visual Engine',
    voice_title: 'Voice Synthesis'
  },
  de: {
    studio: 'Viral DNA Studio',
    auto: 'Unendlich Auto-Pilot',
    campaign: 'Batch-Kampagne',
    analytics: 'Strategische Intel',
    market: 'AI-Marktplatz',
    risk: 'Risikozentrum',
    queue: 'Planer & Warteschlange',
    docs: 'Dokumentation',
    settings: 'Systemkonfiguration',
    title: 'Viral DNA Studio',
    subtitle: 'Erfolg der Konkurrenz entschlüsseln & Inhalte replizieren.',
    studio_tabs: { dna: 'Viral DNA', script: 'KI-Skript', studio: 'Videostudio', quality: 'Qualitätskontrolle' },
    input_section: 'Eingabedatenquelle',
    input_placeholder: 'Videolink einfügen (TikTok, Shorts, Reels)...',
    btn_add_source: 'Quelle hinzufügen',
    btn_upload: 'Beispiel hochladen (mp4)',
    analyze_btn: 'Viral DNA extrahieren',
    script_engine: { title: 'Pro-Skript-Engine', topic_label: 'Kernthema (Erforderlich)', generate_btn: 'Skript generieren', generating: 'Schreiben...' },
    video_studio: { title: 'Automatisiertes Videostudio', render_btn: 'Video rendern (Sim)', rendering: 'Rendern...' },
    status_label: 'Status',
    config_title: 'Missionsparameter',
    niche_label: 'Zielnische',
    stats_videos: 'Videos erstellt',
    stats_posted: 'Gepostet',
    stats_uptime: 'Betriebszeit',
    logs_title: 'Aktivitätsprotokolle',
    library_title: 'Inhaltsbibliothek',
    input_title: 'Inhaltstitel',
    input_caption: 'Unterschrift & Hashtags',
    platform_label: 'Zielplattformen',
    schedule_label: 'Zeitplanmodus',
    mode_smart: 'Smart',
    mode_auto: 'Auto',
    mode_manual: 'Manuell',
    mode_now: 'Jetzt posten',
    btn_analyzing: 'Verarbeitung...',
    btn_post_now: 'Sofort veröffentlichen',
    btn_schedule: 'Zur Warteschlange hinzufügen',
    queue_list_title: 'Warteschlange',
    view_standard: 'Standard',
    view_deep: 'Tiefenscan',
    auto_recon_btn: 'Auto-Recon aktivieren',
    stop_auto_btn: 'Recon stoppen',
    manual_target: 'Manuelles Ziel',
    waiting: 'Warten auf Daten...',
    analysis_title: 'Echtzeitanalyse',
    deploy_btn: 'Strategie anwenden',
    winner_title: 'Beste Gelegenheit',
    tab_market: 'Marktplatz',
    tab_hunter: 'Jäger',
    filter_google: 'Google-Ökosystem',
    hunter_title: 'KI-Produktjäger',
    hunter_desc: 'Scannt Affiliate-Netzwerke automatisch nach Produkten mit hoher Provision.',
    niche_placeholder: 'Nische eingeben (z.B. Smart Home...)',
    activate_btn: 'Jäger aktivieren',
    hunting: 'Jagen...',
    results_found: 'Gefundene Produkte',
    btn_scan: 'SYSTEMAUDIT DURCHFÜHREN',
    btn_scanning: 'Netzwerk wird gescannt...',
    alert_key: 'Google API Key für Risikoanalyse erforderlich.',
    sections: { general: 'Allgemeine Einstellungen' },
    settings_tabs: { brain: 'KI-Gehirn', vault: 'API-Tresor', studio: 'Studio-Konfig', system: 'System' },
    input_label: '1. Quellliste',
    import_btn: 'In Warteschlange importieren',
    control_title: '2. Steuerungen',
    processing: 'Batch-Verarbeitung...',
    start_btn: 'Produktion starten',
    clear_btn: 'Alle löschen',
    progress_title: 'Produktionsfortschritt',
    empty_state: 'Liste leer. Bitte Links oder Themen eingeben.',
    done: 'Fertig',
    viral_score: 'Virales Potenzial',
    tiktok_trend: 'TikTok-Trend',
    yt_shorts: 'YouTube Shorts',
    est_cpm: 'Gesch. CPM',
    audience_persona: 'Zielgruppe',
    deep_analysis: 'Tiefenanalyse',
    script_scenes: 'Skript & Szenen',
    voiceover: 'Sprechertext',
    visual: 'Visuelle Hinweise',
    live_preview: 'LIVE-VORSCHAU',
    auto_post_timer: 'Auto-Post-Timer',
    posted_success: 'ERFOLGREICH GEPOSTET',
    schedule: 'Zeitplan / Warteschlange',
    post_now: 'JETZT POSTEN',
    gen_metadata: 'Generierte Metadaten',
    title_viral: 'Titel (Viral)',
    desc_seo: 'Beschreibung (SEO)',
    hashtags: 'Hashtags',
    share: 'Teilen',
    download: 'JSON herunterladen',
    specs_title: 'Ausgabespezifikationen',
    script_title: 'Skript-Intelligenz',
    visual_title: 'Visuelle Engine',
    voice_title: 'Sprachsynthese'
  },
  fr: {
    studio: 'Studio Viral DNA',
    auto: 'Pilote Auto Infini',
    campaign: 'Campagne par Lots',
    analytics: 'Renseignement Stratégique',
    market: 'Marché IA',
    risk: 'Centre de Risques',
    queue: 'Planificateur & File',
    docs: 'Documentation',
    settings: 'Config Système',
    title: 'Studio Viral DNA',
    subtitle: 'Décryptez le succès des concurrents et répliquez le contenu.',
    studio_tabs: { dna: 'ADN Viral', script: 'Script IA', studio: 'Studio Vidéo', quality: 'Contrôle Qualité' },
    input_section: 'Source de Données',
    input_placeholder: 'Coller le lien vidéo (TikTok, Shorts, Reels)...',
    btn_add_source: 'Ajouter une Source',
    btn_upload: 'Télécharger un exemple (mp4)',
    analyze_btn: 'Extraire l\'ADN Viral',
    script_engine: { title: 'Moteur de Script Pro', topic_label: 'Sujet Principal (Requis)', generate_btn: 'Générer le Script', generating: 'Écriture...' },
    video_studio: { title: 'Studio Vidéo Automatisé', render_btn: 'Rendre la Vidéo (Sim)', rendering: 'Rendu...' },
    status_label: 'Statut',
    config_title: 'Paramètres de Mission',
    niche_label: 'Niche Cible',
    stats_videos: 'Vidéos Créées',
    stats_posted: 'Publié',
    stats_uptime: 'Temps de Fonctionnement',
    logs_title: 'Journaux d\'Activité',
    library_title: 'Bibliothèque de Contenu',
    input_title: 'Titre du Contenu',
    input_caption: 'Légende & Hashtags',
    platform_label: 'Plateformes Cibles',
    schedule_label: 'Mode de Planification',
    mode_smart: 'Intelligent',
    mode_auto: 'Auto',
    mode_manual: 'Manuel',
    mode_now: 'Publier Maintenant',
    btn_analyzing: 'Traitement...',
    btn_post_now: 'Publier Immédiatement',
    btn_schedule: 'Ajouter à la File',
    queue_list_title: 'File d\'Attente',
    view_standard: 'Standard',
    view_deep: 'Scan Profond',
    auto_recon_btn: 'Activer Auto-Recon',
    stop_auto_btn: 'Arrêter Recon',
    manual_target: 'Cible Manuelle',
    waiting: 'En attente de données...',
    analysis_title: 'Analyse en Temps Réel',
    deploy_btn: 'Déployer la Stratégie',
    winner_title: 'Meilleure Opportunité',
    tab_market: 'Marché',
    tab_hunter: 'Chasseur',
    filter_google: 'Écosystème Google',
    hunter_title: 'Chasseur de Produits IA',
    hunter_desc: 'Scanne automatiquement les réseaux d\'affiliation pour des produits à forte commission.',
    niche_placeholder: 'Entrez une niche (ex: Maison Intelligente...)',
    activate_btn: 'Activer le Chasseur',
    hunting: 'Chasse...',
    results_found: 'Produits Trouvés',
    btn_scan: 'LANCER L\'AUDIT SYSTÈME',
    btn_scanning: 'Scan du Réseau...',
    alert_key: 'Clé API Google requise pour l\'analyse des risques.',
    sections: { general: 'Préférences Générales' },
    settings_tabs: { brain: 'Cerveau IA', vault: 'Coffre API', studio: 'Config Studio', system: 'Système' },
    input_label: '1. Liste des Sources',
    import_btn: 'Importer dans la File',
    control_title: '2. Contrôles',
    processing: 'Traitement par Lots...',
    start_btn: 'Démarrer la Production',
    clear_btn: 'Tout Effacer',
    progress_title: 'Progrès de la Production',
    empty_state: 'Liste vide. Veuillez entrer des liens ou des sujets.',
    done: 'Terminé',
    viral_score: 'Score Potentiel Viral',
    tiktok_trend: 'Tendance TikTok',
    yt_shorts: 'YouTube Shorts',
    est_cpm: 'CPM Est.',
    audience_persona: 'Public Cible',
    deep_analysis: 'Analyse Approfondie',
    script_scenes: 'Script & Scènes',
    voiceover: 'Voix Off',
    visual: 'Indices Visuels',
    live_preview: 'APERÇU EN DIRECT',
    auto_post_timer: 'Minuteur Auto-Post',
    posted_success: 'PUBLIÉ AVEC SUCCÈS',
    schedule: 'Planification / File',
    post_now: 'PUBLIER MAINTENANT',
    gen_metadata: 'Métadonnées Générées',
    title_viral: 'Titre (Viral)',
    desc_seo: 'Description (SEO)',
    hashtags: 'Hashtags',
    share: 'Partager',
    download: 'Télécharger JSON',
    specs_title: 'Spécifications de Sortie',
    script_title: 'Intelligence de Script',
    visual_title: 'Moteur Visuel',
    voice_title: 'Synthèse Vocale'
  },
  kr: {
    studio: '바이럴 DNA 스튜디오',
    auto: '무한 오토파일럿',
    campaign: '일괄 캠페인',
    analytics: '전략 정보',
    market: 'AI 마켓플레이스',
    risk: '리스크 센터',
    queue: '스케줄러 & 대기열',
    docs: '문서',
    settings: '시스템 설정',
    title: '바이럴 DNA 스튜디오',
    subtitle: '경쟁사의 성공을 해독하고 콘텐츠를 복제하세요.',
    studio_tabs: { dna: '바이럴 DNA', script: 'AI 스크립트', studio: '비디오 스튜디오', quality: '품질 게이트' },
    input_section: '입력 데이터 소스',
    input_placeholder: '비디오 링크 붙여넣기 (TikTok, Shorts, Reels)...',
    btn_add_source: '소스 추가',
    btn_upload: '샘플 업로드 (mp4)',
    analyze_btn: '바이럴 DNA 추출',
    script_engine: { title: '프로 스크립트 엔진', topic_label: '핵심 주제 (필수)', generate_btn: '스크립트 생성', generating: '작성 중...' },
    video_studio: { title: '자동화된 비디오 스튜디오', render_btn: '비디오 렌더링 (시뮬레이션)', rendering: '렌더링 중...' },
    status_label: '상태',
    config_title: '미션 파라미터',
    niche_label: '타겟 틈새시장',
    stats_videos: '생성된 비디오',
    stats_posted: '게시됨',
    stats_uptime: '가동 시간',
    logs_title: '실시간 활동 로그',
    library_title: '콘텐츠 라이브러리',
    input_title: '콘텐츠 제목',
    input_caption: '캡션 & 해시태그',
    platform_label: '타겟 플랫폼',
    schedule_label: '스케줄 모드',
    mode_smart: '스마트',
    mode_auto: '자동',
    mode_manual: '수동',
    mode_now: '지금 게시',
    btn_analyzing: '처리 중...',
    btn_post_now: '즉시 게시',
    btn_schedule: '대기열에 추가',
    queue_list_title: '대기 중인 대기열',
    view_standard: '표준',
    view_deep: '정밀 스캔',
    auto_recon_btn: '자동 정찰 활성화',
    stop_auto_btn: '정찰 중지',
    manual_target: '수동 타겟',
    waiting: '데이터 대기 중...',
    analysis_title: '실시간 분석',
    deploy_btn: '전략 배포',
    winner_title: '최고의 기회',
    tab_market: '마켓플레이스',
    tab_hunter: '헌터',
    filter_google: 'Google 생태계',
    hunter_title: 'AI 제품 헌터',
    hunter_desc: '높은 수수료 및 낮은 경쟁 제품을 위해 제휴 네트워크를 자동으로 스캔합니다.',
    niche_placeholder: '틈새시장 입력 (예: 스마트 홈...)',
    activate_btn: '헌터 활성화',
    hunting: '헌팅 중...',
    results_found: '발견된 제품',
    btn_scan: '시스템 감사 실행',
    btn_scanning: '네트워크 스캔 중...',
    alert_key: '리스크 분석을 위해 Google API 키가 필요합니다.',
    sections: { general: '일반 환경설정' },
    settings_tabs: { brain: 'AI 두뇌', vault: 'API 금고', studio: '스튜디오 설정', system: '시스템' },
    input_label: '1. 입력 소스 목록',
    import_btn: '대기열로 가져오기',
    control_title: '2. 제어',
    processing: '일괄 처리 중...',
    start_btn: '생산 시작',
    clear_btn: '모두 지우기',
    progress_title: '생산 진행 상황',
    empty_state: '목록이 비어 있습니다. 링크나 주제를 입력하세요.',
    done: '완료',
    viral_score: '바이럴 잠재력 점수',
    tiktok_trend: 'TikTok 트렌드',
    yt_shorts: 'YouTube Shorts',
    est_cpm: '예상 CPM',
    audience_persona: '타겟 고객',
    deep_analysis: '심층 분석',
    script_scenes: '스크립트 & 장면',
    voiceover: '보이스오버',
    visual: '시각적 큐',
    live_preview: '실시간 미리보기',
    auto_post_timer: '자동 게시 타이머',
    posted_success: '성공적으로 게시됨',
    schedule: '스케줄 / 대기열',
    post_now: '지금 게시',
    gen_metadata: '생성된 메타데이터',
    title_viral: '제목 (바이럴)',
    desc_seo: '설명 (SEO)',
    hashtags: '해시태그',
    share: '공유',
    download: 'JSON 다운로드',
    specs_title: '출력 사양',
    script_title: '스크립트 지능',
    visual_title: '시각 엔진',
    voice_title: '음성 합성'
  },
  jp: {
    studio: 'バイラルDNAスタジオ',
    auto: '無限オートパイロット',
    campaign: '一括キャンペーン',
    analytics: '戦略インテル',
    market: 'AIマーケット',
    risk: 'リスクセンター',
    queue: 'スケジューラ＆キュー',
    docs: 'ドキュメント',
    settings: 'システム設定',
    title: 'バイラルDNAスタジオ',
    subtitle: '競合他社の成功を解読し、コンテンツを複製します。',
    studio_tabs: { dna: 'バイラルDNA', script: 'AIスクリプト', studio: 'ビデオスタジオ', quality: '品質ゲート' },
    input_section: '入力データソース',
    input_placeholder: '動画リンクを貼り付け (TikTok, Shorts, Reels)...',
    btn_add_source: 'ソースを追加',
    btn_upload: 'サンプルをアップロード (mp4)',
    analyze_btn: 'バイラルDNAを抽出',
    script_engine: { title: 'プロスクリプトエンジン', topic_label: 'コアトピック（必須）', generate_btn: 'スクリプト生成', generating: '執筆中...' },
    video_studio: { title: '自動ビデオスタジオ', render_btn: 'ビデオレンダリング (シミュレーション)', rendering: 'レンダリング中...' },
    status_label: 'ステータス',
    config_title: 'ミッションパラメータ',
    niche_label: 'ターゲットニッチ',
    stats_videos: '作成されたビデオ',
    stats_posted: '投稿済み',
    stats_uptime: '稼働時間',
    logs_title: 'ライブアクティビティログ',
    library_title: 'コンテンツライブラリ',
    input_title: 'コンテンツタイトル',
    input_caption: 'キャプション＆ハッシュタグ',
    platform_label: 'ターゲットプラットフォーム',
    schedule_label: 'スケジュールモード',
    mode_smart: 'スマート',
    mode_auto: '自動',
    mode_manual: '手動',
    mode_now: '今すぐ投稿',
    btn_analyzing: '処理中...',
    btn_post_now: 'すぐに公開',
    btn_schedule: 'キューに追加',
    queue_list_title: '保留中のキュー',
    view_standard: '標準',
    view_deep: '詳細スキャン',
    auto_recon_btn: '自動偵察を有効化',
    stop_auto_btn: '偵察を停止',
    manual_target: '手動ターゲット',
    waiting: 'データ待機中...',
    analysis_title: 'リアルタイム分析',
    deploy_btn: '戦略を展開',
    winner_title: '最良の機会',
    tab_market: 'マーケットプレイス',
    tab_hunter: 'ハンター',
    filter_google: 'Googleエコシステム',
    hunter_title: 'AIプロダクトハンター',
    hunter_desc: '高手数料かつ低競争の製品のためにアフィリエイトネットワークを自動的にスキャンします。',
    niche_placeholder: 'ニッチを入力 (例: スマートホーム...)',
    activate_btn: 'ハンターを有効化',
    hunting: 'ハンティング中...',
    results_found: '見つかった製品',
    btn_scan: 'システム監査を実行',
    btn_scanning: 'ネットワークスキャン中...',
    alert_key: 'リスク分析にはGoogle APIキーが必要です。',
    sections: { general: '一般設定' },
    settings_tabs: { brain: 'AIブレイン', vault: 'API保管庫', studio: 'スタジオ設定', system: 'システム' },
    input_label: '1. 入力ソースリスト',
    import_btn: 'キューにインポート',
    control_title: '2. コントロール',
    processing: '一括処理中...',
    start_btn: '生産開始',
    clear_btn: 'すべてクリア',
    progress_title: '生産の進捗',
    empty_state: 'リストが空です。リンクまたはトピックを入力してください。',
    done: '完了',
    viral_score: 'バイラル潜在スコア',
    tiktok_trend: 'TikTokトレンド',
    yt_shorts: 'YouTube Shorts',
    est_cpm: '推定CPM',
    audience_persona: 'ターゲットオーディエンス',
    deep_analysis: '詳細分析',
    script_scenes: 'スクリプト＆シーン',
    voiceover: 'ナレーション',
    visual: '視覚的キュー',
    live_preview: 'ライブプレビュー',
    auto_post_timer: '自動投稿タイマー',
    posted_success: '正常に投稿されました',
    schedule: 'スケジュール / キュー',
    post_now: '今すぐ投稿',
    gen_metadata: '生成されたメタデータ',
    title_viral: 'タイトル (バイラル)',
    desc_seo: '説明 (SEO)',
    hashtags: 'ハッシュタグ',
    share: '共有',
    download: 'JSONをダウンロード',
    specs_title: '出力仕様',
    script_title: 'スクリプトインテリジェンス',
    visual_title: '視覚エンジン',
    voice_title: '音声合成'
  },
  es: {
    studio: 'Estudio Viral DNA',
    auto: 'Piloto Automático Infinito',
    campaign: 'Campaña por Lotes',
    analytics: 'Inteligencia Estratégica',
    market: 'Mercado de IA',
    risk: 'Centro de Riesgos',
    queue: 'Programador y Cola',
    docs: 'Documentación',
    settings: 'Config. del Sistema',
    title: 'Estudio Viral DNA',
    subtitle: 'Decodifica el éxito de la competencia y replica contenido.',
    studio_tabs: { dna: 'ADN Viral', script: 'Guion IA', studio: 'Estudio de Video', quality: 'Control de Calidad' },
    input_section: 'Fuente de Datos',
    input_placeholder: 'Pegar enlace de video (TikTok, Shorts, Reels)...',
    btn_add_source: 'Añadir Fuente',
    btn_upload: 'Subir Muestra (mp4)',
    analyze_btn: 'Extraer ADN Viral',
    script_engine: { title: 'Motor de Guiones Pro', topic_label: 'Tema Central (Requerido)', generate_btn: 'Generar Guion', generating: 'Escribiendo...' },
    video_studio: { title: 'Estudio de Video Automatizado', render_btn: 'Renderizar Video (Sim)', rendering: 'Renderizando...' },
    status_label: 'Estado',
    config_title: 'Parámetros de Misión',
    niche_label: 'Nicho Objetivo',
    stats_videos: 'Videos Creados',
    stats_posted: 'Publicado',
    stats_uptime: 'Tiempo de Actividad',
    logs_title: 'Registros de Actividad',
    library_title: 'Biblioteca de Contenido',
    input_title: 'Título del Contenido',
    input_caption: 'Leyenda y Hashtags',
    platform_label: 'Plataformas Objetivo',
    schedule_label: 'Modo de Programación',
    mode_smart: 'Inteligente',
    mode_auto: 'Auto',
    mode_manual: 'Manual',
    mode_now: 'Publicar Ahora',
    btn_analyzing: 'Procesando...',
    btn_post_now: 'Publicar Inmediatamente',
    btn_schedule: 'Añadir a la Cola',
    queue_list_title: 'Cola Pendiente',
    view_standard: 'Estándar',
    view_deep: 'Escaneo Profundo',
    auto_recon_btn: 'Activar Auto-Recon',
    stop_auto_btn: 'Detener Recon',
    manual_target: 'Objetivo Manual',
    waiting: 'Esperando datos...',
    analysis_title: 'Análisis en Tiempo Real',
    deploy_btn: 'Desplegar Estrategia',
    winner_title: 'Mejor Oportunidad',
    tab_market: 'Mercado',
    tab_hunter: 'Cazador',
    filter_google: 'Ecosistema Google',
    hunter_title: 'Cazador de Productos IA',
    hunter_desc: 'Escanea automáticamente redes de afiliados para productos de alta comisión.',
    niche_placeholder: 'Ingresa nicho (ej. Hogar Inteligente...)',
    activate_btn: 'Activar Cazador',
    hunting: 'Cazando...',
    results_found: 'Productos Encontrados',
    btn_scan: 'EJECUTAR AUDITORÍA',
    btn_scanning: 'Escaneando Red...',
    alert_key: 'Se requiere clave API de Google para análisis de riesgos.',
    sections: { general: 'Preferencias Generales' },
    settings_tabs: { brain: 'Cerebro IA', vault: 'Bóveda API', studio: 'Config. Estudio', system: 'Sistema' },
    input_label: '1. Lista de Fuentes',
    import_btn: 'Importar a la Cola',
    control_title: '2. Controles',
    processing: 'Procesamiento por Lotes...',
    start_btn: 'Iniciar Producción',
    clear_btn: 'Borrar Todo',
    progress_title: 'Progreso de Producción',
    empty_state: 'Lista vacía. Por favor ingresa enlaces o temas.',
    done: 'Hecho',
    viral_score: 'Puntuación de Potencial Viral',
    tiktok_trend: 'Tendencia TikTok',
    yt_shorts: 'YouTube Shorts',
    est_cpm: 'CPM Est.',
    audience_persona: 'Público Objetivo',
    deep_analysis: 'Análisis Profundo',
    script_scenes: 'Guion y Escenas',
    voiceover: 'Voz en Off',
    visual: 'Señales Visuales',
    live_preview: 'VISTA PREVIA EN VIVO',
    auto_post_timer: 'Temporizador Auto-Publicación',
    posted_success: 'PUBLICADO CON ÉXITO',
    schedule: 'Programar / Cola',
    post_now: 'PUBLICAR AHORA',
    gen_metadata: 'Metadatos Generados',
    title_viral: 'Título (Viral)',
    desc_seo: 'Descripción (SEO)',
    hashtags: 'Hashtags',
    share: 'Compartir',
    download: 'Descargar JSON',
    specs_title: 'Especificaciones de Salida',
    script_title: 'Inteligencia de Guion',
    visual_title: 'Motor Visual',
    voice_title: 'Síntesis de Voz'
  },
  cn: {
    studio: '病毒DNA工作室',
    auto: '无限自动驾驶',
    campaign: '批量广告系列',
    analytics: '战略情报',
    market: 'AI市场',
    risk: '风险中心',
    queue: '调度器和队列',
    docs: '文档',
    settings: '系统配置',
    title: '病毒DNA工作室',
    subtitle: '解码竞争对手的成功并复制内容。',
    studio_tabs: { dna: '病毒DNA', script: 'AI脚本', studio: '视频工作室', quality: '质量门' },
    input_section: '输入数据源',
    input_placeholder: '粘贴视频链接 (TikTok, Shorts, Reels)...',
    btn_add_source: '添加来源',
    btn_upload: '上传样本 (mp4)',
    analyze_btn: '提取病毒DNA',
    script_engine: { title: '专业脚本引擎', topic_label: '核心主题 (必填)', generate_btn: '生成脚本', generating: '正在撰写...' },
    video_studio: { title: '自动化视频工作室', render_btn: '渲染视频 (模拟)', rendering: '渲染中...' },
    status_label: '状态',
    config_title: '任务参数',
    niche_label: '目标利基',
    stats_videos: '已创建视频',
    stats_posted: '已发布',
    stats_uptime: '运行时间',
    logs_title: '实时活动日志',
    library_title: '内容库',
    input_title: '内容标题',
    input_caption: '标题和标签',
    platform_label: '目标平台',
    schedule_label: '调度模式',
    mode_smart: '智能',
    mode_auto: '自动',
    mode_manual: '手动',
    mode_now: '立即发布',
    btn_analyzing: '处理中...',
    btn_post_now: '立即发布',
    btn_schedule: '添加到队列',
    queue_list_title: '待处理队列',
    view_standard: '标准',
    view_deep: '深度扫描',
    auto_recon_btn: '启用自动侦察',
    stop_auto_btn: '停止侦察',
    manual_target: '手动目标',
    waiting: '等待数据...',
    analysis_title: '实时分析',
    deploy_btn: '部署策略',
    winner_title: '最佳机会',
    tab_market: '市场',
    tab_hunter: '猎人',
    filter_google: '谷歌生态系统',
    hunter_title: 'AI产品猎人',
    hunter_desc: '自动扫描联盟网络以寻找高佣金产品。',
    niche_placeholder: '输入利基 (例如 智能家居...)',
    activate_btn: '激活猎人',
    hunting: '狩猎中...',
    results_found: '找到的产品',
    btn_scan: '运行系统审计',
    btn_scanning: '扫描网络中...',
    alert_key: '风险分析需要谷歌API密钥。',
    sections: { general: '一般首选项' },
    settings_tabs: { brain: 'AI大脑', vault: 'API金库', studio: '工作室配置', system: '系统' },
    input_label: '1. 输入源列表',
    import_btn: '导入到队列',
    control_title: '2. 控制',
    processing: '批量处理中...',
    start_btn: '开始生产',
    clear_btn: '全部清除',
    progress_title: '生产进度',
    empty_state: '列表为空。请输入链接或主题。',
    done: '完成',
    viral_score: '病毒潜力得分',
    tiktok_trend: 'TikTok趋势',
    yt_shorts: 'YouTube Shorts',
    est_cpm: '预估CPM',
    audience_persona: '目标受众',
    deep_analysis: '深度分析',
    script_scenes: '脚本和场景',
    voiceover: '画外音',
    visual: '视觉提示',
    live_preview: '实时预览',
    auto_post_timer: '自动发布计时器',
    posted_success: '发布成功',
    schedule: '调度 / 队列',
    post_now: '立即发布',
    gen_metadata: '生成元数据',
    title_viral: '标题 (病毒)',
    desc_seo: '描述 (SEO)',
    hashtags: '标签',
    share: '分享',
    download: '下载JSON',
    specs_title: '输出规格',
    script_title: '脚本智能',
    visual_title: '视觉引擎',
    voice_title: '语音合成'
  }
};

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState<TabView>('studio');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Ref for the main content area to handle scrolling
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Languages - Default to English for Global SaaS
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

  // --- SCROLL TO TOP EFFECT ---
  useEffect(() => {
    if (mainContentRef.current) {
        mainContentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // --- ACTIONS ---
  const handleAddToQueue = (job: PostingJob) => {
      setJobs(prev => [job, ...prev]);
  };

  const handleVideoGenerated = (video: CompletedVideo) => {
      setCompletedVideos(prev => [video, ...prev]);
  };

  const handleDeployStrategy = (url: string, type: 'clone' | 'review') => {
      setActiveTab('studio');
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
      } else if (cmd.action === 'UPDATE_MEMORY') {
          setKnowledgeBase(prev => ({
              ...prev,
              learnedPreferences: [...prev.learnedPreferences, cmd.payload],
              lastUpdated: Date.now()
          }));
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

    // Use current language translations, fallback to English if missing
    const t = TRANSLATIONS[appLanguage] || TRANSLATIONS['en'];

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
    <div className="flex h-[100dvh] bg-[#020617] text-white font-sans overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            t={TRANSLATIONS[appLanguage] || TRANSLATIONS['en']}
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
                            <option value="en">English (US)</option>
                            <option value="vi">Tiếng Việt</option>
                            <option value="de">Deutsch (DE)</option>
                            <option value="fr">Français (FR)</option>
                            <option value="kr">한국어 (KR)</option>
                            <option value="jp">日本語 (JP)</option>
                            <option value="es">Español (ES)</option>
                            <option value="cn">中文 (CN)</option>
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
            <main 
                ref={mainContentRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 relative scroll-smooth bg-[#020617]"
            >
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
