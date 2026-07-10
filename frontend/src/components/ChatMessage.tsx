import React from 'react';
import clsx from 'clsx';
import { User, BookOpen } from 'lucide-react';

interface Citation {
  book_name: string;
  page_number: number;
  snippet: string;
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, citations }) => {
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
                  <div key={idx} className="bg-[#2A2B32] p-3 rounded-md border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
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
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
