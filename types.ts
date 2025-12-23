
export enum AppStatus {
  IDLE = 'idle',
  HUNTING = 'hunting',
  PLANNING = 'planning',
  RENDERING = 'rendering',
  SCHEDULING = 'scheduling',
  ERROR = 'error'
}

export type TabView = 'studio' | 'auto_pilot' | 'campaign' | 'analytics' | 'marketplace' | 'risk_center' | 'queue' | 'settings' | 'docs';

export interface ApiKeyConfig {
  id: string;
  alias: string;
  key: string;
  provider: string;
  category: 'social' | 'affiliate' | 'google';
  status: 'active' | 'inactive';
  extra_fields?: Record<string, string>;
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

export interface PlatformPolicy {
  platform: string;
  rules: string[];
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
  detail: string;
  status: 'success' | 'error' | 'warning' | 'info';
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

export interface MissionIntel {
  product_name: string;
  trending_score: number;
  commission_rate: string;
  reason_to_promote: string;
  affiliate_link: string;
}

export interface CompletedVideo {
  id: string;
  url: string;
  thumbnail?: string;
  title: string;
  timestamp: number;
  keywords?: string[];
  ab_test?: ABTestMetadata;
}

export type ScriptModel = 'Gemini 3 Pro' | 'Gemini 3 Flash' | 'GPT-4o' | 'Grok 3' | 'Gemini 2.5 Flash';
export type VisualModel = 'VEO 3.1' | 'KLING 1.5' | 'HAILUO AI' | 'SORA' | 'IMAGEN 4' | 'VEO 3.1';
export type VoiceModel = 'Google Chirp' | 'ElevenLabs Clone' | 'OpenAI TTS' | 'Vbee TTS';
export type VideoResolution = '1080p' | '4K' | '720p';
export type AspectRatio = '9:16' | '16:9' | '1:1';
export type ContentLanguage = 'vi' | 'en';
export type AppLanguage = 'vi' | 'en';

export interface OrchestratorResponse {
  market_scoring: {
    tiktok_potential: number;
  };
  audience_personas: {
    id: string;
    name: string;
    behavior: string;
  }[];
  generated_content: {
    title: string;
    description: string;
    hashtags: string[];
    thumbnail_prompt: string;
  };
  production_plan: {
    script_master: string;
    technical_specs: {
      ratio: AspectRatio;
    };
    scenes: {
      vo_text: string;
      visual_cues: string;
    }[];
  };
  deep_analysis: {
    winning_angle: string;
  };
}

export interface SEOAudit {
  seo_score: number;
  title_optimization_suggestions: string[];
  suggested_tags: string[];
}

export interface ViralDNAProfile {
  keywords: string[];
  algorithm_fit_score: number;
  risk_level: string;
  structure: {
    hook_type: string;
    pacing: string;
    avg_scene_duration: number;
    visual_pacing_avg?: number;
  };
  emotional_curve: string[];
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

export interface AppContext {
  activeTab: TabView;
  status: AppStatus;
  urlInput: string;
  activeKeys: number;
  knowledgeBase: KnowledgeBase;
}

export interface ChannelHealthReport {
  channel_name: string;
  platform: string;
  status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  health_score: number;
  recovery_estimate: string;
  risks: {
    type: string;
    medical_term: string;
    description: string;
    severity: 'MEDIUM' | 'HIGH';
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
  timestamp: number;
  action_type: string;
  description: string;
  impact_score: number;
}

export interface AffiliateHuntResult {
  products: MissionIntel[];
  strategy_note: string;
}

export interface ChannelIntelligence {
  channel_name: string;
  subscribers: string;
  niche: string;
  top_videos: string[];
}

export interface ScheduleSlot {
  slot_id: string;
  time_of_day: string;
  purpose: string;
  target_audience_activity: string;
}

export interface CompetitorDeepAudit {
  seo_score: number;
}

export interface GoldenHourRecommendation {
  time_label: string;
  score: number;
  reason: string;
}

export interface YouTubeTrend {
  keyword: string;
  volume: string;
  competition: string;
  potential_ctr: number;
}

export interface AgentCommand {
  action: 'NAVIGATE' | 'EXECUTE';
  payload: string;
}

export interface AIProduct {
  id: string;
  product_name: string;
  commission_est: string;
  opportunity_score: number;
  reason_to_promote: string;
  affiliate_link: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  command?: AgentCommand;
  suggestions?: string[];
  sources?: any[];
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

export interface CompetitorChannel {
  id: string;
  url: string;
  name: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
}

export interface ABTestMetadata {
  variant_a_url: string;
  variant_b_url: string;
  variant_a_ctr: number;
  variant_b_ctr: number;
  test_started_at: number;
  winner?: 'A' | 'B';
}

export interface AIMarketReport {
  sub_niche: string;
  growth_velocity: number; // 0-100
  bounty_score: number; // 0-100
  monetization_logic: string;
  top_products: {
    name: string;
    avg_commission: string;
    network: string;
    entry_barrier: 'Low' | 'Medium' | 'High';
  }[];
}
