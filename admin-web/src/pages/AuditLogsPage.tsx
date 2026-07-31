import React, { useState, useEffect } from 'react';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { AdminAuditLog } from '../models/types';
import { Table } from '../components/common/Table';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { History, Shield, User, Clock } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, type, text }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const list = await AuditLogRepository.listLogs();
        setLogs(list);
      } catch (err) {
        addToast('error', 'Erro ao carregar logs de auditoria');
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const columns = [
    {
      header: 'Data / Hora',
      cell: (l: AdminAuditLog) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{l.createdAt ? new Date(l.createdAt).toLocaleString('pt-BR') : '-'}</span>
        </div>
      ),
    },
    {
      header: 'Operador Admin',
      cell: (l: AdminAuditLog) => (
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#333333]">
          <User className="w-3.5 h-3.5 text-[#F47551]" />
          <span>{l.actorEmail || 'admin@vidasaudavel.app'} ({l.actorRole})</span>
        </div>
      ),
    },
    {
      header: 'Ação Realizada',
      cell: (l: AdminAuditLog) => (
        <span className="text-xs font-mono font-bold uppercase text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
          {l.action}
        </span>
      ),
    },
    {
      header: 'Recurso / ID',
      cell: (l: AdminAuditLog) => (
        <span className="text-xs text-slate-700">
          {l.resourceType} ({l.resourceId})
        </span>
      ),
    },
    {
      header: 'Resumo',
      cell: (l: AdminAuditLog) => <span className="text-xs text-slate-500 italic">{l.summary || 'Operação de rotina'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(p => p.filter(t => t.id !== id))} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#333333]">Rastro de Auditoria e Governança</h2>
          <p className="text-xs text-slate-500">Histórico completo de alterações, exclusões e edições no banco de dados</p>
        </div>
      </div>

      <Table columns={columns} data={logs} loading={loading} emptyMessage="Nenhum log gravado até o momento." />
    </div>
  );
};
