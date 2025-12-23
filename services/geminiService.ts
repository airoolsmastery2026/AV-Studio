
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
  OrchestratorResponse, SEOAudit, MissionIntel, 
  ViralDNAProfile, StudioSettings, KnowledgeBase, 
  AppContext, PlatformPolicy, ChannelHealthReport, GovernorAction,
  AffiliateHuntResult, ChannelIntelligence, ScheduleSlot, CompetitorDeepAudit, GoldenHourRecommendation
} from "../types";

// Always initialize the client with the API key from environment variables.
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Global state to track API health and prevent spamming an exhausted quota
let isQuotaExhausted = false;
let exhaustionResetTime = 0;
let lastGroundingRequestTime = 0;
let activeRequestsCount = 0;

// Configurable constants for Free Tier stability
const MAX_CONCURRENT_GROUNDING_REQUESTS = 1; 
const MANDATORY_GAP_MS = 30000; // 30s gap between any search grounding calls (2 RPM safety)

export const getApiHealthStatus = () => {
  const now = Date.now();
  if (isQuotaExhausted && now < exhaustionResetTime) {
    return { 
      status: 'exhausted', 
      remainingCooldown: Math.ceil((exhaustionResetTime - now) / 1000) 
    };
  }
  
  // Check if we are currently in a mandatory gap delay
  const timeSinceLast = now - lastGroundingRequestTime;
  if (timeSinceLast < MANDATORY_GAP_MS && activeRequestsCount === 0) {
     return { 
       status: 'throttled', 
       remainingCooldown: Math.ceil((MANDATORY_GAP_MS - timeSinceLast) / 1000) 
     };
  }

  isQuotaExhausted = false;
  return { status: 'healthy' };
};

// Utility to clean AI response text and parse it as JSON.
const cleanAndParseJSON = (text: string) => {
  try {
    if (!text) return null;
    const cleanedText = text.replace(/```json\n?|```/g, "").trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleanedText);
  } catch (e) {
    console.error("Critical: JSON Parsing failed. Raw response:", text);
    throw new Error("AI_JSON_PARSE_ERROR");
  }
};

/**
 * Enhanced retry wrapper with global lockout and mandatory inter-request pacing.
 */
async function callAiWithRetry<T>(
  apiCall: () => Promise<T>,
  retries = 2, 
  initialDelay = 15000 
): Promise<T> {
  const health = getApiHealthStatus();
  if (health.status === 'exhausted') {
    throw new Error(`API_QUOTA_COOLDOWN:${health.remainingCooldown}`);
  }

  while (activeRequestsCount >= MAX_CONCURRENT_GROUNDING_REQUESTS) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (getApiHealthStatus().status === 'exhausted') throw new Error("QUOTA_EXHAUSTED_LOCKOUT");
  }

  const now = Date.now();
  const timeSinceLast = now - lastGroundingRequestTime;
  if (timeSinceLast < MANDATORY_GAP_MS) {
    const waitTime = MANDATORY_GAP_MS - timeSinceLast;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  activeRequestsCount++;

  try {
    const result = await apiCall();
    lastGroundingRequestTime = Date.now();
    return result;
  } catch (error: any) {
    const errorStr = JSON.stringify(error);
    const isRateLimit = errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED');
    
    if (isRateLimit) {
      if (retries > 0) {
        lastGroundingRequestTime = Date.now() + initialDelay; 
        activeRequestsCount--; 
        await new Promise(resolve => setTimeout(resolve, initialDelay));
        return callAiWithRetry(apiCall, retries - 1, initialDelay * 2); 
      } else {
        isQuotaExhausted = true;
        exhaustionResetTime = Date.now() + 600000; 
        throw new Error("QUOTA_EXHAUSTED_LOCKOUT");
      }
    }
    throw error;
  } finally {
    activeRequestsCount--;
  }
}

/**
 * PRODUCTION ENGINE: Render Video with Veo 3.1
 */
export const generateVeoVideo = async (prompt: string, aspectRatio: "16:9" | "9:16" = "9:16"): Promise<string> => {
  const ai = getAi();
  
  // Checking for API Key selection (Required for Veo)
  if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
    await window.aistudio.openSelectKey();
  }

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio: aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("VIDEO_GENERATION_FAILED");

  return `${downloadLink}&key=${process.env.API_KEY}`;
};

/**
 * ASSET ENGINE: Create Thumbnails with Imagen 4
 */
export const generateAIImage = async (prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1"): Promise<string> => {
  const ai = getAi();
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: aspectRatio,
    },
  });

  const base64EncodeString = response.generatedImages[0].image.imageBytes;
  return `data:image/jpeg;base64,${base64EncodeString}`;
};

/**
 * Platform Policy Scout using Google Search Grounding.
 */
export const syncPlatformPolicies = async (platforms: string[]): Promise<PlatformPolicy[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `BẠN LÀ CHUYÊN GIA PHÁP LÝ THUẬT TOÁN. Sử dụng Google Search tìm chính sách mới nhất cho các nền tảng: ${platforms.join(', ')}.`,
      config: { 
        responseMimeType: "application/json", 
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              platform: { type: Type.STRING },
              last_updated: { type: Type.NUMBER },
              critical_changes: { type: Type.ARRAY, items: { type: Type.STRING } },
              compliance_score: { type: Type.NUMBER },
              ai_label_required: { type: Type.BOOLEAN },
              new_restrictions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['platform', 'last_updated', 'critical_changes', 'compliance_score', 'ai_label_required', 'new_restrictions']
          }
        }
      }
    });
    return cleanAndParseJSON(response.text) || [];
  });
};

/**
 * Multimodal Video DNA Dissection.
 */
export const extractViralDNA = async (apiKey: string, urls: string[], mode: string, lang: string): Promise<ViralDNAProfile> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `GIẢI PHẪU DNA VIRAL cho các URL: ${urls.join(', ')}. Trả về JSON ViralDNAProfile.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            structure: {
              type: Type.OBJECT,
              properties: {
                hook_type: { type: Type.STRING },
                pacing: { type: Type.STRING, enum: ['Fast', 'Moderate', 'Slow'] },
                avg_scene_duration: { type: Type.NUMBER },
                visual_pacing_avg: { type: Type.NUMBER }
              },
              required: ['hook_type', 'pacing', 'avg_scene_duration']
            },
            emotional_curve: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            algorithm_fit_score: { type: Type.NUMBER },
            risk_level: { type: Type.STRING, enum: ['Safe', 'Moderate', 'High'] },
            brand_dna: {
              type: Type.OBJECT,
              properties: {
                character_description: { type: Type.STRING },
                visual_style: { type: Type.STRING },
                color_palette: { type: Type.ARRAY, items: { type: Type.STRING } },
                typography: { type: Type.STRING },
                voice_id: { type: Type.STRING }
              }
            }
          },
          required: ['structure', 'emotional_curve', 'keywords', 'algorithm_fit_score', 'risk_level']
        }
      }
    });
    return cleanAndParseJSON(response.text) || {};
  });
};

/**
 * Script generation with Character Lock.
 */
export const generateProScript = async (apiKey: string, dna: ViralDNAProfile, settings: StudioSettings, kb: KnowledgeBase): Promise<OrchestratorResponse> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const policyGuard = kb.platformPolicies.map(p => `${p.platform}: AI Label=${p.ai_label_required}`).join('; ');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Tạo kịch bản PHÁI SINH từ DNA: ${JSON.stringify(dna)}. Chủ đề: ${settings.topic}. Chính sách: ${policyGuard}`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            market_scoring: {
              type: Type.OBJECT,
              properties: {
                tiktok_potential: { type: Type.NUMBER },
                youtube_shorts_potential: { type: Type.NUMBER },
                estimated_cpm: { type: Type.STRING }
              },
              required: ['tiktok_potential', 'youtube_shorts_potential', 'estimated_cpm']
            },
            audience_personas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  behavior: { type: Type.STRING },
                  interests: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['id', 'name', 'behavior', 'interests']
              }
            },
            deep_analysis: {
              type: Type.OBJECT,
              properties: {
                viral_dna: { type: Type.ARRAY, items: { type: Type.STRING } },
                winning_angle: { type: Type.STRING },
                monetization_strategy: { type: Type.STRING }
              },
              required: ['viral_dna', 'winning_angle', 'monetization_strategy']
            },
            production_plan: {
              type: Type.OBJECT,
              properties: {
                technical_specs: {
                  type: Type.OBJECT,
                  properties: {
                    ratio: { type: Type.STRING },
                    resolution: { type: Type.STRING }
                  },
                  required: ['ratio', 'resolution']
                },
                script_master: { type: Type.STRING },
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
                      character_seed: { type: Type.STRING }
                    },
                    required: ['scene_id', 'start', 'duration', 'vo_text', 'visual_cues', 'model_choice']
                  }
                }
              },
              required: ['technical_specs', 'script_master', 'scenes']
            },
            generated_content: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                thumbnail_prompt: { type: Type.STRING }
              },
              required: ['title', 'description', 'hashtags', 'thumbnail_prompt']
            }
          },
          required: ['market_scoring', 'audience_personas', 'deep_analysis', 'production_plan', 'generated_content']
        }
      }
    });
    return cleanAndParseJSON(response.text) || {};
  });
};

/**
 * SEO Audit performing comparative analysis.
 */
export const runSeoAudit = async (title: string, description: string, topic: string): Promise<SEOAudit> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Đóng vai VidIQ Pro. Thực hiện SEO Audit cho nội dung: "${title}". So sánh với dữ liệu Search thực tế từ Google.`,
      config: { 
        responseMimeType: "application/json", 
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seo_score: { type: Type.NUMBER },
            keyword_difficulty: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
            search_volume_score: { type: Type.NUMBER },
            trending_momentum: { type: Type.NUMBER },
            suggested_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            checklist: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  completed: { type: Type.BOOLEAN },
                  impact: { type: Type.STRING }
                }
              }
            },
            title_optimization_suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            description_optimized: { type: Type.STRING }
          },
          required: ['seo_score', 'keyword_difficulty', 'search_volume_score', 'suggested_tags', 'checklist', 'title_optimization_suggestions', 'description_optimized']
        }
      }
    });
    return cleanAndParseJSON(response.text) || {};
  });
};

/**
 * Affiliate Hunter Engine.
 */
export const huntAffiliateProducts = async (apiKey: string, niche: string, networks: string[]): Promise<AffiliateHuntResult> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `SĂN TÌM SẢN PHẨM AFFILIATE TRENDING cho ngách ${niche}. Dùng Google Search tìm sản phẩm 'Rising Star'.`,
      config: { 
        responseMimeType: "application/json", 
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  product_name: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  commission_rate: { type: Type.STRING },
                  affiliate_link: { type: Type.STRING },
                  reason_to_promote: { type: Type.STRING },
                  trending_score: { type: Type.NUMBER }
                },
                required: ['product_name', 'platform', 'commission_rate', 'affiliate_link', 'reason_to_promote', 'trending_score']
              }
            },
            strategy_note: { type: Type.STRING }
          },
          required: ['products', 'strategy_note']
        }
      }
    });
    return cleanAndParseJSON(response.text) || { products: [], strategy_note: "" };
  });
};

/**
 * Channel Health Diagnosis.
 */
export const generateChannelAudit = async (apiKey: string, channel: string, platform: string): Promise<ChannelHealthReport> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `CHẨN ĐOÁN KÊNH ${channel} trên ${platform}. Dùng Google Search quét tín hiệu bóp Reach.`,
      config: { 
        responseMimeType: "application/json", 
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            channel_name: { type: Type.STRING },
            platform: { type: Type.STRING },
            health_score: { type: Type.NUMBER },
            status: { type: Type.STRING, enum: ['HEALTHY', 'AT_RISK', 'CRITICAL'] },
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
                  description: { type: Type.STRING },
                  medical_term: { type: Type.STRING }
                }
              }
            },
            action_plan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  instruction: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['urgent', 'routine'] }
                }
              }
            },
            recovery_estimate: { type: Type.STRING },
            ai_diagnosis: { type: Type.STRING }
          },
          required: ['channel_name', 'platform', 'health_score', 'status', 'risks', 'action_plan', 'recovery_estimate', 'ai_diagnosis']
        }
      }
    });
    return cleanAndParseJSON(response.text) || {};
  });
};

/**
 * Autonomous Governor execution.
 */
export const runGovernorExecution = async (channel: string, diagnosis: string): Promise<GovernorAction> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `THỰC THI TỰ TRỊ: Sửa lỗi cho kênh ${channel} dựa trên chẩn đoán: ${diagnosis}.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            timestamp: { type: Type.NUMBER },
            action_type: { type: Type.STRING },
            description: { type: Type.STRING },
            before: { type: Type.STRING },
            after: { type: Type.STRING },
            impact_score: { type: Type.NUMBER }
          },
          required: ['id', 'timestamp', 'action_type', 'description', 'before', 'after', 'impact_score']
        }
      }
    });
    return cleanAndParseJSON(response.text) || {};
  });
};

/**
 * Smart Scheduler.
 */
export const generateDailySchedule = async (apiKey: string, channel: string, niche: string, region: string, config: any): Promise<ScheduleSlot[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Lập lịch đăng bài cho ${channel} ngách ${niche} vùng ${region}.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              slot_id: { type: Type.STRING },
              time_of_day: { type: Type.STRING },
              purpose: { type: Type.STRING },
              target_audience_activity: { type: Type.STRING }
            },
            required: ['slot_id', 'time_of_day', 'purpose', 'target_audience_activity']
          }
        }
      }
    });
    return cleanAndParseJSON(response.text) || [];
  });
};

/**
 * Channel Intelligence extraction.
 */
export const scanChannelIntelligence = async (url: string): Promise<ChannelIntelligence> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `TRINH SÁT KÊNH: ${url}. Dùng Google Search trích xuất chiến lược.`,
      config: { 
        responseMimeType: "application/json", 
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            channel_name: { type: Type.STRING },
            niche: { type: Type.STRING },
            monetization_strategies: { type: Type.ARRAY, items: { type: Type.STRING } },
            content_pillars: { type: Type.ARRAY, items: { type: Type.STRING } },
            product_categories: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['channel_name', 'niche', 'monetization_strategies', 'content_pillars', 'product_categories']
        }
      }
    });
    return cleanAndParseJSON(response.text) || {};
  });
};

/**
 * Competitor Deep Dive.
 */
export const runCompetitorDeepDive = async (url: string): Promise<CompetitorDeepAudit> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `GIẢI PHẪU CHI TIẾT KÊNH ĐỐI THỦ: ${url}. Dùng Google Search.`,
      config: { 
        responseMimeType: "application/json", 
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            channel_name: { type: Type.STRING },
            overall_strategy: { type: Type.STRING },
            success_probability: { type: Type.NUMBER },
            niche_authority_score: { type: Type.NUMBER },
            top_video_dissection: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING },
                  hook_analysis: { type: Type.STRING },
                  retention_strategy: { type: Type.STRING },
                  visual_style: { type: Type.STRING },
                  visual_pacing_ms: { type: Type.NUMBER },
                  clone_blueprint: {
                    type: Type.OBJECT,
                    properties: {
                      prompt_equivalent: { type: Type.STRING },
                      suggested_pacing: { type: Type.STRING },
                      script_structure: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  }
                }
              }
            }
          },
          required: ['channel_name', 'overall_strategy', 'success_probability', 'niche_authority_score', 'top_video_dissection']
        }
      }
    });
    return cleanAndParseJSON(response.text) || {};
  });
};

/**
 * Golden Hour Prediction.
 */
export const predictGoldenHours = async (apiKey: string, region: string, niche: string, platforms: string[]): Promise<GoldenHourRecommendation[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Dự đoán giờ vàng đăng bài vùng ${region} ngách ${niche}. Dùng Search.`,
      config: { 
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time_label: { type: Type.STRING },
              score: { type: Type.NUMBER },
              reason: { type: Type.STRING }
            },
            required: ['time_label', 'score', 'reason']
          }
        }
      }
    });
    return cleanAndParseJSON(response.text) || [];
  });
};

/**
 * Strategic Commander chat interface.
 */
export const sendChatToAssistant = async (apiKey: string, history: any[], message: string, context: AppContext): Promise<any> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: message,
      config: {
        systemInstruction: "BẠN LÀ TƯ LỆNH AI. Điều phối toàn bộ hệ thống AV Studio.",
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            detected_lang: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            command: {
              type: Type.OBJECT,
              properties: {
                action: { type: Type.STRING },
                payload: { type: Type.OBJECT }
              }
            }
          },
          required: ['text']
        }
      }
    });
    const parsed = cleanAndParseJSON(response.text) || { text: "Neural Core error." };
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) parsed.sources = chunks.map((c: any) => ({ title: c.web?.title || "Source", uri: c.web?.uri || "#" }));
    return parsed;
  });
};

/**
 * Synthesizes knowledge from text to extract learned preferences.
 */
export const synthesizeKnowledge = async (apiKey: string, text: string, existingPreferences: string[]): Promise<string[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Phân tích văn bản sau và trích xuất các quy tắc chiến lược mới cho hệ thống AI Content. Văn bản: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return cleanAndParseJSON(response.text) || [];
  });
};

/**
 * High-quality Text-to-Speech.
 */
export const generateGeminiTTS = async (text: string, lang: string = 'vi', sentiment: string = 'neutral', useClone: boolean = false): Promise<string> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const voiceName = lang === 'vi' ? 'Kore' : 'Zephyr';
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Phát âm: ${text}` }] }],
      config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  });
};
