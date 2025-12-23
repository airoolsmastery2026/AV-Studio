
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
  OrchestratorResponse, SEOAudit, MissionIntel, 
  ViralDNAProfile, StudioSettings, KnowledgeBase, 
  AppContext, PlatformPolicy, ChannelHealthReport, GovernorAction,
  AffiliateHuntResult, ChannelIntelligence, ScheduleSlot, CompetitorDeepAudit, GoldenHourRecommendation, AspectRatio, YouTubeTrend
} from "../types";

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

let isQuotaExhausted = false;
let exhaustionResetTime = 0;
let lastGroundingRequestTime = 0;
let activeRequestsCount = 0;

const MAX_CONCURRENT_GROUNDING_REQUESTS = 1; 
const MANDATORY_GAP_MS = 20000; 

export const getApiHealthStatus = () => {
  const now = Date.now();
  if (isQuotaExhausted && now < exhaustionResetTime) {
    return { status: 'exhausted', remainingCooldown: Math.ceil((exhaustionResetTime - now) / 1000) };
  }
  const timeSinceLast = now - lastGroundingRequestTime;
  if (timeSinceLast < MANDATORY_GAP_MS && activeRequestsCount === 0) {
     return { status: 'throttled', remainingCooldown: Math.ceil((MANDATORY_GAP_MS - timeSinceLast) / 1000) };
  }
  isQuotaExhausted = false;
  return { status: 'healthy' };
};

const cleanAndParseJSON = (text: string) => {
  try {
    if (!text) return null;
    const cleanedText = text.replace(/```json\n?|```/g, "").trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleanedText);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    return null;
  }
};

async function callAiWithRetry<T>(apiCall: () => Promise<T>, retries = 3, initialDelay = 10000): Promise<T> {
  const health = getApiHealthStatus();
  if (health.status === 'exhausted') throw new Error(`API_QUOTA_COOLDOWN:${health.remainingCooldown}`);
  
  while (activeRequestsCount >= MAX_CONCURRENT_GROUNDING_REQUESTS) {
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const now = Date.now();
  const timeSinceLast = now - lastGroundingRequestTime;
  if (timeSinceLast < MANDATORY_GAP_MS) {
    await new Promise(resolve => setTimeout(resolve, MANDATORY_GAP_MS - timeSinceLast));
  }

  activeRequestsCount++;
  try {
    const result = await apiCall();
    lastGroundingRequestTime = Date.now();
    return result;
  } catch (error: any) {
    const errorStr = JSON.stringify(error);
    if (errorStr.includes('429') || errorStr.includes('quota')) {
      if (retries > 0) {
        activeRequestsCount--;
        await new Promise(resolve => setTimeout(resolve, initialDelay));
        return callAiWithRetry(apiCall, retries - 1, initialDelay * 2);
      } else {
        isQuotaExhausted = true;
        exhaustionResetTime = Date.now() + 300000; // 5 mins lockout
        throw new Error("QUOTA_EXHAUSTED");
      }
    }
    throw error;
  } finally {
    activeRequestsCount--;
  }
}

export const generateVeoVideo = async (prompt: string, aspectRatio: AspectRatio = "9:16"): Promise<string> => {
  const ai = getAi();
  if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) await window.aistudio.openSelectKey();
  
  const finalRatio: "16:9" | "9:16" = (aspectRatio === '1:1') ? '9:16' : (aspectRatio as "16:9" | "9:16");

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: finalRatio }
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("VIDEO_GENERATION_FAILED");
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const generateAIImage = async (prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1"): Promise<string> => {
  const ai = getAi();
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: aspectRatio },
  });
  return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
};

export const scoutYouTubeTrends = async (niche: string): Promise<YouTubeTrend[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search and analyze current trending keywords and topics for YouTube Shorts in the niche: "${niche}". Focus on high-velocity trends.`,
      config: { 
        responseMimeType: "application/json", 
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING },
              volume: { type: Type.STRING },
              competition: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
              potential_ctr: { type: Type.NUMBER },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['keyword', 'volume', 'competition', 'potential_ctr', 'tags']
          }
        }
      }
    });
    return cleanAndParseJSON(response.text) || [];
  });
};

export const sendChatToAssistant = async (apiKey: string, history: any[], message: string, context: AppContext): Promise<any> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const learnedRules = context.knowledgeBase.learnedPreferences.map(p => `- ${p}`).join('\n');
    
    const systemPrompt = `BẠN LÀ AI COMMANDER V4 - TỔNG TƯ LỆNH CHIẾN LƯỢC của AV Studio.
Nhiệm vụ: Tư vấn cấp cao, giải quyết yêu cầu sản xuất video AI phức tạp, báo cáo tình báo và thực thi lệnh hệ thống.

PHONG CÁCH PHẢN HỒI:
- Chuyên nghiệp, uy quyền nhưng hỗ trợ tận tâm.
- Sử dụng Markdown cho báo cáo: Bảng biểu, danh sách, in đậm các Key Insights.
- Luôn dựa trên tri thức đã học và dữ liệu trực tuyến mới nhất.

TRI THỨC HỆ THỐNG ĐÃ HỌC:
${learnedRules || "Chưa có quy tắc ưu tiên nào."}

TRẠNG THÁI HIỆN TẠI:
- Đang ở Tab: ${context.activeTab}
- Trạng thái máy chủ: ${context.status}

CẤU TRÚC PHẢN HỒI JSON:
{
  "text": "Nội dung phản hồi Markdown",
  "detected_lang": "vi",
  "suggestions": ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"],
  "command": { "action": "NAVIGATE | NOTIFY | EXECUTE", "payload": "dữ liệu thực thi" }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            detected_lang: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            command: { type: Type.OBJECT, properties: { action: { type: Type.STRING }, payload: { type: Type.STRING } } }
          },
          required: ['text']
        }
      }
    });

    const parsed = cleanAndParseJSON(response.text) || { text: "Neural Core đang bận, vui lòng thử lại." };
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      parsed.sources = chunks.filter((c: any) => c.web).map((c: any) => ({ title: c.web.title, uri: c.web.uri }));
    }
    return parsed;
  });
};

export const synthesizeKnowledge = async (apiKey: string, text: string, existingPreferences: string[]): Promise<string[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Phân tích văn bản này và trích xuất ra các quy tắc chiến lược mới cho việc sản xuất nội dung (ví dụ: phong cách hình ảnh, nhịp độ video, quy tắc hashtag). Văn bản: "${text}". Kết hợp với các quy tắc cũ: ${JSON.stringify(existingPreferences)}. Trả về mảng string các quy tắc ngắn gọn.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    });
    return cleanAndParseJSON(response.text) || [];
  });
};

export const generateGeminiTTS = async (text: string, lang: string = 'vi', sentiment: string = 'neutral'): Promise<string> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const voiceName = lang === 'vi' ? 'Kore' : 'Zephyr';
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Đọc văn bản sau với giọng chuyên gia đầy uy quyền: ${text}` }] }],
      config: { 
        responseModalities: [Modality.AUDIO], 
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } 
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  });
};

// Các hàm phụ trợ khác được khôi phục đầy đủ
export const syncPlatformPolicies = async (platforms: string[]): Promise<PlatformPolicy[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Update latest AI policies for: ${platforms.join(', ')}. Focus on mandatory labels.`,
      config: { 
        responseMimeType: "application/json", 
        tools: [{ googleSearch: {} }],
        responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { platform: { type: Type.STRING }, critical_changes: { type: Type.ARRAY, items: { type: Type.STRING } }, compliance_score: { type: Type.NUMBER }, ai_label_required: { type: Type.BOOLEAN } } } }
      }
    });
    return cleanAndParseJSON(response.text) || [];
  });
};

export const extractViralDNA = async (apiKey: string, urls: string[], mode: string, lang: string): Promise<ViralDNAProfile> => {
    return callAiWithRetry(async () => {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze viral DNA structure for: ${urls.join(', ')}. Return precise JSON analysis.`,
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                structure: { type: Type.OBJECT, properties: { hook_type: { type: Type.STRING }, pacing: { type: Type.STRING }, avg_scene_duration: { type: Type.NUMBER }, visual_pacing_avg: { type: Type.NUMBER } } },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                algorithm_fit_score: { type: Type.NUMBER },
                risk_level: { type: Type.STRING }
              }
            }
        }
      });
      return cleanAndParseJSON(response.text) || {};
    });
};

export const generateProScript = async (apiKey: string, dna: ViralDNAProfile, settings: StudioSettings, kb: KnowledgeBase): Promise<OrchestratorResponse> => {
    return callAiWithRetry(async () => {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Create high-conversion video production plan for: ${settings.topic}. Follow learned rules: ${kb.learnedPreferences.join(', ')}.`,
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    market_scoring: { type: Type.OBJECT, properties: { tiktok_potential: { type: Type.NUMBER }, youtube_shorts_potential: { type: Type.NUMBER }, estimated_cpm: { type: Type.STRING } } },
                    production_plan: { type: Type.OBJECT, properties: { technical_specs: { type: Type.OBJECT, properties: { ratio: { type: Type.STRING }, resolution: { type: Type.STRING } } }, script_master: { type: Type.STRING }, scenes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { vo_text: { type: Type.STRING }, visual_cues: { type: Type.STRING } } } } } },
                    generated_content: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }, thumbnail_prompt: { type: Type.STRING } } }
                }
            }
        }
      });
      return cleanAndParseJSON(response.text) || {};
    });
};

export const runSeoAudit = async (title: string, description: string, topic: string): Promise<SEOAudit> => {
    return callAiWithRetry(async () => {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Audit SEO for content: "${title}". Use search grounding.`,
        config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
      });
      return cleanAndParseJSON(response.text) || {};
    });
};

export const huntAffiliateProducts = async (apiKey: string, niche: string, networks: string[]): Promise<AffiliateHuntResult> => {
    return callAiWithRetry(async () => {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Hunt trending products in ${niche}. Search web data.`,
        config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
      });
      return cleanAndParseJSON(response.text) || { products: [], strategy_note: "" };
    });
};

export const generateChannelAudit = async (apiKey: string, channel: string, platform: string): Promise<ChannelHealthReport> => {
    return callAiWithRetry(async () => {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Audit health for channel ${channel} on ${platform}.`,
        config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
      });
      return cleanAndParseJSON(response.text) || {};
    });
};

export const runGovernorExecution = async (channel: string, diagnosis: string): Promise<GovernorAction> => {
    return callAiWithRetry(async () => {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Suggest fix for channel ${channel} error: ${diagnosis}.`,
        config: { responseMimeType: "application/json" }
      });
      return cleanAndParseJSON(response.text) || {};
    });
};

export const scanChannelIntelligence = async (url: string): Promise<ChannelIntelligence> => {
    return callAiWithRetry(async () => {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Extract strategic intelligence from channel: ${url}.`,
        config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
      });
      return cleanAndParseJSON(response.text) || {};
    });
};

export const runCompetitorDeepDive = async (url: string): Promise<CompetitorDeepAudit> => {
    return callAiWithRetry(async () => {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Deep dive competitor analysis for ${url}.`,
        config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
      });
      return cleanAndParseJSON(response.text) || {};
    });
};

export const predictGoldenHours = async (apiKey: string, region: string, niche: string, platforms: string[]): Promise<GoldenHourRecommendation[]> => {
    return callAiWithRetry(async () => {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Predict best posting hours for ${niche} in ${region}.`,
        config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
      });
      return cleanAndParseJSON(response.text) || [];
    });
};

export const generateDailySchedule = async (apiKey: string, channel: string, niche: string, region: string, config: any): Promise<ScheduleSlot[]> => {
    return callAiWithRetry(async () => {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Plan daily schedule for ${channel}.`,
        config: { responseMimeType: "application/json" }
      });
      return cleanAndParseJSON(response.text) || [];
    });
};
