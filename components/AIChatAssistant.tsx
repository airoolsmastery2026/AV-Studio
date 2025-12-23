
import { Bot, Send, Mic, MicOff, Volume2, VolumeX, Activity, UserCheck, Loader2, Waves, ChevronDown, ExternalLink, Globe, Search, BrainCircuit, Sparkles, Terminal, Shield, MoveUpRight } from 'lucide-react';
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
            const transcript = Array.from(event.results).map((result: any) => result[0].transcript).join('');
            setInputText(transcript);
        };
        recognitionRef.current.onend = () => setIsRecordingInput(false);
        recognitionRef.current.onerror = () => setIsRecordingInput(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
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
    if (isRecordingInput) recognitionRef.current?.stop();
    else { setInputText(''); setIsRecordingInput(true); recognitionRef.current?.start(); }
  };

  const playTTS = async (text: string, msgId: string) => {
    if (isSpeakingId === msgId) { stopAllAudio(); return; }
    stopAllAudio();
    setIsSpeakingId(msgId);
    try {
        const ctx = getOutputCtx();
        const base64Audio = await generateGeminiTTS(text);
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
            suggestions: res.suggestions 
        };
        
        if (res.sources) (botMsg as any).sources = res.sources;

        setSessions(prev => {
            const updated = prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, botMsg] } : s);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
        
        if (res.command) onCommand(res.command);
        if (isAudioEnabled) playTTS(res.text, botMsg.id);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  return (
    <>
      {/* Floating Button */}
      <div className={`fixed bottom-6 right-6 z-[100] transition-all duration-500 transform ${isOpen ? 'scale-0 translate-y-12' : 'scale-100 translate-y-0'}`}>
        <button 
            onClick={() => setIsOpen(true)} 
            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-slate-900 border border-primary/30 flex items-center justify-center shadow-[0_0_30px_rgba(14,165,164,0.4)] hover:shadow-primary/60 hover:scale-110 group transition-all"
        >
          <Bot size={32} className="text-primary group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
        </button>
      </div>

      {/* Main Chat UI */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[680px] bg-slate-950/98 backdrop-blur-2xl border border-slate-800/60 sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden z-[200] animate-fade-in ring-1 ring-white/5">
          
          {/* Header */}
          <div className="h-[64px] px-6 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Shield size={20} className="text-primary animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-white text-xs tracking-tight uppercase leading-none">{t.commander_title}</span>
                <span className="text-[8px] text-primary/70 font-black uppercase tracking-widest mt-1.5">Intelligence Core Active</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setIsAudioEnabled(!isAudioEnabled)} className={`p-2 rounded-xl transition-all ${isAudioEnabled ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:text-white'}`}>{isAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 hover:text-white ml-1 transition-colors"><ChevronDown size={24}/></button>
            </div>
          </div>

          {/* Messages Area - Chống tràn bằng min-h-0 và flex-1 */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(14,165,164,0.03),transparent)]">
            <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/60 flex items-center gap-3">
                <Terminal size={14} className="text-primary animate-pulse" />
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">AV-COMMANDER: Strategic Protocol Active</span>
            </div>

            {sessions.find(s => s.id === currentSessionId)?.messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in group`}>
                    <div className={`max-w-[92%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-lg border transition-all relative whitespace-pre-wrap ${
                      m.role === 'user' 
                        ? 'bg-primary border-primary/20 text-white rounded-tr-none shadow-primary/10' 
                        : 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none group-hover:border-primary/30'
                    }`}>
                        {m.text}
                        
                        {m.role === 'model' && (m as any).sources && (
                          <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                              <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                  <Globe size={12} /> Căn cứ dữ liệu trực tuyến:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                  {(m as any).sources.map((src: any, idx: number) => (
                                      <a key={idx} href={src.uri} target="_blank" className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-[9px] text-primary hover:text-white hover:bg-primary/20 transition-all flex items-center gap-1.5 group/link">
                                          <ExternalLink size={10} /> {src.title || "Chi tiết nguồn"} <MoveUpRight size={8} className="opacity-0 group-hover/link:opacity-100" />
                                      </a>
                                  ))}
                              </div>
                          </div>
                        )}

                        {m.role === 'model' && (
                          <button 
                              onClick={() => playTTS(m.text, m.id)} 
                              className={`absolute -bottom-2 -right-2 p-2 rounded-xl border transition-all ${isSpeakingId === m.id ? 'bg-primary text-white scale-110 shadow-neon' : 'bg-slate-800 text-slate-500 hover:text-primary border-slate-700'}`}
                          >
                              <Volume2 size={12} />
                          </button>
                        )}
                    </div>
                    
                    {m.suggestions && m.role === 'model' && (
                      <div className="flex flex-wrap gap-2 mt-4 ml-2">
                          {m.suggestions.map((s, idx) => (
                              <button 
                                  key={idx} 
                                  onClick={() => { setInputText(s); inputRef.current?.focus(); }}
                                  className="text-[10px] font-bold text-slate-500 hover:text-primary bg-slate-900/40 hover:bg-primary/10 border border-slate-800 px-3 py-1.5 rounded-full transition-all"
                              >
                                  + {s}
                              </button>
                          ))}
                      </div>
                    )}
                </div>
            ))}
            
            {isLoading && (
                <div className="flex justify-start animate-fade-in">
                    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                          <div className="flex gap-1.5">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <div className="text-[9px] font-black text-primary/70 uppercase tracking-widest flex items-center gap-2">
                              <Search size={12} className="animate-pulse" /> Commander is reasoning...
                          </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Input Area */}
          <div className="h-[96px] px-4 pb-6 pt-2 bg-slate-950 border-t border-slate-800 shrink-0 flex flex-col justify-center relative">
              {isRecordingInput && (
                  <div className="absolute top-[-36px] left-0 right-0 h-[36px] bg-primary/20 backdrop-blur-sm flex items-center justify-center gap-2 px-4 animate-fade-in border-t border-primary/20">
                      <Waves size={14} className="text-primary animate-pulse" />
                      <span className="text-[9px] text-primary font-black uppercase tracking-widest">Listening... speak your command clearly.</span>
                  </div>
              )}
              <div className="flex items-center gap-3">
                  <button 
                      onClick={toggleRecording} 
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0 ${isRecordingInput ? 'bg-red-500 text-white shadow-neon animate-pulse' : 'bg-slate-900 text-slate-500 hover:text-primary border border-slate-800'}`}
                  >
                      {isRecordingInput ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                  <div className="flex-1 relative flex items-center group">
                      <input 
                          ref={inputRef} 
                          value={inputText} 
                          onChange={(e) => setInputText(e.target.value)} 
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                          placeholder={t.placeholder_cmd || "Hỏi tư lệnh chiến lược..."} 
                          className="w-full bg-slate-900 border border-slate-800 rounded-[20px] pl-5 pr-12 py-3.5 text-xs text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-700 shadow-inner" 
                      />
                      <button 
                          onClick={handleSendMessage} 
                          disabled={isLoading || !inputText.trim()} 
                          className="absolute right-1.5 w-9 h-9 bg-primary rounded-xl text-white flex items-center justify-center hover:bg-primary/80 transition-all disabled:opacity-0 shadow-lg active:scale-90"
                      >
                          <Send size={18} />
                      </button>
                  </div>
              </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatAssistant;
