import React, { useState, useEffect } from 'react';
import { ExerciseAdminRepository } from '../repositories/ExerciseAdminRepository';
import { Exercise, EditorialStatus } from '../models/types';
import { Table } from '../components/common/Table';
import { StatusBadge } from '../components/common/StatusBadge';
import { Plus, Search, Filter, Edit, Trash2, Send, CheckCircle2, Dumbbell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AdminSessionRepository } from '../repositories/AdminSessionRepository';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ToastContainer, ToastMessage } from '../components/common/Toast';

export const ExercisesPage: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filtered, setFiltered] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { user } = useAuth();
  const canPublish = user ? AdminSessionRepository.canPublish(user.role) : false;

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const loadExercises = async () => {
    setLoading(true);
    try {
      const list = await ExerciseAdminRepository.list();
      setExercises(list);
      setFiltered(list);
    } catch (err) {
      addToast('error', 'Erro ao carregar lista de exercícios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    let result = exercises;
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(e => e.name.toLowerCase().includes(term) || e.slug.includes(term));
    }
    if (statusFilter !== 'all') {
      result = result.filter(e => e.status === statusFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, exercises]);

  const handleStatusChange = async (id: string, status: EditorialStatus) => {
    try {
      await ExerciseAdminRepository.setStatus(id, status, user?.email || undefined);
      addToast('success', `Status do exercício alterado para: ${status}`);
      loadExercises();
    } catch (err) {
      addToast('error', 'Erro ao alterar status do exercício');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await ExerciseAdminRepository.delete(deleteId);
      addToast('success', 'Exercício excluído com sucesso');
      setDeleteId(null);
      loadExercises();
    } catch (err) {
      addToast('error', 'Erro ao excluir exercício');
    }
  };

  const columns = [
    {
      header: 'Exercício',
      cell: (e: Exercise) => (
        <div className="flex items-center gap-3">
          <img 
            src={e.media?.imageUrl || 'https://placehold.co/100x100/CCB1F6/333333?text=Exercício'} 
            alt={e.name} 
            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
          />
          <div>
            <a href={`/exercises/edit/${e.id}`} className="font-bold text-[#333333] hover:text-[#F47551]">
              {e.name}
            </a>
            <span className="text-[10px] text-slate-400 block font-mono">/{e.slug}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Grupo & Nível',
      cell: (e: Exercise) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800 block">{e.primaryMuscleGroup || 'Não especificado'}</span>
          <span className="text-[10px] text-slate-500">{e.level} • Impacto: {e.impact}</span>
        </div>
      ),
    },
    {
      header: 'Prescrição Padrão',
      cell: (e: Exercise) => (
        <span className="text-[11px] text-slate-600 font-medium">
          {e.prescription?.suggestedSets || 3} séries × {e.prescription?.minReps || 10}-{e.prescription?.maxReps || 12} reps ({e.prescription?.restSeconds || 60}s desc)
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (e: Exercise) => <StatusBadge status={e.status} />,
    },
    {
      header: 'Ações',
      cell: (e: Exercise) => (
        <div className="flex items-center gap-1.5">
          <a
            href={`/exercises/edit/${e.id}`}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-[#F8FEDA] text-slate-700"
            title="Editar"
          >
            <Edit className="w-3.5 h-3.5" />
          </a>

          {e.status === 'draft' && (
            <button
              onClick={() => handleStatusChange(e.id, 'inReview')}
              className="p-1.5 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200"
              title="Enviar para Revisão"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}

          {canPublish && e.status === 'inReview' && (
            <button
              onClick={() => handleStatusChange(e.id, 'published')}
              className="p-1.5 rounded-lg bg-[#CDE26D] text-emerald-900 font-bold hover:bg-emerald-300"
              title="Publicar"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setDeleteId(e.id)}
            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
            title="Excluir"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(p => p.filter(t => t.id !== id))} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#333333]">Catálogo de Exercícios</h2>
          <p className="text-xs text-slate-500">Cadastre movimentos, grupos musculares e prescrições do aplicativo</p>
        </div>
        <a
          href="/exercises/new"
          className="px-4 py-2.5 bg-[#F47551] hover:bg-[#d65f3d] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Exercício
        </a>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F47551]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl border border-slate-300 bg-slate-50 font-semibold"
          >
            <option value="all">Todos os Status</option>
            <option value="draft">Rascunho</option>
            <option value="inReview">Em Revisão</option>
            <option value="approved">Aprovado</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="Nenhum exercício cadastrado com os filtros aplicados."
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Excluir Exercício"
        message="Tem certeza que deseja excluir este exercício?"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
