
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
        exhaustionResetTime = Date.now() + 300000;
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

export const sendChatToAssistant = async (apiKey: string, history: any[], message: string, context: AppContext): Promise<any> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const learnedRules = context.knowledgeBase.learnedPreferences.map(p => `- ${p}`).join('\n');
    
    const uiLang = localStorage.getItem('av_studio_ui_lang') || 'vi';
    const instructions: Record<string, string> = {
        vi: "BẠN LÀ AI COMMANDER V4 - TỔNG TƯ LỆNH CHIẾN LƯỢC. Nhiệm vụ: Tư vấn sản xuất video AI, phân tích đối thủ và thực thi lệnh.",
        en: "YOU ARE AI COMMANDER V4 - STRATEGIC OVERLORD. Mission: AI Video production advisor, competitor autopsy, and system dispatch.",
        ja: "あなたは AI COMMANDER V4 です。使命：AI動画制作アドバイザー、競合分析、およびシステム指令。",
        zh: "你是 AI 指挥官 V4。任务：AI 视频制作顾问、竞品分析和系统调度。",
        es: "ERES EL COMANDANTE AI V4. Misión: Asesor de producción de video AI, autopsia de competidores y despacho del sistema."
    };

    const systemPrompt = `${instructions[uiLang] || instructions['vi']}
    
PHONG CÁCH: Chuyên nghiệp, uy quyền. Phản hồi bằng ngôn ngữ người dùng đang sử dụng.

TRI THỨC ĐÃ HỌC:
${learnedRules || "N/A"}

BỐI CẢNH: Tab hiện tại: ${context.activeTab}.

JSON RESPONSE SCHEMA:
{
  "text": "Phản hồi Markdown",
  "suggestions": ["Gợi ý 1", "Gợi ý 2"],
  "command": { "action": "NAVIGATE | NOTIFY", "payload": "data" }
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
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            command: { type: Type.OBJECT, properties: { action: { type: Type.STRING }, payload: { type: Type.STRING } } }
          },
          required: ['text']
        }
      }
    });

    const parsed = cleanAndParseJSON(response.text) || { text: "System Busy." };
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
      contents: `Extract short content strategy rules from: "${text}". Combine with: ${JSON.stringify(existingPreferences)}. JSON string array output only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    });
    return cleanAndParseJSON(response.text) || [];
  });
};

export const generateGeminiTTS = async (text: string): Promise<string> => {
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
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  });
};

export const syncPlatformPolicies = async (platforms: string[]): Promise<PlatformPolicy[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Check latest AI labeling policies for: ${platforms.join(', ')}.`,
      config: { 
        responseMimeType: "application/json", 
        tools: [{ googleSearch: {} }]
      }
    });
    return cleanAndParseJSON(response.text) || [];
  });
};

export const extractViralDNA = async (apiKey: string, urls: string[], mode: string, lang: string): Promise<ViralDNAProfile> => {
    return callAiWithRetry(async () => {
      const ai = getAi();
      const prompt = `Perform a Deep Autopsy of these competitor URLs: ${urls.join(', ')}.
Analyze the video structure based on publicly available metadata and common patterns in the niche.
Return a precise JSON object following this ViralDNAProfile structure:
{
  "structure": {
    "hook_type": "string (e.g. Question, Visual Surprise, Shocking Statement)",
    "pacing": "Fast | Moderate | Slow",
    "avg_scene_duration": number (seconds),
    "visual_pacing_avg": number (milliseconds between cuts)
  },
  "emotional_curve": ["string", "string", "string"], // sequence of emotions: curiosity -> interest -> desire -> action
  "keywords": ["string"],
  "algorithm_fit_score": number (0-100),
  "risk_level": "Safe | Moderate | High"
}
Ensure the analysis is in language: ${lang}. Use Google Search grounding to understand the latest channel performance.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        }
      });
      return cleanAndParseJSON(response.text) || {
          structure: { hook_type: 'Unknown', pacing: 'Moderate', avg_scene_duration: 3, visual_pacing_avg: 1500 },
          emotional_curve: ['Neutral'],
          keywords: [],
          algorithm_fit_score: 50,
          risk_level: 'Safe'
      };
    });
};

export const generateProScript = async (apiKey: string, dna: ViralDNAProfile, settings: StudioSettings, kb: KnowledgeBase): Promise<OrchestratorResponse> => {
    return callAiWithRetry(async () => {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Create production plan for: ${settings.topic} in ${settings.contentLanguage}. Use learned DNA patterns: ${JSON.stringify(dna)}.`,
        config: { responseMimeType: "application/json" }
      });
      return cleanAndParseJSON(response.text) || {};
    });
};

export const runSeoAudit = async (title: string, description: string, topic: string): Promise<SEOAudit> => {
    return callAiWithRetry(async () => {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Audit SEO for: "${title}". Use grounding.`,
        config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
      });
      return cleanAndParseJSON(response.text) || {
        seo_score: 0,
        keyword_difficulty: 'LOW',
        search_volume_score: 0,
        trending_momentum: 0,
        suggested_tags: [],
        checklist: [],
        title_optimization_suggestions: []
      };
    });
};

export const huntAffiliateProducts = async (apiKey: string, niche: string, networks: string[]): Promise<AffiliateHuntResult> => {
    return callAiWithRetry(async () => {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Find top bounty products in ${niche} across ${networks.join(', ')}.`,
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
        contents: `Audit health for ${channel} on ${platform}.`,
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
        contents: `Suggest executive fix for ${channel}: ${diagnosis}.`,
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
        contents: `Extract strategy from channel: ${url}.`,
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
        contents: `Deep dive analysis for competitor: ${url}.`,
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
        contents: `Create smart schedule for ${channel}.`,
        config: { responseMimeType: "application/json" }
      });
      return cleanAndParseJSON(response.text) || [];
    });
};

export const scoutYouTubeTrends = async (niche: string): Promise<YouTubeTrend[]> => {
  return callAiWithRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Scout trending YouTube Shorts topics for the niche: "${niche}". Focus on high-velocity trends.`,
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
