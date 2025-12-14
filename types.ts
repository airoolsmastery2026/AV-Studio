

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
export type ScriptModel = 'Gemini 2.5 Flash' | 'Gemini 3 Pro' | 'GPT-4o';
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

export type TabView = 'campaign' | 'integrations' | 'queue' | 'analytics' | 'risk_center' | 'marketplace' | 'settings' | 'auto_pilot' | 'models' | 'studio' | 'docs';

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
  provider: 'google' | 'openai' | 'veo' | 'stitch' | 'wish' | 'switch' | 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'pinterest' | 'telegram' | 'shopee' | 'amazon' | 'ebay' | 'etsy' | 'walmart' | 'aliexpress' | 'upstash' | 'other' | 'zalo' | 'zalo_personal' | 'accesstrade' | 'clickbank' | 'digistore24' | 'cj' | 'masoffer' | 'ecomobi' | 'adflex' | 'lazada';
  category: 'model' | 'social' | 'affiliate' | 'storage';
  status: 'active' | 'quota_exceeded' | 'error';
  lastUsed?: string;
  credits?: CreditUsage;
}

// --- VIRAL DNA STUDIO PRO TYPES ---

export interface CompetitorChannel {
  id: string;
  url: string;
  name: string;
  status: 'pending' | 'analyzing' | 'done' | 'error';
  dna_score?: number; // How much "DNA" was extracted
  report?: {
      avg_duration: string;
      post_frequency: string;
      hook_style: string;
      algorithm_fit: number;
      risk_score: number;
      suggested_prompt: string;
  }
}

export interface ViralDNAProfile {
  structure: {
    hook_type: string; // e.g., "Negative Hook", "Visual Shock"
    pacing: 'Fast' | 'Moderate' | 'Slow';
    avg_scene_duration: number;
  };
  emotional_curve: string[]; // e.g., ["Curiosity", "Fear", "Relief", "Desire"]
  keywords: string[];
  algorithm_fit_score: number; // 0-100
  risk_level: 'Safe' | 'Moderate' | 'High';
  channel_breakdown?: CompetitorChannel[]; // Detailed breakdown for Studio Pro
}

export interface StudioSettings {
  // Video Settings
  quality: 'Draft' | 'Standard' | 'Ultra';
  aspectRatio: '9:16' | '16:9' | '1:1';
  model: 'Fast' | 'Balanced' | 'Cinematic';
  
  // Prompt Control
  hookStrength: number; // 1-10
  storyMode: 'One-shot' | 'Episodic' | 'Documentary';
  riskLevel: 'Safe' | 'Medium' | 'High';
  
  // Script Settings
  videoFormat: 'Shorts' | 'Long Form';
  language: 'vi' | 'en' | 'es';
  topic: string;
  
  // Generation
  generationMode: 'Free Storyboard' | 'Veo';

  // Consistency
  characterLock: boolean;
  styleLock: boolean;
  
  // Rendering
  musicSync: boolean;
}

// --- NEWLY ADDED TYPES ---

export interface KnowledgeBase {
    customInstructions: string;
    learnedPreferences: string[];
    autoImprovementEnabled: boolean;
    lastUpdated: number;
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

export interface AgentCommand {
  action: 'NAVIGATE' | 'SET_INPUT' | 'EXECUTE_RUN' | 'UPDATE_MEMORY';
  payload: any;
  reasoning?: string;
}

export interface NicheAnalysisResult {
    [key: string]: any;
}
export interface CompetitorAnalysisResult {
    [key: string]: any;
}

export interface AffiliateHuntResult {
  products: {
      product_name: string;
      network: string;
      commission_est: string;
      opportunity_score: number;
      affiliate_link: string;
      reason_to_promote: string;
      content_angle: string;
  }[];
  strategy_note: string;
}

export type TargetRegion = 'VN' | 'US' | 'GLOBAL';

export interface GoldenHourRecommendation {
  time_label: string;
  reason: string;
  score: number;
}

export interface ChannelHealthReport {
    channel_id?: string;
    channel_name: string;
    platform: 'tiktok' | 'youtube' | 'facebook' | 'instagram';
    health_score: number;
    status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
    metrics: {
        views_growth: string;
        avg_watch_time: string;
        ctr: string;
    };
    risks: {
        type: string;
        severity: string;
        description: string;
        detected_at?: number;
    }[];
    ai_diagnosis: string;
    action_plan: string[];
}

export interface HunterInsight {
  target_name: string;
  type: 'WINNING_PRODUCT' | 'VIRAL_CHANNEL' | 'NICHE_OPPORTUNITY';
  match_score: number;
  market_status: string;
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

export interface ScheduleSlot {
  slot_id: number;
  time_of_day: string;
  purpose: string;
  target_audience_activity: string;
}

export interface NetworkScanResult {
  scan_id: string;
  timestamp?: string;
  focus_area: string;
  market_summary?: string;
  targets: {
    rank: number;
    name: string;
    type: 'CHANNEL' | 'NICHE' | 'PROFILE';
    platform?: string;
    url: string;
    metrics: {
      rpm_est: string;
      search_volume: string;
      view_velocity: string;
      competition: string;
    };
    reason: string;
  }[];
}

export interface PostingJob {
    id: string;
    content_title: string;
    caption: string;
    hashtags: string[];
    platforms: string[];
    scheduled_time: number;
    status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
    thumbnail_url?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
    command?: AgentCommand;
}

export interface ChatSession {
    id: string;
    name: string;
    messages: ChatMessage[];
    createdAt: number;
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

export interface BatchJobItem {
  id: string;
  input: string;
  status: 'queued' | 'analyzing' | 'scripting' | 'generating_assets' | 'rendering' | 'completed' | 'failed';
  progress: number;
  log: string;
  result?: OrchestratorResponse;
  error?: string;
}

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
  uptime: number;
}
