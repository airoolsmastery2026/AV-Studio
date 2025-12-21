
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, History, Plus, Trash2, Mic, MicOff, Zap, Volume2 } from 'lucide-react';
import { AppContext, ChatMessage, ChatSession, AgentCommand } from '../types';
import { sendChatToAssistant } from '../services/geminiService';
import { GoogleGenAI, Modality } from '@google/genai';

interface AIChatAssistantProps {
  apiKey: string | undefined;
  appContext: AppContext;
  onCommand: (command: AgentCommand) => void;
}

const STORAGE_KEY = 'av_studio_chat_sessions_v2';

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ apiKey, appContext, onCommand }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const liveSessionRef = useRef<any>(null);

  // Persistence Logic
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
    } else {
        const init: ChatSession = { id: 'init', name: 'New Chat', messages: [], createdAt: Date.now() };
        setSessions([init]);
        setCurrentSessionId('init');
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // LIVE API INTEGRATION
  const toggleLiveMode = async () => {
    if (isLiveMode) {
      setIsLiveMode(false);
      liveSessionRef.current?.close();
      return;
    }

    if (!process.env.API_KEY) return;
    setIsLiveMode(true);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = outputCtx;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are AV Commander. You are in Voice Mode. Be helpful and very brief."
        },
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(input.length);
              for (let i = 0; i < input.length; i++) int16[i] = input[i] * 32768;
              const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg) => {
             const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
             if (audioData) {
                const binary = atob(audioData);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                const dataInt16 = new Int16Array(bytes.buffer);
                const buffer = outputCtx.createBuffer(1, dataInt16.length, 24000);
                const channelData = buffer.getChannelData(0);
                for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
                
                const source = outputCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(outputCtx.destination);
                const startTime = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                source.start(startTime);
                nextStartTimeRef.current = startTime + buffer.duration;
             }
          }
        }
      });
      liveSessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setIsLiveMode(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !apiKey) return;
    const current = sessions.find(s => s.id === currentSessionId);
    if (!current) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputText, timestamp: Date.now() };
    const history = current.messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
    
    setInputText('');
    setIsLoading(true);
    
    try {
        const { text, command } = await sendChatToAssistant(apiKey, history, inputText, appContext);
        const botMsg: ChatMessage = { id: (Date.now()+1).toString(), role: 'model', text, timestamp: Date.now(), command };
        
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, userMsg, botMsg] } : s));
        if (command) onCommand(command);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`fixed bottom-6 right-6 z-[100] transition-all ${isOpen ? 'scale-0' : 'scale-100'}`}>
        <button onClick={() => setIsOpen(true)} className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-neon hover:scale-110 transition-transform">
          <Bot size={32} className="text-white" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[101] animate-fade-in">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-primary" />
              <span className="font-bold text-white text-sm">AV COMMANDER</span>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleLiveMode} className={`p-1.5 rounded-lg transition-colors ${isLiveMode ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:bg-slate-800'}`}>
                {isLiveMode ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white"><X size={20}/></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#050B14] custom-scrollbar">
            {isLiveMode ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                        <Volume2 size={48} className="text-primary" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold">Voice Commander Active</h4>
                        <p className="text-xs text-slate-500 mt-1">Talk to me directly. I'm listening...</p>
                    </div>
                </div>
            ) : (
                sessions.find(s => s.id === currentSessionId)?.messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-primary/20 text-white border border-primary/20' : 'bg-slate-800 text-slate-200'}`}>
                            {m.text}
                        </div>
                    </div>
                ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {!isLiveMode && (
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                <input 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type instruction..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                />
                <button onClick={handleSendMessage} disabled={isLoading} className="p-2 bg-primary rounded-xl text-white">
                    <Send size={18} />
                </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AIChatAssistant;
