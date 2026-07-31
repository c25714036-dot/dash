import React, { useState, useEffect } from 'react';
import { MealPlanTemplateAdminRepository } from '../repositories/MealPlanTemplateAdminRepository';
import { MealPlanTemplate } from '../models/types';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { Plus, Edit, Trash2, FileText, Utensils } from 'lucide-react';

export const MealPlanTemplatesPage: React.FC = () => {
  const [plans, setPlans] = useState<MealPlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MealPlanTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, type, text }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const [formData, setFormData] = useState({
    name: '',
    goal: 'Emagrecimento',
    dietaryPattern: 'Equilibrada',
    mealCount: 4,
    notes: '',
    status: 'published' as MealPlanTemplate['status'],
  });

  const loadPlans = async () => {
    setLoading(true);
    try {
      const list = await MealPlanTemplateAdminRepository.list();
      setPlans(list);
    } catch (err) {
      addToast('error', 'Erro ao carregar planos alimentares');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleOpenModal = (item?: MealPlanTemplate) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        goal: item.goal || 'Emagrecimento',
        dietaryPattern: item.dietaryPattern || 'Equilibrada',
        mealCount: item.mealCount || 4,
        notes: item.notes || '',
        status: item.status || 'published',
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        goal: 'Emagrecimento',
        dietaryPattern: 'Equilibrada',
        mealCount: 4,
        notes: '',
        status: 'published',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const payload: Omit<MealPlanTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        goal: formData.goal,
        dietaryPattern: formData.dietaryPattern,
        mealCount: Number(formData.mealCount),
        notes: formData.notes,
        status: formData.status,
        days: [
          {
            dayLabel: 'Dia Padrão',
            meals: [
              { name: 'Café da Manhã', suggestedTime: '07:30', options: [] },
              { name: 'Almoço', suggestedTime: '12:30', options: [] }
            ]
          }
        ]
      };

      if (editingItem) {
        await MealPlanTemplateAdminRepository.update(editingItem.id, payload);
        addToast('success', 'Plano alimentar atualizado!');
      } else {
        await MealPlanTemplateAdminRepository.create(payload);
        addToast('success', 'Plano alimentar criado!');
      }

      setIsModalOpen(false);
      loadPlans();
    } catch (err) {
      addToast('error', 'Erro ao salvar plano alimentar');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await MealPlanTemplateAdminRepository.delete(deleteId);
      addToast('success', 'Plano alimentar excluído');
      setDeleteId(null);
      loadPlans();
    } catch (err) {
      addToast('error', 'Erro ao excluir');
    }
  };

  const columns = [
    {
      header: 'Plano Alimentar Modelo',
      cell: (p: MealPlanTemplate) => (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#CDE26D]/50 text-emerald-900 rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#333333] block">{p.name}</span>
            <span className="text-[10px] text-slate-400">{p.notes || 'Sem observações'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Objetivo & Padrão',
      cell: (p: MealPlanTemplate) => <span className="text-xs font-semibold text-slate-700">{p.goal} ({p.dietaryPattern})</span>,
    },
    {
      header: 'Refeições por Dia',
      cell: (p: MealPlanTemplate) => (
        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
          <Utensils className="w-3 h-3 text-slate-500" /> {p.mealCount} refeições
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (p: MealPlanTemplate) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'published' ? 'bg-[#CDE26D] text-emerald-900' : 'bg-slate-200 text-slate-600'}`}>
          {p.status === 'published' ? 'Publicado' : 'Rascunho'}
        </span>
      ),
    },
    {
      header: 'Ações',
      cell: (p: MealPlanTemplate) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleOpenModal(p)} className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleteId(p.id)} className="p-1.5 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50">
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
          <h2 className="text-xl font-bold text-[#333333]">Planos Alimentares Guia</h2>
          <p className="text-xs text-slate-500">Sugestões de cardápios e divisão calórica diária</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-[#F47551] hover:bg-[#d65f3d] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Plano Modelo
        </button>
      </div>

      <Table columns={columns} data={plans} loading={loading} emptyMessage="Nenhum plano cadastrado." />

      <Modal
        isOpen={isModalOpen}
        title={editingItem ? 'Editar Plano Alimentar' : 'Novo Plano Alimentar'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Nome do Plano *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Plano Emagrecimento 1800 kcal Low Carb"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Observações do Nutricionista</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Objetivo</label>
              <input
                type="text"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Padrão Alimentar</label>
              <input
                type="text"
                value={formData.dietaryPattern}
                onChange={(e) => setFormData({ ...formData, dietaryPattern: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Qtd Refeições/Dia</label>
              <input
                type="number"
                value={formData.mealCount}
                onChange={(e) => setFormData({ ...formData, mealCount: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2 bg-[#F47551] text-white font-bold text-xs rounded-xl">
              Salvar Plano
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Excluir Plano Alimentar"
        message="Tem certeza que deseja excluir este plano?"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
