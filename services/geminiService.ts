
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
  OrchestratorResponse, SEOAudit, MissionIntel, 
  ViralDNAProfile, StudioSettings, KnowledgeBase, 
  AppContext, PlatformPolicy, ChannelHealthReport, GovernorAction,
  AffiliateHuntResult, ChannelIntelligence, ScheduleSlot, CompetitorDeepAudit, GoldenHourRecommendation, AspectRatio, YouTubeTrend, AgentCommand,
  AIMarketReport
} from "../types";

const COOLDOWN_PERIOD_MS = 60000;
let isQuotaExhausted = false;
let exhaustionResetTime = 0;

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Health Check Logic
export const getApiHealthStatus = () => {
  const now = Date.now();
  if (isQuotaExhausted && now < exhaustionResetTime) {
    return { status: 'exhausted' as const, remainingCooldown: Math.ceil((exhaustionResetTime - now) / 1000) };
  }
  isQuotaExhausted = false;
  return { status: 'healthy' as const, remainingCooldown: 0 };
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

async function callAiWithRetry<T>(apiCall: () => Promise<T>, retries = 2): Promise<T> {
  const health = getApiHealthStatus();
  if (health.status === 'exhausted') {
    await new Promise(resolve => setTimeout(resolve, (health.remainingCooldown + 1) * 1000));
  }

  try {
    return await apiCall();
  } catch (error: any) {
    const errorStr = error?.message || JSON.stringify(error);
    if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
      isQuotaExhausted = true;
      exhaustionResetTime = Date.now() + COOLDOWN_PERIOD_MS;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, COOLDOWN_PERIOD_MS + 1000));
        return callAiWithRetry(apiCall, retries - 1);
      }
      throw new Error("API_LIMIT_REACHED");
    }
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return callAiWithRetry(apiCall, retries - 1);
    }
    throw error;
  }
}

// Map UI Model Names to API Model Names
const mapModelName = (uiName: string): string => {
  switch (uiName) {
    case 'Gemini 3 Pro': return 'gemini-3-pro-preview';
    case 'Gemini 3 Flash': return 'gemini-3-flash-preview';
    case 'Gemini 2.5 Flash': return 'gemini-flash-lite-latest';
    default: return 'gemini-3-flash-preview';
  }
};

export const predictThumbnailPerformance = async (imgA: string, imgB: string, title: string): Promise<{a: number, b: number}> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    
    const extractBase64 = (dataUri: string) => {
      if (dataUri.startsWith('data:')) return dataUri.split(',')[1];
      return dataUri;
    };

    const prompt = `Bạn là một chuyên gia tăng trưởng YouTube & TikTok. Hãy phân tích 2 ảnh bìa (Thumbnail) đính kèm cho video có tiêu đề: "${title}". 
    Dự đoán tỷ lệ nhấp chuột (CTR %) giả lập cho mỗi ảnh dựa trên: sự nổi bật, độ rõ nét của thông điệp, tâm lý màu sắc và khả năng thu hút.
    Trả về kết quả dưới dạng JSON thuần túy: {"a": number, "b": number}. Giá trị CTR nằm trong khoảng 1.0 đến 15.0.`;

    const parts = [
      { text: prompt },
      { inlineData: { mimeType: "image/png", data: extractBase64(imgA) } },
      { inlineData: { mimeType: "image/png", data: extractBase64(imgB) } }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: { responseMimeType: "application/json" }
    });

    return cleanAndParseJSON(response.text) || { a: 5, b: 5 };
  });
};

export const analyzeAIMarketIntelligence = async (): Promise<AIMarketReport[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Phân tích thị trường công cụ AI (AI Tools) toàn cầu và Việt Nam giai đoạn cuối 2024 - đầu 2025.`,
      config: { 
        responseMimeType: "application/json", 
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sub_niche: { type: Type.STRING },
              growth_velocity: { type: Type.NUMBER },
              bounty_score: { type: Type.NUMBER },
              monetization_logic: { type: Type.STRING },
              top_products: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    avg_commission: { type: Type.STRING },
                    network: { type: Type.STRING },
                    entry_barrier: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
                  }
                }
              }
            }
          }
        }
      }
    });
    return cleanAndParseJSON(response.text) || [];
  });
};

export const extractViralDNA = async (key: string, urls: string[], mode: string, lang: string): Promise<ViralDNAProfile> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract viral DNA from ${urls.join(', ')} in ${mode} mode, language: ${lang}`,
      config: { 
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });
    return cleanAndParseJSON(response.text);
  });
};

export const generateProScript = async (key: string, profile: ViralDNAProfile, settings: StudioSettings, kb: KnowledgeBase): Promise<OrchestratorResponse> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    // Use selected model from UI if it's a Gemini model
    const modelId = mapModelName(settings.model || 'Gemini 3 Pro');
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Generate pro video script for ${settings.topic}. Format: ${settings.videoFormat}, Ratio: ${settings.aspectRatio}. Knowledge base rules: ${kb.learnedPreferences.join(', ')}`,
      config: { 
        responseMimeType: "application/json",
        systemInstruction: `You are a world-class viral video orchestrator. Output JSON strictly following OrchestratorResponse type.`
      }
    });
    return cleanAndParseJSON(response.text);
  });
};

export const generateVeoVideo = async (prompt: string, ratio: string): Promise<string> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: ratio as any
      }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }
    return `${operation.response?.generatedVideos?.[0]?.video?.uri}&key=${process.env.API_KEY}`;
  });
};

export const runSeoAudit = async (target: string, mode: string, niche: string): Promise<SEOAudit> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Run SEO Audit for ${target} in ${mode} mode for ${niche} niche.`,
      config: { 
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });
    return cleanAndParseJSON(response.text) || { seo_score: 0, title_optimization_suggestions: [], suggested_tags: [] };
  });
};

export const scanChannelIntelligence = async (url: string): Promise<ChannelIntelligence> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a deep VidIQ-style intelligence scan for the channel at ${url}. 
      Include channel health metrics, SEO score, trending keywords, and top-performing videos with their VPH (Views Per Hour) and individual SEO scores.`,
      config: { 
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            channel_name: { type: Type.STRING },
            subscribers: { type: Type.STRING },
            niche: { type: Type.STRING },
            vidiq_score: { type: Type.NUMBER, description: 'Overall channel health score 0-100' },
            trending_keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            views_per_hour_avg: { type: Type.STRING },
            seo_opportunity_index: { type: Type.NUMBER, description: 'How easy it is to outrank this channel 0-100' },
            top_videos: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  views: { type: Type.STRING },
                  vph: { type: Type.STRING, description: 'Views per hour' },
                  seo_score: { type: Type.NUMBER },
                  url: { type: Type.STRING }
                }
              }
            }
          },
          required: ['channel_name', 'vidiq_score', 'trending_keywords', 'top_videos']
        }
      }
    });
    return cleanAndParseJSON(response.text);
  });
};

export const runCompetitorDeepDive = async (target: string): Promise<CompetitorDeepAudit> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Deep audit: ${target}`,
      config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
    });
    return cleanAndParseJSON(response.text) || { seo_score: 0 };
  });
};

export const scoutYouTubeTrends = async (niche: string): Promise<YouTubeTrend[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Scout trends for ${niche}`,
      config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
    });
    return cleanAndParseJSON(response.text) || [];
  });
};

export const huntAffiliateProducts = async (key: string, niche: string, networks: string[]): Promise<AffiliateHuntResult> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Hunt affiliate products for ${niche} on ${networks.join(', ')}`,
      config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
    });
    const parsed = cleanAndParseJSON(response.text);
    return { products: parsed?.products || [], strategy_note: parsed?.strategy_note || "" };
  });
};

export const generateGeminiTTS = async (text: string): Promise<string | undefined> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  });
};

export const generateAIImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: aspectRatio as any } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return `data:image/png;base64,${part?.inlineData?.data}`;
  });
};

export const synthesizeKnowledge = async (key: string, text: string, current: string[]): Promise<string[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Synthesize rules: ${text}`,
      config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text) || [];
  });
};

export const predictGoldenHours = async (key: string, region: string, niche: string, platforms: string[]): Promise<GoldenHourRecommendation[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Predict hours for ${region} / ${niche}`,
      config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
    });
    return cleanAndParseJSON(response.text) || [];
  });
};

export const generateDailySchedule = async (key: string, account: string, niche: string, region: string, config: any): Promise<ScheduleSlot[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Daily schedule for ${account}`,
      config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
    });
    return cleanAndParseJSON(response.text) || [];
  });
};

export const generateChannelAudit = async (key: string, alias: string, provider: string): Promise<ChannelHealthReport> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Health audit: ${alias}`,
      config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
    });
    return cleanAndParseJSON(response.text);
  });
};

export const runGovernorExecution = async (alias: string, diagnosis: string): Promise<GovernorAction> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Execute governor: ${alias}`,
      config: { responseMimeType: "application/json" }
    });
    return { id: crypto.randomUUID(), timestamp: Date.now(), ...cleanAndParseJSON(response.text) };
  });
};

export const sendChatToAssistant = async (key: string, history: any[], message: string, context: AppContext): Promise<any> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: message,
      config: { 
        systemInstruction: `Bạn là AI Commander của hệ thống AV Studio.
        NHIỆM VỤ: Hỗ trợ người dùng điều hành xưởng sản xuất video Affiliate.
        DỮ LIỆU HIỆN TẠI: ${JSON.stringify(context)}.
        QUY TẮC:
        1. Sử dụng Google Search khi người dùng hỏi về xu hướng, kiến thức mới.
        2. Nếu người dùng muốn chuyển tab (ví dụ: "vào studio", "xem lịch"), hãy trả về lệnh NAVIGATE kèm ID tab. Các tab: studio, auto_pilot, campaign, analytics, marketplace, risk_center, queue, settings.
        3. Luôn trả về JSON format: {"text": "lời thoại", "command": {"action": "NAVIGATE", "payload": "tab_id"} | null, "suggestions": ["câu hỏi gợi ý"], "sources": []}.
        4. Trích xuất URLs từ groundingMetadata.groundingChunks và đưa vào mảng "sources" dưới dạng {"uri": "", "title": ""}.`,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });

    const parsed = cleanAndParseJSON(response.text) || { text: response.text, command: null, suggestions: [], sources: [] };
    
    // Auto-extract sources from grounding metadata if model didn't fill it correctly
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && (!parsed.sources || parsed.sources.length === 0)) {
      parsed.sources = chunks
        .filter((c: any) => c.web)
        .map((c: any) => ({ uri: c.web.uri, title: c.web.title }));
    }

    return parsed;
  });
};
