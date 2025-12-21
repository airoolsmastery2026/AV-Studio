
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
  OrchestratorResponse, SEOAudit, MissionIntel, 
  ViralDNAProfile, StudioSettings, KnowledgeBase, 
  AppContext, GoldenHourRecommendation, ScheduleSlot,
  CompetitorDeepAudit, ChannelHealthReport, GovernorAction,
  AffiliateHuntResult
} from "../types";

// Helper to initialize Gemini Client
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean and parse JSON from LLM responses
const cleanAndParseJSON = (text: string) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON:", text);
    return {};
  }
};

/**
 * Mổ xẻ DNA Viral từ các URL đối thủ
 */
export const extractViralDNA = async (apiKey: string, urls: string[], mode: string, lang: string): Promise<ViralDNAProfile> => {
  const ai = getAi();
  const prompt = `Phân tích cấu trúc viral của các URL này: ${urls.join(', ')}. 
    Chế độ: ${mode}, Ngôn ngữ: ${lang}. 
    Trả về JSON ViralDNAProfile gồm structure (hook_type, pacing, avg_scene_duration), emotional_curve (array), keywords (array), algorithm_fit_score (number), risk_level.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }] 
    }
  });
  return cleanAndParseJSON(response.text || "{}");
};

/**
 * NEURAL OVERHAUL: Tự động tái cấu trúc kịch bản nếu SEO Audit không đạt yêu cầu
 */
export const runNeuralOverhaul = async (currentPlan: OrchestratorResponse, audit: SEOAudit): Promise<OrchestratorResponse> => {
    const ai = getAi();
    const prompt = `
    VAI TRÒ: Chuyên gia tối ưu hóa nội dung cao cấp.
    TÌNH TRẠNG: Kịch bản hiện tại chỉ đạt ${audit.seo_score}/100 điểm SEO.
    VẤN ĐỀ: ${audit.checklist.filter(c => !c.completed).map(c => c.task).join(', ')}.
    NHIỆM VỤ: Hãy viết lại TOÀN BỘ kịch bản và tiêu đề để đạt trên 90 điểm SEO.
    YÊU CẦU: 
    1. Giữ vững DNA viral gốc nhưng thay đổi từ khóa sang: ${audit.suggested_tags.join(', ')}.
    2. Tăng cường lực hút (Hook) ở 3 giây đầu tiên.
    
    DỮ LIỆU GỐC: ${JSON.stringify(currentPlan.production_plan)}
    TRẢ VỀ JSON: OrchestratorResponse hoàn chỉnh đã tối ưu.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    return cleanAndParseJSON(response.text || "{}");
};

/**
 * Reconnaissance agent to find trending products and signals
 */
export const runAgenticRecon = async (niche: string): Promise<{ discovered_signals: MissionIntel[], trending_keywords: string[] }> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Thực hiện trinh sát thị trường ngách: ${niche}. Tìm các sản phẩm affiliate đang hot. Trả về JSON gồm list discovered_signals (MissionIntel) và trending_keywords.`,
    config: { 
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }]
    }
  });
  return cleanAndParseJSON(response.text || "{}");
};

/**
 * Hunts for affiliate products across specified networks
 * Fix: Added missing huntAffiliateProducts export
 */
export const huntAffiliateProducts = async (apiKey: string, niche: string, networks: string[]): Promise<AffiliateHuntResult> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Tìm kiếm sản phẩm affiliate trong ngách ${niche} trên các mạng lưới: ${networks.join(', ')}. Trả về JSON AffiliateHuntResult gồm products (AIProduct[]) và strategy_note.`,
    config: { 
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }]
    }
  });
  return cleanAndParseJSON(response.text || "{}");
};

/**
 * Generates a professional script based on DNA profile and studio settings
 */
export const generateProScript = async (
  apiKey: string, 
  dna: ViralDNAProfile, 
  settings: StudioSettings, 
  kb: KnowledgeBase
): Promise<OrchestratorResponse> => {
  const ai = getAi();
  const prompt = `Tạo kịch bản video viral cho chủ đề: ${settings.topic}. 
    DNA: ${JSON.stringify(dna)}. 
    Settings: ${JSON.stringify(settings)}. 
    Knowledge Base: ${JSON.stringify(kb.learnedPreferences)}.
    Trả về JSON OrchestratorResponse.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return cleanAndParseJSON(response.text || "{}");
};

/**
 * Generates TTS audio using Gemini 2.5 Flash
 */
export const generateGeminiTTS = async (text: string, lang: string = 'vi', sentiment: string = 'neutral'): Promise<string> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say ${sentiment} in ${lang}: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

/**
 * Predicts golden hours for posting based on global search trends
 */
export const predictGoldenHours = async (apiKey: string, region: string, niche: string, platforms: string[]): Promise<GoldenHourRecommendation[]> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Dự đoán khung giờ vàng đăng bài cho ngách ${niche} tại ${region} trên các nền tảng ${platforms.join(', ')}. Trả về JSON array GoldenHourRecommendation.`,
    config: { 
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }]
    }
  });
  const data = cleanAndParseJSON(response.text || "[]");
  return Array.isArray(data) ? data : [];
};

/**
 * Performs an SEO audit of title and description
 */
export const runSeoAudit = async (title: string, description: string, topic: string): Promise<SEOAudit> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Audit SEO cho tiêu đề: "${title}", mô tả: "${description}" thuộc chủ đề ${topic}. Trả về JSON SEOAudit.`,
    config: { 
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }]
    }
  });
  return cleanAndParseJSON(response.text || "{}");
};

/**
 * Generates a health audit for a channel
 */
export const generateChannelAudit = async (apiKey: string, channel: string, platform: string): Promise<ChannelHealthReport> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Audit sức khỏe kênh ${channel} trên ${platform}. Trả về JSON ChannelHealthReport.`,
    config: { 
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }]
    }
  });
  return cleanAndParseJSON(response.text || "{}");
};

/**
 * Executes autonomous governor actions
 */
export const runGovernorExecution = async (channel: string, diagnosis: string): Promise<GovernorAction> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Thực hiện hành động tự trị cho kênh ${channel} dựa trên chẩn đoán: ${diagnosis}. Trả về JSON GovernorAction.`,
    config: { responseMimeType: "application/json" }
  });
  return cleanAndParseJSON(response.text || "{}");
};

/**
 * Performs a deep dive analysis of a competitor channel
 */
export const runCompetitorDeepDive = async (target: string): Promise<CompetitorDeepAudit> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Phân tích sâu đối thủ: ${target}. Trả về JSON CompetitorDeepAudit.`,
    config: { 
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }]
    }
  });
  return cleanAndParseJSON(response.text || "{}");
};

/**
 * Chat assistant logic with tool context
 */
export const sendChatToAssistant = async (apiKey: string, history: any[], message: string, context: AppContext): Promise<{ text: string, command?: any, detected_lang?: string, suggestions?: string[], sentiment?: string }> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: message,
    config: {
      systemInstruction: `Bạn là AI Commander của AV Studio. Bối cảnh hiện tại: ${JSON.stringify(context)}. Hãy trả về JSON gồm text (phản hồi), command (nếu có), detected_lang, suggestions, sentiment.`,
      responseMimeType: "application/json",
    },
  });
  return cleanAndParseJSON(response.text || "{}");
};

/**
 * Synthesizes knowledge from text input
 */
export const synthesizeKnowledge = async (apiKey: string, text: string, existing: string[]): Promise<string[]> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Trích xuất các quy tắc/preferences từ văn bản này: "${text}". Các quy tắc hiện có: ${existing.join(', ')}. Trả về JSON array string các quy tắc mới.`,
    config: { responseMimeType: "application/json" }
  });
  const data = cleanAndParseJSON(response.text || "[]");
  return Array.isArray(data) ? data : [];
};

/**
 * Generates a daily schedule for posts
 */
export const generateDailySchedule = async (apiKey: string, account: string, niche: string, region: string, config: any): Promise<ScheduleSlot[]> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Lập lịch đăng bài cho tài khoản ${account} (${niche}) tại ${region}. Config: ${JSON.stringify(config)}. Trả về JSON array ScheduleSlot.`,
    config: { responseMimeType: "application/json" }
  });
  const data = cleanAndParseJSON(response.text || "[]");
  return Array.isArray(data) ? data : [];
};
