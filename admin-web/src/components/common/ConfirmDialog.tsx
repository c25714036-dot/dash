import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#141414] text-[#F5F5F5] rounded-sm shadow-2xl max-w-md w-full p-6 border border-white/10">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-sm ${isDangerous ? 'bg-rose-950/60 text-rose-400 border border-rose-800' : 'bg-amber-950/60 text-[#E0FF00] border border-amber-800'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#F5F5F5]">{title}</h3>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-white/10 rounded-sm transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider text-black rounded-sm transition-colors flex items-center gap-1.5 ${
              isDangerous ? 'bg-rose-500 hover:bg-rose-400 text-white' : 'bg-[#E0FF00] hover:bg-white'
            }`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
