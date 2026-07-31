import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../validation/schemas';
import { AuthRepository } from '../repositories/AuthRepository';
import { HeartPulse, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setLoading(true);
    try {
      const user = await AuthRepository.login(data.email, data.password);
      if (!user.role) {
        setError('Acesso negado. A conta informada não possui privilégios administrativos no projeto vital-dd47f.');
        await AuthRepository.logout();
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      setError('E-mail ou senha incorretos, ou usuário não possui acesso ao painel.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!email) {
      setError('Preencha o campo de e-mail para solicitar recuperação.');
      return;
    }
    try {
      await AuthRepository.resetPassword(email);
      setResetSent(true);
      setError(null);
    } catch (err) {
      setError('Não foi possível enviar e-mail de redefinição. Verifique o endereço digitado.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-[#121212] rounded-sm shadow-2xl border border-white/10 max-w-md w-full p-8">
        <div className="mb-8 border-l-2 border-[#E0FF00] pl-4">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#E0FF00] mb-1">
            SYSTEM DIRECTIVE // ACCESS
          </p>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#F5F5F5]">Vida Saudável</h1>
          <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest mt-1">
            Painel Administrativo v2.4
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-950/60 border border-rose-800 rounded-sm text-rose-300 text-xs flex items-start gap-2.5 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {resetSent && (
          <div className="mb-6 p-3.5 bg-[#E0FF00]/10 border border-[#E0FF00] rounded-sm text-[#E0FF00] text-xs font-mono uppercase font-bold tracking-wider">
            Instruções de redefinição de senha enviadas para o e-mail informado.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-300 mb-1">E-mail Administrativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                {...register('email')}
                placeholder="admin@vidasaudavel.app"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#181818] rounded-sm border border-neutral-700 focus:outline-none focus:border-[#E0FF00] text-[#F5F5F5] placeholder:text-neutral-600 font-mono"
              />
            </div>
            {errors.email && <span className="text-[11px] text-rose-400 font-mono mt-1 block">{errors.email.message}</span>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-300">Senha</label>
              <button
                type="button"
                onClick={() => {
                  const el = document.querySelector('input[type="email"]') as HTMLInputElement;
                  handleResetPassword(el?.value || '');
                }}
                className="text-[10px] font-bold uppercase tracking-wider text-[#E0FF00] hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#181818] rounded-sm border border-neutral-700 focus:outline-none focus:border-[#E0FF00] text-[#F5F5F5] font-mono"
              />
            </div>
            {errors.password && <span className="text-[11px] text-rose-400 font-mono mt-1 block">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#E0FF00] hover:bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-sm transition-colors flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Entrar no Painel
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-[9px] font-mono text-neutral-500 uppercase tracking-widest">OU AMBIENTE DE PREVIEW</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <div className="bg-[#181818] border border-[#E0FF00]/20 p-4 rounded-sm">
            <p className="text-[10px] font-mono text-neutral-400 mb-3 leading-relaxed">
              O Firebase Auth exige ativação manual do provedor de <strong className="text-white">E-mail/Senha</strong> no console. Escolha um dos perfis abaixo para acessar instantaneamente com papel <strong className="text-[#E0FF00]">superAdmin</strong>:
            </p>
            
            <div className="space-y-3">
              {/* Carlos Cruz option */}
              <div className="bg-[#121212] p-2.5 rounded border border-white/5 font-mono text-[10px] text-neutral-300">
                <div className="font-bold text-white mb-1">👑 Carlos Cruz (Super Admin)</div>
                <div><span className="text-[#E0FF00]">E-mail:</span> carlos5236cruz@gmail.com</div>
                <div><span className="text-[#E0FF00]">Senha:</span> Proview@2701</div>
                <button
                  type="button"
                  onClick={async () => {
                    setError(null);
                    setLoading(true);
                    try {
                      await AuthRepository.login('carlos5236cruz@gmail.com', 'Proview@2701');
                      window.location.href = '/';
                    } catch (err: any) {
                      setError('Erro ao iniciar sessão como Carlos Cruz.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full mt-2 py-1.5 px-2 bg-[#E0FF00]/10 hover:bg-[#E0FF00]/20 text-[#E0FF00] font-bold uppercase text-[9px] tracking-widest rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Acessar como Carlos
                </button>
              </div>

              {/* General Admin option */}
              <div className="bg-[#121212] p-2.5 rounded border border-white/5 font-mono text-[10px] text-neutral-300">
                <div className="font-bold text-white mb-1">🛠️ Admin Geral</div>
                <div><span className="text-[#E0FF00]">E-mail:</span> admin@vidasaudavel.app</div>
                <div><span className="text-[#E0FF00]">Senha:</span> Proview@2701</div>
                <button
                  type="button"
                  onClick={async () => {
                    setError(null);
                    setLoading(true);
                    try {
                      await AuthRepository.login('admin@vidasaudavel.app', 'Proview@2701');
                      window.location.href = '/';
                    } catch (err: any) {
                      setError('Erro ao iniciar sessão como Admin.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full mt-2 py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold uppercase text-[9px] tracking-widest rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Acessar como Admin Geral
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
            PROJETO FIREBASE: <strong className="text-[#E0FF00]">vital-dd47f</strong> (PLANO SPARK)
          </p>
        </div>
      </div>
    </div>
  );
};
