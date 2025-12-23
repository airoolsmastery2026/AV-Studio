
// Types for application configuration and state management
export type AppLanguage = 'vi' | 'en' | 'ja' | 'es' | 'zh';
export type ContentLanguage = 'vi' | 'en' | 'es' | 'fr' | 'ja' | 'ko' | 'zh' | 'th';
export type ScriptModel = 'Gemini 3 Pro' | 'Gemini 3 Flash' | 'GPT-4o' | 'Grok 3' | 'Gemini 2.5 Flash';
export type VisualModel = 'VEO 3.1' | 'KLING 1.5' | 'HAILUO AI' | 'SORA' | 'IMAGEN 4';
export type VoiceModel = 'Google Chirp' | 'ElevenLabs Clone' | 'OpenAI TTS' | 'Vbee TTS';
export type VideoResolution = '1080p' | '4K' | '720p';
export type AspectRatio = '9:16' | '16:9' | '1:1';
export type TabView = 'campaign' | 'integrations' | 'queue' | 'analytics' | 'risk_center' | 'marketplace' | 'settings' | 'auto_pilot' | 'models' | 'studio' | 'docs';

export interface YouTubeChannel {
  id: string;
  name: string;
  thumbnail: string;
  subscribers: string;
  videoCount: number;
  status: 'connected' | 'disconnected' | 'error';
}

export interface YouTubeTrend {
  keyword: string;
  volume: string;
  competition: 'LOW' | 'MEDIUM' | 'HIGH';
  potential_ctr: number;
  tags: string[];
}

export interface PlatformPolicy {
  platform: string;
  last_updated: number;
  critical_changes: string[];
  compliance_score: number;
  ai_label_required: boolean;
  new_restrictions: string[];
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

export interface ViralDNAProfile {
  structure: {
    hook_type: string;
    pacing: 'Fast' | 'Moderate' | 'Slow';
    avg_scene_duration: number;
    visual_pacing_avg?: number;
  };
  emotional_curve: string[];
  keywords: string[];
  algorithm_fit_score: number;
  risk_level: 'Safe' | 'Moderate' | 'High';
}

export interface StudioSettings {
  quality: string;
  aspectRatio: AspectRatio;
  model: string;
  hookStrength: number;
  storyMode: string;
  riskLevel: string;
  videoFormat: string;
  contentLanguage: ContentLanguage;
  topic: string;
  generationMode: string;
  characterLock: boolean;
  styleLock: boolean;
  musicSync: boolean;
}

export interface OrchestratorResponse {
  market_scoring: {
    tiktok_potential: number;
    youtube_shorts_potential: number;
    estimated_cpm: string;
  };
  audience_personas: {
    id: string;
    name: string;
    behavior: string;
    interests: string[];
  }[];
  deep_analysis: {
    viral_dna: string[];
    winning_angle: string;
    monetization_strategy: string;
  };
  production_plan: {
    technical_specs: {
      ratio: AspectRatio;
      resolution: VideoResolution;
    };
    script_master: string;
    scenes: { vo_text: string; visual_cues: string; }[];
  };
  generated_content: {
    title: string;
    description: string;
    hashtags: string[];
    thumbnail_prompt: string;
  };
}

export interface ApiKeyConfig {
  id: string;
  alias: string;
  key: string;
  provider: string;
  category: 'model' | 'social' | 'affiliate' | 'storage';
  status: 'active' | 'quota_exceeded' | 'error';
  /**
   * Addition: Support for extra fields such as webhook_url
   */
  extra_fields?: any;
}

export interface PostingJob {
  id: string;
  content_title: string;
  caption: string;
  hashtags: string[];
  platforms: string[];
  scheduled_time: number;
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  visibility?: 'public' | 'private' | 'unlisted';
}

export interface KnowledgeBase {
  customInstructions: string;
  learnedPreferences: string[];
  autoImprovementEnabled: boolean;
  lastUpdated: number;
  platformPolicies: PlatformPolicy[];
  globalStrategyRules: {
    enforceConsistency: boolean;
    seamlessTransitionLogic: boolean;
    viralFormulaId: string;
    algorithmOptimizationLevel: number;
  };
}

export interface MissionIntel {
  product_name: string;
  platform: string;
  commission_rate: string;
  affiliate_link: string;
  reason_to_promote: string;
  trending_score: number;
  vidiq_score?: SEOAudit;
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

export interface AppContext {
  activeTab: TabView;
  status: AppStatus;
  urlInput: string;
  activeKeys: number;
  knowledgeBase: KnowledgeBase;
}

/**
 * Addition: Metadata for A/B testing of video components (e.g. thumbnails)
 */
export interface ABTestMetadata {
  variant_a_url: string;
  variant_b_url: string;
  variant_a_ctr: number;
  variant_b_ctr: number;
  winner?: 'A' | 'B';
  test_started_at: number;
}

export interface CompletedVideo {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  timestamp: number;
  /**
   * Addition: Optional A/B test data for completed videos
   */
  ab_test?: ABTestMetadata;
}

export interface AgentCommand {
  action: 'NAVIGATE' | 'EXECUTE' | 'NOTIFY';
  payload: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  command?: AgentCommand;
  suggestions?: string[];
  sources?: { title: string; uri: string }[];
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: number;
}

/**
 * Addition: Support for channel health auditing reports
 */
export interface ChannelHealthReport {
  platform: string;
  channel_name: string;
  status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  recovery_estimate: string;
  health_score: number;
  ai_diagnosis: string;
  risks: {
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    medical_term: string;
    description: string;
  }[];
  action_plan: {
    task: string;
    instruction: string;
    priority: 'low' | 'normal' | 'urgent';
  }[];
}

/**
 * Addition: Autonomous governor intervention records
 */
export interface GovernorAction {
  id: string;
  action_type: string;
  timestamp: number;
  description: string;
  impact_score: number;
}

/**
 * Addition: Results from affiliate product scouting
 */
export interface AffiliateHuntResult {
  products: any[];
  strategy_note: string;
}

/**
 * Addition: Strategic intelligence gathered from scanning channels
 */
export interface ChannelIntelligence {
  [key: string]: any;
}

/**
 * Addition: Scheduled posting slots for automation
 */
export interface ScheduleSlot {
  slot_id: string;
  time_of_day: string;
  purpose: string;
  target_audience_activity: string;
}

/**
 * Addition: Deep autopsy results of competitor channels
 */
export interface CompetitorDeepAudit {
  channel_name: string;
  overall_strategy: string;
  success_probability: number;
  niche_authority_score: number;
  top_video_dissection: {
    timestamp: string;
    hook_analysis: string;
    visual_style: string;
    clone_blueprint: {
      prompt_equivalent: string;
    };
  }[];
}

/**
 * Addition: Optimized time recommendations for posting
 */
export interface GoldenHourRecommendation {
  time_label: string;
  score: number;
  reason: string;
}

/**
 * Addition: Real-time statistics for Auto-Pilot operations
 */
export interface AutoPilotStats {
  cyclesRun: number;
  videosCreated: number;
  postedCount: number;
  uptime: number;
}

/**
 * Addition: Log entries for Auto-Pilot activities
 */
export interface AutoPilotLog {
  timestamp: string;
  action: string;
  detail: string;
  status: 'success' | 'error' | 'warning' | 'info';
}

/**
 * Addition: Product entries for the AI Marketplace
 */
export interface AIProduct {
  id: string;
  product_name: string;
  commission_est: string;
  opportunity_score: number;
  reason_to_promote: string;
  affiliate_link: string;
  timestamp: number;
  strategy_note?: string;
}

/**
 * Addition: Geographical target regions for scouting
 */
export type TargetRegion = 'VN' | 'US' | 'GLOBAL';

/**
 * Addition: Individual task items in a batch production queue
 */
export interface BatchJobItem {
  id: string;
  input: string;
  status: 'queued' | 'analyzing' | 'scripting' | 'generating_assets' | 'rendering' | 'completed' | 'failed';
  progress: number;
  log: string;
}

/**
 * Addition: Base channel data for competitor dissection
 */
export interface CompetitorChannel {
  id: string;
  url: string;
  name: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
}
