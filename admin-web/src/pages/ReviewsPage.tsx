import React, { useState, useEffect } from 'react';
import { ContentReviewRepository } from '../repositories/ContentReviewRepository';
import { ContentReview } from '../models/types';
import { Table } from '../components/common/Table';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { useAuth } from '../hooks/useAuth';
import { AdminSessionRepository } from '../repositories/AdminSessionRepository';
import { CheckCircle2, XCircle, FileText } from 'lucide-react';

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<ContentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const canPublish = user ? AdminSessionRepository.canPublish(user.role) : false;

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, type, text }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const list = await ContentReviewRepository.list();
      setReviews(list.filter(r => r.status === 'pending'));
    } catch (err) {
      addToast('error', 'Erro ao carregar fila de revisão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDecision = async (id: string, decision: 'approved' | 'rejected', notes: string) => {
    try {
      await ContentReviewRepository.updateReviewStatus(
        id,
        decision,
        user?.uid || 'admin_uid',
        user?.email || 'admin@vidasaudavel.app',
        notes
      );
      addToast('success', `Decisão registrada: ${decision === 'approved' ? 'Aprovado' : 'Rejeitado'}`);
      loadReviews();
    } catch (err) {
      addToast('error', 'Erro ao registrar revisão');
    }
  };

  const columns = [
    {
      header: 'Conteúdo para Revisão',
      cell: (r: ContentReview) => (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#F8D558]/30 text-amber-900 rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#333333] block">{r.contentTitle || `${r.contentType.toUpperCase()}: ${r.contentId}`}</span>
            <span className="text-[10px] text-slate-500">Solicitante: {r.submittedBy}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Notas de Revisão',
      cell: (r: ContentReview) => <span className="text-xs text-slate-600 italic">"{r.notes || 'Sem observações'}"</span>,
    },
    {
      header: 'Ações de Decisão',
      cell: (r: ContentReview) => (
        <div className="flex items-center gap-2">
          {canPublish ? (
            <>
              <button
                onClick={() => handleDecision(r.id, 'approved', 'Conteúdo revisado e aprovado para publicação')}
                className="px-3 py-1 bg-[#CDE26D] hover:bg-emerald-300 text-emerald-900 font-bold text-xs rounded-lg flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
              </button>
              <button
                onClick={() => handleDecision(r.id, 'rejected', 'Conteúdo precisa de ajustes de formatação')}
                className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs rounded-lg flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" /> Rejeitar
              </button>
            </>
          ) : (
            <span className="text-[11px] text-slate-400">Requer aprovação de Editor/Admin</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(p => p.filter(t => t.id !== id))} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#333333]">Fila de Revisão Editorial</h2>
          <p className="text-xs text-slate-500">Conteúdos submetidos por redatores aguardando validação para publicação</p>
        </div>
      </div>

      <Table columns={columns} data={reviews} loading={loading} emptyMessage="Sua fila de revisão está limpa! Nenhum item pendente." />
    </div>
  );
};
