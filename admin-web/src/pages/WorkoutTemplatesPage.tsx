import React, { useState, useEffect } from 'react';
import { WorkoutTemplateAdminRepository } from '../repositories/WorkoutTemplateAdminRepository';
import { WorkoutTemplate } from '../models/types';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { Plus, Edit, Trash2, Dumbbell, Calendar } from 'lucide-react';

export const WorkoutTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkoutTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, type, text }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goals: ['Hipertrofia'],
    level: 'Iniciante' as WorkoutTemplate['level'],
    daysPerWeek: 3,
    durationWeeks: 8,
    location: 'Academia' as WorkoutTemplate['location'],
    lowImpactOnly: false,
    status: 'published' as WorkoutTemplate['status'],
  });

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const list = await WorkoutTemplateAdminRepository.list();
      setTemplates(list);
    } catch (err) {
      addToast('error', 'Erro ao carregar modelos de treino');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleOpenModal = (item?: WorkoutTemplate) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        goals: item.goals || ['Hipertrofia'],
        level: item.level || 'Iniciante',
        daysPerWeek: item.daysPerWeek || 3,
        durationWeeks: item.durationWeeks || 8,
        location: item.location || 'Academia',
        lowImpactOnly: item.lowImpactOnly || false,
        status: item.status || 'published',
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        goals: ['Hipertrofia'],
        level: 'Iniciante',
        daysPerWeek: 3,
        durationWeeks: 8,
        location: 'Academia',
        lowImpactOnly: false,
        status: 'published',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const payload: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        description: formData.description,
        goals: formData.goals,
        level: formData.level,
        daysPerWeek: Number(formData.daysPerWeek),
        durationWeeks: Number(formData.durationWeeks),
        location: formData.location,
        requiredEquipment: ['Halteres', 'Banco'],
        lowImpactOnly: formData.lowImpactOnly,
        status: formData.status,
        days: [
          {
            dayName: 'Dia 1 - Treino A',
            sections: [
              {
                title: 'Bloco Principal',
                exercises: []
              }
            ]
          }
        ]
      };

      if (editingItem) {
        await WorkoutTemplateAdminRepository.update(editingItem.id, payload);
        addToast('success', 'Ficha modelo atualizada!');
      } else {
        await WorkoutTemplateAdminRepository.create(payload);
        addToast('success', 'Ficha modelo criada com sucesso!');
      }

      setIsModalOpen(false);
      loadTemplates();
    } catch (err) {
      addToast('error', 'Erro ao salvar ficha modelo');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await WorkoutTemplateAdminRepository.delete(deleteId);
      addToast('success', 'Ficha modelo excluída');
      setDeleteId(null);
      loadTemplates();
    } catch (err) {
      addToast('error', 'Erro ao excluir');
    }
  };

  const columns = [
    {
      header: 'Ficha Modelo de Treino',
      cell: (wt: WorkoutTemplate) => (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 text-purple-800 rounded-lg">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#333333] block">{wt.name}</span>
            <span className="text-[10px] text-slate-400">{wt.description}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Objetivo & Nível',
      cell: (wt: WorkoutTemplate) => <span className="text-xs font-semibold text-slate-700">{(wt.goals || []).join(', ')} ({wt.level})</span>,
    },
    {
      header: 'Frequência',
      cell: (wt: WorkoutTemplate) => (
        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
          <Calendar className="w-3 h-3 text-slate-500" /> {wt.daysPerWeek}x / sem ({wt.durationWeeks} semanas)
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (wt: WorkoutTemplate) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${wt.status === 'published' ? 'bg-[#CDE26D] text-emerald-900' : 'bg-slate-200 text-slate-600'}`}>
          {wt.status === 'published' ? 'Publicado' : 'Rascunho'}
        </span>
      ),
    },
    {
      header: 'Ações',
      cell: (wt: WorkoutTemplate) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleOpenModal(wt)} className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleteId(wt.id)} className="p-1.5 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50">
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
          <h2 className="text-xl font-bold text-[#333333]">Fichas de Treino Guia (Templates)</h2>
          <p className="text-xs text-slate-500">Modelos pré-estruturados por objetivo, nível e frequência semanal</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-[#F47551] hover:bg-[#d65f3d] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nova Ficha Modelo
        </button>
      </div>

      <Table columns={columns} data={templates} loading={loading} emptyMessage="Nenhum modelo cadastrado." />

      <Modal
        isOpen={isModalOpen}
        title={editingItem ? 'Editar Ficha Modelo' : 'Nova Ficha Modelo'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Nome do Modelo *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Ficha ABC - Hipertrofia Intermediário"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Descrição orientadora</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Nível</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50"
              >
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Dias por Semana</label>
              <input
                type="number"
                value={formData.daysPerWeek}
                onChange={(e) => setFormData({ ...formData, daysPerWeek: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Duração (Semanas)</label>
              <input
                type="number"
                value={formData.durationWeeks}
                onChange={(e) => setFormData({ ...formData, durationWeeks: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2 bg-[#F47551] text-white font-bold text-xs rounded-xl">
              Salvar Modelo
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Excluir Modelo"
        message="Tem certeza que deseja excluir esta ficha modelo?"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
