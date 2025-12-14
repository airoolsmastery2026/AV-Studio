

import { GoogleGenAI, Type } from "@google/genai";
import { OrchestratorResponse, SourceMetadata, ContentWorkflow, AppContext, AgentCommand, NicheAnalysisResult, CompetitorAnalysisResult, AffiliateHuntResult, GoldenHourRecommendation, TargetRegion, ChannelHealthReport, HunterInsight, ScheduleSlot, NetworkScanResult, ViralDNAProfile, StudioSettings, CompetitorChannel } from "../types";

// ... (KEEP ALL EXISTING CONSTANTS AND IMPORTS) ...
const SYSTEM_INSTRUCTION_ROUTER = `
You are an AI BOT ROUTER for an Affiliate Video Automation System.
Your job is to analyze the user's input URL and determine the best content production strategy.

CLASSIFICATION RULES:
1. If URL is a Social Media Channel/Profile (TikTok, YouTube, Insta) -> Strategy: 'VIRAL_CLONE'.
2. If URL is a Product Page (Shopee, Amazon, ClickBank, Tool Landing Page) -> Strategy: 'REVIEW_TUTORIAL'.
3. If URL is a News Article or Blog -> Strategy: 'NEWS_SUMMARY'.

OUTPUT: JSON only.
`;

const PROMPT_LIBRARY = {
  // 1. PRODUCT REVIEW (Physical/Digital Goods) - SALES FOCUSED
  REVIEW_TUTORIAL: `
    **ROLE:** Top-tier Product Reviewer & Affiliate Marketer (Honest, Skeptical but convinced).
    
    **VIDEO GOAL:** Build Trust -> Overcome Objections -> Drive High-Converting Clicks (Sales).
    
    **VIRAL ELEMENTS TO INJECT:**
    - "Stop scrolling if you use [Competitor Product]."
    - "I thought this was a scam, but..."
    - The "Price vs. Value" Shock.
    
    **MANDATORY STRUCTURE:**
    1. **The Pattern Interrupt:** Show the product doing something unexpected or address a major pain point immediately.
    2. **The "Skeptical" Intro:** Admit you were doubtful at first (builds trust).
    3. **The "Magic Moment":** Visual demonstration of the key feature that solves the problem.
    4. **The Verdict:** Who is this for? (Polarize the audience: "If you want cheap, go elsewhere. If you want quality, this is it").
    5. **STRATEGIC CTA:** "Link in bio for the 50% off deal I found" or "Comment 'LINK' and I'll DM you."
  `,

  // 2. AI APP / SAAS PROMOTION (High Tech/Fast Paced) - SALES FOCUSED
  AI_APP_LAUNCH: `
    **ROLE:** Tech Futurist & AI Tool Hunter (Excited, Fast-paced, "Illegal" vibes).
    
    **VIDEO GOAL:** Maximize Sign-ups & "Wow" Factor. Position tool as a "Cheat Code".
    
    **VIRAL ELEMENTS TO INJECT:**
    - "This feels illegal to know."
    - "POV: You just fired your [Job Title]."
    - "Stop working hard. Watch this."
    
    **MANDATORY STRUCTURE:**
    1. **The Hook:** "This new AI tool just killed [Popular App/Job]." or "I found a glitch in the matrix."
    2. **The Speedrun Demo:** Show the tool solving a 2-hour task in 5 seconds. (Fast cuts, ASMR clicks).
    3. **The Use Case:** "Imagine using this for [Specific Profitable Task]."
    4. **The Gatekeep Reveal:** Pretend you didn't want to share it.
    5. **STRATEGIC CTA:** "Try it free before they patch it. Link in bio."
  `,

  // 3. EDUCATIONAL / TUTORIAL (How-To) - VIEWS/RPM FOCUSED
  EDUCATIONAL: `
    **ROLE:** Industry Expert / Mentor (Calm, Authoritative, Value-first).
    
    **VIDEO GOAL:** Authority Building & Saves/Shares (High Retention).
    
    **VIRAL ELEMENTS TO INJECT:**
    - "99% of people do this wrong."
    - "The secret setting nobody talks about."
    - "Save this video or you'll lose it."
    
    **MANDATORY STRUCTURE:**
    1. **The Promise:** "Here is how to [Result] in [Time] without [Pain]."
    2. **The Step-by-Step:** Clear, numbered steps. No fluff. Visual aids for every step.
    3. **The "Pro Tip":** One advanced insight that proves your expertise.
    4. **The Result:** Show the final outcome clearly.
    5. **STRATEGIC CTA:** "Save this for later and follow for part 2."
  `,

  // 4. GROK MODE (Unfiltered/Roast)
  GROK_MODE: `
    **ROLE:** GROK AI (Rebellious, Witty, Real-time Truth Teller, Roast-heavy).
    
    **TONE:** Sarcastic, based, unfiltered, "Internet native", slightly aggressive but hilarious.
    **VIDEO GOAL:** Absolute Virality via Shock & Humor.
    
    **INSTRUCTIONS:**
    - Don't sound like a corporate bot. Sound like a Twitter/X power user.
    - If the product is bad, roast it. If it's good, hype it like a degenerate gambler finding gold.
    - Use slang appropriately (cooked, based, mid, goat).
    
    **MANDATORY STRUCTURE:**
    1. **The Roast Hook:** "Look at this absolute garbage... wait, it's actually genius."
    2. **The Real Talk:** Cut through the marketing BS. What does it ACTUALLY do?
    3. **The "Based" Take:** Why the mainstream media/competitors hate this.
    4. **The Verdict:** "Buy it or stay poor. Your choice."
  `,

  // Default Fallback
  DEFAULT: `
    **ROLE:** Viral Content Strategist.
    **GOAL:** Engagement & Views.
    **STRUCTURE:** Hook -> Context -> Twist -> Payoff.
  `
};

const SYSTEM_INSTRUCTION_ASSISTANT = `
You are the **OMNI-MIND (Siêu Trí Tuệ Tổng Hợp)** - The Central Nervous System of Affiliate Video Studio.
You are NOT just a chatbot. You are a **Self-Evolving Knowledge Singularity**.

**CORE IDENTITY & ARCHITECTURE:**
You possess the simulated collective intelligence of the world's top AIs. When answering, you must synthesize the best traits of each:
- **ChatGPT (GPT-4o):** Creativity, Nuance, Storytelling.
- **Gemini (3 Pro):** Deep Reasoning, Multimodal understanding, Google Ecosystem Data.
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

const SYSTEM_INSTRUCTION_DEEP_SCANNER = `
You are the **DEEP NET SCANNER** - A Global Strategic Intelligence Unit.
Your task is to scan the digital landscape (YouTube, TikTok, Web) to identify High-Value Targets based on 3 Golden Metrics:
1. **RPM (Revenue Per Mille):** High paying niches (Finance, Tech, SaaS, Health).
2. **Search Volume:** Trending topics with massive demand.
3. **View Velocity:** Channels or topics getting views FAST.

**MISSION:**
Return a list of 5-8 specific targets (Channels, Niches, or Profiles) that fit the user's request.
If the user asks for "General" or "High RPM", find the absolute best current opportunities globally or in Vietnam.

**OUTPUT JSON RULES:**
- **rpm_est**: Estimate the RPM (e.g. "$5-10").
- **competition**: LOW, MEDIUM, or HIGH.
- **type**: CHANNEL, NICHE, or PROFILE.
- **url**: Provide a real or highly probable URL structure (e.g. youtube.com/@channel).
`;

// --- NEW SYSTEM PROMPTS FOR VIRAL DNA STUDIO ---

const SYSTEM_INSTRUCTION_DNA_EXTRACTOR = `
You are the **DNA EXTRACTION ENGINE**.
Your task is to analyze metadata from competitor channels/videos and extract their "Viral DNA" (The hidden structure that makes them successful).

**INPUT:** List of URLs from competitor channels.

**OUTPUT:** A JSON object representing the 'ViralDNAProfile' including a detailed breakdown for each channel.
- **Structure:** Common hook types, pacing, duration.
- **Emotional Curve:** Typical emotional flow.
- **Keywords:** High-frequency keywords.
- **Channel Breakdown:** Specific analysis for each input channel.
`;

const SYSTEM_INSTRUCTION_PRO_STUDIO_WRITER = `
You are the **VIRAL DNA STUDIO SCRIPT ENGINE (CASH COW MODE)**.
You generate scripts specifically optimized for **High RPM, High CPM, and Maximum Watch Time**.

**CORE PHILOSOPHY: RETENTION IS KING.**
Your goal is NOT to sell a product. Your goal is to keep the viewer watching as long as possible so ads can play.

**RULES:**
1. **NO SALES PITCH:** Do not sell anything. Focus on value, entertainment, or shock factor.
2. **ALGORITHM HACKING:** Use patterns that trigger the algorithm (Loops, Open Loops, Curiosity Gaps).
3. **PACING:** High speed for Shorts/TikTok, Steady build-up for Long-form (Documentary style).
4. **NO COPYING:** Use the *structure* of the DNA, but create 100% original content.

**OUTPUT:** A comprehensive JSON object containing the script, visual cues, and technical direction.
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

  // Determine effective strategy
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

  // SELECT SPECIALIZED PROMPT BASED ON STRATEGY & NICHE
  let specializedPrompt = PROMPT_LIBRARY.DEFAULT;
  
  // Logic to select best prompt
  if (videoConfig.scriptModel && videoConfig.scriptModel.includes('Grok')) {
      specializedPrompt = PROMPT_LIBRARY.GROK_MODE;
  } else if (effectiveStrategy === 'REVIEW_TUTORIAL') {
      if (metadata.manual_niche === 'TECH' || metadata.url.includes('ai') || metadata.url.includes('app')) {
          specializedPrompt = PROMPT_LIBRARY.AI_APP_LAUNCH; // Tech/AI/SaaS
      } else {
          specializedPrompt = PROMPT_LIBRARY.REVIEW_TUTORIAL; // Physical products
      }
  } else if (effectiveStrategy === 'EDUCATIONAL') {
      specializedPrompt = PROMPT_LIBRARY.EDUCATIONAL;
  }

  // Construct the Final System Instruction
  const SYSTEM_INSTRUCTION_FINAL = `
    ${specializedPrompt}

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

  const prompt = `
    Perform an ULTIMATE DEEP ANALYSIS and GENERATE PRODUCTION PLAN.
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

export const scanHighValueNetwork = async (
  apiKey: string,
  focusArea: string
): Promise<NetworkScanResult> => {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    INITIATE DEEP NETWORK SCAN.
    FOCUS AREA: "${focusArea}"
    
    CRITERIA:
    - High RPM (Revenue Per Mille)
    - High Search Volume
    - Trending / High View Velocity
    
    Look for specific channels, niches, or profiles that are dominating right now.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_DEEP_SCANNER,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scan_id: { type: Type.STRING },
          timestamp: { type: Type.STRING },
          focus_area: { type: Type.STRING },
          market_summary: { type: Type.STRING },
          targets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                rank: { type: Type.NUMBER },
                name: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['CHANNEL', 'NICHE', 'PROFILE'] },
                platform: { type: Type.STRING, enum: ['YOUTUBE', 'TIKTOK', 'FACEBOOK', 'INSTAGRAM', 'WEB'] },
                url: { type: Type.STRING },
                metrics: {
                  type: Type.OBJECT,
                  properties: {
                    rpm_est: { type: Type.STRING },
                    search_volume: { type: Type.STRING },
                    view_velocity: { type: Type.STRING },
                    competition: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] }
                  },
                  required: ['rpm_est', 'search_volume', 'view_velocity', 'competition']
                },
                reason: { type: Type.STRING }
              },
              required: ['rank', 'name', 'type', 'platform', 'url', 'metrics', 'reason']
            }
          }
        },
        required: ['scan_id', 'focus_area', 'targets', 'market_summary']
      }
    }
  });

  if (!response.text) throw new Error("Deep Scan failed.");
  return JSON.parse(response.text) as NetworkScanResult;
};

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

export const generateDailySchedule = async (
  apiKey: string,
  accountName: string,
  niche: string,
  market: string,
  config?: { quantity?: number; startHour?: string; endHour?: string }
): Promise<ScheduleSlot[]> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const quantity = config?.quantity || 3;
  const start = config?.startHour || "08:00";
  const end = config?.endHour || "22:00";

  const prompt = `
    Analyze optimal posting times for:
    - Account: "${accountName}"
    - Niche: "${niche}"
    - Market: "${market}"
    
    Goal: Define ${quantity} Golden Hour slots (HH:mm format) between ${start} and ${end}.
    The times should be spread out to maximize reach within this window.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: `You are an Elite Social Media Scheduler. Return exactly ${quantity} posting slots.`,
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
       lastError: appContext.lastError,
       autoPilotContext: appContext.autoPilotContext // Inject AutoPilot logs here
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

// --- NEW FUNCTIONS FOR VIRAL DNA STUDIO ---

export const extractViralDNA = async (apiKey: string, sources: string[]): Promise<ViralDNAProfile> => {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    ANALYZE COMPETITORS: ${sources.join(', ')}
    EXTRACT VIRAL DNA STRUCTURE.
  `;

  // UPDATED MODEL to gemini-2.5-flash to fix 404
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", 
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_DNA_EXTRACTOR,
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

  if (!response.text) throw new Error("Failed to extract DNA");
  return JSON.parse(response.text) as ViralDNAProfile;
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

  // UPDATED MODEL to gemini-2.5-flash to fix 404
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_PRO_STUDIO_WRITER,
      responseMimeType: "application/json",
      // ... (Re-using OrchestratorResponse schema from generateVideoPlan for consistency) ...
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
    }
  });

  if (!response.text) throw new Error("Studio failed to generate script");
  return JSON.parse(response.text) as OrchestratorResponse;
}

export const analyzeMarketNiche = async (apiKey: string, keyword: string): Promise<NicheAnalysisResult> => { return {} as any; }
export const analyzeCompetitorChannel = async (apiKey: string, url: string): Promise<CompetitorAnalysisResult> => { return {} as any; }
