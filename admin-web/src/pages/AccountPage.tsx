import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthRepository } from '../repositories/AuthRepository';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { UserCheck, Shield, KeyRound, Lock, LogOut } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [resetSent, setResetSent] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, type, text }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await AuthRepository.resetPassword(user.email);
      setResetSent(true);
      addToast('success', 'E-mail de alteração de senha enviado!');
    } catch (err) {
      addToast('error', 'Erro ao enviar e-mail de recuperação');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(p => p.filter(t => t.id !== id))} />

      <div>
        <h2 className="text-xl font-bold text-[#333333]">Minha Conta Administrativa</h2>
        <p className="text-xs text-slate-500">Detalhes de perfil e credenciais de operador</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-full bg-[#CCB1F6] text-[#333333] flex items-center justify-center font-bold text-2xl uppercase border-2 border-purple-300">
            {user?.displayName?.[0] || user?.email?.[0] || 'A'}
          </div>
          <div>
            <h3 className="text-base font-bold text-[#333333]">{user?.displayName || 'Administrador'}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-[#CDE26D] px-2 py-0.5 rounded-md mt-2">
              <Shield className="w-3 h-3" /> Papel: {user?.role?.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-[#333333]">Segurança e Acesso</h4>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#333333] block">Alterar Senha do Operador</span>
              <span className="text-[10px] text-slate-500">Enviaremos um link de redefinição para o seu e-mail cadastrado.</span>
            </div>
            <button
              onClick={handlePasswordReset}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" /> Enviar Link
            </button>
          </div>

          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-rose-900 block">Encerrar Sessão no Painel</span>
              <span className="text-[10px] text-rose-700">Faz o logout seguro da sua conta no navegador.</span>
            </div>
            <button
              onClick={logout}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
