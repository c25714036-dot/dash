import React, { useState, useEffect } from 'react';
import { MuscleGroupAdminRepository } from '../repositories/MuscleGroupAdminRepository';
import { MuscleGroup } from '../models/types';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { Plus, Edit, Trash2, Activity } from 'lucide-react';

export const MuscleGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<MuscleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MuscleGroup | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, type, text }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const [formData, setFormData] = useState({
    name: '',
    bodyRegion: 'Superior' as MuscleGroup['bodyRegion'],
    order: 1,
    active: true,
  });

  const loadGroups = async () => {
    setLoading(true);
    try {
      const list = await MuscleGroupAdminRepository.list();
      setGroups(list);
    } catch (err) {
      addToast('error', 'Erro ao carregar grupos musculares');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleOpenModal = (item?: MuscleGroup) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        bodyRegion: item.bodyRegion,
        order: item.order || 1,
        active: item.active,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        bodyRegion: 'Superior',
        order: groups.length + 1,
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const payload: Omit<MuscleGroup, 'id'> = {
        name: formData.name,
        bodyRegion: formData.bodyRegion,
        order: Number(formData.order),
        active: formData.active,
      };

      if (editingItem) {
        await MuscleGroupAdminRepository.update(editingItem.id, payload);
        addToast('success', 'Grupo muscular atualizado!');
      } else {
        await MuscleGroupAdminRepository.create(payload);
        addToast('success', 'Grupo cadastrado!');
      }

      setIsModalOpen(false);
      loadGroups();
    } catch (err) {
      addToast('error', 'Erro ao salvar');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await MuscleGroupAdminRepository.delete(deleteId);
      addToast('success', 'Grupo excluído');
      setDeleteId(null);
      loadGroups();
    } catch (err) {
      addToast('error', 'Erro ao excluir');
    }
  };

  const columns = [
    {
      header: 'Grupo Muscular',
      cell: (mg: MuscleGroup) => (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#F8D558]/30 text-amber-900 rounded-lg">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-bold text-[#333333]">{mg.name}</span>
        </div>
      ),
    },
    {
      header: 'Região do Corpo',
      cell: (mg: MuscleGroup) => <span className="text-xs text-slate-700 font-medium">{mg.bodyRegion}</span>,
    },
    {
      header: 'Status',
      cell: (mg: MuscleGroup) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${mg.active ? 'bg-[#CDE26D] text-emerald-900' : 'bg-slate-200 text-slate-600'}`}>
          {mg.active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      header: 'Ações',
      cell: (mg: MuscleGroup) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleOpenModal(mg)} className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleteId(mg.id)} className="p-1.5 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50">
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
          <h2 className="text-xl font-bold text-[#333333]">Grupos Musculares</h2>
          <p className="text-xs text-slate-500">Músculos primários e secundários para tag de exercícios</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-[#F47551] hover:bg-[#d65f3d] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Grupo Muscular
        </button>
      </div>

      <Table columns={columns} data={groups} loading={loading} emptyMessage="Nenhum grupo cadastrado." />

      <Modal
        isOpen={isModalOpen}
        title={editingItem ? 'Editar Grupo Muscular' : 'Novo Grupo Muscular'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Nome do Grupo *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Peitoral, Quadríceps, Bíceps"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Região do Corpo</label>
              <select
                value={formData.bodyRegion}
                onChange={(e) => setFormData({ ...formData, bodyRegion: e.target.value as any })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50"
              >
                <option value="Superior">Superior</option>
                <option value="Inferior">Inferior</option>
                <option value="Core">Core</option>
                <option value="Corpo Inteiro">Corpo Inteiro</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Ordem</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2 bg-[#F47551] text-white font-bold text-xs rounded-xl">
              Salvar Grupo
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Excluir Grupo Muscular"
        message="Tem certeza que deseja excluir este grupo?"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
