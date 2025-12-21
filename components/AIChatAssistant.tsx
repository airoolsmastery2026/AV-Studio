
import { Bot, Send, X, Mic, MicOff, Zap, Volume2, VolumeX, Loader2, Sparkles, Navigation, Search, Activity, Smile, AlertOctagon, Brain, Globe, MessageSquare } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { AppContext, ChatMessage, ChatSession, AgentCommand } from '../types';
import { sendChatToAssistant, generateGeminiTTS } from '../services/geminiService';

interface AIChatAssistantProps {
  apiKey: string | undefined;
  appContext: AppContext;
  onCommand: (command: AgentCommand) => void;
}

const STORAGE_KEY = 'av_studio_chat_sessions_v2';

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

const QUICK_ACTIONS = [
    { label: 'Trinh Sát Thị Trường', icon: Search, text: 'Quét thị trường tìm trend ngay.' },
    { label: 'Bật Tự Vận Hành', icon: Zap, text: 'Kích hoạt robot sản xuất AI.' },
    { label: 'Vào Xưởng Phim', icon: Navigation, text: 'Mở Xưởng Phim DNA.' }
];

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ apiKey, appContext, onCommand }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkStage, setThinkStage] = useState(0); 
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
    } else {
        const init: ChatSession = { id: 'init', name: 'Commander Chat', messages: [], createdAt: Date.now() };
        setSessions([init]);
        setCurrentSessionId('init');
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (isOpen) inputRef.current?.focus();
  }, [sessions, isLoading, isOpen]);

  const getOutputCtx = useCallback(() => {
    if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return outputAudioContextRef.current;
  }, []);

  const stopAllAudio = useCallback(() => {
    activeSourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
    activeSourcesRef.current.clear();
    setIsSpeakingId(null);
    nextStartTimeRef.current = 0;
  }, []);

  const playTTS = async (text: string, msgId: string, lang?: string, sentiment?: string) => {
    if (isSpeakingId === msgId) { stopAllAudio(); return; }
    stopAllAudio();
    setIsSpeakingId(msgId);
    try {
        const ctx = getOutputCtx();
        const base64Audio = await generateGeminiTTS(text, lang || 'vi', sentiment || 'neutral');
        if (base64Audio) {
            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.addEventListener('ended', () => setIsSpeakingId(null));
            source.start();
            activeSourcesRef.current.add(source);
        }
    } catch (e) {
        setIsSpeakingId(null);
    }
  };

  const toggleLiveMode = async () => {
    if (isLiveMode) {
      setIsLiveMode(false);
      if (liveSessionRef.current) liveSessionRef.current.close();
      stopAllAudio();
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsLiveMode(true);
      // Fix: Always use process.env.API_KEY for GoogleGenAI initialization
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: "Bạn là AI Commander. Hãy đàm thoại tiếng Việt chuyên nghiệp. Hỗ trợ người dùng vận hành AV Studio."
        },
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const base64Data = encode(new Uint8Array(int16.buffer));
              // Note: Ensure data is streamed only after the session promise resolves.
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (m: LiveServerMessage) => {
            if (m.serverContent?.interrupted) { stopAllAudio(); return; }
            const audio = m.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audio) {
              const ctx = getOutputCtx();
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audio), ctx, 24000, 1);
              const s = ctx.createBufferSource();
              s.buffer = buffer;
              s.connect(ctx.destination);
              s.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              activeSourcesRef.current.add(s);
            }
          },
          onerror: () => setIsLiveMode(false),
          onclose: () => setIsLiveMode(false)
        }
      });
      liveSessionRef.current = await sessionPromise;
    } catch (e) {
      alert("Không thể truy cập Microphone.");
      setIsLiveMode(false);
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    // Fix: Rely exclusively on process.env.API_KEY
    if (!textToSend.trim() || !process.env.API_KEY) return;
    
    const current = sessions.find(s => s.id === currentSessionId);
    if (!current) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend, timestamp: Date.now() };
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, userMsg] } : s));
    setInputText('');
    setIsLoading(true);
    setThinkStage(1);
    
    try {
        const history = current.messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
        setTimeout(() => setThinkStage(2), 600);
        // Fix: Use process.env.API_KEY for consistency
        const res = await sendChatToAssistant(process.env.API_KEY!, history, textToSend, appContext);
        
        const botMsg: ChatMessage = { 
            id: (Date.now()+1).toString(), 
            role: 'model', 
            text: res.text, 
            timestamp: Date.now(), 
            command: res.command, 
            detected_lang: res.detected_lang,
            suggestions: res.suggestions,
            sentiment: res.sentiment as any
        };
        
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, botMsg] } : s));
        if (res.command) onCommand(res.command);
        if (isAudioEnabled) playTTS(res.text, botMsg.id, res.detected_lang, res.sentiment);
    } catch (e) { console.error(e); } finally {
        setIsLoading(false);
        setThinkStage(0);
    }
  };

  const stages = ["Đang chờ", "Phân tích bối cảnh", "Đang suy nghĩ", "Tối ưu phản hồi"];

  return (
    <>
      <div className={`fixed bottom-6 right-6 z-[100] transition-all duration-700 ${isOpen ? 'scale-0 translate-y-20' : 'scale-100 translate-y-0'}`}>
        <button onClick={() => setIsOpen(true)} className="w-16 h-16 rounded-[24px] bg-slate-900 border border-primary/40 flex items-center justify-center shadow-neon hover:shadow-neon-hover group overflow-hidden active:scale-90 transition-all">
          <Bot size={32} className="text-primary group-hover:rotate-[15deg] transition-transform z-10" />
          <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-neon border border-slate-900"></div>
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[450px] h-[750px] bg-[#070B14] border border-slate-700 rounded-[36px] shadow-2xl flex flex-col overflow-hidden z-[101] animate-fade-in ring-1 ring-slate-800">
          <div className="p-6 bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                <Zap size={20} className="text-primary animate-pulse" />
              </div>
              <div>
                <span className="font-black text-white text-base tracking-tighter block uppercase">Commander <span className="text-primary/70">Neural</span></span>
                <span className="text-[10px] text-primary/60 font-black uppercase tracking-[0.2em]">Chỉ Huy Trưởng AI</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsAudioEnabled(!isAudioEnabled)} className={`p-2.5 rounded-xl transition-all ${isAudioEnabled ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-500 hover:bg-slate-800'}`}>
                {isAudioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button onClick={toggleLiveMode} className={`p-2.5 rounded-xl transition-all ${isLiveMode ? 'bg-red-500 text-white shadow-neon' : 'text-slate-500 hover:bg-slate-800'}`}>
                <Mic size={20} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2.5 text-slate-500 hover:text-white transition-colors">
                <X size={24}/>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-7 bg-[radial-gradient(circle_at_top_right,rgba(14,165,164,0.05),transparent)] custom-scrollbar relative">
             {isLiveMode ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-12 animate-fade-in">
                    <div className="w-40 h-40 bg-primary/5 rounded-full flex items-center justify-center border border-primary/20 animate-[pulse_1.5s_infinite]">
                        <div className="flex items-end gap-1.5 h-14">
                            <div className="w-2 bg-primary rounded-full animate-[wave_1s_infinite_0s]" style={{ height: '40%' }}></div>
                            <div className="w-2 bg-primary rounded-full animate-[wave_1s_infinite_0.2s]" style={{ height: '85%' }}></div>
                            <div className="w-2 bg-primary rounded-full animate-[wave_1s_infinite_0.1s]" style={{ height: '100%' }}></div>
                            <div className="w-2 bg-primary rounded-full animate-[wave_1s_infinite_0.3s]" style={{ height: '55%' }}></div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-black text-white text-2xl uppercase tracking-tighter">LIÊN KẾT GIỌNG NÓI</h4>
                        <p className="text-[11px] text-slate-500 uppercase font-black tracking-[0.4em] animate-pulse">Đang lắng nghe chỉ thị của bạn...</p>
                    </div>
                    <button onClick={toggleLiveMode} className="px-8 py-3 bg-red-500/10 border border-red-500/40 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                        Ngắt kết nối
                    </button>
                </div>
             ) : (
                <>
                  {sessions.find(s => s.id === currentSessionId)?.messages.map((m, i) => (
                      <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in group`}>
                          <div className={`relative max-w-[85%] p-5 rounded-[26px] text-sm leading-relaxed shadow-2xl border transition-all duration-300 ${
                            m.role === 'user' 
                              ? 'bg-primary border-primary/30 text-white rounded-tr-none' 
                              : 'bg-slate-900 border-slate-800 text-slate-100 rounded-tl-none hover:border-primary/30'
                          }`}>
                              {m.text}
                              {m.role === 'model' && (
                                <button onClick={() => playTTS(m.text, m.id, m.detected_lang, m.sentiment)} className={`absolute -right-12 top-1/2 -translate-y-1/2 p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-primary transition-all opacity-0 group-hover:opacity-100 ${isSpeakingId === m.id ? 'opacity-100 border-primary text-primary animate-pulse' : 'text-slate-500 shadow-xl'}`}>
                                    {isSpeakingId === m.id ? <Activity size={18} /> : <Volume2 size={18} />}
                                </button>
                              )}
                          </div>
                          {m.role === 'model' && m.suggestions && m.suggestions.length > 0 && i === sessions.find(s => s.id === currentSessionId)!.messages.length - 1 && !isLoading && (
                            <div className="flex flex-wrap gap-2.5 mt-5 animate-fade-in pl-2">
                               {m.suggestions.map((s, idx) => (
                                 <button key={idx} onClick={() => handleSendMessage(s)} className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-full text-[10px] font-black text-slate-400 hover:text-white hover:border-primary hover:bg-primary/10 transition-all flex items-center gap-2 group/chip uppercase tracking-tight">
                                   <Zap size={10} className="text-primary/70" /> {s}
                                 </button>
                               ))}
                            </div>
                          )}
                      </div>
                  ))}
                  {isLoading && (
                      <div className="flex justify-start animate-fade-in">
                          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-[28px] rounded-tl-none flex flex-col gap-4 min-w-[280px] shadow-2xl relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 overflow-hidden">
                                <div className="h-full bg-primary animate-[moveRight_2s_infinite]"></div>
                             </div>
                             <div className="flex items-center gap-4">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"></div>
                                    <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"></div>
                                    <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"></div>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Đang xử lý tín hiệu</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary transition-all duration-700" style={{ width: `${(thinkStage/3)*100}%` }}></div>
                                </div>
                                <span className="text-[9px] font-mono text-slate-600 font-black uppercase">{stages[thinkStage]}</span>
                             </div>
                          </div>
                      </div>
                  )}
                </>
             )}
            <div ref={messagesEndRef} />
          </div>

          {!isLiveMode && (
            <div className="p-6 bg-slate-950/90 border-t border-slate-800 shrink-0">
                <div className="flex gap-2.5 overflow-x-auto pb-5 custom-scrollbar no-scrollbar">
                    {QUICK_ACTIONS.map((action, idx) => (
                        <button key={idx} onClick={() => handleSendMessage(action.text)} className="flex items-center gap-2.5 px-5 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 hover:text-white hover:border-primary transition-all whitespace-nowrap shrink-0 uppercase tracking-tighter">
                            <action.icon size={12} className="text-primary opacity-60" />
                            {action.label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-4">
                    <div className="relative flex-1 group">
                        <input ref={inputRef} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Nhập lệnh chỉ huy..." className="w-full bg-slate-900 border border-slate-800 rounded-[22px] px-6 py-4.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-800 shadow-inner" />
                    </div>
                    <button onClick={() => handleSendMessage()} disabled={isLoading || !inputText.trim()} className="w-14 h-14 bg-primary rounded-[22px] text-white flex items-center justify-center hover:bg-primary/80 transition-all disabled:opacity-20 shadow-neon active:scale-95 shrink-0">
                        <Send size={24} />
                    </button>
                </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AIChatAssistant;
