
import { GoogleGenAI, Type } from "@google/genai";
import { 
  OrchestratorResponse, SourceMetadata, ContentWorkflow, AppContext, AgentCommand, 
  NicheAnalysisResult, CompetitorAnalysisResult, AffiliateHuntResult, 
  GoldenHourRecommendation, TargetRegion, ChannelHealthReport, HunterInsight, 
  ScheduleSlot, NetworkScanResult, ViralDNAProfile, StudioSettings, 
  ContentLanguage 
} from "../types";

// --- STRICT LANGUAGE PROTOCOL (LAYER 3) ---
const STRICT_LANGUAGE_PROTOCOL = `
*** CRITICAL SYSTEM DIRECTIVE: LANGUAGE LOCK ***
1. YOU ARE LOCKED TO THE TARGET LANGUAGE: {{TARGET_LANGUAGE}}.
2. ALL OUTPUT (Thought process, Analysis, Script, Metadata) MUST BE IN {{TARGET_LANGUAGE}}.
3. IF SOURCE CONTENT IS IN A DIFFERENT LANGUAGE, YOU MUST TRANSLATE AND LOCALIZE IT FULLY TO {{TARGET_LANGUAGE}}.
4. DO NOT MIX LANGUAGES.
5. NO "VIET-ENGLISH" or "CHINGLISH". PURE, NATURAL {{TARGET_LANGUAGE}}.
`;

// Helper to get language name for prompt injection
const getLanguageName = (lang: ContentLanguage | undefined): string => {
    switch(lang) {
        case 'en': return "ENGLISH (US) - Native style";
        case 'es': return "SPANISH (Español) - Neutral/LatAm";
        case 'jp': return "JAPANESE (日本語) - Natural/Polite";
        case 'cn': return "CHINESE (中文) - Simplified/Mandarin";
        case 'de': return "GERMAN (Deutsch) - Professional";
        case 'fr': return "FRENCH (Français) - Parisian";
        case 'kr': return "KOREAN (한국어) - Natural";
        case 'vi': 
        default: return "VIETNAMESE (Tiếng Việt) - Northern Accent Standard";
    }
};

// --- ROBUST JSON PARSER HELPER ---
// Fixes the issue where AI returns markdown code blocks (```json ... ```)
const cleanAndParseJSON = (text: string | undefined): any => {
    if (!text) throw new Error("AI returned empty response.");
    
    let cleanedText = text.trim();
    
    // Remove Markdown code blocks if present
    if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```(json)?/, "").replace(/```$/, "");
    }
    
    // Attempt to parse
    try {
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("JSON Parse Error. Raw text:", text);
        // Fallback: Try to find JSON object within text if there's conversational fluff
        const firstBrace = cleanedText.indexOf('{');
        const lastBrace = cleanedText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            try {
                return JSON.parse(cleanedText.substring(firstBrace, lastBrace + 1));
            } catch (e2) {
                throw new Error("Failed to extract valid JSON from AI response.");
            }
        }
        throw new Error("Invalid JSON format from AI.");
    }
};

const SYSTEM_INSTRUCTION_DNA_EXTRACTOR = `
You are the **VIRAL DNA ANALYZER**.
Your task is to analyze metadata from competitor channels/videos and extract their "Viral DNA" structure.

${STRICT_LANGUAGE_PROTOCOL}

**INPUT:** List of URLs from competitor channels or file names.

**OUTPUT:** A JSON object representing the 'ViralDNAProfile'.
- **Structure:** Common hook types, pacing, duration.
- **Emotional Curve:** Typical emotional flow.
- **Keywords:** High-frequency keywords (in TARGET LANGUAGE).
- **Channel Breakdown:** Specific analysis for each input channel.
`;

const SYSTEM_INSTRUCTION_PRO_STUDIO_WRITER = `
You are the **PRO SCRIPT GENERATOR AI**.
You generate scripts specifically optimized for **High RPM, High CPM, and Maximum Watch Time**.

${STRICT_LANGUAGE_PROTOCOL}

**CORE PHILOSOPHY: RETENTION IS KING.**
Your goal is NOT to sell a product. Your goal is to keep the viewer watching as long as possible.

**RULES:**
1. **NO SALES PITCH:** Do not sell anything. Focus on value, entertainment, or shock factor.
2. **ALGORITHM HACKING:** Use patterns that trigger the algorithm (Loops, Open Loops, Curiosity Gaps).
3. **ORIGINALITY:** Create 100% NEW CONTENT based on the DNA structure. DO NOT CLONE/COPY TEXT.
4. **LANGUAGE:** Must correspond exactly to {{TARGET_LANGUAGE}}.

**OUTPUT:** A comprehensive JSON object containing the script, visual cues, and technical direction.
`;

export const classifyInput = async (apiKey: string, url: string): Promise<{ type: 'channel' | 'product', strategy: ContentWorkflow }> => {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Analyze this URL: ${url}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['channel', 'product'] },
          strategy: { type: Type.STRING, enum: ['VIRAL_CLONE', 'REVIEW_TUTORIAL', 'NEWS_SUMMARY'] }
        },
        required: ['type', 'strategy']
      }
    }
  });
  return cleanAndParseJSON(response.text);
};

export const generateVideoPlan = async (
  apiKey: string,
  metadata: SourceMetadata
): Promise<OrchestratorResponse> => {
  const ai = new GoogleGenAI({ apiKey });

  const effectiveStrategy = metadata.detected_strategy || 'VIRAL_CLONE';
  const videoConfig = metadata.video_config || {
      resolution: '1080p',
      aspectRatio: '9:16',
      visualModel: 'SORA',
      scriptModel: 'Gemini 2.5 Flash',
      voiceModel: 'Google Chirp',
      outputLanguage: 'vi'
  };

  const targetLang = getLanguageName(videoConfig.outputLanguage);
  const strictProtocol = STRICT_LANGUAGE_PROTOCOL.replace(/{{TARGET_LANGUAGE}}/g, targetLang);

  const SYSTEM_INSTRUCTION_FINAL = `
    ${strictProtocol}
    **TECHNICAL SPECIFICATION:**
    - Resolution: ${videoConfig.resolution}
    - Aspect Ratio: ${videoConfig.aspectRatio}
    **METADATA GENERATION:**
    - Title (In ${targetLang}).
    - Description (In ${targetLang}).
    - Hashtags.
  `;

  const prompt = `
    PERFORM DEEP ANALYSIS AND GENERATE PLAN.
    URL: ${metadata.url}
    User Notes: ${metadata.notes || "None"}
    OUTPUT LANGUAGE: ${targetLang}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_FINAL,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          market_scoring: {
            type: Type.OBJECT,
            properties: {
              tiktok_potential: { type: Type.NUMBER },
              youtube_shorts_potential: { type: Type.NUMBER },
              estimated_cpm: { type: Type.STRING },
            },
            required: ["tiktok_potential", "youtube_shorts_potential", "estimated_cpm"],
          },
          audience_personas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                age_range: { type: Type.STRING },
                interests: { type: Type.ARRAY, items: { type: Type.STRING } },
                behavior: { type: Type.STRING },
                script_tone: { type: Type.STRING },
              },
              required: ["id", "name", "age_range", "interests", "script_tone"],
            },
          },
          deep_analysis: {
            type: Type.OBJECT,
            properties: {
              viral_dna: { type: Type.ARRAY, items: { type: Type.STRING } },
              psychological_triggers: { type: Type.ARRAY, items: { type: Type.STRING } },
              competitor_gap: { type: Type.STRING },
              winning_angle: { type: Type.STRING },
              monetization_strategy: { type: Type.STRING },
              content_strategy: { type: Type.STRING }
            },
            required: ["viral_dna", "psychological_triggers", "competitor_gap", "winning_angle", "monetization_strategy", "content_strategy"],
          },
          production_plan: {
            type: Type.OBJECT,
            properties: {
              script_master: { type: Type.STRING },
              technical_specs: {
                 type: Type.OBJECT,
                 properties: {
                     resolution: { type: Type.STRING },
                     ratio: { type: Type.STRING },
                     fps: { type: Type.NUMBER }
                 },
                 required: ["resolution", "ratio", "fps"]
              },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    scene_id: { type: Type.STRING },
                    start: { type: Type.NUMBER },
                    duration: { type: Type.NUMBER },
                    vo_text: { type: Type.STRING },
                    visual_cues: { type: Type.STRING },
                    model_choice: { type: Type.STRING },
                    priority: { type: Type.STRING },
                  },
                  required: ["scene_id", "vo_text", "visual_cues", "model_choice"],
                },
              },
            },
            required: ["script_master", "scenes", "technical_specs"],
          },
          generated_content: { 
             type: Type.OBJECT,
             properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                thumbnail_prompt: { type: Type.STRING }
             },
             required: ["title", "description", "hashtags"]
          },
          consent_log: {
            type: Type.OBJECT,
            properties: {
              user_confirmed_clone: { type: Type.BOOLEAN },
              timestamp: { type: Type.STRING },
            },
            required: ["user_confirmed_clone", "timestamp"],
          },
        },
        required: ["market_scoring", "audience_personas", "deep_analysis", "production_plan", "consent_log", "generated_content"],
      },
    }
  });

  return cleanAndParseJSON(response.text) as OrchestratorResponse;
};

export const extractViralDNA = async (apiKey: string, sources: string[], additionalContext?: string, language: ContentLanguage = 'vi'): Promise<ViralDNAProfile> => {
  const ai = new GoogleGenAI({ apiKey });
  let prompt = `
    ANALYZE COMPETITORS: ${sources.join(', ')}
    EXTRACT VIRAL DNA STRUCTURE.
  `;
  
  if (additionalContext) {
      prompt += `\n\nADDITIONAL CONTEXT: "${additionalContext}"`;
  }

  const targetLang = getLanguageName(language);
  const strictSystemInstruction = SYSTEM_INSTRUCTION_DNA_EXTRACTOR.replace(/{{TARGET_LANGUAGE}}/g, targetLang);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", 
    contents: prompt,
    config: {
      systemInstruction: strictSystemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          structure: {
            type: Type.OBJECT,
            properties: {
              hook_type: { type: Type.STRING },
              pacing: { type: Type.STRING, enum: ['Fast', 'Moderate', 'Slow'] },
              avg_scene_duration: { type: Type.NUMBER }
            },
            required: ['hook_type', 'pacing', 'avg_scene_duration']
          },
          emotional_curve: { type: Type.ARRAY, items: { type: Type.STRING } },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          algorithm_fit_score: { type: Type.NUMBER },
          risk_level: { type: Type.STRING, enum: ['Safe', 'Moderate', 'High'] },
          channel_breakdown: {
              type: Type.ARRAY,
              items: {
                  type: Type.OBJECT,
                  properties: {
                      report: {
                          type: Type.OBJECT,
                          properties: {
                              avg_duration: { type: Type.STRING },
                              post_frequency: { type: Type.STRING },
                              hook_style: { type: Type.STRING },
                              algorithm_fit: { type: Type.NUMBER },
                              risk_score: { type: Type.NUMBER },
                              suggested_prompt: { type: Type.STRING }
                          },
                          required: ['avg_duration', 'post_frequency', 'hook_style', 'algorithm_fit', 'risk_score', 'suggested_prompt']
                      }
                  },
                  required: ['report']
              }
          }
        },
        required: ['structure', 'emotional_curve', 'keywords', 'algorithm_fit_score', 'risk_level']
      }
    }
  });

  return cleanAndParseJSON(response.text) as ViralDNAProfile;
};

export const generateProScript = async (
  apiKey: string, 
  dna: ViralDNAProfile, 
  settings: StudioSettings
): Promise<OrchestratorResponse> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    GENERATE PRO SCRIPT.
    DNA PROFILE: ${JSON.stringify(dna)}
    SETTINGS: ${JSON.stringify(settings)}
  `;

  const targetLang = getLanguageName(settings.contentLanguage);
  const strictSystemInstruction = SYSTEM_INSTRUCTION_PRO_STUDIO_WRITER.replace(/{{TARGET_LANGUAGE}}/g, targetLang);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: strictSystemInstruction,
      responseMimeType: "application/json",
      // ... Same Schema as generateVideoPlan ...
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          market_scoring: {
            type: Type.OBJECT,
            properties: {
              tiktok_potential: { type: Type.NUMBER },
              youtube_shorts_potential: { type: Type.NUMBER },
              estimated_cpm: { type: Type.STRING },
            },
            required: ["tiktok_potential", "youtube_shorts_potential", "estimated_cpm"],
          },
          audience_personas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                age_range: { type: Type.STRING },
                interests: { type: Type.ARRAY, items: { type: Type.STRING } },
                behavior: { type: Type.STRING },
                script_tone: { type: Type.STRING },
              },
              required: ["id", "name", "age_range", "interests", "script_tone"],
            },
          },
          deep_analysis: {
            type: Type.OBJECT,
            properties: {
              viral_dna: { type: Type.ARRAY, items: { type: Type.STRING } },
              psychological_triggers: { type: Type.ARRAY, items: { type: Type.STRING } },
              competitor_gap: { type: Type.STRING },
              winning_angle: { type: Type.STRING },
              monetization_strategy: { type: Type.STRING },
              content_strategy: { type: Type.STRING }
            },
            required: ["viral_dna", "psychological_triggers", "competitor_gap", "winning_angle", "monetization_strategy", "content_strategy"],
          },
          production_plan: {
            type: Type.OBJECT,
            properties: {
              script_master: { type: Type.STRING },
              technical_specs: {
                 type: Type.OBJECT,
                 properties: {
                     resolution: { type: Type.STRING },
                     ratio: { type: Type.STRING },
                     fps: { type: Type.NUMBER }
                 },
                 required: ["resolution", "ratio", "fps"]
              },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    scene_id: { type: Type.STRING },
                    start: { type: Type.NUMBER },
                    duration: { type: Type.NUMBER },
                    vo_text: { type: Type.STRING },
                    visual_cues: { type: Type.STRING },
                    model_choice: { type: Type.STRING },
                    priority: { type: Type.STRING },
                  },
                  required: ["scene_id", "vo_text", "visual_cues", "model_choice"],
                },
              },
            },
            required: ["script_master", "scenes", "technical_specs"],
          },
          generated_content: { 
             type: Type.OBJECT,
             properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                thumbnail_prompt: { type: Type.STRING }
             },
             required: ["title", "description", "hashtags"]
          },
          consent_log: {
            type: Type.OBJECT,
            properties: {
              user_confirmed_clone: { type: Type.BOOLEAN },
              timestamp: { type: Type.STRING },
            },
            required: ["user_confirmed_clone", "timestamp"],
          },
        },
        required: ["market_scoring", "audience_personas", "deep_analysis", "production_plan", "consent_log", "generated_content"],
      },
    }
  });

  return cleanAndParseJSON(response.text) as OrchestratorResponse;
}

// ... Exports (stubs for brevity, ensuring they use cleanAndParseJSON if implemented fully) ...
export const runHunterAnalysis = async (apiKey: string, query: string): Promise<HunterInsight> => { 
    // Mock implementation for demo purposes as full logic wasn't provided in original file
    // In production, this would use AI similar to above.
    return {
        target_name: query,
        type: 'NICHE_OPPORTUNITY',
        match_score: 88,
        market_status: 'Growing',
        key_metrics: [],
        hidden_analysis: { consumer_psychology: '', competitor_weakness: '', profit_potential: 'High', risk_assessment: 'Low' },
        strategic_suggestion: 'Create comparison videos'
    }; 
} 
export const scanHighValueNetwork = async (apiKey: string, focusArea: string): Promise<NetworkScanResult> => { return {} as any; }
export const predictGoldenHours = async (apiKey: string, region: string, niche: string, platforms: string[]): Promise<GoldenHourRecommendation[]> => { return [] as any; }
export const generateDailySchedule = async (apiKey: string, accountName: string, niche: string, region: string, config: any): Promise<ScheduleSlot[]> => { return [] as any; }
export const generateChannelAudit = async (apiKey: string, channelName: string, platform: string): Promise<ChannelHealthReport> => { 
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Audit channel: ${channelName} on ${platform}. Assess health.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    channel_name: { type: Type.STRING },
                    platform: { type: Type.STRING },
                    health_score: { type: Type.NUMBER },
                    status: { type: Type.STRING, enum: ['HEALTHY', 'AT_RISK', 'CRITICAL'] },
                    metrics: {
                        type: Type.OBJECT,
                        properties: {
                            views_growth: { type: Type.STRING },
                            avg_watch_time: { type: Type.STRING },
                            ctr: { type: Type.STRING }
                        },
                        required: ['views_growth', 'avg_watch_time', 'ctr']
                    },
                    risks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING },
                                severity: { type: Type.STRING },
                                description: { type: Type.STRING }
                            },
                            required: ['type', 'severity', 'description']
                        }
                    },
                    ai_diagnosis: { type: Type.STRING },
                    action_plan: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['channel_name', 'health_score', 'status', 'metrics', 'risks', 'ai_diagnosis', 'action_plan']
            }
        }
    });
    return cleanAndParseJSON(response.text);
}

// --- SYNTHESIZE KNOWLEDGE (Self-Learning) ---
export const synthesizeKnowledge = async (apiKey: string, text: string, currentKnowledge: string[]): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
        ACT AS A KNOWLEDGE ARCHITECT.
        
        INPUT TEXT (Source: User or External AI): 
        "${text}"

        CURRENT KNOWLEDGE:
        ${JSON.stringify(currentKnowledge)}

        TASK:
        1. Extract 3-5 HIGH-VALUE strategic rules, facts, or user preferences from the INPUT TEXT.
        2. Disregard fluff, conversational filler, or generic advice.
        3. Format as concise, actionable statements (max 15 words each).
        4. If input is empty or irrelevant, return empty array.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    newInsights: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ['newInsights']
            }
        }
    });

    const result = cleanAndParseJSON(response.text);
    return result.newInsights || [];
};

export const sendChatToAssistant = async (apiKey: string, history: any[], message: string, appContext: AppContext): Promise<{ text: string, command?: AgentCommand }> => { 
    const ai = new GoogleGenAI({ apiKey });
    
    // Inject Knowledge Base into System Instruction
    const knowledgeString = appContext.knowledgeBase.learnedPreferences.length > 0 
        ? `\n\n[ACCESSING LONG-TERM MEMORY]:\n${appContext.knowledgeBase.learnedPreferences.map(p => `- ${p}`).join('\n')}`
        : "";

    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: history,
        config: {
            systemInstruction: `You are AV Commander, an AI assistant for Viral DNA Studio.
            Context: ${JSON.stringify(appContext)}
            ${knowledgeString}
            
            CAPABILITIES:
            1. Execute commands: NAVIGATE(tab_id).
            2. If user types "/train [text]", acknowledge that you are synthesizing this info into the knowledge base (but the frontend handles the actual API call).
            3. Use the [ACCESSING LONG-TERM MEMORY] section to personalize answers.
            
            If user asks to go to a section, return command JSON at end of response.`
        }
    });
    const result = await chat.sendMessage(message);
    const text = result.text || "";
    
    let command = undefined;
    if (text.includes("NAVIGATE")) {
        if (text.toLowerCase().includes("studio")) command = { action: 'NAVIGATE', payload: 'studio' };
        else if (text.toLowerCase().includes("queue")) command = { action: 'NAVIGATE', payload: 'queue' };
        else if (text.toLowerCase().includes("settings")) command = { action: 'NAVIGATE', payload: 'settings' };
    }
    
    // Auto-detect training command in chat (simulated command for frontend to pick up if needed, though mostly handled by frontend parsing)
    if (message.startsWith("/train")) {
       command = { action: 'UPDATE_MEMORY', payload: message.replace("/train", "").trim() };
    }
    
    return { text, command: command as any }; 
}

export const huntAffiliateProducts = async (apiKey: string, niche: string, networks: string[]): Promise<AffiliateHuntResult> => { 
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find winning affiliate products in niche: ${niche}. Networks: ${networks.join(',')}`,
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
                            required: ['product_name', 'opportunity_score', 'affiliate_link']
                        }
                    },
                    strategy_note: { type: Type.STRING }
                },
                required: ['products', 'strategy_note']
            }
        }
    });
    return cleanAndParseJSON(response.text);
}
