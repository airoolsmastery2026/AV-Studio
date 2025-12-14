
import { GoogleGenAI, Type } from "@google/genai";
import { 
  OrchestratorResponse, SourceMetadata, ContentWorkflow, AppContext, AgentCommand, 
  NicheAnalysisResult, CompetitorAnalysisResult, AffiliateHuntResult, 
  GoldenHourRecommendation, TargetRegion, ChannelHealthReport, HunterInsight, 
  ScheduleSlot, NetworkScanResult, ViralDNAProfile, StudioSettings, 
  ContentLanguage 
} from "../types";

// --- STRICT LANGUAGE PROTOCOL (LAYER 3) ---
// This text block is injected into every System Instruction to ensure the AI 
// strictly adheres to the requested Output Language, regardless of the prompt's language or UI.
const STRICT_LANGUAGE_PROTOCOL = `
*** CRITICAL SYSTEM DIRECTIVE: LANGUAGE LOCK ***
1. YOU ARE LOCKED TO THE TARGET LANGUAGE: {{TARGET_LANGUAGE}}.
2. ALL OUTPUT (Thought process, Analysis, Script, Metadata) MUST BE IN {{TARGET_LANGUAGE}}.
3. IF SOURCE CONTENT IS IN A DIFFERENT LANGUAGE, YOU MUST TRANSLATE AND LOCALIZE IT FULLY TO {{TARGET_LANGUAGE}}.
4. DO NOT MIX LANGUAGES.
5. NO "VIET-ENGLISH" or "CHINGLISH". PURE, NATURAL {{TARGET_LANGUAGE}}.
`;

// Helper to get language name for prompt injection
const getLanguageName = (lang: ContentLanguage | undefined): string => {
    switch(lang) {
        case 'en': return "ENGLISH (US)";
        case 'es': return "SPANISH (Español)";
        case 'jp': return "JAPANESE (日本語)";
        case 'cn': return "CHINESE (中文)";
        case 'vi': 
        default: return "VIETNAMESE (Tiếng Việt)";
    }
};

const SYSTEM_INSTRUCTION_DNA_EXTRACTOR = `
You are the **VIRAL DNA ANALYZER**.
Your task is to analyze metadata from competitor channels/videos and extract their "Viral DNA" structure.

${STRICT_LANGUAGE_PROTOCOL}

**INPUT:** List of URLs from competitor channels or file names.

**OUTPUT:** A JSON object representing the 'ViralDNAProfile'.
- **Structure:** Common hook types, pacing, duration.
- **Emotional Curve:** Typical emotional flow.
- **Keywords:** High-frequency keywords (in TARGET LANGUAGE).
- **Channel Breakdown:** Specific analysis for each input channel.
`;

const SYSTEM_INSTRUCTION_PRO_STUDIO_WRITER = `
You are the **PRO SCRIPT GENERATOR AI**.
You generate scripts specifically optimized for **High RPM, High CPM, and Maximum Watch Time**.

${STRICT_LANGUAGE_PROTOCOL}

**CORE PHILOSOPHY: RETENTION IS KING.**
Your goal is NOT to sell a product. Your goal is to keep the viewer watching as long as possible.

**RULES:**
1. **NO SALES PITCH:** Do not sell anything. Focus on value, entertainment, or shock factor.
2. **ALGORITHM HACKING:** Use patterns that trigger the algorithm (Loops, Open Loops, Curiosity Gaps).
3. **ORIGINALITY:** Create 100% NEW CONTENT based on the DNA structure. DO NOT CLONE/COPY TEXT.
4. **LANGUAGE:** Must correspond exactly to {{TARGET_LANGUAGE}}.

**OUTPUT:** A comprehensive JSON object containing the script, visual cues, and technical direction.
`;

export const classifyInput = async (apiKey: string, url: string): Promise<{ type: 'channel' | 'product', strategy: ContentWorkflow }> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Analyze this URL: ${url}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['channel', 'product'] },
          strategy: { type: Type.STRING, enum: ['VIRAL_CLONE', 'REVIEW_TUTORIAL', 'NEWS_SUMMARY'] }
        },
        required: ['type', 'strategy']
      }
    }
  });
  if (!response.text) return { type: 'product', strategy: 'REVIEW_TUTORIAL' }; 
  return JSON.parse(response.text);
};

export const generateVideoPlan = async (
  apiKey: string,
  metadata: SourceMetadata
): Promise<OrchestratorResponse> => {
  const ai = new GoogleGenAI({ apiKey });

  const effectiveStrategy = metadata.detected_strategy || 'VIRAL_CLONE';
  const videoConfig = metadata.video_config || {
      resolution: '1080p',
      aspectRatio: '9:16',
      visualModel: 'SORA',
      scriptModel: 'Gemini 2.5 Flash',
      voiceModel: 'Google Chirp',
      outputLanguage: 'vi'
  };

  const targetLang = getLanguageName(videoConfig.outputLanguage);
  const strictProtocol = STRICT_LANGUAGE_PROTOCOL.replace(/{{TARGET_LANGUAGE}}/g, targetLang);

  const SYSTEM_INSTRUCTION_FINAL = `
    ${strictProtocol}
    **TECHNICAL SPECIFICATION:**
    - Resolution: ${videoConfig.resolution}
    - Aspect Ratio: ${videoConfig.aspectRatio}
    **METADATA GENERATION:**
    - Title (In ${targetLang}).
    - Description (In ${targetLang}).
    - Hashtags.
  `;

  const prompt = `
    PERFORM DEEP ANALYSIS AND GENERATE PLAN.
    URL: ${metadata.url}
    User Notes: ${metadata.notes || "None"}
    OUTPUT LANGUAGE: ${targetLang}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_FINAL,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          market_scoring: {
            type: Type.OBJECT,
            properties: {
              tiktok_potential: { type: Type.NUMBER },
              youtube_shorts_potential: { type: Type.NUMBER },
              estimated_cpm: { type: Type.STRING },
            },
            required: ["tiktok_potential", "youtube_shorts_potential", "estimated_cpm"],
          },
          audience_personas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                age_range: { type: Type.STRING },
                interests: { type: Type.ARRAY, items: { type: Type.STRING } },
                behavior: { type: Type.STRING },
                script_tone: { type: Type.STRING },
              },
              required: ["id", "name", "age_range", "interests", "script_tone"],
            },
          },
          deep_analysis: {
            type: Type.OBJECT,
            properties: {
              viral_dna: { type: Type.ARRAY, items: { type: Type.STRING } },
              psychological_triggers: { type: Type.ARRAY, items: { type: Type.STRING } },
              competitor_gap: { type: Type.STRING },
              winning_angle: { type: Type.STRING },
              monetization_strategy: { type: Type.STRING },
              content_strategy: { type: Type.STRING }
            },
            required: ["viral_dna", "psychological_triggers", "competitor_gap", "winning_angle", "monetization_strategy", "content_strategy"],
          },
          production_plan: {
            type: Type.OBJECT,
            properties: {
              script_master: { type: Type.STRING },
              technical_specs: {
                 type: Type.OBJECT,
                 properties: {
                     resolution: { type: Type.STRING },
                     ratio: { type: Type.STRING },
                     fps: { type: Type.NUMBER }
                 },
                 required: ["resolution", "ratio", "fps"]
              },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    scene_id: { type: Type.STRING },
                    start: { type: Type.NUMBER },
                    duration: { type: Type.NUMBER },
                    vo_text: { type: Type.STRING },
                    visual_cues: { type: Type.STRING },
                    model_choice: { type: Type.STRING },
                    priority: { type: Type.STRING },
                  },
                  required: ["scene_id", "vo_text", "visual_cues", "model_choice"],
                },
              },
            },
            required: ["script_master", "scenes", "technical_specs"],
          },
          generated_content: { 
             type: Type.OBJECT,
             properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                thumbnail_prompt: { type: Type.STRING }
             },
             required: ["title", "description", "hashtags"]
          },
          consent_log: {
            type: Type.OBJECT,
            properties: {
              user_confirmed_clone: { type: Type.BOOLEAN },
              timestamp: { type: Type.STRING },
            },
            required: ["user_confirmed_clone", "timestamp"],
          },
        },
        required: ["market_scoring", "audience_personas", "deep_analysis", "production_plan", "consent_log", "generated_content"],
      },
    }
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text) as OrchestratorResponse;
};

export const extractViralDNA = async (apiKey: string, sources: string[], additionalContext?: string, language: ContentLanguage = 'vi'): Promise<ViralDNAProfile> => {
  const ai = new GoogleGenAI({ apiKey });
  let prompt = `
    ANALYZE COMPETITORS: ${sources.join(', ')}
    EXTRACT VIRAL DNA STRUCTURE.
  `;
  
  if (additionalContext) {
      prompt += `\n\nADDITIONAL CONTEXT: "${additionalContext}"`;
  }

  const targetLang = getLanguageName(language);
  const strictSystemInstruction = SYSTEM_INSTRUCTION_DNA_EXTRACTOR.replace(/{{TARGET_LANGUAGE}}/g, targetLang);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", 
    contents: prompt,
    config: {
      systemInstruction: strictSystemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          structure: {
            type: Type.OBJECT,
            properties: {
              hook_type: { type: Type.STRING },
              pacing: { type: Type.STRING, enum: ['Fast', 'Moderate', 'Slow'] },
              avg_scene_duration: { type: Type.NUMBER }
            },
            required: ['hook_type', 'pacing', 'avg_scene_duration']
          },
          emotional_curve: { type: Type.ARRAY, items: { type: Type.STRING } },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          algorithm_fit_score: { type: Type.NUMBER },
          risk_level: { type: Type.STRING, enum: ['Safe', 'Moderate', 'High'] },
          channel_breakdown: {
              type: Type.ARRAY,
              items: {
                  type: Type.OBJECT,
                  properties: {
                      report: {
                          type: Type.OBJECT,
                          properties: {
                              avg_duration: { type: Type.STRING },
                              post_frequency: { type: Type.STRING },
                              hook_style: { type: Type.STRING },
                              algorithm_fit: { type: Type.NUMBER },
                              risk_score: { type: Type.NUMBER },
                              suggested_prompt: { type: Type.STRING }
                          },
                          required: ['avg_duration', 'post_frequency', 'hook_style', 'algorithm_fit', 'risk_score', 'suggested_prompt']
                      }
                  },
                  required: ['report']
              }
          }
        },
        required: ['structure', 'emotional_curve', 'keywords', 'algorithm_fit_score', 'risk_level']
      }
    }
  });

  if (!response.text) throw new Error("Failed to extract DNA");
  return JSON.parse(response.text) as ViralDNAProfile;
};

export const generateProScript = async (
  apiKey: string, 
  dna: ViralDNAProfile, 
  settings: StudioSettings
): Promise<OrchestratorResponse> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    GENERATE PRO SCRIPT.
    DNA PROFILE: ${JSON.stringify(dna)}
    SETTINGS: ${JSON.stringify(settings)}
  `;

  const targetLang = getLanguageName(settings.contentLanguage);
  const strictSystemInstruction = SYSTEM_INSTRUCTION_PRO_STUDIO_WRITER.replace(/{{TARGET_LANGUAGE}}/g, targetLang);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: strictSystemInstruction,
      responseMimeType: "application/json",
      // ... Same Schema as generateVideoPlan ...
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          market_scoring: {
            type: Type.OBJECT,
            properties: {
              tiktok_potential: { type: Type.NUMBER },
              youtube_shorts_potential: { type: Type.NUMBER },
              estimated_cpm: { type: Type.STRING },
            },
            required: ["tiktok_potential", "youtube_shorts_potential", "estimated_cpm"],
          },
          audience_personas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                age_range: { type: Type.STRING },
                interests: { type: Type.ARRAY, items: { type: Type.STRING } },
                behavior: { type: Type.STRING },
                script_tone: { type: Type.STRING },
              },
              required: ["id", "name", "age_range", "interests", "script_tone"],
            },
          },
          deep_analysis: {
            type: Type.OBJECT,
            properties: {
              viral_dna: { type: Type.ARRAY, items: { type: Type.STRING } },
              psychological_triggers: { type: Type.ARRAY, items: { type: Type.STRING } },
              competitor_gap: { type: Type.STRING },
              winning_angle: { type: Type.STRING },
              monetization_strategy: { type: Type.STRING },
              content_strategy: { type: Type.STRING }
            },
            required: ["viral_dna", "psychological_triggers", "competitor_gap", "winning_angle", "monetization_strategy", "content_strategy"],
          },
          production_plan: {
            type: Type.OBJECT,
            properties: {
              script_master: { type: Type.STRING },
              technical_specs: {
                 type: Type.OBJECT,
                 properties: {
                     resolution: { type: Type.STRING },
                     ratio: { type: Type.STRING },
                     fps: { type: Type.NUMBER }
                 },
                 required: ["resolution", "ratio", "fps"]
              },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    scene_id: { type: Type.STRING },
                    start: { type: Type.NUMBER },
                    duration: { type: Type.NUMBER },
                    vo_text: { type: Type.STRING },
                    visual_cues: { type: Type.STRING },
                    model_choice: { type: Type.STRING },
                    priority: { type: Type.STRING },
                  },
                  required: ["scene_id", "vo_text", "visual_cues", "model_choice"],
                },
              },
            },
            required: ["script_master", "scenes", "technical_specs"],
          },
          generated_content: { 
             type: Type.OBJECT,
             properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                thumbnail_prompt: { type: Type.STRING }
             },
             required: ["title", "description", "hashtags"]
          },
          consent_log: {
            type: Type.OBJECT,
            properties: {
              user_confirmed_clone: { type: Type.BOOLEAN },
              timestamp: { type: Type.STRING },
            },
            required: ["user_confirmed_clone", "timestamp"],
          },
        },
        required: ["market_scoring", "audience_personas", "deep_analysis", "production_plan", "consent_log", "generated_content"],
      },
    }
  });

  if (!response.text) throw new Error("Studio failed to generate script");
  return JSON.parse(response.text) as OrchestratorResponse;
}

// ... Exports (stubs for brevity) ...
export const runHunterAnalysis = async (apiKey: string, query: string): Promise<HunterInsight> => { return {} as any; } 
export const scanHighValueNetwork = async (apiKey: string, focusArea: string): Promise<NetworkScanResult> => { return {} as any; }
export const predictGoldenHours = async (apiKey: string, region: string, niche: string, platforms: string[]): Promise<GoldenHourRecommendation[]> => { return [] as any; }
export const generateDailySchedule = async (apiKey: string, accountName: string, niche: string, region: string, config: any): Promise<ScheduleSlot[]> => { return [] as any; }
export const generateChannelAudit = async (apiKey: string, channelName: string, platform: string): Promise<ChannelHealthReport> => { return {} as any; }
export const sendChatToAssistant = async (apiKey: string, history: any[], message: string, appContext: AppContext): Promise<{ text: string, command?: AgentCommand }> => { return {} as any; }
export const huntAffiliateProducts = async (apiKey: string, niche: string, networks: string[]): Promise<AffiliateHuntResult> => { return {} as any; }
