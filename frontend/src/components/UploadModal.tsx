import React, { useState } from 'react';
import { X, UploadCloud, Loader2 } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [bookName, setBookName] = useState('');
  const [subject, setSubject] = useState('');
  const [standard, setStandard] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !bookName) return;
    
    setIsUploading(true);
    // Simulate upload delay for UI demonstration
    setTimeout(() => {
      setIsUploading(false);
      onClose();
      setFile(null);
      setBookName('');
      setSubject('');
      setStandard('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#202123] w-full max-w-md rounded-xl shadow-2xl border border-white/10 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-gray-200">Upload Textbook</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleUpload} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Book Name *</label>
            <input 
              type="text" 
              required
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              className="w-full bg-[#2A2B32] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="e.g., NCERT Biology Class 10"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Subject</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#2A2B32] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                placeholder="e.g., Science"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Standard/Grade</label>
              <input 
                type="text" 
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="w-full bg-[#2A2B32] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                placeholder="e.g., 10"
              />
            </div>
          </div>

          <div className="mt-4 pt-2">
            <label className="block text-xs font-medium text-gray-400 mb-1">PDF Document *</label>
            <div className="relative border-2 border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-white/5 hover:border-accent/50 transition-colors cursor-pointer">
              <input 
                type="file" 
                accept=".pdf" 
                required
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <UploadCloud size={32} className="text-gray-500 mb-2" />
              <p className="text-sm font-medium text-gray-300">
                {file ? file.name : "Click or drag file to upload"}
              </p>
              <p className="text-xs text-gray-500 mt-1">PDF files only (max 50MB)</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isUploading || !file || !bookName}
              className="px-4 py-2 bg-accent hover:bg-[#1a7f64] disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-medium text-white transition-colors flex items-center gap-2"
            >
              {isUploading && <Loader2 size={16} className="animate-spin" />}
              {isUploading ? 'Processing...' : 'Upload & Process'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
