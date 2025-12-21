
import { GoogleGenAI, Type } from "@google/genai";
import { 
    AffiliateHuntResult, SourceMetadata, OrchestratorResponse, 
    ViralDNAProfile, StudioSettings, HunterInsight, NetworkScanResult,
    GoldenHourRecommendation, ScheduleSlot, ChannelHealthReport,
    ScriptModel, VisualModel, VoiceModel, VideoResolution, AspectRatio,
    ContentWorkflow, AgentCommand, AppContext, ChatMessage,
    CompletedVideo,
    ContentNiche
} from "../types";

// DEEP OPTIMIZATION: Surgical JSON Extraction
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
        return {};
    }
};

const safeApiCall = async <T>(apiCall: () => Promise<any>, fallbackValue: T): Promise<T> => {
    try {
        const result = await apiCall();
        if (Array.isArray(fallbackValue) && (!result || (typeof result === 'object' && Object.keys(result).length === 0))) {
            return fallbackValue;
        }
        return result;
    } catch (error: any) {
        console.error("Gemini API Error:", error.message);
        if (error.message.includes('429') || error.message.includes('Quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
            throw new Error("QUOTA_EXCEEDED");
        }
        return fallbackValue;
    }
};

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const huntAffiliateProducts = async (apiKey: string, niche: string, networks: string[]): Promise<AffiliateHuntResult> => { 
    return safeApiCall(async () => {
        const ai = getAi();
        
        const isMultiNiche = niche.toLowerCase().includes('đa ngách') || niche.toLowerCase().includes('multi') || niche === 'MULTI_NICHE';
        
        const multiNicheLogic = isMultiNiche 
            ? `SPECIAL MISSION: Multi-Niche (Đa Ngách) Strategy. 
               Identify products that connect DIFFERENT categories (e.g., Tech for Beauty, Finance for Students, AI for Home).
               Focus on "Hybrid Value": Products that solve multiple problems for a broad audience.
               PRIORITY: High commission (>30%) and high viral visual potential.`
            : `FOCUS NICHE: "${niche}".`;

        const prompt = `
            ACT AS AN ELITE AFFILIATE MARKETING STRATEGIST & TREND HUNTER.
            ${multiNicheLogic}
            TARGET NETWORKS: ${networks.join(', ')}.
            
            TASKS:
            1. Find 3-5 trending products with high conversion potential.
            2. For each, suggest a "Winning Content Angle" (Viral storytelling style).
            3. Estimate opportunity score (0-100).
            
            OUTPUT: JSON with 'products' and 'strategy_note'.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        products: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    product_name: { type: Type.STRING },
                                    network: { type: Type.STRING },
                                    commission_est: { type: Type.STRING },
                                    opportunity_score: { type: Type.NUMBER },
                                    affiliate_link: { type: Type.STRING },
                                    reason_to_promote: { type: Type.STRING },
                                    content_angle: { type: Type.STRING }
                                }
                            }
                        },
                        strategy_note: { type: Type.STRING }
                    }
                }
            }
        });
        return cleanAndParseJSON(response.text || "{}");
    }, { products: [], strategy_note: "API Error. Retrying..." });
}

export const agentProcessSignal = async (apiKey: string, input: string): Promise<SourceMetadata> => {
    return safeApiCall(async () => {
        const ai = getAi();
        const prompt = `Analyze this input signal: "${input}". Determine if it is a Product URL, a Channel URL, or a Topic. Return JSON.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "{}");
    }, { url: input, type: 'auto_detect', detected_strategy: 'AUTO' });
};

export const agentGenerateScript = async (apiKey: string, metadata: SourceMetadata): Promise<OrchestratorResponse> => {
    return generateVideoPlan(apiKey, metadata);
};

export const agentDirectVisuals = async (apiKey: string, plan: OrchestratorResponse): Promise<string[]> => {
    return safeApiCall(async () => {
        const ai = getAi();
        const prompt = `Generate 3 image prompts for: "${plan.production_plan?.script_master || ''}". Return JSON array.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "[]");
    }, []);
};

export const agentSynthesizeVoice = async (apiKey: string, plan: OrchestratorResponse): Promise<string> => {
    return "https://example.com/audio_generated.mp3";
};

export const runHunterAnalysis = async (apiKey: string, target: string): Promise<HunterInsight> => {
    return safeApiCall(async () => {
        const ai = getAi();
        const prompt = `Analyze viral potential of: "${target}". Return JSON HunterInsight.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "{}");
    }, {} as HunterInsight);
};

export const scanHighValueNetwork = async (apiKey: string, focus: string): Promise<NetworkScanResult> => {
    return safeApiCall(async () => {
        const ai = getAi();
        const prompt = `Scan high RPM niches for "${focus}". Return JSON NetworkScanResult.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "{}");
    }, {} as NetworkScanResult);
};

export const sendChatToAssistant = async (apiKey: string, history: any[], message: string, context: AppContext): Promise<{text: string, command?: AgentCommand}> => {
    return safeApiCall(async () => {
        const ai = getAi();
        const chat = ai.chats.create({
            model: "gemini-3-flash-preview",
            history: history,
            config: {
                systemInstruction: `You are AV Commander. Status: ${context.status}. Tab: ${context.activeTab}. Help the user manage their affiliate production workflow.`
            }
        });
        const response = await chat.sendMessage({ message: message });
        try {
            const text = response.text || "";
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                if (data.text || data.command) return { text: data.text || text, command: data.command };
            }
        } catch (e) {}
        return { text: response.text || "" };
    }, { text: "Connection error." });
};

export const synthesizeKnowledge = async (apiKey: string, text: string, current: string[]): Promise<string[]> => {
    return safeApiCall(async () => {
        const ai = getAi();
        const prompt = `Synthesize rules. Existing: ${current.join('; ')}. New: "${text}". JSON array.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "[]");
    }, []);
};

export const predictGoldenHours = async (apiKey: string, region: string, niche: string, platforms: string[]): Promise<GoldenHourRecommendation[]> => {
    return safeApiCall(async () => {
        const ai = getAi();
        const prompt = `Best post times for ${niche} in ${region}. JSON array.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "[]");
    }, []);
};

export const generateDailySchedule = async (apiKey: string, account: string, niche: string, region: string, config: any): Promise<ScheduleSlot[]> => {
    return safeApiCall(async () => {
        const ai = getAi();
        const prompt = `Post schedule. JSON array.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "[]");
    }, []);
};

export const generateChannelAudit = async (apiKey: string, channel: string, platform: string): Promise<ChannelHealthReport> => {
    return safeApiCall(async () => {
        const ai = getAi();
        const prompt = `Audit ${channel}. JSON ChannelHealthReport.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "{}");
    }, { channel_name: channel, platform: platform as any, health_score: 0, status: 'AT_RISK', metrics: { views_growth: '0%', avg_watch_time: '0s', ctr: '0%' }, risks: [], ai_diagnosis: 'Failed.', action_plan: [] });
};

export const classifyInput = async (apiKey: string, input: string): Promise<{type: 'channel' | 'product' | 'auto_detect', strategy: string}> => {
    return safeApiCall(async () => {
        const ai = getAi();
        const prompt = `Classify: "${input}". JSON.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "{}");
    }, { type: 'auto_detect', strategy: 'AUTO' });
};

export const generateVideoPlan = async (apiKey: string, metadata: SourceMetadata): Promise<OrchestratorResponse> => {
    return safeApiCall(async () => {
        const ai = getAi();
        const prompt = `Video plan for: ${JSON.stringify(metadata)}. JSON OrchestratorResponse.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "{}");
    }, {} as OrchestratorResponse);
};

export const extractViralDNA = async (apiKey: string, urls: string[], context: string, lang: string): Promise<ViralDNAProfile> => {
    return safeApiCall(async () => {
        const ai = getAi();
        const prompt = `Viral DNA from: ${urls.join(', ')}. Lang: ${lang}. JSON ViralDNAProfile.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "{}");
    }, {} as ViralDNAProfile);
};

export const generateProScript = async (apiKey: string, dna: ViralDNAProfile, settings: StudioSettings): Promise<OrchestratorResponse> => {
    return safeApiCall(async () => {
        const ai = getAi();
        const prompt = `Pro script for DNA. Settings: ${JSON.stringify(settings)}. JSON OrchestratorResponse.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "{}");
    }, {} as OrchestratorResponse);
};
