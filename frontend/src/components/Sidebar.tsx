import React, { useState } from 'react';
import { Plus, MessageSquare, Settings, Upload, Trash2 } from 'lucide-react';

interface SidebarProps {
  onNewChat: () => void;
  onUploadClick: () => void;
  onClearConversations: () => void;
  onSettingsClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewChat, onUploadClick, onClearConversations, onSettingsClick }) => {
  const [historyCleared, setHistoryCleared] = useState(false);

  const handleClear = () => {
    setHistoryCleared(true);
    onClearConversations();
  };

  return (
    <div className="w-[260px] flex-shrink-0 bg-sidebar flex flex-col h-full overflow-y-auto">
      <div className="p-2 h-full flex flex-col">
        <button
          onClick={onNewChat}
          className="flex items-center gap-3 px-3 py-3 rounded-md border border-white/20 hover:bg-white/5 transition-colors text-sm font-medium mb-4"
        >
          <Plus size={16} />
          New Chat
        </button>

        <div className="flex-1 overflow-y-auto">
          {!historyCleared && (
            <>
              <div className="text-xs font-semibold text-gray-500 px-3 pb-2 pt-2">Today</div>
              {/* Example Chat History Item */}
              <button className="flex w-full items-center gap-3 px-3 py-3 rounded-md hover:bg-[#2A2B32] transition-colors group cursor-pointer text-sm">
                <MessageSquare size={16} className="text-gray-400 group-hover:text-gray-300" />
                <div className="flex-1 truncate text-left text-gray-300">Physics Chapter 2 Query</div>
              </button>
              
              <div className="text-xs font-semibold text-gray-500 px-3 pb-2 pt-4">Previous 7 Days</div>
              <button className="flex w-full items-center gap-3 px-3 py-3 rounded-md hover:bg-[#2A2B32] transition-colors group cursor-pointer text-sm">
                <MessageSquare size={16} className="text-gray-400 group-hover:text-gray-300" />
                <div className="flex-1 truncate text-left text-gray-300">What is Cell Division?</div>
              </button>
            </>
          )}
        </div>

        <div className="border-t border-white/20 pt-2 mt-2">
          <button 
            onClick={onUploadClick}
            className="flex w-full items-center gap-3 px-3 py-3 rounded-md hover:bg-[#2A2B32] transition-colors text-sm text-gray-300"
          >
            <Upload size={16} />
            Upload Textbooks
          </button>
          <button 
            onClick={handleClear}
            className="flex w-full items-center gap-3 px-3 py-3 rounded-md hover:bg-[#2A2B32] transition-colors text-sm text-gray-300"
          >
            <Trash2 size={16} />
            Clear Conversations
          </button>
          <button 
            onClick={onSettingsClick}
            className="flex w-full items-center gap-3 px-3 py-3 rounded-md hover:bg-[#2A2B32] transition-colors text-sm text-gray-300"
          >
            <Settings size={16} />
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
