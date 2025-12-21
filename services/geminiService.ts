
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
  OrchestratorResponse, SEOAudit, MissionIntel, 
  ViralDNAProfile, StudioSettings, KnowledgeBase, 
  ViralFormula, PlatformMetric, CompetitorDeepAudit,
  AffiliateHuntResult, AppContext, ScheduleSlot,
  ChannelHealthReport, GovernorAction
} from "../types";

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanAndParseJSON = (text: string) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
  } catch (e) {
    return {};
  }
};

const VIRAL_FORMULAS: ViralFormula[] = [
    { id: 'f_01', name: 'Vòng lặp vô tận (Infinite Loop)', structure_logic: 'Cảnh cuối trùng khớp với cảnh đầu để tạo vòng lặp xem lại.', retention_hook_rule: 'Nêu bật một sự thật gây sốc ngay giây đầu.', transition_style: 'SEAMLESS' },
    { id: 'f_02', name: 'Đòn bẩy cảm xúc (Emotional Leverage)', structure_logic: 'Đưa ra nỗi đau -> Giải pháp AI -> Kết quả sung sướng.', retention_hook_rule: 'Hình ảnh biến đổi (Before/After) cực nhanh.', transition_style: 'ZOOM_FLOW' }
];

/**
 * Tạo kịch bản tích hợp Deep Viral Logic & Seamless Transitions
 */
export const generateProScript = async (
  apiKey: string, 
  dna: ViralDNAProfile, 
  settings: StudioSettings, 
  kb: KnowledgeBase
): Promise<OrchestratorResponse> => {
  const ai = getAi();
  
  const formula = VIRAL_FORMULAS.find(f => f.id === kb.globalStrategyRules.viralFormulaId) || VIRAL_FORMULAS[0];

  const prompt = `
    VAI TRÒ: Chuyên gia sáng tạo nội dung Viral triệu view & Kỹ sư kịch bản AI.
    YÊU CẦU ĐỒNG NHẤT (GLOBAL RULES): 
    - Tính đồng nhất: ${kb.globalStrategyRules.enforceConsistency ? 'BẮT BUỘC (Giữ nguyên phong cách hình ảnh xuyên suốt)' : 'Linh hoạt'}
    - Nối cảnh liền mạch: ${kb.globalStrategyRules.seamlessTransitionLogic ? 'Sử dụng kỹ thuật SEAMLESS TRANSITION (Match cut, Zoom in/out)' : 'Cắt cảnh thông thường'}
    - Công thức Viral: ${formula.name} - ${formula.structure_logic}
    
    CHỦ ĐỀ: ${settings.topic}
    DNA ĐỐI THỦ: ${JSON.stringify(dna)}
    THÔNG SỐ THUẬT TOÁN: Tối ưu cho ${settings.videoFormat} (Thời gian vàng 3s đầu: ${settings.hookStrength}% lực hút).

    TRẢ VỀ JSON OrchestratorResponse:
    - Cần mô tả chi tiết 'transition_logic' cho từng scene.
    - Đảm bảo 'vo_text' ngắn gọn, súc tích theo phong cách ${settings.contentLanguage}.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const extractViralDNA = async (apiKey: string, urls: string[], mode: string, lang: string): Promise<ViralDNAProfile> => {
  const ai = getAi();
  const prompt = `Phân tích DNA Viral cho: ${urls.join(', ')}. Ngôn ngữ: ${lang}. Trả về JSON ViralDNAProfile.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const runSeoAudit = async (title: string, description: string, topic: string): Promise<SEOAudit> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Audit SEO cho "${title}" - "${description}". Topic: ${topic}. Trả về JSON SEOAudit.`,
    config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const runNeuralOverhaul = async (currentPlan: any, audit: any): Promise<any> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Tái cấu trúc kịch bản dựa trên SEO thấp: ${JSON.stringify(audit)}. Dữ liệu cũ: ${JSON.stringify(currentPlan)}.`,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "{}");
};

export const runAgenticRecon = async (niche: string): Promise<any> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Săn sản phẩm affiliate hot trong ngách ${niche}. Trả về JSON {discovered_signals, trending_keywords}.`,
    config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
  });
  return cleanAndParseJSON(response.text || "{}");
};

/* FIX: Updated signature to accept lang and sentiment */
export const generateGeminiTTS = async (text: string, lang: string = 'vi', sentiment: string = 'neutral'): Promise<string> => {
  const ai = getAi();
  const styledText = `Say in ${lang} with ${sentiment} emotion: ${text}`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: styledText }] }],
    config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const predictGoldenHours = async (apiKey: string, region: string, niche: string, platforms: string[]): Promise<any[]> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Giờ vàng tại ${region} cho ${niche} trên ${platforms.join(',')}. Trả về JSON array.`,
    config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
  });
  return cleanAndParseJSON(response.text || "[]");
};

/* FIX: Added missing exported functions */

export const runCompetitorDeepDive = async (url: string): Promise<CompetitorDeepAudit> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze competitor channel/video at ${url}. Return CompetitorDeepAudit JSON.`,
    config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const huntAffiliateProducts = async (apiKey: string, niche: string, networks: string[]): Promise<AffiliateHuntResult> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Find high-commission trending products in ${niche} across ${networks.join(', ')}. Return AffiliateHuntResult JSON.`,
    config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const sendChatToAssistant = async (apiKey: string, history: any[], message: string, context: AppContext): Promise<any> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: history.concat([{ role: 'user', parts: [{ text: `CONTEXT: ${JSON.stringify(context)}. MESSAGE: ${message}` }] }]),
    config: { 
      responseMimeType: "application/json",
      systemInstruction: "You are AI Commander. Help user manage AV Studio. Use NAVIGATE command for tab switching."
    }
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const generateDailySchedule = async (apiKey: string, account: string, niche: string, region: string, config: any): Promise<ScheduleSlot[]> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create schedule for ${account} in ${region} for ${niche}. Quantity: ${config.quantity}. Return array of ScheduleSlot JSON.`,
    config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
  });
  return cleanAndParseJSON(response.text || "[]");
};

export const generateChannelAudit = async (apiKey: string, alias: string, provider: string): Promise<ChannelHealthReport> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Audit channel health for ${alias} on ${provider}. Return ChannelHealthReport JSON.`,
    config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const runGovernorExecution = async (alias: string, diagnosis: string): Promise<GovernorAction> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Fix channel ${alias} based on: ${diagnosis}. Return GovernorAction JSON.`,
    config: { responseMimeType: "application/json" }
  });
  const data = cleanAndParseJSON(response.text || "{}");
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...data
  };
};
