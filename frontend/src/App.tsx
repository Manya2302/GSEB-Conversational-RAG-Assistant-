import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Loader2, Mic, MicOff, Download, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import UploadModal from './components/UploadModal';
import SettingsModal from './components/SettingsModal';

import { chatWithAssistant } from './services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: any[];
  metrics?: {
    retrieval_time_sec: number;
    generation_time_sec: number;
  };
  suggested_questions?: string[];
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-US');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeCitation, setActiveCitation] = useState<any | null>(null);
  const initialMessage: Message = {
    role: 'assistant',
    content: 'Hello! I am your AI Textbook Assistant. You can ask me questions about any of the uploaded textbooks, and I will provide answers with exact citations and page numbers.',
    suggested_questions: ["What is Cell Division?", "Explain the process of photosynthesis"]
  };
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const handleSendMessage = async (e?: React.FormEvent, directInput?: string) => {
    if (e) e.preventDefault();
    
    const inputToUse = directInput || inputValue;
    if (!inputToUse.trim() || isLoading) return;

    // Add user message
    const userMsg: Message = { role: 'user', content: inputToUse };
    setMessages(prev => [...prev, userMsg]);
    if (!directInput) setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatWithAssistant(inputToUse, sessionId);
      setSessionId(response.session_id);
      
      const botMsg: Message = {
        role: 'assistant',
        content: response.answer,
        citations: response.citations,
        metrics: response.metrics,
        suggested_questions: response.suggested_questions
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to get answer'}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = voiceLang; // Support for Gujarati, Hindi, English
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      // Auto-send after a brief delay
      setTimeout(() => handleSendMessage(undefined, transcript), 500);
    };
    
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const exportChat = () => {
    let mdContent = '# RAG Textbook Chat Export\n\n';
    messages.forEach(msg => {
      mdContent += `### ${msg.role === 'user' ? '🧑 User' : '🤖 AI Assistant'}\n`;
      mdContent += `${msg.content}\n\n`;
      if (msg.citations && msg.citations.length > 0) {
        mdContent += `**Sources:**\n`;
        msg.citations.forEach(c => {
          mdContent += `- *${c.book_name}* (Page ${c.page_number})\n`;
        });
        mdContent += '\n';
      }
      mdContent += '---\n\n';
    });

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-background text-gray-100 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <div className={`${isSidebarOpen ? 'w-[260px]' : 'w-0'} transition-all duration-300 ease-in-out shrink-0 overflow-hidden`}>
        <Sidebar 
          onNewChat={() => setMessages([initialMessage])} 
          onUploadClick={() => setIsUploadOpen(true)}
          onClearConversations={() => setMessages([initialMessage])}
          onSettingsClick={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-md md:hidden transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-semibold text-lg tracking-tight">AI Textbook Assistant</h1>
          </div>
          <button 
            onClick={exportChat}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors border border-white/10"
            title="Export Chat as Markdown"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export Chat</span>
          </button>
        </header>

        {/* PDF / Citation Modal */}
        {activeCitation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8">
            <div className="bg-[#2A2B32] w-full max-w-5xl h-full max-h-[85vh] rounded-lg shadow-2xl flex flex-col overflow-hidden border border-white/10">
              <div className="flex justify-between items-center p-4 border-b border-border/50 bg-[#1E1E24]">
                <h2 className="text-sm font-semibold text-gray-200">
                  {activeCitation.book_name} - Page {activeCitation.page_number}
                </h2>
                <button onClick={() => setActiveCitation(null)} className="p-1 hover:bg-white/10 rounded-md transition-colors text-gray-400">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Source Snippet Panel */}
                <div className="w-full md:w-1/3 p-6 bg-[#2A2B32] overflow-y-auto border-r border-border/50">
                  <h3 className="text-xs font-bold uppercase text-accent mb-4">Extracted Context</h3>
                  <p className="text-sm text-gray-200 leading-relaxed bg-[#1E1E24] p-4 rounded-md shadow-inner italic border-l-4 border-accent">
                    "{activeCitation.snippet}"
                  </p>
                  <p className="text-xs text-gray-500 mt-6">
                    This snippet was dynamically retrieved and provided to the AI to answer your question.
                  </p>
                </div>
                {/* PDF Viewer Panel */}
                <div className="w-full md:w-2/3 h-full bg-[#1E1E24]">
                  {activeCitation.filename ? (
                    <iframe 
                      src={`http://localhost:8000/pdfs/${activeCitation.filename}#page=${activeCitation.page_number}`} 
                      className="w-full h-full border-none"
                      title="PDF Viewer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                      <p>PDF preview not available for this source.</p>
                      <p className="text-xs mt-2">Ensure the file was uploaded recently with the new PDF tracking feature.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scroll-smooth pb-32">
          {messages.map((msg, idx) => (
            <ChatMessage 
              key={idx} 
              role={msg.role} 
              content={msg.content} 
              citations={msg.citations} 
              metrics={msg.metrics}
              suggested_questions={msg.suggested_questions}
              onQuestionClick={(q) => handleSendMessage(undefined, q)}
              onCitationClick={(cite) => setActiveCitation(cite)}
            />
          ))}
          <div ref={bottomRef} className="h-32" /> {/* Spacer */}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background via-background to-transparent pt-6 pb-6 px-4 md:px-0">
          <div className="max-w-3xl mx-auto relative">
            <form onSubmit={handleSendMessage} className="relative flex items-end shadow-[0_0_15px_rgba(0,0,0,0.1)] rounded-xl bg-[#40414F] border border-white/10">
              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Ask about your textbooks..."
                className="w-full max-h-[200px] bg-transparent resize-none overflow-y-auto outline-none py-4 pl-4 pr-12 text-sm text-gray-100 placeholder-gray-400 disabled:opacity-50"
                rows={1}
                style={{ minHeight: '56px' }}
              />
              <select 
                value={voiceLang}
                onChange={(e) => setVoiceLang(e.target.value)}
                className="absolute bottom-4 right-20 bg-[#2A2B32] border border-white/10 text-xs text-gray-300 rounded px-2 py-1 outline-none hover:border-white/20 transition-colors"
                title="Select Voice Language"
              >
                <option value="en-US">EN</option>
                <option value="hi-IN">HI</option>
                <option value="gu-IN">GU</option>
              </select>
              
              <button 
                type="button"
                onClick={handleVoiceInput}
                className={`absolute bottom-3 right-12 p-1.5 rounded-md transition-colors ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                title="Voice Input"
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <button 
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="absolute bottom-3 right-3 p-1.5 rounded-md bg-accent text-white disabled:bg-gray-600 disabled:text-gray-400 transition-colors"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
            <div className="text-center mt-3 text-xs text-gray-500">
              AI answers are generated from uploaded textbooks. Always verify important information.
            </div>
          </div>
        </div>
      </div>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        voiceLang={voiceLang}
        setVoiceLang={setVoiceLang}
      />
    </div>
  );
}

export default App;
