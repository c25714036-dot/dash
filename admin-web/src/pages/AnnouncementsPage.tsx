import React, { useState, useEffect } from 'react';
import { AnnouncementAdminRepository } from '../repositories/AnnouncementAdminRepository';
import { AppAnnouncement } from '../models/types';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { Plus, Edit, Trash2, Megaphone } from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AppAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AppAnnouncement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, type, text }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'information' as AppAnnouncement['type'],
    audience: 'all' as AppAnnouncement['audience'],
    actionRoute: '',
    active: true,
  });

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const list = await AnnouncementAdminRepository.list();
      setAnnouncements(list);
    } catch (err) {
      addToast('error', 'Erro ao carregar avisos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleOpenModal = (item?: AppAnnouncement) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        message: item.message,
        type: item.type,
        audience: item.audience || 'all',
        actionRoute: item.actionRoute || '',
        active: item.active,
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        message: '',
        type: 'information',
        audience: 'all',
        actionRoute: '',
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const payload: Omit<AppAnnouncement, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        audience: formData.audience,
        startAt: new Date().toISOString(),
        active: formData.active,
        priority: 1,
        actionRoute: formData.actionRoute,
        createdBy: 'admin@vidasaudavel.app',
      };

      if (editingItem) {
        await AnnouncementAdminRepository.update(editingItem.id, payload);
        addToast('success', 'Aviso atualizado com sucesso!');
      } else {
        await AnnouncementAdminRepository.create(payload);
        addToast('success', 'Aviso transmitido com sucesso!');
      }

      setIsModalOpen(false);
      loadAnnouncements();
    } catch (err) {
      addToast('error', 'Erro ao transmitir aviso');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await AnnouncementAdminRepository.delete(deleteId);
      addToast('success', 'Aviso excluído');
      setDeleteId(null);
      loadAnnouncements();
    } catch (err) {
      addToast('error', 'Erro ao excluir');
    }
  };

  const columns = [
    {
      header: 'Aviso Transmitido',
      cell: (a: AppAnnouncement) => (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#F8FEDA] text-[#F47551] rounded-lg">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#333333] block">{a.title}</span>
            <span className="text-[10px] text-slate-500">{a.message}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Tipo de Exibição',
      cell: (a: AppAnnouncement) => <span className="text-xs uppercase font-mono font-bold text-slate-700">{a.type}</span>,
    },
    {
      header: 'Status Transmissão',
      cell: (a: AppAnnouncement) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${a.active ? 'bg-[#CDE26D] text-emerald-900' : 'bg-slate-200 text-slate-600'}`}>
          {a.active ? 'No Ar' : 'Desativado'}
        </span>
      ),
    },
    {
      header: 'Ações',
      cell: (a: AppAnnouncement) => (
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
          <h2 className="text-xl font-bold text-[#333333]">Central de Avisos e Transmissão</h2>
          <p className="text-xs text-slate-500">Banners globais e alertas informativos direcionados aos usuários</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-[#F47551] hover:bg-[#d65f3d] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Criar Novo Aviso
        </button>
      </div>

      <Table columns={columns} data={announcements} loading={loading} emptyMessage="Nenhum aviso transmitido." />

      <Modal
        isOpen={isModalOpen}
        title={editingItem ? 'Editar Aviso' : 'Criar Novo Aviso'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Título do Aviso *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Novo Cardápio Semanal de Inverno Disponível!"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#333333] block mb-1">Mensagem do Comunicado</label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Confira as novas receitas adicionadas ao catálogo..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Tipo de Exibição</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50"
              >
                <option value="information">Informativo</option>
                <option value="warning">Alerta</option>
                <option value="maintenance">Manutenção</option>
                <option value="update">Atualização</option>
                <option value="content">Conteúdo</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Rota de Destino (actionRoute)</label>
              <input
                type="text"
                value={formData.actionRoute}
                onChange={(e) => setFormData({ ...formData, actionRoute: e.target.value })}
                placeholder="Ex: /recipes"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2 bg-[#F47551] text-white font-bold text-xs rounded-xl">
              Transmitir Aviso
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Excluir Aviso"
        message="Tem certeza que deseja excluir este aviso?"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
