
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
    AffiliateHuntResult, SourceMetadata, OrchestratorResponse, 
    ViralDNAProfile, StudioSettings, HunterInsight, NetworkScanResult,
    GoldenHourRecommendation, ScheduleSlot, ChannelHealthReport,
    AppContext, AgentCommand, KnowledgeBase, MissionIntel
} from "../types";

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanAndParseJSON = (text: string): any => {
    try {
        if (!text) return {};
        let cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
        const firstBrace = cleaned.indexOf('{');
        const firstBracket = cleaned.indexOf('[');
        let startIndex = -1;
        let endIndex = -1;
        if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
            startIndex = firstBrace;
            endIndex = cleaned.lastIndexOf('}') + 1;
        } else if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
            startIndex = firstBracket;
            endIndex = cleaned.lastIndexOf(']') + 1;
        }
        if (startIndex !== -1 && endIndex > startIndex) {
            cleaned = cleaned.substring(startIndex, endIndex);
        }
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return { text: text, sentiment: 'neutral', suggestions: [] };
    }
};

/**
 * RECON AGENT: Agent chinh sát sử dụng thuật toán Google Search
 */
export const runAgenticRecon = async (niche: string): Promise<{ 
    discovered_signals: MissionIntel[], 
    market_gaps: string[], 
    trending_keywords: string[], 
    recommended_action: string,
    raw_sources: any[]
}> => {
    const ai = getAi();
    const prompt = `
    ĐÓNG VAI: Chuyên gia phân tích thị trường (Agent Chinh Sát).
    NHIỆM VỤ: Sử dụng Google Search để thu thập dữ liệu về ngách ${niche}.
    CÁC BƯỚC THỰC HIỆN:
    1. Tìm kiếm các sản phẩm đang trending và có mức hoa hồng tốt.
    2. Phân tích điểm yếu của các nội dung hiện tại (competitor gap).
    3. Trích xuất các từ khóa (keywords) có volume tìm kiếm đang tăng.
    4. Dự đoán "Winning Angle" cho video tiếp theo.
    
    TRẢ VỀ JSON:
    {
      "discovered_signals": [
        {
          "product_name": "Tên sản phẩm",
          "platform": "Shopee/Amazon/TikTok Shop",
          "store_name": "Tên cửa hàng nguồn",
          "price_range": "Giá dự kiến",
          "commission_rate": "Hoa hồng %",
          "target_audience": "Đối tượng (VD: GenZ, Nội trợ...)",
          "winning_rationale": "Lý do robot chọn sản phẩm này",
          "market_threat_level": "LOW|MEDIUM|HIGH",
          "competitor_urls": ["url_1", "url_2"]
        }
      ],
      "market_gaps": ["khoảng trống 1", "khoảng trống 2"],
      "trending_keywords": ["keyword 1", "keyword 2"],
      "recommended_action": "Hành động cụ thể"
    }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json"
        }
    });

    const data = cleanAndParseJSON(response.text || "{}");
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { ...data, raw_sources: sources };
};

/**
 * COMMANDER CHAT: Trung tâm điều phối ngôn ngữ Việt
 */
export const sendChatToAssistant = async (apiKey: string, history: any[], text: string, appContext: AppContext): Promise<{ 
    text: string, 
    detected_lang: string, 
    command?: AgentCommand, 
    suggestions: string[], 
    sentiment: 'happy' | 'urgent' | 'thinking' | 'neutral' 
}> => {
    const ai = getAi();
    
    const systemInstruction = `
    Bạn là AI Commander - Chỉ huy trưởng của hệ thống AV Studio.
    PHONG CÁCH: Chuyên gia sáng tạo, quyết đoán, sử dụng tiếng Việt thuần thục và chuyên nghiệp.
    BỐI CẢNH: Người dùng đang ở tab "${appContext.activeTab}".
    JSON OUTPUT:
    {
      "text": "Câu trả lời tiếng Việt (tối đa 2 câu)",
      "detected_lang": "vi",
      "sentiment": "happy|urgent|thinking|neutral",
      "suggestions": ["Hành động gợi ý 1", "Hành động gợi ý 2"],
      "command": { "action": "NAVIGATE|SET_INPUT|EXECUTE_RUN", "payload": "giá_trị" }
    }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
            { role: 'user', parts: [{ text: systemInstruction }] },
            ...history.slice(-10).map(h => ({
                role: h.role === 'model' ? 'model' : 'user',
                parts: [{ text: h.text || h.parts[0].text }]
            })),
            { role: 'user', parts: [{ text: text }] }
        ],
        config: {
            responseMimeType: "application/json",
            temperature: 0.7,
        }
    });

    return cleanAndParseJSON(response.text || "{}");
};

/**
 * TTS: Giọng đọc cảm xúc tiếng Việt
 */
export const generateGeminiTTS = async (text: string, lang: string = 'vi', sentiment: string = 'neutral') => {
    const ai = getAi();
    let voiceName = 'Kore';
    const prefixes = {
        happy: "Nói hào hứng: ",
        urgent: "Nói khẩn cấp: ",
        thinking: "Nói điềm tĩnh: ",
        neutral: "Nói chuyên nghiệp: "
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: (prefixes[sentiment as keyof typeof prefixes] || prefixes.neutral) + text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName } }
            },
        },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const huntAffiliateProducts = async (apiKey: string, niche: string, networks: string[]): Promise<AffiliateHuntResult & { searchSources?: any[] }> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Tìm 3 sản phẩm trending nhất ngách ${niche} trên ${networks.join(',')}. Trả về tiếng Việt, định dạng JSON.`,
        config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "{}");
};

export const generateProScript = async (apiKey: string, dna: ViralDNAProfile, settings: StudioSettings, knowledgeBase?: KnowledgeBase): Promise<OrchestratorResponse> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Viết kịch bản video viral tiếng Việt cho: ${settings.topic}. Trả về JSON OrchestratorResponse.`,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "{}");
};

export const generateVeoVideo = async (prompt: string, aspectRatio: "16:9" | "9:16" = "9:16") => {
    if (!(await window.aistudio.hasSelectedApiKey())) await window.aistudio.openSelectKey();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Tạo video cinematic: ${prompt}`,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio }
    });
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
};

export const runHunterAnalysis = async (apiKey: string, target: string): Promise<HunterInsight> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Phân tích tình báo chiến lược tiếng Việt cho: ${target}. JSON HunterInsight.`,
        config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "{}");
};

export const scanHighValueNetwork = async (apiKey: string, focus: string): Promise<NetworkScanResult> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Quét mạng lưới tìm cơ hội ngách tiếng Việt: ${focus}. JSON NetworkScanResult.`,
        config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "{}");
};

export const synthesizeKnowledge = async (apiKey: string, text: string, existingPrefs: string[]): Promise<string[]> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Trích xuất quy tắc phong cách video tiếng Việt từ: "${text}". Mảng JSON.`,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "[]");
};

export const predictGoldenHours = async (apiKey: string, region: string, niche: string, platforms: string[]): Promise<GoldenHourRecommendation[]> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Dự đoán giờ vàng đăng bài tại ${region} cho ngách ${niche}. Mảng JSON tiếng Việt.`,
        config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "[]");
};

export const generateDailySchedule = async (apiKey: string, account: string, niche: string, region: string, config: any): Promise<ScheduleSlot[]> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Tạo lịch đăng bài tiếng Việt cho kênh ${account}. Mảng JSON.`,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "[]");
};

export const generateChannelAudit = async (apiKey: string, channelName: string, platform: string): Promise<ChannelHealthReport> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Kiểm tra sức khỏe kênh ${channelName} trên ${platform}. Tiếng Việt, JSON.`,
        config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "{}");
};

export const extractViralDNA = async (apiKey: string, urls: string[], context: string, lang: string): Promise<ViralDNAProfile> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Phân tích DNA viral tiếng Việt từ các link: ${urls.join(',')}. JSON.`,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "{}");
};
