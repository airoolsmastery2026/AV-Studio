
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
    AffiliateHuntResult, SourceMetadata, OrchestratorResponse, 
    ViralDNAProfile, StudioSettings, HunterInsight, NetworkScanResult,
    GoldenHourRecommendation, ScheduleSlot, ChannelHealthReport,
    AppContext, AgentCommand
} from "../types";

// Helper to create a new AI instance before each call to ensure fresh API key context
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
        return {};
    }
};

/**
 * GOOGLE SEARCH GROUNDING: Trend Hunter Pro
 */
export const huntAffiliateProducts = async (apiKey: string, niche: string, networks: string[]): Promise<AffiliateHuntResult & { searchSources?: any[] }> => {
    const ai = getAi();
    const prompt = `SEARCH GROUNDING TASK: 
    1. Find 3 trending products in the "${niche}" niche right now (2024-2025 trends).
    2. Focus on high views velocity on TikTok/YouTube.
    3. Suggest products available on ${networks.join(', ')}.
    Return ONLY JSON with 'products' (name, commission_est, opportunity_score, reason_to_promote) and 'strategy_note'.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Pro for grounding
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
        }
    });

    const searchSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    return { 
        ...cleanAndParseJSON(response.text || "{}"),
        searchSources 
    };
};

/**
 * VEO ENGINE
 */
export const generateVeoVideo = async (prompt: string, aspectRatio: "16:9" | "9:16" = "9:16") => {
    const ai = getAi();
    // Mandatory key check for Veo models as per guidelines
    if (!(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
    }

    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio
        }
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

/**
 * TTS ENGINE
 */
export const generateGeminiTTS = async (text: string, voiceName: string = 'Kore') => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName }
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
};

/**
 * DNA Extraction for Viral Content Analysis
 */
export const extractViralDNA = async (apiKey: string, urls: string[], context: string, lang: string): Promise<ViralDNAProfile> => {
    const ai = getAi();
    const prompt = `Analyze Viral DNA: ${urls.join(', ')}. Lang: ${lang}. JSON format.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "{}");
};

/**
 * Generate Production Plan using Gemini 3 Pro
 */
export const generateProScript = async (apiKey: string, dna: ViralDNAProfile, settings: StudioSettings): Promise<OrchestratorResponse> => {
    const ai = getAi();
    const prompt = `Create video plan based on DNA. Settings: ${JSON.stringify(settings)}. Output JSON.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "{}");
};

/**
 * HUNTER ANALYSIS: Deep recon on a target
 */
export const runHunterAnalysis = async (apiKey: string, target: string): Promise<HunterInsight> => {
    const ai = getAi();
    const prompt = `STRATEGIC INTELLIGENCE TASK:
    Target: "${target}"
    1. Perform deep reconnaissance on this target (competitor or niche).
    2. Identify match_score (0-100), market_status, key_metrics (views, engagement, etc).
    3. Analyze consumer psychology, competitor weakness, profit potential, and risk assessment.
    4. Provide a strategic_suggestion.
    Return ONLY JSON matching HunterInsight interface.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
        }
    });

    return cleanAndParseJSON(response.text || "{}");
};

/**
 * NETWORK SCAN: Finding high-value targets
 */
export const scanHighValueNetwork = async (apiKey: string, focus: string): Promise<NetworkScanResult> => {
    const ai = getAi();
    const prompt = `NETWORK SCAN TASK:
    Focus Area: "${focus}"
    1. Find top 5 high-value targets (channels or products) in this focus area.
    2. Return scan_id, focus_area, and a list of targets (rank, name, url, reason).
    Return ONLY JSON matching NetworkScanResult interface.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
        }
    });

    return cleanAndParseJSON(response.text || "{}");
};

/**
 * CHAT ASSISTANT: Brain of AV Commander
 */
export const sendChatToAssistant = async (apiKey: string, history: any[], text: string, appContext: AppContext): Promise<{ text: string, command?: AgentCommand }> => {
    const ai = getAi();
    const prompt = `You are AV Commander, the AI orchestrator for a video automation SaaS.
    User Question: "${text}"
    App Context: ${JSON.stringify(appContext)}
    
    If you need to navigate the user or perform an action, include a 'command' field in your JSON response.
    Actions available: NAVIGATE, SET_INPUT, EXECUTE_RUN, UPDATE_MEMORY.
    Return ONLY JSON with 'text' (your response) and optional 'command' (action, payload, reasoning).`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [...history.flatMap(h => h.parts), { text: prompt }] }],
        config: {
            responseMimeType: "application/json",
        }
    });

    return cleanAndParseJSON(response.text || "{}");
};

/**
 * KNOWLEDGE SYNTHESIS: Training the AI Brain
 */
export const synthesizeKnowledge = async (apiKey: string, text: string, existingPrefs: string[]): Promise<string[]> => {
    const ai = getAi();
    const prompt = `KNOWLEDGE SYNTHESIS TASK:
    New Information: "${text}"
    Existing Preferences: ${JSON.stringify(existingPrefs)}
    
    Extract unique, actionable "Universal Truths" or "Preferences" from the new information that don't conflict with existing ones.
    Return ONLY a JSON array of strings.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });

    return cleanAndParseJSON(response.text || "[]");
};

/**
 * GOLDEN HOURS: Trend-based scheduling
 */
export const predictGoldenHours = async (apiKey: string, region: string, niche: string, platforms: string[]): Promise<GoldenHourRecommendation[]> => {
    const ai = getAi();
    const prompt = `GOLDEN HOUR PREDICTION:
    Region: ${region}, Niche: ${niche}, Platforms: ${platforms.join(', ')}
    Find the best times to post for maximum engagement based on current 2024-2025 trends.
    Return ONLY a JSON array of GoldenHourRecommendation objects (time_label, reason, score).`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
        }
    });

    return cleanAndParseJSON(response.text || "[]");
};

/**
 * DAILY SCHEDULE GENERATION
 */
export const generateDailySchedule = async (apiKey: string, account: string, niche: string, region: string, config: any): Promise<ScheduleSlot[]> => {
    const ai = getAi();
    const prompt = `DAILY SCHEDULE GENERATION:
    Account: ${account}, Niche: ${niche}, Region: ${region}
    Config: ${JSON.stringify(config)}
    Generate a series of posting slots.
    Return ONLY a JSON array of ScheduleSlot objects (slot_id, time_of_day, purpose, target_audience_activity).`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });

    return cleanAndParseJSON(response.text || "[]");
};

/**
 * CHANNEL AUDIT: Health & Risk Scan
 */
export const generateChannelAudit = async (apiKey: string, channelName: string, platform: string): Promise<ChannelHealthReport> => {
    const ai = getAi();
    const prompt = `CHANNEL AUDIT REPORT:
    Channel: ${channelName}, Platform: ${platform}
    1. Scan for shadowbans, copyright strikes, or engagement penalties using Google Search grounding.
    2. Provide metrics (views_growth, avg_watch_time, ctr).
    3. List risks (type, severity, description).
    4. Provide ai_diagnosis and action_plan.
    Return ONLY JSON matching ChannelHealthReport interface.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
        }
    });

    return cleanAndParseJSON(response.text || "{}");
};
