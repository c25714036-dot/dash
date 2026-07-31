import React, { useState, useEffect } from 'react';
import { AchievementAdminRepository } from '../repositories/AchievementAdminRepository';
import { Achievement } from '../models/types';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { Plus, Edit, Trash2, Award } from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Achievement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, type, text }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Streak' as Achievement['type'],
    criteria: '7_days_streak',
    order: 1,
    active: true,
  });

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const list = await AchievementAdminRepository.list();
      setAchievements(list);
    } catch (err) {
      addToast('error', 'Erro ao carregar conquistas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const handleOpenModal = (item?: Achievement) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description,
        type: item.type,
        criteria: item.criteria,
        order: item.order || 1,
        active: item.active,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        description: '',
        type: 'Streak',
        criteria: '7_days_streak',
        order: achievements.length + 1,
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const payload: Omit<Achievement, 'id'> = {
        title: formData.title,
        description: formData.description,
        iconName: 'award_default',
        type: formData.type,
        criteria: formData.criteria,
        order: Number(formData.order),
        active: formData.active,
      };

      if (editingItem) {
        await AchievementAdminRepository.update(editingItem.id, payload);
        addToast('success', 'Conquista atualizada!');
      } else {
        await AchievementAdminRepository.create(payload);
        addToast('success', 'Conquista cadastrada com sucesso!');
      }

      setIsModalOpen(false);
      loadAchievements();
    } catch (err) {
      addToast('error', 'Erro ao salvar conquista');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await AchievementAdminRepository.delete(deleteId);
      addToast('success', 'Conquista excluída');
      setDeleteId(null);
      loadAchievements();
    } catch (err) {
      addToast('error', 'Erro ao excluir');
    }
  };

  const columns = [
    {
      header: 'Conquista',
      cell: (a: Achievement) => (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#F8D558]/30 text-amber-800 rounded-lg">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#333333] block">{a.title}</span>
            <span className="text-[10px] text-slate-400">{a.description}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Tipo',
      cell: (a: Achievement) => <span className="text-xs text-slate-700 font-medium">{a.type}</span>,
    },
    {
      header: 'Critério',
      cell: (a: Achievement) => (
        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded-md">
          {a.criteria}
        </span>
      ),
    },
    {
      header: 'Ações',
      cell: (a: Achievement) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleOpenModal(a)} className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleteId(a.id)} className="p-1.5 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(p => p.filter(t => t.id !== id))} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#333333]">Sistema de Conquistas (Gamificação)</h2>
          <p className="text-xs text-slate-500">Badges, pontos de XP e metas engajadoras para os usuários</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-[#F47551] hover:bg-[#d65f3d] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nova Conquista
        </button>
      </div>

      <Table columns={columns} data={achievements} loading={loading} emptyMessage="Nenhuma conquista cadastrada." />

      <Modal
        isOpen={isModalOpen}
        title={editingItem ? 'Editar Conquista' : 'Nova Conquista'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Título da Conquista *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Fogo Sagrado (7 Dias Seguidos)"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Descrição do Desafio</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Complete pelo menos 1 treino ou receita por 7 dias seguidos."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Tipo de Conquista</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50"
              >
                <option value="Streak">Ofensiva (Streak)</option>
                <option value="Treinos">Treinos</option>
                <option value="Receitas">Receitas</option>
                <option value="Hidratação">Hidratação</option>
                <option value="Geral">Geral</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Critério (Chave)</label>
              <input
                type="text"
                value={formData.criteria}
                onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2 bg-[#F47551] text-white font-bold text-xs rounded-xl">
              Salvar Conquista
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Excluir Conquista"
        message="Tem certeza que deseja excluir esta conquista?"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
