import { GoogleGenAI, Type } from "@google/genai";
import {
  OrchestratorResponse,
  SourceMetadata,
  HunterInsight,
  NetworkScanResult,
  AffiliateHuntResult,
  AppContext,
  GoldenHourRecommendation,
  ScheduleSlot,
  ChannelHealthReport,
  AgentCommand
} from '../types';

// Helper to get AI instance
const getAi = (apiKey: string) => new GoogleGenAI({ apiKey });

export const classifyInput = async (apiKey: string, input: string): Promise<{ type: 'channel' | 'product' | 'auto_detect', strategy: string }> => {
  const ai = getAi(apiKey);
  const prompt = `Classify this input: "${input}". Return JSON with 'type' (channel, product, or auto_detect) and 'strategy' (e.g. VIRAL_CLONE, REVIEW_TUTORIAL).`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["channel", "product", "auto_detect"] },
          strategy: { type: Type.STRING }
        },
        required: ["type", "strategy"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateVideoPlan = async (apiKey: string, metadata: SourceMetadata): Promise<OrchestratorResponse> => {
  const ai = getAi(apiKey);
  const prompt = `Generate a video production plan for: ${JSON.stringify(metadata)}.
  Include market scoring, audience personas, deep analysis, production plan (script, scenes), and generated content metadata.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          market_scoring: {
            type: Type.OBJECT,
            properties: {
              tiktok_potential: { type: Type.NUMBER },
              youtube_shorts_potential: { type: Type.NUMBER },
              estimated_cpm: { type: Type.STRING }
            }
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
                script_tone: { type: Type.STRING }
              }
            }
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
             }
          },
          production_plan: {
              type: Type.OBJECT,
              properties: {
                  script_master: { type: Type.STRING },
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
                              priority: { type: Type.STRING }
                          }
                      }
                  },
                  technical_specs: {
                      type: Type.OBJECT,
                      properties: {
                          resolution: { type: Type.STRING },
                          ratio: { type: Type.STRING },
                          fps: { type: Type.NUMBER }
                      }
                  }
              }
          },
          generated_content: {
              type: Type.OBJECT,
              properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  thumbnail_prompt: { type: Type.STRING }
              }
          },
          consent_log: {
              type: Type.OBJECT,
              properties: {
                  user_confirmed_clone: { type: Type.BOOLEAN },
                  timestamp: { type: Type.STRING }
              }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}') as OrchestratorResponse;
};

export const runHunterAnalysis = async (apiKey: string, target: string): Promise<HunterInsight> => {
    const ai = getAi(apiKey);
    const prompt = `Analyze this target for affiliate potential: "${target}". Return HunterInsight JSON.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
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
                                trend: { type: Type.STRING }
                            }
                        }
                    },
                    hidden_analysis: {
                        type: Type.OBJECT,
                        properties: {
                            consumer_psychology: { type: Type.STRING },
                            competitor_weakness: { type: Type.STRING },
                            profit_potential: { type: Type.STRING },
                            risk_assessment: { type: Type.STRING }
                        }
                    },
                    strategic_suggestion: { type: Type.STRING }
                }
            }
        }
    });
    return JSON.parse(response.text || '{}') as HunterInsight;
}

export const scanHighValueNetwork = async (apiKey: string, focus: string): Promise<NetworkScanResult> => {
    const ai = getAi(apiKey);
    const prompt = `Scan high value network for focus: "${focus}". Return NetworkScanResult JSON.`;
     const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
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
                                type: { type: Type.STRING },
                                platform: { type: Type.STRING },
                                url: { type: Type.STRING },
                                metrics: {
                                    type: Type.OBJECT,
                                    properties: {
                                        rpm_est: { type: Type.STRING },
                                        search_volume: { type: Type.STRING },
                                        view_velocity: { type: Type.STRING },
                                        competition: { type: Type.STRING }
                                    }
                                },
                                reason: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        }
    });
    return JSON.parse(response.text || '{}') as NetworkScanResult;
}

export const huntAffiliateProducts = async (apiKey: string, niche: string, networks: string[]): Promise<AffiliateHuntResult> => {
     const ai = getAi(apiKey);
    const prompt = `Hunt affiliate products for niche: "${niche}" in networks: ${networks.join(', ')}. Return AffiliateHuntResult JSON.`;
     const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    strategy_note: { type: Type.STRING },
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
                    }
                }
            }
        }
    });
    return JSON.parse(response.text || '{}') as AffiliateHuntResult;
}

export const sendChatToAssistant = async (apiKey: string, history: any[], message: string, context: AppContext): Promise<{ text: string, command?: AgentCommand }> => {
    const ai = getAi(apiKey);
    const prompt = `
    User Context: ${JSON.stringify(context)}
    History: ${JSON.stringify(history)}
    User Message: ${message}
    
    You are AV Commander, an AI assistant for this video automation app.
    If the user asks to perform an action (like "check analytics", "create video for [url]", "go to settings"),
    return a JSON response with 'text' (your reply) and 'command' (action details).
    Available actions: NAVIGATE, SET_INPUT, EXECUTE_RUN, UPDATE_MEMORY.
    If no action, just return 'text'.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
             responseMimeType: "application/json",
             responseSchema: {
                 type: Type.OBJECT,
                 properties: {
                     text: { type: Type.STRING },
                     command: {
                         type: Type.OBJECT,
                         properties: {
                             action: { type: Type.STRING, enum: ['NAVIGATE', 'SET_INPUT', 'EXECUTE_RUN', 'UPDATE_MEMORY', 'NONE'] },
                             payload: { type: Type.STRING },
                             reasoning: { type: Type.STRING }
                         },
                         nullable: true
                     }
                 }
             }
        }
    });
    return JSON.parse(response.text || '{}');
}

export const predictGoldenHours = async (apiKey: string, region: string, niche: string, platforms: string[]): Promise<GoldenHourRecommendation[]> => {
    const ai = getAi(apiKey);
    const prompt = `Predict golden hours for posting in region: ${region}, niche: ${niche}, platforms: ${platforms.join(',')}. Return JSON array of GoldenHourRecommendation.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        time_label: { type: Type.STRING },
                        reason: { type: Type.STRING },
                        score: { type: Type.NUMBER }
                    }
                }
            }
        }
    });
    return JSON.parse(response.text || '[]') as GoldenHourRecommendation[];
}

export const generateDailySchedule = async (
  apiKey: string,
  accountName: string,
  niche: string,
  market: string,
  config: { quantity: number; startHour: string; endHour: string } = { quantity: 3, startHour: "09:00", endHour: "21:00" }
): Promise<ScheduleSlot[]> => {
  const ai = getAi(apiKey);
  const prompt = `
    Analyze optimal posting times for:
    - Account: "${accountName}"
    - Niche: "${niche}"
    - Market: "${market}"
    
    **CONFIGURATION:**
    - Total Posts to Schedule: ${config.quantity}
    - Operating Window: From ${config.startHour} to ${config.endHour}
    
    **MISSION:**
    Generate a posting schedule with exactly ${config.quantity} slots distributed intelligently within the operating window to maximize reach (Spacing them out logically).
    For each slot, suggest a specific "Purpose" (e.g., Morning Hook, Lunch Break, Evening Chill, etc.) suitable for that time.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: `You are an Elite Social Media Scheduler. Return exactly ${config.quantity} posting slots in JSON format.`,
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

export const generateChannelAudit = async (apiKey: string, channelName: string, platform: string): Promise<ChannelHealthReport> => {
    const ai = getAi(apiKey);
    const prompt = `Perform a simulated health audit for channel "${channelName}" on ${platform}. Return ChannelHealthReport JSON.`;

     const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
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
                                type: { type: Type.STRING },
                                severity: { type: Type.STRING },
                                description: { type: Type.STRING },
                                detected_at: { type: Type.NUMBER }
                            }
                        }
                    },
                    ai_diagnosis: { type: Type.STRING },
                    action_plan: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            }
        }
    });
    return JSON.parse(response.text || '{}') as ChannelHealthReport;
}
