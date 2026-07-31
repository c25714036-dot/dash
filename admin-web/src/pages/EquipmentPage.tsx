import React, { useState, useEffect } from 'react';
import { EquipmentAdminRepository } from '../repositories/EquipmentAdminRepository';
import { Equipment } from '../models/types';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { Plus, Edit, Trash2, Wrench } from 'lucide-react';

export const EquipmentPage: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, type, text }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const [formData, setFormData] = useState({
    name: '',
    category: 'Halteres/Anilhas' as Equipment['category'],
    location: 'Academia' as Equipment['location'],
    active: true,
  });

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const list = await EquipmentAdminRepository.list();
      setEquipmentList(list);
    } catch (err) {
      addToast('error', 'Erro ao carregar equipamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const handleOpenModal = (item?: Equipment) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        location: item.location || 'Academia',
        active: item.active,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'Halteres/Anilhas',
        location: 'Academia',
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const payload: Omit<Equipment, 'id'> = {
        name: formData.name,
        category: formData.category,
        location: formData.location,
        active: formData.active,
      };

      if (editingItem) {
        await EquipmentAdminRepository.update(editingItem.id, payload);
        addToast('success', 'Equipamento atualizado!');
      } else {
        await EquipmentAdminRepository.create(payload);
        addToast('success', 'Equipamento cadastrado!');
      }

      setIsModalOpen(false);
      loadEquipment();
    } catch (err) {
      addToast('error', 'Erro ao salvar equipamento');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await EquipmentAdminRepository.delete(deleteId);
      addToast('success', 'Equipamento excluído');
      setDeleteId(null);
      loadEquipment();
    } catch (err) {
      addToast('error', 'Erro ao excluir');
    }
  };

  const columns = [
    {
      header: 'Equipamento',
      cell: (eq: Equipment) => (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#333333] block">{eq.name}</span>
            <span className="text-[10px] text-slate-400">{eq.location}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Categoria',
      cell: (eq: Equipment) => <span className="text-xs text-slate-600 font-medium">{eq.category}</span>,
    },
    {
      header: 'Status',
      cell: (eq: Equipment) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${eq.active ? 'bg-[#CDE26D] text-emerald-900' : 'bg-slate-200 text-slate-600'}`}>
          {eq.active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      header: 'Ações',
      cell: (eq: Equipment) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleOpenModal(eq)} className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleteId(eq.id)} className="p-1.5 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50">
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
          <h2 className="text-xl font-bold text-[#333333]">Equipamentos de Treino</h2>
          <p className="text-xs text-slate-500">Acessórios e máquinas para filtro e prescrição</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-[#F47551] hover:bg-[#d65f3d] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Equipamento
        </button>
      </div>

      <Table columns={columns} data={equipmentList} loading={loading} emptyMessage="Nenhum equipamento cadastrado." />

      <Modal
        isOpen={isModalOpen}
        title={editingItem ? 'Editar Equipamento' : 'Novo Equipamento'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Nome *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Halteres, Barra Olímpica, Máquina Smith"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50"
              >
                <option value="Halteres/Anilhas">Halteres/Anilhas</option>
                <option value="Máquinas">Máquinas</option>
                <option value="Acessórios">Acessórios</option>
                <option value="Peso Corporal">Peso Corporal</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Localização</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value as any })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50"
              >
                <option value="Academia">Academia</option>
                <option value="Em Casa">Em Casa</option>
                <option value="Ambos">Ambos</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2 bg-[#F47551] text-white font-bold text-xs rounded-xl">
              Salvar Equipamento
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Excluir Equipamento"
        message="Tem certeza que deseja excluir este equipamento?"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
