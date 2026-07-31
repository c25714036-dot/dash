import React, { useState, useEffect } from 'react';
import { OnboardingAdminRepository } from '../repositories/OnboardingAdminRepository';
import { OnboardingQuestion } from '../models/types';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { Plus, Edit, Trash2, HelpCircle } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OnboardingQuestion | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, type, text }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const [formData, setFormData] = useState({
    questionKey: '',
    title: '',
    description: '',
    order: 1,
    isRequired: true,
    active: true,
  });

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const list = await OnboardingAdminRepository.list();
      setQuestions(list);
    } catch (err) {
      addToast('error', 'Erro ao carregar perguntas de onboarding');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleOpenModal = (item?: OnboardingQuestion) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        questionKey: item.questionKey,
        title: item.title,
        description: item.description || '',
        order: item.order || 1,
        isRequired: item.isRequired,
        active: item.active,
      });
    } else {
      setEditingItem(null);
      setFormData({
        questionKey: `q_${Date.now()}`,
        title: '',
        description: '',
        order: questions.length + 1,
        isRequired: true,
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const payload: Omit<OnboardingQuestion, 'id'> = {
        questionKey: formData.questionKey || `q_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        options: [
          { label: 'Opção 1', value: 'opt_1' },
          { label: 'Opção 2', value: 'opt_2' }
        ],
        order: Number(formData.order),
        isRequired: formData.isRequired,
        active: formData.active,
      };

      if (editingItem) {
        await OnboardingAdminRepository.update(editingItem.id, payload);
        addToast('success', 'Pergunta atualizada!');
      } else {
        await OnboardingAdminRepository.create(payload);
        addToast('success', 'Pergunta de onboarding criada!');
      }

      setIsModalOpen(false);
      loadQuestions();
    } catch (err) {
      addToast('error', 'Erro ao salvar');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await OnboardingAdminRepository.delete(deleteId);
      addToast('success', 'Pergunta excluída');
      setDeleteId(null);
      loadQuestions();
    } catch (err) {
      addToast('error', 'Erro ao excluir');
    }
  };

  const columns = [
    {
      header: 'Ordem',
      cell: (q: OnboardingQuestion) => <span className="font-mono font-bold text-slate-700">#{q.order}</span>,
    },
    {
      header: 'Pergunta do Onboarding',
      cell: (q: OnboardingQuestion) => (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#F8FEDA] text-[#F47551] rounded-lg">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#333333] block">{q.title}</span>
            <span className="text-[10px] text-slate-400">{q.description || q.questionKey}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (q: OnboardingQuestion) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${q.active ? 'bg-[#CDE26D] text-emerald-900' : 'bg-slate-200 text-slate-600'}`}>
          {q.active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      header: 'Ações',
      cell: (q: OnboardingQuestion) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleOpenModal(q)} className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleteId(q.id)} className="p-1.5 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50">
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
          <h2 className="text-xl font-bold text-[#333333]">Perguntas de Onboarding</h2>
          <p className="text-xs text-slate-500">Fluxo inicial de coleta de objetivos e preferências do usuário</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-[#F47551] hover:bg-[#d65f3d] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nova Pergunta
        </button>
      </div>

      <Table columns={columns} data={questions} loading={loading} emptyMessage="Nenhuma pergunta cadastrada." />

      <Modal
        isOpen={isModalOpen}
        title={editingItem ? 'Editar Pergunta' : 'Nova Pergunta de Onboarding'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Título da Pergunta *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Qual o seu objetivo principal de saúde?"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Chave Única (questionKey)</label>
              <input
                type="text"
                value={formData.questionKey}
                onChange={(e) => setFormData({ ...formData, questionKey: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Ordem da Pergunta</label>
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
              Salvar Pergunta
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Excluir Pergunta"
        message="Tem certeza que deseja excluir esta pergunta do fluxo?"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
