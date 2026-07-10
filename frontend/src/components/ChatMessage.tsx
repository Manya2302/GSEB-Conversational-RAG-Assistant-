import React from 'react';
import clsx from 'clsx';
import { User, BookOpen, Zap, MessageCircle } from 'lucide-react';

interface Citation {
  book_name: string;
  page_number: number;
  snippet: string;
  filename?: string;
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  metrics?: {
    retrieval_time_sec: number;
    generation_time_sec: number;
  };
  suggested_questions?: string[];
  onQuestionClick?: (q: string) => void;
  onCitationClick?: (citation: Citation) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  role, content, citations, metrics, suggested_questions, onQuestionClick, onCitationClick 
}) => {
  const isUser = role === 'user';
  
  return (
    <div className={clsx("w-full py-6 text-gray-100", isUser ? "bg-userMsg" : "bg-botMsg")}>
      <div className="max-w-3xl mx-auto flex gap-6 px-4">
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className={clsx("w-[30px] h-[30px] rounded-sm flex items-center justify-center text-white", isUser ? "bg-[#5436DA]" : "bg-[#10A37F]")}>
            {isUser ? <User size={20} /> : <span className="font-semibold text-xs">AI</span>}
          </div>
        </div>
        <div className="flex-1 space-y-4 pt-1">
          <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap font-sans text-gray-200">
            {content}
          </div>
          
          {citations && citations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={14} /> Sources
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {citations.map((cite, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => onCitationClick?.(cite)}
                    className="bg-[#2A2B32] p-3 rounded-md border border-white/5 hover:border-white/10 transition-colors cursor-pointer group"
                  >
                    <div className="text-xs font-medium text-gray-300 mb-1 line-clamp-1">{cite.book_name}</div>
                    <div className="text-[10px] text-accent mb-2">Page {cite.page_number}</div>
                    <div className="text-xs text-gray-500 italic line-clamp-3 group-hover:text-gray-400 transition-colors">
                      "{cite.snippet}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggested_questions && suggested_questions.length > 0 && (
            <div className="mt-4 pt-2">
              <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                <MessageCircle size={14} /> Suggested Follow-ups
              </h4>
              <div className="flex flex-wrap gap-2">
                {suggested_questions.map((q, idx) => (
                  <button 
                    key={idx}
                    onClick={() => onQuestionClick?.(q)}
                    className="text-xs bg-[#2A2B32] border border-white/10 hover:border-accent hover:text-accent text-gray-300 px-3 py-1.5 rounded-full transition-colors text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {metrics && (
            <div className="mt-2 pt-2 flex items-center gap-2 text-[10px] text-gray-500 font-mono">
              <Zap size={10} className="text-yellow-500" />
              <span>Retrieved in {metrics.retrieval_time_sec}s</span>
              <span className="text-gray-600">|</span>
              <span>Generated in {metrics.generation_time_sec}s</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
