import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`p-3.5 rounded-sm shadow-2xl border text-xs font-bold uppercase tracking-wider flex items-start gap-3 ${
            t.type === 'success'
              ? 'bg-[#121212] border-[#E0FF00] text-[#E0FF00]'
              : t.type === 'error'
              ? 'bg-[#121212] border-rose-500 text-rose-400'
              : 'bg-[#121212] border-neutral-700 text-[#F5F5F5]'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#E0FF00] shrink-0" />}
          {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {t.type === 'info' && <Info className="w-4 h-4 text-[#E0FF00] shrink-0" />}
          
          <span className="flex-1 leading-snug">{t.text}</span>

          <button onClick={() => onDismiss(t.id)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
