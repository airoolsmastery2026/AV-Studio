
// Types for application configuration and state management
export type AppLanguage = 'vi' | 'en';
export type ContentLanguage = 'vi' | 'en' | 'es' | 'fr' | 'ja' | 'ko' | 'zh' | 'th';
export type ScriptModel = 'Gemini 3 Pro' | 'Gemini 3 Flash' | 'GPT-4o' | 'Grok 3' | 'Gemini 2.5 Flash';
export type VisualModel = 'VEO 3.1' | 'KLING 1.5' | 'HAILUO AI' | 'SORA' | 'IMAGEN 4';
export type VoiceModel = 'Google Chirp' | 'ElevenLabs Clone' | 'OpenAI TTS' | 'Vbee TTS';
export type VideoResolution = '1080p' | '4K' | '720p';
export type AspectRatio = '9:16' | '16:9' | '1:1';
export type TabView = 'campaign' | 'integrations' | 'queue' | 'analytics' | 'risk_center' | 'marketplace' | 'settings' | 'auto_pilot' | 'models' | 'studio' | 'docs';

export interface ABTestMetadata {
  variant_a_url: string;
  variant_b_url: string;
  variant_a_ctr: number;
  variant_b_ctr: number;
  winner?: 'A' | 'B';
  test_started_at: number;
}

export interface PlatformPolicy {
  platform: string;
  last_updated: number;
  critical_changes: string[];
  compliance_score: number;
  ai_label_required: boolean;
  new_restrictions: string[];
}

export interface BrandDNA {
  character_lock_id?: string;
  character_description?: string;
  color_palette: string[];
  typography: string;
  visual_style: string;
  voice_id: string;
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

export interface VideoDissection {
  timestamp: string;
  hook_analysis: string;
  retention_strategy: string;
  visual_style: string;
  visual_pacing_ms: number;
  clone_blueprint: {
    prompt_equivalent: string;
    suggested_pacing: string;
    script_structure: string[];
  };
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
  brand_dna?: BrandDNA;
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

export interface Scene {
  scene_id: string;
  start: number;
  duration: number;
  vo_text: string;
  visual_cues: string;
  model_choice: 'VEO' | 'IMAGEN' | 'GEMINI_VIDEO';
  character_seed?: string;
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
    scenes: Scene[];
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
  lastUsed?: string;
  health_metrics?: {
    latency: number;
    remaining_quota: string;
    validation_status: 'valid' | 'invalid' | 'unknown';
  };
  extra_fields?: Record<string, string>;
}

export interface PostingJob {
  id: string;
  content_title: string;
  caption: string;
  hashtags: string[];
  platforms: string[];
  scheduled_time: number;
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  video_url?: string;
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
  commission_est?: string;
  opportunity_score?: number;
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

export interface CompletedVideo {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  timestamp: number;
  ab_test?: ABTestMetadata;
}

export interface ChannelHealthReport {
  channel_name: string;
  platform: string;
  health_score: number;
  status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  risks: { type: string; severity: 'LOW' | 'MEDIUM' | 'HIGH'; description: string; medical_term: string; }[];
  action_plan: { task: string; instruction: string; priority: 'urgent' | 'routine'; }[];
  recovery_estimate: string;
  ai_diagnosis: string;
}

export interface GovernorAction {
  id: string;
  timestamp: number;
  action_type: string;
  description: string;
  before: string;
  after: string;
  impact_score: number;
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

export interface AgentCommand {
  action: 'NAVIGATE' | 'EXECUTE' | 'NOTIFY';
  payload: any;
}

export interface CompetitorDeepAudit {
  channel_name: string;
  overall_strategy: string;
  success_probability: number;
  niche_authority_score: number;
  top_video_dissection: VideoDissection[];
}

export interface AIProduct extends MissionIntel {
  id: string;
  opportunity_score: number;
  commission_est: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  command?: AgentCommand;
  detected_lang?: string;
  sentiment?: string;
  suggestions?: string[];
  sources?: { title: string; uri: string }[];
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

export interface AffiliateHuntResult {
  products: MissionIntel[];
  strategy_note: string;
}

export interface ChannelIntelligence {
  channel_name: string;
  niche: string;
  monetization_strategies: string[];
  content_pillars: string[];
  product_categories: string[];
}

export interface ScheduleSlot {
  slot_id: string;
  time_of_day: string;
  purpose: string;
  target_audience_activity: string;
}
