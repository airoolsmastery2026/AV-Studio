
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
    console.log(`API đang nghỉ, chờ ${health.remainingCooldown}s...`);
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
        const backoff = COOLDOWN_PERIOD_MS + (2 - retries) * 10000; 
        await new Promise(resolve => setTimeout(resolve, backoff + 1000));
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

// HÀM MỚI: PHÂN TÍCH THỊ TRƯỜNG CHIẾN LƯỢC
export const analyzeAIMarketIntelligence = async (): Promise<AIMarketReport[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Phân tích thị trường công cụ AI (AI Tools) toàn cầu và Việt Nam giai đoạn cuối 2024 - đầu 2025. 
      Tìm ra 5 ngách phụ (sub-niches) có tiềm năng hoa hồng affiliate cao nhất. 
      Với mỗi ngách, liệt kê 3 sản phẩm cụ thể và mạng lưới tiếp thị (Shopee, Amazon, hoặc Direct).
      Trả về kết quả dưới định dạng JSON ARRAY.`,
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
            },
            required: ['sub_niche', 'growth_velocity', 'bounty_score', 'monetization_logic', 'top_products']
          }
        }
      }
    });
    
    // Log các link nguồn để hiển thị lên UI (Search Grounding Rule)
    console.log("Grounding Sources:", response.candidates?.[0]?.groundingMetadata?.groundingChunks);
    
    return cleanAndParseJSON(response.text) || [];
  });
};

// ... (Implementing missing exports)

export const runCompetitorDeepDive = async (target: string): Promise<CompetitorDeepAudit> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform deep audit on competitor: ${target}`,
      config: { 
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });
    return cleanAndParseJSON(response.text) || { seo_score: 0 };
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

export const scoutYouTubeTrends = async (niche: string): Promise<YouTubeTrend[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Scout YouTube trends for niche: ${niche}`,
      config: { 
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
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
      config: { 
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });
    const parsed = cleanAndParseJSON(response.text);
    return { products: parsed?.products || [], strategy_note: parsed?.strategy_note || "" };
  });
};

export const sendChatToAssistant = async (key: string, history: any[], message: string, context: AppContext): Promise<any> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: message,
      config: { 
        systemInstruction: `You are an AI Commander for AV Studio. Context: ${JSON.stringify(context)}`,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });
    return cleanAndParseJSON(response.text);
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

export const predictGoldenHours = async (key: string, region: string, niche: string, platforms: string[]): Promise<GoldenHourRecommendation[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Predict golden hours for posting in ${region} for ${niche} on ${platforms.join(', ')}`,
      config: { 
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });
    return cleanAndParseJSON(response.text) || [];
  });
};

export const generateDailySchedule = async (key: string, account: string, niche: string, region: string, config: any): Promise<ScheduleSlot[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate daily schedule for ${account} in ${niche} for region ${region}. Config: ${JSON.stringify(config)}`,
      config: { 
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });
    return cleanAndParseJSON(response.text) || [];
  });
};

export const generateChannelAudit = async (key: string, alias: string, provider: string): Promise<ChannelHealthReport> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform channel health audit for ${alias} on ${provider}.`,
      config: { 
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });
    return cleanAndParseJSON(response.text);
  });
};

export const runGovernorExecution = async (alias: string, diagnosis: string): Promise<GovernorAction> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Execute governor action for ${alias} based on diagnosis: ${diagnosis}`,
      config: { responseMimeType: "application/json" }
    });
    return { id: crypto.randomUUID(), timestamp: Date.now(), ...cleanAndParseJSON(response.text) };
  });
};

export const synthesizeKnowledge = async (key: string, text: string, current: string[]): Promise<string[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Synthesize new knowledge rules from: ${text}. Current rules: ${current.join(', ')}`,
      config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text) || [];
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
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate pro video script based on profile: ${JSON.stringify(profile)}, settings: ${JSON.stringify(settings)}, knowledge: ${JSON.stringify(kb)}`,
      config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text);
  });
};

export const scanChannelIntelligence = async (url: string): Promise<ChannelIntelligence> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Scan channel intelligence for: ${url}`,
      config: { 
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });
    return cleanAndParseJSON(response.text);
  });
};
