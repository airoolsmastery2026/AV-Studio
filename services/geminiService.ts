
import { GoogleGenAI, Type, Schema } from "@google/genai";
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
// Finds the first '{' or '[' and the last '}' or ']' to ignore conversational filler text.
const cleanAndParseJSON = (text: string): any => {
    try {
        if (!text) return {};
        
        // 1. Remove Markdown code blocks (Case insensitive)
        let cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
        
        // 2. Surgical Extraction: Find the outermost JSON object/array
        const firstBrace = cleaned.indexOf('{');
        const firstBracket = cleaned.indexOf('[');
        
        let startIndex = -1;
        let endIndex = -1;

        // Determine if it's likely an Object or Array
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
        console.error("JSON Parse Error (Safety Fallback Triggered):", e);
        // Return empty object to prevent app crash
        return {};
    }
};

// Generic wrapper to handle API errors
const safeApiCall = async <T>(apiCall: () => Promise<any>, fallbackValue: T): Promise<T> => {
    try {
        const result = await apiCall();
        // Double check: if result is empty object but fallback is array, return fallback
        if (Array.isArray(fallbackValue) && (!result || (typeof result === 'object' && Object.keys(result).length === 0))) {
            return fallbackValue;
        }
        return result;
    } catch (error: any) {
        console.error("Gemini API Error:", error.message);
        
        // CRITICAL: Detect Quota Exceeded (429) and throw it so App.tsx can rotate keys
        if (error.message.includes('429') || error.message.includes('Quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
            throw new Error("QUOTA_EXCEEDED");
        }

        // For other errors (parsing, bad prompt), return fallback to keep UI alive
        return fallbackValue;
    }
};

export const huntAffiliateProducts = async (apiKey: string, niche: string, networks: string[]): Promise<AffiliateHuntResult> => { 
    return safeApiCall(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
            ACT AS AN ELITE AFFILIATE MARKETING STRATEGIST & TREND HUNTER.
            MISSION: Identify trending, high-commission affiliate products in the niche: "${niche}".
            FOCUS NETWORKS: ${networks.join(', ')}.
            OUTPUT: JSON with 'products' (name, network, commission, link, angle) and 'strategy_note'.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
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

// --- AGENT PIPELINE FUNCTIONS ---

export const agentProcessSignal = async (apiKey: string, input: string): Promise<SourceMetadata> => {
    return safeApiCall(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Analyze this input signal: "${input}". 
        Determine if it is a Product URL, a Channel URL, or a Topic.
        Suggest a Content Workflow (AUTO, VIRAL_CLONE, REVIEW_TUTORIAL, etc.).
        Return JSON.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
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
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Based on this script: "${plan.production_plan?.script_master || ''}", generate 3 high-fidelity image prompts for Google Veo/Imagen. Return JSON array of strings.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const parsed = cleanAndParseJSON(response.text || "[]");
        return Array.isArray(parsed) ? parsed : [];
    }, []);
};

export const agentSynthesizeVoice = async (apiKey: string, plan: OrchestratorResponse): Promise<string> => {
    return "https://example.com/audio_generated.mp3";
};

// --- ANALYTICS & HUNTER FUNCTIONS ---

export const runHunterAnalysis = async (apiKey: string, target: string): Promise<HunterInsight> => {
    return safeApiCall(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Analyze viral potential of: "${target}". Return JSON matching HunterInsight interface.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "{}");
    }, {} as HunterInsight);
};

export const scanHighValueNetwork = async (apiKey: string, focus: string): Promise<NetworkScanResult> => {
    return safeApiCall(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Scan high RPM niches related to "${focus}". Return JSON matching NetworkScanResult interface.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "{}");
    }, {} as NetworkScanResult);
};

// --- CHAT FUNCTIONS ---

export const sendChatToAssistant = async (apiKey: string, history: any[], message: string, context: AppContext): Promise<{text: string, command?: AgentCommand}> => {
    return safeApiCall(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            history: history,
            config: {
                systemInstruction: `You are AV Commander. Context: ${context.status}. Return JSON command if needed.`
            }
        });

        const response = await chat.sendMessage({ message });
        
        try {
            const text = response.text || "";
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                if (data.text || data.command) {
                    return { text: data.text || text, command: data.command };
                }
            }
        } catch (e) {}
        
        return { text: response.text || "" };
    }, { text: "Connection unstable. Please try again." });
};

export const synthesizeKnowledge = async (apiKey: string, text: string, current: string[]): Promise<string[]> => {
    return safeApiCall(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Synthesize concise strategic rules. Existing: ${current.join('; ')}. New: "${text}". Return JSON array.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "[]");
    }, []);
};

// --- QUEUE & SCHEDULE FUNCTIONS ---

export const predictGoldenHours = async (apiKey: string, region: string, niche: string, platforms: string[]): Promise<GoldenHourRecommendation[]> => {
    return safeApiCall(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Predict best posting times for ${niche} in ${region}. Return JSON array of GoldenHourRecommendation.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "[]");
    }, []);
};

export const generateDailySchedule = async (apiKey: string, account: string, niche: string, region: string, config: any): Promise<ScheduleSlot[]> => {
    return safeApiCall(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Generate posting schedule. Config: ${JSON.stringify(config)}. Return JSON array of ScheduleSlot.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "[]");
    }, []);
};

export const generateChannelAudit = async (apiKey: string, channel: string, platform: string): Promise<ChannelHealthReport> => {
    return safeApiCall(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Audit channel ${channel} on ${platform}. Simulate risk analysis. Return JSON matching ChannelHealthReport.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "{}");
    }, { channel_name: channel, platform: platform as any, health_score: 0, status: 'AT_RISK', metrics: { views_growth: '0%', avg_watch_time: '0s', ctr: '0%' }, risks: [], ai_diagnosis: 'Analysis failed.', action_plan: [] });
};

// --- BATCH & STUDIO FUNCTIONS ---

export const classifyInput = async (apiKey: string, input: string): Promise<{type: 'channel' | 'product' | 'auto_detect', strategy: string}> => {
    return safeApiCall(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Classify: "${input}". Return JSON with 'type' and 'strategy'.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "{}");
    }, { type: 'auto_detect', strategy: 'AUTO' });
};

export const generateVideoPlan = async (apiKey: string, metadata: SourceMetadata): Promise<OrchestratorResponse> => {
    return safeApiCall(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Generate viral video plan for: ${JSON.stringify(metadata)}. Return JSON matching OrchestratorResponse.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "{}");
    }, {} as OrchestratorResponse);
};

export const extractViralDNA = async (apiKey: string, urls: string[], context: string, lang: string): Promise<ViralDNAProfile> => {
    return safeApiCall(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Extract Viral DNA from: ${urls.join(', ')}. Lang: ${lang}. Return JSON matching ViralDNAProfile.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "{}");
    }, {} as ViralDNAProfile);
};

export const generateProScript = async (apiKey: string, dna: ViralDNAProfile, settings: StudioSettings): Promise<OrchestratorResponse> => {
    return safeApiCall(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Generate pro script based on DNA. Settings: ${JSON.stringify(settings)}. Return JSON matching OrchestratorResponse.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Reverted to 2.5 Flash to save quota (Pro is expensive/limited)
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "{}");
    }, {} as OrchestratorResponse);
};
