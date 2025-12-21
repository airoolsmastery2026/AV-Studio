
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
}

export interface Scene {
  scene_id: string;
  start: number;
  duration: number;
  vo_text: string;
  visual_cues: string;
  model_choice: 'GROK' | 'SORA' | 'VEO' | 'KLING' | 'IMAGEN' | 'GEMINI_VIDEO';
  priority: 'draft' | 'final';
}

export interface AudiencePersona {
  id: string;
  name: string;
  age_range: string;
  interests: string[];
  behavior: string;
  script_tone: string;
}

export interface MarketScoring {
  tiktok_potential: number;
  youtube_shorts_potential: number;
  estimated_cpm: string;
}

export type ContentWorkflow = 'AUTO' | 'VIRAL_CLONE' | 'REVIEW_TUTORIAL' | 'NEWS_SUMMARY' | 'STORYTELLING' | 'EDUCATIONAL' | 'REACTION';
export type ContentNiche = 
  | 'AUTO' 
  | 'TECH' 
  | 'BEAUTY' 
  | 'FINANCE' 
  | 'HEALTH' 
  | 'ENTERTAINMENT' 
  | 'NEWS' 
  | 'CRYPTO' 
  | 'AI_SAAS' 
  | 'ML_PLATFORMS' 
  | 'AI_HACKS' 
  | 'AI_AGENTS'
  | 'AI_TRADING'
  | 'AI_ART'
  | 'PASSIVE_INCOME' 
  | 'SMART_HOME' 
  | 'MULTI_NICHE';

export type VideoResolution = '720p' | '1080p' | '4K';
export type AspectRatio = '9:16' | '16:9' | '1:1';
export type ScriptModel = 'Gemini 2.5 Flash' | 'Gemini 3 Pro' | 'GPT-4o' | 'Grok Beta';
export type VisualModel = 'VEO' | 'SORA' | 'KLING' | 'IMAGEN' | 'MIDJOURNEY';
export type VoiceModel = 'ElevenLabs' | 'OpenAI TTS' | 'Google Chirp' | 'Vbee TTS';

export type AppLanguage = 'vi' | 'en'; 
export type ContentLanguage = 'vi' | 'en';

export interface CompetitorChannel {
  id: string;
  url: string;
  name: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  dna_preview?: string;
}

export interface VideoConfig {
  resolution: VideoResolution;
  aspectRatio: AspectRatio;
  scriptModel: ScriptModel;
  visualModel: VisualModel;
  voiceModel: VoiceModel;
  outputLanguage: ContentLanguage; 
}

export interface DeepAnalysis {
  viral_dna: string[];
  psychological_triggers: string[];
  competitor_gap: string;
  winning_angle: string;
  monetization_strategy: string;
  content_strategy: ContentWorkflow; 
}

export interface ProductionPlan {
  script_master: string;
  scenes: Scene[];
  technical_specs?: { 
      resolution: string;
      ratio: string;
      fps: number;
  };
}

export interface OrchestratorResponse {
  market_scoring: MarketScoring;
  audience_personas: AudiencePersona[];
  deep_analysis: DeepAnalysis;
  production_plan: ProductionPlan;
  generated_content?: {
    title: string;
    description: string;
    hashtags: string[];
    thumbnail_prompt: string;
  }; 
  consent_log: {
    user_confirmed_clone: boolean;
    timestamp: string;
  };
}

export interface PostingJob {
    id: string;
    content_title: string;
    caption: string;
    hashtags: string[];
    platforms: string[];
    scheduled_time: number;
    status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'processing';
    thumbnail_url?: string;
    video_url?: string;
}

export interface KnowledgeBase {
    customInstructions: string;
    learnedPreferences: string[];
    autoImprovementEnabled: boolean;
    lastUpdated: number;
}

export interface ViralDNAProfile {
  structure: {
    hook_type: string;
    pacing: 'Fast' | 'Moderate' | 'Slow';
    avg_scene_duration: number;
  };
  emotional_curve: string[];
  keywords: string[];
  algorithm_fit_score: number;
  risk_level: 'Safe' | 'Moderate' | 'High';
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

export interface ApiKeyConfig {
  id: string;
  alias: string;
  key: string;
  extra_fields?: Record<string, string>;
  provider: 
    | 'google' | 'openai' | 'veo' 
    | 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'twitter' | 'threads' | 'zalo_personal' | 'zalo'
    | 'shopee' | 'amazon' | 'lazada' | 'tiki' | 'accesstrade' | 'clickbank' | 'adflex' | 'ecomobi' | 'masoffer' | 'ebay' | 'aliexpress' | 'walmart' | 'rakuten_global' | 'cj' | 'shareasale' | 'target'
    | 'rakuten_jp' | 'amazon_jp' | 'coupang_kr' | 'gmarket_kr' | 'qoo10_jp'
    | 'binance' | 'bybit' | 'okx' | 'gateio' | 'mexc' | 'bitget' | 'remitano' | 'kucoin' | 'htx' | 'coinbase' | 'kraken' | 'bingx' | 'phemex' | 'bitfinex';
  category: 'model' | 'social' | 'affiliate' | 'storage';
  status: 'active' | 'quota_exceeded' | 'error';
  lastUsed?: string;
}

export interface AgentCommand {
  action: 'NAVIGATE' | 'SET_INPUT' | 'EXECUTE_RUN' | 'UPDATE_MEMORY';
  payload: any;
}

export interface AppContext {
  activeTab: TabView;
  status: AppStatus;
  urlInput: string;
  activeKeys: number;
  lastError: string | null;
  detectedStrategy: ContentWorkflow | null;
  knowledgeBase: KnowledgeBase;
  autoPilotContext: string;
}

export interface AIProduct {
  id: string;
  product_name: string;
  affiliate_link: string;
  commission_est: string;
  network: string;
  opportunity_score: number;
  reason_to_promote: string;
  content_angle?: string;
  timestamp: number;
}

export interface AffiliateHuntResult {
  products: AIProduct[];
  strategy_note: string;
}

export interface SourceMetadata {
  url: string;
  title: string;
  snippet: string;
}

export interface HunterInsight {
  type: string;
  target_name: string;
  market_status: string;
  match_score: number;
  hidden_analysis: {
    consumer_psychology: string;
    competitor_weakness: string;
  };
  key_metrics: {
    label: string;
    value: string;
    trend: 'up' | 'down';
  }[];
  strategic_suggestion: string;
}

export interface NetworkScanResult {
  scan_id: string;
  focus_area: string;
  targets: {
    rank: number;
    name: string;
    reason: string;
    url: string;
  }[];
}

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
  health_score: number;
  status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  metrics: {
    views_growth: string;
    avg_watch_time: string;
    ctr: string;
  };
  risks: {
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    description?: string;
  }[];
  ai_diagnosis: string;
  action_plan: string[];
}

export interface AutoPilotStats {
  cyclesRun: number;
  videosCreated: number;
  postedCount: number;
  uptime: number;
}

export interface AutoPilotLog {
  timestamp: string;
  action: string;
  status: 'success' | 'error' | 'warning' | 'info';
  detail: string;
}

export interface CompletedVideo {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  command?: AgentCommand;
  detected_lang?: string;
  suggestions?: string[];
  sentiment?: 'happy' | 'urgent' | 'thinking' | 'neutral';
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: number;
}

export type TargetRegion = 'VN' | 'US' | 'GLOBAL';

export interface BatchJobItem {
  id: string;
  input: string;
  status: 'queued' | 'analyzing' | 'scripting' | 'generating_assets' | 'rendering' | 'completed' | 'failed';
  progress: number;
  log: string;
}

export type PipelineStage = 'IDLE' | 'HUNTING' | 'ANALYZING' | 'PLANNING' | 'RENDERING' | 'SCHEDULING' | 'POSTING';
