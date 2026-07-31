import React from 'react';
import { currentMediaAdapter } from '../../firebase/mediaStorageAdapter';
import { AlertTriangle, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface MediaInputProps {
  label: string;
  imageUrl?: string;
  imageAssetKey?: string;
  onChangeUrl: (url: string) => void;
  onChangeAssetKey?: (key: string) => void;
}

export const MediaInput: React.FC<MediaInputProps> = ({
  label,
  imageUrl = '',
  imageAssetKey = '',
  onChangeUrl,
  onChangeAssetKey,
}) => {
  const isStorageEnabled = currentMediaAdapter.isStorageEnabled();
  const resolvedPreview = currentMediaAdapter.resolveUrl(imageUrl, imageAssetKey);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#333333]">
          {label}
        </label>
        <span className="text-[11px] font-medium text-amber-800 bg-[#F8D558]/30 px-2 py-0.5 rounded-md flex items-center gap-1 border border-[#F8D558]">
          <AlertTriangle className="w-3 h-3" /> Modo Spark (URL Externa)
        </span>
      </div>

      {!isStorageEnabled && (
        <p className="text-xs text-slate-500 leading-relaxed bg-[#F8FEDA] p-2.5 rounded-lg border border-[#CDE26D]">
          {currentMediaAdapter.getNoticeMessage()}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 space-y-2">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              URL HTTPS Pública da Imagem
            </label>
            <input
              type="text"
              placeholder="https://exemplo.com/imagem.jpg"
              value={imageUrl}
              onChange={(e) => onChangeUrl(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F47551] text-[#333333]"
            />
          </div>

          {onChangeAssetKey && (
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                imageAssetKey (Recurso nativo do App Android)
              </label>
              <input
                type="text"
                placeholder="ex: recipe_frango_grelhado"
                value={imageAssetKey}
                onChange={(e) => onChangeAssetKey(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#CCB1F6] text-[#333333]"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-center p-2 border border-dashed border-slate-300 rounded-lg bg-slate-50 min-h-[100px]">
          {resolvedPreview ? (
            <div className="relative group w-full h-24 overflow-hidden rounded-md border border-slate-200">
              <img
                src={resolvedPreview}
                alt="Pré-visualização"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/F8D558/333333?text=Erro+Imagem';
                }}
              />
              <a
                href={resolvedPreview}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs gap-1 transition-opacity"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Abrir
              </a>
            </div>
          ) : (
            <div className="text-center text-slate-400 text-xs">
              <ImageIcon className="w-6 h-6 mx-auto mb-1" />
              Sem pré-visualização
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
