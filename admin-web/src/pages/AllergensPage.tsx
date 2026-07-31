import React, { useState, useEffect } from 'react';
import { AllergenAdminRepository } from '../repositories/AllergenAdminRepository';
import { Allergen } from '../models/types';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { Plus, Edit, Trash2, ShieldAlert } from 'lucide-react';

export const AllergensPage: React.FC = () => {
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Allergen | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, type, text }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    active: true,
  });

  const loadAllergens = async () => {
    setLoading(true);
    try {
      const list = await AllergenAdminRepository.list();
      setAllergens(list);
    } catch (err) {
      addToast('error', 'Erro ao carregar alergênicos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllergens();
  }, []);

  const handleOpenModal = (item?: Allergen) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        code: item.code,
        description: item.description,
        active: item.active,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const payload = {
        name: formData.name,
        code: formData.code || formData.name.toLowerCase().replace(/\s+/g, '_'),
        description: formData.description,
        active: formData.active,
      };

      if (editingItem) {
        await AllergenAdminRepository.update(editingItem.id, payload);
        addToast('success', 'Alergênico atualizado!');
      } else {
        await AllergenAdminRepository.create(payload);
        addToast('success', 'Alergênico cadastrado com sucesso!');
      }

      setIsModalOpen(false);
      loadAllergens();
    } catch (err) {
      addToast('error', 'Erro ao salvar alergênico');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await AllergenAdminRepository.delete(deleteId);
      addToast('success', 'Alergênico excluído');
      setDeleteId(null);
      loadAllergens();
    } catch (err) {
      addToast('error', 'Erro ao excluir');
    }
  };

  const columns = [
    {
      header: 'Alergênico',
      cell: (a: Allergen) => (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#333333] block">{a.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">{a.code}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Descrição de Alerta',
      cell: (a: Allergen) => <span className="text-xs text-slate-500">{a.description || '-'}</span>,
    },
    {
      header: 'Status',
      cell: (a: Allergen) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${a.active ? 'bg-[#CDE26D] text-emerald-900' : 'bg-slate-200 text-slate-600'}`}>
          {a.active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      header: 'Ações',
      cell: (a: Allergen) => (
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
          <h2 className="text-xl font-bold text-[#333333]">Cadastro de Alergênicos</h2>
          <p className="text-xs text-slate-500">Alertas de segurança alimentar exibidos nas receitas do aplicativo</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-[#F47551] hover:bg-[#d65f3d] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Alergênico
        </button>
      </div>

      <Table columns={columns} data={allergens} loading={loading} emptyMessage="Nenhum alergênico cadastrado." />

      <Modal
        isOpen={isModalOpen}
        title={editingItem ? 'Editar Alergênico' : 'Novo Alergênico'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Nome do Alergênico *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Leite e Derivados, Glúten, Amendoim"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Código Identificador</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="ex: lactose, gluten, amendoim"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Descrição / Aviso de Saúde</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Aviso exibido aos usuários com restrições severas."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2 bg-[#F47551] text-white font-bold text-xs rounded-xl">
              Salvar Alergênico
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Excluir Alergênico"
        message="Tem certeza que deseja excluir este alerta?"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
