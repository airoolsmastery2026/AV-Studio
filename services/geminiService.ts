
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

// Helper to clean JSON string from Markdown code blocks
const cleanAndParseJSON = (text: string): any => {
    try {
        if (!text) return {};
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        // Return null or empty object to handle gracefully upstream
        return {};
    }
};

export const huntAffiliateProducts = async (apiKey: string, niche: string, networks: string[]): Promise<AffiliateHuntResult> => { 
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
        ACT AS AN ELITE AFFILIATE MARKETING STRATEGIST & TREND HUNTER.
        
        MISSION: Identify trending, high-commission affiliate products in the niche: "${niche}".
        FOCUS NETWORKS: ${networks.join(', ')}.
        
        CRITERIA:
        1. **High Commission / High Ticket**: Prioritize products with high payouts, recurring revenue (SaaS), or high CPAs.
        2. **Trending & Low Competition**: Look for "Blue Ocean" opportunities, new AI tool launches, or viral gadgets before they saturate.
        3. **Viral Potential**: Products that are visually demonstrable or solve a painful problem instantly.
        
        SPECIFIC INSTRUCTIONS FOR AI NICHE (If applicable):
        - Focus on tools for: Automation, Generative Video, Deepfake/Avatar, Trading Bots, or No-Code Builders.
        - Look for "Lifetime Deal" or "Recurring" commission structures.
        
        OUTPUT:
        Return a JSON object with a list of 'products' and a 'strategy_note'.
        For each product, provide a specific 'content_angle' (e.g., "Compare X vs Y", "Exposing the Secret", "Tutorial for Beginners") that maximizes clicks.
        The 'strategy_note' should be a brief, high-level tactical advice for this batch of products.
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
                            },
                            required: ['product_name', 'opportunity_score', 'affiliate_link', 'content_angle']
                        }
                    },
                    strategy_note: { type: Type.STRING }
                },
                required: ['products', 'strategy_note']
            }
        }
    });
    return cleanAndParseJSON(response.text || "{}");
}

// --- AGENT PIPELINE FUNCTIONS ---

export const agentProcessSignal = async (apiKey: string, input: string): Promise<SourceMetadata> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Analyze this input signal: "${input}". 
    Determine if it is a Product URL, a Channel URL, or a Topic.
    Suggest a Content Workflow (AUTO, VIRAL_CLONE, REVIEW_TUTORIAL, etc.).
    Return JSON.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    url: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['channel', 'product', 'auto_detect'] },
                    detected_strategy: { type: Type.STRING },
                    notes: { type: Type.STRING }
                }
            }
        }
    });
    return cleanAndParseJSON(response.text || "{}");
};

export const agentGenerateScript = async (apiKey: string, metadata: SourceMetadata): Promise<OrchestratorResponse> => {
    // Re-use generateVideoPlan logic but tailored for the agent pipeline
    return generateVideoPlan(apiKey, metadata);
};

export const agentDirectVisuals = async (apiKey: string, plan: OrchestratorResponse): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Based on this script: "${plan.production_plan.script_master}", generate 3 high-fidelity image prompts for Google Veo/Imagen. Return JSON array of strings.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    const parsed = cleanAndParseJSON(response.text || "[]");
    return Array.isArray(parsed) ? parsed : [];
};

export const agentSynthesizeVoice = async (apiKey: string, plan: OrchestratorResponse): Promise<string> => {
    // Simulate voice generation URL
    return "https://example.com/audio_generated.mp3";
};

// --- ANALYTICS & HUNTER FUNCTIONS ---

export const runHunterAnalysis = async (apiKey: string, target: string): Promise<HunterInsight> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Analyze the viral potential of: "${target}". Provide strategic insights. Return JSON matching HunterInsight interface.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "{}");
};

export const scanHighValueNetwork = async (apiKey: string, focus: string): Promise<NetworkScanResult> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Scan high RPM niches related to "${focus}". Return JSON matching NetworkScanResult interface with 3 targets.`;
     const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "{}");
};

// --- CHAT FUNCTIONS ---

export const sendChatToAssistant = async (apiKey: string, history: any[], message: string, context: AppContext): Promise<{text: string, command?: AgentCommand}> => {
    const ai = new GoogleGenAI({ apiKey });
    
    // Inject Knowledge Base into System Instruction
    const knowledgeString = context.knowledgeBase.learnedPreferences.length > 0 
        ? `\n\n[ACCESSING LONG-TERM MEMORY]:\n${context.knowledgeBase.learnedPreferences.map(p => `- ${p}`).join('\n')}`
        : "";

    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: history,
        config: {
            systemInstruction: `You are AV Commander, an AI Agent for Video Automation. 
            Context: Active Tab: ${context.activeTab}, Status: ${context.status}.
            You can execute commands by returning a JSON block at the end of your response.
            Available commands: NAVIGATE (to tabs), EXECUTE_RUN, UPDATE_MEMORY.
            Structure: { "text": "response", "command": { "action": "...", "payload": "..." } }
            
            ${knowledgeString}
            
            Always prioritize helpfulness and brevity.`
        }
    });

    const response = await chat.sendMessage({ message });
    
    try {
        // Attempt to parse JSON command if the model output is purely JSON or wrapped in block
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
};

export const synthesizeKnowledge = async (apiKey: string, text: string, current: string[]): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Synthesize this text into concise strategic rules (max 5) for video creation. Existing rules: ${current.join('; ')}. New text: "${text}". Return JSON array of strings.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "[]");
};

// --- QUEUE & SCHEDULE FUNCTIONS ---

export const predictGoldenHours = async (apiKey: string, region: string, niche: string, platforms: string[]): Promise<GoldenHourRecommendation[]> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Predict best posting times for ${niche} in ${region} on ${platforms.join(',')}. Return JSON array of GoldenHourRecommendation.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "[]");
};

export const generateDailySchedule = async (apiKey: string, account: string, niche: string, region: string, config: any): Promise<ScheduleSlot[]> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Generate a posting schedule for ${account} (${niche}) in ${region}. Config: ${JSON.stringify(config)}. Return JSON array of ScheduleSlot.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "[]");
};

// --- CHANNEL HEALTH ---

export const generateChannelAudit = async (apiKey: string, channel: string, platform: string): Promise<ChannelHealthReport> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Audit channel ${channel} on ${platform}. Simulate risk analysis. Return JSON matching ChannelHealthReport.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "{}");
};

// --- BATCH & STUDIO FUNCTIONS ---

export const classifyInput = async (apiKey: string, input: string): Promise<{type: 'channel' | 'product' | 'auto_detect', strategy: string}> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Classify: "${input}". Return JSON with 'type' (channel/product/auto_detect) and 'strategy' (AUTO/VIRAL_CLONE/etc).`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "{}");
};

export const generateVideoPlan = async (apiKey: string, metadata: SourceMetadata): Promise<OrchestratorResponse> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Generate a viral video production plan for: ${JSON.stringify(metadata)}. 
    Include market_scoring, audience_personas, deep_analysis, production_plan, generated_content.
    Return JSON matching OrchestratorResponse interface.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { 
            responseMimeType: "application/json",
            // We can add detailed schema here, but for brevity using prompt engineering for now
            // typically you would define the full schema
        }
    });
    return cleanAndParseJSON(response.text || "{}");
};

export const extractViralDNA = async (apiKey: string, urls: string[], context: string, lang: string): Promise<ViralDNAProfile> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Extract Viral DNA from these urls: ${urls.join(', ')}. Context: ${context}. Language: ${lang}. Return JSON matching ViralDNAProfile.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "{}");
};

export const generateProScript = async (apiKey: string, dna: ViralDNAProfile, settings: StudioSettings): Promise<OrchestratorResponse> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Generate a pro script based on DNA: ${JSON.stringify(dna)} and Settings: ${JSON.stringify(settings)}. Return JSON matching OrchestratorResponse.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview", // Use stronger model for script
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "{}");
};
