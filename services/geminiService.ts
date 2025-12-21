
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
    { id: 'f_01', name: 'Infinite Loop', structure_logic: 'End frame matches start frame.', retention_hook_rule: 'Shocking truth in first sec.', transition_style: 'SEAMLESS' },
    { id: 'f_02', name: 'Pain-Solution', structure_logic: 'Pain -> AI Solution -> Joy.', retention_hook_rule: 'Fast before/after transitions.', transition_style: 'ZOOM_FLOW' }
];

export const generateProScript = async (
  apiKey: string, 
  dna: ViralDNAProfile, 
  settings: StudioSettings, 
  kb: KnowledgeBase
): Promise<OrchestratorResponse> => {
  const ai = getAi();
  
  const formula = VIRAL_FORMULAS.find(f => f.id === kb.globalStrategyRules.viralFormulaId) || VIRAL_FORMULAS[0];

  const prompt = `
    ROLE: Viral Content Strategist & AI Script Engineer.
    TARGET LANGUAGE: ${settings.contentLanguage} (Must generate ALL spoken and text content in this language).
    GLOBAL RULES: 
    - Consistency: ${kb.globalStrategyRules.enforceConsistency ? 'STRICT' : 'Flexible'}
    - Transitions: ${kb.globalStrategyRules.seamlessTransitionLogic ? 'SEAMLESS (Match cut, Zoom)' : 'Standard cuts'}
    - Viral Formula: ${formula.name} - ${formula.structure_logic}
    
    TOPIC: ${settings.topic}
    DNA PROFILE: ${JSON.stringify(dna)}
    FORMAT: ${settings.videoFormat} (Hook strength: ${settings.hookStrength}%).

    RETURN JSON OrchestratorResponse:
    - Ensure 'vo_text' is high-impact and native to ${settings.contentLanguage}.
    - Include SEO metadata optimized for the target market.
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
  const prompt = `Analyze Viral DNA for: ${urls.join(', ')}. Target Market Language: ${lang}. Return JSON ViralDNAProfile.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const generateGeminiTTS = async (text: string, lang: string = 'en', sentiment: string = 'neutral'): Promise<string> => {
  const ai = getAi();
  
  // Map App/Content language to TTS-friendly hints
  const langHints: any = {
    vi: 'Vietnamese',
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    th: 'Thai'
  };

  const styledPrompt = `Speak the following in ${langHints[lang] || 'English'} with a ${sentiment} emotion: ${text}`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: styledPrompt }] }],
    config: { 
      responseModalities: [Modality.AUDIO], 
      speechConfig: { 
        voiceConfig: { 
          prebuiltVoiceConfig: { voiceName: lang === 'vi' ? 'Kore' : 'Zephyr' } 
        } 
      } 
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const runSeoAudit = async (title: string, description: string, topic: string): Promise<SEOAudit> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Audit SEO for "${title}" in context of "${topic}". Use Google Search to check global trends. Return JSON SEOAudit.`,
    config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const runNeuralOverhaul = async (currentPlan: any, audit: any): Promise<any> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Restructure script due to low SEO: ${JSON.stringify(audit)}. Old data: ${JSON.stringify(currentPlan)}.`,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "{}");
};

export const runAgenticRecon = async (niche: string): Promise<any> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Hunt for high-commission products in ${niche}. Search globally. Return JSON {discovered_signals, trending_keywords}.`,
    config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const predictGoldenHours = async (apiKey: string, region: string, niche: string, platforms: string[]): Promise<any[]> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Predict Golden Hours in ${region} for ${niche} on ${platforms.join(',')}. Return JSON array.`,
    config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
  });
  return cleanAndParseJSON(response.text || "[]");
};

export const runCompetitorDeepDive = async (url: string): Promise<CompetitorDeepAudit> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Deep analyze competitor at ${url}. Return CompetitorDeepAudit JSON.`,
    config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
  });
  return cleanAndParseJSON(response.text || "{}");
};

export const huntAffiliateProducts = async (apiKey: string, niche: string, networks: string[]): Promise<AffiliateHuntResult> => {
  const ai = getAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Find trending affiliate products in ${niche}. Networks: ${networks.join(', ')}. Return AffiliateHuntResult JSON.`,
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
      systemInstruction: `You are AI Commander. Help user manage AV Studio. Use NAVIGATE command for tab switching. 
      IMPORTANT: Respond in the language detected from the user message. Be professional and high-tech.`
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
