import React from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  setTheme: (theme: string) => void;
  voiceLang: string;
  setVoiceLang: (lang: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, theme, setTheme, voiceLang, setVoiceLang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#2A2B32] w-full max-w-md rounded-xl shadow-2xl flex flex-col overflow-hidden border border-white/10">
        <div className="flex justify-between items-center p-4 border-b border-border/50 bg-[#1E1E24]">
          <div className="flex items-center gap-2 text-gray-200 font-semibold">
            <SettingsIcon size={18} className="text-accent" />
            <h2>Settings</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-md transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6 bg-[#2A2B32]">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Theme</h3>
            <select 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-[#1E1E24] border border-white/10 rounded-md px-3 py-2 text-sm text-gray-200 outline-none hover:border-white/20 transition-colors"
            >
              <option value="dark">Dark Mode</option>
              <option value="light">Light Mode</option>
            </select>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Language</h3>
            <select 
              value={voiceLang}
              onChange={(e) => setVoiceLang(e.target.value)}
              className="w-full bg-[#1E1E24] border border-white/10 rounded-md px-3 py-2 text-sm text-gray-200 outline-none hover:border-white/20 transition-colors"
            >
              <option value="en-US">English (US)</option>
              <option value="hi-IN">Hindi (IN)</option>
              <option value="gu-IN">Gujarati (IN)</option>
            </select>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Advanced Options</h3>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-400">Enable Hardware Acceleration</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-accent focus:ring-accent" />
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-400">Save Chat History Locally</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-accent focus:ring-accent" />
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-border/50 bg-[#1E1E24] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-opacity-90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
