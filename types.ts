
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

// New Types for Manual Classification
export type ContentWorkflow = 'AUTO' | 'VIRAL_CLONE' | 'REVIEW_TUTORIAL' | 'NEWS_SUMMARY' | 'STORYTELLING' | 'EDUCATIONAL' | 'REACTION';
export type ContentNiche = 'AUTO' | 'TECH' | 'BEAUTY' | 'FINANCE' | 'HEALTH' | 'ENTERTAINMENT' | 'NEWS' | 'CRYPTO';

// --- NEW VIDEO CONFIG TYPES ---
export type VideoResolution = '720p' | '1080p' | '4K';
export type AspectRatio = '9:16' | '16:9' | '1:1';
export type ScriptModel = 'Gemini 2.5 Flash' | 'Gemini 1.5 Pro' | 'GPT-4o';
export type VisualModel = 'VEO' | 'SORA' | 'KLING' | 'IMAGEN' | 'MIDJOURNEY';
export type VoiceModel = 'ElevenLabs' | 'OpenAI TTS' | 'Google Chirp';

export interface VideoConfig {
  resolution: VideoResolution;
  aspectRatio: AspectRatio;
  scriptModel: ScriptModel;
  visualModel: VisualModel;
  voiceModel: VoiceModel;
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

// NEW: Metadata for the generated video
export interface GeneratedContent {
  title: string;
  description: string;
  hashtags: string[];
  thumbnail_prompt: string;
}

export interface OrchestratorResponse {
  market_scoring: MarketScoring;
  audience_personas: AudiencePersona[];
  deep_analysis: DeepAnalysis;
  production_plan: ProductionPlan;
  generated_content?: GeneratedContent; // Added generated metadata
  consent_log: {
    user_confirmed_clone: boolean;
    timestamp: string;
  };
}

// NEW: COMPLETED VIDEO ASSET
export interface CompletedVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl?: string; // Simulated path
  platform: string;
  niche: string;
  createdAt: number;
  stats?: {
    views: number;
    likes: number;
  };
}

export interface SourceMetadata {
  url: string;
  type: 'channel' | 'product' | 'auto_detect';
  notes?: string;
  detected_strategy?: ContentWorkflow; 
  manual_niche?: ContentNiche;
  manual_workflow?: ContentWorkflow;
  prefer_google_stack?: boolean; 
  video_config?: VideoConfig; 
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  ROUTING = 'ROUTING',
  PLANNING = 'PLANNING',
  PARAPHRASING = 'PARAPHRASING',
  RENDERING = 'RENDERING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export type TabView = 'campaign' | 'integrations' | 'queue' | 'analytics' | 'risk_center' | 'marketplace' | 'settings' | 'auto_pilot' | 'models';

export interface CreditUsage {
  remaining: number;
  total: number;
  unit: 'tokens' | 'credits' | 'requests';
  requiredPerRun?: number;
}

export interface ApiKeyConfig {
  id: string;
  alias: string;
  key: string;
  provider: 'google' | 'openai' | 'veo' | 'stitch' | 'wish' | 'switch' | 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'pinterest' | 'telegram' | 'shopee' | 'amazon' | 'ebay' | 'etsy' | 'walmart' | 'aliexpress' | 'upstash' | 'other' | 'zalo' | 'accesstrade' | 'clickbank' | 'digistore24' | 'cj' | 'masoffer' | 'ecomobi' | 'adflex' | 'lazada';
  category: 'model' | 'social' | 'affiliate' | 'storage';
  status: 'active' | 'quota_exceeded' | 'error';
  lastUsed?: string;
  credits?: CreditUsage;
}

export interface TrendItem {
  id: string;
  title: string;
  growth: number;
  volume: string;
  platform: 'tiktok' | 'youtube';
  niche: string;
}

export interface ChannelPerformance {
  channel_name: string;
  views_change: number;
  engagement_rate: number;
  top_video_url: string;
  optimization_score: number;
  actionable_insight: string;
}

export interface AIProduct {
  id: string;
  name: string;
  description: string;
  commission_rate: string;
  tags: string[];
  affiliate_link_template: string;
  icon_color: string;
  is_google_ecosystem?: boolean; 
}

export interface HunterInsight {
  target_name: string;
  type: 'WINNING_PRODUCT' | 'VIRAL_CHANNEL' | 'NICHE_OPPORTUNITY';
  match_score: number; // 0-100
  market_status: 'Blue Ocean' | 'Red Ocean' | 'Gold Mine';
  key_metrics: { 
    label: string; 
    value: string; 
    trend: 'up' | 'down' | 'stable';
  }[];
  hidden_analysis: {
     consumer_psychology: string;
     competitor_weakness: string;
     profit_potential: string;
     risk_assessment: string;
  };
  strategic_suggestion: string;
}

// NEW: DEEP NETWORK SCAN RESULT
export interface NetworkScanTarget {
  rank: number;
  name: string;
  type: 'CHANNEL' | 'NICHE' | 'PROFILE';
  platform: 'YOUTUBE' | 'TIKTOK' | 'FACEBOOK' | 'INSTAGRAM' | 'WEB';
  url: string;
  metrics: {
    rpm_est: string; // e.g. "$15-20"
    search_volume: string; // "High", "1M+"
    view_velocity: string; // "Trending", "Stable"
    competition: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  reason: string;
}

export interface NetworkScanResult {
  scan_id: string;
  timestamp: string;
  focus_area: string;
  targets: NetworkScanTarget[];
  market_summary: string;
}

export interface WinningProduct {
  name: string;
  reason: string;
  target_audience: string;
  difficulty: 'Low' | 'Medium' | 'High';
  affiliate_potential_score: number;
}

export interface NicheAnalysisResult {
  niche_name: string;
  market_phase: 'Emerging' | 'Peaking' | 'Saturated' | 'Declining';
  competition_level: string;
  winning_products: WinningProduct[];
  content_angle: string;
  commander_insight: string; 
}

export interface CompetitorVideo {
  title: string;
  views: string;
  hook_technique: string;
  why_it_worked: string;
  clone_difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface CompetitorAnalysisResult {
  channel_name: string;
  primary_archetype: string; 
  growth_hack_found: string;
  top_videos_to_model: CompetitorVideo[];
  commander_action_plan: string; 
}

export interface AffiliateHuntResult {
  products: {
    product_name: string;
    network: string;
    commission_est: string;
    opportunity_score: number; // 1-100
    affiliate_link: string; 
    reason_to_promote: string;
    content_angle: string; // NEW: Specific angle for this product
  }[];
  strategy_note: string;
}

export interface RiskFactor {
  type: 'SHADOWBAN' | 'COPYRIGHT' | 'ENGAGEMENT_DROP' | 'POLICY_VIOLATION' | 'NONE';
  severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
  description: string;
  detected_at: number;
}

export interface ChannelHealthReport {
  channel_id: string;
  channel_name: string;
  platform: 'tiktok' | 'youtube' | 'facebook' | 'instagram';
  health_score: number; // 0-100
  status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  metrics: {
    views_growth: string; 
    avg_watch_time: string;
    ctr: string;
  };
  risks: RiskFactor[];
  ai_diagnosis: string;
  action_plan: string[];
}

export type PostingStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
export type TargetRegion = 'VN' | 'US' | 'GLOBAL' | 'EU';

export interface PostingJob {
  id: string;
  content_title: string;
  caption: string;
  hashtags: string[];
  platforms: string[]; 
  scheduled_time: number; 
  status: PostingStatus;
  thumbnail_url?: string;
  predicted_engagement?: string; 
}

export interface GoldenHourRecommendation {
  time_label: string; 
  reason: string;
  score: number; 
}

export interface ScheduleSlot {
  slot_id: number;
  time_of_day: string; // "09:00", "12:00", "19:00"
  purpose: string;
  target_audience_activity: string;
}

export interface KnowledgeBase {
  customInstructions: string;
  learnedPreferences: string[];
  autoImprovementEnabled: boolean;
  lastUpdated: number;
}

export type AgentActionType = 'NAVIGATE' | 'SET_INPUT' | 'EXECUTE_RUN' | 'UPDATE_MEMORY' | 'NONE';

export interface AgentCommand {
  action: AgentActionType;
  payload?: any;
  reasoning?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
  command?: AgentCommand; 
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: number;
  lastUsed?: number;
}

export interface AppContext {
  activeTab: TabView;
  status: AppStatus;
  urlInput: string;
  activeKeys: number;
  lastError: string | null;
  detectedStrategy?: string | null;
  knowledgeBase: KnowledgeBase; 
}

// BATCH FACTORY TYPES
export type BatchJobStatus = 'queued' | 'analyzing' | 'scripting' | 'generating_assets' | 'rendering' | 'completed' | 'failed';

export interface BatchJobItem {
  id: string;
  input: string; // URL or Topic
  status: BatchJobStatus;
  progress: number; // 0-100
  log: string;
  result?: OrchestratorResponse;
  error?: string;
}

// AUTO PILOT TYPES
export interface AutoPilotLog {
  timestamp: string;
  action: string;
  detail: string;
  status: 'info' | 'success' | 'warning' | 'error';
}

export interface AutoPilotStats {
  cyclesRun: number;
  videosCreated: number;
  postedCount: number;
  uptime: number; // seconds
}
