
import { Bot, Send, X, Mic, MicOff, Zap, Volume2, VolumeX, Activity, UserCheck, Play, Loader2, Waves, ChevronDown, ExternalLink, Globe, Search, BrainCircuit, Sparkles, Terminal } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { AppContext, ChatMessage, ChatSession, AgentCommand } from '../types';
import { sendChatToAssistant, generateGeminiTTS } from '../services/geminiService';

interface AIChatAssistantProps {
  apiKey: string | undefined;
  appContext: AppContext;
  onCommand: (command: AgentCommand) => void;
  t: any;
}

const STORAGE_KEY = 'av_studio_chat_sessions_v4';

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
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVoiceCloneEnabled, setIsVoiceCloneEnabled] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [isRecordingInput, setIsRecordingInput] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const recognitionRef = useRef<any>(null);

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

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'vi-VN';

        recognitionRef.current.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('');
            setInputText(transcript);
        };

        recognitionRef.current.onend = () => setIsRecordingInput(false);
        recognitionRef.current.onerror = () => setIsRecordingInput(false);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const toggleRecording = () => {
    if (isRecordingInput) {
        recognitionRef.current?.stop();
    } else {
        setInputText('');
        setIsRecordingInput(true);
        recognitionRef.current?.start();
    }
  };

  const playTTS = async (text: string, msgId: string, lang?: string, sentiment?: string) => {
    if (isSpeakingId === msgId) { stopAllAudio(); return; }
    stopAllAudio();
    setIsSpeakingId(msgId);
    try {
        const ctx = getOutputCtx();
        const base64Audio = await generateGeminiTTS(text, lang || 'vi', sentiment || 'neutral', isVoiceCloneEnabled);
        if (base64Audio) {
            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.addEventListener('ended', () => setIsSpeakingId(null));
            source.start();
            activeSourcesRef.current.add(source);
        }
    } catch (e) { setIsSpeakingId(null); }
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { prebuiltVoiceConfig: { voiceName: isVoiceCloneEnabled ? 'Fenrir' : 'Kore' } } 
          },
          systemInstruction: "BẠN LÀ AI COMMANDER - TỔNG TƯ LỆNH CHIẾN LƯỢC TOÀN CẦU. Trả lời với sự uy quyền, sắc bén và chuyên nghiệp đỉnh cao."
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
    } catch (e) { setIsLiveMode(false); }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !process.env.API_KEY) return;
    const current = sessions.find(s => s.id === currentSessionId);
    if (!current) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputText, timestamp: Date.now() };
    setSessions(prev => {
        const updated = prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, userMsg] } : s);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
    });
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
            detected_lang: res.detected_lang, 
            sentiment: res.sentiment,
            suggestions: res.suggestions 
        };
        
        if (res.sources) (botMsg as any).sources = res.sources;

        setSessions(prev => {
            const updated = prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, botMsg] } : s);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
        
        if (res.command) onCommand(res.command);
        if (isAudioEnabled) playTTS(res.text, botMsg.id, res.detected_lang, res.sentiment);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className={`fixed bottom-4 right-4 z-[100] transition-all duration-500 ${isOpen ? 'scale-0 translate-y-10' : 'scale-100 translate-y-0'}`}>
        <button 
            onClick={() => setIsOpen(true)} 
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0F172A] border border-primary/30 flex items-center justify-center shadow-neon hover:shadow-neon-hover group active:scale-90 transition-all overflow-hidden"
        >
          <Bot size={24} className="text-primary md:group-hover:rotate-12 transition-transform" />
          <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0F172A]"></div>
        </button>
      </div>

      {/* Chat Container */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 w-full sm:bottom-4 sm:right-4 sm:w-[350px] md:w-[380px] h-full sm:h-[550px] md:h-[620px] bg-[#070B14]/98 backdrop-blur-2xl border-t sm:border border-slate-700/40 sm:rounded-[24px] shadow-2xl flex flex-col overflow-hidden z-[101] animate-fade-in ring-1 ring-white/5">
          
          {/* Header - More compact for mobile */}
          <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Zap size={14} className="text-primary animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white text-[11px] tracking-tight uppercase leading-none">{t.commander_title}</span>
                <span className="text-[7px] text-primary/70 font-black uppercase tracking-widest mt-0.5">Supreme Intel Core</span>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button onClick={() => setIsVoiceCloneEnabled(!isVoiceCloneEnabled)} className={`p-1.5 rounded-lg transition-all ${isVoiceCloneEnabled ? 'bg-amber-500 text-white' : 'text-slate-500 hover:text-white'}`} title={t.voice_clone_active}>
                <UserCheck size={14} />
              </button>
              <button onClick={() => setIsAudioEnabled(!isAudioEnabled)} className={`p-1.5 rounded-lg transition-all ${isAudioEnabled ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:text-white'}`}>
                {isAudioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
              <button onClick={toggleLiveMode} className={`p-1.5 rounded-lg transition-all ${isLiveMode ? 'bg-red-500 text-white shadow-neon' : 'text-slate-500 hover:text-white'}`}>
                {isLiveMode ? <Mic size={14} /> : <MicOff size={14} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 text-slate-500 hover:text-white transition-colors ml-1">
                <ChevronDown size={20}/>
              </button>
            </div>
          </div>

          {/* Messages Area - Mobile Optimized Padding */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(circle_at_top_right,rgba(14,165,164,0.02),transparent)] custom-scrollbar">
             {isLiveMode ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-fade-in py-10">
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center border border-primary/20 animate-pulse relative">
                        <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping"></div>
                        <div className="flex items-end gap-1 h-6 relative z-10">
                            {[0, 0.1, 0.2, 0.3].map((delay) => (
                                <div key={delay} className="w-1 bg-primary rounded-full animate-bounce" style={{ height: `${50 + Math.random()*50}%`, animationDelay: `${delay}s` }}></div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-black text-white text-[12px] uppercase tracking-wide">{t.chat_mic_on}</h4>
                        <p className="text-[7px] text-slate-600 uppercase font-black mt-2 tracking-[0.1em]">Neural Link Established</p>
                    </div>
                </div>
             ) : (
                <>
                  <div className="bg-slate-900/40 rounded-xl px-3 py-2 border border-slate-800/40 mb-3 flex items-center gap-2">
                      <Terminal size={12} className="text-primary animate-pulse" />
                      <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Real-time Intelligence Active</span>
                  </div>

                  {sessions.find(s => s.id === currentSessionId)?.messages.map((m, i) => (
                      <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in group`}>
                          <div className={`max-w-[90%] px-3.5 py-2.5 rounded-2xl text-[11px] leading-relaxed shadow-sm border transition-all relative ${
                            m.role === 'user' 
                              ? 'bg-primary/90 border-primary/20 text-white rounded-tr-none' 
                              : 'bg-slate-900 border-slate-800/60 text-slate-200 rounded-tl-none group-hover:border-primary/20'
                          }`}>
                              {m.text}
                              
                              {m.role === 'model' && (m as any).sources && (
                                <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                        <Globe size={10} /> Grounded Sources:
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(m as any).sources.map((src: any, idx: number) => (
                                            <a key={idx} href={src.uri} target="_blank" className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[8px] text-primary hover:text-white transition-all flex items-center gap-1">
                                                <ExternalLink size={8} /> {src.title}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                              )}

                              {m.role === 'model' && (
                                <button 
                                    onClick={() => playTTS(m.text, m.id, m.detected_lang, (m as any).sentiment)} 
                                    className={`absolute -bottom-1.5 -right-1.5 p-1 rounded-md border transition-all ${isSpeakingId === m.id ? 'bg-primary text-white scale-110 shadow-neon' : 'bg-slate-800 text-slate-600 hover:text-primary'}`}
                                >
                                    <Volume2 size={10} />
                                </button>
                              )}
                          </div>
                      </div>
                  ))}
                  
                  {isLoading && (
                      <div className="flex justify-start animate-fade-in">
                          <div className="bg-slate-900/50 border border-slate-800 p-2.5 rounded-xl rounded-tl-none flex items-center gap-2.5">
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce"></div>
                                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <div className="flex items-center gap-1 text-[8px] font-black text-primary/70 uppercase tracking-widest">
                                    <Search size={10} /> Neural Researching...
                                </div>
                          </div>
                      </div>
                  )}
                </>
             )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - More compact and ergonomic */}
          {!isLiveMode && (
            <div className="px-3 pb-3 pt-2 bg-slate-950 border-t border-slate-800 shrink-0 space-y-2">
                {isRecordingInput && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-primary/5 border border-primary/10 rounded-lg animate-fade-in">
                        <Waves size={12} className="text-primary animate-pulse" />
                        <span className="text-[8px] text-primary font-black uppercase tracking-widest">Listening for commands...</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <button 
                        onClick={toggleRecording} 
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${isRecordingInput ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-900/50 text-slate-500 hover:text-primary border border-slate-800/50'}`}
                    >
                        {isRecordingInput ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>
                    <div className="flex-1 relative flex items-center">
                        <input 
                            ref={inputRef} 
                            value={inputText} 
                            onChange={(e) => setInputText(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                            placeholder="Commander Command..." 
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-primary/40 transition-all placeholder:text-slate-800" 
                        />
                        <button 
                            onClick={handleSendMessage} 
                            disabled={isLoading || !inputText.trim()} 
                            className="absolute right-1 w-7 h-7 bg-primary rounded-lg text-white flex items-center justify-center hover:bg-primary/80 transition-all disabled:opacity-0 shadow-lg active:scale-90"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AIChatAssistant;
