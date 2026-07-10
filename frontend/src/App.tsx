import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Loader2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import UploadModal from './components/UploadModal';

import { chatWithAssistant } from './services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: any[];
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Textbook Assistant. You can ask me questions about any of the uploaded textbooks, and I will provide answers with exact citations and page numbers.',
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const currentInput = inputValue;
    // Add user message
    const userMsg: Message = { role: 'user', content: currentInput };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatWithAssistant(currentInput, sessionId);
      setSessionId(response.session_id);
      
      const botMsg: Message = {
        role: 'assistant',
        content: response.answer,
        citations: response.citations
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

  return (
    <div className="flex h-screen bg-background text-gray-100 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <div className={`${isSidebarOpen ? 'w-[260px]' : 'w-0'} transition-all duration-300 ease-in-out shrink-0 overflow-hidden`}>
        <Sidebar 
          onNewChat={() => setMessages([])} 
          onUploadClick={() => setIsUploadOpen(true)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-14 flex items-center px-4 border-b border-white/10 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
          <h1 className="ml-2 font-medium text-sm text-gray-200">Conversational RAG</h1>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.map((msg, idx) => (
            <ChatMessage 
              key={idx} 
              role={msg.role} 
              content={msg.content} 
              citations={msg.citations} 
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
    </div>
  );
}

export default App;
