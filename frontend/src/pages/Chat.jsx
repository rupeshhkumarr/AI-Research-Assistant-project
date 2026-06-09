import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  getConversations, 
  getMessages, 
  sendChatMessage, 
  renameConversation, 
  deleteConversation,
  streamChatMessage
} from '../services/chatService';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatMessage } from '../components/chat/ChatMessage';
import { Send, Loader2, Menu } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useVoiceRecovery } from '../hooks/useVoiceRecovery';
import { VoiceRecorder } from '../components/chat/VoiceRecorder';
import { VoiceControls } from '../components/chat/VoiceControls';
import { VoiceIndicator } from '../components/chat/VoiceIndicator';
import { detectLanguage } from '../utils/languageDetector';

export default function Chat() {
  const { addToast } = useAppContext();
  
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const isTypingRef = useRef(false); // Synchronous lock for API requests
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef(null);

  // --- VOICE FEATURES ---
  const { isSpeaking, speak, stopSpeaking } = useSpeechSynthesis();
  const [chatLanguage, setChatLanguage] = useState('en-IN');
  const { isRecovering, handleRecovery, resetRecovery } = useVoiceRecovery(speak);
  
  // Ref for startListening to use inside useCallback without dependency cycle
  const startListeningRef = useRef(null);
  
  // Ref to hold the freshest handleSend function to avoid stale closures in voice callback
  const handleSendRef = useRef();
  
  // Ref to prevent aborting stream when a new conversation is auto-created
  const isAutoSwitchingRef = useRef(false);

  const { isListening, startListening, stopListening, isSupported } = useSpeechRecognition(
    useCallback((text) => {
      if (text) {
        const lang = detectLanguage(text);
        setChatLanguage(lang);
        setInput(text);
        if (handleSendRef.current) {
          handleSendRef.current(null, text, true);
        }
        resetRecovery(); // Reset recovery loops on success
      }
    }, [resetRecovery]), 
    useCallback((errCode) => {
      handleRecovery(errCode, chatLanguage, startListeningRef.current);
    }, [chatLanguage, handleRecovery])
  );

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + M: Toggle Microphone
      if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        if (isListening) stopListening();
        else startListening();
      }
      
      // Esc: Stop Listening
      if (e.key === 'Escape' && isListening) {
        e.preventDefault();
        stopListening();
        resetRecovery();
      }

      // Ctrl + Shift + S: Stop Speaking
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (isSpeaking) stopSpeaking();
        resetRecovery();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, isSpeaking, startListening, stopListening, stopSpeaking, resetRecovery]);
  // --- END VOICE FEATURES ---

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      addToast('Failed to load conversations', 'error');
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Kill any background stream if activeId changes (user clicked sidebar) or component unmounts
    return () => {
      if (isAutoSwitchingRef.current) {
        // It changed because a new chat was created by the stream. Don't abort.
        isAutoSwitchingRef.current = false;
      } else {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          isTypingRef.current = false;
          setIsTyping(false);
        }
      }
    };
  }, [activeId]);

  useEffect(() => {
    if (activeId) {
      const fetchHistory = async () => {
        try {
          const data = await getMessages(activeId);
          setMessages(data);
        } catch (err) {
          addToast('Failed to load messages', 'error');
        }
      };
      fetchHistory();
    } else {
      setMessages([]);
    }
  }, [activeId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isSpeaking, isListening]);

  const handleNewChat = () => {
    setActiveId(null);
    setMessages([]);
  };

  const handleSend = async (e, forceText = null, isVoice = false) => {
    e?.preventDefault();
    const userMsg = forceText || input.trim();
    
    // Strict synchronous check to prevent double clicks and duplicate voice fires
    if (!userMsg) return;

    // Auto-abort previous generation if user submits a new question
    if (isTypingRef.current) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isTypingRef.current = false;
      setIsTyping(false);
    }

    if (!forceText) setInput('');
    else setInput(''); // clear if auto-send via voice
    
    // Optimistic UI for user message
    setMessages(prev => [...prev, { role: 'user', content: userMsg, isVoice }]);
    
    // Lock immediately
    isTypingRef.current = true;
    setIsTyping(true);

    stopSpeaking(); // Stop any previous speech
    resetRecovery(); // Stop any active recovery loop
    if (isListening) stopListening(); // Stop mic before sending new request

    abortControllerRef.current = new AbortController();

    const payload = {
      question: userMsg,
      session_id: activeId || 'default',
    };

    let currentConversationId = activeId;
    let fullResponseText = '';
    let responseSources = [];

    await streamChatMessage(
      payload,
      (data) => {
        if (data.conversation_id && !currentConversationId) {
          currentConversationId = data.conversation_id;
          isAutoSwitchingRef.current = true; // Prevent the cleanup effect from killing our stream
          setActiveId(currentConversationId);
          fetchConversations();
        } else if (data.token) {
          fullResponseText += data.token;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              lastMsg.content += data.token;
            } else {
              newMessages.push({ role: 'assistant', content: data.token, sources: [], isStreaming: true });
            }
            return newMessages;
          });
        } else if (data.sources) {
          responseSources = data.sources;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              lastMsg.sources = data.sources;
            }
            return newMessages;
          });
        }
      },
      (err) => {
        addToast(err.message || 'Failed to stream response', 'error');
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
             if (!lastMsg.content) {
                lastMsg.content = 'Sorry, I encountered an error. Please try again.';
             }
             lastMsg.isStreaming = false;
          } else {
             newMessages.push({ role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', isStreaming: false });
          }
          return newMessages;
        });
        isTypingRef.current = false;
        setIsTyping(false);
      },
      (aborted) => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            lastMsg.isStreaming = false;
          }
          return newMessages;
        });
        isTypingRef.current = false;
        setIsTyping(false);
        abortControllerRef.current = null;
        
        if (!aborted && fullResponseText) {
          // Streaming finished successfully! 
          const lang = detectLanguage(userMsg);
          
          if (responseSources.length === 0) {
            // Conversational response or fallback: read the actual short text aloud!
            speak(fullResponseText, lang);
          } else {
            // RAG response: read the intro instead of the whole long essay
            let spokenIntro = '';
            
            if (lang === 'hi-IN') {
              spokenIntro = `दिए गए दस्तावेज़ों के आधार पर, ${userMsg} के बारे में जानकारी स्क्रीन पर दी गई है।`;
            } else if (lang === 'en-IN') {
              spokenIntro = `Provided documents ke hisaab se, ${userMsg} ke baare mein information screen par hai.`;
            } else {
              spokenIntro = `Based on the provided documents, here is the information about ${userMsg}.`;
            }

            speak(spokenIntro, lang);
          }
        }
      },
      abortControllerRef.current
    );
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    stopSpeaking();
    resetRecovery();
    if (isListening) stopListening();
  };

  // Keep handleSendRef perfectly up to date for the voice callback
  useEffect(() => {
    handleSendRef.current = handleSend;
  });

  const handleRename = async (id, newTitle) => {
    try {
      await renameConversation(id, newTitle);
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    } catch (err) {
      addToast('Failed to rename conversation', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeId === id) {
        handleNewChat();
      }
      addToast('Conversation deleted', 'success');
    } catch (err) {
      addToast('Failed to delete conversation', 'error');
    }
  };

  return (
    <div className="absolute inset-0 flex bg-bg-main transition-colors duration-300">
      {/* Mobile Sidebar Toggle */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-20 p-2 bg-bg-card text-text-main rounded-md md:hidden border border-border shadow-md"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="absolute inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} absolute md:relative z-40 w-64 h-full transition-transform duration-300 md:translate-x-0 flex-shrink-0`}>
        <div className="h-full w-64">
          <ChatSidebar
            conversations={conversations}
            activeId={activeId}
            onSelect={(id) => {
               setActiveId(id);
               if(window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            onNewChat={handleNewChat}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-bg-main relative transition-colors duration-300">
        <VoiceControls isSpeaking={isSpeaking} onStopSpeaking={() => { stopSpeaking(); resetRecovery(); }} />

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pb-4 relative pt-16 md:pt-0">
          
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4 mt-8 md:mt-20">
              <div className="w-16 h-16 bg-bg-hover border border-border rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold text-text-main mb-3 text-center">How can I help you research today?</h3>
              <p className="text-text-muted text-center max-w-md leading-relaxed mb-6">Select a conversation, ask a new question, or try the new voice assistant.</p>
              
              <div className="bg-bg-card/50 border border-border p-4 rounded-xl text-sm text-text-muted flex items-center gap-3 max-w-xs shadow-inner">
                <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center shrink-0">
                  <span className="text-lg">🎤</span>
                </div>
                <p>Press <kbd className="bg-bg-hover px-1.5 py-0.5 rounded text-text-main border border-border text-xs font-mono">Ctrl+M</kbd> to start voice recording.</p>
              </div>
            </div>
          ) : (
            <div className="w-full">
              {messages.map((msg, idx) => (
                <ChatMessage key={msg.id || idx} message={msg} />
              ))}
            </div>
          )}

          {isTyping && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="py-6 px-4 md:px-8 bg-bg-hover/40 border-y border-border">
               <div className="max-w-4xl mx-auto flex gap-4 md:gap-6">
                 <div className="flex-shrink-0 mt-1">
                   <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                     <Loader2 size={16} className="text-white animate-spin" />
                   </div>
                 </div>
                 <div className="flex items-center gap-1.5 h-8">
                   <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
               </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 md:p-6 bg-gradient-to-t from-bg-main via-bg-main to-transparent shrink-0">
          <div className="max-w-4xl mx-auto relative">
            
            {/* Status Badges & Controls */}
            <div className="absolute bottom-full left-0 right-0 flex flex-col items-center justify-end gap-3 mb-4 z-10 pointer-events-none">
              {/* Stop Generating Button */}
              {isTyping && (
                <button 
                  onClick={handleStop}
                  className="bg-bg-card text-text-main hover:bg-bg-hover border border-border rounded-full px-4 py-1.5 flex items-center gap-2 text-sm shadow-xl transition-all pointer-events-auto"
                >
                  <div className="w-2 h-2 bg-text-muted rounded-sm"></div> Stop Generating
                </button>
              )}

              {/* Status Badges */}
              {isListening && (
                <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 pointer-events-auto">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  🎤 Listening...
                </span>
              )}
              {isRecovering && !isListening && (
                <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 pointer-events-auto">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  🎤 Waiting for you to speak again...
                </span>
              )}
              {isTyping && !isSpeaking && (
                <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 pointer-events-auto">
                  <Loader2 size={12} className="animate-spin" />
                  🤖 Generating Answer...
                </span>
              )}
            </div>

            <form 
              onSubmit={handleSend}
              className={`relative flex items-center w-full bg-bg-card/80 border rounded-xl shadow-lg transition-all ${isListening ? 'border-red-400 shadow-red-500/10' : 'border-border focus-within:border-primary-500'}`}
            >
              <div className="pl-2 flex items-center">
                <VoiceRecorder 
                  isListening={isListening} 
                  onStart={startListening} 
                  onStop={() => { stopListening(); stopSpeaking(); resetRecovery(); }} 
                  disabled={isTyping || !isSupported}
                />
              </div>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => {
                  if (isListening) stopListening();
                }}
                onKeyDown={() => {
                  if (isListening) stopListening();
                }}
                placeholder={isListening ? "Listening..." : "Message AI Research Assistant..."}
                className="w-full bg-transparent text-text-main px-3 py-3.5 outline-none placeholder:text-text-muted rounded-xl"
              />

              <div className="absolute right-2 flex items-center gap-1">
                {isSpeaking && <VoiceIndicator isSpeaking={isSpeaking} />}
                
                <button
                  type="submit"
                  disabled={(!input.trim() && !isListening)}
                  className="p-2 rounded-lg bg-primary-600/10 text-primary-500 hover:bg-primary-600/20 disabled:bg-transparent disabled:text-text-muted/60 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
            
            <p className="text-center text-xs text-text-muted mt-2">
              AI Research Assistant can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
