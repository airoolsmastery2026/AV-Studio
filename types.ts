
export interface VideoDissection {
  timestamp: string;
  hook_analysis: string;
  retention_strategy: string;
  visual_style: string;
  audio_cues: string;
  cta_effectiveness: string;
  clone_blueprint: {
    prompt_equivalent: string;
    suggested_pacing: string;
    script_structure: string[];
  };
}

export interface SEOAudit {
  seo_score: number;
  keyword_difficulty: 'LOW' | 'MEDIUM' | 'HIGH';
  search_volume_score: number;
  trending_momentum: number;
  suggested_tags: string[];
  checklist: { task: string; completed: boolean; impact: string }[];
  title_optimization_suggestions: string[];
  description_optimized: string;
}

export interface ViralFormula {
  id: string;
  name: string;
  structure_logic: string;
  retention_hook_rule: string;
  transition_style: 'SEAMLESS' | 'DYNAMIC_CUT' | 'ZOOM_FLOW' | 'MATCH_CUT';
}

export interface PlatformMetric {
  platform: 'TikTok' | 'YouTube' | 'Reels';
  hook_window_sec: number;
  min_retention_target: number;
  engagement_velocity_trigger: number;
}

export interface KnowledgeBase {
    customInstructions: string;
    learnedPreferences: string[];
    autoImprovementEnabled: boolean;
    lastUpdated: number;
    globalStrategyRules: {
        enforceConsistency: boolean;
        seamlessTransitionLogic: boolean;
        viralFormulaId: string;
        algorithmOptimizationLevel: number; // 0-100
    };
}

export interface Scene {
  scene_id: string;
  start: number;
  duration: number;
  vo_text: string;
  visual_cues: string;
  model_choice: 'GROK' | 'SORA' | 'VEO' | 'KLING' | 'IMAGEN' | 'GEMINI_VIDEO';
  priority: 'draft' | 'final';
  transition_logic?: string; // Quy tắc nối cảnh
}

export interface StudioSettings {
  quality: 'Draft' | 'Standard' | 'Ultra';
  aspectRatio: '9:16' | '16:9' | '1:1';
  model: 'Fast' | 'Balanced' | 'Cinematic';
  hookStrength: number;
  storyMode: 'One-shot' | 'Episodic' | 'Documentary';
  riskLevel: 'Safe' | 'Medium' | 'High';
  videoFormat: 'Shorts' | 'Long Form';
  contentLanguage: ContentLanguage;
  topic: string;
  generationMode: 'Free Storyboard' | 'Veo';
  characterLock: boolean;
  styleLock: boolean;
  musicSync: boolean;
  viralFormulaId?: string;
}

export type AppLanguage = 'vi' | 'en'; 
export type ContentLanguage = 'vi' | 'en';
export type VideoResolution = '720p' | '1080p' | '4K';
export type AspectRatio = '9:16' | '16:9' | '1:1';
export type ScriptModel = 'Gemini 2.5 Flash' | 'Gemini 3 Pro' | 'GPT-4o' | 'Grok Beta';
export type VisualModel = 'VEO' | 'SORA' | 'KLING' | 'IMAGEN' | 'MIDJOURNEY';
export type VoiceModel = 'ElevenLabs' | 'OpenAI TTS' | 'Google Chirp' | 'Vbee TTS';

export interface ApiKeyConfig {
  id: string;
  alias: string;
  key: string;
  provider: 'google' | 'openai' | 'veo' | 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'twitter' | 'threads' | 'zalo_personal' | 'zalo' | 'shopee' | 'amazon' | 'lazada' | 'tiki' | 'accesstrade' | 'clickbank' | 'adflex' | 'ecomobi' | 'masoffer' | 'ebay' | 'aliexpress' | 'walmart' | 'rakuten_global' | 'cj' | 'shareasale' | 'target' | 'rakuten_jp' | 'amazon_jp' | 'coupang_kr' | 'gmarket_kr' | 'qoo10_jp' | 'binance' | 'bybit' | 'okx' | 'gateio' | 'mexc' | 'bitget' | 'remitano' | 'kucoin' | 'htx' | 'coinbase' | 'kraken' | 'bingx' | 'phemex' | 'bitfinex';
  category: 'model' | 'social' | 'affiliate' | 'storage';
  status: 'active' | 'quota_exceeded' | 'error';
  lastUsed?: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  HUNTING = 'HUNTING',
  ANALYZING = 'ANALYZING',
  PLANNING = 'PLANNING',
  RENDERING = 'RENDERING',
  SCHEDULING = 'SCHEDULING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export type TabView = 'campaign' | 'integrations' | 'queue' | 'analytics' | 'risk_center' | 'marketplace' | 'settings' | 'auto_pilot' | 'models' | 'studio' | 'docs';

export interface MissionIntel {
  product_name: string;
  platform: string;
  store_name: string;
  price_range: string;
  commission_rate: string;
  target_audience: string;
  winning_rationale: string;
  market_threat_level: 'LOW' | 'MEDIUM' | 'HIGH';
  competitor_urls: string[];
  trending_score?: number;
  vidiq_score?: SEOAudit;
  pricing_model?: string;
}

export interface AutoPilotStats { cyclesRun: number; videosCreated: number; postedCount: number; uptime: number; }
export interface AutoPilotLog { timestamp: string; action: string; status: 'success' | 'error' | 'warning' | 'info'; detail: string; }
export interface PostingJob { id: string; content_title: string; caption: string; hashtags: string[]; platforms: string[]; scheduled_time: number; status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'processing'; }
export interface OrchestratorResponse { production_plan: any; generated_content: any; [key: string]: any; market_scoring: any; audience_personas: any[]; deep_analysis: any; }
export interface ViralDNAProfile { structure: any; emotional_curve: string[]; keywords: string[]; algorithm_fit_score: number; [key: string]: any; }
export interface AgentCommand { action: 'NAVIGATE' | 'SET_INPUT' | 'EXECUTE_RUN' | 'UPDATE_MEMORY'; payload: any; }

/* FIX: Added missing exported types */

export interface AppContext {
  activeTab: string;
  status: string;
  urlInput: string;
  activeKeys: number;
  lastError: string | null;
  detectedStrategy: any;
  knowledgeBase: KnowledgeBase;
  autoPilotContext: string;
}

export interface CompletedVideo {
  id: string;
  title: string;
  url: string;
  timestamp: number;
  platform: string;
}

export interface HunterInsight {
  id: string;
  signal_type: string;
  description: string;
}

export interface NetworkScanResult {
  id: string;
  node: string;
  status: string;
}

export interface CompetitorDeepAudit {
  channel_name: string;
  overall_strategy: string;
  success_probability: number;
  niche_authority_score: number;
  top_video_dissection: VideoDissection[];
}

export interface AIProduct {
  id: string;
  product_name: string;
  commission_est: string;
  network: string;
  affiliate_link: string;
  reason_to_promote: string;
  opportunity_score: number;
  content_angle?: string;
  timestamp: number;
  strategy_note?: string;
}

export interface AffiliateHuntResult {
  products: AIProduct[];
  strategy_note: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  command?: AgentCommand;
  detected_lang?: string;
  suggestions?: string[];
  sentiment?: string;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: number;
}

export type TargetRegion = 'VN' | 'US' | 'GLOBAL';

export interface GoldenHourRecommendation {
  time_label: string;
  score: number;
  reason: string;
}

export interface ScheduleSlot {
  slot_id: string;
  time_of_day: string;
  purpose: string;
  target_audience_activity: string;
}

export interface ChannelHealthReport {
  channel_name: string;
  platform: string;
  status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  health_score: number;
  recovery_estimate: string;
  risks: {
    type: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    medical_term: string;
  }[];
  action_plan: {
    task: string;
    instruction: string;
    priority: 'normal' | 'urgent';
  }[];
  ai_diagnosis: string;
}

export interface GovernorAction {
  id: string;
  action_type: string;
  timestamp: number;
  description: string;
  before: string;
  after: string;
  impact_score: number;
}

export interface BatchJobItem {
  id: string;
  input: string;
  status: 'queued' | 'analyzing' | 'scripting' | 'generating_assets' | 'rendering' | 'completed' | 'failed';
  progress: number;
  log: string;
}

export interface CompetitorChannel {
  id: string;
  url: string;
  name: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  dna_preview?: string;
}
