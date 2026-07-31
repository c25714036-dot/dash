import React, { useState, useEffect } from 'react';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { Plus, Edit, Trash2, FolderKanban } from 'lucide-react';

interface ExCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
}

export const ExerciseCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<ExCategory[]>([
    { id: '1', name: 'Hipertrofia Muscular', slug: 'hipertrofia', description: 'Treinos focados em ganho de massa magra', active: true },
    { id: '2', name: 'Perda de Gordura / HIIT', slug: 'hiit-cardio', description: 'Exercícios de alta intensidade metabólica', active: true },
    { id: '3', name: 'Mobilidade & Flexibilidade', slug: 'mobilidade', description: 'Prevenção de lesões e amplitude articular', active: true },
  ]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, type, text }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    active: true,
  });

  const handleOpenModal = (item?: ExCategory) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        slug: item.slug,
        description: item.description,
        active: item.active,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      setCategories(categories.map(c => c.id === editingItem.id ? { ...c, ...formData } : c));
      addToast('success', 'Categoria de exercício atualizada');
    } else {
      const newCat: ExCategory = {
        id: Date.now().toString(),
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        active: formData.active,
      };
      setCategories([...categories, newCat]);
      addToast('success', 'Categoria de exercício criada');
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setCategories(categories.filter(c => c.id !== deleteId));
    addToast('success', 'Categoria excluída');
    setDeleteId(null);
  };

  const columns = [
    {
      header: 'Categoria de Exercício',
      cell: (c: ExCategory) => (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#CCB1F6]/30 text-purple-800 rounded-lg">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#333333] block">{c.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">/{c.slug}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Descrição',
      cell: (c: ExCategory) => <span className="text-xs text-slate-600">{c.description || '-'}</span>,
    },
    {
      header: 'Status',
      cell: (c: ExCategory) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.active ? 'bg-[#CDE26D] text-emerald-900' : 'bg-slate-200 text-slate-600'}`}>
          {c.active ? 'Ativa' : 'Inativa'}
        </span>
      ),
    },
    {
      header: 'Ações',
      cell: (c: ExCategory) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleOpenModal(c)} className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleteId(c.id)} className="p-1.5 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50">
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
          <h2 className="text-xl font-bold text-[#333333]">Categorias de Exercícios</h2>
          <p className="text-xs text-slate-500">Agrupamento temático de treinos e rotinas</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-[#F47551] hover:bg-[#d65f3d] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nova Categoria
        </button>
      </div>

      <Table columns={columns} data={categories} loading={loading} emptyMessage="Nenhuma categoria cadastrada." />

      <Modal
        isOpen={isModalOpen}
        title={editingItem ? 'Editar Categoria' : 'Nova Categoria'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Nome *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Descrição</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2 bg-[#F47551] text-white font-bold text-xs rounded-xl">
              Salvar Categoria
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Excluir Categoria"
        message="Tem certeza que deseja excluir esta categoria?"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
