import React from 'react';
import { EditorialStatus } from '../../models/types';

interface StatusBadgeProps {
  status: EditorialStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'published':
        return 'bg-[#E0FF00]/10 text-[#E0FF00] border-[#E0FF00] font-black';
      case 'approved':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-700 font-bold';
      case 'inReview':
        return 'bg-amber-950/60 text-amber-300 border-amber-700 font-bold';
      case 'changesRequested':
        return 'bg-rose-950/60 text-rose-400 border-rose-700 font-bold';
      case 'draft':
        return 'bg-neutral-800 text-neutral-300 border-neutral-700 font-bold';
      case 'archived':
        return 'bg-neutral-900 text-neutral-500 border-neutral-800 line-through';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'published': return 'PUBLICADO';
      case 'approved': return 'APROVADO';
      case 'inReview': return 'EM REVISÃO';
      case 'changesRequested': return 'ALTERAÇÕES';
      case 'draft': return 'RASCUNHO';
      case 'archived': return 'ARQUIVADO';
      default: return String(status).toUpperCase();
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase font-mono tracking-wider border ${getStyle()}`}>
      {getLabel()}
    </span>
  );
};
