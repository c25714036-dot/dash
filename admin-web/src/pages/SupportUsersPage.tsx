import React, { useState } from 'react';
import { Table } from '../components/common/Table';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { Search, UserCheck, ShieldAlert, HeartPulse } from 'lucide-react';

interface UserSupportView {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  goal: string;
  streakDays: number;
  status: 'Ativo' | 'Bloqueado';
}

export const SupportUsersPage: React.FC = () => {
  const [users] = useState<UserSupportView[]>([
    { id: 'usr-101', email: 'maria.silva@email.com', displayName: 'Maria Silva', createdAt: '2026-01-10', goal: 'Emagrecimento', streakDays: 14, status: 'Ativo' },
    { id: 'usr-102', email: 'joao.pereira@email.com', displayName: 'João Pereira', createdAt: '2026-02-01', goal: 'Hipertrofia', streakDays: 5, status: 'Ativo' },
    { id: 'usr-103', email: 'ana.costa@email.com', displayName: 'Ana Costa', createdAt: '2026-02-15', goal: 'Saúde Geral', streakDays: 0, status: 'Bloqueado' },
  ]);
  const [search, setSearch] = useState('');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, type, text }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const filtered = users.filter(u => 
    u.displayName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Usuário (Visão Suporte)',
      cell: (u: UserSupportView) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#CCB1F6] text-[#333333] flex items-center justify-center font-bold text-xs uppercase">
            {u.displayName[0]}
          </div>
          <div>
            <span className="font-bold text-[#333333] block">{u.displayName}</span>
            <span className="text-[10px] text-slate-500">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Objetivo de Saúde',
      cell: (u: UserSupportView) => <span className="text-xs font-semibold text-slate-700">{u.goal}</span>,
    },
    {
      header: 'Ofensiva (Dias)',
      cell: (u: UserSupportView) => (
        <span className="text-xs font-mono font-bold text-amber-900 bg-[#F8D558] px-2 py-0.5 rounded-md">
          {u.streakDays} dias seguidos
        </span>
      ),
    },
    {
      header: 'Status da Conta',
      cell: (u: UserSupportView) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'Ativo' ? 'bg-[#CDE26D] text-emerald-900' : 'bg-rose-100 text-rose-800'}`}>
          {u.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(p => p.filter(t => t.id !== id))} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#333333]">Suporte de Usuários (Visão Não-Sensível)</h2>
          <p className="text-xs text-slate-500">Consulta de progresso e diagnósticos de atendimento ao cliente</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#F47551]"
          />
        </div>
      </div>

      <Table columns={columns} data={filtered} loading={false} emptyMessage="Nenhum usuário localizado." />
    </div>
  );
};
