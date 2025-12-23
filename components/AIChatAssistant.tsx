
import { Bot, Send, Mic, MicOff, Volume2, VolumeX, Activity, UserCheck, Loader2, Waves, ChevronDown, ExternalLink, Globe, Search, BrainCircuit, Sparkles, Terminal, Shield, MoveUpRight, Info, Zap, Maximize2, Minimize2, Radio, Phone, PhoneOff, Cpu } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { AppContext, ChatMessage, ChatSession, AgentCommand } from '../types';
import { sendChatToAssistant, generateGeminiTTS } from '../services/geminiService';

interface AIChatAssistantProps {
  apiKey: string | undefined;
  appContext: AppContext;
  onCommand: (command: AgentCommand) => void;
  t: any;
}

const STORAGE_KEY = 'av_studio_chat_sessions_v4';

// Helper for Audio Encoding/Decoding
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ apiKey, appContext, onCommand, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [liveTranscription, setLiveTranscription] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Initialization
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
    } else {
      const initId = crypto.randomUUID();
      const init: ChatSession = { id: initId, name: 'Tactical Uplink', messages: [], createdAt: Date.now() };
      setSessions([init]);
      setCurrentSessionId(initId);
    }
  }, []);

  const stopAllAudio = useCallback(() => {
    audioSourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
    audioSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  // START LIVE VOICE CONVERSATION
  const startLiveMode = async () => {
    if (!process.env.API_KEY) return;
    setIsLiveMode(true);
    stopAllAudio();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Model Audio
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = outputCtx;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              audioSourcesRef.current.add(source);
              source.onended = () => audioSourcesRef.current.delete(source);
            }

            // Handle Interruptions
            if (message.serverContent?.interrupted) {
              stopAllAudio();
            }

            // Handle Transcription (Visual Feedback)
            if (message.serverContent?.outputAudioTranscription) {
              setLiveTranscription(prev => prev + message.serverContent?.outputAudioTranscription?.text);
            }
            if (message.serverContent?.turnComplete) {
              setLiveTranscription('');
            }
          },
          onerror: (e) => console.error("Live Error:", e),
          onclose: () => setIsLiveMode(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          },
          systemInstruction: `Bạn là Elite AI Commander. Một chuyên gia cố vấn chiến lược cao cấp cho hệ thống AV Studio.
          BỐI CẢNH HỆ THỐNG: ${JSON.stringify(appContext)}.
          NHIỆM VỤ: Đàm thoại giọng nói trực tiếp, tư vấn về ngách affiliate, kỹ thuật video viral và quản trị tài nguyên.
          PHONG THÁI: Tự tin, chuyên nghiệp, sắc bén, luôn hướng tới kết quả kinh doanh.
          KHO KIẾN THỨC: Bạn tích hợp tri thức từ các kho dữ liệu đa nền tảng, ghi nhớ các ưu tiên của người dùng từ KnowledgeBase.`,
        }
      });

      liveSessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setIsLiveMode(false);
    }
  };

  const endLiveMode = () => {
    liveSessionRef.current?.close();
    setIsLiveMode(false);
    stopAllAudio();
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !process.env.API_KEY) return;
    const current = sessions.find(s => s.id === currentSessionId);
    if (!current) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputText, timestamp: Date.now() };
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, userMsg] } : s));
    setInputText('');
    setIsLoading(true);
    
    try {
        const history = current.messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
        const res = await sendChatToAssistant(process.env.API_KEY!, history, userMsg.text, appContext);
        
        const botMsg: ChatMessage = { 
            id: (Date.now()+1).toString(), 
            role: 'model', 
            text: res.text, 
            timestamp: Date.now(), 
            command: res.command, 
            suggestions: res.suggestions,
            sources: res.sources
        };
        
        setSessions(prev => {
            const updated = prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, botMsg] } : s);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
        
        if (res.command) onCommand(res.command);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Tactical Orb */}
      <div className={`fixed bottom-6 right-6 z-[100] transition-all duration-500 transform ${isOpen ? 'scale-0 translate-y-12' : 'scale-100 translate-y-0'}`}>
        <button 
          onClick={() => setIsOpen(true)} 
          className="relative w-20 h-20 rounded-full bg-slate-900 border border-primary/40 flex items-center justify-center shadow-neon hover:shadow-primary/80 transition-all group"
        >
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
          <div className="absolute inset-2 rounded-full border border-primary/20 border-dashed animate-spin-slow"></div>
          <Cpu size={40} className="text-primary group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </button>
      </div>

      {isOpen && (
        <div className={`fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[480px] transition-all duration-500 bg-slate-950/95 backdrop-blur-3xl border border-slate-800 sm:rounded-[40px] shadow-[0_0_100px_rgba(14,165,164,0.15)] flex flex-col overflow-hidden z-[200] animate-fade-in ${isMinimized ? 'h-[80px]' : 'h-[85vh] sm:h-[780px]'}`}>
          
          {/* Header Panel */}
          <div className="h-[90px] px-8 bg-slate-900/50 border-b border-slate-800/60 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl border transition-all duration-500 ${isLiveMode ? 'bg-red-500/10 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-primary/10 border-primary/20 shadow-neon'}`}>
                {isLiveMode ? <Radio size={24} className="text-red-500 animate-pulse" /> : <Shield size={24} className="text-primary" />}
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white text-sm tracking-tighter uppercase leading-none">AI Strategic Consultant</span>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isLiveMode ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                    {isLiveMode ? 'Live Neural Uplink' : 'Secured Digital Terminal'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-2.5 text-slate-500 hover:text-white transition-colors bg-slate-950 border border-slate-800 rounded-xl">
                {isMinimized ? <Maximize2 size={16}/> : <Minimize2 size={16}/>}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2.5 text-slate-500 hover:text-red-500 transition-colors bg-slate-950 border border-slate-800 rounded-xl">
                <ChevronDown size={20}/>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message Feed / Live Visualizer */}
              <div className="flex-1 min-h-0 overflow-y-auto p-8 space-y-8 custom-scrollbar relative">
                
                {isLiveMode ? (
                  <div className="h-full flex flex-col items-center justify-center animate-fade-in space-y-12">
                      {/* 3D Orb Visualizer */}
                      <div className="relative">
                        <div className="w-48 h-48 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center shadow-[0_0_60px_rgba(14,165,164,0.2)]">
                            <div className="w-32 h-32 rounded-full bg-primary/10 border-2 border-primary/40 animate-ping absolute"></div>
                            <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-primary flex items-center justify-center z-10 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
                                <Waves size={40} className="text-white animate-pulse" />
                            </div>
                        </div>
                      </div>
                      
                      <div className="text-center space-y-4 max-w-sm">
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter">Đang tư vấn trực tiếp...</h4>
                        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 text-xs text-slate-400 italic leading-loose">
                           {liveTranscription || "Vui lòng nói, tôi đang lắng nghe và phân tích..."}
                        </div>
                      </div>

                      <button onClick={endLiveMode} className="flex items-center gap-3 px-10 py-5 bg-red-600 text-white rounded-full font-black uppercase tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:bg-red-500 transition-all active:scale-95">
                        <PhoneOff size={20} /> Ngắt kết nối
                      </button>
                  </div>
                ) : (
                  <>
                    {sessions.find(s => s.id === currentSessionId)?.messages.map((m, i) => (
                      <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in group`}>
                          <div className={`max-w-[90%] px-6 py-5 rounded-[32px] text-sm leading-relaxed shadow-xl border transition-all relative whitespace-pre-wrap font-medium ${
                            m.role === 'user' 
                              ? 'bg-primary border-primary/20 text-white rounded-tr-none' 
                              : 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none group-hover:border-primary/40'
                          }`}>
                              {m.text}
                              
                              {m.role === 'model' && m.sources && (
                                <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest"><Globe size={14} className="text-blue-400" /> Tình báo thực địa:</div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {m.sources.map((src, idx) => (
                                            <a key={idx} href={src.uri} target="_blank" className="bg-slate-950/80 px-4 py-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 hover:text-primary hover:border-primary/40 transition-all flex items-center justify-between group/link shadow-sm">
                                                <span className="truncate flex-1 font-bold uppercase tracking-tight">{src.title}</span>
                                                <MoveUpRight size={14} className="ml-2 text-slate-600 group-hover/link:text-primary" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                              )}
                          </div>
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-2 px-4">{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[32px] flex items-center gap-4 shadow-inner">
                                  <div className="flex gap-1.5"><div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div><div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div></div>
                                  <div className="text-[10px] font-black text-primary/70 uppercase tracking-[0.2em]">Cố vấn đang phân tích dữ liệu...</div>
                            </div>
                        </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} className="h-4 shrink-0" />
              </div>

              {/* Action Area */}
              <div className="h-[140px] px-8 pb-10 pt-4 bg-slate-950/80 border-t border-slate-800 shrink-0 flex items-center gap-4">
                  {!isLiveMode && (
                    <button 
                      onClick={startLiveMode} 
                      className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-500 hover:border-red-500/50 transition-all flex items-center justify-center shadow-xl group"
                    >
                      <Phone size={24} className="group-hover:scale-110 transition-transform" />
                    </button>
                  )}
                  
                  <div className="flex-1 relative flex items-center">
                      <div className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded-[32px] shadow-inner focus-within:border-primary/50 transition-all flex items-center">
                          <input 
                            value={inputText} 
                            onChange={(e) => setInputText(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                            placeholder="Truy vấn dữ liệu hoặc tham vấn chiến lược..." 
                            className="flex-1 bg-transparent border-none px-6 py-4 text-sm text-white focus:outline-none placeholder:text-slate-700 font-bold tracking-tight" 
                          />
                          <button onClick={handleSendMessage} disabled={isLoading || !inputText.trim()} className="w-14 h-14 bg-primary rounded-full text-white flex items-center justify-center hover:bg-primary/80 transition-all active:scale-90 shadow-neon">
                            <Send size={20} />
                          </button>
                      </div>
                  </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AIChatAssistant;
