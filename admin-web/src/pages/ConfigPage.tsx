import React, { useState, useEffect } from 'react';
import { AppConfigAdminRepository } from '../repositories/AppConfigAdminRepository';
import { AppConfig } from '../models/types';
import { ToastContainer, ToastMessage } from '../components/common/Toast';
import { Settings, Save, Sliders } from 'lucide-react';

export const ConfigPage: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, type, text }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    async function loadConfig() {
      setLoading(true);
      try {
        const conf = await AppConfigAdminRepository.getPublicConfig();
        setConfig(conf);
      } catch (err) {
        addToast('error', 'Erro ao carregar configurações globais');
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setSaving(true);
    try {
      await AppConfigAdminRepository.updatePublicConfig(config);
      addToast('success', 'Configurações do aplicativo salvas com sucesso!');
    } catch (err) {
      addToast('error', 'Falha ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Carregando parâmetros globais...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(p => p.filter(t => t.id !== id))} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#333333]">Parâmetros Globais e Feature Flags</h2>
          <p className="text-xs text-slate-500">Controle de versão do aplicativo móvel, links legais e módulos ativos</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#333333] border-b pb-2 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#F47551]" /> 1. Informações de Versão & Suporte
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Nome do Aplicativo</label>
              <input
                type="text"
                value={config.appName}
                onChange={(e) => setConfig({ ...config, appName: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">Versão Mínima Exigida</label>
              <input
                type="text"
                value={config.minimumSupportedVersion}
                onChange={(e) => setConfig({ ...config, minimumSupportedVersion: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">E-mail de Suporte</label>
              <input
                type="email"
                value={config.supportEmail}
                onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">URL dos Termos de Uso</label>
              <input
                type="text"
                value={config.termsUrl}
                onChange={(e) => setConfig({ ...config, termsUrl: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#333333] block mb-1">URL da Política de Privacidade</label>
              <input
                type="text"
                value={config.privacyUrl}
                onChange={(e) => setConfig({ ...config, privacyUrl: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#333333] border-b pb-2 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#F47551]" /> 2. Módulos Ativos no App (Feature Flags)
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-[#333333] block">Módulo de Receitas</span>
                <span className="text-[10px] text-slate-500">Exibe a aba de culinária e catálogo saudável no app.</span>
              </div>
              <input
                type="checkbox"
                checked={config.featureFlags.recipes}
                onChange={(e) => setConfig({
                  ...config,
                  featureFlags: { ...config.featureFlags, recipes: e.target.checked }
                })}
                className="w-4 h-4 text-[#F47551] rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-[#333333] block">Módulo de Exercícios</span>
                <span className="text-[10px] text-slate-500">Exibe rotinas de exercícios e fichas.</span>
              </div>
              <input
                type="checkbox"
                checked={config.featureFlags.exercises}
                onChange={(e) => setConfig({
                  ...config,
                  featureFlags: { ...config.featureFlags, exercises: e.target.checked }
                })}
                className="w-4 h-4 text-[#F47551] rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-[#333333] block">Módulo de Planos Alimentares</span>
                <span className="text-[10px] text-slate-500">Exibe modelos organizados por calorias e metas.</span>
              </div>
              <input
                type="checkbox"
                checked={config.featureFlags.mealPlans}
                onChange={(e) => setConfig({
                  ...config,
                  featureFlags: { ...config.featureFlags, mealPlans: e.target.checked }
                })}
                className="w-4 h-4 text-[#F47551] rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-200">
              <div>
                <span className="text-xs font-bold text-rose-900 block">Modo de Manutenção Geral</span>
                <span className="text-[10px] text-rose-700">Bloqueia o acesso de usuários comuns e exibe tela de manutenção.</span>
              </div>
              <input
                type="checkbox"
                checked={config.maintenanceMode}
                onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#F47551] hover:bg-[#d65f3d] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
};
