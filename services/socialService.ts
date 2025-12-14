
import { ApiKeyConfig } from '../types';

export interface SocialPostResult {
  success: boolean;
  platform: string;
  postId?: string;
  error?: string;
}

export const postVideoToSocial = async (
  apiKeyConfig: ApiKeyConfig,
  content: { title: string, caption: string, videoUrl?: string }
): Promise<SocialPostResult> => {
  
  console.log(`[SocialService] Connecting to ${apiKeyConfig.provider.toUpperCase()} via Key: ${apiKeyConfig.alias}...`);

  try {
    // Simulate Network Latency and Processing Time
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (apiKeyConfig.provider === 'zalo') {
        return await mockPostToZaloOA(apiKeyConfig.key, content);
    }
    if (apiKeyConfig.provider === 'zalo_personal') {
        return await mockPostToZaloPersonal(apiKeyConfig.key, content);
    }

    // Generic Simulation for other platforms (YouTube, TikTok, etc.)
    return { 
        success: true, 
        platform: apiKeyConfig.provider, 
        postId: `${apiKeyConfig.provider}_${Date.now()}` 
    };

  } catch (error: any) {
    console.error(`[SocialService] Error posting to ${apiKeyConfig.provider}:`, error);
    return { success: false, platform: apiKeyConfig.provider, error: error.message };
  }
};

const mockPostToZaloOA = async (token: string, content: { title: string, caption: string }): Promise<SocialPostResult> => {
    console.log("[Zalo OA] 1. Initializing Video Upload Session...");
    await new Promise(r => setTimeout(r, 500));
    
    console.log("[Zalo OA] 2. Uploading binary data... [====================] 100%");
    await new Promise(r => setTimeout(r, 800));
    
    console.log("[Zalo OA] 3. Waiting for video processing...");
    await new Promise(r => setTimeout(r, 500));
    
    console.log(`[Zalo OA] 4. Creating Article/Post with Video ID.`);
    
    // Simulate Zalo OA API response
    return { 
        success: true, 
        platform: 'zalo', 
        postId: `zalo_oa_${Date.now().toString().slice(-8)}` 
    };
}

const mockPostToZaloPersonal = async (token: string, content: { title: string, caption: string }): Promise<SocialPostResult> => {
    console.log("[Zalo Personal] 1. Authenticating with Session Token/Cookie...");
    if (!token.includes("z_pw_token") && token.length < 20) {
        throw new Error("Invalid Session Token format.");
    }
    await new Promise(r => setTimeout(r, 800));
    
    console.log("[Zalo Personal] 2. Getting Upload Server URL...");
    await new Promise(r => setTimeout(r, 500));
    
    console.log("[Zalo Personal] 3. Uploading Video Chunk 1/3...");
    await new Promise(r => setTimeout(r, 500));
    console.log("[Zalo Personal] 3. Uploading Video Chunk 2/3...");
    await new Promise(r => setTimeout(r, 500));
    console.log("[Zalo Personal] 3. Uploading Video Chunk 3/3...");
    
    console.log(`[Zalo Personal] 4. Posting to Feed: "${content.title}"`);
    
    return { 
        success: true, 
        platform: 'zalo_personal', 
        postId: `zalo_pers_${Date.now().toString().slice(-8)}` 
    };
}
