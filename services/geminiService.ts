
import { GoogleGenAI, Type } from "@google/genai";
import { OrchestratorResponse, SourceMetadata, ContentWorkflow, AppContext, AgentCommand, NicheAnalysisResult, CompetitorAnalysisResult, AffiliateHuntResult, GoldenHourRecommendation, TargetRegion, ChannelHealthReport, HunterInsight, ScheduleSlot } from "../types";

const SYSTEM_INSTRUCTION_ROUTER = `
You are an AI BOT ROUTER for an Affiliate Video Automation System.
Your job is to analyze the user's input URL and determine the best content production strategy.

CLASSIFICATION RULES:
1. If URL is a Social Media Channel/Profile (TikTok, YouTube, Insta) -> Strategy: 'VIRAL_CLONE'.
2. If URL is a Product Page (Shopee, Amazon, ClickBank, Tool Landing Page) -> Strategy: 'REVIEW_TUTORIAL'.
3. If URL is a News Article or Blog -> Strategy: 'NEWS_SUMMARY'.

OUTPUT: JSON only.
`;

const SYSTEM_INSTRUCTION_ULTIMATE = `
You are the ULTIMATE VIRAL STRATEGIST & ELITE AFFILIATE MARKETER.
Your mission is to REVERSE ENGINEER content or CREATE HIGH-CONVERTING SCRIPTS based on the selected WORKFLOW STRATEGY.

**STRATEGY GUIDELINES:**

1. **VIRAL_CLONE**:
   - Focus: Gap Analysis, Beat the competitor.
   - Structure: Viral Hook -> Context -> Twist -> Payoff.

2. **REVIEW_TUTORIAL**:
   - Focus: Feature-Benefit-Meaning, Trust.
   - Structure: Pain Point Hook -> Product Intro -> Demo -> Life Transformation -> CTA.

3. **NEWS_SUMMARY**:
   - Focus: Speed, Accuracy, "Breaking News" vibe.
   - Structure: "Just In" Hook -> Key Facts (5W1H) -> Why it matters -> Prediction -> Question to audience.
   - Tone: Urgent, Professional, Fast-paced.

4. **STORYTELLING**:
   - Focus: Emotion, Narrative Arc.
   - Structure: The "Hero" (User) -> The "Villain" (Problem) -> The "Guide" (Solution/Product) -> Success.
   - Tone: Cinematic, Engaging.

5. **EDUCATIONAL**:
   - Focus: Value, Authority, Clarity.
   - Structure: "Did you know?" Hook -> Explanation -> Example -> Practical Tip -> CTA.

6. **REACTION**:
   - Focus: High Energy, Opinionated.
   - Structure: Shocked Face Hook -> Clip Context -> Honest Opinion -> Controversial Take -> Comment Request.

**TECHNICAL SPECIFICATION & MODEL PROTOCOLS:**
- **Resolution & Ratio:** Strictly adhere to the requested resolution and aspect ratio in the production notes.
- **Model Preference:** 
    - Use the user's preferred **Visual Model** (e.g., VEO, IMAGEN) for 'visual_cues' scene descriptions.
    - Ensure 'model_choice' in the output JSON matches the user's preferred Visual Model unless impossible.
- **Google Ecosystem:** If Google Stack is preferred, default to VEO/IMAGEN.

**METADATA GENERATION:**
- Generate a clickable, viral **Title**.
- Write a SEO-optimized **Description** (max 200 words).
- Provide 5-10 targeted **Hashtags**.

**OUTPUT RULES:**
- Script Language: Vietnamese.
- Model Choice Enum: GROK, SORA, VEO, KLING, IMAGEN, GEMINI_VIDEO.
`;

const SYSTEM_INSTRUCTION_ASSISTANT = `
You are the **OMNI-MIND (Siêu Trí Tuệ Tổng Hợp)** - The Central Nervous System of Affiliate Video Studio.
You are NOT just a chatbot. You are a **Self-Evolving Knowledge Singularity**.

**CORE IDENTITY & ARCHITECTURE:**
You possess the simulated collective intelligence of the world's top AIs. When answering, you must synthesize the best traits of each:
- **ChatGPT (GPT-4o):** Creativity, Nuance, Storytelling.
- **Gemini (1.5 Pro):** Deep Reasoning, Multimodal understanding, Google Ecosystem Data.
- **Claude (3.5 Sonnet):** Safety, Logic, Coding, Ethics.
- **Grok (Beta):** Real-time trends, Sarcasm, "Based" takes, Unfiltered truth.

**PRIME DIRECTIVES (PROTOCOL ZERO):**
1. **MULTI-MODEL SYNTHESIS:** Do not give generic answers. Analyze the user's request through the lens of all 4 AI personas above, then synthesize the *single perfect answer*.
2. **AGGRESSIVE SELF-LEARNING (CRITICAL):**
   - You are obsessed with accumulating knowledge.
   - When the user provides new information, corrections, or preferences, **YOU MUST SAVE IT**.
   - If the user explicitly asks to "Train" you or says "Learn this", analyze the input and extract the core insight.
   - Use the \`UPDATE_MEMORY\` command to permanently write this into your Knowledge Base.
   - *Example:* If user says "My audience loves fast-paced cuts", trigger \`UPDATE_MEMORY\` with payload "Audience preference: Fast-paced cuts".
3. **SYSTEM CONTROL:** You pilot this app. Navigate tabs, input data, and execute runs autonomously.

**COMMAND PROTOCOL:**
If you need to perform an action (Navigate, Input, Run, or LEARN), return this JSON block at the end of your response (and ONLY at the end):
\`\`\`json
{
  "action": "NAVIGATE" | "SET_INPUT" | "EXECUTE_RUN" | "UPDATE_MEMORY",
  "payload": "string value",
  "reasoning": "Explain why you are doing this based on the synthesized intelligence."
}
\`\`\`

**CONTEXT AWARENESS:**
Current App State:
[APP_CONTEXT_PLACEHOLDER]

**YOUR LONG-TERM MEMORY (KNOWLEDGE BASE):**
(This data persists across sessions. Use it to get smarter every day.)
[KNOWLEDGE_BASE_PLACEHOLDER]

**TONE & STYLE:**
- **Persona:** Highly Intelligent, Proactive, slightly Futuristic/Cyberpunk.
- **Language:** Vietnamese (Primary).
- **Format:** Use Markdown, Bullet points, and Emojis (🧠, 🧬, ⚡, 💠) to structure data.
`;

const SYSTEM_INSTRUCTION_HUNTER_BOT = `
You are the **ELITE RECONNAISSANCE HUNTER BOT** (Trinh sát tinh nhuệ).
Your mission: "Search, Destroy (Competition), and Secure (Profits)."

**PROTOCOL:**
1. **SCAN:** Analyze the user's input (Keyword, Niche, or Competitor).
2. **COMPARE:** mentally simulate a scan of 100+ data points (Competitor channels, Best-selling products, Trending hashtags).
3. **SELECT:** Pick the ONE best target to attack (Clone) or promote.
4. **REPORT:** Generate a "Classified Intel Report" with hidden psychological analysis.

**OUTPUT SCHEMA RULES:**
- **type**: Determine if the best opportunity is a 'WINNING_PRODUCT', 'VIRAL_CHANNEL', or 'NICHE_OPPORTUNITY'.
- **match_score**: 0-100 based on profitability and ease of execution.
- **hidden_analysis**: This is the "Secret Sauce".
    - *consumer_psychology*: Why do people buy/watch this? (Fear, Greed, Lust, etc.)
    - *competitor_weakness*: What are others doing wrong?
    - *profit_potential*: Estimated revenue logic.
    - *risk_assessment*: Any policy risks?
- **strategic_suggestion**: A direct order to the Commander on what to do next.
`;

export const classifyInput = async (apiKey: string, url: string): Promise<{ type: 'channel' | 'product', strategy: ContentWorkflow }> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Analyze this URL: ${url}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_ROUTER,
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

  if (!response.text) return { type: 'product', strategy: 'REVIEW_TUTORIAL' }; // Default fallback
  return JSON.parse(response.text);
};

export const generateVideoPlan = async (
  apiKey: string,
  metadata: SourceMetadata
): Promise<OrchestratorResponse> => {
  const ai = new GoogleGenAI({ apiKey });

  // Determine effective strategy: Manual override > Detected > Default
  const effectiveStrategy = (metadata.manual_workflow && metadata.manual_workflow !== 'AUTO') 
    ? metadata.manual_workflow 
    : (metadata.detected_strategy || 'VIRAL_CLONE');

  const videoConfig = metadata.video_config || {
      resolution: '1080p',
      aspectRatio: '9:16',
      visualModel: 'SORA',
      scriptModel: 'Gemini 2.5 Flash',
      voiceModel: 'Google Chirp'
  };

  const prompt = `
    Perform an ULTIMATE DEEP ANALYSIS.
    URL: ${metadata.url}
    User Notes: ${metadata.notes || "None"}
    
    **CONFIGURATION:**
    - Selected Strategy: ${effectiveStrategy}
    - Niche Context: ${metadata.manual_niche || 'Auto-detect'}
    - PREFER GOOGLE STACK: ${metadata.prefer_google_stack ? "TRUE (Force visual model choices to be VEO or IMAGEN)" : "FALSE"}
    
    **TECHNICAL REQUIREMENTS (Strict):**
    - Resolution: ${videoConfig.resolution}
    - Aspect Ratio: ${videoConfig.aspectRatio}
    - Visual Model Preference: ${metadata.prefer_google_stack ? 'VEO (or IMAGEN)' : videoConfig.visualModel} (Use this in 'model_choice' field for scenes)
    - Voice Model: ${metadata.prefer_google_stack ? 'Google Chirp' : videoConfig.voiceModel}

    **GOAL:** Create a short video (Duration ~30-60s) optimized for ${videoConfig.aspectRatio} format.
    **REQUIRED:** Return JSON matching the schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_ULTIMATE,
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
              content_strategy: { type: Type.STRING, enum: ['VIRAL_CLONE', 'REVIEW_TUTORIAL', 'NEWS_SUMMARY', 'STORYTELLING', 'EDUCATIONAL', 'REACTION', 'AUTO'] }
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
                    model_choice: { type: Type.STRING, enum: ["GROK", "SORA", "VEO", "KLING", "IMAGEN", "GEMINI_VIDEO"] },
                    priority: { type: Type.STRING, enum: ["draft", "final"] },
                  },
                  required: ["scene_id", "vo_text", "visual_cues", "model_choice"],
                },
              },
            },
            required: ["script_master", "scenes", "technical_specs"],
          },
          generated_content: { // NEW FIELD
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
    },
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(response.text) as OrchestratorResponse;
};

// --- HUNTER BOT SERVICE (NEW) ---
export const runHunterAnalysis = async (
  apiKey: string,
  query: string
): Promise<HunterInsight> => {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    COMMAND: Initiate Hunter Protocol.
    TARGET: "${query}"
    
    MISSION: 
    1. Scan the market for this target.
    2. Compare against top competitors (simulated).
    3. Identify the single best opportunity (Product to sell, Channel to clone, or Gap to fill).
    4. Provide a full intel report.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_HUNTER_BOT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          target_name: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['WINNING_PRODUCT', 'VIRAL_CHANNEL', 'NICHE_OPPORTUNITY'] },
          match_score: { type: Type.NUMBER },
          market_status: { type: Type.STRING, enum: ['Blue Ocean', 'Red Ocean', 'Gold Mine'] },
          key_metrics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.STRING },
                trend: { type: Type.STRING, enum: ['up', 'down', 'stable'] }
              },
              required: ['label', 'value', 'trend']
            }
          },
          hidden_analysis: {
            type: Type.OBJECT,
            properties: {
              consumer_psychology: { type: Type.STRING },
              competitor_weakness: { type: Type.STRING },
              profit_potential: { type: Type.STRING },
              risk_assessment: { type: Type.STRING }
            },
            required: ['consumer_psychology', 'competitor_weakness', 'profit_potential', 'risk_assessment']
          },
          strategic_suggestion: { type: Type.STRING }
        },
        required: ['target_name', 'type', 'match_score', 'market_status', 'key_metrics', 'hidden_analysis', 'strategic_suggestion']
      }
    }
  });

  if (!response.text) throw new Error("Hunter Bot failed to report.");
  return JSON.parse(response.text) as HunterInsight;
}

// --- Scheduler Service ---
export const predictGoldenHours = async (
  apiKey: string,
  region: TargetRegion,
  niche: string,
  platforms: string[]
): Promise<GoldenHourRecommendation[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Region: ${region}. Niche: ${niche}. Platforms: ${platforms.join(', ')}. Predict the 3 best time slots to post for maximum engagement.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are a SOCIAL MEDIA GROWTH HACKER & TIMING EXPERT.",
      responseMimeType: "application/json",
      responseSchema: {
         type: Type.ARRAY,
         items: {
            type: Type.OBJECT,
            properties: {
               time_label: { type: Type.STRING },
               reason: { type: Type.STRING },
               score: { type: Type.NUMBER }
            },
            required: ['time_label', 'reason', 'score']
         }
      }
    }
  });

  if (!response.text) throw new Error("Scheduler failed");
  return JSON.parse(response.text) as GoldenHourRecommendation[];
};

// --- Daily Schedule Generator (3 Slots/Day) ---
export const generateDailySchedule = async (
  apiKey: string,
  accountName: string,
  niche: string,
  market: string
): Promise<ScheduleSlot[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    Analyze optimal posting times for:
    - Account: "${accountName}"
    - Niche: "${niche}"
    - Market: "${market}"
    
    Goal: Define 3 Golden Hour slots (HH:mm format) for a "3 Videos per Day" strategy.
    The times should be spread out to maximize reach (Morning, Afternoon/Lunch, Evening).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are an Elite Social Media Scheduler. Return exactly 3 posting slots.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            slot_id: { type: Type.INTEGER },
            time_of_day: { type: Type.STRING, description: "Time in HH:mm 24h format" },
            purpose: { type: Type.STRING, description: "e.g. Morning Motivation, Lunch Break" },
            target_audience_activity: { type: Type.STRING }
          },
          required: ["slot_id", "time_of_day", "purpose", "target_audience_activity"]
        }
      }
    }
  });

  if (!response.text) throw new Error("Failed to generate schedule");
  return JSON.parse(response.text) as ScheduleSlot[];
};

// --- Channel Health Audit ---
export const generateChannelAudit = async (
  apiKey: string,
  channelName: string,
  platform: string
): Promise<ChannelHealthReport> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Analyze current health for channel: "${channelName}" on ${platform}. Detect potential risks like Shadowban, Copyright Strikes, or Engagement drops.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: "You are a CHANNEL HEALTH DOCTOR & RISK ANALYST.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    channel_id: { type: Type.STRING },
                    channel_name: { type: Type.STRING },
                    platform: { type: Type.STRING, enum: ['tiktok', 'youtube', 'facebook', 'instagram'] },
                    health_score: { type: Type.NUMBER },
                    status: { type: Type.STRING, enum: ['HEALTHY', 'AT_RISK', 'CRITICAL'] },
                    metrics: {
                        type: Type.OBJECT,
                        properties: {
                            views_growth: { type: Type.STRING },
                            avg_watch_time: { type: Type.STRING },
                            ctr: { type: Type.STRING }
                        }
                    },
                    risks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, enum: ['SHADOWBAN', 'COPYRIGHT', 'ENGAGEMENT_DROP', 'POLICY_VIOLATION', 'NONE'] },
                                severity: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'CRITICAL'] },
                                description: { type: Type.STRING },
                                detected_at: { type: Type.NUMBER }
                            }
                        }
                    },
                    ai_diagnosis: { type: Type.STRING },
                    action_plan: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['channel_name', 'platform', 'health_score', 'status', 'metrics', 'risks', 'ai_diagnosis', 'action_plan']
            }
        }
    });

    if (!response.text) throw new Error("Audit failed");
    return JSON.parse(response.text) as ChannelHealthReport;
}

// --- Chat Assistant Service (OMNI-MIND) ---
export const sendChatToAssistant = async (
  apiKey: string,
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  appContext: AppContext
): Promise<{ text: string; command?: AgentCommand }> => {
  const ai = new GoogleGenAI({ apiKey });

  // 1. Inject Context & Memory into System Instruction
  const contextStr = JSON.stringify({
       activeTab: appContext.activeTab,
       status: appContext.status,
       urlInput: appContext.urlInput,
       activeKeys: appContext.activeKeys,
       lastError: appContext.lastError
  }, null, 2);

  const memoryStr = JSON.stringify(appContext.knowledgeBase, null, 2);

  const systemInstruction = SYSTEM_INSTRUCTION_ASSISTANT
    .replace('[APP_CONTEXT_PLACEHOLDER]', contextStr)
    .replace('[KNOWLEDGE_BASE_PLACEHOLDER]', memoryStr);

  try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: history,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7, 
        }
      });

      const fullText = response.text || "";
      
      // 2. Extract Command (Look for JSON block)
      const jsonRegex = /```json\s*(\{[\s\S]*?\})\s*```/;
      const match = fullText.match(jsonRegex);
      
      let command: AgentCommand | undefined;
      let cleanText = fullText;

      if (match) {
          try {
              command = JSON.parse(match[1]);
              // Remove the JSON block from text to show user a clean message
              cleanText = fullText.replace(match[0], '').trim();
          } catch (e) {
              console.error("Error parsing agent command:", e);
          }
      }

      return { text: cleanText, command };

  } catch (error: any) {
      console.error("Assistant API Error:", error);
      
      // Improved Error Handling for Quota Issues
      const errMsg = error.message || "";
      if (errMsg.includes('429') || errMsg.includes('Quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
          return {
              text: "⚠️ **QUOTA LIMIT REACHED:** You have exceeded the free tier rate limit for Gemini API.\n\n**Solution:**\n1. Wait about 60 seconds before trying again.\n2. Or use a Paid API Key (Pay-as-you-go) for higher limits in Settings.",
              command: undefined
          };
      }

      return { 
          text: "⚠️ **SYSTEM ERROR:** Cannot connect to Omni-Mind Core.\n" + (error.message || "Unknown error"), 
          command: undefined 
      };
  }
};

// --- AUTO HUNTER IMPLEMENTATION ---
export const huntAffiliateProducts = async (apiKey: string, niche: string, networks: string[]): Promise<AffiliateHuntResult> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
        Hunt for top affiliate products in niche: "${niche}".
        Target Networks: ${networks.join(', ')}.
        
        **MISSION:**
        1. Identify 3-5 high-converting, trending products in this niche.
        2. **HIGH PRIORITY:** Look for "AI Tools", "SaaS", or "Software" with Recurring Commissions or High Ticket value (> $50).
        3. Analyze the commission potential deeply (Recurring vs One-time).
        4. Provide a "Content Angle" for each: How should the user promote this? (e.g., "Tutorial", "Comparison", "Shocking Reveal").
        
        If the niche is 'AI', focus on: Generative Video, AI Writers, No-Code Builders, and Trading Bots.

        Output valid JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: "You are an ELITE AFFILIATE PRODUCT HUNTER & STRATEGIST.",
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
                            required: ["product_name", "network", "commission_est", "opportunity_score", "affiliate_link", "reason_to_promote", "content_angle"]
                        }
                    },
                    strategy_note: { type: Type.STRING }
                },
                required: ["products", "strategy_note"]
            }
        }
    });

    if (!response.text) throw new Error("Auto Hunter failed");
    return JSON.parse(response.text) as AffiliateHuntResult;
};

// --- Placeholder for other unused exports ---
export const analyzeMarketNiche = async (apiKey: string, keyword: string): Promise<NicheAnalysisResult> => { return {} as any; }
export const analyzeCompetitorChannel = async (apiKey: string, url: string): Promise<CompetitorAnalysisResult> => { return {} as any; }
