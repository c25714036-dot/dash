import React, { useState, useEffect } from 'react';
import { RecipeAdminRepository } from '../repositories/RecipeAdminRepository';
import { Recipe, EditorialStatus } from '../models/types';
import { Table } from '../components/common/Table';
import { StatusBadge } from '../components/common/StatusBadge';
import { Plus, Search, Filter, Copy, Edit, Eye, Send, CheckCircle2, Archive, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AdminSessionRepository } from '../repositories/AdminSessionRepository';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ToastContainer, ToastMessage } from '../components/common/Toast';

export const RecipesPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filtered, setFiltered] = useState<Recipe[]>([]);
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
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const list = await RecipeAdminRepository.list();
      setRecipes(list);
      setFiltered(list);
    } catch (err) {
      addToast('error', 'Erro ao carregar lista de receitas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    let result = recipes;
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(term) || r.slug.includes(term));
    }
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, recipes]);

  const handleDuplicate = async (id: string) => {
    try {
      await RecipeAdminRepository.duplicate(id, user?.email || undefined);
      addToast('success', 'Receita duplicada com sucesso!');
      loadRecipes();
    } catch (err) {
      addToast('error', 'Falha ao duplicar receita');
    }
  };

  const handleStatusChange = async (id: string, status: EditorialStatus) => {
    try {
      await RecipeAdminRepository.setStatus(id, status, user?.email || undefined);
      addToast('success', `Status atualizado para: ${status}`);
      loadRecipes();
    } catch (err) {
      addToast('error', 'Erro ao alterar status da receita');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await RecipeAdminRepository.delete(deleteId);
      addToast('success', 'Receita removida com sucesso');
      setDeleteId(null);
      loadRecipes();
    } catch (err) {
      addToast('error', 'Erro ao excluir receita');
    }
  };

  const columns = [
    {
      header: 'Nome da Receita',
      cell: (r: Recipe) => (
        <div className="flex items-center gap-3">
          <img 
            src={r.media?.imageUrl || 'https://placehold.co/100x100/F8D558/333333?text=Receita'} 
            alt={r.name} 
            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
          />
          <div>
            <a href={`/recipes/edit/${r.id}`} className="font-bold text-[#333333] hover:text-[#F47551]">
              {r.name}
            </a>
            <span className="text-[10px] text-slate-400 block font-mono">/{r.slug}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Classificação',
      cell: (r: Recipe) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-700 block">{r.difficulty} • {r.totalTimeMinutes} min</span>
          <span className="text-[10px] text-slate-500">{r.categories?.slice(0, 2).join(', ') || 'Sem categoria'}</span>
        </div>
      ),
    },
    {
      header: 'Nutrição (porção)',
      cell: (r: Recipe) => (
        <div className="text-[11px] text-slate-600">
          <strong>{r.nutrition?.calories || 0} kcal</strong> | P:{r.nutrition?.proteins || 0}g C:{r.nutrition?.carbs || 0}g F:{r.nutrition?.fats || 0}g
        </div>
      ),
    },
    {
      header: 'Status Editorial',
      cell: (r: Recipe) => <StatusBadge status={r.status} />,
    },
    {
      header: 'Atualização',
      cell: (r: Recipe) => (
        <span className="text-[11px] text-slate-500">
          {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('pt-BR') : '-'}
        </span>
      ),
    },
    {
      header: 'Ações',
      cell: (r: Recipe) => (
        <div className="flex items-center gap-1.5">
          <a
            href={`/recipes/edit/${r.id}`}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-[#F8FEDA] text-slate-700"
            title="Editar"
          >
            <Edit className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => handleDuplicate(r.id)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
            title="Duplicar"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          
          {r.status === 'draft' && (
            <button
              onClick={() => handleStatusChange(r.id, 'inReview')}
              className="p-1.5 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200"
              title="Enviar para Revisão"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}

          {canPublish && r.status === 'inReview' && (
            <button
              onClick={() => handleStatusChange(r.id, 'published')}
              className="p-1.5 rounded-lg bg-[#CDE26D] text-emerald-900 font-bold hover:bg-emerald-300"
              title="Publicar"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setDeleteId(r.id)}
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
          <h2 className="text-xl font-bold text-[#333333]">Gestão de Receitas</h2>
          <p className="text-xs text-slate-500">Cadastre e gerencie o catálogo de receitas do aplicativo</p>
        </div>
        <a
          href="/recipes/new"
          className="px-4 py-2.5 bg-[#F47551] hover:bg-[#d65f3d] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nova Receita
        </a>
      </div>

      {/* Filter and Search controls */}
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
        emptyMessage="Nenhuma receita cadastrada com os filtros aplicados."
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Excluir Receita"
        message="Tem certeza que deseja excluir esta receita? Esta ação é irreversível."
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
