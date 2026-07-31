import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#141414] text-[#F5F5F5] rounded-sm shadow-2xl max-w-2xl w-full p-6 border border-white/10 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-[#F5F5F5] border-l-2 border-[#E0FF00] pl-3">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};
