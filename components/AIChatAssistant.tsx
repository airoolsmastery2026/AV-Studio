
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, MessageSquare, Trash2, Cpu, ArrowRight, GripHorizontal, ChevronDown, History, Plus, Edit2 } from 'lucide-react';
import { AppContext, ChatMessage, ChatSession, AgentCommand } from '../types';
import { sendChatToAssistant } from '../services/geminiService';

interface AIChatAssistantProps {
  apiKey: string | undefined;
  appContext: AppContext;
  onCommand: (command: AgentCommand) => void;
}

const STORAGE_KEY = 'av_studio_chat_sessions_v2';

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ apiKey, appContext, onCommand }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Session Management
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  
  // Derived state for current view
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dragging State
  const [position, setPosition] = useState({ x: window.innerWidth - 480, y: window.innerHeight - 650 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // --- HELPER: LOAD FROM STORAGE ---
  const loadSessionsFromStorage = () => {
    const savedSessionsRaw = localStorage.getItem(STORAGE_KEY);
    let loadedSessions: ChatSession[] = [];
    
    if (savedSessionsRaw) {
      try {
        loadedSessions = JSON.parse(savedSessionsRaw);
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }

    if (loadedSessions.length === 0) {
       // Create first default session
       const initSession: ChatSession = {
           id: crypto.randomUUID(),
           name: 'New Chat',
           messages: [{
            id: 'init',
            role: 'model',
            text: 'Chào chỉ huy! Tôi là AV Commander. Tôi có thể điều khiển ứng dụng, phân tích dữ liệu và ghi nhớ chỉ thị của bạn. Hãy ra lệnh!',
            timestamp: Date.now()
           }],
           createdAt: Date.now()
       };
       loadedSessions = [initSession];
    }
    return loadedSessions;
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    const loaded = loadSessionsFromStorage();
    setSessions(loaded);
    setCurrentSessionId(loaded[0].id);

    // EVENT LISTENER FOR EXTERNAL UPDATES (e.g., from AnalyticsDashboard)
    const handleStorageUpdate = () => {
        const updated = loadSessionsFromStorage();
        setSessions(updated);
        // Ensure current session ID is still valid, else fallback
        if (!updated.find(s => s.id === currentSessionId)) {
            setCurrentSessionId(updated[0].id);
        }
    };

    window.addEventListener('chat-storage-updated', handleStorageUpdate);
    return () => {
        window.removeEventListener('chat-storage-updated', handleStorageUpdate);
    };
  }, []); // Run once on mount

  // --- PERSISTENCE ---
  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  // Auto scroll
  useEffect(() => {
    if (!showHistory) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, showHistory]);


  // --- SESSION LOGIC ---
  const createNewSession = () => {
      const newSession: ChatSession = {
          id: crypto.randomUUID(),
          name: `Chat ${new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}`,
          messages: [{
            id: Date.now().toString(),
            role: 'model',
            text: 'Phiên làm việc mới đã được tạo. Tôi có thể giúp gì?',
            timestamp: Date.now()
           }],
          createdAt: Date.now()
      };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setShowHistory(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const newSessions = sessions.filter(s => s.id !== id);
      if (newSessions.length === 0) {
          // If deleted last one, create a fresh one
          createNewSession();
      } else {
          setSessions(newSessions);
          if (currentSessionId === id) {
              setCurrentSessionId(newSessions[0].id);
          }
      }
  };

  const updateCurrentSessionMessages = (newMessages: ChatMessage[]) => {
      setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
              // Auto-rename if it's the first user message and name is default
              let name = s.name;
              if (s.messages.length <= 1 && newMessages.length > 1) {
                  const firstUserMsg = newMessages.find(m => m.role === 'user');
                  if (firstUserMsg) {
                      name = firstUserMsg.text.substring(0, 25) + (firstUserMsg.text.length > 25 ? '...' : '');
                  }
              }
              return { ...s, messages: newMessages, name };
          }
          return s;
      }));
  };

  // --- DRAG LOGIC ---
  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent drag if clicking buttons
    if ((e.target as HTMLElement).closest('button')) return;

    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      let newX = e.clientX - dragOffset.current.x;
      let newY = e.clientY - dragOffset.current.y;
      setPosition({ x: newX, y: newY });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);


  // --- MESSAGING LOGIC ---
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    if (!apiKey) {
        const errorMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'model',
            text: '⚠️ Vui lòng cấu hình API Key trong phần "Cài đặt Vault" để chat với tôi.',
            timestamp: Date.now()
        };
        updateCurrentSessionMessages([...messages, errorMsg]);
        return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMsg];
    updateCurrentSessionMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
        const apiHistory = updatedMessages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const { text, command } = await sendChatToAssistant(apiKey, apiHistory, userMsg.text, appContext);

        const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: text,
            timestamp: Date.now(),
            command: command
        };

        updateCurrentSessionMessages([...updatedMessages, botMsg]);

        if (command) {
          onCommand(command);
        }

    } catch (error) {
        const errorMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: '🚫 Đã xảy ra lỗi kết nối. Vui lòng thử lại.',
            timestamp: Date.now()
        };
        updateCurrentSessionMessages([...updatedMessages, errorMsg]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      {/* CHAT WINDOW (Floating Portal) */}
      {isOpen && (
        <div 
            style={{ 
                left: position.x, 
                top: position.y,
                position: 'fixed' 
            }}
            className="z-[9999] w-[350px] md:w-[450px] h-[600px] bg-slate-900/95 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in transition-shadow duration-300"
        >
            {/* Header (Draggable Handle) */}
            <div 
                onMouseDown={handleMouseDown}
                className={`h-14 bg-gradient-to-r from-slate-950 to-slate-900 border-b border-slate-700 flex items-center justify-between px-3 shrink-0 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} active:bg-slate-900`}
            >
                <div className="flex items-center gap-3">
                     {/* History Toggle */}
                     <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-primary text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        title="Lịch sử chat"
                     >
                        <History size={18} />
                     </button>

                    <div className="pointer-events-none">
                        <h3 className="text-sm font-bold text-white leading-none flex items-center gap-2">
                           AV COMMANDER
                        </h3>
                        <p className="text-[10px] text-green-400 mt-0.5 flex items-center gap-1 truncate max-w-[150px]">
                           {currentSession?.name || 'New Chat'}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-1">
                     <button 
                        onClick={createNewSession}
                        className="p-1.5 text-slate-500 hover:text-primary transition-colors" 
                        title="Đoạn chat mới"
                     >
                        <Plus size={18} />
                    </button>
                    {/* HIDE / MINIMIZE BUTTON (Down Arrow) */}
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                        title="Ẩn xuống"
                    >
                        <ChevronDown size={20} />
                    </button>
                </div>
            </div>

            {/* CONTENT AREA: EITHER HISTORY OR MESSAGES */}
            <div className="flex-1 overflow-hidden relative bg-[#050B14]">
                
                {/* HISTORY SIDEBAR OVERLAY */}
                {showHistory && (
                    <div className="absolute inset-0 z-20 bg-slate-900/95 backdrop-blur-md flex flex-col animate-fade-in">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                            <span className="font-bold text-white flex items-center gap-2">
                                <History size={16} /> Các đoạn chat đã lưu
                            </span>
                            <button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-white"><X size={16}/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {sessions.map(s => (
                                <div 
                                    key={s.id}
                                    onClick={() => { setCurrentSessionId(s.id); setShowHistory(false); }}
                                    className={`p-3 rounded-xl border cursor-pointer group transition-all ${
                                        s.id === currentSessionId 
                                        ? 'bg-primary/10 border-primary/50' 
                                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <MessageSquare size={14} className={s.id === currentSessionId ? 'text-primary' : 'text-slate-500'} />
                                            <span className={`text-sm font-medium truncate ${s.id === currentSessionId ? 'text-white' : 'text-slate-300'}`}>
                                                {s.name}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={(e) => deleteSession(s.id, e)}
                                            className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-1 pl-6">
                                        {new Date(s.createdAt).toLocaleDateString('vi-VN')} • {s.messages.length} tin nhắn
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 border-t border-slate-800">
                             <button 
                                onClick={createNewSession}
                                className="w-full py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary hover:text-white transition-all text-sm font-bold flex items-center justify-center gap-2"
                             >
                                <Plus size={16} /> Tạo đoạn chat mới
                             </button>
                        </div>
                    </div>
                )}

                {/* MESSAGES LIST */}
                <div className="h-full overflow-y-auto p-4 space-y-5">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && (
                                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-primary mr-2 mt-1 shrink-0">
                                        <Bot size={12} />
                                    </div>
                                )}
                                <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-md ${
                                    msg.role === 'user' 
                                        ? 'bg-primary/20 text-white border border-primary/20 rounded-tr-none' 
                                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                                }`}>
                                    {msg.text.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line}
                                            {i < msg.text.split('\n').length - 1 && <br />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            {/* COMMAND VISUALIZATION */}
                            {msg.command && (
                            <div className="mt-2 ml-8 max-w-[85%]">
                                <div className="bg-slate-900/80 border border-green-500/30 rounded-lg p-2 text-xs flex items-center gap-2 text-green-400">
                                    <div className="p-1 bg-green-500/20 rounded">
                                        <Cpu size={12} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-bold opacity-70">EXECUTING:</span> {msg.command.action}
                                        {msg.command.payload && <span className="block text-slate-400 font-mono truncate max-w-[200px]">{JSON.stringify(msg.command.payload)}</span>}
                                    </div>
                                    <ArrowRight size={12} />
                                </div>
                            </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start items-center gap-2 ml-2">
                            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-primary">
                                <Bot size={12} />
                            </div>
                            <div className="text-xs text-primary animate-pulse font-mono">
                                Processing Request...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
                <div className="relative flex items-center">
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={showHistory ? "Đang xem lịch sử..." : "Type /train [text] to learn..."}
                        disabled={showHistory}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-inner disabled:opacity-50"
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputText.trim() || showHistory}
                        className="absolute right-2 p-1.5 bg-primary rounded-lg text-white hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* 3D ROBOT ICON TRIGGER (FIXED POSITION) */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
        <button
            onClick={() => {
                setIsOpen(!isOpen);
                // When reopening, ensure we stay at the last known position
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`pointer-events-auto relative group transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        >
            {/* Glow Effects */}
            <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-40 animate-pulse group-hover:opacity-60 transition-opacity"></div>
            
            {/* Robot Body (CSS 3D) */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 via-slate-900 to-black border border-slate-600 shadow-[inset_0_2px_10px_rgba(255,255,255,0.1),0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center transform group-hover:-translate-y-1 transition-transform duration-300">
                {/* Robot Eye/Face */}
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/20"></div>
                    {/* Blinking Eyes */}
                    <div className="flex gap-1.5 z-10">
                        <div className="w-1.5 h-3 bg-cyan-400 rounded-full shadow-[0_0_5px_cyan] animate-[blink_4s_infinite]"></div>
                        <div className="w-1.5 h-3 bg-cyan-400 rounded-full shadow-[0_0_5px_cyan] animate-[blink_4s_infinite]"></div>
                    </div>
                </div>
                
                {/* Notification Badge */}
                {appContext.lastError && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[8px] text-white font-bold items-center justify-center">!</span>
                    </span>
                )}
            </div>
            
            {/* Tooltip */}
            {isHovered && !isOpen && (
                <div className="absolute bottom-full right-0 mb-3 whitespace-nowrap px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white shadow-lg animate-fade-in">
                    AI Commander (Click để ra lệnh)
                </div>
            )}
        </button>
      </div>
    </>
  );
};

export default AIChatAssistant;
